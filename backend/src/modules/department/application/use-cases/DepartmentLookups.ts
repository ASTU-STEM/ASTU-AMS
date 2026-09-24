import { IDepartmentHeadRepository } from '../ports/IDepartmentHeadRepository';
import { IAlumniDepartmentRepository } from '../ports/IAlumniDepartmentRepository';
import { IDepartmentRepository } from '../ports/IDepartmentRepository';
import { DepartmentStats, Department } from '../../domain/entities/Department';
import { UnauthorizedDepartmentActionError } from '../../domain/errors/DepartmentErrors';

async function resolveDepartmentId(
  headRepo: IDepartmentHeadRepository,
  userId: string,
  departmentIdOverride?: string
): Promise<string> {
  if (departmentIdOverride) {
    return departmentIdOverride;
  }
  const head = await headRepo.findByUserId(userId);
  if (!head) {
    throw new UnauthorizedDepartmentActionError('User is not assigned as a department head.');
  }
  return head.departmentId;
}

export class GetMyDepartment {
  constructor(
    private readonly headRepo: IDepartmentHeadRepository,
    private readonly deptRepo: IDepartmentRepository
  ) {}

  async execute(userId: string, departmentIdOverride?: string): Promise<Department> {
    const departmentId = await resolveDepartmentId(this.headRepo, userId, departmentIdOverride);
    const dept = await this.deptRepo.findById(departmentId);
    if (!dept) {
      throw new UnauthorizedDepartmentActionError('Department not found for this department head.');
    }
    return dept;
  }
}

export class GetDepartmentStats {
  constructor(
    private readonly headRepo: IDepartmentHeadRepository,
    private readonly alumniRepo: IAlumniDepartmentRepository
  ) {}

  async execute(userId: string, departmentIdOverride?: string): Promise<DepartmentStats> {
    const departmentId = await resolveDepartmentId(this.headRepo, userId, departmentIdOverride);
    const alumni = await this.alumniRepo.findByDepartmentId(departmentId);

    const totalAlumni = alumni.length;
    const employedAlumni = alumni.filter(a => a.employmentStatus === 'EMPLOYED').length;
    const selfEmployedAlumni = alumni.filter(a => a.employmentStatus === 'SELF_EMPLOYED').length;
    const unemployedAlumni = Math.max(0, totalAlumni - employedAlumni - selfEmployedAlumni);
    const placedAlumni = employedAlumni + selfEmployedAlumni;
    const employmentRate = totalAlumni > 0 ? (placedAlumni / totalAlumni) * 100 : 0;

    const salaries = alumni
      .map(a => a.salary)
      .filter((s): s is number => typeof s === 'number' && !Number.isNaN(s) && s > 0);
    const averageSalary = salaries.length > 0
      ? Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length)
      : null;

    return new DepartmentStats(
      totalAlumni,
      employedAlumni,
      employmentRate,
      selfEmployedAlumni,
      unemployedAlumni,
      averageSalary
    );
  }
}

export class GetDepartmentAlumni {
  constructor(
    private readonly headRepo: IDepartmentHeadRepository,
    private readonly alumniRepo: IAlumniDepartmentRepository
  ) {}

  async execute(userId: string, departmentIdOverride?: string) {
    const departmentId = await resolveDepartmentId(this.headRepo, userId, departmentIdOverride);
    return await this.alumniRepo.findByDepartmentId(departmentId);
  }
}

// ─── Department Analytics ────────────────────────────────────────────────────

export interface NamedRank {
  name: string;
  count: number;
  percentage: number;
}

