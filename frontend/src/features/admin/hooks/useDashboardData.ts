import { useState, useEffect } from 'react';
import { dashboardService, DashboardOverview } from '../api/dashboard.service';

export function useDashboardData() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const overview = await dashboardService.getOverview();
        setData(overview);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return { data, loading, error, refetch: () => {
    setLoading(true);
    setError(null);
    dashboardService.getOverview()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }};
}
