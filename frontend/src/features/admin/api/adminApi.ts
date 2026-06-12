import axios from 'axios';
import { adminMockData } from './mockData';

// Set to false to use real backend APIs
// Set to true to use mock data for development/testing
export const USE_MOCK = false;

const adminApiClient = axios.create({
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
  // Dashboard Overview
  // Backend endpoint: GET /analytics/dashboard
  async getDashboardOverview() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.dashboardOverview);
    }
    const response = await adminApiClient.get('/analytics/dashboard');
    return response.data;
  },

  // User Management
  // Backend endpoint: GET /auth/admin/users (MISSING - see MISSING_BACKEND_ENDPOINTS.md)
  // Fallback: Uses mock data until backend endpoint is implemented
  async listUsers(params?: { page?: number; limit?: number; role?: string; status?: string; search?: string }) {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.alumniUsers);
    }
    try {
      const response = await adminApiClient.get('/auth/admin/users', { params });
      return response.data;
    } catch (error) {
      console.warn('User listing endpoint not implemented in backend, using mock data');
      return Promise.resolve(adminMockData.alumniUsers);
    }
  },

  // Create User
  // Backend endpoint: POST /auth/admin/create-user
  async createUser(userData: { email: string; role: string; fullName: string }) {
    const response = await adminApiClient.post('/auth/admin/create-user', userData);
    return response.data;
  },

  // Update User Status
  // Backend endpoint: PUT /registrar/alumni/:id/status
  async updateUserStatus(id: string, status: string, reason?: string) {
    const response = await adminApiClient.put(`/registrar/alumni/${id}/status`, { status, reason });
    return response.data;
  },

  // Survey Management
  // Note: SurveyManagement.tsx uses surveyService instead of adminApi
  // Backend endpoint: GET /surveys/templates
  async listSurveys() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.surveyManagement.surveys);
    }
    const response = await adminApiClient.get('/surveys/templates');
    return response.data;
  },

  // Department Management
  // Backend endpoint: GET /departments/
  async listDepartments() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.departments);
    }
    const response = await adminApiClient.get('/departments/');
    return response.data;
  },

  // Department Statistics
  // Backend endpoint: GET /departments/my-stats
  async getDepartmentStats(departmentId?: string) {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.departmentStats);
    }
    const endpoint = departmentId ? `/departments/${departmentId}/stats` : '/departments/my-stats';
    const response = await adminApiClient.get(endpoint);
    return response.data;
  },

  // Job Management
  // Backend endpoint: GET /jobs
  async listJobs(params?: { keyword?: string; department?: string; location?: string; employmentType?: string; page?: number; limit?: number }) {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.jobPostings);
    }
    const response = await adminApiClient.get('/jobs', { params });
    return response.data;
  },

  // Audit/Log Management
  // Backend endpoint: GET /audit/logs (MISSING - see MISSING_BACKEND_ENDPOINTS.md)
  // Fallback: Uses mock data until backend endpoint is implemented
  async listLogs(params?: { page?: number; limit?: number; userId?: string; action?: string; startDate?: string; endDate?: string }) {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.systemLogs);
    }
    try {
      const response = await adminApiClient.get('/audit/logs', { params });
      return response.data;
    } catch (error) {
      console.warn('Audit logs endpoint not implemented in backend, using mock data');
      return Promise.resolve(adminMockData.systemLogs);
    }
  },

  // Analytics Overview
  // Backend endpoint: GET /analytics/dashboard
  async getAnalyticsOverview() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.analyticsOverview);
    }
    const response = await adminApiClient.get('/analytics/dashboard');
    return response.data;
  },

  // Employment Analytics
  // Backend endpoint: GET /analytics/employment
  async getEmploymentAnalytics(params?: { department?: string; year?: number }) {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.employmentData);
    }
    const response = await adminApiClient.get('/analytics/employment', { params });
    return response.data;
  },

  // Skills Analytics
  // Backend endpoint: GET /analytics/skills
  async getSkillsAnalytics() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.skillGaps);
    }
    const response = await adminApiClient.get('/analytics/skills');
    return response.data;
  },

  // Top Employers Analytics
  // Backend endpoint: GET /analytics/employers (MISSING - see MISSING_BACKEND_ENDPOINTS.md)
  async getTopEmployers() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.topEmployers);
    }
    try {
      const response = await adminApiClient.get('/analytics/employers');
      return response.data;
    } catch (error) {
      console.warn('Top employers endpoint not implemented in backend, using mock data');
      return Promise.resolve(adminMockData.topEmployers);
    }
  },

  // Geographic Distribution Analytics
  // Backend endpoint: GET /analytics/geographic (MISSING - see MISSING_BACKEND_ENDPOINTS.md)
  async getGeographicDistribution() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.geographicData);
    }
    try {
      const response = await adminApiClient.get('/analytics/geographic');
      return response.data;
    } catch (error) {
      console.warn('Geographic distribution endpoint not implemented in backend, using mock data');
      return Promise.resolve(adminMockData.geographicData);
    }
  },

  // Time to Hire Analytics
  // Backend endpoint: GET /analytics/time-to-hire (MISSING - see MISSING_BACKEND_ENDPOINTS.md)
  async getTimeToHire() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.timeToHire);
    }
    try {
      const response = await adminApiClient.get('/analytics/time-to-hire');
      return response.data;
    } catch (error) {
      console.warn('Time to hire endpoint not implemented in backend, using mock data');
      return Promise.resolve(adminMockData.timeToHire);
    }
  },

  // Pending Actions
  // Backend endpoint: GET /admin/pending-actions (MISSING - see MISSING_BACKEND_ENDPOINTS.md)
  async getPendingActions() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.pendingActions);
    }
    try {
      const response = await adminApiClient.get('/admin/pending-actions');
      return response.data;
    } catch (error) {
      console.warn('Pending actions endpoint not implemented in backend, using mock data');
      return Promise.resolve(adminMockData.pendingActions);
    }
  },

  // Weekly Registrations
  // Backend endpoint: GET /admin/weekly-registrations (MISSING - see MISSING_BACKEND_ENDPOINTS.md)
  async getWeeklyRegistrations() {
    if (USE_MOCK) {
      return Promise.resolve(adminMockData.weeklyRegistrations);
    }
    try {
      const response = await adminApiClient.get('/admin/weekly-registrations');
      return response.data;
    } catch (error) {
      console.warn('Weekly registrations endpoint not implemented in backend, using mock data');
      return Promise.resolve(adminMockData.weeklyRegistrations);
    }
  },
};

export default adminApi;
