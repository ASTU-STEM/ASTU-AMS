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
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import { useTheme } from "../hooks/useTheme";
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

const FALLBACK_IMAGE = "/images/astu-building.jpg";

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

const defaultHeroSlides = [
  {
    id: 'hs-1',
    image: '/images/astu-building.jpg',
    tagline: 'Quality Assurance & Accreditation',
    title: "Connecting ASTU's Excellence to the Global Industry",
    description: 'A unified digital ecosystem connecting ASTU alumni, corporate employers, and academic departments to accelerate careers, tracer feedback, and technological innovation.',
    active: true,
  },
  {
    id: 'hs-2',
    image: '/images/campus-2.jpeg',
    tagline: 'Enterprise Networking & Placement',
    title: 'Empowering ASTU Graduates in Modern Workspaces',
    description: 'Discover verified corporate partners, explore top technical job openings, and track career outcomes bridging classroom theory with real-world industry.',
    active: true,
  },
  {
    id: 'hs-3',
    image: '/images/gc7.jpg',
    tagline: 'Academic Innovation & Tracer Feedback',
    title: 'Coordinating Strategic Tracer Studies & Skill Gaps',
    description: 'Enabling department heads and partner companies to identify technological skill gaps directly from the workforce, securing university accreditation outcomes.',
    active: true,
  },
];

const defaultCampusLife = [
  {
    id: 'cl-1',
    title: 'Events and Activities',
    campus: 'Main Campus',
    description: 'Career expos, alumni reunions, workshops, chapter meetings, and community programs connecting students with national and global leaders.',
    image: '/images/campus-2.jpeg',
    action: 'View Events',
    active: true,
  },
  {
    id: 'cl-2',
    title: 'Advanced Engineering Laboratories',
    campus: 'Innovation Spaces',
    description: 'Laboratories, robotics centers, libraries, computing clusters, and employer interview rooms fostering hands-on technical excellence.',
    image: '/images/electriclabs.jpeg',
    action: 'Explore Facilities',
    active: true,
  },
  {
    id: 'cl-3',
    title: 'ASTU Architecture & Cultural Center',
    campus: 'Campus Gallery',
    description: 'Research showcases, graduation moments, architectural photography, student exhibitions, and public media archives.',
    image: '/images/arc.jpg',
    action: 'View Gallery',
    active: true,
  },
];

const defaultCampuses = [
  {
    id: 'cm-1',
    name: 'Main Campus',
    description: 'Central hub for alumni services, registrar workflows, administration divisions, and institutional engagement.',
    image: '/images/astu-building.jpg',
    active: true,
  },
  {
    id: 'cm-2',
    name: 'Engineering & Technology Complex',
    description: 'Applied research laboratories, hands-on workshops, innovation programs, and industry-linked software and hardware training.',
    image: '/images/electriclabs.jpeg',
    active: true,
  },
  {
    id: 'cm-3',
    name: 'Graduation & Events Hall',
    description: 'Ceremonies, annual career fairs, alumni excellence awards, and university convocation achievement programs.',
    image: '/images/gc7.jpg',
    active: true,
  },
  {
    id: 'cm-4',
    name: 'Research Collaboration Center',
    description: 'Applied research publications, industry ventures, patent development, and department KPI evaluation center.',
    image: '/images/arc.jpg',
    active: true,
  },
];

const defaultGallery = [
  {
    id: 'gi-1',
    title: 'ASTU Main Administration Building',
    album: 'CAMPUS ARCHITECTURE',
    src: '/images/astu-building.jpg',
    active: true,
  },
  {
    id: 'gi-2',
    title: 'High-Tech Engineering Laboratory',
    album: 'RESEARCH & LABS',
    src: '/images/electriclabs.jpeg',
    active: true,
  },
  {
    id: 'gi-3',
    title: 'Graduation Convocation Ceremony',
    album: 'CONVOCATION',
    src: '/images/gc7.jpg',
    active: true,
  },
  {
    id: 'gi-4',
    title: 'University Green Spaces & Walkways',
    album: 'CAMPUS SCENERY',
    src: '/images/campus-2.jpeg',
    active: true,
  },
  {
    id: 'gi-5',
    title: 'Research & Innovation Showcase Hall',
    album: 'INNOVATION',
    src: '/images/arc.jpg',
    active: true,
  },
  {
    id: 'gi-6',
    title: 'ASTU Alumni Network Leadership Forum',
    album: 'ALUMNI FORUM',
    src: '/images/astusteam.jpg',
    active: true,
  },
];

const defaultVideos = [
  {
    id: 'vi-1',
    title: 'Research & Innovation Forum Highlights',
    description: 'Showcasing groundbreaking faculty and alumni research projects in AI, robotics, and sustainable development.',
    image: '/images/arc.jpg',
    url: 'https://www.youtube.com',
    active: true,
  },
  {
    id: 'vi-2',
    title: 'Graduation Ceremony & Alumni Convocation Replay',
    description: 'Celebrating the achievements and academic honors of our graduating engineers and scientists.',
    image: '/images/gc7.jpg',
    url: 'https://www.youtube.com',
    active: true,
  },
  {
    id: 'vi-3',
    title: 'Advanced Robotics and Computing Labs Tour',
    description: 'Hands-on demonstrations in machine learning, sensor networks, and mechanical systems.',
    image: '/images/electriclabs.jpeg',
    url: 'https://www.youtube.com',
    active: true,
  },
];

