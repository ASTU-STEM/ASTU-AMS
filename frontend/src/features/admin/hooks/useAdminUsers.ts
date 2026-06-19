import { useMemo } from 'react';
import { adminMockData } from '../api/mockData';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Suspended' | 'Pending';
}

export default function useAdminUsers() {
  const data = useMemo<AdminUserRecord[]>(
    () =>
      adminMockData.alumniUsers.slice(0, 20).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status:
          user.status === 'Active'
            ? 'Active'
            : user.status === 'Suspended'
              ? 'Suspended'
              : 'Pending',
      })),
    []
  );

  return {
    data,
    isLoading: false,
    error: null,
    refetch: async () => undefined,
  };
}
