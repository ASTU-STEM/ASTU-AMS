import React from 'react';
import { X, ShieldCheck, QrCode, CheckCircle2, Download, Printer } from 'lucide-react';
import { VerificationRequest } from '../../types/registrar.types';

interface QrVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: VerificationRequest | null;
}

export const QrVerificationModal: React.FC<QrVerificationModalProps> = ({
  isOpen,
  onClose,
  verification,
}) => {
  if (!isOpen || !verification) return null;

  const qrPayload = encodeURIComponent(
    `https://astu.edu.et/verify?id=${verification.studentId}&auth=${verification.id.substring(0, 8)}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrPayload}`;

  return (
    <div
      data-testid="qr-verification-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-[var(--text-primary)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2 text-sky-400">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">Authenticity Certificate Seal</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center text-center">
          <div className="relative rounded-2xl border border-sky-500/30 bg-white p-3 shadow-lg">
            <img src={qrUrl} alt="ASTU Verification QR Code" className="h-36 w-36 object-contain" />
            <div className="absolute -bottom-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
              Cryptographically Verified Seal
            </span>
            <h4 className="text-lg font-black text-[var(--text-primary)]">{verification.fullName}</h4>
            <p className="font-mono text-xs text-sky-400">ID: {verification.studentId}</p>
          </div>

          <div className="mt-4 w-full divide-y divide-[var(--border-color)] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-3 text-left text-xs">
            <div className="flex justify-between py-1.5">
              <span className="text-[var(--text-secondary)]">Department:</span>
              <span className="font-semibold text-[var(--text-secondary)]">{verification.department}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[var(--text-secondary)]">Document Type:</span>
              <span className="font-semibold text-[var(--text-secondary)]">{verification.type || 'Degree Certificate'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[var(--text-secondary)]">Tamper-Proof Checksum:</span>
              <span className="font-mono text-[11px] text-amber-300">ASTU-SHA256-{verification.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--border-color)] pt-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-3.5 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            <Printer className="h-4 w-4" /> Print Seal
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
