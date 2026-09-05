import React, { useState, useMemo } from 'react';
import { VerificationRequest } from '../types/registrar.types';
import toast from 'react-hot-toast';
import { ExternalLink, Download, FileText, CheckCircle, XCircle, X } from 'lucide-react';

const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

interface VerificationTabProps {
  verifications: VerificationRequest[];
  onVerify: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  onBulkVerify?: (ids: string[], status: 'APPROVED' | 'REJECTED') => Promise<void> | void;
}

export const VerificationTab: React.FC<VerificationTabProps> = ({ verifications, onVerify, onBulkVerify }) => {
  const [filterTab, setFilterTab] = useState<'All' | 'PENDING' | 'APPROVED' | 'REJECTED'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    action: 'APPROVED' | 'REJECTED';
    pendingList: VerificationRequest[];
  } | null>(null);

  const getStatus = (status: string) => status.toUpperCase();

  const filteredVerifications = useMemo(() => {
    return verifications.filter(v => {
      const matchesFilter = filterTab === 'All' || getStatus(v.status) === filterTab;
      const matchesSearch = !searchQuery ||
        `${v.studentId} ${v.fullName} ${v.email} ${v.department} ${v.type}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [verifications, filterTab, searchQuery]);

  const stats = useMemo(() => ({
    total: verifications.length,
    pending: verifications.filter(v => getStatus(v.status) === 'PENDING').length,
    approved: verifications.filter(v => getStatus(v.status) === 'APPROVED').length,
    rejected: verifications.filter(v => getStatus(v.status) === 'REJECTED').length,
  }), [verifications]);

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED', name: string) => {
    onVerify(id, status);
    toast.success(`Registration request for ${name} marked as ${status.toLowerCase()}.`);
    if (selectedVerification?.id === id) {
      setSelectedVerification(null);
    }
  };

  const handleBulkActionClick = (status: 'APPROVED' | 'REJECTED') => {
    const pendingList = verifications.filter(v => getStatus(v.status) === 'PENDING');
    if (pendingList.length === 0) {
      toast.error(`No pending verifications to ${status.toLowerCase()}.`);
      return;
    }
    setConfirmModal({ action: status, pendingList });
  };

  const executeBulkAction = async () => {
    if (!confirmModal) return;
    const { action, pendingList } = confirmModal;
    const ids = pendingList.map(v => v.id);
    
    if (onBulkVerify) {
      await onBulkVerify(ids, action);
    } else {
      pendingList.forEach(v => onVerify(v.id, action));
    }
    
    toast.success(`Successfully ${action.toLowerCase()} ${ids.length} verification requests.`);
    setConfirmModal(null);
  };

  const getDocumentUrls = (path?: string): string[] => {
    if (!path) return [];
    const parts = path.includes(',') ? path.split(',') : [path];
    return parts.map(p => {
      const clean = p.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      const normPath = clean.replace(/\\/g, '/');
      const match = normPath.match(/uploads\/.*/i);
      const cleanPath = match ? match[0] : `uploads/VerificationDocument/${normPath.replace(/^\//, '')}`;
      return `${UPLOAD_BASE}/${cleanPath}`;
    });
  };

  const getDocumentUrl = (path?: string) => {
    const urls = getDocumentUrls(path);
    return urls[activeDocIndex] || urls[0] || '';
  };

  const isImageFile = (url?: string) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(url);
  };

  return (
    <div className="space-y-6">

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-astu-navy via-[#002a55] to-emerald-800 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">Alumni Verification Center</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Registration Verifications</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">Cross-reference alumni registration requests against official graduation logs. Review manual verifications and approve or reject requests.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => handleBulkActionClick('APPROVED')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all">
              <span className="material-symbols-outlined text-sm">done_all</span>
              Approve All Pending
            </button>
            <button onClick={() => handleBulkActionClick('REJECTED')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-all">
              <span className="material-symbols-outlined text-sm">block</span>
              Reject All Pending
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Requests</p>
          <p className="text-2xl font-extrabold text-astu-navy mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterTab('PENDING')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterTab('APPROVED')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Approved</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterTab('REJECTED')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Rejected</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['All', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(tab => (
            <button key={tab} onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterTab === tab
                  ? 'bg-astu-navy text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-astu-navy/30 hover:text-astu-navy'
              }`}>
              {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} {tab === 'All' ? `(${stats.total})` : tab === 'PENDING' ? `(${stats.pending})` : tab === 'APPROVED' ? `(${stats.approved})` : `(${stats.rejected})`}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-sm">search</span>
          <input type="text" placeholder="Search verifications..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20 w-56 md:w-72" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-4">Student ID</th>
                <th className="p-4">Candidate Details</th>
                <th className="p-4">Department</th>
                <th className="p-4">Request Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVerifications.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-gray-800">{req.studentId}</td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{req.fullName}</p>
                    <p className="text-[10px] text-gray-500">{req.email}</p>
                  </td>
                  <td className="p-4 text-xs font-semibold text-astu-navy">{req.department} • Class of {req.graduationYear}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                      req.type === 'Alumni Registration' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {req.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(req.requestDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      getStatus(req.status) === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      getStatus(req.status) === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {getStatus(req.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setImgError(false);
                        setSelectedVerification(req);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-astu-navy focus:ring-offset-1 transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredVerifications.length === 0 && (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300">verified_user</span>
            <p className="mt-2 text-sm text-gray-400">No verification requests match your criteria.</p>
          </div>
        )}
        <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50">
          <span className="text-[11px] text-gray-500 font-medium">
            Showing {filteredVerifications.length} of {verifications.length} requests
          </span>
          <span className="text-[10px] text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      {/* Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" onClick={() => setSelectedVerification(null)}>
          <div
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Review Verification Request</h3>
                <p className="text-xs text-slate-500">Submitted on {new Date(selectedVerification.requestDate).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body – scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Info */}
                <div className="space-y-5">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Candidate Details</h4>
                    <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Full Name</div>
                        <div className="font-semibold text-slate-900">{selectedVerification.fullName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Student ID</div>
                          <div className="font-medium text-slate-900">{selectedVerification.studentId}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Graduation Year</div>
                          <div className="font-medium text-slate-900">{selectedVerification.graduationYear}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Department</div>
                        <div className="font-medium text-slate-900">{selectedVerification.department}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Email</div>
                        <div className="text-sm font-medium text-slate-900 break-all">{selectedVerification.email}</div>
                      </div>
                    </div>
                  </div>

                  {selectedVerification.notes && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Submission Notes</h4>
                      <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                        <p className="text-sm text-amber-900 whitespace-pre-wrap">{selectedVerification.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Document */}
                <div className="space-y-4">
                  {(() => {
                    const docUrls = getDocumentUrls(selectedVerification.documentUrl);
                    const currentUrl = docUrls[activeDocIndex] || docUrls[0] || '';

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Identity Documents {docUrls.length > 1 && `(${docUrls.length} uploaded)`}
                          </h4>
                          {currentUrl && (
                            <a
                              href={currentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-astu-navy hover:bg-slate-200 transition-colors"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </a>
                          )}
                        </div>

                        {/* Multi-document Tabs */}
                        {docUrls.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {docUrls.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setActiveDocIndex(idx);
                                  setImgError(false);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                                  activeDocIndex === idx
                                    ? 'bg-astu-navy text-white border-astu-navy shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                Document {idx + 1}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 min-h-[250px] flex items-center justify-center">
                          {!currentUrl ? (
                            <div className="text-center p-4">
                              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                              <p className="text-sm text-slate-500 font-medium">No document provided</p>
                            </div>
                          ) : isImageFile(currentUrl) && !imgError ? (
                            <img
                              src={currentUrl}
                              alt={`Submitted Document ${activeDocIndex + 1}`}
                              className="w-full h-auto max-h-72 object-contain bg-white"
                              onError={() => setImgError(true)}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 px-4">
                              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-slate-400" />
                              </div>
                              <p className="text-sm font-semibold text-slate-700 mb-1">
                                {imgError ? 'Image could not be loaded' : `Document ${activeDocIndex + 1} uploaded`}
                              </p>
                              <p className="text-xs text-slate-500 mb-4">
                                Click below to download or open the document
                              </p>
                              <div className="flex gap-2">
                                <a
                                  href={currentUrl}
                                  download
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy px-4 py-2 text-xs font-bold text-white hover:bg-astu-navy/90 transition-colors"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </a>
                                <a
                                  href={currentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Open
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}

                  <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-100">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      <strong>Action Required:</strong> Review the uploaded details. Once verified, approving this request will automatically activate the alumni's account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer – fixed at bottom */}
            <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50/80 px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm flex items-center gap-2">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      getStatus(selectedVerification.status) === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      getStatus(selectedVerification.status) === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {getStatus(selectedVerification.status)}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => setSelectedVerification(null)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                  {getStatus(selectedVerification.status) === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAction(selectedVerification.id, 'REJECTED', selectedVerification.fullName)}
                        className="rounded-xl bg-white border border-red-200 px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(selectedVerification.id, 'APPROVED', selectedVerification.fullName)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmModal(null)}>
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${confirmModal.action === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {confirmModal.action === 'APPROVED' ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {confirmModal.action === 'APPROVED' ? 'Confirm Bulk Approval' : 'Confirm Bulk Rejection'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Action cannot be undone automatically</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to <strong>{confirmModal.action.toLowerCase()} all {confirmModal.pendingList.length} pending verification requests</strong>?
              {confirmModal.action === 'APPROVED'
                ? ' This will activate all corresponding alumni accounts and send confirmation emails.'
                : ' This will set their status to rejected and send update notifications.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkAction}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
                  confirmModal.action === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Yes, {confirmModal.action === 'APPROVED' ? 'Approve All' : 'Reject All'} ({confirmModal.pendingList.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
