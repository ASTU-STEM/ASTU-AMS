import axios, { AxiosError } from 'axios';
import type { LoginCredentials, SignupData, AuthResponse } from '../types/auth.types';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request Interceptor - Add Authorization Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // ==================== LOGIN ====================
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

      const { data } = response;

      if (data.success && data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.response?.data?.error || 
          'Login failed. Please check your credentials.'
        );
      }
      throw new Error('An unexpected error occurred during login.');
    }
  },

  // ==================== SIGNUP ====================
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          'Registration failed. Please try again.'
        );
      }
      throw new Error('An unexpected error occurred during registration.');
    }
  },

  // ==================== LOGOUT ====================
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed, proceeding with local cleanup:', error);
    } finally {
      // Always clear local data
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // ==================== REFRESH TOKEN ====================
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });

      const { data } = response;

      if (data.success && data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
      }

      return data;
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }
  },

  // ==================== GET CURRENT USER ====================
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>('/auth/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user profile.');
      }
      throw new Error('An unexpected error occurred.');
    }
  },

  // ==================== PASSWORD RESET ====================
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to send reset link.');
      }
      throw new Error('An unexpected error occurred.');
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to reset password.');
      }
      throw new Error('An unexpected error occurred.');
    }
  },
};

export default authService;