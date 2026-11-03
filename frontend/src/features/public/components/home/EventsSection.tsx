import React from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { EmptySection, HOME_PREVIEW_COUNT, resolveMedia, SectionShell, ViewAllButton } from "./homeShared";

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
  const preview = items.slice(0, HOME_PREVIEW_COUNT);
  const viewAllLink = headers?.viewAllLink || "/events";
  const viewAllText = headers?.viewAllText || "View All Events";

  return (
    <SectionShell
      id="events"
      tone="band"
      eyebrow={headers?.eyebrow || "Events & Workshops"}
      title={headers?.title || "Upcoming Gatherings"}
      description={
        headers?.description ||
        "Career expos, technical workshops, and alumni reunions across ASTU."
      }
      action={
        <ViewAllButton
          label={viewAllText}
          visible={items.length > 0}
          onClick={() => onNavigate(viewAllLink)}
        />
      }
    >
      {!preview.length ? (
        <EmptySection message="No published events right now. New sessions will appear here once scheduled." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {preview.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onNavigate(`/events/${event.id}`)}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left hover:border-astu-navy/30 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className="aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={resolveMedia(event.image)}
                  alt=""
                  className="h-full w-full object-cover"
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
      )}
    </SectionShell>
  );
}
