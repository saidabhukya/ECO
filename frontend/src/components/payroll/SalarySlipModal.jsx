import React, { useRef } from 'react';
import Modal from '../common/Modal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, Download, Building2, ShieldCheck } from 'lucide-react';

export const SalarySlipModal = ({ isOpen, onClose, payroll }) => {
  const slipRef = useRef(null);

  if (!payroll) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!slipRef.current) return;
    try {
      const canvas = await html2canvas(slipRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ECO_TRACK_Salary_Slip_${payroll.employee?.employeeId}_${payroll.payPeriod}.pdf`);
    } catch (e) {
      console.error('Failed to export PDF salary slip:', e);
    }
  };

  const emp = payroll.employee || {};
  const earnings = payroll.earnings || {};
  const deductions = payroll.deductions || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Salary Statement & Payslip"
      subtitle={`Official salary disbursement statement for pay period ${payroll.payPeriod}`}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </>
      }
    >
      <div className="p-2 sm:p-4">
        {/* Printable Payslip Sheet */}
        <div
          ref={slipRef}
          className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md font-sans"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-rose-600 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-extrabold text-sm">
                  E
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  ECO <span className="text-rose-600">TRACK</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Track Employees. Manage Work. Drive Performance.
              </p>
              <p className="text-[10px] text-slate-400">
                100 Innovation Boulevard, Suite 500, San Francisco, CA
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 uppercase tracking-widest">
                Salary Statement
              </span>
              <p className="text-xs font-bold text-rose-600 mt-1">
                Pay Period: {payroll.payPeriod}
              </p>
              <p className="text-[10px] text-slate-400">
                Generated: {new Date(payroll.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Employee Info</span>
              <strong className="text-sm font-extrabold text-slate-900 block mt-0.5">
                {emp.firstName} {emp.lastName}
              </strong>
              <span className="text-slate-600 block">ID: {emp.employeeId}</span>
              <span className="text-slate-600 block">Dept: {emp.department?.name || 'Engineering'}</span>
              <span className="text-slate-600 block">Role: {emp.designation?.title || 'Staff Member'}</span>
            </div>

            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Payment Details</span>
              <span className="text-slate-600 block mt-1">Status: <strong className="text-emerald-600">{payroll.status} ({payroll.paymentStatus})</strong></span>
              <span className="text-slate-600 block">Method: {payroll.paymentMethod || 'Direct Deposit'}</span>
              <span className="text-slate-600 block">Worked Days: {payroll.attendanceSummary?.presentDays || 22} / {payroll.attendanceSummary?.workingDays || 22}</span>
              <span className="text-slate-600 block">Overtime: {payroll.attendanceSummary?.overtimeHours || 0} hrs</span>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown Tables */}
          <div className="grid grid-cols-2 gap-6 my-4 text-xs">
            {/* Earnings */}
            <div>
              <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2 border-b border-slate-200 pb-1 text-emerald-700">
                Earnings Breakdown
              </h5>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Basic Salary</span>
                  <span className="font-semibold text-slate-800">${earnings.basicSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-slate-800">${earnings.hra?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conveyance Allowance</span>
                  <span className="font-semibold text-slate-800">${earnings.conveyanceAllowance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medical Allowance</span>
                  <span className="font-semibold text-slate-800">${earnings.medicalAllowance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Special Allowance</span>
                  <span className="font-semibold text-slate-800">${earnings.specialAllowance?.toLocaleString()}</span>
                </div>
                {earnings.overtimePay > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Overtime Pay</span>
                    <span className="font-semibold">${earnings.overtimePay?.toLocaleString()}</span>
                  </div>
                )}
                {earnings.bonus > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Performance Bonus</span>
                    <span className="font-semibold">${earnings.bonus?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2 border-b border-slate-200 pb-1 text-rose-700">
                Deductions Breakdown
              </h5>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Provident Fund (PF)</span>
                  <span className="font-semibold text-slate-800">${deductions.providentFund?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Income Tax / TDS</span>
                  <span className="font-semibold text-slate-800">${deductions.taxDeduction?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medical Insurance</span>
                  <span className="font-semibold text-slate-800">${deductions.insuranceDeduction?.toLocaleString()}</span>
                </div>
                {deductions.unpaidLeaveDeductions > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Unpaid Leave</span>
                    <span className="font-semibold">${deductions.unpaidLeaveDeductions?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Totals */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-700">
              <span className="font-semibold">Gross Total Earnings:</span>
              <span className="font-bold">${payroll.grossEarnings?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span className="font-semibold">Total Employee Deductions:</span>
              <span className="font-bold">-${payroll.totalDeductions?.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>Net Take-Home Pay ({payroll.currency || 'USD'}):</span>
              <span className="text-emerald-600">${payroll.netPay?.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <div>
              <p>Generated by: <strong>ECO TRACK Payroll Service</strong></p>
              <p>Confidential corporate statement</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700">Authorized Signatory</p>
              <p>Finance & Payroll Department</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SalarySlipModal;
