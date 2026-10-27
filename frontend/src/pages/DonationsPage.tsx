import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Search,
  Filter,
  Users,
  Target,
  Sparkles,
  ShieldCheck,
  Building,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  LogIn,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Edit3,
  SlidersHorizontal,
  Share2,
  Check,
  Lock,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import PaginationBar from '../components/PaginationBar';
import TelebirrDonationModal from '../components/TelebirrDonationModal';
import ShareCampaignModal from '../components/ShareCampaignModal';
import contentService from '../features/admin/services/content.service';
import { homepageCmsService } from '../features/admin/services/homepageCms.service';

interface DonationCampaign {
  id: string;
  title: string;
  category?: string;
  description?: string;
  goal: number;
  raised: number;
  donorCount: number;
  status: string;
  image?: string;
  createdAt?: string;
}

const fallbackCampaigns: DonationCampaign[] = [
  {
    id: 'fallback-c-1',
    title: 'ASTU Scholarship Fund 2026',
    category: 'Scholarship',
    description: 'Support underprivileged engineering and technology students with full tuition, academic supplies, and campus living grants.',
    goal: 5000000,
    raised: 1851000,
    donorCount: 349,
    status: 'ACTIVE',
    image: '/images/gc7.jpg',
  },
  {
    id: 'fallback-c-2',
    title: 'AI Research Lab Equipment',
    category: 'Research',
    description: 'Fund high-performance GPU servers and laboratory instrumentation for advanced postgraduate engineering researchers.',
    goal: 8000000,
    raised: 3201000,
    donorCount: 158,
    status: 'ACTIVE',
    image: '/images/electriclabs.jpeg',
  },
  {
    id: 'fallback-c-3',
    title: 'Campus Innovation Makerspace',
    category: 'Infrastructure',
    description: 'Build a state-of-the-art student incubator, rapid prototyping center, and robotics testing laboratory on main campus.',
    goal: 12000000,
    raised: 6800000,
    donorCount: 220,
    status: 'ACTIVE',
    image: '/images/astusteam.jpg',
  },
  {
    id: 'fallback-c-4',
    title: 'Solar Microgrid & Clean Energy Lab',
    category: 'Innovation',
    description: 'Empower student researchers to design, test, and deploy sustainable microgrid systems for Ethiopian regional community centers.',
    goal: 4500000,
    raised: 2150000,
    donorCount: 114,
    status: 'ACTIVE',
    image: '/images/arc.jpg',
  },
  {
    id: 'fallback-c-5',
    title: 'Emergency Student Welfare & Medical Grant',
    category: 'Student Welfare',
    description: 'Provide rapid relief grants for students facing emergency health or family hardships during the academic semester.',
    goal: 2000000,
    raised: 1420000,
    donorCount: 196,
    status: 'ACTIVE',
    image: '/images/campus-2.jpeg',
  },
  {
    id: 'fallback-c-6',
    title: 'Robotics & Mechatronics Testing Cell',
    category: 'Research',
    description: 'Acquire precision robotic arms, sensor calibration arrays, and pneumatic test benches for engineering undergraduate thesis projects.',
    goal: 6000000,
    raised: 2890000,
    donorCount: 143,
    status: 'ACTIVE',
    image: '/images/arc.jpg',
  },
];

