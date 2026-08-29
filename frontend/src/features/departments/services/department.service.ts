// Department Head Portal Service Layer
// All data fetching passes through this layer using the shared authenticated API client.

import api from '../../../services/api';

interface DepartmentStats {
  totalAlumni: number;
  employedAlumni: number;
  employmentRate: number;
}

export interface DepartmentAlumniRecord {
  id: string;
  userId: string;
  fullName: string;
  graduationYear: number;
  employmentStatus: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const departmentService = {
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
};

export default departmentService;
