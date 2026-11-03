import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Info, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import type { AdvancedFilterState } from './types';
import { DEFAULT_FILTERS, academicYears } from './types';

/**
 * Only academicYear + department are sent to GET /analytics/report.
 * Extra career/profile controls were removed — they previously looked wired but never hit the API.
 */
export function AdvancedFiltersModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  departments,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  onApply: (newFilters: AdvancedFilterState) => void;
  onReset: () => void;
  departments: string[];
}) {
  const [draft, setDraft] = useState<AdvancedFilterState>(filters);

  React.useEffect(() => {
    setDraft(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const activeCount =
    (draft.academicYear !== 'All Time' ? 1 : 0) + (draft.department !== 'All' ? 1 : 0);

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Report Filters</h3>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                    {activeCount} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Scopes the analytics report query (year &amp; department)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-blue-50/80 border-b border-blue-100 flex items-start gap-2 text-xs text-blue-900">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            The report API currently accepts <strong>academic year</strong> and <strong>department</strong> only.
            Other dimensions were removed so filters always match what the server returns.
          </p>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Academic Year / Batch</label>
            <select
              value={draft.academicYear}
              onChange={(e) => setDraft({ ...draft, academicYear: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {academicYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Department</label>
            <select
              value={draft.department}
              onChange={(e) => setDraft({ ...draft, department: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setDraft(DEFAULT_FILTERS);
              onReset();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(draft);
                onClose();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
