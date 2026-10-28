import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Globe,
  Handshake,
  LineChart,
  ShieldCheck,
  Users,
  BarChart3,
  Bell,
  FileCheck2,
  FileText,
  HelpCircle,
  Image,
  LockKeyhole,
  MessageSquareText,
  MapPin,
  PlayCircle,
  Quote,
  Star,
  Trophy,
  UserRoundCheck,
  Phone,
  Mail,
  CircleUserRound,
  CheckCircle2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Pause,
  Play,
  Share2,
  Heart,
  LogIn,
  UserPlus,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatBot from "../components/ChatBot";
import ShareCampaignModal from "../components/ShareCampaignModal";
import ShareModal, { ShareItem } from "../components/ShareModal";
import TelebirrDonationModal from "../components/TelebirrDonationModal";
import VideoDetailModal from "../components/VideoDetailModal";
import { partnerLogos } from "../components/PartnerLogos";
import eventsService from "../features/admin/services/events.service";
import contentService from "../features/admin/services/content.service";
import storiesService from "../features/admin/services/stories.service";
import homepageCmsService, {
  Partner,
  defaultSectionLinks as cmsDefaultSectionLinks,
} from "../features/admin/services/homepageCms.service";
import publicStatsService, { PublicStat } from "../features/public/services/publicStats.service";
import config from "../config";

const { mediaUrl } = config;
import footerCmsService, { FooterCmsConfig, defaultFooterConfig } from "../features/admin/services/footerCms.service";
import astuBuildingImg from "../assets/imgs/astu-building.jpg";

const FALLBACK_IMAGE = "/images/fallback-campus.svg";
const DEFAULT_HERO_IMAGE = astuBuildingImg;
const DEFAULT_HERO_SLIDES = [
  {
    id: "default-hero-campus",
    image: DEFAULT_HERO_IMAGE,
    tagline: "ASTU-AMS",
    title: "Alumni Management System",
    description: "Connecting ASTU graduates, employers, and academic departments in one verified network.",
  },
  {
    id: "default-hero-innovation",
    image: "/images/campus-2.jpeg",
    tagline: "ASTU Community",
    title: "Connecting Talent, Industry, and Innovation",
    description: "Discover opportunities, strengthen professional networks, and contribute to ASTU's future.",
  },
  {
    id: "default-hero-research",
    image: "/images/arc.jpg",
    tagline: "Career and Community",
    title: "Build Your Next Chapter with ASTU",
    description: "Access career services, alumni programs, and university-wide connections in one place.",
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Building2, LineChart, FileCheck2, MessageSquareText, Briefcase, LockKeyhole, Globe, BookOpen, Star, Handshake, ShieldCheck, Trophy, CircleUserRound, Search,
};

const howItWorksSteps = [
  {
    step: 1,
    icon: CircleUserRound,
    title: "Create Your Profile",
    description:
      "Sign up and build your professional profile. Add your graduation details, skills, work experience, and career interests to get started.",
    color: "from-astu-navy to-[#1a4f8a]",
    iconBg: "bg-astu-navy/10 text-astu-navy",
  },
  {
    step: 2,
    icon: Search,
    title: "Discover Opportunities",
    description:
      "Browse verified job listings, internship postings, and mentorship programs tailored to your expertise and career goals.",
    color: "from-astu-red to-[#c0392b]",
    iconBg: "bg-astu-red/10 text-astu-red",
  },
  {
    step: 3,
    icon: Handshake,
    title: "Connect & Collaborate",
    description:
      "Network with fellow alumni, engage with employers, and participate in community events that advance your professional journey.",
    color: "from-astu-green to-[#1e8449]",
    iconBg: "bg-astu-green/10 text-astu-green",
  },
  {
    step: 4,
    icon: LineChart,
    title: "Grow & Give Back",
    description:
      "Complete tracer surveys, mentor current students, and contribute to curriculum development that shapes the next generation.",
    color: "from-amber-600 to-amber-800",
    iconBg: "bg-amber-100 text-amber-800",
  },
];

/**
 * Presentation for the server-computed impact figures. The server owns the
 * numbers; this map only supplies the label, icon and accent for each key.
 */
const STAT_PRESENTATION: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string }>; accent: string }
> = {
  alumni: {
    label: 'Active Alumni',
    Icon: Users,
    accent: 'text-astu-navy bg-astu-navy/10 dark:text-sky-400 dark:bg-sky-500/15',
  },
  employers: {
    label: 'Verified Employers',
    Icon: Building2,
    accent: 'text-astu-green bg-astu-green/10 dark:text-emerald-400 dark:bg-emerald-500/15',
  },
  jobs: {
    label: 'Open Roles',
    Icon: Briefcase,
    accent: 'text-astu-red bg-astu-red/10 dark:text-rose-400 dark:bg-rose-500/15',
  },
  departments: {
    label: 'Departments',
    Icon: Trophy,
    accent: 'text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/15',
  },
  events: {
    label: 'Events',
    Icon: CalendarDays,
    accent: 'text-sky-600 bg-sky-500/10 dark:text-sky-300 dark:bg-sky-500/15',
  },
  verified: {
    label: 'Verified Profiles',
    Icon: ShieldCheck,
    accent: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-500/15',
  },
  employment: {
    label: 'Employment Rate',
    Icon: TrendingUp,
    accent: 'text-astu-navy bg-astu-navy/10 dark:text-sky-400 dark:bg-sky-500/15',
  },
  requests: {
    label: 'Service Requests',
    Icon: MessageSquareText,
    accent: 'text-rose-600 bg-rose-500/10 dark:text-rose-300 dark:bg-rose-500/15',
  },
};

const navSections = [
  { label: "Home", id: "home" },
  { label: "Impact", id: "impact-numbers" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Campus Life", id: "campus-life" },
  { label: "Events", id: "events" },
  { label: "News", id: "news" },
  { label: "Gallery", id: "gallery" },
  { label: "Video Gallery", id: "video-gallery" },
  { label: "Stories", id: "success-stories" },
  { label: "Giving", id: "giving" },
  { label: "Partners", id: "partners" },
  { label: "FAQ", id: "faq" },
  { label: "Community", id: "community" },
  { label: "Contact", id: "contact" }
];

/** Soft defaults so Campus Life / FAQ / Network voices stay visible when CMS has not published yet */
export const DEFAULT_CAMPUS_LIFE = [
  {
    id: 'CL-1',
    title: 'Student Clubs & Chapters',
    campus: 'Main Campus',
    description: 'Professional societies, cultural clubs, and alumni chapters that keep graduates connected to campus.',
    image: '/images/astusteam.jpg',
    action: 'Explore Campus Life',
    link: '/info/campus-life',
    active: true,
  },
  {
    id: 'CL-2',
    title: 'Facilities & Innovation Spaces',
    campus: 'Innovation Spaces',
    description: 'Laboratories, research centers, libraries, student services, and employer interview rooms.',
    image: '/images/electriclabs.jpeg',
    action: 'Explore Facilities',
    link: '/info/facilities',
    active: true,
  },
  {
    id: 'CL-3',
    title: 'Sports & Cultural Life',
    campus: 'Campus Grounds',
    description: 'Athletics, arts, and community gatherings that shape everyday life across ASTU campuses.',
    image: '/images/arc.jpg',
    action: 'Learn More',
    link: '/info/campus-life',
    active: true,
  },
];

export const DEFAULT_GALLERY_IMAGES = [
  { id: 'GI-1', title: 'ASTU Main Campus Architecture', src: '/images/astu-building.jpg', album: 'Campus Gallery', date: 'June 2026', active: true },
  { id: 'GI-2', title: 'Campus Walkway & Innovation Hub', src: '/images/campus-2.jpeg', album: 'Campus Gallery', date: 'May 2026', active: true },
  { id: 'GI-3', title: 'Advanced Electrical & Robotics Labs', src: '/images/electriclabs.jpeg', album: 'Research Gallery', date: 'May 2026', active: true },
  { id: 'GI-4', title: 'Research & Innovation Arc', src: '/images/arc.jpg', album: 'Research Gallery', date: 'April 2026', active: true },
  { id: 'GI-5', title: 'Graduation & Assembly Hall', src: '/images/gc7.jpg', album: 'Graduation Gallery', date: 'March 2026', active: true },
  { id: 'GI-6', title: 'University Main Gate & Entrance', src: '/images/astuget.jpg', album: 'Campus Gallery', date: 'February 2026', active: true },
];

export const DEFAULT_VIDEO_HIGHLIGHTS = [
  {
    id: 'VI-1',
    title: 'ASTU Campus Highlights & Academic Excellence',
    subtitle: 'A guided aerial and ground visual tour of laboratories, student hubs, and campus facilities.',
    image: '/images/astu-building.jpg',
    duration: '04:28',
    category: 'Campus Virtual Tours',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    active: true,
  },
  {
    id: 'VI-2',
    title: 'Annual Applied Research & Innovation Forum',
    subtitle: 'Keynote presentations, robotics exhibitions, and industry-sponsored engineering projects.',
    image: '/images/arc.jpg',
    duration: '06:15',
    category: 'Research Showcases',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    active: true,
  },
  {
    id: 'VI-3',
    title: 'ASTU Grand Graduation & Alumni Replay',
    subtitle: 'Celebration of graduating classes, honorary guest addresses, and alumni leadership awards.',
    image: '/images/gc7.jpg',
    duration: '08:42',
    category: 'Event Recordings',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    active: true,
  },
];

export const DEFAULT_FAQ = [
  {
    id: 'FAQ-1',
    question: 'Who can use ASTU-AMS?',
    answer: 'Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services.',
    active: true,
  },
  {
    id: 'FAQ-2',
    question: 'How are tracer studies used?',
    answer: 'Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence.',
    active: true,
  },
  {
    id: 'FAQ-3',
    question: 'Can employers register events?',
    answer: 'Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports.',
    active: true,
  },
  {
    id: 'FAQ-4',
    question: 'How does Alumni Giving work?',
    answer: 'Alumni and partners can contribute directly via Chapa, Telebirr, and CBE to verified departmental, research, and scholarship campaigns with transparent receipts.',
    active: true,
  },
];

export const DEFAULT_NETWORK_VOICES = [
  {
    id: 'network-voice-1',
    name: 'Dr. Ruth Alemu',
    role: 'Lead AI Researcher',
    company: 'Ethiopian Artificial Intelligence Institute',
    message: 'ASTU gave me the computational rigor and research mindset that propelled my career in machine learning. Staying connected through ASTU-AMS keeps our alumni knowledge exchange alive.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    source: 'testimonial' as const,
  },
  {
    id: 'network-voice-2',
    name: 'Eng. Yonas Bekele',
    role: 'Senior Embedded Systems Engineer',
    company: 'Ethio Telecom',
    message: 'The hands-on lab projects and industry linkages at ASTU prepared our cohort to design mission-critical telecommunications infrastructure across East Africa.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    source: 'community' as const,
  },
  {
    id: 'network-voice-3',
    name: 'Kalkidan Tadesse',
    role: 'Fintech Innovation Lead',
    company: 'Commercial Bank of Ethiopia',
    message: 'Mentoring junior ASTU graduates through AMS has been an incredible experience. The university continues to cultivate world-class software engineers and innovators.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    source: 'story' as const,
  },
];

const getHomeCampaignImage = (campaign: any) => {
  if (campaign?.image && typeof campaign.image === 'string' && campaign.image.trim() !== '') {
    return mediaUrl(campaign.image) || campaign.image;
  }
  const cat = (campaign?.category || '').toLowerCase();
  const title = (campaign?.title || '').toLowerCase();
  if (title.includes('scholarship') || cat.includes('scholarship')) return '/images/gc7.jpg';
  if (title.includes('solar') || title.includes('energy') || cat.includes('research')) return '/images/arc.jpg';
  if (title.includes('robot') || title.includes('innovation') || cat.includes('innovation')) return '/images/astusteam.jpg';
  if (title.includes('lab') || title.includes('equipment')) return '/images/electriclabs.jpeg';
  if (title.includes('welfare') || title.includes('emergency')) return '/images/campus-2.jpeg';
  return '/images/astu-building.jpg';
};

export const getEmbedVideoUrl = (link?: string) => {
  if (!link) return null;
  const ytMatch = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  const vimeoMatch = link.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return link;
};

/** Minimal empty fallbacks — real content/images come from Homepage CMS */
const emptyCampuses: any[] = [];
const emptyGallery: any[] = [];
const emptyImpactStats: any[] = [];

export interface EventItem {
  id: string;
  title: string;
  category: string;
  type: string;
  kind: 'Event' | 'Workshop';
  date: string;
  time?: string;
  location: string;
  campus?: string;
  description: string;
  image: string;
  speaker?: string;
  seats?: string;
  statusBadge?: string;
  level?: string;
}

/** Showcase demo events removed — homepage lists only CMS/API-published events. */

const getNewsCategoryMeta = (item: any) => {
  const t = ((item?.title || '') + ' ' + (item?.category || '')).toLowerCase();
  if (t.includes('safety') || t.includes('notice') || t.includes('break') || t.includes('security')) {
    return {
      label: 'CAMPUS NOTICE',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
      dotClass: 'bg-rose-500',
    };
  }
  if (t.includes('grant') || t.includes('research')) {
    return {
      label: 'RESEARCH & GRANTS',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
      dotClass: 'bg-emerald-500',
    };
  }
  if (t.includes('summit') || t.includes('innovation') || t.includes('tech') || t.includes('engineering')) {
    return {
      label: 'INNOVATION & TECH',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50',
      dotClass: 'bg-indigo-500',
    };
  }
  if (t.includes('daad') || t.includes('workshop') || t.includes('nations') || t.includes('global') || t.includes('delegate')) {
    return {
      label: 'GLOBAL OUTREACH',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50',
      dotClass: 'bg-sky-500',
    };
  }
  if (t.includes('alumni') || t.includes('spotlight') || t.includes('graduat') || t.includes('medal')) {
    return {
      label: 'ALUMNI SPOTLIGHT',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
      dotClass: 'bg-amber-500',
    };
  }
  return {
    label: 'OFFICIAL DISPATCH',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotClass: 'bg-astu-navy',
  };
};

const EmptySection = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-dashed border-outline-variant dark:border-slate-600 bg-white/60 dark:bg-slate-800/40 px-6 py-10 text-center">
    <p className="text-sm text-on-surface-variant dark:text-slate-400">{message}</p>
  </div>
);