const defaultPartners = [
  { name: 'Ethio Telecom', active: true },
  { name: 'Commercial Bank of Ethiopia', active: true },
  { name: 'Safaricom', active: true },
  { name: 'Ethiopian Airlines', active: true },
  { name: 'Huawei', active: true },
  { name: 'INSA', active: true },
];

const defaultTestimonials = [
  {
    id: 'tm-1',
    quote: 'ASTU-AMS transformed how our department monitors graduate employment outcomes. Real-time tracer responses give us the empirical basis we need for international accreditation.',
    by: 'Dr. Henok Tadesse · Dean, School of Electrical Engineering & Computing',
    active: true,
  },
  {
    id: 'tm-2',
    quote: 'As an industrial recruiter, hiring top-tier engineering talent directly from ASTU has never been smoother. The verified graduate credentials eliminate hiring risk.',
    by: 'Selamawit Bekele · Head of Talent Acquisition, Ethio Telecom',
    active: true,
  },
  {
    id: 'tm-3',
    quote: 'Staying connected to my alma mater through mentorship and collaborative research projects has been an incredible experience. ASTU-AMS keeps our alumni family united.',
    by: 'Yohannes Melese · Senior AI Engineer & ASTU Gold Medalist',
    active: true,
  },
];

const defaultFaq = [
  {
    id: 'fq-1',
    question: 'Who can use ASTU-AMS?',
    answer: 'Verified alumni, corporate employers, registrar teams, academic department heads, and system administrators each have tailored, secure role-specific portals.',
    active: true,
  },
  {
    id: 'fq-2',
    question: 'How are tracer surveys utilized?',
    answer: 'Tracer study responses feed graduate employment analytics, identifying technological skill gaps and supporting university curriculum accreditation.',
    active: true,
  },
  {
    id: 'fq-3',
    question: 'Can employers publish job postings and career fairs?',
    answer: 'Yes. Verified employer partners can publish vacancies, search candidate profiles by department, review applications, and coordinate campus recruitment events.',
    active: true,
  },
  {
    id: 'fq-4',
    question: 'How do alumni request official documents and transcripts?',
    answer: 'Sign in to the Alumni Portal, navigate to "Document Services", and submit digital requests for transcripts, certificates, or recommendation letters with live progress tracking.',
    active: true,
  },
  {
    id: 'fq-5',
    question: 'What is the schedule for graduate tracer studies?',
    answer: 'Surveys are administered at 6, 12, and 24-month milestones after graduation to capture comprehensive career trajectory data.',
    active: true,
  },
];

const defaultAnnouncements = [
  {
    id: 'ann-1',
    title: 'ASTU Engineering Innovation Summit 2026',
    date: 'Sep 9, 2026',
    type: 'Official Announcement',
    excerpt: 'Showcasing cutting-edge technology and student research projects across engineering departments.',
  },
  {
    id: 'ann-2',
    title: 'Semester Break: Campus Safety Notice & Lab Guidelines',
    date: 'Aug 20, 2026',
    type: 'Campus Directive',
    excerpt: 'Official ASTU Announcement regarding campus access, lab operating hours, and safety guidelines during the semester break.',
  },
  {
    id: 'ann-3',
    title: 'ASTU Research Grant Winners 2026 Announced',
    date: 'May 25, 2026',
    type: 'Academic Notice',
    excerpt: 'Announcing 12 applied research grants awarded to faculty and alumni engineering teams for breakthrough projects.',
  },
  {
    id: 'ann-4',
    title: 'Annual Alumni & Career Fair 2026 Registrations Open',
    date: 'Jan 4, 2026',
    type: 'Career Event',
    excerpt: 'Connecting over 50 leading industrial recruiters and tech innovators directly with ASTU graduating seniors.',
  },
];

const defaultResearchHighlights = {
  title: 'Research, Innovation & University Achievements',
  description: 'ASTU-AMS connects graduate research publications, startup showcases, employer collaborations, and department KPI evidence into one institutional analytics layer.',
  stats: [
    { label: 'Applied Research Projects', value: '140+', icon: 'BookOpen' },
    { label: 'Technology Patents & Startups', value: '38', icon: 'Trophy' },
    { label: 'Industry Collaborations', value: '85+', icon: 'Handshake' },
  ],
};

