import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
  updateProfile,
  setRole,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authSensitiveLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/register', authSensitiveLimiter, register);
router.post('/login', authSensitiveLimiter, login);
router.post('/google', authSensitiveLimiter, googleAuth);
router.post('/forgot-password', authSensitiveLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/role', protect, setRole);
router.put('/update-password', protect, updatePassword);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

export default router;
