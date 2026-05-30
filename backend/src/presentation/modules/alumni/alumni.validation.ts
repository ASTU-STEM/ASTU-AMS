import { z } from 'zod';

export const updateAlumniProfileSchema = z.object({
  fullName: z.string().min(2, 'Name is required').optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date()).optional().nullable(),
  skills: z.array(z.string()).optional(),
  linkedIn: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  gitHub: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  portfolio: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  telegram: z.string().optional().nullable(),
});

export const addExperienceSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  position: z.string().min(2, 'Position title is required'),
  industry: z.string().min(2, 'Industry type is required'),
  salaryRange: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  startDate: z.preprocess((val) => new Date(val as string), z.date()),
  endDate: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable()).optional(),
});

export const documentRequestSchema = z.object({
  documentType: z.enum(['TRANSCRIPT', 'DEGREE_VERIFICATION', 'RECOMMENDATION']),
  additionalInstructions: z.string().optional().nullable(),
});
