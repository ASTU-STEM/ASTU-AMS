import axios from 'axios';
import { ContentCardItem } from '../components/ContentCard';

const STORAGE_KEY = 'astu_ams_cms_content_items';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialItems: ContentCardItem[] = [
  {
    id: 'C-001',
    title: 'ASTU Alumni Network: Bridging Generations',
    type: 'post',
    status: 'Published',
    excerpt: 'How our alumni network connects 25,000+ graduates with opportunities, mentorship, and lifelong learning resources.',
    author: 'Content Manager',
    updatedAt: '2 hours ago',
    publishedAt: 'May 28, 2026',
    views: 1240,
    tags: ['alumni', 'community', 'networking'],
    pinned: true,
    featured: true,
    language: 'EN',
  },
  {
    id: 'C-002',
    title: 'Industry Partnership Week 2026',
    type: 'page',
    status: 'Scheduled',
    excerpt: 'Five-day summit connecting ASTU students with leading employers across Ethiopia and East Africa.',
    author: 'Content Manager',
    updatedAt: 'Jun 5, 2026',
    scheduledFor: 'Jun 12, 9:00 AM',
    views: 0,
    tags: ['partnership', 'employers', 'career'],
    pinned: false,
    featured: true,
    language: 'EN',
  },
  {
    id: 'C-003',
    title: 'Tracer Survey Campaign Banner',
    type: 'page',
    status: 'Draft',
    excerpt: 'Encourages 2024 alumni batch to complete the annual tracer study for institutional improvement.',
    author: 'Content Manager',
    updatedAt: 'Yesterday',
    views: 0,
    tags: ['tracer', 'survey', 'alumni'],
    pinned: false,
    featured: false,
    language: 'EN',
  },
  {
    id: 'C-004',
    title: 'Semester Break: Campus Safety Notice',
    type: 'announcement',
    status: 'Published',
    excerpt: 'Important safety reminders for students, faculty, and visitors during the upcoming semester break.',
    author: 'System Admin',
    updatedAt: '45 min ago',
    publishedAt: 'Jun 7, 2026',
    views: 892,
    tags: ['safety', 'campus', 'announcement'],
    pinned: true,
    featured: false,
    language: 'EN',
  },
  {
    id: 'C-005',
    title: 'Campus Tour 2026 Photo Album',
    type: 'gallery',
    status: 'Needs Review',
    excerpt: 'Stunning aerial and ground-level photos from the 2026 campus tour. Awaiting final approval before publishing.',
    author: 'Dept Head',
    updatedAt: '3 days ago',
    views: 0,
    tags: ['campus', 'tour', 'photos'],
    pinned: false,
    featured: false,
    language: 'EN',
  },
  {
    id: 'C-006',
    title: 'ASTU Research Grant Winners 2026',
    type: 'post',
    status: 'Published',
    excerpt: 'Announcing 12 applied research grants awarded to faculty and alumni engineering teams.',
    author: 'Content Manager',
    updatedAt: '1 day ago',
    publishedAt: 'May 25, 2026',
    views: 1890,
    tags: ['research', 'grants', 'engineering'],
    pinned: false,
    featured: true,
    language: 'EN',
  },
];

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

  async fetchItemsFromApi(): Promise<ContentCardItem[]> {
    try {
      const res = await axios.get(`${API_URL}/content`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const cleaned = res.data.data.filter((i: any) => i.title !== 'Homepage CMS Configuration');
        this.saveItems(cleaned);
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
        if (res.data && res.data.success) {
          console.log('Successfully saved content item to backend DB:', newItem.title);
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

  deleteItem(id: string): boolean {
    const items = this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    
    // Save updated list immediately to local storage and broadcast event
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
      .filter((i) => i.status === 'Published' && (i.type === 'post' || i.type === 'announcement'))
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
      .filter((i) => i.status === 'Published')
      .map((i) => ({
        id: i.id,
        title: i.title,
        date: i.publishedAt || i.updatedAt || 'Just now',
        type: i.type === 'announcement' ? 'Official Announcement' : `${i.type.toUpperCase()} Announcement`,
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

// Initial API sync attempt
contentService.fetchItemsFromApi().catch(() => {});

export default contentService;
