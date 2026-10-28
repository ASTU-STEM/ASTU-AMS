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
  Heart,
  PlayCircle,
  Quote,
} from 'lucide-react';
import {
  HeroSlide,
  ImpactStat,
  StakeholderPortal,
  CampusLifeCard,
  Campus,
  GalleryImage,
  VideoItem,
  EventItem,
  WorkshopItem,
  Announcement,
  NewsItem,
  Partner,
  FaqItem,
  FeaturedEmployerItem,
} from '../services/homepageCms.service';
import { DetailPageItem } from '../services/detailPages.data';
import { mediaUrl } from '../../../config';

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
  industryBridge?: {
    enabled?: boolean;
    eyebrow?: string;
    title?: string;
    description?: string;
    stat1Value?: string;
    stat1Label?: string;
    stat2Value?: string;
    stat2Label?: string;
    buttonText?: string;
    buttonLink?: string;
    image?: string;
  } | null;
  gallery: GalleryImage[];
  galleryHeaders?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  videos?: VideoItem[];
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
  featuredEmployers?: FeaturedEmployerItem[];
  communitySection?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    stats?: Array<{ value?: string; label?: string }>;
  };
  communityPosts?: Array<{
    id?: string;
    name?: string;
    role?: string;
    text?: string;
    image?: string;
    active?: boolean;
  }>;
  givingSection?: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
  };
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

interface DetailPagePreviewProps {
  detail?: DetailPageItem;
  slug: string;
  partners: Partner[];
  featuredEmployers: FeaturedEmployerItem[];
  footer: {
    address: string;
    phone: string;
    email: string;
    poBox: string;
    copyright: string;
  };
}

