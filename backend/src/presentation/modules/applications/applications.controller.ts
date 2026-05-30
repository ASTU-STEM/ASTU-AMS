import { Request, Response, NextFunction } from 'express';
import prisma from '../../../infrastructure/config/db';
import { sendSuccess, sendError } from '../../../shared/utils/response.utils';

export class ApplicationsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const apps = await prisma.jobApplication.findMany({ orderBy: { createdAt: 'desc' } });
      return sendSuccess(res, 'Applications list', apps);
    } catch (err: any) {
      next(err);
    }
  }
}

export default ApplicationsController;
