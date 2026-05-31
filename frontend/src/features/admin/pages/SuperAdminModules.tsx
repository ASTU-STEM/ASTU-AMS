import React, { useState } from 'react';
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
  FolderArchive,
  Globe2,
  History,
  KeyRound,
  Layers3,
  LockKeyhole,
  MailCheck,
  MessageCircle,
  MonitorDot,
  PanelTop,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';

type ModuleStatus = 'Live' | 'Configured' | 'Needs Review' | 'Planned';

const moduleGroups = [
  {
    name: 'Homepage & CMS',
    modules: [
      { title: 'CMS/Page Builder', icon: Blocks, status: 'Configured' },
      { title: 'Dynamic Homepage Sections', icon: Layers3, status: 'Live' },
      { title: 'Homepage Theme Customization', icon: Brush, status: 'Configured' },
      { title: 'Homepage Menu Management', icon: PanelTop, status: 'Live' },
      { title: 'Homepage Search Management', icon: Search, status: 'Configured' },
      { title: 'SEO Settings', icon: Globe2, status: 'Needs Review' },
      { title: 'Popup & Notice Management', icon: AppWindow, status: 'Live' },
    ],
  },
  {
    name: 'Engagement & Partners',
    modules: [
      { title: 'Contact Message Management', icon: MessageCircle, status: 'Live' },
      { title: 'FAQ Management', icon: FileQuestion, status: 'Configured' },
      { title: 'Partner & Sponsor Management', icon: UsersRound, status: 'Live' },
      { title: 'Advertisement Banner Management', icon: PanelTop, status: 'Needs Review' },
      { title: 'Alumni Success Story Approval', icon: ClipboardCheck, status: 'Live' },
      { title: 'Digital Asset Library', icon: FolderArchive, status: 'Configured' },
    ],
  },
  {
    name: 'Platform Operations',
    modules: [
      { title: 'Activity Logs & Audit Trail', icon: History, status: 'Live' },
      { title: 'Backup & Restore System', icon: DatabaseBackup, status: 'Configured' },
      { title: 'Email/SMS Template Management', icon: MailCheck, status: 'Live' },
      { title: 'Notification Center', icon: BellRing, status: 'Live' },
      { title: 'Role & Permission Management', icon: KeyRound, status: 'Configured' },
      { title: 'API Management', icon: Code2, status: 'Planned' },
      { title: 'System Monitoring Dashboard', icon: MonitorDot, status: 'Live' },
      { title: 'Security Center', icon: ShieldAlert, status: 'Needs Review' },
      { title: 'Login History', icon: LockKeyhole, status: 'Live' },
      { title: 'Data Export Center', icon: CloudCog, status: 'Configured' },
    ],
  },
] as const;

const statusClass: Record<ModuleStatus, string> = {
  Live: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  Configured: 'border-[#003580]/20 bg-[#003580]/10 text-[#003580]',
  'Needs Review': 'border-[#E8A020]/20 bg-[#E8A020]/10 text-[#B87900]',
  Planned: 'border-slate-200 bg-slate-100 text-slate-600',
};

export default function SuperAdminModules() {
  const [activeGroup, setActiveGroup] = useState(moduleGroups[0].name);
  const selectedGroup = moduleGroups.find((group) => group.name === activeGroup) ?? moduleGroups[0];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Super Admin Modules"
        subtitle="Enterprise control plane for CMS, digital assets, security, API governance, notifications, monitoring, templates, backups, and data exports."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Super Admin Modules' }]}
        actions={<AdminBadge variant="danger">Super Admin</AdminBadge>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {moduleGroups.map((group) => (
          <button
            key={group.name}
            type="button"
            onClick={() => setActiveGroup(group.name)}
            className={`rounded-[10px] border p-5 text-left transition-all ${activeGroup === group.name ? 'border-[#003580] bg-[#003580]/5' : 'border-slate-200 bg-white hover:border-[#003580]/30'}`}
          >
            <p className="text-sm font-semibold text-slate-900">{group.name}</p>
            <p className="mt-2 text-xs text-slate-500">{group.modules.length} governed modules</p>
          </button>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{selectedGroup.name}</h2>
              <p className="mt-1 text-xs text-slate-500">Configure access, publishing state, automation, and review ownership.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white">
              <SlidersHorizontal className="h-4 w-4" />
              Configure Group
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {selectedGroup.modules.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.title} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-white text-[#003580] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${statusClass[module.status as ModuleStatus]}`}>{module.status}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{module.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">Role scoped, audit logged, and ready for accreditation review.</p>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#1D9E75]" />
              <h2 className="text-sm font-semibold text-slate-900">System Monitoring</h2>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ['API latency', '128 ms'],
                ['Backup integrity', 'Verified'],
                ['Security posture', '92/100'],
                ['Login anomalies', '2 blocked'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-[8px] bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="text-sm font-semibold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-slate-900">Security Center</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-[8px] border border-slate-200 px-3 py-2 text-sm text-slate-700">
                Enforce MFA
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#003580]" />
              </label>
              <label className="flex items-center justify-between rounded-[8px] border border-slate-200 px-3 py-2 text-sm text-slate-700">
                Audit every export
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#003580]" />
              </label>
              <label className="flex items-center justify-between rounded-[8px] border border-slate-200 px-3 py-2 text-sm text-slate-700">
                API key rotation
                <input type="checkbox" className="h-4 w-4 accent-[#003580]" />
              </label>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
