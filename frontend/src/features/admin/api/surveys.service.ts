import { get, post, put, remove } from './client';

export interface Survey {
  id: string;
  name: string;
  targetBatch: string;
  type: string;
  sent: number;
  responded: number;
  completion: number;
  status: string;
}

export interface SurveyWave {
  batch: string;
  surveyType: string;
  scheduledDate: string;
  recipients: number;
  status: string;
}

export interface SurveyAnalytics {
  completion: Array<{ name: string; value: number; color: string }>;
  responseTrend: Array<{ month: string; value: number }>;
  employmentStatus: Array<{ name: string; value: number }>;
  salaryRange: Array<{ range: string; value: number }>;
  industryDistribution: Array<{ industry: string; value: number }>;
}

export interface CreateSurveyRequest {
  name: string;
  targetBatch: string;
  type: string;
  scheduledDate: string;
}

export const surveysService = {
  async getSurveys(): Promise<Survey[]> {
    return get<Survey[]>('/admin/surveys');
  },

  async getSurveyById(id: string): Promise<Survey> {
    return get<Survey>(`/admin/surveys/${id}`);
  },

  async createSurvey(data: CreateSurveyRequest): Promise<Survey> {
    return post<Survey>('/admin/surveys', data);
  },

  async updateSurvey(id: string, data: Partial<CreateSurveyRequest>): Promise<Survey> {
    return put<Survey>(`/admin/surveys/${id}`, data);
  },

  async deleteSurvey(id: string): Promise<void> {
    return remove<void>(`/admin/surveys/${id}`);
  },

  async getWaves(): Promise<SurveyWave[]> {
    return get<SurveyWave[]>('/admin/surveys/waves');
  },

  async sendWave(surveyId: string): Promise<void> {
    return post<void>(`/admin/surveys/${surveyId}/send`, {});
  },

  async getAnalytics(surveyId: string): Promise<SurveyAnalytics> {
    return get<SurveyAnalytics>(`/admin/surveys/${surveyId}/analytics`);
  },

  async exportResults(surveyId: string, format: 'csv' | 'excel'): Promise<Blob> {
    const response = await fetch(`/api/admin/surveys/${surveyId}/export/${format}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to export survey results');
    }
    return response.blob();
  },
};
