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
  { label: "Workshops", id: "workshops" },
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
  { title: "Events and Activities", campus: "Main Campus", description: "Career expos, alumni reunions, workshops, chapter meetings, and community programs.", image: gallery2, action: "View Events" },
  { title: "Facilities", campus: "Innovation Spaces", description: "Laboratories, research centers, libraries, student services, and employer interview rooms.", image: electricLabs, action: "Explore Facilities" },
  { title: "ASTU Museums & Gallery", campus: "Campus Gallery", description: "Research showcases, graduation moments, campus photography, and public video archives.", image: arcImage, action: "View Gallery" },
];

const announcements = [
  { title: "ASTU Alumni Association Inspires Graduating Class with Career Tips!", date: "March 7, 2025", type: "Alumni Announcement" },
  { title: "ASTU hosts a five-day DAAD Alumni workshop", date: "March 7, 2025", type: "Employer Announcement" },
  { title: "ASTU alumni serve as model United Nations secretariats!", date: "January 7, 2025", type: "Alumni Achievement" },
  { title: "Tracer Study 2026 response window is open", date: "May 31, 2026", type: "Alumni Announcement" },
  { title: "Call for employer partners: campus recruitment week", date: "May 28, 2026", type: "Employer Announcement" },
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
  { src: gallery1, title: "ASTU Main Campus" },
  { src: gallery2, title: "Innovation and Collaboration" },
  { src: gallery3, title: "ASTU Alumni Identity" },
];

