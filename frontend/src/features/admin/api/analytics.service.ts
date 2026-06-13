import { get, post, put } from './client';

export interface KeyMetric {
  label: string;
  value: string;
  tone: 'blue' | 'gold' | 'green' | 'purple';
}

export interface AnalyticsOverview {
  keyMetrics: KeyMetric[];
  employmentByDepartmentYear: Array<{
    department: string;
    y2022: number;
    y2023: number;
    y2024: number;
  }>;
  skillGapTop10: Array<{ skill: string; value: number }>;
  skillGapHeatMap: Array<{
    department: string;
    cloud: number;
    devops: number;
    ai: number;
    security: number;
    data: number;
  }>;
  employerRadar: Array<{ subject: string; score: number }>;
  employerFeedbackEntries: Array<{
    company: string;
    score: number;
    note: string;
    submittedAt: string;
  }>;
  geoDistribution: Array<{ name: string; value: number }>;
  timeToHireTrend: Array<{ batch: string; months: number }>;
  departmentYearTable: Array<{
    department: string;
    grads: number;
    employed: number;
    selfEmployed: number;
    unemployed: number;
    rate: string;
    vsLastYear: string;
  }>;
  jobsPostedByMonth: Array<{ month: string; jobs: number }>;
  applicationFunnel: Array<{ stage: string; value: number }>;
}

export const analyticsService = {
  async getOverview(params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<AnalyticsOverview> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.department) queryParams.append('department', params.department);
    
    return get<AnalyticsOverview>(`/admin/analytics/overview?${queryParams.toString()}`);
  },

  async exportReport(type: string, params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.department) queryParams.append('department', params.department);
    
    const response = await fetch(`/api/admin/analytics/export/${type}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to export analytics report');
    }
    return response.blob();
  },
};
