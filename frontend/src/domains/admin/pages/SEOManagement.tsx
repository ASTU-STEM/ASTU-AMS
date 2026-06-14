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
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';

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
  { id: '2', url: '/events/career-fair-2026', title: 'Career Fair 2026 — ASTU', description: 'Meet 40+ leading employers at ASTU\'s annual career fair. Open to all students and recent graduates.', keywords: ['career fair', 'ASTU events', 'jobs Ethiopia'], status: 'Good', score: 82, issues: 1, traffic: 2340, position: 3.6 },
  { id: '3', url: '/alumni/success-stories', title: 'Alumni Success Stories', description: 'Inspiring journeys from ASTU graduates building careers across the world.', keywords: ['alumni stories', 'success', 'graduates'], status: 'Good', score: 78, issues: 2, traffic: 1820, position: 5.2 },
  { id: '4', url: '/tracer-survey', title: 'Graduate Tracer Survey 2026', description: 'Help us improve ASTU by sharing your post-graduation experience. Survey takes 5 minutes.', keywords: ['tracer study', 'graduate survey', 'ASTU'], status: 'Needs Work', score: 64, issues: 4, traffic: 920, position: 9.4 },
  { id: '5', url: '/employers/partnership', title: 'Employer Partnership Program', description: 'Join ASTU\'s industry partnership program to recruit top engineering, business, and science talent.', keywords: ['employer partnership', 'recruiting', 'ASTU jobs'], status: 'Good', score: 81, issues: 1, traffic: 1430, position: 4.2 },
  { id: '6', url: '/departments/engineering', title: 'School of Engineering — ASTU', description: 'ASTU engineering programs cover mechanical, electrical, civil, and computer engineering with research focus.', keywords: ['engineering school', 'ASTU engineering', 'Ethiopia engineering'], status: 'Excellent', score: 91, issues: 0, traffic: 3210, position: 2.1 },
  { id: '7', url: '/about/history', title: 'ASTU History & Heritage', description: 'Founded in 1993, ASTU has grown into a premier science and technology university in Ethiopia.', keywords: ['ASTU history', 'about ASTU', 'Ethiopia universities'], status: 'Critical', score: 48, issues: 7, traffic: 320, position: 18.2 },
  { id: '8', url: '/news/graduation-2025', title: 'Graduation Ceremony 2025 Highlights', description: 'Relive the magical moments from ASTU\'s 2025 graduation ceremony with 3,500+ graduates.', keywords: ['graduation', 'ASTU news', '2025 ceremony'], status: 'Excellent', score: 94, issues: 0, traffic: 4120, position: 1.8 },
];

