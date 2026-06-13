import { get, post, put } from './client';

export interface DashboardStats {
  label: string;
  value: string;
  trend: string;
  tone: 'blue' | 'gold' | 'green' | 'purple';
}

export interface DashboardOverview {
  stats: DashboardStats[];
  employmentRateByDepartment: Array<{ department: string; value: number }>;
  surveyCompletion: Array<{ name: string; value: number; color: string }>;
  employmentTrends: Array<{ year: string; employed: number; selfEmployed: number }>;
  hiringCompanies: Array<{ name: string; hires: number }>;
  activities: Array<{ type: string; text: string; time: string }>;
  pendingActions: Array<{ label: string; action: string; tone: string }>;
  skillGaps: Array<{ skill: string; value: number }>;
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    return get<DashboardOverview>('/admin/dashboard/overview');
  },

  async exportReport(type: string): Promise<Blob> {
    const response = await fetch(`/api/admin/dashboard/export/${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to export report');
    }
    return response.blob();
  },
};
