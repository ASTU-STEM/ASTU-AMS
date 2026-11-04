import React, { useEffect, useMemo, useRef, useState } from "react";
import type { PublicStat } from "../../services/publicStats.service";
import { STAT_PRESENTATION } from "./homeShared";

interface ImpactCountersProps {
  stats: PublicStat[];
  headers?: { eyebrow?: string; title?: string; description?: string };
}

const MAX_STATS = 4;

function useCountUp(target: number, active: boolean, durationMs = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, durationMs]);

  return value;
}

function StatCell({
  label,
  value,
  suffix,
  Icon,
  accent,
  active,
}: {
  label: string;
  value: number;
  suffix?: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
  active: boolean;
}) {
  const display = useCountUp(value, active);
  return (
    <div className="group flex flex-col items-center justify-center gap-3 bg-slate-950 px-4 py-10 text-center transition duration-300 hover:bg-slate-900 sm:py-12 md:px-6 motion-reduce:transition-none">
      <div
        className={`inline-flex rounded-xl p-3 ${accent} ring-1 ring-white/10 transition duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100`}
      >
        <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
      </div>
      <p className="text-3xl font-black tabular-nums tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
        {display.toLocaleString()}
        {suffix || ""}
      </p>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 md:text-xs">
        {label}
      </p>
    </div>
  );
}

export default function ImpactCounters({ stats, headers }: ImpactCountersProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  const visible = useMemo(
    () =>
      stats
        .map((stat) => {
          const presentation = STAT_PRESENTATION[stat.key];
          return presentation ? { stat, presentation } : null;
        })
        .filter(
          (entry): entry is { stat: PublicStat; presentation: (typeof STAT_PRESENTATION)[string] } =>
            Boolean(entry)
        )
        .slice(0, MAX_STATS),
    [stats]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible.length]);

  if (!visible.length) return null;

  return (
    <section
      ref={rootRef}
      id="impact-numbers"
      className="relative isolate z-0 w-full overflow-x-clip border-b border-astu-red bg-slate-950"
      aria-label={headers?.title || "ASTU impact at a glance"}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(7,89,166,0.22),_transparent_55%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        {visible.map(({ stat, presentation }) => (
          <StatCell
            key={stat.key}
            label={presentation.label}
            value={Number(stat.value) || 0}
            suffix={stat.suffix}
            Icon={presentation.Icon}
            accent={presentation.accent}
            active={inView}
          />
        ))}
      </div>
    </section>
  );
}
