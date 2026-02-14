import { Router } from 'express';
import AttendanceController from '../controllers/attendance.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';
import { z } from 'zod';

const router = Router();

// Validation schemas
const markAttendanceSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    classId: z.string().min(1, 'Class ID is required'),
    section: z.string().min(1, 'Section is required'),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
    status: z.enum(['present', 'absent', 'late', 'leave']),
    remarks: z.string().optional(),
    lateMinutes: z.number().min(0).max(240).optional(),
  }),
});

const bulkAttendanceSchema = z.object({
  body: z.object({
    classId: z.string().min(1, 'Class ID is required'),
    section: z.string().min(1, 'Section is required'),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
    attendanceData: z.array(
      z.object({
        studentId: z.string().min(1),
        status: z.enum(['present', 'absent', 'late', 'leave']),
        remarks: z.string().optional(),
        lateMinutes: z.number().min(0).max(240).optional(),
      })
    ).min(1, 'At least one attendance record is required'),
  }),
});

const updateAttendanceSchema = z.object({
  body: z.object({
    status: z.enum(['present', 'absent', 'late', 'leave']).optional(),
    remarks: z.string().optional(),
    lateMinutes: z.number().min(0).max(240).optional(),
  }),
});

// All routes require authentication
router.use(protect);
router.use(authorize(UserRole.PRINCIPAL, UserRole.TEACHER));

// Attendance marking
router.post('/',
  validate(markAttendanceSchema),
  AttendanceController.markAttendance
);

router.post('/bulk',
  validate(bulkAttendanceSchema),
  AttendanceController.markBulkAttendance
);

// Attendance retrieval
router.get('/class/:classId/:section',
  AttendanceController.getClassAttendance
);

router.get('/student/:studentId',
  AttendanceController.getStudentAttendance
);

router.get('/student/:studentId/stats',
  AttendanceController.getAttendanceStats
);

router.get('/report/:classId/:section',
  AttendanceController.getMonthlyReport
);

router.get('/summary/today',
  AttendanceController.getTodaySummary
);

// Attendance updates
router.put('/:id',
  validate(updateAttendanceSchema),
  AttendanceController.updateAttendance
);

export default router;