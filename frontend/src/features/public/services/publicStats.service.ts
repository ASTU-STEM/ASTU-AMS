import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export type PublicStatKey =
  | 'alumni'
  | 'verified'
  | 'employment'
  | 'employers'
  | 'jobs'
  | 'departments'
  | 'events'
  | 'requests';

export interface PublicStat {
  key: PublicStatKey;
  value: number;
  /** Optional unit rendered after the value (e.g. "%"). */
  suffix?: string;
}

/** Server-side metric field → public stat key. */
const METRIC_TO_STAT: Record<PublicStatKey, string> = {
  alumni: 'registeredAlumni',
  verified: 'verifiedAlumni',
  employment: 'employmentRate',
  employers: 'corporatePartners',
  jobs: 'activeJobs',
  departments: 'fieldsOfStudy',
  events: 'eventsCount',
  requests: 'digitalRequests',
};

/**
 * Impact figures for the public landing page.
 *
 * These are counted from real database rows by the server — nothing here is
 * entered by an admin, so the numbers cannot drift from reality. Any stat the
 * server reports as zero is dropped, and the caller hides the whole band when
 * nothing is left. Percentages are kept when they are legitimately 0 (for
 * example, no employed alumni yet) but only when the underlying population
 * exists.
 */
export const publicStatsService = {
  async getStats(): Promise<PublicStat[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: Record<string, any> }>(
        '/content/public-metrics'
      );
      const metrics = res.data?.data;
      if (!res.data?.success || !metrics) return [];

      const stats: PublicStat[] = [];
      const push = (key: PublicStatKey, allowZero = false, suffix?: string) => {
        const value = Number(metrics[METRIC_TO_STAT[key]]) || 0;
        if (Number.isFinite(value) && (value > 0 || (allowZero && value === 0))) {
          stats.push({ key, value, suffix });
        }
      };

      push('alumni');
      push('verified');
      // Employment rate is meaningful whenever any alumni exist, even at 0%.
      if ((Number(metrics.registeredAlumni) || 0) > 0) {
        push('employment', true, '%');
      }
      push('employers');
      push('jobs');
      push('departments');
      push('events');
      push('requests');

      return stats;
    } catch (error) {
      console.warn('Failed to load public stats:', error);
      return [];
    }
  },
};

export default publicStatsService;
