import React from "react";
import { ArrowRight, Building2, GraduationCap, LayoutDashboard } from "lucide-react";

interface JoinCtaSectionProps {
  userName?: string | null;
  cta?: {
    enabled?: boolean;
    title?: string;
    description?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
  } | null;
  onNavigate: (path: string) => void;
}

export default function JoinCtaSection({ userName, cta, onNavigate }: JoinCtaSectionProps) {
  if (cta?.enabled === false) return null;

  return (
    <section
      id="join-cta"
      className="relative isolate z-0 w-full overflow-x-clip border-b border-slate-200/60 bg-[var(--bg-page)] dark:border-slate-800/80"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-20 lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#003366] via-[#0759a6] to-slate-900 px-6 py-12 text-white shadow-2xl md:px-12 md:py-16 lg:px-16">
          <div
            className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-astu-red/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(255,255,255,0.06),_transparent_50%)]"
            aria-hidden="true"
          />
          <div className="relative max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>ASTU</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl">
              {userName
                ? `Welcome back, ${userName}`
                : cta?.title || "Ready to Join the ASTU Network?"}
            </h2>
            {cta?.description || !userName ? (
              <p className="max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                {cta?.description ||
                  "Connect with fellow alumni, discover career opportunities, and contribute to university excellence."}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              {userName ? (
                <button
                  type="button"
                  className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#9B1218] via-astu-red to-rose-500 px-7 py-3.5 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_28px_-8px_rgba(227,30,36,0.55)] transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto md:text-base motion-reduce:transition-none motion-reduce:hover:scale-100"
                  onClick={() => onNavigate("/alumni/dashboard")}
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Open Dashboard</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#9B1218] via-astu-red to-rose-500 px-7 py-3.5 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_28px_-8px_rgba(227,30,36,0.55)] transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto md:text-base motion-reduce:transition-none motion-reduce:hover:scale-100"
                    onClick={() => onNavigate(cta?.primaryCtaLink || "/register")}
                  >
                    <GraduationCap className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{cta?.primaryCtaText || "Alumni Portal"}</span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto md:text-base motion-reduce:transition-none motion-reduce:hover:scale-100"
                    onClick={() => onNavigate(cta?.secondaryCtaLink || "/employers")}
                  >
                    <Building2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{cta?.secondaryCtaText || "Employer Partnership"}</span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
