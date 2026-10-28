import { useState, useEffect, useCallback } from 'react';
import api from './api';

export interface DepartmentOutcome {
  id: string;
  code: string;
  name: string;
  totalAlumni: number;
  employedAlumni: number;
  employmentRate: number;
}

export interface PublicMetrics {
  registeredAlumni: number;
  registeredAlumniFormatted: string;
  verifiedAlumni?: number;
  verifiedAlumniFormatted?: string;
  pendingAlumniVerification?: number;
  employedAlumni?: number;
  unemployedAlumni?: number;
  verificationRate?: number;
  verificationRateFormatted?: string;
  fieldsOfStudy: number;
  fieldsOfStudyFormatted: string;
  corporatePartners: number;
  corporatePartnersFormatted: string;
  historicBatches: number;
  historicBatchesFormatted: string;
  employmentRate: number;
  employmentRateFormatted: string;
  etaComplianceRate?: number | null;
  etaComplianceRateFormatted?: string;
  hasActiveSurveyWave?: boolean;
  surveyAssignmentsTotal?: number;
  surveyAssignmentsCompleted?: number;
  activeJobs: number;
  activeJobsFormatted: string;
  digitalRequests: number;
  digitalRequestsFormatted: string;
  documentRequestsTotal?: number;
  documentRequestsPending?: number;
  supportTicketsOpen?: number;
  eventsCount: number;
  eventsCountFormatted: string;
  eventRsvpsCount?: number;
  storiesCount?: number;
  bulletinsCount?: number;
  pendingTicketsCount?: number;
  departmentDistribution?: DepartmentOutcome[];
  lastUpdated?: string;
}

/** Neutral placeholders — never ship demo marketing numbers. */
export const EMPTY_METRICS: PublicMetrics = {
  registeredAlumni: 0,
  registeredAlumniFormatted: '—',
  verifiedAlumni: 0,
  verifiedAlumniFormatted: '—',
  pendingAlumniVerification: 0,
  employedAlumni: 0,
  unemployedAlumni: 0,
  verificationRate: 0,
  verificationRateFormatted: '—',
  fieldsOfStudy: 0,
  fieldsOfStudyFormatted: '—',
  corporatePartners: 0,
  corporatePartnersFormatted: '—',
  historicBatches: 0,
  historicBatchesFormatted: '—',
  employmentRate: 0,
  employmentRateFormatted: '—',
  etaComplianceRate: null,
  etaComplianceRateFormatted: '—',
  hasActiveSurveyWave: false,
  surveyAssignmentsTotal: 0,
  surveyAssignmentsCompleted: 0,
  activeJobs: 0,
  activeJobsFormatted: '—',
  digitalRequests: 0,
  digitalRequestsFormatted: '—',
  documentRequestsTotal: 0,
  documentRequestsPending: 0,
  supportTicketsOpen: 0,
  eventsCount: 0,
  eventsCountFormatted: '—',
  eventRsvpsCount: 0,
  storiesCount: 0,
  bulletinsCount: 0,
  pendingTicketsCount: 0,
  departmentDistribution: [],
};

let cachedMetrics: PublicMetrics | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds cache

export const fetchPublicMetrics = async (force = false): Promise<PublicMetrics> => {
  const now = Date.now();
  if (!force && cachedMetrics && now - lastFetchTime < CACHE_TTL) {
    return cachedMetrics;
  }

  try {
    const res = await api.get('/content/public-metrics');
    if (res.data?.success && res.data?.data) {
      cachedMetrics = res.data.data;
      lastFetchTime = now;
      return cachedMetrics as PublicMetrics;
    }
    return cachedMetrics || EMPTY_METRICS;
  } catch (error) {
    console.error('Failed to fetch public live metrics from backend:', error);
    return cachedMetrics || EMPTY_METRICS;
  }
};

export const triggerMetricsRefresh = () => {
  cachedMetrics = null;
  lastFetchTime = 0;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('astu-metrics-updated'));
  }
};

export const usePublicMetrics = () => {
  const [metrics, setMetrics] = useState<PublicMetrics>(cachedMetrics || EMPTY_METRICS);
  const [loading, setLoading] = useState<boolean>(!cachedMetrics);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await fetchPublicMetrics(true);
      setMetrics(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load live metrics');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(Boolean(cachedMetrics));

    const handleUpdate = () => loadData(true);
    window.addEventListener('astu-metrics-updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => {
      window.removeEventListener('astu-metrics-updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      clearInterval(interval);
    };
  }, [loadData]);

  const refresh = useCallback(() => loadData(false), [loadData]);

  return { metrics, loading, error, refresh };
};

