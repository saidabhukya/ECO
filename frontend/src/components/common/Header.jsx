import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header = ({ onMenuClick }) => {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, addToast } = useNotification();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch today's attendance for quick check-in button
  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data?.success) {
        setTodayAttendance(res.data.data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleQuickCheckIn = async () => {
    setCheckingAttendance(true);
    try {
      const res = await api.post('/attendance/check-in');
      if (res.data?.success) {
        setTodayAttendance(res.data.data);
        addToast(res.data.message || 'Checked in successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setCheckingAttendance(false);
    }
  };

  const handleQuickCheckOut = async () => {
    setCheckingAttendance(true);
    try {
      const res = await api.post('/attendance/check-out');
      if (res.data?.success) {
        setTodayAttendance(res.data.data);
        addToast(res.data.message || 'Checked out successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setCheckingAttendance(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Hamburger & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employees, ID, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Check-In / Check-Out Widget */}
        <div className="hidden md:flex items-center">
          {!todayAttendance || !todayAttendance.checkIn ? (
            <button
              onClick={handleQuickCheckIn}
              disabled={checkingAttendance}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{checkingAttendance ? 'Checking in...' : 'Quick Check In'}</span>
            </button>
          ) : !todayAttendance.checkOut ? (
            <button
              onClick={handleQuickCheckOut}
              disabled={checkingAttendance}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{checkingAttendance ? 'Checking out...' : 'Check Out'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Day Complete ({todayAttendance.workingHours || 0} hrs)</span>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-rose-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        !n.isRead ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-700 flex items-center justify-center text-white text-xs font-bold">
              {user?.employee?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {user?.employee?.firstName ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                {user?.employeeId || role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 py-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.email}
                </p>
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">
                  Role: {role}
                </p>
              </div>

              {user?.employee && (
                <Link
                  to={`/employees/${user.employee._id}`}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
