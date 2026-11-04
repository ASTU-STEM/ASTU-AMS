import React from 'react';
import { SavedToolResult } from '../types/tools.types';
import { History, Trash2, Copy, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface SavedResultsViewProps {
  savedResults: SavedToolResult[];
  onDeleteResult: (id: string) => void;
  onClearAll: () => void;
}

export const SavedResultsView: React.FC<SavedResultsViewProps> = ({
  savedResults,
  onDeleteResult,
  onClearAll,
}) => {
  const handleCopy = (res: SavedToolResult) => {
    const text = `${res.title} (${res.timestamp})\n${res.resultSummary || ''}\n${JSON.stringify(res.data, null, 2)}`;
    navigator.clipboard.writeText(text);
    toast.success('Result summary copied to clipboard!');
  };

  if (savedResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3 dark:bg-slate-800">
          <History className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Saved Calculations Yet</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm dark:text-slate-400">
          Run any tool calculator or generator and click <span className="font-semibold text-[#003366]">"Save Result"</span> to store your calculations here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#003366] dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Saved Tool History ({savedResults.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {savedResults.map((res) => (
          <div
            key={res.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#003366] dark:bg-blue-950 dark:text-blue-300">
                  {res.toolName}
                </span>

                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>{res.timestamp}</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{res.title}</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                {res.resultSummary || 'Calculated data saved.'}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleCopy(res)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#003366] dark:text-slate-400 dark:hover:text-blue-400"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Summary</span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteResult(res.id)}
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                title="Delete saved result"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
