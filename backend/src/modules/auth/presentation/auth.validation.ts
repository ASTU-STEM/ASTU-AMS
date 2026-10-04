import { z } from 'zod';
import { Role } from '@prisma/client';

export const loginSchema = z.object({
  emailOrStudentId: z.string().min(1, 'Email or Student ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
  isEmployerLoginFlow: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  method: z.enum(['email', 'phone']),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const submitManualVerificationSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  fullName: z.string().min(2, 'Full name is required'),
  graduationYear: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  contactEmail: z.string().email('Invalid email'),
  phone: z.string().optional(),
  documentType: z.string().min(1, 'Document type is required'),
  notes: z.string().optional(),
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
  firstName: z.string().min(2, 'First name is required'),
  middleName: z.preprocess((val) => (val === null || val === undefined ? '' : String(val)), z.string().optional()),
  lastName: z.string().min(2, 'Last name is required'),
  gender: z.preprocess((val) => (val === null || val === undefined ? '' : String(val)), z.string().optional()),
  educationalQualification: z.preprocess((val) => (val === null || val === undefined ? '' : String(val)), z.string().optional()),
  workPlace: z.preprocess((val) => (val === null || val === undefined ? '' : String(val)), z.string().optional()),
  workPosition: z.preprocess((val) => (val === null || val === undefined ? '' : String(val)), z.string().optional()),
  studentId: z.string().min(1, 'Student ID is required'),
  batch: z.string().min(1, 'Year of graduation is required'),
  department: z.string().min(1, 'Field of study is required'),
  email: z.string().optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long'),
  hasNoAstuEmail: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (!data.hasNoAstuEmail && (!data.email || data.email.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Email is required unless hasNoAstuEmail is true",
  path: ["email"],
});

export const verifyAlumniEmailSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  code: z.string().min(4, 'Verification code is required'),
});

export const resendOtpSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
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
