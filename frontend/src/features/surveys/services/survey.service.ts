const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data.data;
}

export const surveyService = {
  // ─── Registrar / Admin: Templates ────────────────────────────────────────
  async getSurveys(): Promise<any[]> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getSurvey(id: string): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createSurvey(surveyData: any): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(surveyData),
    });
    return handleResponse(res);
  },

  async updateSurvey(id: string, surveyData: any): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(surveyData),
    });
    return handleResponse(res);
  },

  async deleteSurvey(id: string): Promise<void> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to archive survey');
    }
  },

  async cloneSurvey(id: string): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates/${id}/clone`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async activateSurvey(id: string): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates/${id}/activate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async deactivateSurvey(id: string): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates/${id}/deactivate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async scheduleSurvey(id: string, scheduledAt: string): Promise<any> {
    return surveyService.updateSurvey(id, { scheduledAt });
  },

  // ─── Registrar / Admin: Analysis ─────────────────────────────────────────
  async getSurveyAnalysis(templateId: string): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates/${templateId}/analysis`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getResponsesBySurvey(templateId: string): Promise<any[]> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/templates/${templateId}/responses`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getCompanyHiringStats(): Promise<any[]> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/company-hiring-stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getSurveyStats(batch?: string | number): Promise<any> {
    const query = batch && batch !== 'ALL' ? `?batch=${batch}` : '';
    const res = await fetch(`${getApiBaseUrl()}/surveys/statistics${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getSurveyAssignments(): Promise<any[]> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/assignments`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getCompletionReport(batch?: string | number): Promise<any[]> {
    const query = batch && batch !== 'ALL' ? `?batch=${batch}` : '';
    const res = await fetch(`${getApiBaseUrl()}/surveys/completion-report${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // ─── Alumni ───────────────────────────────────────────────────────────────
  async getMySurveys(): Promise<any[]> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/my-surveys`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getMySurveyAssignment(assignmentId: string): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/my-surveys/${assignmentId}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async saveDraft(assignmentId: string, answers: { questionId: string; answerText: string }[]): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/save-draft`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ assignmentId, answers }),
    });
    return handleResponse(res);
  },

  async submitAssignedSurvey(
    assignmentId: string,
    answers: { questionId: string; answerText: string }[]
  ): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ assignmentId, answers }),
    });
    return handleResponse(res);
  },

  async getMyHistory(): Promise<any[]> {
    const res = await fetch(`${getApiBaseUrl()}/surveys/my-history`, { headers: getHeaders() });
    return handleResponse(res);
  },
};