const defaultImpactSection = {
  eyebrow: 'Industry-Campus Bridge',
  title: 'ASTU Alumni Impact & Outcomes',
  description: 'Graduate outcomes and employer feedback managed through the ASTU-AMS platform feed directly into academic curriculum updates and national accreditation standards.',
  image: '/images/astu-building.jpg',
  ctaLabel: 'Explore Campus Life',
  ctaRoute: '#campus-life',
};

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
    seats: "45 / 50 seats registered",
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
    seats: "450 seats available",
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
    description: "Annual career acceleration gathering connecting final-year students with high-achieving alumni executives and industry partners. Meet 30+ top employers hiring on the spot.",
    image: gc7Img,
    speaker: "40+ Corporate Recruiters & Alumni Tech Leads",
    seats: "600 attendees expected",
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
    seats: "40 seats registered",
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
    seats: "200 seats capacity",
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
    seats: "1,200 seats",
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
  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 px-6 py-10 text-center">
    <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [liveWorkshops, setLiveWorkshops] = useState<any[]>([]);
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [liveAnnouncements, setLiveAnnouncements] = useState<any[]>([]);
  const [liveStories, setLiveStories] = useState<any[]>([]);
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

  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [noticeSearch, setNoticeSearch] = useState('');

  // Newsletter Subscription State
  const [subscriberEmail, setSubscriberEmail] = useState(() => {
    try {
      return localStorage.getItem('astu_ams_newsletter_subscribed') || '';
    } catch {
      return '';
    }
  });
  const [isSubscribed, setIsSubscribed] = useState(() => {
    try {
      return Boolean(localStorage.getItem('astu_ams_newsletter_subscribed'));
    } catch {
      return false;
    }
  });
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const email = subscriberEmail.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      try {
        const stored = localStorage.getItem('astu_ams_subscribers');
        const list = stored ? JSON.parse(stored) : [];
        if (!list.some((s: any) => (typeof s === 'string' ? s : s.email) === email)) {
          list.push({ email, date: new Date().toISOString() });
          localStorage.setItem('astu_ams_subscribers', JSON.stringify(list));
        }
        localStorage.setItem('astu_ams_newsletter_subscribed', email);
      } catch {
        // ignore
      }
      setIsSubscribing(false);
      setIsSubscribed(true);
      toast.success('Thank you! You are now subscribed to official ASTU updates.');
    }, 500);
  };

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
      excerpt: 'How our alumni network connects 25,000+ graduates with opportunities, mentorship, and lifelong learning resources.',
      date: '5/28/2026',
      category: 'ALUMNI NETWORK',
    },
    {
      id: 'news-def-4',
      title: 'ASTU Research Grant Winners 2026',
      excerpt: 'Announcing 12 applied research grants awarded to faculty and alumni engineering teams.',
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
      excerpt: 'Graduating with a dual major in Electronics & Communication Engineering and Computer Science, achieving an outstanding CGPA of 3.98.',
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
      excerpt: 'Connecting over 50 leading industrial recruiters and tech innovators directly with ASTU graduating seniors.',
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
          image: e.image || ASTU_DEFAULT_EVENTS[idx % ASTU_DEFAULT_EVENTS.length].image,
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
          image: ASTU_DEFAULT_EVENTS[(idx + 3) % ASTU_DEFAULT_EVENTS.length].image,
          speaker: 'Industry Technical Leads',
          seats: w.seats || 'Open Registration',
          statusBadge: 'Hands-on Lab',
          level: 'Practical Workshop',
        });
      });
    }

    // Always ensure the prominent default showcase items (especially the 3 from user screenshot) are included
    const existingTitles = new Set(liveList.map(item => item.title.toLowerCase().trim()));
    const finalItems = [...liveList];
    for (const defItem of ASTU_DEFAULT_EVENTS) {
      if (!existingTitles.has(defItem.title.toLowerCase().trim())) {
        finalItems.push(defItem);
        existingTitles.add(defItem.title.toLowerCase().trim());
      }
    }

    // Sort to place the user's top events first
    finalItems.sort((a, b) => {
      const getPriority = (item: EventItem) => {
        if (item.id === 'ds-ml-bootcamp') return 0;
        if (item.id === 'ethiopialics-2025') return 1;
        if (item.id === 'career-summit-2026') return 2;
        return 10;
      };
      return getPriority(a) - getPriority(b);
    });

    return finalItems;
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


  // Pair each server-reported figure with its presentation.
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
        : defaultHeroSlides.map((slide) => ({
            ...slide,
            image: mediaUrl(slide.image),
          })),
    [normalisedSlides]
  );

  const displayCampusLife = useMemo(() => {
    if (liveCampusLife && liveCampusLife.length > 0) return liveCampusLife;
    return defaultCampusLife;
  }, [liveCampusLife]);

  const displayCampuses = useMemo(() => {
    if (liveCampuses && liveCampuses.length > 0) return liveCampuses;
    return defaultCampuses;
  }, [liveCampuses]);

  const displayGallery = useMemo(() => {
    if (liveGallery && liveGallery.length > 0) return liveGallery;
    return defaultGallery;
  }, [liveGallery]);

  const displayVideos = useMemo(() => {
    if (liveVideos && liveVideos.length > 0) return liveVideos;
    return defaultVideos;
  }, [liveVideos]);

  const displayPartners = useMemo(() => {
    if (livePartners && livePartners.length > 0) return livePartners;
    return defaultPartners;
  }, [livePartners]);

  const displayTestimonials = useMemo(() => {
    if (liveTestimonials && liveTestimonials.length > 0) return liveTestimonials;
    return defaultTestimonials;
  }, [liveTestimonials]);

  const displayFaq = useMemo(() => {
    if (liveFaq && liveFaq.length > 0) return liveFaq;
    return defaultFaq;
  }, [liveFaq]);

  const getAnnouncementBadgeStyle = (type: string) => {
    const lower = String(type || '').toLowerCase();
    if (lower.includes('official') || lower.includes('directive') || lower.includes('safety')) {
      return 'bg-red-50 text-astu-red border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50';
    }
    if (lower.includes('academic') || lower.includes('research') || lower.includes('grant')) {
      return 'bg-sky-50 text-[#003580] border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50';
    }
    if (lower.includes('alumni') || lower.includes('career') || lower.includes('fair') || lower.includes('update')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50';
    }
    if (lower.includes('employer') || lower.includes('partner')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
  };

  const displayAnnouncements = useMemo(() => {
    const raw = liveAnnouncements && liveAnnouncements.length > 0 ? liveAnnouncements : defaultAnnouncements;
    return raw.map((ann: any, idx: number) => {
      let typeLabel = ann.type || 'Official Announcement';
      const lower = String(typeLabel).toLowerCase().trim();
      if (lower === 'post') typeLabel = 'Alumni Update';
      else if (lower === 'announcement') typeLabel = 'Official Announcement';
      else if (lower === 'directive' || lower.includes('safety')) typeLabel = 'Campus Directive';
      else if (lower.includes('event')) typeLabel = 'Campus Event';
      else if (lower.includes('research') || lower.includes('grant') || lower.includes('academic')) typeLabel = 'Academic Notice';
      else if (lower.includes('employer')) typeLabel = 'Employer Notice';
      else if (lower.includes('achievement')) typeLabel = 'Alumni Achievement';
      else if (!lower.includes('announcement') && !lower.includes('notice') && !lower.includes('update')) {
        typeLabel = `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} Notice`;
      }

      let dateLabel = ann.date || '';
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateLabel)) {
        try {
          const [m, d, y] = dateLabel.split('/').map(Number);
          const dt = new Date(y, m - 1, d);
          dateLabel = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
          // ignore
        }
      }

      return {
        ...ann,
        id: ann.id || `ann-${idx}`,
        type: typeLabel,
        date: dateLabel || 'Recent',
        excerpt: ann.excerpt || ann.description || 'Official communication and institutional notice from Adama Science and Technology University administration.',
      };
    });
  }, [liveAnnouncements]);

  const displayStories = useMemo(() => {
    if (liveStories && liveStories.length > 0) return liveStories;
    return storiesService.getStories();
  }, [liveStories]);

  const displayResearchHighlights = useMemo(() => {
    return researchHighlights || defaultResearchHighlights;
  }, [researchHighlights]);

  const displayImpactSection = useMemo(() => {
    return impactSection || defaultImpactSection;
  }, [impactSection]);

  /** Prefer CMS gallery / campus / slide images over any bundled assets */
  const cmsFeatureImages = useMemo(() => {
    const fromGallery = displayGallery
      .map((g: any) => g.src || g.image || g.url)
      .filter(Boolean);
    const fromCampuses = displayCampuses.map((c: any) => c.image).filter(Boolean);
    const fromSlides = displaySlides.map((s: any) => s.image).filter(Boolean);
    const fromCampusLife = displayCampusLife.map((c: any) => c.image).filter(Boolean);
    const pool = [...fromGallery, ...fromCampuses, ...fromSlides, ...fromCampusLife];
    return {
      primary: displayImpactSection?.image || pool[0] || FALLBACK_IMAGE,
      secondary: pool[1] || pool[0] || FALLBACK_IMAGE,
      tertiary: pool[2] || pool[0] || FALLBACK_IMAGE,
    };
  }, [displayGallery, displayCampuses, displaySlides, displayCampusLife, displayImpactSection]);

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
                seats: e.rsvps != null ? `${e.rsvps} seats registered` : 'Open Registration',
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
    };

    syncContent();
    window.addEventListener('astu-cms-content-changed', syncContent);
    window.addEventListener('astu-cms-events-changed', syncContent);
    window.addEventListener('astu-cms-homepage-updated', syncContent);
    const onFooterUpdated = () => setFooterConfig(footerCmsService.getSettings());
    window.addEventListener('astu-cms-footer-updated', onFooterUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-content-changed', syncContent);
      window.removeEventListener('astu-cms-events-changed', syncContent);
      window.removeEventListener('astu-cms-homepage-updated', syncContent);
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
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
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
            {displaySlides.map((_, idx) => (
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
            className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2 text-white/80 hover:text-white animate-bounce cursor-pointer transition-colors"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-8 w-8" />
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
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
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
                    className={`reveal reveal-delay-${(idx % 4) + 1} group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_24px_rgba(0,51,102,0.12)]`}
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color || 'from-astu-navy to-[#1a4f8a]'} text-lg font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                      >
                        {item.step || idx + 1}
                      </div>
                      <div className={`rounded-lg p-2.5 ${item.iconBg || 'bg-astu-navy/10 text-astu-navy dark:bg-sky-500/10 dark:text-sky-400'} transition-colors`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h4 className="mb-2 text-lg font-bold text-astu-navy dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                      {descText}
                    </p>

                    {item.cta && (
                      <button
                        onClick={() => navigate(item.route || '/login')}
                        className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
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
              className="inline-flex items-center gap-2 rounded-lg bg-astu-navy dark:bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 hover:shadow-lg hover:scale-105"
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
              {displayImpactSection?.eyebrow || 'Industry-Campus Bridge'}
            </p>
            <h3 className="mt-2 text-3xl font-bold animate-gradient-text dark:text-white">
              {displayImpactSection?.title || welcomeMessage || 'ASTU Alumni Impact'}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {displayImpactSection?.description ||
                welcomeMessage ||
                'Graduate outcomes and employer feedback managed through the ASTU content system feed directly into curriculum updates.'}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {liveStats.slice(0, 2).map((stat: any) => (
                <div key={stat.title || stat.label || stat.id}>
                  <p className="text-3xl font-bold text-astu-navy dark:text-blue-400">{stat.value}{stat.suffix || ''}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{stat.title || stat.label}</p>
                </div>
              ))}
            </div>
            <button
              className="mt-7 rounded-md bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 hover:scale-105 transition-all btn-magnetic shadow-lg hover:shadow-xl"
              onClick={() => {
                const route = displayImpactSection?.ctaRoute;
                if (route && route.startsWith('#')) {
                  document.getElementById(route.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                } else if (route) {
                  navigate(route);
                } else {
                  document.getElementById('campus-life')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {displayImpactSection?.ctaLabel || 'Explore Campus Life'}
            </button>
          </article>

          <article className="reveal">
            <img
              alt={displayImpactSection?.title || 'ASTU campus'}
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
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Discover events, facilities, campus activities, media galleries, and student services that define life at Adama Science and Technology University.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {displayCampusLife.length === 0 ? (
              <div className="md:col-span-3">
                <EmptySection message="Campus life highlights will appear here once published by the university content team." />
              </div>
            ) : (
              displayCampusLife.map((card, idx) => (
              <article key={card.id || card.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img src={card.image || FALLBACK_IMAGE} alt={card.title} className="h-52 w-full object-cover transition-transform duration-700 hover:scale-105" onError={handleImageError} />
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-astu-red">{card.campus}</p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy dark:text-white">{card.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{card.description}</p>
                  {card.action && (
                    <button
                      onClick={() => {
                        if (card.action?.toLowerCase().includes('event')) {
                          document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          navigate('/gallery');
                        }
                      }}
                      className="mt-4 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 btn-magnetic cursor-pointer transition-colors"
                    >
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
            <button
              onClick={() => navigate('/gallery')}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              View all
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {displayCampuses.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-4">
                <EmptySection message="Campus profiles will appear here once published by the university content team." />
              </div>
            ) : (
              displayCampuses.map((campus, idx) => (
              <article key={campus.id || campus.name || idx} className={`reveal reveal-delay-${(idx % 4) + 1} overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img src={campus.image || FALLBACK_IMAGE} alt={campus.name} className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105" onError={handleImageError} />
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-astu-navy dark:text-white">{campus.name}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{campus.description}</p>
                  <button
                    onClick={() => navigate('/gallery')}
                    className="mt-3 text-xs font-semibold text-astu-red hover:underline btn-magnetic cursor-pointer"
                  >
                    Explore
                  </button>
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
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Campus life, events, and institutional moments from Adama Science and Technology University.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {displayGallery.length === 0 ? (
              <div className="sm:col-span-2 md:col-span-3">
                <EmptySection message="Photo gallery items will appear here once published by the university content team." />
              </div>
            ) : (
              displayGallery.map((item, idx) => (
              <article key={item.id || item.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <img src={item.src || item.image || FALLBACK_IMAGE} alt={item.title} className="h-48 w-full object-cover transition-all duration-700 hover:scale-110 sm:h-56 md:h-64" onError={handleImageError} />
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
              className="inline-flex items-center gap-2 rounded-lg bg-astu-navy dark:bg-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 shadow-md hover:shadow-lg transition-all cursor-pointer"
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
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Workshop recordings, graduation moments, and research showcases.</p>
            </div>
            <button
              onClick={() => navigate('/gallery')}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              View Media Library
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {displayVideos.length === 0 ? (
              <div className="md:col-span-3">
                <EmptySection message="Video highlights will appear here once published by the university content team." />
              </div>
            ) : (
              displayVideos.map((video: any, idx: number) => (
                <article key={video.id || video.title || idx} className={`reveal reveal-delay-${(idx % 3) + 1} overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
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
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{video.description}</p>
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
                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Join campus career expos, technical workshops, and alumni reunions.
                </p>
              </div>

              {/* Action Button: See All Events → */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-astu-navy dark:bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-astu-navy/20 dark:shadow-blue-900/30 transition-all duration-200 hover:bg-astu-navy/90 dark:hover:bg-blue-500 hover:shadow-lg active:scale-95 group"
                  onClick={() => setShowAllEventsModal(true)}
                >
                  <span>See All Events</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Carousel Navigation Controls Bar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 dark:border-slate-800 pb-5">
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
                        ? 'bg-astu-navy text-white shadow-sm dark:bg-blue-600'
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:border-astu-navy hover:text-astu-navy dark:hover:border-blue-400 dark:hover:text-blue-300 hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const totalPages = Math.max(1, Math.ceil(filteredEventsList.length / 3));
                    setEventSlideIndex((prev) => (prev + 1) % totalPages);
                  }}
                  aria-label="Next Events Slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:border-astu-navy hover:text-astu-navy dark:hover:border-blue-400 dark:hover:text-blue-300 hover:scale-105 active:scale-95"
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
                    className="animate-card-slide group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(0,51,102,0.05)] dark:shadow-slate-900/40 hover:shadow-2xl hover:shadow-astu-navy/15 dark:hover:shadow-sky-950/40 hover:-translate-y-2 transition-all duration-300"
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
                      <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-4 text-white dark:text-slate-900">
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
                          className="text-base sm:text-lg font-bold text-astu-navy dark:text-white line-clamp-1 hover:text-astu-red dark:hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          {event.title}
                        </h4>

                        {/* Date & Location Chips */}
                        <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-300">
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
                      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 ${
                            registeredTitles.includes(event.title)
                              ? 'bg-emerald-600 text-white cursor-default shadow-emerald-600/20'
                              : 'bg-astu-navy text-white hover:bg-astu-navy/90 hover:shadow-md hover:shadow-astu-navy/20 dark:bg-blue-600 dark:hover:bg-blue-500'
                          }`}
                          onClick={() => handleRegisterClick({ title: event.title, kind: event.kind, date: event.date, location: event.location, id: event.id })}
                        >
                          {registeredTitles.includes(event.title) ? '✓ Registered' : 'Register'}
                        </button>

                        <button
                          onClick={() => setSelectedEventModal(event)}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  University updates, academic notices, and alumni network news.
                </p>
              </div>

              {/* Action Button: See All News → */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-astu-navy dark:bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-astu-navy/20 dark:shadow-blue-900/30 transition-all duration-200 hover:bg-astu-navy/90 dark:hover:bg-blue-500 hover:shadow-lg active:scale-95 group"
                  onClick={() => setShowAllNewsModal(true)}
                >
                  <span>See All News</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Slider Controls Bar with Auto-play Progress Timer */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 dark:border-slate-800 pb-5">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 disabled:opacity-40"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleNewsSlideChange(newsSlideIndex + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 disabled:opacity-40"
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
                      className="animate-card-slide group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_4px_20px_rgba(0,51,102,0.05)] dark:shadow-slate-900/40 hover:shadow-2xl hover:shadow-astu-navy/15 dark:hover:shadow-sky-950/40 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
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
                        <h4 className="text-base sm:text-lg font-bold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {news.title}
                        </h4>
                        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {news.excerpt || 'Read the official dispatch from Adama Science and Technology University regarding campus activities, academic schedules, and student outcomes.'}
                        </p>
                      </div>

                      {/* Bottom: Date, Read Time & Action */}
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
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
                          className="inline-flex items-center gap-1 font-bold text-astu-navy dark:text-blue-400 group-hover:translate-x-1 transition-transform"
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
          <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
            <article className="reveal rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40 flex flex-col justify-between">
              <div>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-astu-navy/10 dark:bg-sky-500/15">
                      <img src="/images/announcementIcon.svg" alt="announcement" loading="lazy" width="100" height="100" className="h-7 w-7" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Announcements</p>
                      <h3 className="text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Official Notices</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAllNotices(true)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Search notices"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                    <button
                      onClick={() => navigate('/announcements')}
                      className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      View all
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayAnnouncements.slice(0, 5).map((announcement, idx) => (
                    <button
                      key={announcement.title + idx}
                      onClick={() => setSelectedNotice(announcement)}
                      className="flex w-full items-center justify-between gap-3 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg px-2 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red group-hover:scale-110 transition-transform" />
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {announcement.title}
                          </span>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getAnnouncementBadgeStyle(announcement.type)}`}>
                              {announcement.type}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <Clock className="h-3 w-3 shrink-0 opacity-70" />
                              {announcement.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-astu-red transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </article>

            <aside className="reveal rounded-xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-[#002855] via-astu-navy to-[#05162a] p-5 md:p-6 text-white shadow-lg flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-astu-green shadow-inner">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Official Dispatch
                  </span>
                </div>

                <h4 className="mt-4 text-xl font-bold tracking-tight text-white">Subscribe to official updates</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Receive verified announcements, academic calendars, career workshop calls, tracer survey alerts, and campus notices directly in your inbox.
                </p>

                {isSubscribed ? (
                  <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>Subscription Active</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300">
                      You are registered for official ASTU dispatches {subscriberEmail ? `at ${subscriberEmail}` : ''}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubscribed(false);
                        localStorage.removeItem('astu_ams_newsletter_subscribed');
                      }}
                      className="mt-2 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Change or update email
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribeNewsletter} className="mt-4 space-y-2.5">
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={subscriberEmail}
                        onChange={(e) => setSubscriberEmail(e.target.value)}
                        placeholder="Enter your institutional or personal email"
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/50 focus:border-astu-green focus:bg-white/15 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-astu-green hover:bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-70"
                    >
                      {isSubscribing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Benefits / Channels coverage */}
                <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Included Dispatches</p>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      <span className="text-[11px]">Campus directives & academic calendar changes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px]">Alumni career fairs, fellowships & recruitment drives</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px]">Research grants, symposiums & DAAD workshop alerts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust footer */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-400" />
                  <span>1,200+ Subscribed</span>
                </span>
                <span>Zero spam · Unsubscribe anytime</span>
              </div>
            </aside>
          </div>
        </section>

        <section id="success-stories" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 text-center reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">Success Stories</p>
            <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white md:text-3xl">Alumni Success Stories</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Journeys of ASTU graduates building careers across industry, research, and entrepreneurship.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayStories.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptySection message="Alumni success stories will appear here once published by the university content team." />
              </div>
            ) : (
              displayStories.slice(0, 3).map((story, idx) => (
                <article
                  key={story.id || idx}
                  className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40 flex flex-col justify-between`}
                >
                  <div>
                    {story.image ? (
                      <img
                        src={story.image}
                        alt=""
                        className="h-40 w-full rounded-xl object-cover mb-3 bg-slate-100 dark:bg-slate-800"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.onerror = null;
                          img.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <h4 className="font-semibold text-astu-navy dark:text-white">{story.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {[story.role, story.company].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{story.text}</p>
                  </div>
                  <button
                    className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start cursor-pointer inline-flex items-center gap-1"
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

        <section id="research" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <article className="reveal rounded-xl bg-astu-navy p-6 text-white">
              <Trophy className="h-8 w-8 text-astu-green" />
              <h3 className="mt-4 text-2xl font-bold md:text-3xl">
                {displayResearchHighlights?.title || 'Research, Innovation & University Achievements'}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-200">
                {displayResearchHighlights?.description ||
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
              {(displayResearchHighlights?.stats?.length ? displayResearchHighlights.stats : []).map((item: any, idx: number) => {
                const Icon = typeof item.icon === 'function' ? item.icon : (iconMap[item.icon] || BookOpen);
                return (
                  <article key={item.label || idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                    <Icon className="h-6 w-6 text-astu-navy dark:text-blue-400" />
                    <p className="mt-4 text-2xl font-bold text-astu-navy dark:text-white">{item.value || '—'}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{item.label}</p>
                  </article>
                );
              })}
              {!displayResearchHighlights?.stats?.length && (
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
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Institutional partners supporting employability, accreditation feedback, internships, and research collaboration.</p>
          </div>
          <div className="relative">
            {displayPartners.length === 0 ? (
              <EmptySection message="Partner organisations will appear here once published by the university content team." />
            ) : (
            <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
              {[...displayPartners, ...displayPartners].map((partner, idx) => {
                const LogoComponent = partnerLogos[partner.name];
                const logoUrl = partner.logo || partner.image || partner.logoUrl;
                return (
                  <div
                    key={`${partner.name}-${idx}`}
                    className="flex min-w-[180px] flex-col items-center gap-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40"
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
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Reflections from alumni, employers, and partners connected through the ASTU network.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {displayTestimonials.length === 0 ? (
              <div className="md:col-span-3">
                <EmptySection message="Community testimonials will appear here once published by the university content team." />
              </div>
            ) : (
              displayTestimonials.map((item: any, idx: number) => (
              <article key={item.id || item.by || idx} className={`reveal reveal-delay-${(idx % 3) + 1} rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <Quote className="h-6 w-6 text-astu-red" />
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.quote}</p>
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
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Common questions about ASTU-AMS, tracer studies, and alumni services.
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {displayFaq.length === 0 ? (
              <EmptySection message="Frequently asked questions will appear here once published by the university content team." />
            ) : (
              displayFaq.map((item, idx) => (
              <details key={item.id || idx} className={`reveal reveal-delay-${(idx % 3) + 1} group rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden card-hover shadow-[0_2px_8px_rgba(0,51,102,0.06)] dark:shadow-slate-900/40`}>
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <HelpCircle className="h-5 w-5 shrink-0 text-astu-red transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.answer}
                </div>
              </details>
              ))
            )}
          </div>
        </section>

        <section id="career-opportunities" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
          <div className="reveal rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 card-hover shadow-[0_4px_16px_rgba(0,51,102,0.08)] dark:shadow-slate-900/40">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-astu-red">
                  {careerCta?.eyebrow || 'Career Opportunities'}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-astu-navy dark:text-white">
                  {careerCta?.title || 'Jobs, internships, AI matching, and candidate shortlisting'}
                </h3>
                <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
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
            <div className="reveal rounded-xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 dark:from-slate-900 via-white dark:via-slate-900 to-slate-50/50 dark:to-slate-900 p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-astu-red">Tracer Study</p>
                  <h3 className="mt-2 text-xl font-bold text-astu-navy dark:text-white">{tracerSpotlight.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{tracerSpotlight.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                    {tracerSpotlight.targetBatch && <span>Batch: <strong className="dark:text-slate-200">{tracerSpotlight.targetBatch}</strong></span>}
                    {tracerSpotlight.responseRate && <span>Response rate: <strong className="dark:text-slate-200">{tracerSpotlight.responseRate}</strong></span>}
                    {tracerSpotlight.deadline && <span>Deadline: <strong className="dark:text-slate-200">{tracerSpotlight.deadline}</strong></span>}
                  </div>
                </div>
                <button
                  className="rounded-md bg-astu-navy dark:bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:brightness-110"
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
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-red/10 text-astu-red">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getAnnouncementBadgeStyle(selectedNotice.type || '')}`}>
                  {selectedNotice.type || 'Official Announcement'}
                </span>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{selectedNotice.date}</p>
              </div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-astu-navy dark:text-white">{selectedNotice.title}</h3>
            <div className="mt-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {selectedNotice.excerpt || selectedNotice.description || selectedNotice.content || "Full official announcement details and documentation from ASTU-AMS Administration."}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const slug = (selectedNotice.id || selectedNotice.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  setSelectedNotice(null);
                  navigate(`/announcements/${slug}`);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <span>Read Full Article</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedNotice(null);
                    navigate('/login');
                  }}
                  className="rounded-lg bg-astu-navy dark:bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:brightness-110 cursor-pointer"
                >
                  Access Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All Notices Modal */}
      {showAllNotices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/10 dark:bg-sky-500/20 text-astu-navy dark:text-sky-400">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-astu-navy dark:text-white">Official Notices & Announcements</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">All public university announcements and official directives.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAllNotices(false);
                  setNoticeSearch('');
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
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
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>

            <div className="mt-4 flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {displayAnnouncements
                .filter(n => !noticeSearch || n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || (n.excerpt && n.excerpt.toLowerCase().includes(noticeSearch.toLowerCase())))
                .map((announcement, idx) => (
                  <button
                    key={announcement.title + idx}
                    onClick={() => {
                      setShowAllNotices(false);
                      setSelectedNotice(announcement);
                    }}
                    className="flex w-full items-start gap-3.5 py-3.5 px-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer group"
                  >
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-astu-red group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="block text-sm font-semibold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-blue-400 transition-colors">{announcement.title}</span>
                        <span className="shrink-0 text-[10px] font-bold text-slate-400 dark:text-slate-500">{announcement.date}</span>
                      </div>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{announcement.type}</span>
                      {announcement.excerpt && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{announcement.excerpt}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>

            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-end">
              <button
                onClick={() => {
                  setShowAllNotices(false);
                  setNoticeSearch('');
                }}
                className="rounded-lg bg-astu-navy dark:bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:brightness-110"
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
          <div className="relative max-w-lg w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {!confirmedQrPass ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="rounded-md bg-astu-navy dark:bg-blue-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">{rsvpModalItem.kind} Registration</span>
                    <h3 className="mt-1.5 text-lg font-bold text-astu-navy dark:text-white">{rsvpModalItem.title}</h3>
                  </div>
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs space-y-1 border border-slate-200/80 dark:border-slate-700/80">
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
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        placeholder="e.g. abebe@astu.edu.et"
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20"
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
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Participant Status</label>
                      <select
                        value={rsvpRole}
                        onChange={(e) => setRsvpRole(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20"
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
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Special Accommodations / Dietary Notes (Optional)</label>
                    <input
                      type="text"
                      value={rsvpNotes}
                      onChange={(e) => setRsvpNotes(e.target.value)}
                      placeholder="e.g. Wheelchair access / Vegetarian meal"
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setRsvpModalItem(null)} className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Cancel
                  </button>
                  <button onClick={confirmRsvpRegistration} className="rounded-lg bg-astu-navy dark:bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-md">
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

                <div className="mx-auto w-48 h-48 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-100 flex items-center justify-center shadow-inner">
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
                  className="w-full rounded-xl bg-astu-navy dark:bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-astu-navy/90 dark:hover:bg-blue-500"
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
            className="relative max-w-2xl w-full rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 max-h-[90vh] flex flex-col"
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
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
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

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
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
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
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

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
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
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700/80">
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
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/80">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                    : 'bg-astu-navy hover:bg-astu-navy/90 hover:shadow-lg dark:bg-blue-600 dark:hover:bg-blue-500'
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
            className="relative max-w-4xl w-full rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80">
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
                className="self-end sm:self-auto rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={allEventsSearch}
                  onChange={(e) => setAllEventsSearch(e.target.value)}
                  placeholder="Search events by title, keyword, or venue..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
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
                        ? 'bg-astu-navy text-white shadow-sm dark:bg-blue-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
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
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all group"
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

                      <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                              : 'bg-astu-navy hover:bg-astu-navy/90 dark:bg-blue-600 dark:hover:bg-blue-500'
                          }`}
                        >
                          {registeredTitles.includes(event.title) ? '✓ Registered' : 'Register'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAllEventsModal(false);
                            setSelectedEventModal(event);
                          }}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/80 dark:bg-slate-900/80">
              <button
                onClick={() => {
                  setShowAllEventsModal(false);
                  setAllEventsSearch('');
                }}
                className="rounded-xl bg-astu-navy dark:bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-astu-navy/90 dark:hover:bg-blue-500"
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
            className="relative max-w-2xl w-full rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 max-h-[90vh] flex flex-col animate-modal-enter"
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

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-astu-navy dark:text-white mb-2">
                  Key Guidance & Inquiries
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  For questions regarding this release, contact the university coordination office at{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">irccd@astu.edu.et</span> or phone{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">+251-221-110000</span>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Announcement link copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
                    className="inline-flex items-center gap-2 rounded-xl bg-astu-navy dark:bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-astu-navy/90 dark:hover:bg-blue-500 transition-all shadow-sm"
                  >
                    <span>Full Notice Page</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedNewsModal(null)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Close
                  </button>
                </div>
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
            className="relative max-w-4xl w-full rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 max-h-[90vh] flex flex-col animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
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
                className="rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search all announcements by title or keyword..."
                  value={newsSearchQuery}
                  onChange={(e) => setNewsSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.badgeClass}`}>
                            {meta.label}
                          </span>
                          <span className="text-[11px] text-slate-400">{n.date || 'Recent'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-astu-navy dark:text-white group-hover:text-astu-red dark:group-hover:text-blue-400 transition-colors truncate">
                          {n.title}
                        </h4>
                        {n.excerpt && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                            {n.excerpt}
                          </p>
                        )}
                      </div>
                      <button className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-astu-navy dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/80 dark:bg-slate-900/80">
              <button
                onClick={() => {
                  setShowAllNewsModal(false);
                  setNewsSearchQuery('');
                }}
                className="rounded-xl bg-astu-navy dark:bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-astu-navy/90 dark:hover:bg-blue-500"
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
