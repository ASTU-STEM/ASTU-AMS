import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { ApiError } from '../../../core/errors/ApiError';
import prisma from '../../../core/config/db';
import { PrismaAnalyticsRepository } from '../infrastructure/repositories/PrismaAnalyticsRepository';
import { GetAnalyticsReport } from '../application/use-cases/GetAnalyticsReport';
import { GetAlumniAnalytics } from '../application/use-cases/GetAlumniAnalytics';
import { GetEmployerAnalytics } from '../application/use-cases/GetEmployerAnalytics';
import { GetDepartmentAnalytics } from '../application/use-cases/GetDepartmentAnalytics';
import { GetCurriculumAnalytics } from '../application/use-cases/GetCurriculumAnalytics';
import { GetTracerAnalytics } from '../application/use-cases/GetTracerAnalytics';
import { GetAnalyticsInsights } from '../application/use-cases/GetAnalyticsInsights';
import { GetAnalyticsRecommendations } from '../application/use-cases/GetAnalyticsRecommendations';

const repo = new PrismaAnalyticsRepository();

export class AnalyticsController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      let { academicYear, department } = req.query;

      // Department heads only see their own department analytics
      if (user?.role === 'DEPARTMENT_HEAD') {
        const head = await prisma.departmentHeadProfile.findUnique({
          where: { userId: user.userId },
          include: { department: true },
        });
        if (!head?.department) {
          throw new ApiError('Department head profile not found.', 403);
        }
        department = head.department.name;
      }

      const useCase = new GetAnalyticsReport(repo);
      const result = await useCase.execute({
        academicYear: academicYear as string,
        department: department as string,
      });
      return sendSuccess(res, 'Consolidated dashboard analytics retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  static async getEmployment(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAlumniAnalytics(repo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Employment analytics retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  static async getEmployers(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetEmployerAnalytics(repo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Employer analytics retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetDepartmentAnalytics(repo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Departmental analytics retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  static async getSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetCurriculumAnalytics(repo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Curriculum and skill gap analytics retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  static async getTracer(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetTracerAnalytics(repo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Tracer survey analytics retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  static async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAnalyticsInsights(repo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Key insights retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  static async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAnalyticsRecommendations(repo);
      const result = await useCase.execute();
      return sendSuccess(res, 'Curriculum recommendations retrieved successfully.', result);
    } catch (err) { next(err); }
  }
}
