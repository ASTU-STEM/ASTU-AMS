import { z } from 'zod';

export const createAuditLogSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  action: z.string().min(2),
  details: z.string().min(2),
  ipAddress: z.string().optional().nullable(),
});

export const purgeAuditLogsSchema = z.object({
  daysOld: z.number().int().min(1).max(365),
});
