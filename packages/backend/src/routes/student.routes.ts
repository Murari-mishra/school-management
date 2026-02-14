import { Router } from 'express';
import StudentController from '../controllers/student.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createStudentSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
    gender: z.enum(['male', 'female', 'other']),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode'),
    parentName: z.string().min(3, 'Parent name must be at least 3 characters'),
    parentEmail: z.string().email('Invalid parent email'),
    parentPhone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
    emergencyContact: z.string().regex(/^[0-9]{10}$/, 'Invalid emergency contact'),
    class: z.string().min(1, 'Class is required'),
    section: z.string().min(1, 'Section is required'),
    rollNumber: z.number().min(1, 'Roll number must be at least 1'),
  }),
});

const updateStudentSchema = z.object({
  body: z.object({
    fullName: z.string().min(3).optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    state: z.string().min(2).optional(),
    pincode: z.string().regex(/^[0-9]{6}$/).optional(),
    parentName: z.string().min(3).optional(),
    parentEmail: z.string().email().optional(),
    parentPhone: z.string().regex(/^[0-9]{10}$/).optional(),
    emergencyContact: z.string().regex(/^[0-9]{10}$/).optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    medicalConditions: z.string().optional(),
    transportRequired: z.boolean().optional(),
    busRoute: z.string().optional(),
  }),
});

const transferStudentSchema = z.object({
  body: z.object({
    newClassId: z.string().min(1, 'New class is required'),
    newSection: z.string().min(1, 'New section is required'),
    newRollNumber: z.number().min(1, 'Roll number must be at least 1'),
  }),
});

// All routes require authentication
router.use(protect);

// Routes accessible by Principal and Teachers
router.get('/', 
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER), 
  StudentController.getAllStudents
);

router.get('/search',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  StudentController.searchStudents
);

router.get('/class/:classId/:section',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  StudentController.getStudentsByClass
);

router.get('/:id',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT),
  StudentController.getStudentById
);

router.get('/:id/attendance-report',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT),
  StudentController.getAttendanceReport
);

// Routes accessible only by Principal
router.post('/',
  authorize(UserRole.PRINCIPAL),
  validate(createStudentSchema),
  StudentController.createStudent
);

router.put('/:id',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  validate(updateStudentSchema),
  StudentController.updateStudent
);

router.delete('/:id',
  authorize(UserRole.PRINCIPAL),
  StudentController.deleteStudent
);

router.post('/:id/transfer',
  authorize(UserRole.PRINCIPAL),
  validate(transferStudentSchema),
  StudentController.transferStudent
);

router.patch('/:id/profile-picture',
  authorize(UserRole.PRINCIPAL, UserRole.TEACHER),
  StudentController.uploadProfilePicture
);

export default router;