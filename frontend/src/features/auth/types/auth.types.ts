export type UserRole = 'ALUMNI' | 'EMPLOYER' | 'REGISTRAR' | 'DEPARTMENT_HEAD' | 'ADMIN' | 'CMS_MANAGER';

export interface LoginCredentials {
  emailOrStudentId: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  educationalQualification: string;
  workPlace: string;
  workPosition: string;
  studentId: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
  batch?: string;
  phone?: string;
  activationCode?: string;
  hasNoAstuEmail?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      fullName: string;
      role: UserRole;
      studentId?: string;
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
    fullName: string;
    role: UserRole;
    studentId?: string;
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
