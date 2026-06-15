import { get } from '../../../shared/services/api';
import type {
  AnalyticsSummary,
  EmploymentTrend,
  DepartmentStat,
  SkillGap,
  EmployerFeedbackMetric,
  SalaryDistribution,
  TopEmployer,
  TracerMetric,
} from '../types';

const BASE = '/analytics';

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    return get<AnalyticsSummary>(`${BASE}/summary`);
  },

  async getEmploymentTrends(): Promise<EmploymentTrend[]> {
    return get<EmploymentTrend[]>(`${BASE}/employment-trends`);
  },

  async getDepartmentStats(): Promise<DepartmentStat[]> {
    return get<DepartmentStat[]>(`${BASE}/department-stats`);
  },

  async getSkillGaps(): Promise<SkillGap[]> {
    return get<SkillGap[]>(`${BASE}/skill-gaps`);
  },

  async getEmployerFeedback(): Promise<EmployerFeedbackMetric[]> {
    return get<EmployerFeedbackMetric[]>(`${BASE}/employer-feedback`);
  },

  async getSalaryDistributions(): Promise<SalaryDistribution[]> {
    return get<SalaryDistribution[]>(`${BASE}/salary-distributions`);
  },

  async getTopEmployers(): Promise<TopEmployer[]> {
    return get<TopEmployer[]>(`${BASE}/top-employers`);
  },

  async getTracerMetrics(): Promise<TracerMetric[]> {
    return get<TracerMetric[]>(`${BASE}/tracer-metrics`);
  },
};

export default analyticsService;
