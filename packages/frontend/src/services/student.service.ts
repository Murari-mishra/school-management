import api from './api';
import { Student, ApiResponse } from '../types/user.types';

export const studentService = {
  getAllStudents: async (params?: {
    class?: string;
    section?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Student[]>> => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  searchStudents: async (query: string, filters?: {
    class?: string;
    section?: string;
  }): Promise<ApiResponse<Student[]>> => {
    const response = await api.get('/students/search', {
      params: { query, ...filters },
    });
    return response.data;
  },

  getStudentById: async (id: string): Promise<ApiResponse<{
    student: Student;
    attendanceStats: any;
    recentAttendance: any[];
    disciplineRecords: any[];
  }>> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  getStudentsByClass: async (classId: string, section: string): Promise<ApiResponse<Student[]>> => {
    const response = await api.get(`/students/class/${classId}/${section}`);
    return response.data;
  },

  updateStudent: async (id: string, data: Partial<Student>): Promise<ApiResponse<Student>> => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  uploadProfilePicture: async (id: string, profilePictureUrl: string): Promise<ApiResponse<{ profilePicture: string }>> => {
    const response = await api.patch(`/students/${id}/profile-picture`, { profilePictureUrl });
    return response.data;
  },
};