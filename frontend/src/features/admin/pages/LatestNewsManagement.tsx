import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  Globe,
  Megaphone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import contentService from '../services/content.service';
import { ContentCardItem } from '../components/ContentCard';

type NewsStatus = 'Published' | 'Draft' | 'Scheduled';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  status: NewsStatus;
  views: number;
  image: string;
}

const categories = ['All', 'Campus', 'Research', 'Events', 'Alumni', 'Partnership', 'Academic'];

export default function LatestNewsManagement() {
  const [items, setItems] = useState<ContentCardItem[]>(() => contentService.getItems());
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formCategory, setFormCategory] = useState('Campus');
  const [formDate, setFormDate] = useState('');

  const syncItems = useCallback(() => {
    setItems(contentService.getItems());
  }, []);

  useEffect(() => {
    syncItems();
    window.addEventListener('astu-cms-content-changed', syncItems);
    return () => window.removeEventListener('astu-cms-content-changed', syncItems);
  }, [syncItems]);

  const news: NewsItem[] = useMemo(() => {
    return items.map((i) => ({
      id: i.id,
      title: i.title,
      summary: i.excerpt || i.title,
      date: i.publishedAt || i.updatedAt || 'Just now',
      category: i.tags?.[0] ? i.tags[0].toUpperCase() : 'Campus',
      status: (i.status === 'Needs Review' || i.status === 'Archived') ? 'Draft' : (i.status as NewsStatus),
      views: i.views || 0,
      image: '/images/news/default.jpg',
    }));
  }, [items]);

  const filteredNews = useMemo(() => {
    let result = news;
    if (filterCat !== 'All') result = result.filter(n => n.category.toLowerCase() === filterCat.toLowerCase());
    if (search.trim()) result = result.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [news, filterCat, search]);

  const stats = useMemo(() => ({
    total: news.length,
    published: news.filter(n => n.status === 'Published').length,
    draft: news.filter(n => n.status === 'Draft').length,
    totalViews: news.reduce((s, n) => s + n.views, 0),
  }), [news]);

  const createNews = useCallback(() => {
    if (!formTitle.trim() || !formSummary.trim()) { toast.error('Title and summary are required'); return; }
    
    const created = contentService.addItem({
      title: formTitle.trim(),
      type: 'announcement',
      status: 'Published',
      excerpt: formSummary.trim(),
      author: 'Content Manager',
      updatedAt: 'Just now',
      publishedAt: formDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tags: [formCategory.toLowerCase(), 'announcement', 'astu'],
      pinned: false,
      featured: true,
      language: 'EN',
    });

    syncItems();
    setFormTitle(''); setFormSummary(''); setFormDate('');
    setShowCreate(false);
    toast.success(`Announcement "${created.title}" published & saved live to DB!`);
  }, [formTitle, formSummary, formCategory, formDate, syncItems]);

  const togglePublish = useCallback((id: string) => {
    const target = items.find(i => i.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Published' ? 'Draft' : 'Published';
    contentService.updateItem(id, { status: nextStatus });
    syncItems();
    toast.success(nextStatus === 'Published' ? `"${target.title}" published` : `"${target.title}" unpublished`);
  }, [items, syncItems]);

  const deleteNews = useCallback((id: string) => {
    const target = items.find(i => i.id === id);
    contentService.deleteItem(id);
    syncItems();
    toast.success(`"${target?.title || id}" deleted`);
  }, [items, syncItems]);

  return (
    <div className="space-y-6">
      <style>{`@keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .fade-up { animation: fade-up 0.35s ease-out both; }`}</style>

      <AdminPageHeader
        title="Latest News & Announcements"
        subtitle="Create, edit, publish, and manage news and announcements displayed live on the public site."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Latest News & Announcements' }]}
        actions={
          <button onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm">
            <Plus className="h-3.5 w-3.5" /> Post New Announcement
          </button>
        }
      />

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Articles', value: stats.total, icon: Megaphone, color: 'text-[#003580] bg-[#003580]/10' },
          { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-[#1D9E75] bg-[#1D9E75]/10' },
          { label: 'Drafts', value: stats.draft, icon: Edit3, color: 'text-[var(--text-secondary)] bg-[var(--bg-page)]' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-violet-600 bg-violet-100' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-4 rounded-xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-4 shadow-sm">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400">{stat.label}</p>
                <p className="text-xl font-bold text-[var(--text-primary)] dark:text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Create Modal / Form Drawer */}
      {showCreate && (
        <div className="rounded-xl border border-[#003580]/20 dark:border-[#003580]/40 bg-[#003580]/5 dark:bg-[#003580]/10 p-5 fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#003580]" /> Post New Announcement / News
            </h3>
            <button onClick={() => setShowCreate(false)} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Title *</label>
              <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g., ASTU AI Research Center Launch 2026"
                className="w-full rounded-lg border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-900 dark:text-white px-3 py-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Category</label>
              <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-900 dark:text-white px-3 py-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]">
                {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Announcement Body / Summary *</label>
              <textarea rows={3} value={formSummary} onChange={e => setFormSummary(e.target.value)}
                placeholder="Detailed announcement content..."
                className="w-full rounded-lg border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-900 dark:text-white px-3 py-2 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[#003580]" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button onClick={() => setShowCreate(false)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]">
              Cancel
            </button>
            <button onClick={createNews} className="rounded-lg bg-[#003580] px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110">
              Publish Announcement Now
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news and announcements..."
            className="w-full rounded-lg border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 dark:text-white pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-slate-400 outline-none focus:border-[#003580]" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                filterCat === cat ? 'bg-[#003580] text-white' : 'bg-[var(--bg-page)] dark:bg-slate-800 text-[var(--text-secondary)] dark:text-slate-300  dark:hover:bg-slate-700'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredNews.map(n => (
          <div key={n.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-4 shadow-sm hover:border-[#003580]/30 transition-all">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580] font-bold text-xs">
                {n.id}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] dark:text-white line-clamp-1">{n.title}</h4>
                  <span className="rounded bg-[var(--bg-page)] dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)] dark:text-slate-300 uppercase tracking-wider">{n.category}</span>
                  <AdminBadge variant={n.status === 'Published' ? 'success' : 'neutral'}>{n.status}</AdminBadge>
                </div>
                <p className="text-xs text-[var(--text-muted)] dark:text-slate-400 mt-1 line-clamp-2">{n.summary}</p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-[var(--text-muted)] dark:text-slate-500">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {n.date}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {n.views.toLocaleString()} views</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button onClick={() => togglePublish(n.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  n.status === 'Published' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}>
                {n.status === 'Published' ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => deleteNews(n.id)}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-rose-50 hover:text-rose-600 transition-all" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredNews.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--border-color)] dark:border-slate-700 py-12 text-center text-xs text-[var(--text-muted)] dark:text-slate-400">
            No news or announcements match your search filters.
          </div>
        )}
      </div>
    </div>
  );
}
