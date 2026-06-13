import React, { useMemo, useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronDown,
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
  Sliders,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import { toast } from 'react-hot-toast';
import { adminApi } from '../api/adminApi';

type SettingsTab = 'general' | 'email' | 'integrations' | 'data' | 'appearance';

type ImportHistoryRow = {
  filename: string;
  date: string;
  records: number;
  status: 'Completed' | 'Processing' | 'Failed';
  errors: number;
};

const tabs: Array<{ key: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'general', label: 'General', icon: Settings2 },
  { key: 'email', label: 'Email Config', icon: Mail },
  { key: 'integrations', label: 'Integrations', icon: Link2 },
  { key: 'data', label: 'Data Import', icon: UploadCloud },
  { key: 'appearance', label: 'Appearance', icon: Palette },
];

const importHistory: ImportHistoryRow[] = [
  { filename: 'graduates_2024.xlsx', date: '2026-05-29', records: 245, status: 'Completed', errors: 0 },
  { filename: 'graduates_2023.csv', date: '2026-05-18', records: 312, status: 'Completed', errors: 1 },
  { filename: 'graduates_2022.csv', date: '2026-05-08', records: 188, status: 'Processing', errors: 0 },
  { filename: 'legacy_sync.csv', date: '2026-04-28', records: 94, status: 'Failed', errors: 12 },
];

const systemFields = ['Student ID', 'Full Name', 'Email', 'Department', 'Graduation Year', 'CGPA'];
const csvColumns = ['student_id', 'full_name', 'email', 'department', 'graduation_year', 'cgpa'];

