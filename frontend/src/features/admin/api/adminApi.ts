import axios from 'axios';

export const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
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
    const response = await adminApiClient.get('/admin/dashboard/metrics');
    return response.data.data;
  },

  async listUsers() {
    const response = await adminApiClient.get('/admin/users');
    return response.data.data;
  },

  async listSurveys() {
    const response = await adminApiClient.get('/surveys');
    return response.data.data;
  },

  async listDepartments() {
    const response = await adminApiClient.get('/admin/departments');
    return response.data.data;
  },

  async listJobs() {
    const response = await adminApiClient.get('/admin/jobs');
    return response.data.data;
  },

  async listLogs() {
    const response = await adminApiClient.get('/admin/logs');
    return response.data.data;
  },

  async getAnalyticsOverview() {
    const response = await adminApiClient.get('/admin/dashboard/metrics');
    return response.data.data;
  },
};

export default adminApi;
