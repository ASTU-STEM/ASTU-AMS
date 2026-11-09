import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, MapPin, Search, Sparkles, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import eventsService from '../features/admin/services/events.service';
import homepageCmsService from '../features/admin/services/homepageCms.service';

const fallbackEvents: any[] = [];

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function EventsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkshopsRoute = location.pathname.startsWith('/workshops');

  useEffect(() => {
    if (isWorkshopsRoute) {
      setFilter('Workshop');
    } else {
      setFilter('All');
    }
  }, [isWorkshopsRoute]);
  const [events, setEvents] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('astu_ams_cms_events_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        const active = parsed.filter((e: any) => (e.status === 'Open' || !e.status) && e.active !== false);
        if (active.length) return active;
      }
    } catch { }
    const config = homepageCmsService.getSettings();
    const cmsEvents = config?.events?.filter((e: any) => e.active !== false);
    return cmsEvents?.length ? cmsEvents : fallbackEvents;
  });
  const [eventsPageConfig, setEventsPageConfig] = useState<any>(() => homepageCmsService.getSettings()?.eventsPage || {});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Event' | 'Workshop'>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const syncConfig = () => {
      setEventsPageConfig(homepageCmsService.getSettings()?.eventsPage || {});
      try {
        const stored = localStorage.getItem('astu_ams_cms_events_items');
        const parsed = stored ? JSON.parse(stored) : [];
        const localEvents = Array.isArray(parsed)
          ? parsed.filter((e: any) => (e.status === 'Open' || !e.status) && e.active !== false)
          : [];
        if (localEvents.length) setEvents(localEvents);
      } catch { }
    };
    window.addEventListener('astu-cms-events-changed', syncConfig);
    window.addEventListener('astu-cms-homepage-updated', syncConfig);
    return () => {
      window.removeEventListener('astu-cms-events-changed', syncConfig);
      window.removeEventListener('astu-cms-homepage-updated', syncConfig);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        const cmsConfig = await homepageCmsService.fetchFromApi();
        const events = (cmsConfig?.events || []).filter((e: any) => e.active !== false);
        const workshops = (cmsConfig?.workshops || []).filter((w: any) => w.active !== false);
        const allPosts = [
          ...events.map((e: any) => ({ ...e, kind: e.kind || 'Event' })),
          ...workshops.map((w: any) => ({ ...w, kind: w.kind || 'Workshop' })),
        ].filter((e: any) => (e.status === 'Open' || !e.status) && e.active !== false);
        if (isMounted && allPosts.length) {
          setEvents(allPosts);
          setLoading(false);
          return;
        }
      } catch { }
      eventsService
        .getAllEvents()
        .then((apiEvents) => {
          if (!isMounted) return;
          if (apiEvents?.length) {
            setEvents(
              apiEvents.map((e) => ({
                id: e.id,
                title: e.title,
                date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toLocaleDateString(),
                location: e.location || 'ASTU Main Campus',
                kind: e.type === 'Workshop' || e.type === 'WORKSHOP' ? 'Workshop' : 'Event',
                category: e.type,
                description: e.description,
                image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
              }))
            );
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return [...events]
      .sort((a: any, b: any) => {
        const pinnedScore = Number(!!b.pinned) - Number(!!a.pinned);
        if (pinnedScore !== 0) return pinnedScore;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .filter((event: any) => {
        const kind = event.kind || event.type || 'Event';
        if (filter !== 'All' && kind.toLowerCase() !== filter.toLowerCase()) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return event.title?.toLowerCase().includes(q) || event.location?.toLowerCase().includes(q);
        }
        return true;
      });
  }, [events, filter, search]);

  // ── Pagination State (Page Handler) ──
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // 6 events per page aligns cleanly with 2 rows of 3-col grid

  // Reset page when filter, search, or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEvents = useMemo(() => {
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, startIndex, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const target = document.getElementById('events-feed-grid');
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

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-800">
      <Navbar />

      {/* ── Hero Banner (Clean & Modern) ── */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#001d4a] via-[#002b66] to-[#0a3977] text-white pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 shadow-xl">
        {/* Subtle Campus Background Image (Clean & Visible) */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <img
            alt="ASTU Events"
            className="h-full w-full object-cover"
            src={eventsPageConfig.heroImage || '/images/campus-2.jpeg'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
            }}
          />
        </div>

        {/* Blueprint grid pattern */}
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:4rem_4rem] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1360px]">
          {/* Breadcrumb Navigation: Home / Events */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-slate-300/80 mb-5 font-normal">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-slate-400 font-light">/</span>
            <span className="text-white font-medium">{isWorkshopsRoute ? 'Workshops & Training' : 'Events & Activities'}</span>
          </nav>

          <div className="max-w-3xl space-y-3">
            {/* Headline Title */}
            <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-tight">
              {isWorkshopsRoute ? 'Workshops & Training' : (eventsPageConfig.title || 'Events & Activities')}
            </h1>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-2xl">
              {isWorkshopsRoute
                ? 'Join interactive skill-building sessions, professional masterclasses, and hands-on technical workshops organized by ASTU.'
                : (eventsPageConfig.subtitle || 'Stay informed about upcoming ASTU events, alumni reunions, career fairs, hackathons, and campus activities.')}
            </p>
          </div>
        </div>
      </header>

      {/* ── Modern Sticky Filter & Controls Bar ── */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-[1360px] px-4 py-3 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {(['All', 'Event', 'Workshop'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setFilter(item);
                    if (item === 'Workshop' && !isWorkshopsRoute) {
                      navigate('/workshops');
                    } else if (item !== 'Workshop' && isWorkshopsRoute) {
                      navigate('/events');
                    }
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${filter === item
                      ? 'bg-[#0a3871] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                >
                  {item === 'All' ? 'All Events & Workshops' : item === 'Event' ? 'Campus Events' : 'Technical Workshops'}
                </button>
              ))}
            </div>

            {/* Search & Event Counter */}
            <div className="flex items-center gap-2.5 self-stretch md:self-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={eventsPageConfig.searchPlaceholder || 'Search events...'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-8.5 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#0a3871] focus:bg-white transition-all shadow-2xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <span className="hidden sm:inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 shrink-0">
                {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main id="events-feed-grid" className="mx-auto w-full max-w-[1360px] flex-1 space-y-6 px-4 py-8 sm:px-6">

        {loading && <p className="text-sm font-semibold text-slate-500">Loading events...</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedEvents.map((event, idx) => {
            const eventSlug = event.id || slugify(event.title || '');
            return (
              <article key={eventSlug + idx} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <img
                  src={event.image || '/images/astu-building.jpg'}
                  alt={event.title}
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                  }}
                />
                <div className="p-5">
                  <span className="rounded-full bg-[#003580]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#003580]">
                    {event.kind || event.type || 'Event'}
                  </span>
                  <h3 className="mt-3 line-clamp-2 text-base font-bold text-[#003580]">{event.title}</h3>
                  {event.description && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{event.description}</p>}
                  <div className="mt-3 flex flex-col gap-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" /> {event.date}
                    </span>
                    {event.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {event.location}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => navigate(`/events/${eventSlug}`, { state: { event } })}
                      className="flex-1 rounded-xl bg-[#003580] px-3 py-2.5 text-xs font-bold text-white hover:brightness-110"
                    >
                      {eventsPageConfig.detailsButtonText || 'View Details'}
                    </button>
                    <button
                      onClick={() => navigate(`/events/${eventSlug}`, { state: { event } })}
                      className="rounded-xl border-2 border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:border-[#003580] hover:text-[#003580]"
                    >
                      {eventsPageConfig.registerButtonText || 'Register'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── Events Page Handler (Pagination Controls) ── */}
        {!loading && filtered.length > 0 && (
          <div className="card-soft mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs">
            {/* Left: Range text */}
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
              Showing{' '}
              <span className="font-bold text-slate-900">{startIndex + 1}</span>{' '}
              to{' '}
              <span className="font-bold text-slate-900">
                {Math.min(startIndex + pageSize, filtered.length)}
              </span>{' '}
              of{' '}
              <span className="font-bold text-slate-900">{filtered.length}</span>{' '}
              events
            </div>

            {/* Middle: Page pills */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  currentPage === 1
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                    : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`event-ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                        ...
                      </span>
                    );
                  }
                  const pageNum = Number(p);
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={`event-page-${pageNum}`}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
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
                disabled={currentPage === totalPages}
                className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  currentPage === totalPages
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
                <option value={24}>24</option>
              </select>
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && <p className="text-sm text-slate-500">{eventsPageConfig.emptyText || 'No events found.'}</p>}
      </main>

      {/* RAG Copilot Assistant */}
      <ChatBot />
    </div>
  );
}
