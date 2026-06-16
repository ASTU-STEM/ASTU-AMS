import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';

import { PrismaDepartmentRepository } from '../infrastructure/repositories/PrismaDepartmentRepository';
import { PrismaDepartmentHeadRepository } from '../infrastructure/repositories/PrismaDepartmentHeadRepository';
import { PrismaAlumniDepartmentRepository } from '../infrastructure/repositories/PrismaAlumniDepartmentRepository';

import { GetDepartmentStats, GetDepartmentAlumni } from '../application/use-cases/DepartmentLookups';

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

  // Analytics endpoints returning mocked data structure for now
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Overview retrieved', {});
  }
  static async getEmploymentData(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Employment retrieved', {});
  }
  static async getEmployerFeedback(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Employer feedback retrieved', {});
  }
  static async getSkillGapData(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Skill gap retrieved', {});
  }
  static async getTracerSurveyData(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Tracer survey retrieved', {});
  }
  static async getCurriculumInsights(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Curriculum insights retrieved', {});
  }
  static async getAccreditationReports(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Accreditation reports retrieved', []);
  }
  static async getExportReports(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Export reports retrieved', []);
  }
}
