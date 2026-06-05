import React from 'react';
import { Filter, RefreshCw, Download, Save, Building2, Calendar, Users, Briefcase } from 'lucide-react';
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
  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tracer Reports</h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Graduate employment tracking and longitudinal studies</p>
        </div>
        <div className="flex items-center gap-3">
          {onSaveView && (
            <button
              onClick={onSaveView}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <Save className="h-4 w-4" />
              Save View
            </button>
          )}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-astu-red hover:bg-red-700 text-white rounded-xl transition-all duration-300 font-medium text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Department Selector */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Building2 className="h-3.5 w-3.5" />
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          >
            <option value="">All Departments</option>
            <option value="software-engineering">Software Engineering</option>
            <option value="mechanical-engineering">Mechanical Engineering</option>
            <option value="civil-engineering">Civil Engineering</option>
            <option value="electrical-engineering">Electrical Engineering</option>
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
            <option value="6months">6 Months</option>
            <option value="12months">12 Months</option>
            <option value="24months">24 Months</option>
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
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
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
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
            <option value="2021-22">2021-22</option>
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
