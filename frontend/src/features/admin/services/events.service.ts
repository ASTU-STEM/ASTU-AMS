import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('astu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface ApiEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  type: string;
  createdBy?: string;
  rsvps?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export const eventsService = {
  async getAllEvents(): Promise<ApiEvent[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ApiEvent[] }>('/events');
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.warn('Failed to fetch events from API, falling back to local list:', error);
      return [];
    }
  },

  async createEvent(eventData: {
    title: string;
    description?: string;
    date: string;
    location: string;
    type?: string;
  }): Promise<ApiEvent | null> {
    try {
      const response = await apiClient.post<{ success: boolean; data: ApiEvent }>('/events', eventData);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating event via API:', error);
      throw error;
    }
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/events/${eventId}`);
      return !!response.data.success;
    } catch (error) {
      console.error('Error deleting event via API:', error);
      return false;
    }
  },

  async getEventById(id: string): Promise<ApiEvent | null> {
    try {
      const all = await this.getAllEvents();
      const match = all.find(e => e.id === id || e.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === id);
      return match || null;
    } catch (error) {
      console.warn(`Failed to fetch event ${id} from API:`, error);
      return null;
    }
  },

  async rsvpToEvent(eventId: string, status: string = 'GOING'): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/events/${eventId}/rsvp`, { status });
      return !!response.data.success;
    } catch (error) {
      console.warn('Error RSVPing to event via API:', error);
      return false;
    }
  },
};

export default eventsService;
