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

/** Legacy demo seed IDs — stripped once from localStorage so officers see a real queue. */
const LEGACY_DEMO_ITEM_IDS = new Set([
  'w-pub-carnival',
  'w-pub-career',
  'w-reg-1',
  'w-2',
  'w-3',
  'w-4',
  'w-5',
  'w-6',
  'w-7',
  'w-8',
]);

/** Kept empty — prefer a real empty approval queue over fabricated Carnival/demo items. */
export const defaultWorkflowItems: WorkflowItem[] = [];

export const approvalService = {
  getItems(): WorkflowItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((i: WorkflowItem) => !LEGACY_DEMO_ITEM_IDS.has(i.id));
          if (cleaned.length !== parsed.length) {
            this.saveItems(cleaned);
            return cleaned;
          }
          return parsed;
        }
      }
    } catch {}
    return [];
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

  /** Clears the queue. Demo reseeding is disabled — officers start from an empty pipeline. */
  resetDefaults(): WorkflowItem[] {
    this.saveItems([]);
    this.saveStageConfigs(defaultStageConfigs);
    return [];
  },

  clearQueue(): WorkflowItem[] {
    this.saveItems([]);
    return [];
  },
};

export default approvalService;
