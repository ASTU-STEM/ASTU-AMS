import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown, Star } from 'lucide-react';
import { EmployerFeedbackRecord } from '../types/employerFeedback.types';

interface EmployerFeedbackTableProps {
  records: EmployerFeedbackRecord[];
}

export const EmployerFeedbackTable: React.FC<EmployerFeedbackTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof EmployerFeedbackRecord>('employer');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    department: '',
    industry: '',
  });

  const itemsPerPage = 10;

  // Filter and search
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filters.department || record.department === filters.department;
    const matchesIndustry = !filters.industry || record.industry === filters.industry;

    return matchesSearch && matchesDepartment && matchesIndustry;
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

  const handleSort = (column: keyof EmployerFeedbackRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    console.log('Exporting records...');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/60">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">Employer Feedback Records</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 focus:bg-white transition-all w-64"
              />
            </div>
            
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 focus:bg-white transition-all"
            >
              <option value="">All Departments</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
            </select>
            
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 focus:bg-white transition-all"
            >
              <option value="">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Aviation">Aviation</option>
              <option value="Finance">Finance</option>
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
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'employer', label: 'Employer' },
                { key: 'industry', label: 'Industry' },
                { key: 'department', label: 'Department' },
                { key: 'rating', label: 'Rating' },
                { key: 'graduatesHired', label: 'Graduates Hired' },
                { key: 'satisfaction', label: 'Satisfaction' },
                { key: 'lastActivity', label: 'Last Activity' },
              ].map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key as keyof EmployerFeedbackRecord)}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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
          <tbody className="divide-y divide-gray-200">
            {paginatedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.employer}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.industry}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.department}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">{record.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.graduatesHired}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          record.satisfaction >= 8 ? 'bg-astu-green' :
                          record.satisfaction >= 6 ? 'bg-yellow-500' :
                          'bg-astu-red'
                        }`}
                        style={{ width: `${record.satisfaction * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{record.satisfaction}/10</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200/60 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedRecords.length)} of {sortedRecords.length} records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerFeedbackTable;
