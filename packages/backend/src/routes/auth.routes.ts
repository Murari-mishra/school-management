import { Router } from 'express';
import { z } from 'zod';
import AuthController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authLimiter } from '../middleware/security.middleware';

const router = Router();

// Validation schemas
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  }),
});

// Public routes
router.post('/login', authLimiter as any, validate(loginSchema), AuthController.login);
router.post('/forgot-password', authLimiter as any, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter as any, validate(resetPasswordSchema), AuthController.resetPassword);

// Protected routes
router.post('/logout', protect, AuthController.logout);
router.get('/me', protect, AuthController.getMe);
router.post('/refresh-token', protect, AuthController.refreshToken);
router.post('/change-password', protect, validate(changePasswordSchema), AuthController.changePassword);

export default router;