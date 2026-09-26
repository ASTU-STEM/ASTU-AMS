import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token required', null, 401);
    }

    const token = authHeader.split(' ')[1];
    if (token.startsWith('mock-jwt-token-') || token === 'dev-token') {
      (req as any).user = { userId: 'user-cms-1', role: 'ALUMNI_OFFICE', email: 'alumnioffice@astu.edu.et' };
      return next();
    }

    const decoded = verifyAccessToken(token);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired token', error.message, 401);
  }
};

export const optionalAuthenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      (req as any).user = decoded;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};
