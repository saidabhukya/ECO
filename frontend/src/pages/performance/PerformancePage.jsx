import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { Target, Star, Plus, CheckCircle, MessageSquare } from 'lucide-react';

export const PerformancePage = () => {
  const { role, user } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('goals'); // 'goals' | 'reviews'
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    employee: '',
    title: '',
    description: '',
    targetMetric: '',
    deadline: '',
    progress: 0,
    status: 'In Progress'
  });

  // Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    employee: '',
    reviewPeriod: 'Annual 2026',
    year: new Date().getFullYear(),
    ratings: {
      productivity: 4,
      technicalSkills: 4,
      communication: 4,
      teamwork: 4,
      qualityOfWork: 4,
      leadership: 4
    },
    strengths: '',
    areasForImprovement: '',
    reviewerFeedback: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [gRes, rRes, empRes] = await Promise.all([
        api.get('/performance/goals'),
        api.get('/performance/reviews'),
        api.get('/employees?limit=100')
      ]);
      if (gRes.data?.success) setGoals(gRes.data.data);
      if (rRes.data?.success) setReviews(rRes.data.data);
      if (empRes.data?.success) setEmployees(empRes.data.data);
    } catch (e) {
      addToast('Failed to load performance records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/performance/goals', goalForm);
      addToast('Performance goal assigned successfully', 'success');
      setIsGoalModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create goal', 'error');
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/performance/reviews', reviewForm);
      addToast('Performance evaluation published', 'success');
      setIsReviewModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  const handleAcknowledge = async (reviewId) => {
    try {
      await api.patch(`/performance/reviews/${reviewId}/acknowledge`, { employeeComments: 'Acknowledged and reviewed with manager' });
      addToast('Review acknowledged', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to acknowledge review', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Performance & Goals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set quarterly milestones, track key performance indicators, and conduct 360 competency reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ADMIN', 'HR', 'MANAGER'].includes(role) && (
            <>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Goal</span>
              </button>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs border border-slate-700"
              >
                <Star className="w-4 h-4 text-amber-400" />
                <span>Conduct Review</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'goals' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Goals & Key Results
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reviews' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Evaluations & Competencies
        </button>
      </div>

      {/* TAB 1: GOALS */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((g) => (
            <div
              key={g._id}
              className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">
                      Target: {new Date(g.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {g.title}
                    </h3>
                  </div>
                  <Badge status={g.status} />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {g.description}
                </p>

                {g.targetMetric && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    🎯 Metric: {g.targetMetric}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">
                    Assignee: <strong>{g.employee?.firstName} {g.employee?.lastName}</strong>
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{g.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full transition-all" style={{ width: `${g.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">
                    {r.reviewPeriod}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {r.employee?.firstName} {r.employee?.lastName}
                  </h3>
                  <span className="text-xs text-slate-400">{r.employee?.designation?.title}</span>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 font-black text-lg">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span>{r.overallScore}</span>
                  </div>
                  <Badge status={r.status} />
                </div>
              </div>

              {/* Competencies radar mini metrics */}
              <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                <div><span>Productivity:</span> <strong className="block text-slate-800 dark:text-white">{r.ratings?.productivity}/5</strong></div>
                <div><span>Tech Skills:</span> <strong className="block text-slate-800 dark:text-white">{r.ratings?.technicalSkills}/5</strong></div>
                <div><span>Communication:</span> <strong className="block text-slate-800 dark:text-white">{r.ratings?.communication}/5</strong></div>
                <div><span>Teamwork:</span> <strong className="block text-slate-800 dark:text-white">{r.ratings?.teamwork}/5</strong></div>
                <div><span>Quality:</span> <strong className="block text-slate-800 dark:text-white">{r.ratings?.qualityOfWork}/5</strong></div>
                <div><span>Leadership:</span> <strong className="block text-slate-800 dark:text-white">{r.ratings?.leadership}/5</strong></div>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">Reviewer Feedback:</span>
                  <p className="text-slate-600 dark:text-slate-400 italic mt-0.5">"{r.reviewerFeedback}"</p>
                </div>
              </div>

              {r.status === 'Submitted' && r.employee?._id === user?.employeeRef && (
                <button
                  onClick={() => handleAcknowledge(r._id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Acknowledge & Sign Evaluation
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Assign Performance Goal"
        maxWidth="max-w-md"
        footer={
          <button
            onClick={handleCreateGoal}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
          >
            Assign Goal
          </button>
        }
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee *</label>
            <select
              required
              value={goalForm.employee}
              onChange={(e) => setGoalForm({ ...goalForm, employee: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Goal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Optimize Database Query Latency"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Metric</label>
            <input
              type="text"
              placeholder="e.g. Reduce response latency below 50ms"
              value={goalForm.targetMetric}
              onChange={(e) => setGoalForm({ ...goalForm, targetMetric: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline *</label>
            <input
              type="date"
              required
              value={goalForm.deadline}
              onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Scope and expectations..."
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Conduct Performance Review"
        maxWidth="max-w-lg"
        footer={
          <button
            onClick={handleCreateReview}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
          >
            Publish Evaluation
          </button>
        }
      >
        <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee *</label>
            <select
              required
              value={reviewForm.employee}
              onChange={(e) => setReviewForm({ ...reviewForm, employee: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Review Period *</label>
              <input
                type="text"
                required
                value={reviewForm.reviewPeriod}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewPeriod: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Year</label>
              <input
                type="number"
                value={reviewForm.year}
                onChange={(e) => setReviewForm({ ...reviewForm, year: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Evaluator Feedback *</label>
            <textarea
              rows={3}
              required
              placeholder="Overall performance summary..."
              value={reviewForm.reviewerFeedback}
              onChange={(e) => setReviewForm({ ...reviewForm, reviewerFeedback: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PerformancePage;
