import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AppWindow,
  BellRing,
  Blocks,
  Brush,
  ClipboardCheck,
  CloudCog,
  Code2,
  DatabaseBackup,
  FileQuestion,
  Globe2,
  HardDrive,
  History,
  KeyRound,
  Layers3,
  LockKeyhole,
  MailCheck,
  MessageCircle,
  MonitorDot,
  Menu,
  GalleryHorizontalEnd,
  Search,
  Shield,
  SlidersHorizontal,
  UsersRound,
  X,
  ExternalLink,
  CheckCircle2,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminSectionCard, { adminPanelClass } from '../components/AdminSectionCard';
import AdminStatCard from '../components/AdminStatCard';
import AdminStatGrid from '../components/AdminStatGrid';
import InstitutionalHubBridge from '../../../components/InstitutionalHubBridge';
import { adminService } from '../services/admin.service';
import type { AdminBadgeProps, AdminStatCardData } from '../types/admin.types';

type ModuleStatus = 'Live' | 'Configured' | 'Needs Review' | 'Planned';

interface ModuleItem {
  id: string;
  title: string;
  icon: any;
  defaultStatus: ModuleStatus;
  route: string;
  description: string;
}

interface GroupDefinition {
  name: 'Homepage & CMS' | 'Engagement & Partners' | 'Platform Operations';
  description: string;
  modules: ModuleItem[];
}

