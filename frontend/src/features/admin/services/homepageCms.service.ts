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
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      .catch((err) => console.warn('Failed to sync Homepage CMS config with backend DB:', err));
  },

  async fetchFromApi(): Promise<HomepageCmsConfig | null> {
    try {
      const res = await axios.get(`${API_URL}/content`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const foundConfigItem = res.data.data.find((i: any) => i.title === 'Homepage CMS Configuration');
        if (foundConfigItem && foundConfigItem.excerpt) {
          try {
            const parsed = JSON.parse(foundConfigItem.excerpt);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            window.dispatchEvent(new Event('astu-cms-homepage-updated'));
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
};

homepageCmsService.fetchFromApi().catch(() => {});

export default homepageCmsService;
