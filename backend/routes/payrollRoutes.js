const express = require('express');
const router = express.Router();
const {
  generateMonthlyPayroll,
  getPayrollList,
  getPayrollById,
  updatePayrollDraft,
  approvePayroll,
  finalizePayroll
} = require('../controllers/payrollController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.post('/generate', authorize('ADMIN', 'HR'), generateMonthlyPayroll);
router.get('/', getPayrollList);
router.get('/:id', getPayrollById);
router.put('/:id', authorize('ADMIN', 'HR'), updatePayrollDraft);
router.post('/:id/approve', authorize('ADMIN', 'HR'), approvePayroll);
router.post('/:id/finalize', authorize('ADMIN'), finalizePayroll);

module.exports = router;
