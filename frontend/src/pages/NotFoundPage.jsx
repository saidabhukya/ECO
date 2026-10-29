import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-16 h-16 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center text-2xl font-black mb-4">
        404
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">Page Not Found</h1>
      <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm">
        The requested ECO TRACK resource or endpoint does not exist or you may not have authorization to view it.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
