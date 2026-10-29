const express = require('express');
const router = express.Router();
const {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
} = require('../controllers/holidayController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', getHolidays);
router.post('/', authorize('ADMIN', 'HR'), createHoliday);
router.put('/:id', authorize('ADMIN', 'HR'), updateHoliday);
router.delete('/:id', authorize('ADMIN'), deleteHoliday);

module.exports = router;
