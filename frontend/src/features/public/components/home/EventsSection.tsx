import React from "react";
import { CalendarDays, MapPin } from "lucide-react";
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
      eyebrow={headers?.eyebrow}
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
      <div className="grid gap-5 md:grid-cols-3">
        {pageItems.map((event) => (
          <button
            key={`${event.id}-${page}`}
            type="button"
            onClick={() => onNavigate(`/events/${event.id}`)}
            className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-astu-navy/25 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-sky-500/40"
          >
            <div className="aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={resolveMedia(event.image)}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-2 p-4">
              {event.kind ? (
                <span className="text-[11px] font-bold uppercase tracking-wider text-astu-red">
                  {event.kind}
                </span>
              ) : null}
              <h3 className="line-clamp-2 text-base font-bold text-slate-900 dark:text-white">
                {event.title}
              </h3>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{event.date}</span>
              </p>
              {event.location ? (
                <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{event.location}</span>
                </p>
              ) : null}
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
