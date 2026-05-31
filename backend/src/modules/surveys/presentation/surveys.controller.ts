import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { createSurveySchema, submitResponseSchema } from './surveys.validation';

import { PrismaSurveyRepository } from '../infrastructure/repositories/PrismaSurveyRepository';
import { PrismaSurveyResponseRepository } from '../infrastructure/repositories/PrismaSurveyResponseRepository';

import { CreateSurvey, GetSurveys } from '../application/use-cases/ManageSurveys';
import { SubmitSurveyResponse } from '../application/use-cases/SubmitSurveyResponse';

const surveyRepo = new PrismaSurveyRepository();
const responseRepo = new PrismaSurveyResponseRepository();

export class SurveysController {
  
  static async createSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSurveySchema.parse(req.body);
      const useCase = new CreateSurvey(surveyRepo);
      const result = await useCase.execute(data);
      return sendSuccess(res, 'Survey created successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async listActiveSurveys(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetSurveys(surveyRepo);
      // Pass true to only get active surveys
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

  static async submitResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const alumniId = (req as any).user?.userId; // Using userId as alumniId for simplicity
      const { answers } = submitResponseSchema.parse(req.body);
      const useCase = new SubmitSurveyResponse(surveyRepo, responseRepo);
      const result = await useCase.execute(req.params.surveyId, alumniId, answers);
      return sendSuccess(res, 'Survey response submitted successfully.', result, 201);
    } catch (err) { next(err); }
  }
}
