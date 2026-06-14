import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminStatCard from '../components/AdminStatCard';

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
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
        checked ? 'border-[#1D9E75] bg-[#1D9E75]' : 'border-slate-300 bg-slate-200',
      ].join(' ')}
      aria-pressed={checked}
    >
      <span
        className={[
          'inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>('ADMIN');
  const [draftPermissions, setDraftPermissions] = useState(defaultPermissions);
  const selected = roleMeta[selectedRole];

  const permissionCount = useMemo(() => {
    return permissionSections.reduce((count, section) => {
      return count + section.permissions.filter((permission) => draftPermissions[selectedRole][permission.key]).length;
    }, 0);
  }, [draftPermissions, selectedRole]);

  const roleSummaryCards = [
    { title: 'Total Roles', value: '5', icon: Users, tone: 'blue' as const, trend: 'Core access groups' },
    { title: 'Total Users', value: '4,827', icon: Building2, tone: 'green' as const, trend: '+124 this year' },
    { title: 'Permissions Enabled', value: `${permissionCount}`, icon: SlidersHorizontal, tone: 'gold' as const, trend: 'Selected role only' },
    { title: 'Admin Coverage', value: '100%', icon: ShieldCheck, tone: 'purple' as const, trend: 'Full control enabled' },
  ];

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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Role Management"
        subtitle="Define role policies, permissions, and access scope."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Role Management' }]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleSummaryCards.map((card) => (
          <AdminStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Roles List</h2>
              <p className="mt-1 text-xs text-slate-500">Select a role to edit its permissions.</p>
            </div>
            <AdminBadge variant="neutral">{roleList.length} roles</AdminBadge>
          </div>

          <div className="mt-5 space-y-3">
            {roleList.map((roleKey) => {
              const meta = roleMeta[roleKey];
              const Icon = meta.icon;
              const isActive = selectedRole === roleKey;

              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setSelectedRole(roleKey)}
                  className={[
                    'w-full rounded-[10px] border p-4 text-left transition-all',
                    isActive
                      ? 'border-[#003580]/20 bg-[#003580]/5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                      : 'border-slate-200 hover:border-[#003580]/15 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003580]/10 text-[#003580]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-900">{meta.name}</h3>
                        <AdminBadge variant={isActive ? 'default' : 'neutral'}>{meta.users}</AdminBadge>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{meta.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-medium text-slate-500">{permissionCount} permissions enabled</span>
                    <span className="text-xs font-semibold text-[#003580]">Edit Permissions</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#003580]/25 px-4 py-3 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5"
          >
            <Plus className="h-4 w-4" />
            Add Custom Role
          </button>
        </section>

        <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">Permission Matrix</h2>
                <AdminBadge variant="neutral">{selected.name}</AdminBadge>
              </div>
              <p className="mt-1 max-w-2xl text-xs text-slate-500">
                Toggle granular permissions for the selected role. Changes are staged locally until saved.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={revertToDefault}
                className="text-sm font-medium text-[#003580] hover:underline"
              >
                Revert to Default
              </button>
              <button
                type="button"
                className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                Save Permissions
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {permissionSections.map((section) => (
              <div key={section.title} className="rounded-[10px] border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
                    <p className="mt-1 text-[11px] text-slate-500">Enable or disable access under this area.</p>
                  </div>
                  <AdminBadge variant="neutral">
                    {section.permissions.filter((permission) => draftPermissions[selectedRole][permission.key]).length}/
                    {section.permissions.length}
                  </AdminBadge>
                </div>

                <div className="mt-4 grid gap-3">
                  {section.permissions.map((permission) => {
                    const checked = draftPermissions[selectedRole][permission.key];

                    return (
                      <div
                        key={permission.key}
                        className="flex items-center justify-between gap-4 rounded-[10px] border border-white bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800">{permission.label}</span>
                            {checked ? (
                              <AdminBadge variant="success">Enabled</AdminBadge>
                            ) : (
                              <AdminBadge variant="neutral">Disabled</AdminBadge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{permission.description}</p>
                        </div>
                        <Toggle checked={checked} onChange={() => togglePermission(permission.key)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