const moduleGroups: GroupDefinition[] = [
  {
    name: 'Homepage & CMS',
    description: 'Public portal customization, dynamic content layout, SEO, notice popups, and page builders.',
    modules: [
      {
        id: 'cms-builder',
        title: 'CMS/Page Builder',
        icon: Blocks,
        defaultStatus: 'Live',
        route: '/cms/content',
        description: 'Visual content editor & article management system.',
      },
      {
        id: 'dynamic-sections',
        title: 'Dynamic Homepage Sections',
        icon: Layers3,
        defaultStatus: 'Live',
        route: '/cms/homepage',
        description: 'Reorderable hero banners, stats widgets, and features grid.',
      },
      {
        id: 'theme-customization',
        title: 'Homepage Theme Customization',
        icon: Brush,
        defaultStatus: 'Live',
        route: '/cms/settings',
        description: 'Branding palette, dark mode tokens, and typography system.',
      },
      {
        id: 'menu-management',
        title: 'Homepage Menu Management',
        icon: Menu,
        defaultStatus: 'Live',
        route: '/cms/homepage',
        description: 'Header navigation items, dropdowns, and footer links.',
      },
      {
        id: 'search-management',
        title: 'Homepage Search Management',
        icon: Search,
        defaultStatus: 'Live',
        route: '/cms/settings',
        description: 'Portal search indexing preferences and CMS discovery settings.',
      },
      {
        id: 'seo-settings',
        title: 'SEO Settings',
        icon: Globe2,
        defaultStatus: 'Live',
        route: '/cms/seo',
        description: 'Meta titles, OpenGraph social cards, sitemap XML, and keywords.',
      },
      {
        id: 'notice-popups',
        title: 'Popup & Notice Management',
        icon: AppWindow,
        defaultStatus: 'Live',
        route: '/admin/notifications',
        description: 'Emergency campus alerts, modal announcements, and toast notices.',
      },
    ],
  },
  {
    name: 'Engagement & Partners',
    description: 'Corporate sponsorships, employer roster, FAQ, success stories, and media repository.',
    modules: [
      {
        id: 'contact-messages',
        title: 'Contact Message Management',
        icon: MessageCircle,
        defaultStatus: 'Live',
        route: '/admin/messages',
        description: 'ASTU direct messaging hub, inquiry tickets, and chat responses.',
      },
      {
        id: 'faq-management',
        title: 'FAQ Management',
        icon: FileQuestion,
        defaultStatus: 'Live',
        route: '/cms/homepage',
        description: 'Homepage accreditation FAQ preview and full /info/faq content sync.',
      },
      {
        id: 'partner-management',
        title: 'Partner & Sponsor Management',
        icon: UsersRound,
        defaultStatus: 'Live',
        route: '/cms/partners',
        description: 'Employer roster, partner logos, and industry hiring tracker.',
      },
      {
        id: 'ad-banners',
        title: 'Advertisement Banner Management',
        icon: GalleryHorizontalEnd,
        defaultStatus: 'Live',
        route: '/cms/media-gallery',
        description: 'Campus sponsorship banners, event promos, and workshop highlights.',
      },
      {
        id: 'success-stories',
        title: 'Alumni Success Story Approval',
        icon: ClipboardCheck,
        defaultStatus: 'Live',
        route: '/cms/approvals',
        description: 'Spotlight story moderation, achievements, and tracer reviews.',
      },
      {
        id: 'media-library',
        title: 'Digital Asset Library',
        icon: HardDrive,
        defaultStatus: 'Live',
        route: '/cms/media-gallery',
        description: 'Image upload repository, document attachments, and media CDN.',
      },
    ],
  },
  {
    name: 'Platform Operations',
    description: 'Security audit logs, system telemetry, backups, permissions, notifications, and export ledger.',
    modules: [
      {
        id: 'activity-logs',
        title: 'Activity Logs & Audit Trail',
        icon: History,
        defaultStatus: 'Live',
        route: '/admin/logs',
        description: 'Real-time database mutation tracking and admin audit trail.',
      },
      {
        id: 'backup-restore',
        title: 'Backup & Restore System',
        icon: DatabaseBackup,
        defaultStatus: 'Live',
        route: '/admin/backup',
        description: 'Automated PostgreSQL snapshots, S3 offsite backups, and recovery.',
      },
      {
        id: 'email-templates',
        title: 'Email/SMS Template Management',
        icon: MailCheck,
        defaultStatus: 'Live',
        route: '/cms/templates',
        description: 'Nodemailer HTML templates, tracer dispatch alerts, and transactional mail.',
      },
      {
        id: 'notification-center',
        title: 'Notification Center',
        icon: BellRing,
        defaultStatus: 'Live',
        route: '/admin/notifications',
        description: 'In-app notification engine, batch email broadcasts, and alerts.',
      },
      {
        id: 'role-management',
        title: 'Role & Permission Management',
        icon: KeyRound,
        defaultStatus: 'Live',
        route: '/admin/roles',
        description: 'Granular permissions matrix across Super Admin, ICT Admin, and CMS roles.',
      },
      {
        id: 'api-management',
        title: 'API Management',
        icon: Code2,
        defaultStatus: 'Live',
        route: '/admin/ict-portal',
        description: 'Express REST endpoints, rate limiting, and technical API gateway.',
      },
      {
        id: 'system-monitoring',
        title: 'System Monitoring Dashboard',
        icon: MonitorDot,
        defaultStatus: 'Live',
        route: '/admin/ict-portal',
        description: 'Server load metrics, database health, telemetry, and memory usage.',
      },
      {
        id: 'security-center',
        title: 'Security Center',
        icon: Shield,
        defaultStatus: 'Live',
        route: '/admin/backup',
        description: 'JWT token policies, CORS rules, MFA enforcement, and firewall checks.',
      },
      {
        id: 'login-history',
        title: 'Login History',
        icon: LockKeyhole,
        defaultStatus: 'Live',
        route: '/admin/logs',
        description: 'Authentication history, IP address logs, and anomaly detection.',
      },
      {
        id: 'data-export-center',
        title: 'Data Export Center',
        icon: CloudCog,
        defaultStatus: 'Live',
        route: '/admin/reports',
        description: 'CSV, PDF, Excel, and JSON data export engine for system analytics.',
      },
    ],
  },
];

const statusBadgeVariant: Record<ModuleStatus, NonNullable<AdminBadgeProps['variant']>> = {
  Live: 'success',
  Configured: 'info',
  'Needs Review': 'needs-review',
  Planned: 'neutral',
};

interface ModuleConfigState {
  status: ModuleStatus;
  enabled: boolean;
  requiredRole: string;
  auditLogged: boolean;
}

