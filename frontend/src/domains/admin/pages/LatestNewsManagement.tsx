import React, { useCallback, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  Megaphone,
  Plus,
  Search,
  Trash2,
  X,
  LayoutGrid,
  List,
  Tag,
  TrendingUp,
  Clock,
  Globe,
  Filter,
  Image,
  AlignLeft,
  Bookmark,
  ChevronDown,
  ArrowUpRight,
  Newspaper,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import { useCmsListSection } from '../hooks/useCmsSection';
import { CmsSkeleton, CmsError } from '../components/CmsLoadingState';
import { fetchNewsList, createNews, updateNews, deleteNews } from '../services/cmsService';
import type { LatestNewsItem } from '../services/cmsService';

type NewsStatus = 'Published' | 'Draft' | 'Scheduled';
type ViewMode = 'grid' | 'table';

const categories = ['All', 'Campus', 'Research', 'Events', 'Alumni', 'Partnership', 'Academic'];

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  Published: {
    label: 'Published',
    dot: 'bg-emerald-400',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-400',
  },
  Draft: {
    label: 'Draft',
    dot: 'bg-slate-400',
    badge: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400',
  },
  Scheduled: {
    label: 'Scheduled',
    dot: 'bg-blue-400',
    badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/30 dark:text-blue-400',
  },
};

const categoryColors: Record<string, string> = {
  Campus: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  Research: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  Events: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  Alumni: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  Partnership: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
  Academic: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
};

const EMPTY_FORM = { title: '', summary: '', category: 'Campus', date: '', status: 'Draft' as NewsStatus, image: '' };

