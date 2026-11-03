export interface DetailPageSection {
  id?: string;
  heading: string;
  body: string;
  active?: boolean;
  image?: string;
  badge?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface DetailPageStat {
  id?: string;
  label: string;
  value: string;
  desc?: string;
}

export interface DetailPageFaq {
  id?: string;
  question: string;
  answer: string;
}

export interface DetailPageItem {
  slug: string;
  title: string;
  subtitle: string;
  iconName?: string;
  image: string;
  badge?: string;
  sections: DetailPageSection[];
  stats?: DetailPageStat[];
  faqs?: DetailPageFaq[];
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

/** Empty shells only — CMS posts real detail-page content. */
export const defaultDetailPages: Record<string, DetailPageItem> = {
  overview: {
    slug: 'overview',
    title: 'ASTU-AMS Overview',
    subtitle: '',
    iconName: 'Trophy',
    image: '',
    sections: [],
  },
  'impact-numbers': {
    slug: 'impact-numbers',
    title: 'Impact Numbers',
    subtitle: '',
    iconName: 'LineChart',
    image: '',
    sections: [],
  },
  accreditation: {
    slug: 'accreditation',
    title: 'Accreditation & Quality Assurance',
    subtitle: '',
    iconName: 'ShieldCheck',
    image: '',
    sections: [],
  },
  achievements: {
    slug: 'achievements',
    title: 'University Achievements',
    subtitle: '',
    iconName: 'Award',
    image: '',
    sections: [],
  },
  'campus-life': {
    slug: 'campus-life',
    title: 'Campus Life at ASTU',
    subtitle: '',
    iconName: 'Star',
    image: '/images/campus-2.jpeg',
    badge: 'ASTU Student Life & Campus Culture',
    primaryCtaText: 'Explore Media Gallery',
    primaryCtaLink: '/gallery',
    secondaryCtaText: 'Campus Events & Activities',
    secondaryCtaLink: '/events',
    sections: [],
  },
  facilities: {
    slug: 'facilities',
    title: 'University Facilities & Infrastructure',
    subtitle: '',
    iconName: 'Building2',
    image: '',
    sections: [],
  },
  events: {
    slug: 'events',
    title: 'Events & Activities',
    subtitle: '',
    iconName: 'CalendarDays',
    image: '',
    sections: [],
  },
  gallery: {
    slug: 'gallery',
    title: 'ASTU Museums & Photo Gallery',
    subtitle: "A visual journey through ASTU's campus life, research achievements, events, and vibrant student community.",
    iconName: 'GalleryHorizontal',
    image: '',
    sections: [],
  },
  'video-gallery': {
    slug: 'video-gallery',
    title: 'Video Gallery',
    subtitle: '',
    iconName: 'PlayCircle',
    image: '',
    sections: [],
  },
  mentorship: {
    slug: 'mentorship',
    title: 'Mentorship Program',
    subtitle: '',
    iconName: 'GraduationCap',
    image: '',
    sections: [],
  },
  'career-fair': {
    slug: 'career-fair',
    title: 'Career Fair & Placement',
    subtitle: '',
    iconName: 'Briefcase',
    image: '',
    sections: [],
  },
  'alumni-portal': {
    slug: 'alumni-portal',
    title: 'Alumni Portal',
    subtitle: '',
    iconName: 'GraduationCap',
    image: '',
    sections: [],
  },
  'employer-portal': {
    slug: 'employer-portal',
    title: 'Employer Portal',
    subtitle: '',
    iconName: 'Briefcase',
    image: '',
    badge: 'Enterprise Talent Sourcing',
    primaryCtaText: 'Register as Employer',
    primaryCtaLink: '/employers/register',
    secondaryCtaText: 'Employer Login',
    secondaryCtaLink: '/login',
    stats: [],
    sections: [],
    faqs: [],
  },
  'registrar-portal': {
    slug: 'registrar-portal',
    title: 'Registrar Portal',
    subtitle: '',
    iconName: 'FileText',
    image: '',
    sections: [],
  },
  'department-portal': {
    slug: 'department-portal',
    title: 'Department Portal',
    subtitle: '',
    iconName: 'BarChart3',
    image: '',
    sections: [],
  },
  'featured-employers': {
    slug: 'featured-employers',
    title: 'Featured Employers',
    subtitle: '',
    iconName: 'Building2',
    image: '',
    badge: 'Verified Corporate Alliances',
    primaryCtaText: 'Register as Corporate Employer',
    primaryCtaLink: '/employers/register',
    secondaryCtaText: 'Explore Partner Hub',
    secondaryCtaLink: '/partners',
    stats: [],
    sections: [],
    faqs: [],
  },
  announcements: {
    slug: 'announcements',
    title: 'Official Announcements',
    subtitle: '',
    iconName: 'Bell',
    image: '',
    sections: [],
  },
  faq: {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: '',
    iconName: 'HelpCircle',
    image: '',
    badge: 'Integrated with Homepage CMS FAQ',
    faqs: [],
    sections: [],
  },
  contact: {
    slug: 'contact',
    title: 'Contact Us',
    subtitle: '',
    iconName: 'Building2',
    image: '',
    sections: [],
  },
  'community-feed': {
    slug: 'community-feed',
    title: 'Community Feed',
    subtitle: '',
    iconName: 'Users',
    image: '',
    sections: [],
  },
  research: {
    slug: 'research',
    title: 'Research Publications',
    subtitle: '',
    iconName: 'BookOpen',
    image: '',
    sections: [],
  },
  innovation: {
    slug: 'innovation',
    title: 'Innovation Hub & Startups',
    subtitle: '',
    iconName: 'Lightbulb',
    image: '',
    sections: [],
  },
  'alumni-stories': {
    slug: 'alumni-stories',
    title: 'Alumni Success Stories',
    subtitle: '',
    iconName: 'Trophy',
    image: '',
    sections: [],
  },
  community: {
    slug: 'community',
    title: 'ASTU Alumni Community',
    subtitle: '',
    iconName: 'Users',
    image: '',
    sections: [],
  },
  news: {
    slug: 'news',
    title: 'ASTU Alumni News & Updates',
    subtitle: '',
    iconName: 'FileText',
    image: '',
    sections: [],
  },
  stakeholders: {
    slug: 'stakeholders',
    title: 'Stakeholders & Industry Collaborators',
    subtitle: '',
    iconName: 'Building2',
    image: '',
    badge: 'Industry & Government Alliances',
    primaryCtaText: 'Initiate Corporate Partnership',
    primaryCtaLink: '/employers/register',
    secondaryCtaText: 'Contact Relations Directorate',
    secondaryCtaLink: '/info/contact',
    stats: [],
    sections: [],
    faqs: [],
  },
  campuses: {
    slug: 'campuses',
    title: 'ASTU Campuses & Facilities',
    subtitle: '',
    iconName: 'Building2',
    image: '',
    sections: [],
  },
  'career-opportunities': {
    slug: 'career-opportunities',
    title: 'Career Opportunities & Talent Placement',
    subtitle: '',
    iconName: 'Briefcase',
    image: '',
    sections: [],
  },
};

