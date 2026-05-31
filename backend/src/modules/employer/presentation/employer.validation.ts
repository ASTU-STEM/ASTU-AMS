import { z } from 'zod';

export const updateEmployerProfileSchema = z.object({
  companyName: z.string().min(2).optional(),
  industry: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  hrContact: z.string().min(2).optional(),
  website: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

export const jobSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  location: z.string().min(2),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']),
  experienceRequired: z.number().min(0),
  skillsRequired: z.array(z.string()),
  deadline: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  salary: z.string().optional().nullable(),
});

export const updateJobStatusSchema = z.object({
  status: z.enum(['PENDING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED']),
});
