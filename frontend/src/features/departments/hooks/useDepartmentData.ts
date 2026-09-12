import { useCallback, useEffect, useState } from 'react';
import departmentService, {
  DepartmentAlumniRecord,
  DepartmentProfile,
  DepartmentStats,
} from '../services/department.service';

export interface NamedCount {
  name: string;
  count: number;
  percentage: number;
}

export interface CohortTrend {
  year: string;
  graduates: number;
  employed: number;
  employmentRate: number;
}

export interface DepartmentDerivedData {
  department: DepartmentProfile | null;
  stats: {
    totalAlumni: number;
    employed: number;
    unemployed: number;
    selfEmployed: number;
    employmentRate: number;
    unemploymentRate: number;
    selfEmploymentRate: number;
  };
  alumni: DepartmentAlumniRecord[];
  employmentTrend: CohortTrend[];
  employmentStatusDistribution: { status: string; count: number; percentage: number }[];
  topCompanies: NamedCount[];
  topIndustries: NamedCount[];
  topSkills: NamedCount[];
  locations: NamedCount[];
  averageSalary: number | null;
  salaryCount: number;
  verifiedCount: number;
  unverifiedCount: number;
  refetch?: () => Promise<void>;
}

const EMPTY: DepartmentDerivedData = {
  department: null,
  stats: {
    totalAlumni: 0,
    employed: 0,
    unemployed: 0,
    selfEmployed: 0,
    employmentRate: 0,
    unemploymentRate: 0,
    selfEmploymentRate: 0,
  },
  alumni: [],
  employmentTrend: [],
  employmentStatusDistribution: [],
  topCompanies: [],
  topIndustries: [],
  topSkills: [],
  locations: [],
  averageSalary: null,
  salaryCount: 0,
  verifiedCount: 0,
  unverifiedCount: 0,
};

const STATUS_LABELS: Record<string, string> = {
  EMPLOYED: 'Employed',
  UNEMPLOYED: 'Unemployed',
  SELF_EMPLOYED: 'Self-Employed',
};

function topCounts(values: Array<string | null | undefined>, total: number, limit = 8): NamedCount[] {
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

function derive(
  alumni: DepartmentAlumniRecord[] = [],
  stats?: Partial<DepartmentStats> | null,
  department: DepartmentProfile | null = null
): DepartmentDerivedData {
  const list = Array.isArray(alumni) ? alumni : [];
  const countByStatus: Record<string, number> = {};
  for (const record of list) {
    const key = record?.employmentStatus || 'UNKNOWN';
    countByStatus[key] = (countByStatus[key] || 0) + 1;
  }

  const totalAlumni = stats?.totalAlumni ?? list.length;
  const employed = stats?.employedAlumni ?? (countByStatus['EMPLOYED'] || 0);
  const selfEmployed = stats?.selfEmployedAlumni ?? countByStatus['SELF_EMPLOYED'] ?? 0;
  const unemployed = stats?.unemployedAlumni ?? (totalAlumni > 0 ? Math.max(0, totalAlumni - employed - selfEmployed) : 0);
  const employmentRate =
    typeof stats?.employmentRate === 'number'
      ? stats.employmentRate
      : totalAlumni > 0
        ? ((employed + selfEmployed) / totalAlumni) * 100
        : 0;
  const unemploymentRate = totalAlumni > 0 ? (unemployed / totalAlumni) * 100 : 0;
  const selfEmploymentRate = totalAlumni > 0 ? (selfEmployed / totalAlumni) * 100 : 0;

  const employmentTrend: CohortTrend[] = [];

  const yearMap: Record<number, { employed: number; total: number }> = {};
  for (const a of list) {
    const year = a?.graduationYear;
    if (!year) continue;
    if (!yearMap[year]) yearMap[year] = { employed: 0, total: 0 };
    yearMap[year].total += 1;
    const placed = a?.employmentStatus === 'EMPLOYED' || a?.employmentStatus === 'SELF_EMPLOYED';
    if (placed) yearMap[year].employed += 1;
  }
  for (const yearStr of Object.keys(yearMap).sort((a, b) => Number(a) - Number(b))) {
    const year = Number(yearStr);
    const { employed, total } = yearMap[year];
    employmentTrend.push({
      year: String(year),
      graduates: total,
      employed,
      employmentRate: total > 0 ? (employed / total) * 100 : 0,
    });
  }

  const employmentStatusDistribution = Object.keys(countByStatus)
    .filter((status) => countByStatus[status] > 0)
    .map((status) => ({
      status: STATUS_LABELS[status] || status,
      count: countByStatus[status],
      percentage: totalAlumni > 0 ? (countByStatus[status] / totalAlumni) * 100 : 0,
    }));

  const skillValues = list.flatMap((a) => (Array.isArray(a?.skills) ? a.skills : []));

  const salaries = list
    .map((a) => a?.salary)
    .filter((s): s is number => typeof s === 'number' && !Number.isNaN(s) && s > 0);
  const averageSalary =
    salaries.length > 0 ? Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length) : null;

  const verifiedCount = list.filter((a) => a?.isVerified).length;

  return {
    department,
    stats: {
      totalAlumni,
      employed,
      unemployed,
      selfEmployed,
      employmentRate,
      unemploymentRate,
      selfEmploymentRate,
    },
    alumni: list,
    employmentTrend,
    employmentStatusDistribution,
    topCompanies: topCounts(list.map((a) => a?.company), list.length),
    topIndustries: topCounts(list.map((a) => a?.industry), list.length),
    topSkills: topCounts(skillValues, list.length),
    locations: topCounts(list.map((a) => a?.location), list.length),
    averageSalary,
    salaryCount: salaries.length,
    verifiedCount,
    unverifiedCount: Math.max(0, list.length - verifiedCount),
  };
}

export function useDepartmentData() {
  const [data, setData] = useState<DepartmentDerivedData>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stats, alumni] = await Promise.all([
        departmentService.getDepartmentStats(),
        departmentService.getDepartmentAlumni(),
      ]);

      let department: DepartmentProfile | null = null;
      try {
        department = await departmentService.getDepartmentProfile();
      } catch {
        // Optional profile fetch fallback
      }

      const derived = derive(alumni, stats, department);
      derived.refetch = load;
      setData(derived);
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : 'Failed to load department data.';
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 403) {
        message = apiMessage || 'Your account is not authorized as a department head to view department-scoped data.';
      } else if (status === 401) {
        message = 'Your session has expired. Please sign in again.';
      } else if (apiMessage) {
        message = apiMessage;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}