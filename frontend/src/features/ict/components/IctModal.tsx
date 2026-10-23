import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ModalWidth = 'sm' | 'md' | 'lg' | 'xl';

const WIDTH: Record<ModalWidth, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

interface IctModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: ModalWidth;
  /** Accent applied to the title bar — use for destructive confirmation flows */
  tone?: 'accent' | 'danger' | 'warning';
  /** Hide the close affordance for flows that require an explicit decision */
  dismissible?: boolean;
}

const TONE_BAR: Record<string, string> = {
  accent: 'bg-[var(--ict-accent)]',
  danger: 'bg-[var(--ict-crit)]',
  warning: 'bg-[var(--ict-warn)]',
};

/**
 * Console modal: fast fade/scale transition, Escape to dismiss, focus moved
 * into the dialog and restored on close, and scroll locking.
 * Presentation only — callers keep their own submit/confirm logic.
 */
export default function IctModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  width = 'md',
  tone = 'accent',
  dismissible = true,
}: IctModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    restoreRef.current = document.activeElement as HTMLElement;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(
        'input:not([type=hidden]), textarea, select, button'
      );
      target?.focus();
    }, 30);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
      restoreRef.current?.focus?.();
    };
  }, [isOpen, onClose, dismissible]);

  if (!isOpen) return null;

  return createPortal(
    <div className="ict-shell fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-[2px] ict-veil sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={dismissible ? onClose : undefined}
        className={`absolute inset-0 h-full w-full cursor-default ${dismissible ? '' : 'pointer-events-none'}`}
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`ict-card ict-shadow-lg ict-drop relative my-auto flex max-h-[92vh] w-full ${WIDTH[width]} flex-col overflow-hidden`}
      >
        <div className="flex items-start gap-3 border-b border-[var(--ict-hairline)] px-4 py-3">
          <span className={`h-8 w-1 shrink-0 rounded-full ${TONE_BAR[tone]}`} aria-hidden />
          {icon && (
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-[var(--ict-accent-soft)] text-[var(--ict-accent-text)]">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-extrabold tracking-tight text-[var(--text-primary)] ">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">{description}</p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-0.5 rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)] ict-focus"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        <div className="ict-scroll flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
