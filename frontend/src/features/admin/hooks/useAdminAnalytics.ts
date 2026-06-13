import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

export default function useAdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await adminApi.getDashboardOverview();
        if (response && response.success && response.data) {
          setData(response.data);
        } else if (response && response.overallEmployment) {
          // Direct payload fallback
          setData(response);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalyticsData();
  }, []);

  return {
    data,
    isLoading,
    error,
  };
}

