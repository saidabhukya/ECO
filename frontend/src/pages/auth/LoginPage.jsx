import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Sun, Moon } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const expired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email address and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset loader for reviewing all 4 roles
  const loadDemoRole = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-700/20 rounded-full blur-3xl pointer-events-none" />

      {/* Theme toggle in top right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Logo & Name */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 shadow-xl shadow-rose-900/40 text-white font-extrabold text-2xl mb-4">
            E
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            ECO <span className="text-rose-500">TRACK</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            Track Employees. Manage Work. Drive Performance.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-slate-800/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-700/80 shadow-2xl">
          {expired && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
              Your previous session expired. Please sign in to resume.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to ECO TRACK'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Quick Role Presets (One-Click)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loadDemoRole('admin@ecotrack.internal', 'Admin@Eco2026')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-slate-300 font-semibold text-left transition-colors flex items-center justify-between"
              >
                <span>👑 Admin</span>
                <span className="text-[9px] text-rose-400 font-mono">fill</span>
              </button>
              <button
                type="button"
                onClick={() => loadDemoRole('hr@ecotrack.internal', 'Hr@Eco2026')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-slate-300 font-semibold text-left transition-colors flex items-center justify-between"
              >
                <span>👥 HR</span>
                <span className="text-[9px] text-rose-400 font-mono">fill</span>
              </button>
              <button
                type="button"
                onClick={() => loadDemoRole('manager@ecotrack.internal', 'Manager@Eco2026')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-slate-300 font-semibold text-left transition-colors flex items-center justify-between"
              >
                <span>👔 Manager</span>
                <span className="text-[9px] text-rose-400 font-mono">fill</span>
              </button>
              <button
                type="button"
                onClick={() => loadDemoRole('alex@ecotrack.internal', 'Employee@Eco2026')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-slate-300 font-semibold text-left transition-colors flex items-center justify-between"
              >
                <span>💻 Employee</span>
                <span className="text-[9px] text-rose-400 font-mono">fill</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Protected with bcrypt hashing & JWT enterprise security</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
