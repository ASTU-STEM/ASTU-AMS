import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart3,
  Building2,
  FileDown,
  FileText,
  FolderCog,
  GraduationCap,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
  Plus,
  X,
  RotateCcw,
  Save,
  Check,
  ChevronRight,
  Lock,
  Unlock,
  Shield,
  Settings,
  Database,
  FileUp,
  Download,
  Shield as ShieldIcon,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import { rolesService } from '../api/roles.service';

type RoleKey = 'ADMIN' | 'ALUMNI' | 'EMPLOYER' | 'DEPARTMENT_HEAD' | 'REGISTRAR';

type PermissionSection = {
  title: string;
  permissions: { key: string; label: string; description: string }[];
};

const permissionSections: PermissionSection[] = [
  {
    title: 'User Management',
    permissions: [
      { key: 'view_users', label: 'View User Directory', description: 'Browse all system accounts' },
      { key: 'create_users', label: 'Create Users', description: 'Add new alumni, staff, or employer accounts' },
      { key: 'edit_users', label: 'Edit Users', description: 'Update profile details and account fields' },
      { key: 'manage_roles', label: 'Manage Roles', description: 'Assign and change access roles' },
      { key: 'suspend_users', label: 'Suspend / Reactivate Users', description: 'Temporarily disable or restore access' },
    ],
  },
  {
    title: 'Survey Management',
    permissions: [
      { key: 'view_surveys', label: 'View Surveys', description: 'See survey list and response summaries' },
      { key: 'create_surveys', label: 'Create Surveys', description: 'Draft new tracer study campaigns' },
      { key: 'send_surveys', label: 'Send / Broadcast Surveys', description: 'Dispatch survey waves to users' },
      { key: 'analyze_surveys', label: 'Analyze Results', description: 'Review survey completion and trend insights' },
    ],
  },
  {
    title: 'Job Management',
    permissions: [
      { key: 'view_jobs', label: 'View Job Posts', description: 'Review active and archived jobs' },
      { key: 'approve_jobs', label: 'Approve Employer Jobs', description: 'Moderate and publish incoming listings' },
      { key: 'manage_job_posts', label: 'Manage Job Posts', description: 'Edit or remove postings' },
      { key: 'feature_jobs', label: 'Feature / Highlight Jobs', description: 'Promote priority opportunities' },
    ],
  },
  {
    title: 'Analytics',
    permissions: [
      { key: 'view_dashboard', label: 'View Dashboard Metrics', description: 'Open institutional overview charts' },
      { key: 'view_department_analytics', label: 'View Department Analytics', description: 'Inspect department-level performance' },
      { key: 'view_employer_feedback', label: 'View Employer Feedback', description: 'Access employer skill and hiring signals' },
      { key: 'export_reports', label: 'Export Reports', description: 'Download analytics summaries and CSVs' },
    ],
  },
  {
    title: 'Reports',
    permissions: [
      { key: 'view_reports', label: 'View Reports', description: 'Open all saved institutional reports' },
      { key: 'schedule_reports', label: 'Schedule Reports', description: 'Set recurring report jobs' },
      { key: 'approve_reports', label: 'Approve Reports', description: 'Validate official reporting outputs' },
    ],
  },
  {
    title: 'System Settings',
    permissions: [
      { key: 'view_system_settings', label: 'View System Settings', description: 'Inspect global system preferences' },
      { key: 'edit_system_settings', label: 'Edit System Settings', description: 'Update platform-wide settings' },
      { key: 'manage_security', label: 'Manage Security', description: 'Control auth and safety settings' },
    ],
  },
  {
    title: 'Data Import / Export',
    permissions: [
      { key: 'import_data', label: 'Import Data', description: 'Upload CSV / Excel records' },
      { key: 'export_data', label: 'Export Data', description: 'Download user and report datasets' },
      { key: 'sync_sis', label: 'Sync SIS Data', description: 'Trigger student information system syncs' },
    ],
  },
];

const roleMeta: Record<
  RoleKey,
  {
    name: string;
    description: string;
    users: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  ADMIN: {
    name: 'ADMIN',
    description: 'Full system governance, security, and administrative control.',
    users: '18 users',
    icon: ShieldCheck,
  },
  ALUMNI: {
    name: 'ALUMNI',
    description: 'Graduate profile access, survey participation, and career tools.',
    users: '4,827 users',
    icon: GraduationCap,
  },
  EMPLOYER: {
    name: 'EMPLOYER',
    description: 'Talent access, job postings, and employer feedback workflows.',
    users: '312 users',
    icon: Building2,
  },
  DEPARTMENT_HEAD: {
    name: 'DEPARTMENT_HEAD',
    description: 'Department analytics, feedback review, and curriculum insights.',
    users: '46 users',
    icon: UserCog,
  },
  REGISTRAR: {
    name: 'REGISTRAR',
    description: 'Record validation, batch imports, and document processing.',
    users: '22 users',
    icon: FileText,
  },
};

