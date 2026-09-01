import { z } from 'zod';

export const updateAlumniProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date().optional().nullable()),
  skills: z.array(z.string()).optional().nullable(),
  linkedIn: z.string().url().optional().nullable(),
  gitHub: z.string().url().optional().nullable(),
  portfolio: z.string().url().optional().nullable(),
  telegram: z.string().optional().nullable(),
});

export const addExperienceSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  position: z.string().min(2, 'Position is required'),
  industry: z.string().min(2, 'Industry is required'),
  salaryRange: z.string().optional().nullable(),
  location: z.string().min(2, 'Location is required'),
  isCurrent: z.boolean().default(false),
  startDate: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  endDate: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date().optional().nullable()),
});

export const documentRequestSchema = z.object({
  documentType: z.string().min(2, 'Document type is required'),
  additionalInstructions: z.string().optional().nullable(),
  fileUrls: z.array(z.string()).optional(),
});
