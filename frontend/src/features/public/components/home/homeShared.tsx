import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  MessageSquareText,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import config from "../../../../config";
import astuBuildingImg from "../../../../assets/imgs/astu-building.jpg";

const { mediaUrl } = config;

/** Homepage list previews always show at most 3 items; prev/next pages the rest. */
export const HOME_PREVIEW_COUNT = 3;

export const FALLBACK_IMAGE = "/images/fallback-campus.svg";
export const DEFAULT_HERO_IMAGE = astuBuildingImg;

export const ViewAllButton = ({
  label = "View All",
  onClick,
  visible = true,
}: {
  label?: string;
  onClick: () => void;
  visible?: boolean;
}) => {
  if (!visible) return null;
  return (
    <button
      type="button"
      className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-astu-navy shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-astu-navy/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-sky-300 dark:hover:border-sky-500/50 motion-reduce:transition-none"
      onClick={onClick}
    >
      <span>{label}</span>
      <ArrowRight
        className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </button>
  );
};

/** Paginate any homepage list to exactly HOME_PREVIEW_COUNT items with prev/next. */
export function useSectionPager<T>(items: T[], pageSize = HOME_PREVIEW_COUNT) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(Math.max(items.length, 0) / pageSize));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages, items.length]);

  const pageItems = useMemo(() => {
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    totalPages,
    pageItems,
    hasPager: items.length > pageSize,
    goPrev: () => setPage((p) => (p - 1 + totalPages) % totalPages),
    goNext: () => setPage((p) => (p + 1) % totalPages),
  };
}

export const SectionPager = ({
  page,
  totalPages,
  onPrev,
  onNext,
  label = "items",
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  label?: string;
}) => {
  if (totalPages <= 1) return null;
  return (
    <div
      className="mt-10 flex items-center justify-center gap-3"
      role="navigation"
      aria-label={`${label} pagination`}
    >
      <button
        type="button"
        onClick={onPrev}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-astu-navy shadow-sm transition duration-300 hover:border-astu-navy hover:bg-astu-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 dark:border-slate-600 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white"
        aria-label={`Previous ${label}`}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-[4.5rem] text-center text-sm font-bold tabular-nums tracking-wide text-slate-500 dark:text-slate-400">
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-astu-navy shadow-sm transition duration-300 hover:border-astu-navy hover:bg-astu-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 dark:border-slate-600 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white"
        aria-label={`Next ${label}`}
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

function useSectionReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export const SectionShell = ({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
  className = "",
  tone = "plain",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tone?: "plain" | "muted" | "band";
}) => {
  const { ref, visible } = useSectionReveal<HTMLElement>();
  const toneClass =
    tone === "muted"
      ? "bg-slate-50 dark:bg-slate-950/50"
      : tone === "band"
        ? "bg-white dark:bg-slate-900/30"
        : "bg-[var(--bg-page)]";

  return (
    <section
      ref={ref}
      id={id}
      className={`relative isolate z-0 clear-both w-full overflow-x-clip border-b border-slate-200/60 dark:border-slate-800/80 ${toneClass} ${className}`}
    >
      <div
        className={`relative z-0 mx-auto w-full max-w-[1440px] px-4 py-16 transition duration-700 ease-out md:px-8 md:py-20 lg:py-24 motion-reduce:transition-none ${
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-astu-red">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              {title}
            </h2>
            {description ? (
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
};

export const resolveMedia = (raw?: string | null, fallback = FALLBACK_IMAGE) =>
  mediaUrl(raw) || raw || fallback;

export const getHomeCampaignImage = (campaign: { image?: string | null }) => {
  if (campaign?.image && typeof campaign.image === "string" && campaign.image.trim() !== "") {
    return mediaUrl(campaign.image) || campaign.image;
  }
  return DEFAULT_HERO_IMAGE;
};

export const partnerMonogram = (name?: string) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "ASTU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

export const STAT_PRESENTATION: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string }>; accent: string }
> = {
  alumni: {
    label: "Active Alumni",
    Icon: Users,
    accent: "text-astu-navy bg-astu-navy/10 dark:text-sky-400 dark:bg-sky-500/15",
  },
  employers: {
    label: "Verified Employers",
    Icon: Building2,
    accent: "text-astu-green bg-astu-green/10 dark:text-emerald-400 dark:bg-emerald-500/15",
  },
  jobs: {
    label: "Open Roles",
    Icon: Briefcase,
    accent: "text-astu-red bg-astu-red/10 dark:text-rose-400 dark:bg-rose-500/15",
  },
  departments: {
    label: "Departments",
    Icon: Trophy,
    accent: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/15",
  },
  events: {
    label: "Events",
    Icon: CalendarDays,
    accent: "text-sky-600 bg-sky-500/10 dark:text-sky-300 dark:bg-sky-500/15",
  },
  verified: {
    label: "Verified Profiles",
    Icon: ShieldCheck,
    accent: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-500/15",
  },
  employment: {
    label: "Employment Rate",
    Icon: TrendingUp,
    accent: "text-astu-navy bg-astu-navy/10 dark:text-sky-400 dark:bg-sky-500/15",
  },
  requests: {
    label: "Service Requests",
    Icon: MessageSquareText,
    accent: "text-rose-600 bg-rose-500/10 dark:text-rose-300 dark:bg-rose-500/15",
  },
};