const defaultPermissions: Record<RoleKey, Record<string, boolean>> = {
  ADMIN: {
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: true,
    suspend_users: true,
    view_surveys: true,
    create_surveys: true,
    send_surveys: true,
    analyze_surveys: true,
    view_jobs: true,
    approve_jobs: true,
    manage_job_posts: true,
    feature_jobs: true,
    view_dashboard: true,
    view_department_analytics: true,
    view_employer_feedback: true,
    export_reports: true,
    view_reports: true,
    schedule_reports: true,
    approve_reports: true,
    view_system_settings: true,
    edit_system_settings: true,
    manage_security: true,
    import_data: true,
    export_data: true,
    sync_sis: true,
  },
  ALUMNI: {
    view_users: false,
    create_users: false,
    edit_users: false,
    manage_roles: false,
    suspend_users: false,
    view_surveys: true,
    create_surveys: false,
    send_surveys: false,
    analyze_surveys: false,
    view_jobs: true,
    approve_jobs: false,
    manage_job_posts: false,
    feature_jobs: false,
    view_dashboard: false,
    view_department_analytics: false,
    view_employer_feedback: false,
    export_reports: false,
    view_reports: false,
    schedule_reports: false,
    approve_reports: false,
    view_system_settings: false,
    edit_system_settings: false,
    manage_security: false,
    import_data: false,
    export_data: false,
    sync_sis: false,
  },
  EMPLOYER: {
    view_users: false,
    create_users: false,
    edit_users: false,
    manage_roles: false,
    suspend_users: false,
    view_surveys: true,
    create_surveys: false,
    send_surveys: false,
    analyze_surveys: false,
    view_jobs: true,
    approve_jobs: false,
    manage_job_posts: true,
    feature_jobs: false,
    view_dashboard: true,
    view_department_analytics: false,
    view_employer_feedback: true,
    export_reports: false,
    view_reports: true,
    schedule_reports: false,
    approve_reports: false,
    view_system_settings: false,
    edit_system_settings: false,
    manage_security: false,
    import_data: false,
    export_data: true,
    sync_sis: false,
  },
  DEPARTMENT_HEAD: {
    view_users: false,
    create_users: false,
    edit_users: false,
    manage_roles: false,
    suspend_users: false,
    view_surveys: true,
    create_surveys: false,
    send_surveys: false,
    analyze_surveys: true,
    view_jobs: false,
    approve_jobs: false,
    manage_job_posts: false,
    feature_jobs: false,
    view_dashboard: true,
    view_department_analytics: true,
    view_employer_feedback: true,
    export_reports: true,
    view_reports: true,
    schedule_reports: false,
    approve_reports: false,
    view_system_settings: false,
    edit_system_settings: false,
    manage_security: false,
    import_data: false,
    export_data: true,
    sync_sis: false,
  },
  REGISTRAR: {
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: false,
    suspend_users: true,
    view_surveys: true,
    create_surveys: false,
    send_surveys: false,
    analyze_surveys: true,
    view_jobs: false,
    approve_jobs: false,
    manage_job_posts: false,
    feature_jobs: false,
    view_dashboard: true,
    view_department_analytics: false,
    view_employer_feedback: false,
    export_reports: true,
    view_reports: true,
    schedule_reports: true,
    approve_reports: true,
    view_system_settings: true,
    edit_system_settings: false,
    manage_security: true,
    import_data: true,
    export_data: true,
    sync_sis: true,
  },
};

