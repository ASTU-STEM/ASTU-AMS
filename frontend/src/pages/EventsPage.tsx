import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  CheckCircle2,
  Wrench,
  AlertCircle,
  QrCode,
  Users,
  Sparkles,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import eventsService, { ApiEvent } from '../features/admin/services/events.service';
import astuBuildingImg from '../assets/imgs/astu-building.jpg';
import gc7Img from '../assets/images/gc7.jpg';
import campus2Img from '../assets/imgs/campus-2.jpeg';

export type EventKind = 'Event' | 'Workshop';
export type CategoryFilter = 'ALL' | 'EVENT' | 'WORKSHOP';
export type DateFilter = 'UPCOMING' | 'PAST' | 'ALL';

export interface DisplayEvent {
  id: string;
  title: string;
  kind: EventKind;
  category: string;
  type?: string;
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
  registered?: boolean;
  source: 'api' | 'cms' | 'default';
}

const EVENTS_PER_PAGE = 9;
const FALLBACK_IMAGE = astuBuildingImg;

const DEFAULT_EVENT_IMAGES: Record<string, string> = {
  'ASTU Alumni Career Summit': astuBuildingImg,
  'ASTU Alumni Career & Innovation Summit': gc7Img,
  'Data Science & Machine Learning Bootcamp': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  'EthiopiaLics International Conference 2025': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  'Cloud Computing Bootcamp': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  'Cloud & DevOps Architecture Bootcamp': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  'AI/ML Research Symposium': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'AI/ML Research & Robotics Symposium': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'ASTU Annual Grand Alumni Homecoming & Gala': campus2Img,
  'Employer Roundtable': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  'CV and Interview Lab': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  'Grant Writing Workshop': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
};

const ASTU_BASE_DEFAULT_EVENTS: DisplayEvent[] = [
  {
    id: "ds-ml-bootcamp",
    title: "Data Science & Machine Learning Bootcamp",
    category: "TECHNICAL TRAINING & LABS",
    type: "bootcamp",
    kind: "Workshop",
    date: "2026-11-20",
    time: "09:00 AM - 04:30 PM",
    location: "Engineering Building Room 305, ASTU Main Campus",
    campus: "ASTU Main Campus",
    description: "Intensive bootcamp covering machine learning, data visualization, and statistical analysis using Python and R. Practical assignments with ASTU real-world datasets and labs.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    speaker: "Dr. Henok Tadesse & Senior AI Engineers",
    seats: "45 / 50 seats registered",
    statusBadge: "Filling Fast",
    level: "Intermediate - Advanced",
    source: "default",
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
    source: "default",
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
    source: "default",
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
    source: "default",
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
    source: "default",
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
    image: campus2Img,
    speaker: "University President & Alumni Honors Panel",
    seats: "1,200 seats",
    statusBadge: "Grand Reunion",
    level: "All Alumni & Families",
    source: "default",
  },
  {
    id: "employer-roundtable-2026",
    title: "Employer & Industry Partner Roundtable",
    category: "EVENT",
    type: "roundtable",
    kind: "Event",
    date: "2026-11-28",
    time: "10:00 AM - 03:00 PM",
    location: "Conference Hall A, Technology Complex",
    campus: "Technology Complex",
    description: "Executive dialogue with national and multinational employers assessing STEM curriculum alignment, tracer study findings, and hiring projections.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    speaker: "Corporate HR Leaders & Academic Deans",
    seats: "80 executive seats",
    statusBadge: "Industry Partner",
    level: "Employers & Deans",
    source: "default",
  },
  {
    id: "cv-interview-lab",
    title: "CV Critique & Mock Interview Laboratory",
    category: "TECHNICAL TRAINING & LABS",
    type: "workshop",
    kind: "Workshop",
    date: "2026-10-15",
    time: "01:30 PM - 05:30 PM",
    location: "Career Center Lab, Student Services Wing",
    campus: "Main Campus",
    description: "One-on-one resume reviews, portfolio feedback, and live mock interview practice conducted by senior ASTU engineering alumni recruiting managers.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    speaker: "Alumni HR Directors",
    seats: "60 attendee slots",
    statusBadge: "Employability Lab",
    level: "Seniors & Fresh Grads",
    source: "default",
  },
  {
    id: "grant-writing-workshop",
    title: "International Research Grant Writing Masterclass",
    category: "TECHNICAL TRAINING & LABS",
    type: "workshop",
    kind: "Workshop",
    date: "2026-11-05",
    time: "09:00 AM - 04:00 PM",
    location: "Postgraduate Hall, Engineering Block C",
    campus: "Engineering Complex",
    description: "In-depth workshop on structuring winning grant proposals for Horizon Europe, DAAD, World Bank, and national technology innovation initiatives.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    speaker: "Research Directorate & Visiting Fellows",
    seats: "75 researchers",
    statusBadge: "Faculty & Postgraduate",
    level: "Advanced Research",
    source: "default",
  },
  {
    id: "iot-embedded-systems-hackathon",
    title: "ASTU IoT & Embedded Systems Hackathon",
    category: "TECHNICAL TRAINING & LABS",
    type: "workshop",
    kind: "Workshop",
    date: "2026-12-18",
    time: "08:00 AM - 08:00 PM",
    location: "Electric & Mechatronics Labs, ASTU",
    campus: "Main Campus",
    description: "48-hour hardware and IoT prototyping challenge solving agricultural monitoring, smart energy grids, and water distribution challenges in the Rift Valley.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    speaker: "ASTU Robotics Club & Industry Mentors",
    seats: "120 participants",
    statusBadge: "Hackathon",
    level: "Open to All Engineers",
    source: "default",
  },
];

