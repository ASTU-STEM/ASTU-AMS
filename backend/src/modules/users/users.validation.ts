import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.nativeEnum(Role),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
});

export const assignRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const banUserSchema = z.object({
  ban: z.boolean(),
});
