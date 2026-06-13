import { get, post, put, remove } from './client';

export interface User {
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
  adminNotes: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  studentId: string;
  role: string;
  department: string;
  batch: string;
  phone: string;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  status?: string;
  phone?: string;
  adminNotes?: string;
}

export const usersService = {
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    department?: string;
    status?: string;
  }): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.status) queryParams.append('status', params.status);
    
    return get<UsersResponse>(`/admin/users?${queryParams.toString()}`);
  },

  async getUserById(id: string): Promise<User> {
    return get<User>(`/admin/users/${id}`);
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    return post<User>('/admin/users', data);
  },

  async updateUser(data: UpdateUserRequest): Promise<User> {
    return put<User>(`/admin/users/${data.id}`, data);
  },

  async deleteUser(id: string): Promise<void> {
    return remove<void>(`/admin/users/${id}`);
  },

  async bulkUpdateUsers(userIds: string[], updates: Partial<UpdateUserRequest>): Promise<void> {
    return post<void>('/admin/users/bulk', { userIds, updates });
  },

  async exportUsers(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await fetch(`/api/admin/users/export/${format}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to export users');
    }
    return response.blob();
  },
};
