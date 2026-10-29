const Employee = require('../models/Employee');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this route.`
      });
    }

    next();
  };
};

// Check if user is accessing their own employee record or has privileged role
const checkEmployeeOwnership = async (req, res, next) => {
  const targetEmployeeId = req.params.id || req.params.employeeId || req.body.employee;

  if (!targetEmployeeId) {
    return next();
  }

  // Admins and HR have global read access to employee records
  if (['ADMIN', 'HR'].includes(req.user.role)) {
    return next();
  }

  const currentUserEmployeeId = req.userEmployee?._id?.toString() || req.user.employeeRef?.toString();

  // If Employee is accessing their own record
  if (currentUserEmployeeId && targetEmployeeId.toString() === currentUserEmployeeId) {
    return next();
  }

  // If Manager is accessing their direct subordinate's record
  if (req.user.role === 'MANAGER' && currentUserEmployeeId) {
    const targetEmp = await Employee.findById(targetEmployeeId);
    if (targetEmp && targetEmp.reportingManager?.toString() === currentUserEmployeeId) {
      return next();
    }
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: You can only view or manage your own records or direct team members.'
  });
};

module.exports = { authorize, checkEmployeeOwnership };
