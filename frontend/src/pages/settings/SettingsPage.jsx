import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Settings, Save, Building, ShieldCheck, Clock } from 'lucide-react';

export const SettingsPage = () => {
  const { role } = useAuth();
  const { addToast } = useNotification();

  const [settings, setSettings] = useState({
    companyName: 'ECO TRACK',
    tagline: 'Track Employees. Manage Work. Drive Performance.',
    companyEmail: 'admin@ecotrack.internal',
    companyPhone: '+1 (800) 555-0199',
    companyAddress: '100 Silicon Boulevard, Suite 500, San Francisco, CA',
    currency: 'USD',
    timezone: 'UTC',
    workHoursPerDay: 8,
    gracePeriodMinutes: 15,
    allowOvertime: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/settings');
      if (res.data?.success) {
        setSettings(res.data.data);
      }
    } catch (e) {
      addToast('Failed to load settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/settings', settings);
      addToast('Company system settings updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-rose-600" />
            <span>Application Settings & Policies</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure enterprise branding, operational working rules, and system policies.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Identity */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-rose-600 flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>Corporate Identity & Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Corporate Tagline</label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Official Email</label>
              <input
                type="email"
                name="companyEmail"
                value={settings.companyEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Support Phone</label>
              <input
                type="text"
                name="companyPhone"
                value={settings.companyPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Headquarters Address</label>
              <input
                type="text"
                name="companyAddress"
                value={settings.companyAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Attendance & Work Rules */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-rose-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Attendance & Shift Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Standard Work Hours / Day</label>
              <input
                type="number"
                name="workHoursPerDay"
                value={settings.workHoursPerDay}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Grace Period (Minutes)</label>
              <input
                type="number"
                name="gracePeriodMinutes"
                value={settings.gracePeriodMinutes}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Base Currency</label>
              <input
                type="text"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="allowOvertime"
              name="allowOvertime"
              checked={settings.allowOvertime}
              onChange={handleChange}
              className="w-4 h-4 text-rose-600 rounded"
            />
            <label htmlFor="allowOvertime" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Calculate and disburse overtime pay during monthly payroll cycles
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
