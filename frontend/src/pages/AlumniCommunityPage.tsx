import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Globe,
  Users,
  Search,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Award,
  ArrowRight,
  Share2,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Mail,
  UserPlus,
  BookOpen,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ShareModal, { ShareItem } from '../components/ShareModal';
import communityMembersService, { CommunityMember } from '../features/admin/services/communityMembers.service';
import PaginationBar from '../components/PaginationBar';
import homepageCmsService from '../features/admin/services/homepageCms.service';
import { usePublicMetrics } from '../services/publicMetrics.service';

const CATEGORIES = [
  { id: 'all', label: 'All Community Leaders', icon: Globe },
  { id: 'executive', label: 'Global Industry & Aerospace', icon: Building2 },
  { id: 'policy', label: 'Public Policy & Finance', icon: Briefcase },
  { id: 'academia', label: 'Academia & Research', icon: GraduationCap },
  { id: 'engineering', label: 'Infrastructure & Contractors', icon: Award },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  BookOpen,
  Sparkles,
};

export default function AlumniCommunityPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalMember, setActiveModalMember] = useState<CommunityMember | null>(null);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [communityPage, setCommunityPage] = useState(0);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { metrics } = usePublicMetrics();
  const dynamicHeroStats = useMemo(() => [
    { label: 'Registered Alumni', value: metrics.registeredAlumniFormatted, sub: 'Globally Verified' },
    { label: 'Fields of Study', value: metrics.fieldsOfStudyFormatted, sub: 'Engineering & Tech' },
    { label: 'Corporate Partners', value: `${metrics.corporatePartnersFormatted} Enterprises`, sub: 'Talent Collaborators' },
    { label: 'Historic Batches', value: metrics.historicBatchesFormatted, sub: 'Since 1993 Establishment' },
  ], [metrics]);

  // CMS-controlled data with live fallback
  const [communityPageHero, setCommunityPageHero] = useState({
    title: 'Your Networks Around the World',
    subtitle: 'With establishment spanning nearly three decades, Adama Science and Technology University boasts alumni excelling in global aviation, high-tech ventures, sovereign public policy, academic research chairs, and civil infrastructure worldwide.',
    stats: [
      { label: 'Registered Alumni', value: '—', sub: 'Globally Verified' },
      { label: 'Fields of Study', value: '—', sub: 'Engineering & Tech' },
      { label: 'Corporate Partners', value: '—', sub: 'Talent Collaborators' },
      { label: 'Historic Batches', value: '—', sub: 'Since 1993 Establishment' },
    ],
  });
  const [regionalChapters, setRegionalChapters] = useState<any[]>([]);
  const [eventBanner, setEventBanner] = useState({
    badge: 'Flagship Homecoming Event',
    title: 'ASTU Alumni Carnival 2026',
    description: 'Celebrating nearly three decades of ASTU heritage! Taking place on April 25 and 26, 2026 at the ASTU Main Campus in Adama. A homecoming uniting graduates, university leadership, academic researchers, and enterprise partners.',
    features: [
      'Enterprise Career Expo',
      'Research & Startup Showcase',
      'Alumni Networking Sessions',
    ],
    primaryButtonText: 'Register for Homecoming',
    primaryButtonLink: '/register',
    secondaryButtonText: 'View Carnival Schedule',
    secondaryButtonLink: '/events',
  });
  const [communityPillars, setCommunityPillars] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    communityMembersService.fetchMembersFromApi().then((members) => {
      if (!mounted) return;
      setCommunityMembers(members.filter((m) => m.active !== false));
      setMembersLoading(false);
    }).catch(() => {
      if (mounted) setMembersLoading(false);
    });

    const handleSync = () => {
      setCommunityMembers(communityMembersService.getMembers().filter(m => m.active !== false));
    };
    const handleCmsSync = () => {
      const config = homepageCmsService.getSettings();
      if (config?.communityPageHero) {
        setCommunityPageHero(config.communityPageHero);
      }
      if (Array.isArray(config?.regionalChapters) && config.regionalChapters.length) {
        setRegionalChapters(config.regionalChapters);
      }
      if (config?.eventBanner) {
        setEventBanner(config.eventBanner);
      }
      if (Array.isArray(config?.communityPillars) && config.communityPillars.length) {
        setCommunityPillars(config.communityPillars);
      }
    };
    window.addEventListener('astu-cms-community-members-changed', handleSync);
    window.addEventListener('astu-cms-homepage-changed', handleCmsSync);
    window.addEventListener('astu-cms-homepage-updated', handleCmsSync);
    return () => {
      mounted = false;
      window.removeEventListener('astu-cms-community-members-changed', handleSync);
      window.removeEventListener('astu-cms-homepage-changed', handleCmsSync);
      window.removeEventListener('astu-cms-homepage-updated', handleCmsSync);
    };
  }, []);

  // Load CMS data
  useEffect(() => {
    homepageCmsService.fetchFromApi().then((config) => {
      if (!config) return;
      if (config.communityPageHero) setCommunityPageHero(config.communityPageHero);
      if (Array.isArray(config.regionalChapters) && config.regionalChapters.length) {
        setRegionalChapters(config.regionalChapters);
      }
      if (config.eventBanner) setEventBanner(config.eventBanner);
      if (Array.isArray(config.communityPillars) && config.communityPillars.length) {
        setCommunityPillars(config.communityPillars);
      }
    });

    const config = homepageCmsService.getSettings();
    if (config?.communityPageHero) {
      setCommunityPageHero(config.communityPageHero);
    }
    if (Array.isArray(config?.regionalChapters) && config.regionalChapters.length) {
      setRegionalChapters(config.regionalChapters);
    }
    if (config?.eventBanner) {
      setEventBanner(config.eventBanner);
    }
    if (Array.isArray(config?.communityPillars) && config.communityPillars.length) {
      setCommunityPillars(config.communityPillars);
    }
  }, []);

  const filteredMembers = useMemo(() => {
    return communityMembers.filter((m) => {
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.org.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.degree.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [communityMembers, selectedCategory, searchQuery]);

  const COMMUNITY_PAGE_SIZE = 6;
  const communityTotalPages = filteredMembers.length ? Math.ceil(filteredMembers.length / COMMUNITY_PAGE_SIZE) : 1;
  const safeCommunityPage = Math.min(communityPage, Math.max(0, communityTotalPages - 1));
  const pagedMembers = filteredMembers.slice(safeCommunityPage * COMMUNITY_PAGE_SIZE, safeCommunityPage * COMMUNITY_PAGE_SIZE + COMMUNITY_PAGE_SIZE);

  useEffect(() => {
    setCommunityPage(0);
  }, [selectedCategory, searchQuery, communityMembers.length]);

  useEffect(() => {
    setCommunityPage((prev) => Math.min(prev, Math.max(0, communityTotalPages - 1)));
  }, [communityTotalPages]);

  useEffect(() => {
    const memberId = searchParams.get('member');
    if (!memberId || communityMembers.length === 0) return;
    const decoded = decodeURIComponent(memberId).toLowerCase();
    const found = communityMembers.find(
      (m) => m.id?.toLowerCase() === decoded || m.name.toLowerCase() === decoded
    );
    if (found) setActiveModalMember(found);
  }, [searchParams, communityMembers]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['all', 'executive', 'policy', 'academia', 'engineering'].includes(tab)) {
      setSelectedCategory(tab);
    }
  }, [searchParams]);

  const handleOpenShare = (member: CommunityMember) => {
    setShareItem({
      id: member.id,
      title: `${member.name} — ASTU Alumni Leader`,
      subtitle: `${member.role} at ${member.org}`,
      text: `${member.name} (${member.gradYear ? `Class of ${member.gradYear}` : 'ASTU Graduate'}) is recognized in the ASTU Alumni Community network as ${member.role} at ${member.org}.`,
      url: `/community?member=${encodeURIComponent(member.id)}`,
      image: member.image,
      badge: 'Alumni Community',
      type: 'page',
    });
    setIsShareOpen(true);
  };

  const handleCopyShare = handleOpenShare;

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      {/* ── Modern Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-primary-container to-astu-navy text-white py-16 md:py-24">
        {/* Soft brand glows — navy + green only */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-astu-green/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-astu-blue-light/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-6">
            <button
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-astu-green">Alumni Community</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-white/85">
                ASTU-AMS
              </p>
              <span className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-astu-green backdrop-blur-md">
                <img src="/images/astu-seal-logo.png" alt="ASTU Seal" className="h-4 w-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <span>Global Alumni Network</span>
              </span>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
                {communityPageHero.title}
              </h1>
              <p className="mt-4 text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl">
                {communityPageHero.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 rounded-xl bg-astu-green px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:brightness-110 transition-all hover:scale-105 cursor-pointer btn-magnetic"
              >
                <UserPlus className="h-4 w-4" /> Join ASTU Network
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('community-directory');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md hover:bg-white/10 transition-all cursor-pointer"
              >
                <Users className="h-4 w-4" /> Explore Directory
              </button>
              <button
                type="button"
                onClick={() => {
                  setShareItem({
                    title: 'ASTU Global Alumni Network & Community',
                    subtitle: 'Directory of ASTU leaders across aviation, technology, academia and civil industry',
                    text: 'Connect with verified graduates and chapter leaders across the global Adama Science and Technology University alumni community.',
                    url: '/community',
                    badge: 'Alumni Community',
                    type: 'page',
                  });
                  setIsShareOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-md hover:bg-white/10 transition-all cursor-pointer"
                title="Share Community Directory"
              >
                <Share2 className="h-4 w-4 text-emerald-400" /> Share Directory
              </button>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {dynamicHeroStats.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 md:p-5 text-center transition-all hover:bg-white/10"
              >
                <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                <p className="text-xs font-bold text-astu-green uppercase tracking-wider mt-1">{stat.label}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search & Filter Controls ── */}
      <section id="community-directory" className="relative -mt-6 z-20 mx-auto max-w-[1440px] px-4 md:px-8 w-full">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alumni by name, role, organization (e.g. Boeing, Ethiopian Airlines), or major..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none focus:border-astu-navy focus:bg-white focus:ring-2 focus:ring-astu-navy/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-200 rounded-full h-5 w-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
              <Filter className="h-4 w-4" />
              <span>Showing {filteredMembers.length === 0 ? 0 : safeCommunityPage * COMMUNITY_PAGE_SIZE + 1}–
              {Math.min((safeCommunityPage + 1) * COMMUNITY_PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length} Leaders</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-astu-navy text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Community Leaders Grid ── */}
      <section className="mx-auto max-w-[1440px] px-4 md:px-8 py-12 md:py-16">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-astu-red">Distinguished Alumni Roster</p>
          <h2 className="mt-1 text-2xl md:text-4xl font-black text-astu-navy">
            Alumni Leaders Shaping Global Progress
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs md:text-sm text-slate-500">
            Real graduates of Adama Science and Technology University featured on the official alumni community network.
          </p>
        </div>

        {membersLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center max-w-md mx-auto text-sm text-slate-500">
            Loading community leaders…
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center max-w-md mx-auto">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {communityMembers.length === 0 ? 'No community leaders published yet' : 'No members matched your search'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {communityMembers.length === 0
                ? 'Leaders will appear here once published through the CMS community directory.'
                : 'Try changing your search term or switching to another category.'}
            </p>
            {communityMembers.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 rounded-lg bg-astu-navy px-4 py-2 text-xs font-bold text-white hover:brightness-110"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagedMembers.map((member) => (
              <article
                key={member.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-astu-navy/30"
              >
                <div>
                  {/* Top Bar with Badge & Share */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {member.badge ? (
                      <span className="rounded-md bg-astu-navy/5 px-2.5 py-0.5 text-[10px] font-bold text-astu-navy uppercase tracking-wider">
                        {member.badge}
                      </span>
                    ) : (
                      <span className="rounded-md bg-astu-green/10 px-2.5 py-0.5 text-[10px] font-bold text-astu-green">
                        Class of {member.gradYear}
                      </span>
                    )}
                    <button
                      onClick={() => handleCopyShare(member)}
                      title="Share profile"
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Profile Photo & Name */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative shrink-0">
                      <img
                        src={member.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={member.name}
                        className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-100 shadow-md group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-astu-green text-white ring-2 ring-white" title="Verified Alumni">
                        <CheckCircle2 className="h-3 w-3" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-astu-navy transition-colors line-clamp-1">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-astu-red line-clamp-1 mt-0.5">
                        {member.role}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                        <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{member.org}</span>
                      </div>
                    </div>
                  </div>

                  {/* Degree and Major Tag */}
                  <div className="rounded-xl bg-slate-50 p-2.5 mb-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                      <GraduationCap className="h-3.5 w-3.5 text-astu-navy shrink-0" />
                      <span className="truncate">{member.degree}</span>
                    </div>
                    {member.location && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{member.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Quote / Bio Snippet */}
                  {member.quote ? (
                    <p className="text-xs leading-relaxed text-slate-600 italic line-clamp-3 mb-4">
                      "{member.quote}"
                    </p>
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-500 line-clamp-3 mb-4">
                      {member.bio}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveModalMember(member)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-astu-navy hover:text-astu-red transition-colors cursor-pointer group/btn"
                  >
                    View Biography <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <span className="text-[10px] font-semibold text-slate-400">Class of {member.gradYear}</span>
                </div>
              </article>
            ))}
          </div>

          <PaginationBar
            currentPage={safeCommunityPage}
            totalPages={communityTotalPages}
            total={filteredMembers.length}
            pageSize={COMMUNITY_PAGE_SIZE}
            onPageChange={setCommunityPage}
            noun="leaders"
          />
          </>
        )}
      </section>

      {/* ── Regional Chapters & Global Reach ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-primary-container to-astu-navy text-white py-16 md:py-24">
        {/* Background Decorative Mesh & Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-astu-green/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-astu-blue-light/10 blur-3xl" />
          <Globe className="h-[620px] w-[620px] absolute -right-28 -bottom-28 text-white/5 pointer-events-none" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-astu-green backdrop-blur-md">
              <MapPin className="h-3.5 w-3.5 text-astu-green" /> Regional Presence
            </span>
            <h2 className="mt-4 text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
              ASTU Alumni Chapters Worldwide
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs md:text-sm text-slate-200 leading-relaxed">
              Connect with fellow alumni in your region for networking meetups, local chapter initiatives, and professional mentorship.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regionalChapters.map((chap) => (
              <div
                key={chap.name}
                className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:bg-white/15 hover:border-white/25 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-lg bg-astu-green/20 border border-astu-green/30 px-2.5 py-1 text-[11px] font-bold text-astu-green">
                      {chap.members}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300">
                      <MapPin className="h-4 w-4 text-astu-green" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">{chap.name}</h3>
                  <p className="text-xs text-slate-300 mt-1">Regional Hub: <span className="text-white font-semibold">{chap.hub}</span></p>
                  <p className="text-xs text-slate-200 mt-3.5 leading-relaxed border-t border-white/10 pt-3.5">
                    {chap.focus}
                  </p>
                </div>
                <a
                  href={`mailto:${chap.contact}`}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-astu-green hover:brightness-125 transition-colors cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" /> Contact Chapter Lead
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alumni Homecoming & Carnival 2026 Highlight ── */}
      <section className="mx-auto max-w-[1440px] px-4 md:px-8 py-14">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-astu-navy via-primary-container to-astu-navy p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-astu-green">
                <Calendar className="h-3.5 w-3.5" /> {eventBanner.badge}
              </span>
              <h2 className="mt-4 text-2xl md:text-4xl font-black">
                {eventBanner.title}
              </h2>
              <p className="mt-3 text-sm text-slate-200 leading-relaxed">
                {eventBanner.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-300">
                {eventBanner.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-astu-green" /> {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => navigate(eventBanner.primaryButtonLink)}
                className="rounded-xl bg-astu-green px-8 py-4 text-sm font-bold text-white shadow-lg hover:brightness-110 transition-all hover:scale-105 cursor-pointer text-center"
              >
                {eventBanner.primaryButtonText}
              </button>
              <button
                onClick={() => navigate(eventBanner.secondaryButtonLink)}
                className="rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all cursor-pointer text-center"
              >
                {eventBanner.secondaryButtonText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community Pillars (Mentorship, Giving, Curriculum) ── */}
      <section className="bg-slate-100 py-14">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-astu-navy">Ways to Engage With Your Alma Mater</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">Strengthening the bond between ASTU graduates, current students, and the faculty.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {communityPillars.map((pillar) => {
              const Icon = typeof pillar.icon === 'string' ? (iconMap[pillar.icon] || Users) : pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-astu-navy/5 text-astu-navy flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{pillar.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{pillar.desc}</p>
                  </div>
                  <button
                    onClick={() => navigate(pillar.link)}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-astu-navy hover:text-astu-red transition-colors cursor-pointer text-left"
                  >
                    {pillar.action} <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Individual Biography Modal ── */}
      {activeModalMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveModalMember(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={activeModalMember.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={activeModalMember.name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-200 shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeModalMember.name}</h3>
                  <p className="text-xs font-semibold text-astu-red">{activeModalMember.role}</p>
                  <p className="text-xs text-slate-500">{activeModalMember.org}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalMember(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Degree & Specialization:</span>
                  <span className="font-semibold text-slate-800 text-right">{activeModalMember.degree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Graduation Milestone:</span>
                  <span className="font-semibold text-slate-800">{activeModalMember.gradYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location / Base:</span>
                  <span className="font-semibold text-slate-800">{activeModalMember.location}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Career & Impact Overview</h4>
                <p className="text-slate-600 leading-relaxed">{activeModalMember.bio}</p>
              </div>

              {activeModalMember.quote && (
                <div className="border-l-4 border-astu-green bg-astu-green/5 p-3 rounded-r-xl italic text-slate-700">
                  "{activeModalMember.quote}"
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopyShare(activeModalMember)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" /> Share Profile
              </button>
              <button
                onClick={() => {
                  setActiveModalMember(null);
                  navigate('/register');
                }}
                className="rounded-lg bg-astu-navy px-5 py-2 text-xs font-bold text-white hover:brightness-110 cursor-pointer"
              >
                Connect on AMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Universal Share Modal ── */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        item={shareItem}
      />

      <Footer />
    </div>
  );
}
