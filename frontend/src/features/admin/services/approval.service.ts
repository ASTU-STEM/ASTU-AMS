import { ContentCardItem } from '../components/ContentCard';
import contentService from './content.service';

const STORAGE_KEY = 'astu_ams_workflow_items';
const STAGE_CONFIG_KEY = 'astu_ams_workflow_stage_configs';

export type WorkflowStatus = 'Pending Review' | 'In Review' | 'Changes Requested' | 'Approved' | 'Rejected' | 'Published';
export type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface WorkflowComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  type: 'comment' | 'change_request' | 'approval' | 'rejection' | 'published';
}

export interface WorkflowStageConfig {
  stage: number;
  name: string;
  role: string;
  assignedTo: string;
  slaHours: number;
}

export interface WorkflowItem {
  id: string;
  title: string;
  type: string;
  author: string;
  department?: string;
  content?: string;
  excerpt?: string;
  submittedAt: string;
  status: WorkflowStatus;
  priority: Priority;
  reviewer: string;
  stage: number;
  totalStages: number;
  comments: WorkflowComment[];
  dueDate: string;
  contentId?: string;
  // Publishing & Broadcast Metadata
  eventDate?: string;
  eventLocation?: string;
  targetAudience?: string;
  approvedByOfficer?: string;
  publishedAt?: string;
  isBroadcast?: boolean;
}

export const defaultStageConfigs: WorkflowStageConfig[] = [
  {
    stage: 1,
    name: 'Initial Review & Fact-Checking',
    role: 'Department Coordinator',
    assignedTo: 'Content Manager',
    slaHours: 24,
  },
  {
    stage: 2,
    name: 'Editorial & Brand Compliance',
    role: 'Alumni Relations Officer',
    assignedTo: 'Alumni Relations Officer',
    slaHours: 48,
  },
  {
    stage: 3,
    name: 'Final Director Signoff',
    role: 'Director of Communications',
    assignedTo: 'Editor in Chief',
    slaHours: 24,
  },
];

