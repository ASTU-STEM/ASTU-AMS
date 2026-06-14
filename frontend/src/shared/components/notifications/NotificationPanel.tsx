import React from 'react';

interface NotificationItem {
  id: string | number;
  text: string;
  unread: boolean;
  time: string;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onClear: (id: number | string) => void;
  onClearAll: () => void;
  onViewAll: () => void;
}

export default function NotificationPanel({
  notifications,
  isOpen,
  onClose,
  onClear,
  onClearAll,
  onViewAll,
}: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="border-b border-[var(--border-color)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">Notifications</div>
            <div className="text-xs text-[var(--text-secondary)]">Recent updates</div>
          </div>
          <button onClick={onClearAll} className="text-xs font-semibold text-[#E24B4A] hover:underline">
            Clear All
          </button>
        </div>
      </div>
      <div className="max-h-60 space-y-1 overflow-y-auto p-2">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-black/5">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${n.unread ? 'bg-[#003580]' : 'bg-gray-300'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--text-primary)]">{n.text}</p>
                <p className="text-xs text-[var(--text-secondary)]">{n.time}</p>
              </div>
              <button
                onClick={() => onClear(n.id)}
                className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="px-2 py-6 text-center text-sm text-[var(--text-secondary)]">No notifications</p>
        )}
      </div>
      <div className="border-t border-[var(--border-color)] px-4 py-3">
        <button type="button" onClick={onViewAll} className="text-sm font-semibold text-[#003580] hover:underline">
          View all →
        </button>
      </div>
    </div>
  );
}
