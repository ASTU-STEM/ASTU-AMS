import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { SkillGapRecord } from '../types/skillGap.types';

interface SkillGapTableProps {
  records: SkillGapRecord[];
  darkMode?: boolean;
}

export const SkillGapTable: React.FC<SkillGapTableProps> = ({ records, darkMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof SkillGapRecord>('skill');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    department: '',
    category: '',
    priority: '',
  });

  const itemsPerPage = 10;

  // Dynamically derive unique departments and categories from database records
  const availableDepartments = Array.from(new Set(records.map(r => r.affectedDepartment))).filter(Boolean);
  const availableCategories = Array.from(new Set(records.map(r => r.category))).filter(Boolean);

  // Filter and search
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.affectedDepartment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filters.department || record.affectedDepartment === filters.department;
    const matchesCategory = !filters.category || record.category === filters.category;
    const matchesPriority = !filters.priority || record.priority === filters.priority;

    return matchesSearch && matchesDepartment && matchesCategory && matchesPriority;
  });

  // Sort
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage) || 1;
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: keyof SkillGapRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['Skill', 'Category', 'Demand Level (%)', 'Coverage Level (%)', 'Gap Score (%)', 'Affected Department', 'Priority'];
    const rows = filteredRecords.map(r => [
      `"${r.skill.replace(/"/g, '""')}"`,
      `"${r.category.replace(/"/g, '""')}"`,
      r.demandLevel,
      r.coverageLevel,
      r.gapScore,
      `"${r.affectedDepartment.replace(/"/g, '""')}"`,
      r.priority
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'skill_gap_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityColor = (priority: SkillGapRecord['priority']) => {
    switch (priority) {
      case 'immediate':
        return 'text-astu-red bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      {/* Header */}
      <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200/60'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Skill Gap Records</h3>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all w-64 ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
              />
            </div>
            
            {availableDepartments.length > 1 && (
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className={`px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
              >
                <option value="">All Departments</option>
                {availableDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}
            
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className={`px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
            >
              <option value="">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className={`px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
            >
              <option value="">All Priorities</option>
              <option value="immediate">Immediate</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <button
              onClick={handleExport}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-astu-navy hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 font-medium text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={darkMode ? 'bg-slate-700' : 'bg-gray-50'}>
            <tr>
              {[
                { key: 'skill', label: 'Skill' },
                { key: 'category', label: 'Category' },
                { key: 'demandLevel', label: 'Demand Level' },
                { key: 'coverageLevel', label: 'Coverage Level' },
                { key: 'gapScore', label: 'Gap Score' },
                { key: 'affectedDepartment', label: 'Affected Department' },
                { key: 'priority', label: 'Priority' },
              ].map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key as keyof SkillGapRecord)}
                  className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${darkMode ? 'text-gray-400 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortColumn === column.key && (
                      <ArrowUpDown className="h-3 w-3 text-astu-navy" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={darkMode ? 'divide-y divide-slate-700' : 'divide-y divide-gray-200'}>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500 opacity-60" />
                    <p className="text-sm font-medium">No skill gap records match your filter criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr key={record.id} className={darkMode ? 'hover:bg-slate-700 transition-colors' : 'hover:bg-gray-50 transition-colors'}>
                  <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{record.skill}</td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-16 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                        <div className="bg-astu-green h-full rounded-full" style={{ width: `${record.demandLevel}%` }}></div>
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{record.demandLevel}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-16 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${record.coverageLevel}%` }}></div>
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{record.coverageLevel}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-16 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                        <div className={`h-full rounded-full ${
                          record.gapScore >= 40 ? 'bg-astu-red' :
                          record.gapScore >= 30 ? 'bg-yellow-500' :
                          'bg-astu-green'
                        }`} style={{ width: `${record.gapScore}%` }}></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        record.gapScore >= 40 ? 'text-astu-red' :
                        record.gapScore >= 30 ? 'text-yellow-600' :
                        'text-astu-green'
                      }`}>{record.gapScore}%</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.affectedDepartment}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(record.priority)}`}>
                      {record.priority}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={`px-6 py-4 border-t flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-gray-200/60'}`}>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {sortedRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedRecords.length)} of {sortedRecords.length} records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || sortedRecords.length === 0}
            className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-astu-navy text-white'
                    : darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || sortedRecords.length === 0}
            className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillGapTable;
