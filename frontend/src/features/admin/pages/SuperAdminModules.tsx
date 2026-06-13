import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, Archive, AppWindow, BarChart, BarChart2, BellRing, Blocks, Brush, Calendar, CheckCircle, ClipboardCheck, CloudCog, Code2, DatabaseBackup, Edit, FileCheck, FileCode, FileQuestion, GalleryHorizontal, Globe2, HardDrive, Handshake, History, KeyRound, Layers3, LockKeyhole, MailCheck, MenuSquare, MessageCircle, Mic, MonitorDot, Newspaper, Palette, PanelTop, Plus, RefreshCw, Search, SearchCode, Shield, ShieldAlert, Share2, SlidersHorizontal, Ticket, ThumbsUp, Upload, UserCog, UsersRound, Video, Settings, Zap, Lock, Globe, Server, Cpu, Network, ShieldCheck } from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import { adminApi } from '../api/adminApi';

type ModuleStatus = 'Live' | 'Configured' | 'Needs Review' | 'Planned';
type ModuleGroupName = typeof moduleGroups[number]['name'];

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
      { title: 'Digital Asset Library', icon: HardDrive, status: 'Configured' },
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
      { title: 'Security Center', icon: Shield, status: 'Needs Review' },
      { title: 'Login History', icon: LockKeyhole, status: 'Live' },
      { title: 'Data Export Center', icon: CloudCog, status: 'Configured' },
    ],
  },
] as const;

const statusClass: Record<ModuleStatus, string> = {
  Live: 'border-[#1D9E75]/30 bg-[#1D9E75]/10 text-[#1D9E75] shadow-[0_0_12px_rgba(29,158,117,0.15)]',
  Configured: 'border-[#003580]/30 bg-[#003580]/10 text-[#003580] shadow-[0_0_12px_rgba(0,53,128,0.15)]',
  'Needs Review': 'border-[#E8A020]/30 bg-[#E8A020]/10 text-[#B87900] shadow-[0_0_12px_rgba(232,160,32,0.15)]',
  Planned: 'border-slate-300/50 bg-slate-100/80 text-slate-500',
};

const statusIcon: Record<ModuleStatus, any> = {
  Live: CheckCircle,
  Configured: Settings,
  'Needs Review': AlertCircle,
  Planned: Archive,
};

