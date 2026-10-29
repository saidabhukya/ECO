const express = require('express');
const router = express.Router();
const {
  getAssets,
  createAsset,
  assignAsset,
  returnAsset
} = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', getAssets);
router.post('/', authorize('ADMIN', 'HR'), createAsset);
router.post('/:id/assign', authorize('ADMIN', 'HR'), assignAsset);
router.post('/:id/return', authorize('ADMIN', 'HR'), returnAsset);

module.exports = router;
