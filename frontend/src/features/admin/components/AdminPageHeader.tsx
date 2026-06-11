import React from "react";
import {
  Activity,
  ChevronRight,
  Home,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { AdminPageHeaderProps } from "../types/admin.types";

export default function AdminPageHeader({
  title,
  subtitle,
  breadcrumb = [],
  breadcrumbs = [],
  actions,
  className = "",
}: AdminPageHeaderProps) {
  const items = breadcrumbs.length > 0 ? breadcrumbs : breadcrumb;
  const sectionLabel = items.length > 0 ? items[items.length - 1].label : title;
  const areaLabel =
    items.find((item) => item.label.toLowerCase() !== "admin")?.label ??
    "Admin";

  return (
    <section
      className={`relative w-full overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-r from-astu-navy via-[#0f4f86] to-astu-green p-4 md:py-4 md:px-5 text-white shadow-md ${className}`}
    >
      <div className="absolute -right-20 -top-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 left-8 h-40 w-40 rounded-full bg-[#FFD700]/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          {items.length > 0 && (
            <nav
              className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-white/70"
              aria-label="Breadcrumb"
            >
              <a
                href="/admin/dashboard"
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Home className="h-3 w-3" />
                <span>Admin</span>
              </a>
              {items.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <ChevronRight className="h-3 w-3 text-white/40" />
                  {item.href ? (
                    <a
                      href={item.href}
                      className="rounded-full px-2 py-0.5 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-white">
                      {item.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
              <Sparkles className="h-3 w-3 text-[#FFD700]" />
              Welcome to {areaLabel} workspace
            </div>
            <h1 className="text-xl font-bold tracking-tight leading-tight md:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-white/80">
                {subtitle}
              </p>
            )}
          </div>

          <div className="grid max-w-md gap-2 pt-0.5 sm:grid-cols-3">
            <div className="rounded-[10px] border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                <ShieldCheck className="h-3 w-3 text-emerald-300" />
                Access
              </div>
              <p className="mt-0.5 text-xs font-semibold text-white">
                Admin controlled
              </p>
            </div>
            <div className="rounded-[10px] border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                <Activity className="h-3 w-3 text-[#FFD700]" />
                Focus
              </div>
              <p className="mt-0.5 truncate text-xs font-semibold text-white">
                {sectionLabel}
              </p>
            </div>
            <div className="rounded-[10px] border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.75)]" />
                Status
              </div>
              <p className="mt-0.5 text-xs font-semibold text-white">
                Ready for review
              </p>
            </div>
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2 rounded-[12px] border border-white/10 bg-white/10 p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
