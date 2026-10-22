import axios from 'axios';
import { defaultDetailPages, DetailPageItem } from './detailPages.data';

const STORAGE_KEY = 'astu_ams_homepage_cms_config';
const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () =>
  localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');

export interface HeroSlide {
  id: string;
  image: string;
  tagline: string;
  title: string;
  description: string;
  active: boolean;
}

export interface ImpactStat {
  id: string;
  label: string;
  value: string;
  suffix: string;
  detail: string;
  icon: string;
  trend?: string;
  action?: string;
  target?: string;
  active: boolean;
}

export interface StakeholderPortal {
  id: string;
  title: string;
  icon: string;
  points: string[];
  cta: string;
  route: string;
  active: boolean;
  description?: string;
  color?: string;
  iconBg?: string;
  step?: number;
}

export interface CampusLifeCard {
  id: string;
  title: string;
  campus: string;
  description: string;
  image: string;
  action: string;
  link?: string;
  active: boolean;
}

export interface Campus {
  id: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
}

export interface GalleryImage {
  id: string;
  title: string;
  src: string;
  active: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  image: string;
  active: boolean;
  link?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  active: boolean;
  category?: string;
  description?: string;
  organizer?: string;
  capacity?: number;
  registrationInfo?: string;
  highlights?: string;
  pinned?: boolean;
  kind?: 'Event' | 'Workshop';
  rsvps?: number;
}

export interface WorkshopItem {
  id: string;
  title: string;
  date: string;
  seats: string;
  focus: string;
  active: boolean;
  location?: string;
  image?: string;
  description?: string;
  organizer?: string;
  capacity?: number;
  registrationInfo?: string;
  highlights?: string;
  pinned?: boolean;
  kind?: 'Event' | 'Workshop';
  rsvps?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt?: string;
  image?: string;
  active: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  type: string;
  link?: string;
  active: boolean;
}

export interface SuccessStory {
  id: string;
  name: string;
  role: string;
  text: string;
  image: string;
  active: boolean;
}

/* ─── Community Page Types ─── */
export interface CommunityMember {
  id: string;
  name: string;
  role: string;
  org: string;
  location: string;
  category: string;
  degree: string;
  gradYear: string;
  image: string;
  bio: string;
  quote?: string;
  badge?: string;
  active: boolean;
}

export interface RegionalChapter {
  id: string;
  name: string;
  hub: string;
  members: string;
  focus: string;
  contact: string;
  active: boolean;
}

export interface CommunityPillar {
  id: string;
  icon: string;
  title: string;
  desc: string;
  action: string;
  link: string;
  active: boolean;
}

export interface CommunityPageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroButtonPrimaryText: string;
  heroButtonPrimaryLink: string;
  heroButtonSecondaryText: string;
  stat1Value: string;
  stat1Label: string;
  stat1Sub: string;
  stat2Value: string;
  stat2Label: string;
  stat2Sub: string;
  stat3Value: string;
  stat3Label: string;
  stat3Sub: string;
  stat4Value: string;
  stat4Label: string;
  stat4Sub: string;
  directoryEyebrow: string;
  directoryTitle: string;
  directorySubtitle: string;
  members: CommunityMember[];
  chapters: RegionalChapter[];
  pillars: CommunityPillar[];
  showChapters: boolean;
  showPillars: boolean;
  showCarnival: boolean;
  carnivalTitle: string;
  carnivalDescription: string;
  carnivalDate: string;
  carnivalLocation: string;
  carnivalButtonPrimary: string;
  carnivalButtonSecondary: string;
}

export interface PartnerBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  active: boolean;
}

export interface PartnerStat {
  id: string;
  value: string;
  label: string;
}

export interface UnifiedPartnerTrack {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  active?: boolean;
}

export interface UnifiedPartnerFaq {
  id: string;
  question: string;
  answer: string;
}

