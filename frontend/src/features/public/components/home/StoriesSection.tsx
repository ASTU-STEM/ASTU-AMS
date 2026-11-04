import React from "react";
import { Quote } from "lucide-react";
import {
  HOME_PREVIEW_COUNT,
  resolveMedia,
  SectionPager,
  SectionShell,
  useSectionPager,
  ViewAllButton,
} from "./homeShared";

export interface HomeStory {
  id: string;
  name: string;
  role?: string;
  company?: string;
  quote?: string;
  text?: string;
  image?: string;
  graduationYear?: string | number;
}

interface StoriesSectionProps {
  stories: HomeStory[];
  headers?: { eyebrow?: string; title?: string; description?: string };
  onNavigate: (path: string) => void;
}

export default function StoriesSection({ stories, headers, onNavigate }: StoriesSectionProps) {
  const { pageItems, page, totalPages, goPrev, goNext } = useSectionPager(
    stories,
    HOME_PREVIEW_COUNT
  );

  if (!pageItems.length) return null;

  return (
    <SectionShell
      id="success-stories"
      tone="muted"
      eyebrow={headers?.eyebrow || "Alumni Voices"}
      title={headers?.title || "Alumni Success Stories"}
      description={headers?.description}
      action={
        <ViewAllButton
          label="View All"
          visible={stories.length > 0}
          onClick={() => onNavigate("/community")}
        />
      }
    >
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {pageItems.map((story) => (
          <button
            key={`${story.id}-${page}`}
            type="button"
            onClick={() => onNavigate(`/stories/${story.id}`)}
            className="group rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-astu-navy/30 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-sky-500/40 dark:hover:bg-slate-900 md:p-7 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="mb-5 flex items-center gap-3.5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                {story.image ? (
                  <img
                    src={resolveMedia(story.image)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-base font-bold text-astu-navy dark:text-sky-300">
                    {(story.name || "A").slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-900 dark:text-white md:text-lg">
                  {story.name}
                </h3>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {[
                    story.role,
                    story.company,
                    story.graduationYear ? `Class of ${story.graduationYear}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            {story.quote || story.text ? (
              <p className="line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-[0.95rem]">
                <Quote className="mb-0.5 mr-1 inline h-4 w-4 text-astu-red" aria-hidden="true" />
                {story.quote || story.text}
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
        label="stories"
      />
    </SectionShell>
  );
}
