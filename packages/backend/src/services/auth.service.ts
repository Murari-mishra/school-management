import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request } from 'express';
import { User } from '../models/User.model';
import { Student } from '../models/Student.model';
import { Teacher } from '../models/Teacher.model';
import { AuditLog } from '../models/AuditLog.model';
import { Notification } from '../models/Notification.model';
import config from '../config/env';
import { UserRole, LoginResponse, EventType, NotificationType } from '../types';

export class AuthService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;

  static async login(
    email: string,
    password: string,
    req: Request
  ): Promise<LoginResponse> {
    // Find user
    const user = await User.findOne({ email })
      .select('+password +loginAttempts +lockUntil');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 1000 / 60
      );
      throw new Error(`Account is locked. Try again in ${remainingTime} minutes`);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact administrator');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - (user.loginAttempts || 0);
      
      if (remainingAttempts <= 0) {
        throw new Error('Account is locked. Try again after 30 minutes');
      }
      
      throw new Error(`Invalid credentials. ${remainingAttempts} attempts remaining`);
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    user.lastActive = new Date();
    await user.save();

    // Generate tokens
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Get user details based on role
    let userDetails;
    if (user.role === UserRole.STUDENT) {
      const student = await Student.findById(user.id)
        .populate('class', 'className');
      userDetails = {
        id: student?._id.toString() || '',
        email: student?.email || '',
        role: student?.role || UserRole.STUDENT,
        fullName: student?.fullName || '',
        profilePicture: student?.profilePicture,
        studentId: student?.studentId,
        class: student?.class,
        section: student?.section,
        rollNumber: student?.rollNumber,
      };
    } else if (user.role === UserRole.TEACHER) {
      const teacher = await Teacher.findById(user.id);
      userDetails = {
        id: teacher?._id.toString() || '',
        email: teacher?.email || '',
        role: teacher?.role || UserRole.TEACHER,
        fullName: teacher?.fullName || '',
        profilePicture: teacher?.profilePicture,
        teacherId: teacher?.teacherId,
        subjects: teacher?.subjects,
      };
    } else {
      userDetails = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        fullName: 'Principal',
        profilePicture: user.profilePicture,
      };
    }

    // Create audit log
    await AuditLog.create({
      user: user.id,
      userEmail: user.email,
      userRole: user.role,
      event: EventType.LOGIN,
      resource: 'auth',
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    });

    return {
      success: true,
      token,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
      user: userDetails,
    };
  }

  static generateToken(userId: string): string {
    return jwt.sign(
      { 
        id: userId,
        iat: Date.now(),
        type: 'access'
      },
      config.jwtSecret as string,
      { 
        expiresIn: config.jwtExpire as any,
        algorithm: 'HS256'
      }
    );
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { 
        id: userId,
        iat: Date.now(),
        type: 'refresh'
      },
      config.jwtRefreshSecret as string,
      { 
        expiresIn: config.jwtRefreshExpire as any,
        algorithm: 'HS256'
      }
    );
  }

  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret as string) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const newToken = this.generateToken(user.id);
      return { token: newToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    req: Request
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    // Send notification
    await Notification.create({
      recipient: userId,
      type: NotificationType.SYSTEM,
      title: 'Password Changed',
      message: 'Your password was successfully changed',
      priority: 'high',
    });

    await AuditLog.create({
      user: userId,
      userEmail: user.email,
      userRole: user.role,
      event: EventType.UPDATE,
      resource: 'password',
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  }

  static async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    return resetToken;
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  static async updateLastActive(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
    });
  }
}