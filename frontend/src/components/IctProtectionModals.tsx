import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Flame, Lock, ShieldAlert, X } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast.error('Emergency justification must be at least 10 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onElevate(reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      toast.error('Break Glass Elevation failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl space-y-0">
        <div className="bg-rose-500/10 border-b border-rose-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-sm">
            <Flame className="w-5 h-5 animate-pulse" />
            <span>🚨 EMERGENCY BREAK GLASS ACCESS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Break Glass elevation grants temporary Super Admin privilege for <strong>30 minutes</strong>. All executed actions will be logged in the immutable PostgreSQL audit trail.
          </p>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Emergency Justification Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Production database connectivity outage requires immediate DB recovery..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Authorizing...' : 'Authorize Emergency Elevation'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
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
  title: string;
  description: string;
  expectedConfirmText: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmInput, setConfirmInput] = useState('');

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput.trim() !== expectedConfirmText) {
      toast.error(`Confirmation text does not match "${expectedConfirmText}"`);
      return;
    }
    onConfirm();
    setConfirmInput('');
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl space-y-0">
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>⚠ DANGEROUS OPERATION PROTECTION</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">To confirm this action, type:</p>
            <p className="mt-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 select-all">{expectedConfirmText}</p>
          </div>

          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={`Type "${expectedConfirmText}" here`}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmInput.trim() !== expectedConfirmText}
              className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition-all ${
                confirmInput.trim() === expectedConfirmText
                  ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer shadow-md active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              Confirm High-Risk Action
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
