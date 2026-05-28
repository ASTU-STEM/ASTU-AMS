import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// Types
import {
  JobMatch,
  AlumniProfile,
  TracerSurvey,
  Mentor,
  CareerEvent,
  DocumentRequest,
  AlumniPreferences,
  MentorshipSession
} from '../types/alumni.types';

// Mock Services
import {
  getAlumniProfile,
  saveAlumniProfile,
  getJobMatches,
  saveJobMatches,
  getTracerSurveys,
  saveTracerSurveys,
  getMentors,
  saveMentors,
  getCareerEvents,
  saveCareerEvents,
  getDocumentRequests,
  saveDocumentRequests,
  getAlumniPreferences,
  saveAlumniPreferences,
  calculateCompletion
} from '../services/mockAlumniData';

// Subcomponents
import { DashboardOverview } from '../components/DashboardOverview';
import { ProfileTab } from '../components/ProfileTab';
import { CareerTab } from '../components/CareerTab';
import { SurveysTab } from '../components/SurveysTab';
import { JobsTab } from '../components/JobsTab';
import { MentorshipTab } from '../components/MentorshipTab';
import { DocumentServicesTab } from '../components/DocumentServicesTab';
import { SettingsTab } from '../components/SettingsTab';
import { JobDetailsModal } from '../components/JobDetailsModal';
import { MessagingTab } from '../components/MessagingTab';

