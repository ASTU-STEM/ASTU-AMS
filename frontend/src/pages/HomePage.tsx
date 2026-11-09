import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
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
  Sparkles,
  Trophy,
  UserRoundCheck,
  Phone,
  Mail,
  CircleUserRound,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import { partnerLogos } from "../components/PartnerLogos";
import eventsService from "../features/admin/services/events.service";
import contentService from "../features/admin/services/content.service";
import storiesService from "../features/admin/services/stories.service";
import homepageCmsService, { defaultSectionLinks } from "../features/admin/services/homepageCms.service";
import gallerySettingsService, { GalleryPageSettings } from "../features/admin/services/gallerySettings.service";
import { usePublicMetrics } from "../services/publicMetrics.service";

import astuLogo from "../assets/logos/astu-icon.jpeg";
import gallery1 from "../assets/imgs/astu-building.jpg";
import gallery2 from "../assets/imgs/campus-2.jpeg";
import gallery3 from "../assets/imgs/astu-logo.jpeg";
import arcImage from "../assets/images/arc.jpg";
import stateM from "../assets/images/State-M.jpg";
import gc7 from "../assets/images/gc7.jpg";
import electricLabs from "../assets/images/electriclabs.jpeg";
import humanitarianBuilding from "../assets/images/humanitary building.jpg";

const FALLBACK_IMAGE = "/images/fallback-campus.svg";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Building2, LineChart, FileCheck2, MessageSquareText, Briefcase, LockKeyhole, Globe, BookOpen, Star, Handshake, ShieldCheck, Trophy, CircleUserRound, Search, BarChart3,
};

const getDynamicStatIcon = (stat: any, idx: number) => {
  if (stat?.icon) {
    if (typeof stat.icon === 'function') return stat.icon;
    if (typeof stat.icon === 'string' && iconMap[stat.icon]) return iconMap[stat.icon];
  }
  const labelText = (stat?.title || stat?.label || '').toLowerCase();
  if (labelText.includes('alumni') || labelText.includes('member') || labelText.includes('user') || labelText.includes('graduate')) return Users;
  if (labelText.includes('field') || labelText.includes('program') || labelText.includes('study') || labelText.includes('faculty') || labelText.includes('academic')) return BookOpen;
  if (labelText.includes('partner') || labelText.includes('employer') || labelText.includes('company') || labelText.includes('industry')) return Building2;
  if (labelText.includes('impact') || labelText.includes('rate') || labelText.includes('placement') || labelText.includes('outcome') || labelText.includes('hired')) return Trophy;

  const fallbacks = [Users, BookOpen, Building2, Trophy, LineChart];
  return fallbacks[idx % fallbacks.length];
};

const howItWorksSteps = [
  {
    step: 1,
    badge: "01",
    icon: CircleUserRound,
    title: "CREATE YOUR PROFILE",
    description:
      "Build your verified professional identity and showcase your education, skills and experience.",
    tags: ["Verified ID", "Skill Matrix"],
    color: "from-astu-navy to-blue-800",
    iconBg: "bg-blue-50 text-astu-navy border-blue-200/60",
    cta: "Start Profile",
    route: "/register",
  },
  {
    step: 2,
    badge: "02",
    icon: Search,
    title: "DISCOVER OPPORTUNITIES",
    description:
      "Find jobs, internships, mentorship and career opportunities.",
    tags: ["Job Match", "Mentorship"],
    color: "from-astu-red to-rose-700",
    iconBg: "bg-rose-50 text-astu-red border-rose-200/60",
    cta: "Explore Opportunities",
    route: "/info/employer-portal",
  },
  {
    step: 3,
    badge: "03",
    icon: Handshake,
    title: "CONNECT & COLLABORATE",
    description:
      "Connect with alumni, employers and the ASTU community.",
    tags: ["Global Network", "Industry Events"],
    color: "from-emerald-600 to-teal-700",
    iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    cta: "Join Network",
    route: "/login",
  },
  {
    step: 4,
    badge: "04",
    icon: LineChart,
    title: "GROW & GIVE BACK",
    description:
      "Mentor students, share your experience and contribute to ASTU.",
    tags: ["Tracer Surveys", "Curriculum"],
    color: "from-purple-600 to-indigo-800",
    iconBg: "bg-purple-50 text-purple-700 border-purple-200/60",
    cta: "Take Tracer Survey",
    route: "/info/alumni-portal",
  },
];

