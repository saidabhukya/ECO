import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Download,
  Filter,
  UserCheck,
  UserX,
  History
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AttendancePage = () => {
  const { role, user } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'my-attendance' | 'corrections'
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [records, setRecords] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Correction Request Modal
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [selectedRecordForCorrection, setSelectedRecordForCorrection] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    requestedCheckIn: '',
    requestedCheckOut: '',
    requestedStatus: 'Present',
    reason: ''
  });

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data?.success) setTodayAttendance(res.data.data);
    } catch (e) {
      // ignore
    }
  };

  const fetchRegister = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        date,
        department: selectedDept,
        status: selectedStatus,
        page,
        limit: 20
      });
      const res = await api.get(`/attendance?${params.toString()}`);
      if (res.data?.success) {
        setRecords(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyAttendance = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/attendance/me');
      if (res.data?.success) {
        setMyRecords(res.data.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchTodayStatus();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (activeTab === 'register') {
      fetchRegister();
    } else {
      fetchMyAttendance();
    }
  }, [activeTab, date, selectedDept, selectedStatus, page]);

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in');
      if (res.data?.success) {
        addToast('Checked in successfully!', 'success');
        fetchTodayStatus();
        fetchMyAttendance();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out');
      if (res.data?.success) {
        addToast('Checked out successfully!', 'success');
        fetchTodayStatus();
        fetchMyAttendance();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed', 'error');
    }
  };

  const handleExportXLSX = () => {
    const dataToExport = activeTab === 'register' ? records : myRecords;
    if (dataToExport.length === 0) return;

    const exportRows = dataToExport.map((r) => ({
      'Employee ID': r.employee?.employeeId,
      'Name': r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
      'Department': r.employee?.department?.name || '',
      'Work Date': r.workDate,
      'Status': r.status,
      'Check In': r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '',
      'Check Out': r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '',
      'Working Hours': r.workingHours || 0,
      'Late Minutes': r.lateMinutes || 0
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `ECO_TRACK_Attendance_${date}.xlsx`);
    addToast('Attendance sheet exported', 'success');
  };

  const submitCorrection = async (e) => {
    e.preventDefault();
    if (!selectedRecordForCorrection) return;

    try {
      await api.post('/attendance/adjustments', {
        attendanceId: selectedRecordForCorrection._id,
        ...correctionForm
      });
      addToast('Adjustment request submitted for approval', 'success');
      setIsCorrectionModalOpen(false);
      fetchMyAttendance();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit correction', 'error');
    }
  };

  const columns = [
    {
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
            {row.employee?.firstName?.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              {row.employee?.firstName} {row.employee?.lastName}
            </span>
            <span className="text-[11px] font-mono text-rose-500">
              {row.employee?.employeeId}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Department',
      render: (row) => row.employee?.department?.name || 'Unassigned'
    },
    {
      header: 'Work Date',
      accessor: 'workDate'
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'Timestamps',
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-700 dark:text-slate-300 block">
            In: {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
          </span>
          <span className="text-slate-400 block text-[11px]">
            Out: {row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Hours',
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.workingHours || 0} hrs
        </span>
      )
    },
    {
      header: 'Late Mins',
      render: (row) => (
        <span className={row.lateMinutes > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'}>
          {row.lateMinutes > 0 ? `${row.lateMinutes}m` : '-'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendance Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time daily punches, shift adherence, working hours calculation, and correction workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Register</span>
          </button>
        </div>
      </div>

      {/* Check In / Out Hero Card (Self Service for Logged In User) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              Today's Session • {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Status: <span className="text-emerald-400">{todayAttendance?.status || 'Awaiting Check-In'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {todayAttendance?.checkIn
                ? `Logged in at ${new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
                    todayAttendance.checkOut ? ` • Completed (${todayAttendance.workingHours} hrs)` : ' • Session in progress'
                  }`
                : 'Standard 8-hour shift. Please record your arrival on time.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!todayAttendance || !todayAttendance.checkIn ? (
            <button
              onClick={handleCheckIn}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-900/40 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Check In</span>
            </button>
          ) : !todayAttendance.checkOut ? (
            <button
              onClick={handleCheckOut}
              className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-rose-900/40 transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>Record Check Out</span>
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Daily Session Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['ADMIN', 'HR', 'MANAGER'].includes(role) && (
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-rose-600 text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Company Register
          </button>
        )}
        <button
          onClick={() => setActiveTab('my-attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my-attendance'
              ? 'bg-rose-600 text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          My Attendance Records
        </button>
      </div>

      {/* Filter bar for Register view */}
      {activeTab === 'register' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
                <option value="On Approved Leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={activeTab === 'register' ? records : myRecords}
        isLoading={isLoading}
      />

      {activeTab === 'register' && (
        <Pagination
          page={page}
          limit={20}
          total={totalCount}
          pages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default AttendancePage;
