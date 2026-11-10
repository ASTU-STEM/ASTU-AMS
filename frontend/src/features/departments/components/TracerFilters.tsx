import React from 'react';
import { Filter, RefreshCw, Download, Save, Building2, Calendar, Users, Briefcase, Lock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { TracerFilterState } from '../types/tracer.types';

interface TracerFiltersProps {
  filters: TracerFilterState;
  onFilterChange: (filters: TracerFilterState) => void;
  onRefresh: () => void;
  onExport: () => void;
  onSaveView?: () => void;
  darkMode?: boolean;
}

export const TracerFilters: React.FC<TracerFiltersProps> = ({
  filters,
  onFilterChange,
  onRefresh,
  onExport,
  onSaveView,
  darkMode = false
}) => {
  const { user } = useAuth();
  const userDept = user?.department || 'Software Engineering';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tracer Reports</h2>
            {!isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-astu-navy/10 text-astu-navy dark:bg-astu-navy/30 dark:text-blue-300">
                <Lock className="h-3 w-3" /> {userDept} Scope
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Graduate employment tracking and longitudinal studies calculated dynamically from database
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onSaveView && (
            <button
              type="button"
              onClick={onSaveView}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm shadow-2xs ${
                darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Save className="h-4 w-4" />
              Save View
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-2xs"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-astu-red hover:bg-red-700 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-2xs"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Department Selector - Locked for Department Head */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center justify-between ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Department
            </span>
            {!isAdmin && <Lock className="h-3 w-3 text-astu-navy" />}
          </label>
          <select
            disabled={!isAdmin}
            value={filters.department || userDept}
            onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${
              !isAdmin ? 'opacity-85 cursor-not-allowed font-semibold bg-gray-100 dark:bg-slate-700/80 border-gray-300 dark:border-slate-600' : ''
            } ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
          >
            {!isAdmin ? (
              <option value={userDept}>{userDept} (Locked)</option>
            ) : (
              <>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Applied Geology">Applied Geology</option>
              </>
            )}
          </select>
        </div>

        {/* Tracer Period Selector */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Calendar className="h-3.5 w-3.5" />
            Tracer Period
          </label>
          <select
            value={filters.tracerPeriod}
            onChange={(e) => onFilterChange({ ...filters, tracerPeriod: e.target.value as any })}
            className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="all">All Periods</option>
            <option value="6months">6 Months Post-Graduation</option>
            <option value="12months">12 Months Post-Graduation</option>
            <option value="18months">18 Months Post-Graduation</option>
            <option value="24months">24 Months Post-Graduation</option>
          </select>
        </div>

        {/* Graduation Batch Filter */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Users className="h-3.5 w-3.5" />
            Graduation Batch
          </label>
          <select
            value={filters.graduationBatch}
            onChange={(e) => onFilterChange({ ...filters, graduationBatch: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Batches</option>
            <option value="2024">Batch 2024</option>
            <option value="2023">Batch 2023</option>
            <option value="2022">Batch 2022</option>
            <option value="2021">Batch 2021</option>
            <option value="2020">Batch 2020</option>
          </select>
        </div>

        {/* Academic Year Filter */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Calendar className="h-3.5 w-3.5" />
            Academic Year
          </label>
          <select
            value={filters.academicYear}
            onChange={(e) => onFilterChange({ ...filters, academicYear: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>

        {/* Employment Status Filter */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Briefcase className="h-3.5 w-3.5" />
            Employment Status
          </label>
          <select
            value={filters.employmentStatus}
            onChange={(e) => onFilterChange({ ...filters, employmentStatus: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Statuses</option>
            <option value="employed">Employed</option>
            <option value="self-employed">Self-Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="further-study">Further Study</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TracerFilters;