const navSections = [
  { label: "Home", id: "home" },
  { label: "Impact Numbers", id: "impact-numbers" },
  { label: "Impact", id: "impact" },
  { label: "Gallery", id: "gallery" },
  { label: "Campuses", id: "campuses" },
  { label: "Announcements", id: "announcements" },
  { label: "Community", id: "community" },
  { label: "Events", id: "events" },
  { label: "News", id: "news" },
  { label: "Success Stories", id: "success-stories" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" }
];

const communityPosts = [
  {
    name: "Abebe Yosef",
    role: "Software Engineer",
    text: "I landed my new role after using ASTU-AMS job matching and mentorship support. Thank you ASTU community.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Bekele Kebede",
    role: "Employer Partner",
    text: "Hiring from ASTU-AMS has been efficient. We found strong engineering candidates with the right practical skills.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Helina Sileshi",
    role: "Mentor & Alumni",
    text: "Proud to mentor ASTU students through the AMS platform. The next generation of innovators is ready!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
];

const events: any[] = [];

const workshops: any[] = [];

const featuredAlumni = [
  { name: "Dr. Ruth Alemu", role: "AI Research Scientist", impact: "Published 18 applied AI papers and mentors ASTU research teams.", image: arcImage },
  { name: "Yonas Bekele", role: "Founder, GreenGrid Labs", impact: "Built a renewable-energy startup serving industrial campuses.", image: electricLabs },
  { name: "Kalkidan Tadesse", role: "Cloud Platform Lead", impact: "Leads enterprise cloud migration programs for regional partners.", image: stateM },
];

const featuredEmployers = [
  { name: "Ethio Telecom", area: "Telecom & Cloud", openings: "14 graduate roles" },
  { name: "Ethiopian Airlines", area: "Aviation Technology", openings: "8 internship tracks" },
  { name: "INSA", area: "Cybersecurity", openings: "6 research placements" },
  { name: "Huawei Ethiopia", area: "Network Engineering", openings: "11 certification paths" },
];

const partners = [
  { name: "Ethio Telecom" },
  { name: "INSA" },
  { name: "Ethiopian Airlines" },
  { name: "Safaricom" },
  { name: "Huawei" },
  { name: "Commercial Bank of Ethiopia" },
];

const campusLifeCards = [
  { id: "campus-life-1", title: "Reunions, career expos, and workshops", campus: "Events and Activities", description: "Chapter meetings and community programs that keep graduates connected to the university.", image: gallery2, action: "View events", link: "/events" },
  { id: "campus-life-2", title: "Facilities", campus: "Innovation Spaces", description: "Laboratories, research centers, libraries, and employer interview rooms.", image: electricLabs, action: "Explore facilities", link: "/info/facilities" },
  { id: "campus-life-3", title: "Museums and gallery", campus: "Campus Gallery", description: "Research showcases, graduation moments, and campus photography.", image: arcImage, action: "View gallery", link: "/gallery" },
];

const announcements = [
  {
    id: "ann-1",
    day: "09",
    month: "SEP",
    title: "ASTU Engineering Innovation Summit 2026",
    type: "Official announcement",
    year: "2026",
    date: "09 Sep 2026",
  },
  {
    id: "ann-2",
    day: "07",
    month: "JUN",
    title: "Semester Break: Campus Safety Notice",
    type: "Official announcement",
    year: "2026",
    date: "07 Jun 2026",
  },
  {
    id: "ann-3",
    day: "28",
    month: "APR",
    title: "ASTU Alumni Network: Bridging Generations",
    type: "Press",
    year: "2026",
    date: "28 Apr 2026",
  },
  {
    id: "ann-4",
    day: "31",
    month: "MAY",
    title: "Tracer Study 2026 response window is open",
    type: "Alumni Announcement",
    year: "2026",
    date: "31 May 2026",
  },
];

const campuses = [
  { name: "Main Campus", description: "Central hub for alumni services, registrar workflows, and institutional engagement.", image: gallery1 },
  { name: "Engineering Labs", description: "Applied research, workshops, innovation programs, and industry-linked training.", image: electricLabs },
  { name: "Graduation & Events Hall", description: "Ceremonies, career fairs, alumni awards, and university achievement programs.", image: gc7 },
  { name: "Research Collaboration Center", description: "Research publications, industry projects, and department KPI evidence.", image: arcImage },
];

const faqItems = [
  { question: "Who can use ASTU-AMS?", answer: "Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services." },
  { question: "How are tracer studies used?", answer: "Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence." },
  { question: "Can employers register events?", answer: "Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports." },
];

const galleryImages = [
  { src: gallery1, title: "ASTU main campus", num: "01" },
  { src: stateM, title: "Innovation and collaboration", num: "02" },
  { src: gc7, title: "Graduation ceremony", num: "03" },
];

const impactStats = [
  {
    id: "stat-1",
    title: "Registered alumni",
    label: "Registered alumni",
    value: "1,258+",
    detail: "Verified against the registrar list",
    trend: "+18% YoY Growth",
    icon: Users,
    action: "View Network",
    target: "/register",
    gradient: "from-blue-600 to-indigo-700",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
  },
  {
    id: "stat-2",
    title: "Fields of study",
    label: "Fields of study",
    value: "5",
    detail: "Engineering and applied sciences",
    trend: "Fields of Study",
    icon: BookOpen,
    action: "Explore Programs",
    target: "/info/overview",
    gradient: "from-emerald-600 to-teal-700",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  {
    id: "stat-3",
    title: "Corporate partners",
    label: "Corporate partners",
    value: "500+",
    detail: "Recruiting on campus",
    trend: "Corporate Link",
    icon: Building2,
    action: "Meet Partners",
    target: "/info/featured-employers",
    gradient: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
  },
  {
    id: "stat-4",
    title: "Employed within 12 months",
    label: "Employed within 12 months",
    value: "89%",
    detail: "Longitudinal tracer survey",
    trend: "Verified Placement",
    icon: Trophy,
    action: "View Impact Data",
    target: "/info/impact-numbers",
    gradient: "from-astu-red to-rose-700",
    badgeBg: "bg-rose-50 text-astu-red border-rose-200/80",
  },
];

const parseNoticeDate = (dateStr?: string) => {
  if (!dateStr) return { day: "09", month: "SEP" };
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    return { day, month };
  }
  const match = dateStr.match(/(\d{1,2})\s*([A-Za-z]{3})/);
  if (match) {
    return { day: match[1].padStart(2, "0"), month: match[2].toUpperCase() };
  }
  return { day: "09", month: "SEP" };
};

export default function HomePage() {
  const navigate = useNavigate();
  const { metrics } = usePublicMetrics();

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
    return events;
  });
  const [liveWorkshops, setLiveWorkshops] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.workshops?.length) {
      const active = cmsConfig.workshops.filter((w: any) => w.active);
      if (active.length) return active;
    }
    return workshops;
  });
  const [liveNews, setLiveNews] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.newsItems?.length) {
      const active = cmsConfig.newsItems.filter((n: any) => n.active);
      if (active.length) return active;
    }
    const published = contentService.getPublishedNews();
    return published.length ? published : [
      {
        id: "news-1",
        title: "ASTU Engineering Innovation Summit 2026",
        date: "28 May 2026",
        excerpt: "Showcasing cutting-edge technology and student research projects across engineering departments.",
        category: "NEWS",
        readTime: "3 min read",
      },
      {
        id: "news-2",
        title: "New Sustainable Energy Research Lab Inaugurated",
        date: "25 May 2026",
        excerpt: "State-of-the-art facility expands applied research opportunities for alumni researchers and graduate teams.",
        category: "NEWS",
        readTime: "4 min read",
      },
      {
        id: "news-3",
        title: "ASTU Alumni Association Launches Global Mentorship Track",
        date: "20 May 2026",
        excerpt: "Connecting senior engineering alumni with graduating seniors across East Africa and international tech hubs.",
        category: "NEWS",
        readTime: "2 min read",
      }
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
    return announcements;
  });
  const [liveStories, setLiveStories] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.stories?.length) {
      const active = cmsConfig.stories.filter((s: any) => s.active);
      if (active.length) return active;
    }
    return storiesService.getStories();
  });
  const [liveSlides, setLiveSlides] = useState<any[]>(() => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.heroSlides?.length) {
      const active = cmsConfig.heroSlides.filter((s: any) => s.active);
      if (active.length) return active;
    }
    return [
      {
        id: "HS-1",
        image: gallery1,
        tagline: "Quality Assurance & Accreditation",
        title: "Connecting ASTU's Excellence to the Global Industry",
        description: "A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University. Join 1,238+ alumni already connected.",
        active: true,
      },
      {
        id: "HS-2",
        image: gallery2,
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
      }
    ];
  });
  const [liveStats, setLiveStats] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.impactStats?.length) {
      const active = config.impactStats.filter((s: any) => s.active);
      if (active.length) return active;
    }
    return impactStats;
  });

  // Dynamic impact stats calculated live from backend database
  const dynamicStats = useMemo(() => {
    return liveStats.map((stat: any) => {
      const lower = (stat.label || stat.title || '').toLowerCase();
      if (stat.id === 'stat-1' || stat.id === 'IS-1' || lower.includes('alumni')) {
        return { ...stat, value: metrics.registeredAlumniFormatted };
      }
      if (stat.id === 'stat-2' || stat.id === 'IS-2' || lower.includes('study') || lower.includes('field') || lower.includes('facult')) {
        return { ...stat, value: String(metrics.fieldsOfStudy) };
      }
      if (stat.id === 'stat-3' || stat.id === 'IS-3' || lower.includes('partner') || lower.includes('employer')) {
        return { ...stat, value: metrics.corporatePartnersFormatted };
      }
      if (stat.id === 'stat-4' || stat.id === 'IS-4' || lower.includes('impact') || lower.includes('rate') || lower.includes('employment')) {
        return { ...stat, value: metrics.employmentRateFormatted };
      }
      return stat;
    });
  }, [liveStats, metrics]);

  const dynamicCommunityStats = useMemo(() => [
    { value: metrics.registeredAlumniFormatted, label: 'Alumni Members' },
    { value: String(metrics.fieldsOfStudy), label: 'Fields of Study' },
    { value: metrics.corporatePartnersFormatted, label: 'Global Partners' },
  ], [metrics]);
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
    return campusLifeCards;
  });
  const [liveCampuses, setLiveCampuses] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.campuses?.length) {
      const active = config.campuses.filter((c: any) => c.active);
      if (active.length) return active;
    }
    return campuses;
  });
  const [liveGallery, setLiveGallery] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.gallery?.length) {
      const active = config.gallery.filter((g: any) => g.active);
      if (active.length) return active;
    }
    return galleryImages;
  });
  const [liveGallerySection, setLiveGallerySection] = useState<GalleryPageSettings>(() => {
    return gallerySettingsService.getSettings();
  });
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
    return partners;
  });
  const [liveFaq, setLiveFaq] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.faq?.length) {
      const active = config.faq.filter((f: any) => f.active);
      if (active.length) return active;
    }
    return faqItems;
  });
  const [liveFeaturedEmployers, setLiveFeaturedEmployers] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.featuredEmployers?.length) {
      const active = config.featuredEmployers.filter((e: any) => e.active);
      if (active.length) return active;
    }
    return featuredEmployers;
  });
  const [liveNavSections, setLiveNavSections] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.navSections?.length) {
      const active = config.navSections.filter((n: any) => n.active);
      if (active.length) return active;
    }
    return navSections;
  });
  const [liveCommunityPosts, setLiveCommunityPosts] = useState<any[]>(() => {
    const config = homepageCmsService.getSettings();
    if (config?.communityPosts?.length) {
      const active = config.communityPosts.filter((p: any) => p.active);
      if (active.length) return active;
    }
    return communityPosts;
  });

  const [liveCommunitySection, setLiveCommunitySection] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return config?.liveCommunitySection || {
      title: 'ASTU Alumni Community',
      subtitle: 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates making a difference worldwide.',
      stats: [
        { value: '1,238+', label: 'Alumni Members' },
        { value: '5', label: 'Fields of Study' },
        { value: '500+', label: 'Global Partners' },
      ],
    };
  });


  const [liveIndustryBridge, setLiveIndustryBridge] = useState<any>(() => {
    const config = homepageCmsService.getSettings();
    return config?.industryBridge || {
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
      image: arcImage,
    };
  });
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
      title: "Life at ASTU",
      description: "A public gateway to institutional experiences across ASTU: research facilities, alumni reunions, career expos, campus innovations, and heritage galleries.",
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
      image1: arcImage,
      image2: electricLabs,
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
  const [liveSectionLinks, setLiveSectionLinks] = useState<typeof defaultSectionLinks>(() => {
    const cfg = homepageCmsService.getSettings();
    return cfg?.sectionLinks ? { ...defaultSectionLinks, ...cfg.sectionLinks } : defaultSectionLinks;
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
      } catch { }
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
    } catch { }

    const updated = [...registeredTitles, rsvpModalItem.title];
    setRegisteredTitles(updated);
    localStorage.setItem('astu_user_registered_events', JSON.stringify(updated));

    toast.success(`Registration Confirmed for "${rsvpModalItem.title}"! Ticket emailed to ${rsvpEmail}.`);
    setConfirmedQrPass(`ASTU-PASS-${Date.now()}-${rsvpName.replace(/\s+/g, '-')}`);
  };

  useEffect(() => {
    let isMounted = true;

    // Helper: apply a loaded CMS config object to all homepage state slices
    const applyCmsConfig = (cmsConfig: any) => {
      if (!cmsConfig || !isMounted) return;
      if (cmsConfig.heroBadge) setLiveHeroBadge(cmsConfig.heroBadge);
      if (cmsConfig.heroButtons) setLiveHeroButtons(cmsConfig.heroButtons);
      if (cmsConfig.impactHeaders) setLiveImpactHeaders(cmsConfig.impactHeaders);
      if (cmsConfig.portalsHeaders) setLivePortalsHeaders(cmsConfig.portalsHeaders);
      if (cmsConfig.campusLifeHeaders) setLiveCampusLifeHeaders(cmsConfig.campusLifeHeaders);
      if (cmsConfig.eventsHeaders) setLiveEventsHeaders(cmsConfig.eventsHeaders);
      if (cmsConfig.announcementsHeaders) setLiveAnnouncementsHeaders(cmsConfig.announcementsHeaders);
      if (cmsConfig.partnersHeaders) setLivePartnersHeaders(cmsConfig.partnersHeaders);
      if (cmsConfig.faqHeaders) setLiveFaqHeaders(cmsConfig.faqHeaders);
      if (cmsConfig.accreditation) setLiveAccreditation(cmsConfig.accreditation);
      if (cmsConfig.ctaSection) setLiveCtaSection(cmsConfig.ctaSection);
      if (cmsConfig.footer) setLiveFooter(cmsConfig.footer);
      if (cmsConfig.sectionLinks) setLiveSectionLinks((prev) => ({ ...prev, ...cmsConfig.sectionLinks }));

      if (cmsConfig.heroSlides?.length) {
        const active = cmsConfig.heroSlides.filter((s: any) => s.active !== false);
        if (active.length) setLiveSlides(active);
      }
      if (cmsConfig.impactStats?.length) {
        const active = cmsConfig.impactStats.filter((s: any) => s.active !== false);
        if (active.length) setLiveStats(active);
      }
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
      if (cmsConfig.gallerySection) {
        setLiveGallerySection((prev: any) => ({
          ...prev,
          homeEyebrow: cmsConfig.gallerySection.eyebrow || prev?.homeEyebrow,
          homeTitle: cmsConfig.gallerySection.title || prev?.homeTitle,
          homeSubtitle: cmsConfig.gallerySection.subtitle || prev?.homeSubtitle,
          homeButtonText: cmsConfig.gallerySection.buttonText || prev?.homeButtonText,
          homeButtonLink: cmsConfig.gallerySection.buttonLink || prev?.homeButtonLink,
        }));
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
        if (active.length) setLiveStories(active);
      }
      if (cmsConfig.partners?.length) {
        const active = cmsConfig.partners.filter((p: any) => p.active !== false);
        if (active.length) setLivePartners(active);
      }
      if (cmsConfig.faq?.length) {
        const active = cmsConfig.faq.filter((f: any) => f.active !== false);
        if (active.length) setLiveFaq(active);
      }
    };

    const syncContent = async () => {
      // 1. Apply localStorage snapshot immediately for instant render (no flash)
      const localConfig = homepageCmsService.getSettings();
      applyCmsConfig(localConfig);
      if (isMounted) setLiveGallerySection(gallerySettingsService.getSettings());

      const publishedNews = contentService.getPublishedNews();
      if (publishedNews.length && isMounted) setLiveNews(publishedNews.slice(0, 3));
      const publishedAnnounce = contentService.getPublishedAnnouncements();
      if (publishedAnnounce.length && isMounted) setLiveAnnouncements(publishedAnnounce.slice(0, 3));
      if (isMounted) setLiveStories(storiesService.getStories().slice(0, 3));

      // 2. Fetch live data from backend API — drives real CMS→Homepage integration
      try {
        const [apiConfig, apiItems] = await Promise.all([
          homepageCmsService.fetchFromApi(),
          contentService.fetchItemsFromApi(),
        ]);

        // Apply live API config (overrides localStorage snapshot)
        if (isMounted) {
          applyCmsConfig(apiConfig);
          const updatedNews = contentService.getPublishedNews();
          if (updatedNews.length) setLiveNews(updatedNews.slice(0, 3));
          const updatedAnnouncements = contentService.getPublishedAnnouncements();
          if (updatedAnnouncements.length) setLiveAnnouncements(updatedAnnouncements.slice(0, 3));
        }
      } catch {
        // Silently fall back to localStorage data already applied above
      }


      // Sync Events & Workshops from CMS admin via API
      try {
        let fetchedEvents: any[] = [];
        let fetchedWorkshops: any[] = [];
        const cmsConfig = await homepageCmsService.fetchFromApi();
        const events = (cmsConfig?.events || []).filter((e: any) => e.active !== false);
        const workshops = (cmsConfig?.workshops || []).filter((w: any) => w.active !== false);

        const allPosts = [
          ...events.map((e: any) => ({ ...e, kind: e.kind || 'Event' })),
          ...workshops.map((w: any) => ({ ...w, kind: w.kind || 'Workshop' })),
        ].sort((a: any, b: any) => {
          const pinnedScore = Number(!!b.pinned) - Number(!!a.pinned);
          if (pinnedScore !== 0) return pinnedScore;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        const openPosts = allPosts.filter((e: any) => (e.status === 'Open' || !e.status) && e.active !== false);

        fetchedEvents = openPosts.slice(0, 3).map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          location: e.location,
          image: e.image || '/images/astu-building.jpg',
          description: e.description,
          kind: e.kind,
          category: e.category || e.focus,
          organizer: e.organizer,
          capacity: e.capacity,
          registrationInfo: e.registrationInfo,
          highlights: e.highlights,
          pinned: e.pinned,
        }));

        fetchedWorkshops = openPosts
          .filter((e: any) => e.kind === 'Workshop')
          .slice(0, 3)
          .map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            seats: e.seats || `${e.rsvps || 0} Seats Registered`,
            focus: e.focus || e.category || 'Professional Development',
            location: e.location,
            image: e.image || '/images/astu-building.jpg',
            description: e.description,
            kind: e.kind,
            organizer: e.organizer,
            capacity: e.capacity,
            registrationInfo: e.registrationInfo,
            highlights: e.highlights,
            pinned: e.pinned,
          }));

        if (isMounted) {
          setLiveEvents(fetchedEvents);
          setLiveWorkshops(fetchedWorkshops);
        }
      } catch (err) {
        if (isMounted) {
          setLiveEvents([]);
          setLiveWorkshops([]);
        }
      }
    };

    let debounceTimer: any = null;
    const debouncedSync = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (isMounted) syncContent();
      }, 300);
    };

    syncContent();
    window.addEventListener('astu-cms-content-changed', debouncedSync);
    window.addEventListener('astu-cms-events-changed', debouncedSync);
    window.addEventListener('astu-cms-homepage-updated', debouncedSync);
    window.addEventListener('astu-cms-gallery-changed', debouncedSync);
    window.addEventListener('astu-cms-gallery-settings-changed', debouncedSync);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
      window.removeEventListener('astu-cms-content-changed', debouncedSync);
      window.removeEventListener('astu-cms-events-changed', debouncedSync);
      window.removeEventListener('astu-cms-homepage-updated', debouncedSync);
      window.removeEventListener('astu-cms-gallery-changed', debouncedSync);
      window.removeEventListener('astu-cms-gallery-settings-changed', debouncedSync);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (liveSlides.length || 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [liveSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (liveSlides.length || 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (liveSlides.length || 1)) % (liveSlides.length || 1));
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
    const target = event.currentTarget;
    target.onerror = null;
    if (!target.src.includes('fallback-campus.svg') && !target.src.includes('astu-building.jpg')) {
      target.src = FALLBACK_IMAGE;
    } else {
      target.src = '/images/astu-building.jpg';
    }
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

    liveNavSections.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) {
        sectionObserver.observe(node);
      }
    });

    return () => sectionObserver.disconnect();
  }, []);

  // Sync liveCommunitySection from CMS
  useEffect(() => {
    const config = homepageCmsService.getSettings();
    if (config?.liveCommunitySection) {
      setLiveCommunitySection(config.liveCommunitySection);
    }
  }, []);

  // Section 3: Parse dates for event card header e.g. "20", "NOV", "2026"
  const parseEventDate = (dateStr?: string) => {
    if (!dateStr) return { day: "20", month: "NOV", year: "2026" };
    const str = dateStr.trim();
    const match = str.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (match) {
      return {
        day: match[1].padStart(2, "0"),
        month: match[2].substring(0, 3).toUpperCase(),
        year: match[3],
      };
    }
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const day = d.getDate().toString().padStart(2, "0");
        const month = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d).toUpperCase();
        const year = d.getFullYear().toString();
        return { day, month, year };
      }
    } catch { }
    return { day: "20", month: "NOV", year: "2026" };
  };

  const defaultMockEvents = useMemo(() => [
    {
      id: "data-science-bootcamp",
      title: "Data Science Bootcamp",
      date: "20 Nov 2026",
      category: "TECHNICAL TRAINING",
      location: "Engineering Building, Room 305",
      description: "Intensive bootcamp covering machine learning, data visualization, and statistical analysis using Python and R.",
    },
    {
      id: "alumni-networking-mixer",
      title: "Alumni Networking Mixer",
      date: "05 Dec 2026",
      category: "NETWORKING",
      location: "ASTU Conference Hall",
      description: "Networking event for ASTU alumni across all graduation years. Connect with fellow graduates and share experiences.",
    },
    {
      id: "career-fair",
      title: "Career Fair",
      date: "15 Jan 2027",
      category: "CAREER",
      location: "ASTU Sports Complex",
      description: "Annual career fair featuring top employers from Ethiopia and East Africa. On-site interviews and networking opportunities.",
    },
  ], []);

  const displayedEventsList = useMemo(() => {
    let list: any[] = [];
    if (liveEvents && liveEvents.length >= 3) {
      list = liveEvents;
    } else if (liveEvents && liveEvents.length > 0) {
      list = [...liveEvents, ...defaultMockEvents];
    } else {
      list = defaultMockEvents;
    }

    // Sort upcoming events chronologically (earliest upcoming date first)
    const sorted = [...list].sort((a: any, b: any) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return timeA - timeB;
    });

    return sorted.slice(0, 3);
  }, [liveEvents, defaultMockEvents]);

  // Top 3 campus life items for the homepage with fallback images and links
  const displayCampusLife = useMemo(() => {
    const list = liveCampusLife && liveCampusLife.length > 0 ? liveCampusLife : campusLifeCards;
    return list.slice(0, 3).map((item: any, idx: number) => {
      const fallbackImages = [gc7, electricLabs, arcImage];
      const fallbackEyebrows = ["EVENTS & ACTIVITIES", "FACILITIES", "MUSEUMS & GALLERY"];
      const fallbackTitles = [
        "Reunions, career expos, and workshops",
        "Facilities & Innovation Spaces",
        "Museums and campus gallery",
      ];
      const fallbackDescriptions = [
        "Chapter meetings, leadership workshops, career expos, and community programs that keep graduates connected to the university.",
        "Laboratories, research centers, libraries, student services, and employer interview rooms across campuses.",
        "Research showcases, graduation moments, campus photography, and historical exhibition collections.",
      ];
      const fallbackActions = ["View events", "Explore facilities", "View gallery"];
      const fallbackLinks = ["/events", "/info/facilities", "/gallery"];

      return {
        id: item.id || `campus-life-${idx}`,
        title: item.title || fallbackTitles[idx % fallbackTitles.length],
        eyebrow: item.campus || fallbackEyebrows[idx % fallbackEyebrows.length],
        description: item.description || fallbackDescriptions[idx % fallbackDescriptions.length],
        image: item.image || fallbackImages[idx % fallbackImages.length],
        action: item.action || fallbackActions[idx % fallbackActions.length],
        link: item.link || fallbackLinks[idx % fallbackLinks.length],
      };
    });
  }, [liveCampusLife]);

  const campusLifeDescription = useMemo(() => {
    const raw = liveCampusLifeHeaders?.description;
    if (!raw || raw.includes("AAU")) {
      return "A public gateway to institutional experiences across ASTU: research facilities, alumni reunions, career expos, campus innovations, and heritage galleries.";
    }
    return raw;
  }, [liveCampusLifeHeaders?.description]);

  // Removed redundant header listeners (now handled natively inside Navbar component)

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <div className="fixed top-0 left-0 z-[60] w-full h-0.5 bg-slate-800/20">
        <div
          className="h-full bg-gradient-to-r from-astu-green via-astu-navy to-astu-red transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main id="home">
        {/* Live Top Announcement Ticker */}
        {liveWelcomeEnabled !== false && liveWelcomeMessage && (
          <aside aria-label="Announcement Banner" className="relative z-30 bg-[#003580] border-b border-white/10 text-white py-2.5 px-4 shadow-xs">
            <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="shrink-0 inline-flex items-center gap-1.5 rounded bg-[#C8102E] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Bell className="h-3 w-3" /> Announcement
                </span>
                <span className="truncate font-medium text-slate-200">{liveWelcomeMessage}</span>
              </div>
              <button
                onClick={() => navigate(liveSectionLinks.tickerLinkTarget)}
                className="shrink-0 text-xs font-semibold text-white hover:text-slate-200 underline underline-offset-4 inline-flex items-center gap-1 cursor-pointer"
              >
                {liveSectionLinks.tickerLinkText} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </aside>
        )}

        {/* ── HERO SLIDER SECTION ── */}
        <section className="relative overflow-hidden min-h-[580px] md:h-[620px] lg:h-[700px] bg-slate-950 flex items-center">
          {/* Background Slides */}
          <div className="absolute inset-0 w-full h-full">
            {liveSlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                <img
                  alt={slide.title}
                  className="h-full w-full object-cover object-[center_35%]"
                  src={slide.image}
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#001d4a]/95 via-[#002b6b]/85 to-[#003580]/60" />
              </div>
            ))}
          </div>

          {/* Hero Content */}
          <div className="relative z-20 mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="max-w-2xl">
              <div className="flex items-center mb-3">
                <span className="text-[#E05368] font-bold mr-2 text-sm select-none">—</span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#E05368]">
                  {(liveSlides[currentSlide] || liveSlides[0])?.tagline || liveHeroBadge}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.14] text-white tracking-tight">
                {(liveSlides[currentSlide] || liveSlides[0])?.title}
              </h1>

              <p className="mt-4 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-200">
                {(liveSlides[currentSlide] || liveSlides[0])?.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8102E] hover:bg-[#A60D26] px-6 h-12 text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md cursor-pointer"
                  onClick={() => navigate(liveHeroButtons?.primaryLink || "/info/alumni-portal")}
                >
                  <span>{liveHeroButtons?.primaryText || "Alumni Portal"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 hover:bg-white/20 px-6 h-12 text-sm font-semibold text-white transition-all backdrop-blur-xs cursor-pointer"
                  onClick={() => navigate(liveHeroButtons?.secondaryLink || "/info/employer-portal")}
                >
                  <Handshake className="h-4 w-4 text-slate-300" />
                  <span>{liveHeroButtons?.secondaryText || "Employer Partnership"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Slide Navigation Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-slate-900/80 transition-all backdrop-blur-xs hidden sm:block cursor-pointer"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-35 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white hover:bg-slate-900/80 transition-all backdrop-blur-xs hidden sm:block cursor-pointer"
            aria-label="Next slide"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Slide Indicator Counter at Bottom */}
          <div className="absolute bottom-6 right-6 sm:right-12 z-35 flex items-center gap-3 bg-slate-900/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
            <span className="font-mono text-xs font-bold text-white">
              {String(currentSlide + 1).padStart(2, '0')} / {String(liveSlides.length).padStart(2, '0')}
            </span>
            <div className="flex gap-1.5">
              {liveSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-5 bg-[#C8102E]" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION: ASTU Impact at a Glance (Architectural Metric Bar) ── */}
        <section id="impact-numbers" className="scroll-mt-24 w-full bg-white border-y border-slate-200/80 py-8 sm:py-10 lg:py-12 relative">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              {dynamicStats.slice(0, 4).map((stat, idx) => {
                const targetUrl = stat.target || stat.link || liveSectionLinks.impactDefaultLinkTarget;
                const valStr = String(stat.value || '').trim();
                const suffStr = stat.suffix && !valStr.endsWith(stat.suffix.trim()) ? stat.suffix.trim() : '';
                const displayValue = `${valStr}${suffStr}`;

                return (
                  <div
                    key={stat.id || idx}
                    onClick={() => navigate(targetUrl)}
                    className="p-5 sm:p-6 lg:px-8 flex flex-col justify-start group cursor-pointer hover:bg-slate-50/70 transition-colors duration-200"
                  >
                    <div className="font-fraunces text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#003580] group-hover:text-[#C8102E] tracking-tight leading-none transition-colors duration-200">
                      {displayValue}
                    </div>
                    <div className="mt-3 text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#003580] transition-colors duration-200">
                      {stat.label}
                    </div>
                    <div className="mt-1 text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
                      {stat.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION: How ASTU-AMS Works (The 4-Step Connected Journey) ── */}
        <section id="how-it-works" className="scroll-mt-24 w-full bg-gradient-to-b from-[#F8FAFC] via-[#F4F8FD]/50 to-[#F8FAFC] text-slate-900 border-b border-slate-200/80 py-12 lg:py-16 relative overflow-hidden">
          {/* Subtle architectural precision dot grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#003580_0.75px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header: Centered Clean Title & Subtitle with tight, balanced spacing */}
            <div className="mb-10 text-center max-w-xl mx-auto">
              <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.015em] leading-tight">
                {livePortalsHeaders?.title || "How ASTU-AMS Works"}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                {livePortalsHeaders?.description || "Your path from verified graduate to global leader in four connected stages."}
              </p>
            </div>

            {/* 4 Connected Stages with continuous timeline */}
            <div className="relative">
              {/* Horizontal Connecting Timeline Line across top (Desktop) */}
              <div
                aria-hidden="true"
                className="hidden lg:block absolute top-[6px] left-[32px] right-[32px] h-[2px] bg-slate-200 pointer-events-none z-0"
              >
                <div className="h-full w-full bg-gradient-to-r from-[#003580] via-emerald-500 to-[#003580]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 relative z-10">
                {[
                  {
                    step: '01',
                    title: 'Create Your Profile',
                    linkText: 'Start Profile',
                    route: '/register',
                  },
                  {
                    step: '02',
                    title: 'Discover Opportunities',
                    linkText: 'Explore Opportunities',
                    route: '/info/employer-portal',
                  },
                  {
                    step: '03',
                    title: 'Connect & Network',
                    linkText: 'Join Network',
                    route: '/login',
                  },
                  {
                    step: '04',
                    title: 'Grow & Give Back',
                    linkText: 'Take Tracer Survey',
                    route: '/info/alumni-portal',
                  },
                ].map((item, idx) => {
                  const portal = livePortals[idx] || {};
                  const title = portal.title || item.title;
                  const cta = portal.cta || item.linkText;
                  const route = portal.route || item.route;

                  return (
                    <div
                      key={item.step}
                      onClick={() => navigate(route)}
                      className="group cursor-pointer flex flex-col justify-start"
                    >
                      {/* Node dot on the timeline */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 ring-4 ring-emerald-50 shadow-2xs group-hover:scale-125 group-hover:border-[#003580] group-hover:ring-blue-100 transition-all duration-300 shrink-0" />
                        <span className="lg:hidden h-[2px] flex-1 bg-gradient-to-r from-emerald-500 to-slate-200" />
                      </div>

                      {/* Step Number */}
                      <span className="font-mono text-xs font-bold text-emerald-600 tracking-widest uppercase">
                        {item.step}
                      </span>

                      {/* Heading */}
                      <h3 className="font-fraunces text-xl sm:text-[22px] font-bold text-slate-900 group-hover:text-[#003580] transition-colors mt-2 leading-snug">
                        {title}
                      </h3>

                      {/* Action Link */}
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#003580] group-hover:text-[#C8102E] transition-colors">
                        <span>{cta}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clean Centered Get Started Button at the Middle */}
            <div className="mt-12 sm:mt-14 text-center">
              <button
                type="button"
                onClick={() => navigate(livePortalsHeaders?.ctaLink || "/register")}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#003580] hover:bg-[#C8102E] text-white font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
              >
                <span>{livePortalsHeaders?.ctaText || "Get Started"}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION: Campus Life & Moments Gallery (Modern Clean Editorial Layout) ── */}
        <section id="campus-life" className="scroll-mt-24 w-full bg-white py-16 sm:py-20 md:py-24 border-t border-slate-200/80">
          <div id="gallery" className="scroll-mt-24" />
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            {/* Header: Left Title, Right "View the gallery →" */}
            <div className="mb-8 sm:mb-10 flex items-center justify-between">
              <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#003580] tracking-[-0.015em]">
                {liveCampusLifeHeaders?.title || "Campus life"}
              </h2>
              <button
                type="button"
                onClick={() => navigate(liveGallerySection?.homeButtonLink || "/gallery")}
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#003580] transition-colors cursor-pointer"
              >
                <span>View the gallery</span>
                <span className="text-emerald-600 font-bold transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>

            {/* 3 Straight Editorial Cards with Asymmetric Center Hero (20-25% taller) */}
            {(() => {
              const galleryItems = [
                {
                  id: "G-1",
                  title: "Main campus, Block B",
                  subtitle: "BLOCK B · OCT 2026",
                  img: humanitarianBuilding || "/images/humanitary building.jpg",
                  alt: "ASTU Main campus, Block B",
                  aspectClass: "aspect-[4/5]",
                  cardClass: "group cursor-pointer flex flex-col",
                },
                {
                  id: "G-2",
                  title: "Graduation ceremony",
                  subtitle: "MAIN AUDITORIUM · JUL 2026",
                  img: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80",
                  fallbackImg: gc7,
                  alt: "ASTU Graduation ceremony",
                  aspectClass: "aspect-[2/3]",
                  cardClass: "group cursor-pointer flex flex-col md:-mt-8 lg:-mt-10 z-10",
                },
                {
                  id: "G-3",
                  title: "Innovation and collaboration",
                  subtitle: "CSE LAB 3 · SEP 2026",
                  img: electricLabs || "/images/electriclabs.jpeg",
                  alt: "ASTU Innovation and collaboration",
                  aspectClass: "aspect-[4/5]",
                  cardClass: "group cursor-pointer flex flex-col",
                },
              ];

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start pt-2 md:pt-6">
                  {galleryItems.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => navigate("/gallery")}
                      className={item.cardClass}
                    >
                      {/* Full-bleed Photo Container with Controlled Aspect Ratio and Square Corners */}
                      <div className={`w-full ${item.aspectClass} overflow-hidden bg-slate-100 rounded-none shadow-2xs`}>
                        <img
                          src={item.img}
                          alt={item.alt}
                          className="w-full h-full object-cover rounded-none group-hover:scale-103 transition-transform duration-500 ease-out"
                          onError={(e) => {
                            if (item.fallbackImg && e.currentTarget.src !== item.fallbackImg) {
                              e.currentTarget.src = item.fallbackImg;
                            } else {
                              handleImageError(e);
                            }
                          }}
                        />
                      </div>

                      {/* Clean Square White Card Label Directly Underneath */}
                      <div className="bg-white p-3.5 sm:p-4 border border-slate-100 shadow-2xs text-left rounded-none">
                        <h3 className="font-fraunces text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#003580] transition-colors leading-snug">
                          {item.title}
                        </h3>
                        <p className="font-mono text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── SECTION 3: Upcoming alumni events ── */}
        <section id="events" className="scroll-mt-24 w-full bg-[#F8FAFC] py-16 md:py-24 relative overflow-hidden border-t border-slate-200/70">
          {/* Soft architectural campus background image (gentle and comfortable for the eyes) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <img
              src={gallery1}
              alt=""
              className="w-full h-full object-cover opacity-[0.045] filter saturate-0 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-transparent to-[#F8FAFC]" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[100px]" />
          </div>

          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header: Left title & subtitle, Right 'View all events' pill */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-[2px] bg-[#C8102E]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E]">
                    {liveEventsHeaders?.eyebrow || "EVENTS & WORKSHOPS"}
                  </span>
                </div>
                <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#003580] tracking-tight leading-tight">
                  {liveEventsHeaders?.title || "Upcoming alumni events"}
                </h2>
                <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  {liveEventsHeaders?.description || "Professional development, networking, and industry connection sessions open to ASTU alumni and students."}
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/events")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 hover:border-[#003580] bg-white hover:bg-[#003580] text-[#003580] hover:text-white transition-all duration-200 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer group"
                >
                  <span>View all events</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            {/* 3-column White Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {displayedEventsList.map((event: any, idx: number) => {
                const dateParts = parseEventDate(event.date);
                const isRegistered = registeredTitles.includes(event.title);

                return (
                  <article
                    key={event.id || event.title + idx}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      navigate(
                        event.link && event.link.startsWith("/events/")
                          ? event.link
                          : `/events/${event.id || event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                        { state: { event } }
                      );
                    }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white text-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer border border-slate-200/90 hover:border-[#003580]/40"
                  >
                    {/* Subtle top indicator on card hover */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#003580] via-[#C8102E] to-[#003580] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div>
                      {/* Top Date & Category Header Panel */}
                      <div className="bg-[#F8FAFC] px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-3xl sm:text-[36px] font-black text-[#003580] leading-none tracking-tight">
                            {dateParts.day}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#C8102E] leading-none">
                              {dateParts.month}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 leading-none mt-1">
                              {dateParts.year}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#003580]" />
                          <span>{event.category || event.kind || "Event"}</span>
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif text-xl sm:text-[22px] font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors duration-200 leading-snug line-clamp-2">
                            {event.title}
                          </h3>

                          {event.location && (
                            <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                              <MapPin className="h-3.5 w-3.5 text-[#C8102E] shrink-0" aria-hidden="true" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          {event.description && (
                            <p className="mt-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 pb-6 pt-2 shrink-0">
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        {isRegistered ? (
                          <span
                            aria-live="polite"
                            className="h-10 px-4 rounded-xl border border-emerald-500/80 bg-emerald-50/60 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1.5 select-none shadow-2xs"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegisterClick({
                                title: event.title,
                                kind: "Event",
                                date: event.date,
                                location: event.location,
                                id: event.id || event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                              });
                            }}
                            className="h-10 px-5 rounded-xl bg-[#003580] hover:bg-[#C8102E] text-white text-xs font-semibold transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer inline-flex items-center justify-center gap-1.5 group/btn"
                          >
                            <span>Register</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              event.link && event.link.startsWith("/events/")
                                ? event.link
                                : `/events/${event.id || event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                              { state: { event } }
                            );
                          }}
                          className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#003580] transition-colors cursor-pointer group-hover:underline underline-offset-4 flex items-center gap-1"
                        >
                          <span>Details</span>
                          <span className="transition-transform group-hover:translate-x-0.5">→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        {/* ── SECTION 4: Official notices ── */}
        <section id="announcements" className="scroll-mt-24 w-full bg-white py-16 md:py-24 border-t border-slate-100">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-[2px] bg-[#C8102E]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E]">
                    {liveAnnouncementsHeaders?.eyebrow || "ANNOUNCEMENTS"}
                  </span>
                </div>
                <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#003580] tracking-tight leading-tight">
                  {liveAnnouncementsHeaders?.title || "Official notices"}
                </h2>
                <p className="mt-2.5 text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl">
                  {liveAnnouncementsHeaders?.description || "Institutional updates, academic schedules, partner calls, and university circulars."}
                </p>
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(liveSectionLinks.announcementsViewAllLink || "/announcements")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 hover:border-[#003580] bg-white hover:bg-[#003580] text-[#003580] hover:text-white transition-all text-xs sm:text-sm font-semibold shadow-xs cursor-pointer group"
                >
                  <span>View all notices</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {(liveAnnouncements && liveAnnouncements.length >= 3 ? liveAnnouncements.slice(0, 3) : announcements.slice(0, 3)).map((announcement: any, idx: number) => {
                const { day, month } = announcement.day && announcement.month
                  ? { day: announcement.day, month: announcement.month }
                  : parseNoticeDate(announcement.date || announcement.publishedAt);
                const targetLink = announcement.link || `${liveSectionLinks.announcementItemLinkBase}/${announcement.id || announcement.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

                return (
                  <div
                    key={announcement.id || idx}
                    onClick={() => navigate(targetLink)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(targetLink);
                      }
                    }}
                    className="group relative flex items-center justify-between p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-[#003580]/30 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      {/* Date badge */}
                      <div className="w-12 sm:w-14 shrink-0 text-center sm:text-left">
                        <span className="block text-2xl sm:text-[32px] font-serif font-black text-[#003580] leading-none">
                          {day}
                        </span>
                        <span className="block text-[11px] font-bold text-[#C8102E] tracking-wider uppercase mt-1">
                          {month}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="w-[1px] h-11 bg-slate-200/80 shrink-0 hidden sm:block" />

                      {/* Content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E]" />
                            <span>{announcement.type || "Official announcement"}</span>
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {announcement.year || announcement.date || "2026"}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-serif font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors leading-snug line-clamp-2">
                          {announcement.title}
                        </h3>
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="shrink-0 pl-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 group-hover:bg-[#003580] border border-slate-200/70 group-hover:border-transparent text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-1 shadow-2xs">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 5: Alumni success stories (Editorial Asymmetric Layout) ── */}
        <section id="success-stories" className="scroll-mt-24 w-full bg-white py-16 md:py-20 border-t border-slate-200/80">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-10 sm:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
              <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-[#003580] tracking-[-0.015em]">
                Alumni success stories
              </h2>
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/info/alumni-stories")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 hover:border-[#003580] bg-white hover:bg-[#003580] text-slate-700 hover:text-white transition-all text-xs font-semibold shadow-2xs cursor-pointer group"
                >
                  <span>View all stories</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {(() => {
              const defaultStories = [
                {
                  id: "S-001",
                  name: "Dr. Ruth Alemu",
                  role: "AI Research Scientist",
                  department: "COMPUTER SCIENCE",
                  year: "2018",
                  summary: "18 papers in applied machine learning.",
                  img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
                  link: "/info/alumni-stories",
                },
                {
                  id: "S-002",
                  name: "Yonas Bekele",
                  role: "Founder and CEO, GreenGrid Labs",
                  department: "ELECTRICAL AND POWER ENGINEERING",
                  year: "2016",
                  summary: "Delivers decentralised energy infrastructure to 14 woredas in Oromia.",
                  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
                  link: "/info/alumni-stories",
                },
                {
                  id: "S-003",
                  name: "Kalkidan Tadesse",
                  role: "Cloud Platform Lead",
                  department: "SOFTWARE ENGINEERING",
                  year: "2019",
                  summary: "Moved core services to a cloud platform; deployment now takes minutes.",
                  img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                  link: "/info/alumni-stories",
                },
              ];

              const stories = (liveStories && liveStories.length >= 3)
                ? liveStories.slice(0, 3).map((s: any, idx: number) => ({
                  ...defaultStories[idx],
                  ...s,
                  name: s.name || defaultStories[idx].name,
                  role: s.role || defaultStories[idx].role,
                  department: s.department ? s.department.replace(/&/g, 'AND').toUpperCase() : defaultStories[idx].department,
                  year: s.graduationYear ? s.graduationYear.replace(/class of/i, '').trim() : defaultStories[idx].year,
                  summary: s.shortSummary || s.summary || s.milestone || (s.text ? (s.text.length > 95 ? s.text.slice(0, 95) + '…' : s.text) : defaultStories[idx].summary),
                  img: s.image || s.img || defaultStories[idx].img,
                  link: s.link || `/stories/${s.id || defaultStories[idx].id}`,
                }))
                : defaultStories;

              const story1 = stories[0];
              const story2 = stories[1];
              const story3 = stories[2];

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                  {/* Card 1: Horizontal Side-by-Side */}
                  <article
                    onClick={() => navigate(story1.link || "/info/alumni-stories")}
                    className="border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="border-t-2 border-slate-700/80 pt-2 mb-4">
                        <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                          {story1.department} · {story1.year}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="w-full sm:w-36 h-48 sm:h-52 overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={story1.img}
                            alt={story1.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                            onError={handleImageError}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-fraunces text-xl font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors leading-snug">
                            {story1.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-700 mt-1">
                            {story1.role}
                          </p>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            {story1.summary}
                          </p>
                          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors">
                            <span>Read profile</span>
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Card 2: Stacked (Top Photo, Bottom Info) */}
                  <article
                    onClick={() => navigate(story2.link || "/info/alumni-stories")}
                    className="border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="border-t-2 border-slate-700/80 pt-2 mb-4">
                        <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                          {story2.department} · {story2.year}
                        </span>
                      </div>
                      <div className="w-full h-44 sm:h-48 overflow-hidden bg-slate-100 mb-4">
                        <img
                          src={story2.img}
                          alt={story2.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          onError={handleImageError}
                        />
                      </div>
                      <h3 className="font-fraunces text-xl font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors leading-snug">
                        {story2.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        {story2.role}
                      </p>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {story2.summary}
                      </p>
                    </div>
                    <div className="mt-4 pt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors">
                        <span>Read profile</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>

                  {/* Card 3: Inverted Stacked (Top Info, Bottom Photo) */}
                  <article
                    onClick={() => navigate(story3.link || "/info/alumni-stories")}
                    className="border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="border-t-2 border-slate-700/80 pt-2 mb-4">
                        <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                          {story3.department} · {story3.year}
                        </span>
                      </div>
                      <h3 className="font-fraunces text-xl font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors leading-snug">
                        {story3.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        {story3.role}
                      </p>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {story3.summary}
                      </p>
                      <div className="mt-3 mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors">
                        <span>Read profile</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                    <div className="w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
                      <img
                        src={story3.img}
                        alt={story3.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={handleImageError}
                      />
                    </div>
                  </article>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── Community Section ── */}
        <section
          id="community"
          className="scroll-mt-24 relative py-16 md:py-[104px] overflow-hidden dark-band-grid"
          style={{
            backgroundColor: '#003580',
            backgroundImage: 'radial-gradient(rgba(169, 196, 224, 0.13) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Abstract Blueprint Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:4rem_4rem] pointer-events-none" />

          {/* Abstract Worldwide Coordinate Geometry & Orbital Rings */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center opacity-30">
            <svg
              className="w-full max-w-[1240px] h-full max-h-[660px] overflow-visible"
              viewBox="0 0 1000 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Planetary Horizon & Equatorial Crosshairs */}
              <line x1="80" y1="300" x2="920" y2="300" stroke="rgba(169, 196, 224, 0.35)" strokeWidth="1" strokeDasharray="6 6" />
              <line x1="500" y1="40" x2="500" y2="560" stroke="rgba(169, 196, 224, 0.25)" strokeWidth="1" strokeDasharray="6 6" />

              {/* Concentric Spherical Range Rings (Architectural Radar) */}
              <circle cx="500" cy="300" r="120" stroke="rgba(169, 196, 224, 0.3)" strokeWidth="1" />
              <circle cx="500" cy="300" r="210" stroke="rgba(169, 196, 224, 0.4)" strokeWidth="1.2" />
              <circle cx="500" cy="300" r="310" stroke="rgba(169, 196, 224, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="500" cy="300" r="420" stroke="rgba(169, 196, 224, 0.12)" strokeWidth="1" />
              <circle cx="500" cy="300" r="540" stroke="rgba(169, 196, 224, 0.06)" strokeWidth="1" strokeDasharray="8 8" />

              {/* Abstract Globe Wireframe - Latitude Parallels */}
              <ellipse cx="500" cy="300" rx="210" ry="64" stroke="rgba(169, 196, 224, 0.5)" strokeWidth="1.2" />
              <ellipse cx="500" cy="225" rx="180" ry="44" stroke="rgba(169, 196, 224, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <ellipse cx="500" cy="375" rx="180" ry="44" stroke="rgba(169, 196, 224, 0.25)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Abstract Globe Wireframe - Longitude Meridians */}
              <ellipse cx="500" cy="300" rx="85" ry="210" stroke="rgba(169, 196, 224, 0.4)" strokeWidth="1" />
              <ellipse cx="500" cy="300" rx="160" ry="210" stroke="rgba(169, 196, 224, 0.25)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Tilted Worldwide Orbital Trajectory Rings */}
              <g transform="rotate(-20 500 300)">
                <ellipse cx="500" cy="300" rx="360" ry="110" stroke="rgba(169, 196, 224, 0.35)" strokeWidth="1.2" strokeDasharray="6 4" />
                {/* Discrete Coordinate Pulse Points */}
                <circle cx="140" cy="300" r="3.5" fill="#C8102E" />
                <circle cx="140" cy="300" r="8" stroke="#C8102E" strokeWidth="1" opacity="0.4" />
                <circle cx="860" cy="300" r="3.5" fill="#38bdf8" />
                <circle cx="860" cy="300" r="8" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
              </g>

              {/* Complementary Counter-Orbital Arc */}
              <g transform="rotate(32 500 300)">
                <ellipse cx="500" cy="300" rx="330" ry="95" stroke="rgba(169, 196, 224, 0.2)" strokeWidth="1" strokeDasharray="5 5" />
                <circle cx="830" cy="300" r="3" fill="#38bdf8" opacity="0.6" />
              </g>

              {/* Subtle Coordinate Crosshair Calibration Marks */}
              <g stroke="rgba(169, 196, 224, 0.4)" strokeWidth="1">
                <line x1="495" y1="90" x2="505" y2="90" />
                <line x1="495" y1="510" x2="505" y2="510" />
                <line x1="290" y1="295" x2="290" y2="305" />
                <line x1="710" y1="295" x2="710" y2="305" />
              </g>
            </svg>
          </div>

          {/* Decorative outlined circle shapes in top-right */}
          <div aria-hidden="true" className="absolute -top-16 -right-16 w-96 h-96 pointer-events-none opacity-40">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full border border-white/20" />
            <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full border border-white/15" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8">
            <div className="mb-12 text-center reveal">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200">
                <Globe className="h-3.5 w-3.5" /> {liveCommunitySection?.title || 'ASTU Alumni Community'}
              </span>
              <h2 className="mt-4 font-fraunces text-3xl sm:text-4xl lg:text-[48px] font-bold text-white tracking-[-0.015em] leading-tight">
                Alumni Network <span className="text-blue-200">Around the World</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[17px] text-slate-300 leading-relaxed">
                {liveCommunitySection?.subtitle || 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates making a difference worldwide.'}
              </p>
            </div>

            {/* Community Testimonials */}
            <div id="testimonials" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 scroll-mt-24">
              {liveCommunityPosts.map((post: any, idx: number) => (
                <article
                  key={post.name}
                  className={`reveal reveal-delay-${(idx % 3) + 1} card-soft group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-[0_4px_20px_rgba(0,0,0,0.15)]`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Quote className="h-6 w-6 text-blue-300/60" />
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
                      className="h-12 w-12 rounded-full object-cover border-2 border-blue-300/40 shrink-0 shadow-md bg-white/10"
                      onError={handleImageError}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{post.name}</p>
                      <p className="text-[11px] text-blue-200 font-medium truncate">{post.role}</p>
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
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-md bg-[#C8102E] hover:bg-[#A60D26] text-white font-bold text-sm transition-colors shadow-sm"
              >
                <UserRoundCheck className="h-4 w-4" /> Join ASTU Alumni Network
              </button>
              <button
                onClick={() => navigate('/community')}
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-md border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-colors"
              >
                <Globe className="h-4 w-4" /> Explore Community
              </button>
            </div>
          </div>
        </section>

        {/* ── Partner Logos ── */}
        <section id="partners" className="scroll-mt-24 mx-auto max-w-[1240px] px-4 py-16 md:px-8 md:py-[104px] overflow-hidden bg-gradient-to-b from-[#f8faff] to-white rounded-2xl my-4">
          <div className="mb-10 text-center reveal">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C8102E]">{livePartnersHeaders?.eyebrow || "OUR PARTNERS"}</p>
            <h2 className="mt-2 font-fraunces text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#003580] tracking-[-0.015em] leading-tight">{livePartnersHeaders?.title || "Partner Companies"}</h2>
            <p className="mx-auto mt-3 max-w-xl text-[17px] text-slate-600 leading-relaxed">{livePartnersHeaders?.description || "Institutional partners supporting employability, internships, and research collaboration."}</p>
          </div>
          <div className="relative">
            <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
              {[...livePartners, ...livePartners].map((partner, idx) => {
                const LogoComponent = partnerLogos[partner.name];
                return (
                  <div key={`${partner.name}-${idx}`} className="flex min-w-[160px] flex-col items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-5 card-soft shadow-[0_2px_8px_rgba(0,51,102,0.06)]">
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="h-10 max-w-[140px] object-contain" />
                    ) : LogoComponent ? (
                      <LogoComponent />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#003580] text-white text-sm font-bold shadow-md">
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-[#003580] text-center leading-tight">{partner.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION: News from the alumni community ── */}
        <section id="news" className="scroll-mt-24 w-full bg-white py-16 md:py-[104px] border-t border-slate-100">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            {/* Header: Left Title & Editorial Subtitle, Right Action Pill */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-[2px] bg-[#C8102E] inline-block rounded-full" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E]">
                    LATEST NEWS
                  </span>
                </div>
                <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#003580] tracking-[-0.015em] leading-tight">
                  News from the alumni community
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  Official news coverage, university milestones, and graduate impact stories from across the globe.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/announcements")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 hover:border-[#003580] bg-white hover:bg-[#003580] text-[#003580] hover:text-white transition-all duration-200 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer group"
                >
                  <span>View all news</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            {/* News List */}
            <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
              {liveNews.slice(0, 3).map((item: any, idx: number) => {
                const { day, month } = parseNoticeDate(item.date || item.publishedAt);
                const itemLink = item.link || `/announcements/${item.id || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

                return (
                  <article
                    key={item.id || idx}
                    onClick={() => navigate(itemLink)}
                    className="group flex items-center justify-between py-6 sm:py-7 px-3 sm:px-4 -mx-3 sm:-mx-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50/70"
                  >
                    <div className="flex items-start sm:items-center gap-5 sm:gap-8 min-w-0">
                      {/* Date Badge: Large Navy Day + Red Month */}
                      <div className="w-12 sm:w-16 shrink-0 text-left pt-0.5 sm:pt-0">
                        <span className="block text-2xl sm:text-3xl font-serif font-bold text-[#003580] leading-none">
                          {day}
                        </span>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#C8102E] mt-1">
                          {month}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {item.category || "NEWS"}
                          </span>
                          {item.readTime && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] font-medium text-slate-400">
                                {item.readTime}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors leading-snug truncate sm:whitespace-normal">
                          {item.title}
                        </h3>
                        {(item.excerpt || item.description) && (
                          <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-1 sm:line-clamp-2">
                            {item.excerpt || item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Arrow */}
                    <div className="shrink-0 pl-4 sm:pl-6">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#003580] group-hover:bg-slate-200/50 transition-all">
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="scroll-mt-24 w-full bg-[#F8FAFC] py-16 md:py-[104px] border-t border-slate-200/80">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center reveal">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C8102E]">{liveFaqHeaders?.eyebrow || "FAQ"}</p>
              <h2 className="mt-2 font-fraunces text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#003580] tracking-[-0.015em] leading-tight">{liveFaqHeaders?.title || "Frequently Asked Questions"}</h2>
              <p className="mx-auto mt-3 max-w-xl text-[17px] text-slate-600 leading-relaxed">{liveFaqHeaders?.description || "Common questions about ASTU-AMS, tracer studies, and alumni services."}</p>
            </div>
            <div className="mx-auto max-w-3xl space-y-3">
              {liveFaq.map((item, idx) => (
                <details key={item.id || idx} className={`reveal reveal-delay-${(idx % 3) + 1} card-soft group rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-[#003580] hover:text-[#C8102E] hover:bg-slate-50 transition-colors [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 group-open:text-[#C8102E] transition-all duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        {liveCtaSection?.enabled !== false && (
          <section
            id="cta"
            className="scroll-mt-24 relative py-16 md:py-[104px] text-center overflow-hidden dark-band-grid"
            style={{
              backgroundColor: '#003580',
              backgroundImage: 'radial-gradient(rgba(169, 196, 224, 0.13) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Decorative outlined circle shapes in top-right */}
            <div aria-hidden="true" className="absolute -top-16 -right-16 w-80 h-80 pointer-events-none opacity-40">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full border border-white/20" />
              <div className="absolute -top-8 -right-8 w-80 h-80 rounded-full border border-white/15" />
            </div>
            <div className="max-w-[1240px] mx-auto px-4 reveal relative z-10">
              <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-[48px] font-bold text-white tracking-[-0.015em] leading-tight">
                {liveCtaSection?.title || "Ready to Join ASTU-AMS?"}
              </h2>
              <p className="mt-4 text-[17px] text-slate-200 max-w-2xl mx-auto leading-relaxed">
                {liveCtaSection?.description || "Connect with fellow alumni, discover career opportunities, and contribute to university excellence."}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  className="h-12 px-8 inline-flex items-center justify-center bg-[#C8102E] hover:bg-[#A60D26] text-white font-bold text-sm rounded-md transition-colors shadow-sm cursor-pointer"
                  onClick={() => navigate(liveCtaSection?.primaryCtaLink || "/login")}
                >
                  {liveCtaSection?.primaryCtaText || "Alumni Portal"}
                </button>
                <button
                  className="h-12 px-8 inline-flex items-center justify-center border border-white/40 text-white font-bold text-sm rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(liveCtaSection?.secondaryCtaLink || "/login")}
                >
                  {liveCtaSection?.secondaryCtaText || "Employer Portal"}
                </button>
              </div>
            </div>
          </section>
        )}

      </main>



      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
                <p className="mt-0.5 text-xs text-on-surface-variant">{selectedNotice.date}</p>
              </div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-astu-navy">{selectedNotice.title}</h3>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {selectedNotice.excerpt || selectedNotice.description || selectedNotice.content || "Full official announcement details and documentation from ASTU-AMS Administration."}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-lg border border-outline-variant bg-white px-4 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low"
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
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/10 text-astu-navy">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-astu-navy">Official Notices & Announcements</h3>
                  <p className="text-xs text-on-surface-variant">All public university announcements and official directives.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAllNotices(false);
                  setNoticeSearch('');
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
                className="w-full rounded-lg border border-outline-variant bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-astu-navy outline-none focus:border-astu-navy focus:bg-white"
              />
            </div>

            <div className="mt-4 flex-1 overflow-y-auto divide-y divide-outline-variant pr-1">
              {liveAnnouncements
                .filter(n => !noticeSearch || n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || (n.excerpt && n.excerpt.toLowerCase().includes(noticeSearch.toLowerCase())))
                .map((announcement, idx) => (
                  <button
                    key={announcement.title + idx}
                    onClick={() => {
                      setShowAllNotices(false);
                      setSelectedNotice(announcement);
                    }}
                    className="flex w-full items-start gap-3.5 py-3.5 px-2 text-left hover:bg-surface-container-low/80 rounded-xl transition-all cursor-pointer group"
                  >
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="block text-sm font-semibold text-astu-navy group-hover:text-astu-red transition-colors">{announcement.title}</span>
                        <span className="shrink-0 text-[10px] font-bold text-slate-400">{announcement.date}</span>
                      </div>
                      <span className="mt-1 block text-xs text-on-surface-variant">{announcement.type}</span>
                      {announcement.excerpt && (
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">{announcement.excerpt}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>

            <div className="mt-4 border-t border-outline-variant pt-3 flex justify-end">
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
          <div className="relative max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {!confirmedQrPass ? (
              <>
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <div>
                    <span className="rounded-md bg-astu-navy px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">{rsvpModalItem.kind} Registration</span>
                    <h3 className="mt-1.5 text-lg font-bold text-astu-navy">{rsvpModalItem.title}</h3>
                  </div>
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5 text-xs space-y-1 border border-slate-100">
                  <p className="text-slate-600"><span className="font-semibold text-slate-900">Scheduled Date:</span> {rsvpModalItem.date}</p>
                  {rsvpModalItem.location && <p className="text-slate-600"><span className="font-semibold text-slate-900">Venue / Location:</span> {rsvpModalItem.location}</p>}
                  <p className="text-[10px] text-emerald-600 font-medium pt-1">Free Admission • Instant Entry Ticket Code Issued Upon Submission</p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="e.g. Dr. Abebe Yosef"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        placeholder="e.g. abebe@astu.edu.et"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        value={rsvpPhone}
                        onChange={(e) => setRsvpPhone(e.target.value)}
                        placeholder="e.g. +251 911 234 567"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Participant Status</label>
                      <select
                        value={rsvpRole}
                        onChange={(e) => setRsvpRole(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy bg-white"
                      >
                        <option value="Alumni">ASTU Alumni</option>
                        <option value="Student">Graduating Senior Student</option>
                        <option value="Faculty / Staff">Faculty / University Staff</option>
                        <option value="Employer Partner">Corporate Employer Partner</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Department / Organization</label>
                    <input
                      type="text"
                      value={rsvpAffiliation}
                      onChange={(e) => setRsvpAffiliation(e.target.value)}
                      placeholder="e.g. School of Electrical Engineering & Computing"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Special Accommodations / Dietary Notes (Optional)</label>
                    <input
                      type="text"
                      value={rsvpNotes}
                      onChange={(e) => setRsvpNotes(e.target.value)}
                      placeholder="e.g. Wheelchair access / Vegetarian meal"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button onClick={confirmRsvpRegistration} className="h-10 px-5 rounded-md bg-[#C8102E] hover:bg-[#A60D26] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer">
                    Complete & Confirm RSVP
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Registration Confirmed!</h3>
                  <p className="mt-1 text-xs text-slate-500">{rsvpModalItem.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Participant: {rsvpName} ({rsvpEmail})</p>
                </div>

                <div className="mx-auto w-48 h-48 rounded-xl border-2 border-slate-200 p-3 bg-white flex items-center justify-center shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(confirmedQrPass)}`}
                    alt="Entry Ticket Code"
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="text-[11px] text-slate-400">Digital pass saved! Scan at event entrance for instant QR check-in.</p>

                <button
                  onClick={() => setRsvpModalItem(null)}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Done & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ChatBot />
    </div>
  );
}
