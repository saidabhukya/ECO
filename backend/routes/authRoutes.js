const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/logout', protect, logout);

module.exports = router;
