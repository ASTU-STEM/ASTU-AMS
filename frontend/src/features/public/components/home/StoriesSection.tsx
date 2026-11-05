import React from "react";
import { ArrowRight, Quote } from "lucide-react";
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
            className="home-surface group flex h-full flex-col p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-400/50 md:p-7 motion-reduce:hover:translate-y-0"
          >
            <div className="mb-5 flex items-center gap-3.5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-100 transition group-hover:ring-astu-navy/30 dark:bg-slate-800 dark:ring-slate-700">
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
              <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-[0.95rem]">
                <Quote className="mb-0.5 mr-1 inline h-4 w-4 text-astu-red" aria-hidden="true" />
                {story.quote || story.text}
              </p>
            ) : null}
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-astu-navy dark:text-sky-300">
              Read story
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
        label="stories"
      />
    </SectionShell>
  );
}
