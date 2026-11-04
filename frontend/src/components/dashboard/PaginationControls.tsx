import React, { useMemo } from 'react';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Hide the “Showing X–Y of Z” label */
  hideRangeLabel?: boolean;
}

function buildPageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) items.push('ellipsis');
  for (let p = left; p <= right; p += 1) items.push(p);
  if (right < total - 1) items.push('ellipsis');
  items.push(total);
  return items;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
  hideRangeLabel = false,
}) => {
  const pageItems = useMemo(
    () => buildPageItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  if (totalPages <= 0 || totalItems <= 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const btnBase =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40';

  const idleBtn =
    `${btnBase} border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] ` +
    'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]';

  const activeBtn =
    `${btnBase} border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-sm`;

  const disabledBtn =
    `${btnBase} border-[var(--border-color)] bg-[var(--bg-card-secondary)] text-[var(--text-muted)] cursor-not-allowed opacity-60`;

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {!hideRangeLabel && (
        <p className="text-sm text-[var(--text-muted)]">
          Showing{' '}
          <span className="font-semibold text-[var(--text-secondary)]">
            {start}–{end}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-[var(--text-secondary)]">{totalItems}</span>
        </p>
      )}

      <nav
        className="flex flex-wrap items-center gap-1"
        aria-label="Pagination"
      >
        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className={currentPage <= 1 ? disabledBtn : idleBtn}
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {pageItems.map((item, idx) =>
          item === 'ellipsis' ? (
            <span
              key={`e-${idx}`}
              className="inline-flex h-9 min-w-9 items-center justify-center text-[var(--text-muted)]"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={item === currentPage ? activeBtn : idleBtn}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className={currentPage >= totalPages ? disabledBtn : idleBtn}
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </nav>
    </div>
  );
};

export default PaginationControls;
