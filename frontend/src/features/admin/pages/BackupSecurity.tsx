import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Globe2,
  KeyRound,
  Laptop2,
  Plus,
  RefreshCcw,
  RotateCcw,
  Shield,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import { toast } from 'react-hot-toast';

type BackupFrequency = 'Daily' | 'Weekly' | 'Monthly';
type BackupStatus = 'Success' | 'Failed' | 'In Progress';

type BackupRecord = {
  date: string;
  size: string;
  status: BackupStatus;
  file: string;
};

type SessionRecord = {
  user: string;
  ip: string;
  device: string;
  location: string;
  loginTime: string;
};

type ApiKeyRecord = {
  name: string;
  created: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
};

const initialBackupHistory: BackupRecord[] = [
  { date: '2026-05-29 03:00 AM', size: '2.4 GB', status: 'Success', file: 'backup-2026-05-29.sql.gz' },
  { date: '2026-05-28 03:00 AM', size: '2.2 GB', status: 'Success', file: 'backup-2026-05-28.sql.gz' },
  { date: '2026-05-27 03:00 AM', size: '2.3 GB', status: 'Failed', file: 'backup-2026-05-27.sql.gz' },
];

const initialActiveSessions: SessionRecord[] = [
  { user: 'admin@astu.edu.et', ip: '154.78.22.14', device: 'Chrome / Windows', location: 'Addis Ababa', loginTime: new Date().toLocaleString() },
];

const initialApiKeys: ApiKeyRecord[] = [
  { name: 'Production API Key', created: '2026-01-12', lastUsed: new Date().toLocaleDateString(), status: 'Active' },
];

const whitelistSeeds = ['154.78.22.14', '154.78.22.18', '10.0.2.15'];

