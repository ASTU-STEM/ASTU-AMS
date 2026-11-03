import React from 'react';
import { Bell, ExternalLink, X } from 'lucide-react';

export interface ShellNotification {
  id: number | string;
  text: string;
  unread: boolean;
  time: string;
  title?: string;
  content?: string;
  subject?: string;
  type?: string;
  priority?: string;
  category?: string;
  imageUrl?: string;
  ctaLink?: string;
  ctaText?: string;
  targetTab?: string;
  actionLabel?: string;
  details?: string;
  source?: string;
}

function resolveAction(n: ShellNotification) {
  const link = n.ctaLink;
  const fullText = `${n.title || ''} ${n.content || ''} ${n.text || ''}`.toLowerCase();
  let targetTab = n.targetTab || null;
  let buttonLabel = n.ctaText || n.actionLabel || 'Take Action';

  if (!targetTab && link) {
    if (link.includes('survey') || link.includes('tracer')) targetTab = 'surveys';
    else if (link.includes('job') || link.includes('career')) targetTab = 'jobs';
    else if (link.includes('event')) targetTab = 'events';
    else if (link.includes('document') || link.includes('clearance')) targetTab = 'documents';
    else if (link.includes('mentor')) targetTab = 'mentorship';
    else if (link.includes('verif')) targetTab = 'verification';
    else if (link.includes('message') || link.includes('chat')) targetTab = 'messages';
    else if (link.includes('notif')) targetTab = 'notifications';
  }

  if (!targetTab) {
    if (fullText.includes('survey') || fullText.includes('tracer')) {
      targetTab = 'surveys';
      if (!n.ctaText && !n.actionLabel) buttonLabel = 'Go to Surveys';
    } else if (fullText.includes('job') || fullText.includes('career') || fullText.includes('placement')) {
      targetTab = 'jobs';
      if (!n.ctaText && !n.actionLabel) buttonLabel = 'View Jobs Board';
    } else if (fullText.includes('mentor')) {
      targetTab = 'mentorship';
      if (!n.ctaText && !n.actionLabel) buttonLabel = 'Open Mentorship';
    } else if (fullText.includes('document') || fullText.includes('transcript') || fullText.includes('clearance')) {
      targetTab = 'documents';
      if (!n.ctaText && !n.actionLabel) buttonLabel = 'Open Documents';
    } else if (fullText.includes('message') || fullText.includes('chat')) {
      targetTab = 'messages';
      if (!n.ctaText && !n.actionLabel) buttonLabel = 'Open Messages';
    }
  }

  return { link, targetTab, buttonLabel };
}

export interface NotificationDetailModalProps {
  notification: ShellNotification;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  onNavigateLink?: (link: string) => void;
}

export function NotificationDetailModal({
  notification,
  onClose,
  onNavigateTab,
  onNavigateLink,
}: NotificationDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580] dark:bg-sky-950/50 dark:text-sky-300">
              <Bell className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notification Detail</h3>
              <p className="text-[11px] font-medium text-slate-500">ASTU AMS Official Broadcast</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
          <div className="flex flex-wrap items-center gap-2">
            {notification.type && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#003580] dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                {notification.type}
              </span>
            )}
            {notification.priority && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                  String(notification.priority).toLowerCase() === 'urgent' ||
                  String(notification.priority).toLowerCase() === 'high'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {notification.priority} Priority
              </span>
            )}
            {notification.category && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                {notification.category}
              </span>
            )}
            <span className="ml-auto text-[11px] font-medium text-slate-400">{notification.time}</span>
          </div>

          {notification.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-xs dark:border-slate-700">
              <img
                src={notification.imageUrl}
                alt="Notification Banner"
                className="max-h-52 w-full object-cover"
              />
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Subject</p>
            <h2 className="mt-1 text-base font-bold leading-snug text-slate-900 dark:text-white">
              {notification.title || notification.subject || 'ASTU Broadcast Notice'}
            </h2>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Message Content</p>
            <div className="mt-1.5 whitespace-pre-wrap rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs leading-6 text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
              {notification.content ||
                notification.details ||
                notification.text ||
                'No additional message details.'}
            </div>
          </div>

          {(() => {
            const { link, targetTab, buttonLabel } = resolveAction(notification);
            if (!link && !targetTab) return null;
            return (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (targetTab && onNavigateTab) onNavigateTab(targetTab);
                    else if (link) {
                      if (onNavigateLink) onNavigateLink(link);
                      else if (link.startsWith('http://') || link.startsWith('https://')) {
                        window.open(link, '_blank');
                      }
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003580] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#002560]"
                >
                  <span>{buttonLabel}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })()}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
          <span className="font-medium text-slate-400">Adama Science & Technology University</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export interface NotificationCenterModalProps {
  notifications: ShellNotification[];
  unreadCount: number;
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelect: (notification: ShellNotification) => void;
}

export function NotificationCenterModal({
  notifications,
  unreadCount,
  onClose,
  onMarkAllRead,
  onSelect,
}: NotificationCenterModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580] dark:bg-sky-950/50 dark:text-sky-300">
              <Bell className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications Center</h3>
              <p className="text-[11px] font-medium text-slate-500">
                All announcements, alerts, and updates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-800/30">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Total: <strong>{notifications.length}</strong> notifications ({unreadCount} unread)
          </span>
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Mark All as Read
          </button>
        </div>

        <div className="max-h-[60vh] space-y-2.5 overflow-y-auto p-4">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onSelect(n)}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  n.unread
                    ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50/80 dark:border-sky-900/50 dark:bg-sky-950/30'
                    : 'border-slate-100 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                }`}
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    n.unread ? 'bg-[#003580]' : 'bg-slate-300'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {n.title || 'Notification'}
                    </h4>
                    <span className="shrink-0 text-[10px] font-medium text-slate-400">{n.time}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{n.text}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {n.category && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {n.category}
                      </span>
                    )}
                    {(n.ctaLink || n.targetTab) && (
                      <span className="text-[10px] font-bold text-[#003580] dark:text-sky-400">
                        Action Required →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="py-12 text-center text-xs text-slate-500">No notifications found.</p>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
