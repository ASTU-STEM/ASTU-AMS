import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  Eye,
  Filter,
  KeyRound,
  PencilLine,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Users,
  Clock3,
  Trash2,
  User,
  X,
  Check,
  UserRound,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import AdminBadge from '../components/AdminBadge';

type Role = 'Alumni' | 'Employer' | 'Department Head' | 'Registrar' | 'Admin';
type Status = 'Active' | 'Inactive' | 'Suspended' | 'Pending Verification';
type SortKey = 'name' | 'studentId' | 'role' | 'department' | 'batch' | 'status' | 'lastLogin';

type UserRow = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: Role;
  department: string;
  batch: string;
  status: Status;
  lastLogin: string;
  registeredAt: string;
  phone: string;
  avatar?: string;
  adminNotes?: string;
};

type UserFormState = {
  name: string;
  email: string;
  password: string;
  autoGeneratePassword: boolean;
  role: Role;
  department: string;
  studentId: string;
  phone: string;
  status: Status;
};

type FormErrors = Partial<Record<keyof UserFormState, string>>;

const roles: Array<'All Roles' | Role> = ['All Roles', 'Alumni', 'Employer', 'Department Head', 'Registrar', 'Admin'];
const statuses: Array<'All' | Status> = ['All', 'Active', 'Inactive', 'Suspended', 'Pending Verification'];
const departments = ['All Departments', 'Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Information Engineering', 'Registrar Office'];
const pageSize = 25;

const roleTone: Record<Role, 'default' | 'warning' | 'danger' | 'success' | 'neutral'> = {
  Alumni: 'default',
  Employer: 'warning',
  'Department Head': 'neutral',
  Registrar: 'success',
  Admin: 'danger',
};

const statusTone: Record<Status, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Active: 'success',
  Inactive: 'neutral',
  Suspended: 'danger',
  'Pending Verification': 'warning',
};

const roleColorClass: Record<Role, string> = {
  Alumni: 'bg-[#003580]/10 text-[#003580] border-[#003580]/15',
  Employer: 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20',
  'Department Head': 'bg-violet-100 text-violet-700 border-violet-200',
  Registrar: 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15',
  Admin: 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15',
};

const statusColorClass: Record<Status, string> = {
  Active: 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  Suspended: 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15',
  'Pending Verification': 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20',
};

const seedUsers: UserRow[] = [
  {
    id: 'USR-001',
    name: 'Abebe Kebede',
    email: 'abebe.kebede@astu.edu.et',
    studentId: 'ASTU/1024/18',
    role: 'Alumni',
    department: 'Software Engineering',
    batch: '2018',
    status: 'Active',
    lastLogin: '2026-05-27T11:20:00Z',
    registeredAt: '2022-10-14T08:00:00Z',
    phone: '+251 911 200 101',
    adminNotes: 'Completed tracer survey and verified profile.',
  },
  {
    id: 'USR-002',
    name: 'Tigist Haile',
    email: 'tigist@safir.com',
    studentId: '',
    role: 'Employer',
    department: 'External Partner',
    batch: 'N/A',
    status: 'Active',
    lastLogin: '2026-05-28T16:35:00Z',
    registeredAt: '2025-11-08T08:00:00Z',
    phone: '+251 911 200 202',
    adminNotes: 'Employer profile in good standing.',
  },
  {
    id: 'USR-003',
    name: 'Dr. Meseret Alemu',
    email: 'cs.head@astu.edu.et',
    studentId: '',
    role: 'Department Head',
    department: 'Computer Science',
    batch: 'Faculty',
    status: 'Active',
    lastLogin: '2026-05-28T09:10:00Z',
    registeredAt: '2024-08-22T08:00:00Z',
    phone: '+251 911 200 303',
    adminNotes: 'Department analytics access enabled.',
  },
  {
    id: 'USR-004',
    name: 'Dr. Abebe Assefa',
    email: 'registrar@astu.edu.et',
    studentId: '',
    role: 'Registrar',
    department: 'Registrar Office',
    batch: 'Faculty',
    status: 'Active',
    lastLogin: '2026-05-28T08:15:00Z',
    registeredAt: '2023-01-12T08:00:00Z',
    phone: '+251 911 200 404',
  },
  {
    id: 'USR-005',
    name: 'Admin User',
    email: 'admin@astu.edu.et',
    studentId: '',
    role: 'Admin',
    department: 'System Office',
    batch: 'N/A',
    status: 'Active',
    lastLogin: '2026-05-28T17:05:00Z',
    registeredAt: '2021-07-01T08:00:00Z',
    phone: '+251 911 200 505',
    adminNotes: 'Full system access.',
  },
  {
    id: 'USR-006',
    name: 'Helena Tesfaye',
    email: 'helena.tesfaye@astu.edu.et',
    studentId: 'ASTU/4412/19',
    role: 'Alumni',
    department: 'Electrical Engineering',
    batch: '2019',
    status: 'Pending Verification',
    lastLogin: '2026-05-26T14:40:00Z',
    registeredAt: '2026-05-21T08:00:00Z',
    phone: '+251 911 200 606',
  },
  {
    id: 'USR-007',
    name: 'Dawit Fikre',
    email: 'dawit.fikre@astu.edu.et',
    studentId: 'ASTU/9911/17',
    role: 'Alumni',
    department: 'Civil Engineering',
    batch: '2017',
    status: 'Suspended',
    lastLogin: '2026-04-18T10:12:00Z',
    registeredAt: '2022-09-01T08:00:00Z',
    phone: '+251 911 200 707',
    adminNotes: 'Account suspended due to password policy violation.',
  },
  {
    id: 'USR-008',
    name: 'Nati Dinku',
    email: 'nati.dinku@astu.edu.et',
    studentId: 'ASTU/3018/20',
    role: 'Alumni',
    department: 'Mechanical Engineering',
    batch: '2020',
    status: 'Inactive',
    lastLogin: '2026-02-02T09:00:00Z',
    registeredAt: '2024-11-19T08:00:00Z',
    phone: '+251 911 200 808',
  },
];

