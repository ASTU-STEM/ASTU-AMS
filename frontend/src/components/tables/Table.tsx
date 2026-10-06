import React from 'react';
import { getStatusColor } from '../../utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found',
  onRowClick,
  className = '',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-8 text-center text-on-surface-variant">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-[var(--bg-page)] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-outline-variant p-8 text-center">
        <svg className="w-12 h-12 mx-auto text-on-surface-variant/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-sm text-on-surface-variant">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {data.map((item, idx) => (
              <tr
                key={idx}
                className={`bg-[var(--bg-card)] transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-container-low' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3 text-sm text-on-surface">
                    {col.render
                      ? col.render(item)
                      : (item[col.key as keyof T] as React.ReactNode) ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}
