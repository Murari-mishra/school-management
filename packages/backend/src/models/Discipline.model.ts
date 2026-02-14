import mongoose, { Schema, Document } from 'mongoose';
import { IDisciplineRecord, DisciplineType, SeverityLevel } from '../types';

export interface IDisciplineDocument extends IDisciplineRecord, Document {}

const disciplineSchema = new Schema<IDisciplineDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    type: {
      type: String,
      enum: Object.values(DisciplineType),
      required: [true, 'Type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    severity: {
      type: String,
      enum: Object.values(SeverityLevel),
      required: [true, 'Severity is required'],
    },
    actionTaken: {
      type: String,
      maxlength: [500, 'Action taken cannot exceed 500 characters'],
    },
    actionBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    actionDate: {
      type: Date,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedDate: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
disciplineSchema.virtual('studentName', {
  ref: 'User',
  localField: 'student',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName' },
});

disciplineSchema.virtual('teacherName', {
  ref: 'User',
  localField: 'teacher',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName' },
});

// Indexes
disciplineSchema.index({ student: 1, date: -1 });
disciplineSchema.index({ teacher: 1 });
disciplineSchema.index({ type: 1 });
disciplineSchema.index({ severity: 1 });
disciplineSchema.index({ resolved: 1 });

export const Discipline = mongoose.model<IDisciplineDocument>('Discipline', disciplineSchema);