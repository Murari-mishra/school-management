import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Placeholder routes
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Notifications endpoint',
    timestamp: new Date().toISOString(),
  });
});

export default router;