function backupStatusClass(status: BackupStatus) {
  switch (status) {
    case 'Success':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Failed':
      return 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15';
    case 'In Progress':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function apiStatusClass(status: ApiKeyRecord['status']) {
  return status === 'Active'
    ? 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15'
    : 'bg-slate-100 text-slate-600 border-slate-200';
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function miniStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003580]/10 text-[#003580]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function BackupSecurity() {
  const [schedule, setSchedule] = useState<BackupFrequency>('Daily');
  const [time, setTime] = useState('03:00');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  const [generateKeyOpen, setGenerateKeyOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('Reporting API Key');
  const [rateLimit, setRateLimit] = useState(120);
  const [whitelist, setWhitelist] = useState<string[]>(whitelistSeeds);
  const [ipInput, setIpInput] = useState('');
  
  const [backupHistory, setBackupHistory] = useState(initialBackupHistory);
  const [activeSessions, setActiveSessions] = useState(initialActiveSessions);
  const [apiKeys, setApiKeys] = useState(initialApiKeys);

  const backupSummary = 'Today, 03:00 AM — 2.4 GB — ✅ Success';
  const lastBackupTime = backupHistory[0];

  const backupStats = useMemo(() => {
    return [
      { label: 'Database Backups', value: '4', icon: UploadCloud },
      { label: 'Active Sessions', value: `${activeSessions.length}`, icon: Laptop2 },
      { label: 'API Keys', value: `${apiKeys.length}`, icon: KeyRound },
      { label: 'Whitelisted IPs', value: `${whitelist.length}`, icon: Globe2 },
    ];
  }, [whitelist.length]);

  const runBackup = () => {
    setConfirmOpen(false);
    const newBackup: BackupRecord = {
      date: new Date().toLocaleString(),
      size: '2.4 GB',
      status: 'Success',
      file: `backup-${new Date().toISOString().split('T')[0]}.sql.gz`
    };
    setBackupHistory(prev => [newBackup, ...prev]);
    toast.success('Backup completed successfully.');
  };

  const revokeAllSessions = () => {
    setRevokeAllOpen(false);
    setActiveSessions([]);
    toast.success('All sessions revoked successfully.');
  };

  const createApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Key name is required');
      return;
    }
    setGenerateKeyOpen(false);
    const newKey: ApiKeyRecord = {
      name: newKeyName,
      created: new Date().toLocaleDateString(),
      lastUsed: 'Never',
      status: 'Active'
    };
    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    toast.success(`API key "${newKey.name}" created successfully.`);
  };

  const revokeSession = (user: string) => {
    setActiveSessions(prev => prev.filter(s => s.user !== user));
    toast.success(`Session for ${user} revoked.`);
  };

  const revokeApiKey = (name: string) => {
    setApiKeys(prev => prev.map(k => k.name === name ? { ...k, status: 'Revoked' } : k));
    toast.success(`API key "${name}" revoked.`);
  };

  const addWhitelistIp = () => {
    if (!ipInput.trim()) return;
    setWhitelist((current) => Array.from(new Set([...current, ipInput.trim()])));
    setIpInput('');
  };

  const removeWhitelistIp = (ip: string) => {
    setWhitelist((current) => current.filter((item) => item !== ip));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Backup & Security"
        subtitle="Manage backup routines, recovery, and protection settings."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Backup & Security' }]}
        actions={<AdminBadge variant="success">Security Enabled</AdminBadge>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {backupStats.map((card) => (
          <React.Fragment key={card.label}>{miniStat(card)}</React.Fragment>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Database Backups" subtitle="Schedule and maintain database backup operations.">
          <div className="space-y-4">
            <div className="rounded-[10px] border border-[#1D9E75]/15 bg-[#1D9E75]/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Last backup</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{backupSummary}</p>
                </div>
                <AdminBadge variant="success">Healthy</AdminBadge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Schedule</span>
                <select
                  value={schedule}
                  onChange={(event) => setSchedule(event.target.value as BackupFrequency)}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                >
                  {['Daily', 'Weekly', 'Monthly'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Time</span>
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                />
              </label>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Date', 'Size', 'Status', 'Download', 'Restore'].map((head) => (
                        <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {backupHistory.map((backup) => (
                      <tr key={backup.file} className="border-t border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-3 text-slate-600">{backup.date}</td>
                        <td className="px-4 py-3 text-slate-600">{backup.size}</td>
                        <td className="px-4 py-3">
                          <AdminBadge variant="success" className={backupStatusClass(backup.status)}>
                            {backup.status}
                          </AdminBadge>
                        </td>
                        <td className="px-4 py-3">
                          <button type="button" className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button type="button" className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 px-3 py-2 text-xs font-semibold text-[#003580] hover:bg-[#003580]/5">
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                <RefreshCcw className="h-4 w-4" />
                Run Backup Now
              </button>
              <div className="text-xs text-slate-500">
                Next backup: {schedule} at {time}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Security Settings" subtitle="Sessions, API access, rate limits, and IP allowlists.">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-900">Active Sessions</h4>
                <button
                  type="button"
                  onClick={() => setRevokeAllOpen(true)}
                  className="rounded-[8px] border border-[#E24B4A]/20 px-4 py-2 text-sm font-semibold text-[#E24B4A] hover:bg-rose-50"
                >
                  Revoke All Sessions
                </button>
              </div>
              <div className="mt-3 overflow-hidden rounded-[10px] border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {['User', 'IP', 'Device', 'Location', 'Login Time', ''].map((head) => (
                          <th key={head} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeSessions.map((session) => (
                        <tr key={`${session.user}-${session.ip}`} className="border-t border-slate-100 hover:bg-slate-50/70">
                          <td className="px-3 py-3 text-slate-700">{session.user}</td>
                          <td className="px-3 py-3 text-slate-600">{session.ip}</td>
                          <td className="px-3 py-3 text-slate-600">{session.device}</td>
                          <td className="px-3 py-3 text-slate-600">{session.location}</td>
                          <td className="px-3 py-3 text-slate-600">{session.loginTime}</td>
                          <td className="px-3 py-3">
                            <button type="button" className="rounded-[8px] border border-[#E24B4A]/20 px-3 py-2 text-xs font-semibold text-[#E24B4A] hover:bg-rose-50">
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-900">API Keys</h4>
                <button
                  type="button"
                  onClick={() => setGenerateKeyOpen(true)}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-4 w-4" />
                  Generate New API Key
                </button>
              </div>
              <div className="mt-3 overflow-hidden rounded-[10px] border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Key Name', 'Created', 'Last Used', 'Status', ''].map((head) => (
                          <th key={head} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key) => (
                        <tr key={key.name} className="border-t border-slate-100 hover:bg-slate-50/70">
                          <td className="px-3 py-3 text-slate-700">{key.name}</td>
                          <td className="px-3 py-3 text-slate-600">{key.created}</td>
                          <td className="px-3 py-3 text-slate-600">{key.lastUsed}</td>
                          <td className="px-3 py-3">
                            <AdminBadge variant="success" className={apiStatusClass(key.status)}>
                              {key.status}
                            </AdminBadge>
                          </td>
                          <td className="px-3 py-3">
                            <button type="button" className="rounded-[8px] border border-[#E24B4A]/20 px-3 py-2 text-xs font-semibold text-[#E24B4A] hover:bg-rose-50">
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-900">Rate Limiting</h4>
                  <AdminBadge variant="neutral">API Protection</AdminBadge>
                </div>
                <div className="mt-3">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Max requests per minute</span>
                    <input
                      type="number"
                      value={rateLimit}
                      onChange={(event) => setRateLimit(Number(event.target.value))}
                      className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-900">IP Whitelist</h4>
                  <AdminBadge variant="neutral">{whitelist.length} allowed</AdminBadge>
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={ipInput}
                    onChange={(event) => setIpInput(event.target.value)}
                    placeholder="Add IP address"
                    className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                  />
                  <button
                    type="button"
                    onClick={addWhitelistIp}
                    className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {whitelist.map((ip) => (
                    <button
                      key={ip}
                      type="button"
                      onClick={() => removeWhitelistIp(ip)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {ip}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <AdminModal
        open={confirmOpen}
        title="Run Backup Now"
        onClose={() => setConfirmOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={runBackup}
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Confirm
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          This will trigger a manual database backup immediately. The latest backup summary is {lastBackupTime.size} from {lastBackupTime.date}.
        </p>
      </AdminModal>

      <AdminModal
        open={revokeAllOpen}
        title="Revoke All Sessions"
        onClose={() => setRevokeAllOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setRevokeAllOpen(false)}
              className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={revokeAllSessions}
              className="rounded-[8px] bg-[#E24B4A] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Revoke All
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          This will invalidate all active sessions across the system. Users will be required to sign in again.
        </p>
      </AdminModal>

      <AdminModal
        open={generateKeyOpen}
        title="Generate New API Key"
        onClose={() => setGenerateKeyOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setGenerateKeyOpen(false)}
              className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createApiKey}
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Generate
            </button>
          </div>
        }
      >
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Key Name</span>
          <input
            value={newKeyName}
            onChange={(event) => setNewKeyName(event.target.value)}
            className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
          />
        </label>
      </AdminModal>
    </div>
  );
}
