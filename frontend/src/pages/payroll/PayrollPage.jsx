import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SalarySlipModal from '../../components/payroll/SalarySlipModal';
import {
  CreditCard,
  Plus,
  Lock,
  Check,
  Eye,
  DollarSign,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const PayrollPage = () => {
  const { role, user } = useAuth();
  const { addToast } = useNotification();
  const location = useLocation();

  const [records, setRecords] = useState([]);
  const [totals, setTotals] = useState({ totalGross: 0, totalDeductions: 0, totalNet: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Generate Payroll Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genMonth, setGenMonth] = useState(currentMonth);
  const [genYear, setGenYear] = useState(currentYear);
  const [isGenerating, setIsGenerating] = useState(false);

  // Salary Slip Modal
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const fetchPayroll = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        month,
        year,
        status,
        page,
        limit: 15
      });
      const res = await api.get(`/payroll?${params.toString()}`);
      if (res.data?.success) {
        setRecords(res.data.data);
        setTotals(res.data.totals || { totalGross: 0, totalDeductions: 0, totalNet: 0 });
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total || 0);

        // Check if query had slipId param
        const slipId = new URLSearchParams(location.search).get('slipId');
        if (slipId) {
          const match = res.data.data.find(r => r._id === slipId);
          if (match) setSelectedPayroll(match);
        }
      }
    } catch (e) {
      addToast('Failed to load payroll records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month, year, status, page]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.post('/payroll/generate', { month: genMonth, year: genYear });
      addToast(res.data?.message || 'Payroll generated successfully', 'success');
      setIsGenerateModalOpen(false);
      setMonth(genMonth);
      setYear(genYear);
      fetchPayroll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Payroll generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/payroll/${id}/approve`);
      addToast('Payroll record approved', 'success');
      fetchPayroll();
    } catch (err) {
      addToast('Failed to approve payroll', 'error');
    }
  };

  const handleFinalize = async (id) => {
    try {
      await api.post(`/payroll/${id}/finalize`);
      addToast('Payroll record finalized and locked', 'success');
      fetchPayroll();
    } catch (err) {
      addToast('Failed to finalize payroll', 'error');
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
      header: 'Pay Period',
      accessor: 'payPeriod'
    },
    {
      header: 'Gross Pay',
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          ${row.grossEarnings?.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Deductions',
      render: (row) => (
        <span className="text-rose-500 font-semibold">
          -${row.totalDeductions?.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Net Pay',
      render: (row) => (
        <span className="font-black text-emerald-600 dark:text-emerald-400">
          ${row.netPay?.toLocaleString()}
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
          <button
            onClick={() => setSelectedPayroll(row)}
            title="View Salary Slip & PDF"
            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Approve Draft */}
          {['ADMIN', 'HR'].includes(role) && row.status === 'Draft' && (
            <button
              onClick={() => handleApprove(row._id)}
              title="Approve Draft"
              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40"
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          {/* Finalize Lock (Admin Only) */}
          {role === 'ADMIN' && row.status === 'Approved' && (
            <button
              onClick={() => handleFinalize(row._id)}
              title="Finalize & Lock"
              className="p-1.5 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Payroll & Salary Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prepare monthly payroll cycles, review deductions, finalize disbursements, and print salary slips.
          </p>
        </div>

        {['ADMIN', 'HR'].includes(role) && (
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Monthly Payroll</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Gross Earnings</span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            ${totals.totalGross?.toLocaleString()}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Statutory Deductions</span>
          <div className="mt-2 text-2xl font-black text-rose-500">
            -${totals.totalDeductions?.toLocaleString()}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Net Disbursed</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            ${totals.totalNet?.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => {
              setMonth(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setPage(1);
            }}
            className="w-24 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Review">Review</option>
            <option value="Approved">Approved</option>
            <option value="Finalized">Finalized (Locked)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        onRowClick={(row) => setSelectedPayroll(row)}
      />

      <Pagination
        page={page}
        limit={15}
        total={totalCount}
        pages={totalPages}
        onPageChange={setPage}
      />

      {/* Generate Payroll Wizard Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Batch Generate Monthly Payroll"
        subtitle="Calculates gross earnings, attendance overtime, and statutory deductions for all active staff"
        maxWidth="max-w-md"
        footer={
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            {isGenerating ? 'Calculating Payroll...' : 'Start Calculation'}
          </button>
        }
      >
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Month
            </label>
            <select
              value={genMonth}
              onChange={(e) => setGenMonth(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Year
            </label>
            <input
              type="number"
              value={genYear}
              onChange={(e) => setGenYear(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[11px] leading-relaxed">
            Note: Generating payroll will prepare calculation drafts. Locked finalized periods cannot be modified.
          </div>
        </form>
      </Modal>

      {/* Salary Slip Modal */}
      <SalarySlipModal
        isOpen={!!selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
        payroll={selectedPayroll}
      />
    </div>
  );
};

export default PayrollPage;
