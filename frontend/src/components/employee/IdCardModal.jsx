import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Modal } from '../common/Modal';
import { Printer, Download, Sparkles } from 'lucide-react';

export const IdCardModal = ({ isOpen, onClose, employee }) => {
  const cardRef = useRef(null);

  if (!employee) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', [85.6, 53.98]); // Standard CR80 ID Card dimensions
      pdf.addImage(imgData, 'PNG', 0, 0, 53.98, 85.6);
      pdf.save(`${employee.employeeId}_ID_Card.pdf`);
    } catch (err) {
      console.error('Failed to export PDF ID card:', err);
    }
  };

  // Safe QR payload containing verification URL rather than sensitive plaintext data
  const qrPayload = `https://ecotrack.internal/verify-credential?id=${encodeURIComponent(employee.employeeId)}&emp=${encodeURIComponent(employee._id)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee ID Card Generator"
      subtitle="Printable badge with embedded verification QR code"
      maxWidth="max-w-lg"
      footer={
        <>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Badge</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center justify-center p-4">
        {/* Printable Card Element */}
        <div
          ref={cardRef}
          className="w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border-2 border-rose-600/40 relative p-6 flex flex-col items-center text-center"
        >
          {/* Top header accent */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-rose-600 via-red-500 to-rose-700" />

          {/* Company Brand */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white font-extrabold text-xs">
              E
            </div>
            <span className="text-sm font-black tracking-wider text-white">
              ECO <span className="text-rose-500">TRACK</span>
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">
            Official Employee Identity Card
          </span>

          {/* Photo / Avatar */}
          <div className="mt-5 relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 p-1 border-2 border-rose-500/50 shadow-md flex items-center justify-center overflow-hidden">
              {employee.profilePhoto ? (
                <img
                  src={employee.profilePhoto}
                  alt={employee.fullName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-2xl font-black text-rose-400">
                  {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow">
              {employee.employmentStatus || 'Active'}
            </div>
          </div>

          {/* Name & Title */}
          <div className="mt-4">
            <h3 className="text-base font-extrabold text-white tracking-tight">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-xs font-semibold text-rose-400 mt-0.5">
              {employee.designation?.title || 'Team Member'}
            </p>
            <p className="text-[11px] text-slate-400">
              {employee.department?.name || 'Operations'}
            </p>
          </div>

          {/* Employee ID Chip */}
          <div className="mt-3 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono font-bold text-white tracking-widest">
            {employee.employeeId}
          </div>

          {/* Details Table */}
          <div className="mt-4 w-full grid grid-cols-2 gap-2 text-left text-[10px] bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="block text-slate-400">Joining Date:</span>
              <span className="font-semibold text-slate-200">
                {new Date(employee.joiningDate).toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="block text-slate-400">Type:</span>
              <span className="font-semibold text-slate-200">{employee.employmentType || 'Full-time'}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-4 p-2 bg-white rounded-xl shadow-md">
            <QRCodeSVG value={qrPayload} size={64} level="M" />
          </div>
          <span className="text-[8px] text-slate-400 mt-1">Scan for Digital Verification</span>

          {/* Authorized Signature Line */}
          <div className="mt-4 w-full pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-400">
            <span>Auth Sign: <em>M. Vance</em></span>
            <span>ECO TRACK HQ</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default IdCardModal;
