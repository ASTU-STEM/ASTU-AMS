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
      eyebrow={headers?.eyebrow}
      title={headers?.title || "Photo Gallery"}
      description={headers?.subtitle}
      action={
        <ViewAllButton
          label={headers?.buttonText || "View All"}
          visible={images.length > 0}
          onClick={() => onNavigate(viewAllLink)}
        />
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {pageItems.map((item, idx) => {
          const src = resolveMedia(item.src || item.image || item.url);
          return (
            <button
              key={item.id || `gallery-${page}-${idx}`}
              type="button"
              onClick={() => onNavigate(viewAllLink)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800"
            >
              <img
                src={src}
                alt={item.title || item.album || "Campus photo"}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {(item.title || item.album) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-3.5">
                  <p className="truncate text-xs font-semibold text-white">
                    {item.title || item.album}
                  </p>
                </div>
              )}
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
