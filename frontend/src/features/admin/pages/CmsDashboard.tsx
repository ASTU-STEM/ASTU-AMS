import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  Image as ImageIcon,
  Layers3,
  MapPin,
  Menu,
  Megaphone,
  MessageSquare,
  MessageSquareText,
  Newspaper,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import contentService from '../services/content.service';
import eventsService, { ApiEvent } from '../services/events.service';
import homepageCmsService, {
  HomepageCmsConfig,
  HeroSlide,
  ImpactStat,
  SuccessStory,
  Partner,
} from '../services/homepageCms.service';
import storiesService, { AlumniStory } from '../services/stories.service';
import { DashboardBroadcastHero } from '../../../components/DashboardBroadcastHero';
import registrationService, { AlumniRegistration } from '../services/registration.service';
import AdminModal from '../components/AdminModal';
import { ContentCardItem, ContentStatus, ContentType } from '../components/ContentCard';
import { useAuth } from '../../../contexts/AuthContext';
import { usePublicMetrics } from '../../../services/publicMetrics.service';

// ─── Types ───────────────────────────────────────────────────────────────────

const DEFAULT_HOMEPAGE_CONFIG: HomepageCmsConfig = {
  welcomeMessage: 'The ASTU Alumni Management System connects graduates, employers, and departments in one platform.',
  welcomeEnabled: true,
  heroBadge: 'Quality Assurance & Accreditation',
  heroSlides: [
    {
      id: 'HS-1',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80',
      tagline: 'Quality Assurance & Accreditation',
      title: 'Connecting ASTU’s Excellence to the Global Industry',
      description: 'A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University.',
      active: true,
    },
    {
      id: 'HS-2',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=80',
      tagline: 'Enterprise Networking & Placement',
      title: 'Empowering ASTU Graduates in Modern Workspaces',
      description: 'Discover corporate partners, publish practical career openings, and track your employment outcomes.',
      active: true,
    },
  ],
  impactStats: [
    { id: 'IS-1', label: 'Registered Alumni Members', value: '1,238', suffix: '+', detail: 'Across 6 specialized colleges', icon: 'Users', active: true },
    { id: 'IS-2', label: 'Partner Organizations', value: '500', suffix: '+', detail: 'Hiring, internships, and feedback', icon: 'Building2', active: true },
    { id: 'IS-3', label: 'Employment Rate', value: '87', suffix: '%', detail: 'Graduate employment rate tracked', icon: 'LineChart', active: true },
    { id: 'IS-4', label: 'Digital Requests', value: '6K', suffix: '+', detail: 'Transcript & certificate requests', icon: 'FileCheck2', active: true },
    
    { id: 'IS-5', label: 'Tracer Survey Responses', value: '2,450', suffix: '+', detail: 'Classes of 2020-2024 surveyed', icon: 'ClipboardCheck', active: true },
    { id: 'IS-6', label: 'Career Placements', value: '890', suffix: '+', detail: 'Graduates hired through AMS', icon: 'Briefcase', active: true },
  ],
  portalsHeaders: {
    eyebrow: 'How It Works',
    title: 'Your Journey Starts Here',
    description: 'Four simple steps to connect, grow, and succeed with ASTU-AMS',
    ctaText: 'Get Started Today',
    ctaLink: '/login',
  },
  portals: [
    {
      id: 'P-1',
      title: 'Create Your Profile',
      icon: 'UserRoundCheck',
      points: ['Sign up and build your professional profile', 'Add graduation details and skills', 'Showcase work experience'],
      cta: 'Start Now',
      route: '/register',
      active: true,
      description: 'Sign up and build your professional profile. Add your graduation details, skills, work experience, and career interests to get started.',
      color: 'from-astu-navy to-[#1a4f8a]',
      iconBg: 'bg-astu-navy/10 text-astu-navy',
      step: 1,
    },
    {
      id: 'P-2',
      title: 'Discover Opportunities',
      icon: 'Search',
      points: ['Browse verified job listings', 'Find internship postings', 'Explore mentorship programs'],
      cta: 'Explore Jobs',
      route: '/jobs',
      active: true,
      description: 'Browse verified job listings, internship postings, and mentorship programs tailored to your expertise and career goals.',
      color: 'from-astu-red to-[#c0392b]',
      iconBg: 'bg-astu-red/10 text-astu-red',
      step: 2,
    },
    {
      id: 'P-3',
      title: 'Connect & Collaborate',
      icon: 'Handshake',
      points: ['Network with fellow alumni', 'Engage with employers', 'Participate in community events'],
      cta: 'Join Network',
      route: '/community',
      active: true,
      description: 'Network with fellow alumni, engage with employers, and participate in community events that advance your professional journey.',
      color: 'from-astu-green to-[#1e8449]',
      iconBg: 'bg-astu-green/10 text-astu-green',
      step: 3,
    },
    {
      id: 'P-4',
      title: 'Grow & Give Back',
      icon: 'LineChart',
      points: ['Complete tracer surveys', 'Mentor current students', 'Contribute to curriculum development'],
      cta: 'Make Impact',
      route: '/mentorship',
      active: true,
      description: 'Complete tracer surveys, mentor current students, and contribute to curriculum development that shapes the next generation.',
      color: 'from-violet-600 to-violet-800',
      iconBg: 'bg-violet-100 text-violet-700',
      step: 4,
    },
  ],
  campusLifeHeaders: {
    eyebrow: 'Campus Life',
    title: 'Experience ASTU',
    description: 'Explore our vibrant campus facilities and activities',
  },
  campusLife: [
    {
      id: 'CL-1',
      title: 'Events and Activities',
      campus: 'Main Campus',
      description: 'Career expos, alumni reunions, workshops, chapter meetings, and community programs.',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
      action: 'View Events',
      link: '/events',
      active: true,
    },
    {
      id: 'CL-2',
      title: 'Facilities',
      campus: 'Innovation Spaces',
      description: 'Laboratories, research centers, libraries, student services, and employer interview rooms.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      action: 'Explore Facilities',
      link: '/facilities',
      active: true,
    },
    {
      id: 'CL-3',
      title: 'ASTU Museums & Gallery',
      campus: 'Campus Gallery',
      description: 'Research showcases, graduation moments, campus photography, and public video archives.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      action: 'View Gallery',
      link: '/gallery',
      active: true,
    },
  ],
  campuses: [
    {
      id: 'C-1',
      name: 'Main Campus',
      description: 'Central hub for alumni services, registrar workflows, and institutional engagement.',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
      active: true,
    },
    {
      id: 'C-2',
      name: 'Engineering Labs',
      description: 'Applied research, workshops, innovation programs, and industry-linked training.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      active: true,
    },
    {
      id: 'C-3',
      name: 'Graduation & Events Hall',
      description: 'Ceremonies, career fairs, alumni awards, and university achievement programs.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      active: true,
    },
    {
      id: 'C-4',
      name: 'Research Collaboration Center',
      description: 'Research publications, industry projects, and department KPI evidence.',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
      active: true,
    },
  ],
  gallery: [
    { id: 'G-1', title: 'ASTU Main Campus', src: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80', active: true },
    { id: 'G-2', title: 'Innovation and Collaboration', src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', active: true },
    { id: 'G-3', title: 'ASTU Alumni Identity', src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', active: true },
  ],
  videos: [],
  eventsHeaders: {
    eyebrow: 'Upcoming Events',
    title: 'Join Our Community Events',
    description: 'Stay connected with reunions, workshops, and networking opportunities',
    viewAllText: 'See All Events →',
    viewAllLink: '/events',
  },
  events: [
    {
      id: 'E-1',
      title: 'ASTU Alumni Carnival 2026',
      date: 'April 25-26, 2026',
      location: 'ASTU Main Campus',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      active: true,
    },
  ],
  workshops: [
    { id: 'W-1', title: 'AI for Engineering Research', date: 'June 14, 2026', seats: '120 seats', focus: 'Research & Innovation', active: true },
    { id: 'W-2', title: 'CV Builder and Interview Lab', date: 'June 20, 2026', seats: '80 seats', focus: 'Career Readiness', active: true },
    { id: 'W-3', title: 'Startup Finance for Alumni', date: 'July 4, 2026', seats: '60 seats', focus: 'Entrepreneurship', active: true },
  ],
  newsHeaders: {
    eyebrow: 'Latest News',
    title: 'Stay Updated',
  },
  newsItems: [],
  announcementsHeaders: {
    eyebrow: 'Announcements',
    title: 'Official Notices',
    subscribeTitle: 'Subscribe to Updates',
    subscribeDesc: 'Get the latest announcements delivered to your inbox',
  },
  announcements: [
    { id: 'A-1', title: 'ASTU Alumni Association Inspires Graduating Class with Career Tips!', date: 'March 7, 2025', type: 'Alumni Announcement', active: true },
    { id: 'A-2', title: 'ASTU hosts a five-day DAAD Alumni workshop', date: 'March 7, 2025', type: 'Employer Announcement', active: true },
    { id: 'A-3', title: 'ASTU alumni serve as model United Nations secretariats!', date: 'January 7, 2025', type: 'Alumni Achievement', active: true },
    { id: 'A-4', title: 'Call for employer partners: campus recruitment week', date: 'May 28, 2026', type: 'Employer Announcement', active: true },
  ],
  storiesHeaders: {
    eyebrow: 'Success Stories',
    title: 'Alumni Achievements',
    description: 'Inspiring stories from our graduates making an impact worldwide',
  },
  stories: [
    { id: 'SS-1', name: 'Dr. Ruth Alemu', role: 'AI Research Scientist', text: 'Published 18 applied AI papers and mentors ASTU research teams.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', active: true },
    { id: 'SS-2', name: 'Yonas Bekele', role: 'Founder, GreenGrid Labs', text: 'Built a renewable-energy startup serving industrial campuses.', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', active: true },
    { id: 'SS-3', name: 'Kalkidan Tadesse', role: 'Cloud Platform Lead', text: 'Leads enterprise cloud migration programs for regional partners.', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80', active: true },
  ],
  partnersHeaders: {
    eyebrow: 'Our Partners',
    title: 'Trusted Organizations',
    description: 'Industry leaders partnering with ASTU for excellence',
  },
  partners: [
    { id: 'PT-1', name: 'Ethio Telecom', active: true },
    { id: 'PT-2', name: 'INSA', active: true },
    { id: 'PT-3', name: 'Ethiopian Airlines', active: true },
    { id: 'PT-4', name: 'Safaricom Ethiopia', active: true },
    { id: 'PT-5', name: 'Huawei', active: true },
    { id: 'PT-6', name: 'Commercial Bank of Ethiopia', active: true },
  ],
  featuredEmployers: [
    { id: 'FE-1', name: 'Ethio Telecom', area: 'Telecom & Cloud', openings: '14 graduate roles', active: true },
    { id: 'FE-2', name: 'Ethiopian Airlines', area: 'Aviation Technology', openings: '8 internship tracks', active: true },
    { id: 'FE-3', name: 'INSA', area: 'Cybersecurity', openings: '6 research placements', active: true },
    { id: 'FE-4', name: 'Huawei Ethiopia', area: 'Network Engineering', openings: '11 certification paths', active: true },
  ],
  testimonials: [],
  faqHeaders: {
    eyebrow: 'FAQ',
    title: 'Frequently Asked Questions',
    description: 'Common questions about ASTU-AMS',
  },
  faq: [
    { id: 'FAQ-1', question: 'Who can use ASTU-AMS?', answer: 'Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services.', active: true },
    { id: 'FAQ-2', question: 'How are tracer studies used?', answer: 'Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence.', active: true },
    { id: 'FAQ-3', question: 'Can employers register events?', answer: 'Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports.', active: true },
  ],
  navSections: [
    { label: 'Home', id: 'home', active: true },
    { label: 'Impact Numbers', id: 'impact-numbers', active: true },
    { label: 'Impact', id: 'impact', active: true },
    { label: 'How It Works', id: 'how-it-works', active: true },
    { label: 'Campus Life', id: 'campus-life', active: true },
    { label: 'Events', id: 'events', active: true },
    { label: 'Announcements', id: 'announcements', active: true },
    { label: 'News', id: 'news', active: true },
    { label: 'Success Stories', id: 'success-stories', active: true },
    { label: 'Partners', id: 'partners', active: true },
    { label: 'FAQ', id: 'faq', active: true },
    { label: 'Contact', id: 'contact', active: true },
  ],
  communityPosts: [
    {
      name: 'Abebe Yosef',
      role: 'Software Engineer',
      company: 'Safaricom Ethiopia',
      message: 'The ASTU-AMS platform helped me connect with mentors and land my dream job. Highly recommend!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      active: true,
    },
    {
      name: 'Helen Mekonnen',
      role: 'Data Analyst',
      company: 'Ethiopian Airlines',
      message: 'Great initiative! The tracer survey process was smooth and the results are valuable for curriculum improvement.',
      active: true,
    },
  ],
};


export default function CmsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { metrics } = usePublicMetrics();

  // Live operational data
  const [items, setItems] = useState<ContentCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');

  // Homepage CMS Live Configuration state
  const [homepageConfig, setHomepageConfig] = useState<HomepageCmsConfig>(() => {
    const saved = homepageCmsService.getSettings();
    return saved ? { ...DEFAULT_HOMEPAGE_CONFIG, ...saved } : DEFAULT_HOMEPAGE_CONFIG;
  });
  const [savingHomepage, setSavingHomepage] = useState(false);
  const [homepageStudioSection, setHomepageStudioSection] = useState<'hero' | 'stats' | 'portals' | 'campusLife' | 'campuses' | 'gallery' | 'faq' | 'employers' | 'nav' | 'community' | 'stories' | 'partners' | 'banner'>('hero');

  // Registrations state
  const [registrations, setRegistrations] = useState<AlumniRegistration[]>([]);
  const [regStats, setRegStats] = useState({ total: 0, etaComplianceRate: 94, employabilityRate: 88 });

  // Events state
  const [events, setEvents] = useState<ApiEvent[]>([]);

  // Inquiries state
  const [inquiries, setInquiries] = useState([
    { id: '1', name: 'Abebe Yosef', subject: 'Transcript Request', message: 'I need my official transcript for job application.', urgency: 'urgent' },
    { id: '2', name: 'Helen Mekonnen', subject: 'Alumni Card', message: 'How can I get my alumni ID card?', urgency: 'normal' },
    { id: '3', name: 'Yonas Bekele', subject: 'Event Registration', message: 'I want to register for the alumni carnival.', urgency: 'responded' },
  ]);

  // Memos state
  const [memos, setMemos] = useState([
    { id: '1', text: 'Review tracer survey responses', completed: false },
    { id: '2', text: 'Update partner organization list', completed: true },
    { id: '3', text: 'Prepare alumni carnival logistics', completed: false },
  ]);
  const [newMemoText, setNewMemoText] = useState('');

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const refreshAllData = useCallback(async (showToast = false) => {
    try {
      showToast ? setRefreshing(true) : setLoading(true);

      // 1. Content items
      const list = await contentService.fetchItemsFromApi();
      const filtered = (list || []).filter((i) => i.title !== 'Homepage CMS Configuration');
      setItems(filtered);

      // 2. Registrations
      const allRegs = registrationService.getRegistrations();
      setRegistrations(allRegs);
      setRegStats(registrationService.getStats(allRegs));

      // 3. Events
      try {
        const evs = await eventsService.getAllEvents();
        if (Array.isArray(evs)) setEvents(evs);
      } catch { /* ignore */ }

      // 4. Homepage CMS Config
      try {
        const cfg = await homepageCmsService.fetchFromApi();
        if (cfg) {
          setHomepageConfig((prev) => ({ ...prev, ...cfg }));
        }
      } catch { /* ignore */ }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (showToast) toast.success('Alumni Office & Portal data updated');
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
      if (showToast) toast.error('Failed to sync portal data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // ─── Handlers: Homepage Live Studio ─────────────────────────────────────────
  const handleSaveHomepageConfig = async () => {
    setSavingHomepage(true);
    try {
      await homepageCmsService.saveSettings(homepageConfig);
      toast.success('Live Homepage published successfully! All visitors see updated content.');
    } catch {
      toast.error('Failed to publish homepage changes');
    } finally {
      setSavingHomepage(false);
    }
  };

  const handleDeleteHeroSlide = (id: string) => {
    setHomepageConfig((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((s) => s.id !== id),
    }));
    toast.success('Slide removed');
  };

  const handleToggleSlideActive = (id: string) => {
    setHomepageConfig((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    }));
  };

  const handleTogglePublish = (item: ContentCardItem) => {
    const updated = items.map((i) =>
      i.id === item.id
        ? { ...i, status: i.status === 'Published' ? ('Draft' as ContentStatus) : ('Published' as ContentStatus) }
        : i
    );
    setItems(updated);
    toast.success(item.status === 'Published' ? 'Item unpublished' : 'Item published');
  };

  const handleResolveInquiry = (id: string) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, urgency: 'responded' as const } : inq))
    );
    toast.success('Inquiry marked as responded');
  };

  const handleToggleMemo = (id: string) => {
    setMemos((prev) =>
      prev.map((memo) => (memo.id === id ? { ...memo, completed: !memo.completed } : memo))
    );
  };

  const handleDeleteMemo = (id: string) => {
    setMemos((prev) => prev.filter((memo) => memo.id !== id));
    toast.success('Task deleted');
  };

  const handleAddMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoText.trim()) return;
    const newMemo = {
      id: Date.now().toString(),
      text: newMemoText,
      completed: false,
    };
    setMemos((prev) => [...prev, newMemo]);
    setNewMemoText('');
    toast.success('Task added');
  };

  const officerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Alumni Affairs Officer';

  const handleExportDashboardPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to export the PDF.');
      return;
    }

    const logoUrl = window.location.origin + '/images/astu-seal-logo.png';
    const totalAlumni = (metrics?.registeredAlumniFormatted || metrics?.registeredAlumni?.toLocaleString() || '1,238+');
    const activeNotices = items.filter((i) => i.status === 'Published').length;
    const pendingReviews = items.filter((i) => i.status === 'Needs Review' || i.status === 'Scheduled').length;
    const totalRegs = registrations.length || regStats.total;
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ASTU Alumni Relations Office — Executive Summary PDF</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #0f172a; background: #fff; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #003366; padding-bottom: 16px; margin-bottom: 20px; }
            .brand { display: flex; align-items: center; gap: 14px; }
            .logo-img { height: 64px; width: 64px; object-fit: contain; }
            .title { font-size: 19px; font-weight: 900; color: #003366; text-transform: uppercase; letter-spacing: 0.5px; }
            .subtitle { font-size: 12px; color: #475569; margin-top: 2px; font-weight: 600; }
            .meta { font-size: 11px; color: #475569; text-align: right; line-height: 1.4; }
            .badge { display: inline-block; background: #dcfce7; color: #15803d; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-top: 4px; font-size: 10px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
            .kpi-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .kpi-value { font-size: 20px; font-weight: 900; color: #003366; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 14px; }
            th { background: #003366; color: #ffffff; text-transform: uppercase; font-size: 10px; font-weight: 700; padding: 9px 10px; text-align: left; }
            td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; vertical-align: middle; }
            tr:nth-child(even) { background: #f8fafc; }
            .footer { margin-top: 36px; border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <img src="${logoUrl}" alt="ASTU Emblem" class="logo-img" onerror="this.src='/images/astu-seal-logo.png'" />
              <div>
                <div class="title">Adama Science & Technology University</div>
                <div class="subtitle">Directorate for Industry Linkage & Alumni Affairs — Executive Summary</div>
              </div>
            </div>
            <div class="meta">
              <div><strong>Report Date:</strong> ${timestamp}</div>
              <div><strong>Officer:</strong> ${officerName}</div>
              <div class="badge">✓ ETA & HERQA Audit Verified</div>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Verified Alumni</div>
              <div class="kpi-value">${totalAlumni}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Active Bulletins</div>
              <div class="kpi-value">${activeNotices}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Roster Registrations</div>
              <div class="kpi-value">${totalRegs}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Pending Reviews</div>
              <div class="kpi-value">${pendingReviews}</div>
            </div>
          </div>

          <h3 style="font-size: 13px; font-weight: 800; color: #003366; margin: 20px 0 8px 0; text-transform: uppercase;">Recent Announcements & Bulletins</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${items.slice(0, 8).map(i => `
                <tr>
                  <td><strong>${i.title}</strong></td>
                  <td>${i.type}</td>
                  <td>${i.author || 'Alumni Office'}</td>
                  <td><span style="font-weight: 700; color: ${i.status === 'Published' ? '#15803d' : '#b45309'}">${i.status}</span></td>
                  <td>${i.publishedAt || i.updatedAt || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Adama Science and Technology University (ASTU) • Main Campus, Adama, Ethiopia</div>
            <div>Official CMS Document Reference: ASTU-CMS-REP-${Date.now()}</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('Generated official ASTU Executive PDF Report.');
  };

  return (
    <div className="space-y-5 pb-16 max-w-7xl mx-auto px-2 sm:px-4">

      {/* ── HERO WELCOME BANNER ────────────────────────────────────────────── */}
      {(() => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        return (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003366] via-[#004080] to-[#1a5276] shadow-sm">
            <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-32 rounded-full bg-[#FFCC00]/6" />

            <div className="relative px-6 py-5 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[11px] text-white/50 font-medium mb-0.5">{today}</p>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {greeting}, <span className="text-[#FFCC00]">{officerName}</span>
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/70 bg-white/10 rounded-lg px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Portal Live
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/70 bg-white/10 rounded-lg px-2.5 py-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    ETA Active
                  </span>
                  {lastSyncTime && (
                    <span className="text-[11px] text-white/40">Last sync {lastSyncTime}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => refreshAllData(true)}
                  disabled={refreshing}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
                  title="Sync data"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleExportDashboardPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  title="Export ASTU Executive Summary PDF with Official Seal"
                >
                  <Printer className="h-3.5 w-3.5 text-[#FFCC00]" />
                  <span>Export PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.open('/', '_blank')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Site</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/cms/content')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFCC00] hover:bg-yellow-300 text-[#003366] text-xs font-extrabold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Notice</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Official Alumni Officer Broadcast Hero Banner */}
      <DashboardBroadcastHero actorRole="ADMIN" className="mb-4" />

      {/* ── 4 STREAMLINED EXECUTIVE KPI CARDS ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Alumni Network */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-[#003366]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Alumni</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{metrics.registeredAlumniFormatted}</span>
            <span className="text-[11px] font-bold text-emerald-600">+12% YoY</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Across {metrics.fieldsOfStudy} specialized faculties</p>
        </div>

        {/* Card 2: ETA Tracer & Employability */}
        <div
          onClick={() => navigate('/cms/registrations')}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer group"
          title="Click to view longitudinal tracer study records"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 transition-colors">
              ETA Tracer & Employability
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {regStats.etaComplianceRate}% / {regStats.employabilityRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Audit-Ready · Employed ≤12 Mo.
          </p>
        </div>

        {/* Card 3: Active Notice Registrations */}
        <div
          onClick={() => navigate('/cms/registrations')}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-amber-500/50 transition-all cursor-pointer group"
          title="Click to view registrant and attendee roster"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-amber-600 transition-colors">
              Notice Registrations
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <ClipboardCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {loading ? '—' : registrations.length}
            </span>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">RSVPs & Surveys</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Across active surveys & reunions</p>
        </div>

        {/* Card 4: Public Homepage CMS */}
        <div
          onClick={() => navigate('/cms/homepage')}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-indigo-500/50 transition-all cursor-pointer group"
          title="Click to open live Homepage Studio"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">
              Homepage Studio
            </span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {homepageConfig.heroSlides.filter((s) => s.active).length} Slides
            </span>
            <span className="text-[11px] font-bold text-indigo-600">Live</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {homepageConfig.partners.length} partners · {homepageConfig.stories.length} stories
          </p>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── DASHBOARD OVERVIEW ─────────────────────────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {!loading && (
        <div className="space-y-4">

        {/* 2-Column Operational Grid */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Left Column: Quick Actions */}
          <div className="space-y-4">

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <Sparkles className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/cms/content')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Newspaper className="h-5 w-5 text-[#003366] dark:text-[#FFCC00]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Announcement</span>
                </button>
                <button
                  onClick={() => navigate('/cms/events')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <CalendarDays className="h-5 w-5 text-[#003366] dark:text-[#FFCC00]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Schedule Event</span>
                </button>
                <button
                  onClick={() => navigate('/cms/homepage')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Globe className="h-5 w-5 text-[#003366] dark:text-[#FFCC00]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Edit Homepage</span>
                </button>
                <button
                  onClick={() => navigate('/cms/registrations')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ClipboardCheck className="h-5 w-5 text-[#003366] dark:text-[#FFCC00]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">View Registrations</span>
                </button>
              </div>
            </div>

            {/* Recent Public Bulletins */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Portal Bulletins</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/cms/content')}
                    className="text-xs font-bold text-[#003366] dark:text-[#FFCC00] hover:underline cursor-pointer"
                  >
                    View All ({items.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700">
                            {item.type}
                          </span>
                          {item.requiresRegistration && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                              RSVP: {item.registeredCount || 0}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                          item.status === 'Published'
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {item.status === 'Published' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Inquiries & Officer Memos */}
            <div className="space-y-6">

              {/* Alumni Inquiries & Requests */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alumni Desk Requests</h3>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {inquiries.filter((i) => i.urgency !== 'responded').length} Pending
                  </span>
                </div>

                <div className="space-y-3">
                  {inquiries.slice(0, 3).map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{inq.name}</span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${inq.urgency === 'urgent' ? 'bg-rose-100 text-rose-800' : inq.urgency === 'responded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                          {inq.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{inq.subject}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{inq.message}</p>
                      {inq.urgency !== 'responded' && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleResolveInquiry(inq.id)}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            Mark as Responded ✓
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Priority Tasks & Memos */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Officer Priority Tasks</h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {memos.filter((m) => m.completed).length}/{memos.length} Done
                  </span>
                </div>

                <div className="space-y-2">
                  {memos.map((memo) => (
                    <div
                      key={memo.id}
                      className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleMemo(memo.id)}
                        className="mt-0.5 text-slate-400 hover:text-[#003366] cursor-pointer"
                      >
                        {memo.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                      <span className={`text-xs flex-1 ${memo.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                        {memo.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMemo(memo.id)}
                        className="text-slate-300 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddMemo} className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    placeholder="Log a new task for the alumni office…"
                    value={newMemoText}
                    onChange={(e) => setNewMemoText(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
