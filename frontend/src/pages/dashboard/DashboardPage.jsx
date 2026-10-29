import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Building2,
  UserPlus,
  CreditCard,
  CalendarCheck,
  AlertCircle,
  CalendarDays,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export const DashboardPage = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/dashboard');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [role]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton count={1} height="h-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton count={4} height="h-28" />
        </div>
        <Skeleton count={2} height="h-72" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const COLORS = ['#DC2626', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ECO TRACK • {role} CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.employee?.firstName || user?.email?.split('@')[0]}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Track real-time employee engagement, attendance records, approvals, and company operations.
            </p>
          </div>

          {/* Live Clock Card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 text-center shrink-0 min-w-[200px]">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Live System Time
            </span>
            <span className="block text-2xl font-black font-mono text-white mt-1">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="block text-[11px] text-rose-400 font-medium mt-0.5">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* CORE STAT CARDS (Role Aware) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['ADMIN', 'HR'].includes(role) && (
          <>
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees || 0}
              subtitle={`${stats.activeEmployees || 0} Active, ${stats.inactiveEmployees || 0} Inactive`}
              icon={Users}
              color="red"
            />
            <StatCard
              title="Present Today"
              value={stats.presentToday || 0}
              subtitle={`${stats.lateArrivals || 0} Late, ${stats.absentToday || 0} Absent`}
              icon={UserCheck}
              color="emerald"
            />
            <StatCard
              title="Pending Leaves"
              value={stats.pendingLeaveApprovals || 0}
              subtitle={`${stats.onLeaveToday || 0} on approved leave today`}
              icon={CalendarCheck}
              color="amber"
            />
            <StatCard
              title="Monthly Payroll"
              value={`$${Number(stats.monthlyPayrollTotal || 0).toLocaleString()}`}
              subtitle={`${stats.departmentCount || 0} departments configured`}
              icon={CreditCard}
              color="purple"
            />
          </>
        )}

        {role === 'MANAGER' && (
          <>
            <StatCard
              title="Present Today"
              value={stats.presentToday || 0}
              subtitle="Direct team check-in rate"
              icon={UserCheck}
              color="emerald"
            />
            <StatCard
              title="Late Arrivals"
              value={stats.lateArrivals || 0}
              subtitle="Past grace period"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Team Pending Leaves"
              value={stats.pendingLeaveApprovals || 0}
              subtitle="Requires your review"
              icon={CalendarCheck}
              color="red"
            />
            <StatCard
              title="Team Members"
              value={stats.totalEmployees || 0}
              subtitle="Assigned subordinates"
              icon={Users}
              color="blue"
            />
          </>
        )}

        {role === 'EMPLOYEE' && (
          <>
            <StatCard
              title="Today's Attendance"
              value={data?.employeeSpecific?.todayAttendance?.status || 'Not Checked In'}
              subtitle={data?.employeeSpecific?.todayAttendance?.checkIn ? `In at ${new Date(data.employeeSpecific.todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Action required'}
              icon={Clock}
              color={data?.employeeSpecific?.todayAttendance ? 'emerald' : 'amber'}
            />
            <StatCard
              title="Hours Worked Today"
              value={`${data?.employeeSpecific?.todayAttendance?.workingHours || 0} hrs`}
              subtitle="Standard daily shift: 8 hrs"
              icon={UserCheck}
              color="blue"
            />
            <StatCard
              title="Active Goals"
              value={data?.employeeSpecific?.activeGoals?.length || 0}
              subtitle="Assigned performance goals"
              icon={Target}
              color="purple"
            />
            <StatCard
              title="Pending Leaves"
              value={data?.employeeSpecific?.pendingLeaves?.length || 0}
              subtitle="Awaiting manager sign-off"
              icon={CalendarCheck}
              color="red"
            />
          </>
        )}
      </div>

      {/* CHARTS SECTION (Admin / HR / Manager) */}
      {['ADMIN', 'HR', 'MANAGER'].includes(role) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution (Pie / Donut) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Department Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real-time employee allocation across active business units
            </p>
            <div className="h-64">
              {charts.deptDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.deptDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {charts.deptDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No department distribution data available
                </div>
              )}
            </div>
          </div>

          {/* 7-Day Attendance Trends (Bar Chart) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              7-Day Attendance Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Present, late arrivals, and approved leaves
            </p>
            <div className="h-64">
              {charts.attendanceTrends?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="present" fill="#10B981" radius={[4, 4, 0, 0]} name="Present" />
                    <Bar dataKey="late" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Late" />
                    <Bar dataKey="onLeave" fill="#3B82F6" radius={[4, 4, 0, 0]} name="On Leave" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No trend data available
                </div>
              )}
            </div>
          </div>

          {/* Monthly Payroll Expenses Trend (Area/Bar) */}
          {['ADMIN', 'HR'].includes(role) && charts.payrollHistory?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Monthly Payroll Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Historical gross earnings vs net disbursed payroll
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.payrollHistory}>
                    <defs>
                      <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                    <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="gross" stroke="#DC2626" fillOpacity={1} fill="url(#colorGross)" name="Gross Total" />
                    <Area type="monotone" dataKey="net" stroke="#10B981" fillOpacity={1} fill="url(#colorNet)" name="Net Disbursed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LOWER SECTION: Upcoming Holidays & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Holidays */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-rose-600" />
              <span>Upcoming Holidays</span>
            </h3>
            <Link to="/shifts" className="text-xs text-rose-600 hover:underline font-semibold">
              View Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {data?.upcomingHolidays?.length > 0 ? (
              data.upcomingHolidays.map((h) => (
                <div
                  key={h._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {h.name}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <Badge variant="purple">{h.holidayType}</Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No upcoming holidays scheduled</p>
            )}
          </div>
        </div>

        {/* Recent Joiners */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Recent Team Joiners</span>
            </h3>
            <Link to="/employees" className="text-xs text-rose-600 hover:underline font-semibold">
              Directory
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentJoiners?.length > 0 ? (
              data.recentJoiners.map((emp) => (
                <div
                  key={emp._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 text-white flex items-center justify-center text-xs font-bold">
                      {emp.firstName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {emp.firstName} {emp.lastName}
                      </h5>
                      <span className="text-[10px] text-slate-400 block">
                        {emp.designation?.title || emp.department?.name || 'Onboarded'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-500">
                    {emp.employeeId}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No recent joiners</p>
            )}
          </div>
        </div>

        {/* Recent Activity / Audit Log */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>Recent System Activity</span>
            </h3>
            {role === 'ADMIN' && (
              <Link to="/audit-logs" className="text-xs text-rose-600 hover:underline font-semibold">
                Audit Trail
              </Link>
            )}
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {data?.recentActivity?.length > 0 ? (
              data.recentActivity.map((log) => (
                <div
                  key={log._id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                      {log.actor?.email || 'System'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {log.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No recent activities recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
