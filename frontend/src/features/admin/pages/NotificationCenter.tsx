import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  Loader2,
  Mail,
  Megaphone,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminEmptyState from '../components/AdminEmptyState';
import AdminSectionCard, {
  adminHeroGhostBtnClass,
  adminHeroPrimaryBtnClass,
  adminInputClass,
  adminTabBtnClass,
  adminTabRailClass,
  adminTableHeadClass,
  adminTableRowClass,
} from '../components/AdminSectionCard';
import AdminStatGrid from '../components/AdminStatGrid';
import { adminService } from '../services/admin.service';
import { toast } from 'react-hot-toast';

type NotificationType = 'Email' | 'In-App' | 'Both';
type TargetType =
  | 'All Users'
  | 'Alumni Portal (ALUMNI)'
  | 'Employer Portal (EMPLOYER)'
  | 'Department Head Portal (DEPARTMENT_HEAD)'
  | 'Registrar Portal (REGISTRAR)'
  | 'Alumni Office Portal (ALUMNI_OFFICE)'
  | 'Super Admin Portal (SUPER_ADMIN)'
  | 'By Department'
  | 'By Batch'
  | 'By Employment Status'
  | 'Specific Users';

type SendMode = 'Send Now' | 'Schedule for Date';
type NotificationStatus = 'Sent' | 'Scheduled' | 'Draft' | 'Failed';
type PriorityLevel = 'Low' | 'Normal' | 'High' | 'Urgent';
type CategoryType = 'General' | 'Academic' | 'Career' | 'Survey' | 'Event' | 'Emergency' | 'Donation';
type TemplateCategory =
  | 'All'
  | 'Survey & Feedback'
  | 'Career & Jobs'
  | 'Events & Meetups'
  | 'Clearance & Admin'
  | 'Mentorship & Network'
  | 'Financial & Giving';

type PageTab = 'compose' | 'history' | 'templates';

type SentNotification = {
  id: string;
  dateSent: string;
  type: NotificationType;
  subject: string;
  targetGroup: string;
  recipients: number;
  openRate: string;
  status: NotificationStatus;
  priority?: PriorityLevel;
  category?: CategoryType;
  body: string;
  imageUrl?: string;
  ctaLink?: string;
  ctaText?: string;
  scheduledAt?: string;
};

type Template = {
  name: string;
  title: string;
  category: TemplateCategory;
  message: string;
  imageUrl?: string;
  ctaLink?: string;
  ctaText?: string;
};

const templatesList: Template[] = [
  {
    name: 'Survey Reminder',
    category: 'Survey & Feedback',
    title: 'Reminder: Please Complete Your ASTU Tracer Survey',
    message:
      'Hello {first_name}, please take 5 minutes to complete the official ASTU Alumni Tracer Survey. Your feedback shapes our academic programs and alumni services.',
    ctaLink: '/alumni/dashboard',
    ctaText: 'Complete Tracer Survey Now',
  },
  {
    name: 'Job Alert',
    category: 'Career & Jobs',
    title: 'New Career Opportunities Matching Your Profile',
    message:
      'Dear Alumni, top partner employers have posted new job openings matching your specialization. Log into ASTU AMS to view and apply.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
    ctaLink: '/jobs',
    ctaText: 'Explore Job Opportunities',
  },
  {
    name: 'Event Announcement',
    category: 'Events & Meetups',
    title: 'Upcoming ASTU Annual Alumni Grand Homecoming',
    message:
      'Join us for the ASTU Annual Alumni Homecoming & Tech Expo. Connect with fellow graduates, faculty, and industry leaders. Reserve your spot today!',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
    ctaLink: '/events',
    ctaText: 'RSVP for Homecoming',
  },
  {
    name: 'Welcome Email',
    category: 'Clearance & Admin',
    title: 'Welcome to the Official ASTU Alumni Management System',
    message:
      'Welcome {first_name}! Your ASTU Alumni portal account has been activated. Discover networking opportunities, career resources, and university updates.',
    ctaLink: '/profile',
    ctaText: 'Access Your Profile',
  },
  {
    name: 'Graduation Clearance',
    category: 'Clearance & Admin',
    title: 'Urgent: Complete Your Graduation Clearance Requirements',
    message:
      'Notice to graduating batch: Please submit all outstanding clearance documents before the deadline to receive official transcript issuance.',
    ctaLink: '/clearance',
    ctaText: 'Submit Clearance Docs',
  },
  {
    name: 'Mentorship Invitation',
    category: 'Mentorship & Network',
    title: 'Join the ASTU Alumni Mentorship Network',
    message:
      'Share your professional experience! Become an ASTU Alumni Mentor and guide current engineering students in their career journeys.',
    ctaLink: '/mentorship',
    ctaText: 'Become a Mentor',
  },
  {
    name: 'Donation Appeal',
    category: 'Financial & Giving',
    title: 'Support the ASTU Innovation & Student Scholarship Fund',
    message:
      'Your contribution empowers the next generation of engineers and researchers at ASTU. Donate today to support student scholarships.',
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?q=80&w=800&auto=format&fit=crop',
    ctaLink: '/donations',
    ctaText: 'Donate to Scholarship Fund',
  },
  {
    name: 'Security Alert',
    category: 'Clearance & Admin',
    title: 'Security Update: Please Verify Your Security Preferences',
    message:
      'We noticed a new login attempt on your ASTU AMS account. If this was not you, please update your password and enable Two-Factor Authentication immediately.',
    ctaLink: '/settings/security',
    ctaText: 'Manage Account Security',
  },
  {
    name: 'Career Fair',
    category: 'Career & Jobs',
    title: 'ASTU National Tech & Engineering Career Fair',
    message:
      'Register for the ASTU Virtual Career Fair featuring leading technology and industrial partner companies. Upload your resume to participate.',
    ctaLink: '/career-fair',
    ctaText: 'Register for Career Fair',
  },
  {
    name: 'System Maintenance',
    category: 'Clearance & Admin',
    title: 'Scheduled Maintenance: ASTU AMS Platform Upgrade',
    message:
      'The ASTU AMS portal will undergo scheduled maintenance this Sunday from 02:00 AM to 04:00 AM EAT. Services will be briefly unavailable.',
  },
  {
    name: 'Employer Survey',
    category: 'Survey & Feedback',
    title: 'Industry Partner Feedback: ASTU Graduate Performance',
    message:
      'Dear Partner Employer, please complete our brief employer satisfaction survey regarding ASTU graduates in your organization.',
  },
  {
    name: 'Regional Meetup',
    category: 'Events & Meetups',
    title: 'Addis Ababa ASTU Alumni Regional Chapter Meetup',
    message:
      'Calling all alumni in Addis Ababa! Join us for an informal networking evening this Friday. Confirm your attendance in the events hub.',
  },
];

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'All',
  'Survey & Feedback',
  'Career & Jobs',
  'Events & Meetups',
  'Clearance & Admin',
  'Mentorship & Network',
  'Financial & Giving',
];

