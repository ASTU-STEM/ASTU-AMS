import React, { useEffect, useRef } from "react";
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
  const brandSignal =
    liveHeroBadge && liveHeroBadge.trim() && liveHeroBadge.trim().toUpperCase() !== "ASTU"
      ? liveHeroBadge.trim()
      : "Adama Science and Technology University";

  const onPrevRef = useRef(onPrevSlide);
  const onNextRef = useRef(onNextSlide);
  onPrevRef.current = onPrevSlide;
  onNextRef.current = onNextSlide;

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrevRef.current();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNextRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [displaySlides.length]);

  const supporting =
    activeHero?.description || welcomeMessage || activeHero?.tagline || "";

  return (
    <section
      className="relative isolate z-0 h-[min(100svh,820px)] min-h-[580px] w-full overflow-hidden bg-slate-950 md:min-h-[640px]"
      aria-roledescription="carousel"
      aria-label="ASTU homepage highlights"
    >
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
                alt=""
                className={`h-full w-full object-cover object-center motion-reduce:animate-none ${
                  active ? "home-hero__kenburns" : "scale-105"
                }`}
                src={slide.image || DEFAULT_HERO_IMAGE}
                onError={onHeroImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/58 to-slate-950/25" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/35" />
              <div
                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-astu-red/20 to-transparent"
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-4 py-20 md:px-8 md:py-24">
        <div key={activeSlideIndex} className="home-hero__copy max-w-3xl space-y-5 md:space-y-6">
          <p className="home-hero__brand">{brandSignal}</p>
          <h1 className="home-hero__headline">
            {activeHero?.title || "Alumni Management System"}
          </h1>
          {supporting ? (
            <p className="max-w-2xl text-base leading-relaxed text-white/88 md:text-lg lg:text-xl">
              {supporting}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-1 sm:gap-4">
            <button
              type="button"
              className="home-btn home-btn--accent home-btn--lg group w-full sm:w-auto"
              onClick={() => onNavigate(primaryLink)}
            >
              <GraduationCap className="home-btn__icon" aria-hidden="true" />
              <span>{liveHeroButtons?.primaryText || "Alumni Portal"}</span>
              <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="home-btn home-btn--secondary home-btn--lg group w-full sm:w-auto"
              onClick={() => onNavigate(secondaryLink)}
            >
              <Building2 className="home-btn__icon" aria-hidden="true" />
              <span>{liveHeroButtons?.secondaryText || "Employer Partnership"}</span>
              <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {displaySlides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={onPrevSlide}
            className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-slate-950/45 text-white shadow-lg backdrop-blur-md transition hover:border-white/50 hover:bg-astu-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:inline-flex md:left-5"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNextSlide}
            className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-slate-950/45 text-white shadow-lg backdrop-blur-md transition hover:border-white/50 hover:bg-astu-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:inline-flex md:right-5"
            aria-label="Next slide"
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
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
                role="tab"
                onClick={() => onSelectSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                  idx === activeSlideIndex
                    ? "w-8 bg-amber-400"
                    : "w-2 bg-white/40 hover:bg-white/65"
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
              document.getElementById("news") ||
              document.getElementById("events");
            target?.scrollIntoView({ behavior: "smooth" });
          }}
          className="rounded-full border border-white/20 bg-slate-950/40 p-2 text-white/90 shadow-md backdrop-blur-md transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 animate-bounce motion-reduce:animate-none"
          aria-label="Scroll to next section"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
