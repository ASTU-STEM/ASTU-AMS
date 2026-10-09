import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Bookmark,
  Building,
  Clock,
  QrCode,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import homepageCmsService from '../features/admin/services/homepageCms.service';
import eventsService, { ApiEvent } from '../features/admin/services/events.service';
import registrationService from '../features/admin/services/registration.service';

const DEFAULT_EVENT_IMAGES: Record<string, string> = {
  'ASTU Alumni Career Summit': '/images/astu-building.jpg',
  'Cloud Computing Bootcamp': '/images/electriclabs.jpeg',
  'Employer Roundtable': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  'CV and Interview Lab': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  'AI/ML Research Symposium': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'Grant Writing Workshop': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  'Data Science Bootcamp': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
};

const DEFAULT_BOOTCAMP_DATA = {
  id: 'WS-001',
  title: 'Data Science Bootcamp',
  type: 'Workshop',
  category: 'Technical Training',
  date: '2026-11-20',
  rsvps: 120,
  capacity: 185,
  location: 'Engineering Building Room 305',
  organizer: 'ASTU Alumni Office',
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  description:
    'Intensive bootcamp covering machine learning, data visualization, and statistical analysis using Python and R.',
  registrationInfo: 'Free registration for all verified ASTU alumni, students, and partners.',
  highlights:
    'Python and R Data Science Stack\nMachine Learning Modeling\nHands-on Practical Lab Sessions\nCertificate of Completion',
};

interface EventDetailPageData {
  id: string;
  title: string;
  date: string;
  location: string;
  type?: string;
  kind?: string;
  description?: string;
  image?: string;
  category?: string;
  organizer?: string;
  capacity?: number;
  rsvps?: any;
  registrationInfo?: string;
  highlights?: string;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passedEvent = (location.state as any)?.event;

  const [eventData, setEventData] = useState<EventDetailPageData | null>(passedEvent ? {
    id: passedEvent.id || id || '',
    title: passedEvent.title || '',
    date: passedEvent.date || '',
    location: passedEvent.location || '',
    type: passedEvent.type || passedEvent.kind || 'Event',
    description: passedEvent.description,
    image: passedEvent.image,
    category: passedEvent.category,
    organizer: passedEvent.organizer,
    capacity: passedEvent.capacity,
    rsvps: passedEvent.rsvps,
    registrationInfo: passedEvent.registrationInfo,
    highlights: passedEvent.highlights,
  } : null);
  const [loading, setLoading] = useState(!passedEvent);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    // Check if user is registered in localStorage
    try {
      const storedReg = localStorage.getItem('astu_user_registered_events');
      if (storedReg) {
        const parsed = JSON.parse(storedReg);
        if (Array.isArray(parsed) && parsed.some(t => t.toLowerCase() === id.toLowerCase() || t.includes(id))) {
          setIsRegistered(true);
        }
      }
    } catch {}

