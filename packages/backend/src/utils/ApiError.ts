export class ApiError extends Error {
  statusCode: number;
  errors?: any[];
  isOperational: boolean;

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}