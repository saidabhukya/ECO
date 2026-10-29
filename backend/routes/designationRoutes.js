const express = require('express');
const router = express.Router();
const {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation
} = require('../controllers/designationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', getDesignations);
router.post('/', authorize('ADMIN', 'HR'), createDesignation);
router.put('/:id', authorize('ADMIN', 'HR'), updateDesignation);
router.delete('/:id', authorize('ADMIN'), deleteDesignation);

module.exports = router;
