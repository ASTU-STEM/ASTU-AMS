import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  Shield,
  FileText,
  UserCog,
  FolderCog,
  Building2,
  GraduationCap,
  Users,
  SlidersHorizontal,
  Plus,
  Save,
  RotateCcw,
  X,
  CheckCircle2,
  Monitor,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminStatCard from '../components/AdminStatCard';
import { adminService } from '../services/admin.service';
import { permissionService } from '../../../services/permissionService';

type RoleKey = string;

type PortalMatrixKey =
  | 'GLOBAL'
  | 'SUPER_ADMIN_PORTAL'
  | 'ICT_PORTAL'
  | 'REGISTRAR_PORTAL'
  | 'DEPARTMENT_PORTAL'
  | 'EMPLOYER_PORTAL'
  | 'ALUMNI_PORTAL';

type PermissionSection = {
  title: string;
  permissions: { key: string; label: string; description: string }[];
};

const globalPermissionSections: PermissionSection[] = [
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
    title: 'Analytics & Reporting',
    permissions: [
      { key: 'view_dashboard', label: 'View Dashboard Metrics', description: 'Open institutional overview charts' },
      { key: 'view_department_analytics', label: 'View Department Analytics', description: 'Inspect department-level performance' },
      { key: 'view_employer_feedback', label: 'View Employer Feedback', description: 'Access employer skill and hiring signals' },
      { key: 'export_reports', label: 'Export Reports', description: 'Download analytics summaries and CSVs' },
    ],
  },
  {
    title: 'System Settings & Security',
    permissions: [
      { key: 'view_system_settings', label: 'View System Settings', description: 'Inspect global system preferences' },
      { key: 'edit_system_settings', label: 'Edit System Settings', description: 'Update platform-wide settings' },
      { key: 'manage_security', label: 'Manage Security', description: 'Control auth and safety settings' },
      { key: 'import_data', label: 'Import Data', description: 'Upload CSV / Excel records' },
      { key: 'sync_sis', label: 'Sync SIS Data', description: 'Trigger student information system syncs' },
    ],
  },
];

