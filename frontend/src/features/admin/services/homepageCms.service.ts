import axios from 'axios';

const STORAGE_KEY = 'astu_ams_homepage_cms_config';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface HomepageCmsConfig {
  welcomeMessage: string;
  heroSlides: any[];
  impactStats: any[];
  portals: any[];
  campusLife: any[];
  campuses: any[];
  gallery: any[];
  videos: any[];
  events: any[];
  workshops: any[];
  newsItems: any[];
  announcements: any[];
  stories: any[];
  partners: any[];
  testimonials: any[];
  faq: any[];
  tracerSpotlight?: any;
  employerFeedback?: any;
  mentorshipStats?: any;
  /** Nested footer config edited via Footer Management / Homepage CMS */
  footer?: any;
  impactSection?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaRoute?: string;
    image?: string;
    active?: boolean;
  };
  careerCta?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    buttonLabel?: string;
    route?: string;
    active?: boolean;
  };
  bottomCta?: {
    title?: string;
    description?: string;
    primaryLabel?: string;
    primaryRoute?: string;
    secondaryLabel?: string;
    secondaryRoute?: string;
    active?: boolean;
  };
  researchHighlights?: {
    title?: string;
    description?: string;
    stats?: Array<{ label: string; value: string; icon?: string }>;
    active?: boolean;
  };
}

export const homepageCmsService = {
  getSettings(): HomepageCmsConfig | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  saveSettings(config: HomepageCmsConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('astu-cms-homepage-updated'));

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Save to dedicated homepage endpoint
    axios
      .put(`${API_URL}/content/homepage/config`, config, { headers })
      .catch(() => {
        // Fallback to legacy endpoint
        axios
          .post(
            `${API_URL}/content`,
            {
              title: 'Homepage CMS Configuration',
              type: 'page',
              status: 'Published',
              excerpt: JSON.stringify(config),
              author: 'CMS Admin',
              updatedAt: new Date().toISOString(),
            },
            { headers }
          )
          .catch((err) => console.warn('Failed to sync Homepage CMS config with backend DB:', err));
      });
  },

  async fetchFromApi(): Promise<HomepageCmsConfig | null> {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Try dedicated endpoint first
    try {
      const res = await axios.get(`${API_URL}/content/homepage/config`, { headers });
      if (res.data && res.data.success && res.data.data) {
        // ⚠️ Return data directly without writing to localStorage —
        // writing here fires storage events that cause dashboard re-render loops.
        return res.data.data;
      }
    } catch {
      /* fallback to legacy content list */
    }

    // 2. Legacy fallback
    try {
      const res = await axios.get(`${API_URL}/content`, { headers });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const foundConfigItem = res.data.data.find((i: any) => i.title === 'Homepage CMS Configuration');
        if (foundConfigItem && foundConfigItem.excerpt) {
          try {
            const parsed = typeof foundConfigItem.excerpt === 'string' ? JSON.parse(foundConfigItem.excerpt) : foundConfigItem.excerpt;
            return parsed;
          } catch {
            /* ignore JSON parse error */
          }
        }
      }
    } catch {
      /* ignore API error */
    }

    return this.getSettings();
  },

  async uploadMedia(file: File, album = 'General', altText = ''): Promise<{ url: string; id?: string }> {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('album', album);
    formData.append('altText', altText);

    const res = await axios.post(`${API_URL}/content/media/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.data && res.data.success && res.data.data?.url) {
      return res.data.data;
    }
    throw new Error('Upload failed');
  },
};

// ⚠️ No module-level auto-fetch: writing to localStorage on import fires
// storage events before components mount, causing blank/flicker re-renders.
export default homepageCmsService;
