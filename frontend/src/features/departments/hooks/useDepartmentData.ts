import { useCallback, useEffect, useState } from 'react';
import departmentService, {
  DepartmentAlumniRecord,
  DepartmentAnalytics,
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
    /** Graduates with no reported status; excluded from the unemployment rate. */
    unspecified: number;
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
  medianSalary: number | null;
  salaryCount: number;
  salaryCoverage: number;
  verifiedCount: number;
  unverifiedCount: number;
}

const EMPTY: DepartmentDerivedData = {
  department: null,
  stats: {
    totalAlumni: 0,
    employed: 0,
    unemployed: 0,
    selfEmployed: 0,
    unspecified: 0,
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
  medianSalary: null,
  salaryCount: 0,
  salaryCoverage: 0,
  verifiedCount: 0,
  unverifiedCount: 0,
};

const medianOf = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : Math.round(sorted[mid]);
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
  analytics?: DepartmentAnalytics | null,
  department: DepartmentProfile | null = null
): DepartmentDerivedData {
  const list = Array.isArray(alumni) ? alumni : [];
  const countByStatus: Record<string, number> = {};
  for (const record of list) {
    const key = record?.employmentStatus || 'Unspecified';
    countByStatus[key] = (countByStatus[key] || 0) + 1;
  }

  if (analytics) {
    return {
      department,
      stats: {
        totalAlumni: analytics.totalAlumni,
        employed: analytics.employed,
        unemployed: analytics.unemployed,
        selfEmployed: analytics.selfEmployed,
        unspecified: analytics.unspecified ?? 0,
        employmentRate: analytics.employmentRate,
        unemploymentRate: analytics.unemploymentRate,
        selfEmploymentRate: analytics.selfEmploymentRate,
      },
      alumni: list,
      employmentTrend: analytics.employmentTrend ?? [],
      employmentStatusDistribution: analytics.employmentStatusDistribution ?? [],
      topCompanies: analytics.topCompanies ?? [],
      topIndustries: analytics.topIndustries ?? [],
      topSkills: analytics.topSkills ?? [],
      locations: analytics.locations ?? [],
      averageSalary: analytics.averageSalary,
      medianSalary: analytics.medianSalary ?? null,
      salaryCount: analytics.salaryCount,
      salaryCoverage: analytics.salaryCoverage ?? 0,
      verifiedCount: analytics.verifiedCount,
      unverifiedCount: analytics.unverifiedCount,
    };
  }

  const totalAlumni = stats?.totalAlumni ?? list.length;
  const employed = stats?.employedAlumni ?? (countByStatus['EMPLOYED'] || 0);
  const selfEmployed = stats?.selfEmployedAlumni ?? countByStatus['SELF_EMPLOYED'] ?? 0;
  // Count only graduates explicitly marked UNEMPLOYED. Anyone without a status
  // is reported as unspecified, never silently absorbed into unemployment.
  const unemployed = stats?.unemployedAlumni ?? (countByStatus['UNEMPLOYED'] || 0);
  const unspecified = Math.max(0, totalAlumni - employed - selfEmployed - unemployed);
  const employmentRate =
    typeof stats?.employmentRate === 'number'
      ? stats.employmentRate
      : totalAlumni > 0
        ? ((employed + selfEmployed) / totalAlumni) * 100
        : 0;
  const reported = totalAlumni - unspecified;
  const unemploymentRate = reported > 0 ? (unemployed / reported) * 100 : 0;
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
      status: status === 'Unspecified' ? 'Unspecified' : STATUS_LABELS[status] || status,
      count: countByStatus[status],
      percentage: totalAlumni > 0 ? (countByStatus[status] / totalAlumni) * 100 : 0,
    }));

  const skillValues = list.flatMap((a) => (Array.isArray(a?.skills) ? a.skills : []));

  const salaries = list
    .map((a) => a?.salary)
    .filter((s): s is number => typeof s === 'number' && !Number.isNaN(s) && s > 0);
  const averageSalary =
    typeof stats?.averageSalary === 'number' && stats.averageSalary > 0
      ? Math.round(stats.averageSalary)
      : salaries.length > 0
        ? Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length)
        : null;

  const verifiedCount = list.filter((a) => a?.isVerified).length;

  return {
    department,
    stats: {
      totalAlumni,
      employed,
      unemployed,
      selfEmployed,
      unspecified,
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
    medianSalary: salaries.length > 0 ? medianOf(salaries) : null,
    salaryCount: salaries.length,
    salaryCoverage: totalAlumni > 0 ? (salaries.length / totalAlumni) * 100 : 0,
    verifiedCount,
    unverifiedCount: Math.max(0, list.length - verifiedCount),
  };
}

export function useDepartmentData(departmentId?: string | null, enabled = true) {
  const [data, setData] = useState<DepartmentDerivedData>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsRes, statsRes, alumniRes] = await Promise.allSettled([
        departmentService.getDepartmentAnalytics(departmentId),
        departmentService.getDepartmentStats(departmentId),
        departmentService.getDepartmentAlumni(departmentId),
      ]);

      if (alumniRes.status === 'rejected') {
        throw alumniRes.reason;
      }

      let analytics: DepartmentAnalytics | null = null;
      if (analyticsRes.status === 'fulfilled') {
        analytics = analyticsRes.value;
      } else if (statsRes.status === 'rejected') {
        // Neither the analytics endpoint nor the stats endpoint responded.
        throw analyticsRes.reason;
      }
      const stats = statsRes.status === 'fulfilled' ? statsRes.value : null;

      let department: DepartmentProfile | null = null;
      try {
        department = await departmentService.getDepartmentProfile(departmentId);
      } catch {
        // Optional profile fetch fallback
      }

      setData(derive(alumniRes.value, stats, analytics, department));
      setLastUpdated(Date.now());
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
      setData(EMPTY);
      setLastUpdated(null);
    } finally {
      setIsLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    // Admins get a 400 from the server until a department is picked, so hold the
    // first request until the switcher has resolved one.
    if (!enabled) {
      setIsLoading(true);
      return;
    }
    load();
  }, [load, enabled]);

  return { data, isLoading, error, refetch: load, lastUpdated };
}