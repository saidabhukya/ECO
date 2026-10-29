import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import EmployeeModal from '../../components/employee/EmployeeModal';
import IdCardModal from '../../components/employee/IdCardModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  UserPlus,
  Search,
  Filter,
  Download,
  CreditCard,
  Edit,
  Eye,
  UserX,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export const EmployeeListPage = () => {
  const { role } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [idCardEmployee, setIdCardEmployee] = useState(null);
  const [statusEmployee, setStatusEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        search,
        department,
        status,
        employmentType
      });

      const res = await api.get(`/employees?${params.toString()}`);
      if (res.data?.success) {
        setEmployees(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch employees', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data?.success) {
        setDepartments(res.data.data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, limit, department, status, employmentType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleExportXLSX = () => {
    if (employees.length === 0) return;
    const exportData = employees.map((emp) => ({
      'Employee ID': emp.employeeId,
      'First Name': emp.firstName,
      'Last Name': emp.lastName,
      'Email': emp.email,
      'Contact Number': emp.contactNumber,
      'Department': emp.department?.name || '',
      'Designation': emp.designation?.title || '',
      'Status': emp.employmentStatus,
      'Employment Type': emp.employmentType,
      'Work Location': emp.workLocation,
      'Joining Date': new Date(emp.joiningDate).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, `ECO_TRACK_Employees_${new Date().toISOString().split('T')[0]}.xlsx`);
    addToast('Employee roster exported to Excel successfully', 'success');
  };

  const handleToggleStatus = async () => {
    if (!statusEmployee) return;
    const newStatus = statusEmployee.employmentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.patch(`/employees/${statusEmployee._id}/status`, {
        status: newStatus,
        isArchived: newStatus === 'Inactive'
      });
      if (res.data?.success) {
        addToast(`Employee status updated to ${newStatus}`, 'success');
        fetchEmployees();
      }
    } catch (err) {
      addToast('Failed to change employee status', 'error');
    } finally {
      setStatusEmployee(null);
    }
  };

  const columns = [
    {
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
            {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
          </div>
          <div>
            <span className="block font-bold text-slate-900 dark:text-white leading-tight">
              {row.firstName} {row.lastName}
            </span>
            <span className="block text-xs font-mono text-rose-600 dark:text-rose-400">
              {row.employeeId}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Department & Role',
      render: (row) => (
        <div>
          <span className="block font-medium text-slate-800 dark:text-slate-200">
            {row.department?.name || 'Unassigned'}
          </span>
          <span className="block text-xs text-slate-400">
            {row.designation?.title || row.employmentType}
          </span>
        </div>
      )
    },
    {
      header: 'Contact Info',
      render: (row) => (
        <div>
          <span className="block text-xs text-slate-700 dark:text-slate-300">
            {row.email}
          </span>
          <span className="block text-[11px] text-slate-400">
            {row.contactNumber}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.employmentStatus} />
    },
    {
      header: 'Shift & Location',
      render: (row) => (
        <div>
          <span className="block text-xs text-slate-700 dark:text-slate-300">
            {row.shift?.name || 'Standard Morning'}
          </span>
          <span className="block text-[11px] text-slate-400">
            {row.workLocation}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* View Profile */}
          <button
            onClick={() => navigate(`/employees/${row._id}`)}
            title="View Full Profile"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* ID Card Generator */}
          <button
            onClick={() => setIdCardEmployee(row)}
            title="Generate Printable ID Card"
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <CreditCard className="w-4 h-4" />
          </button>

          {/* Edit (Admin/HR only) */}
          {['ADMIN', 'HR'].includes(role) && (
            <button
              onClick={() => {
                setSelectedEmployee(row);
                setIsEmployeeModalOpen(true);
              }}
              title="Edit Employee"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {/* Deactivate Toggle (Admin/HR only) */}
          {['ADMIN', 'HR'].includes(role) && (
            <button
              onClick={() => setStatusEmployee(row)}
              title={row.employmentStatus === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              {row.employmentStatus === 'Active' ? (
                <UserX className="w-4 h-4" />
              ) : (
                <UserCheck className="w-4 h-4 text-emerald-500" />
              )}
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Employee Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage profiles, assign departments, generate badges, and track organizational rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Roster</span>
          </button>

          {['ADMIN', 'HR'].includes(role) && (
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setIsEmployeeModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-900/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>

          {/* Type Filter */}
          <select
            value={employmentType}
            onChange={(e) => {
              setEmploymentType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/employees/${row._id}`)}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        limit={limit}
        total={totalCount}
        pages={totalPages}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSaved={fetchEmployees}
        employee={selectedEmployee}
      />

      {/* ID Card Modal */}
      <IdCardModal
        isOpen={!!idCardEmployee}
        onClose={() => setIdCardEmployee(null)}
        employee={idCardEmployee}
      />

      {/* Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!statusEmployee}
        onClose={() => setStatusEmployee(null)}
        onConfirm={handleToggleStatus}
        title={statusEmployee?.employmentStatus === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}
        message={`Are you sure you want to change status for ${statusEmployee?.firstName} ${statusEmployee?.lastName} (${statusEmployee?.employeeId})? Historical attendance and payroll records will be preserved.`}
        confirmText={statusEmployee?.employmentStatus === 'Active' ? 'Deactivate' : 'Activate'}
        type={statusEmployee?.employmentStatus === 'Active' ? 'danger' : 'info'}
      />
    </div>
  );
};

export default EmployeeListPage;