export default function LatestNewsManagement() {
  const {
    items: news,
    isLoading,
    error,
    refetch,
    add: addNews,
    update: updateNewsItem,
    remove: removeNews,
  } = useCmsListSection<LatestNewsItem>(fetchNewsList, {
    createFn: createNews as any,
    updateFn: updateNews as any,
    deleteFn: deleteNews,
  });

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'All' | NewsStatus>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const filteredNews = useMemo(() => {
    let items = news;
    if (filterCat !== 'All') items = items.filter(n => n.category === filterCat);
    if (filterStatus !== 'All') items = items.filter(n => n.status === filterStatus);
    if (search.trim()) items = items.filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase())
    );
    return items;
  }, [news, filterCat, filterStatus, search]);

  const stats = useMemo(() => ({
    total: news.length,
    published: news.filter(n => n.status === 'Published').length,
    draft: news.filter(n => n.status === 'Draft').length,
    scheduled: news.filter(n => n.status === 'Scheduled').length,
    totalViews: news.reduce((s, n) => s + n.views, 0),
  }), [news]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item: LatestNewsItem) => {
    setEditingId(item.id);
    setForm({ title: item.title, summary: item.summary, category: item.category, date: item.date, status: item.status, image: item.image || '' });
    setShowModal(true);
  };

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim() || !form.summary.trim()) {
      toast.error('Title and summary are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateNewsItem(editingId, { title: form.title.trim(), summary: form.summary.trim(), category: form.category, date: form.date || new Date().toISOString().slice(0, 10), status: form.status, image: form.image || '/images/news/default.jpg' });
        toast.success('Article updated');
      } else {
        await addNews({ title: form.title.trim(), summary: form.summary.trim(), date: form.date || new Date().toISOString().slice(0, 10), category: form.category, status: form.status as NewsStatus, views: 0, image: form.image || '/images/news/default.jpg' });
        toast.success('Article created');
      }
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  }, [form, editingId, addNews, updateNewsItem]);

  const togglePublish = useCallback((id: string) => {
    const item = news.find(n => n.id === id);
    if (!item) return;
    const newStatus: NewsStatus = item.status === 'Published' ? 'Draft' : 'Published';
    updateNewsItem(id, { status: newStatus });
    toast.success(newStatus === 'Published' ? `"${item.title}" published` : `"${item.title}" unpublished`);
  }, [news, updateNewsItem]);

  const handleDelete = useCallback((id: string) => {
    const item = news.find(n => n.id === id);
    removeNews(id, item?.title);
  }, [news, removeNews]);

  if (isLoading) return <CmsSkeleton rows={6} card />;
  if (error) return <CmsError message={error} onRetry={refetch} />;

  return (
    <div className="space-y-7">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        .news-fade { animation: fade-up 0.35s ease-out both; }
        .modal-in { animation: scale-in 0.22s ease-out both; }
      `}</style>

      <AdminPageHeader
        title="News Management"
        subtitle="Create, publish, and manage news articles displayed on the public homepage."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Latest News' }]}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#E8A020] px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110 hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4" /> New Article
          </button>
        }
      />

      {/* Stats Row */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Total Articles', value: stats.total, icon: Newspaper, color: '#003580', sub: 'All articles' },
          { label: 'Published', value: stats.published, icon: Globe, color: '#1D9E75', sub: 'Live on site' },
          { label: 'Drafts', value: stats.draft, icon: Edit3, color: '#6366f1', sub: 'In progress' },
          { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: '#E8A020', sub: 'Queued' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: '#e24b4a', sub: 'All time' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="news-fade group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#1a1d27]/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(ellipse at top right, ${stat.color}08, transparent 70%)` }} />
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity text-slate-400" style={{ color: stat.color }} />
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${filterCat === cat ? 'bg-[#003580] text-white shadow-md shadow-[#003580]/20' : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {cat}
            </button>
          ))}
          {/* Status filter */}
          <div className="relative ml-1">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-[#003580] cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 transition-colors"
            />
          </div>
          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#003580] text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#003580] text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Filter className="h-3.5 w-3.5" />
        <span>Showing <strong className="text-slate-700 dark:text-slate-300">{filteredNews.length}</strong> of <strong className="text-slate-700 dark:text-slate-300">{news.length}</strong> articles</span>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredNews.map((item, idx) => (
            <ArticleCard
              key={item.id}
              item={item}
              idx={idx}
              onEdit={() => openEdit(item)}
              onTogglePublish={() => togglePublish(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
          {filteredNews.length === 0 && <EmptyState onAdd={openCreate} />}
        </section>
      ) : (
        <ArticleTable
          items={filteredNews}
          onEdit={openEdit}
          onTogglePublish={togglePublish}
          onDelete={handleDelete}
        />
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <ArticleModal
          editingId={editingId}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
}

/* ─────────────────────── Sub-components ─────────────────────── */

function ArticleCard({ item, idx, onEdit, onTogglePublish, onDelete }: {
  item: LatestNewsItem;
  idx: number;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const sc = statusConfig[item.status] ?? statusConfig.Draft;
  const catColor = categoryColors[item.category] ?? 'bg-slate-100 text-slate-600';

  return (
    <div
      className="news-fade group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#1a1d27]/90 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      {/* Image area */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#003580]/10 via-[#0a4fa6]/15 to-[#1D9E75]/20">
        {item.image && !item.image.includes('default') ? (
          <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Megaphone className="h-14 w-14 text-[#003580]/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Status pill on image */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm ${sc.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Category + meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${catColor}`}>
            {item.category}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <CalendarDays className="h-3 w-3" /> {item.date}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <Eye className="h-3 w-3" /> {item.views.toLocaleString()}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
          {item.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {item.summary}
        </p>

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onTogglePublish}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
              item.status === 'Published'
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-950/50'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
            }`}
          >
            {item.status === 'Published' ? <X className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
            {item.status === 'Published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <Edit3 className="h-3 w-3" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all ml-auto"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleTable({ items, onEdit, onTogglePublish, onDelete }: {
  items: LatestNewsItem[];
  onEdit: (item: LatestNewsItem) => void;
  onTogglePublish: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) return <EmptyState onAdd={() => {}} />;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#1a1d27]/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40">
              {['Article', 'Category', 'Status', 'Date', 'Views', 'Actions'].map(h => (
                <th key={h} className="whitespace-nowrap px-5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item, i) => {
              const sc = statusConfig[item.status] ?? statusConfig.Draft;
              const catColor = categoryColors[item.category] ?? 'bg-slate-100 text-slate-600';
              return (
                <tr key={item.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors" style={{ animation: `fade-up 0.3s ease-out ${i * 0.04}s both` }}>
                  <td className="px-5 py-4 min-w-[260px]">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{item.summary}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${catColor}`}>{item.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${sc.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.date}</td>
                  <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.views.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onTogglePublish(item.id)}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all ${item.status === 'Published' ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        title={item.status === 'Published' ? 'Unpublish' : 'Publish'}
                      >
                        {item.status === 'Published' ? <X className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => onEdit(item)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => onDelete(item.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArticleModal({ editingId, form, setForm, onSubmit, onClose, submitting }: {
  editingId: string | null;
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  onSubmit: () => void;
  onClose: () => void;
  submitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="modal-in w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-[#003580]/5 to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003580]/10 text-[#003580] dark:bg-blue-500/10 dark:text-blue-400">
              {editingId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{editingId ? 'Edit Article' : 'New Article'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{editingId ? 'Update article details' : 'Create a new news article'}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <AlignLeft className="h-3.5 w-3.5 text-slate-400" /> Title <span className="text-rose-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. ASTU Launches New Innovation Hub"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500 transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Bookmark className="h-3.5 w-3.5 text-slate-400" /> Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              rows={3}
              placeholder="Brief description of the article..."
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500 transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Image className="h-3.5 w-3.5 text-slate-400" /> Image URL
            </label>
            <input
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              placeholder="/images/news/my-article.jpg"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500 transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Row: Category + Status + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Tag className="h-3.5 w-3.5 text-slate-400" /> Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500"
              >
                {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Globe className="h-3.5 w-3.5 text-slate-400" /> Status
              </label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as NewsStatus }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" /> Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-[#003580] dark:focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : editingId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 mb-4">
        <Newspaper className="h-10 w-10" />
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No articles found</h3>
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Try adjusting filters or create a new article.</p>
      <button onClick={onAdd} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-md">
        <Plus className="h-4 w-4" /> New Article
      </button>
    </div>
  );
}