export const defaultWorkflowItems: WorkflowItem[] = [
  {
    id: 'w-pub-carnival',
    title: 'ASTU Alumni Carnival & Grand Homecoming 2026',
    type: 'Event',
    author: 'Alumni Relations Officer',
    department: 'Alumni Relations Directorate',
    content: `Celebrating three decades of ASTU engineering heritage! Taking place on April 25 and 26, 2026 at the ASTU Main Campus in Adama.
A flagship homecoming uniting graduates, university leadership, academic researchers, and 500+ enterprise corporate partners.
Key activities:
• Keynote addresses from distinguished alumni and industry leaders
• Enterprise Career Expo with 80+ companies
• Research & Startup Innovation Showcase
• Regional Chapter Networking Dinner`,
    excerpt: 'Celebrating three decades of ASTU heritage! Flagship celebration on April 25-26, 2026 at ASTU Main Campus uniting 1,200+ attendees.',
    submittedAt: '1 day ago',
    status: 'Published',
    priority: 'High',
    reviewer: 'Alumni Relations Officer',
    approvedByOfficer: 'Alumni Relations Officer',
    publishedAt: 'Today',
    eventDate: 'April 25-26, 2026',
    eventLocation: 'ASTU Main Campus, Adama',
    targetAudience: 'All Actors',
    isBroadcast: true,
    stage: 3,
    totalStages: 3,
    comments: [
      {
        id: 'c-pub-1',
        author: 'Alumni Relations Officer',
        text: 'Approved and published to live website and all actor dashboard hero portals.',
        createdAt: 'Just now',
        type: 'published',
      },
    ],
    dueDate: 'Apr 25, 2026',
  },
  {
    id: 'w-pub-career',
    title: 'Annual Enterprise Career Fair & Internship Expo 2026',
    type: 'Event',
    author: 'Career & Placement Center',
    department: 'Career & Placement Center',
    content: `ASTU Annual Career & Internship Fair 2026 will bring 80+ enterprise employers directly to campus.
Dates: May 14, 2026.
Target audience: Graduating engineering seniors and alumni seeking employment.
Early registration ensures guaranteed interview slots with leading tech and industrial partners.`,
    excerpt: 'Over 80 enterprise partners visiting ASTU campus for graduate recruitment, guaranteed interview slots, and technical hiring.',
    submittedAt: '2 days ago',
    status: 'Published',
    priority: 'Urgent',
    reviewer: 'Alumni Relations Officer',
    approvedByOfficer: 'Alumni Relations Officer',
    publishedAt: 'Yesterday',
    eventDate: 'May 14, 2026',
    eventLocation: 'ASTU Innovation Complex, Hall B',
    targetAudience: 'All Actors',
    isBroadcast: true,
    stage: 3,
    totalStages: 3,
    comments: [
      {
        id: 'c-pub-2',
        author: 'Alumni Relations Officer',
        text: 'Approved for global campus broadcast.',
        createdAt: 'Yesterday',
        type: 'published',
      },
    ],
    dueDate: 'May 14, 2026',
  },
  {
    id: 'w-reg-1',
    title: 'Official Academic Senate Degree Clearance Notice 2026',
    type: 'Announcement',
    author: 'Office of the Registrar',
    department: 'Office of the Registrar',
    content: `Official administrative directive from the Office of the Registrar regarding degree audit clearance, transcript issuance windows, and accreditation verifications.
All graduating candidates and department heads must finalize clearance protocols by May 10, 2026.
Alumni requiring certified digital transcripts for multinational employment verification must submit requests via the digital document portal.`,
    excerpt: 'Mandatory degree audit clearance, transcript issuance windows, and accreditation verification schedule for 2026 graduating batches.',
    submittedAt: '30 min ago',
    status: 'Pending Review',
    priority: 'Urgent',
    reviewer: 'Alumni Relations Officer',
    targetAudience: 'All Actors',
    stage: 1,
    totalStages: 2,
    comments: [
      {
        id: 'c-reg-1',
        author: 'Office of the Registrar',
        text: 'Submitted by Office of the Registrar for Alumni Officer review and cross-dashboard publication.',
        createdAt: '30 min ago',
        type: 'comment',
      },
    ],
    dueDate: 'Today, 5 PM',
  },
  {
    id: 'w-2',
    title: 'Campus Tour 2026 Photo Album',
    type: 'Gallery',
    author: 'Dept Head',
    department: 'Mechanical Engineering',
    content: '18 high-resolution photo submissions capturing students and international guests exploring the new mechatronics lab.',
    excerpt: 'Mechatronics laboratory visit photo series for the ASTU alumni public gallery.',
    submittedAt: '3 days ago',
    status: 'In Review',
    priority: 'Normal',
    reviewer: 'Sarah Mengistu',
    stage: 2,
    totalStages: 3,
    comments: [
      {
        id: 'c-2',
        author: 'Content Manager',
        text: 'Initial review passed. Sent to communications specialist for brand guidelines check.',
        createdAt: '1 day ago',
        type: 'approval',
      },
      {
        id: 'c-3',
        author: 'Sarah Mengistu',
        text: 'Please confirm release consent for photo #4 featuring visiting delegates.',
        createdAt: '5 hours ago',
        type: 'change_request',
      },
    ],
    dueDate: 'Tomorrow',
  },
  {
    id: 'w-3',
    title: 'Tracer Survey Wave 3 Banner & Directives',
    type: 'Page',
    author: 'Content Manager',
    department: 'Institutional Research & Quality Assurance',
    content: 'National tracer survey campaign banner and questions targeting the 2024 and 2025 graduating engineering cohorts.',
    excerpt: 'Tracer survey cohort instructions for ETA accreditation compliance.',
    submittedAt: '5 hours ago',
    status: 'Changes Requested',
    priority: 'Normal',
    reviewer: 'Marketing Lead',
    stage: 1,
    totalStages: 2,
    comments: [
      {
        id: 'c-4',
        author: 'Marketing Lead',
        text: 'The QR code destination link needs to point to the secure registrar tracer endpoint instead of the public overview page.',
        createdAt: '3 hours ago',
        type: 'change_request',
      },
    ],
    dueDate: 'Jun 12',
  },
  {
    id: 'w-4',
    title: 'Alumni Spotlight: Solomon Bekele, Chief Robotics Engineer',
    type: 'Post',
    author: 'Content Manager',
    department: 'Alumni Relations Directorate',
    content: `Celebrating Solomon Bekele (Class of 2019, Electromechanical Engineering). Solomon recently led the deployment of automated smart grid systems across regional power facilities.
His inspirational interview covers practical capstone preparation and advice for graduating seniors.`,
    excerpt: 'Class of 2019 electromechanical engineering alumnus spearheads automated smart grid engineering.',
    submittedAt: '1 day ago',
    status: 'Approved',
    priority: 'High',
    reviewer: 'Editor in Chief',
    stage: 3,
    totalStages: 3,
    comments: [
      {
        id: 'c-5',
        author: 'Editor in Chief',
        text: 'Verified credentials and quote permissions. Approved for official publication.',
        createdAt: '2 hours ago',
        type: 'approval',
      },
    ],
    dueDate: '—',
  },
  {
    id: 'w-5',
    title: 'Applied Engineering Lab Safety Guidelines 2026',
    type: 'Page',
    author: 'Research Directorate',
    department: 'Applied Sciences',
    content: 'Mandatory workplace protocol updates for chemical and high-voltage laboratories across campus.',
    excerpt: 'Updated safety protocols for graduate researchers and visiting corporate lab partners.',
    submittedAt: '4 days ago',
    status: 'Pending Review',
    priority: 'Urgent',
    reviewer: 'Public Relations',
    stage: 1,
    totalStages: 2,
    comments: [],
    dueDate: 'Today',
  },
  {
    id: 'w-6',
    title: 'Enterprise Partnership Summit Report & MoUs',
    type: 'Post',
    author: 'Industry Liaison',
    department: 'Corporate Relations Directorate',
    content: 'Executive summary detailing agreements signed with Ethio Telecom, Ethiopian Airlines, and INSA regarding graduate internships.',
    excerpt: 'Official signing summary of tri-party graduate recruitment agreements.',
    submittedAt: '6 hours ago',
    status: 'In Review',
    priority: 'Normal',
    reviewer: 'Content Manager',
    stage: 1,
    totalStages: 3,
    comments: [
      {
        id: 'c-6',
        author: 'Content Manager',
        text: 'Under review by institutional legal counsel.',
        createdAt: '4 hours ago',
        type: 'comment',
      },
    ],
    dueDate: 'Jun 13',
  },
  {
    id: 'w-7',
    title: 'Outdated Department Procurement Policy Notice',
    type: 'Page',
    author: 'HR Office',
    department: 'Administrative Services',
    content: 'Proposed modifications to equipment procurement guidelines for senior student project teams.',
    excerpt: 'Procurement policy update superseded by academic senate decree.',
    submittedAt: '2 weeks ago',
    status: 'Rejected',
    priority: 'Low',
    reviewer: 'Legal',
    stage: 2,
    totalStages: 2,
    comments: [
      {
        id: 'c-7',
        author: 'Legal',
        text: 'Superseded by Academic Senate Circular #2026/04. Submission rejected.',
        createdAt: '1 week ago',
        type: 'rejection',
      },
    ],
    dueDate: '—',
  },
  {
    id: 'w-8',
    title: 'New Homepage Hero Banner Campaign',
    type: 'Page',
    author: 'Content Manager',
    department: 'Communications & Web Team',
    content: 'Updated high-resolution photography and revised tagline: "Connecting ASTU Excellence to the Global Industry".',
    excerpt: 'Proposed imagery and button copy revisions for the flagship public homepage carousel.',
    submittedAt: '30 min ago',
    status: 'Pending Review',
    priority: 'Urgent',
    reviewer: 'Marketing Lead',
    stage: 1,
    totalStages: 3,
    comments: [],
    dueDate: 'Today',
  },
];

