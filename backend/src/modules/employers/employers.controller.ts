import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { sendSuccess } from '../../utils/response.utils';

export class EmployersController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const employers = await prisma.employerProfile.findMany({ orderBy: { companyName: 'asc' } });
      return sendSuccess(res, 'Employers list', employers);
    } catch (err: any) {
      next(err);
    }
  }
}

export default EmployersController;
