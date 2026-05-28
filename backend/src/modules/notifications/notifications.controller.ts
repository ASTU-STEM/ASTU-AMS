import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { sendSuccess } from '../../utils/response.utils';

export class NotificationsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const notes = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
      return sendSuccess(res, 'Notifications fetched', notes);
    } catch (err: any) {
      next(err);
    }
  }
}

export default NotificationsController;
