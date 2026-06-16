import axios from 'axios';
// No mock imports
import config from '../../../shared/config';
import { get, patch } from '../../../shared/services/api';

export const USE_MOCK = false;

const adminApiClient = axios.create({
  baseURL: config.apiUrl,
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
    const response = await adminApiClient.get('/admin/overview');
    return response.data;
  },

  async listUsers() {
    try {
      const users = await get<any[]>('/admin/users');
      return users;
    } catch {
      return [];
    }
  },

  async updateUserStatus(userId: string, isActive: boolean) {
    return patch<any>(`/admin/users/${userId}/status`, { isActive });
  },

  async listSurveys() {
    const response = await adminApiClient.get('/admin/surveys');
    return response.data;
  },

  async listDepartments() {
    const response = await adminApiClient.get('/admin/departments');
    return response.data;
  },

  async listJobs() {
    const response = await adminApiClient.get('/admin/jobs');
    return response.data;
  },

  async listLogs() {
    const response = await adminApiClient.get('/admin/logs');
    return response.data;
  },

  async getAnalyticsOverview() {
    const response = await adminApiClient.get('/admin/analytics');
    return response.data;
  },
};

export default adminApi;
