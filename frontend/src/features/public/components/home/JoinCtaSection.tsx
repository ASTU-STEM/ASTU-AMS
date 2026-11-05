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
      className="home-join-band relative isolate z-0 w-full overflow-x-clip border-b border-astu-navy/40"
    >
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-20 lg:py-24">
        <div className="relative max-w-3xl space-y-5 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">
            Adama Science and Technology University
          </p>
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
          <div className="flex flex-wrap items-center gap-3 pt-2 sm:gap-4">
            {userName ? (
              <button
                type="button"
                className="home-btn home-btn--accent home-btn--lg group w-full sm:w-auto"
                onClick={() => onNavigate("/alumni/dashboard")}
              >
                <LayoutDashboard className="home-btn__icon" aria-hidden="true" />
                <span>Open Dashboard</span>
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="home-btn home-btn--accent home-btn--lg group w-full sm:w-auto"
                  onClick={() => onNavigate(cta?.primaryCtaLink || "/register")}
                >
                  <GraduationCap className="home-btn__icon" aria-hidden="true" />
                  <span>{cta?.primaryCtaText || "Alumni Portal"}</span>
                  <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="home-btn home-btn--secondary home-btn--lg group w-full sm:w-auto"
                  onClick={() => onNavigate(cta?.secondaryCtaLink || "/employers")}
                >
                  <Building2 className="home-btn__icon" aria-hidden="true" />
                  <span>{cta?.secondaryCtaText || "Employer Partnership"}</span>
                  <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
