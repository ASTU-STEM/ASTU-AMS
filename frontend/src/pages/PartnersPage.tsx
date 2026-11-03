import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Building2,
  Building,
  ArrowRight,
  Handshake,
  ShieldCheck,
  Star,
  MapPin,
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  Share2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Tag,
  Copy,
  Check,
  Calendar,
  MessageSquare,
  TrendingUp,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  BookOpen,
  GraduationCap,
  Award,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaginationBar from '../components/PaginationBar';
import CompanyDetailModal from '../components/CompanyDetailModal';
import ShareModal, { ShareItem } from '../components/ShareModal';
import { partnerLogos } from '../components/PartnerLogos';
import { usePublicMetrics } from '../services/publicMetrics.service';
import homepageCmsService, {
  defaultPartnersPageConfig,
  defaultPartnersList,
  PartnersPageConfig,
  Partner,
} from '../features/admin/services/homepageCms.service';
import PartnerMarquee from '../components/PartnerMarquee';
import { mediaUrl } from '../config';

export type ViewMode = 'grid' | 'list';
export type SortMode = 'featured' | 'name-asc' | 'name-desc';
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 'All'] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

/** Live partners are loaded from the backend API / CMS. */
const POPULAR_SEARCH_TOPICS = ['Telecom', 'Cloud', 'AI', 'Aviation', 'FinTech', 'Cybersecurity', 'Energy'];

