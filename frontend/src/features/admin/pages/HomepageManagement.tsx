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
  Image,
  ImagePlus,
  Megaphone,
  Newspaper,
  PlayCircle,
  Plus,
  Quote,
  Save,
  ShieldCheck,
  Star,
  Sparkles,
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import ImageUploader from '../components/ImageUploader';
import homepageCmsService, { HomepageCmsConfig } from '../services/homepageCms.service';

/* ─── Types ─── */
interface HeroSlide {
  id: string; image: string; tagline: string; title: string; description: string; active: boolean;
}
interface ImpactStat {
  id: string; label: string; value: string; suffix: string; detail: string; icon: string; active: boolean;
}
interface StakeholderPortal {
  id: string; title: string; icon: string; points: string[]; cta: string; route: string; active: boolean; description?: string;
}
interface CampusLifeCard {
  id: string; title: string; campus: string; description: string; image: string; action: string; active: boolean;
}
interface Campus {
  id: string; name: string; description: string; image: string; active: boolean;
}
interface GalleryImage {
  id: string; title: string; src: string; active: boolean;
}
interface VideoItem {
  id: string; title: string; image: string; active: boolean;
}
interface EventItem {
  id: string; title: string; date: string; location: string; image: string; active: boolean;
}
interface WorkshopItem {
  id: string; title: string; date: string; seats: string; focus: string; active: boolean;
}
interface NewsItem {
  id: string; title: string; date: string; active: boolean;
}
interface Announcement {
  id: string; title: string; date: string; type: string; active: boolean;
}
interface SuccessStory {
  id: string;
  name: string;
  role: string;
  company?: string;
  text: string;
  fullStory?: string;
  image: string;
  active: boolean;
}
interface Partner {
  id: string; name: string; logo?: string; active: boolean;
}
interface Testimonial {
  id: string; quote: string; by: string; active: boolean;
}
interface FaqItem {
  id: string; question: string; answer: string; active: boolean;
}

type SectionTab = 'hero' | 'stats' | 'portals' | 'campus-life' | 'campuses' | 'gallery' | 'video' | 'events' | 'workshops' | 'news' | 'announcements' | 'stories' | 'partners' | 'testimonials' | 'faq' | 'research' | 'career' | 'cta' | 'proposal';

/* ─── Initial Data (mirrors HomePage.tsx) ─── */
const initialHeroSlides: HeroSlide[] = [
  { id: 'HS-1', image: '/src/assets/imgs/astu-building.jpg', tagline: 'Quality Assurance & Accreditation', title: "Connecting ASTU's Excellence to the Global Industry", description: 'A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University.', active: true },
  { id: 'HS-2', image: '/src/assets/imgs/campus-2.jpeg', tagline: 'Enterprise Networking & Placement', title: 'Empowering ASTU Graduates in Modern Workspaces', description: 'Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement.', active: true },
  { id: 'HS-3', image: 'https://images.unsplash.com/photo-1562774053-701939374585', tagline: 'Academic Innovation & Tracer Feedback', title: 'Coordinating Strategic Tracer Studies & Skill Gaps', description: 'Enabling department heads and partner companies to identify technological skill gaps directly from the workforce, securing university accreditation outcomes.', active: true },
];
const initialImpactStats: ImpactStat[] = [];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Building2, LineChart, FileCheck2, MessageSquareText, Briefcase, LockKeyhole, Globe, BookOpen, Star, Handshake, ShieldCheck, Trophy, GraduationCap, Zap,
};

const initialPortals: StakeholderPortal[] = [
  { id: 'SP-1', title: 'Alumni', icon: 'Users', points: ['Create and maintain your professional profile.', 'Access verified job listings and internship opportunities.', 'Complete tracer surveys to guide curriculum development.', 'Mentor current students and connect with peers.'], cta: 'Access Alumni Portal', route: '/info/alumni-portal', active: true },
  { id: 'SP-2', title: 'Employers', icon: 'Briefcase', points: ['Post employment opportunities for ASTU graduates.', 'Search alumni by expertise, skills, and department.', 'Provide feedback to enhance curriculum relevance.'], cta: 'Partner With ASTU', route: '/info/employer-portal', active: true },
  { id: 'SP-3', title: 'Departments', icon: 'LineChart', points: ['Monitor graduate employment outcomes and metrics.', 'Identify skill gaps through employer analytics.', 'Generate accreditation-ready reports.'], cta: 'View Department Analytics', route: '/info/department-portal', active: true },
  { id: 'SP-4', title: 'Registrar', icon: 'FileCheck2', points: ['Validate alumni credentials against SIS records.', 'Process transcript and certificate requests.', 'Send tracer study reminders and audit notifications.'], cta: 'Open Registrar Portal', route: '/info/registrar-portal', active: true },
  { id: 'SP-5', title: 'Administrator', icon: 'LockKeyhole', points: ['Manage users, roles, and department records.', 'Monitor system logs, backups, and security protocols.', 'Oversee institutional analytics and accreditation reports.'], cta: 'Admin Console', route: '/admin', active: true },
];

const initialCampusLife: CampusLifeCard[] = [
  { id: 'CL-1', title: 'Events and Activities', campus: 'Main Campus', description: 'Career expos, alumni reunions, workshops, chapter meetings, and community programs.', image: '/src/assets/imgs/campus-2.jpeg', action: 'View Events', active: true },
  { id: 'CL-2', title: 'Facilities', campus: 'Innovation Spaces', description: 'Laboratories, research centers, libraries, student services, and employer interview rooms.', image: '/src/assets/images/electriclabs.jpeg', action: 'Explore Facilities', active: true },
  { id: 'CL-3', title: 'ASTU Museums & Gallery', campus: 'Campus Gallery', description: 'Research showcases, graduation moments, campus photography, and public video archives.', image: '/src/assets/images/arc.jpg', action: 'View Gallery', active: true },
];

const initialCampuses: Campus[] = [
  { id: 'CM-1', name: 'Main Campus', description: 'Central hub for alumni services, registrar workflows, and institutional engagement.', image: '/src/assets/imgs/astu-building.jpg', active: true },
  { id: 'CM-2', name: 'Engineering Labs', description: 'Applied research, workshops, innovation programs, and industry-linked training.', image: '/src/assets/images/electriclabs.jpeg', active: true },
  { id: 'CM-3', name: 'Graduation & Events Hall', description: 'Ceremonies, career fairs, alumni awards, and university achievement programs.', image: '/src/assets/images/gc7.jpg', active: true },
  { id: 'CM-4', name: 'Research Collaboration Center', description: 'Research publications, industry projects, and department KPI evidence.', image: '/src/assets/images/arc.jpg', active: true },
];

