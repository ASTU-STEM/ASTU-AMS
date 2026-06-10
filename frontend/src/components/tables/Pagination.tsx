import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-on-surface-variant">
        Page {currentPage} of {totalPages} ({total} items)
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-on-surface-variant">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                currentPage === page
                  ? 'bg-astu-navy text-white border-astu-navy'
                  : 'border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
