import { Survey, SurveyFilters, SurveyStats, SurveyResponse } from '../types/survey.types';

// Base URL for API calls - will be configured via environment variables
const getApiBaseUrl = () => {
  return (import.meta.env as any).REACT_APP_API_URL || 'http://localhost:5000/api';
};

// API client for surveys
export const surveyService = {
  // Get all surveys with optional filtering
  async getSurveys(filters?: SurveyFilters): Promise<Survey[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'All') queryParams.append(key, String(value));
      });
    }
    
    const response = await fetch(`${getApiBaseUrl()}/surveys?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch surveys');
    }
    
    return response.json();
  },

  // Get a single survey by ID
  async getSurvey(id: number): Promise<Survey> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch survey');
    }
    
    return response.json();
  },

  // Create a new survey
  async createSurvey(survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Survey> {
    const response = await fetch(`${getApiBaseUrl()}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        ...survey,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create survey');
    }
    
    return response.json();
  },

  // Update an existing survey
  async updateSurvey(survey: Survey): Promise<Survey> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/${survey.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        ...survey,
        updatedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update survey');
    }
    
    return response.json();
  },

  // Delete a survey
  async deleteSurvey(id: number): Promise<void> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete survey');
    }
  },

  // Get survey statistics
  async getSurveyStats(): Promise<SurveyStats> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch survey stats');
    }
    
    return response.json();
  },

  // Submit survey responses
  async submitSurveyResponse(surveyId: number, answers: Record<string, any>): Promise<SurveyResponse> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/${surveyId}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        surveyId,
        respondentId: localStorage.getItem('userId'),
        answers,
        submittedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit survey response');
    }
    
    return response.json();
  },

  // Get survey responses
  async getSurveyResponses(surveyId: number): Promise<SurveyResponse[]> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/${surveyId}/responses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch survey responses');
    }
    
    return response.json();
  },

  // Schedule survey distribution
  async scheduleSurvey(surveyId: number, scheduledDate: string): Promise<Survey> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/${surveyId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ scheduledDate })
    });
    
    if (!response.ok) {
      throw new Error('Failed to schedule survey');
    }
    
    return response.json();
  },

  // Export survey data
  async exportSurveyData(surveyId: number, format: 'CSV' | 'PDF' | 'JSON'): Promise<Blob> {
    const response = await fetch(`${getApiBaseUrl()}/surveys/${surveyId}/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to export survey data');
    }
    
    return response.blob();
  }
};