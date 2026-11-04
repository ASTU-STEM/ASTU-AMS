import React from 'react';
import { CheckSquare, Square, Zap } from 'lucide-react';
import type { IncludedSuitesState } from './types';
import { DEFAULT_SUITES_SELECTION } from './types';

const SUITES_METADATA = [
  {
    group: 'Executive Core Metrics',
    items: [
      { key: 'kpi', label: 'Executive KPI Cards & Totals', count: '4 Cards' },
      { key: 'yoyForecast', label: 'YoY Rate Comparison & 2027 AI Predictive Forecast Model', count: 'Historical & Predictive' },
    ],
  },
  {
    group: '78 Report Center Analytics Suites (Suites 1–8)',
    items: [
      { key: 'suite1', label: 'Suite 1: University-Industry & Corporate MoU Analysis', count: '10 Analyses' },
      { key: 'suite2', label: 'Suite 2: Multi-Year Department Performance Matrix', count: '10 Analyses' },
      { key: 'suite3', label: 'Suite 3: Registrar Batch Import & Data Integrity Audit', count: '10 Analyses' },
      { key: 'suite4', label: 'Suite 4: Document Request Fulfillment Response SLA', count: '10 Analyses' },
      { key: 'suite5', label: 'Suite 5: Platform Active User Engagement & Account Audit', count: '10 Analyses' },
      { key: 'suite6', label: 'Suite 6: Digital Profile & Identity Verification Suite', count: '10 Analyses' },
      { key: 'suite7', label: 'Suite 7: Institutional SLA & Operations Suite', count: '10 Analyses' },
      { key: 'suite8', label: 'Suite 8: Academic Performance & Degree Outcome Suite', count: '8 Analyses' },
    ],
  },
  {
    group: '50 Executive Innovation Domains (Out-of-the-Box Analyses)',
    items: [
      { key: 'domain1', label: 'Domain 1: National Economic & Strategic Impact Matrix', count: '10 Analyses' },
      { key: 'domain2', label: 'Domain 2: Institutional Curriculum & Skills Readiness Radar', count: '10 Analyses' },
      { key: 'domain3', label: 'Domain 3: Global Career & Postgraduate Mobility Trends', count: '10 Analyses' },
      { key: 'domain4', label: 'Domain 4: Alumni Startup Ecosystem & Patent Velocity', count: '10 Analyses' },
      { key: 'domain5', label: 'Domain 5: Industry Partnership & Internship Outcomes', count: '10 Analyses' },
    ],
  },
];

export function ScopeSelectionGrid({
  selectedSuites,
  setSelectedSuites,
}: {
  selectedSuites: IncludedSuitesState;
  setSelectedSuites: React.Dispatch<React.SetStateAction<IncludedSuitesState>>;
}) {
  const activeCount = Object.values(selectedSuites).filter(Boolean).length;

  const applyPreset = (preset: 'all' | 'none' | '78only' | '50only' | 'kpionly') => {
    if (preset === 'all') {
      setSelectedSuites(DEFAULT_SUITES_SELECTION);
    } else if (preset === 'none') {
      setSelectedSuites({
        kpi: false,
        yoyForecast: false,
        suite1: false,
        suite2: false,
        suite3: false,
        suite4: false,
        suite5: false,
        suite6: false,
        suite7: false,
        suite8: false,
        domain1: false,
        domain2: false,
        domain3: false,
        domain4: false,
        domain5: false,
      });
    } else if (preset === '78only') {
      setSelectedSuites({
        kpi: false,
        yoyForecast: false,
        suite1: true,
        suite2: true,
        suite3: true,
        suite4: true,
        suite5: true,
        suite6: true,
        suite7: true,
        suite8: true,
        domain1: false,
        domain2: false,
        domain3: false,
        domain4: false,
        domain5: false,
      });
    } else if (preset === '50only') {
      setSelectedSuites({
        kpi: false,
        yoyForecast: false,
        suite1: false,
        suite2: false,
        suite3: false,
        suite4: false,
        suite5: false,
        suite6: false,
        suite7: false,
        suite8: false,
        domain1: true,
        domain2: true,
        domain3: true,
        domain4: true,
        domain5: true,
      });
    } else if (preset === 'kpionly') {
      setSelectedSuites({
        kpi: true,
        yoyForecast: true,
        suite1: false,
        suite2: false,
        suite3: false,
        suite4: false,
        suite5: false,
        suite6: false,
        suite7: false,
        suite8: false,
        domain1: false,
        domain2: false,
        domain3: false,
        domain4: false,
        domain5: false,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Presets Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100/80 border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Quick Scope Presets:</span>
          <span className="ml-1 px-2 py-0.5 text-[11px] font-extrabold bg-blue-600 text-white rounded-full">
            {activeCount} of 15 Included
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => applyPreset('all')}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold transition-all"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => applyPreset('78only')}
            className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 font-bold transition-all"
          >
            78 Report Center Suites Only
          </button>
          <button
            type="button"
            onClick={() => applyPreset('50only')}
            className="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 hover:bg-purple-100 font-bold transition-all"
          >
            50 Executive Domains Only
          </button>
          <button
            type="button"
            onClick={() => applyPreset('kpionly')}
            className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-100 font-bold transition-all"
          >
            Core KPIs Only
          </button>
          <button
            type="button"
            onClick={() => applyPreset('none')}
            className="px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 hover:bg-rose-100 font-bold transition-all"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Categorized Checkbox List */}
      <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
        {SUITES_METADATA.map((group) => (
          <div key={group.group} className="space-y-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              {group.group}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map((item) => {
                const key = item.key as keyof IncludedSuitesState;
                const isChecked = selectedSuites[key];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100/60 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setSelectedSuites((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 leading-snug">{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{item.count}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

