import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import HelpCenter from '../../../shared/components/HelpCenter';
import { AiAssistant } from '../../ai/components/AiAssistant';

import {
  CompanyProfile,
  EmployerJob,
  CandidateApplication,
  GraduateFeedback,
} from '../types/employer.types';

import { employerService } from '../services/employer.service';

import { CompanyProfileTab } from '../components/CompanyProfileTab';
import { JobPostingTab } from '../components/JobPostingTab';
import { ApplicationsTab } from '../components/ApplicationsTab';
import { TalentSearchTab } from '../components/TalentSearchTab';
import { FeedbackTab } from '../components/FeedbackTab';

const EmployerDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('employer_sidebar_collapsed') === 'true');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; text: string; unread: boolean; time: string }>>([]);

  const [profile, setProfile] = useState<CompanyProfile>(() => ({
    companyName: '',
    industry: '',
    location: '',
    hrContact: '',
    contactEmail: '',
    phone: '',
  }));
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [feedbacks, setFeedbacks] = useState<GraduateFeedback[]>([]);

  const activeJobsCount = jobs.filter(j => j.status === 'PUBLISHED').length;
  const pendingApplicationsCount = applications.filter(a => a.status === 'PENDING').length;
  const shortlistedApplicationsCount = applications.filter(a => a.status === 'SHORTLISTED').length;
  const totalApplicationsCount = applications.length;

  const stats = [
    {
      id: 1, label: 'Active Job Posts', value: `${activeJobsCount}`,
      color: 'astu-navy', icon: 'work', bgGradient: 'from-blue-50 to-indigo-50',
      trend: '', trendIcon: 'trending_up', trendColor: 'astu-green',
    },
    {
      id: 2, label: 'Total Applications', value: `${totalApplicationsCount}`,
      color: 'astu-green', icon: 'description', bgGradient: 'from-emerald-50 to-green-50',
      trend: `${pendingApplicationsCount} pending review`, trendIcon: 'mail', trendColor: 'astu-green',
    },
    {
      id: 3, label: 'Shortlisted Candidates', value: `${shortlistedApplicationsCount}`,
      color: 'astu-red', icon: 'check_circle', bgGradient: 'from-red-50 to-orange-50',
      trend: '', trendIcon: 'schedule', trendColor: 'astu-red',
    },
    {
      id: 4, label: 'Total Feedback Audits', value: `${feedbacks.length}`,
      color: 'purple-600', icon: 'rate_review', bgGradient: 'from-purple-50 to-pink-50',
      trend: '', trendIcon: 'assignment_turned_in', trendColor: 'astu-green',
    },
  ];

  const shortlistRate = totalApplicationsCount > 0
    ? Math.round((shortlistedApplicationsCount / totalApplicationsCount) * 100)
    : 0;

  const commandSignals = [
    { label: 'Open requisitions', value: activeJobsCount.toString(), icon: 'work_history', tab: 'post_job', tone: 'text-astu-green' },
    { label: 'Pending reviews', value: pendingApplicationsCount.toString(), icon: 'rate_review', tab: 'candidates', tone: 'text-astu-red' },
    { label: 'Shortlist rate', value: `${shortlistRate}%`, icon: 'social_leaderboard', tab: 'candidates', tone: 'text-[#8A5CF6]' },
    { label: 'Feedback files', value: feedbacks.length.toString(), icon: 'fact_check', tab: 'feedback', tone: 'text-astu-navy' },
  ];

  const handleSaveProfile = (updatedProfile: CompanyProfile) => {
    setProfile(updatedProfile);
  };

  const handlePostJob = (newJobDetails: Omit<EmployerJob, 'id' | 'createdAt' | 'updatedAt' | 'applicationsCount' | 'shortlistedCount' | 'viewsCount' | 'postedDate'>) => {
    const now = new Date().toISOString();
    const nextJobId = Date.now().toString();
    const newJob: EmployerJob = {
      id: nextJobId,
      ...newJobDetails,
      createdAt: now,
      updatedAt: now,
      postedDate: 'Just now',
      applicationsCount: 0,
      shortlistedCount: 0,
      viewsCount: 1,
    };
    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
  };

  const handleToggleJobStatus = (jobId: string) => {
    const updatedJobs = jobs.map(j =>
      j.id === jobId
        ? { ...j, status: (j.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED') as EmployerJob['status'] }
        : j,
    );
    setJobs(updatedJobs);
  };

  const handleUpdateJob = (updatedJob: EmployerJob) => {
    const updatedJobs = jobs.map(job => job.id === updatedJob.id ? updatedJob : job);
    setJobs(updatedJobs);
  };

  const handleDeleteJob = (jobId: string) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    setJobs(updatedJobs);
  };

  const handleUpdateApplicationStatus = (appId: string, status: CandidateApplication['status']) => {
    const updatedApps = applications.map(app => app.id === appId ? { ...app, status } : app);
    setApplications(updatedApps);
  };

  const handleRegisterFeedback = (feedbackDetails: Omit<GraduateFeedback, 'id' | 'createdAt'>) => {
    const nextFbId = Date.now().toString();
    const newFb: GraduateFeedback = {
      id: nextFbId,
      ...feedbackDetails,
      createdAt: new Date().toISOString(),
    };
    const updatedFb = [newFb, ...feedbacks];
    setFeedbacks(updatedFb);
  };

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;
  const initials = profile.companyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EP';

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, jobsData, appsData, feedbackData] = await Promise.all([
          employerService.getProfile().catch(() => null),
          employerService.getJobs().catch(() => [] as EmployerJob[]),
          employerService.getApplications().catch(() => [] as CandidateApplication[]),
          employerService.getFeedback().catch(() => [] as GraduateFeedback[]),
        ]);
        if (profileData) setProfile(profileData);
        if (jobsData && jobsData.length > 0) setJobs(jobsData);
        if (appsData && appsData.length > 0) setApplications(appsData);
        if (feedbackData && feedbackData.length > 0) setFeedbacks(feedbackData);
      } catch {}
    };
    loadData();
  }, []);

  useEffect(() => { setMenuOpen(false); setNotificationOpen(false); setMobileSidebarOpen(false); }, [activeTab]);
  useEffect(() => { localStorage.setItem('employer_sidebar_collapsed', String(sidebarCollapsed)); }, [sidebarCollapsed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest('[data-admin-menu]')) setMenuOpen(false);
      if (target && !target.closest('[data-admin-notifications]')) setNotificationOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); window.location.href = '/login'; };

  const menu = (
    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="px-3 py-3">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{profile.companyName}</div>
        <div className="mt-1"><span className="inline-flex items-center rounded-md bg-[#003366]/10 px-2 py-0.5 text-xs font-medium text-[#003366] border border-[#003366]/15">Employer</span></div>
      </div>
      <div className="my-1 h-px bg-[var(--border-color)]" />
      <button type="button" onClick={() => { setMenuOpen(false); setActiveTab('profile'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]">
        <span className="material-symbols-outlined text-lg">business</span> Company Profile
      </button>
      <div className="my-1 h-px bg-[var(--border-color)]" />
      <button type="button" onClick={() => { setMenuOpen(false); handleLogout(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E24B4A] hover:bg-rose-50">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null },
    { id: 'profile', label: 'Company Profile', icon: 'business', badge: null },
    { id: 'post_job', label: 'Job Scaffolder', icon: 'work', badge: activeJobsCount > 0 ? activeJobsCount : null },
    { id: 'candidates', label: 'Applications', icon: 'description', badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : null },
    { id: 'search_talent', label: 'Talent Search', icon: 'search', badge: null },
    { id: 'feedback', label: 'Feedbacks', icon: 'rate_review', badge: feedbacks.length > 0 ? feedbacks.length : null },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
      <style>{`
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes float-particle { 0%,100% { transform:translateY(0) translateX(0); opacity:0.3; } 25% { transform:translateY(-15px) translateX(8px); opacity:0.5; } 50% { transform:translateY(-8px) translateX(-4px); opacity:0.2; } 75% { transform:translateY(-22px) translateX(12px); opacity:0.4; } }
        .sidebar-particle { animation: float-particle 6s ease-in-out infinite; }
        .sidebar-particle:nth-child(2) { animation-delay: 2s; animation-duration: 8s; }
        .sidebar-particle:nth-child(3) { animation-delay: 4s; animation-duration: 7s; }
        .nav-btn { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .nav-btn:hover { transform: translateX(3px); }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
      `}</style>

      {mobileSidebarOpen && (
        <button type="button" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden" />
      )}

      <aside className={`fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col overflow-hidden shadow-2xl transition-all duration-300 md:translate-x-0 bg-gradient-to-b from-[#003366] via-[#002a55] to-[#001a3a] ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_0%,transparent_40%,rgba(0,107,60,0.04)_60%,transparent_100%)] bg-[length:400%_400%] animate-[gradient-shift_8s_ease_infinite] pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-emerald-400/30 sidebar-particle" />
          <div className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/25 sidebar-particle" />
          <div className="absolute bottom-[30%] left-[30%] w-2.5 h-2.5 rounded-full bg-blue-400/20 sidebar-particle" />
        </div>

        <div className="relative z-10 p-5 border-b border-white/10">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-lg">
                <img alt="ASTU Logo" className="h-8 w-8 object-contain rounded-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#003366] shadow-lg animate-pulse" />
            </div>
            {!sidebarCollapsed && <div>
              <h1 className="text-base font-extrabold text-white tracking-tight">ASTU Employer</h1>
              <p className="text-[9px] text-emerald-400 uppercase tracking-[0.2em] font-extrabold">Recruitment Hub</p>
            </div>}
          </div>
        </div>

        <nav className="relative z-10 flex-grow px-3 py-4 overflow-y-auto scrollbar-thin">
          {!sidebarCollapsed && <p className="px-3 mb-2 text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Recruiting</p>}
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${activeTab === item.id ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm ring-1 ring-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-extrabold ring-1 ring-rose-500/30 shadow-lg">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                    {activeTab === item.id && !item.badge && <div className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="relative z-10 p-4 border-t border-white/10">
          <button onClick={() => setHelpOpen(true)}
            className="nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left group gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/70 material-symbols-outlined">help</span>
            {!sidebarCollapsed && <span className="text-sm font-medium">Help Center</span>}
          </button>
          <button onClick={() => setAiAssistantOpen(true)}
            className="nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left group gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/70 material-symbols-outlined">smart_toy</span>
            {!sidebarCollapsed && <><span className="text-sm font-medium">AI Assistant</span><span className="ml-auto text-[8px] text-emerald-400/80 font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">NEW</span></>}
          </button>
          <button onClick={handleLogout}
            className="nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 text-left group gap-3">
            <span className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 material-symbols-outlined text-rose-400/70 group-hover:text-rose-400">logout</span>
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <div className={`min-h-screen transition-[margin-left] duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-6"
          style={{ background: 'var(--bg-navbar)', borderColor: 'var(--border-color)' }}>
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setSidebarCollapsed((v) => !v)}
              className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:inline-flex" title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <Menu className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => { setSidebarCollapsed(false); setMobileSidebarOpen(true); }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                <span>Employer</span><span>/</span><span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}</span>
              </div>
              <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => { setDarkMode(!darkMode); toast.success(darkMode ? 'Light theme activated' : 'Dark theme activated'); }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5" aria-label="Toggle dark mode">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="relative" data-admin-notifications>
              <button type="button" onClick={() => setNotificationOpen((v) => !v)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5">
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white">{unreadNotificationsCount}</span>
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
                      <button onClick={() => setNotifications([])} className="text-xs font-semibold text-[#E24B4A] hover:underline">Clear All</button>
                    </div>
                  </div>
                  <div className="space-y-1 p-2">
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div key={notif.id} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-black/5">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notif.unread ? 'bg-[#003580]' : 'bg-gray-300'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[var(--text-primary)]">{notif.text}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{notif.time}</p>
                        </div>
                        <button onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== notif.id))} className="flex-shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )) : <p className="px-2 py-6 text-center text-sm text-[var(--text-secondary)]">No notifications</p>}
                  </div>
                  <div className="border-t border-[var(--border-color)] px-4 py-3">
                    <button type="button" className="text-sm font-semibold text-[#003580] hover:underline">View all →</button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" data-admin-menu>
              <button type="button" onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#003580] text-xs font-semibold text-white">{initials}</div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{profile.companyName}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">HR Manager</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menuOpen && menu}
            </div>
          </div>
        </header>

        <main className="h-[calc(100dvh-4rem)] overflow-y-auto overflow-x-hidden bg-[var(--bg-page)]" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
          {activeTab === 'dashboard' && (
            <div className="space-y-6 p-4 md:p-6">
              <section className="rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#233876,#1D9E75)] p-5 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div className="max-w-2xl space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">ASTU corporate network</span>
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Welcome back, {profile.companyName || 'Employer'}</h2>
                    <p className="text-sm leading-relaxed text-white/85">
                      Your current vacancy listings have collected <span className="font-bold text-astu-green">{totalApplicationsCount} candidate files</span>.
                      Complete your graduate feedback forms to help align our technical curricula with industry standards.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('post_job')}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#E24B4A] px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm transition-all hover:bg-[#c94140]">
                    <span className="material-symbols-outlined">add</span>
                    Post Career Placement
                  </button>
                </div>
              </section>

              <section className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
                  <div className="grid grid-cols-2 gap-3">
                    {commandSignals.map((signal) => (
                      <button key={signal.label} onClick={() => setActiveTab(signal.tab)}
                        className={`rounded-[10px] border p-4 text-left transition-all hover:border-astu-navy/30 hover:shadow-sm ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{signal.label}</p>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold">{signal.value}</p>
                      </button>
                    ))}
                  </div>
                  <div className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-white'}`}>
                    <h4 className="text-sm font-bold mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setActiveTab('post_job')} className="p-3 bg-astu-navy text-white rounded-xl text-xs font-bold hover:opacity-90">Post Vacancy</button>
                      <button onClick={() => setActiveTab('candidates')} className="p-3 bg-astu-green text-white rounded-xl text-xs font-bold hover:opacity-90">Review Candidates</button>
                      <button onClick={() => setActiveTab('search_talent')} className="p-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-90">Search Talent</button>
                      <button onClick={() => setActiveTab('feedback')} className="p-3 bg-astu-red text-white rounded-xl text-xs font-bold hover:opacity-90">Submit Feedback</button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.id} onClick={() => { if (stat.id === 1) setActiveTab('post_job'); if (stat.id === 2 || stat.id === 3) setActiveTab('candidates'); if (stat.id === 4) setActiveTab('feedback'); }}
                    className={`group relative cursor-pointer overflow-hidden rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'}`}>
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2.5 rounded-xl bg-astu-navy/10 text-astu-navy">
                          <span className="material-symbols-outlined text-2xl font-bold">{stat.icon}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-extrabold text-astu-navy mt-1">{stat.value}</p>
                      </div>
                      {stat.trend && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold pt-1 border-t border-gray-100/5">
                          <span className="material-symbols-outlined text-base font-bold text-astu-green">{stat.trendIcon}</span>
                          {stat.trend}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <section className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Your Posted Positions</h3>
                    <p className="text-xs text-gray-500">Quick updates on recent vacancies</p>
                  </div>
                  <button onClick={() => setActiveTab('post_job')} className="text-xs font-bold text-astu-navy hover:underline">View All &rarr;</button>
                </div>
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.slice(0, 2).map((job) => (
                      <div key={job.id} className={`rounded-[10px] border p-4 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50/50 border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm">{job.title}</h4>
                            <p className="text-xs text-gray-500">{job.location} &bull; {job.employmentType}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-astu-navy/10 text-astu-navy text-[10px] font-extrabold rounded">{job.applicationsCount} Applied</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">work_off</span>
                    <p className="text-sm font-medium">No job postings yet</p>
                    <p className="text-xs mt-1">Create your first placement to start receiving applications.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'profile' && <CompanyProfileTab profile={profile} onSave={handleSaveProfile} darkMode={darkMode} />}
          {activeTab === 'post_job' && <JobPostingTab jobs={jobs} onPostJob={handlePostJob} onToggleJobStatus={handleToggleJobStatus} onUpdateJob={handleUpdateJob} onDeleteJob={handleDeleteJob} darkMode={darkMode} />}
          {activeTab === 'candidates' && <ApplicationsTab applications={applications} onUpdateStatus={handleUpdateApplicationStatus} darkMode={darkMode} />}
          {activeTab === 'search_talent' && <TalentSearchTab darkMode={darkMode} />}
          {activeTab === 'feedback' && <FeedbackTab feedbacks={feedbacks} onSubmitFeedback={handleRegisterFeedback} darkMode={darkMode} />}
        </main>
      </div>

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <AiAssistant role="employer" isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </div>
  );
};

export default EmployerDashboard;
