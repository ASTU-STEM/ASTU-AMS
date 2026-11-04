import React, { useState } from 'react';
import { FileText, Clock, CheckCircle2, ShieldCheck, Download, Plus, ArrowRight, PackageCheck } from 'lucide-react';
import { DocumentRequest } from '../../types/alumni.types';
import { DocumentLifecycleStatus, TrackedDocumentRequest } from '../../types/alumniDashboard.types';

interface DocumentServicesTrackerTabProps {
  documentRequests: DocumentRequest[];
  onRequestNew?: () => void;
}

const LIFECYCLE_STAGES: DocumentLifecycleStatus[] = [
  'Pending',
  'Under Registrar Review',
  'Issued',
  'Ready for Collection',
];

export const DocumentServicesTrackerTab: React.FC<DocumentServicesTrackerTabProps> = ({
  documentRequests,
  onRequestNew,
}) => {
  // Transform requests into lifecycle-aware items
  const trackedItems: TrackedDocumentRequest[] = documentRequests.length > 0
    ? documentRequests.map((d, idx) => {
        let status: DocumentLifecycleStatus = 'Pending';
        const rawStatus = (d.status || '').toLowerCase();
        if (rawStatus.includes('review') || rawStatus === 'in progress') status = 'Under Registrar Review';
        else if (rawStatus.includes('issued') || rawStatus === 'approved') status = 'Issued';
        else if (rawStatus.includes('collection') || rawStatus === 'dispatched') status = 'Ready for Collection';

        return {
          id: String(d.id || idx),
          documentType: d.type || 'Official Transcript',
          status,
          requestDate: d.requestDate || new Date().toISOString(),
          trackingNumber: `ASTU-DOC-${String(d.id || idx).padStart(4, '0')}`,
          fileUrl: (d as any).fileUrl,
        };
      })
    : [
        {
          id: 'mock-1',
          documentType: 'Official Academic Transcript',
          status: 'Under Registrar Review',
          requestDate: '2026-11-01',
          trackingNumber: 'ASTU-DOC-1042',
        },
        {
          id: 'mock-2',
          documentType: 'Degree Certificate Verification',
          status: 'Ready for Collection',
          requestDate: '2026-10-28',
          trackingNumber: 'ASTU-DOC-0985',
        },
      ];

  const getStageIndex = (st: DocumentLifecycleStatus) => LIFECYCLE_STAGES.indexOf(st);

  return (
    <div data-testid="document-tracker-tab" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">University Document Lifecycle Tracker</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Real-time status tracking for transcripts, verification letters, and provisional certificates.
          </p>
        </div>
        {onRequestNew && (
          <button
            type="button"
            onClick={onRequestNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Request Document
          </button>
        )}
      </div>

      {/* Tracked Request Cards */}
      <div className="space-y-4">
        {trackedItems.map((item) => {
          const currentStage = getStageIndex(item.status);

          return (
            <div
              key={item.id}
              className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-lg transition-all hover:border-sky-500/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{item.documentType}</h3>
                    <p className="font-mono text-xs text-sky-400">Tracking: {item.trackingNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-300">
                    {item.status}
                  </span>
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  )}
                </div>
              </div>

              {/* Progress Flow */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LIFECYCLE_STAGES.map((stage, idx) => {
                  const isPassed = idx <= currentStage;
                  const isCurrent = idx === currentStage;

                  return (
                    <div
                      key={stage}
                      className={`relative rounded-2xl border p-3.5 text-xs transition-colors ${
                        isCurrent
                          ? 'border-sky-500 bg-sky-950/30 text-white shadow-md'
                          : isPassed
                            ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                            : 'border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isPassed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-600 shrink-0" />
                        )}
                        <span className="font-semibold text-[11px] leading-tight">{stage}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {item.status === 'Ready for Collection' && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <PackageCheck className="h-4 w-4 shrink-0" />
                  <span>
                    Your physical document is stamped, sealed, and ready for pickup at Registrar Office Window 4 (Main Campus, Administration Building).
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
