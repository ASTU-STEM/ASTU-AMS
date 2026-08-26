import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { ApiError } from '../../../core/errors/ApiError';
import prisma from '../../../core/config/db';
import {
  createSurveyTemplateSchema,
  updateSurveyTemplateSchema,
  saveDraftSchema,
  submitSurveySchema,
} from './surveys.validation';

import { PrismaSurveyRepository } from '../infrastructure/repositories/PrismaSurveyRepository';
import { PrismaSurveyResponseRepository } from '../infrastructure/repositories/PrismaSurveyResponseRepository';
import { PrismaSurveyAssignmentRepository } from '../infrastructure/repositories/PrismaSurveyAssignmentRepository';

import { CreateSurvey, GetSurveys } from '../application/use-cases/ManageSurveys';
import { SubmitSurveyResponse } from '../application/use-cases/SubmitSurveyResponse';
import {
  CreateSurveyTemplate,
  GetSurveyTemplates,
  GetSurveyTemplateById,
  UpdateSurveyTemplate,
  ArchiveSurveyTemplate,
  CloneSurveyTemplate,
} from '../application/use-cases/ManageSurveyTemplates';
import {
  GetSurveyAssignments,
  GetSurveyAssignmentById,
  GetAlumniAssignments,
} from '../application/use-cases/ManageSurveyAssignments';
import {
  GetSurveyResponses,
  GetSurveyResponseById,
} from '../application/use-cases/ManageSurveyResponses';
import { GetSurveyStatistics, GetCompletionReport } from '../application/use-cases/SurveyStatistics';
import { SaveSurveyDraft } from '../application/use-cases/SaveSurveyDraft';
import { SubmitAssignedSurvey } from '../application/use-cases/SubmitAssignedSurvey';
import { TracerStudyService } from '../services/TracerStudyService';

const surveyRepo = new PrismaSurveyRepository();
const responseRepo = new PrismaSurveyResponseRepository();
const assignmentRepo = new PrismaSurveyAssignmentRepository();
const tracerService = new TracerStudyService();

async function getAlumniIdFromUser(userId: string): Promise<string> {
  const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
  if (!alumni) throw new Error('Alumni profile not found for current user');
  return alumni.id;
}

