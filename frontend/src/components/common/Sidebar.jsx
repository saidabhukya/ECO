import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  CalendarCheck,
  CreditCard,
  Target,
  FileText,
  Boxes,
  BarChart3,
  ShieldAlert,
  Settings,
  X,
  LogOut
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
    },
    {
      label: 'Employees',
      path: '/employees',
      icon: Users,
      roles: ['ADMIN', 'HR', 'MANAGER']
    },
    {
      label: 'Departments',
      path: '/departments',
      icon: Building2,
      roles: ['ADMIN', 'HR']
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: Clock,
      roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
    },
    {
      label: 'Shifts & Holidays',
      path: '/shifts',
      icon: CalendarDays,
      roles: ['ADMIN', 'HR']
    },
    {
      label: 'Leave Management',
      path: '/leave',
      icon: CalendarCheck,
      roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
    },
    {
      label: 'Payroll',
      path: '/payroll',
      icon: CreditCard,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'] // Employees can view their salary slips
    },
    {
      label: 'Performance & Goals',
      path: '/performance',
      icon: Target,
      roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
    },
    {
      label: 'Documents',
      path: '/documents',
      icon: FileText,
      roles: ['ADMIN', 'HR', 'EMPLOYEE']
    },
    {
      label: 'Assets',
      path: '/assets',
      icon: Boxes,
      roles: ['ADMIN', 'HR']
    },
    {
      label: 'Reports & Analytics',
      path: '/reports',
      icon: BarChart3,
      roles: ['ADMIN', 'HR', 'MANAGER']
    },
    {
      label: 'Audit Logs',
      path: '/audit-logs',
      icon: ShieldAlert,
      roles: ['ADMIN']
    },
    {
      label: 'System Settings',
      path: '/settings',
      icon: Settings,
      roles: ['ADMIN']
    }
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-rose-900/30">
              E
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-wider flex items-center gap-1">
                ECO <span className="text-rose-500">TRACK</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-tight">
                Enterprise HR Suite
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-bold text-white border border-slate-700">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.employee?.firstName ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout bottom action */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
