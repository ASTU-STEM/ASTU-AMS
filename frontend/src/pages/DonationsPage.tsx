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
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import TelebirrDonationModal from '../components/TelebirrDonationModal';
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
  },
];

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Donation Modal state
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDonationAuthModalOpen, setIsDonationAuthModalOpen] = useState(false);

  const handleDonateClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    let user: any = null;
    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch {}

    if (token && (user?.role === 'ALUMNI' || !user?.role)) {
      navigate('/alumni/dashboard?tab=donations');
    } else {
      setIsDonationAuthModalOpen(true);
    }
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
  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / pageSize));
  const currentPublicPage = Math.min(currentPage, totalPages);
  const paginatedPublicCampaigns = useMemo(() => {
    return filteredCampaigns.slice((currentPublicPage - 1) * pageSize, currentPublicPage * pageSize);
  }, [filteredCampaigns, currentPublicPage, pageSize]);

  const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
    Scholarship: { bg: 'bg-blue-50', text: 'text-[#003366]', border: 'border-blue-200' },
    Research: { bg: 'bg-emerald-50', text: 'text-[#008C44]', border: 'border-emerald-200' },
    Infrastructure: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    Innovation: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Student Welfare': { bg: 'bg-rose-50', text: 'text-[#E31E24]', border: 'border-rose-200' },
    'Emergency Fund': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#002244] via-[#003366] to-[#001a33] text-white pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#008C44]/20 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-[#E31E24]/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Heart className="h-[500px] w-[500px] text-white" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
          <div className="max-w-3xl">
            {isStaff && (
              <div className="mb-5 inline-flex items-center gap-2">
                <button
                  onClick={() => setShowEditBannerModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
                  title="Edit Giving portal banner content directly from this page"
                >
                  <Edit3 className="h-3.5 w-3.5 text-[#FFCC00]" />
                  <span>Edit Banner (CMS)</span>
                </button>
                <button
                  onClick={() => navigate('/cms/donations')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-400/40 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
                  title="Go to CMS Donations & Giving Management Desk"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Donations Management Desk</span>
                </button>
              </div>
            )}

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              {bannerTitle}
            </h1>

            <p className="mt-4 text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl">
              {bannerSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('campaigns-directory');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs md:text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer flex items-center gap-2"
              >
                <Heart className="h-4 w-4 fill-white" /> {bannerButtonText}
              </button>

              <button
                onClick={() => navigate('/login?redirect=/alumni/dashboard?tab=donations')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs md:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                {bannerSecondaryButtonText || 'Alumni Donor Dashboard'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Key Metrics Banner */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block">Total Raised</span>
              <p className="text-2xl md:text-3xl font-black text-[#FFCC00] mt-1">{totalRaised.toLocaleString()} ETB</p>
              <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Verified Chapa Payments</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block">Target Objective</span>
              <p className="text-2xl md:text-3xl font-black text-white mt-1">{totalGoal.toLocaleString()} ETB</p>
              <p className="text-[10px] text-slate-300 font-medium mt-0.5">Campus Development Fund</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block">Total Supporters</span>
              <p className="text-2xl md:text-3xl font-black text-white mt-1">{totalDonors}</p>
              <p className="text-[10px] text-teal-300 font-bold mt-0.5">Alumni &amp; Global Partners</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block">Active Causes</span>
              <p className="text-2xl md:text-3xl font-black text-white mt-1">{campaigns.length}</p>
              <p className="text-[10px] text-emerald-400 font-bold mt-0.5">100% Tax Deductible</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Directory Section ── */}
      <section id="campaigns-directory" className="py-12 md:py-16 flex-1">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          {/* Controls: Search, Filter, Sort */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search causes by title, keyword, or faculty..."
                  className="w-full text-xs md:text-sm pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#003366] transition-colors font-medium text-slate-800"
                />
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-[#003366]"
                >
                  <option value="featured">Featured Causes</option>
                  <option value="progress">Most Funded %</option>
                  <option value="raised">Highest Amount Raised</option>
                  <option value="goal">Highest Target Goal</option>
                  <option value="donors">Most Donors</option>
                </select>

                <button
                  onClick={fetchCampaigns}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Refresh Campaigns"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mr-1">Categories:</span>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#003366] text-white shadow-md scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Initiatives' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredCampaigns.length > 0 ? (currentPublicPage - 1) * pageSize + 1 : 0}</strong>–
              <strong className="text-slate-900">{Math.min(filteredCampaigns.length, currentPublicPage * pageSize)}</strong> of{' '}
              <strong className="text-slate-900">{filteredCampaigns.length}</strong> campaigns
            </span>
            <span>Adama Science and Technology University Alumni Foundation</span>
          </div>

          {/* Campaign Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPublicCampaigns.map((c, idx) => {
              const goal = c.goal || 1000000;
              const raised = c.raised || 0;
              const percent = Math.min(100, Math.round((raised / (goal || 1)) * 100));
              const donors = c.donorCount || 0;
              const category = c.category || 'Initiative';
              const catStyle = categoryStyles[category] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

              return (
                <article
                  key={c.id || idx}
                  className="group flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 p-6 md:p-7 shadow-[0_4px_24px_rgba(0,51,102,0.06)] hover:shadow-[0_16px_40px_rgba(0,51,102,0.12)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Official ASTU Tri-color Brand Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#003366] via-[#008C44] to-[#FFCC00]" />

                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                        {category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-500">
                        <Users className="h-3 w-3 text-slate-400" /> {donors} {donors === 1 ? 'Donor' : 'Donors'}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-[#003366] transition-colors line-clamp-2 leading-snug">
                      {c.title}
                    </h3>
                    <p className="mt-2.5 text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {c.description || 'Support ASTU causes and make a lasting impact for future generations of engineers and researchers.'}
                    </p>
                  </div>

                  {/* Progress Bar & Amount */}
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Raised</span>
                        <span className="text-base font-black text-[#003366]">
                          {raised.toLocaleString()} <span className="text-[10px] text-slate-400 font-extrabold">ETB</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Goal</span>
                        <span className="text-xs font-bold text-slate-600">
                          {goal.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>

                    {/* Progress bar container */}
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#003366] via-blue-700 to-[#008C44] transition-all duration-1000 shadow-xs"
                        style={{ width: `${Math.max(5, percent)}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span>{percent}% Funded</span>
                      <span className="text-emerald-600 font-extrabold">Active Cause</span>
                    </div>

                    {/* Accepted methods badge */}
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500">Fast Pay</span>
                      <span className="text-[10px] font-extrabold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Telebirr • Chapa • CBE Birr
                      </span>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleDonateClick(c)}
                      className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#002759] hover:from-[#002244] hover:to-[#001a33] text-white font-black text-xs md:text-sm py-3 px-4 shadow-md hover:shadow-lg hover:shadow-[#003366]/20 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                    >
                      <Heart className="h-4 w-4 fill-[#FFCC00] text-[#FFCC00]" />
                      Support This Cause
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Controls for Public Directory */}
          {filteredCampaigns.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Showing</span>
                <span className="text-slate-900 font-extrabold">
                  {(currentPublicPage - 1) * pageSize + 1}
                </span>
                <span>to</span>
                <span className="text-slate-900 font-extrabold">
                  {Math.min(filteredCampaigns.length, currentPublicPage * pageSize)}
                </span>
                <span>of</span>
                <span className="text-slate-900 font-extrabold">{filteredCampaigns.length} campaigns</span>

                <div className="flex items-center gap-1.5 ml-4">
                  <span className="text-slate-400 font-medium">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none"
                  >
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      document.getElementById('campaigns-directory')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={currentPublicPage === 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setCurrentPage(p);
                        document.getElementById('campaigns-directory')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                        p === currentPublicPage
                          ? 'bg-[#003366] text-white shadow-md scale-105'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      document.getElementById('campaigns-directory')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={currentPublicPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {filteredCampaigns.length === 0 && (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
              <Heart className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="text-base font-extrabold text-slate-900">No campaigns found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No fundraising campaigns matched your search or category filter. Try clearing filters to see all causes.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Impact & Transparency Section ── */}
      <section className="bg-white border-t border-slate-200/80 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-black uppercase text-[#003366] tracking-widest block mb-2">
              {commitmentEyebrow || 'Our Commitment'}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {commitmentTitle || 'Why Give Through the ASTU Alumni Foundation?'}
            </h2>
            <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed">
              {commitmentSubtitle || 'Transparent, measurable, and university-directed philanthropy designed to accelerate national technology excellence.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#003366] flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {commitmentCard1Title || '100% Directed Impact'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {commitmentCard1Desc || 'Zero administrative deduction. Every single Birr is mapped directly to the designated laboratory, student tuition grant, or research equipment fund.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#008C44] flex items-center justify-center font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {commitmentCard2Title || 'Merit & Equity Scholarships'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {commitmentCard2Desc || 'Over 340+ undergraduate engineering students in need receive full textbook, meal, and laptop stipends enabled by alumni contributions.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {commitmentCard3Title || 'Verifiable Audit Reports'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {commitmentCard3Desc || 'All donations receive immediate Chapa digital receipts and are integrated into the annual alumni office financial audit released to all stakeholders.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Donation Routing / Authentication Modal */}
      {isDonationAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 transition-all">
            {/* Top decorative gradient bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#003366] via-[#008C44] to-[#FFCC00]" />

            {/* Close Button */}
            <button
              onClick={() => setIsDonationAuthModalOpen(false)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 md:p-8">
              {/* Header Badge & Title */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#003366]/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#003366] mb-3">
                <Heart className="h-3.5 w-3.5 fill-[#E31E24] text-[#E31E24]" />
                ASTU Alumni Giving
              </div>

              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Support ASTU's Future
              </h3>

              {selectedCampaign && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#008C44]">
                      Selected Campaign
                    </span>
                    <p className="text-xs md:text-sm font-bold text-slate-800 truncate">
                      {selectedCampaign.title}
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg bg-[#003366]/10 text-[#003366] text-[10px] font-black uppercase">
                    {selectedCampaign.category || 'Initiative'}
                  </span>
                </div>
              )}

              <p className="mt-3 text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                Contributions are managed through the verified ASTU Alumni Portal. Please choose how you'd like to proceed:
              </p>

              {/* Options Cards */}
              <div className="mt-6 space-y-3.5">
                {/* Option 1: Registered Alumni -> Login */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    navigate('/login?redirect=/alumni/dashboard?tab=donations');
                  }}
                  className="group relative flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-200 hover:border-[#003366] bg-white hover:bg-slate-50/80 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-[#003366]/10 text-[#003366] group-hover:bg-[#003366] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-[#003366] transition-colors">
                        I am a Registered Alumni
                      </h4>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#003366] group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      Sign in with your student ID or email to access your Giving dashboard directly.
                    </p>
                  </div>
                </div>

                {/* Option 2: New Alumni -> Register */}
                <div
                  onClick={() => {
                    setIsDonationAuthModalOpen(false);
                    navigate('/register');
                  }}
                  className="group relative flex items-start gap-4 p-4 rounded-2xl border-2 border-emerald-200/90 hover:border-emerald-600 bg-emerald-50/30 hover:bg-emerald-50/70 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                        I am a New Alumni
                      </h4>
                      <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                      Register your student graduation records to activate your alumni network account first.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified ASTU Alumni Advancement &amp; Giving Portal
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      <TelebirrDonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onSuccess={() => {
          fetchCampaigns();
        }}
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
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#003366] text-white flex items-center justify-center shadow-md">
                    <Edit3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                      CMS Office Control
                    </span>
                    <h3 className="text-lg font-black text-slate-900">Edit Giving Portal Banner</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditBannerModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Hero Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g. Invest in the Next Generation of ASTU Engineers & Leaders"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003366] focus:outline-none transition-all font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Mission Description
                  </label>
                  <textarea
                    value={bannerSubtitle}
                    onChange={(e) => setBannerSubtitle(e.target.value)}
                    placeholder="Explain ASTU giving purpose..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003366] focus:outline-none h-28 resize-none leading-relaxed text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={bannerButtonText}
                    onChange={(e) => setBannerButtonText(e.target.value)}
                    placeholder="e.g. Explore All Causes"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#003366] focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditBannerModal(false)}
                    disabled={isSavingBanner}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingBanner}
                    className="flex-1 py-3 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingBanner ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Save &amp; Update Live</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <ChatBot />
    </div>
  );
}
