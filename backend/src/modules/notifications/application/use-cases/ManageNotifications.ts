import { INotificationRepository } from '../ports/INotificationRepository';
import { NotificationNotFoundError } from '../../domain/errors/NotificationErrors';

export class SendNotification {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string, title: string, content: string) {
    return await this.repo.create({
      userId,
      title,
      content,
      isRead: false,
    });
  }
}

export class GetUserNotifications {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string) {
    return await this.repo.findByUserId(userId);
  }
}

export class MarkAsRead {
  constructor(private readonly repo: INotificationRepository) {}

  /**
   * `userId` is the authenticated caller. Previously the use case received only
   * an id and updated `where: { id }`, so any signed-in user could mark any
   * other user's notification as read by supplying its id.
   */
  async execute(notificationId: string, userId: string) {
    const notification = await this.repo.markAsRead(notificationId, userId);
    if (!notification) throw new NotificationNotFoundError();
    return notification;
  }
}

export class DeleteNotification {
  constructor(private readonly repo: INotificationRepository) {}

  /** Deletes one notification, scoped to its owner. */
  async execute(notificationId: string, userId: string) {
    const removed = await this.repo.deleteOne(notificationId, userId);
    if (!removed) throw new NotificationNotFoundError();
    return { deleted: true };
  }
}

export class ClearNotifications {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string) {
    return { deleted: await this.repo.deleteAllForUser(userId) };
  }
}

export class MarkAllAsRead {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string) {
    return await this.repo.markAllAsRead(userId);
  }
}
