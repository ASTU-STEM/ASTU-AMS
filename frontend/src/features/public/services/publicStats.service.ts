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

/**
 * Impact figures for the public landing page.
 *
 * These are counted from real database rows by the server — nothing here is
 * entered by an admin, so the numbers cannot drift from reality. Any stat the
 * server reports as zero is dropped, and the caller hides the whole band when
 * nothing is left.
 */
export const publicStatsService = {
  async getStats(): Promise<PublicStat[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: PublicStat[] }>(
        '/content/public-stats'
      );
      if (res.data.success && Array.isArray(res.data.data)) {
        return res.data.data.filter((s) => Number.isFinite(s.value) && s.value > 0);
      }
      return [];
    } catch (error) {
      console.warn('Failed to load public stats:', error);
      return [];
    }
  },
};

export default publicStatsService;