export default function SuperAdminModules() {
  const [dynamicGroups, setDynamicGroups] = useState<typeof moduleGroups>(moduleGroups);
  const [activeGroup, setActiveGroup] = useState<ModuleGroupName>(moduleGroups[0].name);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadModules() {
      try {
        setLoading(true);
        const res = await adminApi.getModules();
        const modulesList = res?.modules || res?.data?.modules || res?.data || [];
        if (Array.isArray(modulesList) && modulesList.length > 0) {
          const updatedGroups = moduleGroups.map((group) => {
            const updatedModules = group.modules.map((mod) => {
              const match = modulesList.find(
                (bm: any) =>
                  bm.name?.toLowerCase() === mod.title.toLowerCase() ||
                  bm.title?.toLowerCase() === mod.title.toLowerCase()
              );
              if (match) {
                let mappedStatus: ModuleStatus = 'Configured';
                const statusUpper = String(match.status).toUpperCase();
                if (statusUpper === 'ACTIVE' || statusUpper === 'LIVE') mappedStatus = 'Live';
                else if (statusUpper === 'CONFIGURED') mappedStatus = 'Configured';
                else if (statusUpper === 'NEEDS_REVIEW' || statusUpper === 'NEEDS REVIEW') mappedStatus = 'Needs Review';
                else if (statusUpper === 'PLANNED') mappedStatus = 'Planned';
                return { ...mod, status: mappedStatus };
              }
              return mod;
            });
            return { ...group, modules: updatedModules as any };
          });
          setDynamicGroups(updatedGroups as any);
        }
      } catch (err) {
        console.error('Failed to load super admin modules from backend:', err);
      } finally {
        setLoading(false);
      }
    }
    loadModules();
  }, []);

  const selectedGroup = dynamicGroups.find((group) => group.name === activeGroup) ?? dynamicGroups[0];

  const handleConfigureGroup = () => {
    console.log('Configure group:', activeGroup);
  };

  const handleModuleClick = (moduleTitle: string) => {
    console.log('Module clicked:', moduleTitle);
  };

  return (
    <div className="space-y-8">
      {/* Custom Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003580] via-[#004499] to-[#1D9E75] p-8 shadow-[0_8px_30px_rgba(0,51,128,0.3)]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_0%,transparent_40%,rgba(232,160,32,0.08)_60%,transparent_100%)]" />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                <ShieldCheck className="h-6 w-6 text-[#E8A020]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Modules</h1>
                <p className="mt-1 text-sm text-white/80">
                  Enterprise control plane for CMS, digital assets, security, API governance, notifications, monitoring, templates, backups, and data exports.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <AdminBadge variant="danger" className="border-white/20 bg-white/10 text-white">Super Admin</AdminBadge>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-xs text-white/70">Total Modules: {dynamicGroups.reduce((acc, group) => acc + group.modules.length, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Group Selection */}
      <section className="grid gap-5 md:grid-cols-3">
        {dynamicGroups.map((group) => (
          <button
            key={group.name}
            type="button"
            onClick={() => setActiveGroup(group.name)}
            className={`group relative overflow-hidden rounded-xl border p-6 text-left transition-all duration-300 ${
              activeGroup === group.name
                ? 'border-[#003580]/50 bg-gradient-to-br from-[#003580]/5 to-[#004499]/5 shadow-[0_4px_20px_rgba(0,51,128,0.15)] ring-1 ring-[#003580]/20'
                : 'border-slate-200 bg-white hover:border-[#003580]/30 hover:shadow-[0_4px_20px_rgba(0,51,128,0.08)]'
            }`}
          >
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-900 group-hover:text-[#003580] transition-colors">{group.name}</p>
              <p className="mt-2 text-xs text-slate-500">{group.modules.length} governed modules</p>
            </div>
            {activeGroup === group.name && (
              <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#E8A020] shadow-[0_0_8px_rgba(232,160,32,0.6)] animate-pulse" />
            )}
          </button>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_380px]">
        {/* Main Module Grid */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selectedGroup.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Configure access, publishing state, automation, and review ownership.</p>
            </div>
            <button
              type="button"
              onClick={handleConfigureGroup}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
              Configure Group
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {selectedGroup.modules.map((module) => {
              const Icon = module.icon;
              const StatusIcon = statusIcon[module.status as ModuleStatus];
              return (
                <button
                  key={module.title}
                  type="button"
                  onClick={() => handleModuleClick(module.title)}
                  className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-5 text-left transition-all duration-300 hover:border-[#003580]/40 hover:shadow-[0_8px_25px_rgba(0,51,128,0.12)] hover:scale-[1.02]"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#003580] shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-200/50 group-hover:ring-[#003580]/30 transition-all">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${statusClass[module.status as ModuleStatus]}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {module.status}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900 group-hover:text-[#003580] transition-colors">{module.title}</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">Role scoped, audit logged, and ready for accreditation review.</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#003580]/0 to-[#003580]/0 opacity-0 transition-opacity duration-300 group-hover:from-[#003580]/3 group-hover:to-[#004499]/3 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* System Monitoring */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D9E75]/10 text-[#1D9E75] ring-1 ring-[#1D9E75]/20">
                <Activity className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">System Monitoring</h2>
            </div>
            <div className="mt-5 space-y-3">
              {[
                ['API latency', '128 ms', 'text-[#1D9E75]'],
                ['Backup integrity', 'Verified', 'text-[#1D9E75]'],
                ['Security posture', '92/100', 'text-[#E8A020]'],
                ['Login anomalies', '2 blocked', 'text-rose-500'],
              ].map(([label, value, colorClass]) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-3 border border-slate-100">
                  <span className="text-sm text-slate-600 font-medium">{label}</span>
                  <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Center */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8A020]/10 text-[#E8A020] ring-1 ring-[#E8A020]/20">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Security Center</h2>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: 'Enforce MFA', checked: true },
                { label: 'Audit every export', checked: true },
                { label: 'API key rotation', checked: false },
              ].map(({ label, checked }) => (
                <label key={label} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 cursor-pointer hover:border-[#003580]/30 hover:bg-slate-50/50 transition-all">
                  <span className="font-medium">{label}</span>
                  <input type="checkbox" defaultChecked={checked} className="h-4.5 w-4.5 accent-[#003580]" />
                </label>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
