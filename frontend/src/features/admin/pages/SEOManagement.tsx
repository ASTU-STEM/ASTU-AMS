import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileSearch,
  Globe,
  Hash,
  Link2,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import contentService from '../services/content.service';

export type SeoStatus = 'Excellent' | 'Good' | 'Needs Work' | 'Critical';

export type SeoItem = {
  id: string;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  robots?: string;
  ogImage?: string;
  status: SeoStatus;
  score: number;
  issues: number;
  traffic: number;
  position: number;
};

const SEO_STORAGE_KEY = 'astu_cms_seo_records';

const defaultSeoItems: SeoItem[] = [
  {
    id: 'seo-1',
    url: '/',
    title: 'ASTU Alumni Management & Engagement Portal — Adama Science and Technology University',
    description: 'Connect with over 25,000 verified ASTU graduates, access academic tracer study campaigns, and explore career opportunities across East Africa.',
    keywords: ['ASTU alumni', 'university portal', 'Ethiopia technology graduates', 'tracer study'],
    canonicalUrl: 'https://astu-ams.et/',
    robots: 'index, follow',
    status: 'Excellent',
    score: 96,
    issues: 0,
    traffic: 8420,
    position: 1.4,
  },
  {
    id: 'seo-2',
    url: '/events',
    title: 'Campus Events & Workshops — ASTU Public Portal',
    description: 'Explore upcoming academic conferences, career fairs, alumni summits, and coding bootcamps organized by Adama Science and Technology University.',
    keywords: ['career fair', 'ASTU events', 'engineering workshops', 'alumni summit'],
    canonicalUrl: 'https://astu-ams.et/events',
    robots: 'index, follow',
    status: 'Good',
    score: 84,
    issues: 1,
    traffic: 3120,
    position: 3.2,
  },
  {
    id: 'seo-3',
    url: '/alumni/stories',
    title: 'Distinguished Alumni Career Spotlights — ASTU',
    description: 'Inspiring career journeys and innovations from ASTU graduates leading high-impact engineering and tech companies worldwide.',
    keywords: ['alumni success', 'ASTU graduates', 'innovation spotlight'],
    canonicalUrl: 'https://astu-ams.et/alumni/stories',
    robots: 'index, follow',
    status: 'Good',
    score: 79,
    issues: 1,
    traffic: 2450,
    position: 4.8,
  },
  {
    id: 'seo-4',
    url: '/tracer-study',
    title: 'Annual Graduate Tracer Study Campaign 2026 — ASTU',
    description: 'Participate in the official ASTU alumni tracer study to measure employment outcomes and enhance curriculum relevance.',
    keywords: ['tracer study', 'graduate survey', 'employment survey', 'ASTU'],
    canonicalUrl: 'https://astu-ams.et/tracer-study',
    robots: 'index, follow',
    status: 'Needs Work',
    score: 65,
    issues: 3,
    traffic: 1120,
    position: 8.5,
  },
  {
    id: 'seo-5',
    url: '/about',
    title: 'About Adama Science and Technology University (ASTU)',
    description: 'Learn about ASTU mission, technological research directorate, academic schools, and institutional heritage since 1993.',
    keywords: ['ASTU about', 'Ethiopia science university', 'Adama technology'],
    canonicalUrl: 'https://astu-ams.et/about',
    robots: 'index, follow',
    status: 'Good',
    score: 82,
    issues: 1,
    traffic: 2900,
    position: 2.7,
  },
];

const statusStyles: Record<SeoStatus, string> = {
  Excellent: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
  Good: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
  'Needs Work': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
  Critical: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
};

function computeSeoScore(title: string, desc: string, keywords: string[]): { score: number; status: SeoStatus; issues: number } {
  let score = 40;
  let issues = 0;

  const tLen = title.trim().length;
  if (tLen >= 30 && tLen <= 65) {
    score += 30;
  } else if (tLen > 0) {
    score += 15;
    issues += 1;
  } else {
    issues += 2;
  }

  const dLen = desc.trim().length;
  if (dLen >= 110 && dLen <= 165) {
    score += 25;
  } else if (dLen > 0) {
    score += 12;
    issues += 1;
  } else {
    issues += 2;
  }

  if (keywords.length >= 2) {
    score += 15;
  } else {
    issues += 1;
  }

  score = Math.min(100, Math.max(25, score));

  let status: SeoStatus = 'Critical';
  if (score >= 85) status = 'Excellent';
  else if (score >= 70) status = 'Good';
  else if (score >= 55) status = 'Needs Work';

  return { score, status, issues };
}

