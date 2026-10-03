import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const scrollContainers = document.querySelectorAll('main, .admin-shell');
    const savedOverflows: { el: HTMLElement; overflow: string }[] = [];
    scrollContainers.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.closest('.modal-panel')) return;
      savedOverflows.push({ el: htmlEl, overflow: htmlEl.style.overflow });
      htmlEl.style.overflow = 'hidden';
    });

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      savedOverflows.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/75 p-3 sm:p-5 md:p-6 backdrop-blur-md animate-[fadeIn_0.2s_ease]"
      onWheel={(event) => event.stopPropagation()}
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.96) translateY(6px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .modal-panel { animation: scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div
        className={[
          'modal-panel my-auto flex max-h-[92vh] w-full flex-col overflow-hidden rounded-[16px] border border-slate-300/80 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.45)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]',
          sizeClasses[size],
        ].join(' ')}
      >
        {/* Executive Header Banner with ASTU Seal Logo */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#00173d] via-[#002d6b] to-[#004899] px-6 py-4 text-white shadow-md border-b border-[#002254]/60">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute left-1/3 -bottom-10 h-28 w-28 rounded-full bg-[#1D9E75]/20 blur-xl" />
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Official ASTU Logo Badge */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md border border-white/30">
                <img
                  src="/images/astu-seal-logo.png"
                  alt="ASTU Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight text-white sm:text-lg">{title}</h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                    ASTU System
                  </span>
                </div>
                <p className="text-[11px] font-medium text-blue-100/80 mt-0.5">
                  Adama Science & Technology University • Control Center
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-white/70 hover:bg-white/15 hover:text-white transition-all border border-transparent hover:border-white/20 active:scale-95 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 text-sm text-slate-600 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-900/50">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="shrink-0 border-t border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3.5 shadow-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}



