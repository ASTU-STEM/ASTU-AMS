import { z } from 'zod';

export const createContentSchema = z.object({
  title: z.string().min(2, 'Title is required and must be at least 2 characters'),
  slug: z.string().optional(),
  type: z.enum(['post', 'page', 'announcement', 'gallery', 'event', 'template', 'POST', 'PAGE', 'ANNOUNCEMENT', 'GALLERY', 'EVENT', 'TEMPLATE']).optional().default('POST'),
  status: z.enum(['Published', 'Draft', 'Scheduled', 'Needs Review', 'Archived', 'PUBLISHED', 'DRAFT', 'SCHEDULED', 'NEEDS_REVIEW', 'ARCHIVED']).optional().default('PUBLISHED'),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent', 'LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().default('NORMAL'),
  excerpt: z.string().optional().default(''),
  body: z.string().optional().default(''),
  featuredImg: z.string().optional(),
  image: z.string().optional(),
  author: z.string().optional().default('Content Manager'),
  tags: z.array(z.string()).optional().default([]),
  pinned: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  language: z.string().optional().default('EN'),
  scheduledFor: z.string().optional(),
  publishedAt: z.string().optional(),
});

export const updateContentSchema = createContentSchema.partial();
