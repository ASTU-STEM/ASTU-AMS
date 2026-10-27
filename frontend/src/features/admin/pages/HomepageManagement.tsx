import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  HelpCircle,
  Image as ImageIcon,
  ImagePlus,
  Megaphone,
  Newspaper,
  PlayCircle,
  Plus,
  Quote,
  Save,
  ShieldCheck,
  Star,
  Heart,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
  Zap,
  MessageSquareText,
  Mail,
  Bell,
  UserRoundCheck,
  LineChart,
  LockKeyhole,
  FileCheck2,
  MapPin,
  Phone,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Layers3,
  SlidersHorizontal,
  FolderOpen,
  Download,
  AlertCircle,
  Check,
  ArrowUp,
  ArrowDown,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  Columns,
  Layout,
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import ImageUploader from '../components/ImageUploader';
import HomepageLivePreviewCanvas from '../components/HomepageLivePreviewCanvas';
import homepageCmsService, {
  HomepageCmsConfig,
  HeroSlide,
  ImpactStat,
  StakeholderPortal,
  CampusLifeCard,
  Campus,
  GalleryImage,
  VideoItem,
  EventItem,
  WorkshopItem,
  NewsItem,
  Announcement,
  SuccessStory,
  Partner,
  FeaturedEmployerItem,
  Testimonial,
  FaqItem,
  defaultSectionLinks,
  PartnersPageConfig,
  PartnerBenefit,
  defaultPartnersPageConfig,
} from '../services/homepageCms.service';
import { defaultDetailPages, DetailPageItem, DetailPageSection } from '../services/detailPages.data';
import { usePublicMetrics } from '../../../services/publicMetrics.service';
import { mediaUrl } from '../../../config';

/* ─── Category Types ─── */
type CmsCategory =
  | 'hero'
  | 'impact'
  | 'portals'
  | 'campus-life'
  | 'gallery'
  | 'events-news'
  | 'community'
  | 'partners-portal'
  | 'accreditation-faq'
  | 'giving-campaigns'
  | 'detail-pages'
  | 'footer-cta';

const CATEGORIES: { id: CmsCategory; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: 'hero', label: '1. Hero & Alert Banner', icon: ImagePlus, desc: 'Top alert ticker, rotating carousel slides & quick action buttons' },
  { id: 'impact', label: '2. Impact at a Glance', icon: BarChart3, desc: 'Eyebrow, title, 4 key statistics & measurable outcome figures' },
  { id: 'portals', label: '3. How It Works (Journey)', icon: Users, desc: 'Ecosystem transition flow, 4 connected steps & Get Started CTA' },
  { id: 'campus-life', label: '4. Campus Life & Labs', icon: Star, desc: 'Campus highlights, innovation laboratories & campus cards' },
  { id: 'gallery', label: '5. Campus Moments (Gallery)', icon: ImageIcon, desc: 'Campus moments photo grid, album tags & gallery spotlight' },
  { id: 'events-news', label: '6. Events & Notices', icon: CalendarDays, desc: 'Alumni events, workshops, announcements & official bulletins' },
  { id: 'partners-portal', label: '7. Partner Companies', icon: Briefcase, desc: 'Corporate partners, recruitment tracks & enterprise logos' },
  { id: 'giving-campaigns', label: '8. Giving & Research Funds', icon: Heart, desc: 'Homepage giving header, research funds directory & donation portal' },
  { id: 'accreditation-faq', label: '9. Accreditation & FAQ', icon: ShieldCheck, desc: 'Quality assurance banner, tracer studies & frequently asked questions' },
  { id: 'footer-cta', label: '10. CTA Banner & Footer', icon: MapPin, desc: 'Bottom CTA banner, official addresses, support contacts & directory' },
  { id: 'detail-pages', label: 'Linked Sub-Pages', icon: FileText, desc: 'Manage 22+ institutional sub-pages linked from homepage (Overview, Contact, etc.)' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Building2, LineChart, FileCheck2, MessageSquareText, Briefcase, LockKeyhole, Globe, BookOpen, Star, Handshake, ShieldCheck, Trophy, GraduationCap, Zap, Phone, Mail, MapPin, CalendarDays, Award: Trophy,
};

/* ─── Initial Fallback Data ─── */
const initialHeroSlides: HeroSlide[] = [
  { id: 'HS-1', image: '/images/astu-building.jpg', tagline: 'Quality Assurance & Accreditation', title: "Connecting ASTU's Excellence to the Global Industry", description: 'A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University. Join 1,238+ alumni already connected.', active: true },
  { id: 'HS-2', image: '/images/campus-2.jpeg', tagline: 'Enterprise Networking & Placement', title: 'Empowering ASTU Graduates in Modern Workspaces', description: 'Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement across 5 fields of study.', active: true },
  { id: 'HS-3', image: 'https://images.unsplash.com/photo-1562774053-701939374585', tagline: 'Academic Innovation & Tracer Feedback', title: 'Coordinating Strategic Tracer Studies & Skill Gaps', description: 'Enabling department heads and partner companies to identify technological skill gaps directly from the workforce, securing university accreditation outcomes.', active: true },
];

const initialImpactStats: ImpactStat[] = [
  { id: 'IS-1', label: 'Registered Alumni Members', value: '1,238', suffix: '+', detail: 'Registered in the alumni network', icon: 'Users', action: 'View Network', target: '/register', active: true },
  { id: 'IS-2', label: 'Partner Organizations', value: '500', suffix: '+', detail: 'Hiring, internships, and feedback', icon: 'Building2', action: 'Meet Partners', target: '/info/featured-employers', active: true },
  { id: 'IS-3', label: 'Employment Rate', value: '87', suffix: '%', detail: 'Graduate employment rate tracked', icon: 'LineChart', action: 'View Outcomes', target: '/info/impact-numbers', active: true },
  { id: 'IS-4', label: 'Digital Requests', value: '6K', suffix: '+', detail: 'Transcript and certificate requests', icon: 'FileCheck2', action: 'Registrar Hub', target: '/info/registrar-portal', active: true },
  { id: 'IS-5', label: 'Fields of Study', value: '5', suffix: '', detail: 'Engineering, Applied Tech & Science', icon: 'BookOpen', action: 'Explore Programs', target: '/info/overview', active: true },
];

const initialPortals: StakeholderPortal[] = [
  { id: 'SP-1', title: 'Alumni', icon: 'Users', points: ['Create and maintain your professional profile.', 'Access verified job listings and internship opportunities.', 'Complete tracer surveys to guide curriculum development.', 'Mentor current students and connect with peers.'], cta: 'Access Alumni Portal', route: '/info/alumni-portal', active: true, step: 1, color: 'from-astu-navy to-[#1a4f8a]', iconBg: 'bg-astu-navy/10 text-astu-navy' },
  { id: 'SP-2', title: 'Employers', icon: 'Briefcase', points: ['Post employment opportunities for ASTU graduates.', 'Search alumni by expertise, skills, and department.', 'Provide feedback to enhance curriculum relevance.'], cta: 'Partner With ASTU', route: '/info/employer-portal', active: true, step: 2, color: 'from-astu-red to-[#c0392b]', iconBg: 'bg-astu-red/10 text-astu-red' },
  { id: 'SP-3', title: 'Departments', icon: 'LineChart', points: ['Monitor graduate employment outcomes and metrics.', 'Identify skill gaps through employer analytics.', 'Generate accreditation-ready reports.'], cta: 'View Department Analytics', route: '/info/department-portal', active: true, step: 3, color: 'from-astu-green to-[#1e8449]', iconBg: 'bg-astu-green/10 text-astu-green' },
  { id: 'SP-4', title: 'Registrar', icon: 'FileCheck2', points: ['Validate alumni credentials against SIS records.', 'Process transcript and certificate requests.', 'Send tracer study reminders and audit notifications.'], cta: 'Open Registrar Portal', route: '/info/registrar-portal', active: true, step: 4, color: 'from-violet-600 to-violet-800', iconBg: 'bg-violet-100 text-violet-700' },
];

const initialCampusLife: CampusLifeCard[] = [
  { id: 'CL-1', title: 'Events and Activities', campus: 'Main Campus', description: 'Career expos, alumni reunions, workshops, chapter meetings, and community programs.', image: '/images/campus-2.jpeg', action: 'View Events', link: '/events', active: true },
  { id: 'CL-2', title: 'Facilities & Labs', campus: 'Innovation Spaces', description: 'Laboratories, research centers, libraries, student services, and employer interview rooms.', image: '/images/electriclabs.jpeg', action: 'Explore Facilities', link: '/info/facilities', active: true },
  { id: 'CL-3', title: 'ASTU Museums & Gallery', campus: 'Campus Gallery', description: 'Research showcases, graduation moments, campus photography, and public video archives.', image: '/images/arc.jpg', action: 'View Gallery', link: '/info/gallery', active: true },
];

const initialCampuses: Campus[] = [
  { id: 'CM-1', name: 'Main Campus', description: 'Central hub for alumni services, registrar workflows, and institutional engagement.', image: '/images/astu-building.jpg', active: true },
  { id: 'CM-2', name: 'Engineering Labs', description: 'Applied research, workshops, innovation programs, and industry-linked training.', image: '/images/electriclabs.jpeg', active: true },
  { id: 'CM-3', name: 'Graduation & Events Hall', description: 'Ceremonies, career fairs, alumni awards, and university achievement programs.', image: '/images/gc7.jpg', active: true },
  { id: 'CM-4', name: 'Research Collaboration Center', description: 'Research publications, industry projects, and department KPI evidence.', image: '/images/arc.jpg', active: true },
];

const initialGallery: GalleryImage[] = [
  { id: 'GI-1', title: 'ASTU Main Campus Architecture', src: '/images/astu-building.jpg', active: true },
  { id: 'GI-2', title: 'Innovation and Collaboration Hub', src: '/images/campus-2.jpeg', active: true },
  { id: 'GI-3', title: 'ASTU Alumni Identity & Legacy', src: '/images/astu-seal-logo.png', active: true },
];

