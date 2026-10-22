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
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import TelebirrDonationModal from "../components/TelebirrDonationModal";
import { partnerLogos } from "../components/PartnerLogos";
import eventsService from "../features/admin/services/events.service";
import contentService from "../features/admin/services/content.service";
import storiesService from "../features/admin/services/stories.service";
import homepageCmsService from "../features/admin/services/homepageCms.service";
import publicStatsService, { PublicStat } from "../features/public/services/publicStats.service";
import config from "../config";

const { mediaUrl } = config;
import footerCmsService, { FooterCmsConfig, defaultFooterConfig } from "../features/admin/services/footerCms.service";
import gc7Img from "../assets/images/gc7.jpg";
import astuBuildingImg from "../assets/imgs/astu-building.jpg";

const FALLBACK_IMAGE = "";

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
    color: "from-violet-600 to-violet-800",
    iconBg: "bg-violet-100 text-violet-700",
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
};

const navSections = [
  { label: "Home", id: "home" },
  { label: "Impact Numbers", id: "impact-numbers" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Impact", id: "impact" },
  { label: "Gallery", id: "gallery" },
  { label: "Campuses", id: "campuses" },
  { label: "Announcements", id: "announcements" },
  { label: "Community", id: "testimonials" },
  { label: "Events", id: "events" },
  { label: "Workshops", id: "workshops" },
  { label: "News", id: "news" },
  { label: "Success Stories", id: "success-stories" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" }
];
/** Minimal empty fallbacks — real content/images come from Homepage CMS */
const emptyCampusLife: any[] = [];
const emptyCampuses: any[] = [];
const emptyFaq: any[] = [];
const emptyGallery: any[] = [];
const emptyPartners: any[] = [];
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

const ASTU_DEFAULT_EVENTS: EventItem[] = [
  {
    id: "ds-ml-bootcamp",
    title: "Data Science & Machine Learning Bootcamp",
    category: "TECHNICAL TRAINING & LABS",
    type: "bootcamp",
    kind: "Workshop",
    date: "2026-11-20",
    time: "09:00 AM - 04:30 PM",
    location: "Engineering Building Room 305",
    campus: "ASTU Main Campus",
    description: "Intensive bootcamp covering machine learning, data visualization, and statistical analysis using Python and R. Practical assignments with ASTU real-world datasets and labs.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    speaker: "Dr. Henok Tadesse & Senior AI Engineers",
    seats: "Registration open",
    statusBadge: "Filling Fast",
    level: "Intermediate - Advanced",
  },
  {
    id: "ethiopialics-2025",
    title: "EthiopiaLics International Conference 2025",
    category: "EVENT",
    type: "conference",
    kind: "Event",
    date: "2025-06-13",
    time: "08:30 AM - 05:00 PM",
    location: "ASTU Main Campus Auditorium",
    campus: "ASTU Main Campus",
    description: "Adama Science and Technology University hosts the 1st EthiopiaLics International Conference on 'Fostering Innovation Ecosystem for Sustainable Industrialization and Tech Transfer'.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    speaker: "ASTU Leadership & Global Innovation Fellows",
    seats: "Open attendance",
    statusBadge: "Keynote Event",
    level: "Open to All Scholars & Alumni",
  },
  {
    id: "career-summit-2026",
    title: "ASTU Alumni Career & Innovation Summit",
    category: "EVENT",
    type: "career",
    kind: "Event",
    date: "2026-12-05",
    time: "10:00 AM - 06:00 PM",
    location: "Senate Hall, ASTU Main Campus",
    campus: "ASTU Main Campus",
    description: "Annual career acceleration gathering connecting final-year students with high-achieving alumni executives and industry partners. Meet top employers hiring on the spot.",
    image: gc7Img,
    speaker: "40+ Corporate Recruiters & Alumni Tech Leads",
    seats: "Open registration",
    statusBadge: "Annual Highlight",
    level: "All Batches & Graduating Seniors",
  },
  {
    id: "cloud-devops-bootcamp",
    title: "Cloud & DevOps Architecture Bootcamp",
    category: "TECHNICAL TRAINING & LABS",
    type: "bootcamp",
    kind: "Workshop",
    date: "2026-06-18",
    time: "09:30 AM - 03:30 PM",
    location: "CS Lab 101, Technology Complex",
    campus: "Technology Complex",
    description: "Hands-on training on AWS, Azure, Docker containers, and Kubernetes CI/CD deployment pipelines tailored for ASTU engineering graduates and seniors.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    speaker: "Certified AWS & Cloud Solution Architects",
    seats: "Registration open",
    statusBadge: "Hands-on Lab",
    level: "Intermediate",
  },
  {
    id: "aiml-research-symposium",
    title: "AI/ML Research & Robotics Symposium",
    category: "EVENT",
    type: "conference",
    kind: "Event",
    date: "2026-07-05",
    time: "09:00 AM - 05:00 PM",
    location: "Engineering Complex Hall B",
    campus: "Engineering Complex",
    description: "Presentation of groundbreaking faculty and alumni research projects in machine learning, autonomous systems, smart agriculture, and computational sciences.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    speaker: "ASTU AI Research Lab & Guest Keynotes",
    seats: "Open registration",
    statusBadge: "Research Forum",
    level: "Academic & Professional",
  },
  {
    id: "grand-homecoming-gala",
    title: "ASTU Annual Grand Alumni Homecoming & Gala",
    category: "EVENT",
    type: "career",
    kind: "Event",
    date: "2026-09-12",
    time: "02:00 PM - 09:30 PM",
    location: "ASTU Grand Sports Arena & Gardens",
    campus: "Main Campus",
    description: "Celebrate decades of ASTU engineering and scientific excellence. Reconnect with classmates, network with distinguished alumni, and enjoy an evening banquet and award gala.",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    speaker: "University President & Alumni Honors Panel",
    seats: "Open registration",
    statusBadge: "Grand Reunion",
    level: "All Alumni & Families",
  },
];

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
    return published.length ? published : [
      { title: "New Engineering Lab Inaugurated", date: "May 28, 2026" },
      { title: "ASTU Research Grant Winners", date: "May 25, 2026" },
      { title: "Annual Career Expo Announced", date: "May 20, 2026" }
    ];
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
      const active = cmsConfig.stories.filter((s: any) => s.active);
      if (active.length) return active;
    }
    return storiesService.getStories();
  });
  const [donationCampaigns, setDonationCampaigns] = useState<any[]>([]);
  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState<any | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isDonationAuthModalOpen, setIsDonationAuthModalOpen] = useState(false);

  const handleDonateClick = (campaign: any) => {
    setSelectedDonationCampaign(campaign);
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    let user: any = null;
    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch {}

    if (token && (user?.role === 'ALUMNI' || !user?.role)) {
      navigate('/alumni/dashboard?tab=donations');
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
    if (config?.campusLife?.length) {
      const active = config.campusLife.filter((c: any) => c.active);
      if (active.length) return active;
    }
    return emptyCampusLife;
  });
  const [liveCampuses, setLiveCampuses] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.campuses?.length) {
      const active = config.campuses.filter((c: any) => c.active);
      if (active.length) return active;
    }
    return emptyCampuses;
  });
  const [liveGallery, setLiveGallery] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.gallery?.length) {
      const active = config.gallery.filter((g: any) => g.active);
      if (active.length) return active;
    }
    return emptyGallery;
  });
  // CMS items may carry a real publication timestamp.  When they do, show the
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
      const active = config.videos.filter((v: any) => v.active);
      if (active.length) return active;
    }
    return [];
  });
  const [livePartners, setLivePartners] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.partners?.length) {
      const active = config.partners.filter((p: any) => p.active);
      if (active.length) return active;
    }
    return emptyPartners;
  });
  const [liveFaq, setLiveFaq] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.faq?.length) {
      const active = config.faq.filter((f: any) => f.active);
      if (active.length) return active;
    }
    return emptyFaq;
  });
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
  const [impactSection, setImpactSection] = useState<any>(() => homepageCmsService.getSettings()?.impactSection || null);
  const [careerCta, setCareerCta] = useState<any>(() => homepageCmsService.getSettings()?.careerCta || null);
  const [bottomCta, setBottomCta] = useState<any>(() => homepageCmsService.getSettings()?.bottomCta || null);
  const [researchHighlights, setResearchHighlights] = useState<any>(() => homepageCmsService.getSettings()?.researchHighlights || null);
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
    return cfg?.campusLifeHeaders || {
      eyebrow: "Explore Life At ASTU",
      title: "Campus Life, Facilities, Events, and Galleries",
      description: "A public gateway for the same institutional experiences AAU highlights: events, facilities, campus activities, media galleries, and services.",
    };
  });
  const [liveEventsHeaders, setLiveEventsHeaders] = useState<any>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.eventsHeaders || {
      eyebrow: "Events & Workshops",
      title: "Upcoming Alumni Events",
      description: "Networking, learning, and professional growth opportunities.",
      viewAllText: "See All Events →",
      viewAllLink: "/events",
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
  const defaultSectionLinks = {
    about: true,
    impact: true,
    portals: true,
    campusLife: true,
    events: true,
    stories: true,
    announcements: true,
    partners: true,
    giving: true,
  };
  const [liveSectionLinks, setLiveSectionLinks] = useState<typeof defaultSectionLinks>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.sectionLinks ? { ...defaultSectionLinks, ...cfg.sectionLinks } : defaultSectionLinks;
  });
  const [liveGivingSection, setLiveGivingSection] = useState(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.givingSection || {
      title: "Support Future Innovators & Campus Research",
      subtitle: "Active campaigns organized by the ASTU Alumni & Advancement Office. 100% of your tax-deductible gift directly funds undergraduate scholarships, research labs, student welfare, and campus innovation.",
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

  // Fallback news list if liveNews is empty to ensure rich preview matching user data
  const defaultNewsList = useMemo(() => [
    {
      id: 'news-def-1',
      title: 'ASTU Engineering Innovation Summit 2026',
      excerpt: 'Showcasing cutting-edge technology and student research projects across engineering departments.',
      date: '9/9/2026',
      category: 'INNOVATION & TECH',
    },
    {
      id: 'news-def-2',
      title: 'Semester Break: Campus Safety Notice',
      excerpt: 'Official ASTU Announcement regarding campus access, lab operating hours, and safety guidelines.',
      date: '8/20/2026',
      category: 'CAMPUS NOTICE',
    },
    {
      id: 'news-def-3',
      title: 'ASTU Alumni Network: Bridging Generations',
      excerpt: 'How our alumni network connects graduates with opportunities, mentorship, and lifelong learning resources.',
      date: '5/28/2026',
      category: 'ALUMNI NETWORK',
    },
    {
      id: 'news-def-4',
      title: 'ASTU Research Grant Winners 2026',
      excerpt: 'Announcing applied research grants awarded to faculty and alumni engineering teams.',
      date: '5/25/2026',
      category: 'RESEARCH & GRANTS',
    },
    {
      id: 'news-def-5',
      title: 'ASTU Hosts a Five-Day DAAD Alumni Workshop on Sustainable Water Supply & Environmental Protection',
      excerpt: 'Promoting the capacity of local actors for sustainable water supply, sanitation, and environmental protection measures in East Africa.',
      date: 'Mar 7, 2025',
      category: 'GLOBAL OUTREACH',
    },
    {
      id: 'news-def-6',
      title: 'ASTU Alumni Association Inspires Graduating Class with Career Tips!',
      excerpt: 'Navigating the Transition: Former graduates and industry leaders guide graduating seniors with high-impact labor market strategies.',
      date: 'Mar 7, 2025',
      category: 'ALUMNI SPOTLIGHT',
    },
    {
      id: 'news-def-7',
      title: 'ASTU Alumni Spotlight: Yohannes Melese, Gold Medalist & Dual-Major Graduate!',
      excerpt: 'Graduating with a dual major in Electronics & Communication Engineering and Computer Science with outstanding academic standing.',
      date: 'Mar 7, 2025',
      category: 'ACADEMIC EXCELLENCE',
    },
    {
      id: 'news-def-8',
      title: 'ASTU Alumni Serving as Model United Nations Secretariats & Global Delegates',
      excerpt: 'Recognizing outstanding ASTU graduates who served as secretariats for Model United Nations and international diplomatic tech forums.',
      date: 'Jan 7, 2025',
      category: 'GLOBAL OUTREACH',
    },
    {
      id: 'news-def-9',
      title: 'Annual Alumni & Career Fair 2026 Registrations Open',
      excerpt: 'Connecting leading industrial recruiters and tech innovators directly with ASTU graduating seniors.',
      date: 'Jan 4, 2025',
      category: 'CAREER FAIR',
    },
  ], []);

  // Display list: liveNews if available and populated, else defaultNewsList
  const displayNewsList = useMemo(() => {
    if (liveNews && liveNews.length > 0) return liveNews;
    return defaultNewsList;
  }, [liveNews, defaultNewsList]);

  const totalNewsSlides = Math.max(1, Math.ceil(displayNewsList.length / 3));

  // Auto-Slide Timer with animated progress bar (5s duration per slide)
  useEffect(() => {
    if (totalNewsSlides <= 1 || isNewsTimerPaused) return;

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

  // Combine liveEvents from CMS/API with ASTU_DEFAULT_EVENTS
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
          time: e.time || '09:00 AM - 05:00 PM',
          location: e.location || 'ASTU Main Campus',
          campus: 'ASTU Main Campus',
          description: e.description || 'Join fellow ASTU alumni and students for an interactive session, expert talks, and networking opportunities.',
          image: e.image || FALLBACK_IMAGE,
          speaker: e.speaker || 'ASTU Faculty & Industry Leads',
          seats: e.seats || 'Open Registration',
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
          time: '09:00 AM - 04:00 PM',
          location: w.location || w.focus || 'CS Lab & Tech Complex',
          campus: 'Technology Complex',
          description: w.description || 'Hands-on practical training with verified attendance, RSVP tracking, and certificates of completion.',
          image: w.image || FALLBACK_IMAGE,
          speaker: 'Industry Technical Leads',
          seats: w.seats || 'Open Registration',
          statusBadge: 'Hands-on Lab',
          level: 'Practical Workshop',
        });
      });
    }

    // Only fall back to the bundled showcase list when the CMS/API returned
    // nothing. Previously the demo events were merged in unconditionally, so
    // real events were always padded with fabricated ones.
    if (liveList.length === 0) {
      return [...ASTU_DEFAULT_EVENTS];
    }
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

  useEffect(() => {
    if (window.location.pathname === '/events' || window.location.hash === '#events' || window.location.hash === '#workshops') {
      setTimeout(() => {
        const el = document.getElementById('events');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
    }
  }, []);


  /** Prefer CMS gallery / campus / slide images over any bundled assets */
  const cmsFeatureImages = useMemo(() => {
    const fromGallery = liveGallery
      .map((g: any) => g.src || g.image || g.url)
      .filter(Boolean);
    const fromCampuses = liveCampuses.map((c: any) => c.image).filter(Boolean);
    const fromSlides = liveSlides.map((s: any) => s.image).filter(Boolean);
    const fromCampusLife = liveCampusLife.map((c: any) => c.image).filter(Boolean);
    const pool = [...fromGallery, ...fromCampuses, ...fromSlides, ...fromCampusLife];
    return {
      primary: impactSection?.image || pool[0] || FALLBACK_IMAGE,
      secondary: pool[1] || pool[0] || FALLBACK_IMAGE,
      tertiary: pool[2] || pool[0] || FALLBACK_IMAGE,
    };
  }, [liveGallery, liveCampuses, liveSlides, liveCampusLife, impactSection]);

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

  const hasImpactNumbers = visibleStats.length > 0;

  // A slide published from the CMS may carry no `image`, and CMS authors write
  // `subtitle` where the template reads `tagline`. Normalising here means the
  // hero can never render <img src="undefined"> and the text cannot silently
  // disappear.
  const normalisedSlides = useMemo(
    () =>
      liveSlides.map((slide: any) => ({
        ...slide,
        image: mediaUrl(slide.image || slide.backgroundImage || slide.bgImage),
        tagline: slide.tagline || slide.subtitle || slide.kicker || '',
        description: slide.description || slide.body || slide.text || '',
      })),
    [liveSlides]
  );

  const displaySlides = useMemo(
    () =>
      normalisedSlides.length
        ? normalisedSlides
        : [
            {
              id: 'empty',
              image: FALLBACK_IMAGE,
              tagline: 'ASTU-AMS',
              title: 'Alumni Management System',
              description: welcomeMessage || 'Connecting ASTU graduates, employers, and academic departments in one verified network.',
            },
          ],
    [normalisedSlides, welcomeMessage]
  );

  const activeHero = displaySlides[currentSlide] || displaySlides[0];

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

    toast.success(`Registration Confirmed for "${rsvpModalItem.title}"! Ticket emailed to ${rsvpEmail}.`);
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
      if (cmsConfig.campusLife?.length) {
        const active = cmsConfig.campusLife.filter((c: any) => c.active !== false);
        if (active.length) setLiveCampusLife(active);
      }
      if (cmsConfig.campuses?.length) {
        const active = cmsConfig.campuses.filter((c: any) => c.active !== false);
        if (active.length) setLiveCampuses(active);
      }
      if (cmsConfig.gallery?.length) {
        const active = cmsConfig.gallery.filter((g: any) => g.active !== false);
        if (active.length) setLiveGallery(active);
      }
      if (cmsConfig.videos?.length) {
        const active = cmsConfig.videos.filter((v: any) => v.active !== false);
        if (active.length) setLiveVideos(active);
      }
      if (cmsConfig.newsItems?.length) {
        const active = cmsConfig.newsItems.filter((n: any) => n.active !== false);
        if (active.length) setLiveNews(active);
      }
      if (cmsConfig.announcements?.length) {
        const active = cmsConfig.announcements.filter((a: any) => a.active !== false);
        if (active.length) setLiveAnnouncements(active);
      }
      if (cmsConfig.stories?.length) {
        const active = cmsConfig.stories.filter((s: any) => s.active !== false);
        if (active.length) setLiveStories(storiesService.fromConfig(active));
      }
      if (cmsConfig.partners?.length) {
        const active = cmsConfig.partners.filter((p: any) => p.active !== false);
        if (active.length) setLivePartners(active);
      }
      if (cmsConfig.faq?.length) {
        const active = cmsConfig.faq.filter((f: any) => f.active !== false);
        if (active.length) setLiveFaq(active);
      }
      if (cmsConfig.testimonials?.length) {
        const active = cmsConfig.testimonials.filter((t: any) => t.active !== false);
        if (active.length) setLiveTestimonials(active);
      }
      if (cmsConfig.events?.length) {
        const active = cmsConfig.events.filter((e: any) => e.active !== false);
        if (active.length) {
          setLiveEvents(active.map((e: any) => ({
            title: e.title,
            date: e.date,
            location: e.location || 'ASTU Main Campus',
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
      if (cmsConfig.impactSection) setImpactSection(cmsConfig.impactSection);
      if (cmsConfig.careerCta) setCareerCta(cmsConfig.careerCta);
      if (cmsConfig.bottomCta) setBottomCta(cmsConfig.bottomCta);
      if (cmsConfig.researchHighlights) setResearchHighlights(cmsConfig.researchHighlights);
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
      // Stories: only fill from storiesService when homepage CMS has none yet
      const homepageStories = storiesService.fromConfig(localConfig?.stories);
      if (isMounted) {
        if (homepageStories.length) setLiveStories(homepageStories);
        else setLiveStories(storiesService.getStories());
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
            .filter((i: any) => i.status === 'Published' && (i.type === 'post' || i.type === 'announcement'))
            .map((i: any) => ({ id: i.id, title: i.title, date: i.publishedAt || i.updatedAt, excerpt: i.excerpt }));
          setLiveNews(liveNews);

          const liveAnnounce = apiItems
            .filter((i: any) => i.status === 'Published')
            .map((i: any) => ({
              id: i.id,
              title: i.title,
              date: i.publishedAt || i.updatedAt || 'Just now',
              type: i.type === 'announcement' ? 'Official Announcement' : `${String(i.type).toUpperCase()} Announcement`,
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

      // Sync active Donation Campaigns published by Alumni Office / CMS
      try {
        const campaigns = await contentService.getPublicDonationCampaigns();
        if (isMounted && campaigns && campaigns.length > 0) {
          setDonationCampaigns(campaigns);
        }
      } catch {
        /* fallback handled gracefully */
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
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (displaySlides.length || 1));
    }, 6000);
    return () => clearInterval(timer);
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

  // A hero image always comes from the backend. If that URL fails we remove the
  // <img> and let the section gradient stand in — never substitute a
  // fabricated local asset, and never re-point at a failing URL (onError loop).
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = 'none';
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
  }, [liveEvents, liveWorkshops, liveNews, liveAnnouncements, liveStories, liveSlides, liveGallery]);

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
    <div className="app-shell min-h-screen bg-background text-on-surface dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <div className="fixed top-0 left-0 z-[60] w-full h-0.5 bg-slate-800/20">
        <div
          className="h-full bg-gradient-to-r from-astu-green via-astu-navy to-astu-red transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main id="home">
        <section className="relative overflow-hidden min-h-[700px] md:h-[580px] lg:h-[750px] bg-slate-950">
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <div className="absolute top-20 left-[10%] w-2 h-2 rounded-full bg-astu-green/30 animate-float" style={{ animationDelay: "0s", animationDuration: "5s" }} />
            <div className="absolute top-40 left-[30%] w-1.5 h-1.5 rounded-full bg-astu-red/30 animate-float" style={{ animationDelay: "1s", animationDuration: "7s" }} />
            <div className="absolute top-60 left-[60%] w-2.5 h-2.5 rounded-full bg-astu-green/20 animate-float" style={{ animationDelay: "2s", animationDuration: "6s" }} />
            <div className="absolute top-32 right-[20%] w-1.5 h-1.5 rounded-full bg-white/20 animate-float" style={{ animationDelay: "0.5s", animationDuration: "8s" }} />
            <div className="absolute bottom-20 right-[40%] w-2 h-2 rounded-full bg-astu-red/20 animate-float" style={{ animationDelay: "1.5s", animationDuration: "5.5s" }} />
            <div className="absolute bottom-40 left-[50%] w-1 h-1 rounded-full bg-white/15 animate-float" style={{ animationDelay: "3s", animationDuration: "9s" }} />
          </div>
          {/* Background Slides */}
          <div className="absolute inset-0 w-full h-full">
            {displaySlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {/* Background image, sourced from the backend CMS */}
                {slide.image && (
                  <img
                    alt={slide.title}
                    className="h-full w-full object-cover object-[center_30%]"
                    src={slide.image}
                    onError={handleImageError}
                  />
                )}
                {/* Gentle overlay for rich aesthetic with high photo transparency */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,25,50,0.55),rgba(0,10,25,0.78))]" />
              </div>
            ))}
          </div>

          {/* Compact text - hero is immediately visible below navbar */}
          <div className="relative z-20 mx-auto flex h-full max-w-[1440px] items-center px-4 py-16 md:px-6 lg:py-20">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block rounded-full bg-astu-red px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg animate-glow">
                {activeHero?.tagline}
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
                {(activeHero?.title || '').includes(" to the ") ? (
                  <>
                    {activeHero?.title.split(" to the ")[0]}
                    <br />
                    to the <span className="text-astu-green">{activeHero?.title.split(" to the ")[1]}</span>
                  </>
                ) : (
                  activeHero?.title
                )}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-100 md:text-base">
                {activeHero?.description || welcomeMessage || 'Connecting ASTU graduates, employers, and academic departments through verified career and alumni services.'}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-astu-red px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-lg hover:shadow-xl hover:shadow-astu-red/20 hover:scale-105 btn-magnetic"
                  onClick={() => navigate("/info/alumni-portal")}
                >
                  Alumni Portal
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-all hover:scale-105 btn-magnetic backdrop-blur-sm"
                  onClick={() => navigate("/info/employer-portal")}
                >
                  Employer Partnership
                  <Handshake className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Left/Right navigation arrow buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-astu-navy/80 hover:scale-110 transition-all duration-300 backdrop-blur-sm hidden sm:block shadow-lg hover:shadow-xl"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-astu-navy/80 hover:scale-110 transition-all duration-300 backdrop-blur-sm hidden sm:block shadow-lg hover:shadow-xl"
            aria-label="Next slide"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Bottom active slide indicator dots */}
          <div className="absolute bottom-6 left-1/2 z-35 flex -translate-x-1/2 gap-2.5">
            {liveSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-6 bg-[#FFD700]" : "w-2.5 bg-white/40 hover:bg-white/60"
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth",
              });
            }}
            className="absolute bottom-12 left-1/2 z-40 -translate-x-1/2 text-white animate-bounce"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-8 w-8 md:h-10 md:w-10" style={{ marginTop: "-100px" }} />
          </button>
        </section>

        {visibleStats.length > 0 && (
          <section id="impact-numbers" className="relative z-20 mx-auto my-10 md:my-14 max-w-[1440px] px-4 md:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_40px_rgba(0,51,102,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-astu-navy via-astu-red to-astu-green" />
              <div
                className={`grid divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90 dark:divide-slate-800 ${
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
                      className="group flex flex-col items-center gap-3.5 p-8 text-center transition-all duration-300 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <div className={`rounded-2xl p-3.5 ${presentation.accent} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-extrabold text-astu-navy dark:text-white tracking-tight">
                        {stat.value.toLocaleString()}
                      </h2>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {presentation.label}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section id="how-it-works" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-12 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Get Started</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">How ASTU-AMS Works</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              From registration to real impact — here's how our platform empowers alumni,
              employers, and the university community in four simple steps.
            </p>
          </div>

          <div className="relative">
            {/* Connector line for desktop */}
            <div className="absolute left-0 right-0 top-[60px] hidden h-0.5 bg-gradient-to-r from-astu-navy via-astu-red to-astu-green lg:block" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {livePortals.map((item, idx) => {
                const Icon = typeof item.icon === 'function' ? item.icon : (iconMap[item.icon] || Users);
                const descText = item.description || (Array.isArray(item.points) ? item.points[0] : item.text || '');
                return (
                  <article
                    key={item.id || item.step || item.title || idx}
                    className={`reveal reveal-delay-${(idx % 4) + 1} group relative rounded-2xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_24px_rgba(0,51,102,0.12)]`}
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color || 'from-astu-navy to-[#1a4f8a]'} text-lg font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                      >
                        {item.step || idx + 1}
                      </div>
                      <div className={`rounded-lg p-2.5 ${item.iconBg || 'bg-astu-navy/10 text-astu-navy'} transition-colors`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h4 className="mb-2 text-lg font-bold text-astu-navy dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-on-surface-variant dark:text-slate-400 line-clamp-3">
                      {descText}
                    </p>

                    {item.cta && (
                      <button
                        onClick={() => navigate(item.route || '/login')}
                        className="mt-3 text-xs font-semibold text-[#003580] dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {item.cta} <ArrowRight className="h-3 w-3" />
                      </button>
                    )}

                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${item.color || 'from-astu-navy to-[#1a4f8a]'} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                    />
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex justify-center reveal">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-astu-navy px-7 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 hover:shadow-lg hover:scale-105"
              onClick={() => navigate("/login")}
            >
              Get Started Today
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section id="impact" className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 md:grid-cols-2 md:px-8 md:py-16">
          <article className="reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">
              {impactSection?.eyebrow || 'Industry-Campus Bridge'}
            </p>
            <h3 className="mt-2 text-3xl font-bold animate-gradient-text dark:text-white">
              {impactSection?.title || welcomeMessage || 'ASTU Alumni Impact'}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
              {impactSection?.description ||
                welcomeMessage ||
                'Graduate outcomes and employer feedback managed through the ASTU content system feed directly into curriculum updates.'}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {visibleStats.slice(0, 2).map(({ stat, presentation }) => (
                <div key={stat.key}>
                  <p className="text-3xl font-bold text-astu-navy dark:text-amber-400">
                    {stat.value.toLocaleString()}+
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant dark:text-slate-400">
                    {presentation.label}
                  </p>
                </div>
              ))}
            </div>
            <button
              className="mt-7 rounded-md bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 hover:scale-105 transition-all btn-magnetic shadow-lg hover:shadow-xl"
              onClick={() => {
                const route = impactSection?.ctaRoute;
                if (route && route.startsWith('#')) {
                  document.getElementById(route.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                } else if (route) {
                  navigate(route);
                } else {
                  document.getElementById('campus-life')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {impactSection?.ctaLabel || 'Explore Campus Life'}
            </button>
          </article>

          <article className="reveal">
            <img
              alt={impactSection?.title || 'ASTU campus'}
              className="h-full min-h-[280px] w-full rounded-xl object-cover shadow-lg"
              src={cmsFeatureImages.primary}
              onError={handleImageError}
            />
          </article>
        </section>

        <section id="campus-life" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Explore Life At ASTU</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Campus Life, Facilities, Events, and Galleries</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Discover events, facilities, campus activities, media galleries, and student services that define life at Adama Science and Technology University.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {liveCampusLife.length === 0 ? (
              <div className="md:col-span-3">
                <EmptySection message="Campus life highlights will appear here once published by the university content team." />
              </div>
            ) : (
              liveCampusLife.map((card, idx) => (
              <article key={card.id || card.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img src={card.image || FALLBACK_IMAGE} alt={card.title} className="h-52 w-full object-cover transition-transform duration-700 hover:scale-105" onError={handleImageError} />
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-astu-red">{card.campus}</p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy dark:text-white">{card.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">{card.description}</p>
                  {card.action && (
                    <button className="mt-4 rounded-md border border-outline-variant dark:border-slate-600 px-3 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-700 btn-magnetic">
                      {card.action}
                    </button>
                  )}
                </div>
              </article>
              ))
            )}
          </div>
        </section>

        <section id="campuses" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Campuses</p>
              <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Explore ASTU Spaces</h3>
            </div>
            <button className="rounded-md border border-outline-variant dark:border-slate-600 px-3 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-800">
              View all
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {liveCampuses.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-4">
                <EmptySection message="Campus profiles will appear here once published by the university content team." />
              </div>
            ) : (
              liveCampuses.map((campus, idx) => (
              <article key={campus.id || campus.name || idx} className={`reveal reveal-delay-${(idx % 4) + 1} overflow-hidden rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img src={campus.image || FALLBACK_IMAGE} alt={campus.name} className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105" onError={handleImageError} />
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-astu-navy dark:text-white">{campus.name}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant dark:text-slate-400">{campus.description}</p>
                  <button className="mt-3 text-xs font-semibold text-astu-red hover:underline btn-magnetic">Explore</button>
                </div>
              </article>
              ))
            )}
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Media</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Photo Gallery</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Campus life, events, and institutional moments from Adama Science and Technology University.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {featuredGallery.length === 0 ? (
              <div className="sm:col-span-2 md:col-span-3">
                <EmptySection message="Photo gallery items will appear here once published by the university content team." />
              </div>
            ) : (
              featuredGallery.map((item, idx) => (
              <article key={item.id || item.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img src={mediaUrl(item.src || item.image) || FALLBACK_IMAGE} alt={item.title} className="h-48 w-full object-cover transition-all duration-700 hover:scale-110 sm:h-56 md:h-64" onError={handleImageError} />
                <div className="p-3 md:p-4">
                  <h4 className="text-sm font-semibold text-astu-navy dark:text-white">{item.title}</h4>
                  {item.album && <p className="text-[10px] font-bold text-astu-red uppercase tracking-wider mt-1">{item.album}</p>}
                </div>
              </article>
              ))
            )}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/gallery')}
              className="inline-flex items-center gap-2 rounded-lg bg-astu-navy px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Explore Full Gallery & Albums <ExternalLink className="h-4 w-4 text-[#FFD700]" />
            </button>
          </div>
        </section>

        <section id="video-gallery" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Media</p>
              <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white sm:text-3xl">Video Gallery</h3>
              <p className="mt-2 text-sm text-on-surface-variant dark:text-slate-400">Workshop recordings, graduation moments, and research showcases.</p>
            </div>
            <button className="rounded-md border border-outline-variant dark:border-slate-600 px-3 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-800">
              View Media Library
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {liveVideos.length === 0 ? (
              <div className="md:col-span-3">
                <EmptySection message="Video highlights will appear here once published by the university content team." />
              </div>
            ) : (
              liveVideos.map((video: any, idx: number) => (
                <article key={video.id || video.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                  <div className="relative">
                    <img
                      src={video.thumbnail || video.image || video.cover || cmsFeatureImages.primary}
                      alt={video.title}
                      className="h-52 w-full object-cover"
                      onError={handleImageError}
                    />
                    <a
                      href={video.url || video.link || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/20 text-white"
                      aria-label={`Play ${video.title}`}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30">
                        <PlayCircle className="h-8 w-8" />
                      </span>
                    </a>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-astu-navy dark:text-white">{video.title}</h4>
                    {video.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant dark:text-slate-400">{video.description}</p>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>



        <section className="relative bg-gradient-to-r from-astu-navy to-primary-container py-14 md:py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-astu-green/5 animate-float-slow" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-astu-red/5 animate-float" style={{ animationDelay: "2s" }} />
          </div>
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-2 md:px-8 relative z-10">
            <article className="reveal text-white">
              <p className="inline-flex rounded-full bg-astu-red px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                Quality Assurance
              </p>
              <h3 className="mt-4 text-3xl font-bold">
                {employerFeedback?.title || 'Data-Driven Accreditation & Excellence'}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200">
                {employerFeedback?.description ||
                  'ASTU-AMS provides verified tracer data, employment analytics, and employer feedback required by accreditation agencies and university management.'}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                  <Globe className="mb-2 h-5 w-5 text-astu-green" />
                  <h4 className="text-sm font-semibold">
                    {employerFeedback?.companies != null ? `${employerFeedback.companies} Companies` : 'Global Accreditation'}
                  </h4>
                  <p className="mt-1 text-xs text-slate-300">
                    {employerFeedback?.submissions != null
                      ? `${employerFeedback.submissions} employer feedback submissions`
                      : 'Build transparent, audited institutional reports.'}
                  </p>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                  <Handshake className="mb-2 h-5 w-5 text-astu-green" />
                  <h4 className="text-sm font-semibold">
                    {tracerSpotlight?.title || 'Market Alignment'}
                  </h4>
                  <p className="mt-1 text-xs text-slate-300">
                    {tracerSpotlight?.responseRate
                      ? `Tracer response rate: ${tracerSpotlight.responseRate}`
                      : 'Align curriculum with industry expectations.'}
                  </p>
                </div>
              </div>
              <button
                className="mt-6 rounded-md bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-astu-navy hover:bg-slate-100"
                onClick={() => navigate("/info/impact-numbers")}
              >
                View Impact Numbers
              </button>
            </article>

            <article className="reveal grid gap-2 sm:col-span-2 sm:grid-cols-2 md:col-span-1">
              <img
                alt="ASTU campus highlight"
                className="h-40 w-full rounded-xl border border-white/10 object-cover shadow-lg sm:h-48"
                src={cmsFeatureImages.primary}
                onError={handleImageError}
              />
              <img
                alt="ASTU facilities"
                className="h-40 w-full rounded-xl border border-white/10 object-cover shadow-lg sm:h-48"
                src={cmsFeatureImages.secondary}
                onError={handleImageError}
              />
            </article>
          </div>
        </section>

        {/* Unified Upcoming Events & Workshops Showcase with Professional Curved Aesthetic & Carousel Slider */}
        <section id="events" className="relative mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div id="workshops" className="sr-only" />

          {/* Curved Decorative Ambient Lighting Glows */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-96 w-96 rounded-full bg-gradient-to-br from-astu-navy/15 via-rose-500/10 to-transparent blur-3xl dark:from-sky-500/15 dark:via-rose-500/10" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-96 w-96 rounded-full bg-gradient-to-tr from-astu-green/15 via-amber-500/10 to-transparent blur-3xl dark:from-emerald-500/15" />

          {/* Curved Shell Canvas Container */}
          <div className="relative rounded-[2.5rem] md:rounded-[3.2rem] bg-gradient-to-b from-slate-50/95 via-white to-blue-50/30 dark:from-slate-900/95 dark:via-slate-800/85 dark:to-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,51,102,0.06)] dark:shadow-slate-950/50 p-6 md:p-10 lg:p-12 overflow-hidden">
            
            {/* Top Organic Wave Curve Accent */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 overflow-hidden opacity-30 dark:opacity-15">
              <svg viewBox="0 0 1440 40" fill="none" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <path d="M0,20 C320,40 460,0 720,20 C980,40 1140,0 1440,20 L1440,0 L0,0 Z" fill="currentColor" className="text-astu-navy/20 dark:text-sky-400/20" />
              </svg>
            </div>

            {/* Header Area matching screenshot */}
            <div className="mb-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
              <div>
                {/* CALENDAR Badge Pill matching user screenshot */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/95 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-astu-red dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 shadow-sm">
                  <CalendarDays className="h-3.5 w-3.5 text-astu-red dark:text-rose-400" />
                  <span>CALENDAR</span>
                </div>

                {/* Main Heading */}
                <h3 className="mt-2.5 text-2xl font-extrabold tracking-tight text-astu-navy dark:text-white sm:text-3xl md:text-4xl">
                  Upcoming Events & Workshops
                </h3>

                {/* Subtitle matching user screenshot */}
                <p className="mt-2 text-sm sm:text-base text-on-surface-variant dark:text-slate-300 max-w-2xl leading-relaxed">
                  Join campus career expos, technical workshops, and alumni reunions.
                </p>
              </div>

              {/* Action Button: See All Events → */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-astu-navy px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-astu-navy/20 transition-all duration-200 hover:bg-astu-navy/90 hover:shadow-lg hover:shadow-astu-navy/30 active:scale-95 group"
                  onClick={() => setShowAllEventsModal(true)}
                >
                  <span>See All Events</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Carousel Navigation Controls Bar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 dark:border-slate-700/60 pb-5">
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

              {/* Slider Navigation Buttons (Circular Curve Controls) */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-2 hidden md:inline-block">
                  Page {eventSlideIndex + 1} of {Math.max(1, Math.ceil(filteredEventsList.length / 3))}
                </span>
                <button
                  onClick={() => {
                    const totalPages = Math.max(1, Math.ceil(filteredEventsList.length / 3));
                    setEventSlideIndex((prev) => (prev - 1 + totalPages) % totalPages);
                  }}
                  aria-label="Previous Events Slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:border-astu-navy hover:text-astu-navy dark:hover:border-sky-400 dark:hover:text-sky-300 hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const totalPages = Math.max(1, Math.ceil(filteredEventsList.length / 3));
                    setEventSlideIndex((prev) => (prev + 1) % totalPages);
                  }}
                  aria-label="Next Events Slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:border-astu-navy hover:text-astu-navy dark:hover:border-sky-400 dark:hover:text-sky-300 hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Event Cards Grid / Slider View (3 cards side-by-side matching screenshot) */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEventsList
                .slice(eventSlideIndex * 3, eventSlideIndex * 3 + 3)
                .map((event, idx) => (
                  <article
                    key={event.id + '-' + idx}
                    className="animate-card-slide group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,51,102,0.05)] dark:shadow-slate-900/40 hover:shadow-2xl hover:shadow-astu-navy/15 dark:hover:shadow-sky-950/40 hover:-translate-y-2 transition-all duration-300"
                  >
                    {/* Top Image Frame with Smooth Curved Top */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
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
                          onClick={() => setSelectedEventModal(event)}
                          className="text-base sm:text-lg font-bold text-astu-navy dark:text-white line-clamp-1 hover:text-astu-red dark:hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          {event.title}
                        </h4>

                        {/* Date & Location Chips */}
                        <div className="mt-3 flex flex-col gap-1.5 text-xs text-on-surface-variant dark:text-slate-300">
                          <p className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                            <CalendarDays className="h-4 w-4 text-astu-red shrink-0" />
                            <span>{event.date}</span>
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
                          onClick={() => setSelectedEventModal(event)}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>

            {/* Slide Pagination Dots / Indicators (Curved Pill Indicators) */}
            {Math.ceil(filteredEventsList.length / 3) > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: Math.ceil(filteredEventsList.length / 3) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setEventSlideIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      eventSlideIndex === i
                        ? 'w-8 bg-astu-navy dark:bg-sky-400'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Bottom Organic Wave Curve Accent */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 overflow-hidden opacity-30 dark:opacity-15">
              <svg viewBox="0 0 1440 40" fill="none" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <path d="M0,0 C320,40 460,0 720,20 C980,40 1140,0 1440,0 L1440,40 L0,40 Z" fill="currentColor" className="text-astu-navy/20 dark:text-sky-400/20" />
              </svg>
            </div>
          </div>
        </section>

        {/* =========================================================================
            LATEST NEWS & ACADEMIC NOTICES (CURVED SLIDER WITH AUTO-TIMER)
            Exactly 3 visible cards at a time on desktop with auto-slide timer,
            progress bar, play/pause controls, popup details modal, and curved aesthetic.
            ========================================================================= */}
        <section id="news" className="relative mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          {/* Subtle Ambient Background Halos */}
          <div className="pointer-events-none absolute -top-10 -left-10 h-80 w-80 rounded-full bg-gradient-to-br from-astu-navy/10 via-sky-500/5 to-transparent blur-3xl dark:from-sky-500/10" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-80 w-80 rounded-full bg-gradient-to-tl from-rose-500/10 via-amber-500/5 to-transparent blur-3xl dark:from-rose-500/10" />

          {/* Curved Outer Showcase Canvas */}
          <div 
            className="relative rounded-[2.5rem] md:rounded-[3.2rem] bg-gradient-to-b from-slate-50/95 via-white to-slate-50/60 dark:from-slate-900/95 dark:via-slate-800/85 dark:to-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,51,102,0.06)] dark:shadow-slate-950/50 p-6 md:p-10 lg:p-12 overflow-hidden"
            onMouseEnter={() => setIsNewsTimerPaused(true)}
            onMouseLeave={() => setIsNewsTimerPaused(false)}
          >
            {/* Top Organic Wave Curve Accent */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 overflow-hidden opacity-30 dark:opacity-15">
              <svg viewBox="0 0 1440 40" fill="none" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <path d="M0,20 C320,40 460,0 720,20 C980,40 1140,0 1440,20 L1440,0 L0,0 Z" fill="currentColor" className="text-astu-navy/20 dark:text-sky-400/20" />
              </svg>
            </div>

            {/* Header Area */}
            <div className="mb-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
              <div>
                {/* Curved Badge Pill */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/95 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-astu-red dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-astu-red animate-pulse" />
                  <span>NEWS & ANNOUNCEMENTS</span>
                </div>

                {/* Main Heading */}
                <h3 className="mt-2.5 text-2xl font-extrabold tracking-tight text-astu-navy dark:text-white sm:text-3xl md:text-4xl">
                  Latest News
                </h3>

                {/* Subtitle */}
                <p className="mt-2 text-sm sm:text-base text-on-surface-variant dark:text-slate-300 max-w-2xl leading-relaxed">
                  University updates, academic notices, and alumni network news.
                </p>
              </div>

              {/* Action Button: See All News → */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-astu-navy px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-astu-navy/20 transition-all duration-200 hover:bg-astu-navy/90 hover:shadow-lg hover:shadow-astu-navy/30 active:scale-95 group"
                  onClick={() => setShowAllNewsModal(true)}
                >
                  <span>See All News</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Slider Controls Bar with Auto-play Progress Timer */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 dark:border-slate-700/60 pb-5">
              {/* Timer Progress Indicator & Status */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsNewsTimerPaused(!isNewsTimerPaused)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
                    isNewsTimerPaused
                      ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}
                  title={isNewsTimerPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
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

                {/* Animated Timer Progress Line */}
                <div className="relative h-1.5 w-32 sm:w-44 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-astu-navy to-sky-500 dark:from-sky-400 dark:to-emerald-400 transition-all duration-75 rounded-full ${
                      isNewsTimerPaused ? 'opacity-50' : 'opacity-100'
                    }`}
                    style={{ width: `${newsTimerProgress}%` }}
                  />
                </div>
              </div>

              {/* Slider Pagination Controls */}
              <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Slide {newsSlideIndex + 1} of {totalNewsSlides}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleNewsSlideChange(newsSlideIndex - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 disabled:opacity-40"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleNewsSlideChange(newsSlideIndex + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 disabled:opacity-40"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Exactly 3 Visible News Cards Grid on Desktop */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayNewsList
                .slice(newsSlideIndex * 3, newsSlideIndex * 3 + 3)
                .map((news: any, idx: number) => {
                  const categoryMeta = getNewsCategoryMeta(news);
                  return (
                    <article
                      key={news.id || `news-${newsSlideIndex}-${idx}`}
                      onClick={() => setSelectedNewsModal(news)}
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
                          <span>{news.date || 'Recent'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNewsModal(news);
                          }}
                          className="inline-flex items-center gap-1 font-bold text-astu-navy dark:text-amber-400 group-hover:translate-x-1 transition-transform"
                        >
                          <span>Read More</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
            </div>

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

            {/* Bottom Organic Wave Curve Accent */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 overflow-hidden opacity-30 dark:opacity-15">
              <svg viewBox="0 0 1440 40" fill="none" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <path d="M0,0 C320,40 460,0 720,20 C980,40 1140,0 1440,0 L1440,40 L0,40 Z" fill="currentColor" className="text-astu-navy/20 dark:text-sky-400/20" />
              </svg>
            </div>
          </div>
        </section>

        <section id="announcements" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <article className="reveal rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-astu-navy/10 dark:bg-astu-navy/30">
                    <img src="/images/announcementIcon.svg" alt="announcement" loading="lazy" width="100" height="100" className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Announcements</p>
                    <h3 className="text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Official Notices</h3>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/announcements')}
                  className="rounded-md border border-outline-variant dark:border-slate-600 px-3 py-2 text-xs font-semibold text-astu-navy dark:text-amber-400 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-outline-variant dark:divide-slate-700">
                {liveAnnouncements.slice(0, 5).map((announcement, idx) => (
                  <button
                    key={announcement.title + idx}
                    onClick={() => navigate(`/announcements/${announcement.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                    className="flex w-full items-start gap-3 py-4 text-left hover:bg-surface-container-low/60 dark:hover:bg-slate-700/50 rounded-lg px-2 transition-all cursor-pointer group"
                  >
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red group-hover:scale-110 transition-transform" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-amber-400 transition-colors">{announcement.title}</span>
                      <span className="mt-1 block text-xs text-on-surface-variant dark:text-slate-400">{announcement.type} · {announcement.date}</span>
                    </span>
                  </button>
                ))}
              </div>
            </article>

            <aside className="reveal rounded-xl border border-outline-variant dark:border-astu-navy/40 bg-astu-navy p-5 text-white shadow-sm">
              <FileText className="h-7 w-7 text-astu-green" />
              <h4 className="mt-4 text-xl font-bold">Subscribe to official updates</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Receive announcements, events, workshops, partner calls, tracer survey reminders, and campus notices.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  toast.error('Announcement sign-up is not available yet. No email address was stored.');
                  (event.currentTarget as HTMLFormElement).reset();
                }}
                className="mt-5 space-y-3"
              >
                <input type="email" required placeholder="Enter your email" className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-white/55 focus:border-astu-green" />
                <button className="w-full rounded-md bg-astu-green px-4 py-3 text-sm font-bold text-white hover:brightness-110">
                  Subscribe
                </button>
              </form>
            </aside>
          </div>
        </section>

        <section id="success-stories" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Success Stories</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Alumni Success Stories</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Journeys of ASTU graduates building careers across industry, research, and entrepreneurship.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveStories.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptySection message="Alumni success stories will appear here once published by the university content team." />
              </div>
            ) : (
              liveStories.slice(0, 3).map((story, idx) => (
                <article
                  key={story.id || idx}
                  className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40 flex flex-col justify-between`}
                >
                  <div>
                    {story.image ? (
                      <img
                        src={story.image}
                        alt=""
                        className="h-40 w-full rounded-xl object-cover mb-3 bg-slate-100 dark:bg-slate-700"
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
                  <button
                    className="mt-4 text-xs font-semibold text-[#003580] dark:text-amber-400 hover:underline self-start cursor-pointer inline-flex items-center gap-1"
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
                </article>
              ))
            )}
          </div>
        </section>

        {/* ── Giving & Endowment Campaigns Section ── */}
        <section id="giving" className="relative py-16 md:py-24 bg-gradient-to-b from-white via-slate-50/80 to-white overflow-hidden border-t border-slate-100">
          {/* Subtle brand ambient glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 right-10 w-96 h-96 rounded-full bg-[#003366]/5 blur-3xl" />
            <div className="absolute -bottom-20 left-10 w-96 h-96 rounded-full bg-[#008C44]/5 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003366]/10 text-[#003366] text-xs font-black uppercase tracking-wider">
                  <Heart className="h-3.5 w-3.5 fill-[#E31E24] text-[#E31E24]" />
                  ASTU Alumni Giving
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  {liveGivingSection?.title || 'Support Future Innovators & Campus Research'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {liveGivingSection?.subtitle || '100% of your tax-deductible contribution directly funds merit scholarships, cutting-edge postgraduate laboratories, student incubators, and emergency support.'}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => navigate('/donations')}
                  className="px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-[#FFCC00] text-[#FFCC00]" /> {liveGivingSection?.buttonText || 'Explore All Causes'}
                </button>
              </div>
            </div>

            {/* Quick Category Filter Bar */}
            {(() => {
              const allAvailable = (donationCampaigns.length > 0 ? donationCampaigns : [
                {
                  id: "fallback-c-1",
                  title: "ASTU Scholarship Fund 2026",
                  category: "Scholarship",
                  description: "Support underprivileged engineering and technology students with full tuition, academic supplies, and campus living grants.",
                  goal: 5000000,
                  raised: 1851000,
                  donorCount: 349,
                  status: "ACTIVE"
                },
                {
                  id: "fallback-c-2",
                  title: "AI Research Lab Equipment",
                  category: "Research",
                  description: "Fund high-performance GPU servers and laboratory instrumentation for advanced postgraduate engineering researchers.",
                  goal: 8000000,
                  raised: 3201000,
                  donorCount: 158,
                  status: "ACTIVE"
                },
                {
                  id: "fallback-c-3",
                  title: "Campus Innovation Makerspace",
                  category: "Infrastructure",
                  description: "Build a state-of-the-art student incubator, rapid prototyping center, and robotics testing laboratory on main campus.",
                  goal: 12000000,
                  raised: 6800000,
                  donorCount: 220,
                  status: "ACTIVE"
                }
              ]).filter((c: any) => c.status === 'ACTIVE' || !c.status);

              const homeCategories = ['ALL', 'Scholarship', 'Research', 'Infrastructure', 'Innovation'];
              const filteredList = allAvailable.filter(
                (c: any) => homeDonationCategory === 'ALL' || c.category === homeDonationCategory
              );
              // Controlled display limit: default 3 cards, max 6 on expand
              const displayedCards = showAllHomeDonations ? filteredList.slice(0, 6) : filteredList.slice(0, 3);

              // ASTU Brand category pill scheme
              const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
                Scholarship: { bg: 'bg-blue-50', text: 'text-[#003366]', border: 'border-blue-200' },
                Research: { bg: 'bg-emerald-50', text: 'text-[#008C44]', border: 'border-emerald-200' },
                Infrastructure: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
                Innovation: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
                'Student Welfare': { bg: 'bg-rose-50', text: 'text-[#E31E24]', border: 'border-rose-200' },
                'Emergency Fund': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
              };

              return (
                <div className="space-y-6">
                  {/* Category Pills & Count */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mr-1">Focus Area:</span>
                      {homeCategories.map((cat) => {
                        const isActive = homeDonationCategory === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setHomeDonationCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                              isActive
                                ? 'bg-[#003366] text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat === 'ALL' ? 'All Active Causes' : cat}
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-xs font-bold text-slate-500">
                      Showing <span className="text-slate-900 font-extrabold">{displayedCards.length}</span> of {allAvailable.length} active campaigns
                    </div>
                  </div>

                  {/* Campaign Cards Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {displayedCards.map((c: any, idx: number) => {
                      const goal = c.goal || c.targetAmount || 1000000;
                      const raised = c.raised || 0;
                      const percent = Math.min(100, Math.round((raised / (goal || 1)) * 100));
                      const donors = c.donorCount || 0;
                      const category = c.category || 'Initiative';
                      const catStyle = categoryStyles[category] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

                      return (
                        <article
                          key={c.id || idx}
                          className="reveal group flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 p-6 md:p-7 shadow-[0_4px_24px_rgba(0,51,102,0.06)] hover:shadow-[0_16px_40px_rgba(0,51,102,0.12)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
                        >
                          {/* Authentic ASTU Tri-color Accent Bar */}
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#003366] via-[#008C44] to-[#FFCC00]" />

                          <div>
                            {/* Header tags */}
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                {category}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-500">
                                <Users className="h-3 w-3 text-slate-400" /> {donors} {donors === 1 ? 'Donor' : 'Donors'}
                              </span>
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-[#003366] transition-colors line-clamp-2 leading-snug">
                              {c.title}
                            </h3>
                            <p className="mt-2.5 text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-3">
                              {c.description || 'Support ASTU causes and make a lasting impact for future generations of engineers and researchers.'}
                            </p>
                          </div>

                          {/* Progress Bar & Amount */}
                          <div className="mt-6 pt-5 border-t border-slate-100">
                            <div className="flex items-baseline justify-between mb-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Raised</span>
                                <span className="text-base font-black text-[#003366]">
                                  {raised.toLocaleString()} <span className="text-[10px] text-slate-400 font-extrabold">ETB</span>
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Goal</span>
                                <span className="text-xs font-bold text-slate-600">
                                  {goal.toLocaleString()} ETB
                                </span>
                              </div>
                            </div>

                            {/* Progress bar container */}
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#003366] via-blue-700 to-[#008C44] transition-all duration-1000 shadow-xs"
                                style={{ width: `${Math.max(5, percent)}%` }}
                              />
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                              <span>{percent}% Funded</span>
                              <span className="text-[#008C44] font-extrabold">Active Cause</span>
                            </div>

                            {/* Accepted methods badge */}
                            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-500">Fast Pay</span>
                              <span className="text-[10px] font-extrabold text-slate-700 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Telebirr • Chapa • CBE Birr
                              </span>
                            </div>

                            {/* CTA Button */}
                            <button
                              onClick={() => handleDonateClick(c)}
                              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#002759] hover:from-[#002244] hover:to-[#001a33] text-white font-black text-xs md:text-sm py-3 px-4 shadow-md hover:shadow-lg hover:shadow-[#003366]/20 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                            >
                              <Heart className="h-4 w-4 fill-[#FFCC00] text-[#FFCC00]" />
                              Support This Cause
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Empty state for selected category */}
                  {displayedCards.length === 0 && (
                    <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-2">
                      <Heart className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">No campaigns found in this category.</p>
                      <button
                        onClick={() => setHomeDonationCategory('ALL')}
                        className="text-xs text-[#003366] font-extrabold hover:underline"
                      >
                        Show All Causes
                      </button>
                    </div>
                  )}

                  {/* Smart Bottom Controls: Show More / View Full Directory */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {filteredList.length > 3 && (
                      <button
                        onClick={() => setShowAllHomeDonations(!showAllHomeDonations)}
                        className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold transition-all shadow-xs cursor-pointer"
                      >
                        {showAllHomeDonations ? 'Show Less' : `Show More (${filteredList.length - 3} More Causes)`}
                      </button>
                    )}

                    <button
                      onClick={() => navigate('/donations')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002759] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <span>Explore All {allAvailable.length} Causes in Giving Portal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── Community Section ── */}
        {(() => {
          const liveCommunitySection = {
            title: 'ASTU Alumni Community',
            subtitle: 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates making a difference worldwide.'
          };
          const dynamicCommunityStats = [
            { label: 'Registered Alumni', value: '18,500+' },
            { label: 'Fields of Study', value: '42' },
            { label: 'Global Chapters', value: '12' }
          ];
          const liveCommunityPosts = [
            {
              name: 'Dr. Fitsum Kebede',
              role: 'Alumni Ambassador, Europe Chapter',
              degree: 'BSc Electrical Engineering, 2012',
              text: 'ASTU gave us the engineering discipline and rigor to compete globally.',
              image: '/images/campus-2.jpeg'
            },
            {
              name: 'Sara Mohammed',
              role: 'Tech Lead & Founder',
              degree: 'BSc Software Engineering, 2016',
              text: 'The network and mentorship I gained through the alumni association were pivotal to starting my company.',
              image: '/images/campus-3.jpeg'
            },
            {
              name: 'Abebe Bekele',
              role: 'Senior Project Engineer',
              degree: 'BSc Civil Engineering, 2010',
              text: 'Giving back to current students through workshops and campus visits has been deeply fulfilling.',
              image: '/images/campus-1.jpeg'
            }
          ];

          return (
            <section id="community" className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-br from-astu-navy via-[#003366] to-[#002244]">
              {/* Background decorative */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-astu-green/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-astu-red/5 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                  <Users className="h-[400px] w-[400px] text-white" />
                </div>
              </div>
              <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8">
                <div className="mb-12 text-center reveal">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-astu-green">
                    <Globe className="h-3.5 w-3.5" /> {liveCommunitySection?.title || 'ASTU Alumni Community'}
                  </span>
                  <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
                    Your Networks <span className="text-astu-green">Around the World</span>
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 leading-relaxed">
                    {liveCommunitySection?.subtitle || 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates making a difference worldwide.'}
                  </p>
                </div>

                {/* Community Stats */}
                <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto reveal">
                  {dynamicCommunityStats.map((stat, idx) => {
                    const Icon = idx === 0 ? Users : idx === 1 ? BookOpen : Globe;
                    return (
                      <div key={stat.label} className={`reveal reveal-delay-${idx + 1} rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 text-center hover:bg-white/10 transition-all hover:-translate-y-1`}>
                        <Icon className="h-6 w-6 text-astu-green mx-auto mb-2" />
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                        <p className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Community Testimonials */}
                <div id="testimonials" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 scroll-mt-24">
                  {liveCommunityPosts.map((post: any, idx: number) => (
                    <article
                      key={post.name}
                      className={`reveal reveal-delay-${(idx % 3) + 1} group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)]`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <Quote className="h-6 w-6 text-astu-green/60" />
                          {post.degree && (
                            <span className="text-[10px] font-semibold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                              {post.degree}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-200 italic">"{post.text}"</p>
                      </div>
                      <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/10">
                        <img
                          src={post.image}
                          alt={post.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-astu-green/60 shrink-0 shadow-md bg-white/10"
                          onError={handleImageError}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate">{post.name}</p>
                          <p className="text-[11px] text-astu-green font-medium truncate">{post.role}</p>
                          {post.org && <p className="text-[10px] text-slate-300 truncate">{post.org}</p>}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Join CTA */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 reveal">
                  <button
                    onClick={() => navigate('/register')}
                    className="inline-flex items-center gap-2 rounded-xl bg-astu-green px-8 py-3.5 text-sm font-bold text-white hover:brightness-110 transition-all hover:scale-105 shadow-lg hover:shadow-astu-green/25 btn-magnetic"
                  >
                    <UserRoundCheck className="h-4 w-4" /> Join ASTU Alumni Network
                  </button>
                  <button
                    onClick={() => navigate('/community')}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all hover:scale-105"
                  >
                    <Globe className="h-4 w-4" /> Explore Community
                  </button>
                </div>
              </div>
            </section>
          );
        })()}



        <section id="research" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <article className="reveal rounded-xl bg-astu-navy p-6 text-white">
              <Trophy className="h-8 w-8 text-astu-green" />
              <h3 className="mt-4 text-2xl font-bold md:text-3xl">
                {researchHighlights?.title || 'Research, Innovation & University Achievements'}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-200">
                {researchHighlights?.description ||
                  'ASTU-AMS connects graduate research publications, startup showcases, employer collaborations, and department KPI evidence into one institutional analytics layer.'}
              </p>
              {mentorshipStats && (
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold">{mentorshipStats.mentors}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-300">Mentors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mentorshipStats.mentees}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-300">Mentees</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mentorshipStats.sessions}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-300">Sessions</p>
                  </div>
                </div>
              )}
            </article>
            <div className="grid gap-4 sm:grid-cols-3">
              {(researchHighlights?.stats?.length ? researchHighlights.stats : []).map((item: any, idx: number) => {
                const Icon = typeof item.icon === 'function' ? item.icon : (iconMap[item.icon] || BookOpen);
                return (
                  <article key={item.label || idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                    <Icon className="h-6 w-6 text-astu-navy dark:text-amber-400" />
                    <p className="mt-4 text-2xl font-bold text-astu-navy dark:text-white">{item.value || '—'}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-on-surface-variant dark:text-slate-400">{item.label}</p>
                  </article>
                );
              })}
              {!researchHighlights?.stats?.length && (
                <div className="sm:col-span-3">
                  <EmptySection message="Research highlights will appear here once published by the university content team." />
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="partners" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 overflow-hidden bg-gradient-to-b from-[#f8faff] dark:from-slate-900/50 to-white dark:to-slate-950 rounded-2xl my-8">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Partners</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Partner Organisations</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">Institutional partners supporting employability, accreditation feedback, internships, and research collaboration.</p>
          </div>
          <div className="relative">
            {livePartners.length === 0 ? (
              <EmptySection message="Partner organisations will appear here once published by the university content team." />
            ) : (
            <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
              {[...livePartners, ...livePartners].map((partner, idx) => {
                const LogoComponent = partnerLogos[partner.name];
                const logoUrl = partner.logo || partner.image || partner.logoUrl;
                return (
                  <div
                    key={`${partner.name}-${idx}`}
                    className="flex min-w-[180px] flex-col items-center gap-3 rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40"
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt={partner.name} className="h-14 w-14 object-contain" onError={handleImageError} />
                    ) : LogoComponent ? (
                      <LogoComponent />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-astu-navy text-white text-sm font-bold shadow-md">
                        {(partner.name || '??').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-astu-navy dark:text-white text-center leading-tight">{partner.name}</span>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </section>

        <section id="testimonials" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Community Voices</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">What Our Community Says</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Reflections from alumni, employers, and partners connected through the ASTU network.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {liveTestimonials.length === 0 ? (
              <div className="md:col-span-3">
                <EmptySection message="Community testimonials will appear here once published by the university content team." />
              </div>
            ) : (
              liveTestimonials.map((item: any, idx: number) => (
              <article key={item.id || item.by || idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <Quote className="h-6 w-6 text-astu-red" />
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant dark:text-slate-300">{item.quote}</p>
                <p className="mt-4 text-sm font-semibold text-astu-navy dark:text-white">{item.by}</p>
              </article>
              ))
            )}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">FAQ</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Frequently Asked Questions</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant dark:text-slate-400">
              Common questions about ASTU-AMS, tracer studies, and alumni services.
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {liveFaq.length === 0 ? (
              <EmptySection message="Frequently asked questions will appear here once published by the university content team." />
            ) : (
              liveFaq.map((item, idx) => (
              <details key={item.id || idx} className={`reveal reveal-delay-${(idx % 3) + 1} group rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-astu-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <HelpCircle className="h-5 w-5 shrink-0 text-astu-red transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="border-t border-outline-variant dark:border-slate-700 px-5 py-4 text-sm leading-relaxed text-on-surface-variant dark:text-slate-400">
                  {item.answer}
                </div>
              </details>
              ))
            )}
          </div>
        </section>

        <section id="career-opportunities" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal rounded-xl border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-800 p-6 card-hover shadow-[0_4px_16px_rgba(0,51,102,0.08)] dark:shadow-slate-900/40">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-astu-red">
                  {careerCta?.eyebrow || 'Career Opportunities'}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white">
                  {careerCta?.title || 'Jobs, internships, AI matching, and candidate shortlisting'}
                </h3>
                <p className="mt-2 max-w-3xl text-sm text-on-surface-variant dark:text-slate-400">
                  {careerCta?.description ||
                    'Employers can post bulk jobs, manage talent pools, shortlist candidates, schedule interviews, and join job fairs.'}
                </p>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-astu-red px-5 py-3 text-sm font-semibold text-white hover:brightness-110"
                onClick={() => navigate(careerCta?.route || '/employers')}
              >
                <UserRoundCheck className="h-4 w-4" />
                {careerCta?.buttonLabel || 'Explore Opportunities'}
              </button>
            </div>
          </div>
        </section>

        {tracerSpotlight && (
          <section id="tracer-spotlight" className="mx-auto max-w-[1440px] px-4 pb-12 md:px-8">
            <div className="reveal rounded-xl border border-astu-navy/20 dark:border-astu-navy/40 bg-gradient-to-r from-[#003580]/5 dark:from-astu-navy/20 to-white dark:to-slate-900 p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-astu-red">Tracer Study</p>
                  <h3 className="mt-2 text-xl font-bold text-astu-navy dark:text-white">{tracerSpotlight.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm text-on-surface-variant dark:text-slate-400">{tracerSpotlight.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-on-surface-variant dark:text-slate-400">
                    {tracerSpotlight.targetBatch && <span>Batch: <strong className="dark:text-slate-200">{tracerSpotlight.targetBatch}</strong></span>}
                    {tracerSpotlight.responseRate && <span>Response rate: <strong className="dark:text-slate-200">{tracerSpotlight.responseRate}</strong></span>}
                    {tracerSpotlight.deadline && <span>Deadline: <strong className="dark:text-slate-200">{tracerSpotlight.deadline}</strong></span>}
                  </div>
                </div>
                <button
                  className="rounded-md bg-astu-navy px-5 py-3 text-sm font-semibold text-white hover:brightness-110"
                  onClick={() => navigate('/login')}
                >
                  Complete Tracer Survey
                </button>
              </div>
            </div>
          </section>
        )}

        <section id="cta" className="relative bg-gradient-to-r from-astu-navy via-primary-container to-slate-900 py-16 text-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-[20%] w-3 h-3 rounded-full bg-astu-green/20 animate-float" style={{ animationDelay: "0s" }} />
            <div className="absolute bottom-10 right-[30%] w-2 h-2 rounded-full bg-astu-red/20 animate-float" style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-20 right-[15%] w-1.5 h-1.5 rounded-full bg-white/15 animate-float" style={{ animationDelay: "3s" }} />
          </div>
          <div className="max-w-[1440px] mx-auto px-4 reveal relative z-10">
            <h3 className="text-3xl font-bold text-white md:text-4xl">
              {bottomCta?.title || 'Ready to Join ASTU-AMS?'}
            </h3>
            <p className="mt-4 text-slate-200 max-w-2xl mx-auto">
              {bottomCta?.description ||
                'Connect with fellow alumni, discover career opportunities, and contribute to university excellence.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                className="px-6 py-3 bg-white text-astu-navy font-bold rounded-xl hover:bg-slate-100 transition-all shadow-md hover:scale-105 btn-magnetic"
                onClick={() => navigate(bottomCta?.primaryRoute || '/login')}
              >
                {bottomCta?.primaryLabel || 'Alumni Portal'}
              </button>
              <button
                className="px-6 py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all hover:scale-105 btn-magnetic"
                onClick={() => navigate(bottomCta?.secondaryRoute || '/login')}
              >
                {bottomCta?.secondaryLabel || 'Employer Portal'}
              </button>
            </div>
          </div>
        </section>


      </main>

      <footer id="contact" className="border-t-2 border-astu-green/30 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 py-16 text-slate-300">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 space-y-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-10 border-b border-white/5">
            <div className="max-w-md">
              <h5 className="text-base font-bold text-white uppercase tracking-wider">
                {footerConfig.newsletterTitle || 'Stay Connected with ASTU'}
              </h5>
              <p className="text-xs text-slate-400 mt-1">
                {footerConfig.newsletterSubtitle || 'Get updates on reunions, career expos, and employment reports.'}
              </p>
            </div>
            <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // There is no newsletter endpoint, so this previously toasted
                  // "You are subscribed" without storing anything or telling the
                  // server. It now says plainly that no address was recorded.
                  toast.error('Newsletter sign-up is not available yet. No email address was stored.');
                }}
                className="flex w-full lg:w-auto max-w-md gap-2"
              >
              <input
                type="email"
                placeholder="Enter email for campus news..."
                className="w-full lg:w-64 text-xs px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700]/30 text-white"
                required
              />
              <button
                type="submit"
                className="px-5 py-3 bg-[#FFD700] hover:bg-[#FFD700]/95 text-indigo-950 font-bold text-xs rounded-xl hover:scale-105 transition-all shadow-md whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  alt="ASTU Official Emblem"
                  className="h-12 w-12 object-contain scale-110 shrink-0"
                  src="/images/astu-seal-logo.png"
                />
                <div>
                  <h5 className="text-lg font-black text-white tracking-wider uppercase">ASTU-AMS</h5>
                  <p className="text-[10px] text-astu-green uppercase tracking-widest font-extrabold">Alumni Network</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {welcomeMessage ||
                  'Connecting graduates, corporate employers, and department heads in one unified ecosystem.'}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {(footerConfig.socialLinks || []).map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 hover:border-[#FFD700] px-3.5 py-2 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            </div>

            {(footerConfig.sections || []).slice(0, 2).map((section) => (
              <div key={section.id}>
                <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">
                  {section.title}
                </h6>
                <ul className="space-y-3 text-xs text-slate-400">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      {link.href.startsWith('http') || link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                          {...(link.href.startsWith('http')
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                          onClick={() => navigate(link.href)}
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">
                Official Contact Details
              </h6>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-astu-green mt-0.5 shrink-0" />
                  <span>{footerConfig.contactInfo?.address}</span>
                </li>
                {footerConfig.contactInfo?.poBox && (
                  <li className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-astu-green mt-0.5 shrink-0" />
                    <span>{footerConfig.contactInfo.poBox}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-astu-green shrink-0" />
                  <span>{footerConfig.contactInfo?.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-astu-green shrink-0" />
                  <a
                    href={`mailto:${footerConfig.contactInfo?.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {footerConfig.contactInfo?.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {(footerConfig.sections || []).length > 2 && (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 border-t border-white/5 pt-8">
              {(footerConfig.sections || []).slice(2).map((section) => (
                <div key={section.id}>
                  <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">
                    {section.title}
                  </h6>
                  <ul className="space-y-3 text-xs text-slate-400">
                    {section.links.map((link) => (
                      <li key={link.id}>
                        {link.href.startsWith('http') || link.href.startsWith('#') ? (
                          <a href={link.href} className="transition-all duration-300 hover:text-white hover:translate-x-1 inline-block">
                            {link.label}
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                            onClick={() => navigate(link.href)}
                          >
                            {link.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8 text-xs text-slate-500 font-semibold">
            <div className="flex flex-wrap items-center gap-3">
              <p>{footerConfig.copyright}</p>
              {footerConfig.credit && (
                <>
                  <span>&bull;</span>
                  <p className="text-astu-green">{footerConfig.credit}</p>
                </>
              )}
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition-all hover:scale-105"
            >
              Back to Top
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>
      </footer>

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
                  <button onClick={confirmRsvpRegistration} className="rounded-lg bg-[#003580] px-5 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-md">
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
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Announcement link copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
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

      {/* Alumni Donation Routing / Authentication Modal */}
      {isDonationAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 transition-all">
            {/* Top decorative gradient bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#003366] via-[#008C44] to-[#FFCC00]" />

            {/* Close Button */}
            <button
              onClick={() => setIsDonationAuthModalOpen(false)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 md:p-8">
              {/* Header Badge & Title */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#003366]/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#003366] mb-3">
                <Heart className="h-3.5 w-3.5 fill-[#E31E24] text-[#E31E24]" />
                ASTU Alumni Giving
              </div>

              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Support ASTU's Future
              </h3>

              {selectedDonationCampaign && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#008C44]">
                      Selected Campaign
                    </span>
                    <p className="text-xs md:text-sm font-bold text-slate-800 truncate">
                      {selectedDonationCampaign.title}
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg bg-[#003366]/10 text-[#003366] text-[10px] font-black uppercase">
                    {selectedDonationCampaign.category || 'Initiative'}
                  </span>
                </div>
              )}

              <p className="mt-3 text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                Contributions are managed through the verified ASTU Alumni Portal. Please choose how you'd like to proceed:
              </p>

              {/* Options Cards */}
              <div className="mt-6 space-y-3.5">
                {/* Option 1: Registered Alumni -> Login */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    navigate('/login?redirect=/alumni/dashboard?tab=donations');
                  }}
                  className="group relative flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-200 hover:border-[#003366] bg-white hover:bg-slate-50/80 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-[#003366]/10 text-[#003366] group-hover:bg-[#003366] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-[#003366] transition-colors">
                        I am a Registered Alumni
                      </h4>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#003366] group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      Sign in with your student ID or email to access your Giving dashboard directly.
                    </p>
                  </div>
                </div>

                {/* Option 2: New Alumni -> Register */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    navigate('/register');
                  }}
                  className="group relative flex items-start gap-4 p-4 rounded-2xl border-2 border-emerald-200/90 hover:border-emerald-600 bg-emerald-50/30 hover:bg-emerald-50/70 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                        I am a New Alumni
                      </h4>
                      <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                      Register your student graduation records to activate your alumni network account first.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified ASTU Alumni Advancement &amp; Giving Portal
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
      {/* Public Donation Modal for Telebirr / Chapa / CBE Birr */}
      <TelebirrDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaign={selectedDonationCampaign}
        onSuccess={() => {
          contentService.getPublicDonationCampaigns().then((campaigns) => {
            if (campaigns && campaigns.length) {
              setDonationCampaigns(campaigns);
            }
          }).catch(() => {});
        }}
      />

      <ChatBot />
    </div>
  );
}
