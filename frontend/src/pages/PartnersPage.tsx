import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Building2,
  Building,
  CheckCircle2,
  ArrowRight,
  Handshake,
  ShieldCheck,
  ChevronDown,
  Star,
  MapPin,
  GraduationCap,
  Search,
  X,
  FileCheck2,
  BadgeCheck,
  LayoutGrid,
  List,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  Share2,
  BookOpen,
  FlaskConical,
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
export type SortMode = 'featured' | 'name-asc' | 'name-desc' | 'hired-desc' | 'mou-asc';
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 'All'] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

/** Verified enterprise, governmental, and academic partners linked with ASTU */
const SEED_PARTNERS: Partner[] = [
  {
    id: 'PT-01',
    name: 'Ethio Telecom',
    active: true,
    industry: 'Telecom, Cloud & FinTech',
    partnershipType: 'Strategic',
    status: 'Tier 1 Strategic Partner',
    hiredCount: '340+ ASTU Alumni',
    mouYear: 'Since 2018',
    location: 'Addis Ababa / Regional Hubs',
    website: 'https://www.ethiotelecom.et',
    contactEmail: 'talent@ethiotelecom.et',
    featured: true,
    description:
      'National telecommunications and digital infrastructure leader. Collaborates on cloud data centers, 5G testbeds, software engineering internships, and graduate trainee pipelines.',
    tags: ['Cloud Computing', '5G Infrastructure', 'Telebirr', 'Networking'],
  },
  {
    id: 'PT-02',
    name: 'INSA',
    active: true,
    industry: 'Cybersecurity & Defense Intelligence',
    partnershipType: 'Research',
    status: 'Govt Research Partner',
    hiredCount: '190+ ASTU Alumni',
    mouYear: 'Since 2019',
    location: 'Addis Ababa',
    website: 'https://www.insa.gov.et',
    contactEmail: 'linkage@insa.gov.et',
    featured: true,
    description:
      'Information Network Security Administration. Direct partner in cyber defense, digital forensics, cryptographic research, and specialized security engineering labs at ASTU.',
    tags: ['Cybersecurity', 'SOC Telemetry', 'Digital Forensics', 'Cryptography'],
  },
  {
    id: 'PT-03',
    name: 'Ethiopian Airlines',
    active: true,
    industry: 'Aviation Engineering & ICT',
    partnershipType: 'Strategic',
    status: 'Aviation Tech Partner',
    hiredCount: '280+ ASTU Alumni',
    mouYear: 'Since 2017',
    location: 'Bole Airport, Addis Ababa',
    website: 'https://www.ethiopianairlines.com',
    contactEmail: 'careers@ethiopianairlines.com',
    featured: true,
    description:
      "Africa's largest aviation group. Co-operates aviation maintenance training, avionics software diagnostics, mechanical design pipelines, and global airline ICT operations.",
    tags: ['Avionics Systems', 'Aerospace CAD', 'Airlines IT', 'Diagnostics'],
  },
  {
    id: 'PT-04',
    name: 'Safaricom',
    active: true,
    industry: 'Telecommunications & 5G Infrastructure',
    partnershipType: 'Strategic',
    status: 'Strategic Corporate Partner',
    hiredCount: '160+ ASTU Alumni',
    mouYear: 'Since 2021',
    location: 'Hawassa / Adama / Addis Ababa',
    website: 'https://www.safaricom.et',
    contactEmail: 'recruitment@safaricom.et',
    featured: true,
    description:
      'Next-generation telecommunications operator driving mobile broadband and M-PESA fintech expansion across Ethiopia, recruiting top computing and telecommunications graduates.',
    tags: ['5G RAN', 'M-PESA', 'Fiber Transmission', 'FinTech'],
  },
  {
    id: 'PT-05',
    name: 'Huawei',
    active: true,
    industry: 'ICT Academy & Enterprise Networking',
    partnershipType: 'Technology',
    status: 'Global Innovation Partner',
    hiredCount: '220+ ASTU Alumni',
    mouYear: 'Since 2016',
    location: 'Adama / Addis Ababa',
    website: 'https://www.huawei.com',
    contactEmail: 'academy.ethiopia@huawei.com',
    featured: true,
    description:
      'Global ICT technology leader sponsoring the ASTU Huawei Authorized Information and Network Academy (HAINA), AI certifications, and high-performance routing research.',
    tags: ['Routing & Switching', 'Ascend AI', '5G Core', 'Cloud Certification'],
  },
  {
    id: 'PT-06',
    name: 'Commercial Bank of Ethiopia',
    active: true,
    industry: 'Financial Technology & Digital Banking',
    partnershipType: 'Banking',
    status: 'Enterprise Banking Partner',
    hiredCount: '410+ ASTU Alumni',
    mouYear: 'Since 2015',
    location: 'CBE Tower, Addis Ababa',
    website: 'https://www.combanketh.et',
    contactEmail: 'hr@cbe.com.et',
    featured: true,
    description:
      "Ethiopia's apex banking institution powering over 10 million transactions daily. High-volume recruiter of software developers, database administrators, and cyber risk analysts.",
    tags: ['Core Banking', 'Enterprise Java', 'FinTech APIs', 'Microservices'],
  },
  {
    id: 'PT-07',
    name: 'Ministry of Innovation and Technology',
    active: true,
    industry: 'Government Digital Transformation',
    partnershipType: 'Government',
    status: 'Government Strategic Partner',
    hiredCount: '130+ ASTU Alumni',
    mouYear: 'Since 2020',
    location: 'Addis Ababa',
    website: 'https://mint.gov.et',
    contactEmail: 'info@mint.gov.et',
    featured: true,
    description:
      'Federal ministry guiding Digital Ethiopia 2025. Collaborates on public e-government architecture, national hackathons, and youth technology incubation initiatives.',
    tags: ['Digital Ethiopia', 'E-Governance', 'Public Cloud', 'Policy R&D'],
  },
  {
    id: 'PT-08',
    name: 'Ethiopian Artificial Intelligence Institute',
    active: true,
    industry: 'Applied AI & Cognitive Computing',
    partnershipType: 'Research',
    status: 'Advanced AI Research Partner',
    hiredCount: '95+ ASTU Alumni',
    mouYear: 'Since 2022',
    location: 'Addis Ababa',
    website: 'https://ai.et',
    contactEmail: 'info@ai.et',
    featured: true,
    description:
      'National autonomous research institute specializing in localized Natural Language Processing (Amharic/Afaan Oromo models), computer vision for healthcare, and smart agriculture.',
    tags: ['Deep Learning', 'Computer Vision', 'Ethiopic NLP', 'Robotics'],
  },
  {
    id: 'PT-09',
    name: 'Dashen Bank',
    active: true,
    industry: 'Digital Banking & Mobile Wallets',
    partnershipType: 'Banking',
    status: 'FinTech Corporate Partner',
    hiredCount: '185+ ASTU Alumni',
    mouYear: 'Since 2019',
    location: 'Addis Ababa',
    website: 'https://dashenbanksc.com',
    contactEmail: 'careers@dashenbanksc.com',
    featured: false,
    description:
      'Pioneer of Amole digital wallet platform and interoperable omnichannel banking solutions, regularly hiring ASTU computer science and information systems graduates.',
    tags: ['Mobile Payments', 'Omnichannel APIs', 'Cloud DB', 'InfoSec'],
  },
  {
    id: 'PT-10',
    name: 'Awash Bank',
    active: true,
    industry: 'Private Commercial Banking',
    partnershipType: 'Banking',
    status: 'Private Banking Partner',
    hiredCount: '210+ ASTU Alumni',
    mouYear: 'Since 2018',
    location: 'Addis Ababa',
    website: 'https://awashbank.com',
    contactEmail: 'jobs@awashbank.com',
    featured: false,
    description:
      'Largest private commercial bank in Ethiopia, deploying modern distributed data centers, enterprise network infrastructure, and automated micro-lending algorithms.',
    tags: ['FinTech Infrastructure', 'Data Analytics', 'Risk Modeling', 'DevOps'],
  },
  {
    id: 'PT-11',
    name: 'ZTE Ethiopia',
    active: true,
    industry: 'Telecommunications & Optical Networks',
    partnershipType: 'Technology',
    status: 'Telecom Technology Partner',
    hiredCount: '145+ ASTU Alumni',
    mouYear: 'Since 2017',
    location: 'Addis Ababa',
    website: 'https://www.zte.com.cn/global',
    contactEmail: 'ethiopia@zte.com.cn',
    featured: false,
    description:
      'Telecommunications vendor implementing national fiber optic backbones, wireless mobile coverage, and high-capacity carrier microwave links across regional corridors.',
    tags: ['Optical Networking', 'Wireless Comm', 'Telecom Power', 'SDN'],
  },
  {
    id: 'PT-12',
    name: 'Midroc Ethiopia',
    active: true,
    industry: 'Industrial Manufacturing & Engineering',
    partnershipType: 'Strategic',
    status: 'Industrial Conglomerate Partner',
    hiredCount: '310+ ASTU Alumni',
    mouYear: 'Since 2014',
    location: 'Addis Ababa / Adama / Awassa',
    website: 'https://midroc-ethiopia.com.et',
    contactEmail: 'hr@midrocethiopia.com.et',
    featured: true,
    description:
      'Multi-sector enterprise encompassing agro-processing, steel fabrication, mining, and civil construction. Top career destination for ASTU mechanical, electrical, and chemical engineers.',
    tags: ['Heavy Machinery', 'Process Automation', 'Civil Projects', 'Manufacturing'],
  },
  {
    id: 'PT-13',
    name: 'Dangote Cement Ethiopia',
    active: true,
    industry: 'Heavy Industry & Process Engineering',
    partnershipType: 'Recruitment',
    status: 'Industrial Manufacturing Partner',
    hiredCount: '125+ ASTU Alumni',
    mouYear: 'Since 2016',
    location: 'Mugher, Oromia',
    website: 'https://dangotecement.com',
    contactEmail: 'careers.ethiopia@dangote.com',
    featured: false,
    description:
      'Modern automated heavy industrial manufacturing plant with continuous rotary kilns and robotics packaging systems, sponsoring industrial attachment for mechanical and chemical engineers.',
    tags: ['Chemical Process', 'Mechanical Maintenance', 'PLC / SCADA', 'Safety Engineering'],
  },
  {
    id: 'PT-14',
    name: 'Ovid Group',
    active: true,
    industry: 'Modern Construction & Modular Engineering',
    partnershipType: 'Technology',
    status: 'Infrastructure Innovation Partner',
    hiredCount: '90+ ASTU Alumni',
    mouYear: 'Since 2022',
    location: 'Addis Ababa',
    website: 'https://ovid-group.com',
    contactEmail: 'info@ovid-group.com',
    featured: false,
    description:
      'Trailblazer in industrialized construction, modular steel building systems, and Building Information Modeling (BIM), hiring ASTU civil and architectural engineers.',
    tags: ['BIM / Revit', 'Modular Precast', 'Structural Design', 'Project Mgmt'],
  },
  {
    id: 'PT-15',
    name: 'WebSprix IT Solutions',
    active: true,
    industry: 'Broadband, ISP & Enterprise Cloud',
    partnershipType: 'Technology',
    status: 'Internet & Cloud Partner',
    hiredCount: '110+ ASTU Alumni',
    mouYear: 'Since 2021',
    location: 'Addis Ababa',
    website: 'https://websprix.com',
    contactEmail: 'careers@websprix.com',
    featured: false,
    description:
      'Fast-growing internet service provider and cloud infrastructure operator offering metro fiber connectivity, SIP telephony, and enterprise data virtualization.',
    tags: ['Fiber Optics', 'BGP Routing', 'Linux DevOps', 'Cloud Storage'],
  },
  {
    id: 'PT-16',
    name: 'iCog Labs',
    active: true,
    industry: 'Artificial Intelligence & Robotics',
    partnershipType: 'Research',
    status: 'Cognitive Robotics Partner',
    hiredCount: '75+ ASTU Alumni',
    mouYear: 'Since 2020',
    location: 'Addis Ababa',
    website: 'https://icog-labs.com',
    contactEmail: 'contact@icog-labs.com',
    featured: false,
    description:
      'Pioneering artificial general intelligence R&D laboratory famous for Sophia robot cognitive architecture and bio-inspired robotics programs for students.',
    tags: ['AGI Research', 'Computer Vision', 'Embedded Robotics', 'OpenCog'],
  },
  {
    id: 'PT-17',
    name: 'ZayRide (ZayTech Solutions)',
    active: true,
    industry: 'Smart Mobility & Logistics Platforms',
    partnershipType: 'Technology',
    status: 'Mobility Innovation Partner',
    hiredCount: '60+ ASTU Alumni',
    mouYear: 'Since 2023',
    location: 'Addis Ababa',
    website: 'https://zayride.com',
    contactEmail: 'tech@zayride.com',
    featured: false,
    description:
      'Leading on-demand urban transport and freight technology platform employing real-time route dispatch algorithms, mobile payments, and fleet telematics.',
    tags: ['Ride-Hailing App', 'Real-time Telemetry', 'Node.js', 'Geo-Algorithms'],
  },
  {
    id: 'PT-18',
    name: 'Kifiya Financial Technology',
    active: true,
    industry: 'Digital Finance & Credit Scoring',
    partnershipType: 'Banking',
    status: 'FinTech Innovation Partner',
    hiredCount: '85+ ASTU Alumni',
    mouYear: 'Since 2020',
    location: 'Addis Ababa',
    website: 'https://kifiya.com',
    contactEmail: 'info@kifiya.com',
    featured: false,
    description:
      'Fintech innovator operating Michu and Qena AI-driven digital micro-credit platforms for MSMEs and farmers in partnership with Ethiopian banks.',
    tags: ['AI Credit Scoring', 'FinTech APIs', 'Micro-Lending', 'Data Pipelines'],
  },
  {
    id: 'PT-19',
    name: 'Addis International Bank',
    active: true,
    industry: 'Commercial Banking & Systems',
    partnershipType: 'Banking',
    status: 'Commercial Banking Partner',
    hiredCount: '70+ ASTU Alumni',
    mouYear: 'Since 2021',
    location: 'Addis Ababa',
    website: 'https://addisbanksc.com',
    contactEmail: 'contact@addisbanksc.com',
    featured: false,
    description:
      'Commercial banking provider modernizing financial transaction processing, cyber protection protocols, and secure electronic branch networking.',
    tags: ['Information Security', 'Network Admin', 'Financial Systems'],
  },
  {
    id: 'PT-20',
    name: 'DAAD (German Academic Exchange Service)',
    active: true,
    industry: 'International Academic & Research Consortia',
    partnershipType: 'Research',
    status: 'Academic Consortia Partner',
    hiredCount: '150+ ASTU Alumni',
    mouYear: 'Since 2013',
    location: 'Bonn, Germany / Addis Ababa',
    website: 'https://www.daad.de',
    contactEmail: 'info@daad-ethiopia.org',
    featured: true,
    description:
      'Global academic agency funding postgraduate scholarships, collaborative engineering research labs, and doctoral faculty exchange between ASTU and German technical universities.',
    tags: ['Research Grants', 'Doctoral Exchange', 'Engineering Fellowships'],
  },
  {
    id: 'PT-21',
    name: 'Ethiopian Space Science and Geospatial Institute',
    active: true,
    industry: 'Aerospace & Remote Sensing Research',
    partnershipType: 'Research',
    status: 'Aerospace Research Partner',
    hiredCount: '65+ ASTU Alumni',
    mouYear: 'Since 2021',
    location: 'Entoto / Addis Ababa',
    website: 'https://essgi.gov.et',
    contactEmail: 'info@essgi.gov.et',
    featured: false,
    description:
      'National aerospace body operating satellite ground telemetry stations, earth observation analytics, and GIS data centers for climate and urban planning.',
    tags: ['Satellite Telemetry', 'GIS & Remote Sensing', 'Aerospace Engineering'],
  },
  {
    id: 'PT-22',
    name: 'Meta Finetec PLC',
    active: true,
    industry: 'Enterprise Software & Cloud Systems',
    partnershipType: 'Technology',
    status: 'Software Solutions Partner',
    hiredCount: '55+ ASTU Alumni',
    mouYear: 'Since 2022',
    location: 'Addis Ababa',
    website: 'https://metafinetec.com',
    contactEmail: 'careers@metafinetec.com',
    featured: false,
    description:
      'Technology engineering consultancy specializing in enterprise ERP deployment, custom industrial database migrations, and microservice architectures.',
    tags: ['Enterprise ERP', 'Cloud Migration', 'Microservices', 'PostgreSQL'],
  },
  {
    id: 'PT-23',
    name: 'Summit Devs',
    active: true,
    industry: 'Fullstack Web & Mobile Development',
    partnershipType: 'Recruitment',
    status: 'Agile Software Partner',
    hiredCount: '45+ ASTU Alumni',
    mouYear: 'Since 2023',
    location: 'Adama Innovation Center',
    website: 'https://summitdevs.tech',
    contactEmail: 'hello@summitdevs.tech',
    featured: false,
    description:
      'Locally founded high-velocity software engineering house providing web and mobile engineering talent to international startups and Ethiopian tech ventures.',
    tags: ['React & Node.js', 'Mobile Apps', 'GraphQL', 'Tailwind CSS'],
  },
  {
    id: 'PT-24',
    name: 'Ethiopian Electric Power',
    active: true,
    industry: 'High-Voltage Grids & Renewable Energy',
    partnershipType: 'Strategic',
    status: 'National Energy Partner',
    hiredCount: '260+ ASTU Alumni',
    mouYear: 'Since 2015',
    location: 'Addis Ababa / GERD Regional Substations',
    website: 'https://www.eep.com.et',
    contactEmail: 'corporate@eep.com.et',
    featured: true,
    description:
      'National power generation and transmission authority managing hydroelectric, wind, and geothermal mega-projects, continuously recruiting electrical and mechanical engineers.',
    tags: ['Power Systems', 'Substation Automation', 'Renewable Energy', 'SCADA'],
  },
];

