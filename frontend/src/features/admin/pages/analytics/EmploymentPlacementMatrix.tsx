import React from 'react';
import { Search, Filter, CalendarRange, RotateCcw, X } from 'lucide-react';
import AdminSectionCard from '../../components/AdminSectionCard';
import AdminPagination from '../../components/AdminPagination';

export interface PerformanceMatrixRow {
  department: string;
  year: number | string;
  totalGraduates: number;
  employmentRate: number;
  avgSalary: number;
  docRequestsCount: number;
}

export interface EmploymentPlacementMatrixProps {
  matrixSearch: string;
  setMatrixSearch: (val: string) => void;
  matrixDeptFilter: string;
  setMatrixDeptFilter: (val: string) => void;
  matrixYearFilter: string;
  setMatrixYearFilter: (val: string) => void;
  matrixLimit: '10' | '25' | '50' | '100' | 'all';
  setMatrixLimit: (val: '10' | '25' | '50' | '100' | 'all') => void;
  matrixPage: number;
  setMatrixPage: React.Dispatch<React.SetStateAction<number>>;
  matrixDepartments: string[];
  matrixYears: string[];
  filteredMatrixRecords: PerformanceMatrixRow[];
  paginatedMatrixRecords: PerformanceMatrixRow[];
  totalMatrixPages: number;
  className?: string;
}

export default function EmploymentPlacementMatrix({
  matrixSearch,
  setMatrixSearch,
  matrixDeptFilter,
  setMatrixDeptFilter,
  matrixYearFilter,
  setMatrixYearFilter,
  matrixLimit,
  setMatrixLimit,
  matrixPage,
  setMatrixPage,
  matrixDepartments,
  matrixYears,
  filteredMatrixRecords,
  paginatedMatrixRecords,
  totalMatrixPages,
  className = '',
}: EmploymentPlacementMatrixProps) {
  const isFiltered = Boolean(matrixSearch || matrixDeptFilter !== 'All' || matrixYearFilter !== 'All');

  return (
    <div className={className}>
      <AdminSectionCard
        title="Multi-Year Department Detail Performance Matrix"
        subtitle="Annual employment velocity, average starting salaries, and official document request volumes per academic department."
      >
        {/* Toolbar Filters & Per Page Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 shadow-2xs flex-1 max-w-xs focus-within:border-[#003580] dark:focus-within:border-blue-500">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                placeholder="Search department, year, rate..."
                className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
              {matrixSearch && (
                <button
                  type="button"
                  onClick={() => setMatrixSearch('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </label>

            {matrixDepartments.length > 2 && (
              <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 shadow-2xs">
                <Filter className="h-3.5 w-3.5 text-[#003580] dark:text-blue-400" />
                <select
                  value={matrixDeptFilter}
                  onChange={(e) => setMatrixDeptFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 dark:text-slate-200 outline-none"
                >
                  {matrixDepartments.map((d) => (
                    <option key={d} value={d} className="dark:bg-slate-900">
                      {d === 'All' ? 'All Departments' : d}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {matrixYears.length > 2 && (
              <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 shadow-2xs">
                <CalendarRange className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <select
                  value={matrixYearFilter}
                  onChange={(e) => setMatrixYearFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 dark:text-slate-200 outline-none"
                >
                  {matrixYears.map((y) => (
                    <option key={y} value={y} className="dark:bg-slate-900">
                      {y === 'All' ? 'All Batch Years' : `Class of ${y}`}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setMatrixSearch('');
                  setMatrixDeptFilter('All');
                  setMatrixYearFilter('All');
                }}
                className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Per Page:</span>
            <select
              value={matrixLimit}
              onChange={(e) => {
                setMatrixLimit(e.target.value as any);
                setMatrixPage(1);
              }}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 font-bold text-[#003580] dark:text-blue-400 outline-none shadow-2xs"
            >
              <option value="10" className="dark:bg-slate-900">10 per page</option>
              <option value="25" className="dark:bg-slate-900">25 per page</option>
              <option value="50" className="dark:bg-slate-900">50 per page</option>
              <option value="100" className="dark:bg-slate-900">100 per page</option>
              <option value="all" className="dark:bg-slate-900">All ({filteredMatrixRecords.length} records)</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Department / Program</th>
                  <th className="px-4 py-3 text-center">Batch Year</th>
                  <th className="px-4 py-3 text-right">Graduates</th>
                  <th className="px-4 py-3 text-right">Employment Rate</th>
                  <th className="px-4 py-3 text-right">Avg Starting Salary</th>
                  <th className="px-4 py-3 text-right">Doc Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {paginatedMatrixRecords.length > 0 ? (
                  paginatedMatrixRecords.map((row, idx) => (
                    <tr
                      key={`${row.department}-${row.year}-${idx}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.department}</td>
                      <td className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-300">Class of {row.year}</td>
                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{row.totalGraduates} grads</td>
                      <td className="px-4 py-3 text-right font-extrabold text-[#003580] dark:text-blue-400">{row.employmentRate}%</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        ETB {Number(row.avgSalary).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{row.docRequestsCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 italic">
                      No multi-year department performance records found matching active filter parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Matrix Table Pagination */}
          {matrixLimit !== 'all' && (
            <AdminPagination
              currentPage={matrixPage}
              totalPages={totalMatrixPages}
              totalItems={filteredMatrixRecords.length}
              pageSize={parseInt(matrixLimit, 10)}
              onPageChange={setMatrixPage}
            />
          )}
        </div>
      </AdminSectionCard>
    </div>
  );
}
