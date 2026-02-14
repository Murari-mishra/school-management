import mongoose, { Schema } from 'mongoose';
import { User } from './User.model';
import { IStudent } from '../types';

export interface IStudentDocument extends IStudent, mongoose.Document {}

const studentSchema = new Schema<IStudentDocument>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function(v: Date) {
          const age = new Date().getFullYear() - v.getFullYear();
          return age >= 3 && age <= 20;
        },
        message: 'Student age must be between 3 and 20 years',
      },
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      maxlength: [200, 'Address cannot exceed 200 characters'],
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
    parentName: {
      type: String,
      required: [true, 'Parent name is required'],
      maxlength: [100, 'Parent name cannot exceed 100 characters'],
    },
    parentEmail: {
      type: String,
      required: [true, 'Parent email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    parentPhone: {
      type: String,
      required: [true, 'Parent phone is required'],
      validate: {
        validator: function(v: string) {
          return /^[0-9]{10}$/.test(v);
        },
        message: 'Please enter a valid 10-digit phone number',
      },
    },
    parentOccupation: {
      type: String,
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
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    medicalConditions: {
      type: String,
      default: 'None',
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
    rollNumber: {
      type: Number,
      required: [true, 'Roll number is required'],
      min: [1, 'Roll number must be at least 1'],
      max: [100, 'Roll number cannot exceed 100'],
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    previousSchool: {
      type: String,
    },
    transportRequired: {
      type: Boolean,
      default: false,
    },
    busRoute: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for age
studentSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Compound unique constraint
studentSchema.index({ class: 1, section: 1, rollNumber: 1 }, { unique: true });
studentSchema.index({ studentId: 1 });
studentSchema.index({ parentEmail: 1 });
studentSchema.index({ parentPhone: 1 });
studentSchema.index({ fullName: 'text' });

// Auto-generate student ID if not provided
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await Student.countDocuments() + 1;
    this.studentId = `STU${year}${count.toString().padStart(4, '0')}`;
  }
  next();
});

export const Student = User.discriminator<IStudentDocument>('student', studentSchema);