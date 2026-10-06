import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { ictBtnDanger, ictBtnSecondary, ictInput, ictLabelField, ictTextarea } from '../features/ict/components/ictUi';
import IctModal from '../features/ict/components/IctModal';

interface GuardedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Accent stripe colour */
  tone: 'danger' | 'warning';
  eyebrow: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  confirmLabel: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
}

/**
 * Shared shell for the console's confirmation flows.
 * Only the presentation is shared here — the typed-confirmation rule and every
 * validation rule stay exactly where they were, inside each caller.
 */
function GuardedModal({
  isOpen,
  onClose,
  title,
  tone,
  eyebrow,
  icon,
  children,
  confirmLabel,
  confirmDisabled,
  onConfirm,
}: GuardedModalProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => ref.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  return (
    <IctModal
      isOpen={isOpen}
      onClose={onClose}
      width="sm"
      tone={tone}
      title={
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
      }
      footer={
        <>
          <button type="button" onClick={onClose} className={ictBtnSecondary}>
            Cancel
          </button>
          <button
            ref={ref}
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={tone === 'danger' ? ictBtnDanger : 'inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-amber-700 disabled:pointer-events-none disabled:opacity-45 ict-focus'}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-3.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
        <p
          className="rounded-[6px] border px-3 py-2 font-extrabold uppercase tracking-[0.08em]"
          style={{
            borderColor: tone === 'danger' ? 'var(--ict-crit-line)' : 'var(--ict-warn-line)',
            background: tone === 'danger' ? 'var(--ict-crit-bg)' : 'var(--ict-warn-bg)',
            color: tone === 'danger' ? 'var(--ict-crit)' : 'var(--ict-warn)',
          }}
        >
          {eyebrow}
        </p>
        {children}
      </div>
    </IctModal>
  );
}

export function BreakGlassModal({
  isOpen,
  onClose,
  onElevate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onElevate: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const tooShort = reason.trim().length < 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast.error('Emergency justification must be at least 10 characters.');
      return;
    }
    onElevate(reason.trim());
    toast.success('Break Glass Access Granted: Elevated for 30 minutes.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <GuardedModal
      isOpen={isOpen}
      onClose={onClose}
      tone="danger"
      eyebrow="Emergency privilege elevation"
      title="Break Glass Access"
      icon={<Flame className="h-4 w-4 shrink-0 text-[var(--ict-crit)]" aria-hidden />}
      confirmLabel="Authorize Elevation"
      confirmDisabled={tooShort}
      onConfirm={() => {
        if (reason.trim().length < 10) {
          toast.error('Emergency justification must be at least 10 characters.');
          return;
        }
        onElevate(reason.trim());
        toast.success('Break Glass Access Granted: Elevated for 30 minutes.');
        onClose();
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <p>
          Break Glass elevation grants temporary Super Admin privilege for{' '}
          <strong className="text-[var(--text-primary)] dark:text-slate-100">30 minutes</strong>. All actions
          executed during this window are written to the immutable audit trail and escalated to the Super Admin.
        </p>

        <div>
          <label htmlFor="break-glass-reason" className={ictLabelField}>
            Emergency justification reason *
          </label>
          <textarea
            id="break-glass-reason"
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Production database connectivity outage requires immediate DB recovery…"
            className={ictTextarea}
            aria-describedby="break-glass-hint"
          />
          <p id="break-glass-hint" className="mt-1 text-[10px] text-[var(--text-muted)]">
            Minimum 10 characters. {tooShort ? `${10 - reason.trim().length} remaining.` : 'Requirement met.'}
          </p>
        </div>

        {/* Keeps the native submit path intact for keyboard users */}
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
          Submit
        </button>
      </form>
    </GuardedModal>
  );
}

export function DangerousActionModal({
  isOpen,
  title,
  description,
  expectedConfirmText,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  expectedConfirmText: string;
  onConfirm: () => void;
}) {
  const [confirmInput, setConfirmInput] = useState('');
  const matched = confirmInput.trim() === expectedConfirmText;

  const runConfirm = () => {
    if (!matched) {
      toast.error(`Confirmation text does not match "${expectedConfirmText}"`);
      return;
    }
    onConfirm();
    setConfirmInput('');
    onClose();
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    runConfirm();
  };

  if (!isOpen) return null;

  return (
    <GuardedModal
      isOpen={isOpen}
      onClose={onClose}
      tone="warning"
      eyebrow="High-risk operation protection"
      title={title}
      icon={<AlertTriangle className="h-4 w-4 shrink-0 text-[var(--ict-warn)]" aria-hidden />}
      confirmLabel="Confirm High-Risk Action"
      confirmDisabled={!matched}
      onConfirm={runConfirm}
    >
      <form onSubmit={handleConfirm} className="space-y-3.5">
        <p>{description}</p>

        <div className="rounded-[6px] border border-[var(--border-color)] bg-[var(--ict-surface-inset)] p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]">
            To confirm this action, type:
          </p>
          <p className="ict-mono mt-1 select-all text-xs font-extrabold text-[var(--ict-warn)]">{expectedConfirmText}</p>
        </div>

        <div>
          <label htmlFor="dangerous-confirm" className={ictLabelField}>
            Confirmation phrase
          </label>
          <input
            id="dangerous-confirm"
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={expectedConfirmText}
            className={ictInput}
            aria-describedby="dangerous-confirm-hint"
          />
          <p id="dangerous-confirm-hint" className="mt-1 text-[10px] text-[var(--text-muted)]">
            {matched ? 'Phrase matched — the action can now be confirmed.' : 'The confirm button unlocks on an exact match.'}
          </p>
        </div>

        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
          Submit
        </button>
      </form>
    </GuardedModal>
  );
}
