import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { AccreditationEvidenceRecord } from '../types/accreditation.types';

interface AccreditationEvidenceTableProps {
  records: AccreditationEvidenceRecord[];
}

export const AccreditationEvidenceTable: React.FC<AccreditationEvidenceTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof AccreditationEvidenceRecord>('evidenceItem');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
  });

  const itemsPerPage = 10;

  const safeRecords = Array.isArray(records) ? records : [];

  // Filter and search
  const filteredRecords = safeRecords.filter(record => {
    const matchesSearch = 
      (record.evidenceItem || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.source || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || record.category === filters.category;
    const matchesStatus = !filters.status || record.status === filters.status;

    return matchesSearch && matchesCategory && matchesStatus;
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

  const handleSort = (column: keyof AccreditationEvidenceRecord) => {
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

  const getStatusColor = (status: AccreditationEvidenceRecord['status']) => {
    switch (status) {
      case 'compliant':
        return 'text-astu-green bg-green-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      case 'non-compliant':
        return 'text-astu-red bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/60">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <h3 className="text-xl font-bold text-gray-900">Accreditation Evidence Records</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search evidence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 focus:bg-white transition-all w-64"
              />
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 focus:bg-white transition-all"
            >
              <option value="">All Categories</option>
              <option value="Tracer Evidence">Tracer Evidence</option>
              <option value="Employer Evidence">Employer Evidence</option>
              <option value="Skill Gap Evidence">Skill Gap Evidence</option>
              <option value="Curriculum Evidence">Curriculum Evidence</option>
              <option value="Graduate Outcome Evidence">Graduate Outcome Evidence</option>
              <option value="Department Evidence">Department Evidence</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 focus:bg-white transition-all"
            >
              <option value="">All Statuses</option>
              <option value="compliant">Compliant</option>
              <option value="partial">Partial</option>
              <option value="non-compliant">Non-Compliant</option>
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
                { key: 'evidenceItem', label: 'Evidence Item' },
                { key: 'category', label: 'Category' },
                { key: 'source', label: 'Source' },
                { key: 'status', label: 'Status' },
                { key: 'completion', label: 'Completion %' },
                { key: 'owner', label: 'Owner' },
                { key: 'lastUpdated', label: 'Last Updated' },
                { key: 'actionRequired', label: 'Action Required' },
              ].map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key as keyof AccreditationEvidenceRecord)}
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
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.evidenceItem}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.category}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.source}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-astu-navy h-full rounded-full" style={{ width: `${record.completion}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{record.completion}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.owner}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.lastUpdated}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.actionRequired}</td>
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

export default AccreditationEvidenceTable;
