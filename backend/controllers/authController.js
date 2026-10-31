const jwt = require('jsonwebtoken');
const Manager = require('../models/Manager');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'aurelia_luxury_secret_jwt_key_2026_super_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * @desc    Manager login
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find manager and include password
    const manager = await Manager.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!manager) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Access denied.',
      });
    }

    const isMatch = await manager.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Access denied.',
      });
    }

    const token = generateToken(manager._id);

    res.status(200).json({
      success: true,
      message: 'Manager authenticated successfully.',
      data: {
        token,
        manager: {
          id: manager._id,
          name: manager.name,
          email: manager.email,
          role: manager.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated manager profile
 * @route   GET /api/auth/me
 * @access  Private (Manager only)
 */
const getMe = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.manager._id);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
