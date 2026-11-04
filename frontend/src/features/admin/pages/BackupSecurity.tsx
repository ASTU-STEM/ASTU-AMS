import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  Download,
  Globe2,
  KeyRound,
  Laptop2,
  Plus,
  RefreshCcw,
  RotateCcw,
  UploadCloud,
  X,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminPagination from '../components/AdminPagination';
import AdminEmptyState from '../components/AdminEmptyState';
import AdminStatGrid from '../components/AdminStatGrid';
import AdminSectionCard, { adminInputClass } from '../components/AdminSectionCard';
import { toast } from 'react-hot-toast';
import { adminService } from '../services/admin.service';

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

function backupStatusClass(status: BackupStatus) {
  switch (status) {
    case 'Success':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Failed':
      return 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15';
    case 'In Progress':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    default:
      return 'bg-slate-100 text-[var(--text-secondary)] border-slate-200';
  }
}

function apiStatusClass(status: ApiKeyRecord['status']) {
  return status === 'Active'
    ? 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15'
    : 'bg-slate-100 text-[var(--text-secondary)] border-slate-200';
}

const SectionCard = AdminSectionCard;

export default function BackupSecurity() {
  const [schedule, setSchedule] = useState<BackupFrequency>('Daily');
  const [time, setTime] = useState('03:00');
  const [rateLimit, setRateLimit] = useState(120);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [ipInput, setIpInput] = useState('');

  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionRecord[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);

  // Pagination state
  const [backupPage, setBackupPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [apiKeyPage, setApiKeyPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  const [generateKeyOpen, setGenerateKeyOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<string | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [newKeyName, setNewKeyName] = useState('Reporting API Key');
  const [loading, setLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const configSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await adminService.getBackupSecurity();
        if (res.ok && res.data) {
          if (res.data.backups) setBackupHistory(res.data.backups);
          if (res.data.activeSessions) setActiveSessions(res.data.activeSessions);
          if (res.data.apiKeys) setApiKeys(res.data.apiKeys);
          if (res.data.whitelist) setWhitelist(res.data.whitelist);
          if (res.data.schedule) setSchedule(res.data.schedule);
          if (res.data.time) setTime(res.data.time);
          if (res.data.rateLimit) setRateLimit(res.data.rateLimit);
        } else {
          toast.error(res.message || 'Failed to load backup & security data.');
        }
      } catch (_) {
        toast.error('Failed to load backup & security data.');
      }
      setLoading(false);
    };
    fetchData();
    return () => {
      if (configSaveTimer.current) clearTimeout(configSaveTimer.current);
    };
  }, []);

  const totalBackupPages = Math.max(1, Math.ceil(backupHistory.length / ITEMS_PER_PAGE));
  const paginatedBackups = useMemo(() => {
    const start = (backupPage - 1) * ITEMS_PER_PAGE;
    return backupHistory.slice(start, start + ITEMS_PER_PAGE);
  }, [backupHistory, backupPage]);

  const totalSessionPages = Math.max(1, Math.ceil(activeSessions.length / ITEMS_PER_PAGE));
  const paginatedSessions = useMemo(() => {
    const start = (sessionPage - 1) * ITEMS_PER_PAGE;
    return activeSessions.slice(start, start + ITEMS_PER_PAGE);
  }, [activeSessions, sessionPage]);

  const totalApiKeyPages = Math.max(1, Math.ceil(apiKeys.length / ITEMS_PER_PAGE));
  const paginatedApiKeys = useMemo(() => {
    const start = (apiKeyPage - 1) * ITEMS_PER_PAGE;
    return apiKeys.slice(start, start + ITEMS_PER_PAGE);
  }, [apiKeys, apiKeyPage]);

  useEffect(() => {
    if (backupPage > totalBackupPages) setBackupPage(totalBackupPages);
  }, [totalBackupPages, backupPage]);

  useEffect(() => {
    if (sessionPage > totalSessionPages) setSessionPage(totalSessionPages);
  }, [totalSessionPages, sessionPage]);

  useEffect(() => {
    if (apiKeyPage > totalApiKeyPages) setApiKeyPage(totalApiKeyPages);
  }, [totalApiKeyPages, apiKeyPage]);

  const lastBackupTime = backupHistory[0] || { date: 'None', size: '0 GB', status: 'Success' as BackupStatus, file: '' };
  const hasBackups = backupHistory.length > 0;
  const lastStatus = hasBackups ? lastBackupTime.status : null;
  const healthVariant =
    !hasBackups ? 'neutral' as const
    : lastStatus === 'Success' ? 'success' as const
    : lastStatus === 'In Progress' ? 'warning' as const
    : 'danger' as const;
  const healthLabel =
    !hasBackups ? 'No backups'
    : lastStatus === 'Success' ? 'Healthy'
    : lastStatus === 'In Progress' ? 'Backup in progress'
    : 'Attention needed';
  const headerSecurityVariant = healthVariant === 'danger' ? 'danger' as const : healthVariant === 'warning' ? 'warning' as const : 'success' as const;
  const backupSummary = hasBackups
    ? `${lastBackupTime.date} — ${lastBackupTime.size} — ${lastBackupTime.status}`
    : 'No backups recorded yet';

  const backupStats = useMemo(() => {
    return [
      { title: 'Database Backups', value: loading ? '...' : `${backupHistory.length}`, icon: UploadCloud, tone: 'blue' as const, description: 'Stored recovery snapshots' },
      { title: 'Active Sessions', value: loading ? '...' : `${activeSessions.length}`, icon: Laptop2, tone: 'green' as const, description: 'Signed-in operators' },
      { title: 'API Keys', value: loading ? '...' : `${apiKeys.length}`, icon: KeyRound, tone: 'amber' as const, description: 'Integration credentials' },
      { title: 'Whitelisted IPs', value: loading ? '...' : `${whitelist.length}`, icon: Globe2, tone: 'purple' as const, description: 'Trusted network origins' },
    ];
  }, [loading, backupHistory.length, activeSessions.length, apiKeys.length, whitelist.length]);

  const saveConfigDebounced = useCallback((payload: { schedule: BackupFrequency; time: string; rateLimit: number }) => {
    if (configSaveTimer.current) clearTimeout(configSaveTimer.current);
    setConfigSaving(true);
    configSaveTimer.current = setTimeout(async () => {
      try {
        const res = await adminService.updateBackupSecurityConfig(payload);
        if (res.ok) {
          toast.success(res.message || 'Security configuration saved.');
        } else {
          toast.error(res.message || 'Failed to save configuration.');
        }
      } catch (_) {
        toast.error('Failed to save configuration.');
      } finally {
        setConfigSaving(false);
      }
    }, 600);
  }, []);

  const runBackup = async () => {
    setConfirmOpen(false);
    const res = await adminService.runDatabaseBackup();
    if (res.ok && res.data) {
      setBackupHistory(res.data);
      toast.success(res.message || 'Backup completed successfully.');
    } else {
      toast.error(res.message || 'Failed to trigger backup.');
    }
  };

  const handleDownloadBackup = async (file: string) => {
    try {
      await adminService.downloadDatabaseBackup(file);
      toast.success(`Downloaded backup file: ${file}`);
    } catch (_) {
      toast.error('Failed to download backup file.');
    }
  };

  const openRestoreConfirm = (file: string) => {
    setRestoreFile(file);
    setRestoreConfirmText('');
  };

  const closeRestoreConfirm = () => {
    if (restoring) return;
    setRestoreFile(null);
    setRestoreConfirmText('');
  };

  const confirmRestoreBackup = async () => {
    if (!restoreFile || restoreConfirmText !== 'RESTORE') return;
    setRestoring(true);
    try {
      const res = await adminService.restoreDatabaseBackup(restoreFile);
      if (res.ok) {
        toast.success(res.message || `Restored database from ${restoreFile}`);
        setRestoreFile(null);
        setRestoreConfirmText('');
      } else {
        toast.error(res.message || 'Failed to restore database.');
      }
    } catch (_) {
      toast.error('Failed to restore database.');
    } finally {
      setRestoring(false);
    }
  };

  const revokeAllSessions = async () => {
    setRevokeAllOpen(false);
    const res = await adminService.revokeAllSessions();
    if (res.ok && res.data) {
      setActiveSessions(res.data);
      toast.success(res.message || 'All sessions revoked successfully.');
    } else {
      toast.error(res.message || 'Failed to revoke sessions.');
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Key name is required');
      return;
    }
    setGenerateKeyOpen(false);
    const res = await adminService.createApiKey(newKeyName.trim());
    if (res.ok && res.data) {
      setApiKeys(res.data);
      setNewKeyName('');
      toast.success(res.message || 'API key created successfully.');
    } else {
      toast.error(res.message || 'Failed to create API key.');
    }
  };

  const revokeSession = async (user: string) => {
    const res = await adminService.revokeSession(user);
    if (res.ok && res.data) {
      setActiveSessions(res.data);
      toast.success(`Session for ${user} revoked.`);
    } else {
      toast.error(res.message || 'Failed to revoke session.');
    }
  };

  const revokeApiKey = async (name: string) => {
    const res = await adminService.revokeApiKey(name);
    if (res.ok && res.data) {
      setApiKeys(res.data);
      toast.success(`API key "${name}" revoked.`);
    } else {
      toast.error(res.message || 'Failed to revoke API key.');
    }
  };

  const addWhitelistIp = async () => {
    if (!ipInput.trim()) return;
    const newWhitelist = Array.from(new Set([...whitelist, ipInput.trim()]));
    const res = await adminService.updateWhitelist(newWhitelist);
    if (res.ok) {
      setWhitelist(newWhitelist);
      setIpInput('');
      toast.success(`IP "${ipInput.trim()}" added to whitelist.`);
    } else {
      toast.error(res.message || 'Failed to update whitelist.');
    }
  };

  const removeWhitelistIp = async (ip: string) => {
    const newWhitelist = whitelist.filter((item) => item !== ip);
    const res = await adminService.updateWhitelist(newWhitelist);
    if (res.ok) {
      setWhitelist(newWhitelist);
      toast.success(`IP "${ip}" removed from whitelist.`);
    } else {
      toast.error(res.message || 'Failed to update whitelist.');
    }
  };

  const handleScheduleChange = (newSchedule: BackupFrequency) => {
    setSchedule(newSchedule);
    saveConfigDebounced({ schedule: newSchedule, time, rateLimit });
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    saveConfigDebounced({ schedule, time: newTime, rateLimit });
  };

  const handleRateLimitChange = (newRateLimit: number) => {
    setRateLimit(newRateLimit);
    saveConfigDebounced({ schedule, time, rateLimit: newRateLimit });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Backup & Security"
        subtitle="Manage backup routines, recovery, and protection settings."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Backup & Security' }]}
        actions={
          <div className="flex items-center gap-2">
            {configSaving && <span className="text-xs text-[var(--text-muted)]">Saving…</span>}
            <AdminBadge variant={headerSecurityVariant}>{healthLabel}</AdminBadge>
          </div>
        }
      />

      <AdminStatGrid stats={backupStats} cols={4} compact />

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Database Backups" subtitle="Schedule and maintain database backup operations.">
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${
              healthVariant === 'success' ? 'border-[#1D9E75]/15 bg-[#1D9E75]/5'
              : healthVariant === 'warning' ? 'border-[#E8A020]/25 bg-[#E8A020]/10'
              : healthVariant === 'danger' ? 'border-[#E24B4A]/20 bg-[#E24B4A]/5'
              : 'border-[var(--border-color)] bg-[var(--bg-page)]'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Last backup</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{backupSummary}</p>
                </div>
                <AdminBadge variant={healthVariant}>{healthLabel}</AdminBadge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Schedule</span>
                <select
                  value={schedule}
                  onChange={(event) => handleScheduleChange(event.target.value as BackupFrequency)}
                  className={adminInputClass}
                >
                  {['Daily', 'Weekly', 'Monthly'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Time</span>
                <input
                  type="time"
                  value={time}
                  onChange={(event) => handleTimeChange(event.target.value)}
                  className={adminInputClass}
                />
              </label>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border-color)]">
              <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-[var(--bg-page)] shadow-sm">
                    <tr>
                      {['Date', 'Size', 'Status', 'Download', 'Restore'].map((head) => (
                        <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBackups.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8">
                          <AdminEmptyState icon={UploadCloud} title="No backups yet" description="Run a backup now to create your first recovery snapshot." />
                        </td>
                      </tr>
                    ) : (
                      paginatedBackups.map((backup) => (
                        <tr key={backup.file} className="border-t border-[var(--border-color)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                          <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{backup.date}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{backup.size}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <AdminBadge variant="success" className={backupStatusClass(backup.status)}>
                              {backup.status}
                            </AdminBadge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDownloadBackup(backup.file)}
                              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openRestoreConfirm(backup.file)}
                              disabled={backup.status !== 'Success'}
                              className="inline-flex items-center gap-2 rounded-xl border border-[#003580]/20 px-3 py-1.5 text-xs font-semibold text-[#003580] hover:bg-[#003580]/5 disabled:opacity-40 disabled:pointer-events-none"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <AdminPagination
                currentPage={backupPage}
                totalPages={totalBackupPages}
                totalItems={backupHistory.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setBackupPage}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] pt-4">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                <RefreshCcw className="h-4 w-4" />
                Run Backup Now
              </button>
              <div className="text-xs text-[var(--text-muted)]">
                Next backup: {schedule} at {time}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Security Settings" subtitle="Sessions, API access, rate limits, and IP allowlists.">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Active Sessions</h4>
                <button
                  type="button"
                  onClick={() => setRevokeAllOpen(true)}
                  className="rounded-xl border border-[#E24B4A]/20 px-3 py-1.5 text-xs font-semibold text-[#E24B4A] hover:bg-rose-50"
                >
                  Revoke All Sessions
                </button>
              </div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--border-color)]">
                <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-[var(--bg-page)] shadow-sm">
                      <tr>
                        {['User', 'IP', 'Role', 'Location', 'Last Activity', ''].map((head) => (
                          <th key={head} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSessions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                            No active sessions found.
                          </td>
                        </tr>
                      ) : (
                        paginatedSessions.map((session) => (
                          <tr key={`${session.user}-${session.ip}`} className="border-t border-[var(--border-color)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                            <td className="px-3 py-3 text-[var(--text-secondary)] whitespace-nowrap max-w-[180px] truncate" title={session.user}>
                              {session.user}
                            </td>
                            <td className="px-3 py-3 text-[var(--text-secondary)] whitespace-nowrap">{session.ip}</td>
                            <td className="px-3 py-3 text-[var(--text-secondary)] whitespace-nowrap max-w-[150px] truncate" title={session.device}>
                              {session.device}
                            </td>
                            <td className="px-3 py-3 text-[var(--text-secondary)] whitespace-nowrap">{session.location}</td>
                            <td className="px-3 py-3 text-[var(--text-secondary)] whitespace-nowrap">{session.loginTime}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => revokeSession(session.user)}
                                className="rounded-xl border border-[#E24B4A]/20 px-2.5 py-1 text-xs font-semibold text-[#E24B4A] hover:bg-rose-50"
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <AdminPagination
                  currentPage={sessionPage}
                  totalPages={totalSessionPages}
                  totalItems={activeSessions.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setSessionPage}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">API Keys</h4>
                <button
                  type="button"
                  onClick={() => setGenerateKeyOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Generate New API Key
                </button>
              </div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--border-color)]">
                <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-[var(--bg-page)] shadow-sm">
                      <tr>
                        {['Key Name', 'Created', 'Last Used', 'Status', ''].map((head) => (
                          <th key={head} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedApiKeys.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                            No API keys generated.
                          </td>
                        </tr>
                      ) : (
                        paginatedApiKeys.map((key) => (
                          <tr key={key.name} className="border-t border-[var(--border-color)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                            <td className="px-3 py-3 text-[var(--text-secondary)] whitespace-nowrap">{key.name}</td>
                            <td className="px-3 py-3 text-[var(--text-secondary)] whitespace-nowrap">{key.created}</td>
                            <td className="px-3 py-3 text-[var(--text-secondary)] whitespace-nowrap">{key.lastUsed}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <AdminBadge variant="success" className={apiStatusClass(key.status)}>
                                {key.status}
                              </AdminBadge>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => revokeApiKey(key.name)}
                                className="rounded-xl border border-[#E24B4A]/20 px-2.5 py-1 text-xs font-semibold text-[#E24B4A] hover:bg-rose-50"
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <AdminPagination
                  currentPage={apiKeyPage}
                  totalPages={totalApiKeyPages}
                  totalItems={apiKeys.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setApiKeyPage}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Rate Limiting</h4>
                  <AdminBadge variant="neutral">API Protection</AdminBadge>
                </div>
                <div className="mt-3">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Max requests per minute</span>
                    <input
                      type="number"
                      value={rateLimit}
                      onChange={(event) => handleRateLimitChange(Number(event.target.value))}
                      className={adminInputClass}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">IP Whitelist</h4>
                  <AdminBadge variant="neutral">{whitelist.length} allowed</AdminBadge>
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={ipInput}
                    onChange={(event) => setIpInput(event.target.value)}
                    placeholder="Add IP address"
                    className={adminInputClass}
                  />
                  <button
                    type="button"
                    onClick={addWhitelistIp}
                    className="rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-3 max-h-[140px] overflow-y-auto flex flex-wrap gap-2 pr-1">
                  {whitelist.length === 0 ? (
                    <p className="text-xs text-slate-400 py-1">No IP addresses whitelisted.</p>
                  ) : (
                    whitelist.map((ip) => (
                      <button
                        key={ip}
                        type="button"
                        onClick={() => removeWhitelistIp(ip)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
                      >
                        {ip}
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ))
                  )}
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
              className="rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={runBackup}
              className="rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Confirm
            </button>
          </div>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
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
              className="rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={revokeAllSessions}
              className="rounded-xl bg-[#E24B4A] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Revoke All
            </button>
          </div>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
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
              className="rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createApiKey}
              className="rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Generate
            </button>
          </div>
        }
      >
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Key Name</span>
          <input
            value={newKeyName}
            onChange={(event) => setNewKeyName(event.target.value)}
            className={adminInputClass}
          />
        </label>
      </AdminModal>

      <AdminModal
        open={Boolean(restoreFile)}
        title="Restore Database"
        onClose={closeRestoreConfirm}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeRestoreConfirm}
              disabled={restoring}
              className="rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRestoreBackup}
              disabled={restoring || restoreConfirmText !== 'RESTORE'}
              className="rounded-xl bg-[#E24B4A] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none"
            >
              {restoring ? 'Restoring…' : 'Restore Database'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            This will overwrite the live database with <span className="font-semibold text-[var(--text-primary)]">{restoreFile}</span>.
            This action cannot be undone. Type <span className="font-mono font-semibold text-[#E24B4A]">RESTORE</span> to confirm.
          </p>
          <label className="space-y-2 block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Confirmation</span>
            <input
              value={restoreConfirmText}
              onChange={(event) => setRestoreConfirmText(event.target.value)}
              placeholder="Type RESTORE"
              autoComplete="off"
              className={adminInputClass}
            />
          </label>
        </div>
      </AdminModal>
    </div>
  );
}

