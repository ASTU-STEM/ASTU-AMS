import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Search, Settings, User, Briefcase, Sparkles, ArrowRight, UserCheck, Calendar } from 'lucide-react';
import InstitutionalHubBridge from '../../../components/InstitutionalHubBridge';
import { DashboardShell } from '../../../layouts/DashboardShell';
import type { SidebarNavSection } from '../../../layouts/AppSidebar';

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
import { CandidatePipelineKanban } from '../components/tabs/CandidatePipelineKanban';
import { PartnerMoUDirectory } from '../components/tabs/PartnerMoUDirectory';
import { useTheme } from '../../../hooks/useTheme';

const EmployerDashboard = () => {
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchCandidate, setSelectedSearchCandidate] = useState<CandidateApplication | null>(null);
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
    { label: 'Time to Hire', value: hiredApplicationsCount > 0 ? '18 days' : 'No hires yet', tone: 'text-astu-green', icon: 'timer' },
    { label: 'Interview Queue', value: `${interviewQueueCount} candidate${interviewQueueCount === 1 ? '' : 's'}`, tone: 'text-astu-red', icon: 'calendar_month' },
  ], [topSkillDemand, hiredApplicationsCount, interviewQueueCount]);

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

    return last6Months.map((m) => {
      const realCount = monthCounts[m] || 0;
      return {
        month: m,
        applications: realCount,
      };
    });
  }, [applications]);

  const evaluationRatingsData = React.useMemo(() => {
    if (feedbacks.length === 0) {
      return [];
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
      { name: 'Exceeds Expectations', value: exceeds },
      { name: 'Fully Competent', value: competent },
      { name: 'Needs Development', value: needsDev }
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
        description: `${app.alumnusName} applied${app.cgpa ? ` with CGPA ${app.cgpa}` : ''}. Status: ${app.status}.`,
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

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setReadNotificationIds(prev => {
      const newIds = Array.from(new Set([...prev, ...notifications.map(n => String(n.id))]));
      localStorage.setItem('employer_read_notifications', JSON.stringify(newIds));
      return newIds;
    });
  };

  const handleMarkNotificationRead = (notification: { id: string | number }) => {
    setNotifications(prev =>
      prev.map(n => (String(n.id) === String(notification.id) ? { ...n, unread: false } : n))
    );
    setReadNotificationIds(prev => {
      const newIds = Array.from(new Set([...prev, String(notification.id)]));
      localStorage.setItem('employer_read_notifications', JSON.stringify(newIds));
      return newIds;
    });
  };

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

  const jobBadge = !seenTabs['post_job'] && activeJobsCount > 0 ? activeJobsCount : null;
  const appBadge = !seenTabs['candidates'] && pendingApplicationsCount > 0 ? pendingApplicationsCount : null;
  const feedbackBadge = !seenTabs['feedback'] && feedbacks.length > 0 ? feedbacks.length : null;
  const msgBadge = !seenTabs['chat'] && !seenTabs['messages'] && realUnreadMessages > 0 ? realUnreadMessages : null;

  const sidebarSections: SidebarNavSection[] = [
    {
      id: 'recruiting',
      label: 'Recruiting',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', tooltip: 'Overview & recruitment metrics' },
        { id: 'management', label: 'Management Hub', icon: 'dashboard_customize', tooltip: 'Jobs, candidates, events & analytics' },
        { id: 'post_job', label: 'Job Scaffolder', icon: 'work', badge: jobBadge, tooltip: `${activeJobsCount} active job postings` },
        { id: 'candidates', label: 'Applications', icon: 'description', badge: appBadge, tooltip: `${pendingApplicationsCount} pending reviews` },
        { id: 'pipeline', label: 'Pipeline Kanban', icon: 'view_kanban', tooltip: '5-stage candidate recruitment kanban' },
        { id: 'search_talent', label: 'Talent Search', icon: 'search', tooltip: 'Search alumni by skills & criteria' },
      ],
    },
    {
      id: 'management',
      label: 'Management',
      items: [
        { id: 'feedback', label: 'Feedbacks', icon: 'rate_review', badge: feedbackBadge, tooltip: `${feedbacks.length} feedback submissions` },
        { id: 'partnerships', label: 'MoU & Accreditation', icon: 'handshake', tooltip: 'Partner accreditation directory & MoUs' },
        { id: 'chat', label: 'Messages', icon: 'forum', badge: msgBadge, tooltip: `${realUnreadMessages} unread messages` },
        { id: 'analytics', label: 'Analytics', icon: 'analytics', tooltip: 'Recruitment analytics & insights' },
        { id: 'profile', label: 'Company Profile', icon: 'business', tooltip: 'Manage company profile & settings' },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <>
      <DashboardShell
        sidebarSections={sidebarSections}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="ASTU Employer"
        subtitle="Recruitment Hub"
        brand="Employer"
        userName={profile.name || 'Employer'}
        userRole="Partner Employer"
        userInitials={initials}
        onLogout={handleLogout}
        searchPlaceholder="Search candidates, departments, or postings..."
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        notifications={notifications.map((n) => ({
          id: n.id,
          title: n.title || 'Recruitment Alert',
          text: n.text || n.message || '',
          time: n.time,
          unread: !!n.unread,
          targetTab: n.targetTab,
        }))}
        onClearNotifications={handleMarkNotificationsRead}
        onMarkNotificationRead={handleMarkNotificationRead}
        onNotificationClick={(n) => {
          if (n.targetTab) {
            setActiveTab(n.targetTab);
            toast.success(`Opening ${n.targetTab.replace('_', ' ')}...`);
          }
        }}
        logoSrc="/images/astu-seal-logo.png"
        menuActions={[
          {
            id: 'profile',
            label: 'Company Profile',
            icon: <User className="h-4 w-4" />,
            onClick: () => setActiveTab('profile'),
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: <Settings className="h-4 w-4" />,
            onClick: () => setActiveTab('analytics'),
          },
        ]}
      >

        {searchResults && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm p-3 space-y-3 text-[var(--text-primary)]">
            <div className="flex justify-between items-center px-2 pb-2 border-b border-[var(--border-color)]">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Search Results ({searchResults.totalMatches} matches)
              </span>
              <button type="button" onClick={() => setSearchQuery('')} className="text-[10px] font-bold text-[#F87171] hover:underline cursor-pointer">
                Close ✕
              </button>
            </div>

            {searchResults.totalMatches === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No matches found for "{searchQuery}". Try searching by skill, department, or candidate name.
              </div>
            ) : (
              <>
                {searchResults.candidates.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-astu-navy dark:text-emerald-400 px-2 block">
                      Candidates ({searchResults.candidates.length})
                    </span>
                    {searchResults.candidates.slice(0, 4).map(candidate => (
                      <div
                        key={candidate.id}
                        onClick={() => {
                          setSelectedSearchCandidate(candidate);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-astu-navy/10 text-astu-navy font-bold flex items-center justify-center text-xs">
                            {candidate.alumnusName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{candidate.alumnusName}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{candidate.department} • CGPA {candidate.cgpa}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-astu-navy text-white">
                          View Profile
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.jobs.length > 0 && (
                  <div className="space-y-1 border-t border-gray-150 dark:border-slate-800 pt-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003366] dark:text-amber-400 px-2 block">
                      Job Openings ({searchResults.jobs.length})
                    </span>
                    {searchResults.jobs.slice(0, 3).map(job => (
                      <div
                        key={job.id}
                        onClick={() => {
                          setActiveTab('post_job');
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{job.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{job.location} • {job.type}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {job.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.feedbacks.length > 0 && (
                  <div className="space-y-1 border-t border-gray-150 dark:border-slate-800 pt-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 px-2 block">
                      Feedback Audits ({searchResults.feedbacks.length})
                    </span>
                    {searchResults.feedbacks.slice(0, 2).map(fb => (
                      <div
                        key={fb.id}
                        onClick={() => {
                          setActiveTab('feedback');
                          setSearchQuery('');
                        }}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{fb.alumnusName} - {fb.department}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 truncate">"{fb.comments}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
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
            <section className="space-y-6">
              {/* 1. Shared Institutional Hub Bridge */}
              <InstitutionalHubBridge currentHub="employer" />

              {/* 2. Enhanced Employer Hero */}
              <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#002244] via-[#003580] to-teal-900 p-6 md:p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="max-w-3xl space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Corporate Talent & Partner Portal
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      Corporate Employer Management Hub
                    </h2>
                    <p className="text-sm leading-relaxed text-white/80">
                      Create job openings, manage internships, access verified STEM graduate pools, track application pipelines, and schedule campus recruitment events.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => setActiveTab('post_job')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Post Vacancy</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('search_talent')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition-all"
                    >
                      <Search className="w-3.5 h-3.5 text-teal-300" />
                      <span>Search Talent</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Employer Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'} shadow-2xs`}>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Briefcase className="w-4 h-4 text-[#003580] dark:text-blue-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Active Openings</p>
                  </div>
                  <p className="text-2xl font-extrabold text-[#003580] dark:text-blue-400 mt-2">4 Roles</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Software & Network Eng</p>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'} shadow-2xs`}>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Candidates In Queue</p>
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">28 Applied</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Verified ASTU Alumni</p>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'} shadow-2xs`}>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Shortlisted</p>
                  </div>
                  <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">9 Candidates</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ready for tech interview</p>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'} shadow-2xs`}>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-teal-500" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Campus Career Fair</p>
                  </div>
                  <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-2">Registered</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ASTU Main Campus</p>
                </div>
              </div>

              {/* 4. Action Cards */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {employerManagementActions.map((action) => (
                  <button
                    key={action.title}
                    onClick={() => setActiveTab(action.tab)}
                    className={`group rounded-2xl border p-5 text-left shadow-2xs hover:border-[#003580]/40 dark:hover:border-blue-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between ${
                      darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined rounded-xl bg-[#003580]/10 dark:bg-blue-950/60 p-2.5 text-[#003580] dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 text-xl">
                          {action.icon}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#003580] dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="mt-3.5 text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#003580] dark:group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {action.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#003580] dark:text-blue-400">
                        Launch Workspace
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Tab: {action.tab}
                      </span>
                    </div>
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

          {activeTab === 'pipeline' && (
            <CandidatePipelineKanban />
          )}

          {activeTab === 'partnerships' && (
            <PartnerMoUDirectory />
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
      </DashboardShell>

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
