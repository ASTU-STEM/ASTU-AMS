import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import ImageUploader from '../components/ImageUploader';
import homepageCmsService from '../services/homepageCms.service';
import eventsService from '../services/events.service';

type EventStatus = 'Open' | 'Approval Required' | 'Closed';
type EventKind = 'Event' | 'Workshop';

interface Attendee {
  name: string;
  email: string;
  checkedIn: boolean;
}

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
  image?: string;
  description?: string;
  attendeesList?: Attendee[];
}

const EVENTS_STORAGE_KEY = 'astu_ams_cms_events_items';

const DEFAULT_EVENT_IMAGES: Record<string, string> = {
  'ASTU Alumni Career Summit': '/images/astu-building.jpg',
  'Cloud Computing Bootcamp': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
  'Employer Roundtable': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
  'CV and Interview Lab': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80',
  'AI/ML Research Symposium': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80',
  'Grant Writing Workshop': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
};

const initialEvents: EventItem[] = [
  {
    id: 'E-001',
    title: 'ASTU Alumni Career Summit',
    kind: 'Event',
    category: 'Career',
    date: '2026-06-12',
    rsvps: 420,
    attendance: 120,
    status: 'Open',
    location: 'Main Auditorium',
    image: '/images/astu-building.jpg',
    description: 'Annual gathering of ASTU graduates, corporate recruiters, and keynote speakers.',
    attendeesList: [
      { name: 'Dr. Abebe Yosef', email: 'abebe@astu.edu.et', checkedIn: true },
      { name: 'Helina Sileshi', email: 'helina@alumni.astu.edu.et', checkedIn: true },
      { name: 'Bekele Kebede', email: 'bekele@alumni.astu.edu.et', checkedIn: false },
      { name: 'Ruth Alemu', email: 'ruth@astu.edu.et', checkedIn: false },
    ],
  },
  {
    id: 'E-002',
    title: 'Cloud Computing Bootcamp',
    kind: 'Workshop',
    category: 'Technical Training',
    date: '2026-06-18',
    rsvps: 96,
    attendance: 40,
    status: 'Approval Required',
    location: 'CS Lab 101',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
    description: 'Hands-on training on AWS, Azure, and cloud infrastructure for ASTU engineering seniors.',
    attendeesList: [
      { name: 'Yonas Bekele', email: 'yonas@alumni.astu.edu.et', checkedIn: true },
      { name: 'Kalkidan Tadesse', email: 'kalkidan@alumni.astu.edu.et', checkedIn: false },
    ],
  },
  {
    id: 'E-003',
    title: 'Employer Roundtable',
    kind: 'Event',
    category: 'Partnership',
    date: '2026-06-26',
    rsvps: 78,
    attendance: 0,
    status: 'Open',
    location: 'Conference Hall A',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
    description: 'Executive panel discussing graduate tracer study trends and skill alignment.',
  },
  {
    id: 'E-004',
    title: 'CV and Interview Lab',
    kind: 'Workshop',
    category: 'Employability',
    date: '2026-05-20',
    rsvps: 160,
    attendance: 138,
    status: 'Closed',
    location: 'Career Center',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80',
    description: 'Interactive resume critique and mock interviews conducted by industry HR leads.',
  },
  {
    id: 'E-005',
    title: 'AI/ML Research Symposium',
    kind: 'Event',
    category: 'Research',
    date: '2026-07-05',
    rsvps: 234,
    attendance: 0,
    status: 'Open',
    location: 'Engineering Complex',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80',
    description: 'Presentation of faculty and alumni research projects in machine learning.',
  },
  {
    id: 'E-006',
    title: 'Grant Writing Workshop',
    kind: 'Workshop',
    category: 'Research',
    date: '2026-06-28',
    rsvps: 45,
    attendance: 0,
    status: 'Approval Required',
    location: 'Room 305',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
    description: 'Masterclass on submitting competitive international research grant proposals.',
  },
];

const categories = ['Career', 'Technical Training', 'Partnership', 'Employability', 'Research', 'Graduation'];

