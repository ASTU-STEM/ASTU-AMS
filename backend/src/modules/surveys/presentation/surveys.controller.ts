import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
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

const surveyRepo = new PrismaSurveyRepository();
const responseRepo = new PrismaSurveyResponseRepository();
const assignmentRepo = new PrismaSurveyAssignmentRepository();

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
      const useCase = new GetSurveys(surveyRepo);
      const result = await useCase.execute(false);
      return sendSuccess(res, 'All surveys retrieved.', result);
    } catch (err) { next(err); }
  }

  static async createSurveyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSurveyTemplateSchema.parse(req.body);
      const useCase = new CreateSurveyTemplate(surveyRepo);
      const result = await useCase.execute({
        ...data,
        isActive: data.isActive ?? true,
        isArchived: false,
      } as any);
      return sendSuccess(res, 'Survey template created successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async listSurveyTemplates(req: Request, res: Response, next: NextFunction) {
    try {
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
      const data = updateSurveyTemplateSchema.parse(req.body);
      const useCase = new UpdateSurveyTemplate(surveyRepo);
      const result = await useCase.execute(req.params.templateId, data as any);
      return sendSuccess(res, 'Survey template updated successfully.', result);
    } catch (err) { next(err); }
  }

  static async archiveSurveyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new ArchiveSurveyTemplate(surveyRepo);
      const result = await useCase.execute(req.params.templateId);
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
      const useCase = new GetSurveyStatistics(assignmentRepo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Survey statistics retrieved.', result);
    } catch (err) { next(err); }
  }

  static async getCompletionReport(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetCompletionReport(assignmentRepo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Completion report retrieved.', result);
    } catch (err) { next(err); }
  }

  static async getMySurveys(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const alumniId = await getAlumniIdFromUser(userId);
      const useCase = new GetAlumniAssignments(assignmentRepo);
      const assignments = await useCase.execute(alumniId);
      const active = assignments.filter((assignment) => ['PENDING', 'IN_PROGRESS'].includes(assignment.status));
      return sendSuccess(res, 'Assigned surveys retrieved.', active);
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
      const result = await useCase.execute(alumniId, data.assignmentId, data.answers);
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
}
