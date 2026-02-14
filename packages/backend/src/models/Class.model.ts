import mongoose, { Schema, Document } from 'mongoose';
import { IClass } from '../types';

export interface IClassDocument extends IClass, Document {}

const classSchema = new Schema<IClassDocument>(
  {
    className: {
      type: String,
      required: [true, 'Class name is required'],
      enum: {
        values: ['Nursery', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        message: '{VALUE} is not a valid class',
      },
    },
    sections: [{
      type: String,
      required: [true, 'At least one section is required'],
      uppercase: true,
      validate: {
        validator: function(sections: string[]) {
          return sections.length > 0 && sections.length <= 4;
        },
        message: 'Sections must be between 1 and 4',
      },
    }],
    classTeacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Class teacher is required'],
    },
    subjects: [{
      name: {
        type: String,
        required: true,
      },
      teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    }],
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
      validate: {
        validator: function(year: string) {
          const [start, end] = year.split('-').map(Number);
          return end === start + 1;
        },
        message: 'Academic year must be consecutive years',
      },
    },
    roomNumber: {
      type: String,
    },
    capacity: {
      type: Number,
      required: [true, 'Class capacity is required'],
      min: [10, 'Capacity must be at least 10'],
      max: [60, 'Capacity cannot exceed 60'],
      default: 40,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total students
classSchema.virtual('totalStudents', {
  ref: 'User',
  localField: '_id',
  foreignField: 'class',
  count: true,
  match: { role: 'student', isActive: true },
});

// Virtual for class teacher name
classSchema.virtual('classTeacherName', {
  ref: 'User',
  localField: 'classTeacher',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName' },
});

// Compound unique constraint
classSchema.index({ className: 1, academicYear: 1 }, { unique: true });

export const Class = mongoose.model<IClassDocument>('Class', classSchema);