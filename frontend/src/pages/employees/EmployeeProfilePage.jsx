import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import IdCardModal from '../../components/employee/IdCardModal';
import {
  User,
  Briefcase,
  Clock,
  CalendarCheck,
  CreditCard,
  Target,
  FileText,
  Boxes,
  History,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Shield,
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const EmployeeProfilePage = () => {
  const { id } = useParams();
  const { role, user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);

  // Tab-specific datasets
  const [attendances, setAttendances] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [assets, setAssets] = useState([]);

  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/employees/${id}`);
      if (res.data?.success) {
        setEmployee(res.data.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load employee profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabDetails = async () => {
    if (!id) return;
    try {
      if (activeTab === 'attendance') {
        const res = await api.get(`/attendance/me?employeeId=${id}`);
        if (res.data?.success) setAttendances(res.data.data);
      } else if (activeTab === 'leave') {
        const res = await api.get(`/leaves/balance?employeeId=${id}`);
        if (res.data?.success) setLeaveBalances(res.data.data);
      } else if (activeTab === 'payroll' && ['ADMIN', 'HR', 'EMPLOYEE'].includes(role)) {
        const res = await api.get(`/payroll?employeeId=${id}`);
        if (res.data?.success) setPayrollHistory(res.data.data);
      } else if (activeTab === 'performance') {
        const [gRes, rRes] = await Promise.all([
          api.get(`/performance/goals?employeeId=${id}`),
          api.get(`/performance/reviews?employeeId=${id}`)
        ]);
        if (gRes.data?.success) setGoals(gRes.data.data);
        if (rRes.data?.success) setReviews(rRes.data.data);
      } else if (activeTab === 'documents') {
        const res = await api.get(`/documents?employeeId=${id}`);
        if (res.data?.success) setDocuments(res.data.data);
      } else if (activeTab === 'assets') {
        const res = await api.get(`/assets?employeeId=${id}`);
        if (res.data?.success) setAssets(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load tab details:', e);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  useEffect(() => {
    fetchTabDetails();
  }, [id, activeTab]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton count={1} height="h-32" />
        <Skeleton count={6} height="h-12" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Employee profile not found
        </h3>
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const tabs = [
    { key: 'personal', label: 'Personal Info', icon: User },
    { key: 'employment', label: 'Employment Details', icon: Briefcase },
    { key: 'attendance', label: 'Attendance Register', icon: Clock },
    { key: 'leave', label: 'Leave Balances', icon: CalendarCheck },
    { key: 'payroll', label: 'Payroll & Slips', icon: CreditCard, hidden: !['ADMIN', 'HR', 'EMPLOYEE'].includes(role) },
    { key: 'performance', label: 'Performance & Goals', icon: Target },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'assets', label: 'Assigned Assets', icon: Boxes },
    { key: 'history', label: 'Employment History', icon: History }
  ].filter(t => !t.hidden);

  return (
    <div className="space-y-6">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() => setIsIdCardOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Employee Badge / ID Card</span>
        </button>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/20 border-2 border-white dark:border-slate-800">
            {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                {employee.employeeId}
              </span>
              <Badge status={employee.employmentStatus} />
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
              {employee.designation?.title || 'Designation Pending'} • <span className="text-rose-600 dark:text-rose-400">{employee.department?.name}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {employee.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {employee.contactNumber}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {employee.workLocation || 'Headquarters'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {new Date(employee.joiningDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* 9-Tab Navigation Bar */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-3 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Personal Info */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-rose-600">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-slate-400">Date of Birth:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not Specified'}
                </span>
              </div>
              <div>
                <span className="block text-slate-400">Gender:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.gender || 'Prefer not to say'}</span>
              </div>
              <div>
                <span className="block text-slate-400">Personal Email:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.email}</span>
              </div>
              <div>
                <span className="block text-slate-400">Contact Number:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.contactNumber}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-xs text-slate-400 mb-1">Residential Address:</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {employee.address?.street ? `${employee.address.street}, ${employee.address.city}, ${employee.address.state} ${employee.address.postalCode}, ${employee.address.country}` : 'Address not registered'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-rose-600">
              Emergency Contact & Bank Details
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-slate-400">Emergency Contact Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.emergencyContact?.name || 'Not Configured'} ({employee.emergencyContact?.relationship || 'Relative'})
                </span>
              </div>
              <div>
                <span className="block text-slate-400">Emergency Phone:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.emergencyContact?.phone || 'None'}</span>
              </div>
            </div>

            {/* Bank details restricted */}
            {employee.bankDetails ? (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase mb-2">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Authorized Bank Details</span>
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-slate-400">Bank Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.bankDetails.bankName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Account Number:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.bankDetails.accountNumber || '****'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Routing / IFSC:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.bankDetails.ifscOrRoutingCode || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 italic">
                Sensitive banking information masked for your security permissions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Employment Details */}
      {activeTab === 'employment' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-rose-600">
            Employment Details & Placement
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <span className="block text-slate-400">Department:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.department?.name}</span>
            </div>
            <div>
              <span className="block text-slate-400">Designation:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.designation?.title || 'Team Member'}</span>
            </div>
            <div>
              <span className="block text-slate-400">Reporting Manager:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {employee.reportingManager ? `${employee.reportingManager.firstName} ${employee.reportingManager.lastName}` : 'Direct Executive Report'}
              </span>
            </div>

            <div>
              <span className="block text-slate-400">Employment Type:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.employmentType}</span>
            </div>
            <div>
              <span className="block text-slate-400">Assigned Shift:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {employee.shift?.name || 'General Morning Shift'} ({employee.shift?.startTime || '09:00'} - {employee.shift?.endTime || '18:00'})
              </span>
            </div>
            <div>
              <span className="block text-slate-400">Joining Date:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {new Date(employee.joiningDate).toLocaleDateString([], { dateStyle: 'long' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Attendance Summary */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Recent Attendance History
          </h3>
          {attendances.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No attendance records logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Work Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Check In</th>
                    <th className="p-3">Check Out</th>
                    <th className="p-3">Working Hours</th>
                    <th className="p-3">Late Mins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendances.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{att.workDate}</td>
                      <td className="p-3"><Badge status={att.status} /></td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{att.workingHours || 0} hrs</td>
                      <td className="p-3 text-rose-500 font-semibold">{att.lateMinutes > 0 ? `${att.lateMinutes}m` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Leave Balance */}
      {activeTab === 'leave' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Leave Quotas & Balances ({new Date().getFullYear()})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaveBalances.map((bal) => (
              <div key={bal._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                  {bal.leaveType?.name || 'Leave Type'}
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {bal.remaining ?? (bal.allocated - bal.used - bal.pending)}
                  </span>
                  <span className="text-[11px] text-slate-400">days left</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[10px] text-slate-500">
                  <span>Allocated: {bal.allocated}</span>
                  <span>Used: {bal.used}</span>
                  <span>Pending: {bal.pending}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Payroll & Salary Slips */}
      {activeTab === 'payroll' && ['ADMIN', 'HR', 'EMPLOYEE'].includes(role) && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Salary History & Finalized Slips
          </h3>
          {payrollHistory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No payroll records generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Period</th>
                    <th className="p-3">Gross Earnings</th>
                    <th className="p-3">Total Deductions</th>
                    <th className="p-3">Net Disbursed</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payrollHistory.map((pr) => (
                    <tr key={pr._id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{pr.payPeriod}</td>
                      <td className="p-3 font-semibold">${pr.grossEarnings?.toLocaleString()}</td>
                      <td className="p-3 text-rose-500 font-semibold">-${pr.totalDeductions?.toLocaleString()}</td>
                      <td className="p-3 font-bold text-emerald-600">${pr.netPay?.toLocaleString()}</td>
                      <td className="p-3"><Badge status={pr.status} /></td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/payroll?slipId=${pr._id}`}
                          className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100"
                        >
                          View Slip
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Performance & Goals */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Goals</h3>
            {goals.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No active performance goals assigned.</p>
            ) : (
              <div className="space-y-3">
                {goals.map((g) => (
                  <div key={g._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{g.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{g.description}</p>
                      </div>
                      <Badge status={g.status} />
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <span>Progress</span>
                        <span>{g.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-600 h-full rounded-full transition-all" style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No published performance evaluations yet.</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{r.reviewPeriod}</span>
                    <span className="text-xs font-bold text-emerald-600">Score: {r.overallScore} / 5</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{r.reviewerFeedback}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 7: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Uploaded Documents</h3>
          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No documents uploaded for this employee yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-rose-500" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{doc.title}</span>
                      <span className="block text-[10px] text-slate-400">{doc.category} • {(doc.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <a
                    href={`/api/documents/${doc._id}/download`}
                    className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Assigned Assets */}
      {activeTab === 'assets' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Company Assets</h3>
          {assets.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No company assets assigned to this employee.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assets.map((ast) => (
                <div key={ast._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-rose-500 block">{ast.assetId}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{ast.name}</h4>
                    <span className="text-[11px] text-slate-400 block mt-1">Serial: {ast.serialNumber}</span>
                  </div>
                  <Badge status={ast.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 9: Employment History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employment & Career History</h3>
          {employee.employmentHistory?.length > 0 ? (
            <div className="space-y-4">
              {employee.employmentHistory.map((h, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{h.role}</h4>
                  <p className="text-xs text-rose-600 font-semibold">{h.company}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{h.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No prior historical work records documented.</p>
          )}
        </div>
      )}

      {/* ID Card Modal */}
      <IdCardModal
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        employee={employee}
      />
    </div>
  );
};

export default EmployeeProfilePage;
