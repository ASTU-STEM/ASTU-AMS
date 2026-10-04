import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User, X, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  MentorshipSession,
  AlumniApplicationStatus,
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_TERMINAL
} from '../types/alumni.types';

import { alumniService } from '../services/alumni.service';

import { calculateProfileCompletion } from '../utils/profileCompletion';
const calculateCompletion = calculateProfileCompletion;

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
import { AlumniDirectoryTab } from '../components/AlumniDirectoryTab';
import { AlumniToolsPage } from '../../tools/pages/AlumniToolsPage';
import { useSystemSettings } from '../../../context/SystemSettingsContext';
import config from '../../../config';
import { useTheme } from '../../../hooks/useTheme';

interface AlumniDashboardProps {
  defaultTab?: string;
}

/**
 * Labels for the parallel dashboard fetches, in the order they are issued, so a
 * partial failure can be reported to the user by name.
 */
const DASHBOARD_FETCH_LABELS = [
  'your profile',
  'dashboard statistics',
  'job listings',
  'saved jobs',
  'your applications',
  'events',
  'mentors',
  'documents',
  'forum posts',
  'donation campaigns',
  'preferences',
  'messages',
] as const;

const AlumniDashboard: React.FC<AlumniDashboardProps> = ({ defaultTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { settings } = useSystemSettings();
  const brandLogo = config.mediaUrl(settings.appearance?.logoUrl);
  const brandName = (settings.general?.siteName || '').trim();
  const brandTagline = (settings.general?.tagline || '').trim();
  const brandMonogram = (settings.general?.abbreviation || '').trim().slice(0, 4);

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (defaultTab) return defaultTab;
    if (window.location.pathname.endsWith('/tools')) return 'tools';
    if (window.location.pathname.endsWith('/jobs')) return 'jobs';
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('alumni_sidebar_collapsed') === 'true');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  // Sections that failed to load, so a partial outage is visible instead of
  // looking like empty data.
  const [loadIssues, setLoadIssues] = useState<string[]>([]);

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
  const [selectedNotificationDetail, setSelectedNotificationDetail] = useState<any | null>(null);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<{ id: string; textContent: string; imageAttachment: string; linkAttachment: string } | null>(null);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});
  const [forumCategory, setForumCategory] = useState<string>('ALL');
  const [forumSearchQuery, setForumSearchQuery] = useState<string>('');
  const [forumSortBy, setForumSortBy] = useState<'latest' | 'likes' | 'comments'>('latest');
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);
  const [newPostCategory, setNewPostCategory] = useState<string>('Opportunities');
  const [forumStats, setForumStats] = useState<{ totalAlumni: number; totalPosts: number; topContributors: any[] } | null>(null);
  const [visiblePostsCount, setVisiblePostsCount] = useState<number>(5);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string>('');
  const [attachedLinkUrl, setAttachedLinkUrl] = useState<string>('');
  const [likingPosts, setLikingPosts] = useState<Record<string, boolean>>({});

  const [chatTarget, setChatTarget] = useState<any>(null);
  const [pendingCallId, setPendingCallId] = useState<string | null>(null);

  // ── Auto-join meeting from invitation link (?callId=ASTU-MEET-xxx) ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callId = params.get('callId');
    if (callId) {
      // Extract participant info from the callId
      const meetId = callId.replace('ASTU-MEET-', '');
      setPendingCallId(callId);
      setChatTarget({
        id: meetId,
        userId: meetId,
        name: 'Meeting Participant',
        roleLabel: 'Video Call Invitation',
      });
      setActiveTab('messages');
      toast.success('🎥 Joining meeting room...');
      // Clean the URL so refreshing doesn't re-trigger
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const profileCompletion = profile ? calculateCompletion(profile) : (statsData?.profileCompletion || 0);
  const pendingSurveysCount = realPendingSurveysCount;
  const matchCount = statsData?.openJobMatches || (Array.isArray(jobs) ? jobs.filter(j => !j.applied).length : 0);
  const connectedMentorsCount = statsData?.activeMentorships || (Array.isArray(mentors) ? mentors.filter(m => m.status === 'CONNECTED' || m.status === 'REQUEST_PENDING').length : 0);

  const stats = [
    { id: 1, label: 'Profile Status', value: `${profileCompletion}%`, color: 'astu-navy', icon: 'account_circle', bgGradient: 'from-blue-50 to-indigo-50', trend: 'Complete fields to boost', trendIcon: 'trending_up', trendColor: 'astu-green' },
    { id: 2, label: 'Job Matches', value: `${matchCount}`, color: 'astu-green', icon: 'work', bgGradient: 'from-emerald-50 to-green-50', trend: `${matchCount} open matches`, trendIcon: 'work', trendColor: 'astu-green' },
    { id: 3, label: 'Pending Surveys', value: `${pendingSurveysCount}`, color: 'astu-red', icon: 'assignment', bgGradient: 'from-red-50 to-orange-50', trend: pendingSurveysCount > 0 ? 'Urgent Tracer studies' : 'All studies submitted', trendIcon: pendingSurveysCount > 0 ? 'schedule' : 'check_circle', trendColor: pendingSurveysCount > 0 ? 'astu-red' : 'astu-green' },
    { id: 4, label: 'Network Peers', value: `${connectedMentorsCount}`, color: 'purple-600', icon: 'people', bgGradient: 'from-purple-50 to-pink-50', trend: `${connectedMentorsCount} connected`, trendIcon: 'people', trendColor: 'astu-purple' },
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
      toast.success('Profile saved.');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleUpdateEmploymentStatus = (role: string, company: string, salary: string) => {
    const updatedProfile = { ...profile, currentRole: role, company, salaryRange: salary };
    setProfile(updatedProfile);
  };

  const handleApplyJob = async (jobId: string | number, coverLetter?: string) => {
    try {
      await alumniService.applyToJob(String(jobId), { coverLetter });
      const updatedJobs = jobs.map(j => j.id === jobId ? {
        ...j,
        applied: true,
        applicationStatus: 'Applied' as const,
        applications: j.applications + 1
      } : j);
      setJobs(updatedJobs);
      const appliedJob = jobs.find(j => j.id === jobId);
      if (appliedJob) {
        toast.success(`Application sent to ${appliedJob.company}!`);
        setNotifications(prev => [{ id: Date.now(), text: `Applied for ${appliedJob.title} at ${appliedJob.company}.`, unread: true, time: 'Just now' }, ...prev]);
      }
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit application. Please try again later.';
      toast.error(msg);
    }
  };

  const handleViewJob = async (job: JobMatch) => {
    setSelectedJobForModal(job);
    if (!job.id || typeof job.id === 'number' || String(job.id).length < 10) return;
    try {
      const detail: any = await alumniService.getJobDetail(String(job.id));
      if (detail) {
        setJobs(prevJobs => prevJobs.map(j => {
          if (String(j.id) === String(job.id)) {
            return {
              ...j,
              views: detail.viewsCount ?? detail.viewCount ?? (j.views + 1),
              applications: detail.applicationsCount ?? detail.applicationCount ?? j.applications,
              shortlisted: detail.shortlistedCount ?? j.shortlisted
            };
          }
          return j;
        }));
      }
    } catch (_) { }
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

  const handleWithdrawApplication = async (jobId: string | number) => {
    try {
      await alumniService.withdrawApplication(String(jobId));
      setJobs(prev => prev.map(j => String(j.id) === String(jobId) ? {
        ...j,
        applicationStatus: 'Withdrawn',
        applicationStatusRaw: 'WITHDRAWN',
        canWithdraw: false,
      } : j));
      toast.success('Application withdrawn.');
    } catch (err: any) {
      console.error('Failed to withdraw application:', err);
      const msg = err?.response?.data?.message || 'Failed to withdraw application.';
      toast.error(msg);
    }
  };

  const handleCompleteSurvey = (surveyId: number, answers: Record<string, string>) => {
    const updatedSurveys = surveys.map(s => s.id === surveyId ? { ...s, status: 'COMPLETED' as const, completedAt: new Date().toLocaleDateString() } : s);
    setSurveys(updatedSurveys);
    setNotifications(prev => [{ id: Date.now(), text: `Submitted Tracer Survey: ${surveys.find(s => s.id === surveyId)?.title}.`, unread: true, time: 'Just now' }, ...prev]);
  };

  const handleRegisterEvent = async (eventId: number | string) => {
    try {
      const strId = String(eventId);
      await alumniService.rsvpEvent(strId, 'ATTENDING').catch(err => {
        console.warn('API RSVP sync warning:', err);
      });

      // Save to localStorage persistence
      try {
        const saved = localStorage.getItem('astu_registered_event_ids');
        const list = saved ? JSON.parse(saved) : [];
        if (!list.includes(strId)) list.push(strId);
        localStorage.setItem('astu_registered_event_ids', JSON.stringify(list));
      } catch (_) { }

      const updatedEvents = events.map(e => String(e.id) === strId ? { ...e, registered: true } : e);
      setEvents(updatedEvents);
      const targetEvent = events.find(e => String(e.id) === strId);
      if (targetEvent) {
        setNotifications(prev => [{ id: Date.now(), text: `Registered for event: ${targetEvent.title}.`, unread: true, time: 'Just now' }, ...prev]);
      }
    } catch (err) {
      console.error('Failed to register for event:', err);
      toast.error('Failed to complete event registration.');
    }
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

  const handleRequestDocument = async (type: DocumentRequest['type'], notes?: string, fileUrls?: string[]) => {
    try {
      await alumniService.requestDocument({ documentType: type, additionalInstructions: notes, fileUrls });
      const newDoc: DocumentRequest = { id: documents.length + 1, type, requestDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), status: 'Pending', notes: notes || 'Awaiting registrar verification.' };
      setDocuments([newDoc, ...documents]);
      setNotifications(prev => [{ id: Date.now(), text: `Submitted official request for: ${type}.`, unread: true, time: 'Just now' }, ...prev]);
      toast.success('Document request submitted successfully');
    } catch (err) {
      toast.error('Failed to submit document request');
    }
  };

  const refreshForumData = async () => {
    try {
      const res: any = await alumniService.getForumPosts();
      if (res && res.posts && Array.isArray(res.posts)) {
        setForumPosts(res.posts);
        if (res.stats) setForumStats(res.stats);
      } else if (Array.isArray(res)) {
        setForumPosts(res);
      }
    } catch (_) { }
  };

  const handleCreatePost = async (content: string, category: string = newPostCategory) => {
    try {
      let finalContent = content.trim();
      if (attachedImageUrl) {
        finalContent += `\n\n![Post Image](${attachedImageUrl})`;
      }
      if (attachedLinkUrl) {
        finalContent += `\n\n🔗 Attachment: ${attachedLinkUrl}`;
      }
      await alumniService.createForumPost(finalContent, category);
      await refreshForumData();
      setAttachedImageUrl('');
      setAttachedLinkUrl('');
      toast.success('Post published to Alumni Community!');
    } catch (err) {
      toast.error('Failed to create post');
    }
  };

  const handleUpdatePost = async (postId: string, newContent: string) => {
    try {
      await alumniService.updateForumPost(postId, newContent);
      await refreshForumData();
      setEditingPost(null);
      toast.success('Post updated successfully!');
    } catch (err) {
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await alumniService.deleteForumPost(postId);
      await refreshForumData();
      toast.success('Post deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (likingPosts[postId]) return;

    setLikingPosts(prev => ({ ...prev, [postId]: true }));

    // Optimistic update
    setForumPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.liked;
        return {
          ...p,
          liked: nextLiked,
          likes: Math.max(0, (p.likes || 0) + (nextLiked ? 1 : -1))
        };
      }
      return p;
    }));

    try {
      const res: any = await alumniService.toggleForumLike(postId);
      if (res && typeof res.liked === 'boolean') {
        setForumPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: res.liked } : p));
      }
    } catch (err) {
      setForumPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const revertLiked = !p.liked;
          return {
            ...p,
            liked: revertLiked,
            likes: Math.max(0, (p.likes || 0) + (revertLiked ? 1 : -1))
          };
        }
        return p;
      }));
      toast.error('Failed to update like status');
    } finally {
      setLikingPosts(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;
    try {
      await alumniService.addForumComment(postId, text);
      await refreshForumData();
      setNewCommentText(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment published!');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const getPostViews = (postId: string) => {
    try {
      const key = `astu_forum_views_${postId}`;
      const stored = localStorage.getItem(key);
      if (stored !== null) return parseInt(stored, 10);
      localStorage.setItem(key, '1');
      return 1;
    } catch (_) {
      return 1;
    }
  };

  const handleSharePost = (post: any) => {
    navigator.clipboard.writeText(`${window.location.origin}/alumni/dashboard?tab=forum&post=${post.id}`);
    toast.success('Post link copied to clipboard!');
  };

  const handleToggleBookmark = (postId: string) => {
    setBookmarkedPostIds(prev => {
      const exists = prev.includes(postId);
      if (exists) {
        toast('Post removed from saved bookmarks', { icon: '🔖' });
        return prev.filter(id => id !== postId);
      } else {
        toast.success('Post saved to your bookmarks!');
        return [...prev, postId];
      }
    });
  };

  const handleDonate = (campaignId: string, amount: number = 500) => {
    const targetCampaign = campaigns.find(c => c.id === campaignId) || {
      id: campaignId,
      title: 'ASTU Fund',
      category: 'Scholarship'
    };
    setDonationCampaign({ ...targetCampaign, defaultAmount: amount });
  };

  const handleRefreshCampaigns = async () => {
    try {
      const campaignsRes = await alumniService.getDonationCampaigns();
      if (Array.isArray(campaignsRes)) setCampaigns(campaignsRes);
    } catch (err) {
      console.error('Failed to refresh campaigns', err);
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
    // Collects the sections that failed so the page can say so, instead of
    // rendering them as legitimately empty.
    const issues: string[] = [];
    const settle = async <T,>(promise: Promise<T>, fallback: T, index: number): Promise<T> => {
      try {
        return await promise;
      } catch {
        issues.push(DASHBOARD_FETCH_LABELS[index] ?? `section ${index + 1}`);
        return fallback;
      }
    };
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
          // Each of these previously carried an inline `.catch(() => fallback)`,
          // so one failed request produced a dashboard that looked populated
          // while silently showing nothing for that section. The local settle()
          // keeps partial data working but records what failed.
          settle(alumniService.getProfile(), null, 0),
          settle(alumniService.getDashboardStats(), null, 1),
          settle(alumniService.getJobs(), { data: [] }, 2),
          settle(alumniService.getSavedJobs(), { data: [] }, 3),
          settle(alumniService.getMyApplications(), [], 4),
          settle(alumniService.getEvents(), [], 5),
          settle(alumniService.getMentorProfiles(), [], 6),
          settle(alumniService.getMyDocuments(), [], 7),
          settle(alumniService.getForumPosts(), [], 8),
          settle(alumniService.getDonationCampaigns(), [], 9),
          settle(alumniService.getPreferences(), {}, 10),
          settle(alumniService.getMessageThreads(), [], 11),
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
        // Keep the raw enum alongside the label: the withdraw action needs to
        // know whether the state is terminal, and the label alone loses that.
        const appMap = new Map<string, { label: AlumniApplicationStatus; raw: string }>();
        applicationsList.forEach((app: any) => {
          const raw = String(app.status || 'PENDING');
          const label = APPLICATION_STATUS_LABEL[raw] || 'Applied';
          const key = app.jobId || app.job?.id;
          if (key) appMap.set(key, { label, raw });
        });

        const mappedJobs: JobMatch[] = rawJobs.map((j: any) => {
          let empType: 'Full-Time' | 'Part-Time' | 'Internship' | 'Contract' = 'Full-Time';
          if (j.employmentType === 'FULL_TIME') empType = 'Full-Time';
          else if (j.employmentType === 'PART_TIME') empType = 'Part-Time';
          else if (j.employmentType === 'INTERNSHIP') empType = 'Internship';
          else if (j.employmentType === 'CONTRACT') empType = 'Contract';
          else if (j.type) empType = j.type;

          let companyName = j.companyName || j.employer?.companyName;
          if (!companyName || companyName === 'Employer details unavailable') {
            companyName = j.department ? `ASTU ${j.department} Corporate Partner` : 'ASTU Corporate Partner';
          }

          let formattedSalary = 'Negotiable';
          if (j.salary) {
            const rawSalary = String(j.salary).trim();
            if (rawSalary.toLowerCase().includes('etb')) {
              formattedSalary = rawSalary;
            } else if (!isNaN(Number(rawSalary))) {
              formattedSalary = `${Number(rawSalary).toLocaleString()} ETB`;
            } else {
              formattedSalary = `${rawSalary} ETB`;
            }
          } else if (j.salaryMin || j.salaryMax) {
            formattedSalary = `${(j.salaryMin || 0).toLocaleString()} - ${(j.salaryMax || 0).toLocaleString()} ETB`;
          }

          let reqs: string[] = [];
          if (Array.isArray(j.requirements) && j.requirements.length > 0) {
            reqs = j.requirements;
          } else if (typeof j.requirements === 'string' && j.requirements.trim()) {
            reqs = [j.requirements.trim()];
          } else if (Array.isArray(j.skillsRequired) && j.skillsRequired.length > 0) {
            reqs = j.skillsRequired.map((s: string) => `Proficiency in ${s}`);
          }

          // Read the value just fetched, not the `profile` state: setProfile()
          // earlier in this effect has not been applied yet, so the state is
          // still null on first load and every match score was computed against
          // an empty skill set.
          const userSkills = new Set(
            ((profileData as any)?.skills || []).map((s: string) => String(s).toLowerCase()),
          );
          const jobSkills = (j.skillsRequired || []).map((s: string) => s.toLowerCase());
          const matchHits = jobSkills.filter((s: string) => userSkills.has(s)).length;
          const matchPercent = jobSkills.length > 0 
            ? Math.min(99, Math.max(78, Math.round((matchHits / jobSkills.length) * 40) + 60))
            : 90;

          return {
            id: j.id,
            title: j.title,
            company: companyName,
            location: j.location || 'Addis Ababa',
            type: empType,
            salary: formattedSalary,
            postedDate: j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            match: `${matchPercent}%`,
            description: j.description || '',
            skills: Array.isArray(j.skillsRequired) ? j.skillsRequired : (j.skills || []),
            views: j.viewsCount ?? j.viewCount ?? j._count?.views ?? j.views ?? 0,
            applications: j.applicationsCount ?? j.applicationCount ?? j._count?.applications ?? j.applications ?? 0,
            shortlisted: j.shortlistedCount ?? j.shortlisted ?? 0,
            experience: j.experienceRequired ? `${j.experienceRequired} yrs` : (j.experienceLevel || 'Entry Level'),
            saved: savedJobIds.has(j.id),
            applied: appMap.has(j.id),
            applicationStatus: appMap.get(j.id)?.label,
            applicationStatusRaw: appMap.get(j.id)?.raw,
            canWithdraw: appMap.has(j.id) && !APPLICATION_STATUS_TERMINAL.has(appMap.get(j.id)!.raw),
            requirements: reqs,
            benefits: Array.isArray(j.benefits) ? j.benefits : (typeof j.benefits === 'string' ? [j.benefits] : []),
            department: j.department || undefined,
            responsibilities: j.responsibilities || undefined,
            deadline: j.deadline ? new Date(j.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
          };
        });

        setJobs(mappedJobs);

        let savedRegisteredEventIds = new Set<string>();
        try {
          const saved = localStorage.getItem('astu_registered_event_ids');
          if (saved) JSON.parse(saved).forEach((id: string) => savedRegisteredEventIds.add(String(id)));
        } catch (_) { }

        if (eventsData && Array.isArray(eventsData)) {
          const mappedEvents = eventsData.map((ev: any) => ({
            ...ev,
            registered: Boolean(ev.registered || savedRegisteredEventIds.has(String(ev.id)))
          }));
          setEvents(mappedEvents);
        }

        if (mentorsData) setMentors(Array.isArray(mentorsData) ? mentorsData : []);
        const mappedDocuments = (Array.isArray(documentsData) ? documentsData : []).map((doc: any) => {
          const rawStatus = String(doc.status || '').toUpperCase();
          const mappedStatus = (rawStatus === 'APPROVED' || rawStatus === 'COMPLETED')
            ? 'Approved'
            : rawStatus === 'IN_PROGRESS'
            ? 'In Progress'
            : rawStatus === 'REJECTED'
            ? 'Rejected'
            : 'Pending';

          return {
            id: doc.id,
            type: doc.documentType || 'Official Transcript',
            requestDate: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            status: mappedStatus as any,
            notes: doc.notes || doc.additionalInstructions || 'Awaiting registrar verification.',
            issuedDocumentUrl: doc.issuedDocumentUrl
          };
        });
        if (documentsData) setDocuments(mappedDocuments);

        const DEFAULT_PREFS = {
          emailJobs: true,
          emailSurveys: true,
          emailMentorship: true,
          emailEvents: true,
          emailNewsletter: true,
          smsNotifications: true,
          profileVisibleToEmployers: true,
          shareCgpaToEmployers: true,
          profileVisibleToPeers: true,
          profileVisibleToAlumni: true,
          anonymousTracerResponses: false,
          shareAchievementsPublic: true,
          digestFrequency: 'instant',
          donationEnabled: true,
        };
        if (preferencesData) {
          setPreferences({ ...DEFAULT_PREFS, ...(preferencesData as any) });
        } else {
          setPreferences(DEFAULT_PREFS as any);
        }

        // Process message threads for unread count
        if (messageThreadsRes && Array.isArray(messageThreadsRes)) {
          const unreadTotal = messageThreadsRes.reduce((acc, thread) => acc + (thread.unreadCount || 0), 0);
          setUnreadMessagesCount(unreadTotal);
        }

        // Set Community Forum Posts & Real Database Stats
        const forumRes = forumData as any;
        if (forumRes) {
          if (forumRes.posts && Array.isArray(forumRes.posts)) {
            setForumPosts(forumRes.posts);
            if (forumRes.stats) setForumStats(forumRes.stats);
          } else if (Array.isArray(forumRes)) {
            setForumPosts(forumRes);
          }
        }

        // Set Giving / Donation Campaigns
        if (campaignsData && Array.isArray(campaignsData)) {
          setCampaigns(campaignsData);
        }

        // Surface partial failures rather than silently rendering empty sections.
        setLoadIssues(issues);
        if (issues.length > 0) {
          console.warn('[AlumniDashboard] sections failed to load:', issues);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setLoadIssues(['the dashboard']);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  useEffect(() => {
    const fetchPendingSurveys = async () => {
      try {
        const data = await surveyService.getMySurveys().catch(() => []);
        const safeData = Array.isArray(data) ? data : [];
        const pending = safeData.filter((item: any) => item?.status === 'PENDING' || item?.status === 'IN_PROGRESS').length;
        setRealPendingSurveysCount(pending);

        let historyData: any[] = [];
        try {
          const hist = await surveyService.getMyHistory().catch(() => []);
          historyData = Array.isArray(hist) ? hist : [];
        } catch (err) {
          console.error('Failed to load history surveys', err);
        }

        const allAssignments = [...safeData, ...historyData];
        const mappedSurveys: TracerSurvey[] = allAssignments.map((assignment: any) => {
          let surveyType: any = 'Custom';
          const milestone = assignment?.survey?.milestoneMonths;
          if (milestone === 6) surveyType = '6-Month';
          else if (milestone === 12) surveyType = '12-Month';
          else if (milestone === 24) surveyType = '24-Month';

          return {
            id: assignment?.id || String(Math.random()),
            title: assignment?.survey?.title || 'Tracer Survey',
            description: assignment?.survey?.description || '',
            deadline: assignment?.dueDate && !isNaN(new Date(assignment.dueDate).getTime()) ? new Date(assignment.dueDate).toLocaleDateString() : '',
            status: assignment?.status || 'PENDING',
            completedAt: assignment?.completedAt && !isNaN(new Date(assignment.completedAt).getTime()) ? new Date(assignment.completedAt).toLocaleDateString() : undefined,
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
        const data = await notificationService.getMyNotifications().catch(() => []);
        const safeNotifications = Array.isArray(data) ? data : [];
        setNotifications(safeNotifications.map((n: any) => ({
          id: n.id,
          title: n.title || 'ASTU Broadcast Notice',
          content: n.content || n.message || n.text || '',
          text: n.content || n.title || 'Notification',
          unread: !n.isRead,
          time: n.createdAt && !isNaN(new Date(n.createdAt).getTime()) ? new Date(n.createdAt).toLocaleString() : 'Recently',
          type: n.type || 'In-App',
          priority: n.priority || 'Normal',
          category: n.category || 'General',
          imageUrl: n.imageUrl,
          ctaLink: n.ctaLink,
          ctaText: n.ctaText
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
      <button
        type="button"
        onClick={() => {
          toggleTheme();
          toast.success(darkMode ? 'Light theme activated' : 'Dark theme activated');
        }}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
      >
        <span className="flex items-center gap-2">
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          <span>Theme</span>
        </span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)]">
          {darkMode ? 'Dark' : 'Light'}
        </span>
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
    { id: 'tools', label: 'Tools', icon: 'construction' },
  ];

  const communityItems = [
    { id: 'profile', label: 'My Profile', icon: 'account_circle' },
    { id: 'mentorship', label: 'Mentorship', icon: 'diversity_3' },
    { id: 'directory', label: 'Directory', icon: 'travel_explore' },
    { id: 'forum', label: 'Community', icon: 'group' },
    { id: 'donations', label: 'Giving', icon: 'volunteer_activism' },
  ];

  const serviceItems = [
    { id: 'documents', label: 'Documents', icon: 'description', badge: null as string | null },
    { id: 'messages', label: 'Messages', icon: 'forum', badge: unreadMessagesCount > 0 ? unreadMessagesCount.toString() : null },
    { id: 'settings', label: 'Settings', icon: 'settings', badge: null },
  ];

  return (
    <div className="app-shell min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
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

      {/* Premium Sidebar — theme-aware */}
      <aside className={`fixed left-0 top-0 z-40 flex h-dvh flex-col overflow-hidden shadow-xs transition-all duration-300 md:translate-x-0 bg-[var(--bg-card)] border-r border-[var(--border-color)] text-[var(--text-primary)] ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        {/* Sidebar Brand Header — every value comes from GET /admin/settings/public */}
        <div className="relative z-10 px-4 py-4 border-b border-[var(--border-color)]">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            {brandLogo ? (
              <div className="relative shrink-0 flex items-center justify-center h-10 w-10">
                <img
                  src={brandLogo}
                  alt={brandName || settings.general?.universityName || 'University logo'}
                  className="h-full w-full object-contain scale-110"
                />
              </div>
            ) : brandMonogram ? (
              <div className="relative shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-[#003366] text-white text-[11px] font-extrabold tracking-tight">
                {brandMonogram}
              </div>
            ) : null}
            {!sidebarCollapsed && (brandName || brandTagline) && (
              <div className="min-w-0">
                {brandName && <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight truncate">{brandName}</h1>}
                {brandTagline && <p className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-extrabold truncate">{brandTagline}</p>}
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
              </div>
            )}
            <div className="space-y-1">
              {recruitingItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'
                    } ${activeTab === item.id
                      ? 'bg-[#003366]/10 text-[#003366] font-bold shadow-2xs ring-1 ring-[#003366]/20'
                      : 'text-slate-600 hover:text-[#003366] hover:bg-slate-50'
                    }`}
                >
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-[#003366] text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:text-[#003366]'
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
              </div>
            )}
            <div className="space-y-1">
              {communityItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'
                    } ${activeTab === item.id
                      ? 'bg-[#003366]/10 text-[#003366] font-bold shadow-2xs ring-1 ring-[#003366]/20'
                      : 'text-slate-600 hover:text-[#003366] hover:bg-slate-50'
                    }`}
                >
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-[#003366] text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:text-[#003366]'
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
              </div>
            )}
            <div className="space-y-1">
              {serviceItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'
                    } ${activeTab === item.id
                      ? 'bg-[#003366]/10 text-[#003366] font-bold shadow-2xs ring-1 ring-[#003366]/20'
                      : 'text-slate-600 hover:text-[#003366] hover:bg-slate-50'
                    }`}
                >
                  <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-[#003366] text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:text-[#003366]'
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
            type="button"
            onClick={() => {
              toggleTheme();
              toast.success(darkMode ? 'Light theme activated' : 'Dark theme activated');
            }}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all ${sidebarCollapsed ? 'justify-center py-2.5' : 'gap-3 py-2 px-3'
              }`}
            title={sidebarCollapsed ? (darkMode ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500 shrink-0" /> : <Moon className="h-4.5 w-4.5 text-slate-600 shrink-0" />}
            {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={() => setHelpOpen(true)}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all ${sidebarCollapsed ? 'justify-center py-2.5' : 'gap-3 py-2 px-3'
              }`}
            title={sidebarCollapsed ? 'Help Center' : undefined}
          >
            <HelpCircle className="h-4.5 w-4.5 text-[#003366] shrink-0" />
            {!sidebarCollapsed && <span>Help Center</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all ${sidebarCollapsed ? 'justify-center py-2.5' : 'gap-3 py-2 px-3'
              }`}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`app-shell min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 transition-[margin-left] duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Enhanced Header with Glass Effect */}
        <header
          className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-6 shrink-0"
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

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="group hidden h-11 w-full max-w-[300px] xl:max-w-[400px] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 md:flex focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
              style={{ borderColor: 'var(--border-color)' }}>
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                <Search className="h-4.5 w-4.5 flex-none" />
              </span>
              <input type="text" placeholder="Search alumni, companies, or mentors..."
                className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
                onChange={(e) => { if (activeTab === 'dashboard' && e.target.value.trim().length > 1) setActiveTab('jobs'); }} />
            </label>

            <button
              type="button"
              onClick={() => {
                toggleTheme();
                toast.success(darkMode ? 'Light theme activated' : 'Dark theme activated');
              }}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] transition-colors"
              aria-label="Toggle dark mode"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300" />}
            </button>

            <div className="relative shrink-0" data-admin-notifications>
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
                      <button
                        onClick={async () => {
                          await handleMarkNotificationsRead();
                          toast.success('All notifications marked as read.');
                        }}
                        className="text-xs font-semibold text-[#E24B4A] hover:underline"
                      >
                        Mark All as Read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 space-y-1 overflow-y-auto p-2">
                    {notifications.length > 0 ? notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          if (n.unread) {
                            await handleClearNotification(n.id);
                          }
                          setNotificationOpen(false);
                          setSelectedNotificationDetail(n);
                        }}
                        className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-black/5"
                      >
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.unread ? 'bg-[#003580]' : 'bg-gray-300'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">{n.title || 'Notification'}</p>
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{n.text}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{n.time}</p>
                        </div>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleClearNotification(n.id);
                          }}
                          className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Mark as read"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )) : <p className="px-2 py-6 text-center text-sm text-[var(--text-secondary)]">No notifications</p>}
                  </div>
                  <div className="border-t border-[var(--border-color)] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationOpen(false);
                        setShowAllNotificationsModal(true);
                      }}
                      className="text-sm font-semibold text-[#003580] hover:underline"
                    >
                      View all →
                    </button>
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
        <main id="main-content" tabIndex={-1} className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-[#f8fafc] dark:bg-slate-950 p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
          {/* Partial-failure banner. Previously every fetch had an inline
              `.catch(() => fallback)`, so a failed request looked exactly like
              empty data and the user had no way to tell the difference. */}
          {loadIssues.length > 0 && (
            <div
              role="alert"
              className="mx-auto max-w-[1600px] flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="min-w-0 flex-1">
                <span className="font-bold">Couldn’t load some profile data.</span>{' '}
                Still missing: {loadIssues.slice(0, 4).join(', ')}
                {loadIssues.length > 4 ? ` +${loadIssues.length - 4} more` : ''}. Other sections are available.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="shrink-0 rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                Retry now
              </button>
            </div>
          )}
          <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
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

              {activeTab === 'jobs' && (
                <JobsTab
                  jobs={jobs}
                  onViewJob={handleViewJob}
                  onToggleSaveJob={handleToggleSaveJob}
                />
              )}

              {activeTab === 'profile' && <ProfileTab profile={profile} onSave={handleSaveProfile} />}
              {activeTab === 'career' && (
                <CareerTab
                  events={events}
                  jobs={jobs}
                  mentors={mentors}
                  profile={profile}
                  statsData={statsData}
                  onRegisterEvent={handleRegisterEvent}
                  onApplyJob={handleApplyJob}
                  onViewJob={handleViewJob}
                  onRequestMentorship={handleRequestMentorship}
                />
              )}
              {activeTab === 'surveys' && <SurveysTab />}
              {activeTab === 'tools' && (
                <AlumniToolsPage
                  profile={profile}
                  jobs={jobs}
                  surveys={surveys}
                  mentors={mentors}
                  documents={documents}
                />
              )}
              {activeTab === 'directory' && (
                <AlumniDirectoryTab
                  onOpenChat={(alumni: any) => {
                    setChatTarget({
                      userId: alumni.userId || alumni.id,
                      name: alumni.name,
                      avatar: alumni.avatar,
                      roleLabel: `${alumni.department || 'ASTU'} Graduate`
                    });
                    setActiveTab('messages');
                    toast.success(`Opening direct chat with ${alumni.name} in ASTU_AMS Hub...`);
                  }}
                />
              )}
              {activeTab === 'mentorship' && (
                <MentorshipTab
                  mentors={mentors}
                  onRequestMentorship={handleRequestMentorship}
                  onScheduleSession={handleScheduleSession}
                  onStartVideoCall={(m) => {
                    setChatTarget({
                      name: m.name,
                      roleLabel: m.role || 'Senior ASTU Mentor'
                    });
                    setActiveTab('messages');
                    toast.success(`Joining HD Video Meeting with ${m.name}...`);
                  }}
                />
              )}
              {activeTab === 'documents' && <DocumentServicesTab documentRequests={documents} onRequestDocument={handleRequestDocument} />}
              {activeTab === 'messages' && <MessagingTab darkMode={darkMode} userId={(profile as any)?.userId} initialTarget={chatTarget} initialCallId={pendingCallId} />}
              {activeTab === 'settings' && <SettingsTab preferences={preferences as any} onSavePreferences={handleSavePreferences} />}
              {activeTab === 'forum' && (
                <div className="space-y-4 sm:space-y-6 p-1 sm:p-4 md:p-6 max-w-7xl mx-auto">

                  {/* ── 1. Hero Header Banner ───────────────────────────────────────── */}
                  <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-gradient-to-r from-[#003366] via-[#004d99] to-[#1d9e75] p-4 sm:p-6 md:p-8 text-white shadow-xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFD700]/15 rounded-full blur-xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 border border-white/20">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          Community
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Alumni forum</h2>
                        <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                          Share opportunities, ask questions, and stay connected with ASTU graduates worldwide.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 self-start md:self-auto">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
                          <span className="material-symbols-outlined">forum</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">{forumStats?.totalAlumni ? forumStats.totalAlumni.toLocaleString() : '15,420'} members</p>
                          <p className="text-[10px] text-white/70">{forumStats?.totalPosts ? forumStats.totalPosts.toLocaleString() : '3,890'} discussions</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ── 2. Pinned University Announcement ────────────────────────────── */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 flex items-start gap-3 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                      📌
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[9px] font-black uppercase">Official</span>
                        <span className="text-[10px] text-slate-400">ASTU Registrar Office</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">Alumni Summit & Technology Expo 2026</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        Registration is open — join on campus or online for keynotes, networking, and project showcases.
                      </p>
                    </div>
                  </div>

                  {/* ── 3. Search, Category Filter Pills & Sort Bar ──────────────────── */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)] shadow-xs">

                    {/* Category Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5" style={{ scrollbarWidth: 'none' }}>
                      {[
                        { id: 'ALL', label: 'All topics', icon: 'forum' },
                        { id: 'Opportunities', label: 'Opportunities', icon: 'work' },
                        { id: 'Campus', label: 'Campus & tech', icon: 'school' },
                        { id: 'Mentorship', label: 'Mentorship', icon: 'handshake' },
                        { id: 'BOOKMARKS', label: 'Saved', icon: 'bookmark' },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setForumCategory(cat.id)}
                          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${forumCategory === cat.id
                              ? 'bg-[#003366] text-white shadow-md shadow-blue-950/20 scale-105'
                              : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                          <span className="material-symbols-outlined text-[16px] leading-none">{cat.icon}</span>
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Search & Sort Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <div className="relative flex-1 w-full sm:w-56">
                        <input
                          type="text"
                          placeholder="Search posts or authors…"
                          value={forumSearchQuery}
                          onChange={(e) => setForumSearchQuery(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-2 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none text-[var(--text-primary)]"
                        />
                        <span className="material-symbols-outlined text-sm absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                      </div>

                      <select
                        value={forumSortBy}
                        onChange={(e) => setForumSortBy(e.target.value as any)}
                        className="text-xs px-3 py-2 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-bold focus:outline-none cursor-pointer w-full sm:w-auto"
                      >
                        <option value="latest">Latest</option>
                        <option value="likes">Most liked</option>
                        <option value="comments">Most discussed</option>
                      </select>
                    </div>
                  </div>

                  {/* ── 4. Main 2-Column Grid Layout (Feed + Right Sidebar) ────────────── */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Feed (2 Cols Wide on LG) */}
                    <div className="lg:col-span-2 space-y-5">

                      {/* Rich Post Creator Box */}
                      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm space-y-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={profile?.profilePicture ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.profilePicture}` : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#003366]/30 flex-shrink-0"
                          />
                          <div className="flex-1 space-y-2">
                            <textarea
                              placeholder="Share an update, ask a question, or post an opportunity…"
                              id="community-post-input"
                              className="w-full text-sm p-3 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all resize-none h-20 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
                                  e.preventDefault();
                                  handleCreatePost(e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />

                            {/* Hidden file input for Photo Upload */}
                            <input
                              type="file"
                              id="forum-photo-upload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) {
                                      setAttachedImageUrl(String(ev.target.result));
                                      toast.success('Photo attached to post!');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />

                            {/* Attachment Previews */}
                            {(attachedImageUrl || attachedLinkUrl) && (
                              <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                {attachedImageUrl && (
                                  <div className="relative inline-block">
                                    <img src={attachedImageUrl} alt="Attachment" className="w-16 h-12 rounded-lg object-cover ring-1 ring-blue-500/30" />
                                    <button
                                      type="button"
                                      onClick={() => setAttachedImageUrl('')}
                                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-md"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                                {attachedLinkUrl && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-900 text-[#003366] dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-slate-700">
                                    <span>🔗</span>
                                    <span className="max-w-[150px] truncate">{attachedLinkUrl}</span>
                                    <button
                                      type="button"
                                      onClick={() => setAttachedLinkUrl('')}
                                      className="text-rose-500 font-bold ml-1 hover:text-rose-700"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <div className="flex items-center gap-2">
                                <select
                                  value={newPostCategory}
                                  onChange={(e) => setNewPostCategory(e.target.value)}
                                  className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-secondary)] focus:outline-none cursor-pointer"
                                >
                                  <option value="Opportunities">Opportunities</option>
                                  <option value="Campus">Campus & tech</option>
                                  <option value="Mentorship">Mentorship</option>
                                  <option value="General">General</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => document.getElementById('forum-photo-upload')?.click()}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs flex items-center gap-1 font-semibold transition-colors"
                                >
                                  <span className="material-symbols-outlined text-sm">image</span> Photo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const url = window.prompt('Paste a webpage or article URL:', 'https://');
                                    if (url && url.trim() && url !== 'https://') {
                                      setAttachedLinkUrl(url.trim());
                                      toast.success('Link attached');
                                    }
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs flex items-center gap-1 font-semibold transition-colors"
                                >
                                  <span className="material-symbols-outlined text-sm">link</span> Link
                                </button>
                              </div>

                              <button
                                onClick={() => {
                                  const input = document.getElementById('community-post-input') as HTMLTextAreaElement;
                                  if (input && (input.value.trim() || attachedImageUrl || attachedLinkUrl)) {
                                    handleCreatePost(input.value);
                                    input.value = '';
                                  }
                                }}
                                className="px-5 py-2 bg-gradient-to-r from-[#003366] to-[#004d99] text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                              >
                                Publish
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Post Feed List */}
                      {(() => {
                        try {
                          const safePosts = Array.isArray(forumPosts) ? forumPosts : [];
                          const safeBookmarks = Array.isArray(bookmarkedPostIds) ? bookmarkedPostIds : [];
                          const filteredPosts = safePosts
                            .filter(post => {
                              if (!post) return false;
                              const postContent = typeof post.content === 'string' ? post.content : '';
                              const postAuthor = typeof post.author === 'string' ? post.author : '';
                              const matchesCategory =
                                forumCategory === 'ALL' ? true :
                                  forumCategory === 'BOOKMARKS' ? (post.id && safeBookmarks.includes(post.id)) :
                                    (post.category || 'General').toLowerCase().includes(forumCategory.toLowerCase()) || postContent.toLowerCase().includes(forumCategory.toLowerCase());

                              const matchesQuery = !forumSearchQuery.trim() ||
                                postContent.toLowerCase().includes(forumSearchQuery.toLowerCase()) ||
                                postAuthor.toLowerCase().includes(forumSearchQuery.toLowerCase());

                              return matchesCategory && matchesQuery;
                            })
                            .sort((a, b) => {
                              if (!a || !b) return 0;
                              if (forumSortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
                              if (forumSortBy === 'comments') return (b.comments || 0) - (a.comments || 0);
                              return 0;
                            });

                          return (
                            <div className="space-y-4">
                              {filteredPosts.length === 0 ? (
                                <div className="p-8 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] space-y-2">
                                  <span className="material-symbols-outlined text-4xl text-[var(--text-muted)]">search_off</span>
                                  <p className="text-sm font-bold text-[var(--text-primary)]">No discussions yet</p>
                                  <p className="text-[12px] text-[var(--text-secondary)]">Try All topics, clear search, or publish the first post.</p>
                                </div>
                              ) : (
                                filteredPosts.slice(0, visiblePostsCount).map((post, idx) => {
                                  if (!post) return null;
                                  const isMyPost = (post.alumniId && (profile as any)?.id && post.alumniId === (profile as any)?.id) || (profile?.fullName && post.author === profile.fullName);
                                  const isBookmarked = post.id ? safeBookmarks.includes(post.id) : false;

                                  return (
                                    <div
                                      key={post.id || idx}
                                      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm hover:shadow-md hover:border-[#003366]/30 transition-all duration-200 space-y-3"
                                    >
                                      {/* Card Header */}
                                      <div className="flex items-start justify-between gap-2.5">
                                        <div
                                          onClick={() => {
                                            setChatTarget({
                                              userId: post.alumni?.userId || post.alumniId,
                                              name: post.author || 'ASTU Graduate',
                                              avatar: post.authorAvatar,
                                              roleLabel: 'ASTU Alumni'
                                            });
                                            setActiveTab('messages');
                                            toast.success(`Opening direct chat with ${post.author || 'Alumni'}...`);
                                          }}
                                          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity group"
                                          title="Click profile to open ASTU AMS Hub chat"
                                        >
                                          <div className="relative shrink-0">
                                            <img
                                              src={post.authorAvatar && !post.authorAvatar.includes('undefined') && !post.authorAvatar.includes('null') ? post.authorAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'ASTU Graduate')}&background=003366&color=ffffff&bold=true`}
                                              onError={(e) => {
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'ASTU Graduate')}&background=003366&color=ffffff&bold=true`;
                                              }}
                                              alt=""
                                              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 shadow-xs group-hover:scale-105 transition-transform"
                                            />
                                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <h4 className="text-xs font-black text-[var(--text-primary)] group-hover:text-[#003366] transition-colors truncate">{post.author || 'ASTU Graduate'}</h4>
                                              <span className="px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-slate-800 text-[#003366] dark:text-blue-300 text-[8px] font-extrabold shrink-0 flex items-center gap-1">
                                                ✓ Verified <span className="text-[9px]">💬</span>
                                              </span>
                                            </div>
                                            <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                              <span>{post.time || (post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Recently')}</span>
                                              <span>•</span>
                                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[9px]">
                                                🏷️ {post.category || 'Discussion'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Author Action Buttons */}
                                        <div className="flex items-center gap-1 shrink-0">
                                          {isMyPost && (
                                            <>
                                              <button
                                                onClick={() => {
                                                  const contentText = typeof post.content === 'string' ? post.content : '';
                                                  const imgMatch = contentText.match(/!\[.*?\]\((.*?)\)/);
                                                  const linkMatch = contentText.match(/🔗 Attachment:\s*(https?:\/\/[^\s]+)/);
                                                  const cleanText = contentText
                                                    .replace(/!\[.*?\]\((.*?)\)/g, '')
                                                    .replace(/🔗 Attachment:\s*(https?:\/\/[^\s]+)/g, '')
                                                    .trim();

                                                  setEditingPost({
                                                    id: post.id,
                                                    textContent: cleanText,
                                                    imageAttachment: imgMatch ? imgMatch[0] : '',
                                                    linkAttachment: linkMatch ? linkMatch[0] : ''
                                                  });
                                                }}
                                                className="text-[9px] text-blue-600 hover:text-blue-800 font-bold px-1.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all flex items-center gap-0.5"
                                                title="Edit Post"
                                              >
                                                ✏️ Edit
                                              </button>
                                              <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="text-[9px] text-rose-600 hover:text-rose-800 font-bold px-1.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-0.5"
                                                title="Delete Post"
                                              >
                                                🗑️ Delete
                                              </button>
                                            </>
                                          )}
                                          <button
                                            onClick={() => post.id && handleToggleBookmark(post.id)}
                                            className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                                              }`}
                                            title={isBookmarked ? 'Bookmark Saved' : 'Save Bookmark'}
                                          >
                                            {isBookmarked ? '🔖' : '📑'}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Parse Image & Link Attachments */}
                                      {(() => {
                                        const contentText = typeof post.content === 'string' ? post.content : '';
                                        const imgMatch = contentText.match(/!\[.*?\]\((.*?)\)/);
                                        const linkMatch = contentText.match(/🔗 Attachment:\s*(https?:\/\/[^\s]+)/);
                                        const cleanContent = contentText
                                          .replace(/!\[.*?\]\((.*?)\)/g, '')
                                          .replace(/🔗 Attachment:\s*(https?:\/\/[^\s]+)/g, '')
                                          .trim();

                                        const wordsCount = cleanContent ? cleanContent.split(/\s+/).filter(Boolean).length : 0;
                                        const dynamicReadTime = Math.max(1, Math.ceil(wordsCount / 35));
                                        const dynamicViewsCount = post.views || (post.id ? getPostViews(post.id) : 1);

                                        return (
                                          <>
                                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap break-words font-normal pt-1">
                                              {cleanContent}
                                            </p>

                                            {/* Attached Photo Display */}
                                            {imgMatch && imgMatch[1] && (
                                              <div className="mt-2.5 overflow-hidden rounded-xl border border-[var(--border-color)] max-h-80 bg-slate-900/5">
                                                <img src={imgMatch[1]} alt="Attached Media" className="w-full h-auto max-h-80 object-cover rounded-xl" />
                                              </div>
                                            )}

                                            {/* Attached Link Preview Card */}
                                            {linkMatch && linkMatch[1] && (
                                              <a
                                                href={linkMatch[1]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2.5 flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 hover:border-blue-500 transition-all text-xs group"
                                              >
                                                <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center shrink-0 text-sm font-bold shadow-xs">
                                                  🔗
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                  <p className="font-extrabold text-[#003366] dark:text-blue-300 group-hover:underline truncate">
                                                    {linkMatch[1]}
                                                  </p>
                                                  <p className="text-[10px] text-slate-400 font-medium">Click to open external link ↗</p>
                                                </div>
                                              </a>
                                            )}

                                            {/* Card Analytics & Footer Actions */}
                                            <div className="pt-3 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-[11px]">
                                              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                                <button
                                                  disabled={likingPosts[post.id]}
                                                  onClick={() => post.id && handleToggleLike(post.id)}
                                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${post.liked
                                                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 font-extrabold shadow-xs'
                                                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-semibold'
                                                    } ${likingPosts[post.id] ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                >
                                                  <svg className="w-4 h-4" fill={post.liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                  </svg>
                                                  <span>{post.likes || 0}</span>
                                                </button>

                                                <button
                                                  onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${activeCommentsPostId === post.id
                                                      ? 'bg-blue-50 dark:bg-slate-800 text-[#003366] dark:text-blue-300 font-extrabold shadow-xs'
                                                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-semibold'
                                                    }`}
                                                >
                                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                  </svg>
                                                  <span>{post.comments || 0} Replies</span>
                                                </button>

                                                <button
                                                  onClick={() => handleSharePost(post)}
                                                  className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-semibold transition-colors flex items-center gap-1"
                                                >
                                                  <span className="material-symbols-outlined text-sm">share</span>
                                                  Share
                                                </button>
                                              </div>

                                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium self-end sm:self-auto">
                                                <span>👁️ {dynamicViewsCount} views</span>
                                                <span>•</span>
                                                <span>⏱️ {dynamicReadTime} min read</span>
                                              </div>
                                            </div>
                                          </>
                                        );
                                      })()}

                                      {/* Expandable Comment Thread */}
                                      {activeCommentsPostId === post.id && (
                                        <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-3 animate-in fade-in duration-200">
                                          {post.commentList && post.commentList.length > 0 ? (
                                            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                              {post.commentList.map((c: any) => (
                                                <div key={c.id} className="flex items-start gap-2.5 bg-[var(--bg-page)] p-3 rounded-xl border border-[var(--border-color)] text-xs">
                                                  <img src={c.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt="" className="w-7 h-7 rounded-full object-cover mt-0.5 flex-shrink-0 ring-1 ring-blue-500/20" />
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                      <span className="font-bold text-xs text-[var(--text-primary)]">{c.author || 'Alumni Member'}</span>
                                                      <span className="text-[9px] text-[var(--text-muted)]">{c.createdAt || 'Recently'}</span>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{c.content}</p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-xs text-slate-400 italic py-1 text-center">No comments yet. Start the conversation below!</p>
                                          )}

                                          {/* Comment Submission Box */}
                                          <div className="flex items-center gap-2 pt-1">
                                            <input
                                              type="text"
                                              placeholder="Write a public comment..."
                                              value={newCommentText[post.id] || ''}
                                              onChange={(e) => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                                              className="flex-1 text-xs p-3 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none text-[var(--text-primary)]"
                                            />
                                            <button
                                              onClick={() => handleAddComment(post.id)}
                                              className="px-4 py-2.5 bg-[#003366] text-white text-xs font-bold rounded-xl hover:bg-[#002244] transition-all shadow-sm active:scale-95"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}

                              {/* Pagination / Load More & Total Counter Bar */}
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-color)]">
                                <p className="text-xs text-slate-400 font-medium">
                                  Showing <span className="font-bold text-[var(--text-primary)]">{Math.min(visiblePostsCount, filteredPosts.length)}</span> of{' '}
                                  <span className="font-bold text-[var(--text-primary)]">{filteredPosts.length}</span> community discussions
                                </p>

                                {filteredPosts.length > visiblePostsCount && (
                                  <button
                                    onClick={() => setVisiblePostsCount(prev => prev + 5)}
                                    className="px-5 py-2.5 bg-[#003366] text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-[#002244] transition-all active:scale-95 flex items-center gap-2"
                                  >
                                    <span>Load More Discussions</span>
                                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px]">
                                      +{filteredPosts.length - visiblePostsCount} remaining
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        } catch (renderErr) {
                          console.error("Forum feed render error:", renderErr);
                          return (
                            <div className="p-6 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold text-center">
                              Loading discussions feed...
                            </div>
                          );
                        }
                      })()}
                    </div>

                    {/* Right Column: Trending Topics & Community Sidebar Widgets */}
                    <div className="space-y-5 lg:sticky lg:top-6 self-start">

                      {/* Widget 1: Trending Hashtags */}
                      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-amber-500">local_fire_department</span>
                          Trending topics
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            '#ASTU_AI_Lab',
                            '#TechHiring2026',
                            '#INSA_Careers',
                            '#EthiopianTech',
                            '#SoftwareEngineering',
                            '#AlumniSummit',
                            '#GraduateResearch',
                            '#StartupHub'
                          ].map((tag, i) => (
                            <button
                              key={i}
                              onClick={() => setForumSearchQuery(tag.replace('#', ''))}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-[#003366] hover:text-white dark:hover:bg-blue-600 text-[11px] font-bold text-[#003366] dark:text-blue-300 transition-all"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Widget 2: Community Top Contributors (From Neon DB) */}
                      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-amber-500">star</span>
                          Active mentors
                        </h3>
                        <div className="space-y-3">
                          {(forumStats?.topContributors && forumStats.topContributors.length > 0
                            ? forumStats.topContributors
                            : [
                              { name: 'Dr. Samuel Bekele', title: 'Senior AI Researcher @ INSA', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', posts: '42 posts' },
                              { name: 'Bethlehem Alemu', title: 'Lead Engineer @ Ethio Telecom', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100', posts: '31 posts' },
                              { name: 'Kassahun Tadesse', title: 'Fullstack Architect @ Safaricom', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', posts: '28 posts' },
                            ]
                          ).map((member, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setChatTarget({
                                  userId: member.userId || member.id,
                                  name: member.name,
                                  avatar: member.avatar,
                                  roleLabel: 'ASTU Alumni Mentor'
                                });
                                setActiveTab('messages');
                                toast.success(`Opening direct chat with ${member.name}...`);
                              }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                            >
                              <img src={member.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30" />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{member.name}</h4>
                                <p className="text-[10px] text-[var(--text-muted)] truncate">{member.title}</p>
                              </div>
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                {member.posts}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Widget 3: Forum Conduct Reminder */}
                      <div className="rounded-2xl border border-blue-200 dark:border-slate-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-850 p-4 text-xs space-y-2">
                        <h4 className="font-extrabold text-[#003366] dark:text-blue-400 flex items-center gap-1.5">
                          <span>🛡️</span> ASTU Community Principles
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Respect fellow graduates, share authentic career opportunities, and support ASTU's vision of technical excellence.
                        </p>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* Edit Forum Post Modal */}
              {editingPost && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                        ✏️ Edit Forum Post
                      </h3>
                      <button onClick={() => setEditingPost(null)} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
                    </div>
                    <textarea
                      value={editingPost.textContent}
                      onChange={(e) => setEditingPost({ ...editingPost, textContent: e.target.value })}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] h-28 resize-none text-gray-800 font-medium"
                      placeholder="Edit your post text..."
                      required
                    />

                    {/* Attachment Management & Upload Controls in Edit Modal */}
                    <div className="space-y-2">
                      {editingPost.imageAttachment ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {(() => {
                              const match = editingPost.imageAttachment.match(/!\[.*?\]\((.*?)\)/);
                              const url = match ? match[1] : '';
                              return url ? (
                                <img src={url} alt="Current" className="w-10 h-10 rounded-lg object-cover ring-1 ring-blue-500/30 shrink-0" />
                              ) : <span className="text-sm">📷</span>;
                            })()}
                            <span className="text-xs font-bold text-slate-700 truncate">Current Attached Photo</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <label className="text-[10px] font-bold text-[#003366] hover:underline cursor-pointer flex items-center gap-1">
                              <span>🔄 Replace Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setEditingPost({
                                      ...editingPost,
                                      imageAttachment: `![Post Image](${reader.result as string})`
                                    });
                                    toast.success('New photo selected!');
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setEditingPost({ ...editingPost, imageAttachment: '' })}
                              className="text-[10px] font-bold text-rose-600 hover:underline"
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
                          <span className="text-xs font-medium text-slate-600">No photo attached</span>
                          <label className="text-[11px] font-bold text-[#003366] hover:underline cursor-pointer flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-xs">
                            <span>📷 Attach New Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setEditingPost({
                                    ...editingPost,
                                    imageAttachment: `![Post Image](${reader.result as string})`
                                  });
                                  toast.success('Photo attached!');
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>
                      )}

                      {editingPost.linkAttachment && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#003366]">🔗 Link Attachment Preserved</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingPost({ ...editingPost, linkAttachment: '' })}
                            className="text-[10px] font-bold text-rose-600 hover:underline"
                          >
                            Remove Link
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setEditingPost(null)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const finalContent = [editingPost.textContent, editingPost.imageAttachment, editingPost.linkAttachment].filter(Boolean).join('\n\n');
                          handleUpdatePost(editingPost.id, finalContent);
                          setEditingPost(null);
                        }}
                        className="px-4 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-[#002244] transition-all shadow-md"
                      >
                        Save Changes
                      </button>
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
          </div>
        </main>
      </div>

      <JobDetailsModal job={selectedJobForModal} onClose={() => setSelectedJobForModal(null)} onApply={handleApplyJob} onWithdraw={handleWithdrawApplication} />

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <TelebirrDonationModal
        isOpen={!!donationCampaign}
        onClose={() => setDonationCampaign(null)}
        campaign={donationCampaign}
        onSuccess={handleRefreshCampaigns}
      />

      {/* Notification Detail Modal */}
      {selectedNotificationDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-2xl transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580]">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Notification Detail</h3>
                  <p className="text-[11px] font-medium text-slate-500">ASTU AMS Official Broadcast</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotificationDetail(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[75vh] overflow-y-auto p-5 space-y-4">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedNotificationDetail.type && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#003580] border border-blue-200">
                    {selectedNotificationDetail.type}
                  </span>
                )}
                {selectedNotificationDetail.priority && (
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    selectedNotificationDetail.priority === 'Urgent'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : selectedNotificationDetail.priority === 'High'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {selectedNotificationDetail.priority} Priority
                  </span>
                )}
                {selectedNotificationDetail.category && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {selectedNotificationDetail.category}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-medium ml-auto">
                  {selectedNotificationDetail.time}
                </span>
              </div>

              {/* Hero Image Banner (if exists) */}
              {selectedNotificationDetail.imageUrl && (
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-xs">
                  <img
                    src={selectedNotificationDetail.imageUrl}
                    alt="Notification Banner"
                    className="max-h-52 w-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Subject</p>
                <h2 className="mt-1 text-base font-bold text-slate-900 leading-snug">
                  {selectedNotificationDetail.title || selectedNotificationDetail.subject || 'ASTU Broadcast Notice'}
                </h2>
              </div>

              {/* Message Content */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Message Content</p>
                <div className="mt-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs leading-6 text-slate-800 whitespace-pre-wrap">
                  {selectedNotificationDetail.content || selectedNotificationDetail.text || 'No additional message details.'}
                </div>
              </div>

              {/* Action Link Button / Tab Navigation CTA */}
              {(() => {
                const link = selectedNotificationDetail.ctaLink;
                const fullText = (
                  (selectedNotificationDetail.title || '') + ' ' + 
                  (selectedNotificationDetail.content || '') + ' ' + 
                  (selectedNotificationDetail.text || '')
                ).toLowerCase();

                let targetTab: string | null = null;
                let buttonLabel = selectedNotificationDetail.ctaText || 'Take Action';

                if (link) {
                  if (link.includes('survey') || link.includes('tracer')) targetTab = 'surveys';
                  else if (link.includes('job') || link.includes('career')) targetTab = 'jobs';
                  else if (link.includes('event')) targetTab = 'events';
                  else if (link.includes('document') || link.includes('clearance')) targetTab = 'documents';
                  else if (link.includes('mentor')) targetTab = 'mentorship';
                }

                if (!targetTab) {
                  if (fullText.includes('survey') || fullText.includes('tracer')) {
                    targetTab = 'surveys';
                    if (!selectedNotificationDetail.ctaText) buttonLabel = 'Go to Surveys & Complete Submission';
                  } else if (fullText.includes('job') || fullText.includes('career') || fullText.includes('placement')) {
                    targetTab = 'jobs';
                    if (!selectedNotificationDetail.ctaText) buttonLabel = 'View Career Placement Board';
                  } else if (fullText.includes('mentor')) {
                    targetTab = 'mentorship';
                    if (!selectedNotificationDetail.ctaText) buttonLabel = 'Open Mentorship Network';
                  } else if (fullText.includes('document') || fullText.includes('transcript') || fullText.includes('clearance')) {
                    targetTab = 'documents';
                    if (!selectedNotificationDetail.ctaText) buttonLabel = 'Open Document Center';
                  } else if (fullText.includes('event') || fullText.includes('homecoming') || fullText.includes('meetup')) {
                    targetTab = 'events';
                    if (!selectedNotificationDetail.ctaText) buttonLabel = 'View Events & Register';
                  }
                }

                if (!link && !targetTab) return null;

                return (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNotificationDetail(null);
                        if (targetTab) {
                          setActiveTab(targetTab);
                        } else if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
                          window.open(link, '_blank');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003580] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#002560] transition-all"
                    >
                      <span>{buttonLabel}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs">
              <span className="text-slate-400 font-medium">Adama Science & Technology University</span>
              <button
                type="button"
                onClick={() => setSelectedNotificationDetail(null)}
                className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Notifications Center Modal */}
      {showAllNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580]">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Notifications Center</h3>
                  <p className="text-[11px] font-medium text-slate-500">All announcements, survey alerts, and updates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllNotificationsModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <span className="text-xs text-slate-600 font-medium">
                Total: <strong>{notifications.length}</strong> notifications ({unreadNotificationsCount} unread)
              </span>
              <button
                type="button"
                onClick={async () => {
                  await handleMarkNotificationsRead();
                  toast.success('All notifications marked as read.');
                }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Mark All as Read
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2.5">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={async () => {
                      if (n.unread) {
                        await handleClearNotification(n.id);
                      }
                      setShowAllNotificationsModal(false);
                      setSelectedNotificationDetail(n);
                    }}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                      n.unread
                        ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50/80'
                        : 'border-slate-100 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.unread ? 'bg-[#003580]' : 'bg-slate-300'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{n.title || 'Notification'}</h4>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{n.text}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {n.category && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                            {n.category}
                          </span>
                        )}
                        {n.ctaLink && (
                          <span className="text-[10px] font-bold text-[#003580]">
                            Action Required &rarr;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-12 text-center text-xs text-slate-500">No notifications found.</p>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowAllNotificationsModal(false)}
                className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDashboard;

