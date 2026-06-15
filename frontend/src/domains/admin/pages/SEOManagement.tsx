import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  FileSearch,
  Globe,
  Hash,
  Link2,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';

type SeoStatus = 'Excellent' | 'Good' | 'Needs Work' | 'Critical';

type SeoItem = {
  id: string;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  status: SeoStatus;
  score: number;
  issues: number;
  traffic: number;
  position: number;
};

const sampleItems: SeoItem[] = [
  { id: '1', url: '/', title: 'ASTU Alumni Network — Home', description: 'ASTU connects 25,000+ alumni with employers, mentorship, and opportunities across Ethiopia and East Africa.', keywords: ['ASTU alumni', 'alumni network', 'Ethiopia university'], status: 'Excellent', score: 96, issues: 0, traffic: 8420, position: 1.4 },
  { id: '2', url: '/events/career-fair-2026', title: 'Career Fair 2026 — ASTU', description: "Meet 40+ leading employers at ASTU's annual career fair. Open to all students and recent graduates.", keywords: ['career fair', 'ASTU events', 'jobs Ethiopia'], status: 'Good', score: 82, issues: 1, traffic: 2340, position: 3.6 },
  { id: '3', url: '/alumni/success-stories', title: 'Alumni Success Stories', description: 'Inspiring journeys from ASTU graduates building careers across the world.', keywords: ['alumni stories', 'success', 'graduates'], status: 'Good', score: 78, issues: 2, traffic: 1820, position: 5.2 },
  { id: '4', url: '/tracer-survey', title: 'Graduate Tracer Survey 2026', description: 'Help us improve ASTU by sharing your post-graduation experience. Survey takes 5 minutes.', keywords: ['tracer study', 'graduate survey', 'ASTU'], status: 'Needs Work', score: 64, issues: 4, traffic: 920, position: 9.4 },
  { id: '5', url: '/employers/partnership', title: 'Employer Partnership Program', description: "Join ASTU's industry partnership program to recruit top engineering, business, and science talent.", keywords: ['employer partnership', 'recruiting', 'ASTU jobs'], status: 'Good', score: 81, issues: 1, traffic: 1430, position: 4.2 },
  { id: '6', url: '/departments/engineering', title: 'School of Engineering — ASTU', description: 'ASTU engineering programs cover mechanical, electrical, civil, and computer engineering with research focus.', keywords: ['engineering school', 'ASTU engineering', 'Ethiopia engineering'], status: 'Excellent', score: 91, issues: 0, traffic: 3210, position: 2.1 },
  { id: '7', url: '/about/history', title: 'ASTU History & Heritage', description: 'Founded in 1993, ASTU has grown into a premier science and technology university in Ethiopia.', keywords: ['ASTU history', 'about ASTU', 'Ethiopia universities'], status: 'Critical', score: 48, issues: 7, traffic: 320, position: 18.2 },
  { id: '8', url: '/news/graduation-2025', title: 'Graduation Ceremony 2025 Highlights', description: "Relive the magical moments from ASTU's 2025 graduation ceremony with 3,500+ graduates.", keywords: ['graduation', 'ASTU news', '2025 ceremony'], status: 'Excellent', score: 94, issues: 0, traffic: 4120, position: 1.8 },
];

