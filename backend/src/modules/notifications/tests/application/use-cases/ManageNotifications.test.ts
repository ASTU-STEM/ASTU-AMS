import { SendNotification, GetUserNotifications, MarkAsRead, MarkAllAsRead } from '../../../application/use-cases/ManageNotifications';
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
    it('should mark a notification as read', async () => {
      mockRepo.findById.mockResolvedValue(mockNotif);
      mockRepo.markAsRead.mockResolvedValue({ ...mockNotif, isRead: true });
      const useCase = new MarkAsRead(mockRepo);
      const result = await useCase.execute('n1');
      expect(result.isRead).toBe(true);
    });

    it('should throw NotificationNotFoundError if not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const useCase = new MarkAsRead(mockRepo);
      await expect(useCase.execute('n1')).rejects.toThrow(NotificationNotFoundError);
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
