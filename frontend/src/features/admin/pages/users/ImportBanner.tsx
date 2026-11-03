import React from 'react';
import { ChevronRight, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

export type ImportLog = {
  id: string;
  syncedAt: string;
  recordsCount: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  errors?: string | null;
};

type ImportBannerProps = {
  latestLog?: ImportLog | null;
  onViewHistory: () => void;
};

export default function ImportBanner({ latestLog, onViewHistory }: ImportBannerProps) {
  if (!latestLog) {
    return (
      <div className="rounded-xl border border-slate-200 border-l-[4px] border-l-slate-400 bg-slate-50/80 px-4 py-3 text-xs text-slate-700 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 font-medium flex-wrap">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-500 text-white shrink-0 shadow-xs">
            <FileSpreadsheet className="h-4 w-4" />
          </span>
          <span>
            <strong>Last CSV import:</strong> No import logs recorded yet.
          </span>
        </div>
        <button
          type="button"
          onClick={onViewHistory}
          className="font-bold text-slate-600 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-auto shrink-0"
        >
          <span>View Import History</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const displayDate = format(new Date(latestLog.syncedAt), 'MMMM d, yyyy');
  const displayStatus = latestLog.status;

  return (
    <div className="rounded-xl border border-emerald-300/60 border-l-[4px] border-l-emerald-600 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-950 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5 font-medium flex-wrap">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs">
          <FileSpreadsheet className="h-4 w-4" />
        </span>
        <span>
          <strong>Last CSV import:</strong>{' '}
          <span className="font-extrabold text-emerald-900">{latestLog.recordsCount} records</span> ·{' '}
          <span>{displayDate}</span> ·{' '}
          <span className="text-emerald-800">by Registrar Office (SIS DB Sync)</span>
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
            displayStatus === 'SUCCESS'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : displayStatus === 'PARTIAL'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-300'
          }`}
        >
          {displayStatus}
        </span>
      </div>
      <button
        type="button"
        onClick={onViewHistory}
        className="font-bold text-emerald-700 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-auto shrink-0"
      >
        <span>View Import History</span>
        <ChevronRight className="h-3.5 w-3.5 text-emerald-700" />
      </button>
    </div>
  );
}
