import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import { ShieldAlert, Search } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        module: moduleFilter
      });
      const res = await api.get(`/audit?${params.toString()}`);
      if (res.data?.success) {
        setLogs(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, page]);

  const columns = [
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Actor',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block text-xs">
            {row.actor?.email}
          </span>
          <span className="text-[10px] font-bold text-rose-500 uppercase">
            {row.actor?.role}
          </span>
        </div>
      )
    },
    {
      header: 'Module',
      render: (row) => (
        <Badge variant="purple">{row.module}</Badge>
      )
    },
    {
      header: 'Action',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
          {row.action}
        </span>
      )
    },
    {
      header: 'Event Summary',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {row.description}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>Immutable Security Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full compliance logs recording logins, credential actions, record edits, leave decisions, and payroll finalizations.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <select
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <option value="">All Security Modules</option>
          <option value="Auth">Auth & Sessions</option>
          <option value="Employee">Employee Operations</option>
          <option value="Department">Departments</option>
          <option value="Attendance">Attendance Punches</option>
          <option value="Leave">Leave Approvals</option>
          <option value="Payroll">Payroll Actions</option>
          <option value="Settings">System Settings</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
      />

      <Pagination
        page={page}
        limit={20}
        total={totalCount}
        pages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AuditLogsPage;