export default function PartnersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { metrics } = usePublicMetrics();

  // Async data state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pageConfig, setPageConfig] = useState<PartnersPageConfig>(defaultPartnersPageConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search & Filter state
  const [partnerSearch, setPartnerSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const [pageSize, setPageSize] = useState<PageSizeOption>(12);
  const [partnerPage, setPartnerPage] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Featured carousel state
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);
  const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<Partner | null>(null);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>('PF-1');

  const getBenefitIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Users': return Users;
      case 'Briefcase': return Briefcase;
      case 'MessageSquare': return MessageSquare;
      case 'Search': return Search;
      case 'TrendingUp': return TrendingUp;
      case 'Handshake': return Handshake;
      default: return Building2;
    }
  };

  const directoryRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Quick keyboard shortcuts (press / or ⌘K to focus search, Esc to clear search if focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        if (partnerSearch) {
          setPartnerSearch('');
        } else {
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [partnerSearch]);

  // Load backend partner settings on mount
  const loadPartnerData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [settings, publishedPartners] = await Promise.all([
        homepageCmsService.fetchSettings().catch(() => null),
        homepageCmsService.fetchPublishedPartners().catch(() => []),
      ]);

      if (settings?.partnersPage) {
        setPageConfig(settings.partnersPage);
      }

      // Live partners from API (published partners or settings.partners or default fallback)
      const list = (publishedPartners && publishedPartners.length > 0)
        ? publishedPartners
        : (Array.isArray(settings?.partners) && settings.partners.length > 0)
          ? settings.partners.filter((p: any) => p.active !== false)
          : defaultPartnersList;

      setPartners(list && list.length > 0 ? list : defaultPartnersList);
    } catch {
      setLoadError('Unable to load partner records.');
      setPartners(defaultPartnersList);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartnerData();
  }, [loadPartnerData]);

  // Synchronize CMS updates across tabs
  useEffect(() => {
    const handleCmsUpdate = () => {
      loadPartnerData();
    };
    window.addEventListener('astu-cms-content-changed', handleCmsUpdate);
    window.addEventListener('astu-cms-homepage-updated', handleCmsUpdate);
    return () => {
      window.removeEventListener('astu-cms-content-changed', handleCmsUpdate);
      window.removeEventListener('astu-cms-homepage-updated', handleCmsUpdate);
    };
  }, [loadPartnerData]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(partnerSearch);
    }, 200);
    return () => clearTimeout(timer);
  }, [partnerSearch]);

  // Deep linking: tab navigation
  useEffect(() => {
    const raw = (searchParams.get('tab') || '').toLowerCase();
    if (!raw) return;
    const tabMap: Record<string, string> = {
      stakeholders: 'partner-discovery',
      employers: 'partner-discovery',
      recruitment: 'partner-discovery',
      tracks: 'partner-discovery',
      benefits: 'partner-stats',
    };
    const targetId = tabMap[raw] || raw;
    const timer = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  // Deep linking: direct partner detail modal
  useEffect(() => {
    const partnerId = searchParams.get('partner');
    if (!partnerId || partners.length === 0) return;
    const decoded = decodeURIComponent(partnerId).toLowerCase();
    const found = partners.find(
      (p) => p.id?.toLowerCase() === decoded || p.name?.toLowerCase() === decoded
    );
    if (found) setSelectedCompanyModal(found);
  }, [searchParams, partners]);

  // URL search query synchronization
  useEffect(() => {
    const q = searchParams.get('search');
    const t = searchParams.get('type');
    if (q !== null && q !== partnerSearch) setPartnerSearch(q);
    if (t !== null && t !== typeFilter) setTypeFilter(t);
  }, [searchParams, partnerSearch, typeFilter]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setPartnerPage(0);
  }, [debouncedSearch, typeFilter, sortMode, pageSize]);

  // Dynamically compute category counts from active partners
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { All: partners.length };
    partners.forEach((p) => {
      const t = p.partnershipType?.trim();
      if (t) {
        counts[t] = (counts[t] || 0) + 1;
      }
    });
    return counts;
  }, [partners]);

  // Dynamic distinct sectors count
  const distinctSectorsCount = useMemo(() => {
    const sectors = new Set<string>();
    partners.forEach((p) => {
      if (p.industry) {
        sectors.add(p.industry.split('&')[0].trim());
      }
    });
    return sectors.size;
  }, [partners]);

  // Filter partners
  const filteredPartners = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return partners.filter((p) => {
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        (p.industry || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.partnershipType || '').toLowerCase().includes(q) ||
        (p.openings || '').toLowerCase().includes(q) ||
        (p.tags || []).some((tag) => tag.toLowerCase().includes(q));

      const matchesType =
        typeFilter === 'All' ||
        (p.partnershipType || '').toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [partners, debouncedSearch, typeFilter]);

  // Sort partners
  const sortedPartners = useMemo(() => {
    const copy = [...filteredPartners];
    switch (sortMode) {
      case 'featured':
        return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      case 'name-asc':
        return copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name-desc':
        return copy.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default:
        return copy;
    }
  }, [filteredPartners, sortMode]);

  // Pagination calculation
  const effectivePageSize =
    pageSize === 'All' ? Math.max(1, sortedPartners.length) : (pageSize as number);
  const totalPartnerPages = Math.max(1, Math.ceil(sortedPartners.length / effectivePageSize));
  const safePartnerPage = Math.min(partnerPage, totalPartnerPages - 1);
  const pagedPartners = sortedPartners.slice(
    safePartnerPage * effectivePageSize,
    safePartnerPage * effectivePageSize + effectivePageSize
  );

  const handlePartnerPageChange = (newPage: number) => {
    setPartnerPage(newPage);
    if (directoryRef.current) {
      directoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClearFilters = useCallback(() => {
    setPartnerSearch('');
    setDebouncedSearch('');
    setTypeFilter('All');
    setSortMode('featured');
    setPageSize(12);
    setPartnerPage(0);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Featured partners collection
  const featuredPartners = useMemo(() => {
    return partners.filter((p) => p.featured);
  }, [partners]);

  // Featured carousel navigation
  const FEATURED_PER_VIEW = 3;
  const totalFeaturedSlides = Math.max(1, Math.ceil(featuredPartners.length / FEATURED_PER_VIEW));
  const maxFeaturedSlide = totalFeaturedSlides - 1;

  const handleNextFeatured = useCallback(() => {
    setFeaturedSlideIndex((prev) => (prev < maxFeaturedSlide ? prev + 1 : 0));
  }, [maxFeaturedSlide]);

  const handlePrevFeatured = useCallback(() => {
    setFeaturedSlideIndex((prev) => (prev > 0 ? prev - 1 : maxFeaturedSlide));
  }, [maxFeaturedSlide]);

  // Auto-advance featured partners carousel every 6 seconds when not paused
  useEffect(() => {
    if (totalFeaturedSlides <= 1 || isFeaturedPaused) return;
    const interval = setInterval(() => {
      handleNextFeatured();
    }, 6000);
    return () => clearInterval(interval);
  }, [totalFeaturedSlides, isFeaturedPaused, handleNextFeatured]);

  const handleCopyPartnerLink = (partner: Partner) => {
    const url = `${window.location.origin}/partners?partner=${encodeURIComponent(partner.id || partner.name)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(partner.id);
        toast.success(`Copied link for ${partner.name}!`);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      toast.success(url);
    }
  };

  const handleTopicClick = (topic: string) => {
    if (partnerSearch.toLowerCase() === topic.toLowerCase()) {
      setPartnerSearch('');
    } else {
      setPartnerSearch(topic);
    }
    if (directoryRef.current) {
      directoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render standardized partner logo
  const renderLogo = (partner: Partner, sizeClass = 'h-10 w-10 sm:h-12 sm:w-12') => {
    const LogoComp = partnerLogos[partner.name];
    if (LogoComp) {
      return (
        <div className={`flex items-center justify-center shrink-0 ${sizeClass}`}>
          <LogoComp className="max-h-full max-w-full object-contain partner-logo-svg" />
        </div>
      );
    }
    if (partner.logo) {
      return (
        <img
          src={mediaUrl(partner.logo)}
          alt={`${partner.name} logo`}
          className={`shrink-0 object-contain partner-logo-img ${sizeClass}`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#001f3f] to-blue-700 text-white font-bold text-xs sm:text-sm shrink-0 shadow-xs ${sizeClass}`}
        aria-hidden="true"
      >
        {partner.name?.slice(0, 2).toUpperCase() || 'PT'}
      </div>
    );
  };

  // Partnership badge color mapping
  const getBadgeStyle = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'strategic':
        return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-900/60';
      case 'research':
        return 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-900/60';
      case 'technology':
        return 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border-teal-200/80 dark:border-teal-900/60';
      case 'recruitment':
        return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-900/60';
      case 'government':
        return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-900/60';
      default:
        return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* ── Strict Constraint: Navbar is untouched ── */}
      <Navbar />

      <main>
        {/* ── 1. Page Introduction (Compact, Institutional) ── */}
        <section
          id="partner-intro"
          className="relative overflow-hidden bg-gradient-to-b from-[#001f3f] via-[#002b5c] to-[#001830] text-white pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-blue-900/40"
        >
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:2rem_2rem] pointer-events-none" />
          <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-blue-200 mb-3.5 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{pageConfig.heroBadge || 'ASTU Industry Linkage & Corporate Alliances'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
                {pageConfig.heroTitle || 'Partner with ASTU to Access'}{' '}
                <span className="text-amber-400 dark:text-emerald-400">
                  {pageConfig.heroHighlight || 'Top Engineering & Tech Graduates'}
                </span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mb-6">
                {pageConfig.heroSubtitle ||
                  'Fostering strategic university-industry collaborations, graduate recruitment pipelines, and applied research with Ethiopia’s leading technology enterprises, public agencies, and global academic institutions.'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(pageConfig.heroPrimaryCtaLink || '/employers/register')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-950/40 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{pageConfig.heroPrimaryCtaText || 'Register as Partner'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(pageConfig.heroSecondaryCtaLink || '/login')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all hover:-translate-y-0.5 cursor-pointer backdrop-blur-xs"
                >
                  <Building className="w-3.5 h-3.5 text-blue-300" />
                  <span>{pageConfig.heroSecondaryCtaText || 'Employer Portal'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const outcomesEl = document.getElementById('partner-outcomes');
                    if (outcomesEl) outcomesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer backdrop-blur-xs"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Accreditation Outcomes &darr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShareItem({
                      title: 'ASTU Industry & Partner Directory',
                      subtitle: 'Corporate partners and research alliances at ASTU',
                      text: 'Explore official partner organizations, research consortia, and graduate recruitment collaborations at Adama Science and Technology University.',
                      url: '/partners',
                      badge: 'Partners Directory',
                      type: 'page',
                    });
                    setIsShareOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer backdrop-blur-xs"
                  title="Share partner directory"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-300" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Partner Movement Marquee Strip ── */}
        <section
          aria-label="Partner Organizations Continuous Showcase"
          className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 py-6 backdrop-blur-xs"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                Official Strategic &amp; Enterprise Partners
              </p>
            </div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
              Hover to pause &bull; Click any partner to view details
            </span>
          </div>
          <PartnerMarquee
            partners={partners}
            onPartnerClick={(p) => setSelectedCompanyModal(p)}
          />
        </section>

        {/* ── 2. Meaningful Partner Statistics (Genuine Backend Data Only) ── */}
        <section
          id="partner-stats"
          className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6"
          aria-label="Partner Statistics"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-500/40 transition-all hover:shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {partners.length}
                  </span>
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active Partners</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Enterprise &amp; Public Allies</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500/40 transition-all hover:shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {distinctSectorsCount}
                  </span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Industry Sectors</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Telecom, AI, Energy, Aviation</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-500/40 transition-all hover:shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {partners.filter((p) => p.featured || p.partnershipType === 'Strategic').length}
                  </span>
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400">
                    <Handshake className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Strategic MoUs</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Formal University Agreements</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-sky-500/40 transition-all hover:shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {metrics.registeredAlumniFormatted && metrics.registeredAlumniFormatted !== '—'
                      ? metrics.registeredAlumniFormatted
                      : '—'}
                  </span>
                  <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Verified Alumni</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Registered in AMS Platform</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Partner Discovery (Search, Dynamic Topic Chips & Filters) ── */}
        <section
          id="partner-discovery"
          ref={directoryRef}
          className="pt-10 pb-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Partner Discovery"
        >
          {/* Search Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Search className="w-3 h-3" />
                <span>Partner Discovery</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Search &amp; Filter Organizations
              </h2>
            </div>

            {/* Search Input Box with keyboard hint */}
            <div className="relative w-full sm:w-80 md:w-96">
              <label htmlFor="partner-search-input" className="sr-only">
                Search partners by company name, sector, or keyword
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                id="partner-search-input"
                type="text"
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                placeholder="Search by name, sector, location, skills..."
                className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {partnerSearch ? (
                  <button
                    type="button"
                    onClick={() => setPartnerSearch('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                    title="Clear search (Esc)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                    /
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Quick topic tags with active toggle */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs text-slate-500 dark:text-slate-400 no-scrollbar">
            <span className="font-medium shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-blue-500" />
              <span>Topics:</span>
            </span>
            {POPULAR_SEARCH_TOPICS.map((topic) => {
              const isActive = partnerSearch.toLowerCase() === topic.toLowerCase();
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleTopicClick(topic)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                  }`}
                >
                  <span>#{topic}</span>
                  {isActive && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Dynamic Category Filter Pills */}
          <div
            className="flex overflow-x-auto space-x-2 pb-2 mb-4 no-scrollbar"
            role="tablist"
            aria-label="Filter partners by category"
          >
            {Object.keys(typeCounts).map((catKey) => {
              const isActive = typeFilter === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTypeFilter(catKey)}
                  className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{catKey === 'All' ? 'All Partners' : catKey}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {typeCounts[catKey] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active filter chips & Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                Showing{' '}
                <strong className="text-slate-900 dark:text-white">
                  {sortedPartners.length === 0
                    ? 0
                    : safePartnerPage * effectivePageSize + 1}
                  –{Math.min((safePartnerPage + 1) * effectivePageSize, sortedPartners.length)}
                </strong>{' '}
                of <strong className="text-slate-900 dark:text-white">{sortedPartners.length}</strong> partners
                {sortedPartners.length !== partners.length && ` (filtered from ${partners.length})`}
              </span>

              {/* Individual Active Filter Chips */}
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-200 dark:border-blue-900">
                  <span>"{debouncedSearch}"</span>
                  <button
                    type="button"
                    onClick={() => setPartnerSearch('')}
                    className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5"
                    title="Remove query filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {typeFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold border border-purple-200 dark:border-purple-900">
                  <span>{typeFilter}</span>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('All')}
                    className="hover:text-purple-900 dark:hover:text-white cursor-pointer ml-0.5"
                    title="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(typeFilter !== 'All' || debouncedSearch) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear all</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <label htmlFor="partner-sort-select" className="text-slate-400 font-medium">
                  Sort:
                </label>
                <select
                  id="partner-sort-select"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                </select>
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Show:</span>
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPageSize(size)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        pageSize === size
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Layout Switcher */}
              <div
                className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5"
                role="group"
                aria-label="View layout switch"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Table list view"
                  aria-pressed={viewMode === 'list'}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Featured Partners (Supported Records Only with Auto-Advance) ── */}
        {featuredPartners.length > 0 && !debouncedSearch && typeFilter === 'All' && (
          <section
            id="featured-partners"
            className="pb-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Featured Strategic Partners"
            onMouseEnter={() => setIsFeaturedPaused(true)}
            onMouseLeave={() => setIsFeaturedPaused(false)}
          >
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/40 to-blue-950/40 border border-blue-900/30">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Featured Strategic Partners
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">
                    ({featuredSlideIndex + 1}/{totalFeaturedSlides})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Slide Indicator Dots */}
                  {totalFeaturedSlides > 1 && (
                    <div className="hidden sm:flex items-center gap-1.5 mr-2">
                      {Array.from({ length: totalFeaturedSlides }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFeaturedSlideIndex(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            featuredSlideIndex === idx
                              ? 'w-5 bg-blue-500'
                              : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                          }`}
                          title={`Go to slide ${idx + 1}`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevFeatured}
                      aria-label="Previous featured partners"
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextFeatured}
                      aria-label="Next featured partners"
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Featured Cards Rail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {featuredPartners
                  .slice(
                    featuredSlideIndex * FEATURED_PER_VIEW,
                    featuredSlideIndex * FEATURED_PER_VIEW + FEATURED_PER_VIEW
                  )
                  .map((partner) => (
                    <div
                      key={partner.id}
                      onClick={() => setSelectedCompanyModal(partner)}
                      className="group flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/60 transition-all cursor-pointer shadow-xs hover:-translate-y-0.5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-1">
                        {renderLogo(partner, 'h-8 w-8')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {partner.name}
                          </h4>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded shrink-0">
                            {partner.partnershipType || 'Strategic'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {partner.industry}
                        </p>
                        {partner.openings && (
                          <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400 truncate mt-1">
                            {partner.openings}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 5. Partner Directory (Responsive Grid & Dense Table) ── */}
        <section
          id="partner-directory"
          className="pb-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Partner Directory Grid"
        >
          {/* Error Message */}
          {loadError && (
            <div className="flex items-center gap-2 p-3.5 mb-6 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loadError}</span>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3"
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
                  <div className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Zero State / Empty State with Interactive Suggestions */}
          {!isLoading && sortedPartners.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-12 text-center bg-white dark:bg-slate-900 my-4 shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                {partners.length === 0 ? 'No Partner Records Published Yet' : 'No Matching Partner Records Found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                {partners.length === 0 ? (
                  <>Partner organizations published via the ASTU Admin CMS or backend API will appear here automatically.</>
                ) : debouncedSearch ? (
                  <>
                    We couldn't find any partners matching{' '}
                    <strong className="text-slate-800 dark:text-slate-200">"{debouncedSearch}"</strong>
                    {typeFilter !== 'All' ? ` in category "${typeFilter}"` : ''}. Try another keyword or explore suggested topics below.
                  </>
                ) : (
                  <>No partners found for the selected category <strong className="text-slate-800 dark:text-slate-200">"{typeFilter}"</strong>.</>
                )}
              </p>

              {partners.length > 0 && (
                <>
                  {/* Clickable suggested searches */}
                  <div className="flex flex-col items-center justify-center gap-2 mb-6">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Suggested searches:</span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {['Telecom', 'Aviation', 'Cybersecurity', 'Huawei', 'Banking', 'Energy'].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setPartnerSearch(suggestion);
                            setTypeFilter('All');
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                        >
                          #{suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset All Filters</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Grid View */}
          {!isLoading && viewMode === 'grid' && sortedPartners.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {pagedPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-0.5 transition-all duration-300 relative"
                >
                  {/* Top Badges */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {partner.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  <div>
                    {/* Standardized Logo Container with Status Pulse */}
                    <div className="flex items-center justify-between mb-3.5 pr-14">
                      <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
                        {renderLogo(partner, 'h-10 w-10 sm:h-11 sm:w-11')}
                      </div>
                      
                      {/* Active Status Pulse Indicator */}
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span>Active Partner</span>
                      </span>
                    </div>

                    {/* Organization Name & Sector */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {partner.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                      {partner.industry || 'Technology & Engineering'}
                    </div>

                    {/* Category Badge & Openings Tag */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getBadgeStyle(partner.partnershipType)}`}>
                        {partner.partnershipType || 'Enterprise'}
                      </span>
                      {partner.mouYear && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                          <Calendar className="w-2.5 h-2.5 text-blue-500" />
                          <span>Est. {partner.mouYear}</span>
                        </span>
                      )}
                      {partner.openings && (
                        <span className="text-[10px] font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                          {partner.openings}
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mt-3">
                      {partner.description ||
                        `${partner.name} collaborates with ASTU through accredited graduate hiring pipelines and curriculum competency reviews.`}
                    </p>

                    {/* Interactive Tags preview (clicking sets search) */}
                    {Array.isArray(partner.tags) && partner.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {partner.tags.slice(0, 3).map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTopicClick(t);
                            }}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                            title={`Filter by ${t}`}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Location */}
                    {partner.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{partner.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions: Non-conflicting buttons */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCompanyModal(partner)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={`Visit ${partner.name} official website`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyPartnerLink(partner)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={copiedId === partner.id ? 'Copied!' : 'Copy direct link'}
                    >
                      {copiedId === partner.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShareItem({
                          id: partner.id,
                          title: `${partner.name} — ASTU Industry Partner`,
                          subtitle: partner.industry || 'Corporate Partner',
                          text: `${partner.name} is an official partner organization of ASTU (${partner.partnershipType}). Explore graduate recruitment and collaborative innovation pipelines.`,
                          url: `/partners?partner=${encodeURIComponent(partner.id || partner.name)}`,
                          badge: 'ASTU Partner',
                          type: 'page',
                        });
                        setIsShareOpen(true);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={`Share ${partner.name}`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dense List View */}
          {!isLoading && viewMode === 'list' && sortedPartners.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th scope="col" className="py-3 pl-5 pr-4">Organization &amp; Sector</th>
                      <th scope="col" className="px-4 py-3">Category</th>
                      <th scope="col" className="px-4 py-3">Location</th>
                      <th scope="col" className="px-4 py-3">Opportunities</th>
                      <th scope="col" className="py-3 pl-4 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pagedPartners.map((partner) => (
                      <tr
                        key={partner.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        onClick={() => setSelectedCompanyModal(partner)}
                      >
                        <td className="py-3.5 pl-5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-1 shrink-0">
                              {renderLogo(partner, 'h-6 w-6')}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                <span>{partner.name}</span>
                                {partner.featured && (
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                {partner.industry || 'Technology & Engineering'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyle(partner.partnershipType)}`}>
                            {partner.partnershipType || 'Partner'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{partner.location || 'Ethiopia'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-xs text-blue-600 dark:text-blue-400">
                            {partner.openings || 'Collaborative Projects'}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 pr-5 text-right whitespace-nowrap">
                          <div
                            className="inline-flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedCompanyModal(partner)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold transition-all text-xs cursor-pointer"
                            >
                              Details
                            </button>
                            {partner.website && (
                              <a
                                href={partner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title={`Visit ${partner.name} Website`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyPartnerLink(partner)}
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title={copiedId === partner.id ? 'Copied!' : 'Copy direct link'}
                            >
                              {copiedId === partner.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShareItem({
                                  id: partner.id,
                                  title: `${partner.name} — ASTU Industry Partner`,
                                  subtitle: partner.industry || 'Corporate Partner',
                                  text: `${partner.name} is an official partner organization of ASTU (${partner.partnershipType}). Explore graduate recruitment and collaborative innovation pipelines.`,
                                  url: `/partners?partner=${encodeURIComponent(partner.id || partner.name)}`,
                                  badge: 'ASTU Partner',
                                  type: 'page',
                                });
                                setIsShareOpen(true);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title={`Share ${partner.name}`}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── 6. Pagination (When Needed for Large Datasets) ── */}
          {!isLoading && sortedPartners.length > 0 && pageSize !== 'All' && totalPartnerPages > 1 && (
            <div className="mt-8">
              <PaginationBar
                currentPage={safePartnerPage}
                totalPages={totalPartnerPages}
                total={sortedPartners.length}
                pageSize={effectivePageSize}
                onPageChange={handlePartnerPageChange}
                noun="partner organizations"
              />
            </div>
          )}
        </section>

        {/* ── 7. Institutional Outcomes, Tracer Studies & Employer Insight ── */}
        <section
          id="partner-outcomes"
          className="py-14 sm:py-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors"
          aria-label="Institutional Outcomes and Accreditation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs font-bold uppercase tracking-wider text-astu-red mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Institutional Outcomes &amp; Quality Assurance</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Tracer Studies, Mentorship &amp; Employer Insight
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Live CMS blocks that keep accreditation, mentoring, and industry feedback connected to the public portal.
              </p>
            </div>

            {/* 3 Outcome Feature Cards */}
            <div className="grid gap-5 md:grid-cols-3 mb-10">
              {/* Card 1: Tracer Study 2026 */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all">
                <div>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Tracer Study 2026
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Help ASTU maintain accreditation by completing your career outcome survey. Your responses drive curriculum updates and institutional quality assurance.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
                  <dl className="grid grid-cols-2 gap-3 text-center mb-3">
                    <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200/60 dark:border-slate-800">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Response</dt>
                      <dd className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">67.9%</dd>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200/60 dark:border-slate-800">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Batch</dt>
                      <dd className="text-base font-black text-slate-900 dark:text-white mt-0.5">2024</dd>
                    </div>
                  </dl>
                  <p className="text-[11px] font-bold text-astu-red flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Deadline: August 31, 2026</span>
                  </p>
                </div>
              </div>

              {/* Card 2: Mentorship Network */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all">
                <div>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Mentorship Network
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Mentors and mentees connected through ASTU-AMS career guidance programs.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
                  <dl className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200/60 dark:border-slate-800">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mentors</dt>
                      <dd className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">45</dd>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200/60 dark:border-slate-800">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mentees</dt>
                      <dd className="text-base font-black text-slate-900 dark:text-white mt-0.5">210</dd>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200/60 dark:border-slate-800">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sessions</dt>
                      <dd className="text-base font-black text-slate-900 dark:text-white mt-0.5">380</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => navigate('/info/mentorship')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
                  >
                    <span>Explore mentorship</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 3: Employer Competency Feedback */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all">
                <div>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Employer Competency Feedback
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Partner employers rate graduate competencies to help departments align curricula with industry needs.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
                  <dl className="grid grid-cols-2 gap-3 text-center mb-4">
                    <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200/60 dark:border-slate-800">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submissions</dt>
                      <dd className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">128</dd>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200/60 dark:border-slate-800">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Companies</dt>
                      <dd className="text-base font-black text-slate-900 dark:text-white mt-0.5">24</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => navigate('/employers/register')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 cursor-pointer"
                  >
                    <span>Submit Employer Review</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Accreditation & Quality Assurance Banner */}
            <div className="overflow-hidden rounded-2xl border border-blue-900/20 bg-gradient-to-br from-[#001f3f] via-[#002f6c] to-[#001730] p-6 sm:p-8 text-white shadow-xl">
              <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-xs mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Quality Assurance</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mb-2">
                    Data-Driven Accreditation &amp; Excellence
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    ASTU-AMS provides verified tracer data, employment analytics, and employer feedback required by accreditation agencies and university management.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Global Accreditation</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        Build transparent, audited institutional reports.
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Market Alignment</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        Align curriculum with industry expectations.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/info/impact-numbers')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                    >
                      <span>View Impact Numbers</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/cms/analytics')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer backdrop-blur-xs"
                    >
                      <span>Analytics Overview</span>
                      <ExternalLink className="h-3.5 w-3.5 text-blue-300" />
                    </button>
                  </div>
                </div>

                <div className="hidden lg:grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/10 p-4 border border-white/10 text-center">
                    <span className="text-2xl font-black text-white">{metrics.registeredAlumniFormatted}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-300 mt-1">Verified Alumni</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 border border-white/10 text-center">
                    <span className="text-2xl font-black text-emerald-400">90.3%</span>
                    <p className="text-[10px] uppercase font-bold text-slate-300 mt-1">Employment Rate</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 border border-white/10 text-center">
                    <span className="text-2xl font-black text-amber-300">{metrics.fieldsOfStudy}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-300 mt-1">STEM Schools</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 border border-white/10 text-center">
                    <span className="text-2xl font-black text-sky-300">{partners.length}+</span>
                    <p className="text-[10px] uppercase font-bold text-slate-300 mt-1">Partner Network</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. Why Partner with ASTU? (Mutual Value & Talent Access) ── */}
        <section
          id="partner-benefits"
          className="py-14 sm:py-16 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 transition-colors"
          aria-label="Why Partner with ASTU"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">
                {pageConfig.benefitsEyebrow || 'MUTUAL VALUE & TALENT ACCESS'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {pageConfig.benefitsTitle || 'Why Partner with ASTU?'}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {pageConfig.benefitsSubtitle || 'Join leading industry enterprises, public institutions, and research consortia actively recruiting and collaborating with ASTU.'}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(pageConfig.benefits && pageConfig.benefits.length > 0
                ? pageConfig.benefits
                : defaultPartnersPageConfig.benefits
              )
                .filter((b) => b.active !== false)
                .map((benefit) => {
                  const Icon = getBenefitIcon(benefit.icon);
                  return (
                    <div
                      key={benefit.id || benefit.title}
                      className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        <span>ASTU Enterprise Service</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>

        {/* ── 9. Strategic Alliances & Industry Consortia ── */}
        <section
          id="partner-stakeholders"
          className="py-14 sm:py-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors"
          aria-label="Strategic Alliances"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 px-3 py-0.5 rounded-full">
                Multilateral Consortia
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                {pageConfig.stakeholdersTitle || 'Strategic Alliances & Industry Consortia'}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {pageConfig.stakeholdersSubtitle || 'Active cooperation frameworks with government agencies, multinational tech enterprises, and international research organizations.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(pageConfig.stakeholderTracks && pageConfig.stakeholderTracks.length > 0
                ? pageConfig.stakeholderTracks
                : defaultPartnersPageConfig.stakeholderTracks || []
              )
                .filter((t) => t.active !== false)
                .map((track) => (
                  <div
                    key={track.id}
                    className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 uppercase bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 px-2.5 py-0.5 rounded-md">
                        {track.badge || 'Consortium Track'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-2 leading-snug">
                        {track.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                        {track.desc}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* ── 10. Recruitment Framework & Talent Engine ── */}
        <section
          id="partner-recruitment"
          className="py-14 sm:py-16 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 transition-colors"
          aria-label="Recruitment Framework"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-3 py-0.5 rounded-full">
                Talent Sourcing Pipeline
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                {pageConfig.recruitmentTitle || 'Recruitment Framework & Talent Engine'}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {pageConfig.recruitmentSubtitle || 'Accelerate graduate hiring and evaluate verified competency metrics through the AMS platform.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(pageConfig.recruitmentTracks && pageConfig.recruitmentTracks.length > 0
                ? pageConfig.recruitmentTracks
                : defaultPartnersPageConfig.recruitmentTracks || []
              )
                .filter((t) => t.active !== false)
                .map((track) => (
                  <div
                    key={track.id}
                    className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2.5 py-0.5 rounded-md">
                        {track.badge || 'Recruitment Track'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-2 leading-snug">
                        {track.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                        {track.desc}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* ── 11. Comprehensive Partner Benefits (Enterprise Ecosystem) ── */}
        <section
          id="partner-features"
          className="py-14 sm:py-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors"
          aria-label="Comprehensive Partner Benefits"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
              <div>
                <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">
                  {pageConfig.featuresEyebrow || 'ENTERPRISE ECOSYSTEM'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {pageConfig.featuresTitle || 'Comprehensive Partner Benefits'}
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pageConfig.featuresSubtitle || 'Our dedicated employer platform provides institutions with robust tools to streamline talent sourcing and collaborate on institutional excellence.'}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/employers/register')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                  >
                    <span>Register as Partner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    <span>Employer Login</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Institutional Partner Privileges
                </h3>
                <div className="space-y-3">
                  {(pageConfig.features && pageConfig.features.length > 0
                    ? pageConfig.features
                    : [
                        'TIN-verified enterprise employer accounts with high trust scores',
                        'Direct access to verified ASTU alumni and graduating seniors',
                        'Curriculum-aligned technical skill matching and automated recommendations',
                        'Accreditation-ready reporting and longitudinal tracer feedback loops',
                        'Priority coordination for campus recruitment days and tech expos',
                        'Direct engagement with academic departments and senior faculty',
                      ]
                  ).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 12. Partner FAQs ── */}
        <section
          id="partner-faqs"
          className="py-14 sm:py-16 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 transition-colors"
          aria-label="Frequently Asked Questions"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">
                FAQ &amp; Assistance
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Common questions regarding enterprise partnerships, candidate verification, and academic linkage.
              </p>
            </div>

            <div className="space-y-3">
              {(pageConfig.faqs && pageConfig.faqs.length > 0
                ? pageConfig.faqs
                : defaultPartnersPageConfig.faqs || []
              ).map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="pr-4">{faq.question}</span>
                      <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 13. Corporate Linkage & IRCCD Contact Desk ── */}
        <section
          id="partner-contact"
          className="py-14 sm:py-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors"
          aria-label="Corporate Linkage Office Contact"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-0.5 rounded-full">
                Institutional Contact
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                ASTU Corporate Relations &amp; Linkage Desk
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Direct liaison with the Directorate of Industry Linkage &amp; International Relations.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3 max-w-4xl mx-auto">
              <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                <div className="h-10 w-10 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Mail className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Inquiries</h4>
                <a
                  href={`mailto:${pageConfig.contactEmail || 'irccd@astu.edu.et'}`}
                  className="mt-1 inline-block text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {pageConfig.contactEmail || 'irccd@astu.edu.et'}
                </a>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                <div className="h-10 w-10 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Phone className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Direct Phone</h4>
                <a
                  href={`tel:${pageConfig.contactPhone || '+251-221-110000'}`}
                  className="mt-1 inline-block text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {pageConfig.contactPhone || '+251-221-110000'}
                </a>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                <div className="h-10 w-10 mx-auto rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                  <MapPin className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Campus Address</h4>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  {pageConfig.contactAddress || 'Adama Science and Technology University, Adama, Oromia, Ethiopia'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 14. High-Impact Bottom CTA Banner ── */}
        <section
          id="partner-bottom-cta"
          className="pb-16 pt-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Partner Call to Action"
        >
          <div className="rounded-3xl border border-blue-900/30 bg-gradient-to-r from-[#001f3f] via-[#002f6c] to-[#001730] p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:2rem_2rem] pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Empower Tomorrow's Engineers</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                {pageConfig.bottomCtaTitle || 'Start Building Your High-Impact Talent Pipeline Today'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
                {pageConfig.bottomCtaDescription || "Join ASTU's corporate partner network and connect directly with Ethiopia's premier engineering, applied science, and technology graduates."}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(pageConfig.bottomCtaButtonLink || '/employers/register')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-950/50 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{pageConfig.bottomCtaButtonText || 'Register Your Organization'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/info/impact-numbers')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer backdrop-blur-xs"
                >
                  <span>View Impact Numbers</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── MODAL: Company Detail Modal ── */}
      {selectedCompanyModal && (
        <CompanyDetailModal
          company={selectedCompanyModal}
          onClose={() => setSelectedCompanyModal(null)}
          onRegisterInterest={(company) => {
            setSelectedCompanyModal(null);
            navigate(`/employers/register?partner=${encodeURIComponent(company.name)}`);
          }}
          onSelectTag={(tag) => {
            handleTopicClick(tag);
          }}
          onShare={(company) => {
            setShareItem({
              id: company.id,
              title: `${company.name} — ASTU Industry Partner`,
              subtitle: company.industry || 'Corporate Partner',
              text: `${company.name} is an official partner organization of ASTU (${company.partnershipType}). Explore graduate recruitment and collaborative innovation pipelines.`,
              url: `/partners?partner=${encodeURIComponent(company.id || company.name)}`,
              badge: 'ASTU Partner',
              type: 'page',
            });
            setIsShareOpen(true);
          }}
        />
      )}

      {/* ── MODAL: Share Modal ── */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        item={shareItem}
      />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
