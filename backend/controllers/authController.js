const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { logAction } = require('../middleware/auditLogger');

// Generate signed JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eco_track_default_jwt_secret_dev', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('employeeRef');

    if (!user) {
      await logAction({
        req,
        action: 'FAILED_LOGIN',
        module: 'Auth',
        description: `Failed login attempt for email: ${email}`,
        details: { email }
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        success: false,
        message: 'Account is temporarily locked due to excessive failed attempts. Please try again later.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact HR or System Administrator.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
      }
      await user.save();

      await logAction({
        req,
        action: 'FAILED_LOGIN',
        module: 'Auth',
        targetId: user._id,
        description: `Failed password for user: ${email}`,
        details: { attempts: user.loginAttempts }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    await logAction({
      req: { ...req, user },
      action: 'LOGIN',
      module: 'Auth',
      targetId: user._id,
      description: `User ${user.email} (${user.role}) logged in successfully`
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        employee: user.employeeRef
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'employeeRef',
      populate: ['department', 'designation', 'shift', 'reportingManager']
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        employee: user.employeeRef,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    await logAction({
      req,
      action: 'CHANGE_PASSWORD',
      module: 'Auth',
      targetId: user._id,
      description: `User ${user.email} changed password`
    });

    res.json({
      success: true,
      message: 'Password successfully updated'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password request
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      // Return 200 to prevent user enumeration
      return res.json({
        success: true,
        message: 'If that email address is registered, a password reset link has been dispatched.'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Log the request
    await logAction({
      req,
      action: 'PASSWORD_RESET_REQUEST',
      module: 'Auth',
      targetId: user._id,
      description: `Password reset requested for ${user.email}`
    });

    // In local dev/demo return token in debug info; in prod it would be emailed
    res.json({
      success: true,
      message: 'Password reset link sent to your registered email.',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using reset token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await logAction({
      req,
      action: 'PASSWORD_RESET_COMPLETED',
      module: 'Auth',
      targetId: user._id,
      description: `Password successfully reset for ${user.email}`
    });

    res.json({
      success: true,
      message: 'Password has been successfully reset. You may now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  await logAction({
    req,
    action: 'LOGOUT',
    module: 'Auth',
    targetId: req.user?._id,
    description: `User ${req.user?.email} logged out`
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
};
