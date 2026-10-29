const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceRegister,
  getMyAttendance,
  requestAdjustment,
  processAdjustment
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayAttendance);
router.get('/me', getMyAttendance);
router.get('/', authorize('ADMIN', 'HR', 'MANAGER'), getAttendanceRegister);
router.post('/adjustments', requestAdjustment);
router.patch('/adjustments/:attendanceId/:adjustmentId', authorize('ADMIN', 'HR', 'MANAGER'), processAdjustment);

module.exports = router;
