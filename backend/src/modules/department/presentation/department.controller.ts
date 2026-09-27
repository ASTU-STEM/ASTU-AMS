import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { ApiError } from '../../../core/errors/ApiError';

import { PrismaDepartmentRepository } from '../infrastructure/repositories/PrismaDepartmentRepository';
import { PrismaDepartmentHeadRepository } from '../infrastructure/repositories/PrismaDepartmentHeadRepository';
import { PrismaAlumniDepartmentRepository } from '../infrastructure/repositories/PrismaAlumniDepartmentRepository';

import { GetDepartmentStats, GetDepartmentAlumni, GetMyDepartment, GetDepartmentAnalytics } from '../application/use-cases/DepartmentLookups';

const deptRepo = new PrismaDepartmentRepository();
const headRepo = new PrismaDepartmentHeadRepository();
const alumniRepo = new PrismaAlumniDepartmentRepository();

function resolveOverride(req: Request): string | undefined {
  const user = (req as any).user;
  const queried = typeof req.query.departmentId === 'string' ? req.query.departmentId.trim() : '';

  // Both admin tiers may read any department. SUPER_ADMIN was previously
  // excluded, which left the bootstrap super-admin account unable to read
  // department analytics at all.
  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    if (!queried) {
      throw new ApiError('Admins must provide ?departmentId= to access department-scoped data.', 400);
    }
    return queried;
  }

  // Department heads always use their assigned profile; ignore query overrides.
  return undefined;
}

export class DepartmentController {
  
  static async listDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const depts = await deptRepo.findAll();
      return sendSuccess(res, 'Departments list retrieved.', depts);
    } catch (err) { next(err); }
  }

  static async getMyDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const override = resolveOverride(req);
      const useCase = new GetMyDepartment(headRepo, deptRepo);
      const dept = await useCase.execute(userId, override);
      return sendSuccess(res, 'My department retrieved.', dept);
    } catch (err) { next(err); }
  }

  static async getMyDepartmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const override = resolveOverride(req);
      const useCase = new GetDepartmentStats(headRepo, alumniRepo);
      const stats = await useCase.execute(userId, override);
      return sendSuccess(res, 'Department stats retrieved.', stats);
    } catch (err) { next(err); }
  }

  static async getMyDepartmentAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const override = resolveOverride(req);
      const useCase = new GetDepartmentAlumni(headRepo, alumniRepo);
      const alumni = await useCase.execute(userId, override);
      return sendSuccess(res, 'Department alumni retrieved.', alumni);
    } catch (err) { next(err); }
  }

  static async getMyDepartmentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const override = resolveOverride(req);
      const useCase = new GetDepartmentAnalytics(headRepo, alumniRepo);
      const analytics = await useCase.execute(userId, override);
      return sendSuccess(res, 'Department analytics retrieved.', analytics);
    } catch (err) { next(err); }
  }
}
