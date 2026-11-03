import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  label = 'entries',
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  if (totalItems <= itemsPerPage) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-3 text-xs text-[var(--text-secondary)]">
      <div>
        Showing <span className="font-semibold text-[var(--text-primary)]">{startItem}</span> to{' '}
        <span className="font-semibold text-[var(--text-primary)]">{endItem}</span> of{' '}
        <span className="font-semibold text-[var(--text-primary)]">{totalItems}</span> {label}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--bg-page)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        <span className="px-2 font-medium text-[var(--text-muted)]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--bg-page)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
