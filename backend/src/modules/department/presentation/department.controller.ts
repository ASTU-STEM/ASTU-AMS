import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';

import { PrismaDepartmentRepository } from '../infrastructure/repositories/PrismaDepartmentRepository';
import { PrismaDepartmentHeadRepository } from '../infrastructure/repositories/PrismaDepartmentHeadRepository';
import { PrismaAlumniDepartmentRepository } from '../infrastructure/repositories/PrismaAlumniDepartmentRepository';

import { GetDepartmentStats, GetDepartmentAlumni } from '../application/use-cases/DepartmentLookups';
import { GetDepartmentDashboardOverview } from '../application/use-cases/GetDepartmentDashboardOverview';

const deptRepo = new PrismaDepartmentRepository();
const headRepo = new PrismaDepartmentHeadRepository();
const alumniRepo = new PrismaAlumniDepartmentRepository();

export class DepartmentController {
  
  static async listDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const depts = await deptRepo.findAll();
      return sendSuccess(res, 'Departments list retrieved.', depts);
    } catch (err) { next(err); }
  }

  static async getDashboardOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const {
        department,
        academicYear,
        tracerPeriod,
        startYear,
        endYear,
        status,
        industry,
        location,
        salaryMin,
        salaryMax,
        search
      } = req.query;

      const useCase = new GetDepartmentDashboardOverview();
      const overview = await useCase.execute({
        userId: user?.userId || user?.id,
        userRole: user?.role,
        userDepartment: user?.department,
        department: department as string,
        academicYear: academicYear as string,
        tracerPeriod: tracerPeriod as string,
        startYear: startYear as string,
        endYear: endYear as string,
        status: status as string,
        industry: industry as string,
        location: location as string,
        salaryMin: salaryMin as string,
        salaryMax: salaryMax as string,
        search: search as string,
      });
      return sendSuccess(res, 'Department dashboard overview retrieved successfully.', overview);
    } catch (err) { next(err); }
  }

  static async getMyDepartmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetDepartmentStats(headRepo, alumniRepo);
      const stats = await useCase.execute(userId);
      return sendSuccess(res, 'Department stats retrieved.', stats);
    } catch (err) { next(err); }
  }

  static async getMyDepartmentAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetDepartmentAlumni(headRepo, alumniRepo);
      const alumni = await useCase.execute(userId);
      return sendSuccess(res, 'Department alumni retrieved.', alumni);
    } catch (err) { next(err); }
  }
}
