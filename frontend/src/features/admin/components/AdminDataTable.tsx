import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Search } from 'lucide-react';
import type { AdminDataTableProps } from '../types/admin.types';

function asComparable(value: unknown) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) && value.trim() !== '' ? parsed : value.toLowerCase();
  }
  return String(value).toLowerCase();
}

export default function AdminDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyState = 'No records found.',
  emptyIcon: EmptyIcon,
  isLoading = false,
  pageSize = 25,
  getRowId,
  onRowClick,
  bulkSelection = false,
  selectedRowIds,
  onSelectedRowIdsChange,
}: AdminDataTableProps<T>) {
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const controlledSelected = selectedRowIds ?? internalSelected;

  const handleSelectedChange = (next: string[]) => {
    if (onSelectedRowIdsChange) {
      onSelectedRowIdsChange(next);
      return;
    }
    setInternalSelected(next);
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key as keyof T];
        return val != null && String(val).toLowerCase().includes(query);
      })
    );
  }, [data, columns, searchQuery]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;

    const column = columns.find((item) => item.key === sortKey);
    if (!column) return filtered;

    const accessor = column.accessor;
    const getValue = (row: T) => {
      if (typeof accessor === 'function') return accessor(row);
      if (accessor) return row[accessor];
      return row[column.key as keyof T];
    };

    return [...filtered].sort((left, right) => {
      const a = asComparable(getValue(left));
      const b = asComparable(getValue(right));
      if (a < b) return sortDirection === 'asc' ? -1 : 1;
      if (a > b) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [columns, filtered, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [page, pageSize, sorted]);

  const isAllSelected = bulkSelection && pageRows.length > 0 && pageRows.every((row, index) => {
    const rowId = getRowId ? getRowId(row, index) : String(startingIndex(page, pageSize) + index);
    return controlledSelected.includes(rowId);
  });

  const toggleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const toggleRow = (row: T, index: number, checked: boolean) => {
    const rowId = getRowId ? getRowId(row, index) : String(startingIndex(page, pageSize) + index);
    const next = checked
      ? Array.from(new Set([...controlledSelected, rowId]))
      : controlledSelected.filter((value) => value !== rowId);
    handleSelectedChange(next);
  };

  const togglePageSelection = (checked: boolean) => {
    const rowIds = pageRows.map((row, index) => (getRowId ? getRowId(row, index) : String(startingIndex(page, pageSize) + index)));
    if (checked) {
      handleSelectedChange(Array.from(new Set([...controlledSelected, ...rowIds])));
    } else {
      handleSelectedChange(controlledSelected.filter((id) => !rowIds.includes(id)));
    }
  };

  const exportCsv = () => {
    const headers = columns.map((c) => c.header);
    const body = sorted.map((row) =>
      columns.map((col) => {
        const val = row[col.key as keyof T];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      })
    );
    const csv = [headers, ...body].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="admin-card overflow-hidden rounded-[10px] border shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[var(--border-color)] px-5 py-4">
          <div className="h-4 w-40 animate-pulse rounded bg-[var(--bg-page)]" />
        </div>
        <div className="divide-y divide-[var(--border-color)]">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid animate-pulse grid-cols-6 gap-4 px-5 py-4">
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-4 rounded bg-[var(--bg-page)]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden rounded-[10px] border shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[var(--border-color)] px-5 py-3 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 rounded-[8px] border border-[var(--border-color)] px-3 py-1.5 text-sm flex-1 max-w-sm">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${data.length} records...`}
            className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400"
          />
        </label>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border-color)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[#003580] transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border-color)] text-sm">
          <thead className="bg-[var(--bg-page)]">
            <tr>
              {bulkSelection && (
                <th className="w-12 px-5 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(event) => togglePageSelection(event.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-color)] text-[#003580] focus:ring-[#003580]"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  role={column.sortable ? 'button' : undefined}
                  onClick={() => toggleSort(column.key, column.sortable)}
                  className={[
                    'px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className || '',
                    column.sortable ? 'cursor-pointer select-none hover:text-[#003580] transition-colors' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="inline-flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {pageRows.length === 0 ? (
              <tr>
                <td className="px-5 py-16" colSpan={columns.length + (bulkSelection ? 1 : 0)}>
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-page)]">
                      {EmptyIcon ? <EmptyIcon className="h-6 w-6 text-[var(--text-muted)]" /> : <Search className="h-6 w-6 text-[var(--text-muted)]" />}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[var(--text-secondary)]">{emptyState}</p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">Try adjusting your search or filter criteria.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, rowIndex) => {
                const rowId = getRowId ? getRowId(row, rowIndex) : String(startingIndex(page, pageSize) + rowIndex);
                const isSelected = controlledSelected.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={[
                      'transition-colors hover:bg-[var(--bg-page)]',
                      onRowClick ? 'cursor-pointer' : '',
                      isSelected ? 'bg-[#003580]/5' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onRowClick?.(row)}
                  >
                    {bulkSelection && (
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) => toggleRow(row, rowIndex, event.target.checked)}
                          onClick={(event) => event.stopPropagation()}
                          className="h-4 w-4 rounded border-[var(--border-color)] text-[#003580] focus:ring-[#003580]"
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const value =
                        typeof column.accessor === 'function'
                          ? column.accessor(row)
                          : column.accessor
                            ? (row[column.accessor] as React.ReactNode)
                            : (row[column.key as keyof T] as React.ReactNode);

                      return (
                        <td
                          key={column.key}
                          className={[
                            'px-5 py-4 text-[var(--text-secondary)]',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.className || '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-[var(--border-color)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Showing {pageRows.length === 0 ? 0 : startingIndex(page, pageSize) + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}
            {searchQuery && ` (filtered from ${data.length})`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#003580] hover:text-[#003580] disabled:cursor-not-allowed disabled:opacity-40 transition-all"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#003580] hover:text-[#003580] disabled:cursor-not-allowed disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-20 text-center text-xs font-medium text-[var(--text-secondary)]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#003580] hover:text-[#003580] disabled:cursor-not-allowed disabled:opacity-40 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#003580] hover:text-[#003580] disabled:cursor-not-allowed disabled:opacity-40 transition-all"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function startingIndex(page: number, pageSize: number) {
  return (page - 1) * pageSize;
}
