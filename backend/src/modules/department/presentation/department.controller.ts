import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';

import { PrismaDepartmentRepository } from '../infrastructure/repositories/PrismaDepartmentRepository';
import { PrismaDepartmentHeadRepository } from '../infrastructure/repositories/PrismaDepartmentHeadRepository';
import { PrismaAlumniDepartmentRepository } from '../infrastructure/repositories/PrismaAlumniDepartmentRepository';

import { GetDepartmentStats, GetDepartmentAlumni } from '../application/use-cases/DepartmentLookups';
import { GetDepartmentDashboardOverview } from '../application/use-cases/GetDepartmentDashboardOverview';
import { UnauthorizedDepartmentActionError } from '../domain/errors/DepartmentErrors';
import { DepartmentStats } from '../domain/entities/Department';

const deptRepo = new PrismaDepartmentRepository();
const headRepo = new PrismaDepartmentHeadRepository();
const alumniRepo = new PrismaAlumniDepartmentRepository();

function buildAnalyticsFromAlumni(alumni: Array<{
  employmentStatus?: string | null;
  salary?: number | null;
  isVerified?: boolean;
  company?: string | null;
  industry?: string | null;
  skills?: string[] | null;
  location?: string | null;
  graduationYear?: number | null;
}>) {
  const totalAlumni = alumni.length;
  const employed = alumni.filter((a) => a.employmentStatus === 'EMPLOYED').length;
  const unemployed = alumni.filter((a) => a.employmentStatus === 'UNEMPLOYED').length;
  const selfEmployed = alumni.filter((a) => a.employmentStatus === 'SELF_EMPLOYED').length;
  const unspecified = totalAlumni - employed - unemployed - selfEmployed;
  const employmentRate = totalAlumni > 0 ? (employed / totalAlumni) * 100 : 0;
  const salaries = alumni.map((a) => a.salary).filter((s): s is number => typeof s === 'number' && !Number.isNaN(s));
  const averageSalary = salaries.length > 0 ? salaries.reduce((sum, s) => sum + s, 0) / salaries.length : null;
  const sortedSalaries = [...salaries].sort((a, b) => a - b);
  const medianSalary =
    sortedSalaries.length === 0
      ? null
      : sortedSalaries.length % 2 === 1
        ? sortedSalaries[Math.floor(sortedSalaries.length / 2)]
        : (sortedSalaries[sortedSalaries.length / 2 - 1] + sortedSalaries[sortedSalaries.length / 2]) / 2;

  const countBy = (key: 'company' | 'industry' | 'location') => {
    const map = new Map<string, number>();
    for (const a of alumni) {
      const value = (a[key] || '').trim();
      if (!value) continue;
      map.set(value, (map.get(value) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalAlumni > 0 ? Math.round((count / totalAlumni) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const skillMap = new Map<string, number>();
  for (const a of alumni) {
    for (const skill of a.skills || []) {
      const value = String(skill || '').trim();
      if (!value) continue;
      skillMap.set(value, (skillMap.get(value) || 0) + 1);
    }
  }

  const yearMap = new Map<string, { graduates: number; employed: number }>();
  for (const a of alumni) {
    const year = a.graduationYear ? String(a.graduationYear) : 'Unknown';
    const bucket = yearMap.get(year) || { graduates: 0, employed: 0 };
    bucket.graduates += 1;
    if (a.employmentStatus === 'EMPLOYED') bucket.employed += 1;
    yearMap.set(year, bucket);
  }

  return {
    totalAlumni,
    employed,
    unemployed,
    selfEmployed,
    unspecified,
    employmentRate,
    unemploymentRate: totalAlumni > 0 ? (unemployed / totalAlumni) * 100 : 0,
    selfEmploymentRate: totalAlumni > 0 ? (selfEmployed / totalAlumni) * 100 : 0,
    employmentTrend: Array.from(yearMap.entries())
      .map(([year, stats]) => ({
        year,
        graduates: stats.graduates,
        employed: stats.employed,
        employmentRate: stats.graduates > 0 ? (stats.employed / stats.graduates) * 100 : 0,
      }))
      .sort((a, b) => a.year.localeCompare(b.year)),
    employmentStatusDistribution: [
      { status: 'Employed', count: employed, percentage: totalAlumni > 0 ? Math.round((employed / totalAlumni) * 1000) / 10 : 0 },
      { status: 'Unemployed', count: unemployed, percentage: totalAlumni > 0 ? Math.round((unemployed / totalAlumni) * 1000) / 10 : 0 },
      { status: 'Self-Employed', count: selfEmployed, percentage: totalAlumni > 0 ? Math.round((selfEmployed / totalAlumni) * 1000) / 10 : 0 },
      { status: 'Unspecified', count: unspecified, percentage: totalAlumni > 0 ? Math.round((unspecified / totalAlumni) * 1000) / 10 : 0 },
    ],
    topCompanies: countBy('company'),
    topIndustries: countBy('industry'),
    topSkills: Array.from(skillMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalAlumni > 0 ? Math.round((count / totalAlumni) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    locations: countBy('location'),
    averageSalary,
    medianSalary,
    salaryCount: salaries.length,
    salaryCoverage: totalAlumni > 0 ? Math.round((salaries.length / totalAlumni) * 1000) / 10 : 0,
    verifiedCount: alumni.filter((a) => a.isVerified).length,
    unverifiedCount: alumni.filter((a) => !a.isVerified).length,
  };
}

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

  static async getMyDepartmentProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const head = await headRepo.findByUserId(userId);
      if (!head) {
        throw new UnauthorizedDepartmentActionError('User is not assigned as a department head.');
      }
      const dept = await deptRepo.findById(head.departmentId);
      if (!dept) {
        throw new UnauthorizedDepartmentActionError('Department profile not found for this head.');
      }
      return sendSuccess(res, 'Department profile retrieved.', dept);
    } catch (err) { next(err); }
  }

  static async getDepartmentProfileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.params;
      const dept = await deptRepo.findById(departmentId);
      if (!dept) {
        return res.status(404).json({ success: false, message: 'Department not found.' });
      }
      return sendSuccess(res, 'Department profile retrieved.', dept);
    } catch (err) { next(err); }
  }

  static async getMyDepartmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const useCase = new GetDepartmentStats(headRepo, alumniRepo);
      const stats = await useCase.execute(userId);
      return sendSuccess(res, 'Department stats retrieved.', stats);
    } catch (err) { next(err); }
  }

  static async getDepartmentStatsById(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.params;
      const dept = await deptRepo.findById(departmentId);
      if (!dept) {
        return res.status(404).json({ success: false, message: 'Department not found.' });
      }
      const alumni = await alumniRepo.findByDepartmentId(departmentId);
      const totalAlumni = alumni.length;
      const employedAlumni = alumni.filter((a) => a.employmentStatus === 'EMPLOYED').length;
      const employmentRate = totalAlumni > 0 ? (employedAlumni / totalAlumni) * 100 : 0;
      const stats = new DepartmentStats(totalAlumni, employedAlumni, employmentRate);
      return sendSuccess(res, 'Department stats retrieved.', stats);
    } catch (err) { next(err); }
  }

  static async getMyDepartmentAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const useCase = new GetDepartmentAlumni(headRepo, alumniRepo);
      const alumni = await useCase.execute(userId);
      return sendSuccess(res, 'Department alumni retrieved.', alumni);
    } catch (err) { next(err); }
  }

  static async getDepartmentAlumniById(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.params;
      const dept = await deptRepo.findById(departmentId);
      if (!dept) {
        return res.status(404).json({ success: false, message: 'Department not found.' });
      }
      const alumni = await alumniRepo.findByDepartmentId(departmentId);
      return sendSuccess(res, 'Department alumni retrieved.', alumni);
    } catch (err) { next(err); }
  }

  static async getMyDepartmentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const head = await headRepo.findByUserId(userId);
      if (!head) {
        throw new UnauthorizedDepartmentActionError('User is not assigned as a department head.');
      }
      const alumni = await alumniRepo.findByDepartmentId(head.departmentId);
      return sendSuccess(res, 'Department analytics retrieved.', buildAnalyticsFromAlumni(alumni as any));
    } catch (err) { next(err); }
  }

  static async getDepartmentAnalyticsById(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.params;
      const dept = await deptRepo.findById(departmentId);
      if (!dept) {
        return res.status(404).json({ success: false, message: 'Department not found.' });
      }
      const alumni = await alumniRepo.findByDepartmentId(departmentId);
      return sendSuccess(res, 'Department analytics retrieved.', buildAnalyticsFromAlumni(alumni as any));
    } catch (err) { next(err); }
  }
}