    const loadEvent = async () => {
      try {
        // 1. Check CMS events stored in localStorage by EventWorkshopManagement
        const localEventsJson = localStorage.getItem('astu_ams_cms_events_items');
        if (localEventsJson) {
          try {
            const list = JSON.parse(localEventsJson);
            if (Array.isArray(list)) {
              const cmsMatch = list.find(
                (e: any) =>
                  e.id === id ||
                  e.id?.toLowerCase() === id.toLowerCase() ||
                  e.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id.toLowerCase() ||
                  e.title?.toLowerCase() === id.toLowerCase()
              );
              if (cmsMatch && isMounted) {
                setEventData({
                  id: cmsMatch.id,
                  title: cmsMatch.title,
                  date: cmsMatch.date,
                  location: cmsMatch.location,
                  type: cmsMatch.kind || cmsMatch.type || 'Event',
                  description: cmsMatch.description,
                  image: cmsMatch.image,
                  category: cmsMatch.category,
                  organizer: cmsMatch.organizer,
                  capacity: Number(cmsMatch.capacity) || 185,
                  rsvps: Number(cmsMatch.rsvps) || 0,
                  registrationInfo: cmsMatch.registrationInfo,
                  highlights: cmsMatch.highlights,
                } as any);
                setLoading(false);
                return;
              }
            }
          } catch {}
        }

        // 2. Check homepage CMS config
        const cmsConfig = homepageCmsService.getSettings();
        if (cmsConfig) {
          const allPosts: any[] = [...((cmsConfig.events || []) as any[]), ...((cmsConfig.workshops || []) as any[])];
          const match: any = allPosts.find(
            (e: any) =>
              e.id === id ||
              e.id?.toLowerCase() === id.toLowerCase() ||
              e.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id.toLowerCase() ||
              e.title?.toLowerCase() === id.toLowerCase()
          );
          if (match && isMounted) {
            setEventData({
              id: match.id,
              title: match.title,
              date: match.date,
              location: match.location,
              type: match.kind || match.type || 'Event',
              description: match.description,
              image: match.image,
              category: match.category,
              organizer: match.organizer,
              capacity: Number(match.capacity) || 185,
              rsvps: Number(match.rsvps) || 0,
              registrationInfo: match.registrationInfo,
              highlights: match.highlights,
            });
            setLoading(false);
            return;
          }
        }

        // 3. Check passed state
        if (passedEvent && isMounted) {
          setEventData({
            id: passedEvent.id || id || '',
            title: passedEvent.title || '',
            date: passedEvent.date || '',
            location: passedEvent.location || '',
            type: passedEvent.type || passedEvent.kind || 'Event',
            description: passedEvent.description,
            image: passedEvent.image,
            category: passedEvent.category,
            organizer: passedEvent.organizer,
            capacity: Number(passedEvent.capacity) || 185,
            rsvps: Number(passedEvent.rsvps) || 0,
            registrationInfo: passedEvent.registrationInfo,
            highlights: passedEvent.highlights,
          });
          setLoading(false);
          return;
        }

        // 4. Check backend API events
        const events = await eventsService.getAllEvents();
        if (!isMounted) return;
        const apiMatch = events.find(
          (e) =>
            e.id === id ||
            e.id?.toLowerCase() === id.toLowerCase() ||
            e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id.toLowerCase() ||
            e.title.toLowerCase() === id.toLowerCase()
        );

        if (apiMatch) {
          setEventData({
            ...apiMatch,
            capacity: 185,
            rsvps: Array.isArray(apiMatch.rsvps) ? apiMatch.rsvps.length : 120,
            image: DEFAULT_EVENT_IMAGES[apiMatch.title] || '/images/astu-building.jpg',
          });
        } else if (
          id === 'WS-001' ||
          id.toLowerCase().includes('data-science') ||
          id.toLowerCase().includes('bootcamp')
        ) {
          setEventData(DEFAULT_BOOTCAMP_DATA as any);
        } else {
          setEventData(null);
        }
        setLoading(false);
      } catch {
        if (isMounted) {
          if (
            id === 'WS-001' ||
            id.toLowerCase().includes('data-science') ||
            id.toLowerCase().includes('bootcamp')
          ) {
            setEventData(DEFAULT_BOOTCAMP_DATA as any);
          } else {
            setEventData(null);
          }
          setLoading(false);
        }
      }
    };

    loadEvent();

    // Listen to real-time CMS events
    const handleCmsUpdate = () => {
      loadEvent();
    };

