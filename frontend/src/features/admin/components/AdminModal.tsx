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

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 py-4 backdrop-blur-sm overflow-y-auto animate-[fadeIn_0.2s_ease]"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95) translateY(8px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .modal-panel { animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
      <div className={["modal-panel w-full overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)]", sizeClasses[size]].join(' ')}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 text-sm text-slate-600">{children}</div>
        {footer && <div className="border-t border-slate-200 px-6 py-4 bg-slate-50/50">{footer}</div>}
      </div>
    </div>
  );
}
