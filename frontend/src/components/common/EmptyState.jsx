import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  subtitle = 'Try adjusting your search filters or add a new record to get started.',
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
        {subtitle}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
