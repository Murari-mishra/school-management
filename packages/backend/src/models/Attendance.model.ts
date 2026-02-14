import mongoose, { Schema, Document } from 'mongoose';
import { IAttendance, AttendanceStatus } from '../types';

export interface IAttendanceDocument extends IAttendance, Document {}

const attendanceSchema = new Schema<IAttendanceDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      uppercase: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: [true, 'Status is required'],
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Marked by is required'],
    },
    remarks: {
      type: String,
      maxlength: [200, 'Remarks cannot exceed 200 characters'],
    },
    lateMinutes: {
      type: Number,
      min: [0, 'Late minutes cannot be negative'],
      max: [240, 'Late minutes cannot exceed 4 hours'],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals for populated fields
attendanceSchema.virtual('studentName', {
  ref: 'User',
  localField: 'student',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName rollNumber' },
});

attendanceSchema.virtual('className', {
  ref: 'Class',
  localField: 'class',
  foreignField: '_id',
  justOne: true,
  options: { select: 'className' },
});

attendanceSchema.virtual('markedByName', {
  ref: 'User',
  localField: 'markedBy',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName' },
});

// Compound unique constraint - one attendance per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Indexes for faster queries
attendanceSchema.index({ class: 1, section: 1, date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ markedBy: 1 });
attendanceSchema.index({ date: -1 });

export const Attendance = mongoose.model<IAttendanceDocument>('Attendance', attendanceSchema);