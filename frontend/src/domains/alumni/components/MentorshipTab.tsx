import React, { useState } from 'react';
import { Mentor, MentorshipSession } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface MentorReview {
  id: number;
  mentorId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface MentorshipTabProps {
  mentors: Mentor[];
  onRequestMentorship: (mentorId: string) => void;
  onScheduleSession: (mentorId: string, session: Omit<MentorshipSession, 'id' | 'status' | 'meetLink'>) => void;
}

const defaultReviews: MentorReview[] = [];

export const MentorshipTab: React.FC<MentorshipTabProps> = ({
  mentors,
  onRequestMentorship,
  onScheduleSession
}) => {
  const [activeTab, setActiveTab] = useState<'find' | 'become'>('find');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAvailableAsMentor, setIsAvailableAsMentor] = useState(false);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState<Mentor | null>(null);
  const [selectedMentorForSession, setSelectedMentorForSession] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedMentorForReviews, setSelectedMentorForReviews] = useState<string | null>(null);
  const [reviews] = useState<MentorReview[]>(defaultReviews);

  const [sessionForm, setSessionForm] = useState({
    date: '',
    time: '',
    topic: ''
  });

  const [studentRequests, setStudentRequests] = useState<{ id: number; name: string; department: string; year: string; message: string; status: string }[]>([]);

  const filteredMentors = mentors.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.company.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query) ||
      m.skills.some(s => s.toLowerCase().includes(query))
    );
  });

  const handleOpenRequestModal = (mentor: Mentor) => {
    setSelectedMentorForRequest(mentor);
    setRequestMessage(`Hello ${mentor.name.split(' ')[0]}, I am an ASTU alumnus working as a junior engineer. I would highly appreciate your professional guidance and mentorship on system architecture and career planning.`);
  };

  const handleSendRequest = () => {
    if (!selectedMentorForRequest) return;
    onRequestMentorship(selectedMentorForRequest.id);
    setSelectedMentorForRequest(null);
    toast.success(`Mentorship request sent to ${selectedMentorForRequest.name}!`);
  };

  const handleOpenScheduleModal = (mentor: Mentor) => {
    setSelectedMentorForSession(mentor);
    setSessionForm({
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '14:00',
      topic: 'Career Roadmap & Resume Review'
    });
  };

  const handleBookSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorForSession) return;

    onScheduleSession(selectedMentorForSession.id, {
      date: new Date(sessionForm.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: sessionForm.time,
      topic: sessionForm.topic
    });

    setSelectedMentorForSession(null);
    toast.success(`Session scheduled with ${selectedMentorForSession.name}!`);
  };

  const handleAcceptStudent = (requestId: number, studentName: string) => {
    setStudentRequests(prev =>
      prev.map(req => req.id === requestId ? { ...req, status: 'CONNECTED' } : req)
    );
    toast.success(`Connected with ${studentName}!`);
  };

  const handleDeclineStudent = (requestId: number) => {
    setStudentRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('Request declined.');
  };

  const connectedMentors = mentors.filter(m => m.status === 'ACCEPTED');

  return (
    <div className="space-y-6">
      {/* ── Hero Banner with ASTU Branding ── */}
      <section
        className="rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #001a33 50%, #0d2b4d 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCC00]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              alt="ASTU Logo"
              className="h-14 w-14 object-contain rounded-xl bg-white/10 p-1.5 border border-white/20 shadow-md flex-shrink-0"
              src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
            />
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFCC00]/20 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#FFCC00]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
                ASTU Professional Network
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Peer Mentorship Network
              </h2>
              <p className="text-sm text-white/70 leading-relaxed max-w-xl">
                Connect with seasoned ASTU graduates, schedule 1-on-1 virtual sessions,
                or serve as a mentor to senior undergraduates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
              <div className="text-2xl font-extrabold text-[#FFCC00]">{mentors.length}</div>
              <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Mentors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
              <div className="text-2xl font-extrabold text-white">{connectedMentors.length}</div>
              <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Connected</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Navigation Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200 bg-gray-50/50 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('find')}
          className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'find'
              ? 'bg-white text-[#003366] shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <span className="material-symbols-outlined text-base">person_search</span>
          Find a Senior Mentor
        </button>
        <button
          onClick={() => setActiveTab('become')}
          className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'become'
              ? 'bg-white text-[#003366] shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <span className="material-symbols-outlined text-base">school</span>
          Become a Mentor
        </button>
      </div>

      {/* ── TABS CONTAINER ── */}
      {activeTab === 'find' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Mentors List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/60">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mentors by name, company, role, or skill..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={mentor.avatarUrl}
                        alt={mentor.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#003366]/15 shadow-sm"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{mentor.name}</h4>
                        <p className="text-[11px] text-[#003366] font-bold">{mentor.role}</p>
                        <p className="text-[10px] text-gray-500">{mentor.company}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">{mentor.bio}</p>

                    {/* Mentor Rating Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const mentorReviews = reviews.filter(r => r.mentorId === mentor.id);
                        const avgRating = mentorReviews.length > 0
                          ? mentorReviews.reduce((sum, r) => sum + r.rating, 0) / mentorReviews.length
                          : 0;
                        return (
                          <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        );
                      })}
                      <button onClick={() => setSelectedMentorForReviews(selectedMentorForReviews === mentor.id ? null : mentor.id)} className="text-[9px] text-[#003366] font-bold hover:underline ml-1">
                        {reviews.filter(r => r.mentorId === mentor.id).length} reviews
                      </button>
                    </div>

                    {/* Reviews Expand */}
                    {selectedMentorForReviews === mentor.id && (
                      <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        {reviews.filter(r => r.mentorId === mentor.id).map(review => (
                          <div key={review.id} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-800">{review.author}</span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <svg key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">{review.text}</p>
                            <p className="text-[8px] text-gray-400 mt-0.5">{review.date}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {mentor.skills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-[#003366]/5 text-[10px] font-bold text-[#003366] rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 flex gap-2">
                    {mentor.status === 'ACCEPTED' ? (
                      <>
                        <span className="flex-1 text-center py-2 rounded-xl text-[11px] font-bold bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20">
                          Connected ✓
                        </span>
                        <button
                          onClick={() => handleOpenScheduleModal(mentor)}
                          className="flex-1 py-2 text-white rounded-xl text-[11px] font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                          style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
                        >
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          Schedule
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          if (mentor.status === 'PENDING') {
                            handleOpenRequestModal(mentor);
                          }
                        }}
                        className={`w-full py-2 rounded-xl text-[11px] font-bold transition-all ${
                          mentor.status === 'PENDING'
                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : 'text-white shadow-sm hover:shadow-md'
                        }`}
                        style={mentor.status !== 'PENDING' ? { background: 'linear-gradient(135deg, #003366, #001a33)' } : { background: 'transparent' }}
                        disabled={mentor.status === 'PENDING'}
                      >
                        {mentor.status === 'PENDING' ? 'Request Pending' : 'Request Mentorship'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Scheduled Sessions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold material-symbols-outlined"
                    style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
                  >
                    event
                  </span>
                  Scheduled Sessions
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 ml-9">Track your upcoming consultations</p>
              </div>

              <div className="space-y-3">
                {connectedMentors.map(m =>
                  m.sessions?.map(sess => (
                    <div key={sess.id} className="p-3 border border-[#003366]/10 bg-[#003366]/[0.02] rounded-xl space-y-2">
                      <div>
                        <span className="px-2 py-0.5 bg-[#003366]/10 text-[10px] font-extrabold uppercase text-[#003366] rounded-md">
                          {sess.status}
                        </span>
                        <h4 className="font-bold text-xs text-gray-900 mt-1.5">{sess.topic}</h4>
                        <p className="text-[10px] text-gray-500 font-medium">with {m.name}</p>
                      </div>

                      <div className="flex flex-col gap-0.5 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-xs">calendar_month</span>
                          {sess.date}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {sess.time}
                        </span>
                      </div>

                      {sess.meetLink && (
                        <a
                          href={sess.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-1.5 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm text-center block"
                          style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
                        >
                          Join Meet
                        </a>
                      )}
                    </div>
                  ))
                )}

{connectedMentors.every(m => !m.sessions || m.sessions.length === 0) && (
                    <div className="text-center py-6">
                      <div className="text-2xl mb-2 opacity-30 material-symbols-outlined">event</div>
                      <p className="text-[11px] text-gray-400">No sessions scheduled yet.</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── BECOME A MENTOR TAB ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold material-symbols-outlined" style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}>school</span>
                Mentorship Status
              </h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Enable mentor status to let ASTU senior students view your bio and submit guidance requests.
              </p>

              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-xs font-bold text-gray-900">Accepting Students</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAvailableAsMentor(!isAvailableAsMentor);
                    toast.success(isAvailableAsMentor ? 'No longer visible as a mentor.' : 'Now accepting mentorship requests!');
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                    isAvailableAsMentor ? 'bg-[#003366]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                    isAvailableAsMentor ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
                >
                  📩
                </span>
                Incoming Student Requests
              </h3>
              <p className="text-[11px] text-gray-500">Review guidance requests from ASTU students</p>

              <div className="space-y-3">
                {isAvailableAsMentor ? (
                  studentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{req.name}</h4>
                            <p className="text-[10px] text-[#003366] font-bold">{req.department} · {req.year}</p>
                          </div>
                          {req.status === 'CONNECTED' ? (
                            <span className="text-[10px] font-bold text-[#1D9E75] bg-[#1D9E75]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              Connected
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#FFCC00] bg-[#FFCC00]/15 px-2 py-0.5 rounded-full">Pending</span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed">{req.message}</p>

                        {req.status === 'PENDING' && (
                          <div className="flex gap-2 pt-2 mt-1 border-t border-gray-100">
                            <button
                              onClick={() => handleAcceptStudent(req.id, req.name)}
                              className="flex-1 py-2 text-white rounded-xl text-[11px] font-bold transition-colors shadow-sm"
                              style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
                            >
                              Accept Request
                            </button>
                            <button
                              onClick={() => handleDeclineStudent(req.id)}
                              className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-[11px] font-bold transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2 opacity-30">👥</div>
                    <p className="text-xs text-gray-400">Enable "Accepting Students" to receive mentorship requests.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REQUEST MESSAGE MODAL ── */}
      {selectedMentorForRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 text-white" style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    alt="ASTU"
                    className="h-9 w-9 object-contain rounded-lg bg-white/15 p-1 border border-white/20"
                    src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCC00]">Mentorship Request</span>
                    <h3 className="text-base font-bold mt-0.5">Connect with {selectedMentorForRequest.name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMentorForRequest(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/20"
                >
                  <span className="material-symbols-outlined text-white text-sm">close</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Introduction Message</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all h-32 resize-none"
                  placeholder="Why do you want to connect with this mentor?"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMentorForRequest(null)}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  className="flex-1 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEDULE SESSION MODAL ── */}
      {selectedMentorForSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleBookSessionSubmit}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="p-5 text-white" style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    alt="ASTU"
                    className="h-9 w-9 object-contain rounded-lg bg-white/15 p-1 border border-white/20"
                    src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCC00]">Schedule Session</span>
                    <h3 className="text-base font-bold mt-0.5">with {selectedMentorForSession.name}</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMentorForSession(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/20"
                >
                  <span className="material-symbols-outlined text-white text-sm">close</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Consulting Topic</label>
                <input
                  type="text"
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Date</label>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Time Slot</label>
                  <input
                    type="time"
                    value={sessionForm.time}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedMentorForSession(null)}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  style={{ background: 'linear-gradient(135deg, #003366, #001a33)' }}
                >
                  Confirm Session
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};