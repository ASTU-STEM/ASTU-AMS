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
  /** Delivery mode only: "ONLINE" | "IN_PERSON". Not an event category. */
  type: string;
  // Optional presentation metadata: the events table does not store all of
  // these, but CMS-authored / legacy rows may, and the homepage maps them
  // defensively rather than assuming they are absent.
  slug?: string;
  image?: string;
  coverImage?: string;
  bannerUrl?: string;
  capacity?: number;
  category?: string;
  tags?: string[];
  registered?: boolean;
  createdBy?: string;
  rsvps?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export const eventsService = {
  /**
   * Public event directory. The `/events` API returns the full list (no
   * page/limit query params today), so callers paginate client-side.
   * Pass `{ throwOnError: true }` when the UI must show an error state.
   */
  async getAllEvents(options?: { throwOnError?: boolean }): Promise<ApiEvent[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ApiEvent[] }>('/events');
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.warn('Failed to fetch events from API:', error);
      if (options?.throwOnError) throw error;
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

  async updateEvent(eventId: string, eventData: Partial<ApiEvent>): Promise<ApiEvent | null> {
    try {
      const response = await apiClient.put<{ success: boolean; data: ApiEvent }>(`/events/${eventId}`, eventData);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.warn('Error updating event via API:', error);
      return null;
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
