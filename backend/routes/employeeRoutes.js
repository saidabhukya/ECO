const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { authorize, checkEmployeeOwnership } = require('../middleware/rbac');

router.use(protect);

router.get('/', getEmployees);
router.post('/', authorize('ADMIN', 'HR'), createEmployee);
router.get('/:id', checkEmployeeOwnership, getEmployeeById);
router.put('/:id', checkEmployeeOwnership, updateEmployee);
router.patch('/:id/status', authorize('ADMIN', 'HR'), updateEmployeeStatus);

module.exports = router;
