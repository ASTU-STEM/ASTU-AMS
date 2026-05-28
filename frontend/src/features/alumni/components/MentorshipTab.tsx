import React, { useState } from 'react';
import { Mentor, MentorshipSession } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface MentorshipTabProps {
  mentors: Mentor[];
  onRequestMentorship: (mentorId: number) => void;
  onScheduleSession: (mentorId: number, session: Omit<MentorshipSession, 'id' | 'status' | 'meetLink'>) => void;
}

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

  // Session form states
  const [sessionForm, setSessionForm] = useState({
    date: '',
    time: '',
    topic: ''
  });

  // Mock student requests for "Become a Mentor"
  const [studentRequests, setStudentRequests] = useState([
    {
      id: 1,
      name: 'Melkamu Abebe',
      department: 'Computer Science and Engineering',
      year: '4th Year Student',
      message: 'Hello! I am preparing my graduation project on secure escrow payments. I saw you work at Chapa and would highly appreciate your architectural guidance on API workflows.',
      status: 'PENDING'
    },
    {
      id: 2,
      name: 'Tigist Kebede',
      department: 'Electrical and Computer Engineering',
      year: '5th Year Student',
      message: 'Hi Abebe, I am highly interested in switching to backend systems engineering. I would love to learn more about the daily operations of Node.js servers in FinTech products.',
      status: 'PENDING'
    }
  ]);

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
    toast.success(`Mentorship request successfully sent to ${selectedMentorForRequest.name}!`);
  };

  const handleOpenScheduleModal = (mentor: Mentor) => {
    setSelectedMentorForSession(mentor);
    setSessionForm({
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // default 2 days out
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
    toast.success(`Mentorship session successfully scheduled with ${selectedMentorForSession.name}! Link emailed.`);
  };

  const handleAcceptStudent = (requestId: number, studentName: string) => {
    setStudentRequests(prev => 
      prev.map(req => req.id === requestId ? { ...req, status: 'CONNECTED' } : req)
    );
    toast.success(`You are now connected with ${studentName}! An email confirmation has been sent.`);
  };

  const handleDeclineStudent = (requestId: number) => {
    setStudentRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('Mentorship request declined.');
  };

  // Compile all connected mentors with sessions
  const connectedMentors = mentors.filter(m => m.status === 'CONNECTED');

  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <section className="bg-gradient-to-r from-purple-900 via-violet-950 to-astu-navy rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="max-w-3xl relative z-10 space-y-4">
          <span className="px-3 py-1 bg-white/15 text-[#FFD700] text-xs font-bold uppercase tracking-wider rounded-full">ASTU Professional Network</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Peer Mentorship Network 🤝</h2>
          <p className="text-md opacity-90 leading-relaxed">
            Connect with seasoned ASTU graduates operating in multinational technology companies, schedule 1-on-1 virtual advice sessions, or serve as a mentor to senior undergraduates.
          </p>
        </div>
      </section>

      {/* Role Navigation Bar */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('find')}
          className={`pb-4 px-2 font-bold text-sm tracking-wide transition-all border-b-2 ${
            activeTab === 'find' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Find a Senior Mentor
        </button>
        <button
          onClick={() => setActiveTab('become')}
          className={`pb-4 px-2 font-bold text-sm tracking-wide transition-all border-b-2 ${
            activeTab === 'become' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Become a Mentor
        </button>
      </div>

      {/* TABS CONTAINER */}
      {activeTab === 'find' ? (
        /* FIND A MENTOR TAB */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Mentors List Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/60 max-w-xl">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mentors by name, company, role, or skill..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMentors.map((mentor) => (
                <div 
                  key={mentor.id}
                  className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={mentor.avatarUrl} 
                        alt={mentor.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-100 shadow-sm"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{mentor.name}</h4>
                        <p className="text-xs text-purple-600 font-bold">{mentor.role}</p>
                        <p className="text-xs text-gray-500">{mentor.company} • {mentor.batch}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{mentor.bio}</p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {mentor.skills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-gray-50 border border-gray-150 text-[10px] font-bold text-gray-600 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-100 flex gap-2">
                    {mentor.status === 'CONNECTED' ? (
                      <>
                        <span className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          Connected
                        </span>
                        <button
                          onClick={() => handleOpenScheduleModal(mentor)}
                          className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          Schedule Session
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          if (mentor.status === 'AVAILABLE') {
                            handleOpenRequestModal(mentor);
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                          mentor.status === 'REQUEST_PENDING'
                            ? 'bg-purple-50 text-purple-600 border border-purple-200 cursor-not-allowed'
                            : 'bg-astu-navy text-white hover:bg-astu-navy/90 hover:scale-102 shadow-sm'
                        }`}
                        disabled={mentor.status === 'REQUEST_PENDING'}
                      >
                        {mentor.status === 'REQUEST_PENDING' ? 'Request Pending' : 'Request Mentorship'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Columns: Scheduled Sessions Tracker */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Scheduled Sessions</h3>
                <p className="text-xs text-gray-600">Track and attend scheduled video consulting sessions.</p>
              </div>

              <div className="space-y-4">
                {connectedMentors.map(m => 
                  m.sessions?.map(sess => (
                    <div key={sess.id} className="p-4 border border-purple-100 bg-purple-50/20 rounded-2xl space-y-3">
                      <div>
                        <span className="px-2 py-0.5 bg-purple-15 text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 rounded">
                          {sess.status}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 mt-2">{sess.topic}</h4>
                        <p className="text-xs text-gray-600 font-medium">with {m.name}</p>
                      </div>

                      <div className="flex flex-col gap-1 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-sm font-bold">calendar_month</span>
                          {sess.date}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-sm font-bold">schedule</span>
                          {sess.time}
                        </span>
                      </div>

                      {sess.meetLink && (
                        <a
                          href={sess.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 bg-purple-65 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm text-center block bg-purple-600"
                        >
                          Join Meet
                        </a>
                      )}
                    </div>
                  ))
                )}

                {connectedMentors.every(m => !m.sessions || m.sessions.length === 0) && (
                  <div className="text-center py-6 text-gray-400 italic text-xs">
                    No consultation sessions scheduled yet. Connect with a mentor to book sessions!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BECOME A MENTOR TAB */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Mentorship Status</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                By enabling your mentor status, you allow current ASTU senior engineering students to view your corporate bio and submit guidance requests to you.
              </p>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                <span className="text-sm font-bold text-gray-900">Accepting Students</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAvailableAsMentor(!isAvailableAsMentor);
                    toast.success(isAvailableAsMentor ? 'You are no longer visible as a mentor.' : 'Congratulations! You are now accepting mentorship requests.');
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                    isAvailableAsMentor ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${
                    isAvailableAsMentor ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Incoming Student Requests</h3>
                <p className="text-sm text-gray-600">Review guidance and portfolio reviews requests from ASTU seniors</p>
              </div>

              <div className="space-y-4">
                {isAvailableAsMentor ? (
                  studentRequests.map((req) => (
                    <div 
                      key={req.id}
                      className="p-5 border border-gray-150 rounded-2xl bg-gradient-to-r from-purple-50/10 to-white hover:shadow-sm transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900">{req.name}</h4>
                            <p className="text-xs text-purple-600 font-bold">{req.department} • {req.year}</p>
                          </div>
                          {req.status === 'CONNECTED' ? (
                            <span className="text-xs font-bold text-astu-green bg-astu-green/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Connected
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Pending</span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">{req.message}</p>

                        {req.status === 'PENDING' && (
                          <div className="flex gap-3 pt-3 mt-1 border-t border-gray-55">
                            <button
                              onClick={() => handleAcceptStudent(req.id, req.name)}
                              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                            >
                              Accept Request
                            </button>
                            <button
                              onClick={() => handleDeclineStudent(req.id)}
                              className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 italic">
                    Enable "Accepting Students" to receive and manage mentorship requests from ASTU seniors.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST MESSAGE MODAL */}
      {selectedMentorForRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Request Mentorship</h3>
                <p className="text-xs text-gray-600">Send a brief intro message to {selectedMentorForRequest.name}</p>
              </div>
              <button 
                onClick={() => setSelectedMentorForRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Introduction Message</label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="w-full text-sm p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:outline-none focus:border-purple-500 transition-all h-36 resize-none"
                placeholder="Why do you want to connect with this mentor? What do you hope to gain?"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedMentorForRequest(null)}
                className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE SESSION MODAL */}
      {selectedMentorForSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleBookSessionSubmit}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4"
          >
            <div className="flex justify-between items-start pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Schedule Mentorship Session</h3>
                <p className="text-xs text-gray-600">Pick a consulting topic and meeting time slot with {selectedMentorForSession.name}</p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedMentorForSession(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Consulting Topic</label>
              <input
                type="text"
                value={sessionForm.topic}
                onChange={(e) => setSessionForm(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Time Slot</label>
                <input
                  type="time"
                  value={sessionForm.time}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedMentorForSession(null)}
                className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Confirm Session
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