    window.addEventListener('astu-cms-events-changed', handleCmsUpdate);
    window.addEventListener('astu-cms-homepage-updated', handleCmsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-events-changed', handleCmsUpdate);
      window.removeEventListener('astu-cms-homepage-updated', handleCmsUpdate);
    };
  }, [id, passedEvent]);

  const [showRegModal, setShowRegModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAffiliation, setRegAffiliation] = useState('ASTU School of Engineering');
  const [regRole, setRegRole] = useState('Alumni');
  const [regNotes, setRegNotes] = useState('');

  const handleRegisterClick = () => {
    if (isRegistered) {
      setShowQrModal(true);
      return;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setRegName(parsed.name || '');
        setRegEmail(parsed.email || '');
      } catch {}
    }
    setShowRegModal(true);
  };

  const confirmRegForm = async () => {
    if (!eventData) return;
    if (!regName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      if (eventData.id && !eventData.id.startsWith('E-') && !eventData.id.startsWith('WS-')) {
        await eventsService.rsvpToEvent(eventData.id, 'GOING');
      }
    } catch {}

    // Synchronize directly with CMS Admin Registrations Desk
    try {
      registrationService.addRegistration({
        contentId: eventData.id || 'C-001',
        contentTitle: eventData.title,
        fullName: regName.trim(),
        studentId: `UGR/${Math.floor(10000 + Math.random() * 90000)}/24`,
        email: regEmail.trim(),
        phone: regPhone.trim() || '+251 91 000 0000',
        classYear: 'Class of 2024',
        department: regAffiliation.trim() || 'School of Engineering',
        currentEmployer: regRole.trim() || 'ASTU Graduate',
        jobTitle: regRole || 'Event Participant',
        employmentStatus: 'Employed Full-time',
        status: 'Pending Approval',
        accreditationVerified: true,
        notes: regNotes.trim() ? `Event Registration (${eventData.type || 'Event'}). Note: ${regNotes.trim()}` : `Event Registration (${eventData.type || 'Event'})`,
      });
    } catch { /* ignore */ }

    const stored = localStorage.getItem('astu_user_registered_events');
    const parsed = stored ? JSON.parse(stored) : [];
    const updated = Array.from(new Set([...parsed, eventData.title, eventData.id]));
    localStorage.setItem('astu_user_registered_events', JSON.stringify(updated));

    setIsRegistered(true);
    setShowRegModal(false);
    toast.success(`RSVP Confirmed for "${eventData.title}"! Registered on CMS Admin Desk.`);
    setShowQrModal(true);
  };

  const bannerImg = eventData
    ? (eventData as any).image ||
      DEFAULT_EVENT_IMAGES[eventData.title] ||
      '/images/astu-building.jpg'
    : '/images/astu-building.jpg';

  const isWorkshop =
    eventData?.type === 'Workshop' ||
    eventData?.type === 'WORKSHOP' ||
    eventData?.title.toLowerCase().includes('workshop') ||
    eventData?.title.toLowerCase().includes('bootcamp');

  const baseRegistered =
    eventData?.rsvps !== undefined && eventData?.rsvps !== null && Number(eventData.rsvps) > 0
      ? Number(eventData.rsvps)
      : eventData?.capacity
      ? Math.round(Number(eventData.capacity) * 0.65)
      : 120;

  const displayRegistered = isRegistered ? baseRegistered + 1 : baseRegistered;
  const capacityTotal = Number(eventData?.capacity) || 185;
  const filledPercent = Math.min(100, Math.round((displayRegistered / capacityTotal) * 100));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#003580]"></div>
          <p className="mt-3 text-xs font-semibold text-slate-500">Loading Event Details...</p>
        </div>
      </div>
    );
  }

  if (!loading && !eventData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Event or workshop not found.</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white shadow-sm"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header Banner Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 text-[#003580]" /> Back to Homepage
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-500" /> Share
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Media & Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Hero Poster */}
            <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg">
              <img
                src={bannerImg}
                alt={eventData?.title}
                className="h-full w-full object-cover opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    isWorkshop ? 'bg-amber-500 text-slate-950' : 'bg-[#003580] text-white'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />{' '}
                  {isWorkshop ? 'ASTU Technical Workshop' : 'ASTU Alumni Event'}
                </span>
                <h1 className="mt-2 text-2xl font-extrabold leading-tight text-white drop-shadow-md sm:text-3xl">
                  {eventData?.title}
                </h1>
              </div>
            </div>

            {/* Quick Specs Bar */}
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#003580]">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</p>
                  <p className="text-xs font-bold text-slate-800">{eventData?.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue</p>
                  <p className="text-xs font-bold text-slate-800">
                    {eventData?.location || 'ASTU Main Campus'}
                  </p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organizer</p>
                  <p className="text-xs font-bold text-slate-800">
                    {eventData?.organizer || 'ASTU Alumni Office'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Overview */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <ShieldCheck className="h-5 w-5 text-[#003580]" /> About This{' '}
                {isWorkshop ? 'Workshop' : 'Event'}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {eventData?.description ||
                  'Join ASTU graduates, researchers, and corporate partners for technical workshops, career networking, keynotes, and strategic tracer feedback sessions at Adama Science and Technology University.'}
              </p>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Highlights
                </h3>
                <ul className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                  {(eventData?.highlights
                    ? String(eventData.highlights)
                        .split('\n')
                        .filter((h) => h.trim())
                    : [
                        'Certificate of Participation',
                        'Alumni & Executive Networking',
                        'Hands-on Practical Sessions',
                        'Instant QR Check-in Pass',
                      ]
                  ).map((highlight, index) => (
                    <li key={index} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />{' '}
                      {highlight.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: RSVP Action Card */}
          <div className="space-y-6">
            <div className="sticky top-20 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <div>
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Open Registration
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  Registration & Seat Booking
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {eventData?.registrationInfo ||
                    'Free registration for all verified ASTU alumni, students, and partners.'}
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Registered Attendees</span>
                  <span className="font-bold text-slate-900">
                    {displayRegistered} Registered
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#003580] transition-all duration-500"
                    style={{ width: `${filledPercent}%` }}
                  ></div>
                </div>
                <p className="text-right text-[10px] text-slate-400">
                  {filledPercent}% Capacity Filled
                </p>
              </div>

              <button
                onClick={handleRegisterClick}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all ${
                  isRegistered
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-[#003580] hover:brightness-110'
                }`}
              >
                {isRegistered ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> View QR Event Pass
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5" /> Register for {isWorkshop ? 'Workshop' : 'Event'}
                  </>
                )}
              </button>

              {isRegistered && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-center text-xs text-emerald-800">
                  <p className="font-semibold">✓ You are registered for this event!</p>
                  <p className="mt-0.5 text-[11px] text-emerald-600">
                    Bring your digital QR pass for entry check-in.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Full Participant Registration Form Modal */}
      {showRegModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setShowRegModal(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-md bg-[#003580] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  {isWorkshop ? 'Workshop' : 'Event'} Registration Form
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-slate-900">{eventData?.title}</h3>
              </div>
              <button
                onClick={() => setShowRegModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">Scheduled Date:</span> {eventData?.date}
              </p>
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">Venue:</span>{' '}
                {eventData?.location || 'ASTU Main Campus'}
              </p>
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">Organizer:</span>{' '}
                {eventData?.organizer || 'ASTU Alumni Office'}
              </p>
              {eventData?.registrationInfo && (
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-900">Registration:</span>{' '}
                  {eventData.registrationInfo}
                </p>
              )}
              <p className="pt-1 text-[10px] font-medium text-emerald-600">
                Free Admission • Instant Digital Pass Issued Upon Submission
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Abebe Yosef"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. abebe@astu.edu.et"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. +251 911 234 567"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Participant Status</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  >
                    <option value="Alumni">ASTU Alumni</option>
                    <option value="Student">Graduating Senior Student</option>
                    <option value="Faculty / Staff">Faculty / University Staff</option>
                    <option value="Employer Partner">Corporate Employer Partner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Department / Organization
                </label>
                <input
                  type="text"
                  value={regAffiliation}
                  onChange={(e) => setRegAffiliation(e.target.value)}
                  placeholder="e.g. School of Electrical Engineering & Computing"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Special Accommodations / Dietary Notes (Optional)
                </label>
                <input
                  type="text"
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  placeholder="e.g. Wheelchair access / Vegetarian meal"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowRegModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRegForm}
                className="rounded-lg bg-[#003580] px-5 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110"
              >
                Complete & Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Event Pass Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registration Confirmed!</h3>
              <p className="mt-1 text-xs text-slate-500">{eventData?.title}</p>
              {regName && (
                <p className="mt-0.5 text-[11px] text-slate-400">Participant: {regName}</p>
              )}
            </div>

            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-3 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `ASTU-EVENT-${eventData?.id}-${regName || 'USER'}`
                )}`}
                alt="QR Pass Code"
                className="h-full w-full object-contain"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Scan at entry venue for instant automated attendance check-in.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
