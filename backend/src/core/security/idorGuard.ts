import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';
import { Role } from '@prisma/client';

export interface IdorGuardOptions {
  paramName?: string;     // URL parameter name containing resource ID (default: 'id')
  resourceOwnerKey?: string; // Property on resource representing owner ID (default: 'userId')
}

/**
 * IDOR (Insecure Direct Object Reference) Ownership Guard
 * Verifies that the authenticated user either owns the requested resource ID or possesses administrative privileges.
 */
export const enforceResourceOwnership = (
  getResourceOwnerId: (req: Request) => Promise<string | null | undefined>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      if (!authUser) {
        return sendError(res, 'Authentication required', null, 401);
      }

      // Administrative roles bypass IDOR ownership check
      const adminRoles = [Role.ADMIN, Role.SUPER_ADMIN, 'ADMIN', 'SUPER_ADMIN', 'ICT_ADMIN'];
      if (adminRoles.includes(authUser.role)) {
        return next();
      }

      const resourceOwnerId = await getResourceOwnerId(req);

      if (!resourceOwnerId) {
        return sendError(res, 'Requested resource not found', null, 404);
      }

      // Compare owner ID with authenticated user's ID
      if (resourceOwnerId !== authUser.id && resourceOwnerId !== authUser.userId) {
        return sendError(
          res,
          'Security Error: You do not have authorization to access or modify this specific resource.',
          null,
          403
        );
      }

      next();
    } catch (err: any) {
      return sendError(res, 'Security check error', { message: err.message }, 500);
    }
  };
};
