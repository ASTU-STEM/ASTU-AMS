import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';
import { Role } from '@prisma/client';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token required', null, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired token', error.message, 401);
  }
};

export const requireRoles = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return sendError(res, 'User identity not found', null, 401);
    }

    if (!allowedRoles.includes((req as any).user.role)) {
      return sendError(res, 'Access denied: insufficient permissions', null, 403);
    }

    next();
  };
};
