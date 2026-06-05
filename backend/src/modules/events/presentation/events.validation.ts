import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  date: z.string().datetime(),
  location: z.string().min(3),
  type: z.enum(['ONLINE', 'IN_PERSON'])
});

export const updateEventSchema = createEventSchema.partial();

export const rsvpSchema = z.object({
  status: z.enum(['GOING', 'NOT_GOING'])
});
