import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Boxes, Plus, CheckCircle, RotateCcw, UserPlus } from 'lucide-react';

export const AssetPage = () => {
  const { role } = useAuth();
  const { addToast } = useNotification();

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Register Asset Modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    assetId: '',
    name: '',
    category: 'Laptop',
    serialNumber: '',
    purchaseCost: 0,
    status: 'Available',
    notes: ''
  });

  // Assign Asset Modal
  const [assignModal, setAssignModal] = useState({ isOpen: false, asset: null, employeeId: '', notes: '' });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [astRes, empRes] = await Promise.all([
        api.get(`/assets?category=${categoryFilter}&status=${statusFilter}`),
        api.get('/employees?limit=100')
      ]);
      if (astRes.data?.success) setAssets(astRes.data.data);
      if (empRes.data?.success) setEmployees(empRes.data.data);
    } catch (e) {
      addToast('Failed to load asset inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, statusFilter]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets', registerForm);
      addToast('Asset registered into inventory', 'success');
      setIsRegisterModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to register asset', 'error');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignModal.asset || !assignModal.employeeId) return;
    try {
      await api.post(`/assets/${assignModal.asset._id}/assign`, {
        employeeId: assignModal.employeeId,
        notes: assignModal.notes
      });
      addToast('Asset assigned successfully', 'success');
      setAssignModal({ isOpen: false, asset: null, employeeId: '', notes: '' });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to assign asset', 'error');
    }
  };

  const handleReturn = async (assetId) => {
    try {
      await api.post(`/assets/${assetId}/return`, { conditionOnReturn: 'Good condition' });
      addToast('Asset returned to available pool', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to return asset', 'error');
    }
  };

  const columns = [
    {
      header: 'Asset ID',
      render: (row) => (
        <span className="font-mono font-bold text-rose-500">
          {row.assetId}
        </span>
      )
    },
    {
      header: 'Item Name & Category',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">
            {row.name}
          </span>
          <span className="text-xs text-slate-400">
            {row.category} • SN: {row.serialNumber}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'Assigned Employee',
      render: (row) => (
        row.assignedEmployee ? (
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
              {row.assignedEmployee.firstName} {row.assignedEmployee.lastName}
            </span>
            <span className="text-[10px] text-slate-400">
              {row.assignedEmployee.employeeId} • {row.assignedEmployee.department?.name || ''}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Unassigned (In Stock)</span>
        )
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'Available' ? (
            <button
              onClick={() => setAssignModal({ isOpen: true, asset: row, employeeId: '', notes: '' })}
              className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-semibold rounded-lg hover:bg-rose-100"
            >
              Assign
            </button>
          ) : row.status === 'Assigned' ? (
            <button
              onClick={() => handleReturn(row._id)}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200"
            >
              Mark Returned
            </button>
          ) : null}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Company Asset Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hardware inventory, serial tracking, employee allocations, and returns lifecycle.
          </p>
        </div>

        {['ADMIN', 'HR'].includes(role) && (
          <button
            onClick={() => {
              setRegisterForm({
                assetId: `AST-${Math.floor(100 + Math.random() * 900)}`,
                name: '',
                category: 'Laptop',
                serialNumber: '',
                purchaseCost: 0,
                status: 'Available',
                notes: ''
              });
              setIsRegisterModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <option value="">All Categories</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Mobile Phone">Mobile Phone</option>
            <option value="Access Card">Access Card</option>
            <option value="Peripherals">Peripherals</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available (In Stock)</option>
            <option value="Assigned">Assigned</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={assets}
        isLoading={isLoading}
      />

      {/* Register Asset Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Company Asset"
        maxWidth="max-w-md"
        footer={
          <button
            onClick={handleRegister}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
          >
            Register Asset
          </button>
        }
      >
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Asset ID *</label>
              <input
                type="text"
                required
                value={registerForm.assetId}
                onChange={(e) => setRegisterForm({ ...registerForm, assetId: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Category *</label>
              <select
                value={registerForm.category}
                onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Mobile Phone">Mobile Phone</option>
                <option value="Access Card">Access Card</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Asset Model / Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. MacBook Pro 16 M3 Max"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Serial Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. C02G8712MD6T"
              value={registerForm.serialNumber}
              onChange={(e) => setRegisterForm({ ...registerForm, serialNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Purchase Cost ($)</label>
            <input
              type="number"
              value={registerForm.purchaseCost}
              onChange={(e) => setRegisterForm({ ...registerForm, purchaseCost: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, asset: null, employeeId: '', notes: '' })}
        title={`Assign Asset (${assignModal.asset?.assetId})`}
        maxWidth="max-w-md"
        footer={
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
          >
            Confirm Assignment
          </button>
        }
      >
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Employee *</label>
            <select
              required
              value={assignModal.employeeId}
              onChange={(e) => setAssignModal({ ...assignModal, employeeId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Handover Notes</label>
            <textarea
              rows={3}
              placeholder="Device condition, included chargers, accessories..."
              value={assignModal.notes}
              onChange={(e) => setAssignModal({ ...assignModal, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetPage;
