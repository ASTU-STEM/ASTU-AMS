import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  GraduationCap,
  Lightbulb,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { DepartmentDerivedData, NamedCount } from '../hooks/useDepartmentData';

interface DepartmentInsightsProps {
  data?: DepartmentDerivedData;
  isLoading?: boolean;
  error?: string | null;
  darkMode?: boolean;
  onRefresh?: () => Promise<void>;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-700/50 ${className}`} />
);

function skillEmploymentGaps(data: DepartmentDerivedData): Array<{
  skill: string;
  employedCount: number;
  unemployedCount: number;
  gapScore: number;
}> {
  const employedSkills: Record<string, number> = {};
  const unemployedSkills: Record<string, number> = {};

  for (const alum of data.alumni) {
    const skills = Array.isArray(alum.skills) ? alum.skills : [];
    const placed = alum.employmentStatus === 'EMPLOYED' || alum.employmentStatus === 'SELF_EMPLOYED';
    const bucket = placed ? employedSkills : unemployedSkills;
    for (const raw of skills) {
      const skill = (raw || '').trim();
      if (!skill) continue;
      bucket[skill] = (bucket[skill] || 0) + 1;
    }
  }

  const allSkills = new Set([...Object.keys(employedSkills), ...Object.keys(unemployedSkills)]);
  return Array.from(allSkills)
    .map((skill) => {
      const employedCount = employedSkills[skill] || 0;
      const unemployedCount = unemployedSkills[skill] || 0;
      const gapScore =
        unemployedCount + employedCount > 0
          ? Math.round((unemployedCount / (unemployedCount + employedCount)) * 100)
          : 0;
      return { skill, employedCount, unemployedCount, gapScore };
    })
    .filter((row) => row.unemployedCount > 0 || row.employedCount > 0)
    .sort((a, b) => b.gapScore - a.gapScore || b.unemployedCount - a.unemployedCount)
    .slice(0, 10);
}

function curriculumRecommendations(topSkills: NamedCount[], gaps: ReturnType<typeof skillEmploymentGaps>) {
  const strong = topSkills.slice(0, 5).map((s) => s.name);
  const weak = gaps.filter((g) => g.gapScore >= 50).slice(0, 5).map((g) => g.skill);
  return { strong, weak };
}

function downloadInsightsCsv(data: DepartmentDerivedData, gaps: ReturnType<typeof skillEmploymentGaps>) {
  const lines = [
    ['Section', 'Item', 'Value'],
    ['Overview', 'Total Alumni', String(data.stats.totalAlumni)],
    ['Overview', 'Employment Rate %', data.stats.employmentRate.toFixed(1)],
    ['Overview', 'Unemployed', String(data.stats.unemployed)],
    ['Overview', 'Average Salary', data.averageSalary != null ? String(data.averageSalary) : ''],
    ...gaps.map((g) => [
      'Skill Gap',
      g.skill,
      `employed=${g.employedCount};unemployed=${g.unemployedCount};unplacedShare%=${g.gapScore}`,
    ]),
    ...data.topCompanies.map((c) => ['Top Employers', c.name, String(c.count)]),
    ...data.topIndustries.map((i) => ['Industry', i.name, String(i.count)]),
    ...data.employmentTrend.map((t) => [
      'Tracer Cohort',
      t.year,
      `graduates=${t.graduates};employed=${t.employed};rate%=${t.employmentRate.toFixed(1)}`,
    ]),
  ];
  const csv = lines.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `department-insights-${data.department?.code || 'export'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DepartmentInsights({
  data,
  isLoading = false,
  error = null,
  darkMode = false,
  onRefresh,
}: DepartmentInsightsProps) {
  const [refreshing, setRefreshing] = useState(false);
  const safe = data;
  const gaps = useMemo(() => (safe ? skillEmploymentGaps(safe) : []), [safe]);
  const curriculum = useMemo(
    () => (safe ? curriculumRecommendations(safe.topSkills, gaps) : { strong: [], weak: [] }),
    [safe, gaps]
  );

  const card = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80';
  const muted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const titleCls = darkMode ? 'text-white' : 'text-slate-900';

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border p-10 text-center ${card}`}>
        <AlertCircle className="h-8 w-8 text-rose-500" />
        <h3 className={`mt-4 text-lg font-semibold ${titleCls}`}>Could not load insights</h3>
        <p className={`mt-2 text-sm ${muted}`}>{error}</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || !onRefresh}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Try again
        </button>
      </div>
    );
  }

  if (!safe || safe.stats.totalAlumni === 0) {
    return (
      <div className={`rounded-2xl border p-10 text-center ${card}`}>
        <Lightbulb className={`mx-auto h-10 w-10 ${muted}`} />
        <h3 className={`mt-4 text-lg font-semibold ${titleCls}`}>No department data yet</h3>
        <p className={`mt-2 text-sm ${muted}`}>
          Insights appear once alumni profiles are linked to your department.
        </p>
      </div>
    );
  }

  const placedGraduates = safe.stats.employed + safe.stats.selfEmployed;
  const changeHint =
    safe.stats.unemployed === 0
      ? `${placedGraduates} placed graduates · no unemployment`
      : `${safe.stats.unemploymentRate.toFixed(1)}% of alumni`;

  const kpis = [
    {
      label: 'Employment rate',
      value: `${safe.stats.employmentRate.toFixed(1)}%`,
      hint: `${placedGraduates} placed graduates`,
      icon: TrendingUp,
      iconCls: darkMode ? 'text-emerald-400' : 'text-[#0b8a5b]',
      chip: 'bg-emerald-500/15',
    },
    {
      label: 'Unemployed alumni',
      value: String(safe.stats.unemployed),
      hint: changeHint,
      icon: Target,
      iconCls: darkMode ? 'text-slate-300' : 'text-[#7c3aed]',
      chip: 'bg-violet-500/15',
    },
    {
      label: 'Tracked skills',
      value: String(safe.topSkills.length),
      hint: `from ${safe.stats.totalAlumni} alumni profiles`,
      icon: BookOpen,
      iconCls: darkMode ? 'text-sky-400' : 'text-[#0369a1]',
      chip: 'bg-sky-500/15',
    },
    {
      label: 'Hiring employers',
      value: String(safe.topCompanies.length),
      hint: 'from current work experience',
      icon: Building2,
      iconCls: darkMode ? 'text-amber-400' : 'text-[#b45309]',
      chip: 'bg-amber-500/15',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={`relative overflow-hidden rounded-2xl border p-6 ${card}`}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(0,53,128,0.12),transparent_60%)]" />
        <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${darkMode ? 'text-slate-400' : 'text-[#003580]'}`}>
              Intelligence & curriculum
            </p>
            <h2 className={`mt-2 text-2xl font-bold tracking-tight ${titleCls}`}>Department Insights</h2>
            <p className={`mt-2 text-sm leading-relaxed ${muted}`}>
              Skill gaps, curriculum signals, tracer cohorts, and hiring employers for{' '}
              {safe.department?.name || 'your department'}.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || !onRefresh}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60 ${
                darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => downloadInsightsCsv(safe, gaps)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#002a66]"
            >
              <Download className="h-4 w-4" /> Export report
            </button>
          </div>
        </div>
      </section>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`card-hover rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>{kpi.label}</p>
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${kpi.chip}`}>
                  <Icon className={`h-4 w-4 ${kpi.iconCls}`} />
                </span>
              </div>
              <p className={`mt-2 text-3xl font-bold tracking-tight ${titleCls}`}>{kpi.value}</p>
              <p className={`mt-1.5 text-sm ${muted}`}>{kpi.hint}</p>
            </div>
          );
        })}
      </div>

      {/* ── Skill gap report + curriculum ────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-5">
        <section className={`rounded-2xl border p-5 lg:col-span-3 ${card}`}>
          <div className="mb-4 flex items-center gap-2">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${darkMode ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <Target className="h-4 w-4" />
            </span>
            <h3 className={`text-sm font-semibold ${titleCls}`}>Skill Gap Report</h3>
            <span className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              curriculum.weak.length > 0
                ? darkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700'
                : darkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {curriculum.weak.length > 0 ? `${curriculum.weak.length} at-risk skill${curriculum.weak.length === 1 ? '' : 's'}` : 'No high-gap skills'}
            </span>
          </div>

          {gaps.length === 0 ? (
            <p className={`text-sm ${muted}`}>No skill data on alumni profiles yet.</p>
          ) : (
            <ul className="space-y-3.5">
              {gaps.map((row) => {
                const placementRate = 100 - row.gapScore;
                const isRisk = row.gapScore >= 50;
                return (
                  <li key={row.skill}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`truncate text-sm font-medium ${titleCls}`}>{row.skill}</span>
                        {isRisk && (
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            darkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700'
                          }`}>
                            At risk
                          </span>
                        )}
                      </div>
                      <span className={`shrink-0 text-sm font-semibold tabular-nums ${
                        isRisk ? (darkMode ? 'text-amber-300' : 'text-amber-700') : (darkMode ? 'text-emerald-300' : 'text-emerald-700')
                      }`}>
                        {placementRate}% placed
                      </span>
                    </div>
                    <div className={`relative h-2 w-full overflow-hidden rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div
                        className={`h-full rounded-full ${isRisk ? 'bg-amber-500' : 'bg-[#0b8a5b]'}`}
                        style={{ width: `${Math.min(100, placementRate)}%` }}
                      />
                    </div>
                    <p className={`mt-1 text-xs ${muted}`}>
                      {row.employedCount} employed with this skill · {row.unemployedCount} unplaced
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`rounded-2xl border p-5 lg:col-span-2 ${card}`}>
          <div className="mb-4 flex items-center gap-2">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${darkMode ? 'bg-slate-800 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
              <GraduationCap className="h-4 w-4" />
            </span>
            <h3 className={`text-sm font-semibold ${titleCls}`}>Curriculum Insights</h3>
          </div>

          <div className={`rounded-xl border p-4 ${darkMode ? 'border-emerald-900/40 bg-emerald-950/20' : 'border-emerald-100 bg-emerald-50/50'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-4 w-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                Strong placement skills
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {curriculum.strong.length === 0 ? (
                <span className={`text-sm ${muted}`}>Add skills on alumni profiles</span>
              ) : (
                curriculum.strong.map((s) => (
                  <span
                    key={s}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      darkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className={`mt-4 rounded-xl border p-4 ${darkMode ? 'border-amber-900/40 bg-amber-950/20' : 'border-amber-100 bg-amber-50/50'}`}>
            <div className="flex items-center gap-2">
              <Lightbulb className={`h-4 w-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
              <p className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                Review / reinforce
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {curriculum.weak.length === 0 ? (
                <span className={`text-sm ${muted}`}>No high-gap skills detected</span>
              ) : (
                curriculum.weak.map((s) => (
                  <span
                    key={s}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      darkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <p className={`mt-4 flex items-start gap-2 text-sm leading-relaxed ${muted}`}>
            <Sparkles className={`mt-0.5 h-4 w-4 shrink-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            Use placement-linked skills to prioritize electives and labs. Reinforce skills that appear often
            among unemployed graduates relative to employed peers.
          </p>
        </section>
      </div>

      {/* ── Tracer cohort + hiring signals ─────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-5">
        <section className={`rounded-2xl border p-5 lg:col-span-3 ${card}`}>
          <div className="mb-4 flex items-center gap-2">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${darkMode ? 'bg-slate-800 text-sky-400' : 'bg-sky-50 text-sky-600'}`}>
              <ClipboardList className="h-4 w-4" />
            </span>
            <h3 className={`text-sm font-semibold ${titleCls}`}>Tracer Cohort Report</h3>
            <span className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${darkMode ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-50 text-sky-700'}`}>
              {safe.employmentTrend.length} cohort{safe.employmentTrend.length === 1 ? '' : 's'}
            </span>
          </div>

          {safe.employmentTrend.length === 0 ? (
            <p className={`text-sm ${muted}`}>Graduation-year trends appear once alumni have graduation years.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <th className={`pb-2 font-semibold ${muted}`}>Year</th>
                      <th className={`pb-2 font-semibold ${muted}`}>Graduates</th>
                      <th className={`pb-2 font-semibold ${muted}`}>Placed</th>
                      <th className={`pb-2 font-semibold ${muted}`}>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safe.employmentTrend.map((row) => (
                      <tr key={row.year} className={`border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-50'}`}>
                        <td className={`py-2.5 font-medium ${titleCls}`}>Class of {row.year}</td>
                        <td className={`py-2.5 tabular-nums ${muted}`}>{row.graduates}</td>
                        <td className={`py-2.5 tabular-nums ${muted}`}>{row.employed}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-20 overflow-hidden rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <div
                                className="h-full rounded-full bg-[#003580]"
                                style={{ width: `${Math.min(100, row.employmentRate)}%` }}
                              />
                            </div>
                            <span className={`font-semibold tabular-nums ${titleCls}`}>{row.employmentRate.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={`mt-3 text-xs ${muted}`}>
                Placement rate counts employed + self-employed graduates per cohort.
              </p>
            </>
          )}
        </section>

        <section className={`rounded-2xl border p-5 lg:col-span-2 ${card}`}>
          <div className="mb-4 flex items-center gap-2">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${darkMode ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <Briefcase className="h-4 w-4" />
            </span>
            <h3 className={`text-sm font-semibold ${titleCls}`}>Top Employers</h3>
            <span className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${darkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
              Hiring signal
            </span>
          </div>
          <p className={`mb-3 text-xs ${muted}`}>
            Derived from current jobs reported by department alumni (proxy until formal employer ratings are linked).
          </p>
          {safe.topCompanies.length === 0 ? (
            <p className={`text-sm ${muted}`}>No employer data on alumni work experience yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {safe.topCompanies.slice(0, 8).map((company, idx) => (
                <li key={company.name} className="flex items-center gap-3 text-sm">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`truncate font-medium ${titleCls}`}>{company.name}</span>
                  <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                    darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {company.count} · {company.percentage.toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
          {safe.topIndustries.length > 0 && (
            <div className="mt-4 border-t pt-4" style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
              <div className="mb-2 flex items-center gap-1.5">
                <MapPin className={`h-3.5 w-3.5 ${muted}`} />
                <p className={`text-xs font-bold uppercase tracking-wide ${muted}`}>Top industries</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {safe.topIndustries.slice(0, 6).map((ind) => (
                  <span
                    key={ind.name}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ind.name} ({ind.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DepartmentInsights;