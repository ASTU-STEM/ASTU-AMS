import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  FileText,
  Mail,
  MailCheck,
  MousePointerClick,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminStatCard from '../components/AdminStatCard';

type AudienceMode = 'All Users' | 'By Role' | 'By Department' | 'By Batch' | 'Specific Users';
type SendMode = 'send-now' | 'schedule';
type CampaignStatus = 'Sent' | 'Scheduled' | 'Draft';

type EmailUser = {
  id: string;
  name: string;
  email: string;
  role: 'Alumni' | 'Employer' | 'Department Head' | 'Registrar' | 'Admin';
  department: string;
  batch: string;
  status: 'Active' | 'Pending Verification' | 'Inactive';
};

type Template = {
  id: string;
  name: string;
  subject: string;
  preview: string;
  body: string;
  tag: string;
};

type Campaign = {
  id: string;
  subject: string;
  audience: string;
  recipients: number;
  status: CampaignStatus;
  openRate: string;
  clickRate: string;
  sentAt: string;
};

const users: EmailUser[] = [
  { id: 'USR-001', name: 'Abebe Kebede', email: 'abebe.kebede@astu.edu.et', role: 'Alumni', department: 'Software Engineering', batch: '2018', status: 'Active' },
  { id: 'USR-002', name: 'Tigist Haile', email: 'tigist@safir.com', role: 'Employer', department: 'External Partner', batch: 'N/A', status: 'Active' },
  { id: 'USR-003', name: 'Dr. Meseret Alemu', email: 'cs.head@astu.edu.et', role: 'Department Head', department: 'Computer Science', batch: 'Faculty', status: 'Active' },
  { id: 'USR-004', name: 'Dr. Abebe Assefa', email: 'registrar@astu.edu.et', role: 'Registrar', department: 'Registrar Office', batch: 'Faculty', status: 'Active' },
  { id: 'USR-005', name: 'Admin User', email: 'admin@astu.edu.et', role: 'Admin', department: 'System Office', batch: 'N/A', status: 'Active' },
  { id: 'USR-006', name: 'Helena Tesfaye', email: 'helena.tesfaye@astu.edu.et', role: 'Alumni', department: 'Electrical Engineering', batch: '2019', status: 'Pending Verification' },
  { id: 'USR-007', name: 'Yonas Bekele', email: 'yonas.bekele@astu.edu.et', role: 'Alumni', department: 'Mechanical Engineering', batch: '2020', status: 'Active' },
  { id: 'USR-008', name: 'Ruth Alemu', email: 'ruth.alemu@astu.edu.et', role: 'Alumni', department: 'Civil Engineering', batch: '2021', status: 'Active' },
  { id: 'USR-009', name: 'Kalkidan Tadesse', email: 'kalkidan.t@astu.edu.et', role: 'Alumni', department: 'Computer Science', batch: '2022', status: 'Inactive' },
];

const templates: Template[] = [
  {
    id: 'survey',
    name: 'Tracer Survey Reminder',
    subject: 'Reminder: complete your ASTU tracer survey',
    preview: 'A polite reminder for alumni who have not completed tracer studies.',
    tag: 'Survey',
    body: 'Hello {first_name},\n\nPlease complete your ASTU tracer survey. Your response helps the university improve programs, career support, and graduate services.\n\nThank you,\nASTU Alumni Management Team',
  },
  {
    id: 'jobs',
    name: 'Job Opportunity Digest',
    subject: 'New opportunities matched to your ASTU profile',
    preview: 'Send curated vacancies and career updates to selected alumni.',
    tag: 'Career',
    body: 'Hello {first_name},\n\nNew job opportunities matching your profile are now available in the ASTU Alumni Portal. Please sign in to review the latest openings and application deadlines.\n\nBest regards,\nASTU Career Services',
  },
  {
    id: 'event',
    name: 'Alumni Event Invitation',
    subject: 'You are invited to an ASTU alumni event',
    preview: 'Invite alumni, employers, and partners to an upcoming event.',
    tag: 'Event',
    body: 'Hello {first_name},\n\nYou are invited to an upcoming ASTU alumni event. Join faculty, graduates, and employers for networking, career conversations, and university updates.\n\nRegards,\nASTU Alumni Office',
  },
];

