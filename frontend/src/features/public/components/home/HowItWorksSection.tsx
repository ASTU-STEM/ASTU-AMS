import React from "react";
import { ArrowRight } from "lucide-react";
import { HOW_IT_WORKS, SectionShell } from "./homeShared";

interface HowItWorksSectionProps {
  headers?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  onNavigate: (path: string) => void;
}

export default function HowItWorksSection({ headers, onNavigate }: HowItWorksSectionProps) {
  return (
    <SectionShell
      id="how-it-works"
      tone="muted"
      eyebrow={headers?.eyebrow || "Get Started"}
      title={headers?.title || "How ASTU-AMS Works"}
      description={
        headers?.description ||
        "From registration to real impact — three clear steps for alumni, employers, and the university community."
      }
      action={
        <button
          type="button"
          className="home-btn home-btn--navy home-btn--sm shrink-0"
          onClick={() => onNavigate(headers?.ctaLink || "/register")}
        >
          {headers?.ctaText || "Get Started Today"}
          <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {HOW_IT_WORKS.map((item) => (
          <div
            key={item.step}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-astu-navy/25 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50 motion-reduce:transform-none"
          >
            <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-astu-navy text-sm font-bold text-white shadow-sm">
              {item.step}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
