import { Request, Response } from 'express';
import { Class } from '../models/Class.model';
import { Teacher } from '../models/Teacher.model';
import { Student } from '../models/Student.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export class ClassController {
  static createClass = asyncHandler(async (req: Request, res: Response) => {
    const { className, sections, classTeacher, subjects, academicYear, roomNumber, capacity } = req.body;

    // Checking class if exist
    const existingClass = await Class.findOne({ className, academicYear });
    if (existingClass) {
      throw new ApiError(400, `Class ${className} already exists for academic year ${academicYear}`);
    }

    //teacher exists
    const teacher = await Teacher.findById(classTeacher);
    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    const newClass = await Class.create({
      className,
      sections,
      classTeacher,
      subjects,
      academicYear,
      roomNumber,
      capacity: capacity || 40,
    });

    // Update teacher's assigned classes
    teacher.assignedClasses.push({
      class: newClass._id as any,
      section: sections[0],
      subject: (subjects && subjects.length) ? (subjects[0] as any).name : 'General',
    });
    await teacher.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      data: newClass,
      timestamp: new Date().toISOString(),
    });
  });

  static getAllClasses = asyncHandler(async (req: Request, res: Response) => {
    const { academicYear } = req.query;
    
    const filter: any = {};
    if (academicYear) filter.academicYear = academicYear;

    const classes = await Class.find(filter)
      .populate('classTeacher', 'fullName teacherId email')
      .sort({ className: 1 });

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: classes.length,
      data: classes,
      timestamp: new Date().toISOString(),
    });
  });

  static getClassById = asyncHandler(async (req: Request, res: Response) => {
    const classData = await Class.findById(req.params.id)
      .populate('classTeacher', 'fullName email phone subjects')
      .populate({
        path: 'students',
        select: 'fullName rollNumber parentEmail parentPhone',
        match: { isActive: true },
        options: { sort: { rollNumber: 1 } },
      });

    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: classData,
      timestamp: new Date().toISOString(),
    });
  });

  static updateClass = asyncHandler(async (req: Request, res: Response) => {
    const updates = req.body;
    
    // Don't allow changing academic year
    if (updates.academicYear) {
      delete updates.academicYear;
    }

    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('classTeacher', 'fullName');

    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: classData,
      timestamp: new Date().toISOString(),
    });
  });

  static deleteClass = asyncHandler(async (req: Request, res: Response) => {
    const classData = await Class.findByIdAndDelete(req.params.id);

    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    // Remove class from teacher's assigned classes
    await Teacher.updateOne(
      { _id: classData.classTeacher },
      { $pull: { assignedClasses: { class: classData._id } } }
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Class deleted successfully',
      timestamp: new Date().toISOString(),
    });
  });

  static getClassesForDropdown = asyncHandler(async (_req: Request, res: Response) => {
    const classes = await Class.find({})
      .select('className sections academicYear')
      .sort({ className: 1 });

    const formattedClasses = classes.map(cls => ({
      _id: cls._id,
      label: `Class ${cls.className} (${cls.academicYear})`,
      className: cls.className,
      sections: cls.sections,
      academicYear: cls.academicYear,
    }));

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: formattedClasses,
      timestamp: new Date().toISOString(),
    });
  });

  static getClassStats = asyncHandler(async (req: Request, res: Response) => {
    const classId = req.params.id;
    
   
    const totalStudents = await Student.countDocuments({
      class: classId,
      isActive: true,
    });

    
    const studentsBySection = await Student.aggregate([
      { $match: { class: classId, isActive: true } },
      { $group: { _id: '$section', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        totalStudents,
        studentsBySection,
      },
      timestamp: new Date().toISOString(),
    });
  });

  static getClassStudents = asyncHandler(async (req: Request, res: Response) => {
    const { classId, section } = req.params;

    const students = await Student.find({
      class: classId,
      section: section,
      isActive: true,
    })
      .select('fullName rollNumber email parentEmail studentId')
      .sort({ rollNumber: 1 });

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: students.length,
      data: students,
      timestamp: new Date().toISOString(),
    });
  });
}

export default ClassController;