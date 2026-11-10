import axios from 'axios';
import homepageCmsService from './homepageCms.service';

const STORAGE_KEY = 'astu_ams_gallery_page_settings';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface GalleryDetailSection {
  id: string;
  heading: string;
  body: string;
  active?: boolean;
}

export interface GalleryPageSettings {
  // Public /gallery Banner Customizer
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBadge: string;
  bannerBgColor: string;
  bannerImage: string;
  showBannerImage: boolean;
  searchPlaceholder: string;
  emptyTitle: string;
  emptySubtitle: string;

  // Homepage Gallery Section Customizer
  homeEyebrow: string;
  homeTitle: string;
  homeSubtitle: string;
  homeBgColor: string;
  homeButtonText: string;
  homeButtonLink: string;
  homeIcon: string;

  // Hyperlink Detail Page (/info/gallery) Customizer
  detailTitle: string;
  detailSubtitle: string;
  detailHeroImage: string;
  detailBadge: string;
  detailSections: GalleryDetailSection[];
}

export const defaultGalleryDetailSections: GalleryDetailSection[] = [
  {
    id: 'SEC-G1',
    heading: 'Photographic Heritage & Historical Milestones',
    body: 'Chronicles of university expansion, presidential convocations, national scientific symposia, and bilateral research missions preserved since 1993.',
    active: true,
  },
  {
    id: 'SEC-G2',
    heading: 'Research Discoveries & Applied Labs Exhibition',
    body: 'High-resolution photographic records of robotics laboratories, automotive testing rigs, renewable energy pilot sites, and material characterization cleanrooms.',
    active: true,
  },
  {
    id: 'SEC-G3',
    heading: 'Convocation & Alumni Homecoming Collections',
    body: 'Annual graduation ceremonies, alumni reunions, outstanding graduate medals, and global chapter gatherings connecting 25,000+ ASTU engineers worldwide.',
    active: true,
  },
];

export const defaultGallerySettings: GalleryPageSettings = {
  // Public /gallery Banner Customizer
  bannerTitle: 'ASTU Media & Photo Gallery',
  bannerSubtitle:
    'Visual showcases, event archives, research expos, graduation ceremonies, and campus life at Adama Science and Technology University.',
  bannerBadge: 'Official Campus Media Archive',
  bannerBgColor: '#003580',
  bannerImage: '/images/astu-building.jpg',
  showBannerImage: true,
  searchPlaceholder: 'Search gallery by title, album, or department...',
  emptyTitle: 'No media items found',
  emptySubtitle: 'Try adjusting your search terms or selecting a different album.',

  // Homepage Gallery Section
  homeEyebrow: 'Campus Gallery',
  homeTitle: 'Campus Life & Moments',
  homeSubtitle:
    'A glimpse of life at ASTU — research, innovation, graduation ceremonies, and alumni milestones.',
  homeBgColor: 'transparent',
  homeButtonText: 'View All Gallery',
  homeButtonLink: '/gallery',
  homeIcon: 'Image',

  // Hyperlink Detail Page (/info/gallery)
  detailTitle: 'ASTU Museums, Archives & Exhibition Galleries',
  detailSubtitle:
    'Explore the visual heritage, technological breakthroughs, architectural landmarks, and vibrant community traditions of Adama Science and Technology University.',
  detailHeroImage: '/images/arc.jpg',
  detailBadge: 'Campus Exhibition Archive',
  detailSections: defaultGalleryDetailSections,
};

export const gallerySettingsService = {
  getSettings(): GalleryPageSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultGallerySettings,
          ...parsed,
          detailSections:
            Array.isArray(parsed.detailSections) && parsed.detailSections.length > 0
              ? parsed.detailSections
              : defaultGalleryDetailSections,
        };
      }
    } catch (e) {
      console.warn('Failed to parse stored gallery settings:', e);
    }
    return defaultGallerySettings;
  },

  saveSettings(partial: Partial<GalleryPageSettings>): GalleryPageSettings {
    const current = this.getSettings();
    const updated: GalleryPageSettings = { ...current, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Auto sync to homepage CMS configuration
      const config = homepageCmsService.getSettings();
      homepageCmsService.saveSettings({
        ...config,
        galleryPage: {
          title: updated.detailTitle,
          subtitle: updated.detailSubtitle,
          image: updated.detailHeroImage,
          badge: updated.detailBadge,
          sections: updated.detailSections,
        },
      });

      window.dispatchEvent(new Event('astu-cms-gallery-settings-changed'));
      window.dispatchEvent(new Event('astu-cms-homepage-updated'));
      window.dispatchEvent(new Event('astu-cms-content-changed'));
    } catch (e) {
      console.warn('Failed to save gallery settings:', e);
    }

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    axios
      .post(
        `${API_URL}/content`,
        {
          title: 'Gallery Page Configuration',
          type: 'page',
          status: 'Published',
          excerpt: JSON.stringify(updated),
          author: 'CMS Admin',
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      .catch(() => {});

    return updated;
  },

  resetToDefaults(): GalleryPageSettings {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGallerySettings));

      const config = homepageCmsService.getSettings();
      homepageCmsService.saveSettings({
        ...config,
        galleryPage: {
          title: defaultGallerySettings.detailTitle,
          subtitle: defaultGallerySettings.detailSubtitle,
          image: defaultGallerySettings.detailHeroImage,
          badge: defaultGallerySettings.detailBadge,
          sections: defaultGallerySettings.detailSections,
        },
      });

      window.dispatchEvent(new Event('astu-cms-gallery-settings-changed'));
      window.dispatchEvent(new Event('astu-cms-homepage-updated'));
      window.dispatchEvent(new Event('astu-cms-content-changed'));
    } catch (e) {
      console.warn('Failed to reset gallery settings:', e);
    }
    return defaultGallerySettings;
  },
};

export default gallerySettingsService;
