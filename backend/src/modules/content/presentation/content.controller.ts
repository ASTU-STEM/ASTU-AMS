import { Request, Response, NextFunction } from 'express';
import prisma from '../../../core/config/db';
import fs from 'fs';
import path from 'path';

const CONTENT_FILE_PATH = path.join(process.cwd(), 'data', 'cms-content.json');

const initialItems = [
  {
    id: 'C-001',
    title: 'ASTU Alumni Network: Bridging Generations',
    type: 'post',
    status: 'Published',
    excerpt: 'How our alumni network connects 25,000+ graduates with opportunities, mentorship, and lifelong learning resources.',
    author: 'Content Manager',
    updatedAt: '2 hours ago',
    publishedAt: 'May 28, 2026',
    views: 1240,
    tags: ['alumni', 'community', 'networking'],
    pinned: true,
    featured: true,
    language: 'EN',
  },
  {
    id: 'C-002',
    title: 'Industry Partnership Week 2026',
    type: 'page',
    status: 'Scheduled',
    excerpt: 'Five-day summit connecting ASTU students with leading employers across Ethiopia and East Africa.',
    author: 'Content Manager',
    updatedAt: 'Jun 5, 2026',
    scheduledFor: 'Jun 12, 9:00 AM',
    views: 0,
    tags: ['partnership', 'employers', 'career'],
    pinned: false,
    featured: true,
    language: 'EN',
  },
  {
    id: 'C-003',
    title: 'Tracer Survey Campaign Banner',
    type: 'page',
    status: 'Draft',
    excerpt: 'Encourages 2024 alumni batch to complete the annual tracer study for institutional improvement.',
    author: 'Content Manager',
    updatedAt: 'Yesterday',
    views: 0,
    tags: ['tracer', 'survey', 'alumni'],
    pinned: false,
    featured: false,
    language: 'EN',
  },
  {
    id: 'C-004',
    title: 'Semester Break: Campus Safety Notice',
    type: 'announcement',
    status: 'Published',
    excerpt: 'Important safety reminders for students, faculty, and visitors during the upcoming semester break.',
    author: 'System Admin',
    updatedAt: '45 min ago',
    publishedAt: 'Jun 7, 2026',
    views: 892,
    tags: ['safety', 'campus', 'announcement'],
    pinned: true,
    featured: false,
    language: 'EN',
  },
  {
    id: 'C-005',
    title: 'Campus Tour 2026 Photo Album',
    type: 'gallery',
    status: 'Needs Review',
    excerpt: 'Stunning aerial and ground-level photos from the 2026 campus tour. Awaiting final approval before publishing.',
    author: 'Dept Head',
    updatedAt: '3 days ago',
    views: 0,
    tags: ['campus', 'tour', 'photos'],
    pinned: false,
    featured: false,
    language: 'EN',
  },
  {
    id: 'C-006',
    title: 'ASTU Research Grant Winners 2026',
    type: 'post',
    status: 'Published',
    excerpt: 'Announcing 12 applied research grants awarded to faculty and alumni engineering teams.',
    author: 'Content Manager',
    updatedAt: '1 day ago',
    publishedAt: 'May 25, 2026',
    views: 1890,
    tags: ['research', 'grants', 'engineering'],
    pinned: false,
    featured: true,
    language: 'EN',
  },
];

async function readContentStore(): Promise<any[]> {
  try {
    // 1. Try DB SystemSetting
    const setting = await (prisma as any).systemSetting.findUnique({ where: { key: 'cms_content_items' } });
    if (setting && setting.value && Array.isArray(setting.value)) {
      return setting.value as any[];
    }
  } catch { /* DB fallback */ }

  try {
    // 2. Try JSON File
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(CONTENT_FILE_PATH, 'utf-8'));
    }
  } catch { /* File fallback */ }

  return initialItems;
}

async function writeContentStore(items: any[]): Promise<void> {
  try {
    await (prisma as any).systemSetting.upsert({
      where: { key: 'cms_content_items' },
      update: { value: items, updatedAt: new Date() },
      create: { key: 'cms_content_items', value: items },
    });
  } catch { /* DB fallback */ }

  try {
    const dir = path.dirname(CONTENT_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(items, null, 2));
  } catch { /* File fallback */ }
}

export const getContentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await readContentStore();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const createContentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await readContentStore();

    if (req.body.title === 'Homepage CMS Configuration') {
      const existingIdx = items.findIndex((i) => i.title === 'Homepage CMS Configuration');
      const configItem = {
        id: existingIdx !== -1 ? items[existingIdx].id : 'C-CONFIG',
        title: 'Homepage CMS Configuration',
        type: 'page',
        status: 'Published',
        excerpt: req.body.excerpt || '',
        author: 'CMS Admin',
        updatedAt: 'Just now',
        views: 0,
      };

      if (existingIdx !== -1) {
        items[existingIdx] = configItem;
      } else {
        items.unshift(configItem);
      }
      await writeContentStore(items);
      return res.status(200).json({ success: true, data: configItem });
    }

    const newItem = {
      id: `C-${String(items.length + 1).padStart(3, '0')}`,
      title: req.body.title,
      type: req.body.type || 'post',
      status: req.body.status || 'Published',
      excerpt: req.body.excerpt || req.body.title,
      author: req.body.author || 'Content Manager',
      updatedAt: 'Just now',
      publishedAt: req.body.status === 'Published' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
      views: 0,
      tags: req.body.tags || [req.body.type || 'cms', 'astu'],
      pinned: req.body.pinned || false,
      featured: req.body.featured || true,
      language: req.body.language || 'EN',
    };
    const updated = [newItem, ...items];
    await writeContentStore(updated);
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

export const updateContentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const items = await readContentStore();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Content item not found' });
    }
    items[index] = { ...items[index], ...req.body, updatedAt: 'Just now' };
    await writeContentStore(items);
    res.status(200).json({ success: true, data: items[index] });
  } catch (error) {
    next(error);
  }
};

export const deleteContentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const items = await readContentStore();
    const filtered = items.filter(i => i.id !== id);
    await writeContentStore(filtered);
    res.status(200).json({ success: true, message: 'Content item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
