import { get } from '../../../shared/services/api';

export const analyticsService = {
  async getDashboardOverview() {
    return get('/analytics/dashboard');
  },
  async getEmploymentAnalytics() {
    return get('/analytics/employment');
  },
  async getEmployerAnalytics() {
    return get('/analytics/employers');
  },
  async getDepartmentAnalytics() {
    return get('/analytics/departments');
  },
  async getSkillAnalytics() {
    return get('/analytics/skills');
  },
  async getTracerAnalytics() {
    return get('/analytics/tracer');
  },
  async getInsights() {
    return get('/analytics/insights');
  },
  async getRecommendations() {
    return get('/analytics/recommendations');
  }
};

export default analyticsService;