const statusStyles: Record<SeoStatus, string> = {
  Excellent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Good: 'border-blue-200 bg-blue-50 text-blue-700',
  'Needs Work': 'border-amber-200 bg-amber-50 text-amber-700',
  Critical: 'border-rose-200 bg-rose-50 text-rose-700',
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

  const aggregateScore = useMemo(() => {
    const total = sampleItems.reduce((sum, it) => sum + it.score, 0);
    return Math.round(total / sampleItems.length);
  }, []);

  const totalTraffic = useMemo(() => sampleItems.reduce((sum, it) => sum + it.traffic, 0), []);
  const totalIssues = useMemo(() => sampleItems.reduce((sum, it) => sum + it.issues, 0), []);

  const openEditor = (item: SeoItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDesc(item.description);
  };

  const saveEditor = () => {
    toast.success('SEO metadata saved');
    setEditingId(null);
  };

  const editing = editingId ? sampleItems.find((i) => i.id === editingId) : null;
  const titleLength = editTitle.length;
  const descLength = editDesc.length;
  const titleScore = titleLength >= 30 && titleLength <= 60 ? 100 : titleLength > 0 ? 60 : 0;
  const descScore = descLength >= 120 && descLength <= 160 ? 100 : descLength > 0 ? 60 : 0;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="SEO Management"
        subtitle="Monitor and optimize every public page for search engines. Track rankings, fix issues, and preview Google results."
        breadcrumbs={[{ label: 'CMS' }, { label: 'SEO' }]}
        actions={<AdminBadge variant="success">Indexing: Active</AdminBadge>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Average SEO Score', value: `${aggregateScore}/100`, icon: Sparkles, color: '#003580' },
          { label: 'Monthly Traffic', value: totalTraffic.toLocaleString(), icon: TrendingUp, color: '#1D9E75' },
          { label: 'Tracked Pages', value: sampleItems.length, icon: FileSearch, color: '#E8A020' },
          { label: 'Open Issues', value: totalIssues, icon: XCircle, color: totalIssues > 5 ? '#E24B4A' : '#1D9E75' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{s.label}</p>
                <p className="text-xl font-semibold tracking-tight text-slate-900">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search URLs, titles, or keywords..." className="w-full rounded-[8px] border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10" />
          </div>
          <button type="button" onClick={() => toast.success('Re-running SEO audit...')} className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <RefreshCw className="h-3.5 w-3.5" /> Re-audit
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
          {(['all', 'Excellent', 'Good', 'Needs Work', 'Critical'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${statusFilter === s ? 'bg-[#003580] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === 'all' ? 'All Pages' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[item.status]}`}>{item.status}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">{item.url}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.keywords.map((kw) => (
                    <span key={kw} className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-[#003580]">
                      <Hash className="h-2.5 w-2.5" />{kw}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-slate-50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Score</p>
                  <p className="text-sm font-bold" style={{ color: item.score >= 80 ? '#1D9E75' : item.score >= 60 ? '#E8A020' : '#E24B4A' }}>{item.score}</p>
                </div>
                <div className="rounded-md bg-slate-50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Position</p>
                  <p className="text-sm font-bold text-slate-800">#{item.position.toFixed(1)}</p>
                </div>
                <div className="rounded-md bg-slate-50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Traffic</p>
                  <p className="text-sm font-bold text-slate-800">{item.traffic.toLocaleString()}</p>
                </div>
              </div>
            </div>
            {item.issues > 0 && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-800">
                <strong>{item.issues} issue{item.issues > 1 ? 's' : ''} detected:</strong> {item.issues > 2 ? 'Add structured data, improve mobile usability,' : ''} optimize meta description length
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => openEditor(item)} className="inline-flex items-center gap-1 rounded-md bg-[#003580] px-2.5 py-1 text-[11px] font-semibold text-white hover:brightness-110">
                <Sparkles className="h-3 w-3" /> Edit SEO
              </button>
              <button type="button" onClick={() => window.open(item.url, '_blank')} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
                <ExternalLink className="h-3 w-3" /> Open Page
              </button>
              <button type="button" onClick={() => toast.success('Sitemap regenerated')} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
                <Globe className="h-3 w-3" /> Resubmit Sitemap
              </button>
              <button type="button" onClick={() => toast.success('Copied canonical link')} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
                <Link2 className="h-3 w-3" /> Copy URL
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setEditingId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Edit SEO Metadata</h2>
                <p className="text-xs text-slate-500">{editing.url}</p>
              </div>
              <button type="button" onClick={() => setEditingId(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 px-6 py-5 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Meta Title</span>
                    <span className={`text-[10px] font-semibold ${titleLength > 60 ? 'text-rose-600' : titleLength < 30 ? 'text-amber-600' : 'text-emerald-600'}`}>{titleLength}/60</span>
                  </div>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={80} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
                <label className="block">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Meta Description</span>
                    <span className={`text-[10px] font-semibold ${descLength > 160 ? 'text-rose-600' : descLength < 120 ? 'text-amber-600' : 'text-emerald-600'}`}>{descLength}/160</span>
                  </div>
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} maxLength={200} rows={4} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Focus Keywords</span>
                  <input defaultValue={editing.keywords.join(', ')} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
                <div className="rounded-[8px] border border-slate-200 bg-slate-50/60 p-3 text-xs">
                  <div className="mb-2 flex items-center justify-between"><span>Title quality</span><span className={`font-semibold ${titleScore === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{titleScore === 100 ? 'Optimal' : 'Needs work'}</span></div>
                  <div className="mb-2 flex items-center justify-between"><span>Description quality</span><span className={`font-semibold ${descScore === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{descScore === 100 ? 'Optimal' : 'Needs work'}</span></div>
                  <div className="flex items-center justify-between"><span>Overall SEO</span><span className="font-semibold text-slate-800">{editing.score}/100</span></div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Google Search Preview</h3>
                <div className="rounded-[8px] border border-slate-200 bg-white p-4">
                  <div className="text-xs text-[#1a0dab]">https://astu-ams.et<strong>{editing.url}</strong></div>
                  <div className="mt-1 text-base font-medium text-[#1a0dab] hover:underline">{editTitle || 'Your page title'}</div>
                  <div className="mt-1 text-xs text-slate-600 line-clamp-3">{editDesc || 'Your meta description appears here in search results.'}</div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-[8px] border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  <Eye className="h-3.5 w-3.5" /> Preview uses real Google SERP layout for desktop.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
              <button type="button" onClick={() => setEditingId(null)} className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={saveEditor} className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
                <CheckCircle2 className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
