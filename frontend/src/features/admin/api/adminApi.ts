import axios from 'axios';

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
    const response = await adminApiClient.get('/analytics/dashboard');
    return response.data;
  },

  // User Management
  // Backend endpoint: GET /auth/admin/users
  async listUsers(params?: { page?: number; limit?: number; role?: string; status?: string; search?: string }) {
    const response = await adminApiClient.get('/auth/admin/users', { params });
    return response.data;
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
  // Backend endpoint: GET /surveys/templates
  async listSurveys() {
    const response = await adminApiClient.get('/surveys/templates');
    return response.data;
  },

  // Department Management
  // Backend endpoint: GET /departments/
  async listDepartments() {
    const response = await adminApiClient.get('/departments/');
    return response.data;
  },

  // Department Statistics
  // Backend endpoint: GET /departments/my-stats
  async getDepartmentStats(departmentId?: string) {
    const endpoint = departmentId ? `/departments/${departmentId}/stats` : '/departments/my-stats';
    const response = await adminApiClient.get(endpoint);
    return response.data;
  },

  // Job Management
  // Backend endpoint: GET /jobs
  async listJobs(params?: { keyword?: string; department?: string; location?: string; employmentType?: string; page?: number; limit?: number }) {
    const response = await adminApiClient.get('/jobs', { params });
    return response.data;
  },

  // Audit/Log Management
  // Backend endpoint: GET /audit
  async listLogs(params?: { page?: number; limit?: number; userId?: string; action?: string; startDate?: string; endDate?: string }) {
    const response = await adminApiClient.get('/audit', { params });
    return response.data;
  },

  // Analytics Overview
  // Backend endpoint: GET /analytics/dashboard
  async getAnalyticsOverview() {
    const response = await adminApiClient.get('/analytics/dashboard');
    return response.data;
  },

  // Employment Analytics
  // Backend endpoint: GET /analytics/employment
  async getEmploymentAnalytics(params?: { department?: string; year?: number }) {
    const response = await adminApiClient.get('/analytics/employment', { params });
    return response.data;
  },

  // Skills Analytics
  // Backend endpoint: GET /analytics/skills
  async getSkillsAnalytics() {
    const response = await adminApiClient.get('/analytics/skills');
    return response.data;
  },

  // Top Employers Analytics
  // Backend endpoint: GET /analytics/employers
  async getTopEmployers() {
    const response = await adminApiClient.get('/analytics/employers');
    return response.data;
  },

  // Geographic Distribution Analytics
  // Backend endpoint: GET /analytics/geographic
  async getGeographicDistribution() {
    const response = await adminApiClient.get('/analytics/geographic');
    return response.data;
  },

  // Time to Hire Analytics
  // Backend endpoint: GET /analytics/time-to-hire
  async getTimeToHire() {
    const response = await adminApiClient.get('/analytics/time-to-hire');
    return response.data;
  },

  // Pending Actions
  // Backend endpoint: GET /admin/pending-actions
  async getPendingActions() {
    const response = await adminApiClient.get('/admin/pending-actions');
    return response.data;
  },

  // Weekly Registrations
  // Backend endpoint: GET /admin/weekly-registrations
  async getWeeklyRegistrations() {
    const response = await adminApiClient.get('/admin/weekly-registrations');
    return response.data;
  },

  // Notifications
  // Backend endpoint: GET /notifications
  async getNotifications() {
    const response = await adminApiClient.get('/notifications');
    return response.data;
  },

  // Send Notification
  // Backend endpoint: POST /notifications
  async sendNotification(notificationData: { userId: string; title: string; content: string }) {
    const response = await adminApiClient.post('/notifications', notificationData);
    return response.data;
  },

  // Mark Notification as Read
  // Backend endpoint: PUT /notifications/:id/read
  async markNotificationRead(notificationId: string) {
    const response = await adminApiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark All Notifications as Read
  // Backend endpoint: PUT /notifications/read-all
  async markAllNotificationsRead() {
    const response = await adminApiClient.put('/notifications/read-all');
    return response.data;
  },

  // Document Requests (Pending Manual Verification)
  // Backend endpoint: GET /registrar/document-requests
  async getDocumentRequests() {
    const response = await adminApiClient.get('/registrar/document-requests');
    return response.data;
  },

  // Get System Settings
  // Backend endpoint: GET /admin/settings
  async getSettings() {
    const response = await adminApiClient.get('/admin/settings');
    return response.data;
  },

  // Update System Settings
  // Backend endpoint: PUT /admin/settings
  async updateSettings(settings: any) {
    const response = await adminApiClient.put('/admin/settings', settings);
    return response.data;
  },

  // Create Database Backup
  // Backend endpoint: POST /admin/backup/create
  async createBackup() {
    const response = await adminApiClient.post('/admin/backup/create');
    return response.data;
  },

  // Get Super Admin Modules
  // Backend endpoint: GET /admin/modules
  async getModules() {
    const response = await adminApiClient.get('/admin/modules');
    return response.data;
  },

  // Get Available Reports
  // Backend endpoint: GET /admin/reports
  async getReports() {
    const response = await adminApiClient.get('/admin/reports');
    return response.data;
  },

  // --- Consolidated Departments Service ---
  async getDepartments() {
    const response = await adminApiClient.get('/admin/departments');
    return response.data;
  },
  async getDepartmentById(id: string) {
    const response = await adminApiClient.get(`/admin/departments/${id}`);
    return response.data;
  },
  async getDepartmentAlumni(departmentId: string) {
    const response = await adminApiClient.get(`/admin/departments/${departmentId}/alumni`);
    return response.data;
  },
  async updateDepartment(id: string, data: any) {
    const response = await adminApiClient.put(`/admin/departments/${id}`, data);
    return response.data;
  },
  async exportDepartmentData(departmentId: string, format: 'csv' | 'excel') {
    const response = await adminApiClient.get(`/admin/departments/${departmentId}/export/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // --- Consolidated Roles Service ---
  async getRoles() {
    const response = await adminApiClient.get('/admin/roles');
    return response.data;
  },
  async getRoleById(id: string) {
    const response = await adminApiClient.get(`/admin/roles/${id}`);
    return response.data;
  },
  async createRole(data: any) {
    const response = await adminApiClient.post('/admin/roles', data);
    return response.data;
  },
  async updateRole(id: string, data: any) {
    const response = await adminApiClient.put(`/admin/roles/${id}`, data);
    return response.data;
  },
  async deleteRole(id: string) {
    const response = await adminApiClient.delete(`/admin/roles/${id}`);
    return response.data;
  },
  async getPermissions() {
    const response = await adminApiClient.get('/admin/roles/permissions');
    return response.data;
  },
  async savePermissions(roleId: string, permissions: string[]) {
    const response = await adminApiClient.put(`/admin/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },
  async exportRoles(format: 'csv' | 'excel') {
    const response = await adminApiClient.get(`/admin/roles/export/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // --- Consolidated Jobs Service ---
  async getJobs(params?: any) {
    const response = await adminApiClient.get('/admin/jobs', { params });
    return response.data;
  },
  async getJobById(id: string) {
    const response = await adminApiClient.get(`/admin/jobs/${id}`);
    return response.data;
  },
  async createJob(data: any) {
    const response = await adminApiClient.post('/admin/jobs', data);
    return response.data;
  },
  async updateJob(id: string, data: any) {
    const response = await adminApiClient.put(`/admin/jobs/${id}`, data);
    return response.data;
  },
  async deleteJob(id: string) {
    const response = await adminApiClient.delete(`/admin/jobs/${id}`);
    return response.data;
  },
  async getApplications(jobId: string) {
    const response = await adminApiClient.get(`/admin/jobs/${jobId}/applications`);
    return response.data;
  },
  async updateApplicationStatus(applicationId: string, status: string) {
    const response = await adminApiClient.put(`/admin/jobs/applications/${applicationId}`, { status });
    return response.data;
  },
  async exportJobs(format: 'csv' | 'excel') {
    const response = await adminApiClient.get(`/admin/jobs/export/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // --- Consolidated Profile Service ---
  async getProfile() {
    const response = await adminApiClient.get('/admin/profile');
    return response.data;
  },
  async updateProfile(data: any) {
    const response = await adminApiClient.put('/admin/profile', data);
    return response.data;
  },
  async changePassword(data: any) {
    const response = await adminApiClient.post('/admin/profile/change-password', data);
    return response.data;
  },
  async updateNotificationSettings(settings: any) {
    const response = await adminApiClient.put('/admin/profile/notifications', settings);
    return response.data;
  },
  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await adminApiClient.post('/admin/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  async deletePhoto() {
    const response = await adminApiClient.delete('/admin/profile/photo');
    return response.data;
  },

  // --- Department Head Portal Endpoints ---
  async getDepartmentOverview(filters?: any) {
    const response = await adminApiClient.get('/department/overview', { params: filters });
    return response.data;
  },
  async getEmploymentData(filters?: any) {
    const response = await adminApiClient.get('/department/employment', { params: filters });
    return response.data;
  },
  async getEmployerFeedback(filters?: any) {
    const response = await adminApiClient.get('/department/employer-feedback', { params: filters });
    return response.data;
  },
  async getSkillGapData(filters?: any) {
    const response = await adminApiClient.get('/department/skill-gap', { params: filters });
    return response.data;
  },
  async getTracerSurveyData(filters?: any) {
    const response = await adminApiClient.get('/department/tracer-surveys', { params: filters });
    return response.data;
  },
  async getCurriculumInsights(filters?: any) {
    const response = await adminApiClient.get('/department/curriculum', { params: filters });
    return response.data;
  },
  async getAccreditationReports() {
    const response = await adminApiClient.get('/department/accreditation-reports');
    return response.data;
  },
  async getExportReports() {
    const response = await adminApiClient.get('/department/export-reports');
    return response.data;
  },
  async generateReport(reportId: string, format: 'pdf' | 'excel') {
    const response = await adminApiClient.get(`/department/export/${reportId}?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const departmentsService = adminApi;
export const rolesService = adminApi;
export const jobsService = adminApi;
export const surveysService = adminApi;
export const profileService = adminApi;

export default adminApi;
