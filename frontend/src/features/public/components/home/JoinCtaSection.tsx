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
      id="community"
      className="relative isolate z-0 w-full overflow-x-clip border-b border-slate-200/60 bg-[var(--bg-page)] dark:border-slate-800/80"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-astu-navy via-[#163a66] to-slate-900 px-6 py-12 text-white shadow-lg md:px-10 md:py-14">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-astu-red/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-2xl space-y-4">
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">
              {userName
                ? `Welcome back, ${userName}`
                : cta?.title || "Ready to Join ASTU-AMS?"}
            </h2>
            <p className="text-sm leading-relaxed text-white/85 md:text-base">
              {cta?.description ||
                "Connect with fellow alumni, discover career opportunities, and contribute to university excellence."}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {userName ? (
                <button
                  type="button"
                  className="home-btn home-btn--primary"
                  onClick={() => onNavigate("/alumni/dashboard")}
                >
                  Open Dashboard
                  <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="home-btn home-btn--primary"
                    onClick={() => onNavigate(cta?.primaryCtaLink || "/register")}
                  >
                    <UserPlus className="home-btn__icon" aria-hidden="true" />
                    {cta?.primaryCtaText || "Create Alumni Account"}
                  </button>
                  <button
                    type="button"
                    className="home-btn home-btn--outline-light"
                    onClick={() => onNavigate(cta?.secondaryCtaLink || "/login")}
                  >
                    <LogIn className="home-btn__icon" aria-hidden="true" />
                    {cta?.secondaryCtaText || "Sign In"}
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
