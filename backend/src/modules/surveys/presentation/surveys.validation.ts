import { z } from 'zod';

export const createSurveySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  type: z.enum(['SIX_MONTH', 'TWELVE_MONTH', 'TWENTY_FOUR_MONTH']),
  questions: z.array(z.object({
    questionText: z.string().min(5),
    questionType: z.enum(['TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'RATING']),
    options: z.array(z.string()).optional(),
    order: z.number().int()
  })).min(1, 'A survey must have at least one question.')
});

export const submitResponseSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    answerText: z.string().min(1)
  })).min(1, 'You must provide at least one answer.')
});
