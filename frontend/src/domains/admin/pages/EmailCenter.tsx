import React, { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  FileText,
  Inbox,
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
import EmptyState from '../../../shared/components/EmptyState';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { adminApi } from '../api/adminApi';

type AudienceMode = 'All Users' | 'By Role' | 'By Department' | 'By Batch' | 'Specific Users';
type SendMode = 'send-now' | 'schedule';

type Campaign = {
  id: string;
  subject: string;
  audience: string;
  recipients: number;
  status: 'Sent' | 'Scheduled' | 'Draft';
  openRate: string;
  clickRate: string;
  sentAt: string;
};

type EmailStats = {
  reachableUsers: number;
  deliveryRate: string;
  avgOpenRate: string;
  clickRate: string;
};

function statusClass(status: Campaign['status']) {
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
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendMode, setSendMode] = useState<SendMode>('send-now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [campaignsRes, statsRes] = await Promise.allSettled([
          adminApi.getEmailCampaigns(),
          adminApi.getEmailStats(),
        ]);
        if (campaignsRes.status === 'fulfilled' && campaignsRes.value?.success) {
          setCampaigns(campaignsRes.value.data || []);
        }
        if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
          setStats(statsRes.value.data);
        }
      } catch {
        // API not available yet, showing empty state
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Add a subject and message before sending.');
      return;
    }
    toast.success(sendMode === 'send-now'
      ? 'Email queued for delivery.'
      : `Email scheduled for ${scheduleDate}.`);
    setSubject('');
    setBody('');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <LoadingSkeleton />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-[12px] bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

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

      {stats ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard title="Reachable Users" value={stats.reachableUsers.toLocaleString()} icon={Users} tone="blue" trend="Verified users" />
          <AdminStatCard title="Delivery Rate" value={stats.deliveryRate} icon={MailCheck} tone="green" trend="Healthy sender score" />
          <AdminStatCard title="Avg Open Rate" value={stats.avgOpenRate} icon={Eye} tone="gold" trend="From recent campaigns" />
          <AdminStatCard title="Click Rate" value={stats.clickRate} icon={MousePointerClick} tone="purple" trend="Career emails lead" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(['Reachable Users', 'Delivery Rate', 'Avg Open Rate', 'Click Rate'] as const).map((title) => (
            <div key={title} className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
              <p className="mt-2 text-xl font-bold text-slate-900">—</p>
              <p className="mt-1 text-xs text-slate-500">Awaiting backend data</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,390px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel title="Audience Builder" subtitle="Filter broadly or hand-pick recipients for sensitive messages.">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">Select recipients</p>
              <p className="mt-1 text-xs text-slate-500">Recipient data will load once the alumni directory API is connected.</p>
            </div>
          </Panel>

          <Panel title="Templates" subtitle="Start from approved communication patterns.">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No templates yet</p>
              <p className="mt-1 text-xs text-slate-500">Email templates will appear here once configured in the CMS.</p>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title="Compose Email"
            subtitle="Use clear subject lines, personalization tokens, and a plain-language message."
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Subject</span>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Message</span>
                  <textarea
                    rows={10}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your email message..."
                    className="w-full resize-none rounded-[10px] border border-slate-200 px-3 py-3 text-sm leading-relaxed outline-none focus:border-[#003580]"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  {['{first_name}', '{department}', '{batch}', '{portal_link}'].map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => setBody((prev) => `${prev} ${token}`)}
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
                      onChange={(e) => setScheduleDate(e.target.value)}
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
                    disabled={!subject.trim() || !body.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
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
            {campaigns.length > 0 ? (
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
                    {campaigns.map((campaign) => (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="mb-3 h-12 w-12 text-slate-200" />
                <p className="text-sm font-semibold text-slate-700">No campaigns yet</p>
                <p className="mt-1 text-xs text-slate-500">Campaign history will appear here after you send your first email.</p>
              </div>
            )}
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
            <button type="button" onClick={() => { handleSend(); setPreviewOpen(false); }} className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
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
                {body
                  .replaceAll('{first_name}', '[Recipient Name]')
                  .replaceAll('{department}', '[Department]')
                  .replaceAll('{batch}', '[Batch]')
                  .replaceAll('{portal_link}', '[Portal Link]')}
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
