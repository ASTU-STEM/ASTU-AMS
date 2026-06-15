import React, { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Globe, Image, Lock, Mail, RefreshCw, Save, Settings2, Shield, ToggleLeft, ToggleRight, Activity } from "lucide-react";
import toast from 'react-hot-toast';

export default function CmsSettings() {
  const [siteName, setSiteName] = useState('ASTU Alumni Management System');
  const [tagline, setTagline] = useState('Connecting excellence to industry');
  const [siteUrl, setSiteUrl] = useState('https://astu-ams.et');
  const [contactEmail, setContactEmail] = useState('admin@astu-ams.et');
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const save = () => toast.success('CMS settings saved successfully');

  const sections = [
    {
      id: 'general',
      title: 'General Settings',
      subtitle: 'Basic site identity and metadata',
      icon: Globe,
      color: '#6382ff',
      glow: 'rgba(99,130,255,0.2)',
      content: (
        <div className="space-y-4">
          {[
            { label: 'Site Name', value: siteName, set: setSiteName, type: 'text', placeholder: 'Enter site name' },
            { label: 'Tagline', value: tagline, set: setTagline, type: 'text', placeholder: 'Enter site tagline' },
            { label: 'Site URL', value: siteUrl, set: setSiteUrl, type: 'url', placeholder: 'https://your-domain.et' },
            { label: 'Contact Email', value: contactEmail, set: setContactEmail, type: 'email', placeholder: 'admin@domain.et' },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{field.label}</label>
              <input
                type={field.type}
                value={field.value}
                onChange={e => field.set(e.target.value)}
                placeholder={field.placeholder}
                className="cms-input"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'features',
      title: 'Feature Toggles',
      subtitle: 'Enable or disable CMS capabilities',
      icon: Activity,
      color: '#34d399',
      glow: 'rgba(52,211,153,0.2)',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Newsletter Subscription', desc: 'Allow users to subscribe to email newsletters', value: newsletterEnabled, set: setNewsletterEnabled, color: '#34d399' },
            { label: 'Community Comments', desc: 'Enable comment sections on posts and pages', value: commentsEnabled, set: setCommentsEnabled, color: '#34d399' },
            { label: 'Auto-Publish Scheduled', desc: 'Automatically publish content at scheduled times', value: autoPublish, set: setAutoPublish, color: '#fbbf24' },
            { label: 'Maintenance Mode', desc: 'Take the site offline for maintenance', value: maintenanceMode, set: setMaintenanceMode, color: '#f87171' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/3 px-4 py-3 transition-all hover:bg-white/5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white/90">{item.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button onClick={() => item.set(!item.value)} className="ml-4 shrink-0 transition-all">
                {item.value
                  ? <ToggleRight className="h-7 w-7" style={{ color: item.color }} />
                  : <ToggleLeft className="h-7 w-7 text-slate-600" />}
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Configure alert and notification preferences',
      icon: Bell,
      color: '#fbbf24',
      glow: 'rgba(251,191,36,0.2)',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Email Notifications', desc: 'Receive email alerts for approvals and submissions', value: emailNotifications, set: setEmailNotifications, color: '#fbbf24' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/3 px-4 py-3 transition-all hover:bg-white/5">
              <div>
                <p className="text-sm font-semibold text-white/90">{item.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button onClick={() => item.set(!item.value)} className="ml-4 shrink-0 transition-all">
                {item.value
                  ? <ToggleRight className="h-7 w-7" style={{ color: item.color }} />
                  : <ToggleLeft className="h-7 w-7 text-slate-600" />}
              </button>
            </div>
          ))}
          <div className="rounded-xl border border-white/6 bg-white/3 px-4 py-3">
            <p className="text-sm font-semibold text-white/90 mb-2">Notification Recipients</p>
            <input type="email" placeholder="comma-separated emails" defaultValue="admin@astu-ams.et, editor@astu-ams.et" className="cms-input" />
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Access control and security settings',
      icon: Shield,
      color: '#a78bfa',
      glow: 'rgba(167,139,250,0.2)',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin users', value: twoFactorRequired, set: setTwoFactorRequired, color: '#a78bfa' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/3 px-4 py-3 transition-all hover:bg-white/5">
              <div>
                <p className="text-sm font-semibold text-white/90">{item.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button onClick={() => item.set(!item.value)} className="ml-4 shrink-0 transition-all">
                {item.value
                  ? <ToggleRight className="h-7 w-7" style={{ color: item.color }} />
                  : <ToggleLeft className="h-7 w-7 text-slate-600" />}
              </button>
            </div>
          ))}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">Session Timeout</p>
                <p className="text-[10px] text-amber-400/60 mt-0.5">Admin sessions expire after 2 hours of inactivity. This cannot be changed.</p>
              </div>
            </div>
          </div>
          <button onClick={() => toast.success('Clearing all sessions...')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/15 transition-all">
            <Lock className="h-4 w-4" /> Force Logout All Sessions
          </button>
        </div>
      ),
    },
    {
      id: 'media',
      title: 'Media Settings',
      subtitle: 'Image and file upload configuration',
      icon: Image,
      color: '#22d3ee',
      glow: 'rgba(34,211,238,0.2)',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Max Upload Size (MB)</label>
            <input type="number" defaultValue={20} className="cms-input" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Allowed File Types</label>
            <input type="text" defaultValue="jpg, jpeg, png, gif, webp, pdf, mp4, mp3" className="cms-input" />
          </div>
          <div className="rounded-xl border border-white/6 bg-white/3 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-white/90">Auto-optimize Images</p>
              <ToggleRight className="h-7 w-7 text-cyan-400" />
            </div>
            <p className="text-[10px] text-slate-500">Automatically compress and convert uploaded images to WebP format.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'cache',
      title: 'Cache & Performance',
      subtitle: 'Manage content delivery and caching',
      icon: RefreshCw,
      color: '#fb7185',
      glow: 'rgba(251,113,133,0.2)',
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/6 bg-white/3 px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white/90">Content Cache</p>
              <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">Active</span>
            </div>
            <p className="text-[10px] text-slate-500">Pages cached for 1 hour. Auto-invalidated on publish.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => toast.success('Page cache cleared')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
              <RefreshCw className="h-3.5 w-3.5" /> Clear Page Cache
            </button>
            <button onClick={() => toast.success('Media cache cleared')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
              <Image className="h-3.5 w-3.5" /> Clear Media Cache
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes cs-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .cs-fade-up { animation: cs-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .cms-input { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; border-radius: 10px; padding: 10px 14px; font-size: 13px; outline: none; transition: border-color 0.2s; width: 100%; }
        .dark .cms-input { background: rgba(30,35,55,0.8); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; }
        .cms-input:focus { border-color: #003580; box-shadow: 0 0 0 3px rgba(0,53,128,0.1); }
        .dark .cms-input:focus { border-color: rgba(99,130,255,0.5); box-shadow: 0 0 0 3px rgba(99,130,255,0.1); }
        .cms-input::placeholder { color: #94a3b8; }
        .dark .cms-input::placeholder { color: rgba(148,163,184,0.5); }
      `}</style>

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 12px 48px rgba(0,53,128,0.40)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.12), transparent)' }} />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.18)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                <Settings2 className="h-3 w-3" />
                System Configuration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>CMS Settings</h1>
            <p className="mt-2 text-sm leading-relaxed font-medium"
              style={{ color: 'rgba(255,255,255,0.80)' }}>Configure content management system preferences, security, and performance.</p>
          </div>
          <button onClick={save}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105 shrink-0"
            style={{ background: '#E8A020', color: '#003580', boxShadow: '0 4px 20px rgba(232,160,32,0.35)' }}>
            <Save className="h-4 w-4" /> Save All Settings
          </button>
        </div>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid gap-4 xl:grid-cols-2">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="cs-fade-up rounded-2xl border border-white/8 bg-[#1a1f35]/80 p-6 backdrop-blur-sm"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-start gap-3 mb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: section.glow, boxShadow: `0 0 20px ${section.glow}` }}>
                  <Icon className="h-5 w-5" style={{ color: section.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{section.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{section.subtitle}</p>
                </div>
              </div>
              {section.content}
            </div>
          );
        })}
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 backdrop-blur-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-300">Danger Zone</h3>
            <p className="text-[11px] text-rose-400/60 mt-0.5">These actions are irreversible. Proceed with extreme caution.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button onClick={() => toast.error('Please contact super admin to reset content')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/8 px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/15 transition-all">
            <RefreshCw className="h-4 w-4" /> Reset All Content
          </button>
          <button onClick={() => toast.error('Factory reset requires super admin confirmation')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/8 px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/15 transition-all">
            <AlertTriangle className="h-4 w-4" /> Factory Reset CMS
          </button>
        </div>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-20 rounded-2xl border border-white/10 bg-[#12172a]/95 backdrop-blur-lg p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-slate-400">All changes are saved automatically on submit.</span>
          </div>
          <button onClick={save}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#0a4fa6] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-[#003580]/30">
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
