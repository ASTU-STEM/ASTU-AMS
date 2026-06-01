import { z } from 'zod';
import { Role } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  isEmployerLoginFlow: z.boolean().optional(),
});

export const activateAlumniSchema = z.object({
  token: z.string().min(1, 'Activation token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerEmployerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  hrContact: z.string().min(5, 'HR contact details are required'),
  tin: z.string().min(5, 'TIN is required for employer verification'),
});

// Alumni Registration Schemas
export const registerAlumniSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  fullName: z.string().min(2, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().optional(),
});

export const verifyAlumniEmailSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  code: z.string().min(4, 'Verification code is required'),
});

export const verifyNationalIdSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  nationalId: z.string().min(5, 'National ID is required'),
  password: z.string().min(6, 'Password is required').optional(),
});

// Admin User Creation Schema
export const createAdminUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['REGISTRAR', 'DEPARTMENT_HEAD', 'ADMIN']),
  fullName: z.string().optional(),
});
