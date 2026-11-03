import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Calendar,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import eventsService, { ApiEvent } from '../features/admin/services/events.service';
import contentService from '../features/admin/services/content.service';
import { ContentCardItem } from '../features/admin/components/ContentCard';

export type BroadcastLifecycle = 'upcoming' | 'ongoing' | 'completed' | 'unpublished' | 'notice';

export interface LiveBroadcastItem {
  id: string;
  title: string;
  type: string;
  excerpt?: string;
  content?: string;
  eventDate?: string;
  eventLocation?: string;
  department?: string;
  approvedByOfficer?: string;
  registrationCount?: number;
  lifecycle: BroadcastLifecycle;
  detailPath: string;
  source: 'event' | 'content';
}

interface DashboardBroadcastHeroProps {
  actorRole?: 'ALUMNI' | 'EMPLOYER' | 'DEPARTMENT_HEAD' | 'REGISTRAR' | 'ADMIN' | string;
  className?: string;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function classifyEventDate(raw?: string | Date | null): BroadcastLifecycle {
  if (!raw) return 'notice';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return 'notice';
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const diffDays = Math.round((day.getTime() - today.getTime()) / 86400000);
  if (diffDays > 0) return 'upcoming';
  if (diffDays === 0) return 'ongoing';
  return 'completed';
}

function formatEventDate(raw?: string | Date | null): string | undefined {
  if (!raw) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapEvent(ev: ApiEvent): LiveBroadcastItem {
  const lifecycle = classifyEventDate(ev.date);
  const rsvpCount = Array.isArray(ev.rsvps)
    ? ev.rsvps.filter((r: any) => String(r?.status || '').toUpperCase() === 'GOING').length
    : undefined;
  return {
    id: `event-${ev.id}`,
    title: ev.title,
    type: ev.type || 'Event',
    excerpt: ev.description,
    content: ev.description,
    eventDate: formatEventDate(ev.date),
    eventLocation: ev.location,
    department: 'Alumni Relations Office',
    approvedByOfficer: 'Alumni Office',
    registrationCount: rsvpCount,
    lifecycle,
    detailPath: `/events/${ev.slug || ev.id}`,
    source: 'event',
  };
}

function mapContent(item: ContentCardItem): LiveBroadcastItem {
  const isEventish = String(item.type).toLowerCase().includes('event');
  return {
    id: `content-${item.id}`,
    title: item.title,
    type: item.type || 'Announcement',
    excerpt: item.excerpt,
    content: item.content || item.excerpt,
    eventDate: item.publishedAt || item.updatedAt,
    department: 'Alumni Relations Office',
    approvedByOfficer: item.author || 'Alumni Office',
    registrationCount: item.requiresRegistration ? Number(item.registeredCount || 0) : undefined,
    lifecycle: isEventish ? 'upcoming' : 'notice',
    detailPath: `/announcements/${encodeURIComponent(item.id)}`,
    source: 'content',
  };
}

function lifecycleLabel(lifecycle: BroadcastLifecycle): string {
  switch (lifecycle) {
    case 'upcoming':
      return 'Upcoming';
    case 'ongoing':
      return 'Ongoing today';
    case 'completed':
      return 'Completed';
    case 'unpublished':
      return 'Unpublished';
    default:
      return 'Notice';
  }
}

export const DashboardBroadcastHero: React.FC<DashboardBroadcastHeroProps> = ({
  actorRole = 'ALL',
  className = '',
}) => {
  const navigate = useNavigate();
  const [broadcasts, setBroadcasts] = useState<LiveBroadcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalItem, setModalItem] = useState<LiveBroadcastItem | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const refreshBroadcasts = async () => {
    try {
      setLoading(true);
      const [events, content] = await Promise.all([
        eventsService.getAllEvents().catch(() => [] as ApiEvent[]),
        contentService.fetchItemsFromApi().catch(() => [] as ContentCardItem[]),
      ]);

      const eventItems = (events || [])
        .filter((e) => e?.title)
        .map(mapEvent)
        // Prefer upcoming/ongoing before completed; still show completed honestly.
        .sort((a, b) => {
          const rank = { upcoming: 0, ongoing: 1, notice: 2, unpublished: 3, completed: 4 } as const;
          return rank[a.lifecycle] - rank[b.lifecycle];
        });

      const contentItems = (content || [])
        .filter((c) => String(c.status).toLowerCase() === 'published')
        .filter((c) => {
          const t = String(c.type).toLowerCase();
          return t.includes('announcement') || t.includes('event') || Boolean(c.featured) || Boolean(c.pinned);
        })
        .slice(0, 8)
        .map(mapContent);

      // Events first (featured), then published bulletins. No localStorage demo carnival.
      setBroadcasts([...eventItems, ...contentItems]);
      setCurrentIndex(0);
    } catch (err) {
      console.warn('Failed to load live broadcast items:', err);
      setBroadcasts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBroadcasts();
    const handleUpdate = () => refreshBroadcasts();
    window.addEventListener('astu-cms-content-changed', handleUpdate);
    window.addEventListener('astu-broadcast-announcement-updated', handleUpdate);
    window.addEventListener('astu-cms-approval-changed', handleUpdate);
    return () => {
      window.removeEventListener('astu-cms-content-changed', handleUpdate);
      window.removeEventListener('astu-broadcast-announcement-updated', handleUpdate);
      window.removeEventListener('astu-cms-approval-changed', handleUpdate);
    };
  }, [actorRole]);

  const activeItem = useMemo(() => {
    if (!broadcasts.length) return null;
    return broadcasts[currentIndex % broadcasts.length];
  }, [broadcasts, currentIndex]);

  if (isDismissed) return null;

  if (loading) {
    return (
      <div
        className={`h-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 animate-pulse ${className}`}
        aria-hidden
      />
    );
  }

  if (!activeItem) {
    return (
      <div
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 text-xs text-slate-500 ${className}`}
      >
        <Megaphone className="h-3.5 w-3.5 shrink-0" />
        <span>No featured events or published portal bulletins are available right now.</span>
      </div>
    );
  }

  const isEvent = activeItem.source === 'event' || activeItem.lifecycle !== 'notice';
  const hasMultiple = broadcasts.length > 1;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % broadcasts.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + broadcasts.length) % broadcasts.length);
  };

  return (
    <>
      <div
        className={`relative flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/70 dark:bg-slate-900/80 backdrop-blur-sm text-slate-800 dark:text-slate-200 text-xs shadow-2xs transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-800 ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  activeItem.lifecycle === 'completed' ? 'bg-slate-400' : 'bg-emerald-400 animate-ping'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  activeItem.lifecycle === 'completed' ? 'bg-slate-500' : 'bg-emerald-500'
                }`}
              />
            </span>

            {isEvent ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                <Calendar className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                {lifecycleLabel(activeItem.lifecycle)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#003366]/10 text-[#003366] dark:bg-sky-950/60 dark:text-sky-300 border border-[#003366]/20 dark:border-sky-800/80">
                <Megaphone className="h-2.5 w-2.5 text-[#003366] dark:text-sky-400" />
                Notice
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            <span className="font-extrabold text-slate-900 dark:text-white shrink-0 truncate max-w-[40%]">
              {activeItem.title}
            </span>
            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-600 dark:text-slate-300 truncate hidden sm:inline">
              {activeItem.excerpt || activeItem.content}
            </span>
            {activeItem.eventDate && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] shrink-0 hidden md:inline-flex items-center gap-1">
                ({activeItem.eventDate}
                {typeof activeItem.registrationCount === 'number'
                  ? ` · ${activeItem.registrationCount} registered`
                  : ''}
                )
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setModalItem(activeItem)}
            className="inline-flex items-center gap-1 font-bold text-[#003366] dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 hover:underline shrink-0 whitespace-nowrap ml-1 cursor-pointer transition-colors"
          >
            <span>Read details</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-blue-200/60 dark:border-slate-800">
          {hasMultiple && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Previous announcement"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 px-0.5">
                {currentIndex + 1}/{broadcasts.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Next announcement"
                aria-label="Next announcement"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="broadcast-modal-title"
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-5 text-slate-900 dark:text-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-[#003366]/10 dark:bg-sky-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#003366] dark:text-sky-300">
                    {modalItem.type}
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {lifecycleLabel(modalItem.lifecycle)}
                  </span>
                </div>
                <h2 id="broadcast-modal-title" className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {modalItem.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Source</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {modalItem.source === 'event' ? 'Events API' : 'Published CMS content'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Published by</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {modalItem.approvedByOfficer || 'Alumni Office'}
                </p>
              </div>
              {modalItem.eventDate && (
                <div>
                  <span className="text-slate-400 font-medium">Date</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{modalItem.eventDate}</p>
                </div>
              )}
              {modalItem.eventLocation && (
                <div>
                  <span className="text-slate-400 font-medium">Location</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{modalItem.eventLocation}</p>
                </div>
              )}
              {typeof modalItem.registrationCount === 'number' && (
                <div>
                  <span className="text-slate-400 font-medium">Registrations</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{modalItem.registrationCount}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Details</h4>
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                {modalItem.content || modalItem.excerpt || 'No additional details were provided.'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const path = modalItem.detailPath;
                  setModalItem(null);
                  navigate(path);
                }}
                className="px-4 py-2 rounded-xl bg-[#003366] text-white font-bold text-xs hover:bg-[#00264d] transition-colors"
              >
                Open full page
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardBroadcastHero;
