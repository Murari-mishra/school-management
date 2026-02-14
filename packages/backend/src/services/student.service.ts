import mongoose from 'mongoose';
import { Student } from '../models/Student.model';
import { Class } from '../models/Class.model';
import { Attendance } from '../models/Attendance.model';
import { Discipline } from '../models/Discipline.model';
import { AuditLog } from '../models/AuditLog.model';
import { Notification } from '../models/Notification.model';
import { IStudent, EventType, NotificationType } from '../types';
import { Request } from 'express';

export class StudentService {
  static async createStudent(
    studentData: Partial<IStudent>,
    req: Request
  ): Promise<IStudent> {
    // Check if class exists and has capacity
    const classData = await Class.findById(studentData.class);
    if (!classData) {
      throw new Error('Class not found');
    }

    // Check if section exists in class
    if (!classData.sections.includes(studentData.section!)) {
      throw new Error(`Section ${studentData.section} does not exist in this class`);
    }

    // Check if roll number is available
    const existingStudent = await Student.findOne({
      class: studentData.class,
      section: studentData.section,
      rollNumber: studentData.rollNumber,
    });

    if (existingStudent) {
      throw new Error(`Roll number ${studentData.rollNumber} is already taken in ${studentData.section}`);
    }

    // Check class capacity
    const studentCount = await Student.countDocuments({
      class: studentData.class,
      section: studentData.section,
      isActive: true,
    });

    if (studentCount >= classData.capacity) {
      throw new Error(`Class capacity of ${classData.capacity} reached for section ${studentData.section}`);
    }

    // Create student
    const student = await Student.create(studentData);

    // Create audit log
    await AuditLog.create({
      user: (req as any).user?._id,
      userEmail: (req as any).user?.email,
      userRole: (req as any).user?.role,
      event: EventType.CREATE,
      resource: 'student',
      resourceId: student._id.toString(),
      changes: studentData,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    // Create welcome notification
    await Notification.create({
      recipient: student._id,
      type: NotificationType.SYSTEM,
      title: 'Welcome to School MIS',
      message: `Welcome ${student.fullName}! Your student account has been created.`,
      priority: 'high',
    });

    // Notify parents via email (to be implemented)
    // await EmailService.sendWelcomeEmail(student.parentEmail, student.fullName);

    return student;
  }

  static async updateStudent(
    studentId: string,
    updates: Partial<IStudent>,
    req: Request
  ): Promise<IStudent> {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const oldData = student.toObject();
    Object.assign(student, updates);
    await student.save();

    // Create audit log
    await AuditLog.create({
      user: (req as any).user?._id,
      userEmail: (req as any).user?.email,
      userRole: (req as any).user?.role,
      event: EventType.UPDATE,
      resource: 'student',
      resourceId: student._id.toString(),
      changes: {
        before: oldData,
        after: student,
      },
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    return student;
  }

  static async deleteStudent(
    studentId: string,
    req: Request
  ): Promise<void> {
    const student = await Student.findByIdAndUpdate(
      studentId,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      throw new Error('Student not found');
    }

    await AuditLog.create({
      user: (req as any).user?._id,
      userEmail: (req as any).user?.email,
      userRole: (req as any).user?.role,
      event: EventType.DELETE,
      resource: 'student',
      resourceId: studentId,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    await Notification.create({
      recipient: student._id,
      type: NotificationType.SYSTEM,
      title: 'Account Deactivated',
      message: 'Your account has been deactivated. Please contact administration.',
      priority: 'high',
    });
  }

  static async getStudentWithDetails(studentId: string): Promise<any> {
    const student = await Student.findById(studentId)
      .populate('class', 'className academicYear');

    if (!student) {
      throw new Error('Student not found');
    }

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] },
          },
          leaveDays: {
            $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] },
          },
        },
      },
    ]);

    // Get recent attendance
    const recentAttendance = await Attendance.find({ student: studentId })
      .sort({ date: -1 })
      .limit(20)
      .populate('markedBy', 'fullName');

    // Get discipline records
    const disciplineRecords = await Discipline.find({ student: studentId })
      .sort({ date: -1 })
      .limit(10)
      .populate('teacher', 'fullName')
      .populate('resolvedBy', 'fullName');

    // Get notifications
    const notifications = await Notification.find({ recipient: studentId })
      .sort({ createdAt: -1 })
      .limit(20);

    return {
      student,
      attendanceStats: attendanceStats[0] || {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        leaveDays: 0,
        attendancePercentage: 0,
      },
      recentAttendance,
      disciplineRecords,
      notifications,
    };
  }

  static async searchStudents(
    query: string,
    filters?: {
      class?: string;
      section?: string;
      gender?: string;
      bloodGroup?: string;
    }
  ): Promise<IStudent[]> {
    const searchQuery: any = {
      role: 'student',
      isActive: true,
    };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (filters?.class) {
      searchQuery.class = filters.class;
    }

    if (filters?.section) {
      searchQuery.section = filters.section;
    }

    if (filters?.gender) {
      searchQuery.gender = filters.gender;
    }

    if (filters?.bloodGroup) {
      searchQuery.bloodGroup = filters.bloodGroup;
    }

    return Student.find(searchQuery)
      .populate('class', 'className')
      .sort({ class: 1, section: 1, rollNumber: 1 })
      .limit(50);
  }

  static async transferStudent(
    studentId: string,
    newClassId: string,
    newSection: string,
    newRollNumber: number,
    req: Request
  ): Promise<IStudent> {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Check if new class exists
    const newClass = await Class.findById(newClassId);
    if (!newClass) {
      throw new Error('New class not found');
    }

    // Check if section exists
    if (!newClass.sections.includes(newSection)) {
      throw new Error(`Section ${newSection} does not exist in new class`);
    }

    // Check if roll number is available
    const existingStudent = await Student.findOne({
      class: newClassId,
      section: newSection,
      rollNumber: newRollNumber,
      _id: { $ne: studentId },
    });

    if (existingStudent) {
      throw new Error(`Roll number ${newRollNumber} is already taken in ${newSection}`);
    }

    // Store old data for audit
    const oldData = {
      class: student.class,
      section: student.section,
      rollNumber: student.rollNumber,
    };

    // Update student
    student.class = new mongoose.Types.ObjectId(newClassId);
    student.section = newSection;
    student.rollNumber = newRollNumber;
    await student.save();

    // Create audit log
    await AuditLog.create({
      user: (req as any).user?._id,
      userEmail: (req as any).user?.email,
      userRole: (req as any).user?.role,
      event: EventType.UPDATE,
      resource: 'student',
      resourceId: studentId,
      changes: {
        before: oldData,
        after: {
          class: newClassId,
          section: newSection,
          rollNumber: newRollNumber,
        },
      },
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    // Create notification
    await Notification.create({
      recipient: studentId,
      type: NotificationType.ACADEMIC,
      title: 'Class Transfer',
      message: `You have been transferred to Class ${newClass.className} - Section ${newSection}`,
      priority: 'high',
    });

    return student;
  }

  static async getAttendanceReport(
    studentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const match: any = { student: studentId };
    
    if (startDate && endDate) {
      match.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const report = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] },
          },
          leaveDays: {
            $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    return report;
  }
}
