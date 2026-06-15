/**
 * CMS Service Layer — Integration Ready
 *
 * All async functions in this file are STUBS that return mock data.
 * To integrate with the backend, replace each `return Promise.resolve(...)`
 * with the corresponding `await adminApi.xxx()` call indicated by the TODO comment.
 *
 * Backend team: all API endpoints are listed in the TODO comments below.
 */

// ─── Base config ────────────────────────────────────────────────────────────
export const CMS_API_BASE = '/api/cms';

// ─── Shared utility ─────────────────────────────────────────────────────────
export function uid(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

// ─── Content List ────────────────────────────────────────────────────────────
export type ContentStatus = 'Published' | 'Draft' | 'Scheduled' | 'Needs Review' | 'Archived';
export type ContentType = 'page' | 'post' | 'announcement' | 'gallery' | 'event' | 'template';
export type ContentPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  excerpt?: string;
  author: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
  views: number;
  tags?: string[];
  pinned: boolean;
  featured: boolean;
  language: string;
  seoScore?: number;
  wordCount?: number;
  readTime?: string;
  priority?: ContentPriority;
}

export interface ContentListParams {
  status?: ContentStatus | 'all';
  type?: ContentType | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateContentPayload {
  title: string;
  type: ContentType;
  excerpt?: string;
  tags?: string[];
  language?: string;
}

// ─── CMS Dashboard Stats ─────────────────────────────────────────────────────
export interface CmsDashboardStats {
  published: number;
  draft: number;
  scheduled: number;
  needsReview: number;
  totalViews: number;
  total: number;
}

// ─── Homepage Sections ───────────────────────────────────────────────────────
export interface HeroSlide {
  id: string; image: string; tagline: string; title: string; description: string; active: boolean;
}
export interface ImpactStat {
  id: string; label: string; value: string; suffix: string; detail: string; icon: string; active: boolean;
}
export interface StakeholderPortal {
  id: string; title: string; icon: string; points: string[]; cta: string; route: string; active: boolean;
}
export interface CampusLifeCard {
  id: string; title: string; campus: string; description: string; image: string; action: string; active: boolean;
}
export interface Campus {
  id: string; name: string; description: string; image: string; active: boolean;
}
export interface GalleryImage {
  id: string; title: string; src: string; active: boolean;
}
export interface VideoItem {
  id: string; title: string; image: string; active: boolean;
}
export interface HomepageEvent {
  id: string; title: string; date: string; location: string; image: string; active: boolean;
}
export interface Workshop {
  id: string; title: string; date: string; seats: string; focus: string; active: boolean;
}
export interface NewsItem {
  id: string; title: string; date: string; active: boolean;
}
export interface HomepageAnnouncement {
  id: string; title: string; date: string; type: string; active: boolean;
}
export interface SuccessStory {
  id: string; name: string; role: string; text: string; image: string; active: boolean;
}
export interface Partner {
  id: string; name: string; active: boolean;
}
export interface Testimonial {
  id: string; quote: string; by: string; active: boolean;
}
export interface FaqSection {
  id: string; question: string; answer: string; active: boolean;
}

export interface HomepageData {
  heroSlides: HeroSlide[];
  impactStats: ImpactStat[];
  portals: StakeholderPortal[];
  campusLife: CampusLifeCard[];
  campuses: Campus[];
  gallery: GalleryImage[];
  videos: VideoItem[];
  events: HomepageEvent[];
  workshops: Workshop[];
  newsItems: NewsItem[];
  announcements: HomepageAnnouncement[];
  stories: SuccessStory[];
  partners: Partner[];
  testimonials: Testimonial[];
  faq: FaqSection[];
  welcomeMessage: string;
}

// ─── Latest News ─────────────────────────────────────────────────────────────
export interface LatestNewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  views: number;
  image: string;
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

// ─── Footer ──────────────────────────────────────────────────────────────────
export interface FooterLink { id: string; label: string; href: string; }
export interface FooterSection { id: string; title: string; links: FooterLink[]; }
export interface SocialLink { id: string; platform: string; url: string; icon: string; }
export interface FooterData {
  sections: FooterSection[];
  socialLinks: SocialLink[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  copyrightText: string;
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
export type GalleryStatus = 'Approved' | 'Pending Review' | 'Rejected';
export interface GalleryMediaItem {
  id: string; title: string; type: 'Photo' | 'Video'; album: string;
  status: GalleryStatus; uploadedBy: string; date: string;
}

// ─── Events & Workshops ──────────────────────────────────────────────────────
export type EventStatus = 'Open' | 'Approval Required' | 'Closed';
export type EventKind = 'Event' | 'Workshop';
export interface EventItem {
  id: string; title: string; kind: EventKind; category: string; date: string;
  rsvps: number; attendance: number; status: EventStatus; location: string;
}

// ─── Media Library ───────────────────────────────────────────────────────────
export type MediaFileType = 'image' | 'video' | 'document' | 'audio';
export interface MediaFile {
  id: string; name: string; type: MediaFileType; size: string; url: string;
  uploadedAt: string; uploadedBy: string; folder: string; dimensions?: string;
}

// ─── SEO ─────────────────────────────────────────────────────────────────────
export interface SeoPage {
  id: string; path: string; title: string; description: string;
  score: number; status: 'Good' | 'Warning' | 'Error';
  issues: string[]; lastCrawled: string;
}

// ─── Templates ───────────────────────────────────────────────────────────────
export interface ContentTemplate {
  id: string; name: string; description: string; category: string;
  usage: number; lastUpdated: string; isDefault?: boolean; isFeatured?: boolean;
  fields: string[];
}

// ─── Approval Workflow ───────────────────────────────────────────────────────
export type WorkflowStatus = 'Pending Review' | 'In Review' | 'Changes Requested' | 'Approved' | 'Rejected' | 'Published';
export interface WorkflowItem {
  id: string; title: string; type: string; author: string; submittedAt: string;
  status: WorkflowStatus; priority: ContentPriority; reviewer: string;
  stage: number; totalStages: number; comments: number; dueDate: string;
}

// ─── Content Governance ──────────────────────────────────────────────────────
export type AnnouncementStatus = 'Published' | 'Scheduled' | 'Pinned' | 'Draft' | 'Needs Review';
export type Audience = 'Public' | 'Internal' | 'Emergency' | 'Department' | 'Alumni' | 'Employer';
export interface GovernanceAnnouncement {
  id: string; title: string; audience: Audience; status: AnnouncementStatus;
  attachment: string; owner: string; updated: string; views: number;
}
export interface CommunityPost {
  id: string; title: string; author: string; reports: number;
  action: string; approved: boolean; pinned: boolean; date: string;
}

// ─── CMS Settings ────────────────────────────────────────────────────────────
export interface CmsSettingsData {
  siteName: string;
  tagline: string;
  siteUrl: string;
  contactEmail: string;
  newsletterEnabled: boolean;
  commentsEnabled: boolean;
  autoPublish: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  twoFactorRequired: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_CONTENT_ITEMS: ContentItem[] = [
  { id: 'C-001', title: 'ASTU Alumni Network: Bridging Generations', type: 'post', status: 'Published', excerpt: 'How our alumni network connects 25,000+ graduates with opportunities, mentorship, and lifelong learning resources.', author: 'Content Manager', updatedAt: '2 hours ago', publishedAt: 'May 28, 2026', views: 1240, tags: ['alumni', 'community', 'networking'], pinned: true, featured: true, language: 'EN', seoScore: 94, wordCount: 840, readTime: '4 min read' },
  { id: 'C-002', title: 'Industry Partnership Week 2026', type: 'page', status: 'Scheduled', excerpt: 'Five-day summit connecting ASTU students with leading employers across Ethiopia and East Africa.', author: 'Content Manager', updatedAt: 'Jun 5, 2026', scheduledFor: 'Jun 12, 9:00 AM', views: 0, tags: ['partnership', 'employers', 'career'], pinned: false, featured: true, language: 'EN', seoScore: 88, wordCount: 1250, readTime: '6 min read' },
  { id: 'C-003', title: 'Tracer Survey Campaign Banner', type: 'page', status: 'Draft', excerpt: 'Encourages 2024 alumni batch to complete the annual tracer study for institutional improvement.', author: 'Content Manager', updatedAt: 'Yesterday', views: 0, tags: ['tracer', 'survey', 'alumni'], pinned: false, featured: false, language: 'EN', seoScore: 72, wordCount: 320, readTime: '2 min read' },
  { id: 'C-004', title: 'Semester Break: Campus Safety Notice', type: 'announcement', status: 'Published', excerpt: 'Important safety reminders for students, faculty, and visitors during the upcoming semester break.', author: 'System Admin', updatedAt: '45 min ago', publishedAt: 'Jun 7, 2026', views: 892, tags: ['safety', 'campus', 'announcement'], pinned: true, featured: false, language: 'EN', seoScore: 91, wordCount: 510, readTime: '3 min read', priority: 'Urgent' },
  { id: 'C-005', title: 'Campus Tour 2026 Photo Album', type: 'gallery', status: 'Needs Review', excerpt: 'Stunning aerial and ground-level photos from the 2026 campus tour.', author: 'Dept Head', updatedAt: '3 days ago', views: 0, tags: ['campus', 'tour', 'photos'], pinned: false, featured: false, language: 'EN', seoScore: 82, wordCount: 150, readTime: '1 min read', priority: 'Normal' },
  { id: 'C-006', title: 'Career Fair 2026 Registration Open', type: 'event', status: 'Needs Review', excerpt: 'Meet 40+ top employers at the annual career fair.', author: 'Event Coordinator', updatedAt: '2 hours ago', views: 0, tags: ['career', 'fair', 'event'], pinned: false, featured: true, language: 'EN', seoScore: 96, wordCount: 940, readTime: '5 min read', priority: 'High' },
  { id: 'C-007', title: 'Graduation Photo Gallery 2025', type: 'gallery', status: 'Published', excerpt: 'Celebrating 3,500+ graduates from the Class of 2025.', author: 'Content Manager', updatedAt: '1 week ago', publishedAt: 'May 15, 2026', views: 3401, tags: ['graduation', 'students', '2025'], pinned: false, featured: true, language: 'EN', seoScore: 85, wordCount: 220, readTime: '1 min read' },
  { id: 'C-008', title: 'Alumni Spotlight: Mekdes Yilma', type: 'post', status: 'Published', excerpt: 'From ASTU to NASA: How Mekdes Yilma turned her engineering passion into a space industry career.', author: 'Content Manager', updatedAt: 'Jun 2, 2026', publishedAt: 'Jun 2, 2026', views: 567, tags: ['alumni', 'spotlight', 'engineering'], pinned: false, featured: true, language: 'EN', seoScore: 95, wordCount: 1680, readTime: '8 min read' },
  { id: 'C-009', title: 'Employer Branding: Ethio Telecom', type: 'page', status: 'Draft', excerpt: 'Promote Ethio Telecom as a featured recruitment partner.', author: 'Content Manager', updatedAt: 'May 30, 2026', views: 0, tags: ['employer', 'telecom', 'branding'], pinned: false, featured: false, language: 'EN', seoScore: 68, wordCount: 450, readTime: '2 min read' },
  { id: 'C-010', title: 'Workshop Registration CTA', type: 'page', status: 'Scheduled', excerpt: 'Add QR attendance and certificate language to the workshop section.', author: 'Content Manager', updatedAt: 'Jun 8, 2026', scheduledFor: 'Jun 10, 12:00 PM', views: 0, tags: ['workshop', 'ai', 'ml'], pinned: false, featured: false, language: 'EN', seoScore: 89, wordCount: 780, readTime: '4 min read' },
  { id: 'C-011', title: 'Research Innovation Showcase', type: 'post', status: 'Published', excerpt: 'Highlighting breakthrough research from ASTU faculty and students.', author: 'Research Directorate', updatedAt: '4 days ago', publishedAt: 'Jun 5, 2026', views: 423, tags: ['research', 'innovation', 'showcase'], pinned: false, featured: false, language: 'EN', seoScore: 92, wordCount: 1450, readTime: '7 min read' },
  { id: 'C-012', title: 'Old Homepage (Archived)', type: 'page', status: 'Archived', excerpt: 'Legacy homepage from the previous system.', author: 'System Admin', updatedAt: '2 months ago', views: 0, tags: ['legacy', 'archive'], pinned: false, featured: false, language: 'EN', seoScore: 61, wordCount: 920, readTime: '4 min read' },
];

const MOCK_NEWS_ITEMS: LatestNewsItem[] = [
  { id: 'N-001', title: 'ASTU Launches New Alumni Management Platform', summary: 'The university debuts an integrated digital system for alumni engagement, employer partnerships, and tracer studies.', date: '2026-06-10', category: 'Campus', status: 'Published', views: 4520, image: '/images/news/platform.jpg' },
  { id: 'N-002', title: 'Research Team Wins National Innovation Award', summary: 'ASTU engineers recognized for breakthrough clean energy research at the Ethiopia Innovation Forum.', date: '2026-06-08', category: 'Research', status: 'Published', views: 1890, image: '/images/news/award.jpg' },
  { id: 'N-003', title: 'Annual Career Expo 2026', summary: 'Over 50 employers to participate in the largest career fair in ASTU history.', date: '2026-06-05', category: 'Events', status: 'Scheduled', views: 2100, image: '/images/news/career.jpg' },
  { id: 'N-004', title: 'Alumni Mentorship Program Launch', summary: 'New program connecting current students with successful alumni mentors across industries.', date: '2026-06-01', category: 'Alumni', status: 'Published', views: 567, image: '/images/news/mentorship.jpg' },
  { id: 'N-005', title: 'Partnership with Ethiopian Airlines', summary: 'ASTU signs MoU with Ethiopian Airlines for internship and research collaboration.', date: '2026-05-15', category: 'Partnership', status: 'Published', views: 3401, image: '/images/news/partnership.jpg' },
  { id: 'N-006', title: 'Summer Bootcamp Registration Open', summary: 'Coding, robotics, and data science bootcamps for ASTU students and recent graduates.', date: '2026-06-10', category: 'Events', status: 'Draft', views: 0, image: '/images/news/bootcamp.jpg' },
];

const MOCK_FAQS: FaqEntry[] = [
  { id: 'FQ-01', question: 'How do I register as an alumni?', answer: 'Visit the registration page and complete the form with your student ID, personal details, and graduation information. You will receive a verification email to activate your account.', category: 'Account & Profile', order: 1 },
  { id: 'FQ-02', question: 'How can employers post jobs?', answer: 'Employers can register through the employer portal, get verified by the admin, and then post job opportunities for ASTU alumni and students.', category: 'Jobs & Careers', order: 1 },
  { id: 'FQ-03', question: 'What is the Tracer Study?', answer: 'The Tracer Study tracks graduate career outcomes at 6, 12, and 24-month intervals after graduation to measure employability and inform curriculum improvements.', category: 'Tracer Surveys', order: 1 },
  { id: 'FQ-04', question: 'How do I request a transcript?', answer: 'Log into your alumni dashboard, navigate to Document Requests, select Transcript, and complete the request form. Processing takes 3-5 business days.', category: 'Documents & Transcripts', order: 1 },
  { id: 'FQ-05', question: 'Can I update my profile information?', answer: 'Yes, log into your alumni dashboard and click Edit Profile to update your contact details, employment status, and professional information.', category: 'Account & Profile', order: 2 },
  { id: 'FQ-06', question: 'How do I find a mentor?', answer: 'Browse the Mentorship section in your dashboard, filter by industry or expertise, and send a mentorship request to available alumni mentors.', category: 'Mentorship', order: 1 },
  { id: 'FQ-07', question: 'How do I RSVP for events?', answer: 'Visit the Events page in your dashboard, select an event, and click RSVP. You will receive a confirmation with event details and a QR code for check-in.', category: 'Events & Networking', order: 1 },
  { id: 'FQ-08', question: 'What technical support is available?', answer: 'You can access the Help Center from any page, submit a support ticket, or contact the ICT helpdesk at support@astu.edu.et for assistance.', category: 'Technical Support', order: 1 },
  { id: 'FQ-09', question: 'Who can use the ASTU-AMS platform?', answer: 'The platform serves alumni, employers, department heads, registrar staff, and university administrators. Each role has tailored features and permissions.', category: 'General', order: 1 },
];

const MOCK_FOOTER_DATA: FooterData = {
  sections: [
    { id: 'FS-01', title: 'Portal Services', links: [
      { id: 'FL-01', label: 'Alumni', href: '/info/alumni-portal' },
      { id: 'FL-02', label: 'Employer', href: '/info/employer-portal' },
      { id: 'FL-03', label: 'Registrar', href: '/info/registrar-portal' },
      { id: 'FL-04', label: 'Department', href: '/info/department-portal' },
    ]},
    { id: 'FS-02', title: 'About ASTU', links: [
      { id: 'FL-05', label: 'University Overview', href: '/' },
      { id: 'FL-06', label: 'Impact & Accreditation', href: '#impact' },
      { id: 'FL-07', label: 'Research Highlights', href: '#research' },
    ]},
    { id: 'FS-03', title: 'Resources', links: [
      { id: 'FL-08', label: 'Events', href: '#events' },
      { id: 'FL-09', label: 'Workshops', href: '#workshops' },
      { id: 'FL-10', label: 'Career Opportunities', href: '#career-opportunities' },
      { id: 'FL-11', label: 'FAQ', href: '#faq' },
    ]},
    { id: 'FS-04', title: 'Connect', links: [
      { id: 'FL-12', label: 'Contact Us', href: '#contact' },
      { id: 'FL-13', label: 'Photo Gallery', href: '#gallery' },
    ]},
  ],
  socialLinks: [
    { id: 'SL-01', platform: 'Facebook', url: 'https://facebook.com/astu', icon: 'Facebook' },
    { id: 'SL-02', platform: 'LinkedIn', url: 'https://linkedin.com/school/astu', icon: 'Linkedin' },
    { id: 'SL-03', platform: 'Website', url: 'https://astu.edu.et', icon: 'Globe' },
  ],
  contactEmail: 'contact@astu.edu.et',
  contactPhone: '+251 22 111 0370',
  address: 'Adama Science and Technology University, Adama, Ethiopia',
  copyrightText: '© 2026 Adama Science and Technology University. All rights reserved.',
};

const MOCK_GALLERY_ITEMS: GalleryMediaItem[] = [
  { id: 'M-001', title: 'AI Workshop Opening Session', type: 'Video', album: 'Workshop Gallery', status: 'Pending Review', uploadedBy: 'CSE Department', date: '2 days ago' },
  { id: 'M-002', title: '2026 Graduation Main Stage', type: 'Photo', album: 'Graduation Gallery', status: 'Approved', uploadedBy: 'Registrar Office', date: '1 week ago' },
  { id: 'M-003', title: 'Research Expo Robotics Booth', type: 'Photo', album: 'Research Gallery', status: 'Approved', uploadedBy: 'Research Directorate', date: '3 days ago' },
  { id: 'M-004', title: 'Alumni Career Day Panel', type: 'Video', album: 'Event Gallery', status: 'Pending Review', uploadedBy: 'Alumni Office', date: '5 hours ago' },
  { id: 'M-005', title: 'Campus Library Renovation', type: 'Photo', album: 'Campus Gallery', status: 'Rejected', uploadedBy: 'Public Relations', date: '1 day ago' },
  { id: 'M-006', title: 'Engineering Fair 2026', type: 'Photo', album: 'Event Gallery', status: 'Approved', uploadedBy: 'Engineering Faculty', date: '2 weeks ago' },
  { id: 'M-007', title: 'Cloud Computing Workshop', type: 'Video', album: 'Workshop Gallery', status: 'Pending Review', uploadedBy: 'ICT Directorate', date: '30 min ago' },
  { id: 'M-008', title: 'Campus Aerial Drone Footage', type: 'Video', album: 'Campus Gallery', status: 'Approved', uploadedBy: 'Marketing Team', date: '1 month ago' },
];

const MOCK_EVENTS: EventItem[] = [
  { id: 'E-001', title: 'ASTU Alumni Career Summit', kind: 'Event', category: 'Career', date: '2026-06-12', rsvps: 420, attendance: 0, status: 'Open', location: 'Main Auditorium' },
  { id: 'E-002', title: 'Cloud Computing Bootcamp', kind: 'Workshop', category: 'Technical Training', date: '2026-06-18', rsvps: 96, attendance: 0, status: 'Approval Required', location: 'CS Lab 101' },
  { id: 'E-003', title: 'Employer Roundtable', kind: 'Event', category: 'Partnership', date: '2026-06-26', rsvps: 78, attendance: 0, status: 'Open', location: 'Conference Hall A' },
  { id: 'E-004', title: 'CV and Interview Lab', kind: 'Workshop', category: 'Employability', date: '2026-05-20', rsvps: 160, attendance: 138, status: 'Closed', location: 'Career Center' },
  { id: 'E-005', title: 'AI/ML Research Symposium', kind: 'Event', category: 'Research', date: '2026-07-05', rsvps: 234, attendance: 0, status: 'Open', location: 'Engineering Complex' },
  { id: 'E-006', title: 'Grant Writing Workshop', kind: 'Workshop', category: 'Research', date: '2026-06-28', rsvps: 45, attendance: 0, status: 'Approval Required', location: 'Room 305' },
  { id: 'E-007', title: 'Graduation Ceremony 2026', kind: 'Event', category: 'Graduation', date: '2026-07-15', rsvps: 1200, attendance: 0, status: 'Open', location: 'Main Hall' },
  { id: 'E-008', title: 'Python Data Science Workshop', kind: 'Workshop', category: 'Technical Training', date: '2026-05-10', rsvps: 88, attendance: 82, status: 'Closed', location: 'CS Lab 102' },
];

const MOCK_WORKFLOW_ITEMS: WorkflowItem[] = [
  { id: 'w-1', title: 'Career Fair 2026 Registration Open', type: 'Event', author: 'Event Coordinator', submittedAt: '2 hours ago', status: 'Pending Review', priority: 'High', reviewer: 'Content Manager', stage: 1, totalStages: 3, comments: 0, dueDate: 'Today, 5 PM' },
  { id: 'w-2', title: 'Campus Tour 2026 Photo Album', type: 'Gallery', author: 'Dept Head', submittedAt: '3 days ago', status: 'In Review', priority: 'Normal', reviewer: 'Sarah Mengistu', stage: 2, totalStages: 3, comments: 3, dueDate: 'Tomorrow' },
  { id: 'w-3', title: 'Tracer Survey Wave 3 Banner', type: 'Page', author: 'Content Manager', submittedAt: '5 hours ago', status: 'Changes Requested', priority: 'Normal', reviewer: 'Marketing Lead', stage: 1, totalStages: 2, comments: 7, dueDate: 'Jun 12' },
  { id: 'w-4', title: 'Alumni Spotlight: Solomon Bekele', type: 'Post', author: 'Content Manager', submittedAt: '1 day ago', status: 'Approved', priority: 'High', reviewer: 'Editor in Chief', stage: 3, totalStages: 3, comments: 2, dueDate: '—' },
  { id: 'w-5', title: 'Research Lab Safety Guidelines', type: 'Page', author: 'Research Directorate', submittedAt: '4 days ago', status: 'Pending Review', priority: 'Urgent', reviewer: 'Public Relations', stage: 1, totalStages: 2, comments: 0, dueDate: 'Today' },
];

const MOCK_GOVERNANCE_ANNOUNCEMENTS: GovernanceAnnouncement[] = [
  { id: 'A-001', title: '2026 Tracer Study Wave Opens', audience: 'Alumni', status: 'Pinned', attachment: 'PDF', owner: 'Alumni Office', updated: '2 hours ago', views: 1240 },
  { id: 'A-002', title: 'New Engineering Lab Opens for Research', audience: 'Public', status: 'Published', attachment: 'None', owner: 'Engineering Faculty', updated: 'Yesterday', views: 892 },
  { id: 'A-003', title: 'System Maintenance: June 15 (2AM–6AM)', audience: 'Internal', status: 'Scheduled', attachment: 'None', owner: 'ICT Support', updated: '3 days ago', views: 0 },
  { id: 'A-004', title: 'Emergency Campus Security Notice', audience: 'Emergency', status: 'Published', attachment: 'PDF', owner: 'Security Office', updated: '30 min ago', views: 3200 },
  { id: 'A-005', title: 'Employer Partner Registration Now Open', audience: 'Employer', status: 'Draft', attachment: 'None', owner: 'Employer Relations', updated: '1 week ago', views: 0 },
];

const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  { id: 'P-001', title: 'Looking for alumni in the renewable energy sector', author: 'Selam T.', reports: 0, action: 'Approved', approved: true, pinned: true, date: '1 hour ago' },
  { id: 'P-002', title: 'Inappropriate content flagged by 3 users', author: 'Unknown User', reports: 3, action: 'Remove', approved: false, pinned: false, date: '2 hours ago' },
  { id: 'P-003', title: 'ASTU Alumni meetup in Addis Ababa — June 20', author: 'Dawit K.', reports: 0, action: 'Approved', approved: true, pinned: false, date: 'Yesterday' },
];

const MOCK_CMS_SETTINGS: CmsSettingsData = {
  siteName: 'ASTU Alumni Management System',
  tagline: 'Connecting excellence to industry',
  siteUrl: 'https://astu-ams.et',
  contactEmail: 'admin@astu-ams.et',
  newsletterEnabled: true,
  commentsEnabled: true,
  autoPublish: false,
  maintenanceMode: false,
  emailNotifications: true,
  twoFactorRequired: false,
};

const MOCK_HOMEPAGE_DATA: HomepageData = {
  welcomeMessage: 'Welcome to the ASTU Alumni Management System, a digital bridge between graduates, employers, departments, and university services.',
  heroSlides: [
    { id: 'HS-1', image: '/src/assets/imgs/astu-building.jpg', tagline: 'Quality Assurance & Accreditation', title: "Connecting ASTU's Excellence to the Global Industry", description: 'A unified gateway for alumni, employers, and departments to foster professional growth, talent acquisition, and academic innovation at Adama Science and Technology University. Join 1,238+ alumni already connected.', active: true },
    { id: 'HS-2', image: '/src/assets/imgs/campus-2.jpeg', tagline: 'Enterprise Networking & Placement', title: 'Empowering ASTU Graduates in Modern Workspaces', description: 'Discover corporate partners, publish practical career openings, and track your employment outcomes. Building bridges between classroom theory and real-world placement across 5 fields of study.', active: true },
    { id: 'HS-3', image: 'https://images.unsplash.com/photo-1562774053-701939374585', tagline: 'Academic Innovation & Tracer Feedback', title: 'Coordinating Strategic Tracer Studies & Skill Gaps', description: 'Enabling department heads and partner companies to identify technological skill gaps directly from the workforce, securing university accreditation outcomes.', active: true },
  ],
  impactStats: [
    { id: 'IS-1', label: 'Registered Alumni Members', value: '1,238', suffix: '+', detail: 'Registered in the alumni network', icon: 'Users', active: true },
    { id: 'IS-2', label: 'Partner Organizations', value: '500', suffix: '+', detail: 'Hiring, internships, and feedback', icon: 'Building2', active: true },
    { id: 'IS-3', label: 'Employment Rate', value: '87', suffix: '%', detail: 'Graduate employment rate', icon: 'LineChart', active: true },
    { id: 'IS-4', label: 'Digital Requests', value: '6K', suffix: '+', detail: 'Transcript and certificate requests', icon: 'FileCheck2', active: true },
    { id: 'IS-5', label: 'Engagement Hub', value: '24/7', suffix: '', detail: 'Always-on alumni engagement', icon: 'MessageSquareText', active: true },
  ],
  portals: [
    { id: 'SP-1', title: 'Alumni', icon: 'Users', points: ['Create and maintain your professional profile.', 'Access verified job listings and internship opportunities.', 'Complete tracer surveys to guide curriculum development.', 'Mentor current students and connect with peers.'], cta: 'Access Alumni Portal', route: '/info/alumni-portal', active: true },
    { id: 'SP-2', title: 'Employers', icon: 'Briefcase', points: ['Post employment opportunities for ASTU graduates.', 'Search alumni by expertise, skills, and department.', 'Provide feedback to enhance curriculum relevance.'], cta: 'Partner With ASTU', route: '/info/employer-portal', active: true },
    { id: 'SP-3', title: 'Departments', icon: 'LineChart', points: ['Monitor graduate employment outcomes and metrics.', 'Identify skill gaps through employer analytics.', 'Generate accreditation-ready reports.'], cta: 'View Department Analytics', route: '/info/department-portal', active: true },
    { id: 'SP-4', title: 'Registrar', icon: 'FileCheck2', points: ['Validate alumni credentials against SIS records.', 'Process transcript and certificate requests.', 'Send tracer study reminders and audit notifications.'], cta: 'Open Registrar Portal', route: '/info/registrar-portal', active: true },
    { id: 'SP-5', title: 'Administrator', icon: 'LockKeyhole', points: ['Manage users, roles, and department records.', 'Monitor system logs, backups, and security protocols.', 'Oversee institutional analytics and accreditation reports.'], cta: 'Admin Console', route: '/admin', active: true },
  ],
  campusLife: [
    { id: 'CL-1', title: 'Events and Activities', campus: 'Main Campus', description: 'Career expos, alumni reunions, workshops, chapter meetings, and community programs.', image: '/src/assets/imgs/campus-2.jpeg', action: 'View Events', active: true },
    { id: 'CL-2', title: 'Facilities', campus: 'Innovation Spaces', description: 'Laboratories, research centers, libraries, student services, and employer interview rooms.', image: '/src/assets/images/electriclabs.jpeg', action: 'Explore Facilities', active: true },
    { id: 'CL-3', title: 'ASTU Museums & Gallery', campus: 'Campus Gallery', description: 'Research showcases, graduation moments, campus photography, and public video archives.', image: '/src/assets/images/arc.jpg', action: 'View Gallery', active: true },
  ],
  campuses: [
    { id: 'CM-1', name: 'Main Campus', description: 'Central hub for alumni services, registrar workflows, and institutional engagement.', image: '/src/assets/imgs/astu-building.jpg', active: true },
    { id: 'CM-2', name: 'Engineering Labs', description: 'Applied research, workshops, innovation programs, and industry-linked training.', image: '/src/assets/images/electriclabs.jpeg', active: true },
    { id: 'CM-3', name: 'Graduation & Events Hall', description: 'Ceremonies, career fairs, alumni awards, and university achievement programs.', image: '/src/assets/images/gc7.jpg', active: true },
    { id: 'CM-4', name: 'Research Collaboration Center', description: 'Research publications, industry projects, and department KPI evidence.', image: '/src/assets/images/arc.jpg', active: true },
  ],
  gallery: [
    { id: 'GI-1', title: 'ASTU Main Campus', src: '/src/assets/imgs/astu-building.jpg', active: true },
    { id: 'GI-2', title: 'Innovation and Collaboration', src: '/src/assets/imgs/campus-2.jpeg', active: true },
    { id: 'GI-3', title: 'ASTU Alumni Identity', src: '/src/assets/imgs/astu-logo.jpeg', active: true },
  ],
  videos: [
    { id: 'VI-1', title: 'Career Expo Highlights', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80', active: true },
    { id: 'VI-2', title: 'Research & Innovation Forum', image: '/src/assets/images/arc.jpg', active: true },
    { id: 'VI-3', title: 'Graduation Ceremony Replay', image: '/src/assets/images/gc7.jpg', active: true },
  ],
  events: [
    { id: 'EV-1', title: 'ASTU Alumni Carnival 2026', date: 'April 25-26, 2026', location: 'Main Campus', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', active: true },
    { id: 'EV-2', title: 'DAAD Alumni Workshop', date: 'March 2026', location: 'ASTU Research Center', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', active: true },
  ],
  workshops: [
    { id: 'WS-1', title: 'AI for Engineering Research', date: 'June 14, 2026', seats: '120 seats', focus: 'Research & Innovation', active: true },
    { id: 'WS-2', title: 'CV Builder and Interview Lab', date: 'June 20, 2026', seats: '80 seats', focus: 'Career Readiness', active: true },
    { id: 'WS-3', title: 'Startup Finance for Alumni', date: 'July 4, 2026', seats: '60 seats', focus: 'Entrepreneurship', active: true },
  ],
  newsItems: [
    { id: 'NW-1', title: 'New Engineering Lab Inaugurated', date: 'May 28, 2026', active: true },
    { id: 'NW-2', title: 'ASTU Research Grant Winners', date: 'May 25, 2026', active: true },
    { id: 'NW-3', title: 'Annual Career Expo Announced', date: 'May 20, 2026', active: true },
  ],
  announcements: [
    { id: 'AN-1', title: 'ASTU Alumni Association Inspires Graduating Class with Career Tips!', date: 'March 7, 2025', type: 'Alumni Announcement', active: true },
    { id: 'AN-2', title: 'ASTU hosts a five-day DAAD Alumni workshop', date: 'March 7, 2025', type: 'Employer Announcement', active: true },
    { id: 'AN-3', title: 'ASTU alumni serve as model United Nations secretariats!', date: 'January 7, 2025', type: 'Alumni Achievement', active: true },
    { id: 'AN-4', title: 'Tracer Study 2026 response window is open', date: 'May 31, 2026', type: 'Alumni Announcement', active: true },
    { id: 'AN-5', title: 'Call for employer partners: campus recruitment week', date: 'May 28, 2026', type: 'Employer Announcement', active: true },
  ],
  stories: [
    { id: 'SS-1', name: 'Abebe Yosef', role: 'Software Engineer', text: 'I landed my new role after using ASTU-AMS job matching and mentorship support. Thank you ASTU community.', image: '/src/assets/images/State-M.jpg', active: true },
    { id: 'SS-2', name: 'Bekele Kebede', role: 'Employer Partner', text: 'Hiring from ASTU-AMS has been efficient. We found strong engineering candidates with the right practical skills.', image: '/src/assets/images/gc7.jpg', active: true },
    { id: 'SS-3', name: 'Helina Sileshi', role: 'Mentor & Alumni', text: 'Proud to mentor ASTU students through the AMS platform. The next generation of innovators is ready!', image: '/src/assets/images/arc.jpg', active: true },
  ],
  partners: [
    { id: 'PT-1', name: 'Ethio Telecom', active: true },
    { id: 'PT-2', name: 'INSA', active: true },
    { id: 'PT-3', name: 'Ethiopian Airlines', active: true },
    { id: 'PT-4', name: 'Safaricom', active: true },
    { id: 'PT-5', name: 'Huawei', active: true },
    { id: 'PT-6', name: 'Commercial Bank of Ethiopia', active: true },
  ],
  testimonials: [
    { id: 'TT-1', quote: 'ASTU-AMS gave our department the evidence we needed for skill-gap review.', by: 'Department Head', active: true },
    { id: 'TT-2', quote: 'The candidate search and feedback tools improved our campus recruitment cycle.', by: 'Employer Partner', active: true },
    { id: 'TT-3', quote: 'I found mentorship, events, and job matches without leaving the alumni portal.', by: 'ASTU Alumna', active: true },
  ],
  faq: [
    { id: 'FQ-1', question: 'Who can use ASTU-AMS?', answer: 'Verified alumni, employers, registrar teams, departments, and system administrators each access role-specific services.', active: true },
    { id: 'FQ-2', question: 'How are tracer studies used?', answer: 'Responses support employment analytics, skill-gap reviews, curriculum updates, and accreditation evidence.', active: true },
    { id: 'FQ-3', question: 'Can employers register events?', answer: 'Employer partners can coordinate job posts, internships, campus recruitment events, interviews, and feedback reports.', active: true },
    { id: 'FQ-4', question: 'How do I request a transcript?', answer: 'Log into your alumni profile, navigate to "Document Requests", and submit a digital request through the Registrar portal.', active: true },
    { id: 'FQ-5', question: 'What is the Tracer Study?', answer: 'A longitudinal survey that tracks graduate employment outcomes at 6, 12, and 24-month intervals for accreditation.', active: true },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE FUNCTIONS (Integration Stubs)
// ═══════════════════════════════════════════════════════════════════════════

// ── Content List ─────────────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getContentList(params) → GET /api/cms/content */
export async function fetchContentList(_params?: ContentListParams): Promise<ContentItem[]> {
  return Promise.resolve(MOCK_CONTENT_ITEMS);
}

/** TODO: Replace with: await adminApi.createContent(payload) → POST /api/cms/content */
export async function createContent(payload: CreateContentPayload): Promise<ContentItem> {
  const newItem: ContentItem = {
    id: uid('C'),
    title: payload.title,
    type: payload.type,
    status: 'Draft',
    excerpt: payload.excerpt,
    author: 'Current User',
    updatedAt: 'Just now',
    views: 0,
    tags: payload.tags || [],
    pinned: false,
    featured: false,
    language: payload.language || 'EN',
    seoScore: 0,
  };
  return Promise.resolve(newItem);
}

/** TODO: Replace with: await adminApi.updateContent(id, partial) → PATCH /api/cms/content/:id */
export async function updateContent(id: string, partial: Partial<ContentItem>): Promise<ContentItem> {
  const existing = MOCK_CONTENT_ITEMS.find(i => i.id === id) || MOCK_CONTENT_ITEMS[0];
  return Promise.resolve({ ...existing, ...partial, updatedAt: 'Just now' });
}

/** TODO: Replace with: await adminApi.deleteContent(id) → DELETE /api/cms/content/:id */
export async function deleteContent(_id: string): Promise<void> {
  return Promise.resolve();
}

/** TODO: Replace with: await adminApi.publishContent(id) → POST /api/cms/content/:id/publish */
export async function publishContent(_id: string): Promise<void> {
  return Promise.resolve();
}

/** TODO: Replace with: await adminApi.scheduleContent(id, date, time) → POST /api/cms/content/:id/schedule */
export async function scheduleContent(_id: string, _date: string, _time: string): Promise<void> {
  return Promise.resolve();
}

/** TODO: Replace with: await adminApi.getCmsDashboardStats() → GET /api/cms/dashboard */
export async function fetchCmsDashboardStats(): Promise<{ stats: CmsDashboardStats; recentContent: ContentItem[] }> {
  const items = MOCK_CONTENT_ITEMS;
  const stats: CmsDashboardStats = {
    published: items.filter(i => i.status === 'Published').length,
    draft: items.filter(i => i.status === 'Draft').length,
    scheduled: items.filter(i => i.status === 'Scheduled').length,
    needsReview: items.filter(i => i.status === 'Needs Review').length,
    totalViews: items.reduce((sum, i) => sum + (i.views || 0), 0),
    total: items.length,
  };
  return Promise.resolve({ stats, recentContent: items.slice(0, 7) });
}

// ── Homepage Management ───────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getHomepageContent() → GET /api/cms/homepage */
export async function fetchHomepageContent(): Promise<HomepageData> {
  return Promise.resolve(MOCK_HOMEPAGE_DATA);
}

/** TODO: Replace with: await adminApi.saveHomepageSection(section, data) → PATCH /api/cms/homepage/:section */
export async function saveHomepageSection<K extends keyof HomepageData>(
  _section: K,
  _data: HomepageData[K],
): Promise<void> {
  return Promise.resolve();
}

// ── Latest News ───────────────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getNewsList() → GET /api/cms/news */
export async function fetchNewsList(): Promise<LatestNewsItem[]> {
  return Promise.resolve(MOCK_NEWS_ITEMS);
}

/** TODO: Replace with: await adminApi.createNews(payload) → POST /api/cms/news */
export async function createNews(payload: Partial<LatestNewsItem>): Promise<LatestNewsItem> {
  return Promise.resolve({ id: uid('N'), title: '', summary: '', date: new Date().toISOString().slice(0, 10), category: 'Campus', status: 'Draft', views: 0, image: '', ...payload });
}

/** TODO: Replace with: await adminApi.updateNews(id, partial) → PATCH /api/cms/news/:id */
export async function updateNews(id: string, partial: Partial<LatestNewsItem>): Promise<LatestNewsItem> {
  const existing = MOCK_NEWS_ITEMS.find(n => n.id === id) || MOCK_NEWS_ITEMS[0];
  return Promise.resolve({ ...existing, ...partial });
}

/** TODO: Replace with: await adminApi.deleteNews(id) → DELETE /api/cms/news/:id */
export async function deleteNews(_id: string): Promise<void> {
  return Promise.resolve();
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getFaqList() → GET /api/cms/faq */
export async function fetchFaqList(): Promise<FaqEntry[]> {
  return Promise.resolve(MOCK_FAQS);
}

/** TODO: Replace with: await adminApi.createFaq(payload) → POST /api/cms/faq */
export async function createFaq(payload: Partial<FaqEntry>): Promise<FaqEntry> {
  return Promise.resolve({ id: uid('FQ'), question: '', answer: '', category: 'General', order: 1, ...payload });
}

/** TODO: Replace with: await adminApi.updateFaq(id, partial) → PATCH /api/cms/faq/:id */
export async function updateFaq(id: string, partial: Partial<FaqEntry>): Promise<FaqEntry> {
  const existing = MOCK_FAQS.find(f => f.id === id) || MOCK_FAQS[0];
  return Promise.resolve({ ...existing, ...partial });
}

/** TODO: Replace with: await adminApi.deleteFaq(id) → DELETE /api/cms/faq/:id */
export async function deleteFaq(_id: string): Promise<void> {
  return Promise.resolve();
}

// ── Footer ────────────────────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getFooterData() → GET /api/cms/footer */
export async function fetchFooterData(): Promise<FooterData> {
  return Promise.resolve(MOCK_FOOTER_DATA);
}

/** TODO: Replace with: await adminApi.saveFooterData(data) → PUT /api/cms/footer */
export async function saveFooterData(_data: FooterData): Promise<void> {
  return Promise.resolve();
}

// ── Gallery Management ────────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getGalleryItems() → GET /api/cms/gallery */
export async function fetchGalleryItems(): Promise<GalleryMediaItem[]> {
  return Promise.resolve(MOCK_GALLERY_ITEMS);
}

/** TODO: Replace with: await adminApi.approveGalleryItem(id) → POST /api/cms/gallery/:id/approve */
export async function approveGalleryItem(_id: string): Promise<void> {
  return Promise.resolve();
}

/** TODO: Replace with: await adminApi.rejectGalleryItem(id) → POST /api/cms/gallery/:id/reject */
export async function rejectGalleryItem(_id: string): Promise<void> {
  return Promise.resolve();
}

/** TODO: Replace with: await adminApi.deleteGalleryItem(id) → DELETE /api/cms/gallery/:id */
export async function deleteGalleryItem(_id: string): Promise<void> {
  return Promise.resolve();
}

// ── Events & Workshops ────────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getEvents() → GET /api/cms/events */
export async function fetchEvents(): Promise<EventItem[]> {
  return Promise.resolve(MOCK_EVENTS);
}

/** TODO: Replace with: await adminApi.createEvent(payload) → POST /api/cms/events */
export async function createEvent(payload: Partial<EventItem>): Promise<EventItem> {
  return Promise.resolve({ id: uid('E'), title: '', kind: 'Event', category: 'Career', date: '', rsvps: 0, attendance: 0, status: 'Open', location: '', ...payload });
}

/** TODO: Replace with: await adminApi.updateEvent(id, partial) → PATCH /api/cms/events/:id */
export async function updateEvent(id: string, partial: Partial<EventItem>): Promise<EventItem> {
  const existing = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  return Promise.resolve({ ...existing, ...partial });
}

/** TODO: Replace with: await adminApi.deleteEvent(id) → DELETE /api/cms/events/:id */
export async function deleteEvent(_id: string): Promise<void> {
  return Promise.resolve();
}

// ── Approval Workflow ─────────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getWorkflowItems() → GET /api/cms/approvals */
export async function fetchWorkflowItems(): Promise<WorkflowItem[]> {
  return Promise.resolve(MOCK_WORKFLOW_ITEMS);
}

/** TODO: Replace with: await adminApi.approveWorkflowItem(id) → POST /api/cms/approvals/:id/approve */
export async function approveWorkflowItem(_id: string): Promise<void> {
  return Promise.resolve();
}

/** TODO: Replace with: await adminApi.rejectWorkflowItem(id, reason) → POST /api/cms/approvals/:id/reject */
export async function rejectWorkflowItem(_id: string, _reason?: string): Promise<void> {
  return Promise.resolve();
}

// ── Content Governance ────────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getGovernanceAnnouncements() → GET /api/cms/governance/announcements */
export async function fetchGovernanceAnnouncements(): Promise<GovernanceAnnouncement[]> {
  return Promise.resolve(MOCK_GOVERNANCE_ANNOUNCEMENTS);
}

/** TODO: Replace with: await adminApi.getCommunityPosts() → GET /api/cms/governance/posts */
export async function fetchCommunityPosts(): Promise<CommunityPost[]> {
  return Promise.resolve(MOCK_COMMUNITY_POSTS);
}

/** TODO: Replace with: await adminApi.moderateCommunityPost(id, action) → POST /api/cms/governance/posts/:id/moderate */
export async function moderateCommunityPost(_id: string, _action: 'approve' | 'remove'): Promise<void> {
  return Promise.resolve();
}

// ── CMS Settings ──────────────────────────────────────────────────────────────

/** TODO: Replace with: await adminApi.getCmsSettings() → GET /api/cms/settings */
export async function fetchCmsSettings(): Promise<CmsSettingsData> {
  return Promise.resolve(MOCK_CMS_SETTINGS);
}

/** TODO: Replace with: await adminApi.saveCmsSettings(data) → PUT /api/cms/settings */
export async function saveCmsSettings(_data: CmsSettingsData): Promise<void> {
  return Promise.resolve();
}
