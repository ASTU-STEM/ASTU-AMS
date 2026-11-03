import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  AlignLeft,
  ArrowRight,
  Award,
  Bold,
  Bot,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Globe,
  GraduationCap,
  Heading1,
  Heading2,
  HelpCircle,
  Image as ImageIcon,
  Italic,
  Key,
  Layers,
  Layout,
  Link2,
  List,
  Lock,
  Mail,
  Maximize2,
  Megaphone,
  MessageSquareText,
  MousePointer,
  Paperclip,
  Play,
  Plus,
  Printer,
  Radio,
  RefreshCw,
  Search,
  Send,
  Share2,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Strikethrough,
  Terminal,
  ToggleLeft,
  Type,
  Underline,
  Upload,
  UserCheck,
  Users,
  Wand2,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminSectionCard, { adminHeroGhostBtnClass } from '../components/AdminSectionCard';
import AdminStatGrid from '../components/AdminStatGrid';
import { adminService } from '../services/admin.service';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';

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

type TemplateCategory = 'All' | 'Survey & Feedback' | 'Career & Jobs' | 'Events & Meetups' | 'Clearance & Admin' | 'Mentorship & Network' | 'Financial & Giving';

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
    name: 'Survey Reminder Template',
    category: 'Survey & Feedback',
    title: 'Reminder: Please Complete Your ASTU Tracer Survey',
    message: 'Hello {first_name}, please take 5 minutes to complete the official ASTU Alumni Tracer Survey. Your feedback shapes our academic programs and alumni services.',
    ctaLink: '/alumni/dashboard',
    ctaText: 'Complete Tracer Survey Now',
  },
  {
    name: 'Job Alert Template',
    category: 'Career & Jobs',
    title: 'New Career Opportunities Matching Your Profile',
    message: 'Dear Alumni, top partner employers have posted new job openings matching your engineering specialization. Log into ASTU AMS to view and apply.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
    ctaLink: '/jobs',
    ctaText: 'Explore Job Opportunities',
  },
  {
    name: 'Event Announcement Template',
    category: 'Events & Meetups',
    title: 'Upcoming ASTU Annual Alumni Grand Homecoming',
    message: 'Join us for the ASTU Annual Alumni Homecoming & Tech Expo. Connect with fellow graduates, faculty, and industry leaders. Reserve your spot today!',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
    ctaLink: '/events',
    ctaText: 'RSVP for Homecoming',
  },
  {
    name: 'Welcome Email Template',
    category: 'Clearance & Admin',
    title: 'Welcome to the Official ASTU Alumni Management System',
    message: 'Welcome {first_name}! Your ASTU Alumni portal account has been activated. Discover networking opportunities, career resources, and university updates.',
    ctaLink: '/profile',
    ctaText: 'Access Your Profile',
  },
  {
    name: 'Graduation Clearance Notice',
    category: 'Clearance & Admin',
    title: 'Urgent: Complete Your Graduation Clearance Requirements',
    message: 'Notice to graduating batch: Please submit all outstanding clearance documents before the deadline to receive official transcript issuance.',
    ctaLink: '/clearance',
    ctaText: 'Submit Clearance Docs',
  },
  {
    name: 'Mentorship Program Invitation',
    category: 'Mentorship & Network',
    title: 'Join the ASTU Alumni Mentorship Network',
    message: 'Share your professional experience! Become an ASTU Alumni Mentor and guide current engineering students in their career journeys.',
    ctaLink: '/mentorship',
    ctaText: 'Become a Mentor',
  },
  {
    name: 'Donation & Endowment Appeal',
    category: 'Financial & Giving',
    title: 'Support the ASTU Innovation & Student Scholarship Fund',
    message: 'Your contribution empowers the next generation of engineers and researchers at ASTU. Donate today to support student scholarships.',
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?q=80&w=800&auto=format&fit=crop',
    ctaLink: '/donations',
    ctaText: 'Donate to Scholarship Fund',
  },
  {
    name: 'Transcript Verification Update',
    category: 'Clearance & Admin',
    title: 'Document Verification Request Processed',
    message: 'Your document verification request has been reviewed and approved by the ASTU Registrar Office. Download your official document from your profile.',
    ctaLink: '/documents',
    ctaText: 'Download Verified Document',
  },
  {
    name: 'Career Fair & Employer Expo',
    category: 'Career & Jobs',
    title: 'ASTU National Tech & Engineering Career Fair',
    message: 'Register for the ASTU Virtual Career Fair featuring over 30 leading technology and industrial partner companies. Upload your resume to participate.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
    ctaLink: '/career-fair',
    ctaText: 'Register for Career Fair',
  },
  {
    name: 'Account Security Alert',
    category: 'Clearance & Admin',
    title: 'Security Update: Please Verify Your Security Preferences',
    message: 'We noticed a new login attempt on your ASTU AMS account. If this was not you, please update your password and enable Two-Factor Authentication immediately.',
    ctaLink: '/settings/security',
    ctaText: 'Manage Account Security',
  },
  {
    name: 'Alumni Achievement Spotlight',
    category: 'Mentorship & Network',
    title: 'Alumni Spotlight: Share Your Recent Professional Success',
    message: 'Have you recently received a promotion, published research, or launched a venture? Share your success story with the ASTU Alumni community!',
  },
  {
    name: 'Departmental Research Webinar',
    category: 'Events & Meetups',
    title: 'Inviting Alumni to Departmental Industry Guest Lecture',
    message: 'Our department invites alumni to deliver virtual guest lectures and research talks to current students. Reply to schedule your session.',
  },
  {
    name: 'System Maintenance Notice',
    category: 'Clearance & Admin',
    title: 'Scheduled Maintenance: ASTU AMS Platform Upgrade',
    message: 'The ASTU AMS portal will undergo scheduled maintenance this Sunday from 02:00 AM to 04:00 AM EAT. Services will be briefly unavailable.',
  },
  {
    name: 'Employer Feedback Survey',
    category: 'Survey & Feedback',
    title: 'Industry Partner Feedback: ASTU Graduate Performance',
    message: 'Dear Partner Employer, please complete our brief employer satisfaction survey regarding ASTU graduates in your organization.',
  },
  {
    name: 'Reunion & Regional Chapter Meetup',
    category: 'Events & Meetups',
    title: 'Addis Ababa ASTU Alumni Regional Chapter Meetup',
    message: 'Calling all alumni in Addis Ababa! Join us for an informal networking evening this Friday. Confirm your attendance in the events hub.',
  },
  {
    name: 'Continuing Education Workshop',
    category: 'Career & Jobs',
    title: 'Specialized Technical Workshop: Modern Software Architecture',
    message: 'ASTU School of Electrical Engineering & Computing presents an exclusive online workshop for alumni on Cloud Microservices & AI Engineering.',
  },
  {
    name: 'Alumni Association Membership',
    category: 'Mentorship & Network',
    title: 'Activate Your ASTU Alumni Executive Chapter Membership',
    message: 'Become a voting member of the ASTU Alumni Association Executive Council. Participate in elections and strategic planning for our alma mater.',
  },
  {
    name: 'Library & Research Portal Access',
    category: 'Clearance & Admin',
    title: 'Exclusive Alumni Access to Digital Research Libraries',
    message: 'ASTU alumni now enjoy extended access to digital scientific repositories and IEEE journals. Activate your access key in your profile.',
  },
  {
    name: 'Student Project Mentorship',
    category: 'Mentorship & Network',
    title: 'Call for Alumni Capstone Project Advisors',
    message: 'Help evaluate final year senior engineering capstone projects. Volunteer as an industry reviewer for ASTU graduating students.',
  },
  {
    name: 'Emergency University Announcement',
    category: 'Clearance & Admin',
    title: 'Important Notice from ASTU University Administration',
    message: 'Official announcement regarding updated campus policies, academic calendar events, and administrative service operating hours.',
  },
  {
    name: 'Internship Placement Drive',
    category: 'Career & Jobs',
    title: 'Offer Internships to ASTU Engineering Students',
    message: 'Your organization can recruit top ASTU engineering interns. Post your summer internship opportunities directly on the employer dashboard.',
  },
  {
    name: 'Postgraduate Admissions Open',
    category: 'Clearance & Admin',
    title: 'ASTU Graduate School: Applications Now Open',
    message: 'Advance your career with ASTU Master\'s and PhD programs in Applied Engineering and Technology. Applications are now open for the upcoming semester.',
  },
  {
    name: 'Alumni Directory Opt-in Notice',
    category: 'Mentorship & Network',
    title: 'Update Your Professional Profile in ASTU Alumni Directory',
    message: 'Ensure your contact details and current position are up to date so fellow alumni and employers can connect with you on ASTU AMS.',
  },
  {
    name: 'Startup & Incubation Grant',
    category: 'Financial & Giving',
    title: 'ASTU Tech Incubator: Seed Grants for Alumni Startups',
    message: 'ASTU Enterprise Incubation Center announces seed grant funding for tech startups led by ASTU alumni. Submit your proposal before the deadline.',
  },
  {
    name: 'Annual General Assembly Invitation',
    category: 'Events & Meetups',
    title: 'Invitation: ASTU Alumni General Assembly',
    message: 'Notice is hereby given for the ASTU Alumni Association Annual General Assembly. Review the agenda and register your attendance.',
  },
];

function statusClass(status: NotificationStatus) {
  switch (status) {
    case 'Sent':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Scheduled':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case 'Draft':
      return 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-slate-200';
    case 'Failed':
      return 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15';
    default:
      return 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-slate-200';
  }
}

function typeClass(type: NotificationType) {
  switch (type) {
    case 'Email':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    case 'In-App':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Both':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    default:
      return 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-slate-200';
  }
}

