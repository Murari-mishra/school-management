import api from './api';
import { Class, ApiResponse } from '../types/user.types';

export const classService = {
  getAllClasses: async (academicYear?: string): Promise<ApiResponse<Class[]>> => {
    const response = await api.get('/classes', { params: { academicYear } });
    return response.data;
  },

  getClassesForDropdown: async (): Promise<ApiResponse<Array<{
    _id: string;
    label: string;
    className: string;
    sections: string[];
    academicYear: string;
  }>>> => {
    const response = await api.get('/classes/dropdown');
    return response.data;
  },

  getClassById: async (id: string): Promise<ApiResponse<Class>> => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  getClassStats: async (id: string): Promise<ApiResponse<{
    totalStudents: number;
    studentsBySection: Array<{ _id: string; count: number }>;
  }>> => {
    const response = await api.get(`/classes/${id}/stats`);
    return response.data;
  },

  createClass: async (data: {
    className: string;
    sections: string[];
    classTeacher: string;
    subjects: string[];
    academicYear: string;
  }): Promise<ApiResponse<Class>> => {
    const response = await api.post('/classes', data);
    return response.data;
  },

  updateClass: async (id: string, data: Partial<Class>): Promise<ApiResponse<Class>> => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },

  deleteClass: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
};