export interface PartnersPageConfig {
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaLink: string;
  heroBackgroundImage?: string;
  benefitsEyebrow?: string;
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefits: PartnerBenefit[];
  partnersCarouselTitle: string;
  partnersCarouselSubtitle: string;
  featuresEyebrow?: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: string[];
  ctaCardTitle: string;
  ctaCardDescription: string;
  ctaCardButtonText: string;
  ctaCardButtonLink: string;
  stats: PartnerStat[];
  bottomCtaTitle: string;
  bottomCtaDescription: string;
  bottomCtaButtonText: string;
  bottomCtaButtonLink: string;
  stakeholdersTitle?: string;
  stakeholdersSubtitle?: string;
  stakeholderTracks?: UnifiedPartnerTrack[];
  recruitmentTitle?: string;
  recruitmentSubtitle?: string;
  recruitmentTracks?: UnifiedPartnerTrack[];
  faqs?: UnifiedPartnerFaq[];
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
}

export const defaultPartnersPageConfig: PartnersPageConfig = {
  heroBadge: 'Employer & Industry Partnerships',
  heroTitle: 'Partner with ASTU to Access',
  heroHighlight: 'Top Engineering & Tech Graduates',
  heroSubtitle: 'Connect with verified alumni talent, publish career and internship opportunities, and shape modern technical education through strategic industry collaboration.',
  heroPrimaryCtaText: 'Register as Employer',
  heroPrimaryCtaLink: '/employers/register',
  heroSecondaryCtaText: 'Employer Portal Login',
  heroSecondaryCtaLink: '/login',
  heroBackgroundImage: '',
  benefitsEyebrow: 'MUTUAL VALUE & TALENT ACCESS',
  benefitsTitle: 'Why Partner with ASTU?',
  benefitsSubtitle: 'Join leading industry enterprises, public institutions, and research consortia actively recruiting and collaborating with ASTU.',
  benefits: [
    {
      id: 'B-1',
      icon: 'Users',
      title: 'Hire Talented Graduates',
      description: 'Access a vetted pool of ASTU graduates equipped with rigorous practical training in applied engineering, software, technology, and sciences.',
      active: true,
    },
    {
      id: 'B-2',
      icon: 'Briefcase',
      title: 'Post Job Opportunities',
      description: 'Publish employment openings, graduate trainee tracks, and internship positions directly to thousands of verified alumni.',
      active: true,
    },
    {
      id: 'B-3',
      icon: 'MessageSquare',
      title: 'Give Industry Feedback',
      description: 'Directly influence biennial curriculum revisions and ensure graduate competency alignment through structured employer surveys.',
      active: true,
    },
    {
      id: 'B-4',
      icon: 'Search',
      title: 'Verified Student Information',
      description: 'Search alumni profiles by department, GPA, verified degree credentials, technical skills, and graduation cohort.',
      active: true,
    },
    {
      id: 'B-5',
      icon: 'TrendingUp',
      title: 'Track Recruitment Analytics',
      description: 'Monitor application pipelines, tracer study response trends, and longitudinal employment metrics in real time.',
      active: true,
    },
    {
      id: 'B-6',
      icon: 'Handshake',
      title: 'Build Strategic Partnerships',
      description: 'Form long-term ties for joint research initiatives, faculty-industry exchange, campus hackathons, and corporate sponsorships.',
      active: true,
    },
  ],
  partnersCarouselTitle: 'Corporate & Institutional Partners',
  partnersCarouselSubtitle: 'Leading employers collaborating with ASTU across telecom, aviation, cybersecurity, banking, and technology sectors.',
  featuresEyebrow: 'ENTERPRISE ECOSYSTEM',
  featuresTitle: 'Comprehensive Partner Benefits',
  featuresSubtitle: 'Our dedicated employer platform provides institutions with robust tools to streamline talent sourcing and collaborate on institutional excellence.',
  features: [
    'TIN-verified enterprise employer accounts with high trust scores',
    'Direct access to verified ASTU alumni and graduating seniors',
    'Curriculum-aligned technical skill matching and automated recommendations',
    'Accreditation-ready reporting and longitudinal tracer feedback loops',
    'Priority coordination for campus recruitment days and tech expos',
    'Direct engagement with academic departments and senior faculty',
  ],
  ctaCardTitle: 'Accelerate Your Hiring Pipeline',
  ctaCardDescription: 'Register your organization today to gain immediate access to verified graduate profiles and dedicated recruitment assistance.',
  ctaCardButtonText: 'Register as Partner',
  ctaCardButtonLink: '/employers/register',
  stats: [
    { id: 'S-1', value: '', label: 'Verified Alumni' },
    { id: 'S-2', value: '', label: 'Partner Organizations' },
    { id: 'S-3', value: '', label: 'Employment Rate' },
    { id: 'S-4', value: '', label: 'Engineering & Science Schools' },
  ],
  bottomCtaTitle: 'Start Building Your High-Impact Talent Pipeline Today',
  bottomCtaDescription: 'Join ASTU\'s corporate partner network and connect directly with Ethiopia\'s premier engineering, applied science, and technology graduates.',
  bottomCtaButtonText: 'Register Your Organization',
  bottomCtaButtonLink: '/employers/register',
  stakeholdersTitle: 'Strategic Alliances & Industry Consortia',
  stakeholdersSubtitle: 'Active cooperation frameworks with government agencies, multinational tech enterprises, and international research organizations.',
  stakeholderTracks: [
    { id: 'ST-1', title: 'Enterprise & Corporate Alliances', desc: 'Enterprise partners collaborating with ASTU on talent pipelines, industrial internships, and technology initiatives.', badge: 'Corporate Tier', active: true },
    { id: 'ST-2', title: 'Academic & Research Consortia', desc: 'Partnering with German Academic Exchange Service (DAAD), regional universities, and national research institutes on applied engineering grants.', badge: 'International Consortia', active: true },
    { id: 'ST-3', title: 'Curriculum & ETA Competency Alignment', desc: 'Stakeholder advisory boards meet regularly to evaluate industry skill trends, feeding data from graduate tracer surveys directly into university curriculum reforms.', badge: 'Accreditation Readiness', active: true },
    { id: 'ST-4', title: 'Applied Laboratories & Joint Innovation', desc: 'Specialized engineering laboratories and research centers equipped to prototype and test regional solutions alongside enterprise sponsors.', badge: 'Innovation Hub', active: true },
  ],
  recruitmentTitle: 'Recruitment Framework & Talent Engine',
  recruitmentSubtitle: 'Accelerate graduate hiring and evaluate verified competency metrics through the AMS platform.',
  recruitmentTracks: [
    { id: 'RT-1', title: 'Direct Opportunity Publishing', desc: 'Publish vacancies, internships, and graduate trainee programs directly to verified graduates across ASTU fields of study.', badge: 'Job Board', active: true },
    { id: 'RT-2', title: 'Smart Candidate Search & Filters', desc: 'Filter verified candidates by GPA, graduation year, engineering department, and technical skills.', badge: 'Candidate Match', active: true },
    { id: 'RT-3', title: 'Employer Competency Feedback', desc: 'Submit structured employer feedback regarding graduate competencies to directly influence ASTU curriculum development.', badge: 'Quality Loop', active: true },
    { id: 'RT-4', title: 'On-Campus Career Expos & Interviews', desc: 'Coordinate interview suites, campus recruitment expos, and graduate tech talk days directly with ASTU leadership.', badge: 'Campus Days', active: true },
  ],
  faqs: [
    { id: 'PF-1', question: 'How can our enterprise register as an official partner on ASTU-AMS?', answer: 'Click "Register as Employer", submit your corporate details and TIN verification. The ASTU Corporate Relations office approves verified accounts within 24–48 hours.' },
    { id: 'PF-2', question: 'Are candidate degrees and graduation records verified?', answer: 'Yes, all alumni profiles on ASTU-AMS are directly cross-referenced against official university registrar records.' },
    { id: 'PF-3', question: 'Can our organization conduct on-campus recruitment and interview suites?', answer: 'Yes! Partner organizations receive priority scheduling for campus career fairs, departmental interview rooms, and guest lecture symposiums.' },
    { id: 'PF-4', question: 'How do employer surveys influence ASTU engineering curricula?', answer: 'Every 2 years, feedback from corporate employers is compiled into tracer study reports submitted to the Academic Vice President and ETA accreditation auditors.' },
  ],
  contactEmail: 'irccd@astu.edu.et',
  contactPhone: '+251-221-110000',
  contactAddress: 'Adama Science and Technology University, Adama, Oromia, Ethiopia',
};

