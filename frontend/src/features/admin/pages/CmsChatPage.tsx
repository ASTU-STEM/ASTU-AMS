import React, { useEffect, useMemo, useState } from 'react';
import { Inbox, MessageSquareText, Reply, Users } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminStatGrid from '../components/AdminStatGrid';
import { TelegramChat } from '../../../components/TelegramChat';

export default function CmsChatPage() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [unreadEstimate, setUnreadEstimate] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('astu_telegram_unread') || localStorage.getItem('astu_chat_unread');
      const n = raw ? Number(raw) : 0;
      setUnreadEstimate(Number.isFinite(n) ? n : 0);
    } catch {
      setUnreadEstimate(0);
    }
  }, []);

  const stats = useMemo(
    () => [
      {
        title: 'Officer Inbox',
        value: 'Live',
        icon: Inbox,
        tone: 'blue' as const,
        trend: 'Real-time channel',
        trendDirection: 'up' as const,
        description: 'Alumni, recruiters & departments',
      },
      {
        title: 'Unread / Attention',
        value: unreadEstimate > 0 ? String(unreadEstimate) : '—',
        icon: MessageSquareText,
        tone: 'amber' as const,
        trend: unreadEstimate > 0 ? 'Needs reply' : 'Caught up',
        trendDirection: unreadEstimate > 0 ? ('flat' as const) : ('up' as const),
      },
      {
        title: 'Reply Mode',
        value: 'Desk',
        icon: Reply,
        tone: 'green' as const,
        description: 'Official Alumni Affairs voice',
      },
      {
        title: 'Audience',
        value: 'Multi-role',
        icon: Users,
        tone: 'purple' as const,
        description: 'Alumni · Employer · Registrar · Admin',
      },
    ],
    [unreadEstimate],
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Messages"
        subtitle="Real-time messaging for Alumni Office officers with alumni, recruiters, registrar, departments, and admins."
        breadcrumbs={[{ label: 'Alumni Office' }, { label: 'Messages' }]}
      />
      <AdminStatGrid cols={4} compact stats={stats} />
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <TelegramChat darkMode={isDark} />
      </div>
    </div>
  );
}
