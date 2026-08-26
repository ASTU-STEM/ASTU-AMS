import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().default(''),
  date: z.string().min(1),
  location: z.string().min(2),
  type: z.string().optional().default('Event')
});

export const updateEventSchema = createEventSchema.partial();

export const rsvpSchema = z.object({
  status: z.enum(['GOING', 'NOT_GOING'])
});