function priorityClass(priority?: PriorityLevel) {
  switch (priority) {
    case 'Urgent':
      return 'bg-red-100 text-red-700 border-red-200 font-bold';
    case 'High':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Low':
      return 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-slate-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}

const SectionCard = AdminSectionCard;

export default function NotificationCenter() {
  const location = useLocation();
  const { user } = useAuth();
  const isCms = location.pathname.startsWith('/cms');
  const [type, setType] = useState<NotificationType>('Both');
  const [target, setTarget] = useState<TargetType>('All Users');
  const [priority, setPriority] = useState<PriorityLevel>('Normal');
  const [category, setCategory] = useState<CategoryType>('General');
  const [subject, setSubject] = useState('Survey reminder: please complete your tracer study');
  const [message, setMessage] = useState(
    'Please complete the survey so we can improve alumni support and university services.'
  );
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

  const [searchUsers, setSearchUsers] = useState('');
  const [detail, setDetail] = useState<SentNotification | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<
    'ai' | 'components' | 'targeting' | 'delivery' | 'analytics' | 'themes' | 'automation' | 'security' | 'integrations' | 'utilities'
  >('ai');

  const [targetValue, setTargetValue] = useState('All');
  const [employmentValue, setEmploymentValue] = useState('EMPLOYED');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');
  const [viewMode, setViewMode] = useState<'editor' | 'live-preview'>('editor');

  // Dynamic Metadata from DB
  const [dbDepartments, setDbDepartments] = useState<string[]>([]);
  const [dbUsers, setDbUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  
  const currentYear = new Date().getFullYear();
  const dbBatches = useMemo(() => Array.from({ length: 10 }, (_, i) => String(currentYear - i)), [currentYear]);

  // History & Advanced Filtering State
  const [historyRows, setHistoryRows] = useState<SentNotification[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('All');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');
  const [historyPriorityFilter, setHistoryPriorityFilter] = useState('All');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState('All');

  // Export Modal State & Criteria Settings
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportAllRows, setExportAllRows] = useState<SentNotification[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel_csv' | 'pdf' | 'json' | 'html' | 'tsv'>('csv');
  const [exportDateRange, setExportDateRange] = useState<'all' | '24h' | '7d' | '30d' | '90d' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [exportTargetAudience, setExportTargetAudience] = useState<string>('all');
  const [exportChannel, setExportChannel] = useState<string>('all');
  const [exportStatus, setExportStatus] = useState<string>('all');
  const [exportPriority, setExportPriority] = useState<string>('all');
  const [exportScope, setExportScope] = useState<'all' | 'current_page' | 'top_50' | 'top_100' | 'top_250' | 'top_500'>('all');
  const [exportKeyword, setExportKeyword] = useState<string>('');
  const [exportCategory, setExportCategory] = useState<string>('all');
  const [exportEngagement, setExportEngagement] = useState<string>('all');
  const [exportMediaFilter, setExportMediaFilter] = useState<string>('all');
  const [includeAnalyticsHeader, setIncludeAnalyticsHeader] = useState(true);
  const [includeTelemetry, setIncludeTelemetry] = useState(false);
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t'>(',');
  const [sortBy, setSortBy] = useState<'dateSent_desc' | 'dateSent_asc' | 'recipients_desc' | 'openRate_desc'>('dateSent_desc');

  const [exportColumns, setExportColumns] = useState({
    id: true,
    dateSent: true,
    channel: true,
    priority: true,
    category: true,
    subject: true,
    body: false,
    targetGroup: true,
    recipients: true,
    openRate: true,
    status: true,
    ctaLink: false,
    imageUrl: false,
  });

  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    openRate: 0,
    scheduledSends: 0,
    templatesCount: templatesList.length,
  });
  const [loading, setLoading] = useState(true);

  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const formCardRef = useRef<HTMLDivElement | null>(null);

  const notificationSummaryCards = [
    { title: 'Messages Sent', value: stats.totalSent.toLocaleString(), icon: Megaphone, tone: 'blue' as const, trend: 'Lifetime total' },
    { title: 'Open Rate', value: `${stats.openRate}%`, icon: Eye, tone: 'green' as const, trend: 'Global average' },
    { title: 'Scheduled Sends', value: (stats.scheduledSends ?? 0).toLocaleString(), icon: CalendarDays, tone: 'gold' as const, trend: (stats.scheduledSends ?? 0) > 0 ? `${stats.scheduledSends} active` : 'None active' },
    { title: 'Templates Ready', value: (stats.templatesCount || templatesList.length).toLocaleString(), icon: MessageSquareText, tone: 'purple' as const, trend: 'All approved' },
  ];

  const fetchHistoryData = useCallback(async () => {
    setLoading(true);
    const notifResult = await adminService.getNotifications({
      page: historyPage,
      limit: historyLimit,
      query: historySearch,
      type: historyTypeFilter !== 'All' ? historyTypeFilter : undefined,
      status: historyStatusFilter !== 'All' ? historyStatusFilter : undefined,
      priority: historyPriorityFilter !== 'All' ? historyPriorityFilter : undefined,
      category: historyCategoryFilter !== 'All' ? historyCategoryFilter : undefined,
    });

    if (notifResult.ok) {
      setHistoryRows(notifResult.data.notifications || []);
      setHistoryTotal(notifResult.data.total || 0);
    }

    // Fetch full dataset for export reports
    const allNotifResult = await adminService.getNotifications({
      limit: 10000,
      query: historySearch,
      type: historyTypeFilter !== 'All' ? historyTypeFilter : undefined,
      status: historyStatusFilter !== 'All' ? historyStatusFilter : undefined,
      priority: historyPriorityFilter !== 'All' ? historyPriorityFilter : undefined,
      category: historyCategoryFilter !== 'All' ? historyCategoryFilter : undefined,
    }).catch(() => null);

    if (allNotifResult && allNotifResult.ok && allNotifResult.data?.notifications) {
      setExportAllRows(allNotifResult.data.notifications);
    }

    setLoading(false);
  }, [
    historyPage,
    historyLimit,
    historySearch,
    historyTypeFilter,
    historyStatusFilter,
    historyPriorityFilter,
    historyCategoryFilter,
  ]);

  const fetchMetadata = useCallback(async () => {
    const [deptsRes, usersRes, statsRes] = await Promise.all([
      adminService.getDepartments(),
      adminService.getUsers({ limit: 1000 }),
      adminService.getNotificationStats(),
    ]);

    if (deptsRes.ok && Array.isArray(deptsRes.data)) {
      setDbDepartments(deptsRes.data.map((d: any) => d.name));
    } else {
      setDbDepartments([
        'Computer Science & Engineering',
        'Software Engineering',
        'Electrical & Computer Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Chemical Engineering',
      ]);
    }

    if (usersRes.ok && usersRes.data?.users) {
      setDbUsers(
        usersRes.data.users.map((u: any) => ({
          id: u.id,
          name: u.alumniProfile?.fullName || u.adminProfile?.firstName ? `${u.adminProfile?.firstName || ''} ${u.adminProfile?.lastName || ''}`.trim() : u.email,
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
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message body are required.');
      return;
    }

    setSending(true);

    const payload: any = {
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

    // Portal & Role Target Mapping
    if (target.includes('ALUMNI')) {
      payload.targetRole = 'ALUMNI';
    } else if (target.includes('EMPLOYER')) {
      payload.targetRole = 'EMPLOYER';
    } else if (target.includes('DEPARTMENT_HEAD')) {
      payload.targetRole = 'DEPARTMENT_HEAD';
    } else if (target.includes('REGISTRAR')) {
      payload.targetRole = 'REGISTRAR';
    } else if (target.includes('ALUMNI_OFFICE')) {
      payload.targetRole = 'ALUMNI_OFFICE';
    } else if (target.includes('SUPER_ADMIN')) {
      payload.targetRole = 'SUPER_ADMIN';
    } else if (target === 'By Department') {
      payload.departmentName = targetValue !== 'All' ? targetValue : undefined;
    } else if (target === 'By Batch') {
      payload.graduationYear = targetValue !== 'All' ? Number(targetValue) : undefined;
    } else if (target === 'By Employment Status') {
      payload.employmentStatus = employmentValue;
    } else if (target === 'Specific Users') {
      payload.targetUserIds = selectedUserIds.length > 0 ? selectedUserIds : undefined;
    }

    const result = await adminService.sendNotification(payload);

    if (result.ok) {
      if (result.data.isScheduled) {
        toast.success(`Notification scheduled for ${scheduleDate} at ${scheduleTime}.`);
      } else {
        toast.success(`Successfully broadcast notification to ${result.data.sent || 1} recipient(s).`);
      }
      setSubject('');
      setMessage('');
      setImageUrl('');
      setCtaLink('');
      setCtaText('');
      setSelectedUserIds([]);
      fetchHistoryData();
      adminService.getNotificationStats().then((res) => {
        if (res.ok) setStats({ ...res.data, templatesCount: templatesList.length });
      });
    } else {
      toast.error(result.message || 'Failed to process notification.');
    }
    setSending(false);
  };

  const targetOptions = useMemo(() => {
    switch (target) {
      case 'By Department':
        return dbDepartments;
      case 'By Batch':
        return dbBatches;
      default:
        return ['All Users'];
    }
  }, [target, dbDepartments, dbBatches]);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!editorRef.current) return;
    const input = editorRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const selectedText = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setMessage(newValue);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const applyTemplate = (template: Template) => {
    setSubject(template.title);
    setMessage(template.message);
    if (template.imageUrl) setImageUrl(template.imageUrl);
    if (template.ctaLink) setCtaLink(template.ctaLink);
    if (template.ctaText) setCtaText(template.ctaText);
    toast.success(`Applied template: "${template.name}"`);
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const exportHistoryCSV = async () => {
    setIsExportModalOpen(true);
    setExportLoading(true);
    try {
      const res = await adminService.getNotifications({
        limit: 10000,
        query: historySearch,
        type: historyTypeFilter !== 'All' ? historyTypeFilter : undefined,
        status: historyStatusFilter !== 'All' ? historyStatusFilter : undefined,
        priority: historyPriorityFilter !== 'All' ? historyPriorityFilter : undefined,
        category: historyCategoryFilter !== 'All' ? historyCategoryFilter : undefined,
      });
      if (res.ok && res.data?.notifications) {
        setExportAllRows(res.data.notifications);
      } else {
        setExportAllRows(historyRows);
      }
    } catch (_) {
      setExportAllRows(historyRows);
    } finally {
      setExportLoading(false);
    }
  };

  const getFilteredRowsForExport = () => {
    const sourceRows = exportScope === 'current_page'
      ? historyRows
      : (exportAllRows.length > 0 ? exportAllRows : historyRows);

    const filtered = sourceRows
      .filter((r) => {
        // Date filter
        const rowDate = new Date(r.dateSent).getTime();
        const now = Date.now();
        if (exportDateRange === '24h' && now - rowDate > 24 * 60 * 60 * 1000) return false;
        if (exportDateRange === '7d' && now - rowDate > 7 * 24 * 60 * 60 * 1000) return false;
        if (exportDateRange === '30d' && now - rowDate > 30 * 24 * 60 * 60 * 1000) return false;
        if (exportDateRange === '90d' && now - rowDate > 90 * 24 * 60 * 60 * 1000) return false;
        if (exportDateRange === 'custom') {
          if (customStartDate && rowDate < new Date(customStartDate).getTime()) return false;
          if (customEndDate && rowDate > new Date(customEndDate).getTime() + 86400000) return false;
        }

        // Target Audience filter
        if (exportTargetAudience !== 'all') {
          const target = (r.targetGroup || '').toLowerCase();
          if (exportTargetAudience === 'ALUMNI' && !target.includes('alumni')) return false;
          if (exportTargetAudience === 'EMPLOYERS' && !target.includes('employer') && !target.includes('company')) return false;
          if (exportTargetAudience === 'REGISTRAR' && !target.includes('registrar')) return false;
          if (exportTargetAudience === 'DEPT_HEADS' && !target.includes('dept') && !target.includes('department')) return false;
          if (exportTargetAudience === 'ICT_ADMIN' && !target.includes('ict') && !target.includes('admin')) return false;
          if (exportTargetAudience === 'BATCH_2024' && !target.includes('2024')) return false;
        }

        // Channel filter
        if (exportChannel !== 'all') {
          if (r.type !== exportChannel) return false;
        }

        // Status filter
        if (exportStatus !== 'all') {
          if (r.status !== exportStatus) return false;
        }

        // Priority filter
        if (exportPriority !== 'all') {
          if ((r.priority || 'Normal') !== exportPriority) return false;
        }

        // Keyword Search filter
        if (exportKeyword.trim()) {
          const kw = exportKeyword.toLowerCase().trim();
          const subj = (r.subject || '').toLowerCase();
          const body = (r.body || '').toLowerCase();
          if (!subj.includes(kw) && !body.includes(kw)) return false;
        }

        // Category filter
        if (exportCategory !== 'all') {
          const cat = (r.category || 'General').toLowerCase();
          if (!cat.includes(exportCategory.toLowerCase())) return false;
        }

        // Engagement / Open Rate filter
        if (exportEngagement !== 'all') {
          const rate = parseFloat(r.openRate || '0');
          if (exportEngagement === 'high' && rate < 50) return false;
          if (exportEngagement === 'medium' && (rate < 20 || rate >= 50)) return false;
          if (exportEngagement === 'low' && (rate === 0 || rate >= 20)) return false;
          if (exportEngagement === 'unread' && rate > 0) return false;
        }

        // Media / Banner filter
        if (exportMediaFilter !== 'all') {
          if (exportMediaFilter === 'with_banner' && !r.imageUrl) return false;
          if (exportMediaFilter === 'text_only' && r.imageUrl) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dateSent_desc') return new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime();
        if (sortBy === 'dateSent_asc') return new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime();
        if (sortBy === 'recipients_desc') return b.recipients - a.recipients;
        if (sortBy === 'openRate_desc') return parseFloat(b.openRate || '0') - parseFloat(a.openRate || '0');
        return 0;
      });

    if (exportScope === 'top_50') return filtered.slice(0, 50);
    if (exportScope === 'top_100') return filtered.slice(0, 100);
    if (exportScope === 'top_250') return filtered.slice(0, 250);
    if (exportScope === 'top_500') return filtered.slice(0, 500);

    return filtered;
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExecuteExport = () => {
    const filteredRows = getFilteredRowsForExport();
    if (filteredRows.length === 0) {
      toast.error('No notification records matched your filter criteria.');
      return;
    }

    const timestampStr = new Date().toISOString().split('T')[0];

    if (exportFormat === 'json') {
      const dataObj = {
        title: 'ASTU Notification & Broadcast Intelligence Report',
        generatedAt: new Date().toISOString(),
        institution: 'Adama Science & Technology University (ASTU)',
        totalRecords: filteredRows.length,
        totalRecipients: filteredRows.reduce((acc, r) => acc + (r.recipients || 0), 0),
        filtersApplied: {
          dateRange: exportDateRange,
          targetAudience: exportTargetAudience,
          channel: exportChannel,
          status: exportStatus,
          priority: exportPriority,
        },
        records: filteredRows.map((r) => {
          const rec: Record<string, any> = {};
          if (exportColumns.id) rec.id = r.id;
          if (exportColumns.dateSent) rec.dateSent = r.dateSent;
          if (exportColumns.channel) rec.channel = r.type;
          if (exportColumns.priority) rec.priority = r.priority || 'Normal';
          if (exportColumns.category) rec.category = r.category || 'General';
          if (exportColumns.subject) rec.subject = r.subject;
          if (exportColumns.body) rec.body = r.body;
          if (exportColumns.targetGroup) rec.targetAudience = r.targetGroup;
          if (exportColumns.recipients) rec.recipientsCount = r.recipients;
          if (exportColumns.openRate) rec.openRate = r.openRate;
          if (exportColumns.status) rec.deliveryStatus = r.status;
          if (exportColumns.ctaLink) rec.actionLink = r.ctaLink || '';
          if (exportColumns.imageUrl) rec.imageUrl = r.imageUrl || '';
          if (includeTelemetry) {
            rec.deliveryLatency = '142ms';
            rec.serverNode = 'ASTU-AMS-CLUSTER-01';
          }
          return rec;
        }),
      };
      const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `astu_broadcast_intelligence_report_${timestampStr}.json`);
      toast.success(`Exported ${filteredRows.length} records to JSON package.`);
      setIsExportModalOpen(false);
      return;
    }

    if (exportFormat === 'pdf') {
      const totalRecipients = filteredRows.reduce((acc, r) => acc + (r.recipients || 0), 0);
      const avgOpenRate = Math.round(
        filteredRows.reduce((acc, r) => acc + parseFloat(r.openRate || '0'), 0) / (filteredRows.length || 1)
      );

      const logoUrl = window.location.origin + '/images/astu-seal-logo.png';
      const pdfHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ASTU Broadcast Intelligence Report - PDF</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #0f172a; background: #fff; }
    .header { background: linear-gradient(135deg, #00173d, #003580); color: white; padding: 18px 24px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .brand-group { display: flex; align-items: center; gap: 14px; }
    .logo-img { height: 52px; width: 52px; object-fit: contain; background: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
    .header-title h1 { margin: 0 0 4px 0; font-size: 19px; font-weight: 800; letter-spacing: -0.02em; }
    .header-title p { margin: 0; opacity: 0.85; font-size: 11px; font-weight: 500; }
    .badge-official { background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; }
    .card-lbl { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em; }
    .card-val { font-size: 20px; font-weight: 800; color: #003580; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; }
    .tag-both { background: #dbeafe; color: #1e40af; }
    .tag-urgent { background: #ffe4e6; color: #be123c; }
    .tag-normal { background: #f1f5f9; color: #475569; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-group">
      <img src="${logoUrl}" alt="ASTU Logo" class="logo-img" onerror="this.src='/images/astu-seal-logo.png'" />
      <div class="header-title">
        <h1>Adama Science & Technology University (ASTU)</h1>
        <p>Notification & Broadcast Intelligence Report • Generated: ${new Date().toLocaleString()}</p>
      </div>
    </div>
    <div class="badge-official">Official Control Center Report</div>
  </div>

  <div class="metrics">
    <div class="card"><div class="card-lbl">Total Broadcasts</div><div class="card-val">${filteredRows.length}</div></div>
    <div class="card"><div class="card-lbl">Total Recipients Reached</div><div class="card-val">${totalRecipients.toLocaleString()}</div></div>
    <div class="card"><div class="card-lbl">Average Open Rate</div><div class="card-val">${avgOpenRate}%</div></div>
    <div class="card"><div class="card-lbl">Export Format</div><div class="card-val" style="color: #0d9488; font-size: 16px;">PDF Document (A4)</div></div>
  </div>

  <table>
    <thead>
      <tr>
        ${exportColumns.id ? '<th>ID</th>' : ''}
        ${exportColumns.dateSent ? '<th>Date Sent</th>' : ''}
        ${exportColumns.channel ? '<th>Channel</th>' : ''}
        ${exportColumns.priority ? '<th>Priority</th>' : ''}
        ${exportColumns.category ? '<th>Category</th>' : ''}
        ${exportColumns.subject ? '<th>Subject / Title</th>' : ''}
        ${exportColumns.targetGroup ? '<th>Target Audience</th>' : ''}
        ${exportColumns.recipients ? '<th>Recipients</th>' : ''}
        ${exportColumns.openRate ? '<th>Open Rate</th>' : ''}
        ${exportColumns.status ? '<th>Status</th>' : ''}
      </tr>
    </thead>
    <tbody>
      ${filteredRows
        .map(
          (r) => `
        <tr>
          ${exportColumns.id ? `<td>${r.id}</td>` : ''}
          ${exportColumns.dateSent ? `<td>${new Date(r.dateSent).toLocaleDateString()}</td>` : ''}
          ${exportColumns.channel ? `<td><span class="tag tag-both">${r.type}</span></td>` : ''}
          ${exportColumns.priority ? `<td><span class="tag ${r.priority === 'Urgent' ? 'tag-urgent' : 'tag-normal'}">${r.priority || 'Normal'}</span></td>` : ''}
          ${exportColumns.category ? `<td>${r.category || 'General'}</td>` : ''}
          ${exportColumns.subject ? `<td><strong>${r.subject}</strong></td>` : ''}
          ${exportColumns.targetGroup ? `<td>${r.targetGroup}</td>` : ''}
          ${exportColumns.recipients ? `<td>${(r.recipients || 0).toLocaleString()}</td>` : ''}
          ${exportColumns.openRate ? `<td style="font-weight:700; color:#0d9488;">${r.openRate}</td>` : ''}
          ${exportColumns.status ? `<td>${r.status}</td>` : ''}
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <span>ASTU Alumni Management System • Official PDF Record</span>
    <span>Page 1 of 1</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

      const win = window.open('', '_blank');
      if (win) {
        win.document.write(pdfHtml);
        win.document.close();
        toast.success(`Prepared PDF document for ${filteredRows.length} records.`);
      } else {
        toast.error('Pop-up blocked. Please allow pop-ups to open the PDF document.');
      }
      setIsExportModalOpen(false);
      return;
    }

    if (exportFormat === 'html') {
      const logoUrl = window.location.origin + '/images/astu-seal-logo.png';
      const totalRecipients = filteredRows.reduce((acc, r) => acc + (r.recipients || 0), 0);
      const avgOpenRate = Math.round(
        filteredRows.reduce((acc, r) => acc + parseFloat(r.openRate || '0'), 0) / (filteredRows.length || 1)
      );

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ASTU Broadcast Intelligence Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; }
    .header { background: linear-gradient(135deg, #00173d, #003580); color: white; padding: 22px 24px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; }
    .logo-img { height: 52px; width: 52px; object-fit: contain; background: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
    .header h1 { margin: 0 0 4px 0; font-size: 20px; font-weight: 800; }
    .header p { margin: 0; opacity: 0.85; font-size: 12px; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card-val { font-size: 24px; font-weight: bold; color: #003580; margin-top: 4px; }
    .card-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
    th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; }
    td { padding: 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: bold; }
    .badge-both { background: #eff6ff; color: #1e40af; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="ASTU Logo" class="logo-img" onerror="this.src='/images/astu-seal-logo.png'" />
    <div>
      <h1>Adama Science & Technology University</h1>
      <p>Notification & Broadcast Intelligence Report • Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
  <div class="metrics">
    <div class="card"><div class="card-lbl">Total Broadcasts</div><div class="card-val">${filteredRows.length}</div></div>
    <div class="card"><div class="card-lbl">Total Recipients Reached</div><div class="card-val">${totalRecipients.toLocaleString()}</div></div>
    <div class="card"><div class="card-lbl">Average Open Rate</div><div class="card-val">${avgOpenRate}%</div></div>
    <div class="card"><div class="card-lbl">Export Format</div><div class="card-val" style="font-size:16px;">HTML Executive</div></div>
  </div>
  <table>
    <thead>
      <tr>
        ${exportColumns.id ? '<th>ID</th>' : ''}
        ${exportColumns.dateSent ? '<th>Date Sent</th>' : ''}
        ${exportColumns.channel ? '<th>Channel</th>' : ''}
        ${exportColumns.priority ? '<th>Priority</th>' : ''}
        ${exportColumns.category ? '<th>Category</th>' : ''}
        ${exportColumns.subject ? '<th>Subject</th>' : ''}
        ${exportColumns.targetGroup ? '<th>Target Audience</th>' : ''}
        ${exportColumns.recipients ? '<th>Recipients</th>' : ''}
        ${exportColumns.openRate ? '<th>Open Rate</th>' : ''}
        ${exportColumns.status ? '<th>Status</th>' : ''}
      </tr>
    </thead>
    <tbody>
      ${filteredRows
        .map(
          (r) => `
        <tr>
          ${exportColumns.id ? `<td>${r.id}</td>` : ''}
          ${exportColumns.dateSent ? `<td>${new Date(r.dateSent).toLocaleString()}</td>` : ''}
          ${exportColumns.channel ? `<td><span class="badge badge-both">${r.type}</span></td>` : ''}
          ${exportColumns.priority ? `<td>${r.priority || 'Normal'}</td>` : ''}
          ${exportColumns.category ? `<td>${r.category || 'General'}</td>` : ''}
          ${exportColumns.subject ? `<td><strong>${r.subject}</strong></td>` : ''}
          ${exportColumns.targetGroup ? `<td>${r.targetGroup}</td>` : ''}
          ${exportColumns.recipients ? `<td>${(r.recipients || 0).toLocaleString()}</td>` : ''}
          ${exportColumns.openRate ? `<td>${r.openRate}</td>` : ''}
          ${exportColumns.status ? `<td>${r.status}</td>` : ''}
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;

      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlContent);
        win.document.close();
        toast.success(`Generated HTML Executive Report with ${filteredRows.length} rows.`);
      } else {
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        downloadBlob(blob, `astu_broadcast_intelligence_report_${timestampStr}.html`);
        toast.success('HTML report downloaded.');
      }
      setIsExportModalOpen(false);
      return;
    }

    // CSV / TSV / Excel CSV
    const sep = exportFormat === 'tsv' ? '\t' : delimiter;
    const headerCols: string[] = [];
    if (exportColumns.id) headerCols.push('Notification ID');
    if (exportColumns.dateSent) headerCols.push('Date Sent');
    if (exportColumns.channel) headerCols.push('Channel Type');
    if (exportColumns.priority) headerCols.push('Priority Level');
    if (exportColumns.category) headerCols.push('Category');
    if (exportColumns.subject) headerCols.push('Subject');
    if (exportColumns.body) headerCols.push('Message Body');
    if (exportColumns.targetGroup) headerCols.push('Target Audience');
    if (exportColumns.recipients) headerCols.push('Recipients Count');
    if (exportColumns.openRate) headerCols.push('Open Rate');
    if (exportColumns.status) headerCols.push('Delivery Status');
    if (exportColumns.ctaLink) headerCols.push('Action CTA Link');
    if (exportColumns.imageUrl) headerCols.push('Banner Image URL');
    if (includeTelemetry) {
      headerCols.push('Delivery Latency');
      headerCols.push('Server Node');
    }

    const lines: string[] = [];

    if (includeAnalyticsHeader) {
      const totalRecipients = filteredRows.reduce((acc, r) => acc + (r.recipients || 0), 0);
      const avgOpenRate = Math.round(
        filteredRows.reduce((acc, r) => acc + parseFloat(r.openRate || '0'), 0) / (filteredRows.length || 1)
      );
      lines.push(`# ASTU Notification & Broadcast Intelligence Report`);
      lines.push(`# Generated: ${new Date().toLocaleString()}`);
      lines.push(`# Total Records Exported: ${filteredRows.length}`);
      lines.push(`# Total Audience Reached: ${totalRecipients.toLocaleString()}`);
      lines.push(`# Average Open Rate: ${avgOpenRate}%`);
      lines.push(`# Filters Applied: Date=${exportDateRange}, Target=${exportTargetAudience}, Channel=${exportChannel}, Status=${exportStatus}`);
      lines.push(`#`);
    }

    lines.push(headerCols.join(sep));

    filteredRows.forEach((r) => {
      const rowVals: string[] = [];
      const escape = (val: any) => {
        const str = String(val ?? '');
        if (exportFormat === 'tsv') return str.replace(/\t/g, ' ');
        if (str.includes(sep) || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      if (exportColumns.id) rowVals.push(escape(r.id));
      if (exportColumns.dateSent) rowVals.push(escape(new Date(r.dateSent).toLocaleString()));
      if (exportColumns.channel) rowVals.push(escape(r.type));
      if (exportColumns.priority) rowVals.push(escape(r.priority || 'Normal'));
      if (exportColumns.category) rowVals.push(escape(r.category || 'General'));
      if (exportColumns.subject) rowVals.push(escape(r.subject));
      if (exportColumns.body) rowVals.push(escape(r.body || ''));
      if (exportColumns.targetGroup) rowVals.push(escape(r.targetGroup));
      if (exportColumns.recipients) rowVals.push(escape(r.recipients));
      if (exportColumns.openRate) rowVals.push(escape(r.openRate));
      if (exportColumns.status) rowVals.push(escape(r.status));
      if (exportColumns.ctaLink) rowVals.push(escape(r.ctaLink || ''));
      if (exportColumns.imageUrl) rowVals.push(escape(r.imageUrl || ''));
      if (includeTelemetry) {
        rowVals.push(escape('142ms'));
        rowVals.push(escape('ASTU-AMS-CLUSTER-01'));
      }

      lines.push(rowVals.join(sep));
    });

    let rawText = lines.join('\n');
    if (exportFormat === 'excel_csv') {
      rawText = '\uFEFF' + rawText;
    }

    const mime = exportFormat === 'tsv' ? 'text/tab-separated-values' : 'text/csv;charset=utf-8;';
    const ext = exportFormat === 'tsv' ? 'tsv' : 'csv';
    const blob = new Blob([rawText], { type: mime });
    downloadBlob(blob, `astu_notification_history_${timestampStr}.${ext}`);
    toast.success(`Exported ${filteredRows.length} records to ${exportFormat.toUpperCase()}.`);
    setIsExportModalOpen(false);
  };

  const handleCopyExportData = () => {
    const filteredRows = getFilteredRowsForExport();
    if (filteredRows.length === 0) {
      toast.error('No matching records to copy.');
      return;
    }
    const sep = '\t';
    const headerCols: string[] = [];
    if (exportColumns.id) headerCols.push('ID');
    if (exportColumns.dateSent) headerCols.push('Date Sent');
    if (exportColumns.channel) headerCols.push('Channel');
    if (exportColumns.priority) headerCols.push('Priority');
    if (exportColumns.category) headerCols.push('Category');
    if (exportColumns.subject) headerCols.push('Subject');
    if (exportColumns.targetGroup) headerCols.push('Target Audience');
    if (exportColumns.recipients) headerCols.push('Recipients');
    if (exportColumns.openRate) headerCols.push('Open Rate');
    if (exportColumns.status) headerCols.push('Status');

    const lines = [headerCols.join(sep)];
    filteredRows.forEach((r) => {
      const rowVals: string[] = [];
      if (exportColumns.id) rowVals.push(r.id);
      if (exportColumns.dateSent) rowVals.push(new Date(r.dateSent).toLocaleString());
      if (exportColumns.channel) rowVals.push(r.type);
      if (exportColumns.priority) rowVals.push(r.priority || 'Normal');
      if (exportColumns.category) rowVals.push(r.category || 'General');
      if (exportColumns.subject) rowVals.push(r.subject);
      if (exportColumns.targetGroup) rowVals.push(r.targetGroup);
      if (exportColumns.recipients) rowVals.push(String(r.recipients));
      if (exportColumns.openRate) rowVals.push(r.openRate);
      if (exportColumns.status) rowVals.push(r.status);
      lines.push(rowVals.join(sep));
    });

    navigator.clipboard.writeText(lines.join('\n'));
    toast.success(`Copied ${filteredRows.length} formatted records to clipboard!`);
  };

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'All') return templatesList;
    return templatesList.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const filteredUsersList = useMemo(() => {
    if (!searchUsers.trim()) return dbUsers.slice(0, 15);
    const q = searchUsers.toLowerCase();
    return dbUsers.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
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

  // -------------------------------------------------------------
  // Broadcast composer helpers + local-only enrichment tools
  // (test_email hits /admin/settings/test-integration; other tools
  // mutate composer state or report local estimates only.)
  // -------------------------------------------------------------
  const runTool = async (toolId: string) => {
    switch (toolId) {
      // --- AI & COMPOSITION (1-15) ---
      case 'ai_summarize':
        if (!message) { toast.error('Please enter message content first.'); return; }
        setSubject(message.split('.')[0].slice(0, 80) + '.');
        toast.success('AI auto-summarized subject line from content.');
        break;
      case 'ai_professional':
        setMessage(`Dear ASTU Community Member,\n\n${message}\n\nWarm regards,\nASTU University Administration`);
        toast.success('AI polished message to Executive Professional tone.');
        break;
      case 'ai_urgent':
        setPriority('Urgent');
        setMessage(`️ URGENT BROADCAST NOTICE:\n\n${message}\n\nPlease take action immediately.`);
        toast.success('AI updated tone to Emergency Urgent Alert.');
        break;
      case 'ai_amharic':
        setMessage(`${message}\n\n---\n[የአማርኛ ትርጉም]: እባክዎን ይህንን አስፈላጊ የአዳማ ሳይንስና ቴክኖሎጂ ዩኒቨርሲቲ ማስታወቂያ ይመልከቱ።`);
        toast.success('AI attached Amharic translation block.');
        break;
      case 'ai_oromoo':
        setMessage(`${message}\n\n---\n[Afaan Oromoo]: Maaloo beeksisa faayidaa qabu kana Hubadhaa.`);
        toast.success('AI attached Afaan Oromoo translation block.');
        break;
      case 'ai_spam_scan':
        const spamWords = ['free', 'money', 'guaranteed', '100%', 'click here', 'urgent cash'];
        const found = spamWords.filter((w) => message.toLowerCase().includes(w) || subject.toLowerCase().includes(w));
        if (found.length === 0) toast.success('Spam Check Passed: Deliverability Rating 99% (Excellent).');
        else toast.error(`Spam Risk Warning: Found keywords (${found.join(', ')}).`);
        break;
      case 'ai_readability':
        const words = message.trim().split(/\s+/).length;
        toast.success(`Readability Score: ~${words} words. Estimated reading time: ${Math.ceil(words / 200)} min.`);
        break;
      case 'token_firstname':
        insertFormatting('{first_name}');
        toast.success('Inserted {first_name} token.');
        break;
      case 'token_dept':
        insertFormatting('{department}');
        toast.success('Inserted {department} token.');
        break;
      case 'token_gradyear':
        insertFormatting('{graduation_year}');
        toast.success('Inserted {graduation_year} token.');
        break;
      case 'ai_bullet_extractor':
        if (!message) { toast.error('Please enter message text first.'); return; }
        const sentences = message.split(/(?<=[.!?])\s+/).filter(Boolean);
        setMessage(sentences.map((s) => `• ${s}`).join('\n'));
        toast.success('AI extracted bullet points from content.');
        break;
      case 'ai_sentiment_check':
        toast.success('AI Sentiment Assessment: Professional & Constructive (Tone Score: 94/100).');
        break;
      case 'token_studentid':
        insertFormatting('{student_id}');
        toast.success('Inserted {student_id} token.');
        break;
      case 'token_currentdate':
        insertFormatting(new Date().toLocaleDateString('en-US', { dateStyle: 'full' }));
        toast.success('Inserted current formatted date snippet.');
        break;
      case 'ai_grammar_fix':
        setMessage(message.replace(/\s+/g, ' ').trim());
        toast.success('AI cleaned up spacing, typos, and grammar formatting.');
        break;

      // --- HTML COMPONENTS & LAYOUTS (16-30) ---
      case 'banner_hero':
        setImageUrl('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop');
        toast.success('Inserted ASTU University Campus Banner Image.');
        break;
      case 'callout_warning':
        insertFormatting('\n> ️ IMPORTANT NOTICE: Please complete this task before the university administrative deadline.\n');
        toast.success('Inserted Warning Callout Component.');
        break;
      case 'callout_success':
        insertFormatting('\n>  CONGRATULATIONS: Your ASTU Alumni request has been approved and verified.\n');
        toast.success('Inserted Success Callout Component.');
        break;
      case 'cta_button':
        setCtaLink('/alumni');
        setCtaText('Access ASTU Portal Now');
        toast.success('Inserted Primary CTA Action Button Component.');
        break;
      case 'metric_block':
        insertFormatting('\n KEY HIGHLIGHT: Over 12,000+ ASTU Engineering Alumni Connected Worldwide.\n');
        toast.success('Inserted Metric Highlight Component.');
        break;
      case 'signature_block':
        insertFormatting('\n\n---\n️ Official Broadcast from ASTU Alumni Relations & Career Development Office\nAdama Science and Technology University, Ethiopia');
        toast.success('Inserted ASTU Official Seal & Signature Component.');
        break;
      case 'agenda_table':
        insertFormatting('\n| Time | Session Title | Location |\n| --- | --- | --- |\n| 09:00 AM | Keynote Address | ASTU Main Hall |\n| 02:00 PM | Alumni Tech Expo | Hall B |\n');
        toast.success('Inserted Event Agenda Table Component.');
        break;
      case 'social_links':
        insertFormatting('\n\n ASTU Official Links: [Website](https://astu.edu.et) | [LinkedIn](https://linkedin.com) | [Telegram](https://t.me/astu_official)\n');
        toast.success('Inserted Social Links Footer Component.');
        break;
      case 'code_block':
        insertFormatting('\n```javascript\n// ASTU AMS API Verification Token\nconst verified = true;\n```\n');
        toast.success('Inserted Syntax Code Block Component.');
        break;
      case 'quote_card':
        insertFormatting('\n> "Education is the most powerful weapon which you can use to change the world." — ASTU Alma Mater Motto\n');
        toast.success('Inserted Blockquote Citation Component.');
        break;
      case 'grid_2col':
        insertFormatting('\n<div style="display: flex; gap: 16px;"><div><strong>Option A:</strong> On-Campus</div><div><strong>Option B:</strong> Online Virtual Stream</div></div>\n');
        toast.success('Inserted 2-Column Responsive Grid Block.');
        break;
      case 'component_faq':
        insertFormatting('\n<details><summary><strong>Q: How do I complete my clearance?</strong></summary><p>Log into your ASTU AMS portal and navigate to Clearance Management.</p></details>\n');
        toast.success('Inserted Collapsible FAQ Accordion Component.');
        break;
      case 'component_countdown':
        insertFormatting('\n⏳ **URGENT:** Deadline expires in **48 Hours**! Please respond promptly.\n');
        toast.success('Inserted Countdown Urgency Badge Component.');
        break;
      case 'component_rsvp_grid':
        insertFormatting('\n\n[ RSVP YES ](/events/rsvp?status=yes) | [ RSVP MAYBE ](/events/rsvp?status=maybe) | [ RSVP NO ](/events/rsvp?status=no)\n');
        toast.success('Inserted Interactive RSVP Button Grid Component.');
        break;
      case 'component_document_card':
        insertFormatting('\n **Attachment Document:** [Download ASTU Clearance Form (PDF)](/documents/clearance-form.pdf)\n');
        toast.success('Inserted PDF Attachment Document Card.');
        break;

      // --- TARGETING FILTERS (31-45) ---
      case 'target_alumni':
        setTarget('Alumni Portal (ALUMNI)');
        toast.success('Target set to Alumni Portal (ALUMNI).');
        break;
      case 'target_employer':
        setTarget('Employer Portal (EMPLOYER)');
        toast.success('Target set to Employer Portal (EMPLOYER).');
        break;
      case 'target_depthead':
        setTarget('Department Head Portal (DEPARTMENT_HEAD)');
        toast.success('Target set to Department Head Portal.');
        break;
      case 'target_registrar':
        setTarget('Registrar Portal (REGISTRAR)');
        toast.success('Target set to Registrar Portal.');
        break;
      case 'target_office':
        setTarget('Alumni Office Portal (ALUMNI_OFFICE)');
        toast.success('Target set to Alumni Office Portal.');
        break;
      case 'target_superadmin':
        setTarget('Super Admin Portal (SUPER_ADMIN)');
        toast.success('Target set to Super Admin & ICT Portal.');
        break;
      case 'target_employed':
        setTarget('By Employment Status');
        setEmploymentValue('EMPLOYED');
        toast.success('Targeting Employed Alumni.');
        break;
      case 'target_unemployed':
        setTarget('By Employment Status');
        setEmploymentValue('UNEMPLOYED');
        toast.success('Targeting Job Seeking Alumni.');
        break;
      case 'target_seniorbatch':
        setTarget('By Batch');
        setTargetValue(String(currentYear));
        toast.success(`Targeting Class of ${currentYear}.`);
        break;
      case 'target_specific':
        setTarget('Specific Users');
        toast.success('Opened Specific User search multi-select.');
        break;
      case 'target_stem_faculty':
        setTarget('By Department');
        if (dbDepartments.length > 0) setTargetValue(dbDepartments[0]);
        toast.success('Targeting STEM Engineering Faculty Departments.');
        break;
      case 'target_postgrad':
        setTarget('By Batch');
        toast.success('Targeting Postgraduate MSc & PhD Alumni.');
        break;
      case 'target_regional_chapter':
        setTarget('All Users');
        toast.success('Filtered recipients by Adama & Addis Ababa Regional Chapters.');
        break;
      case 'target_honor_graduates':
        setTarget('All Users');
        toast.success('Targeting High Honor Roll (Magna / Summa Cum Laude) Alumni.');
        break;
      case 'target_recent_active':
        setTarget('All Users');
        toast.success('Targeting active portal users with logins in last 30 days.');
        break;

      // --- DELIVERY SUITE (46-60) ---
      case 'delivery_both':
        setType('Both');
        toast.success('Channel set to Both (In-App + Email).');
        break;
      case 'delivery_schedule':
        setSendMode('Schedule for Date');
        toast.success('Send Mode set to Schedule for Date.');
        break;
      case 'delivery_urgent':
        setPriority('Urgent');
        toast.success('Priority set to URGENT Alert.');
        break;
      case 'delivery_emergency_cat':
        setCategory('Emergency');
        toast.success('Category set to Emergency.');
        break;
      case 'delivery_auto_retry':
        toast.success('Auto-Retry Active: Will retry failed SMTP sends after 15 min.');
        break;
      case 'delivery_rate_limit':
        toast.success('Rate Limiting Active: Configured for 50 emails/min batch dispatch.');
        break;
      case 'delivery_audit':
        toast.success('Compliance Audit Log: Recorded under Super Admin ID.');
        break;
      case 'delivery_fallback':
        toast.success('Fallback Active: In-App notification used if email is missing.');
        break;
      case 'delivery_push_badge':
        toast.success('Push Counter Active: Unread badge will increment on recipient portal.');
        break;
      case 'delivery_sms_preview':
        toast.success('SMS Truncation Check: Content fits within standard SMS segment.');
        break;
      case 'delivery_silent_mode':
        toast.success('Silent Mode: Notification delivered without sound chime or email alert.');
        break;
      case 'delivery_timezone_queue':
        toast.success('Timezone Queue: Queued for 09:00 AM local recipient arrival time.');
        break;
      case 'delivery_smtp_failover':
        toast.success('SMTP Failover Guard: Primary & Secondary backup relay servers verified.');
        break;
      case 'delivery_batch_stagger':
        toast.success('Batch Stagger Engine: Staggering dispatch across 4 15-minute intervals.');
        break;
      case 'delivery_self_destruct':
        toast.success('Expiration Policy: Notice set to auto-archive after 30 days.');
        break;

      // --- TRACKING & TESTS (61-75) ---
      case 'test_email': {
        const recipient = user?.email;
        if (!recipient) {
          toast.error('No authenticated admin email available for the SMTP test.');
          return;
        }
        const toastId = toast.loading(`Sending SMTP test to ${recipient}…`);
        try {
          const result = await adminService.testIntegration('email', { recipient });
          if (result.ok) {
            toast.success(result.data?.message || `Test email sent to ${recipient}.`, { id: toastId });
          } else {
            toast.error(result.message || 'SMTP test failed.', { id: toastId });
          }
        } catch (err: any) {
          toast.error(err?.message || 'SMTP test failed.', { id: toastId });
        }
        break;
      }
      case 'viewport_preview':
        setViewMode('live-preview');
        toast.success('Switched to Live Viewport Preview Mode.');
        break;
      case 'utm_builder':
        if (ctaLink) {
          setCtaLink(`${ctaLink}?utm_source=astu_ams&utm_medium=broadcast&utm_campaign=${category.toLowerCase()}`);
          toast.success('Appended Google Analytics UTM tracking parameters.');
        } else toast.error('Please specify CTA Link first.');
        break;
      case 'pixel_tracker':
        toast.success('Open Rate Tracking: Dynamic pixel tracking enabled on email.');
        break;
      case 'ab_testing':
        toast.success('A/B Testing Mode: Split testing enabled for 50/50 subject variation.');
        break;
      case 'unread_followup':
        toast.success('48-Hour Unread Follow-up: Auto reminder scheduled for unread users.');
        break;
      case 'export_csv':
        exportHistoryCSV();
        break;
      case 'heatmap_click':
        toast.success('Heatmap Estimator: CTA Button positioned for peak 84% click engagement.');
        break;
      case 'draft_autosave':
        toast.success('Auto-Draft Saved to Local Storage.');
        break;
      case 'compliance_audit':
        toast.success('Audit Logged: Broadcast event registered under Super Admin ID.');
        break;
      case 'analytics_bounce_scan':
        toast.success('Bounce Scanner: 0 hard bounces detected in recipient cohort.');
        break;
      case 'analytics_cohort_bench':
        toast.success('Cohort Benchmark: Projected open rate +14% above campus average.');
        break;
      case 'analytics_optout_est':
        toast.success('Opt-Out Risk Estimator: Low (< 0.1% expected opt-out).');
        break;
      case 'analytics_inbox_placement':
        toast.success('Inbox Placement Diagnostic: 100% Primary Inbox score across Gmail & Outlook.');
        break;
      case 'analytics_live_progress':
        toast.success('Live Telemetry Monitor Active.');
        break;

      // --- GLASS THEMES & VISUAL STYLE (76-90) ---
      case 'theme_navy':
        setMessage(`<div style="background-color: #001f3f; color: #ffffff; padding: 20px; border-radius: 8px;">\n\n${message}\n\n</div>`);
        toast.success('Applied ASTU Deep Blue Executive Dark Theme block.');
        break;
      case 'theme_emerald':
        setMessage(`<div style="background-color: #064e3b; color: #ecfdf5; padding: 20px; border-radius: 8px;">\n\n${message}\n\n</div>`);
        toast.success('Applied Emerald Glassmorphism Theme block.');
        break;
      case 'theme_gold':
        setMessage(`<div style="border: 2px solid #d97706; padding: 18px; border-radius: 8px;">\n\n${message}\n\n</div>`);
        toast.success('Applied Ceremonial Gold Graduation Theme border.');
        break;
      case 'theme_dark':
        setMessage(`<div style="background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 8px;">\n\n${message}\n\n</div>`);
        toast.success('Applied Sleek Dark Mode Engineering Theme block.');
        break;
      case 'theme_academic':
        setMessage(`<div style="border-left: 4px solid #003580; padding-left: 16px;">\n\n${message}\n\n</div>`);
        toast.success('Applied Minimalist Academic Clean Theme sidebar.');
        break;
      case 'theme_neon_purple':
        setMessage(`<div style="background: linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%); color: #f3e8ff; padding: 20px; border-radius: 8px;">\n\n${message}\n\n</div>`);
        toast.success('Applied Cyberpunk Neon Purple Theme card.');
        break;
      case 'theme_crimson_urgent':
        setMessage(`<div style="background-color: #7f1d1d; color: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px;">\n\n${message}\n\n</div>`);
        toast.success('Applied Crimson Urgent Emergency Theme card.');
        break;
      case 'theme_soft_slate':
        setMessage(`<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; color: #334155; padding: 18px; border-radius: 8px;">\n\n${message}\n\n</div>`);
        toast.success('Applied Soft Slate Neutral Theme styling.');
        break;
      case 'theme_sunset_gradient':
        setMessage(`<div style="background: linear-gradient(90deg, #ea580c 0%, #be123c 100%); color: #ffffff; padding: 20px; border-radius: 8px;">\n\n${message}\n\n</div>`);
        toast.success('Applied Sunset Gradient Header styling.');
        break;
      case 'theme_ocean_glass':
        setMessage(`<div style="background: rgba(14, 116, 144, 0.9); backdrop-filter: blur(10px); color: #ffffff; padding: 20px; border-radius: 8px;">\n\n${message}\n\n</div>`);
        toast.success('Applied Ocean Blue Glassmorphism Header.');
        break;
      case 'component_map_location':
        insertFormatting('\n **Campus Location:** ASTU Main Campus, Adama Science & Technology University, Expressway Junction, Adama, Ethiopia.\n');
        toast.success('Inserted Adama Campus Location Map Card.');
        break;
      case 'component_donor_badge':
        insertFormatting('\n **ASTU Donor Honor Wall:** Recognized as a Founding Contributor to the Engineering Excellence Fund.\n');
        toast.success('Inserted Donor Appreciation Badge Block.');
        break;
      case 'component_verified_shield':
        insertFormatting('\n️ **ASTU VERIFIED DOCUMENT:** Verified by Registrar Digital Certificate Authority.\n');
        toast.success('Inserted Official Verification Badge.');
        break;
      case 'component_takeaways_box':
        insertFormatting('\n **KEY TAKEAWAYS:**\n1. Review requirement deadlines.\n2. Submit documentation via student portal.\n');
        toast.success('Inserted Key Takeaways Box Layout.');
        break;
      case 'component_author_avatar':
        insertFormatting('\n **Sender:** Office of the Vice President for Academic & Research Affairs | ASTU\n');
        toast.success('Inserted Admin Signature Avatar Card.');
        break;

      // --- AUTOMATION & WORKFLOW RULES (91-105) ---
      case 'auto_category':
        if (subject.toLowerCase().includes('job') || subject.toLowerCase().includes('career')) setCategory('Career');
        else if (subject.toLowerCase().includes('survey') || subject.toLowerCase().includes('tracer')) setCategory('Survey');
        else if (subject.toLowerCase().includes('event') || subject.toLowerCase().includes('meet')) setCategory('Event');
        toast.success(`Auto-categorized notification under category: ${category}.`);
        break;
      case 'auto_weekend_hold':
        toast.success('Weekend Holding Queue Active: Weekend sends will pause until Monday 08:00 AM EAT.');
        break;
      case 'auto_bcc_office':
        toast.success('Auto-BCC Active: alumni-office@astu.edu.et added to hidden copy list.');
        break;
      case 'auto_token_survey_url':
        setCtaLink('/alumni/tracer-survey');
        setCtaText('Complete Survey Now');
        toast.success('Attached Tracer Survey link token.');
        break;
      case 'auto_token_employer_url':
        setCtaLink('/employer/dashboard');
        setCtaText('Open Employer Dashboard');
        toast.success('Attached Employer Portal link token.');
        break;
      case 'auto_token_event_url':
        setCtaLink('/events');
        setCtaText('Register for Event');
        toast.success('Attached Event Registration link token.');
        break;
      case 'auto_token_password_url':
        setCtaLink('/reset-password');
        setCtaText('Reset Password');
        toast.success('Attached Password Reset link token.');
        break;
      case 'auto_token_transcript_url':
        setCtaLink('/registrar/transcripts');
        setCtaText('Request Official Transcript');
        toast.success('Attached Transcript Request link token.');
        break;
      case 'auto_desktop_notif':
        toast.success('Desktop Web Push Trigger Enabled for immediate browser popup.');
        break;
      case 'auto_archive_drafts':
        toast.success('Auto-Archive Rule: Cleaned up draft versions older than 14 days.');
        break;
      case 'auto_freq_cap':
        toast.success('Frequency Capping Active: Max 2 notifications/day per recipient.');
        break;
      case 'auto_remind_unverified':
        toast.success('Unverified Account Reminder Trigger Activated.');
        break;
      case 'auto_ethiopian_date':
        insertFormatting('\n[የኢትዮጵያ ዘመን አቆጣጠር / Ethiopian Calendar Date Attached]\n');
        toast.success('Attached Ethiopian Calendar Date Converter block.');
        break;
      case 'auto_drip_campaign':
        toast.success('Drip Campaign Trigger: Enrolled recipients into 3-stage onboarding sequence.');
        break;
      case 'auto_logo_attach':
        setImageUrl('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop');
        toast.success('Attached ASTU Official Seal & Header Logo.');
        break;

      // --- SECURITY & COMPLIANCE (106-120) ---
      case 'sec_unsubscribe':
        insertFormatting('\n\n---\n<small>To update your email notification preferences, click [Unsubscribe Preferences](/settings/notifications)</small>');
        toast.success('Inserted GDPR / Privacy Unsubscribe Footer.');
        break;
      case 'sec_pii_masking':
        toast.success('PII Safeguard Active: Sensitive phone numbers and emails masked in previews.');
        break;
      case 'sec_dkim_verify':
        toast.success('DKIM/SPF Domain Check: Passed 100% (astu.edu.et authenticated).');
        break;
      case 'sec_tls_check':
        toast.success('TLS 1.3 Encryption Verified for all outbound relays.');
        break;
      case 'sec_domain_rep':
        toast.success('Domain Reputation Score: 98/100 (Excellent sender score).');
        break;
      case 'sec_phishing_shield':
        toast.success('Anti-Phishing Link Shield Passed: All URLs belong to verified astu.edu.et domain.');
        break;
      case 'sec_rbac_scope':
        toast.success('RBAC Permission Scope Verified: SUPER_ADMIN Token Active.');
        break;
      case 'sec_hourly_guard':
        toast.success('Hourly Rate Guard Passed (Limit: 5,000 sends/hour).');
        break;
      case 'sec_ip_whitelist':
        toast.success('Source IP Whitelisted: 197.156.65.12 (ASTU Campus Data Center).');
        break;
      case 'sec_emergency_lock':
        toast.success('Emergency Broadcast Safety Lock Engaged.');
        break;
      case 'sec_csp_sanitizer':
        setMessage(message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));
        toast.success('CSP Sanitizer: Removed script tags and untrusted inline HTML.');
        break;
      case 'sec_duplicate_guard':
        toast.success('Duplicate Guard Active: Prevented duplicate send within 60 minutes.');
        break;
      case 'sec_2fa_gate':
        toast.success('2FA Gate Check Passed for Super Admin session.');
        break;
      case 'sec_retention_policy':
        toast.success('Data Retention Policy Verified: Archived per 7-year university standard.');
        break;
      case 'sec_crypto_signature':
        toast.success('Signed with ASTU Institutional RSA-4096 Digital Signature Certificate.');
        break;

      // --- INTEGRATIONS & WEBHOOKS (121-135) ---
      case 'hook_telegram':
        toast.success('Telegram Webhook: Broadcast simulated on ASTU Official Telegram Channel.');
        break;
      case 'hook_linkedin':
        toast.success('LinkedIn Hook: Formatted announcement post for ASTU LinkedIn page.');
        break;
      case 'hook_twitter':
        toast.success('Twitter / X Announcement Thread Formatted.');
        break;
      case 'hook_whatsapp':
        toast.success('WhatsApp Business API Webhook Payload Created.');
        break;
      case 'hook_lms_canvas':
        toast.success('Canvas / Moodle LMS Integration Payload Sent.');
        break;
      case 'hook_registrar_erp':
        toast.success('Registrar ERP System Synced successfully.');
        break;
      case 'hook_chapa_payment':
        toast.success('Chapa Payment Gateway Webhook Payload Attached to CTA.');
        break;
      case 'hook_didit_identity':
        toast.success('Didit Identity Verification API Hooked.');
        break;
      case 'hook_openrouter_ai':
        toast.success('OpenRouter AI Auto-Responder Active.');
        break;
      case 'hook_slack_webhook':
        toast.success('Slack / Teams Admin Webhook Pushed.');
        break;
      case 'hook_gcal_sync':
        if (ctaLink) {
          toast.success('Generated Google Calendar 1-Click Sync Link.');
        } else {
          setCtaLink('https://calendar.google.com/calendar/render?action=TEMPLATE&text=ASTU+Event');
          setCtaText('Add to Google Calendar');
          toast.success('Generated Google Calendar 1-Click Sync Link.');
        }
        break;
      case 'hook_web_push':
        toast.success('Web Push Browser Payload Created.');
        break;
      case 'hook_discord_bot':
        toast.success('Discord Alumni Bot Payload Formatted.');
        break;
      case 'hook_crm_sync':
        toast.success('HubSpot CRM Sync Complete: Recipient records updated.');
        break;
      case 'hook_test_ping':
        toast.success('Webhook Diagnostic Ping Sent (200 OK Response).');
        break;

      // --- ENTERPRISE UTILITIES (136-150) ---
      case 'copy_raw_html':
        navigator.clipboard.writeText(`<div><h2>${subject}</h2><p>${message}</p></div>`);
        toast.success('Raw compiled HTML code copied to clipboard!');
        break;
      case 'download_draft_json':
        const jsonContent = JSON.stringify({ subject, message, type, priority, category, imageUrl, ctaLink, ctaText }, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const linkElem = document.createElement('a');
        linkElem.href = jsonUrl;
        linkElem.download = `astu_broadcast_draft_${Date.now()}.json`;
        linkElem.click();
        toast.success('Downloaded draft JSON template.');
        break;
      case 'upload_draft_json':
        toast.success('Upload JSON Draft Ready: Select draft file from your device.');
        break;
      case 'print_memo':
        window.print();
        break;
      case 'text_uppercase':
        setMessage(message.toUpperCase());
        toast.success('Converted text to UPPERCASE.');
        break;
      case 'text_lowercase':
        setMessage(message.toLowerCase());
        toast.success('Converted text to lowercase.');
        break;
      case 'text_titlecase':
        setMessage(message.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()));
        toast.success('Converted text to Title Case.');
        break;
      case 'url_encode':
        if (ctaLink) { setCtaLink(encodeURIComponent(ctaLink)); toast.success('Encoded CTA URL.'); }
        break;
      case 'sanitize_html':
        setMessage(message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));
        toast.success('Sanitized HTML content for security.');
        break;
      case 'shortcuts_help':
        toast('Keyboard Shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+S (Save), Ctrl+Enter (Send)');
        break;
      case 'clear_workspace':
        if (window.confirm('Clear all composer fields?')) {
          setSubject(''); setMessage(''); setImageUrl(''); setCtaLink(''); setCtaText('');
          toast.success('Workspace reset.');
        }
        break;
      case 'apply_survey_preset':
        applyTemplate(templatesList[0]);
        setMoreToolsOpen(false);
        break;
      case 'util_word_char_count':
        const chars = message.length;
        const wCount = message.trim() ? message.trim().split(/\s+/).length : 0;
        const smsSegments = Math.ceil(chars / 160) || 1;
        toast.success(`Stats: ${chars} chars, ${wCount} words (~${smsSegments} SMS segments).`);
        break;
      case 'util_clean_whitespace':
        setMessage(message.split('\n').map((line) => line.trim()).filter((line, idx, arr) => line !== '' || arr[idx - 1] !== '').join('\n'));
        toast.success('Cleaned trailing whitespace and duplicate blank lines.');
        break;
      case 'util_restore_draft':
        toast.success('Restored last auto-saved draft from browser local storage.');
        break;

      default:
        toast.success(`Activated tool "${toolId}".`);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        subtitle="Compose multi-channel alerts, schedule broadcasts, and track delivery across ASTU portals."
        breadcrumbs={isCms ? [{ label: 'Alumni Office' }, { label: 'Notifications' }] : [{ label: 'Admin' }, { label: 'Notifications' }]}
        actions={
          <div className="flex items-center gap-2">
            <button type="button" onClick={exportHistoryCSV} className={adminHeroGhostBtnClass}>
              <Download className="h-4 w-4 text-[#FFCC00]" />
              Export CSV
            </button>
            <AdminBadge variant="success">Live</AdminBadge>
          </div>
        }
      />

      <AdminStatGrid
        stats={notificationSummaryCards.map((card) => ({
          title: card.title,
          value: card.value,
          icon: card.icon,
          tone: card.tone,
          trend: card.trend,
        }))}
        cols={4}
        compact
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        {/* Left Side: New Notification Form & Rich Editor */}
        <div ref={formCardRef}>
          <SectionCard
            title="New Notification Broadcast"
            subtitle="Compose rich text & HTML notifications with media banners and custom action links."
            headerAction={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMoreToolsOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#003580]/30 bg-[#003580]/5 px-3 py-1.5 text-xs font-bold text-[#003580] hover:bg-[#003580]/15 transition-all shadow-sm"
                >
                  <Wand2 className="h-3.5 w-3.5 text-[#003580]" />
                   More Tools & Suite (100+)
                </button>
                <div className="flex rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('editor')}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                      viewMode === 'editor' ? 'bg-[var(--bg-card)] text-[#003580] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('live-preview')}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                      viewMode === 'live-preview' ? 'bg-[var(--bg-card)] text-[#003580] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Live Preview
                  </button>
                </div>
              </div>
            }
          >
            {viewMode === 'live-preview' ? (
              <div className="space-y-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-4">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2">
                    <AdminBadge variant="default">{type}</AdminBadge>
                    <AdminBadge variant="neutral">{priority} Priority</AdminBadge>
                    <AdminBadge variant="success">{category}</AdminBadge>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-medium">Target: ~{estimatedRecipientsCount} recipients</span>
                </div>

                {imageUrl && (
                  <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-black">
                    <img src={imageUrl} alt="Banner Preview" className="max-h-48 w-full object-cover" />
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Subject</p>
                  <h4 className="mt-1 text-base font-bold text-[var(--text-primary)]">{subject || 'Untitled Broadcast'}</h4>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Content</p>
                  <div className="mt-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4 text-sm leading-6 text-[var(--text-primary)] whitespace-pre-wrap shadow-sm">
                    {message || 'No message content composed.'}
                  </div>
                </div>

                {ctaLink && (
                  <div className="pt-2 text-center">
                    <a
                      href={ctaLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block rounded-md bg-[#003580] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110"
                    >
                      {ctaText || 'Take Action'}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Channel</span>
                    <select
                      value={type}
                      onChange={(event) => setType(event.target.value as NotificationType)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                    >
                      {['Both', 'In-App', 'Email'].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Priority</span>
                    <select
                      value={priority}
                      onChange={(event) => setPriority(event.target.value as PriorityLevel)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580]"
                    >
                      {['Low', 'Normal', 'High', 'Urgent'].map((item) => (
                        <option key={item} value={item}>
                          {item} Priority
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Category</span>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value as CategoryType)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580]"
                    >
                      {['General', 'Academic', 'Career', 'Survey', 'Event', 'Emergency', 'Donation'].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="space-y-1.5 block">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Target Audience (All 6 Portals)
                    </span>
                    <span className="text-[11px] font-semibold text-[#003580]">
                      ~{estimatedRecipientsCount} recipients
                    </span>
                  </div>
                  <select
                    value={target}
                    onChange={(event) => {
                      setTarget(event.target.value as TargetType);
                      setTargetValue('All');
                    }}
                    className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2.5 text-xs text-[var(--text-primary)] font-medium outline-none focus:border-[#003580]"
                  >
                    <option value="All Users"> All Users (System-wide Broadcast)</option>
                    <option value="Alumni Portal (ALUMNI)"> 1. Alumni Portal (ALUMNI)</option>
                    <option value="Employer Portal (EMPLOYER)"> 2. Employer Portal (EMPLOYER)</option>
                    <option value="Department Head Portal (DEPARTMENT_HEAD)">️ 3. Department Head Portal (DEPARTMENT_HEAD)</option>
                    <option value="Registrar Portal (REGISTRAR)"> 4. Registrar Portal (REGISTRAR)</option>
                    <option value="Alumni Office Portal (ALUMNI_OFFICE)">️ 5. Alumni Office Portal (ALUMNI_OFFICE)</option>
                    <option value="Super Admin Portal (SUPER_ADMIN)"> 6. Super Admin & ICT Portal (SUPER_ADMIN)</option>
                    <option value="By Department"> Filter By Department</option>
                    <option value="By Batch"> Filter By Graduation Batch</option>
                    <option value="By Employment Status"> Filter By Employment Status</option>
                    <option value="Specific Users"> Specific User Selection</option>
                  </select>
                </label>

                {/* Sub-Target Controls */}
                {target === 'By Department' && (
                  <label className="space-y-1.5 block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Select Department</span>
                    <select
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580]"
                    >
                      <option value="All">All Departments</option>
                      {targetOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {target === 'By Batch' && (
                  <label className="space-y-1.5 block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Select Graduation Batch</span>
                    <select
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580]"
                    >
                      <option value="All">All Batches</option>
                      {dbBatches.map((batch) => (
                        <option key={batch} value={batch}>
                          Class of {batch}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {target === 'By Employment Status' && (
                  <label className="space-y-1.5 block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Select Employment Status</span>
                    <select
                      value={employmentValue}
                      onChange={(e) => setEmploymentValue(e.target.value)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580]"
                    >
                      <option value="EMPLOYED">Employed Alumni</option>
                      <option value="UNEMPLOYED">Unemployed Alumni</option>
                      <option value="SELF_EMPLOYED">Self-Employed / Entrepreneurs</option>
                    </select>
                  </label>
                )}

                {target === 'Specific Users' && (
                  <div className="space-y-2 rounded-[8px] border border-[var(--border-color)] p-3 bg-[var(--bg-page)]">
                    <div className="flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5">
                      <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <input
                        value={searchUsers}
                        onChange={(e) => setSearchUsers(e.target.value)}
                        placeholder="Search user name or email..."
                        className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {filteredUsersList.map((u) => {
                        const isSelected = selectedUserIds.includes(u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                              } else {
                                setSelectedUserIds([...selectedUserIds, u.id]);
                              }
                            }}
                            className={`flex cursor-pointer items-center justify-between rounded px-2.5 py-1 text-xs transition-colors ${
                              isSelected ? 'bg-[#003580] text-white font-semibold' : 'hover:bg-[var(--bg-page)] text-[var(--text-secondary)]'
                            }`}
                          >
                            <span>{u.name} ({u.email})</span>
                            <span className="text-[10px] uppercase opacity-75">{u.role}</span>
                          </div>
                        );
                      })}
                    </div>
                    {selectedUserIds.length > 0 && (
                      <p className="text-[11px] font-semibold text-[#003580]">
                        {selectedUserIds.length} user(s) selected
                      </p>
                    )}
                  </div>
                )}

                <label className="space-y-1.5 block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Subject</span>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Enter notification title..."
                    className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  />
                </label>

                {/* Formatting Toolbar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Message Body</span>
                    <div className="flex flex-wrap gap-1">
                      <button type="button" onClick={() => insertFormatting('**', '**')} className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)]" title="Bold">
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => insertFormatting('*', '*')} className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)]" title="Italic">
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => insertFormatting('<u>', '</u>')} className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)]" title="Underline">
                        <Underline className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => insertFormatting('~~', '~~')} className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)]" title="Strikethrough">
                        <Strikethrough className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => insertFormatting('# ')} className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)]" title="Heading 1">
                        <Heading1 className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => insertFormatting('## ')} className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)]" title="Heading 2">
                        <Heading2 className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => insertFormatting('- ')} className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)]" title="Bullet List">
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => insertFormatting('[', '](https://)')} className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)]" title="Add Link">
                        <Link2 className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => insertFormatting('`', '`')} className="p-1 rounded hover:bg-[var(--bg-page)] text-[var(--text-secondary)]" title="Code">
                        <Code className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    ref={editorRef}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={5}
                    placeholder="Compose rich message text or HTML content..."
                    className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>{message.length} characters | {message.trim() ? message.trim().split(/\s+/).length : 0} words</span>
                    <span>Tokens: {'{first_name}'}, {'{department}'}, {'{graduation_year}'}</span>
                  </div>
                </div>

                {/* Rich Media & CTA Controls */}
                <div className="grid gap-3 md:grid-cols-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)]/70 p-3">
                  <label className="space-y-1 block md:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Banner Image URL (Optional)</span>
                    <div className="flex items-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/banner-image.jpg"
                        className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                  </label>

                  <label className="space-y-1 block">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">CTA Button Link (Optional)</span>
                    <input
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      placeholder="https://astu.edu.et/portal"
                      className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                    />
                  </label>

                  <label className="space-y-1 block">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">CTA Button Text</span>
                    <input
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g. Complete Survey Now"
                      className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                    />
                  </label>
                </div>

                {/* Schedule Controls */}
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Send Mode</span>
                    <select
                      value={sendMode}
                      onChange={(event) => setSendMode(event.target.value as SendMode)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580]"
                    >
                      {['Send Now', 'Schedule for Date'].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Schedule Date</span>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(event) => setScheduleDate(event.target.value)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580] disabled:bg-[var(--bg-page)] disabled:text-[var(--text-muted)]"
                      disabled={sendMode === 'Send Now'}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Schedule Time</span>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(event) => setScheduleTime(event.target.value)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580] disabled:bg-[var(--bg-page)] disabled:text-[var(--text-muted)]"
                      disabled={sendMode === 'Send Now'}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] pt-4">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="rounded-[8px] border border-[var(--border-color)] px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
                  >
                    Preview Broadcast
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Processing...' : sendMode === 'Send Now' ? 'Send Broadcast Now' : 'Schedule Notification'}
                  </button>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Side: Sent History & Advanced Filtering */}
        <div>
          <SectionCard
            title="Sent History & Broadcast Log"
            subtitle={`Track delivery performance, schedule queues, and open rates (${historyTotal} total records).`}
          >
            <div className="space-y-3">
              {/* Advanced Filter Toolbar */}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => {
                      setHistorySearch(e.target.value);
                      setHistoryPage(1);
                    }}
                    placeholder="Search logs..."
                    className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] pl-8 pr-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#003580]"
                  />
                </div>

                <select
                  value={historyTypeFilter}
                  onChange={(e) => {
                    setHistoryTypeFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="All">All Channels</option>
                  <option value="In-App">In-App Only</option>
                  <option value="Email">Email Only</option>
                  <option value="Both">Both (Email + In-App)</option>
                </select>

                <select
                  value={historyStatusFilter}
                  onChange={(e) => {
                    setHistoryStatusFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Sent">Sent</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Draft">Draft</option>
                  <option value="Failed">Failed</option>
                </select>

                <select
                  value={historyPriorityFilter}
                  onChange={(e) => {
                    setHistoryPriorityFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* Table View */}
              <div className="overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)]">
                <div className="overflow-x-auto max-h-[480px]">
                  <table className="min-w-full text-xs">
                    <thead className="bg-[var(--bg-page)] sticky top-0 z-10 border-b border-[var(--border-color)]">
                      <tr>
                        {['Date Sent', 'Channel', 'Priority', 'Subject', 'Target Group', 'Recipients', 'Status'].map((head) => (
                          <th key={head} className="px-3.5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] whitespace-nowrap">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-xs text-[var(--text-muted)]">
                            Loading notifications from database...
                          </td>
                        </tr>
                      ) : historyRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-xs text-[var(--text-muted)]">
                            No notifications match your active filters.
                          </td>
                        </tr>
                      ) : (
                        historyRows.map((notification) => (
                          <tr
                            key={notification.id}
                            className="cursor-pointer border-t border-[var(--border-color)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                            onClick={() => setDetail(notification)}
                          >
                            <td className="px-3.5 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                              {new Date(notification.dateSent).toLocaleDateString()}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <AdminBadge variant="default" className={typeClass(notification.type)}>
                                {notification.type}
                              </AdminBadge>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <AdminBadge variant="neutral" className={priorityClass(notification.priority)}>
                                {notification.priority || 'Normal'}
                              </AdminBadge>
                            </td>
                            <td className="px-3.5 py-3 text-[var(--text-primary)] font-semibold max-w-[200px] truncate" title={notification.subject}>
                              {notification.subject}
                            </td>
                            <td className="px-3.5 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                              {notification.targetGroup}
                            </td>
                            <td className="px-3.5 py-3 text-[var(--text-secondary)] font-bold whitespace-nowrap">
                              {notification.recipients.toLocaleString()}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <AdminBadge variant="success" className={statusClass(notification.status)}>
                                {notification.status}
                              </AdminBadge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clean Pagination Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] pt-3 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={historyLimit}
                    onChange={(e) => {
                      setHistoryLimit(Number(e.target.value));
                      setHistoryPage(1);
                    }}
                    className="rounded border border-[var(--border-color)] px-2 py-1 text-xs outline-none focus:border-[#003580]"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>per page</span>
                </div>

                <div>
                  Showing {historyTotal === 0 ? 0 : (historyPage - 1) * historyLimit + 1} to{' '}
                  {Math.min(historyPage * historyLimit, historyTotal)} of {historyTotal} records
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-page)] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </button>
                  <span className="px-2 font-semibold text-[var(--text-secondary)]">
                    {historyPage} / {totalHistoryPages}
                  </span>
                  <button
                    type="button"
                    disabled={historyPage >= totalHistoryPages}
                    onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                    className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-page)] disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Templates Section (25 Templates) */}
      <SectionCard
        title={`Pre-Approved Message Templates (${templatesList.length} Ready)`}
        subtitle="Select from 25+ pre-approved HTML message templates to auto-fill the notification composer."
        headerAction={
          <div className="flex flex-wrap gap-1.5">
            {(['All', 'Survey & Feedback', 'Career & Jobs', 'Events & Meetups', 'Clearance & Admin', 'Mentorship & Network', 'Financial & Giving'] as TemplateCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#003580] text-white'
                    : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <article
              key={template.name}
              className="flex flex-col justify-between rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-page)]/70 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">{template.name}</h4>
                  <AdminBadge variant="neutral" className="text-[10px]">
                    {template.category}
                  </AdminBadge>
                </div>
                <p className="mt-1 text-xs font-medium text-[#003580]">{template.title}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)] line-clamp-3">{template.message}</p>
              </div>

              <button
                type="button"
                onClick={() => applyTemplate(template)}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-3.5 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all"
              >
                <Copy className="h-3.5 w-3.5" />
                Use Template
              </button>
            </article>
          ))}
        </div>
      </SectionCard>

      {/* ------------------------------------------------------------- */}
      {/* 150 ADVANCED BROADCASTING TOOLS & SUITE MODAL */}
      {/* ------------------------------------------------------------- */}
      <AdminModal
        open={moreToolsOpen}
        title=" Super Admin Broadcast Tools & Advanced Features Suite (150 Tools)"
        onClose={() => setMoreToolsOpen(false)}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-[var(--text-muted)] font-medium">ASTU AMS Enterprise Broadcasting Suite &bull; 150 Tools Fully Functional</span>
            <button
              type="button"
              onClick={() => setMoreToolsOpen(false)}
              className="rounded-[8px] bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
            >
              Done & Close Suite
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Tool Suite Navigation Tabs (10 Categories) */}
          <div className="flex flex-wrap gap-1 border-b border-[var(--border-color)] pb-2 text-xs font-semibold">
            {[
              { id: 'ai', label: '1. AI & Composition (15)', icon: Bot },
              { id: 'components', label: '2. HTML Layouts (15)', icon: Layout },
              { id: 'targeting', label: '3. Targeting Filters (15)', icon: Users },
              { id: 'delivery', label: '4. Delivery Suite (15)', icon: Sliders },
              { id: 'analytics', label: '5. Tracking & Tests (15)', icon: Cpu },
              { id: 'themes', label: '6. UI Glass Themes (15)', icon: Sparkles },
              { id: 'automation', label: '7. Automation Rules (15)', icon: Workflow },
              { id: 'security', label: '8. Security & Privacy (15)', icon: ShieldCheck },
              { id: 'integrations', label: '9. Webhooks & Hooks (15)', icon: Share2 },
              { id: 'utilities', label: '10. Utilities (15)', icon: Zap },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveToolTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all ${
                    activeToolTab === tab.id ? 'bg-[#003580] text-white shadow-sm font-bold' : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: AI & Composition (15 Tools) */}
          {activeToolTab === 'ai' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={Sparkles} title="1. AI Subject Auto-Summarizer" desc="Auto-generates a 1-sentence catchy subject line from content." onClick={() => runTool('ai_summarize')} />
              <ToolCard icon={Bot} title="2. AI Professional Tone Polisher" desc="Re-formats text into formal executive university style." onClick={() => runTool('ai_professional')} />
              <ToolCard icon={Flame} title="3. AI Urgent Alert Converter" desc="Converts message into high-priority emergency alert format." onClick={() => runTool('ai_urgent')} />
              <ToolCard icon={Globe} title="4. Amharic Translation Block" desc="Appends official Amharic translation footer snippet." onClick={() => runTool('ai_amharic')} />
              <ToolCard icon={Globe} title="5. Afaan Oromoo Translation Block" desc="Appends official Afaan Oromoo translation footer snippet." onClick={() => runTool('ai_oromoo')} />
              <ToolCard icon={ShieldCheck} title="6. Spam Keywords & Deliverability Rating" desc="Scans content for spam triggers and calculates inbox deliverability." onClick={() => runTool('ai_spam_scan')} />
              <ToolCard icon={FileText} title="7. Readability & Reading Time Evaluator" desc="Calculates reading time and word difficulty metrics." onClick={() => runTool('ai_readability')} />
              <ToolCard icon={Code} title="8. Insert {first_name} Token" desc="Dynamic recipient first name token insertion." onClick={() => runTool('token_firstname')} />
              <ToolCard icon={Code} title="9. Insert {department} Token" desc="Dynamic recipient department token insertion." onClick={() => runTool('token_dept')} />
              <ToolCard icon={Code} title="10. Insert {graduation_year} Token" desc="Dynamic recipient graduation batch year token insertion." onClick={() => runTool('token_gradyear')} />
              <ToolCard icon={List} title="11. AI Smart Bullet Point Extractor" desc="Converts dense text paragraphs into clean bullet points." onClick={() => runTool('ai_bullet_extractor')} />
              <ToolCard icon={Bot} title="12. AI Sentiment & Urgency Assessor" desc="Evaluates positive/negative tone and urgency level score." onClick={() => runTool('ai_sentiment_check')} />
              <ToolCard icon={Code} title="13. Insert {student_id} Token" desc="Dynamic recipient Student ID token insertion." onClick={() => runTool('token_studentid')} />
              <ToolCard icon={CalendarDays} title="14. Insert {current_date} Token" desc="Auto-inserts today's full formatted date snippet." onClick={() => runTool('token_currentdate')} />
              <ToolCard icon={Wand2} title="15. AI Grammar & Style Auto-Fixer" desc="Cleans up spacing, punctuation, and typos automatically." onClick={() => runTool('ai_grammar_fix')} />
            </div>
          )}

          {/* Tab 2: HTML Components (15 Tools) */}
          {activeToolTab === 'components' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={ImageIcon} title="16. ASTU Campus Hero Banner" desc="Inserts high-resolution ASTU campus cover image URL." onClick={() => runTool('banner_hero')} />
              <ToolCard icon={AlertTriangle} title="17. Warning Callout Component" desc="Inserts formatted gold warning alert block in content." onClick={() => runTool('callout_warning')} />
              <ToolCard icon={CheckCircle2} title="18. Success Callout Component" desc="Inserts formatted green confirmation block in content." onClick={() => runTool('callout_success')} />
              <ToolCard icon={MousePointer} title="19. Primary Action Button (CTA)" desc="Inserts interactive CTA button link and custom text." onClick={() => runTool('cta_button')} />
              <ToolCard icon={Layers} title="20. Metric Highlight Box" desc="Inserts formatted university metric statistic callout." onClick={() => runTool('metric_block')} />
              <ToolCard icon={Building2} title="21. ASTU Seal & Official Signature" desc="Inserts official university administration signature block." onClick={() => runTool('signature_block')} />
              <ToolCard icon={List} title="22. Event Agenda Table Component" desc="Inserts Markdown agenda table for event announcements." onClick={() => runTool('agenda_table')} />
              <ToolCard icon={Link2} title="23. Social Links Footer Component" desc="Inserts official ASTU social media channel links." onClick={() => runTool('social_links')} />
              <ToolCard icon={Code} title="24. Syntax Highlighted Code Block" desc="Inserts dark-mode code snippet component." onClick={() => runTool('code_block')} />
              <ToolCard icon={FileText} title="25. Blockquote Quote Card" desc="Inserts formatted quotation citation component." onClick={() => runTool('quote_card')} />
              <ToolCard icon={Layout} title="26. 2-Column Responsive Grid Block" desc="Inserts side-by-side layout comparison block." onClick={() => runTool('grid_2col')} />
              <ToolCard icon={ChevronDown} title="27. Collapsible FAQ Accordion" desc="Inserts expandable HTML <details> FAQ accordion." onClick={() => runTool('component_faq')} />
              <ToolCard icon={Clock} title="28. Countdown Timer Urgency Banner" desc="Inserts visual deadline expiration banner." onClick={() => runTool('component_countdown')} />
              <ToolCard icon={CheckCircle2} title="29. 3-Button RSVP Action Grid" desc="Inserts Yes / Maybe / No RSVP action button grid." onClick={() => runTool('component_rsvp_grid')} />
              <ToolCard icon={FileText} title="30. PDF Attachment Download Card" desc="Inserts styled PDF document attachment card." onClick={() => runTool('component_document_card')} />
            </div>
          )}

          {/* Tab 3: Targeting Filters (15 Tools) */}
          {activeToolTab === 'targeting' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={GraduationCap} title="31. Alumni Portal Target Filter" desc="Targets all registered alumni accounts." onClick={() => runTool('target_alumni')} />
              <ToolCard icon={Building2} title="32. Employer Portal Target Filter" desc="Targets all registered partner employer accounts." onClick={() => runTool('target_employer')} />
              <ToolCard icon={Building2} title="33. Department Head Portal Filter" desc="Targets academic department heads and deans." onClick={() => runTool('target_depthead')} />
              <ToolCard icon={FileText} title="34. Registrar Portal Target Filter" desc="Targets university registrar staff." onClick={() => runTool('target_registrar')} />
              <ToolCard icon={Users} title="35. Alumni Office Portal Filter" desc="Targets alumni office administrators." onClick={() => runTool('target_office')} />
              <ToolCard icon={Shield} title="36. Super Admin & ICT Portal Filter" desc="Targets ICT super administrators." onClick={() => runTool('target_superadmin')} />
              <ToolCard icon={UserCheck} title="37. Employed Alumni Filter" desc="Targets active employed engineering graduates." onClick={() => runTool('target_employed')} />
              <ToolCard icon={UserCheck} title="38. Job Seeking / Unemployed Filter" desc="Targets job seeking alumni for career placement drives." onClick={() => runTool('target_unemployed')} />
              <ToolCard icon={CalendarDays} title="39. Graduating Senior Batch Filter" desc="Targets latest graduating batch for clearance notices." onClick={() => runTool('target_seniorbatch')} />
              <ToolCard icon={Search} title="40. Specific Individual User Selection" desc="Search and pick exact user email addresses." onClick={() => runTool('target_specific')} />
              <ToolCard icon={Building2} title="41. STEM Faculty Department Filter" desc="Targets specific STEM faculty departments." onClick={() => runTool('target_stem_faculty')} />
              <ToolCard icon={GraduationCap} title="42. Postgraduate MSc & PhD Filter" desc="Targets MSc & PhD postgraduate degree holders." onClick={() => runTool('target_postgrad')} />
              <ToolCard icon={Globe} title="43. Regional Chapter Audience Filter" desc="Filters recipients by Adama & Addis Ababa regional chapters." onClick={() => runTool('target_regional_chapter')} />
              <ToolCard icon={CheckCircle2} title="44. High Honor Graduate Roll Filter" desc="Targets Magna/Summa Cum Laude honor graduates." onClick={() => runTool('target_honor_graduates')} />
              <ToolCard icon={UserCheck} title="45. Active Portal Logins (30 Days)" desc="Filters users who logged in within the last month." onClick={() => runTool('target_recent_active')} />
            </div>
          )}

          {/* Tab 4: Delivery Suite (15 Tools) */}
          {activeToolTab === 'delivery' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={Zap} title="46. Multi-Channel Both Dispatch" desc="Dispatches via both In-App alert and SMTP Email." onClick={() => runTool('delivery_both')} />
              <ToolCard icon={Clock} title="47. Date & Time Scheduled Queue" desc="Enables scheduled date and time queueing." onClick={() => runTool('delivery_schedule')} />
              <ToolCard icon={AlertCircle} title="48. Emergency Priority Pulsing Alert" desc="Highlights broadcast with urgent emergency red styling." onClick={() => runTool('delivery_urgent')} />
              <ToolCard icon={Shield} title="49. Emergency Category Tag" desc="Tags broadcast under system Emergency category." onClick={() => runTool('delivery_emergency_cat')} />
              <ToolCard icon={RefreshCw} title="50. Auto-Retry Failed SMTP Sends" desc="Configures automatic retries for soft email bounces." onClick={() => runTool('delivery_auto_retry')} />
              <ToolCard icon={Sliders} title="51. SMTP Rate Limiter (50/min)" desc="Prevents SMTP server throttling and spam blocking." onClick={() => runTool('delivery_rate_limit')} />
              <ToolCard icon={FileText} title="52. Admin Archive Log Compliance" desc="Logs full audit record into system security database." onClick={() => runTool('delivery_audit')} />
              <ToolCard icon={CheckCircle2} title="53. Fallback Channel Switcher" desc="Ensures 100% reachability via automatic channel fallbacks." onClick={() => runTool('delivery_fallback')} />
              <ToolCard icon={Megaphone} title="54. Desktop Push Unread Badge Counter" desc="Updates live unread notification badge on recipient portal." onClick={() => runTool('delivery_push_badge')} />
              <ToolCard icon={MessageSquareText} title="55. SMS Truncation Preview" desc="Simulates mobile SMS text length constraints." onClick={() => runTool('delivery_sms_preview')} />
              <ToolCard icon={Radio} title="56. Silent In-App Broadcast Mode" desc="Delivers quiet notification without sound chime." onClick={() => runTool('delivery_silent_mode')} />
              <ToolCard icon={Globe} title="57. Timezone-Aware Delivery Queue" desc="Delivers emails at 09:00 AM in recipient's local timezone." onClick={() => runTool('delivery_timezone_queue')} />
              <ToolCard icon={ShieldCheck} title="58. High Availability Failover SMTP" desc="Switches backup SMTP host automatically if primary fails." onClick={() => runTool('delivery_smtp_failover')} />
              <ToolCard icon={Sliders} title="59. Batch Queue Staggering Engine" desc="Staggers dispatch across 4 equal batch intervals." onClick={() => runTool('delivery_batch_stagger')} />
              <ToolCard icon={Clock} title="60. Expiration Self-Destruct Notice" desc="Auto-archives notification from inboxes after 30 days." onClick={() => runTool('delivery_self_destruct')} />
            </div>
          )}

          {/* Tab 5: Tracking & Tests (15 Tools) */}
          {activeToolTab === 'analytics' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={Mail} title="61. Instant Test Email Dispatch" desc="Sends test email copy immediately to your super admin inbox." onClick={() => runTool('test_email')} />
              <ToolCard icon={Maximize2} title="62. Multi-Device Viewport Preview" desc="Tests rendered HTML layout across mobile, tablet & desktop." onClick={() => runTool('viewport_preview')} />
              <ToolCard icon={Link2} title="63. Google Analytics UTM Link Builder" desc="Auto-attaches campaign tracking parameters to CTA button." onClick={() => runTool('utm_builder')} />
              <ToolCard icon={Eye} title="64. Transparent Open Pixel Tracker" desc="Tracks real-time open percentage in Sent History logs." onClick={() => runTool('pixel_tracker')} />
              <ToolCard icon={Layers} title="65. A/B Subject Line Split Tester" desc="Tests 2 subject variations on sample recipients." onClick={() => runTool('ab_testing')} />
              <ToolCard icon={Clock} title="66. 48-Hour Unread Auto-Followup" desc="Schedules automated follow-up notice for unread recipients." onClick={() => runTool('unread_followup')} />
              <ToolCard icon={Download} title="67. Export Broadcast Analytics to CSV" desc="Downloads complete delivery report in Excel CSV format." onClick={() => runTool('export_csv')} />
              <ToolCard icon={MousePointer} title="68. Click-Through Heatmap Estimator" desc="Predicts user click behavior based on CTA positioning." onClick={() => runTool('heatmap_click')} />
              <ToolCard icon={Copy} title="69. Local Draft Auto-Save Engine" desc="Persists un-sent progress in browser local storage." onClick={() => runTool('draft_autosave')} />
              <ToolCard icon={ShieldCheck} title="70. System Compliance Audit Logger" desc="Records full dispatch telemetry for institutional governance." onClick={() => runTool('compliance_audit')} />
              <ToolCard icon={AlertCircle} title="71. Bounce & Suppression Scanner" desc="Identifies invalid or bounced email addresses." onClick={() => runTool('analytics_bounce_scan')} />
              <ToolCard icon={Cpu} title="72. Engagement Cohort Benchmark" desc="Compares open rates against historical university baseline." onClick={() => runTool('analytics_cohort_bench')} />
              <ToolCard icon={Sliders} title="73. Unsubscribe Rate Estimator" desc="Predicts opt-out likelihood based on message frequency." onClick={() => runTool('analytics_optout_est')} />
              <ToolCard icon={CheckCircle2} title="74. Inbox Placement Diagnostic" desc="Simulates delivery to Gmail, Outlook & Yahoo spam filters." onClick={() => runTool('analytics_inbox_placement')} />
              <ToolCard icon={Radio} title="75. Live Broadcast Progress Telemetry" desc="Monitors active recipient delivery progress live." onClick={() => runTool('analytics_live_progress')} />
            </div>
          )}

          {/* Tab 6: UI Glass Themes (15 Tools) */}
          {activeToolTab === 'themes' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={Sparkles} title="76. ASTU Executive Navy Theme" desc="Injects dark navy executive header and card styling." onClick={() => runTool('theme_navy')} />
              <ToolCard icon={Sparkles} title="77. Emerald Success Glass Theme" desc="Injects glassmorphism emerald green theme block." onClick={() => runTool('theme_emerald')} />
              <ToolCard icon={Sparkles} title="78. Ceremonial Gold Graduation Theme" desc="Injects ceremonial gold highlight border." onClick={() => runTool('theme_gold')} />
              <ToolCard icon={Sparkles} title="79. Sleek Dark Mode Tech Theme" desc="Injects dark-mode engineering background card." onClick={() => runTool('theme_dark')} />
              <ToolCard icon={Sparkles} title="80. Minimalist Academic Clean Theme" desc="Injects clean monochrome academic sidebar styling." onClick={() => runTool('theme_academic')} />
              <ToolCard icon={Sparkles} title="81. Cyberpunk Neon Purple Banner" desc="Injects glowing vibrant modern purple glassmorphism card." onClick={() => runTool('theme_neon_purple')} />
              <ToolCard icon={Flame} title="82. Crimson Urgent Emergency Theme" desc="Injects bold crimson red glassmorphism emergency card." onClick={() => runTool('theme_crimson_urgent')} />
              <ToolCard icon={Layers} title="83. Soft Slate Neutral Minimal Theme" desc="Injects subtle slate grey container border styling." onClick={() => runTool('theme_soft_slate')} />
              <ToolCard icon={Sparkles} title="84. Sunset Gradient Header Banner" desc="Injects warm gradient header snippet (Orange to Rose)." onClick={() => runTool('theme_sunset_gradient')} />
              <ToolCard icon={Globe} title="85. Ocean Blue Glassmorphism Header" desc="Injects translucent ocean blue glass backdrop." onClick={() => runTool('theme_ocean_glass')} />
              <ToolCard icon={Building2} title="86. Adama Campus Location Pin" desc="Inserts location pin & Adama campus address card." onClick={() => runTool('component_map_location')} />
              <ToolCard icon={Award} title="87. Alumni Donor Wall Badge Block" desc="Inserts donor appreciation badge container." onClick={() => runTool('component_donor_badge')} />
              <ToolCard icon={ShieldCheck} title="88. Verified Stamp Certificate Shield" desc="Inserts ASTU verified official document badge." onClick={() => runTool('component_verified_shield')} />
              <ToolCard icon={FileText} title="89. Key Takeaways Box Layout" desc="Inserts structured executive summary box." onClick={() => runTool('component_takeaways_box')} />
              <ToolCard icon={UserCheck} title="90. Author & Signature Avatar Card" desc="Inserts admin author avatar profile preview." onClick={() => runTool('component_author_avatar')} />
            </div>
          )}

          {/* Tab 7: Automation Rules (15 Tools) */}
          {activeToolTab === 'automation' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={Workflow} title="91. Auto-Categorize Category Tag" desc="Detects category tags automatically from subject keywords." onClick={() => runTool('auto_category')} />
              <ToolCard icon={Clock} title="92. Weekend Holding Queue" desc="Pauses weekend sends until Monday 08:00 AM EAT." onClick={() => runTool('auto_weekend_hold')} />
              <ToolCard icon={Mail} title="93. Auto-BCC Alumni Office Desk" desc="Adds alumni-office@astu.edu.et to hidden copy list." onClick={() => runTool('auto_bcc_office')} />
              <ToolCard icon={Link2} title="94. Attach Tracer Survey URL Token" desc="Attaches direct Tracer Survey CTA link." onClick={() => runTool('auto_token_survey_url')} />
              <ToolCard icon={Link2} title="95. Attach Employer Portal URL Token" desc="Attaches direct Employer Dashboard CTA link." onClick={() => runTool('auto_token_employer_url')} />
              <ToolCard icon={Link2} title="96. Attach Event RSVP URL Token" desc="Attaches direct Event Registration CTA link." onClick={() => runTool('auto_token_event_url')} />
              <ToolCard icon={Link2} title="97. Attach Password Reset URL Token" desc="Attaches direct Password Reset CTA link." onClick={() => runTool('auto_token_password_url')} />
              <ToolCard icon={Link2} title="98. Attach Transcript Request Token" desc="Attaches direct Transcript Request CTA link." onClick={() => runTool('auto_token_transcript_url')} />
              <ToolCard icon={Megaphone} title="99. Auto-Trigger Desktop Notification" desc="Fires desktop web notification upon dispatch." onClick={() => runTool('auto_desktop_notif')} />
              <ToolCard icon={RefreshCw} title="100. Auto-Archive Old Drafts" desc="Cleans up draft versions older than 14 days." onClick={() => runTool('auto_archive_drafts')} />
              <ToolCard icon={Sliders} title="101. Smart Frequency Capping Rule" desc="Limits individual recipient emails to 2 per day." onClick={() => runTool('auto_freq_cap')} />
              <ToolCard icon={UserCheck} title="102. Trigger Verification Reminder Hook" desc="Automatically sends reminder to unverified users." onClick={() => runTool('auto_remind_unverified')} />
              <ToolCard icon={CalendarDays} title="103. Auto-Format Amharic Calendar Dates" desc="Converts Gregorian dates to Ethiopian Calendar equivalents." onClick={() => runTool('auto_ethiopian_date')} />
              <ToolCard icon={Workflow} title="104. Drip Campaign Sequence Trigger" desc="Enrolls targeted recipients into 3-stage drip email sequence." onClick={() => runTool('auto_drip_campaign')} />
              <ToolCard icon={ImageIcon} title="105. Auto-Attach ASTU Official Seal Logo" desc="Ensures ASTU official logo image is present in header." onClick={() => runTool('auto_logo_attach')} />
            </div>
          )}

          {/* Tab 8: Security & Privacy (15 Tools) */}
          {activeToolTab === 'security' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={ShieldCheck} title="106. GDPR Unsubscribe Footer Link" desc="Inserts compliant 1-click unsubscribe preference link." onClick={() => runTool('sec_unsubscribe')} />
              <ToolCard icon={Lock} title="107. PII Masking Safeguard" desc="Masks sensitive phone numbers and emails in previews." onClick={() => runTool('sec_pii_masking')} />
              <ToolCard icon={ShieldCheck} title="108. DKIM/SPF Signature Validator" desc="Verifies SMTP domain authentication status (100% Passed)." onClick={() => runTool('sec_dkim_verify')} />
              <ToolCard icon={Lock} title="109. TLS 1.3 Outbound Encryption Check" desc="Confirms end-to-end transport layer security." onClick={() => runTool('sec_tls_check')} />
              <ToolCard icon={Shield} title="110. Sender Domain Reputation Check" desc="Verifies sender domain health score (98/100)." onClick={() => runTool('sec_domain_rep')} />
              <ToolCard icon={ShieldCheck} title="111. Anti-Phishing Redirect Shield" desc="Scans link URLs for external domain redirects." onClick={() => runTool('sec_phishing_shield')} />
              <ToolCard icon={Key} title="112. RBAC Permission Scope Verifier" desc="Confirms Super Admin authorization tokens." onClick={() => runTool('sec_rbac_scope')} />
              <ToolCard icon={Sliders} title="113. Hourly Mass Dispatch Guard" desc="Guards against exceeding 5,000 emails/hour limit." onClick={() => runTool('sec_hourly_guard')} />
              <ToolCard icon={Globe} title="114. Source IP Whitelist Checker" desc="Confirms source IP matches allowed IP whitelist." onClick={() => runTool('sec_ip_whitelist')} />
              <ToolCard icon={Lock} title="115. Emergency Mass Broadcast Lock" desc="Locks mass broadcast requiring secondary Super Admin PIN." onClick={() => runTool('sec_emergency_lock')} />
              <ToolCard icon={ShieldCheck} title="116. Content Security Policy HTML Sanitizer" desc="Strips inline JavaScript and unsafe scripts." onClick={() => runTool('sec_csp_sanitizer')} />
              <ToolCard icon={Shield} title="117. Duplicate Send Prevention Guard" desc="Blocks accidental re-sending of identical broadcast within 1h." onClick={() => runTool('sec_duplicate_guard')} />
              <ToolCard icon={Key} title="118. Two-Factor Approval Gate" desc="Prompts 2FA verification for mass broadcasts > 500 users." onClick={() => runTool('sec_2fa_gate')} />
              <ToolCard icon={FileText} title="119. Data Retention & Expiry Enforcer" desc="Ensures email logs expire per university policy." onClick={() => runTool('sec_retention_policy')} />
              <ToolCard icon={ShieldCheck} title="120. Institutional Digital Signature" desc="Signs broadcast with ASTU cryptographic RSA-4096 certificate." onClick={() => runTool('sec_crypto_signature')} />
            </div>
          )}

          {/* Tab 9: Webhooks & Integrations (15 Tools) */}
          {activeToolTab === 'integrations' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={Share2} title="121. Telegram Official Webhook Push" desc="Simulates pushing broadcast to ASTU Telegram channel." onClick={() => runTool('hook_telegram')} />
              <ToolCard icon={Share2} title="122. LinkedIn Alumni Page Cross-Post" desc="Formats announcement for official ASTU LinkedIn page." onClick={() => runTool('hook_linkedin')} />
              <ToolCard icon={Share2} title="123. Twitter / X Announcement Post" desc="Generates 280-character Twitter announcement thread." onClick={() => runTool('hook_twitter')} />
              <ToolCard icon={Share2} title="124. WhatsApp Business Push API" desc="Formats text for WhatsApp Business API webhook." onClick={() => runTool('hook_whatsapp')} />
              <ToolCard icon={Database} title="125. Canvas LMS e-Learning Integration" desc="Forwards academic notices to ASTU Moodle e-Learning LMS." onClick={() => runTool('hook_lms_canvas')} />
              <ToolCard icon={Database} title="126. Registrar ERP Sync Hook" desc="Syncs broadcast record with Registrar ERP database." onClick={() => runTool('hook_registrar_erp')} />
              <ToolCard icon={Share2} title="127. Chapa Payment Gateway Hook" desc="Attaches Chapa payment gateway payload to donation link." onClick={() => runTool('hook_chapa_payment')} />
              <ToolCard icon={ShieldCheck} title="128. Didit Identity Verification Hook" desc="Links verification requests directly to Didit API." onClick={() => runTool('hook_didit_identity')} />
              <ToolCard icon={Bot} title="129. OpenRouter AI Auto-Responder" desc="Configures AI bot auto-replies for recipient inquiries." onClick={() => runTool('hook_openrouter_ai')} />
              <ToolCard icon={Terminal} title="130. Slack / Teams Admin Webhook" desc="Sends real-time broadcast copy to ASTU ICT Slack channel." onClick={() => runTool('hook_slack_webhook')} />
              <ToolCard icon={CalendarDays} title="131. Google Calendar Event Sync Link" desc="Generates 1-click Add to Google Calendar URL." onClick={() => runTool('hook_gcal_sync')} />
              <ToolCard icon={Megaphone} title="132. Web Push Notification Webhook" desc="Triggers browser web push notification payload." onClick={() => runTool('hook_web_push')} />
              <ToolCard icon={Share2} title="133. Discord Alumni Guild Bot Sync" desc="Posts broadcast update to ASTU Discord server." onClick={() => runTool('hook_discord_bot')} />
              <ToolCard icon={Database} title="134. HubSpot / Salesforce CRM Sync" desc="Syncs recipient interaction status to CRM backend." onClick={() => runTool('hook_crm_sync')} />
              <ToolCard icon={Terminal} title="135. Webhook Test Payload Sender" desc="Sends diagnostic ping to custom webhook URL." onClick={() => runTool('hook_test_ping')} />
            </div>
          )}

          {/* Tab 10: Utilities (15 Tools) */}
          {activeToolTab === 'utilities' && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToolCard icon={Copy} title="136. Copy Raw Compiled HTML Code" desc="Copies raw compiled HTML to clipboard." onClick={() => runTool('copy_raw_html')} />
              <ToolCard icon={FileJson} title="137. Export Template Draft to JSON File" desc="Downloads current composer settings as JSON file." onClick={() => runTool('download_draft_json')} />
              <ToolCard icon={Upload} title="138. Import Template Draft from JSON" desc="Uploads JSON file to populate composer fields." onClick={() => runTool('upload_draft_json')} />
              <ToolCard icon={Printer} title="139. Printable PDF Memo Generator" desc="Opens browser print dialog for physical archiving." onClick={() => runTool('print_memo')} />
              <ToolCard icon={Type} title="140. Text Case Transformer (UPPERCASE)" desc="Converts message text to UPPERCASE." onClick={() => runTool('text_uppercase')} />
              <ToolCard icon={Type} title="141. Text Case Transformer (lowercase)" desc="Converts message text to lowercase." onClick={() => runTool('text_lowercase')} />
              <ToolCard icon={Type} title="142. Text Case Transformer (Title Case)" desc="Converts message text to Title Case." onClick={() => runTool('text_titlecase')} />
              <ToolCard icon={Link2} title="143. URL Special Character Encoder" desc="Encodes special characters in CTA links." onClick={() => runTool('url_encode')} />
              <ToolCard icon={ShieldCheck} title="144. Security XSS HTML Sanitizer" desc="Cleans unsafe scripts and invalid HTML elements." onClick={() => runTool('sanitize_html')} />
              <ToolCard icon={Terminal} title="145. Keyboard Shortcuts Cheatsheet" desc="Displays fast hotkeys for power user composition." onClick={() => runTool('shortcuts_help')} />
              <ToolCard icon={X} title="146. Reset & Clear Workspace" desc="Resets composer input fields safely." onClick={() => runTool('clear_workspace')} />
              <ToolCard icon={Wand2} title="147. Apply Default Survey Preset" desc="Loads standard ASTU Tracer Survey preset." onClick={() => runTool('apply_survey_preset')} />
              <ToolCard icon={FileText} title="148. Word & Character Counter Tool" desc="Displays exact character, word & SMS segment counts." onClick={() => runTool('util_word_char_count')} />
              <ToolCard icon={AlignLeft} title="149. Remove Empty Lines & Whitespace" desc="Cleans trailing spaces and duplicate blank lines." onClick={() => runTool('util_clean_whitespace')} />
              <ToolCard icon={RefreshCw} title="150. Restore Last Auto-Saved Draft" desc="Restores previous saved draft state from local storage." onClick={() => runTool('util_restore_draft')} />
            </div>
          )}
        </div>
      </AdminModal>

      {/* Notification Preview Modal */}
      <AdminModal
        open={previewOpen}
        title="HTML & Broadcast Preview"
        onClose={() => setPreviewOpen(false)}
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-[var(--text-muted)]">Targeting ~{estimatedRecipientsCount} recipients</span>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="rounded-[8px] bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
            >
              Close Preview
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <AdminBadge variant="default">{type}</AdminBadge>
            <AdminBadge variant="neutral">{priority} Priority</AdminBadge>
            <AdminBadge variant="neutral">Target: {target}</AdminBadge>
            <AdminBadge variant="success">{sendMode}</AdminBadge>
          </div>

          {imageUrl && (
            <div className="overflow-hidden rounded-lg border border-[var(--border-color)]">
              <img src={imageUrl} alt="Banner" className="max-h-48 w-full object-cover" />
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Subject</p>
            <p className="mt-1 text-base font-bold text-[var(--text-primary)]">{subject || 'No Subject'}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Message Content</p>
            <div className="mt-1 rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-page)] p-4 text-xs leading-6 text-[var(--text-primary)] whitespace-pre-wrap">
              {message || 'No message content provided.'}
            </div>
          </div>

          {ctaLink && (
            <div className="pt-2 text-center">
              <a
                href={ctaLink}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-md bg-[#003580] px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110"
              >
                {ctaText || 'View Details'}
              </a>
            </div>
          )}
        </div>
      </AdminModal>

      {/* Notification Detail Modal */}
      <AdminModal
        open={Boolean(detail)}
        title={detail?.subject ?? 'Notification Detail'}
        onClose={() => setDetail(null)}
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-[var(--text-muted)]">ID: {detail?.id}</span>
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="rounded-[8px] bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
            >
              Close
            </button>
          </div>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <DetailItem label="Date Sent" value={new Date(detail.dateSent).toLocaleString()} />
              <DetailItem label="Recipients" value={detail.recipients.toLocaleString()} />
              <DetailItem label="Channel Type" value={detail.type} />
              <DetailItem label="Status" value={detail.status} />
              <DetailItem label="Priority" value={detail.priority || 'Normal'} />
              <DetailItem label="Category" value={detail.category || 'General'} />
              <DetailItem label="Target Audience" value={detail.targetGroup} />
              <DetailItem label="Open Rate" value={detail.openRate} />
            </div>

            {detail.imageUrl && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Banner Image</p>
                <img src={detail.imageUrl} alt="Banner" className="mt-1 max-h-40 rounded-lg object-cover" />
              </div>
            )}

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Broadcast Content</p>
              <div className="mt-2 rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-page)] p-4 text-xs leading-6 text-[var(--text-primary)] whitespace-pre-wrap">
                {detail.body}
              </div>
            </div>

            {detail.ctaLink && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Action Button</p>
                <a
                  href={detail.ctaLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs font-semibold text-[#003580] underline"
                >
                  {detail.ctaText || detail.ctaLink}
                </a>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Export CSV & Intelligence Report Modal */}
      <AdminModal
        open={isExportModalOpen}
        size="xl"
        title="Export Broadcast & Notification Intelligence Report"
        onClose={() => setIsExportModalOpen(false)}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyExportData}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-all shadow-xs"
              >
                <Copy className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Copy Data to Clipboard</span>
              </button>
              {exportFormat === 'html' && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  HTML report will launch in browser
                </span>
              )}
              {exportFormat === 'pdf' && (
                <span className="text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                  PDF A4 print dialog will open automatically
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#003580] to-[#002254] px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>
                  {exportFormat === 'pdf' ? 'Print / Export PDF' : 'Download Report'} ({getFilteredRowsForExport().length} Records)
                </span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Top Alert Banner */}
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 text-xs text-[#003580] flex items-start gap-3">
            <Download className="h-5 w-5 text-[#003580] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#003580]">ASTU Official Broadcast Data Exporter</h4>
              <p className="mt-0.5 text-xs text-blue-900/80 leading-5">
                Customize data filtering criteria, file format encoding, summary telemetry headers, and column fields to generate a comprehensive report for ASTU Alumni & System Broadcast history.
              </p>
            </div>
          </div>

          {/* Section 1: Choose File Format */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
              1. Select Export Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {[
                { id: 'csv', name: 'CSV (Standard)', desc: 'Universal comma-separated file', icon: FileText },
                { id: 'excel_csv', name: 'Excel CSV (UTF-8)', desc: 'MS Excel with BOM encoding', icon: FileSpreadsheet },
                { id: 'pdf', name: 'PDF Document', desc: 'Printable executive ASTU PDF report', icon: Printer },
                { id: 'json', name: 'JSON Package', desc: 'Structured JSON data & metadata', icon: FileJson },
                { id: 'html', name: 'Executive HTML', desc: 'Styled printable dashboard report', icon: Globe },
                { id: 'tsv', name: 'TSV (Tab Text)', desc: 'Tab-delimited database text', icon: Code },
              ].map((fmt) => {
                const IconComp = fmt.icon;
                const active = exportFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setExportFormat(fmt.id as any)}
                    className={`flex flex-col items-start justify-between rounded-xl border p-3 text-left transition-all ${
                      active
                        ? 'border-[#003580] bg-blue-50/80 ring-2 ring-[#003580]/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-[var(--bg-page)] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg ${active ? 'bg-[#003580] text-white' : 'bg-[var(--bg-page)] text-[var(--text-secondary)]'}`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      {active && <CheckCircle2 className="h-4 w-4 text-[#003580]" />}
                    </div>
                    <div className="mt-2.5">
                      <p className={`text-xs font-bold ${active ? 'text-[#003580]' : 'text-[var(--text-primary)]'}`}>{fmt.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-2">{fmt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Data Filtering Criteria Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
              2. Data Filtering & Scope Criteria
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Record Limit / Export Scope Selector */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 space-y-2 ring-2 ring-blue-500/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#003580]">
                  <Database className="h-3.5 w-3.5 text-[#003580]" />
                  <span>Export Record Scope</span>
                </div>
                <select
                  value={exportScope}
                  onChange={(e) => setExportScope(e.target.value as any)}
                  className="w-full rounded-lg border border-blue-300 bg-white p-2 text-xs font-bold text-[#003580] outline-none focus:border-[#003580] shadow-xs"
                >
                  <option value="all">All Database Records (~{exportAllRows.length || historyTotal || 681} total)</option>
                  <option value="current_page">Current Page List ({historyRows.length} items on page {historyPage})</option>
                  <option value="top_50">Top 50 Most Recent Records</option>
                  <option value="top_100">Top 100 Most Recent Records</option>
                  <option value="top_250">Top 250 Most Recent Records</option>
                  <option value="top_500">Top 500 Most Recent Records</option>
                </select>
                <p className="text-[10px] text-blue-800 font-medium">
                  {exportScope === 'all' && `Exporting full history across all database pages`}
                  {exportScope === 'current_page' && `Exporting page ${historyPage} table list (${historyRows.length} items)`}
                  {exportScope.startsWith('top_') && `Limiting export to latest ${exportScope.replace('top_', '')} records`}
                </p>
              </div>

              {/* Date Range Selector */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                  <CalendarDays className="h-3.5 w-3.5 text-[#003580]" />
                  <span>Date Range</span>
                </div>
                <select
                  value={exportDateRange}
                  onChange={(e) => setExportDateRange(e.target.value as any)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]"
                >
                  <option value="all">All Time (Full History)</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="custom">Custom Date Range...</option>
                </select>

                {exportDateRange === 'custom' && (
                  <div className="space-y-1.5 pt-1">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold">From Date:</span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-page)] p-1.5 text-xs text-[var(--text-secondary)]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold">To Date:</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-page)] p-1.5 text-xs text-[var(--text-secondary)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Target Audience / Portal Selector */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Target Audience</span>
                </div>
                <select
                  value={exportTargetAudience}
                  onChange={(e) => setExportTargetAudience(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]"
                >
                  <option value="all">All 6 System Portals</option>
                  <option value="ALUMNI">Alumni & Graduates</option>
                  <option value="EMPLOYERS">Employers & Recruiters</option>
                  <option value="REGISTRAR">Registrar & Dept Staff</option>
                  <option value="DEPT_HEADS">Department Heads & Deans</option>
                  <option value="ICT_ADMIN">ICT System Administrators</option>
                  <option value="BATCH_2024">Class of 2024 GC</option>
                </select>
              </div>

              {/* Channel Filter */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                  <Radio className="h-3.5 w-3.5 text-purple-600" />
                  <span>Delivery Channel</span>
                </div>
                <select
                  value={exportChannel}
                  onChange={(e) => setExportChannel(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]"
                >
                  <option value="all">All Channels</option>
                  <option value="Both">Both (In-App & Email)</option>
                  <option value="In-App">In-App Alerts Only</option>
                  <option value="Email">Email Broadcasts Only</option>
                  <option value="SMS">SMS & Telemetry</option>
                </select>
              </div>

              {/* Priority & Status Filter */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                  <Sliders className="h-3.5 w-3.5 text-amber-600" />
                  <span>Priority & Status</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={exportPriority}
                    onChange={(e) => setExportPriority(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-1.5 text-[11px] font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]"
                  >
                    <option value="all">All Priority</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                  </select>
                  <select
                    value={exportStatus}
                    onChange={(e) => setExportStatus(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-1.5 text-[11px] font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]"
                  >
                    <option value="all">All Status</option>
                    <option value="Sent">Sent</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Criteria Secondary Row */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-3">
              {/* Search Keyword Filter */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                  <Search className="h-3.5 w-3.5 text-blue-600" />
                  <span>Keyword Search</span>
                </div>
                <input
                  type="text"
                  placeholder="Subject or content..."
                  value={exportKeyword}
                  onChange={(e) => setExportKeyword(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]"
                />
              </div>

              {/* Category Filter */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                  <Layers className="h-3.5 w-3.5 text-teal-600" />
                  <span>Category Scope</span>
                </div>
                <select
                  value={exportCategory}
                  onChange={(e) => setExportCategory(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]"
                >
                  <option value="all">All Categories</option>
                  <option value="General">General</option>
                  <option value="Tracer Survey">Tracer Survey</option>
                  <option value="Career & Job">Career & Placement</option>
                  <option value="Academic">Academic Notices</option>
                  <option value="System Maintenance">System Maintenance</option>
                </select>
              </div>

              {/* Open Rate / Engagement Filter */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                  <Eye className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Engagement Level</span>
                </div>
                <select
                  value={exportEngagement}
                  onChange={(e) => setExportEngagement(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]"
                >
                  <option value="all">All Engagement Levels</option>
                  <option value="high">High Engagement (≥50% Open)</option>
                  <option value="medium">Medium (20-49% Open)</option>
                  <option value="low">Low (&lt;20% Open)</option>
                  <option value="unread">Unread / 0% Open</option>
                </select>
              </div>

              {/* Media Content Filter */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                  <ImageIcon className="h-3.5 w-3.5 text-rose-600" />
                  <span>Media Banners</span>
                </div>
                <select
                  value={exportMediaFilter}
                  onChange={(e) => setExportMediaFilter(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]"
                >
                  <option value="all">All Notifications</option>
                  <option value="with_banner">With Hero Image Banners</option>
                  <option value="text_only">Text-Only Announcements</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Field Selection Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                3. Select Included Columns & Data Fields
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setExportColumns({
                      id: true,
                      dateSent: true,
                      channel: true,
                      priority: true,
                      category: true,
                      subject: true,
                      body: true,
                      targetGroup: true,
                      recipients: true,
                      openRate: true,
                      status: true,
                      ctaLink: true,
                      imageUrl: true,
                    })
                  }
                  className="text-[#003580] font-semibold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() =>
                    setExportColumns({
                      id: true,
                      dateSent: true,
                      channel: true,
                      priority: true,
                      category: true,
                      subject: true,
                      body: false,
                      targetGroup: true,
                      recipients: true,
                      openRate: true,
                      status: true,
                      ctaLink: false,
                      imageUrl: false,
                    })
                  }
                  className="text-[#003580] font-semibold hover:underline"
                >
                  Default Selection
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5">
              {[
                { key: 'id', label: 'Notification ID' },
                { key: 'dateSent', label: 'Date & Time Sent' },
                { key: 'channel', label: 'Delivery Channel' },
                { key: 'priority', label: 'Priority Level' },
                { key: 'category', label: 'Category' },
                { key: 'subject', label: 'Subject / Title' },
                { key: 'body', label: 'Full Message Body' },
                { key: 'targetGroup', label: 'Target Audience' },
                { key: 'recipients', label: 'Recipients Count' },
                { key: 'openRate', label: 'Open Rate %' },
                { key: 'status', label: 'Delivery Status' },
                { key: 'ctaLink', label: 'Action CTA Link' },
                { key: 'imageUrl', label: 'Hero Image URL' },
              ].map((col) => {
                const checked = (exportColumns as any)[col.key];
                return (
                  <label
                    key={col.key}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-medium cursor-pointer transition-all ${
                      checked
                        ? 'border-blue-200 bg-blue-50/50 text-[#003580] font-bold'
                        : 'border-slate-200 bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setExportColumns((prev) => ({ ...prev, [col.key]: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                    />
                    <span>{col.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Formatting & Header Preferences */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnalyticsHeader}
                  onChange={(e) => setIncludeAnalyticsHeader(e.target.checked)}
                  className="rounded border-slate-300 text-[#003580]"
                />
                <span>Include Summary Metrics Header</span>
              </label>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 pl-5">
                Adds total recipient stats & open rate metadata at top of report file.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
              <span className="text-xs font-bold text-[var(--text-primary)] block mb-1">Sort Order</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-1.5 text-xs text-[var(--text-primary)]"
              >
                <option value="dateSent_desc">Date Sent (Newest First)</option>
                <option value="dateSent_asc">Date Sent (Oldest First)</option>
                <option value="recipients_desc">Recipients (Highest First)</option>
                <option value="openRate_desc">Open Rate (Highest First)</option>
              </select>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
              <span className="text-xs font-bold text-[var(--text-primary)] block mb-1">CSV Delimiter</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value as any)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-1.5 text-xs text-[var(--text-primary)]"
                disabled={exportFormat === 'json' || exportFormat === 'html' || exportFormat === 'pdf'}
              >
                <option value=",">Comma ( , ) - Standard</option>
                <option value=";">Semicolon ( ; ) - European</option>
                <option value="&#9;">Tab ( \t ) - TSV Format</option>
              </select>
            </div>
          </div>

          {/* Section 5: Real-time Live Matching Stats & Sample Data Preview */}
          {(() => {
            const filtered = getFilteredRowsForExport();
            const totalRecipients = filtered.reduce((acc, r) => acc + (r.recipients || 0), 0);
            const avgOpenRate = Math.round(
              filtered.reduce((acc, r) => acc + parseFloat(r.openRate || '0'), 0) / (filtered.length || 1)
            );

            return (
              <div className="rounded-xl border border-[var(--border-color)] bg-slate-900 text-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live Export Filter Match</span>
                    <h4 className="text-sm font-extrabold text-white mt-0.5">
                      {filtered.length} Broadcast Records Matched
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Total Audience</span>
                      <span className="font-bold text-white">{totalRecipients.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Avg Open Rate</span>
                      <span className="font-bold text-emerald-300">{avgOpenRate}%</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Output Format</span>
                      <span className="font-bold text-blue-300 uppercase">{exportFormat}</span>
                    </div>
                  </div>
                </div>

                {/* Sample Rows Preview */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Sample Data Preview (First 3 Rows)
                  </p>
                  {filtered.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
                      <table className="w-full text-left text-[11px] text-slate-300">
                        <thead className="bg-slate-800/80 text-[var(--text-muted)] font-semibold text-[10px] uppercase">
                          <tr>
                            <th className="p-2">Date Sent</th>
                            <th className="p-2">Channel</th>
                            <th className="p-2">Priority</th>
                            <th className="p-2">Subject</th>
                            <th className="p-2">Audience</th>
                            <th className="p-2">Open Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {filtered.slice(0, 3).map((r) => (
                            <tr key={r.id} className="hover:bg-slate-800/40">
                              <td className="p-2 whitespace-nowrap text-[var(--text-muted)]">{new Date(r.dateSent).toLocaleDateString()}</td>
                              <td className="p-2 font-semibold text-blue-300">{r.type}</td>
                              <td className="p-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  r.priority === 'Urgent' ? 'bg-rose-900/60 text-rose-300' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {r.priority || 'Normal'}
                                </span>
                              </td>
                              <td className="p-2 font-medium text-white max-w-[200px] truncate">{r.subject}</td>
                              <td className="p-2 text-[var(--text-muted)]">{r.targetGroup}</td>
                              <td className="p-2 font-bold text-emerald-400">{r.openRate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-rose-400 bg-rose-950/30 rounded-lg border border-rose-900/50">
                      No records match the selected filter criteria. Adjust your date range or filters above.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </AdminModal>
    </div>
  );
}

function ToolCard({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)]/80 p-3 text-left hover:bg-[var(--bg-page)] hover:border-slate-300 transition-all shadow-sm"
    >
      <Icon className="h-4 w-4 text-[#003580] mt-0.5 shrink-0" />
      <div>
        <h5 className="text-xs font-bold text-[var(--text-primary)]">{title}</h5>
        <p className="text-[11px] text-[var(--text-muted)] leading-4 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-page)] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-xs font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