export default function SuperAdminModules() {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState<GroupDefinition['name']>('Homepage & CMS');

  // Governance state — PostgreSQL is source of truth (defaults until API hydrates)
  const buildDefaultConfigs = (): Record<string, ModuleConfigState> => {
    const defaults: Record<string, ModuleConfigState> = {};
    moduleGroups.forEach((g) => {
      g.modules.forEach((m) => {
        defaults[m.id] = {
          status: m.defaultStatus,
          enabled: true,
          requiredRole: 'SUPER_ADMIN',
          auditLogged: true,
        };
      });
    });
    return defaults;
  };

  const [moduleConfigs, setModuleConfigs] = useState<Record<string, ModuleConfigState>>(buildDefaultConfigs);

  // Modal State
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Editable state inside single module modal
  const [modalStatus, setModalStatus] = useState<ModuleStatus>('Live');
  const [modalEnabled, setModalEnabled] = useState(true);
  const [modalRole, setModalRole] = useState('SUPER_ADMIN');
  const [modalAudit, setModalAudit] = useState(true);

  // Security Center policy flags (persisted via technical-ops security-governance API)
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [exportAudited, setExportAudited] = useState(true);
  const [keyRotation, setKeyRotation] = useState(false);

  // Real Telemetry State from backend
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);
  const [telemetry, setTelemetry] = useState<{
    apiLatency: number;
    backupIntegrity: string;
    securityPostureScore: number;
    blockedThreatsCount: number;
  } | null>(null);

  const fetchLiveTelemetry = async (): Promise<boolean> => {
    setIsRefreshingTelemetry(true);
    try {
      const res = await adminService.getLiveTelemetry();
      if (res.ok && res.data) {
        setTelemetry({
          apiLatency: res.data.apiLatency,
          backupIntegrity: res.data.backupIntegrity || '—',
          securityPostureScore: res.data.securityPostureScore,
          blockedThreatsCount: res.data.blockedThreatsCount,
        });
        return true;
      }
      return false;
    } catch (_) {
      return false;
    } finally {
      setIsRefreshingTelemetry(false);
    }
  };

  // Sync governance settings with PostgreSQL database
  useEffect(() => {
    adminService.getModuleGovernance().then((res) => {
      if (res.ok && res.data) {
        if (res.data.configs && typeof res.data.configs === 'object') {
          setModuleConfigs(res.data.configs);
        }
      }
    });

    adminService.getSecurityGovernance().then((res) => {
      if (res.ok && res.data) {
        if (res.data.mfa !== undefined) setMfaEnforced(res.data.mfa);
        if (res.data.exportAudit !== undefined) setExportAudited(res.data.exportAudit);
        if (res.data.keyRot !== undefined) setKeyRotation(res.data.keyRot);
      }
    });

    fetchLiveTelemetry();
  }, []);

  const saveGovernanceToDB = async (updatedConfigs: Record<string, ModuleConfigState>) => {
    return adminService.updateModuleGovernance({ configs: updatedConfigs });
  };

  useEffect(() => {
    if (selectedModule || showGroupModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [selectedModule, showGroupModal]);

  const handleOpenModuleModal = (module: ModuleItem) => {
    setSelectedModule(module);
    const cfg = moduleConfigs[module.id] || {
      status: module.defaultStatus,
      enabled: true,
      requiredRole: 'SUPER_ADMIN',
      auditLogged: true,
    };
    setModalStatus(cfg.status);
    setModalEnabled(cfg.enabled);
    setModalRole(cfg.requiredRole);
    setModalAudit(cfg.auditLogged);
  };

  const handleSaveModuleConfig = async () => {
    if (!selectedModule) return;
    const updated = {
      ...moduleConfigs,
      [selectedModule.id]: {
        status: modalStatus,
        enabled: modalEnabled,
        requiredRole: modalRole,
        auditLogged: modalAudit,
      },
    };

    const result = await saveGovernanceToDB(updated);
    if (result && result.ok === false) {
      toast.error(result.message || 'Could not save module governance.');
      return;
    }
    setModuleConfigs(updated);
    setSelectedModule(null);
    toast.success(`Saved governance rules for "${selectedModule.title}".`);
  };

  const handleConfigureGroupBulk = async (newStatus: ModuleStatus) => {
    const groupDef = moduleGroups.find((g) => g.name === activeGroup);
    if (!groupDef) return;

    const updated = { ...moduleConfigs };
    groupDef.modules.forEach((m) => {
      updated[m.id] = {
        ...(updated[m.id] || { enabled: true, requiredRole: 'SUPER_ADMIN', auditLogged: true }),
        status: newStatus,
      };
    });

    // Was: "in Database!" fired before saveGovernanceToDB resolved.
    const result = await saveGovernanceToDB(updated);
    if (result && result.ok === false) {
      toast.error(result.message || 'Could not save module statuses.');
      return;
    }
    setModuleConfigs(updated);
    setShowGroupModal(false);
    toast.success(`Updated ${groupDef.modules.length} module(s) in "${activeGroup}" to ${newStatus}.`);
  };

  const handleToggleSecuritySetting = async (key: 'mfa' | 'export' | 'keyRot') => {
    let nextMfa = mfaEnforced;
    let nextExport = exportAudited;
    let nextKeyRot = keyRotation;

    const labels = { mfa: 'MFA enforcement', export: 'export audit logging', keyRot: 'API key rotation' } as const;

    if (key === 'mfa') { nextMfa = !mfaEnforced; }
    else if (key === 'export') { nextExport = !exportAudited; }
    else { nextKeyRot = !keyRotation; }
    const nextValue = key === 'mfa' ? nextMfa : key === 'export' ? nextExport : nextKeyRot;

    // These toasts used to claim the change was "Enforced in PostgreSQL
    // Database" BEFORE the request was sent, and the result was never checked.
    const result = await adminService.updateSecurityGovernance({
      mfa: nextMfa,
      exportAudit: nextExport,
      keyRot: nextKeyRot,
    });

    if (!result.ok) {
      toast.error(result.message || `Could not save ${labels[key]}.`);
      return;
    }

    if (key === 'mfa') setMfaEnforced(nextMfa);
    else if (key === 'export') setExportAudited(nextExport);
    else setKeyRotation(nextKeyRot);

    toast.success(`${labels[key]} ${nextValue ? 'enabled' : 'disabled'}.`);
    fetchLiveTelemetry();
  };

  const handleRefreshTelemetry = async () => {
    const ok = await fetchLiveTelemetry();
    if (ok) toast.success('Live system telemetry refreshed.');
    else toast.error('Could not refresh telemetry. Try again.');
  };

  const currentGroup = moduleGroups.find((g) => g.name === activeGroup) || moduleGroups[0];

  const telemetryStats: AdminStatCardData[] = [
    {
      label: 'API Latency',
      value: telemetry !== null ? `${telemetry.apiLatency} ms` : '—',
      icon: Activity,
      tone: 'green',
      trend: 'Live response time',
      loading: telemetry === null,
      compact: true,
    },
    {
      label: 'Backup Integrity',
      value: telemetry?.backupIntegrity ?? '—',
      icon: CheckCircle2,
      tone: 'green',
      trend: 'PostgreSQL snapshots',
      loading: telemetry === null,
      compact: true,
    },
    {
      label: 'Security Score',
      value: telemetry !== null ? `${telemetry.securityPostureScore} / 100` : '—',
      icon: Shield,
      tone: 'blue',
      trend: 'Posture index',
      loading: telemetry === null,
      compact: true,
    },
    {
      label: 'Blocked Threats',
      value: telemetry !== null ? String(telemetry.blockedThreatsCount) : '—',
      icon: LockKeyhole,
      tone: 'amber',
      trend: 'Blocked IPs',
      loading: telemetry === null,
      compact: true,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Super Admin Modules"
        subtitle="Module catalogue & policy registry for CMS, security, API governance, monitoring, and backups. Status flags persist in PostgreSQL; route access still follows RBAC permissions."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Super Admin Modules' }]}
        actions={<AdminBadge variant="danger">Super Admin</AdminBadge>}
      />

      {/* Cross-Directorate Multi-Hub Bridge */}
      <InstitutionalHubBridge currentHub="admin" className="mb-6" />

      {/* Module Group Switcher Tabs */}
      <section className="grid gap-4 md:grid-cols-3">
        {moduleGroups.map((group) => {
          const isActive = activeGroup === group.name;
          const activeCount = group.modules.filter(
            (m) => (moduleConfigs[m.id]?.status || m.defaultStatus) === 'Live'
          ).length;

          return (
            <button
              key={group.name}
              type="button"
              onClick={() => setActiveGroup(group.name)}
              className={`${adminPanelClass} p-5 text-left transition-all ${
                isActive
                  ? 'border-[#003580] bg-[#003580]/5 shadow-sm ring-1 ring-[#003580]/30'
                  : 'hover:border-[#003580]/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-[var(--text-primary)]">{group.name}</p>
                <AdminBadge variant="success">
                  {activeCount}/{group.modules.length} Live
                </AdminBadge>
              </div>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">{group.description}</p>
            </button>
          );
        })}
      </section>

      {/* Main Governance Grid & Sidebar */}
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminSectionCard
          title={currentGroup.name}
          subtitle={`${currentGroup.modules.length} governed subsystems — click a card to inspect configuration, update status, or launch the route.`}
          action={
            <button
              type="button"
              onClick={() => setShowGroupModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] hover:bg-[#002866] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition-all shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Configure Group</span>
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {currentGroup.modules.map((module) => {
              const Icon = module.icon;
              const cfg = moduleConfigs[module.id] || {
                status: module.defaultStatus,
                enabled: true,
                requiredRole: 'SUPER_ADMIN',
                auditLogged: true,
              };

              return (
                <div
                  key={module.id}
                  onClick={() => handleOpenModuleModal(module)}
                  className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 hover:bg-[var(--bg-card)] hover:border-[#003580]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-card)] text-[#003580] shadow-xs border border-[var(--border-color)] group-hover:scale-105 transition-transform">
                        <Icon className="h-5 w-5" />
                      </span>
                      <AdminBadge variant={statusBadgeVariant[cfg.status]}>{cfg.status}</AdminBadge>
                    </div>

                    <h3 className="mt-3 text-sm font-extrabold text-[var(--text-primary)] group-hover:text-[#003580] transition-colors">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                      {module.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-[var(--text-muted)]">
                      {cfg.enabled === false ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-[var(--text-muted)]" /> Disabled
                        </>
                      ) : cfg.auditLogged ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Audit Logged
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-amber-500" /> Audit Off
                        </>
                      )}
                    </span>
                    <span className="text-[#003580] group-hover:underline flex items-center gap-0.5 font-extrabold">
                      Manage →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminSectionCard>

        {/* Right Sidebar: System Monitoring & Security Center */}
        <aside className="space-y-5">
          <AdminSectionCard
            title="System Telemetry"
            subtitle="Live platform health signals."
            action={
              <button
                type="button"
                onClick={handleRefreshTelemetry}
                disabled={isRefreshingTelemetry}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)] transition-colors"
                title="Refresh Telemetry"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingTelemetry ? 'animate-spin' : ''}`} />
              </button>
            }
          >
            <AdminStatGrid
              stats={telemetryStats.map((stat) => {
                const card: React.ComponentProps<typeof AdminStatCard> = {
                  label: stat.label,
                  value: stat.value,
                  icon: stat.icon,
                  tone: stat.tone,
                  trend: stat.trend,
                  loading: stat.loading,
                  compact: true,
                };
                return card;
              })}
              cols={2}
              compact
            />
          </AdminSectionCard>

          <AdminSectionCard title="Security Governance" subtitle="Toggle platform security policies.">
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer">
                <span>Enforce MFA for Admin Roles</span>
                <input
                  type="checkbox"
                  checked={mfaEnforced}
                  onChange={() => handleToggleSecuritySetting('mfa')}
                  className="h-4 w-4 accent-[#003580] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer">
                <span>Audit CSV/PDF Data Exports</span>
                <input
                  type="checkbox"
                  checked={exportAudited}
                  onChange={() => handleToggleSecuritySetting('export')}
                  className="h-4 w-4 accent-[#003580] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer">
                <span>Automated API Key Rotation</span>
                <input
                  type="checkbox"
                  checked={keyRotation}
                  onChange={() => handleToggleSecuritySetting('keyRot')}
                  className="h-4 w-4 accent-[#003580] rounded cursor-pointer"
                />
              </label>
            </div>
          </AdminSectionCard>
        </aside>
      </section>

      {/* Modal 1: Single Module Governance Configuration Modal */}
      {selectedModule &&
        createPortal(
          <div
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedModule(null);
            }}
          >
            <div className="bg-[var(--bg-card)] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[var(--border-color)] space-y-5 animate-in zoom-in-95 duration-200 text-[var(--text-primary)]">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#003580]/10 text-[#003580] flex items-center justify-center border border-[#003580]/20 font-bold shadow-sm">
                    {React.createElement(selectedModule.icon, { className: 'h-6 w-6' })}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003580] block">
                      Subsystem Governance
                    </span>
                    <h3 className="text-lg font-black text-[var(--text-primary)]">{selectedModule.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)] rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Module Description Box */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] leading-relaxed">
                {selectedModule.description}
              </div>

              {/* Controls Form */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                    Deployment Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as ModuleStatus)}
                    className="w-full text-xs p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] font-extrabold text-[var(--text-primary)] focus:border-[#003580] focus:outline-none"
                  >
                    <option value="Live">🟢 Live (Active System Route)</option>
                    <option value="Configured">🔵 Configured (Role Scoped)</option>
                    <option value="Needs Review">🟡 Needs Review (Pending Audit)</option>
                    <option value="Planned">⚪ Planned (Future Release)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                      Required Access Role
                    </label>
                    <select
                      value={modalRole}
                      onChange={(e) => setModalRole(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] font-bold text-[var(--text-primary)] focus:border-[#003580] focus:outline-none"
                    >
                      <option value="SUPER_ADMIN">Super Admin Only</option>
                      <option value="ADMIN">Full Administrator</option>
                      <option value="CMS_MANAGER">CMS Manager</option>
                      <option value="ALUMNI_OFFICE">Alumni Office</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                      Module Availability
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] font-bold text-[var(--text-primary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modalEnabled}
                        onChange={(e) => setModalEnabled(e.target.checked)}
                        className="h-4 w-4 accent-[#003580]"
                      />
                      <span>Module Enabled</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                    Audit Logging
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] font-bold text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalAudit}
                      onChange={(e) => setModalAudit(e.target.checked)}
                      className="h-4 w-4 accent-[#003580]"
                    />
                    <span>Log Mutations</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => {
                    navigate(selectedModule.route);
                    setSelectedModule(null);
                  }}
                  className="w-full py-3 rounded-xl bg-[var(--bg-page)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-extrabold transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4 text-[#003580]" />
                  <span>Launch / Open Subsystem Page ({selectedModule.route})</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedModule(null)}
                    className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModuleConfig}
                    className="flex-1 py-3 rounded-xl bg-[#003580] hover:bg-[#002866] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Settings2 className="h-4 w-4" />
                    <span>Save Governance</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal 2: Bulk Group Governance Configuration Modal */}
      {showGroupModal &&
        createPortal(
          <div
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowGroupModal(false);
            }}
          >
            <div className="bg-[var(--bg-card)] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[var(--border-color)] space-y-5 animate-in zoom-in-95 duration-200 text-[var(--text-primary)]">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="h-5 w-5 text-[#003580]" />
                  <h3 className="text-base font-black text-[var(--text-primary)]">Configure "{activeGroup}"</h3>
                </div>
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)] rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Apply bulk deployment status updates across all {currentGroup.modules.length} governed subsystems in{' '}
                <strong className="text-[var(--text-primary)]">{activeGroup}</strong>.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleConfigureGroupBulk('Live')}
                  className="w-full py-3 px-4 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-800 text-xs font-extrabold transition-all flex items-center justify-between"
                >
                  <span>Mark All Subsystems as 🟢 Live</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleConfigureGroupBulk('Configured')}
                  className="w-full py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-800 text-xs font-extrabold transition-all flex items-center justify-between"
                >
                  <span>Mark All Subsystems as 🔵 Configured</span>
                  <Settings2 className="h-4 w-4 text-blue-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleConfigureGroupBulk('Needs Review')}
                  className="w-full py-3 px-4 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-amber-800 text-xs font-extrabold transition-all flex items-center justify-between"
                >
                  <span>Mark All Subsystems as 🟡 Needs Review</span>
                  <Activity className="h-4 w-4 text-amber-600" />
                </button>
              </div>

              <div className="pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="w-full py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-colors"
                >
                  Close Group Settings
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
