import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalSliderProps {
  children: React.ReactNode;
  className?: string;
  /** Gap between items (Tailwind gap class). Default gap-4 */
  gapClassName?: string;
  /** Aria label for the region */
  label?: string;
  /** Show prev/next only when content overflows. Default true */
  showControls?: boolean;
}

/**
 * Accessible horizontal scroll-snap strip for compact collections
 * (filter chips, logo rows, featured cards). Not for paging large datasets.
 */
export default function HorizontalSlider({
  children,
  className = '',
  gapClassName = 'gap-4',
  label = 'Carousel',
  showControls = true,
}: HorizontalSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const left = el.scrollLeft;
    // Tolerance for sub-pixel / snap rounding
    setCanPrev(left > 2);
    setCanNext(left < max - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateArrows();

    const onScroll = () => updateArrows();
    el.addEventListener('scroll', onScroll, { passive: true });

    const ro = new ResizeObserver(() => updateArrows());
    ro.observe(el);
    // Children width changes (images loading, filter chips)
    if (el.firstElementChild) {
      ro.observe(el.firstElementChild);
    }

    window.addEventListener('resize', updateArrows);

    // Re-measure after layout/images settle
    const raf = requestAnimationFrame(updateArrows);
    const t = window.setTimeout(updateArrows, 120);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      window.removeEventListener('resize', updateArrows);
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [updateArrows, children]);

  const scrollByPage = useCallback((dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.max(200, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (canPrev) scrollByPage(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (canNext) scrollByPage(1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      const el = trackRef.current;
      if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    }
  };

  const showNav = showControls && (canPrev || canNext);

  return (
    <div className={`relative min-w-0 ${className}`}>
      {showNav && (
        <>
          <button
            type="button"
            aria-label="Previous items"
            aria-controls={labelId}
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-astu-navy shadow-md transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astu-navy disabled:pointer-events-none disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-astu-green sm:left-1"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next items"
            aria-controls={labelId}
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-astu-navy shadow-md transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-astu-navy disabled:pointer-events-none disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-astu-green sm:right-1"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </>
      )}

      <div
        id={labelId}
        ref={trackRef}
        role="region"
        aria-label={label}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={`flex min-w-0 ${gapClassName} overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory pb-1 outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 focus-visible:ring-offset-2 dark:focus-visible:ring-astu-green/40 ${
          showNav ? 'px-8 sm:px-10' : ''
        } [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {children}
      </div>
    </div>
  );
}
