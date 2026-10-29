import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  page = 1,
  limit = 10,
  total = 0,
  pages = 1,
  onPageChange,
  onLimitChange
}) => {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-2">
        <span>
          Showing <strong className="font-semibold text-slate-700 dark:text-slate-200">{startItem}</strong> to{' '}
          <strong className="font-semibold text-slate-700 dark:text-slate-200">{endItem}</strong> of{' '}
          <strong className="font-semibold text-slate-700 dark:text-slate-200">{total}</strong> results
        </span>

        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="ml-3 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-200">
          {page} of {Math.max(1, pages)}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
