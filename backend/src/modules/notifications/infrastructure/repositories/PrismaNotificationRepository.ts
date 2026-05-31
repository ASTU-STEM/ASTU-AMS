import { INotificationRepository } from '../../application/ports/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';
import prisma from '../../../../core/config/db';

export class PrismaNotificationRepository implements INotificationRepository {
  async findById(id: string): Promise<Notification | null> {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) return null;
    return notif as any as Notification;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const notifs = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifs as any as Notification[];
  }

  async create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notif = await prisma.notification.create({ data: data as any });
    return notif as any as Notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notif = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return notif as any as Notification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  }
}
