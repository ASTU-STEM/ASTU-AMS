import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import HelpCenter from '../../../components/HelpCenter';
import TelebirrDonationModal from '../../../components/TelebirrDonationModal';
import { surveyService } from '../../surveys/services/survey.service';
import { notificationService } from '../../notifications/services/notification.service';

import {
  AlumniProfile,
  JobMatch,
  TracerSurvey,
  Mentor,
  CareerEvent,
  DocumentRequest,
  AlumniPreferences,
  MentorshipSession
} from '../types/alumni.types';

import { alumniService } from '../services/alumni.service';

const calculateCompletion = (profile: Partial<AlumniProfile>) => {
  if (!profile || Object.keys(profile).length === 0) return 0;
  let score = 0;
  if (profile.fullName) score += 20;
  if (profile.currentRole) score += 20;
  if (profile.skills && profile.skills.length > 0) score += 20;
  if (profile.bio) score += 20;
  if (profile.address) score += 20;
  return score;
};

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
   const { logout } = useAuth();

   const [activeTab, setActiveTab] = useState<string>('dashboard');
   const [hoveredCard, setHoveredCard] = useState<number | null>(null);
   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('alumni_sidebar_collapsed') === 'true');
   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
   const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [surveys, setSurveys] = useState<TracerSurvey[]>([]);
  const [realPendingSurveysCount, setRealPendingSurveysCount] = useState<number>(0);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [events, setEvents] = useState<CareerEvent[]>([]);
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<AlumniPreferences | null>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  const [selectedJobForModal, setSelectedJobForModal] = useState<JobMatch | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [donationCampaign, setDonationCampaign] = useState<{ title: string; category: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const profileCompletion = statsData?.profileCompletion || calculateCompletion(profile || {} as any);
  const pendingSurveysCount = realPendingSurveysCount;
  const matchCount = statsData?.openJobMatches || (Array.isArray(jobs) ? jobs.filter(j => !j.applied).length : 0);
  const connectedMentorsCount = statsData?.activeMentorships || (Array.isArray(mentors) ? mentors.filter(m => m.status === 'CONNECTED' || m.status === 'REQUEST_PENDING').length : 0) + 347;

  const stats = [
    { id: 1, label: 'Profile Status', value: `${profileCompletion}%`, color: 'astu-navy', icon: 'account_circle', bgGradient: 'from-blue-50 to-indigo-50', trend: 'Complete fields to boost', trendIcon: 'trending_up', trendColor: 'astu-green' },
    { id: 2, label: 'Job Matches', value: `${matchCount}`, color: 'astu-green', icon: 'work', bgGradient: 'from-emerald-50 to-green-50', trend: '+3 new placements', trendIcon: 'trending_up', trendColor: 'astu-green' },
    { id: 3, label: 'Pending Surveys', value: `${pendingSurveysCount}`, color: 'astu-red', icon: 'assignment', bgGradient: 'from-red-50 to-orange-50', trend: pendingSurveysCount > 0 ? 'Urgent Tracer studies' : 'All studies submitted', trendIcon: pendingSurveysCount > 0 ? 'schedule' : 'check_circle', trendColor: pendingSurveysCount > 0 ? 'astu-red' : 'astu-green' },
    { id: 4, label: 'Network Peers', value: `${connectedMentorsCount}`, color: 'purple-600', icon: 'people', bgGradient: 'from-purple-50 to-pink-50', trend: '+28 peers connected', trendIcon: 'trending_up', trendColor: 'astu-green' },
  ];

  const managementActions = [
    { title: 'Alumni Directory', desc: 'Browse peers by batch, city, country, department, skills, and chapter.', tab: 'profile', icon: 'travel_explore' },
    { title: 'Skills Portfolio', desc: 'Create skill evidence, publications, projects, awards, and career progress records.', tab: 'profile', icon: 'workspace_premium' },
    { title: 'CV Builder', desc: 'Generate accreditation-friendly CV snapshots from your verified profile.', tab: 'profile', icon: 'description' },
    { title: 'Digital ID Card', desc: 'Manage verified alumni identity and registrar-approved profile data.', tab: 'documents', icon: 'badge' },
    { title: 'Volunteer Program', desc: 'Join mentorship, alumni chapters, campus events, and community initiatives.', tab: 'mentorship', icon: 'volunteer_activism' },
    { title: 'Career Progress', desc: 'Update employment, salary range, startup, research, and tracer outcomes.', tab: 'surveys', icon: 'timeline' },
  ];

  const handleSaveProfile = async (updatedProfile: any | FormData) => {
    try {
      const response = await alumniService.updateProfile(updatedProfile);
      setProfile(response as any);
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleUpdateEmploymentStatus = (role: string, company: string, salary: string) => {
    const updatedProfile = { ...profile, currentRole: role, company, salaryRange: salary };
    setProfile(updatedProfile);
  };

  const handleApplyJob = async (jobId: string | number) => {
    try {
      await alumniService.applyToJob(String(jobId), {});
      const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, applied: true, applicationStatus: 'Applied' as const } : j);
      setJobs(updatedJobs);
      const appliedJob = jobs.find(j => j.id === jobId);
      if (appliedJob) {
        toast.success(`Application sent to ${appliedJob.company}!`);
        setNotifications(prev => [{ id: Date.now(), text: `Applied for ${appliedJob.title} at ${appliedJob.company}.`, unread: true, time: 'Just now' }, ...prev]);
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
      toast.error('Failed to submit application. Please try again later.');
    }
  };

  const handleToggleSaveJob = async (jobId: string | number) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      if (job.saved) {
        await alumniService.unsaveJob(String(jobId));
      } else {
        await alumniService.saveJob(String(jobId));
      }
      const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, saved: !j.saved } : j);
      setJobs(updatedJobs);
    } catch (err) {
      console.error('Failed to toggle save status:', err);
      toast.error('Failed to update saved job status.');
    }
  };

  const handleCompleteSurvey = (surveyId: number, answers: Record<string, string>) => {
    const updatedSurveys = surveys.map(s => s.id === surveyId ? { ...s, status: 'COMPLETED' as const, completedAt: new Date().toLocaleDateString() } : s);
    setSurveys(updatedSurveys);
    setNotifications(prev => [{ id: Date.now(), text: `Submitted Tracer Survey: ${surveys.find(s => s.id === surveyId)?.title}.`, unread: true, time: 'Just now' }, ...prev]);
  };

  const handleRegisterEvent = (eventId: number) => {
    const updatedEvents = events.map(e => e.id === eventId ? { ...e, registered: true } : e);
    setEvents(updatedEvents);
    setNotifications(prev => [{ id: Date.now(), text: `Registered for event: ${events.find(e => e.id === eventId)?.title}.`, unread: true, time: 'Just now' }, ...prev]);
  };

  const handleRequestMentorship = async (mentorId: number) => {
    try {
      await alumniService.requestMentorship(mentorId.toString());
      const updatedMentors = mentors.map(m => m.id === mentorId ? { ...m, status: 'REQUEST_PENDING' as const } : m);
      setMentors(updatedMentors);
      setNotifications(prev => [{ id: Date.now(), text: `Requested mentorship connection with ${mentors.find(m => m.id === mentorId)?.name}.`, unread: true, time: 'Just now' }, ...prev]);
      toast.success('Mentorship request sent successfully.');
    } catch (err) {
      toast.error('Failed to send mentorship request.');
    }
  };

  const handleScheduleSession = async (mentorId: number, sessionDetails: Omit<MentorshipSession, 'id' | 'status' | 'meetLink'>) => {
    try {
      const session = (await alumniService.scheduleSession(mentorId.toString(), {
        date: sessionDetails.date,
        time: sessionDetails.time,
        topic: sessionDetails.topic
      })) as any;
      const updatedMentors = mentors.map(m => {
        if (m.id === mentorId) {
          return { ...m, sessions: [...(m.sessions || []), { id: session.id, ...sessionDetails, status: 'Scheduled' as const, meetLink: session.meetLink }] };
        }
        return m;
      });
      setMentors(updatedMentors);
      setNotifications(prev => [{ id: Date.now(), text: `Scheduled mentorship session with ${mentors.find(m => m.id === mentorId)?.name}.`, unread: true, time: 'Just now' }, ...prev]);
    } catch (err) {
      toast.error('Failed to schedule session.');
    }
  };

  const handleRequestDocument = async (type: DocumentRequest['type'], notes?: string) => {
    try {
      await alumniService.requestDocument({ documentType: type, additionalInstructions: notes });
      const newDoc: DocumentRequest = { id: documents.length + 1, type, requestDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), status: 'Pending', notes: notes || 'Awaiting registrar verification.' };
      setDocuments([newDoc, ...documents]);
      setNotifications(prev => [{ id: Date.now(), text: `Submitted official request for: ${type}.`, unread: true, time: 'Just now' }, ...prev]);
      toast.success('Document request submitted successfully');
    } catch (err) {
      toast.error('Failed to submit document request');
    }
  };

  const handleCreatePost = async (content: string) => {
    try {
      const post: any = await alumniService.createForumPost(content);
      const newPost = { id: post.id, author: profile?.fullName, authorAvatar: profile?.profilePicture, authorRole: 'Alumni', content: post.content, timestamp: 'Just now', likes: 0, comments: 0 };
      setForumPosts([newPost, ...forumPosts]);
      toast.success('Post created successfully!');
    } catch (err) {
      toast.error('Failed to create post');
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const res: any = await alumniService.toggleForumLike(postId);
      const liked = res.liked;
      setForumPosts(forumPosts.map(p => p.id === postId ? { ...p, likes: p.likes + (liked ? 1 : -1), liked } : p));
    } catch (err) {
      toast.error('Failed to update like status');
    }
  };

  const handleDonate = async (campaignId: string, amount: number) => {
    try {
      await alumniService.makeDonation(campaignId, amount);
      toast.success('Thank you for your generous donation!');
      // Refresh campaigns locally
      const campaignsRes = await alumniService.getDonationCampaigns();
      if (Array.isArray(campaignsRes)) setCampaigns(campaignsRes);
    } catch (err) {
      toast.error('Failed to process donation');
    }
  };

  const handleSavePreferences = async (updatedPrefs: AlumniPreferences) => {
    try {
      await alumniService.savePreferences(updatedPrefs);
      setPreferences(updatedPrefs);
      toast.success('Preferences saved successfully');
    } catch (err) {
      toast.error('Failed to save preferences');
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
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [
          profileData,
          stats,
          jobsRes,
          savedJobsRes,
          applicationsRes,
          eventsData,
          mentorsData,
          documentsData,
          forumData,
          campaignsData,
          preferencesData,
          messageThreadsRes
        ] = await Promise.all([
          alumniService.getProfile().catch(() => null),
          alumniService.getDashboardStats().catch(() => null),
          alumniService.getJobs().catch(() => ({ data: [] })),
          alumniService.getSavedJobs().catch(() => ({ data: [] })),
          alumniService.getMyApplications().catch(() => []),
          alumniService.getEvents().catch(() => []),
          alumniService.getMentorProfiles().catch(() => []),
          alumniService.getMyDocuments().catch(() => []),
          alumniService.getForumPosts().catch(() => []),
          alumniService.getDonationCampaigns().catch(() => []),
          alumniService.getPreferences().catch(() => ({})),
          alumniService.getMessageThreads().catch(() => [])
        ]);

        if (profileData) {
          setProfile(profileData as any);
        } else {
          setProfile({
            fullName: 'Alumni User',
            currentRole: '',
            company: '',
            cgpa: '0.00',
            skills: []
          } as any);
        }
        if (stats) setStatsData(stats);
        
        // Process Jobs
        const rawJobs = Array.isArray(jobsRes) ? jobsRes : ((jobsRes as any)?.data || []);
        const savedJobsList = Array.isArray(savedJobsRes) ? savedJobsRes : ((savedJobsRes as any)?.data || []);
        const applicationsList = Array.isArray(applicationsRes) ? applicationsRes : ((applicationsRes as any)?.data || []);

        const savedJobIds = new Set(savedJobsList.map((sj: any) => sj.jobId || sj.id));
        const appMap = new Map();
        applicationsList.forEach((app: any) => {
          let st = app.status;
          if (st === 'PENDING') st = 'Applied';
          if (st === 'REJECTED') st = 'Rejected';
          if (st === 'HIRED') st = 'Offered';
          appMap.set(app.jobId || app.job?.id, st);
        });

        const mappedJobs: JobMatch[] = rawJobs.map((j: any) => {
          let empType = 'Full-Time';
          if (j.employmentType === 'FULL_TIME') empType = 'Full-Time';
          else if (j.employmentType === 'PART_TIME') empType = 'Part-Time';
          else if (j.employmentType === 'INTERNSHIP') empType = 'Internship';
          else if (j.employmentType === 'CONTRACT') empType = 'Contract';
          else if (j.type) empType = j.type;

          return {
            id: j.id,
            title: j.title,
            company: j.companyName || j.employer?.companyName || 'ASTU Corporate Partner',
            location: j.location || 'Addis Ababa',
            type: empType,
            salary: j.salary || (j.salaryMin ? `${j.salaryMin} - ${j.salaryMax} ETB` : 'Negotiable'),
            postedDate: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'Recent',
            match: '92%',
            description: j.description || '',
            skills: Array.isArray(j.skillsRequired) ? j.skillsRequired : (j.skills || []),
            views: j.views || 0,
            applications: j._count?.applications || j.applications || 0,
            shortlisted: 0,
            experience: j.experienceRequired ? `${j.experienceRequired} yrs` : 'Entry Level',
            saved: savedJobIds.has(j.id),
            applied: appMap.has(j.id),
            applicationStatus: appMap.get(j.id) || undefined,
            requirements: j.requirements || [],
            benefits: j.benefits || [],
          };
        });
        
        setJobs(mappedJobs);

        if (eventsData) setEvents(Array.isArray(eventsData) ? eventsData : []);
        if (mentorsData) setMentors(Array.isArray(mentorsData) ? mentorsData : []);
        const mappedDocuments = (Array.isArray(documentsData) ? documentsData : []).map((doc: any) => ({
          id: doc.id,
          type: doc.documentType || 'Official Transcript',
          requestDate: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
          status: (doc.status === 'COMPLETED' ? 'Approved' : doc.status === 'IN_PROGRESS' ? 'In Progress' : doc.status === 'REJECTED' ? 'Pending' : 'Pending') as any,
          notes: doc.notes || doc.additionalInstructions || 'Awaiting registrar verification.'
        }));
        if (documentsData) setDocuments(mappedDocuments);
        
        if (forumData && Array.isArray(forumData)) setForumPosts(forumData);
        if (campaignsData && Array.isArray(campaignsData)) setCampaigns(campaignsData);
        if (preferencesData) setPreferences(preferencesData as any);
        if (campaignsData && Array.isArray(campaignsData)) setCampaigns(campaignsData);

        // Process message threads for unread count
        if (messageThreadsRes && Array.isArray(messageThreadsRes)) {
          const unreadTotal = messageThreadsRes.reduce((acc, thread) => acc + (thread.unreadCount || 0), 0);
          setUnreadMessagesCount(unreadTotal);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
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
          let surveyType: any = 'Custom';
          const milestone = assignment.survey?.milestoneMonths;
          if (milestone === 6) surveyType = '6-Month';
          else if (milestone === 12) surveyType = '12-Month';
          else if (milestone === 24) surveyType = '24-Month';

          return {
            id: assignment.id,
            title: assignment.survey?.title || 'Tracer Survey',
            description: assignment.survey?.description || '',
            deadline: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '',
            status: assignment.status as any,
            completedAt: assignment.completedAt ? new Date(assignment.completedAt).toLocaleDateString() : undefined,
            type: surveyType,
            questions: []
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
        <div className="text-sm font-semibold text-[var(--text-primary)]">{profile?.fullName || 'Alumni'}</div>
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

  const recruitingItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'management', label: 'Management Hub', icon: 'dashboard_customize' },
    { id: 'jobs', label: 'Jobs Board', icon: 'work' },
    { id: 'career', label: 'Career Center', icon: 'school' },
    { id: 'surveys', label: 'Surveys', icon: 'assignment', badge: realPendingSurveysCount > 0 ? realPendingSurveysCount.toString() : null },
  ];

  const communityItems = [
    { id: 'profile', label: 'My Profile', icon: 'account_circle' },
    { id: 'mentorship', label: 'Mentorship', icon: 'diversity_3' },
    { id: 'forum', label: 'Community', icon: 'group' },
    { id: 'donations', label: 'Giving', icon: 'volunteer_activism' },
  ];

  const serviceItems = [
    { id: 'documents', label: 'Documents', icon: 'description', badge: null as string | null },
    { id: 'messages', label: 'Messages', icon: 'forum', badge: unreadMessagesCount > 0 ? unreadMessagesCount.toString() : null },
    { id: 'settings', label: 'Settings', icon: 'settings', badge: null },
  ];

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
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Clean White Premium Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 flex h-dvh flex-col overflow-hidden shadow-xs transition-all duration-300 md:translate-x-0 bg-white border-r border-slate-200/80 text-slate-800 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        {/* Sidebar Logo Header */}
        <div className="relative z-10 px-4 py-4 border-b border-slate-100">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative shrink-0 flex items-center justify-center h-10 w-10">
              <img
                src="/images/astu-seal-logo.png"
                alt="ASTU Logo"
                className="h-full w-full object-contain scale-110"
              />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">ASTU Alumni</h1>
                <p className="text-[9px] text-emerald-600 uppercase tracking-widest font-extrabold truncate">Graduate Network</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="relative z-10 flex-grow px-3 py-4 overflow-y-auto scrollbar-thin space-y-5">
          {/* Section 1: Recruiting & Career */}
          <div>
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Recruiting & Career</p>
                <span className="text-[8px] text-emerald-700 font-extrabold px-1.5 py-0.5 bg-emerald-50 rounded border border-emerald-200/60">5 items</span>
              </div>
            )}
            <div className="space-y-1">
              {recruitingItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${
                    sidebarCollapsed ? 'justify-center' : 'gap-2.5'
                  } ${
                    activeTab === item.id
                      ? 'bg-[#003366]/10 text-[#003366] font-bold shadow-2xs ring-1 ring-[#003366]/20'
                      : 'text-slate-600 hover:text-[#003366] hover:bg-slate-50'
                  }`}
                >
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    activeTab === item.id ? 'bg-[#003366] text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:text-[#003366]'
                  }`}>
                    <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                  </span>
                  {!sidebarCollapsed && <span className="text-sm font-medium flex-1 truncate text-left">{item.label}</span>}
                  {item.badge && !sidebarCollapsed && (
                    <span className="flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      {item.badge}
                    </span>
                  )}
                  {activeTab === item.id && !sidebarCollapsed && !item.badge && (
                    <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[#003366] shrink-0"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Community & Network */}
          <div>
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2 pt-1">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Community</p>
                <span className="text-[8px] text-slate-500 font-extrabold px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">4 items</span>
              </div>
            )}
            <div className="space-y-1">
              {communityItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${
                    sidebarCollapsed ? 'justify-center' : 'gap-2.5'
                  } ${
                    activeTab === item.id
                      ? 'bg-[#003366]/10 text-[#003366] font-bold shadow-2xs ring-1 ring-[#003366]/20'
                      : 'text-slate-600 hover:text-[#003366] hover:bg-slate-50'
                  }`}
                >
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    activeTab === item.id ? 'bg-[#003366] text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:text-[#003366]'
                  }`}>
                    <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                  </span>
                  {!sidebarCollapsed && <span className="text-sm font-medium flex-1 truncate text-left">{item.label}</span>}
                  {activeTab === item.id && !sidebarCollapsed && (
                    <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[#003366] shrink-0"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Services & Account */}
          <div>
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2 pt-1">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Services</p>
                <span className="text-[8px] text-slate-500 font-extrabold px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">3 items</span>
              </div>
            )}
            <div className="space-y-1">
              {serviceItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${
                    sidebarCollapsed ? 'justify-center' : 'gap-2.5'
                  } ${
                    activeTab === item.id
                      ? 'bg-[#003366]/10 text-[#003366] font-bold shadow-2xs ring-1 ring-[#003366]/20'
                      : 'text-slate-600 hover:text-[#003366] hover:bg-slate-50'
                  }`}
                >
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    activeTab === item.id ? 'bg-[#003366] text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:text-[#003366]'
                  }`}>
                    <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                  </span>
                  {!sidebarCollapsed && <span className="text-sm font-medium flex-1 truncate text-left">{item.label}</span>}
                  {item.badge && !sidebarCollapsed && (
                    <span className="flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      {item.badge}
                    </span>
                  )}
                  {activeTab === item.id && !sidebarCollapsed && !item.badge && (
                    <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[#003366] shrink-0"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="relative z-10 p-3 border-t border-slate-100 space-y-1">
          <button
            onClick={() => setHelpOpen(true)}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all ${
              sidebarCollapsed ? 'justify-center py-2.5' : 'gap-3 py-2 px-3'
            }`}
            title={sidebarCollapsed ? 'Help Center' : undefined}
          >
            <HelpCircle className="h-4.5 w-4.5 text-[#003366] shrink-0" />
            {!sidebarCollapsed && <span>Help Center</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all ${
              sidebarCollapsed ? 'justify-center py-2.5' : 'gap-3 py-2 px-3'
            }`}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`min-h-screen transition-[margin-left] duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Enhanced Header with Glass Effect */}
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
            <div className="min-w-0">
              <h1 className="truncate text-[16px] font-bold tracking-tight text-[var(--text-primary)]">
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
                  {profile?.fullName ? profile.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AU'}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{profile?.fullName || 'Loading...'}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Alumni</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menuOpen && menu}
            </div>
          </div>
        </header>

        {/* Main Workspace Board */}
        <main className="h-[calc(100dvh-4rem)] overflow-y-auto overflow-x-hidden bg-[#f8fafc] p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#003580] border-t-transparent"></div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && profile && (
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
                {managementActions.map((action) => (
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
          {activeTab === 'career' && <CareerTab events={events} jobs={jobs} mentors={mentors} onRegisterEvent={handleRegisterEvent} />}
          {activeTab === 'surveys' && <SurveysTab />}
          {activeTab === 'jobs' && <JobsTab jobs={jobs} onViewJob={setSelectedJobForModal} onToggleSaveJob={handleToggleSaveJob} />}
          {activeTab === 'mentorship' && <MentorshipTab mentors={mentors} onRequestMentorship={handleRequestMentorship} onScheduleSession={handleScheduleSession} />}
          {activeTab === 'documents' && <DocumentServicesTab documentRequests={documents} onRequestDocument={handleRequestDocument} />}
          {activeTab === 'messages' && <MessagingTab darkMode={darkMode} userId={(profile as any)?.userId} />}
          {activeTab === 'settings' && <SettingsTab preferences={preferences as any} onSavePreferences={handleSavePreferences} />}
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
              <div className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Recent Posts</h3>
                <div className="mb-6 flex gap-3">
                  <img src={profile?.profilePicture ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.profilePicture}` : "https://via.placeholder.com/40"} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 relative">
                    <input type="text" placeholder="Share something with the community..." className="w-full text-xs p-3 pr-20 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all" onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { handleCreatePost(e.currentTarget.value); e.currentTarget.value = ''; } }} />
                    <button onClick={(e) => { const input = e.currentTarget.previousElementSibling as HTMLInputElement; if (input.value.trim()) { handleCreatePost(input.value); input.value = ''; } }} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#003366] text-white text-[10px] font-bold rounded-lg hover:bg-[#002244] transition-colors">Post</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {forumPosts.map((post, idx) => (
                    <div key={post.id || idx} className="flex gap-3 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003366]/20 transition-all">
                      <img src={post.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--text-primary)]">{post.author}</span>
                          <span className="text-[9px] text-[var(--text-secondary)]">{post.role || post.authorRole}</span>
                          <span className="text-[9px] text-[var(--text-muted)] ml-auto">{post.time || new Date(post.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button onClick={() => handleToggleLike(post.id)} className={`flex items-center gap-1 text-[10px] transition-colors ${post.liked ? 'text-[#003366] font-bold' : 'text-[var(--text-muted)] hover:text-[#003366]'}`}>
                            <svg className="w-3.5 h-3.5" fill={post.liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            {post.likes}
                          </button>
                          <button className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[#003366] transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            {post.comments}
                          </button>
                          <button className="text-[10px] text-[var(--text-muted)] hover:text-[#003366] transition-colors">Share</button>
                        </div>
                      </div>
                    </div>
                  ))}
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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {campaigns.map((campaign, idx) => (
                  <div key={campaign.id || idx} className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 bg-[#003366]/10 text-[#003366] text-[9px] font-bold rounded-full uppercase">{campaign.category || 'Fund'}</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">{campaign.donorCount || 0} donors</span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{campaign.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{campaign.description || campaign.desc}</p>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-[#003366]">{campaign.raised} ETB</span>
                        <span className="text-[var(--text-muted)]">of {campaign.targetAmount || campaign.goal} ETB</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#003366] to-[#1d9e75] transition-all" style={{ width: `${Math.min(100, Math.round(((campaign.raised || 0) / (campaign.targetAmount || 1)) * 100))}%` }}></div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDonate(campaign.id, 500)} // default amount for demo
                      className="mt-4 w-full py-2.5 bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                    >
                      Donate 500 ETB Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </>
        )}
        </main>
      </div>

      <JobDetailsModal job={selectedJobForModal} onClose={() => setSelectedJobForModal(null)} onApply={handleApplyJob} />

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <TelebirrDonationModal
        isOpen={!!donationCampaign}
        onClose={() => setDonationCampaign(null)}
        campaign={donationCampaign}
      />
    </div>
  );
};

export default AlumniDashboard;
