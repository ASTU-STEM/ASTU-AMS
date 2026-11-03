import React, { useMemo } from "react";
import type { PublicStat } from "../../services/publicStats.service";
import { HOME_PREVIEW_COUNT, SectionShell, STAT_PRESENTATION } from "./homeShared";

interface ImpactCountersProps {
  stats: PublicStat[];
  headers?: { eyebrow?: string; title?: string; description?: string };
}

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
        .slice(0, HOME_PREVIEW_COUNT),
    [stats]
  );

  if (!visible.length) return null;

  return (
    <SectionShell
      id="impact-numbers"
      tone="band"
      eyebrow={headers?.eyebrow}
      title={headers?.title || "ASTU at a Glance"}
      description={headers?.description}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {visible.map(({ stat, presentation }) => {
          const Icon = presentation.Icon;
          return (
            <div key={stat.key} className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <div className={`mb-3 inline-flex rounded-lg p-2 ${presentation.accent}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="animate-count text-2xl font-black tabular-nums text-slate-900 dark:text-white md:text-3xl">
                {stat.value.toLocaleString()}
                {stat.suffix || ""}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {presentation.label}
              </p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