export default function SEOManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SeoStatus>('all');
  const [isAuditing, setIsAuditing] = useState(false);

  // Persistent SEO state
  const [seoItems, setSeoItems] = useState<SeoItem[]>(() => {
    try {
      const saved = localStorage.getItem(SEO_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    return defaultSeoItems;
  });

  const saveItems = (items: SeoItem[]) => {
    setSeoItems(items);
    localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(items));
  };

  // Merge with published CMS content items on mount
  useEffect(() => {
    const publishedContent = contentService.getItems().filter((i) => i.status === 'Published');
    if (publishedContent.length > 0) {
      setSeoItems((prev) => {
        const existingUrls = new Set(prev.map((it) => it.url));
        const newItems: SeoItem[] = [];

        publishedContent.forEach((c) => {
          const slug = c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const pageUrl = `/announcements/${slug}`;
          if (!existingUrls.has(pageUrl)) {
            const audit = computeSeoScore(c.title, c.excerpt || '', c.tags || []);
            newItems.push({
              id: `seo-content-${c.id}`,
              url: pageUrl,
              title: `${c.title} — ASTU Portal`,
              description: c.excerpt || `Official publication: ${c.title} from Adama Science and Technology University.`,
              keywords: c.tags && c.tags.length ? c.tags : ['astu', 'announcement'],
              canonicalUrl: `https://astu-ams.et${pageUrl}`,
              robots: 'index, follow',
              status: audit.status,
              score: audit.score,
              issues: audit.issues,
              traffic: c.views || 140,
              position: 5.0,
            });
          }
        });

        if (newItems.length > 0) {
          const merged = [...prev, ...newItems];
          localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return prev;
      });
    }
  }, []);

  // Modal edit state
  const [editingItem, setEditingItem] = useState<SeoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editKeywordsInput, setEditKeywordsInput] = useState('');
  const [editCanonical, setEditCanonical] = useState('');
  const [editRobots, setEditRobots] = useState('index, follow');

  const filtered = useMemo(() => {
    return seoItems.filter((it) => {
      if (statusFilter !== 'all' && it.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          it.title.toLowerCase().includes(q) ||
          it.url.toLowerCase().includes(q) ||
          it.keywords.some((k) => k.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [seoItems, search, statusFilter]);

  const aggregateScore = useMemo(() => {
    if (seoItems.length === 0) return 0;
    const total = seoItems.reduce((sum, it) => sum + it.score, 0);
    return Math.round(total / seoItems.length);
  }, [seoItems]);

  const totalTraffic = useMemo(() => seoItems.reduce((sum, it) => sum + it.traffic, 0), [seoItems]);
  const totalIssues = useMemo(() => seoItems.reduce((sum, it) => sum + it.issues, 0), [seoItems]);

  // Actions
  const openEditor = (item: SeoItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditKeywordsInput(item.keywords.join(', '));
    setEditCanonical(item.canonicalUrl || `https://astu-ams.et${item.url}`);
    setEditRobots(item.robots || 'index, follow');
  };

  const saveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const keywords = editKeywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const audit = computeSeoScore(editTitle, editDesc, keywords);

    const updated: SeoItem = {
      ...editingItem,
      title: editTitle.trim(),
      description: editDesc.trim(),
      keywords: keywords.length ? keywords : ['astu'],
      canonicalUrl: editCanonical.trim(),
      robots: editRobots,
      score: audit.score,
      status: audit.status,
      issues: audit.issues,
    };

    const newItems = seoItems.map((it) => (it.id === editingItem.id ? updated : it));
    saveItems(newItems);
    toast.success(`SEO parameters saved! New score: ${audit.score}/100`);
    setEditingItem(null);
  };

  const runReaudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const reaudited = seoItems.map((it) => {
        const audit = computeSeoScore(it.title, it.description, it.keywords);
        return {
          ...it,
          score: audit.score,
          status: audit.status,
          issues: audit.issues,
        };
      });
      saveItems(reaudited);
      setIsAuditing(false);
      toast.success(`Audit finished! Recalculated SEO scores for ${reaudited.length} pages.`);
    }, 600);
  };

  // Generate & Download real sitemap.xml
  const generateAndDownloadSitemap = () => {
    const today = new Date().toISOString().split('T')[0];
    const xmlUrls = seoItems
      .map((item) => {
        const fullUrl = item.canonicalUrl || `https://astu-ams.et${item.url}`;
        const priority = item.url === '/' ? '1.0' : item.url.startsWith('/events') ? '0.8' : '0.7';
        return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
      })
      .join('\n');

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Generated & downloaded sitemap.xml with ${seoItems.length} URLs!`);
  };

  const copyPageUrl = (item: SeoItem) => {
    const targetUrl = item.canonicalUrl || `${window.location.origin}${item.url}`;
    navigator.clipboard.writeText(targetUrl);
    toast.success(`Copied URL: ${targetUrl}`);
  };

  // Score metrics for editor modal
  const liveTitleLen = editTitle.length;
  const liveDescLen = editDesc.length;
  const titleOptimal = liveTitleLen >= 30 && liveTitleLen <= 65;
  const descOptimal = liveDescLen >= 110 && liveDescLen <= 165;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="SEO Management"
        subtitle="Monitor and optimize public portal search engine visibility. Audit metadata, generate sitemaps, and preview SERP snippets."
        breadcrumbs={[{ label: 'CMS' }, { label: 'SEO' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generateAndDownloadSitemap}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download Sitemap.xml
            </button>
            <AdminBadge variant="success">Indexing: Active</AdminBadge>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Average SEO Score', value: `${aggregateScore}/100`, icon: Sparkles, color: '#003580' },
          { label: 'Monthly Organic Traffic', value: totalTraffic.toLocaleString(), icon: TrendingUp, color: '#1D9E75' },
          { label: 'Indexed URLs', value: seoItems.length, icon: FileSearch, color: '#E8A020' },
          { label: 'Identified Issues', value: totalIssues, icon: XCircle, color: totalIssues > 5 ? '#E24B4A' : '#1D9E75' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-xs flex items-center gap-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] dark:text-slate-400">{s.label}</p>
                <p className="text-xl font-bold tracking-tight text-[var(--text-primary)] dark:text-white">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Audit Bar */}
      <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search URLs, titles, or focus keywords..."
              className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] py-2 pl-8 pr-8 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-slate-200">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={runReaudit}
            disabled={isAuditing}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAuditing ? 'animate-spin text-[#003580] dark:text-sky-400' : ''}`} />
            {isAuditing ? 'Auditing...' : 'Re-audit Pages'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-color)] pt-3 dark:border-slate-800">
          {(['all', 'Excellent', 'Good', 'Needs Work', 'Critical'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                statusFilter === s ? 'bg-[#003580] text-white shadow-xs dark:bg-sky-600' : 'bg-[var(--bg-page)] text-[var(--text-secondary)]  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {s === 'all' ? `All Pages (${seoItems.length})` : s}
            </button>
          ))}
        </div>
      </div>

      {/* Pages List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs transition-all hover:border-[var(--border-color)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[item.status]}`}>
                    {item.status}
                  </span>
                  <span className="rounded-md bg-[var(--bg-page)] px-2 py-0.5 text-[11px] font-mono text-[var(--text-secondary)] font-semibold dark:bg-slate-800 dark:text-slate-300">
                    {item.url}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--text-muted)]">
                    Robots: {item.robots || 'index, follow'}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-[var(--text-primary)] dark:text-white">{item.title}</h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)] dark:text-slate-300 line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {item.keywords.map((kw) => (
                    <span key={kw} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#003580] dark:bg-blue-950/50 dark:text-sky-300">
                      <Hash className="h-2.5 w-2.5" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics pill */}
              <div className="grid grid-cols-3 gap-2 text-center shrink-0">
                <div className="rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] px-3.5 py-2 dark:border-slate-700 dark:bg-slate-800/80">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Score</p>
                  <p
                    className="text-base font-extrabold"
                    style={{ color: item.score >= 80 ? '#1D9E75' : item.score >= 60 ? '#E8A020' : '#E24B4A' }}
                  >
                    {item.score}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] px-3.5 py-2 dark:border-slate-700 dark:bg-slate-800/80">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Position</p>
                  <p className="text-base font-extrabold text-[var(--text-primary)] dark:text-white">#{item.position.toFixed(1)}</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] px-3.5 py-2 dark:border-slate-700 dark:bg-slate-800/80">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Traffic</p>
                  <p className="text-base font-extrabold text-[var(--text-primary)] dark:text-white">{item.traffic.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {item.issues > 0 && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                <strong>{item.issues} audit issue{item.issues > 1 ? 's' : ''}:</strong>{' '}
                {item.title.length < 30 ? 'Title is under 30 characters. ' : ''}
                {item.description.length < 110 ? 'Description is too short for optimal search snippets. ' : ''}
                {item.keywords.length < 2 ? 'Add at least 2 focus keywords.' : ''}
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-color)] pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => openEditor(item)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#003580] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 shadow-xs cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" /> Edit Metadata
              </button>
              <button
                type="button"
                onClick={() => window.open(item.url, '_blank')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open Page
              </button>
              <button
                type="button"
                onClick={generateAndDownloadSitemap}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5" /> Sync Sitemap
              </button>
              <button
                type="button"
                onClick={() => copyPageUrl(item)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Link2 className="h-3.5 w-3.5" /> Copy URL
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-[12px] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-semibold text-[var(--text-secondary)] dark:text-slate-300">No pages found matching criteria</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try changing the status filter or clearing your search term.</p>
          </div>
        )}
      </div>

      {/* Edit SEO Metadata Modal */}
      {editingItem && (
        <AdminModal
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={`Edit SEO Metadata: ${editingItem.url}`}
          size="lg"
        >
          <form onSubmit={saveEditor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Inputs */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200">Meta Title</label>
                    <span className={`text-[11px] font-bold ${titleOptimal ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {liveTitleLen}/65 chars {titleOptimal ? '✓' : '(optimal 30-65)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200">Meta Description</label>
                    <span className={`text-[11px] font-bold ${descOptimal ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {liveDescLen}/165 chars {descOptimal ? '✓' : '(optimal 110-165)'}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs outline-none focus:border-[#003580] resize-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">
                    Focus Keywords <span className="text-[var(--text-muted)] font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={editKeywordsInput}
                    onChange={(e) => setEditKeywordsInput(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">Robots Tag</label>
                    <select
                      value={editRobots}
                      onChange={(e) => setEditRobots(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5 text-xs outline-none focus:border-[#003580] cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="index, follow">index, follow (Default)</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">Canonical URL</label>
                    <input
                      type="text"
                      value={editCanonical}
                      onChange={(e) => setEditCanonical(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-xs outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Google & Social Previews */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-600" /> Google Search Preview
                  </h4>
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800/90">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] dark:text-slate-300">
                      <span className="font-semibold text-[var(--text-primary)] dark:text-white">ASTU Public Portal</span>
                      <span>·</span>
                      <span className="text-[var(--text-muted)] text-[11px] truncate">{editCanonical || 'https://astu-ams.et'}</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#1a0dab] dark:text-sky-400 hover:underline line-clamp-1 cursor-pointer">
                      {editTitle || 'Your Page Title'}
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-secondary)] dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {editDesc || 'Your page meta description appears here in Google search engine result snippets.'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-purple-600" /> Social Card Preview (Open Graph)
                  </h4>
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] overflow-hidden shadow-xs dark:border-slate-700 dark:bg-slate-800">
                    <div className="h-20 bg-gradient-to-r from-[#003580] to-[#004080] flex items-center justify-center text-white text-xs font-bold">
                      ASTU Institutional Portal
                    </div>
                    <div className="p-3 bg-[var(--bg-card)] dark:bg-slate-900">
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">astu-ams.et</p>
                      <p className="text-xs font-bold text-[var(--text-primary)] dark:text-white line-clamp-1 mt-0.5">{editTitle || 'Page Title'}</p>
                      <p className="text-[11px] text-[var(--text-muted)] dark:text-slate-400 line-clamp-1 mt-0.5">{editDesc || 'Description'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#003580] px-5 py-2 text-xs font-bold text-white hover:brightness-110 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" /> Save SEO Metadata
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
