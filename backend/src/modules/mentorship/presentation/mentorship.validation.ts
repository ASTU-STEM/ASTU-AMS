import { z } from 'zod';

export const requestMentorshipSchema = z.object({
  mentorId: z.string().uuid(),
  message: z.string().min(10).max(500).optional().nullable()
});

export const respondMentorshipSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'COMPLETED'])
});
