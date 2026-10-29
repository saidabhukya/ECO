const express = require('express');
const router = express.Router();
const {
  getEmployeeReport,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/employees', authorize('ADMIN', 'HR'), getEmployeeReport);
router.get('/attendance', authorize('ADMIN', 'HR', 'MANAGER'), getAttendanceReport);
router.get('/leaves', authorize('ADMIN', 'HR', 'MANAGER'), getLeaveReport);
router.get('/payroll', authorize('ADMIN', 'HR'), getPayrollReport);

module.exports = router;
