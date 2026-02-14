import mongoose from 'mongoose';

// ====================
// ENUMS
// ====================

export enum UserRole {
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  LEAVE = 'leave',
}

export enum DisciplineType {
  ACHIEVEMENT = 'achievement',
  WARNING = 'warning',
  COMPLAINT = 'complaint',
  SUSPENSION = 'suspension',
  EXPULSION = 'expulsion',
}

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationType {
  ATTENDANCE = 'attendance',
  DISCIPLINE = 'discipline',
  ANNOUNCEMENT = 'announcement',
  ACADEMIC = 'academic',
  SYSTEM = 'system',
}

export enum EventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
}

// ====================
// INTERFACES
// ====================

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
  profilePicture?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  lastActive?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends IUser {
  studentId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  address: string;
  city: string;
  state: string;
  pincode: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentOccupation?: string;
  emergencyContact: string;
  bloodGroup?: string;
  medicalConditions?: string;
  class: mongoose.Types.ObjectId; // Class ID
  className?: string; // Virtual
  section: string;
  rollNumber: number;
  admissionDate: Date;
  previousSchool?: string;
  transportRequired: boolean;
  busRoute?: string;
}

export interface ITeacher extends IUser {
  teacherId: string;
  fullName: string;
  qualification: string;
  specialization: string[];
  subjects: string[];
  assignedClasses: Array<{
    class: mongoose.Types.ObjectId;
    className?: string; // Virtual
    section: string;
    subject: string;
  }>;
  joiningDate: Date;
  employmentType: 'permanent' | 'contract' | 'temporary';
  experience: number;
  previousSchool?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContact: string;
  bankAccount?: string;
  panCard?: string;
}

export interface IClass {
  className: string; // 'Nursery', 'KG', '1', '2', ..., '12'
  sections: string[];
  classTeacher: mongoose.Types.ObjectId; // Teacher ID
  classTeacherName?: string; // Virtual
  subjects: Array<{
    name: string;
    teacher: mongoose.Types.ObjectId;
    teacherName?: string; // Virtual
  }>;
  academicYear: string; // '2024-2025'
  totalStudents?: number; // Virtual
  roomNumber?: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  student: mongoose.Types.ObjectId; // Student ID
  studentName?: string; // Virtual
  studentRoll?: number; // Virtual
  class: mongoose.Types.ObjectId; // Class ID
  className?: string; // Virtual
  section: string;
  date: Date;
  status: AttendanceStatus;
  markedBy: mongoose.Types.ObjectId; // Teacher ID
  markedByName?: string; // Virtual
  remarks?: string;
  lateMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDisciplineRecord {
  student: mongoose.Types.ObjectId; // Student ID
  studentName?: string; // Virtual
  teacher: mongoose.Types.ObjectId; // Teacher ID
  teacherName?: string; // Virtual
  date: Date;
  type: DisciplineType;
  description: string;
  severity: SeverityLevel;
  actionTaken?: string;
  actionBy?: mongoose.Types.ObjectId;
  actionDate?: Date;
  resolved: boolean;
  resolvedDate?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  recipient: mongoose.Types.ObjectId; // User ID
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  user: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: UserRole;
  event: EventType;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ip: string;
  userAgent: string;
  timestamp: Date;
  createdAt: Date;
}

// ====================
// REQUEST/RESPONSE TYPES
// ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
    profilePicture?: string;
    studentId?: string; // For students
    teacherId?: string; // For teachers
    class?: string | mongoose.Types.ObjectId; // For students
    section?: string; // For students
    rollNumber?: number; // For students
    subjects?: string[]; // For teachers
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
  timestamp: string;
  path?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// ====================
// DASHBOARD TYPES
// ====================

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    leave: number;
    total: number;
    percentage: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    user?: string;
  }>;
  upcomingEvents?: Array<{
    id: string;
    title: string;
    date: Date;
    type: string;
  }>;
}

export interface StudentDashboardData {
  student: IStudent;
  attendanceStats: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    attendancePercentage: number;
    monthlyData: Array<{
      month: string;
      percentage: number;
    }>;
  };
  recentAttendance: IAttendance[];
  disciplineRecords: IDisciplineRecord[];
  notifications: INotification[];
  timetable?: any;
  upcomingExams?: any[];
}

export interface TeacherDashboardData {
  teacher: ITeacher;
  assignedClasses: Array<{
    class: IClass;
    section: string;
    subject: string;
    studentCount: number;
  }>;
  todaySchedule: Array<{
    period: number;
    class: string;
    section: string;
    subject: string;
    time: string;
  }>;
  recentAttendance: IAttendance[];
  pendingTasks: number;
  notifications: INotification[];
}

export interface PrincipalDashboardData {
  stats: DashboardStats;
  classWiseStats: Array<{
    className: string;
    totalStudents: number;
    attendancePercentage: number;
  }>;
  recentActivities: IAuditLog[];
  lowAttendanceAlert: IStudent[];
  pendingApprovals: number;
}

// ====================
// FILTER & QUERY TYPES
// ====================

export interface StudentFilter {
  class?: string;
  section?: string;
  gender?: Gender;
  bloodGroup?: string;
  transportRequired?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AttendanceFilter {
  classId?: string;
  section?: string;
  studentId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ====================
// NOTIFICATION TYPES
// ====================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: any;
    contentType?: string;
  }>;
}

export interface SMSOptions {
  to: string | string[];
  message: string;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  click_action?: string;
}

// ====================
// ERROR TYPES
// ====================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  errors?: ValidationError[];
  timestamp: string;
  path?: string;
  stack?: string;
}
