import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileText,
  Filter,
  GalleryHorizontal,
  Globe,
  Layers3,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  WifiOff,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import contentService from '../services/content.service';
import eventsService from '../services/events.service';
import homepageCmsService from '../services/homepageCms.service';
import AdminModal from '../components/AdminModal';
import AdminPageHeader from '../components/AdminPageHeader';
import { ContentCardItem, ContentStatus, ContentType } from '../components/ContentCard';

// ─── Types ───────────────────────────────────────────────────────────────────
type PublishState = 'Published' | 'Draft' | 'Scheduled' | 'Needs Review';

// ─── Styles ──────────────────────────────────────────────────────────────────
const STATUS_PILL: Record<PublishState, string> = {
  Published:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Draft:        'bg-slate-100  text-slate-600  border border-slate-200',
  Scheduled:    'bg-blue-50    text-blue-700   border border-blue-200',
  'Needs Review': 'bg-amber-50 text-amber-700  border border-amber-200',
};

const TYPE_BADGE: Record<ContentType, string> = {
  page:         'bg-blue-50   text-blue-700   border border-blue-200',
  announcement: 'bg-amber-50  text-amber-700  border border-amber-200',
  gallery:      'bg-purple-50 text-purple-700 border border-purple-200',
  event:        'bg-rose-50   text-rose-700   border border-rose-200',
  post:         'bg-teal-50   text-teal-700   border border-teal-200',
  template:     'bg-slate-50  text-slate-700  border border-slate-200',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await axios.get(`${API_BASE}/content`, { timeout: 3000 });
    return res.status === 200;
  } catch {
    return false;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CmsDashboard() {
  const navigate = useNavigate();

  // Live data
  const [items, setItems]               = useState<ContentCardItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [apiOnline, setApiOnline]       = useState<boolean | null>(null);

  // Filter state
  const [selectedTab, setSelectedTab]   = useState<'all' | PublishState>('all');
  const [typeFilter, setTypeFilter]     = useState<'all' | ContentType>('all');
  const [searchQuery, setSearchQuery]   = useState('');

  // Module counts from backend
  const [heroSlidesCount, setHeroSlidesCount] = useState(0);
  const [partnersCount, setPartnersCount]     = useState(0);
  const [mediaCount, setMediaCount]           = useState(0);
  const [eventsCount, setEventsCount]         = useState(0);
  const [lastSyncTime, setLastSyncTime]       = useState('');

  // Create content modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle]               = useState('');
  const [newType, setNewType]                 = useState<ContentType>('announcement');
  const [newStatus, setNewStatus]             = useState<ContentStatus>('Draft');
  const [newExcerpt, setNewExcerpt]           = useState('');
  const [newTags, setNewTags]                 = useState('');
  const [submitting, setSubmitting]           = useState(false);

  // ─── Data Fetching ───────────────────────────────────────────────────────
  const refreshAllData = useCallback(async (showToast = false) => {
    try {
      showToast ? setRefreshing(true) : setLoading(true);

      // Check API health
      const online = await checkApiHealth();
      setApiOnline(online);

      // 1. Content items
      const list = await contentService.fetchItemsFromApi();
      setItems((list || []).filter((i) => i.title !== 'Homepage CMS Configuration'));

      // 2. Homepage config (hero slides + partners)
      try {
        const cfg = await homepageCmsService.fetchFromApi();
        if (cfg) {
          setHeroSlidesCount(Array.isArray(cfg.heroSlides) ? cfg.heroSlides.filter((s: any) => s.active !== false).length : 0);
          setPartnersCount(Array.isArray(cfg.partners) ? cfg.partners.filter((p: any) => p.active !== false).length : 0);
        }
      } catch { /* ignore */ }

      // 3. Media count
      try {
        const mediaRes = await axios.get(`${API_BASE}/content/media`, { timeout: 3000 });
        if (mediaRes.data?.success && Array.isArray(mediaRes.data?.data)) {
          setMediaCount(mediaRes.data.data.length);
        }
      } catch { /* ignore */ }

      // 4. Events count
      try {
        const evs = await eventsService.getAllEvents();
        if (Array.isArray(evs)) setEventsCount(evs.length);
      } catch { /* ignore */ }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (showToast) toast.success('Dashboard refreshed');
    } catch (err) {
      console.warn('CMS Dashboard refresh error:', err);
      if (showToast) toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // ─── Derived Stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const published   = items.filter((i) => i.status === 'Published').length;
    const draft       = items.filter((i) => i.status === 'Draft').length;
    const scheduled   = items.filter((i) => i.status === 'Scheduled').length;
    const needsReview = items.filter((i) => i.status === 'Needs Review').length;
    const totalViews  = items.reduce((s, i) => s + (i.views || 0), 0);
    return { published, draft, scheduled, needsReview, totalViews, total: items.length };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchTab    = selectedTab === 'all' || item.status === selectedTab;
      const matchType   = typeFilter === 'all' || item.type === typeFilter;
      const q           = searchQuery.trim().toLowerCase();
      const matchSearch = !q
        || item.title.toLowerCase().includes(q)
        || (item.excerpt || '').toLowerCase().includes(q)
        || (item.author || '').toLowerCase().includes(q)
        || (item.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchTab && matchType && matchSearch;
    });
  }, [items, selectedTab, typeFilter, searchQuery]);

  // Only "Needs Review" items in the review queue (not drafts — those have separate lifecycle)
  const reviewQueue = useMemo(() => items.filter((c) => c.status === 'Needs Review'), [items]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const handleTogglePublish = (item: ContentCardItem) => {
    const next: ContentStatus = item.status === 'Published' ? 'Draft' : 'Published';
    contentService.updateItem(item.id, { status: next });
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: next } : x)));
    toast.success(next === 'Published' ? `"${item.title}" is now live` : `"${item.title}" moved to drafts`);
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    contentService.deleteItem(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast.success(`"${title}" deleted`);
  };

  const handleApprove = (item: ContentCardItem) => {
    contentService.updateItem(item.id, { status: 'Published' });
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: 'Published' } : x)));
    toast.success(`"${item.title}" approved & published`);
  };

  const handleReject = (item: ContentCardItem) => {
    contentService.updateItem(item.id, { status: 'Draft' });
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: 'Draft' } : x)));
    toast(`"${item.title}" returned to drafts`, { icon: '↩️' });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      const tagList = newTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      const created = contentService.addItem({
        title:       newTitle.trim(),
        type:        newType,
        status:      newStatus,
        excerpt:     newExcerpt.trim() || '',
        author:      'Content Manager',
        updatedAt:   'Just now',
        publishedAt: newStatus === 'Published' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
        tags:        tagList.length ? tagList : [newType, 'astu'],
        pinned:      false,
        featured:    false,
        language:    'EN',
      });
      setItems((prev) => [created, ...prev]);
      setNewTitle(''); setNewExcerpt(''); setNewTags(''); setCreateModalOpen(false);
      toast.success(`"${created.title}" created successfully`);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Compact Hero Section (Matching other admin/cms pages) ──────── */}
      <AdminPageHeader
        title="CMS Overview"
        subtitle="Manage ASTU public portal announcements, dynamic hero banners, and media assets."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
              title="View ASTU public homepage in new tab"
            >
              <Globe className="h-3.5 w-3.5 text-[#FFCC00]" />
              <span>View Homepage</span>
              <ArrowUpRight className="h-3 w-3 opacity-75" />
            </a>
            <button
              type="button"
              onClick={() => refreshAllData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh live data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#FFCC00]' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => { setNewTitle(''); setNewExcerpt(''); setNewTags(''); setNewStatus('Draft'); setCreateModalOpen(true); }}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#FFCC00] hover:bg-[#FFD633] text-[#003366] px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Content
            </button>
          </div>
        }
      />

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Published Content"
          value={loading ? '—' : stats.published}
          sub={`${stats.total} total items`}
          icon={<Newspaper className="h-4 w-4" />}
          iconBg="bg-emerald-50 text-emerald-600"
          onClick={() => { setSelectedTab('Published'); setTypeFilter('all'); }}
        />
        <KpiCard
          label="Pending Review"
          value={loading ? '—' : stats.needsReview}
          sub={stats.needsReview > 0 ? 'Needs action' : 'Queue clear'}
          subColor={stats.needsReview > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}
          icon={<ShieldCheck className="h-4 w-4" />}
          iconBg={stats.needsReview > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}
          onClick={() => { setSelectedTab('Needs Review'); setTypeFilter('all'); }}
        />
        <KpiCard
          label="Homepage Slides"
          value={loading ? '—' : heroSlidesCount}
          sub={`${partnersCount} active partners`}
          icon={<Layers3 className="h-4 w-4" />}
          iconBg="bg-blue-50 text-blue-600"
          onClick={() => navigate('/cms/homepage')}
        />
        <KpiCard
          label="Media Assets"
          value={loading ? '—' : mediaCount}
          sub="in /uploads/cms"
          icon={<GalleryHorizontal className="h-4 w-4" />}
          iconBg="bg-purple-50 text-purple-600"
          onClick={() => navigate('/cms/media')}
        />
      </div>

      {/* ── Main Grid: Content Table + Sidebar ─────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left: Content Repository Table (2/3 width) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">

          {/* Table Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Content Repository</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">All articles, announcements, and pages</p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search content…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-8 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#003366] dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Status tabs + type filter */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1 overflow-x-auto">
                {([
                  { key: 'all',          label: 'All',       count: stats.total },
                  { key: 'Published',    label: 'Published', count: stats.published },
                  { key: 'Draft',        label: 'Drafts',    count: stats.draft },
                  { key: 'Needs Review', label: 'Review',    count: stats.needsReview },
                  { key: 'Scheduled',    label: 'Scheduled', count: stats.scheduled },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key)}
                    className={`inline-flex items-center gap-1.5 shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedTab === tab.key
                        ? 'bg-[#003366] dark:bg-sky-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                    <span className={`rounded px-1 text-[10px] font-bold ${selectedTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 focus:border-[#003366] dark:focus:border-sky-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="announcement">Announcement</option>
                  <option value="post">News / Post</option>
                  <option value="page">Page</option>
                  <option value="event">Event</option>
                  <option value="gallery">Gallery</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#003366] dark:text-[#FFCC00] mb-3" />
                <p className="text-xs text-slate-400">Loading content items…</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No items found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters or create new content</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <ContentRow
                  key={item.id}
                  item={item}
                  onTogglePublish={handleTogglePublish}
                  onDelete={handleDelete}
                  onEdit={() => navigate('/cms/content')}
                />
              ))
            )}
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Showing {filteredItems.length} of {stats.total} items</span>
            <button
              onClick={() => navigate('/cms/content')}
              className="inline-flex items-center gap-1 font-semibold text-[#003366] dark:text-sky-400 hover:underline cursor-pointer"
            >
              Open Full Editor <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right: Sidebar (1/3 width) */}
        <div className="space-y-5">

          {/* Review Queue Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Queue</h3>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                reviewQueue.length > 0 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
              }`}>
                {reviewQueue.length} pending
              </span>
            </div>

            <div className="space-y-2.5">
              {reviewQueue.length === 0 ? (
                <div className="py-5 text-center">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All Clear</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">No items awaiting review.</p>
                </div>
              ) : (
                reviewQueue.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TYPE_BADGE[item.type] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.updatedAt}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{item.title}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleApprove(item)}
                        className="flex-1 rounded-md bg-emerald-600 hover:bg-emerald-700 px-2 py-1 text-[11px] font-semibold text-white transition-colors cursor-pointer"
                      >
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
              {reviewQueue.length > 4 && (
                <button
                  onClick={() => { setSelectedTab('Needs Review'); setTypeFilter('all'); }}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 py-1.5 text-center text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  +{reviewQueue.length - 4} more items
                </button>
              )}
            </div>
          </div>

          {/* Homepage Sections Status Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-[#003366] dark:text-[#FFCC00]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Homepage Sections</h3>
              </div>
              <button
                onClick={() => navigate('/cms/homepage')}
                className="text-[11px] font-semibold text-[#003366] dark:text-sky-400 hover:underline cursor-pointer"
              >
                Configure
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              {[
                { label: 'Hero Banners',       value: `${heroSlidesCount} active slides`,   dot: heroSlidesCount > 0 ? 'bg-emerald-500' : 'bg-slate-300' },
                { label: 'Announcements',      value: `${stats.published} published`,        dot: stats.published > 0 ? 'bg-emerald-500' : 'bg-slate-300' },
                { label: 'Corporate Partners', value: `${partnersCount} active`,             dot: partnersCount > 0  ? 'bg-emerald-500' : 'bg-slate-300' },
                { label: 'Media Assets',       value: `${mediaCount} files`,                 dot: mediaCount > 0     ? 'bg-emerald-500' : 'bg-slate-300' },
                { label: 'Campus Events',      value: `${eventsCount} scheduled`,            dot: eventsCount > 0    ? 'bg-blue-500'    : 'bg-slate-300' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${row.dot}`} />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{row.label}</span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 py-2 text-[11px] font-semibold text-[#003366] dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors cursor-pointer text-center"
              >
                <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                View Live Site
              </a>
              <button
                onClick={() => navigate('/cms/homepage')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Edit Homepage <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Nav Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Quick Navigation</h3>
            <div className="space-y-1.5">
              {[
                { label: 'Public Homepage',    path: '/',               icon: <Globe className="h-3.5 w-3.5 text-amber-500" />, external: true },
                { label: 'Content Manager',    path: '/cms/content',    icon: <FileText className="h-3.5 w-3.5 text-blue-500" /> },
                { label: 'Media Library',      path: '/cms/media',      icon: <GalleryHorizontal className="h-3.5 w-3.5 text-purple-500" /> },
                { label: 'Homepage Builder',   path: '/cms/homepage',   icon: <Layers3 className="h-3.5 w-3.5 text-indigo-500" /> },
                { label: 'Content Governance', path: '/cms/community', icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> },
              ].map((nav) => (
                nav.external ? (
                  <a
                    key={nav.path}
                    href={nav.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#003366] dark:hover:text-white transition-all cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span>{nav.icon}</span>
                      {nav.label}
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-[#003366] dark:group-hover:text-white transition-colors" />
                  </a>
                ) : (
                  <button
                    key={nav.path}
                    onClick={() => navigate(nav.path)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#003366] dark:hover:text-white transition-all cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span>{nav.icon}</span>
                      {nav.label}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-600 group-hover:text-[#003366] dark:group-hover:text-white transition-colors" />
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Create Content Modal ──────────────────────────────────────── */}
      <AdminModal
        open={createModalOpen}
        title="Create New Content Item"
        onClose={() => setCreateModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g., ASTU Tech Innovation Summit 2026"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#003366] focus:outline-none"
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as ContentType)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#003366] focus:outline-none cursor-pointer"
              >
                <option value="announcement">Announcement</option>
                <option value="post">News / Post</option>
                <option value="page">Page</option>
                <option value="event">Event</option>
                <option value="gallery">Gallery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ContentStatus)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#003366] focus:outline-none cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published (Live)</option>
                <option value="Needs Review">Needs Review</option>
              </select>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Excerpt <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Short summary displayed in public listings…"
              value={newExcerpt}
              onChange={(e) => setNewExcerpt(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#003366] focus:outline-none resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="alumni, campus, innovation"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#003366] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] dark:bg-sky-600 px-5 py-2 text-xs font-bold text-white hover:bg-[#002855] dark:hover:bg-sky-500 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {submitting ? 'Creating…' : 'Create Content'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label:      string;
  value:      string | number;
  sub?:       string;
  subColor?:  string;
  icon:       React.ReactNode;
  iconBg:     string;
  onClick?:   () => void;
}

function KpiCard({ label, value, sub, subColor = 'text-slate-500 dark:text-slate-400', icon, iconBg, onClick }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all group ${onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      {sub && <p className={`mt-0.5 text-[11px] ${subColor}`}>{sub}</p>}
    </div>
  );
}

interface ContentRowProps {
  item:            ContentCardItem;
  onTogglePublish: (item: ContentCardItem) => void;
  onDelete:        (id: string, title: string) => void;
  onEdit:          () => void;
}

function ContentRow({ item, onTogglePublish, onDelete, onEdit }: ContentRowProps) {
  const typeBadge   = TYPE_BADGE[item.type]   || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  const statusPill  = STATUS_PILL[item.status as PublishState] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
      {/* Info */}
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeBadge}`}>
            {item.type}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusPill}`}>
            {item.status}
          </span>
          {item.views !== undefined && item.views > 0 && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
              <Eye className="h-3 w-3" /> {item.views.toLocaleString()}
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.title}</h3>
        {item.excerpt && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-lg">{item.excerpt}</p>
        )}
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
          <span>{item.author || 'Content Manager'}</span>
          {(item.updatedAt || item.publishedAt) && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {item.updatedAt || item.publishedAt}
              </span>
            </>
          )}
          {item.tags && item.tags.length > 0 && (
            <>
              <span>·</span>
              <span>#{item.tags.slice(0, 2).join(', #')}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onTogglePublish(item)}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
            item.status === 'Published'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
          }`}
          title={item.status === 'Published' ? 'Move to Draft' : 'Publish Live'}
        >
          <Send className="h-3 w-3" />
          {item.status === 'Published' ? 'Unpublish' : 'Publish'}
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
          title="Edit in content manager"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(item.id, item.title)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-all cursor-pointer"
          title="Delete item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
