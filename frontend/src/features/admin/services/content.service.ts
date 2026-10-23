import axios from 'axios';
import { ContentCardItem } from '../components/ContentCard';

const STORAGE_KEY = 'astu_ams_cms_content_items';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * No fabricated seed content.
 *
 * This previously declared six invented items ("ASTU Alumni Network: Bridging
 * Generations" claiming 25,000+ graduates, "ASTU Research Grant Winners 2026"
 * claiming 12 grants, and so on) and wrote them into localStorage on first read.
 * Because the homepage only overwrites its localStorage snapshot when the API
 * returns a non-empty list, those fabrications kept rendering on the public
 * homepage even after the backend content was emptied. Content now comes from
 * the API only; an empty list renders as an empty state.
 */
const initialItems: ContentCardItem[] = [];

export const contentService = {
  getItems(): ContentCardItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((i) => i.title !== 'Homepage CMS Configuration');
        }
      }
    } catch {
      /* ignore */
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialItems));
    return initialItems;
  },

  saveItems(items: ContentCardItem[]): void {
    const cleaned = items.filter((i) => i.title !== 'Homepage CMS Configuration');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new Event('astu-cms-content-changed'));
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
    else if (t.includes('gal')) type = 'gallery';
    else if (t.includes('event')) type = 'event';
    else if (t.includes('temp')) type = 'template';

    return {
      ...i,
      id: i.id || `C-${Date.now()}`,
      title: i.title || 'Untitled',
      type,
      status,
      excerpt: i.excerpt || '',
      author: i.author || 'Content Manager',
      updatedAt: i.updatedAt || 'Recently',
      views: i.views || 0,
      tags: Array.isArray(i.tags) ? i.tags : [type, 'astu'],
      pinned: Boolean(i.pinned),
      featured: Boolean(i.featured),
    };
  },

  async fetchItemsFromApi(): Promise<ContentCardItem[]> {
    try {
      const res = await axios.get(`${API_URL}/content`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const cleaned = res.data.data
          .filter((i: any) => i.title !== 'Homepage CMS Configuration')
          .map((i: any) => this.normalizeItem(i));
        // ⚠️ Do NOT write to localStorage here — that would trigger
        // storage events and cause infinite re-fetch loops in the dashboard.
        return cleaned;
      }
    } catch {
      /* Fallback to local storage if offline */
    }
    return this.getItems();
  },

  addItem(item: Omit<ContentCardItem, 'id' | 'views'>): ContentCardItem {
    const items = this.getItems();
    const newItem: ContentCardItem = {
      ...item,
      id: `C-${String(Date.now()).slice(-4)}`,
      views: 0,
      updatedAt: 'Just now',
    };
    const updated = [newItem, ...items];
    this.saveItems(updated);

    // Sync with backend DB API
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios
      .post(`${API_URL}/content`, newItem, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        if (res.data && res.data.success && res.data.data) {
          const syncedItem = this.normalizeItem(res.data.data);
          const current = this.getItems();
          const idx = current.findIndex((x) => x.id === newItem.id);
          if (idx !== -1) {
            current[idx] = syncedItem;
            this.saveItems(current);
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

  /**
   * Upload an image to the backend CMS media store and return its stored URL
   * (e.g. "/uploads/cms/<file>"). Images are served by the backend and are
   * never inlined as base64 inside the config payload.
   */
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
      .filter((i) => String(i.status).toUpperCase() === 'PUBLISHED' && (String(i.type).toLowerCase() === 'post' || String(i.type).toLowerCase() === 'announcement'))
      .map((i) => ({
        id: i.id,
        title: i.title,
        date: i.publishedAt || i.updatedAt,
        excerpt: i.excerpt,
      }));
  },

  getPublishedAnnouncements(): { id: string; title: string; date: string; type: string; excerpt?: string }[] {
    const items = this.getItems();
    return items
      .filter((i) => String(i.status).toUpperCase() === 'PUBLISHED')
      .map((i) => ({
        id: i.id,
        title: i.title,
        date: i.publishedAt || i.updatedAt || 'Just now',
        type: String(i.type).toLowerCase() === 'announcement' ? 'Official Announcement' : `${String(i.type).toUpperCase()} Announcement`,
        excerpt: i.excerpt,
      }));
  },

  getItemByIdOrSlug(idOrSlug: string): ContentCardItem | null {
    const items = this.getItems();
    const needle = decodeURIComponent(idOrSlug).toLowerCase();
    const slugified = needle.replace(/[^a-z0-9]+/g, '-');
    return (
      items.find((i) => i.id.toLowerCase() === needle) ||
      items.find((i) => i.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugified) ||
      items.find((i) => i.title.toLowerCase().includes(needle)) ||
      null
    );
  },
};

// ⚠️ No module-level auto-fetch: doing so on import causes the dashboard to
// receive a storage event before it is mounted, triggering blank re-renders.
export default contentService;
