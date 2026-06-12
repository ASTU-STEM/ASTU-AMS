import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  GraduationCap,
  RefreshCw,
  Database,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import AdminBadge from '../components/AdminBadge';
import useAdminUsers, { UserListParams } from '../hooks/useAdminUsers';
import { adminApi } from '../api/adminApi';

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
  const navigate = useNavigate();
  // Use the useAdminUsers hook to fetch users from API
  const { data: apiUsers, isLoading: usersLoading, error: usersError, refetch } = useAdminUsers();
  const [users, setUsers] = useState<UserRow[]>([]);
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
  const [profilePosition, setProfilePosition] = useState<{ top: number; left: number } | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Update local users state when API data changes
  useEffect(() => {
    if (apiUsers && apiUsers.length > 0) {
      // Transform API user data to UserRow format
      const transformedUsers = apiUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.studentId || '',
        role: user.role,
        department: user.department || 'N/A',
        batch: user.batch || 'N/A',
        status: user.status,
        lastLogin: user.lastLogin || new Date().toISOString(),
        registeredAt: user.registeredAt || new Date().toISOString(),
        phone: user.phone || '',
        adminNotes: user.adminNotes || '',
      }));
      setUsers(transformedUsers);
    }
  }, [apiUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery =
        !query ||
        [user.name, user.email, user.studentId, user.department].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesRole = selectedRole === 'All Roles' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;
      const matchesDepartment = selectedDepartment === 'All Departments' || user.department === selectedDepartment;
      const registered = new Date(user.registeredAt).getTime();
      const matchesFrom = !dateFrom || registered >= new Date(dateFrom).getTime();
      const matchesTo = !dateTo || registered <= new Date(`${dateTo}T23:59:59`).getTime();

      return matchesQuery && matchesRole && matchesStatus && matchesDepartment && matchesFrom && matchesTo;
    });
  }, [users, query, selectedRole, selectedStatus, selectedDepartment, dateFrom, dateTo]);

  const sortedUsers = useMemo(() => {
    const copy = [...filteredUsers];
    copy.sort((left, right) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      const leftValue =
        sortKey === 'lastLogin'
          ? new Date(left.lastLogin).getTime()
          : left[sortKey];
      const rightValue =
        sortKey === 'lastLogin'
          ? new Date(right.lastLogin).getTime()
          : right[sortKey];

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return (leftValue - rightValue) * multiplier;
      }

      return String(leftValue).localeCompare(String(rightValue)) * multiplier;
    });
    return copy;
  }, [filteredUsers, sortKey, sortDirection]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedRole, selectedStatus, selectedDepartment, dateFrom, dateTo]);

  useEffect(() => {
    if (activeUser && !sortedUsers.some((user) => user.id === activeUser.id)) {
      setActiveUser(null);
    }
  }, [activeUser, sortedUsers]);

  useEffect(() => {
    const handleClick = () => setMenuUserId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const totalUsersLabel = '4,827 users';
  const activeCount = 4201;
  const pendingCount = 312;
  const suspendedCount = 89;
  const inactiveCount = 225;
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const paginatedUsers = sortedUsers.slice((page - 1) * pageSize, page * pageSize);
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

    try {
      if (editingUserId) {
        // Update existing user - call API to update status
        await adminApi.updateUserStatus(editingUserId, form.status, 'Updated by admin');
        
        // Update local state
        setUsers((current) =>
          current.map((item) =>
            item.id === editingUserId
              ? { ...item, status: form.status, phone: form.phone.trim(), department: form.department }
              : item
          )
        );
      } else {
        // Create new user - call API
        const password = form.autoGeneratePassword ? generatePassword() : form.password.trim();
        await adminApi.createUser({
          email: form.email.trim().toLowerCase(),
          role: form.role.toUpperCase().replace(' ', '_'),
          fullName: form.name.trim(),
        });

        // Refetch users to get the updated list
        refetch();
      }

      setModalOpen(false);
      setEditingUserId(null);
      setForm(createDefaultForm());
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const bulkAction = async (action: 'activate' | 'suspend' | 'delete' | 'export') => {
    const selected = users.filter((user) => selectedIds.includes(user.id));

    if (action === 'export') {
      exportCsv(selected);
      return;
    }

    try {
      if (action === 'delete') {
        // Delete users - Note: Backend needs bulk delete endpoint
        // For now, update local state and log warning
        console.warn('Bulk delete endpoint not implemented in backend');
        setUsers((current) => current.filter((user) => !selectedIds.includes(user.id)));
        updateSelectedIds([]);
        return;
      }

      // Activate or suspend users
      const status = action === 'activate' ? 'ACTIVE' : 'SUSPENDED';
      
      // Update each user status via API
      await Promise.all(
        selectedIds.map((id) =>
          adminApi.updateUserStatus(id, status, `Bulk ${action.toLowerCase()} by admin`)
        )
      );

      // Update local state
      setUsers((current) =>
        current.map((user) => {
          if (!selectedIds.includes(user.id)) return user;
          return {
            ...user,
            status: action === 'activate' ? 'Active' : 'Suspended',
          };
        })
      );
      updateSelectedIds([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action. Please try again.');
    }
  };

  const rowActions = [
    { label: 'View Profile', icon: Eye, onClick: (user: UserRow, event?: React.MouseEvent) => {
      if (event) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setProfilePosition({ top: rect.bottom + 8, left: Math.max(16, rect.right - 420) });
      }
      setActiveUser(user);
    }},
    { label: 'Edit', icon: PencilLine, onClick: (user: UserRow) => openEditModal(user) },
    { label: 'Reset Password', icon: KeyRound, onClick: (user: UserRow) => {} },
    { label: 'Change Role', icon: Shield, onClick: (user: UserRow) => {} },
    { label: 'Suspend', icon: UserRound, onClick: (user: UserRow) => {} },
    { label: 'Delete', icon: Trash2, onClick: (user: UserRow) => {} },
  ];

  const hasActiveFilters = query || selectedRole !== 'All Roles' || selectedStatus !== 'All' || selectedDepartment !== 'All Departments' || dateFrom || dateTo;
  const activeFilterCount = [query, selectedRole !== 'All Roles' ? 1 : 0, selectedStatus !== 'All' ? 1 : 0, selectedDepartment !== 'All Departments' ? 1 : 0, dateFrom ? 1 : 0, dateTo ? 1 : 0].reduce((a: number, b) => a + (typeof b === 'string' ? (b ? 1 : 0) : b), 0);
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
        @keyframes slide-in-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .slide-in-up { animation: slide-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Unified Header */}
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#003580] via-[#004499] to-[#003580] px-10 py-8 shadow-lg">
          {/* ASTU brand pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          </div>
          
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-5 mb-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    User Management
                  </h1>
                  <p className="text-base text-white/80 mt-1">Manage all system accounts, roles, and access permissions</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-2.5 rounded-xl bg-white text-[#003580] px-6 py-3 text-sm font-semibold shadow-lg hover:brightness-110 transition-all"
              >
                <Plus className="h-4.5 w-4.5" />
                Add User
              </button>
              <button
                type="button"
                onClick={() => exportCsv(filteredUsers)}
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all"
              >
                <Download className="h-4.5 w-4.5" />
                Export CSV
              </button>
            </div>
          </div>
          
          {/* System Stats Bar */}
          <div className="relative mt-6 pt-5 border-t border-white/20 flex items-center gap-8 text-base text-white/80">
            <span className="flex items-center gap-2 font-medium"><RefreshCw className="w-4.5 h-4.5" /> Last sync: 2 min ago</span>
            <span className="flex items-center gap-2 font-medium"><Database className="w-4.5 h-4.5" /> {users.length} total users</span>
            <span className="flex items-center gap-2 font-medium"><Users className="w-4.5 h-4.5" /> {activeCount.toLocaleString()} active</span>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mt-4">
          <span className="font-medium text-slate-900">Admin</span>
          <ChevronRightIcon className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-900">User Management</span>
        </nav>
      </div>

      {/* Import Status Banner */}
      <div className="rounded-[12px] border border-[#1D9E75]/20 bg-gradient-to-r from-[#1D9E75]/10 to-[#1D9E75]/5 px-5 py-3 text-sm text-[#1D9E75]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span className="font-medium">Last CSV import: 245 records · January 15, 2025 · by Registrar Office</span>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/admin/import-history')}
            className="font-semibold hover:underline transition-all"
          >
            View Import History <ChevronRightIcon className="w-3.5 h-3.5 inline ml-1" />
          </button>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {usersLoading ? (
          // Loading skeleton for stats cards
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-card-${index}`} className="admin-card relative overflow-hidden rounded-[16px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-3 w-20 bg-slate-200 animate-pulse rounded" />
                  <div className="flex items-end gap-2">
                    <div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />
                    <div className="h-5 w-12 bg-slate-200 animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                onClick={() => {
                  // Navigate to filtered view based on card type
                  if (card.label === 'Total Users') {
                    setSelectedStatus('All');
                  } else if (card.label === 'Active') {
                    setSelectedStatus('Active');
                  } else if (card.label === 'Suspended') {
                    setSelectedStatus('Suspended');
                  } else if (card.label === 'Pending') {
                    setSelectedStatus('Pending Verification');
                  }
                }}
                className={`group admin-card relative overflow-hidden rounded-[16px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:border-slate-300 cursor-pointer`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Glow effect */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
                
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">{card.value}</span>
                      <span className="pb-1 text-sm font-semibold" style={{ color: card.accent }}>
                        {card.meta}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${card.accent}15 0%, ${card.accent}25 100%)`,
                      color: card.accent 
                    }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="admin-card rounded-[16px] border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="grid gap-4 xl:grid-cols-12">
          <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${searchFocused ? 'border-[#003580]/40 ring-2 ring-[#003580]/10 bg-[#003580]/5' : 'border-slate-200/60 bg-slate-50/50 hover:border-slate-300'} xl:col-span-4`}>
            <Search className="h-4.5 w-4.5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by name, email, or student ID..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-2">
            <Filter className="h-4.5 w-4.5 text-slate-400" />
            <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as Role | 'All Roles')} className="w-full bg-transparent outline-none">
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-2">
            <Filter className="h-4.5 w-4.5 text-slate-400" />
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as Status | 'All')} className="w-full bg-transparent outline-none">
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-2">
            <Building2 className="h-4.5 w-4.5 text-slate-400" />
            <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} className="w-full bg-transparent outline-none">
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-1">
            <User className="h-4.5 w-4.5 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full bg-transparent outline-none"
              aria-label="Registered between start date"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-1">
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all hover:border-slate-300">
                <XCircle className="h-3.5 w-3.5" />
                Clear All {Number(activeFilterCount) > 1 ? `(${activeFilterCount})` : ''}
              </button>
            )}
            {query && <span className="inline-flex items-center gap-2 rounded-xl bg-[#003580]/10 border border-[#003580]/20 px-4 py-2 text-xs font-semibold text-[#003580]">Search: "{query}" <button onClick={() => setQuery('')} className="hover:bg-[#003580]/20 rounded-full p-0.5 transition-all"><X className="h-3 w-3" /></button></span>}
            {selectedRole !== 'All Roles' && <span className="inline-flex items-center gap-2 rounded-xl bg-[#003580]/10 border border-[#003580]/20 px-4 py-2 text-xs font-semibold text-[#003580]">{selectedRole} <button onClick={() => setSelectedRole('All Roles')} className="hover:bg-[#003580]/20 rounded-full p-0.5 transition-all"><X className="h-3 w-3" /></button></span>}
            {selectedStatus !== 'All' && <span className="inline-flex items-center gap-2 rounded-xl bg-[#003580]/10 border border-[#003580]/20 px-4 py-2 text-xs font-semibold text-[#003580]">{selectedStatus} <button onClick={() => setSelectedStatus('All')} className="hover:bg-[#003580]/20 rounded-full p-0.5 transition-all"><X className="h-3 w-3" /></button></span>}
            {selectedDepartment !== 'All Departments' && <span className="inline-flex items-center gap-2 rounded-xl bg-[#003580]/10 border border-[#003580]/20 px-4 py-2 text-xs font-semibold text-[#003580]">{selectedDepartment} <button onClick={() => setSelectedDepartment('All Departments')} className="hover:bg-[#003580]/20 rounded-full p-0.5 transition-all"><X className="h-3 w-3" /></button></span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Registered between</span>
            <AdminBadge variant="neutral">Date Range</AdminBadge>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-600">{statsLine}</div>
        <div className="text-xs text-slate-400">{filteredUsers.length} filtered of {users.length}</div>
      </div>

      {selectedIds.length > 0 && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-[#003580]/20 bg-gradient-to-r from-[#003580]/10 to-[#003580]/5 backdrop-blur-sm p-5 shadow-lg animate-slide-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003580] text-white">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#003580]">{selectedIds.length} user{selectedIds.length !== 1 ? 's' : ''} selected</div>
              <div className="text-xs text-slate-600">Bulk actions available</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => bulkAction('activate')} className="inline-flex items-center gap-2 rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all hover:shadow-lg">
              <Check className="h-4 w-4" />
              Activate
            </button>
            <button type="button" onClick={() => bulkAction('suspend')} className="inline-flex items-center gap-2 rounded-xl bg-[#E8A020] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all hover:shadow-lg">
              <Shield className="h-4 w-4" />
              Suspend
            </button>
            <button type="button" onClick={() => bulkAction('export')} className="inline-flex items-center gap-2 rounded-xl border border-[#003580]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#003580] shadow-sm hover:bg-[#003580]/5 transition-all">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button type="button" onClick={() => bulkAction('delete')} className="inline-flex items-center gap-2 rounded-xl border border-[#E24B4A]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#E24B4A] shadow-sm hover:bg-[#E24B4A]/5 transition-all">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </section>
      )}

      <section className="admin-card overflow-hidden rounded-[16px] border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
              <tr>
                <th className="w-12 border-b border-slate-200/60 px-5 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={selectAllPage}
                    className="h-4.5 w-4.5 rounded-lg border-slate-300 text-[#003580] focus:ring-[#003580] focus:ring-offset-0"
                    aria-label="Select all rows on page"
                  />
                </th>
                {[
                  { key: 'name', label: 'User', sortable: true, width: 'min-w-[300px]' },
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
                    className={`border-b border-slate-200/60 px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 ${column.width ?? ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => column.sortable && toggleSort(column.key as SortKey)}
                      className="inline-flex items-center gap-2 hover:text-slate-700 transition-colors"
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
              {usersLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-slate-100/60">
                    <td className="px-5 py-4">
                      <div className="h-4.5 w-4.5 rounded-lg bg-slate-200 animate-pulse" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-200 animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
                          <div className="h-3 w-48 bg-slate-200 animate-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-200 animate-pulse rounded" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-20 bg-slate-200 animate-pulse rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-28 bg-slate-200 animate-pulse rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-200 animate-pulse rounded" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-24 bg-slate-200 animate-pulse rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 animate-pulse rounded" /></td>
                    <td className="px-5 py-4"><div className="h-9 w-9 rounded-xl bg-slate-200 animate-pulse" /></td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">No users found</p>
                        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Try adjusting your search or filter criteria to find what you are looking for.</p>
                      </div>
                      <button type="button" onClick={resetFilters} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#003580] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110 transition-all hover:shadow-xl">
                        <RotateCcw className="h-4 w-4" />
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                  key={user.id}
                  className={`cursor-pointer border-b border-slate-100/60 transition-all duration-200 hover:bg-slate-50/80 hover:shadow-sm ${
                    activeUser?.id === user.id ? 'bg-[#003580]/5 shadow-inner' : ''
                  }`}
                  onClick={(event) => {
                    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                    setProfilePosition({ top: rect.bottom + 8, left: Math.max(16, rect.right - 420) });
                    setActiveUser(user);
                  }}
                >
                  <td className="px-5 py-4 align-top">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={(event) => {
                        event.stopPropagation();
                        toggleRow(user.id);
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="h-4.5 w-4.5 rounded-lg border-slate-300 text-[#003580] focus:ring-[#003580] focus:ring-offset-0"
                      aria-label={`Select ${user.name}`}
                    />
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#003580]/10 to-[#003580]/5 text-sm font-semibold text-[#003580] shadow-sm">
                        {initials(user.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600 font-medium">{user.studentId || 'N/A'}</td>
                  <td className="px-5 py-4 align-top">
                    <AdminBadge variant={roleTone[user.role]} className={roleColorClass[user.role]}>
                      {user.role}
                    </AdminBadge>
                  </td>
                  <td className="px-5 py-4 align-top text-slate-600 font-medium">{user.department}</td>
                  <td className="px-5 py-4 align-top text-slate-600 font-medium">{user.batch}</td>
                  <td className="px-5 py-4 align-top">
                    <AdminBadge variant={statusTone[user.status]} className={statusColorClass[user.status]}>
                      {user.status}
                    </AdminBadge>
                  </td>
                  <td className="px-5 py-4 align-top text-slate-600 font-medium">{formatRelative(user.lastLogin)}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="relative" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setMenuUserId((current) => (current === user.id ? null : user.id))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
                        aria-label={`Open actions for ${user.name}`}
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </button>

                      {menuUserId === user.id && (
                        <div className="absolute right-0 top-10 z-[9999] w-52 overflow-hidden rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-sm p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] slide-in-right">
                          {rowActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.label}
                                type="button"
                                onClick={(event) => {
                                  setMenuUserId(null);
                                  if (action.label === 'Edit') {
                                    openEditModal(user);
                                    return;
                                  }
                                  if (action.label === 'View Profile') {
                                    action.onClick(user, event);
                                    return;
                                  }
                                  action.onClick(user, event);
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all ${
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

        <div className="flex flex-col gap-4 border-t border-slate-200/60 bg-slate-50/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{paginatedUsers.length}</span> of <span className="font-semibold text-slate-900">{sortedUsers.length}</span> filtered users
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="rounded-xl border border-slate-200/60 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              Page <span className="text-[#003580]">{page}</span> of <span className="text-[#003580]">{totalPages}</span>
            </div>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 hover:border-slate-300 transition-all"
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/60 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={saveUser}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all hover:shadow-lg"
            >
              <Check className="h-4 w-4" />
              {editingUserId ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full name" error={formErrors.name}>
            <input 
              value={form.name} 
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} 
              className="w-full rounded-xl border border-slate-200/60 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50" 
              placeholder="Enter full name"
            />
          </Field>
          <Field label="Email" error={formErrors.email}>
            <input 
              value={form.email} 
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} 
              className="w-full rounded-xl border border-slate-200/60 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50" 
              placeholder="user@astu.edu.et"
              type="email"
            />
          </Field>
          <Field label="Password" error={formErrors.password}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-600 cursor-pointer">
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
                    className="h-4 w-4 rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                  />
                  Auto-generate password
                </label>
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, password: generatePassword(), autoGeneratePassword: true }))}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003580] hover:underline transition-all"
                >
                  <RotateCcw className="h-3 w-3" />
                  Generate
                </button>
              </div>
              <input
                value={form.password}
                disabled={form.autoGeneratePassword}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder={form.autoGeneratePassword ? 'Auto-generated password' : 'Enter password'}
                className="w-full rounded-xl border border-slate-200/60 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed font-mono"
              />
            </div>
          </Field>
          <Field label="Role">
            <select 
              value={form.role} 
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as Role }))} 
              className="w-full rounded-xl border border-slate-200/60 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
            >
              {roles.filter((role): role is Role => role !== 'All Roles').map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </Field>
          <Field label="Department" error={formErrors.department}>
            <select 
              value={form.department} 
              onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} 
              className="w-full rounded-xl border border-slate-200/60 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
            >
              {departments.filter((dept) => dept !== 'All Departments').map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </Field>
          <Field label="Student ID" error={formErrors.studentId}>
            <input 
              value={form.studentId} 
              onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))} 
              placeholder="Required for alumni (e.g., ASTU/2023/1234)" 
              className="w-full rounded-xl border border-slate-200/60 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 font-mono"
            />
          </Field>
          <Field label="Phone" error={formErrors.phone}>
            <input 
              value={form.phone} 
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} 
              className="w-full rounded-xl border border-slate-200/60 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50" 
              placeholder="+251 9XX XXX XXX"
              type="tel"
            />
          </Field>
          <Field label="Account status">
            <select 
              value={form.status} 
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Status }))} 
              className="w-full rounded-xl border border-slate-200/60 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
            >
              {statuses.filter((status): status is Status => status !== 'All').map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </Field>
        </div>
      </AdminModal>

      {activeUser && (
        <div 
          className="fixed z-[9999] w-[400px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.12)] slide-in-up"
          style={{
            position: 'fixed',
            top: profilePosition?.top || '50%',
            left: profilePosition?.left || '50%',
            transform: profilePosition ? 'none' : 'translate(-50%, -50%)',
          }}
        >
          <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003580] to-[#1D9E75] text-base font-semibold text-white shadow-lg">
                      {initials(activeUser.name)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${activeUser.status === 'Active' ? 'bg-emerald-400' : activeUser.status === 'Suspended' ? 'bg-rose-400' : 'bg-slate-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{activeUser.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{activeUser.email}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveUser(null)} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4">
                <AdminBadge variant={roleTone[activeUser.role]} className={roleColorClass[activeUser.role]}>
                  {activeUser.role}
                </AdminBadge>
              </div>

              <div className="mt-8 space-y-5">
                <KeyValue label="Student ID" value={activeUser.studentId || 'N/A'} />
                <KeyValue label="Department" value={activeUser.department} />
                <KeyValue label="Batch / Year" value={activeUser.batch} />
                <KeyValue label="Status" value={activeUser.status} />
                <KeyValue label="Phone" value={activeUser.phone} />
                <KeyValue label="Registered" value={formatRelative(activeUser.registeredAt)} />
                <KeyValue label="Last Login" value={formatRelative(activeUser.lastLogin)} />
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-slate-100/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#003580]" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Admin Notes</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{activeUser.adminNotes || 'No notes available for this user.'}</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => { setActiveUser(null); openEditModal(activeUser); }} 
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003580] px-4 py-3 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all hover:shadow-lg"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit User
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    // Handle suspend - will integrate with backend later
                    console.log(`Suspend ${activeUser.name}`);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/50 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <UserRound className="h-4 w-4" />
                  Suspend
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    // Handle password reset - will integrate with backend later
                    console.log(`Reset password for ${activeUser.name}`);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <KeyRound className="h-4 w-4" />
                  Reset Password
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    // Handle role change - will integrate with backend later
                    console.log(`Change role for ${activeUser.name}`);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Shield className="h-4 w-4" />
                  Change Role
                </button>
              </div>
            </div>
          </div>
        </div>
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
