import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';
import { Role } from '@prisma/client';

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
