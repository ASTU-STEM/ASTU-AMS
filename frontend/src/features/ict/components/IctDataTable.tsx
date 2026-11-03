import React from 'react';
import { ictTable, ictTableScroll, ictTd, ictTh, ictTrHover } from './ictUi';
import { IctSkeletonTable } from './IctSkeleton';

export interface IctColumn<T> {
  key: string;
  header: React.ReactNode;
  /** Cell renderer */
  cell: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
  headClassName?: string;
  cellClassName?: string;
}

const ALIGN: Record<string, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

interface IctDataTableProps<T> {
  columns: IctColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption?: string;
  /** Accessible description of the dataset, read out by screen readers */
  summary?: string;
  loading?: boolean;
  loadingRows?: number;
  /** Rendered when there are no rows */
  empty?: React.ReactNode;
  /** Optional footer strip (record counts, pagination) */
  footer?: React.ReactNode;
  /** Cap the scrollable height for long operational streams */
  maxHeight?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * The console's single table implementation.
 *
 * Sticky header, consistent row rhythm, horizontal scroll on small screens,
 * skeleton rows while loading and a caller-supplied empty state. Columns are
 * plain data — the table never changes how a page fetches or mutates anything.
 */
export default function IctDataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  summary,
  loading = false,
  loadingRows = 5,
  empty,
  footer,
  maxHeight,
  rowClassName,
  onRowClick,
  className = '',
}: IctDataTableProps<T>) {
  const colCount = columns.length;
  const showSkeleton = loading && rows.length === 0;

  return (
    <div className={`ict-card overflow-hidden ${className}`}>
      <div
        className={`ict-table-scroll ${maxHeight ? 'overflow-y-auto' : ''}`}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className={ictTable}>
          {caption && <caption className="sr-only">{caption}</caption>}
          {summary && <caption className="sr-only">{summary}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={`ictTh ${ALIGN[col.align || 'left']} ${col.headClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {showSkeleton ? (
              <tr>
                <td colSpan={colCount} className="px-3 py-3">
                  <IctSkeletonTable rows={loadingRows} columns={Math.min(colCount, 6)} />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-3 py-3">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const interactive = Boolean(onRowClick);
                return (
                  <tr
                    key={rowKey(row)}
                    onClick={interactive ? () => onRowClick?.(row) : undefined}
                    className={`${ictTrHover} ${rowClassName?.(row) || ''} ${
                      interactive ? 'cursor-pointer' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`ictTd ${ALIGN[col.align || 'left']} ${col.cellClassName || ''}`}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {footer}
    </div>
  );
}
