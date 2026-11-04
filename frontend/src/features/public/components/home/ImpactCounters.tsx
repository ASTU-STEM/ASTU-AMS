import React, { useMemo } from "react";
import type { PublicStat } from "../../services/publicStats.service";
import { STAT_PRESENTATION } from "./homeShared";

interface ImpactCountersProps {
  stats: PublicStat[];
  headers?: { eyebrow?: string; title?: string; description?: string };
}

const MAX_STATS = 4;

export default function ImpactCounters({ stats, headers }: ImpactCountersProps) {
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

  if (!visible.length) return null;

  return (
    <section
      id="impact-numbers"
      className="relative isolate z-0 w-full overflow-x-clip border-b border-astu-red bg-slate-950"
      aria-label={headers?.title || "ASTU impact at a glance"}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(7,89,166,0.18),_transparent_55%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        {visible.map(({ stat, presentation }) => {
          const Icon = presentation.Icon;
          return (
            <div
              key={stat.key}
              className="group flex flex-col items-center justify-center gap-3 bg-slate-950 px-4 py-10 text-center transition duration-300 hover:bg-slate-900 sm:py-12 md:px-6 motion-reduce:transition-none"
            >
              <div
                className={`inline-flex rounded-xl p-3 ${presentation.accent} ring-1 ring-white/10 transition duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100`}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
              </div>
              <p className="animate-count text-3xl font-black tabular-nums tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
                {stat.value.toLocaleString()}
                {stat.suffix || ""}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 md:text-xs">
                {presentation.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
