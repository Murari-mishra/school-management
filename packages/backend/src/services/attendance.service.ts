import mongoose from 'mongoose';
import { Request } from 'express';
import { Attendance } from '../models/Attendance.model';
import { NotificationService } from './notification.service';
import { AuditLog } from '../models/AuditLog.model';
import { AttendanceStatus, IAttendance, EventType } from '../types';

export class AttendanceService {
  static async markAttendance(
    studentId: string,
    classId: string,
    section: string,
    date: Date,
    status: AttendanceStatus,
    markedBy: any,
    remarks?: string,
    lateMinutes?: number,
    req?: Request
  ): Promise<IAttendance> {
    // Check if attendance already marked for this student on this date
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      student: studentId,
      date: { $gte: targetDate, $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.remarks = remarks || '';
      existingAttendance.lateMinutes = lateMinutes;
      existingAttendance.markedBy = markedBy;
      await existingAttendance.save();
      
      // Create audit log
      if (req) {
        await AuditLog.create({
          user: (req as any).user?._id,
          userEmail: (req as any).user?.email,
          userRole: (req as any).user?.role,
          event: EventType.UPDATE,
          resource: 'attendance',
          resourceId: existingAttendance._id.toString(),
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      }
      
      // Send notification if status changed to absent
      if (status === AttendanceStatus.ABSENT) {
        await NotificationService.sendAbsenteeNotification(studentId, date, classId, section);
      }
      
      return existingAttendance;
    }

    // Create new attendance
    const attendance = await Attendance.create({
      student: new mongoose.Types.ObjectId(studentId),
      class: new mongoose.Types.ObjectId(classId),
      section,
      date: targetDate,
      status,
      markedBy: new mongoose.Types.ObjectId(markedBy),
      remarks,
      lateMinutes,
    });

    // Create audit log
    if (req) {
      await AuditLog.create({
        user: (req as any).user?._id,
        userEmail: (req as any).user?.email,
        userRole: (req as any).user?.role,
        event: EventType.CREATE,
        resource: 'attendance',
        resourceId: attendance._id.toString(),
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    }

    // If student is absent, send notification to parent
    if (status === AttendanceStatus.ABSENT) {
      await NotificationService.sendAbsenteeNotification(studentId, date, classId, section);
    }

    return attendance;
  }

  static async markBulkAttendance(
    attendanceData: Array<{
      studentId: string;
      status: AttendanceStatus;
      remarks?: string;
      lateMinutes?: number;
    }>,
    classId: string,
    section: string,
    date: Date,
    markedBy: any,
    req?: Request
  ): Promise<{ results: IAttendance[]; errors: any[] }> {
    const results: IAttendance[] = [];
    const errors: any[] = [];

    for (const data of attendanceData) {
      try {
        const attendance = await this.markAttendance(
          data.studentId,
          classId,
          section,
          date,
          data.status,
          markedBy,
          data.remarks,
          data.lateMinutes,
          req
        );
        results.push(attendance);
      } catch (error: any) {
        errors.push({
          studentId: data.studentId,
          error: error.message,
        });
      }
    }

    return { results, errors };
  }

  static async getAttendanceByStudent(
    studentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<IAttendance[]> {
    const filter: any = { student: studentId };
    
    if (startDate && endDate) {
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    return await Attendance.find(filter)
      .populate('class', 'className')
      .populate('markedBy', 'fullName')
      .sort({ date: -1 });
  }

  static async getAttendanceByClass(
    classId: string,
    section: string,
    date: Date
  ): Promise<IAttendance[]> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return await Attendance.find({
      class: classId,
      section,
      date: { $gte: targetDate, $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) },
    })
      .populate('student', 'fullName rollNumber')
      .populate('markedBy', 'fullName')
      .sort({ 'student.rollNumber': 1 });
  }

  static async getAttendanceStats(studentId: string): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    attendancePercentage: number;
  }> {
    const attendanceRecords = await Attendance.find({ student: studentId });
    
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const absentDays = attendanceRecords.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const lateDays = attendanceRecords.filter(a => a.status === AttendanceStatus.LATE).length;
    const leaveDays = attendanceRecords.filter(a => a.status === AttendanceStatus.LEAVE).length;
    
    const attendancePercentage = totalDays > 0 
      ? Math.round((presentDays / totalDays) * 100) 
      : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      attendancePercentage,
    };
  }

  static async getMonthlyReport(
    classId: string,
    section: string,
    month: number,
    year: number
  ): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      class: classId,
      section,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate('student', 'fullName rollNumber')
      .sort({ date: 1 });

    // Group by student
    const studentMap = new Map();
    
    attendance.forEach(record => {
      const studentId = (record.student as any)._id.toString();
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          student: record.student,
          attendance: [],
        });
      }
      studentMap.get(studentId).attendance.push({
        date: record.date,
        status: record.status,
        remarks: record.remarks,
        lateMinutes: record.lateMinutes,
      });
    });

    return Array.from(studentMap.values());
  }

  static async getStudentAttendanceReport(
    studentId: string,
    academicYear: string
  ): Promise<any> {
    // academicYear format: "2024-2025"
    const [startYear, endYear] = academicYear.split('-').map(Number);
    const startDate = new Date(startYear, 3, 1); // April 1st
    const endDate = new Date(endYear, 2, 31); // March 31st

    return await this.getAttendanceByStudent(studentId, startDate, endDate);
  }
}