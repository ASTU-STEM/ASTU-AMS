import { z } from 'zod';
import { Role } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerAlumniSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  phone: z.string().optional(),
});

export const registerEmployerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  hrContact: z.string().min(5, 'HR contact details are required'),
});

export const createUserByAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum([Role.REGISTRAR, Role.DEPARTMENT_HEAD], { errorMap: () => ({ message: 'Role must be REGISTRAR or DEPARTMENT_HEAD' }) }),
  fullName: z.string().optional(),
});

export const activateAlumniSchema = z.object({
  token: z.string().min(1, 'Activation token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
