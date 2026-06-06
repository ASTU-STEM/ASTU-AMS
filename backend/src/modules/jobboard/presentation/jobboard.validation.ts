import { z } from 'zod';

// ─── Search / Listing Query Params ──────────────────────────────────────────

export const jobSearchQuerySchema = z.object({
  keyword: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']).optional(),
  experienceLevel: z.string().optional(),
  industry: z.string().optional(),
  company: z.string().optional(),
  salaryMin: z.preprocess(
    (v) => (v !== undefined && v !== '' ? Number(v) : undefined),
    z.number().min(0).optional()
  ),
  salaryMax: z.preprocess(
    (v) => (v !== undefined && v !== '' ? Number(v) : undefined),
    z.number().min(0).optional()
  ),
  experienceMin: z.preprocess(
    (v) => (v !== undefined && v !== '' ? Number(v) : undefined),
    z.number().min(0).optional()
  ),
  experienceMax: z.preprocess(
    (v) => (v !== undefined && v !== '' ? Number(v) : undefined),
    z.number().min(0).optional()
  ),
  page: z.preprocess(
    (v) => (v !== undefined && v !== '' ? Number(v) : 1),
    z.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (v) => (v !== undefined && v !== '' ? Number(v) : 20),
    z.number().int().min(1).max(50).default(20)
  ),
  sort: z.enum(['newest', 'oldest', 'deadline', 'salary_high', 'salary_low']).default('newest'),
});

// ─── Apply to Job Body ──────────────────────────────────────────────────────

export const applyToJobSchema = z.object({
  coverLetter: z.string().max(5000).optional().nullable(),
});

// ─── Pagination Query ───────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.preprocess(
    (v) => (v !== undefined && v !== '' ? Number(v) : 1),
    z.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (v) => (v !== undefined && v !== '' ? Number(v) : 20),
    z.number().int().min(1).max(50).default(20)
  ),
});
