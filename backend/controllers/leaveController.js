const LeaveRequest = require('../models/LeaveRequest');
const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { checkLeaveOverlap, updateLeaveBalance } = require('../services/leaveService');
const { logAction } = require('../middleware/auditLogger');

// Format date helper
const formatDate = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * @desc    Get all leave types
 * @route   GET /api/leaves/types
 * @access  Private
 */
const getLeaveTypes = async (req, res, next) => {
  try {
    const types = await LeaveType.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: types });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new leave type
 * @route   POST /api/leaves/types
 * @access  Private (ADMIN, HR)
 */
const createLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.create(req.body);
    await logAction({
      req,
      action: 'LEAVE_TYPE_CREATE',
      module: 'Leave',
      targetId: leaveType._id,
      description: `Created leave type: ${leaveType.name} (${leaveType.code})`
    });
    res.status(201).json({ success: true, data: leaveType });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leave balance for employee
 * @route   GET /api/leaves/balance
 * @access  Private
 */
const getLeaveBalances = async (req, res, next) => {
  try {
    const employeeId = req.query.employeeId || req.userEmployee?._id;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee reference is required' });
    }

    let balances = await LeaveBalance.find({ employee: employeeId, year })
      .populate('leaveType');

    // If balances don't exist yet for this year, initialize them
    if (balances.length === 0) {
      const activeTypes = await LeaveType.find({ isActive: true });
      for (const lt of activeTypes) {
        await LeaveBalance.create({
          employee: employeeId,
          leaveType: lt._id,
          year,
          allocated: lt.daysPerYear || 12,
          used: 0,
          pending: 0
        });
      }
      balances = await LeaveBalance.find({ employee: employeeId, year }).populate('leaveType');
    }

    res.json({ success: true, data: balances });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves
 * @access  Private
 */
const applyLeave = async (req, res, next) => {
  try {
    const employee = req.userEmployee;
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Employee profile not found' });
    }

    const { leaveType, startDate, endDate, isHalfDay, halfDaySession, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
    }

    // Calculate days
    let days = 0;
    if (isHalfDay) {
      days = 0.5;
    } else {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      days = diffDays;
    }

    // Check overlapping requests
    const hasOverlap = await checkLeaveOverlap(employee._id, startDate, endDate);
    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved leave request during these dates.'
      });
    }

    // Check balance
    const currentYear = start.getFullYear();
    const balance = await LeaveBalance.findOne({
      employee: employee._id,
      leaveType,
      year: currentYear
    });

    if (balance) {
      const remaining = balance.allocated - balance.used - balance.pending;
      if (remaining < days) {
        return res.status(400).json({
          success: false,
          message: `Insufficient leave balance. You requested ${days} day(s), but have only ${remaining} day(s) remaining.`
        });
      }
    }

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      days,
      isHalfDay: !!isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : 'None',
      reason,
      status: 'Pending'
    });

    // Update pending balance
    await updateLeaveBalance({
      employeeId: employee._id,
      leaveTypeId: leaveType,
      year: currentYear,
      days,
      action: 'APPLY',
      leaveRequestId: leaveRequest._id,
      performedBy: req.user._id,
      reason: `Applied for ${days} day(s) leave`
    });

    // Notify manager or HR
    if (employee.reportingManager) {
      const managerEmp = await Employee.findById(employee.reportingManager).populate('user');
      if (managerEmp?.user) {
        await Notification.create({
          recipient: managerEmp.user._id,
          title: 'New Leave Request',
          message: `${employee.fullName} submitted a leave request for ${days} day(s).`,
          type: 'Leave',
          actionUrl: '/leave'
        });
      }
    }

    await logAction({
      req,
      action: 'LEAVE_APPLY',
      module: 'Leave',
      targetId: leaveRequest._id,
      description: `${employee.fullName} applied for ${days} days leave (${formatDate(start)} to ${formatDate(end)})`
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leave requests with filters (Admin/HR/Manager/Self)
 * @route   GET /api/leaves
 * @access  Private
 */
const getLeaveRequests = async (req, res, next) => {
  try {
    const { status, leaveType, department, employeeId, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (employeeId) query.employee = employeeId;

    // Scope check
    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.userEmployee?._id;
    } else if (req.user.role === 'MANAGER' && !employeeId) {
      // Subordinate leaves or own leaves
      const team = await Employee.find({ reportingManager: req.userEmployee?._id }).select('_id');
      const teamIds = team.map(t => t._id);
      teamIds.push(req.userEmployee?._id);
      query.employee = { $in: teamIds };
    }

    // Filter by department
    if (department && ['ADMIN', 'HR'].includes(req.user.role)) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      query.employee = { $in: deptEmployees.map(e => e._id) };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await LeaveRequest.countDocuments(query);

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeId email department designation profilePhoto',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'designation', select: 'title' }
        ]
      })
      .populate('leaveType', 'name code color')
      .populate('approvalWorkflow.managerApproval.approvedBy', 'email')
      .populate('approvalWorkflow.hrApproval.approvedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: leaves,
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
 * @desc    Approve a leave request
 * @route   POST /api/leaves/:id/approve
 * @access  Private (ADMIN, HR, MANAGER)
 */
const approveLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const leave = await LeaveRequest.findById(req.params.id)
      .populate('employee')
      .populate('leaveType');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot approve leave with status '${leave.status}'` });
    }

    const isManager = req.user.role === 'MANAGER';
    const isHrOrAdmin = ['ADMIN', 'HR'].includes(req.user.role);

    // If Manager approves:
    if (isManager) {
      leave.approvalWorkflow.managerApproval = {
        status: 'Approved',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        remarks
      };
      // If company policy allows single manager approval or directly approve
      leave.status = 'Approved';
    }

    // If HR / Admin approves:
    if (isHrOrAdmin) {
      leave.approvalWorkflow.hrApproval = {
        status: 'Approved',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        remarks
      };
      leave.status = 'Approved';
    }

    if (leave.status === 'Approved') {
      const year = leave.startDate.getFullYear();
      await updateLeaveBalance({
        employeeId: leave.employee._id,
        leaveTypeId: leave.leaveType._id,
        year,
        days: leave.days,
        action: 'APPROVE',
        leaveRequestId: leave._id,
        performedBy: req.user._id,
        reason: remarks || 'Leave approved'
      });

      // Automatically populate attendance records for this period as 'On Approved Leave'
      let curr = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      while (curr <= end) {
        const dateStr = formatDate(curr);
        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, workDate: dateStr },
          {
            employee: leave.employee._id,
            workDate: dateStr,
            status: 'On Approved Leave',
            notes: `Approved leave: ${leave.leaveType.name}`
          },
          { upsert: true }
        );
        curr.setDate(curr.getDate() + 1);
      }
    }

    await leave.save();

    // Notify employee
    if (leave.employee.user) {
      await Notification.create({
        recipient: leave.employee.user,
        title: 'Leave Request Approved',
        message: `Your leave request for ${leave.days} day(s) from ${formatDate(leave.startDate)} has been approved.`,
        type: 'Leave',
        actionUrl: '/leave'
      });
    }

    await logAction({
      req,
      action: 'LEAVE_APPROVE',
      module: 'Leave',
      targetId: leave._id,
      description: `Leave request for ${leave.employee.fullName} approved by ${req.user.email}`
    });

    res.json({
      success: true,
      message: 'Leave approved successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject leave request
 * @route   POST /api/leaves/:id/reject
 * @access  Private (ADMIN, HR, MANAGER)
 */
const rejectLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate('employee');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot reject leave with status '${leave.status}'` });
    }

    leave.status = 'Rejected';
    if (['ADMIN', 'HR'].includes(req.user.role)) {
      leave.approvalWorkflow.hrApproval = {
        status: 'Rejected',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        remarks
      };
    } else {
      leave.approvalWorkflow.managerApproval = {
        status: 'Rejected',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        remarks
      };
    }

    await leave.save();

    // Release pending balance
    const year = leave.startDate.getFullYear();
    await updateLeaveBalance({
      employeeId: leave.employee._id,
      leaveTypeId: leave.leaveType,
      year,
      days: leave.days,
      action: 'REJECT',
      leaveRequestId: leave._id,
      performedBy: req.user._id,
      reason: remarks || 'Leave rejected'
    });

    // Notify employee
    if (leave.employee.user) {
      await Notification.create({
        recipient: leave.employee.user,
        title: 'Leave Request Rejected',
        message: `Your leave request for ${leave.days} day(s) from ${formatDate(leave.startDate)} was rejected. Reason: ${remarks || 'None provided'}`,
        type: 'Leave',
        actionUrl: '/leave'
      });
    }

    await logAction({
      req,
      action: 'LEAVE_REJECT',
      module: 'Leave',
      targetId: leave._id,
      description: `Leave request for ${leave.employee.fullName} rejected by ${req.user.email}`
    });

    res.json({
      success: true,
      message: 'Leave request rejected',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an eligible leave request
 * @route   POST /api/leaves/:id/cancel
 * @access  Private
 */
const cancelLeave = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate('employee');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const isOwner = req.userEmployee?._id?.toString() === leave.employee._id.toString();
    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this leave' });
    }

    if (leave.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Leave is already cancelled' });
    }

    const previousStatus = leave.status;
    leave.status = 'Cancelled';
    leave.cancelledAt = new Date();
    leave.cancelReason = reason || 'Cancelled by employee';
    await leave.save();

    const year = leave.startDate.getFullYear();
    if (previousStatus === 'Pending') {
      await updateLeaveBalance({
        employeeId: leave.employee._id,
        leaveTypeId: leave.leaveType,
        year,
        days: leave.days,
        action: 'CANCEL',
        leaveRequestId: leave._id,
        performedBy: req.user._id,
        reason: 'Pending leave cancelled'
      });
    } else if (previousStatus === 'Approved') {
      await updateLeaveBalance({
        employeeId: leave.employee._id,
        leaveTypeId: leave.leaveType,
        year,
        days: leave.days,
        action: 'RESTORE_APPROVED',
        leaveRequestId: leave._id,
        performedBy: req.user._id,
        reason: 'Approved leave cancelled and balance restored'
      });
    }

    await logAction({
      req,
      action: 'LEAVE_CANCEL',
      module: 'Leave',
      targetId: leave._id,
      description: `Leave request for ${leave.employee.fullName} was cancelled`
    });

    res.json({
      success: true,
      message: 'Leave request successfully cancelled and balance restored',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaveTypes,
  createLeaveType,
  getLeaveBalances,
  applyLeave,
  getLeaveRequests,
  approveLeave,
  rejectLeave,
  cancelLeave
};