const formatETB = (value?: number | null) => (value ?? 0).toLocaleString('en-US');
const formatCompact = (value?: number | null) => {
  const num = value ?? 0;
  if (num >= 1_000_000) {
    const millions = num / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  if (num >= 1_000) {
    const thousands = num / 1_000;
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`;
  }
  return `${num}`;
};

const getCampaignImage = (campaign: DonationCampaign | any) => {
  if (campaign?.image && typeof campaign.image === 'string' && campaign.image.trim() !== '') {
    return campaign.image;
  }
  const cat = (campaign?.category || '').toLowerCase();
  const title = (campaign?.title || '').toLowerCase();
  if (title.includes('scholarship') || cat.includes('scholarship')) return '/images/gc7.jpg';
  if (title.includes('ai') || title.includes('equipment') || title.includes('lab')) return '/images/electriclabs.jpeg';
  if (title.includes('makerspace') || title.includes('hub') || title.includes('innovation')) return '/images/astusteam.jpg';
  if (title.includes('solar') || title.includes('energy') || title.includes('clean')) return '/images/arc.jpg';
  if (title.includes('welfare') || title.includes('medical') || title.includes('emergency')) return '/images/campus-2.jpeg';
  if (title.includes('robotics') || title.includes('mechatronics')) return '/images/arc.jpg';
  return '/images/astu-building.jpg';
};

const categoryBadges: Record<string, { bg: string; text: string; ring: string }> = {
  Scholarship: { bg: 'bg-blue-600/95 dark:bg-sky-600/95', text: 'text-white', ring: 'ring-blue-400/40' },
  Research: { bg: 'bg-emerald-600/95 dark:bg-emerald-600/95', text: 'text-white', ring: 'ring-emerald-400/40' },
  Infrastructure: { bg: 'bg-amber-600/95 dark:bg-amber-600/95', text: 'text-white', ring: 'ring-amber-400/40' },
  Innovation: { bg: 'bg-indigo-600/95 dark:bg-indigo-600/95', text: 'text-white', ring: 'ring-indigo-400/40' },
  'Student Welfare': { bg: 'bg-rose-600/95 dark:bg-rose-600/95', text: 'text-white', ring: 'ring-rose-400/40' },
  'Emergency Fund': { bg: 'bg-red-600/95 dark:bg-red-600/95', text: 'text-white', ring: 'ring-red-400/40' },
};

const getCampaignAvailability = (campaign: DonationCampaign) => {
  const status = (campaign.status || 'ACTIVE').trim().toUpperCase();
  const isFunded = campaign.goal > 0 && campaign.raised >= campaign.goal;

  if (isFunded || ['COMPLETE', 'COMPLETED', 'FUNDED'].includes(status)) {
    return { label: 'Goal reached', actionLabel: 'Goal reached', available: false, className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300' };
  }
  if (['PAUSED', 'ON_HOLD'].includes(status)) {
    return { label: 'Temporarily paused', actionLabel: 'Giving paused', available: false, className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300' };
  }
  if (['CLOSED', 'INACTIVE', 'ARCHIVED', 'DRAFT'].includes(status)) {
    return { label: 'Not accepting gifts', actionLabel: 'Cause closed', available: false, className: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-white/5 dark:text-slate-400' };
  }
  return { label: 'Accepting support', actionLabel: 'Support this cause', available: true, className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300' };
};

export default function DonationsPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>(fallbackCampaigns);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'progress' | 'raised' | 'goal' | 'donors'>('featured');

  // Giving Portal Hero Banner & Public Content CMS state
  const [isStaff, setIsStaff] = useState(false);
  const [showEditBannerModal, setShowEditBannerModal] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('Invest in the Next Generation of ASTU Engineers & Leaders');
  const [bannerSubtitle, setBannerSubtitle] = useState(
    '100% of your tax-deductible contribution directly funds merit scholarships, cutting-edge postgraduate laboratories, student incubators, and emergency support. Powered by verified Chapa, Telebirr, and CBE Birr gateways.'
  );
  const [bannerButtonText, setBannerButtonText] = useState('Explore All Causes');
  const [bannerSecondaryButtonText, setBannerSecondaryButtonText] = useState('Alumni Donor Dashboard');
  const [commitmentEyebrow, setCommitmentEyebrow] = useState('Our Commitment');
  const [commitmentTitle, setCommitmentTitle] = useState('Why Give Through the ASTU Alumni Foundation?');
  const [commitmentSubtitle, setCommitmentSubtitle] = useState(
    'Transparent, measurable, and university-directed philanthropy designed to accelerate national technology excellence.'
  );
  const [commitmentCard1Title, setCommitmentCard1Title] = useState('100% Directed Impact');
  const [commitmentCard1Desc, setCommitmentCard1Desc] = useState(
    'Zero administrative deduction. Every single Birr is mapped directly to the designated laboratory, student tuition grant, or research equipment fund.'
  );
  const [commitmentCard2Title, setCommitmentCard2Title] = useState('Merit & Equity Scholarships');
  const [commitmentCard2Desc, setCommitmentCard2Desc] = useState(
    'Over 340+ undergraduate engineering students in need receive full textbook, meal, and laptop stipends enabled by alumni contributions.'
  );
  const [commitmentCard3Title, setCommitmentCard3Title] = useState('Verifiable Audit Reports');
  const [commitmentCard3Desc, setCommitmentCard3Desc] = useState(
    'All donations receive immediate Chapa digital receipts and are integrated into the annual alumni office financial audit released to all stakeholders.'
  );
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Pagination state for public campaign directory
  const [donationPage, setDonationPage] = useState(0);
  const DONATION_PAGE_SIZE = 6;

  // Modals state
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isDonationAuthModalOpen, setIsDonationAuthModalOpen] = useState(false);
  const [isDirectDonationModalOpen, setIsDirectDonationModalOpen] = useState(false);
  const [directDonationTarget, setDirectDonationTarget] = useState<any | null>(null);
  const [directDonationMethod, setDirectDonationMethod] = useState<'telebirr' | 'cbe' | 'card'>('telebirr');
  const [shareModalCampaign, setShareModalCampaign] = useState<DonationCampaign | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const donationDashboardPath = (campaignId?: string) => {
    const params = new URLSearchParams({ tab: 'donations' });
    if (campaignId) params.set('campaign', campaignId);
    return `/alumni/dashboard?${params.toString()}`;
  };

  const loginForDonation = (campaignId?: string) => {
    navigate(`/login?redirect=${encodeURIComponent(donationDashboardPath(campaignId))}`);
  };

  const handleDonateClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    let user: any = null;
    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch {}

    if (token && user?.role?.toUpperCase() === 'ALUMNI') {
      navigate(donationDashboardPath(campaign.id));
    } else {
      setIsDonationAuthModalOpen(true);
    }
  };

  const handleFastPayDirect = (campaign: any, method: 'telebirr' | 'cbe' | 'card' = 'telebirr') => {
    setDirectDonationTarget(campaign);
    setDirectDonationMethod(method);
    setIsDirectDonationModalOpen(true);
  };

  const handleOpenShareModal = (campaign: DonationCampaign) => {
    setShareModalCampaign(campaign);
    setIsShareModalOpen(true);
  };

  const handleDonorDashboard = () => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    try {
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (token && user?.role?.toUpperCase() === 'ALUMNI') {
        navigate(donationDashboardPath());
        return;
      }
    } catch {}
    loginForDonation();
  };

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await contentService.getPublicDonationCampaigns();
      if (Array.isArray(data) && data.length > 0) {
        setCampaigns(data);
      }
    } catch (e) {
      console.warn('Failed to fetch public donation campaigns, using default catalogue', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    window.addEventListener('astu-cms-donations-changed', fetchCampaigns);
    return () => {
      window.removeEventListener('astu-cms-donations-changed', fetchCampaigns);
    };
  }, []);

  // Check role & sync Giving Section CMS Config
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (['ADMIN', 'SUPER_ADMIN', 'CMS_OFFICER', 'STAFF'].includes(u.role)) {
          setIsStaff(true);
        }
      } catch {}
    }

    const syncCmsSettings = () => {
      const cmsCfg = homepageCmsService.getSettings();
      if (cmsCfg?.givingSection) {
        const gs = cmsCfg.givingSection;
        if (gs.title) setBannerTitle(gs.title);
        if (gs.subtitle) setBannerSubtitle(gs.subtitle);
        if (gs.buttonText) setBannerButtonText(gs.buttonText);
        if (gs.secondaryButtonText) setBannerSecondaryButtonText(gs.secondaryButtonText);
        if (gs.commitmentEyebrow) setCommitmentEyebrow(gs.commitmentEyebrow);
        if (gs.commitmentTitle) setCommitmentTitle(gs.commitmentTitle);
        if (gs.commitmentSubtitle) setCommitmentSubtitle(gs.commitmentSubtitle);
        if (gs.commitmentCard1Title) setCommitmentCard1Title(gs.commitmentCard1Title);
        if (gs.commitmentCard1Desc) setCommitmentCard1Desc(gs.commitmentCard1Desc);
        if (gs.commitmentCard2Title) setCommitmentCard2Title(gs.commitmentCard2Title);
        if (gs.commitmentCard2Desc) setCommitmentCard2Desc(gs.commitmentCard2Desc);
        if (gs.commitmentCard3Title) setCommitmentCard3Title(gs.commitmentCard3Title);
        if (gs.commitmentCard3Desc) setCommitmentCard3Desc(gs.commitmentCard3Desc);
      }
    };
    syncCmsSettings();
    window.addEventListener('astu-cms-homepage-updated', syncCmsSettings);
    return () => {
      window.removeEventListener('astu-cms-homepage-updated', syncCmsSettings);
    };
  }, []);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    setIsSavingBanner(true);
    try {
      const ok = await homepageCmsService.saveSettings({
        givingSection: {
          title: bannerTitle,
          subtitle: bannerSubtitle,
          buttonText: bannerButtonText || 'Explore All Causes',
          secondaryButtonText: bannerSecondaryButtonText || 'Alumni Donor Dashboard',
          commitmentEyebrow: commitmentEyebrow || 'Our Commitment',
          commitmentTitle: commitmentTitle || 'Why Give Through the ASTU Alumni Foundation?',
          commitmentSubtitle:
            commitmentSubtitle ||
            'Transparent, measurable, and university-directed philanthropy designed to accelerate national technology excellence.',
          commitmentCard1Title: commitmentCard1Title || '100% Directed Impact',
          commitmentCard1Desc:
            commitmentCard1Desc ||
            'Zero administrative deduction. Every single Birr is mapped directly to the designated laboratory, student tuition grant, or research equipment fund.',
          commitmentCard2Title: commitmentCard2Title || 'Merit & Equity Scholarships',
          commitmentCard2Desc:
            commitmentCard2Desc ||
            'Over 340+ undergraduate engineering students in need receive full textbook, meal, and laptop stipends enabled by alumni contributions.',
          commitmentCard3Title: commitmentCard3Title || 'Verifiable Audit Reports',
          commitmentCard3Desc:
            commitmentCard3Desc ||
            'All donations receive immediate Chapa digital receipts and are integrated into the annual alumni office financial audit released to all stakeholders.',
        },
      });
      if (ok) {
        toast.success('Giving portal banner updated successfully!');
        setShowEditBannerModal(false);
        window.dispatchEvent(new Event('astu-cms-homepage-updated'));
        window.dispatchEvent(new Event('astu-cms-donations-changed'));
      } else {
        toast.error('Failed to update banner');
      }
    } catch {
      toast.error('Error saving banner');
    } finally {
      setIsSavingBanner(false);
    }
  };

  const totalRaised = useMemo(() => campaigns.reduce((acc, c) => acc + (c.raised || 0), 0), [campaigns]);
  const totalGoal = useMemo(() => campaigns.reduce((acc, c) => acc + (c.goal || 0), 0), [campaigns]);
  const totalDonors = useMemo(() => campaigns.reduce((acc, c) => acc + (c.donorCount || 0), 0), [campaigns]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(campaigns.map((c) => c.category || 'Initiative').filter(Boolean)));
    return ['ALL', ...list];
  }, [campaigns]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: campaigns.length };
    campaigns.forEach((c) => {
      const cat = c.category || 'Initiative';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'progress') {
          const pctA = (a.raised || 0) / (a.goal || 1);
          const pctB = (b.raised || 0) / (b.goal || 1);
          return pctB - pctA;
        }
        if (sortBy === 'raised') return (b.raised || 0) - (a.raised || 0);
        if (sortBy === 'goal') return (b.goal || 0) - (a.goal || 0);
        if (sortBy === 'donors') return (b.donorCount || 0) - (a.donorCount || 0);
        return 0; // Default featured
      });
  }, [campaigns, selectedCategory, searchQuery, sortBy]);

  // Pagination for Public Campaigns Directory
  const donationTotalPages = Math.max(1, Math.ceil(filteredCampaigns.length / DONATION_PAGE_SIZE));
  const safeDonationPage = Math.min(donationPage, Math.max(0, donationTotalPages - 1));
  const paginatedPublicCampaigns = useMemo(() => {
    return filteredCampaigns.slice(safeDonationPage * DONATION_PAGE_SIZE, safeDonationPage * DONATION_PAGE_SIZE + DONATION_PAGE_SIZE);
  }, [filteredCampaigns, safeDonationPage]);

  useEffect(() => {
    setDonationPage(0);
  }, [searchQuery, selectedCategory, sortBy, filteredCampaigns.length]);

  useEffect(() => {
    setDonationPage((prev) => Math.min(prev, Math.max(0, donationTotalPages - 1)));
  }, [donationTotalPages]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#0a192f] text-white pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Heart className="h-[520px] w-[520px] text-white" />
          </div>
        </div>

        {/* Top tri-color ASTU ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-astu-navy via-astu-green to-amber-400" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
          <div className="max-w-3xl">
            {isStaff && (
              <div className="mb-5 inline-flex items-center gap-2">
                <button
                  onClick={() => setShowEditBannerModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                  title="Edit Giving portal banner content directly from this page"
                >
                  <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Edit Banner (CMS)</span>
                </button>
                <button
                  onClick={() => navigate('/cms/donations')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-400/40 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                  title="Go to CMS Donations & Giving Management Desk"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Donations Management Desk</span>
                </button>
              </div>
            )}

            {/* University Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-amber-300 mb-4 shadow-sm">
              <Heart className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>ASTU Advancement &amp; Alumni Philanthropy</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              {bannerTitle}
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-medium">
              {bannerSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => {
                  const el = document.getElementById('campaigns-directory');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-900/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2"
              >
                <Heart className="h-4 w-4 fill-white" />
                <span>{bannerButtonText}</span>
              </button>

              <button
                onClick={handleDonorDashboard}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2 backdrop-blur-md"
              >
                <span>{bannerSecondaryButtonText || 'Alumni Donor Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Key Metrics Banner */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block">Total Raised</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 tracking-tight">{formatCompact(totalRaised)} ETB</p>
              <p className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified Chapa &amp; Telebirr</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block">Target Objective</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">{formatCompact(totalGoal)} ETB</p>
              <p className="text-[10px] text-slate-300 font-medium mt-1">Campus Development Fund</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block">Total Supporters</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">{formatCompact(totalDonors)}</p>
              <p className="text-[10px] text-teal-300 font-bold mt-1">Alumni &amp; Global Partners</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block">Active Causes</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">{campaigns.length}</p>
              <p className="text-[10px] text-emerald-400 font-bold mt-1">100% Tax Deductible</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Directory Section ── */}
      <section id="campaigns-directory" className="py-10 md:py-16 flex-1">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          {/* Controls: Search, Filter, Sort */}
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDonationPage(0);
                  }}
                  placeholder="Search causes by title, keyword, or faculty..."
                  className="w-full text-xs md:text-sm pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-astu-navy dark:focus:border-sky-400 transition-colors font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2.5 self-end md:self-auto">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => {
                    setSortBy(e.target.value);
                    setDonationPage(0);
                  }}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-astu-navy dark:focus:border-sky-400 cursor-pointer shadow-xs"
                >
                  <option value="featured">Featured Causes</option>
                  <option value="progress">Most Funded %</option>
                  <option value="raised">Highest Amount Raised</option>
                  <option value="goal">Highest Target Goal</option>
                  <option value="donors">Most Donors</option>
                </select>

                <button
                  onClick={fetchCampaigns}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Refresh Campaigns"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mr-1">
                Categories:
              </span>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setDonationPage(0);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-astu-navy text-white shadow-md ring-2 ring-astu-navy/20 dark:bg-sky-600 dark:ring-sky-400/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{cat === 'ALL' ? 'All Initiatives' : cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                Showing{' '}
                <strong className="text-slate-900 dark:text-white">
                  {filteredCampaigns.length > 0 ? safeDonationPage * DONATION_PAGE_SIZE + 1 : 0}
                </strong>
                –
                <strong className="text-slate-900 dark:text-white">
                  {Math.min(filteredCampaigns.length, (safeDonationPage + 1) * DONATION_PAGE_SIZE)}
                </strong>{' '}
                of <strong className="text-slate-900 dark:text-white">{filteredCampaigns.length}</strong> campaigns
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
              Adama Science and Technology University Alumni Foundation
            </span>
          </div>

          {/* Chapa Payment Gateway Live Status & Institutional Trust Bar */}
          <div className="mb-6 rounded-2xl border border-emerald-200/90 dark:border-emerald-800/70 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-emerald-950/30 p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
                CH
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Chapa Institutional Payment Gateway
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Sandbox • 100% Operational
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Latency: ~110ms • 256-bit SSL
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                  Instant university endowment checkout supporting Telebirr, CBE Birr, Awash, Dashen, and International Visa / Mastercard.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setDirectDonationTarget(campaigns[0] || fallbackCampaigns[0]);
                  setDirectDonationMethod('card');
                  setIsDirectDonationModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verify Chapa Status</span>
              </button>
            </div>
          </div>

          {/* Campaign Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPublicCampaigns.map((c, idx) => {
              const goal = c.goal || 1000000;
              const raised = c.raised || 0;
              const percent = Math.min(100, Math.round((raised / (goal || 1)) * 100));
              const donors = c.donorCount || 0;
              const remaining = Math.max(0, goal - raised);
              const category = c.category || 'Initiative';
              const catBadge = categoryBadges[category] || { bg: 'bg-slate-800/95', text: 'text-white', ring: 'ring-white/20' };
              const availability = getCampaignAvailability(c);

              const isFullyFunded = goal > 0 && percent >= 100;
              const isAlmostFunded = goal > 0 && percent >= 75 && !isFullyFunded;
              const isUrgent = goal > 0 && percent < 40;

              let statusConfig: {
                label: string;
                badgeClass: string;
                dotColor: string;
                isPulsing: boolean;
              };

              if (isFullyFunded) {
                statusConfig = {
                  label: 'Goal Reached',
                  badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40 shadow-sm',
                  dotColor: 'bg-emerald-400',
                  isPulsing: false,
                };
              } else if (isAlmostFunded) {
                statusConfig = {
                  label: `Nearly Funded • ${percent}%`,
                  badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40 shadow-sm',
                  dotColor: 'bg-emerald-400',
                  isPulsing: true,
                };
              } else if (isUrgent) {
                statusConfig = {
                  label: 'Needs Support',
                  badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-400/40 shadow-sm',
                  dotColor: 'bg-amber-400',
                  isPulsing: true,
                };
              } else {
                statusConfig = {
                  label: 'Active Campaign',
                  badgeClass: 'bg-slate-900/80 text-sky-300 border-sky-400/40 shadow-sm',
                  dotColor: 'bg-sky-400',
                  isPulsing: false,
                };
              }

              const barColor = isFullyFunded
                ? 'from-emerald-500 via-teal-400 to-emerald-400'
                : isAlmostFunded
                  ? 'from-emerald-500 via-teal-400 to-emerald-400'
                  : isUrgent
                    ? 'from-amber-400 via-orange-400 to-rose-400'
                    : 'from-astu-navy via-blue-600 to-astu-green dark:from-sky-500 dark:via-blue-500 dark:to-emerald-400';

              return (
                <article
                  key={c.id || idx}
                  className="group flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,51,102,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-2xl dark:hover:shadow-sky-950/40 hover:-translate-y-2 hover:border-astu-navy/40 dark:hover:border-sky-500/40 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Top image cover container */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={getCampaignImage(c)}
                      alt={c.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 pointer-events-none" />

                    {/* Top Bar on Image: Category Badge + Status Pill */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ring-1 ${catBadge.bg} ${catBadge.text} ${catBadge.ring}`}
                      >
                        {category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border ${statusConfig.badgeClass}`}
                      >
                        <span className="relative flex h-2 w-2">
                          {statusConfig.isPulsing && (
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.dotColor}`} />
                          )}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dotColor}`} />
                        </span>
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>

                    {/* Bottom Bar on Image: Donors Count Badge */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-extrabold text-white shadow-sm border border-white/10">
                        <Users className="h-3.5 w-3.5 text-amber-400" />
                        <span>{donors.toLocaleString()} {donors === 1 ? 'Donor' : 'Donors'}</span>
                      </span>
                      <span className="text-[10px] font-bold text-white/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                        100% Directed
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white group-hover:text-astu-navy dark:group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                        {c.title}
                      </h3>
                      <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">
                        {c.description || 'Support ASTU causes and make a lasting impact for future generations of engineers and researchers.'}
                      </p>
                    </div>

                    {/* Financial Progress & Metrics */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Total Raised</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-astu-navy dark:text-white tracking-tight">
                              {formatETB(raised)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-extrabold">ETB</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Campaign Target</span>
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            {formatETB(goal)} ETB
                          </span>
                          {goal > raised && (
                            <span className="block text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 -mt-0.5">
                              {formatETB(remaining)} ETB left
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/70 dark:border-slate-700/80">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 shadow-xs relative`}
                          style={{ width: `${Math.max(5, percent)}%` }}
                          role="progressbar"
                          aria-label={`${c.title} funding progress`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={percent}
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full opacity-40 animate-pulse pointer-events-none" />
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 font-black text-slate-800 dark:text-slate-200 text-[11px]">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{percent}% Funded</span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${availability.className}`}>
                          {availability.label}
                        </span>
                      </div>

                      {/* Fast Pay Bar */}
                      <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 px-3 py-2 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Fast Pay:</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleFastPayDirect(c, 'telebirr')}
                            className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-700/50 hover:scale-105 transition-transform cursor-pointer"
                            title="Donate with Telebirr instantly"
                          >
                            Telebirr
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFastPayDirect(c, 'cbe')}
                            className="text-[10px] font-extrabold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-sky-700/50 hover:scale-105 transition-transform cursor-pointer"
                            title="Donate with CBE Birr instantly"
                          >
                            CBE Birr
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFastPayDirect(c, 'card')}
                            className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs"
                            title="Donate via Chapa: Instant Card, Telebirr & CBE Birr Checkout"
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span>Chapa</span>
                            <span className="text-[8px] uppercase tracking-wider font-black px-1 py-0.1 bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 rounded">Live</span>
                          </button>
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => handleDonateClick(c)}
                          aria-label={`Support this cause: ${c.title}`}
                          disabled={!availability.available}
                          className="flex-1 group/btn inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-astu-navy via-[#003875] to-astu-navy dark:from-sky-600 dark:via-blue-600 dark:to-sky-700 hover:brightness-110 text-white font-black text-xs md:text-sm py-3 px-4 shadow-md shadow-astu-navy/20 dark:shadow-sky-950/50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
                        >
                          <Heart className={`h-4 w-4 ${availability.available ? 'fill-amber-400 text-amber-400 group-hover/btn:scale-115 transition-transform' : 'text-slate-500'}`} />
                          <span>{availability.actionLabel}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenShareModal(c)}
                          aria-label={`Share this campaign: ${c.title}`}
                          className="shrink-0 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-sky-950/40 hover:text-blue-600 dark:hover:text-sky-300 hover:border-blue-300 dark:hover:border-sky-500 hover:scale-105 active:scale-95 transition-all shadow-2xs hover:shadow-md cursor-pointer group/share"
                          title="Share this campaign on Telegram, LinkedIn, WhatsApp or Copy Link"
                        >
                          <Share2 className="h-4 w-4 group-hover/share:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Controls for Public Directory */}
          {filteredCampaigns.length > 0 && (
            <PaginationBar
              currentPage={safeDonationPage}
              totalPages={donationTotalPages}
              total={filteredCampaigns.length}
              pageSize={DONATION_PAGE_SIZE}
              onPageChange={(p) => {
                setDonationPage(p);
                document.getElementById('campaigns-directory')?.scrollIntoView({ behavior: 'smooth' });
              }}
              noun="campaigns"
            />
          )}

          {filteredCampaigns.length === 0 && (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3 shadow-xs">
              <Heart className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No campaigns found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No fundraising campaigns matched your search or category filter. Try clearing filters to see all causes.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSortBy('featured');
                }}
                className="mt-2 px-5 py-2.5 bg-astu-navy text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Impact & Transparency Section ── */}
      <section className="bg-white dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-black uppercase text-astu-navy dark:text-sky-400 tracking-widest block mb-2">
              {commitmentEyebrow || 'Our Commitment'}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {commitmentTitle || 'Why Give Through the ASTU Alumni Foundation?'}
            </h2>
            <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {commitmentSubtitle || 'Transparent, measurable, and university-directed philanthropy designed to accelerate national technology excellence.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/80 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-astu-navy dark:text-sky-300 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {commitmentCard1Title || '100% Directed Impact'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {commitmentCard1Desc || 'Zero administrative deduction. Every single Birr is mapped directly to the designated laboratory, student tuition grant, or research equipment fund.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/80 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-astu-green dark:text-emerald-300 flex items-center justify-center font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {commitmentCard2Title || 'Merit & Equity Scholarships'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {commitmentCard2Desc || 'Over 340+ undergraduate engineering students in need receive full textbook, meal, and laptop stipends enabled by alumni contributions.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/80 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {commitmentCard3Title || 'Verifiable Audit Reports'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {commitmentCard3Desc || 'All donations receive immediate Chapa digital receipts and are integrated into the annual alumni office financial audit released to all stakeholders.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal: Support ASTU's Future ── */}
      {isDonationAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsDonationAuthModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-[#0f172a] shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Brand Ribbon */}
            <div className="h-1.5 w-full bg-gradient-to-r from-astu-navy via-astu-green to-amber-400" />

            <button
              onClick={() => setIsDonationAuthModalOpen(false)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 md:p-7">
              {/* Header Badge & Title */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-astu-navy/10 dark:bg-sky-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-astu-navy dark:text-sky-300 mb-3">
                <Heart className="h-3.5 w-3.5 fill-astu-red text-astu-red" />
                <span>ASTU Alumni Giving</span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                Support ASTU's Future
              </h3>

              {selectedCampaign && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-green dark:text-emerald-400 block">
                        Selected Cause
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {selectedCampaign.title}
                      </h4>
                    </div>
                    <span className="shrink-0 px-2.5 py-0.5 rounded-md bg-astu-navy/10 dark:bg-sky-500/20 text-astu-navy dark:text-sky-300 text-[10px] font-black uppercase">
                      {selectedCampaign.category || 'Initiative'}
                    </span>
                  </div>

                  {/* Progress strip */}
                  {selectedCampaign.goal > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                        <span className="text-slate-600 dark:text-slate-300">
                          {formatETB(selectedCampaign.raised)} ETB raised
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {Math.round(((selectedCampaign.raised || 0) / selectedCampaign.goal) * 100)}% of {formatETB(selectedCampaign.goal)} ETB
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(5, Math.round(((selectedCampaign.raised || 0) / selectedCampaign.goal) * 100)))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="mt-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Choose how you would like to proceed with your contribution:
              </p>

              {/* Options Cards */}
              <div className="mt-5 space-y-3">
                {/* Option 1: Direct Instant Giving (Telebirr / CBE / Card) */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    setDirectDonationTarget(selectedCampaign);
                    setIsDirectDonationModalOpen(true);
                  }}
                  className="group relative flex items-start gap-3.5 p-3.5 md:p-4 rounded-2xl border-2 border-amber-300/80 dark:border-amber-500/50 hover:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                        <span>Direct Online Giving</span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                          Instant
                        </span>
                      </h4>
                      <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 leading-relaxed">
                      Donate immediately with Telebirr, CBE Birr, or Credit Card without logging in.
                    </p>
                  </div>
                </div>

                {/* Option 2: Registered Alumni -> Login */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    loginForDonation(selectedCampaign?.id);
                  }}
                  className="group relative flex items-start gap-3.5 p-3.5 md:p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 hover:border-astu-navy dark:hover:border-sky-400 bg-white dark:bg-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-astu-navy/10 dark:bg-sky-500/20 text-astu-navy dark:text-sky-300 group-hover:bg-astu-navy dark:group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-astu-navy dark:group-hover:text-sky-300 transition-colors">
                        I am a Registered Alumni
                      </h4>
                      <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-astu-navy dark:group-hover:text-sky-300 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                      Sign in with your student ID or email to access your Giving dashboard and alumni donor records.
                    </p>
                  </div>
                </div>

                {/* Option 3: New Alumni -> Register */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    navigate(`/register?redirect=${encodeURIComponent(donationDashboardPath(selectedCampaign?.id))}`);
                  }}
                  className="group relative flex items-start gap-3.5 p-3.5 md:p-4 rounded-2xl border-2 border-emerald-200/90 dark:border-emerald-800/70 hover:border-emerald-600 dark:hover:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        I am a New Alumni
                      </h4>
                      <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                      Register your graduation record to activate your verified alumni network account first.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-semibold text-center">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Verified ASTU Alumni Advancement &amp; Giving Portal &bull; Secure 256-bit Encryption</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Direct Telebirr / CBE Birr / Chapa Instant Giving Modal ── */}
      <TelebirrDonationModal
        isOpen={isDirectDonationModalOpen}
        onClose={() => setIsDirectDonationModalOpen(false)}
        campaign={directDonationTarget}
        initialMethod={directDonationMethod}
        onSuccess={() => {
          setIsDirectDonationModalOpen(false);
          fetchCampaigns();
        }}
      />

      {/* ── Social & Direct Campaign Share Modal ── */}
      <ShareCampaignModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        campaign={shareModalCampaign ? {
          id: shareModalCampaign.id,
          title: shareModalCampaign.title,
          category: shareModalCampaign.category,
          description: shareModalCampaign.description,
          goal: shareModalCampaign.goal,
          raised: shareModalCampaign.raised,
          donorCount: shareModalCampaign.donorCount,
          image: getCampaignImage(shareModalCampaign),
        } : null}
      />

      {/* Staff Banner Edit Modal */}
      {showEditBannerModal &&
        createPortal(
          <div
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200 text-slate-800"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditBannerModal(false);
              }
            }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-astu-navy text-white flex items-center justify-center shadow-md">
                    <Edit3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400 block">
                      CMS Office Control
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Giving Portal Banner</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditBannerModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">Banner Title</label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-astu-navy"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">Banner Subtitle</label>
                  <textarea
                    value={bannerSubtitle}
                    onChange={(e) => setBannerSubtitle(e.target.value)}
                    rows={3}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-astu-navy"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">Primary Button</label>
                    <input
                      type="text"
                      value={bannerButtonText}
                      onChange={(e) => setBannerButtonText(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-astu-navy"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">Secondary Button</label>
                    <input
                      type="text"
                      value={bannerSecondaryButtonText}
                      onChange={(e) => setBannerSecondaryButtonText(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-astu-navy"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditBannerModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingBanner}
                    className="px-5 py-2 rounded-xl bg-astu-navy text-white text-xs font-bold hover:brightness-110 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingBanner ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <Footer />
      <ChatBot />
    </div>
  );
}
