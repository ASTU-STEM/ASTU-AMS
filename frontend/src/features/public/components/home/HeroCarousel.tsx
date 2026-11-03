import React from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Handshake, Users } from "lucide-react";
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
  const brand = liveHeroBadge || "ASTU";
  const supporting =
    activeHero?.description || welcomeMessage || activeHero?.tagline || "";

  return (
    <section className="relative isolate z-0 h-[min(82vh,680px)] min-h-[500px] w-full overflow-hidden bg-slate-950 md:h-[600px] lg:h-[660px]">
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
                className={`h-full w-full object-cover object-center transition-transform duration-[9000ms] ease-out ${
                  active ? "scale-100" : "scale-105"
                }`}
                src={slide.image || DEFAULT_HERO_IMAGE}
                onError={onHeroImageError}
              />
              {/* Multi-layered dark scrim and directional gradient to guarantee 100% legibility */}
              <div className="absolute inset-0 bg-slate-950/65" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/45" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-4 py-12 md:px-8">
        <div className="max-w-2xl rounded-3xl border border-white/15 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-md sm:p-8 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/15 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-300 shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
            <span>{brand}</span>
          </div>

          {activeHero?.tagline ? (
            <p className="mt-3.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-300 drop-shadow-sm md:text-sm">
              {activeHero.tagline}
            </p>
          ) : null}

          <h1 className="mt-3 text-3xl font-black leading-[1.08] tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            {activeHero?.title || "Alumni Management System"}
          </h1>

          {supporting ? (
            <p className="mt-4 max-w-xl text-sm font-normal leading-relaxed text-slate-100 drop-shadow-sm sm:text-base md:text-lg">
              {supporting}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              className="home-btn home-btn--primary home-btn--lg w-full sm:w-auto shadow-lg shadow-blue-900/40"
              onClick={() => onNavigate(primaryLink)}
            >
              <Users className="home-btn__icon" aria-hidden="true" />
              <span>{liveHeroButtons?.primaryText || "Alumni Portal"}</span>
              <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="home-btn home-btn--secondary home-btn--lg w-full sm:w-auto shadow-md"
              onClick={() => onNavigate(secondaryLink)}
            >
              <Handshake className="home-btn__icon" aria-hidden="true" />
              <span>{liveHeroButtons?.secondaryText || "Employer Partnership"}</span>
            </button>
          </div>
        </div>
      </div>

      {displaySlides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={onPrevSlide}
            className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-slate-950/60 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-white/50 hover:bg-[#0759a6] sm:inline-flex md:left-6"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNextSlide}
            className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-slate-950/60 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-white/50 hover:bg-[#0759a6] sm:inline-flex md:right-6"
            aria-label="Next slide"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
        {displaySlides.length > 1 ? (
          <div
            className="flex gap-2 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1.5 backdrop-blur-md shadow-md"
            role="tablist"
            aria-label="Hero slides"
          >
            {displaySlides.map((_, idx) => (
              <button
                type="button"
                key={`dot-${idx}`}
                onClick={() => onSelectSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeSlideIndex
                    ? "w-7 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]"
                    : "w-2 bg-white/40 hover:bg-white/70"
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
              document.getElementById("how-it-works") ||
              document.getElementById("partners") ||
              document.getElementById("news") ||
              document.getElementById("events");
            target?.scrollIntoView({ behavior: "smooth" });
          }}
          className="rounded-full border border-white/15 bg-slate-950/50 p-2 text-white/90 shadow-md backdrop-blur-md transition hover:bg-white/20 hover:text-white animate-bounce motion-reduce:animate-none"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
