import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const result = await AuthService.login(email, password, req);

    // Set session
    (req.session as any).userId = result.user.id;
    (req.session as any).role = result.user.role;
    (req.session as any).lastActivity = Date.now();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: result,
      timestamp: new Date().toISOString(),
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    // Clear session
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
    });

    // Clear cookie
    res.clearCookie('connect.sid');

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    });
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
    // Update last active
    const currentUser = (req as any).user;
    if (currentUser) {
      currentUser.lastActive = new Date();
      await currentUser.save();
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: currentUser,
      timestamp: new Date().toISOString(),
    });
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: result,
      timestamp: new Date().toISOString(),
    });
  });

  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Current password and new password are required');
    }

    await AuthService.changePassword(
      (req as any).user._id,
      currentPassword,
      newPassword,
      req
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    });
  });

  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    await AuthService.forgotPassword(email);

    // TODO: Send reset email with token 
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password reset email sent',
      timestamp: new Date().toISOString(),
    });
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, 'Token and new password are required');
    }

    await AuthService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password reset successful',
      timestamp: new Date().toISOString(),
    });
  });
}

export default AuthController;