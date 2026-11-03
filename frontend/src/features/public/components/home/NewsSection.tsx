import React from "react";
import { Bell } from "lucide-react";
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

export default function NewsSection({ items, headers, onNavigate }: NewsSectionProps) {
  const { pageItems, page, totalPages, goPrev, goNext } = useSectionPager(items, HOME_PREVIEW_COUNT);

  if (!pageItems.length) return null;

  return (
    <SectionShell
      id="news"
      tone="muted"
      eyebrow={headers?.eyebrow}
      title={headers?.title || "News & Announcements"}
      description={headers?.description}
      action={
        <ViewAllButton
          label="View All"
          visible={items.length > 0}
          onClick={() => onNavigate("/announcements")}
        />
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        {pageItems.map((item, idx) => (
          <button
            key={item.id || `news-${page}-${idx}`}
            type="button"
            onClick={() => onNavigate(item.id ? `/announcements/${item.id}` : "/announcements")}
            className="group rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-astu-navy/25 hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-sky-500/40 dark:hover:bg-slate-900"
          >
            <div className="mb-3 flex items-center gap-2 text-astu-red">
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {item.type || "Notice"}
              </span>
            </div>
            <h3 className="line-clamp-2 text-base font-bold text-slate-900 dark:text-white">
              {item.title}
            </h3>
            {item.date ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {(() => {
                  const parsed = new Date(item.date);
                  return Number.isNaN(parsed.getTime())
                    ? item.date
                    : parsed.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                })()}
              </p>
            ) : null}
            {item.excerpt ? (
              <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                {item.excerpt}
              </p>
            ) : null}
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
