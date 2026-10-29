import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { CalendarCheck, Plus, Check, X, Ban, Calendar } from 'lucide-react';

export const LeaveListPage = () => {
  const { role, user } = useAuth();
  const { addToast } = useNotification();

  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    halfDaySession: 'None',
    reason: ''
  });

  // Action review modal (Approve/Reject)
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', leave: null, remarks: '' });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [typesRes, balRes, leavesRes] = await Promise.all([
        api.get('/leaves/types'),
        api.get('/leaves/balance'),
        api.get(`/leaves?status=${statusFilter}&leaveType=${typeFilter}&page=${page}&limit=10`)
      ]);

      if (typesRes.data?.success) setLeaveTypes(typesRes.data.data);
      if (balRes.data?.success) setBalances(balRes.data.data);
      if (leavesRes.data?.success) {
        setLeaves(leavesRes.data.data);
        setTotalPages(leavesRes.data.pagination?.pages || 1);
        setTotalCount(leavesRes.data.pagination?.total || 0);
      }
    } catch (e) {
      addToast('Failed to load leave requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter, page]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', applyForm);
      addToast('Leave request submitted successfully!', 'success');
      setIsApplyModalOpen(false);
      setApplyForm({
        leaveType: '',
        startDate: '',
        endDate: '',
        isHalfDay: false,
        halfDaySession: 'None',
        reason: ''
      });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit leave', 'error');
    }
  };

  const handleActionSubmit = async () => {
    if (!actionModal.leave) return;
    try {
      const endpoint = actionModal.type === 'approve' ? 'approve' : 'reject';
      await api.post(`/leaves/${actionModal.leave._id}/${endpoint}`, {
        remarks: actionModal.remarks
      });
      addToast(`Leave request ${actionModal.type}d`, 'success');
      setActionModal({ isOpen: false, type: '', leave: null, remarks: '' });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleCancelLeave = async (leaveId) => {
    try {
      await api.post(`/leaves/${leaveId}/cancel`, { reason: 'Cancelled by requester' });
      addToast('Leave request cancelled and quota restored', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel leave', 'error');
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
      header: 'Leave Type',
      render: (row) => (
        <Badge variant="info">
          {row.leaveType?.name || 'General Leave'}
        </Badge>
      )
    },
    {
      header: 'Period & Days',
      render: (row) => (
        <div>
          <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            {new Date(row.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
            {new Date(row.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
          <span className="block text-[11px] text-slate-400">
            {row.days} day(s) {row.isHalfDay && `(${row.halfDaySession})`}
          </span>
        </div>
      )
    },
    {
      header: 'Reason',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-xs">
          {row.reason}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Manager / HR Approve / Reject for Pending */}
          {['ADMIN', 'HR', 'MANAGER'].includes(role) && row.status === 'Pending' && (
            <>
              <button
                onClick={() => setActionModal({ isOpen: true, type: 'approve', leave: row, remarks: '' })}
                title="Approve Leave"
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActionModal({ isOpen: true, type: 'reject', leave: row, remarks: '' })}
                title="Reject Leave"
                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Cancel Pending/Approved if Owner or Admin */}
          {(row.status === 'Pending' || (row.status === 'Approved' && ['ADMIN', 'HR'].includes(role))) && (
            <button
              onClick={() => handleCancelLeave(row._id)}
              title="Cancel Leave Request"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Leave Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Apply for leave, review pending team time-off requests, and track real-time leave balances.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balance Cards (For Logged in User) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((b) => (
          <div
            key={b._id}
            className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {b.leaveType?.name || 'Leave'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {b.leaveType?.code}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {b.remaining ?? (b.allocated - b.used - b.pending)}
              </span>
              <span className="text-xs font-medium text-slate-400">days available</span>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Total: {b.allocated}</span>
              <span>Used: {b.used}</span>
              <span>Pending: {b.pending}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
          >
            <option value="">All Leave Types</option>
            {leaveTypes.map((lt) => (
              <option key={lt._id} value={lt._id}>{lt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={leaves}
        isLoading={isLoading}
      />

      <Pagination
        page={page}
        limit={10}
        total={totalCount}
        pages={totalPages}
        onPageChange={setPage}
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave"
        subtitle="Submit time-off request with automatic balance deduction"
        maxWidth="max-w-lg"
        footer={
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Submit Application
          </button>
        }
      >
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Leave Type *
            </label>
            <select
              required
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((t) => (
                <option key={t._id} value={t._id}>{t.name} ({t.daysPerYear} days/yr)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="halfDay"
              checked={applyForm.isHalfDay}
              onChange={(e) => setApplyForm({ ...applyForm, isHalfDay: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded"
            />
            <label htmlFor="halfDay" className="font-semibold text-slate-700 dark:text-slate-300">
              Half Day Leave (0.5 day)
            </label>
            {applyForm.isHalfDay && (
              <select
                value={applyForm.halfDaySession}
                onChange={(e) => setApplyForm({ ...applyForm, halfDaySession: e.target.value })}
                className="ml-auto px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg text-xs"
              >
                <option value="First Half">First Half (Morning)</option>
                <option value="Second Half">Second Half (Afternoon)</option>
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Absence *
            </label>
            <textarea
              rows={3}
              required
              placeholder="State the reason for your leave..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </form>
      </Modal>

      {/* Review Modal (Approve / Reject) */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: '', leave: null, remarks: '' })}
        title={`${actionModal.type === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
        maxWidth="max-w-md"
        footer={
          <button
            onClick={handleActionSubmit}
            className={`px-4 py-2 text-white text-xs font-bold rounded-xl ${
              actionModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            Confirm {actionModal.type === 'approve' ? 'Approval' : 'Rejection'}
          </button>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Employee: <strong>{actionModal.leave?.employee?.firstName} {actionModal.leave?.employee?.lastName}</strong> ({actionModal.leave?.days} day(s))
          </p>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reviewer Remarks / Feedback:
            </label>
            <textarea
              rows={3}
              value={actionModal.remarks}
              onChange={(e) => setActionModal({ ...actionModal, remarks: e.target.value })}
              placeholder="Optional remarks..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveListPage;
