import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { sendSuccess } from '../../utils/response.utils';

export class DepartmentsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const depts = await prisma.department.findMany({ orderBy: { name: 'asc' } });
      return sendSuccess(res, 'Departments list', depts);
    } catch (err: any) {
      next(err);
    }
  }
}

export default DepartmentsController;
