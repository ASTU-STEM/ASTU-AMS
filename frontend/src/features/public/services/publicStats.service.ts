import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export type PublicStatKey = 'alumni' | 'employers' | 'jobs' | 'departments';

export interface PublicStat {
  key: PublicStatKey;
  value: number;
}

/** Server-side metric field → public stat key. */
const METRIC_TO_STAT: Record<PublicStatKey, string> = {
  alumni: 'registeredAlumni',
  employers: 'corporatePartners',
  jobs: 'activeJobs',
  departments: 'fieldsOfStudy',
};

/**
 * Impact figures for the public landing page.
 *
 * These are counted from real database rows by the server — nothing here is
 * entered by an admin, so the numbers cannot drift from reality. Any stat the
 * server reports as zero is dropped, and the caller hides the whole band when
 * nothing is left.
 *
 * Reads the one real endpoint (`/content/public-metrics`) and narrows it to the
 * four headline figures, rather than calling a second endpoint that does not
 * exist.
 */
export const publicStatsService = {
  async getStats(): Promise<PublicStat[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: Record<string, any> }>(
        '/content/public-metrics'
      );
      const metrics = res.data?.data;
      if (!res.data?.success || !metrics) return [];

      return (Object.keys(METRIC_TO_STAT) as PublicStatKey[])
        .map((key) => ({ key, value: Number(metrics[METRIC_TO_STAT[key]]) || 0 }))
        .filter((s) => Number.isFinite(s.value) && s.value > 0);
    } catch (error) {
      console.warn('Failed to load public stats:', error);
      return [];
    }
  },
};

export default publicStatsService;
