import React from "react";
import { ArrowRight, Bell } from "lucide-react";
import {
  HOME_PREVIEW_COUNT,
  SectionPager,
  SectionShell,
  useSectionPager,
  ViewAllButton,
} from "./homeShared";

export interface NewsItem {
  id?: string;
  title: string;
  date?: string;
  excerpt?: string;
  type?: string;
}

interface NewsSectionProps {
  items: NewsItem[];
  headers?: { eyebrow?: string; title?: string; description?: string };
  onNavigate: (path: string) => void;
}

function formatNewsDate(raw?: string) {
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? raw
    : parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export default function NewsSection({ items, headers, onNavigate }: NewsSectionProps) {
  const { pageItems, page, totalPages, goPrev, goNext } = useSectionPager(items, HOME_PREVIEW_COUNT);

  if (!pageItems.length) return null;

  return (
    <SectionShell
      id="news"
      tone="band"
      eyebrow={headers?.eyebrow || "Campus News"}
      title={headers?.title || "Latest ASTU Highlights"}
      description={
        headers?.description ||
        "University notices, academic bulletins, and alumni community circulars."
      }
      action={
        <ViewAllButton
          label="View All"
          visible={items.length > 0}
          onClick={() => onNavigate("/announcements")}
        />
      }
    >
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {pageItems.map((item, idx) => (
          <button
            key={item.id || `news-${page}-${idx}`}
            type="button"
            onClick={() => onNavigate(item.id ? `/announcements/${item.id}` : "/announcements")}
            className="home-surface group flex h-full flex-col p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-400/50 md:p-7 motion-reduce:hover:translate-y-0"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-astu-red">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-astu-red/10">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {item.type || "Notice"}
                </span>
              </div>
              {item.date ? (
                <time className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {formatNewsDate(item.date)}
                </time>
              ) : null}
            </div>
            <h3 className="line-clamp-2 text-lg font-bold text-slate-900 transition group-hover:text-astu-navy dark:text-white dark:group-hover:text-sky-300 md:text-xl">
              {item.title}
            </h3>
            {item.excerpt ? (
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {item.excerpt}
              </p>
            ) : null}
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-astu-navy dark:text-sky-300">
              Read notice
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </button>
        ))}
      </div>
      <SectionPager
        page={page}
        totalPages={totalPages}
        onPrev={goPrev}
        onNext={goNext}
        label="news"
      />
    </SectionShell>
  );
}