const roleList: RoleKey[] = ['ADMIN', 'ALUMNI', 'EMPLOYER', 'DEPARTMENT_HEAD', 'REGISTRAR'];

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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
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
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,51,128,0.15)] hover:scale-[1.02] cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
          {meta && <p className="mt-2 text-xs font-semibold" style={{ color: iconColor }}>{meta}</p>}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg" style={{ background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}25 100%)`, color: iconColor }}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 ease-out"
      style={{
        borderColor: checked ? '#1D9E75' : '#CBD5E1',
        backgroundColor: checked ? '#1D9E75' : '#F1F5F9',
      }}
      aria-pressed={checked}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ease-out"
        style={{
          transform: checked ? 'translateX(24px)' : 'translateX(2px)',
        }}
      />
    </button>
  );
}

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>('ADMIN');
  const [draftPermissions, setDraftPermissions] = useState(defaultPermissions);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoles() {
      let fetchedRoles: any[] = [];
      try {
        setIsLoading(true);
        fetchedRoles = await rolesService.getRoles();
        if (!Array.isArray(fetchedRoles) || fetchedRoles.length === 0) {
          throw new Error('Empty roles or invalid array returned from backend API');
        }
      } catch (error) {
        console.warn('Failed to load roles from backend, falling back to default access groups:', error);
        fetchedRoles = roleList.map(role => ({
          name: role,
          userCount: role === 'ADMIN' ? 18 : role === 'ALUMNI' ? 4827 : role === 'EMPLOYER' ? 312 : role === 'DEPARTMENT_HEAD' ? 46 : 22,
          permissions: Object.keys(defaultPermissions[role]).filter(k => defaultPermissions[role][k]),
        }));
      } finally {
        setRoles(fetchedRoles);
        
        // Map permissions:
        const permissionsMap: any = { ...defaultPermissions };
        fetchedRoles.forEach((role: any) => {
          const roleKey = role.name as RoleKey;
          permissionsMap[roleKey] = {};
          // Mark all permissions as false initially, then enable those in role.permissions
          permissionSections.forEach(section => {
            section.permissions.forEach(perm => {
              permissionsMap[roleKey][perm.key] = role.permissions.includes(perm.key);
            });
          });
        });
        setDraftPermissions(permissionsMap);
        
        if (fetchedRoles.length > 0) {
          setSelectedRole(fetchedRoles[0].name as RoleKey);
        }
        setIsLoading(false);
      }
    }
    loadRoles();
  }, []);

  const dynamicRoleMeta = useMemo(() => {
    const meta = { ...roleMeta };
    roles.forEach((r) => {
      const key = r.name as RoleKey;
      if (meta[key]) {
        meta[key].users = `${r.userCount || 0} users`;
      }
    });
    return meta;
  }, [roles]);

  const selected = dynamicRoleMeta[selectedRole];

  const permissionCount = useMemo(() => {
    return permissionSections.reduce((count, section) => {
      return count + section.permissions.filter((permission) => draftPermissions[selectedRole][permission.key]).length;
    }, 0);
  }, [draftPermissions, selectedRole]);

  const totalUsers = useMemo(() => roles.reduce((sum, r) => sum + (r.userCount || 0), 0), [roles]);

  const summaryCards = useMemo(() => {
    return [
      {
        label: 'Total Roles',
        value: String(roles.length || 5),
        meta: 'Core access groups',
        icon: Users,
        accent: '#003580',
        gradient: 'from-[#003580]/10 to-[#003580]/5',
      },
      {
        label: 'Total Users',
        value: totalUsers > 0 ? totalUsers.toLocaleString() : '5,225',
        meta: 'Across all roles',
        icon: Building2,
        accent: '#1D9E75',
        gradient: 'from-[#1D9E75]/10 to-[#1D9E75]/5',
      },
      {
        label: 'Permissions',
        value: `${permissionCount}`,
        meta: 'Selected role only',
        icon: SlidersHorizontal,
        accent: '#E8A020',
        gradient: 'from-[#E8A020]/10 to-[#E8A020]/5',
      },
      {
        label: 'Admin Coverage',
        value: '100%',
        meta: 'Full control enabled',
        icon: ShieldCheck,
        accent: '#7C3AED',
        gradient: 'from-[#7C3AED]/10 to-[#7C3AED]/5',
      },
    ];
  }, [roles, permissionCount, totalUsers]);

  const togglePermission = (key: string) => {
    setDraftPermissions((current) => ({
      ...current,
      [selectedRole]: {
        ...current[selectedRole],
        [key]: !current[selectedRole][key],
      },
    }));
  };

  const revertToDefault = () => {
    setDraftPermissions((current) => ({
      ...current,
      [selectedRole]: { ...defaultPermissions[selectedRole] },
    }));
  };

  const savePermissions = async () => {
    try {
      const permissions = Object.keys(draftPermissions[selectedRole]).filter(
        (key) => draftPermissions[selectedRole][key]
      );
      await rolesService.savePermissions(selectedRole, permissions);
      console.log('Permissions saved successfully');
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  };

  const exportConfig = async () => {
    try {
      const blob = await rolesService.exportRoles('excel');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'roles-configuration.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export roles:', error);
    }
  };

  const addCustomRole = async () => {
    try {
      await rolesService.createRole({
        name: 'New Custom Role',
        description: 'Custom role with specific permissions',
        permissions: [],
      });
      console.log('Custom role created successfully');
    } catch (error) {
      console.error('Failed to create custom role:', error);
    }
  };

  const getSectionIcon = (title: string) => {
    switch (title) {
      case 'User Management':
        return Users;
      case 'Survey Management':
        return FileText;
      case 'Job Management':
        return Building2;
      case 'Analytics':
        return BarChart3;
      case 'Reports':
        return FileDown;
      case 'System Settings':
        return Settings;
      case 'Data Import / Export':
        return Database;
      default:
        return FolderCog;
    }
  };

  return (
    <div className="space-y-8">
      {/* Custom Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003580] via-[#004499] to-[#1D9E75] p-8 shadow-[0_8px_30px_rgba(0,51,128,0.3)]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_0%,transparent_40%,rgba(232,160,32,0.08)_60%,transparent_100%)]" />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                <ShieldIcon className="h-6 w-6 text-[#E8A020]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Role Management</h1>
                <p className="mt-1 text-sm text-white/80">
                  Define role policies, permissions, and access scope.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <AdminBadge variant="success" className="border-white/20 bg-white/10 text-white">5 active roles</AdminBadge>
              <AdminBadge variant="default" className="border-white/20 bg-white/10 text-white">27 permissions</AdminBadge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exportConfig}
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all"
            >
              <Download className="h-4.5 w-4.5" />
              Export Config
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
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
        })}
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Role List Sidebar */}
        <SectionCard title="Roles List" subtitle="Select a role to edit permissions." action={<AdminBadge variant="neutral">{roleList.length} roles</AdminBadge>}>
          <div className="space-y-3">
            {roleList.map((roleKey) => {
              const meta = dynamicRoleMeta[roleKey];
              const Icon = meta.icon;
              const isActive = selectedRole === roleKey;

              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setSelectedRole(roleKey)}
                  className={`w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-[#003580]/30 bg-gradient-to-br from-[#003580]/5 to-[#003580]/10 shadow-md'
                      : 'border-slate-200/80 bg-white hover:border-[#003580]/20 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#003580] text-white shadow-lg'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-slate-900">{meta.name}</h3>
                        <AdminBadge variant={isActive ? 'default' : 'neutral'}>{meta.users}</AdminBadge>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-slate-600">{meta.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-200/50">
                    <span className="text-[11px] font-medium text-slate-500">
                      {permissionSections.reduce((count, section) => {
                        return count + section.permissions.filter((permission) => draftPermissions[roleKey][permission.key]).length;
                      }, 0)} permissions
                    </span>
                    <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isActive ? 'rotate-90 text-[#003580]' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addCustomRole}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#003580]/25 px-4 py-3 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Add Custom Role
          </button>
        </SectionCard>

        {/* Permission Matrix */}
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-slate-200/80 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003580]/10 text-[#003580]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Permission Matrix</h2>
                  <AdminBadge variant="default">{selected.name}</AdminBadge>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                Toggle granular permissions for the selected role. Changes are staged locally until saved.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={revertToDefault}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all hover:scale-105"
              >
                <RotateCcw className="h-4 w-4" />
                Revert
              </button>
              <button
                type="button"
                onClick={savePermissions}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all hover:shadow-lg hover:scale-105"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Permission Sections */}
          <div className="p-6 space-y-6">
            {permissionSections.map((section) => {
              const SectionIcon = getSectionIcon(section.title);
              const enabledCount = section.permissions.filter((permission) => draftPermissions[selectedRole][permission.key]).length;
              
              return (
                <div key={section.title} className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50/50 to-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580]">
                        <SectionIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Enable or disable access under this area</p>
                      </div>
                    </div>
                    <AdminBadge variant={enabledCount === section.permissions.length ? 'success' : 'neutral'}>
                      {enabledCount}/{section.permissions.length}
                    </AdminBadge>
                  </div>

                  <div className="space-y-3">
                    {section.permissions.map((permission) => {
                      const checked = draftPermissions[selectedRole][permission.key];

                      return (
                        <div
                          key={permission.key}
                          className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-slate-800">{permission.label}</span>
                              {checked ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                                  <Check className="h-3 w-3" />
                                  Enabled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                  <Lock className="h-3 w-3" />
                                  Disabled
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{permission.description}</p>
                          </div>
                          <Toggle checked={checked} onChange={() => togglePermission(permission.key)} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