const formatHomepageDate = (value?: string | null) => {
  if (!value) return 'Date to be announced';
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function HomePage() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [liveEvents, setLiveEvents] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.events?.length) {
      const active = cmsConfig.events.filter((e: any) => e.active);
      if (active.length) return active;
    }
    return [];
  });
  const [liveWorkshops, setLiveWorkshops] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.workshops?.length) {
      const active = cmsConfig.workshops.filter((w: any) => w.active);
      if (active.length) return active;
    }
    return [];
  });
  const [liveNews, setLiveNews] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.newsItems?.length) {
      const active = cmsConfig.newsItems.filter((n: any) => n.active);
      if (active.length) return active;
    }
    const published = contentService.getPublishedNews();
    return published.length ? published : [];
  });
  const [liveAnnouncements, setLiveAnnouncements] = useState<any[]>(() => {
    const published = contentService.getPublishedAnnouncements();
    if (published && published.length > 0) return published;
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.announcements?.length) {
      const active = cmsConfig.announcements.filter((a: any) => a.active);
      if (active.length) return active;
    }
    return [];
  });
  const [liveStories, setLiveStories] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.stories?.length) {
      const active = cmsConfig.stories.filter((s: any) => s.active !== false);
      if (active.length) return storiesService.fromConfig(active);
    }
    // Do not seed fabricated localStorage stories on the public homepage.
    return [];
  });
  const [donationCampaigns, setDonationCampaigns] = useState<any[]>([]);
  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState<any | null>(null);
  const [isDonationAuthModalOpen, setIsDonationAuthModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationPayMethod, setDonationPayMethod] = useState<'telebirr' | 'cbe' | 'card'>('telebirr');
  const [shareModalCampaign, setShareModalCampaign] = useState<any | null>(null);
  const [sharePageContent, setSharePageContent] = useState<any | null>(null);
  const [shareStoryModalItem, setShareStoryModalItem] = useState<ShareItem | null>(null);

  const donationDashboardPath = (campaignId?: string) => {
    const params = new URLSearchParams({ tab: 'donations' });
    if (campaignId) params.set('campaign', campaignId);
    return `/alumni/dashboard?${params.toString()}`;
  };

  const loginForDonation = (campaignId?: string) => {
    navigate(`/login?redirect=${encodeURIComponent(donationDashboardPath(campaignId))}`);
  };

  const handleDonateClick = (campaign: any) => {
    setSelectedDonationCampaign(campaign);
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    let user: any = null;
    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch {}

    if (token && user?.role?.toUpperCase() === 'ALUMNI') {
      navigate(donationDashboardPath(campaign.id));
    } else {
      setIsDonationAuthModalOpen(true);
    }
  };
  const [homeDonationCategory, setHomeDonationCategory] = useState('ALL');
  const [showAllHomeDonations, setShowAllHomeDonations] = useState(false);
  const [liveSlides, setLiveSlides] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.heroSlides?.length) {
      const active = cmsConfig.heroSlides.filter((s: any) => s.active);
      if (active.length) return active;
    }
    return [];
  });
  const [liveStats, setLiveStats] = useState<PublicStat[]>([]);
  const [livePortals, setLivePortals] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.portals?.length) {
      const active = config.portals.filter((p: any) => p.active);
      if (active.length) return active;
    }
    return howItWorksSteps;
  });
  const [liveCampusLife, setLiveCampusLife] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (Array.isArray(config?.campusLife) && config.campusLife.length > 0) {
      const active = config.campusLife.filter((c: any) => c.active !== false);
      if (active.length > 0) return active;
    }
    return DEFAULT_CAMPUS_LIFE;
  });
  const [liveCampuses, setLiveCampuses] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.campuses?.length) {
      const active = config.campuses.filter((c: any) => c.active);
      if (active.length) return active;
    }
    return emptyCampuses;
  });
  const [industryBridge, setIndustryBridge] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return config?.industryBridge?.enabled === false ? null : config?.industryBridge || null;
  });
  const [liveGallery, setLiveGallery] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.gallery?.length) {
      const active = config.gallery.filter((g: any) => g.active !== false);
      if (active.length) return active;
    }
    return DEFAULT_GALLERY_IMAGES;
  });
  const [galleryFilterTab, setGalleryFilterTab] = useState<string>('ALL');
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<any | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const filteredGalleryList = useMemo(() => {
    if (galleryFilterTab === 'ALL') return liveGallery;
    return liveGallery.filter((item: any) =>
      String(item.album || 'Campus Gallery')
        .toLowerCase()
        .includes(galleryFilterTab.toLowerCase())
    );
  }, [liveGallery, galleryFilterTab]);

  // CMS items may carry a real publication timestamp. When they do, show the
  // newest three on the landing page; otherwise retain the curator's order.
  const featuredGallery = useMemo(() => {
    const datedItems = liveGallery
      .map((item, index) => ({
        item,
        index,
        timestamp: Date.parse(item.createdAt || item.updatedAt || item.date || item.uploadedAt || ''),
      }));
    const hasDates = datedItems.some(({ timestamp }) => !Number.isNaN(timestamp));

    return (hasDates
      ? datedItems.sort((a, b) => {
          const aTime = Number.isNaN(a.timestamp) ? 0 : a.timestamp;
          const bTime = Number.isNaN(b.timestamp) ? 0 : b.timestamp;
          return bTime - aTime || a.index - b.index;
        })
      : datedItems
    ).slice(0, 3).map(({ item }) => item);
  }, [liveGallery]);

  const [liveVideos, setLiveVideos] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.videos?.length) {
      const active = config.videos.filter((v: any) => v.active !== false);
      if (active.length) return active;
    }
    return DEFAULT_VIDEO_HIGHLIGHTS;
  });
  const [activeVideoModalItem, setActiveVideoModalItem] = useState<any | null>(null);
  const [shareMediaModalItem, setShareMediaModalItem] = useState<ShareItem | null>(null);
  const [livePartners, setLivePartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [failedPartnerLogos, setFailedPartnerLogos] = useState<Set<string>>(() => new Set());
  const [liveFaq, setLiveFaq] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (Array.isArray(config?.faq) && config.faq.length > 0) {
      const active = config.faq.filter((f: any) => f.active !== false);
      if (active.length > 0) return active;
    }
    return DEFAULT_FAQ;
  });
  const [liveCommunityPosts, setLiveCommunityPosts] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (Array.isArray(config?.communityPosts)) {
      return config.communityPosts.filter((p: any) => p.active !== false);
    }
    if (Array.isArray(config?.liveCommunityPosts)) {
      return config.liveCommunityPosts.filter((p: any) => p.active !== false);
    }
    return [];
  });
  const [liveCommunitySection, setLiveCommunitySection] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return (
      config?.liveCommunitySection || {
        title: 'ASTU Alumni Community',
        subtitle:
          'Connect with graduates worldwide, share opportunities, and help grow the Adama Science and Technology University alumni network.',
      }
    );
  });
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [liveTestimonials, setLiveTestimonials] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.testimonials?.length) {
      const active = config.testimonials.filter((t: any) => t.active !== false);
      if (active.length) return active;
    }
    return [];
  });
  const [mentorshipStats, setMentorshipStats] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return config?.mentorshipStats?.enabled ? config.mentorshipStats : null;
  });
  const [welcomeMessage, setWelcomeMessage] = useState(() => {
    const config = homepageCmsService.getSettings();
    return config?.welcomeMessage || '';
  });
  const [tracerSpotlight, setTracerSpotlight] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return config?.tracerSpotlight?.enabled ? config.tracerSpotlight : null;
  });
  const [employerFeedback, setEmployerFeedback] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return config?.employerFeedback?.enabled ? config.employerFeedback : null;
  });
  const [careerCta, setCareerCta] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings()?.careerCta;
    return cfg?.enabled === false ? null : cfg || null;
  });
  const [bottomCta, setBottomCta] = useState<any>(() => homepageCmsService.getSettings()?.bottomCta || null);
  const [researchHighlights, setResearchHighlights] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings()?.researchHighlights;
    return cfg?.enabled === false ? null : cfg || null;
  });
  const [footerConfig, setFooterConfig] = useState<FooterCmsConfig>(() => footerCmsService.getSettings());
  const [liveWelcomeMessage, setLiveWelcomeMessage] = useState<string>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.welcomeMessage || "Welcome to the ASTU Alumni Management System — Connecting graduates, employers, and departments for longitudinal career tracking and institutional excellence.";
  });
  const [liveWelcomeEnabled, setLiveWelcomeEnabled] = useState<boolean>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.welcomeEnabled !== false;
  });
  const [liveHeroBadge, setLiveHeroBadge] = useState<string>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.heroBadge || "ASTU Alumni Management System";
  });
  const [liveHeroButtons, setLiveHeroButtons] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.heroButtons || {
      primaryText: "Alumni Portal",
      primaryLink: "/info/alumni-portal",
      secondaryText: "Employer Partnership",
      secondaryLink: "/info/employer-portal",
    };
  });
  const [liveImpactHeaders, setLiveImpactHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.impactHeaders || {
      eyebrow: "ASTU IMPACT AT A GLANCE",
      title: "Connecting Academia to Industry",
      description: "Building a stronger connection between ASTU graduates, employers, research and career opportunities.",
    };
  });
  const [livePortalsHeaders, setLivePortalsHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.portalsHeaders || {
      eyebrow: "Get Started",
      title: "How ASTU-AMS Works",
      description: "From registration to real impact — here's how our platform empowers alumni, employers, and the university community in four simple steps.",
      ctaText: "Get Started Today",
      ctaLink: "/login",
    };
  });
  const [liveCampusLifeHeaders, setLiveCampusLifeHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    const raw: any = cfg?.campusLifeHeaders || {};
    const title = String(raw.title || '').trim();
    return {
      eyebrow: raw.eyebrow || 'Explore Life At ASTU',
      title:
        !title || /events|galler/i.test(title) ? 'Campus Life & Facilities' : title,
      description:
        raw.description && !/galler|events and/i.test(String(raw.description))
          ? raw.description
          : 'Discover clubs, facilities, and daily campus culture at Adama Science and Technology University.',
    };
  });
  const [liveEventsHeaders, setLiveEventsHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    const raw: any = cfg?.eventsHeaders || {};
    return {
      eyebrow: raw.eyebrow || 'Events & Workshops',
      title: raw.title || 'Gatherings & Training',
      description:
        raw.description ||
        'Join campus career expos, technical workshops, and alumni reunions.',
      viewAllText: raw.viewAllText || 'See All Events →',
      viewAllLink: raw.viewAllLink || '/events',
    };
  });
  const [liveAnnouncementsHeaders, setLiveAnnouncementsHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.announcementsHeaders || {
      eyebrow: "Announcements",
      title: "Official Notices",
      subscribeTitle: "Subscribe to official updates",
      subscribeDesc: "Receive announcements, events, partner calls, tracer survey reminders, and campus notices directly in your inbox.",
    };
  });
  const [livePartnersHeaders, setLivePartnersHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.partnersHeaders || {
      eyebrow: "Our Partners",
      title: "Partner Companies",
      description: "Institutional partners supporting employability, internships, and research collaboration.",
    };
  });
  const [liveFaqHeaders, setLiveFaqHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.faqHeaders || {
      eyebrow: "FAQ",
      title: "Frequently Asked Questions",
      description: "Common questions about ASTU-AMS, tracer studies, and alumni services.",
    };
  });
  const [liveAccreditation, setLiveAccreditation] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.accreditation || {
      eyebrow: "Quality Assurance",
      title: "Data-Driven Accreditation & Excellence",
      description: "ASTU-AMS provides verified tracer data, employment analytics, and employer feedback required by accreditation agencies and university management.",
      point1Title: "Global Accreditation",
      point1Desc: "Build transparent, audited institutional reports.",
      point2Title: "Market Alignment",
      point2Desc: "Align curriculum with industry expectations.",
      buttonText: "View Impact Numbers",
      buttonLink: "/info/impact-numbers",
      image1: '/images/campus-2.jpeg',
      image2: '/images/campus-2.jpeg',
    };
  });
  const [liveCtaSection, setLiveCtaSection] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.ctaSection || {
      enabled: true,
      title: "Ready to Join ASTU-AMS?",
      description: "Connect with fellow alumni, discover career opportunities, and contribute to university excellence.",
      primaryCtaText: "Alumni Portal",
      primaryCtaLink: "/login",
      secondaryCtaText: "Employer Portal",
      secondaryCtaLink: "/login",
    };
  });
  const [liveFooter, setLiveFooter] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.footer || {
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
    };
  });
  const [liveSectionLinks, setLiveSectionLinks] = useState(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.sectionLinks
      ? { ...cmsDefaultSectionLinks, ...cfg.sectionLinks }
      : { ...cmsDefaultSectionLinks };
  });
  const [liveGalleryHeaders, setLiveGalleryHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    const raw = cfg?.galleryHeaders || cfg?.gallerySection || {};
    const title = String(raw.title || '').trim();
    // Older CMS copy reused “Campus Life & Moments” — keep gallery distinct from Campus Life.
    const normalizedTitle =
      !title || /campus life/i.test(title) ? 'Photo Gallery' : title;
    return {
      eyebrow: raw.eyebrow || 'Campus Moments',
      title: normalizedTitle,
      subtitle:
        raw.subtitle ||
        raw.description ||
        'A curated look at graduation stages, research exhibitions, and campus life at ASTU.',
      buttonText: raw.buttonText || 'Explore Full Gallery',
      buttonLink: raw.buttonLink || '/gallery',
    };
  });
  const [liveStoriesHeaders, setLiveStoriesHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return (
      cfg?.storiesHeaders || {
        eyebrow: 'Success Stories',
        title: 'Alumni Success Stories',
        description:
          'Journeys of ASTU graduates building careers across industry, research, and entrepreneurship.',
      }
    );
  });
  const [liveNewsHeaders, setLiveNewsHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return (
      cfg?.newsHeaders || {
        eyebrow: 'Official Updates & Notices',
        title: 'News & Announcements',
        description:
          'University notices, academic bulletins, and alumni community circulars.',
      }
    );
  });
  const [liveGivingSection, setLiveGivingSection] = useState(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.givingSection || {
      title: "Support Future Innovators & Campus Research",
      subtitle: "Active campaigns organized by the ASTU Alumni & Advancement Office. Gifts support undergraduate scholarships, research labs, student welfare, and campus innovation. Confirm any tax treatment with your advisor or the Alumni Office.",
      buttonText: "Explore All Causes",
    };
  });


  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [noticeSearch, setNoticeSearch] = useState('');

  // RSVP / Registration State & Handlers
  const [registeredTitles, setRegisteredTitles] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('astu_user_registered_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [rsvpModalItem, setRsvpModalItem] = useState<{ title: string; kind: string; date: string; location?: string; id?: string } | null>(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpAffiliation, setRsvpAffiliation] = useState('');
  const [rsvpRole, setRsvpRole] = useState('Alumni');
  const [rsvpNotes, setRsvpNotes] = useState('');
  const [confirmedQrPass, setConfirmedQrPass] = useState<string | null>(null);

  // Events & Workshops Carousel, Filter & Modal State
  const [eventSlideIndex, setEventSlideIndex] = useState(0);
  const [eventFilterTab, setEventFilterTab] = useState<'ALL' | 'BOOTCAMPS' | 'CONFERENCES' | 'CAREER'>('ALL');
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);
  const [allEventsSearch, setAllEventsSearch] = useState('');
  const [isAutoPlayEvents, setIsAutoPlayEvents] = useState(false);

  // News Carousel State, Timer & Modals
  const [newsSlideIndex, setNewsSlideIndex] = useState(0);
  const [isNewsTimerPaused, setIsNewsTimerPaused] = useState(false);
  const [newsTimerProgress, setNewsTimerProgress] = useState(0);
  const [selectedNewsModal, setSelectedNewsModal] = useState<any | null>(null);
  const [showAllNewsModal, setShowAllNewsModal] = useState(false);
  const [newsSearchQuery, setNewsSearchQuery] = useState('');

  // Published news only — never invent placeholder articles for the public homepage.
  const displayNewsList = useMemo(() => liveNews || [], [liveNews]);

  // Three notices per row on the homepage preview, matching every other public grid.
  const NEWS_PER_SLIDE = 3;
  const totalNewsSlides = displayNewsList.length ? Math.ceil(displayNewsList.length / NEWS_PER_SLIDE) : 0;

  // Keep the slide index valid when the published list shrinks.
  useEffect(() => {
    setNewsSlideIndex((prev) => Math.min(prev, Math.max(0, totalNewsSlides - 1)));
  }, [totalNewsSlides]);

  // Auto-Slide Timer with animated progress bar (5s duration per slide)
  useEffect(() => {
    if (totalNewsSlides <= 1 || isNewsTimerPaused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsNewsTimerPaused(true);
      return;
    }

    const intervalMs = 50;
    const durationMs = 5000;
    const step = (intervalMs / durationMs) * 100;

    const timer = setInterval(() => {
      setNewsTimerProgress((prev) => {
        if (prev >= 100) {
          setNewsSlideIndex((curr) => (curr + 1) % totalNewsSlides);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [totalNewsSlides, isNewsTimerPaused]);

  const handleNewsSlideChange = (newIdx: number) => {
    setNewsSlideIndex((newIdx + totalNewsSlides) % totalNewsSlides);
    setNewsTimerProgress(0);
  };

  /** Network voices: CMS testimonials + approved community posts + published stories (API only). */
  const networkVoices = useMemo(() => {
    const isRealVoice = (name?: string) => Boolean(name && String(name).trim().length > 0);

    const fromTestimonials = (liveTestimonials || [])
      .filter((t: any) => t && (t.quote || t.message || t.text) && isRealVoice(t.by || t.name))
      .map((t: any, idx: number) => ({
        id: t.id || `testimonial-${idx}`,
        name: t.by || t.name,
        role: t.role || t.title || 'ASTU Community',
        company: t.company || t.org || '',
        message: t.quote || t.message || t.text,
        image: t.image || t.avatar || '',
        source: 'testimonial' as const,
      }));

    const fromPosts = (liveCommunityPosts || [])
      .filter((p: any) => p && (p.message || p.text || p.quote) && isRealVoice(p.name))
      .map((p: any, idx: number) => ({
        id: p.id || `community-${idx}`,
        name: p.name,
        role: p.role || 'Alumni',
        company: p.company || p.org || '',
        message: p.message || p.text || p.quote,
        image: p.image || '',
        source: 'community' as const,
      }));

    // Keep alumni stories exclusive to the Success Stories section.
    const merged = [...fromTestimonials, ...fromPosts];
    if (merged.length > 0) return merged.slice(0, 3);
    return DEFAULT_NETWORK_VOICES.slice(0, 3);
  }, [liveTestimonials, liveCommunityPosts]);

  // Alumni stories carousel state
  const [storySlideIndex, setStorySlideIndex] = useState(0);
  const totalStorySlides = liveStories.length ? Math.ceil(liveStories.length / 3) : 0;
  const handleStorySlideChange = (newIdx: number) => {
    setStorySlideIndex((newIdx + totalStorySlides) % totalStorySlides);
  };
  useEffect(() => {
    setStorySlideIndex((prev) => Math.min(prev, Math.max(0, totalStorySlides - 1)));
  }, [totalStorySlides]);

  // Combine liveEvents and workshops from CMS/API only
  const allEventsList = useMemo<EventItem[]>(() => {
    const liveList: EventItem[] = [];
    if (liveEvents && liveEvents.length > 0) {
      liveEvents.forEach((e: any, idx: number) => {
        liveList.push({
          id: e.id || `live-event-${idx}`,
          title: e.title,
          category: e.category || (e.title.toLowerCase().includes('bootcamp') || e.title.toLowerCase().includes('training') ? 'TECHNICAL TRAINING & LABS' : 'EVENT'),
          type: e.title.toLowerCase().includes('bootcamp') ? 'bootcamp' : e.title.toLowerCase().includes('conference') ? 'conference' : 'career',
          kind: 'Event',
          date: e.date,
          time: e.time || undefined,
          location: e.location || 'Location to be confirmed',
          campus: 'ASTU Main Campus',
          description: e.description || 'Join fellow ASTU alumni and students for an interactive session, expert talks, and networking opportunities.',
          image: e.image || FALLBACK_IMAGE,
          speaker: e.speaker || undefined,
          seats: e.seats || undefined,
          statusBadge: e.statusBadge || 'Upcoming',
          level: 'All Alumni & Students',
        });
      });
    }

    if (liveWorkshops && liveWorkshops.length > 0) {
      liveWorkshops.forEach((w: any, idx: number) => {
        liveList.push({
          id: w.id || `live-workshop-${idx}`,
          title: w.title,
          category: 'TECHNICAL TRAINING & LABS',
          type: 'bootcamp',
          kind: 'Workshop',
          date: w.date,
          time: w.time || undefined,
          location: w.location || w.focus || 'Location to be confirmed',
          campus: w.campus || 'ASTU Campus',
          description: w.description || 'Hands-on workshop hosted by Adama Science and Technology University.',
          image: w.image || FALLBACK_IMAGE,
          speaker: w.speaker || undefined,
          seats: w.seats || undefined,
          statusBadge: w.statusBadge || 'Workshop',
          level: w.level || undefined,
        });
      });
    }

    // Empty when CMS/API have nothing — do not inject showcase/demo events.
    return liveList;
  }, [liveEvents, liveWorkshops]);

  // Filtered by selected tab
  const filteredEventsList = useMemo(() => {
    if (eventFilterTab === 'BOOTCAMPS') {
      return allEventsList.filter(e => e.type === 'bootcamp' || e.category.toLowerCase().includes('training') || e.category.toLowerCase().includes('bootcamp'));
    }
    if (eventFilterTab === 'CONFERENCES') {
      return allEventsList.filter(e => e.type === 'conference' || e.title.toLowerCase().includes('conference') || e.title.toLowerCase().includes('symposium'));
    }
    if (eventFilterTab === 'CAREER') {
      return allEventsList.filter(e => e.type === 'career' || e.title.toLowerCase().includes('summit') || e.title.toLowerCase().includes('homecoming') || e.title.toLowerCase().includes('career'));
    }
    return allEventsList;
  }, [allEventsList, eventFilterTab]);

  const eventTotalPages = Math.max(1, Math.ceil(filteredEventsList.length / 3));
  const safeEventSlideIndex = Math.min(eventSlideIndex, eventTotalPages - 1);

  // When filters shrink the list, clamp the slide so pagination never overflows.
  useEffect(() => {
    setEventSlideIndex((prev) => Math.min(prev, Math.max(0, eventTotalPages - 1)));
  }, [eventTotalPages]);

  useEffect(() => {
    if (window.location.hash === '#events' || window.location.hash === '#workshops') {
      setTimeout(() => {
        document.getElementById('events')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }, []);


  // Pair each server-reported figure with its presentation. Stats the server
  // omits (zero rows) or that we have no presentation for are dropped, so the
  // band and its nav entry disappear together when there is nothing real.
  const visibleStats = useMemo(
    () =>
      liveStats
        .map((stat) => ({ stat, presentation: STAT_PRESENTATION[stat.key] }))
        .filter((entry): entry is { stat: PublicStat; presentation: (typeof STAT_PRESENTATION)[string] } =>
          Boolean(entry.presentation)
        ),
    [liveStats]
  );

  /** Live donation campaigns only — ordered for the homepage, never static demos. */
  const orderedDonationCampaigns = useMemo(() => {
    return [...donationCampaigns]
      .filter((c: any) => {
        const status = String(c.status || 'ACTIVE').toUpperCase();
        return status === 'ACTIVE' || status === 'OPEN';
      })
      .sort((a: any, b: any) => {
        const orderA = a.displayOrder ?? a.order ?? a.sortOrder;
        const orderB = b.displayOrder ?? b.order ?? b.sortOrder;
        if (orderA != null && orderB != null && Number(orderA) !== Number(orderB)) {
          return Number(orderA) - Number(orderB);
        }
        if (Boolean(b.featured) !== Boolean(a.featured)) {
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        }
        const raisedDiff = (Number(b.raised) || 0) - (Number(a.raised) || 0);
        if (raisedDiff !== 0) return raisedDiff;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [donationCampaigns]);

  const donationCategories = useMemo(() => {
    const cats = Array.from(
      new Set(
        orderedDonationCampaigns
          .map((c: any) => c.category)
          .filter((cat: unknown): cat is string => typeof cat === 'string' && cat.trim().length > 0)
      )
    );
    return ['ALL', ...cats];
  }, [orderedDonationCampaigns]);

  // A slide published from the CMS may carry no `image`, and CMS authors write
  // `subtitle` where the template reads `tagline`. Normalising here means the
  // hero can never render <img src="undefined"> and the text cannot silently
  // disappear.
  const normalisedSlides = useMemo(
    () =>
      liveSlides.map((slide: any) => ({
        ...slide,
        // A partial CMS save or a deleted upload must not leave the public
        // homepage with an empty hero. Use the bundled campus image until the
        // editor supplies a working URL.
        image: mediaUrl(slide.image || slide.backgroundImage || slide.bgImage) || DEFAULT_HERO_IMAGE,
        tagline: slide.tagline || slide.subtitle || slide.kicker || '',
        description: slide.description || slide.body || slide.text || '',
      })),
    [liveSlides]
  );

  const displaySlides = useMemo(
    () =>
      normalisedSlides.length
        ? normalisedSlides
        : DEFAULT_HERO_SLIDES.map((slide) => ({
            ...slide,
            description: slide.description || welcomeMessage,
          })),
    [normalisedSlides, welcomeMessage]
  );

  const activeSlideIndex = Math.min(currentSlide, Math.max(displaySlides.length - 1, 0));
  const activeHero = displaySlides[activeSlideIndex];

  const handleRegisterClick = (item: { title: string; kind: 'Event' | 'Workshop'; date: string; location?: string; id?: string }) => {
    if (registeredTitles.includes(item.title)) {
      toast.success(`You are already registered for "${item.title}"!`);
      return;
    }

    const storedUser = localStorage.getItem('user');
    let defaultName = '';
    let defaultEmail = '';
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        defaultName = parsed.name || '';
        defaultEmail = parsed.email || '';
      } catch {}
    }

    setRsvpModalItem(item);
    setRsvpName(defaultName);
    setRsvpEmail(defaultEmail);
    setRsvpPhone('');
    setRsvpAffiliation('ASTU School of Engineering');
    setRsvpRole('Alumni');
    setRsvpNotes('');
    setConfirmedQrPass(null);
  };

  const confirmRsvpRegistration = async () => {
    if (!rsvpModalItem) return;
    if (!rsvpName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!rsvpEmail.trim() || !rsvpEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Call backend API if event ID or slug available
    const eventIdOrSlug = rsvpModalItem.id || rsvpModalItem.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    try {
      await eventsService.rsvpToEvent(eventIdOrSlug, 'GOING');
    } catch (err) {
      // Previously the failure was swallowed by an empty catch, so a rejected
      // RSVP still confirmed the registration and claimed a ticket was emailed.
      console.error('RSVP failed:', err);
      toast.error('Registration could not be completed. Please try again.');
      return;
    }

    const updated = [...registeredTitles, rsvpModalItem.title];
    setRegisteredTitles(updated);
    localStorage.setItem('astu_user_registered_events', JSON.stringify(updated));

    toast.success(`Registration confirmed for "${rsvpModalItem.title}".`);
    setConfirmedQrPass(`ASTU-PASS-${Date.now()}-${rsvpName.replace(/\s+/g, '-')}`);
  };

  // Impact numbers come straight from the database via /content/public-stats.
  // Kept separate from the CMS load because these are measured, not authored.
  useEffect(() => {
    let isMounted = true;
    publicStatsService.getStats().then((stats) => {
      if (isMounted) setLiveStats(stats);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let refreshTimer: number | undefined;

    const loadPublishedPartners = async () => {
      setPartnersLoading(true);
      try {
        const partners = await homepageCmsService.fetchPublishedPartners();
        if (isMounted) {
          setLivePartners(partners);
          setFailedPartnerLogos(new Set());
        }
      } catch {
        if (isMounted) setLivePartners([]);
      } finally {
        if (isMounted) setPartnersLoading(false);
      }
    };

    const queuePartnerRefresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void loadPublishedPartners(), 400);
    };

    void loadPublishedPartners();
    window.addEventListener('astu-cms-homepage-updated', queuePartnerRefresh);
    window.addEventListener('focus', queuePartnerRefresh);

    return () => {
      isMounted = false;
      window.clearTimeout(refreshTimer);
      window.removeEventListener('astu-cms-homepage-updated', queuePartnerRefresh);
      window.removeEventListener('focus', queuePartnerRefresh);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Helper: apply a loaded CMS config object to all homepage state slices
    const applyCmsConfig = (cmsConfig: any) => {
      if (!cmsConfig || !isMounted) return;
      if (cmsConfig.heroSlides?.length) {
        const active = cmsConfig.heroSlides.filter((s: any) => s.active !== false);
        if (active.length) setLiveSlides(active);
      }
      // Impact stats are NOT CMS-driven — they are counted from real rows by
      // the server and fetched separately, so no assignment happens here.
      if (cmsConfig.portals?.length) {
        const active = cmsConfig.portals.filter((p: any) => p.active !== false);
        if (active.length) setLivePortals(active);
      }
      if (Array.isArray(cmsConfig.campusLife)) {
        const active = cmsConfig.campusLife.filter((c: any) => c.active !== false);
        setLiveCampusLife(active.length > 0 ? active : DEFAULT_CAMPUS_LIFE);
      }
      if (Array.isArray(cmsConfig.campuses)) {
        setLiveCampuses(cmsConfig.campuses.filter((c: any) => c.active !== false));
      }
      if (cmsConfig.industryBridge) {
        setIndustryBridge(cmsConfig.industryBridge.enabled === false ? null : cmsConfig.industryBridge);
      }
      if (Array.isArray(cmsConfig.gallery)) {
        const active = cmsConfig.gallery.filter((g: any) => g.active !== false);
        setLiveGallery(active.length > 0 ? active : DEFAULT_GALLERY_IMAGES);
      }
      if (Array.isArray(cmsConfig.videos)) {
        const active = cmsConfig.videos.filter((v: any) => v.active !== false);
        setLiveVideos(active.length > 0 ? active : DEFAULT_VIDEO_HIGHLIGHTS);
      }
      if (Array.isArray(cmsConfig.newsItems)) {
        setLiveNews(cmsConfig.newsItems.filter((n: any) => n.active !== false));
      }
      if (Array.isArray(cmsConfig.announcements)) {
        setLiveAnnouncements(cmsConfig.announcements.filter((a: any) => a.active !== false));
      }
      if (Array.isArray(cmsConfig.stories)) {
        const active = cmsConfig.stories.filter((s: any) => s.active !== false);
        setLiveStories(active.length ? storiesService.fromConfig(active) : []);
      }
      if (cmsConfig.partnersHeaders) setLivePartnersHeaders(cmsConfig.partnersHeaders);
      if (Array.isArray(cmsConfig.partners)) {
        const active = cmsConfig.partners.filter((p: any) => p.active !== false);
        if (active.length) setLivePartners(active);
      }
      if (Array.isArray(cmsConfig.faq)) {
        const active = cmsConfig.faq.filter((f: any) => f.active !== false);
        setLiveFaq(active.length > 0 ? active : DEFAULT_FAQ);
      }
      if (cmsConfig.faqHeaders) setLiveFaqHeaders(cmsConfig.faqHeaders);
      if (Array.isArray(cmsConfig.communityPosts) || Array.isArray(cmsConfig.liveCommunityPosts)) {
        const source = Array.isArray(cmsConfig.communityPosts)
          ? cmsConfig.communityPosts
          : cmsConfig.liveCommunityPosts;
        setLiveCommunityPosts((source || []).filter((p: any) => p.active !== false));
      }
      if (cmsConfig.liveCommunitySection) setLiveCommunitySection(cmsConfig.liveCommunitySection);
      if (Array.isArray(cmsConfig.testimonials)) {
        setLiveTestimonials(cmsConfig.testimonials.filter((t: any) => t.active !== false));
      }
      if (cmsConfig.events?.length) {
        const active = cmsConfig.events.filter((e: any) => e.active !== false);
        if (active.length) {
          setLiveEvents(active.map((e: any) => ({
            title: e.title,
            date: e.date,
            location: e.location || 'Location to be confirmed',
            image: e.image || FALLBACK_IMAGE,
            id: e.id,
          })));
        }
      }
      if (cmsConfig.workshops?.length) {
        const active = cmsConfig.workshops.filter((w: any) => w.active !== false);
        if (active.length) {
          setLiveWorkshops(active.map((w: any) => ({
            title: w.title,
            date: w.date,
            seats: w.seats || 'Open Registration',
            focus: w.focus || w.category || 'Career Readiness',
            id: w.id,
          })));
        }
      }
      if (cmsConfig.mentorshipStats?.enabled) {
        setMentorshipStats(cmsConfig.mentorshipStats);
      } else if (cmsConfig.mentorshipStats) {
        setMentorshipStats(null);
      }
      if (typeof cmsConfig.welcomeMessage === 'string') {
        setWelcomeMessage(cmsConfig.welcomeMessage);
        setLiveWelcomeMessage(cmsConfig.welcomeMessage);
      }
      if (typeof cmsConfig.welcomeEnabled === 'boolean') {
        setLiveWelcomeEnabled(cmsConfig.welcomeEnabled);
      }
      if (cmsConfig.impactHeaders) setLiveImpactHeaders(cmsConfig.impactHeaders);
      if (cmsConfig.portalsHeaders) setLivePortalsHeaders(cmsConfig.portalsHeaders);
      if (cmsConfig.eventsHeaders) setLiveEventsHeaders(cmsConfig.eventsHeaders);
      if (cmsConfig.announcementsHeaders) setLiveAnnouncementsHeaders(cmsConfig.announcementsHeaders);
      if (cmsConfig.newsHeaders) setLiveNewsHeaders(cmsConfig.newsHeaders);
      if (cmsConfig.galleryHeaders || cmsConfig.gallerySection) {
        const raw = cmsConfig.galleryHeaders || cmsConfig.gallerySection || {};
        const title = String(raw.title || '').trim();
        setLiveGalleryHeaders({
          ...raw,
          eyebrow: raw.eyebrow || 'Campus Moments',
          title: !title || /campus life/i.test(title) ? 'Photo Gallery' : title,
          subtitle:
            raw.subtitle ||
            raw.description ||
            'A curated look at graduation stages, research exhibitions, and campus life at ASTU.',
          buttonText: raw.buttonText || 'Explore Full Gallery',
          buttonLink: raw.buttonLink || '/gallery',
        });
      }
      if (cmsConfig.campusLifeHeaders) {
        const raw = cmsConfig.campusLifeHeaders;
        const title = String(raw.title || '').trim();
        setLiveCampusLifeHeaders({
          ...raw,
          title:
            !title || /events|galler/i.test(title)
              ? 'Campus Life & Facilities'
              : title,
          description:
            raw.description && !/galler|events and/i.test(String(raw.description))
              ? raw.description
              : 'Discover clubs, facilities, and daily campus culture at Adama Science and Technology University.',
        });
      }
      if (cmsConfig.storiesHeaders) setLiveStoriesHeaders(cmsConfig.storiesHeaders);
      if (cmsConfig.givingSection) setLiveGivingSection(cmsConfig.givingSection);
      if (cmsConfig.accreditation) setLiveAccreditation(cmsConfig.accreditation);
      if (cmsConfig.ctaSection) setLiveCtaSection(cmsConfig.ctaSection);
      if (cmsConfig.sectionLinks) {
        setLiveSectionLinks((prev: any) => ({ ...cmsDefaultSectionLinks, ...prev, ...cmsConfig.sectionLinks }));
      }
      if (cmsConfig.tracerSpotlight?.enabled) {
        setTracerSpotlight(cmsConfig.tracerSpotlight);
      } else if (cmsConfig.tracerSpotlight) {
        setTracerSpotlight(null);
      }
      if (cmsConfig.employerFeedback?.enabled) {
        setEmployerFeedback(cmsConfig.employerFeedback);
      } else if (cmsConfig.employerFeedback) {
        setEmployerFeedback(null);
      }
      if (cmsConfig.careerCta) {
        setCareerCta(cmsConfig.careerCta.enabled === false ? null : cmsConfig.careerCta);
      }
      if (cmsConfig.heroBadge) setLiveHeroBadge(cmsConfig.heroBadge);
      if (cmsConfig.heroButtons) setLiveHeroButtons(cmsConfig.heroButtons);
      if (cmsConfig.bottomCta) setBottomCta(cmsConfig.bottomCta);
      if (cmsConfig.researchHighlights) {
        setResearchHighlights(
          cmsConfig.researchHighlights.enabled === false ? null : cmsConfig.researchHighlights
        );
      }
      if (cmsConfig.footer) {
        setFooterConfig({ ...defaultFooterConfig, ...cmsConfig.footer });
      }
    };

    const syncContent = async () => {
      // 1. Apply localStorage snapshot immediately for instant render (no flash)
      const localConfig = homepageCmsService.getSettings();
      applyCmsConfig(localConfig);

      const publishedNews = contentService.getPublishedNews();
      if (publishedNews.length && isMounted) setLiveNews(publishedNews);
      const publishedAnnounce = contentService.getPublishedAnnouncements();
      if (publishedAnnounce.length && isMounted) setLiveAnnouncements(publishedAnnounce);
      // Stories: homepage CMS only — never seed fabricated localStorage stories.
      const homepageStories = storiesService.fromConfig(localConfig?.stories);
      if (isMounted) {
        setLiveStories(homepageStories.length ? homepageStories : []);
      }

      // 2. Fetch live data from backend API — drives real CMS→Homepage integration
      try {
        const [apiConfig, apiItems, apiFooter] = await Promise.all([
          homepageCmsService.fetchFromApi(),
          contentService.fetchItemsFromApi(),
          footerCmsService.fetchFromApi(),
        ]);

        // Apply live API config (overrides localStorage snapshot)
        if (isMounted) {
          applyCmsConfig(apiConfig);
          if (apiFooter) setFooterConfig(apiFooter);
        }

        // Apply live content items (news, announcements).
        // An empty array is a valid answer meaning "nothing is published", so it
        // must clear the localStorage snapshot rather than leave it on screen.
        // Guarding on `apiItems.length` meant deleted content stayed visible.
        if (isMounted && Array.isArray(apiItems)) {
          const liveNews = apiItems
            .filter((i: any) => {
              const status = String(i.status || '').toUpperCase();
              const type = String(i.type || '').toLowerCase();
              return status === 'PUBLISHED' && (type === 'post' || type === 'announcement' || type === 'news');
            })
            .map((i: any) => ({ id: i.id, title: i.title, date: i.publishedAt || i.updatedAt, excerpt: i.excerpt }));
          setLiveNews(liveNews);

          const liveAnnounce = apiItems
            .filter((i: any) => String(i.status || '').toUpperCase() === 'PUBLISHED')
            .map((i: any) => ({
              id: i.id,
              title: i.title,
              date: i.publishedAt || i.updatedAt || 'Just now',
              type: String(i.type || '').toLowerCase() === 'announcement' ? 'Official Announcement' : `${String(i.type || '').toUpperCase()} Announcement`,
              excerpt: i.excerpt,
            }));
          setLiveAnnouncements(liveAnnounce);
        }
      } catch {
        // Silently fall back to localStorage data already applied above
      }


      // Sync Events & Workshops from DB API
      try {
        const apiEvents = await eventsService.getAllEvents();
        let fetchedEvents: any[] = [];
        let fetchedWorkshops: any[] = [];

        if (apiEvents && apiEvents.length > 0) {
          fetchedEvents = apiEvents
            .filter((e) => e.type !== 'Workshop' && e.type !== 'WORKSHOP')
            .map((e) => ({
              id: e.id || e.slug,
              title: e.title,
              date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toLocaleDateString(),
location: e.location || 'Location to be confirmed',
              image: e.image || e.coverImage || e.bannerUrl || FALLBACK_IMAGE,
            }));

          fetchedWorkshops = apiEvents
            .filter((e) => e.type === 'Workshop' || e.type === 'WORKSHOP')
            .map((e) => ({
              id: e.id || e.slug,
              title: e.title,
              date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toLocaleDateString(),
              seats: e.capacity ? `${e.capacity} seats` : 'Open Registration',
              focus: e.category || e.tags?.[0] || 'General',
            }));
        }

        if (!fetchedEvents.length) {
          const stored = localStorage.getItem('astu_ams_cms_events_items');
          if (stored) {
            const parsed = JSON.parse(stored);
            fetchedEvents = parsed
              .filter((e: any) => e.kind === 'Event' && e.status === 'Open')
              .map((e: any) => ({
                id: e.id,
                title: e.title,
                date: e.date,
                location: e.location,
                image: e.image || FALLBACK_IMAGE,
              }));
          }
        }

        if (!fetchedWorkshops.length) {
          const stored = localStorage.getItem('astu_ams_cms_events_items');
          if (stored) {
            const parsed = JSON.parse(stored);
            fetchedWorkshops = parsed
              .filter((e: any) => e.kind === 'Workshop' && e.status === 'Open')
              .map((e: any) => ({
                id: e.id,
                title: e.title,
                date: e.date,
                seats:
                  typeof e.rsvps === 'number'
                    ? `${e.rsvps} registered`
                    : Array.isArray(e.rsvps) && e.rsvps.length
                      ? `${e.rsvps.length} registered`
                      : 'Open Registration',
                focus: e.category || 'Career Readiness',
              }));
          }
        }

        if (isMounted) {
          if (fetchedEvents.length) setLiveEvents(fetchedEvents);
          if (fetchedWorkshops.length) setLiveWorkshops(fetchedWorkshops);
        }
      } catch {
        // Keep CMS / empty state — do not inject demo events
      }

      // Sync active Donation Campaigns published by Alumni Office / CMS (ordered, never static demos)
      try {
        const campaigns = await contentService.getPublicDonationCampaigns({ status: 'ACTIVE' });
        if (isMounted) {
          setDonationCampaigns(Array.isArray(campaigns) ? campaigns : []);
        }
      } catch {
        if (isMounted) setDonationCampaigns([]);
      }

      const cfg = homepageCmsService.getSettings();
      if (isMounted && cfg?.givingSection) {
        setLiveGivingSection(cfg.givingSection);
      }
    };

    syncContent();
    const onFooterUpdated = () => setFooterConfig(footerCmsService.getSettings());
    window.addEventListener('astu-cms-content-changed', syncContent);
    window.addEventListener('astu-cms-events-changed', syncContent);
    window.addEventListener('astu-cms-donations-changed', syncContent);
    window.addEventListener('astu-cms-homepage-updated', syncContent);
    window.addEventListener('astu-cms-gallery-changed', syncContent);
    window.addEventListener('astu-cms-gallery-settings-changed', syncContent);
    window.addEventListener('astu-cms-footer-updated', onFooterUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-content-changed', syncContent);
      window.removeEventListener('astu-cms-events-changed', syncContent);
      window.removeEventListener('astu-cms-donations-changed', syncContent);
      window.removeEventListener('astu-cms-homepage-updated', syncContent);
      window.removeEventListener('astu-cms-gallery-changed', syncContent);
      window.removeEventListener('astu-cms-gallery-settings-changed', syncContent);
      window.removeEventListener('astu-cms-footer-updated', onFooterUpdated);
    };
  }, []);

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (displaySlides.length || 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  useEffect(() => {
    setCurrentSlide((prev) => (prev >= displaySlides.length ? 0 : prev));
  }, [displaySlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (displaySlides.length || 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (displaySlides.length || 1)) % (displaySlides.length || 1));
  };



  useEffect(() => {
    const checkUserSession = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    };

    checkUserSession();
    window.addEventListener("storage", checkUserSession);
    return () => window.removeEventListener("storage", checkUserSession);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied === 'true') {
      image.src = FALLBACK_IMAGE || DEFAULT_HERO_IMAGE;
      return;
    }
    image.dataset.fallbackApplied = 'true';
    image.src = DEFAULT_HERO_IMAGE;
  };

  const handleHeroImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied === 'true') {
      image.style.display = 'none';
      return;
    }

    image.dataset.fallbackApplied = 'true';
    image.src = DEFAULT_HERO_IMAGE;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.05 }
    );

    const nodes = document.querySelectorAll(".reveal");
    nodes.forEach((node) => observer.observe(node));

    // Force visibility check for elements already in viewport
    setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.2 && rect.bottom > -100) {
          node.classList.add("is-visible");
        }
      });
    }, 150);

    return () => observer.disconnect();
  }, [liveEvents, liveWorkshops, liveNews, liveAnnouncements, liveStories, liveSlides, liveGallery, liveCampusLife, liveFaq, liveCommunityPosts, liveTestimonials, networkVoices, liveStats]);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0.1 }
    );

    navSections.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) {
        sectionObserver.observe(node);
      }
    });

    return () => sectionObserver.disconnect();
  }, []);

  // Removed redundant header listeners (now handled natively inside Navbar component)

  return (
    <div className="home-shell flex min-h-screen flex-col w-full relative bg-background text-on-surface dark:bg-[var(--bg-page)] dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <div className="fixed top-0 left-0 z-[60] w-full h-0.5 bg-slate-800/20 dark:bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-astu-green via-astu-navy to-astu-red transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main id="home" className="flex flex-col w-full relative">
        {liveWelcomeEnabled && liveWelcomeMessage && (
          <div className="relative w-full border-b border-amber-400/20 bg-[#001730] text-amber-200">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2 md:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
                <p className="truncate text-[11px] font-semibold tracking-wide md:text-xs">
                  {liveWelcomeMessage}
                </p>
              </div>
              {liveSectionLinks?.tickerLinkText && (
                <button
                  type="button"
                  onClick={() => navigate(liveSectionLinks.tickerLinkTarget || '/announcements')}
                  className="shrink-0 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 transition hover:bg-amber-400/20"
                >
                  {liveSectionLinks.tickerLinkText}
                </button>
              )}
            </div>
          </div>
        )}

        <section className="relative w-full overflow-hidden min-h-[520px] max-h-[620px] md:h-[520px] lg:h-[560px] bg-slate-950">
          {/* Background Slides — photo stays dominant; text uses a local scrim only */}
          <div className="absolute inset-0 w-full h-full">
            {displaySlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  idx === activeSlideIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {slide.image ? (
                  <img
                    alt={slide.title}
                    className={`h-full w-full object-cover object-center scale-105 transition-transform duration-[8000ms] ease-out ${
                      idx === activeSlideIndex ? "scale-100" : "scale-105"
                    }`}
                    src={slide.image}
                    onError={handleHeroImageError}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-astu-navy via-slate-900 to-slate-950" />
                )}
                {/* Soft left scrim for copy — keeps the right side of the photo visible */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent md:via-slate-950/25 md:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/20" />
              </div>
            ))}
          </div>

          {/* Hero copy — brand-first: one brand signal, one headline, one CTA group */}
          <div className="relative z-20 mx-auto flex h-full max-w-[1440px] items-center px-4 py-12 md:px-6 md:py-14">
            <div className="max-w-2xl space-y-4 rounded-2xl bg-slate-950/30 p-5 backdrop-blur-[2px] md:bg-transparent md:p-0 md:backdrop-blur-none animate-slide-up">
              <span className="inline-block rounded-full bg-astu-red px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg animate-glow">
                {activeHero?.tagline || liveHeroBadge || 'ASTU-AMS'}
              </span>
              <h1 className="text-3xl font-black leading-[1.15] tracking-tight text-white drop-shadow-sm md:text-4xl lg:text-5xl">
                {(activeHero?.title || '').includes(" to the ") ? (
                  <>
                    {activeHero?.title.split(" to the ")[0]}
                    <br />
                    to the <span className="text-astu-green">{activeHero?.title.split(" to the ")[1]}</span>
                  </>
                ) : (
                  activeHero?.title || 'Alumni Management System'
                )}
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-white/90 md:text-base">
                {activeHero?.description || welcomeMessage || 'Connecting ASTU graduates, employers, and academic departments through verified career and alumni services.'}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="home-btn home-btn--primary"
                  onClick={() => navigate(liveHeroButtons?.primaryLink || '/info/alumni-portal')}
                >
                  <Users className="home-btn__icon" aria-hidden="true" />
                  {liveHeroButtons?.primaryText || 'Alumni Portal'}
                  <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="home-btn home-btn--secondary"
                  onClick={() => navigate(liveHeroButtons?.secondaryLink || '/info/employer-portal')}
                >
                  {liveHeroButtons?.secondaryText || 'Employer Partnership'}
                  <Handshake className="home-btn__icon" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Left/Right navigation arrow buttons */}
          {displaySlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-astu-navy/80 hover:scale-110 transition-all duration-300 backdrop-blur-sm hidden sm:block shadow-lg hover:shadow-xl"
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-astu-navy/80 hover:scale-110 transition-all duration-300 backdrop-blur-sm hidden sm:block shadow-lg hover:shadow-xl"
                aria-label="Next slide"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-5 left-1/2 z-35 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Hero slides">
                {displaySlides.map((_, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === activeSlideIndex ? "w-6 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/60"
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                    aria-selected={idx === activeSlideIndex}
                  />
                ))}
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              const target =
                document.getElementById('impact-numbers') ||
                document.getElementById('campus-life') ||
                document.getElementById('events');
              target?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="absolute bottom-10 left-1/2 z-40 -translate-x-1/2 text-white/90 animate-bounce motion-reduce:animate-none"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-7 w-7" />
          </button>
        </section>

        {visibleStats.length > 0 && (
          <section id="impact-numbers" className="relative w-full mx-auto mt-8 mb-4 max-w-[1440px] px-4 md:mt-10 md:mb-6 md:px-8">
            <div className="mb-5 max-w-2xl reveal">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                {liveImpactHeaders?.eyebrow || 'ASTU Impact At A Glance'}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                {liveImpactHeaders?.title || 'Connecting Academia to Industry'}
              </h2>
              {liveImpactHeaders?.description && (
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                  {liveImpactHeaders.description}
                </p>
              )}
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[var(--bg-card)] border border-slate-200/90 dark:border-[var(--border-color)] shadow-[var(--shadow-soft)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-astu-navy via-astu-red to-astu-green" />
              <div
                className={`grid divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90 dark:divide-[var(--border-color)] ${
                  visibleStats.length === 1
                    ? "grid-cols-1"
                    : visibleStats.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : visibleStats.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : visibleStats.length === 4
                    ? "grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                }`}
              >
                {visibleStats.map(({ stat, presentation }, idx) => {
                  const { Icon } = presentation;
                  return (
                    <article
                      key={stat.key || idx}
                      className="group flex flex-col items-center gap-2.5 p-5 md:p-6 text-center transition-all duration-300 hover:bg-slate-50/70 dark:hover:bg-white/[0.04]"
                    >
                      <div className={`rounded-xl p-2.5 ${presentation.accent} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-extrabold text-astu-navy dark:text-white tracking-tight">
                        {stat.value.toLocaleString()}
                      </h2>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {presentation.label}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {(livePortals?.length > 0 || howItWorksSteps.length > 0) && (
          <section id="how-it-works" className="relative w-full mx-auto max-w-[1440px] px-4 py-14 md:px-8 md:py-16">
            <div className="mb-8 text-center reveal">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                {livePortalsHeaders?.eyebrow || 'Get Started'}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                {livePortalsHeaders?.title || 'How ASTU-AMS Works'}
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                {livePortalsHeaders?.description ||
                  "From registration to real impact — here's how our platform empowers alumni, employers, and the university community."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(livePortals.length > 0 ? livePortals : howItWorksSteps).slice(0, 4).map((item: any, idx: number) => {
                const IconComp =
                  (item.icon && typeof item.icon !== 'string' && item.icon) ||
                  (typeof item.icon === 'string' && iconMap[item.icon]) ||
                  howItWorksSteps[idx]?.icon ||
                  CircleUserRound;
                const stepNum = String(item.step || idx + 1).padStart(2, '0');
                const tags = Array.isArray(item.points) ? item.points.slice(0, 2) : [];
                return (
                  <article
                    key={item.id || idx}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-astu-navy/30 dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="inline-flex h-7 items-center rounded-full bg-astu-navy px-2.5 text-[10px] font-extrabold text-white">
                          {stepNum}
                        </span>
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconBg || 'bg-astu-navy/10 text-astu-navy dark:bg-sky-500/15 dark:text-sky-300'}`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-tight text-astu-navy dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant dark:text-slate-400 line-clamp-3">
                        {item.description || (Array.isArray(item.points) ? item.points[0] : '')}
                      </p>
                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tags.map((tag: string, tIdx: number) => (
                            <span
                              key={tIdx}
                              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(item.route || liveSectionLinks?.portalsGetStartedLink || '/login')}
                      className="mt-4 inline-flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-bold text-astu-navy transition hover:text-astu-red dark:border-[var(--border-color)] dark:text-sky-300"
                    >
                      {item.cta || 'Learn more'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    livePortalsHeaders?.ctaLink ||
                      liveSectionLinks?.portalsGetStartedLink ||
                      '/login'
                  )
                }
                className="home-btn home-btn--navy"
              >
                {livePortalsHeaders?.ctaText ||
                  liveSectionLinks?.portalsGetStartedText ||
                  'Get Started Today'}
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        <section id="campus-life" className="relative w-full mx-auto max-w-[1440px] overflow-hidden px-4 py-16 md:px-8 md:py-20 isolate">
          <div className="pointer-events-none absolute -top-10 right-0 h-56 w-56 rounded-full bg-gradient-to-br from-astu-green/10 via-sky-400/5 to-transparent blur-3xl dark:from-emerald-500/15" />

          <div className="relative mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl reveal">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                {liveCampusLifeHeaders?.eyebrow || 'Explore Life At ASTU'}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                {liveCampusLifeHeaders?.title || 'Campus Life & Facilities'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                {liveCampusLifeHeaders?.description ||
                  'Discover campus activities, research facilities, and galleries that define life at Adama Science and Technology University.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  liveSectionLinks?.campusLifeViewAllLink ||
                    liveCampusLifeHeaders?.ctaLink ||
                    '/info/campus-life'
                )
              }
              className="home-btn home-btn--navy home-btn--sm"
            >
              {liveSectionLinks?.campusLifeViewAllText ||
                liveCampusLifeHeaders?.ctaText ||
                'Explore Campus Life'}
              <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const isDuplicateCampusLifeCard = (card: any) => {
                const link = String(card.link || '').toLowerCase();
                const title = String(card.title || '').toLowerCase();
                const action = String(card.action || '').toLowerCase();
                const blob = `${link} ${title} ${action}`;
                return (
                  blob.includes('/gallery') ||
                  blob.includes('#gallery') ||
                  blob.includes('/events') ||
                  blob.includes('#events') ||
                  blob.includes('success-stories') ||
                  blob.includes('alumni-stories') ||
                  title.includes('gallery') ||
                  title.includes('museum') ||
                  (title.includes('event') && !title.includes('student'))
                );
              };
              const source = liveCampusLife.length > 0 ? liveCampusLife : DEFAULT_CAMPUS_LIFE;
              const distinct = source.filter((card: any) => !isDuplicateCampusLifeCard(card));
              return (distinct.length > 0 ? distinct : DEFAULT_CAMPUS_LIFE).slice(0, 3);
            })().map((card: any, idx: number) => {
              const targetRoute =
                card.link ||
                (card.action?.toLowerCase().includes('facilit')
                    ? '/info/facilities'
                    : '/info/campus-life');

              const handleNavigate = () => {
                if (typeof targetRoute === 'string' && targetRoute.startsWith('#')) {
                  document.getElementById(targetRoute.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate(targetRoute);
                }
              };

              return (
                <article
                  key={card.id || card.title || idx}
                  className={`reveal reveal-delay-${(idx % 3) + 1} group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]`}
                >
                  <button type="button" onClick={handleNavigate} className="relative block h-44 w-full overflow-hidden text-left">
                    <img
                      src={mediaUrl(card.image) || card.image || DEFAULT_HERO_IMAGE}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-astu-navy">
                      {card.campus || 'ASTU Campus'}
                    </span>
                  </button>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <button
                        type="button"
                        onClick={handleNavigate}
                        className="cursor-pointer text-left text-lg font-bold text-astu-navy transition-colors hover:text-astu-red dark:text-white dark:hover:text-amber-400"
                      >
                        {card.title}
                      </button>
                      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400 line-clamp-3">
                        {card.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleNavigate}
                      className="mt-4 inline-flex items-center gap-1.5 self-start text-xs font-bold text-astu-navy transition-all hover:gap-2 dark:text-sky-300"
                    >
                      {card.action || 'Learn more'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {liveCampuses.length > 0 && (
          <section id="campuses" className="relative w-full mx-auto max-w-[1440px] px-4 pb-10 md:px-8 md:pb-12">
            <div className="mb-6 max-w-2xl reveal">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">ASTU Campuses</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                Spaces That Shape Alumni Outcomes
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveCampuses.slice(0, 3).map((campus: any, idx: number) => (
                <article
                  key={campus.id || campus.name || idx}
                  className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]"
                >
                  <div className="h-36 overflow-hidden">
                    <img
                      src={mediaUrl(campus.image) || campus.image || DEFAULT_HERO_IMAGE}
                      alt={campus.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-astu-navy dark:text-white">{campus.name}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant dark:text-slate-400 line-clamp-3">
                      {campus.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {industryBridge && (
          <section id="industry-bridge" className="relative w-full mx-auto max-w-[1440px] px-4 py-14 md:px-8 md:py-16">
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[var(--shadow-soft)] dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]">
              <div className="grid lg:grid-cols-2">
                <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                    {industryBridge.eyebrow || 'Industry-Campus Bridge'}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                    {industryBridge.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                    {industryBridge.description}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-[var(--border-color)] dark:bg-[var(--bg-elevated)]">
                      <p className="text-2xl font-black text-astu-navy dark:text-white">
                        {industryBridge.stat1Value}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {industryBridge.stat1Label}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-[var(--border-color)] dark:bg-[var(--bg-elevated)]">
                      <p className="text-2xl font-black text-astu-navy dark:text-white">
                        {industryBridge.stat2Value}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {industryBridge.stat2Label}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        industryBridge.buttonLink ||
                          liveSectionLinks?.industryBridgeButtonLink ||
                          '/info/campus-life'
                      )
                    }
                    className="home-btn home-btn--navy home-btn--sm mt-6 self-start"
                  >
                    {industryBridge.buttonText ||
                      liveSectionLinks?.industryBridgeButtonText ||
                      'Explore Campus Life'}
                    <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
                  </button>
                </div>
                <div className="relative min-h-[240px] bg-slate-100 dark:bg-slate-800">
                  <img
                    src={mediaUrl(industryBridge.image) || industryBridge.image || DEFAULT_HERO_IMAGE}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={handleImageError}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="events" className="relative w-full mx-auto max-w-[1440px] overflow-hidden px-4 py-16 md:px-8 md:py-20 isolate">
          <div id="workshops" className="sr-only" />

          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl reveal">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{liveEventsHeaders?.eyebrow || 'Events & Workshops'}</span>
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                  {liveEventsHeaders?.title || 'Gatherings & Training'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                  {liveEventsHeaders?.description ||
                    'Join campus career expos, technical workshops, and alumni reunions.'}
                </p>
              </div>

              <button
                type="button"
                className="home-btn home-btn--navy home-btn--sm"
                onClick={() =>
                  navigate(
                    liveEventsHeaders?.viewAllLink ||
                      liveSectionLinks?.eventsViewAllLink ||
                      '/events'
                  )
                }
              >
                <span>
                  {(
                    liveEventsHeaders?.viewAllText ||
                    liveSectionLinks?.eventsViewAllText ||
                    'See All Events'
                  )
                    .replace(/→/g, '')
                    .trim()}
                </span>
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            </div>

            {/* Filter Tabs & Carousel Navigation Controls Bar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 dark:border-slate-700/60 pb-4">
              {/* Curved Pill Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 w-fit">
                {[
                  { id: 'ALL', label: 'All Items' },
                  { id: 'BOOTCAMPS', label: 'Bootcamps & Labs' },
                  { id: 'CONFERENCES', label: 'Conferences' },
                  { id: 'CAREER', label: 'Career & Summits' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={eventFilterTab === tab.id}
                    onClick={() => {
                      setEventFilterTab(tab.id as any);
                      setEventSlideIndex(0);
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      eventFilterTab === tab.id
                        ? 'bg-astu-navy text-white shadow-sm dark:bg-sky-600'
                        : 'text-slate-600 hover:text-astu-navy dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Slider Navigation Buttons — only when there is more than one page */}
              {filteredEventsList.length > 3 && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-2 hidden md:inline-block">
                  Page {safeEventSlideIndex + 1} of {eventTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEventSlideIndex((prev) => (prev - 1 + eventTotalPages) % eventTotalPages);
                  }}
                  aria-label="Previous Events Slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:border-astu-navy hover:text-astu-navy dark:hover:border-sky-400 dark:hover:text-sky-300 hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEventSlideIndex((prev) => (prev + 1) % eventTotalPages);
                  }}
                  aria-label="Next Events Slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:border-astu-navy hover:text-astu-navy dark:hover:border-sky-400 dark:hover:text-sky-300 hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              )}
            </div>

            {/* Event Cards Grid / Slider View (3 cards side-by-side matching screenshot) */}
            {filteredEventsList.length === 0 ? (
              <EmptySection message="No upcoming events or workshops are published yet. Check back soon or visit the full events calendar." />
            ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" key={`home-events-${safeEventSlideIndex}-${eventFilterTab}`}>
              {filteredEventsList
                .slice(safeEventSlideIndex * 3, safeEventSlideIndex * 3 + 3)
                .map((event, idx) => (
                  <article
                    key={event.id + '-' + idx}
                    className="animate-card-slide group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,51,102,0.05)] dark:shadow-slate-900/40 hover:shadow-2xl hover:shadow-astu-navy/15 dark:hover:shadow-sky-950/40 hover:-translate-y-2 transition-all duration-300"
                  >
                    {/* Top Image Frame with Smooth Curved Top */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={event.image}
                        onError={handleImageError}
                      />
                      
                      {/* Gradient Dark Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

                      {/* Tag pill on top-left of image (Matching screenshot) */}
                      <span className="absolute top-3.5 left-3.5 rounded-full bg-[#E5252A] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                        {event.category}
                      </span>

                      {/* Status / Live Badge on top-right of image */}
                      {event.statusBadge && (
                        <span className="absolute top-3.5 right-3.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white/95 shadow-sm">
                          {event.statusBadge}
                        </span>
                      )}

                      {/* Bottom Image Curved Wave Accent */}
                      <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-4 text-white dark:text-slate-800">
                        <svg viewBox="0 0 500 20" preserveAspectRatio="none" className="h-full w-full fill-current">
                          <path d="M0,0 C150,20 350,20 500,0 L500,20 L0,20 Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="flex flex-1 flex-col justify-between p-5 pt-4">
                      <div>
                        {/* Title */}
                        <h4
                          onClick={() =>
                            navigate(
                              `/events/${event.id || String(event.title || '')
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')}`,
                              { state: { event } }
                            )
                          }
                          className="text-base sm:text-lg font-bold text-astu-navy dark:text-white line-clamp-1 hover:text-astu-red dark:hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          {event.title}
                        </h4>

                        {/* Date & Location Chips */}
                        <div className="mt-3 flex flex-col gap-1.5 text-xs text-on-surface-variant dark:text-slate-300">
                          <p className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                            <CalendarDays className="h-4 w-4 text-astu-red shrink-0" />
                            <time dateTime={event.date}>{formatHomepageDate(event.date)}</time>
                            {event.time && <span className="text-slate-400 dark:text-slate-500">· {event.time.split(' - ')[0]}</span>}
                          </p>
                          <p className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 line-clamp-1">
                            <MapPin className="h-4 w-4 text-astu-navy dark:text-sky-400 shrink-0" />
                            <span>{event.location}</span>
                          </p>
                        </div>

                        {/* Description snippet */}
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      {/* Action Buttons: Register | View Details (Matching Screenshot) */}
                      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          type="button"
                          className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 ${
                            registeredTitles.includes(event.title)
                              ? 'bg-emerald-600 text-white cursor-default shadow-emerald-600/20'
                              : 'bg-astu-navy text-white hover:bg-astu-navy/90 hover:shadow-md hover:shadow-astu-navy/20 dark:bg-sky-600 dark:hover:bg-sky-500'
                          }`}
                          onClick={() => handleRegisterClick({ title: event.title, kind: event.kind, date: event.date, location: event.location, id: event.id })}
                        >
                          {registeredTitles.includes(event.title) ? '✓ Registered' : 'Register'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/events/${event.id || String(event.title || '')
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')}`,
                              { state: { event } }
                            )
                          }
                          className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          aria-label={`Share ${event.title}`}
                          title="Share this event"
                          onClick={(e) => {
                            e.stopPropagation();
                            const slug = (event.id || String(event.title || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            setShareMediaModalItem({
                              id: event.id || slug,
                              title: event.title,
                              subtitle: `${formatHomepageDate(event.date)} · ${event.location || 'ASTU Campus'}`,
                              text: event.description,
                              image: event.image,
                              url: `/events/${slug}`,
                              badge: event.category || 'Event',
                              type: 'event',
                            });
                          }}
                          className="shrink-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-astu-navy dark:hover:text-white transition-all cursor-pointer"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
            )}

            {/* Slide Pagination Dots / Indicators (Curved Pill Indicators) */}
            {eventTotalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Events slides">
                {Array.from({ length: eventTotalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEventSlideIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-selected={safeEventSlideIndex === i}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      safeEventSlideIndex === i
                        ? 'w-8 bg-astu-navy dark:bg-sky-400'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}
        </section>

        <section
          id="news"
          className="relative w-full mx-auto max-w-[1440px] overflow-hidden px-4 py-16 md:px-8 md:py-20 isolate"
          onMouseEnter={() => setIsNewsTimerPaused(true)}
          onMouseLeave={() => setIsNewsTimerPaused(false)}
        >
            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl reveal">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                  <span className="h-2 w-2 rounded-full bg-astu-red animate-pulse" />
                  <span>
                    {liveNewsHeaders?.eyebrow ||
                      liveAnnouncementsHeaders?.eyebrow ||
                      'Official Updates'}
                  </span>
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                  {liveNewsHeaders?.title ||
                    liveAnnouncementsHeaders?.title ||
                    'News & Announcements'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                  {liveNewsHeaders?.description ||
                    liveAnnouncementsHeaders?.subscribeDesc ||
                    'University notices, academic bulletins, and alumni community circulars.'}
                </p>
              </div>

              <button
                type="button"
                className="home-btn home-btn--navy home-btn--sm"
                onClick={() =>
                  navigate(
                    liveSectionLinks?.announcementsViewAllLink || '/announcements'
                  )
                }
              >
                <span>
                  {liveSectionLinks?.announcementsViewAllText || 'See All News'}
                </span>
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            </div>

            {/* Slider Controls Bar with Auto-play Progress Timer — only when content exists */}
            {totalNewsSlides > 0 && (
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 dark:border-slate-700/60 pb-4">
              {/* Timer Progress Indicator & Status */}
              <div className="flex items-center gap-3">
                {totalNewsSlides > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsNewsTimerPaused(!isNewsTimerPaused)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
                        isNewsTimerPaused
                          ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}
                      title={isNewsTimerPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
                      aria-label={isNewsTimerPaused ? "Resume news auto-rotation" : "Pause news auto-rotation"}
                      aria-pressed={isNewsTimerPaused}
                    >
                      {isNewsTimerPaused ? (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Paused</span>
                        </>
                      ) : (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-current" />
                          <span>Auto-sliding (5s)</span>
                        </>
                      )}
                    </button>

                    <div className="relative h-1.5 w-32 sm:w-44 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" aria-hidden="true">
                      <div
                        className={`h-full bg-gradient-to-r from-astu-navy to-sky-500 dark:from-sky-400 dark:to-emerald-400 transition-all duration-75 rounded-full ${
                          isNewsTimerPaused ? 'opacity-50' : 'opacity-100'
                        }`}
                        style={{ width: `${newsTimerProgress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Latest notices</span>
                )}
              </div>

              {/* Slider Pagination Controls */}
              {totalNewsSlides > 1 && (
              <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Slide {newsSlideIndex + 1} of {totalNewsSlides}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleNewsSlideChange(newsSlideIndex - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 disabled:opacity-40"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNewsSlideChange(newsSlideIndex + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 disabled:opacity-40"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              )}
            </div>
            )}

            {/* News cards — published content only */}
            {displayNewsList.length === 0 ? (
              <EmptySection message="No news or announcements are published yet. Official notices will appear here when available." />
            ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayNewsList
                .slice(newsSlideIndex * NEWS_PER_SLIDE, newsSlideIndex * NEWS_PER_SLIDE + NEWS_PER_SLIDE)
                .map((news: any, idx: number) => {
                  const categoryMeta = getNewsCategoryMeta(news);
                  return (
                    <article
                      key={news.id || `news-${newsSlideIndex}-${idx}`}
                      onClick={() =>
                        navigate(
                          `/announcements/${news.id || String(news.title || '')
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')}`
                        )
                      }
                      className="animate-card-slide group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-6 shadow-[0_4px_20px_rgba(0,51,102,0.05)] dark:shadow-slate-900/40 hover:shadow-2xl hover:shadow-astu-navy/15 dark:hover:shadow-sky-950/40 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                    >
                      {/* Top Category Badge & Pill */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryMeta.badgeClass}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${categoryMeta.dotClass}`} />
                          <span>{categoryMeta.label}</span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          Official Notice
                        </span>
                      </div>

                      {/* Middle: Title & Excerpt */}
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-bold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                          {news.title}
                        </h4>
                        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {news.excerpt || 'Read the official dispatch from Adama Science and Technology University regarding campus activities, academic schedules, and student outcomes.'}
                        </p>
                      </div>

                      {/* Bottom: Date, Read Time & Action */}
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                          <CalendarDays className="h-3.5 w-3.5 text-astu-red dark:text-rose-400 shrink-0" />
                          <span>{formatHomepageDate(news.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Share ${news.title}`}
                            title="Share this announcement"
                            onClick={(e) => {
                              e.stopPropagation();
                              const slug = (news.id || String(news.title || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                              setShareMediaModalItem({
                                id: news.id || slug,
                                title: news.title,
                                subtitle: `${categoryMeta.label} · ASTU Official Notice`,
                                text: news.excerpt,
                                image: news.image,
                                url: `/announcements/${slug}`,
                                badge: categoryMeta.label,
                                type: 'announcement',
                              });
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-astu-navy dark:hover:text-white transition-all cursor-pointer"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/announcements/${news.id || String(news.title || '')
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, '-')}`
                              );
                            }}
                            className="inline-flex items-center gap-1 font-bold text-astu-navy dark:text-amber-400 group-hover:translate-x-1 transition-transform"
                          >
                            <span>Read More</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
            )}

            {/* Pagination Dots at Bottom */}
            {totalNewsSlides > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: totalNewsSlides }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleNewsSlideChange(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      newsSlideIndex === i
                        ? 'w-8 bg-astu-navy dark:bg-sky-400'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}
        </section>

        {/* =========================================================================
            CAMPUS MOMENTS (GALLERY) SECTION — homepage shows 3; full archive on /gallery
            ========================================================================= */}
        <section id="gallery" className="relative w-full mx-auto max-w-[1440px] overflow-hidden px-4 py-16 md:px-8 md:py-20 isolate">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl reveal">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                  <Image className="h-3.5 w-3.5" />
                  <span>{liveGalleryHeaders?.eyebrow || 'Campus Moments'}</span>
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                  {liveGalleryHeaders?.title || 'Photo Gallery'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                  {liveGalleryHeaders?.subtitle ||
                    liveGalleryHeaders?.description ||
                    'A curated look at graduation stages, research exhibitions, and campus life at ASTU.'}
                </p>
              </div>

              <button
                type="button"
                className="home-btn home-btn--navy home-btn--sm"
                onClick={() =>
                  navigate(liveGalleryHeaders?.buttonLink || '/gallery')
                }
              >
                <span>{liveGalleryHeaders?.buttonText || 'Explore Full Gallery'}</span>
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            </div>

            {/* Gallery Grid — only 3 moments on the homepage */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGalleryList.slice(0, 3).map((photo: any, idx: number) => {
                const photoSrc = mediaUrl(photo.src) || photo.src || '/images/astu-building.jpg';
                return (
                  <article
                    key={photo.id || idx}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                    onClick={() => {
                      setActiveLightboxPhoto(photo);
                      setLightboxIndex(idx);
                    }}
                  >
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={photoSrc}
                        alt={photo.title || 'ASTU Campus Moment'}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = '/images/astu-building.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                      {/* Top Album Pill */}
                      <span className="absolute top-3.5 left-3.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-astu-navy dark:text-sky-300 shadow-sm">
                        {photo.album || 'Campus Moment'}
                      </span>

                      {/* Quick Share Button */}
                      <button
                        type="button"
                        aria-label="Share this moment"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareMediaModalItem({
                            id: photo.id || String(idx),
                            title: photo.title || 'ASTU Campus Moment',
                            subtitle: photo.album || 'Campus Gallery',
                            text: `Explore this campus moment from Adama Science and Technology University: ${photo.title}`,
                            image: photoSrc,
                            url: '/gallery',
                            type: 'gallery',
                          });
                        }}
                        className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-astu-navy"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Bottom Info inside image */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="text-base font-bold leading-snug line-clamp-1 drop-shadow-sm group-hover:text-amber-300 transition-colors">
                          {photo.title || 'Campus Moment'}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-300 flex items-center justify-between">
                          <span>{photo.date || 'Campus Archive'}</span>
                          <span className="text-[11px] font-semibold text-sky-300 group-hover:underline">Click to view</span>
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
        </section>

        {/* =========================================================================
            VIDEO GALLERY — homepage shows 3; full archive on /info/video-gallery
            ========================================================================= */}
        <section id="video-gallery" className="relative w-full mx-auto max-w-[1440px] overflow-hidden px-4 py-16 md:px-8 md:py-20 isolate">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl reveal">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Video Highlights</span>
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                  Video Gallery
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                  Watch applied engineering showcases, event recordings, and campus virtual tours.
                </p>
              </div>

              <button
                type="button"
                className="home-btn home-btn--navy home-btn--sm"
                onClick={() => navigate('/info/video-gallery')}
              >
                <span>View All Videos</span>
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            </div>

            {/* Video Cards Grid — only 3 videos on the homepage */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {liveVideos.slice(0, 3).map((video: any, idx: number) => {
                const videoImg = mediaUrl(video.image) || video.image || '/images/astu-building.jpg';
                return (
                  <article
                    key={video.id || idx}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Thumbnail with interactive Play Button */}
                    <div
                      className="relative h-48 w-full overflow-hidden bg-slate-900 cursor-pointer"
                      onClick={() => setActiveVideoModalItem(video)}
                    >
                      <img
                        src={videoImg}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = '/images/astu-building.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/30 to-black/10" />

                      {/* Play Button Overlay with ripple */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-astu-red text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-rose-600">
                          <Play className="h-6 w-6 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Top Badges */}
                      <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {video.category || 'Highlights'}
                      </span>
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/75 px-2.5 py-0.5 text-[11px] font-bold text-white flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{video.duration || 'Video'}</span>
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <h4
                          onClick={() => setActiveVideoModalItem(video)}
                          className="cursor-pointer text-base sm:text-lg font-bold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-amber-400 transition-colors line-clamp-1"
                        >
                          {video.title}
                        </h4>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {video.subtitle || video.description || 'Watch the official recording and highlights from Adama Science and Technology University.'}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setActiveVideoModalItem(video)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-astu-navy dark:text-sky-300 hover:text-astu-red dark:hover:text-sky-200 transition-colors"
                        >
                          <PlayCircle className="h-4 w-4" />
                          <span>Watch Highlights</span>
                        </button>
                        <button
                          type="button"
                          aria-label="Share video"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareMediaModalItem({
                              id: video.id || String(idx),
                              title: video.title,
                              subtitle: video.category || 'Video Highlights',
                              text: `Watch: ${video.title} - Adama Science and Technology University`,
                              image: videoImg,
                              url: '/info/video-gallery',
                              type: 'video',
                            });
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-astu-navy dark:hover:text-white transition-all cursor-pointer"
                          title="Share this video"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
        </section>

        <section id="success-stories" className="relative w-full mx-auto max-w-[1440px] overflow-hidden px-4 py-16 md:px-8 md:py-20 isolate">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div className="max-w-2xl reveal">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                {liveStoriesHeaders?.eyebrow || 'Success Stories'}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                {liveStoriesHeaders?.title || 'Alumni Success Stories'}
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400 md:mx-0">
                {liveStoriesHeaders?.description ||
                  'Journeys of ASTU graduates building careers across industry, research, and entrepreneurship.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/info/alumni-stories?submit=true')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-astu-red to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Share Your Story</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    liveSectionLinks?.storiesViewAllLink || '/info/alumni-stories'
                  )
                }
                className="home-btn home-btn--navy home-btn--sm"
              >
                {liveSectionLinks?.storiesViewAllText || 'See All Stories'}
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveStories.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptySection message="Alumni success stories will appear here once published by the university content team." />
              </div>
            ) : (
              liveStories.slice(storySlideIndex * 3, storySlideIndex * 3 + 3).map((story, idx) => (
                <article
                  key={story.id || idx}
                  className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant dark:border-[var(--border-color)] bg-white dark:bg-[var(--bg-card)] p-4 card-hover shadow-[var(--shadow-soft)] flex flex-col justify-between`}
                >
                  <div>
                    {story.image ? (
                      <img
                        src={story.image}
                        alt={story.name ? `Portrait of ${story.name}` : 'Alumni success story'}
                        className="h-36 w-full rounded-xl object-cover mb-3 bg-slate-100 dark:bg-slate-800"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.onerror = null;
                          img.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <h4 className="font-semibold text-astu-navy dark:text-white">{story.name}</h4>
                    <p className="text-xs text-on-surface-variant dark:text-slate-400">
                      {[story.role, story.company].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant dark:text-slate-400 line-clamp-3">{story.text}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      className="text-xs font-bold text-astu-navy dark:text-amber-400 hover:underline self-start cursor-pointer inline-flex items-center gap-1"
                      onClick={() =>
                        navigate(
                          `/stories/${story.id || String(story.name || '')
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')}`
                        )
                      }
                    >
                      Read Story <ArrowRight className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setShareStoryModalItem({
                          id: story.id,
                          title: story.name,
                          subtitle: [story.role, story.company].filter(Boolean).join(' · '),
                          text: story.text,
                          image: story.image,
                          url: `/stories/${story.id || String(story.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                          type: 'story',
                        })
                      }
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-astu-navy dark:hover:text-white transition-all cursor-pointer"
                      title="Share this alumni story"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          {totalStorySlides > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleStorySlideChange(storySlideIndex - 1)}
                aria-label="Previous stories slide"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Slide {storySlideIndex + 1} of {totalStorySlides}
              </span>
              <button
                type="button"
                onClick={() => handleStorySlideChange(storySlideIndex + 1)}
                aria-label="Next stories slide"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        <section id="giving" className="relative w-full py-16 md:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[var(--bg-page)] dark:via-[var(--bg-card)] dark:to-[var(--bg-page)] overflow-hidden border-t border-slate-100 dark:border-[var(--border-color)]">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 right-8 w-64 h-64 rounded-full bg-astu-navy/5 dark:bg-sky-500/10 blur-3xl" />
            <div className="absolute -bottom-12 left-8 w-64 h-64 rounded-full bg-astu-green/5 dark:bg-emerald-500/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8">
            <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div className="max-w-2xl space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-astu-navy/10 text-astu-navy dark:bg-sky-500/15 dark:text-sky-300 text-xs font-bold uppercase tracking-wider">
                  <Heart className="h-3.5 w-3.5 fill-astu-red text-astu-red" />
                  ASTU Alumni Giving
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {liveGivingSection?.title || 'Support Future Innovators & Campus Research'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {liveGivingSection?.subtitle || 'Gifts support merit scholarships, research laboratories, student incubators, and emergency support. Confirm any tax treatment with your advisor or the Alumni Office.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/donations')}
                className="home-btn home-btn--navy home-btn--sm shrink-0"
              >
                <Heart className="home-btn__icon fill-amber-400 text-amber-400" aria-hidden="true" />
                {liveGivingSection?.buttonText || 'Explore All Causes'}
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            </div>

            {(() => {
              const activeCampaigns = orderedDonationCampaigns;
              const filteredList = activeCampaigns.filter(
                (c: any) => homeDonationCategory === 'ALL' || c.category === homeDonationCategory
              );
              const displayedCards = filteredList.slice(0, 3);

              const categoryBadges: Record<string, { bg: string; text: string; ring: string }> = {
                Scholarship: { bg: 'bg-blue-600/95', text: 'text-white', ring: 'ring-blue-400/40' },
                Research: { bg: 'bg-emerald-600/95', text: 'text-white', ring: 'ring-emerald-400/40' },
                Infrastructure: { bg: 'bg-amber-600/95', text: 'text-white', ring: 'ring-amber-400/40' },
                Innovation: { bg: 'bg-indigo-600/95', text: 'text-white', ring: 'ring-indigo-400/40' },
                'Student Welfare': { bg: 'bg-rose-600/95', text: 'text-white', ring: 'ring-rose-400/40' },
                'Emergency Fund': { bg: 'bg-red-600/95', text: 'text-white', ring: 'ring-red-400/40' },
              };

              return (
                <div className="space-y-4">
                  {donationCategories.length > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/90 dark:bg-[var(--bg-card)] px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-[var(--border-color)] shadow-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mr-0.5">Focus:</span>
                        {donationCategories.map((cat) => {
                          const isActive = homeDonationCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              aria-pressed={homeDonationCategory === cat}
                              onClick={() => {
                                setHomeDonationCategory(cat);
                                setShowAllHomeDonations(false);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? 'bg-astu-navy text-white shadow-sm dark:bg-sky-600'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                              }`}
                            >
                              {cat === 'ALL' ? 'All Causes' : cat}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>
                          <span className="text-slate-900 dark:text-white font-bold">{displayedCards.length}</span> featured
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {displayedCards.map((c: any, idx: number) => {
                      const goal = Number(c.goal || c.targetAmount) || 0;
                      const raised = Number(c.raised) || 0;
                      const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
                      const donors = Number(c.donorCount) || 0;
                      const remaining = Math.max(0, goal - raised);
                      const category = c.category || 'Initiative';
                      const catBadge = categoryBadges[category] || { bg: 'bg-slate-800/95', text: 'text-white', ring: 'ring-white/20' };
                      const campaignImage = getHomeCampaignImage(c);

                      const isFullyFunded = goal > 0 && percent >= 100;
                      const isAlmostFunded = goal > 0 && percent >= 75 && !isFullyFunded;
                      const isUrgent = goal > 0 && percent < 40;

                      let statusConfig: {
                        label: string;
                        badgeClass: string;
                        dotColor: string;
                        isPulsing: boolean;
                      };

                      if (isFullyFunded) {
                        statusConfig = {
                          label: 'Goal Reached',
                          badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40',
                          dotColor: 'bg-emerald-400',
                          isPulsing: false,
                        };
                      } else if (isAlmostFunded) {
                        statusConfig = {
                          label: `Nearly Funded • ${percent}%`,
                          badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40',
                          dotColor: 'bg-emerald-400',
                          isPulsing: true,
                        };
                      } else if (isUrgent) {
                        statusConfig = {
                          label: 'Needs Support',
                          badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-400/40',
                          dotColor: 'bg-amber-400',
                          isPulsing: true,
                        };
                      } else {
                        statusConfig = {
                          label: 'Active Campaign',
                          badgeClass: 'bg-slate-900/80 text-sky-300 border-sky-400/40',
                          dotColor: 'bg-sky-400',
                          isPulsing: false,
                        };
                      }

                      const barColor = isFullyFunded || isAlmostFunded
                        ? 'from-emerald-500 via-teal-400 to-emerald-400'
                        : isUrgent
                          ? 'from-amber-400 via-orange-400 to-rose-400'
                          : 'from-astu-navy via-blue-600 to-astu-green dark:from-sky-500 dark:via-blue-500 dark:to-emerald-400';

                      return (
                        <article
                          key={c.id || idx}
                          className={`reveal reveal-delay-${(idx % 3) + 1} group flex flex-col rounded-2xl bg-white dark:bg-[var(--bg-card)] border border-slate-200/90 dark:border-[var(--border-color)] shadow-[var(--shadow-soft)] hover:-translate-y-1.5 hover:shadow-xl hover:border-astu-navy/35 dark:hover:border-sky-500/40 transition-all duration-300 overflow-hidden`}
                        >
                          {/* Campaign photo cover */}
                          <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                            <img
                              src={campaignImage}
                              alt={c.title}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                              onError={handleImageError}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15 pointer-events-none" />

                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md ring-1 ${catBadge.bg} ${catBadge.text} ${catBadge.ring}`}>
                                {category}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${statusConfig.badgeClass}`}>
                                <span className="relative flex h-1.5 w-1.5">
                                  {statusConfig.isPulsing && (
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.dotColor}`} />
                                  )}
                                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusConfig.dotColor}`} />
                                </span>
                                {statusConfig.label}
                              </span>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                                <Users className="h-3.5 w-3.5 text-amber-400" />
                                {donors.toLocaleString()} {donors === 1 ? 'donor' : 'donors'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShareModalCampaign({ ...c, image: campaignImage, goal })}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 transition-all cursor-pointer"
                                title="Share this cause"
                                aria-label={`Share ${c.title}`}
                              >
                                <Share2 className="h-3.5 w-3.5" />
                                Share
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col p-4 md:p-5">
                            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-astu-navy dark:group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                              {c.title}
                            </h3>
                            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                              {c.description || 'Support ASTU causes and make a lasting impact for future generations of engineers and researchers.'}
                            </p>

                            <div className="mt-auto pt-4">
                              <div className="flex items-end justify-between mb-2">
                                <div>
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Raised</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-astu-navy dark:text-white tracking-tight">
                                      {raised.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold">ETB</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Target</span>
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {goal > 0 ? `${goal.toLocaleString()} ETB` : 'Open'}
                                  </span>
                                  {goal > raised && (
                                    <span className="block text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                      {remaining.toLocaleString()} left
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden border border-slate-200/70 dark:border-slate-700">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 relative`}
                                  style={{ width: `${Math.max(goal > 0 ? 5 : 100, percent)}%` }}
                                  role="progressbar"
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-valuenow={percent}
                                  aria-label={`${c.title} funding progress`}
                                >
                                  <div className="absolute inset-0 bg-white/20 rounded-full opacity-40 animate-pulse pointer-events-none" />
                                </div>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-[11px]">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold">
                                  <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                                  {goal > 0 ? `${percent}% funded` : 'Open cause'}
                                </span>
                              </div>

                              {/* Fast Pay Strip */}
                              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                  Fast Pay:
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDonationCampaign(c);
                                      setDonationPayMethod('telebirr');
                                      setIsDonationModalOpen(true);
                                    }}
                                    className="text-[9px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-700/50 hover:scale-105 transition-transform cursor-pointer"
                                    title="Telebirr instant payment"
                                  >
                                    Telebirr
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDonationCampaign(c);
                                      setDonationPayMethod('cbe');
                                      setIsDonationModalOpen(true);
                                    }}
                                    className="text-[9px] font-extrabold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-blue-200/60 dark:border-sky-700/50 hover:scale-105 transition-transform cursor-pointer"
                                    title="CBE Birr instant payment"
                                  >
                                    CBE Birr
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDonationCampaign(c);
                                      setDonationPayMethod('card');
                                      setIsDonationModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-800 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 hover:scale-105 transition-transform cursor-pointer"
                                    title="Chapa Live Checkout"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Chapa
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDonateClick(c)}
                                  className="flex-1 group/btn inline-flex items-center justify-center gap-2 rounded-xl bg-astu-navy dark:bg-sky-600 hover:brightness-110 text-white font-bold text-xs py-2.5 px-3 shadow-md shadow-astu-navy/15 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                                >
                                  <Heart className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0 group-hover/btn:scale-110 transition-transform" />
                                  <span>Support This Cause</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShareModalCampaign({ ...c, image: campaignImage, goal })}
                                  className="shrink-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-astu-navy/5 hover:text-astu-navy hover:border-astu-navy/30 dark:hover:bg-sky-950/40 dark:hover:text-sky-300 dark:hover:border-sky-500 transition-all cursor-pointer"
                                  title="Share on Telegram, LinkedIn, WhatsApp, or copy link"
                                  aria-label={`Share ${c.title}`}
                                >
                                  <Share2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/donations?cause=${encodeURIComponent(c.id)}`)}
                                  className="shrink-0 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-pointer"
                                  title="View campaign details"
                                >
                                  Details
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {displayedCards.length === 0 && (
                    <div className="py-10 text-center bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-dashed border-slate-200 dark:border-[var(--border-color)] p-6 space-y-2">
                      <Heart className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No campaigns found in this category.</p>
                      <button
                        onClick={() => setHomeDonationCategory('ALL')}
                        className="text-xs text-astu-navy dark:text-sky-300 font-extrabold hover:underline"
                      >
                        Show All Causes
                      </button>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => navigate('/donations')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-astu-navy dark:bg-sky-600 text-white text-xs font-bold shadow-md hover:shadow-lg hover:brightness-110 transition-all cursor-pointer"
                    >
                      Explore all causes in Giving Portal
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        <section id="partners" className="relative w-full mx-auto max-w-[1440px] overflow-hidden px-4 py-16 md:px-8 md:py-20 isolate">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl reveal">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                {livePartnersHeaders?.eyebrow || 'Our Partners'}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                {livePartnersHeaders?.title || 'Partner Companies'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                {livePartnersHeaders?.description ||
                  'Institutional partners supporting employability, internships, and research collaboration.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/partners')}
              className="home-btn home-btn--navy home-btn--sm"
            >
              View all partners
              <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
            </button>
          </div>

          {partnersLoading ? (
            <div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
              aria-label="Loading partners"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-24 items-center justify-center rounded-2xl border border-slate-200/90 bg-white dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]"
                >
                  <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/60" />
                </div>
              ))}
            </div>
          ) : livePartners.length === 0 ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center dark:border-[var(--border-color)]">
              <Building2 className="h-7 w-7 text-slate-400" />
              <p className="mt-3 text-sm font-bold text-astu-navy dark:text-white">No published partners yet</p>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Partner logos will appear here once published from the ASTU CMS.
              </p>
            </div>
          ) : (
            <div role="list" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {livePartners.slice(0, 6).map((partner) => {
                const logoUrl = partner.logo ? mediaUrl(partner.logo) : '';
                const logoFailed = failedPartnerLogos.has(partner.id);
                const PartnerLogoComp = partnerLogos[partner.name];

                return (
                  <article
                    key={partner.id}
                    role="listitem"
                    title={partner.name}
                    className="group flex h-24 items-center justify-center rounded-2xl border border-slate-200/90 bg-white px-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]"
                  >
                    {logoUrl && !logoFailed ? (
                      <img
                        src={logoUrl}
                        alt={`${partner.name} logo`}
                        loading="lazy"
                        decoding="async"
                        className="max-h-12 max-w-full object-contain opacity-85 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                        onError={() =>
                          setFailedPartnerLogos((current) => new Set(current).add(partner.id))
                        }
                      />
                    ) : PartnerLogoComp ? (
                      <PartnerLogoComp className="max-h-10 w-auto opacity-85 transition duration-300 group-hover:opacity-100" />
                    ) : (
                      <span className="text-center text-xs font-bold uppercase tracking-wide text-astu-navy/70 transition group-hover:text-astu-navy dark:text-slate-300 dark:group-hover:text-white">
                        {partner.name}
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>


        <section id="faq" className="relative w-full mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-20">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
              {liveFaqHeaders?.eyebrow || 'FAQ'}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
              {liveFaqHeaders?.title || 'Frequently Asked Questions'}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-on-surface-variant dark:text-slate-400">
              {liveFaqHeaders?.description ||
                'Common questions about ASTU-AMS, tracer studies, and alumni services.'}
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {(liveFaq.length > 0 ? liveFaq : DEFAULT_FAQ).slice(0, 4).map((item: any, idx: number) => {
              const itemId = String(item.id || idx);
              const isOpen = openFaqId === itemId;
              return (
                <div
                  key={itemId}
                  className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[var(--shadow-soft)] transition-all dark:border-[var(--border-color)] dark:bg-[var(--bg-card)] ${
                    isOpen ? 'ring-1 ring-astu-navy/20 dark:ring-sky-400/30' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : itemId)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${itemId}`}
                    id={`faq-button-${itemId}`}
                  >
                    <span className="text-sm font-bold text-astu-navy dark:text-white md:text-base">
                      {item.question}
                    </span>
                    <HelpCircle
                      className={`h-5 w-5 shrink-0 text-astu-red transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-panel-${itemId}`}
                      role="region"
                      aria-labelledby={`faq-button-${itemId}`}
                      className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-on-surface-variant dark:border-[var(--border-color)] dark:text-slate-300"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center reveal">
            <button
              type="button"
              onClick={() =>
                navigate(liveSectionLinks?.faqViewAllLink || '/info/faq')
              }
              className="inline-flex items-center gap-2 text-sm font-bold text-astu-navy hover:text-astu-red dark:text-sky-300 dark:hover:text-amber-400"
            >
              {liveSectionLinks?.faqViewAllText || 'View all FAQs'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {(tracerSpotlight || mentorshipStats || employerFeedback) && (
          <section id="outcomes" className="relative w-full mx-auto max-w-[1440px] px-4 py-14 md:px-8 md:py-16">
            <div className="mb-8 max-w-2xl reveal">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                Institutional Outcomes
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                Tracer Studies, Mentorship & Employer Insight
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                Live CMS blocks that keep accreditation, mentoring, and industry feedback connected to the public homepage.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {tracerSpotlight && (
                <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[var(--shadow-soft)] dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/10 text-astu-navy dark:bg-sky-500/15 dark:text-sky-300">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-astu-navy dark:text-white">
                    {tracerSpotlight.title || 'Tracer Study'}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant dark:text-slate-400 line-clamp-4">
                    {tracerSpotlight.description}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 px-2 py-2 dark:bg-[var(--bg-elevated)]">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Response</dt>
                      <dd className="text-sm font-black text-astu-navy dark:text-white">{tracerSpotlight.responseRate || '—'}</dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2 py-2 dark:bg-[var(--bg-elevated)]">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Batch</dt>
                      <dd className="text-sm font-black text-astu-navy dark:text-white">{tracerSpotlight.targetBatch || '—'}</dd>
                    </div>
                  </dl>
                  {tracerSpotlight.deadline && (
                    <p className="mt-3 text-[11px] font-semibold text-astu-red">
                      Deadline: {tracerSpotlight.deadline}
                    </p>
                  )}
                </article>
              )}
              {mentorshipStats && (
                <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[var(--shadow-soft)] dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-astu-navy dark:text-white">Mentorship Network</h3>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant dark:text-slate-400">
                    Mentors and mentees connected through ASTU-AMS career guidance programs.
                  </p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 px-2 py-2 dark:bg-[var(--bg-elevated)]">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Mentors</dt>
                      <dd className="text-sm font-black text-astu-navy dark:text-white">{mentorshipStats.mentors ?? '—'}</dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2 py-2 dark:bg-[var(--bg-elevated)]">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Mentees</dt>
                      <dd className="text-sm font-black text-astu-navy dark:text-white">{mentorshipStats.mentees ?? '—'}</dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2 py-2 dark:bg-[var(--bg-elevated)]">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Sessions</dt>
                      <dd className="text-sm font-black text-astu-navy dark:text-white">{mentorshipStats.sessions ?? '—'}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => navigate(liveSectionLinks?.footerMentorshipLink || '/info/mentorship')}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-astu-navy hover:text-astu-red dark:text-sky-300"
                  >
                    Explore mentorship
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              )}
              {employerFeedback && (
                <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[var(--shadow-soft)] dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-astu-navy dark:text-white">
                    {employerFeedback.title || 'Employer Feedback'}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant dark:text-slate-400 line-clamp-4">
                    {employerFeedback.description}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 px-2 py-2 dark:bg-[var(--bg-elevated)]">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Submissions</dt>
                      <dd className="text-sm font-black text-astu-navy dark:text-white">{employerFeedback.submissions ?? '—'}</dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2 py-2 dark:bg-[var(--bg-elevated)]">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Companies</dt>
                      <dd className="text-sm font-black text-astu-navy dark:text-white">{employerFeedback.companies ?? '—'}</dd>
                    </div>
                  </dl>
                </article>
              )}
            </div>
          </section>
        )}

        {researchHighlights && (
          <section id="research" className="relative w-full mx-auto max-w-[1440px] px-4 pb-10 md:px-8 md:pb-12">
            <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-6 shadow-[var(--shadow-soft)] dark:border-[var(--border-color)] dark:from-[var(--bg-card)] dark:via-[var(--bg-elevated)] dark:to-[var(--bg-page)] md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">Research Highlights</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                {researchHighlights.title || 'Research That Powers Industry'}
              </h2>
              {researchHighlights.description && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                  {researchHighlights.description}
                </p>
              )}
              {Array.isArray(researchHighlights.stats) && researchHighlights.stats.length > 0 && (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {researchHighlights.stats.slice(0, 3).map((stat: any, idx: number) => (
                    <div
                      key={stat.label || idx}
                      className="rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 text-center dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]"
                    >
                      <p className="text-xl font-black text-astu-navy dark:text-white">{stat.value}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {careerCta && (
          <section id="career-cta" className="relative w-full mx-auto max-w-[1440px] px-4 pb-14 md:px-8 md:pb-16">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-astu-navy/15 bg-astu-navy px-6 py-6 text-white shadow-[var(--shadow-soft)] md:flex-row md:items-center md:px-8">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-green">
                  {careerCta.eyebrow || 'Career Services'}
                </p>
                <h2 className="mt-1 text-xl font-black md:text-2xl">{careerCta.title}</h2>
                {careerCta.description && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">{careerCta.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate(careerCta.route || '/info/overview')}
                className="home-btn home-btn--ghost-light home-btn--sm shrink-0"
              >
                {careerCta.buttonLabel || 'Open Career Portal'}
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {liveAccreditation?.title && (
          <section id="accreditation" className="relative w-full mx-auto max-w-[1440px] px-4 pb-16 md:px-8 md:pb-20">
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 p-6 shadow-[var(--shadow-soft)] dark:border-[var(--border-color)] dark:from-[var(--bg-card)] dark:via-[var(--bg-elevated)] dark:to-[var(--bg-page)] md:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-astu-red">
                    {liveAccreditation.eyebrow || 'Quality Assurance'}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-astu-navy dark:text-white md:text-3xl">
                    {liveAccreditation.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                    {liveAccreditation.description}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        title: liveAccreditation.point1Title,
                        desc: liveAccreditation.point1Desc,
                      },
                      {
                        title: liveAccreditation.point2Title,
                        desc: liveAccreditation.point2Desc,
                      },
                    ]
                      .filter((p) => p.title)
                      .map((point) => (
                        <div
                          key={point.title}
                          className="rounded-xl border border-slate-200/80 bg-white/80 p-4 dark:border-[var(--border-color)] dark:bg-[var(--bg-card)]"
                        >
                          <p className="text-sm font-bold text-astu-navy dark:text-white">
                            {point.title}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant dark:text-slate-400">
                            {point.desc}
                          </p>
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        liveAccreditation.buttonLink ||
                          liveSectionLinks?.accreditationButtonLink ||
                          '/info/impact-numbers'
                      )
                    }
                    className="home-btn home-btn--navy home-btn--sm mt-6"
                  >
                    {liveAccreditation.buttonText ||
                      liveSectionLinks?.accreditationButtonText ||
                      'View Impact Numbers'}
                    <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[liveAccreditation.image1, liveAccreditation.image2]
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((src: string, idx: number) => (
                      <img
                        key={`${src}-${idx}`}
                        src={mediaUrl(src) || src}
                        alt=""
                        className={`h-40 w-full rounded-2xl object-cover shadow-sm md:h-48 ${
                          idx === 1 ? 'mt-6' : ''
                        }`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                    ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section
          id="community"
          className="relative w-full overflow-hidden bg-gradient-to-br from-astu-navy via-primary-container to-slate-900 py-16 md:py-20"
        >
          <div id="cta" className="sr-only" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-astu-green/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-astu-red/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8">
            <div className="mb-10 text-center reveal">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-astu-green">
                <Globe className="h-3.5 w-3.5" />
                {liveCommunitySection?.title || 'ASTU Alumni Community'}
              </span>
              <h2 className="mt-4 text-2xl font-black text-white md:text-4xl">
                {bottomCta?.title || liveCtaSection?.title || (
                  <>
                    Your Network <span className="text-astu-green">Around the World</span>
                  </>
                )}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">
                {bottomCta?.description ||
                  liveCommunitySection?.subtitle ||
                  liveCtaSection?.description ||
                  'Connect with fellow alumni, discover career opportunities, and contribute to university excellence.'}
              </p>
            </div>

            {networkVoices.length > 0 ? (
              <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {networkVoices.slice(0, 3).map((post: any, idx: number) => (
                  <article
                    key={post.id || post.name || idx}
                    className={`reveal reveal-delay-${(idx % 3) + 1} group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/10 hover:border-astu-green/30 hover:shadow-[0_20px_40px_-20px_rgba(16,185,129,0.35)]`}
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <Quote className="h-5 w-5 text-astu-green/70 transition group-hover:text-astu-green" />
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-300">
                          {post.source === 'story' ? 'Success Story' : post.source === 'community' ? 'Community' : 'Testimonial'}
                        </span>
                      </div>
                      <p className="text-sm italic leading-relaxed text-slate-100 line-clamp-5">
                        &ldquo;{post.message}&rdquo;
                      </p>
                    </div>
                    <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                      {post.image ? (
                        <img
                          src={mediaUrl(post.image) || post.image}
                          alt={post.name}
                          className="h-11 w-11 rounded-full object-cover border border-astu-green/50 bg-white/10"
                          onError={handleImageError}
                        />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-astu-green/20 text-sm font-black text-astu-green ring-2 ring-astu-green/20">
                          {String(post.name || 'A').slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{post.name}</p>
                        <p className="truncate text-[11px] font-medium text-astu-green">{post.role}</p>
                        {post.company && (
                          <p className="truncate text-[10px] text-slate-300">{post.company}</p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mb-10 reveal rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center backdrop-blur-sm">
                <Globe className="mx-auto mb-3 h-8 w-8 text-astu-green/70" />
                <p className="text-sm font-semibold text-white">Community voices coming soon</p>
                <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-300">
                  Published CMS testimonials, community posts, and alumni success stories will appear here automatically from the backend.
                </p>
              </div>
            )}

            {liveStats.length > 0 && (
              <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 reveal">
                {liveStats.slice(0, 4).map((stat) => {
                  const meta = STAT_PRESENTATION[stat.key] || {
                    label: String(stat.key),
                    Icon: Users,
                    accent: 'text-astu-green bg-astu-green/15',
                  };
                  const Icon = meta.Icon;
                  return (
                    <div
                      key={stat.key}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-sm"
                    >
                      <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${meta.accent}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-black text-white md:text-xl">
                        {Number(stat.value).toLocaleString()}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                        {meta.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 reveal">
              <button
                type="button"
                className="home-btn home-btn--ghost-light"
                onClick={() => navigate(bottomCta?.primaryRoute || '/info/alumni-portal')}
              >
                <Users className="home-btn__icon" aria-hidden="true" />
                {bottomCta?.primaryLabel || 'Alumni Portal'}
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="home-btn home-btn--outline-light"
                onClick={() => navigate(bottomCta?.secondaryRoute || '/info/employer-portal')}
              >
                <Briefcase className="home-btn__icon" aria-hidden="true" />
                {bottomCta?.secondaryLabel || 'Employer Portal'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/community')}
                className="home-btn home-btn--soft"
              >
                <Globe className="home-btn__icon" aria-hidden="true" />
                Explore Community
              </button>
            </div>
          </div>
        </section>


      </main>

      <Footer />

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-red/10 text-astu-red">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <span className="rounded-md bg-astu-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-astu-red">
                  {selectedNotice.type || 'Official Announcement'}
                </span>
                <p className="mt-0.5 text-xs text-on-surface-variant dark:text-slate-400">{selectedNotice.date}</p>
              </div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-astu-navy dark:text-white">{selectedNotice.title}</h3>
            <div className="mt-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 p-4">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {selectedNotice.excerpt || selectedNotice.description || selectedNotice.content || "Full official announcement details and documentation from ASTU-AMS Administration."}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-lg border border-outline-variant dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-600"
              >
                Close Notice
              </button>
              <button
                onClick={() => {
                  setSelectedNotice(null);
                  navigate('/login');
                }}
                className="rounded-lg bg-astu-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
              >
                Access Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Notices Modal */}
      {showAllNotices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/10 dark:bg-astu-navy/30 text-astu-navy dark:text-amber-400">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-astu-navy dark:text-white">Official Notices & Announcements</h3>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400">All public university announcements and official directives.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAllNotices(false);
                  setNoticeSearch('');
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                placeholder="Search notices by keyword..."
                className="w-full rounded-lg border border-outline-variant dark:border-slate-600 bg-slate-50 dark:bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-astu-navy dark:text-white outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>

            <div className="mt-4 flex-1 overflow-y-auto divide-y divide-outline-variant dark:divide-slate-700 pr-1">
              {liveAnnouncements
                .filter(n => !noticeSearch || n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || (n.excerpt && n.excerpt.toLowerCase().includes(noticeSearch.toLowerCase())))
                .map((announcement, idx) => (
                  <button
                    key={announcement.title + idx}
                    onClick={() => {
                      setShowAllNotices(false);
                      setSelectedNotice(announcement);
                    }}
                    className="flex w-full items-start gap-3.5 py-3.5 px-2 text-left hover:bg-surface-container-low/80 dark:hover:bg-slate-700/50 rounded-xl transition-all cursor-pointer group"
                  >
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="block text-sm font-semibold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-amber-400 transition-colors">{announcement.title}</span>
                        <span className="shrink-0 text-[10px] font-bold text-slate-400 dark:text-slate-500">{announcement.date}</span>
                      </div>
                      <span className="mt-1 block text-xs text-on-surface-variant dark:text-slate-400">{announcement.type}</span>
                      {announcement.excerpt && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{announcement.excerpt}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>

            <div className="mt-4 border-t border-outline-variant dark:border-slate-700 pt-3 flex justify-end">
              <button
                onClick={() => {
                  setShowAllNotices(false);
                  setNoticeSearch('');
                }}
                className="rounded-lg bg-astu-navy px-5 py-2 text-xs font-semibold text-white hover:brightness-110"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RSVP & Full Event Registration Modal */}
      {rsvpModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-fade-in" onClick={() => setRsvpModalItem(null)}>
          <div className="relative max-w-lg w-full rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {!confirmedQrPass ? (
              <>
                <div className="flex items-center justify-between border-b dark:border-slate-700 pb-3 border-slate-100">
                  <div>
                    <span className="rounded-md bg-astu-navy px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">{rsvpModalItem.kind} Registration</span>
                    <h3 className="mt-1.5 text-lg font-bold text-astu-navy dark:text-white">{rsvpModalItem.title}</h3>
                  </div>
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3.5 text-xs space-y-1 border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-white">Scheduled Date:</span> {rsvpModalItem.date}</p>
                  {rsvpModalItem.location && <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-white">Venue / Location:</span> {rsvpModalItem.location}</p>}
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1">Free Admission • A registration reference is generated after you submit</p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="e.g. Dr. Abebe Yosef"
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        placeholder="e.g. abebe@astu.edu.et"
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                      <input
                        type="tel"
                        value={rsvpPhone}
                        onChange={(e) => setRsvpPhone(e.target.value)}
                        placeholder="e.g. +251 911 234 567"
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Participant Status</label>
                      <select
                        value={rsvpRole}
                        onChange={(e) => setRsvpRole(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                      >
                        <option value="Alumni">ASTU Alumni</option>
                        <option value="Student">Graduating Senior Student</option>
                        <option value="Faculty / Staff">Faculty / University Staff</option>
                        <option value="Employer Partner">Corporate Employer Partner</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department / Organization</label>
                    <input
                      type="text"
                      value={rsvpAffiliation}
                      onChange={(e) => setRsvpAffiliation(e.target.value)}
                      placeholder="e.g. School of Electrical Engineering & Computing"
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Special Accommodations / Dietary Notes (Optional)</label>
                    <input
                      type="text"
                      value={rsvpNotes}
                      onChange={(e) => setRsvpNotes(e.target.value)}
                      placeholder="e.g. Wheelchair access / Vegetarian meal"
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-astu-navy dark:focus:border-amber-400 focus:ring-1 focus:ring-astu-navy dark:focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    Cancel
                  </button>
                  <button onClick={confirmRsvpRegistration} className="rounded-lg bg-astu-navy px-5 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-md">
                    Complete & Confirm RSVP
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registration Confirmed!</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{rsvpModalItem.title}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Participant: {rsvpName} ({rsvpEmail})</p>
                </div>

                <div className="mx-auto w-48 h-48 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-3 bg-white dark:bg-slate-100 flex items-center justify-center shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(confirmedQrPass)}`}
                    alt="Entry Ticket Code"
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Keep this reference for your records. Entry check-in is not yet
                    automated — nothing scans this code at the venue yet.
                  </p>

                <button
                  onClick={() => setRsvpModalItem(null)}
                  className="w-full rounded-xl bg-slate-900 dark:bg-slate-700 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-600"
                >
                  Done & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Details Comprehensive Modal */}
      {selectedEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedEventModal(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-[2rem] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner Image with Curved Bottom */}
            <div className="relative h-56 sm:h-64 w-full bg-slate-900 shrink-0">
              <img
                src={selectedEventModal.image}
                alt={selectedEventModal.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Category Pill */}
              <span className="absolute top-4 left-4 rounded-full bg-[#E5252A] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                {selectedEventModal.category}
              </span>

              {/* Close Button */}
              <button
                onClick={() => setSelectedEventModal(null)}
                className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white/90 hover:bg-black/80 hover:text-white transition-all backdrop-blur-sm"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Event Title on Banner */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {selectedEventModal.statusBadge || 'Official ASTU Session'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 leading-snug">
                  {selectedEventModal.title}
                </h3>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Event Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-red/10 text-astu-red">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {selectedEventModal.date} {selectedEventModal.time ? `· ${selectedEventModal.time}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/10 dark:bg-sky-500/20 text-astu-navy dark:text-sky-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Venue</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedEventModal.location}
                    </p>
                  </div>
                </div>

                {selectedEventModal.speaker && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <CircleUserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Facilitators / Keynotes</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {selectedEventModal.speaker}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Capacity & Seats</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {selectedEventModal.seats || 'Open Registration • Free Admission'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Overview */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Program Overview
                </h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedEventModal.description}
                </p>
              </div>

              {/* Agenda Highlights */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-900/40 border border-blue-100 dark:border-slate-700/50">
                <h5 className="text-xs font-bold text-astu-navy dark:text-sky-400 uppercase tracking-wider mb-2">
                  Session Highlights
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-astu-navy dark:bg-sky-400" />
                    Interactive practical exercises with ASTU laboratory access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-astu-navy dark:bg-sky-400" />
                    Networking session with alumni industry mentors and corporate recruiters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-astu-navy dark:bg-sky-400" />
                    Official digital Certificate of Participation verified by ASTU-AMS
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const ev = selectedEventModal;
                  setSelectedEventModal(null);
                  handleRegisterClick({
                    title: ev.title,
                    kind: ev.kind,
                    date: ev.date,
                    location: ev.location,
                    id: ev.id,
                  });
                }}
                className={`rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 ${
                  registeredTitles.includes(selectedEventModal.title)
                    ? 'bg-emerald-600 cursor-default'
                    : 'bg-astu-navy hover:bg-astu-navy/90 hover:shadow-lg dark:bg-sky-600 dark:hover:bg-sky-500'
                }`}
              >
                {registeredTitles.includes(selectedEventModal.title) ? '✓ Registered' : 'Register for Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* See All Events & Workshops Directory Modal */}
      {showAllEventsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setShowAllEventsModal(false)}
        >
          <div
            className="relative max-w-4xl w-full rounded-[2rem] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-astu-red dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
                  <CalendarDays className="h-3 w-3" />
                  <span>ASTU Events Calendar</span>
                </div>
                <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-astu-navy dark:text-white">
                  All Campus Events & Workshops
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Browse, search, and register for all upcoming university sessions.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAllEventsModal(false);
                  setAllEventsSearch('');
                }}
                className="self-end sm:self-auto rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={allEventsSearch}
                  onChange={(e) => setAllEventsSearch(e.target.value)}
                  placeholder="Search events by title, keyword, or venue..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-astu-navy dark:focus:border-sky-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'BOOTCAMPS', label: 'Bootcamps' },
                  { id: 'CONFERENCES', label: 'Conferences' },
                  { id: 'CAREER', label: 'Career' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setEventFilterTab(tab.id as any)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      eventFilterTab === tab.id
                        ? 'bg-astu-navy text-white shadow-sm dark:bg-sky-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="p-6 overflow-y-auto flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEventsList
                .filter(e => {
                  if (!allEventsSearch) return true;
                  const q = allEventsSearch.toLowerCase();
                  return (
                    e.title.toLowerCase().includes(q) ||
                    e.description.toLowerCase().includes(q) ||
                    e.location.toLowerCase().includes(q) ||
                    e.category.toLowerCase().includes(q)
                  );
                })
                .map((event, idx) => (
                  <div
                    key={event.id + '-all-' + idx}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                      />
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-[#E5252A] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                        {event.category}
                      </span>
                    </div>

                    <div className="p-4 flex flex-1 flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-astu-navy dark:text-white line-clamp-1">
                          {event.title}
                        </h4>
                        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <CalendarDays className="h-3.5 w-3.5 text-astu-red" />
                          <span>{event.date}</span>
                        </p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          <MapPin className="h-3.5 w-3.5 text-astu-navy dark:text-sky-400" />
                          <span>{event.location}</span>
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => {
                            setShowAllEventsModal(false);
                            handleRegisterClick({
                              title: event.title,
                              kind: event.kind,
                              date: event.date,
                              location: event.location,
                              id: event.id,
                            });
                          }}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-bold text-white transition-all ${
                            registeredTitles.includes(event.title)
                              ? 'bg-emerald-600'
                              : 'bg-astu-navy hover:bg-astu-navy/90 dark:bg-sky-600'
                          }`}
                        >
                          {registeredTitles.includes(event.title) ? '✓ Registered' : 'Register'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAllEventsModal(false);
                            setSelectedEventModal(event);
                          }}
                          className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end bg-slate-50/80 dark:bg-slate-900/80">
              <button
                onClick={() => {
                  setShowAllEventsModal(false);
                  setAllEventsSearch('');
                }}
                className="rounded-xl bg-astu-navy px-5 py-2 text-xs font-bold text-white hover:bg-astu-navy/90"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News Details Comprehensive Popup Modal */}
      {selectedNewsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedNewsModal(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-[2rem] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700 max-h-[90vh] flex flex-col animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar with Gradient */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-r from-astu-navy via-slate-900 to-astu-navy text-white shrink-0">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm border border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Official University Dispatch</span>
                </span>
                <button
                  onClick={() => setSelectedNewsModal(null)}
                  className="rounded-full bg-white/10 p-2 text-white/90 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h3 className="mt-4 text-xl sm:text-2xl font-extrabold text-white leading-snug">
                {selectedNewsModal.title}
              </h3>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-astu-red" />
                  <span>{selectedNewsModal.date || 'Published recently'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span>ASTU Communications & Public Relations</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Announcement Details
                </h4>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedNewsModal.excerpt ||
                    `This official announcement has been verified and published by Adama Science and Technology University.\n\nAll students, faculty, and alumni are advised to review the details and reach out to the university administration if further assistance is needed.`}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/60 p-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-astu-navy dark:text-white mb-2">
                  Key Guidance & Inquiries
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  For questions regarding this release, contact the university coordination office at{' '}
                  <span className="font-semibold text-astu-navy dark:text-amber-400">irccd@astu.edu.et</span> or phone{' '}
                  <span className="font-semibold text-astu-navy dark:text-amber-400">+251-221-110000</span>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const slug = selectedNewsModal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setShareMediaModalItem({
                      id: selectedNewsModal.id || slug,
                      title: selectedNewsModal.title,
                      subtitle: `${selectedNewsModal.category || 'Official Notice'} · ASTU Announcement`,
                      text: selectedNewsModal.excerpt,
                      image: selectedNewsModal.image,
                      url: `/announcements/${slug}`,
                      badge: selectedNewsModal.category || 'Announcement',
                      type: 'announcement',
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Notice</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const slug = selectedNewsModal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      navigate(`/announcements/${slug}`);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-astu-navy px-4 py-2 text-xs font-bold text-white hover:bg-astu-navy/90 transition-all shadow-sm"
                  >
                    <span>Full Notice Page</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedNewsModal(null)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ShareCampaignModal
        isOpen={!!shareModalCampaign}
        onClose={() => setShareModalCampaign(null)}
        campaign={shareModalCampaign ? {
          id: shareModalCampaign.id,
          title: shareModalCampaign.title,
          category: shareModalCampaign.category,
          description: shareModalCampaign.description,
          goal: Number(shareModalCampaign.goal || shareModalCampaign.targetAmount) || 0,
          raised: Number(shareModalCampaign.raised) || 0,
          donorCount: Number(shareModalCampaign.donorCount) || 0,
          image: shareModalCampaign.image || getHomeCampaignImage(shareModalCampaign),
          contentType: 'campaign',
        } : null}
      />

      <ShareCampaignModal
        isOpen={!!sharePageContent}
        onClose={() => setSharePageContent(null)}
        campaign={sharePageContent}
      />

      {/* Universal Share Modal for Alumni Stories */}
      <ShareModal
        isOpen={!!shareStoryModalItem}
        onClose={() => setShareStoryModalItem(null)}
        item={shareStoryModalItem}
      />

      {/* Universal Share Modal for Media / Gallery / Videos */}
      <ShareModal
        isOpen={!!shareMediaModalItem}
        onClose={() => setShareMediaModalItem(null)}
        item={shareMediaModalItem}
      />

      {/* Photo Lightbox Modal */}
      {activeLightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  {activeLightboxPhoto.album || 'Campus Moments'}
                </span>
                <h3 className="text-base font-bold text-white line-clamp-1">{activeLightboxPhoto.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Share photo"
                  onClick={() =>
                    setShareMediaModalItem({
                      id: activeLightboxPhoto.id || 'lightbox',
                      title: activeLightboxPhoto.title,
                      subtitle: activeLightboxPhoto.album || 'Campus Gallery',
                      text: `Campus moment from ASTU: ${activeLightboxPhoto.title}`,
                      image: mediaUrl(activeLightboxPhoto.src) || activeLightboxPhoto.src,
                      url: '/gallery',
                      type: 'gallery',
                    })
                  }
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Close photo preview"
                  onClick={() => setActiveLightboxPhoto(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Photo View with Next / Prev */}
            <div className="relative flex items-center justify-center bg-black min-h-[300px] max-h-[70vh]">
              <img
                src={mediaUrl(activeLightboxPhoto.src) || activeLightboxPhoto.src || '/images/astu-building.jpg'}
                alt={activeLightboxPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
              {filteredGalleryList.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() => {
                      const prevIdx = (lightboxIndex - 1 + filteredGalleryList.length) % filteredGalleryList.length;
                      setLightboxIndex(prevIdx);
                      setActiveLightboxPhoto(filteredGalleryList[prevIdx]);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-astu-navy transition-all hover:scale-105"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => {
                      const nextIdx = (lightboxIndex + 1) % filteredGalleryList.length;
                      setLightboxIndex(nextIdx);
                      setActiveLightboxPhoto(filteredGalleryList[nextIdx]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-astu-navy transition-all hover:scale-105"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption & Link */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span>{activeLightboxPhoto.date || 'ASTU Visual Archive'}</span>
              <button
                type="button"
                onClick={() => {
                  setActiveLightboxPhoto(null);
                  navigate('/gallery');
                }}
                className="font-bold text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>View in Gallery</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal with HD Streaming, Scrubber, Chapters, Transcript, & Details */}
      <VideoDetailModal
        video={activeVideoModalItem}
        onClose={() => setActiveVideoModalItem(null)}
        onSelectRelatedVideo={(v) => setActiveVideoModalItem(v)}
        relatedVideos={liveVideos}
      />

      {/* Direct Instant Giving Modal for Homepage */}
      <TelebirrDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaign={selectedDonationCampaign}
        initialMethod={donationPayMethod}
        onSuccess={() => {
          setIsDonationModalOpen(false);
          toast.success('Donation completed successfully!');
        }}
      />

      {/* Alumni Donation Routing / Authentication Modal */}
      {isDonationAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setIsDonationAuthModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200/90 dark:border-slate-800 transition-all text-slate-800 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient bar */}
            <div className="h-2 w-full bg-gradient-to-r from-astu-navy via-astu-green to-amber-400" />

            {/* Close Button */}
            <button
              onClick={() => setIsDonationAuthModalOpen(false)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 md:p-8">
              {/* Header Badge & Title */}
              <div className="inline-flex items-center gap-2 rounded-full bg-astu-navy/10 dark:bg-sky-500/15 border border-transparent dark:border-sky-500/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-astu-navy dark:text-sky-300 mb-3">
                <Heart className="h-3.5 w-3.5 fill-astu-red text-astu-red" />
                ASTU Alumni Giving
              </div>

              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                Support ASTU&apos;s Future
              </h3>

              {selectedDonationCampaign && (
                <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-green dark:text-emerald-400">
                        Selected Campaign
                      </span>
                      <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">
                        {selectedDonationCampaign.title}
                      </p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-astu-navy/10 dark:bg-sky-500/20 text-astu-navy dark:text-sky-300 text-[10px] font-black uppercase">
                      {selectedDonationCampaign.category || 'Initiative'}
                    </span>
                  </div>
                  {Number(selectedDonationCampaign.goal || selectedDonationCampaign.targetAmount) > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                        <span>{(Number(selectedDonationCampaign.raised) || 0).toLocaleString()} ETB raised</span>
                        <span>
                          {Math.round(
                            ((Number(selectedDonationCampaign.raised) || 0) /
                              Number(selectedDonationCampaign.goal || selectedDonationCampaign.targetAmount)) *
                              100
                          )}
                          % of{' '}
                          {Number(selectedDonationCampaign.goal || selectedDonationCampaign.targetAmount).toLocaleString()} ETB
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-astu-navy via-astu-green to-emerald-400"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                ((Number(selectedDonationCampaign.raised) || 0) /
                                  Number(selectedDonationCampaign.goal || selectedDonationCampaign.targetAmount)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="mt-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Choose how you would like to proceed with your contribution:
              </p>

              {/* Options Cards */}
              <div className="mt-5 space-y-3">
                {/* Option 1: Direct Instant Giving (Telebirr / CBE / Card) */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    setDonationPayMethod('telebirr');
                    setIsDonationModalOpen(true);
                  }}
                  className="group relative flex items-start gap-3.5 p-3.5 md:p-4 rounded-2xl border-2 border-amber-300/80 dark:border-amber-500/50 hover:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                        <span>Direct Online Giving</span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                          Instant
                        </span>
                      </h4>
                      <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 leading-relaxed">
                      Donate immediately with Telebirr, CBE Birr, or Credit Card without logging in.
                    </p>
                  </div>
                </div>

                {/* Option 2: Registered Alumni -> Login */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    loginForDonation(selectedDonationCampaign?.id);
                  }}
                  className="group relative flex items-start gap-3.5 p-3.5 md:p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 hover:border-astu-navy dark:hover:border-sky-400 bg-white dark:bg-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-astu-navy/10 dark:bg-sky-500/20 text-astu-navy dark:text-sky-300 group-hover:bg-astu-navy dark:group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-astu-navy dark:group-hover:text-sky-300 transition-colors">
                        I am a Registered Alumni
                      </h4>
                      <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-astu-navy dark:group-hover:text-sky-300 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                      Sign in with your student ID or email to access your Giving dashboard and alumni donor records.
                    </p>
                  </div>
                </div>

                {/* Option 3: New Alumni -> Register */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    navigate(`/register?redirect=${encodeURIComponent(donationDashboardPath(selectedDonationCampaign?.id))}`);
                  }}
                  className="group relative flex items-start gap-3.5 p-3.5 md:p-4 rounded-2xl border-2 border-emerald-200/90 dark:border-emerald-800/70 hover:border-emerald-600 dark:hover:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        I am a New Alumni
                      </h4>
                      <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                      Register your graduation record to activate your verified alumni network account first.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-semibold text-center">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verified ASTU Alumni Advancement &amp; Giving Portal &bull; Secure 256-bit Encryption</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show All News Directory Modal */}
      {showAllNewsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setShowAllNewsModal(false)}
        >
          <div
            className="relative max-w-4xl w-full rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700 max-h-[90vh] flex flex-col animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-astu-red">
                  Official Directory
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-astu-navy dark:text-white mt-1">
                  All University News & Notices ({displayNewsList.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAllNewsModal(false);
                  setNewsSearchQuery('');
                }}
                className="rounded-full bg-slate-100 dark:bg-slate-700 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search all announcements by title or keyword..."
                  value={newsSearchQuery}
                  onChange={(e) => setNewsSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-astu-navy focus:ring-2 focus:ring-astu-navy/20"
                />
              </div>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto space-y-3">
              {displayNewsList
                .filter((n: any) =>
                  !newsSearchQuery ||
                  n.title?.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
                  n.excerpt?.toLowerCase().includes(newsSearchQuery.toLowerCase())
                )
                .map((n: any, idx: number) => {
                  const meta = getNewsCategoryMeta(n);
                  return (
                    <div
                      key={n.id || idx}
                      onClick={() => {
                        setShowAllNewsModal(false);
                        setSelectedNewsModal(n);
                      }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 hover:border-astu-navy/30 dark:hover:border-sky-500/30 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.badgeClass}`}>
                            {meta.label}
                          </span>
                          <span className="text-[11px] text-slate-400">{n.date || 'Recent'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-amber-400 transition-colors truncate">
                          {n.title}
                        </h4>
                        {n.excerpt && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                            {n.excerpt}
                          </p>
                        )}
                      </div>
                      <button className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-astu-navy dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end bg-slate-50/80 dark:bg-slate-900/80">
              <button
                onClick={() => {
                  setShowAllNewsModal(false);
                  setNewsSearchQuery('');
                }}
                className="rounded-xl bg-astu-navy px-5 py-2 text-xs font-bold text-white hover:bg-astu-navy/90"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
      <ChatBot />
    </div>
  );
}
