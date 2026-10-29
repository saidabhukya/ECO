const PayrollRecord = require('../models/PayrollRecord');
const Employee = require('../models/Employee');
const SalaryStructure = require('../models/SalaryStructure');
const { calculateEmployeePayroll } = require('../services/payrollService');
const { logAction } = require('../middleware/auditLogger');

/**
 * @desc    Generate payroll for a specific month and year
 * @route   POST /api/payroll/generate
 * @access  Private (ADMIN, HR)
 */
const generateMonthlyPayroll = async (req, res, next) => {
  try {
    const { month, year, department, employeeId } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and Year are required' });
    }

    const query = { isArchived: { $ne: true }, employmentStatus: 'Active' };
    if (employeeId) {
      query._id = employeeId;
    } else if (department) {
      query.department = department;
    }

    const employees = await Employee.find(query);
    if (employees.length === 0) {
      return res.status(400).json({ success: false, message: 'No active employees found matching the criteria.' });
    }

    const results = [];
    const errors = [];

    for (const emp of employees) {
      try {
        const record = await calculateEmployeePayroll(emp._id, parseInt(month, 10), parseInt(year, 10), req.user._id);
        results.push(record);
      } catch (err) {
        errors.push({ employeeId: emp.employeeId, name: emp.fullName, error: err.message });
      }
    }

    await logAction({
      req,
      action: 'PAYROLL_GENERATE',
      module: 'Payroll',
      description: `Generated payroll for ${month}/${year}. Processed: ${results.length}, Errors: ${errors.length}`,
      details: { month, year, generatedCount: results.length, errorCount: errors.length }
    });

    res.json({
      success: true,
      message: `Payroll generation complete. ${results.length} record(s) processed.`,
      generatedCount: results.length,
      errors: errors.length > 0 ? errors : undefined,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payroll list with filters
 * @route   GET /api/payroll
 * @access  Private
 */
const getPayrollList = async (req, res, next) => {
  try {
    const { month, year, status, department, employeeId, page = 1, limit = 20 } = req.query;

    const query = {};

    if (month) query.month = parseInt(month, 10);
    if (year) query.year = parseInt(year, 10);
    if (status) query.status = status;
    if (employeeId) query.employee = employeeId;

    // Role check: If EMPLOYEE, only see own finalized or approved payroll
    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.userEmployee?._id;
      query.status = { $in: ['Approved', 'Finalized'] };
    }

    if (department && ['ADMIN', 'HR'].includes(req.user.role)) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      query.employee = { $in: deptEmployees.map(e => e._id) };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await PayrollRecord.countDocuments(query);

    const records = await PayrollRecord.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeId email department designation bankDetails workLocation joiningDate',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'designation', select: 'title' }
        ]
      })
      .populate('generatedBy', 'email')
      .populate('approvedBy', 'email')
      .populate('finalizedBy', 'email')
      .sort({ year: -1, month: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Calculate totals for summary cards
    const summaryAgg = await PayrollRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$grossEarnings' },
          totalDeductions: { $sum: '$totalDeductions' },
          totalNet: { $sum: '$netPay' }
        }
      }
    ]);

    const totals = summaryAgg[0] || { totalGross: 0, totalDeductions: 0, totalNet: 0 };

    res.json({
      success: true,
      totals,
      data: records,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single payroll record (Salary Slip)
 * @route   GET /api/payroll/:id
 * @access  Private
 */
const getPayrollById = async (req, res, next) => {
  try {
    const record = await PayrollRecord.findById(req.params.id)
      .populate({
        path: 'employee',
        populate: ['department', 'designation', 'shift']
      })
      .populate('approvedBy', 'email')
      .populate('finalizedBy', 'email');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    // Security check: Employee can only view their own
    const isOwner = req.userEmployee?._id?.toString() === record.employee._id.toString();
    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Access denied: You cannot view this salary record.' });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update draft payroll adjustments
 * @route   PUT /api/payroll/:id
 * @access  Private (ADMIN, HR)
 */
const updatePayrollDraft = async (req, res, next) => {
  try {
    const record = await PayrollRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    if (record.status === 'Finalized') {
      return res.status(400).json({ success: false, message: 'Cannot edit finalized and locked payroll.' });
    }

    const { earnings, deductions, paymentStatus, paymentMethod, remarks } = req.body;

    if (earnings) record.earnings = { ...record.earnings, ...earnings };
    if (deductions) record.deductions = { ...record.deductions, ...deductions };
    if (paymentStatus) record.paymentStatus = paymentStatus;
    if (paymentMethod) record.paymentMethod = paymentMethod;
    if (remarks) record.remarks = remarks;

    // Recalculate gross and net
    const e = record.earnings;
    record.grossEarnings = Number(
      (
        (e.basicSalary || 0) +
        (e.hra || 0) +
        (e.conveyanceAllowance || 0) +
        (e.medicalAllowance || 0) +
        (e.specialAllowance || 0) +
        (e.overtimePay || 0) +
        (e.bonus || 0) +
        (e.otherEarnings || 0)
      ).toFixed(2)
    );

    const d = record.deductions;
    record.totalDeductions = Number(
      (
        (d.providentFund || 0) +
        (d.taxDeduction || 0) +
        (d.insuranceDeduction || 0) +
        (d.unpaidLeaveDeductions || 0) +
        (d.otherDeductions || 0)
      ).toFixed(2)
    );

    record.netPay = Math.max(0, Number((record.grossEarnings - record.totalDeductions).toFixed(2)));

    await record.save();

    await logAction({
      req,
      action: 'PAYROLL_DRAFT_UPDATE',
      module: 'Payroll',
      targetId: record._id,
      description: `Updated payroll draft for period ${record.payPeriod}`
    });

    res.json({
      success: true,
      message: 'Payroll record updated',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve payroll record
 * @route   POST /api/payroll/:id/approve
 * @access  Private (ADMIN, HR)
 */
const approvePayroll = async (req, res, next) => {
  try {
    const record = await PayrollRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Payroll record not found' });

    if (record.status === 'Finalized') {
      return res.status(400).json({ success: false, message: 'Payroll is already finalized.' });
    }

    record.status = 'Approved';
    record.approvedBy = req.user._id;
    record.approvedAt = new Date();
    await record.save();

    await logAction({
      req,
      action: 'PAYROLL_APPROVE',
      module: 'Payroll',
      targetId: record._id,
      description: `Approved payroll for ${record.payPeriod}`
    });

    res.json({ success: true, message: 'Payroll approved', data: record });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Finalize and lock payroll period
 * @route   POST /api/payroll/:id/finalize
 * @access  Private (ADMIN)
 */
const finalizePayroll = async (req, res, next) => {
  try {
    const record = await PayrollRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Payroll record not found' });

    record.status = 'Finalized';
    record.finalizedBy = req.user._id;
    record.finalizedAt = new Date();
    await record.save();

    await logAction({
      req,
      action: 'PAYROLL_FINALIZE',
      module: 'Payroll',
      targetId: record._id,
      description: `Finalized and locked payroll for ${record.payPeriod}`
    });

    res.json({ success: true, message: 'Payroll finalized and locked', data: record });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateMonthlyPayroll,
  getPayrollList,
  getPayrollById,
  updatePayrollDraft,
  approvePayroll,
  finalizePayroll
};
