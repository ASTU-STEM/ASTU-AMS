import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { ictBtnIcon } from './ictUi';

export interface IctActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  /** Renders in the danger tone */
  danger?: boolean;
  disabled?: boolean;
  /** Explains why an action is unavailable */
  disabledReason?: string;
}

type IctActionMenuEntry = IctActionMenuItem | { divider: true };

/**
 * Overflow action menu for row actions.
 *
 * Only entries that already do something are rendered — unavailable behaviour
 * is surfaced as an explicit disabled row rather than a button that pretends
 * to work.
 */
export default function IctActionMenu({
  items,
  label = 'More actions',
  align = 'right',
  trigger,
}: {
  items: IctActionMenuEntry[];
  label?: string;
  align?: 'left' | 'right';
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={() => setOpen((v) => !v)}
        className={`${ictBtnIcon} ${open ? 'bg-[var(--ict-accent-soft)] text-[var(--ict-accent-text)]' : ''}`}
      >
        {trigger || <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />}
      </button>

      {open && (
        <div
          role="menu"
          className={`ict-card ict-shadow-md ict-drop absolute z-40 mt-1 min-w-[12rem] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-elevated)] p-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, i) =>
            'divider' in item ? (
              <div key={`div-${i}`} className="my-1 h-px bg-[var(--ict-hairline)]" role="separator" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                title={item.disabled ? item.disabledReason : undefined}
                onClick={() => {
                  if (item.disabled) return;
                  setOpen(false);
                  item.onSelect();
                }}
                className={`flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-left text-[11px] font-semibold transition-colors ict-focus ${
                  item.danger
                    ? 'text-[var(--ict-crit)] hover:bg-[var(--ict-crit-bg)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {item.icon && <span className="shrink-0 opacity-80">{item.icon}</span>}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