const TARGET_OPTIONS: { value: TargetType; label: string }[] = [
  { value: 'All Users', label: 'All Users (system-wide)' },
  { value: 'Alumni Portal (ALUMNI)', label: 'Alumni Portal' },
  { value: 'Employer Portal (EMPLOYER)', label: 'Employer Portal' },
  { value: 'Department Head Portal (DEPARTMENT_HEAD)', label: 'Department Head Portal' },
  { value: 'Registrar Portal (REGISTRAR)', label: 'Registrar Portal' },
  { value: 'Alumni Office Portal (ALUMNI_OFFICE)', label: 'Alumni Office Portal' },
  { value: 'Super Admin Portal (SUPER_ADMIN)', label: 'Super Admin & ICT' },
  { value: 'By Department', label: 'Filter by Department' },
  { value: 'By Batch', label: 'Filter by Graduation Batch' },
  { value: 'By Employment Status', label: 'Filter by Employment Status' },
  { value: 'Specific Users', label: 'Specific Users' },
];

const LIVE_POLL_MS = 45_000;
const SUBJECT_MAX = 120;
const MESSAGE_MAX = 4000;

function statusClass(status: NotificationStatus) {
  switch (status) {
    case 'Sent':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#163828] dark:text-[#22C55E] dark:border-[#22C55E]/30';
    case 'Scheduled':
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#382B14] dark:text-[#F59E0B] dark:border-[#F59E0B]/30';
    case 'Draft':
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[var(--bg-card-secondary)] dark:text-[var(--text-secondary)] dark:border-[var(--border-color)]';
    case 'Failed':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#3B1A22] dark:text-[#F87171] dark:border-[#F87171]/30';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function typeClass(type: NotificationType) {
  switch (type) {
    case 'Email':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15 dark:bg-[#15294A] dark:text-[#22D3EE] dark:border-[#22D3EE]/30';
    case 'In-App':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#163828] dark:text-[#22C55E] dark:border-[#22C55E]/30';
    case 'Both':
      return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-[#2E1A47] dark:text-[#C084FC] dark:border-[#C084FC]/30';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function priorityClass(priority?: PriorityLevel) {
  switch (priority) {
    case 'Urgent':
      return 'bg-rose-100 text-rose-700 border-rose-200 font-bold dark:bg-[#3B1A22] dark:text-[#F87171] dark:border-[#F87171]/30';
    case 'High':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-[#382B14] dark:text-[#F59E0B] dark:border-[#F59E0B]/30';
    case 'Low':
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[var(--bg-card-secondary)] dark:text-[var(--text-secondary)] dark:border-[var(--border-color)]';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-[#15294A] dark:text-[#22D3EE] dark:border-[#22D3EE]/30';
  }
}

function ChannelIcon({ type, className = 'h-3.5 w-3.5' }: { type: NotificationType; className?: string }) {
  if (type === 'Email') return <Mail className={className} />;
  if (type === 'In-App') return <Bell className={className} />;
  return <Megaphone className={className} />;
}

function downloadCsv(rows: SentNotification[]) {
  const headers = ['Date Sent', 'Channel', 'Priority', 'Category', 'Subject', 'Target', 'Recipients', 'Open Rate', 'Status'];
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        new Date(r.dateSent).toISOString(),
        r.type,
        r.priority || 'Normal',
        r.category || 'General',
        `"${(r.subject || '').replace(/"/g, '""')}"`,
        `"${(r.targetGroup || '').replace(/"/g, '""')}"`,
        r.recipients,
        r.openRate,
        r.status,
      ].join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `astu_notifications_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function NotificationCenter() {
  const location = useLocation();
  const isCms = location.pathname.startsWith('/cms');

  const [activeTab, setActiveTab] = useState<PageTab>('compose');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  const [type, setType] = useState<NotificationType>('Both');
  const [target, setTarget] = useState<TargetType>('All Users');
  const [priority, setPriority] = useState<PriorityLevel>('Normal');
  const [category, setCategory] = useState<CategoryType>('General');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [sendMode, setSendMode] = useState<SendMode>('Send Now');
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [targetValue, setTargetValue] = useState('All');
  const [employmentValue, setEmploymentValue] = useState('EMPLOYED');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchUsers, setSearchUsers] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');

  const [dbDepartments, setDbDepartments] = useState<string[]>([]);
  const [dbUsers, setDbUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);

  const [historyRows, setHistoryRows] = useState<SentNotification[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('All');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');
  const [historyPriorityFilter, setHistoryPriorityFilter] = useState('All');
  const debouncedHistorySearch = useDebouncedValue(historySearch, 400);

  const [detail, setDetail] = useState<SentNotification | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [live, setLive] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | undefined>();
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSent: 0,
    openRate: 0,
    scheduledSends: 0,
    templatesCount: templatesList.length,
  });

  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const composeRef = useRef<HTMLDivElement | null>(null);

  const currentYear = new Date().getFullYear();
  const dbBatches = useMemo(() => Array.from({ length: 10 }, (_, i) => String(currentYear - i)), [currentYear]);

  const fetchHistoryData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setHistoryError(null);
    const notifResult = await adminService.getNotifications({
      page: historyPage,
      limit: historyLimit,
      query: debouncedHistorySearch || undefined,
      type: historyTypeFilter !== 'All' ? historyTypeFilter : undefined,
      status: historyStatusFilter !== 'All' ? historyStatusFilter : undefined,
      priority: historyPriorityFilter !== 'All' ? historyPriorityFilter : undefined,
    });

    if (notifResult.ok) {
      setHistoryRows(notifResult.data.notifications || []);
      setHistoryTotal(notifResult.data.total || 0);
    } else {
      setHistoryError(notifResult.message || 'Failed to load notification history');
      if (!silent) toast.error(notifResult.message || 'Failed to load notification history');
    }
    if (!silent) setLoading(false);
    setLastSynced(new Date().toLocaleTimeString());
  }, [historyPage, historyLimit, debouncedHistorySearch, historyTypeFilter, historyStatusFilter, historyPriorityFilter]);

  const fetchMetadata = useCallback(async (silent = false) => {
    if (!silent) setStatsLoading(true);
    const [deptsRes, usersRes, statsRes] = await Promise.all([
      adminService.getDepartments(),
      adminService.getUsers({ limit: 1000 }),
      adminService.getNotificationStats(),
    ]);

    if (deptsRes.ok && Array.isArray(deptsRes.data)) {
      setDbDepartments(deptsRes.data.map((d: { name: string }) => d.name));
    }

    if (usersRes.ok && usersRes.data?.users) {
      setDbUsers(
        usersRes.data.users.map((u: any) => ({
          id: u.id,
          name:
            u.alumniProfile?.fullName ||
            (u.adminProfile?.firstName
              ? `${u.adminProfile?.firstName || ''} ${u.adminProfile?.lastName || ''}`.trim()
              : u.email),
          email: u.email,
          role: u.role,
        }))
      );
    }

    if (statsRes.ok) {
      setStats({
        ...statsRes.data,
        templatesCount: templatesList.length,
      });
    }
    setStatsLoading(false);
    setLastSynced(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      fetchMetadata(true);
      fetchHistoryData(true);
    }, LIVE_POLL_MS);
    return () => window.clearInterval(id);
  }, [live, fetchMetadata, fetchHistoryData]);

  const handleRefresh = async () => {
    await Promise.all([fetchMetadata(), fetchHistoryData()]);
    toast.success('Notification center refreshed');
  };

  const clearDraft = () => {
    setSubject('');
    setMessage('');
    setImageUrl('');
    setCtaLink('');
    setCtaText('');
    setSelectedUserIds([]);
    setPriority('Normal');
    setCategory('General');
    setType('Both');
    setTarget('All Users');
    setTargetValue('All');
    setSendMode('Send Now');
    setViewMode('editor');
    toast.success('Draft cleared');
  };

  const executeSend = async () => {
    setSending(true);
    setConfirmOpen(false);

    const payload: Record<string, unknown> = {
      title: subject,
      content: message,
      type,
      priority,
      category,
      imageUrl: imageUrl.trim() || undefined,
      ctaLink: ctaLink.trim() || undefined,
      ctaText: ctaText.trim() || undefined,
      sendMode,
      scheduleDate: sendMode === 'Schedule for Date' ? scheduleDate : undefined,
      scheduleTime: sendMode === 'Schedule for Date' ? scheduleTime : undefined,
    };

    if (target.includes('ALUMNI')) payload.targetRole = 'ALUMNI';
    else if (target.includes('EMPLOYER')) payload.targetRole = 'EMPLOYER';
    else if (target.includes('DEPARTMENT_HEAD')) payload.targetRole = 'DEPARTMENT_HEAD';
    else if (target.includes('REGISTRAR')) payload.targetRole = 'REGISTRAR';
    else if (target.includes('ALUMNI_OFFICE')) payload.targetRole = 'ALUMNI_OFFICE';
    else if (target.includes('SUPER_ADMIN')) payload.targetRole = 'SUPER_ADMIN';
    else if (target === 'By Department') payload.departmentName = targetValue !== 'All' ? targetValue : undefined;
    else if (target === 'By Batch') payload.graduationYear = targetValue !== 'All' ? Number(targetValue) : undefined;
    else if (target === 'By Employment Status') payload.employmentStatus = employmentValue;
    else if (target === 'Specific Users') payload.targetUserIds = selectedUserIds.length > 0 ? selectedUserIds : undefined;

    const result = await adminService.sendNotification(payload as any);

    if (result.ok) {
      if (result.data.isScheduled) {
        toast.success(`Notification scheduled for ${scheduleDate} at ${scheduleTime}.`);
      } else {
        toast.success(`Broadcast sent to ${result.data.sent || 1} recipient(s).`);
      }
      setSubject('');
      setMessage('');
      setImageUrl('');
      setCtaLink('');
      setCtaText('');
      setSelectedUserIds([]);
      setActiveTab('history');
      await Promise.all([fetchHistoryData(), fetchMetadata()]);
    } else {
      toast.error(result.message || 'Failed to process notification.');
    }
    setSending(false);
  };

  const handleSendClick = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message body are required.');
      return;
    }
    if (target === 'Specific Users' && selectedUserIds.length === 0) {
      toast.error('Select at least one user for a targeted broadcast.');
      return;
    }
    if (sendMode === 'Schedule for Date' && !scheduleDate) {
      toast.error('Pick a schedule date.');
      return;
    }
    setConfirmOpen(true);
  };

  const applyTemplate = (template: Template) => {
    setSubject(template.title.slice(0, SUBJECT_MAX));
    setMessage(template.message.slice(0, MESSAGE_MAX));
    setImageUrl(template.imageUrl || '');
    setCtaLink(template.ctaLink || '');
    setCtaText(template.ctaText || '');
    setActiveTab('compose');
    setViewMode('editor');
    toast.success(`Applied “${template.name}”`);
    setTimeout(() => composeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const reuseFromHistory = (row: SentNotification) => {
    setSubject((row.subject || '').slice(0, SUBJECT_MAX));
    setMessage((row.body || '').slice(0, MESSAGE_MAX));
    setImageUrl(row.imageUrl || '');
    setCtaLink(row.ctaLink || '');
    setCtaText(row.ctaText || '');
    setType(row.type || 'Both');
    setPriority(row.priority || 'Normal');
    setCategory(row.category || 'General');
    setDetail(null);
    setActiveTab('compose');
    setViewMode('editor');
    toast.success('Loaded into composer — review before sending');
    setTimeout(() => composeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const insertToken = (token: string) => {
    const input = editorRef.current;
    if (!input) {
      setMessage((prev) => `${prev}${token}`.slice(0, MESSAGE_MAX));
      return;
    }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const next = (message.substring(0, start) + token + message.substring(end)).slice(0, MESSAGE_MAX);
    setMessage(next);
    setTimeout(() => {
      input.focus();
      const pos = Math.min(start + token.length, MESSAGE_MAX);
      input.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await adminService.getNotifications({
        limit: 10000,
        query: debouncedHistorySearch || undefined,
        type: historyTypeFilter !== 'All' ? historyTypeFilter : undefined,
        status: historyStatusFilter !== 'All' ? historyStatusFilter : undefined,
        priority: historyPriorityFilter !== 'All' ? historyPriorityFilter : undefined,
      });
      const rows = res.ok && res.data?.notifications ? res.data.notifications : historyRows;
      if (!rows.length) {
        toast.error('No notifications to export.');
        return;
      }
      downloadCsv(rows);
      toast.success(`Exported ${rows.length} notification(s)`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchUsers.trim()) return dbUsers.slice(0, 20);
    const q = searchUsers.toLowerCase();
    return dbUsers.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 30);
  }, [dbUsers, searchUsers]);

  const estimatedRecipientsCount = useMemo(() => {
    if (target === 'All Users') return dbUsers.length;
    if (target === 'Specific Users') return selectedUserIds.length;
    if (target.includes('ALUMNI')) return dbUsers.filter((u) => u.role === 'ALUMNI').length;
    if (target.includes('EMPLOYER')) return dbUsers.filter((u) => u.role === 'EMPLOYER').length;
    if (target.includes('DEPARTMENT_HEAD')) return dbUsers.filter((u) => u.role === 'DEPARTMENT_HEAD').length;
    if (target.includes('REGISTRAR')) return dbUsers.filter((u) => u.role === 'REGISTRAR').length;
    if (target.includes('ALUMNI_OFFICE')) return dbUsers.filter((u) => u.role === 'ALUMNI_OFFICE').length;
    if (target.includes('SUPER_ADMIN')) return dbUsers.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length;
    return dbUsers.length;
  }, [target, dbUsers, selectedUserIds]);

  const totalHistoryPages = Math.ceil(historyTotal / historyLimit) || 1;
  const canSend = subject.trim().length > 0 && message.trim().length > 0 && !sending;
  const isLargeAudience = estimatedRecipientsCount >= 100;
  const isUrgent = priority === 'Urgent';

  const filteredTemplates = useMemo(
    () => templatesList.filter((t) => selectedCategory === 'All' || t.category === selectedCategory),
    [selectedCategory]
  );

  const recentDeliveries = useMemo(() => historyRows.slice(0, 4), [historyRows]);

  const summaryCards = [
    {
      title: 'Messages Sent',
      value: stats.totalSent.toLocaleString(),
      icon: Megaphone,
      tone: 'blue' as const,
      description: 'Lifetime broadcasts delivered',
      loading: statsLoading,
    },
    {
      title: 'Open Rate',
      value: `${stats.openRate}%`,
      icon: Eye,
      tone: 'green' as const,
      description: 'Average engagement',
      loading: statsLoading,
    },
    {
      title: 'Scheduled',
      value: (stats.scheduledSends ?? 0).toLocaleString(),
      icon: CalendarDays,
      tone: 'gold' as const,
      description: (stats.scheduledSends ?? 0) > 0 ? 'Queued for delivery' : 'No pending schedules',
      loading: statsLoading,
      onClick: () => {
        setActiveTab('history');
        setHistoryStatusFilter('Scheduled');
        setHistoryPage(1);
      },
    },
    {
      title: 'Templates',
      value: String(templatesList.length),
      icon: MessageSquareText,
      tone: 'purple' as const,
      description: 'Ready-to-send drafts',
      onClick: () => setActiveTab('templates'),
    },
  ];

  const fieldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notification Center"
        subtitle="Compose multi-channel alerts, schedule broadcasts, and track delivery across ASTU portals."
        breadcrumbs={isCms ? [{ label: 'Alumni Office' }, { label: 'Alerts' }] : [{ label: 'Admin' }, { label: 'Configuration' }]}
        lastSynced={lastSynced}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              className={`${adminHeroGhostBtnClass} ${live ? 'ring-1 ring-[#FFCC00]/40' : ''}`}
              title={live ? 'Live updates on — click to pause' : 'Live updates paused — click to resume'}
            >
              <span className="relative flex h-2 w-2">
                {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-emerald-400' : 'bg-white/40'}`} />
              </span>
              {live ? 'Live' : 'Paused'}
            </button>
            <button type="button" onClick={handleRefresh} className={adminHeroGhostBtnClass}>
              <RefreshCw className="h-4 w-4 text-[#FFCC00]" />
              Refresh
            </button>
            <button type="button" onClick={handleExportCsv} disabled={exporting} className={adminHeroGhostBtnClass}>
              <Download className="h-4 w-4 text-[#FFCC00]" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('compose');
                setViewMode('editor');
              }}
              className={adminHeroPrimaryBtnClass}
            >
              <Send className="h-4 w-4" />
              New Broadcast
            </button>
          </div>
        }
      />

      <AdminStatGrid stats={summaryCards} cols={4} compact />

      <div className={adminTabRailClass} role="tablist" aria-label="Notification center sections">
        <button type="button" role="tab" aria-selected={activeTab === 'compose'} className={adminTabBtnClass(activeTab === 'compose')} onClick={() => setActiveTab('compose')}>
          <Wand2 className="h-4 w-4" />
          Compose
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'history'} className={adminTabBtnClass(activeTab === 'history')} onClick={() => setActiveTab('history')}>
          <Bell className="h-4 w-4" />
          Delivery Log
          {historyTotal > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{historyTotal}</span>
          )}
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'templates'} className={adminTabBtnClass(activeTab === 'templates')} onClick={() => setActiveTab('templates')}>
          <MessageSquareText className="h-4 w-4" />
          Templates
        </button>
      </div>

      {activeTab === 'compose' && (
        <div ref={composeRef} className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <AdminSectionCard
            title="Compose Broadcast"
            subtitle="Choose channel, audience, and message — then send now or schedule."
            headerAction={
              <div className="flex items-center gap-2">
                {(subject || message) && (
                  <button
                    type="button"
                    onClick={clearDraft}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-rose-600"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                )}
                <div className="flex rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('editor')}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                      viewMode === 'editor' ? 'bg-[var(--bg-card)] text-[#003580] shadow-sm' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                      viewMode === 'preview' ? 'bg-[var(--bg-card)] text-[#003580] shadow-sm' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>
            }
          >
            {isUrgent && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800 dark:border-[#F87171]/30 dark:bg-[#3B1A22] dark:text-[#F87171]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong>Urgent priority</strong> will highlight this alert for recipients. Reserve it for emergencies and time-critical notices.
                </p>
              </div>
            )}

            {viewMode === 'preview' ? (
              <div className="space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4">
                <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-color)] pb-3">
                  <AdminBadge variant="default">{type}</AdminBadge>
                  <AdminBadge variant={isUrgent ? 'danger' : 'neutral'}>{priority} priority</AdminBadge>
                  <AdminBadge variant="success">{category}</AdminBadge>
                  <span className="ml-auto text-xs font-medium text-[var(--text-muted)]">
                    ~{estimatedRecipientsCount.toLocaleString()} recipients
                  </span>
                </div>
                {imageUrl && (
                  <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-black">
                    <img src={imageUrl} alt="Banner preview" className="max-h-48 w-full object-cover" />
                  </div>
                )}
                <div>
                  <p className={fieldLabel}>Subject</p>
                  <h4 className="mt-1 text-base font-bold text-[var(--text-primary)]">{subject || 'Untitled broadcast'}</h4>
                </div>
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 text-sm leading-6 text-[var(--text-primary)] whitespace-pre-wrap">
                  {message || 'No message content yet.'}
                </div>
                {ctaLink && (
                  <div className="pt-1 text-center">
                    <span className="inline-block rounded-lg bg-[#003580] px-5 py-2.5 text-xs font-bold text-white">
                      {ctaText || 'Take Action'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1.5">
                    <span className={fieldLabel}>Channel</span>
                    <select value={type} onChange={(e) => setType(e.target.value as NotificationType)} className={adminInputClass}>
                      {(['Both', 'In-App', 'Email'] as NotificationType[]).map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className={fieldLabel}>Priority</span>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as PriorityLevel)} className={adminInputClass}>
                      {(['Low', 'Normal', 'High', 'Urgent'] as PriorityLevel[]).map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className={fieldLabel}>Category</span>
                    <select value={category} onChange={(e) => setCategory(e.target.value as CategoryType)} className={adminInputClass}>
                      {(['General', 'Academic', 'Career', 'Survey', 'Event', 'Emergency', 'Donation'] as CategoryType[]).map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={fieldLabel}>Target audience</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003580]">
                      <Users className="h-3.5 w-3.5" />
                      ~{estimatedRecipientsCount.toLocaleString()}
                    </span>
                  </div>
                  <select
                    value={target}
                    onChange={(e) => {
                      setTarget(e.target.value as TargetType);
                      setTargetValue('All');
                    }}
                    className={adminInputClass}
                  >
                    {TARGET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>

                {target === 'By Department' && (
                  <label className="block space-y-1.5">
                    <span className={fieldLabel}>Department</span>
                    <select value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className={adminInputClass}>
                      <option value="All">All Departments</option>
                      {dbDepartments.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </label>
                )}

                {target === 'By Batch' && (
                  <label className="block space-y-1.5">
                    <span className={fieldLabel}>Graduation batch</span>
                    <select value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className={adminInputClass}>
                      <option value="All">All Batches</option>
                      {dbBatches.map((batch) => (
                        <option key={batch} value={batch}>Class of {batch}</option>
                      ))}
                    </select>
                  </label>
                )}

                {target === 'By Employment Status' && (
                  <label className="block space-y-1.5">
                    <span className={fieldLabel}>Employment status</span>
                    <select value={employmentValue} onChange={(e) => setEmploymentValue(e.target.value)} className={adminInputClass}>
                      <option value="EMPLOYED">Employed Alumni</option>
                      <option value="UNEMPLOYED">Unemployed Alumni</option>
                      <option value="SELF_EMPLOYED">Self-Employed</option>
                    </select>
                  </label>
                )}

                {target === 'Specific Users' && (
                  <div className="space-y-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        value={searchUsers}
                        onChange={(e) => setSearchUsers(e.target.value)}
                        placeholder="Search users by name or email…"
                        className={`${adminInputClass} pl-9`}
                      />
                    </div>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {filteredUsers.length === 0 ? (
                        <p className="px-2 py-3 text-center text-[11px] text-[var(--text-muted)]">No matching users</p>
                      ) : (
                        filteredUsers.map((u) => {
                          const checked = selectedUserIds.includes(u.id);
                          return (
                            <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-[var(--bg-card)]">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedUserIds((prev) =>
                                    checked ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                                  )
                                }
                              />
                              <span className="font-semibold text-[var(--text-primary)]">{u.name}</span>
                              <span className="truncate text-[var(--text-muted)]">{u.email}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-[var(--text-muted)]">
                      {selectedUserIds.length} user(s) selected
                    </p>
                  </div>
                )}

                <label className="block space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={fieldLabel}>Subject</span>
                    <span className={`text-[10px] font-medium ${subject.length > SUBJECT_MAX - 20 ? 'text-amber-600' : 'text-[var(--text-muted)]'}`}>
                      {subject.length}/{SUBJECT_MAX}
                    </span>
                  </div>
                  <input
                    value={subject}
                    maxLength={SUBJECT_MAX}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Clear, action-oriented subject line"
                    className={adminInputClass}
                  />
                </label>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={fieldLabel}>Message</span>
                    <div className="flex flex-wrap items-center gap-1">
                      {['{first_name}', '{department}', '{graduation_year}'].map((token) => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => insertToken(token)}
                          className="rounded-md border border-[var(--border-color)] bg-[var(--bg-page)] px-2 py-0.5 text-[10px] font-bold text-[#003580] hover:bg-[#003580]/5"
                        >
                          {token}
                        </button>
                      ))}
                      <span className={`ml-1 text-[10px] font-medium ${message.length > MESSAGE_MAX - 200 ? 'text-amber-600' : 'text-[var(--text-muted)]'}`}>
                        {message.length}/{MESSAGE_MAX}
                      </span>
                    </div>
                  </div>
                  <textarea
                    ref={editorRef}
                    value={message}
                    maxLength={MESSAGE_MAX}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    placeholder="Write the notification body…"
                    className={`${adminInputClass} resize-y font-normal leading-relaxed`}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5 sm:col-span-2">
                    <span className={fieldLabel}>Banner image URL (optional)</span>
                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className={adminInputClass} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className={fieldLabel}>CTA link</span>
                    <input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="/alumni/dashboard" className={adminInputClass} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className={fieldLabel}>CTA button text</span>
                    <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Take Action" className={adminInputClass} />
                  </label>
                </div>
              </div>
            )}
          </AdminSectionCard>

          <div className="space-y-4">
            <AdminSectionCard title="Delivery" subtitle="Send immediately or queue for later.">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(['Send Now', 'Schedule for Date'] as SendMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSendMode(mode)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                        sendMode === mode
                          ? 'border-[#003580] bg-[#003580]/10 text-[#003580]'
                          : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {mode === 'Send Now' ? <Send className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {mode === 'Send Now' ? 'Send now' : 'Schedule'}
                      </span>
                    </button>
                  ))}
                </div>

                {sendMode === 'Schedule for Date' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className={fieldLabel}>Date</span>
                      <input type="date" value={scheduleDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setScheduleDate(e.target.value)} className={adminInputClass} />
                    </label>
                    <label className="block space-y-1.5">
                      <span className={fieldLabel}>Time</span>
                      <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={adminInputClass} />
                    </label>
                  </div>
                )}

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3 text-xs text-[var(--text-secondary)] space-y-1.5">
                  <div className="flex justify-between gap-2"><span>Channel</span><strong className="inline-flex items-center gap-1 text-[var(--text-primary)]"><ChannelIcon type={type} /> {type}</strong></div>
                  <div className="flex justify-between gap-2"><span>Priority</span><strong className="text-[var(--text-primary)]">{priority}</strong></div>
                  <div className="flex justify-between gap-2"><span>Audience</span><strong className="text-[var(--text-primary)] truncate max-w-[60%] text-right">{target.replace(/\s*\(.*\)/, '')}</strong></div>
                  <div className="flex justify-between gap-2"><span>Est. recipients</span><strong className="text-[var(--text-primary)]">~{estimatedRecipientsCount.toLocaleString()}</strong></div>
                </div>

                {isLargeAudience && (
                  <p className="flex items-start gap-1.5 text-[11px] font-medium text-amber-700 dark:text-[#F59E0B]">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Large audience — confirm carefully before sending.
                  </p>
                )}

                <button
                  type="button"
                  disabled={!canSend}
                  onClick={handleSendClick}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#003580] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : sendMode === 'Send Now' ? <Send className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                  {sending ? 'Processing…' : sendMode === 'Send Now' ? 'Send Broadcast' : 'Schedule Broadcast'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('templates')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <MessageSquareText className="h-3.5 w-3.5" />
                  Browse templates
                </button>
              </div>
            </AdminSectionCard>

            <AdminSectionCard
              title="Recent deliveries"
              subtitle="Jump back into the log or reuse a message."
              headerAction={
                <button type="button" onClick={() => setActiveTab('history')} className="text-[11px] font-bold text-[#003580] hover:underline">
                  View all
                </button>
              }
            >
              {loading && recentDeliveries.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--bg-page)]" />
                  ))}
                </div>
              ) : recentDeliveries.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">No deliveries yet. Your first broadcast will appear here.</p>
              ) : (
                <ul className="space-y-2">
                  {recentDeliveries.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => setDetail(row)}
                        className="flex w-full items-start gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2.5 text-left transition hover:border-[#003580]/25"
                      >
                        <span className={`mt-0.5 inline-flex rounded-md border p-1 ${typeClass(row.type)}`}>
                          <ChannelIcon type={row.type} className="h-3 w-3" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-[var(--text-primary)]">{row.subject}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                            <span className={`inline-flex rounded-full border px-1.5 py-0.5 font-bold ${statusClass(row.status)}`}>{row.status}</span>
                            {new Date(row.dateSent).toLocaleString()}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </AdminSectionCard>

            <AdminSectionCard title="Quick tips" subtitle="Keep broadcasts clear and actionable.">
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Use one clear call-to-action per message.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Prefer In-App + Email for time-sensitive notices.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Insert tokens like {'{first_name}'} for personalization.</li>
                <li className="flex gap-2"><Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#003580]" /> Urgent priority is reserved for emergencies.</li>
              </ul>
            </AdminSectionCard>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <AdminSectionCard
          title="Delivery Log"
          subtitle={`Track sent, scheduled, and failed broadcasts (${historyTotal.toLocaleString()} total).`}
          headerAction={
            <button type="button" onClick={handleExportCsv} disabled={exporting} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          }
        >
          <div className="space-y-3">
            <div className="grid gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  placeholder="Search subject or audience…"
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] py-1.5 pl-8 pr-2.5 text-xs outline-none focus:border-[#003580]"
                />
              </div>
              <select
                value={historyTypeFilter}
                onChange={(e) => { setHistoryTypeFilter(e.target.value); setHistoryPage(1); }}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs outline-none"
              >
                <option value="All">All channels</option>
                <option value="In-App">In-App</option>
                <option value="Email">Email</option>
                <option value="Both">Both</option>
              </select>
              <select
                value={historyStatusFilter}
                onChange={(e) => { setHistoryStatusFilter(e.target.value); setHistoryPage(1); }}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs outline-none"
              >
                <option value="All">All statuses</option>
                <option value="Sent">Sent</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
                <option value="Failed">Failed</option>
              </select>
              <select
                value={historyPriorityFilter}
                onChange={(e) => { setHistoryPriorityFilter(e.target.value); setHistoryPage(1); }}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs outline-none"
              >
                <option value="All">All priorities</option>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {historyError ? (
              <AdminEmptyState
                icon={AlertTriangle}
                title="Couldn’t load delivery log"
                description={historyError}
                action={
                  <button type="button" onClick={() => fetchHistoryData()} className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white">
                    Retry
                  </button>
                }
              />
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-[var(--border-color)]">
                  <div className="max-h-[520px] overflow-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr>
                          {['Date', 'Channel', 'Priority', 'Subject', 'Target', 'Recipients', 'Status'].map((head) => (
                            <th key={head} className={`${adminTableHeadClass} px-3.5 py-3 whitespace-nowrap`}>{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-t border-[var(--border-color)]">
                              {Array.from({ length: 7 }).map((__, j) => (
                                <td key={j} className="px-3.5 py-3">
                                  <div className="h-3.5 animate-pulse rounded bg-[var(--bg-page)]" />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : historyRows.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-4">
                              <AdminEmptyState
                                icon={Bell}
                                title="No notifications yet"
                                description="Compose a broadcast or adjust filters to see delivery history."
                                action={
                                  <button type="button" onClick={() => setActiveTab('compose')} className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white">
                                    Compose broadcast
                                  </button>
                                }
                              />
                            </td>
                          </tr>
                        ) : (
                          historyRows.map((notification) => (
                            <tr
                              key={notification.id}
                              className={`${adminTableRowClass} cursor-pointer ${notification.status === 'Failed' ? 'bg-rose-50/40 dark:bg-[#3B1A22]/30' : ''}`}
                              onClick={() => setDetail(notification)}
                            >
                              <td className="px-3.5 py-3 whitespace-nowrap">{new Date(notification.dateSent).toLocaleString()}</td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${typeClass(notification.type)}`}>
                                  <ChannelIcon type={notification.type} className="h-3 w-3" />
                                  {notification.type}
                                </span>
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${priorityClass(notification.priority)}`}>
                                  {notification.priority || 'Normal'}
                                </span>
                              </td>
                              <td className="max-w-[220px] truncate px-3.5 py-3 font-semibold text-[var(--text-primary)]" title={notification.subject}>
                                {notification.subject}
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap">{notification.targetGroup}</td>
                              <td className="px-3.5 py-3 font-bold whitespace-nowrap">{notification.recipients.toLocaleString()}</td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass(notification.status)}`}>
                                  {notification.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] pt-3 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <span>Show</span>
                    <select
                      value={historyLimit}
                      onChange={(e) => { setHistoryLimit(Number(e.target.value)); setHistoryPage(1); }}
                      className="rounded border border-[var(--border-color)] px-2 py-1 text-xs outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>per page</span>
                  </div>
                  <div>
                    {historyTotal === 0
                      ? '0 records'
                      : `Showing ${(historyPage - 1) * historyLimit + 1}–${Math.min(historyPage * historyLimit, historyTotal)} of ${historyTotal}`}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={historyPage <= 1}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2.5 py-1 font-medium disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Prev
                    </button>
                    <span className="px-2 font-semibold">{historyPage} / {totalHistoryPages}</span>
                    <button
                      type="button"
                      disabled={historyPage >= totalHistoryPages}
                      onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                      className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2.5 py-1 font-medium disabled:opacity-40"
                    >
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </AdminSectionCard>
      )}

      {activeTab === 'templates' && (
        <AdminSectionCard
          title="Message Templates"
          subtitle="Apply an approved template to jump-start a broadcast."
          headerAction={
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#003580] text-white'
                      : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          }
        >
          {filteredTemplates.length === 0 ? (
            <AdminEmptyState icon={MessageSquareText} title="No templates in this category" description="Try another category filter." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.name}
                  className="flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 transition hover:border-[#003580]/30 hover:shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <AdminBadge variant="neutral">{template.category}</AdminBadge>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{template.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-[var(--text-secondary)]">{template.title}</p>
                  <p className="mt-2 line-clamp-3 flex-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{template.message}</p>
                  <button
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#003580] px-3 py-2 text-xs font-bold text-white hover:brightness-110"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Use template
                  </button>
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>
      )}

      <AdminModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={sendMode === 'Send Now' ? 'Confirm broadcast' : 'Confirm schedule'}
        subtitle="Review delivery details before proceeding"
        size="md"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={executeSend}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white ${
                isUrgent ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#003580] hover:brightness-110'
              }`}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : sendMode === 'Send Now' ? <Send className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
              {sendMode === 'Send Now' ? 'Confirm & Send' : 'Confirm Schedule'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          {(isUrgent || isLargeAudience) && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 dark:border-[#F59E0B]/30 dark:bg-[#382B14] dark:text-[#F59E0B]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {isUrgent && <><strong>Urgent</strong> priority is selected. </>}
                {isLargeAudience && <>This will reach approximately <strong>{estimatedRecipientsCount.toLocaleString()}</strong> recipients. </>}
                Please confirm this is intentional.
              </p>
            </div>
          )}
          <div>
            <p className={fieldLabel}>Subject</p>
            <p className="mt-1 font-semibold text-[var(--text-primary)]">{subject}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div><p className={fieldLabel}>Channel</p><p className="mt-1 font-semibold text-[var(--text-primary)]">{type}</p></div>
            <div><p className={fieldLabel}>Priority</p><p className="mt-1 font-semibold text-[var(--text-primary)]">{priority}</p></div>
            <div><p className={fieldLabel}>Audience</p><p className="mt-1 font-semibold text-[var(--text-primary)]">{target.replace(/\s*\(.*\)/, '')}</p></div>
            <div><p className={fieldLabel}>Est. recipients</p><p className="mt-1 font-semibold text-[var(--text-primary)]">~{estimatedRecipientsCount.toLocaleString()}</p></div>
            {sendMode === 'Schedule for Date' && (
              <div className="sm:col-span-2">
                <p className={fieldLabel}>Scheduled for</p>
                <p className="mt-1 font-semibold text-[var(--text-primary)]">{scheduleDate} at {scheduleTime}</p>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3 text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-4 whitespace-pre-wrap">
            {message}
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.subject || 'Notification detail'}
        subtitle="Broadcast delivery record"
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => detail && reuseFromHistory(detail)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2 text-sm font-bold text-white hover:brightness-110"
            >
              <Copy className="h-4 w-4" />
              Reuse in composer
            </button>
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        }
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${typeClass(detail.type)}`}>
                <ChannelIcon type={detail.type} className="h-3 w-3" />
                {detail.type}
              </span>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${priorityClass(detail.priority)}`}>{detail.priority || 'Normal'}</span>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusClass(detail.status)}`}>{detail.status}</span>
              {detail.category && <AdminBadge variant="neutral">{detail.category}</AdminBadge>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div><p className={fieldLabel}>Sent</p><p className="mt-1 font-semibold text-[var(--text-primary)]">{new Date(detail.dateSent).toLocaleString()}</p></div>
              <div><p className={fieldLabel}>Target</p><p className="mt-1 font-semibold text-[var(--text-primary)]">{detail.targetGroup}</p></div>
              <div><p className={fieldLabel}>Recipients</p><p className="mt-1 font-semibold text-[var(--text-primary)]">{detail.recipients.toLocaleString()}</p></div>
              <div><p className={fieldLabel}>Open rate</p><p className="mt-1 font-semibold text-[var(--text-primary)]">{detail.openRate}</p></div>
              {detail.scheduledAt && (
                <div className="sm:col-span-2">
                  <p className={fieldLabel}>Scheduled at</p>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">{new Date(detail.scheduledAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            {detail.imageUrl && (
              <img src={detail.imageUrl} alt="" className="max-h-40 w-full rounded-xl object-cover border border-[var(--border-color)]" />
            )}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--text-primary)]">
              {detail.body}
            </div>
            {detail.ctaLink && (
              <a href={detail.ctaLink} target="_blank" rel="noreferrer" className="inline-flex text-xs font-bold text-[#003580] hover:underline">
                {detail.ctaText || detail.ctaLink}
              </a>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
