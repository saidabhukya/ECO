import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';

export const EmployeeModal = ({ isOpen, onClose, onSaved, employee = null }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    department: '',
    designation: '',
    shift: '',
    reportingManager: '',
    employmentType: 'Full-time',
    employmentStatus: 'Active',
    workLocation: 'Headquarters',
    dateOfBirth: '',
    gender: 'Prefer not to say',
    street: '',
    city: '',
    state: '',
    country: 'USA',
    postalCode: '',
    createUserAccount: true,
    userRole: 'EMPLOYEE',
    initialPassword: 'EcoTrack@2026'
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [depRes, desRes, shfRes, empRes] = await Promise.all([
          api.get('/departments'),
          api.get('/designations'),
          api.get('/shifts'),
          api.get('/employees?limit=100')
        ]);
        if (depRes.data?.success) setDepartments(depRes.data.data);
        if (desRes.data?.success) setDesignations(desRes.data.data);
        if (shfRes.data?.success) setShifts(shfRes.data.data);
        if (empRes.data?.success) setManagers(empRes.data.data);
      } catch (e) {
        console.error('Failed to load employee form options:', e);
      }
    };
    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen]);

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        contactNumber: employee.contactNumber || '',
        department: employee.department?._id || employee.department || '',
        designation: employee.designation?._id || employee.designation || '',
        shift: employee.shift?._id || employee.shift || '',
        reportingManager: employee.reportingManager?._id || employee.reportingManager || '',
        employmentType: employee.employmentType || 'Full-time',
        employmentStatus: employee.employmentStatus || 'Active',
        workLocation: employee.workLocation || 'Headquarters',
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
        gender: employee.gender || 'Prefer not to say',
        street: employee.address?.street || '',
        city: employee.address?.city || '',
        state: employee.address?.state || '',
        country: employee.address?.country || 'USA',
        postalCode: employee.address?.postalCode || '',
        createUserAccount: false
      });
    } else {
      // Auto-generate fresh random employee ID suggestion e.g. ECO-1008
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        employeeId: `ECO-${randomNum}`,
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        department: '',
        designation: '',
        shift: '',
        reportingManager: '',
        employmentType: 'Full-time',
        employmentStatus: 'Active',
        workLocation: 'Headquarters',
        dateOfBirth: '',
        gender: 'Prefer not to say',
        street: '',
        city: '',
        state: '',
        country: 'USA',
        postalCode: '',
        createUserAccount: true,
        userRole: 'EMPLOYEE',
        initialPassword: 'EcoTrack@2026'
      });
    }
    setError('');
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = {
      ...formData,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode
      }
    };

    try {
      if (employee) {
        await api.put(`/employees/${employee._id}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? `Edit Employee (${employee.employeeId})` : 'Onboard New Employee'}
      subtitle="Complete profile, department assignment, and system login credentials"
      maxWidth="max-w-3xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors"
          >
            {isLoading ? 'Saving...' : employee ? 'Save Changes' : 'Create Employee'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-3">
            1. Core Identity & Contact
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                name="employeeId"
                required
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="ECO-1001"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@ecotrack.internal"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                name="contactNumber"
                required
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Department & Employment Role */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-3">
            2. Department, Shift & Role
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department *
              </label>
              <select
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designation
              </label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">Select Designation</option>
                {designations.map((des) => (
                  <option key={des._id} value={des._id}>
                    {des.title} ({des.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shift Schedule
              </label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">Select Shift</option>
                {shifts.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reporting Manager
              </label>
              <select
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">None / Self</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.firstName} {m.lastName} ({m.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employment Status
              </label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
                <option value="Terminated">Terminated</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Account Provisioning (For New Employees) */}
        {!employee && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  3. System Access & Login Credentials
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Provision an ECO TRACK portal account automatically
                </p>
              </div>
              <input
                type="checkbox"
                name="createUserAccount"
                checked={formData.createUserAccount}
                onChange={handleChange}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
            </div>

            {formData.createUserAccount && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Portal Role
                  </label>
                  <select
                    name="userRole"
                    value={formData.userRole}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="EMPLOYEE">Employee (Self-Service)</option>
                    <option value="MANAGER">Manager (Team Approvals)</option>
                    <option value="HR">HR Specialist</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    name="initialPassword"
                    value={formData.initialPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default EmployeeModal;
