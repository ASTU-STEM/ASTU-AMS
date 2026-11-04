import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  Database,
  Download,
  Eye,
  ImagePlus,
  Info,
  Link2,
  Loader2,
  Mail,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  Save,
  Send,
  Settings2,
  Sun,
  ToggleLeft,
  ToggleRight,
  UploadCloud,
  WandSparkles,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminEmptyState from '../components/AdminEmptyState';
import AdminSectionCard, {
  adminHeroGhostBtnClass,
  adminHeroPrimaryBtnClass,
  adminInputClass,
  adminTabBtnClass,
  adminTabRailClass,
  adminTableHeadClass,
  adminTableRowClass,
} from '../components/AdminSectionCard';
import AdminStatGrid from '../components/AdminStatGrid';
import { toast } from 'react-hot-toast';
import { adminService } from '../services/admin.service';
import { useSystemSettings } from '../../../context/SystemSettingsContext';
import { useTheme, type ThemeMode } from '../../../hooks/useTheme';
import { useAuth } from '../../../contexts/AuthContext';

type SettingsTab = 'general' | 'email' | 'integrations' | 'data' | 'appearance';

type ImportHistoryRow = {
  id?: string;
  filename: string;
  date: string;
  records: number;
  total?: number;
  duplicates?: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'Completed' | 'Processing' | 'Failed';
  errors: number;
};

const LIVE_POLL_MS = 60_000;
const defaultLogo = '/images/astu-seal-logo.png';

const tabs: Array<{ key: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'general', label: 'General', icon: Settings2 },
  { key: 'email', label: 'Email Config', icon: Mail },
  { key: 'integrations', label: 'Integrations', icon: Link2 },
  { key: 'data', label: 'Data Import', icon: UploadCloud },
  { key: 'appearance', label: 'Appearance', icon: Palette },
];

const systemFields = [
  'Student ID',
  'Full Name',
  'Email',
  'Phone',
  'Department',
  'Graduation Year',
  'CGPA',
  'Gender',
  'Date of Birth',
];
const csvColumns = ['student_id', 'full_name', 'email', 'phone', 'department', 'graduation_year', 'cgpa', 'gender', 'date_of_birth'];

const fieldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]';

function parseImportLog(log: any): ImportHistoryRow {
  let filename = 'sis_batch_import.csv';
  let errorsCount = 0;
  let totalCount = log.recordsCount || 0;
  let duplicates = 0;

  if (log.errors) {
    try {
      const details = typeof log.errors === 'string' ? JSON.parse(log.errors) : log.errors;
      if (details.fileName) filename = details.fileName;
      if (details.errors !== undefined) errorsCount = Number(details.errors);
      if (details.total !== undefined) totalCount = Number(details.total);
      if (details.duplicates !== undefined) duplicates = Number(details.duplicates);
    } catch {
      errorsCount = 0;
    }
  }

  if (filename === 'sis_batch_import.csv' && log.id) {
    filename = `sync_log_${log.id.slice(0, 8)}.csv`;
  }

  const syncedDate = log.syncedAt ? new Date(log.syncedAt) : new Date();
  const formattedDate =
    syncedDate.toLocaleDateString() +
    ', ' +
    syncedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: log.id,
    filename,
    date: formattedDate,
    records: log.recordsCount ?? totalCount,
    total: totalCount,
    duplicates,
    status: log.status || 'SUCCESS',
    errors: errorsCount,
  };
}