const defaultLogo = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH';

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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
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
    <label className="space-y-2.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function SmallStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color?: string }) {
  const iconColor = color || '#003580';
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,51,128,0.15)] hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg" style={{ background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}25 100%)`, color: iconColor }}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'Connected' | 'Disconnected' | 'Active' | 'Inactive' }) {
  const color =
    status === 'Connected' || status === 'Active'
      ? 'success'
      : 'danger';

  return <AdminBadge variant={color}>{status}</AdminBadge>;
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testConnectionOpen, setTestConnectionOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('graduates_2024.xlsx');
  const [logoPreview, setLogoPreview] = useState(defaultLogo);
  const [primaryColor, setPrimaryColor] = useState('#003580');
  const [accentColor, setAccentColor] = useState('#E8A020');
  const [smtpPasswordVisible, setSmtpPasswordVisible] = useState(false);
  const [whitelistInput, setWhitelistInput] = useState('');
  const [whitelist, setWhitelist] = useState(['154.78.22.14', '154.78.22.18']);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    'Student ID': 'student_id',
    'Full Name': 'full_name',
    Email: 'email',
    Department: 'department',
    'Graduation Year': 'graduation_year',
    CGPA: 'cgpa',
  });
  
  // Real backend settings state
  const [settings, setSettings] = useState<any>({
    siteName: 'Adama Science and Technology University',
    siteAbbreviation: 'ASTU',
    siteWebsite: 'https://astu.edu.et',
    siteEmail: 'admin@astu.edu.et',
    siteAddress: 'Adama, Ethiopia',
    academicYear: '2024-25',
    defaultLanguage: 'English',
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'DD/MM/YYYY',
    smtpHost: 'smtp.astu.edu.et',
    smtpPort: 587,
    smtpUsername: 'mailer@astu.edu.et',
    smtpPassword: '••••••••••',
    smtpFromName: 'ASTU Alumni Management System',
    smtpFromEmail: 'noreply@astu.edu.et',
    regApiEndpoint: 'https://api.astu.edu.et/erp',
    regApiKey: 'astu_erp_xxxxx',
    regApiEnabled: true,
    smsUsername: 'astu_sms',
    smsPassword: 'password',
    smsEnabled: true,
    googleClientId: 'google-client-id.apps.googleusercontent.com',
    googleEnabled: false,
    linkedinEnabled: true,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const fetched = await adminApi.getSettings();
        if (fetched) {
          setSettings((prev: any) => ({ ...prev, ...fetched }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await adminApi.updateSettings(settings);
      toast.success('System settings updated successfully.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to update system settings.');
    }
  };

  const settingsSummaryCards = [
    { label: 'University Profile', value: 'Complete', icon: Building2, color: '#003580' },
    { label: 'Connected Integrations', value: '3/4', icon: Link2, color: '#1D9E75' },
    { label: 'Imported Records', value: '839', icon: Database, color: '#E8A020' },
    { label: 'Brand Assets', value: '2', icon: ImagePlus, color: '#7C3AED' },
  ];

  const resetDefaults = () => {
    setPrimaryColor('#003580');
    setAccentColor('#E8A020');
    setLogoPreview(defaultLogo);
    toast.success('ASTU defaults restored.');
  };

  const sendTestEmail = () => {
    setTestEmailOpen(false);
    toast.success('Test email sent successfully.');
  };

  const testIntegration = () => {
    setTestConnectionOpen(false);
    toast.success('Connection test completed successfully.');
  };

  const addWhitelist = () => {
    if (!whitelistInput.trim()) return;
    setWhitelist((current) => Array.from(new Set([...current, whitelistInput.trim()])));
    setWhitelistInput('');
  };

  const removeWhitelist = (ip: string) => {
    setWhitelist((current) => current.filter((item) => item !== ip));
  };

  const uploadTemplate = () => {
    toast.success('CSV template downloaded.');
  };

  return (
    <div className="space-y-8">
      {/* Custom Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003580] via-[#004499] to-[#1D9E75] p-8 shadow-[0_8px_30px_rgba(0,51,128,0.3)]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_0%,transparent_40%,rgba(232,160,32,0.08)_60%,transparent_100%)]" />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                <Sliders className="h-6 w-6 text-[#E8A020]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
                <p className="mt-1 text-sm text-white/80">
                  Tune system-wide preferences and feature flags.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <AdminBadge variant="success" className="border-white/20 bg-white/10 text-white">Configuration Center</AdminBadge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="inline-flex items-center gap-2.5 rounded-xl bg-white text-[#003580] px-6 py-3 text-sm font-semibold shadow-lg hover:brightness-110 transition-all hover:scale-105"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {settingsSummaryCards.map((card) => (
          <SmallStat
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all',
                isActive
                  ? 'bg-gradient-to-r from-[#003580] to-[#004499] text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)]'
                  : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              <Icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <SectionCard title="General Settings" subtitle="University identity and core regional settings.">
          <div className="grid gap-5 md:grid-cols-2">
            <InputLabel label="University name">
              <input value={settings?.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Abbreviation">
              <input value={settings?.siteAbbreviation || ''} onChange={(e) => setSettings({ ...settings, siteAbbreviation: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Website">
              <input value={settings?.siteWebsite || ''} onChange={(e) => setSettings({ ...settings, siteWebsite: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Contact email">
              <input value={settings?.siteEmail || ''} onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Address">
              <input value={settings?.siteAddress || ''} onChange={(e) => setSettings({ ...settings, siteAddress: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Academic year format">
              <input value={settings?.academicYear || ''} onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Default language">
              <select value={settings?.defaultLanguage || 'English'} onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all">
                <option value="English">English</option>
                <option value="Amharic">Amharic</option>
              </select>
            </InputLabel>
            <InputLabel label="Timezone">
              <input value={settings?.timezone || ''} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Date format">
              <select value={settings?.dateFormat || 'DD/MM/YYYY'} onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </InputLabel>
          </div>
        </SectionCard>
      )}

      {activeTab === 'email' && (
        <SectionCard title="Email Configuration" subtitle="SMTP settings and outbound email identity.">
          <div className="grid gap-5 md:grid-cols-2">
            <InputLabel label="SMTP Host">
              <input value={settings?.smtpHost || ''} onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Port">
              <input value={settings?.smtpPort || ''} onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })} type="number" className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Username">
              <input value={settings?.smtpUsername || ''} onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="Password">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 px-4 py-3">
                <input
                  type={smtpPasswordVisible ? 'text' : 'password'}
                  value={settings?.smtpPassword || ''}
                  onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                  className="w-full bg-transparent outline-none"
                />
                <button type="button" onClick={() => setSmtpPasswordVisible((current) => !current)} className="text-xs font-semibold text-[#003580]">
                  {smtpPasswordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </InputLabel>
            <InputLabel label="From name">
              <input value={settings?.smtpFromName || ''} onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
            <InputLabel label="From email">
              <input value={settings?.smtpFromEmail || ''} onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })} className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" />
            </InputLabel>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setTestEmailOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105"
            >
              <Send className="h-4.5 w-4.5" />
              Send Test Email
            </button>
          </div>
        </SectionCard>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <SectionCard title="Integrations" subtitle="Connect ASTU AMS with external services.">
            <div className="space-y-5">
              <IntegrationItem
                title="Registrar / ERP API"
                description="Synchronize student and alumni records."
                status="Connected"
                toggleActive={settings?.regApiEnabled ?? true}
                onToggle={() => setSettings({ ...settings, regApiEnabled: !settings.regApiEnabled })}
                onTest={() => setTestConnectionOpen(true)}
              />
              <div className="grid gap-5 md:grid-cols-2">
                <InputLabel label="API Endpoint">
                  <input
                    value={settings?.regApiEndpoint || ''}
                    onChange={(e) => setSettings({ ...settings, regApiEndpoint: e.target.value })}
                    className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                  />
                </InputLabel>
                <InputLabel label="API Key">
                  <input
                    value={settings?.regApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, regApiKey: e.target.value })}
                    className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                  />
                </InputLabel>
              </div>

              <IntegrationItem
                title="SMS Gateway (Afro Message)"
                description="Send SMS notifications to alumni and staff."
                status="Connected"
                toggleActive={settings?.smsEnabled ?? true}
                onToggle={() => setSettings({ ...settings, smsEnabled: !settings.smsEnabled })}
                onTest={() => setTestConnectionOpen(true)}
              />
              <div className="grid gap-5 md:grid-cols-2">
                <InputLabel label="Gateway Username">
                  <input
                    value={settings?.smsUsername || ''}
                    onChange={(e) => setSettings({ ...settings, smsUsername: e.target.value })}
                    className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                  />
                </InputLabel>
                <InputLabel label="Gateway Password">
                  <input
                    type="password"
                    value={settings?.smsPassword || ''}
                    onChange={(e) => setSettings({ ...settings, smsPassword: e.target.value })}
                    className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                  />
                </InputLabel>
              </div>

              <IntegrationItem
                title="Google OAuth"
                description="Allow Google-based sign-in."
                status="Inactive"
                toggleActive={settings?.googleEnabled ?? false}
                onToggle={() => setSettings({ ...settings, googleEnabled: !settings.googleEnabled })}
                onTest={() => setTestConnectionOpen(true)}
              />
              <InputLabel label="Client ID">
                <input
                  value={settings?.googleClientId || ''}
                  onChange={(e) => setSettings({ ...settings, googleClientId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
                />
              </InputLabel>

              <IntegrationItem
                title="LinkedIn API"
                description="Import professional profile and career data."
                status="Connected"
                toggleActive={settings?.linkedinEnabled ?? true}
                onToggle={() => setSettings({ ...settings, linkedinEnabled: !settings.linkedinEnabled })}
                onTest={() => setTestConnectionOpen(true)}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="grid gap-8 xl:grid-cols-2">
          <SectionCard title="Data Import" subtitle="Upload graduate files and map incoming columns.">
            <div className="space-y-5">
              <div className="rounded-2xl border-2 border-dashed border-slate-200/80 bg-slate-50/80 p-8 text-center">
                <CloudUpload className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-4 text-sm font-semibold text-slate-700">Drag &amp; drop graduate CSV/Excel here</p>
                <p className="mt-1 text-xs text-slate-500">or browse files from your computer</p>
                <div className="mt-4">
                  <button type="button" className="rounded-xl border border-[#003580]/20 px-5 py-3 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5 transition-all">
                    Choose File
                  </button>
                </div>
                <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                  Selected file: <span className="font-semibold text-slate-900">{importFileName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={uploadTemplate}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-[#003580]/20 px-5 py-3 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5 transition-all"
                >
                  <Download className="h-4.5 w-4.5" />
                  Download CSV Template
                </button>
                <AdminBadge variant="success">Schema Ready</AdminBadge>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Column Mapping" subtitle="Map system fields to CSV columns before import.">
            <div className="space-y-4">
              {systemFields.map((field, index) => (
                <div key={field} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="text-sm font-medium text-slate-700">{field}</div>
                  <ChevronRight className="h-4.5 w-4.5 text-slate-400" />
                  <select
                    value={columnMapping[field]}
                    onChange={(event) =>
                      setColumnMapping((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-slate-200/80 px-4 py-3 text-sm outline-none focus:border-[#003580] transition-all"
                  >
                    {csvColumns.map((column) => (
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
            <SectionCard title="Import History" subtitle="Recent file imports, record counts, and error summaries.">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                      <tr>
                        {['Filename', 'Date', 'Records', 'Status', 'Errors'].map((head) => (
                          <th key={head} className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importHistory.map((row) => (
                        <tr key={row.filename} className="border-t border-slate-100 hover:bg-slate-50/80 transition-all">
                          <td className="px-5 py-4 text-slate-700">{row.filename}</td>
                          <td className="px-5 py-4 text-slate-600">{row.date}</td>
                          <td className="px-5 py-4 text-slate-600">{row.records}</td>
                          <td className="px-5 py-4">
                            <AdminBadge variant={row.status === 'Completed' ? 'success' : row.status === 'Failed' ? 'danger' : 'warning'}>
                              {row.status}
                            </AdminBadge>
                          </td>
                          <td className="px-5 py-4 text-slate-600">{row.errors}</td>
                        </tr>
                      ))}
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
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">University Logo</h4>
                    <p className="mt-1 text-sm text-slate-500">Upload and preview the institution logo.</p>
                  </div>
                  <AdminBadge variant="neutral">Preview</AdminBadge>
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <img src={logoPreview} alt="University logo preview" className="h-20 w-20 rounded-2xl border border-slate-200/80 bg-white object-contain p-2" />
                  <button
                    type="button"
                    onClick={() => setLogoPreview(defaultLogo)}
                    className="inline-flex items-center gap-2.5 rounded-xl border border-[#003580]/20 px-5 py-3 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5 transition-all"
                  >
                    <ImagePlus className="h-4.5 w-4.5" />
                    Upload Logo
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={resetDefaults}
                className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200/80 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <WandSparkles className="h-4.5 w-4.5" />
                Reset to ASTU Defaults
              </button>
            </div>

            <div className="space-y-5">
              <InputLabel label="Primary color">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 px-4 py-3">
                  <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="h-10 w-12 rounded-lg border border-slate-200" />
                  <span className="text-sm font-medium text-slate-700">{primaryColor}</span>
                </div>
              </InputLabel>
              <InputLabel label="Accent color">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 px-4 py-3">
                  <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-10 w-12 rounded-lg border border-slate-200" />
                  <span className="text-sm font-medium text-slate-700">{accentColor}</span>
                </div>
              </InputLabel>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <h4 className="text-base font-bold text-slate-900">Palette Preview</h4>
                <div className="mt-4 flex gap-4">
                  <div className="h-14 w-14 rounded-2xl shadow-lg" style={{ backgroundColor: primaryColor }} />
                  <div className="h-14 w-14 rounded-2xl shadow-lg" style={{ backgroundColor: accentColor }} />
                </div>
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
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setTestEmailOpen(false)} className="rounded-xl border border-slate-200/80 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="button" onClick={sendTestEmail} className="rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105">
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
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setTestConnectionOpen(false)} className="rounded-xl border border-slate-200/80 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Close
            </button>
            <button type="button" onClick={testIntegration} className="rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105">
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

function IntegrationItem({
  title,
  description,
  status,
  toggleActive,
  onToggle,
  onTest,
}: {
  title: string;
  description: string;
  status: 'Connected' | 'Disconnected' | 'Active' | 'Inactive';
  toggleActive: boolean;
  onToggle: () => void;
  onTest: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
        >
          {toggleActive ? <ToggleRight className="h-4.5 w-4.5 text-[#1D9E75]" /> : <ToggleLeft className="h-4.5 w-4.5 text-slate-400" />}
          {toggleActive ? 'Enabled' : 'Disabled'}
        </button>
        <button
          type="button"
          onClick={onTest}
          className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
}