export const approvalService = {
  getItems(): WorkflowItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    this.saveItems(defaultWorkflowItems);
    return defaultWorkflowItems;
  },

  saveItems(items: WorkflowItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
    window.dispatchEvent(new Event('astu-cms-approval-changed'));
  },

  getItemById(id: string): WorkflowItem | undefined {
    return this.getItems().find((i) => i.id === id);
  },

  getStageConfigs(): WorkflowStageConfig[] {
    try {
      const stored = localStorage.getItem(STAGE_CONFIG_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return defaultStageConfigs;
  },

  saveStageConfigs(configs: WorkflowStageConfig[]): void {
    try {
      localStorage.setItem(STAGE_CONFIG_KEY, JSON.stringify(configs));
    } catch {}
  },

  advanceStage(id: string, reviewer = 'Content Manager', commentText?: string): WorkflowItem | undefined {
    const items = this.getItems();
    const item = items.find((i) => i.id === id);
    if (!item) return undefined;

    const nextStage = item.stage + 1;
    const isFinalStage = nextStage >= item.totalStages;

    item.stage = Math.min(nextStage, item.totalStages);
    item.status = isFinalStage ? 'Approved' : 'In Review';

    const stageConfigs = this.getStageConfigs();
    const nextConfig = stageConfigs.find((c) => c.stage === item.stage);
    if (nextConfig) {
      item.reviewer = nextConfig.assignedTo;
    }

    const logText = commentText || (isFinalStage ? `Final approval granted by ${reviewer}. Ready to publish.` : `Stage ${item.stage - 1} approved by ${reviewer}. Advanced to Stage ${item.stage}.`);

    item.comments.push({
      id: `c-${Date.now()}`,
      author: reviewer,
      text: logText,
      createdAt: 'Just now',
      type: 'approval',
    });

    this.saveItems(items);
    return item;
  },

  requestChanges(id: string, reason: string, reviewer = 'Reviewer'): WorkflowItem | undefined {
    const items = this.getItems();
    const item = items.find((i) => i.id === id);
    if (!item) return undefined;

    item.status = 'Changes Requested';
    item.comments.push({
      id: `c-${Date.now()}`,
      author: reviewer,
      text: reason || 'Modifications and corrections requested before this item can proceed.',
      createdAt: 'Just now',
      type: 'change_request',
    });

    this.saveItems(items);
    return item;
  },

  publishItem(id: string, reviewer = 'Alumni Relations Officer'): WorkflowItem | undefined {
    const items = this.getItems();
    const item = items.find((i) => i.id === id);
    if (!item) return undefined;

    const pubDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    item.status = 'Published';
    item.stage = item.totalStages;
    item.approvedByOfficer = reviewer || 'Alumni Relations Officer';
    item.publishedAt = pubDate;
    item.isBroadcast = true;
    item.comments.push({
      id: `c-${Date.now()}`,
      author: reviewer,
      text: `Approved and published by ${reviewer}. Broadcast live across all actor dashboard hero banners.`,
      createdAt: 'Just now',
      type: 'published',
    });

    // If item links to a real content item in contentService, publish it there too!
    if (item.contentId) {
      try {
        const contentItems = contentService.getItems();
        const found = contentItems.find((c) => c.id === item.contentId);
        if (found) {
          found.status = 'Published';
          found.publishedAt = pubDate;
          contentService.saveItems(contentItems);
        }
      } catch {}
    }

    this.saveItems(items);
    // Dispatch real-time cross-actor broadcast update event
    window.dispatchEvent(new CustomEvent('astu-broadcast-announcement-updated', { detail: item }));
    return item;
  },

  getPublishedBroadcasts(): WorkflowItem[] {
    return this.getItems().filter((i) => i.status === 'Published');
  },

  submitRegistrarItem(data: {
    title: string;
    type: string;
    content: string;
    excerpt?: string;
    priority?: Priority;
    eventDate?: string;
    eventLocation?: string;
    targetAudience?: string;
    author?: string;
    dueDate?: string;
  }): WorkflowItem {
    const items = this.getItems();
    const item: WorkflowItem = {
      id: `w-reg-${Date.now()}`,
      title: data.title.trim(),
      type: data.type || 'Announcement',
      author: data.author || 'Office of the Registrar',
      department: 'Office of the Registrar',
      content: data.content,
      excerpt: data.excerpt || data.content.slice(0, 160) + '...',
      submittedAt: 'Just now',
      status: 'Pending Review',
      priority: data.priority || 'Normal',
      reviewer: 'Alumni Relations Officer',
      stage: 1,
      totalStages: 2,
      eventDate: data.eventDate,
      eventLocation: data.eventLocation,
      targetAudience: data.targetAudience || 'All Actors',
      comments: [
        {
          id: `c-${Date.now()}`,
          author: data.author || 'Office of the Registrar',
          text: 'Submitted by Office of the Registrar. Awaiting review & approval by Alumni Relations Officer.',
          createdAt: 'Just now',
          type: 'comment',
        },
      ],
      dueDate: data.dueDate || 'In 48 hours',
    };

    items.unshift(item);
    this.saveItems(items);
    return item;
  },

  rejectItem(id: string, reason: string, reviewer = 'Reviewer'): WorkflowItem | undefined {
    const items = this.getItems();
    const item = items.find((i) => i.id === id);
    if (!item) return undefined;

    item.status = 'Rejected';
    item.comments.push({
      id: `c-${Date.now()}`,
      author: reviewer,
      text: reason || 'Submission rejected by reviewer.',
      createdAt: 'Just now',
      type: 'rejection',
    });

    this.saveItems(items);
    return item;
  },

  addComment(id: string, text: string, author = 'Reviewer'): WorkflowItem | undefined {
    const items = this.getItems();
    const item = items.find((i) => i.id === id);
    if (!item) return undefined;

    item.comments.push({
      id: `c-${Date.now()}`,
      author,
      text,
      createdAt: 'Just now',
      type: 'comment',
    });

    this.saveItems(items);
    return item;
  },

  createSubmission(newItem: Partial<WorkflowItem>): WorkflowItem {
    const items = this.getItems();
    const item: WorkflowItem = {
      id: `w-${Date.now()}`,
      title: newItem.title || 'Untitled Submission',
      type: newItem.type || 'Announcement',
      author: newItem.author || 'Staff Officer',
      department: newItem.department || 'Alumni Office',
      content: newItem.content || '',
      excerpt: newItem.excerpt || '',
      submittedAt: 'Just now',
      status: 'Pending Review',
      priority: newItem.priority || 'Normal',
      reviewer: newItem.reviewer || 'Content Manager',
      stage: 1,
      totalStages: newItem.totalStages || 3,
      comments: [
        {
          id: `c-${Date.now()}`,
          author: newItem.author || 'Staff Officer',
          text: 'Submitted for editorial approval.',
          createdAt: 'Just now',
          type: 'comment',
        },
      ],
      dueDate: newItem.dueDate || 'In 48 hours',
      contentId: newItem.contentId,
    };

    items.unshift(item);
    this.saveItems(items);
    return item;
  },

  deleteItem(id: string): boolean {
    const items = this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length !== items.length) {
      this.saveItems(filtered);
      return true;
    }
    return false;
  },

  resetDefaults(): WorkflowItem[] {
    this.saveItems(defaultWorkflowItems);
    this.saveStageConfigs(defaultStageConfigs);
    return defaultWorkflowItems;
  },
};

export default approvalService;
