export const CLASS_NAMES = [
  'Nursery', 'KG', '1', '2', '3', '4', '5', 
  '6', '7', '8', '9', '10', '11', '12'
] as const;

export const DEFAULT_SECTIONS = ['A', 'B', 'C', 'D'];

export const COMMON_SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'Social Studies',
  'Hindi',
  'Computer Science',
  'Physical Education',
  'Art',
  'Music',
  'General Knowledge'
];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  LEAVE: 'leave',
} as const;

export const API_RESPONSE = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  DUPLICATE_ENTRY: 'Duplicate entry found',
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  FETCHED: 'Resource fetched successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
} as const;