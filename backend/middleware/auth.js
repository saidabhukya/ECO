const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eco_track_default_jwt_secret_dev');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your administrator.'
      });
    }

    req.user = user;

    // Attach linked employee record if available
    if (user.employeeRef) {
      req.userEmployee = await Employee.findById(user.employeeRef);
    } else if (user.employeeId) {
      req.userEmployee = await Employee.findOne({ employeeId: user.employeeId });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is invalid or expired. Please sign in again.'
    });
  }
};

module.exports = { protect };
