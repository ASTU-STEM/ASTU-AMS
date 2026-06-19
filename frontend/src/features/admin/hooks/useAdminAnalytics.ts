import { useMemo } from 'react';
import { adminMockData } from '../api/mockData';

export default function useAdminAnalytics() {
  const data = useMemo(
    () => ({
      employmentRate: adminMockData.dashboardOverview.employmentRateByDepartment,
      surveyCompletion: adminMockData.dashboardOverview.surveyCompletion,
      departmentBreakdown: adminMockData.analyticsOverview.departmentYearTable,
      hiringTrend: adminMockData.analyticsOverview.timeToHireTrend,
      skillGaps: adminMockData.analyticsOverview.skillGapTop10,
    }),
    []
  );

  return {
    data,
    isLoading: false,
    error: null,
  };
}
