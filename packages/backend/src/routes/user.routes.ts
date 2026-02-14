import express from 'express';
import { userController } from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes accessible only by principal
router.get('/', authorize(UserRole.PRINCIPAL), userController.getAllUsers);
router.post('/students', authorize(UserRole.PRINCIPAL), userController.createStudent);
router.post('/teachers', authorize(UserRole.PRINCIPAL), userController.createTeacher);

// Routes accessible by principal and teacher (for their students)
router.get('/:id', authorize(UserRole.PRINCIPAL, UserRole.TEACHER), userController.getUserById);
router.put('/:id', authorize(UserRole.PRINCIPAL, UserRole.TEACHER), userController.updateUser);
router.delete('/:id', authorize(UserRole.PRINCIPAL), userController.deleteUser);

export default router;