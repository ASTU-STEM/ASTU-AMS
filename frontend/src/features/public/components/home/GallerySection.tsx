import React, { useMemo } from "react";
import {
  HOME_PREVIEW_COUNT,
  resolveMedia,
  SectionPager,
  SectionShell,
  useSectionPager,
  ViewAllButton,
} from "./homeShared";

export interface HomeGalleryItem {
  id?: string;
  src?: string;
  image?: string;
  url?: string;
  title?: string;
  album?: string;
  createdAt?: string;
  updatedAt?: string;
  date?: string;
  uploadedAt?: string;
}

interface GallerySectionProps {
  images: HomeGalleryItem[];
  headers?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  onNavigate: (path: string) => void;
}

export default function GallerySection({ images, headers, onNavigate }: GallerySectionProps) {
  const ranked = useMemo(
    () =>
      [...images].sort((a, b) => {
        const aTime = Date.parse(a?.createdAt || a?.updatedAt || a?.date || a?.uploadedAt || "");
        const bTime = Date.parse(b?.createdAt || b?.updatedAt || b?.date || b?.uploadedAt || "");
        const aValid = !Number.isNaN(aTime);
        const bValid = !Number.isNaN(bTime);
        if (aValid || bValid) return (bValid ? bTime : 0) - (aValid ? aTime : 0);
        return 0;
      }),
    [images]
  );

  const { pageItems, page, totalPages, goPrev, goNext } = useSectionPager(
    ranked,
    HOME_PREVIEW_COUNT
  );
  const viewAllLink = headers?.buttonLink || "/gallery";

  if (!pageItems.length) return null;

  return (
    <SectionShell
      id="gallery"
      tone="band"
      eyebrow={headers?.eyebrow || "Campus Gallery"}
      title={headers?.title || "Campus Life & Moments"}
      description={
        headers?.subtitle ||
        "A glimpse of life at ASTU — research, innovation, graduation ceremonies, and alumni milestones."
      }
      action={
        <ViewAllButton
          label={headers?.buttonText || "View All"}
          visible={images.length > 0}
          onClick={() => onNavigate(viewAllLink)}
        />
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
        {pageItems.map((item, idx) => {
          const src = resolveMedia(item.src || item.image || item.url);
          const caption = item.title || item.album;
          return (
            <button
              key={item.id || `gallery-${page}-${idx}`}
              type="button"
              onClick={() => onNavigate(viewAllLink)}
              className="home-surface group relative aspect-[4/3] bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 focus-visible:ring-offset-2 dark:bg-slate-800 dark:focus-visible:ring-sky-400/50 motion-reduce:hover:translate-y-0"
            >
              <img
                src={src}
                alt={caption || "Campus photo"}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent opacity-90 transition duration-300 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                {caption ? (
                  <p className="truncate text-base font-semibold text-white">{caption}</p>
                ) : null}
                <span className="mt-1 inline-flex text-xs font-bold uppercase tracking-wider text-amber-300 opacity-0 transition group-hover:opacity-100">
                  Open gallery
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <SectionPager
        page={page}
        totalPages={totalPages}
        onPrev={goPrev}
        onNext={goNext}
        label="photos"
      />
    </SectionShell>
  );
}
