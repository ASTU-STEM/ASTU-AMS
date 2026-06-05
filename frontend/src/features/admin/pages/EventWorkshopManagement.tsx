import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GalleryHorizontal,
  Plus,
  QrCode,
  TicketCheck,
  Users,
  XCircle,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';

type EventStatus = 'Open' | 'Approval Required' | 'Closed';
type EventKind = 'Event' | 'Workshop';

const eventRows: Array<{ title: string; kind: EventKind; category: string; date: string; rsvps: number; attendance: number; status: EventStatus }> = [
  { title: 'ASTU Alumni Career Summit', kind: 'Event', category: 'Career', date: '2026-06-12', rsvps: 420, attendance: 0, status: 'Open' },
  { title: 'Cloud Computing Bootcamp', kind: 'Workshop', category: 'Technical Training', date: '2026-06-18', rsvps: 96, attendance: 0, status: 'Approval Required' },
  { title: 'Employer Roundtable', kind: 'Event', category: 'Partnership', date: '2026-06-26', rsvps: 78, attendance: 0, status: 'Open' },
  { title: 'CV and Interview Lab', kind: 'Workshop', category: 'Employability', date: '2026-05-20', rsvps: 160, attendance: 138, status: 'Closed' },
];

const categories = ['Career', 'Technical Training', 'Partnership', 'Employability', 'Research', 'Graduation'];

const statusClasses: Record<EventStatus, string> = {
  Open: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  'Approval Required': 'border-[#E8A020]/20 bg-[#E8A020]/10 text-[#B87900]',
  Closed: 'border-slate-200 bg-slate-100 text-slate-600',
};

export default function EventWorkshopManagement() {
  const [selectedKind, setSelectedKind] = useState<EventKind>('Event');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const filteredEvents = useMemo(
    () => eventRows.filter((event) => event.kind === selectedKind || event.category === selectedCategory),
    [selectedKind, selectedCategory]
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Event & Workshop Management"
        subtitle="Create events and workshops, manage RSVPs, approvals, attendance, QR check-in, reports, categories, calendar placement, and gallery integration."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Events & Workshops' }]}
        actions={<AdminBadge variant="success">Registration Active</AdminBadge>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Open RSVPs', value: '594', icon: Users, tone: 'text-[#003580]', bg: 'bg-[#003580]/10' },
          { label: 'Pending Approvals', value: '42', icon: ClipboardCheck, tone: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10' },
          { label: 'QR Check-ins', value: '138', icon: QrCode, tone: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10' },
          { label: 'Event Reports', value: '11', icon: BarChart3, tone: 'text-violet-600', bg: 'bg-violet-500/10' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] ${metric.bg} ${metric.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-semibold text-slate-900">Create Events & Workshops</h2>
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(['Event', 'Workshop'] as EventKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setSelectedKind(kind)}
                  className={`rounded-[8px] border px-3 py-2 text-sm font-semibold ${selectedKind === kind ? 'border-[#003580] bg-[#003580] text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                  {kind}
                </button>
              ))}
            </div>
            <input className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder={`${selectedKind} title`} />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <input type="date" className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
            <textarea className="min-h-28 w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="Description, eligibility, venue, speaker details" />
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-3 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              Create {selectedKind}
            </button>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Event Calendar & Registration Approval</h2>
              <p className="mt-1 text-xs text-slate-500">Monitor calendar items, RSVP volume, attendance status, and gallery connections.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              <CalendarDays className="h-4 w-4" />
              Calendar View
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">RSVP</th>
                  <th className="px-4 py-3 font-semibold">Attendance</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((event) => (
                  <tr key={event.title} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{event.title}</div>
                      <div className="text-xs text-slate-500">{event.kind}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{event.category}</td>
                    <td className="px-4 py-3 text-slate-600">{event.date}</td>
                    <td className="px-4 py-3 text-slate-600">{event.rsvps}</td>
                    <td className="px-4 py-3 text-slate-600">{event.attendance}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClasses[event.status]}`}>{event.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-emerald-100 bg-emerald-50 text-emerald-600" aria-label="Approve registration">
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600" aria-label="QR check-in">
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600" aria-label="Track attendance">
                          <TicketCheck className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600" aria-label="Gallery integration">
                          <GalleryHorizontal className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-rose-100 bg-rose-50 text-rose-600" aria-label="Reject registration">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
