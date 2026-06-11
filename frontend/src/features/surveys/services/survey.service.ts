import { Survey, SurveyFilters, SurveyStats, SurveyResponse } from '../types/survey.types';

const getApiBaseUrl = () => {
  return (import.meta.env as any).REACT_APP_API_URL || 'http://localhost:5000/api';
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

export const surveyService = {
  // Admin: Get survey templates
  async getSurveys(filters?: SurveyFilters): Promise<any[]> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/templates`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch surveys');
    const data = await response.json();
    return data.data;
  },

  // Admin: Get a single template
  async getSurvey(id: string): Promise<any> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/templates/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch survey');
    const data = await response.json();
    return data.data;
  },

  // Admin: Create a new survey template
  async createSurvey(surveyData: any): Promise<any> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/templates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(surveyData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create survey');
    return data.data;
  },

  // Admin: Update a survey template
  async updateSurvey(id: string, surveyData: any): Promise<any> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/templates/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(surveyData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update survey');
    return data.data;
  },

  // Admin: Delete (archive) a survey template
  async deleteSurvey(id: string): Promise<void> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/templates/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to archive survey');
  },

  // Admin: Get survey statistics
  async getSurveyStats(): Promise<any> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/statistics`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch survey stats');
    const data = await response.json();
    return data.data;
  },

  // Admin: Get assignments (scheduled waves)
  async getSurveyAssignments(): Promise<any[]> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/assignments`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch survey assignments');
    const data = await response.json();
    return data.data;
  },

  // Admin: Get survey completion report
  async getCompletionReport(): Promise<any[]> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/completion-report`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch completion report');
    const data = await response.json();
    return data.data;
  },


  // Alumni: Get My Surveys
  async getMySurveys(): Promise<any[]> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/my-surveys`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch your surveys');
    const data = await response.json();
    return data.data;
  },

  // Alumni: Get specific assignment to fill
  async getMySurveyAssignment(assignmentId: string): Promise<any> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/my-surveys/${assignmentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch survey assignment');
    const data = await response.json();
    return data.data;
  },

  // Alumni: Submit Survey
  async submitAssignedSurvey(assignmentId: string, answers: { questionId: string; answerText: string }[]): Promise<any> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ assignmentId, answers }),
    });
    if (!response.ok) throw new Error('Failed to submit survey');
    const data = await response.json();
    return data.data;
  },
};