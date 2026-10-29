import React from 'react';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import Modal from './Modal';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false
}) => {
  const iconMap = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-600" />,
    warning: <AlertCircle className="w-6 h-6 text-amber-600" />,
    info: <HelpCircle className="w-6 h-6 text-blue-600" />
  };

  const btnBg = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white'
  }[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition-all ${btnBg}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 shrink-0">
          {iconMap[type]}
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
