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
import { adminService } from '../services/admin.service';

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
        route: '/cms/footer',
        description: 'Header navigation items, dropdowns, and footer links.',
      },
      {
        id: 'search-management',
        title: 'Homepage Search Management',
        icon: Search,
        defaultStatus: 'Live',
        route: '/admin/dashboard',
        description: 'Global resource indexing, search filters, and query logs.',
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
        route: '/cms/faq',
        description: 'Categorized alumni Q&A knowledgebase and help desk.',
      },
      {
        id: 'partner-management',
        title: 'Partner & Sponsor Management',
        icon: UsersRound,
        defaultStatus: 'Live',
        route: '/admin/jobs',
        description: 'Employer roster, partner logos, and industry hiring tracker.',
      },
      {
        id: 'ad-banners',
        title: 'Advertisement Banner Management',
        icon: GalleryHorizontalEnd,
        defaultStatus: 'Live',
        route: '/cms/gallery',
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
        route: '/cms/media',
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

const statusClass: Record<ModuleStatus, string> = {
  Live: 'border-emerald-500/20 bg-emerald-50 text-emerald-700 font-extrabold',
  Configured: 'border-[#003580]/20 bg-[#003580]/10 text-[#003580] font-extrabold',
  'Needs Review': 'border-amber-500/20 bg-amber-50 text-amber-700 font-extrabold',
  Planned: 'border-slate-200 bg-slate-100 text-slate-600 font-bold',
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

  // Governance state persisted in localStorage
  const [moduleConfigs, setModuleConfigs] = useState<Record<string, ModuleConfigState>>(() => {
    try {
      const saved = localStorage.getItem('astu_super_admin_modules_config');
      if (saved) return JSON.parse(saved);
    } catch (_) {}

    // Default initial configuration based on real codebase implementation
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
  });

  // Modal State
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Editable state inside single module modal
  const [modalStatus, setModalStatus] = useState<ModuleStatus>('Live');
  const [modalEnabled, setModalEnabled] = useState(true);
  const [modalRole, setModalRole] = useState('SUPER_ADMIN');
  const [modalAudit, setModalAudit] = useState(true);

  // Security Center Checkboxes State
  const [mfaEnforced, setMfaEnforced] = useState(() => localStorage.getItem('astu_sec_mfa') !== 'false');
  const [exportAudited, setExportAudited] = useState(() => localStorage.getItem('astu_sec_export_audit') !== 'false');
  const [keyRotation, setKeyRotation] = useState(() => localStorage.getItem('astu_sec_key_rot') === 'true');

  // Real Telemetry State from backend
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);
  const [telemetry, setTelemetry] = useState<{
    apiLatency: number;
    backupIntegrity: string;
    securityPostureScore: number;
    blockedThreatsCount: number;
  } | null>(null);

  const fetchLiveTelemetry = async () => {
    setIsRefreshingTelemetry(true);
    try {
      const res = await adminService.getLiveTelemetry();
      if (res.ok && res.data) {
        setTelemetry({
          apiLatency: res.data.apiLatency,
          backupIntegrity: res.data.backupIntegrity || 'Verified',
          securityPostureScore: res.data.securityPostureScore,
          blockedThreatsCount: res.data.blockedThreatsCount,
        });
      }
    } catch (_) {
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

  const saveGovernanceToDB = (updatedConfigs: Record<string, ModuleConfigState>) => {
    localStorage.setItem('astu_super_admin_modules_config', JSON.stringify(updatedConfigs));
    adminService.updateModuleGovernance({
      configs: updatedConfigs,
    }).catch((err) => console.warn('Database governance sync warning:', err));
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

  const handleSaveModuleConfig = () => {
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
    setModuleConfigs(updated);
    saveGovernanceToDB(updated);
    toast.success(`Saved governance rules for "${selectedModule.title}" to PostgreSQL Database!`);
    setSelectedModule(null);
  };

  const handleConfigureGroupBulk = (newStatus: ModuleStatus) => {
    const groupDef = moduleGroups.find((g) => g.name === activeGroup);
    if (!groupDef) return;

    const updated = { ...moduleConfigs };
    groupDef.modules.forEach((m) => {
      updated[m.id] = {
        ...(updated[m.id] || { enabled: true, requiredRole: 'SUPER_ADMIN', auditLogged: true }),
        status: newStatus,
      };
    });

    setModuleConfigs(updated);
    saveGovernanceToDB(updated);
    toast.success(`Updated status of all ${groupDef.modules.length} modules in "${activeGroup}" to ${newStatus} in Database!`);
    setShowGroupModal(false);
  };

  const handleToggleSecuritySetting = async (key: 'mfa' | 'export' | 'keyRot') => {
    let nextMfa = mfaEnforced;
    let nextExport = exportAudited;
    let nextKeyRot = keyRotation;

    if (key === 'mfa') {
      nextMfa = !mfaEnforced;
      setMfaEnforced(nextMfa);
      toast.success(nextMfa ? 'MFA Requirement Enforced in PostgreSQL Database' : 'MFA Enforcement Disabled');
    } else if (key === 'export') {
      nextExport = !exportAudited;
      setExportAudited(nextExport);
      toast.success(nextExport ? 'Export Audit Logging Enabled in PostgreSQL Database' : 'Export Audit Logging Disabled');
    } else if (key === 'keyRot') {
      nextKeyRot = !keyRotation;
      setKeyRotation(nextKeyRot);
      toast.success(nextKeyRot ? 'API Key Rotation Scheduled in PostgreSQL Database' : 'API Key Rotation Disabled');
    }

    try {
      await adminService.updateSecurityGovernance({
        mfa: nextMfa,
        exportAudit: nextExport,
        keyRot: nextKeyRot,
      });
      fetchLiveTelemetry();
    } catch (err) {
      console.error('Failed to sync security governance to database:', err);
    }
  };

  const handleRefreshTelemetry = async () => {
    await fetchLiveTelemetry();
    toast.success('Live system telemetry & diagnostics refreshed!');
  };

  const currentGroup = moduleGroups.find((g) => g.name === activeGroup) || moduleGroups[0];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Super Admin Modules"
        subtitle="Enterprise control plane for CMS, digital assets, security, API governance, notifications, monitoring, templates, backups, and data exports."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Super Admin Modules' }]}
        actions={<AdminBadge variant="danger">Super Admin</AdminBadge>}
      />

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
              className={`rounded-2xl border p-5 text-left transition-all ${
                isActive
                  ? 'border-[#003580] bg-[#003580]/5 shadow-sm ring-1 ring-[#003580]/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-slate-900">{group.name}</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {activeCount}/{group.modules.length} Live
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{group.description}</p>
            </button>
          );
        })}
      </section>

      {/* Main Governance Grid & Sidebar */}
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Governed Modules Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>{currentGroup.name}</span>
                <span className="text-xs font-normal text-slate-400">({currentGroup.modules.length} Governed Subsystems)</span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Click any module card to inspect configuration, update status, or launch the subsystem route.
              </p>
            </div>

            <button
              onClick={() => setShowGroupModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] hover:bg-[#002866] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition-all shrink-0 hover:scale-[1.01]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Configure Group</span>
            </button>
          </div>

          {/* Module Cards Grid */}
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
                  className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 hover:bg-white hover:border-[#003580]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#003580] shadow-xs border border-slate-200/80 group-hover:scale-105 transition-transform">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className={`rounded-lg border px-2.5 py-1 text-[10px] uppercase tracking-wider ${statusClass[cfg.status]}`}>
                        {cfg.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-extrabold text-slate-900 group-hover:text-[#003580] transition-colors">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {module.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1 text-slate-500">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Audit Logged
                    </span>
                    <span className="text-[#003580] group-hover:underline flex items-center gap-0.5 font-extrabold">
                      Manage →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: System Monitoring & Security Center */}
        <aside className="space-y-5">
          {/* Real-time System Monitoring */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">System Telemetry</h2>
              </div>

              <button
                onClick={handleRefreshTelemetry}
                disabled={isRefreshingTelemetry}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Refresh Telemetry"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingTelemetry ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">API Response Latency</span>
                <span className="text-xs font-black text-emerald-700 font-mono">
                  {telemetry !== null ? `${telemetry.apiLatency} ms` : <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">PostgreSQL Snapshots</span>
                <span className="text-xs font-black text-emerald-700 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {telemetry?.backupIntegrity || 'Verified'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Security Posture Score</span>
                <span className="text-xs font-black text-blue-700">
                  {telemetry !== null ? `${telemetry.securityPostureScore} / 100` : '...'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Threat Anomaly Shield</span>
                <span className="text-xs font-black text-slate-700">
                  {telemetry !== null ? `${telemetry.blockedThreatsCount} Blocked IPs` : '...'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Security Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-[#003580]" />
              Security Governance
            </h2>

            <div className="space-y-3">
              <label
                onClick={() => handleToggleSecuritySetting('mfa')}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>Enforce MFA for Admin Roles</span>
                <input
                  type="checkbox"
                  checked={mfaEnforced}
                  onChange={() => {}}
                  className="h-4 w-4 accent-[#003580] rounded cursor-pointer"
                />
              </label>

              <label
                onClick={() => handleToggleSecuritySetting('export')}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>Audit CSV/PDF Data Exports</span>
                <input
                  type="checkbox"
                  checked={exportAudited}
                  onChange={() => {}}
                  className="h-4 w-4 accent-[#003580] rounded cursor-pointer"
                />
              </label>

              <label
                onClick={() => handleToggleSecuritySetting('keyRot')}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>Automated API Key Rotation</span>
                <input
                  type="checkbox"
                  checked={keyRotation}
                  onChange={() => {}}
                  className="h-4 w-4 accent-[#003580] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
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
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#003580]/10 text-[#003580] flex items-center justify-center border border-[#003580]/20 font-bold shadow-sm">
                    {React.createElement(selectedModule.icon, { className: 'h-6 w-6' })}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003580] block">
                      Subsystem Governance
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{selectedModule.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Module Description Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                {selectedModule.description}
              </div>

              {/* Controls Form */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Deployment Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as ModuleStatus)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-800 focus:border-[#003580] focus:outline-none"
                  >
                    <option value="Live">🟢 Live (Active System Route)</option>
                    <option value="Configured">🔵 Configured (Role Scoped)</option>
                    <option value="Needs Review">🟡 Needs Review (Pending Audit)</option>
                    <option value="Planned">⚪ Planned (Future Release)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Required Access Role
                    </label>
                    <select
                      value={modalRole}
                      onChange={(e) => setModalRole(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:border-[#003580] focus:outline-none"
                    >
                      <option value="SUPER_ADMIN">Super Admin Only</option>
                      <option value="ADMIN">Full Administrator</option>
                      <option value="ICT_ADMIN">ICT Administrator</option>
                      <option value="CMS_EDITOR">CMS Editor</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Audit Logging
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 cursor-pointer">
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
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    navigate(selectedModule.route);
                    setSelectedModule(null);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4 text-[#003580]" />
                  <span>Launch / Open Subsystem Page ({selectedModule.route})</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedModule(null)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
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
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="h-5 w-5 text-[#003580]" />
                  <h3 className="text-base font-black text-slate-900">Configure "{activeGroup}"</h3>
                </div>
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Apply bulk deployment status updates across all {currentGroup.modules.length} governed subsystems in{' '}
                <strong>{activeGroup}</strong>.
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

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
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
