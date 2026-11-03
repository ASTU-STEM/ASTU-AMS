import React from 'react';
import { Zap } from 'lucide-react';
import { IncludedSuitesState, DEFAULT_SUITES_SELECTION, SUITES_METADATA } from './types';

export interface ScopeSelectionGridProps {
  selectedSuites: IncludedSuitesState;
  setSelectedSuites: React.Dispatch<React.SetStateAction<IncludedSuitesState>>;
}

export default function ScopeSelectionGrid({
  selectedSuites,
  setSelectedSuites,
}: ScopeSelectionGridProps) {
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
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
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
            className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 font-bold transition-all"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => applyPreset('78only')}
            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold transition-all"
          >
            78 Report Center Suites Only
          </button>
          <button
            type="button"
            onClick={() => applyPreset('50only')}
            className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-bold transition-all"
          >
            50 Executive Domains Only
          </button>
          <button
            type="button"
            onClick={() => applyPreset('kpionly')}
            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold transition-all"
          >
            Core KPIs Only
          </button>
          <button
            type="button"
            onClick={() => applyPreset('none')}
            className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold transition-all"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Categorized Checkbox List */}
      <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
        {SUITES_METADATA.map((group) => (
          <div key={group.group} className="space-y-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-800">
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
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 opacity-60'
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
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{item.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.count}</div>
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
