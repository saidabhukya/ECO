const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');

/**
 * Checks if employee has conflicting leave requests
 */
const checkLeaveOverlap = async (employeeId, startDate, endDate, excludeRequestId = null) => {
  const query = {
    employee: employeeId,
    status: { $in: ['Pending', 'Approved'] },
    $or: [
      { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      { endDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      {
        $and: [
          { startDate: { $lte: new Date(startDate) } },
          { endDate: { $gte: new Date(endDate) } }
        ]
      }
    ]
  };

  if (excludeRequestId) {
    query._id = { $ne: excludeRequestId };
  }

  const existing = await LeaveRequest.findOne(query);
  return !!existing;
};

/**
 * Deduct or release leave balance
 */
const updateLeaveBalance = async ({ employeeId, leaveTypeId, year, days, action, leaveRequestId, performedBy, reason }) => {
  let balance = await LeaveBalance.findOne({
    employee: employeeId,
    leaveType: leaveTypeId,
    year
  });

  if (!balance) {
    balance = await LeaveBalance.create({
      employee: employeeId,
      leaveType: leaveTypeId,
      year,
      allocated: 12,
      used: 0,
      pending: 0
    });
  }

  if (action === 'APPLY') {
    balance.pending += days;
  } else if (action === 'APPROVE') {
    balance.pending = Math.max(0, balance.pending - days);
    balance.used += days;
  } else if (action === 'REJECT') {
    balance.pending = Math.max(0, balance.pending - days);
  } else if (action === 'CANCEL') {
    // If was pending
    balance.pending = Math.max(0, balance.pending - days);
  } else if (action === 'RESTORE_APPROVED') {
    // If was approved and now cancelled/revoked
    balance.used = Math.max(0, balance.used - days);
  }

  balance.history.push({
    action: action === 'APPROVE' ? 'DEDUCTED' : action === 'RESTORE_APPROVED' ? 'RESTORED' : 'ADJUSTED',
    days,
    reason: reason || `Leave action: ${action}`,
    leaveRequestId,
    performedBy,
    date: new Date()
  });

  await balance.save();
  return balance;
};

module.exports = {
  checkLeaveOverlap,
  updateLeaveBalance
};
