import React, { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  Database,
  Download,
  Globe2,
  ImagePlus,
  Info,
  Link2,
  Mail,
  Palette,
  RefreshCw,
  Save,
  Send,
  Settings2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UploadCloud,
  UserCog,
  WandSparkles,
  X,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminStatCard from '../components/AdminStatCard';
import { toast } from 'react-hot-toast';
import { adminService } from '../services/admin.service';
import { useSystemSettings } from '../../../context/SystemSettingsContext';

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
    } catch (_) {
      errorsCount = 0;
    }
  }

  if (filename === 'sis_batch_import.csv' && log.id) {
    filename = `sync_log_${log.id.slice(0, 8)}.csv`;
  }

  const syncedDate = log.syncedAt ? new Date(log.syncedAt) : new Date();
  const formattedDate = syncedDate.toLocaleDateString() + ', ' + syncedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

const defaultLogo = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH';

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function InputLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: 'Connected' | 'Disconnected' | 'Active' | 'Inactive' }) {
  const color =
    status === 'Connected' || status === 'Active'
      ? 'success'
      : 'danger';

  return <AdminBadge variant={color}>{status}</AdminBadge>;
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
    <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          {toggleActive ? <ToggleRight className="h-4 w-4 text-[#1D9E75]" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
          {toggleActive ? 'Enabled' : 'Disabled'}
        </button>
        <button
          type="button"
          onClick={onTest}
          disabled={testing}
          className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
}

export default function SystemSettings() {
  const { updateSettingsState } = useSystemSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testConnectionOpen, setTestConnectionOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- General Settings State ---
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

  // --- Email Config State ---
  // Secrets start empty. These previously shipped as hardcoded literals in the
  // client bundle, exposing the live SMTP app password and sender account to
  // anyone who loaded the page. They are now fetched from the server at runtime.
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromName, setFromName] = useState('ASTU Alumni Management System');
  const [fromEmail, setFromEmail] = useState('');
  const [smtpPasswordVisible, setSmtpPasswordVisible] = useState(false);

  // --- Integration Toggles & Credentials ---
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

  // --- Data Import ---
  const [importFileName, setImportFileName] = useState('graduates_2024.csv');
  const [availableColumns, setAvailableColumns] = useState<string[]>(csvColumns);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  // --- Appearance ---
  const [logoPreview, setLogoPreview] = useState(defaultLogo);
  const [primaryColor, setPrimaryColor] = useState('#003580');
  const [accentColor, setAccentColor] = useState('#E8A020');

  const [totalSisCount, setTotalSisCount] = useState<number>(0);

  // Fetch settings and import history on mount
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch saved settings from backend
        const settingsResult = await adminService.getSettings();
        if (settingsResult.ok && settingsResult.data) {
          const s = settingsResult.data;
          if (s.totalSisRecords !== undefined) {
            setTotalSisCount(Number(s.totalSisRecords));
          }
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
        }

        // Fetch import history
        const logsResult = await adminService.getSyncLogs();
        if (logsResult.ok) {
          setImportHistory(logsResult.data.map(parseImportLog));
        }
      } catch (err) {
        // silently fail - use defaults
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- Save Settings ---
  const handleSaveSettings = async () => {
    setSaving(true);
    const settingsPayload: Record<string, any> = {
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
    };

    const result = await adminService.updateSettings(settingsPayload);
    setSaving(false);
    if (result.ok) {
      updateSettingsState(settingsPayload);
      toast.success('Settings saved successfully!');
    } else {
      toast.error(result.message || 'Failed to save settings.');
    }
  };

  // --- Dynamic Summary Metrics ---
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

  const allIntegrations = [
    openRouterToggle,
    chapaToggle,
    diditToggle,
    regApiToggle,
    smsToggle,
    googleToggle,
    linkedinToggle,
  ];
  const connectedIntegrations = allIntegrations.filter(Boolean).length;
  const totalIntegrations = allIntegrations.length;
  const pendingIntegrations = totalIntegrations - connectedIntegrations;

  const totalImportedRecordsFromLogs = importHistory.reduce((sum, row) => sum + row.records, 0);
  const realTotalImported = Math.max(totalSisCount, totalImportedRecordsFromLogs);

  const todayStr = new Date().toLocaleDateString();
  const addedToday = importHistory
    .filter((row) => row.date.includes(todayStr) || row.date.startsWith(todayStr))
    .reduce((sum, row) => sum + row.records, 0);

  const brandAssetsCount =
    (logoPreview ? 1 : 0) +
    (primaryColor ? 1 : 0) +
    (accentColor ? 1 : 0);

  const brandTrendLabel =
    logoPreview && primaryColor && accentColor
      ? 'Logo + palette'
      : logoPreview
      ? 'Logo configured'
      : 'Palette configured';

  const settingsSummaryCards = [
    {
      title: 'University Profile',
      value: isProfileComplete ? 'Complete' : 'Incomplete',
      icon: Building2,
      tone: isProfileComplete ? ('blue' as const) : ('amber' as const),
      trend: isProfileComplete
        ? 'Identity synced'
        : missingCount === 1
        ? '1 field missing'
        : `${missingCount} fields missing`,
    },
    {
      title: 'Connected Integrations',
      value: `${connectedIntegrations}/${totalIntegrations}`,
      icon: Link2,
      tone: 'green' as const,
      trend:
        pendingIntegrations === 0
          ? 'All integrations active'
          : pendingIntegrations === 1
          ? '1 pending test'
          : `${pendingIntegrations} pending tests`,
    },
    {
      title: 'Imported Records',
      value: loading ? '...' : realTotalImported.toLocaleString(),
      icon: Database,
      tone: 'gold' as const,
      trend: addedToday > 0 ? `${addedToday.toLocaleString()} added today` : 'No imports today',
    },
    {
      title: 'Brand Assets',
      value: `${brandAssetsCount}`,
      icon: ImagePlus,
      tone: 'purple' as const,
      trend: brandTrendLabel,
    },
  ];

  const [testingType, setTestingType] = useState<string | null>(null);

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

  const logoFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setLogoPreview(dataUrl);
        toast.success('Logo file loaded. Click "Save Appearance" to apply system-wide.');
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

    toast.success('ASTU appearance defaults restored and saved to database.');
  };

  const sendTestEmail = () => {
    handleTestIntegration('email', { smtpHost, smtpPort, smtpUser, smtpPassword, fromName, fromEmail });
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

      // Auto-match column mappings
      const newMapping = { ...columnMapping };
      systemFields.forEach((field) => {
        const fieldClean = field.toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = headers.find((h) => {
          const hClean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          return hClean === fieldClean || hClean.includes(fieldClean) || fieldClean.includes(hClean);
        });
        if (match) {
          newMapping[field] = match;
        }
      });
      setColumnMapping(newMapping);
      toast.success(`Loaded file "${file.name}" (${rows.length} records detected).`);
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
    toast.success('Downloaded ASTU SIS 9-field CSV Template.');
  };

  const handleStartDataImport = async () => {
    let rowsToImport = parsedRows;

    if (rowsToImport.length === 0) {
      // Default initial sample records if user clicks import directly
      rowsToImport = [
        {
          student_id: 'UGR/3001/14',
          full_name: 'Solomon Tadesse',
          email: 'solomon.t@astu.edu.et',
          phone: '+251911998877',
          department: 'Software Engineering',
          graduation_year: '2024',
          cgpa: '3.82',
          gender: 'Male',
          date_of_birth: '2001-03-15',
        },
        {
          student_id: 'UGR/3002/14',
          full_name: 'Meron Alemayehu',
          email: 'meron.a@astu.edu.et',
          phone: '+251922887766',
          department: 'Computer Science & Engineering',
          graduation_year: '2024',
          cgpa: '3.91',
          gender: 'Female',
          date_of_birth: '2001-07-20',
        },
        {
          student_id: 'UGR/3003/14',
          full_name: 'Yonas Gebre',
          email: 'yonas.g@astu.edu.et',
          phone: '+251933776655',
          department: 'Electrical & Computer Engineering',
          graduation_year: '2024',
          cgpa: '3.70',
          gender: 'Male',
          date_of_birth: '2000-12-10',
        },
      ];
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

    const result = await adminService.importData({
      records: mappedRecords,
      fileName: importFileName,
    });

    setIsImporting(false);

    if (result.ok && result.data) {
      toast.success(result.data.message || 'Import executed successfully!');

      // Refresh sync logs from server
      const logsResult = await adminService.getSyncLogs();
      if (logsResult.ok) {
        setImportHistory(logsResult.data.map(parseImportLog));
      }
    } else {
      toast.error(result.message || 'Failed to execute data import.');
    }
  };

  const refreshImportHistory = async () => {
    const logsResult = await adminService.getSyncLogs();
    if (logsResult.ok) {
      setImportHistory(logsResult.data.map(parseImportLog));
      toast.success('Import history refreshed.');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Settings"
        subtitle="Tune system-wide preferences and feature flags."
        breadcrumbs={[{ label: 'Admin' }, { label: 'System Settings' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="success">Configuration Center</AdminBadge>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {settingsSummaryCards.map((card) => (
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

      <div className="flex flex-wrap gap-2 rounded-[10px] border border-slate-200 bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'inline-flex items-center gap-2 rounded-[8px] px-4 py-2 text-sm font-semibold transition-colors',
                isActive ? 'bg-[#003580] text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]' : 'text-slate-600 hover:bg-slate-100',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <SectionCard title="General Settings" subtitle="University identity and core regional settings.">
          <div className="grid gap-4 md:grid-cols-2">
            <InputLabel label="University name">
              <input value={universityName} onChange={(e) => setUniversityName(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Abbreviation">
              <input value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Website">
              <input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Contact email">
              <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Address">
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Academic year format">
              <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Default language">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]">
                <option>English</option>
                <option>Amharic</option>
              </select>
            </InputLabel>
            <InputLabel label="Timezone">
              <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Date format">
              <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </InputLabel>
            <InputLabel label="System Portal Title">
              <input value={portalTitle} onChange={(e) => setPortalTitle(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Phone number">
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Support email">
              <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Postal code / Box">
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save General Settings'}
            </button>
          </div>
        </SectionCard>
      )}

      {activeTab === 'email' && (
        <SectionCard title="Email Configuration" subtitle="SMTP settings and outbound email identity.">
          <div className="grid gap-4 md:grid-cols-2">
            <InputLabel label="SMTP Host">
              <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Port">
              <input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} type="number" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Username">
              <input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Password">
              <div className="relative flex items-center">
                <input
                  type={smtpPasswordVisible ? 'text' : 'password'}
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className="w-full rounded-[8px] border border-slate-200 py-2.5 pl-3 pr-16 outline-none focus:border-[#003580]"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSmtpPasswordVisible((prev) => !prev);
                  }}
                  className="absolute right-3 text-xs font-semibold text-[#003580] hover:underline"
                >
                  {smtpPasswordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </InputLabel>
            <InputLabel label="From name">
              <input value={fromName} onChange={(e) => setFromName(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="From email">
              <input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setTestEmailOpen(true)}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5"
            >
              <Send className="h-4 w-4" />
              Send Test Email
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Email Config'}
            </button>
          </div>
        </SectionCard>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <SectionCard title="Integrations" subtitle="Connect ASTU AMS with external services and AI models.">
            <div className="space-y-6">
              {/* OpenRouter AI Engine */}
              <div>
                <IntegrationItem
                  title="OpenRouter AI Engine"
                  description="Powers ASTU AI, Tracer Study analytics, and predictive outcomes."
                  status={openRouterToggle ? 'Connected' : 'Disconnected'}
                  toggleActive={openRouterToggle}
                  testing={testingType === 'openrouter'}
                  onToggle={() => setOpenRouterToggle((current) => !current)}
                  onTest={() => handleTestIntegration('openrouter', { openRouterApiKey, openRouterModel })}
                />
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <InputLabel label="OpenRouter API Key">
                    <input
                      type="password"
                      placeholder="sk-or-v1-..."
                      value={openRouterApiKey}
                      onChange={(e) => setOpenRouterApiKey(e.target.value)}
                      className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                    />
                  </InputLabel>
                  <InputLabel label="AI Model">
                    <input
                      placeholder="deepseek/deepseek-r1:free"
                      value={openRouterModel}
                      onChange={(e) => setOpenRouterModel(e.target.value)}
                      className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                    />
                  </InputLabel>
                </div>
              </div>

              {/* Chapa Payment Gateway */}
              <div>
                <IntegrationItem
                  title="Chapa Payment Gateway"
                  description="Accept online donations, alumni membership dues, and event fees."
                  status={chapaToggle ? 'Connected' : 'Disconnected'}
                  toggleActive={chapaToggle}
                  testing={testingType === 'chapa'}
                  onToggle={() => setChapaToggle((current) => !current)}
                  onTest={() => handleTestIntegration('chapa', { chapaSecretKey, chapaPublicKey })}
                />
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <InputLabel label="Chapa Secret Key">
                    <input
                      type="password"
                      placeholder="Enter your Chapa secret key"
                      value={chapaSecretKey}
                      onChange={(e) => setChapaSecretKey(e.target.value)}
                      className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                    />
                  </InputLabel>
                  <InputLabel label="Chapa Public Key">
                    <input
                      placeholder="Enter your Chapa public key"
                      value={chapaPublicKey}
                      onChange={(e) => setChapaPublicKey(e.target.value)}
                      className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                    />
                  </InputLabel>
                </div>
              </div>

              {/* Didit Identity Verification */}
              <div>
                <IntegrationItem
                  title="Didit Biometric & Identity Verification"
                  description="Verify alumni identities via official ID document scanning."
                  status={diditToggle ? 'Connected' : 'Disconnected'}
                  toggleActive={diditToggle}
                  testing={testingType === 'didit'}
                  onToggle={() => setDiditToggle((current) => !current)}
                  onTest={() => handleTestIntegration('didit', { diditApiKey })}
                />
                <div className="mt-3">
                  <InputLabel label="Didit API Key">
                    <input
                      type="password"
                      placeholder="Enter your Didit API key"
                      value={diditApiKey}
                      onChange={(e) => setDiditApiKey(e.target.value)}
                      className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                    />
                  </InputLabel>
                </div>
              </div>

              {/* Registrar API */}
              <div>
                <IntegrationItem
                  title="Registrar / ERP API"
                  description="Synchronize student and alumni records."
                  status={regApiToggle ? 'Connected' : 'Disconnected'}
                  toggleActive={regApiToggle}
                  testing={testingType === 'registrar'}
                  onToggle={() => setRegApiToggle((current) => !current)}
                  onTest={() => handleTestIntegration('registrar', { regApiEndpoint, regApiKey })}
                />
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <InputLabel label="API Endpoint">
                    <input value={regApiEndpoint} onChange={(e) => setRegApiEndpoint(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
                  </InputLabel>
                  <InputLabel label="API Key">
                    <input value={regApiKey} onChange={(e) => setRegApiKey(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
                  </InputLabel>
                </div>
              </div>

              {/* SMS Gateway */}
              <div>
                <IntegrationItem
                  title="SMS Gateway (Afro Message)"
                  description="Send SMS notifications to alumni and staff."
                  status={smsToggle ? 'Connected' : 'Disconnected'}
                  toggleActive={smsToggle}
                  testing={testingType === 'sms'}
                  onToggle={() => setSmsToggle((current) => !current)}
                  onTest={() => handleTestIntegration('sms', { smsGatewayUser, smsGatewayPass })}
                />
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <InputLabel label="Gateway Username">
                    <input value={smsGatewayUser} onChange={(e) => setSmsGatewayUser(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
                  </InputLabel>
                  <InputLabel label="Gateway Password">
                    <input value={smsGatewayPass} onChange={(e) => setSmsGatewayPass(e.target.value)} type="password" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
                  </InputLabel>
                </div>
              </div>

              {/* Google OAuth */}
              <div>
                <IntegrationItem
                  title="Google OAuth"
                  description="Allow Google-based sign-in."
                  status={googleToggle ? 'Active' : 'Inactive'}
                  toggleActive={googleToggle}
                  testing={testingType === 'google'}
                  onToggle={() => setGoogleToggle((current) => !current)}
                  onTest={() => handleTestIntegration('google', { googleClientId })}
                />
                <div className="mt-3">
                  <InputLabel label="Client ID">
                    <input value={googleClientId} onChange={(e) => setGoogleClientId(e.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
                  </InputLabel>
                </div>
              </div>

              {/* LinkedIn API */}
              <div>
                <IntegrationItem
                  title="LinkedIn API"
                  description="Import professional profile and career data."
                  status={linkedinToggle ? 'Connected' : 'Disconnected'}
                  toggleActive={linkedinToggle}
                  testing={testingType === 'linkedin'}
                  onToggle={() => setLinkedinToggle((current) => !current)}
                  onTest={() => handleTestIntegration('linkedin', {})}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Integrations'}
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="Data Import" subtitle="Upload graduate files and map incoming columns (9 SIS Fields).">
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, .txt, .xlsx"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-[10px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition-colors hover:border-[#003580]/40 hover:bg-slate-100/50"
              >
                <CloudUpload className="mx-auto h-10 w-10 text-[#003580]" />
                <p className="mt-4 text-sm font-semibold text-slate-700">Drag &amp; drop graduate CSV/Excel here</p>
                <p className="mt-1 text-xs text-slate-500">or browse files from your computer (Supports 9 SIS fields)</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="rounded-[8px] border border-[#003580]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5 shadow-sm"
                  >
                    Choose File
                  </button>
                </div>
                <div className="mt-4 rounded-[8px] bg-white px-3 py-2 text-sm text-slate-600 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-between">
                  <span>Selected file: <span className="font-semibold text-slate-900">{importFileName}</span></span>
                  {parsedRows.length > 0 && (
                    <AdminBadge variant="info">{parsedRows.length} Records Parsed</AdminBadge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={uploadTemplate}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </button>
                
                <button
                  type="button"
                  onClick={handleStartDataImport}
                  disabled={isImporting}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 shadow-sm"
                >
                  {isImporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {isImporting ? 'Importing into SIS...' : 'Import Records into SIS'}
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Column Mapping (9 Required SIS Fields)" subtitle="Map system fields to CSV columns before importing to PostgreSQL.">
            <div className="space-y-3">
              {systemFields.map((field) => (
                <div key={field} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[10px] border border-slate-200 bg-slate-50 p-3">
                  <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span>{field}</span>
                    <span className="text-[10px] uppercase font-bold text-red-500">*</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <select
                    value={columnMapping[field] || ''}
                    onChange={(event) =>
                      setColumnMapping((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] bg-white"
                  >
                    {availableColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="xl:col-span-2">
            <SectionCard
              title="Import History"
              subtitle="Recent file imports, record counts, and error summaries."
              action={
                <button
                  type="button"
                  onClick={refreshImportHistory}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh History
                </button>
              }
            >
              <div className="overflow-hidden rounded-[10px] border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Filename', 'Date & Time', 'Records Processed', 'Status', 'Errors'].map((head) => (
                          <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                            Loading import history...
                          </td>
                        </tr>
                      ) : importHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                            No data imports recorded yet.
                          </td>
                        </tr>
                      ) : (
                        importHistory.map((row, idx) => (
                          <tr key={row.id || row.filename + idx} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800 flex items-center gap-2">
                              <Database className="h-3.5 w-3.5 text-[#003580]" />
                              {row.filename}
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-xs">{row.date}</td>
                            <td className="px-4 py-3 text-slate-700 text-xs font-medium">
                              {row.records} {row.records === 1 ? 'record' : 'records'}
                              {row.duplicates ? <span className="ml-1 text-[11px] text-slate-400">({row.duplicates} updated)</span> : null}
                            </td>
                            <td className="px-4 py-3">
                              <AdminBadge
                                variant={
                                  row.status === 'SUCCESS' || row.status === 'Completed'
                                    ? 'success'
                                    : row.status === 'PARTIAL'
                                    ? 'warning'
                                    : 'danger'
                                }
                              >
                                {row.status === 'SUCCESS' ? 'SUCCESS' : row.status === 'PARTIAL' ? 'PARTIAL' : row.status === 'FAILED' ? 'FAILED' : row.status}
                              </AdminBadge>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium">
                              {row.errors > 0 ? (
                                <span className="text-red-600 font-bold">{row.errors} errors</span>
                              ) : (
                                <span className="text-slate-400">0</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <SectionCard title="Appearance" subtitle="Branding and visual identity configuration.">
          <input
            type="file"
            ref={logoFileInputRef}
            onChange={handleLogoFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">University Logo</h4>
                    <p className="mt-1 text-xs text-slate-500">Upload and preview the institution logo.</p>
                  </div>
                  <AdminBadge variant="neutral">Preview</AdminBadge>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <img src={logoPreview} alt="University logo preview" className="h-20 w-20 rounded-[10px] border border-slate-200 bg-white object-contain p-2 shadow-xs" />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5 shadow-xs"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Upload Logo
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={resetDefaults}
                className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-xs"
              >
                <WandSparkles className="h-4 w-4 text-[#E8A020]" />
                Reset to ASTU Defaults
              </button>
            </div>

            <div className="space-y-4">
              <InputLabel label="Primary color">
                <div className="flex items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-2">
                  <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="h-8 w-10 cursor-pointer rounded-md border border-slate-200" />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    className="w-full text-sm font-medium text-slate-700 outline-none uppercase"
                  />
                </div>
              </InputLabel>
              <InputLabel label="Accent color">
                <div className="flex items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-2">
                  <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-8 w-10 cursor-pointer rounded-md border border-slate-200" />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(event) => setAccentColor(event.target.value)}
                    className="w-full text-sm font-medium text-slate-700 outline-none uppercase"
                  />
                </div>
              </InputLabel>

              <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-semibold text-slate-900">Palette Preview</h4>
                <div className="mt-3 flex gap-3">
                  <div className="flex h-14 w-28 items-center justify-center rounded-[10px] text-xs font-bold text-white shadow-inner" style={{ backgroundColor: primaryColor }}>
                    Primary
                  </div>
                  <div className="flex h-14 w-28 items-center justify-center rounded-[10px] text-xs font-bold text-white shadow-inner" style={{ backgroundColor: accentColor }}>
                    Accent
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Appearance'}
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      <AdminModal
        open={testEmailOpen}
        title="Send Test Email"
        onClose={() => setTestEmailOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setTestEmailOpen(false)} className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={sendTestEmail} className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
              Send
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">This sends a test email to the configured from address and confirms SMTP delivery.</p>
      </AdminModal>

      <AdminModal
        open={testConnectionOpen}
        title="Test Connection"
        onClose={() => setTestConnectionOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setTestConnectionOpen(false)} className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Close
            </button>
            <button type="button" onClick={() => { setTestConnectionOpen(false); handleTestIntegration('openrouter'); }} className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
              Run Test
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">This validates the selected integration endpoint and returns the connection status.</p>
      </AdminModal>
    </div>
  );
}
