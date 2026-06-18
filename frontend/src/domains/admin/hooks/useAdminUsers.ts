import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending Verification';
  studentId?: string;
  department?: string;
  batch?: string;
  lastLogin?: string;
  registeredAt?: string;
  phone?: string;
  adminNotes?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export default function useAdminUsers(params?: UserListParams) {
  const [data, setData] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminApi.listUsers(params);

      // Transform API response to match AdminUserRecord interface
      const transformedData = response.map((user: any) => ({
        id: user.id,
        name: user.fullName || user.name,
        email: user.email,
        role: user.role,
        status:
          user.status === 'Active' || user.status === 'ACTIVE'
            ? 'Active'
            : user.status === 'Suspended' || user.status === 'SUSPENDED'
              ? 'Suspended'
              : user.status === 'Inactive' || user.status === 'INACTIVE'
                ? 'Inactive'
                : 'Pending Verification',
        studentId: user.studentId || '',
        department: user.department || '',
        batch: user.batch || '',
        lastLogin: user.lastLogin || '',
        registeredAt: user.registeredAt || '',
        phone: user.phone || '',
        adminNotes: user.adminNotes || '',
      }));

      setData(transformedData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}
