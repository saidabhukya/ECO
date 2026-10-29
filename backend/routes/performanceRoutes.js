const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  getReviews,
  createReview,
  acknowledgeReview
} = require('../controllers/performanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

// Goals
router.get('/goals', getGoals);
router.post('/goals', authorize('ADMIN', 'HR', 'MANAGER'), createGoal);
router.put('/goals/:id', updateGoal);

// Reviews
router.get('/reviews', getReviews);
router.post('/reviews', authorize('ADMIN', 'HR', 'MANAGER'), createReview);
router.patch('/reviews/:id/acknowledge', acknowledgeReview);

module.exports = router;
