import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Users, UserCheck, Shield, Clock, Plus, Download, RefreshCw } from 'lucide-react';
import { UserRow, UserFilters } from './users/userManagement.types';
import { UserFilterBar } from './users/UserFilterBar';
import { UserTable } from './users/UserTable';
import { UserDetailsModal } from './users/UserDetailsModal';
import { EditUserModal } from './users/EditUserModal';
import { RoleAssignmentModal } from './users/RoleAssignmentModal';
import { adminService } from '../services/admin.service';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminStatGrid from '../components/AdminStatGrid';
import AdminSectionCard, {
  adminHeroGhostBtnClass,
  adminHeroPrimaryBtnClass,
  adminPanelClass,
  adminTabBtnClass,
  adminTabRailClass,
} from '../components/AdminSectionCard';

const INITIAL_USERS: UserRow[] = [
  {
    id: 'usr-1',
    name: 'Abebe Bikila',
    email: 'abebe.bikila@alumni.astu.edu.et',
    studentId: 'ETS/0123/11',
    role: 'Alumni',
    department: 'Software Engineering',
    batch: '2023',
    status: 'Active',
    lastLogin: '10 mins ago',
    registeredAt: '2023-07-10',
    phone: '+251 91 122 3344',
    cgpa: '3.89',
    employerName: 'Ethio Telecom Innovation Labs',
    jobTitle: 'Senior Cloud Engineer',
    skills: ['React', 'TypeScript', 'Docker', 'AWS'],
  },
  {
    id: 'usr-2',
    name: 'Dr. Tesfaye Alemu',
    email: 'tesfaye.alemu@astu.edu.et',
    studentId: 'FAC/0045/08',
    role: 'Department Head',
    department: 'Software Engineering',
    batch: '2015',
    status: 'Active',
    lastLogin: '1 hour ago',
    registeredAt: '2020-09-01',
    phone: '+251 92 334 5566',
  },
  {
    id: 'usr-3',
    name: 'Bethlehem Tadesse',
    email: 'hr@cbe.com.et',
    studentId: '',
    role: 'Employer',
    department: 'Corporate Relations',
    batch: '2024',
    status: 'Active',
    lastLogin: '3 hours ago',
    registeredAt: '2024-02-14',
    phone: '+251 93 445 6677',
    employerName: 'Commercial Bank of Ethiopia',
    jobTitle: 'Talent Acquisition Director',
  },
  {
    id: 'usr-4',
    name: 'Sara Worku',
    email: 'sara.registrar@astu.edu.et',
    studentId: 'STF/0890/14',
    role: 'Registrar',
    department: 'Academic Registrar Hub',
    batch: '2020',
    status: 'Active',
    lastLogin: 'Just now',
    registeredAt: '2021-03-20',
    phone: '+251 94 556 7788',
  },
  {
    id: 'usr-5',
    name: 'Yared Hailu',
    email: 'yared.admin@astu.edu.et',
    studentId: 'ADM/0001/05',
    role: 'Super Admin',
    department: 'ICT Directorate',
    batch: '2010',
    status: 'Active',
    lastLogin: 'Active now',
    registeredAt: '2018-01-10',
    phone: '+251 95 667 8899',
  },
];

const STATUS_TABS = ['All', 'Active', 'Pending Verification', 'Suspended', 'Inactive'] as const;

