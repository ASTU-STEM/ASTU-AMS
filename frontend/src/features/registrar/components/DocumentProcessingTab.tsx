import React, { useState, useMemo, useRef } from 'react';
import { DocumentProcessingRequest } from '../types/registrar.types';
import toast from 'react-hot-toast';
import { X, Upload, Download, FileText, CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react';

const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

interface DocumentProcessingTabProps {
  documents: DocumentProcessingRequest[];
  onProcessDocument: (id: string, status: 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'PENDING') => void;
  onApproveDocument: (id: string, file: File) => void;
}

export const DocumentProcessingTab: React.FC<DocumentProcessingTabProps> = ({ documents, onProcessDocument, onApproveDocument }) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [approveModalDoc, setApproveModalDoc] = useState<DocumentProcessingRequest | null>(null);
  const [rejectModalDoc, setRejectModalDoc] = useState<DocumentProcessingRequest | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentProcessingRequest | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeStatus = (status: string) => status.toUpperCase().replace(' ', '_');

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchesFilter = filterStatus === 'All' || normalizeStatus(d.status) === filterStatus;
      const studentId = d.alumni?.studentId || '';
      const fullName = d.alumni?.fullName || '';
      const matchesSearch = !searchQuery ||
        `${studentId} ${fullName} ${d.documentType} ${d.additionalInstructions || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [documents, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: documents.length,
    pending: documents.filter(d => normalizeStatus(d.status) === 'PENDING').length,
    inProgress: documents.filter(d => normalizeStatus(d.status) === 'IN_PROGRESS').length,
    approved: documents.filter(d => normalizeStatus(d.status) === 'APPROVED').length,
    rejected: documents.filter(d => normalizeStatus(d.status) === 'REJECTED').length,
    transcripts: documents.filter(d => d.documentType?.toUpperCase().includes('TRANSCRIPT')).length,
    degrees: documents.filter(d => d.documentType?.toUpperCase().includes('DEGREE') || d.documentType?.toUpperCase().includes('VERIFICATION')).length,
    certificates: documents.filter(d => d.documentType?.toUpperCase().includes('MEDIUM') || d.documentType?.toUpperCase().includes('CERTIFICATE') || d.documentType?.toUpperCase().includes('RECOMMENDATION')).length,
  }), [documents]);

  const getStatusBadge = (status: string) => {
    const norm = normalizeStatus(status);
    const map: Record<string, string> = {
      'APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800 border-blue-200',
      'PENDING': 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return map[norm] || map.PENDING;
  };

  const getDocTypeIcon = (docType: string) => {
    const upper = (docType || '').toUpperCase();
    if (upper.includes('TRANSCRIPT')) return 'description';
    if (upper.includes('DEGREE') || upper.includes('VERIFICATION')) return 'workspace_premium';
    return 'badge';
  };

  const getDocTypeLabel = (docType: string) => {
    const upper = (docType || '').toUpperCase();
    if (upper.includes('TRANSCRIPT')) return 'Official Transcript';
    if (upper.includes('DEGREE')) return 'Degree Verification';
    if (upper.includes('MEDIUM') || upper.includes('CERTIFICATE')) return 'Medium of Instruction Cert';
    if (upper.includes('RECOMMENDATION')) return 'Recommendation Letter';
    return docType;
  };

  const getStatusLabel = (status: string) => {
    const norm = normalizeStatus(status);
    const map: Record<string, string> = {
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'IN_PROGRESS': 'Processing',
      'PENDING': 'Pending',
    };
    return map[norm] || status;
  };

  const handleBulkAction = (status: 'IN_PROGRESS' | 'APPROVED') => {
    const actionable = documents.filter(d =>
      status === 'IN_PROGRESS' ? normalizeStatus(d.status) === 'PENDING' : normalizeStatus(d.status) !== 'APPROVED'
    );
    if (actionable.length === 0) {
      toast.error('No document requests to process.');
      return;
    }
    actionable.forEach(d => onProcessDocument(d.id, status));
    toast.success(`Moved ${actionable.length} document requests to ${getStatusLabel(status)}.`);
  };

  const handleApproveSubmit = async () => {
    if (!approveModalDoc || !selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    setUploading(true);
    try {
      await onApproveDocument(approveModalDoc.id, selectedFile);
      setApproveModalDoc(null);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectModalDoc) return;
    onProcessDocument(rejectModalDoc.id, 'REJECTED');
    toast.success(`Document request for ${rejectModalDoc.alumni?.fullName || 'Alumni'} has been rejected.`);
    setRejectModalDoc(null);
  };

  const getDocumentUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${UPLOAD_BASE}/${path.replace(/^\//, '')}`;
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
            <button onClick={() => handleBulkAction('IN_PROGRESS')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl text-xs font-bold hover:bg-blue-500/30 transition-all">
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

      {/* Stats & Document Type Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Requests</p>
          <p className="text-2xl font-extrabold text-astu-navy mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterStatus('PENDING')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterStatus('IN_PROGRESS')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">In Progress</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.inProgress}</p>
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

      {/* Document Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-700">Official Transcripts</p>
              <p className="text-lg font-extrabold text-blue-800 mt-0.5">{stats.transcripts}</p>
            </div>
            <span className="material-symbols-outlined text-blue-400 text-3xl">description</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-700">Degree Verifications</p>
              <p className="text-lg font-extrabold text-purple-800 mt-0.5">{stats.degrees}</p>
            </div>
            <span className="material-symbols-outlined text-purple-400 text-3xl">workspace_premium</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl p-4 border border-amber-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-700">Other Documents</p>
              <p className="text-lg font-extrabold text-amber-800 mt-0.5">{stats.certificates}</p>
            </div>
            <span className="material-symbols-outlined text-amber-400 text-3xl">badge</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'All' as const, label: 'All', count: stats.total },
            { key: 'PENDING' as const, label: 'Pending', count: stats.pending },
            { key: 'IN_PROGRESS' as const, label: 'Processing', count: stats.inProgress },
            { key: 'APPROVED' as const, label: 'Approved', count: stats.approved },
            { key: 'REJECTED' as const, label: 'Rejected', count: stats.rejected },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === tab.key
                  ? 'bg-astu-navy text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-astu-navy/30 hover:text-astu-navy'
              }`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-sm">search</span>
          <input type="text" placeholder="Search documents..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20 w-56 md:w-72" />
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-gray-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-3">Student ID</th>
                <th className="p-3">Graduate Name</th>
                <th className="p-3">Document Type</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-gray-800">{doc.alumni?.studentId || '—'}</td>
                  <td className="p-3">
                    <p className="font-bold text-gray-900">{doc.alumni?.fullName || '—'}</p>
                    <p className="text-[10px] text-gray-500">{doc.alumni?.email || doc.contactEmail || ''}</p>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-astu-navy/5 text-astu-navy font-semibold rounded-lg text-[10px] border border-astu-navy/10">
                      <span className="material-symbols-outlined text-[10px]">{getDocTypeIcon(doc.documentType)}</span>
                      {getDocTypeLabel(doc.documentType)}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 max-w-[180px] truncate">{doc.additionalInstructions || '—'}</td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStatusBadge(doc.status)}`}>
                      {getStatusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1.5 justify-end flex-wrap">
                      <button onClick={() => setPreviewDoc(doc)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-all flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                      {normalizeStatus(doc.status) === 'PENDING' && (
                        <button onClick={() => onProcessDocument(doc.id, 'IN_PROGRESS')}
                          className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-all flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">play_arrow</span>
                          Process
                        </button>
                      )}
                      {normalizeStatus(doc.status) !== 'APPROVED' && (
                        <button onClick={() => setApproveModalDoc(doc)}
                          className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-all flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </button>
                      )}
                      {normalizeStatus(doc.status) !== 'REJECTED' && normalizeStatus(doc.status) !== 'APPROVED' && (
                        <button onClick={() => setRejectModalDoc(doc)}
                          className="px-2 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Reject
                        </button>
                      )}
                      {normalizeStatus(doc.status) === 'APPROVED' && doc.issuedDocumentUrl && (
                        <a href={getDocumentUrl(doc.issuedDocumentUrl)} target="_blank" rel="noopener noreferrer"
                          className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-all flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          Issued Doc
                        </a>
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

      {/* ── Approve Modal (with file upload) ── */}
      {approveModalDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" onClick={() => { setApproveModalDoc(null); setSelectedFile(null); }}>
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-gradient-to-r from-emerald-50 to-white">
              <div>
                <h3 className="text-base font-bold text-slate-900">Approve & Upload Document</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload the issued document for {approveModalDoc.alumni?.fullName || 'this alumni'}</p>
              </div>
              <button onClick={() => { setApproveModalDoc(null); setSelectedFile(null); }} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Request info */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Student ID</div>
                    <div className="font-medium text-slate-900">{approveModalDoc.alumni?.studentId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Document Type</div>
                    <div className="font-medium text-slate-900">{getDocTypeLabel(approveModalDoc.documentType)}</div>
                  </div>
                </div>
                {approveModalDoc.additionalInstructions && (
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Instructions</div>
                    <div className="text-sm text-slate-700">{approveModalDoc.additionalInstructions}</div>
                  </div>
                )}
              </div>

              {/* File upload area */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Upload Issued Document <span className="text-red-500">*</span></label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    selectedFile
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-slate-300 bg-slate-50 hover:border-astu-navy/40 hover:bg-astu-navy/5'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="h-12 w-12 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-emerald-600" />
                      </div>
                      <p className="text-sm font-semibold text-emerald-800">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-[10px] text-red-600 font-bold hover:underline">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-12 w-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Click to select file</p>
                      <p className="text-xs text-slate-400">PDF, DOC, DOCX, JPG, PNG — Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 border border-blue-100">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Note:</strong> Once approved, the alumni will be notified via email and the document will be available in their portal for download.
                </p>
              </div>
            </div>
            {/* Footer */}
            <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50/80 px-5 py-4 flex justify-end gap-2">
              <button onClick={() => { setApproveModalDoc(null); setSelectedFile(null); }}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleApproveSubmit} disabled={!selectedFile || uploading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? (
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {uploading ? 'Uploading...' : 'Approve & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Confirmation Modal ── */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" onClick={() => setRejectModalDoc(null)}>
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-gradient-to-r from-red-50 to-white">
              <h3 className="text-base font-bold text-slate-900">Confirm Rejection</h3>
              <button onClick={() => setRejectModalDoc(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-700">
                Are you sure you want to reject the <strong>{getDocTypeLabel(rejectModalDoc.documentType)}</strong> request from <strong>{rejectModalDoc.alumni?.fullName || 'this alumni'}</strong>?
              </p>
              <div className="rounded-xl bg-red-50 p-3 border border-red-100">
                <p className="text-xs text-red-800 leading-relaxed">
                  <strong>Warning:</strong> The alumni will be notified of this rejection via email.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 bg-slate-50/80 px-5 py-4 flex justify-end gap-2">
              <button onClick={() => setRejectModalDoc(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleRejectConfirm}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all">
                <XCircle className="h-4 w-4" />
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview / Detail Modal ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" onClick={() => setPreviewDoc(null)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="text-base font-bold text-slate-900">Document Request Details</h3>
                <p className="text-xs text-slate-500">Submitted on {new Date(previewDoc.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Requester</h4>
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Full Name</div>
                        <div className="font-semibold text-slate-900">{previewDoc.alumni?.fullName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Student ID</div>
                          <div className="font-medium text-slate-900">{previewDoc.alumni?.studentId}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Graduation Year</div>
                          <div className="font-medium text-slate-900">{previewDoc.alumni?.graduationYear || '—'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Email</div>
                        <div className="text-sm font-medium text-slate-900 break-all">{previewDoc.alumni?.email || previewDoc.contactEmail || '—'}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Request Details</h4>
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Document Type</div>
                        <div className="font-medium text-slate-900">{getDocTypeLabel(previewDoc.documentType)}</div>
                      </div>
                      {previewDoc.additionalInstructions && (
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Destination / Instructions</div>
                          <div className="text-sm text-slate-700">{previewDoc.additionalInstructions}</div>
                        </div>
                      )}
                      {previewDoc.notes && (
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Notes</div>
                          <div className="text-sm text-slate-700 whitespace-pre-wrap">{previewDoc.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Documents */}
                <div className="space-y-4">
                  {/* Alumni's attached files */}
                  {previewDoc.fileUrls && previewDoc.fileUrls.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Attached Files</h4>
                      <div className="space-y-2">
                        {previewDoc.fileUrls.map((url, idx) => (
                          <a key={idx} href={getDocumentUrl(url)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100 hover:bg-slate-100 transition-colors">
                            <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs font-medium text-slate-700 flex-1 truncate">Attachment {idx + 1}</span>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Issued Document */}
                  {previewDoc.issuedDocumentUrl && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-2">Issued Document</h4>
                      <a href={getDocumentUrl(previewDoc.issuedDocumentUrl)} target="_blank" rel="noopener noreferrer" download
                        className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                        <Download className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-emerald-800 flex-1">Download Issued Document</span>
                        <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
                      </a>
                    </div>
                  )}

                  <div className="rounded-xl p-3 border" style={{ background: normalizeStatus(previewDoc.status) === 'APPROVED' ? '#f0fdf4' : normalizeStatus(previewDoc.status) === 'REJECTED' ? '#fef2f2' : '#fffbeb', borderColor: normalizeStatus(previewDoc.status) === 'APPROVED' ? '#bbf7d0' : normalizeStatus(previewDoc.status) === 'REJECTED' ? '#fecaca' : '#fde68a' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Current Status:</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStatusBadge(previewDoc.status)}`}>
                        {getStatusLabel(previewDoc.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50/80 px-5 py-4 flex justify-end gap-2">
              <button onClick={() => setPreviewDoc(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Close
              </button>
              {normalizeStatus(previewDoc.status) !== 'APPROVED' && (
                <button onClick={() => { setPreviewDoc(null); setApproveModalDoc(previewDoc); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-all">
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