const impactStats = [
  {
    id: "stat-1",
    title: "Alumni Network",
    label: "Alumni Network",
    value: "1,238+",
    detail: "Registered graduates across global technology hubs",
    trend: "+18% YoY Growth",
    icon: Users,
    action: "View Network",
    target: "/register",
    gradient: "from-blue-600 to-indigo-700",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
  },
  {
    id: "stat-2",
    title: "Fields of Study",
    label: "Fields of Study",
    value: "5",
    detail: "Engineering, Applied Science, Tech & Research",
    trend: "5 Faculties",
    icon: BookOpen,
    action: "Explore Programs",
    target: "/info/overview",
    gradient: "from-emerald-600 to-teal-700",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  {
    id: "stat-3",
    title: "Partner Employers",
    label: "Partner Employers",
    value: "500+",
    detail: "Hiring, internship placement, and curriculum feedback",
    trend: "Corporate Link",
    icon: Building2,
    action: "Meet Partners",
    target: "/info/featured-employers",
    gradient: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
  },
  {
    id: "stat-4",
    title: "Graduate Impact",
    label: "Graduate Impact",
    value: "94%",
    detail: "Employed or in higher research within 6 months",
    trend: "Verified Placement",
    icon: Trophy,
    action: "View Impact Data",
    target: "/info/impact-numbers",
    gradient: "from-astu-red to-rose-700",
    badgeBg: "bg-rose-50 text-astu-red border-rose-200/80",
  },
];

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
    } catch {}

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
          <aside aria-label="Announcement Banner" className="relative z-30 bg-gradient-to-r from-astu-navy via-[#003366] to-[#002244] border-b border-white/10 text-white py-2 px-4 shadow-sm">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="shrink-0 inline-flex items-center gap-1 rounded bg-astu-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Bell className="h-3 w-3" /> Announcement
                </span>
                <span className="truncate font-medium text-slate-100">{liveWelcomeMessage}</span>
              </div>
              <button
                onClick={() => navigate(liveSectionLinks.tickerLinkTarget)}
                className="shrink-0 text-[11px] font-bold text-[#FFCC00] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                {liveSectionLinks.tickerLinkText} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </aside>
        )}

        <section className="relative overflow-hidden min-h-[700px] md:h-[580px] lg:h-[750px] bg-slate-950">
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <div className="absolute top-20 left-[10%] w-2 h-2 rounded-full bg-astu-green/30" />
            <div className="absolute top-40 left-[30%] w-1.5 h-1.5 rounded-full bg-astu-red/30" />
            <div className="absolute top-60 left-[60%] w-2.5 h-2.5 rounded-full bg-astu-green/20" />
            <div className="absolute top-32 right-[20%] w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="absolute bottom-20 right-[40%] w-2 h-2 rounded-full bg-astu-red/20" />
            <div className="absolute bottom-40 left-[50%] w-1 h-1 rounded-full bg-white/15" />
          </div>
          {/* Background Slides */}
          <div className="absolute inset-0 w-full h-full">
            {liveSlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {/* Background image - zoomed out for clear visibility */}
                <img
                  alt={slide.title}
                  className="h-full w-full object-cover object-[center_30%]"
                  src={slide.image}
                  onError={handleImageError}
                />
                {/* Gentle overlay for rich aesthetic with high photo transparency */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,25,50,0.55),rgba(0,10,25,0.78))]" />
              </div>
            ))}
          </div>

          {/* Compact text - hero is immediately visible below navbar */}
          <div className="relative z-20 mx-auto flex h-full max-w-[1440px] items-center px-4 py-16 md:px-6 lg:py-20">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block rounded-full bg-astu-red px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-md">
                {(liveSlides[currentSlide] || liveSlides[0])?.tagline || liveHeroBadge}
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
                {((liveSlides[currentSlide] || liveSlides[0])?.title || '').includes(" to the ") ? (
                  <>
                    {(liveSlides[currentSlide] || liveSlides[0])?.title.split(" to the ")[0]}
                    <br />
                    to the <span className="text-astu-green">{(liveSlides[currentSlide] || liveSlides[0])?.title.split(" to the ")[1]}</span>
                  </>
                ) : (
                  (liveSlides[currentSlide] || liveSlides[0])?.title
                )}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-100 md:text-base">
                {(liveSlides[currentSlide] || liveSlides[0])?.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-astu-red px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-lg hover:shadow-xl hover:shadow-astu-red/20 hover:scale-105 btn-magnetic"
                  onClick={() => navigate(liveHeroButtons?.primaryLink || "/info/alumni-portal")}
                >
                  {liveHeroButtons?.primaryText || "Alumni Portal"}
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-all hover:scale-105 btn-magnetic backdrop-blur-sm"
                  onClick={() => navigate(liveHeroButtons?.secondaryLink || "/info/employer-portal")}
                >
                  {liveHeroButtons?.secondaryText || "Employer Partnership"}
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
            className="absolute bottom-12 left-1/2 z-40 -translate-x-1/2 text-white hover:translate-y-1 transition-transform"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-8 w-8 md:h-10 md:w-10" style={{ marginTop: "-100px" }} />
          </button>
        </section>

        {/* UNIFIED ASTU IMPACT & JOURNEY ECOSYSTEM SECTION */}
        <section id="how-it-works" className="relative z-20 mx-auto max-w-[1280px] px-4 py-12 md:px-8 md:py-16 my-8">
          {/* Continuous surface container */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-white to-slate-50/60 rounded-3xl -z-10 border border-slate-200/60 shadow-xs" />

          {/* 1. ASTU IMPACT AT A GLANCE - HEADER */}
          {liveImpactHeaders && (
            <div className="text-center reveal">
              <span className="inline-flex items-center gap-2 rounded-full border border-astu-red/20 bg-astu-red/5 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-astu-red shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-astu-red" />
                {liveImpactHeaders.eyebrow || "ASTU IMPACT AT A GLANCE"}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-astu-navy sm:text-4xl">
                {liveImpactHeaders.title || "Connecting Academia to Industry"}
              </h2>
              {liveImpactHeaders.description && (
                <p className="mx-auto mt-2.5 max-w-2xl text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                  {liveImpactHeaders.description}
                </p>
              )}
            </div>
          )}

          {/* 1. ASTU IMPACT - EDITORIAL STATISTICS GRID */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {dynamicStats.map((stat, idx) => {
              const StatIcon = getDynamicStatIcon(stat, idx);
              const labelTitle = stat.label || stat.title || "Impact Metric";
              const targetUrl = stat.target || stat.link || liveSectionLinks.impactDefaultLinkTarget;
              const buttonText = stat.action || liveSectionLinks.impactDefaultLinkText;

              return (
                <article
                  key={stat.id || stat.label || stat.title || idx}
                  onClick={() => navigate(targetUrl)}
                  className={`reveal reveal-delay-${(idx % 4) + 1} group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 border border-slate-200/70 shadow-xs hover:border-astu-navy/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                >
                  {/* Subtle top indicator accent bar */}
                  <div className="absolute top-0 left-6 right-6 h-[2px] bg-slate-200 group-hover:bg-gradient-to-r group-hover:from-astu-navy group-hover:to-astu-red transition-all duration-300" />

                  <div>
                    {/* Top Row: Icon Container & Tag */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="animatic-node flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-astu-navy group-hover:bg-astu-navy group-hover:text-white transition-all duration-300 shadow-2xs">
                        <StatIcon className="h-5 w-5" />
                      </div>
                      <span className="inline-flex items-center rounded-full bg-slate-100/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 group-hover:bg-rose-50 group-hover:text-astu-red transition-colors">
                        {stat.trend || (idx === 0 ? "+18% YoY" : idx === 1 ? "5 Faculties" : idx === 2 ? "Corporate Link" : "Verified Placement")}
                      </span>
                    </div>

                    {/* Counter Value - Prominent Visual Hero Focus */}
                    <h3 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-astu-navy group-hover:text-astu-red transition-colors duration-300">
                      {stat.value}{stat.suffix || ''}
                    </h3>

                    {/* Metric Label */}
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                      {labelTitle}
                    </p>
                  </div>

                  {/* Action Link Footer */}
                  {buttonText && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(targetUrl); }}
                        className="group/btn inline-flex items-center gap-1.5 text-xs font-bold text-astu-navy hover:text-astu-red transition-colors cursor-pointer"
                      >
                        <span>{buttonText}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* 2. DELIBERATE VISUAL TRANSITION (IMPACT → JOURNEY BRIDGE) */}
          <div className="my-10 flex flex-col items-center justify-center text-center reveal">
            {/* Vertical Connecting Line */}
            <div className="h-10 w-0.5 bg-gradient-to-b from-slate-300 via-astu-navy/30 to-astu-navy" />
            
            {/* Transition Badge Header */}
            <div className="inline-flex items-center gap-2 rounded-full border border-astu-navy/20 bg-white px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-astu-navy shadow-sm -mt-2.5">
              <span className="h-2 w-2 rounded-full bg-astu-red" />
              <span>{livePortalsHeaders?.eyebrow || "YOUR ASTU JOURNEY"}</span>
            </div>
            
            <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-astu-navy sm:text-3xl">
              {livePortalsHeaders?.title || "From Registration to Meaningful Career Impact"}
            </h3>
            <p className="mx-auto mt-1.5 max-w-xl text-xs sm:text-sm text-slate-600 font-medium">
              {livePortalsHeaders?.description || "Four simple stages connecting graduates, employers, research, and institutional growth."}
            </p>
          </div>

          {/* 3. YOUR ASTU JOURNEY - 4 CONNECTED STEPS */}
          <div className="relative">
            {/* Desktop Horizontal Journey Connector Line */}
            <div className="hidden lg:block absolute left-[12%] right-[12%] top-[40px] h-0.5 bg-gradient-to-r from-astu-navy/30 via-blue-500/40 to-astu-red/30 -z-0 pointer-events-none" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
              {livePortals.map((item, idx) => {
                const IconComponent = typeof item.icon === 'function' ? item.icon : (iconMap[item.icon] || Users);
                const descText = item.description || (Array.isArray(item.points) ? item.points[0] : item.text || '');
                const stepNum = item.badge?.replace('Step ', '') || `0${idx + 1}`;
                const tagsList: string[] = item.tags || (idx === 0 ? ["Verified ID", "Skill Matrix"] : idx === 1 ? ["Job Match", "Mentorship"] : idx === 2 ? ["Global Network", "Industry Events"] : ["Tracer Surveys", "Curriculum"]);
                const ctaText = item.cta || (idx === 0 ? "Start Profile" : idx === 1 ? "Explore Opportunities" : idx === 2 ? "Join Network" : "Take Survey");
                const routeUrl = item.route || (idx === 0 ? "/register" : idx === 1 ? "/info/employer-portal" : idx === 2 ? "/login" : "/info/alumni-portal");

                const stepActionVerbs = ["CREATE", "DISCOVER", "CONNECT", "GIVE BACK"];
                const actionVerb = stepActionVerbs[idx] || "STAGE";

                return (
                  <React.Fragment key={item.id || item.step || item.title || idx}>
                    <article
                      onClick={() => navigate(routeUrl)}
                      className={`reveal reveal-delay-${(idx % 4) + 1} group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs hover:border-astu-navy/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 cursor-pointer`}
                    >
                      {/* Top Accent Strip */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-astu-navy group-hover:to-astu-red transition-all duration-300" />

                      <div>
                        {/* Step Badge & Action Header */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 px-3 items-center justify-center rounded-full bg-astu-navy text-white font-extrabold text-xs tracking-wider shadow-2xs group-hover:bg-astu-red transition-colors duration-300">
                              {stepNum.padStart(2, '0')}
                            </span>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-astu-navy group-hover:text-astu-red transition-colors">
                              {actionVerb}
                            </span>
                          </div>
                          <div className="animatic-node flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-astu-navy group-hover:bg-rose-50 group-hover:text-astu-red transition-all duration-300 border border-slate-200/50 shadow-2xs">
                            <IconComponent className="h-4 w-4" />
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="mb-1.5 text-sm font-bold tracking-tight text-slate-900 group-hover:text-astu-navy transition-colors">
                          {item.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs leading-relaxed text-slate-600 line-clamp-3 font-normal">
                          {descText}
                        </p>

                        {/* Category Tags */}
                        {tagsList.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {tagsList.map((tag: string, tIdx: number) => (
                              <span key={tIdx} className="inline-block rounded-md bg-slate-100/90 group-hover:bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition-colors">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom CTA Action Link */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(routeUrl); }}
                          className="group/btn inline-flex items-center justify-between w-full text-xs font-bold text-astu-navy group-hover:text-astu-red transition-colors cursor-pointer"
                        >
                          <span>{ctaText}</span>
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover/btn:bg-astu-navy group-hover/btn:text-white transition-all duration-200">
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                          </div>
                        </button>
                      </div>
                    </article>

                    {/* Mobile vertical progression indicator line */}
                    {idx < livePortals.length - 1 && (
                      <div className="lg:hidden flex items-center justify-center -my-2 sm:hidden pointer-events-none">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                          <ArrowRight className="h-3 w-3 rotate-90" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 4. ACTION CONCLUDING CTA */}
          <div className="mt-12 flex flex-col items-center justify-center text-center reveal">
            {/* Visual connector line leading down to CTA */}
            <div className="h-8 w-0.5 bg-gradient-to-b from-astu-navy/30 to-astu-navy mb-3" />

            <button
              className="group relative inline-flex items-center gap-2.5 rounded-xl bg-astu-navy px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-astu-navy/15 transition-all duration-300 hover:bg-[#002244] hover:shadow-xl hover:shadow-astu-navy/25 hover:-translate-y-0.5 cursor-pointer border border-transparent hover:border-astu-red/30"
              onClick={() => navigate(livePortalsHeaders?.ctaLink || liveSectionLinks.portalsGetStartedLink)}
            >
              <span>{livePortalsHeaders?.ctaText || "Get Started Today"}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 text-white group-hover:text-rose-300" />
            </button>
            
            <p className="mt-2.5 text-xs text-slate-500 font-medium tracking-wide">
              Join the ASTU alumni community and start building your professional network.
            </p>
          </div>
        </section>        <span id="campuses" className="relative -top-24 block" />
        <section id="campus-life" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">{liveCampusLifeHeaders?.eyebrow || "Explore Life At ASTU"}</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy md:text-3xl">{liveCampusLifeHeaders?.title || "Campus Life, Facilities, Events, and Galleries"}</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              {liveCampusLifeHeaders?.description || "A public gateway for the same institutional experiences AAU highlights: events, facilities, campus activities, media galleries, and services."}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {/* Limit to 3 campus-life cards on home page */}
            {liveCampusLife.slice(0, 3).map((card, idx) => {
              const targetRoute = card.link || (
                card.action?.toLowerCase().includes("event") ? "/events" :
                card.action?.toLowerCase().includes("facilit") ? "/info/facilities" :
                card.action?.toLowerCase().includes("gallery") ? "/info/gallery" :
                "/info/campus-life"
              );

              const handleNavigate = () => {
                if (targetRoute.startsWith("#")) {
                  const el = document.querySelector(targetRoute);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate(`/${targetRoute}`);
                  }
                } else {
                  navigate(targetRoute);
                }
              };

              return (
                <article
                  key={card.id || card.title || idx}
                  className={`reveal reveal-delay-${(idx % 3) + 1} flex flex-col justify-between overflow-hidden rounded-xl border border-outline-variant bg-white card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}
                >
                  <div>
                    <div
                      className="cursor-pointer overflow-hidden"
                      onClick={handleNavigate}
                    >
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-52 w-full object-cover transition-transform duration-700 hover:scale-105"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="p-5 pb-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-astu-red">{card.campus}</p>
                      <h4
                        onClick={handleNavigate}
                        className="mt-2 text-lg font-semibold text-astu-navy hover:text-astu-red transition-colors cursor-pointer"
                      >
                        {card.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{card.description}</p>
                    </div>
                  </div>
                  <div className="p-5 pt-4">
                    {card.action && (
                      <button
                        type="button"
                        onClick={handleNavigate}
                        className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low hover:border-astu-navy btn-magnetic cursor-pointer transition-all"
                      >
                        <span>{card.action}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* â”€â”€ Campuses section REMOVED (shown via campus-life card link) â”€â”€ */}

        {/* Gallery Preview — max 3 on home page, full gallery at /gallery or custom link */}
        <span id="gallery" className="relative -top-24 block" />
        <section
          className="mx-auto max-w-[1440px] px-4 py-14 md:px-8 md:py-20 transition-colors duration-300 rounded-3xl"
          style={{
            backgroundColor:
              liveGallerySection?.homeBgColor && liveGallerySection.homeBgColor !== 'transparent'
                ? liveGallerySection.homeBgColor
                : undefined,
          }}
        >
          {/* Section header */}
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center reveal">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-astu-red/10 border border-astu-red/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-astu-red">
                <Image className="h-3 w-3" /> {liveGallerySection?.homeEyebrow || 'Campus Gallery'}
              </span>
              <h2 className="mt-3 text-3xl font-black text-astu-navy md:text-4xl">
                {liveGallerySection?.homeTitle ? (
                  liveGallerySection.homeTitle
                ) : (
                  <>Campus <span className="animate-gradient-text">Life &amp; Moments</span></>
                )}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-on-surface-variant leading-relaxed">
                {liveGallerySection?.homeSubtitle ||
                  'A glimpse of life at ASTU — research, innovation, graduation ceremonies, and alumni milestones.'}
              </p>
            </div>
            <a
              href={liveGallerySection?.homeButtonLink || '/gallery'}
              onClick={(e) => {
                e.preventDefault();
                navigate(liveGallerySection?.homeButtonLink || '/gallery');
              }}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-astu-navy px-6 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Image className="h-4 w-4" />
              {liveGallerySection?.homeButtonText || 'View All Gallery'}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* 3-column photo grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(liveGallery.length > 0 ? liveGallery : galleryImages).slice(0, 3).map((item: any, idx: number) => (
              <article
                key={item.id || item.title || idx}
                className={`reveal reveal-delay-${idx + 1} group relative overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(0,51,102,0.14)] cursor-pointer`}
                style={{ aspectRatio: '4/3' }}
                onClick={() => navigate('/gallery')}
              >
                {/* Image */}
                <img
                  src={item.src || item.image || item.url || galleryImages[idx % 3]?.src}
                  alt={item.title || 'Campus Gallery'}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={handleImageError}
                />
                {/* Always-visible bottom gradient + title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm line-clamp-1">{item.title || 'Campus Gallery'}</p>
                  {item.album && (
                    <p className="text-white/70 text-[11px] mt-0.5 flex items-center gap-1">
                      <Image className="h-3 w-3" />{item.album}
                    </p>
                  )}
                </div>
                {/* Hover overlay — 'View Gallery' pill */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 text-xs font-bold text-white shadow-lg">
                    <ExternalLink className="h-3.5 w-3.5" /> View Gallery
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Show count + hyperlink when CMS has more than 3 images */}
          {liveGallery.length > 3 && (
            <div className="mt-8 flex flex-col items-center gap-3 reveal">
              <p className="text-sm text-on-surface-variant">
                Showing <strong className="text-astu-navy">3</strong> of{' '}
                <strong className="text-astu-navy">{liveGallery.length}</strong> gallery items
              </p>
              <a
                href="/gallery"
                onClick={(e) => { e.preventDefault(); navigate('/gallery'); }}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-astu-navy px-8 py-3 text-sm font-bold text-astu-navy hover:bg-astu-navy hover:text-white transition-all duration-300 hover:scale-105"
              >
                <Image className="h-4 w-4" />
                View Full Gallery — {liveGallery.length} Photos &amp; Videos
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </section>
        {/* ── Upcoming Events ── */}
        <section id="events" className="mx-auto max-w-[1440px] px-4 py-14 md:px-8 md:py-20">
          {/* Section header */}
          <div className="reveal mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-astu-red/10 border border-astu-red/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-astu-red">
                <CalendarDays className="h-3 w-3" /> {liveEventsHeaders?.eyebrow || 'Events & Workshops'}
              </span>
              <h2 className="mt-3 text-3xl font-black text-astu-navy md:text-4xl">
                {liveEventsHeaders?.title || 'Upcoming Alumni Events'}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-on-surface-variant leading-relaxed">
                {liveEventsHeaders?.description || 'Networking, learning, and professional growth opportunities.'}
              </p>
            </div>
            {/* View All link — always visible */}
            <a
              href="/events"
              onClick={(e) => { e.preventDefault(); navigate('/events'); }}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-astu-navy px-6 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              {liveEventsHeaders?.viewAllText || liveSectionLinks.eventsViewAllText}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* 3-per-row event cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {liveEvents.slice(0, 3).map((event, idx) => (
              <article
                key={event.title + idx}
                className={`reveal reveal-delay-${idx + 1} group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_4px_20px_rgba(0,51,102,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,51,102,0.14)]`}
              >
                {/* Image with overlay */}
                <div className="relative overflow-hidden h-48">
                  <img
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={event.image}
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-astu-red px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                    {event.category || event.kind || 'Event'}
                  </span>
                </div>
                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-astu-navy group-hover:text-astu-red transition-colors line-clamp-2 leading-snug">
                    {event.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-astu-red" />{event.date}
                    </span>
                    {event.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-astu-red" />{event.location}
                      </span>
                    )}
                  </div>
                  {event.description && <p className="mt-3 line-clamp-2 text-xs text-on-surface-variant">{event.description}</p>}
                  {/* Action buttons pushed to bottom */}
                  <div className="mt-auto pt-4 flex gap-2">
                    <button
                      className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${registeredTitles.includes(event.title) ? 'bg-emerald-600 text-white' : 'bg-astu-navy text-white hover:brightness-110 hover:shadow-md'}`}
                      onClick={() => handleRegisterClick({ title: event.title, kind: 'Event', date: event.date, location: event.location, id: event.id || event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                    >
                      {registeredTitles.includes(event.title) ? '✓ Registered' : (liveEventsHeaders?.registerButtonText || liveSectionLinks.eventsCardRegisterText)}
                    </button>
                    <button
                      onClick={() => navigate(event.link && event.link.startsWith('/events/') ? event.link : `/events/${event.id || event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, { state: { event } })}
                      className="rounded-xl border-2 border-outline-variant px-3 py-2.5 text-xs font-bold hover:border-astu-navy hover:text-astu-navy cursor-pointer transition-all"
                    >
                      {liveEventsHeaders?.detailsButtonText || liveSectionLinks.eventsCardDetailsText}
                    </button>
                  </div>
                </div>
                {/* Bottom accent line */}
                <div className="h-0.5 bg-gradient-to-r from-astu-navy via-astu-green to-astu-red opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </article>
            ))}
          </div>

          {liveEvents.length === 0 && (
            <p className="rounded-xl border border-dashed border-outline-variant bg-white p-6 text-center text-sm text-on-surface-variant">
              {liveEventsHeaders?.emptyText || 'No upcoming events have been published yet.'}
            </p>
          )}

          {/* Hyperlink to full events list when admin has added more than 3 */}
          {liveEvents.length > 3 && (
            <div className="mt-8 flex flex-col items-center gap-3 reveal">
              <p className="text-sm text-on-surface-variant">
                Showing <strong className="text-astu-navy">3</strong> of{' '}
                <strong className="text-astu-navy">{liveEvents.length}</strong> upcoming events
              </p>
              <a
                href="/events"
                onClick={(e) => { e.preventDefault(); navigate('/events'); }}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-astu-navy px-8 py-3 text-sm font-bold text-astu-navy hover:bg-astu-navy hover:text-white transition-all duration-300 hover:scale-105"
              >
                <CalendarDays className="h-4 w-4" />
                View All {liveEvents.length} Events
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </section>
        <section id="announcements" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <article className="reveal rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-astu-navy/10">
                    <Bell className="h-5 w-5 text-astu-navy" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">{liveAnnouncementsHeaders?.eyebrow || "Announcements"}</p>
                    <h3 className="text-xl font-bold text-astu-navy">{liveAnnouncementsHeaders?.title || "Official Notices"}</h3>
                  </div>
                </div>
                <button
                  onClick={() => navigate(liveSectionLinks.announcementsViewAllLink)}
                  className="rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold text-astu-navy hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  {liveSectionLinks.announcementsViewAllText}
                </button>
              </div>
              <div className="divide-y divide-outline-variant">
                {liveAnnouncements.slice(0, 3).map((announcement, idx) => (
                  <button
                    key={announcement.id || (announcement.title + idx)}
                    onClick={() => navigate(announcement.link || `${liveSectionLinks.announcementItemLinkBase}/${announcement.id || announcement.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                    className="flex w-full items-start gap-3 py-3.5 text-left hover:bg-surface-container-low/60 rounded-lg px-2 transition-all cursor-pointer group"
                  >
                    <div className="relative mt-1 shrink-0">
                      <Bell className="h-4 w-4 text-astu-red group-hover:scale-110 transition-transform" />
                      {announcement.pinned && (
                        <span className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <span className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="block text-sm font-semibold text-astu-navy group-hover:text-astu-red transition-colors line-clamp-1">{announcement.title}</span>
                        {announcement.pinned && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 shrink-0">
                            📌 PINNED
                          </span>
                        )}
                      </div>
                      <span className="mt-0.5 block text-xs text-on-surface-variant">
                        {announcement.type || 'Official Notice'} · {announcement.date}
                        {announcement.author && <span className="opacity-80"> · {announcement.author}</span>}
                      </span>
                    </span>
                  </button>
                ))}
                {liveAnnouncements.length === 0 && (
                  <div className="py-8 text-center text-xs text-on-surface-variant">
                    No announcements published yet. Check back soon for official university notices.
                  </div>
                )}
              </div>
              {liveAnnouncements.length > 3 && (
                <div className="mt-3 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Showing 3 of {liveAnnouncements.length} official notices</span>
                  <button
                    type="button"
                    onClick={() => navigate(liveSectionLinks.announcementsViewAllLink || '/announcements')}
                    className="font-bold text-astu-navy hover:text-astu-red inline-flex items-center gap-1 cursor-pointer"
                  >
                    View All {liveAnnouncements.length} Notices →
                  </button>
                </div>
              )}
            </article>

            <aside className="reveal rounded-xl border border-outline-variant bg-astu-navy p-5 text-white shadow-sm">
              <FileText className="h-7 w-7 text-astu-green" />
              <h4 className="mt-4 text-xl font-bold">{liveAnnouncementsHeaders?.subscribeTitle || "Subscribe to official updates"}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {liveAnnouncementsHeaders?.subscribeDesc || "Receive announcements, events, partner calls, tracer survey reminders, and campus notices directly in your inbox."}
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  toast.success("Subscribed to ASTU-AMS announcements.");
                  (event.currentTarget as HTMLFormElement).reset();
                }}
                className="mt-5 space-y-3"
              >
                <input type="email" required placeholder="Enter your email" className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-white/55 focus:border-astu-green" />
                <button className="w-full rounded-md bg-astu-green px-4 py-3 text-sm font-bold text-white hover:brightness-110 cursor-pointer">Subscribe</button>
              </form>
            </aside>
          </div>
        </section>        {/* ── Success Stories ── */}
        <section id="success-stories" className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/40 py-16 md:py-20 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-astu-navy/4 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-astu-green/5 blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-astu-red/3 blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8">
            <div className="mb-12 text-center reveal">
              <span className="inline-flex items-center gap-2 rounded-full bg-astu-red/10 border border-astu-red/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-astu-red">
                <Trophy className="h-3.5 w-3.5" /> Our Stories
              </span>
              <h2 className="mt-4 text-3xl font-black text-astu-navy md:text-4xl">
                Alumni <span className="animate-gradient-text">Success Stories</span>
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-on-surface-variant leading-relaxed">
                Discover inspiring journeys of ASTU graduates who are shaping industries, advancing research, and making meaningful global impact.
              </p>
            </div>

            {liveStories && liveStories.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {liveStories.slice(0, 3).map((story: any, idx: number) => {
                  const personName = story.alumniName || story.name || story.author || 'ASTU Alumni';
                  const storyTitle = story.title || `${personName}'s Journey`;
                  const storyDesc = story.text || story.excerpt || story.description || story.content || '';
                  const storyRole = story.role || story.department || 'Alumni Member';
                  const initial = (personName || 'A').charAt(0).toUpperCase();

                  return (
                    <article
                      key={story.id || story.title || story.name || idx}
                      className={`reveal reveal-delay-${(idx % 3) + 1} group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_2px_16px_rgba(0,51,102,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,51,102,0.15)]`}
                    >
                      {(story.image || story.coverImage) && (
                        <div className="overflow-hidden h-48 bg-slate-100">
                          <img
                            src={story.image || story.coverImage}
                            alt={storyTitle}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={handleImageError}
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <Quote className="h-5 w-5 text-astu-red/40 mb-2" />
                        <h4 className="text-base font-bold text-astu-navy group-hover:text-astu-red transition-colors line-clamp-2">
                          {storyTitle}
                        </h4>
                        {storyDesc && (
                          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant line-clamp-3">
                            {storyDesc}
                          </p>
                        )}
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-astu-navy to-astu-green flex items-center justify-center text-white text-xs font-bold">
                              {initial}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-astu-navy">{personName}</p>
                              <p className="text-[10px] text-on-surface-variant">{storyRole}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(story.link || `/stories/${story.id || 'S-00' + (idx + 1)}`)}
                            className="inline-flex items-center gap-1 rounded-lg bg-astu-navy/5 hover:bg-astu-navy hover:text-white px-3 py-1.5 text-xs font-semibold text-astu-navy transition-all cursor-pointer"
                          >
                            Read More <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-astu-navy via-astu-green to-astu-red opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Fallback static stories when no dynamic stories are loaded */
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    id: "S-001",
                    name: "Dr. Ruth Alemu",
                    role: "AI Research Scientist, Addis Ababa",
                    story: "After graduating from ASTU's Computer Science program, Ruth joined a leading AI research lab and has published 18 applied AI papers. She actively mentors current ASTU students through the AMS platform.",
                    img: arcImage,
                    grad: "2018",
                  },
                  {
                    id: "S-002",
                    name: "Yonas Bekele",
                    role: "Founder, GreenGrid Labs",
                    story: "Inspired by ASTU's engineering labs, Yonas founded GreenGrid Labs — a renewable energy startup now serving 12 industrial campuses across East Africa, creating over 200 clean-energy jobs.",
                    img: electricLabs,
                    grad: "2016",
                  },
                  {
                    id: "S-003",
                    name: "Kalkidan Tadesse",
                    role: "Cloud Platform Lead, Ethio Telecom",
                    story: "Kalkidan credits ASTU's hands-on lab programs for her rapid growth in cloud engineering. She now leads enterprise cloud migration programs for regional partners and mentors junior graduates.",
                    img: stateM,
                    grad: "2019",
                  },
                ].map((item, idx) => (
                  <article
                    key={item.name}
                    className={`reveal reveal-delay-${idx + 1} group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_2px_16px_rgba(0,51,102,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,51,102,0.15)]`}
                  >
                    <div className="relative overflow-hidden h-48">
                      <img src={item.img} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" onError={handleImageError} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-3 right-3 rounded-full bg-astu-green/90 px-2.5 py-0.5 text-[10px] font-bold text-white">Class of {item.grad}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <Quote className="h-5 w-5 text-astu-red/40 mb-2" />
                      <p className="text-sm leading-relaxed text-on-surface-variant line-clamp-4 flex-1">{item.story}</p>
                      <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-astu-navy to-[#1a4f8a] flex items-center justify-center text-white text-sm font-bold shadow">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-astu-navy">{item.name}</p>
                            <p className="text-[10px] text-on-surface-variant">{item.role}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/stories/${item.id}`)}
                          className="inline-flex items-center gap-1 rounded-lg bg-astu-navy/5 hover:bg-astu-navy hover:text-white px-3 py-1.5 text-xs font-semibold text-astu-navy transition-all cursor-pointer"
                        >
                          Read More <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-astu-navy via-astu-green to-astu-red opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </article>
                ))}
              </div>
            )}

            <div className="mt-10 flex justify-center reveal">
              <button
                onClick={() => navigate('/info/alumni-stories')}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-astu-navy px-8 py-3 text-sm font-bold text-astu-navy hover:bg-astu-navy hover:text-white transition-all duration-300 hover:scale-105 btn-magnetic"
              >
                <Star className="h-4 w-4" /> View All Alumni Stories
              </button>
            </div>
          </div>
        </section>        {/* ── Community Section ── */}
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
        </section>        {/* ── Partner Logos ── */}
        <span id="stakeholders" className="relative -top-24 block" />
        <section id="partners" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 overflow-hidden bg-gradient-to-b from-[#f8faff] to-white rounded-2xl my-4">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">{livePartnersHeaders?.eyebrow || "Our Partners"}</p>
            <h3 className="mt-1 text-2xl font-bold text-astu-navy md:text-3xl">{livePartnersHeaders?.title || "Partner Companies"}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-on-surface-variant">{livePartnersHeaders?.description || "Institutional partners supporting employability, internships, and research collaboration."}</p>
          </div>
          <div className="relative">
            <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
              {[...livePartners, ...livePartners].map((partner, idx) => {
                const LogoComponent = partnerLogos[partner.name];
                return (
                  <div key={`${partner.name}-${idx}`} className="flex min-w-[160px] flex-col items-center gap-3 rounded-xl border border-outline-variant bg-white p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]">
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="h-10 max-w-[140px] object-contain" />
                    ) : LogoComponent ? (
                      <LogoComponent />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-astu-navy text-white text-sm font-bold shadow-md">
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-astu-navy text-center leading-tight">{partner.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── News & Workshops ── */}
        <div id="news" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            {/* News */}
            <section>
              <div className="mb-6 reveal">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Latest News</p>
                <h3 className="mt-1 text-2xl font-bold text-astu-navy md:text-3xl">News from ASTU Alumni Community</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Stay current with alumni achievements, partnerships, and campus developments.</p>
              </div>
              <div className="space-y-3">
                {liveNews.slice(0, 3).map((item: any, idx: number) => (
                  <article
                    key={item.id || item.title + idx}
                    className={`reveal reveal-delay-${(idx % 3) + 1} flex items-start gap-4 rounded-xl border border-outline-variant bg-white p-4 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] cursor-pointer group`}
                    onClick={() => navigate(item.link || `/announcements/${item.id || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-astu-navy/5 text-astu-navy group-hover:bg-astu-navy group-hover:text-white transition-all">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-astu-navy group-hover:text-astu-red transition-colors line-clamp-2">{item.title}</h4>
                      {item.excerpt && <p className="mt-1 text-xs text-on-surface-variant line-clamp-2">{item.excerpt}</p>}
                      <p className="mt-1.5 text-[10px] font-medium text-slate-400">{item.date}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-astu-red transition-colors mt-1" />
                  </article>
                ))}
              </div>
              <button
                onClick={() => navigate('/announcements')}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-astu-navy hover:text-astu-red transition-colors cursor-pointer reveal"
              >
                See All News <ArrowRight className="h-4 w-4" />
              </button>
            </section>

            {/* Workshops */}
            <section id="workshops">
              <div className="mb-6 reveal">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Workshops</p>
                <h3 className="mt-1 text-2xl font-bold text-astu-navy md:text-3xl">Upcoming Workshops</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Professional development sessions open to alumni and students.</p>
              </div>
              <div className="space-y-3">
                {liveWorkshops.slice(0, 3).map((ws: any, idx: number) => {
                  const workshopLink = ws.link || `/events/${ws.id || ws.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                  const isRegistered = registeredTitles.includes(ws.title);
                  return (
                    <article
                      key={ws.title + idx}
                      className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-outline-variant bg-white p-4 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] group`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="inline-block rounded-md bg-astu-navy/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-astu-navy">{ws.focus || 'Career Development'}</span>
                          <h4
                            onClick={() => navigate(workshopLink)}
                            className="mt-1.5 text-sm font-semibold text-astu-navy hover:text-astu-red transition-colors line-clamp-2 cursor-pointer"
                          >
                            {ws.title}
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant">
                            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{ws.date}</span>
                            {ws.seats && <span>{ws.seats}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => navigate(workshopLink)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-astu-navy hover:text-astu-red transition-colors cursor-pointer group/link"
                        >
                          View Details <ArrowRight className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                        </button>
                        <button
                          className="rounded-lg bg-astu-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-astu-navy/90 transition-all cursor-pointer shadow-sm hover:shadow"
                          onClick={() => handleRegisterClick({ title: ws.title, kind: 'Workshop', date: ws.date })}
                        >
                          {isRegistered ? '✓ Registered' : 'Register'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* ── FAQ ── */}
        <section id="faq" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">{liveFaqHeaders?.eyebrow || "FAQ"}</p>
            <h3 className="mt-1 text-2xl font-bold text-astu-navy md:text-3xl">{liveFaqHeaders?.title || "Frequently Asked Questions"}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-on-surface-variant">{liveFaqHeaders?.description || "Common questions about ASTU-AMS, tracer studies, and alumni services."}</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {liveFaq.map((item, idx) => (
              <details key={item.id || idx} className={`reveal reveal-delay-${(idx % 3) + 1} group rounded-xl border border-outline-variant bg-white overflow-hidden card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)]`}>
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-astu-navy hover:bg-slate-50 transition-colors [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <HelpCircle className="h-5 w-5 shrink-0 text-astu-red transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="border-t border-outline-variant px-5 py-4 text-sm leading-relaxed text-on-surface-variant">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        {liveCtaSection?.enabled !== false && (
          <section id="cta" className="relative bg-gradient-to-r from-astu-navy via-primary-container to-slate-900 py-16 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-[20%] w-3 h-3 rounded-full bg-astu-green/20 animate-float" style={{ animationDelay: "0s" }} />
              <div className="absolute bottom-10 right-[30%] w-2 h-2 rounded-full bg-astu-red/20 animate-float" style={{ animationDelay: "1.5s" }} />
              <div className="absolute top-20 right-[15%] w-1.5 h-1.5 rounded-full bg-white/15 animate-float" style={{ animationDelay: "3s" }} />
            </div>
            <div className="max-w-[1440px] mx-auto px-4 reveal relative z-10">
              <h3 className="text-3xl font-bold text-white md:text-4xl">{liveCtaSection?.title || "Ready to Join ASTU-AMS?"}</h3>
              <p className="mt-4 text-slate-200 max-w-2xl mx-auto">
                {liveCtaSection?.description || "Connect with fellow alumni, discover career opportunities, and contribute to university excellence."}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button className="px-6 py-3 bg-white text-astu-navy font-bold rounded-xl hover:bg-slate-100 transition-all shadow-md hover:scale-105 btn-magnetic cursor-pointer" onClick={() => navigate(liveCtaSection?.primaryCtaLink || "/login")}>
                  {liveCtaSection?.primaryCtaText || "Alumni Portal"}
                </button>
                <button className="px-6 py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all hover:scale-105 btn-magnetic cursor-pointer" onClick={() => navigate(liveCtaSection?.secondaryCtaLink || "/login")}>
                  {liveCtaSection?.secondaryCtaText || "Employer Portal"}
                </button>
              </div>
            </div>
          </section>
        )}

      </main>

      <footer className="border-t-2 border-astu-green/30 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 py-16 text-slate-300">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 space-y-12">

          {/* Top Panel: Newsletter Registration */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-10 border-b border-white/5">
            <div className="max-w-md">
              <h5 className="text-base font-bold text-white uppercase tracking-wider">Stay Connected with ASTU</h5>
              <p className="text-xs text-slate-400 mt-1">Get updates on annual reunions, tech career expos, and graduate employment reports.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Thank you! You are subscribed to ASTU Alumni newsletter.');
                (e.target as HTMLFormElement).reset();
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

          {/* Middle Panel: Four Column Information Links */}
          <div className="grid gap-10 md:grid-cols-4">
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
                Connecting graduates, corporate employers, and department heads in one unified ecosystem. Improving national quality audits and modernizing student career placements.
              </p>
              <div className="flex gap-2 pt-2">
                <button className="rounded-lg border border-white/10 hover:border-[#FFD700] px-3.5 py-2 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">Facebook</button>
                <button className="rounded-lg border border-white/10 hover:border-[#FFD700] px-3.5 py-2 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">Twitter</button>
                <button className="rounded-lg border border-white/10 hover:border-[#FFD700] px-3.5 py-2 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">LinkedIn</button>
              </div>
            </div>

            <div>
              <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">Resources & Portals</h6>
              <ul className="space-y-3 text-xs text-slate-400">
                <li>
                  <button
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                    onClick={() => navigate("/info/overview")}
                  >
                    Career Placement Portal
                  </button>
                </li>
                <li>
                  <button
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                    onClick={() => navigate("/info/overview")}
                  >
                    Tracer Survey Hub
                  </button>
                </li>
                <li>
                  <button
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                    onClick={() => navigate("/info/mentorship")}
                  >
                    Mentorship Scheduling
                  </button>
                </li>
                <li>
                  <a
                    href="https://estudent.astu.edu.et/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 transition-all duration-300 hover:text-white hover:translate-x-1 text-left"
                  >
                    Student Portal
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">Official Contact Details</h6>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-astu-green mt-0.5" />
                  <span>Adama, Oromia, Ethiopia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-astu-green" />
                  <span>+251-</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-astu-green" />
                  <a href="mailto:irccd@astu.edu.et" className="hover:text-white transition-colors">irccd@astu.edu.et</a>
                </li>
              </ul>
            </div>

            <div>
              <h6 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFD700] border-b border-white/10 pb-2 mb-4">Accreditation Support</h6>
              <ul className="space-y-3 text-xs text-slate-400">
                <li><button className="transition-all duration-300 hover:text-white hover:translate-x-1 text-left">Quality Assurance Deans</button></li>
                <li><button className="transition-all duration-300 hover:text-white hover:translate-x-1 text-left">Accreditation Outcomes</button></li>
                <li><button className="transition-all duration-300 hover:text-white hover:translate-x-1 text-left">Institutional Research</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Panel: Copyright and Back to Top button */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8 text-xs text-slate-500 font-semibold">
            <div className="flex flex-wrap items-center gap-3">
              <p>© {new Date().getFullYear()} Adama Science and Technology University. All rights reserved.</p>
              <span>&bull;</span>
              <p className="text-astu-green">Tracer Study & ICT Coordination</p>
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
                  <button onClick={confirmRsvpRegistration} className="rounded-lg bg-[#003580] px-5 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-md">
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