function makeUsers(): UserRow[] {
  const people = [...seedUsers];
  const extras = Array.from({ length: 48 }).map((_, index) => {
    const number = index + 9;
    const roleCycle: Role[] = ['Alumni', 'Employer', 'Department Head', 'Registrar', 'Admin'];
    const statusCycle: Status[] = ['Active', 'Inactive', 'Suspended', 'Pending Verification', 'Active'];
    const deptCycle = ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Information Engineering'];
    const role = roleCycle[index % roleCycle.length];
    const department = role === 'Employer' || role === 'Admin' ? 'System Office' : deptCycle[index % deptCycle.length];
    const isAlumni = role === 'Alumni';
    const name = [
      'Kalkidan', 'Saba', 'Henok', 'Mekdes', 'Yonas', 'Ruth', 'Mulu', 'Martha', 'Yohannes', 'Liya',
      'Netsanet', 'Amanuel', 'Betelhem', 'Fikir', 'Mekonnen', 'Sara', 'Zerihun', 'Rahel'
    ][index % 18];

    return {
      id: `USR-${String(number).padStart(3, '0')}`,
      name: `${name} ${['Abebe', 'Kassaye', 'Tadesse', 'Meles', 'Yimer', 'Beyene', 'Adugna', 'Mekonnen'][index % 8]}`,
      email: `${name.toLowerCase()}.${index + 1}@astu.edu.et`,
      studentId: isAlumni ? `ASTU/${1000 + index}/2${(index % 4) + 1}` : '',
      role,
      department,
      batch: isAlumni ? `20${(index % 4) + 17}` : 'N/A',
      status: statusCycle[index % statusCycle.length],
      lastLogin: new Date(Date.now() - (index + 1) * 86_400_000).toISOString(),
      registeredAt: new Date(Date.now() - (index + 90) * 86_400_000).toISOString(),
      phone: `+251 911 ${String(300 + index).padStart(3, '0')} ${String(100 + index).padStart(3, '0')}`,
      adminNotes: role === 'Alumni' ? 'Awaiting graduation record sync.' : 'System synced.',
    } satisfies UserRow;
  });

  return [...people, ...extras];
}

