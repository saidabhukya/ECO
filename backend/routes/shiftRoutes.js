const express = require('express');
const router = express.Router();
const {
  getShifts,
  createShift,
  updateShift,
  deleteShift
} = require('../controllers/shiftController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', getShifts);
router.post('/', authorize('ADMIN', 'HR'), createShift);
router.put('/:id', authorize('ADMIN', 'HR'), updateShift);
router.delete('/:id', authorize('ADMIN'), deleteShift);

module.exports = router;
