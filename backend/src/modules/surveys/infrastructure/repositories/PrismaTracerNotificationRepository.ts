import { ITracerNotificationRepository } from '../../application/ports/ITracerNotificationRepository';
import { TracerNotification } from '../../domain/entities/TracerNotification';
import prisma from '../../../../core/config/db';

export class PrismaTracerNotificationRepository implements ITracerNotificationRepository {
  async create(data: Omit<TracerNotification, 'id' | 'createdAt'>): Promise<TracerNotification> {
    const notification = await prisma.tracerNotification.create({ data: data as any });
    return notification as any as TracerNotification;
  }

  async findByUserId(userId: string): Promise<TracerNotification[]> {
    const notifications = await prisma.tracerNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return notifications as any as TracerNotification[];
  }
}
