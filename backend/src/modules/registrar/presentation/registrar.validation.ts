import { z } from 'zod';

export const updateAlumniStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  reason: z.string().min(2, 'Reason must be at least 2 characters').optional().nullable(),
});
