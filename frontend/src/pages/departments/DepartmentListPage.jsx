import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Building2, Plus, Users, Edit, Trash2 } from 'lucide-react';

export const DepartmentListPage = () => {
  const { role } = useAuth();
  const { addToast } = useNotification();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', headOfDepartment: '' });

  const [deleteDept, setDeleteDept] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees?limit=100')
      ]);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (empRes.data?.success) setEmployees(empRes.data.data);
    } catch (err) {
      addToast('Failed to load departments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setSelectedDept(null);
    setFormData({ name: '', code: '', description: '', headOfDepartment: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (d) => {
    setSelectedDept(d);
    setFormData({
      name: d.name,
      code: d.code,
      description: d.description || '',
      headOfDepartment: d.headOfDepartment?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedDept) {
        await api.put(`/departments/${selectedDept._id}`, formData);
        addToast('Department updated successfully', 'success');
      } else {
        await api.post('/departments', formData);
        addToast('Department created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save department', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteDept) return;
    try {
      await api.delete(`/departments/${deleteDept._id}`);
      addToast('Department deleted successfully', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Cannot delete department', 'error');
    } finally {
      setDeleteDept(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Departments & Units
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure company hierarchy, departments, heads of department, and active rosters.
          </p>
        </div>

        {['ADMIN', 'HR'].includes(role) && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        )}
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {dept.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-rose-600 uppercase">
                      Code: {dept.code}
                    </span>
                  </div>
                </div>

                {['ADMIN', 'HR'].includes(role) && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {role === 'ADMIN' && (
                      <button
                        onClick={() => setDeleteDept(dept)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {dept.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{dept.employeeCount || 0} Employees</span>
              </div>

              <span className="text-[11px] text-slate-400">
                Head: <strong className="text-slate-700 dark:text-slate-200">{dept.headOfDepartment ? `${dept.headOfDepartment.firstName} ${dept.headOfDepartment.lastName}` : 'Unassigned'}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDept ? 'Edit Department' : 'Create New Department'}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              Save Department
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Quality Assurance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. QA"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Head of Department
            </label>
            <select
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="">None / To be assigned</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Department purpose and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDept}
        onClose={() => setDeleteDept(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete ${deleteDept?.name}? You will only be allowed to delete if there are zero assigned active employees.`}
        confirmText="Delete Department"
        type="danger"
      />
    </div>
  );
};

export default DepartmentListPage;
