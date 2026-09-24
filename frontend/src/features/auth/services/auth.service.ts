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
      localStorage.removeItem('astu_ams_user_role');
      window.dispatchEvent(new Event('astu-auth-changed'));
    }
    return Promise.reject(error);
  }
);

export type ApiResult<T> =
  | { ok: true; data: T; message?: string; errorCode?: string }
  | { ok: false; errorCode: string; message: string };

export const authService = {
  /**
   * Universal 3-Tier 2FA Email Resolution across all 5 portals:
   * Tier 1: Primary contact/notification email entered in component form
   * Tier 2: Profile/Domain email stored in database (Alumni, Employer, Staff, Admin)
   * Tier 3: Account registration email used during sign-in (from localStorage 'user' or session)
   */
  resolveTarget2FAEmail(formEmail?: string, profileEmail?: string): string {
    if (formEmail && typeof formEmail === 'string' && formEmail.trim()) return formEmail.trim();
    if (profileEmail && typeof profileEmail === 'string' && profileEmail.trim()) return profileEmail.trim();

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.email && typeof parsed.email === 'string' && parsed.email.trim()) {
          return parsed.email.trim();
        }
      }
    } catch {}

    try {
      const storedAuth = localStorage.getItem('astu_auth');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed.user?.email) return parsed.user.email.trim();
      }
    } catch {}

    return '';
  },

  // ==================== CHANGE PASSWORD ====================
  async changePassword(data: { currentPassword?: string; newPassword: string }): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.put('/auth/change-password', data);
      return { ok: true, data: response.data, message: response.data?.message || 'Password changed successfully!' };
    } catch (error: any) {
      return { ok: false, errorCode: 'CHANGE_PWD_FAILED', message: error.response?.data?.message || 'Failed to update password.' };
    }
  },

  // ==================== TOGGLE 2FA ====================
  async toggle2FA(enabled: boolean): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.put('/auth/toggle-2fa', { enabled });
      return { ok: true, data: response.data, message: response.data?.message || '2FA status updated' };
    } catch (error: any) {
      return { ok: false, errorCode: 'TOGGLE_2FA_FAILED', message: error.response?.data?.message || 'Failed to update 2FA status.' };
    }
  },

  // ==================== SEND 2FA OTP ====================
  async send2FAOTP(email: string): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.post('/auth/send-2fa-otp', { email });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'OTP_ERROR', message: error.response?.data?.message || 'Failed to send OTP email.' };
    }
  },

  // ==================== VERIFY 2FA CODE ====================
  async verify2FACode(code: string, email: string): Promise<ApiResult<any>> {
    try {
      const response = await apiClient.post('/auth/verify-2fa-code', { code, email });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, errorCode: 'VERIFY_ERROR', message: error.response?.data?.message || 'Invalid 2FA verification code.' };
    }
  },

  // ==================== LOGIN ====================
  async login(credentials: LoginCredentials): Promise<ApiResult<AuthResponse['data']>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { data } = response;

      if (data.success && (data.data?.token || (data.data as any)?.requires2FA)) {
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
          if (data.data.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken);
          }
          if (data.data.user) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('astu_ams_user_role', data.data.user.role);
          }
          window.dispatchEvent(new Event('astu-auth-changed'));
        }
        return { ok: true, data: data.data };
      }

      return {
        ok: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: data.message || 'Login failed. Please check your credentials.'
      };
    } catch (error) {
      let message = 'Login failed. Please check your email/student ID and password.';
      let errorCode = 'SERVER_ERROR';
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          const resData = error.response.data as any;
          message = resData.message || resData.error || message;
          errorCode = resData.errorCode || errorCode;
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
          message = 'Unable to reach backend server (http://localhost:5000). Please ensure the backend server is running.';
        }
      }
      return { ok: false, errorCode, message };
    }
  },

  // ==================== SIGNUP ====================
  async signup(data: SignupData): Promise<ApiResult<{ success: boolean; email?: string; redirect?: string }>> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data?: { email?: string; studentId?: string; verificationCodeSent?: boolean; redirect?: string } }>('/auth/register', data);
      return { 
        ok: true, 
        data: { 
          success: response.data.success, 
          email: response.data.data?.email,
          redirect: response.data.data?.redirect
        } 
      };
    } catch (error) {
      let message = 'Registration failed. Please try again.';
      let errorCode = 'SIGNUP_ERROR';
      if (axios.isAxiosError(error) && error.response?.data) {
        const resData = error.response.data as any;
        message = resData.message || message;
        errorCode = resData.errorCode || errorCode;
      }
      return { ok: false, errorCode, message };
    }
  },

  // ==================== REGISTRATION ISSUE ====================
  async submitRegistrationIssue(formData: FormData): Promise<ApiResult<{ success: boolean }>> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/register/issue', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        return { ok: true, data: { success: true } };
      }
      return { ok: false, errorCode: 'SUBMIT_ISSUE_FAILED', message: response.data.message || 'Submission failed.' };
    } catch (error) {
      let message = 'An unexpected error occurred while submitting.';
      if (axios.isAxiosError(error) && error.response?.data) {
        message = (error.response.data as any).message || message;
      }
      return { ok: false, errorCode: 'SUBMIT_ISSUE_ERROR', message };
    }
  },

  // ==================== EMPLOYER REGISTRATION ====================
  async registerEmployer(data: any): Promise<ApiResult<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/employer/register', data);
      return { 
        ok: true, 
        data: { 
          success: response.data.success,
          message: response.data.message
        } 
      };
    } catch (error) {
      let message = 'Employer registration failed. Please try again.';
      let errorCode = 'EMPLOYER_REG_ERROR';
      if (axios.isAxiosError(error) && error.response?.data) {
        const resData = error.response.data as any;
        message = resData.message || message;
        errorCode = resData.errorCode || errorCode;
      }
      return { ok: false, errorCode, message };
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
      localStorage.removeItem('astu_ams_user_role');
      window.dispatchEvent(new Event('astu-auth-changed'));
    }
  },

  // ==================== REFRESH TOKEN ====================
  async refreshToken(): Promise<ApiResult<AuthResponse['data']>> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return { ok: false, errorCode: 'NO_REFRESH_TOKEN', message: 'No refresh token available' };
      }

      const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
      const { data } = response;

      if (data.success && data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        return { ok: true, data: data.data };
      }
      return { ok: false, errorCode: 'REFRESH_FAILED', message: 'Failed to refresh token' };
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('astu_ams_user_role');
      window.dispatchEvent(new Event('astu-auth-changed'));
      return { ok: false, errorCode: 'REFRESH_ERROR', message: 'Session expired. Please login again.' };
    }
  },

  // ==================== GET CURRENT USER ====================
  async getCurrentUser(): Promise<ApiResult<AuthResponse['data']>> {
    try {
      const response = await apiClient.get<AuthResponse>('/auth/me');
      if (response.data.success && response.data.data) {
        return { ok: true, data: response.data.data };
      }
      return { ok: false, errorCode: 'GET_USER_FAILED', message: 'Failed to fetch user profile.' };
    } catch (error) {
      return {
        ok: false,
        errorCode: 'GET_USER_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.'
      };
    }
  },

  // ==================== PASSWORD RESET ====================
  async requestPasswordReset(emailOrPhone: string, method: 'email' | 'phone'): Promise<ApiResult<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data?: any }>('/auth/forgot-password', { identifier: emailOrPhone, method });
      if (response.data.success) {
        return { ok: true, data: response.data };
      }
      return { ok: false, errorCode: 'REQUEST_RESET_FAILED', message: response.data.message || 'Failed to send reset code.' };
    } catch (error) {
      let message = 'An unexpected error occurred.';
      if (axios.isAxiosError(error) && error.response?.data) {
        message = (error.response.data as any).message || message;
      }
      return { ok: false, errorCode: 'REQUEST_RESET_ERROR', message };
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResult<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/reset-password', {
        token,
        newPassword,
      });
      if (response.data.success) {
        return { ok: true, data: { success: true, message: response.data.message } };
      }
      return { ok: false, errorCode: 'RESET_PASSWORD_FAILED', message: response.data.message || 'Failed to reset password.' };
    } catch (error) {
      let message = 'An unexpected error occurred.';
      if (axios.isAxiosError(error) && error.response?.data) {
        message = (error.response.data as any).message || message;
      }
      return { ok: false, errorCode: 'RESET_PASSWORD_ERROR', message };
    }
  },

  // ==================== OTP VERIFICATION ====================
  async verifyOtp(studentId: string, otp: string): Promise<ApiResult<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/register/verify-email', { studentId, code: otp });
      if (response.data.success) {
        return { ok: true, data: response.data };
      }
      return { ok: false, errorCode: 'INVALID', message: response.data.message || 'Verification failed.' };
    } catch (error) {
      let message = 'OTP verification failed. Please try again.';
      let errorCode = 'INVALID';
      if (axios.isAxiosError(error) && error.response?.data) {
        const resData = error.response.data as any;
        message = resData.message || message;
        errorCode = resData.errorCode || errorCode;
      }
      return { ok: false, errorCode, message };
    }
  },

  async resendOtp(email: string): Promise<ApiResult<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/resend-otp', { email });
      if (response.data.success) {
        return { ok: true, data: response.data };
      }
      return { ok: false, errorCode: 'RESEND_FAILED', message: response.data.message || 'Failed to resend OTP.' };
    } catch (error) {
      let message = 'An unexpected error occurred.';
      if (axios.isAxiosError(error) && error.response?.data) {
        message = (error.response.data as any).message || message;
      }
      return { ok: false, errorCode: 'RESEND_ERROR', message };
    }
  },

  // ==================== DIDIT VERIFICATION ====================
  async startDiditVerification(studentId: string): Promise<ApiResult<{ verificationUrl: string; sessionId: string }>> {
    try {
      const response = await apiClient.post<{ success: boolean; data?: { verificationUrl: string; sessionId: string }; message?: string }>('/auth/didit-session', { studentId });
      if (response.data.success && response.data.data) {
        return { ok: true, data: response.data.data };
      }
      return { ok: false, errorCode: 'DIDIT_INIT_FAILED', message: response.data.message || 'Didit verification failed.' };
    } catch (error) {
      let message = 'An unexpected error occurred.';
      if (axios.isAxiosError(error) && error.response?.data) {
        message = (error.response.data as any).message || message;
      }
      return { ok: false, errorCode: 'DIDIT_INIT_ERROR', message };
    }
  },

  async getDiditStatus(sessionId: string): Promise<ApiResult<{ status: 'processing' | 'success' | 'failed' | 'cancelled' | 'expired' }>> {
    try {
      const response = await apiClient.get<{ success: boolean; data?: { status: 'processing' | 'success' | 'failed' | 'cancelled' | 'expired' }; message?: string }>(`/auth/didit-status/${sessionId}`);
      if (response.data.success && response.data.data) {
        return { ok: true, data: response.data.data };
      }
      return { ok: false, errorCode: 'DIDIT_STATUS_FAILED', message: response.data.message || 'Failed to query status.' };
    } catch (error) {
      let message = 'An unexpected error occurred.';
      if (axios.isAxiosError(error) && error.response?.data) {
        message = (error.response.data as any).message || message;
      }
      return { ok: false, errorCode: 'DIDIT_STATUS_ERROR', message };
    }
  },

  async verifyDiditSession(sessionId: string, nationalIdName: string): Promise<ApiResult<{ status: 'success' | 'failed' | 'expired'; message: string }>> {
    try {
      const response = await apiClient.post<{ success: boolean; data?: { status: 'success' | 'failed' | 'expired'; message: string }; message?: string }>('/auth/didit-verify', { sessionId, nationalIdName });
      if (response.data.success && response.data.data) {
        return { ok: true, data: response.data.data };
      }
      return { ok: false, errorCode: 'DIDIT_VERIFY_FAILED', message: response.data.message || 'Verification failed.' };
    } catch (error) {
      let message = 'An unexpected error occurred.';
      if (axios.isAxiosError(error) && error.response?.data) {
        message = (error.response.data as any).message || message;
      }
      return { ok: false, errorCode: 'DIDIT_VERIFY_ERROR', message };
    }
  },

  // ==================== MANUAL VERIFICATION ====================
  async submitManualVerification(formData: FormData): Promise<ApiResult<{ success: boolean; requestId?: string }>> {
    try {
      const response = await apiClient.post<{ success: boolean; data?: { requestId: string }; message?: string }>('/auth/register/verify-manual', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        return { ok: true, data: { success: true, requestId: response.data.data?.requestId } };
      }
      return { ok: false, errorCode: 'MANUAL_SUBMIT_FAILED', message: response.data.message || 'Manual verification submission failed.' };
    } catch (error) {
      let message = 'Manual verification submission failed.';
      if (axios.isAxiosError(error) && error.response?.data) {
        message = (error.response.data as any).message || message;
      }
      return { ok: false, errorCode: 'MANUAL_SUBMIT_ERROR', message };
    }
  },
};

export default authService;
