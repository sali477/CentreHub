import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';
import {
  verifyGoogleIdToken,
  registerLocalUser,
  authenticateLocalUser,
  findOrCreateGoogleUser,
  assignUserRole,
} from '../services/authService.js';

const handleServiceError = (res, error) => {
  if (error.statusCode) {
    res.status(error.statusCode);
  }
  throw error;
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await registerLocalUser({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    handleServiceError(res, error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateLocalUser(req.body);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    handleServiceError(res, error);
  }
});

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  try {
    const payload = await verifyGoogleIdToken(credential);
    const { sub: googleId, email, name, picture } = payload;
    const { user, isNew } = await findOrCreateGoogleUser({ googleId, email, name, picture });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[auth] Google ${isNew ? 'sign-up' : 'sign-in'}: ${email}`);
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && (!error.statusCode || error.statusCode >= 500)) {
      console.error('[auth] Google auth failed:', error.message);
    }
    handleServiceError(res, error);
  }
});

// @desc    Set user role (onboarding)
// @route   PUT /api/auth/role
export const setRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  try {
    const user = await assignUserRole(req.user, role);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    handleServiceError(res, error);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('enrolledCourses', 'title thumbnail subject');

  res.json({ success: true, user });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('No user found with that email');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update password
// @route   PUT /api/auth/update-password
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const fields = ['name', 'phone', 'avatar', 'preferredLanguage'];
  const updates = {};

  fields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (updates.preferredLanguage && !['en', 'fr'].includes(updates.preferredLanguage)) {
    res.status(400);
    throw new Error('Invalid language. Supported: en, fr');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, user });
});