export default function PartnersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { metrics } = usePublicMetrics();

  // Page CMS Config & Dynamic Partners List
  const [pageConfig, setPageConfig] = useState<PartnersPageConfig>(() => {
    const s = homepageCmsService.getSettings();
    return s?.partnersPage || defaultPartnersPageConfig;
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    const s = homepageCmsService.getSettings();
    if (s?.partners && s.partners.length > 0) {
      const cmsMap = new Map(s.partners.map((p) => [p.name.toLowerCase().trim(), p]));
      const merged = SEED_PARTNERS.map((sp) => {
        const found = cmsMap.get(sp.name.toLowerCase().trim());
        return found ? { ...sp, ...found } : sp;
      });
      s.partners.forEach((cp) => {
        if (!merged.some((m) => m.name.toLowerCase().trim() === cp.name.toLowerCase().trim())) {
          merged.push(cp);
        }
      });
      return merged;
    }
    return SEED_PARTNERS;
  });

  // Partner Directory Filter & View States
  const [partnerSearch, setPartnerSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [partnerPage, setPartnerPage] = useState(0);
  const [pageSize, setPageSize] = useState<PageSizeOption>(12);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<Partner | null>(null);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const directoryRef = useRef<HTMLDivElement>(null);

  // Debounce search input to avoid unnecessary renders
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
      employers: 'partner-tracks',
      recruitment: 'partner-tracks',
      tracks: 'partner-tracks',
      benefits: 'partner-benefits',
      faq: 'partner-faq',
    };
    const targetId = tabMap[raw] || raw;
    const timer = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  // Deep linking: direct partner detail modal
  useEffect(() => {
    const partnerId = searchParams.get('partner');
    if (!partnerId || partners.length === 0) return;
    const decoded = decodeURIComponent(partnerId).toLowerCase();
    const found = partners.find(
      (p) => p.id?.toLowerCase() === decoded || p.name.toLowerCase() === decoded
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

  // Synchronize CMS Config & Partners in real time
  useEffect(() => {
    const syncCms = () => {
      const s = homepageCmsService.getSettings();
      if (s?.partnersPage) setPageConfig(s.partnersPage);
      if (s?.partners && s.partners.length > 0) {
        const cmsMap = new Map(s.partners.map((p) => [p.name.toLowerCase().trim(), p]));
        const merged = SEED_PARTNERS.map((sp) => {
          const found = cmsMap.get(sp.name.toLowerCase().trim());
          return found ? { ...sp, ...found } : sp;
        });
        s.partners.forEach((cp) => {
          if (!merged.some((m) => m.name.toLowerCase().trim() === cp.name.toLowerCase().trim())) {
            merged.push(cp);
          }
        });
        setPartners(merged);
      }
    };

    window.addEventListener('astu-cms-content-changed', syncCms);
    window.addEventListener('astu-cms-homepage-updated', syncCms);
    return () => {
      window.removeEventListener('astu-cms-content-changed', syncCms);
      window.removeEventListener('astu-cms-homepage-updated', syncCms);
    };
  }, []);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setPartnerPage(0);
  }, [debouncedSearch, typeFilter, sortMode, pageSize]);

  // Compute category counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: partners.length,
      Featured: 0,
      Strategic: 0,
      Technology: 0,
      Research: 0,
      Banking: 0,
      Recruitment: 0,
      Government: 0,
    };

    partners.forEach((p) => {
      if (p.featured) counts.Featured += 1;
      const t = p.partnershipType?.trim();
      if (t && Object.prototype.hasOwnProperty.call(counts, t)) {
        counts[t] = (counts[t] || 0) + 1;
      }
    });

    return counts;
  }, [partners]);

  // Compute distinct sectors count for real metrics
  const distinctSectorsCount = useMemo(() => {
    const sectors = new Set<string>();
    partners.forEach((p) => {
      if (p.industry) sectors.add(p.industry.split('&')[0].trim());
    });
    return sectors.size;
  }, [partners]);

  // Filter partners based on search and category
  const filteredPartners = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return partners.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.industry || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.partnershipType || '').toLowerCase().includes(q) ||
        (p.status || '').toLowerCase().includes(q) ||
        (p.tags || []).some((tag) => tag.toLowerCase().includes(q));

      let matchesType = true;
      if (typeFilter === 'Featured') {
        matchesType = Boolean(p.featured);
      } else if (typeFilter !== 'All') {
        matchesType = (p.partnershipType || '').toLowerCase() === typeFilter.toLowerCase();
      }

      return matchesSearch && matchesType;
    });
  }, [partners, debouncedSearch, typeFilter]);

  // Sort partners based on selected mode
  const sortedPartners = useMemo(() => {
    const copy = [...filteredPartners];
    switch (sortMode) {
      case 'featured':
        return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      case 'name-asc':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      case 'hired-desc': {
        const getNum = (s?: string) => parseInt(s?.replace(/[^0-9]/g, '') || '0', 10);
        return copy.sort((a, b) => getNum(b.hiredCount) - getNum(a.hiredCount));
      }
      case 'mou-asc': {
        const getYear = (s?: string) => parseInt(s?.replace(/[^0-9]/g, '') || '2099', 10);
        return copy.sort((a, b) => getYear(a.mouYear) - getYear(b.mouYear));
      }
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

  // Render logo helper
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
        {partner.name.slice(0, 2).toUpperCase()}
      </div>
    );
  };

  // Institutional collaboration frameworks
  const collaborationTracks = [
    {
      icon: Briefcase,
      title: 'Talent Sourcing & Graduate Trainees',
      tag: 'Recruitment Track',
      description:
        'Directly recruit accredited engineering, computing, and applied science graduates with verified academic credentials from ASTU’s registrar records.',
    },
    {
      icon: FlaskConical,
      title: 'Joint Applied Labs & Co-Innovation',
      tag: 'Research Track',
      description:
        'Co-sponsor specialized research laboratories, cloud sandboxes, and artificial intelligence testbeds tackling national digital transformation challenges.',
    },
    {
      icon: BookOpen,
      title: 'Curriculum Advisory & ETA Feedback',
      tag: 'Academic Track',
      description:
        'Participate in biennial curriculum advisory boards, ensuring academic syllabi reflect the latest industry software, hardware, and safety standards.',
    },
    {
      icon: Handshake,
      title: 'Strategic MoUs & Capstone Grants',
      tag: 'Institutional MoUs',
      description:
        'Formalize university-industry memorandums of understanding for student capstone hackathons, faculty exchange, and technical sponsorships.',
    },
  ];

  // 4-Step auditable onboarding roadmap
  const onboardingSteps = [
    {
      step: '01',
      title: 'Register Corporate Profile & TIN',
      description:
        'Provide official company registration details, industry sector, contact email, and Ethiopian Taxpayer Identification Number (TIN).',
      icon: Building2,
    },
    {
      step: '02',
      title: 'Registrar & Corporate Review',
      description:
        'The ASTU Corporate Relations and Registrar office reviews submissions against official business licensing registries to guarantee authenticity.',
      icon: FileCheck2,
    },
    {
      step: '03',
      title: 'Recruiter Dashboard Activation',
      description:
        'Once authenticated, receive secure credentials to publish career openings, review graduate applicants, and schedule campus interview suites.',
      icon: BadgeCheck,
    },
    {
      step: '04',
      title: 'Campus Recruitment & Curricula Input',
      description:
        'Conduct priority on-campus interviews, host tech talks, and submit structured graduate competency ratings that directly inform ASTU syllabus updates.',
      icon: Handshake,
    },
  ];

  // Institutional FAQs
  const faqs = [
    {
      q: 'Why is an official Ethiopian Tax Identification Number (TIN) required?',
      a: 'Requiring a valid TIN ensures all participating recruiters and corporate partners are registered and authenticated legal entities. This safeguards student data privacy and ensures verified, high-integrity employment opportunities.',
    },
    {
      q: 'Are there any fees for companies to partner or post jobs with ASTU?',
      a: 'No. Registering as an employer partner, posting employment and internship opportunities, and engaging with verified alumni are 100% free of charge as part of ASTU’s national STEM mandate.',
    },
    {
      q: 'How quickly is a new partner or employer registration reviewed?',
      a: 'The ASTU Corporate Relations and University Registrar office typically reviews and validates registration credentials within 24 to 48 business hours.',
    },
    {
      q: 'Can partner organizations organize on-campus career talks and interview drives?',
      a: 'Yes. Partner organizations receive priority access to ASTU departmental interview rooms, computer labs, and auditorium facilities for tech talks and on-campus recruitment fairs.',
    },
    {
      q: 'How does employer feedback directly shape university engineering curricula?',
      a: 'Employers provide structured evaluations on graduate technical proficiencies. This data is aggregated in biennial tracer studies submitted to the Academic Vice President and ETA accreditation auditors to refine course syllabi.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* ── Navbar is kept untouched ── */}
      <Navbar />

      {/* ── 1. Compact Institutional Page Header ── */}
      <header
        id="partner-hero"
        className="relative overflow-hidden bg-gradient-to-b from-[#001f3f] via-[#002b5c] to-[#001830] text-white pt-12 pb-14 sm:pt-16 sm:pb-18 border-b border-blue-900/40"
      >
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:2rem_2rem] pointer-events-none" />
        <div className="absolute -top-24 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Institutional Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-blue-200 mb-4 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ASTU Industry Linkage & Corporate Alliances</span>
            </div>

            {/* Page Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Our Partners &amp; Industry Collaborators
            </h1>

            {/* Concise Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mb-8">
              Fostering strategic university-industry collaborations, graduate recruitment pipelines,
              and applied research with Ethiopia's leading technology enterprises, government agencies,
              and global academic institutions.
            </p>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(pageConfig.heroPrimaryCtaLink || '/employers/register')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-950/40 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Register as Partner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate(pageConfig.heroSecondaryCtaLink || '/login')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all hover:-translate-y-0.5 cursor-pointer backdrop-blur-xs"
              >
                <Building className="w-4 h-4 text-blue-300" />
                <span>Employer Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShareItem({
                    title: 'ASTU Industry & Partner Directory',
                    subtitle: 'Explore corporate partners and research alliances at ASTU',
                    text: 'Explore official partner organizations, research consortia, and graduate hiring collaborations at Adama Science and Technology University.',
                    url: '/partners',
                    badge: 'Partners Portal',
                    type: 'page',
                  });
                  setIsShareOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer backdrop-blur-xs"
                title="Share this directory"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* ── Verified Live Metrics Strip ── */}
          <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl sm:text-3xl font-black text-white">{partners.length}</span>
                <Building2 className="w-5 h-5 text-blue-300 opacity-80" />
              </div>
              <div className="text-xs font-semibold text-blue-200">Active Partners</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Verified Corporate &amp; Public</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl sm:text-3xl font-black text-white">{distinctSectorsCount}</span>
                <Briefcase className="w-5 h-5 text-emerald-300 opacity-80" />
              </div>
              <div className="text-xs font-semibold text-emerald-200">Industry Sectors</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Tech, Banking, Energy, Govt</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {partners.filter((p) => p.featured || p.partnershipType === 'Strategic').length}
                </span>
                <Handshake className="w-5 h-5 text-amber-300 opacity-80" />
              </div>
              <div className="text-xs font-semibold text-amber-200">Strategic MoUs</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Active Formal Frameworks</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {metrics.registeredAlumniFormatted && metrics.registeredAlumniFormatted !== '—'
                    ? metrics.registeredAlumniFormatted
                    : '1,215+'}
                </span>
                <Users className="w-5 h-5 text-sky-300 opacity-80" />
              </div>
              <div className="text-xs font-semibold text-sky-200">Verified Alumni</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Registered In System</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Featured Strategic Partners Showcase ── */}
      {featuredPartners.length > 0 && (
        <section
          id="featured-partners"
          className="py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
          aria-label="Featured Strategic Partners"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Featured Strategic Alliances
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {featuredPartners.length} Organizations
              </span>
            </div>

            {/* Horizontal Scroll / Grid for Featured Partners */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {featuredPartners.map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  onClick={() => setSelectedCompanyModal(partner)}
                  className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-xs transition-all shrink-0 cursor-pointer text-left"
                >
                  <div className="flex h-8 w-12 items-center justify-center shrink-0">
                    {renderLogo(partner, 'h-7 w-7')}
                  </div>
                  <div className="shrink-0 pr-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <span className="truncate max-w-[130px] sm:max-w-[150px]">{partner.name}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                      {partner.industry?.split('&')[0]?.trim() || partner.partnershipType}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Main Discovery Toolbar & Partner Directory ── */}
      <section
        id="partner-directory"
        ref={directoryRef}
        className="py-12 sm:py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Partner Directory"
      >
        {/* Section Title & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Building className="w-3.5 h-3.5" />
              <span>Verified Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Partner Organizations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Search and filter enterprise collaborators, public agencies, and research consortia actively
              engaging with ASTU.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80 lg:w-96">
            <label htmlFor="partner-search-input" className="sr-only">
              Search partners by name, sector, or keyword
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="partner-search-input"
              type="text"
              value={partnerSearch}
              onChange={(e) => setPartnerSearch(e.target.value)}
              placeholder="Search by company, sector, location..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
            />
            {partnerSearch && (
              <button
                type="button"
                onClick={() => setPartnerSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          className="flex overflow-x-auto space-x-2 pb-3 mb-5 no-scrollbar"
          role="tablist"
          aria-label="Filter partners by category"
        >
          {[
            { id: 'All', label: 'All Partners', count: typeCounts.All },
            { id: 'Strategic', label: 'Strategic MoUs', count: typeCounts.Strategic },
            { id: 'Technology', label: 'Technology & Cloud', count: typeCounts.Technology },
            { id: 'Research', label: 'Research & Consortia', count: typeCounts.Research },
            { id: 'Banking', label: 'Banking & FinTech', count: typeCounts.Banking },
            { id: 'Recruitment', label: 'Active Recruitment', count: typeCounts.Recruitment },
            { id: 'Government', label: 'Government Agencies', count: typeCounts.Government },
          ].map((cat) => {
            const isActive = typeFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTypeFilter(cat.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {cat.count ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Directory Controls & Active Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
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

            {/* Active filter chip */}
            {(typeFilter !== 'All' || debouncedSearch) && (
              <div className="inline-flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset filters</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="partner-sort-select" className="text-slate-400 font-medium">
                Sort:
              </label>
              <select
                id="partner-sort-select"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="name-asc">Name (A → Z)</option>
                <option value="name-desc">Name (Z → A)</option>
                <option value="hired-desc">Most Alumni Hired</option>
                <option value="mou-asc">Longest Partnership</option>
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
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
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

            {/* View Mode Toggle: Grid vs Dense List */}
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
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="Table list view"
                aria-pressed={viewMode === 'list'}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Empty State ── */}
        {sortedPartners.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center bg-white dark:bg-slate-900 my-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No Matching Partner Organizations
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              We couldn't find any partner records matching{' '}
              <strong className="text-slate-700 dark:text-slate-300">"{debouncedSearch}"</strong> in category{' '}
              <strong className="text-slate-700 dark:text-slate-300">"{typeFilter}"</strong>. Try refining your keywords or resetting filters.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Search &amp; Filters</span>
            </button>
          </div>
        )}

        {/* ── View Mode: GRID VIEW ── */}
        {viewMode === 'grid' && sortedPartners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
            {pagedPartners.map((partner) => (
              <div
                key={partner.id}
                className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 relative"
              >
                {/* Featured Badge */}
                {partner.featured && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>Featured</span>
                  </span>
                )}

                <div>
                  {/* Standardized Logo Container */}
                  <div className="flex h-14 items-center justify-start mb-4 pr-16">
                    {renderLogo(partner, 'h-12 w-12')}
                  </div>

                  {/* Organization Name & Sector */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {partner.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {partner.industry || 'Technology & Engineering'}
                  </div>

                  {/* Partnership Tier & MoU Status Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-900/60">
                      {partner.status || `${partner.partnershipType || 'Enterprise'} Partner`}
                    </span>
                    {partner.mouYear && (
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {partner.mouYear}
                      </span>
                    )}
                  </div>

                  {/* Concise Description preview */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mt-3">
                    {partner.description ||
                      `${partner.name} collaborates with ASTU through accredited graduate hiring pipelines and curriculum competency reviews.`}
                  </p>

                  {/* Meta details: Location & Alumni Track */}
                  <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{partner.location || 'Ethiopia & Regional Hubs'}</span>
                    </div>
                    {partner.hiredCount && (
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        <span>{partner.hiredCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCompanyModal(partner)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>View details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={`Visit ${partner.name} official website`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShareItem({
                        id: partner.id,
                        title: `${partner.name} — ASTU Industry Partner`,
                        subtitle: partner.industry || 'Corporate Partner',
                        text: `${partner.name} is an official partner organization of ASTU (${partner.status || partner.partnershipType}). Explore graduate recruitment and collaborative innovation pipelines.`,
                        url: `/partners?partner=${encodeURIComponent(partner.id)}`,
                        badge: 'ASTU Partner',
                        type: 'page',
                      });
                      setIsShareOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={`Share ${partner.name}`}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── View Mode: DENSE LIST / TABLE VIEW ── */}
        {viewMode === 'list' && sortedPartners.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="py-3.5 pl-6 pr-4">Organization &amp; Sector</th>
                    <th scope="col" className="px-4 py-3.5">Partnership Tier</th>
                    <th scope="col" className="px-4 py-3.5">Location</th>
                    <th scope="col" className="px-4 py-3.5">ASTU Alumni Hired</th>
                    <th scope="col" className="px-4 py-3.5">Engagement Status</th>
                    <th scope="col" className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pagedPartners.map((partner) => (
                    <tr
                      key={partner.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCompanyModal(partner)}
                    >
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-1 shrink-0">
                            {renderLogo(partner, 'h-7 w-7')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                              <span>{partner.name}</span>
                              {partner.featured && (
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {partner.industry || 'Technology & Engineering'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          {partner.status || partner.partnershipType || 'Corporate Partner'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{partner.location || 'Addis Ababa'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {partner.hiredCount || 'Active Track'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {partner.mouYear || 'Established'}
                      </td>
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <div
                          className="inline-flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedCompanyModal(partner)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold transition-all text-xs cursor-pointer"
                          >
                            Details
                          </button>
                          {partner.website && (
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

        {/* ── Directory Pagination Bar ── */}
        {sortedPartners.length > 0 && pageSize !== 'All' && totalPartnerPages > 1 && (
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

      {/* ── 4. Strategic Collaboration Frameworks (Value Proposition) ── */}
      <section
        id="partner-benefits"
        className="py-16 sm:py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Institutional Value Proposition
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Why Partner with Adama Science &amp; Technology University?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              ASTU provides an accredited bridge connecting corporate and governmental enterprises with
              practical engineering talent, research facilities, and curriculum advisory channels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collaborationTracks.map((track, idx) => {
              const Icon = track.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {track.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                      {track.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {track.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Auditable Onboarding Process ── */}
      <section id="partner-tracks" className="py-16 sm:py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Clear &amp; Auditable Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            How Employer &amp; Partner Registration Works
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            From official business registration to active campus recruitment in four structured steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {onboardingSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                    {step.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. Partner Inquiries FAQ ── */}
      <section
        id="partner-faq"
        className="py-16 sm:py-20 bg-slate-100/60 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Institutional Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Frequently Asked Questions for Partners
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Everything organizations need to know about partnering, TIN verification, and graduate recruitment.
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. Closing Institutional Call to Action ── */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#001f3f] via-[#002b5c] to-[#001830] text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight">
            Connect with ASTU's Engineering &amp; Computing Talent
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mb-8 max-w-xl mx-auto leading-relaxed">
            Register your organization today. Simple authenticated registration, official TIN verification,
            and direct access to graduating seniors and verified alumni.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/employers/register')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-950/40 transition-all hover:scale-105 cursor-pointer"
            >
              Start Free Partner Registration
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-all hover:scale-105 cursor-pointer"
            >
              Sign In to Recruiter Portal
            </button>
          </div>
        </div>
      </section>

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
