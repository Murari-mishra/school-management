import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(protect);
router.use(authorize(UserRole.PRINCIPAL, UserRole.TEACHER));

// Placeholder routes
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Discipline records endpoint',
    timestamp: new Date().toISOString(),
  });
});

export default router;
