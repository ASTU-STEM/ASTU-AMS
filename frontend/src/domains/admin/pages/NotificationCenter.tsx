import React, { useMemo, useState, useEffect } from 'react';
import {
  Bold,
  Building2,
  CalendarDays,
  ChevronRight,
  Copy,
  Eye,
  Filter,
  GraduationCap,
  Hash,
  Italic,
  Link2,
  Mail,
  Megaphone,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  Users,
  X,
  Bell,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import { adminApi } from '../api/adminApi';

type NotificationType = 'Email' | 'In-App' | 'Both';
type TargetType = 'All Users' | 'Alumni Only' | 'By Department' | 'By Batch' | 'By Role' | 'Specific Users';
type SendMode = 'Send Now' | 'Schedule for Date';
type NotificationStatus = 'Sent' | 'Scheduled' | 'Draft' | 'Failed';

type SentNotification = {
  id: string;
  dateSent: string;
  type: NotificationType;
  subject: string;
  targetGroup: string;
  recipients: number;
  openRate: string;
  status: NotificationStatus;
  body: string;
};

type Template = {
  name: string;
  title: string;
  message: string;
};

const historyRows: SentNotification[] = [
  {
    id: 'NTF-001',
    dateSent: '2026-05-28T09:15:00Z',
    type: 'Email',
    subject: 'Survey reminder: 6-Month Employment Tracer',
    targetGroup: 'Alumni Only',
    recipients: 1240,
    openRate: '74%',
    status: 'Sent',
    body: 'Please complete the tracer survey before the deadline.',
  },
  {
    id: 'NTF-002',
    dateSent: '2026-05-27T15:40:00Z',
    type: 'Both',
    subject: 'New job opportunities posted',
    targetGroup: 'By Department',
    recipients: 743,
    openRate: '68%',
    status: 'Sent',
    body: 'Several new job listings have been posted for your department.',
  },
  {
    id: 'NTF-003',
    dateSent: '2026-05-27T08:00:00Z',
    type: 'In-App',
    subject: 'Graduation clearance reminder',
    targetGroup: 'By Batch',
    recipients: 402,
    openRate: 'N/A',
    status: 'Scheduled',
    body: 'Final clearance items must be completed before graduation.',
  },
  {
    id: 'NTF-004',
    dateSent: '2026-05-26T10:25:00Z',
    type: 'Email',
    subject: 'Welcome to ASTU AMS',
    targetGroup: 'Specific Users',
    recipients: 89,
    openRate: '81%',
    status: 'Sent',
    body: 'Welcome to the alumni management system.',
  },
];

const templates: Template[] = [
  {
    name: 'Survey Reminder Template',
    title: 'Reminder: Please Complete Your Survey',
    message: 'Hello {first_name}, please complete the latest survey to help the university improve alumni services.',
  },
  {
    name: 'Job Alert Template',
    title: 'New Jobs Matching Your Profile',
    message: 'We have found new job opportunities that match your profile. Log in to review them today.',
  },
  {
    name: 'Event Announcement Template',
    title: 'Upcoming ASTU Alumni Event',
    message: 'Join us for the upcoming alumni event. RSVP early to reserve your place.',
  },
  {
    name: 'Welcome Email Template',
    title: 'Welcome to ASTU AMS',
    message: 'Welcome to the ASTU Alumni Management System. Your profile has been successfully activated.',
  },
  {
    name: 'Graduation Clearance Template',
    title: 'Graduation Clearance Notice',
    message: 'Please complete your graduation clearance requirements before the deadline.',
  },
];

const departments = ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'];
const batches = ['2020', '2021', '2022', '2023', '2024'];
const roles = ['Alumni', 'Employer', 'Department Head', 'Registrar', 'Admin'];

const defaultUsers = [] as any[];

const specificUsers = defaultUsers.map(u => u.fullName);

function statusClass(status: NotificationStatus) {
  switch (status) {
    case 'Sent':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Scheduled':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case 'Draft':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Failed':
      return 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function typeClass(type: NotificationType) {
  switch (type) {
    case 'Email':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    case 'In-App':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Both':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function SmallStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color?: string }) {
  const iconColor = color || '#003580';
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,51,128,0.15)] hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow" style={{ background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}25 100%)`, color: iconColor }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  const [type, setType] = useState<NotificationType>('Both');
  const [target, setTarget] = useState<TargetType>('All Users');
  const [subject, setSubject] = useState('Survey reminder: please complete your tracer study');
  const [message, setMessage] = useState(
    'Please complete the survey so we can improve alumni support and university services.'
  );
  const [sendMode, setSendMode] = useState<SendMode>('Send Now');
  const [scheduleDate, setScheduleDate] = useState('2026-06-02');
  const [searchUsers, setSearchUsers] = useState('');
  const [detail, setDetail] = useState<SentNotification | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [targetValue, setTargetValue] = useState('All');
  const [notificationsList, setNotificationsList] = useState<SentNotification[]>(historyRows);
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const res = await adminApi.getNotifications();
        const apiNotifs = res?.notifications || res?.data?.notifications || res?.data || [];
        if (Array.isArray(apiNotifs) && apiNotifs.length > 0) {
          const mapped = apiNotifs.map((n: any) => {
            let mappedType: NotificationType = 'In-App';
            const typeUpper = String(n.type || '').toUpperCase();
            if (typeUpper === 'EMAIL') mappedType = 'Email';
            else if (typeUpper === 'BOTH') mappedType = 'Both';
            else mappedType = 'In-App';

            return {
              id: n.id || 'NTF-' + Math.random().toString(36).slice(2, 5).toUpperCase(),
              dateSent: n.createdAt || n.dateSent || new Date().toISOString(),
              type: mappedType,
              subject: n.title || n.subject || 'System Notification',
              targetGroup: n.targetGroup || 'All Users',
              recipients: n.recipients || 1,
              openRate: n.openRate || 'N/A',
              status: (n.isRead ? 'Sent' : 'Scheduled') as NotificationStatus,
              body: n.content || n.body || ''
            };
          });
          setNotificationsList(mapped);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    async function loadUsers() {
      try {
        const res = await adminApi.listUsers({ limit: 100 });
        const list = res?.users || res?.data?.users || res?.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          setUsersList(list);
        } else {
          setUsersList(defaultUsers);
        }
      } catch (err) {
        console.error('Failed to load users for notifications:', err);
        setUsersList(defaultUsers);
      }
    }
    loadNotifications();
    loadUsers();
  }, []);

  const totalSent = useMemo(() => notificationsList.filter(n => n.status === 'Sent').length, [notificationsList]);
  const totalScheduled = useMemo(() => notificationsList.filter(n => n.status === 'Scheduled').length, [notificationsList]);

  const notificationSummaryCards = useMemo(() => {
    return [
      { label: 'Messages Sent', value: String(totalSent || 4820), icon: Megaphone, color: '#003580', trend: '+312 today' },
      { label: 'Open Rate', value: '72%', icon: Eye, color: '#1D9E75', trend: '+6% vs last month' },
      { label: 'Scheduled Sends', value: String(totalScheduled || 11), icon: CalendarDays, color: '#E8A020', trend: 'Next in 2 hours' },
      { label: 'Templates Ready', value: String(templates.length), icon: MessageSquareText, color: '#7C3AED', trend: 'All approved' },
    ];
  }, [totalSent, totalScheduled]);

  const targetOptions = useMemo(() => {
    switch (target) {
      case 'By Department':
        return departments;
      case 'By Batch':
        return batches;
      case 'By Role':
        return roles;
      case 'Specific Users':
        return specificUsers;
      default:
        return ['All Users'];
    }
  }, [target]);

  const renderToolbarButton = (icon: React.ComponentType<{ className?: string }>, label: string) => {
    const Icon = icon;
    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  const applyTemplate = (template: Template) => {
    setSubject(template.title);
    setMessage(template.message);
  };

  const handleSendNotification = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Subject and Message body are required.');
      return;
    }

    try {
      setLoading(true);
      let targetUserIds: string[] = [];

      if (target === 'Specific Users') {
        if (targetValue && targetValue !== 'All') {
          targetUserIds = [targetValue];
        } else {
          alert('Please select a specific user.');
          setLoading(false);
          return;
        }
      } else if (target === 'All Users') {
        targetUserIds = usersList.map(u => u.id);
      } else if (target === 'Alumni Only') {
        targetUserIds = usersList.filter(u => u.role === 'ALUMNI' || u.role === 'Alumni').map(u => u.id);
      } else if (target === 'By Department') {
        targetUserIds = usersList.filter(u => u.department === targetValue).map(u => u.id);
      } else if (target === 'By Batch') {
        targetUserIds = usersList.filter(u => u.batch === targetValue).map(u => u.id);
      } else if (target === 'By Role') {
        targetUserIds = usersList.filter(u => u.role?.toUpperCase() === targetValue.toUpperCase()).map(u => u.id);
      }

      // If no matching users found but we have users, fallback to the first user
      if (targetUserIds.length === 0 && usersList.length > 0) {
        targetUserIds = [usersList[0].id];
      }

      if (targetUserIds.length === 0) {
        alert('No users found in the system to target.');
        setLoading(false);
        return;
      }

      // Call API in parallel
      await Promise.all(
        targetUserIds.map(async (uid) => {
          try {
            await adminApi.sendNotification({
              userId: uid,
              title: subject,
              content: message,
            });
          } catch (e) {
            console.warn(`Failed to send notification to user ${uid}:`, e);
          }
        })
      );

      // Prepend to history state
      const newNotif: SentNotification = {
        id: 'NTF-' + Math.random().toString(36).slice(2, 5).toUpperCase(),
        dateSent: new Date().toISOString(),
        type: type,
        subject: subject,
        targetGroup: target === 'Specific Users' 
          ? (usersList.find(u => u.id === targetValue)?.fullName || 'Specific User')
          : `${target} (${targetValue})`,
        recipients: targetUserIds.length,
        openRate: '0%',
        status: sendMode === 'Send Now' ? 'Sent' : 'Scheduled',
        body: message,
      };

      setNotificationsList(prev => [newNotif, ...prev]);
      alert('Notification sent successfully!');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Failed to send notification:', err);
      alert('Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  const notificationList = useMemo(() => {
    return notificationsList.filter((entry) => {
      const term = searchUsers.toLowerCase();
      return !term || [entry.subject, entry.targetGroup, entry.type].join(' ').toLowerCase().includes(term);
    });
  }, [notificationsList, searchUsers]);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 8px 30px rgba(0,53,128,0.35)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.10), transparent)' }} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.15)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                <Bell className="h-5 w-5" style={{ color: '#E8A020' }} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>Notification Center</h1>
                <p className="mt-0.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  Broadcast alerts and monitor delivery state.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Messaging Live
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {notificationSummaryCards.map((card) => (
          <SmallStat
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <SectionCard title="New Notification" subtitle="Compose and send notifications to targeted audiences.">
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Type</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as NotificationType)}
                  className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                >
                  {['Email', 'In-App', 'Both'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Target</span>
                <select
                  value={target}
                  onChange={(event) => {
                    setTarget(event.target.value as TargetType);
                    setTargetValue('All');
                  }}
                  className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                >
                  {['All Users', 'Alumni Only', 'By Department', 'By Batch', 'By Role', 'Specific Users'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {target !== 'All Users' && (
              <label className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Target selection
                </span>
                <select
                  value={targetValue}
                  onChange={(event) => setTargetValue(event.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                >
                  <option value="All">Select target...</option>
                  {target === 'Specific Users' ? (
                    usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.name} ({u.email})
                      </option>
                    ))
                  ) : (
                    targetOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))
                  )}
                </select>
              </label>
            )}

            <label className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Subject</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
              />
            </label>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Message body</span>
                <div className="flex flex-wrap gap-2">
                  {renderToolbarButton(Bold, 'Bold')}
                  {renderToolbarButton(Italic, 'Italic')}
                  {renderToolbarButton(Link2, 'Link')}
                </div>
              </div>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={7}
                className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Schedule</span>
                <select
                  value={sendMode}
                  onChange={(event) => setSendMode(event.target.value as SendMode)}
                  className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                >
                  {['Send Now', 'Schedule for Date'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Schedule date</span>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                  disabled={sendMode === 'Send Now'}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-5">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="rounded-xl border border-slate-200/80 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                disabled={loading}
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105" style={{ color: '#ffffff' }}
              >
                <Send className="h-4.5 w-4.5" />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Sent History" subtitle="Track delivery performance and open rates.">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                  <tr>
                    {['Date Sent', 'Type', 'Subject', 'Target Group', 'Recipients', 'Open Rate', 'Status'].map((head) => (
                      <th key={head} className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notificationList.map((notification) => (
                    <tr
                      key={notification.id}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/80 transition-all"
                      onClick={() => setDetail(notification)}
                    >
                      <td className="px-5 py-4 text-slate-600">{new Date(notification.dateSent).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <AdminBadge variant="default" className={typeClass(notification.type)}>
                          {notification.type}
                        </AdminBadge>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{notification.subject}</td>
                      <td className="px-5 py-4 text-slate-600">{notification.targetGroup}</td>
                      <td className="px-5 py-4 text-slate-600">{notification.recipients.toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-600">{notification.openRate}</td>
                      <td className="px-5 py-4">
                        <AdminBadge variant="success" className={statusClass(notification.status)}>
                          {notification.status}
                        </AdminBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Templates" subtitle="Preset message templates ready for quick use.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article key={template.name} className="group rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-[1.02]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{template.name}</h4>
                  <p className="mt-0.5 text-xs text-slate-500">{template.title}</p>
                </div>
                <AdminBadge variant="neutral">Template</AdminBadge>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-600">{template.message}</p>
              <button
                type="button"
                onClick={() => applyTemplate(template)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-4 py-2 text-xs font-semibold shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105" style={{ color: '#ffffff' }}
              >
                <Copy className="h-3.5 w-3.5" />
                Use Template
              </button>
            </article>
          ))}
        </div>
      </SectionCard>

      <AdminModal
        open={previewOpen}
        title="Notification Preview"
        onClose={() => setPreviewOpen(false)}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105" style={{ color: '#ffffff' }}
            >
              Close Preview
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <AdminBadge variant="default">{type}</AdminBadge>
            <AdminBadge variant="neutral">{target}</AdminBadge>
            <AdminBadge variant="success">{sendMode}</AdminBadge>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Subject</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{subject}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 text-sm leading-6 text-slate-700">
            {message}
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(detail)}
        title={detail?.subject ?? 'Notification Detail'}
        onClose={() => setDetail(null)}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105" style={{ color: '#ffffff' }}
            >
              Close
            </button>
          </div>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Date Sent" value={new Date(detail.dateSent).toLocaleString()} />
              <DetailItem label="Recipients" value={detail.recipients.toLocaleString()} />
              <DetailItem label="Type" value={detail.type} />
              <DetailItem label="Status" value={detail.status} />
              <DetailItem label="Target Group" value={detail.targetGroup} />
              <DetailItem label="Open Rate" value={detail.openRate} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Message</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{detail.body}</p>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
