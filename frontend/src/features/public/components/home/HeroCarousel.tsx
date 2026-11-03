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

  return (
    <section className="relative isolate z-0 h-[min(72vh,560px)] min-h-[420px] w-full overflow-hidden bg-slate-950 md:h-[520px] lg:h-[560px]">
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
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20" />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-4 py-12 md:px-8">
        <div className="max-w-2xl space-y-4">
          <span className="inline-block rounded-full bg-astu-red px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg">
            {activeHero?.tagline || liveHeroBadge || "ASTU-AMS"}
          </span>
          <h1 className="text-3xl font-black leading-[1.15] tracking-tight text-white drop-shadow-sm md:text-4xl lg:text-5xl">
            {activeHero?.title || "Alumni Management System"}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/90 md:text-base">
            {activeHero?.description ||
              welcomeMessage ||
              "Connecting ASTU graduates, employers, and academic departments through verified career and alumni services."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="home-btn home-btn--primary"
              onClick={() => onNavigate(primaryLink)}
            >
              <Users className="home-btn__icon" aria-hidden="true" />
              {liveHeroButtons?.primaryText || "Join Alumni Network"}
              <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="home-btn home-btn--secondary"
              onClick={() => onNavigate(secondaryLink)}
            >
              {liveHeroButtons?.secondaryText || "Explore Portals"}
              <Handshake className="home-btn__icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {displaySlides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={onPrevSlide}
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-astu-navy/80 sm:block"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNextSlide}
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-astu-navy/80 sm:block"
            aria-label="Next slide"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
        {displaySlides.length > 1 ? (
          <div className="flex gap-2" role="tablist" aria-label="Hero slides">
            {displaySlides.map((_, idx) => (
              <button
                type="button"
                key={`dot-${idx}`}
                onClick={() => onSelectSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeSlideIndex ? "w-6 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/60"
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
          className="text-white/90 animate-bounce motion-reduce:animate-none"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
