import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Pin,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  Building2,
  X,
  FileText,
  CheckCircle2,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import contentService from '../features/admin/services/content.service';
import announcementSettingsService, {
  AnnouncementPageSettings,
} from '../features/admin/services/announcementSettings.service';
import { ContentCardItem } from '../features/admin/components/ContentCard';

export default function AnnouncementListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentCardItem[]>(() => contentService.getItems());
  const [settings, setSettings] = useState<AnnouncementPageSettings>(() =>
    announcementSettingsService.getSettings()
  );
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'pinned'>('newest');

  useEffect(() => {
    let isMounted = true;
    contentService.fetchItemsFromApi().then((apiItems) => {
      if (isMounted && Array.isArray(apiItems) && apiItems.length) {
        setItems(apiItems);
      }
    });

    const handleContentSync = () => setItems(contentService.getItems());
    const handleSettingsSync = () => setSettings(announcementSettingsService.getSettings());

    window.addEventListener('astu-cms-content-changed', handleContentSync);
    window.addEventListener('astu-announcement-settings-changed', handleSettingsSync);

    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-content-changed', handleContentSync);
      window.removeEventListener('astu-announcement-settings-changed', handleSettingsSync);
    };
  }, []);

  const slugifiedId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const handleShare = (e: React.MouseEvent, item: ContentCardItem) => {
    e.stopPropagation();
    const url = `${window.location.origin}/announcements/${encodeURIComponent(item.id || slugifiedId(item.title))}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Notice link copied to clipboard!');
    } else {
      toast.success('Notice ready to share');
    }
  };

  // Filter and deduplicate notices
  const filteredAndSorted = useMemo(() => {
    const seen = new Set<string>();

    const filtered = items.filter((item) => {
      // Must be published (or public)
      if (item.status && item.status !== 'Published') return false;

      // Filter out duplicate or corrupted test entries if any exist
      if (!item.title || item.title.trim().length < 3) return false;

      // Deduplicate by title/id
      const normTitle = item.title.trim().toLowerCase();
      if (seen.has(normTitle)) return false;
      seen.add(normTitle);

      // Category filter
      if (selectedCategory !== 'all') {
        const itemType = (item.type || '').toLowerCase();
        const itemCat = (item.category || '').toLowerCase();
        const matchCategory =
          itemType === selectedCategory.toLowerCase() ||
          itemCat === selectedCategory.toLowerCase() ||
          (selectedCategory === 'announcements' && (itemType === 'announcement' || itemCat.includes('announcement'))) ||
          (selectedCategory === 'workshops' && (itemType === 'event' || itemCat.includes('workshop') || item.title.toLowerCase().includes('workshop'))) ||
          (selectedCategory === 'academic' && (itemCat.includes('academic') || itemCat.includes('research') || item.title.toLowerCase().includes('research'))) ||
          (selectedCategory === 'alumni' && (itemCat.includes('alumni') || itemCat.includes('spotlight') || item.title.toLowerCase().includes('alumni')));
        if (!matchCategory) return false;
      }

      // Search keyword filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inExcerpt = item.excerpt?.toLowerCase().includes(q);
        const inAuthor = item.author?.toLowerCase().includes(q);
        const inTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inExcerpt && !inAuthor && !inTags) return false;
      }

      return true;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'pinned') {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      }
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      // default: newest
      const dateA = new Date(a.publishedAt || a.updatedAt || '').getTime() || 0;
      const dateB = new Date(b.publishedAt || b.updatedAt || '').getTime() || 0;
      return dateB - dateA;
    });
  }, [items, selectedCategory, search, sortBy]);

  // Spotlight Notice: Top pinned or first rich article
  const spotlightNotice = useMemo(() => {
    if (selectedCategory !== 'all' || search.trim().length > 0) return null;
    return filteredAndSorted.find((item) => item.pinned || item.featured || item.image);
  }, [filteredAndSorted, selectedCategory, search]);

  const regularItems = useMemo(() => {
    if (!spotlightNotice) return filteredAndSorted;
    return filteredAndSorted.filter((item) => item.id !== spotlightNotice.id);
  }, [filteredAndSorted, spotlightNotice]);

  const categoryPills = [
    { id: 'all', label: 'All Notices' },
    { id: 'announcements', label: 'Official Bulletins' },
    { id: 'workshops', label: 'Workshops & Events' },
    { id: 'academic', label: 'Research & Grants' },
    { id: 'alumni', label: 'Alumni Spotlights' },
  ];

  const getCategoryTheme = (category?: string, type?: string) => {
    const key = (category || type || '').toLowerCase();
    if (key.includes('alert') || key.includes('urgent') || key.includes('safety')) {
      return {
        badge: 'bg-rose-50 text-[#C8102E] border-rose-200/80',
        dot: 'bg-[#C8102E]',
        accentBorder: 'border-l-[#C8102E]',
        bannerGradient: 'from-rose-900/10 via-rose-50/40 to-white',
      };
    }
    if (key.includes('workshop') || key.includes('event')) {
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        dot: 'bg-[#008C44]',
        accentBorder: 'border-l-[#008C44]',
        bannerGradient: 'from-emerald-900/10 via-emerald-50/40 to-white',
      };
    }
    if (key.includes('grant') || key.includes('award') || key.includes('spotlight')) {
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
        dot: 'bg-amber-500',
        accentBorder: 'border-l-amber-500',
        bannerGradient: 'from-amber-900/10 via-amber-50/40 to-white',
      };
    }
    return {
      badge: 'bg-blue-50 text-[#14304D] border-blue-200/80',
      dot: 'bg-[#14304D]',
      accentBorder: 'border-l-[#14304D]',
      bannerGradient: 'from-blue-900/10 via-blue-50/40 to-white',
    };
  };

  const calculateReadTime = (content?: string, excerpt?: string) => {
    const words = ((content || '') + ' ' + (excerpt || '')).trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-[#14304D] selection:text-white">
      <Navbar />

      {/* Top Breadcrumb & Calendar Indicator */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-xs text-xs text-slate-500">
        <div className="mx-auto max-w-[1360px] px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#14304D] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">Official Notices & Bulletins</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Official Institutional Channel</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline">Adama Science & Technology University</span>
          </div>
        </div>
      </div>

      {/* Top Ticker Alert Bar (If enabled in CMS) */}
      {settings.topAlertEnabled && settings.topAlertText && (
        <div className="bg-gradient-to-r from-[#C8102E] via-[#a30b23] to-[#800719] text-white py-2.5 px-4 text-xs font-semibold shadow-inner">
          <div className="mx-auto max-w-[1360px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="flex h-5 items-center rounded-full bg-white/20 px-2.5 text-[10px] uppercase font-black tracking-wider text-white shrink-0">
                Official Alert
              </span>
              <p className="truncate text-xs text-slate-100">{settings.topAlertText}</p>
            </div>
            {settings.topAlertLink && (
              <Link
                to={settings.topAlertLink}
                className="shrink-0 font-bold underline hover:text-white/80 transition-colors text-xs"
              >
                Learn More &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Prestige Institutional Dark-Band Hero */}
      <section className="relative overflow-hidden dark-band-grid text-white py-14 px-4 sm:px-6 lg:py-18">
        {/* Soft Ambient Radiance */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-[#008C44]/20 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-96 h-96 rounded-full bg-[#FFD700]/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1360px]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl space-y-3.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-[#FFD700] backdrop-blur-md border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-[#FFD700]" />
                <span className="uppercase tracking-widest text-[10px] font-black">
                  ASTU Official Communications Directorate
                </span>
                <span className="h-1 w-1 rounded-full bg-[#FFD700]/70"></span>
                <span className="text-[10px] text-white/80 font-semibold">Verified Channel</span>
              </div>

              <h1 className="font-fraunces text-3xl font-bold sm:text-4xl lg:text-5xl tracking-[-0.015em] text-white leading-tight">
                {settings.bannerTitle || 'ASTU Official Notices & Announcements'}
              </h1>

              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-2xl">
                {settings.bannerSubtitle ||
                  'Official communications, university bulletins, academic research notices, and alumni achievements verified by the ASTU Directorate.'}
              </p>

              {/* Quick Institutional Telemetry Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/10">
                  <Bell className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span className="font-extrabold text-white">{filteredAndSorted.length}</span>
                  <span className="text-slate-300 text-[11px]">Published Notices</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-extrabold text-white">100% Verified</span>
                  <span className="text-slate-300 text-[11px]">Directorate Signed</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/10">
                  <Calendar className="h-3.5 w-3.5 text-sky-400" />
                  <span className="font-extrabold text-white">2026/27</span>
                  <span className="text-slate-300 text-[11px]">Academic Cycle</span>
                </div>
              </div>
            </div>

            {/* Directorate Authority Card */}
            <div className="hidden lg:flex flex-col gap-3 rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/15 max-w-xs shrink-0 text-xs shadow-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#14304D] to-[#008C44] flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20">
                  ASTU
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Public Information Desk</h4>
                  <p className="text-[11px] text-slate-300">Office of Corporate Communications</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-200/80 leading-relaxed border-t border-white/10 pt-2.5">
                All bulletins published on this portal are official public records issued under the university communication charter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Interactive Filter & Search Controls */}
      <nav aria-label="Notices and announcements filter controls" className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-[1360px] px-4 py-3.5 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Horizontal Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categoryPills.map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#14304D] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search, Sort and Layout Controls */}
            <div className="flex items-center gap-2.5 self-stretch md:self-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bulletins..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-8.5 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#14304D] focus:bg-white transition-all shadow-2xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50/80 pl-3 pr-7 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#14304D] shadow-2xs cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="views">Most Viewed</option>
                  <option value="pinned">Pinned Priority</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Filter className="h-3 w-3" />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-[#14304D] shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-[#14304D] shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="List view"
                >
                  <ListIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1360px] flex-1 px-4 py-8 sm:px-6 w-full space-y-8">
        {/* Results Counter & Search Indicator */}
        {(search || selectedCategory !== 'all') && (
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500 bg-slate-100/70 rounded-xl px-4 py-2 border border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                Found {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'notice' : 'notices'}
              </span>
              {search && (
                <span>
                  matching <span className="font-extrabold text-[#14304D]">"{search}"</span>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="text-slate-400">in {categoryPills.find((c) => c.id === selectedCategory)?.label}</span>
              )}
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
              className="text-[#14304D] font-extrabold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ── Featured Spotlight Notice (Editorial Hero) ── */}
        {spotlightNotice && (
          <div className="card-soft relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Media Column */}
              <div className="lg:col-span-7 relative min-h-[260px] lg:min-h-[380px] overflow-hidden bg-slate-900">
                <img
                  src={spotlightNotice.image || '/images/astu-building.jpg'}
                  alt={spotlightNotice.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent lg:hidden" />

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-md">
                    <Pin className="h-3 w-3 fill-white" />
                    Pinned Official Dispatch
                  </span>
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-[#FFD700] border border-white/20">
                    {spotlightNotice.category || spotlightNotice.type || 'Notice'}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 lg:hidden">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Calendar className="h-3.5 w-3.5 text-[#FFD700]" />
                    {spotlightNotice.publishedAt || spotlightNotice.updatedAt}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <Clock className="h-3.5 w-3.5" />
                    {calculateReadTime(spotlightNotice.content, spotlightNotice.excerpt)}
                  </span>
                </div>
              </div>

              {/* Story Content Column */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="hidden lg:flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                      <Calendar className="h-3.5 w-3.5 text-[#14304D]" />
                      {spotlightNotice.publishedAt || spotlightNotice.updatedAt}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {calculateReadTime(spotlightNotice.content, spotlightNotice.excerpt)}
                    </span>
                  </div>

                  <h2
                    onClick={() =>
                      navigate(
                        `/announcements/${encodeURIComponent(
                          spotlightNotice.id || slugifiedId(spotlightNotice.title)
                        )}`
                      )
                    }
                    className="font-fraunces text-xl sm:text-2xl font-bold text-[#14304D] hover:text-[#008C44] transition-colors leading-snug cursor-pointer"
                  >
                    {spotlightNotice.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-4 leading-relaxed font-normal">
                    {spotlightNotice.excerpt || spotlightNotice.content}
                  </p>

                  {/* Tags */}
                  {spotlightNotice.tags && spotlightNotice.tags.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      {spotlightNotice.tags.slice(0, 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 text-[11px] font-semibold transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Signature & CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold min-w-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{spotlightNotice.author || 'ASTU Directorate Official Notice'}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleShare(e, spotlightNotice)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#14304D] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Share notice"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `/announcements/${encodeURIComponent(
                            spotlightNotice.id || slugifiedId(spotlightNotice.title)
                          )}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#14304D] hover:bg-[#002759] text-white font-bold text-xs px-4 py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <span>Read Bulletin</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {filteredAndSorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-fraunces text-lg font-bold text-slate-800">No Announcements Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                We could not find any official bulletins matching your current search criteria or category filter.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#14304D] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#002759] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Modern 2-Column Editorial Grid ── */
          <div className="grid gap-6 md:grid-cols-2">
            {regularItems.map((item) => {
              const theme = getCategoryTheme(item.category, item.type);
              const hasImage = Boolean(item.image);

              return (
                <article
                  key={item.id || item.title}
                  onClick={() =>
                    navigate(
                      `/announcements/${encodeURIComponent(item.id || slugifiedId(item.title))}`
                    )
                  }
                  className={`card-soft group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white cursor-pointer ${
                    !hasImage ? `border-l-4 ${theme.accentBorder}` : ''
                  }`}
                >
                  <div>
                    {/* Visual Header: Photo or Stylized Executive Notice Header */}
                    {hasImage ? (
                      <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 z-10">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-white/95 text-slate-800 shadow-xs border border-white/30`}>
                            {item.category || item.type || 'Notice'}
                          </span>
                          {item.pinned && (
                            <span className="flex items-center gap-1 rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[10px] font-black shadow-xs">
                              <Pin className="h-3 w-3 fill-white" />
                              PINNED
                            </span>
                          )}
                          {item.priorityBadge && (
                            <span className="rounded-full bg-[#14304D] text-[#FFD700] px-2.5 py-0.5 text-[10px] font-black shadow-xs border border-white/20">
                              {item.priorityBadge}
                            </span>
                          )}
                        </div>

                        {/* Bottom Overlay Info */}
                        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] text-white/90">
                          <span className="flex items-center gap-1 font-bold">
                            <Calendar className="h-3 w-3 text-[#FFD700]" />
                            {item.publishedAt || item.updatedAt}
                          </span>
                          <span className="flex items-center gap-1 text-slate-200 text-[10px]">
                            <Clock className="h-3 w-3" />
                            {calculateReadTime(item.content, item.excerpt)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Stylized Institutional Pattern Header for Text-Only Bulletins */
                      <div className={`p-6 pb-2 bg-gradient-to-r ${theme.bannerGradient} border-b border-slate-100`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${theme.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}></span>
                              {item.category || item.type || 'Official Bulletin'}
                            </span>
                            {item.pinned && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 text-[10px] font-black">
                                <Pin className="h-3 w-3 fill-amber-500 text-amber-500" />
                                PINNED
                              </span>
                            )}
                            {item.priorityBadge && (
                              <span className="rounded-full bg-slate-900 text-[#FFD700] px-2 py-0.5 text-[10px] font-black">
                                {item.priorityBadge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1 text-[11px]">
                              <Calendar className="h-3 w-3" />
                              {item.publishedAt || item.updatedAt}
                            </span>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <span className="hidden sm:inline text-[10px] text-slate-400">
                              {calculateReadTime(item.content, item.excerpt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-6 space-y-3">
                      <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#14304D] group-hover:text-[#008C44] transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-normal">
                        {item.excerpt || item.content}
                      </p>

                      {/* Tag Chips */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          {item.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Bar */}
                  <div className="mx-6 mb-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold min-w-0 pr-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate text-[11px]">
                        {item.author || settings.authorityLabel || 'ASTU Directorate Notice'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleShare(e, item)}
                        className="p-1.5 text-slate-400 hover:text-[#14304D] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Share notice"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>

                      <span className="inline-flex items-center gap-1 text-[#14304D] font-black text-xs group-hover:translate-x-0.5 transition-transform">
                        <span>Read</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* ── Compact Executive List View ── */
          <div className="space-y-3">
            {filteredAndSorted.map((item) => {
              const theme = getCategoryTheme(item.category, item.type);
              return (
                <article
                  key={item.id || item.title}
                  onClick={() =>
                    navigate(
                      `/announcements/${encodeURIComponent(item.id || slugifiedId(item.title))}`
                    )
                  }
                  className="card-soft group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${theme.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}></span>
                        {item.category || item.type || 'Notice'}
                      </span>
                      {item.pinned && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-black">
                          <Pin className="h-3 w-3 fill-amber-500 text-amber-500" />
                          PINNED
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.publishedAt || item.updatedAt}
                      </span>
                    </div>

                    <h3 className="font-fraunces text-base font-bold text-[#14304D] group-hover:text-[#008C44] transition-colors truncate">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1 font-normal">
                      {item.excerpt || item.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-[11px] font-semibold">{item.author || 'ASTU Directorate'}</span>
                    </div>

                    <button
                      onClick={(e) => handleShare(e, item)}
                      className="p-1.5 text-slate-400 hover:text-[#14304D] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Share notice"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>

                    <span className="inline-flex items-center gap-1 text-xs font-black text-[#14304D] group-hover:translate-x-1 transition-transform">
                      <span>View</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* RAG Copilot Assistant */}
      <ChatBot />
    </div>
  );
}
