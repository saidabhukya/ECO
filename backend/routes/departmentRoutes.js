const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize('ADMIN', 'HR'), createDepartment);
router.put('/:id', authorize('ADMIN', 'HR'), updateDepartment);
router.delete('/:id', authorize('ADMIN'), deleteDepartment);

module.exports = router;
