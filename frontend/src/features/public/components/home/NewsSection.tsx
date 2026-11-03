import React from "react";
import { Bell } from "lucide-react";
import { EmptySection, HOME_PREVIEW_COUNT, SectionShell, ViewAllButton } from "./homeShared";

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
  const preview = items.slice(0, HOME_PREVIEW_COUNT);
  const hasMore = items.length > HOME_PREVIEW_COUNT;

  return (
    <SectionShell
      id="news"
      tone="muted"
      eyebrow={headers?.eyebrow || "Official Updates"}
      title={headers?.title || "News & Announcements"}
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
      {!preview.length ? (
        <EmptySection message="No published announcements yet. Check back soon." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {preview.map((item, idx) => (
              <button
                key={item.id || `news-${idx}`}
                type="button"
                onClick={() => onNavigate(item.id ? `/announcements/${item.id}` : "/announcements")}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-astu-navy/35 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <div className="mb-3 flex items-center gap-2 text-astu-red">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {item.type || "Notice"}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                {item.date ? (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(item.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
          {hasMore ? (
            <div className="mt-6 flex justify-center md:hidden">
              <ViewAllButton label="View All Announcements" onClick={() => onNavigate("/announcements")} />
            </div>
          ) : null}
        </>
      )}
    </SectionShell>
  );
}
