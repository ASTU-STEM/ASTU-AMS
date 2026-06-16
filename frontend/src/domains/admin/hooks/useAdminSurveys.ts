import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';

export interface AdminSurveyRecord {
  id: string;
  title: string;
  completionRate: number;
  status: 'Open' | 'Closed' | 'Draft';
}

export default function useAdminSurveys() {
  const [data, setData] = useState<AdminSurveyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = useCallback(async () => {
    try {
      setIsLoading(true);
      const surveys = await adminApi.listSurveys();
      const mapped = (surveys ?? []).map((survey: any) => ({
        id: survey.id,
        title: survey.name ?? survey.title ?? '',
        completionRate: survey.completion ?? 0,
        status:
          survey.status === 'Active'
            ? 'Open' as const
            : survey.status === 'Closed'
              ? 'Closed' as const
              : 'Draft' as const,
      }));
      setData(mapped);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch surveys');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return { data, isLoading, error, refetch: fetchSurveys };
}