const portalMatrices: {
  key: PortalMatrixKey;
  name: string;
  role: RoleKey;
  icon: any;
  sections: PermissionSection[];
}[] = [
  {
    key: 'GLOBAL',
    name: 'All Portals (Global Master)',
    role: 'SUPER_ADMIN',
    icon: SlidersHorizontal,
    sections: globalPermissionSections,
  },
  {
    key: 'SUPER_ADMIN_PORTAL',
    name: 'Super Admin Portal Matrix',
    role: 'SUPER_ADMIN',
    icon: ShieldCheck,
    sections: [
      {
        title: 'Executive User Roster Governance',
        permissions: [
          { key: 'view_users', label: 'View User Directory', description: 'Browse all system accounts across ASTU' },
          { key: 'create_users', label: 'Create Users', description: 'Provision new staff, registrar, or alumni accounts' },
          { key: 'edit_users', label: 'Edit Users', description: 'Modify account profiles and credentials' },
          { key: 'manage_roles', label: 'Manage Roles', description: 'Assign and change user access roles' },
          { key: 'suspend_users', label: 'Suspend / Reactivate Users', description: 'Disable or restore platform access' },
        ],
      },
      {
        title: 'Support Desk & Escalations',
        permissions: [
          { key: 'manage_support_tickets', label: 'Manage Support Desk', description: 'Review user help tickets and reply to alumni' },
          { key: 'escalate_support_tickets', label: 'Escalate to ICT', description: 'Transfer unresolved tickets to ICT Technical Ops' },
        ],
      },
      {
        title: 'Institutional Governance',
        permissions: [
          { key: 'edit_system_settings', label: 'Global Platform Settings', description: 'Update platform-wide defaults and configurations' },
          { key: 'manage_donations', label: 'Donation Campaigns', description: 'Manage alumni fundraising projects and donors' },
        ],
      },
    ],
  },
  {
    key: 'ICT_PORTAL',
    name: 'ICT Technical Portal Matrix',
    role: 'ADMIN',
    icon: Shield,
    sections: [
      {
        title: 'Technical Infrastructure & Telemetry',
        permissions: [
          { key: 'view_command_center', label: 'View 360° Command Center', description: 'Inspect system health and microservice metrics' },
          { key: 'view_universal_logs', label: 'Universal Logs & State Diffs', description: 'Stream cross-portal logs and JSON mutation diffs' },
          { key: 'view_observability', label: 'Observability & Traces', description: 'Monitor request latencies (P50/P95/P99) and traces' },
          { key: 'trigger_incidents', label: 'Incident Lifecycle & DR', description: 'Trigger incident protocols and disaster recovery' },
        ],
      },
      {
        title: 'API Gateway & Security SOC',
        permissions: [
          { key: 'provision_api_keys', label: 'API Key Provisioning', description: 'Create partner API keys and set rate limits' },
          { key: 'manage_security', label: 'SOC & OWASP Matrix', description: 'Control A01–A10 security audit scanner and Break Glass' },
          { key: 'toggle_feature_flags', label: 'Feature Flags & Rollouts', description: 'Toggle feature flag percentages and rollbacks' },
          { key: 'revoke_active_sessions', label: 'Active Session Red Button', description: 'Revoke active user JWT tokens instantly' },
        ],
      },
    ],
  },
  {
    key: 'REGISTRAR_PORTAL',
    name: 'Registrar Portal Matrix',
    role: 'REGISTRAR',
    icon: FileText,
    sections: [
      {
        title: 'Student Information System (SIS) Operations',
        permissions: [
          { key: 'view_student_records', label: 'View Student Records', description: 'Access student academic ledger and graduation status' },
          { key: 'import_data', label: 'Batch CSV Imports', description: 'Upload bulk student CSV records into PostgreSQL' },
          { key: 'sync_sis', label: 'SIS Database Sync', description: 'Trigger live sync with Registrar database' },
        ],
      },
      {
        title: 'Identity Verifications & Transcripts',
        permissions: [
          { key: 'approve_verifications', label: 'Identity Verification Approvals', description: 'Approve or reject alumni degree verification requests' },
          { key: 'process_documents', label: 'Document Processing', description: 'Generate and issue official transcript PDFs' },
          { key: 'export_reports', label: 'Registrar Reports Export', description: 'Download official graduation summaries' },
        ],
      },
    ],
  },
  {
    key: 'DEPARTMENT_PORTAL',
    name: 'Department Head Matrix',
    role: 'DEPARTMENT_HEAD',
    icon: UserCog,
    sections: [
      {
        title: 'Departmental Analytics & Feedback',
        permissions: [
          { key: 'view_department_analytics', label: 'Department Performance', description: 'View department-level employment and skill analytics' },
          { key: 'view_employer_feedback', label: 'Employer Skill Signals', description: 'Review employer feedback regarding department graduates' },
          { key: 'analyze_surveys', label: 'Tracer Survey Analytics', description: 'Inspect survey completion and feedback trends' },
        ],
      },
    ],
  },
  {
    key: 'EMPLOYER_PORTAL',
    name: 'Employer Portal Matrix',
    role: 'EMPLOYER',
    icon: Building2,
    sections: [
      {
        title: 'Recruitment & Job Board',
        permissions: [
          { key: 'create_jobs', label: 'Post Job Listings', description: 'Create and submit new career opportunities' },
          { key: 'manage_job_posts', label: 'Manage Job Postings', description: 'Edit or close active job listings' },
          { key: 'search_talent', label: 'Search Alumni Talent', description: 'Browse verified alumni profiles and download CVs' },
          { key: 'submit_feedback', label: 'Submit Skill Feedback', description: 'Provide institutional feedback on graduate performance' },
        ],
      },
    ],
  },
  {
    key: 'ALUMNI_PORTAL',
    name: 'Alumni Portal Matrix',
    role: 'ALUMNI',
    icon: GraduationCap,
    sections: [
      {
        title: 'Alumni Services & Career Tools',
        permissions: [
          { key: 'edit_profile', label: 'Edit Profile & Bio', description: 'Update employment status and contact details' },
          { key: 'verify_fayda_id', label: 'Fayda National ID Scan', description: 'Perform QR code verification for verified badge' },
          { key: 'view_jobs', label: 'Browse & Apply for Jobs', description: 'Search job opportunities and submit applications' },
          { key: 'view_surveys', label: 'Participate in Surveys', description: 'Fill tracer study surveys and career questionnaires' },
        ],
      },
    ],
  },
];

