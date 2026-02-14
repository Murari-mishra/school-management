import { Router } from 'express';
import TeacherController from '../controllers/teacher.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createTeacherSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    qualification: z.string().min(2, 'Qualification is required'),
    specialization: z.array(z.string()).min(1, 'At least one specialization is required'),
    subjects: z.array(z.string()).min(1, 'At least one subject is required'),
    employmentType: z.enum(['permanent', 'contract', 'temporary']),
    experience: z.number().min(0).max(50),
    phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode'),
    emergencyContact: z.string().regex(/^[0-9]{10}$/, 'Invalid emergency contact'),
    previousSchool: z.string().optional(),
    bankAccount: z.string().optional(),
    panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number').optional(),
  }),
});

const assignClassSchema = z.object({
  body: z.object({
    classId: z.string().min(1, 'Class ID is required'),
    section: z.string().min(1, 'Section is required'),
    subject: z.string().min(1, 'Subject is required'),
  }),
});

// All routes require authentication
router.use(protect);

// Routes accessible by Principal and Teachers (self)
router.get('/',
  authorize(UserRole.PRINCIPAL),
  TeacherController.getAllTeachers
);

router.get('/:id',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  TeacherController.getTeacherById
);

router.get('/:id/classes',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  TeacherController.getTeacherClasses
);

// Principal only routes
router.post('/',
  authorize(UserRole.PRINCIPAL),
  validate(createTeacherSchema),
  TeacherController.createTeacher
);

router.put('/:id',
  authorize(UserRole.PRINCIPAL),
  TeacherController.updateTeacher
);

router.delete('/:id',
  authorize(UserRole.PRINCIPAL),
  TeacherController.deleteTeacher
);

router.post('/:id/assign-class',
  authorize(UserRole.PRINCIPAL),
  validate(assignClassSchema),
  TeacherController.assignClass
);

router.delete('/:id/remove-class/:classId/:section',
  authorize(UserRole.PRINCIPAL),
  TeacherController.removeClass
);

export default router;
