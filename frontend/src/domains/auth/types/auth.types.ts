export type UserRole = 'ALUMNI' | 'EMPLOYER' | 'REGISTRAR' | 'DEPARTMENT_HEAD' | 'ADMIN' | 'CMS_MANAGER';

export interface LoginCredentials {
  emailOrStudentId: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  firstName: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  studentId: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
  batch?: string;
  phone?: string;
  activationCode?: string;
  educationalQualification?: string;
  workPlace?: string;
  workPosition?: string;
}

export interface RegisterEmployerData {
  email: string;
  password: string;
  companyName: string;
  industry: string;
  website?: string;
  location: string;
  hrContact: string;
  tin?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      email: string;
      role: UserRole;
    };
    token: string;
    refreshToken?: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: UserRole;
  } | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}
