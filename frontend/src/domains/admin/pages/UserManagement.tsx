import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownUp,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  Eye,
  FileText,
  Filter,
  KeyRound,
  PencilLine,
  Phone,
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
  UserCog,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SmallStat({ label, value, icon: Icon, color, meta }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string; meta?: string }) {
  const iconColor = color || '#003580';
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,51,128,0.15)] hover:scale-[1.02] cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
          {meta && <p className="mt-1 text-xs font-semibold" style={{ color: iconColor }}>{meta}</p>}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow" style={{ background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}25 100%)`, color: iconColor }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
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

  const totalUsersLabel = `${users.length} users`;
  const activeCount = useMemo(() => users.filter((u) => u.status === 'Active').length, [users]);
  const pendingCount = useMemo(() => users.filter((u) => u.status === 'Pending Verification').length, [users]);
  const suspendedCount = useMemo(() => users.filter((u) => u.status === 'Suspended').length, [users]);
  const inactiveCount = useMemo(() => users.filter((u) => u.status === 'Inactive').length, [users]);
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
        const popupWidth = 420;
        const popupHeight = 600;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Position below the clicked button by default
        let top = rect.bottom + 8;
        let left = rect.right + 8;
        
        // If popup would go off right edge, position to the left
        if (left + popupWidth > viewportWidth) {
          left = rect.left - popupWidth - 8;
        }
        
        // If popup would go off bottom edge, position above
        if (top + popupHeight > viewportHeight) {
          top = rect.top - popupHeight - 8;
        }
        
        // Ensure minimum margins
        left = Math.max(16, left);
        top = Math.max(16, top);
        
        setProfilePosition({ top, left });
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
  const activeFilterCount = [query ? 1 : 0, selectedRole !== 'All Roles' ? 1 : 0, selectedStatus !== 'All' ? 1 : 0, selectedDepartment !== 'All Departments' ? 1 : 0, dateFrom ? 1 : 0, dateTo ? 1 : 0].reduce((a, b) => a + b, 0);
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
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 8px 30px rgba(0,53,128,0.35)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.10), transparent)' }} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.15)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                <UserCog className="h-5 w-5" style={{ color: '#E8A020' }} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>User Management</h1>
                <p className="mt-0.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  Manage all system accounts, roles, and access permissions.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#ffffff', background: 'rgba(29,158,117,0.25)', border: '1px solid rgba(29,158,117,0.40)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeCount.toLocaleString()} Active
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#ffffff', background: 'rgba(232,160,32,0.20)', border: '1px solid rgba(232,160,32,0.35)' }}>
                {pendingCount} Pending
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.92)', color: '#003580' }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add User
            </button>
            <button
              type="button"
              onClick={() => exportCsv(filteredUsers)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', color: '#ffffff', backdropFilter: 'blur(8px)' }}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Import Status Banner */}
      <div className="rounded-2xl border border-[#1D9E75]/20 bg-gradient-to-r from-[#1D9E75]/10 to-[#1D9E75]/5 px-5 py-3 text-sm text-[#1D9E75]">
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

      {/* Summary Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {usersLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-card-${index}`} className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
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
              <SmallStat
                key={card.label}
                label={card.label}
                value={card.value}
                icon={Icon}
                color={card.accent}
                meta={card.meta}
              />
            );
          })
        )}
      </section>

      {/* Filter Section */}
      <SectionCard title="Filter Users" subtitle="Search and filter users by various criteria.">
        <div className="grid gap-4 xl:grid-cols-12">
          <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${searchFocused ? 'border-[#003580]/40 ring-2 ring-[#003580]/10 bg-[#003580]/5' : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300'} xl:col-span-4`}>
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

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-2">
            <Filter className="h-4.5 w-4.5 text-slate-400" />
            <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as Role | 'All Roles')} className="w-full bg-transparent outline-none">
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-2">
            <Filter className="h-4.5 w-4.5 text-slate-400" />
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as Status | 'All')} className="w-full bg-transparent outline-none">
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-2">
            <Building2 className="h-4.5 w-4.5 text-slate-400" />
            <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} className="w-full bg-transparent outline-none">
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-1">
            <User className="h-4.5 w-4.5 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full bg-transparent outline-none"
              aria-label="Registered between start date"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm hover:border-slate-300 transition-all xl:col-span-1">
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
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all hover:border-slate-300">
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
      </SectionCard>

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-600">{statsLine}</div>
        <div className="text-xs text-slate-400">{filteredUsers.length} filtered of {users.length}</div>
      </div>

      {selectedIds.length > 0 && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#003580]/20 bg-gradient-to-r from-[#003580]/10 to-[#003580]/5 backdrop-blur-sm p-5 shadow-lg">
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
            <button type="button" onClick={() => bulkAction('activate')} className="inline-flex items-center gap-2 rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all hover:shadow-lg hover:scale-105">
              <Check className="h-4 w-4" />
              Activate
            </button>
            <button type="button" onClick={() => bulkAction('suspend')} className="inline-flex items-center gap-2 rounded-xl bg-[#E8A020] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all hover:shadow-lg hover:scale-105">
              <Shield className="h-4 w-4" />
              Suspend
            </button>
            <button type="button" onClick={() => bulkAction('export')} className="inline-flex items-center gap-2 rounded-xl border border-[#003580]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#003580] shadow-sm hover:bg-[#003580]/5 transition-all hover:scale-105">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button type="button" onClick={() => bulkAction('delete')} className="inline-flex items-center gap-2 rounded-xl border border-[#E24B4A]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#E24B4A] shadow-sm hover:bg-[#E24B4A]/5 transition-all hover:scale-105">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </section>
      )}

      {/* Users Table */}
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
              <tr>
                <th className="w-12 border-b border-slate-200/80 px-5 py-4 text-left">
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
                    className={`border-b border-slate-200/80 px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 ${column.width ?? ''}`}
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
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-slate-100/80">
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
                      <button type="button" onClick={resetFilters} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ color: '#ffffff' }}>
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
                  className={`cursor-pointer border-b border-slate-100/80 transition-all duration-200 hover:bg-slate-50/80 hover:shadow-sm ${
                    activeUser?.id === user.id ? 'bg-[#003580]/5 shadow-inner' : ''
                  }`}
                  onClick={(event) => {
                    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                    const popupWidth = 420;
                    const popupHeight = 600;
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    let top = rect.bottom + 8;
                    let left = rect.right + 8;
                    
                    if (left + popupWidth > viewportWidth) {
                      left = rect.left - popupWidth - 8;
                    }
                    
                    if (top + popupHeight > viewportHeight) {
                      top = rect.top - popupHeight - 8;
                    }
                    
                    left = Math.max(16, left);
                    top = Math.max(16, top);
                    
                    setProfilePosition({ top, left });
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
                        <div className="absolute right-0 top-10 z-[9999] w-52 overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
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
              )))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200/80 bg-slate-50/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{paginatedUsers.length}</span> of <span className="font-semibold text-slate-900">{sortedUsers.length}</span> filtered users
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-105"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              Page <span className="text-[#003580]">{page}</span> of <span className="text-[#003580]">{totalPages}</span>
            </div>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-105"
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all hover:scale-105"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={saveUser}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-6 py-2.5 text-sm font-semibold shadow-md hover:brightness-110 transition-all hover:shadow-lg hover:scale-105" style={{ color: '#ffffff' }}
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
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50" 
              placeholder="Enter full name"
            />
          </Field>
          <Field label="Email" error={formErrors.email}>
            <input 
              value={form.email} 
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} 
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50" 
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
                className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed font-mono"
              />
            </div>
          </Field>
          <Field label="Role">
            <select 
              value={form.role} 
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as Role }))} 
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
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
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
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
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 font-mono"
            />
          </Field>
          <Field label="Phone" error={formErrors.phone}>
            <input 
              value={form.phone} 
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} 
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50" 
              placeholder="+251 9XX XXX XXX"
              type="tel"
            />
          </Field>
          <Field label="Account status">
            <select 
              value={form.status} 
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Status }))} 
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
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
          className="fixed z-[9999] w-[420px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
          style={{
            top: profilePosition?.top ? `${profilePosition.top}px` : '50%',
            left: profilePosition?.left ? `${profilePosition.left}px` : '50%',
            transform: profilePosition ? 'none' : 'translate(-50%, -50%)',
          }}
        >
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-[#003580] via-[#004499] to-[#1D9E75] px-6 py-5">
            <button 
              type="button" 
              onClick={() => setActiveUser(null)} 
              className="absolute right-4 top-4 rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-lg font-bold text-white shadow-lg">
                  {initials(activeUser.name)}
                </div>
                <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                  activeUser.status === 'Active' ? 'bg-emerald-400' : 
                  activeUser.status === 'Suspended' ? 'bg-rose-400' : 
                  activeUser.status === 'Pending Verification' ? 'bg-amber-400' : 
                  'bg-slate-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{activeUser.name}</h3>
                <p className="text-sm text-white/80 truncate">{activeUser.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    roleTone[activeUser.role] === 'success' ? 'bg-emerald-500/20 text-emerald-100' :
                    roleTone[activeUser.role] === 'warning' ? 'bg-amber-500/20 text-amber-100' :
                    roleTone[activeUser.role] === 'danger' ? 'bg-rose-500/20 text-rose-100' :
                    'bg-white/20 text-white'
                  }`}>
                    {activeUser.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* User Information Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Student ID</p>
                <p className="text-sm font-semibold text-slate-900">{activeUser.studentId || 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Department</p>
                <p className="text-sm font-semibold text-slate-900">{activeUser.department || 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Batch / Year</p>
                <p className="text-sm font-semibold text-slate-900">{activeUser.batch || 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Status</p>
                <AdminBadge variant={statusTone[activeUser.status]} className={statusColorClass[activeUser.status]}>
                  {activeUser.status}
                </AdminBadge>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Phone className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900 truncate">{activeUser.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <CalendarDays className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Registered</p>
                  <p className="text-sm font-medium text-slate-900">{formatRelative(activeUser.registeredAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <ArrowDownUp className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Last Login</p>
                  <p className="text-sm font-medium text-slate-900">{formatRelative(activeUser.lastLogin)}</p>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-[#003580]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">Admin Notes</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{activeUser.adminNotes || 'No notes available for this user.'}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                type="button" 
                onClick={() => { setActiveUser(null); openEditModal(activeUser); }} 
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-4 py-3 text-sm font-semibold shadow-md hover:brightness-110 transition-all hover:shadow-lg hover:scale-105" style={{ color: '#ffffff' }}
              >
                <PencilLine className="h-4 w-4" />
                Edit User
              </button>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    console.log(`Suspend ${activeUser.name}`);
                  }}
                  className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/50 px-3 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all hover:scale-105"
                >
                  <UserRound className="h-4 w-4" />
                  Suspend
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    console.log(`Reset password for ${activeUser.name}`);
                  }}
                  className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all hover:scale-105"
                >
                  <KeyRound className="h-4 w-4" />
                  Reset
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    console.log(`Change role for ${activeUser.name}`);
                  }}
                  className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all hover:scale-105"
                >
                  <Shield className="h-4 w-4" />
                  Role
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
