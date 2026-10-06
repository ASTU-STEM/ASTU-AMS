import React, { useState } from 'react';
import {
  Globe,
  Image,
  Mail,
  Save,
  Settings2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';

export default function CmsSettings() {
  const [siteName, setSiteName] = useState('ASTU Alumni Management System');
  const [tagline, setTagline] = useState('Connecting excellence to industry');
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);

  const save = () => {
    toast.success('CMS settings saved');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="CMS Settings"
        subtitle="Configure content management system preferences."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Settings' }]}
        actions={
          <button onClick={save}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm">
            <Save className="h-3.5 w-3.5" /> Save Settings
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {/* General */}
        <div className="rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-[#003580] dark:text-sky-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] dark:text-white">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] dark:text-slate-400">Site Name</label>
              <input value={siteName} onChange={e => setSiteName(e.target.value)} className="mt-1 w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] dark:text-slate-400">Tagline</label>
              <input value={tagline} onChange={e => setTagline(e.target.value)} className="mt-1 w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-5 w-5 text-[#1D9E75] dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] dark:text-white">Feature Toggles</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Newsletter Subscription', value: newsletterEnabled, set: setNewsletterEnabled },
              { label: 'Community Comments', value: commentsEnabled, set: setCommentsEnabled },
              { label: 'Auto-Publish Scheduled Content', value: autoPublish, set: setAutoPublish },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-slate-200">{item.label}</span>
                <button onClick={() => item.set(!item.value)} className="transition-all cursor-pointer">
                  {item.value ? <ToggleRight className="h-6 w-6 text-[#1D9E75] dark:text-emerald-400" /> : <ToggleLeft className="h-6 w-6 text-slate-300 dark:text-slate-600" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
