import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import eventsService, { ApiEvent } from '../features/admin/services/events.service';

const DEFAULT_EVENT_IMAGES: Record<string, string> = {
  'ASTU Alumni Career Summit': '/images/astu-building.jpg',
  'Cloud Computing Bootcamp': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  'Employer Roundtable': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  'CV and Interview Lab': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  'AI/ML Research Symposium': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'Grant Writing Workshop': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
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

    eventsService
      .getAllEvents()
      .then((events) => {
        if (!isMounted) return;
        const match = events.find(
          (e) =>
            e.id === id ||
            e.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === id ||
            e.title.toLowerCase() === id.toLowerCase()
        );
        if (match) {
          setEventData(match);
        } else {
          // Fallback mockup match if database item not matched by exact slug
          setEventData({
            id: id,
            title: id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            date: '2026-06-18',
            location: 'ASTU Main Auditorium & Complex',
            type: id.toLowerCase().includes('workshop') || id.toLowerCase().includes('bootcamp') || id.toLowerCase().includes('lab') ? 'Workshop' : 'Event',
            description: 'Join ASTU graduates, researchers, and corporate partners for technical workshops, career networking, keynotes, and strategic tracer feedback sessions at Adama Science and Technology University.',
          });
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

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

    // Persist server-side FIRST. The RSVP used to be wrapped in `catch {}` and
    // the confirmation toast fired regardless, so a failed request still showed
    // "Ticket emailed" and a QR pass for a registration that was never saved.
    const isPersistedEvent = eventData.id && !eventData.id.startsWith('E-');
    if (isPersistedEvent) {
      try {
        // rsvpToEvent swallows its own errors and resolves false, so the
        // rejection has to be raised here or it is invisible.
        const ok = await eventsService.rsvpToEvent(eventData.id, 'GOING');
        if (!ok) throw new Error('RSVP rejected');
      } catch {
        toast.error('Could not save your RSVP. Please try again.');
        return;
      }
    }

    const stored = localStorage.getItem('astu_user_registered_events');
    const parsed = stored ? JSON.parse(stored) : [];
    const updated = Array.from(new Set([...parsed, eventData.title, eventData.id]));
    localStorage.setItem('astu_user_registered_events', JSON.stringify(updated));

    setIsRegistered(true);
    setShowRegModal(false);
    // Only claim an email when there is no server record to have sent one.
    toast.success(
      isPersistedEvent
        ? `RSVP confirmed for "${eventData.title}".`
        : `Saved locally for "${eventData.title}". This event has no record on the server, so no ticket was issued.`
    );
    setShowQrModal(true);
  };

  const bannerImg = eventData ? DEFAULT_EVENT_IMAGES[eventData.title] || '/images/astu-building.jpg' : '/images/astu-building.jpg';
  const isWorkshop = eventData?.type === 'Workshop' || eventData?.type === 'WORKSHOP' || eventData?.title.toLowerCase().includes('workshop') || eventData?.title.toLowerCase().includes('bootcamp');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#003580] mx-auto"></div>
          <p className="mt-3 text-xs font-semibold text-slate-500">Loading Event Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Header Banner Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-[#003580] dark:text-blue-300" /> Back to Events & Workshops
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Share
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Media & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Poster */}
            <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-900">
              <img
                src={bannerImg}
                alt={eventData?.title}
                className="h-full w-full object-cover opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  isWorkshop ? 'bg-amber-500 text-slate-950' : 'bg-[#003580] text-white'
                }`}>
                  {isWorkshop ? <Wrench className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />} {isWorkshop ? 'ASTU Technical Workshop' : 'ASTU Alumni Event'}
                </span>
                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                  {eventData?.title}
                </h1>
              </div>
            </div>

            {/* Quick Specs Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#003580] dark:text-blue-300">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{eventData?.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{eventData?.location || 'ASTU Campus'}</p>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organizer</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">ASTU Alumni Office</p>
                </div>
              </div>
            </div>

            {/* Detailed Overview */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#003580] dark:text-blue-400" /> About This {isWorkshop ? 'Workshop' : 'Event'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {eventData?.description || 'Join ASTU graduates, researchers, and corporate partners for technical workshops, career networking, keynotes, and strategic tracer feedback sessions at Adama Science and Technology University.'}
              </p>

              <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Highlights</h3>
                <ul className="grid gap-2 sm:grid-cols-2 text-xs text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Certificate of Participation
                  </li>
                  <li className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Corporate & Executive Networking
                  </li>
                  <li className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Hands-on Practical Lab Sessions
                  </li>
                  <li className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Instant QR Check-in Pass
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: RSVP Action Card */}
          <div className="space-y-6">
            <div className="sticky top-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md space-y-5 transition-colors">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Open Registration
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">Registration & Seat Booking</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Free registration for all verified ASTU alumni, students, and partners.</p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Registered Attendees</span>
                  <span className="font-bold text-slate-900 dark:text-white">{isRegistered ? '121' : '120'} Registered</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-[#003580] rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-[10px] text-slate-400 text-right">65% Capacity Filled</p>
              </div>

              <button
                onClick={handleRegisterClick}
                className={`w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  isRegistered ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#003580] hover:brightness-110'
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
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 text-center text-xs text-emerald-800 dark:text-emerald-300">
                  <p className="font-semibold">✓ You are registered for this event!</p>
                  <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">Bring your digital QR pass for entry check-in.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Full Participant Registration Form Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-fade-in" onClick={() => setShowRegModal(false)}>
          <div className="relative max-w-lg w-full rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <span className="rounded-md bg-[#003580] px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                  {isWorkshop ? 'Workshop' : 'Event'} Registration Form
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">{eventData?.title}</h3>
              </div>
              <button onClick={() => setShowRegModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs space-y-1 border border-slate-100 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-white">Scheduled Date:</span> {eventData?.date}</p>
              <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-900 dark:text-white">Venue:</span> {eventData?.location || 'ASTU Main Campus'}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">Free Admission • Instant Digital Pass Issued Upon Submission</p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Abebe Yosef"
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. abebe@astu.edu.et"
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. +251 911 234 567"
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Participant Status</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  >
                    <option value="Alumni">ASTU Alumni</option>
                    <option value="Student">Graduating Senior Student</option>
                    <option value="Faculty / Staff">Faculty / University Staff</option>
                    <option value="Employer Partner">Corporate Employer Partner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department / Organization</label>
                <input
                  type="text"
                  value={regAffiliation}
                  onChange={(e) => setRegAffiliation(e.target.value)}
                  placeholder="e.g. School of Electrical Engineering & Computing"
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Special Accommodations / Dietary Notes (Optional)</label>
                <input
                  type="text"
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  placeholder="e.g. Wheelchair access / Vegetarian meal"
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3.5 py-2 text-sm outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowRegModal(false)} className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button onClick={confirmRegForm} className="rounded-lg bg-[#003580] px-5 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-md">
                Complete & Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Event Pass Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowQrModal(false)}>
          <div className="relative max-w-sm w-full rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 shadow-2xl text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registration Confirmed!</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{eventData?.title}</p>
              {regName && <p className="text-[11px] text-slate-400 mt-0.5">Participant: {regName}</p>}
            </div>

            <div className="mx-auto w-48 h-48 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-3 bg-white flex items-center justify-center shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`ASTU-EVENT-${eventData?.id}-${regName || 'USER'}`)}`}
                alt="QR Pass Code"
                className="h-full w-full object-contain"
              />
            </div>

            <p className="text-[11px] text-slate-400">Scan at entry venue for instant automated attendance check-in.</p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full rounded-xl bg-slate-900 dark:bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
