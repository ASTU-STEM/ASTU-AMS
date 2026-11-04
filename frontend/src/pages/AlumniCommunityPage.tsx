import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Filter,
  GalleryHorizontal,
  Globe,
  GraduationCap,
  LayoutGrid,
  Mail,
  MapPin,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ShareModal, { ShareItem } from '../components/ShareModal';
import communityMembersService, {
  CommunityMember,
} from '../features/admin/services/communityMembers.service';
import PaginationBar from '../components/PaginationBar';
import HorizontalSlider from '../components/HorizontalSlider';
import homepageCmsService from '../features/admin/services/homepageCms.service';
import { usePublicMetrics } from '../services/publicMetrics.service';
import config from '../config';

const { mediaUrl } = config;
const COMMUNITY_PAGE_SIZE = 9;
const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const CATEGORIES = [
  { id: 'all', label: 'All Leaders', icon: Globe },
  { id: 'executive', label: 'Industry & Aerospace', icon: Building2 },
  { id: 'policy', label: 'Policy & Finance', icon: Briefcase },
  { id: 'academia', label: 'Academia & Research', icon: GraduationCap },
  { id: 'engineering', label: 'Infrastructure', icon: Award },
] as const;

type RegionalChapter = {
  name: string;
  hub: string;
  members: string;
  focus: string;
  contact: string;
};

type CommunityPillar = {
  icon: string;
  title: string;
  desc: string;
  action: string;
  link: string;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  BookOpen,
  Sparkles,
};

function MemberAvatar({
  member,
  className = 'h-16 w-16 rounded-2xl',
}: {
  member: CommunityMember;
  className?: string;
}) {
  const src = mediaUrl(member.image) || member.image || FALLBACK_AVATAR;
  return (
    <img
      src={src}
      alt={member.name}
      className={`${className} object-cover border-2 border-slate-100 shadow-md`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
      }}
    />
  );
}