function generatePassword() {
  return `ASTU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatRelative(dateValue: string) {
  return `${formatDistanceToNow(new Date(dateValue), { addSuffix: true })}`;
}

function createDefaultForm(): UserFormState {
  return {
    name: '',
    email: '',
    password: '',
    autoGeneratePassword: true,
    role: 'Alumni',
    department: 'Computer Science',
    studentId: '',
    phone: '',
    status: 'Active',
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ total: 0, active: 0, pending: 0, suspended: 0, inactive: 0 });

  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'All Roles' | Role>('All Roles');
  const [selectedStatus, setSelectedStatus] = useState<'All' | Status>('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeUser, setActiveUser] = useState<UserRow | null>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(createDefaultForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [searchFocused, setSearchFocused] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { adminService } = await import('../services/admin.service');
    const response = await adminService.getUsers({
      page,
      limit: pageSize,
      query: query || undefined,
      role: selectedRole === 'All Roles' ? undefined : selectedRole,
      status: selectedStatus === 'All' ? undefined : selectedStatus,
      department: selectedDepartment === 'All Departments' ? undefined : selectedDepartment,
    });
    
    if (response.ok) {
      setUsers(response.data.users as UserRow[]);
      setTotalCount(response.data.totalCount);
      setTotalPages(response.data.totalPages);
      if (response.data.stats) {
        setGlobalStats(response.data.stats);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, query, selectedRole, selectedStatus, selectedDepartment, sortKey, sortDirection]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedRole, selectedStatus, selectedDepartment, dateFrom, dateTo]);

  useEffect(() => {
    const handleClick = () => setMenuUserId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const totalUsersLabel = `${globalStats.total} users`;
  const activeCount = globalStats.active;
  const pendingCount = globalStats.pending;
  const suspendedCount = globalStats.suspended;
  const inactiveCount = globalStats.inactive;

  const paginatedUsers = users;
  const filteredUsers = users;
  const allPageSelected = paginatedUsers.length > 0 && paginatedUsers.every((user) => selectedIds.includes(user.id));

  const resetFilters = () => {
    setQuery('');
    setSelectedRole('All Roles');
    setSelectedStatus('All');
    setSelectedDepartment('All Departments');
    setDateFrom('');
    setDateTo('');
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const updateSelectedIds = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAllPage = () => {
    if (allPageSelected) {
      updateSelectedIds(selectedIds.filter((id) => !paginatedUsers.some((user) => user.id === id)));
      return;
    }

    const pageIds = paginatedUsers.map((user) => user.id);
    updateSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
  };

  const handleExportCsv = async () => {
    const { adminService } = await import('../services/admin.service');
    const { default: toast } = await import('react-hot-toast');
    
    // Fetch all users matching current filters by setting a huge limit
    toast.loading('Preparing export...', { id: 'export-toast' });
    const response = await adminService.getUsers({
      page: 1,
      limit: 100000,
      query: query || undefined,
      role: selectedRole === 'All Roles' ? undefined : selectedRole,
      status: selectedStatus === 'All' ? undefined : selectedStatus,
      department: selectedDepartment === 'All Departments' ? undefined : selectedDepartment,
    });
    
    if (response.ok) {
      exportCsv(response.data.users as UserRow[]);
      toast.success('Export downloaded!', { id: 'export-toast' });
    } else {
      toast.error('Export failed', { id: 'export-toast' });
    }
  };

  const exportCsv = (rows: UserRow[]) => {
    const header = ['Name', 'Email', 'Student ID', 'Role', 'Department', 'Batch/Year', 'Status', 'Last Login', 'Phone'];
    const body = rows.map((user) => [
      user.name,
      user.email,
      user.studentId,
      user.role,
      user.department,
      user.batch,
      user.status,
      user.lastLogin,
      user.phone,
    ]);

    const csv = [header, ...body]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astu-users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openAddModal = () => {
    setEditingUserId(null);
    setForm(createDefaultForm());
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (user: UserRow) => {
    setEditingUserId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      autoGeneratePassword: true,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      phone: user.phone,
      status: user.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!form.name.trim()) errors.name = 'Full name is required.';
    if (!form.email.trim()) errors.email = 'Email is required.';
    if (!form.autoGeneratePassword && !form.password.trim()) errors.password = 'Password is required.';
    if (form.role === 'Alumni' && !form.studentId.trim()) errors.studentId = 'Student ID is required for alumni.';
    if (!form.department.trim()) errors.department = 'Department is required.';
    if (!form.phone.trim()) errors.phone = 'Phone number is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveUser = async () => {
    if (!validateForm()) return;

    const { adminService } = await import('../services/admin.service');
    const { default: toast } = await import('react-hot-toast');

    if (editingUserId) {
      // Determine the appropriate API action based on the selected status
      let apiAction: 'activate' | 'suspend' | 'verify' | null = null;
      
      if (form.status === 'Active') {
        apiAction = 'activate';
      } else if (form.status === 'Suspended') {
        apiAction = 'suspend';
      } else if (form.status === 'Pending Verification') {
        // No change needed — user stays pending
        apiAction = null;
      } else if (form.status === 'Inactive') {
        apiAction = 'suspend'; // Map "Inactive" to suspend on the backend
      }

      if (apiAction) {
        const result = await adminService.updateUserStatus(editingUserId, apiAction);
        if (result.ok) {
          toast.success('User updated successfully');
        } else {
          toast.error(result.message || 'Failed to update user');
          return;
        }
      }
    } else {
      // For new user creation
      const password = form.autoGeneratePassword ? generatePassword() : form.password.trim();
      const result = await adminService.createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        department: form.department,
        studentId: form.role === 'Alumni' ? form.studentId.trim() : undefined,
        phone: form.phone.trim(),
        password: password
      });
      
      if (result.ok) {
        toast.success('User created successfully');
      } else {
        toast.error(result.message || 'Failed to create user');
        return;
      }
    }

    setModalOpen(false);
    setEditingUserId(null);
    await fetchUsers(); // Refresh from the database
  };

  const bulkAction = async (action: 'activate' | 'suspend' | 'delete' | 'export') => {
    const selected = users.filter((user) => selectedIds.includes(user.id));

    if (action === 'export') {
      await handleExportCsv();
      return;
    }

    const { adminService } = await import('../services/admin.service');
    const { default: toast } = await import('react-hot-toast');
    
    setLoading(true);
    let result;
    
    if (action === 'delete') {
      // For now we'll do delete sequentially or wait for backend support, wait, delete is single user only in our backend. Let's do it sequentially:
      for (const id of selectedIds) {
        await adminService.deleteUser(id);
      }
      toast.success('Deleted selected users');
    } else {
      const apiAction = action === 'activate' ? 'verify' : 'suspend'; // verify handles both active and verification
      result = await adminService.bulkUpdateStatus(selectedIds, apiAction);
      if (result.ok) {
        toast.success(`Successfully updated ${selectedIds.length} users`);
      } else {
        toast.error(result.message || 'Failed to update users');
      }
    }
    
    updateSelectedIds([]);
    await fetchUsers();
  };

  const handleRowAction = async (user: UserRow, action: string) => {
    const { adminService } = await import('../services/admin.service');
    const { default: toast } = await import('react-hot-toast');
    
    if (action === 'Suspend') {
      const result = await adminService.updateUserStatus(user.id, 'suspend');
      if (result.ok) { toast.success('User suspended'); fetchUsers(); }
      else toast.error(result.message || 'Error suspending user');
    } else if (action === 'Delete') {
      const result = await adminService.deleteUser(user.id);
      if (result.ok) { toast.success('User deleted'); fetchUsers(); }
      else toast.error(result.message || 'Error deleting user');
    }
  };

  const rowActions = [
    { label: 'View Profile', icon: Eye, onClick: (user: UserRow) => setActiveUser(user) },
    { label: 'Edit', icon: PencilLine, onClick: openEditModal },
    { label: 'Reset Password', icon: KeyRound, onClick: () => {} },
    { label: 'Change Role', icon: Shield, onClick: () => {} },
    { label: 'Suspend', icon: UserRound, onClick: (user: UserRow) => handleRowAction(user, 'Suspend') },
    { label: 'Delete', icon: Trash2, onClick: (user: UserRow) => handleRowAction(user, 'Delete') },
  ];

  const hasActiveFilters = query || selectedRole !== 'All Roles' || selectedStatus !== 'All' || selectedDepartment !== 'All Departments' || dateFrom || dateTo;
  const activeFilterCount = [(query ? 1 : 0), selectedRole !== 'All Roles' ? 1 : 0, selectedStatus !== 'All' ? 1 : 0, selectedDepartment !== 'All Departments' ? 1 : 0, dateFrom ? 1 : 0, dateTo ? 1 : 0].reduce((a, b) => a + b, 0);
  const statsLine = `${totalUsersLabel} — ${activeCount.toLocaleString()} Active · ${pendingCount} Pending · ${suspendedCount} Suspended · ${inactiveCount} Inactive`;
  const summaryCards = [
    {
      label: 'Total Users',
      value: totalUsersLabel.replace(' users', ''),
      meta: '+12% this month',
      icon: Users,
      accent: '#003366',
      cardAccent: 'border-t-[#003366]',
      gradient: 'from-[#003366]/10 to-[#003366]/5',
    },
    {
      label: 'Active',
      value: activeCount.toLocaleString(),
      meta: '95.5%',
      icon: Check,
      accent: '#22C55E',
      cardAccent: 'border-t-[#22C55E]',
      gradient: 'from-[#22C55E]/10 to-[#22C55E]/5',
    },
    {
      label: 'Suspended',
      value: suspendedCount.toLocaleString(),
      meta: '-2% this week',
      icon: Shield,
      accent: '#DC2626',
      cardAccent: 'border-t-[#DC2626]',
      gradient: 'from-[#DC2626]/10 to-[#DC2626]/5',
    },
    {
      label: 'Pending',
      value: pendingCount.toLocaleString(),
      meta: 'Review',
      icon: Clock3,
      accent: '#F97316',
      cardAccent: 'border-t-[#F97316]',
      gradient: 'from-[#F97316]/10 to-[#F97316]/5',
    },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
      <AdminPageHeader
        title="User Management"
        subtitle="Manage all system accounts, roles, and access permissions"
        breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }]}
        actions={
          <>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </>
        }
      />

      <div className="rounded-[8px] border border-[#CFE3B5] border-l-[3px] border-l-[#1D9E75] bg-[#EAF3DE] px-4 py-2.5 text-[13px] text-[#24402B]">
        Last CSV import: 245 records · January 15, 2025 · by Registrar Office{' '}
        <button type="button" className="font-semibold text-[#1D9E75] hover:underline">
          View Import History →
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className={`group admin-card relative overflow-hidden rounded-[12px] border border-slate-200 border-t-[3px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] dark:bg-[var(--bg-card)] ${card.cardAccent}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.gradient} opacity-80`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">{card.label}</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{card.value}</span>
                    <span className="pb-1 text-sm font-semibold" style={{ color: card.accent }}>
                      {card.meta}
                    </span>
                  </div>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: `${card.accent}14`, color: card.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="admin-card rounded-[10px] border border-slate-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="grid gap-3 xl:grid-cols-12">
          <label className={`flex items-center gap-2 rounded-[8px] border px-3 py-2 text-sm ${searchFocused ? 'border-[#003580]/35 ring-2 ring-[#003580]/10' : 'border-slate-200'} xl:col-span-4`}>
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by name, email, or student ID..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as Role | 'All Roles')} className="w-full bg-transparent outline-none">
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as Status | 'All')} className="w-full bg-transparent outline-none">
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} className="w-full bg-transparent outline-none">
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-1">
            <User className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full bg-transparent outline-none"
              aria-label="Registered between start date"
            />
          </div>

          <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-1">
            <span className="text-xs font-medium text-slate-500">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full bg-transparent outline-none"
              aria-label="Registered between end date"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                <XCircle className="h-3 w-3" />
                Clear All {activeFilterCount > 1 ? `(${activeFilterCount})` : ''}
              </button>
            )}
            {query && <span className="inline-flex items-center gap-1 rounded-md bg-[#003580]/10 px-2.5 py-1.5 text-xs font-semibold text-[#003580]">Search: "{query}" <button onClick={() => setQuery('')}><X className="h-3 w-3" /></button></span>}
            {selectedRole !== 'All Roles' && <span className="inline-flex items-center gap-1 rounded-md bg-[#003580]/10 px-2.5 py-1.5 text-xs font-semibold text-[#003580]">{selectedRole} <button onClick={() => setSelectedRole('All Roles')}><X className="h-3 w-3" /></button></span>}
            {selectedStatus !== 'All' && <span className="inline-flex items-center gap-1 rounded-md bg-[#003580]/10 px-2.5 py-1.5 text-xs font-semibold text-[#003580]">{selectedStatus} <button onClick={() => setSelectedStatus('All')}><X className="h-3 w-3" /></button></span>}
            {selectedDepartment !== 'All Departments' && <span className="inline-flex items-center gap-1 rounded-md bg-[#003580]/10 px-2.5 py-1.5 text-xs font-semibold text-[#003580]">{selectedDepartment} <button onClick={() => setSelectedDepartment('All Departments')}><X className="h-3 w-3" /></button></span>}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Registered between</span>
            <AdminBadge variant="neutral">Date Range</AdminBadge>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-600">{statsLine}</div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-700">{(page - 1) * pageSize + 1}</span> to{' '}
          <span className="font-medium text-slate-700">{Math.min(page * pageSize, totalCount)}</span> of{' '}
          <span className="font-medium text-slate-700">{totalCount}</span> users
        </div>
      </div>

      {selectedIds.length > 0 && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#003580]/15 bg-[#003580]/5 p-4">
          <div className="text-sm font-medium text-[#003580]">{selectedIds.length} selected</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => bulkAction('activate')} className="rounded-[8px] bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white">
              Activate Selected
            </button>
            <button type="button" onClick={() => bulkAction('suspend')} className="rounded-[8px] bg-[#E8A020] px-4 py-2 text-sm font-semibold text-white">
              Suspend Selected
            </button>
            <button type="button" onClick={() => bulkAction('export')} className="rounded-[8px] border border-[#003580]/20 px-4 py-2 text-sm font-semibold text-[#003580]">
              Export Selected
            </button>
            <button type="button" onClick={() => bulkAction('delete')} className="rounded-[8px] border border-[#E24B4A]/20 px-4 py-2 text-sm font-semibold text-[#E24B4A]">
              Delete Selected
            </button>
          </div>
        </section>
      )}

      <section className="admin-card overflow-hidden rounded-[10px] border shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-12 border-b border-slate-200 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={selectAllPage}
                    className="h-4 w-4 rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                    aria-label="Select all rows on page"
                  />
                </th>
                {[
                  { key: 'name', label: 'User', sortable: true, width: 'min-w-[280px]' },
                  { key: 'studentId', label: 'Student ID', sortable: true },
                  { key: 'role', label: 'Role', sortable: true },
                  { key: 'department', label: 'Department', sortable: true },
                  { key: 'batch', label: 'Batch / Year', sortable: true },
                  { key: 'status', label: 'Status', sortable: true },
                  { key: 'lastLogin', label: 'Last Login', sortable: true },
                  { key: 'actions', label: 'Actions', sortable: false },
                ].map((column) => (
                  <th
                    key={column.key}
                    className={`border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 ${column.width ?? ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => column.sortable && toggleSort(column.key as SortKey)}
                      className="inline-flex items-center gap-1.5"
                      disabled={!column.sortable}
                    >
                      {column.label}
                      {column.sortable && <ArrowDownUp className="h-3.5 w-3.5" />}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-700">No users found</p>
                        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">Try adjusting your search or filter criteria to find what you are looking for.</p>
                      </div>
                      <button type="button" onClick={resetFilters} className="mt-2 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 transition-all">
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`cursor-pointer border-b border-slate-100 transition-all hover:bg-slate-50/80 ${
                    activeUser?.id === user.id ? 'bg-[#003580]/5 shadow-inner' : ''
                  }`}
                  onClick={() => setActiveUser(user)}
                >
                  <td className="px-4 py-4 align-top">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={(event) => {
                        event.stopPropagation();
                        toggleRow(user.id);
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="h-4 w-4 rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                      aria-label={`Select ${user.name}`}
                    />
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003580]/10 text-sm font-semibold text-[#003580]">
                        {initials(user.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top text-slate-600">{user.studentId || 'N/A'}</td>
                  <td className="px-4 py-4 align-top">
                    <AdminBadge variant={roleTone[user.role]} className={roleColorClass[user.role]}>
                      {user.role}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-600">{user.department}</td>
                  <td className="px-4 py-4 align-top text-slate-600">{user.batch}</td>
                  <td className="px-4 py-4 align-top">
                    <AdminBadge variant={statusTone[user.status]} className={statusColorClass[user.status]}>
                      {user.status}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-600">{formatRelative(user.lastLogin)}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="relative" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setMenuUserId((current) => (current === user.id ? null : user.id))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100"
                        aria-label={`Open actions for ${user.name}`}
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </button>

                      {menuUserId === user.id && (
                        <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                          {rowActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.label}
                                type="button"
                                onClick={() => {
                                  setMenuUserId(null);
                                  if (action.label === 'Edit') {
                                    openEditModal(user);
                                    return;
                                  }
                                  if (action.label === 'View Profile') {
                                    setActiveUser(user);
                                  }
                                }}
                                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                                  action.label === 'Delete'
                                    ? 'text-[#E24B4A] hover:bg-rose-50'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginatedUsers.length} of {totalCount} filtered users
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <div className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
              Page {page} of {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editingUserId ? 'Edit User' : 'Add User'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveUser}
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Submit
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" error={formErrors.name}>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
          </Field>
          <Field label="Email" error={formErrors.email}>
            <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
          </Field>
          <Field label="Password" error={formErrors.password}>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.autoGeneratePassword}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        autoGeneratePassword: event.target.checked,
                        password: event.target.checked ? generatePassword() : '',
                      }))
                    }
                  />
                  Auto-generate password
                </label>
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, password: generatePassword(), autoGeneratePassword: true }))}
                  className="text-xs font-semibold text-[#003580] hover:underline"
                >
                  Generate
                </button>
              </div>
              <input
                value={form.password}
                disabled={form.autoGeneratePassword}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder={form.autoGeneratePassword ? 'Auto-generated password' : 'Enter password'}
                className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580] disabled:bg-slate-50"
              />
            </div>
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as Role }))} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]">
              {roles.filter((role): role is Role => role !== 'All Roles').map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </Field>
          <Field label="Department" error={formErrors.department}>
            <input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
          </Field>
          <Field label="Student ID" error={formErrors.studentId}>
            <input value={form.studentId} onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))} placeholder="Required for alumni" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
          </Field>
          <Field label="Phone" error={formErrors.phone}>
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
          </Field>
          <Field label="Account status">
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Status }))} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]">
              {statuses.filter((status): status is Status => status !== 'All').map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </Field>
        </div>
      </AdminModal>

      {activeUser && (
        <aside className="admin-card fixed right-0 top-16 z-10 h-[calc(100vh-4rem)] w-[380px] overflow-y-auto border-l border-slate-200 p-5 shadow-[-8px_0_32px_rgba(0,0,0,0.06)] slide-in-right">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#1D9E75] text-sm font-semibold text-white shadow-md">
                  {initials(activeUser.name)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${activeUser.status === 'Active' ? 'bg-emerald-400' : activeUser.status === 'Suspended' ? 'bg-rose-400' : 'bg-slate-400'}`} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{activeUser.name}</h3>
                <p className="text-xs text-slate-500">{activeUser.email}</p>
              </div>
            </div>
            <button type="button" onClick={() => setActiveUser(null)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2">
            <AdminBadge variant={roleTone[activeUser.role]} className={roleColorClass[activeUser.role]}>
              {activeUser.role}
            </AdminBadge>
          </div>

          <div className="mt-6 space-y-4">
            <KeyValue label="Student ID" value={activeUser.studentId || 'N/A'} />
            <KeyValue label="Department" value={activeUser.department} />
            <KeyValue label="Batch / Year" value={activeUser.batch} />
            <KeyValue label="Status" value={activeUser.status} />
            <KeyValue label="Phone" value={activeUser.phone} />
            <KeyValue label="Registered" value={formatRelative(activeUser.registeredAt)} />
            <KeyValue label="Last Login" value={formatRelative(activeUser.lastLogin)} />
          </div>

          <div className="mt-6 rounded-[10px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#003580]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Admin Notes</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{activeUser.adminNotes || 'No notes available for this user.'}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { setActiveUser(null); openEditModal(activeUser); }} className="rounded-[8px] bg-[#003580] px-3 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm">
              <PencilLine className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
              Edit User
            </button>
            <button type="button" className="rounded-[8px] border border-rose-200 bg-rose-50/50 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all">
              <UserRound className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
              Suspend
            </button>
            <button type="button" className="rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <KeyRound className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
              Reset Password
            </button>
            <button type="button" className="rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <Shield className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
              Change Role
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
      {error && <span className="block text-xs text-[#E24B4A]">{error}</span>}
    </label>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <span className="max-w-[55%] text-right text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}
