import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Module Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import EmployeeListPage from './pages/employees/EmployeeListPage';
import EmployeeProfilePage from './pages/employees/EmployeeProfilePage';
import DepartmentListPage from './pages/departments/DepartmentListPage';
import AttendancePage from './pages/attendance/AttendancePage';
import ShiftHolidayPage from './pages/shifts/ShiftHolidayPage';
import LeaveListPage from './pages/leave/LeaveListPage';
import PayrollPage from './pages/payroll/PayrollPage';
import PerformancePage from './pages/performance/PerformancePage';
import DocumentPage from './pages/documents/DocumentPage';
import AssetPage from './pages/assets/AssetPage';
import ReportsPage from './pages/reports/ReportsPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Enterprise Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Employees */}
        <Route
          path="employees"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
              <EmployeeListPage />
            </ProtectedRoute>
          }
        />
        <Route path="employees/:id" element={<EmployeeProfilePage />} />

        {/* Departments & Hierarchy */}
        <Route
          path="departments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
              <DepartmentListPage />
            </ProtectedRoute>
          }
        />

        {/* Attendance & Shifts */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route
          path="shifts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
              <ShiftHolidayPage />
            </ProtectedRoute>
          }
        />

        {/* Leaves */}
        <Route path="leave" element={<LeaveListPage />} />

        {/* Payroll */}
        <Route
          path="payroll"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'EMPLOYEE']}>
              <PayrollPage />
            </ProtectedRoute>
          }
        />

        {/* Performance */}
        <Route path="performance" element={<PerformancePage />} />

        {/* Documents */}
        <Route path="documents" element={<DocumentPage />} />

        {/* Assets */}
        <Route
          path="assets"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
              <AssetPage />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Audit Logs */}
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
