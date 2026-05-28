import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';
import { ZodError } from 'zod';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('💥 Global Error Caught:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', formattedErrors, 400);
  }

  // Handle Prisma unique constraint or other database errors if needed
  if (err.code && err.code.startsWith('P')) {
    return sendError(res, 'Database operation failed', { code: err.code, meta: err.meta }, 500);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, process.env.NODE_ENV === 'development' ? err.stack : null, statusCode);
};