export interface Partner {
  id: string;
  name: string;
  active: boolean;
  logo?: string;
  website?: string;
  industry?: string;
  location?: string;
  openings?: string;
  partnershipType?: 'Strategic' | 'Recruitment' | 'Research' | 'Internship' | 'Technology' | string;
  description?: string;
  contactEmail?: string;
  featured?: boolean;
}

/** Partners come from CMS / API only — no demo directory. */
export const defaultPartnersList: Partner[] = [];

export interface FeaturedEmployerItem {
  id: string;
  name: string;
  area: string;
  openings: string;
  active: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  by: string;
  active: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  active: boolean;
}

export interface SectionLinks {
  /* Announcement ticker */
  tickerLinkText: string;
  tickerLinkTarget: string;
  /* Impact stat cards */
  impactDefaultLinkText: string;
  impactDefaultLinkTarget: string;
  /* Portals (How It Works) */
  portalsGetStartedText: string;
  portalsGetStartedLink: string;
  /* Campus Life section */
  campusLifeViewAllText: string;
  campusLifeViewAllLink: string;
  /* Industry Bridge section */
  industryBridgeButtonText: string;
  industryBridgeButtonLink: string;
  /* Events section */
  eventsViewAllText: string;
  eventsViewAllLink: string;
  eventsCardDetailsText: string;
  eventsCardDetailsLink: string;
  eventsCardRegisterText: string;
  /* Announcements section */
  announcementsViewAllText: string;
  announcementsViewAllLink: string;
  announcementItemLinkBase: string;
  /* Partners section */
  partnersViewAllText: string;
  partnersViewAllLink: string;
  /* FAQ section */
  faqViewAllText: string;
  faqViewAllLink: string;
  /* Success Stories section */
  storiesReadMoreText: string;
  storiesViewAllText: string;
  storiesViewAllLink: string;
  /* Accreditation section */
  accreditationButtonText: string;
  accreditationButtonLink: string;
  /* Footer links */
  footerCareerPortalText: string;
  footerCareerPortalLink: string;
  footerTracerHubText: string;
  footerTracerHubLink: string;
  footerMentorshipText: string;
  footerMentorshipLink: string;
  footerStudentPortalText: string;
  footerStudentPortalLink: string;
  footerQualityAssuranceText: string;
  footerQualityAssuranceLink: string;
  footerAccreditationOutcomesText: string;
  footerAccreditationOutcomesLink: string;
  footerInstitutionalResearchText: string;
  footerInstitutionalResearchLink: string;
}

