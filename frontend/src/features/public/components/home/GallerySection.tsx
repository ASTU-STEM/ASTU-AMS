import React from "react";
import {
  EmptySection,
  HOME_PREVIEW_COUNT,
  resolveMedia,
  SectionShell,
  ViewAllButton,
} from "./homeShared";

export interface HomeGalleryItem {
  id?: string;
  src?: string;
  image?: string;
  url?: string;
  title?: string;
  album?: string;
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
  const preview = images.slice(0, HOME_PREVIEW_COUNT);
  const viewAllLink = headers?.buttonLink || "/gallery";

  return (
    <SectionShell
      id="gallery"
      tone="band"
      eyebrow={headers?.eyebrow || "Campus Moments"}
      title={headers?.title || "Photo Gallery"}
      description={
        headers?.subtitle ||
        "Graduation stages, research exhibitions, and campus life at ASTU."
      }
      action={
        <ViewAllButton
          label={headers?.buttonText || "View Full Gallery"}
          visible={images.length > 0}
          onClick={() => onNavigate(viewAllLink)}
        />
      }
    >
      {!preview.length ? (
        <EmptySection message="Gallery photos will appear here once published in the media library." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {preview.map((item, idx) => {
            const src = resolveMedia(item.src || item.image || item.url);
            return (
              <button
                key={item.id || `gallery-${idx}`}
                type="button"
                onClick={() => onNavigate(viewAllLink)}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800 motion-reduce:transform-none"
              >
                <img
                  src={src}
                  alt={item.title || item.album || "Campus photo"}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {(item.title || item.album) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent p-3">
                    <p className="truncate text-xs font-semibold text-white">
                      {item.title || item.album}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
