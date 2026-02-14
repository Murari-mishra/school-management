import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { Attendance } from '../models/Attendance.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { AttendanceStatus } from '../types';

export class AttendanceController {
  static markAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { studentId, classId, section, date, status, remarks, lateMinutes } = req.body;

    if (!studentId || !classId || !section || !date || !status) {
      throw new ApiError(400, 'Missing required fields');
    }

    const attendance = await AttendanceService.markAttendance(
      studentId,
      classId,
      section,
      new Date(date),
      status as AttendanceStatus,
      (req as any).user._id,
      remarks,
      lateMinutes,
      req
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Attendance marked successfully',
      data: attendance,
      timestamp: new Date().toISOString(),
    });
  });

  static markBulkAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { classId, section, date, attendanceData } = req.body;

    if (!classId || !section || !date || !attendanceData || !attendanceData.length) {
      throw new ApiError(400, 'Missing required fields or attendance data');
    }

    const result = await AttendanceService.markBulkAttendance(
      attendanceData,
      classId,
      section,
      new Date(date),
      (req as any).user._id,
      req
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: result.errors.length 
        ? 'Attendance marked with some errors' 
        : 'All attendance marked successfully',
      data: {
        successful: result.results,
        errors: result.errors,
      },
      timestamp: new Date().toISOString(),
    });
  });

  static getClassAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { classId, section } = req.params;
    const { date = new Date().toISOString() } = req.query;

    if (!classId || !section) {
      throw new ApiError(400, 'Class ID and section are required');
    }

    const targetDate = new Date(date as string);
    targetDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      class: classId,
      section,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .populate('student', 'fullName rollNumber')
      .populate('markedBy', 'fullName')
      .sort({ 'student.rollNumber': 1 });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        date: targetDate,
        marked: attendance.length > 0,
        attendance,
      },
      timestamp: new Date().toISOString(),
    });
  });

  static getStudentAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;

    const filter: any = { student: studentId };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('class', 'className')
      .populate('markedBy', 'fullName')
      .sort({ date: -1 })
      .limit(parseInt(limit as string));

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: attendance.length,
      data: attendance,
      timestamp: new Date().toISOString(),
    });
  });

  static getAttendanceStats = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    let stats;
    if (academicYear) {
      stats = await AttendanceService.getStudentAttendanceReport(studentId, academicYear as string);
    } else {
      const aggregation = await Attendance.aggregate([
        { $match: { student: studentId } },
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

      stats = aggregation[0] || {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        leaveDays: 0,
      };
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  });

  static getMonthlyReport = asyncHandler(async (req: Request, res: Response) => {
    const { classId, section } = req.params;
    const { month, year } = req.query;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month as string) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year as string) : currentDate.getFullYear();

    const report = await AttendanceService.getMonthlyReport(
      classId,
      section,
      targetMonth + 1,
      targetYear
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        month: targetMonth + 1,
        year: targetYear,
        classId,
        section,
        report,
      },
      timestamp: new Date().toISOString(),
    });
  });

  static updateAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, remarks, lateMinutes } = req.body;

    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      throw new ApiError(404, 'Attendance record not found');
    }

    attendance.status = status || attendance.status;
    attendance.remarks = remarks !== undefined ? remarks : attendance.remarks;
    attendance.lateMinutes = lateMinutes !== undefined ? lateMinutes : attendance.lateMinutes;
    attendance.markedBy = (req as any).user._id;
    
    await attendance.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Attendance updated successfully',
      data: attendance,
      timestamp: new Date().toISOString(),
    });
  });

  static getTodaySummary = asyncHandler(async (_req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setHours(23, 59, 59, 999);

    const summary = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lte: tomorrow,
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      total: 0,
    };

    summary.forEach((item: any) => {
      formatted[item._id as keyof typeof formatted] = item.count;
      formatted.total += item.count;
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: formatted,
      timestamp: new Date().toISOString(),
    });
  });
}

export default AttendanceController;