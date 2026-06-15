import { get, put } from '../../../shared/services/api';

const BASE = '/notifications';

export const notificationService = {
  async getMyNotifications(): Promise<any[]> {
    return get<any[]>(`${BASE}`);
  },

  async markAllAsRead(): Promise<void> {
    await put(`${BASE}/read-all`);
  },

  async markAsRead(id: string): Promise<void> {
    await put(`${BASE}/${id}/read`);
  },
};
