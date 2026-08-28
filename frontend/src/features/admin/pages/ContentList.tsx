import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Archive,
  Calendar,
  ChevronDown,
  Copy,
  Download,
  Eye,
  Filter,
  Grid3x3,
  LayoutList,
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

  useEffect(() => {
    const handleSync = () => setItems(contentService.getItems());
    window.addEventListener('astu-cms-content-changed', handleSync);
    return () => window.removeEventListener('astu-cms-content-changed', handleSync);
  }, []);

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
      <div className="cms-fade flex flex-col gap-3 rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, excerpt, or tag..."
              className="w-full rounded-[8px] border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((open) => !open)}
            className={`inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-2 text-xs font-semibold transition-all ${
              showFilters ? 'border-[#003580] bg-[#003580]/5 text-[#003580]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`inline-flex h-8 w-8 items-center justify-center rounded ${view === 'grid' ? 'bg-[#003580] text-white' : 'text-slate-500 hover:text-slate-700'}`}
              title="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`inline-flex h-8 w-8 items-center justify-center rounded ${view === 'list' ? 'bg-[#003580] text-white' : 'text-slate-500 hover:text-slate-700'}`}
              title="List view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setTypeFilter(type.key)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  typeFilter === type.key
                    ? 'border-[#003580] bg-[#003580] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#003580]/40'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusTab(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                statusTab === tab.key
                  ? 'bg-[#003580] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  statusTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
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
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
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
                onPublish={() => {
                  updateItem(item.id, { status: 'Published' });
                  toast.success(`"${item.title}" published live!`);
                }}
                onSchedule={() => openScheduleFor(item.id)}
                onDelete={() => {
                  contentService.deleteItem(item.id);
                  setItems(contentService.getItems());
                  toast.success(`"${item.title}" deleted`);
                }}
                onTogglePin={() => {
                  updateItem(item.id, { pinned: !item.pinned });
                  toast.success(item.pinned ? 'Item unpinned' : 'Item pinned');
                }}
                onToggleFeature={() => {
                  updateItem(item.id, { featured: !item.featured });
                  toast.success(item.featured ? 'Featured removed' : 'Marked as featured');
                }}
                onMore={() => {
                  const url = `${window.location.origin}/announcements/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url);
                    toast.success(`Copied announcement link for "${item.title}"!`);
                  } else {
                    setEditItem(item);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2 font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={selectAllVisible}
                      className="h-4 w-4 rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                    />
                  </th>
                  <th className="px-3 py-2 font-semibold">Title</th>
                  <th className="px-3 py-2 font-semibold">Type</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Author</th>
                  <th className="px-3 py-2 font-semibold">Updated</th>
                  <th className="px-3 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelected(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="mt-0.5 text-[10px] text-slate-500">{item.excerpt?.slice(0, 80)}</div>
                    </td>
                    <td className="px-3 py-2 text-xs uppercase text-slate-500">{item.type}</td>
                    <td className="px-3 py-2 text-xs">{item.status}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{item.author}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{item.updatedAt}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditItem(item)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openScheduleFor(item.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                          title="Schedule"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            contentService.deleteItem(item.id);
                            setItems(contentService.getItems());
                            toast.success(`"${item.title}" deleted`);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-500">No content matches your filters.</div>
            )}
          </div>
        )}

        {filtered.length === 0 && view === 'grid' && (
          <div className="rounded-[10px] border border-dashed border-slate-300 bg-white p-10 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No content found</p>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or create new content to get started.</p>
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
              className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleCreateContent('Draft')}
              className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Content Type</span>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ContentType)}
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
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
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Title</span>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
              placeholder="e.g. ASTU Hosts International Engineering Summit"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Excerpt / Description</span>
            <textarea
              value={newExcerpt}
              onChange={(e) => setNewExcerpt(e.target.value)}
              rows={3}
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
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
              className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
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
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {previewItem.type}
              </span>
              <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {previewItem.status}
              </span>
              {previewItem.tags?.map((tag) => (
                <span key={tag} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#003580]">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-700">{previewItem.excerpt}</p>
            <div className="rounded-[8px] border border-dashed border-slate-300 bg-slate-50/60 p-4 text-center text-xs text-slate-500">
              Live preview renders the content layout on the public site. Headings, images, and links will appear here.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[8px] border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Author</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{previewItem.author}</p>
              </div>
              <div className="rounded-[8px] border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Views</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{previewItem.views?.toLocaleString() ?? 0}</p>
              </div>
              <div className="rounded-[8px] border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Published</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{previewItem.publishedAt ?? '—'}</p>
              </div>
              <div className="rounded-[8px] border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Scheduled</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{previewItem.scheduledFor ?? '—'}</p>
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
              className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
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
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Title</span>
              <input
                type="text"
                value={editItem.title}
                onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Content Type</span>
                <select
                  value={editItem.type}
                  onChange={(e) => setEditItem({ ...editItem, type: e.target.value as ContentType })}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
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
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</span>
                <select
                  value={editItem.status}
                  onChange={(e) => setEditItem({ ...editItem, status: e.target.value as ContentStatus })}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
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
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Excerpt / Content Summary</span>
              <textarea
                value={editItem.excerpt || ''}
                onChange={(e) => setEditItem({ ...editItem, excerpt: e.target.value })}
                rows={3}
                className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
              />
            </label>

            <div className="flex items-center gap-4 pt-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editItem.pinned}
                  onChange={(e) => setEditItem({ ...editItem, pinned: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                />
                Pinned Notice
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editItem.featured}
                  onChange={(e) => setEditItem({ ...editItem, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                />
                Featured Card
              </label>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
