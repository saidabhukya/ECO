const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const PayrollRecord = require('../models/PayrollRecord');
const Asset = require('../models/Asset');

const getEmployeeReport = async (req, res, next) => {
  try {
    const { department, status, employmentType } = req.query;
    const query = { isArchived: { $ne: true } };

    if (department) query.department = department;
    if (status) query.employmentStatus = status;
    if (employmentType) query.employmentType = employmentType;

    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .populate('designation', 'title level')
      .populate('shift', 'name')
      .sort({ joiningDate: -1 });

    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    next(error);
  }
};

const getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.workDate = { $gte: startDate, $lte: endDate };
    }

    if (department) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      query.employee = { $in: deptEmployees.map(e => e._id) };
    }

    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ workDate: -1 });

    // Status breakdown
    const stats = {
      present: records.filter(r => r.status === 'Present').length,
      late: records.filter(r => r.status === 'Late').length,
      halfDay: records.filter(r => r.status === 'Half Day').length,
      onLeave: records.filter(r => r.status === 'On Approved Leave').length,
      absent: records.filter(r => r.status === 'Absent').length,
      totalWorkingHours: Number(records.reduce((acc, r) => acc + (r.workingHours || 0), 0).toFixed(2))
    };

    res.json({ success: true, stats, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

const getLeaveReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = {};

    if (status) query.status = status;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const leaves = await LeaveRequest.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('leaveType', 'name code')
      .sort({ startDate: -1 });

    const totalDays = leaves.reduce((acc, l) => acc + (l.days || 0), 0);

    res.json({ success: true, totalDays, count: leaves.length, data: leaves });
  } catch (error) {
    next(error);
  }
};

const getPayrollReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const query = {};

    if (year) query.year = parseInt(year, 10);
    if (month) query.month = parseInt(month, 10);

    const records = await PayrollRecord.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ year: -1, month: -1 });

    const totals = {
      totalGross: records.reduce((acc, r) => acc + r.grossEarnings, 0),
      totalDeductions: records.reduce((acc, r) => acc + r.totalDeductions, 0),
      totalNet: records.reduce((acc, r) => acc + r.netPay, 0)
    };

    res.json({ success: true, totals, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployeeReport,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport
};
