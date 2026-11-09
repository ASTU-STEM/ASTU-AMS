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
  Quote,
  Sparkles,
  CheckCircle2,
  Layout,
  FileText,
  Handshake,
  Layers,
  Check,
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
  SuccessStory,
  Partner,
  FaqItem,
  PartnersPageConfig,
} from '../services/homepageCms.service';
import { defaultDetailPages, DetailPageItem } from '../services/detailPages.data';

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
  storiesHeaders?: {
    eyebrow?: string;
    title?: string;
    description?: string;
  };
  stories?: SuccessStory[];
  communitySection?: {
    title?: string;
    subtitle?: string;
    stats?: { value: string; label: string }[];
  };
  communityPosts?: any[];
  partnersHeaders?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  partners?: Partner[];
  partnersPageConfig?: PartnersPageConfig;
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
  onSelectDetailSlug?: (slug: string) => void;
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
  newsItems = [],
  storiesHeaders = {
    eyebrow: 'ALUMNI EXCELLENCE',
    title: 'Stories from our graduates',
    description: 'Discover how ASTU alumni are driving innovation, technology leadership, and global impact.',
  },
  stories = [],
  communitySection = {
    title: 'ASTU Alumni Community',
    subtitle: 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates making a difference worldwide.',
  },
  communityPosts = [],
  partnersHeaders,
  partners = [],
  partnersPageConfig,
  accreditation,
  faqHeaders,
  faq,
  ctaSection,
  footer,
  detailPages,
  selectedDetailSlug = 'overview',
  onSelectDetailSlug,
  onSectionClick,
}: HomepageLivePreviewCanvasProps) {
  // Page mode state: can preview Homepage, any of 22+ Sub-pages, Partners page, or Community page
  const [previewMode, setPreviewMode] = useState<'homepage' | 'detail' | 'partners' | 'community'>(() => {
    if (activeSection === 'detail-pages') return 'detail';
    if (activeSection === 'community') return 'community';
    return 'homepage';
  });

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>(faq[0]?.id || null);
  const [openSubFaqIdx, setOpenSubFaqIdx] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync preview mode with activeSection when changed externally
  useEffect(() => {
    if (activeSection === 'detail-pages') {
      setPreviewMode('detail');
    }
  }, [activeSection]);

  // Active hero slides
  const activeSlides = heroSlides.filter((s) => s.active !== false);
  const currentSlide = activeSlides[activeSlideIdx] || activeSlides[0] || {
    id: 'HS-1',
    image: '/images/astu-building.jpg',
    tagline: 'Quality Assurance & Accreditation',
    title: 'Modern Workplace Opportunities',
    description: 'Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement across 5 fields of study.',
  };

  // Auto-scroll preview canvas to clicked section if in homepage mode
  useEffect(() => {
    if (previewMode !== 'homepage' || !activeSection || !containerRef.current) return;
    const targetMap: Record<string, string> = {
      hero: 'preview-section-hero',
      impact: 'preview-section-impact',
      portals: 'preview-section-portals',
      'campus-life': 'preview-section-campus-life',
      gallery: 'preview-section-gallery',
      'events-news': 'preview-section-events-news',
      community: 'preview-section-community',
      'partners-portal': 'preview-section-partners-portal',
      'accreditation-faq': 'preview-section-accreditation-faq',
      'footer-cta': 'preview-section-footer-cta',
    };
    const elId = targetMap[activeSection];
    if (elId) {
      const el = containerRef.current.querySelector(`#${elId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeSection, previewMode]);

  // Active detail page object
  const pagesMap = detailPages || defaultDetailPages;
  const currentDetailSlug = selectedDetailSlug || 'overview';
  const activeDetail: DetailPageItem = pagesMap[currentDetailSlug] || defaultDetailPages[currentDetailSlug] || defaultDetailPages['overview'];

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

  // Current URL string for address bar
  const getCanvasUrl = () => {
    if (previewMode === 'detail') return `https://astu-ams.edu.et/info/${currentDetailSlug}`;
    if (previewMode === 'partners') return 'https://astu-ams.edu.et/partners';
    if (previewMode === 'community') return 'https://astu-ams.edu.et/community';
    return 'https://astu-ams.edu.et/';
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden shadow-xs">
      {/* ── BROWSER CHROME & INTERACTIVE PAGE SWITCHER ── */}
      <div className={`mx-auto w-full ${iw} flex flex-col bg-slate-200 dark:bg-slate-800 border-x border-t border-slate-300 dark:border-slate-700 rounded-t-xl text-[11px]`}>
        {/* Top bar with macOS-style dots and URL input */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-300/60 dark:border-slate-700">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="flex-1 flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-md border border-slate-300/50 dark:border-slate-700 min-w-0">
            <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
            <span className="truncate text-slate-600 dark:text-slate-300 font-mono text-[10px]">
              {getCanvasUrl()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Live Interactive Preview</span>
          </div>
        </div>

        {/* Page Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-100/90 dark:bg-slate-850 border-b border-slate-300/60 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setPreviewMode('homepage');
                if (activeSection === 'detail-pages') onSectionClick?.('hero');
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === 'homepage'
                  ? 'bg-white dark:bg-slate-900 text-[#003580] dark:text-sky-300 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60'
              }`}
            >
              <span>🏠</span>
              <span>Homepage</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPreviewMode('detail');
                onSectionClick?.('detail-pages');
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === 'detail'
                  ? 'bg-white dark:bg-slate-900 text-[#003580] dark:text-sky-300 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="h-3 w-3 text-blue-500" />
              <span>Sub-Pages (/info)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 text-[#003580] text-[9px] font-extrabold">
                {Object.keys(pagesMap).length || 22}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPreviewMode('partners');
                onSectionClick?.('partners-portal');
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === 'partners'
                  ? 'bg-white dark:bg-slate-900 text-[#003580] dark:text-sky-300 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60'
              }`}
            >
              <Handshake className="h-3 w-3 text-emerald-600" />
              <span>Partners Page</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPreviewMode('community');
                onSectionClick?.('community');
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === 'community'
                  ? 'bg-white dark:bg-slate-900 text-[#003580] dark:text-sky-300 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60'
              }`}
            >
              <Globe className="h-3 w-3 text-indigo-600" />
              <span>Community Page</span>
            </button>
          </div>

          {/* Subpage Dropdown selector (visible when in detail preview mode) */}
          {previewMode === 'detail' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-semibold">Active Subpage:</span>
              <select
                value={currentDetailSlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  onSelectDetailSlug?.(slug);
                }}
                className="bg-white dark:bg-slate-900 text-[#003580] dark:text-sky-300 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-0.5 text-[11px] font-bold focus:ring-1 focus:ring-[#003580] outline-none cursor-pointer"
              >
                <optgroup label="Core Stakeholder Portals">
                  <option value="alumni-portal">Alumni Portal (/info/alumni-portal)</option>
                  <option value="employer-portal">Employer Portal (/info/employer-portal)</option>
                  <option value="department-portal">Department Portal (/info/department-portal)</option>
                  <option value="registrar-portal">Registrar Portal (/info/registrar-portal)</option>
                </optgroup>
                <optgroup label="Institutional & Impact">
                  <option value="overview">ASTU-AMS Overview (/info/overview)</option>
                  <option value="impact-numbers">Impact Numbers (/info/impact-numbers)</option>
                  <option value="accreditation-faq">Accreditation & Quality (/info/accreditation-faq)</option>
                  <option value="tracer-studies">Tracer Studies Guide (/info/tracer-studies)</option>
                </optgroup>
                <optgroup label="Campus Life & Facilities">
                  <option value="campus-life">Campus Life & Housing (/info/campus-life)</option>
                  <option value="innovation-labs">Innovation & Research Labs (/info/innovation-labs)</option>
                  <option value="gallery">Campus Gallery (/info/gallery)</option>
                  <option value="video-tour">Virtual Campus Tour (/info/video-tour)</option>
                </optgroup>
                <optgroup label="Network & Careers">
                  <option value="featured-employers">Featured Employers (/info/featured-employers)</option>
                  <option value="alumni-stories">Alumni Stories & Spotlights (/info/alumni-stories)</option>
                  <option value="mentorship">Mentorship Program (/info/mentorship)</option>
                  <option value="chapters">Regional Alumni Chapters (/info/chapters)</option>
                </optgroup>
                <optgroup label="Support & Policies">
                  <option value="contact">Contact & Alumni Office (/info/contact)</option>
                  <option value="faq">Frequently Asked Questions (/info/faq)</option>
                  <option value="privacy">Privacy Policy (/info/privacy)</option>
                  <option value="terms">Terms of Service (/info/terms)</option>
                </optgroup>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── VIEWPORT CONTAINER ── */}
      <div
        ref={containerRef}
        className={`mx-auto w-full ${iw} h-[820px] overflow-y-auto bg-white dark:bg-slate-900 border-x border-b border-slate-300 dark:border-slate-700 shadow-xl rounded-b-xl scroll-smooth select-none`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* ========================================================================= */}
        {/* ── VIEW 1: SUB-PAGE LIVE PREVIEW (/info/:slug) ── */}
        {/* ========================================================================= */}
        {previewMode === 'detail' && activeDetail && (
          <div
            id="preview-section-detail-pages"
            onClick={() => onSectionClick?.('detail-pages')}
            className="cursor-pointer relative"
          >
            <SectionBadge id="detail-pages" label={`Editing ${activeDetail.title}`} />

            {/* Subpage Breadcrumb Header */}
            <div className="bg-[#002244] text-white px-5 py-2.5 text-xs flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="hover:underline">Home</span>
                <span>/</span>
                <span className="hover:underline">Institutional Info</span>
                <span>/</span>
                <span className="text-white font-bold">{activeDetail.title}</span>
              </div>
              <span className="rounded-md bg-amber-400 text-slate-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                Sub-page Live Edit Mode
              </span>
            </div>

            {/* Subpage Hero Banner */}
            <div className="relative bg-[#003580] text-white overflow-hidden py-14 px-6 sm:px-12">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
                style={{ backgroundImage: `url(${activeDetail.image || '/images/astu-building.jpg'})` }}
              />
              <div className="relative z-10 max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>{activeDetail.badge || 'ASTU Official Resource'}</span>
                </div>
                <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                  {activeDetail.title}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl">
                  {activeDetail.subtitle}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {activeDetail.primaryCtaText && (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-[#C8102E] text-white px-5 py-2.5 text-xs font-bold shadow-md">
                      <span>{activeDetail.primaryCtaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {activeDetail.secondaryCtaText && (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/30 text-white px-5 py-2.5 text-xs font-bold">
                      <span>{activeDetail.secondaryCtaText}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Subpage Metric Impact Strip (if present) */}
            {activeDetail.stats && activeDetail.stats.length > 0 && (
              <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-lg">
                  {activeDetail.stats.map((st, sidx) => (
                    <div key={st.id || sidx} className="text-center p-2 border-r last:border-r-0 border-slate-100 dark:border-slate-700">
                      <span className="block text-2xl sm:text-3xl font-black text-[#003580] dark:text-sky-300">{st.value}</span>
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{st.label}</span>
                      {st.desc && <span className="block text-[10px] text-slate-500 mt-0.5">{st.desc}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subpage Content Sections */}
            <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
              {activeDetail.sections && activeDetail.sections.length > 0 ? (
                activeDetail.sections.filter(s => s.active !== false).map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-xs hover:border-[#003580]/40 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-2 w-2 rounded-full bg-[#C8102E]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#003580] dark:text-sky-300">
                        {sec.badge || `Section ${idx + 1}`}
                      </span>
                    </div>
                    <h3 className="font-fraunces text-xl sm:text-2xl font-bold text-[#003580] dark:text-sky-300 leading-snug">
                      {sec.heading}
                    </h3>
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {sec.body}
                    </p>

                    {sec.image && (
                      <div className="mt-5 rounded-xl overflow-hidden border border-slate-200 max-h-72">
                        <img src={sec.image} alt={sec.heading} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {sec.linkText && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-[#003580] gap-1.5">
                        <span>{sec.linkText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>No content sections yet. Add sections using the left CMS editor.</p>
                </div>
              )}

              {/* Subpage FAQs (if present) */}
              {activeDetail.faqs && activeDetail.faqs.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-xs">
                  <h3 className="font-fraunces text-xl font-bold text-[#003580] mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-2">
                    {activeDetail.faqs.map((faqItem, fIdx) => {
                      const isOpen = openSubFaqIdx === fIdx;
                      return (
                        <div key={faqItem.id || fIdx} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenSubFaqIdx(isOpen ? null : fIdx);
                            }}
                            className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#003580]"
                          >
                            <span>{faqItem.question}</span>
                            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                          {isOpen && (
                            <div className="p-3 text-[11px] text-slate-600 bg-slate-50 border-t border-slate-100">
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

            {/* University Footer on Subpage */}
            <footer className="bg-[#001730] text-slate-300 p-6 text-[11px] space-y-3 mt-10">
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
        )}

        {/* ========================================================================= */}
        {/* ── VIEW 2: PARTNERS PAGE LIVE PREVIEW (/partners) ── */}
        {/* ========================================================================= */}
        {previewMode === 'partners' && (
          <div
            id="preview-section-partners-page"
            onClick={() => onSectionClick?.('partners-portal')}
            className="cursor-pointer relative"
          >
            <SectionBadge id="partners-portal" label="Editing Partners Portal & Directory" />

            {/* Partner Header */}
            <div className="bg-[#003580] text-white py-14 px-6 sm:px-12 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-3">
                <Handshake className="h-3.5 w-3.5 text-amber-300" />
                <span>Institutional Collaboration</span>
              </span>
              <h1 className="font-fraunces text-3xl sm:text-4xl font-bold">
                Strategic University Partnerships
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-2xl mx-auto">
                Connecting ASTU students and graduates with corporate recruitment, curriculum development, and national tracer research.
              </p>
            </div>

            {/* Partner Stats */}
            <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
              <div className="grid grid-cols-3 gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-md text-center">
                <div>
                  <span className="block text-2xl font-bold text-[#003580]">{partners.length || 6}+</span>
                  <span className="text-[11px] font-semibold text-slate-600">Active Partners</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-[#003580]">87%</span>
                  <span className="text-[11px] font-semibold text-slate-600">Placement Rate</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-[#003580]">40+</span>
                  <span className="text-[11px] font-semibold text-slate-600">Industry Projects</span>
                </div>
              </div>
            </div>

            {/* Partners Logo Grid */}
            <div className="max-w-5xl mx-auto px-4 py-12">
              <h3 className="font-fraunces text-xl font-bold text-[#003580] text-center mb-6">
                Featured Corporate & Research Partners
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(partners.length > 0 ? partners : [
                  { id: '1', name: 'Ethio Telecom' },
                  { id: '2', name: 'Ethiopian Airlines' },
                  { id: '3', name: 'INSA' },
                  { id: '4', name: 'Huawei' },
                  { id: '5', name: 'Safaricom' },
                  { id: '6', name: 'Commercial Bank of Ethiopia' },
                ]).map((partner: any, idx: number) => (
                  <div key={partner.id || idx} className="rounded-xl border border-slate-200 bg-white p-5 text-center flex flex-col items-center justify-center gap-2 shadow-xs hover:border-[#003580]/40">
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="h-10 max-w-[120px] object-contain" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-[#003580] text-white font-bold flex items-center justify-center text-xs">
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-bold text-[#003580]">{partner.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* University Footer on Partners */}
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
        )}

        {/* ========================================================================= */}
        {/* ── VIEW 3: COMMUNITY PAGE LIVE PREVIEW (/community) ── */}
        {/* ========================================================================= */}
        {previewMode === 'community' && (
          <div
            id="preview-section-community-page"
            onClick={() => onSectionClick?.('community')}
            className="cursor-pointer relative"
          >
            <SectionBadge id="community" label="Editing Alumni Community & Testimonials" />

            <div className="bg-[#003580] text-white py-14 px-6 sm:px-12 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-3">
                <Globe className="h-3.5 w-3.5 text-blue-300" />
                <span>{communitySection?.title || 'ASTU Alumni Community'}</span>
              </span>
              <h1 className="font-fraunces text-3xl sm:text-4xl font-bold">
                Alumni Network Around the World
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-2xl mx-auto">
                {communitySection?.subtitle || 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates.'}
              </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(communityPosts.length > 0 ? communityPosts : [
                  { name: 'Dr. Ruth Alemu', role: 'AI Researcher', text: 'ASTU gave me the laboratory foundation to lead applied research in regional AI labs.', degree: 'BSc Computer Science' },
                  { name: 'Yonas Bekele', role: 'Founder & CEO', text: 'Launched GreenGrid Labs with peer engineers met during our campus senior project.', degree: 'BSc Electrical Eng' },
                  { name: 'Kalkidan Tadesse', role: 'Cloud Lead', text: 'Mentoring ASTU scholars and seeing rapid employment growth across the tech sector.', degree: 'BSc Software Eng' },
                ]).map((post: any, pIdx: number) => (
                  <div key={post.id || pIdx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <Quote className="h-5 w-5 text-blue-400 mb-2" />
                      <p className="text-xs text-slate-600 italic leading-relaxed">"{post.text}"</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#003580] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {post.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#003580]">{post.name}</h4>
                        <p className="text-[10px] text-slate-500">{post.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* University Footer on Community */}
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
        )}

        {/* ========================================================================= */}
        {/* ── VIEW 4: COMPLETE HOMEPAGE LIVE PREVIEW ── */}
        {/* ========================================================================= */}
        {previewMode === 'homepage' && (
          <div>
            {/* ── 0. TOP INSTITUTIONAL BAR ── */}
            <div className="bg-[#002244] text-white/90 px-4 py-1.5 text-[10px] font-medium flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-white/80">{footer.email || 'admin@astu.edu.et'}</span>
                <span className="text-white/80">{footer.phone || '+251 22 110 0001'}</span>
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

            {/* ── 0.2 MAIN NAVBAR ── */}
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
                <span className="hover:text-[#003366] cursor-pointer" onClick={() => setPreviewMode('partners')}>Partners</span>
                <span className="hover:text-[#003366] cursor-pointer" onClick={() => { setPreviewMode('detail'); onSelectDetailSlug?.('overview'); }}>About</span>
                <span className="hover:text-[#003366] cursor-pointer" onClick={() => setPreviewMode('community')}>Community</span>
                <span className="hover:text-[#003366] cursor-pointer" onClick={() => { setPreviewMode('detail'); onSelectDetailSlug?.('contact'); }}>Contact</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1 text-[10px] text-slate-400 w-28">
                  <Search className="h-3 w-3" />
                  <span>Search...</span>
                </div>
                <span className="rounded-lg bg-[#003366] text-white px-3 py-1.5 text-[10px] font-bold shadow-xs cursor-pointer hover:bg-[#002244]">
                  Join Network
                </span>
              </div>
            </div>

            {/* ── 1. HERO SECTION ── */}
            <div
              id="preview-section-hero"
              onClick={() => onSectionClick?.('hero')}
              className={`relative bg-slate-900 text-white min-h-[420px] flex items-center cursor-pointer transition-all ${
                activeSection === 'hero' ? 'ring-4 ring-inset ring-amber-400' : ''
              }`}
            >
              <SectionBadge id="hero" label="Editing Hero & Banner" />

              {/* Background Slide Image with subtle overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url(${currentSlide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />
              </div>

              <div className="relative z-10 w-full max-w-[1180px] mx-auto px-6 py-12">
                {heroBadge && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-4 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {heroBadge}
                  </span>
                )}

                {currentSlide.tagline && (
                  <span className="block text-xs font-bold text-amber-300 uppercase tracking-widest mb-1.5">
                    {currentSlide.tagline}
                  </span>
                )}

                <h1 className="font-fraunces text-2xl sm:text-3xl lg:text-4xl font-black max-w-2xl leading-tight">
                  {currentSlide.title}
                </h1>

                <p className="mt-3 text-xs sm:text-sm text-slate-200 max-w-xl line-clamp-3 leading-relaxed">
                  {currentSlide.description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="rounded-xl bg-[#C8102E] text-white px-5 py-2.5 text-xs font-bold shadow-md">
                    {heroButtons.primaryText || 'Alumni Portal'}
                  </span>
                  <span className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 text-xs font-bold">
                    {heroButtons.secondaryText || 'Employer Network'}
                  </span>
                </div>

                {/* Hero Slide Dots */}
                {activeSlides.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-8">
                    {activeSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveSlideIdx(idx); }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          activeSlideIdx === idx ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── 2. IMPACT STATS & OUTCOMES ── */}
            <div
              id="preview-section-impact"
              onClick={() => onSectionClick?.('impact')}
              className={`relative py-12 px-6 max-w-[1180px] mx-auto cursor-pointer transition-all ${
                activeSection === 'impact' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''
              }`}
            >
              <SectionBadge id="impact" label="Editing Impact Statistics" />

              <div className="text-center mb-8">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
                  {impactHeaders.eyebrow || 'ASTU IMPACT AT A GLANCE'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-sky-300">
                  {impactHeaders.title || 'Connecting Academia to Industry'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                  {impactHeaders.description || 'Institutional tracer analytics and measurable alumni milestones.'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {impactStats.filter(s => s.active !== false).slice(0, 4).map((stat, idx) => {
                  const StatIcon = getDynamicStatIcon(stat, idx);
                  let val = String(stat.value || '').replace(/Major\s*Areas/gi, '').trim();
                  if (!val && idx === 1) val = '5';
                  let suff = String(stat.suffix || '').trim();
                  if (val.endsWith(suff)) suff = '';
                  return (
                    <div key={stat.id || idx} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-[#003366] flex items-center justify-center">
                          <StatIcon className="h-4.5 w-4.5" />
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold text-[#003366] dark:text-sky-300">
                        {val}{suff}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">
                        {stat.label}
                      </p>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#003366]">
                        <span>{stat.action || 'View Details'}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 3. HOW IT WORKS / PORTALS JOURNEY ── */}
            <div
              id="preview-section-portals"
              onClick={() => onSectionClick?.('portals')}
              className={`relative py-12 px-6 max-w-[1180px] mx-auto cursor-pointer transition-all ${
                activeSection === 'portals' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''
              }`}
            >
              <SectionBadge id="portals" label="Editing Journey & How ASTU-AMS Works" />

              <div className="text-center mb-8">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
                  {portalsHeaders.eyebrow || 'GET STARTED'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-sky-300">
                  {portalsHeaders.title || 'How ASTU-AMS Works'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                  {portalsHeaders.description || 'From registration to real impact in four simple steps.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {portals.filter(p => p.active !== false).slice(0, 4).map((portal, idx) => {
                  const IconC = portal.icon && iconMap[portal.icon] ? iconMap[portal.icon] : Users;
                  return (
                    <div key={portal.id || idx} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="h-7 w-7 rounded-lg bg-[#003366] text-white flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <IconC className="h-5 w-5 text-slate-400" />
                        </div>
                        <h4 className="text-sm font-bold text-[#003366] dark:text-sky-300">{portal.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {Array.isArray(portal.points) ? portal.points[0] : (portal.description || 'Verified identity and skill portfolio.')}
                        </p>
                      </div>
                      <span className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#003366]">
                        <span>{portal.cta || 'Learn More'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 4. CAMPUS LIFE & LABS ── */}
            <div
              id="preview-section-campus-life"
              onClick={() => onSectionClick?.('campus-life')}
              className={`relative py-12 px-6 max-w-[1180px] mx-auto cursor-pointer transition-all ${
                activeSection === 'campus-life' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''
              }`}
            >
              <SectionBadge id="campus-life" label="Editing Campus Life & Labs" />

              <div className="text-center mb-8">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
                  {campusLifeHeaders.eyebrow || 'CAMPUS LIFE'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-sky-300">
                  {campusLifeHeaders.title || 'Life at ASTU'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                  {campusLifeHeaders.description || 'Excellence in research, state-of-the-art innovation centers, and vibrant student-alumni life.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {campusLife.filter(c => c.active !== false).slice(0, 3).map((item, idx) => (
                  <div key={item.id || idx} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xs">
                    <div className="h-40 bg-slate-200 relative overflow-hidden">
                      <img src={item.image || '/images/campus-2.jpeg'} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 rounded-md bg-slate-900/80 text-white px-2 py-0.5 text-[9px] font-bold">
                        {item.campus || 'Main Campus'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-[#003366] dark:text-sky-300">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 5. CAMPUS MOMENTS GALLERY ── */}
            <div
              id="preview-section-gallery"
              onClick={() => onSectionClick?.('gallery')}
              className={`relative py-12 px-6 max-w-[1180px] mx-auto cursor-pointer transition-all ${
                activeSection === 'gallery' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''
              }`}
            >
              <SectionBadge id="gallery" label="Editing Campus Gallery" />

              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#003580]">
                  {galleryHeaders?.title && galleryHeaders.title !== 'Campus Life & Moments' ? galleryHeaders.title : 'Campus life'}
                </h2>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>{galleryHeaders?.buttonText || 'View the gallery'}</span>
                  <ArrowRight className="h-3 w-3 text-emerald-600" />
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-[960px] mx-auto pb-4 pt-4 md:pt-10">
                {/* Photo 1: Left (Aspect ratio 0.79) */}
                <div className="flex flex-col">
                  <div className="w-full overflow-hidden bg-slate-100 rounded-none shadow-2xs aspect-[79/100]" style={{ aspectRatio: '79 / 100' }}>
                    <img src="/images/humanitary building.jpg" alt="Main campus, Block B" className="w-full h-full object-cover object-center rounded-none" />
                  </div>
                  <div className="bg-white pt-3 pb-1 text-left rounded-none">
                    <p className="font-fraunces text-sm font-bold text-slate-800">Main campus, Block B</p>
                    <p className="font-mono text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">BLOCK B · OCT 2026</p>
                  </div>
                </div>

                {/* Photo 2: Middle (~23.4% taller aspect ratio 0.64, offset upward) */}
                <div className="flex flex-col md:-mt-8 lg:-mt-10 z-10">
                  <div className="w-full overflow-hidden bg-slate-100 rounded-none shadow-2xs aspect-[64/100]" style={{ aspectRatio: '64 / 100' }}>
                    <img src="https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=800&q=80" alt="Graduation ceremony" className="w-full h-full object-cover object-center rounded-none" onError={(e) => { e.currentTarget.src = '/images/gc7.jpg'; }} />
                  </div>
                  <div className="bg-white pt-3 pb-1 text-left rounded-none">
                    <p className="font-fraunces text-sm font-bold text-slate-800">Graduation ceremony</p>
                    <p className="font-mono text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">MAIN AUDITORIUM · JUL 2026</p>
                  </div>
                </div>

                {/* Photo 3: Right (Matches Photo 1 with aspect ratio 0.79) */}
                <div className="flex flex-col">
                  <div className="w-full overflow-hidden bg-slate-100 rounded-none shadow-2xs aspect-[79/100]" style={{ aspectRatio: '79 / 100' }}>
                    <img src="/images/electriclabs.jpeg" alt="Innovation and collaboration" className="w-full h-full object-cover object-center rounded-none" />
                  </div>
                  <div className="bg-white pt-3 pb-1 text-left rounded-none">
                    <p className="font-fraunces text-sm font-bold text-slate-800">Innovation and collaboration</p>
                    <p className="font-mono text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">CSE LAB 3 · SEP 2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 6. EVENTS, WORKSHOPS & NOTICES ── */}
            <div
              id="preview-section-events-news"
              onClick={() => onSectionClick?.('events-news')}
              className={`relative py-12 px-6 max-w-[1180px] mx-auto cursor-pointer transition-all ${
                activeSection === 'events-news' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''
              }`}
            >
              <SectionBadge id="events-news" label="Editing Events & Notices" />

              <div className="text-center mb-8">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
                  {eventsHeaders?.eyebrow || 'EVENTS & WORKSHOPS'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-sky-300">
                  {eventsHeaders?.title || 'Upcoming Alumni Events'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                  {eventsHeaders?.description || 'Networking, learning, and professional growth opportunities.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(events.length > 0 ? events.slice(0, 3) : [
                  { id: '1', title: 'ASTU Alumni Carnival 2026', date: 'April 25-26, 2026', location: 'Main Campus' },
                  { id: '2', title: 'DAAD Alumni Workshop', date: 'March 2026', location: 'Research Center' },
                  { id: '3', title: 'Tech Career Fair 2026', date: 'May 10, 2026', location: 'ICT Auditorium' },
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
            </div>

            {/* ── 7. FEATURED ALUMNI SUCCESS STORIES SPOTLIGHT ── */}
            <div
              id="preview-section-stories"
              onClick={() => onSectionClick?.('events-news')}
              className="relative py-12 px-6 max-w-[1180px] mx-auto cursor-pointer"
            >
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="text-[10px] font-bold text-[#C8102E] uppercase tracking-widest block mb-1">
                    {storiesHeaders?.eyebrow || 'ALUMNI EXCELLENCE'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#003580] leading-tight">
                    {storiesHeaders?.title || 'Stories from our graduates'}
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#003580] flex items-center gap-1">
                  <span>View all stories</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-7 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-1">Featured Alumna</span>
                    <h3 className="text-lg font-bold text-[#003580]">Dr. Ruth Alemu</h3>
                    <p className="text-xs text-slate-500 font-medium">AI Research Scientist, Addis Ababa</p>
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 italic">
                      "After graduating from ASTU's Computer Science program, Ruth joined a leading AI research lab and has published 18 applied machine learning papers."
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#003580]">
                    <span>Read story</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class of 2016</span>
                    <h4 className="text-sm font-bold text-[#003580] mt-1">Yonas Bekele</h4>
                    <p className="text-xs text-slate-500">Founder & CEO, GreenGrid Labs</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">"Delivering clean, decentralized energy infrastructure to over 40 industrial parks."</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class of 2019</span>
                    <h4 className="text-sm font-bold text-[#003580] mt-1">Kalkidan Tadesse</h4>
                    <p className="text-xs text-slate-500">Cloud Platform Lead, Ethio Telecom</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">"Credits ASTU's hands-on laboratory curriculum for her rapid career trajectory."</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 8. ALUMNI COMMUNITY SECTION ── */}
            <div
              id="preview-section-community"
              onClick={() => onSectionClick?.('community')}
              className={`relative py-12 px-6 max-w-[1180px] mx-auto cursor-pointer transition-all ${
                activeSection === 'community' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''
              }`}
            >
              <SectionBadge id="community" label="Editing Community Section" />

              <div className="rounded-3xl bg-[#003580] text-white p-8 md:p-12 relative overflow-hidden">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-2">
                    <Globe className="h-3 w-3" />
                    <span>{communitySection?.title || 'ASTU Alumni Community'}</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black">Alumni Network Around the World</h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {communitySection?.subtitle || 'Connect your alumni network globally and help expand the community of Adama Science and Technology University graduates.'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {(communityPosts.length > 0 ? communityPosts.slice(0, 3) : [
                    { name: 'Abebe Yosef', role: 'Software Engineer', text: 'I landed my new role after using ASTU-AMS job matching and mentorship support.' },
                    { name: 'Bekele Kebede', role: 'Employer Partner', text: 'Hiring from ASTU-AMS has been efficient. We found strong engineering candidates.' },
                    { name: 'Helina Sileshi', role: 'Mentor & Alumni', text: 'Proud to mentor ASTU students through the AMS platform.' },
                  ]).map((p: any, idx: number) => (
                    <div key={p.id || idx} className="rounded-2xl bg-white/10 border border-white/15 p-5 backdrop-blur-md">
                      <Quote className="h-5 w-5 text-blue-300/60 mb-2" />
                      <p className="text-xs text-slate-200 italic line-clamp-3">"{p.text}"</p>
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <span className="text-xs font-bold text-white block truncate">{p.name}</span>
                        <span className="text-[10px] text-blue-200 block truncate">{p.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 9. PARTNER COMPANIES CAROUSEL ── */}
            <div
              id="preview-section-partners-portal"
              onClick={() => onSectionClick?.('partners-portal')}
              className={`relative py-12 px-6 max-w-[1180px] mx-auto cursor-pointer transition-all ${
                activeSection === 'partners-portal' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''
              }`}
            >
              <SectionBadge id="partners-portal" label="Editing Partners" />

              <div className="text-center mb-8">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
                  {partnersHeaders?.eyebrow || 'OUR PARTNERS'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-sky-300">
                  {partnersHeaders?.title || 'Corporate & Institutional Partners'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
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
                  <div key={p.id || idx} className="rounded-xl border border-slate-200 bg-white p-3 text-center font-bold text-[11px] text-slate-700 shadow-2xs">
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 10. QUALITY ASSURANCE & ACCREDITATION ── */}
            {accreditation && (
              <div
                id="preview-section-accreditation-faq"
                onClick={() => onSectionClick?.('accreditation-faq')}
                className={`relative mx-auto max-w-[1180px] px-6 my-10 cursor-pointer transition-all ${
                  activeSection === 'accreditation-faq' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''
                }`}
              >
                <SectionBadge id="accreditation-faq" label="Editing Accreditation & FAQ" />
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-6 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="max-w-xl">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
                      {accreditation.eyebrow || 'Quality Assurance'}
                    </span>
                    <h3 className="text-xl font-bold text-[#003366] dark:text-sky-300">
                      {accreditation.title || 'Data-Driven Accreditation & Excellence'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{accreditation.description}</p>
                  </div>
                  <button type="button" className="rounded-xl bg-[#003366] text-white px-5 py-2 text-xs font-bold shrink-0">
                    {accreditation.buttonText || 'View Impact Numbers'}
                  </button>
                </div>
              </div>
            )}

            {/* ── 11. FREQUENTLY ASKED QUESTIONS ── */}
            <div
              id="preview-section-accreditation-faq"
              onClick={() => onSectionClick?.('accreditation-faq')}
              className={`relative mx-auto max-w-[800px] px-6 my-10 cursor-pointer transition-all ${
                activeSection === 'accreditation-faq' ? 'ring-4 ring-inset ring-amber-400 rounded-3xl' : ''
              }`}
            >
              <div className="text-center mb-6">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
                  {faqHeaders.eyebrow || 'FAQ'}
                </span>
                <h2 className="text-2xl font-black text-[#003366] dark:text-sky-300">
                  {faqHeaders.title || 'Frequently Asked Questions'}
                </h2>
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

            {/* ── 12. BOTTOM CTA BANNER & UNIVERSITY FOOTER ── */}
            <div
              id="preview-section-footer-cta"
              onClick={() => onSectionClick?.('footer-cta')}
              className={`cursor-pointer transition-all ${
                activeSection === 'footer-cta' ? 'ring-4 ring-inset ring-amber-400' : ''
              }`}
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
        )}
      </div>
    </div>
  );
}
