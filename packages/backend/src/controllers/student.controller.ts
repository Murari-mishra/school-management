import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';
import { Student } from '../models/Student.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export class StudentController {
  static createStudent = asyncHandler(async (req: Request, res: Response) => {
    const studentData = req.body;

    // Validate required fields
    const requiredFields = [
      'email', 'password', 'fullName', 'dateOfBirth', 'gender',
      'address', 'city', 'state', 'pincode', 'parentName',
      'parentEmail', 'parentPhone', 'emergencyContact', 'class',
      'section', 'rollNumber'
    ];

    for (const field of requiredFields) {
      if (!studentData[field]) {
        throw new ApiError(400, `${field} is required`);
      }
    }

    const student = await StudentService.createStudent(studentData, req);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Student created successfully',
      data: student,
      timestamp: new Date().toISOString(),
    });
  });

  static getAllStudents = asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 20,
      class: className,
      section,
      sortBy = 'rollNumber',
      order = 'asc',
    } = req.query;

    const filter: any = { role: 'student', isActive: true };

    if (className) filter.class = className;
    if (section) filter.section = section;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortBy as string] = sortOrder;

    const students = await Student.find(filter)
      .populate('class', 'className')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Student.countDocuments(filter);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: students,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      timestamp: new Date().toISOString(),
    });
  });

  static getStudentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const studentData = await StudentService.getStudentWithDetails(id);

    if (!studentData) {
      throw new ApiError(404, 'Student not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: studentData,
      timestamp: new Date().toISOString(),
    });
  });

  static updateStudent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.studentId;
    delete updates.admissionDate;

    const student = await StudentService.updateStudent(id, updates, req);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Student updated successfully',
      data: student,
      timestamp: new Date().toISOString(),
    });
  });

  static deleteStudent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await StudentService.deleteStudent(id, req);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Student deactivated successfully',
      timestamp: new Date().toISOString(),
    });
  });

  static searchStudents = asyncHandler(async (req: Request, res: Response) => {
    const { query, class: className, section, gender, bloodGroup } = req.query;

    if (!query) {
      throw new ApiError(400, 'Search query is required');
    }

    const filters = {
      class: className as string,
      section: section as string,
      gender: gender as string,
      bloodGroup: bloodGroup as string,
    };

    const students = await StudentService.searchStudents(
      query as string,
      filters
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: students.length,
      data: students,
      timestamp: new Date().toISOString(),
    });
  });

  static getStudentsByClass = asyncHandler(async (req: Request, res: Response) => {
    const { classId, section } = req.params;

    const students = await Student.find({
      class: classId,
      section,
      role: 'student',
      isActive: true,
    })
      .populate('class', 'className')
      .sort({ rollNumber: 1 });

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: students.length,
      data: students,
      timestamp: new Date().toISOString(),
    });
  });

  static transferStudent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newClassId, newSection, newRollNumber } = req.body;

    if (!newClassId || !newSection || !newRollNumber) {
      throw new ApiError(400, 'New class, section, and roll number are required');
    }

    const student = await StudentService.transferStudent(
      id,
      newClassId,
      newSection,
      newRollNumber,
      req
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Student transferred successfully',
      data: student,
      timestamp: new Date().toISOString(),
    });
  });

  static getAttendanceReport = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate, academicYear } = req.query;

    let report;
    if (academicYear) {
      // academicYear expected in format "YYYY-YYYY"
      const [startY, endY] = (academicYear as string).split('-').map(Number);
      const start = new Date(startY, 3, 1); // academic year starts April 1
      const end = new Date(endY, 2, 31); // ends March 31
      report = await StudentService.getAttendanceReport(id, start, end);
    } else {
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      report = await StudentService.getAttendanceReport(id, start, end);
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: report,
      timestamp: new Date().toISOString(),
    });
  });

  static uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { profilePictureUrl } = req.body;

    if (!profilePictureUrl) {
      throw new ApiError(400, 'Profile picture URL is required');
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { profilePicture: profilePictureUrl },
      { new: true }
    );

    if (!student) {
      throw new ApiError(404, 'Student not found');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Profile picture updated successfully',
      data: { profilePicture: student.profilePicture },
      timestamp: new Date().toISOString(),
    });
  });
}

export default StudentController;
