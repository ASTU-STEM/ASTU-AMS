import { z } from 'zod';

export const requestDocumentSchema = z.object({
  documentType: z.enum(['TRANSCRIPT', 'DEGREE_VERIFICATION', 'RECOMMENDATION']),
  additionalInstructions: z.string().optional().nullable(),
});

export const updateDocumentStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']),
});
