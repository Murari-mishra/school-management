import { Router } from 'express';
import ClassController from '../controllers/class.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createClassSchema = z.object({
  body: z.object({
    className: z.enum(['Nursery', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),
    sections: z.array(z.string()).min(1).max(4),
    classTeacher: z.string().min(1, 'Class teacher is required'),
    subjects: z.array(
      z.object({
        name: z.string().min(1),
        teacher: z.string().min(1),
      })
    ).min(1, 'At least one subject is required'),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format'),
    roomNumber: z.string().optional(),
    capacity: z.number().min(10).max(60).default(40),
  }),
});

const updateClassSchema = z.object({
  body: z.object({
    sections: z.array(z.string()).min(1).max(4).optional(),
    classTeacher: z.string().min(1).optional(),
    subjects: z.array(
      z.object({
        name: z.string().min(1),
        teacher: z.string().min(1),
      })
    ).optional(),
    roomNumber: z.string().optional(),
    capacity: z.number().min(10).max(60).optional(),
  }),
});

// All routes require authentication
router.use(protect);

// Public routes (authenticated)
router.get('/',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  ClassController.getAllClasses
);

router.get('/dropdown',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  ClassController.getClassesForDropdown
);

router.get('/:id',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  ClassController.getClassById
);

router.get('/:id/stats',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  ClassController.getClassStats
);

router.get('/:classId/:section/students',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  ClassController.getClassStudents
);

// Principal only routes
router.post('/',
  authorize(UserRole.PRINCIPAL),
  validate(createClassSchema),
  ClassController.createClass
);

router.put('/:id',
  authorize(UserRole.PRINCIPAL),
  validate(updateClassSchema),
  ClassController.updateClass
);

router.delete('/:id',
  authorize(UserRole.PRINCIPAL),
  ClassController.deleteClass
);

export default router;