const initialGallery: GalleryImage[] = [
  { id: 'GI-1', title: 'ASTU Main Campus', src: '/src/assets/imgs/astu-building.jpg', active: true },
  { id: 'GI-2', title: 'Innovation and Collaboration', src: '/src/assets/imgs/campus-2.jpeg', active: true },
  { id: 'GI-3', title: 'ASTU Alumni Identity', src: '/src/assets/imgs/astu-logo.jpeg', active: true },
];

// Real repository images only. This previously used an Unsplash stock photo
// captioned "Career Expo Highlights", which rendered unrelated photography as
// an ASTU event on the public homepage.
const initialVideos: VideoItem[] = [
  { id: 'VI-2', title: 'Research & Innovation Forum', image: '/src/assets/images/arc.jpg', active: true },
  { id: 'VI-3', title: 'Graduation Ceremony Replay', image: '/src/assets/images/gc7.jpg', active: true },
];

const initialEvents: EventItem[] = [];

const initialWorkshops: WorkshopItem[] = [];

const initialNewsItems: NewsItem[] = [];

const initialAnnouncements: Announcement[] = [];

const initialStories: SuccessStory[] = [];

const initialTestimonials: Testimonial[] = [];

// Partner logos are asserted relationships with real third-party companies
// (Ethio Telecom, Safaricom, Huawei, CBE). Publishing a logo implies a signed
// partnership, so this starts empty and is populated only from verified deals.
const initialPartners: Partner[] = [];

const initialFaq: FaqItem[] = [
  { id: 'FQ-1', question: 'Who can use ASTU-AMS?', answer: 'Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services.', active: true },
  { id: 'FQ-2', question: 'How are tracer studies used?', answer: 'Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence.', active: true },
  { id: 'FQ-3', question: 'Can employers register events?', answer: 'Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports.', active: true },
  { id: 'FQ-4', question: 'How do I request a transcript?', answer: 'Log into your alumni profile, navigate to "Document Requests", and submit a digital request through the Registrar portal.', active: true },
  { id: 'FQ-5', question: 'What is the Tracer Study?', answer: 'A longitudinal survey that tracks graduate employment outcomes at 6, 12, and 24-month intervals for accreditation.', active: true },
];

/* ─── Tabs config ─── */
const tabConfig: { id: SectionTab; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
  { id: 'hero', label: 'Hero Slider', icon: ImagePlus, count: 0 },
  { id: 'stats', label: 'Impact Stats', icon: BarChart3, count: 0 },
  { id: 'portals', label: 'Stakeholder Portals', icon: Users, count: 0 },
  { id: 'campus-life', label: 'Campus Life', icon: Sparkles, count: 0 },
  { id: 'campuses', label: 'Campuses', icon: Building2, count: 0 },
  { id: 'gallery', label: 'Gallery', icon: Image, count: 0 },
  { id: 'video', label: 'Video Gallery', icon: PlayCircle, count: 0 },
  { id: 'events', label: 'Events', icon: CalendarDays, count: 0 },
  { id: 'workshops', label: 'Workshops', icon: GraduationCap, count: 0 },
  { id: 'news', label: 'Latest News', icon: Newspaper, count: 0 },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, count: 0 },
  { id: 'stories', label: 'Success Stories', icon: Star, count: 0 },
  { id: 'partners', label: 'Partners', icon: Handshake, count: 0 },
  { id: 'testimonials', label: 'Testimonials', icon: Quote, count: 0 },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, count: 0 },
  { id: 'proposal', label: 'Proposal Features', icon: Zap, count: 0 },
];

