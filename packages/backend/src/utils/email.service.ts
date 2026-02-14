import nodemailer from 'nodemailer';
import config from '../config/env';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: false,
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });

  static async sendAbsentAlert(
    to: string,
    studentName: string,
    date: Date,
    className: string,
    section: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"School MIS" <${config.emailFrom}>`,
        to,
        subject: `⚠️ Attendance Alert: ${studentName} Absent`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #dc3545;">⚠️ Attendance Alert</h1>
            </div>
            
            <p>Dear Parent/Guardian,</p>
            
            <p>This is to inform you that your child <strong>${studentName}</strong> was marked <strong style="color: #dc3545;">Absent</strong> today.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">📋 Absence Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Student Name:</strong></td>
                  <td>${studentName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Class & Section:</strong></td>
                  <td>${className} - ${section}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Date:</strong></td>
                  <td>${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Status:</strong></td>
                  <td><span style="color: #dc3545; font-weight: bold;">Absent</span></td>
                </tr>
              </table>
            </div>
            
            <p>Please ensure your child attends school regularly. If the absence was due to illness or any other valid reason, please submit a leave note to the class teacher.</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>📝 Note:</strong> For leave applications or to report future absences, please contact the school office or send an email to the class teacher.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            
            <p style="color: #6c757d; font-size: 12px;">
              This is an automated message from School MIS. Please do not reply to this email.<br>
              For any queries, please contact the school administration.
            </p>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 11px;">
              © ${new Date().getFullYear()} School MIS. All rights reserved.
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Failed to send absent alert email:', error);
      return false;
    }
  }

  static async sendLateAlert(
    to: string,
    studentName: string,
    _date: Date,
    lateMinutes: number
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"School MIS" <${config.emailFrom}>`,
        to,
        subject: `⏰ Late Arrival Alert: ${studentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #ffc107;">⏰ Late Arrival Alert</h1>
            </div>
            
            <p>Dear Parent/Guardian,</p>
            
            <p>This is to inform you that your child <strong>${studentName}</strong> was marked <strong style="color: #ffc107;">Late</strong> by <strong>${lateMinutes} minutes</strong> today.</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                Please ensure your child arrives on time to avoid missing important lessons.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            
            <p style="color: #6c757d; font-size: 12px;">
              This is an automated message from School MIS.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Failed to send late alert email:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(
    to: string,
    name: string,
    _role: string,
    loginCredentials?: { email: string; password: string }
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"School MIS" <${config.emailFrom}>`,
        to,
        subject: `🎉 Welcome to School MIS, ${name}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #28a745;">🎉 Welcome Aboard!</h1>
            </div>
            
            <p>Dear ${name},</p>
            
            <p>Welcome to <strong>School MIS</strong>! Your account has been created successfully.</p>
            
            ${loginCredentials ? `
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h3 style="margin-top: 0; color: #0d47a1;">🔐 Login Credentials</h3>
                <p><strong>Email:</strong> ${loginCredentials.email}</p>
                <p><strong>Password:</strong> ${loginCredentials.password}</p>
                <p style="color: #d32f2f; margin-bottom: 0;">
                  <strong>⚠️ Please change your password after first login.</strong>
                </p>
              </div>
            ` : ''}
            
            <p>You can access the system at: <a href="http://localhost:3000">http://localhost:3000</a></p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            
            <p style="color: #6c757d; font-size: 12px;">
              Best regards,<br>
              School MIS Team
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }
}

export default EmailService;
