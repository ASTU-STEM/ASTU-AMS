import { get, post, put, remove } from './client';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const rolesService = {
  async getRoles(): Promise<Role[]> {
    return get<Role[]>('/admin/roles');
  },

  async getRoleById(id: string): Promise<Role> {
    return get<Role>(`/admin/roles/${id}`);
  },

  async createRole(data: { name: string; description: string; permissions: string[] }): Promise<Role> {
    return post<Role>('/admin/roles', data);
  },

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    return put<Role>(`/admin/roles/${id}`, data);
  },

  async deleteRole(id: string): Promise<void> {
    return remove<void>(`/admin/roles/${id}`);
  },

  async getPermissions(): Promise<Permission[]> {
    return get<Permission[]>('/admin/roles/permissions');
  },

  async savePermissions(roleId: string, permissions: string[]): Promise<void> {
    return put<void>(`/admin/roles/${roleId}/permissions`, { permissions });
  },

  async exportRoles(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await fetch(`/api/admin/roles/export/${format}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to export roles');
    }
    return response.blob();
  },
};
