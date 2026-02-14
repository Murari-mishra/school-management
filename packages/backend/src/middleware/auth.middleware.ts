import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import config from '../config/env';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    role: string;
    lastActivity: number;
  }
}

export const protect = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  let token;

  // Check authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check session
  else if (req.session?.userId) {
    token = req.session.userId;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized - No token provided');
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret as string) as any;

    // Get user from token
    const user = await User.findById(decoded.id)
      .select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      throw new ApiError(401, 'Not authorized - User not found');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Account deactivated - Contact administrator');
    }

    // Attach user to request
    req.user = user;

    // Update session
    if (req.session) {
      req.session.userId = user._id.toString();
      req.session.role = user.role;
      req.session.lastActivity = Date.now();
    }

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Not authorized - Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Not authorized - Token expired');
    }
    throw new ApiError(401, 'Not authorized - Authentication failed');
  }
});

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role ${req.user.role} is not authorized to access this resource`
      );
    }

    next();
  };
};

// Session timeout middleware (5 minutes)
export const sessionTimeout = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.session?.lastActivity) {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    if (now - req.session.lastActivity > timeout) {
      // Session expired
      req.session.destroy((err: any) => {
        if (err) console.error('Session destruction error:', err);
      });
      throw new ApiError(401, 'Session expired - Please login again');
    }

    // Update last activity
    req.session.lastActivity = now;
  }

  next();
});

// Check if user is logged in from another device
export const checkConcurrentLogin = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.user) {
    const lastActive = req.user.lastActive || new Date(0);
    const now = new Date();

    // If last activity was more than 5 minutes ago and not from this session
    if (now.getTime() - lastActive.getTime() > 5 * 60 * 1000) {
      // Update last active
      req.user.lastActive = now;
      await req.user.save();
    }
  }

  next();
});