const campaignHistory: Campaign[] = [
  { id: 'CMP-1048', subject: 'Reminder: complete your ASTU tracer survey', audience: 'Alumni / 2022 batch', recipients: 1264, status: 'Sent', openRate: '73%', clickRate: '21%', sentAt: 'Today, 09:15' },
  { id: 'CMP-1047', subject: 'New opportunities matched to your ASTU profile', audience: 'Engineering departments', recipients: 842, status: 'Sent', openRate: '68%', clickRate: '18%', sentAt: 'Yesterday, 14:30' },
  { id: 'CMP-1046', subject: 'You are invited to an ASTU alumni event', audience: 'All active users', recipients: 4812, status: 'Scheduled', openRate: '-', clickRate: '-', sentAt: 'Jun 14, 08:00' },
  { id: 'CMP-1045', subject: 'Profile completion request', audience: 'Pending verification', recipients: 142, status: 'Draft', openRate: '-', clickRate: '-', sentAt: 'Draft saved' },
];

const roles = ['Alumni', 'Employer', 'Department Head', 'Registrar', 'Admin'];
const departments = ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Registrar Office'];
const batches = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];

function statusClass(status: CampaignStatus) {
  if (status === 'Sent') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'Scheduled') return 'bg-blue-50 text-blue-700 border-blue-100';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-xs leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function EmailCenter() {
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('All Users');
  const [filterValue, setFilterValue] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>(['USR-001', 'USR-006']);
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState(templates[0].subject);
  const [body, setBody] = useState(templates[0].body);
  const [sendMode, setSendMode] = useState<SendMode>('send-now');
  const [scheduleDate, setScheduleDate] = useState('2026-06-15T09:00');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [userPickerOpen, setUserPickerOpen] = useState(false);

  const filterOptions = useMemo(() => {
    if (audienceMode === 'By Role') return roles;
    if (audienceMode === 'By Department') return departments;
    if (audienceMode === 'By Batch') return batches;
    return ['All'];
  }, [audienceMode]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !term || [user.name, user.email, user.role, user.department, user.batch].join(' ').toLowerCase().includes(term);
      const matchesMode =
        audienceMode === 'All Users' ||
        audienceMode === 'Specific Users' ||
        (audienceMode === 'By Role' && (filterValue === 'All' || user.role === filterValue)) ||
        (audienceMode === 'By Department' && (filterValue === 'All' || user.department === filterValue)) ||
        (audienceMode === 'By Batch' && (filterValue === 'All' || user.batch === filterValue));
      return matchesSearch && matchesMode;
    });
  }, [audienceMode, filterValue, searchTerm]);

  const recipients = audienceMode === 'Specific Users'
    ? users.filter((user) => selectedIds.includes(user.id))
    : filteredUsers.filter((user) => user.status !== 'Inactive');

  const activeRate = recipients.length > 0
    ? Math.round((recipients.filter((user) => user.status === 'Active').length / recipients.length) * 100)
    : 0;

  const applyTemplate = (template: Template) => {
    setSubject(template.subject);
    setBody(template.body);
    toast.success(`${template.name} applied`);
  };

  const toggleUser = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Add a subject and message before sending.');
      return;
    }

    if (recipients.length === 0) {
      toast.error('Select at least one recipient.');
      return;
    }

    toast.success(sendMode === 'send-now' ? `Email queued for ${recipients.length} recipients.` : `Email scheduled for ${recipients.length} recipients.`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email Center"
        subtitle="Create targeted campaigns, filter recipients, preview messages, and schedule professional email delivery from one admin workspace."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Email Center' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AdminBadge variant="success" className="bg-white/15 text-white ring-1 ring-white/10">SMTP Ready</AdminBadge>
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 text-xs font-bold text-[#003580] shadow-sm transition-all hover:bg-white/90"
            >
              <Send className="h-3.5 w-3.5" />
              {sendMode === 'send-now' ? 'Send Email' : 'Schedule'}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Reachable Users" value="4,812" icon={Users} tone="blue" trend="+142 verified this month" />
        <AdminStatCard title="Delivery Rate" value="98.6%" icon={MailCheck} tone="green" trend="Healthy sender score" />
        <AdminStatCard title="Avg Open Rate" value="72%" icon={Eye} tone="gold" trend="+4% from last campaign" />
        <AdminStatCard title="Click Rate" value="19%" icon={MousePointerClick} tone="purple" trend="Career emails lead" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,390px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel title="Audience Builder" subtitle="Filter broadly or hand-pick recipients for sensitive messages.">
            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Audience method</span>
                <select
                  value={audienceMode}
                  onChange={(event) => {
                    const nextMode = event.target.value as AudienceMode;
                    setAudienceMode(nextMode);
                    setFilterValue('All');
                    setUserPickerOpen(nextMode === 'Specific Users');
                  }}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]"
                >
                  {['All Users', 'By Role', 'By Department', 'By Batch', 'Specific Users'].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              {audienceMode !== 'All Users' && audienceMode !== 'Specific Users' && (
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Filter value</span>
                  <select
                    value={filterValue}
                    onChange={(event) => setFilterValue(event.target.value)}
                    className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]"
                  >
                    <option>All</option>
                    {filterOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              )}

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Search users</span>
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2.5 focus-within:border-[#003580]">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        if (audienceMode === 'Specific Users') setUserPickerOpen(true);
                      }}
                      onFocus={() => {
                        if (audienceMode === 'Specific Users') setUserPickerOpen(true);
                      }}
                      onBlur={() => window.setTimeout(() => setUserPickerOpen(false), 120)}
                      placeholder={audienceMode === 'Specific Users' ? 'Tap to choose existing users...' : 'Name, email, role, department...'}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {audienceMode === 'Specific Users' && userPickerOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-80 overflow-y-auto rounded-[10px] border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                          const selected = selectedIds.includes(user.id);
                          const disabled = user.status === 'Inactive';
                          return (
                            <button
                              key={user.id}
                              type="button"
                              disabled={disabled}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                if (!disabled) toggleUser(user.id);
                              }}
                              className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                selected ? 'bg-[#003580]/8' : 'hover:bg-slate-50'
                              }`}
                            >
                              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                selected ? 'bg-[#003580] text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-slate-900">{user.name}</span>
                                <span className="block truncate text-xs text-slate-500">{user.email}</span>
                              </span>
                              <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 sm:inline-flex">
                                {user.role}
                              </span>
                              {selected && <CheckCircle2 className="h-4 w-4 text-[#003580]" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-6 text-center text-sm text-slate-500">No users match your search.</div>
                      )}
                    </div>
                  )}
                </div>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[10px] bg-[#003580]/8 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#003580]">Recipients</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{recipients.length}</p>
                </div>
                <div className="rounded-[10px] bg-emerald-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Active</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{activeRate}%</p>
                </div>
                <div className="rounded-[10px] bg-amber-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">Skipped</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{users.length - recipients.length}</p>
                </div>
              </div>

              {audienceMode === 'Specific Users' && (
                <div className="rounded-[12px] border border-slate-200 bg-slate-50/70 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Select recipients</p>
                      <p className="mt-1 text-xs text-slate-500">{selectedIds.length} user{selectedIds.length === 1 ? '' : 's'} selected</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedIds(filteredUsers.filter((user) => user.status !== 'Inactive').map((user) => user.id))}
                      className="rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-bold text-white hover:brightness-110"
                    >
                      Select Active
                    </button>
                  </div>

                  <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                    {filteredUsers.map((user) => {
                      const selected = selectedIds.includes(user.id);
                      const disabled = user.status === 'Inactive';
                      return (
                        <button
                          key={user.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleUser(user.id)}
                          className={`w-full rounded-[10px] border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-55 ${
                            selected
                              ? 'border-[#003580] bg-white ring-2 ring-[#003580]/10'
                              : 'border-slate-200 bg-white hover:border-[#003580]/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                              <p className="truncate text-xs text-slate-500">{user.email}</p>
                            </div>
                            {selected ? <CheckCircle2 className="h-4 w-4 text-[#003580]" /> : <X className="h-4 w-4 text-slate-300" />}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <AdminBadge variant="neutral">{user.role}</AdminBadge>
                            <AdminBadge variant={user.status === 'Active' ? 'success' : user.status === 'Inactive' ? 'neutral' : 'warning'}>
                              {user.status}
                            </AdminBadge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Templates" subtitle="Start from approved communication patterns.">
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="w-full rounded-[10px] border border-slate-200 p-3 text-left transition-all hover:border-[#003580]/30 hover:bg-[#003580]/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{template.preview}</p>
                    </div>
                    <AdminBadge variant="neutral">{template.tag}</AdminBadge>
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title="Compose Email"
            subtitle="Use clear subject lines, personalization tokens, and a plain-language message."
            action={<AdminBadge variant="info">{recipients.length} recipients</AdminBadge>}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Subject</span>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Message</span>
                  <textarea
                    rows={10}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    className="w-full resize-none rounded-[10px] border border-slate-200 px-3 py-3 text-sm leading-relaxed outline-none focus:border-[#003580]"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  {['{first_name}', '{department}', '{batch}', '{portal_link}'].map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => setBody((current) => `${current} ${token}`)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              <aside className="space-y-3 rounded-[12px] border border-slate-200 bg-slate-50/70 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Delivery mode</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSendMode('send-now')}
                      className={`rounded-[8px] px-3 py-2 text-xs font-bold ${sendMode === 'send-now' ? 'bg-[#003580] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                      Send now
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendMode('schedule')}
                      className={`rounded-[8px] px-3 py-2 text-xs font-bold ${sendMode === 'schedule' ? 'bg-[#003580] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                      Schedule
                    </button>
                  </div>
                </div>

                {sendMode === 'schedule' && (
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Schedule date</span>
                    <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(event) => setScheduleDate(event.target.value)}
                      className="mt-2 w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                    />
                  </label>
                )}

                <div className="space-y-2 border-t border-slate-200 pt-3">
                  {[
                    { icon: ShieldCheck, label: 'Role-based targeting checked', ok: true },
                    { icon: CheckCircle2, label: 'Inactive users excluded', ok: true },
                    { icon: AlertCircle, label: 'Subject under 70 characters', ok: subject.length <= 70 },
                    { icon: FileText, label: 'Personalization tokens supported', ok: true },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
                        <Icon className={`h-4 w-4 ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-2 border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success('Draft saved.')}
                    className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-3 py-2.5 text-xs font-bold text-white hover:brightness-110"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {sendMode === 'send-now' ? 'Send Email' : 'Schedule Email'}
                  </button>
                </div>
              </aside>
            </div>
          </Panel>

          <Panel title="Campaign History" subtitle="Recent sends, scheduled work, and saved drafts.">
            <div className="overflow-hidden rounded-[10px] border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Campaign</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Audience</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Recipients</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Performance</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {campaignHistory.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{campaign.subject}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {campaign.sentAt}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{campaign.audience}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">{campaign.recipients.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div>Open: {campaign.openRate}</div>
                        <div>Click: {campaign.clickRate}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>

      <AdminModal
        open={previewOpen}
        title="Email Preview"
        onClose={() => setPreviewOpen(false)}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPreviewOpen(false)} className="rounded-[8px] border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Close
            </button>
            <button type="button" onClick={handleSend} className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
              <Send className="h-4 w-4" />
              Confirm
            </button>
          </div>
        }
      >
        <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-4">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-[#003580] px-5 py-4 text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Mail className="h-4 w-4" />
                ASTU Alumni Management System
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Subject</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{subject}</h2>
              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700">
                {body.replaceAll('{first_name}', 'Abebe').replaceAll('{department}', 'Software Engineering').replaceAll('{batch}', '2018').replaceAll('{portal_link}', 'https://astu-ams.edu.et/login')}
              </div>
              <div className="mt-6 rounded-[10px] bg-slate-50 p-3 text-xs text-slate-500">
                Sending to {recipients.length} recipient{recipients.length === 1 ? '' : 's'} through the selected admin audience rules.
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
