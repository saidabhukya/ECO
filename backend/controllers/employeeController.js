const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const SalaryStructure = require('../models/SalaryStructure');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/LeaveType');
const { logAction } = require('../middleware/auditLogger');

/**
 * @desc    Get all employees with pagination, search & filters
 * @route   GET /api/employees
 * @access  Private (ADMIN, HR, MANAGER, EMPLOYEE)
 */
const getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, department, status, employmentType, sort = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Don't show archived unless specifically requested by admin
    if (req.query.includeArchived !== 'true') {
      query.isArchived = { $ne: true };
    }

    // Role-based scoping: If Manager, only show team or all? Prompt says Manager views assigned team members
    if (req.user.role === 'MANAGER' && req.query.teamOnly === 'true') {
      query.reportingManager = req.userEmployee?._id;
    }

    if (department) {
      query.department = department;
    }

    if (status) {
      query.employmentStatus = status;
    }

    if (employmentType) {
      query.employmentType = employmentType;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .populate('designation', 'title level')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('shift', 'name startTime endTime')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Mask sensitive bank details unless role is ADMIN or HR
    const sanitizedEmployees = employees.map(emp => {
      const obj = emp.toObject();
      if (!['ADMIN', 'HR'].includes(req.user.role)) {
        delete obj.bankDetails;
      }
      return obj;
    });

    res.json({
      success: true,
      data: sanitizedEmployees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee by ID
 * @route   GET /api/employees/:id
 * @access  Private (ADMIN, HR, or Self/Manager)
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('designation')
      .populate('reportingManager', 'firstName lastName employeeId email profilePhoto')
      .populate('shift')
      .populate('salaryStructure')
      .populate('user', 'email role isActive lastLogin');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const isSelf = req.userEmployee?._id?.toString() === employee._id.toString();
    const isManager = req.user.role === 'MANAGER' && employee.reportingManager?.toString() === req.userEmployee?._id?.toString();
    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);

    if (!isSelf && !isManager && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this employee profile.'
      });
    }

    const empObj = employee.toObject();

    // Mask sensitive bank details if not privileged or not self
    if (!isPrivileged && !isSelf) {
      delete empObj.bankDetails;
      delete empObj.salaryStructure;
    }

    res.json({
      success: true,
      data: empObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new employee
 * @route   POST /api/employees
 * @access  Private (ADMIN, HR)
 */
const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      contactNumber,
      dateOfBirth,
      gender,
      department,
      designation,
      reportingManager,
      joiningDate,
      employmentType,
      employmentStatus,
      workLocation,
      shift,
      address,
      emergencyContact,
      bankDetails,
      createUserAccount = true,
      userRole = 'EMPLOYEE',
      initialPassword
    } = req.body;

    // Check duplicate employee ID
    const existingId = await Employee.findOne({ employeeId: employeeId.toUpperCase() });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${employeeId}' is already in use.`
      });
    }

    // Check duplicate email
    const existingEmail = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email address '${email}' is already registered.`
      });
    }

    const employee = await Employee.create({
      employeeId: employeeId.toUpperCase(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      contactNumber,
      dateOfBirth,
      gender,
      department,
      designation: designation || undefined,
      reportingManager: reportingManager || undefined,
      joiningDate: joiningDate || Date.now(),
      employmentType: employmentType || 'Full-time',
      employmentStatus: employmentStatus || 'Active',
      workLocation: workLocation || 'Headquarters',
      shift: shift || undefined,
      address,
      emergencyContact,
      bankDetails
    });

    // Optionally create user account for this employee
    if (createUserAccount) {
      const defaultPassword = initialPassword || 'EcoTrack@2026';
      const user = await User.create({
        email: email.toLowerCase(),
        password: defaultPassword,
        role: userRole || 'EMPLOYEE',
        employeeId: employee.employeeId,
        employeeRef: employee._id
      });
      employee.user = user._id;
      await employee.save();
    }

    // Automatically allocate default leave balances for current year
    const leaveTypes = await LeaveType.find({ isActive: true });
    const currentYear = new Date().getFullYear();
    for (const lt of leaveTypes) {
      await LeaveBalance.create({
        employee: employee._id,
        leaveType: lt._id,
        year: currentYear,
        allocated: lt.daysPerYear || 12,
        used: 0,
        pending: 0,
        history: [{
          action: 'ALLOCATED',
          days: lt.daysPerYear || 12,
          reason: 'Initial leave allocation on employee onboarding',
          performedBy: req.user._id,
          date: new Date()
        }]
      });
    }

    await logAction({
      req,
      action: 'EMPLOYEE_CREATE',
      module: 'Employee',
      targetId: employee._id,
      description: `Created new employee: ${employee.fullName} (${employee.employeeId})`
    });

    const populated = await Employee.findById(employee._id)
      .populate('department')
      .populate('designation')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('shift');

    res.status(201).json({
      success: true,
      message: 'Employee successfully created',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 * @access  Private (ADMIN, HR, or limited self update)
 */
const updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const isSelf = req.userEmployee?._id?.toString() === employee._id.toString();
    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);

    if (!isPrivileged && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot edit this employee profile.'
      });
    }

    // If employee updating self, allow only contact info and address
    if (isSelf && !isPrivileged) {
      const allowedUpdates = ['contactNumber', 'address', 'emergencyContact'];
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          employee[field] = req.body[field];
        }
      });
      await employee.save();

      await logAction({
        req,
        action: 'EMPLOYEE_SELF_UPDATE',
        module: 'Employee',
        targetId: employee._id,
        description: `Employee ${employee.fullName} updated personal contact details`
      });

      return res.json({
        success: true,
        message: 'Profile contact details successfully updated',
        data: employee
      });
    }

    // Privileged update: validate employee ID and email uniqueness if changing
    if (req.body.employeeId && req.body.employeeId.toUpperCase() !== employee.employeeId) {
      const existing = await Employee.findOne({ employeeId: req.body.employeeId.toUpperCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Employee ID '${req.body.employeeId}' already in use.`
        });
      }
    }

    if (req.body.email && req.body.email.toLowerCase() !== employee.email) {
      const existingEmail = await Employee.findOne({ email: req.body.email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: `Email '${req.body.email}' already in use.`
        });
      }
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('department')
      .populate('designation')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('shift');

    await logAction({
      req,
      action: 'EMPLOYEE_UPDATE',
      module: 'Employee',
      targetId: employee._id,
      description: `Updated employee: ${employee.fullName} (${employee.employeeId})`
    });

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate or archive employee (soft delete)
 * @route   PATCH /api/employees/:id/status
 * @access  Private (ADMIN, HR)
 */
const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { status, reason, isArchived } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (status) {
      employee.employmentStatus = status;
    }

    if (isArchived !== undefined) {
      employee.isArchived = isArchived;
      if (isArchived) {
        employee.archivedAt = new Date();
        employee.archivedReason = reason || 'Archived by Administrator';
        // Also deactivate user login
        if (employee.user) {
          await User.findByIdAndUpdate(employee.user, { isActive: false });
        }
      } else {
        employee.archivedAt = undefined;
        employee.archivedReason = undefined;
        if (employee.user) {
          await User.findByIdAndUpdate(employee.user, { isActive: true });
        }
      }
    }

    await employee.save();

    await logAction({
      req,
      action: 'EMPLOYEE_STATUS_CHANGE',
      module: 'Employee',
      targetId: employee._id,
      description: `Changed status for ${employee.fullName} (${employee.employeeId}) to ${status || (isArchived ? 'Archived' : 'Active')}`
    });

    res.json({
      success: true,
      message: 'Employee status updated successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus
};
