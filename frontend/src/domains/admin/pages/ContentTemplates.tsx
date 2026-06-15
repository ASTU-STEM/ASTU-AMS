import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Calendar,
  Copy,
  Edit3,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Layers3,
  Megaphone,
  Newspaper,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Trophy,
} from 'lucide-react';

type TemplateCategory = 'Page' | 'Post' | 'Announcement' | 'Event' | 'Email' | 'Landing';

type Template = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  glow: string;
  usage: number;
  lastUpdated: string;
  isDefault?: boolean;
  isFeatured?: boolean;
  fields: string[];
};

const TEMPLATES: Template[] = [
  { id: 't-1', name: 'Hero Landing Page', description: 'Full-width hero with CTA, statistics strip, and feature grid.', category: 'Landing', icon: Sparkles, color: '#6382ff', glow: 'rgba(99,130,255,0.15)', usage: 24, lastUpdated: '2 days ago', isDefault: true, isFeatured: true, fields: ['Hero Title', 'Hero Subtitle', 'Primary CTA', 'Stat 1-4', 'Feature Cards'] },
  { id: 't-2', name: 'Alumni Spotlight Story', description: 'Profile template with biography, career timeline, and gallery.', category: 'Post', icon: GraduationCap, color: '#a78bfa', glow: 'rgba(167,139,250,0.15)', usage: 18, lastUpdated: '1 week ago', isFeatured: true, fields: ['Alumni Name', 'Graduation Year', 'Major', 'Bio', 'Career Timeline', 'Photo Gallery', 'Video URL'] },
  { id: 't-3', name: 'Event Detail Page', description: 'Event page with date, location, registration form, and sponsors.', category: 'Event', icon: Calendar, color: '#f87171', glow: 'rgba(248,113,113,0.15)', usage: 32, lastUpdated: '3 days ago', fields: ['Event Title', 'Date & Time', 'Venue', 'Description', 'Registration', 'Sponsors'] },
  { id: 't-4', name: 'News Article', description: 'Standard news article with hero image, body, and related stories.', category: 'Post', icon: Newspaper, color: '#34d399', glow: 'rgba(52,211,153,0.15)', usage: 56, lastUpdated: '5 days ago', fields: ['Headline', 'Subtitle', 'Hero Image', 'Author', 'Body', 'Tags', 'Related Articles'] },
  { id: 't-5', name: 'Emergency Announcement', description: 'High-visibility alert with priority banner and quick info card.', category: 'Announcement', icon: Megaphone, color: '#fbbf24', glow: 'rgba(251,191,36,0.15)', usage: 12, lastUpdated: '2 weeks ago', fields: ['Alert Title', 'Severity', 'Effective Period', 'Action Required', 'Contact'] },
  { id: 't-6', name: 'Research Publication', description: 'Academic research showcase with abstract, authors, and citations.', category: 'Page', icon: Trophy, color: '#c084fc', glow: 'rgba(192,132,252,0.15)', usage: 8, lastUpdated: '1 month ago', fields: ['Title', 'Authors', 'Abstract', 'Keywords', 'DOI', 'Citations', 'PDF'] },
  { id: 't-7', name: 'Photo Gallery Album', description: 'Grid gallery with captions, lightbox, and category filters.', category: 'Page', icon: ImageIcon, color: '#22d3ee', glow: 'rgba(34,211,238,0.15)', usage: 14, lastUpdated: '1 week ago', fields: ['Album Title', 'Cover Image', 'Photos', 'Captions', 'Category'] },
  { id: 't-8', name: 'Newsletter Email', description: 'Monthly newsletter template with featured stories and CTA.', category: 'Email', icon: FileText, color: '#34d399', glow: 'rgba(52,211,153,0.15)', usage: 22, lastUpdated: '4 days ago', fields: ['Header', 'Featured Story', 'Secondary Stories', 'Footer'] },
];

const CATEGORIES: Array<{ key: 'all' | TemplateCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'all', label: 'All Templates', icon: Layers3 },
  { key: 'Landing', label: 'Landing', icon: Sparkles },
  { key: 'Post', label: 'Posts', icon: Newspaper },
  { key: 'Page', label: 'Pages', icon: Globe },
  { key: 'Event', label: 'Events', icon: Calendar },
  { key: 'Announcement', label: 'Announcements', icon: Megaphone },
  { key: 'Email', label: 'Emails', icon: FileText },
];

