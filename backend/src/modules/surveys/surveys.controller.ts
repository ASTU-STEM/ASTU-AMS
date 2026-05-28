import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { createSurveySchema, submitResponseSchema } from './surveys.validation';
import { sendSuccess, sendError } from '../../utils/response.utils';

export class SurveysController {
  /**
   * Create a new tracer survey with questions.
   * Route: POST /api/surveys
   * Access: ADMIN
   */
  static async createSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = createSurveySchema.parse(req.body);

      const survey = await prisma.$transaction(async (tx: any) => {
        const newSurvey = await tx.survey.create({
          data: {
            title: parsedData.title,
            description: parsedData.description,
            type: parsedData.type,
          },
        });

        // Create questions
        const questionsData = parsedData.questions.map((q) => ({
          surveyId: newSurvey.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          order: q.order,
        }));

        await tx.surveyQuestion.createMany({
          data: questionsData,
        });

        return newSurvey;
      });

      const fullSurvey = await prisma.survey.findUnique({
        where: { id: survey.id },
        include: { questions: { orderBy: { order: 'asc' } } },
      });

      return sendSuccess(res, 'Tracer survey template created successfully', fullSurvey, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * List all surveys.
   * Route: GET /api/surveys
   * Access: ALUMNI, ADMIN, DEPT_HEAD
   */
  static async listSurveys(req: Request, res: Response, next: NextFunction) {
    try {
      const surveys = await prisma.survey.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, 'Fetched surveys successfully', surveys);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Fetch specific survey details including questions.
   * Route: GET /api/surveys/:id
   * Access: ALUMNI, ADMIN, DEPT_HEAD
   */
  static async getSurveyDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const survey = await prisma.survey.findUnique({
        where: { id },
        include: {
          questions: { orderBy: { order: 'asc' } },
        },
      });

      if (!survey) {
        return sendError(res, 'Survey template not found', null, 404);
      }

      return sendSuccess(res, 'Survey details retrieved', survey);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Submit alumni response to a survey.
   * Route: POST /api/surveys/:id/submit
   * Access: ALUMNI
   */
  static async submitResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const parsedData = submitResponseSchema.parse(req.body);

      const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      const survey = await prisma.survey.findUnique({ where: { id } });
      if (!survey || !survey.isActive) {
        return sendError(res, 'Survey is inactive or does not exist', null, 400);
      }

      // Check if already completed
      const existing = await prisma.surveyResponse.findFirst({
        where: { surveyId: id, alumniId: alumni.id },
      });
      if (existing) {
        return sendError(res, 'You have already submitted a response for this survey', null, 400);
      }

      const response = await prisma.$transaction(async (tx: any) => {
        const newResponse = await tx.surveyResponse.create({
          data: {
            surveyId: id,
            alumniId: alumni.id,
          },
        });

        const answersData = parsedData.answers.map((ans) => ({
          responseId: newResponse.id,
          questionId: ans.questionId,
          answerText: ans.answerText,
        }));

        await tx.surveyAnswer.createMany({
          data: answersData,
        });

        return newResponse;
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'SUBMIT_SURVEY',
          details: `Alumni submitted response for survey: ${survey.title}`,
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'Tracer survey response submitted successfully.', response, 201);
    } catch (err: any) {
      next(err);
    }
  }
}
