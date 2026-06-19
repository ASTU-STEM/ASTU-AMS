import React, { useCallback, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Edit3,
  Eye,
  GalleryHorizontal,
  Plus,
  QrCode,
  Search,
  TicketCheck,
  Trash2,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';

type EventStatus = 'Open' | 'Approval Required' | 'Closed';
type EventKind = 'Event' | 'Workshop';

interface EventItem {
  id: string;
  title: string;
  kind: EventKind;
  category: string;
  date: string;
  rsvps: number;
  attendance: number;
  status: EventStatus;
  location: string;
}

const initialEvents: EventItem[] = [
  { id: 'E-001', title: 'ASTU Alumni Career Summit', kind: 'Event', category: 'Career', date: '2026-06-12', rsvps: 420, attendance: 0, status: 'Open', location: 'Main Auditorium' },
  { id: 'E-002', title: 'Cloud Computing Bootcamp', kind: 'Workshop', category: 'Technical Training', date: '2026-06-18', rsvps: 96, attendance: 0, status: 'Approval Required', location: 'CS Lab 101' },
  { id: 'E-003', title: 'Employer Roundtable', kind: 'Event', category: 'Partnership', date: '2026-06-26', rsvps: 78, attendance: 0, status: 'Open', location: 'Conference Hall A' },
  { id: 'E-004', title: 'CV and Interview Lab', kind: 'Workshop', category: 'Employability', date: '2026-05-20', rsvps: 160, attendance: 138, status: 'Closed', location: 'Career Center' },
  { id: 'E-005', title: 'AI/ML Research Symposium', kind: 'Event', category: 'Research', date: '2026-07-05', rsvps: 234, attendance: 0, status: 'Open', location: 'Engineering Complex' },
  { id: 'E-006', title: 'Grant Writing Workshop', kind: 'Workshop', category: 'Research', date: '2026-06-28', rsvps: 45, attendance: 0, status: 'Approval Required', location: 'Room 305' },
  { id: 'E-007', title: 'Graduation Ceremony 2026', kind: 'Event', category: 'Graduation', date: '2026-07-15', rsvps: 1200, attendance: 0, status: 'Open', location: 'Main Hall' },
  { id: 'E-008', title: 'Python Data Science Workshop', kind: 'Workshop', category: 'Technical Training', date: '2026-05-10', rsvps: 88, attendance: 82, status: 'Closed', location: 'CS Lab 102' },
];

const categories = ['Career', 'Technical Training', 'Partnership', 'Employability', 'Research', 'Graduation'];

const statusClasses: Record<EventStatus, string> = {
  Open: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  'Approval Required': 'border-[#E8A020]/20 bg-[#E8A020]/10 text-[#B87900]',
  Closed: 'border-slate-200 bg-slate-100 text-slate-600',
};

export default function EventWorkshopManagement() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [selectedKind, setSelectedKind] = useState<EventKind>('Event');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]);
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const filteredEvents = useMemo(() => {
    let items = events;
    if (selectedCategory !== 'All') {
      items = items.filter(e => e.category === selectedCategory);
    }
    if (search.trim()) {
      items = items.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    return items;
  }, [events, selectedCategory, search]);

  const stats = useMemo(() => ({
    openRsvps: events.filter(e => e.status === 'Open').reduce((s, e) => s + e.rsvps, 0),
    pendingApprovals: events.filter(e => e.status === 'Approval Required').length,
    totalCheckins: events.reduce((s, e) => s + e.attendance, 0),
    totalEvents: events.length,
  }), [events]);

  const createEvent = useCallback(() => {
    if (!formTitle.trim()) { toast.error('Title is required'); return; }
    if (!formDate) { toast.error('Date is required'); return; }
    const newEvent: EventItem = {
      id: `E-${String(events.length + 1).padStart(3, '0')}`,
      title: formTitle.trim(),
      kind: selectedKind,
      category: formCategory,
      date: formDate,
      rsvps: 0,
      attendance: 0,
      status: 'Open',
      location: formLocation.trim() || 'TBD',
    };
    setEvents(prev => [newEvent, ...prev]);
    setFormTitle('');
    setFormDate('');
    setFormLocation('');
    setFormDescription('');
    setShowCreate(false);
    toast.success(`${selectedKind} "${newEvent.title}" created`);
  }, [formTitle, formDate, formLocation, formCategory, selectedKind, events.length]);

  const approveEvent = useCallback((id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'Open' } : e));
    const item = events.find(e => e.id === id);
    toast.success(`"${item?.title}" approved and opened for registration`);
  }, [events]);

  const closeEvent = useCallback((id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'Closed' } : e));
    const item = events.find(e => e.id === id);
    toast.success(`"${item?.title}" closed`);
  }, [events]);

  const deleteEvent = useCallback((id: string) => {
    const item = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    toast.success(`"${item?.title}" deleted`);
  }, [events]);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fade-up 0.35s ease-out both; }
        .fade-up:nth-child(2) { animation-delay: 0.05s; }
        .fade-up:nth-child(3) { animation-delay: 0.1s; }
        .fade-up:nth-child(4) { animation-delay: 0.15s; }
      `}</style>

      <AdminPageHeader
        title="Event & Workshop Management"
        subtitle="Create events and workshops, manage RSVPs, approvals, attendance, QR check-in, and calendar placement."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Events & Workshops' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="success">Registration Active</AdminBadge>
            <button onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm">
              <Plus className="h-3.5 w-3.5" /> New {selectedKind}
            </button>
          </div>
        }
      />

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Open RSVPs', value: stats.openRsvps.toLocaleString(), icon: Users, tone: 'text-[#003580]', bg: 'bg-[#003580]/10' },
          { label: 'Pending Approvals', value: stats.pendingApprovals, icon: ClipboardCheck, tone: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10' },
          { label: 'QR Check-ins', value: stats.totalCheckins, icon: QrCode, tone: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10' },
          { label: 'Total Events', value: stats.totalEvents, icon: BarChart3, tone: 'text-violet-600', bg: 'bg-violet-500/10' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="fade-up rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] ${metric.bg} ${metric.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
            </div>
          );
        })}
      </section>

      {/* Create Form */}
      {showCreate && (
        <div className="fade-up rounded-[12px] border border-blue-200 bg-blue-50/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Create New {selectedKind}</h2>
            <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/50"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex gap-2">
              {(['Event', 'Workshop'] as EventKind[]).map(kind => (
                <button key={kind} type="button" onClick={() => setSelectedKind(kind)}
                  className={`flex-1 rounded-[8px] border px-3 py-2 text-sm font-semibold transition-all ${selectedKind === kind ? 'border-[#003580] bg-[#003580] text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {kind}
                </button>
              ))}
            </div>
            <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder={`${selectedKind} title`}
              className="rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
            <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
              className="rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
              className="rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
            <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Location / Venue"
              className="rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
            <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} placeholder="Description, eligibility, speaker details"
              className="sm:col-span-2 xl:col-span-2 rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] resize-none" />
            <button onClick={createEvent}
              className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Create {selectedKind}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setSelectedCategory('All')}
            className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all ${selectedCategory === 'All' ? 'bg-[#003580] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all ${selectedCategory === cat ? 'bg-[#003580] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="w-full rounded-[8px] border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10" />
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Event Calendar & Registration Approval</h2>
            <p className="mt-1 text-xs text-slate-500">Monitor calendar items, RSVP volume, attendance, and approval status.</p>
          </div>
          <button onClick={() => toast.success('Opening calendar view')}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all">
            <CalendarDays className="h-4 w-4" /> Calendar View
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {filteredEvents.map((event, idx) => {
            const fillPercent = event.attendance > 0 && event.rsvps > 0
              ? Math.round((event.attendance / event.rsvps) * 100) : 0;
            return (
              <div key={event.id} className="fade-up flex flex-col gap-2 rounded-[10px] border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-slate-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${idx * 0.03}s` }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase ${event.kind === 'Event' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {event.kind}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">{event.title}</h3>
                    <span className="text-xs text-slate-400">{event.location}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {event.date}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.rsvps} RSVPs</span>
                    {event.attendance > 0 && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <TicketCheck className="w-3 h-3" /> {event.attendance} checked in ({fillPercent}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusClasses[event.status]}`}>
                    {event.status === 'Open' && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                    {event.status === 'Approval Required' && <ClipboardCheck className="h-3 w-3 mr-1 inline" />}
                    {event.status === 'Closed' && <XCircle className="h-3 w-3 mr-1 inline" />}
                    {event.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toast.success(`Previewing "${event.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 transition-all" title="Preview">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast.success(`Editing "${event.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Edit">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {event.status === 'Approval Required' && (
                      <button onClick={() => approveEvent(event.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all" title="Approve">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {event.status === 'Open' && (
                      <button onClick={() => closeEvent(event.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all" title="Close">
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => toast.success(`QR check-in for "${event.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 transition-all" title="QR Check-in">
                      <QrCode className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast.success(`Attendance tracking for "${event.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 transition-all" title="Track Attendance">
                      <TicketCheck className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteEvent(event.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-100 bg-rose-50 text-rose-400 hover:bg-rose-100 transition-all" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <div className="py-8 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No {selectedCategory !== 'All' ? selectedCategory.toLowerCase() : ''} events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
