import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Lock,
  Edit3,
  Users,
  Briefcase,
  LineChart,
  FileCheck2,
  Building2,
  Globe,
  Star,
  Zap,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Newspaper,
  ShieldCheck,
  Trophy,
  ExternalLink,
  Search,
  Bell,
  Image as ImageIcon,
} from 'lucide-react';
import {
  HeroSlide,
  ImpactStat,
  StakeholderPortal,
  CampusLifeCard,
  Campus,
  GalleryImage,
  EventItem,
  WorkshopItem,
  Announcement,
  NewsItem,
  Partner,
  FaqItem,
} from '../services/homepageCms.service';
import { DetailPageItem } from '../services/detailPages.data';

export interface HomepageLivePreviewCanvasProps {
  deviceView?: 'desktop' | 'tablet' | 'mobile';
  activeSection?: string;
  welcomeMessage: string;
  welcomeEnabled: boolean;
  heroBadge: string;
  heroButtons: {
    primaryText: string;
    primaryLink: string;
    secondaryText: string;
    secondaryLink: string;
  };
  heroSlides: HeroSlide[];
  impactHeaders: {
    eyebrow: string;
    title: string;
    description: string;
  };
  impactStats: ImpactStat[];
  portalsHeaders: {
    eyebrow: string;
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
  portals: StakeholderPortal[];
  campusLifeHeaders: {
    eyebrow: string;
    title: string;
    description: string;
  };
  campusLife: CampusLifeCard[];
  campuses: Campus[];
  gallery: GalleryImage[];
  galleryHeaders?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  eventsHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
    viewAllText: string;
    viewAllLink: string;
  };
  events?: EventItem[];
  workshops?: WorkshopItem[];
  announcementsHeaders?: {
    eyebrow: string;
    title: string;
    subscribeTitle: string;
    subscribeDesc: string;
  };
  announcements?: Announcement[];
  newsItems?: NewsItem[];
  partnersHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  partners?: Partner[];
  accreditation?: {
    eyebrow: string;
    title: string;
    description: string;
    point1Title: string;
    point1Desc: string;
    point2Title: string;
    point2Desc: string;
    buttonText: string;
    buttonLink: string;
    image1: string;
    image2: string;
  };
  faqHeaders: {
    eyebrow: string;
    title: string;
    subtitle?: string;
    description?: string;
  };
  faq: FaqItem[];
  ctaSection: {
    enabled: boolean;
    title: string;
    subtitle: string;
    primaryText: string;
    primaryLink: string;
    secondaryText: string;
    secondaryLink: string;
  };
  footer: {
    address: string;
    phone: string;
    email: string;
    poBox: string;
    copyright: string;
  };
  detailPages?: Record<string, DetailPageItem>;
  selectedDetailSlug?: string;
  onSectionClick?: (sectionId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Briefcase,
  LineChart,
  FileCheck2,
  Building2,
  Globe,
  Star,
  Zap,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Newspaper,
  ShieldCheck,
  Trophy,
  Award: Trophy,
};

function getDynamicStatIcon(stat: ImpactStat, idx: number) {
  if (stat.icon && iconMap[stat.icon]) return iconMap[stat.icon];
  const defaults = [Users, BookOpen, Building2, LineChart];
  return defaults[idx % defaults.length];
}

export default function HomepageLivePreviewCanvas({
  deviceView = 'desktop',
  activeSection = 'hero',
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
  gallery = [],
  galleryHeaders = {
    eyebrow: 'CAMPUS GALLERY',
    title: 'Campus Life & Moments',
    subtitle: 'A glimpse of life at ASTU — research, innovation, graduation ceremonies, and alumni milestones.',
    buttonText: 'View All Gallery',
    buttonLink: '/gallery',
  },
  eventsHeaders,
  events = [],
  workshops = [],
  announcementsHeaders,
  announcements = [],
  partnersHeaders,
  partners = [],
  accreditation,
  faqHeaders,
  faq,
  ctaSection,
  footer,
  detailPages,
  selectedDetailSlug,
  onSectionClick,
}: HomepageLivePreviewCanvasProps) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>(faq[0]?.id || null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSlides = heroSlides.filter((s) => s.active !== false);
  const currentSlide = activeSlides[activeSlideIdx] || activeSlides[0] || {
    id: 'HS-1',
    image: '/images/astu-building.jpg',
    tagline: 'Quality Assurance & Accreditation',
    title: 'Modern Workplace Opportunities',
    description: 'Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement across 5 fields of study.',
  };

  // Auto-scroll preview canvas to clicked section
  useEffect(() => {
    if (!activeSection || !containerRef.current) return;
    const targetMap: Record<string, string> = {
      hero: 'preview-section-hero',
      impact: 'preview-section-impact',
      portals: 'preview-section-portals',
      'campus-life': 'preview-section-campus-life',
      gallery: 'preview-section-gallery',
      'events-news': 'preview-section-events-news',
      'partners-portal': 'preview-section-partners-portal',
      'accreditation-faq': 'preview-section-accreditation-faq',
      'footer-cta': 'preview-section-footer-cta',
      'detail-pages': 'preview-section-detail-pages',
    };
    const elId = targetMap[activeSection] || `preview-section-${activeSection}`;
    const el = containerRef.current.querySelector(`#${elId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSection]);

  const activeDetail = detailPages?.[selectedDetailSlug || ''];
  const iw = deviceView === 'mobile' ? 'max-w-[420px]' : deviceView === 'tablet' ? 'max-w-[820px]' : 'max-w-full';

  function SectionBadge({ id, label = 'Editing This Section' }: { id: string; label?: string }) {
    if (activeSection !== id) return null;
    return (
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-lg bg-amber-400 text-slate-950 px-3 py-1 text-[10px] font-black shadow-md pointer-events-none ring-2 ring-white">
        <Edit3 className="h-3 w-3" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden shadow-xs">
      {/* Browser address bar */}
      <div className={`mx-auto w-full ${iw} flex items-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-800 border-x border-t border-slate-300 dark:border-slate-700 rounded-t-xl text-[11px]`}>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-3 py-0.5 rounded-md border border-slate-300/50 dark:border-slate-700 min-w-0">
          <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
          <span className="truncate text-slate-600 dark:text-slate-300 font-mono text-[10px]">
            https://astu-ams.edu.et{activeSection === 'detail-pages' ? `/info/${selectedDetailSlug || 'overview'}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Exact Live Canvas
        </div>
      </div>

      {/* Viewport Container */}
      <div
        ref={containerRef}
        className={`mx-auto w-full ${iw} h-[820px] overflow-y-auto bg-white dark:bg-slate-900 border-x border-b border-slate-300 dark:border-slate-700 shadow-xl rounded-b-xl scroll-smooth select-none`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* ── 0. TOP INSTITUTIONAL BAR (MATCHES SCREENSHOT) ── */}
        <div className="bg-[#002244] text-white/90 px-4 py-1.5 text-[10px] font-medium flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-white/80">admin@astu.edu.et</span>
            <span className="text-white/80">+251 22 110 0001</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hover:underline cursor-pointer">Login</span>
            <span className="text-white/40">|</span>
            <span className="hover:underline cursor-pointer">Register</span>
          </div>
        </div>

        {/* ── 0.1 WELCOME ALERT TICKER BANNER ── */}
        {welcomeEnabled && (
          <div
            id="preview-section-hero"
            onClick={() => onSectionClick?.('hero')}
            className={`cursor-pointer ${activeSection === 'hero' ? 'ring-2 ring-inset ring-amber-400' : ''}`}
          >
            <div className="bg-[#001730] text-amber-300 px-4 py-1.5 text-[10px] text-center font-semibold flex items-center justify-center gap-2 border-b border-white/5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              <span className="truncate">{welcomeMessage}</span>
            </div>
          </div>
        )}

        {/* ── 0.2 MAIN NAVBAR (MATCHES SCREENSHOT) ── */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/astu-seal-logo.png"
              alt="ASTU"
              className="h-8 w-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/astu-logo.jpeg'; }}
            />
            <div>
              <span className="text-xs font-black tracking-tight text-[#003366] dark:text-sky-300 block">ASTU-AMS</span>
              <span className="text-[8px] font-bold text-slate-400 tracking-wider block -mt-0.5">ALUMNI MANAGEMENT SYSTEM</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span className="text-[#003366] dark:text-sky-400 flex items-center gap-1">🏠 Home</span>
            <span className="hover:text-[#003366] cursor-pointer">Partners</span>
            <span className="hover:text-[#003366] cursor-pointer flex items-center gap-0.5">About <ChevronDown className="h-2.5 w-2.5" /></span>
            <span className="hover:text-[#003366] cursor-pointer flex items-center gap-0.5">Services <ChevronDown className="h-2.5 w-2.5" /></span>
            <span className="hover:text-[#003366] cursor-pointer flex items-center gap-0.5">Media <ChevronDown className="h-2.5 w-2.5" /></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1 text-[10px] text-slate-400 w-28">
              <Search className="h-3 w-3" />
              <span>Search...</span>
            </div>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600 cursor-pointer">
              <Bell className="h-3.5 w-3.5" />
            </span>
            <span className="rounded-lg bg-[#003366] text-white px-3 py-1.5 text-[10px] font-bold shadow-xs cursor-pointer hover:bg-[#002244]">
              Join Network
            </span>
          </div>
        </div>

        {/* ── 1. HERO SECTION (MATCHES SCREENSHOT) ── */}
        <div
          id="preview-section-hero"
          onClick={() => onSectionClick?.('hero')}
          className={`relative overflow-hidden text-white cursor-pointer transition-all ${activeSection === 'hero' ? 'ring-4 ring-inset ring-amber-400' : ''}`}
          style={{
            background: 'linear-gradient(180deg, #001730 0%, #002244 50%, #003366 100%)',
            minHeight: '280px',
          }}
        >
          {currentSlide.image && (
            <div
              className="absolute inset-0 opacity-25 mix-blend-overlay"
              style={{ backgroundImage: `url(${currentSlide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
          )}

          <SectionBadge id="hero" label="Editing Hero Banner" />

          <div className="relative z-10 max-w-2xl px-6 py-12 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight max-w-lg">
              {currentSlide.title || 'Modern Workplace Opportunities'}
            </h1>

            <p className="text-xs text-slate-200/90 leading-relaxed max-w-md line-clamp-3 font-normal">
              {currentSlide.description || 'Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement across 5 fields of study.'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="rounded-xl bg-[#c0392b] text-white px-4 py-2 text-xs font-bold shadow-md hover:bg-rose-700">
                {heroButtons.primaryText || 'Alumni Portal'}
              </span>
              <span className="rounded-xl border border-white/40 bg-white/10 text-white px-4 py-2 text-xs font-bold backdrop-blur-sm">
                {heroButtons.secondaryText || 'Employer Partnership'} ↗
              </span>
            </div>

            <div className="flex justify-center pt-3 text-white/50">
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </div>
          </div>
        </div>

        {/* ── 2. UNIFIED CONTAINER: ASTU IMPACT & HOW IT WORKS (EXACT MATCH OF SCREENSHOT) ── */}
        <div className="mx-auto max-w-[1180px] px-3 sm:px-6 my-6">
          <div className="relative rounded-3xl border border-slate-200/90 bg-white dark:bg-slate-900/90 p-6 sm:p-10 shadow-xs">
            {/* ── PART A: ASTU IMPACT AT A GLANCE ── */}
            <div
              id="preview-section-impact"
              onClick={() => onSectionClick?.('impact')}
              className={`relative rounded-2xl p-2 cursor-pointer transition-all ${activeSection === 'impact' ? 'ring-4 ring-inset ring-amber-400' : ''}`}
            >
              <SectionBadge id="impact" label="Editing Impact Statistics" />

              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                  {impactHeaders.eyebrow || 'ASTU IMPACT AT A GLANCE'}
                </span>
                <h2 className="mt-2.5 text-2xl font-black tracking-tight text-[#003366] dark:text-sky-300 sm:text-3xl">
                  {impactHeaders.title || 'Connecting Academia to Industry'}
                </h2>
                {impactHeaders.description && (
                  <p className="mx-auto mt-1.5 max-w-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {impactHeaders.description}
                  </p>
                )}
              </div>

              {/* 4 EDITORIAL METRIC CARDS (MATCHES SCREENSHOT) */}
              <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
                {impactStats.filter(s => s.active !== false).slice(0, 4).map((stat, idx) => {
                  const StatIcon = getDynamicStatIcon(stat, idx);
                  const trendText = stat.trend || (idx === 0 ? '+18% YoY' : idx === 1 ? '5 Faculties' : idx === 2 ? 'Corporate Link' : 'Verified Placement');
                  const labelTitle = stat.label || (idx === 0 ? 'ALUMNI NETWORK' : idx === 1 ? 'FIELDS OF STUDY' : idx === 2 ? 'PARTNER EMPLOYERS' : 'GRADUATE IMPACT');

                  return (
                    <div
                      key={stat.id || idx}
                      className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:border-[#003366]/40 hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#003366] dark:bg-slate-700 dark:text-sky-300">
                            <StatIcon className="h-4.5 w-4.5" />
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {trendText}
                          </span>
                        </div>

                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#003366] dark:text-sky-300">
                          {stat.value}{stat.suffix || ''}
                        </div>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          {labelTitle}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-[#003366] dark:text-sky-400 group-hover:text-rose-600">
                        <span>{stat.action || (idx === 0 ? 'View Network' : idx === 1 ? 'Explore Programs' : idx === 2 ? 'Meet Partners' : 'View Impact Data')}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── PART B: DELIBERATE VERTICAL FLOW BRIDGE (MATCHES SCREENSHOT) ── */}
            <div
              id="preview-section-portals"
              onClick={() => onSectionClick?.('portals')}
              className={`relative rounded-2xl p-2 cursor-pointer transition-all mt-4 ${activeSection === 'portals' ? 'ring-4 ring-inset ring-amber-400' : ''}`}
            >
              <SectionBadge id="portals" label="Editing Journey & How ASTU-AMS Works" />

              <div className="my-6 flex flex-col items-center justify-center text-center">
                <div className="h-8 w-0.5 bg-gradient-to-b from-slate-300 via-[#003366]/40 to-[#003366]" />

                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#003366]/20 bg-white dark:bg-slate-800 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#003366] dark:text-sky-300 shadow-xs -mt-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                  <span>{portalsHeaders.eyebrow || 'GET STARTED'}</span>
                </div>

                <h3 className="mt-2 text-2xl font-black tracking-tight text-[#003366] dark:text-sky-300">
                  {portalsHeaders.title || 'How ASTU-AMS Works'}
                </h3>
                <p className="mx-auto mt-1 max-w-lg text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {portalsHeaders.description || "From registration to real impact — here's how our platform empowers alumni, employers, and the university community in four simple steps."}
                </p>
              </div>

              {/* 4 JOURNEY STEP CARDS (MATCHES SCREENSHOT) */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
                {portals.filter(p => p.active !== false).slice(0, 4).map((item, idx) => {
                  const IconComp = item.icon && iconMap[item.icon] ? iconMap[item.icon] : (idx === 0 ? Users : idx === 1 ? Briefcase : idx === 2 ? Users : Trophy);
                  const stepNum = String(item.step || idx + 1).padStart(2, '0');
                  const stepVerbs = ['CREATE', 'DISCOVER', 'CONNECT', 'GIVE BACK'];
                  const actionVerb = stepVerbs[idx] || 'STAGE';
                  const title = item.title || (idx === 0 ? 'CREATE YOUR PROFILE' : idx === 1 ? 'DISCOVER OPPORTUNITIES' : idx === 2 ? 'CONNECT & COLLABORATE' : 'GROW & GIVE BACK');
                  const desc = item.description || (Array.isArray(item.points) ? item.points[0] : 'Build your verified identity and showcase your education, skills and experience.');
                  const tags = item.points && Array.isArray(item.points) && item.points.length > 1
                    ? item.points.slice(1, 3)
                    : (idx === 0 ? ['Verified ID', 'Skill Matrix'] : idx === 1 ? ['Job Match', 'Mentorship'] : idx === 2 ? ['Global Network', 'Industry Events'] : ['Tracer Surveys', 'Curriculum']);

                  return (
                    <div
                      key={item.id || idx}
                      className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:border-[#003366]/40 hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex h-6 px-2 items-center justify-center rounded-full bg-[#001730] text-white font-extrabold text-[9px]">
                              {stepNum}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#001730] dark:text-sky-300">
                              {actionVerb}
                            </span>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-[#003366] dark:bg-slate-700 dark:text-sky-300">
                            <IconComp className="h-4 w-4" />
                          </div>
                        </div>

                        <h4 className="mb-1 text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                          {title}
                        </h4>

                        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                          {desc}
                        </p>

                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {tags.map((tag, tIdx) => (
                            <span key={tIdx} className="inline-block rounded-md bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-[#003366] dark:text-sky-400 group-hover:text-rose-600">
                        <span>{item.cta || (idx === 0 ? 'Start Profile' : idx === 1 ? 'Explore Opportunities' : idx === 2 ? 'Join Network' : 'Take Tracer Survey')}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Concluding Action CTA (Matches Screenshot) */}
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <div className="h-6 w-0.5 bg-gradient-to-b from-[#003366]/30 to-[#003366] mb-2" />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#001730] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#002244]"
                >
                  <span>{portalsHeaders.ctaText || 'Get Started Today'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <p className="mt-1.5 text-[10px] text-slate-500 font-medium">
                  Join the ASTU alumni community and start building your professional network.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. CAMPUS LIFE, FACILITIES, EVENTS (MATCHES SCREENSHOT) ── */}
        <div
          id="preview-section-campus-life"
          onClick={() => onSectionClick?.('campus-life')}
          className={`relative mx-auto max-w-[1180px] px-3 sm:px-6 my-10 cursor-pointer transition-all ${activeSection === 'campus-life' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''}`}
        >
          <SectionBadge id="campus-life" label="Editing Campus Life Cards" />

          <div className="text-center mb-8">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
              {campusLifeHeaders.eyebrow || 'EXPLORE LIFE AT ASTU'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-sky-300">
              {campusLifeHeaders.title || 'Campus Life, Facilities, Events, and Galleries'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
              {campusLifeHeaders.description || 'A public gateway to institutional experiences across ASTU: research facilities, alumni reunions, career expos, campus innovations, and heritage galleries.'}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {(campusLife.length > 0 ? campusLife.slice(0, 3) : [
              { id: '1', title: 'Events and Activities', campus: 'MAIN CAMPUS', image: '/images/campus-2.jpeg', action: 'View Events' },
              { id: '2', title: 'Facilities', campus: 'INNOVATION SPACES', image: '/images/electriclabs.jpeg', action: 'Explore Facilities' },
              { id: '3', title: 'ASTU Museums & Gallery', campus: 'CAMPUS GALLERY', image: '/images/arc.jpg', action: 'View Gallery' },
            ]).map((card: any, idx: number) => {
              const defaultImgs = ['/images/campus-2.jpeg', '/images/electriclabs.jpeg', '/images/arc.jpg'];
              return (
                <div key={card.id || idx} className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-xs hover:shadow-md transition-all">
                  <div className="h-36 bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
                    <img
                      src={card.image || defaultImgs[idx % 3]}
                      alt={card.title}
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = defaultImgs[idx % 3]; }}
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 px-2 py-0.5 rounded-full uppercase">
                      {card.campus || (idx === 0 ? 'MAIN CAMPUS' : idx === 1 ? 'INNOVATION SPACES' : 'CAMPUS GALLERY')}
                    </span>
                    <h4 className="text-xs font-bold text-[#003366] dark:text-sky-300 mt-1.5 mb-1">{card.title}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {card.description || 'Career expos, alumni reunions, workshops, chapter meetings, and community programs.'}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-[#003366]">
                      <span>{card.action || 'View Details'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. CAMPUS GALLERY & MOMENTS (MATCHES SCREENSHOT) ── */}
        <div
          id="preview-section-gallery"
          onClick={() => onSectionClick?.('gallery')}
          className={`relative mx-auto max-w-[1180px] px-3 sm:px-6 my-10 cursor-pointer transition-all ${activeSection === 'gallery' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''}`}
        >
          <SectionBadge id="gallery" label="Editing Campus Gallery" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
                {galleryHeaders.eyebrow || 'CAMPUS GALLERY'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-sky-300">
                {galleryHeaders.title || 'Campus Life & Moments'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {galleryHeaders.subtitle || 'A glimpse of life at ASTU — research, innovation, graduation ceremonies, and alumni milestones.'}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-[#001730] px-4 py-2 text-xs font-bold text-white shadow-sm shrink-0"
            >
              <span>{galleryHeaders.buttonText || 'View All Gallery'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(gallery.length > 0 ? gallery.slice(0, 3) : [
              { id: '1', title: 'Main Campus Architecture', src: '/images/campus-2.jpeg' },
              { id: '2', title: 'Graduation Day Celebrations', src: '/images/gc7.jpg' },
              { id: '3', title: 'Engineering & Innovation Center', src: '/images/astu-building.jpg' },
            ]).map((item: any, idx: number) => {
              const defaultImgs = ['/images/campus-2.jpeg', '/images/gc7.jpg', '/images/astu-building.jpg'];
              return (
                <div key={item.id || idx} className="rounded-2xl overflow-hidden shadow-xs relative aspect-4/3 group">
                  <img
                    src={item.src || item.image || defaultImgs[idx % 3]}
                    alt={item.title || 'Gallery'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = defaultImgs[idx % 3]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3.5">
                    <p className="text-white text-xs font-bold">{item.title || 'Campus Moments'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. UPCOMING EVENTS & WORKSHOPS ── */}
        <div
          id="preview-section-events-news"
          onClick={() => onSectionClick?.('events-news')}
          className={`relative mx-auto max-w-[1180px] px-3 sm:px-6 my-10 cursor-pointer transition-all ${activeSection === 'events-news' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''}`}
        >
          <SectionBadge id="events-news" label="Editing Events & Notices" />

          <div className="text-center mb-6">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
              {eventsHeaders?.eyebrow || 'EVENTS & WORKSHOPS'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-sky-300">
              {eventsHeaders?.title || 'Upcoming Alumni Events'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {eventsHeaders?.description || 'Networking, learning, and professional growth opportunities.'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(events.length > 0 ? events.slice(0, 3) : [
              { id: '1', title: 'ASTU Alumni Carnival 2026', date: 'April 25-26, 2026', location: 'Main Campus' },
              { id: '2', title: 'DAAD Alumni Workshop', date: 'March 2026', location: 'Research Center' },
            ]).map((ev: any, idx: number) => (
              <div key={ev.id || idx} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold text-rose-600">{ev.date}</span>
                  <span>{ev.location || 'Main Campus'}</span>
                </div>
                <h4 className="text-xs font-bold text-[#003366] dark:text-sky-300 line-clamp-1">{ev.title}</h4>
              </div>
            ))}
          </div>

          {announcements.length > 0 && (
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003366] dark:text-sky-300 block mb-1">
                📢 {announcementsHeaders?.title || 'Official Notices'}
              </span>
              <div className="space-y-1">
                {announcements.slice(0, 2).map((a, i) => (
                  <p key={a.id || i} className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-rose-600 shrink-0" />
                    <span>{a.title}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 6. PARTNER COMPANIES ── */}
        <div
          id="preview-section-partners-portal"
          onClick={() => onSectionClick?.('partners-portal')}
          className={`relative mx-auto max-w-[1180px] px-3 sm:px-6 my-10 cursor-pointer transition-all ${activeSection === 'partners-portal' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''}`}
        >
          <SectionBadge id="partners-portal" label="Editing Partners" />

          <div className="text-center mb-6">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
              {partnersHeaders?.eyebrow || 'OUR PARTNERS'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-sky-300">
              {partnersHeaders?.title || 'Corporate & Institutional Partners'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {partnersHeaders?.description || 'Leading employers collaborating with ASTU across telecom, aviation, cybersecurity, and technology.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(partners.length > 0 ? partners.slice(0, 6) : [
              { id: '1', name: 'Ethio Telecom' },
              { id: '2', name: 'Ethiopian Airlines' },
              { id: '3', name: 'INSA' },
              { id: '4', name: 'Huawei' },
              { id: '5', name: 'Safaricom' },
              { id: '6', name: 'CBE' },
            ]).map((p: any, idx: number) => (
              <div key={p.id || idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-800 text-center font-bold text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">
                {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. QUALITY ASSURANCE & ACCREDITATION ── */}
        {accreditation && (
          <div
            id="preview-section-accreditation-faq"
            onClick={() => onSectionClick?.('accreditation-faq')}
            className={`relative mx-auto max-w-[1180px] px-3 sm:px-6 my-10 cursor-pointer transition-all ${activeSection === 'accreditation-faq' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''}`}
          >
            <SectionBadge id="accreditation-faq" label="Editing Accreditation & FAQ" />
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-6 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">{accreditation.eyebrow || 'Quality Assurance'}</span>
                <h3 className="text-xl font-bold text-[#003366] dark:text-sky-300">{accreditation.title || 'Data-Driven Accreditation & Excellence'}</h3>
                <p className="text-xs text-slate-500 mt-1">{accreditation.description}</p>
              </div>
              <button type="button" className="rounded-xl bg-[#003366] text-white px-5 py-2 text-xs font-bold shrink-0">
                {accreditation.buttonText || 'View Impact Numbers'}
              </button>
            </div>
          </div>
        )}

        {/* ── 8. FREQUENTLY ASKED QUESTIONS ── */}
        <div
          id="preview-section-accreditation-faq"
          onClick={() => onSectionClick?.('accreditation-faq')}
          className={`relative mx-auto max-w-[800px] px-3 sm:px-6 my-10 cursor-pointer transition-all ${activeSection === 'accreditation-faq' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''}`}
        >
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">{faqHeaders.eyebrow || 'FAQ'}</span>
            <h2 className="text-2xl font-black text-[#003366] dark:text-sky-300">{faqHeaders.title || 'Frequently Asked Questions'}</h2>
          </div>
          <div className="space-y-2">
            {faq.filter(f => f.active !== false).slice(0, 4).map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpenFaqId(isOpen ? null : item.id); }}
                    className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#003366] dark:text-sky-300"
                  >
                    <span>{item.question}</span>
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 p-3 text-[11px] text-slate-600 bg-slate-50/50">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 9. BOTTOM CTA BANNER & UNIVERSITY FOOTER ── */}
        <div
          id="preview-section-footer-cta"
          onClick={() => onSectionClick?.('footer-cta')}
          className={`cursor-pointer transition-all ${activeSection === 'footer-cta' ? 'ring-4 ring-inset ring-amber-400' : ''}`}
        >
          <SectionBadge id="footer-cta" label="Editing Footer & Directory" />

          {ctaSection.enabled && (
            <div className="bg-[#002244] text-white p-8 text-center">
              <h3 className="text-xl font-black">{ctaSection.title || 'Ready to Join ASTU-AMS?'}</h3>
              <p className="text-xs text-slate-200 mt-1 max-w-md mx-auto">{ctaSection.subtitle}</p>
              <div className="flex justify-center gap-2.5 mt-4">
                <span className="rounded-xl bg-white text-[#003366] px-5 py-2 text-xs font-bold">{ctaSection.primaryText || 'Alumni Portal'}</span>
                <span className="rounded-xl border border-white/40 px-5 py-2 text-xs font-bold text-white">{ctaSection.secondaryText || 'Employer Portal'}</span>
              </div>
            </div>
          )}

          <footer className="bg-[#001730] text-slate-300 p-6 text-[11px] space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <img src="/images/astu-seal-logo.png" alt="ASTU" className="h-6 w-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/images/astu-logo.jpeg'; }} />
                <span className="font-bold text-white">Adama Science and Technology University</span>
              </div>
              <span className="text-slate-400">{footer.email} • {footer.phone}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>{footer.address} ({footer.poBox})</span>
              <span>{footer.copyright}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
