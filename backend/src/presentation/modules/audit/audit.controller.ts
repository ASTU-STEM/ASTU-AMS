import { Request, Response, NextFunction } from 'express';
import prisma from '../../../infrastructure/config/db';
import { sendSuccess } from '../../../shared/utils/response.utils';

export class AuditController {
  static async recent(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
      return sendSuccess(res, 'Recent audit logs', logs);
    } catch (err: any) {
      next(err);
    }
  }
}

export default AuditController;
