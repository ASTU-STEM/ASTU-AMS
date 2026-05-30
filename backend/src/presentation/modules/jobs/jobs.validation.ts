import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const createJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  description: z.string().min(10, 'Detailed job description is required'),
  salary: z.string().optional().nullable(),
  deadline: z.preprocess((val) => new Date(val as string), z.date()),
  experienceRequired: z.coerce.number().min(0).default(0),
  skillsRequired: z.array(z.string()).default([]),
  location: z.string().min(2, 'Location is required'),
  employmentType: z.string().min(2, 'Employment type is required'), // e.g. FULL_TIME, PART_TIME, INTERNSHIP
});

export const applyJobSchema = z.object({
  coverLetter: z.string().optional().nullable(),
  useProfileCv: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

export const employerFeedbackSchema = z.object({
  alumniId: z.string().uuid(),
  technicalSkill: z.coerce.number().min(1).max(10),
  communicationSkill: z.coerce.number().min(1).max(10),
  leadershipSkill: z.coerce.number().min(1).max(10),
  teamworkSkill: z.coerce.number().min(1).max(10),
  problemSolvingSkill: z.coerce.number().min(1).max(10),
  innovationSkill: z.coerce.number().min(1).max(10),
  feedbackText: z.string().optional().nullable(),
});
