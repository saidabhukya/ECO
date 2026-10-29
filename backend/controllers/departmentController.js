const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Designation = require('../models/Designation');
const { logAction } = require('../middleware/auditLogger');

/**
 * @desc    Get all departments with employee counts
 * @route   GET /api/departments
 * @access  Private
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('headOfDepartment', 'firstName lastName employeeId email profilePhoto')
      .sort({ name: 1 });

    // Aggregate active employee counts
    const counts = await Employee.aggregate([
      { $match: { isArchived: { $ne: true } } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => {
      if (c._id) countMap[c._id.toString()] = c.count;
    });

    const data = departments.map(d => ({
      ...d.toObject(),
      employeeCount: countMap[d._id.toString()] || 0
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get department by ID with designations & employees
 * @route   GET /api/departments/:id
 * @access  Private
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headOfDepartment', 'firstName lastName employeeId email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const designations = await Designation.find({ department: department._id });
    const employees = await Employee.find({ department: department._id, isArchived: { $ne: true } })
      .select('firstName lastName employeeId email designation employmentStatus profilePhoto')
      .populate('designation', 'title');

    res.json({
      success: true,
      data: {
        ...department.toObject(),
        designations,
        employees,
        employeeCount: employees.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create department
 * @route   POST /api/departments
 * @access  Private (ADMIN, HR)
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfDepartment } = req.body;

    const existingName = await Department.findOne({ name });
    if (existingName) {
      return res.status(400).json({ success: false, message: 'Department with this name already exists' });
    }

    const existingCode = await Department.findOne({ code: code?.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'Department code already exists' });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      headOfDepartment: headOfDepartment || undefined
    });

    await logAction({
      req,
      action: 'DEPARTMENT_CREATE',
      module: 'Department',
      targetId: department._id,
      description: `Created department: ${department.name} (${department.code})`
    });

    res.status(201).json({
      success: true,
      message: 'Department successfully created',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update department
 * @route   PUT /api/departments/:id
 * @access  Private (ADMIN, HR)
 */
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('headOfDepartment', 'firstName lastName employeeId');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await logAction({
      req,
      action: 'DEPARTMENT_UPDATE',
      module: 'Department',
      targetId: department._id,
      description: `Updated department: ${department.name}`
    });

    res.json({
      success: true,
      message: 'Department successfully updated',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete department (Checks if employees are assigned first!)
 * @route   DELETE /api/departments/:id
 * @access  Private (ADMIN)
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const employeeCount = await Employee.countDocuments({
      department: req.params.id,
      isArchived: { $ne: true }
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: There are currently ${employeeCount} active employee(s) assigned to it. Please reassign them first.`
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await Designation.deleteMany({ department: req.params.id });

    await logAction({
      req,
      action: 'DEPARTMENT_DELETE',
      module: 'Department',
      targetId: req.params.id,
      description: `Deleted department: ${department.name}`
    });

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
