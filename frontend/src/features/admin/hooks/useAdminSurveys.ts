import { useMemo } from 'react';
import { adminMockData } from '../api/mockData';

export interface AdminSurveyRecord {
  id: string;
  title: string;
  completionRate: number;
  status: 'Open' | 'Closed' | 'Draft';
}

export default function useAdminSurveys() {
  const data = useMemo<AdminSurveyRecord[]>(
    () =>
      adminMockData.surveyManagement.surveys.map((survey) => ({
        id: survey.id,
        title: survey.name,
        completionRate: survey.completion,
        status:
          survey.status === 'Active'
            ? 'Open'
            : survey.status === 'Closed'
              ? 'Closed'
              : 'Draft',
      })),
    []
  );

  return {
    data,
    isLoading: false,
    error: null,
    refetch: async () => undefined,
  };
}