export interface CohortPoint {
  year: string;
  graduates: number;
  employed: number;
  employmentRate: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface DepartmentAnalytics {
  totalAlumni: number;
  employed: number;
  selfEmployed: number;
  unemployed: number;
  employmentRate: number;
  unemploymentRate: number;
  selfEmploymentRate: number;
  averageSalary: number | null;
  salaryCount: number;
  verifiedCount: number;
  unverifiedCount: number;
  employmentTrend: CohortPoint[];
  employmentStatusDistribution: StatusDistribution[];
  topCompanies: NamedRank[];
  topIndustries: NamedRank[];
  topSkills: NamedRank[];
  locations: NamedRank[];
}

const STATUS_LABELS: Record<string, string> = {
  EMPLOYED: 'Employed',
  UNEMPLOYED: 'Unemployed',
  SELF_EMPLOYED: 'Self-Employed',
};

function topCounts(values: Array<string | null | undefined>, total: number, limit = 8): NamedRank[] {
  const map: Record<string, number> = {};
  for (const value of values) {
    const key = (value || '').trim();
    if (!key) continue;
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export class GetDepartmentAnalytics {
  constructor(
    private readonly headRepo: IDepartmentHeadRepository,
    private readonly alumniRepo: IAlumniDepartmentRepository
  ) {}

  async execute(userId: string, departmentIdOverride?: string): Promise<DepartmentAnalytics> {
    const departmentId = await resolveDepartmentId(this.headRepo, userId, departmentIdOverride);
    const alumni = await this.alumniRepo.findByDepartmentId(departmentId);

    const totalAlumni = alumni.length;
    const employed = alumni.filter((a) => a.employmentStatus === 'EMPLOYED').length;
    const selfEmployed = alumni.filter((a) => a.employmentStatus === 'SELF_EMPLOYED').length;
    const unemployed = Math.max(0, totalAlumni - employed - selfEmployed);
    const placedAlumni = employed + selfEmployed;
    const employmentRate = totalAlumni > 0 ? (placedAlumni / totalAlumni) * 100 : 0;
    const unemploymentRate = totalAlumni > 0 ? (unemployed / totalAlumni) * 100 : 0;
    const selfEmploymentRate = totalAlumni > 0 ? (selfEmployed / totalAlumni) * 100 : 0;

    // Employment trend by graduation year
    const yearMap: Record<number, { employed: number; total: number }> = {};
    for (const a of alumni) {
      const year = a.graduationYear;
      if (!year) continue;
      if (!yearMap[year]) yearMap[year] = { employed: 0, total: 0 };
      yearMap[year].total += 1;
      const placed = a.employmentStatus === 'EMPLOYED' || a.employmentStatus === 'SELF_EMPLOYED';
      if (placed) yearMap[year].employed += 1;
    }
    const employmentTrend: CohortPoint[] = Object.keys(yearMap)
      .sort((a, b) => Number(a) - Number(b))
      .map((yearStr) => {
        const year = Number(yearStr);
        const { employed: e, total } = yearMap[year];
        return {
          year: String(year),
          graduates: total,
          employed: e,
          employmentRate: total > 0 ? (e / total) * 100 : 0,
        };
      });

    // Employment status distribution
    const countByStatus: Record<string, number> = {};
    for (const a of alumni) {
      const key = a.employmentStatus || 'UNKNOWN';
      countByStatus[key] = (countByStatus[key] || 0) + 1;
    }
    const employmentStatusDistribution: StatusDistribution[] = Object.keys(countByStatus)
      .filter((status) => countByStatus[status] > 0)
      .map((status) => ({
        status: STATUS_LABELS[status] || status,
        count: countByStatus[status],
        percentage: totalAlumni > 0 ? (countByStatus[status] / totalAlumni) * 100 : 0,
      }));

    const salaries = alumni
      .map((a) => a.salary)
      .filter((s): s is number => typeof s === 'number' && !Number.isNaN(s) && s > 0);
    const averageSalary = salaries.length > 0
      ? Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length)
      : null;

    const verifiedCount = alumni.filter((a) => a.isVerified).length;
    const skillValues = alumni.flatMap((a) => (Array.isArray(a.skills) ? a.skills : []));

    return {
      totalAlumni,
      employed,
      selfEmployed,
      unemployed,
      employmentRate,
      unemploymentRate,
      selfEmploymentRate,
      averageSalary,
      salaryCount: salaries.length,
      verifiedCount,
      unverifiedCount: Math.max(0, totalAlumni - verifiedCount),
      employmentTrend,
      employmentStatusDistribution,
      topCompanies: topCounts(alumni.map((a) => a.company), totalAlumni),
      topIndustries: topCounts(alumni.map((a) => a.industry), totalAlumni),
      topSkills: topCounts(skillValues, totalAlumni),
      locations: topCounts(alumni.map((a) => a.location), totalAlumni),
    };
  }
}
