import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';

import { PrismaAnalyticsRepository } from '../infrastructure/repositories/PrismaAnalyticsRepository';
import { GetAnalyticsReport } from '../application/use-cases/GetAnalyticsReport';

const repo = new PrismaAnalyticsRepository();

export class AnalyticsController {
  static async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAnalyticsReport(repo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Analytics report retrieved successfully.', result);
    } catch (err) { next(err); }
  }
}
