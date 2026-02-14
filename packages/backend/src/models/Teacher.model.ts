import mongoose, { Schema } from 'mongoose';
import { User } from './User.model';
import { ITeacher } from '../types';

export interface ITeacherDocument extends ITeacher, mongoose.Document {}

const assignedClassSchema = new Schema({
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  section: {
    type: String,
    required: true,
    uppercase: true,
  },
  subject: {
    type: String,
    required: true,
  },
});

const teacherSchema = new Schema<ITeacherDocument>(
  {
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
      unique: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
    },
    specialization: [{
      type: String,
      required: [true, 'At least one specialization is required'],
    }],
    subjects: [{
      type: String,
      required: [true, 'At least one subject is required'],
    }],
    assignedClasses: [assignedClassSchema],
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      default: Date.now,
    },
    employmentType: {
      type: String,
      enum: ['permanent', 'contract', 'temporary'],
      required: [true, 'Employment type is required'],
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
    },
    previousSchool: {
      type: String,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      validate: {
        validator: function(v: string) {
          return /^[0-9]{6}$/.test(v);
        },
        message: 'Please enter a valid 6-digit pincode',
      },
    },
    emergencyContact: {
      type: String,
      required: [true, 'Emergency contact is required'],
      validate: {
        validator: function(v: string) {
          return /^[0-9]{10}$/.test(v);
        },
        message: 'Please enter a valid 10-digit phone number',
      },
    },
    bankAccount: {
      type: String,
    },
    panCard: {
      type: String,
      validate: {
        validator: function(v: string) {
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
        },
        message: 'Please enter a valid PAN card number',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ 'assignedClasses.class': 1 });
teacherSchema.index({ subjects: 1 });
teacherSchema.index({ fullName: 'text' });

// Auto-generate teacher ID
teacherSchema.pre('save', async function(next) {
  if (!this.teacherId) {
    const count = await Teacher.countDocuments() + 1;
    this.teacherId = `TCH${count.toString().padStart(4, '0')}`;
  }
  next();
});

export const Teacher = User.discriminator<ITeacherDocument>('teacher', teacherSchema);