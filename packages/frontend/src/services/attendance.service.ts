import api from './api';
import { Attendance, AttendanceStatus, ApiResponse } from '../types/user.types';

export const attendanceService = {
  markAttendance: async (data: {
    studentId: string;
    classId: string;
    section: string;
    date: string;
    status: AttendanceStatus;
    remarks?: string;
  }): Promise<ApiResponse<Attendance>> => {
    const response = await api.post('/attendance', data);
    return response.data;
  },

  markBulkAttendance: async (data: {
    classId: string;
    section: string;
    date: string;
    attendanceData: Array<{
      studentId: string;
      status: AttendanceStatus;
      remarks?: string;
    }>;
  }): Promise<ApiResponse<Attendance[]>> => {
    const response = await api.post('/attendance/bulk', data);
    return response.data;
  },

  getClassAttendance: async (classId: string, section: string, date?: string): Promise<ApiResponse<{
    date: string;
    marked: boolean;
    attendance: Attendance[];
    students?: any[];
  }>> => {
    const response = await api.get(`/attendance/class/${classId}/${section}`, {
      params: { date },
    });
    return response.data;
  },

  getStudentAttendance: async (studentId: string, startDate?: string, endDate?: string): Promise<ApiResponse<Attendance[]>> => {
    const response = await api.get(`/attendance/student/${studentId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getAttendanceStats: async (studentId: string): Promise<ApiResponse<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    attendancePercentage: number;
  }>> => {
    const response = await api.get(`/attendance/student/${studentId}/stats`);
    return response.data;
  },

  getMonthlyReport: async (classId: string, section: string, month?: number, year?: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/attendance/report/${classId}/${section}`, {
      params: { month, year },
    });
    return response.data;
  },

  updateAttendance: async (id: string, data: {
    status: AttendanceStatus;
    remarks?: string;
  }): Promise<ApiResponse<Attendance>> => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },
};