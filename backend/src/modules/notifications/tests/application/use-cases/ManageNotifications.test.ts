import {
  SendNotification,
  GetUserNotifications,
  MarkAsRead,
  MarkAllAsRead,
  DeleteNotification,
  ClearNotifications,
} from '../../../application/use-cases/ManageNotifications';
import { INotificationRepository } from '../../../application/ports/INotificationRepository';
import { Notification } from '../../../domain/entities/Notification';
import { NotificationNotFoundError } from '../../../domain/errors/NotificationErrors';

describe('ManageNotifications Use Cases', () => {
  let mockRepo: jest.Mocked<INotificationRepository>;

  const mockNotif = new Notification('n1', 'usr1', 'Welcome', 'Welcome to ASTU AMS!', false, new Date());

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteOne: jest.fn(),
      deleteAllForUser: jest.fn(),
    };
  });

  describe('SendNotification', () => {
    it('should create a notification successfully', async () => {
      mockRepo.create.mockResolvedValue(mockNotif);
      const useCase = new SendNotification(mockRepo);
      const result = await useCase.execute('usr1', 'Welcome', 'Welcome to ASTU AMS!');
      expect(result).toEqual(mockNotif);
      expect(mockRepo.create).toHaveBeenCalledWith({
        userId: 'usr1',
        title: 'Welcome',
        content: 'Welcome to ASTU AMS!',
        isRead: false,
      });
    });
  });

  describe('GetUserNotifications', () => {
    it('should return all notifications for a user', async () => {
      mockRepo.findByUserId.mockResolvedValue([mockNotif]);
      const useCase = new GetUserNotifications(mockRepo);
      const result = await useCase.execute('usr1');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Welcome');
    });
  });

  describe('MarkAsRead', () => {
    it('should mark the caller\'s own notification as read', async () => {
      mockRepo.markAsRead.mockResolvedValue({ ...mockNotif, isRead: true });
      const useCase = new MarkAsRead(mockRepo);
      const result = await useCase.execute('n1', 'usr1');
      expect(result!.isRead).toBe(true);
      // The owner must be part of the repository call, not just a prior check.
      expect(mockRepo.markAsRead).toHaveBeenCalledWith('n1', 'usr1');
    });

    it('should not mark a notification belonging to another user', async () => {
      // The repository resolves null when { id, userId } matches no row.
      mockRepo.markAsRead.mockResolvedValue(null);
      const useCase = new MarkAsRead(mockRepo);
      await expect(useCase.execute('n1', 'usr2')).rejects.toThrow(NotificationNotFoundError);
    });

    it('should throw NotificationNotFoundError if not found', async () => {
      mockRepo.markAsRead.mockResolvedValue(null);
      const useCase = new MarkAsRead(mockRepo);
      await expect(useCase.execute('n1', 'usr1')).rejects.toThrow(NotificationNotFoundError);
    });
  });

  describe('DeleteNotification', () => {
    it('should delete the caller\'s own notification', async () => {
      mockRepo.deleteOne.mockResolvedValue(true);
      const useCase = new DeleteNotification(mockRepo);
      await expect(useCase.execute('n1', 'usr1')).resolves.toEqual({ deleted: true });
      expect(mockRepo.deleteOne).toHaveBeenCalledWith('n1', 'usr1');
    });

    it('should refuse to delete another user\'s notification', async () => {
      mockRepo.deleteOne.mockResolvedValue(false);
      const useCase = new DeleteNotification(mockRepo);
      await expect(useCase.execute('n1', 'usr2')).rejects.toThrow(NotificationNotFoundError);
    });
  });

  describe('ClearNotifications', () => {
    it('should clear only the caller\'s notifications', async () => {
      mockRepo.deleteAllForUser.mockResolvedValue(4);
      const useCase = new ClearNotifications(mockRepo);
      await expect(useCase.execute('usr1')).resolves.toEqual({ deleted: 4 });
      expect(mockRepo.deleteAllForUser).toHaveBeenCalledWith('usr1');
    });
  });

  describe('MarkAllAsRead', () => {
    it('should mark all notifications as read and return count', async () => {
      mockRepo.markAllAsRead.mockResolvedValue(5);
      const useCase = new MarkAllAsRead(mockRepo);
      const count = await useCase.execute('usr1');
      expect(count).toBe(5);
    });
  });
});
