import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  MapPin,
  Pin,
  PinOff,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
  ArrowLeft,
  Building2,
  Users,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  ShieldCheck,
  Check,
  Tag,
  Layers,
  Image as ImageIcon,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import ImageUploader from '../components/ImageUploader';
import homepageCmsService from '../services/homepageCms.service';
import eventsService from '../services/events.service';

type EventStatus = 'Open' | 'Closed' | 'Approval Required' | 'Draft';
type EventKind = 'Event' | 'Workshop';

interface EventItem {
  id: string;
  title: string;
  kind: EventKind;
  category: string;
  date: string;
  time?: string;
  rsvps: number;
  attendance?: number;
  status: EventStatus;
  location: string;
  image?: string;
  description?: string;
  organizer?: string;
  capacity?: number;
  registrationInfo?: string;
  highlights?: string;
  pinned?: boolean;
  active?: boolean;
}

const EVENTS_STORAGE_KEY = 'astu_ams_cms_events_items';
const FALLBACK_IMAGE = '/images/astu-building.jpg';

const initialEvents: EventItem[] = [
  {
    id: 'WS-001',
    title: 'Data Science & Machine Learning Bootcamp',
    kind: 'Workshop',
    category: 'Technical Training & Labs',
    date: '2026-11-20',
    time: '09:00 AM – 04:00 PM (EAT)',
    rsvps: 120,
    attendance: 120,
    status: 'Open',
    location: 'Engineering Building Room 305',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    description: 'Intensive bootcamp covering machine learning, data visualization, and statistical analysis using Python and R. Practical assignments with ASTU computing clusters.',
    organizer: 'ASTU Alumni Office',
    capacity: 185,
    registrationInfo: 'Free registration for all verified ASTU alumni, students, and partners.',
    highlights: 'Python & R Data Science Stack\nMachine Learning Modeling\nHands-on Practical Lab Sessions\nCertificate of Completion',
    pinned: true,
    active: true,
  },
  {
    id: 'E-REAL-001',
    title: 'EthiopiaLics International Conference 2025',
    kind: 'Event',
    category: 'Academic & Research Conference',
    date: '2025-06-13',
    time: '08:30 AM – 05:00 PM (EAT)',
    rsvps: 340,
    attendance: 300,
    status: 'Open',
    location: 'ASTU Main Campus Auditorium',
    image: 'https://www.astu.edu.et/images/slidephoto/summit1.jpg',
    description: 'Adama Science and Technology University hosts the 1st EthiopiaLics International Conference on “Fostering Innovation Ecosystem for Knowledge Economy Transition and Sustainable Development.”',
    organizer: 'ASTU Alumni Office',
    capacity: 500,
    registrationInfo: 'Free registration for all verified ASTU alumni, students, and partners.',
    highlights: 'Official Keynote Sessions\nAlumni Networking Lounge\nResearch Poster Presentations\nCertificate of Participation',
    pinned: true,
    active: true,
  },
  {
    id: 'E-002',
    title: 'ASTU Alumni Career & Innovation Summit',
    kind: 'Event',
    category: 'Career & Job Fair',
    date: '2026-12-05',
    time: '09:00 AM – 02:00 PM (EAT)',
    rsvps: 210,
    attendance: 210,
    status: 'Open',
    location: 'Senate Hall, ASTU Main Campus',
    image: '/images/astu-building.jpg',
    description: 'Annual career acceleration gathering connecting final-year students with high-achieving alumni executives and industry partners. Meet 30+ top enterprise recruiters.',
    organizer: 'Career Development & Placement Center',
    capacity: 300,
    registrationInfo: 'Free registration for all verified ASTU alumni, students, and partners.',
    highlights: 'Keynote Speeches by Industry CEOs\nCareer Speed Networking\nTracer Study Insights & Hiring Trends\nOne-on-One Mentorship Booths',
    pinned: false,
    active: true,
  },
  {
    id: 'WS-002',
    title: 'Enterprise Cloud Architecture & DevOps Lab',
    kind: 'Workshop',
    category: 'Technical Training & Labs',
    date: '2026-11-28',
    time: '01:30 PM – 05:30 PM (EAT)',
    rsvps: 95,
    attendance: 95,
    status: 'Open',
    location: 'ICT Directorate Computer Lab 2',
    image: '/images/electriclabs.jpeg',
    description: 'Hands-on deployment training covering AWS, Docker containers, Kubernetes clusters, and continuous delivery pipelines for enterprise software architectures.',
    organizer: 'ICT & Systems Directorate',
    capacity: 120,
    registrationInfo: 'Free registration for all verified ASTU alumni, students, and partners.',
    highlights: 'Docker & Kubernetes Labs\nAWS Cloud Architecture\nCI/CD Pipeline Setup\nCertificate of Completion',
    pinned: false,
    active: true,
  },
];

