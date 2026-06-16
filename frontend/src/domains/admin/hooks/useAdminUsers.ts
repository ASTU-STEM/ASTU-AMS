import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Suspended' | 'Pending';
}

export default function useAdminUsers() {
  const [data, setData] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const users = await adminApi.listUsers();
      const mapped = (users ?? []).slice(0, 20).map((user: any) => ({
        id: user.id,
        name: user.alumniProfile?.fullName ?? user.employerProfile?.companyName ?? user.email,
        email: user.email,
        role: user.role,
        status:
          user.isActive
            ? 'Active' as const
            : 'Pending' as const,
      }));
      setData(mapped);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, isLoading, error, refetch: fetchUsers };
}