const statusConfig: Record<SeoStatus, { badge: string; score: string; glow: string }> = {
  Excellent: { badge: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400', score: '#34d399', glow: 'rgba(52,211,153,0.15)' },
  Good: { badge: 'border-blue-500/25 bg-blue-500/10 text-blue-400', score: '#60a5fa', glow: 'rgba(96,165,250,0.15)' },
  'Needs Work': { badge: 'border-amber-500/25 bg-amber-500/10 text-amber-400', score: '#fbbf24', glow: 'rgba(251,191,36,0.15)' },
  Critical: { badge: 'border-rose-500/25 bg-rose-500/10 text-rose-400', score: '#f87171', glow: 'rgba(248,113,113,0.15)' },
};

export default function SEOManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SeoStatus>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const filtered = useMemo(() => {
    return sampleItems.filter((it) => {
      if (statusFilter !== 'all' && it.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return it.title.toLowerCase().includes(q) || it.url.toLowerCase().includes(q) || it.keywords.some((k) => k.toLowerCase().includes(q));
      }
      return true;
    });
  }, [search, statusFilter]);

  const aggregateScore = useMemo(() => Math.round(sampleItems.reduce((s, it) => s + it.score, 0) / sampleItems.length), []);
  const totalTraffic = useMemo(() => sampleItems.reduce((s, it) => s + it.traffic, 0), []);
  const totalIssues = useMemo(() => sampleItems.reduce((s, it) => s + it.issues, 0), []);

  const openEditor = (item: SeoItem) => { setEditingId(item.id); setEditTitle(item.title); setEditDesc(item.description); };
  const saveEditor = () => { toast.success('SEO metadata saved'); setEditingId(null); };

  const editing = editingId ? sampleItems.find((i) => i.id === editingId) : null;
  const titleLength = editTitle.length;
  const descLength = editDesc.length;
  const titleScore = titleLength >= 30 && titleLength <= 60 ? 100 : titleLength > 0 ? 60 : 0;
  const descScore = descLength >= 120 && descLength <= 160 ? 100 : descLength > 0 ? 60 : 0;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes seo-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .seo-fade-up { animation: seo-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .seo-hover { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .seo-hover:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,53,128,0.12); }
        .dark .seo-hover:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .seo-input { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; border-radius: 10px; padding: 10px 14px; font-size: 13px; outline: none; transition: border-color 0.2s; width: 100%; }
        .dark .seo-input { background: rgba(30,35,55,0.8); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; }
        .seo-input:focus { border-color: #003580; box-shadow: 0 0 0 3px rgba(0,53,128,0.1); }
        .dark .seo-input:focus { border-color: rgba(99,130,255,0.5); box-shadow: 0 0 0 3px rgba(99,130,255,0.1); }
        .seo-input::placeholder { color: #94a3b8; }
        .dark .seo-input::placeholder { color: rgba(148,163,184,0.5); }
        .seo-stat { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; transition: all 0.25s; }
        .dark .seo-stat { background: linear-gradient(135deg, rgba(30,35,55,0.9), rgba(22,28,45,0.95)); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(12px); }
        .seo-stat:hover { border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,53,128,0.12); }
        .dark .seo-stat:hover { border-color: rgba(255,255,255,0.14); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
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
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#34d399' }} />
                Indexing: Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>SEO Management</h1>
            <p className="mt-2 text-sm leading-relaxed font-medium"
              style={{ color: 'rgba(255,255,255,0.80)' }}>Monitor and optimize every public page for search engines. Track rankings, fix issues, and preview Google results.</p>
          </div>
          <button type="button" onClick={() => toast.success('Re-running SEO audit...')}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105 shrink-0"
            style={{ background: '#E8A020', color: '#003580', boxShadow: '0 4px 20px rgba(232,160,32,0.35)' }}>
            <RefreshCw className="h-4 w-4" /> Re-audit All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Average SEO Score', value: `${aggregateScore}/100`, icon: Sparkles, color: '#6382ff', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800/40' },
          { label: 'Monthly Traffic', value: totalTraffic.toLocaleString(), icon: TrendingUp, color: '#1D9E75', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40' },
          { label: 'Tracked Pages', value: sampleItems.length, icon: FileSearch, color: '#E8A020', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800/40' },
          { label: 'Open Issues', value: totalIssues, icon: XCircle, color: totalIssues > 5 ? '#e24b4a' : '#1D9E75', bg: totalIssues > 5 ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20', border: totalIssues > 5 ? 'border-rose-200 dark:border-rose-800/40' : 'border-emerald-200 dark:border-emerald-800/40' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`seo-fade-up group relative overflow-hidden rounded-2xl border ${s.border} ${s.bg} p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300`} style={{ animationDelay: `${i * 0.06}s` }}>
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

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#1a1f35]/80 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search URLs, titles, or keywords..." className="seo-input pl-9" />
          </div>
          <button type="button" onClick={() => toast.success('Re-running SEO audit...')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <RefreshCw className="h-3.5 w-3.5" /> Re-audit
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/8 pt-3">
          {(['all', 'Excellent', 'Good', 'Needs Work', 'Critical'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${statusFilter === s ? 'bg-[#003580] text-white shadow-md shadow-[#003580]/30' : 'bg-white/6 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              {s === 'all' ? 'All Pages' : s}
            </button>
          ))}
        </div>
      </div>

      {/* SEO Items */}
      <div className="space-y-3">
        {filtered.map((item, i) => {
          const sc = statusConfig[item.status];
          const scoreVal = item.score >= 80 ? '#34d399' : item.score >= 60 ? '#fbbf24' : '#f87171';
          return (
            <div key={item.id} className="seo-hover seo-fade-up rounded-2xl border border-white/8 bg-[#1a1f35]/80 p-5 backdrop-blur-sm" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${sc.badge}`}>{item.status}</span>
                    <span className="rounded-lg bg-white/8 px-2 py-0.5 text-[10px] font-mono text-slate-400">{item.url}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white/90">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.keywords.map((kw) => (
                      <span key={kw} className="inline-flex items-center gap-0.5 rounded-lg bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                        <Hash className="h-2.5 w-2.5" />{kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center shrink-0">
                  {[
                    { label: 'Score', value: item.score, color: scoreVal },
                    { label: 'Position', value: `#${item.position.toFixed(1)}`, color: '#e2e8f0' },
                    { label: 'Traffic', value: item.traffic.toLocaleString(), color: '#e2e8f0' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl bg-white/4 px-3 py-2 border border-white/6">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">{stat.label}</p>
                      <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Bar */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${item.score}%`, backgroundColor: scoreVal }} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: scoreVal }}>{item.score}%</span>
              </div>

              {item.issues > 0 && (
                <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-xs text-amber-300">
                  <strong>{item.issues} issue{item.issues > 1 ? 's' : ''} detected:</strong> {item.issues > 2 ? 'Add structured data, improve mobile usability, ' : ''}optimize meta description length.
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/8 pt-3">
                <button type="button" onClick={() => openEditor(item)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#003580] px-2.5 py-1.5 text-[11px] font-bold text-white hover:brightness-110 transition-all shadow-md shadow-[#003580]/30">
                  <Sparkles className="h-3 w-3" /> Edit SEO
                </button>
                <button type="button" onClick={() => window.open(item.url, '_blank')}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                  <ExternalLink className="h-3 w-3" /> Open Page
                </button>
                <button type="button" onClick={() => toast.success('Sitemap regenerated')}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                  <Globe className="h-3 w-3" /> Resubmit Sitemap
                </button>
                <button type="button" onClick={() => toast.success('Copied canonical link')}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                  <Link2 className="h-3 w-3" /> Copy URL
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEO Editor Modal */}
      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onClick={() => setEditingId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#12172a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-white">Edit SEO Metadata</h2>
                <p className="text-xs text-slate-500">{editing.url}</p>
              </div>
              <button type="button" onClick={() => setEditingId(null)} className="rounded-xl p-2 text-slate-500 hover:bg-white/8 hover:text-slate-300 transition-all">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 px-6 py-5 md:grid-cols-2">
              <div className="space-y-4">
                <label className="block">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Meta Title</span>
                    <span className={`text-[10px] font-bold ${titleLength > 60 ? 'text-rose-400' : titleLength < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{titleLength}/60</span>
                  </div>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={80} className="seo-input" />
                </label>
                <label className="block">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Meta Description</span>
                    <span className={`text-[10px] font-bold ${descLength > 160 ? 'text-rose-400' : descLength < 120 ? 'text-amber-400' : 'text-emerald-400'}`}>{descLength}/160</span>
                  </div>
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} maxLength={200} rows={4} className="seo-input resize-none" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Focus Keywords</span>
                  <input defaultValue={editing.keywords.join(', ')} className="seo-input" />
                </label>
                <div className="rounded-xl border border-white/8 bg-white/3 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Title quality</span>
                    <span className={`font-bold ${titleScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{titleScore === 100 ? 'Optimal' : 'Needs work'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Description quality</span>
                    <span className={`font-bold ${descScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{descScore === 100 ? 'Optimal' : 'Needs work'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Overall SEO</span>
                    <span className="font-bold text-white">{editing.score}/100</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Google Search Preview</h3>
                <div className="rounded-xl border border-white/8 bg-white p-4">
                  <div className="text-xs text-[#777]">https://astu-ams.et<strong className="text-[#555]">{editing.url}</strong></div>
                  <div className="mt-1 text-base font-medium text-[#1a0dab] hover:underline cursor-pointer">{editTitle || 'Your page title'}</div>
                  <div className="mt-1 text-xs text-slate-600 line-clamp-3">{editDesc || 'Your meta description appears here in search results.'}</div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/8 px-3 py-2 text-xs text-blue-400">
                  <Eye className="h-3.5 w-3.5 shrink-0" /> Preview uses real Google SERP layout for desktop.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-white/8 bg-white/2 px-6 py-4">
              <button type="button" onClick={() => setEditingId(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all">Cancel</button>
              <button type="button" onClick={saveEditor}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#003580] to-[#0a4fa6] px-4 py-2 text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-[#003580]/30">
                <CheckCircle2 className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
