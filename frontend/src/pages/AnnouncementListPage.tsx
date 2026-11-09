import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
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
import ChatBot from '../components/ChatBot';
import contentService from '../features/admin/services/content.service';
import announcementSettingsService, {
  AnnouncementPageSettings,
} from '../features/admin/services/announcementSettings.service';
import { ContentCardItem } from '../features/admin/components/ContentCard';

export default function AnnouncementListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNewsRoute = location.pathname.startsWith('/news');
  const isAnnouncementsRoute = location.pathname.startsWith('/announcements');

  const getInitialCategory = (): string => {
    if (location.pathname.startsWith('/news')) return 'news';
    if (location.pathname.startsWith('/announcements')) return 'announcements';
    return 'all';
  };

  const [items, setItems] = useState<ContentCardItem[]>(() => contentService.getItems());
  const [settings, setSettings] = useState<AnnouncementPageSettings>(() =>
    announcementSettingsService.getSettings()
  );
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(getInitialCategory);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'pinned'>('newest');

  useEffect(() => {
    if (location.pathname.startsWith('/news')) {
      setSelectedCategory('news');
    } else if (location.pathname.startsWith('/announcements')) {
      setSelectedCategory('announcements');
    }
  }, [location.pathname]);

  // Pagination states (Page Handler)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // 6 per page provides 2 clean 3-card rows and immediate multi-page navigation

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

  // Reset page whenever filter or search conditions change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedYear, sortBy, pageSize]);

  const isNewsActive = isNewsRoute || selectedCategory === 'news';
  const isAnnouncementsActive = isAnnouncementsRoute || selectedCategory === 'announcements';
  const currentBasePath = isNewsActive ? '/news' : '/announcements';

  const slugifiedId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const handleShare = (e: React.MouseEvent, item: ContentCardItem) => {
    e.stopPropagation();
    const itemPath = (isNewsActive || item.type === 'news' || item.type === 'post') ? '/news' : '/announcements';
    const url = `${window.location.origin}${itemPath}/${encodeURIComponent(item.id || slugifiedId(item.title))}`;
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

      // Category filter (All, Announcements, News)
      if (selectedCategory !== 'all') {
        const itemType = (item.type || '').toLowerCase();
        const itemCat = (item.category || '').toLowerCase();
        if (selectedCategory === 'announcements') {
          const isAnnouncement =
            itemType === 'announcement' ||
            itemCat.includes('announcement') ||
            itemCat.includes('bulletin') ||
            itemCat.includes('notice') ||
            itemCat.includes('directive');
          if (!isAnnouncement) return false;
        } else if (selectedCategory === 'news') {
          const isNews =
            itemType === 'post' ||
            itemType === 'news' ||
            itemCat.includes('news') ||
            itemCat.includes('spotlight') ||
            itemCat.includes('workshop') ||
            itemCat.includes('event');
          if (!isNews) return false;
        }
      }

      // Year filter
      if (selectedYear !== 'all') {
        const itemDate = item.publishedAt || item.updatedAt || '';
        if (!itemDate.includes(selectedYear)) return false;
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
      if (sortBy === 'oldest') {
        const dateA = new Date(a.publishedAt || a.updatedAt || '').getTime() || 0;
        const dateB = new Date(b.publishedAt || b.updatedAt || '').getTime() || 0;
        return dateA - dateB;
      }
      // default: newest
      const dateA = new Date(a.publishedAt || a.updatedAt || '').getTime() || 0;
      const dateB = new Date(b.publishedAt || b.updatedAt || '').getTime() || 0;
      return dateB - dateA;
    });
  }, [items, selectedCategory, selectedYear, search, sortBy]);

  // Spotlight Notice: Top pinned or first rich article (only on first page when not searching)
  const spotlightNotice = useMemo(() => {
    if (selectedCategory !== 'all' || search.trim().length > 0 || currentPage !== 1) return null;
    return filteredAndSorted.find((item) => item.pinned || item.featured || item.image);
  }, [filteredAndSorted, selectedCategory, search, currentPage]);

  const regularItems = useMemo(() => {
    if (!spotlightNotice) return filteredAndSorted;
    return filteredAndSorted.filter((item) => item.id !== spotlightNotice.id);
  }, [filteredAndSorted, spotlightNotice]);

  // Pagination Computations
  const totalGridItems = regularItems.length;
  const totalGridPages = Math.max(1, Math.ceil(totalGridItems / pageSize));
  const gridStartIndex = (currentPage - 1) * pageSize;
  const paginatedRegularItems = regularItems.slice(gridStartIndex, gridStartIndex + pageSize);

  const totalListItems = filteredAndSorted.length;
  const totalListPages = Math.max(1, Math.ceil(totalListItems / pageSize));
  const listStartIndex = (currentPage - 1) * pageSize;
  const paginatedListItems = filteredAndSorted.slice(listStartIndex, listStartIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    const maxPage = viewMode === 'grid' ? totalGridPages : totalListPages;
    if (newPage < 1 || newPage > maxPage) return;
    setCurrentPage(newPage);
    const target = document.getElementById('notices-feed-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = (current: number, total: number) => {
    const delta = 1;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < total - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }
    return range;
  };

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
        badge: 'bg-slate-100 text-[#003580] border-slate-200/80',
        dot: 'bg-[#003580]',
        accentBorder: 'border-l-[#003580]',
        bannerGradient: 'from-slate-900/10 via-slate-50/40 to-white',
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
      badge: 'bg-blue-50 text-[#003580] border-blue-200/80',
      dot: 'bg-[#003580]',
      accentBorder: 'border-l-[#003580]',
      bannerGradient: 'from-blue-900/10 via-blue-50/40 to-white',
    };
  };

  const calculateReadTime = (content?: string, excerpt?: string) => {
    const words = ((content || '') + ' ' + (excerpt || '')).split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-800">
      <Navbar />

      {/* ── Hero Banner (Clean & Modern) ── */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#001d4a] via-[#002b66] to-[#0a3977] pt-10 pb-12 sm:pt-14 sm:pb-16 text-white shadow-xl">
        {/* Campus background image overlay - Crisp & Visible */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <img
            alt="ASTU Campus"
            className="h-full w-full object-cover"
            src={(settings as any)?.heroImage || (settings as any)?.bannerImage || '/images/astu-building.jpg'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-slate-300/80 mb-5 font-normal">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-slate-400 font-light">/</span>
            <span className="text-white font-medium">
              {isNewsActive ? 'News' : 'Announcements'}
            </span>
          </nav>

          <div className="max-w-3xl space-y-3">
            {/* Headline Title */}
            <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-tight">
              {isNewsActive
                ? 'Campus News & Dispatches'
                : (settings.bannerTitle && settings.bannerTitle !== 'ASTU Official Notices & Announcements'
                  ? settings.bannerTitle
                  : 'Official Notices & Announcements')}
            </h1>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-2xl">
              {isNewsActive
                ? 'Campus research breakthroughs, university press updates, student achievements, and academic news from ASTU.'
                : (settings.bannerSubtitle && !settings.bannerSubtitle.startsWith('Official communications, university')
                  ? settings.bannerSubtitle
                  : 'Official university bulletins, academic notices, and public communications.')}
            </p>
          </div>
        </div>
      </header>

      {/* ── Search & Filter Controls (Clean Flow - No Overlap) ── */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 w-full mt-8 sm:mt-10">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(20,48,77,0.1),0_16px_40px_-8px_rgba(20,48,77,0.14)] border-t-4 border-[#C8102E] space-y-5">
          {/* Top Controls: Search Input + All years + Newest first */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isNewsActive ? "Search news by title or keyword..." : "Search announcements by title or keyword..."}
                className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-[#003580] placeholder:text-slate-400 outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Year Selector */}
            <div className="relative shrink-0 sm:w-36">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full h-12 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm font-normal text-slate-700 outline-none focus:border-[#003580] cursor-pointer transition-colors"
              >
                <option value="all">All years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>

            {/* Sort Selector */}
            <div className="relative shrink-0 sm:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-12 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm font-normal text-slate-700 outline-none focus:border-[#003580] cursor-pointer transition-colors"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="views">Most viewed</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Bottom Row: Category Tabs + Showing Count */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
            {/* Tabs: All, Announcements, News */}
            <div className="flex items-center gap-7">
              {[
                { id: 'all', label: 'All' },
                { id: 'announcements', label: 'Announcements' },
                { id: 'news', label: 'News' },
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedCategory(tab.id);
                      if (tab.id === 'news' && !isNewsRoute) {
                        navigate('/news');
                      } else if (tab.id === 'announcements' && !isAnnouncementsRoute) {
                        navigate('/announcements');
                      }
                    }}
                    className={`relative pb-2.5 text-sm transition-colors cursor-pointer ${isActive
                        ? 'font-bold text-[#003580]'
                        : 'font-medium text-slate-600 hover:text-[#003580]'
                      }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C8102E] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Counter */}
            <div className="text-xs sm:text-sm font-normal text-slate-500">
              Showing {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'notice' : 'notices'}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main id="notices-feed-section" className="mx-auto max-w-[1240px] flex-1 px-4 py-8 sm:px-6 w-full space-y-7">
        {/* Results Counter & Search Indicator */}
        {(search || selectedCategory !== 'all') && (
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500 bg-slate-100/70 rounded-xl px-4 py-2 border border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                Found {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'notice' : 'notices'}
              </span>
              {search && (
                <span>
                  matching <span className="font-extrabold text-[#003580]">"{search}"</span>
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
              className="text-[#003580] font-extrabold hover:underline cursor-pointer"
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
              <div className="lg:col-span-7 relative min-h-[220px] lg:min-h-[300px] overflow-hidden bg-slate-900">
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
                <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-white px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-md">
                    <Pin className="h-3 w-3 fill-white" />
                    Pinned Official Dispatch
                  </span>
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-extrabold text-[#FFD700] border border-white/20">
                    {spotlightNotice.category || spotlightNotice.type || 'Notice'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-white/90 lg:hidden">
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
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="hidden lg:flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                      <Calendar className="h-3.5 w-3.5 text-[#003580]" />
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
                        `${currentBasePath}/${encodeURIComponent(
                          spotlightNotice.id || slugifiedId(spotlightNotice.title)
                        )}`
                      )
                    }
                    className="font-fraunces text-lg sm:text-xl font-bold text-[#003580] hover:text-[#C8102E] transition-colors leading-snug cursor-pointer"
                  >
                    {spotlightNotice.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-normal">
                    {spotlightNotice.excerpt || spotlightNotice.content}
                  </p>

                  {/* Tags */}
                  {spotlightNotice.tags && spotlightNotice.tags.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      {spotlightNotice.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 text-[10px] font-semibold transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Signature & CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold min-w-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate text-[11px]">{spotlightNotice.author || 'ASTU Directorate Official Notice'}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleShare(e, spotlightNotice)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#003580] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Share notice"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `${currentBasePath}/${encodeURIComponent(
                            spotlightNotice.id || slugifiedId(spotlightNotice.title)
                          )}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] hover:bg-[#A60D26] text-white font-bold text-xs px-4 py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#002759] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Modern 3-Column Professional Card Grid (Refined Width & Clean Height) ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedRegularItems.map((item) => {
              const theme = getCategoryTheme(item.category, item.type);
              const hasImage = Boolean(item.image);

              return (
                <article
                  key={item.id || item.title}
                  onClick={() =>
                    navigate(
                      `${currentBasePath}/${encodeURIComponent(item.id || slugifiedId(item.title))}`
                    )
                  }
                  className={`card-soft group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white cursor-pointer ${!hasImage ? `border-l-4 ${theme.accentBorder}` : ''
                    }`}
                >
                  <div>
                    {/* Visual Header: Compact Photo or Stylized Institutional Pattern */}
                    {hasImage ? (
                      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
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
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-white/95 text-slate-800 shadow-xs border border-white/30`}>
                            {item.category || item.type || 'Notice'}
                          </span>
                          {item.pinned && (
                            <span className="flex items-center gap-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[9px] font-black shadow-xs">
                              <Pin className="h-2.5 w-2.5 fill-white" />
                              PINNED
                            </span>
                          )}
                          {item.priorityBadge && (
                            <span className="rounded-full bg-[#003580] text-[#FFD700] px-2 py-0.5 text-[9px] font-black shadow-xs border border-white/20">
                              {item.priorityBadge}
                            </span>
                          )}
                        </div>

                        {/* Bottom Overlay Info */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] text-white/90">
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
                      <div className={`p-4 pb-2 bg-gradient-to-r ${theme.bannerGradient} border-b border-slate-100`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${theme.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}></span>
                              {item.category || item.type || 'Official Bulletin'}
                            </span>
                            {item.pinned && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 text-[9px] font-black">
                                <Pin className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                PINNED
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.publishedAt || item.updatedAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 space-y-2">
                      <h3 className="font-fraunces text-base font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors leading-snug line-clamp-2 min-h-[2.5rem]">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {item.excerpt || item.content}
                      </p>

                      {/* Tag Chips */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1">
                          {item.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[9px] font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Bar */}
                  <div className="mx-4 sm:mx-5 mb-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold min-w-0 pr-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate text-[10px]">
                        {item.author || settings.authorityLabel || 'ASTU Directorate Notice'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleShare(e, item)}
                        className="p-1 text-slate-400 hover:text-[#003580] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Share notice"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>

                      <span className="inline-flex items-center gap-0.5 text-[#003580] font-black text-xs group-hover:translate-x-0.5 transition-transform">
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
            {paginatedListItems.map((item) => {
              const theme = getCategoryTheme(item.category, item.type);
              return (
                <article
                  key={item.id || item.title}
                  onClick={() =>
                    navigate(
                      `${currentBasePath}/${encodeURIComponent(item.id || slugifiedId(item.title))}`
                    )
                  }
                  className="card-soft group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 cursor-pointer"
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

                    <h3 className="font-fraunces text-base font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors truncate">
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
                      className="p-1.5 text-slate-400 hover:text-[#003580] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Share notice"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>

                    <span className="inline-flex items-center gap-1 text-xs font-black text-[#003580] group-hover:translate-x-1 transition-transform">
                      <span>View</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ── Page Handler (Pagination Controls) ── */}
        {(viewMode === 'grid' ? totalGridItems > 0 : totalListItems > 0) && (
          <div className="card-soft mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs">
            {/* Left: Summary text */}
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
              Showing{' '}
              <span className="font-bold text-slate-900">
                {viewMode === 'grid' ? gridStartIndex + 1 : listStartIndex + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-slate-900">
                {viewMode === 'grid'
                  ? Math.min(gridStartIndex + pageSize, totalGridItems)
                  : Math.min(listStartIndex + pageSize, totalListItems)}
              </span>{' '}
              of{' '}
              <span className="font-bold text-slate-900">
                {viewMode === 'grid' ? totalGridItems : totalListItems}
              </span>{' '}
              bulletins
            </div>

            {/* Middle: Page navigation pills */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${currentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers(
                  currentPage,
                  viewMode === 'grid' ? totalGridPages : totalListPages
                ).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                        ...
                      </span>
                    );
                  }
                  const pageNum = Number(p);
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={`page-${pageNum}`}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
                        ? 'bg-[#003580] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === (viewMode === 'grid' ? totalGridPages : totalListPages)}
                className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${currentPage === (viewMode === 'grid' ? totalGridPages : totalListPages)
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                title="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right: Items per page selector */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-[11px] font-medium hidden sm:inline">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#003580] cursor-pointer"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
              </select>
            </div>
          </div>
        )}
      </main>

      {/* RAG Copilot Assistant */}
      <ChatBot />
    </div>
  );
}
