import React, { useState } from 'react';
import { DocumentRequest } from '../types/alumni.types';
import toast from 'react-hot-toast';
import { FileDown, Shield, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface DocumentServicesTabProps {
  documentRequests: DocumentRequest[];
  onRequestDocument: (documentType: DocumentRequest['documentType'], notes?: string) => void;
}

const DOC_TYPES: { value: DocumentRequest['documentType']; icon: string; desc: string; turnaround: string }[] = [
  { value: 'TRANSCRIPT', icon: 'description', desc: 'Official academic transcript with grades and coursework', turnaround: '2-3 business days' },
  { value: 'DEGREE_VERIFICATION', icon: 'school', desc: 'Degree completion and verification letter', turnaround: '1-2 business days' },
  { value: 'RECOMMENDATION', icon: 'assignment', desc: 'Recommendation letter', turnaround: '3-5 business days' },
];

const STATUS_CONFIG: Record<DocumentRequest['status'], { bg: string; text: string; dot: string; border: string }> = {
  'APPROVED': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  'REJECTED': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
};

export const DocumentServicesTab: React.FC<DocumentServicesTabProps> = ({
  documentRequests,
  onRequestDocument,
}) => {
  const [docType, setDocType] = useState<DocumentRequest['documentType']>('TRANSCRIPT');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onRequestDocument(docType, reason);
      setReason('');
      setIsSubmitting(false);
      toast.success(`${docType} requested successfully! Track status below.`);
    }, 600);
  };

  const getStatusBadge = (status: DocumentRequest['status']) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['PENDING'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${status === 'PENDING' ? 'animate-pulse' : ''}`}></span>
        {status}
      </span>
    );
  };

  const pendingCount = documentRequests.filter(d => d.status === 'PENDING').length;
  const approvedCount = documentRequests.filter(d => d.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Enhanced Hero Banner */}
      <section className="relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#004d99] to-[#006633] opacity-95"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFD700]/10 rounded-full translate-y-1/3 -translate-x-1/4"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white/15 text-[#FFD700] text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full backdrop-blur-sm">
                ASTU Registrar
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full backdrop-blur-sm">
                Digital Services
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Document Services Portal
            </h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-xl">
              Request verified academic transcripts, degree verification files, or certificates online. Documents are verified by the registrar and dispatched securely.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-extrabold text-white">{documentRequests.length}</p>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider mt-1">Total Requests</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-extrabold text-amber-300">{pendingCount}</p>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider mt-1">Pending</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-extrabold text-emerald-300">{approvedCount}</p>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider mt-1">Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Request Form & Tracking Table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left: Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden sticky top-20">
            <div className="p-5 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#004d99] flex items-center justify-center shadow-md">
                  <span className="text-lg">📝</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">New Document Request</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Select type and provide delivery details</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Document Type Selector */}
              <div className="space-y-2">
  <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Document Type</label>
  <div className="space-y-2">
    {DOC_TYPES.map(doc => (
      <button
        key={doc.value}
        type="button"
        onClick={() => setDocType(doc.value)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
          docType === doc.value
            ? 'border-[#003366] bg-[#003366]/5 shadow-sm ring-1 ring-[#003366]/20'
            : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/30 hover:bg-[#003366]/5'
        }`}
      >
        <span className={`material-symbols-outlined text-xl flex-shrink-0 ${docType === doc.value ? 'text-[#003366]' : 'text-[var(--text-secondary)]'}`}>
          {doc.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold ${docType === doc.value ? 'text-[#003366]' : 'text-[var(--text-primary)]'}`}>
            {doc.value}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] truncate">{doc.desc}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="text-[9px] font-medium text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-0.5 rounded">
            <Clock className="inline h-2.5 w-2.5 mr-0.5" />
            {doc.turnaround}
          </span>
        </div>
        {docType === doc.value && (
          <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-[#003366] flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        )}
      </button>
    ))}
  </div>
</div>

              {/* Reason / Address */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">
                  Purpose / Delivery Details
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. WES evaluation, employer HR department, personal records..."
                  className="w-full text-xs p-3 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] focus:bg-[var(--bg-card)] transition-all duration-200 h-24 resize-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#003366] to-[#004d99] hover:from-[#00264d] hover:to-[#003366] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Request
                    <FileDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              {/* Info Note */}
              <div className="bg-astu-navy/5 border border-astu-navy/10 rounded-xl p-3 flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-astu-navy flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-astu-navy/80 leading-relaxed font-medium">
                  All documents are verified by the ASTU Registrar. Processing time varies by document type.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Request History */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-lg">analytics</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Request History & Tracking</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Monitor registrar validation and dispatch</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg text-[10px] font-bold text-[var(--text-secondary)]">
                {documentRequests.length} record{documentRequests.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Timeline View for Mobile */}
            <div className="lg:hidden p-4 space-y-3">
              {documentRequests.map((req, idx) => {
                const config = STATUS_CONFIG[req.status] || STATUS_CONFIG['Pending'];
                return (
                  <div key={req.id} className="relative bg-[var(--bg-page)] rounded-xl p-4 border border-[var(--border-color)] hover:shadow-sm transition-all duration-200">
                    {idx < documentRequests.length - 1 && (
                      <div className="absolute left-7 top-full w-0.5 h-3 bg-[var(--border-color)]"></div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 border ${config.border}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`}></div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-[var(--text-primary)]">{req.documentType}</p>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">ASTU-DOC-{String(req.id).padStart(4, '0')}</p>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {req.createdAt}
                        </div>
                        {req.notes && (
                          <p className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-lg p-2 border border-[var(--border-color)]">
                            {req.notes}
                          </p>
                        )}
                        {req.status === 'APPROVED' && (
                          <div className="mt-2 space-y-1">
                            <button onClick={() => toast.success('Secure PDF downloaded! (Digitally signed by ASTU Registrar)')} className="inline-flex items-center gap-1 rounded-md bg-astu-green px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-astu-green/90 transition-all">
                              <FileDown className="h-3 w-3" />
                              Download Secure PDF
                            </button>
                            <p className="text-[8px] text-emerald-600 font-semibold flex items-center gap-1">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                              Digitally signed by ASTU Registrar
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {documentRequests.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <AlertCircle className="mx-auto h-10 w-10 text-[var(--text-secondary)]" />
                  <p className="text-xs font-bold text-[var(--text-secondary)]">No document requests yet</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Submit your first request using the form</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[var(--bg-page)] border-b border-[var(--border-color)]">
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Reference</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Document Type</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Date</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Status</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Notes</th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {documentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[var(--bg-page)]/50 transition-colors duration-150 group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-[11px] font-extrabold text-[#003366] bg-[#003366]/5 px-2 py-1 rounded-md">
                          ASTU-DOC-{String(req.id).padStart(4, '0')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{req.documentType}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] text-[var(--text-secondary)] font-medium">{req.createdAt}</span>
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] text-[var(--text-secondary)] leading-relaxed max-w-xs block truncate">
                          {req.notes || 'Under registrar validation.'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {req.status === 'APPROVED' ? (
                          <button onClick={() => toast.success('Downloading digitally signed document...')} className="inline-flex items-center gap-1 rounded-md bg-astu-green px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-astu-green/90 transition-all shadow-sm">
                            <FileDown className="h-3 w-3" />
                            Download
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {documentRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="space-y-2">
                          <AlertCircle className="mx-auto h-10 w-10 text-[var(--text-secondary)]" />
                          <p className="text-xs font-bold text-[var(--text-secondary)]">No document requests logged</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Submit your first request using the form on the left</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};