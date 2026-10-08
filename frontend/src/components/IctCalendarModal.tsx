import React from 'react';
import { Calendar, Check, Clock, Sparkles, X, BookOpen, GraduationCap, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface IctCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarMode: 'GC' | 'EC';
  onCalendarModeChange: (mode: 'GC' | 'EC') => void;
}

export default function IctCalendarModal({
  isOpen,
  onClose,
  calendarMode,
  onCalendarModeChange,
}: IctCalendarModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#002866] via-[#003580] to-[#004b99] px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300 font-black text-lg">
              🇪🇹
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">ASTU Academic & System Calendar</h3>
              <p className="text-xs text-blue-100/80">Ethio-Gregorian Dual Calendar & Academic Timeline Matrix</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Live Date Converter Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Gregorian Date (G.C.)</span>
              <div className="text-base font-black text-[#002866] dark:text-blue-400">October 9, 2026 G.C.</div>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Friday · Academic Year 2026/2027</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">Current Ethiopian Date (E.C.)</span>
              <div className="text-base font-black text-amber-950 dark:text-amber-300">መስከረም 29, 2018 ዓ.ም.</div>
              <p className="text-[11px] font-semibold text-amber-900/80 dark:text-amber-300/80">Meskerem 29, 2018 E.C. · ዓመተ ምሕረት</p>
            </div>
          </div>

          {/* System Calendar Preference Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Active Portal Display Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onCalendarModeChange('GC');
                  toast.success('Calendar format set to Gregorian (G.C.)');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  calendarMode === 'GC'
                    ? 'bg-[#003580] text-white border-[#003580] shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Gregorian (2026 G.C.)</div>
                  <div className={`text-[10px] ${calendarMode === 'GC' ? 'text-blue-200' : 'text-slate-500'}`}>Standard International Format</div>
                </div>
                {calendarMode === 'GC' && <Check className="h-4 w-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  onCalendarModeChange('EC');
                  toast.success('Calendar format set to Ethiopian (2018 E.C.)');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  calendarMode === 'EC'
                    ? 'bg-[#003580] text-white border-[#003580] shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Ethiopian (2018 E.C.)</div>
                  <div className={`text-[10px] ${calendarMode === 'EC' ? 'text-blue-200' : 'text-slate-500'}`}>13-Month Ethiopian Academic System</div>
                </div>
                {calendarMode === 'EC' && <Check className="h-4 w-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Academic Semester Milestones Timeline */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#003580] dark:text-blue-400" />
              ASTU Academic Milestones Schedule (2026/2027)
            </h4>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                    S1
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Semester I Registration & Enrollment</div>
                    <div className="text-[10px] text-slate-500">Meskerem 5 – Meskerem 25, 2018 E.C.</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  COMPLETED
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#003580] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    S1
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Mid-Term Assessment & Project Audits</div>
                    <div className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">Hidar 11 – Hidar 26, 2018 E.C. (Nov 20 – Dec 05, 2026 G.C.)</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-2xs">
                  IN PROGRESS
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                    S2
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Semester II Opening & National Tracer Survey Launch</div>
                    <div className="text-[10px] text-slate-500">Yakatit 8 – Yakatit 21, 2018 E.C. (Feb 15 – Feb 28, 2027 G.C.)</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  UPCOMING
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> ASTU Registrar Dual-Calendar Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#003580] hover:bg-[#002866] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