export const defaultSectionLinks: SectionLinks = {
  tickerLinkText: 'Details',
  tickerLinkTarget: '/announcements',
  impactDefaultLinkText: 'View Details',
  impactDefaultLinkTarget: '/info/impact-numbers',
  portalsGetStartedText: 'Get Started Today',
  portalsGetStartedLink: '/login',
  campusLifeViewAllText: 'Explore All',
  campusLifeViewAllLink: '/info/campus-life',
  industryBridgeButtonText: 'Explore Campus Life',
  industryBridgeButtonLink: '/info/campus-life',
  eventsViewAllText: 'See All Events →',
  eventsViewAllLink: '/events',
  eventsCardDetailsText: 'View Details',
  eventsCardDetailsLink: '/events',
  eventsCardRegisterText: 'Register',
  announcementsViewAllText: 'View all',
  announcementsViewAllLink: '/announcements',
  announcementItemLinkBase: '/announcements',
  partnersViewAllText: 'View All Partners',
  partnersViewAllLink: '/info/featured-employers',
  faqViewAllText: 'View All FAQs',
  faqViewAllLink: '/info/faq',
  storiesReadMoreText: 'Read More',
  storiesViewAllText: 'View All Stories',
  storiesViewAllLink: '/info/community-feed',
  accreditationButtonText: 'View Impact Numbers',
  accreditationButtonLink: '/info/impact-numbers',
  footerCareerPortalText: 'Career Placement Portal',
  footerCareerPortalLink: '/info/overview',
  footerTracerHubText: 'Tracer Survey Hub',
  footerTracerHubLink: '/info/overview',
  footerMentorshipText: 'Mentorship Scheduling',
  footerMentorshipLink: '/info/mentorship',
  footerStudentPortalText: 'Student Portal',
  footerStudentPortalLink: 'https://estudent.astu.edu.et/',
  footerQualityAssuranceText: 'Quality Assurance Deans',
  footerQualityAssuranceLink: '/info/accreditation',
  footerAccreditationOutcomesText: 'Accreditation Outcomes',
  footerAccreditationOutcomesLink: '/info/impact-numbers',
  footerInstitutionalResearchText: 'Institutional Research',
  footerInstitutionalResearchLink: '/info/overview',
};