export default function ContentTemplates() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | TemplateCategory>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filtered = useMemo(() => TEMPLATES.filter((t) => {
    if (category !== 'all' && t.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  }), [search, category]);

  const stats = useMemo(() => ({
    total: TEMPLATES.length,
    featured: TEMPLATES.filter((t) => t.isFeatured).length,
    totalUsage: TEMPLATES.reduce((sum, t) => sum + t.usage, 0),
    categories: new Set(TEMPLATES.map((t) => t.category)).size,
  }), []);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes ct-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .ct-fade-up { animation: ct-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .ct-hover { transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
        .ct-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,53,128,0.12); }
        .dark .ct-hover:hover { box-shadow: 0 12px 30px rgba(0,0,0,0.4); }
        .ct-input { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; border-radius: 10px; padding: 10px 14px; font-size: 13px; outline: none; transition: border-color 0.2s; width: 100%; }
        .dark .ct-input { background: rgba(30,35,55,0.8); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; }
        .ct-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .dark .ct-input:focus { border-color: rgba(99,130,255,0.5); box-shadow: 0 0 0 3px rgba(99,130,255,0.1); }
        .ct-input::placeholder { color: #94a3b8; }
        .dark .ct-input::placeholder { color: rgba(148,163,184,0.5); }
        .ct-stat { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; transition: all 0.25s; }
        .dark .ct-stat { background: linear-gradient(135deg, rgba(30,35,55,0.9), rgba(22,28,45,0.95)); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(12px); }
        .ct-stat:hover { border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,53,128,0.12); }
        .dark .ct-stat:hover { border-color: rgba(255,255,255,0.14); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
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
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#E8A020' }} />
                Template Library
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>Content Templates</h1>
            <p className="mt-2 text-sm leading-relaxed font-medium"
              style={{ color: 'rgba(255,255,255,0.80)' }}>Reusable, pre-designed templates for pages, posts, events, and emails. Speed up content creation.</p>
          </div>
          <button type="button" onClick={() => toast.success('Template editor opened')}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105 shrink-0"
            style={{ background: '#E8A020', color: '#003580', boxShadow: '0 4px 20px rgba(232,160,32,0.35)' }}>
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Templates', value: stats.total, icon: Layers3, color: '#003580', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800/40' },
          { label: 'Featured', value: stats.featured, icon: Star, color: '#E8A020', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800/40' },
          { label: 'Total Uses', value: stats.totalUsage, icon: Copy, color: '#1D9E75', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40' },
          { label: 'Categories', value: stats.categories, icon: Sparkles, color: '#7c3aed', bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-800/40' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`ct-fade-up group relative overflow-hidden rounded-2xl border ${s.border} ${s.bg} p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300`} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{s.value}</span>
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#1a1f35]/80 p-4 backdrop-blur-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="ct-input pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/8 pt-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.key;
            return (
              <button key={c.key} type="button" onClick={() => setCategory(c.key)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all ${active ? 'border-[#7c3aed]/50 bg-[#7c3aed]/20 text-violet-300 shadow-md shadow-violet-500/15' : 'border-white/8 bg-white/4 text-slate-400 hover:bg-white/8 hover:text-white'}`}>
                <Icon className="h-3 w-3" /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((template, i) => {
          const Icon = template.icon;
          return (
            <div key={template.id}
              className="ct-hover ct-fade-up group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#1a1f35]/80 backdrop-blur-sm shadow-lg"
              style={{ animationDelay: `${i * 0.05}s` }}>
              {/* Thumbnail */}
              <div className="relative h-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${template.color}30 0%, ${template.color}15 50%, rgba(22,28,45,0.8) 100%)` }}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_0%,transparent_60%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ color: template.color, opacity: 0.25 }}><Icon className="h-14 w-14" /></span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-sm border border-white/20 bg-white/10">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute left-3 top-3 flex items-center gap-1">
                  {template.isDefault && <span className="rounded-lg bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-md">Default</span>}
                  {template.isFeatured && <span className="rounded-lg bg-violet-500/90 px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-md">Featured</span>}
                </div>
                <span className="absolute right-3 top-3 rounded-lg bg-black/40 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: template.color }}>{template.category}</span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-bold text-white">{template.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{template.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.fields.slice(0, 3).map((f) => (
                    <span key={f} className="rounded-lg bg-white/6 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">{f}</span>
                  ))}
                  {template.fields.length > 3 && <span className="text-[10px] text-slate-600">+{template.fields.length - 3} more</span>}
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Used {template.usage} times</span>
                  <span>{template.lastUpdated}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/6 pt-3">
                  <button type="button" onClick={() => setPreviewTemplate(template)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-white/10 hover:text-white transition-all" title="Preview">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => toast.success(`Template "${template.name}" duplicated`)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all" title="Duplicate">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => toast.success('Template editor opened')}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all" title="Edit">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold text-white transition-all shadow-lg hover:brightness-110"
                    style={{ background: `linear-gradient(135deg, ${template.color}, ${template.color}99)`, boxShadow: `0 4px 15px ${template.glow}` }}>
                    <Plus className="h-3 w-3" /> Use
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div onClick={() => setPreviewTemplate(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#12172a] shadow-2xl">
            <div className="border-b border-white/8 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: previewTemplate.glow, color: previewTemplate.color }}>
                  {React.createElement(previewTemplate.icon, { className: 'h-5 w-5' })}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{previewTemplate.name}</h2>
                  <p className="text-xs text-slate-500">{previewTemplate.category} · Used {previewTemplate.usage} times</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-slate-400">{previewTemplate.description}</p>
              <div>
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Template Fields</h3>
                <div className="grid grid-cols-2 gap-2">
                  {previewTemplate.fields.map((f) => (
                    <div key={f} className="rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-xs">
                      <span className="font-semibold text-white/80">{f}</span>
                      <div className="mt-1 text-[10px] text-slate-500">Text input field</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 px-3 py-2 text-xs text-blue-400">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Preview shows the editable structure. After applying, fields are filled in by content editors.
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-white/8 bg-white/2 px-6 py-4">
              <button type="button" onClick={() => setPreviewTemplate(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all">Close</button>
              <button type="button" onClick={() => { toast.success('Template applied to new content'); setPreviewTemplate(null); }}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg"
                style={{ background: `linear-gradient(135deg, ${previewTemplate.color}, ${previewTemplate.color}99)`, boxShadow: `0 4px 20px ${previewTemplate.glow}` }}>
                <Plus className="h-4 w-4" /> Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
