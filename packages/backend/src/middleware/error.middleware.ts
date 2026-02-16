import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  code?: number;
  errors?: any[];
}

export const errorHandler = (
  err: ErrorWithStatus | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): any => {
  let error = { ...err };
  error.message = err.message;

 
  console.error(err);


  if (err instanceof ApiError) {
    const response: any = {
      success: false,
      statusCode: err.statusCode,
      error: err.message,
      timestamp: new Date().toISOString(),
    };
    if (err.errors) {
      response.errors = err.errors;
    }
    return res.status(err.statusCode).json(response);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { ...error, message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = { ...error, message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = { ...error, message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { ...error, message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { ...error, message, statusCode: 401 };
  }

  res.status((error as any).statusCode || 500).json({
    success: false,
    statusCode: (error as any).statusCode || 500,
    error: error.message || 'Server Error',
    timestamp: new Date().toISOString(),
  });
};