const statusClasses: Record<EventStatus, string> = {
  Open: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  'Approval Required': 'border-[#E8A020]/20 bg-[#E8A020]/10 text-[#B87900]',
  Closed: 'border-slate-200 bg-slate-100 text-slate-600',
};

export default function EventWorkshopManagement() {
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialEvents;
  });

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
  const [formImage, setFormImage] = useState('');

  // Modals state
  const [previewEvent, setPreviewEvent] = useState<EventItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    kind: EventKind;
    category: string;
    date: string;
    location: string;
    status: EventStatus;
    image: string;
    description: string;
  }>({
    title: '',
    kind: 'Event',
    category: categories[0],
    date: '',
    location: '',
    status: 'Open',
    image: '',
    description: '',
  });

  const [qrModalEvent, setQrModalEvent] = useState<EventItem | null>(null);
  const [attendanceModalEvent, setAttendanceModalEvent] = useState<EventItem | null>(null);
  const [showCalendarView, setShowCalendarView] = useState(false);

  // Auto-save & sync with CMS settings and landing page
  useEffect(() => {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

    const approvedEvents = events
      .filter((e) => e.kind === 'Event' && e.status === 'Open')
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        image: e.image || '/images/astu-building.jpg',
        active: true,
      }));

    const approvedWorkshops = events
      .filter((e) => e.kind === 'Workshop' && e.status === 'Open')
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        seats: `${e.rsvps} Seats Registered`,
        active: true,
      }));

    const cmsSettings = homepageCmsService.getSettings();
    if (cmsSettings) {
      homepageCmsService.saveSettings({
        ...cmsSettings,
        events: approvedEvents.length ? approvedEvents : cmsSettings.events,
        workshops: approvedWorkshops.length ? approvedWorkshops : cmsSettings.workshops,
      });
    }

    window.dispatchEvent(new Event('astu-cms-events-changed'));
    window.dispatchEvent(new Event('astu-cms-homepage-updated'));
  }, [events]);

  // Sync with API database on mount
  useEffect(() => {
    let isMounted = true;
    eventsService
      .getAllEvents()
      .then((apiEvents) => {
        if (!isMounted || !apiEvents.length) return;
        const formatted: EventItem[] = apiEvents.map((e) => ({
          id: e.id,
          title: e.title,
          kind: (e.type === 'Workshop' || e.type === 'WORKSHOP' ? 'Workshop' : 'Event') as EventKind,
          category: e.type === 'Workshop' || e.type === 'WORKSHOP' ? 'Technical Training' : 'Career',
          date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toISOString().split('T')[0],
          rsvps: Array.isArray(e.rsvps) ? e.rsvps.length : 0,
          attendance: Array.isArray(e.rsvps) ? e.rsvps.filter((r: any) => r.status === 'CHECKED_IN' || r.status === 'GOING').length : 0,
          status: 'Open' as EventStatus,
          location: e.location || 'ASTU Campus',
          image: DEFAULT_EVENT_IMAGES[e.title] || '/images/astu-building.jpg',
          description: e.description,
        }));
        setEvents(formatted);
      })
      .catch((err) => console.warn('Failed to load API events:', err));

    return () => {
      isMounted = false;
    };
  }, []);

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

  const createEvent = useCallback(async () => {
    if (!formTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formDate) {
      toast.error('Date is required');
      return;
    }

    try {
      const created = await eventsService.createEvent({
        title: formTitle.trim(),
        description: formDescription.trim() || `${selectedKind}: ${formTitle.trim()}`,
        date: new Date(formDate).toISOString(),
        location: formLocation.trim() || 'ASTU Campus',
        type: selectedKind,
      });

      const newEvent: EventItem = {
        id: created?.id || `E-${String(events.length + 1).padStart(3, '0')}`,
        title: formTitle.trim(),
        kind: selectedKind,
        category: formCategory,
        date: formDate,
        rsvps: 1,
        attendance: 0,
        status: 'Open',
        location: formLocation.trim() || 'ASTU Campus',
        image: formImage || (selectedKind === 'Workshop' ? '/images/electriclabs.jpeg' : '/images/astu-building.jpg'),
        description: formDescription.trim(),
      };
      setEvents((prev) => [newEvent, ...prev]);
      setFormTitle('');
      setFormDate('');
      setFormLocation('');
      setFormDescription('');
      setFormImage('');
      setShowCreate(false);
      toast.success(`${selectedKind} "${newEvent.title}" published & saved to DB!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create event in API');
    }
  }, [formTitle, formDate, formLocation, formDescription, formCategory, formImage, selectedKind, events.length]);

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      kind: event.kind,
      category: event.category,
      date: event.date,
      location: event.location,
      status: event.status,
      image: event.image || '',
      description: event.description || '',
    });
  };

  const saveEditModal = async () => {
    if (!editingEvent) return;
    if (!editForm.title.trim()) {
      toast.error('Title is required');
      return;
    }
    const updated = {
      title: editForm.title.trim(),
      kind: editForm.kind,
      category: editForm.category,
      date: editForm.date,
      location: editForm.location,
      status: editForm.status,
      image: editForm.image || editingEvent.image,
      description: editForm.description,
    };
    if (editingEvent.id && !editingEvent.id.startsWith('E-')) {
      eventsService.updateEvent(editingEvent.id, {
        title: updated.title,
        description: updated.description,
        date: new Date(updated.date).toISOString(),
        location: updated.location,
        type: updated.kind,
      }).catch(err => console.warn('API event update error:', err));
    }
    setEvents((prev) =>
      prev.map((e) =>
        e.id === editingEvent.id ? { ...e, ...updated } : e
      )
    );
    toast.success(`Updated "${editForm.title.trim()}"`);
    setEditingEvent(null);
  };

  const simulateQrCheckin = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const newAtt = e.attendance + 1;
          const newRsvp = Math.max(e.rsvps, newAtt);
          return { ...e, attendance: newAtt, rsvps: newRsvp };
        }
        return e;
      })
    );
    toast.success('QR Code Scanned! Attendee checked in (+1 attendance)');
  };

  const toggleAttendeeCheckin = (eventId: string, attendeeName: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const list = e.attendeesList || [
            { name: 'Dr. Abebe Yosef', email: 'abebe@astu.edu.et', checkedIn: false },
            { name: 'Helina Sileshi', email: 'helina@alumni.astu.edu.et', checkedIn: false },
          ];
          const updatedList = list.map((a) => (a.name === attendeeName ? { ...a, checkedIn: !a.checkedIn } : a));
          const checkedCount = updatedList.filter((a) => a.checkedIn).length;
          return { ...e, attendeesList: updatedList, attendance: Math.max(e.attendance, checkedCount) };
        }
        return e;
      })
    );
    toast.success(`Toggled check-in for ${attendeeName}`);
  };

  const approveEvent = useCallback((id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'Open' } : e)));
    const item = events.find((e) => e.id === id);
    toast.success(`"${item?.title}" approved and opened for registration`);
  }, [events]);

  const closeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'Closed' } : e)));
    const item = events.find((e) => e.id === id);
    toast.success(`"${item?.title}" closed`);
  }, [events]);

  const deleteEvent = useCallback(async (id: string) => {
    const item = events.find((e) => e.id === id);
    if (window.confirm(`Delete "${item?.title || id}"? This action cannot be undone.`)) {
      if (id && !id.startsWith('E-')) {
        await eventsService.deleteEvent(id).catch(err => console.warn('API event delete error:', err));
      }
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success(`"${item?.title}" deleted`);
    }
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
          { label: 'Open RSVPs', value: stats.openRsvps.toLocaleString(), icon: Users, tone: 'text-[#003580] dark:text-sky-400', bg: 'bg-[#003580]/10 dark:bg-sky-950/40' },
          { label: 'Pending Approvals', value: stats.pendingApprovals, icon: ClipboardCheck, tone: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10 dark:bg-amber-950/40' },
          { label: 'QR Check-ins', value: stats.totalCheckins, icon: QrCode, tone: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10 dark:bg-emerald-950/40' },
          { label: 'Total Events', value: stats.totalEvents, icon: BarChart3, tone: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10 dark:bg-violet-950/40' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="fade-up rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] ${metric.bg} ${metric.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            </div>
          );
        })}
      </section>

      {/* Create Form */}
      {showCreate && (
        <div className="fade-up rounded-[12px] border border-blue-200 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Create New {selectedKind}</h2>
            <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex gap-2">
              {(['Event', 'Workshop'] as EventKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setSelectedKind(kind)}
                  className={`flex-1 rounded-[8px] border px-3 py-2 text-sm font-semibold transition-all ${
                    selectedKind === kind ? 'border-[#003580] bg-[#003580] text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {kind}
                </button>
              ))}
            </div>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={`${selectedKind} title`}
              className="rounded-[8px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#003580]"
            />
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="rounded-[8px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#003580]"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="rounded-[8px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#003580]"
            />
            <input
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="Location / Venue"
              className="rounded-[8px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#003580]"
            />
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              placeholder="Description, eligibility, speaker details"
              className="sm:col-span-2 xl:col-span-3 rounded-[8px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#003580] resize-none"
            />
          </div>

          <div>
            <ImageUploader
              label={`Upload ${selectedKind} Poster / Banner Image`}
              value={formImage}
              onChange={setFormImage}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={createEvent}
              className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" /> Publish {selectedKind}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all cursor-pointer ${
              selectedCategory === 'All' ? 'bg-[#003580] text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all cursor-pointer ${
                selectedCategory === cat ? 'bg-[#003580] text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#003580] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#003580]/10"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Event Calendar & Registration Approval</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Monitor calendar items, RSVP volume, attendance, and approval status.</p>
          </div>
          <button
            onClick={() => setShowCalendarView(true)}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <CalendarDays className="h-4 w-4 text-[#003580] dark:text-[#FFCC00]" /> Calendar View
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {filteredEvents.map((event, idx) => {
            const fillPercent = event.attendance > 0 && event.rsvps > 0 ? Math.round((event.attendance / event.rsvps) * 100) : 0;
            return (
              <div
                key={event.id}
                className="fade-up flex flex-col gap-2 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 transition-all hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                      <img
                        src={event.image || DEFAULT_EVENT_IMAGES[event.title] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80'}
                        alt={event.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80';
                        }}
                      />
                    </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                          event.kind === 'Event' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {event.kind}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{event.title}</h3>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{event.location}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {event.rsvps} RSVPs
                      </span>
                      {event.attendance > 0 && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <TicketCheck className="w-3 h-3" /> {event.attendance} checked in ({fillPercent}%)
                        </span>
                      )}
                    </div>
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
                    <button
                      onClick={() => setPreviewEvent(event)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-[#003580]/10 hover:text-[#003580] dark:hover:text-sky-300 transition-all cursor-pointer"
                      title="Preview Event"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(event)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
                      title="Edit Event"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {event.status === 'Approval Required' && (
                      <button
                        onClick={() => approveEvent(event.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer"
                        title="Approve"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {event.status === 'Open' && (
                      <button
                        onClick={() => closeEvent(event.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer"
                        title="Close"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setQrModalEvent(event)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer"
                      title="QR Check-in Scanner"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setAttendanceModalEvent(event)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
                      title="Attendance Roster"
                    >
                      <TicketCheck className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer"
                      title="Delete"
                    >
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

      {/* Preview Event Lightbox Modal */}
      {previewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setPreviewEvent(null)}>
          <div className="relative max-w-2xl w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewEvent(null)} className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <X className="h-5 w-5" />
            </button>
            <div className="h-56 w-full rounded-xl overflow-hidden bg-slate-900">
              <img src={previewEvent.image || '/images/astu-building.jpg'} alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#003580] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">{previewEvent.kind}</span>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">{previewEvent.category}</span>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusClasses[previewEvent.status]}`}>{previewEvent.status}</span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{previewEvent.title}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{previewEvent.description || 'No description provided.'}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div>
                <p className="text-[10px] text-slate-400 font-normal uppercase">Date</p>
                <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{previewEvent.date}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-normal uppercase">Venue</p>
                <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{previewEvent.location}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-normal uppercase">RSVPs / Attendance</p>
                <p className="mt-0.5 font-bold text-[#003580] dark:text-blue-400">{previewEvent.rsvps} RSVPs ({previewEvent.attendance} checked in)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setEditingEvent(null)}>
          <div className="relative max-w-lg w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Event / Workshop</h2>
              <button onClick={() => setEditingEvent(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Title</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Kind</label>
                  <select
                    value={editForm.kind}
                    onChange={(e) => setEditForm((p) => ({ ...p, kind: e.target.value as EventKind }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500"
                  >
                    <option value="Event">Event</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as EventStatus }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Approval Required">Approval Required</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Location</label>
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500 resize-none"
                />
              </div>

              <ImageUploader label="Update Poster Image" value={editForm.image} onChange={(image) => setEditForm((p) => ({ ...p, image }))} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setEditingEvent(null)} className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={saveEditModal} className="rounded-lg bg-[#003580] hover:bg-[#002d6b] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Check-in Modal */}
      {qrModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setQrModalEvent(null)}>
          <div className="relative max-w-sm w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setQrModalEvent(null)} className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
            <QrCode className="mx-auto h-12 w-12 text-[#003580] dark:text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">QR Check-in Scanner</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{qrModalEvent.title}</p>
            </div>
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-[#003580]/30 dark:border-blue-500/30 bg-slate-50 dark:bg-slate-800/50 p-4">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-28 w-28 bg-[#003580] dark:bg-blue-600 rounded-lg p-2 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-white break-all">ASTU-QR-{qrModalEvent.id}</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Scan to Verify RSVP</p>
              </div>
            </div>
            <button
              onClick={() => simulateQrCheckin(qrModalEvent.id)}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-md"
            >
              Scan & Simulate Attendee Check-in (+1)
            </button>
          </div>
        </div>
      )}

      {/* Attendance Roster Modal */}
      {attendanceModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setAttendanceModalEvent(null)}>
          <div className="relative max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Attendance Roster</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{attendanceModalEvent.title}</p>
              </div>
              <button onClick={() => setAttendanceModalEvent(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-3 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Total Capacity & RSVPs</span>
                <span className="text-[#003580] dark:text-blue-400">{attendanceModalEvent.attendance} / {attendanceModalEvent.rsvps} Checked In</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-[#1D9E75] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((attendanceModalEvent.attendance / Math.max(1, attendanceModalEvent.rsvps)) * 100))}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(attendanceModalEvent.attendeesList || [
                { name: 'Dr. Abebe Yosef', email: 'abebe@astu.edu.et', checkedIn: true },
                { name: 'Helina Sileshi', email: 'helina@alumni.astu.edu.et', checkedIn: true },
                { name: 'Bekele Kebede', email: 'bekele@alumni.astu.edu.et', checkedIn: false },
                { name: 'Ruth Alemu', email: 'ruth@astu.edu.et', checkedIn: false },
              ]).map((att) => (
                <div key={att.email} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-2.5 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{att.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{att.email}</p>
                  </div>
                  <button
                    onClick={() => toggleAttendeeCheckin(attendanceModalEvent.id, att.name)}
                    className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
                      att.checkedIn ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {att.checkedIn ? '✓ Checked In' : 'Mark Present'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Calendar View Modal */}
      {showCalendarView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowCalendarView(false)}>
          <div className="relative max-w-3xl w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#003580] dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Monthly Event & Workshop Calendar</h2>
              </div>
              <button onClick={() => setShowCalendarView(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs min-h-[260px]">
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                const dayStr = `2026-06-${String(dayNum).padStart(2, '0')}`;
                const matched = events.filter((e) => e.date === dayStr);
                return (
                  <div key={dayNum} className="rounded-lg border border-slate-100 dark:border-slate-800 p-1.5 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all">
                    <span className="font-semibold text-slate-400 dark:text-slate-500 text-[10px]">{dayNum}</span>
                    {matched.map((m) => (
                      <span
                        key={m.id}
                        className={`mt-1 block rounded px-1 py-0.5 text-[8px] font-bold truncate ${
                          m.kind === 'Event' ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                        }`}
                        title={m.title}
                      >
                        {m.title}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