/* ─── Reusable inline editor row ─── */
function InlineEditor<T extends { id: string; active: boolean }>({
  items, setItems, renderItem, title, onAdd,
}: {
  items: T[]; setItems: React.Dispatch<React.SetStateAction<T[]>>;
  renderItem: (item: T, idx: number) => React.ReactNode;
  title: string; onAdd: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{items.filter(i => i.active).length} active of {items.length} total</span>
        <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-md bg-[#003580]/10 dark:bg-sky-500/20 px-2.5 py-1.5 text-[10px] font-semibold text-[#003580] dark:text-sky-400 hover:bg-[#003580]/20 transition-all cursor-pointer"><Plus className="h-3 w-3" /> Add</button>
      </div>
      {items.map((item, idx) => (
        <div key={item.id} className="group flex items-start gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3 hover:border-[#003580]/20 dark:hover:border-sky-500/30 transition-all">
          <div className="min-w-0 flex-1">{renderItem(item, idx)}</div>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))}
              className={`rounded p-1 transition-all ${item.active ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title={item.active ? 'Deactivate' : 'Activate'}>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { setItems(prev => prev.filter(i => i.id !== item.id)); toast.success('Item removed'); }}
              className="rounded p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-all cursor-pointer" title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Modal helpers ─── */
function useModalState<T>() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const openFor = useCallback((item?: T) => { setEditing(item ?? null); setOpen(true); }, []);
  const close = useCallback(() => { setOpen(false); setEditing(null); }, []);
  return { open, editing, openFor, close };
}

/* ─── Main Component ─── */
export default function HomepageManagement() {
  const [activeTab, setActiveTab] = useState<SectionTab>('hero');
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to the ASTU Alumni Management System, a digital bridge between graduates, employers, departments, and university services.');
  const [welcomeSaved, setWelcomeSaved] = useState(false);

  /* Section States */
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);
  const [impactStats, setImpactStats] = useState<ImpactStat[]>(initialImpactStats);
  const [portals, setPortals] = useState<StakeholderPortal[]>(initialPortals);
  const [campusLife, setCampusLife] = useState<CampusLifeCard[]>(initialCampusLife);
  const [campuses, setCampuses] = useState<Campus[]>(initialCampuses);
  const [gallery, setGallery] = useState<GalleryImage[]>(initialGallery);
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(initialWorkshops);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNewsItems);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [stories, setStories] = useState<SuccessStory[]>(initialStories);
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [faq, setFaq] = useState<FaqItem[]>(initialFaq);

  /* Proposal-specific states */
  const [newsletterEmails, setNewsletterEmails] = useState<string[]>([]);
  // responseRate/submissions/companies were seeded with invented figures
  // (67.9%, 128 submissions, 24 companies) that were published to the public
  // homepage. They now start blank for staff to fill from the real survey and
  // feedback records.
  const [tracerSpotlight, setTracerSpotlight] = useState({
    enabled: true,
    title: 'Tracer Study 2026',
    description: 'Help ASTU maintain accreditation by completing your career outcome survey. Your responses drive curriculum updates and institutional quality assurance.',
    responseRate: '',
    targetBatch: '2024',
    deadline: 'August 31, 2026',
  });
  const [employerFeedback, setEmployerFeedback] = useState({
    enabled: true,
    title: 'Employer Competency Feedback',
    description: 'Partner employers rate graduate competencies to help departments align curricula with industry needs.',
    submissions: 0,
    companies: 0,
  });
  const [mentorshipStats, setMentorshipStats] = useState({
    enabled: false,
    mentors: 0,
    mentees: 0,
    sessions: 0,
  });

  const totalActive = useMemo(() => {
    const all = [...heroSlides, ...impactStats, ...portals, ...campusLife, ...campuses, ...gallery, ...videos, ...events, ...workshops, ...newsItems, ...announcements, ...stories, ...partners, ...testimonials, ...faq];
    return all.filter(i => i.active).length;
  }, [heroSlides, impactStats, portals, campusLife, campuses, gallery, videos, events, workshops, newsItems, announcements, stories, partners, testimonials, faq]);

  const totalSections = useMemo(() => {
    return heroSlides.length + impactStats.length + portals.length + campusLife.length + campuses.length + gallery.length + videos.length + events.length + workshops.length + newsItems.length + announcements.length + stories.length + partners.length + testimonials.length + faq.length;
  }, [heroSlides, impactStats, portals, campusLife, campuses, gallery, videos, events, workshops, newsItems, announcements, stories, partners, testimonials, faq]);

  const isLoaded = useRef(false);

  useEffect(() => {
    const config = homepageCmsService.getSettings();
    if (config) {
      if (config.welcomeMessage) setWelcomeMessage(config.welcomeMessage);
      if (config.heroSlides) setHeroSlides(config.heroSlides);
      if (config.impactStats) setImpactStats(config.impactStats);
      if (config.portals) setPortals(config.portals);
      if (config.campusLife) setCampusLife(config.campusLife);
      if (config.campuses) setCampuses(config.campuses);
      if (config.gallery) setGallery(config.gallery);
      if (config.videos) setVideos(config.videos);
      if (config.events) setEvents(config.events);
      if (config.workshops) setWorkshops(config.workshops);
      if (config.newsItems) setNewsItems(config.newsItems);
      if (config.announcements) setAnnouncements(config.announcements);
      if (config.stories) setStories(config.stories);
      if (config.partners) setPartners(config.partners);
      if (config.testimonials) setTestimonials(config.testimonials);
      if (config.faq) setFaq(config.faq);
    }
    setTimeout(() => {
      isLoaded.current = true;
    }, 100);
  }, []);

  const saveAllConfig = useCallback((showToast = true) => {
    const config: HomepageCmsConfig = {
      welcomeMessage,
      heroSlides,
      impactStats,
      portals,
      campusLife,
      campuses,
      gallery,
      videos,
      events,
      workshops,
      newsItems,
      announcements,
      stories,
      partners,
      testimonials,
      faq,
      tracerSpotlight,
      employerFeedback,
      mentorshipStats,
    };
    homepageCmsService.saveSettings(config);
    if (showToast) {
      toast.success('Homepage CMS published live to backend database & landing page!');
    }
  }, [
    welcomeMessage,
    heroSlides,
    impactStats,
    portals,
    campusLife,
    campuses,
    gallery,
    videos,
    events,
    workshops,
    newsItems,
    announcements,
    stories,
    partners,
    testimonials,
    faq,
    tracerSpotlight,
    employerFeedback,
    mentorshipStats,
  ]);

  useEffect(() => {
    if (!isLoaded.current) return;
    saveAllConfig(false);
  }, [
    welcomeMessage,
    heroSlides,
    impactStats,
    portals,
    campusLife,
    campuses,
    gallery,
    videos,
    events,
    workshops,
    newsItems,
    announcements,
    stories,
    partners,
    testimonials,
    faq,
    tracerSpotlight,
    employerFeedback,
    mentorshipStats,
    saveAllConfig,
  ]);

  const saveWelcome = useCallback(() => {
    setWelcomeSaved(true);
    saveAllConfig(true);
    setTimeout(() => setWelcomeSaved(false), 2000);
  }, [saveAllConfig]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'hero': return <HeroSection heroSlides={heroSlides} setHeroSlides={setHeroSlides} />;
      case 'stats': return <StatsSection impactStats={impactStats} setImpactStats={setImpactStats} />;
      case 'portals': return <PortalsSection portals={portals} setPortals={setPortals} />;
      case 'campus-life': return <CampusLifeSection campusLife={campusLife} setCampusLife={setCampusLife} />;
      case 'campuses': return <CampusesSection campuses={campuses} setCampuses={setCampuses} />;
      case 'gallery': return <GallerySection gallery={gallery} setGallery={setGallery} />;
      case 'video': return <VideoSection videos={videos} setVideos={setVideos} />;
      case 'events': return <EventsSection events={events} setEvents={setEvents} />;
      case 'workshops': return <WorkshopsSection workshops={workshops} setWorkshops={setWorkshops} />;
      case 'news': return <NewsSection newsItems={newsItems} setNewsItems={setNewsItems} />;
      case 'announcements': return <AnnouncementsSection announcements={announcements} setAnnouncements={setAnnouncements} />;
      case 'stories': return <StoriesSection stories={stories} setStories={setStories} />;
      case 'partners': return <PartnersSection partners={partners} setPartners={setPartners} />;
      case 'testimonials': return <TestimonialsSection testimonials={testimonials} setTestimonials={setTestimonials} />;
      case 'faq': return <FaqSection faq={faq} setFaq={setFaq} />;

      /* ─── PROPOSAL FEATURES ─── */
      case 'proposal': {
        return (
          <SectionPanel title="Proposal-Specific Features" subtitle="Content modules derived from the ASTU-AMS project proposal (Tracer Study, Employer Feedback, Mentorship, Newsletter)." icon={Zap}>
            <div className="space-y-6">
              {/* Tracer Study Spotlight */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-sky-400"><FileText className="h-5 w-5" /></span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Tracer Study Spotlight</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">CTA banner for the tracer survey campaign on the homepage.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" checked={tracerSpotlight.enabled} onChange={e => setTracerSpotlight(p => ({ ...p, enabled: e.target.checked }))} className="peer sr-only" />
                    <span className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#003580] dark:peer-checked:bg-sky-600 peer-checked:after:translate-x-full" />
                  </label>
                </div>
                {tracerSpotlight.enabled && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Title</label><input value={tracerSpotlight.title} onChange={e => setTracerSpotlight(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                      <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Batch</label><input value={tracerSpotlight.targetBatch} onChange={e => setTracerSpotlight(p => ({ ...p, targetBatch: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                    </div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Description</label><textarea value={tracerSpotlight.description} onChange={e => setTracerSpotlight(p => ({ ...p, description: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500 resize-none" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Response Rate</label><input value={tracerSpotlight.responseRate} onChange={e => setTracerSpotlight(p => ({ ...p, responseRate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                      <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Deadline</label><input value={tracerSpotlight.deadline} onChange={e => setTracerSpotlight(p => ({ ...p, deadline: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Employer Feedback Portal */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"><Handshake className="h-5 w-5" /></span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Employer Feedback Portal</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Employer competency ratings and skill-gap analytics module.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" checked={employerFeedback.enabled} onChange={e => setEmployerFeedback(p => ({ ...p, enabled: e.target.checked }))} className="peer sr-only" />
                    <span className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#003580] dark:peer-checked:bg-sky-600 peer-checked:after:translate-x-full" />
                  </label>
                </div>
                {employerFeedback.enabled && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Title</label><input value={employerFeedback.title} onChange={e => setEmployerFeedback(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Description</label><textarea value={employerFeedback.description} onChange={e => setEmployerFeedback(p => ({ ...p, description: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500 resize-none" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Submissions</label><input type="number" value={employerFeedback.submissions} onChange={e => setEmployerFeedback(p => ({ ...p, submissions: +e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                      <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Participating Companies</label><input type="number" value={employerFeedback.companies} onChange={e => setEmployerFeedback(p => ({ ...p, companies: +e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mentorship Program Stats */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400"><GraduationCap className="h-5 w-5" /></span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Mentorship Program Stats</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Live counters for the alumni mentorship initiative.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" checked={mentorshipStats.enabled} onChange={e => setMentorshipStats(p => ({ ...p, enabled: e.target.checked }))} className="peer sr-only" />
                    <span className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#003580] dark:peer-checked:bg-sky-600 peer-checked:after:translate-x-full" />
                  </label>
                </div>
                {mentorshipStats.enabled && (
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mentors</label><input type="number" value={mentorshipStats.mentors} onChange={e => setMentorshipStats(p => ({ ...p, mentors: +e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                      <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mentees</label><input type="number" value={mentorshipStats.mentees} onChange={e => setMentorshipStats(p => ({ ...p, mentees: +e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                      <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sessions</label><input type="number" value={mentorshipStats.sessions} onChange={e => setMentorshipStats(p => ({ ...p, sessions: +e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-sky-500" /></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Newsletter Subscribers */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400"><Mail className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">Newsletter Subscribers</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{newsletterEmails.length} subscribed emails (tracked from homepage footer form).</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {newsletterEmails.map((email, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm">
                      <span className="text-slate-700 dark:text-slate-200">{email}</span>
                      <button onClick={() => { setNewsletterEmails(prev => prev.filter((_, i) => i !== idx)); toast.success('Email removed'); }}
                        className="text-rose-400 hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links to existing dedicated pages */}
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-5">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2"><ExternalLink className="h-4 w-4" /> Related Management Pages</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    { label: 'Tracer Survey Builder', path: '/cms/surveys' },
                    { label: 'Jobs & Opportunities', path: '/cms/jobs' },
                    { label: 'Content Governance', path: '/cms/content-governance' },
                    { label: 'Gallery Manager', path: '/cms/gallery' },
                    { label: 'Events & Workshops', path: '/cms/events-workshops' },
                    { label: 'Latest News', path: '/cms/news' },
                    { label: 'FAQ Manager', path: '/cms/faq' },
                    { label: 'Footer Settings', path: '/cms/footer' },
                  ].map(link => (
                    <a key={link.label} href={link.path}
                      className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all">
                      <ArrowRight className="h-3 w-3" /> {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </SectionPanel>
        );
      }

      default:
        return <div className="text-sm text-slate-500 p-8 text-center">Select a section to manage.</div>;
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fade-up 0.35s ease-out both; }
        .tab-active { box-shadow: 0 -2px 0 0 #003580 inset; background: rgba(0,53,128,0.04); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <AdminPageHeader
        title="Homepage Content Management"
        subtitle="Manage every section of the public homepage: hero, stats, portals, galleries, events, news, FAQ, and proposal features."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Homepage' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="info">{totalActive} active items</AdminBadge>
            <button onClick={() => saveAllConfig(true)}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm">
              <Save className="h-3.5 w-3.5" /> Publish All
            </button>
          </div>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: totalSections, icon: Globe, tone: 'text-[#003580] dark:text-sky-400', bg: 'bg-[#003580]/10 dark:bg-sky-950/40' },
          { label: 'Active', value: totalActive, icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Content Tabs', value: tabConfig.length, icon: FileText, tone: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
          { label: 'Sections Managed', value: Object.keys({ heroSlides, impactStats, portals, campusLife, campuses, gallery, videos, events, workshops, newsItems, announcements, stories, partners, testimonials, faq }).length, icon: BarChart3, tone: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="fade-up rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center gap-3" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} ${stat.tone}`}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Welcome Message */}
      <div className="rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Homepage Welcome Message</h2>
          </div>
          <button onClick={saveWelcome}
            className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-all shadow-sm cursor-pointer ${welcomeSaved ? 'bg-emerald-500 text-white' : 'bg-[#1D9E75] text-white hover:brightness-110'}`}>
            <Save className="h-3.5 w-3.5" /> {welcomeSaved ? 'Saved!' : 'Save'}
          </button>
        </div>
        <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)}
          className="mt-3 min-h-20 w-full rounded-[8px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-[#003580] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#003580]/10 resize-none" />
      </div>

      {/* Tab Navigation */}
      <div className="overflow-x-auto hide-scrollbar rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <nav className="flex gap-1 p-1.5 min-w-max">
          {tabConfig.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive ? 'tab-active bg-[#003580]/5 dark:bg-sky-500/15 text-[#003580] dark:text-sky-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="fade-up" key={activeTab}>
        {renderTabContent()}
      </div>
    </div>
  );
}

/* ─── Section Panel Wrapper ─── */
function SectionPanel({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#003580]/10 dark:bg-sky-500/10 text-[#003580] dark:text-sky-400">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}


/* ─── Sub-Components for Tab Sections ─── */
function HeroSection({ heroSlides, setHeroSlides }: { heroSlides: HeroSlide[]; setHeroSlides: React.Dispatch<React.SetStateAction<HeroSlide[]>> }) {
  const modal = useModalState<HeroSlide>();
  const [form, setForm] = useState({ image: '', tagline: '', title: '', description: '' });
  const openAdd = useCallback(() => { setForm({ image: '', tagline: '', title: '', description: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: HeroSlide) => { setForm({ image: item.image, tagline: item.tagline, title: item.title, description: item.description }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (modal.editing) {
      setHeroSlides(prev => prev.map(s => s.id === modal.editing!.id ? { ...s, ...form } : s));
      toast.success('Slide updated');
    } else {
      setHeroSlides(prev => [...prev, { id: `HS-${Date.now()}`, ...form, active: true }]);
      toast.success('Slide created');
    }
    modal.close();
  }, [form, modal, setHeroSlides]);

  return (
    <SectionPanel title="Hero Slider" subtitle="Manage the 3 rotating hero slides on the homepage banner." icon={ImagePlus}>
      <InlineEditor items={heroSlides} setItems={setHeroSlides} title="Slides" onAdd={openAdd}
        renderItem={(slide) => (
          <div className="flex items-center gap-3">
            <div className="h-12 w-20 shrink-0 rounded-md bg-slate-100 overflow-hidden"><img src={slide.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{slide.title}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{slide.tagline}</p>
              <p className="text-xs text-slate-400 truncate">{slide.description.slice(0, 80)}...</p>
            </div>
            <button onClick={() => openEdit(slide)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580] transition-all"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Slide' : 'New Slide'} onClose={modal.close} size="lg">
        <div className="space-y-4 p-1">
          <ImageUploader label="Upload Slide Image" value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} />
          <div><label className="text-xs font-semibold text-slate-500">Tagline</label><input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="e.g. Quality Assurance & Accreditation" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="Slide title" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function StatsSection({ impactStats, setImpactStats }: { impactStats: ImpactStat[]; setImpactStats: React.Dispatch<React.SetStateAction<ImpactStat[]>> }) {
  const modal = useModalState<ImpactStat>();
  const [form, setForm] = useState({ label: '', value: '', suffix: '', detail: '', icon: 'Users' });
  const openAdd = useCallback(() => { setForm({ label: '', value: '', suffix: '+', detail: '', icon: 'Users' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: ImpactStat) => { setForm({ label: item.label, value: item.value, suffix: item.suffix, detail: item.detail, icon: item.icon }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.label.trim() || !form.value.trim()) { toast.error('Label and value are required'); return; }
    if (modal.editing) { setImpactStats(prev => prev.map(s => s.id === modal.editing!.id ? { ...s, ...form } : s)); toast.success('Stat updated'); }
    else { setImpactStats(prev => [...prev, { id: `IS-${Date.now()}`, ...form, active: true }]); toast.success('Stat created'); }
    modal.close();
  }, [form, modal, setImpactStats]);
  const iconOptions = Object.keys(iconMap);
  return (
    <SectionPanel title="Impact Statistics" subtitle="Configure the key metric counters shown below the hero section." icon={BarChart3}>
      <InlineEditor items={impactStats} setItems={setImpactStats} title="Statistics" onAdd={openAdd}
        renderItem={(stat) => {
          const Icon = iconMap[stat.icon] || Users;
          return (
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580]"><Icon className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{stat.value}{stat.suffix} <span className="text-xs font-normal text-slate-500">{stat.label}</span></p>
                <p className="text-xs text-slate-400">{stat.detail}</p>
              </div>
              <button onClick={() => openEdit(stat)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
            </div>
          );
        }}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Stat' : 'New Stat'} onClose={modal.close} size="md">
        <div className="space-y-4 p-1">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500">Value</label><input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="e.g. 1,238" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Suffix</label><input value={form.suffix} onChange={e => setForm(p => ({ ...p, suffix: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="+" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500">Label</label><input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="Registered Alumni Members" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Detail</label><input value={form.detail} onChange={e => setForm(p => ({ ...p, detail: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Icon</label><select value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]">{iconOptions.map(io => <option key={io}>{io}</option>)}</select></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function PortalsSection({ portals, setPortals }: { portals: StakeholderPortal[]; setPortals: React.Dispatch<React.SetStateAction<StakeholderPortal[]>> }) {
  const modal = useModalState<StakeholderPortal>();
  const [form, setForm] = useState({ title: '', icon: 'Users', points: ['', '', ''], cta: '', route: '' });
  const openAdd = useCallback(() => { setForm({ title: '', icon: 'Users', points: ['', '', ''], cta: '', route: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: StakeholderPortal) => {
    setForm({
      title: item.title || '',
      icon: item.icon || 'Users',
      points: Array.isArray(item.points) ? [...item.points] : (item.description ? [item.description] : []),
      cta: item.cta || '',
      route: item.route || '',
    });
    modal.openFor(item);
  }, [modal]);
  const save = useCallback(() => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    const filtered = (form.points || []).filter(p => p.trim());
    if (modal.editing) { setPortals(prev => prev.map(p => p.id === modal.editing!.id ? { ...p, ...form, points: filtered } : p)); toast.success('Portal updated'); }
    else { setPortals(prev => [...prev, { id: `SP-${Date.now()}`, ...form, points: filtered, active: true }]); toast.success('Portal created'); }
    modal.close();
  }, [form, modal, setPortals]);
  const iconOptions = Object.keys(iconMap);
  return (
    <SectionPanel title="Stakeholder Portals" subtitle="Edit the role-based portal cards (Alumni, Employers, Departments, etc.)." icon={Users}>
      <InlineEditor items={portals} setItems={setPortals} title="Portals" onAdd={openAdd}
        renderItem={(portal) => {
          const Icon = iconMap[portal.icon] || Users;
          return (
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580]"><Icon className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{portal.title}</p>
                <p className="text-xs text-slate-400">{portal.cta || 'Portal'} · {(portal.points || []).length} features</p>
              </div>
              <button onClick={() => openEdit(portal)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
            </div>
          );
        }}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Portal' : 'New Portal'} onClose={modal.close} size="lg">
        <div className="space-y-4 p-1">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Icon</label><select value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]">{iconOptions.map(io => <option key={io}>{io}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500">CTA Button</label><input value={form.cta} onChange={e => setForm(p => ({ ...p, cta: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Route</label><input value={form.route} onChange={e => setForm(p => ({ ...p, route: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500">Feature Points (one per line)</label><textarea value={(form.points || []).join('\n')} onChange={e => setForm(p => ({ ...p, points: e.target.value.split('\n') }))} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function CampusLifeSection({ campusLife, setCampusLife }: { campusLife: CampusLifeCard[]; setCampusLife: React.Dispatch<React.SetStateAction<CampusLifeCard[]>> }) {
  const modal = useModalState<CampusLifeCard>();
  const [form, setForm] = useState({ title: '', campus: '', description: '', image: '', action: '' });
  const openAdd = useCallback(() => { setForm({ title: '', campus: '', description: '', image: '', action: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: CampusLifeCard) => { setForm({ title: item.title, campus: item.campus, description: item.description, image: item.image, action: item.action }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (modal.editing) { setCampusLife(prev => prev.map(c => c.id === modal.editing!.id ? { ...c, ...form } : c)); toast.success('Card updated'); }
    else { setCampusLife(prev => [...prev, { id: `CL-${Date.now()}`, ...form, active: true }]); toast.success('Card created'); }
    modal.close();
  }, [form, modal, setCampusLife]);
  return (
    <SectionPanel title="Campus Life Cards" subtitle="Edit the 3 campus life feature cards (Events, Facilities, Museums)." icon={Star}>
      <InlineEditor items={campusLife} setItems={setCampusLife} title="Cards" onAdd={openAdd}
        renderItem={(card) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 shrink-0 rounded-md bg-slate-100 overflow-hidden"><img src={card.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>
            <div><p className="text-sm font-semibold text-slate-900">{card.title}</p><p className="text-xs text-slate-400">{card.campus}</p></div>
            <button onClick={() => openEdit(card)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Card' : 'New Card'} onClose={modal.close} size="lg">
        <div className="space-y-4 p-1">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Campus Label</label><input value={form.campus} onChange={e => setForm(p => ({ ...p, campus: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500">Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" /></div>
          <ImageUploader label="Upload Card Image" value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} />
          <div><label className="text-xs font-semibold text-slate-500">Action Text</label><input value={form.action} onChange={e => setForm(p => ({ ...p, action: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function CampusesSection({ campuses, setCampuses }: { campuses: Campus[]; setCampuses: React.Dispatch<React.SetStateAction<Campus[]>> }) {
  const modal = useModalState<Campus>();
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const openAdd = useCallback(() => { setForm({ name: '', description: '', image: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: Campus) => { setForm({ name: item.name, description: item.description, image: item.image }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (modal.editing) { setCampuses(prev => prev.map(c => c.id === modal.editing!.id ? { ...c, ...form } : c)); toast.success('Campus updated'); }
    else { setCampuses(prev => [...prev, { id: `CM-${Date.now()}`, ...form, active: true }]); toast.success('Campus created'); }
    modal.close();
  }, [form, modal, setCampuses]);
  return (
    <SectionPanel title="Campuses" subtitle="Manage the campus location cards displayed on the homepage." icon={Building2}>
      <InlineEditor items={campuses} setItems={setCampuses} title="Campuses" onAdd={openAdd}
        renderItem={(campus) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 shrink-0 rounded-md bg-slate-100 overflow-hidden"><img src={campus.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>
            <div><p className="text-sm font-semibold text-slate-900">{campus.name}</p><p className="text-xs text-slate-400 truncate max-w-[200px]">{campus.description}</p></div>
            <button onClick={() => openEdit(campus)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Campus' : 'New Campus'} onClose={modal.close} size="lg">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" /></div>
          <ImageUploader label="Upload Campus Image" value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function GallerySection({ gallery, setGallery }: { gallery: GalleryImage[]; setGallery: React.Dispatch<React.SetStateAction<GalleryImage[]>> }) {
  const modal = useModalState<GalleryImage>();
  const [form, setForm] = useState({ title: '', src: '' });
  const openAdd = useCallback(() => { setForm({ title: '', src: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: GalleryImage) => { setForm({ title: item.title, src: item.src }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (modal.editing) { setGallery(prev => prev.map(g => g.id === modal.editing!.id ? { ...g, ...form } : g)); toast.success('Image updated'); }
    else { setGallery(prev => [...prev, { id: `GI-${Date.now()}`, ...form, active: true }]); toast.success('Image added'); }
    modal.close();
  }, [form, modal, setGallery]);
  return (
    <SectionPanel title="Gallery Images" subtitle="Manage the photo gallery displayed on the homepage." icon={Image}>
      <InlineEditor items={gallery} setItems={setGallery} title="Images" onAdd={openAdd}
        renderItem={(img) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 shrink-0 rounded-md bg-slate-100 overflow-hidden"><img src={img.src} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>
            <div><p className="text-sm font-semibold text-slate-900">{img.title}</p></div>
            <button onClick={() => openEdit(img)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Image' : 'Add Image'} onClose={modal.close} size="md">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          <ImageUploader label="Upload Photo" value={form.src} onChange={url => setForm(p => ({ ...p, src: url }))} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Add'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function VideoSection({ videos, setVideos }: { videos: VideoItem[]; setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>> }) {
  const modal = useModalState<VideoItem>();
  const [form, setForm] = useState({ title: '', image: '' });
  const openAdd = useCallback(() => { setForm({ title: '', image: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: VideoItem) => { setForm({ title: item.title, image: item.image }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (modal.editing) { setVideos(prev => prev.map(v => v.id === modal.editing!.id ? { ...v, ...form } : v)); toast.success('Video updated'); }
    else { setVideos(prev => [...prev, { id: `VI-${Date.now()}`, ...form, active: true }]); toast.success('Video added'); }
    modal.close();
  }, [form, modal, setVideos]);
  return (
    <SectionPanel title="Video Gallery" subtitle="Manage video thumbnails and titles for the homepage video gallery." icon={PlayCircle}>
      <InlineEditor items={videos} setItems={setVideos} title="Videos" onAdd={openAdd}
        renderItem={(video) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 shrink-0 rounded-md bg-slate-100 overflow-hidden"><img src={video.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>
            <div><p className="text-sm font-semibold text-slate-900">{video.title}</p></div>
            <button onClick={() => openEdit(video)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Video' : 'Add Video'} onClose={modal.close} size="md">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          <ImageUploader label="Upload Thumbnail Image" value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Add'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function EventsSection({ events, setEvents }: { events: EventItem[]; setEvents: React.Dispatch<React.SetStateAction<EventItem[]>> }) {
  const modal = useModalState<EventItem>();
  const [form, setForm] = useState({ title: '', date: '', location: '', image: '' });
  const openAdd = useCallback(() => { setForm({ title: '', date: '', location: '', image: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: EventItem) => { setForm({ title: item.title, date: item.date, location: item.location, image: item.image }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (modal.editing) { setEvents(prev => prev.map(e => e.id === modal.editing!.id ? { ...e, ...form } : e)); toast.success('Event updated'); }
    else { setEvents(prev => [...prev, { id: `EV-${Date.now()}`, ...form, active: true }]); toast.success('Event created'); }
    modal.close();
  }, [form, modal, setEvents]);
  return (
    <SectionPanel title="Events" subtitle="Manage the featured events shown on the homepage." icon={CalendarDays}>
      <InlineEditor items={events} setItems={setEvents} title="Events" onAdd={openAdd}
        renderItem={(ev) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 shrink-0 rounded-md bg-slate-100 overflow-hidden"><img src={ev.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>
            <div><p className="text-sm font-semibold text-slate-900">{ev.title}</p><p className="text-xs text-slate-400">{ev.date} · {ev.location}</p></div>
            <button onClick={() => openEdit(ev)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Event' : 'New Event'} onClose={modal.close} size="lg">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500">Date</label><input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="April 25-26, 2026" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Location</label><input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          </div>
          <ImageUploader label="Upload Event Banner Image" value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function WorkshopsSection({ workshops, setWorkshops }: { workshops: WorkshopItem[]; setWorkshops: React.Dispatch<React.SetStateAction<WorkshopItem[]>> }) {
  const modal = useModalState<WorkshopItem>();
  const [form, setForm] = useState({ title: '', date: '', seats: '', focus: '' });
  const openAdd = useCallback(() => { setForm({ title: '', date: '', seats: '', focus: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: WorkshopItem) => { setForm({ title: item.title, date: item.date, seats: item.seats, focus: item.focus }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (modal.editing) { setWorkshops(prev => prev.map(w => w.id === modal.editing!.id ? { ...w, ...form } : w)); toast.success('Workshop updated'); }
    else { setWorkshops(prev => [...prev, { id: `WS-${Date.now()}`, ...form, active: true }]); toast.success('Workshop created'); }
    modal.close();
  }, [form, modal, setWorkshops]);
  return (
    <SectionPanel title="Workshops" subtitle="Manage the workshop cards shown on the homepage." icon={GraduationCap}>
      <InlineEditor items={workshops} setItems={setWorkshops} title="Workshops" onAdd={openAdd}
        renderItem={(ws) => (
          <div className="flex items-center gap-3">
            <div><p className="text-sm font-semibold text-slate-900">{ws.title}</p><p className="text-xs text-slate-400">{ws.date} · {ws.seats} · {ws.focus}</p></div>
            <button onClick={() => openEdit(ws)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Workshop' : 'New Workshop'} onClose={modal.close} size="md">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500">Date</label><input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Seats</label><input value={form.seats} onChange={e => setForm(p => ({ ...p, seats: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="120 seats" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500">Focus Area</label><input value={form.focus} onChange={e => setForm(p => ({ ...p, focus: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="Research & Innovation" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function NewsSection({ newsItems, setNewsItems }: { newsItems: NewsItem[]; setNewsItems: React.Dispatch<React.SetStateAction<NewsItem[]>> }) {
  const modal = useModalState<NewsItem>();
  const [form, setForm] = useState({ title: '', date: '' });
  const openAdd = useCallback(() => { setForm({ title: '', date: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: NewsItem) => { setForm({ title: item.title, date: item.date }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (modal.editing) { setNewsItems(prev => prev.map(n => n.id === modal.editing!.id ? { ...n, ...form } : n)); toast.success('News updated'); }
    else { setNewsItems(prev => [...prev, { id: `NW-${Date.now()}`, ...form, active: true }]); toast.success('News item created'); }
    modal.close();
  }, [form, modal, setNewsItems]);
  return (
    <SectionPanel title="Latest News" subtitle="Manage the news articles displayed in the Latest News section." icon={Newspaper}>
      <InlineEditor items={newsItems} setItems={setNewsItems} title="News" onAdd={openAdd}
        renderItem={(nw) => (
          <div className="flex items-center gap-3">
            <div><p className="text-sm font-semibold text-slate-900">{nw.title}</p><p className="text-xs text-slate-400">{nw.date}</p></div>
            <button onClick={() => openEdit(nw)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit News' : 'New News'} onClose={modal.close} size="md">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Date</label><input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function AnnouncementsSection({ announcements, setAnnouncements }: { announcements: Announcement[]; setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>> }) {
  const modal = useModalState<Announcement>();
  const [form, setForm] = useState({ title: '', date: '', type: 'Alumni Announcement' });
  const openAdd = useCallback(() => { setForm({ title: '', date: '', type: 'Alumni Announcement' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: Announcement) => { setForm({ title: item.title, date: item.date, type: item.type }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (modal.editing) { setAnnouncements(prev => prev.map(a => a.id === modal.editing!.id ? { ...a, ...form } : a)); toast.success('Announcement updated'); }
    else { setAnnouncements(prev => [...prev, { id: `AN-${Date.now()}`, ...form, active: true }]); toast.success('Announcement created'); }
    modal.close();
  }, [form, modal, setAnnouncements]);
  return (
    <SectionPanel title="Announcements" subtitle="Manage the official announcement notices section." icon={Megaphone}>
      <InlineEditor items={announcements} setItems={setAnnouncements} title="Announcements" onAdd={openAdd}
        renderItem={(ann) => (
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-astu-red shrink-0" />
            <div><p className="text-sm font-semibold text-slate-900">{ann.title}</p><p className="text-xs text-slate-400">{ann.type} · {ann.date}</p></div>
            <button onClick={() => openEdit(ann)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Announcement' : 'New Announcement'} onClose={modal.close} size="lg">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500">Date</label><input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Type</label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]">
              {['Alumni Announcement', 'Employer Announcement', 'Alumni Achievement', 'Campus Notice', 'Academic Calendar'].map(t => <option key={t}>{t}</option>)}
            </select></div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function StoriesSection({ stories, setStories }: { stories: SuccessStory[]; setStories: React.Dispatch<React.SetStateAction<SuccessStory[]>> }) {
  const modal = useModalState<SuccessStory>();
  const [form, setForm] = useState({ name: '', role: '', company: '', text: '', fullStory: '', image: '' });
  const openAdd = useCallback(() => {
    setForm({ name: '', role: '', company: '', text: '', fullStory: '', image: '' });
    modal.openFor();
  }, [modal]);
  const openEdit = useCallback((item: SuccessStory) => {
    setForm({
      name: item.name,
      role: item.role,
      company: item.company || '',
      text: item.text,
      fullStory: item.fullStory || '',
      image: item.image,
    });
    modal.openFor(item);
  }, [modal]);
  const save = useCallback(() => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.text.trim()) { toast.error('Short story text is required'); return; }
    if (modal.editing) {
      setStories((prev) => prev.map((s) => (s.id === modal.editing!.id ? { ...s, ...form } : s)));
      toast.success('Story updated');
    } else {
      setStories((prev) => [...prev, { id: `SS-${Date.now()}`, ...form, active: true }]);
      toast.success('Story created');
    }
    modal.close();
  }, [form, modal, setStories]);
  return (
    <SectionPanel title="Success Stories" subtitle="Alumni stories shown on the public homepage. Upload a photo for each graduate." icon={Star}>
      <InlineEditor items={stories} setItems={setStories} title="Stories" onAdd={openAdd}
        renderItem={(story) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 overflow-hidden">
              {story.image ? (
                <img
                  src={story.image}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{story.name}</p>
              <p className="text-xs text-slate-400">
                {story.role}{story.company ? ` · ${story.company}` : ''}
              </p>
            </div>
            <button onClick={() => openEdit(story)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Story' : 'New Story'} onClose={modal.close} size="lg">
        <div className="space-y-4 p-1">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500">Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Role</label><input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500">Company</label><input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="e.g. Safaricom Ethiopia" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Short excerpt (homepage card)</label><textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Full story (detail page)</label><textarea value={form.fullStory} onChange={e => setForm(p => ({ ...p, fullStory: e.target.value }))} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" /></div>
          <ImageUploader label="Upload Photo / Headshot" value={form.image} onChange={url => setForm(p => ({ ...p, image: url }))} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function PartnersSection({ partners, setPartners }: { partners: Partner[]; setPartners: React.Dispatch<React.SetStateAction<Partner[]>> }) {
  const modal = useModalState<Partner>();
  const [form, setForm] = useState({ name: '', logo: '' });
  const openAdd = useCallback(() => { setForm({ name: '', logo: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: Partner) => { setForm({ name: item.name, logo: item.logo || '' }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (modal.editing) { setPartners(prev => prev.map(p => p.id === modal.editing!.id ? { ...p, ...form } : p)); toast.success('Partner updated'); }
    else { setPartners(prev => [...prev, { id: `PT-${Date.now()}`, ...form, active: true }]); toast.success('Partner added'); }
    modal.close();
  }, [form, modal, setPartners]);
  return (
    <SectionPanel title="Partner Companies" subtitle="Manage partner names and logos shown on the homepage." icon={Handshake}>
      <InlineEditor items={partners} setItems={setPartners} title="Partners" onAdd={openAdd}
        renderItem={(partner) => (
          <div className="flex items-center gap-3">
            {partner.logo ? (
              <img src={partner.logo} alt="" className="h-8 w-8 rounded-lg object-contain bg-slate-50" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-astu-navy text-white text-xs font-bold">{partner.name.slice(0, 2).toUpperCase()}</span>
            )}
            <p className="text-sm font-semibold text-slate-900">{partner.name}</p>
            <button onClick={() => openEdit(partner)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Partner' : 'Add Partner'} onClose={modal.close} size="md">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Company Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="e.g. Ethio Telecom" /></div>
          <ImageUploader label="Partner Logo" value={form.logo} onChange={url => setForm(p => ({ ...p, logo: url }))} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Add'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function TestimonialsSection({ testimonials, setTestimonials }: { testimonials: Testimonial[]; setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>> }) {
  const modal = useModalState<Testimonial>();
  const [form, setForm] = useState({ quote: '', by: '' });
  const openAdd = useCallback(() => { setForm({ quote: '', by: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: Testimonial) => { setForm({ quote: item.quote, by: item.by }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.quote.trim() || !form.by.trim()) { toast.error('Both quote and author are required'); return; }
    if (modal.editing) { setTestimonials(prev => prev.map(t => t.id === modal.editing!.id ? { ...t, ...form } : t)); toast.success('Testimonial updated'); }
    else { setTestimonials(prev => [...prev, { id: `TT-${Date.now()}`, ...form, active: true }]); toast.success('Testimonial created'); }
    modal.close();
  }, [form, modal, setTestimonials]);
  return (
    <SectionPanel title="Testimonials" subtitle="Manage the testimonial quotes from stakeholders." icon={Quote}>
      <InlineEditor items={testimonials} setItems={setTestimonials} title="Testimonials" onAdd={openAdd}
        renderItem={(tt) => (
          <div className="flex items-center gap-3">
            <Quote className="h-5 w-5 text-astu-red shrink-0" />
            <div><p className="text-sm font-semibold text-slate-900">&ldquo;{tt.quote.length > 60 ? tt.quote.slice(0, 60) + '...' : tt.quote}&rdquo;</p><p className="text-xs text-slate-400">&mdash; {tt.by}</p></div>
            <button onClick={() => openEdit(tt)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit Testimonial' : 'New Testimonial'} onClose={modal.close} size="lg">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Quote</label><textarea value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Author</label><input value={form.by} onChange={e => setForm(p => ({ ...p, by: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="Department Head" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}

function FaqSection({ faq, setFaq }: { faq: FaqItem[]; setFaq: React.Dispatch<React.SetStateAction<FaqItem[]>> }) {
  const modal = useModalState<FaqItem>();
  const [form, setForm] = useState({ question: '', answer: '' });
  const openAdd = useCallback(() => { setForm({ question: '', answer: '' }); modal.openFor(); }, [modal]);
  const openEdit = useCallback((item: FaqItem) => { setForm({ question: item.question, answer: item.answer }); modal.openFor(item); }, [modal]);
  const save = useCallback(() => {
    if (!form.question.trim() || !form.answer.trim()) { toast.error('Both question and answer are required'); return; }
    if (modal.editing) { setFaq(prev => prev.map(f => f.id === modal.editing!.id ? { ...f, ...form } : f)); toast.success('FAQ updated'); }
    else { setFaq(prev => [...prev, { id: `FQ-${Date.now()}`, ...form, active: true }]); toast.success('FAQ created'); }
    modal.close();
  }, [form, modal, setFaq]);
  return (
    <SectionPanel title="FAQ Management" subtitle="Manage the frequently asked questions section (now rendered on homepage)." icon={HelpCircle}>
      <InlineEditor items={faq} setItems={setFaq} title="FAQs" onAdd={openAdd}
        renderItem={(fq) => (
          <div className="flex items-center gap-3">
            <HelpCircle className="h-4 w-4 text-astu-red shrink-0" />
            <div><p className="text-sm font-semibold text-slate-900">{fq.question}</p><p className="text-xs text-slate-400 line-clamp-1">{fq.answer}</p></div>
            <button onClick={() => openEdit(fq)} className="ml-auto rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#003580]"><Edit3 className="h-3.5 w-3.5" /></button>
          </div>
        )}
      />
      <AdminModal open={modal.open} title={modal.editing ? 'Edit FAQ' : 'New FAQ'} onClose={modal.close} size="lg">
        <div className="space-y-4 p-1">
          <div><label className="text-xs font-semibold text-slate-500">Question</label><input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" /></div>
          <div><label className="text-xs font-semibold text-slate-500">Answer</label><textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={modal.close} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} className="rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">{modal.editing ? 'Update' : 'Create'}</button>
        </div>
      </AdminModal>
    </SectionPanel>
  );
}
