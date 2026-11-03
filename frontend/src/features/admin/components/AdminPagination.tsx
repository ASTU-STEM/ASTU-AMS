import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  itemsPerPage?: number;
  label?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemsPerPage,
  label = 'entries',
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
}: AdminPaginationProps) {
  const effectivePageSize = pageSize ?? itemsPerPage;

  if (totalPages <= 1 && totalItems === undefined) return null;
  if (totalItems !== undefined && effectivePageSize !== undefined && totalItems <= effectivePageSize && totalPages <= 1) return null;

  const startItem = effectivePageSize ? (currentPage - 1) * effectivePageSize + 1 : undefined;
  const endItem = effectivePageSize && totalItems ? Math.min(currentPage * effectivePageSize, totalItems) : undefined;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-600 dark:text-slate-400 ${className}`}
    >
      <div className="flex items-center gap-3">
        {totalItems !== undefined && (
          <span>
            {startItem !== undefined && endItem !== undefined ? (
              <>
                Showing <strong className="font-semibold text-slate-900 dark:text-white">{startItem}</strong> to{' '}
                <strong className="font-semibold text-slate-900 dark:text-white">{endItem}</strong> of{' '}
                <strong className="font-semibold text-slate-900 dark:text-white">{totalItems}</strong> {label}
              </>
            ) : (
              <>
                Total: <strong className="font-semibold text-slate-900 dark:text-white">{totalItems}</strong> {label}
              </>
            )}
          </span>
        )}

        {onPageSizeChange && effectivePageSize && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span>Per page:</span>
            <select
              value={effectivePageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
