import { TracerNotification } from '../../domain/entities/TracerNotification';

export interface ITracerNotificationRepository {
  create(data: Omit<TracerNotification, 'id' | 'createdAt'>): Promise<TracerNotification>;
  findByUserId(userId: string): Promise<TracerNotification[]>;
}
