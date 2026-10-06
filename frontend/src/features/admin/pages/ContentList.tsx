import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Archive,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Grid3x3,
  LayoutList,
  MoreHorizontal,
  Pin,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import ContentCard, { ContentCardItem, ContentStatus, ContentType } from '../components/ContentCard';
import ScheduleDialog, { ScheduleValue } from '../components/ScheduleDialog';
import AdminModal from '../components/AdminModal';
import ImageUploader from '../components/ImageUploader';
import contentService from '../services/content.service';

const STATUS_TABS: Array<{ key: 'all' | ContentStatus; label: string }> = [
  { key: 'all', label: 'All Content' },
  { key: 'Published', label: 'Published' },
  { key: 'Scheduled', label: 'Scheduled' },
  { key: 'Draft', label: 'Drafts' },
  { key: 'Needs Review', label: 'Needs Review' },
  { key: 'Archived', label: 'Archived' },
];

const TYPE_FILTERS: Array<{ key: 'all' | ContentType; label: string }> = [
  { key: 'all', label: 'All Types' },
  { key: 'page', label: 'Pages' },
  { key: 'post', label: 'Posts' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'gallery', label: 'Galleries' },
  { key: 'event', label: 'Events' },
  { key: 'template', label: 'Templates' },
];

export default function ContentList() {
  const [items, setItems] = useState<ContentCardItem[]>(() => contentService.getItems());
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [statusTab, setStatusTab] = useState<'all' | ContentStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ContentType>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ContentType>('post');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [previewItem, setPreviewItem] = useState<ContentCardItem | null>(null);
  const [editItem, setEditItem] = useState<ContentCardItem | null>(null);
  const [moreModalItem, setMoreModalItem] = useState<ContentCardItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    contentService.fetchItemsFromApi().then((apiItems) => {
      if (isMounted && Array.isArray(apiItems) && apiItems.length) {
        setItems(apiItems);
      }
    });
    const handleSync = () => setItems(contentService.getItems());
    window.addEventListener('astu-cms-content-changed', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-content-changed', handleSync);
    };
  }, []);

  const handleDuplicate = (item: ContentCardItem) => {
    const duplicated = contentService.addItem({
      ...item,
      title: `${item.title} (Copy)`,
      status: 'Draft',
      publishedAt: undefined,
      scheduledFor: undefined,
      scheduledIso: undefined,
      updatedAt: 'Just now',
    });
    setItems(contentService.getItems());
    toast.success(`Duplicated "${item.title}" as Draft!`);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `astu-cms-content-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Exported ${filtered.length} content item(s) as JSON!`);
  };

  const handleCreateContent = (status: ContentStatus = 'Published') => {
    if (!newTitle.trim()) { toast.error('Title is required'); return; }
    const created = contentService.addItem({
      title: newTitle.trim(),
      type: newType,
      status,
      excerpt: newExcerpt.trim() || `${newType.toUpperCase()}: ${newTitle.trim()}`,
      author: 'Content Manager',
      updatedAt: 'Just now',
      publishedAt: status === 'Published' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
      tags: [newType, 'astu', 'cms'],
      pinned: false,
      featured: true,
      language: 'EN',
    });
    setStatusTab('all');
    setTypeFilter('all');
    setItems(contentService.getItems());
    setNewTitle('');
    setNewExcerpt('');
    setCreateOpen(false);
    toast.success(`Content "${created.title}" published & added live!`);
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    contentService.updateItem(editItem.id, editItem);
    setItems(contentService.getItems());
    toast.success(`Changes to "${editItem.title}" saved!`);
    setEditItem(null);
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusTab !== 'all' && item.status !== statusTab) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (search) {
        const needle = search.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(needle) ||
          item.excerpt?.toLowerCase().includes(needle) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(needle));
        if (!matches) return false;
      }
      return true;
    });
  }, [items, statusTab, typeFilter, search]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: items.length };
    for (const tab of STATUS_TABS) {
      if (tab.key === 'all') continue;
      result[tab.key] = items.filter((item) => item.status === tab.key).length;
    }
    return result;
  }, [items]);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
    );
  };

  const selectAllVisible = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((item) => item.id));
    }
  };

  const updateItem = useCallback((id: string, partial: Partial<ContentCardItem>) => {
    contentService.updateItem(id, partial);
    setItems(contentService.getItems());
  }, []);

  const bulkUpdate = useCallback((status: ContentStatus) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => contentService.updateItem(id, { status }));
    setItems(contentService.getItems());
    toast.success(`${selectedIds.length} item(s) set to ${status}`);
    setSelectedIds([]);
  }, [selectedIds]);

  const bulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    // The single-item delete confirms; this did not, so one click could remove
    // every selected item.
    if (!window.confirm(`Permanently delete ${selectedIds.length} content item(s)? This cannot be undone.`)) {
      return;
    }
    selectedIds.forEach(id => contentService.deleteItem(id));
    setItems(contentService.getItems());
    toast.success(`${selectedIds.length} item(s) deleted`);
    setSelectedIds([]);
  }, [selectedIds]);

  const handleScheduleSubmit = (value: ScheduleValue) => {
    const scheduledDateObj = new Date(`${value.date}T${value.time}:00`);
    const formattedDate = scheduledDateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    if (scheduleTarget) {
      updateItem(scheduleTarget, {
        status: 'Scheduled',
        scheduledFor: formattedDate,
        scheduledIso: scheduledDateObj.toISOString(),
      });
      toast.success(`Content scheduled to publish live on ${formattedDate}`);
    }
    setScheduleOpen(false);
    setScheduleTarget(null);
  };

  const openScheduleFor = (id: string) => {
    setScheduleTarget(id);
    setScheduleOpen(true);
  };

  const scheduleForBulk = () => {
    setScheduleTarget(null);
    setScheduleOpen(true);
  };

  const submitBulkSchedule = (value: ScheduleValue) => {
    if (selectedIds.length === 0) return;
    const scheduledDateObj = new Date(`${value.date}T${value.time}:00`);
    const formattedDate = scheduledDateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    selectedIds.forEach((id) => {
      contentService.updateItem(id, {
        status: 'Scheduled',
        scheduledFor: formattedDate,
        scheduledIso: scheduledDateObj.toISOString(),
      });
    });
    setItems(contentService.getItems());
    toast.success(`${selectedIds.length} item(s) scheduled to publish live on ${formattedDate}`);
    setSelectedIds([]);
    setScheduleOpen(false);
  };

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes cms-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .cms-fade { animation: cms-fade-in 0.3s ease-out both; }
        .cms-fade:nth-child(2) { animation-delay: 0.04s; }
        .cms-fade:nth-child(3) { animation-delay: 0.08s; }
        .cms-fade:nth-child(4) { animation-delay: 0.12s; }
      `}</style>

      <AdminPageHeader
        title="All Content"
        subtitle="Single source of truth for every page, post, announcement, gallery, and event. Filter, schedule, publish, and moderate in one place."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Content' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="info">{filtered.length} of {items.length} items</AdminBadge>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              New Content
            </button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="cms-fade flex flex-col gap-3 rounded-[12px] border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, excerpt, or tag..."
              className="w-full rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 py-2 pl-8 pr-3 text-sm text-[var(--text-primary)] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#003580] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#003580]/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((open) => !open)}
            className={`inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              showFilters ? 'border-[#003580] bg-[#003580]/5 text-[#003580] dark:border-sky-500 dark:bg-sky-950/30 dark:text-sky-300' : 'border-[var(--border-color)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--text-secondary)] dark:text-slate-300 hover:bg-[var(--bg-page)] dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusTab('all');
              setTypeFilter('all');
              setSelectedIds([]);
            }}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300 hover:bg-[var(--bg-page)] dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300 hover:bg-[var(--bg-page)] dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Export all visible content as JSON"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <div className="inline-flex rounded-md border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`inline-flex h-8 w-8 items-center justify-center rounded cursor-pointer ${view === 'grid' ? 'bg-[#003580] text-white' : 'text-[var(--text-muted)] dark:text-slate-400 hover:text-[var(--text-secondary)] dark:hover:text-white'}`}
              title="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`inline-flex h-8 w-8 items-center justify-center rounded ${view === 'list' ? 'bg-[#003580] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              title="List view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-color)] pt-3">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setTypeFilter(type.key)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  typeFilter === type.key
                    ? 'border-[#003580] bg-[#003580] text-white'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[#003580]/40'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-color)] pt-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusTab(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                statusTab === tab.key
                  ? 'bg-[#003580] text-white shadow-sm'
                  : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  statusTab === tab.key ? 'bg-white/20 text-white' : 'bg-[var(--bg-page)] text-[var(--text-muted)]'
                }`}
              >
                {counts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="cms-fade sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#003580]/30 bg-gradient-to-r from-[#003580]/10 to-[#003580]/5 px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#003580]">
            <span>{selectedIds.length} selected</span>
            <button
              type="button"
              onClick={selectAllVisible}
              className="text-xs font-medium text-[#003580] hover:underline"
            >
              {selectedIds.length === filtered.length ? 'Clear all' : 'Select all visible'}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => bulkUpdate('Published')}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600"
            >
              <Send className="h-3 w-3" /> Publish
            </button>
            <button
              type="button"
              onClick={scheduleForBulk}
              className="inline-flex items-center gap-1 rounded-md bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-600"
            >
              <Calendar className="h-3 w-3" /> Schedule
            </button>
            <button
              type="button"
              onClick={() => bulkUpdate('Archived')}
              className="inline-flex items-center gap-1 rounded-md bg-slate-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700"
            >
              <Archive className="h-3 w-3" /> Archive
            </button>
            <button
              type="button"
              onClick={bulkDelete}
              className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-600"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-page)]"
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="cms-fade">
        {view === 'grid' ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                selected={selectedIds.includes(item.id)}
                onSelect={toggleSelected}
                onPreview={() => setPreviewItem(item)}
                onEdit={() => setEditItem(item)}
                onDuplicate={() => handleDuplicate(item)}
                onPublish={() => {
                  updateItem(item.id, { status: 'Published' });
                  toast.success(`"${item.title}" published live!`);
                }}
                onSchedule={() => openScheduleFor(item.id)}
                onDelete={() => {
                  if (window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
                    contentService.deleteItem(item.id);
                    setItems(contentService.getItems());
                    toast.success(`"${item.title}" deleted`);
                  }
                }}
                onTogglePin={() => {
                  updateItem(item.id, { pinned: !item.pinned });
                  toast.success(item.pinned ? 'Item unpinned' : 'Item pinned');
                }}
                onToggleFeature={() => {
                  updateItem(item.id, { featured: !item.featured });
                  toast.success(item.featured ? 'Featured removed' : 'Marked as featured');
                }}
                onMore={() => setMoreModalItem(item)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 shadow-xs">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--bg-page)] dark:bg-slate-800/60 border-b border-[var(--border-color)] dark:border-slate-800">
                <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400">
                  <th className="px-3 py-2.5 font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={selectAllVisible}
                      className="h-4 w-4 rounded border-[var(--border-color)] dark:border-slate-700 text-[#003580] focus:ring-[#003580]"
                    />
                  </th>
                  <th className="px-3 py-2.5 font-semibold">Title</th>
                  <th className="px-3 py-2.5 font-semibold">Type</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Author</th>
                  <th className="px-3 py-2.5 font-semibold">Updated</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-page)] dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelected(item.id)}
                        className="h-4 w-4 rounded border-[var(--border-color)] dark:border-slate-700 text-[#003580] focus:ring-[#003580]"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {item.pinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                        <span className="font-semibold text-[var(--text-primary)] dark:text-white line-clamp-1">{item.title}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--text-muted)] dark:text-slate-400 line-clamp-1">{item.excerpt?.slice(0, 90)}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold uppercase text-[var(--text-muted)] dark:text-slate-400">{item.type}</td>
                    <td className="px-3 py-2.5 text-xs">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.status === 'Published' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' :
                        item.status === 'Draft' ? 'bg-[var(--bg-page)] dark:bg-slate-800 text-[var(--text-secondary)] dark:text-slate-300' :
                        item.status === 'Scheduled' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' :
                        item.status === 'Needs Review' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-[var(--bg-page)] dark:bg-slate-800 text-[var(--text-muted)] dark:text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-muted)] dark:text-slate-400">{item.author || 'Content Manager'}</td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-muted)] dark:text-slate-400">{item.updatedAt || 'Recently'}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 text-[var(--text-muted)] dark:text-slate-300 hover:bg-[var(--bg-page)] dark:hover:bg-slate-700 cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditItem(item)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 text-[var(--text-muted)] dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(item)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 text-[var(--text-muted)] dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                          title="Duplicate / Copy"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateItem(item.id, { pinned: !item.pinned });
                            toast.success(item.pinned ? 'Unpinned' : 'Pinned');
                          }}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border cursor-pointer ${item.pinned ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300' : 'border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 text-[var(--text-muted)] dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'}`}
                          title={item.pinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openScheduleFor(item.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 text-[var(--text-muted)] dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          title="Schedule"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
                              contentService.deleteItem(item.id);
                              setItems(contentService.getItems());
                              toast.success(`"${item.title}" deleted`);
                            }
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMoreModalItem(item)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 text-[var(--text-muted)] dark:text-slate-300 hover:bg-[var(--bg-page)] dark:hover:bg-slate-700 cursor-pointer"
                          title="More Options"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-[var(--text-muted)] dark:text-slate-400">No content matches your filters.</div>
            )}
          </div>
        )}

        {filtered.length === 0 && view === 'grid' && (
          <div className="rounded-[10px] border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] p-10 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)]">No content found</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Try adjusting your filters or create new content to get started.</p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Content
            </button>
          </div>
        )}
      </div>

      <ScheduleDialog
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          setScheduleTarget(null);
        }}
        onConfirm={(value) => (scheduleTarget ? handleScheduleSubmit(value) : submitBulkSchedule(value))}
      />

      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Content"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleCreateContent('Draft')}
              className="rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleCreateContent('Published')}
              className="rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
            >
              Publish Now
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Content Type</span>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ContentType)}
              className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580]"
            >
              <option value="post">Post (Article / News)</option>
              <option value="announcement">Announcement</option>
              <option value="page">Page</option>
              <option value="gallery">Gallery</option>
              <option value="event">Event</option>
              <option value="template">Template</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Title</span>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580]"
              placeholder="e.g. ASTU Hosts International Engineering Summit"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Excerpt / Description</span>
            <textarea
              value={newExcerpt}
              onChange={(e) => setNewExcerpt(e.target.value)}
              rows={3}
              className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580]"
              placeholder="Brief summary or description..."
            />
          </label>
        </div>
      </AdminModal>

      <AdminModal
        open={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.title ?? ''}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                if (previewItem) {
                  updateItem(previewItem.id, { status: 'Published' });
                  toast.success('Published');
                }
                setPreviewItem(null);
              }}
              className="rounded-[8px] bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Publish Now
            </button>
          </div>
        }
      >
        {previewItem && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[var(--bg-page)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {previewItem.type}
              </span>
              <span className="rounded-md border border-[var(--border-color)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                {previewItem.status}
              </span>
              {previewItem.tags?.map((tag) => (
                <span key={tag} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#003580]">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{previewItem.excerpt}</p>
            <div className="rounded-[8px] border border-dashed border-[var(--border-color)] bg-[var(--bg-page)] p-4 text-center text-xs text-[var(--text-muted)]">
              Live preview renders the content layout on the public site. Headings, images, and links will appear here.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[8px] border border-[var(--border-color)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Author</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{previewItem.author}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--border-color)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Views</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{previewItem.views?.toLocaleString() ?? 0}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--border-color)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Published</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{previewItem.publishedAt ?? '—'}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--border-color)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Scheduled</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{previewItem.scheduledFor ?? '—'}</p>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Edit Content Modal */}
      <AdminModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title={editItem ? `Edit Content: ${editItem.title}` : ''}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditItem(null)}
              className="rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
            >
              Save Changes
            </button>
          </div>
        }
      >
        {editItem && (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Title</span>
              <input
                type="text"
                value={editItem.title}
                onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Content Type</span>
                <select
                  value={editItem.type}
                  onChange={(e) => setEditItem({ ...editItem, type: e.target.value as ContentType })}
                  className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580]"
                >
                  <option value="post">Post (Article / News)</option>
                  <option value="announcement">Announcement</option>
                  <option value="page">Page</option>
                  <option value="gallery">Gallery</option>
                  <option value="event">Event</option>
                  <option value="template">Template</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</span>
                <select
                  value={editItem.status}
                  onChange={(e) => setEditItem({ ...editItem, status: e.target.value as ContentStatus })}
                  className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580]"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>
            </div>

            <ImageUploader
              label="Upload Article Cover Image / Media File"
              value={editItem.image}
              onChange={(url) => setEditItem({ ...editItem, image: url })}
            />

            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Excerpt / Content Summary</span>
              <textarea
                value={editItem.excerpt || ''}
                onChange={(e) => setEditItem({ ...editItem, excerpt: e.target.value })}
                rows={3}
                className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580]"
              />
            </label>

            <div className="flex items-center gap-4 pt-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editItem.pinned}
                  onChange={(e) => setEditItem({ ...editItem, pinned: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border-color)] text-[#003580]"
                />
                Pinned Notice
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editItem.featured}
                  onChange={(e) => setEditItem({ ...editItem, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border-color)] text-[#003580]"
                />
                Featured Card
              </label>
            </div>
          </div>
        )}
      </AdminModal>

      {/* More Options Modal */}
      <AdminModal
        open={!!moreModalItem}
        onClose={() => setMoreModalItem(null)}
        title={moreModalItem ? `Options: ${moreModalItem.title}` : 'Options'}
        size="sm"
      >
        {moreModalItem && (
          <div className="space-y-3 py-1">
            <div className="p-3 bg-[var(--bg-page)] rounded-xl border border-[var(--border-color)]">
              <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{moreModalItem.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{moreModalItem.type}</span>
                <span className="text-[10px] text-[var(--text-muted)]">·</span>
                <span className="text-[10px] font-semibold text-emerald-600">{moreModalItem.status}</span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleDuplicate(moreModalItem);
                  setMoreModalItem(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4 text-indigo-600" /> Duplicate as New Draft
              </button>

              <button
                type="button"
                onClick={() => {
                  const slug = moreModalItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const url = `${window.location.origin}/announcements/${slug}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Public URL copied to clipboard!');
                  setMoreModalItem(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-blue-600" /> Copy Public Portal URL
              </button>

              <button
                type="button"
                onClick={() => {
                  updateItem(moreModalItem.id, { pinned: !moreModalItem.pinned });
                  toast.success(moreModalItem.pinned ? 'Item unpinned' : 'Item pinned to top');
                  setMoreModalItem(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-lg transition-colors"
              >
                <Pin className="h-4 w-4 text-amber-600" /> {moreModalItem.pinned ? 'Unpin from Top' : 'Pin Notice to Top'}
              </button>

              <button
                type="button"
                onClick={() => {
                  updateItem(moreModalItem.id, { featured: !moreModalItem.featured });
                  toast.success(moreModalItem.featured ? 'Removed from featured' : 'Marked as Featured Story');
                  setMoreModalItem(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-lg transition-colors"
              >
                <Sparkles className="h-4 w-4 text-purple-600" /> {moreModalItem.featured ? 'Remove from Featured' : 'Mark as Featured Card'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditItem(moreModalItem);
                  setMoreModalItem(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4 text-[var(--text-secondary)]" /> Edit Full Details...
              </button>

              <div className="pt-2 border-t border-[var(--border-color)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-1">Quick Status Change</p>
                <div className="grid grid-cols-2 gap-1 px-1">
                  {(['Published', 'Draft', 'Needs Review', 'Archived'] as ContentStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        updateItem(moreModalItem.id, { status: st });
                        toast.success(`Status set to ${st}`);
                        setMoreModalItem(null);
                      }}
                      className={`text-left px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                        moreModalItem.status === st ? 'bg-[#003580] text-white' : 'hover:bg-[var(--bg-page)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Permanently delete "${moreModalItem.title}"?`)) {
                      contentService.deleteItem(moreModalItem.id);
                      setItems(contentService.getItems());
                      toast.success(`"${moreModalItem.title}" deleted`);
                      setMoreModalItem(null);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-rose-600" /> Delete Content
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