export class SurveysController {
  static async createSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSurveyTemplateSchema.parse(req.body);
      const useCase = new CreateSurvey(surveyRepo);
      const result = await useCase.execute(data as any);
      return sendSuccess(res, 'Survey created successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async listActiveSurveys(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetSurveys(surveyRepo);
      const result = await useCase.execute(true);
      return sendSuccess(res, 'Active surveys retrieved.', result);
    } catch (err) { next(err); }
  }

  static async listAllSurveys(req: Request, res: Response, next: NextFunction) {
    try {
      await tracerService.ensureDefaultMilestoneTemplates().catch(() => {});
      const useCase = new GetSurveys(surveyRepo);
      const result = await useCase.execute(false);
      return sendSuccess(res, 'All surveys retrieved.', result);
    } catch (err) { next(err); }
  }

  static async createSurveyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSurveyTemplateSchema.parse(req.body);

      if (['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH'].includes(data.type)) {
        throw new ApiError('Fixed milestone survey templates (6/12/18/24-Month) are pre-configured system templates and cannot be re-created. You may edit existing milestone templates or create a Custom survey.', 400);
      }

      const useCase = new CreateSurveyTemplate(surveyRepo);
      const result = await useCase.execute({
        ...data,
        isActive: data.isActive ?? true,
        isArchived: false,
      } as any);

      if (data.sendInstantly || data.isActive !== false) {
        await tracerService.dispatchSurveyInstantly(result.id).catch(() => {});
      }

      return sendSuccess(res, 'Survey template created and dispatched successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async listSurveyTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      await tracerService.ensureDefaultMilestoneTemplates().catch(() => {});
      const useCase = new GetSurveyTemplates(surveyRepo);
      const result = await useCase.execute(false, false);
      return sendSuccess(res, 'Survey templates retrieved.', result);
    } catch (err) { next(err); }
  }

  static async getSurveyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetSurveyTemplateById(surveyRepo);
      const result = await useCase.execute(req.params.templateId);
      return sendSuccess(res, 'Survey template retrieved.', result);
    } catch (err) { next(err); }
  }

  static async updateSurveyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = (req as any).user?.role;
      const templateId = req.params.templateId;

      if (userRole !== 'ADMIN') {
        const existingTemplate = await surveyRepo.findById(templateId);
        if (existingTemplate && ['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH'].includes(existingTemplate.type)) {
          throw new ApiError('Fixed milestone survey templates (6/12/18/24-Month) can only be modified by system Administrators. Registrars can create and schedule custom surveys.', 403);
        }
      }

      const data = updateSurveyTemplateSchema.parse(req.body);
      const useCase = new UpdateSurveyTemplate(surveyRepo);
      const result = await useCase.execute(templateId, data as any);
      return sendSuccess(res, 'Survey template updated successfully.', result);
    } catch (err) { next(err); }
  }

  static async archiveSurveyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = (req as any).user?.role;
      const templateId = req.params.templateId;

      if (userRole !== 'ADMIN') {
        const existingTemplate = await surveyRepo.findById(templateId);
        if (existingTemplate && ['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH'].includes(existingTemplate.type)) {
          throw new ApiError('Fixed milestone survey templates (6/12/18/24-Month) can only be modified by system Administrators.', 403);
        }
      }

      const useCase = new ArchiveSurveyTemplate(surveyRepo);
      const result = await useCase.execute(templateId);
      return sendSuccess(res, 'Survey template archived successfully.', result);
    } catch (err) { next(err); }
  }

  static async cloneSurveyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new CloneSurveyTemplate(surveyRepo);
      const result = await useCase.execute(req.params.templateId);
      return sendSuccess(res, 'Survey template cloned successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async listAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetSurveyAssignments(assignmentRepo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Survey assignments retrieved.', result);
    } catch (err) { next(err); }
  }

  static async getAssignmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const alumniId = await getAlumniIdFromUser(user.userId);
      const useCase = new GetSurveyAssignmentById(assignmentRepo);
      const assignment = await useCase.execute(req.params.assignmentId);
      if (user.role === 'ALUMNI' && assignment.alumniId !== alumniId) {
        throw new Error('Access denied');
      }
      return sendSuccess(res, 'Survey assignment retrieved.', assignment);
    } catch (err) { next(err); }
  }

  static async listResponses(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetSurveyResponses(responseRepo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Survey responses retrieved.', result);
    } catch (err) { next(err); }
  }

  static async getResponseById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const alumniId = await getAlumniIdFromUser(user.userId);
      const useCase = new GetSurveyResponseById(responseRepo);
      const response = await useCase.execute(req.params.responseId);
      if (user.role === 'ALUMNI' && response.alumniId !== alumniId) {
        throw new Error('Access denied');
      }
      return sendSuccess(res, 'Survey response retrieved.', response);
    } catch (err) { next(err); }
  }

  static async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const batchYear = req.query.batch ? Number(req.query.batch) : undefined;
      const useCase = new GetSurveyStatistics(assignmentRepo);
      const result = await useCase.execute(batchYear);
      return sendSuccess(res, 'Survey statistics retrieved.', result);
    } catch (err) { next(err); }
  }

  static async getCompletionReport(req: Request, res: Response, next: NextFunction) {
    try {
      const batchYear = req.query.batch ? Number(req.query.batch) : undefined;
      const useCase = new GetCompletionReport(assignmentRepo);
      const result = await useCase.execute(batchYear);
      return sendSuccess(res, 'Completion report retrieved.', result);
    } catch (err) { next(err); }
  }

  static async getMySurveys(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const alumniId = await getAlumniIdFromUser(userId);
      const useCase = new GetAlumniAssignments(assignmentRepo);
      const assignments = await useCase.execute(alumniId);
      return sendSuccess(res, 'Assigned surveys retrieved.', assignments);
    } catch (err) { next(err); }
  }

  static async getMySurveyAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const alumniId = await getAlumniIdFromUser(userId);
      const useCase = new GetSurveyAssignmentById(assignmentRepo);
      const assignment = await useCase.execute(req.params.assignmentId);
      if (assignment.alumniId !== alumniId) throw new Error('Access denied');
      return sendSuccess(res, 'Assigned survey retrieved.', assignment);
    } catch (err) { next(err); }
  }

  static async saveDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const alumniId = await getAlumniIdFromUser(userId);
      const data = saveDraftSchema.parse(req.body);
      const useCase = new SaveSurveyDraft(assignmentRepo, responseRepo);
      const result = await useCase.execute(alumniId, data.assignmentId, data.answers);
      return sendSuccess(res, 'Survey draft saved.', result, 200);
    } catch (err) { next(err); }
  }

  static async submitAssignedSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const alumniId = await getAlumniIdFromUser(userId);
      const data = submitSurveySchema.parse(req.body);
      const useCase = new SubmitAssignedSurvey(assignmentRepo, responseRepo);
      const result = await useCase.execute(alumniId, data.assignmentId || '', data.answers);
      return sendSuccess(res, 'Survey submitted successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async getMyHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const alumniId = await getAlumniIdFromUser(userId);
      const useCase = new GetAlumniAssignments(assignmentRepo);
      const assignments = await useCase.execute(alumniId);
      const history = assignments.filter((assignment) => ['COMPLETED', 'OVERDUE', 'EXPIRED'].includes(assignment.status));
      return sendSuccess(res, 'Survey history retrieved.', history);
    } catch (err) { next(err); }
  }

  static async submitResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const alumniId = (req as any).user?.userId;
      const { answers } = submitSurveySchema.parse(req.body);
      const useCase = new SubmitSurveyResponse(surveyRepo, responseRepo);
      const result = await useCase.execute(req.params.surveyId, alumniId, answers);
      return sendSuccess(res, 'Survey response submitted successfully.', result, 201);
    } catch (err) { next(err); }
  }

  // ─── Analysis endpoints ────────────────────────────────────────────────
  static async getSurveyAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const responses = await responseRepo.findBySurveyId(templateId);
      const template = await surveyRepo.findById(templateId);
      if (!template) return sendSuccess(res, 'Survey not found', null, 404);

      const allQuestions = [
        ...(template.questions ?? []),
        ...((template.sections ?? []).flatMap((s: any) => s.questions ?? []))
      ];

      const questionAnalytics = allQuestions.map((q: any) => {
        const qAnswers = responses.flatMap((r: any) =>
          (r.answers ?? []).filter((a: any) => a.questionId === q.id)
        );
        const answerTexts = qAnswers.map((a: any) => a.answerText).filter(Boolean);
        const distribution: Record<string, number> = {};
        for (const text of answerTexts) {
          distribution[text] = (distribution[text] || 0) + 1;
        }
        return {
          questionId: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          totalAnswers: answerTexts.length,
          distribution,
        };
      });

      return sendSuccess(res, 'Survey analysis retrieved.', {
        surveyId: templateId,
        surveyTitle: template.title,
        totalResponses: responses.length,
        questionAnalytics,
      });
    } catch (err) { next(err); }
  }

  static async getCompanyHiringStats(req: Request, res: Response, next: NextFunction) {
    try {
      // Gather company/employer mentions across all survey answers
      const allResponses = await responseRepo.findAll();
      const companyCount: Record<string, number> = {};

      for (const response of allResponses) {
        for (const answer of (response as any).answers ?? []) {
          const q = (answer as any).question;
          if (!q) continue;
          const qText: string = q.questionText?.toLowerCase() ?? '';
          if (
            qText.includes('company') ||
            qText.includes('employer') ||
            qText.includes('organization') ||
            qText.includes('workplace')
          ) {
            const company = (answer.answerText ?? '').trim();
            if (company && company.length > 2) {
              companyCount[company] = (companyCount[company] || 0) + 1;
            }
          }
        }
      }

      const sorted = Object.entries(companyCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([name, count]) => ({ name, count }));

      return sendSuccess(res, 'Company hiring stats retrieved.', sorted);
    } catch (err) { next(err); }
  }

  static async sendSurveyInstantly(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const result = await tracerService.dispatchSurveyInstantly(templateId);
      return sendSuccess(res, 'Survey dispatched instantly to all target alumni.', result, 200);
    } catch (err) { next(err); }
  }

  static async activateSurveyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await surveyRepo.update(req.params.templateId, { isActive: true });
      await tracerService.dispatchSurveyInstantly(req.params.templateId).catch(() => {});
      return sendSuccess(res, 'Survey template activated and dispatched.', result);
    } catch (err) { next(err); }
  }

  static async deactivateSurveyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await surveyRepo.update(req.params.templateId, { isActive: false });
      return sendSuccess(res, 'Survey template deactivated.', result);
    } catch (err) { next(err); }
  }

  static async getResponsesBySurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const responses = await responseRepo.findBySurveyId(templateId);
      return sendSuccess(res, 'Responses retrieved.', responses);
    } catch (err) { next(err); }
  }

  static async testEngineExecution(req: Request, res: Response, next: NextFunction) {
    try {
      await tracerService.checkEligibleAlumni();
      await tracerService.sendReminderNotifications();
      const assignments = await assignmentRepo.findAll();
      const summary = {
        totalAssignmentsCount: assignments.length,
        pendingAssignments: assignments.filter(a => a.status === 'PENDING').length,
        inProgressAssignments: assignments.filter(a => a.status === 'IN_PROGRESS').length,
        completedAssignments: assignments.filter(a => a.status === 'COMPLETED').length,
        overdueAssignments: assignments.filter(a => a.status === 'OVERDUE').length,
        assignmentsByBatch: assignments.reduce((acc: any, a: any) => {
          const batch = a.alumni?.graduationYear ? `${a.alumni.graduationYear} GC` : 'Unknown';
          acc[batch] = (acc[batch] || 0) + 1;
          return acc;
        }, {}),
        message: 'Engine test executed successfully: Milestone counting (6, 12, 18, 24-month), multi-channel notifications (Email with http://localhost:5173/login, SMS, Dashboard), and recurring reminder triggers evaluated.'
      };
      return sendSuccess(res, 'Milestone tracer engine executed & tested successfully.', summary);
    } catch (err) { next(err); }
  }
}