export default function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
  const [filters, setFilters] = useState<UserFilters>({
    query: '',
    role: 'All',
    status: 'All',
    department: 'All',
    batch: 'All',
  });

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [viewingUser, setViewingUser] = useState<UserRow | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<UserRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const fetchUsers = () => {
    adminService
      .getUsers({})
      .then((res: any) => {
        const data = res?.data?.users ?? res?.data ?? res;
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const departments = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.department).filter(Boolean)));
  }, [users]);

  const batches = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.batch).filter(Boolean))).sort().reverse();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchQuery =
        !filters.query ||
        u.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        u.email.toLowerCase().includes(filters.query.toLowerCase()) ||
        u.studentId.toLowerCase().includes(filters.query.toLowerCase());
      const matchRole = filters.role === 'All' || u.role === filters.role;
      const matchStatus = filters.status === 'All' || u.status === filters.status;
      const matchDept = filters.department === 'All' || u.department === filters.department;
      const matchBatch = filters.batch === 'All' || u.batch === filters.batch;
      return matchQuery && matchRole && matchStatus && matchDept && matchBatch;
    });
  }, [users, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleFilterChange = (key: keyof UserFilters, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  };

  const handleSaveUser = (saved: Partial<UserRow>) => {
    if (editingUser) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? ({ ...u, ...saved } as UserRow) : u)));
    } else {
      const newUser: UserRow = {
        id: `usr-${Date.now()}`,
        name: saved.name || '',
        email: saved.email || '',
        studentId: saved.studentId || '',
        phone: saved.phone || '',
        role: saved.role || 'Alumni',
        department: saved.department || 'General',
        batch: saved.batch || '2024',
        status: saved.status || 'Active',
        lastLogin: 'Never',
        registeredAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [newUser, ...prev]);
    }
  };

  const handleDeleteUser = (u: UserRow) => {
    if (window.confirm(`Are you sure you want to deactivate or remove ${u.name}?`)) {
      setUsers((prev) => prev.filter((item) => item.id !== u.id));
      setSelectedUserIds((prev) => prev.filter((id) => id !== u.id));
      toast.success(`User ${u.name} removed.`);
    }
  };

  const openAddUser = () => {
    setEditingUser(null);
    setIsEditModalOpen(true);
  };

  const userStats = [
    {
      title: 'Total Accounts',
      value: String(users.length),
      icon: Users,
      tone: 'blue' as const,
      description: 'Across all portals',
    },
    {
      title: 'Active Users',
      value: String(users.filter((u) => u.status === 'Active').length),
      icon: UserCheck,
      tone: 'green' as const,
      description: 'Verified credentials',
    },
    {
      title: 'Pending Verification',
      value: String(users.filter((u) => u.status === 'Pending Verification').length),
      icon: Clock,
      tone: 'amber' as const,
      description: 'Awaiting review',
    },
    {
      title: 'Administrators',
      value: String(users.filter((u) => String(u.role).includes('Admin')).length),
      icon: Shield,
      tone: 'purple' as const,
      description: 'Security clearance',
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        subtitle="Manage accounts, verification status, roles, and directory access across ASTU portals."
        breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }]}
        actions={
          <>
            <button type="button" onClick={fetchUsers} className={adminHeroGhostBtnClass}>
              <RefreshCw className="h-4 w-4 text-[#FFCC00]" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => toast.success('Exporting filtered user roster to CSV/Excel...')}
              className={adminHeroGhostBtnClass}
            >
              <Download className="h-4 w-4 text-[#FFCC00]" />
              Export
            </button>
            <button type="button" onClick={openAddUser} className={adminHeroPrimaryBtnClass}>
              <Plus className="h-4 w-4" />
              New User
            </button>
          </>
        }
      />

      <AdminStatGrid stats={userStats} cols={4} compact />

      <div className={adminTabRailClass}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleFilterChange('status', tab)}
            className={adminTabBtnClass(filters.status === tab)}
          >
            {tab}
            <span
              className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold ${
                filters.status === tab
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--bg-page)] text-[var(--text-muted)]'
              }`}
            >
              {tab === 'All'
                ? users.length
                : users.filter((u) => u.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <AdminSectionCard title="Filters" subtitle="Search and segment the user directory.">
        <UserFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={() => {
            setFilters({ query: '', role: 'All', status: 'All', department: 'All', batch: 'All' });
            setCurrentPage(1);
          }}
          onExport={() => toast.success('Exporting filtered user roster to CSV/Excel...')}
          onAddUser={openAddUser}
          departments={departments}
          batches={batches}
        />
      </AdminSectionCard>

      <section className={`${adminPanelClass} overflow-hidden`}>
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-color)] px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">User Directory</h3>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Showing {paginatedUsers.length} of {filteredUsers.length} matching accounts
            </p>
          </div>
        </div>
        <UserTable
          users={paginatedUsers}
          selectedUserIds={selectedUserIds}
          onToggleSelect={(id) =>
            setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
          }
          onToggleSelectAll={() =>
            setSelectedUserIds(
              selectedUserIds.length === paginatedUsers.length ? [] : paginatedUsers.map((u) => u.id)
            )
          }
          onViewUser={setViewingUser}
          onEditUser={(u) => {
            setEditingUser(u);
            setIsEditModalOpen(true);
          }}
          onChangeRole={setRoleModalUser}
          onDeleteUser={handleDeleteUser}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>

      <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />

      <EditUserModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveUser}
      />

      <RoleAssignmentModal
        user={roleModalUser}
        isOpen={Boolean(roleModalUser)}
        onClose={() => setRoleModalUser(null)}
        onAssignRole={(id, newRole) => {
          setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
        }}
      />
    </div>
  );
}