const defaultRoleMeta: Record<
  string,
  {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  SUPER_ADMIN: {
    name: 'SUPER ADMIN',
    description: 'Root system governance, executive policy control, and master administration.',
    icon: ShieldCheck,
  },
  ADMIN: {
    name: 'ICT ADMIN',
    description: 'Technical operations, API gateway, telemetry, SOC, and infrastructure control.',
    icon: Shield,
  },
  REGISTRAR: {
    name: 'REGISTRAR',
    description: 'Record validation, SIS batch imports, student verification, and document processing.',
    icon: FileText,
  },
  DEPARTMENT_HEAD: {
    name: 'DEPARTMENT HEAD',
    description: 'Departmental performance, feedback review, and academic analytics.',
    icon: UserCog,
  },
  ALUMNI_OFFICE: {
    name: 'ALUMNI OFFICE / CMS',
    description: 'Alumni engagement campaigns, content management, events, and communications.',
    icon: FolderCog,
  },
  EMPLOYER: {
    name: 'EMPLOYER',
    description: 'Talent recruitment, job posting approvals, and skill feedback workflows.',
    icon: Building2,
  },
  ALUMNI: {
    name: 'ALUMNI',
    description: 'Graduate profile access, verification badges, surveys, and job applications.',
    icon: GraduationCap,
  },
};

const defaultPermissions: Record<string, Record<string, boolean>> = {
  SUPER_ADMIN: {
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: true,
    suspend_users: true,
    manage_support_tickets: true,
    escalate_support_tickets: true,
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
    manage_donations: true,
  },
  ADMIN: {
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: true,
    suspend_users: true,
    view_command_center: true,
    view_universal_logs: true,
    view_observability: true,
    trigger_incidents: true,
    provision_api_keys: true,
    manage_security: true,
    toggle_feature_flags: true,
    revoke_active_sessions: true,
    view_surveys: true,
    create_surveys: false,
    send_surveys: false,
    analyze_surveys: true,
    view_jobs: true,
    approve_jobs: false,
    manage_job_posts: false,
    feature_jobs: false,
    view_dashboard: true,
    view_department_analytics: true,
    view_employer_feedback: true,
    export_reports: true,
    view_system_settings: true,
    edit_system_settings: true,
    import_data: true,
    export_data: true,
    sync_sis: true,
  },
  REGISTRAR: {
    view_student_records: true,
    import_data: true,
    sync_sis: true,
    approve_verifications: true,
    process_documents: true,
    export_reports: true,
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: false,
    suspend_users: true,
    view_surveys: true,
    analyze_surveys: true,
    view_dashboard: true,
    view_reports: true,
    schedule_reports: true,
    approve_reports: true,
  },
  DEPARTMENT_HEAD: {
    view_department_analytics: true,
    view_employer_feedback: true,
    analyze_surveys: true,
    view_surveys: true,
    view_dashboard: true,
    export_reports: true,
    view_reports: true,
  },
  ALUMNI_OFFICE: {
    view_users: true,
    create_users: true,
    edit_users: true,
    manage_roles: false,
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
    import_data: true,
    export_data: true,
  },
  EMPLOYER: {
    create_jobs: true,
    manage_job_posts: true,
    search_talent: true,
    submit_feedback: true,
    view_surveys: true,
    view_jobs: true,
    view_dashboard: true,
    view_employer_feedback: true,
    export_data: true,
  },
  ALUMNI: {
    edit_profile: true,
    verify_fayda_id: true,
    view_jobs: true,
    view_surveys: true,
  },
};