function DetailPagePreview({
  detail,
  slug,
  partners,
  featuredEmployers,
  footer,
}: DetailPagePreviewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!detail) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 p-10 text-center">
        <Globe className="h-10 w-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Select a detail page to preview</p>
        <p className="max-w-sm text-xs text-slate-400">
          Choose an institutional page from the left panel to see its live /info/{slug} template.
        </p>
      </div>
    );
  }

  const HeroIcon = iconMap[detail.iconName || ''] || Globe;
  const sections = (detail.sections || []).filter((s) => s.active !== false);
  const stats = detail.stats || [];
  const faqs = detail.faqs || [];
  const isEmployerPage = slug === 'featured-employers' || slug === 'employer-portal';
  const livePartners = partners.filter((p) => p.active !== false);
  const liveEmployers = featuredEmployers.filter((e) => e.active !== false);

  return (
    <div className="min-h-full bg-white dark:bg-slate-900">
      <div className="bg-[#002244] px-4 py-1.5 text-[10px] font-medium text-white/90">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between">
          <div className="flex items-center gap-4">
            <span>{footer.email || 'admin@astu.edu.et'}</span>
            <span>{footer.phone || '+251 22 110 0001'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="cursor-pointer hover:underline">Login</span>
            <span className="text-white/40">|</span>
            <span className="cursor-pointer hover:underline">Register</span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 py-3 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-2.5">
          <img
            src="/images/astu-seal-logo.png"
            alt="ASTU"
            className="h-8 w-8 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/astu-logo.jpeg'; }}
          />
          <div>
            <span className="block text-xs font-black tracking-tight text-[#003366] dark:text-sky-300">ASTU-AMS</span>
            <span className="-mt-0.5 block text-[8px] font-bold tracking-wider text-slate-400">ALUMNI MANAGEMENT SYSTEM</span>
          </div>
        </div>
        <div className="hidden items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 sm:flex">
          <span className="text-[#003366] dark:text-sky-400">Home</span>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate">/info/{slug}</span>
        </div>
      </div>

      <div className="relative overflow-hidden bg-[#002244] text-white">
        <img
          src={detail.image}
          alt={detail.title}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001730] via-[#002244]/90 to-[#003366]/60" />
        <div className="relative mx-auto max-w-[1180px] px-5 py-12">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">
            <HeroIcon className="h-3.5 w-3.5" />
            {detail.badge || 'Institutional Page'}
          </span>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">{detail.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">{detail.subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {detail.primaryCtaText && (
              <span className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-[#003366] shadow-sm">
                {detail.primaryCtaText}
              </span>
            )}
            {detail.secondaryCtaText && (
              <span className="rounded-xl border border-white/40 px-5 py-2 text-xs font-bold text-white">
                {detail.secondaryCtaText}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-5 py-10">
        {stats.length > 0 && (
          <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={stat.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-2xl font-black text-[#003366] dark:text-sky-300">{stat.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{stat.label}</p>
                {stat.desc && <p className="mt-0.5 text-[10px] text-slate-400">{stat.desc}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-600">What you will find</span>
          <h2 className="mt-1 text-2xl font-black text-[#003366] dark:text-sky-300">{detail.title} details</h2>
        </div>

        {sections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((section, idx) => (
              <article
                key={section.id || idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40"
              >
                {section.badge && (
                  <span className="mb-2 inline-flex rounded-full bg-astu-navy/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-astu-navy dark:bg-sky-500/10 dark:text-sky-300">
                    {section.badge}
                  </span>
                )}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{section.heading}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{section.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-xs text-slate-400 dark:border-slate-700">
            No content sections yet. Add sections from the left editor.
          </div>
        )}

        {isEmployerPage && (livePartners.length > 0 || liveEmployers.length > 0) && (
          <div className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-600">Partner Network</span>
                <h2 className="mt-1 text-xl font-black text-[#003366] dark:text-sky-300">Employers hiring ASTU graduates</h2>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">{livePartners.length || liveEmployers.length} live listings</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {(liveEmployers.length > 0 ? liveEmployers : livePartners).map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#003366]/10 text-[#003366] dark:bg-sky-500/10 dark:text-sky-300">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                  {item.area && <p className="mt-0.5 text-[10px] text-slate-500">{item.area}</p>}
                  {item.openings && <p className="mt-1 text-[10px] font-bold text-emerald-600">{item.openings}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {faqs.length > 0 && (
          <div className="mt-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-600">FAQ</span>
            <h2 className="mb-4 mt-1 text-xl font-black text-[#003366] dark:text-sky-300">Questions from partners</h2>
            <div className="space-y-2">
              {faqs.map((faqItem, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faqItem.id || idx} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#003366] dark:text-sky-300"
                    >
                      <span>{faqItem.question}</span>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/60 p-3 text-[11px] leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                        {faqItem.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="bg-[#001730] p-6 text-[11px] text-slate-300">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row">
          <span className="font-bold text-white">Adama Science and Technology University</span>
          <span className="text-slate-400">{footer.email} • {footer.phone}</span>
        </div>
        <div className="mx-auto mt-3 flex max-w-[1180px] flex-col items-center justify-between gap-2 text-[10px] text-slate-500 sm:flex-row">
          <span>{footer.address} ({footer.poBox})</span>
          <span>{footer.copyright}</span>
        </div>
      </footer>
    </div>
  );
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
  industryBridge = null,
  gallery = [],
  galleryHeaders = {
    eyebrow: 'CAMPUS GALLERY',
    title: 'Campus Life & Moments',
    subtitle: 'A glimpse of life at ASTU — research, innovation, graduation ceremonies, and alumni milestones.',
    buttonText: 'View All Gallery',
    buttonLink: '/gallery',
  },
  videos = [],
  eventsHeaders,
  events = [],
  workshops = [],
  announcementsHeaders,
  announcements = [],
  newsItems = [],
  partnersHeaders,
  partners = [],
  featuredEmployers = [],
  communitySection,
  communityPosts = [],
  givingSection,
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
  const safeSlideIdx = activeSlides.length
    ? Math.min(activeSlideIdx, activeSlides.length - 1)
    : 0;
  const currentSlide = activeSlides[safeSlideIdx] || activeSlides[0] || {
    id: 'HS-1',
    image: '/images/astu-building.jpg',
    tagline: heroBadge || 'ASTU Alumni Management System',
    title: 'Empowering the Next Generation of Engineers & Leaders',
    description: welcomeMessage || 'Connecting university research, verified graduate outcomes, and premier industrial partnerships.',
  };
  const heroImageSrc = mediaUrl(currentSlide.image || '/images/astu-building.jpg') || '/images/astu-building.jpg';
  const heroEyebrow = currentSlide.tagline || heroBadge || 'ASTU-AMS';

  useEffect(() => {
    if (activeSlideIdx > 0 && activeSlideIdx >= activeSlides.length) {
      setActiveSlideIdx(Math.max(0, activeSlides.length - 1));
    }
  }, [activeSlideIdx, activeSlides.length]);

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
      community: 'preview-section-community',
      'giving-campaigns': 'preview-section-giving-campaigns',
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
  const previewPath = activeSection === 'detail-pages' ? `/info/${selectedDetailSlug || 'overview'}` : '/';
  const previewOrigin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost:5173';
  const previewUrl = `${previewOrigin}${previewPath}`;

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
    <div className="flex flex-col w-full h-full rounded-2xl overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-slate-300/70 dark:ring-slate-700">
      {/* Browser chrome — mirrors the live public site URL */}
      <div className={`mx-auto w-full ${iw} flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-slate-100 to-slate-200/90 dark:from-slate-800 dark:to-slate-900 border-x border-t border-slate-300/80 dark:border-slate-700 rounded-t-xl text-[11px]`}>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="hidden sm:flex items-center gap-1 shrink-0 text-slate-400">
          <ChevronLeft className="h-3.5 w-3.5 opacity-40" />
          <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        </div>
        <div className="flex-1 flex items-center gap-1.5 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-300/70 dark:border-slate-700 min-w-0 shadow-inner">
          {previewUrl.startsWith('https') ? (
            <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
          ) : (
            <Globe className="h-3 w-3 text-sky-600 shrink-0" />
          )}
          <span className="truncate text-slate-700 dark:text-slate-200 font-mono text-[10px]">
            {previewUrl}
          </span>
        </div>
        <a
          href={previewPath}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 shrink-0 rounded-md bg-white/80 dark:bg-slate-950/60 border border-slate-300/70 dark:border-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-white"
          title="Open this route in a new tab"
        >
          <ExternalLink className="h-3 w-3" />
          Live
        </a>
        <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden md:inline">Matches /</span>
        </div>
      </div>

      {/* Viewport Container */}
      <div
        ref={containerRef}
        className={`mx-auto w-full ${iw} h-[820px] overflow-y-auto bg-white dark:bg-slate-900 border-x border-b border-slate-300/80 dark:border-slate-700 shadow-xl rounded-b-xl scroll-smooth select-none`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {activeSection === 'detail-pages' ? (
          <DetailPagePreview
            detail={activeDetail}
            slug={selectedDetailSlug || 'overview'}
            partners={partners}
            featuredEmployers={featuredEmployers}
            footer={footer}
          />
        ) : (
          <>
        {/* ── TOP BAR + NAVBAR (matches public Navbar) ── */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 dark:bg-slate-900/95 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className={`bg-[#003366] text-white border-b border-white/10 ${deviceView === 'mobile' ? 'hidden' : 'block'}`}>
            <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-1.5 sm:px-5">
              <div className="flex items-center gap-3 text-[10px] text-white/85 font-medium">
                <span>irccd@astu.edu.et</span>
                <span className="text-white/25">·</span>
                <span>+251 22 110 0001</span>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] font-medium">
                <span className="text-white/85">Login</span>
                <span className="text-white/25">·</span>
                <span className="text-white/85">Register</span>
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
            <div className="flex items-center gap-2.5 shrink-0">
              <img
                src="/images/astu-seal-logo.png"
                alt="ASTU"
                className="h-9 w-9 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/astu-logo.jpeg'; }}
              />
              <div className="leading-tight">
                <p className="text-xs font-bold text-[#003366] dark:text-white">ASTU-AMS</p>
                <p className="text-[8px] uppercase tracking-[0.16em] text-emerald-600 font-semibold">Alumni Management System</p>
              </div>
            </div>

            <div className={`items-center gap-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 ${deviceView === 'mobile' ? 'hidden' : 'hidden sm:flex'}`}>
              <span className="px-2.5 py-1.5 text-[#003366] dark:text-sky-400">Home</span>
              <span className="px-2.5 py-1.5 hover:text-[#003366] cursor-pointer">Partners</span>
              <span className="px-2.5 py-1.5 hover:text-[#003366] cursor-pointer inline-flex items-center gap-0.5">About <ChevronDown className="h-2.5 w-2.5" /></span>
              <span className="px-2.5 py-1.5 hover:text-[#003366] cursor-pointer inline-flex items-center gap-0.5">Services <ChevronDown className="h-2.5 w-2.5" /></span>
              <span className="px-2.5 py-1.5 hover:text-[#003366] cursor-pointer inline-flex items-center gap-0.5">Media <ChevronDown className="h-2.5 w-2.5" /></span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className={`items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] text-slate-400 dark:border-slate-700 dark:bg-slate-800 ${deviceView === 'mobile' ? 'hidden' : 'hidden md:flex'}`}>
                <Search className="h-3 w-3" />
                <span>Search sections...</span>
              </div>
              <span className="rounded-full bg-[#003366] text-white px-3 py-1.5 text-[10px] font-bold shadow-xs">
                Join Network
              </span>
            </div>
          </div>
        </div>

        {/* ── WELCOME ALERT TICKER (matches public /) ── */}
        {welcomeEnabled && welcomeMessage && (
          <div
            onClick={() => onSectionClick?.('hero')}
            className={`cursor-pointer border-b border-[#003366]/20 bg-gradient-to-r from-[#003366] via-[#003f7d] to-[#003366] text-white ${activeSection === 'hero' ? 'ring-2 ring-inset ring-amber-400' : ''}`}
          >
            <div className="mx-auto flex max-w-[1440px] items-center gap-2.5 px-4 py-2 sm:px-5">
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#c0392b] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                <Bell className="h-2.5 w-2.5" />
                Notice
              </span>
              <span className="truncate text-[10px] font-medium text-white/95 sm:text-[11px]">{welcomeMessage}</span>
            </div>
          </div>
        )}

        {/* ── 1. HERO SECTION (matches public homepage) ── */}
        <div
          id="preview-section-hero"
          onClick={() => onSectionClick?.('hero')}
          className={`relative overflow-hidden bg-slate-950 text-white cursor-pointer transition-all ${activeSection === 'hero' ? 'ring-4 ring-inset ring-amber-400' : ''}`}
          style={{ minHeight: deviceView === 'mobile' ? '320px' : '360px' }}
        >
          <div className="absolute inset-0">
            <img
              src={heroImageSrc}
              alt={currentSlide.title || 'Hero'}
              className="h-full w-full object-cover object-center"
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/astu-building.jpg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent md:via-slate-950/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/20" />
          </div>

          <SectionBadge id="hero" label="Editing Hero & Alert" />

          <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-5 py-10 sm:px-6 sm:py-12">
            <div className="max-w-xl space-y-3">
              <span className="inline-block rounded-full bg-[#c0392b] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
                {heroEyebrow}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black leading-[1.15] tracking-tight text-white drop-shadow-sm">
                {(currentSlide.title || '').includes(' to the ') ? (
                  <>
                    {currentSlide.title.split(' to the ')[0]}
                    <br />
                    to the <span className="text-emerald-400">{currentSlide.title.split(' to the ')[1]}</span>
                  </>
                ) : (
                  currentSlide.title || 'Alumni Management System'
                )}
              </h1>
              <p className="max-w-md text-[11px] sm:text-xs leading-relaxed text-white/90 line-clamp-3">
                {currentSlide.description || welcomeMessage || 'Connecting ASTU graduates, employers, and academic departments through verified career and alumni services.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#c0392b] px-3.5 py-2 text-[11px] font-bold text-white shadow-md">
                  <Users className="h-3 w-3" />
                  {heroButtons.primaryText || 'Alumni Portal'}
                  <ArrowRight className="h-3 w-3" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-3.5 py-2 text-[11px] font-bold text-white backdrop-blur-sm">
                  {heroButtons.secondaryText || 'Employer Partnership'}
                </span>
              </div>
            </div>
          </div>

          {activeSlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlideIdx((i) => (i - 1 + activeSlides.length) % activeSlides.length);
                }}
                className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-1.5 text-white backdrop-blur-sm sm:block"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlideIdx((i) => (i + 1) % activeSlides.length);
                }}
                className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-1.5 text-white backdrop-blur-sm sm:block"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                {activeSlides.map((slide, idx) => (
                  <button
                    key={slide.id || idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlideIdx(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${idx === safeSlideIdx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-white/70 pointer-events-none">
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </div>
        </div>

        {/* ── 2. IMPACT METRICS (flat flow — no hero overlap) ── */}
        <div
          id="preview-section-impact"
          onClick={() => onSectionClick?.('impact')}
          className={`relative mx-auto mt-6 mb-4 max-w-[1180px] px-3 sm:mt-8 sm:px-6 cursor-pointer transition-all ${activeSection === 'impact' ? 'ring-4 ring-amber-400 rounded-2xl' : ''}`}
        >
          <SectionBadge id="impact" label="Editing Impact Headers" />
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(0,51,102,0.08)] dark:border-slate-700 dark:bg-slate-900">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#003366] via-[#c0392b] to-emerald-500" />
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 px-4 py-2.5 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {impactHeaders.eyebrow || 'Live ASTU-AMS metrics'}
                </p>
              </div>
              <p className="text-[9px] font-semibold text-slate-400">
                {impactHeaders.title || 'Counted directly from the alumni database'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-200/90 dark:bg-slate-700 sm:grid-cols-3 lg:grid-cols-4">
              {impactStats.filter((s) => s.active !== false).slice(0, 4).map((stat, idx) => {
                const StatIcon = getDynamicStatIcon(stat, idx);
                return (
                  <div
                    key={stat.id || idx}
                    className="flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center dark:bg-slate-900"
                  >
                    <div className="rounded-xl bg-[#003366]/10 p-2 text-[#003366] dark:bg-sky-500/15 dark:text-sky-300">
                      <StatIcon className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-extrabold tracking-tight text-[#003366] dark:text-white sm:text-2xl">
                      {stat.value}
                      {stat.suffix ? <span className="text-sm font-black">{stat.suffix}</span> : null}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      {stat.label || 'Metric'}
                    </p>
                  </div>
                );
              })}
            </div>
            {impactHeaders.description && (
              <p className="border-t border-slate-100 px-4 py-2 text-center text-[10px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {impactHeaders.description}
              </p>
            )}
          </div>
        </div>

        {/* ── 3. HOW IT WORKS + REST OF HOMEPAGE ── */}
        <div className="mx-auto max-w-[1180px] px-3 sm:px-6 mb-6">
          <div className="relative rounded-3xl border border-slate-200/90 bg-white dark:bg-slate-900/90 p-6 sm:p-10 shadow-xs">
            <div
              id="preview-section-portals"
              onClick={() => onSectionClick?.('portals')}
              className={`relative rounded-2xl p-2 cursor-pointer transition-all ${activeSection === 'portals' ? 'ring-4 ring-inset ring-amber-400' : ''}`}
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
              {campusLifeHeaders.description || 'A public gateway for the same institutional experiences AAU highlights: events, facilities, campus activities, media galleries, and services.'}
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

          {campuses.filter((c) => c.active !== false).length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {campuses.filter((c) => c.active !== false).slice(0, 3).map((campus, idx) => (
                <div key={campus.id || idx} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                  <div className="h-24 overflow-hidden bg-slate-100">
                    <img src={campus.image || '/images/astu-building.jpg'} alt={campus.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-bold text-[#003366] dark:text-sky-300">{campus.name}</p>
                    <p className="mt-1 text-[10px] text-slate-500 line-clamp-2">{campus.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {industryBridge && industryBridge.enabled !== false && (
          <div className="relative mx-auto my-8 max-w-[1180px] px-3 sm:px-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="grid sm:grid-cols-2">
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
                    {industryBridge.eyebrow || 'Industry-Campus Bridge'}
                  </p>
                  <h3 className="mt-1 text-lg font-black text-[#003366] dark:text-sky-300">
                    {industryBridge.title}
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500 line-clamp-3">
                    {industryBridge.description}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                      <p className="text-base font-black text-[#003366] dark:text-white">{industryBridge.stat1Value}</p>
                      <p className="text-[9px] font-semibold uppercase text-slate-500">{industryBridge.stat1Label}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                      <p className="text-base font-black text-[#003366] dark:text-white">{industryBridge.stat2Value}</p>
                      <p className="text-[9px] font-semibold uppercase text-slate-500">{industryBridge.stat2Label}</p>
                    </div>
                  </div>
                </div>
                <div className="min-h-[160px] bg-slate-100">
                  <img
                    src={industryBridge.image || '/images/arc.jpg'}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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

          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700">
            <div className="mb-3 flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm font-black text-[#003366] dark:text-sky-300">Video Gallery</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {videos.filter((item) => item.active !== false).slice(0, 3).map((video, idx) => (
                <div key={video.id || idx} className="group relative aspect-video overflow-hidden rounded-xl bg-slate-900">
                  <img src={mediaUrl(video.image) || video.image || '/images/astu-building.jpg'} alt={video.title} className="h-full w-full object-cover opacity-75" />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/85 via-transparent to-transparent p-3">
                    <span className="line-clamp-1 text-[10px] font-bold text-white">{video.title || 'ASTU video highlight'}</span>
                  </div>
                  <PlayCircle className="absolute left-3 top-3 h-6 w-6 text-white drop-shadow" />
                </div>
              ))}
              {videos.filter((item) => item.active !== false).length === 0 && (
                <p className="col-span-full rounded-xl bg-slate-50 px-3 py-4 text-center text-[11px] text-slate-500 dark:bg-slate-800">Published video highlights will appear here.</p>
              )}
            </div>
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
              {eventsHeaders?.title || 'Gatherings & Technical Training'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {eventsHeaders?.description || 'Join campus career expos, technical workshops, and alumni reunions across ASTU.'}
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
          {newsItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {newsItems.filter((item) => item.active !== false).slice(0, 3).map((item, index) => (
                <span key={item.id || index} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.title}</span>
              ))}
            </div>
          )}
        </div>

        {/* ── 6. GIVING (matches the public Giving portal callout) ── */}
        <div
          id="preview-section-giving-campaigns"
          onClick={() => onSectionClick?.('giving-campaigns')}
          className={`relative my-10 cursor-pointer bg-gradient-to-br from-slate-50 via-white to-sky-50 px-5 py-9 transition-all dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 ${activeSection === 'giving-campaigns' ? 'ring-4 ring-inset ring-amber-400' : ''}`}
        >
          <SectionBadge id="giving-campaigns" label="Editing Giving" />
          <div className="mx-auto max-w-[900px] text-center">
            <Heart className="mx-auto h-7 w-7 fill-rose-100 text-rose-600" />
            <h2 className="mt-3 text-2xl font-black text-[#003366] dark:text-sky-300">{givingSection?.title || 'Support Future Innovators & Campus Research'}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">{givingSection?.subtitle || 'Gifts support merit scholarships, research laboratories, student incubators, and emergency support.'}</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#003366] px-4 py-2 text-xs font-bold text-white">{givingSection?.buttonText || 'Explore All Causes'} <ArrowRight className="h-3.5 w-3.5" /></span>
          </div>
        </div>

        {/* ── 7. PARTNER COMPANIES ── */}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 items-center justify-items-center gap-x-6 gap-y-7">
            {partners.filter((p) => p.active !== false && p.logo).slice(0, 6).map((p) => (
              <img
                key={p.id}
                src={p.logo}
                alt={`${p.name} logo`}
                className="max-h-12 max-w-[120px] object-contain"
              />
            ))}
          </div>
        </div>

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

        {/* ── 9. COMMUNITY CTA & VOICES (matches the final public section) ── */}
        <div
          id="preview-section-community"
          onClick={() => onSectionClick?.('community')}
          className={`relative overflow-hidden cursor-pointer bg-gradient-to-br from-[#003366] via-[#014b78] to-slate-900 px-5 py-10 text-white transition-all ${activeSection === 'community' ? 'ring-4 ring-inset ring-amber-400' : ''}`}
        >
          <SectionBadge id="community" label="Editing Community & Stories" />
          <div className="mx-auto max-w-[1040px] text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300"><Globe className="h-3 w-3" />{communitySection?.eyebrow || 'ASTU Alumni Community'}</span>
            <h2 className="mt-3 text-2xl font-black">{communitySection?.title || 'Your Network Around the World'}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-slate-200">{communitySection?.subtitle || 'Connect with fellow alumni, discover career opportunities, and contribute to university excellence.'}</p>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
              {communityPosts.filter((post) => post.active !== false).slice(0, 3).map((post, index) => (
                <article key={post.id || index} className="rounded-xl border border-white/10 bg-white/8 p-3.5 backdrop-blur-sm">
                  <Quote className="h-4 w-4 text-emerald-300" />
                  <p className="mt-2 line-clamp-3 text-[11px] italic leading-relaxed text-slate-100">“{post.text}”</p>
                  <p className="mt-3 text-[10px] font-bold text-white">{post.name}</p>
                  <p className="text-[9px] font-semibold text-emerald-300">{post.role}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-xl bg-white px-4 py-2 text-[10px] font-bold text-[#003366]">{ctaSection.primaryText || 'Alumni Portal'}</span>
              <span className="rounded-xl border border-white/40 px-4 py-2 text-[10px] font-bold">{ctaSection.secondaryText || 'Employer Portal'}</span>
            </div>
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
          </>
        )}
      </div>
    </div>
  );
}
