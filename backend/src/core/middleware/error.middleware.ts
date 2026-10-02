import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';
import { ZodError } from 'zod';
import { ApiError } from '../errors/ApiError';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', formattedErrors, 400);
  }

  // Handle Prisma unique constraint or other database errors if needed
  if (err.code && err.code.startsWith('P')) {
    console.error('💥 Database Error Caught:', err);
    return sendError(res, 'Database operation failed', { code: err.code, meta: err.meta }, 500);
  }

  const statusCode = err.status || err.statusCode || (err instanceof ApiError ? err.statusCode : 500);

  if (statusCode < 500) {
    console.warn(`⚠️ [${req.method} ${req.originalUrl}] Client Error (${statusCode}): ${err.message}`);
    return sendError(res, err.message, err.details || null, statusCode);
  }

  console.error('💥 Global Error Caught:', err);
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, process.env.NODE_ENV === 'development' ? err.stack : null, statusCode);
};
