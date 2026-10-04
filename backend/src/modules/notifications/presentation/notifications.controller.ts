import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { sendNotificationSchema } from './notifications.validation';

import { PrismaNotificationRepository } from '../infrastructure/repositories/PrismaNotificationRepository';
import { SendNotification, GetUserNotifications, MarkAsRead, MarkAllAsRead, DeleteNotification, ClearNotifications } from '../application/use-cases/ManageNotifications';

const repo = new PrismaNotificationRepository();

export class NotificationsController {

  static async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetUserNotifications(repo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Notifications retrieved.', result);
    } catch (err) { next(err); }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      // Pass the caller: without it the update was `where: { id }` and any
      // signed-in user could mark another user's notification as read.
      const userId = (req as any).user?.userId;
      const useCase = new MarkAsRead(repo);
      const result = await useCase.execute(req.params.notificationId, userId);
      return sendSuccess(res, 'Notification marked as read.', result);
    } catch (err) { next(err); }
  }

  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new DeleteNotification(repo);
      const result = await useCase.execute(req.params.notificationId, userId);
      return sendSuccess(res, 'Notification deleted.', result);
    } catch (err) { next(err); }
  }

  static async clearNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new ClearNotifications(repo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Notifications cleared.', result);
    } catch (err) { next(err); }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new MarkAllAsRead(repo);
      const count = await useCase.execute(userId);
      return sendSuccess(res, `${count} notifications marked as read.`, { count });
    } catch (err) { next(err); }
  }

  // Admin endpoint to send a notification to a specific user
  static async sendNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, title, content } = sendNotificationSchema.parse(req.body);
      const useCase = new SendNotification(repo);
      const result = await useCase.execute(userId, title, content);
      return sendSuccess(res, 'Notification sent.', result, 201);
    } catch (err) { next(err); }
  }
}
