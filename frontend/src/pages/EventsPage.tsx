import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Search, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import eventsService from '../features/admin/services/events.service';
import homepageCmsService from '../features/admin/services/homepageCms.service';

const fallbackEvents: any[] = [];

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('astu_ams_cms_events_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        const active = parsed.filter((e: any) => (e.status === 'Open' || !e.status) && e.active !== false);
        if (active.length) return active;
      }
    } catch {}
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
      } catch {}
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
      } catch {}
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800">
      <Navbar />
      <div className="relative overflow-hidden bg-[#003580] px-4 py-12 text-white sm:px-6">
        {eventsPageConfig.heroImage && (
          <img src={eventsPageConfig.heroImage} alt="Events hero" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="relative z-10 mx-auto max-w-[1240px]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#FFD700]">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black sm:text-4xl">{eventsPageConfig.title || 'ASTU Events & Workshops'}</h1>
              <p className="mt-1 text-xs text-slate-200 sm:text-sm">
                {eventsPageConfig.subtitle || 'Upcoming alumni events, technical workshops, networking sessions, and registration information.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1240px] flex-1 space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1.5">
            {(['All', 'Event', 'Workshop'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filter === item ? 'bg-[#003580] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={eventsPageConfig.searchPlaceholder || 'Search events...'}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
            />
          </div>
        </div>

        {loading && <p className="text-sm font-semibold text-slate-500">Loading events...</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event, idx) => {
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
        {!loading && filtered.length === 0 && <p className="text-sm text-slate-500">{eventsPageConfig.emptyText || 'No events found.'}</p>}
      </main>
      <ChatBot />
    </div>
  );
}
