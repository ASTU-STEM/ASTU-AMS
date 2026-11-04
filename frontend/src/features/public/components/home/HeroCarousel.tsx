import React from "react";
import { ArrowLeft, ArrowRight, Building2, ChevronDown, GraduationCap } from "lucide-react";
import { DEFAULT_HERO_IMAGE } from "./homeShared";

export interface HeroSlide {
  id?: string;
  image?: string;
  tagline?: string;
  title?: string;
  description?: string;
}

export interface HeroCarouselProps {
  displaySlides: HeroSlide[];
  activeSlideIndex: number;
  activeHero?: HeroSlide;
  liveHeroBadge?: string;
  welcomeMessage?: string;
  liveHeroButtons?: {
    primaryLink?: string;
    primaryText?: string;
    secondaryLink?: string;
    secondaryText?: string;
  };
  onNavigate: (path: string) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onSelectSlide: (index: number) => void;
  onHeroImageError: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default function HeroCarousel({
  displaySlides,
  activeSlideIndex,
  activeHero,
  liveHeroBadge,
  welcomeMessage,
  liveHeroButtons,
  onNavigate,
  onPrevSlide,
  onNextSlide,
  onSelectSlide,
  onHeroImageError,
}: HeroCarouselProps) {
  const primaryLink = liveHeroButtons?.primaryLink || "/register";
  const secondaryLink = liveHeroButtons?.secondaryLink || "/employers";

  return (
    <section className="relative isolate z-0 h-[min(85vh,720px)] min-h-[520px] w-full overflow-hidden bg-slate-950 md:h-[640px] lg:h-[700px]">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {displaySlides.map((slide, idx) => {
          const active = idx === activeSlideIndex;
          return (
            <div
              key={slide.id || `slide-${idx}`}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <img
                alt={slide.title || "ASTU campus"}
                className={`h-full w-full object-cover object-center transition-transform duration-[8000ms] ease-out ${
                  active ? "scale-100" : "scale-105"
                }`}
                src={slide.image || DEFAULT_HERO_IMAGE}
                onError={onHeroImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/25" />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-4 py-16 md:px-8 md:py-20">
        <div className="max-w-3xl space-y-5 md:space-y-6">
          <span className="inline-block rounded-full bg-astu-red px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-astu-red/30">
            {liveHeroBadge || "ASTU-AMS"}
          </span>
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[3.75rem]">
            {activeHero?.title || "Alumni Management System"}
          </h1>
          {(activeHero?.description || welcomeMessage || activeHero?.tagline) ? (
            <p className="max-w-2xl text-base leading-relaxed text-white/90 md:text-lg lg:text-xl">
              {activeHero?.description || welcomeMessage || activeHero?.tagline}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#9B1218] via-astu-red to-rose-500 px-7 py-4 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_32px_-8px_rgba(227,30,36,0.55)] transition-all duration-300 hover:scale-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_40px_-8px_rgba(227,30,36,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] sm:w-auto md:text-base motion-reduce:transition-none motion-reduce:hover:scale-100"
              onClick={() => onNavigate(primaryLink)}
            >
              <GraduationCap className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{liveHeroButtons?.primaryText || "Alumni Portal"}</span>
              <ArrowRight
                className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-slate-950/40 px-7 py-4 text-sm font-bold tracking-wide text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-slate-950/55 hover:shadow-[0_0_28px_-4px_rgba(255,255,255,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] sm:w-auto md:text-base motion-reduce:transition-none motion-reduce:hover:scale-100"
              onClick={() => onNavigate(secondaryLink)}
            >
              <Building2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{liveHeroButtons?.secondaryText || "Employer Partnership"}</span>
              <ArrowRight
                className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {displaySlides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={onPrevSlide}
            className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-slate-950/45 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-white/50 hover:bg-astu-navy sm:inline-flex md:left-5"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNextSlide}
            className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-slate-950/45 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-white/50 hover:bg-astu-navy sm:inline-flex md:right-5"
            aria-label="Next slide"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
        {displaySlides.length > 1 ? (
          <div className="flex gap-2" role="tablist" aria-label="Hero slides">
            {displaySlides.map((_, idx) => (
              <button
                type="button"
                key={`dot-${idx}`}
                onClick={() => onSelectSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeSlideIndex ? "w-7 bg-amber-400" : "w-2.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                aria-selected={idx === activeSlideIndex}
              />
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            const target =
              document.getElementById("impact-numbers") ||
              document.getElementById("news") ||
              document.getElementById("events");
            target?.scrollIntoView({ behavior: "smooth" });
          }}
          className="rounded-full border border-white/20 bg-slate-950/40 p-2 text-white/90 shadow-md backdrop-blur-md transition hover:bg-white/15 animate-bounce motion-reduce:animate-none"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
