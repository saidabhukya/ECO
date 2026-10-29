const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const PayrollRecord = require('../models/PayrollRecord');
const Holiday = require('../models/Holiday');
const AuditLog = require('../models/AuditLog');
const Goal = require('../models/Goal');

// Helper to format Date to YYYY-MM-DD
const formatDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * @desc    Get dashboard metrics & charts based on user role
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const employeeId = req.userEmployee?._id;
    const todayStr = formatDate();

    // 1. Core Counts
    const totalEmployees = await Employee.countDocuments({ isArchived: { $ne: true } });
    const activeEmployees = await Employee.countDocuments({ isArchived: { $ne: true }, employmentStatus: 'Active' });
    const inactiveEmployees = await Employee.countDocuments({
      isArchived: { $ne: true },
      employmentStatus: { $in: ['Inactive', 'Resigned', 'Terminated'] }
    });

    const departmentCount = await Department.countDocuments({ isActive: true });

    // New joiners in past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newJoinersCount = await Employee.countDocuments({
      isArchived: { $ne: true },
      joiningDate: { $gte: thirtyDaysAgo }
    });

    // 2. Today's Attendance Metrics
    const todayAttendance = await Attendance.find({ workDate: todayStr });
    const presentToday = todayAttendance.filter(a => ['Present', 'Late', 'Half Day'].includes(a.status)).length;
    const lateArrivals = todayAttendance.filter(a => a.status === 'Late' || a.lateMinutes > 0).length;
    const onLeaveToday = todayAttendance.filter(a => a.status === 'On Approved Leave').length;
    const absentToday = Math.max(0, activeEmployees - presentToday - onLeaveToday);

    // 3. Pending Approvals
    let pendingLeavesQuery = { status: 'Pending' };
    if (role === 'MANAGER' && employeeId) {
      const team = await Employee.find({ reportingManager: employeeId }).select('_id');
      pendingLeavesQuery.employee = { $in: team.map(t => t._id) };
    }
    const pendingLeaveApprovals = await LeaveRequest.countDocuments(pendingLeavesQuery);

    // 4. Monthly Payroll Total (Latest month)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const payrollAgg = await PayrollRecord.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: '$netPay' } } }
    ]);
    const monthlyPayrollTotal = payrollAgg[0]?.total || 0;

    // 5. Charts Data
    // Department Distribution
    const deptDistribution = await Employee.aggregate([
      { $match: { isArchived: { $ne: true } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { name: '$dept.name', count: 1 } }
    ]);

    // Monthly Attendance Trends (last 7 days)
    const attendanceTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDate(d);
      const dayRecords = await Attendance.find({ workDate: dStr });
      attendanceTrends.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        present: dayRecords.filter(r => ['Present', 'Late'].includes(r.status)).length,
        late: dayRecords.filter(r => r.status === 'Late').length,
        onLeave: dayRecords.filter(r => r.status === 'On Approved Leave').length
      });
    }

    // Leave statistics by type
    const leaveStats = await LeaveRequest.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$leaveType', totalDays: { $sum: '$days' } } },
      { $lookup: { from: 'leavetypes', localField: '_id', foreignField: '_id', as: 'lt' } },
      { $unwind: '$lt' },
      { $project: { name: '$lt.name', totalDays: 1, color: '$lt.color' } }
    ]);

    // Monthly Payroll Expenses (last 6 months)
    const payrollHistory = await PayrollRecord.aggregate([
      {
        $group: {
          _id: { year: '$year', month: '$month', payPeriod: '$payPeriod' },
          totalGross: { $sum: '$grossEarnings' },
          totalNet: { $sum: '$netPay' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    const formattedPayrollHistory = payrollHistory.map(p => ({
      period: p._id.payPeriod,
      gross: p.totalGross,
      net: p.totalNet
    }));

    // 6. Upcoming Holidays
    const upcomingHolidays = await Holiday.find({
      date: { $gte: new Date() },
      isActive: true
    }).sort({ date: 1 }).limit(5);

    // 7. Recent Joiners
    const recentJoiners = await Employee.find({ isArchived: { $ne: true } })
      .populate('department', 'name')
      .populate('designation', 'title')
      .sort({ joiningDate: -1 })
      .limit(5);

    // 8. Recent Activities (from Audit Logs)
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(8);

    // 9. Employee-specific data (if role is EMPLOYEE)
    let employeeSpecific = null;
    if (role === 'EMPLOYEE' && employeeId) {
      const myTodayAtt = await Attendance.findOne({ employee: employeeId, workDate: todayStr });
      const myGoals = await Goal.find({ employee: employeeId, status: { $ne: 'Completed' } }).limit(4);
      const myPendingLeaves = await LeaveRequest.find({ employee: employeeId, status: 'Pending' });

      employeeSpecific = {
        todayAttendance: myTodayAtt,
        activeGoals: myGoals,
        pendingLeaves: myPendingLeaves
      };
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          presentToday,
          absentToday,
          onLeaveToday,
          lateArrivals,
          departmentCount,
          newJoinersCount,
          monthlyPayrollTotal,
          pendingLeaveApprovals
        },
        charts: {
          deptDistribution,
          attendanceTrends,
          leaveStats,
          payrollHistory: formattedPayrollHistory
        },
        upcomingHolidays,
        recentJoiners,
        recentActivity,
        employeeSpecific
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
