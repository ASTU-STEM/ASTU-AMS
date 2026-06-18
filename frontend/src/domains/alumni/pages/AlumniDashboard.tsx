import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import HelpCenter from '../../../shared/components/HelpCenter';
import TelebirrDonationModal from '../../../shared/components/TelebirrDonationModal';
import AiAssistant from '../../../shared/components/AiAssistant';
import { surveyService } from '../../surveys/services/survey.service';
import { notificationService } from '../../notifications/services/notification.service';

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

import { alumniService, calculateCompletion } from '../services/alumni.service';

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
import { SystemDocumentationTab } from '../components/SystemDocumentationTab';

import { NAV_ITEMS, COMM_ITEMS, MANAGEMENT_ACTIONS, STATS_CONFIG } from '../config/alumni.config';

const AlumniDashboard = () => {
   const navigate = useNavigate();
   const { logout } = useAuth();

   const [activeTab, setActiveTab] = useState<string>('dashboard');
   const [hoveredCard, setHoveredCard] = useState<number | null>(null);
   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('alumni_sidebar_collapsed') === 'true');
   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
   const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [profile, setProfile] = useState<AlumniProfile>({} as AlumniProfile);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [surveys, setSurveys] = useState<TracerSurvey[]>([]);
  const [realPendingSurveysCount, setRealPendingSurveysCount] = useState<number>(0);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [events, setEvents] = useState<CareerEvent[]>([]);
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [preferences, setPreferences] = useState<AlumniPreferences>({} as AlumniPreferences);

  const [selectedJobForModal, setSelectedJobForModal] = useState<JobMatch | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [donationCampaign, setDonationCampaign] = useState<{ title: string; category: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const profileCompletion = calculateCompletion(profile);
  const pendingSurveysCount = realPendingSurveysCount;
  const matchCount = jobs.filter(j => !j.applied).length;
  const connectedMentorsCount = mentors.filter(m => m.status === 'ACCEPTED' || m.status === 'PENDING').length;

  const stats = STATS_CONFIG.map((cfg, i) => ({
    id: i + 1,
    label: cfg.label,
    value: cfg.label === 'Profile Status' ? `${profileCompletion}%`
         : cfg.label === 'Job Matches' ? `${matchCount}`
         : cfg.label === 'Pending Surveys' ? `${pendingSurveysCount}`
         : `${connectedMentorsCount}`,
    color: cfg.color,
    icon: cfg.icon,
    bgGradient: cfg.bgGradient,
    trend: cfg.label === 'Pending Surveys' && pendingSurveysCount > 0 ? 'Urgent Tracer studies'
         : cfg.label === 'Pending Surveys' ? 'All studies submitted'
         : cfg.trend,
    trendIcon: cfg.label === 'Pending Surveys' && pendingSurveysCount > 0 ? 'schedule'
             : cfg.label === 'Pending Surveys' ? 'check_circle'
             : cfg.trendIcon,
    trendColor: cfg.label === 'Pending Surveys' && pendingSurveysCount > 0 ? cfg.trendColor : 'astu-green',
  }));

  const handleSaveProfile = async (updatedProfile: AlumniProfile) => {
    setProfile(updatedProfile);
    try {
      await alumniService.updateProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to save profile', err);
    }
  };

  const handleUpdateEmploymentStatus = async (employmentStatus: string, salary: number) => {
    const updatedProfile = { ...profile, employmentStatus: employmentStatus as 'EMPLOYED' | 'UNEMPLOYED' | 'SELF_EMPLOYED', salary };
    setProfile(updatedProfile);
    try {
      await alumniService.updateProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to update employment status', err);
    }
  };

  const handleApplyJob = (jobId: string) => {
    const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, applied: true, applicationStatus: 'PENDING' as const } : j);
    setJobs(updatedJobs);
    const appliedJob = jobs.find(j => j.id === jobId);
    if (appliedJob) {
      toast.success(`Application sent to ${appliedJob.company}!`);
      setNotifications(prev => [{ id: Date.now(), text: `Applied for ${appliedJob.title} at ${appliedJob.company}.`, unread: true, time: 'Just now' }, ...prev]);
    }
  };

  const handleToggleSaveJob = (jobId: string) => {
    const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, saved: !j.saved } : j);
    setJobs(updatedJobs);
  };

  const handleCompleteSurvey = (surveyId: string, answers: Record<string, string>) => {
    const updatedSurveys = surveys.map(s => s.id === surveyId ? { ...s, status: 'COMPLETED' as const, completedAt: new Date().toLocaleDateString() } : s);
    setSurveys(updatedSurveys);
    setNotifications(prev => [{ id: Date.now(), text: `Submitted Tracer Survey: ${surveys.find(s => s.id === surveyId)?.title}.`, unread: true, time: 'Just now' }, ...prev]);
  };

  const handleRegisterEvent = (eventId: string) => {
    const updatedEvents = events.map(e => e.id === eventId ? { ...e, registered: true } : e);
    setEvents(updatedEvents);
    setNotifications(prev => [{ id: Date.now(), text: `Registered for event: ${events.find(e => e.id === eventId)?.title}.`, unread: true, time: 'Just now' }, ...prev]);
  };

  const handleRequestMentorship = (mentorId: string) => {
    const updatedMentors = mentors.map(m => m.id === mentorId ? { ...m, status: 'PENDING' as const } : m);
    setMentors(updatedMentors);
    setNotifications(prev => [{ id: Date.now(), text: `Requested mentorship connection with ${mentors.find(m => m.id === mentorId)?.name}.`, unread: true, time: 'Just now' }, ...prev]);
  };

  const handleScheduleSession = (mentorId: string, sessionDetails: Omit<MentorshipSession, 'id' | 'status' | 'meetLink'>) => {
    const updatedMentors = mentors.map(m => {
      if (m.id === mentorId) {
        const nextSessionId = String((m.sessions?.length || 0) + 1);
        return { ...m, sessions: [...(m.sessions || []), { id: nextSessionId, ...sessionDetails, status: 'SCHEDULED' as const, meetLink: `https://meet.google.com/astu-mentor-${mentorId}-${nextSessionId}` }] };
      }
      return m;
    });
    setMentors(updatedMentors);
    setNotifications(prev => [{ id: Date.now(), text: `Scheduled mentorship session with ${mentors.find(m => m.id === mentorId)?.name}.`, unread: true, time: 'Just now' }, ...prev]);
  };

  const handleRequestDocument = async (documentType: DocumentRequest['documentType'], notes?: string) => {
    const newDoc: DocumentRequest = { id: String(documents.length + 1), documentType, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'PENDING', notes: notes || 'Awaiting registrar verification.', fileUrls: [] };
    setDocuments([newDoc, ...documents]);
    setNotifications(prev => [{ id: Date.now(), text: `Submitted official request for: ${documentType}.`, unread: true, time: 'Just now' }, ...prev]);
    try {
      await alumniService.createDocumentRequest({ documentType, additionalInstructions: notes });
    } catch (err) {
      console.error('Failed to submit document request', err);
    }
  };

  const handleSavePreferences = async (updatedPrefs: AlumniPreferences) => {
    setPreferences(updatedPrefs);
    try {
      await alumniService.updatePreferences(updatedPrefs);
    } catch (err) {
      console.error('Failed to save preferences', err);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      const data = await notificationService.getMyNotifications();
      setNotifications((data || []).map((n: any) => ({
        id: n.id,
        text: n.content,
        unread: !n.isRead,
        time: new Date(n.createdAt).toLocaleDateString()
      })));
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const handleClearNotification = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      const data = await notificationService.getMyNotifications();
      setNotifications((data || []).map((n: any) => ({
        id: n.id,
        text: n.content,
        unread: !n.isRead,
        time: new Date(n.createdAt).toLocaleDateString()
      })));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => { setMenuOpen(false); setNotificationOpen(false); setMobileSidebarOpen(false); }, [activeTab]);
  useEffect(() => { localStorage.setItem('alumni_sidebar_collapsed', String(sidebarCollapsed)); }, [sidebarCollapsed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest('[data-admin-menu]')) setMenuOpen(false);
      if (target && !target.closest('[data-admin-notifications]')) setNotificationOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPendingSurveys = async () => {
      try {
        const data = await surveyService.getMySurveys();
        const pending = data.filter((item: any) => item.status === 'PENDING' || item.status === 'IN_PROGRESS').length;
        setRealPendingSurveysCount(pending);
        
        let historyData: any[] = [];
        try {
          historyData = await surveyService.getMyHistory();
        } catch (err) {
          console.error('Failed to load history surveys', err);
        }

        const allAssignments = [...data, ...historyData];
        const mappedSurveys: TracerSurvey[] = allAssignments.map((assignment: any) => {
          let surveyType: TracerSurvey['type'] = 'CUSTOM';
          const milestone = assignment.survey?.milestoneMonths;
          if (milestone === 6) surveyType = 'SIX_MONTH';
          else if (milestone === 12) surveyType = 'TWELVE_MONTH';
          else if (milestone === 24) surveyType = 'TWENTY_FOUR_MONTH';

          return {
            id: String(assignment.id),
            title: assignment.survey?.title || 'Tracer Survey',
            description: assignment.survey?.description || '',
            deadline: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '',
            status: assignment.status as TracerSurvey['status'],
            completedAt: assignment.completedAt ? new Date(assignment.completedAt).toLocaleDateString() : undefined,
            type: surveyType,
            questions: [],
            isActive: true,
            isArchived: false,
            createdAt: assignment.createdAt || new Date().toISOString(),
            updatedAt: assignment.updatedAt || new Date().toISOString(),
          };
        });
        setSurveys(mappedSurveys);
      } catch (err) {
        console.error('Failed to load pending surveys count', err);
      }
    };
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getMyNotifications();
        setNotifications((data || []).map((n: any) => ({
          id: n.id,
          text: n.content,
          unread: !n.isRead,
          time: new Date(n.createdAt).toLocaleDateString()
        })));
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };
    fetchPendingSurveys();
    fetchNotifications();
  }, [activeTab]);

  const menu = (
    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="px-3 py-3">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{profile?.fullName || 'Alumni User'}</div>
        <div className="mt-1">
          <span className="inline-flex items-center rounded-md bg-[#003366]/10 px-2 py-0.5 text-xs font-medium text-[#003366] border border-[#003366]/15">Alumni</span>
        </div>
      </div>
      <div className="my-1 h-px bg-[var(--border-color)]" />
      <button type="button" onClick={() => { setMenuOpen(false); setActiveTab('profile'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]">
        <User className="h-4 w-4" /> My Profile
      </button>
      <button type="button" onClick={() => { setMenuOpen(false); setActiveTab('settings'); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]">
        <Settings className="h-4 w-4" /> Settings
      </button>
      <button type="button" onClick={() => { setMenuOpen(false); setHelpOpen(true); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]">
        <HelpCircle className="h-4 w-4" /> Help
      </button>
      <div className="my-1 h-px bg-[var(--border-color)]" />
      <button type="button" onClick={() => { setMenuOpen(false); handleLogout(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E24B4A] hover:bg-rose-50">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          25% { transform: translateY(-15px) translateX(8px); opacity: 0.6; }
          50% { transform: translateY(-8px) translateX(-4px); opacity: 0.3; }
          75% { transform: translateY(-22px) translateX(12px); opacity: 0.5; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glow-soft {
          0%, 100% { box-shadow: 0 0 8px rgba(0,51,102,0.08); }
          50% { box-shadow: 0 0 20px rgba(0,51,102,0.15); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .sidebar-particle {
          animation: float-particle 6s ease-in-out infinite;
        }
        .sidebar-particle:nth-child(2) { animation-delay: 2s; animation-duration: 8s; }
        .sidebar-particle:nth-child(3) { animation-delay: 4s; animation-duration: 7s; }
        .nav-btn {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nav-btn:hover {
          transform: translateX(3px);
        }
      `}</style>

      {mobileSidebarOpen && (
        <button type="button" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden" />
      )}

      <aside className={`fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col overflow-hidden shadow-2xl transition-all duration-300 md:translate-x-0 bg-gradient-to-b from-[#001a33] via-[#002a55] to-[#003366] ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_0%,transparent_40%,rgba(0,107,60,0.04)_60%,transparent_100%)] bg-[length:400%_400%] animate-[gradient-shift_8s_ease_infinite]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-emerald-400/30 sidebar-particle" />
          <div className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/25 sidebar-particle" />
          <div className="absolute bottom-[30%] left-[30%] w-2.5 h-2.5 rounded-full bg-blue-400/20 sidebar-particle" />
        </div>

        <div className="relative z-10 p-5 border-b border-white/10">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15 shadow-lg">
                <img alt="ASTU Logo" className="h-8 w-8 object-contain rounded-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#001a33] shadow-lg animate-pulse" />
            </div>
            {!sidebarCollapsed && <div>
              <h1 className="text-base font-extrabold text-white tracking-tight">ASTU Alumni</h1>
              <p className="text-[9px] text-emerald-400 uppercase tracking-[0.2em] font-extrabold">Management System</p>
            </div>}
          </div>
        </div>

        <nav className="relative z-10 flex-grow px-3 py-4 overflow-y-auto scrollbar-thin">
          {!sidebarCollapsed && <p className="px-3 mb-2 text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Main Menu</p>}
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${activeTab === item.id
                  ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'} relative`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.id === 'surveys' && realPendingSurveysCount > 0 && sidebarCollapsed && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#001a33] animate-pulse" />
                  )}
                </span>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {item.id === 'surveys' && realPendingSurveysCount > 0 && !sidebarCollapsed && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#CC0033] flex items-center justify-center text-[9px] font-extrabold text-white shadow-md">
                    {realPendingSurveysCount}
                  </span>
                )}
                {activeTab === item.id && !sidebarCollapsed && (item.id !== 'surveys' || realPendingSurveysCount === 0) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
            ))}
          </div>

          {!sidebarCollapsed && <p className="px-3 mt-5 mb-2 text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">Communication</p>}
          <div className="space-y-0.5">
            {COMM_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${activeTab === item.id
                  ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${activeTab === item.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/40 group-hover:text-white/70'}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </span>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {item.badge && !sidebarCollapsed && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#CC0033] flex items-center justify-center text-[9px] font-extrabold text-white shadow-md">{item.badge}</span>
                )}
                {activeTab === item.id && !item.badge && !sidebarCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            ))}
          </div>
        </nav>

        <div className="relative z-10 p-4 border-t border-white/10 space-y-1">
          <button onClick={() => setHelpOpen(true)} className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`} title={sidebarCollapsed ? 'Help Center' : undefined}>
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40 group-hover:text-white/70 material-symbols-outlined">help</span>
            {!sidebarCollapsed && (
              <>
                <span className="text-sm font-medium">Help Center</span>
                <span className="ml-auto text-[8px] text-white/20 font-bold px-1.5 py-0.5 bg-white/5 rounded border border-white/10">v1.4</span>
              </>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">Help Center</div>
            )}
          </button>
          <button onClick={() => setAiAssistantOpen(true)} className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`} title={sidebarCollapsed ? 'AI Assistant' : undefined}>
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40 group-hover:text-white/70 material-symbols-outlined">smart_toy</span>
            {!sidebarCollapsed && (
              <>
                <span className="text-sm font-medium">AI Assistant</span>
                <span className="ml-auto text-[8px] text-emerald-400/80 font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">NEW</span>
              </>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">AI Assistant</div>
            )}
          </button>
          <button onClick={handleLogout} className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left group ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`} title={sidebarCollapsed ? 'Logout' : undefined}>
            <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 material-symbols-outlined">logout</span>
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">Logout</div>
            )}
          </button>
        </div>
      </aside>

      <div className={`min-h-screen transition-[margin-left] duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <header
          className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-6"
          style={{
            background: 'var(--bg-navbar)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setSidebarCollapsed((v) => !v)}
              className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:inline-flex"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <Menu className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => { setSidebarCollapsed(false); setMobileSidebarOpen(true); }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                <span>Alumni</span>
                <span>/</span>
                <span className="text-[var(--text-primary)] font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}</span>
              </div>
              <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="group hidden h-11 w-[420px] max-w-[36vw] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 md:flex focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
              style={{ borderColor: 'var(--border-color)' }}>
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                <Search className="h-4.5 w-4.5 flex-none" />
              </span>
              <input type="text" placeholder="Search alumni, companies, or mentors..."
                className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
                onChange={(e) => { if (activeTab === 'dashboard' && e.target.value.trim().length > 1) setActiveTab('jobs'); }} />
            </label>

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
                  <div className="max-h-60 space-y-1 overflow-y-auto p-2">
                    {notifications.length > 0 ? notifications.map((n) => (
                      <div key={n.id} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-black/5">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${n.unread ? 'bg-[#003580]' : 'bg-gray-300'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[var(--text-primary)]">{n.text}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{n.time}</p>
                        </div>
                        <button onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))} className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
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
                className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004d99] text-xs font-semibold text-white shadow-sm">
                  {profile?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AU'}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{profile?.fullName || 'Alumni User'}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Alumni</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menuOpen && menu}
            </div>
          </div>
        </header>

        <main className="h-[calc(100dvh-4rem)] overflow-y-auto overflow-x-hidden bg-[var(--bg-page)]" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
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

          {activeTab === 'management' && (
            <section className="space-y-6 p-4 md:p-6">
              <div className="relative overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#1D9E75)] p-5 text-white md:p-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFD700]/10 rounded-full translate-y-1/3 -translate-x-1/4" />
                <div className="relative z-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Alumni management</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Create and manage your alumni services</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">
                    Directory, map, business profile, startup showcase, research publications, CV builder, digital ID, volunteer programs, awards, chapters, donations, and career progress tracking.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {MANAGEMENT_ACTIONS.map((action) => (
                  <button key={action.title} onClick={() => setActiveTab(action.tab)}
                    className="group rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#003580]/30 hover:shadow-md hover:-translate-y-0.5">
                    <span className="material-symbols-outlined rounded-[8px] bg-[#003580]/10 p-2 text-[#003580] group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                    <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#003580] transition-colors">{action.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{action.desc}</p>
                    <span className="mt-4 inline-flex rounded-[8px] bg-gradient-to-r from-[#003580] to-[#004d99] px-3 py-2 text-xs font-semibold text-white shadow-sm group-hover:shadow-md transition-all">Manage / Create</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'profile' && <ProfileTab profile={profile} onSave={handleSaveProfile} />}
          {activeTab === 'career' && <CareerTab events={events} onRegisterEvent={handleRegisterEvent} />}
          {activeTab === 'surveys' && <SurveysTab />}
          {activeTab === 'jobs' && <JobsTab jobs={jobs} onViewJob={setSelectedJobForModal} onToggleSaveJob={handleToggleSaveJob} />}
          {activeTab === 'mentorship' && <MentorshipTab mentors={mentors} onRequestMentorship={handleRequestMentorship} onScheduleSession={handleScheduleSession} />}
          {activeTab === 'documents' && <DocumentServicesTab documentRequests={documents} onRequestDocument={handleRequestDocument} />}
          {activeTab === 'messages' && <MessagingTab darkMode={darkMode} />}
          {activeTab === 'settings' && <SettingsTab preferences={preferences} onSavePreferences={handleSavePreferences} />}
          {activeTab === 'system-docs' && <SystemDocumentationTab />}
          {activeTab === 'forum' && (
            <div className="space-y-6 p-4 md:p-6">
              <section className="relative overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#1d9e75)] p-5 text-white md:p-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFD700]/10 rounded-full translate-y-1/3 -translate-x-1/4" />
                <div className="relative z-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Alumni community</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Alumni Community Forum</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">
                    Connect with fellow alumni, share opportunities, and celebrate achievements together.
                  </p>
                </div>
              </section>
              <div className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-10 shadow-sm">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-5xl mb-3">forum</span>
                  <p className="text-sm font-medium">No forum posts yet</p>
                  <p className="text-xs mt-1">Posts from alumni will appear here once the community feature is live.</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'donations' && (
            <div className="space-y-6 p-4 md:p-6">
              <section className="relative overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#1d9e75,#003580)] p-5 text-white md:p-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Alumni giving</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Support ASTU's Future</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">
                    Your contributions drive scholarships, research, and infrastructure development at ASTU.
                  </p>
                </div>
              </section>
              <div className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-10 shadow-sm">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-5xl mb-3">volunteer_activism</span>
                  <p className="text-sm font-medium">No donation campaigns yet</p>
                  <p className="text-xs mt-1">Campaigns will be listed here once published by the alumni office.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <JobDetailsModal job={selectedJobForModal} onClose={() => setSelectedJobForModal(null)} onApply={handleApplyJob} />

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <AiAssistant role="alumni" isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
      <TelebirrDonationModal
        isOpen={!!donationCampaign}
        onClose={() => setDonationCampaign(null)}
        campaign={donationCampaign}
      />
    </div>
  );
};

export default AlumniDashboard;
