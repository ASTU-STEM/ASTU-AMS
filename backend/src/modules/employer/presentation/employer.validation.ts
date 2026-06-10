import { z } from 'zod';

export const createEmployerProfileSchema = z.object({
  companyName: z.string().min(2),
  industry: z.string().min(2),
  location: z.string().min(2),
  hrContact: z.string().min(2),
  website: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const updateEmployerProfileSchema = z.object({
  companyName: z.string().min(2).optional(),
  industry: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  hrContact: z.string().min(2).optional(),
  website: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
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
  responsibilities: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  experienceLevel: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
});

export const updateJobStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'REVIEWED',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'ACCEPTED'
  ]),
});

export const interviewSchema = z.object({
  applicationId: z.string().uuid(),
  interviewer: z.string().min(2),
  interviewDate: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  interviewType: z.string().min(2),
  meetingLink: z.string().url().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
});

export const employerFeedbackSchema = z.object({
  alumniId: z.string().uuid(),
  technicalSkill: z.number().min(1).max(10),
  communicationSkill: z.number().min(1).max(10),
  leadershipSkill: z.number().min(1).max(10),
  teamworkSkill: z.number().min(1).max(10),
  problemSolvingSkill: z.number().min(1).max(10),
  innovationSkill: z.number().min(1).max(10),
  feedbackText: z.string().optional().nullable(),
  overallSatisfaction: z.number().min(1).max(10).default(8),
  missingSkills: z.array(z.string()).default([]),
  technologiesNeeded: z.array(z.string()).default([]),
  wouldHireAgain: z.boolean().default(true),
});

