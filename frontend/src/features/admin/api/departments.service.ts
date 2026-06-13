import { get, post, put, remove } from './client';

export interface Department {
  id: string;
  name: string;
  college: string;
  head: string;
  totalGraduates: number;
  employmentRate: number;
  activeAlumni: number;
  avgSalary: number;
  topSector: string;
}

export interface DepartmentAlumni {
  id: string;
  name: string;
  email: string;
  studentId: string;
  batch: string;
  status: string;
  currentEmployer?: string;
  currentPosition?: string;
}

export const departmentsService = {
  async getDepartments(): Promise<Department[]> {
    return get<Department[]>('/admin/departments');
  },

  async getDepartmentById(id: string): Promise<Department> {
    return get<Department>(`/admin/departments/${id}`);
  },

  async getDepartmentAlumni(departmentId: string): Promise<DepartmentAlumni[]> {
    return get<DepartmentAlumni[]>(`/admin/departments/${departmentId}/alumni`);
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    return put<Department>(`/admin/departments/${id}`, data);
  },

  async exportDepartmentData(departmentId: string, format: 'csv' | 'excel'): Promise<Blob> {
    const response = await fetch(`/api/admin/departments/${departmentId}/export/${format}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to export department data');
    }
    return response.blob();
  },
};
