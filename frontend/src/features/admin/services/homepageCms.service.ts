import axios from 'axios';
import { defaultDetailPages, DetailPageItem } from './detailPages.data';

const STORAGE_KEY = 'astu_ams_homepage_cms_config';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  benefitsSubtitle: 'Join 500+ leading industry enterprises, public institutions, and research consortia actively recruiting and collaborating with ASTU.',
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
    'Direct access to 1,238+ verified ASTU alumni and graduating seniors',
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
    { id: 'S-1', value: '1,238+', label: 'Verified Alumni' },
    { id: 'S-2', value: '500+', label: 'Partner Organizations' },
    { id: 'S-3', value: '87%', label: 'Employment Rate' },
    { id: 'S-4', value: '5', label: 'Engineering & Science Schools' },
  ],
  bottomCtaTitle: 'Start Building Your High-Impact Talent Pipeline Today',
  bottomCtaDescription: 'Join ASTU\'s corporate partner network and connect directly with Ethiopia\'s premier engineering, applied science, and technology graduates.',
  bottomCtaButtonText: 'Register Your Organization',
  bottomCtaButtonLink: '/employers/register',
  stakeholdersTitle: 'Strategic Alliances & Industry Consortia',
  stakeholdersSubtitle: 'Active cooperation frameworks with government agencies, multinational tech enterprises, and international research organizations.',
  stakeholderTracks: [
    { id: 'ST-1', title: 'Enterprise & Corporate Alliances', desc: 'Over 500 enterprise partners collaborating with ASTU on talent pipelines, industrial internships, and technology initiatives.', badge: 'Corporate Tier', active: true },
    { id: 'ST-2', title: 'Academic & Research Consortia', desc: 'Partnering with German Academic Exchange Service (DAAD), regional universities, and national research institutes on applied engineering grants.', badge: 'International Consortia', active: true },
    { id: 'ST-3', title: 'Curriculum & ETA Competency Alignment', desc: 'Stakeholder advisory boards meet regularly to evaluate industry skill trends, feeding data from graduate tracer surveys directly into university curriculum reforms.', badge: 'Accreditation Readiness', active: true },
    { id: 'ST-4', title: 'Applied Laboratories & Joint Innovation', desc: '12+ specialized engineering laboratories and research centers equipped to prototype and test regional solutions alongside enterprise sponsors.', badge: 'Innovation Hub', active: true },
  ],
  recruitmentTitle: 'Recruitment Framework & Talent Engine',
  recruitmentSubtitle: 'Accelerate graduate hiring and evaluate verified competency metrics through the AMS platform.',
  recruitmentTracks: [
    { id: 'RT-1', title: 'Direct Opportunity Publishing', desc: 'Publish vacancies, internships, and graduate trainee programs directly to verified graduates across 5 fields of study.', badge: 'Job Board', active: true },
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

export const defaultPartnersList: Partner[] = [
  {
    id: 'PT-1',
    name: 'Ethio Telecom',
    logo: '/images/partners/ethio-telecom.png',
    active: true,
    industry: 'Telecom, Cloud & Fintech',
    location: 'Addis Ababa & Regional Hubs',
    openings: '14+ Graduate Engineering Tracks',
    partnershipType: 'Strategic',
    website: 'https://www.ethiotelecom.et',
    description: 'National telecommunications provider collaborating with ASTU on enterprise cloud engineering, fiber optics, and Telebirr fintech integration.',
    contactEmail: 'careers@ethiotelecom.et',
    featured: true,
  },
  {
    id: 'PT-2',
    name: 'Ethiopian Airlines',
    logo: '/images/partners/ethiopian-airlines.svg',
    active: true,
    industry: 'Aviation & Systems Engineering',
    location: 'Bole, Addis Ababa',
    openings: '8 Aviation Cadet & Internship Tracks',
    partnershipType: 'Strategic',
    website: 'https://www.ethiopianairlines.com',
    description: 'Africa’s leading aviation group partnering on avionics, maintenance engineering, software systems, and aeronautical training.',
    contactEmail: 'recruitment@ethiopianairlines.com',
    featured: true,
  },
  {
    id: 'PT-3',
    name: 'INSA',
    logo: '/images/partners/insa.png',
    active: true,
    industry: 'Cybersecurity & Cryptography',
    location: 'Addis Ababa',
    openings: '6 Advanced Research Placements',
    partnershipType: 'Research',
    website: 'https://www.insa.gov.et',
    description: 'Information Network Security Administration spearheading joint cryptographic research and national cyber defense internships.',
    contactEmail: 'info@insa.gov.et',
    featured: true,
  },
  {
    id: 'PT-4',
    name: 'Huawei',
    logo: '/images/partners/huawei.svg',
    active: true,
    industry: 'ICT Infrastructure & 5G',
    location: 'Addis Ababa & Regional Hubs',
    openings: '11 ICT Academy Certification Paths',
    partnershipType: 'Technology',
    website: 'https://www.huawei.com',
    description: 'Global tech leader hosting the Huawei ICT Academy at ASTU, providing hands-on 5G networking and cloud training.',
    contactEmail: 'ethiopia_recruitment@huawei.com',
    featured: true,
  },
  {
    id: 'PT-5',
    name: 'Safaricom',
    logo: '/images/partners/safaricom.png',
    active: true,
    industry: 'Mobile Telephony & Digital Services',
    location: 'Ethiopia Network Hubs',
    openings: '12 Digital Engineering Roles',
    partnershipType: 'Recruitment',
    website: 'https://safaricom.et',
    description: 'Next-generation telecommunications operator offering fast-track graduate development in mobile network and software architecture.',
    contactEmail: 'talent@safaricom.et',
    featured: true,
  },
  {
    id: 'PT-6',
    name: 'Commercial Bank of Ethiopia',
    logo: '/images/partners/cbe.png',
    active: true,
    industry: 'Fintech & Banking Systems',
    location: 'Ethiopia Nationwide',
    openings: '20+ IT & Security Openings',
    partnershipType: 'Recruitment',
    website: 'https://www.combanketh.et',
    description: 'Ethiopia’s premier financial institution recruiting ASTU computer science and engineering graduates for core banking platforms.',
    contactEmail: 'jobs@cbe.com.et',
    featured: true,
  },
  {
    id: 'PT-7',
    name: 'DAAD (German Academic Exchange)',
    logo: '',
    active: true,
    industry: 'International Academic & Research Consortia',
    location: 'Germany / East Africa',
    openings: 'Joint Research & Exchange Fellowships',
    partnershipType: 'Research',
    website: 'https://www.daad.de',
    description: 'Facilitating collaborative engineering workshops, sustainable water research, and postgraduate scholarship opportunities.',
    contactEmail: 'alumni@daad-ethiopia.org',
    featured: false,
  },
  {
    id: 'PT-8',
    name: 'Meta Finetec PLC',
    logo: '',
    active: true,
    industry: 'Applied Enterprise Software',
    location: 'Addis Ababa',
    openings: '5 Full-Stack Developer Roles',
    partnershipType: 'Internship',
    website: 'https://metafinetec.com',
    description: 'Innovative software house providing senior engineering students with real-world agile development and microservices experience.',
    contactEmail: 'hr@metafinetec.com',
    featured: false,
  },
];

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

export const defaultHomepageCmsConfig: HomepageCmsConfig = {
  welcomeMessage: "Welcome to the ASTU Alumni Management System — Connecting graduates, employers, and departments for longitudinal career tracking and institutional excellence.",
  welcomeEnabled: true,
  heroBadge: "ASTU Alumni Management System",
  heroButtons: {
    primaryText: "Alumni Portal",
    primaryLink: "/info/alumni-portal",
    secondaryText: "Employer Partnership",
    secondaryLink: "/info/employer-portal",
  },
  heroSlides: [
    {
      id: "HS-1",
      image: "/images/astu-building.jpg",
      tagline: "Quality Assurance & Accreditation",
      title: "Connecting ASTU's Excellence to the Global Industry",
      description: "A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University. Join 1,238+ alumni already connected.",
      active: true,
    },
    {
      id: "HS-2",
      image: "/images/campus-2.jpeg",
      tagline: "Enterprise Networking & Placement",
      title: "Empowering ASTU Graduates Through Innovation, Skills, and Modern Workplace Opportunities",
      description: "Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement across 5 fields of study.",
      active: true,
    },
    {
      id: "HS-3",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80",
      tagline: "Academic Innovation & Tracer Feedback",
      title: "Coordinating Strategic Tracer Studies to Identify Workforce Trends and Skill Gaps",
      description: "Enabling department heads and partner companies to identify technological skill gaps directly from the workforce, supporting data-driven curriculum improvements, strengthening industry collaboration, enhancing graduate employability, and contributing to successful university accreditation and continuous quality assurance outcomes.",
      active: true,
    },
  ],
  impactHeaders: {
    eyebrow: "ASTU IMPACT AT A GLANCE",
    title: "Connecting Academia to Industry",
    description: "Building a stronger connection between ASTU graduates, employers, research and career opportunities.",
  },
  impactStats: [
    {
      id: "IS-1",
      label: "Registered Alumni Members",
      value: "1,238",
      suffix: "+",
      detail: "Registered in the alumni network across all batches",
      icon: "Users",
      action: "View Network",
      target: "/register",
      active: true,
    },
    {
      id: "IS-2",
      label: "Fields of Study",
      value: "5",
      suffix: " Major Areas",
      detail: "Applied Engineering, Computing, Applied Sciences & Technology",
      icon: "BookOpen",
      action: "Explore Programs",
      target: "/info/overview",
      active: true,
    },
    {
      id: "IS-3",
      label: "Corporate Partners",
      value: "500",
      suffix: "+",
      detail: "Hiring, internships, and biennial curriculum feedback",
      icon: "Building2",
      action: "Meet Partners",
      target: "/partners",
      active: true,
    },
    {
      id: "IS-4",
      label: "Employment Rate",
      value: "87",
      suffix: "%",
      detail: "Tracked across 6, 12, and 24-month post-graduation longitudinal tracer cycles",
      icon: "LineChart",
      action: "View Outcomes",
      target: "/info/impact-numbers",
      active: true,
    },
    {
      id: "IS-5",
      label: "Digital Requests",
      value: "6K",
      suffix: "+",
      detail: "Transcript, credential verification, and degree certificate requests",
      icon: "FileCheck2",
      action: "Registrar Hub",
      target: "/info/registrar-portal",
      active: true,
    },
  ],
  portalsHeaders: {
    eyebrow: "Get Started",
    title: "How ASTU-AMS Works",
    description: "From registration to real impact — here's how our platform empowers alumni, employers, and the university community in four simple steps.",
    ctaText: "Get Started Today",
    ctaLink: "/login",
  },
  portals: [
    {
      id: "SP-1",
      title: "CREATE YOUR PROFILE",
      icon: "CircleUserRound",
      points: [
        "Build your verified professional identity and showcase your education, skills and experience.",
        "Access verified alumni directory, job listings, and career events.",
      ],
      cta: "Start Profile",
      route: "/register",
      active: true,
      step: 1,
      color: "from-blue-900 to-indigo-900",
      iconBg: "bg-blue-50 text-blue-900 border-blue-200/60",
      description: "Build your verified professional identity and showcase your education, skills and experience.",
    },
    {
      id: "SP-2",
      title: "DISCOVER OPPORTUNITIES",
      icon: "Search",
      points: [
        "Find jobs, internships, mentorship and career opportunities across verified partner firms.",
        "Connect directly with hiring engineering managers and alumni founders.",
      ],
      cta: "Explore Opportunities",
      route: "/info/employer-portal",
      active: true,
      step: 2,
      color: "from-red-700 to-rose-900",
      iconBg: "bg-red-50 text-red-700 border-red-200/60",
      description: "Find jobs, internships, mentorship and career opportunities across premier tech and engineering employers.",
    },
    {
      id: "SP-3",
      title: "CONNECT & NETWORK",
      icon: "Users",
      points: [
        "Join your departmental alumni chapter, attend events, and network with industry leaders worldwide.",
        "Participate in high-impact mentorship tracks and regional symposiums.",
      ],
      cta: "Join Network",
      route: "/login",
      active: true,
      step: 3,
      color: "from-emerald-700 to-teal-900",
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      description: "Join your departmental alumni chapter, attend events, and network with industry leaders worldwide.",
    },
    {
      id: "SP-4",
      title: "GROW & GIVE BACK",
      icon: "Trophy",
      points: [
        "Share employer feedback through tracer studies to help shape ASTU's curricula.",
        "Mentor students, sponsor laboratory projects, and celebrate university milestones.",
      ],
      cta: "Take Tracer Survey",
      route: "/info/alumni-portal",
      active: true,
      step: 4,
      color: "from-amber-700 to-orange-900",
      iconBg: "bg-amber-50 text-amber-700 border-amber-200/60",
      description: "Share employer feedback through tracer studies to help shape ASTU's curricula and support next generations.",
    },
  ],
  campusLifeHeaders: {
    eyebrow: "Explore Life At ASTU",
    title: "Life at ASTU",
    description: "A public gateway to institutional experiences across ASTU: research facilities, alumni reunions, career expos, campus innovations, and heritage galleries.",
  },
  campusLife: [
    {
      id: "CL-1",
      title: "Dynamic Campus Events & Activities",
      campus: "Main Campus",
      description: "Annual alumni homecoming, regional conferences, tech talks, and departmental project expos that bridge academia and industry.",
      image: "/images/campus-2.jpeg",
      action: "View Events",
      link: "/events",
      active: true,
    },
    {
      id: "CL-2",
      title: "World-Class Laboratories & Facilities",
      campus: "Innovation Spaces",
      description: "12+ specialized engineering laboratories and research centers equipped for prototyping, hardware testing, and student research.",
      image: "/images/electriclabs.jpeg",
      action: "Explore Facilities",
      link: "/info/facilities",
      active: true,
    },
    {
      id: "CL-3",
      title: "Institutional Research & Heritage Gallery",
      campus: "Campus Gallery",
      description: "Explore 30+ years of university history, campus photography, alumni achievement awards, and scientific breakthrough archives.",
      image: "/images/arc.jpg",
      action: "View Gallery",
      link: "/gallery",
      active: true,
    },
  ],
  campuses: [
    {
      id: "CM-1",
      name: "Main Campus",
      description: "Central hub for alumni services, registrar workflows, and institutional engagement.",
      image: "/images/astu-building.jpg",
      active: true,
    },
    {
      id: "CM-2",
      name: "Engineering Labs",
      description: "Applied research, workshops, innovation programs, and industry-linked training.",
      image: "/images/electriclabs.jpeg",
      active: true,
    },
    {
      id: "CM-3",
      name: "Graduation & Events Hall",
      description: "Ceremonies, career fairs, alumni awards, and university achievement programs.",
      image: "/images/gc7.jpg",
      active: true,
    },
    {
      id: "CM-4",
      name: "Research Collaboration Center",
      description: "Research publications, industry projects, and department KPI evidence.",
      image: "/images/arc.jpg",
      active: true,
    },
  ],
  industryBridge: {
    enabled: true,
    eyebrow: "Industry-Campus Bridge",
    title: "Nurturing Innovation in Modern Laboratories",
    description: "ASTU combines rigorous engineering education with practical lab training. Through ASTU-AMS, graduate outcomes and employer feedback feed directly into curriculum updates.",
    stat1Value: "12+",
    stat1Label: "Research Centers",
    stat2Value: "80+",
    stat2Label: "Industry Partners",
    buttonText: "Explore Campus Life",
    buttonLink: "/info/campus-life",
    image: "/images/arc.jpg",
  },
  galleryHeaders: {
    eyebrow: "CAMPUS GALLERY",
    title: "Campus Life & Moments",
    subtitle: "A glimpse of life at ASTU — research, innovation, graduation ceremonies, and alumni milestones.",
    buttonText: "View All Gallery",
    buttonLink: "/gallery",
  },
  gallery: [
    { id: "GI-1", title: "ASTU Main Campus Architecture", src: "/images/astu-building.jpg", active: true },
    { id: "GI-2", title: "Innovation and Collaboration Hub", src: "/images/campus-2.jpeg", active: true },
    { id: "GI-3", title: "ASTU Alumni Identity & Legacy", src: "/images/astu-logo.jpeg", active: true },
    { id: "GI-4", title: "Applied Robotics and Research Labs", src: "/images/electriclabs.jpeg", active: true },
    { id: "GI-5", title: "Commencement Day Celebration", src: "/images/gc7.jpg", active: true },
    { id: "GI-6", title: "Applied Research Center Facility", src: "/images/arc.jpg", active: true },
  ],
  videos: [
    { id: "VI-1", title: "Career Expo Highlights", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80", link: "https://www.youtube.com", active: true },
    { id: "VI-2", title: "Research & Innovation Forum", image: "/images/arc.jpg", link: "https://www.youtube.com", active: true },
    { id: "VI-3", title: "Graduation Ceremony Replay", image: "/images/gc7.jpg", link: "https://www.youtube.com", active: true },
  ],
  eventsHeaders: {
    eyebrow: "Events & Workshops",
    title: "Upcoming Alumni Events",
    description: "Networking, learning, and professional growth opportunities.",
    viewAllText: "See All Events →",
    viewAllLink: "/events",
  },
  events: [
    {
      id: "EV-1",
      title: "ASTU Alumni Carnival & Homecoming 2027",
      date: "April 24–25, 2027",
      location: "ASTU Main Campus • Adama",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      category: "Flagship Event",
      description: "Celebrating over three decades of ASTU engineering and scientific heritage! A landmark homecoming bringing together graduates and industry.",
      organizer: "ASTU Alumni Office",
      active: true,
      pinned: true,
    },
    {
      id: "EV-2",
      title: "DAAD International Alumni Symposium",
      date: "March 18, 2027",
      location: "ASTU Research Center",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      category: "International Workshop",
      description: "Five-day international workshop on sustainable engineering, environmental governance, and regional technology alliances.",
      organizer: "ASTU Alumni Office",
      active: true,
      pinned: true,
    },
    {
      id: "EV-3",
      title: "ASTU Annual Career Expo & Job Fair",
      date: "May 20, 2027",
      location: "Graduation Hall",
      image: "/images/gc7.jpg",
      category: "Career Fair",
      description: "Over 50 tech and engineering employers recruiting final-year students and alumni for full-time engineering and internship roles.",
      organizer: "ASTU Alumni Office",
      active: true,
      pinned: false,
    },
  ],
  workshops: [
    {
      id: "WS-1",
      title: "AI for Applied Engineering Research",
      date: "June 14, 2027",
      seats: "120 seats",
      focus: "Research & Innovation",
      location: "Computer Science Lab 3",
      image: "/images/electriclabs.jpeg",
      description: "Hands-on masterclass in machine learning model development and GPU computing for graduate researchers.",
      organizer: "ASTU Alumni Office",
      active: true,
    },
    {
      id: "WS-2",
      title: "Technical CV Builder and Interview Lab",
      date: "June 20, 2027",
      seats: "80 seats",
      focus: "Career Readiness",
      location: "Virtual & Innovation Center",
      image: "/images/campus-2.jpeg",
      description: "Engineering portfolio reviews, live whiteboarding sessions, and behavioral interview prep with executive alumni.",
      organizer: "ASTU Alumni Office",
      active: true,
    },
    {
      id: "WS-3",
      title: "Startup Incubation & Tech Commercialization",
      date: "July 4, 2027",
      seats: "60 seats",
      focus: "Entrepreneurship",
      location: "ARC Amphitheater",
      image: "/images/arc.jpg",
      description: "Translating engineering thesis projects into funded commercial spin-offs in East African tech ecosystems.",
      organizer: "ASTU Alumni Office",
      active: true,
    },
  ],
  announcementsHeaders: {
    eyebrow: "Announcements",
    title: "Official Notices",
    subscribeTitle: "Subscribe to official updates",
    subscribeDesc: "Receive announcements, events, partner calls, tracer survey reminders, and campus notices directly in your inbox.",
  },
  announcements: [
    {
      id: "AN-1",
      title: "ASTU Hosts a Five-Day DAAD Alumni Workshop on Sustainable Water Supply & Environmental Protection",
      date: "Mar 7, 2025",
      type: "Alumni Announcement",
      link: "/announcements",
      active: true,
    },
    {
      id: "AN-2",
      title: "ASTU Alumni Association Inspires Graduating Class with Career Tips!",
      date: "Mar 7, 2025",
      type: "Employer Announcement",
      link: "/announcements",
      active: true,
    },
    {
      id: "AN-3",
      title: "ASTU Alumni Spotlight: Yohannes Melese, Gold Medalist & Dual-Major Graduate!",
      date: "Mar 7, 2025",
      type: "Alumni Achievement",
      link: "/announcements",
      active: true,
    },
    {
      id: "AN-4",
      title: "ASTU Alumni Serving as Model United Nations Secretariats & Global Delegates",
      date: "Jan 7, 2025",
      type: "Alumni Achievement",
      link: "/announcements",
      active: true,
    },
    {
      id: "AN-5",
      title: "Tracer Study 2026-2027 Response Window is Open",
      date: "May 31, 2026",
      type: "Alumni Announcement",
      link: "/announcements",
      active: true,
    },
  ],
  newsHeaders: {
    eyebrow: "News & Bulletins",
    title: "Latest Campus News",
  },
  newsItems: [
    {
      id: "NW-1",
      title: "ASTU Engineering Innovation Summit Highlights",
      date: "28 May 2026",
      excerpt: "Showcasing cutting-edge technology and student research projects across engineering departments.",
      image: "/images/arc.jpg",
      active: true,
    },
    {
      id: "NW-2",
      title: "Sustainable Energy Research Lab Inauguration",
      date: "25 May 2026",
      excerpt: "State-of-the-art facility expands applied research opportunities for alumni researchers and graduate teams.",
      image: "/images/electriclabs.jpeg",
      active: true,
    },
    {
      id: "NW-3",
      title: "ASTU Alumni Association Launches Global Mentorship Track",
      date: "20 May 2026",
      excerpt: "Connecting senior engineering alumni with graduating seniors across East Africa and international tech hubs.",
      image: "/images/campus-2.jpeg",
      active: true,
    },
  ],
  storiesHeaders: {
    eyebrow: "Alumni Spotlight",
    title: "Stories of Impact & Leadership",
    description: "Meet the remarkable graduates shaping industries, building enterprises, and carrying ASTU's legacy forward worldwide.",
  },
  stories: [
    {
      id: "SS-1",
      name: "Dr. Ruth Alemu",
      role: "AI Research Scientist",
      company: "ASTU AI Research Center & Regional Labs",
      text: "After graduating from ASTU's Computer Science program, Ruth joined a leading AI research lab and has published 18 applied machine learning papers. She actively mentors current ASTU scholars through the AMS portal.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      graduationYear: "Class of 2018",
      department: "Computer Science & Engineering",
      milestone: "AI Research Pioneer",
      active: true,
    },
    {
      id: "SS-2",
      name: "Yonas Bekele",
      role: "Founder & CEO",
      company: "GreenGrid Labs Ethiopia",
      text: "Inspired by ASTU's renewable energy laboratories, Yonas launched GreenGrid Labs — now delivering clean, decentralized energy infrastructure to over 12 industrial parks in East Africa.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      graduationYear: "Class of 2016",
      department: "Electrical & Power Engineering",
      milestone: "CleanTech Pioneer",
      active: true,
    },
    {
      id: "SS-3",
      name: "Kalkidan Tadesse",
      role: "Cloud Platform Lead",
      company: "Ethio Telecom Enterprise Cloud",
      text: "Kalkidan credits ASTU's hands-on laboratory curriculum for her rapid career trajectory. She now spearheads enterprise cloud migration projects across regional public and private entities.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      graduationYear: "Class of 2019",
      department: "Software Engineering",
      milestone: "Cloud Architecture Leader",
      active: true,
    },
    {
      id: "SS-4",
      name: "Yohannes Melese",
      role: "International Technology Delegate & Systems Researcher",
      company: "ASTU Advanced Innovation Directorate",
      text: "Gold medalist and dual major graduate with a 3.98 CGPA and 47 A+ grades, pioneering regional embedded systems and AI hardware research.",
      image: "/images/electriclabs.jpeg",
      graduationYear: "Class of 2024",
      department: "Dual Major: Electronics & Computing",
      milestone: "Dual-Major Gold Medalist",
      active: true,
    },
  ],
  partnersHeaders: {
    eyebrow: "Our Partners",
    title: "Partner Companies & Employers",
    description: "Institutional and enterprise partners collaborating on graduate recruitment, technology internships, and applied research.",
  },
  partners: defaultPartnersList,
  featuredEmployers: [
    { id: "FE-1", name: "Ethio Telecom", area: "Telecom, Cloud & Fintech", openings: "14 graduate roles", active: true },
    { id: "FE-2", name: "Ethiopian Airlines", area: "Aviation & Systems Engineering", openings: "8 internship tracks", active: true },
    { id: "FE-3", name: "INSA", area: "Cybersecurity & Cryptography", openings: "6 research placements", active: true },
    { id: "FE-4", name: "Huawei Ethiopia", area: "ICT Infrastructure & 5G", openings: "11 certification paths", active: true },
  ],
  testimonials: [],
  faqHeaders: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    description: "Common questions about ASTU-AMS, tracer studies, alumni verification, and career services.",
  },
  faq: [
    {
      id: "FQ-1",
      question: "Who can use ASTU-AMS?",
      answer: "Verified alumni, employers, registrar teams, academic departments, and institutional administrators each have access to role-specific portals.",
      category: "General",
      active: true,
    },
    {
      id: "FQ-2",
      question: "How do tracer studies support accreditation?",
      answer: "Tracer survey responses provide empirical data on employment outcomes, time-to-hire, and required workplace skills, directly satisfying ETA and international accreditation criteria.",
      category: "Tracer",
      active: true,
    },
    {
      id: "FQ-3",
      question: "How can employer partners register and recruit ASTU graduates?",
      answer: "Organizations can register via the Employer Portal with their commercial TIN verification to publish job vacancies, filter verified candidates, and schedule campus interview days.",
      category: "Employers",
      active: true,
    },
    {
      id: "FQ-4",
      question: "How do alumni request verified transcripts and degree certificates?",
      answer: "Log into your alumni profile, navigate to Document Services, and submit a digital request directly routed to the ASTU Registrar office for digital or physical issuance.",
      category: "Registrar",
      active: true,
    },
    {
      id: "FQ-5",
      question: "How can alumni mentor current students?",
      answer: "Alumni can opt-in to the Mentorship Track in their profile settings, specify their areas of technical expertise, and receive student mentee bookings.",
      category: "Mentorship",
      active: true,
    },
  ],
  accreditation: {
    eyebrow: "Quality Assurance",
    title: "Data-Driven Accreditation & Excellence",
    description: "ASTU-AMS provides verified tracer data, employment analytics, and employer feedback required by accreditation agencies and university management.",
    point1Title: "Global Accreditation",
    point1Desc: "Build transparent, audited institutional reports.",
    point2Title: "Market Alignment",
    point2Desc: "Align curriculum with industry expectations.",
    buttonText: "View Impact Numbers",
    buttonLink: "/info/impact-numbers",
    image1: "/images/arc.jpg",
    image2: "/images/electriclabs.jpeg",
  },
  ctaSection: {
    enabled: true,
    title: "Ready to Join ASTU-AMS?",
    description: "Connect with fellow alumni, discover career opportunities, and contribute to university excellence.",
    primaryCtaText: "Alumni Portal",
    primaryCtaLink: "/login",
    secondaryCtaText: "Employer Portal",
    secondaryCtaLink: "/login",
  },
  footer: {
    aboutText: "Connecting graduates, corporate employers, and department heads in one unified ecosystem. Improving national quality audits and modernizing student career placements.",
    address: "Adama Science and Technology University, Adama, Oromia, Ethiopia",
    poBox: "P.O. Box 1888, Adama, Ethiopia",
    phone: "+251-221-110000",
    email: "irccd@astu.edu.et",
    officeHours: "Monday to Friday, 8:00 AM – 5:00 PM (EAT)",
    socialFacebook: "https://facebook.com/adamaastu",
    socialTelegram: "https://t.me/Adama_STU_Almuni",
    socialTwitter: "#",
    socialLinkedin: "#",
    copyrightText: "Adama Science and Technology University. All rights reserved.",
  },
  sectionLinks: defaultSectionLinks,
  detailPages: defaultDetailPages,
  partnersPage: defaultPartnersPageConfig,
};

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
  getSettings(): HomepageCmsConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed = JSON.parse(stored);
        parsed = deepSanitizeImages(parsed);
        const merged: HomepageCmsConfig = {
          ...defaultHomepageCmsConfig,
          ...parsed,
          sectionLinks: { ...defaultHomepageCmsConfig.sectionLinks, ...(parsed.sectionLinks || {}) },
          detailPages: parsed.detailPages && Object.keys(parsed.detailPages).length > 0 ? parsed.detailPages : defaultDetailPages,
          partnersPage: parsed.partnersPage || defaultPartnersPageConfig,
          partners: Array.isArray(parsed.partners) && parsed.partners.length > 0 ? parsed.partners : defaultPartnersList,
        };
        return merged;
      }
    } catch {
      /* ignore */
    }
    return defaultHomepageCmsConfig;
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

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
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
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
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

export default homepageCmsService;
