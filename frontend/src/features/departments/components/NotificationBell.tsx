import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bell,
  Briefcase,
  ClipboardCheck,
  FileText,
  MessageSquare,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
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

const NEUTRAL = { bg: '#334155', text: '#e2e8f0', icon: Bell, tint: '#cbd5e1' };

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
  icon: LucideIcon;
  tint: string;
} {
  const t = (title || '').toLowerCase();
  if (t.includes('survey') || t.includes('questionnaire') || t.includes('tracer') || t.includes('feedback'))
    return { bg: '#0d9488', text: '#ffffff', icon: FileText, tint: '#2dd4bf' };
  if (t.includes('message') || t.includes('chat') || t.includes('mention'))
    return { bg: '#2563eb', text: '#ffffff', icon: MessageSquare, tint: '#60a5fa' };
  if (t.includes('job') || t.includes('hire') || t.includes('offer') || t.includes('internship'))
    return { bg: '#7c3aed', text: '#ffffff', icon: Briefcase, tint: '#a78bfa' };
  if (t.includes('approve') || t.includes('reject') || t.includes('verify') || t.includes('accept') || t.includes('pending'))
    return { bg: '#d97706', text: '#ffffff', icon: ClipboardCheck, tint: '#fbbf24' };
  if (t.includes('await') || t.includes('coming') || t.includes('update') || t.includes('new'))
    return { bg: '#e11d48', text: '#ffffff', icon: Sparkles, tint: '#fb7185' };
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

export function NotificationBell({ darkMode: _darkMode, onNavigate }: NotificationBellProps) {
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
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Notifications</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="shrink-0 text-xs font-semibold text-[#E24B4A] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 space-y-1 overflow-y-auto p-2">
            {loading && recent.length === 0 ? (
              <div className="px-2 py-8 text-center text-sm text-[var(--text-secondary)]">Loading…</div>
            ) : recent.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-[var(--text-secondary)]">No notifications yet</p>
            ) : (
              recent.map((n) => {
                const kind = guessKind(n.title);
                const Icon = kind.icon;
                const isUnread = !n.isRead;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => (isUnread ? markRead(n) : onNavigate && onNavigate(guessTab(n.title)))}
                    className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-black/5"
                  >
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: kind.bg }}
                    >
                      <Icon className="h-4 w-4" style={{ color: kind.text }} strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold text-[var(--text-primary)]">{n.title}</p>
                        {isUnread && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#003580]" />}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">{n.content}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{timeAgo(n.createdAt)}</p>
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