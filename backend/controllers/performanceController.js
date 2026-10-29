const Goal = require('../models/Goal');
const PerformanceReview = require('../models/PerformanceReview');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { logAction } = require('../middleware/auditLogger');

// GOALS
const getGoals = async (req, res, next) => {
  try {
    const { employeeId, status } = req.query;
    const query = {};

    if (employeeId) {
      query.employee = employeeId;
    } else if (req.user.role === 'EMPLOYEE') {
      query.employee = req.userEmployee?._id;
    } else if (req.user.role === 'MANAGER') {
      const team = await Employee.find({ reportingManager: req.userEmployee?._id }).select('_id');
      query.employee = { $in: team.map(t => t._id) };
    }

    if (status) query.status = status;

    const goals = await Goal.find(query)
      .populate('employee', 'firstName lastName employeeId department profilePhoto')
      .populate('assignedBy', 'email')
      .populate('comments.author', 'email')
      .sort({ deadline: 1 });

    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const { employee, title, description, targetMetric, deadline, progress, status } = req.body;

    const goal = await Goal.create({
      employee,
      assignedBy: req.user._id,
      title,
      description,
      targetMetric,
      deadline,
      progress: progress || 0,
      status: status || 'In Progress'
    });

    // Notify employee
    const emp = await Employee.findById(employee).populate('user');
    if (emp?.user) {
      await Notification.create({
        recipient: emp.user._id,
        title: 'New Goal Assigned',
        message: `A new performance goal "${title}" has been assigned to you.`,
        type: 'Performance',
        actionUrl: '/performance'
      });
    }

    await logAction({
      req,
      action: 'GOAL_CREATE',
      module: 'Performance',
      targetId: goal._id,
      description: `Created goal "${title}" for employee ${emp?.fullName}`
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const { progress, status, comment } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    if (progress !== undefined) goal.progress = progress;
    if (status) goal.status = status;
    if (progress === 100) goal.status = 'Completed';

    if (comment) {
      goal.comments.push({
        author: req.user._id,
        comment,
        date: new Date()
      });
    }

    await goal.save();
    res.json({ success: true, message: 'Goal updated', data: goal });
  } catch (error) {
    next(error);
  }
};

// REVIEWS
const getReviews = async (req, res, next) => {
  try {
    const { employeeId, year } = req.query;
    const query = {};

    if (employeeId) {
      query.employee = employeeId;
    } else if (req.user.role === 'EMPLOYEE') {
      query.employee = req.userEmployee?._id;
    } else if (req.user.role === 'MANAGER') {
      const team = await Employee.find({ reportingManager: req.userEmployee?._id }).select('_id');
      query.employee = { $in: team.map(t => t._id) };
    }

    if (year) query.year = parseInt(year, 10);

    const reviews = await PerformanceReview.find(query)
      .populate('employee', 'firstName lastName employeeId department designation profilePhoto')
      .populate('reviewer', 'email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { employee, reviewPeriod, year, ratings, strengths, areasForImprovement, reviewerFeedback } = req.body;

    const review = await PerformanceReview.create({
      employee,
      reviewer: req.user._id,
      reviewPeriod,
      year: year || new Date().getFullYear(),
      ratings,
      strengths,
      areasForImprovement,
      reviewerFeedback,
      status: 'Submitted'
    });

    const emp = await Employee.findById(employee).populate('user');
    if (emp?.user) {
      await Notification.create({
        recipient: emp.user._id,
        title: 'Performance Review Published',
        message: `Your performance review for ${reviewPeriod} is now available.`,
        type: 'Performance',
        actionUrl: '/performance'
      });
    }

    await logAction({
      req,
      action: 'REVIEW_CREATE',
      module: 'Performance',
      targetId: review._id,
      description: `Submitted performance review for ${emp?.fullName} (${reviewPeriod})`
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

const acknowledgeReview = async (req, res, next) => {
  try {
    const { employeeComments } = req.body;
    const review = await PerformanceReview.findById(req.params.id);

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.status = 'Acknowledged';
    review.acknowledgedAt = new Date();
    if (employeeComments) review.employeeComments = employeeComments;
    await review.save();

    res.json({ success: true, message: 'Review acknowledged', data: review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  getReviews,
  createReview,
  acknowledgeReview
};