const initialVideos: VideoItem[] = [
  { id: 'VI-1', title: 'Career Expo Highlights', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80', active: true },
  { id: 'VI-2', title: 'Research & Innovation Forum', image: '/images/arc.jpg', active: true },
  { id: 'VI-3', title: 'Graduation Ceremony Replay', image: '/images/gc7.jpg', active: true },
];

const initialEvents: EventItem[] = [
  { id: 'EV-1', title: 'ASTU Alumni Carnival 2026', date: 'April 25-26, 2026', location: 'Main Campus', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', active: true },
  { id: 'EV-2', title: 'DAAD Alumni Workshop', date: 'March 2026', location: 'ASTU Research Center', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', active: true },
];

const initialWorkshops: WorkshopItem[] = [
  { id: 'WS-1', title: 'AI for Engineering Research', date: 'June 14, 2026', seats: '120 seats', focus: 'Research & Innovation', active: true },
  { id: 'WS-2', title: 'CV Builder and Interview Lab', date: 'June 20, 2026', seats: '80 seats', focus: 'Career Readiness', active: true },
  { id: 'WS-3', title: 'Startup Finance for Alumni', date: 'July 4, 2026', seats: '60 seats', focus: 'Entrepreneurship', active: true },
];

const initialNews: NewsItem[] = [
  { id: 'NW-1', title: 'New Engineering Lab Inaugurated', date: 'May 28, 2026', excerpt: 'Cutting-edge robotics and IoT facilities opened for graduate research.', active: true },
  { id: 'NW-2', title: 'ASTU Research Grant Winners', date: 'May 25, 2026', excerpt: 'Three applied research initiatives secure funding from regional partners.', active: true },
  { id: 'NW-3', title: 'Annual Career Expo Announced', date: 'May 20, 2026', excerpt: 'Over 50 tech and engineering employers confirmed for on-campus hiring.', active: true },
];

const initialAnnouncements: Announcement[] = [
  { id: 'AN-1', title: 'ASTU Alumni Association Inspires Graduating Class with Career Tips!', date: 'March 7, 2025', type: 'Alumni Announcement', active: true },
  { id: 'AN-2', title: 'ASTU hosts a five-day DAAD Alumni workshop', date: 'March 7, 2025', type: 'Employer Announcement', active: true },
  { id: 'AN-3', title: 'ASTU alumni serve as model United Nations secretariats!', date: 'January 7, 2025', type: 'Alumni Achievement', active: true },
  { id: 'AN-4', title: 'Tracer Study 2026 response window is open', date: 'May 31, 2026', type: 'Alumni Announcement', active: true },
  { id: 'AN-5', title: 'Call for employer partners: campus recruitment week', date: 'May 28, 2026', type: 'Employer Announcement', active: true },
];

const initialStories: SuccessStory[] = [
  { id: 'SS-1', name: 'Abebe Yosef', role: 'Software Engineer', text: 'I landed my new role after using ASTU-AMS job matching and mentorship support. Thank you ASTU community.', image: '/images/State-M.jpg', active: true },
  { id: 'SS-2', name: 'Bekele Kebede', role: 'Employer Partner', text: 'Hiring from ASTU-AMS has been efficient. We found strong engineering candidates with the right practical skills.', image: '/images/gc7.jpg', active: true },
  { id: 'SS-3', name: 'Helina Sileshi', role: 'Mentor & Alumni', text: 'Proud to mentor ASTU students through the AMS platform. The next generation of innovators is ready!', image: '/images/arc.jpg', active: true },
];

const initialPartners: Partner[] = [
  { id: 'PT-1', name: 'Ethio Telecom', active: true },
  { id: 'PT-2', name: 'INSA', active: true },
  { id: 'PT-3', name: 'Ethiopian Airlines', active: true },
  { id: 'PT-4', name: 'Safaricom', active: true },
  { id: 'PT-5', name: 'Huawei', active: true },
  { id: 'PT-6', name: 'Commercial Bank of Ethiopia', active: true },
];

const initialFeaturedEmployers: FeaturedEmployerItem[] = [
  { id: 'FE-1', name: 'Ethio Telecom', area: 'Telecom & Cloud', openings: '14 graduate roles', active: true },
  { id: 'FE-2', name: 'Ethiopian Airlines', area: 'Aviation Technology', openings: '8 internship tracks', active: true },
  { id: 'FE-3', name: 'INSA', area: 'Cybersecurity', openings: '6 research placements', active: true },
  { id: 'FE-4', name: 'Huawei Ethiopia', area: 'Network Engineering', openings: '11 certification paths', active: true },
];

const initialTestimonials: Testimonial[] = [
  { id: 'TT-1', quote: 'ASTU-AMS gave our department the evidence we needed for skill-gap review.', by: 'Department Head', active: true },
  { id: 'TT-2', quote: 'The candidate search and feedback tools improved our campus recruitment cycle.', by: 'Employer Partner', active: true },
  { id: 'TT-3', quote: 'I found mentorship, events, and job matches without leaving the alumni portal.', by: 'ASTU Alumna', active: true },
];

const initialFaq: FaqItem[] = [
  { id: 'FQ-1', question: 'Who can use ASTU-AMS?', answer: 'Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services.', category: 'General', active: true },
  { id: 'FQ-2', question: 'How are tracer studies used?', answer: 'Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence.', category: 'Tracer', active: true },
  { id: 'FQ-3', question: 'Can employers register events?', answer: 'Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports.', category: 'Employers', active: true },
  { id: 'FQ-4', question: 'How do I request a transcript?', answer: 'Log into your alumni profile, navigate to Document Requests, and submit a digital request through the Registrar portal.', category: 'Registrar', active: true },
  { id: 'FQ-5', question: 'What is the Tracer Study cycle?', answer: 'A longitudinal survey that tracks graduate employment outcomes at 6, 12, and 24-month intervals for accreditation.', category: 'Tracer', active: true },
];

export default function HomepageManagement({ initialCategory }: { initialCategory?: CmsCategory } = {}) {
  const [searchParams] = useSearchParams();
  const urlCategory = (searchParams.get('category') || searchParams.get('tab')) as CmsCategory;
  const urlPage = searchParams.get('page');

  const [activeCategory, setActiveCategory] = useState<CmsCategory>(
    initialCategory || urlCategory || (urlPage ? 'detail-pages' : 'hero')
  );
  const { metrics } = usePublicMetrics();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [studioMode, setStudioMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  /* ── 1. Hero & Top Banner ── */
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to the ASTU Alumni Management System — Connecting graduates, employers, and departments for longitudinal career tracking and institutional excellence.');
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);
  const [heroBadge, setHeroBadge] = useState('ASTU Alumni Management System');
  const [heroButtons, setHeroButtons] = useState({
    primaryText: 'Alumni Portal',
    primaryLink: '/info/alumni-portal',
    secondaryText: 'Employer Partnership',
    secondaryLink: '/info/employer-portal',
  });
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);

  /* ── 2. Impact & Key Numbers ── */
  const [impactHeaders, setImpactHeaders] = useState({
    eyebrow: 'ASTU IMPACT AT A GLANCE',
    title: 'Measurable Outcomes Connecting Academia to Industry',
    description: 'Empirical data tracking our graduates across global technology sectors and research hubs.',
  });
  const [impactStats, setImpactStats] = useState<ImpactStat[]>(initialImpactStats);

  /* ── 3. Portals & Ecosystem ── */
  const [portalsHeaders, setPortalsHeaders] = useState({
    eyebrow: 'Get Started',
    title: 'How ASTU-AMS Works',
    description: "From registration to real impact — here's how our platform empowers alumni, employers, and the university community in four simple steps.",
    ctaText: 'Get Started Today',
    ctaLink: '/login',
  });
  const [portals, setPortals] = useState<StakeholderPortal[]>(initialPortals);

  /* ── 4. Campus Life & Labs ── */
  const [campusLifeHeaders, setCampusLifeHeaders] = useState({
    eyebrow: 'Explore Life At ASTU',
    title: 'Campus Life, Facilities, Events, and Galleries',
    description: 'A public gateway for the same institutional experiences AAU highlights: events, facilities, campus activities, media galleries, and services.',
  });
  const [campusLife, setCampusLife] = useState<CampusLifeCard[]>(initialCampusLife);
  const [campuses, setCampuses] = useState<Campus[]>(initialCampuses);
  const [gallery, setGallery] = useState<GalleryImage[]>(initialGallery);
  const [galleryHeaders, setGalleryHeaders] = useState({
    eyebrow: 'CAMPUS GALLERY',
    title: 'Campus Life & Moments',
    subtitle: 'A glimpse of life at ASTU — research, innovation, graduation ceremonies, and alumni milestones.',
    buttonText: 'View All Gallery',
    buttonLink: '/gallery',
  });
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [industryBridge, setIndustryBridge] = useState({
    enabled: true,
    eyebrow: 'Industry-Campus Bridge',
    title: 'Nurturing Innovation in Modern Laboratories',
    description: 'ASTU combines rigorous engineering education with practical lab training. Through ASTU-AMS, graduate outcomes and employer feedback feed directly into curriculum updates.',
    stat1Value: '12+',
    stat1Label: 'Research Centers',
    stat2Value: '80+',
    stat2Label: 'Industry Partners',
    buttonText: 'Explore Campus Life',
    buttonLink: '/info/campus-life',
    image: '/images/arc.jpg',
  });

  /* ── 5. Events & Notices ── */
  const [eventsHeaders, setEventsHeaders] = useState({
    eyebrow: 'Events & Workshops',
    title: 'Upcoming Alumni Events',
    description: 'Networking, learning, and professional growth opportunities across all ASTU campuses.',
    viewAllText: 'See All Events →',
    viewAllLink: '/events',
  });
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(initialWorkshops);
  const [announcementsHeaders, setAnnouncementsHeaders] = useState({
    eyebrow: 'Announcements',
    title: 'Official Notices',
    subscribeTitle: 'Subscribe to official updates',
    subscribeDesc: 'Receive announcements, events, partner calls, tracer survey reminders, and campus notices directly in your inbox.',
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [newsHeaders, setNewsHeaders] = useState({
    eyebrow: 'Campus News',
    title: 'Latest ASTU Highlights',
  });
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);

  /* ── 6. Stories & Partners ── */
  const [storiesHeaders, setStoriesHeaders] = useState({
    eyebrow: 'Community Voices',
    title: 'Alumni & Partner Stories',
    description: 'Hear from our graduates making regional impact and enterprise employers building the future.',
  });
  const [stories, setStories] = useState<SuccessStory[]>(initialStories);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [partnersHeaders, setPartnersHeaders] = useState({
    eyebrow: 'Our Partners',
    title: 'Partner Companies',
    description: 'Institutional partners supporting employability, internships, and research collaboration.',
  });
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [featuredEmployers, setFeaturedEmployers] = useState<FeaturedEmployerItem[]>(initialFeaturedEmployers);

  /* ── 8. Homepage Giving & Research Funds Section ── */
  const [givingSection, setGivingSection] = useState({
    title: 'Support Future Innovators & Campus Research',
    subtitle: 'Active campaigns organized by the ASTU Alumni & Advancement Office. 100% of your tax-deductible gift directly funds undergraduate scholarships, research labs, student welfare, and campus innovation.',
    buttonText: 'Explore All Causes',
  });

  /* ── 6.5. Homepage Community Section ── */
  const [liveCommunitySection, setLiveCommunitySection] = useState({
    title: 'ASTU Alumni Community',
    subtitle: 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates making a difference worldwide.',
    stats: [
      { value: '1,238+', label: 'Alumni Members' },
      { value: '5', label: 'Fields of Study' },
      { value: '500+', label: 'Global Partners' },
    ],
  });
  const [liveCommunityPosts, setLiveCommunityPosts] = useState<any[]>([
    {
      id: 'CP-1',
      name: 'Abebe Yosef',
      role: 'Software Engineer',
      text: 'I landed my new role after using ASTU-AMS job matching and mentorship support. Thank you ASTU community.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      active: true,
    },
    {
      id: 'CP-2',
      name: 'Bekele Kebede',
      role: 'Employer Partner',
      text: 'Hiring from ASTU-AMS has been efficient. We found strong engineering candidates with the right practical skills.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      active: true,
    },
    {
      id: 'CP-3',
      name: 'Helina Sileshi',
      role: 'Mentor & Alumni',
      text: 'Proud to mentor ASTU students through the AMS platform. The next generation of innovators is ready!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      active: true,
    },
  ]);

  const updateCommunitySection = (updates: any) => {
    setLiveCommunitySection(prev => ({ ...prev, ...updates }));
    notifyChange();
  };

  const updateCommunitySectionStats = (index: number, updates: any) => {
    setLiveCommunitySection(prev => ({
      ...prev,
      stats: prev.stats.map((stat: any, i: number) => i === index ? { ...stat, ...updates } : stat),
    }));
    notifyChange();
  };

  /* ── 7. Accreditation & FAQ ── */
  const [accreditation, setAccreditation] = useState({
    eyebrow: 'Quality Assurance',
    title: 'Data-Driven Accreditation & Excellence',
    description: 'ASTU-AMS provides verified tracer data, employment analytics, and employer feedback required by accreditation agencies and university management.',
    point1Title: 'Global Accreditation',
    point1Desc: 'Build transparent, audited institutional reports meeting international standards.',
    point2Title: 'Market Alignment',
    point2Desc: 'Align engineering curricula with regional and global industry expectations.',
    buttonText: 'View Impact Numbers',
    buttonLink: '/info/impact-numbers',
    image1: '/images/arc.jpg',
    image2: '/images/electriclabs.jpeg',
  });
  const [faqHeaders, setFaqHeaders] = useState({
    eyebrow: 'FAQ',
    title: 'Frequently Asked Questions',
    description: 'Common questions about ASTU-AMS, tracer studies, and alumni services.',
  });
  const [faq, setFaq] = useState<FaqItem[]>(initialFaq);

  /* ── 8. Detail Pages (All 22 /info/:slug pages) ── */
  const [detailPages, setDetailPages] = useState<Record<string, DetailPageItem>>(defaultDetailPages);
  const [selectedDetailSlug, setSelectedDetailSlug] = useState<string>(urlPage || 'overview');

  useEffect(() => {
    const page = searchParams.get('page');
    if (page) {
      setSelectedDetailSlug(page);
      setActiveCategory('detail-pages');
    }
    const cat = (searchParams.get('category') || searchParams.get('tab')) as CmsCategory;
    if (cat) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  /* ── 8b. Partners & Employer Portal Page (/partners) ── */
  const [partnersPage, setPartnersPage] = useState<PartnersPageConfig>(defaultPartnersPageConfig);
  const updatePartnersPage = (updates: Partial<PartnersPageConfig>) => {
    notifyChange();
    setPartnersPage(prev => ({ ...prev, ...updates }));
  };

  /* ── 9. CTA & Footer Directory ── */
  const [ctaSection, setCtaSection] = useState({
    enabled: true,
    title: 'Ready to Join ASTU-AMS?',
    description: 'Connect with fellow alumni, discover career opportunities, and contribute to university excellence.',
    primaryCtaText: 'Alumni Portal',
    primaryCtaLink: '/login',
    secondaryCtaText: 'Employer Portal',
    secondaryCtaLink: '/login',
  });
  const [footer, setFooter] = useState({
    aboutText: 'Connecting graduates, corporate employers, and department heads in one unified ecosystem. Improving national quality audits and modernizing student career placements.',
    address: 'Adama Science and Technology University, Adama, Oromia, Ethiopia',
    poBox: 'P.O. Box 1888, Adama, Ethiopia',
    phone: '+251-221-110000',
    email: 'irccd@astu.edu.et',
    officeHours: 'Monday to Friday, 8:00 AM – 5:00 PM (EAT)',
    socialFacebook: 'https://facebook.com/adamaastu',
    socialTelegram: 'https://t.me/Adama_STU_Almuni',
    socialTwitter: '#',
    socialLinkedin: '#',
    copyrightText: 'Adama Science and Technology University. All rights reserved.',
  });

  /* ── 10. Section Links & Navigation ── */
  const [sectionLinks, setSectionLinks] = useState<typeof defaultSectionLinks>(defaultSectionLinks);
  const updateSectionLink = (key: keyof typeof defaultSectionLinks, value: string) => {
    notifyChange();
    setSectionLinks(prev => ({ ...prev, [key]: value }));
  };

  const [detailPageSearch, setDetailPageSearch] = useState('');
  const [detailPageCategory, setDetailPageCategory] = useState<'all' | 'portals' | 'impact' | 'campus' | 'community'>('all');

  const navigateToDetailPage = (url: string) => {
    const cleanUrl = (url || '').trim();
    if (cleanUrl.startsWith('/info/')) {
      const slug = cleanUrl.replace('/info/', '').split('/')[0].split('?')[0];
      if (slug) {
        setSelectedDetailSlug(slug);
        setActiveCategory('detail-pages');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const isInitialLoad = useRef(true);

  // ── Load from API & localStorage ──
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsReloading(true);
    try {
      const liveConfig = await homepageCmsService.fetchFromApi();
      const cfg = liveConfig || homepageCmsService.getSettings();
      if (cfg) {
        if (cfg.welcomeMessage !== undefined) setWelcomeMessage(cfg.welcomeMessage);
        if (cfg.welcomeEnabled !== undefined) setWelcomeEnabled(cfg.welcomeEnabled);
        if (cfg.heroBadge) setHeroBadge(cfg.heroBadge);
        if (cfg.heroButtons) setHeroButtons(cfg.heroButtons);
        if (Array.isArray(cfg.heroSlides) && cfg.heroSlides.length) setHeroSlides(cfg.heroSlides);
        if (cfg.impactHeaders) setImpactHeaders(cfg.impactHeaders);
        if (Array.isArray(cfg.impactStats) && cfg.impactStats.length) setImpactStats(cfg.impactStats);
        if (cfg.portalsHeaders) setPortalsHeaders(cfg.portalsHeaders);
        if (Array.isArray(cfg.portals) && cfg.portals.length) setPortals(cfg.portals);
        if (cfg.campusLifeHeaders) setCampusLifeHeaders(cfg.campusLifeHeaders);
        if (Array.isArray(cfg.campusLife) && cfg.campusLife.length) setCampusLife(cfg.campusLife);
        if (Array.isArray(cfg.campuses) && cfg.campuses.length) setCampuses(cfg.campuses);
        if (Array.isArray(cfg.gallery) && cfg.gallery.length) setGallery(cfg.gallery);
        if ((cfg as any).gallerySection) setGalleryHeaders((cfg as any).gallerySection);
        if (Array.isArray(cfg.videos) && cfg.videos.length) setVideos(cfg.videos);
        if (cfg.industryBridge) setIndustryBridge(cfg.industryBridge);
        if (cfg.eventsHeaders) setEventsHeaders(cfg.eventsHeaders);
        if (Array.isArray(cfg.events) && cfg.events.length) setEvents(cfg.events);
        if (Array.isArray(cfg.workshops) && cfg.workshops.length) setWorkshops(cfg.workshops);
        if (cfg.announcementsHeaders) setAnnouncementsHeaders(cfg.announcementsHeaders);
        if (Array.isArray(cfg.announcements) && cfg.announcements.length) setAnnouncements(cfg.announcements);
        if (cfg.newsHeaders) setNewsHeaders(cfg.newsHeaders);
        if (Array.isArray(cfg.newsItems) && cfg.newsItems.length) setNewsItems(cfg.newsItems);
        if (cfg.storiesHeaders) setStoriesHeaders(cfg.storiesHeaders);
        if (Array.isArray(cfg.stories) && cfg.stories.length) setStories(cfg.stories);
        if (Array.isArray(cfg.testimonials) && cfg.testimonials.length) setTestimonials(cfg.testimonials);
        if (cfg.partnersHeaders) setPartnersHeaders(cfg.partnersHeaders);
        if (Array.isArray(cfg.partners) && cfg.partners.length) setPartners(cfg.partners);
        if (Array.isArray(cfg.featuredEmployers) && cfg.featuredEmployers.length) setFeaturedEmployers(cfg.featuredEmployers);
        if (cfg.accreditation) setAccreditation(cfg.accreditation);
        if (cfg.faqHeaders) setFaqHeaders(cfg.faqHeaders);
        if (Array.isArray(cfg.faq) && cfg.faq.length) setFaq(cfg.faq);
        if (cfg.ctaSection) setCtaSection(cfg.ctaSection);
        if (cfg.footer) setFooter(cfg.footer);
        if (cfg.sectionLinks) setSectionLinks(prev => ({ ...prev, ...cfg.sectionLinks }));
        if (cfg.detailPages && Object.keys(cfg.detailPages).length > 0) {
          setDetailPages({ ...defaultDetailPages, ...cfg.detailPages });
        }
        if (cfg.partnersPage) {
          setPartnersPage({ ...defaultPartnersPageConfig, ...cfg.partnersPage });
        }
        if (cfg.liveCommunitySection) setLiveCommunitySection(cfg.liveCommunitySection);
        if (Array.isArray(cfg.liveCommunityPosts) && cfg.liveCommunityPosts.length) setLiveCommunityPosts(cfg.liveCommunityPosts);
        if (cfg.givingSection) setGivingSection(cfg.givingSection);
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setHasUnsavedChanges(false);
      if (isRefresh) toast.success('Reloaded latest data from backend database');
    } catch {
      if (isRefresh) toast.error('Failed to reload from backend');
    } finally {
      if (isRefresh) setIsReloading(false);
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 200);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mark unsaved changes when any state changes after initial load
  const notifyChange = () => {
    if (!isInitialLoad.current) {
      setHasUnsavedChanges(true);
    }
  };

  // ── Save to Backend ──
  const handleSaveAll = useCallback(async (showToast = true) => {
    setIsSaving(true);
    const payload: HomepageCmsConfig = {
      welcomeMessage,
      welcomeEnabled,
      heroBadge,
      heroButtons,
      heroSlides,
      impactHeaders,
      impactStats,
      portalsHeaders,
      portals,
      campusLifeHeaders,
      campusLife,
      campuses,
      gallery,
      gallerySection: galleryHeaders,
      videos,
      industryBridge,
      eventsHeaders,
      events,
      workshops,
      announcementsHeaders,
      announcements,
      newsHeaders,
      newsItems,
      storiesHeaders,
      stories,
      testimonials,
      partnersHeaders,
      partners,
      featuredEmployers,
      accreditation,
      faqHeaders,
      faq,
      ctaSection,
      givingSection,
      footer,
      sectionLinks,
      detailPages,
      partnersPage,
      liveCommunitySection,
      liveCommunityPosts,
      // Keep legacy keys synced for backward compatibility
      campusLifePage: detailPages['campus-life'],
      facilitiesPage: detailPages['facilities'],
      eventsPage: detailPages['events'],
      galleryPage: detailPages['gallery'],
    };

    try {
      await homepageCmsService.saveSettings(payload);
      setHasUnsavedChanges(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (showToast) {
        toast.success('Homepage & detail pages saved live to backend database!');
      }
    } catch {
      toast.error('Could not save to backend database. Saved to local cache.');
    } finally {
      setIsSaving(false);
    }
  }, [
    welcomeMessage, welcomeEnabled, heroBadge, heroButtons, heroSlides,
    impactHeaders, impactStats, portalsHeaders, portals, campusLifeHeaders,
    campusLife, campuses, gallery, galleryHeaders, videos, industryBridge,
    eventsHeaders, events, workshops, announcementsHeaders, announcements,
    newsHeaders, newsItems, storiesHeaders, stories, testimonials,
    partnersHeaders, partners, featuredEmployers, accreditation, faqHeaders,
    faq, ctaSection, givingSection, footer, sectionLinks, detailPages, partnersPage,
    liveCommunitySection, liveCommunityPosts,
  ]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveAll(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveAll]);

  // Total active count across all sections
  const totalActiveItems = useMemo(() => {
    const s = heroSlides.filter(x => x.active).length;
    const st = impactStats.filter(x => x.active).length;
    const p = portals.filter(x => x.active).length;
    const c = campusLife.filter(x => x.active).length;
    const e = events.filter(x => x.active).length;
    const w = workshops.filter(x => x.active).length;
    const a = announcements.filter(x => x.active).length;
    const n = newsItems.filter(x => x.active).length;
    const stg = stories.filter(x => x.active).length;
    const pt = partners.filter(x => x.active).length;
    const f = faq.filter(x => x.active).length;
    return s + st + p + c + e + w + a + n + stg + pt + f;
  }, [heroSlides, impactStats, portals, campusLife, events, workshops, announcements, newsItems, stories, partners, faq]);

  // Current detail page being edited
  const currentDetailPage: DetailPageItem = useMemo(() => {
    return (
      detailPages[selectedDetailSlug] ||
      defaultDetailPages[selectedDetailSlug] || {
        slug: selectedDetailSlug,
        title: 'New Page',
        subtitle: '',
        image: '',
        sections: [],
      }
    );
  }, [detailPages, selectedDetailSlug]);

  const updateCurrentDetailPage = (updates: Partial<DetailPageItem>) => {
    notifyChange();
    setDetailPages(prev => ({
      ...prev,
      [selectedDetailSlug]: {
        ...currentDetailPage,
        ...updates,
      },
    }));
  };

  // Section modal helper
  const [modalState, setModalState] = useState<{
    open: boolean;
    title: string;
    itemType: string;
    itemData: any;
    onSave: (data: any) => void;
  }>({
    open: false,
    title: '',
    itemType: '',
    itemData: null,
    onSave: () => {},
  });

  const closeModal = () => {
    setModalState(p => ({ ...p, open: false, itemData: null }));
  };

  /* ──────────────────────────────────────────────────────────────────────────
     RENDER WORKSPACE BY CATEGORY
  ────────────────────────────────────────────────────────────────────────── */
  const renderCategoryContent = () => {
    switch (activeCategory) {
      /* ══════════════════════════════════════════════════════════════════════
         1. HERO & ANNOUNCEMENTS
      ══════════════════════════════════════════════════════════════════════ */
      case 'hero':
        return (
          <div className="space-y-6">
            {/* Top Alert Ticker */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-astu-navy/10 text-astu-navy dark:bg-sky-500/10 dark:text-sky-400 font-bold">
                      <Bell className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Announcement Ticker Banner</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Appears as an alert bar at the very top of the public homepage.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={welcomeEnabled}
                      onChange={e => { setWelcomeEnabled(e.target.checked); notifyChange(); }}
                      className="h-4 w-4 rounded text-astu-navy focus:ring-astu-navy cursor-pointer"
                    />
                    <span>{welcomeEnabled ? 'Enabled on Live Site' : 'Hidden'}</span>
                  </label>
                </div>
              </div>
              <textarea
                value={welcomeMessage}
                onChange={e => { setWelcomeMessage(e.target.value); notifyChange(); }}
                rows={2}
                placeholder="Enter alert text shown to all visitors on the homepage..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy resize-none"
              />
            </div>

            {/* Hero Badge & Action Buttons */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Hero Badge & Call-To-Action Buttons</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize the eyebrow badge and the two primary buttons displayed directly under the main slide headline.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge Eyebrow Text</label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={e => { setHeroBadge(e.target.value); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white"
                    placeholder="e.g. ASTU Alumni Management System"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary Button Label & Destination</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={heroButtons.primaryText}
                      onChange={e => { setHeroButtons({ ...heroButtons, primaryText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                      placeholder="Button text"
                    />
                    <input
                      type="text"
                      value={heroButtons.primaryLink}
                      onChange={e => { setHeroButtons({ ...heroButtons, primaryLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                      placeholder="/info/alumni-portal"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary Button Label & Destination</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={heroButtons.secondaryText}
                      onChange={e => { setHeroButtons({ ...heroButtons, secondaryText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                      placeholder="Button text"
                    />
                    <input
                      type="text"
                      value={heroButtons.secondaryLink}
                      onChange={e => { setHeroButtons({ ...heroButtons, secondaryLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                      placeholder="/info/employer-portal"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rotating Hero Carousel Slides */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Hero Carousel Slides ({heroSlides.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Full-screen hero slider with high-resolution photography, headlines, and descriptions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Hero Carousel Slide',
                      itemType: 'hero-slide',
                      itemData: {
                        id: `HS-${Date.now()}`,
                        image: '/images/astu-building.jpg',
                        tagline: 'ASTU Innovation & Excellence',
                        title: 'Empowering the Next Generation of Engineers & Leaders',
                        description: 'Connecting university research, verified graduate outcomes, and premier industrial partnerships.',
                        active: true,
                      },
                      onSave: newItem => {
                        setHeroSlides(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added new hero slide');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Slide
                </button>
              </div>

              <div className="space-y-4">
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-slate-200 dark:border-slate-700">
                      <img
                        src={mediaUrl(slide.image)}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = '/images/astu-seal-logo.png'; }}
                      />
                      <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Slide #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-astu-red">
                          {slide.tagline || 'No Tagline'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setHeroSlides(heroSlides.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
                              notifyChange();
                            }}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                              slide.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}
                          >
                            {slide.active ? 'Active' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this hero slide?')) {
                                setHeroSlides(heroSlides.filter((_, i) => i !== idx));
                                notifyChange();
                                toast.success('Slide removed');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Delete Slide"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{slide.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{slide.description}</p>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Hero Slide #${idx + 1}`,
                              itemType: 'hero-slide',
                              itemData: { ...slide },
                              onSave: updated => {
                                setHeroSlides(heroSlides.map((s, i) => i === idx ? { ...s, ...updated } : s));
                                notifyChange();
                                toast.success('Slide updated');
                              },
                            });
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" /> Edit Slide Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         2. IMPACT & NUMBERS
      ══════════════════════════════════════════════════════════════════════ */
      case 'impact':
        return (
          <div className="space-y-6">
            {/* Impact Section Header */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Impact Section Header</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control the headline and description text introducing the ASTU impact numbers.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={impactHeaders.eyebrow}
                    onChange={e => { setImpactHeaders({ ...impactHeaders, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-astu-red"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Title</label>
                  <input
                    type="text"
                    value={impactHeaders.title}
                    onChange={e => { setImpactHeaders({ ...impactHeaders, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={impactHeaders.description}
                    onChange={e => { setImpactHeaders({ ...impactHeaders, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Metric Counter Cards */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Impact Statistic Counters ({impactStats.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Counter cards displayed prominently below the hero banner.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Impact Stat Counter',
                      itemType: 'impact-stat',
                      itemData: {
                        id: `IS-${Date.now()}`,
                        label: 'New Impact Counter',
                        value: '100',
                        suffix: '+',
                        detail: 'Description detail text',
                        icon: 'BarChart3',
                        action: 'Explore',
                        target: '/info/overview',
                        active: true,
                      },
                      onSave: newItem => {
                        setImpactStats(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added new stat counter');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Metric
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {impactStats.map((stat, idx) => {
                  const Icon = iconMap[stat.icon] || BarChart3;
                  return (
                    <div
                      key={stat.id || idx}
                      className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-lg bg-astu-navy/10 text-astu-navy dark:bg-sky-500/10 dark:text-sky-400">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <span className="text-lg font-bold text-astu-navy dark:text-white">
                              {stat.value}{stat.suffix}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setImpactStats(impactStats.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
                              notifyChange();
                            }}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                              stat.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {stat.active ? 'Live' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove stat "${stat.label}"?`)) {
                                setImpactStats(impactStats.filter((_, i) => i !== idx));
                                notifyChange();
                                toast.success('Stat removed');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Remove stat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{stat.label}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{stat.detail}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="truncate text-[10px] font-mono text-slate-400 max-w-[120px]" title={stat.target || ''}>
                            {stat.target || '/info/...'}
                          </span>
                          {stat.target?.startsWith('/info/') && (
                            <button
                              type="button"
                              onClick={() => navigateToDetailPage(stat.target)}
                              className="text-[10px] font-bold text-astu-navy dark:text-sky-400 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                              title="Edit linked detail page content"
                            >
                              <Edit3 className="h-2.5 w-2.5" /> Edit Page Content
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Stat: ${stat.label}`,
                              itemType: 'impact-stat',
                              itemData: { ...stat },
                              onSave: updated => {
                                setImpactStats(impactStats.map((s, i) => i === idx ? { ...s, ...updated } : s));
                                notifyChange();
                                toast.success('Stat counter updated');
                              },
                            });
                          }}
                          className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         3. STAKEHOLDER PORTALS & HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════ */
      case 'portals':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">How It Works Section Header</h3>
                <p className="text-xs text-slate-500 mt-0.5">Eyebrow, title, and subtitle text introducing the platform ecosystem.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={portalsHeaders.eyebrow}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-astu-red"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Title</label>
                  <input
                    type="text"
                    value={portalsHeaders.title}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description Subtitle</label>
                  <textarea
                    value={portalsHeaders.description}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bottom CTA Button Label</label>
                  <input
                    type="text"
                    value={portalsHeaders.ctaText}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, ctaText: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bottom CTA Route Link</label>
                  <input
                    type="text"
                    value={portalsHeaders.ctaLink}
                    onChange={e => { setPortalsHeaders({ ...portalsHeaders, ctaLink: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Stakeholder Cards */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Stakeholder Ecosystem Steps ({portals.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Cards showing step-by-step role capabilities on the homepage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Stakeholder Step Card',
                      itemType: 'portal',
                      itemData: {
                        id: `SP-${Date.now()}`,
                        title: 'Alumni Researchers',
                        icon: 'Zap',
                        pointsString: 'Collaborate with active faculties.\nCo-author accredited research papers.',
                        cta: 'Explore Research',
                        route: '/info/research',
                        active: true,
                      },
                      onSave: newItem => {
                        const newPoints = typeof newItem.pointsString === 'string'
                          ? newItem.pointsString.split('\n').filter(Boolean)
                          : newItem.points || [];
                        setPortals(prev => [...prev, { ...newItem, points: newPoints }]);
                        notifyChange();
                        toast.success('Added stakeholder card');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Card
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {portals.map((portal, idx) => {
                  const Icon = iconMap[portal.icon] || Users;
                  return (
                    <div
                      key={portal.id || idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 rounded-lg bg-astu-navy/10 text-astu-navy dark:bg-sky-500/10 dark:text-sky-400">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{portal.title}</h4>
                            <span className="text-[10px] text-slate-400">Step #{idx + 1}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPortals(portals.map((p, i) => i === idx ? { ...p, active: !p.active } : p));
                              notifyChange();
                            }}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                              portal.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {portal.active ? 'Active' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete card "${portal.title}"?`)) {
                                setPortals(portals.filter((_, i) => i !== idx));
                                notifyChange();
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        {portal.points && portal.points.map((pt, pIdx) => (
                          <p key={pIdx} className="line-clamp-1 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-astu-green shrink-0" />
                            {pt}
                          </p>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="truncate text-[10px] font-mono text-slate-400 max-w-[120px]" title={portal.route || ''}>
                            {portal.route || '/info/...'}
                          </span>
                          {portal.route?.startsWith('/info/') && (
                            <button
                              type="button"
                              onClick={() => navigateToDetailPage(portal.route)}
                              className="text-[10px] font-bold text-astu-navy dark:text-sky-400 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                              title="Edit linked detail page content"
                            >
                              <Edit3 className="h-2.5 w-2.5" /> Edit Page Content
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Portal: ${portal.title}`,
                              itemType: 'portal',
                              itemData: { ...portal, pointsString: (portal.points || []).join('\n') },
                              onSave: updated => {
                                const newPoints = typeof updated.pointsString === 'string'
                                  ? updated.pointsString.split('\n').filter(Boolean)
                                  : updated.points || [];
                                setPortals(portals.map((p, i) => i === idx ? { ...p, ...updated, points: newPoints } : p));
                                notifyChange();
                                toast.success('Portal updated');
                              },
                            });
                          }}
                          className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer shrink-0"
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         4. CAMPUS LIFE & LABS
      ══════════════════════════════════════════════════════════════════════ */
      case 'campus-life':
        return (
          <div className="space-y-6">
            {/* Industry-Campus Bridge Banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Industry-Campus Bridge Spotlight</h3>
                  <p className="text-xs text-slate-500 mt-0.5">The prominent laboratory and research showcase banner on the homepage.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={industryBridge.enabled !== false}
                    onChange={e => { setIndustryBridge({ ...industryBridge, enabled: e.target.checked }); notifyChange(); }}
                    className="h-4 w-4 rounded text-astu-navy cursor-pointer"
                  />
                  <span>{industryBridge.enabled !== false ? 'Enabled' : 'Hidden'}</span>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={industryBridge.eyebrow}
                    onChange={e => { setIndustryBridge({ ...industryBridge, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-astu-red"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Headline</label>
                  <input
                    type="text"
                    value={industryBridge.title}
                    onChange={e => { setIndustryBridge({ ...industryBridge, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={industryBridge.description}
                    onChange={e => { setIndustryBridge({ ...industryBridge, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 1 (Value & Label)</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={industryBridge.stat1Value}
                      onChange={e => { setIndustryBridge({ ...industryBridge, stat1Value: e.target.value }); notifyChange(); }}
                      className="w-1/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={industryBridge.stat1Label}
                      onChange={e => { setIndustryBridge({ ...industryBridge, stat1Label: e.target.value }); notifyChange(); }}
                      className="w-2/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 2 (Value & Label)</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={industryBridge.stat2Value}
                      onChange={e => { setIndustryBridge({ ...industryBridge, stat2Value: e.target.value }); notifyChange(); }}
                      className="w-1/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={industryBridge.stat2Label}
                      onChange={e => { setIndustryBridge({ ...industryBridge, stat2Label: e.target.value }); notifyChange(); }}
                      className="w-2/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Label & Link</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={industryBridge.buttonText}
                      onChange={e => { setIndustryBridge({ ...industryBridge, buttonText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={industryBridge.buttonLink}
                      onChange={e => { setIndustryBridge({ ...industryBridge, buttonLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <ImageUploader
                    label="Bridge Spotlight Photo"
                    value={industryBridge.image}
                    onChange={url => { setIndustryBridge({ ...industryBridge, image: url }); notifyChange(); }}
                  />
                </div>
              </div>
            </div>

            {/* Campus Life Highlight Cards */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Life Cards ({campusLife.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">The 3 feature cards displayed under Explore Life At ASTU.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Campus Life Card',
                      itemType: 'campus-card',
                      itemData: {
                        id: `CL-${Date.now()}`,
                        title: 'Student Innovation Hub',
                        campus: 'Maker Space',
                        description: 'Prototyping equipment, electronics workbenches, and coding labs.',
                        image: '/images/electriclabs.jpeg',
                        action: 'Discover Hub',
                        link: '/info/facilities',
                        active: true,
                      },
                      onSave: newItem => {
                        setCampusLife(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added campus card');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Card
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {campusLife.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 overflow-hidden"
                  >
                    <div className="h-28 w-full bg-slate-200 relative overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = '/images/campus-2.jpeg'; }}
                      />
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {card.campus}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-1.5 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{card.title}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setCampusLife(campusLife.map((c, i) => i === idx ? { ...c, active: !c.active } : c));
                            notifyChange();
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                            card.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {card.active ? 'Active' : 'Hidden'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{card.description}</p>
                    </div>

                    <div className="p-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="truncate text-[10px] font-mono text-slate-400 max-w-[140px]" title={`${card.action} -> ${card.link}`}>
                        {card.action} → {card.link}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Campus Card: ${card.title}`,
                              itemType: 'campus-card',
                              itemData: { ...card },
                              onSave: updated => {
                                setCampusLife(campusLife.map((c, i) => i === idx ? { ...c, ...updated } : c));
                                notifyChange();
                                toast.success('Campus card updated');
                              },
                            });
                          }}
                          className="font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete campus card "${card.title}"?`)) {
                              setCampusLife(campusLife.filter((_, i) => i !== idx));
                              notifyChange();
                              toast.success('Card removed');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         5. CAMPUS MOMENTS (GALLERY)
      ══════════════════════════════════════════════════════════════════════ */
      case 'gallery':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Gallery Section Headers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control the eyebrow, headline, description, and button for Campus Life & Moments.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={galleryHeaders.eyebrow}
                    onChange={e => { setGalleryHeaders({ ...galleryHeaders, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Title</label>
                  <input
                    type="text"
                    value={galleryHeaders.title}
                    onChange={e => { setGalleryHeaders({ ...galleryHeaders, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtitle Description</label>
                  <textarea
                    value={galleryHeaders.subtitle}
                    onChange={e => { setGalleryHeaders({ ...galleryHeaders, subtitle: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Text</label>
                    <input
                      type="text"
                      value={galleryHeaders.buttonText}
                      onChange={e => { setGalleryHeaders({ ...galleryHeaders, buttonText: e.target.value }); notifyChange(); }}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Link</label>
                    <input
                      type="text"
                      value={galleryHeaders.buttonLink}
                      onChange={e => { setGalleryHeaders({ ...galleryHeaders, buttonLink: e.target.value }); notifyChange(); }}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Moments Photos ({gallery.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">High-resolution photography displayed on the public homepage gallery.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add Campus Photo',
                      itemType: 'gallery',
                      itemData: {
                        id: `GI-${Date.now()}`,
                        title: 'New Campus Moment',
                        src: '/images/campus-2.jpeg',
                        active: true,
                      },
                      onSave: newItem => {
                        setGallery(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added gallery image');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Photo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gallery.map((img, idx) => (
                  <div key={img.id || idx} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/60 dark:bg-slate-800/40 p-2.5 flex items-center gap-3">
                    <img src={img.src} alt={img.title} className="h-14 w-14 rounded-lg object-cover shrink-0" onError={e => { (e.target as HTMLImageElement).src = '/images/campus-2.jpeg'; }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{img.title}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setGallery(gallery.map((g, i) => i === idx ? { ...g, active: !g.active } : g));
                          notifyChange();
                        }}
                        className={`mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${img.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}
                      >
                        {img.active !== false ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${img.title}"?`)) {
                          setGallery(gallery.filter((_, i) => i !== idx));
                          notifyChange();
                          toast.success('Removed photo');
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         6. EVENTS & NOTICES
      ══════════════════════════════════════════════════════════════════════ */
      case 'events-news':
        return (
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Alumni Events ({events.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Calendar events with RSVP registration and venue details.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Event',
                      itemType: 'event',
                      itemData: {
                        id: `EV-${Date.now()}`,
                        title: 'ASTU Engineering Expo 2026',
                        date: 'October 20, 2026',
                        location: 'ASTU Central Arc',
                        image: '/images/campus-2.jpeg',
                        active: true,
                      },
                      onSave: newItem => {
                        setEvents(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added event');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Event
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {events.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    className="flex gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                  >
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-24 h-20 rounded-lg object-cover bg-slate-200 shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = '/images/campus-2.jpeg'; }}
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-astu-red uppercase">{ev.date}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEvents(events.map((e, i) => i === idx ? { ...e, active: !e.active } : e));
                              notifyChange();
                            }}
                            className={`rounded-full px-2 py-0.2 text-[10px] font-bold cursor-pointer ${
                              ev.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {ev.active ? 'Active' : 'Hidden'}
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-1">{ev.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{ev.location}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Event: ${ev.title}`,
                              itemType: 'event',
                              itemData: { ...ev },
                              onSave: updated => {
                                setEvents(events.map((e, i) => i === idx ? { ...e, ...updated } : e));
                                notifyChange();
                                toast.success('Event updated');
                              },
                            });
                          }}
                          className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete event "${ev.title}"?`)) {
                              setEvents(events.filter((_, i) => i !== idx));
                              notifyChange();
                              toast.success('Event removed');
                            }
                          }}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Announcements */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Notices & Announcements ({announcements.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Urgent notices displayed with the bell icon in the notices feed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Official Notice',
                      itemType: 'announcement',
                      itemData: {
                        id: `AN-${Date.now()}`,
                        title: 'New Alumni Membership Registration Window Now Open',
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        type: 'Alumni Announcement',
                        active: true,
                      },
                      onSave: newItem => {
                        setAnnouncements(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added notice');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Notice
                </button>
              </div>

              <div className="space-y-2">
                {announcements.map((ann, idx) => (
                  <div
                    key={ann.id || idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Bell className="h-4 w-4 text-astu-red shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{ann.title}</p>
                        <p className="text-[10px] text-slate-500">{ann.type} • {ann.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAnnouncements(announcements.map((a, i) => i === idx ? { ...a, active: !a.active } : a));
                          notifyChange();
                        }}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          ann.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {ann.active ? 'Active' : 'Hidden'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setModalState({
                            open: true,
                            title: 'Edit Announcement',
                            itemType: 'announcement',
                            itemData: { ...ann },
                            onSave: updated => {
                              setAnnouncements(announcements.map((a, i) => i === idx ? { ...a, ...updated } : a));
                              notifyChange();
                              toast.success('Announcement updated');
                            },
                          });
                        }}
                        className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${ann.title}"?`)) {
                            setAnnouncements(announcements.filter((_, i) => i !== idx));
                            notifyChange();
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         6. STORIES & PARTNERS
      ══════════════════════════════════════════════════════════════════════ */
      case 'community':
        return (
          <div className="space-y-6">
            {/* Homepage Community Section Management */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Homepage Community Section</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage the main community section on the homepage (title, stats, testimonials).</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={liveCommunitySection?.title || 'ASTU Alumni Community'}
                    onChange={e => updateCommunitySection({ title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Subtitle</label>
                  <textarea
                    value={liveCommunitySection?.subtitle || 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates making a difference worldwide.'}
                    onChange={e => updateCommunitySection({ subtitle: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 1: Alumni Members</label>
                  <input
                    type="text"
                    value={liveCommunitySection?.stats?.[0]?.value || '—'}
                    onChange={e => updateCommunitySectionStats(0, { value: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 2: Fields of Study</label>
                  <input
                    type="text"
                    value={liveCommunitySection?.stats?.[1]?.value || '—'}
                    onChange={e => updateCommunitySectionStats(1, { value: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Stat 3: Global Partners</label>
                  <input
                    type="text"
                    value={liveCommunitySection?.stats?.[2]?.value || '—'}
                    onChange={e => updateCommunitySectionStats(2, { value: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Community Testimonials */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Community Testimonials ({liveCommunityPosts.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Quotes and experiences featured in the community section.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Community Testimonial',
                      itemType: 'communityPost',
                      itemData: {
                        id: `CP-${Date.now()}`,
                        name: 'New Alumni Member',
                        role: 'Software Engineer & Alumnus',
                        text: 'Share your experience with the ASTU community.',
                        image: '/images/astu-seal-logo.png',
                        active: true,
                      },
                      onSave: newItem => {
                        setLiveCommunityPosts(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added testimonial');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Testimonial
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {liveCommunityPosts.map((post, idx) => (
                  <div
                    key={post.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={post.image}
                          alt={post.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          onError={e => { (e.target as HTMLImageElement).src = '/images/astu-seal-logo.png'; }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{post.name}</p>
                          <p className="text-[10px] text-astu-green font-semibold">{post.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">"{post.text}"</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setLiveCommunityPosts(liveCommunityPosts.map((p, i) => i === idx ? { ...p, active: !p.active } : p));
                          notifyChange();
                        }}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          post.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {post.active ? 'Active' : 'Hidden'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Testimonial: ${post.name}`,
                              itemType: 'communityPost',
                              itemData: { ...post },
                              onSave: updated => {
                                setLiveCommunityPosts(liveCommunityPosts.map((p, i) => i === idx ? { ...p, ...updated } : p));
                                notifyChange();
                                toast.success('Testimonial updated');
                              },
                            });
                          }}
                          className="font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete testimonial by "${post.name}"?`)) {
                              setLiveCommunityPosts(liveCommunityPosts.filter((_, i) => i !== idx));
                              notifyChange();
                              toast.success('Testimonial removed');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete testimonial"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alumni Success Stories */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Alumni & Partner Success Stories ({stories.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Quotes and experiences highlighting graduate employability and mentorship.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Success Story',
                      itemType: 'story',
                      itemData: {
                        id: `SS-${Date.now()}`,
                        name: 'Dr. Selamawit Desta',
                        role: 'AI Researcher & Alumna',
                        text: 'Mentoring young ASTU engineers through ASTU-AMS has been the most fulfilling experience of my professional year.',
                        image: '/images/arc.jpg',
                        active: true,
                      },
                      onSave: newItem => {
                        setStories(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added success story');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Story
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {stories.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={st.image}
                          alt={st.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          onError={e => { (e.target as HTMLImageElement).src = '/images/astu-seal-logo.png'; }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{st.name}</p>
                          <p className="text-[10px] text-astu-green font-semibold">{st.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">“{st.text}”</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setStories(stories.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
                          notifyChange();
                        }}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          st.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {st.active ? 'Active' : 'Hidden'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: `Edit Story: ${st.name}`,
                              itemType: 'story',
                              itemData: { ...st },
                              onSave: updated => {
                                setStories(stories.map((s, i) => i === idx ? { ...s, ...updated } : s));
                                notifyChange();
                                toast.success('Story updated');
                              },
                            });
                          }}
                          className="font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete story by "${st.name}"?`)) {
                              setStories(stories.filter((_, i) => i !== idx));
                              notifyChange();
                              toast.success('Story removed');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete story"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Logos */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Partner Companies Carousel ({partners.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Corporate partners rotating in the logo carousel at the bottom of the page.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add Partner Company & Logo',
                      itemType: 'partner',
                      itemData: {
                        id: `PT-${Date.now()}`,
                        name: '',
                        logo: '',
                        active: true,
                      },
                      onSave: (newItem) => {
                        if (newItem.name?.trim()) {
                          setPartners([...partners, { ...newItem, name: newItem.name.trim() }]);
                          notifyChange();
                          toast.success(`Added partner "${newItem.name.trim()}"`);
                        }
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Partner
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {partners.map((partner, idx) => (
                  <div
                    key={partner.id || idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs shadow-2xs"
                  >
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="h-4 w-4 object-contain rounded shrink-0"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="h-4 w-4 rounded bg-[#003366] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span
                      className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:underline"
                      title="Click to edit partner and logo"
                      onClick={() => {
                        setModalState({
                          open: true,
                          title: `Edit Partner — ${partner.name}`,
                          itemType: 'partner',
                          itemData: { ...partner },
                          onSave: (updated) => {
                            setPartners(partners.map((p, i) => i === idx ? updated : p));
                            notifyChange();
                            toast.success(`Updated "${updated.name}"`);
                          },
                        });
                      }}
                    >
                      {partner.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPartners(partners.map((p, i) => i === idx ? { ...p, active: !p.active } : p));
                        notifyChange();
                      }}
                      className={`h-2 w-2 rounded-full cursor-pointer ${partner.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      title={partner.active ? 'Active' : 'Hidden'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPartners(partners.filter((_, i) => i !== idx));
                        notifyChange();
                      }}
                      className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer"
                      title="Remove partner"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         6b. PARTNERS & EMPLOYER PORTAL PAGE (/partners)
      ══════════════════════════════════════════════════════════════════════ */
      case 'partners-portal':
        return (
          <div className="space-y-6">
            {/* Header info bar */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Partners & Employer Portal Page Manager</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Manage every title, subtitle, CTA button, benefit card, feature list, and stat counter on <span className="font-mono text-red-600">/partners</span>.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/partners"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View /partners Live</span>
                  </a>
                </div>
              </div>

              {/* Hero Settings */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Hero Section</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Top Badge Pill</label>
                    <input
                      type="text"
                      value={partnersPage.heroBadge}
                      onChange={e => updatePartnersPage({ heroBadge: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Highlight Text (Accent Color)</label>
                    <input
                      type="text"
                      value={partnersPage.heroHighlight}
                      onChange={e => updatePartnersPage({ heroHighlight: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Headline Title</label>
                    <input
                      type="text"
                      value={partnersPage.heroTitle}
                      onChange={e => updatePartnersPage({ heroTitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={partnersPage.heroSubtitle}
                      onChange={e => updatePartnersPage({ heroSubtitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={partnersPage.heroPrimaryCtaText}
                      onChange={e => updatePartnersPage({ heroPrimaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary CTA Target Route</label>
                    <input
                      type="text"
                      value={partnersPage.heroPrimaryCtaLink}
                      onChange={e => updatePartnersPage({ heroPrimaryCtaLink: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary CTA Button Label</label>
                    <input
                      type="text"
                      value={partnersPage.heroSecondaryCtaText}
                      onChange={e => updatePartnersPage({ heroSecondaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary CTA Target Route</label>
                    <input
                      type="text"
                      value={partnersPage.heroSecondaryCtaLink}
                      onChange={e => updatePartnersPage({ heroSecondaryCtaLink: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Counters Editor */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Partner Impact Counters (Stats Strip)</h3>
                <p className="text-xs text-slate-500 mt-0.5">The 4 prominent metric cards displayed right beneath the hero banner.</p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {(partnersPage.stats || []).map((st, idx) => (
                  <div key={st.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stat #{idx + 1}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Number / Value</label>
                        <input
                          type="text"
                          value={st.value}
                          onChange={e => {
                            const updated = partnersPage.stats.map((s, i) => i === idx ? { ...s, value: e.target.value } : s);
                            updatePartnersPage({ stats: updated });
                          }}
                          className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-black text-astu-navy dark:text-sky-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Label</label>
                        <input
                          type="text"
                          value={st.label}
                          onChange={e => {
                            const updated = partnersPage.stats.map((s, i) => i === idx ? { ...s, label: e.target.value } : s);
                            updatePartnersPage({ stats: updated });
                          }}
                          className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Cards Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Why Partner with ASTU Benefits Grid ({(partnersPage.benefits || []).length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">The 6 key value cards presenting mutual benefits to prospective employers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New Partner Benefit Card',
                      itemType: 'benefit',
                      itemData: {
                        id: `B-${Date.now()}`,
                        icon: 'Building2',
                        title: 'New Benefit Card',
                        description: 'Describe the concrete value provided to partner organizations.',
                        active: true,
                      },
                      onSave: newItem => {
                        updatePartnersPage({ benefits: [...(partnersPage.benefits || []), newItem] });
                        notifyChange();
                        toast.success('Added benefit card');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Benefit
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Eyebrow</label>
                  <input
                    type="text"
                    value={partnersPage.benefitsEyebrow || ''}
                    onChange={e => updatePartnersPage({ benefitsEyebrow: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-astu-navy dark:text-sky-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={partnersPage.benefitsTitle}
                    onChange={e => updatePartnersPage({ benefitsTitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Subtitle</label>
                  <input
                    type="text"
                    value={partnersPage.benefitsSubtitle}
                    onChange={e => updatePartnersPage({ benefitsSubtitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {(partnersPage.benefits || []).map((ben, idx) => (
                  <div
                    key={ben.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Card #{idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = partnersPage.benefits.map((b, i) => i === idx ? { ...b, active: !b.active } : b);
                              updatePartnersPage({ benefits: updated });
                            }}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                              ben.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {ben.active ? 'Active' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete card "${ben.title}"?`)) {
                                const updated = partnersPage.benefits.filter((_, i) => i !== idx);
                                updatePartnersPage({ benefits: updated });
                                toast.success('Benefit removed');
                              }
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Card Title</label>
                        <input
                          type="text"
                          value={ben.title}
                          onChange={e => {
                            const updated = partnersPage.benefits.map((b, i) => i === idx ? { ...b, title: e.target.value } : b);
                            updatePartnersPage({ benefits: updated });
                          }}
                          className="mt-0.5 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Description</label>
                        <textarea
                          rows={2}
                          value={ben.description}
                          onChange={e => {
                            const updated = partnersPage.benefits.map((b, i) => i === idx ? { ...b, description: e.target.value } : b);
                            updatePartnersPage({ benefits: updated });
                          }}
                          className="mt-0.5 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist & CTA Card Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Feature Checklist & Registration Box</h3>
                <p className="text-xs text-slate-500 mt-0.5">The dual-column section containing the partner perks checklist and the high-conversion gradient registration card.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Features Section Title</label>
                  <input
                    type="text"
                    value={partnersPage.featuresTitle}
                    onChange={e => updatePartnersPage({ featuresTitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Features Subtitle</label>
                  <input
                    type="text"
                    value={partnersPage.featuresSubtitle}
                    onChange={e => updatePartnersPage({ featuresSubtitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
              </div>

              {/* Checklist items */}
              <div className="mb-6 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Checklist Points ({(partnersPage.features || []).length})</label>
                {(partnersPage.features || []).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <input
                      type="text"
                      value={feat}
                      onChange={e => {
                        const updated = partnersPage.features.map((f, i) => i === idx ? e.target.value : f);
                        updatePartnersPage({ features: updated });
                      }}
                      className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = partnersPage.features.filter((_, i) => i !== idx);
                        updatePartnersPage({ features: updated });
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    updatePartnersPage({ features: [...(partnersPage.features || []), 'New verified partnership feature point'] });
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add checklist point
                </button>
              </div>

              {/* Registration Card details */}
              <div className="p-4 rounded-xl border border-red-100 dark:border-red-950 bg-red-50/40 dark:bg-red-950/20 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-600">Right Side CTA Card</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Headline</label>
                    <input
                      type="text"
                      value={partnersPage.ctaCardTitle}
                      onChange={e => updatePartnersPage({ ctaCardTitle: e.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Button Label</label>
                    <input
                      type="text"
                      value={partnersPage.ctaCardButtonText}
                      onChange={e => updatePartnersPage({ ctaCardButtonText: e.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Description</label>
                    <input
                      type="text"
                      value={partnersPage.ctaCardDescription}
                      onChange={e => updatePartnersPage({ ctaCardDescription: e.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Full-Width CTA Banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Bottom Full-Width CTA Section</h3>
                <p className="text-xs text-slate-500 mt-0.5">The concluding banner inviting organizations to join ASTU\'s corporate employer network.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bottom Title</label>
                  <input
                    type="text"
                    value={partnersPage.bottomCtaTitle}
                    onChange={e => updatePartnersPage({ bottomCtaTitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bottom Description</label>
                  <textarea
                    rows={2}
                    value={partnersPage.bottomCtaDescription}
                    onChange={e => updatePartnersPage({ bottomCtaDescription: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Label</label>
                  <input
                    type="text"
                    value={partnersPage.bottomCtaButtonText}
                    onChange={e => updatePartnersPage({ bottomCtaButtonText: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button Target Route</label>
                  <input
                    type="text"
                    value={partnersPage.bottomCtaButtonLink}
                    onChange={e => updatePartnersPage({ bottomCtaButtonLink: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         8. GIVING & RESEARCH FUNDS
      ══════════════════════════════════════════════════════════════════════ */
      case 'giving-campaigns':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Giving &amp; Research Campaigns Section</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Customize the section title and description displayed on the homepage above the active causes.</p>
                </div>
                <Link
                  to="/cms/donations"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  <Heart className="h-3.5 w-3.5 fill-[#FFCC00] text-[#FFCC00]" />
                  Open Donations Desk
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={givingSection.title}
                    onChange={e => { setGivingSection({ ...givingSection, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={givingSection.subtitle}
                    onChange={e => { setGivingSection({ ...givingSection, subtitle: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Action Button Text</label>
                  <input
                    type="text"
                    value={givingSection.buttonText}
                    onChange={e => { setGivingSection({ ...givingSection, buttonText: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full sm:w-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Management Info Box */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-white">Active Causes Database Synchronization</p>
                <p className="mt-1">
                  Individual fundraising campaigns (scholarship funds, AI lab gear, campus makerspace) are stored in the PostgreSQL database and managed live from the <strong>Donations &amp; Giving Desk</strong>. Any changes or new campaigns created there automatically sync to this homepage section.
                </p>
                <div className="mt-3">
                  <Link
                    to="/cms/donations"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#003366] dark:text-sky-400 hover:underline"
                  >
                    Manage Campaigns, Goals &amp; Donors in Donations Desk &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         9. ACCREDITATION & FAQ
      ══════════════════════════════════════════════════════════════════════ */
      case 'accreditation-faq':
        return (
          <div className="space-y-6">
            {/* Accreditation & QA Banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Quality Assurance & Accreditation Banner</h3>
                <p className="text-xs text-slate-500 mt-0.5">The gradient banner linking verified tracer data to national ETA accreditation requirements.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Eyebrow</label>
                  <input
                    type="text"
                    value={accreditation.eyebrow}
                    onChange={e => { setAccreditation({ ...accreditation, eyebrow: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-astu-red"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Banner Title</label>
                  <input
                    type="text"
                    value={accreditation.title}
                    onChange={e => { setAccreditation({ ...accreditation, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={accreditation.description}
                    onChange={e => { setAccreditation({ ...accreditation, description: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Callout Point 1 (Title & Text)</label>
                  <input
                    type="text"
                    value={accreditation.point1Title}
                    onChange={e => { setAccreditation({ ...accreditation, point1Title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={accreditation.point1Desc}
                    onChange={e => { setAccreditation({ ...accreditation, point1Desc: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Callout Point 2 (Title & Text)</label>
                  <input
                    type="text"
                    value={accreditation.point2Title}
                    onChange={e => { setAccreditation({ ...accreditation, point2Title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={accreditation.point2Desc}
                    onChange={e => { setAccreditation({ ...accreditation, point2Desc: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* FAQ Accordion Items */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Frequently Asked Questions ({faq.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage the questions and answers shown in the interactive FAQ accordion.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalState({
                      open: true,
                      title: 'Add New FAQ Question',
                      itemType: 'faq',
                      itemData: {
                        id: `FQ-${Date.now()}`,
                        question: 'How do alumni verify degrees through ASTU-AMS?',
                        answer: 'Graduates can log into their alumni portal and click "Request Credential Validation", which sends an automated inquiry directly to the Registrar SIS.',
                        category: 'General',
                        active: true,
                      },
                      onSave: newItem => {
                        setFaq(prev => [...prev, newItem]);
                        notifyChange();
                        toast.success('Added FAQ question');
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Question
                </button>
              </div>

              <div className="space-y-3">
                {faq.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-astu-red shrink-0" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{item.question}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setFaq(faq.map((f, i) => i === idx ? { ...f, active: !f.active } : f));
                            notifyChange();
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                            item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {item.active ? 'Active' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalState({
                              open: true,
                              title: 'Edit FAQ Item',
                              itemType: 'faq',
                              itemData: { ...item },
                              onSave: updated => {
                                setFaq(faq.map((f, i) => i === idx ? { ...f, ...updated } : f));
                                notifyChange();
                                toast.success('FAQ updated');
                              },
                            });
                          }}
                          className="text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this question?')) {
                              setFaq(faq.filter((_, i) => i !== idx));
                              notifyChange();
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-6">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ══════════════════════════════════════════════════════════════════════
         8. DETAIL PAGES MANAGER (ALL 22 /info/:slug PAGES)
      ══════════════════════════════════════════════════════════════════════ */
      case 'detail-pages': {
        const slugCategories: Record<string, string[]> = {
          portals: ['alumni-portal', 'employer-portal', 'department-portal', 'registrar-portal'],
          impact: ['overview', 'impact-numbers', 'accreditation', 'achievements'],
          campus: ['campus-life', 'facilities', 'events', 'gallery', 'video-gallery'],
          community: ['featured-employers', 'mentorship', 'community-feed'],
        };

        const allSlugs = Object.keys(detailPages);
        const filteredSlugs = allSlugs.filter(slug => {
          const page = detailPages[slug];
          const query = detailPageSearch.toLowerCase().trim();
          const matchesSearch = !query ||
            slug.toLowerCase().includes(query) ||
            (page?.title && page.title.toLowerCase().includes(query));
          
          if (!matchesSearch) return false;
          if (detailPageCategory === 'all') return true;
          return (slugCategories[detailPageCategory] || []).includes(slug);
        });

        return (
          <div className="space-y-6">
            {/* Page Selector & Summary Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-astu-navy/10 text-astu-navy dark:bg-sky-500/10 dark:text-sky-400 font-bold">
                      <FileText className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Institutional Detail Pages Editor</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Every text, section heading, and cover photo on all 22+ /info/... detail pages comes directly from here.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/info/${selectedDetailSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View /info/{selectedDetailSlug}</span>
                  </a>
                </div>
              </div>

              {/* Category Pills & Search */}
              <div className="mb-4 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
                  {[
                    { id: 'all', label: `All Pages (${allSlugs.length})`, icon: Layers3 },
                    { id: 'portals', label: 'Portals (4)', icon: Building2 },
                    { id: 'impact', label: 'Impact & QA (4)', icon: LineChart },
                    { id: 'campus', label: 'Campus Life (5)', icon: GraduationCap },
                    { id: 'community', label: 'Community (3)', icon: Handshake },
                  ].map(cat => {
                    const CatIcon = cat.icon;
                    return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setDetailPageCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        detailPageCategory === cat.id
                          ? 'bg-astu-navy text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1"><CatIcon className="h-3.5 w-3.5" /> {cat.label}</span>
                    </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search pages by title or slug (e.g. alumni-portal, events, impact)..."
                      value={detailPageSearch}
                      onChange={e => setDetailPageSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  {detailPageSearch && (
                    <button
                      type="button"
                      onClick={() => setDetailPageSearch('')}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Selection Chip Bar */}
                <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto">
                  {filteredSlugs.map(slug => {
                    const isSelected = selectedDetailSlug === slug;
                    const page = detailPages[slug];
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => setSelectedDetailSlug(slug)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'border-astu-navy bg-astu-navy/10 text-astu-navy dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-400 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{page?.title || slug}</span>
                        <span className="text-[10px] opacity-60 font-mono">/info/{slug}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector Dropdown / Search */}
              <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Detail Page</label>
                  <select
                    value={selectedDetailSlug}
                    onChange={e => setSelectedDetailSlug(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-astu-navy dark:text-sky-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
                  >
                    {allSlugs.map(slug => (
                      <option key={slug} value={slug}>
                        {detailPages[slug]?.title || slug} (/info/{slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Headline Title</label>
                  <input
                    type="text"
                    value={currentDetailPage.title}
                    onChange={e => updateCurrentDetailPage({ title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category Tag / Eyebrow</label>
                  <input
                    type="text"
                    placeholder="ASTU Institutional Resource"
                    value={currentDetailPage.badge || ''}
                    onChange={e => updateCurrentDetailPage({ badge: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Subtitle / Mission Statement</label>
                  <textarea
                    value={currentDetailPage.subtitle}
                    onChange={e => updateCurrentDetailPage({ subtitle: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <ImageUploader
                    label="Page Hero Cover Banner Image"
                    value={currentDetailPage.image}
                    onChange={url => updateCurrentDetailPage({ image: url })}
                  />
                </div>
              </div>
            </div>

            {/* Sections of this Detail Page */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Content Sections for &ldquo;{currentDetailPage.title}&rdquo; ({(currentDetailPage.sections || []).length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Every text, heading, section image, and link is completely manageable and customizable here.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSection: DetailPageSection = {
                      id: `SEC-${Date.now()}`,
                      heading: 'New Information Section',
                      body: 'Provide clear, factual ASTU institutional information for this topic.',
                      badge: 'Section Highlight',
                      active: true,
                    };
                    const updated = [...(currentDetailPage.sections || []), newSection];
                    updateCurrentDetailPage({ sections: updated });
                    toast.success('Section added to page');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy text-white px-3 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Section
                </button>
              </div>

              <div className="space-y-4">
                {(currentDetailPage.sections || []).map((sec, sIdx) => (
                  <div
                    key={sec.id || sIdx}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3.5 transition-all hover:border-[#003580]/30 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-astu-navy text-white text-[10px] font-bold">
                          {sIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {sec.heading || `Section #${sIdx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => {
                            const sections = [...currentDetailPage.sections];
                            const [item] = sections.splice(sIdx, 1);
                            sections.splice(sIdx - 1, 0, item);
                            updateCurrentDetailPage({ sections });
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move section up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={sIdx === currentDetailPage.sections.length - 1}
                          onClick={() => {
                            const sections = [...currentDetailPage.sections];
                            const [item] = sections.splice(sIdx, 1);
                            sections.splice(sIdx + 1, 0, item);
                            updateCurrentDetailPage({ sections });
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move section down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>

                        {/* Active toggle */}
                        <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 cursor-pointer ml-1">
                          <input
                            type="checkbox"
                            checked={sec.active !== false}
                            onChange={e => {
                              const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, active: e.target.checked } : s);
                              updateCurrentDetailPage({ sections: updated });
                            }}
                            className="rounded text-astu-navy"
                          />
                          <span>Active</span>
                        </label>

                        {/* Delete Section */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove section "${sec.heading}"?`)) {
                              const updated = currentDetailPage.sections.filter((_, i) => i !== sIdx);
                              updateCurrentDetailPage({ sections: updated });
                              toast.success('Section removed');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                          title="Delete Section"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Section Heading</label>
                        <input
                          type="text"
                          value={sec.heading}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, heading: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Section Tag / Badge</label>
                        <input
                          type="text"
                          placeholder="e.g. Core Pillar, Key Module"
                          value={sec.badge || ''}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, badge: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Paragraph Content & Details</label>
                      <textarea
                        value={sec.body}
                        onChange={e => {
                          const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, body: e.target.value } : s);
                          updateCurrentDetailPage({ sections: updated });
                        }}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-700 dark:text-slate-300 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 pt-1">
                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Section Image URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="https://... or /images/..."
                          value={sec.image || ''}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, image: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-700 dark:text-slate-300 font-mono"
                        />
                        {sec.image && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <img src={sec.image} alt="Preview" className="h-8 w-12 rounded object-cover border border-slate-200" />
                            <span className="text-[10px] text-emerald-600 font-semibold">Image attached</span>
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Action Button Label (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Learn More, Open Portal"
                          value={sec.linkText || ''}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, linkText: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-700 dark:text-slate-300"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Action Button URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. /login or /info/overview"
                          value={sec.linkUrl || ''}
                          onChange={e => {
                            const updated = currentDetailPage.sections.map((s, i) => i === sIdx ? { ...s, linkUrl: e.target.value } : s);
                            updateCurrentDetailPage({ sections: updated });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-700 dark:text-slate-300 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      /* ══════════════════════════════════════════════════════════════════════
         9. CTA & FOOTER DIRECTORY
      ══════════════════════════════════════════════════════════════════════ */
      case 'footer-cta':
        return (
          <div className="space-y-6">
            {/* Bottom CTA Banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Bottom Call-To-Action Banner</h3>
                  <p className="text-xs text-slate-500 mt-0.5">The gradient banner right above the footer inviting alumni and employers to join.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ctaSection.enabled !== false}
                    onChange={e => { setCtaSection({ ...ctaSection, enabled: e.target.checked }); notifyChange(); }}
                    className="h-4 w-4 rounded text-astu-navy cursor-pointer"
                  />
                  <span>{ctaSection.enabled !== false ? 'Enabled' : 'Hidden'}</span>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CTA Headline</label>
                  <input
                    type="text"
                    value={ctaSection.title}
                    onChange={e => { setCtaSection({ ...ctaSection, title: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CTA Subtitle</label>
                  <input
                    type="text"
                    value={ctaSection.description}
                    onChange={e => { setCtaSection({ ...ctaSection, description: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button 1 (Text & Link)</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={ctaSection.primaryCtaText}
                      onChange={e => { setCtaSection({ ...ctaSection, primaryCtaText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={ctaSection.primaryCtaLink}
                      onChange={e => { setCtaSection({ ...ctaSection, primaryCtaLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Button 2 (Text & Link)</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={ctaSection.secondaryCtaText}
                      onChange={e => { setCtaSection({ ...ctaSection, secondaryCtaText: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={ctaSection.secondaryCtaLink}
                      onChange={e => { setCtaSection({ ...ctaSection, secondaryCtaLink: e.target.value }); notifyChange(); }}
                      className="w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Information Directory */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Footer Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">Contact coordinates, office hours, and copyright details rendered across all public pages.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">About ASTU-AMS Statement</label>
                  <textarea
                    value={footer.aboutText}
                    onChange={e => { setFooter({ ...footer, aboutText: e.target.value }); notifyChange(); }}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campus Physical Address</label>
                  <input
                    type="text"
                    value={footer.address}
                    onChange={e => { setFooter({ ...footer, address: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Postal Box</label>
                  <input
                    type="text"
                    value={footer.poBox}
                    onChange={e => { setFooter({ ...footer, poBox: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Phone Support</label>
                  <input
                    type="text"
                    value={footer.phone}
                    onChange={e => { setFooter({ ...footer, phone: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Email</label>
                  <input
                    type="email"
                    value={footer.email}
                    onChange={e => { setFooter({ ...footer, email: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Working Office Hours</label>
                  <input
                    type="text"
                    value={footer.officeHours}
                    onChange={e => { setFooter({ ...footer, officeHours: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Copyright Line</label>
                  <input
                    type="text"
                    value={footer.copyrightText}
                    onChange={e => { setFooter({ ...footer, copyrightText: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Facebook URL</label>
                  <input
                    type="text"
                    value={footer.socialFacebook}
                    onChange={e => { setFooter({ ...footer, socialFacebook: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Telegram URL</label>
                  <input
                    type="text"
                    value={footer.socialTelegram}
                    onChange={e => { setFooter({ ...footer, socialTelegram: e.target.value }); notifyChange(); }}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* ── Links & Navigation Manager ── */}
            <div className="rounded-2xl border border-violet-200 dark:border-violet-800/40 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                <ExternalLink className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Links &amp; Navigation Manager</h3>
                <p className="text-xs text-slate-500 mt-0.5">Edit every hyperlink button text and destination URL on the homepage — no hardcoded links anywhere.</p>
              </div>
            </div>

            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-600 pb-2 pt-1"><Megaphone className="h-3.5 w-3.5" /> Announcement Ticker</p>
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ticker "Details" Link<span className="block text-[10px] font-normal text-slate-400">Small link at end of top bar</span></p>
                <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Button Text</label><input type="text" value={sectionLinks.tickerLinkText} onChange={e => updateSectionLink('tickerLinkText', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                  <input type="text" value={sectionLinks.tickerLinkTarget} onChange={e => updateSectionLink('tickerLinkTarget', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                  {sectionLinks.tickerLinkTarget?.startsWith('/info/') && (
                    <button type="button" onClick={() => navigateToDetailPage(sectionLinks.tickerLinkTarget)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                      <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                    </button>
                  )}
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-600 pb-2 pt-4"><Layers3 className="h-3.5 w-3.5" /> Portals / How It Works</p>
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Get Started Button<span className="block text-[10px] font-normal text-slate-400">Big CTA below the 4-step section</span></p>
                <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Button Text</label><input type="text" value={sectionLinks.portalsGetStartedText} onChange={e => updateSectionLink('portalsGetStartedText', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                  <input type="text" value={sectionLinks.portalsGetStartedLink} onChange={e => updateSectionLink('portalsGetStartedLink', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                  {sectionLinks.portalsGetStartedLink?.startsWith('/info/') && (
                    <button type="button" onClick={() => navigateToDetailPage(sectionLinks.portalsGetStartedLink)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                      <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                    </button>
                  )}
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-green-600 pb-2 pt-4"><CalendarDays className="h-3.5 w-3.5" /> Events Section</p>
              {([
                { label: '"See All Events" Button', note: 'Header button linking to all events', textKey: 'eventsViewAllText', urlKey: 'eventsViewAllLink' },
                { label: 'Event Card Register Button', note: 'Text on the Register button on each event card', textKey: 'eventsCardRegisterText', urlKey: 'eventsCardDetailsLink' },
                { label: 'Event Card Details Button', note: 'Text & link for the Details button', textKey: 'eventsCardDetailsText', urlKey: 'eventsCardDetailsLink' },
              ] as { label: string; note: string; textKey: keyof typeof defaultSectionLinks; urlKey: keyof typeof defaultSectionLinks }[]).map(row => (
                <div key={row.textKey} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.label}<span className="block text-[10px] font-normal text-slate-400">{row.note}</span></p>
                  <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Button Text</label><input type="text" value={sectionLinks[row.textKey]} onChange={e => updateSectionLink(row.textKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                    <input type="text" value={sectionLinks[row.urlKey]} onChange={e => updateSectionLink(row.urlKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                    {sectionLinks[row.urlKey]?.startsWith('/info/') && (
                      <button type="button" onClick={() => navigateToDetailPage(sectionLinks[row.urlKey])} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                        <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-600 pb-2 pt-4"><Bell className="h-3.5 w-3.5" /> Announcements Section</p>
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">"View All" Button<span className="block text-[10px] font-normal text-slate-400">Button in the announcements card header</span></p>
                <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Button Text</label><input type="text" value={sectionLinks.announcementsViewAllText} onChange={e => updateSectionLink('announcementsViewAllText', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                  <input type="text" value={sectionLinks.announcementsViewAllLink} onChange={e => updateSectionLink('announcementsViewAllLink', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                  {sectionLinks.announcementsViewAllLink?.startsWith('/info/') && (
                    <button type="button" onClick={() => navigateToDetailPage(sectionLinks.announcementsViewAllLink)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                      <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                    </button>
                  )}
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 pb-2 pt-4"><Building2 className="h-3.5 w-3.5" /> Footer — Resources &amp; Portals Column</p>
              {([
                { label: 'Career Portal Link', note: '1st item in Resources column', textKey: 'footerCareerPortalText', urlKey: 'footerCareerPortalLink' },
                { label: 'Tracer Survey Hub', note: '2nd item in Resources column', textKey: 'footerTracerHubText', urlKey: 'footerTracerHubLink' },
                { label: 'Mentorship Link', note: '3rd item in Resources column', textKey: 'footerMentorshipText', urlKey: 'footerMentorshipLink' },
                { label: 'Student Portal', note: '4th item — use full https:// for external URLs', textKey: 'footerStudentPortalText', urlKey: 'footerStudentPortalLink' },
              ] as { label: string; note: string; textKey: keyof typeof defaultSectionLinks; urlKey: keyof typeof defaultSectionLinks }[]).map(row => (
                <div key={row.textKey} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.label}<span className="block text-[10px] font-normal text-slate-400">{row.note}</span></p>
                  <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Link Text</label><input type="text" value={sectionLinks[row.textKey]} onChange={e => updateSectionLink(row.textKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                    <input type="text" value={sectionLinks[row.urlKey]} onChange={e => updateSectionLink(row.urlKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                    {sectionLinks[row.urlKey]?.startsWith('/info/') && (
                      <button type="button" onClick={() => navigateToDetailPage(sectionLinks[row.urlKey])} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                        <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 pb-2 pt-4"><ShieldCheck className="h-3.5 w-3.5" /> Footer — Accreditation Support Column</p>
              {([
                { label: 'Quality Assurance Link', note: '1st item in Accreditation column', textKey: 'footerQualityAssuranceText', urlKey: 'footerQualityAssuranceLink' },
                { label: 'Accreditation Outcomes', note: '2nd item in Accreditation column', textKey: 'footerAccreditationOutcomesText', urlKey: 'footerAccreditationOutcomesLink' },
                { label: 'Institutional Research', note: '3rd item in Accreditation column', textKey: 'footerInstitutionalResearchText', urlKey: 'footerInstitutionalResearchLink' },
              ] as { label: string; note: string; textKey: keyof typeof defaultSectionLinks; urlKey: keyof typeof defaultSectionLinks }[]).map(row => (
                <div key={row.textKey} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-3 items-center py-3">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.label}<span className="block text-[10px] font-normal text-slate-400">{row.note}</span></p>
                  <div><label className="text-[10px] text-slate-400 font-semibold uppercase">Link Text</label><input type="text" value={sectionLinks[row.textKey]} onChange={e => updateSectionLink(row.textKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs" /></div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Destination URL</label>
                    <input type="text" value={sectionLinks[row.urlKey]} onChange={e => updateSectionLink(row.urlKey, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono" />
                    {sectionLinks[row.urlKey]?.startsWith('/info/') && (
                      <button type="button" onClick={() => navigateToDetailPage(sectionLinks[row.urlKey])} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-astu-navy dark:text-sky-400 hover:underline">
                        <Edit3 className="h-3 w-3" /> Edit this page's content in Detail Pages Manager →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        );

      default:
        return null;
    }
  };

  /* ──────────────────────────────────────────────────────────────────────────
     UNIVERSAL MODAL FORM HANDLER
  ────────────────────────────────────────────────────────────────────────── */
  const renderModalForm = () => {
    if (!modalState.itemData) return null;
    const { itemType, itemData } = modalState;

    if (itemType === 'hero-slide') {
      return (
        <div className="space-y-4">
          <ImageUploader
            label="Slide Image"
            value={itemData.image || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, image: url } }))}
            album="Hero Banners"
          />
          <div>
            <label className="text-xs font-bold text-slate-700">Tagline Eyebrow</label>
            <input
              type="text"
              value={itemData.tagline || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, tagline: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Slide Main Headline</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Slide Paragraph Description</label>
            <textarea
              value={itemData.description || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, description: e.target.value } }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs resize-none"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'impact-stat') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Numeric Value</label>
              <input
                type="text"
                value={itemData.value || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, value: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
                placeholder="e.g. 1,238 or 87"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Suffix Symbol</label>
              <input
                type="text"
                value={itemData.suffix || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, suffix: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
                placeholder="e.g. + or %"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Metric Label</label>
            <input
              type="text"
              value={itemData.label || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, label: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Detail Note</label>
            <input
              type="text"
              value={itemData.detail || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, detail: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Target Route Link</label>
            <input
              type="text"
              value={itemData.target || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, target: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'portal') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Card Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Bullet Points (one per line)</label>
            <textarea
              value={itemData.pointsString || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, pointsString: e.target.value } }))}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">CTA Button Text</label>
              <input
                type="text"
                value={itemData.cta || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, cta: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Target Route</label>
              <input
                type="text"
                value={itemData.route || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, route: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'campus-card') {
      return (
        <div className="space-y-4">
          <ImageUploader
            label="Card Photo"
            value={itemData.image || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, image: url } }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Campus Location Badge</label>
              <input
                type="text"
                value={itemData.campus || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, campus: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-astu-red"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Title</label>
              <input
                type="text"
                value={itemData.title || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              value={itemData.description || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, description: e.target.value } }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Button Text</label>
              <input
                type="text"
                value={itemData.action || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, action: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Destination Route Link</label>
              <input
                type="text"
                value={itemData.link || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, link: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'event') {
      return (
        <div className="space-y-4">
          <ImageUploader
            label="Event Cover Image"
            value={itemData.image || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, image: url } }))}
          />
          <div>
            <label className="text-xs font-bold text-slate-700">Event Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Date Display Text</label>
              <input
                type="text"
                value={itemData.date || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, date: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Location / Venue</label>
              <input
                type="text"
                value={itemData.location || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, location: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'announcement') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Notice Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Date</label>
              <input
                type="text"
                value={itemData.date || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, date: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Category / Type</label>
              <input
                type="text"
                value={itemData.type || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, type: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'story' || itemType === 'communityPost') {
      return (
        <div className="space-y-4">
          <ImageUploader
            label="Alumnus / Partner Photo"
            value={itemData.image || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, image: url } }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={itemData.name || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, name: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Designation / Role</label>
              <input
                type="text"
                value={itemData.role || ''}
                onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, role: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-astu-green"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Quote / Success Testimonial</label>
            <textarea
              value={itemData.text || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, text: e.target.value } }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'faq') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Question</label>
            <input
              type="text"
              value={itemData.question || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, question: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Answer</label>
            <textarea
              value={itemData.answer || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, answer: e.target.value } }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'benefit') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Benefit Card Title</label>
            <input
              type="text"
              value={itemData.title || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              value={itemData.description || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, description: e.target.value } }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs resize-none"
            />
          </div>
        </div>
      );
    }

    if (itemType === 'partner') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Partner / Company Name *</label>
            <input
              type="text"
              required
              value={itemData.name || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, name: e.target.value } }))}
              placeholder="e.g. Ethiopian Airlines Group"
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <ImageUploader
            label="Upload Partner Logo Image"
            value={itemData.logo || ''}
            onChange={url => setModalState(p => ({ ...p, itemData: { ...p.itemData, logo: url } }))}
          />

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Or Enter Logo Image URL / Path</label>
            <input
              type="text"
              value={itemData.logo || ''}
              onChange={e => setModalState(p => ({ ...p, itemData: { ...p.itemData, logo: e.target.value } }))}
              placeholder="e.g. /images/partners/ethiopian-airlines.svg or https://..."
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Ethiopian Airlines', path: '/images/partners/ethiopian-airlines.svg' },
                { name: 'Ethio Telecom', path: '/images/partners/ethio-telecom.png' },
                { name: 'Safaricom', path: '/images/partners/safaricom.png' },
                { name: 'Huawei', path: '/images/partners/huawei.svg' },
                { name: 'CBE', path: '/images/partners/cbe.png' },
                { name: 'INSA', path: '/images/partners/insa.png' },
              ].map(preset => (
                <button
                  key={preset.path}
                  type="button"
                  onClick={() => setModalState(p => ({
                    ...p,
                    itemData: {
                      ...p.itemData,
                      logo: preset.path,
                      name: p.itemData.name || preset.name,
                    },
                  }))}
                  className="px-2 py-1 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  /* ──────────────────────────────────────────────────────────────────────────
     MAIN COMPONENT RETURN
  ────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* ── Top Header & Actions ── */}
      <AdminPageHeader
        title="Pages & Homepage CMS"
        subtitle="Manage homepage sections, Overview, Contact Us, and all 22+ institutional pages in one unified workspace."
        breadcrumbs={[{ label: 'Content Management' }, { label: 'Pages & Homepage CMS' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40 px-2.5 py-1 text-xs font-bold animate-pulse">
                <AlertCircle className="h-3.5 w-3.5" />
                Unsaved Edits
              </span>
            )}

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isReloading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer disabled:opacity-50"
              title="Discard unsaved changes and reload from backend"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isReloading ? 'animate-spin' : ''}`} />
              <span>Reload DB</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-[#FFCC00]" />
              <span>Public Site</span>
              <ExternalLink className="h-3 w-3 opacity-75" />
            </a>

            <button
              type="button"
              onClick={() => handleSaveAll(true)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFCC00] hover:bg-[#FFD633] text-[#003366] px-4 py-2 text-xs font-bold transition-all shadow-md hover:scale-102 cursor-pointer disabled:opacity-50"
            >
              <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving to Database...' : 'Save to Backend'}</span>
            </button>
          </div>
        }
      />

      {/* ── Studio Control Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-xs">
        {/* Left: sync badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${hasUnsavedChanges ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {hasUnsavedChanges ? 'Unsaved edits' : 'Live & Synced'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Last saved: {lastSyncTime}</span>
          <span className="text-[11px] text-slate-400 hidden md:inline">· {totalActiveItems} live items</span>
        </div>

        {/* Center: viewport switcher */}
        <div className="hidden sm:flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
          {([['desktop', Monitor, 'Desktop'], ['tablet', Tablet, 'Tablet'], ['mobile', Smartphone, 'Mobile']] as const).map(([view, Icon, label]) => (
            <button
              key={view}
              type="button"
              onClick={() => setDeviceView(view)}
              title={label}
              className={`rounded-lg p-1.5 transition-all cursor-pointer ${
                deviceView === view ? 'bg-[#003366] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Open Live</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isReloading}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Reload from database"
          >
            <RefreshCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => handleSaveAll(true)}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
              hasUnsavedChanges ? 'bg-rose-600 hover:bg-rose-500 ring-2 ring-rose-400/40' : 'bg-[#003366] hover:bg-[#002244] dark:bg-sky-600'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving…' : hasUnsavedChanges ? 'Save Changes *' : 'Published Live'}</span>
          </button>
        </div>
      </div>

      {/* ── SPLIT STUDIO CONTAINER: SIDEBAR ON LEFT, LIVE PREVIEW ON RIGHT ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ── LEFT PANE: DOCKED SIDEBAR EDITOR CONTROLS ── */}
        <div className="w-full lg:w-[480px] shrink-0 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden sticky top-4">
          {/* Sidebar Top Nav Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60 overflow-x-auto scrollbar-none gap-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#003366] shadow-xs ring-1 ring-slate-200 dark:bg-slate-900 dark:text-sky-300 dark:ring-slate-700'
                      : 'text-slate-500 hover:bg-slate-200/60 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Section Info Banner */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-50 to-white dark:from-sky-950/30 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#003366] dark:text-sky-300">{CATEGORIES.find(c => c.id === activeCategory)?.label}</p>
              <p className="text-[10px] text-slate-500 truncate">{CATEGORIES.find(c => c.id === activeCategory)?.desc}</p>
            </div>
          </div>

          {/* Sidebar Body Content with Scroll */}
          <div className="overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-260px)]">
            {renderCategoryContent()}
          </div>

          {/* Sidebar Footer Quick Action */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 select-none">
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px] font-mono text-slate-600 dark:text-slate-300">Ctrl+S</kbd>
              to save changes
            </p>
            <button
              type="button"
              onClick={() => handleSaveAll(true)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] hover:bg-[#002244] text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving…' : 'Save Section'}</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT PANE: LIVE PREVIEW CANVAS ── */}
        <div className="flex-1 min-w-0 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col">
          {/* Live Preview Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Interactive Live Preview — Homepage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 capitalize">{deviceView} View</span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950">
            <HomepageLivePreviewCanvas
              deviceView={deviceView}
              activeSection={activeCategory}
              welcomeMessage={welcomeMessage}
              welcomeEnabled={welcomeEnabled}
              heroBadge={heroBadge}
              heroButtons={heroButtons}
              heroSlides={heroSlides}
              impactHeaders={impactHeaders}
              impactStats={impactStats}
              portalsHeaders={portalsHeaders}
              portals={portals}
              campusLifeHeaders={campusLifeHeaders}
              campusLife={campusLife}
              campuses={campuses}
              gallery={gallery}
              galleryHeaders={galleryHeaders}
              eventsHeaders={eventsHeaders}
              events={events}
              workshops={workshops}
              announcementsHeaders={announcementsHeaders}
              announcements={announcements}
              newsItems={newsItems}
              partnersHeaders={partnersHeaders}
              partners={partners}
              accreditation={accreditation}
              faqHeaders={{
                eyebrow: faqHeaders.eyebrow,
                title: faqHeaders.title,
                subtitle: faqHeaders.description,
                description: faqHeaders.description,
              }}
              faq={faq}
              ctaSection={{
                enabled: ctaSection.enabled,
                title: ctaSection.title,
                subtitle: ctaSection.description,
                primaryText: ctaSection.primaryCtaText,
                primaryLink: ctaSection.primaryCtaLink,
                secondaryText: ctaSection.secondaryCtaText,
                secondaryLink: ctaSection.secondaryCtaLink,
              }}
              footer={{
                address: footer.address,
                phone: footer.phone,
                email: footer.email,
                poBox: footer.poBox,
                copyright: footer.copyrightText,
              }}
              detailPages={detailPages}
              selectedDetailSlug={selectedDetailSlug}
              onSectionClick={(secId) => {
                if (secId) setActiveCategory(secId as CmsCategory);
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Edit Item Modal ── */}
      <AdminModal
        open={modalState.open}
        title={modalState.title}
        onClose={closeModal}
        size="lg"
      >
        <div className="p-1 space-y-4">
          {renderModalForm()}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (modalState.onSave && modalState.itemData) {
                  modalState.onSave(modalState.itemData);
                  closeModal();
                }
              }}
              className="rounded-lg bg-astu-navy px-5 py-2 text-xs font-bold text-white hover:brightness-110 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
