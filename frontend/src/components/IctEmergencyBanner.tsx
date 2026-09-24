import React from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

interface IctEmergencyBannerProps {
  message: string;
  type?: 'emergency' | 'maintenance' | 'info';
  onDismiss?: () => void;
}

export default function IctEmergencyBanner({
  message,
  type = 'emergency',
  onDismiss,
}: IctEmergencyBannerProps) {
  if (!message) return null;

  const style =
    type === 'emergency'
      ? 'bg-rose-600 text-white border-rose-700'
      : type === 'maintenance'
      ? 'bg-amber-500 text-slate-950 border-amber-600'
      : 'bg-blue-600 text-white border-blue-700';

  return (
    <div className={`relative border-b px-4 py-2.5 text-xs font-bold shadow-md ${style}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldAlert className="h-4 w-4 shrink-0 animate-pulse" />
          <span className="truncate">{message}</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded p-0.5 hover:bg-black/10 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