const AlumniDashboard = () => {
  const navigate = useNavigate();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Theme Dark / Light mode
  const [darkMode, setDarkMode] = useState(false);

  // Core Data States
  const [profile, setProfile] = useState<AlumniProfile>(getAlumniProfile());
  const [jobs, setJobs] = useState<JobMatch[]>(getJobMatches());
  const [surveys, setSurveys] = useState<TracerSurvey[]>(getTracerSurveys());
  const [mentors, setMentors] = useState<Mentor[]>(getMentors());
  const [events, setEvents] = useState<CareerEvent[]>(getCareerEvents());
  const [documents, setDocuments] = useState<DocumentRequest[]>(getDocumentRequests());
  const [preferences, setPreferences] = useState<AlumniPreferences>(getAlumniPreferences());

  // Interactivity States
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobMatch | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Tracer Survey 2026 launched! Complete before March 15.', unread: true, time: '2 hours ago' },
    { id: 2, text: 'New job matches released for Computer Science graduates.', unread: true, time: '1 day ago' },
    { id: 3, text: 'Helina Sileshi accepted your mentorship interest.', unread: false, time: '3 days ago' },
  ]);

  // Derived Stats
  const profileCompletion = calculateCompletion(profile);
  const pendingSurveysCount = surveys.filter(s => s.status === 'PENDING').length;
  const matchCount = jobs.filter(j => !j.applied).length;
  const connectedMentorsCount = mentors.filter(m => m.status === 'CONNECTED' || m.status === 'REQUEST_PENDING').length + 347;

  const stats = [
    {
      id: 1,
      label: 'Profile Status',
      value: `${profileCompletion}%`,
      color: 'astu-navy',
      icon: 'account_circle',
      bgGradient: 'from-blue-50 to-indigo-50',
      trend: 'Complete fields to boost',
      trendIcon: 'trending_up',
      trendColor: 'astu-green'
    },
    {
      id: 2,
      label: 'Job Matches',
      value: `${matchCount}`,
      color: 'astu-green',
      icon: 'work',
      bgGradient: 'from-emerald-50 to-green-50',
      trend: '+3 new placements',
      trendIcon: 'trending_up',
      trendColor: 'astu-green'
    },
    {
      id: 3,
      label: 'Pending Surveys',
      value: `${pendingSurveysCount}`,
      color: 'astu-red',
      icon: 'assignment',
      bgGradient: 'from-red-50 to-orange-50',
      trend: pendingSurveysCount > 0 ? 'Urgent Tracer studies' : 'All studies submitted',
      trendIcon: pendingSurveysCount > 0 ? 'schedule' : 'check_circle',
      trendColor: pendingSurveysCount > 0 ? 'astu-red' : 'astu-green'
    },
    {
      id: 4,
      label: 'Network Peers',
      value: `${connectedMentorsCount}`,
      color: 'purple-600',
      icon: 'people',
      bgGradient: 'from-purple-50 to-pink-50',
      trend: '+28 peers connected',
      trendIcon: 'trending_up',
      trendColor: 'astu-green'
    }
  ];

  // Sync state mutations with LocalStorage
  const handleSaveProfile = (updatedProfile: AlumniProfile) => {
    setProfile(updatedProfile);
    saveAlumniProfile(updatedProfile);
  };

  const handleUpdateEmploymentStatus = (role: string, company: string, salary: string) => {
    const updatedProfile = {
      ...profile,
      currentRole: role,
      company: company,
      salaryRange: salary
    };
    setProfile(updatedProfile);
    saveAlumniProfile(updatedProfile);
  };

  const handleApplyJob = (jobId: number) => {
    const updatedJobs = jobs.map(j => j.id === jobId ? {
      ...j,
      applied: true,
      applicationStatus: 'Under Review' as const
    } : j);
    setJobs(updatedJobs);
    saveJobMatches(updatedJobs);

    // Push new notification
    const appliedJob = jobs.find(j => j.id === jobId);
    if (appliedJob) {
      toast.success(`Application sent to ${appliedJob.company}!`);
      setNotifications(prev => [
        {
          id: Date.now(),
          text: `Applied for ${appliedJob.title} at ${appliedJob.company}.`,
          unread: true,
          time: 'Just now'
        },
        ...prev
      ]);
    }
  };

  const handleToggleSaveJob = (jobId: number) => {
    const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, saved: !j.saved } : j);
    setJobs(updatedJobs);
    saveJobMatches(updatedJobs);
  };

  const handleCompleteSurvey = (surveyId: number, answers: Record<string, string>) => {
    const updatedSurveys = surveys.map(s =>
      s.id === surveyId
        ? { ...s, status: 'COMPLETED' as const, completedAt: new Date().toLocaleDateString() }
        : s
    );
    setSurveys(updatedSurveys);
    saveTracerSurveys(updatedSurveys);

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `Submitted Tracer Survey: ${surveys.find(s => s.id === surveyId)?.title}.`,
        unread: true,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handleRegisterEvent = (eventId: number) => {
    const updatedEvents = events.map(e => e.id === eventId ? { ...e, registered: true } : e);
    setEvents(updatedEvents);
    saveCareerEvents(updatedEvents);

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `Registered for event: ${events.find(e => e.id === eventId)?.title}.`,
        unread: true,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handleRequestMentorship = (mentorId: number) => {
    const updatedMentors = mentors.map(m => m.id === mentorId ? { ...m, status: 'REQUEST_PENDING' as const } : m);
    setMentors(updatedMentors);
    saveMentors(updatedMentors);

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `Requested mentorship connection with ${mentors.find(m => m.id === mentorId)?.name}.`,
        unread: true,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handleScheduleSession = (mentorId: number, sessionDetails: Omit<MentorshipSession, 'id' | 'status' | 'meetLink'>) => {
    const updatedMentors = mentors.map(m => {
      if (m.id === mentorId) {
        const nextSessionId = (m.sessions?.length || 0) + 1;
        const newSession: MentorshipSession = {
          id: nextSessionId,
          ...sessionDetails,
          status: 'Scheduled',
          meetLink: `https://meet.google.com/astu-mentor-${mentorId}-${nextSessionId}`
        };
        return {
          ...m,
          sessions: [...(m.sessions || []), newSession]
        };
      }
      return m;
    });

    setMentors(updatedMentors);
    saveMentors(updatedMentors);

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `Scheduled mentorship session with ${mentors.find(m => m.id === mentorId)?.name}.`,
        unread: true,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handleRequestDocument = (type: DocumentRequest['type'], notes?: string) => {
    const newDoc: DocumentRequest = {
      id: documents.length + 1,
      type,
      requestDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      status: 'Pending',
      notes: notes || 'Awaiting registrar verification.'
    };

    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    saveDocumentRequests(updatedDocs);

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `Submitted official request for: ${type}.`,
        unread: true,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handleSavePreferences = (updatedPrefs: AlumniPreferences) => {
    setPreferences(updatedPrefs);
    saveAlumniPreferences(updatedPrefs);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Reset notifications unread badge
  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Clear a specific notification
  const handleClearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  return (
    <div className={`min-h-screen font-body-md overflow-x-hidden flex flex-col transition-all duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-on-surface'
      }`}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-0 h-full flex flex-col z-40 shadow-2xl w-[280px] hidden md:flex transition-all duration-300 ${darkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-astu-navy'
        }`}>
        <div className="p-6 mt-6">
          <div className="flex items-center gap-3">
            <img
              alt="ASTU Logo"
              className="h-12 w-12 object-contain drop-shadow-lg rounded-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
            />
            <div>
              <h1 className="text-xl font-bold text-white">ASTU Alumni</h1>
              <p className="text-[10px] text-astu-green uppercase tracking-widest font-extrabold">Management System</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 flex-grow px-3">
          <div className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'profile', label: 'Profile', icon: 'account_circle', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'career', label: 'Career Center', icon: 'school', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'surveys', label: 'Surveys', icon: 'assignment', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'jobs', label: 'Jobs', icon: 'work', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'mentorship', label: 'Mentorship', icon: 'diversity_3', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'documents', label: 'Document Services', icon: 'description', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'messages', label: 'Internal Messaging', icon: 'forum', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'settings', label: 'Settings', icon: 'settings', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-2.5 rounded-r-xl transition-all duration-300 text-left ${activeTab === item.id
                    ? item.activeColor + ' font-bold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-6 border-t border-white/10">
          <button
            onClick={() => setActiveTab('career')}
            className="w-full flex items-center gap-4 text-slate-300 hover:text-white mb-4 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-md">help</span>
            <span className="text-sm font-medium">Help Center</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 text-slate-300 hover:text-white transition-colors text-left"
          >
            <span className="material-symbols-outlined text-md">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-[280px] min-h-screen flex flex-col">

        {/* Header Section */}
        <header className={`sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-10 h-16 border-b transition-all duration-300 ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-200/50 shadow-sm'
          }`}>
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-850 border-slate-700 text-white focus:bg-slate-800' : 'bg-gray-100/80 border-gray-200 focus:bg-white text-gray-900'
                  }`}
                placeholder="Search alumni, companies, or mentors..."
                type="text"
                onChange={(e) => {
                  if (activeTab === 'dashboard' && e.target.value.trim().length > 1) {
                    setActiveTab('jobs');
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-6 relative">
            {/* Dark Mode Toggle Switch */}
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                toast.success(darkMode ? 'Light Theme activated!' : 'Premium Dark Theme activated!');
              }}
              className={`p-2 rounded-full hover:bg-gray-100/10 transition-colors flex items-center justify-center ${darkMode ? 'text-amber-400' : 'text-slate-600'
                }`}
              title="Toggle Dark/Light Mode"
            >
              <span className="material-symbols-outlined text-xl">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) handleMarkNotificationsRead();
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition-all duration-300 hover:scale-105"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-astu-red rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown Portal */}
            {showNotifications && (
              <div className={`absolute right-12 top-12 w-80 border rounded-2xl shadow-xl z-50 p-4 space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100/10">
                  <h4 className="font-bold text-sm">Notifications</h4>
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-astu-red hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className="flex justify-between items-start gap-2 p-2 rounded-lg hover:bg-gray-50/10 transition-colors">
                      <div className="space-y-0.5">
                        <p className="text-xs leading-normal">{notif.text}</p>
                        <span className="text-[10px] text-gray-400 font-semibold">{notif.time}</span>
                      </div>
                      <button
                        onClick={() => handleClearNotification(notif.id)}
                        className="text-gray-300 hover:text-gray-500"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-gray-500 italic text-center py-4">No notifications yet.</p>
                  )}
                </div>
              </div>
            )}

            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

            {/* Header User Profile Display */}
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.fullName}</p>
                <p className="text-xs text-gray-500 font-semibold">{profile.batch}</p>
              </div>
              <img
                alt="Profile"
                className="h-10 w-10 rounded-full border-2 border-astu-navy/20 shadow-sm object-cover"
                src={profile.avatarUrl}
              />
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab View */}
        <div className="p-4 md:p-10 flex-grow">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              profile={profile}
              completion={profileCompletion}
              stats={stats}
              recentJobs={jobs}
              surveys={surveys}
              onTabChange={setActiveTab}
              onViewJob={setSelectedJobForModal}
              setHoveredCard={setHoveredCard}
              hoveredCard={hoveredCard}
              onUpdateEmploymentStatus={handleUpdateEmploymentStatus}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              onSave={handleSaveProfile}
            />
          )}

          {activeTab === 'career' && (
            <CareerTab
              events={events}
              onRegisterEvent={handleRegisterEvent}
            />
          )}

          {activeTab === 'surveys' && (
            <SurveysTab
              surveys={surveys}
              onCompleteSurvey={handleCompleteSurvey}
            />
          )}

          {activeTab === 'jobs' && (
            <JobsTab
              jobs={jobs}
              onViewJob={setSelectedJobForModal}
              onToggleSaveJob={handleToggleSaveJob}
            />
          )}

          {activeTab === 'mentorship' && (
            <MentorshipTab
              mentors={mentors}
              onRequestMentorship={handleRequestMentorship}
              onScheduleSession={handleScheduleSession}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentServicesTab
              documentRequests={documents}
              onRequestDocument={handleRequestDocument}
            />
          )}

          {activeTab === 'messages' && (
            <MessagingTab darkMode={darkMode} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              preferences={preferences}
              onSavePreferences={handleSavePreferences}
            />
          )}
        </div>

      </main>

      {/* JOB DETAILS MODAL PORTAL */}
      <JobDetailsModal
        job={selectedJobForModal}
        onClose={() => setSelectedJobForModal(null)}
        onApply={handleApplyJob}
      />
    </div>
  );
};

export default AlumniDashboard;