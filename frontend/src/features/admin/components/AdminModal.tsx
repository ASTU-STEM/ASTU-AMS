import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { AdminModalProps } from '../types/admin.types';

const sizeClasses: Record<NonNullable<AdminModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export default function AdminModal({
  open,
  title,
  children,
  onClose,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={["w-full overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]", sizeClasses[size]].join(' ')}>
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-[var(--text-secondary)]">{children}</div>
        {footer && <div className="border-t border-[var(--border-color)] px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
