import { useCallback, useEffect, useState } from 'react';
import departmentService, { DepartmentAlumniRecord, } from '../services/department.service';

export interface DepartmentDerivedData {
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
  employmentTrend: { year: string; employmentRate: number; graduates: number }[];
  employmentStatusDistribution: { status: string; count: number; percentage: number }[];
  refetch?: () => void;
}

const EMPTY: DepartmentDerivedData = {
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
};

const STATUS_LABELS: Record<string, string> = {
  EMPLOYED: 'Employed',
  UNEMPLOYED: 'Unemployed',
  SELF_EMPLOYED: 'Self-Employed',
};

function derive(alumni: DepartmentAlumniRecord[]): DepartmentDerivedData {
  const countByStatus: Record<string, number> = {};
  for (const record of alumni) {
    const key = record.employmentStatus || 'UNKNOWN';
    countByStatus[key] = (countByStatus[key] || 0) + 1;
  }

  const totalAlumni = alumni.length;
  const employed = countByStatus['EMPLOYED'] || 0;
  const selfEmployed = countByStatus['SELF_EMPLOYED'] || 0;
  const unemployed = countByStatus['UNEMPLOYED'] || 0;

  const employmentRate = totalAlumni > 0 ? ((employed + selfEmployed) / totalAlumni) * 100 : 0;
  const unemploymentRate = totalAlumni > 0 ? (unemployed / totalAlumni) * 100 : 0;
  const selfEmploymentRate = totalAlumni > 0 ? (selfEmployed / totalAlumni) * 100 : 0;

  // Trend by graduation year
  const byYear: Record<number, { graduates: number; employed: number }> = {};
  for (const record of alumni) {
    const year = record.graduationYear || 0;
    if (!byYear[year]) byYear[year] = { graduates: 0, employed: 0 };
    byYear[year].graduates += 1;
    if (record.employmentStatus === 'EMPLOYED' || record.employmentStatus === 'SELF_EMPLOYED') {
      byYear[year].employed += 1;
    }
  }
  const employmentTrend = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b)
    .map(year => ({
      year: String(year),
      employmentRate: byYear[year].graduates > 0 ? (byYear[year].employed / byYear[year].graduates) * 100 : 0,
      graduates: byYear[year].graduates,
    }));

  const employmentStatusDistribution = Object.keys(countByStatus)
    .filter(status => countByStatus[status] > 0)
    .map(status => ({
      status: STATUS_LABELS[status] || status,
      count: countByStatus[status],
      percentage: totalAlumni > 0 ? (countByStatus[status] / totalAlumni) * 100 : 0,
    }));

  return {
    stats: {
      totalAlumni,
      employed,
      unemployed,
      selfEmployed,
      employmentRate,
      unemploymentRate,
      selfEmploymentRate,
    },
    alumni,
    employmentTrend,
    employmentStatusDistribution,
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
      const derived = derive(alumni);
      // Prefer authoritative backend aggregate where the department-scoped endpoint returns it.
      if (stats.totalAlumni > 0) {
        derived.stats.totalAlumni = stats.totalAlumni;
        derived.stats.employed = stats.employedAlumni;
        derived.stats.employmentRate = stats.employmentRate;
      }
      derived.refetch = load;
      setData(derived);
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : 'Failed to load department data.';
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        message = 'Your account is not authorized as a department head to view department-scoped data.';
      } else if (status === 401) {
        message = 'Your session has expired. Please sign in again.';
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