export interface NavSection {
  id: string;
  label: string;
  active: boolean;
}

export interface CommunityPost {
  name: string;
  role: string;
  company: string;
  message: string;
  image?: string;
  active: boolean;
}

export interface HomepageCmsConfig {
  welcomeMessage: string;
  welcomeEnabled?: boolean;
  heroBadge?: string;
  sectionLinks?: SectionLinks;
  heroButtons?: {
    primaryText: string;
    primaryLink: string;
    secondaryText: string;
    secondaryLink: string;
  };
  heroSlides: HeroSlide[];
  impactHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  impactStats: ImpactStat[];
  portalsHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
  portals: StakeholderPortal[];
  campusLifeHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  campusLife: CampusLifeCard[];
  campuses: Campus[];
  gallery: GalleryImage[];
  gallerySection?: any;
  galleryHeaders?: any;
  videos: VideoItem[];
  eventsHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
    viewAllText: string;
    viewAllLink: string;
  };
  events: EventItem[];
  workshops: WorkshopItem[];
  newsHeaders?: {
    eyebrow: string;
    title: string;
  };
  newsItems: NewsItem[];
  announcementsHeaders?: {
    eyebrow: string;
    title: string;
    subscribeTitle: string;
    subscribeDesc: string;
  };
  announcements: Announcement[];
  storiesHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  stories: SuccessStory[];
  partnersHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  partners: Partner[];
  featuredEmployers?: FeaturedEmployerItem[];
  testimonials: Testimonial[];
  faqHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  faq: FaqItem[];
  accreditation?: {
    eyebrow: string;
    title: string;
    description: string;
    point1Title: string;
    point1Desc: string;
    point2Title: string;
    point2Desc: string;
    buttonText: string;
    buttonLink: string;
    image1: string;
    image2: string;
  };
  tracerSpotlight?: any;
  employerFeedback?: any;
  mentorshipStats?: any;
  industryBridge?: any;
  // Authored homepage blocks. They are optional so a CMS config that predates
  // them (or a partial save) still loads — the page falls back to defaults.
  impactSection?: {
    enabled?: boolean;
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: string;
    ctaLabel?: string;
    ctaRoute?: string;
  };
  careerCta?: {
    enabled?: boolean;
    eyebrow?: string;
    title?: string;
    description?: string;
    buttonLabel?: string;
    route?: string;
  };
  bottomCta?: {
    enabled?: boolean;
    title?: string;
    description?: string;
    primaryLabel?: string;
    primaryRoute?: string;
    secondaryLabel?: string;
    secondaryRoute?: string;
  };
  researchHighlights?: {
    enabled?: boolean;
    title?: string;
    description?: string;
    stats?: Array<{ icon?: any; value?: string; label?: string }>;
  };
  givingSection?: {
    title: string;
    subtitle: string;
    buttonText: string;
    secondaryButtonText?: string;
    commitmentEyebrow?: string;
    commitmentTitle?: string;
    commitmentSubtitle?: string;
    commitmentCard1Title?: string;
    commitmentCard1Desc?: string;
    commitmentCard2Title?: string;
    commitmentCard2Desc?: string;
    commitmentCard3Title?: string;
    commitmentCard3Desc?: string;
  };
  ctaSection?: {
    enabled: boolean;
    title: string;
    description: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
  };
  footer?: {
    aboutText: string;
    address: string;
    poBox: string;
    phone: string;
    email: string;
    officeHours: string;
    socialFacebook: string;
    socialTelegram: string;
    socialTwitter: string;
    socialLinkedin: string;
    copyrightText: string;
  };
  communityPage?: CommunityPageConfig;
  communityPageHero?: any;
  regionalChapters?: any;
  eventBanner?: any;
  communityPillars?: any;
  liveCommunitySection?: any;
  liveCommunityPosts?: any;
  campusLifePage?: any;
  facilitiesPage?: any;
  eventsPage?: any;
  galleryPage?: any;
  partnersPage?: PartnersPageConfig;
  detailPages?: Record<string, DetailPageItem>;
  navSections?: NavSection[];
  communityPosts?: CommunityPost[];
}

