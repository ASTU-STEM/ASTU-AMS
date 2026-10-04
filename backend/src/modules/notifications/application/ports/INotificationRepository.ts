import { Notification } from '../../domain/entities/Notification';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
  create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  /** Scoped to the owner. Resolves null when the id does not belong to userId. */
  markAsRead(id: string, userId: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<number>;
  deleteOne(id: string, userId: string): Promise<boolean>;
  deleteAllForUser(userId: string): Promise<number>;
}