/**
 * Normalizes title for deduplication comparison.
 */
function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Parses any date string safely into a timestamp.
 */
function safeDateTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const ts = new Date(dateStr).getTime();
  return isNaN(ts) ? 0 : ts;
}

/**
 * Formats a date into a clean, readable string e.g. "Nov 20, 2026"
 */
function formatEventDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function EventsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query Sync
  const initialCategory = (searchParams.get('category')?.toUpperCase() as CategoryFilter) || 'ALL';
  const initialDateFilter = (searchParams.get('date')?.toUpperCase() as DateFilter) || 'ALL';
  const initialSearch = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(
    ['ALL', 'EVENT', 'WORKSHOP'].includes(initialCategory) ? initialCategory : 'ALL'
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>(
    ['UPCOMING', 'PAST', 'ALL'].includes(initialDateFilter) ? initialDateFilter : 'ALL'
  );
  const [currentPage, setCurrentPage] = useState(isNaN(initialPage) || initialPage < 1 ? 1 : initialPage);

  // Data states
  const [rawEvents, setRawEvents] = useState<DisplayEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User RSVP / Registration state
  const [registeredTitles, setRegisteredTitles] = useState<string[]>([]);
  const [registeringEvent, setRegisteringEvent] = useState<DisplayEvent | null>(null);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAffiliation, setRegAffiliation] = useState('ASTU School of Engineering');
  const [regRole, setRegRole] = useState('Alumni');
  const [showQrModal, setShowQrModal] = useState<DisplayEvent | null>(null);

  // Sync registered events from localStorage
  const refreshRegisteredEvents = useCallback(() => {
    try {
      const stored = localStorage.getItem('astu_user_registered_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRegisteredTitles(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    refreshRegisteredEvents();
    window.addEventListener('storage', refreshRegisteredEvents);
    return () => window.removeEventListener('storage', refreshRegisteredEvents);
  }, [refreshRegisteredEvents]);

  // Fetch and normalize events
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch from Database API
      let apiEvents: ApiEvent[] = [];
      try {
        apiEvents = await eventsService.getAllEvents();
      } catch (err) {
        console.warn('API events query error, continuing with fallback:', err);
      }

      // 2. Fetch from Local CMS Admin Storage if present
      let cmsEvents: any[] = [];
      try {
        const storedCms = localStorage.getItem('astu_ams_cms_events_items');
        if (storedCms) {
          const parsed = JSON.parse(storedCms);
          if (Array.isArray(parsed)) cmsEvents = parsed;
        }
      } catch {}

      // 3. Normalization Pipeline
      const normalizedList: DisplayEvent[] = [];
      const seenTitles = new Set<string>();
      const seenIds = new Set<string>();

      const addEventIfUnique = (item: DisplayEvent) => {
        const normTitle = normalizeTitle(item.title);
        if (!normTitle) return; // Discard corrupted entries with blank titles
        if (seenTitles.has(normTitle) || seenIds.has(item.id)) return;

        seenTitles.add(normTitle);
        seenIds.add(item.id);
        normalizedList.push(item);
      };

      // Ingest API events first (authoritative production data)
      if (Array.isArray(apiEvents) && apiEvents.length > 0) {
        apiEvents.forEach((ev, idx) => {
          if (!ev || !ev.title) return;
          const isWorkshop =
            ev.type === 'Workshop' ||
            ev.type === 'WORKSHOP' ||
            ev.title.toLowerCase().includes('workshop') ||
            ev.title.toLowerCase().includes('bootcamp') ||
            ev.title.toLowerCase().includes('lab');

          const safeImage =
            ev.image ||
            ev.coverImage ||
            ev.bannerUrl ||
            DEFAULT_EVENT_IMAGES[ev.title] ||
            FALLBACK_IMAGE;

          addEventIfUnique({
            id: ev.id || `api-event-${idx}`,
            title: ev.title.trim(),
            kind: isWorkshop ? 'Workshop' : 'Event',
            category: ev.category || (isWorkshop ? 'TECHNICAL TRAINING & LABS' : 'EVENT'),
            type: ev.type,
            date: ev.date || new Date().toISOString(),
            time: '09:00 AM - 05:00 PM',
            location: ev.location || 'ASTU Main Campus, Adama',
            campus: 'ASTU Main Campus',
            description: ev.description || 'Join fellow ASTU alumni and students for an interactive session, expert talks, and networking opportunities.',
            image: safeImage,
            seats: ev.capacity ? `${ev.capacity} seats` : 'Open Registration',
            statusBadge: 'Upcoming',
            registered: Boolean(ev.rsvps && ev.rsvps.length > 0),
            source: 'api',
          });
        });
      }

      // Ingest CMS items
      if (Array.isArray(cmsEvents) && cmsEvents.length > 0) {
        cmsEvents.forEach((cms, idx) => {
          if (!cms || !cms.title) return;
          const isWorkshop = cms.kind === 'Workshop' || cms.title.toLowerCase().includes('workshop') || cms.title.toLowerCase().includes('bootcamp');
          addEventIfUnique({
            id: cms.id || `cms-event-${idx}`,
            title: cms.title.trim(),
            kind: isWorkshop ? 'Workshop' : 'Event',
            category: cms.category || (isWorkshop ? 'TECHNICAL TRAINING & LABS' : 'EVENT'),
            date: cms.date || new Date().toISOString(),
            time: '09:00 AM - 04:00 PM',
            location: cms.location || 'ASTU Campus, Adama',
            description: cms.description || 'Hands-on university event with verified attendance and certification.',
            image: cms.image || DEFAULT_EVENT_IMAGES[cms.title] || FALLBACK_IMAGE,
            statusBadge: cms.status || 'Active',
            source: 'cms',
          });
        });
      }

      // Ingest Base ASTU Default Events (to guarantee full comprehensive catalog)
      ASTU_BASE_DEFAULT_EVENTS.forEach((def) => {
        addEventIfUnique(def);
      });

      setRawEvents(normalizedList);
    } catch (e: any) {
      console.error('Failed to load events directory:', e);
      setError('Unable to load the events directory. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Reset pagination to page 1 whenever filters or search query change (Requirement 7)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    updateUrlParams(val, categoryFilter, dateFilter, 1);
  };

  const handleCategoryChange = (cat: CategoryFilter) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
    updateUrlParams(searchQuery, cat, dateFilter, 1);
  };

  const handleDateFilterChange = (df: DateFilter) => {
    setDateFilter(df);
    setCurrentPage(1);
    updateUrlParams(searchQuery, categoryFilter, df, 1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setDateFilter('ALL');
    setCurrentPage(1);
    updateUrlParams('', 'ALL', 'ALL', 1);
  };

  const updateUrlParams = (q: string, cat: CategoryFilter, df: DateFilter, page: number) => {
    const params: Record<string, string> = {};
    if (q) params.q = q;
    if (cat !== 'ALL') params.category = cat.toLowerCase();
    if (df !== 'ALL') params.date = df.toLowerCase();
    if (page > 1) params.page = page.toString();
    setSearchParams(params, { replace: true });
  };

  // Filter and Sort Pipeline
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return rawEvents
      .filter((ev) => {
        // 1. Search Query Filter (Title, Description, Venue/Location) - Requirement 3
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = ev.title.toLowerCase().includes(q);
          const matchDesc = ev.description.toLowerCase().includes(q);
          const matchVenue = ev.location.toLowerCase().includes(q);
          const matchCategory = ev.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchVenue && !matchCategory) {
            return false;
          }
        }

        // 2. Category Filter (All, Events, Workshops) - Requirement 4
        if (categoryFilter === 'EVENT' && ev.kind !== 'Event') return false;
        if (categoryFilter === 'WORKSHOP' && ev.kind !== 'Workshop') return false;

        // 3. Date Filter (Upcoming, Past, All Dates) - Requirement 5
        const evTs = safeDateTimestamp(ev.date);
        const isUpcoming = evTs >= todayStart;

        if (dateFilter === 'UPCOMING' && !isUpcoming) return false;
        if (dateFilter === 'PAST' && isUpcoming) return false;

        return true;
      })
      .sort((a, b) => {
        // Requirement 6: Sort upcoming events by earliest date first and past events by most recent date first
        const tsA = safeDateTimestamp(a.date);
        const tsB = safeDateTimestamp(b.date);

        if (dateFilter === 'UPCOMING') {
          // Earliest first
          return tsA - tsB;
        }

        if (dateFilter === 'PAST') {
          // Most recent first
          return tsB - tsA;
        }

        // 'ALL' Dates mode:
        // Show upcoming events first (earliest to latest), then past events (most recent to oldest)
        const isUpcomingA = tsA >= todayStart;
        const isUpcomingB = tsB >= todayStart;

        if (isUpcomingA && !isUpcomingB) return -1;
        if (!isUpcomingA && isUpcomingB) return 1;

        if (isUpcomingA && isUpcomingB) {
          return tsA - tsB; // earliest upcoming first
        }

        return tsB - tsA; // most recent past first
      });
  }, [rawEvents, searchQuery, categoryFilter, dateFilter]);

  // Pagination calculation (Requirement 2 & 8)
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedEvents = useMemo(() => {
    const startIdx = (validPage - 1) * EVENTS_PER_PAGE;
    return filteredEvents.slice(startIdx, startIdx + EVENTS_PER_PAGE);
  }, [filteredEvents, validPage]);

  // Page Switch Handler
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    updateUrlParams(searchQuery, categoryFilter, dateFilter, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Image error fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  // Registration modal flow (Requirement 10)
  const openRegisterModal = (ev: DisplayEvent) => {
    if (registeredTitles.includes(ev.title) || registeredTitles.includes(ev.id)) {
      setShowQrModal(ev);
      return;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setRegName(parsed.name || '');
        setRegEmail(parsed.email || '');
      } catch {}
    }
    setRegisteringEvent(ev);
  };

  const handleConfirmRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEvent) return;
    if (!regName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      if (registeringEvent.source === 'api' && !registeringEvent.id.startsWith('api-')) {
        await eventsService.rsvpToEvent(registeringEvent.id, 'GOING');
      }
    } catch (err) {
      console.warn('API RSVP sync warning:', err);
    }

    const updated = Array.from(new Set([...registeredTitles, registeringEvent.title, registeringEvent.id]));
    localStorage.setItem('astu_user_registered_events', JSON.stringify(updated));
    setRegisteredTitles(updated);

    toast.success(`Registration confirmed for "${registeringEvent.title}"!`);
    const registeredTarget = registeringEvent;
    setRegisteringEvent(null);
    setShowQrModal(registeredTarget);
  };

  // Counts for Category Pills
  const counts = useMemo(() => {
    const total = rawEvents.length;
    const eventsCount = rawEvents.filter((e) => e.kind === 'Event').length;
    const workshopsCount = rawEvents.filter((e) => e.kind === 'Workshop').length;
    return { total, eventsCount, workshopsCount };
  }, [rawEvents]);

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-astu-navy to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-astu-red blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1440px]">
          <div className="flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-300 backdrop-blur-md">
              <CalendarDays className="h-4 w-4 text-astu-red" />
              <span>ASTU Campus Calendar & Activities</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Events & Technical Workshops Directory
            </h1>

            <p className="max-w-3xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Connect with fellow ASTU engineers, industry leaders, and researchers. Explore upcoming career summits, hands-on bootcamps, and academic symposiums hosted across our Adama campus.
            </p>
          </div>

          {/* Quick Search Bar inside Banner */}
          <div className="mt-8 max-w-3xl">
            <div className="relative flex items-center rounded-2xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 p-1.5 shadow-2xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all">
              <Search className="h-5 w-5 text-slate-300 ml-3.5 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by event title, description, or venue (e.g. Bootcamp, Senate Hall, AI)..."
                aria-label="Search events"
                className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear search query"
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Control Toolbar: Category Tabs & Date Filters */}
      <nav aria-label="Event directory filters" className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm transition-colors">
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Category Filter Tabs (Requirement 4) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" role="tablist">
              {[
                { id: 'ALL' as CategoryFilter, label: 'All Items', count: counts.total },
                { id: 'EVENT' as CategoryFilter, label: 'Events & Conferences', count: counts.eventsCount },
                { id: 'WORKSHOP' as CategoryFilter, label: 'Workshops & Bootcamps', count: counts.workshopsCount },
              ].map((tab) => {
                const isActive = categoryFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCategoryChange(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-astu-navy text-white shadow-md dark:bg-blue-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Date Filters & Reset Button (Requirement 5 & 9) */}
            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                {[
                  { id: 'UPCOMING' as DateFilter, label: 'Upcoming' },
                  { id: 'PAST' as DateFilter, label: 'Past Events' },
                  { id: 'ALL' as DateFilter, label: 'All Dates' },
                ].map((item) => {
                  const isActive = dateFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleDateFilterChange(item.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-white text-astu-navy shadow-sm dark:bg-slate-900 dark:text-white font-bold'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {(searchQuery || categoryFilter !== 'ALL' || dateFilter !== 'ALL') && (
                <button
                  onClick={handleResetFilters}
                  aria-label="Reset all search filters"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-sm"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-[1440px] w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Results Metadata Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <div>
            Showing{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {filteredEvents.length === 0 ? 0 : (validPage - 1) * EVENTS_PER_PAGE + 1}
            </span>
            {' - '}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(validPage * EVENTS_PER_PAGE, filteredEvents.length)}
            </span>{' '}
            of <span className="font-bold text-slate-900 dark:text-white">{filteredEvents.length}</span> results
            {searchQuery && (
              <span className="ml-2 font-medium text-astu-navy dark:text-sky-300">
                matching "{searchQuery}"
              </span>
            )}
          </div>

          <div className="text-xs">
            {dateFilter === 'UPCOMING' && 'Sorted by earliest upcoming date first'}
            {dateFilter === 'PAST' && 'Sorted by most recent past date first'}
            {dateFilter === 'ALL' && 'Upcoming events first, followed by past events'}
          </div>
        </div>

        {/* Loading State (Requirement 9) */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-pulse"
              >
                <div className="h-48 w-full bg-slate-200 dark:bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="pt-4 flex gap-2">
                    <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State (Requirement 9) */}
        {!loading && error && (
          <div className="my-12 max-w-xl mx-auto rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unable to Load Events</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{error}</p>
            <button
              onClick={loadEvents}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-astu-navy dark:bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-astu-navy/90 dark:hover:bg-blue-500 shadow-sm transition-all"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          </div>
        )}

        {/* Empty State (Requirement 9) */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="my-16 max-w-md mx-auto text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No Events Found</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We couldn't find any campus events matching your current filters. Try expanding your search keyword or switching category tabs.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-astu-navy dark:bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-astu-navy/90 dark:hover:bg-blue-500 shadow-md transition-all active:scale-95"
              >
                <RotateCcw className="h-4 w-4" /> Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Responsive Grid (Requirement 1): 3 cols desktop, 2 cols tablet, 1 col mobile */}
        {!loading && !error && paginatedEvents.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedEvents.map((event) => {
              const isRegistered =
                registeredTitles.includes(event.title) ||
                registeredTitles.includes(event.id) ||
                event.registered;
              const isPast = safeDateTimestamp(event.date) < new Date().setHours(0, 0, 0, 0);

              return (
                <article
                  key={event.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(0,51,102,0.04)] dark:shadow-slate-950/40 hover:shadow-xl hover:shadow-astu-navy/10 dark:hover:shadow-blue-950/20 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Top Image Frame with Consistent Aspect Ratio (Requirement 13) */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={event.image}
                      alt={event.title}
                      onError={handleImageError}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Category Pill Badge (Requirement 11) */}
                    <span
                      className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md ${
                        event.kind === 'Workshop' ? 'bg-amber-600' : 'bg-astu-red'
                      }`}
                    >
                      {event.kind === 'Workshop' ? (
                        <span className="inline-flex items-center gap-1">
                          <Wrench className="h-3 w-3" /> Workshop
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> Event
                        </span>
                      )}
                    </span>

                    {/* Date / Status Pill on Top Right */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {isPast ? (
                        <span className="rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 shadow">
                          Past Event
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                          Upcoming
                        </span>
                      )}
                    </div>

                    {/* Subtitle / Venue Pill on Bottom Left */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <p className="text-[11px] font-semibold text-slate-200 line-clamp-1 drop-shadow-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
                        <span>{event.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      {/* Date & Time Row */}
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        <span className="inline-flex items-center gap-1.5 text-astu-red dark:text-rose-400 font-bold">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          <span>{formatEventDate(event.date)}</span>
                        </span>
                        {event.time && (
                          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{event.time.split(' - ')[0]}</span>
                          </span>
                        )}
                      </div>

                      {/* Event Title */}
                      <h3
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-astu-red dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title={event.title}
                      >
                        {event.title}
                      </h3>

                      {/* Event Description (Requirement 11) */}
                      <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Action Bar: Register | View Details (Requirement 10 & 11) */}
                    <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => openRegisterModal(event)}
                        className={`flex-1 rounded-xl py-2.5 px-3 text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 ${
                          isRegistered
                            ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
                            : isPast
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                            : 'bg-astu-navy text-white hover:bg-astu-navy/90 dark:bg-blue-600 dark:hover:bg-blue-500'
                        }`}
                      >
                        {isRegistered ? '✓ Registered' : isPast ? 'View Summary' : 'Register Now'}
                      </button>

                      <button
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Controls (Requirement 8) */}
        {!loading && !error && totalPages > 1 && (
          <nav
            aria-label="Pagination Navigation"
            className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Page <span className="font-bold text-slate-900 dark:text-white">{validPage}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(validPage - 1)}
                disabled={validPage <= 1}
                aria-label="Go to previous page"
                className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold transition-all ${
                  validPage <= 1
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900 text-slate-400'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-astu-navy'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === validPage;

                // Show first, last, current, and adjacent pages
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= validPage - 1 && pageNum <= validPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={isActive ? 'page' : undefined}
                      className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-astu-navy text-white shadow-md dark:bg-blue-600'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === validPage - 2 || pageNum === validPage + 2) {
                  return (
                    <span key={pageNum} className="px-1 text-slate-400 text-xs">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              {/* Next Button */}
              <button
                onClick={() => goToPage(validPage + 1)}
                disabled={validPage >= totalPages}
                aria-label="Go to next page"
                className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold transition-all ${
                  validPage >= totalPages
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900 text-slate-400'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-astu-navy'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </nav>
        )}
      </main>

      {/* Registration Modal Dialog (Requirement 10) */}
      {registeringEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setRegisteringEvent(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reg-modal-title"
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setRegisteringEvent(null)}
              aria-label="Close registration form"
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 text-xs font-bold text-astu-red uppercase tracking-wider mb-2">
              <CalendarDays className="h-4 w-4" />
              <span>Event Registration</span>
            </div>

            <h3 id="reg-modal-title" className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {registeringEvent.title}
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formatEventDate(registeringEvent.date)} · {registeringEvent.location}
            </p>

            <form onSubmit={handleConfirmRegistration} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Henok Tadesse"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@alumni.astu.edu.et"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+251 9..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="Alumni">Alumni</option>
                    <option value="Graduating Senior">Graduating Senior</option>
                    <option value="Student">Student</option>
                    <option value="Faculty/Researcher">Faculty / Researcher</option>
                    <option value="Employer/Partner">Employer Partner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Affiliation / Department
                </label>
                <input
                  type="text"
                  value={regAffiliation}
                  onChange={(e) => setRegAffiliation(e.target.value)}
                  placeholder="e.g. Electrical & Computer Engineering"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRegisteringEvent(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-astu-navy dark:bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-astu-navy/90 dark:hover:bg-blue-500 shadow-md active:scale-95 transition-all"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Confirmation Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowQrModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registration Confirmed</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {showQrModal.title}
            </p>

            {/* QR Pass Box */}
            <div className="mt-5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex flex-col items-center">
              <QrCode className="h-32 w-32 text-slate-800 dark:text-slate-200" />
              <p className="mt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                PASS: {showQrModal.id.toUpperCase()}
              </p>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {formatEventDate(showQrModal.date)}
              </p>
            </div>

            <button
              onClick={() => setShowQrModal(null)}
              className="mt-5 w-full rounded-xl bg-astu-navy dark:bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-astu-navy/90 dark:hover:bg-blue-500"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
