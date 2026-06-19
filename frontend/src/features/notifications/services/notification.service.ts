const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data.data;
}

export const notificationService = {
  async getMyNotifications(): Promise<any[]> {
    const res = await fetch(`${getApiBaseUrl()}/notifications`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async markAsRead(notificationId: string): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async markAllAsRead(): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res);
  }
};
