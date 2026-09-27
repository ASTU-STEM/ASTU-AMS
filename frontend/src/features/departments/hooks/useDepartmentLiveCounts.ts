import { useCallback, useEffect, useState } from 'react';
import api from '../../../services/api';
import { surveyService } from '../../surveys/services/survey.service';

export interface DepartmentLiveCounts {
  surveys: number;
  messages: number;
  loading: boolean;
  refresh: (silent?: boolean) => Promise<void>;
}

export function useDepartmentLiveCounts(): DepartmentLiveCounts {
  const [counts, setCounts] = useState<Omit<DepartmentLiveCounts, 'refresh'>>({
    surveys: 0,
    messages: 0,
    loading: true,
  });

  const refresh = useCallback(async (silent = true) => {
    if (!silent) setCounts((prev) => ({ ...prev, loading: true }));

    const [surveysRes, threadsRes] = await Promise.allSettled([
      surveyService.getSurveys(),
      api.get('/chat/threads'),
    ]);

    let surveys = 0;
    if (surveysRes.status === 'fulfilled' && Array.isArray(surveysRes.value)) {
      surveys = surveysRes.value.filter((template: { isActive?: boolean }) => template?.isActive).length;
    }

    let messages = 0;
    if (threadsRes.status === 'fulfilled') {
      const threads = threadsRes.value?.data?.data;
      if (Array.isArray(threads)) {
        messages = threads.reduce(
          (sum: number, thread: { unreadCount?: number }) => sum + (Number(thread?.unreadCount) || 0),
          0
        );
      }
    }

    setCounts({ surveys, messages, loading: false });
  }, []);

  useEffect(() => {
    refresh(true);
    const interval = window.setInterval(() => refresh(true), 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return { ...counts, refresh };
}
