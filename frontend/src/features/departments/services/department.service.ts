import api from '../../../services/api';

export interface DepartmentStats {
  totalAlumni: number;
  employedAlumni: number;
  selfEmployedAlumni: number;
  unemployedAlumni: number;
  employmentRate: number;
  averageSalary: number | null;
}

export interface DepartmentAlumniRecord {
  id: string;
  userId: string | null;
  studentId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  graduationYear: number;
  /** Null when the graduate has not reported a status; rendered as "Unknown". */
  employmentStatus: string | null;
  salary: number | null;
  skills: string[];
  company: string | null;
  jobTitle: string | null;
  industry: string | null;
  location: string | null;
  isVerified: boolean;
}

export interface DepartmentProfile {
  id: string;
  code: string;
  name: string;
}

export interface DepartmentAnalytics {
  totalAlumni: number;
  employed: number;
  selfEmployed: number;
  unemployed: number;
  /** Graduates who never set a status; excluded from the unemployment rate. */
  unspecified: number;
  employmentRate: number;
  unemploymentRate: number;
  selfEmploymentRate: number;
  averageSalary: number | null;
  medianSalary: number | null;
  salaryCount: number;
  /** Share of the department that has reported a salary (0-100). */
  salaryCoverage: number;
  verifiedCount: number;
  unverifiedCount: number;
  employmentTrend: { year: string; graduates: number; employed: number; employmentRate: number }[];
  employmentStatusDistribution: { status: string; count: number; percentage: number }[];
  topCompanies: { name: string; count: number; percentage: number }[];
  topIndustries: { name: string; count: number; percentage: number }[];
  topSkills: { name: string; count: number; percentage: number }[];
  locations: { name: string; count: number; percentage: number }[];
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// Admins must scope every my-* call with ?departmentId=; the server rejects the
// request with 400 otherwise. Department heads are ignored by the server when
// they pass this, so it is only sent for admin sessions.
const scopeParams = (departmentId?: string | null) =>
  departmentId ? { params: { departmentId } } : undefined;

export const departmentService = {
  // All departments, used to populate the admin department switcher
  async getDepartments(): Promise<DepartmentProfile[]> {
    const response = await api.get<ApiEnvelope<DepartmentProfile[]>>('/departments');
    return response.data.data;
  },

  // Department info for authenticated department head (my-department)
  async getDepartmentProfile(departmentId?: string | null): Promise<DepartmentProfile> {
    const response = await api.get<ApiEnvelope<DepartmentProfile>>(
      '/departments/my-department',
      scopeParams(departmentId)
    );
    return response.data.data;
  },

  // Department-scoped stats for the authenticated department head (my-stats)
  async getDepartmentStats(departmentId?: string | null): Promise<DepartmentStats> {
    const response = await api.get<ApiEnvelope<DepartmentStats>>(
      '/departments/my-stats',
      scopeParams(departmentId)
    );
    return response.data.data;
  },

  // Department-scoped alumni records with employment status (my-alumni)
  async getDepartmentAlumni(departmentId?: string | null): Promise<DepartmentAlumniRecord[]> {
    const response = await api.get<ApiEnvelope<DepartmentAlumniRecord[]>>(
      '/departments/my-alumni',
      scopeParams(departmentId)
    );
    return response.data.data;
  },

  // Server-aggregated analytics for the authenticated department head (my-analytics)
  async getDepartmentAnalytics(departmentId?: string | null): Promise<DepartmentAnalytics> {
    const response = await api.get<ApiEnvelope<DepartmentAnalytics>>(
      '/departments/my-analytics',
      scopeParams(departmentId)
    );
    return response.data.data;
  },

  // Dispatch a survey template instantly to the department's eligible alumni
  async dispatchSurveyInstantly(
    templateId: string
  ): Promise<{ surveyId: string; dispatchedCount: number; totalTargeted: number }> {
    const response = await api.post<ApiEnvelope<{ surveyId: string; dispatchedCount: number; totalTargeted: number }>>(
      `/surveys/templates/${templateId}/send-instantly`
    );
    return response.data.data;
  },
};

export default departmentService;
