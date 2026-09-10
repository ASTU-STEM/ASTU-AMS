import axios from 'axios';
import type { ApiResult } from '../../auth/services/auth.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: string;
  department: string;
  batch: string;
  status: string;
  lastLogin: string;
  registeredAt: string;
  phone: string;
};

export type GetUsersResponse = {
  users: AdminUserRow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  stats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    inactive: number;
  };
};

export const adminService = {
  async getAdminProfile(): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/admin/profile');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_PROFILE_ERROR', message: error.response?.data?.message || 'Failed to fetch admin profile' };
    }
  },

  async updateAdminProfile(data: any): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.put<{ success: boolean; data: any }>('/admin/profile', data);
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'UPDATE_PROFILE_ERROR', message: error.response?.data?.message || 'Failed to update admin profile' };
    }
  },

  async updateAdminSecurity(data: any): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.put<{ success: boolean; data: any }>('/admin/profile/security', data);
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'UPDATE_SECURITY_ERROR', message: error.response?.data?.message || 'Failed to update admin security' };
    }
  },

  async getUsers(params: {
    page?: number;
    limit?: number;
    query?: string;
    role?: string;
    status?: string;
    department?: string;
  }): Promise<ApiResult<GetUsersResponse>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: GetUsersResponse }>('/admin/users', { params });
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_USERS_ERROR', message: error.response?.data?.message || 'Failed to fetch users' };
    }
  },

  async getJobs(params: { page?: number; limit?: number; query?: string; status?: string }): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/admin/jobs', { params });
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_JOBS_ERROR', message: error.response?.data?.message || 'Failed to fetch jobs' };
    }
  },

  async updateJobStatus(id: string, status: string): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.put<{ success: boolean; data: any }>(`/admin/jobs/${id}/status`, { status });
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'UPDATE_JOB_STATUS_ERROR', message: error.response?.data?.message || 'Failed to update job status' };
    }
  },

  async getRoleStats(): Promise<ApiResult<Record<string, number>>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Record<string, number> }>('/admin/roles/stats');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_ROLE_STATS_ERROR', message: error.response?.data?.message || 'Failed to fetch role stats' };
    }
  },

  async getSidebarStats(): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/admin/sidebar-stats');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_SIDEBAR_STATS_ERROR', message: error.response?.data?.message || 'Failed to fetch sidebar stats' };
    }
  },

  async getDashboardMetrics(range?: string): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/admin/dashboard/metrics', { params: { range } });
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_METRICS_ERROR', message: error.response?.data?.message || 'Failed to fetch metrics' };
    }
  },

  async getAnalyticsReport(params?: { academicYear?: string; department?: string }): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/analytics/report', { params });
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_ANALYTICS_ERROR', message: error.response?.data?.message || 'Failed to fetch analytics' };
    }
  },

  async createUser(data: Record<string, any>): Promise<ApiResult<{ success: boolean; user: any }>> {
    try {
      const response = await apiClient.post<{ success: boolean; user: any }>('/admin/users', data);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'CREATE_USER_ERROR', message: error.response?.data?.message || 'Failed to create user' };
    }
  },

  async updateUserStatus(id: string, action: 'activate' | 'suspend' | 'verify'): Promise<ApiResult<{ success: boolean }>> {
    try {
      const response = await apiClient.put<{ success: boolean }>(`/admin/users/${id}/status`, { action });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'UPDATE_STATUS_ERROR', message: error.response?.data?.message || 'Failed to update user status' };
    }
  },

  async bulkUpdateStatus(ids: string[], action: 'activate' | 'suspend' | 'verify'): Promise<ApiResult<{ success: boolean }>> {
    try {
      const response = await apiClient.put<{ success: boolean }>('/admin/users/bulk/status', { ids, action });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'BULK_UPDATE_ERROR', message: error.response?.data?.message || 'Failed to perform bulk update' };
    }
  },

  async deleteUser(id: string): Promise<ApiResult<{ success: boolean }>> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/admin/users/${id}`);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'DELETE_USER_ERROR', message: error.response?.data?.message || 'Failed to delete user' };
    }
  },

  // --- Department Management ---
  async getDepartments(): Promise<ApiResult<any[]>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/admin/departments');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_DEPARTMENTS_ERROR', message: error.response?.data?.message || 'Failed to fetch departments' };
    }
  },

  async createDepartment(data: { name: string; code: string }): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.post<{ success: boolean; data: any }>('/admin/departments', data);
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'CREATE_DEPT_ERROR', message: error.response?.data?.message || 'Failed to create department' };
    }
  },

  async updateDepartment(id: string, data: { name?: string; code?: string }): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.put<{ success: boolean; data: any }>(`/admin/departments/${id}`, data);
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'UPDATE_DEPT_ERROR', message: error.response?.data?.message || 'Failed to update department' };
    }
  },

  async deleteDepartment(id: string): Promise<ApiResult<{ success: boolean }>> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/admin/departments/${id}`);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'DELETE_DEPT_ERROR', message: error.response?.data?.message || 'Failed to delete department' };
    }
  },

  // --- Logs & Security ---
  async getLogs(params: { page?: number; limit?: number; query?: string; action?: string; dateFrom?: string; dateTo?: string }): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/admin/logs', { params });
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_LOGS_ERROR', message: error.response?.data?.message || 'Failed to fetch logs' };
    }
  },

  async getLogStats(): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/admin/logs/stats');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_LOG_STATS_ERROR', message: error.response?.data?.message || 'Failed to fetch log stats' };
    }
  },

  async getSyncLogs(): Promise<ApiResult<any[]>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/admin/sync-logs');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_SYNC_LOGS_ERROR', message: error.response?.data?.message || 'Failed to fetch sync logs' };
    }
  },

  // --- Notifications ---
  async getNotifications(params: { page?: number; limit?: number; query?: string }): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/admin/notifications', { params });
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_NOTIFICATIONS_ERROR', message: error.response?.data?.message || 'Failed to fetch notifications' };
    }
  },

  async getNotificationStats(): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/admin/notifications/stats');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_NOTIFICATION_STATS_ERROR', message: error.response?.data?.message || 'Failed to fetch notification stats' };
    }
  },

  async sendNotification(data: { title: string; content: string; targetRole?: string; targetUserIds?: string[] }): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.post<{ success: boolean; data: any }>('/admin/notifications/send', data);
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'SEND_NOTIFICATION_ERROR', message: error.response?.data?.message || 'Failed to send notification' };
    }
  },

  // --- System Settings ---
  async getSettings(): Promise<ApiResult<Record<string, any>>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Record<string, any> }>('/admin/settings');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_SETTINGS_ERROR', message: error.response?.data?.message || 'Failed to fetch settings' };
    }
  },

  async updateSettings(data: Record<string, any>): Promise<ApiResult<Record<string, any>>> {
    try {
      const response = await apiClient.put<{ success: boolean; data: Record<string, any> }>('/admin/settings', data);
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'UPDATE_SETTINGS_ERROR', message: error.response?.data?.message || 'Failed to update settings' };
    }
  },

  // --- Donations & Campaigns Management ---
  async getDonationCampaigns(): Promise<ApiResult<any[]>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/admin/donations/campaigns');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_CAMPAIGNS_ERROR', message: error.response?.data?.message || 'Failed to fetch campaigns' };
    }
  },

  async createDonationCampaign(data: { title: string; description?: string; targetAmount: number; category?: string }): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.post<{ success: boolean; data: any }>('/admin/donations/campaigns', data);
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'CREATE_CAMPAIGN_ERROR', message: error.response?.data?.message || 'Failed to create campaign' };
    }
  },

  async updateDonationCampaign(id: string, data: any): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.put<{ success: boolean; data: any }>(`/admin/donations/campaigns/${id}`, data);
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'UPDATE_CAMPAIGN_ERROR', message: error.response?.data?.message || 'Failed to update campaign' };
    }
  },

  async deleteDonationCampaign(id: string): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/admin/donations/campaigns/${id}`);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'DELETE_CAMPAIGN_ERROR', message: error.response?.data?.message || 'Failed to delete campaign' };
    }
  },

  async getDonorsList(): Promise<ApiResult<any[]>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/admin/donations/donors');
      return { ok: true, data: response.data.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'GET_DONORS_ERROR', message: error.response?.data?.message || 'Failed to fetch donors' };
    }
  }
};

