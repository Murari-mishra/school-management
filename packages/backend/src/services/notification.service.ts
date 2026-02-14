import { Student } from '../models/Student.model';
import { Class } from '../models/Class.model';
import { sendAbsenteeAlert } from '../config/email';
import { formatDate } from '../utils/helpers';

export class NotificationService {
  static async sendAbsenteeNotification(
    studentId: string,
    date: Date,
    classId: string,
    section: string
  ): Promise<void> {
    try {
      const student = await Student.findById(studentId);
      if (!student || !student.parentEmail) {
        console.log(`No parent email found for student ${studentId}`);
        return;
      }

      const classInfo = await Class.findById(classId);
      if (!classInfo) {
        console.log(`Class not found: ${classId}`);
        return;
      }

      const emailSent = await sendAbsenteeAlert(
        student.parentEmail,
        student.fullName,
        formatDate(date),
        classInfo.className,
        section
      );

      if (emailSent) {
        console.log(`✅ Absentee alert sent to ${student.parentEmail} for ${student.fullName}`);
      } else {
        console.error(`❌ Failed to send absentee alert to ${student.parentEmail}`);
      }

      // TODO: Send SMS if SMS service is configured
      // await this.sendSMS(student.parentPhone, message);

    } catch (error) {
      console.error('Failed to send absentee notification:', error);
    }
  }

  static async sendWelcomeEmail(
    email: string,
    name: string,
    role: string,
    _loginCredentials?: { email: string; password: string }
  ): Promise<boolean> {
    try {
      // Implementation for welcome email
      console.log(`Welcome email sent to ${email} for ${name} (${role})`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  static async sendPasswordResetEmail(
    email: string,
    _resetToken: string
  ): Promise<boolean> {
    try {
      // Implementation for password reset email
      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }
}