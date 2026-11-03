import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOCAL_CACHE_KEY = 'astu_cms_templates_cache_v2';

export type TemplateCategory = 'Page' | 'Post' | 'Announcement' | 'Event' | 'Email' | 'Landing';

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  iconName?: string;
  color: string;
  usage: number;
  lastUpdated: string;
  thumbnail: string;
  isDefault?: boolean;
  isFeatured?: boolean;
  fields: string[];
  starterBody?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('astu_access_token');
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 8000,
  };
};

class TemplateService {
  /**
   * Fetch all templates from backend database with optional filters
   */
  async getTemplates(params?: { category?: string; search?: string; featured?: boolean }): Promise<ContentTemplate[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'all') {
        query.append('category', params.category);
      }
      if (params?.search) {
        query.append('search', params.search);
      }
      if (params?.featured !== undefined) {
        query.append('featured', String(params.featured));
      }

      const url = `${API_URL}/content/templates${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await axios.get(url, getAuthHeaders());

      if (res.data?.success && Array.isArray(res.data.data)) {
        const items = res.data.data;
        // Save to cache for offline resilience
        try {
          localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(items));
        } catch {
          /* ignore */
        }
        return items;
      }
      return this.getCachedTemplates();
    } catch (error) {
      console.warn('Backend templates API unreachable, loading cached templates:', error);
      return this.getCachedTemplates();
    }
  }

  /**
   * Fetch a single template by ID
   */
  async getTemplateById(id: string): Promise<ContentTemplate | null> {
    try {
      const res = await axios.get(`${API_URL}/content/templates/${id}`, getAuthHeaders());
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch {
      const cached = this.getCachedTemplates();
      return cached.find((t) => t.id === id) || null;
    }
  }

  /**
   * Create a new template in backend database
   */
  async createTemplate(templateData: Partial<ContentTemplate>): Promise<ContentTemplate> {
    try {
      const res = await axios.post(`${API_URL}/content/templates`, templateData, getAuthHeaders());
      if (res.data?.success && res.data.data) {
        const created = res.data.data;
        const current = this.getCachedTemplates();
        this.setCachedTemplates([created, ...current]);
        return created;
      }
      throw new Error(res.data?.message || 'Failed to create template');
    } catch (error: any) {
      // Offline fallback
      const fallbackItem: ContentTemplate = {
        id: `tpl-${Date.now()}`,
        name: templateData.name || 'Untitled Template',
        description: templateData.description || '',
        category: (templateData.category as TemplateCategory) || 'Page',
        iconName: templateData.iconName || 'FileText',
        color: templateData.color || '#003580',
        usage: 0,
        lastUpdated: 'Just now',
        thumbnail: templateData.thumbnail || 'page',
        isDefault: false,
        isFeatured: Boolean(templateData.isFeatured),
        fields: templateData.fields || [],
        starterBody: templateData.starterBody || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const current = this.getCachedTemplates();
      this.setCachedTemplates([fallbackItem, ...current]);
      return fallbackItem;
    }
  }

  /**
   * Update an existing template in backend database
   */
  async updateTemplate(id: string, updates: Partial<ContentTemplate>): Promise<ContentTemplate> {
    try {
      const res = await axios.put(`${API_URL}/content/templates/${id}`, updates, getAuthHeaders());
      if (res.data?.success && res.data.data) {
        const updated = res.data.data;
        const current = this.getCachedTemplates();
        const next = current.map((t) => (t.id === id ? updated : t));
        this.setCachedTemplates(next);
        return updated;
      }
      throw new Error(res.data?.message || 'Failed to update template');
    } catch (error: any) {
      // Offline fallback
      const current = this.getCachedTemplates();
      const idx = current.findIndex((t) => t.id === id);
      if (idx !== -1) {
        current[idx] = {
          ...current[idx],
          ...updates,
          updatedAt: new Date().toISOString(),
          lastUpdated: 'Just now',
        };
        this.setCachedTemplates(current);
        return current[idx];
      }
      throw error;
    }
  }

  /**
   * Delete a template by ID
   */
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const res = await axios.delete(`${API_URL}/content/templates/${id}`, getAuthHeaders());
      if (res.data?.success) {
        const current = this.getCachedTemplates().filter((t) => t.id !== id);
        this.setCachedTemplates(current);
        return true;
      }
      return false;
    } catch {
      const current = this.getCachedTemplates().filter((t) => t.id !== id);
      this.setCachedTemplates(current);
      return true;
    }
  }

  /**
   * Record template usage on backend and increment usage counter
   */
  async useTemplate(id: string): Promise<ContentTemplate> {
    try {
      const res = await axios.post(`${API_URL}/content/templates/${id}/use`, {}, getAuthHeaders());
      if (res.data?.success && res.data.data) {
        const updated = res.data.data;
        const current = this.getCachedTemplates();
        const next = current.map((t) => (t.id === id ? updated : t));
        this.setCachedTemplates(next);
        return updated;
      }
      throw new Error('Could not record usage');
    } catch {
      const current = this.getCachedTemplates();
      const idx = current.findIndex((t) => t.id === id);
      if (idx !== -1) {
        current[idx].usage = (Number(current[idx].usage) || 0) + 1;
        current[idx].lastUpdated = 'Just now';
        this.setCachedTemplates(current);
        return current[idx];
      }
      throw new Error('Template not found');
    }
  }

  private getCachedTemplates(): ContentTemplate[] {
    try {
      const raw = localStorage.getItem(LOCAL_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    return [];
  }

  private setCachedTemplates(items: ContentTemplate[]): void {
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }
}

export const templateService = new TemplateService();
export default templateService;
