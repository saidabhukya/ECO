const express = require('express');
const router = express.Router();
const {
  getLeaveTypes,
  createLeaveType,
  getLeaveBalances,
  applyLeave,
  getLeaveRequests,
  approveLeave,
  rejectLeave,
  cancelLeave
} = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/types', getLeaveTypes);
router.post('/types', authorize('ADMIN', 'HR'), createLeaveType);
router.get('/balance', getLeaveBalances);
router.get('/', getLeaveRequests);
router.post('/', applyLeave);
router.post('/:id/approve', authorize('ADMIN', 'HR', 'MANAGER'), approveLeave);
router.post('/:id/reject', authorize('ADMIN', 'HR', 'MANAGER'), rejectLeave);
router.post('/:id/cancel', cancelLeave);

module.exports = router;
