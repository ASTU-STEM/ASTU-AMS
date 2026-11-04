import React from "react";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import {
  HOME_PREVIEW_COUNT,
  resolveMedia,
  SectionPager,
  SectionShell,
  useSectionPager,
  ViewAllButton,
} from "./homeShared";

export interface HomeEventItem {
  id: string;
  title: string;
  date: string;
  location?: string;
  image?: string;
  kind?: string;
}

interface EventsSectionProps {
  items: HomeEventItem[];
  headers?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    viewAllText?: string;
    viewAllLink?: string;
  };
  onNavigate: (path: string) => void;
}

export default function EventsSection({ items, headers, onNavigate }: EventsSectionProps) {
  const { pageItems, page, totalPages, goPrev, goNext } = useSectionPager(items, HOME_PREVIEW_COUNT);
  const viewAllLink = headers?.viewAllLink || "/events";

  if (!pageItems.length) return null;

  return (
    <SectionShell
      id="events"
      tone="band"
      eyebrow={headers?.eyebrow || "Campus Calendar"}
      title={headers?.title || "Events & Workshops"}
      description={headers?.description}
      action={
        <ViewAllButton
          label={headers?.viewAllText || "View All"}
          visible={items.length > 0}
          onClick={() => onNavigate(viewAllLink)}
        />
      }
    >
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {pageItems.map((event) => (
          <button
            key={`${event.id}-${page}`}
            type="button"
            onClick={() => onNavigate(`/events/${event.id}`)}
            className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-astu-navy/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-sky-500/40 dark:focus-visible:ring-sky-400/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={resolveMedia(event.image)}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                loading="lazy"
              />
            </div>
            <div className="space-y-2.5 p-5 md:p-6">
              {event.kind ? (
                <span className="text-xs font-bold uppercase tracking-wider text-astu-red">
                  {event.kind}
                </span>
              ) : null}
              <h3 className="line-clamp-2 text-lg font-bold text-slate-900 transition group-hover:text-astu-navy dark:text-white dark:group-hover:text-sky-300">
                {event.title}
              </h3>
              <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{event.date}</span>
              </p>
              {event.location ? (
                <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{event.location}</span>
                </p>
              ) : null}
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-astu-navy dark:text-sky-300">
                View details
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </div>
          </button>
        ))}
      </div>
      <SectionPager
        page={page}
        totalPages={totalPages}
        onPrev={goPrev}
        onNext={goNext}
        label="events"
      />
    </SectionShell>
  );
}
