import nodemailer from 'nodemailer';
import config from './env';

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: false,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"School MIS" <${config.emailUser}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export const sendAbsenteeAlert = async (
  parentEmail: string,
  studentName: string,
  date: string,
  className: string,
  section: string
): Promise<boolean> => {
  const subject = `Attendance Alert: ${studentName} Absent`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545;">⚠️ Attendance Alert</h2>
      <p>Dear Parent/Guardian,</p>
      <p>Your child <strong>${studentName}</strong> was marked <strong>Absent</strong> on <strong>${date}</strong>.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Class:</strong> ${className} - Section ${section}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Status:</strong> <span style="color: #dc3545;">Absent</span></p>
      </div>
      <p>Please contact the school if this is unexpected or if you have any questions.</p>
      <hr>
      <p style="color: #6c757d; font-size: 12px;">
        This is an automated message from School MIS System.
      </p>
    </div>
  `;

  return await sendEmail(parentEmail, subject, html);
};