import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminStatCard from '../components/AdminStatCard';

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
const specificUsers = ['Abebe Kebede', 'Helena Tesfaye', 'Yonas Bekele', 'Ruth Alemu', 'Kalkidan Tadesse'];

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
    <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
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
  const notificationSummaryCards = [
    { title: 'Messages Sent', value: '4,820', icon: Megaphone, tone: 'blue' as const, trend: '+312 today' },
    { title: 'Open Rate', value: '72%', icon: Eye, tone: 'green' as const, trend: '+6% vs last month' },
    { title: 'Scheduled Sends', value: '11', icon: CalendarDays, tone: 'gold' as const, trend: 'Next in 2 hours' },
    { title: 'Templates Ready', value: '5', icon: MessageSquareText, tone: 'purple' as const, trend: 'All approved' },
  ];

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

  const notificationList = historyRows.filter((entry) => {
    const term = searchUsers.toLowerCase();
    return !term || [entry.subject, entry.targetGroup, entry.type].join(' ').toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notification Center"
        subtitle="Broadcast alerts and monitor delivery state."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Notification Center' }]}
        actions={<AdminBadge variant="success">Messaging Live</AdminBadge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {notificationSummaryCards.map((card) => (
          <AdminStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <SectionCard title="New Notification" subtitle="Compose and send notifications to targeted audiences.">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Type</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as NotificationType)}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                >
                  {['Email', 'In-App', 'Both'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Target</span>
                <select
                  value={target}
                  onChange={(event) => {
                    setTarget(event.target.value as TargetType);
                    setTargetValue('All');
                  }}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
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
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {target === 'Specific Users' ? 'Search specific users' : 'Target selection'}
                </span>
                {target === 'Specific Users' ? (
                  <div className="rounded-[8px] border border-slate-200 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-slate-400" />
                      <input
                        value={searchUsers}
                        onChange={(event) => setSearchUsers(event.target.value)}
                        placeholder="Search users..."
                        className="w-full bg-transparent outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                ) : (
                  <select
                    value={targetValue}
                    onChange={(event) => setTargetValue(event.target.value)}
                    className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                  >
                    {targetOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            )}

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Subject</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
              />
            </label>

            <div className="space-y-2">
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
                className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Schedule</span>
                <select
                  value={sendMode}
                  onChange={(event) => setSendMode(event.target.value as SendMode)}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                >
                  {['Send Now', 'Schedule for Date'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Schedule date</span>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                  disabled={sendMode === 'Send Now'}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Preview
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Sent History" subtitle="Track delivery performance and open rates.">
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Date Sent', 'Type', 'Subject', 'Target Group', 'Recipients', 'Open Rate', 'Status'].map((head) => (
                      <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notificationList.map((notification) => (
                    <tr
                      key={notification.id}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/70"
                      onClick={() => setDetail(notification)}
                    >
                      <td className="px-4 py-4 text-slate-600">{new Date(notification.dateSent).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <AdminBadge variant="default" className={typeClass(notification.type)}>
                          {notification.type}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{notification.subject}</td>
                      <td className="px-4 py-4 text-slate-600">{notification.targetGroup}</td>
                      <td className="px-4 py-4 text-slate-600">{notification.recipients.toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-600">{notification.openRate}</td>
                      <td className="px-4 py-4">
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
            <article key={template.name} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{template.name}</h4>
                  <p className="mt-1 text-xs text-slate-500">{template.title}</p>
                </div>
                <AdminBadge variant="neutral">Template</AdminBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{template.message}</p>
              <button
                type="button"
                onClick={() => applyTemplate(template)}
                className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                <Copy className="h-4 w-4" />
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
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Close Preview
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <AdminBadge variant="default">{type}</AdminBadge>
            <AdminBadge variant="neutral">{target}</AdminBadge>
            <AdminBadge variant="success">{sendMode}</AdminBadge>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Subject</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{subject}</p>
          </div>
          <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
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
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Close
            </button>
          </div>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
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
    <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
