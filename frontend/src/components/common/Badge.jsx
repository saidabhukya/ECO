import React from 'react';

const variantClasses = {
  // Positive / Active / Present / Approved
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  // Warning / Late / Pending
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  // Danger / Absent / Rejected / Terminated
  danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  // Info / Leave / Assigned
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  // Neutral / Draft / Inactive
  neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  // Purple / Role badges
  purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
};

const statusMapping = {
  'Active': 'success',
  'Present': 'success',
  'Approved': 'success',
  'Finalized': 'success',
  'Paid': 'success',
  'Available': 'success',
  'Completed': 'success',

  'Late': 'warning',
  'Pending': 'warning',
  'Review': 'warning',
  'Half Day': 'warning',
  'In Progress': 'warning',
  'Under Maintenance': 'warning',

  'Absent': 'danger',
  'Rejected': 'danger',
  'Terminated': 'danger',
  'Cancelled': 'danger',
  'Overdue': 'danger',

  'On Approved Leave': 'info',
  'On Leave': 'info',
  'Assigned': 'info',

  'Inactive': 'neutral',
  'Resigned': 'neutral',
  'Draft': 'neutral',
  'Not Started': 'neutral',
  'Retired': 'neutral',

  'ADMIN': 'danger',
  'HR': 'purple',
  'MANAGER': 'info',
  'EMPLOYEE': 'neutral'
};

export const Badge = ({ children, status, variant, className = '' }) => {
  const resolvedVariant = variant || (status ? statusMapping[status] : 'neutral') || 'neutral';
  const classes = variantClasses[resolvedVariant] || variantClasses.neutral;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${classes} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {children || status}
    </span>
  );
};

export default Badge;
