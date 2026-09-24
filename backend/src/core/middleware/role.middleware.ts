import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';
import { Role } from '@prisma/client';

export const requireRoles = (allowedRoles: (Role | string)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return sendError(res, 'User identity not found', null, 401);
    }

    const userRole = (req as any).user.role;

    // Root Super Admin bypasses role checks for system operations
    if (userRole === Role.SUPER_ADMIN || userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return sendError(res, 'Access denied: insufficient permissions', null, 403);
    }

    next();
  };
};

export const requirePermission = (permissionKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return sendError(res, 'User identity not found', null, 401);
    }

    const userRole = (req as any).user.role;

    // Root Super Admin bypasses role checks
    if (userRole === Role.SUPER_ADMIN || userRole === 'SUPER_ADMIN') {
      return next();
    }

    try {
      const prisma = require('../config/db').default;
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'ROLE_PERMISSIONS' },
      });

      if (setting && setting.value) {
        const roleMap = (setting.value as any)[userRole];
        if (roleMap && roleMap[permissionKey] === false) {
          return sendError(
            res,
            `Access Denied: Permission '${permissionKey}' is disabled for role '${userRole}' by System Policy`,
            null,
            403
          );
        }
      }
    } catch (err) {
      console.warn('[PermissionMiddleware] Error checking permission in DB:', err);
    }

    next();
  };
};
