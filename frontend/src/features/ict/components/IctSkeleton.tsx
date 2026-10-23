import React from 'react';

/**
 * Skeleton primitives for the ICT console.
 * Shimmer runs on `.ict-skel` (global.css) and honours reduced-motion.
 * These never change how data is loaded — they only stand in for it visually.
 */

export function IctSkeletonLine({ w = '100%', h = 10, className = '' }: { w?: string | number; h?: number; className?: string }) {
  return <div className={`ict-skel ${className}`} style={{ width: w, height: h }} aria-hidden />;
}

export function IctSkeletonBlock({ h = 72, className = '' }: { h?: number; className?: string }) {
  return <div className={`ict-skel w-full rounded-[6px] ${className}`} style={{ height: h }} aria-hidden />;
}

/** Grid of metric-card placeholders */
export function IctSkeletonMetrics({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4 ${className}`} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ict-card flex flex-col gap-2.5 px-3.5 py-3">
          <div className="flex items-center justify-between">
            <IctSkeletonLine w="52%" h={9} />
            <IctSkeletonLine w={22} h={22} className="rounded-[5px]" />
          </div>
          <IctSkeletonLine w="40%" h={20} />
          <IctSkeletonLine w="70%" h={9} />
        </div>
      ))}
    </div>
  );
}

/** Placeholder rows shaped like a real data table */
export function IctSkeletonTable({
  rows = 5,
  columns = 5,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-[var(--ict-hairline)] pb-2 last:border-b-0">
          {Array.from({ length: columns }).map((__, c) => (
            <IctSkeletonLine
              key={c}
              w={c === 0 ? '22%' : c === columns - 1 ? '14%' : `${Math.max(10, 26 - c * 3)}%`}
              h={10}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Placeholder list rows for card-style content */
export function IctSkeletonList({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ict-inset flex items-center gap-3 p-3">
          <IctSkeletonLine w={28} h={28} className="shrink-0 rounded-[5px]" />
          <div className="flex-1 space-y-1.5">
            <IctSkeletonLine w="45%" h={10} />
            <IctSkeletonLine w="72%" h={8} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Wraps any skeleton with an accessible "loading" announcement */
export function IctSkeletonRegion({
  children,
  label = 'Loading…',
  className = '',
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export default IctSkeletonRegion;
