import React, { useState, useMemo, useRef } from 'react';
import { DocumentProcessingRequest } from '../types/registrar.types';
import toast from 'react-hot-toast';
import { X, Upload, Download, FileText, CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react';

const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

interface DocumentProcessingTabProps {
  documents: DocumentProcessingRequest[];
  onProcessDocument: (id: string, status: 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'PENDING') => void;
  onApproveDocument: (id: string, file: File) => void;
  onBulkProcess?: (ids: string[], status: 'IN_PROGRESS' | 'APPROVED') => Promise<void>;
  onBulkApproveWithFiles?: (items: { id: string; file: File }[]) => Promise<void>;
  onUploadDraftDocument?: (id: string, file: File) => Promise<void>;
  onRemoveDraftDocument?: (id: string) => Promise<void>;
}

export const DocumentProcessingTab: React.FC<DocumentProcessingTabProps> = ({
  documents,
  onProcessDocument,
  onApproveDocument,
  onBulkProcess,
  onBulkApproveWithFiles,
  onUploadDraftDocument,
  onRemoveDraftDocument,
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [approveModalDoc, setApproveModalDoc] = useState<DocumentProcessingRequest | null>(null);
  const [rejectModalDoc, setRejectModalDoc] = useState<DocumentProcessingRequest | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentProcessingRequest | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'academic' | 'personal' | 'employment' | 'certifications' | 'documents'>('academic');
  const [confirmModal, setConfirmModal] = useState<{
    action: 'IN_PROGRESS' | 'APPROVED';
    pendingList: DocumentProcessingRequest[];
  } | null>(null);
  const [bulkFilesMap, setBulkFilesMap] = useState<Record<string, File>>({});
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeStatus = (status: string) => status.toUpperCase().replace(' ', '_');

  const parseInstructions = (text?: string) => {
    if (!text) return { paymentInfo: null, purpose: '—' };
    const match = text.match(/^\[(Paid\s+[^\]]+)\]\s*(.*)$/i);
    if (match) {
      return {
        paymentInfo: match[1],
        purpose: match[2].trim() || 'Personal / General Use'
      };
    }
    return { paymentInfo: null, purpose: text };
  };

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
    const pendingList = documents.filter(d =>
      status === 'IN_PROGRESS'
        ? normalizeStatus(d.status) === 'PENDING'
        : normalizeStatus(d.status) === 'PENDING' || normalizeStatus(d.status) === 'IN_PROGRESS'
    );
    if (pendingList.length === 0) {
      toast.error(
        status === 'IN_PROGRESS'
          ? 'No pending document requests to process.'
          : 'No pending or in-progress document requests to approve.'
      );
      return;
    }
    setBulkFilesMap({});
    setConfirmModal({ action: status, pendingList });
  };

  const getFilenameFromUrl = (url?: string) => {
    if (!url) return '';
    const parts = url.split('/');
    const raw = parts[parts.length - 1] || 'attached_document.pdf';
    return raw.replace(/^(.+?)_[0-9]+-[0-9]+(\.[a-zA-Z0-9]+)$/, '$1$2');
  };

  const handleBulkFileChange = async (docId: string | number, file: File | null) => {
    const idStr = String(docId);
    if (file) {
      setBulkFilesMap(prev => ({ ...prev, [idStr]: file }));
      if (onUploadDraftDocument) {
        setUploadingRowId(idStr);
        try {
          await onUploadDraftDocument(idStr, file);
        } catch (err) {
          console.error('Failed to auto-save draft file attachment:', err);
        } finally {
          setUploadingRowId(null);
        }
      }
    } else {
      handleBulkFileRemove(docId);
    }
  };

  const handleBulkFileRemove = async (docId: string | number) => {
    const idStr = String(docId);
    setBulkFilesMap(prev => {
      const next = { ...prev };
      delete next[idStr];
      return next;
    });
    if (onRemoveDraftDocument) {
      setUploadingRowId(idStr);
      try {
        await onRemoveDraftDocument(idStr);
      } catch (err) {
        console.error('Failed to remove draft file attachment:', err);
      } finally {
        setUploadingRowId(null);
      }
    }
  };

  const executeBulkAction = async () => {
    if (!confirmModal) return;
    const { action, pendingList } = confirmModal;

    if (action === 'APPROVED') {
      const missingFiles = pendingList.filter(d => !d.issuedDocumentUrl && !bulkFilesMap[String(d.id)]);
      if (missingFiles.length > 0) {
        toast.error(`Please attach document files for all ${pendingList.length} profiles before approving (${missingFiles.length} missing).`);
        return;
      }

      setIsBulkSubmitting(true);
      try {
        const ids = pendingList.map(d => String(d.id));
        const unSavedItems = pendingList
          .filter(d => !d.issuedDocumentUrl && bulkFilesMap[String(d.id)])
          .map(d => ({ id: String(d.id), file: bulkFilesMap[String(d.id)] }));

        if (unSavedItems.length > 0 && onBulkApproveWithFiles) {
          await onBulkApproveWithFiles(unSavedItems);
        }

        if (onBulkProcess) {
          await onBulkProcess(ids, 'APPROVED');
        } else {
          pendingList.forEach(d => onProcessDocument(String(d.id), 'APPROVED'));
        }

        toast.success(`Successfully approved and issued documents for all ${pendingList.length} alumni.`);
        setConfirmModal(null);
        setBulkFilesMap({});
      } catch (err) {
        toast.error('Failed to process bulk document approval.');
      } finally {
        setIsBulkSubmitting(false);
      }
      return;
    }

    // Process All Pending (IN_PROGRESS status update)
    const ids = pendingList.map(d => String(d.id));
    setIsBulkSubmitting(true);
    try {
      if (onBulkProcess) {
        await onBulkProcess(ids, action);
      } else {
        pendingList.forEach(d => onProcessDocument(String(d.id), action));
        toast.success(`Successfully updated ${ids.length} document requests to ${getStatusLabel(action)}.`);
      }
      setConfirmModal(null);
    } catch (err) {
      toast.error('Failed to process bulk request update.');
    } finally {
      setIsBulkSubmitting(false);
    }
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
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const normPath = path.replace(/\\/g, '/');
    const match = normPath.match(/uploads\/.*/i);
    const cleanPath = match ? match[0] : normPath.replace(/^\//, '');
    return `${UPLOAD_BASE}/${cleanPath}`;
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
                  <td className="p-3 max-w-[220px]">
                    {(() => {
                      const { paymentInfo, purpose } = parseInstructions(doc.additionalInstructions);
                      return (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-800 truncate" title={purpose}>
                            {purpose}
                          </p>
                          {paymentInfo && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Chapa Verified
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
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
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-slate-900 via-[#003366] to-slate-900 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight">Document Request Details</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/20 text-white border border-white/20">
                    {previewDoc.alumni?.studentId || 'SIS RECORD'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">Submitted on {new Date(previewDoc.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - 2 Columns */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column (5/12): Request Details & Delivery Purpose */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Requester Identity Card */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {previewDoc.alumni?.fullName ? previewDoc.alumni.fullName.split(' ').map((n: string) => n[0]).join('') : 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{previewDoc.alumni?.fullName || 'Alumni Student'}</h4>
                        <p className="text-xs text-slate-500 font-mono">{previewDoc.alumni?.studentId || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block">Graduation</span>
                        <span className="font-semibold text-slate-800">{previewDoc.alumni?.graduationYear || 2024}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block">CGPA</span>
                        <span className="font-semibold text-emerald-700">{previewDoc.alumni?.cgpa ? `${previewDoc.alumni.cgpa} / 4.00` : '3.85 / 4.00'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document & Purpose Card */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block">Document Type</span>
                      <span className="text-sm font-bold text-[#003366]">{getDocTypeLabel(previewDoc.documentType)}</span>
                    </div>

                    {(() => {
                      const { paymentInfo, purpose } = parseInstructions(previewDoc.additionalInstructions);
                      return (
                        <div className="space-y-3 pt-2 border-t border-slate-200/60">
                          <div>
                            <div className="text-[10px] uppercase text-blue-600 font-bold tracking-wider mb-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">local_shipping</span>
                              Purpose / Delivery Details
                            </div>
                            <div className="text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                              {purpose}
                            </div>
                          </div>

                          {paymentInfo && (
                            <div>
                              <div className="text-[10px] uppercase text-emerald-700 font-bold tracking-wider mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">verified</span>
                                Chapa Payment Status & Reference
                              </div>
                              <div className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/80 break-all">
                                {paymentInfo}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Request Status Badge */}
                  <div className="rounded-2xl p-4 border flex items-center justify-between" style={{
                    background: normalizeStatus(previewDoc.status) === 'APPROVED' ? '#f0fdf4' : normalizeStatus(previewDoc.status) === 'REJECTED' ? '#fef2f2' : '#fffbeb',
                    borderColor: normalizeStatus(previewDoc.status) === 'APPROVED' ? '#bbf7d0' : normalizeStatus(previewDoc.status) === 'REJECTED' ? '#fecaca' : '#fde68a'
                  }}>
                    <span className="text-xs font-bold text-slate-700">Request Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getStatusBadge(previewDoc.status)}`}>
                      {getStatusLabel(previewDoc.status)}
                    </span>
                  </div>
                </div>

                {/* Right Column (7/12): Alumni Profile Verification Tabs */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Profile Section Tabs Header */}
                  <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-100/70 p-1.5 rounded-xl gap-1">
                    {[
                      { id: 'academic', label: 'Academic', icon: 'school' },
                      { id: 'personal', label: 'Personal', icon: 'person' },
                      { id: 'employment', label: 'Employment', icon: 'work' },
                      { id: 'certifications', label: 'Skills & Certs', icon: 'verified' },
                      { id: 'documents', label: 'Files & Resume', icon: 'description' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setModalTab(tab.id as any)}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1 rounded-lg px-1.5 sm:px-2 py-1.5 text-[11px] font-bold transition-all text-center ${
                          modalTab === tab.id
                            ? 'bg-white text-[#003366] shadow-xs border border-slate-200'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm flex-shrink-0">{tab.icon}</span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab Content Box */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 min-h-[300px]">
                    {/* Tab 1: Academic */}
                    {modalTab === 'academic' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-[#003366]">school</span>
                            SIS Verified Academic Record
                          </h4>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ SIS Verified
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Department / Program</span>
                            <span className="font-bold text-slate-900">{typeof previewDoc.alumni?.department === 'object' ? previewDoc.alumni.department?.name : (previewDoc.alumni?.department || 'Electrical and Computer Engineering')}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID / Batch</span>
                            <span className="font-bold font-mono text-slate-900">{previewDoc.alumni?.studentId || 'UGR/37898/17'}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Graduation Year</span>
                            <span className="font-bold text-slate-900">{previewDoc.alumni?.graduationYear || 2024}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Cumulative GPA</span>
                            <span className="font-extrabold text-emerald-700">{previewDoc.alumni?.cgpa ? `${previewDoc.alumni.cgpa} / 4.00` : '3.85 / 4.00'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Personal */}
                    {modalTab === 'personal' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-[#003366]">person</span>
                            Personal Information & Bio
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                            <span className="font-bold text-slate-900">{previewDoc.alumni?.fullName || 'Wabi Tena'}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
                            <span className="font-bold font-mono text-slate-900">{previewDoc.alumni?.phone || '+251917842503'}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 col-span-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                            <span className="font-bold text-slate-900">{previewDoc.alumni?.email || previewDoc.contactEmail || 'wabitena@gmail.com'}</span>
                          </div>
                        </div>
                        {previewDoc.alumni?.bio && (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Professional Bio</span>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{previewDoc.alumni.bio}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 3: Employment */}
                    {modalTab === 'employment' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-[#003366]">work</span>
                            Employment & Career History
                          </h4>
                        </div>
                        {previewDoc.alumni?.experiences && previewDoc.alumni.experiences.length > 0 ? (
                          <div className="space-y-2">
                            {previewDoc.alumni.experiences.map((exp: any, i: number) => (
                              <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex items-start justify-between">
                                <div>
                                  <p className="font-bold text-slate-900">{exp.position}</p>
                                  <p className="text-slate-600 font-medium">{exp.companyName} • {exp.industry}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                                  {exp.isCurrent ? 'Current' : 'Past'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Experienced AI Engineer</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">INSA Corporation</span>
                            </div>
                            <p className="text-slate-500">Electrical and Computer Engineering • 2024 Graduate</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 4: Certifications & Skills */}
                    {modalTab === 'certifications' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-[#003366]">verified</span>
                            Certifications & Projects
                          </h4>
                        </div>
                        {previewDoc.alumni?.certifications && previewDoc.alumni.certifications.length > 0 ? (
                          <div className="space-y-2">
                            {previewDoc.alumni.certifications.map((cert: any, i: number) => (
                              <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                                <p className="font-bold text-slate-900">{cert.name}</p>
                                <p className="text-slate-500">{cert.issuer}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 text-xs">
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                              <span className="font-bold text-slate-900 block">Verified Software Engineering Certification</span>
                              <span className="text-slate-500">Adama Science and Technology University</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 5: Documents */}
                    {modalTab === 'documents' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-[#003366]">description</span>
                            Attached Files, Resume & Official Documents
                          </h4>
                        </div>

                        {/* Section A: Requester Custom File Attachments */}
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Request File Attachments</h5>
                          {previewDoc.fileUrls && previewDoc.fileUrls.length > 0 ? (
                            <div className="space-y-2">
                              {previewDoc.fileUrls.map((url, idx) => (
                                <a key={idx} href={getDocumentUrl(url)} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-xl bg-white p-3 border border-slate-200 hover:bg-slate-50 transition-colors">
                                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                  <span className="text-xs font-bold text-slate-800 flex-1 truncate">Requester Attachment {idx + 1}</span>
                                  <ExternalLink className="h-4 w-4 text-slate-400" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                              <span>No custom file uploaded with this document request.</span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Standard Form</span>
                            </div>
                          )}
                        </div>

                        {/* Section B: Alumni Profile Resume & Verification Documents */}
                        <div className="pt-2 border-t border-slate-200">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Alumni Profile Verification Documents</h5>
                          <div className="space-y-2 text-xs">
                            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                                <div>
                                  <p className="font-bold text-slate-900">{previewDoc.alumni?.fullName || 'Alumni'}_Official_Resume.pdf</p>
                                  <p className="text-[10px] text-slate-400">Verified Alumni Resume & Career Profile</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg">
                                SIS Verified
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Section C: Registrar Issued Official Document */}
                        <div className="pt-2 border-t border-slate-200">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">Registrar Issued Document Status</h5>
                          {previewDoc.issuedDocumentUrl ? (
                            <a href={getDocumentUrl(previewDoc.issuedDocumentUrl)} target="_blank" rel="noopener noreferrer" download
                              className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                              <Download className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-xs font-bold text-emerald-900 flex-1">Download Issued Official Document</span>
                              <ExternalLink className="h-4 w-4 text-emerald-600" />
                            </a>
                          ) : (
                            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-amber-600">hourglass_top</span>
                              <span>Document is currently in <strong>{getStatusLabel(previewDoc.status)}</strong> state. Upon approving this request, you will upload and issue the final verified document.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end gap-2">
              <button onClick={() => setPreviewDoc(null)}
                className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                Close
              </button>
              {normalizeStatus(previewDoc.status) !== 'APPROVED' && (
                <button onClick={() => { setPreviewDoc(null); setApproveModalDoc(previewDoc); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all">
                  <CheckCircle className="h-4 w-4" />
                  Approve & Issue Document
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className={`w-full ${confirmModal.action === 'APPROVED' ? 'max-w-2xl' : 'max-w-lg'} rounded-3xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-5 my-8`}>
            <div className="flex items-start gap-4">
              <div className={`p-3.5 rounded-2xl ${confirmModal.action === 'APPROVED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'}`}>
                <span className="material-symbols-outlined text-2xl">
                  {confirmModal.action === 'APPROVED' ? 'done_all' : 'playlist_add_check'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {confirmModal.action === 'APPROVED' ? 'Confirm Bulk Approval & File Upload' : 'Confirm Process All Pending'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {confirmModal.action === 'APPROVED'
                    ? `Attach the issued document file for each alumnus request below before completing approval.`
                    : `Are you sure you want to mark all ${confirmModal.pendingList.length} pending document requests as In Progress?`
                  }
                </p>
              </div>
            </div>

            {/* If APPROVED: Show file upload progress & per-profile attachment list */}
            {confirmModal.action === 'APPROVED' ? (
              <div className="space-y-3">
                {/* Upload Status Header */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">File Attachments Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      confirmModal.pendingList.every(d => Boolean(d.issuedDocumentUrl || bulkFilesMap[String(d.id)]))
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {confirmModal.pendingList.filter(d => Boolean(d.issuedDocumentUrl || bulkFilesMap[String(d.id)])).length} / {confirmModal.pendingList.length} Attached
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{
                        width: `${(confirmModal.pendingList.filter(d => Boolean(d.issuedDocumentUrl || bulkFilesMap[String(d.id)])).length / confirmModal.pendingList.length) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Per-Profile Attachment List */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-800 max-h-72 overflow-y-auto space-y-3">
                  {confirmModal.pendingList.map((doc) => {
                    const localFile = bulkFilesMap[String(doc.id)];
                    const serverUrl = doc.issuedDocumentUrl;
                    const hasFile = Boolean(localFile || serverUrl);
                    const displayName = localFile ? localFile.name : getFilenameFromUrl(serverUrl);
                    const isRowUploading = uploadingRowId === String(doc.id);

                    return (
                      <div
                        key={doc.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          hasFile
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40'
                            : 'bg-white dark:bg-slate-900 border-amber-200/80 dark:border-amber-900/40 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {doc.alumni?.fullName || 'Alumni'}
                              </p>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {doc.alumni?.studentId || 'N/A'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">{getDocTypeIcon(doc.documentType)}</span>
                              {getDocTypeLabel(doc.documentType)}
                            </p>
                          </div>

                          {/* File Attachment Action */}
                          <div className="flex items-center gap-2">
                            {isRowUploading ? (
                              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-700">
                                <span className="w-3.5 h-3.5 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                                Saving File...
                              </div>
                            ) : hasFile ? (
                              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700">
                                <FileText className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                <div className="text-left min-w-0 max-w-[140px]">
                                  <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate" title={displayName}>{displayName}</p>
                                  <p className="text-[8px] text-emerald-600 font-semibold">
                                    {localFile ? `${(localFile.size / 1024).toFixed(1)} KB` : 'Saved on Server'}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleBulkFileRemove(doc.id)}
                                  className="text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                                  title="Remove file"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-600/20">
                                <Upload className="h-3.5 w-3.5" />
                                Attach File
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleBulkFileChange(doc.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            )}

                            {/* Status Badge */}
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase border ${
                              hasFile
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                            }`}>
                              {hasFile ? 'File Ready' : 'Waiting Upload'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Validation Banner */}
                {confirmModal.pendingList.some(d => !d.issuedDocumentUrl && !bulkFilesMap[String(d.id)]) ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/50 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                    <span className="material-symbols-outlined text-amber-600 text-base shrink-0">warning</span>
                    <span>
                      Please attach an issued document file for all <strong>{confirmModal.pendingList.length}</strong> profiles ({confirmModal.pendingList.filter(d => !d.issuedDocumentUrl && !bulkFilesMap[String(d.id)]).length} remaining).
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>All <strong>{confirmModal.pendingList.length}</strong> profiles have document files attached and are ready for batch approval!</span>
                  </div>
                )}
              </div>
            ) : (
              /* If IN_PROGRESS: Standard status update preview */
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 max-h-44 overflow-y-auto space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Affected Requests ({confirmModal.pendingList.length})
                </p>
                {confirmModal.pendingList.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{doc.alumni?.fullName || 'Alumni'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{doc.alumni?.studentId || '—'} • {getDocTypeLabel(doc.documentType)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getStatusBadge(doc.status)}`}>
                      {getStatusLabel(doc.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setConfirmModal(null);
                  setBulkFilesMap({});
                }}
                disabled={isBulkSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkAction}
                disabled={isBulkSubmitting}
                className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-1.5 ${
                  confirmModal.action === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                } disabled:opacity-50`}
              >
                {isBulkSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">
                      {confirmModal.action === 'APPROVED' ? 'check_circle' : 'play_arrow'}
                    </span>
                    Yes, {confirmModal.action === 'APPROVED' ? 'Approve & Issue All' : 'Process All'} ({confirmModal.pendingList.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
