import axios from 'axios';

const STORAGE_KEY = 'astu_ams_footer_cms_config';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterSocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
}

export interface FooterCmsConfig {
  sections: FooterSection[];
  socialLinks: FooterSocialLink[];
  contactInfo: {
    address: string;
    poBox: string;
    phone: string;
    email: string;
  };
  copyright: string;
  credit: string;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
}

export const defaultFooterConfig: FooterCmsConfig = {
  sections: [
    {
      id: 'FS-01',
      title: 'Portal Services',
      links: [
        { id: 'FL-01', label: 'Alumni', href: '/info/alumni-portal' },
        { id: 'FL-02', label: 'Employer', href: '/info/employer-portal' },
        { id: 'FL-03', label: 'Registrar', href: '/info/registrar-portal' },
        { id: 'FL-04', label: 'Department', href: '/info/department-portal' },
      ],
    },
    {
      id: 'FS-02',
      title: 'About ASTU',
      links: [
        { id: 'FL-05', label: 'University Overview', href: '/' },
        { id: 'FL-06', label: 'Impact & Accreditation', href: '#impact' },
        { id: 'FL-07', label: 'Research Highlights', href: '#research' },
      ],
    },
    {
      id: 'FS-03',
      title: 'Resources',
      links: [
        { id: 'FL-08', label: 'Events', href: '#events' },
        { id: 'FL-09', label: 'Workshops', href: '#workshops' },
        { id: 'FL-10', label: 'Career Opportunities', href: '#career-opportunities' },
        { id: 'FL-11', label: 'FAQ', href: '#faq' },
      ],
    },
    {
      id: 'FS-04',
      title: 'Connect',
      links: [
        { id: 'FL-12', label: 'Contact Us', href: '#contact' },
        { id: 'FL-13', label: 'Photo Gallery', href: '#gallery' },
        { id: 'FL-14', label: 'Community Voices', href: '#testimonials' },
        { id: 'FL-15', label: 'Join Alumni', href: '/register' },
      ],
    },
  ],
  socialLinks: [
    { id: 'SL-01', platform: 'Facebook', url: 'https://web.facebook.com/adamaastu/', icon: 'Facebook' },
    { id: 'SL-02', platform: 'Telegram', url: 'https://t.me/Adama_STU_Alumni', icon: 'Send' },
    { id: 'SL-03', platform: 'LinkedIn', url: 'https://www.linkedin.com/school/adama-science-and-technology-university/', icon: 'Linkedin' },
  ],
  contactInfo: {
    address: 'Adama Science and Technology University, Adama, Ethiopia',
    poBox: 'P.O. Box: 1888 Adama, Ethiopia',
    phone: '+251-221-110000',
    email: 'irccd@astu.edu.et',
  },
  copyright: `© ${new Date().getFullYear()} Adama Science and Technology University. All rights reserved.`,
  credit: 'Designed by ASTU-AMS',
  newsletterTitle: 'Stay Connected with ASTU',
  newsletterSubtitle: 'Get updates on reunions, career expos, and graduate employment reports.',
};

export const footerCmsService = {
  getSettings(): FooterCmsConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...defaultFooterConfig, ...JSON.parse(stored) };
    } catch {
      /* ignore */
    }
    return defaultFooterConfig;
  },

  saveSettings(config: FooterCmsConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('astu-cms-footer-updated'));

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Persist under homepage config.footer so public pages can fetch from API
    axios
      .get(`${API_URL}/content/homepage/config`, { headers })
      .then((res) => {
        const existing = res.data?.data && typeof res.data.data === 'object' ? res.data.data : {};
        return axios.put(
          `${API_URL}/content/homepage/config`,
          { ...existing, footer: config },
          { headers }
        );
      })
      .catch(() => {
        /* offline / unauthorized — localStorage still has the save */
      });
  },

  async fetchFromApi(): Promise<FooterCmsConfig> {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await axios.get(`${API_URL}/content/homepage/config`, { headers });
      if (res.data?.success && res.data.data?.footer) {
        return { ...defaultFooterConfig, ...res.data.data.footer };
      }
    } catch {
      /* fall through */
    }
    return this.getSettings();
  },
};

export default footerCmsService;
