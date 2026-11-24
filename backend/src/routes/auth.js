const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').optional().trim().isLength({ max: 50 }).withMessage('First name too long'),
  body('lastName').optional().trim().isLength({ max: 50 }).withMessage('Last name too long'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePasswordValidation, updatePassword);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);

module.exports = router;
