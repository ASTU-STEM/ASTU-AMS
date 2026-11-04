import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check, CheckSquare, Square, Download, FileSpreadsheet, FileText, FileCode,
  FileDown, FileCheck2, Eye, HelpCircle, Info, Settings2, X, Printer,
  SlidersHorizontal, RotateCcw, Zap, Layers, BarChart3

} from 'lucide-react';
import type { IncludedSuitesState } from './types';
import { ScopeSelectionGrid } from './ScopeSelectionGrid';

export function PrintDashboardModal({
  isOpen,
  onClose,
  academicYear,
  department,
  selectedSuites,
  setSelectedSuites,
}: {
  isOpen: boolean;
  onClose: () => void;
  academicYear: string;
  department: string;
  selectedSuites: IncludedSuitesState;
  setSelectedSuites: React.Dispatch<React.SetStateAction<IncludedSuitesState>>;
}) {
  const [printMode, setPrintMode] = useState<'full' | 'summary' | 'charts' | 'tables'>('full');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [colorTheme, setColorTheme] = useState<'color' | 'eco'>('eco');
  const [includeLetterhead, setIncludeLetterhead] = useState(true);

  if (!isOpen) return null;

  const activeCount = Object.values(selectedSuites).filter(Boolean).length;

  const handleLaunchPrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#003580]/10 p-1.5 border border-[#003580]/20 flex items-center justify-center">
              <img src="/images/astu-seal-logo.png" alt="ASTU Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Print ASTU Executive Dashboard Setup</h3>
              <p className="text-xs text-slate-500">Customize print orientation, YoY comparison scope, and ASTU letterhead</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Print Mode */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              1. Print Content Mode
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'full', title: 'Full Dashboard', desc: 'All selected charts & tables' },
                { id: 'summary', title: 'Executive Summary', desc: 'KPI cards & key charts' },
                { id: 'charts', title: 'Charts Only', desc: 'Visual graphs only' },
                { id: 'tables', title: 'Tables Only', desc: 'Auditing tabular data' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPrintMode(m.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    printMode === m.id
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{m.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Suite Inclusion Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              2. Select Analyses &amp; Suites to Print ({activeCount} of 15 Included)
            </label>
            <ScopeSelectionGrid selectedSuites={selectedSuites} setSelectedSuites={setSelectedSuites} />
          </div>

          {/* Orientation & Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Page Orientation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    orientation === 'landscape'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  ↔️ Landscape (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    orientation === 'portrait'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  ↕️ Portrait
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Color Palette Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setColorTheme('eco')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    colorTheme === 'eco'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  ⚪ High-Contrast Eco (Save Ink)
                </button>
                <button
                  type="button"
                  onClick={() => setColorTheme('color')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    colorTheme === 'color'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  🔵 Full Color Presentation
                </button>
              </div>
            </div>
          </div>

          {/* Live Thumbnail Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Print Layout Live Preview</span>
              <span className="text-[10px] text-slate-500 uppercase">{orientation} • {colorTheme} theme</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2 text-[10px] text-slate-600 font-mono">
              <div className="border-b pb-1 font-bold text-slate-900 flex justify-between">
                <span>ADAMA SCIENCE AND TECHNOLOGY UNIVERSITY</span>
                <span>ADMIN REPORT</span>
              </div>
              <div className="text-slate-500">Filter: {academicYear} | Department: {department}</div>
              <div className="grid grid-cols-3 gap-1 py-1">
                <div className="bg-slate-100 p-1 rounded text-center">KPI Metric 1</div>
                <div className="bg-slate-100 p-1 rounded text-center">KPI Metric 2</div>
                <div className="bg-slate-100 p-1 rounded text-center">KPI Metric 3</div>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center text-blue-800 font-bold">
                [ {activeCount} of 15 ANALYTICS MODULES INCLUDED FOR PRINT ]
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLetterhead}
              onChange={(e) => setIncludeLetterhead(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm"
            />
            <span className="text-xs font-semibold text-slate-600">Include Official ASTU Header &amp; Stamp</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleLaunchPrint}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Launch Print Dialog ({activeCount} Suites)
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


