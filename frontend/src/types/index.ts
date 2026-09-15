export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ALUMNI' | 'EMPLOYER' | 'REGISTRAR' | 'DEPARTMENT_HEAD' | 'ADMIN' | 'SUPER_ADMIN' | 'CMS_MANAGER' | 'ALUMNI_OFFICE';

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export type NotificationType = 'SURVEY' | 'JOB' | 'EVENT' | 'MESSAGE' | 'MENTORSHIP' | 'DOCUMENT' | 'SYSTEM' | 'DONATION';

export interface FileUpload {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface Address {
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface StatsCard {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  trend?: number;
  trendLabel?: string;
  color?: string;
}
