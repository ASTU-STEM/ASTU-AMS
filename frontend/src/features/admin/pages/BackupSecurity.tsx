import React, { useMemo, useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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

function PaginationFooter({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems <= itemsPerPage) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-2 text-xs text-slate-600">
      <div>
        Showing <span className="font-semibold text-slate-800">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-800">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalItems}</span> entries
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-[6px] border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        <span className="px-2 font-medium text-slate-500">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-[6px] border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

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
  const [newKeyName, setNewKeyName] = useState('Reporting API Key');
  const [loading, setLoading] = useState(true);

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
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
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

  const lastBackupTime = backupHistory[0] || { date: 'None', size: '0 GB', status: 'Success', file: '' };
  const backupSummary = backupHistory.length > 0
    ? `${lastBackupTime.date} — ${lastBackupTime.size} — ✅ ${lastBackupTime.status}`
    : 'No backups recorded yet';

  const backupStats = useMemo(() => {
    return [
      { label: 'Database Backups', value: loading ? '...' : `${backupHistory.length}`, icon: UploadCloud },
      { label: 'Active Sessions', value: loading ? '...' : `${activeSessions.length}`, icon: Laptop2 },
      { label: 'API Keys', value: loading ? '...' : `${apiKeys.length}`, icon: KeyRound },
      { label: 'Whitelisted IPs', value: loading ? '...' : `${whitelist.length}`, icon: Globe2 },
    ];
  }, [loading, backupHistory.length, activeSessions.length, apiKeys.length, whitelist.length]);

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

  const handleRestoreBackup = async (file: string) => {
    const res = await adminService.restoreDatabaseBackup(file);
    if (res.ok) {
      toast.success(res.message || `Restored database from ${file}`);
    } else {
      toast.error(res.message || 'Failed to restore database.');
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

  // These three toggles are optimistic and previously ignored the result, so a
  // rejected write left the UI showing a value the server never accepted.
  const persist = async (
    patch: { schedule?: BackupFrequency; time?: string; rateLimit?: number },
    revert: () => void,
    label: string,
  ) => {
    revert();
    const result = await adminService.updateBackupSecurityConfig({
      schedule: patch.schedule ?? schedule,
      time: patch.time ?? time,
      rateLimit: patch.rateLimit ?? rateLimit,
    });
    if (!result.ok) {
      toast.error(result.message || `Could not save ${label}.`);
      return;
    }
    toast.success(`${label} saved.`);
  };

  const handleScheduleChange = async (newSchedule: BackupFrequency) => {
    await persist({ schedule: newSchedule }, () => setSchedule(newSchedule), 'Backup schedule');
  };

  const handleTimeChange = async (newTime: string) => {
    await persist({ time: newTime }, () => setTime(newTime), 'Backup time');
  };

  const handleRateLimitChange = async (newRateLimit: number) => {
    await persist({ rateLimit: newRateLimit }, () => setRateLimit(newRateLimit), 'Rate limit');
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
                  onChange={(event) => handleScheduleChange(event.target.value as BackupFrequency)}
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
                  onChange={(event) => handleTimeChange(event.target.value)}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                />
              </label>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-slate-200">
              <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 shadow-sm">
                    <tr>
                      {['Date', 'Size', 'Status', 'Download', 'Restore'].map((head) => (
                        <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBackups.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
                          No database backups recorded.
                        </td>
                      </tr>
                    ) : (
                      paginatedBackups.map((backup) => (
                        <tr key={backup.file} className="border-t border-slate-100 hover:bg-slate-50/70">
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{backup.date}</td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{backup.size}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <AdminBadge variant="success" className={backupStatusClass(backup.status)}>
                              {backup.status}
                            </AdminBadge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDownloadBackup(backup.file)}
                              className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRestoreBackup(backup.file)}
                              className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 px-3 py-1.5 text-xs font-semibold text-[#003580] hover:bg-[#003580]/5"
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
              <PaginationFooter
                currentPage={backupPage}
                totalPages={totalBackupPages}
                totalItems={backupHistory.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setBackupPage}
              />
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
                  className="rounded-[8px] border border-[#E24B4A]/20 px-3 py-1.5 text-xs font-semibold text-[#E24B4A] hover:bg-rose-50"
                >
                  Revoke All Sessions
                </button>
              </div>
              <div className="mt-3 overflow-hidden rounded-[10px] border border-slate-200">
                <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50 shadow-sm">
                      <tr>
                        {['User', 'IP', 'Device', 'Location', 'Login Time', ''].map((head) => (
                          <th key={head} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSessions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                            No active sessions found.
                          </td>
                        </tr>
                      ) : (
                        paginatedSessions.map((session) => (
                          <tr key={`${session.user}-${session.ip}`} className="border-t border-slate-100 hover:bg-slate-50/70">
                            <td className="px-3 py-3 text-slate-700 whitespace-nowrap max-w-[180px] truncate" title={session.user}>
                              {session.user}
                            </td>
                            <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{session.ip}</td>
                            <td className="px-3 py-3 text-slate-600 whitespace-nowrap max-w-[150px] truncate" title={session.device}>
                              {session.device}
                            </td>
                            <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{session.location}</td>
                            <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{session.loginTime}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => revokeSession(session.user)}
                                className="rounded-[8px] border border-[#E24B4A]/20 px-2.5 py-1 text-xs font-semibold text-[#E24B4A] hover:bg-rose-50"
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
                <PaginationFooter
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
                <h4 className="text-sm font-semibold text-slate-900">API Keys</h4>
                <button
                  type="button"
                  onClick={() => setGenerateKeyOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Generate New API Key
                </button>
              </div>
              <div className="mt-3 overflow-hidden rounded-[10px] border border-slate-200">
                <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50 shadow-sm">
                      <tr>
                        {['Key Name', 'Created', 'Last Used', 'Status', ''].map((head) => (
                          <th key={head} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedApiKeys.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
                            No API keys generated.
                          </td>
                        </tr>
                      ) : (
                        paginatedApiKeys.map((key) => (
                          <tr key={key.name} className="border-t border-slate-100 hover:bg-slate-50/70">
                            <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{key.name}</td>
                            <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{key.created}</td>
                            <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{key.lastUsed}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <AdminBadge variant="success" className={apiStatusClass(key.status)}>
                                {key.status}
                              </AdminBadge>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => revokeApiKey(key.name)}
                                className="rounded-[8px] border border-[#E24B4A]/20 px-2.5 py-1 text-xs font-semibold text-[#E24B4A] hover:bg-rose-50"
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
                <PaginationFooter
                  currentPage={apiKeyPage}
                  totalPages={totalApiKeyPages}
                  totalItems={apiKeys.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setApiKeyPage}
                />
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
                      onChange={(event) => handleRateLimitChange(Number(event.target.value))}
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
                <div className="mt-3 max-h-[140px] overflow-y-auto flex flex-wrap gap-2 pr-1">
                  {whitelist.length === 0 ? (
                    <p className="text-xs text-slate-400 py-1">No IP addresses whitelisted.</p>
                  ) : (
                    whitelist.map((ip) => (
                      <button
                        key={ip}
                        type="button"
                        onClick={() => removeWhitelistIp(ip)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
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

