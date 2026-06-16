import axios from 'axios';
import { adminMockData } from './mockData';

export const USE_MOCK = true;

export const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  async getDashboardOverview() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.dashboardOverview);
    }
    const response = await adminApiClient.get('/admin/overview');
    return response.data;
  },

  async listUsers() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.alumniUsers);
    }
    const response = await adminApiClient.get('/admin/users');
    return response.data;
  },

  async listSurveys() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.surveyManagement.surveys);
    }
    const response = await adminApiClient.get('/admin/surveys');
    return response.data;
  },

  async listDepartments() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.departments);
    }
    const response = await adminApiClient.get('/admin/departments');
    return response.data;
  },

  async listJobs() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.jobPostings);
    }
    const response = await adminApiClient.get('/admin/jobs');
    return response.data;
  },

  async listLogs() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.systemLogs);
    }
    const response = await adminApiClient.get('/admin/logs');
    return response.data;
  },

  async getAnalyticsOverview() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.analyticsOverview);
    }
    const response = await adminApiClient.get('/admin/analytics');
    return response.data;
  },
};

export default adminApi;
