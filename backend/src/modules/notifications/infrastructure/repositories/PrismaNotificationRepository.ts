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
    const userExists = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!userExists) {
      throw new Error('Cannot create notification: the recipient does not exist.');
    }

    // Let database failures reach the caller. Returning a synthetic "noop"
    // notification made failed writes look like successful deliveries.
    const notification = await prisma.notification.create({ data: data as any });
    return notification as any as Notification;
  }

  /**
   * Scoped by owner. `updateMany` with `{ id, userId }` is used rather than
   * `update` so a mismatched owner matches zero rows instead of flipping
   * somebody else's notification.
   */
  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    if (!result.count) return null;
    return (await prisma.notification.findUnique({ where: { id } })) as any as Notification;
  }

  async deleteOne(id: string, userId: string): Promise<boolean> {
    const result = await prisma.notification.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async deleteAllForUser(userId: string): Promise<number> {
    const result = await prisma.notification.deleteMany({ where: { userId } });
    return result.count;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  }
}
