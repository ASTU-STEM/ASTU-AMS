import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notificationService } from '../services/notification.service';
import { ictBtnIcon } from '../../ict/components/ictUi';

type NotificationItem = {
  id: string;
  title?: string;
  content?: string;
  isRead?: boolean;
  createdAt?: string;
};

export default function IctNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.getMyNotifications();
      if (!Array.isArray(result)) throw new Error('The notification service returned an invalid response.');
      setItems(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const markAsRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    const previousItems = items;
    setItems((current) => current.map((notification) =>
      notification.id === item.id ? { ...notification, isRead: true } : notification
    ));
    try {
      await notificationService.markAsRead(item.id);
    } catch (err) {
      setItems(previousItems);
      toast.error(err instanceof Error ? err.message : 'Could not mark notification as read.');
    }
  };

  const markAllAsRead = async () => {
    const previousItems = items;
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      setItems(previousItems);
      toast.error(err instanceof Error ? err.message : 'Could not mark notifications as read.');
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) void refresh();
        }}
        className={`${ictBtnIcon} relative h-9 w-9`}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[9px] font-bold leading-4 text-white" aria-hidden>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Notifications"
          className="ict-card ict-shadow-md absolute right-0 top-11 z-50 w-[min(23rem,calc(100vw-1.5rem))] overflow-hidden bg-[var(--bg-card)]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-[var(--ict-hairline)] px-3.5 py-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Notifications</h2>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                {unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => void refresh()} className={`${ictBtnIcon} h-8 w-8`} aria-label="Refresh notifications" title="Refresh notifications">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden />
              </button>
              {unreadCount > 0 && (
                <button type="button" onClick={() => void markAllAsRead()} className="inline-flex h-8 items-center gap-1 rounded px-2 text-[11px] font-semibold text-[var(--ict-accent-text)] hover:bg-[var(--ict-accent-soft)]">
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                  Mark all read
                </button>
              )}
            </div>
          </header>

          <div className="max-h-[min(22rem,60vh)] overflow-y-auto p-1.5" aria-live="polite">
            {loading && items.length === 0 ? (
              <p className="px-3 py-7 text-center text-xs text-[var(--text-muted)]">Loading notifications…</p>
            ) : error && items.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-rose-600">{error}</p>
                <button type="button" onClick={() => void refresh()} className="mt-2 text-xs font-semibold text-[var(--ict-accent-text)] hover:underline">Try again</button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-3 py-7 text-center text-xs text-[var(--text-muted)]">You have no notifications yet.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void markAsRead(item)}
                  className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2.5 text-left transition-colors ${item.isRead ? 'hover:bg-[var(--bg-page)]' : 'bg-[var(--ict-accent-soft)] hover:bg-[var(--ict-accent-soft)]'}`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? 'bg-slate-300' : 'bg-[var(--ict-accent)]'}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    {item.title && <span className="block text-xs font-bold text-[var(--text-primary)]">{item.title}</span>}
                    <span className="block text-xs leading-relaxed text-[var(--text-secondary)]">{item.content || 'Notification'}</span>
                    {item.createdAt && <time className="mt-1 block text-[10px] text-[var(--text-muted)]" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>}
                  </span>
                </button>
              ))
            )}
          </div>

          <footer className="border-t border-[var(--ict-hairline)] px-3.5 py-2.5">
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/admin/notifications'); }}
              className="text-xs font-bold text-[var(--ict-accent-text)] hover:underline"
            >
              Open notification center <span aria-hidden>→</span>
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}
