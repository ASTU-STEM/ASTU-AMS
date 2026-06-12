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

        // Fetch all analytics data in parallel
        const [
          dashboardOverview,
          employmentAnalytics,
          skillsAnalytics,
          topEmployers,
          geographicDistribution,
          timeToHire
        ] = await Promise.all([
          adminApi.getDashboardOverview(),
          adminApi.getEmploymentAnalytics(),
          adminApi.getSkillsAnalytics(),
          adminApi.getTopEmployers(),
          adminApi.getGeographicDistribution(),
          adminApi.getTimeToHire()
        ]);

        setData({
          employmentRate: dashboardOverview?.employmentRateByDepartment || [],
          surveyCompletion: dashboardOverview?.surveyCompletion || {},
          departmentBreakdown: employmentAnalytics?.departmentYearTable || [],
          hiringTrend: timeToHire || [],
          skillGaps: skillsAnalytics?.skillGapTop10 || [],
          topEmployers: topEmployers || [],
          geographicDistribution: geographicDistribution || [],
        });
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
