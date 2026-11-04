import axios from 'axios';
import { ContentCardItem } from '../components/ContentCard';
import homepageCmsService from './homepageCms.service';

/** Bumped to drop legacy browser-cached demo content rows. */
const STORAGE_KEY = 'astu_ams_cms_content_items_v2';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** No sample notices — content comes from CMS/API only. */
const initialItems: ContentCardItem[] = [];

export const contentService = {
  getItems(): ContentCardItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Drop legacy sample seed IDs that may still sit in older browsers.
          const cleaned = parsed.filter(
            (i: any) =>
              i &&
              i.title !== 'Homepage CMS Configuration' &&
              !String(i.id || '').startsWith('C-REAL-') &&
              !['C-001', 'C-002', 'C-003', 'C-004', 'C-005', 'C-006', 'C-012'].includes(String(i.id || ''))
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {
      /* ignore */
    }
    return [];
  },

  saveItems(items: ContentCardItem[], emitEvent = true): void {
    const cleaned = items.filter((i) => i.title !== 'Homepage CMS Configuration');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));

    // Auto-sync published announcements to homepage CMS configuration
    try {
      const cmsConfig = homepageCmsService.getSettings();
      if (cmsConfig) {
        const published = this.getPublishedAnnouncements();
        homepageCmsService.saveSettings({
          ...cmsConfig,
          announcements: published.map((p) => ({
            id: p.id,
            title: p.title,
            date: p.date,
            type: p.type,
            active: true,
            pinned: p.pinned,
            author: p.author,
          })),
        });
      }
    } catch {}

    if (emitEvent) {
      window.dispatchEvent(new Event('astu-cms-content-changed'));
      window.dispatchEvent(new Event('astu-cms-homepage-updated'));
    }
  },

  normalizeItem(i: any): ContentCardItem {
    let status: any = 'Published';
    const s = String(i.status || '').toUpperCase();
    if (s === 'DRAFT') status = 'Draft';
    else if (s === 'SCHEDULED') status = 'Scheduled';
    else if (s === 'NEEDS_REVIEW' || s === 'NEEDS REVIEW') status = 'Needs Review';
    else if (s === 'ARCHIVED') status = 'Archived';
    else if (s === 'PUBLISHED') status = 'Published';

    let type: any = 'post';
    const t = String(i.type || '').toLowerCase();
    if (t.includes('announc')) type = 'announcement';
    else if (t.includes('page')) type = 'page';
    else if (t.includes('gallery')) type = 'gallery';
    else if (t.includes('event')) type = 'event';
    else if (t.includes('template')) type = 'template';

    return {
      id: i._id || i.id || `C-${Date.now()}`,
      title: i.title || 'Untitled Notice',
      type,
      status,
      excerpt: i.excerpt || '',
      content: i.content || i.body || '',
      image: i.image || '',
      author: i.author || 'ASTU Directorate Notice',
      updatedAt: i.updatedAt ? new Date(i.updatedAt).toLocaleDateString() : 'Recently',
      publishedAt: i.publishedAt ? new Date(i.publishedAt).toLocaleDateString() : undefined,
      views: Number(i.views || 0),
      tags: Array.isArray(i.tags) ? i.tags : [],
      pinned: Boolean(i.pinned),
      featured: Boolean(i.featured),
      language: i.language || 'EN',
      buttonText: i.buttonText || 'Read Full Notice',
      requiresRegistration: Boolean(i.requiresRegistration),
      registeredCount: Number(i.registeredCount || 0),
      registrationCapacity: Number(i.registrationCapacity || 0),
      registrationDeadline: i.registrationDeadline,
      registrationType: i.registrationType,
    };
  },

  addItem(item: Omit<ContentCardItem, 'id' | 'views'>): ContentCardItem {
    const newItem: ContentCardItem = {
      ...item,
      id: `C-${Date.now().toString().slice(-4)}`,
      updatedAt: 'Just now',
      views: 0,
      status: item.status || 'Published',
      language: item.language || 'EN',
      buttonText: item.buttonText || 'Read Full Notice',
    };

    const current = this.getItems();
    current.unshift(newItem);
    this.saveItems(current);

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios
      .post(`${API_URL}/content`, newItem, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        if (res.data && res.data.success && res.data.data) {
          const syncedItem = this.normalizeItem(res.data.data);
          const list = this.getItems();
          const idx = list.findIndex((x) => x.id === newItem.id);
          if (idx !== -1) {
            list[idx] = syncedItem;
            this.saveItems(list);
          }
        }
      })
      .catch((err) => console.warn('Failed to sync content creation with DB:', err));

    return newItem;
  },

  updateItem(id: string, updates: Partial<ContentCardItem>): ContentCardItem | null {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates, updatedAt: 'Just now' };
    this.saveItems(items);

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios
      .put(`${API_URL}/content/${id}`, updates, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .catch((err) => console.warn('Failed to sync content update with DB:', err));

    return items[index];
  },

  async uploadCmsImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const res = await axios.post(`${API_URL}/content/media/upload`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const url = res?.data?.data?.url;
    if (!url) throw new Error('Upload succeeded but no media URL was returned');
    return url;
  },

  deleteItem(id: string): boolean {
    const items = this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;

    this.saveItems(filtered);

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios
      .delete(`${API_URL}/content/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .catch((err) => console.warn('Failed to sync content deletion with DB:', err));

    return true;
  },

  getPublishedNews(): { id: string; title: string; date: string; excerpt?: string }[] {
    const items = this.getItems();
    return items
      .filter(
        (i) =>
          String(i.status).toUpperCase() === 'PUBLISHED' &&
          (String(i.type).toLowerCase() === 'post' || String(i.type).toLowerCase() === 'announcement')
      )
      .map((i) => ({
        id: i.id,
        title: i.title,
        date: i.publishedAt || i.updatedAt,
        excerpt: i.excerpt,
      }));
  },

  getPublishedAnnouncements(): {
    id: string;
    title: string;
    date: string;
    type: string;
    excerpt?: string;
    pinned?: boolean;
    featured?: boolean;
    author?: string;
    image?: string;
    targetAudience?: string;
    buttonText?: string;
  }[] {
    const items = this.getItems();
    return items
      .filter((i) => String(i.status).toUpperCase() === 'PUBLISHED')
      .sort((a, b) => {
        const pinA = a.pinned ? 1 : 0;
        const pinB = b.pinned ? 1 : 0;
        if (pinB !== pinA) return pinB - pinA;
        const dateA = new Date(a.publishedAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      })
      .map((i) => ({
        id: i.id,
        title: i.title,
        date: i.publishedAt || i.updatedAt || 'Just now',
        type:
          String(i.type).toLowerCase() === 'announcement'
            ? 'Official Announcement'
            : (i.category || i.type || 'Official Announcement'),
        excerpt: i.excerpt,
        pinned: i.pinned,
        featured: i.featured,
        author: i.author || 'ASTU Directorate Notice',
        image: i.image,
        targetAudience: i.targetAudience,
        buttonText: i.buttonText || 'Read Full Notice',
      }));
  },

  getItemByIdOrSlug(idOrSlug: string): ContentCardItem | null {
    const items = this.getItems();
    const needle = decodeURIComponent(idOrSlug).toLowerCase();
    const slugified = needle.replace(/[^a-z0-9]+/g, '-');
    return (
      items.find((i) => i.id.toLowerCase() === needle) ||
      items.find((i) => i.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugified) ||
      items.find((i) => i.title.toLowerCase() === needle) ||
      items.find((i) => i.title.toLowerCase().includes(needle)) ||
      null
    );
  },
  async fetchItemsFromApi(): Promise<ContentCardItem[]> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await axios.get(`${API_URL}/content`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const rawItems: any[] = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      // Trust the API as source of truth so legacy local sample notices cannot reappear.
      const normalized = rawItems.map((i) => this.normalizeItem(i));
      this.saveItems(normalized, false);
      return normalized;
    } catch {
      /* silently fall back to local cache */
    }
    return this.getItems();
  },
  async getPublicDonationCampaigns(params?: { category?: string; status?: string }): Promise<any[]> {
    try {
      const res = await axios.get(`${API_URL}/content/donations/campaigns`, { params });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },
  async recordPublicDonation(data: { campaignId: string; amount: number; donorName?: string }): Promise<any> {
    try {
      const res = await axios.post(`${API_URL}/content/donations/public-donate`, data);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to submit donation' };
    }
  },
  async getMediaAssets(album?: string): Promise<any[]> {
    try {
      const res = await axios.get(`${API_URL}/content/media`, {
        params: album && album !== 'All' ? { album } : {},
      });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },
};

export default contentService;
