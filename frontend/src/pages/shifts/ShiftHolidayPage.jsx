import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { Clock, CalendarDays, Plus, Trash2, Edit } from 'lucide-react';

export const ShiftHolidayPage = () => {
  const { role } = useAuth();
  const { addToast } = useNotification();

  const [shifts, setShifts] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Shift Modal
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: 60,
    gracePeriod: 15,
    applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    isOvernight: false
  });

  // Holiday Modal
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    description: '',
    holidayType: 'Public',
    location: 'All'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sRes, hRes] = await Promise.all([
        api.get('/shifts'),
        api.get('/holidays')
      ]);
      if (sRes.data?.success) setShifts(sRes.data.data);
      if (hRes.data?.success) setHolidays(hRes.data.data);
    } catch (e) {
      addToast('Failed to load shifts and holidays', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveShift = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shifts', shiftForm);
      addToast('Shift created successfully', 'success');
      setIsShiftModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create shift', 'error');
    }
  };

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    try {
      await api.post('/holidays', holidayForm);
      addToast('Holiday added to corporate calendar', 'success');
      setIsHolidayModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save holiday', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* SHIFTS SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-600" />
              <span>Shift Timing & Schedules</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured work hours, break policies, and grace period thresholds.
            </p>
          </div>

          {['ADMIN', 'HR'].includes(role) && (
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Shift</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shifts.map((s) => (
            <div
              key={s._id}
              className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h4>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {s.startTime} - {s.endTime}
                </span>
                {s.isOvernight && (
                  <span className="text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                    Overnight
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Grace Period:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{s.gracePeriod} mins</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Break Duration:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{s.breakDuration} mins</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOLIDAYS SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-rose-600" />
              <span>Corporate Holiday Calendar ({new Date().getFullYear()})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official company-wide and national holidays.
            </p>
          </div>

          {['ADMIN', 'HR'].includes(role) && (
            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {holidays.map((h) => (
            <div
              key={h._id}
              className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between"
            >
              <div>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                  {new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{h.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {h.description}
                </p>
              </div>
              <Badge variant="purple">{h.holidayType}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Add Shift Modal */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title="Create Shift Schedule"
        maxWidth="max-w-md"
        footer={
          <button
            onClick={handleSaveShift}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Save Shift
          </button>
        }
      >
        <form onSubmit={handleSaveShift} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shift Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Night Shift"
              value={shiftForm.name}
              onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={shiftForm.startTime}
                onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={shiftForm.endTime}
                onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grace Period (mins)
              </label>
              <input
                type="number"
                min="0"
                value={shiftForm.gracePeriod}
                onChange={(e) => setShiftForm({ ...shiftForm, gracePeriod: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Break (mins)
              </label>
              <input
                type="number"
                min="0"
                value={shiftForm.breakDuration}
                onChange={(e) => setShiftForm({ ...shiftForm, breakDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Add Holiday Modal */}
      <Modal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title="Add Holiday to Calendar"
        maxWidth="max-w-md"
        footer={
          <button
            onClick={handleSaveHoliday}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Add Holiday
          </button>
        }
      >
        <form onSubmit={handleSaveHoliday} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Holiday Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Labor Day"
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={holidayForm.date}
              onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Holiday Type
            </label>
            <select
              value={holidayForm.holidayType}
              onChange={(e) => setHolidayForm({ ...holidayForm, holidayType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="Public">Public Holiday</option>
              <option value="National">National Holiday</option>
              <option value="Company">Company Holiday</option>
              <option value="Optional">Optional Holiday</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Details or holiday notes..."
              value={holidayForm.description}
              onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShiftHolidayPage;
