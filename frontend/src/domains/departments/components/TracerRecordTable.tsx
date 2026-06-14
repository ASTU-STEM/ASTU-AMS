import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { TracerRecord } from '../types/tracer.types';

interface TracerRecordTableProps {
  records: TracerRecord[];
  darkMode?: boolean;
}

export const TracerRecordTable: React.FC<TracerRecordTableProps> = ({ records, darkMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof TracerRecord>('graduate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    employmentStatus: '',
    batch: '',
  });

  const itemsPerPage = 10;

  // Filter and search
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.graduate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.employmentStatus || record.employmentStatus === filters.employmentStatus;
    const matchesBatch = !filters.batch || record.batch === filters.batch;

    return matchesSearch && matchesStatus && matchesBatch;
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
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: keyof TracerRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting records...');
  };

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      {/* Header */}
      <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200/60'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tracer Records</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search graduates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all w-64 ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
              />
            </div>
            
            <select
              value={filters.employmentStatus}
              onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value })}
              className={`px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
            >
              <option value="">All Statuses</option>
              <option value="employed">Employed</option>
              <option value="self-employed">Self-Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="further-study">Further Study</option>
            </select>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-astu-navy hover:bg-blue-900 text-white rounded-xl transition-all duration-300 font-medium text-sm"
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
                { key: 'graduate', label: 'Graduate' },
                { key: 'batch', label: 'Batch' },
                { key: 'surveyType', label: 'Survey Type' },
                { key: 'surveyDate', label: 'Survey Date' },
                { key: 'employmentStatus', label: 'Employment Status' },
                { key: 'company', label: 'Company' },
                { key: 'country', label: 'Country' },
                { key: 'salaryRange', label: 'Salary Range' },
                { key: 'alignmentScore', label: 'Alignment' },
                { key: 'satisfactionScore', label: 'Satisfaction' },
              ].map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key as keyof TracerRecord)}
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
            {paginatedRecords.map((record) => (
              <tr key={record.id} className={darkMode ? 'hover:bg-slate-700 transition-colors' : 'hover:bg-gray-50 transition-colors'}>
                <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{record.graduate}</td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.batch}</td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.surveyType}</td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.surveyDate}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    record.employmentStatus === 'employed' ? 'bg-emerald-100 text-emerald-800' :
                    record.employmentStatus === 'self-employed' ? 'bg-blue-100 text-blue-800' :
                    record.employmentStatus === 'unemployed' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {record.employmentStatus}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.company}</td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.country}</td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.salaryRange}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-16 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full ${
                          record.alignmentScore >= 80 ? 'bg-astu-green' :
                          record.alignmentScore >= 60 ? 'bg-yellow-500' :
                          'bg-astu-red'
                        }`}
                        style={{ width: `${record.alignmentScore}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{record.alignmentScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-16 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full ${
                          record.satisfactionScore >= 8 ? 'bg-astu-green' :
                          record.satisfactionScore >= 6 ? 'bg-yellow-500' :
                          'bg-astu-red'
                        }`}
                        style={{ width: `${record.satisfactionScore * 10}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{record.satisfactionScore}/10</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={`px-6 py-4 border-t flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-gray-200/60'}`}>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedRecords.length)} of {sortedRecords.length} records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
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
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TracerRecordTable;
