import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Student } from '../models/Student.model';
import { Teacher } from '../models/Teacher.model';
import { UserRole } from '../types';

export const userController = {
  // Get all users (for principal only)
  getAllUsers: async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find().select('-password');
      
      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch users',
      });
    }
  },

  // Get user by ID
  getUserById: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch user',
      });
    }
  },

  // Create student
  createStudent: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        email,
        password,
        fullName,
        dateOfBirth,
        gender,
        address,
        parentName,
        parentEmail,
        parentPhone,
        class: classId,
        section,
        rollNumber,
      } = req.body;

      // Check if student already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'Student with this email already exists',
        });
        return;
      }

      // Generate student ID
      const year = new Date().getFullYear().toString().slice(2);
      const studentId = `STU${year}${rollNumber.toString().padStart(4, '0')}`;

      const student = await Student.create({
        email,
        password, // will be hashed by pre-save hook
        role: UserRole.STUDENT,
        studentId,
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        address,
        parentName,
        parentEmail,
        parentPhone,
        class: classId,
        section,
        rollNumber: parseInt(rollNumber),
        admissionDate: new Date(),
      });

      res.status(201).json({
        success: true,
        data: {
          id: student._id,
          email: student.email,
          studentId: student.studentId,
          fullName: student.fullName,
          class: student.class,
          section: student.section,
          rollNumber: student.rollNumber,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create student',
      });
    }
  },

  // Create teacher
  createTeacher: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        email,
        password,
        fullName,
        qualification,
        subjects,
        phone,
      } = req.body;

      // Check if teacher already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'Teacher with this email already exists',
        });
        return;
      }

      // Generate teacher ID
      const teacherId = `TCH${Math.floor(1000 + Math.random() * 9000)}`;

      const teacher = await Teacher.create({
        email,
        password, // will be hashed by pre-save hook
        role: UserRole.TEACHER,
        teacherId,
        fullName,
        qualification,
        subjects,
        phone,
        joiningDate: new Date(),
      });

      res.status(201).json({
        success: true,
        data: {
          id: teacher._id,
          email: teacher.email,
          teacherId: teacher.teacherId,
          fullName: teacher.fullName,
          subjects: teacher.subjects,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create teacher',
      });
    }
  },

  // Update user
  updateUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const updates = req.body;
      delete updates.password; // Prevent password update via this route
      delete updates.role; // Prevent role change via this route

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update user',
      });
    }
  },

  // Delete user (soft delete)
  deleteUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete user',
      });
    }
  },
};