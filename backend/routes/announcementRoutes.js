const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('ADMIN', 'HR'), createAnnouncement);
router.delete('/:id', authorize('ADMIN', 'HR'), deleteAnnouncement);

module.exports = router;