/* ── PRESET SUGGESTIONS (Can also be typed freely) ── */
const categoryPresets = [
  'Career & Job Fair',
  'Technical Training & Labs',
  'Artificial Intelligence & Data',
  'Engineering & Applied Tech',
  'Alumni Reunion & Networking',
  'Academic & Research Conference',
  'Industry Partnership & Placement',
  'Entrepreneurship & Startups',
  'Leadership & Mentorship',
  'Graduation & Ceremonies',
];

const venuePresets = [
  'ASTU Main Campus Auditorium',
  'Engineering Building Room 305',
  'ICT Directorate Computer Lab 2',
  'Research Complex Room 101',
  'Senate Hall, ASTU Main Campus',
  'Innovation Labs Hall A',
  'Graduation & Events Hall',
  'Virtual Event (Google Meet)',
  'Virtual Event (Zoom Webinar)',
];

const organizerPresets = [
  'ASTU Alumni Office',
  'Career Development & Placement Center',
  'Industry Linkage & Technology Transfer Directorate',
  'ICT & Systems Directorate',
  'Office of the Dean of Students',
  'School of Electrical Engineering & Computing',
  'School of Applied Natural Sciences',
  'School of Mechanical, Chemical & Materials Engineering',
  'School of Civil Engineering & Architecture',
];

const statusPresets: EventStatus[] = ['Open', 'Approval Required', 'Closed', 'Draft'];

const normalize = (event: any): EventItem => ({
  ...event,
  image: event?.image || FALLBACK_IMAGE,
  pinned: Boolean(event?.pinned),
  active: event?.active !== false,
});

