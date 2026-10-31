const jwt = require('jsonwebtoken');
const Manager = require('../models/Manager');

/**
 * Protect routes - only authenticated managers can proceed
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aurelia_luxury_secret_jwt_key_2026_super_secure');
    const manager = await Manager.findById(decoded.id).select('-password');

    if (!manager) {
      return res.status(401).json({
        success: false,
        message: 'The manager belonging to this token no longer exists.',
      });
    }

    if (manager.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Manager role required.',
      });
    }

    req.manager = manager;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    });
  }
};

/**
 * Optional Auth - Checks if request has a valid manager token
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.isManager = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aurelia_luxury_secret_jwt_key_2026_super_secure');
    const manager = await Manager.findById(decoded.id).select('-password');
    if (manager && manager.role === 'manager') {
      req.manager = manager;
      req.isManager = true;
    } else {
      req.isManager = false;
    }
  } catch (err) {
    req.isManager = false;
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
};