function deepSanitizeImages<T>(obj: T): T {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    let s = obj as string;
    if (s.indexOf('/src/assets/imgs/') !== -1) s = s.split('/src/assets/imgs/').join('/images/');
    if (s.indexOf('/src/assets/images/') !== -1) s = s.split('/src/assets/images/').join('/images/');
    return s as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSanitizeImages) as any;
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj as any)) {
      res[key] = deepSanitizeImages((obj as any)[key]);
    }
    return res;
  }
  return obj;
}

export const homepageCmsService = {
  getSettings(): HomepageCmsConfig | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed = JSON.parse(stored);
        parsed = deepSanitizeImages(parsed);
        if (!parsed.detailPages) {
          parsed.detailPages = defaultDetailPages;
        }
        if (!parsed.partnersPage) {
          parsed.partnersPage = defaultPartnersPageConfig;
        }
        if (!Array.isArray(parsed.partners) || parsed.partners.length === 0) {
          parsed.partners = defaultPartnersList;
        }
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  async saveSettings(config: HomepageCmsConfig | Partial<HomepageCmsConfig>): Promise<boolean> {
    const existing = this.getSettings() || ({} as HomepageCmsConfig);
    const merged = { ...existing, ...config };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
    window.dispatchEvent(new Event('astu-cms-homepage-updated'));

    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await axios.put(`${API_URL}/content/homepage/config`, config, { headers });
      if (res.status === 200 || res.status === 201) {
        return true;
      }
    } catch (err) {
      console.warn('Direct PUT /content/homepage/config failed, attempting fallback...', err);
      try {
        await axios.post(
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
        );
        return true;
      } catch (postErr) {
        console.warn('Failed fallback sync Homepage CMS config:', postErr);
      }
    }
    return true; // localStorage update succeeded even if network was slow
  },

  async fetchFromApi(): Promise<HomepageCmsConfig | null> {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Try dedicated endpoint first
    try {
      const res = await axios.get(`${API_URL}/content/homepage/config`, { headers, timeout: 5000 });
      if (res.data && res.data.success && res.data.data) {
        const data = res.data.data;
        // Merge defaultDetailPages if missing
        if (!data.detailPages || Object.keys(data.detailPages).length === 0) {
          data.detailPages = defaultDetailPages;
        }
        // Merge defaultSectionLinks if missing
        if (!data.sectionLinks) {
          data.sectionLinks = defaultSectionLinks;
        } else {
          data.sectionLinks = { ...defaultSectionLinks, ...data.sectionLinks };
        }
        if (!data.partnersPage) {
          data.partnersPage = defaultPartnersPageConfig;
        }
        if (!Array.isArray(data.partners) || data.partners.length === 0) {
          data.partners = defaultPartnersList;
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {}
        return data;
      }
    } catch {
      /* fallback to legacy content list */
    }

    // 2. Legacy fallback
    try {
      const res = await axios.get(`${API_URL}/content`, { headers, timeout: 5000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const foundConfigItem = res.data.data.find((i: any) => i.title === 'Homepage CMS Configuration');
        if (foundConfigItem && foundConfigItem.excerpt) {
          try {
            const parsed = typeof foundConfigItem.excerpt === 'string' ? JSON.parse(foundConfigItem.excerpt) : foundConfigItem.excerpt;
            if (!parsed.detailPages) {
              parsed.detailPages = defaultDetailPages;
            }
            if (!parsed.partnersPage) {
              parsed.partnersPage = defaultPartnersPageConfig;
            }
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            } catch {}
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
    const token = getAuthToken();
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

export default homepageCmsService;
