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
  employmentStatus: string;
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

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const departmentService = {
  // Department info for authenticated department head (my-department)
  async getDepartmentProfile(): Promise<DepartmentProfile> {
    const response = await api.get<ApiEnvelope<DepartmentProfile>>('/departments/my-department');
    return response.data.data;
  },

  // Department-scoped stats for the authenticated department head (my-stats)
  async getDepartmentStats(): Promise<DepartmentStats> {
    const response = await api.get<ApiEnvelope<DepartmentStats>>('/departments/my-stats');
    return response.data.data;
  },

  // Department-scoped alumni records with employment status (my-alumni)
  async getDepartmentAlumni(): Promise<DepartmentAlumniRecord[]> {
    const response = await api.get<ApiEnvelope<DepartmentAlumniRecord[]>>('/departments/my-alumni');
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
