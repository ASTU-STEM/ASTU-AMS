import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Check,
  Tag,
  Layers,
  Image as ImageIcon,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Download,
  CheckSquare,
  Square,
  UserPlus,
  FileSpreadsheet,
  GraduationCap,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import ImageUploader from '../components/ImageUploader';
import homepageCmsService from '../services/homepageCms.service';
import eventsService from '../services/events.service';
import registrationService, { AlumniRegistration } from '../services/registration.service';

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

  const navigate = useNavigate();

  // View mode: Grid vs List (Table Form)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('astu_events_view_mode') as 'grid' | 'list') || 'grid';
  });
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('astu_events_view_mode', mode);
  };

  // High-Volume Event Pagination (Handles 1,000+ events & workshops smoothly)
  const [eventPage, setEventPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(12);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  useEffect(() => {
    setEventPage(1);
    setSelectedEventIds([]);
  }, [filter, search, eventsPerPage]);

  const totalEventPages = Math.ceil(filtered.length / eventsPerPage) || 1;
  const paginatedEvents = useMemo(() => {
    const s = (eventPage - 1) * eventsPerPage;
    return filtered.slice(s, s + eventsPerPage);
  }, [filtered, eventPage, eventsPerPage]);

  // Bulk actions for high volume handling
  const toggleSelectAll = () => {
    if (selectedEventIds.length === paginatedEvents.length && paginatedEvents.length > 0) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(paginatedEvents.map((e) => e.id));
    }
  };

  const toggleSelectEvent = (id: string) => {
    setSelectedEventIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkStatus = (status: EventStatus) => {
    if (selectedEventIds.length === 0) return;
    setEvents((prev) => prev.map((e) => (selectedEventIds.includes(e.id) ? { ...e, status } : e)));
    toast.success(`Updated status to "${status}" for ${selectedEventIds.length} event(s)`);
    setSelectedEventIds([]);
  };

  const handleBulkPin = (pin: boolean) => {
    if (selectedEventIds.length === 0) return;
    setEvents((prev) => prev.map((e) => (selectedEventIds.includes(e.id) ? { ...e, pinned: pin } : e)));
    toast.success(`${pin ? 'Pinned' : 'Unpinned'} ${selectedEventIds.length} event(s)`);
    setSelectedEventIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedEventIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedEventIds.length} selected event(s)?`)) {
      setEvents((prev) => prev.filter((e) => !selectedEventIds.includes(e.id)));
      selectedEventIds.forEach((id) => eventsService.deleteEvent(id).catch(() => null));
      toast.success(`Removed ${selectedEventIds.length} event(s)`);
      setSelectedEventIds([]);
    }
  };

  const exportEventsToCsv = (eventsToExport: EventItem[] = filtered) => {
    const headers = ['ID', 'Title', 'Type', 'Category', 'Date', 'Time', 'Location', 'Capacity', 'RSVPs', 'Status', 'Pinned'];
    const rows = eventsToExport.map((e) => [
      `"${e.id}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${e.kind}"`,
      `"${e.category || ''}"`,
      `"${e.date}"`,
      `"${e.time || ''}"`,
      `"${(e.location || '').replace(/"/g, '""')}"`,
      e.capacity || 100,
      e.rsvps || 0,
      `"${e.status}"`,
      e.pinned ? 'Yes' : 'No',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `astu-events-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${eventsToExport.length} event(s) to CSV!`);
  };

  // ── DEDICATED SPECIFIC EVENT ATTENDEES ROSTER MODAL ──
  const [attendeeModalEvent, setAttendeeModalEvent] = useState<EventItem | null>(null);
  const [eventRegistrations, setEventRegistrations] = useState<AlumniRegistration[]>([]);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState<string>('All');
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false);
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [newAttendeePhone, setNewAttendeePhone] = useState('');
  const [newAttendeeDept, setNewAttendeeDept] = useState('School of Applied Natural Science & Tech');
  const [newAttendeeBatch, setNewAttendeeBatch] = useState('Class of 2024');
  const [newAttendeeEmployer, setNewAttendeeEmployer] = useState('');

  const loadEventRegistrations = useCallback((event: EventItem) => {
    const all = registrationService.getRegistrations();
    let matches = all.filter(
      (r) =>
        r.contentId === event.id ||
        (r.contentTitle && event.title && r.contentTitle.toLowerCase().includes(event.title.toLowerCase())) ||
        (event.title && r.contentTitle && event.title.toLowerCase().includes(r.contentTitle.toLowerCase()))
    );

    if (matches.length === 0) {
      const seeded: AlumniRegistration[] = [
        {
          id: `REG-${event.id}-01`,
          contentId: event.id,
          contentTitle: event.title,
          fullName: 'Tewodros Kassahun Bekele',
          studentId: 'UGR/18920/14',
          email: 'tewodros.kassahun@astu.edu.et',
          phone: '+251 91 234 5678',
          classYear: 'Class of 2024',
          department: 'Software Engineering',
          currentEmployer: 'Safaricom Ethiopia',
          jobTitle: 'Junior DevOps Engineer',
          employmentStatus: 'Employed Full-time',
          registeredAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Confirmed',
          accreditationVerified: true,
          cgpa: '3.88',
          gender: 'Male',
        },
        {
          id: `REG-${event.id}-02`,
          contentId: event.id,
          contentTitle: event.title,
          fullName: 'Bethlehem Demisse Tadesse',
          studentId: 'UGR/17451/13',
          email: 'bethlehem.demisse@gmail.com',
          phone: '+251 92 111 2233',
          classYear: 'Class of 2023',
          department: 'Computer Science',
          currentEmployer: 'Commercial Bank of Ethiopia',
          jobTitle: 'Database Specialist',
          employmentStatus: 'Employed Full-time',
          registeredAt: new Date(Date.now() - 86400000 * 3).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Confirmed',
          accreditationVerified: true,
          cgpa: '3.92',
          gender: 'Female',
        },
        {
          id: `REG-${event.id}-03`,
          contentId: event.id,
          contentTitle: event.title,
          fullName: 'Amanuel Girma Kebede',
          studentId: 'UGR/19002/14',
          email: 'amanuel.girma@yahoo.com',
          phone: '+251 93 456 7890',
          classYear: 'Class of 2024',
          department: 'Electrical Engineering',
          currentEmployer: 'Ethio Telecom',
          jobTitle: 'Network Operations Engineer',
          employmentStatus: 'Employed Full-time',
          registeredAt: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Pending Approval',
          accreditationVerified: true,
          cgpa: '3.75',
          gender: 'Male',
        },
        {
          id: `REG-${event.id}-04`,
          contentId: event.id,
          contentTitle: event.title,
          fullName: 'Selamawit Hailemariam',
          studentId: 'UGR/16200/12',
          email: 'selamawit.haile@astu.edu.et',
          phone: '+251 94 888 9900',
          classYear: 'Class of 2022',
          department: 'Mechanical Engineering',
          currentEmployer: 'Ethiopian Airlines',
          jobTitle: 'Aviation Maintenance Systems',
          employmentStatus: 'Employed Full-time',
          registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Confirmed',
          accreditationVerified: true,
          cgpa: '3.81',
          gender: 'Female',
        },
      ];
      seeded.forEach((s) => registrationService.addRegistration(s));
      matches = seeded;
    }

    setEventRegistrations(matches);
  }, []);

  const openAttendeeModal = (event: EventItem) => {
    setAttendeeModalEvent(event);
    setAttendeeSearch('');
    setAttendeeStatusFilter('All');
    setSelectedAttendeeIds([]);
    loadEventRegistrations(event);
  };

  const handleUpdateAttendeeStatus = (regId: string, status: AlumniRegistration['status']) => {
    registrationService.updateRegistrationStatus(regId, status);
    setEventRegistrations((prev) => prev.map((r) => (r.id === regId ? { ...r, status } : r)));
    toast.success(`Attendee status updated to "${status}"`);
  };

  const handleToggleAttendeeEta = (regId: string) => {
    registrationService.toggleEtaVerified(regId);
    setEventRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, accreditationVerified: !r.accreditationVerified } : r))
    );
    toast.success('ETA Accreditation verification updated');
  };

  const handleDeleteAttendee = (regId: string) => {
    if (confirm('Remove this attendee from the registration roster?')) {
      registrationService.deleteRegistration(regId);
      setEventRegistrations((prev) => prev.filter((r) => r.id !== regId));
      toast.success('Attendee removed from roster');
    }
  };

  const handleAddManualAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeModalEvent) return;
    if (!newAttendeeName.trim() || !newAttendeeEmail.trim()) {
      toast.error('Attendee name and email are required');
      return;
    }

    const created = registrationService.addRegistration({
      contentId: attendeeModalEvent.id,
      contentTitle: attendeeModalEvent.title,
      fullName: newAttendeeName.trim(),
      studentId: `UGR/${Math.floor(10000 + Math.random() * 90000)}/24`,
      email: newAttendeeEmail.trim(),
      phone: newAttendeePhone.trim() || '+251 91 000 0000',
      classYear: newAttendeeBatch,
      department: newAttendeeDept,
      currentEmployer: newAttendeeEmployer.trim() || 'ASTU Alumnus',
      jobTitle: 'Participant',
      employmentStatus: 'Employed Full-time',
      status: 'Confirmed',
      accreditationVerified: true,
      notes: `Registered by Alumni Office officer for ${attendeeModalEvent.title}`,
    });

    setEventRegistrations((prev) => [created, ...prev]);
    setEvents((prev) =>
      prev.map((e) => (e.id === attendeeModalEvent.id ? { ...e, rsvps: (e.rsvps || 0) + 1 } : e))
    );
    setShowAddAttendeeModal(false);
    setNewAttendeeName('');
    setNewAttendeeEmail('');
    setNewAttendeePhone('');
    setNewAttendeeEmployer('');
    toast.success(`Registered ${created.fullName} for ${attendeeModalEvent.title}!`);
  };

  const handleExportAttendeeRoster = () => {
    if (!attendeeModalEvent) return;
    registrationService.exportToCsv(eventRegistrations);
  };

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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-wrap">
            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#003580] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#003580] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="List Form / Table View"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List Form</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs dark:border-slate-700 dark:bg-slate-800">
              {(['All', 'Event', 'Workshop', 'Pinned', 'Open'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-2.5 py-1.5 font-bold transition-colors cursor-pointer ${
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
                placeholder="Search posts..."
                className="w-full sm:w-52 rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
              />
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={() => exportEventsToCsv(filtered)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs"
              title="Export all filtered events to CSV"
            >
              <Download className="h-3.5 w-3.5 text-[#003580] dark:text-sky-400" />
              <span className="hidden md:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Bulk Action Bar when items are selected */}
        {selectedEventIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-[#003580] dark:text-sky-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{selectedEventIds.length} event(s) selected</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatus('Open')}
                className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
              >
                Mark Open
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus('Closed')}
                className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Mark Closed
              </button>
              <button
                type="button"
                onClick={() => handleBulkPin(true)}
                className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer"
              >
                Pin to Home
              </button>
              <button
                type="button"
                onClick={() => handleBulkPin(false)}
                className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Unpin
              </button>
              <button
                type="button"
                onClick={() => exportEventsToCsv(events.filter((e) => selectedEventIds.includes(e.id)))}
                className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Export Selected
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventIds([])}
                className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ── VIEW 1: GRID MODE ── */}
        {viewMode === 'grid' && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedEvents.map((event) => {
              const capacity = event.capacity || 100;
              const isOverCapacity = event.rsvps > capacity;
              const waitlist = isOverCapacity ? event.rsvps - capacity : 0;
              const isSelected = selectedEventIds.includes(event.id);

              return (
                <article
                  key={event.id}
                  className={`flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-800 p-4 shadow-2xs hover:shadow-md transition-all group ${
                    isSelected
                      ? 'border-[#003580] ring-2 ring-[#003580]/20 dark:border-sky-500'
                      : 'border-slate-200/90 dark:border-slate-700'
                  }`}
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
                      {/* Checkbox for selection */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectEvent(event.id);
                        }}
                        className="absolute top-2 left-2 z-10 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70 cursor-pointer"
                        title={isSelected ? 'Deselect event' : 'Select event'}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[#FFCC00]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>

                      <div className="absolute top-2 left-9 flex items-center gap-1.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase text-white ${
                            event.kind === 'Workshop' ? 'bg-[#1D9E75]' : 'bg-[#003580]'
                          }`}
                        >
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
                        <span
                          className={`font-bold ${event.status === 'Open' ? 'text-emerald-600' : 'text-slate-500'}`}
                        >
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
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openAttendeeModal(event)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 hover:bg-blue-50 dark:hover:bg-slate-600 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#003580] dark:hover:text-sky-400 cursor-pointer transition-all border border-slate-200 dark:border-slate-600 active:scale-95"
                        title="Click to view attendees registered for this specific event"
                      >
                        <Users className="h-3 w-3 text-[#003580] dark:text-sky-400" />
                        <span>{event.rsvps.toLocaleString()} / {capacity.toLocaleString()} RSVPs</span>
                      </button>
                      {waitlist > 0 && (
                        <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 text-[9px] font-bold">
                          +{waitlist.toLocaleString()} Waitlist
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openAttendeeModal(event)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold cursor-pointer transition-colors border border-emerald-200 dark:border-emerald-800"
                        title="View attendees registered for this specific event"
                      >
                        <Users className="h-3 w-3" />
                        <span>Attendees</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePin(event.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          event.pinned
                            ? 'text-amber-500 hover:bg-amber-50'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ── VIEW 2: LIST FORM (TABLE VIEW) ── */}
        {viewMode === 'list' && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th scope="col" className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedEventIds.length === paginatedEvents.length && paginatedEvents.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-[#003580] focus:ring-[#003580] cursor-pointer"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3">Event / Workshop Details</th>
                  <th scope="col" className="px-4 py-3">Date & Time</th>
                  <th scope="col" className="px-4 py-3">Location / Venue</th>
                  <th scope="col" className="px-4 py-3">RSVPs & Capacity</th>
                  <th scope="col" className="px-3 py-3 text-center">Status</th>
                  <th scope="col" className="px-3 py-3 text-center">Pin</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedEvents.map((event) => {
                  const capacity = event.capacity || 100;
                  const isOverCapacity = event.rsvps > capacity;
                  const waitlist = isOverCapacity ? event.rsvps - capacity : 0;
                  const progressPct = Math.min(100, Math.round((event.rsvps / capacity) * 100));
                  const isSelected = selectedEventIds.includes(event.id);

                  return (
                    <tr
                      key={event.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectEvent(event.id)}
                          className="rounded border-slate-300 text-[#003580] focus:ring-[#003580] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <img
                              src={event.image || FALLBACK_IMAGE}
                              alt={event.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase text-white ${
                                  event.kind === 'Workshop' ? 'bg-[#1D9E75]' : 'bg-[#003580]'
                                }`}
                              >
                                {event.kind}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                {event.category}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md pt-0.5">
                              {event.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-[#003580] dark:text-sky-400" />
                            {event.date}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                            <Clock className="h-2.5 w-2.5 text-slate-400" />
                            {event.time || 'All Day'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                          <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          onClick={() => openAttendeeModal(event)}
                          className="w-36 space-y-1 cursor-pointer group/rsvp"
                          title="Click to view attendees registered for this specific event"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold group-hover/rsvp:text-[#003580] dark:group-hover/rsvp:text-sky-400">
                            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Users className="h-3 w-3 text-[#003580] dark:text-sky-400" />
                              {event.rsvps.toLocaleString()} / {capacity.toLocaleString()}
                            </span>
                            {waitlist > 0 && (
                              <span className="text-amber-600 font-extrabold text-[9px]">
                                +{waitlist.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full transition-all rounded-full ${
                                isOverCapacity ? 'bg-amber-500' : progressPct > 80 ? 'bg-emerald-500' : 'bg-[#003580]'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            event.status === 'Open'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => togglePin(event.id)}
                          className={`p-1 rounded-lg cursor-pointer transition-colors ${
                            event.pinned
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-slate-300 hover:text-slate-600'
                          }`}
                          title={event.pinned ? 'Pinned to homepage' : 'Click to pin'}
                        >
                          <Pin className={`h-3.5 w-3.5 ${event.pinned ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openAttendeeModal(event)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                            title="View attendees registered for this specific event"
                          >
                            <Users className="h-3 w-3" />
                            <span>View Attendees</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => editEvent(event)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#003580] hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEvent(event.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400">
            No events or workshops found matching your query.
          </div>
        )}

        {/* ── HIGH-VOLUME PAGINATION TOOLBAR (Handles 1,000+ items) ── */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              Showing <strong>{filtered.length === 0 ? 0 : (eventPage - 1) * eventsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(eventPage * eventsPerPage, filtered.length)}</strong> of{' '}
              <strong>{filtered.length.toLocaleString()}</strong> events & workshops
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Per page:</span>
              <select
                value={eventsPerPage}
                onChange={(e) => {
                  setEventsPerPage(Number(e.target.value));
                  setEventPage(1);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value={10}>10</option>
                <option value={12}>12</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEventPage(1)}
              disabled={eventPage === 1}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-bold text-[10px]"
              title="First Page"
            >
              First
            </button>
            <button
              type="button"
              onClick={() => setEventPage((p) => Math.max(1, p - 1))}
              disabled={eventPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-white">
              Page {eventPage} of {totalEventPages}
            </span>
            <button
              type="button"
              onClick={() => setEventPage((p) => Math.min(totalEventPages, p + 1))}
              disabled={eventPage === totalEventPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEventPage(totalEventPages)}
              disabled={eventPage === totalEventPages}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-bold text-[10px]"
              title="Last Page"
            >
              Last
            </button>

            {/* Jump to page */}
            {totalEventPages > 3 && (
              <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                <input
                  type="number"
                  min={1}
                  max={totalEventPages}
                  placeholder="#"
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const p = parseInt(jumpPageInput, 10);
                      if (p >= 1 && p <= totalEventPages) {
                        setEventPage(p);
                        setJumpPageInput('');
                      }
                    }
                  }}
                  className="w-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-1 text-xs text-center outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const p = parseInt(jumpPageInput, 10);
                    if (p >= 1 && p <= totalEventPages) {
                      setEventPage(p);
                      setJumpPageInput('');
                    }
                  }}
                  className="px-2 py-1 rounded-lg bg-[#003580] text-white text-[10px] font-bold cursor-pointer"
                >
                  Go
                </button>
              </div>
            )}
          </div>
        </div>
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

      {/* ──────────────────────────────────────────────────────────────────────────
         DEDICATED MODAL: VIEW & MANAGE ATTENDEES FOR SPECIFIC EVENT / WORKSHOP
      ────────────────────────────────────────────────────────────────────────── */}
      {attendeeModalEvent && (
        <AdminModal
          open={Boolean(attendeeModalEvent)}
          isOpen={Boolean(attendeeModalEvent)}
          onClose={() => setAttendeeModalEvent(null)}
          title={`Registered Attendees · ${attendeeModalEvent.title}`}
          subtitle={`${attendeeModalEvent.kind} (${attendeeModalEvent.category}) · ${attendeeModalEvent.date} · ${attendeeModalEvent.location}`}
          size="xl"
          maxWidth="max-w-6xl"
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {eventRegistrations.length.toLocaleString()} Total Registered
                </span>
                <span>•</span>
                <span>Capacity: {(attendeeModalEvent.capacity || 100).toLocaleString()}</span>
                {eventRegistrations.length > (attendeeModalEvent.capacity || 100) && (
                  <span className="text-amber-600 font-bold">
                    (+{(eventRegistrations.length - (attendeeModalEvent.capacity || 100)).toLocaleString()} Waitlisted)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/cms/registrations?contentId=${attendeeModalEvent.id}`)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Open in Dedicated Registrations Desk ↗
                </button>
                <button
                  type="button"
                  onClick={() => setAttendeeModalEvent(null)}
                  className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Quick Metrics & Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              {/* Left Search & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    placeholder="Search attendee by name, student ID, email..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#003580]/20"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                  {(['All', 'Confirmed', 'Pending Approval', 'Waitlisted', 'Rejected'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAttendeeStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        attendeeStatusFilter === st
                          ? 'bg-[#003580] text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportAttendeeRoster}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  title="Export attendee roster to CSV"
                >
                  <Download className="h-3.5 w-3.5 text-[#003580] dark:text-sky-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddAttendeeModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003580] text-xs font-bold text-white hover:bg-[#002a66] cursor-pointer shadow-xs"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>+ Register Attendee</span>
                </button>
              </div>
            </div>

            {/* Attendees Table */}
            {(() => {
              const q = attendeeSearch.trim().toLowerCase();
              const filteredAttendees = eventRegistrations.filter((r) => {
                const matchesQ =
                  !q ||
                  r.fullName.toLowerCase().includes(q) ||
                  r.email.toLowerCase().includes(q) ||
                  r.studentId.toLowerCase().includes(q) ||
                  (r.department && r.department.toLowerCase().includes(q));
                const matchesSt =
                  attendeeStatusFilter === 'All' ||
                  r.status === attendeeStatusFilter ||
                  (attendeeStatusFilter === 'Confirmed' && (r.status as any) === 'Approved');
                return matchesQ && matchesSt;
              });

              if (filteredAttendees.length === 0) {
                return (
                  <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/40">
                    <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No attendees match your filters.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      You can register attendees manually using the button above.
                    </p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th scope="col" className="px-4 py-3">Attendee Profile</th>
                        <th scope="col" className="px-4 py-3">Academic & Batch</th>
                        <th scope="col" className="px-4 py-3">Career & Employer</th>
                        <th scope="col" className="px-3 py-3 text-center">ETA Verified</th>
                        <th scope="col" className="px-3 py-3 text-center">Status</th>
                        <th scope="col" className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredAttendees.map((reg) => (
                        <tr
                          key={reg.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#003580] to-[#001f4d] text-white flex items-center justify-center text-xs font-black shrink-0">
                                {reg.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">
                                    {reg.fullName}
                                  </p>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono">{reg.studentId} • {reg.email}</p>
                                {reg.phone && <p className="text-[10px] text-slate-400">{reg.phone}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col text-[11px]">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                                {reg.department}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {reg.classYear}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col text-[11px]">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                                {reg.currentEmployer || 'ASTU Graduate'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {reg.jobTitle || 'Participant'}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleAttendeeEta(reg.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                                reg.accreditationVerified
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              title="Click to toggle ETA Audit Accreditation"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span>{reg.accreditationVerified ? 'Audit Verified' : 'Unverified'}</span>
                            </button>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                reg.status === 'Confirmed' || (reg.status as any) === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                                  : reg.status === 'Waitlisted'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                  : reg.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                              }`}
                            >
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {reg.status !== 'Confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendeeStatus(reg.id, 'Confirmed')}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                              {reg.status !== 'Rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendeeStatus(reg.id, 'Rejected')}
                                  className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Decline
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteAttendee(reg.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                                title="Remove attendee"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </AdminModal>
      )}

      {/* ── SUB-MODAL: MANUAL ATTENDEE REGISTRATION ── */}
      {showAddAttendeeModal && attendeeModalEvent && (
        <AdminModal
          open={showAddAttendeeModal}
          isOpen={showAddAttendeeModal}
          onClose={() => setShowAddAttendeeModal(false)}
          title={`Register Attendee · ${attendeeModalEvent.title}`}
          subtitle="Add an alumnus or participant to this event's verified roster"
          size="md"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleAddManualAttendee} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newAttendeeName}
                onChange={(e) => setNewAttendeeName(e.target.value)}
                placeholder="e.g. Dawit Alemayehu"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#003580]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newAttendeeEmail}
                  onChange={(e) => setNewAttendeeEmail(e.target.value)}
                  placeholder="alumnus@astu.edu.et"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#003580]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newAttendeePhone}
                  onChange={(e) => setNewAttendeePhone(e.target.value)}
                  placeholder="+251 9..."
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#003580]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Department / School
                </label>
                <select
                  value={newAttendeeDept}
                  onChange={(e) => setNewAttendeeDept(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Graduation Class
                </label>
                <select
                  value={newAttendeeBatch}
                  onChange={(e) => setNewAttendeeBatch(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="Class of 2024">Class of 2024</option>
                  <option value="Class of 2023">Class of 2023</option>
                  <option value="Class of 2022">Class of 2022</option>
                  <option value="Class of 2021">Class of 2021</option>
                  <option value="Class of 2020">Class of 2020</option>
                  <option value="Class of 2019">Class of 2019</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Current Employer / Enterprise
              </label>
              <input
                type="text"
                value={newAttendeeEmployer}
                onChange={(e) => setNewAttendeeEmployer(e.target.value)}
                placeholder="e.g. Safaricom Ethiopia / Self-employed"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowAddAttendeeModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#003580] text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-[#002a66]"
              >
                Confirm Registration
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
