import { z } from 'zod';

const questionSchema = z.object({
  questionText: z.string().min(5),
  questionType: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'RADIO', 'CHECKBOX', 'RATING', 'NUMBER', 'DATE']),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  validationRules: z.record(z.any()).optional(),
  options: z.array(z.string()).optional(),
  order: z.number().int().nonnegative(),
});

export const createSurveyTemplateSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  type: z.enum(['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH', 'CUSTOM']),
  milestoneMonths: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  questions: z.array(questionSchema).optional(),
  sections: z.array(z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    order: z.number().int().nonnegative(),
    questions: z.array(questionSchema).min(1)
  })).optional()
}).refine((data) => Boolean(data.questions?.length || data.sections?.length), {
  message: 'A survey template must include questions or sections with questions.',
});

export const updateSurveyTemplateSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  type: z.enum(['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH', 'CUSTOM']).optional(),
  milestoneMonths: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  questions: z.array(questionSchema).optional(),
  sections: z.array(z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    order: z.number().int().nonnegative(),
    questions: z.array(questionSchema).min(1)
  })).optional()
}).refine((data) => Boolean(data.questions?.length || data.sections?.length || data.title || data.description || data.type || data.milestoneMonths !== undefined || data.isActive !== undefined), {
  message: 'At least one field must be updated.'
});

export const answeredQuestionSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().min(1)
});

export const submitSurveySchema = z.object({
  assignmentId: z.string().uuid(),
  answers: z.array(answeredQuestionSchema).min(1, 'You must provide at least one answer.')
});

export const saveDraftSchema = z.object({
  assignmentId: z.string().uuid(),
  answers: z.array(answeredQuestionSchema).min(1, 'You must provide at least one answer.')
});

export const sendNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(5),
  content: z.string().min(5),
});
