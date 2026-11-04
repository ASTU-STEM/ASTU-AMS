import React, { useMemo } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CircleUserRound,
  FileCheck2,
  Handshake,
  LineChart,
  LockKeyhole,
  Search,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  HOME_PREVIEW_COUNT,
  SectionPager,
  SectionShell,
  useSectionPager,
  ViewAllButton,
} from "./homeShared";

const PORTAL_ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Building2,
  Briefcase,
  LineChart,
  FileCheck2,
  LockKeyhole,
  Handshake,
  ShieldCheck,
  CircleUserRound,
  Search,
  Alumni: Users,
  Employers: Briefcase,
  Departments: LineChart,
  Registrar: FileCheck2,
  Administrator: LockKeyhole,
};

const PORTAL_ACCENTS = [
  "bg-astu-navy/10 text-astu-navy dark:bg-sky-500/15 dark:text-sky-300",
  "bg-astu-red/10 text-astu-red dark:bg-rose-500/15 dark:text-rose-300",
  "bg-astu-green/10 text-astu-green dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
];

export interface HowItWorksPortal {
  id?: string;
  title?: string;
  description?: string;
  points?: string[];
  active?: boolean;
  step?: number;
  icon?: string;
  iconBg?: string;
  cta?: string;
  route?: string;
}

interface HowItWorksSectionProps {
  headers?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  portals?: HowItWorksPortal[];
  onNavigate: (path: string) => void;
}

function resolveIcon(portal: HowItWorksPortal, index: number): LucideIcon {
  const key = String(portal.icon || portal.title || "").trim();
  if (key && PORTAL_ICON_MAP[key]) return PORTAL_ICON_MAP[key];
  const fallbacks: LucideIcon[] = [Users, Briefcase, LineChart, FileCheck2, LockKeyhole];
  return fallbacks[index % fallbacks.length];
}

export default function HowItWorksSection({
  headers,
  portals,
  onNavigate,
}: HowItWorksSectionProps) {
  const cards = useMemo(
    () =>
      (portals || [])
        .filter((p) => p && p.active !== false && p.title)
        .map((p, idx) => ({
          id: p.id || `portal-${idx}`,
          step: p.step || idx + 1,
          title: String(p.title),
          description:
            p.description ||
            (Array.isArray(p.points) && p.points.length ? p.points[0] : "") ||
            "",
          points: Array.isArray(p.points) ? p.points.slice(0, 2) : [],
          cta: p.cta || "Open portal",
          route: p.route || "/register",
          icon: p.icon,
          iconBg: p.iconBg || PORTAL_ACCENTS[idx % PORTAL_ACCENTS.length],
        }))
        .sort((a, b) => a.step - b.step),
    [portals]
  );

  const { pageItems, page, totalPages, goPrev, goNext } = useSectionPager(
    cards,
    HOME_PREVIEW_COUNT
  );

  if (!pageItems.length) return null;

  const viewAllLink = headers?.ctaLink || "/about";
  const viewAllLabel = headers?.ctaText || "View All";

  return (
    <SectionShell
      id="how-it-works"
      tone="muted"
      eyebrow={headers?.eyebrow || "Get Started"}
      title={headers?.title || "How ASTU-AMS Works"}
      description={
        headers?.description ||
        "From registration to real impact — here is how our platform empowers alumni, employers, and the university community in four simple steps."
      }
      action={
        <ViewAllButton
          label={viewAllLabel}
          visible={cards.length > 0}
          onClick={() => onNavigate(viewAllLink)}
        />
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
        {pageItems.map((item, idx) => {
          const Icon = resolveIcon(item, page * HOME_PREVIEW_COUNT + idx);
          const stepNum = String(item.step).padStart(2, "0");
          return (
            <article
              key={`${item.id}-${page}`}
              className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-astu-navy/30 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-sky-500/40 md:p-7 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div>
                <div className="mb-5 flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold tracking-[0.22em] text-astu-red">
                    {stepNum}
                  </span>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg} transition duration-300 group-hover:scale-105`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white md:text-xl">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-[0.95rem]">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onNavigate(item.route)}
                className="group/btn mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-astu-navy transition-all duration-300 hover:border-astu-navy hover:bg-astu-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 dark:border-slate-600 dark:bg-slate-800/60 dark:text-sky-300 dark:hover:border-sky-500 dark:hover:bg-sky-600 dark:hover:text-white"
              >
                <span>{item.cta}</span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </article>
          );
        })}
      </div>
      <SectionPager
        page={page}
        totalPages={totalPages}
        onPrev={goPrev}
        onNext={goNext}
        label="portals"
      />
    </SectionShell>
  );
}
