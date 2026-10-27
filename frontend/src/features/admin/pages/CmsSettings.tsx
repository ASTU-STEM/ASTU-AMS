import React, { useEffect, useMemo, useState } from 'react';
import {
  Globe,
  Save,
  Settings2,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
  Shield,
  Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';

const STORAGE_KEY = 'astu_cms_office_settings';

type CmsOfficeSettings = {
  siteName: string;
  tagline: string;
  publicContactEmail: string;
  defaultLocale: 'en' | 'am';
  newsletterEnabled: boolean;
  commentsEnabled: boolean;
  autoPublish: boolean;
  requireApprovalBeforePublish: boolean;
  notifyOnNewRegistration: boolean;
  notifyOnPendingApproval: boolean;
};

const DEFAULTS: CmsOfficeSettings = {
  siteName: 'ASTU Alumni Management System',
  tagline: 'Connecting excellence to industry',
  publicContactEmail: 'alumni@astu.edu.et',
  defaultLocale: 'en',
  newsletterEnabled: true,
  commentsEnabled: true,
  autoPublish: false,
  requireApprovalBeforePublish: true,
  notifyOnNewRegistration: true,
  notifyOnPendingApproval: true,
};

function loadSettings(): CmsOfficeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<CmsOfficeSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export default function CmsSettings() {
  const [settings, setSettings] = useState<CmsOfficeSettings>(() => loadSettings());
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => JSON.stringify(loadSettings()));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const next = loadSettings();
        setSettings(next);
        setSavedSnapshot(JSON.stringify(next));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== savedSnapshot, [settings, savedSnapshot]);

  const patch = <K extends keyof CmsOfficeSettings>(key: K, value: CmsOfficeSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    if (!settings.siteName.trim()) {
      toast.error('Site name is required');
      return;
    }
    if (settings.publicContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.publicContactEmail)) {
      toast.error('Enter a valid contact email');
      return;
    }

    setSaving(true);
    try {
      const next = {
        ...settings,
        siteName: settings.siteName.trim(),
        tagline: settings.tagline.trim(),
        publicContactEmail: settings.publicContactEmail.trim(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSettings(next);
      setSavedSnapshot(JSON.stringify(next));
      window.dispatchEvent(new Event('astu-cms-settings-changed'));
      toast.success('Office preferences saved on this device');
    } catch {
      toast.error('Could not save settings — storage may be full or blocked');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    if (!window.confirm('Reset all CMS office preferences to defaults?')) return;
    setSettings({ ...DEFAULTS });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
    setSavedSnapshot(JSON.stringify(DEFAULTS));
    window.dispatchEvent(new Event('astu-cms-settings-changed'));
    toast.success('Restored default preferences');
  };

  const ToggleRow = ({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description: string;
    value: boolean;
    onChange: (next: boolean) => void;
  }) => (
    <div className="flex items-start justify-between gap-4 rounded-[10px] border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="shrink-0 transition-all cursor-pointer"
        aria-pressed={value}
        aria-label={label}
      >
        {value ? (
          <ToggleRight className="h-6 w-6 text-[#1D9E75] dark:text-emerald-400" />
        ) : (
          <ToggleLeft className="h-6 w-6 text-slate-300 dark:text-slate-600" />
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="CMS Settings"
        subtitle="Office preferences for site identity, publishing gates, and notification alerts used across the Alumni Relations workspace."
        breadcrumbs={[{ label: 'Content Management' }, { label: 'Settings' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dirty ? <AdminBadge variant="warning">Unsaved changes</AdminBadge> : <AdminBadge variant="success">Saved</AdminBadge>}
            <button
              type="button"
              onClick={resetDefaults}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#FFCC00] px-3 py-2 text-xs font-bold text-[#003366] hover:brightness-105 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        }
      />

      <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
        Preferences are stored in this browser for the Alumni Office workstation. Homepage public content still saves through Pages & Homepage CMS.
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#003580] dark:text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Site Name</label>
              <input
                value={settings.siteName}
                onChange={(e) => patch('siteName', e.target.value)}
                className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Tagline</label>
              <input
                value={settings.tagline}
                onChange={(e) => patch('tagline', e.target.value)}
                className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Public Contact Email</label>
              <input
                type="email"
                value={settings.publicContactEmail}
                onChange={(e) => patch('publicContactEmail', e.target.value)}
                className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Default Locale</label>
              <select
                value={settings.defaultLocale}
                onChange={(e) => patch('defaultLocale', e.target.value as 'en' | 'am')}
                className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[#1D9E75] dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Feature Toggles</h3>
            </div>
            <div className="space-y-3">
              <ToggleRow
                label="Newsletter Subscription"
                description="Show newsletter signup prompts on public announcement surfaces."
                value={settings.newsletterEnabled}
                onChange={(v) => patch('newsletterEnabled', v)}
              />
              <ToggleRow
                label="Community Comments"
                description="Allow moderated comments on community posts when the module is enabled."
                value={settings.commentsEnabled}
                onChange={(v) => patch('commentsEnabled', v)}
              />
              <ToggleRow
                label="Auto-Publish Scheduled Content"
                description="Publish scheduled drafts automatically when their go-live time arrives."
                value={settings.autoPublish}
                onChange={(v) => patch('autoPublish', v)}
              />
            </div>
          </div>

          <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#003580] dark:text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Governance & Alerts</h3>
            </div>
            <div className="space-y-3">
              <ToggleRow
                label="Require Approval Before Publish"
                description="Route public announcements and homepage updates through Approvals first."
                value={settings.requireApprovalBeforePublish}
                onChange={(v) => patch('requireApprovalBeforePublish', v)}
              />
              <ToggleRow
                label="Alert on New Registrations"
                description="Surface a badge/alert when alumni register for events or tracer studies."
                value={settings.notifyOnNewRegistration}
                onChange={(v) => patch('notifyOnNewRegistration', v)}
              />
              <ToggleRow
                label="Alert on Pending Approvals"
                description="Highlight the Approvals nav badge when items await review."
                value={settings.notifyOnPendingApproval}
                onChange={(v) => patch('notifyOnPendingApproval', v)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-[12px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Alert toggles control Alumni Office UX cues in this browser. Outbound email/SMS still runs from Notifications when you compose and send a message.
        </p>
      </div>
    </div>
  );
}
