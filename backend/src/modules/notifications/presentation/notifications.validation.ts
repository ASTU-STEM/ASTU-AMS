import { z } from 'zod';

export const sendNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(2),
  content: z.string().min(5),
});
