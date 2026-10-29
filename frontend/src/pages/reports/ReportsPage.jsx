import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { BarChart3, Download, Calendar, Filter, FileSpreadsheet, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const ReportsPage = () => {
  const { role } = useAuth();
  const { addToast } = useNotification();

  const [reportType, setReportType] = useState('employees'); // 'employees' | 'attendance' | 'leaves' | 'payroll'
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch (e) {}
  };

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedDept) params.append('department', selectedDept);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/reports/${reportType}?${params.toString()}`);
      if (res.data?.success) {
        setData(res.data.data || []);
      }
    } catch (err) {
      addToast('Failed to fetch report data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedDept, startDate, endDate]);

  const handleExportExcel = () => {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);
    XLSX.writeFile(wb, `ECO_TRACK_${reportType}_report.xlsx`);
    addToast('Report exported as Excel workbook', 'success');
  };

  const handleExportPDF = () => {
    if (data.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`ECO TRACK — ${reportType.toUpperCase()} REPORT`, 14, 18);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()} | Official Enterprise Record`, 14, 25);

    let head = [];
    let body = [];

    if (reportType === 'employees') {
      head = [['ID', 'Name', 'Department', 'Designation', 'Status', 'Joined']];
      body = data.map(d => [
        d.employeeId,
        `${d.firstName} ${d.lastName}`,
        d.department?.name || '',
        d.designation?.title || '',
        d.employmentStatus,
        new Date(d.joiningDate).toLocaleDateString()
      ]);
    } else if (reportType === 'attendance') {
      head = [['Employee', 'Work Date', 'Status', 'Check In', 'Check Out', 'Hours']];
      body = data.map(d => [
        `${d.employee?.firstName || ''} ${d.employee?.lastName || ''}`,
        d.workDate,
        d.status,
        d.checkIn ? new Date(d.checkIn).toLocaleTimeString() : '-',
        d.checkOut ? new Date(d.checkOut).toLocaleTimeString() : '-',
        `${d.workingHours || 0}h`
      ]);
    } else if (reportType === 'leaves') {
      head = [['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status']];
      body = data.map(d => [
        `${d.employee?.firstName || ''} ${d.employee?.lastName || ''}`,
        d.leaveType?.name || '',
        new Date(d.startDate).toLocaleDateString(),
        new Date(d.endDate).toLocaleDateString(),
        d.days,
        d.status
      ]);
    } else if (reportType === 'payroll') {
      head = [['Employee', 'Period', 'Gross', 'Deductions', 'Net Pay', 'Status']];
      body = data.map(d => [
        `${d.employee?.firstName || ''} ${d.employee?.lastName || ''}`,
        d.payPeriod,
        `$${d.grossEarnings?.toLocaleString()}`,
        `-$${d.totalDeductions?.toLocaleString()}`,
        `$${d.netPay?.toLocaleString()}`,
        d.status
      ]);
    }

    doc.autoTable({
      head: head,
      body: body,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] }
    });

    doc.save(`ECO_TRACK_${reportType}_report.pdf`);
    addToast('Report generated as PDF', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Executive Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-grade business intelligence across headcount, attendance adherence, leave, and payroll.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Report Module Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { key: 'employees', label: 'Employee Headcount' },
          { key: 'attendance', label: 'Attendance Audit' },
          { key: 'leaves', label: 'Leave Utilization' },
          { key: 'payroll', label: 'Payroll Outlay', hidden: !['ADMIN', 'HR'].includes(role) }
        ].filter(t => !t.hidden).map((t) => (
          <button
            key={t.key}
            onClick={() => setReportType(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === t.key ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
            Department
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>

        {(startDate || endDate || selectedDept) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSelectedDept('');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Result Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Found <strong>{data.length}</strong> matching records</span>
      </div>

      {/* Dynamic Data Table preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm p-4">
        {data.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No records match the selected date range and department filter.</p>
        ) : (
          <div className="text-xs space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Previewing first 10 rows:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase text-slate-400">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Record Identifier</th>
                    <th className="p-2">Details</th>
                    <th className="p-2">Status / Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2 text-slate-400">{idx + 1}</td>
                      <td className="p-2 font-bold font-mono text-slate-900 dark:text-white">
                        {row.employeeId || row.workDate || row.payPeriod || 'REC'}
                      </td>
                      <td className="p-2 text-slate-600 dark:text-slate-300">
                        {row.firstName ? `${row.firstName} ${row.lastName}` : row.employee?.firstName ? `${row.employee.firstName} ${row.employee.lastName}` : row.reason || row.name || '-'}
                      </td>
                      <td className="p-2 font-semibold">
                        {row.netPay ? `$${row.netPay?.toLocaleString()}` : row.status || row.employmentStatus || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
