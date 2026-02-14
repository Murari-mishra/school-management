import { UserRole } from '../types';

export const generateStudentId = (year: string, rollNumber: number): string => {
  const prefix = year.slice(2);
  return `STU${prefix}${rollNumber.toString().padStart(4, '0')}`;
};

export const generateTeacherId = (): string => {
  const prefix = 'TCH';
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${random}`;
};

export const formatDate = (date: Date): string => {
  return new Date(date).toISOString().split('T')[0];
};

export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // January is 0
  
  // If month is after June, it's next academic year
  if (month >= 6) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

export const getRoleHierarchy = (role: UserRole): UserRole[] => {
  switch (role) {
    case UserRole.PRINCIPAL:
      return [UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT];
    case UserRole.TEACHER:
      return [UserRole.TEACHER, UserRole.STUDENT];
    case UserRole.STUDENT:
      return [UserRole.STUDENT];
    default:
      return [];
  }
};

export const calculateAttendancePercentage = (totalDays: number, presentDays: number): number => {
  if (totalDays === 0) return 0;
  return Math.round((presentDays / totalDays) * 100);
};