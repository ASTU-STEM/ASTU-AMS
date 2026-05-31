import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('employer_sidebar_collapsed') === 'true');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme Dark / Light mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Notifications Bell dropdown
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const employerManagementActions = [
    { title: 'Talent Pool Management', desc: 'Segment saved candidates by department, skill, GPA, experience, and availability.', tab: 'search_talent', icon: 'groups' },
    { title: 'AI Candidate Matching', desc: 'Rank alumni for jobs and internships using skills, location, and employer criteria.', tab: 'search_talent', icon: 'psychology' },
    { title: 'Bulk Job Posting', desc: 'Create multiple jobs or internships with shared eligibility and approval rules.', tab: 'post_job', icon: 'post_add' },
    { title: 'Internship Program', desc: 'Manage intern cohorts, supervisors, feedback, and conversion to employment.', tab: 'post_job', icon: 'school' },
    { title: 'Campus Recruitment Events', desc: 'Schedule job fairs, interviews, RSVPs, and department collaboration.', tab: 'analytics', icon: 'event_available' },
    { title: 'Candidate Shortlisting', desc: 'Review applications, move candidates to interview, and track decisions.', tab: 'candidates', icon: 'fact_check' },
  ];

  const demandSignals = [
    { label: 'Top Skill Demand', value: 'Cloud + DevOps', tone: 'text-astu-navy', icon: 'monitoring' },
    { label: 'Time to Hire', value: '18 days', tone: 'text-astu-green', icon: 'timer' },
    { label: 'Interview Queue', value: '7 candidates', tone: 'text-astu-red', icon: 'calendar_month' },
  ];

  const shortlistRate = totalApplicationsCount > 0
    ? Math.round((shortlistedApplicationsCount / totalApplicationsCount) * 100)
    : 0;

  const employerCommandSignals = [
    { label: 'Open requisitions', value: activeJobsCount.toString(), icon: 'work_history', tab: 'post_job', tone: 'text-astu-green' },
    { label: 'Pending reviews', value: pendingApplicationsCount.toString(), icon: 'rate_review', tab: 'candidates', tone: 'text-astu-red' },
    { label: 'Shortlist rate', value: `${shortlistRate}%`, icon: 'social_leaderboard', tab: 'candidates', tone: 'text-[#8A5CF6]' },
    { label: 'Feedback files', value: feedbacks.length.toString(), icon: 'fact_check', tab: 'feedback', tone: 'text-astu-navy' },
  ];

  const hiringPipeline = [
    { label: 'Views captured', value: jobs.reduce((sum, job) => sum + job.viewsCount, 0).toLocaleString(), icon: 'visibility', helper: 'Across active and archived postings' },
    { label: 'Applications received', value: totalApplicationsCount.toString(), icon: 'inbox', helper: `${pendingApplicationsCount} still need a decision` },
    { label: 'Candidates shortlisted', value: shortlistedApplicationsCount.toString(), icon: 'how_to_reg', helper: 'Ready for interviews or offer review' },
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

   const handleUpdateJob = (updatedJob: EmployerJob) => {
     const updatedJobs = jobs.map(job => 
       job.id === updatedJob.id ? updatedJob : job
     );
     setJobs(updatedJobs);
     saveEmployerJobs(updatedJobs);
   };

   const handleDeleteJob = (jobId: number) => {
     const updatedJobs = jobs.filter(job => job.id !== jobId);
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
  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EP';

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    setMenuOpen(false);
    setNotificationOpen(false);
    setMobileSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('employer_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest('[data-admin-menu]')) {
        setMenuOpen(false);
      }
      if (target && !target.closest('[data-admin-notifications]')) {
        setNotificationOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menu = (
    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="px-3 py-3">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{profile.name}</div>
        <div className="mt-1">
          <span className="inline-flex items-center rounded-md bg-[#003366]/10 px-2 py-0.5 text-xs font-medium text-[#003366] border border-[#003366]/15">Employer</span>
        </div>
      </div>
      <div className="my-1 h-px bg-[var(--border-color)]" />
      <button
        type="button"
        onClick={() => { setMenuOpen(false); setActiveTab('profile'); }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
      >
        <User className="h-4 w-4" />
        Company Profile
      </button>
      <button
        type="button"
        onClick={() => { setMenuOpen(false); toast('Settings panel coming soon.'); }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>
      <button
        type="button"
        onClick={() => { setMenuOpen(false); toast('Help center coming soon.'); }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </button>
      <div className="my-1 h-px bg-[var(--border-color)]" />
      <button
        type="button"
        onClick={() => { setMenuOpen(false); handleLogout(); }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E24B4A] hover:bg-rose-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

return (
    <div className="min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
      <Toaster position="top-right" reverseOrder={false} />

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col overflow-hidden shadow-2xl transition-all duration-300 md:translate-x-0 bg-gradient-to-b from-[#003366] via-[#002a55] to-[#001a3a] ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        {/* Sidebar Logo Section */}
        <div className="p-5 border-b border-white/10">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-lg">
                <img
                  alt="ASTU Logo"
                  className="h-8 w-8 object-contain rounded-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#003366]"></div>
            </div>
            {!sidebarCollapsed && <div>
              <h1 className="text-base font-extrabold text-white tracking-tight">ASTU Employer</h1>
              <p className="text-[9px] text-emerald-400 uppercase tracking-[0.2em] font-extrabold">Recruitment Hub</p>
            </div>}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow px-3 py-4 overflow-y-auto">
          {!sidebarCollapsed && <p className="px-3 mb-2 text-[10px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Recruiting</p>}
          <div className="space-y-0.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { id: 'management', label: 'Management Hub', icon: 'dashboard_customize' },
              { id: 'post_job', label: 'Job Scaffolder', icon: 'work' },
              { id: 'candidates', label: 'Applications', icon: 'description' },
              { id: 'search_talent', label: 'Talent Search', icon: 'search' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${
                  activeTab === item.id
                    ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'
                }`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </span>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {activeTab === item.id && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                )}
              </button>
            ))}
          </div>

          {!sidebarCollapsed && <p className="px-3 mt-5 mb-2 text-[10px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Management</p>}
          <div className="space-y-0.5">
            {[
              { id: 'feedback', label: 'Feedbacks', icon: 'rate_review' },
              { id: 'chat', label: 'Messages', badge: '2', icon: 'forum' },
              { id: 'analytics', label: 'Analytics', icon: 'analytics' },
              { id: 'profile', label: 'Company Profile', icon: 'business' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${
                  activeTab === item.id
                    ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'
                }`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </span>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {item.badge && !sidebarCollapsed && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#CC0033] flex items-center justify-center text-[10px] font-extrabold text-white shadow-md">
                    {item.badge}
                  </span>
                )}
                {activeTab === item.id && !item.badge && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
<div className="p-4 border-t border-white/10 space-y-1">
          <button
            onClick={() => { toast('Help center coming soon.'); }}
            title={sidebarCollapsed ? 'Help Center' : undefined}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
          >
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/70">
              <span className="material-symbols-outlined w-4 h-4">help</span>
            </span>
            {!sidebarCollapsed && <span className="text-sm font-medium">Help Center</span>}
          </button>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
          >
            <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20">
              <span className="material-symbols-outlined w-4 h-4">logout</span>
            </span>
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`min-h-screen transition-[margin-left] duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

        {/* Header Section - Admin Layout Style */}
        <header
          className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-6"
          style={{
            background: 'var(--bg-navbar)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:inline-flex"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSidebarCollapsed(false);
                setMobileSidebarOpen(true);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                <span>Employer</span>
                <span>/</span>
                <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}</span>
              </div>
              <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <label
              className="group hidden h-11 w-[420px] max-w-[36vw] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 md:flex focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                <Search className="h-4.5 w-4.5 flex-none" />
              </span>
              <input
                type="text"
                placeholder="Search candidates, departments, or postings..."
                className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab === 'dashboard' && e.target.value.trim().length > 1) {
                    setActiveTab('search_talent');
                  }
                }}
              />
            </label>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                setDarkMode(!darkMode);
                toast.success(darkMode ? 'Light Theme activated!' : 'Premium Dark Theme activated!');
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative" data-admin-notifications>
              <button
                type="button"
                onClick={() => setNotificationOpen((v) => !v)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              {notificationOpen && (
                <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                  <div className="border-b border-[var(--border-color)] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">Notifications</div>
                        <div className="text-xs text-[var(--text-secondary)]">Recent updates</div>
                      </div>
                      <button
                        onClick={handleClearAllNotifications}
                        className="text-xs font-semibold text-[#E24B4A] hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 p-2">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-black/5">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notif.unread ? 'bg-[#003580]' : 'bg-gray-300'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[var(--text-primary)]">{notif.text}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{notif.time}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveNotification(notif.id)}
                          className="flex-shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="px-2 py-6 text-center text-sm text-[var(--text-secondary)]">No new recruit alerts.</p>
                    )}
                  </div>
                  <div className="border-t border-[var(--border-color)] px-4 py-3">
                    <button type="button" className="text-sm font-semibold text-[#003580] hover:underline">
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" data-admin-menu>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#003580] text-xs font-semibold text-white">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{profile.name}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">HR Manager</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menuOpen && menu}
            </div>
          </div>
        </header>

{/* Main Content */}
         <main className="h-[calc(100dvh-4rem)] overflow-y-auto overflow-x-hidden bg-[var(--bg-page)]" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
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

              <section className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Employer Command Center</h3>
                    <p className="mt-1 text-xs text-gray-500">One clear snapshot for hiring, review queues, curriculum feedback, and recruiter follow-up.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="inline-flex items-center gap-1.5 rounded-md bg-astu-navy px-3 py-2 text-xs font-bold text-white transition-all hover:bg-astu-navy/90"
                  >
                    <span className="material-symbols-outlined text-base">analytics</span>
                    Open analytics
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
                  <div className="grid grid-cols-2 gap-3">
                    {employerCommandSignals.map((signal) => (
                      <button
                        key={signal.label}
                        onClick={() => setActiveTab(signal.tab)}
                        className={`rounded-[10px] border p-4 text-left transition-all hover:border-astu-navy/30 hover:shadow-sm ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{signal.label}</p>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold">{signal.value}</p>
                      </button>
                    ))}
                  </div>
                  <div className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-white'}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-bold">Hiring Pipeline Health</h4>
                      <span className="rounded-md bg-astu-green/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-astu-green">Live</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {hiringPipeline.map((item) => (
                        <div key={item.label} className={`rounded-[10px] border p-3 ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-gray-200 bg-gray-50'}`}>
                          <span className="material-symbols-outlined text-astu-navy">{item.icon}</span>
                          <p className="mt-2 text-xl font-extrabold">{item.value}</p>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{item.label}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{item.helper}</p>
                        </div>
                      ))}
                    </div>
                  </div>
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

          {activeTab === 'management' && (
            <section className="space-y-6 p-4 md:p-6">
              <div className="rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#233876,#1D9E75)] p-5 text-white md:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Employer management</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Create jobs, internships, events, and candidate pipelines</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">
                  Talent pools, AI matching, recruitment analytics, bulk posting, internship programs, verification, campus events, shortlisting, and job fair participation.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {employerManagementActions.map((action) => (
                  <button key={action.title} onClick={() => setActiveTab(action.tab)} className={`rounded-[10px] border p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/30 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
                    <span className="material-symbols-outlined rounded-[8px] bg-[#003580]/10 p-2 text-[#003580]">{action.icon}</span>
                    <h3 className="mt-4 text-sm font-semibold">{action.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{action.desc}</p>
                    <span className="mt-4 inline-flex rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white">Manage / Create</span>
                  </button>
                ))}
              </div>
            </section>
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
               onUpdateJob={handleUpdateJob}
               onDeleteJob={handleDeleteJob}
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
        </main>
      </div>
    </div>
  );
};

export default EmployerDashboard;
