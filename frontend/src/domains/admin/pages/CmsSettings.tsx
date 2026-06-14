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
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-[#003580]" />
            <h3 className="text-sm font-semibold text-slate-900">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500">Site Name</label>
              <input value={siteName} onChange={e => setSiteName(e.target.value)} className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Tagline</label>
              <input value={tagline} onChange={e => setTagline(e.target.value)} className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-5 w-5 text-[#1D9E75]" />
            <h3 className="text-sm font-semibold text-slate-900">Feature Toggles</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Newsletter Subscription', value: newsletterEnabled, set: setNewsletterEnabled },
              { label: 'Community Comments', value: commentsEnabled, set: setCommentsEnabled },
              { label: 'Auto-Publish Scheduled Content', value: autoPublish, set: setAutoPublish },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between rounded-[10px] border border-slate-100 bg-slate-50/50 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <button onClick={() => item.set(!item.value)} className="transition-all">
                  {item.value ? <ToggleRight className="h-6 w-6 text-[#1D9E75]" /> : <ToggleLeft className="h-6 w-6 text-slate-300" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
