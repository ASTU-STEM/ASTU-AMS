import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { notificationService } from '../../notifications/services/notification.service';

interface DepartmentNotification {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface NotificationBellProps {
  darkMode: boolean;
  onNavigate?: (tab: string) => void;
}

const NEUTRAL = { bg: '#334155', text: '#e2e8f0', icon: 'notifications', tint: '#cbd5e1' };

function guessTab(title: string): string | null {
  const t = (title || '').toLowerCase();
  if (t.includes('survey') || t.includes('questionnaire') || t.includes('tracer')) return 'surveys';
  if (t.includes('message') || t.includes('chat')) return 'messages';
  if (t.includes('alumni') || t.includes('graduate')) return 'graduates';
  if (t.includes('employ')) return 'employment';
  return 'dashboard';
}

function guessKind(title: string): {
  bg: string;
  text: string;
  icon: string;
  tint: string;
} {
  const t = (title || '').toLowerCase();
  if (t.includes('survey') || t.includes('questionnaire') || t.includes('tracer') || t.includes('feedback'))
    return { bg: '#0d9488', text: '#ffffff', icon: 'description', tint: '#2dd4bf' };
  if (t.includes('message') || t.includes('chat') || t.includes('mention'))
    return { bg: '#2563eb', text: '#ffffff', icon: 'forum', tint: '#60a5fa' };
  if (t.includes('job') || t.includes('hire') || t.includes('offer') || t.includes('internship'))
    return { bg: '#7c3aed', text: '#ffffff', icon: 'work', tint: '#a78bfa' };
  if (t.includes('approve') || t.includes('reject') || t.includes('verify') || t.includes('accept') || t.includes('pending'))
    return { bg: '#d97706', text: '#ffffff', icon: 'fact_check', tint: '#fbbf24' };
  if (t.includes('await') || t.includes('coming') || t.includes('update') || t.includes('new'))
    return { bg: '#e11d48', text: '#ffffff', icon: 'new_releases', tint: '#fb7185' };
  return NEUTRAL;
}

function timeAgo(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell({ darkMode, onNavigate }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<DepartmentNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recent = notifications.slice(0, 12);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data ?? []);
    } catch {
      if (!silent) toast.error('Failed to load notifications');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load(true);
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markRead = async (n: DepartmentNotification) => {
    if (markingId) return;
    setMarkingId(n.id);
    try {
      await notificationService.markAsRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      if (onNavigate) {
        const tab = guessTab(n.title);
        if (tab) onNavigate(tab);
      }
    } catch {
      toast.error('Failed to mark as read');
    } finally {
      setMarkingId(null);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative rounded-full p-2 transition ${darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'}`}
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-label="Notifications"
      >
        <span className={`material-symbols-outlined text-xl ${unreadCount > 0 ? 'animate-[bell_shake_1.6s_ease-in-out_infinite]' : ''}`}>
          notifications
        </span>
        {unreadCount > 0 && (
          <span
            className={`absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow ${
              darkMode ? 'bg-amber-400 text-slate-900' : 'bg-[#E31E24]'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border shadow-xl ${
            darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
          }`}
        >
          <div className={`flex items-center justify-between border-b px-4 py-3 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</p>
              <p className={`text-[11px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                  darkMode
                    ? 'text-amber-400 hover:bg-slate-800'
                    : 'text-[#003580] hover:bg-blue-50'
                }`}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && recent.length === 0 ? (
              <div className={`px-4 py-8 text-center text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="material-symbols-outlined mb-1 block animate-pulse text-2xl opacity-40">sync</span>
                Loading…
              </div>
            ) : recent.length === 0 ? (
              <div className={`px-4 py-10 text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className="material-symbols-outlined mb-2 block text-3xl text-slate-300 dark:text-slate-600">notifications_off</span>
                <p className="text-xs font-medium">No notifications yet</p>
                <p className="mt-1 text-[11px] opacity-70">Updates about surveys, messages and alumni will appear here.</p>
              </div>
            ) : (
              recent.map((n) => {
                const kind = guessKind(n.title);
                const isUnread = !n.isRead;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => (isUnread ? markRead(n) : onNavigate && onNavigate(guessTab(n.title)))}
                    className={`block w-full border-b px-4 py-3 text-left transition last:border-b-0 ${
                      isUnread
                        ? darkMode ? 'bg-slate-800/50' : 'bg-blue-50/50'
                        : darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: kind.bg }}
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ color: kind.text }}>
                          {kind.icon}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`truncate text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{n.title}</p>
                          {isUnread && (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: kind.tint }}
                            />
                          )}
                        </div>
                        <p className={`mt-0.5 line-clamp-2 text-xs leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{n.content}</p>
                        <p className={`mt-1 text-[10px] font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}