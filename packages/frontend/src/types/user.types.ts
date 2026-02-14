export enum UserRole {
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  LEAVE = 'leave',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  profilePicture?: string;
  phone?: string;
}

export interface Student extends User {
  studentId: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  class: string;
  className?: string;
  section: string;
  rollNumber: number;
  admissionDate: string;
}

export interface Teacher extends User {
  teacherId: string;
  qualification: string;
  subjects: string[];
  assignedClasses: Array<{
    class: string;
    section: string;
    className?: string;
  }>;
  joiningDate: string;
}

export interface Class {
  _id: string;
  className: string;
  sections: string[];
  classTeacher: string;
  subjects: string[];
  academicYear: string;
}

export interface Attendance {
  _id: string;
  student: Student;
  class: string;
  section: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  remarks?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}