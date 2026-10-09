import axios from 'axios';
import { ContentCardItem } from '../components/ContentCard';
import homepageCmsService from './homepageCms.service';

const STORAGE_KEY = 'astu_ams_cms_content_items';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialItems: ContentCardItem[] = [
  {
    id: 'C-REAL-001',
    title: 'ASTU Hosts a Five-Day DAAD Alumni Workshop on Sustainable Water Supply & Environmental Protection',
    type: 'announcement',
    status: 'Published',
    excerpt: 'Promoting the capacity of local actors for sustainable water supply, sanitation, and environmental protection measures in East Africa from August 26 to 30.',
    content: `Adama Science and Technology University (ASTU) proudly hosted the five-day DAAD International Alumni Workshop titled “Promoting the capacity of local actors for sustainable water supply, sanitation and environmental protection measures in East Africa.”

The prestigious international symposium brought together leading academic researchers, civil engineers, and environmental practitioners from Germany, Kenya, Uganda, Tanzania, and sister Ethiopian universities (including ASTU, Hawassa, Jimma, Bahir Dar, and Addis Ababa Universities), alongside representatives from relevant ministries and regional authorities.

Key Workshop Focus Areas:
• Environmental Challenges in the Horn of Africa: Evaluating regional water management frameworks and climate adaptation strategies.
• Water Supply & Sanitation Infrastructure: Analyzing engineering innovations to protect watershed basins, curb soil erosion, and reverse land degradation.
• Cross-Border Academic & Research Alliances: Establishing sustainable research partnerships between ASTU laboratories and German institutions.
• Community Capacity Building: Empowering local municipalities with technical tools to preserve clean water resources and foster environmental governance.

The degradation of regional ecosystems poses critical challenges to agriculture, biodiversity, and community health. Through international partnerships like the DAAD alumni collaboration, ASTU continues to drive high-impact applied research that safeguards natural resources for future generations.`,
    image: '/images/arc.jpg',
    author: 'ASTU International Relations & Corporate Communication Directorate (IRCCD)',
    updatedAt: 'Mar 7, 2025',
    publishedAt: 'Mar 7, 2025',
    views: 2410,
    tags: ['workshop', 'daad', 'environment', 'water-supply', 'east-africa'],
    pinned: true,
    featured: true,
    language: 'EN',
    buttonText: 'Read Full Notice',
  },
  {
    id: 'C-REAL-002',
    title: 'ASTU Alumni Association Inspires Graduating Class with Career Tips!',
    type: 'post',
    status: 'Published',
    excerpt: 'Navigating the Transition: Former graduates and industry leaders guide graduating seniors with high-impact labor market strategies ahead of the annual campus Job Expo.',
    content: `An inspiring and transformative gathering took place at the ASTU Main Campus as distinguished former graduates from the University Alumni Association led the intensive workshop on “Navigating the Transition: Labor Market Tips for Graduating Class Students.”

Held ahead of the university's flagship Job Expo, top industry specialists and seasoned alumni executives shared practical guidance to prepare final-year engineers and technology students for dynamic employment markets.

Session Highlights:
• Engineering CV & Portfolio Excellence: Structuring technical credentials and demonstrating real capstone lab experience.
• Navigating High-Stakes Technical Interviews: Practical mock sessions conducted by alumni engineering managers.
• Professional Networking & Mentorship: Leveraging the ASTU Alumni Management System (AMS) to connect with corporate mentors.
• Industry Transition Mindset: Bridging academic theory with enterprise problem-solving expectations.

We extend our sincere appreciation to the ASTU Alumni Association, Student Union President, International Relations & Corporate Communication Directorate (IRCCD), and the Students' Skill Development Coordination Office for making this initiative an overwhelming success!`,
    image: '/images/gc7.jpg',
    author: 'ASTU Alumni Association & Students Skill Development Office',
    updatedAt: 'Mar 7, 2025',
    publishedAt: 'Mar 7, 2025',
    views: 1980,
    tags: ['career', 'job-expo', 'mentorship', 'graduates'],
    pinned: true,
    featured: true,
    language: 'EN',
    buttonText: 'Read Full Notice',
  },
  {
    id: 'C-REAL-003',
    title: 'ASTU Alumni Spotlight: Yohannes Melese, Gold Medalist & Dual-Major Graduate!',
    type: 'post',
    status: 'Published',
    excerpt: 'Graduating with a dual major in Electronics & Communication Engineering and Computer Science, achieving an outstanding CGPA of 3.98 with 47 A+ grades.',
    content: `Adama Science and Technology University proudly celebrates the exceptional academic and innovation journey of Yohannes Melese, who graduated from ASTU with a dual major degree in Electronics & Communication Engineering and Computer Science & Engineering.

Over years of relentless dedication and intellectual curiosity, Yohannes focused not merely on coursework, but on mastering applied engineering concepts. His unwavering commitment culminated in an extraordinary CGPA of 3.98, accompanied by 47 A+ grades — a milestone achievement reflecting academic brilliance and perseverance.

In his own words:
“I wish to express my sincere thanks to my lecturers, classmates, family, and friends for their unwavering support and encouragement. I am looking forward to the next chapter in my career, where I will apply my knowledge and skills to real-world engineering challenges. I am particularly excited about combining my expertise in Electronics & Communication and Computer Science to contribute to the field of technology in East Africa and globally.”

Yohannes is among the esteemed delegates representing ASTU at international technological forums, exemplifying the university's mission to produce world-class leaders in science and technology.`,
    image: '/images/electriclabs.jpeg',
    author: 'ASTU Academic Registrar & Alumni Directorate',
    updatedAt: 'Mar 7, 2025',
    publishedAt: 'Mar 7, 2025',
    views: 3120,
    tags: ['alumni-spotlight', 'gold-medalist', 'engineering', 'computer-science'],
    pinned: true,
    featured: true,
    language: 'EN',
    buttonText: 'Read Full Notice',
  },
  {
    id: 'C-REAL-004',
    title: 'ASTU Alumni Serving as Model United Nations Secretariats & Global Delegates',
    type: 'announcement',
    status: 'Published',
    excerpt: 'Recognizing outstanding ASTU graduates who served as secretariats for Model United Nations and international diplomatic & tech forums.',
    content: `Adama Science and Technology University congratulates our outstanding alumni delegates who were selected to serve as Model United Nations secretariats and committee directors.

Demonstrating exemplary diplomatic acumen, critical debate skills, and technical leadership, ASTU graduates continue to prove that rigorous science and engineering education provides the analytical foundation needed for global diplomacy, technology policy, and sustainable development governance.

Contact the Alumni Relations Directorate at irccd@astu.edu.et or via official Telegram @Adama_STU_Almuni to connect with global alumni delegations.`,
    image: '/images/campus-2.jpeg',
    author: 'ASTU Corporate Communication Directorate',
    updatedAt: 'Jan 7, 2025',
    publishedAt: 'Jan 7, 2025',
    views: 1420,
    tags: ['global-impact', 'mun', 'diplomacy', 'leadership'],
    pinned: false,
    featured: true,
    language: 'EN',
    buttonText: 'Read Full Notice',
  },
  {
    id: 'C-002',
    title: 'ASTU Alumni Network: Bridging Generations',
    type: 'post',
    status: 'Published',
    excerpt: 'How our alumni network connects 25,000+ graduates with opportunities, mentorship, and lifelong learning resources.',
    content: `Adama Science and Technology University (ASTU) hereby releases this official notice for the information of alumni, students, partner employers, academic departments, and stakeholders.

Connecting across industries from renewable energy to software engineering, ASTU graduates continue to drive technological breakthroughs worldwide. The ASTU Alumni Management System (AMS) bridges recent graduates with executive alumni across 14 countries.

Through structured tracer surveys, regional alumni chapter meetups, and dedicated mentorship circles, the network ensures that every generation of ASTU engineers, architects, and scientists has direct access to career acceleration opportunities, research collaborations, and enterprise sponsorships.`,
    image: '/images/astu-building.jpg',
    author: 'Content Manager',
    updatedAt: 'May 28, 2026',
    publishedAt: 'May 28, 2026',
    views: 1240,
    tags: ['alumni', 'community', 'networking'],
    pinned: true,
    featured: true,
    language: 'EN',
    buttonText: 'Read Full Notice',
  },
  {
    id: 'C-001',
    title: 'ASTU Alumni Carnival 2026',
    type: 'announcement',
    status: 'Published',
    excerpt: 'Grand Homecoming Carnival & Alumni Gathering celebrating 30 years of excellence. Mandatory alumni registration open for stadium access, networking exhibition, and award banquet.',
    content: 'Adama Science and Technology University cordially invites all alumni, faculty, staff, and institutional partners to the ASTU Alumni Carnival 2026 on April 25-26. This landmark celebration includes high-level networking, technical symposiums, research exhibitions, and the alumni excellence banquet.',
    image: '/images/campus-2.jpeg',
    author: 'ASTU Directorate Notice',
    updatedAt: 'Apr 25, 2026',
    publishedAt: 'Apr 25, 2026',
    views: 1840,
    tags: ['alumni', 'carnival', 'homecoming', 'networking'],
    pinned: false,
    featured: true,
    language: 'EN',
    buttonText: 'Read Full Notice',
  },
  {
    id: 'C-003',
    title: 'Semester Break: Campus Safety Notice',
    type: 'announcement',
    status: 'Published',
    excerpt: 'Important safety reminders for students, faculty, and visitors during the upcoming semester break.',
    content: 'University Security Directorate issues standard campus access guidelines during the inter-semester recess. Please ensure laboratory equipment is safely powered down and dormitory clearances are logged.',
    image: '/images/astu-building.jpg',
    author: 'ASTU Directorate Notice',
    updatedAt: 'Jun 7, 2026',
    publishedAt: 'Jun 7, 2026',
    views: 892,
    tags: ['safety', 'campus', 'announcement'],
    pinned: false,
    featured: false,
    language: 'EN',
    buttonText: 'Read Full Notice',
  },
  {
    id: 'C-004',
    title: 'Campus Tour 2026 Photo Album',
    type: 'gallery',
    status: 'Published',
    excerpt: 'Stunning aerial and ground-level photos from the 2026 campus tour showcasing state-of-the-art facilities.',
    content: 'Showcasing the newly opened Applied Robotics Center, high-performance computing facilities, and green amphitheater on the ASTU Main Campus.',
    image: '/images/State-M.jpg',
    author: 'ASTU Directorate Notice',
    updatedAt: 'Just now',
    publishedAt: 'Just now',
    views: 650,
    tags: ['gallery', 'campus', 'photos'],
    pinned: false,
    featured: true,
    language: 'EN',
    buttonText: 'Read Full Notice',
  },
  {
    id: 'C-005',
    title: 'ASTU Research Grant Winners 2026',
    type: 'post',
    status: 'Published',
    excerpt: 'Announcing 12 applied research grants awarded to faculty and alumni engineering teams.',
    content: 'The Office of the Vice President for Research and Technology Transfer is pleased to announce the recipients of the 2026 National Innovation Research Fund grants.',
    image: '/images/arc.jpg',
    author: 'ASTU Directorate Notice',
    updatedAt: 'May 25, 2026',
    publishedAt: 'May 25, 2026',
    views: 1890,
    tags: ['research', 'grants', 'engineering'],
    pinned: false,
    featured: true,
    language: 'EN',
    buttonText: 'Read Full Notice',
  },
];

export const contentService = {
  getItems(): ContentCardItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasRealNews = parsed.some(
            (p: any) => p.id === 'C-REAL-001' || (p.title && p.title.includes('DAAD'))
          );
          if (!hasRealNews) {
            const merged = [
              initialItems[0],
              initialItems[1],
              initialItems[2],
              initialItems[3],
              ...parsed.filter((p: any) => p.title !== 'Homepage CMS Configuration'),
            ];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          }
          return parsed.filter((i) => i.title !== 'Homepage CMS Configuration');
        }
      }
    } catch {
      /* ignore */
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialItems));
    return initialItems;
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
      if (rawItems.length > 0) {
        const normalized = rawItems.map((i) => this.normalizeItem(i));
        // Merge: API items + any local items not in API
        const apiIds = new Set(normalized.map((i) => i.id));
        const localExtras = this.getItems().filter((i) => !apiIds.has(i.id));
        const merged = [...normalized, ...localExtras];
        this.saveItems(merged, false);
        return merged;
      }
    } catch {
      /* silently fall back to local cache */
    }
    return this.getItems();
  },
};

export default contentService;
