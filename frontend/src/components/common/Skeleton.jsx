import React from 'react';

export const Skeleton = ({ count = 3, height = 'h-4', className = '' }) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`w-full bg-slate-200 dark:bg-slate-800 rounded-xl ${height}`}
        />
      ))}
    </div>
  );
};

export default Skeleton;
