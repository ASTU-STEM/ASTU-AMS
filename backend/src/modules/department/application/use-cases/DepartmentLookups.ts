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
    const {
      employed,
      selfEmployed,
      unemployed,
      employmentRate,
    } = summarisePlacement(alumni);
    const salaries = collectSalaries(alumni);
    const averageSalary = salaries.length > 0
      ? Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length)
      : null;

    return new DepartmentStats(
      totalAlumni,
      employed,
      employmentRate,
      selfEmployed,
      unemployed,
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
  /** Graduates who have never set a status. Excluded from the unemployment rate. */
  unspecified: number;
  employmentRate: number;
  unemploymentRate: number;
  selfEmploymentRate: number;
  averageSalary: number | null;
  medianSalary: number | null;
  salaryCount: number;
  /** Share of the department that has actually reported a salary (0-100). */
  salaryCoverage: number;
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

/**
 * Statuses the platform actually recognises. Anything else — including a
 * graduate who has simply never set their status — must be reported as
 * "Unspecified" rather than silently folded into "Unemployed", which would
 * overstate graduate unemployment in accreditation figures.
 */
const KNOWN_STATUSES = new Set(Object.keys(STATUS_LABELS));
const UNSPECIFIED_LABEL = 'Unspecified';

/**
 * Derives the placement breakdown from real records.
 *
 * `unemployed` counts only graduates explicitly marked UNEMPLOYED. The
 * remainder is reported as `unspecified`, so the three figures always
 * reconcile to the department total instead of quietly inflating unemployment.
 */
function summarisePlacement(alumni: Array<{ employmentStatus?: string | null }>) {
  const total = alumni.length;
  const employed = alumni.filter((a) => a.employmentStatus === 'EMPLOYED').length;
  const selfEmployed = alumni.filter((a) => a.employmentStatus === 'SELF_EMPLOYED').length;
  const unemployed = alumni.filter((a) => a.employmentStatus === 'UNEMPLOYED').length;
  const unspecified = total - employed - selfEmployed - unemployed;
  const placed = employed + selfEmployed;
  return {
    total,
    employed,
    selfEmployed,
    unemployed,
    unspecified: Math.max(0, unspecified),
    employmentRate: total > 0 ? (placed / total) * 100 : 0,
    // Denominator excludes graduates who never reported a status, so the
    // unemployment rate is not diluted by missing data.
    unemploymentRate: total - unspecified > 0 ? (unemployed / (total - unspecified)) * 100 : 0,
    selfEmploymentRate: total > 0 ? (selfEmployed / total) * 100 : 0,
  };
}

/** Median is reported next to the mean because pay data is heavily skewed. */
function medianSalary(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : Math.round(sorted[mid]);
}

function collectSalaries(alumni: Array<{ salary?: number | null }>): number[] {
  return alumni
    .map((a) => a.salary)
    .filter((s): s is number => typeof s === 'number' && !Number.isNaN(s) && s > 0);
}

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

    const {
      total: totalAlumni,
      employed,
      selfEmployed,
      unemployed,
      unspecified,
      employmentRate,
      unemploymentRate,
      selfEmploymentRate,
    } = summarisePlacement(alumni);

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

    // Employment status distribution. Unrecognised/missing statuses are
    // reported honestly as "Unspecified" instead of being counted as unemployed.
    const countByStatus: Record<string, number> = {};
    for (const a of alumni) {
      const raw = a.employmentStatus;
      const key = raw && KNOWN_STATUSES.has(raw) ? raw : UNSPECIFIED_LABEL;
      countByStatus[key] = (countByStatus[key] || 0) + 1;
    }
    const employmentStatusDistribution: StatusDistribution[] = Object.keys(countByStatus)
      .filter((status) => countByStatus[status] > 0)
      .map((status) => ({
        status: status === UNSPECIFIED_LABEL ? UNSPECIFIED_LABEL : STATUS_LABELS[status] || status,
        count: countByStatus[status],
        percentage: totalAlumni > 0 ? (countByStatus[status] / totalAlumni) * 100 : 0,
      }));

    const salaries = collectSalaries(alumni);
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
      unspecified,
      employmentRate,
      unemploymentRate,
      selfEmploymentRate,
      averageSalary,
      medianSalary: medianSalary(salaries),
      salaryCount: salaries.length,
      salaryCoverage: totalAlumni > 0 ? (salaries.length / totalAlumni) * 100 : 0,
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
