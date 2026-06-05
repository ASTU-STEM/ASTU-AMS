import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileText,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Pin,
  Send,
  ShieldCheck,
  Star,
  Trash2,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';

type ContentStatus = 'Published' | 'Scheduled' | 'Pinned' | 'Draft' | 'Needs Review';
type Audience = 'Public' | 'Internal' | 'Emergency' | 'Department' | 'Alumni' | 'Employer';

const announcementRows: Array<{ title: string; audience: Audience; status: ContentStatus; attachment: string; owner: string }> = [
  { title: '2026 Tracer Study Wave Opens', audience: 'Alumni', status: 'Pinned', attachment: 'PDF', owner: 'Alumni Office' },
  { title: 'Campus Career Fair Safety Notice', audience: 'Emergency', status: 'Published', attachment: 'None', owner: 'Security Center' },
  { title: 'Employer Partnership Roundtable', audience: 'Employer', status: 'Scheduled', attachment: 'PDF', owner: 'Industry Liaison' },
  { title: 'Department KPI Review Week', audience: 'Department', status: 'Draft', attachment: 'None', owner: 'Academic Affairs' },
];

const communityRows = [
  { title: 'Graduate startup hiring interns', author: 'Helina Sileshi', reports: 0, action: 'Feature post' },
  { title: 'Unverified certificate link shared', author: 'Community Member', reports: 4, action: 'Review report' },
  { title: 'Research collaboration request', author: 'Mechanical Alumni Chapter', reports: 0, action: 'Pin post' },
  { title: 'Duplicate job advertisement', author: 'Employer Partner', reports: 2, action: 'Moderate comments' },
];

const statusClasses: Record<ContentStatus, string> = {
  Published: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  Scheduled: 'border-[#003580]/20 bg-[#003580]/10 text-[#003580]',
  Pinned: 'border-violet-200 bg-violet-100 text-violet-700',
  Draft: 'border-slate-200 bg-slate-100 text-slate-600',
  'Needs Review': 'border-[#E8A020]/20 bg-[#E8A020]/10 text-[#B87900]',
};

const audienceClasses: Record<Audience, string> = {
  Public: 'bg-slate-100 text-slate-700',
  Internal: 'bg-indigo-100 text-indigo-700',
  Emergency: 'bg-rose-100 text-rose-700',
  Department: 'bg-cyan-100 text-cyan-700',
  Alumni: 'bg-emerald-100 text-emerald-700',
  Employer: 'bg-amber-100 text-amber-700',
};

export default function ContentGovernance() {
  const [audience, setAudience] = useState<Audience>('Public');
  const [headline, setHeadline] = useState('Institutional announcement headline');
  const filteredAnnouncements = useMemo(
    () => announcementRows.filter((row) => audience === 'Public' || row.audience === audience || row.audience === 'Emergency'),
    [audience]
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="News, Announcements & Community"
        subtitle="Govern public news, internal notices, emergency alerts, scheduled publishing, pinned announcements, PDF attachments, feed approvals, reports, and comment moderation."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Content Governance' }]}
        actions={<AdminBadge variant="info">Editorial Controls</AdminBadge>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Scheduled Publishing', value: '12', icon: CalendarClock, color: 'text-[#003580] bg-[#003580]/10' },
          { label: 'Pinned Notices', value: '6', icon: Pin, color: 'text-violet-700 bg-violet-100' },
          { label: 'Reported Items', value: '9', icon: MessageSquareWarning, color: 'text-[#E24B4A] bg-[#E24B4A]/10' },
          { label: 'Approved Posts', value: '184', icon: ShieldCheck, color: 'text-[#1D9E75] bg-[#1D9E75]/10' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] ${metric.color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#003580]" />
            <h2 className="text-sm font-semibold text-slate-900">Rich Text Announcement Editor</h2>
          </div>
          <div className="mt-4 space-y-3">
            <select value={audience} onChange={(event) => setAudience(event.target.value as Audience)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]">
              {(['Public', 'Internal', 'Emergency', 'Department', 'Alumni', 'Employer'] as Audience[]).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <input value={headline} onChange={(event) => setHeadline(event.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
            <textarea className="min-h-36 w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" defaultValue="Compose formatted announcement body with links, headings, and accreditation-ready publication metadata." />
            <label className="flex cursor-pointer items-center justify-between rounded-[8px] border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4" /> Attach PDF notice</span>
              <input type="file" accept="application/pdf" className="sr-only" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                <CalendarClock className="h-4 w-4" /> Schedule
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-3 py-2 text-sm font-semibold text-white">
                <Send className="h-4 w-4" /> Publish
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-slate-900">Announcement Management</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Audience</th>
                    <th className="px-4 py-3 font-semibold">Attachment</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAnnouncements.map((row) => (
                    <tr key={row.title} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{row.title}</div>
                        <div className="text-xs text-slate-500">{row.owner}</div>
                      </td>
                      <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${audienceClasses[row.audience]}`}>{row.audience}</span></td>
                      <td className="px-4 py-3 text-slate-600">{row.attachment}</td>
                      <td className="px-4 py-3"><span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClasses[row.status]}`}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-slate-900">Community Feed Moderation</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {communityRows.map((row) => (
                <div key={row.title} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{row.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{row.author}</p>
                    </div>
                    {row.reports > 0 ? <AlertTriangle className="h-5 w-5 text-[#E24B4A]" /> : <CheckCircle2 className="h-5 w-5 text-[#1D9E75]" />}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="inline-flex items-center gap-1 rounded-[8px] border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600"><Star className="h-3.5 w-3.5" /> {row.action}</button>
                    <button className="inline-flex items-center gap-1 rounded-[8px] border border-rose-100 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                    <button className="inline-flex items-center gap-1 rounded-[8px] border border-[#003580]/15 bg-[#003580]/5 px-2.5 py-1.5 text-xs font-semibold text-[#003580]"><Megaphone className="h-3.5 w-3.5" /> Analytics</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
