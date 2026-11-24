const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a sanitised user object safe to return in responses.
 * Password is never selected unless explicitly requested via .select('+password').
 */
const userPublicFields =
  '_id username email firstName lastName fullName avatar coverPhoto bio location website isVerified role createdAt lastActive';

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // Check express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Check for existing email or username
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        message: `An account with that ${field} already exists`,
      });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
    });

    const token = generateToken(user._id.toString(), user.role);

    // Fetch the created user without password
    const userDoc = await User.findById(user._id).select(userPublicFields);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { token, user: userDoc },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Explicitly select password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update lastActive
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id.toString(), user.role);

    const userDoc = await User.findById(user._id).select(userPublicFields);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: { token, user: userDoc },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @access  Protected
 */
const logout = async (req, res, next) => {
  try {
    // JWT is stateless; client should discard the token.
    // Update lastActive on logout.
    await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select(userPublicFields)
      .populate('friends', '_id username firstName lastName avatar isVerified')
      .populate('following', '_id username firstName lastName avatar isVerified')
      .populate('followers', '_id username firstName lastName avatar isVerified');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/update-password
 * @access  Protected
 */
const updatePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @access  Public
 * Note: Sends a reset email if nodemailer is configured; otherwise returns a token for dev use.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a password reset link has been sent',
        data: null,
      });
    }

    // Generate a reset token (use crypto for production)
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SocialWave <noreply@socialwave.com>',
        to: user.email,
        subject: 'SocialWave — Password Reset',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${user.firstName || user.username},</p>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
          <p>This link expires in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
    } catch (emailErr) {
      // Email failed — clear the token so it cannot be misused
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // In development, return the token so it can be tested without email
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          success: true,
          message: 'Email service unavailable (dev mode: use resetToken below)',
          data: { resetToken, resetUrl },
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'If that email exists, a password reset link has been sent',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, updatePassword, forgotPassword };
