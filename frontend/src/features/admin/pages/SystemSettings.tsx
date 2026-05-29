import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminStatCard from '../components/AdminStatCard';
import { toast } from 'react-hot-toast';

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
    <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
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

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testConnectionOpen, setTestConnectionOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('graduates_2024.xlsx');
  const [logoPreview, setLogoPreview] = useState(defaultLogo);
  const [primaryColor, setPrimaryColor] = useState('#003580');
  const [accentColor, setAccentColor] = useState('#E8A020');
  const [smtpPasswordVisible, setSmtpPasswordVisible] = useState(false);
  const [regApiToggle, setRegApiToggle] = useState(true);
  const [smsToggle, setSmsToggle] = useState(true);
  const [googleToggle, setGoogleToggle] = useState(false);
  const [linkedinToggle, setLinkedinToggle] = useState(true);
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
  const settingsSummaryCards = [
    { title: 'University Profile', value: 'Complete', icon: Building2, tone: 'blue' as const, trend: 'Identity synced' },
    { title: 'Connected Integrations', value: '3/4', icon: Link2, tone: 'green' as const, trend: '1 pending test' },
    { title: 'Imported Records', value: '839', icon: Database, tone: 'gold' as const, trend: '245 added today' },
    { title: 'Brand Assets', value: '2', icon: ImagePlus, tone: 'purple' as const, trend: 'Logo + palette' },
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
    <div className="space-y-6">
      <AdminPageHeader
        title="System Settings"
        subtitle="Tune system-wide preferences and feature flags."
        breadcrumbs={[{ label: 'Admin' }, { label: 'System Settings' }]}
        actions={<AdminBadge variant="success">Configuration Center</AdminBadge>}
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
              <input defaultValue="Adama Science and Technology University" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Abbreviation">
              <input defaultValue="ASTU" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Website">
              <input defaultValue="https://astu.edu.et" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Contact email">
              <input defaultValue="admin@astu.edu.et" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Address">
              <input defaultValue="Adama, Ethiopia" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Academic year format">
              <input defaultValue="2024-25" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Default language">
              <select defaultValue="English" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]">
                <option>English</option>
                <option>Amharic</option>
              </select>
            </InputLabel>
            <InputLabel label="Timezone">
              <input defaultValue="Africa/Addis_Ababa" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Date format">
              <select defaultValue="DD/MM/YYYY" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </InputLabel>
          </div>
        </SectionCard>
      )}

      {activeTab === 'email' && (
        <SectionCard title="Email Configuration" subtitle="SMTP settings and outbound email identity.">
          <div className="grid gap-4 md:grid-cols-2">
            <InputLabel label="SMTP Host">
              <input defaultValue="smtp.astu.edu.et" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Port">
              <input defaultValue="587" type="number" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Username">
              <input defaultValue="mailer@astu.edu.et" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="Password">
              <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2.5">
                <input
                  type={smtpPasswordVisible ? 'text' : 'password'}
                  defaultValue="••••••••••"
                  className="w-full bg-transparent outline-none"
                />
                <button type="button" onClick={() => setSmtpPasswordVisible((current) => !current)} className="text-xs font-semibold text-[#003580]">
                  {smtpPasswordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </InputLabel>
            <InputLabel label="From name">
              <input defaultValue="ASTU Alumni Management System" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
            <InputLabel label="From email">
              <input defaultValue="noreply@astu.edu.et" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
            </InputLabel>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setTestEmailOpen(true)}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              <Send className="h-4 w-4" />
              Send Test Email
            </button>
          </div>
        </SectionCard>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <SectionCard title="Integrations" subtitle="Connect ASTU AMS with external services.">
            <div className="space-y-4">
              <IntegrationItem
                title="Registrar / ERP API"
                description="Synchronize student and alumni records."
                status="Connected"
                toggleActive={regApiToggle}
                onToggle={() => setRegApiToggle((current) => !current)}
                onTest={() => setTestConnectionOpen(true)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InputLabel label="API Endpoint">
                  <input defaultValue="https://api.astu.edu.et/erp" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
                </InputLabel>
                <InputLabel label="API Key">
                  <input defaultValue="astu_erp_xxxxx" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
                </InputLabel>
              </div>

              <IntegrationItem
                title="SMS Gateway (Afro Message)"
                description="Send SMS notifications to alumni and staff."
                status="Connected"
                toggleActive={smsToggle}
                onToggle={() => setSmsToggle((current) => !current)}
                onTest={() => setTestConnectionOpen(true)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InputLabel label="Gateway Username">
                  <input defaultValue="astu_sms" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
                </InputLabel>
                <InputLabel label="Gateway Password">
                  <input type="password" defaultValue="password" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
                </InputLabel>
              </div>

              <IntegrationItem
                title="Google OAuth"
                description="Allow Google-based sign-in."
                status="Inactive"
                toggleActive={googleToggle}
                onToggle={() => setGoogleToggle((current) => !current)}
                onTest={() => setTestConnectionOpen(true)}
              />
              <InputLabel label="Client ID">
                <input defaultValue="google-client-id.apps.googleusercontent.com" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" />
              </InputLabel>

              <IntegrationItem
                title="LinkedIn API"
                description="Import professional profile and career data."
                status="Connected"
                toggleActive={linkedinToggle}
                onToggle={() => setLinkedinToggle((current) => !current)}
                onTest={() => setTestConnectionOpen(true)}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="Data Import" subtitle="Upload graduate files and map incoming columns.">
            <div className="space-y-4">
              <div className="rounded-[10px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <CloudUpload className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-4 text-sm font-semibold text-slate-700">Drag &amp; drop graduate CSV/Excel here</p>
                <p className="mt-1 text-xs text-slate-500">or browse files from your computer</p>
                <div className="mt-4">
                  <button type="button" className="rounded-[8px] border border-[#003580]/20 px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5">
                    Choose File
                  </button>
                </div>
                <div className="mt-4 rounded-[8px] bg-white px-3 py-2 text-sm text-slate-600 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  Selected file: <span className="font-semibold text-slate-900">{importFileName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={uploadTemplate}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </button>
                <AdminBadge variant="success">Schema Ready</AdminBadge>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Column Mapping" subtitle="Map system fields to CSV columns before import.">
            <div className="space-y-3">
              {systemFields.map((field, index) => (
                <div key={field} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[10px] border border-slate-200 bg-slate-50 p-3">
                  <div className="text-sm font-medium text-slate-700">{field}</div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <select
                    value={columnMapping[field]}
                    onChange={(event) =>
                      setColumnMapping((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
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
              <div className="overflow-hidden rounded-[10px] border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Filename', 'Date', 'Records', 'Status', 'Errors'].map((head) => (
                          <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importHistory.map((row) => (
                        <tr key={row.filename} className="border-t border-slate-100">
                          <td className="px-4 py-3 text-slate-700">{row.filename}</td>
                          <td className="px-4 py-3 text-slate-600">{row.date}</td>
                          <td className="px-4 py-3 text-slate-600">{row.records}</td>
                          <td className="px-4 py-3">
                            <AdminBadge variant={row.status === 'Completed' ? 'success' : row.status === 'Failed' ? 'danger' : 'warning'}>
                              {row.status}
                            </AdminBadge>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{row.errors}</td>
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
                  <img src={logoPreview} alt="University logo preview" className="h-20 w-20 rounded-[10px] border border-slate-200 bg-white object-contain p-2" />
                  <button
                    type="button"
                    onClick={() => setLogoPreview(defaultLogo)}
                    className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Upload Logo
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={resetDefaults}
                className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <WandSparkles className="h-4 w-4" />
                Reset to ASTU Defaults
              </button>
            </div>

            <div className="space-y-4">
              <InputLabel label="Primary color">
                <div className="flex items-center gap-3 rounded-[8px] border border-slate-200 px-3 py-2.5">
                  <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="h-8 w-10 rounded-md border border-slate-200" />
                  <span className="text-sm font-medium text-slate-700">{primaryColor}</span>
                </div>
              </InputLabel>
              <InputLabel label="Accent color">
                <div className="flex items-center gap-3 rounded-[8px] border border-slate-200 px-3 py-2.5">
                  <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-8 w-10 rounded-md border border-slate-200" />
                  <span className="text-sm font-medium text-slate-700">{accentColor}</span>
                </div>
              </InputLabel>

              <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-semibold text-slate-900">Palette Preview</h4>
                <div className="mt-3 flex gap-3">
                  <div className="h-14 w-14 rounded-[10px]" style={{ backgroundColor: primaryColor }} />
                  <div className="h-14 w-14 rounded-[10px]" style={{ backgroundColor: accentColor }} />
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
            <button type="button" onClick={testIntegration} className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
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
          className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
}