function InputLabel({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="flex items-center justify-between gap-2">
        <span className={fieldLabel}>{label}</span>
        {hint && <span className="text-[10px] font-medium text-[var(--text-muted)]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: 'Connected' | 'Disconnected' | 'Active' | 'Inactive' }) {
  const connected = status === 'Connected' || status === 'Active';
  return <AdminBadge variant={connected ? 'success' : 'danger'}>{status}</AdminBadge>;
}

function IntegrationItem({
  title,
  description,
  status,
  toggleActive,
  testing,
  onToggle,
  onTest,
}: {
  title: string;
  description: string;
  status: 'Connected' | 'Disconnected' | 'Active' | 'Inactive';
  toggleActive: boolean;
  testing?: boolean;
  onToggle: () => void;
  onTest: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h4>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{description}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          {toggleActive ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4 text-[var(--text-muted)]" />}
          {toggleActive ? 'Enabled' : 'Disabled'}
        </button>
        <button
          type="button"
          onClick={onTest}
          disabled={testing}
          className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-3.5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-60"
        >
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
}

export default function SystemSettings() {
  const { updateSettingsState } = useSystemSettings();
  const { themeMode, setThemeMode, theme, darkMode } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | undefined>();
  const [baselineJson, setBaselineJson] = useState('');

  const [universityName, setUniversityName] = useState('Adama Science and Technology University');
  const [abbreviation, setAbbreviation] = useState('ASTU');
  const [website, setWebsite] = useState('https://astu.edu.et');
  const [contactEmail, setContactEmail] = useState('admin@astu.edu.et');
  const [address, setAddress] = useState('Adama, Ethiopia');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('Africa/Addis_Ababa');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [phoneNumber, setPhoneNumber] = useState('+251 22 110 0001');
  const [supportEmail, setSupportEmail] = useState('support@astu.edu.et');
  const [postalCode, setPostalCode] = useState('P.O. Box 1888, Adama, Ethiopia');
  const [portalTitle, setPortalTitle] = useState('Alumni Management System');

  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromName, setFromName] = useState('ASTU Alumni Management System');
  const [fromEmail, setFromEmail] = useState('');
  const [smtpPasswordVisible, setSmtpPasswordVisible] = useState(false);

  const [regApiToggle, setRegApiToggle] = useState(true);
  const [smsToggle, setSmsToggle] = useState(true);
  const [googleToggle, setGoogleToggle] = useState(false);
  const [linkedinToggle, setLinkedinToggle] = useState(true);
  const [openRouterToggle, setOpenRouterToggle] = useState(true);
  const [chapaToggle, setChapaToggle] = useState(true);
  const [diditToggle, setDiditToggle] = useState(true);

  const [regApiEndpoint, setRegApiEndpoint] = useState('https://registrar.astu.edu.et/api/v1');
  const [regApiKey, setRegApiKey] = useState('');
  const [smsGatewayUser, setSmsGatewayUser] = useState('');
  const [smsGatewayPass, setSmsGatewayPass] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState('deepseek/deepseek-r1:free');
  const [chapaSecretKey, setChapaSecretKey] = useState('');
  const [chapaPublicKey, setChapaPublicKey] = useState('');
  const [diditApiKey, setDiditApiKey] = useState('');

  const [importFileName, setImportFileName] = useState('graduates_2024.csv');
  const [availableColumns, setAvailableColumns] = useState<string[]>(csvColumns);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    'Student ID': 'student_id',
    'Full Name': 'full_name',
    Email: 'email',
    Phone: 'phone',
    Department: 'department',
    'Graduation Year': 'graduation_year',
    CGPA: 'cgpa',
    Gender: 'gender',
    'Date of Birth': 'date_of_birth',
  });
  const [importHistory, setImportHistory] = useState<ImportHistoryRow[]>([]);
  const [logoPreview, setLogoPreview] = useState(defaultLogo);
  const [primaryColor, setPrimaryColor] = useState('#003580');
  const [accentColor, setAccentColor] = useState('#E8A020');
  const [totalSisCount, setTotalSisCount] = useState(0);
  const [testingType, setTestingType] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  const buildPayload = useCallback(
    () => ({
      general: {
        universityName,
        abbreviation,
        website,
        contactEmail,
        address,
        academicYear,
        language,
        timezone,
        dateFormat,
        phoneNumber,
        supportEmail,
        postalCode,
        portalTitle,
      },
      email: {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromName,
        fromEmail,
      },
      integrations: {
        regApiToggle,
        smsToggle,
        googleToggle,
        linkedinToggle,
        openRouterToggle,
        chapaToggle,
        diditToggle,
        regApiEndpoint,
        regApiKey,
        smsGatewayUser,
        smsGatewayPass,
        googleClientId,
        openRouterApiKey,
        openRouterModel,
        chapaSecretKey,
        chapaPublicKey,
        diditApiKey,
      },
      appearance: {
        primaryColor,
        accentColor,
        logoUrl: logoPreview,
      },
    }),
    [
      universityName,
      abbreviation,
      website,
      contactEmail,
      address,
      academicYear,
      language,
      timezone,
      dateFormat,
      phoneNumber,
      supportEmail,
      postalCode,
      portalTitle,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      fromName,
      fromEmail,
      regApiToggle,
      smsToggle,
      googleToggle,
      linkedinToggle,
      openRouterToggle,
      chapaToggle,
      diditToggle,
      regApiEndpoint,
      regApiKey,
      smsGatewayUser,
      smsGatewayPass,
      googleClientId,
      openRouterApiKey,
      openRouterModel,
      chapaSecretKey,
      chapaPublicKey,
      diditApiKey,
      primaryColor,
      accentColor,
      logoPreview,
    ]
  );

  const applySettingsData = useCallback((s: Record<string, any>) => {
    if (s.totalSisRecords !== undefined) setTotalSisCount(Number(s.totalSisRecords));
    if (s.general) {
      const g = s.general as any;
      if (g.universityName) setUniversityName(g.universityName);
      if (g.abbreviation) setAbbreviation(g.abbreviation);
      if (g.website) setWebsite(g.website);
      if (g.contactEmail) setContactEmail(g.contactEmail);
      if (g.address) setAddress(g.address);
      if (g.academicYear) setAcademicYear(g.academicYear);
      if (g.language) setLanguage(g.language);
      if (g.timezone) setTimezone(g.timezone);
      if (g.dateFormat) setDateFormat(g.dateFormat);
      if (g.phoneNumber) setPhoneNumber(g.phoneNumber);
      if (g.supportEmail) setSupportEmail(g.supportEmail);
      if (g.postalCode) setPostalCode(g.postalCode);
      if (g.portalTitle) setPortalTitle(g.portalTitle);
    }
    if (s.email) {
      const e = s.email as any;
      if (e.smtpHost) setSmtpHost(e.smtpHost);
      if (e.smtpPort) setSmtpPort(e.smtpPort);
      if (e.smtpUser) setSmtpUser(e.smtpUser);
      if (e.smtpPassword !== undefined) setSmtpPassword(e.smtpPassword);
      if (e.fromName) setFromName(e.fromName);
      if (e.fromEmail) setFromEmail(e.fromEmail);
    }
    if (s.integrations) {
      const i = s.integrations as any;
      if (i.regApiToggle !== undefined) setRegApiToggle(i.regApiToggle);
      if (i.smsToggle !== undefined) setSmsToggle(i.smsToggle);
      if (i.googleToggle !== undefined) setGoogleToggle(i.googleToggle);
      if (i.linkedinToggle !== undefined) setLinkedinToggle(i.linkedinToggle);
      if (i.openRouterToggle !== undefined) setOpenRouterToggle(i.openRouterToggle);
      if (i.chapaToggle !== undefined) setChapaToggle(i.chapaToggle);
      if (i.diditToggle !== undefined) setDiditToggle(i.diditToggle);
      if (i.regApiEndpoint) setRegApiEndpoint(i.regApiEndpoint);
      if (i.regApiKey) setRegApiKey(i.regApiKey);
      if (i.smsGatewayUser) setSmsGatewayUser(i.smsGatewayUser);
      if (i.smsGatewayPass) setSmsGatewayPass(i.smsGatewayPass);
      if (i.googleClientId) setGoogleClientId(i.googleClientId);
      if (i.openRouterApiKey !== undefined) setOpenRouterApiKey(i.openRouterApiKey);
      if (i.openRouterModel !== undefined) setOpenRouterModel(i.openRouterModel);
      if (i.chapaSecretKey !== undefined) setChapaSecretKey(i.chapaSecretKey);
      if (i.chapaPublicKey !== undefined) setChapaPublicKey(i.chapaPublicKey);
      if (i.diditApiKey !== undefined) setDiditApiKey(i.diditApiKey);
    }
    if (s.appearance) {
      const a = s.appearance as any;
      if (a.primaryColor) setPrimaryColor(a.primaryColor);
      if (a.accentColor) setAccentColor(a.accentColor);
      if (a.logoUrl) setLogoPreview(a.logoUrl);
    }
  }, []);

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setLoadError(null);
      }
      try {
        const [settingsResult, logsResult] = await Promise.all([
          adminService.getSettings(),
          adminService.getSyncLogs(),
        ]);

        if (settingsResult.ok && settingsResult.data) {
          applySettingsData(settingsResult.data);
          if (!silent) hydratedRef.current = false;
        } else if (!silent) {
          setLoadError(settingsResult.message || 'Failed to load system settings');
        }

        if (logsResult.ok) {
          setImportHistory(logsResult.data.map(parseImportLog));
        }
      } catch {
        if (!silent) setLoadError('Failed to load system settings');
      } finally {
        if (!silent) setLoading(false);
        setLastSynced(new Date().toLocaleTimeString());
      }
    },
    [applySettingsData]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (loading) {
      hydratedRef.current = false;
      return;
    }
    if (!hydratedRef.current) {
      setBaselineJson(JSON.stringify(buildPayload()));
      hydratedRef.current = true;
    }
  }, [loading, buildPayload]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      // Don't overwrite unsaved local edits during live poll of import counts only
      adminService.getSyncLogs().then((logsResult) => {
        if (logsResult.ok) setImportHistory(logsResult.data.map(parseImportLog));
      });
      adminService.getSettings().then((res) => {
        if (res.ok && res.data?.totalSisRecords !== undefined) {
          setTotalSisCount(Number(res.data.totalSisRecords));
        }
      });
      setLastSynced(new Date().toLocaleTimeString());
    }, LIVE_POLL_MS);
    return () => window.clearInterval(id);
  }, [live]);

  const currentPayload = useMemo(() => buildPayload(), [buildPayload]);
  const isDirty = baselineJson !== '' && JSON.stringify(currentPayload) !== baselineJson;

  const handleSaveSettings = async () => {
    setSaving(true);
    const settingsPayload = buildPayload();
    try {
      const result = await adminService.updateSettings(settingsPayload);
      if (result.ok) {
        updateSettingsState({
          general: settingsPayload.general,
          email: {
            smtpHost: settingsPayload.email.smtpHost,
            smtpPort: settingsPayload.email.smtpPort,
            smtpUser: settingsPayload.email.smtpUser,
            fromName: settingsPayload.email.fromName,
            fromEmail: settingsPayload.email.fromEmail,
          },
          integrations: {
            regApiToggle: settingsPayload.integrations.regApiToggle,
            smsToggle: settingsPayload.integrations.smsToggle,
            googleToggle: settingsPayload.integrations.googleToggle,
            linkedinToggle: settingsPayload.integrations.linkedinToggle,
            regApiEndpoint: settingsPayload.integrations.regApiEndpoint,
            regApiKey: settingsPayload.integrations.regApiKey,
            smsGatewayUser: settingsPayload.integrations.smsGatewayUser,
            googleClientId: settingsPayload.integrations.googleClientId,
          },
          appearance: settingsPayload.appearance,
        });
        setBaselineJson(JSON.stringify(settingsPayload));
        hydratedRef.current = true;
        toast.success('Settings saved successfully');
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        toast.error(result.message || 'Failed to save settings.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    await fetchAll();
    toast.success('System settings refreshed');
  };

  const confirmDiscardAndRefresh = async () => {
    setDiscardOpen(false);
    await fetchAll();
    toast.success('Changes discarded — settings reloaded');
  };

  const generalFields = [
    universityName,
    abbreviation,
    website,
    contactEmail,
    address,
    academicYear,
    phoneNumber,
    supportEmail,
    postalCode,
    portalTitle,
  ];
  const missingCount = generalFields.filter((f) => !f || f.trim() === '').length;
  const isProfileComplete = missingCount === 0;

  const allIntegrations = [openRouterToggle, chapaToggle, diditToggle, regApiToggle, smsToggle, googleToggle, linkedinToggle];
  const connectedIntegrations = allIntegrations.filter(Boolean).length;
  const totalIntegrations = allIntegrations.length;
  const pendingIntegrations = totalIntegrations - connectedIntegrations;

  const totalImportedRecordsFromLogs = importHistory.reduce((sum, row) => sum + row.records, 0);
  const realTotalImported = Math.max(totalSisCount, totalImportedRecordsFromLogs);
  const todayStr = new Date().toLocaleDateString();
  const addedToday = importHistory
    .filter((row) => row.date.includes(todayStr) || row.date.startsWith(todayStr))
    .reduce((sum, row) => sum + row.records, 0);

  const brandAssetsCount = (logoPreview ? 1 : 0) + (primaryColor ? 1 : 0) + (accentColor ? 1 : 0);
  const brandTrendLabel =
    logoPreview && primaryColor && accentColor
      ? 'Logo + palette'
      : logoPreview
        ? 'Logo configured'
        : 'Palette configured';

  const summaryCards = [
    {
      title: 'University Profile',
      value: isProfileComplete ? 'Complete' : 'Incomplete',
      icon: Building2,
      tone: isProfileComplete ? ('blue' as const) : ('amber' as const),
      description: isProfileComplete ? 'Identity synced' : missingCount === 1 ? '1 field missing' : `${missingCount} fields missing`,
      loading,
      onClick: () => setActiveTab('general'),
    },
    {
      title: 'Integrations',
      value: `${connectedIntegrations}/${totalIntegrations}`,
      icon: Link2,
      tone: 'green' as const,
      description:
        pendingIntegrations === 0
          ? 'All integrations active'
          : pendingIntegrations === 1
            ? '1 pending'
            : `${pendingIntegrations} pending`,
      onClick: () => setActiveTab('integrations'),
    },
    {
      title: 'Imported Records',
      value: loading ? '…' : realTotalImported.toLocaleString(),
      icon: Database,
      tone: 'gold' as const,
      description: addedToday > 0 ? `${addedToday.toLocaleString()} added today` : 'No imports today',
      onClick: () => setActiveTab('data'),
    },
    {
      title: 'Brand Assets',
      value: String(brandAssetsCount),
      icon: ImagePlus,
      tone: 'purple' as const,
      description: brandTrendLabel,
      onClick: () => setActiveTab('appearance'),
    },
  ];

  const handleTestIntegration = async (type: string, configData?: any) => {
    setTestingType(type);
    const result = await adminService.testIntegration(type, configData);
    setTestingType(null);
    if (result.ok && result.data?.success) {
      toast.success(result.data.message || `${type.toUpperCase()} connection test passed!`);
    } else {
      toast.error(result.message || `Connection test failed for ${type}.`);
    }
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setLogoPreview(dataUrl);
        toast.success('Logo loaded — save appearance to apply system-wide.');
      }
    };
    reader.readAsDataURL(file);
  };

  const resetDefaults = async () => {
    const defaultAppearance = {
      primaryColor: '#003580',
      accentColor: '#E8A020',
      logoUrl: defaultLogo,
    };
    setPrimaryColor('#003580');
    setAccentColor('#E8A020');
    setLogoPreview(defaultLogo);
    await adminService.updateSettings({ appearance: defaultAppearance });
    updateSettingsState({ appearance: defaultAppearance });
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary-color', '#003580');
      document.documentElement.style.setProperty('--brand-primary', '#003580');
      document.documentElement.style.setProperty('--accent-color', '#E8A020');
      document.documentElement.style.setProperty('--brand-accent', '#E8A020');
    }
    toast.success('ASTU appearance defaults restored.');
    // Appearance was saved immediately — re-baseline from the restored values.
    const nextBaseline = { ...buildPayload(), appearance: defaultAppearance };
    setBaselineJson(JSON.stringify(nextBaseline));
    hydratedRef.current = true;
  };

  const sendTestEmail = () => {
    setTestEmailOpen(false);
    handleTestIntegration('email', {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      fromName,
      fromEmail,
      recipient: user?.email || fromEmail || smtpUser,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return;
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      setAvailableColumns(headers);
      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        rows.push(rowObj);
      }
      setParsedRows(rows);
      const newMapping = { ...columnMapping };
      systemFields.forEach((field) => {
        const fieldClean = field.toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = headers.find((h) => {
          const hClean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          return hClean === fieldClean || hClean.includes(fieldClean) || fieldClean.includes(hClean);
        });
        if (match) newMapping[field] = match;
      });
      setColumnMapping(newMapping);
      toast.success(`Loaded “${file.name}” (${rows.length} records).`);
    };
    reader.readAsText(file);
  };

  const uploadTemplate = () => {
    const csvContent =
      'student_id,full_name,email,phone,department,graduation_year,cgpa,gender,date_of_birth\n' +
      'UGR/1001/14,Abebe Bikila,abebe.b@astu.edu.et,+251911223344,Software Engineering,2024,3.85,Male,2001-04-12\n' +
      'UGR/1002/14,Tigist Assefa,tigist.a@astu.edu.et,+251922334455,Electrical Engineering,2024,3.92,Female,2001-08-25\n' +
      'UGR/1003/14,Kenenisa Bekele,kenenisa.b@astu.edu.et,+251933445566,Mechanical Engineering,2024,3.65,Male,2000-11-05\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'astu_alumni_sis_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded SIS CSV template.');
  };

  const handleStartDataImport = async () => {
    let rowsToImport = parsedRows;
    if (rowsToImport.length === 0) {
      toast.error('Upload a CSV file before importing.');
      return;
    }
    setIsImporting(true);
    const mappedRecords = rowsToImport.map((row) => ({
      studentId: row[columnMapping['Student ID']] || row.student_id || row.studentId || '',
      fullName: row[columnMapping['Full Name']] || row.full_name || row.fullName || '',
      email: row[columnMapping['Email']] || row.email || '',
      phone: row[columnMapping['Phone']] || row.phone || row.phone_number || '',
      department: row[columnMapping['Department']] || row.department || '',
      graduationYear: row[columnMapping['Graduation Year']] || row.graduation_year || row.graduationYear || '',
      cgpa: row[columnMapping['CGPA']] || row.cgpa || '',
      gender: row[columnMapping['Gender']] || row.gender || '',
      dateOfBirth: row[columnMapping['Date of Birth']] || row.date_of_birth || row.dateOfBirth || '',
    }));
    const result = await adminService.importData({ records: mappedRecords, fileName: importFileName });
    setIsImporting(false);
    if (result.ok && result.data) {
      toast.success(result.data.message || 'Import executed successfully!');
      const logsResult = await adminService.getSyncLogs();
      if (logsResult.ok) setImportHistory(logsResult.data.map(parseImportLog));
    } else {
      toast.error(result.message || 'Failed to execute data import.');
    }
  };

  const refreshImportHistory = async () => {
    const logsResult = await adminService.getSyncLogs();
    if (logsResult.ok) {
      setImportHistory(logsResult.data.map(parseImportLog));
      toast.success('Import history refreshed.');
      setLastSynced(new Date().toLocaleTimeString());
    } else {
      toast.error(logsResult.message || 'Failed to refresh history');
    }
  };

  const saveButtonLabel =
    activeTab === 'general'
      ? 'Save General'
      : activeTab === 'email'
        ? 'Save Email'
        : activeTab === 'integrations'
          ? 'Save Integrations'
          : activeTab === 'appearance'
            ? 'Save Appearance'
            : 'Save Changes';

  if (loadError && !loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="System Settings"
          subtitle="Configure university identity, email, integrations, data import, and branding."
          breadcrumbs={[{ label: 'Admin' }, { label: 'Configuration' }]}
        />
        <AdminEmptyState
          icon={AlertTriangle}
          title="Couldn’t load system settings"
          description={loadError}
          action={
            <button type="button" onClick={() => fetchAll()} className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white">
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Settings"
        subtitle="Configure university identity, email delivery, integrations, SIS imports, and brand appearance."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Configuration' }]}
        lastSynced={lastSynced}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              className={`${adminHeroGhostBtnClass} ${live ? 'ring-1 ring-[#FFCC00]/40' : ''}`}
              title={live ? 'Live updates on — click to pause' : 'Live updates paused — click to resume'}
            >
              <span className="relative flex h-2 w-2">
                {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-emerald-400' : 'bg-white/40'}`} />
              </span>
              {live ? 'Live' : 'Paused'}
            </button>
            <button type="button" onClick={handleRefresh} className={adminHeroGhostBtnClass}>
              <RefreshCw className="h-4 w-4 text-[#FFCC00]" />
              Refresh
            </button>
            <button type="button" onClick={handleSaveSettings} disabled={saving || !isDirty} className={adminHeroPrimaryBtnClass}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : isDirty ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        }
      />

      {isDirty && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-[#F59E0B]/30 dark:bg-[#382B14] dark:text-[#F59E0B]">
          <span className="inline-flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            You have unsaved changes across system settings.
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setDiscardOpen(true)} className="rounded-lg border border-amber-300/60 px-3 py-1.5 font-bold hover:bg-amber-100/60 dark:border-[#F59E0B]/30">
              Discard
            </button>
            <button type="button" onClick={handleSaveSettings} disabled={saving} className="rounded-lg bg-[#003580] px-3 py-1.5 font-bold text-white">
              {saving ? 'Saving…' : 'Save now'}
            </button>
          </div>
        </div>
      )}

      <AdminStatGrid stats={summaryCards} cols={4} compact />

      <div className={adminTabRailClass} role="tablist" aria-label="System settings sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={adminTabBtnClass(activeTab === tab.key)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <AdminSectionCard
          title="General Settings"
          subtitle="University identity and regional defaults used across ASTU portals."
          headerAction={
            <button type="button" onClick={handleSaveSettings} disabled={saving || !isDirty} className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : saveButtonLabel}
            </button>
          }
        >
          {!isProfileComplete && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 dark:border-[#F59E0B]/30 dark:bg-[#382B14] dark:text-[#F59E0B]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Profile incomplete — <strong>{missingCount}</strong> required field{missingCount === 1 ? '' : 's'} missing.
              </p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <InputLabel label="University name">
              <input value={universityName} onChange={(e) => setUniversityName(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Abbreviation">
              <input value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Website">
              <input value={website} onChange={(e) => setWebsite(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Contact email">
              <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Address">
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Academic year format">
              <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Default language">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={adminInputClass}>
                <option>English</option>
                <option>Amharic</option>
              </select>
            </InputLabel>
            <InputLabel label="Timezone">
              <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Date format">
              <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className={adminInputClass}>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </InputLabel>
            <InputLabel label="System portal title">
              <input value={portalTitle} onChange={(e) => setPortalTitle(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Phone number">
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Support email">
              <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Postal code / Box">
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={adminInputClass} />
            </InputLabel>
          </div>
        </AdminSectionCard>
      )}

      {activeTab === 'email' && (
        <AdminSectionCard
          title="Email Configuration"
          subtitle="SMTP settings and outbound email identity for system alerts."
          headerAction={
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setTestEmailOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <Send className="h-3.5 w-3.5" />
                Test email
              </button>
              <button type="button" onClick={handleSaveSettings} disabled={saving || !isDirty} className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Saving…' : saveButtonLabel}
              </button>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <InputLabel label="SMTP host">
              <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Port">
              <input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} type="number" className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Username">
              <input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="Password">
              <div className="relative flex items-center">
                <input
                  type={smtpPasswordVisible ? 'text' : 'password'}
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className={`${adminInputClass} pr-16`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setSmtpPasswordVisible((prev) => !prev)}
                  className="absolute right-3 text-xs font-bold text-[#003580] hover:underline"
                >
                  {smtpPasswordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </InputLabel>
            <InputLabel label="From name">
              <input value={fromName} onChange={(e) => setFromName(e.target.value)} className={adminInputClass} />
            </InputLabel>
            <InputLabel label="From email">
              <input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className={adminInputClass} />
            </InputLabel>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2.5 text-xs text-[var(--text-secondary)]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#003580]" />
            Secrets are loaded from the server at runtime and are never hardcoded in the client bundle.
          </div>
        </AdminSectionCard>
      )}

      {activeTab === 'integrations' && (
        <AdminSectionCard
          title="Integrations"
          subtitle="Connect ASTU AMS with external services, payments, AI, and identity providers."
          headerAction={
            <button type="button" onClick={handleSaveSettings} disabled={saving || !isDirty} className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : saveButtonLabel}
            </button>
          }
        >
          <div className="space-y-8">
            <section className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">AI & payments</h4>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Model inference and payment gateway credentials.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <IntegrationItem
                    title="OpenRouter AI Engine"
                    description="Powers ASTU AI, Tracer Study analytics, and predictive outcomes."
                    status={openRouterToggle ? 'Connected' : 'Disconnected'}
                    toggleActive={openRouterToggle}
                    testing={testingType === 'openrouter'}
                    onToggle={() => setOpenRouterToggle((c) => !c)}
                    onTest={() => handleTestIntegration('openrouter', { openRouterApiKey, openRouterModel })}
                  />
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <InputLabel label="OpenRouter API key">
                      <input type="password" placeholder="sk-or-v1-…" value={openRouterApiKey} onChange={(e) => setOpenRouterApiKey(e.target.value)} className={adminInputClass} autoComplete="new-password" />
                    </InputLabel>
                    <InputLabel label="AI model">
                      <input placeholder="deepseek/deepseek-r1:free" value={openRouterModel} onChange={(e) => setOpenRouterModel(e.target.value)} className={adminInputClass} />
                    </InputLabel>
                  </div>
                </div>
                <div>
                  <IntegrationItem
                    title="Chapa Payment Gateway"
                    description="Accept online donations, alumni membership dues, and event fees."
                    status={chapaToggle ? 'Connected' : 'Disconnected'}
                    toggleActive={chapaToggle}
                    testing={testingType === 'chapa'}
                    onToggle={() => setChapaToggle((c) => !c)}
                    onTest={() => handleTestIntegration('chapa', { chapaSecretKey, chapaPublicKey })}
                  />
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <InputLabel label="Chapa secret key">
                      <input type="password" placeholder="Enter Chapa secret key" value={chapaSecretKey} onChange={(e) => setChapaSecretKey(e.target.value)} className={adminInputClass} autoComplete="new-password" />
                    </InputLabel>
                    <InputLabel label="Chapa public key">
                      <input placeholder="Enter Chapa public key" value={chapaPublicKey} onChange={(e) => setChapaPublicKey(e.target.value)} className={adminInputClass} />
                    </InputLabel>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-[var(--border-color)] pt-6">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Campus systems</h4>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Registrar sync and SMS gateway access.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <IntegrationItem
                    title="Registrar / ERP API"
                    description="Synchronize student and alumni records."
                    status={regApiToggle ? 'Connected' : 'Disconnected'}
                    toggleActive={regApiToggle}
                    testing={testingType === 'registrar'}
                    onToggle={() => setRegApiToggle((c) => !c)}
                    onTest={() => handleTestIntegration('registrar', { regApiEndpoint, regApiKey })}
                  />
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <InputLabel label="API endpoint">
                      <input value={regApiEndpoint} onChange={(e) => setRegApiEndpoint(e.target.value)} className={adminInputClass} />
                    </InputLabel>
                    <InputLabel label="API key">
                      <input value={regApiKey} onChange={(e) => setRegApiKey(e.target.value)} className={adminInputClass} autoComplete="new-password" />
                    </InputLabel>
                  </div>
                </div>
                <div>
                  <IntegrationItem
                    title="SMS Gateway (Afro Message)"
                    description="Send SMS notifications to alumni and staff."
                    status={smsToggle ? 'Connected' : 'Disconnected'}
                    toggleActive={smsToggle}
                    testing={testingType === 'sms'}
                    onToggle={() => setSmsToggle((c) => !c)}
                    onTest={() => handleTestIntegration('sms', { smsGatewayUser, smsGatewayPass })}
                  />
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <InputLabel label="Gateway username">
                      <input value={smsGatewayUser} onChange={(e) => setSmsGatewayUser(e.target.value)} className={adminInputClass} />
                    </InputLabel>
                    <InputLabel label="Gateway password">
                      <input value={smsGatewayPass} onChange={(e) => setSmsGatewayPass(e.target.value)} type="password" className={adminInputClass} autoComplete="new-password" />
                    </InputLabel>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-[var(--border-color)] pt-6">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Identity & social</h4>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Verification and OAuth providers.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <IntegrationItem
                    title="Didit Biometric & Identity Verification"
                    description="Verify alumni identities via official ID document scanning."
                    status={diditToggle ? 'Connected' : 'Disconnected'}
                    toggleActive={diditToggle}
                    testing={testingType === 'didit'}
                    onToggle={() => setDiditToggle((c) => !c)}
                    onTest={() => handleTestIntegration('didit', { diditApiKey })}
                  />
                  <div className="mt-3">
                    <InputLabel label="Didit API key">
                      <input type="password" placeholder="Enter Didit API key" value={diditApiKey} onChange={(e) => setDiditApiKey(e.target.value)} className={adminInputClass} autoComplete="new-password" />
                    </InputLabel>
                  </div>
                </div>
                <div>
                  <IntegrationItem
                    title="Google OAuth"
                    description="Allow Google-based sign-in."
                    status={googleToggle ? 'Active' : 'Inactive'}
                    toggleActive={googleToggle}
                    testing={testingType === 'google'}
                    onToggle={() => setGoogleToggle((c) => !c)}
                    onTest={() => handleTestIntegration('google', { googleClientId })}
                  />
                  <div className="mt-3">
                    <InputLabel label="Client ID">
                      <input value={googleClientId} onChange={(e) => setGoogleClientId(e.target.value)} className={adminInputClass} />
                    </InputLabel>
                  </div>
                </div>
                <IntegrationItem
                  title="LinkedIn API"
                  description="Import professional profile and career data."
                  status={linkedinToggle ? 'Connected' : 'Disconnected'}
                  toggleActive={linkedinToggle}
                  testing={testingType === 'linkedin'}
                  onToggle={() => setLinkedinToggle((c) => !c)}
                  onTest={() => handleTestIntegration('linkedin', {})}
                />
              </div>
            </section>
          </div>
        </AdminSectionCard>
      )}

      {activeTab === 'data' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <AdminSectionCard title="Data Import" subtitle="Upload graduate CSV files and map the 9 required SIS fields.">
            <div className="space-y-4">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.txt,.xlsx" className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                role="button"
                tabIndex={0}
                className="cursor-pointer rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-page)] p-8 text-center transition hover:border-[#003580]/40"
              >
                <CloudUpload className="mx-auto h-10 w-10 text-[#003580]" />
                <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">Drag & drop graduate CSV here</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">or browse files (supports 9 SIS fields)</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="rounded-xl border border-[#003580]/20 bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[#003580]"
                  >
                    Choose File
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                  <span>
                    Selected: <span className="font-semibold text-[var(--text-primary)]">{importFileName}</span>
                  </span>
                  {parsedRows.length > 0 && <AdminBadge variant="info">{parsedRows.length} parsed</AdminBadge>}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={uploadTemplate} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-semibold text-[#003580]">
                  <Download className="h-4 w-4" />
                  Download template
                </button>
                <button
                  type="button"
                  onClick={handleStartDataImport}
                  disabled={isImporting || parsedRows.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {isImporting ? 'Importing…' : 'Import into SIS'}
                </button>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Column Mapping" subtitle="Map system fields to CSV columns before importing.">
            <div className="space-y-2.5">
              {systemFields.map((field) => (
                <div key={field} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    <span>{field}</span>
                    <span className="text-[10px] font-bold uppercase text-rose-500">*</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                  <select
                    value={columnMapping[field] || ''}
                    onChange={(event) => setColumnMapping((current) => ({ ...current, [field]: event.target.value }))}
                    className={adminInputClass}
                  >
                    {availableColumns.map((column) => (
                      <option key={column} value={column}>{column}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </AdminSectionCard>

          <div className="xl:col-span-2">
            <AdminSectionCard
              title="Import History"
              subtitle="Recent file imports, record counts, and error summaries."
              headerAction={
                <button type="button" onClick={refreshImportHistory} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </button>
              }
            >
              <div className="overflow-hidden rounded-xl border border-[var(--border-color)]">
                <div className="max-h-[420px] overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr>
                        {['Filename', 'Date & Time', 'Records', 'Status', 'Errors'].map((head) => (
                          <th key={head} className={`${adminTableHeadClass} px-3.5 py-3 whitespace-nowrap`}>{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i} className="border-t border-[var(--border-color)]">
                            {Array.from({ length: 5 }).map((__, j) => (
                              <td key={j} className="px-3.5 py-3"><div className="h-3.5 animate-pulse rounded bg-[var(--bg-page)]" /></td>
                            ))}
                          </tr>
                        ))
                      ) : importHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4">
                            <AdminEmptyState
                              icon={Database}
                              title="No imports yet"
                              description="Upload a graduate CSV to populate the SIS import history."
                              action={
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white">
                                  Choose file
                                </button>
                              }
                            />
                          </td>
                        </tr>
                      ) : (
                        importHistory.map((row, idx) => (
                          <tr key={row.id || row.filename + idx} className={adminTableRowClass}>
                            <td className="px-3.5 py-3">
                              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold text-[var(--text-primary)]">
                                <Database className="h-3.5 w-3.5 text-[#003580]" />
                                {row.filename}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">{row.date}</td>
                            <td className="px-3.5 py-3 font-medium">
                              {row.records} {row.records === 1 ? 'record' : 'records'}
                              {row.duplicates ? <span className="ml-1 text-[var(--text-muted)]">({row.duplicates} updated)</span> : null}
                            </td>
                            <td className="px-3.5 py-3">
                              <AdminBadge
                                variant={
                                  row.status === 'SUCCESS' || row.status === 'Completed'
                                    ? 'success'
                                    : row.status === 'PARTIAL'
                                      ? 'warning'
                                      : 'danger'
                                }
                              >
                                {row.status === 'SUCCESS' ? 'SUCCESS' : row.status}
                              </AdminBadge>
                            </td>
                            <td className="px-3.5 py-3 font-medium">
                              {row.errors > 0 ? <span className="font-bold text-rose-600">{row.errors}</span> : <span className="text-[var(--text-muted)]">0</span>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-4">
          <AdminSectionCard title="Portal Theme Mode" subtitle="Choose the global display theme. Changes apply immediately.">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  id: 'light' as ThemeMode,
                  title: 'Light Mode',
                  description: 'Bright canvas with high-contrast text and ASTU navy accents.',
                  icon: Sun,
                },
                {
                  id: 'dark' as ThemeMode,
                  title: 'Dark Mode',
                  description: 'Deep slate canvas with reduced glare for long admin sessions.',
                  icon: Moon,
                },
                {
                  id: 'system' as ThemeMode,
                  title: 'System Default',
                  description: 'Follows your operating system or browser theme preference.',
                  icon: Monitor,
                },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = themeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setThemeMode(mode.id);
                      toast.success(`Theme set to ${mode.title}`);
                    }}
                    className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-[#003580] bg-[#003580]/5 ring-2 ring-[#003580]/20'
                        : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003580]/30'
                    }`}
                  >
                    <div className="mb-3 flex w-full items-center justify-between">
                      <div className={`rounded-lg border p-2 ${isSelected ? 'border-[#003580]/20 bg-[#003580]/10 text-[#003580]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Select</span>
                      )}
                    </div>
                    <div className="mb-1 text-sm font-bold text-[var(--text-primary)]">{mode.title}</div>
                    <p className="text-xs leading-snug text-[var(--text-secondary)]">{mode.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3 text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-2">
                <Info className="h-4 w-4 text-[#003580]" />
                Rendering in <strong className="uppercase text-[var(--text-primary)]">{theme}</strong> (setting: {themeMode}).
              </span>
              <AdminBadge variant={darkMode ? 'purple' : 'info'}>{darkMode ? 'Dark engine' : 'Light engine'}</AdminBadge>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Branding & Palette"
            subtitle="University logo and signature color presets."
            headerAction={
              <button type="button" onClick={handleSaveSettings} disabled={saving || !isDirty} className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Saving…' : saveButtonLabel}
              </button>
            }
          >
            <input type="file" ref={logoFileInputRef} onChange={handleLogoFileChange} accept="image/*" className="hidden" />

            <div className="mb-5">
              <p className={`${fieldLabel} mb-2.5`}>Institutional palette presets</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: 'ASTU Official Gold & Navy', primary: '#003366', accent: '#FFCC00', desc: 'Standard ASTU identity' },
                  { name: 'Executive Royal Tech', primary: '#003580', accent: '#E8A020', desc: 'High-contrast admin' },
                  { name: 'Emerald Campus Green', primary: '#006633', accent: '#FFD700', desc: 'Research & growth' },
                  { name: 'Modern STEM Slate', primary: '#0F172A', accent: '#38BDF8', desc: 'Engineering focus' },
                ].map((preset) => {
                  const isCurrent = primaryColor.toUpperCase() === preset.primary.toUpperCase();
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                        setAccentColor(preset.accent);
                        toast.success(`Applied ${preset.name}`);
                      }}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                        isCurrent
                          ? 'border-[#003580] bg-[#003580]/5 ring-1 ring-[#003580]/20'
                          : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003580]/30'
                      }`}
                    >
                      <div className="mb-2 flex w-full items-center gap-2">
                        <span className="h-5 w-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: preset.primary }} />
                        <span className="h-5 w-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: preset.accent }} />
                        {isCurrent && <Check className="ml-auto h-3.5 w-3.5 text-[#003580]" />}
                      </div>
                      <div className="text-xs font-bold leading-tight text-[var(--text-primary)]">{preset.name}</div>
                      <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">{preset.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">University logo</h4>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">Upload and preview the institution seal.</p>
                    </div>
                    <AdminBadge variant="neutral">Preview</AdminBadge>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <img src={logoPreview} alt="University logo preview" className="h-20 w-20 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] object-contain p-2" />
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#003580]/20 bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[#003580]"
                      >
                        <ImagePlus className="h-4 w-4" />
                        Upload logo
                      </button>
                      <button type="button" onClick={resetDefaults} className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                        <WandSparkles className="h-3.5 w-3.5 text-[#E8A020]" />
                        Reset to ASTU defaults
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputLabel label="Primary color">
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded-md border border-[var(--border-color)]" />
                      <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full bg-transparent text-sm font-medium uppercase text-[var(--text-primary)] outline-none" />
                    </div>
                  </InputLabel>
                  <InputLabel label="Accent color">
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2">
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded-md border border-[var(--border-color)]" />
                      <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full bg-transparent text-sm font-medium uppercase text-[var(--text-primary)] outline-none" />
                    </div>
                  </InputLabel>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                    <Eye className="h-4 w-4 text-[#003580]" />
                    Live preview
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Interactive</span>
                </div>
                <div className="space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
                  <div
                    className="flex items-center justify-between rounded-lg p-3 text-white"
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)` }}
                  >
                    <div>
                      <div className="text-[9px] font-extrabold uppercase tracking-widest text-[#FFCC00]">ASTU Alumni Office</div>
                      <div className="text-xs font-extrabold">Executive Preview Console</div>
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-slate-900" style={{ backgroundColor: accentColor }}>
                      Accent Live
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2.5">
                      <span className="text-[9px] font-bold uppercase text-[var(--text-muted)]">Status</span>
                      <div className="mt-0.5 font-extrabold text-[var(--text-primary)]">High-Availability</div>
                    </div>
                    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2.5">
                      <span className="text-[9px] font-bold uppercase text-[var(--text-muted)]">Coverage</span>
                      <div className="mt-0.5 font-extrabold text-[var(--text-primary)]">99.4% Verified</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-2">
                      <span className="h-4 w-4 rounded-full border border-[var(--border-color)]" style={{ backgroundColor: primaryColor }} title="Primary" />
                      <span className="h-4 w-4 rounded-full border border-[var(--border-color)]" style={{ backgroundColor: accentColor }} title="Accent" />
                    </div>
                    <button type="button" className="rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: primaryColor }}>
                      Action Button
                    </button>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-[var(--text-secondary)]">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Keep primary navy for institutional trust.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Use accent sparingly for CTAs and highlights.</li>
                </ul>
              </div>
            </div>
          </AdminSectionCard>
        </div>
      )}

      <AdminModal
        open={testEmailOpen}
        title="Send Test Email"
        subtitle="Confirm SMTP delivery to your admin inbox"
        onClose={() => setTestEmailOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setTestEmailOpen(false)} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
              Cancel
            </button>
            <button type="button" onClick={sendTestEmail} className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2 text-sm font-bold text-white">
              <Send className="h-4 w-4" />
              Send test
            </button>
          </div>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          This sends a test message to your signed-in admin address
          {user?.email ? ` (${user.email})` : ''} using the SMTP settings above.
        </p>
      </AdminModal>

      <AdminModal
        open={discardOpen}
        title="Discard unsaved changes?"
        subtitle="Reload will overwrite your local edits"
        onClose={() => setDiscardOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDiscardOpen(false)} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
              Keep editing
            </button>
            <button type="button" onClick={confirmDiscardAndRefresh} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">
              Discard & reload
            </button>
          </div>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          You have unsaved configuration changes. Reloading will restore the last saved settings from the server.
        </p>
      </AdminModal>
    </div>
  );
}
