import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tokenHint, setTokenHint] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.resetToken) {
        setTokenHint(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Enter your corporate email address to receive password reset instructions.
          </p>
        </div>

        <div className="mt-6 bg-slate-800/90 py-8 px-6 sm:px-10 rounded-3xl border border-slate-700 shadow-2xl">
          {message && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              {message}
              {tokenHint && (
                <div className="mt-3 pt-2 border-t border-emerald-500/20">
                  <p className="font-bold">Development Token:</p>
                  <code className="text-[11px] bg-slate-900 px-2 py-1 rounded block mt-1 break-all select-all">
                    {tokenHint}
                  </code>
                  <Link
                    to={`/reset-password?token=${tokenHint}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    <span>Proceed to Reset Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@ecotrack.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              {isLoading ? 'Sending Request...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
