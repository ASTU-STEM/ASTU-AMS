import axios from 'axios';

const STORAGE_KEY = 'astu_ams_announcement_page_settings';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AnnouncementPageSettings {
  // Banner / Header Customization
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBadge: string;
  bannerBgColor: string;
  bannerImage: string;
  showBannerImage: boolean;

  // Top Alert Broadcast Bar
  topAlertEnabled: boolean;
  topAlertText: string;
  topAlertLink: string;

  // Search & Filter
  searchPlaceholder: string;
  filterAllLabel: string;

  // Default Card Labels
  authorityLabel: string;
  cardButtonText: string;

  // Empty State
  emptyTitle: string;
  emptyDescription: string;
}

export const defaultAnnouncementSettings: AnnouncementPageSettings = {
  bannerTitle: 'ASTU Official Notices & Announcements',
  bannerSubtitle: 'Official communications, university bulletins, academic notices, and alumni achievements.',
  bannerBadge: 'ASTU Official Bulletins',
  bannerBgColor: '#003580',
  bannerImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80',
  showBannerImage: true,

  topAlertEnabled: false,
  topAlertText: 'Notice: 2026 Academic & Alumni Portal update is live.',
  topAlertLink: '/announcements',

  searchPlaceholder: 'Search official notices by title, excerpt, or keyword...',
  filterAllLabel: 'All Notice Types',

  authorityLabel: 'ASTU Directorate Notice',
  cardButtonText: 'Read Full Notice',

  emptyTitle: 'No Announcements Found',
  emptyDescription: 'Try adjusting your search term or category filter.',
};

export const announcementSettingsService = {
  getSettings(): AnnouncementPageSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultAnnouncementSettings, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse stored announcement settings:', e);
    }
    return defaultAnnouncementSettings;
  },

  saveSettings(partial: Partial<AnnouncementPageSettings>): AnnouncementPageSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('astu-announcement-settings-changed'));
    } catch (e) {
      console.warn('Failed to save announcement settings to localStorage:', e);
    }

    // Attempt background sync to backend
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios
      .post(
        `${API_URL}/content`,
        {
          title: 'Announcement Page Configuration',
          type: 'page',
          status: 'Published',
          excerpt: JSON.stringify(updated),
          author: 'CMS Admin',
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      .catch(() => {
        /* silent fallback to local storage */
      });

    return updated;
  },

  resetToDefaults(): AnnouncementPageSettings {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAnnouncementSettings));
      window.dispatchEvent(new Event('astu-announcement-settings-changed'));
    } catch (e) {
      console.warn('Failed to reset announcement settings:', e);
    }
    return defaultAnnouncementSettings;
  },
};

export default announcementSettingsService;
