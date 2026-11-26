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

/**
 * Optional auth — attach req.user if valid JWT is present, otherwise continue.
 */
const optionalAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
      }
    }
  } catch (_) {
    // Ignore invalid/expired token for optional auth routes
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
