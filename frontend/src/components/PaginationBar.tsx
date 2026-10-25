import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationBarProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  noun?: string;
  className?: string;
}

export default function PaginationBar({
  currentPage,
  totalPages,
  total,
  pageSize = 6,
  onPageChange,
  noun = 'items',
  className = '',
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const validPage = Math.min(Math.max(0, currentPage), Math.max(0, totalPages - 1));
  const startItem = total === 0 ? 0 : validPage * pageSize + 1;
  const endItem = Math.min(total, (validPage + 1) * pageSize);

  // Generate page numbers to show
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(0);
    const left = Math.max(1, validPage - 1);
    const right = Math.min(totalPages - 2, validPage + 1);

    if (left > 1) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 2) pages.push('...');
    pages.push(totalPages - 1);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className={`mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/90 dark:border-slate-800 pt-6 ${className}`}
    >
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Showing <span className="font-bold text-slate-800 dark:text-white">{startItem}</span> to{' '}
        <span className="font-bold text-slate-800 dark:text-white">{endItem}</span> of{' '}
        <span className="font-bold text-slate-800 dark:text-white">{total}</span> {noun}
        <span className="ml-2 text-slate-400 dark:text-slate-500">
          (Page {validPage + 1} of {totalPages})
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(validPage - 1)}
          disabled={validPage <= 0}
          aria-label="Previous page"
          className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold transition-all ${
            validPage <= 0
              ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900 text-slate-400'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-astu-navy dark:hover:border-sky-500 cursor-pointer shadow-2xs'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 select-none">
                ...
              </span>
            );
          }
          const isCurrent = p === validPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p + 1}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-astu-navy text-white shadow-sm dark:bg-sky-600'
                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs'
              }`}
            >
              {p + 1}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(validPage + 1)}
          disabled={validPage >= totalPages - 1}
          aria-label="Next page"
          className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold transition-all ${
            validPage >= totalPages - 1
              ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900 text-slate-400'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-astu-navy dark:hover:border-sky-500 cursor-pointer shadow-2xs'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
