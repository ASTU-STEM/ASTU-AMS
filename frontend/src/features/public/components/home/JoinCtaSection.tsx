import React from "react";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";

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
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-astu-navy via-[#163a66] to-slate-900 px-6 py-12 text-white md:px-10 md:py-16">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-astu-red/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-2xl space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300/90">
              ASTU
            </p>
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">
              {userName
                ? `Welcome back, ${userName}`
                : cta?.title || "Ready to Join the ASTU Network?"}
            </h2>
            {cta?.description || !userName ? (
              <p className="text-sm leading-relaxed text-white/85 md:text-base">
                {cta?.description ||
                  "Join the ASTU alumni network for careers, mentorship, and university services."}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:flex-wrap sm:items-center">
              {userName ? (
                <button
                  type="button"
                  className="home-btn home-btn--primary home-btn--lg w-full sm:w-auto"
                  onClick={() => onNavigate("/alumni/dashboard")}
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="home-btn home-btn--primary home-btn--lg w-full sm:w-auto"
                    onClick={() => onNavigate(cta?.primaryCtaLink || "/register")}
                  >
                    <UserPlus className="home-btn__icon" aria-hidden="true" />
                    <span>{cta?.primaryCtaText || "Alumni Portal"}</span>
                  </button>
                  <button
                    type="button"
                    className="home-btn home-btn--outline-light home-btn--lg w-full sm:w-auto"
                    onClick={() => onNavigate(cta?.secondaryCtaLink || "/employers")}
                  >
                    <LogIn className="home-btn__icon" aria-hidden="true" />
                    <span>{cta?.secondaryCtaText || "Employer Partnership"}</span>
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