function MemberCard({
  member,
  onView,
  onShare,
  compact = false,
}: {
  member: CommunityMember;
  onView: () => void;
  onShare: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-astu-navy/30 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 ${
        compact ? 'w-[min(280px,85vw)] shrink-0 snap-start sm:w-[300px]' : ''
      }`}
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          {member.badge ? (
            <span className="max-w-[70%] truncate rounded-md bg-astu-navy/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-astu-navy dark:bg-astu-green/10 dark:text-astu-green">
              {member.badge}
            </span>
          ) : (
            <span className="rounded-md bg-astu-green/10 px-2.5 py-0.5 text-[10px] font-bold text-astu-green">
              Class of {member.gradYear}
            </span>
          )}
          <button
            type="button"
            onClick={onShare}
            title="Share profile via Telegram, LinkedIn, WhatsApp, or copy link"
            aria-label={`Share ${member.name}`}
            className="rounded-lg border border-transparent p-1.5 text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astu-navy dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mb-3 flex items-start gap-3.5">
          <div className="relative shrink-0">
            <MemberAvatar
              member={member}
              className="h-16 w-16 rounded-2xl transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-astu-green text-white ring-2 ring-white"
              title="ASTU Alumni"
            >
              <CheckCircle2 className="h-3 w-3" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-sm font-bold text-slate-900 transition group-hover:text-astu-navy dark:text-white">
              {member.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-astu-red">{member.role}</p>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
              <span className="truncate">{member.org}</span>
            </div>
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-astu-navy dark:text-astu-green" />
            <span className="truncate">{member.degree}</span>
          </div>
          {member.location && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{member.location}</span>
            </div>
          )}
        </div>

        {member.quote ? (
          <p className="mb-4 line-clamp-3 text-xs italic leading-relaxed text-slate-600 dark:text-slate-400">
            &ldquo;{member.quote}&rdquo;
          </p>
        ) : (
          <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {member.bio}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1 text-xs font-bold text-astu-navy transition hover:text-astu-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astu-navy dark:text-astu-green"
        >
          View Biography <ArrowRight className="h-3 w-3" />
        </button>
        <span className="text-[10px] font-semibold text-slate-400">Class of {member.gradYear}</span>
      </div>
    </article>
  );
}

export default function AlumniCommunityPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalMember, setActiveModalMember] = useState<CommunityMember | null>(null);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(false);
  const [communityPage, setCommunityPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'slide'>('grid');
  const [shareOpen, setShareOpen] = useState(false);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);

  const { metrics } = usePublicMetrics();
  const dynamicHeroStats = useMemo(
    () => [
      {
        label: 'Registered Alumni',
        value: metrics.registeredAlumniFormatted,
        sub: 'Registered network',
      },
      {
        label: 'Fields of Study',
        value: metrics.fieldsOfStudyFormatted,
        sub: 'Engineering & Tech',
      },
      {
        label: 'Corporate Partners',
        value: metrics.corporatePartnersFormatted,
        sub: 'Talent Collaborators',
      },
      {
        label: 'Historic Batches',
        value: metrics.historicBatchesFormatted,
        sub: 'Since 1993',
      },
    ],
    [metrics]
  );

  const [communityPageHero, setCommunityPageHero] = useState({
    title: 'Your Networks Around the World',
    subtitle:
      'With establishment spanning nearly three decades, Adama Science and Technology University boasts alumni excelling in global aviation, high-tech ventures, sovereign public policy, academic research chairs, and civil infrastructure worldwide.',
  });
  const [regionalChapters, setRegionalChapters] = useState<RegionalChapter[]>([]);
  const [eventBanner, setEventBanner] = useState({
    badge: 'Flagship Homecoming Event',
    title: 'ASTU Alumni Carnival 2026',
    description:
      'Celebrating nearly three decades of ASTU heritage! Taking place on April 25 and 26, 2026 at the ASTU Main Campus in Adama. A homecoming uniting graduates, university leadership, academic researchers, and enterprise partners.',
    features: ['Enterprise Career Expo', 'Research & Startup Showcase', 'Alumni Networking Sessions'],
    primaryButtonText: 'Register for Homecoming',
    primaryButtonLink: '/register',
    secondaryButtonText: 'View Carnival Schedule',
    secondaryButtonLink: '/events',
  });
  const [communityPillars, setCommunityPillars] = useState<CommunityPillar[]>([]);

  const applyCmsConfig = (config: Awaited<ReturnType<typeof homepageCmsService.fetchFromApi>> | ReturnType<typeof homepageCmsService.getSettings>) => {
    if (!config) return;
    if (config.communityPageHero) {
      setCommunityPageHero({
        title: config.communityPageHero.title || communityPageHero.title,
        subtitle: config.communityPageHero.subtitle || communityPageHero.subtitle,
      });
    }
    if (Array.isArray(config.regionalChapters)) {
      setRegionalChapters(config.regionalChapters);
    }
    if (config.eventBanner) {
      setEventBanner((prev) => ({ ...prev, ...config.eventBanner }));
    }
    if (Array.isArray(config.communityPillars)) {
      setCommunityPillars(config.communityPillars);
    }
  };

  useEffect(() => {
    let mounted = true;

    communityMembersService
      .fetchMembersFromApi()
      .then((members) => {
        if (!mounted) return;
        setCommunityMembers(members.filter((m) => m.active !== false));
        setMembersError(false);
      })
      .catch(() => {
        if (!mounted) return;
        const local = communityMembersService.getMembers().filter((m) => m.active !== false);
        setCommunityMembers(local);
        setMembersError(local.length === 0);
      })
      .finally(() => {
        if (mounted) setMembersLoading(false);
      });

    const handleSync = () => {
      setCommunityMembers(communityMembersService.getMembers().filter((m) => m.active !== false));
    };
    const handleCmsSync = () => applyCmsConfig(homepageCmsService.getSettings());

    window.addEventListener('astu-cms-community-members-changed', handleSync);
    window.addEventListener('astu-cms-homepage-changed', handleCmsSync);
    window.addEventListener('astu-cms-homepage-updated', handleCmsSync);

    return () => {
      mounted = false;
      window.removeEventListener('astu-cms-community-members-changed', handleSync);
      window.removeEventListener('astu-cms-homepage-changed', handleCmsSync);
      window.removeEventListener('astu-cms-homepage-updated', handleCmsSync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyCmsConfig(homepageCmsService.getSettings());
    homepageCmsService.fetchFromApi().then((config) => {
      if (config) applyCmsConfig(config);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return communityMembers.filter((m) => {
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchesQuery =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.org.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.degree.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query) ||
        (m.badge || '').toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [communityMembers, selectedCategory, searchQuery]);

  const communityTotalPages = Math.max(1, Math.ceil(filteredMembers.length / COMMUNITY_PAGE_SIZE));
  const safeCommunityPage = Math.min(communityPage, communityTotalPages - 1);
  const pagedMembers = filteredMembers.slice(
    safeCommunityPage * COMMUNITY_PAGE_SIZE,
    safeCommunityPage * COMMUNITY_PAGE_SIZE + COMMUNITY_PAGE_SIZE
  );

  /** Badge / featured leaders for a compact horizontal strip */
  const spotlightMembers = useMemo(() => {
    const withBadge = communityMembers.filter((m) => m.badge);
    return (withBadge.length > 0 ? withBadge : communityMembers).slice(0, 12);
  }, [communityMembers]);

  useEffect(() => {
    setCommunityPage(0);
  }, [selectedCategory, searchQuery, communityMembers.length]);

  useEffect(() => {
    setCommunityPage((prev) => Math.min(prev, Math.max(0, communityTotalPages - 1)));
  }, [communityTotalPages]);

  useEffect(() => {
    const memberId = searchParams.get('member');
    if (!memberId || communityMembers.length === 0) return;
    const found = communityMembers.find((m) => m.id === memberId);
    if (found) setActiveModalMember(found);
  }, [searchParams, communityMembers]);

  const openMemberProfile = (member: CommunityMember) => {
    setActiveModalMember(member);
    const next = new URLSearchParams(searchParams);
    next.set('member', member.id);
    setSearchParams(next, { replace: true });
  };

  const closeMemberProfile = () => {
    setActiveModalMember(null);
    const next = new URLSearchParams(searchParams);
    next.delete('member');
    setSearchParams(next, { replace: true });
  };

  const handleCopyShare = (member: CommunityMember) => {
    setShareItem({
      id: member.id,
      title: member.name,
      subtitle: `${member.role} at ${member.org}`,
      text: member.bio || `${member.name} — ${member.role} at ${member.org} (ASTU Alumni Community)`,
      url: `/community?member=${encodeURIComponent(member.id)}`,
      badge: member.badge || `Class of ${member.gradYear}`,
      type: 'page',
    });
    setShareOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fb] text-slate-800 dark:bg-[var(--bg-page)] dark:text-slate-100">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-astu-navy-deep via-astu-navy to-primary-container py-14 text-white md:py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:2.5rem_2.5rem]" />
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-astu-green/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-astu-red/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <button type="button" onClick={() => navigate('/')} className="hover:text-white">
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-astu-green">Alumni Community</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-astu-green backdrop-blur-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Global Alumni Network
              </span>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-4xl lg:text-5xl">
                {communityPageHero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 md:text-[15px]">
                {communityPageHero.subtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 rounded-xl bg-astu-green px-5 py-3 text-sm font-bold text-white shadow-lg shadow-astu-green/25 transition hover:brightness-110"
                >
                  <UserPlus className="h-4 w-4" /> Join ASTU Network
                </button>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('community-directory')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <Users className="h-4 w-4" /> Explore Directory
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-[11px] font-bold uppercase tracking-wider text-astu-green">
                  Live community status
                </p>
                <div className="mt-4 space-y-3">
                  {dynamicHeroStats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-lg font-black text-white">{stat.value}</p>
                        <p className="text-[11px] text-slate-300">{stat.label}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-astu-green/15 px-2 py-0.5 text-[10px] font-bold text-astu-green">
                        {stat.sub}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-astu-green/20 px-2.5 py-1 text-[10px] font-bold text-astu-green">
                    <CheckCircle2 className="h-3 w-3" /> {communityMembers.length} leaders listed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search & filters ── */}
      <section
        id="community-directory"
        className="relative z-20 -mt-6 mx-auto w-full max-w-[1200px] px-4 md:px-8"
      >
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, organization, or major…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-10 text-sm outline-none transition focus:border-astu-navy focus:bg-white focus:ring-2 focus:ring-astu-navy/10 dark:border-slate-700 dark:bg-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:text-slate-700"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Filter className="h-4 w-4" />
                <span>
                  {filteredMembers.length === 0
                    ? '0 leaders'
                    : `Showing ${safeCommunityPage * COMMUNITY_PAGE_SIZE + 1}–${Math.min(
                        (safeCommunityPage + 1) * COMMUNITY_PAGE_SIZE,
                        filteredMembers.length
                      )} of ${filteredMembers.length}`}
                </span>
              </div>
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  aria-pressed={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
                    viewMode === 'grid' ? 'bg-astu-navy text-white' : 'text-slate-500'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === 'slide'}
                  onClick={() => setViewMode('slide')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
                    viewMode === 'slide' ? 'bg-astu-navy text-white' : 'text-slate-500'
                  }`}
                >
                  <GalleryHorizontal className="h-3.5 w-3.5" /> Slide
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <HorizontalSlider
              label="Community categories"
              showControls={CATEGORIES.length > 4}
              gapClassName="gap-2"
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex shrink-0 snap-start items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      isActive
                        ? 'bg-astu-navy text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </HorizontalSlider>
          </div>
        </div>
      </section>

      {/* ── Directory ── */}
      <section className="border-b border-slate-200/80 bg-[#eef3f9] py-12 dark:border-slate-800 dark:bg-slate-900/35">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="mb-8 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-astu-navy dark:text-astu-green">
              Distinguished alumni roster
            </span>
            <h2 className="mt-1 text-2xl font-black text-astu-navy-deep dark:text-white md:text-3xl">
              Alumni Leaders Shaping Global Progress
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Graduates featured on the official ASTU alumni community network.
            </p>
          </div>

          {/* Spotlight strip — compact featured collection */}
          {!membersLoading && spotlightMembers.length > 3 && viewMode === 'grid' && (
            <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white px-3 py-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mb-3 flex items-center justify-between px-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-astu-navy dark:text-astu-green">
                  Community spotlight
                </p>
                <span className="hidden text-[10px] font-semibold text-slate-400 sm:inline">
                  Scroll or use arrows
                </span>
              </div>
              <HorizontalSlider label="Community spotlight" showControls={spotlightMembers.length > 3}>
                {spotlightMembers.map((member) => (
                  <button
                    key={`spot-${member.id}`}
                    type="button"
                    onClick={() => openMemberProfile(member)}
                    className="snap-start flex w-44 shrink-0 flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-center transition hover:border-astu-navy/30 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <MemberAvatar member={member} className="h-14 w-14 rounded-full" />
                    <span className="w-full truncate text-xs font-bold text-astu-navy-deep dark:text-white">
                      {member.name}
                    </span>
                    <span className="w-full truncate text-[10px] text-slate-500">{member.role}</span>
                  </button>
                ))}
              </HorizontalSlider>
            </div>
          )}

          {membersLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
              ))}
            </div>
          ) : membersError && communityMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <Users className="mx-auto h-9 w-9 text-astu-navy/40" />
              <p className="mt-3 text-base font-bold text-astu-navy-deep dark:text-white">
                Unable to load community directory
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Check your connection and try again. Published leaders appear here from the CMS.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMembersLoading(true);
                  setMembersError(false);
                  communityMembersService
                    .fetchMembersFromApi()
                    .then((members) => {
                      setCommunityMembers(members.filter((m) => m.active !== false));
                    })
                    .catch(() => setMembersError(true))
                    .finally(() => setMembersLoading(false));
                }}
                className="mt-4 rounded-lg bg-astu-navy px-4 py-2 text-xs font-bold text-white hover:brightness-110"
              >
                Retry
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <Users className="mx-auto h-9 w-9 text-astu-navy/40" />
              <p className="mt-3 text-base font-bold text-astu-navy-deep dark:text-white">
                {communityMembers.length === 0
                  ? 'No community leaders published yet'
                  : 'No members match your filters'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {communityMembers.length === 0
                  ? 'Leaders appear here once published through the CMS community directory.'
                  : 'Try another category or clear your search.'}
              </p>
              {communityMembers.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-xs font-bold text-astu-navy underline dark:text-astu-green"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'slide' ? (
                <HorizontalSlider label="Community leaders" showControls={pagedMembers.length > 1}>
                  {pagedMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      compact
                      onView={() => openMemberProfile(member)}
                      onShare={() => handleCopyShare(member)}
                    />
                  ))}
                </HorizontalSlider>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onView={() => openMemberProfile(member)}
                      onShare={() => handleCopyShare(member)}
                    />
                  ))}
                </div>
              )}

              {filteredMembers.length > COMMUNITY_PAGE_SIZE && (
                <PaginationBar
                  currentPage={safeCommunityPage}
                  totalPages={communityTotalPages}
                  total={filteredMembers.length}
                  pageSize={COMMUNITY_PAGE_SIZE}
                  onPageChange={setCommunityPage}
                  noun="leaders"
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Regional chapters ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-primary-container to-astu-navy py-14 text-white md:py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-astu-green/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-astu-blue-light/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="mb-8 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-astu-green">
              <MapPin className="h-3.5 w-3.5" /> Regional presence
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
              ASTU Alumni Chapters Worldwide
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Connect with fellow alumni in your region for meetups, chapter initiatives, and mentorship.
            </p>
          </div>

          {regionalChapters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/25 bg-white/5 px-6 py-12 text-center">
              <Globe className="mx-auto h-8 w-8 text-white/40" />
              <p className="mt-3 text-sm font-bold text-white">No chapters published yet</p>
              <p className="mt-1 text-xs text-slate-300">
                Regional hubs appear here when configured in the Alumni Community CMS.
              </p>
            </div>
          ) : regionalChapters.length > 4 ? (
            <HorizontalSlider label="Regional chapters" showControls>
              {regionalChapters.map((chap) => (
                <div
                  key={chap.name}
                  className="flex w-[min(300px,85vw)] shrink-0 snap-start flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:w-[320px]"
                >
                  <div>
                    <span className="rounded-lg border border-astu-green/30 bg-astu-green/20 px-2.5 py-1 text-[11px] font-bold text-astu-green">
                      {chap.members}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-white">{chap.name}</h3>
                    <p className="mt-1 text-xs text-slate-300">
                      Hub: <span className="font-semibold text-white">{chap.hub}</span>
                    </p>
                    <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-200">
                      {chap.focus}
                    </p>
                  </div>
                  {chap.contact && (
                    <a
                      href={`mailto:${chap.contact}`}
                      className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-astu-green hover:brightness-125"
                    >
                      <Mail className="h-3.5 w-3.5" /> Contact Chapter Lead
                    </a>
                  )}
                </div>
              ))}
            </HorizontalSlider>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {regionalChapters.map((chap) => (
                <div
                  key={chap.name}
                  className="flex flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md transition hover:bg-white/15"
                >
                  <div>
                    <span className="rounded-lg border border-astu-green/30 bg-astu-green/20 px-2.5 py-1 text-[11px] font-bold text-astu-green">
                      {chap.members}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-white">{chap.name}</h3>
                    <p className="mt-1 text-xs text-slate-300">
                      Hub: <span className="font-semibold text-white">{chap.hub}</span>
                    </p>
                    <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-200">
                      {chap.focus}
                    </p>
                  </div>
                  {chap.contact && (
                    <a
                      href={`mailto:${chap.contact}`}
                      className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-astu-green hover:brightness-125"
                    >
                      <Mail className="h-3.5 w-3.5" /> Contact Chapter Lead
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Event banner ── */}
      <section className="bg-white py-12 dark:bg-slate-950/40">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-astu-navy-deep via-astu-navy to-primary-container p-8 text-white md:p-10">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-astu-green/20 blur-2xl" />
            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-astu-green">
                  <Calendar className="h-3.5 w-3.5" /> {eventBanner.badge}
                </span>
                <h2 className="mt-4 text-2xl font-black md:text-3xl">{eventBanner.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">{eventBanner.description}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-300">
                  {(eventBanner.features || []).map((feature) => (
                    <div key={feature} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-astu-green" /> {feature}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
                <button
                  type="button"
                  onClick={() => navigate(eventBanner.primaryButtonLink || '/register')}
                  className="rounded-xl bg-astu-green px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
                >
                  {eventBanner.primaryButtonText}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(eventBanner.secondaryButtonLink || '/events')}
                  className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {eventBanner.secondaryButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="border-t border-slate-200/80 bg-[#eef3f9] py-12 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="mb-8 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-astu-navy dark:text-astu-green">
              Ways to engage
            </span>
            <h2 className="mt-1 text-2xl font-black text-astu-navy-deep dark:text-white md:text-3xl">
              Strengthen Your Bond With ASTU
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Mentorship, curriculum partnership, and innovation support for the next generation.
            </p>
          </div>

          {communityPillars.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <Sparkles className="mx-auto h-8 w-8 text-astu-navy/40" />
              <p className="mt-3 text-sm font-bold text-astu-navy-deep dark:text-white">
                Engagement options coming soon
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Community pillars are managed in the Alumni Community CMS.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {communityPillars.map((pillar) => {
                const Icon = iconMap[pillar.icon] || Users;
                return (
                  <div
                    key={pillar.title}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-astu-navy/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/5 text-astu-navy dark:bg-astu-green/10 dark:text-astu-green">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-astu-navy-deep dark:text-white">
                        {pillar.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {pillar.desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(pillar.link)}
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-astu-navy hover:text-astu-red dark:text-astu-green"
                    >
                      {pillar.action} <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Biography modal ── */}
      {activeModalMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeMemberProfile}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
            className="relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <MemberAvatar
                  member={activeModalMember}
                  className="h-16 w-16 rounded-2xl border-2 border-slate-200 shadow"
                />
                <div className="min-w-0">
                  <h3 id="member-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeModalMember.name}
                  </h3>
                  <p className="text-xs font-semibold text-astu-red">{activeModalMember.role}</p>
                  <p className="text-xs text-slate-500">{activeModalMember.org}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMemberProfile}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Degree</span>
                  <span className="text-right font-semibold text-slate-800 dark:text-slate-200">
                    {activeModalMember.degree}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Graduation</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeModalMember.gradYear}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeModalMember.location}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                  Career & Impact
                </h4>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  {activeModalMember.bio}
                </p>
              </div>

              {activeModalMember.quote && (
                <div className="rounded-r-xl border-l-4 border-astu-green bg-astu-green/5 p-3 italic text-slate-700 dark:text-slate-300">
                  &ldquo;{activeModalMember.quote}&rdquo;
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleCopyShare(activeModalMember)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Share profile via Telegram, LinkedIn, WhatsApp, or copy link"
              >
                <Share2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Share Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMemberProfile();
                  navigate('/register');
                }}
                className="rounded-lg bg-astu-navy px-5 py-2 text-xs font-bold text-white hover:brightness-110"
              >
                Connect on AMS
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} item={shareItem} />
      <Footer />
    </div>
  );
}
