import React from "react";
import { Quote } from "lucide-react";
import { EmptySection, HOME_PREVIEW_COUNT, resolveMedia, SectionShell, ViewAllButton } from "./homeShared";

export interface HomeStory {
  id: string;
  name: string;
  role?: string;
  company?: string;
  quote?: string;
  image?: string;
  graduationYear?: string | number;
}

interface StoriesSectionProps {
  stories: HomeStory[];
  headers?: { eyebrow?: string; title?: string; description?: string };
  onNavigate: (path: string) => void;
}

export default function StoriesSection({ stories, headers, onNavigate }: StoriesSectionProps) {
  const preview = stories.slice(0, HOME_PREVIEW_COUNT);

  return (
    <SectionShell
      id="success-stories"
      tone="muted"
      eyebrow={headers?.eyebrow || "Success Stories"}
      title={headers?.title || "Alumni Success Stories"}
      description={
        headers?.description ||
        "Journeys of ASTU graduates building careers across industry, research, and entrepreneurship."
      }
      action={
        <ViewAllButton
          label="View All"
          visible={stories.length > 0}
          onClick={() => onNavigate("/community")}
        />
      }
    >
      {!preview.length ? (
        <EmptySection message="Featured alumni stories will appear here once published by the Alumni Office." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {preview.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => onNavigate(`/stories/${story.id}`)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-astu-navy/30 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/50 motion-reduce:transform-none"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  {story.image ? (
                    <img
                      src={resolveMedia(story.image)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-astu-navy">
                      {(story.name || "A").slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900 dark:text-white">{story.name}</h3>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {[story.role, story.company].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {story.quote ? (
                <p className="line-clamp-3 text-sm italic text-slate-600 dark:text-slate-300">
                  <Quote className="mb-1 inline h-3.5 w-3.5 text-astu-red" aria-hidden="true" />{" "}
                  {story.quote}
                </p>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
