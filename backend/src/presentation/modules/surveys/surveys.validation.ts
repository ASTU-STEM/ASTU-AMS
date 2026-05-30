import { z } from 'zod';

export const createSurveySchema = z.object({
  title: z.string().min(2, 'Survey title is required'),
  description: z.string().min(5, 'Survey description is required'),
  type: z.enum(['SIX_MONTH', 'TWELVE_MONTH', 'TWENTY_FOUR_MONTH']),
  questions: z.array(
    z.object({
      questionText: z.string().min(2, 'Question text is required'),
      questionType: z.enum(['TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'RATING']),
      options: z.array(z.string()).optional().default([]),
      order: z.coerce.number().min(1),
    })
  ).min(1, 'At least one question is required'),
});

export const submitResponseSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answerText: z.string().min(1, 'Answer content cannot be empty'),
    })
  ).min(1, 'At least one answer must be submitted'),
});
