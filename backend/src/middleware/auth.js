const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verify JWT and attach req.user = { id, role }.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired — please log in again',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token — please log in again',
      });
    }

    // Attach minimal user info; controllers fetch full doc when needed
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict access to certain roles.
 * Usage: authorize('admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden — you do not have permission to perform this action',
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
