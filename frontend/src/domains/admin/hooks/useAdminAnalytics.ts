import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

export default function useAdminAnalytics() {
  const [data, setData] = useState<any>({
    employmentRate: [],
    surveyCompletion: [],
    departmentBreakdown: [],
    hiringTrend: [],
    skillGaps: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [overview, analytics] = await Promise.all([
          adminApi.getDashboardOverview(),
          adminApi.getAnalyticsOverview(),
        ]);
        setData({
          employmentRate: overview?.employmentRateByDepartment ?? [],
          surveyCompletion: overview?.surveyCompletion ?? [],
          departmentBreakdown: analytics?.departmentYearTable ?? [],
          hiringTrend: analytics?.timeToHireTrend ?? [],
          skillGaps: analytics?.skillGapTop10 ?? [],
        });
      } catch (err: any) {
        setError(err.message ?? 'Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, isLoading, error };
}
