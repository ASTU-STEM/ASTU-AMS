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
  const [error, setError] = useState<Error | null>(null);

  const fetchSurveys = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminApi.listSurveys();

      // Transform API response to match AdminSurveyRecord interface
      const transformedData = response.map((survey: any) => ({
        id: survey.id,
        title: survey.title || survey.name,
        completionRate: survey.completionRate || survey.completion || 0,
        status:
          survey.status === 'Active'
            ? 'Open'
            : survey.status === 'Closed'
              ? 'Closed'
              : 'Draft',
      }));

      setData(transformedData);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSurveys,
  };
}
