const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');
const { calculateAttendanceMetrics } = require('../services/attendanceService');
const { logAction } = require('../middleware/auditLogger');

// Helper to format Date to YYYY-MM-DD
const formatDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * @desc    Employee Check-In
 * @route   POST /api/attendance/check-in
 * @access  Private (EMPLOYEE, MANAGER, HR, ADMIN)
 */
const checkIn = async (req, res, next) => {
  try {
    const employee = req.userEmployee;
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to your account'
      });
    }

    const todayStr = formatDate();

    let attendance = await Attendance.findOne({
      employee: employee._id,
      workDate: todayStr
    });

    if (attendance && attendance.checkIn && !attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You are already checked in for today.'
      });
    }

    if (attendance && attendance.checkIn && attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed your attendance session for today.'
      });
    }

    // Fetch shift
    const shift = employee.shift ? await Shift.findById(employee.shift) : null;
    const now = new Date();

    const metrics = shift
      ? calculateAttendanceMetrics({ checkIn: now, shift })
      : { lateMinutes: 0 };

    const status = metrics.lateMinutes > 0 ? 'Late' : 'Present';

    if (attendance) {
      attendance.checkIn = now;
      attendance.status = status;
      attendance.lateMinutes = metrics.lateMinutes;
      attendance.shift = shift?._id;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: employee._id,
        workDate: todayStr,
        shift: shift?._id,
        checkIn: now,
        status: status,
        lateMinutes: metrics.lateMinutes
      });
    }

    await logAction({
      req,
      action: 'ATTENDANCE_CHECK_IN',
      module: 'Attendance',
      targetId: attendance._id,
      description: `Employee ${employee.fullName} checked in at ${now.toLocaleTimeString()} (${status})`
    });

    res.json({
      success: true,
      message: `Checked in successfully! Status: ${status}`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Employee Check-Out
 * @route   POST /api/attendance/check-out
 * @access  Private (EMPLOYEE, MANAGER, HR, ADMIN)
 */
const checkOut = async (req, res, next) => {
  try {
    const employee = req.userEmployee;
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to your account'
      });
    }

    const todayStr = formatDate();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      workDate: todayStr
    }).populate('shift');

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No open check-in session found for today. Please check in first.'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today.'
      });
    }

    const now = new Date();
    attendance.checkOut = now;

    // Calculate metrics
    const metrics = calculateAttendanceMetrics({
      checkIn: attendance.checkIn,
      checkOut: now,
      shift: attendance.shift,
      breakDurationMinutes: attendance.breakDuration
    });

    attendance.workingHours = metrics.workingHours;
    attendance.earlyDepartureMinutes = metrics.earlyDepartureMinutes;
    attendance.overtimeMinutes = metrics.overtimeMinutes;

    // If working hours < 4 hours, mark as Half Day unless on approved leave
    if (metrics.workingHours < 4 && attendance.status !== 'On Approved Leave') {
      attendance.status = 'Half Day';
    }

    await attendance.save();

    await logAction({
      req,
      action: 'ATTENDANCE_CHECK_OUT',
      module: 'Attendance',
      targetId: attendance._id,
      description: `Employee ${employee.fullName} checked out at ${now.toLocaleTimeString()}. Worked ${metrics.workingHours} hrs`
    });

    res.json({
      success: true,
      message: `Checked out successfully! Total working hours: ${metrics.workingHours} hrs`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's today attendance status
 * @route   GET /api/attendance/today
 * @access  Private
 */
const getTodayAttendance = async (req, res, next) => {
  try {
    if (!req.userEmployee) {
      return res.json({ success: true, data: null });
    }

    const todayStr = formatDate();
    const attendance = await Attendance.findOne({
      employee: req.userEmployee._id,
      workDate: todayStr
    }).populate('shift');

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance register with filters (date range, department, employee)
 * @route   GET /api/attendance
 * @access  Private (ADMIN, HR, MANAGER)
 */
const getAttendanceRegister = async (req, res, next) => {
  try {
    const { date, startDate, endDate, department, employeeId, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (date) {
      query.workDate = date;
    } else if (startDate && endDate) {
      query.workDate = { $gte: startDate, $lte: endDate };
    } else {
      // Default to today
      query.workDate = formatDate();
    }

    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    // Manager scope: only their team
    if (req.user.role === 'MANAGER' && !employeeId) {
      const teamEmployees = await Employee.find({ reportingManager: req.userEmployee?._id }).select('_id');
      query.employee = { $in: teamEmployees.map(e => e._id) };
    }

    // Filter by department
    if (department) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      const deptEmpIds = deptEmployees.map(e => e._id);
      query.employee = query.employee ? { $in: deptEmpIds } : { $in: deptEmpIds };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Attendance.countDocuments(query);

    const records = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeId department designation profilePhoto',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'designation', select: 'title' }
        ]
      })
      .populate('shift')
      .sort({ workDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
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
 * @desc    Get attendance history for logged-in user or specific employee
 * @route   GET /api/attendance/me
 * @access  Private
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const employeeId = req.query.employeeId || req.userEmployee?._id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not found' });
    }

    const { month, year } = req.query;
    const query = { employee: employeeId };

    if (month && year) {
      const payPeriod = `${year}-${String(month).padStart(2, '0')}`;
      query.workDate = { $regex: `^${payPeriod}` };
    }

    const records = await Attendance.find(query)
      .populate('shift')
      .sort({ workDate: -1 });

    // Calculate monthly summary
    const summary = {
      totalDays: records.length,
      present: records.filter(r => r.status === 'Present').length,
      late: records.filter(r => r.status === 'Late').length,
      halfDay: records.filter(r => r.status === 'Half Day').length,
      onLeave: records.filter(r => r.status === 'On Approved Leave').length,
      totalHours: Number(records.reduce((acc, r) => acc + (r.workingHours || 0), 0).toFixed(2)),
      totalOvertimeMinutes: records.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0)
    };

    res.json({
      success: true,
      summary,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit attendance adjustment request (e.g. forgot check in/out)
 * @route   POST /api/attendance/adjustments
 * @access  Private
 */
const requestAdjustment = async (req, res, next) => {
  try {
    const { attendanceId, requestedCheckIn, requestedCheckOut, requestedStatus, reason } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    attendance.adjustmentHistory.push({
      requestedBy: req.user._id,
      requestedAt: new Date(),
      originalCheckIn: attendance.checkIn,
      originalCheckOut: attendance.checkOut,
      originalStatus: attendance.status,
      requestedCheckIn: requestedCheckIn ? new Date(requestedCheckIn) : undefined,
      requestedCheckOut: requestedCheckOut ? new Date(requestedCheckOut) : undefined,
      requestedStatus,
      reason,
      status: 'Pending'
    });

    await attendance.save();

    await logAction({
      req,
      action: 'ATTENDANCE_ADJUST_REQUEST',
      module: 'Attendance',
      targetId: attendance._id,
      description: `Adjustment requested for attendance on ${attendance.workDate} by ${req.user.email}`
    });

    res.json({
      success: true,
      message: 'Attendance correction request submitted for approval',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve/Reject attendance adjustment
 * @route   PATCH /api/attendance/adjustments/:attendanceId/:adjustmentId
 * @access  Private (ADMIN, HR, MANAGER)
 */
const processAdjustment = async (req, res, next) => {
  try {
    const { status, remarks } = req.body; // 'Approved' | 'Rejected'
    const { attendanceId, adjustmentId } = req.params;

    const attendance = await Attendance.findById(attendanceId).populate('shift');
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const adj = attendance.adjustmentHistory.id(adjustmentId);
    if (!adj) {
      return res.status(404).json({ success: false, message: 'Adjustment request not found' });
    }

    adj.status = status;
    adj.approvedBy = req.user._id;
    adj.approvedAt = new Date();

    if (status === 'Approved') {
      if (adj.requestedCheckIn) attendance.checkIn = adj.requestedCheckIn;
      if (adj.requestedCheckOut) attendance.checkOut = adj.requestedCheckOut;
      if (adj.requestedStatus) attendance.status = adj.requestedStatus;

      // Recalculate metrics
      if (attendance.checkIn && attendance.checkOut && attendance.shift) {
        const metrics = calculateAttendanceMetrics({
          checkIn: attendance.checkIn,
          checkOut: attendance.checkOut,
          shift: attendance.shift,
          breakDurationMinutes: attendance.breakDuration
        });
        attendance.workingHours = metrics.workingHours;
        attendance.lateMinutes = metrics.lateMinutes;
        attendance.earlyDepartureMinutes = metrics.earlyDepartureMinutes;
        attendance.overtimeMinutes = metrics.overtimeMinutes;
      }
    }

    await attendance.save();

    await logAction({
      req,
      action: `ATTENDANCE_ADJUST_${status.toUpperCase()}`,
      module: 'Attendance',
      targetId: attendance._id,
      description: `Adjustment on ${attendance.workDate} was ${status} by ${req.user.email}`
    });

    res.json({
      success: true,
      message: `Adjustment request ${status.toLowerCase()}`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceRegister,
  getMyAttendance,
  requestAdjustment,
  processAdjustment
};
