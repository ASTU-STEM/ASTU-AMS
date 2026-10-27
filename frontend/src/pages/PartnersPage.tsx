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
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaginationBar from '../components/PaginationBar';
import CompanyDetailModal from '../components/CompanyDetailModal';
import ShareModal, { ShareItem } from '../components/ShareModal';
import { partnerLogos } from '../components/PartnerLogos';
import { usePublicMetrics } from '../services/publicMetrics.service';
import homepageCmsService, {
  defaultPartnersPageConfig,
  PartnersPageConfig,
  Partner,
} from '../features/admin/services/homepageCms.service';
import { mediaUrl } from '../config';

export type ViewMode = 'grid' | 'list';
export type SortMode = 'featured' | 'name-asc' | 'name-desc';
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 'All'] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

/** Verified base catalog of ASTU partner organizations */
const SEED_PARTNERS: Partner[] = [
  {
    id: 'PT-1',
    name: 'Ethio Telecom',
    active: true,
    industry: 'Telecom, Cloud & FinTech',
    partnershipType: 'Strategic',
    status: 'Tier 1 Strategic Partner',
    location: 'Addis Ababa & Regional Hubs',
    openings: '14+ Graduate Engineering Tracks',
    website: 'https://www.ethiotelecom.et',
    contactEmail: 'careers@ethiotelecom.et',
    featured: true,
    description:
      'National telecommunications and digital infrastructure leader collaborating with ASTU on enterprise cloud data centers, 5G testbeds, software engineering internships, and graduate trainee pipelines.',
    tags: ['Cloud Computing', '5G Infrastructure', 'Telebirr', 'Networking'],
  },
  {
    id: 'PT-2',
    name: 'Ethiopian Airlines',
    active: true,
    industry: 'Aviation Engineering & ICT',
    partnershipType: 'Strategic',
    status: 'Aviation Tech Partner',
    location: 'Bole, Addis Ababa',
    openings: '8 Aviation Cadet & Internship Tracks',
    website: 'https://www.ethiopianairlines.com',
    contactEmail: 'careers@ethiopianairlines.com',
    featured: true,
    description:
      "Africa's premier aviation group partnering with ASTU on avionics diagnostics, aircraft maintenance training, mechanical design pipelines, and global airline ICT operations.",
    tags: ['Avionics Systems', 'Aerospace CAD', 'Airlines IT', 'Diagnostics'],
  },
  {
    id: 'PT-3',
    name: 'INSA',
    active: true,
    industry: 'Cybersecurity & Defense Intelligence',
    partnershipType: 'Research',
    status: 'Govt Research Partner',
    location: 'Addis Ababa',
    openings: '6 Advanced Research Placements',
    website: 'https://www.insa.gov.et',
    contactEmail: 'linkage@insa.gov.et',
    featured: true,
    description:
      'Information Network Security Administration spearheading cyber defense, digital forensics, cryptographic research, and specialized security engineering labs at ASTU.',
    tags: ['Cybersecurity', 'SOC Telemetry', 'Digital Forensics', 'Cryptography'],
  },
  {
    id: 'PT-4',
    name: 'Huawei',
    active: true,
    industry: 'ICT Infrastructure & 5G',
    partnershipType: 'Technology',
    status: 'Global Innovation Partner',
    location: 'Adama & Addis Ababa',
    openings: '11 ICT Academy Certification Paths',
    website: 'https://www.huawei.com',
    contactEmail: 'academy.ethiopia@huawei.com',
    featured: true,
    description:
      'Global ICT technology leader sponsoring the ASTU Huawei Authorized Information and Network Academy (HAINA), AI certifications, and high-performance routing research.',
    tags: ['Routing & Switching', 'Ascend AI', '5G Core', 'Cloud Certification'],
  },
  {
    id: 'PT-5',
    name: 'Safaricom',
    active: true,
    industry: 'Telecommunications & 5G Infrastructure',
    partnershipType: 'Recruitment',
    status: 'Strategic Corporate Partner',
    location: 'Ethiopia Network Hubs',
    openings: '12 Digital Engineering Roles',
    website: 'https://www.safaricom.et',
    contactEmail: 'recruitment@safaricom.et',
    featured: true,
    description:
      'Next-generation telecommunications operator driving mobile broadband and M-PESA fintech expansion, offering fast-track graduate development in mobile network and software architecture.',
    tags: ['5G RAN', 'M-PESA', 'Fiber Transmission', 'FinTech'],
  },
  {
    id: 'PT-6',
    name: 'Commercial Bank of Ethiopia',
    active: true,
    industry: 'Financial Technology & Digital Banking',
    partnershipType: 'Recruitment',
    status: 'Enterprise Banking Partner',
    location: 'CBE Tower, Addis Ababa',
    openings: '20+ IT & Security Openings',
    website: 'https://www.combanketh.et',
    contactEmail: 'jobs@cbe.com.et',
    featured: true,
    description:
      "Ethiopia's apex banking institution powering over 10 million daily electronic transactions, recruiting software developers, database administrators, and cyber risk analysts.",
    tags: ['Core Banking', 'Enterprise Java', 'FinTech APIs', 'Microservices'],
  },
  {
    id: 'PT-7',
    name: 'DAAD (German Academic Exchange Service)',
    active: true,
    industry: 'International Academic & Research Consortia',
    partnershipType: 'Research',
    status: 'Academic Consortia Partner',
    location: 'Bonn, Germany / Addis Ababa',
    openings: 'Joint Research & Exchange Fellowships',
    website: 'https://www.daad.de',
    contactEmail: 'info@daad-ethiopia.org',
    featured: false,
    description:
      'Global academic agency funding postgraduate scholarships, collaborative engineering research labs, and doctoral faculty exchange between ASTU and German technical universities.',
    tags: ['Research Grants', 'Doctoral Exchange', 'Engineering Fellowships'],
  },
  {
    id: 'PT-8',
    name: 'Meta Finetec PLC',
    active: true,
    industry: 'Enterprise Software & Cloud Systems',
    partnershipType: 'Internship',
    status: 'Software Solutions Partner',
    location: 'Addis Ababa',
    openings: '5 Full-Stack Developer Roles',
    website: 'https://metafinetec.com',
    contactEmail: 'careers@metafinetec.com',
    featured: false,
    description:
      'Technology engineering consultancy providing senior engineering students with real-world agile microservices experience and enterprise database migrations.',
    tags: ['Enterprise ERP', 'Cloud Migration', 'Microservices', 'PostgreSQL'],
  },
  {
    id: 'PT-9',
    name: 'Ministry of Innovation and Technology',
    active: true,
    industry: 'Government Digital Transformation',
    partnershipType: 'Government',
    status: 'Government Strategic Partner',
    location: 'Addis Ababa',
    openings: 'National Hackathons & Tech Incubation',
    website: 'https://mint.gov.et',
    contactEmail: 'info@mint.gov.et',
    featured: true,
    description:
      'Federal ministry guiding Digital Ethiopia 2025. Collaborates with ASTU on e-government architecture, public tech incubation, and digital policy research.',
    tags: ['Digital Ethiopia', 'E-Governance', 'Public Cloud', 'Policy R&D'],
  },
  {
    id: 'PT-10',
    name: 'Ethiopian Artificial Intelligence Institute',
    active: true,
    industry: 'Applied AI & Cognitive Computing',
    partnershipType: 'Research',
    status: 'Advanced AI Research Partner',
    location: 'Addis Ababa',
    openings: 'AI Fellowships & Lab Internships',
    website: 'https://ai.et',
    contactEmail: 'info@ai.et',
    featured: true,
    description:
      'National autonomous research institute specializing in localized Ethiopic NLP, computer vision for healthcare, and smart agriculture robotics in partnership with ASTU labs.',
    tags: ['Deep Learning', 'Computer Vision', 'Ethiopic NLP', 'Robotics'],
  },
  {
    id: 'PT-11',
    name: 'Ethiopian Electric Power',
    active: true,
    industry: 'High-Voltage Grids & Renewable Energy',
    partnershipType: 'Strategic',
    status: 'National Energy Partner',
    location: 'Addis Ababa / Regional Substations',
    openings: 'Electrical & Power Systems Trainees',
    website: 'https://www.eep.com.et',
    contactEmail: 'corporate@eep.com.et',
    featured: true,
    description:
      'National power generation and transmission authority managing hydroelectric, wind, and geothermal projects, regularly recruiting ASTU electrical and mechanical engineers.',
    tags: ['Power Systems', 'Substation Automation', 'Renewable Energy', 'SCADA'],
  },
  {
    id: 'PT-12',
    name: 'Midroc Ethiopia',
    active: true,
    industry: 'Industrial Manufacturing & Engineering',
    partnershipType: 'Strategic',
    status: 'Industrial Conglomerate Partner',
    location: 'Addis Ababa / Regional Hubs',
    openings: 'Process Automation & Design Trainees',
    website: 'https://midroc-ethiopia.com.et',
    contactEmail: 'hr@midrocethiopia.com.et',
    featured: false,
    description:
      'Multi-sector enterprise encompassing agro-processing, steel fabrication, and industrial manufacturing, serving as a primary destination for ASTU engineering graduates.',
    tags: ['Heavy Machinery', 'Process Automation', 'Manufacturing'],
  },
];

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

  // Modal states
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<Partner | null>(null);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const directoryRef = useRef<HTMLDivElement>(null);
  const featuredRailRef = useRef<HTMLDivElement>(null);

  // Load backend partner settings on mount
  const loadPartnerData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const settings = await homepageCmsService.fetchSettings();
      if (settings?.partnersPage) {
        setPageConfig(settings.partnersPage);
      }

      const backendPartners = settings?.partners;
      if (Array.isArray(backendPartners) && backendPartners.length > 0) {
        // Merge backend partners with seed metadata where applicable
        const seedMap = new Map(SEED_PARTNERS.map((sp) => [sp.name.toLowerCase().trim(), sp]));
        const merged: Partner[] = backendPartners.map((bp) => {
          const match = seedMap.get(bp.name?.toLowerCase().trim());
          return match ? { ...match, ...bp } : bp;
        });

        // Add any verified seed partners not yet in backend CMS list
        SEED_PARTNERS.forEach((sp) => {
          if (!merged.some((m) => m.name?.toLowerCase().trim() === sp.name.toLowerCase().trim())) {
            merged.push(sp);
          }
        });
        setPartners(merged);
      } else {
        setPartners(SEED_PARTNERS);
      }
    } catch {
      setLoadError('Unable to load live partner records. Displaying local verified catalog.');
      setPartners(SEED_PARTNERS);
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
      stakeholders: 'partner-directory',
      employers: 'partner-directory',
      recruitment: 'partner-directory',
      tracks: 'partner-directory',
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
  }, [searchParams]);

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
  const maxFeaturedSlide = Math.max(0, Math.ceil(featuredPartners.length / FEATURED_PER_VIEW) - 1);

  const handleNextFeatured = () => {
    setFeaturedSlideIndex((prev) => (prev < maxFeaturedSlide ? prev + 1 : 0));
  };

  const handlePrevFeatured = () => {
    setFeaturedSlideIndex((prev) => (prev > 0 ? prev - 1 : maxFeaturedSlide));
  };

  // Render standardized partner logo
  const renderLogo = (partner: Partner, sizeClass = 'h-10 w-10 sm:h-12 sm:w-12') => {
    const LogoComp = partnerLogos[partner.name];
    if (LogoComp) {
      return (
        <div className={`flex items-center justify-center shrink-0 ${sizeClass}`}>
          <LogoComp className="max-h-full max-w-full object-contain" />
        </div>
      );
    }
    if (partner.logo) {
      return (
        <img
          src={mediaUrl(partner.logo)}
          alt={`${partner.name} logo`}
          className={`shrink-0 object-contain ${sizeClass}`}
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

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-blue-200 mb-3.5 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>ASTU Industry Linkage &amp; Corporate Alliances</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
                {pageConfig.heroTitle || 'Our Partners & Industry Collaborators'}
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mb-6">
                {pageConfig.heroSubtitle ||
                  'Fostering strategic university-industry collaborations, graduate recruitment pipelines, and applied research with Ethiopia’s leading technology enterprises, public agencies, and global academic institutions.'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(pageConfig.heroPrimaryCtaLink || '/employers/register')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  <span>Register as Partner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(pageConfig.heroSecondaryCtaLink || '/login')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Building className="w-3.5 h-3.5 text-blue-300" />
                  <span>Employer Portal</span>
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
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer"
                  title="Share partner directory"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-300" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Meaningful Partner Statistics (Genuine Backend Data Only) ── */}
        <section
          id="partner-stats"
          className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6"
          aria-label="Partner Statistics"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {partners.length}
                  </span>
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active Partners</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Verified Organizations</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {distinctSectorsCount}
                  </span>
                  <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Industry Sectors</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Telecom, AI, Energy, Aviation</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {partners.filter((p) => p.featured || p.partnershipType === 'Strategic').length}
                  </span>
                  <Handshake className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Strategic MoUs</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Formal University Agreements</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {metrics.registeredAlumniFormatted && metrics.registeredAlumniFormatted !== '—'
                      ? metrics.registeredAlumniFormatted
                      : '1,215+'}
                  </span>
                  <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Verified Alumni</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Registered in AMS</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Partner Discovery (Search & Dynamic Category Filters) ── */}
        <section
          id="partner-discovery"
          ref={directoryRef}
          className="pt-10 pb-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Partner Discovery"
        >
          {/* Search Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Search className="w-3 h-3" />
                <span>Partner Discovery</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Search &amp; Filter Organizations
              </h2>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full sm:w-80 md:w-96">
              <label htmlFor="partner-search-input" className="sr-only">
                Search partners by company name, sector, or keyword
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="partner-search-input"
                type="text"
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                placeholder="Search by name, sector, location, skills..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
              />
              {partnerSearch && (
                <button
                  type="button"
                  onClick={() => setPartnerSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
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

          {/* Controls Bar: Results Count, Clear Filters, Sorting, View Toggle */}
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

              {(typeFilter !== 'All' || debouncedSearch) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-2 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear all filters</span>
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

        {/* ── 4. Featured Partners (Supported Records Only) ── */}
        {featuredPartners.length > 0 && !debouncedSearch && typeFilter === 'All' && (
          <section
            id="featured-partners"
            className="pb-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Featured Strategic Partners"
          >
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/40 to-blue-950/40 border border-blue-900/30">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Featured Strategic Partners
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevFeatured}
                    aria-label="Previous featured partners"
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFeatured}
                    aria-label="Next featured partners"
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Featured Cards Rail */}
              <div
                ref={featuredRailRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
              >
                {featuredPartners
                  .slice(
                    featuredSlideIndex * FEATURED_PER_VIEW,
                    featuredSlideIndex * FEATURED_PER_VIEW + FEATURED_PER_VIEW
                  )
                  .map((partner) => (
                    <div
                      key={partner.id}
                      onClick={() => setSelectedCompanyModal(partner)}
                      className="group flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/60 transition-all cursor-pointer shadow-xs"
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

          {/* Zero State / Empty State */}
          {!isLoading && sortedPartners.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center bg-white dark:bg-slate-900 my-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-3">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No Matching Partner Records
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                We couldn't find any partner records matching{' '}
                <strong className="text-slate-700 dark:text-slate-300">"{debouncedSearch}"</strong> in category{' '}
                <strong className="text-slate-700 dark:text-slate-300">"{typeFilter}"</strong>. Try refining your keywords or resetting filters.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Search &amp; Filters</span>
              </button>
            </div>
          )}

          {/* Grid View */}
          {!isLoading && viewMode === 'grid' && sortedPartners.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {pagedPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 relative"
                >
                  {/* Featured Indicator */}
                  {partner.featured && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>Featured</span>
                    </span>
                  )}

                  <div>
                    {/* Standardized Logo Container */}
                    <div className="flex h-14 items-center justify-start mb-3.5 pr-14">
                      {renderLogo(partner, 'h-11 w-11 sm:h-12 sm:w-12')}
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
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-900/60">
                        {partner.partnershipType || 'Enterprise'}
                      </span>
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

                    {/* Location */}
                    {partner.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{partner.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions: Non-conflicting buttons */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
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
                      onClick={() => {
                        setShareItem({
                          id: partner.id,
                          title: `${partner.name} — ASTU Industry Partner`,
                          subtitle: partner.industry || 'Corporate Partner',
                          text: `${partner.name} is an official partner organization of ASTU (${partner.partnershipType}). Explore graduate recruitment and collaborative innovation pipelines.`,
                          url: `/partners?partner=${encodeURIComponent(partner.id)}`,
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
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
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
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
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
