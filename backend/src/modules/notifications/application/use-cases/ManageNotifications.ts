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

  async execute(notificationId: string) {
    const notification = await this.repo.findById(notificationId);
    if (!notification) throw new NotificationNotFoundError();
    return await this.repo.markAsRead(notificationId);
  }
}

export class MarkAllAsRead {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string) {
    return await this.repo.markAllAsRead(userId);
  }
}
