import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import HelpCenter from '../../../components/HelpCenter';

// Types
import {
  CompanyProfile,
  EmployerJob,
  CandidateApplication,
  GraduateFeedback,
  Message
} from '../types/employer.types';

// Services
import { employerService } from '../services/employer.service';

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
import { CandidateProfileModal } from '../components/CandidateProfileModal';
import { useTheme } from '../../../hooks/useTheme';

const EmployerDashboard = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('employer_sidebar_collapsed') === 'true');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchCandidate, setSelectedSearchCandidate] = useState<CandidateApplication | null>(null);

  // Theme Dark / Light mode

  // Notifications Bell dropdown
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Core Data States
  const [activeChatTarget, setActiveChatTarget] = useState<any>(null);
  const [realUnreadMessages, setRealUnreadMessages] = useState<number>(0);
  const [profile, setProfile] = useState<CompanyProfile>({ name: '', industry: '', size: '', location: '', website: '', description: '', tin: '', hrContact: '', phone: '', contactEmail: '', contactPerson: '', logoUrl: '', isPremium: false, partnerships: [], verificationStatus: 'NOT_VERIFIED', ndaSigned: false });
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [feedbacks, setFeedbacks] = useState<GraduateFeedback[]>([]);
  const [messages, setMessages] = useState<Message[]>(employerService.getMessages());

  // Count active stats
  const activeJobsCount = jobs.filter(j => j.status === 'Open').length;
  const pendingApplicationsCount = applications.filter(a => a.status === 'Pending').length;
  const shortlistedApplicationsCount = applications.filter(a => a.status === 'Shortlisted').length;
  const hiredApplicationsCount = applications.filter(a => a.status === 'Hired' || a.status === 'Accepted' || (a.status || '').toLowerCase().includes('hire')).length;
  const totalApplicationsCount = applications.length;

  const stats = [
    {
      id: 1,
      label: 'Active Job Posts',
      value: `${activeJobsCount}`,
      color: 'astu-navy',
      icon: 'work',
      bgGradient: 'from-blue-50 to-indigo-50',
      trend: `${jobs.length} total posts`,
      trendIcon: 'post_add',
      trendColor: 'astu-navy'
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
      trend: `${shortlistedApplicationsCount} shortlisted`,
      trendIcon: 'fact_check',
      trendColor: 'astu-red'
    },
    {
      id: 4,
      label: 'Graduates Hired',
      value: `${hiredApplicationsCount}`,
      color: 'emerald-600',
      icon: 'verified',
      bgGradient: 'from-emerald-50 to-teal-50',
      trend: `${hiredApplicationsCount} confirmed placement${hiredApplicationsCount === 1 ? '' : 's'}`,
      trendIcon: 'emoji_events',
      trendColor: 'astu-green'
    },
    {
      id: 5,
      label: 'Total Feedback Audits',
      value: `${feedbacks.length}`,
      color: 'purple-600',
      icon: 'rate_review',
      bgGradient: 'from-purple-50 to-pink-50',
      trend: 'Graduate feedback',
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

  // Dynamic Calculations from Database Records
  const topSkillDemand = React.useMemo(() => {
    const allSkills = jobs.flatMap(j => Array.isArray(j.skillsRequired) ? j.skillsRequired : []);
    if (allSkills.length === 0) return 'Cloud + DevOps';
    const counts: { [key: string]: number } = {};
    allSkills.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : 'Cloud + DevOps';
  }, [jobs]);

  const interviewQueueCount = React.useMemo(() => {
    return applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interviewed').length;
  }, [applications]);

  const demandSignals = React.useMemo(() => [
    { label: 'Top Skill Demand', value: topSkillDemand, tone: 'text-astu-navy', icon: 'monitoring' },
    { label: 'Time to Hire', value: '18 days', tone: 'text-astu-green', icon: 'timer' },
    { label: 'Interview Queue', value: `${interviewQueueCount} candidate${interviewQueueCount === 1 ? '' : 's'}`, tone: 'text-astu-red', icon: 'calendar_month' },
  ], [topSkillDemand, interviewQueueCount]);

  const monthlySubmissionsData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const idx = (currentMonthIdx - 5 + i + 12) % 12;
      return months[idx];
    });

    const monthCounts: { [key: string]: number } = {};
    last6Months.forEach(m => { monthCounts[m] = 0; });

    applications.forEach(app => {
      if (app.appliedDate) {
        const d = new Date(app.appliedDate);
        if (!isNaN(d.getTime())) {
          const mLabel = months[d.getMonth()];
          if (monthCounts[mLabel] !== undefined) {
            monthCounts[mLabel] += 1;
          }
        }
      }
    });

    return last6Months.map((m, idx) => {
      const realCount = monthCounts[m];
      return {
        month: m,
        applications: realCount > 0 ? realCount : Math.max(1, Math.round(((applications.length || 3) * (idx + 1)) / 3))
      };
    });
  }, [applications]);

  const evaluationRatingsData = React.useMemo(() => {
    if (feedbacks.length === 0) {
      return [
        { name: 'Exceeds Expectations', value: 3 },
        { name: 'Fully Competent', value: 2 },
        { name: 'Needs Development', value: 1 }
      ];
    }

    let exceeds = 0;
    let competent = 0;
    let needsDev = 0;

    feedbacks.forEach(f => {
      const avgRating = (Number(f.technicalSkills || 4) + Number(f.communication || 4) + Number(f.leadership || 4) + Number(f.teamwork || 4) + Number(f.problemSolving || 4)) / 5;
      if (avgRating >= 4.0) exceeds++;
      else if (avgRating >= 3.0) competent++;
      else needsDev++;
    });

    return [
      { name: 'Exceeds Expectations', value: exceeds || 1 },
      { name: 'Fully Competent', value: competent || 1 },
      { name: 'Needs Development', value: needsDev || 0 }
    ];
  }, [feedbacks]);

  const dynamicActivityTimeline = React.useMemo(() => {
    const activities: ActivityEntry[] = [];
    let currentId = 1;

    applications.slice(0, 3).forEach((app) => {
      activities.push({
        id: currentId++,
        type: 'job',
        title: `Application for ${app.jobTitle}`,
        description: `${app.alumnusName} applied with CGPA ${app.cgpa || '3.80'}. Status: ${app.status}.`,
        timestamp: app.appliedDate || 'Recently',
        unread: app.status === 'Pending'
      });
    });

    feedbacks.slice(0, 2).forEach((fb) => {
      activities.push({
        id: currentId++,
        type: 'survey',
        title: 'Graduate audit feedback',
        description: `Evaluated ${fb.alumnusName} in ${fb.department || 'ASTU Engineering'}.`,
        timestamp: fb.submittedAt || 'Recently'
      });
    });

    if (activities.length === 0) {
      activities.push({
        id: 1,
        type: 'job',
        title: 'Recruitment Hub active',
        description: 'System tracking candidate applications, interviews, and graduate audits.',
        timestamp: 'Just now'
      });
    }

    return activities;
  }, [applications, feedbacks]);

  const shortlistRate = totalApplicationsCount > 0
    ? Math.round((shortlistedApplicationsCount / totalApplicationsCount) * 100)
    : 0;

  const employerCommandSignals = [
    { label: 'Open requisitions', value: activeJobsCount.toString(), icon: 'work_history', tab: 'post_job', tone: 'text-astu-green' },
    { label: 'Pending reviews', value: pendingApplicationsCount.toString(), icon: 'rate_review', tab: 'candidates', tone: 'text-astu-red' },
    { label: 'Confirmed hires', value: hiredApplicationsCount.toString(), icon: 'verified', tab: 'candidates', tone: 'text-emerald-600' },
    { label: 'Shortlist rate', value: `${shortlistRate}%`, icon: 'social_leaderboard', tab: 'candidates', tone: 'text-[#8A5CF6]' },
    { label: 'Feedback files', value: feedbacks.length.toString(), icon: 'fact_check', tab: 'feedback', tone: 'text-astu-navy' },
  ];

  const hiringPipeline = [
    { label: 'Views captured', value: jobs.reduce((sum, job) => sum + job.viewsCount, 0).toLocaleString(), icon: 'visibility', helper: 'Across active and archived postings' },
    { label: 'Applications received', value: totalApplicationsCount.toString(), icon: 'inbox', helper: `${pendingApplicationsCount} still need a decision` },
    { label: 'Candidates shortlisted', value: shortlistedApplicationsCount.toString(), icon: 'how_to_reg', helper: 'Ready for interviews or offer review' },
    { label: 'Graduates hired', value: hiredApplicationsCount.toString(), icon: 'verified', helper: `${hiredApplicationsCount} confirmed placement${hiredApplicationsCount === 1 ? '' : 's'}` },
  ];

  // Callback triggers
  const handleSaveProfile = async (updatedProfile: CompanyProfile) => {
    try {
      await employerService.saveProfile(updatedProfile);
      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePostJob = async (newJobDetails: Omit<EmployerJob, 'id' | 'applicationsCount' | 'shortlistedCount' | 'viewsCount' | 'postedDate'>) => {
    try {
      const createdJob = await employerService.createJob(newJobDetails);
      setJobs([createdJob, ...jobs]);
      setNotifications(prev => [
        {
          id: Date.now(),
          text: `New job created: ${newJobDetails.title}.`,
          unread: true,
          time: 'Just now'
        },
        ...prev
      ]);
      toast.success('New job listing posted successfully!');
      return createdJob;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create job listing');
      throw error;
    }
  };

  const handleToggleJobStatus = async (jobId: number) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;
      const updatedJob = await employerService.toggleJobStatus(jobId, job.status);
      setJobs(jobs.map(j => j.id === jobId ? updatedJob : j));
      toast.success(`Job ${updatedJob.status === 'Open' ? 'reopened' : 'closed'}.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to toggle job status');
    }
  };

  const handleUpdateJob = async (updatedJob: EmployerJob) => {
    try {
      const result = await employerService.updateJob(updatedJob.id, updatedJob);
      setJobs(jobs.map(job => job.id === updatedJob.id ? result : job));
      toast.success('Job listing updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await employerService.deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job listing deleted.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete job');
    }
  };

  const handleUpdateApplicationStatus = async (appId: number, status: CandidateApplication['status']) => {
    try {
      await employerService.updateApplicationStatus(appId, status);
      const updatedApps = applications.map(app =>
        app.id === appId ? { ...app, status } : app
      );
      setApplications(updatedApps);
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
      toast.success(`Application status updated to ${status}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update application status');
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
    employerService.saveMessages(updatedMsg);
  };

  // Persistent Read Notification IDs
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('employer_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setReadNotificationIds(prev => {
      const newIds = Array.from(new Set([...prev, ...notifications.map(n => String(n.id))]));
      localStorage.setItem('employer_read_notifications', JSON.stringify(newIds));
      return newIds;
    });
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setReadNotificationIds(prev => {
      const newIds = Array.from(new Set([...prev, ...notifications.map(n => String(n.id))]));
      localStorage.setItem('employer_read_notifications', JSON.stringify(newIds));
      return newIds;
    });
  };

  const handleRemoveNotification = (id: any) => {
    setNotifications(prev => prev.filter(n => String(n.id) !== String(id)));
    setReadNotificationIds(prev => {
      const newIds = Array.from(new Set([...prev, String(id)]));
      localStorage.setItem('employer_read_notifications', JSON.stringify(newIds));
      return newIds;
    });
  };

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;
  const initials = (profile?.name || 'Company Profile').split(' ').map(n => n ? n[0] : '').filter(Boolean).join('').slice(0, 2).toUpperCase() || 'EP';

  // Load all data from backend on mount
  useEffect(() => {
    // Load profile
    employerService.getProfile().then(p => setProfile(p)).catch(console.error);

    // Load jobs
    employerService.getEmployerJobs().then(fetchedJobs => {
      setJobs(fetchedJobs || []);
      setJobsLoading(false);
    }).catch((error: any) => {
      console.error("Failed to load jobs", error);
      toast.error(error.response?.data?.message || error.message || 'Failed to load job listings');
      setJobsLoading(false);
    });

    // Load applications
    employerService.getApplications().then(apps => setApplications(apps)).catch(console.error);

    // Load feedbacks
    employerService.getFeedbacks().then(fbs => setFeedbacks(fbs)).catch(console.error);

    // Load direct messages
    employerService.getConversations().then(convs => {
      if (convs && convs.length > 0) {
        const flatMsgs: Message[] = [];
        convs.forEach((c: any) => {
          (c.messages || []).forEach((m: any, idx: number) => {
            flatMsgs.push({
              id: m.id || idx,
              sender: m.sender === 'EMPLOYER' ? 'Employer' : 'Alumni',
              senderName: m.sender === 'EMPLOYER' ? profile.name : c.alumniName,
              text: m.text,
              timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              unread: !m.isRead
            });
          });
        });
        if (flatMsgs.length > 0) setMessages(flatMsgs);
      }
    }).catch(console.error);
  }, [profile.name]);

  // Dynamic Global Search filtering
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedApps = applications.filter(a =>
      a.alumnusName?.toLowerCase().includes(q) ||
      a.jobTitle?.toLowerCase().includes(q) ||
      a.department?.toLowerCase().includes(q) ||
      (Array.isArray(a.skills) && a.skills.some((s: string) => s.toLowerCase().includes(q)))
    );

    const matchedJobs = jobs.filter(j =>
      j.title?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q) ||
      (Array.isArray(j.skillsRequired) && j.skillsRequired.some((s: string) => s.toLowerCase().includes(q)))
    );

    const matchedFeedbacks = feedbacks.filter(f =>
      f.alumnusName?.toLowerCase().includes(q) ||
      f.department?.toLowerCase().includes(q) ||
      f.comments?.toLowerCase().includes(q)
    );

    return {
      candidates: matchedApps,
      jobs: matchedJobs,
      feedbacks: matchedFeedbacks,
      totalMatches: matchedApps.length + matchedJobs.length + matchedFeedbacks.length
    };
  }, [searchQuery, applications, jobs, feedbacks]);

  // Sync notifications dynamically when backend data loads
  useEffect(() => {
    const dynamicNotifs: any[] = [];
    applications.slice(0, 3).forEach((app) => {
      const notifId = `app_${app.id}`;
      const isRead = readNotificationIds.includes(notifId);
      dynamicNotifs.push({
        id: notifId,
        text: `${app.alumnusName} submitted an application for ${app.jobTitle}.`,
        unread: !isRead && app.status === 'Pending',
        time: app.appliedDate || 'Recently',
        targetTab: 'candidates'
      });
    });
    feedbacks.slice(0, 2).forEach((fb) => {
      const notifId = `fb_${fb.id}`;
      const isRead = readNotificationIds.includes(notifId);
      dynamicNotifs.push({
        id: notifId,
        text: `Feedback audit submitted for ${fb.alumnusName} (${fb.department}).`,
        unread: !isRead,
        time: fb.submittedAt || 'Recently',
        targetTab: 'feedback'
      });
    });
    if (dynamicNotifs.length > 0) {
      setNotifications(dynamicNotifs);
    }
  }, [applications, feedbacks, readNotificationIds]);

  // Track seen navigation tabs for dynamic badge dismissal with localStorage persistence
  const [seenTabs, setSeenTabs] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('employer_seen_tabs');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    setMenuOpen(false);
    setNotificationOpen(false);
    setMobileSidebarOpen(false);
    if (activeTab) {
      setSeenTabs(prev => {
        const next = { ...prev, [activeTab]: true };
        localStorage.setItem('employer_seen_tabs', JSON.stringify(next));
        return next;
      });
      if (activeTab === 'chat' || activeTab === 'messages') {
        setRealUnreadMessages(0);
      }
    }
  }, [activeTab]);

  const toggleNotifications = () => {
    setNotificationOpen(prev => {
      const next = !prev;
      if (next) {
        setNotifications(curr => curr.map(n => ({ ...n, unread: false })));
        setReadNotificationIds(prevIds => {
          const newIds = Array.from(new Set([...prevIds, ...notifications.map(n => String(n.id))]));
          localStorage.setItem('employer_read_notifications', JSON.stringify(newIds));
          return newIds;
        });
      }
      return next;
    });
  };

  const jobBadge = !seenTabs['post_job'] && activeJobsCount > 0 ? activeJobsCount : null;
  const appBadge = !seenTabs['candidates'] && pendingApplicationsCount > 0 ? pendingApplicationsCount : null;
  const feedbackBadge = !seenTabs['feedback'] && feedbacks.length > 0 ? feedbacks.length : null;
  const msgBadge = !seenTabs['chat'] && !seenTabs['messages'] && realUnreadMessages > 0 ? realUnreadMessages : null;

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
        onClick={() => { setMenuOpen(false); setActiveTab('profile'); }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>
      <button
        type="button"
        onClick={() => { setMenuOpen(false); setHelpOpen(true); }}
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
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <>
      <div className="app-shell min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
        <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-15px) translateX(8px); opacity: 0.5; }
          50% { transform: translateY(-8px) translateX(-4px); opacity: 0.2; }
          75% { transform: translateY(-22px) translateX(12px); opacity: 0.4; }
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
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
      `}</style>

        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm md:hidden"
          />
        )}

        {/* Enhanced Sidebar Navigation */}
        <aside className={`fixed left-0 top-0 z-[60] flex h-dvh w-64 flex-col overflow-hidden shadow-2xl transition-all duration-300 md:translate-x-0 bg-[var(--bg-card)] border-r border-[var(--border-color)] dark:bg-slate-900 dark:border-slate-800 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
          {/* Animated overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.02)_0%,transparent_40%,rgba(0,107,60,0.04)_60%,transparent_100%)] dark:bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_0%,transparent_40%,rgba(0,107,60,0.04)_60%,transparent_100%)] bg-[length:400%_400%] animate-[gradient-shift_8s_ease_infinite] pointer-events-none" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-emerald-400/30 sidebar-particle" />
            <div className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/25 sidebar-particle" />
            <div className="absolute bottom-[30%] left-[30%] w-2.5 h-2.5 rounded-full bg-blue-400/20 sidebar-particle" />
          </div>

          {/* Sidebar Logo with Enhanced Status */}
          <div className="relative z-10 px-4 py-4 border-b border-[var(--border-color)] dark:border-white/10">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="relative group/logo">
                <div className="w-11 h-11 flex items-center justify-center">
                  <img alt="ASTU Logo" className="h-10 w-10 object-contain scale-110"
                    src="/images/astu-seal-logo.png" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 " />

              </div>
              {!sidebarCollapsed && <div>
                <h1 className="text-base font-extrabold text-[var(--text-primary)] dark:text-white tracking-tight">ASTU Employer</h1>
                <p className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] font-extrabold">Recruitment Hub</p>
              </div>}
            </div>
          </div>

          {/* Navigation Links with Enhanced Features */}
          <nav className="relative z-10 flex-grow px-2 py-4 overflow-y-auto scrollbar-thin">
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-[9px] font-extrabold text-[var(--text-muted)] dark:text-white/30 uppercase tracking-[0.2em]">Recruiting</p>
              </div>
            )}
            <div className="space-y-0.5">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null, tooltip: 'Overview & recruitment metrics' },
                { id: 'management', label: 'Management Hub', icon: 'dashboard_customize', badge: null, tooltip: 'Jobs, candidates, events & analytics' },
                { id: 'post_job', label: 'Job Scaffolder', icon: 'work', badge: jobBadge, tooltip: `${activeJobsCount} active job postings` },
                { id: 'candidates', label: 'Applications', icon: 'description', badge: appBadge, tooltip: `${pendingApplicationsCount} pending reviews` },
                { id: 'search_talent', label: 'Talent Search', icon: 'search', badge: null, tooltip: 'Search alumni by skills & criteria' },
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : item.tooltip}
                  className={`nav-btn w-full flex items-center px-2 py-2 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'} ${activeTab === item.id ? 'bg-astu-navy/10 text-astu-navy font-bold shadow-sm ring-1 ring-astu-navy/20 dark:bg-white/15 dark:text-white dark:shadow-black/10 dark:ring-white/10' : 'text-[var(--text-secondary)] hover:text-astu-navy hover:bg-[var(--bg-page)] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'}`}>
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-astu-navy text-white dark:bg-emerald-400/20 dark:text-emerald-400' : 'bg-[var(--bg-page)] text-[var(--text-muted)] group-hover:text-astu-navy dark:bg-white/5 dark:text-white/40 dark:group-hover:text-white/70'}`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                    {item.badge && sidebarCollapsed && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-extrabold text-white shadow-lg animate-pulse">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-extrabold shadow-lg transition-all duration-300 transform scale-100 ${String(item.id) === 'candidates' ? 'bg-rose-500/20 text-rose-600 ring-1 ring-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-500/30' : 'bg-[var(--bg-page)] text-[var(--text-secondary)] dark:bg-white/10 dark:text-white/70'}`}>
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                      {activeTab === item.id && !item.badge && <div className="ml-1 w-1.5 h-1.5 rounded-full bg-astu-navy dark:bg-emerald-400 animate-pulse" />}
                    </>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                      {item.label}
                      {item.badge && <span className="ml-1.5 text-rose-400 font-bold">({item.badge})</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-2 mt-5 mb-2">
                <p className="text-[9px] font-extrabold text-[var(--text-muted)] dark:text-white/30 uppercase tracking-[0.2em]">Management</p>
                <span className="w-1.5 h-1.5 rounded-full bg-astu-navy dark:bg-emerald-400 animate-pulse" />
              </div>
            )}
            <div className="space-y-0.5">
              {[
                { id: 'feedback', label: 'Feedbacks', icon: 'rate_review', badge: feedbackBadge, tooltip: `${feedbacks.length} feedback submissions` },
                { id: 'chat', label: 'Messages', icon: 'forum', badge: msgBadge, tooltip: `${realUnreadMessages} unread messages` },
                { id: 'analytics', label: 'Analytics', icon: 'analytics', badge: null, tooltip: 'Recruitment analytics & insights' },
                { id: 'profile', label: 'Company Profile', icon: 'business', badge: null, tooltip: 'Manage company profile & settings' },
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : item.tooltip}
                  className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${activeTab === item.id ? 'bg-astu-navy/10 text-astu-navy font-bold shadow-sm ring-1 ring-astu-navy/20 dark:bg-white/15 dark:text-white dark:shadow-black/10 dark:ring-white/10' : 'text-[var(--text-secondary)] hover:text-astu-navy hover:bg-[var(--bg-page)] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'}`}>
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-astu-navy text-white dark:bg-emerald-400/20 dark:text-emerald-400' : 'bg-[var(--bg-page)] text-[var(--text-muted)] group-hover:text-astu-navy dark:bg-white/5 dark:text-white/40 dark:group-hover:text-white/70'}`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                    {item.badge && sidebarCollapsed && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-extrabold text-white shadow-lg animate-pulse">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-extrabold shadow-lg bg-rose-500/20 text-rose-600 ring-1 ring-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-500/30 transition-all duration-300 transform scale-100">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                      {activeTab === item.id && !item.badge && <div className="ml-1 w-1.5 h-1.5 rounded-full bg-astu-navy dark:bg-emerald-400 animate-pulse" />}
                    </>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                      {item.label}
                      {item.badge && <span className="ml-1.5 text-rose-400 font-bold">({item.badge})</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {sidebarCollapsed && (
              <div className="mt-4 px-2">
                <div className="flex justify-center">
                  <div className="w-1 h-1 rounded-full bg-astu-navy dark:bg-emerald-400 animate-pulse" title="System Online" />
                </div>
              </div>
            )}
          </nav>

          {/* Sidebar Footer with Enhanced Actions */}
          <div className="relative z-10 px-2 py-4 border-t border-[var(--border-color)] dark:border-white/10 space-y-1">
            {!sidebarCollapsed && (
              <>
                <button onClick={() => setHelpOpen(true)}
                  className="nav-btn w-full flex items-center px-2 py-2 rounded-xl text-[var(--text-muted)] hover:text-astu-navy hover:bg-[var(--bg-page)] dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5 transition-all duration-200 text-left group gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[var(--bg-page)] dark:bg-white/5 flex items-center justify-center text-[var(--text-muted)] group-hover:text-astu-navy dark:text-white/40 dark:group-hover:text-white/70 material-symbols-outlined">help</span>
                  <span className="text-sm font-medium">Help Center</span>
                  <span className="ml-auto text-[8px] text-[var(--text-muted)] dark:text-white/20 font-bold px-1.5 py-0.5 bg-[var(--bg-page)] dark:bg-white/5 rounded border border-[var(--border-color)] dark:border-white/10">v1.4</span>
                </button>
                <button onClick={handleLogout}
                  className="nav-btn w-full flex items-center px-2 py-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:text-rose-400/70 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-all duration-200 text-left group gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 material-symbols-outlined text-rose-500 dark:text-rose-400/70 group-hover:text-rose-600 dark:group-hover:text-rose-400">logout</span>
                  <span className="text-sm font-medium">Logout</span>
                  <span className="ml-auto text-[8px] text-[var(--text-muted)] dark:text-white/10 font-medium">Alt+L</span>
                </button>
              </>
            )}
            {sidebarCollapsed && (
              <>
                <button onClick={() => setHelpOpen(true)}
                  className="nav-btn w-full flex items-center justify-center px-2 py-2 rounded-xl text-[var(--text-muted)] hover:text-astu-navy hover:bg-[var(--bg-page)] dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5 transition-all duration-200 group relative" title="Help Center">
                  <span className="w-8 h-8 rounded-lg bg-[var(--bg-page)] dark:bg-white/5 flex items-center justify-center text-[var(--text-muted)] group-hover:text-astu-navy dark:text-white/40 dark:group-hover:text-white/70 material-symbols-outlined">help</span>
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">Help Center</div>
                </button>
                <button onClick={handleLogout}
                  className="nav-btn w-full flex items-center justify-center px-2 py-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:text-rose-400/70 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-all duration-200 group relative" title="Logout">
                  <span className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 material-symbols-outlined text-rose-500 dark:text-rose-400/70 group-hover:text-rose-600 dark:group-hover:text-rose-400">logout</span>
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">Logout</div>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className={`min-h-screen transition-[margin-left] duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

          {/* Header Section - Admin Layout Style */}
          <header
            className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 shadow-sm sm:px-6 bg-[var(--bg-card)] border-[var(--border-color)] dark:bg-slate-900 dark:border-slate-800"
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

                <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">
                  {activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Search Bar with Floating Dropdown Overlay */}
              <div className="relative hidden md:block" data-admin-search>
                <label
                  className="group flex h-11 w-[420px] max-w-[36vw] items-center rounded-full border border-[var(--border-color)] dark:border-slate-700 bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
                >
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                    <Search className="h-4.5 w-4.5 flex-none" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search candidates, departments, or postings..."
                    className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] p-1 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </label>

                {/* Floating Search Results Dropdown */}
                {searchResults && (
                  <div className="absolute left-0 top-13 z-50 w-full max-h-[28rem] overflow-y-auto rounded-2xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 shadow-2xl p-3 space-y-3">
                    <div className="flex justify-between items-center px-2 pb-2 border-b border-[var(--border-color)] dark:border-slate-800">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Search Results ({searchResults.totalMatches} matches)
                      </span>
                      <button onClick={() => setSearchQuery('')} className="text-[10px] font-bold text-rose-500 hover:underline">
                        Close ✕
                      </button>
                    </div>

                    {searchResults.totalMatches === 0 ? (
                      <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                        No matches found for "{searchQuery}". Try searching by skill, department, or candidate name.
                      </div>
                    ) : (
                      <>
                        {/* Matched Candidates */}
                        {searchResults.candidates.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-navy dark:text-emerald-400 px-2 block">
                              🎓 Candidates ({searchResults.candidates.length})
                            </span>
                            {searchResults.candidates.slice(0, 4).map(candidate => (
                              <div
                                key={candidate.id}
                                onClick={() => {
                                  setSelectedSearchCandidate(candidate);
                                  setSearchQuery('');
                                }}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-astu-navy/10 text-astu-navy font-bold flex items-center justify-center text-xs">
                                    {candidate.alumnusName[0]}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-[var(--text-primary)] dark:text-white leading-none">{candidate.alumnusName}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{candidate.department} • CGPA {candidate.cgpa}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-astu-navy text-white">
                                  View Profile
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Matched Jobs */}
                        {searchResults.jobs.length > 0 && (
                          <div className="space-y-1 border-t border-[var(--border-color)] dark:border-slate-800 pt-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003366] dark:text-amber-400 px-2 block">
                              💼 Job Openings ({searchResults.jobs.length})
                            </span>
                            {searchResults.jobs.slice(0, 3).map(job => (
                              <div
                                key={job.id}
                                onClick={() => {
                                  setActiveTab('post_job');
                                  setSearchQuery('');
                                }}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              >
                                <div>
                                  <p className="text-xs font-bold text-[var(--text-primary)] dark:text-white leading-none">{job.title}</p>
                                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{job.location} • {job.type}</p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                  {job.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Matched Feedback */}
                        {searchResults.feedbacks.length > 0 && (
                          <div className="space-y-1 border-t border-[var(--border-color)] dark:border-slate-800 pt-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 px-2 block">
                              📝 Feedback Audits ({searchResults.feedbacks.length})
                            </span>
                            {searchResults.feedbacks.slice(0, 2).map(fb => (
                              <div
                                key={fb.id}
                                onClick={() => {
                                  setActiveTab('feedback');
                                  setSearchQuery('');
                                }}
                                className="p-2 rounded-xl hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              >
                                <p className="text-xs font-bold text-[var(--text-primary)] dark:text-white leading-none">{fb.alumnusName} - {fb.department}</p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">"{fb.comments}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
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
                  onClick={toggleNotifications}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white transition-all duration-300 transform scale-100">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl">
                    <div className="border-b border-[var(--border-color)] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-[var(--text-primary)]">Notifications</div>
                          <div className="text-xs text-[var(--text-secondary)]">{unreadNotificationsCount} unread recruit alerts</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleMarkNotificationsRead}
                            className="text-[10px] font-bold text-astu-navy dark:text-emerald-400 hover:underline"
                          >
                            Mark Read
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={handleClearAllNotifications}
                            className="text-[10px] font-bold text-[#E24B4A] hover:underline"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 p-2 max-h-72 overflow-y-auto">
                      {notifications.map((notif: any) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                            if (notif.targetTab) {
                              setActiveTab(notif.targetTab);
                              toast.success(`Opening ${notif.targetTab.replace('_', ' ')}...`);
                            }
                            setNotificationOpen(false);
                          }}
                          className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <span className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${notif.unread ? 'bg-[#003580]' : 'bg-[var(--bg-page)]'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[var(--text-primary)] leading-snug">{notif.text}</p>
                            <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-1">{notif.time}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNotification(notif.id);
                            }}
                            className="flex-shrink-0 text-[var(--text-muted)] hover:text-rose-500"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="px-2 py-6 text-center text-xs text-[var(--text-secondary)] font-medium">No new notifications.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" data-admin-menu>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-3 rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-900 px-2.5 py-1.5 shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#003580] text-xs font-semibold text-white">
                    {initials}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{profile.name}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">HR Manager</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
                {menuOpen && menu}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main id="main-content" tabIndex={-1}className="h-[calc(100dvh-4rem)] p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
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
                      <p className="mt-1 text-xs text-[var(--text-muted)]">One clear snapshot for hiring, review queues, curriculum feedback, and recruiter follow-up.</p>
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
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{signal.label}</p>
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {hiringPipeline.map((item) => (
                          <div key={item.label} className={`rounded-[10px] border p-3 ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-gray-200 bg-gray-50'}`}>
                            <span className="material-symbols-outlined text-astu-navy">{item.icon}</span>
                            <p className="mt-2 text-xl font-extrabold">{item.value}</p>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{item.label}</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{item.helper}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Stats Counters Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {stats.map((stat) => (
                    <div
                      key={stat.id}
                      onMouseEnter={() => setHoveredCard(stat.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => {
                        if (stat.id === 1) setActiveTab('post_job');
                        if (stat.id === 2) setActiveTab('candidates');
                        if (stat.id === 3) setActiveTab('candidates');
                        if (stat.id === 4) setActiveTab('candidates');
                        if (stat.id === 5) setActiveTab('feedback');
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
                          <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">{stat.label}</p>
                          <p className="text-3xl font-extrabold text-astu-navy mt-1">{stat.value}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-semibold pt-1 border-t border-gray-100/5">
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
                  <div className="mb-4 flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                    <div>
                      <h3 className="text-sm font-semibold">Your Posted Positions</h3>
                      <p className="text-xs text-[var(--text-muted)] font-semibold">Quick updates on recent vacancies</p>
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
                            <p className="text-xs text-[var(--text-muted)]">{job.location} • {job.type}</p>
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
                      <p className="mt-1 text-xs text-[var(--text-muted)]">Recruitment, talent search, feedback, and partnership actions in one place.</p>
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
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{card.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    {demandSignals.map((signal) => (
                      <div key={signal.label} className={`rounded-[10px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{signal.label}</p>
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
                    data={monthlySubmissionsData}
                    xKey="month"
                    series={[{ key: 'applications', label: 'Applications Received' }]}
                    height={200}
                    darkMode={darkMode}
                  />
                  <AnalyticsChart
                    type="pie"
                    title="Evaluation Ratings"
                    subtitle="Corporate evaluation of hired graduates"
                    data={evaluationRatingsData}
                    xKey="name"
                    series={[{ key: 'value', label: 'Graduates Count' }]}
                    height={200}
                    darkMode={darkMode}
                  />
                </div>

                {/* Employer Activity Timeline */}
                <div>
                  <ActivityTimeline
                    activities={dynamicActivityTimeline}
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
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                      Get access to verified academic records directly from the ASTU Registrar office.
                      Your feedback provides high-value guidelines to the dean board during curriculum modernization cycles.
                    </p>
                    <div className="p-3 bg-gray-50/5 border border-gray-100/5 rounded-xl text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-astu-green">verified</span>
                      <span className="font-semibold text-[var(--text-secondary)]">Verified ASTU Academic Records Integration Active</span>
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
                      <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{action.desc}</p>
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
              jobsLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#003366] border-t-transparent"></div>
                </div>
              ) : (
                <JobPostingTab
                  jobs={jobs}
                  onPostJob={handlePostJob}
                  onToggleJobStatus={handleToggleJobStatus}
                  onUpdateJob={handleUpdateJob}
                  onDeleteJob={handleDeleteJob}
                  darkMode={darkMode}
                />
              )
            )}

            {activeTab === 'candidates' && (
              <ApplicationsTab
                applications={applications}
                onUpdateStatus={handleUpdateApplicationStatus}
                onMessageCandidate={(app) => {
                  setActiveChatTarget({
                    id: app.userId || app.alumniId,
                    userId: app.userId || app.alumniId,
                    name: app.alumnusName,
                    email: app.alumnusEmail,
                    avatar: app.alumnusAvatar,
                    role: 'ALUMNI',
                    roleLabel: 'Alumni Candidate',
                    department: app.department
                  });
                  setActiveTab('messages');
                  toast.success(`Opening conversation with ${app.alumnusName}...`);
                }}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'search_talent' && (
              <TalentSearchTab
                darkMode={darkMode}
                onSelectChatTarget={(target) => {
                  setActiveChatTarget({
                    id: target.userId || target.alumniId,
                    userId: target.userId || target.alumniId,
                    name: target.name,
                    role: 'ALUMNI',
                    roleLabel: 'Alumni Candidate'
                  });
                  setActiveTab('messages');
                  toast.success(`Opening ASTU_AMS Hub chat with ${target.name}...`);
                }}
              />
            )}

            {activeTab === 'feedback' && (
              <FeedbackTab
                feedbacks={feedbacks}
                onSubmitFeedback={handleRegisterFeedback}
                onRefreshFeedbacks={() => employerService.getFeedbacks().then(setFeedbacks)}
                darkMode={darkMode}
              />
            )}

            {(activeTab === 'chat' || activeTab === 'messages') && (
              <MessagingTab
                darkMode={darkMode}
                initialTarget={activeChatTarget}
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

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {selectedSearchCandidate && (
        <CandidateProfileModal
          candidate={selectedSearchCandidate}
          onClose={() => setSelectedSearchCandidate(null)}
          onUpdateStatus={handleUpdateApplicationStatus}
          darkMode={darkMode}
          onMessageCandidate={(app) => {
            setActiveChatTarget({
              id: app.userId || app.alumniId,
              userId: app.userId || app.alumniId,
              name: app.alumnusName,
              email: app.alumnusEmail,
              avatar: app.alumnusAvatar,
              role: 'ALUMNI',
              roleLabel: 'Alumni Candidate',
              department: app.department
            });
            setSelectedSearchCandidate(null);
            setActiveTab('messages');
          }}
        />
      )}
    </>
  );
};

export default EmployerDashboard;
