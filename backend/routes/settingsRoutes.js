const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);
router.get('/', getSettings);
router.put('/', authorize('ADMIN'), updateSettings);

module.exports = router;
