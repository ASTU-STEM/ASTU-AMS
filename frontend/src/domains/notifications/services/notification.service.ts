import { get, put, post } from '../../../shared/services/api';

export const notificationService = {
  async getMyNotifications(): Promise<any[]> {
    return get<any[]>('/notifications');
  },

  async markAsRead(notificationId: string): Promise<void> {
    return put<void>(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    return put<void>('/notifications/read-all');
  },

  async sendNotification(payload: {
    userId: string;
    title: string;
    content: string;
    type?: string;
  }): Promise<any> {
    return post<any>('/notifications', payload);
  },
};

export default notificationService;