/* ── CREATABLE COMBOBOX COMPONENT (Select OR Type Custom) ── */
interface CreatableComboboxProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  presets: string[];
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function CreatableCombobox({
  label,
  required,
  value,
  onChange,
  placeholder,
  presets,
  helperText,
  icon: Icon,
}: CreatableComboboxProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-rose-500 font-black">* (Required)</span>}
        </label>
        <span className="text-[10px] text-slate-400 font-medium">Select preset or type custom</span>
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580] transition-all pr-9 ${
              Icon ? 'pl-9' : 'pl-3.5'
            }`}
          />
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Presets Dropdown"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
                Suggested Presets (Click to choose)
              </div>
              {presets.map((preset) => {
                const isSelected = value === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      onChange(preset);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#003580] font-bold dark:bg-sky-500/10 dark:text-sky-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{preset}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#003580] dark:text-sky-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Quick Select Chips */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {presets.slice(0, 4).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all cursor-pointer border ${
              value === preset
                ? 'border-[#003580] bg-[#003580] text-white shadow-2xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {helperText && <p className="text-[10px] text-slate-400">{helperText}</p>}
    </div>
  );
}

export default function EventWorkshopManagement() {
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalize);
      }
    } catch {
      /* ignore */
    }
    return initialEvents;
  });

  const [content, setContent] = useState<any>(() => {
    const s = (homepageCmsService.getSettings() || {}) as any;
    return {
      eventsHeaders: s.eventsHeaders || {
        eyebrow: 'Calendar',
        title: 'Upcoming Events & Workshops',
        description: 'Join campus career expos, technical workshops, and alumni reunions.',
      },
      eventsPage: s.eventsPage || {
        title: 'Events & Workshops',
        subtitle: 'Connect with alumni chapters, participate in technical masterclasses, and expand your professional network.',
        heroImage: '/images/arc.jpg',
      },
    };
  });

  const [filter, setFilter] = useState<'All' | 'Event' | 'Workshop' | 'Pinned' | 'Open'>('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPageSettings, setShowPageSettings] = useState(false);

  const [form, setForm] = useState<Omit<EventItem, 'id'>>({
    title: '',
    kind: 'Event',
    category: categoryPresets[0],
    date: '',
    time: '09:00 AM – 12:30 PM (EAT)',
    rsvps: 0,
    status: 'Open',
    location: venuePresets[0],
    image: '',
    description: '',
    organizer: organizerPresets[0],
    capacity: 100,
    registrationInfo: 'Free registration for all verified ASTU alumni, students, and partners.',
    highlights: 'Certificate of Participation\nInteractive Q&A Session\nPractical Hands-on Demonstrations\nNetworking & Light Refreshments',
    pinned: false,
    active: true,
  });

  useEffect(() => {
    eventsService.getAllEvents().then((apiEvents) => {
      if (apiEvents && apiEvents.length > 0) {
        setEvents((prev) => {
          const merged = [...prev];
          apiEvents.forEach((ae) => {
            if (!merged.some((m) => m.id === ae.id)) {
              merged.push({
                id: ae.id,
                title: ae.title,
                kind: (ae.type as EventKind) || 'Event',
                category: ae.type || 'General',
                date: ae.date.includes('T') ? ae.date.split('T')[0] : ae.date,
                time: '09:00 AM – 12:30 PM (EAT)',
                rsvps: ae.rsvps?.length || 0,
                attendance: ae.rsvps?.length || 0,
                status: 'Open',
                location: ae.location || 'ASTU Main Campus',
                image: FALLBACK_IMAGE,
                description: ae.description || '',
                organizer: 'ASTU Alumni Office',
                capacity: 100,
                pinned: false,
                active: true,
              });
            }
          });
          return merged;
        });
      }
    });
  }, []);

  const saveContent = useCallback((nextEvents: EventItem[], nextContent: any) => {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(nextEvents));
    const normalizedEvents = nextEvents.map(normalize);
    homepageCmsService.saveSettings({
      events: normalizedEvents
        .filter((e) => e.kind === 'Event' && e.status === 'Open')
        .map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          location: e.location,
          image: e.image || FALLBACK_IMAGE,
          description: e.description,
          organizer: e.organizer,
          capacity: e.capacity,
          rsvps: e.rsvps,
          registrationInfo: e.registrationInfo,
          highlights: e.highlights,
          pinned: e.pinned,
          active: true,
        })),
      workshops: normalizedEvents
        .filter((e) => e.kind === 'Workshop' && e.status === 'Open')
        .map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          seats: `${e.rsvps || 0} Seats Registered`,
          focus: e.category || 'Professional Development',
          location: e.location,
          image: e.image || FALLBACK_IMAGE,
          description: e.description,
          organizer: e.organizer,
          capacity: e.capacity,
          rsvps: e.rsvps,
          registrationInfo: e.registrationInfo,
          highlights: e.highlights,
          pinned: e.pinned,
          active: true,
        })),
      eventsHeaders: nextContent.eventsHeaders,
      eventsPage: nextContent.eventsPage,
    } as any);
    window.dispatchEvent(new Event('astu-cms-events-changed'));
    window.dispatchEvent(new Event('astu-cms-homepage-updated'));
  }, []);

  useEffect(() => {
    saveContent(events, content);
  }, [events, content, saveContent]);

  const filtered = useMemo(() => {
    let items = [...events].sort((a, b) => {
      const pinned = Number(!!b.pinned) - Number(!!a.pinned);
      if (pinned !== 0) return pinned;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    if (filter !== 'All') {
      if (filter === 'Pinned') items = items.filter((e) => e.pinned);
      else if (filter === 'Open') items = items.filter((e) => e.status === 'Open');
      else items = items.filter((e) => e.kind === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [events, filter, search]);

  const resetForm = (kind: EventKind = 'Event') => {
    setEditingId(null);
    setForm({
      title: '',
      kind,
      category: categoryPresets[0],
      date: '',
      time: '09:00 AM – 12:30 PM (EAT)',
      rsvps: 0,
      status: 'Open',
      location: venuePresets[0],
      image: '',
      description: '',
      organizer: organizerPresets[0],
      capacity: 100,
      registrationInfo: 'Free registration for all verified ASTU alumni, students, and partners.',
      highlights: 'Certificate of Participation\nInteractive Q&A Session\nPractical Hands-on Demonstrations\nNetworking & Light Refreshments',
      pinned: false,
      active: true,
    });
    setShowCreate(false);
  };

  const submit = async () => {
    if (!form.title.trim()) return toast.error('Event / Workshop title is required');
    if (!form.date) return toast.error('Date is required');
    if (!form.location.trim()) return toast.error('Location / Venue is required');
    if (!Number(form.capacity) || Number(form.capacity) <= 0) {
      return toast.error('Capacity seats must be greater than 0');
    }

    const payload: EventItem = {
      id: editingId || `E-${Date.now()}`,
      ...form,
      title: form.title.trim(),
      location: form.location.trim() || 'ASTU Main Campus',
      image: form.image || FALLBACK_IMAGE,
      rsvps: Number(form.rsvps) || 0,
      attendance: Number(form.rsvps) || 0,
    };

    if (editingId) {
      await eventsService
        .updateEvent(editingId, {
          title: payload.title,
          description: payload.description,
          date: new Date(payload.date).toISOString(),
          location: payload.location,
          type: payload.kind,
        })
        .catch(() => null);
      setEvents((prev) => prev.map((e) => (e.id === editingId ? payload : e)));
      toast.success(`Updated “${payload.title}” successfully!`);
    } else {
      await eventsService
        .createEvent({
          title: payload.title,
          description: payload.description,
          date: new Date(payload.date).toISOString(),
          location: payload.location,
          type: payload.kind,
        })
        .catch(() => null);
      setEvents((prev) => [payload, ...prev]);
      toast.success(`Published “${payload.title}” successfully!`);
    }
    resetForm();
  };

  const togglePin = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e)));
    toast.success('Pin status updated');
  };

  const deleteEvent = (id: string) => {
    if (confirm('Are you sure you want to delete this event post?')) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      eventsService.deleteEvent(id).catch(() => null);
      toast.success('Post removed');
    }
  };

  const editEvent = (event: EventItem) => {
    setEditingId(event.id);
    setShowCreate(true);
    setForm({
      title: event.title,
      kind: event.kind,
      category: event.category || categoryPresets[0],
      date: event.date ? (event.date.includes('T') ? event.date.split('T')[0] : event.date) : '',
      time: event.time || '09:00 AM – 12:30 PM (EAT)',
      rsvps: event.rsvps || 0,
      status: event.status || 'Open',
      location: event.location || venuePresets[0],
      image: event.image || '',
      description: event.description || '',
      organizer: event.organizer || organizerPresets[0],
      capacity: event.capacity || 100,
      registrationInfo: event.registrationInfo || '',
      highlights: event.highlights || '',
      pinned: Boolean(event.pinned),
      active: event.active !== false,
    });
  };

  const isFormReady = Boolean(form.title.trim() && form.date && form.location.trim() && form.capacity);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Events & Workshops CMS"
        subtitle="Publish, pin, edit, and delete events/workshops. Homepage shows pinned + latest 3 posts; /events shows all posts."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Events & Workshops' }]}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={() => {
                resetForm('Event');
                setShowCreate(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-sm cursor-pointer transition-all hover:scale-102"
            >
              <Plus className="h-4 w-4" /> New Event
            </button>
            <button
              onClick={() => {
                resetForm('Workshop');
                setShowCreate(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1D9E75] px-4 py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-sm cursor-pointer transition-all hover:scale-102"
            >
              <Plus className="h-4 w-4" /> New Workshop
            </button>
            <button
              onClick={() => setShowPageSettings((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>Page Headers</span>
            </button>
            <button
              onClick={() => window.open('/events', '_blank')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#003580]" />
              <span>Public /events</span>
            </button>
          </div>
        }
      />

      {/* Quick Statistics Banner */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Posts', value: events.length },
          { label: 'Pinned on Homepage', value: events.filter((e) => e.pinned).length },
          { label: 'Open for Registration', value: events.filter((e) => e.status === 'Open').length },
          { label: 'Workshops & Labs', value: events.filter((e) => e.kind === 'Workshop').length },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Optional Collapsible Page Headers Settings */}
      {showPageSettings && (
        <div className="grid gap-6 sm:grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#003580] dark:text-sky-400">
              Homepage Events Section Headers
            </h3>
            <input
              value={content.eventsHeaders.eyebrow || ''}
              onChange={(e) =>
                setContent((p: any) => ({
                  ...p,
                  eventsHeaders: { ...p.eventsHeaders, eyebrow: e.target.value },
                }))
              }
              placeholder="Eyebrow (e.g. Calendar)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              value={content.eventsHeaders.title || ''}
              onChange={(e) =>
                setContent((p: any) => ({
                  ...p,
                  eventsHeaders: { ...p.eventsHeaders, title: e.target.value },
                }))
              }
              placeholder="Title (e.g. Upcoming Events & Workshops)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <textarea
              value={content.eventsHeaders.description || ''}
              onChange={(e) =>
                setContent((p: any) => ({
                  ...p,
                  eventsHeaders: { ...p.eventsHeaders, description: e.target.value },
                }))
              }
              placeholder="Description"
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#003580] dark:text-sky-400">
              Public /events Page Hero Headers
            </h3>
            <input
              value={content.eventsPage.title || ''}
              onChange={(e) =>
                setContent((p: any) => ({
                  ...p,
                  eventsPage: { ...p.eventsPage, title: e.target.value },
                }))
              }
              placeholder="Page title (e.g. Events & Workshops)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <textarea
              value={content.eventsPage.subtitle || ''}
              onChange={(e) =>
                setContent((p: any) => ({
                  ...p,
                  eventsPage: { ...p.eventsPage, subtitle: e.target.value },
                }))
              }
              placeholder="Page subtitle"
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
            />
            <button
              type="button"
              onClick={() => {
                saveContent(events, content);
                toast.success('Headers configuration saved!');
                setShowPageSettings(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Headers</span>
            </button>
          </div>
        </div>
      )}

      {/* Manage Posts Table Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Events & Workshops</h2>
            <p className="text-xs text-slate-500">Manage all registered campus exhibitions, academic conferences, and technical workshops.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Filter Pills */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs dark:border-slate-700 dark:bg-slate-800">
              {(['All', 'Event', 'Workshop', 'Pinned', 'Open'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer ${
                    filter === f ? 'bg-[#003580] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts by title, location, track..."
                className="w-full sm:w-64 rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
              />
            </div>
          </div>
        </div>

        {/* Posts Cards Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <article
              key={event.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white dark:bg-slate-800 dark:border-slate-700 p-4 shadow-2xs hover:shadow-md transition-all group"
            >
              <div>
                <div className="relative h-36 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700 mb-3">
                  <img
                    src={event.image || FALLBACK_IMAGE}
                    alt={event.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase text-white ${
                      event.kind === 'Workshop' ? 'bg-[#1D9E75]' : 'bg-[#003580]'
                    }`}>
                      {event.kind}
                    </span>
                    <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                      {event.category}
                    </span>
                  </div>

                  {event.pinned && (
                    <div className="absolute top-2 right-2 rounded-full bg-amber-400 text-slate-950 p-1 shadow-xs">
                      <Pin className="h-3 w-3 fill-current" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-[#003580]" />
                      {event.date}
                    </span>
                    <span className={`font-bold ${event.status === 'Open' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {event.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 pt-1 group-hover:text-[#003580] transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 line-clamp-1">
                    <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                    <span>{event.location}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {event.rsvps} / {event.capacity || 100} RSVPs
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => togglePin(event.id)}
                    className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      event.pinned
                        ? 'text-amber-500 hover:bg-amber-50'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                    title={event.pinned ? 'Unpin from homepage' : 'Pin to homepage'}
                  >
                    {event.pinned ? <Pin className="h-3.5 w-3.5 fill-current" /> : <PinOff className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => editEvent(event)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#003580] hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    title="Edit event details"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteEvent(event.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Delete event"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400">
            No events or workshops found matching your query.
          </div>
        )}
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
         DEDICATED MODAL PAGE FOR ADDING / EDITING EVENTS & WORKSHOPS
      ────────────────────────────────────────────────────────────────────────── */}
      <AdminModal
        open={showCreate}
        onClose={() => resetForm()}
        size="xl"
        title={editingId ? `Edit Post: ${form.title || 'Untitled'}` : `Create New ${form.kind}`}
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className={`px-2 py-0.5 rounded font-bold text-white text-[10px] ${
                form.kind === 'Workshop' ? 'bg-[#1D9E75]' : 'bg-[#003580]'
              }`}>
                {form.kind}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{form.status}</span>
              <span>•</span>
              <span>{form.capacity} total capacity</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => resetForm()}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submit}
                disabled={!isFormReady}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] hover:bg-[#002255] text-white px-5 py-2 text-xs font-black shadow-md hover:scale-102 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span>{editingId ? 'Save Changes' : `Publish ${form.kind}`}</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Top Kind Switcher & Helper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Choose Publishing Format</p>
              <p className="text-[11px] text-slate-500">
                Select whether this post is a general campus event or a hands-on technical workshop.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, kind: 'Event' }))}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  form.kind === 'Event'
                    ? 'bg-[#003580] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Event Post</span>
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, kind: 'Workshop' }))}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  form.kind === 'Workshop'
                    ? 'bg-[#1D9E75] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Workshop Post</span>
              </button>
            </div>
          </div>

          {/* Form and Preview Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Main Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Card 1: Title & Classification */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <Tag className="h-4 w-4 text-[#003580] dark:text-sky-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    1. Basic Information & Track
                  </h3>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {form.kind} Title <span className="text-rose-500 font-black">* (Required)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder={form.kind === 'Workshop' ? 'e.g. Modern Full-Stack Cloud Architecture Bootcamp 2026' : 'e.g. Annual ASTU Alumni Career & Technology Expo 2026'}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <CreatableCombobox
                    label="Category / Track"
                    required
                    value={form.category}
                    onChange={(category) => setForm((p) => ({ ...p, category }))}
                    placeholder="Select preset or type custom..."
                    presets={categoryPresets}
                    icon={Tag}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Status <span className="text-rose-500 font-black">* (Required)</span>
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as EventStatus }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 cursor-pointer"
                    >
                      {statusPresets.map((st) => (
                        <option key={st} value={st}>
                          {st === 'Open' ? ' Open (Registration Active)' : st === 'Approval Required' ? ' Approval Required' : st === 'Closed' ? ' Closed' : ' Draft'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Date, Time & Location */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <CalendarDays className="h-4 w-4 text-[#003580] dark:text-sky-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    2. Schedule, Venue & Organizer
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Event Date <span className="text-rose-500 font-black">* (Required)</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Time / Hours <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Clock className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={form.time || ''}
                        onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                        placeholder="e.g. 09:00 AM – 12:30 PM (EAT)"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                      />
                    </div>
                  </div>
                </div>

                <CreatableCombobox
                  label="Location & Venue"
                  required
                  value={form.location}
                  onChange={(location) => setForm((p) => ({ ...p, location }))}
                  placeholder="e.g. Engineering Building Room 305 or Google Meet URL..."
                  presets={venuePresets}
                  icon={MapPin}
                />

                <CreatableCombobox
                  label="Host / Organizing Office"
                  required
                  value={form.organizer || ''}
                  onChange={(organizer) => setForm((p) => ({ ...p, organizer }))}
                  placeholder="e.g. ASTU Alumni Office or Career Center..."
                  presets={organizerPresets}
                  icon={Building2}
                />
              </div>

              {/* Card 3: Capacity & Attendance */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <Users className="h-4 w-4 text-[#003580] dark:text-sky-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    3. Capacity & Attendance Policy
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Total Seat Capacity <span className="text-rose-500 font-black">* (Required)</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.capacity || 100}
                      onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
                      placeholder="e.g. 150"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Current Registered Count <span className="text-slate-400 font-normal">(RSVPs)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.rsvps}
                      onChange={(e) => setForm((p) => ({ ...p, rsvps: Number(e.target.value) }))}
                      placeholder="e.g. 0"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Registration & Attendance Policy Note
                  </label>
                  <input
                    type="text"
                    value={form.registrationInfo || ''}
                    onChange={(e) => setForm((p) => ({ ...p, registrationInfo: e.target.value }))}
                    placeholder="e.g. Free registration for all verified ASTU alumni, students, and partners."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                  />
                </div>
              </div>

              {/* Card 4: Description & Agenda */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <Sparkles className="h-4 w-4 text-[#003580] dark:text-sky-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    4. Full Description & Agenda Highlights
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Detailed Description & Syllabus <span className="text-rose-500 font-black">* (Required)</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Write a comprehensive description covering objectives, speakers, curriculum, prerequisites, and learning outcomes..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Key Highlights / Takeaways <span className="text-slate-400 font-normal">(One per line)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.highlights}
                    onChange={(e) => setForm((p) => ({ ...p, highlights: e.target.value }))}
                    placeholder="Certificate of Participation&#10;Hands-on Practical Labs&#10;Keynote Talks by Industry Leaders&#10;Networking Lunch"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 resize-none"
                  />
                </div>
              </div>

              {/* Card 5: Media & Visibility */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <ImageIcon className="h-4 w-4 text-[#003580] dark:text-sky-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    5. Cover Media & Placement
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Cover Banner Image URL</label>
                  <input
                    type="text"
                    value={form.image || ''}
                    onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                    placeholder="https://... or /images/campus-2.jpeg"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                  />
                </div>

                <ImageUploader
                  label="Or upload cover photo directly"
                  value={form.image || ''}
                  onChange={(image) => setForm((p) => ({ ...p, image }))}
                />

                <div className="pt-1">
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={Boolean(form.pinned)}
                      onChange={(e) => setForm((p) => ({ ...p, pinned: e.target.checked }))}
                      className="h-4 w-4 rounded text-[#003580] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span>Pin on Homepage Top Highlights Banner</span>
                      <span className="text-[10px] font-normal text-slate-500">Pinned posts appear prominently on the main portal carousel.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Live Preview Sidebar (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-xs sticky top-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-[#003580] dark:text-sky-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Live Public Preview</span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Real-time
                  </span>
                </div>

                {/* Mock Card */}
                <article className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                  <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={form.image || FALLBACK_IMAGE}
                      alt={form.title || 'Preview'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-xs ${
                        form.kind === 'Workshop' ? 'bg-[#1D9E75]' : 'bg-[#003580]'
                      }`}>
                        {form.kind}
                      </span>
                      <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white">
                        {form.category || 'General'}
                      </span>
                    </div>

                    {form.pinned && (
                      <div className="absolute top-2 right-2 rounded-full bg-amber-400 text-slate-950 p-1 shadow-xs">
                        <Pin className="h-3 w-3 fill-current" />
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 rounded bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {form.status}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {form.title || 'Event or Workshop Title Preview'}
                    </h4>

                    <div className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3 text-[#003580] dark:text-sky-400 shrink-0" />
                        <span>{form.date || 'Scheduled Date'} {form.time && `• ${form.time}`}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                        <span className="line-clamp-1">{form.location || 'ASTU Campus Venue'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{form.organizer || 'ASTU Alumni Office'}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {form.description || 'Description summary and syllabus will render here for all visitors...'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#003580] dark:text-sky-400">
                        {form.capacity} Total Seats
                      </span>
                      <span className="rounded bg-blue-50 dark:bg-sky-500/10 px-2 py-0.5 font-bold text-[#003580] dark:text-sky-400">
                        Register Now
                      </span>
                    </div>
                  </div>
                </article>

                {/* Validation Status */}
                <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-100 dark:border-slate-700 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Publishing Readiness Checklist
                  </p>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Title provided</span>
                      {form.title.trim() ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Date selected</span>
                      {form.date ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Location defined</span>
                      {form.location.trim() ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Capacity &gt; 0</span>
                      {Number(form.capacity) > 0 ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
