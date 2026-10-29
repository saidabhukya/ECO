import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'red',
  onClick
}) => {
  const colorSchemes = {
    red: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
  };

  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md ${
        isClickable ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorSchemes[color] || colorSchemes.red}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              trendDirection === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trendDirection === 'up' ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
