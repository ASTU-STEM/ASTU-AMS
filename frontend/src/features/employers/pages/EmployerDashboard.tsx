import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Types
import {
  CompanyProfile,
  EmployerJob,
  CandidateApplication,
  GraduateFeedback,
  Message
} from '../types/employer.types';

// Services
import {
  getCompanyProfile,
  saveCompanyProfile,
  getEmployerJobs,
  saveEmployerJobs,
  getCandidateApplications,
  saveCandidateApplications,
  getGraduateFeedback,
  saveGraduateFeedback,
  getEmployerMessages,
  saveEmployerMessages
} from '../services/mockEmployerData';

// Tabs Sub-components
import { CompanyProfileTab } from '../components/CompanyProfileTab';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import { ActivityTimeline, ActivityEntry } from '../../../components/ActivityTimeline';
import { JobPostingTab } from '../components/JobPostingTab';
import { ApplicationsTab } from '../components/ApplicationsTab';
import { TalentSearchTab } from '../components/TalentSearchTab';
import { FeedbackTab } from '../components/FeedbackTab';
import { MessagingTab } from '../components/MessagingTab';
import { AnalyticsTab } from '../components/AnalyticsTab';

const EmployerDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme Dark / Light mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Notifications Bell dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Abebe Bikila applied for Senior Fullstack Engineer.', unread: true, time: '2 hours ago' },
    { id: 2, text: 'New messaging update from ASTU Placement Officer.', unread: true, time: '1 day ago' },
    { id: 3, text: 'Feedback audit verified by CSE Department Dean.', unread: false, time: '3 days ago' },
  ]);

  // Core Data States
  const [profile, setProfile] = useState<CompanyProfile>(getCompanyProfile());
  const [jobs, setJobs] = useState<EmployerJob[]>(getEmployerJobs());
  const [applications, setApplications] = useState<CandidateApplication[]>(getCandidateApplications());
  const [feedbacks, setFeedbacks] = useState<GraduateFeedback[]>(getGraduateFeedback());
  const [messages, setMessages] = useState<Message[]>(getEmployerMessages());

  // Count active stats
  const activeJobsCount = jobs.filter(j => j.status === 'Open').length;
  const pendingApplicationsCount = applications.filter(a => a.status === 'Pending').length;
  const shortlistedApplicationsCount = applications.filter(a => a.status === 'Shortlisted').length;
  const totalApplicationsCount = applications.length;

  const stats = [
    {
      id: 1,
      label: 'Active Job Posts',
      value: `${activeJobsCount}`,
      color: 'astu-navy',
      icon: 'work',
      bgGradient: 'from-blue-50 to-indigo-50',
      trend: '+1 this week',
      trendIcon: 'trending_up',
      trendColor: 'astu-green'
    },
    {
      id: 2,
      label: 'Total Applications',
      value: `${totalApplicationsCount}`,
      color: 'astu-green',
      icon: 'description',
      bgGradient: 'from-emerald-50 to-green-50',
      trend: `${pendingApplicationsCount} pending review`,
      trendIcon: 'mail',
      trendColor: 'astu-green'
    },
    {
      id: 3,
      label: 'Shortlisted Candidates',
      value: `${shortlistedApplicationsCount}`,
      color: 'astu-red',
      icon: 'check_circle',
      bgGradient: 'from-red-50 to-orange-50',
      trend: 'Ready for interview',
      trendIcon: 'schedule',
      trendColor: 'astu-red'
    },
    {
      id: 4,
      label: 'Total Feedback Audits',
      value: `${feedbacks.length}`,
      color: 'purple-600',
      icon: 'rate_review',
      bgGradient: 'from-purple-50 to-pink-50',
      trend: 'Curriculum reports',
      trendIcon: 'assignment_turned_in',
      trendColor: 'astu-green'
    }
  ];

  const hiringControlCards = [
    { icon: 'post_add', title: 'Recruitment System', desc: 'Create jobs or internships, set GPA, department, skill, and experience rules.', tab: 'post_job' },
    { icon: 'person_search', title: 'Talent Search Engine', desc: 'Find alumni by skills, GPA, department, experience, location, and AI rank.', tab: 'search_talent' },
    { icon: 'event_available', title: 'Interview Scheduling', desc: 'Move candidates from shortlist to interview with notes and next steps.', tab: 'candidates' },
    { icon: 'handshake', title: 'Partnership Module', desc: 'Track internships, sponsorship interest, research collaboration, and event support.', tab: 'feedback' },
  ];

  const demandSignals = [
    { label: 'Top Skill Demand', value: 'Cloud + DevOps', tone: 'text-astu-navy', icon: 'monitoring' },
    { label: 'Time to Hire', value: '18 days', tone: 'text-astu-green', icon: 'timer' },
    { label: 'Interview Queue', value: '7 candidates', tone: 'text-astu-red', icon: 'calendar_month' },
  ];

  // Callback triggers
  const handleSaveProfile = (updatedProfile: CompanyProfile) => {
    setProfile(updatedProfile);
    saveCompanyProfile(updatedProfile);
  };

  const handlePostJob = (newJobDetails: Omit<EmployerJob, 'id' | 'applicationsCount' | 'shortlistedCount' | 'viewsCount' | 'postedDate'>) => {
    const nextJobId = jobs.length + 1;
    const newJob: EmployerJob = {
      id: nextJobId,
      ...newJobDetails,
      postedDate: 'Just now',
      applicationsCount: 0,
      shortlistedCount: 0,
      viewsCount: 1
    };

    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    saveEmployerJobs(updatedJobs);

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `New job created: ${newJobDetails.title}.`,
        unread: true,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handleToggleJobStatus = (jobId: number) => {
    const updatedJobs = jobs.map(j =>
      j.id === jobId
        ? { ...j, status: (j.status === 'Open' ? 'Closed' : 'Open') as EmployerJob['status'] }
        : j
    );
    setJobs(updatedJobs);
    saveEmployerJobs(updatedJobs);
  };

  const handleUpdateApplicationStatus = (appId: number, status: CandidateApplication['status']) => {
    const updatedApps = applications.map(app =>
      app.id === appId ? { ...app, status } : app
    );
    setApplications(updatedApps);
    saveCandidateApplications(updatedApps);

    const targetApp = applications.find(a => a.id === appId);
    if (targetApp) {
      setNotifications(prev => [
        {
          id: Date.now(),
          text: `Marked application of ${targetApp.alumnusName} as ${status}.`,
          unread: true,
          time: 'Just now'
        },
        ...prev
      ]);
    }
  };

  const handleRegisterFeedback = (feedbackDetails: Omit<GraduateFeedback, 'id' | 'submittedAt'>) => {
    const nextFbId = feedbacks.length + 1;
    const newFb: GraduateFeedback = {
      id: nextFbId,
      ...feedbackDetails,
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };

    const updatedFb = [newFb, ...feedbacks];
    setFeedbacks(updatedFb);
    saveGraduateFeedback(updatedFb);
  };

  const handleSendMessage = (text: string) => {
    const nextMsgId = messages.length + 1;
    const newMsg: Message = {
      id: nextMsgId,
      sender: 'Employer',
      senderName: profile.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: false
    };

    const updatedMsg = [...messages, newMsg];
    setMessages(updatedMsg);
    saveEmployerMessages(updatedMsg);

    // Mock delayed response
    setTimeout(() => {
      const automaticResponse: Message = {
        id: nextMsgId + 1,
        sender: 'Alumni',
        senderName: 'Abebe Bikila',
        text: 'Received! Thank you for the info. Looking forward to our tech discussion.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: true
      };
      setMessages(prev => {
        const withResponse = [...prev, automaticResponse];
        saveEmployerMessages(withResponse);
        return withResponse;
      });
      toast.success('New message received from Abebe!');
    }, 2500);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleRemoveNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="role-shell admin-shell min-h-screen overflow-x-hidden bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased transition-all duration-300">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar navigation */}
      <aside className={`fixed left-0 top-0 z-40 hidden h-full w-[240px] flex-col shadow-2xl transition-all duration-300 md:flex ${darkMode ? 'bg-[#080d18] border-r border-[var(--border-color)]' : 'bg-[#003366]'
        }`}>
        <div className="p-6 mt-6">
          <div className="flex items-center gap-3">
            <img
              alt="ASTU Logo"
              className="h-12 w-12 object-contain drop-shadow-lg rounded-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
            />
            <div>
              <h1 className="text-lg font-bold text-white">ASTU Employer</h1>
              <p className="text-[10px] text-astu-green uppercase tracking-widest font-extrabold">Recruitment Hub</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 flex-grow px-3">
          <div className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'post_job', label: 'Job Scaffolder', icon: 'add_circle', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'candidates', label: 'Applications', icon: 'description', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'search_talent', label: 'Talent Search', icon: 'person_search', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'feedback', label: 'Quality Feedbacks', icon: 'rate_review', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'chat', label: 'Messages', icon: 'chat', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'analytics', label: 'Hiring Analytics', icon: 'analytics', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' },
              { id: 'profile', label: 'Company Profile', icon: 'business', activeColor: 'text-astu-green bg-white/10 border-l-4 border-astu-green' }
            ].map(item => (
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

        <div className="p-6 border-t border-white/10 mt-auto">
          <button
            onClick={() => setActiveTab('feedback')}
            className="w-full flex items-center gap-4 text-slate-300 hover:text-white mb-4 transition-all duration-300 text-left"
          >
            <span className="material-symbols-outlined text-md">help</span>
            <span className="text-sm font-medium">Help Center</span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-4 text-slate-300 hover:text-white transition-all duration-300 text-left"
          >
            <span className="material-symbols-outlined text-md">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content pane */}
      <main className="flex min-h-screen flex-col md:ml-[240px]">

        {/* Header bar */}
        <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 md:px-6"
          style={{ background: 'var(--bg-navbar)', borderColor: 'var(--border-color)' }}>
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                className="w-full rounded-full border bg-[#F3F5FA] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] transition-all duration-300 focus:bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-astu-navy/20 dark:bg-[#1E2130]"
                style={{ borderColor: 'var(--border-color)' }}
                placeholder="Global Search: search candidates, departments, or postings..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab === 'dashboard' && e.target.value.trim().length > 1) {
                    setActiveTab('search_talent');
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

            {/* Notification bell */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) handleMarkNotificationsRead();
              }}
              className="p-2 text-gray-400 hover:bg-gray-100/10 rounded-full relative transition-all duration-300 hover:scale-105"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-astu-red rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown card */}
            {showNotifications && (
              <div className={`absolute right-12 top-12 w-80 border rounded-2xl shadow-xl z-50 p-4 space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100/10">
                  <h4 className="font-bold text-sm">Recruiter Notifications</h4>
                  <button
                    onClick={handleClearAllNotifications}
                    className="text-xs text-astu-red hover:underline font-bold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`flex justify-between items-start gap-2 p-2 rounded-lg hover:bg-gray-50/10 transition-colors`}>
                      <div className="space-y-0.5">
                        <p className="text-xs leading-normal">{notif.text}</p>
                        <span className="text-[10px] text-gray-400 font-semibold">{notif.time}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveNotification(notif.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-gray-500 italic text-center py-4">No new recruit alerts.</p>
                  )}
                </div>
              </div>
            )}

            <div className="h-8 w-[1px] bg-gray-250 mx-2"></div>

            {/* Company profile head */}
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{profile.name}</p>
                <p className="text-xs text-gray-500 font-semibold">HR Manager</p>
              </div>
              <img
                alt="Profile"
                className="h-10 w-10 rounded-full border-2 border-astu-navy/20 shadow-sm object-cover"
                src={profile.logoUrl}
              />
            </div>
          </div>
        </header>

        {/* Dynamic routing wrapper */}
        <div className="flex-grow p-4 md:p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">

              {/* Welcome banner */}
              <section className="rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#233876,#1D9E75)] p-5 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div className="max-w-2xl space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">ASTU corporate network</span>
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Welcome back, {profile.name}</h2>
                    <p className="text-sm leading-relaxed text-white/85">
                      Your current vacancy listings have collected <span className="font-bold text-astu-green">{totalApplicationsCount} candidate files</span>.
                      Complete your graduate feedback forms to help align our technical curricula with industry standards.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('post_job')}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#E24B4A] px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm transition-all hover:bg-[#c94140]"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Post Career Placement
                  </button>
                </div>
              </section>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    onMouseEnter={() => setHoveredCard(stat.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => {
                      if (stat.id === 1) setActiveTab('post_job');
                      if (stat.id === 2) setActiveTab('candidates');
                      if (stat.id === 4) setActiveTab('feedback');
                    }}
                    className={`group relative cursor-pointer overflow-hidden rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
                      } ${hoveredCard === stat.id ? '-translate-y-1 shadow-md' : ''}`}
                  >
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-xl bg-astu-navy/10 text-astu-navy`}>
                          <span className="material-symbols-outlined text-2xl font-bold">{stat.icon}</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-green bg-astu-green/10 px-2 py-0.5 rounded">Active</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-extrabold text-astu-navy mt-1">{stat.value}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold pt-1 border-t border-gray-100/5">
                        <span className="material-symbols-outlined text-base font-bold text-astu-green">{stat.trendIcon}</span>
                        {stat.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Jobs list overview */}
              <section className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
                }`}>
                <div className="mb-4 flex items-center justify-between border-b border-gray-150 pb-2">
                  <div>
                    <h3 className="text-sm font-semibold">Your Posted Positions</h3>
                    <p className="text-xs text-gray-500 font-semibold">Quick updates on recent vacancies</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('post_job')}
                    className="text-xs font-bold text-astu-navy hover:underline"
                  >
                    View All Positions &rarr;
                  </button>
                </div>

                <div className="space-y-4">
                  {jobs.slice(0, 2).map((job) => (
                    <div
                      key={job.id}
                    className={`rounded-[10px] border p-4 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50/50 border-gray-200'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">{job.title}</h4>
                          <p className="text-xs text-gray-500">{job.location} • {job.type}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-astu-navy/10 text-astu-navy text-[10px] font-extrabold rounded">
                          {job.applicationsCount} Applied
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
                }`}>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Employer Feature Control</h3>
                    <p className="mt-1 text-xs text-gray-500">Recruitment, talent search, feedback, and partnership actions in one place.</p>
                  </div>
                  <span className="rounded-md border border-astu-green/20 bg-astu-green/10 px-2.5 py-1 text-[11px] font-semibold text-astu-green">
                    Hiring workflow active
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {hiringControlCards.map((card) => (
                    <button
                      key={card.title}
                      onClick={() => setActiveTab(card.tab)}
                      className={`rounded-[10px] border p-4 text-left transition-all hover:border-astu-navy/30 hover:shadow-sm ${darkMode ? 'border-slate-800 bg-slate-800/70 hover:bg-slate-800' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
                    >
                      <span className="material-symbols-outlined rounded-full bg-astu-navy/10 p-2 text-astu-navy">{card.icon}</span>
                      <h4 className="mt-3 text-sm font-bold">{card.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{card.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {demandSignals.map((signal) => (
                    <div key={signal.label} className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-white'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{signal.label}</p>
                      </div>
                      <p className="mt-2 text-lg font-extrabold">{signal.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Employer Analytics Graphs Row */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <AnalyticsChart
                  type="area"
                  title="Application Submissions"
                  subtitle="Candidate applications received over last 6 months"
                  data={[
                    { month: 'Jan', applications: 12 },
                    { month: 'Feb', applications: 19 },
                    { month: 'Mar', applications: 25 },
                    { month: 'Apr', applications: 32 },
                    { month: 'May', applications: 40 },
                    { month: 'Jun', applications: 54 },
                  ]}
                  xKey="month"
                  series={[{ key: 'applications', label: 'Applications Received' }]}
                  height={200}
                  darkMode={darkMode}
                />
                <AnalyticsChart
                  type="pie"
                  title="Evaluation Ratings"
                  subtitle="Corporate evaluation of hired graduates"
                  data={[
                    { name: 'Exceeds Expectations', value: 45 },
                    { name: 'Fully Competent', value: 38 },
                    { name: 'Needs Development', value: 12 },
                  ]}
                  xKey="name"
                  series={[{ key: 'value', label: 'Graduates Count' }]}
                  height={200}
                  darkMode={darkMode}
                />
              </div>

              {/* Employer Activity Timeline */}
              <div>
                <ActivityTimeline
                  activities={[
                    { id: 1, type: 'job', title: 'New application received', description: 'Abebe Yosef applied for the Senior React Developer opening.', timestamp: '10m ago', unread: true },
                    { id: 2, type: 'message', title: 'Private message from mentor', description: 'Hilina Sileshi sent a query regarding talent placement programs.', timestamp: '2h ago', unread: true },
                    { id: 3, type: 'survey', title: 'Curriculum evaluation submitted', description: 'Shared skill feedback with ASTU Computer Science department.', timestamp: '1d ago' },
                    { id: 4, type: 'event', title: 'Internship job offer accepted', description: 'Graduate Bekele Kebede signed the Software Dev Intern letter.', timestamp: '3d ago' }
                  ] as ActivityEntry[]}
                  darkMode={darkMode}
                  onViewAll={() => setActiveTab('messages')}
                />
              </div>

              {/* Quick actions panel */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <section className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
                  }`}>
                  <h3 className="font-bold text-md mb-4">Recruitment Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('post_job')}
                      className="p-4 bg-astu-navy text-white rounded-2xl text-center hover:scale-102 transition-transform"
                    >
                      Post Placement Vacancy
                    </button>
                    <button
                      onClick={() => setActiveTab('candidates')}
                      className="p-4 bg-astu-green text-white rounded-2xl text-center hover:scale-102 transition-transform"
                    >
                      Review Candidate Logs
                    </button>
                    <button
                      onClick={() => setActiveTab('search_talent')}
                      className="p-4 bg-purple-600 text-white rounded-2xl text-center hover:scale-102 transition-transform"
                    >
                      Search Talent Directory
                    </button>
                    <button
                      onClick={() => setActiveTab('feedback')}
                      className="p-4 bg-astu-red text-white rounded-2xl text-center hover:scale-102 transition-transform"
                    >
                      Submit Curriculum Feedback
                    </button>
                  </div>
                </section>

                <section className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
                  }`}>
                  <h3 className="font-bold text-md mb-4 font-body-md">Recruitment Partner Perks</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Get access to verified academic records directly from the ASTU Registrar office.
                    Your feedback provides high-value guidelines to the dean board during curriculum modernization cycles.
                  </p>
                  <div className="p-3 bg-gray-50/5 border border-gray-100/5 rounded-xl text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-astu-green">verified</span>
                    <span className="font-semibold text-gray-600">Verified ASTU Academic Records Integration Active</span>
                  </div>
                </section>
              </div>

            </div>
          )}

          {activeTab === 'profile' && (
            <CompanyProfileTab
              profile={profile}
              onSave={handleSaveProfile}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'post_job' && (
            <JobPostingTab
              jobs={jobs}
              onPostJob={handlePostJob}
              onToggleJobStatus={handleToggleJobStatus}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'candidates' && (
            <ApplicationsTab
              applications={applications}
              onUpdateStatus={handleUpdateApplicationStatus}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'search_talent' && (
            <TalentSearchTab
              darkMode={darkMode}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackTab
              feedbacks={feedbacks}
              onSubmitFeedback={handleRegisterFeedback}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'chat' && (
            <MessagingTab
              messages={messages}
              onSendMessage={handleSendMessage}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              darkMode={darkMode}
            />
          )}
        </div>

      </main>
    </div>
  );
};

export default EmployerDashboard;
