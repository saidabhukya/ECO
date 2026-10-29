import React from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns,
  data = [],
  isLoading = false,
  emptyMessage = 'No records found',
  emptySubtext,
  onRowClick
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-4">
        <Skeleton count={6} height="h-10" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <EmptyState title={emptyMessage} subtitle={emptySubtext} />
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, rowIdx) => (
              <tr
                key={row._id || row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-5 py-4 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