const defaultRolesList = [
  'SUPER_ADMIN',
  'ADMIN',
  'REGISTRAR',
  'DEPARTMENT_HEAD',
  'ALUMNI_OFFICE',
  'EMPLOYER',
  'ALUMNI',
];

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
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer',
        checked ? 'border-[#1D9E75] bg-[#1D9E75]' : 'border-[var(--border-color)] bg-[var(--bg-page)]',
      ].join(' ')}
      aria-pressed={checked}
    >
      <span
        className={[
          'inline-block h-4 w-4 translate-x-1 rounded-full bg-[var(--bg-card)] shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<string>('SUPER_ADMIN');
  const [selectedPortalMatrix, setSelectedPortalMatrix] = useState<PortalMatrixKey>('GLOBAL');
  const [customRolesList, setCustomRolesList] = useState<string[]>(defaultRolesList);
  const [dynamicRoleMeta, setDynamicRoleMeta] = useState<Record<string, { name: string; description: string; icon: any }>>(defaultRoleMeta);
  const [draftPermissions, setDraftPermissions] = useState<Record<string, Record<string, boolean>>>(defaultPermissions);
  const [roleStats, setRoleStats] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleDesc, setCustomRoleDesc] = useState('');

  const selectedMeta = dynamicRoleMeta[selectedRole] || {
    name: selectedRole,
    description: `Custom policy rules for ${selectedRole}`,
    icon: Shield,
  };
  const activePortalMatrix = portalMatrices.find(m => m.key === selectedPortalMatrix) || portalMatrices[0];

  const fetchRoleData = async () => {
    try {
      const statsRes = await adminService.getRoleStats();
      if (statsRes.ok && statsRes.data) {
        setRoleStats(statsRes.data);
      }

      const permRes = await adminService.getRolePermissions();
      if (permRes.ok && permRes.data && typeof permRes.data === 'object') {
        const dbData = permRes.data;

        if (dbData._CUSTOM_ROLES && Array.isArray(dbData._CUSTOM_ROLES)) {
          const uniqueList = Array.from(new Set([...defaultRolesList, ...dbData._CUSTOM_ROLES]));
          setCustomRolesList(uniqueList);
        }

        if (dbData._CUSTOM_META && typeof dbData._CUSTOM_META === 'object') {
          const mergedMeta = { ...defaultRoleMeta };
          for (const key of Object.keys(dbData._CUSTOM_META)) {
            mergedMeta[key] = {
              name: dbData._CUSTOM_META[key].name || key,
              description: dbData._CUSTOM_META[key].description || 'Custom access role policy',
              icon: Shield,
            };
          }
          setDynamicRoleMeta(mergedMeta);
        }

        const merged: Record<string, Record<string, boolean>> = { ...defaultPermissions };
        for (const roleKey of Object.keys(dbData)) {
          if (!roleKey.startsWith('_') && typeof dbData[roleKey] === 'object') {
            merged[roleKey] = {
              ...(defaultPermissions[roleKey] || defaultPermissions['ADMIN']),
              ...dbData[roleKey],
            };
          }
        }
        setDraftPermissions(merged);
        permissionService.setCache(merged);
      }
    } catch (err) {
      console.error('Failed to load role data:', err);
    }
  };

  useEffect(() => {
    fetchRoleData();
  }, []);

  const totalUsers = useMemo(() => {
    return Object.values(roleStats).reduce((a, b) => a + b, 0);
  }, [roleStats]);

  const activeSections = useMemo(() => {
    return selectedPortalMatrix === 'GLOBAL' ? globalPermissionSections : activePortalMatrix.sections;
  }, [selectedPortalMatrix, activePortalMatrix]);

  const permissionCount = useMemo(() => {
    const rolePerms = draftPermissions[selectedRole] || defaultPermissions[selectedRole] || {};
    return activeSections.reduce((count, section) => {
      return count + section.permissions.filter(p => rolePerms[p.key] !== false).length;
    }, 0);
  }, [draftPermissions, selectedRole, activeSections]);

  const totalPossiblePermissions = useMemo(() => {
    return activeSections.reduce((count, section) => count + section.permissions.length, 0);
  }, [activeSections]);

  const adminCoveragePercentage = useMemo(() => {
    const adminUsersCount =
      (roleStats['SUPER_ADMIN'] || 0) +
      (roleStats['ADMIN'] || 0) +
      (roleStats['REGISTRAR'] || 0) +
      (roleStats['DEPARTMENT_HEAD'] || 0) +
      (roleStats['ALUMNI_OFFICE'] || 0);
    return totalUsers > 0 ? Math.round((adminUsersCount / totalUsers) * 100) : 100;
  }, [roleStats, totalUsers]);

  const roleSummaryCards = [
    {
      title: 'Total Roles',
      value: `${customRolesList.length}`,
      icon: Users,
      tone: 'blue' as const,
      trend: 'Core access groups',
    },
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: Building2,
      tone: 'green' as const,
      trend: 'System-wide',
    },
    {
      title: 'Permissions Enabled',
      value: `${permissionCount}`,
      icon: SlidersHorizontal,
      tone: 'gold' as const,
      trend: 'Active matrix scope',
    },
    {
      title: 'Admin Coverage',
      value: `${adminCoveragePercentage}%`,
      icon: ShieldCheck,
      tone: 'purple' as const,
      trend: 'Full control enabled',
    },
  ];

  const togglePermission = async (key: string, label: string) => {
    const currentRoleObj = draftPermissions[selectedRole] || defaultPermissions[selectedRole] || {};
    const nextValue = currentRoleObj[key] === false ? true : false;

    // Snapshot for rollback: the toggle is optimistic, and adminService resolves
    // { ok: false } rather than throwing, so a rejected change used to stay on
    // screen (and poison the permission cache) with no error shown.
    const previous = draftPermissions;

    if (!nextValue) {
      toast(`🔒 Toggle Disabled: "${label}" policy is now OFF for ${selectedMeta.name}`, {
        icon: '⚠️',
        duration: 3500,
      });
      permissionService.showComingSoon(label);
    }

    const updated = {
      ...draftPermissions,
      [selectedRole]: {
        ...currentRoleObj,
        [key]: nextValue,
      },
    };

    setDraftPermissions(updated);
    permissionService.setCache(updated);

    // adminService never throws - it resolves { ok: false } - so the catch below
    // was dead code and a rejected permission change stayed on screen (and in
    // the permission cache) as if it had been saved.
    const result = await adminService.updateRolePermissions(updated);
    if (!result.ok) {
      setDraftPermissions(previous);
      permissionService.setCache(previous);
      toast.error(result.message || 'Could not save that permission change.');
      return;
    }
    toast.success(`"${label}" ${nextValue ? 'enabled' : 'disabled'} for ${selectedMeta.name}.`);
  };

  const revertToDefault = async () => {
    const updated = {
      ...draftPermissions,
      [selectedRole]: { ...(defaultPermissions[selectedRole] || defaultPermissions['ADMIN']) },
    };
    // Was: success toast fired BEFORE the await, and the result was ignored.
    const result = await adminService.updateRolePermissions(updated);
    if (!result.ok) {
      toast.error(result.message || 'Could not save the reverted permissions.');
      return;
    }
    setDraftPermissions(updated);
    permissionService.setCache(updated);
    toast.success(`Reverted ${selectedMeta.name} permissions to default settings`);
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      const res = await adminService.updateRolePermissions(draftPermissions);
      if (res.ok) {
        permissionService.setCache(draftPermissions);
        toast.success(`Permissions for ${selectedMeta.name} saved successfully to PostgreSQL database!`);
      } else {
        toast.error('Failed to save permissions');
      }
    } catch (err) {
      console.error('Save permissions error:', err);
      toast.error('Error saving permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawName = customRoleName.trim();
    if (!rawName) {
      toast.error('Please enter a role name');
      return;
    }

    const key = rawName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

    if (customRolesList.includes(key)) {
      toast.error(`Role "${key}" already exists`);
      return;
    }

    const desc = customRoleDesc.trim() || `Custom access role policy for ${rawName.toUpperCase()}`;

    const updatedMeta = {
      ...dynamicRoleMeta,
      [key]: {
        name: rawName.toUpperCase(),
        description: desc,
        icon: Shield,
      },
    };
    setDynamicRoleMeta(updatedMeta);

    const updatedList = [...customRolesList, key];
    setCustomRolesList(updatedList);

    const newRolePerms = { ...(defaultPermissions['ADMIN'] || {}) };
    const updatedDraft = {
      ...draftPermissions,
      [key]: newRolePerms,
      _CUSTOM_ROLES: updatedList,
      _CUSTOM_META: Object.keys(updatedMeta).reduce((acc: any, k) => {
        if (!defaultRolesList.includes(k)) {
          acc[k] = { name: updatedMeta[k].name, description: updatedMeta[k].description };
        }
        return acc;
      }, {}),
    };

    setDraftPermissions(updatedDraft);
    setSelectedRole(key);
    setIsAddRoleOpen(false);
    setCustomRoleName('');
    setCustomRoleDesc('');

    permissionService.setCache(updatedDraft);

    const result = await adminService.updateRolePermissions(updatedDraft);
    if (!result.ok) {
      permissionService.setCache(draftPermissions);
      setDraftPermissions(draftPermissions);
      toast.error(result.message || 'Could not save the new role.');
      return;
    }
    toast.success(`Custom role "${rawName.toUpperCase()}" created.`);
  };


  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Role Management & Multi-Portal Matrix"
        subtitle="Define role policies, per-portal permission matrices, and enforce access restrictions across all portals."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Role Management' }]}
      />

      {/* Dynamic Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleSummaryCards.map(card => (
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

      {/* Per-Portal Permission Matrix View Selector */}
      <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-900" />
            <h3 className="font-extrabold text-[var(--text-primary)] text-xs uppercase tracking-wider">
              Select Specific Portal Permission Matrix
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-page)] px-2.5 py-0.5 rounded-full">
            Direct Database Policy Binding
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {portalMatrices.map(pm => {
            const Icon = pm.icon;
            const isSelected = selectedPortalMatrix === pm.key;
            return (
              <button
                key={pm.key}
                type="button"
                onClick={() => {
                  setSelectedPortalMatrix(pm.key);
                  if (pm.key !== 'GLOBAL') {
                    setSelectedRole(pm.role);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-950/20'
                    : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--border-color)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {pm.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Roles Navigation Sidebar List */}
        <section className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Roles Roster</h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Select a system role to edit its permissions.</p>
            </div>
            <AdminBadge variant="neutral">{customRolesList.length} roles</AdminBadge>
          </div>

          <div className="mt-5 space-y-3">
            {customRolesList.map(roleKey => {
              const meta = dynamicRoleMeta[roleKey] || {
                name: roleKey,
                description: `Custom policy rules for ${roleKey}`,
                icon: Shield,
              };
              const Icon = meta.icon || Shield;
              const isActive = selectedRole === roleKey;

              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setSelectedRole(roleKey)}
                  className={[
                    'w-full rounded-[10px] border p-4 text-left transition-all cursor-pointer',
                    isActive
                      ? 'border-[#003580]/30 bg-[#003580]/5 shadow-[0_2px_4px_rgba(0,53,128,0.08)] ring-1 ring-[#003580]/20'
                      : 'border-[var(--border-color)] hover:border-[#003580]/20 hover:bg-[var(--bg-page)]',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full shrink-0 ${
                        isActive ? 'bg-[#003580] text-white shadow-xs' : 'bg-[#003580]/10 text-[#003580]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-extrabold text-[var(--text-primary)] tracking-tight">{meta.name}</h3>
                        <AdminBadge variant={isActive ? 'default' : 'neutral'}>
                          {(roleStats[roleKey] || 0).toLocaleString()} users
                        </AdminBadge>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)] line-clamp-2">{meta.description}</p>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-color)]">
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                      {meta.name} Role Policy
                    </span>
                    <span className="text-xs font-bold text-[#003580] flex items-center gap-1">
                      Configure &rarr;
                    </span>
                  </div>
                </button>
              );
            })}
          </div>


          <button
            type="button"
            onClick={() => setIsAddRoleOpen(true)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#003580]/30 px-4 py-3 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Custom Role
          </button>
        </section>

        {/* Permission Matrix Configuration Section */}
        <section className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 border-b border-[var(--border-color)] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  {activePortalMatrix.name}
                </h2>
                <AdminBadge variant="default">{selectedMeta.name}</AdminBadge>
              </div>
              <p className="mt-1 max-w-2xl text-xs text-[var(--text-muted)]">
                Toggle functional capability rules for <strong>{selectedMeta.name}</strong>. Turning OFF a toggle restricts the feature both on the frontend portal UI and backend API middleware.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={revertToDefault}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-lg bg-[var(--bg-page)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Revert to Default
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] hover:bg-[#003580]/90 px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving to Database...' : 'Save Permissions'}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {activeSections.map(section => {
              const rolePerms = draftPermissions[selectedRole] || defaultPermissions[selectedRole];
              const sectionEnabled = section.permissions.filter(p => rolePerms[p.key] !== false).length;

              return (
                <div key={section.title} className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-page)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{section.title}</h3>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Functional access controls for this section.</p>
                    </div>
                    <AdminBadge variant={sectionEnabled === section.permissions.length ? 'success' : 'neutral'}>
                      {sectionEnabled} / {section.permissions.length} Enabled
                    </AdminBadge>
                  </div>

                  <div className="mt-3.5 grid gap-2.5">
                    {section.permissions.map(permission => {
                      const checked = rolePerms[permission.key] !== false;

                      return (
                        <div
                          key={permission.key}
                          className="flex items-center justify-between gap-4 rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--text-primary)]">{permission.label}</span>
                              {checked ? (
                                <AdminBadge variant="success">Allowed & Active</AdminBadge>
                              ) : (
                                <AdminBadge variant="neutral">Restricted (OFF)</AdminBadge>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{permission.description}</p>
                          </div>
                          <Toggle checked={checked} onChange={() => togglePermission(permission.key, permission.label)} />
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

      {/* Add Custom Role Modal */}
      {isAddRoleOpen &&
        createPortal(
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-[var(--border-color)]">
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-extrabold text-white text-base">Add Custom Role Policy</h3>
                </div>
                <button
                  onClick={() => setIsAddRoleOpen(false)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCustomRole} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Role Name</label>
                  <input
                    type="text"
                    placeholder="e.g. AUDITOR, ACADEMIC_DEAN"
                    value={customRoleName}
                    onChange={e => setCustomRoleName(e.target.value)}
                    className="w-full text-xs p-3 border border-[var(--border-color)] rounded-xl font-mono uppercase font-bold text-[var(--text-primary)] focus:outline-none focus:border-astu-navy shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Role Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the access scope and responsibility for this custom role..."
                    value={customRoleDesc}
                    onChange={e => setCustomRoleDesc(e.target.value)}
                    className="w-full text-xs p-3 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-astu-navy shadow-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setIsAddRoleOpen(false)}
                    className="px-4 py-2.5 bg-[var(--bg-page)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Create Custom Role
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
