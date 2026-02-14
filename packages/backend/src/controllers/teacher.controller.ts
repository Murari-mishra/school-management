import { Request, Response } from 'express';
import { Teacher } from '../models/Teacher.model';
import { Class } from '../models/Class.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export class TeacherController {
  static createTeacher = asyncHandler(async (req: Request, res: Response) => {
    const {
      email,
      password,
      fullName,
      qualification,
      specialization,
      subjects,
      employmentType,
      experience,
      phone,
      address,
      city,
      state,
      pincode,
      emergencyContact,
      previousSchool,
      bankAccount,
      panCard,
    } = req.body;

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      throw new ApiError(400, 'Teacher with this email already exists');
    }

    // Create new teacher
    const teacher = await Teacher.create({
      email,
      password,
      fullName,
      role: 'teacher',
      qualification,
      specialization,
      subjects,
      employmentType,
      experience,
      phone,
      address,
      city,
      state,
      pincode,
      emergencyContact,
      previousSchool,
      bankAccount,
      panCard,
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Teacher created successfully',
      data: {
        id: teacher._id,
        email: teacher.email,
        fullName: teacher.fullName,
        teacherId: (teacher as any).teacherId,
      },
      timestamp: new Date().toISOString(),
    });
  });

  static getAllTeachers = asyncHandler(async (_req: Request, res: Response) => {
    const teachers = await Teacher.find({ isActive: true })
      .select('fullName email phone teacherId specialization employmentType')
      .populate('assignedClasses.class', 'className')
      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: teachers.length,
      data: teachers,
      timestamp: new Date().toISOString(),
    });
  });

  static getTeacherById = asyncHandler(async (req: Request, res: Response) => {
    const teacher = await Teacher.findById(req.params.id)
      .select('-password')
      .populate('assignedClasses.class', 'className sections');

    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: teacher,
      timestamp: new Date().toISOString(),
    });
  });

  static updateTeacher = asyncHandler(async (req: Request, res: Response) => {
    const updates = req.body;

    // Don't allow updating email, role, or password here
    delete updates.email;
    delete updates.role;
    delete updates.password;

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Teacher updated successfully',
      data: teacher,
      timestamp: new Date().toISOString(),
    });
  });

  static deleteTeacher = asyncHandler(async (req: Request, res: Response) => {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Teacher deactivated successfully',
      timestamp: new Date().toISOString(),
    });
  });

  static getTeacherClasses = asyncHandler(async (req: Request, res: Response) => {
    const teacher = await Teacher.findById(req.params.id)
      .select('assignedClasses')
      .populate('assignedClasses.class', 'className sections academicYear');

    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: teacher.assignedClasses || [],
      timestamp: new Date().toISOString(),
    });
  });

  static assignClass = asyncHandler(async (req: Request, res: Response) => {
    const { classId, section, subject } = req.body;

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      throw new ApiError(404, 'Class not found');
    }

    // Check if teacher already assigned to this class/section
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    const alreadyAssigned = teacher.assignedClasses.some(
      (cls: any) => cls.class.toString() === classId && cls.section === section
    );

    if (alreadyAssigned) {
      throw new ApiError(400, 'Teacher already assigned to this class and section');
    }

    // Add class to teacher
    teacher.assignedClasses.push({
      class: classId as any,
      section,
      subject,
    });

    await teacher.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Class assigned successfully',
      data: teacher.assignedClasses,
      timestamp: new Date().toISOString(),
    });
  });

  static removeClass = asyncHandler(async (req: Request, res: Response) => {
    const { classId, section } = req.params;

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          assignedClasses: {
            class: classId,
            section: section,
          },
        },
      },
      { new: true }
    );

    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Class removed successfully',
      data: teacher.assignedClasses,
      timestamp: new Date().toISOString(),
    });
  });
}

export default TeacherController;
