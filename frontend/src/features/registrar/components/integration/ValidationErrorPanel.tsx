import React from 'react';
import { AlertTriangle, RefreshCw, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ParseError } from './csvExcelParser';

interface ValidationErrorPanelProps {
  errors: ParseError[];
  onRetry: () => void;
  onRemapColumns?: () => void;
}

export const ValidationErrorPanel: React.FC<ValidationErrorPanelProps> = ({
  errors,
  onRetry,
  onRemapColumns,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const displayedErrors = expanded ? errors : errors.slice(0, 5);

  if (errors.length === 0) return null;

  return (
    <div
      data-testid="validation-error-panel"
      className="mt-6 rounded-2xl border border-[#71313A] bg-[#3B1A22] p-5 text-[#F1D5D8] shadow-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-200">
              Data Validation Failed ({errors.length} {errors.length === 1 ? 'Error' : 'Errors'} Found)
            </h4>
            <p className="mt-1 text-xs text-rose-200/80">
              The uploaded file contains formatting or data integrity discrepancies. Review the row and column markers below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRemapColumns && (
            <button
              type="button"
              onClick={onRemapColumns}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/30 bg-rose-950/60 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-900/60 transition-colors"
            >
              Re-map Columns
            </button>
          )}
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-500 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry Upload
          </button>
        </div>
      </div>

      <div className="mt-4 divide-y divide-rose-900/40 rounded-xl border border-rose-900/50 bg-[#29171D] overflow-hidden">
        {displayedErrors.map((err, idx) => (
          <div
            key={`err-${idx}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center rounded-md bg-rose-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-300">
                Row {err.row}
              </span>
              <span className="font-semibold text-rose-100">Column: {err.column}</span>
              {err.value !== '' && (
                <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-rose-300">
                  Value: &ldquo;{err.value}&rdquo;
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{err.message}</span>
            </div>
          </div>
        ))}
      </div>

      {errors.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-300 hover:text-white transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" /> Show Fewer Errors
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> View All {errors.length} Errors
            </>
          )}
        </button>
      )}
    </div>
  );
};
