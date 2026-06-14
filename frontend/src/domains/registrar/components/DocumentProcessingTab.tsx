import React, { useState, useMemo } from 'react';
import { DocumentProcessingRequest } from '../types/registrar.types';
import toast from 'react-hot-toast';

interface DocumentProcessingTabProps {
  documents: DocumentProcessingRequest[];
  onProcessDocument: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => void;
  darkMode?: boolean;
}

export const DocumentProcessingTab: React.FC<DocumentProcessingTabProps> = ({ documents, onProcessDocument }) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'PENDING' | 'APPROVED' | 'REJECTED'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchesFilter = filterStatus === 'All' || d.status === filterStatus;
      const matchesSearch = !searchQuery ||
        `${d.alumniId} ${d.documentType} ${d.createdAt}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [documents, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: documents.length,
    pending: documents.filter(d => d.status === 'PENDING').length,
    approved: documents.filter(d => d.status === 'APPROVED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
  }), [documents]);

  const handleUpdate = (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', identifier: string) => {
    onProcessDocument(id, status);
    toast.success(`Document request for ${identifier} marked as ${status}.`);
  };

  const handleBulkAction = (status: 'PENDING' | 'APPROVED') => {
    const actionable = documents.filter(d => status === 'PENDING' ? d.status === 'PENDING' : d.status !== 'APPROVED');
    if (actionable.length === 0) {
      toast.error('No document requests to process.');
      return;
    }
    actionable.forEach(d => onProcessDocument(d.id, status));
    toast.success(`Moved ${actionable.length} document requests to ${status}.`);
  };

  const getStatusBadge = (status: DocumentProcessingRequest['status']) => {
    const map = {
      'APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'PENDING': 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return map[status] || map.PENDING;
  };

  return (
    <div className="space-y-6">

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-astu-navy via-[#002a55] to-emerald-800 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">Document Workflow</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Document Processing Queue</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">Review and authorize transcript requests, degree verifications, and certification documents with digital signatures.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => handleBulkAction('PENDING')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl text-xs font-bold hover:bg-blue-500/30 transition-all">
              <span className="material-symbols-outlined text-sm">playlist_add_check</span>
              Process All Pending
            </button>
            <button onClick={() => handleBulkAction('APPROVED')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all">
              <span className="material-symbols-outlined text-sm">done_all</span>
              Approve All
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Requests</p>
          <p className="text-2xl font-extrabold text-astu-navy mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterStatus('PENDING')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterStatus('APPROVED')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Approved</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterStatus('REJECTED')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Rejected</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2">
          {(['All', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(tab => (
            <button key={tab} onClick={() => setFilterStatus(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === tab
                  ? 'bg-astu-navy text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-astu-navy/30 hover:text-astu-navy'
              }`}>
              {tab === 'PENDING' ? 'Pending' : tab === 'APPROVED' ? 'Approved' : tab === 'REJECTED' ? 'Rejected' : tab}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-sm">search</span>
          <input type="text" placeholder="Search documents..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20 w-56" />
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-gray-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-3">Alumni ID</th>
                <th className="p-3">Document Type</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-gray-800">{doc.alumniId}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-astu-navy/5 text-astu-navy font-semibold rounded-lg text-[10px] border border-astu-navy/10">
                      <span className="material-symbols-outlined text-[10px]">description</span>
                      {doc.documentType}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{doc.createdAt}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStatusBadge(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      {doc.status === 'PENDING' && (
                        <button onClick={() => handleUpdate(doc.id, 'APPROVED', doc.alumniId)}
                          className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-all flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check</span>
                          Approve
                        </button>
                      )}
                      {doc.status !== 'REJECTED' && (
                        <button onClick={() => handleUpdate(doc.id, 'REJECTED', doc.alumniId)}
                          className="px-2 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">close</span>
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDocs.length === 0 && (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300">file_copy</span>
            <p className="mt-2 text-sm text-gray-400">No document requests match your criteria.</p>
          </div>
        )}
        <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50">
          <span className="text-[11px] text-gray-500 font-medium">
            Showing {filteredDocs.length} of {documents.length} requests
          </span>
          <span className="text-[10px] text-gray-400">
            Queue updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

    </div>
  );
};
