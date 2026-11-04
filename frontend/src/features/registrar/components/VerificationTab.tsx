import React, { useState, useMemo } from 'react';
import { VerificationRequest } from '../types/registrar.types';
import { ShieldCheck, CheckCircle2, XCircle, Search, QrCode, Clock, ExternalLink } from 'lucide-react';
import { QrVerificationModal } from './verification/QrVerificationModal';

interface VerificationTabProps {
  verifications: VerificationRequest[];
  onVerify: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  onBulkVerify?: (ids: string[], status: 'APPROVED' | 'REJECTED') => Promise<void> | void;
}

export const VerificationTab: React.FC<VerificationTabProps> = ({ verifications, onVerify }) => {
  const [filterTab, setFilterTab] = useState<'All' | 'PENDING' | 'APPROVED' | 'REJECTED'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrModalItem, setQrModalItem] = useState<VerificationRequest | null>(null);

  const getStatus = (status: string) => status.toUpperCase();

  const filteredVerifications = useMemo(() => {
    return verifications.filter((v) => {
      const matchesFilter = filterTab === 'All' || getStatus(v.status) === filterTab;
      const matchesSearch =
        !searchQuery ||
        `${v.studentId} ${v.fullName} ${v.email} ${v.department} ${v.type}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [verifications, filterTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Degree & Transcript Verification Desk</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Verify academic certificate authenticity, review submitted credentials, and generate official tamper-proof seals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['All', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                filterTab === tab ? 'bg-sky-600 text-white shadow' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student ID, name, or department..."
          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-sky-500 focus:outline-none"
        />
      </div>

      {/* Verification Table */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">ID & Department</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Status & Tamper Check</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
              {filteredVerifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[var(--text-muted)]">
                    No verification requests match your filter.
                  </td>
                </tr>
              ) : (
                filteredVerifications.map((v) => {
                  const status = getStatus(v.status);
                  return (
                    <tr key={v.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">{v.fullName}</td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-sky-400">{v.studentId}</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">{v.department}</div>
                      </td>
                      <td className="py-3 px-4 font-medium">{v.type || 'Official Transcript'}</td>
                      <td className="py-3 px-4">
                        {status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            <ShieldCheck className="h-3 w-3" /> VERIFIED
                          </span>
                        ) : status === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                            <XCircle className="h-3 w-3" /> REJECTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            <Clock className="h-3 w-3" /> PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setQrModalItem(v)}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-950/40 px-2.5 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-900/60 transition-colors"
                          >
                            <QrCode className="h-3 w-3" /> QR Seal
                          </button>
                          {status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onVerify(v.id, 'APPROVED')}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => onVerify(v.id, 'REJECTED')}
                                className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-500"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QrVerificationModal isOpen={Boolean(qrModalItem)} onClose={() => setQrModalItem(null)} verification={qrModalItem} />
    </div>
  );
};
