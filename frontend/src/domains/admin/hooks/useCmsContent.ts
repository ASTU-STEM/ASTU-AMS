/**
 * useCmsContent — Integration-ready hook for ContentList and CmsDashboard
 *
 * Wraps all content CRUD operations through cmsService stubs.
 * When the backend is ready, only cmsService.ts needs to change.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  ContentItem,
  ContentListParams,
  ContentStatus,
  CreateContentPayload,
  CmsDashboardStats,
  fetchContentList,
  fetchCmsDashboardStats,
  createContent,
  updateContent,
  deleteContent,
  publishContent,
  scheduleContent,
  uid,
} from '../services/cmsService';

// ─── Content List Hook ────────────────────────────────────────────────────────

export function useCmsContent(params?: ContentListParams) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchContentList(params);
      setItems(data);
    } catch (err) {
      setError('Failed to load content. Please try again.');
      console.error('[useCmsContent] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const create = useCallback(async (payload: CreateContentPayload) => {
    try {
      const newItem = await createContent(payload);
      setItems(prev => [newItem, ...prev]);
      toast.success(`"${newItem.title}" created`);
      return newItem;
    } catch {
      toast.error('Failed to create content');
    }
  }, []);

  const update = useCallback(async (id: string, partial: Partial<ContentItem>) => {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...partial, updatedAt: 'Just now' } : i));
    try {
      await updateContent(id, partial);
    } catch {
      toast.error('Failed to update content');
      load(); // revert on failure
    }
  }, [load]);

  const remove = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    // Optimistic remove
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await deleteContent(id);
      toast.success(`"${item?.title || 'Item'}" deleted`);
    } catch {
      toast.error('Failed to delete content');
      load(); // revert on failure
    }
  }, [items, load]);

  const publish = useCallback(async (id: string) => {
    await update(id, { status: 'Published' });
    try {
      await publishContent(id);
      toast.success('Item published');
    } catch {
      toast.error('Failed to publish');
    }
  }, [update]);

  const schedule = useCallback(async (id: string, date: string, time: string) => {
    const formattedDate = new Date(`${date}T${time}`).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
    await update(id, { status: 'Scheduled', scheduledFor: formattedDate });
    try {
      await scheduleContent(id, date, time);
    } catch {
      toast.error('Failed to schedule');
    }
  }, [update]);

  const bulkUpdate = useCallback(async (ids: string[], status: ContentStatus) => {
    setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, status, updatedAt: 'Just now' } : i));
    toast.success(`${ids.length} item(s) set to ${status}`);
    // TODO: Replace with: await adminApi.bulkUpdateContent(ids, { status }) → POST /api/cms/content/bulk
  }, []);

  const bulkDelete = useCallback(async (ids: string[]) => {
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    toast.success(`${ids.length} item(s) deleted`);
    // TODO: Replace with: await adminApi.bulkDeleteContent(ids) → DELETE /api/cms/content/bulk
  }, []);

  return {
    items,
    isLoading,
    error,
    refetch: load,
    create,
    update,
    remove,
    publish,
    schedule,
    bulkUpdate,
    bulkDelete,
  };
}

// ─── Dashboard Stats Hook ──────────────────────────────────────────────────────

export function useCmsDashboard() {
  const [stats, setStats] = useState<CmsDashboardStats | null>(null);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCmsDashboardStats();
      setStats(data.stats);
      setRecentContent(data.recentContent);
    } catch (err) {
      setError('Failed to load dashboard stats.');
      console.error('[useCmsDashboard] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateRecentItem = useCallback((id: string, partial: Partial<ContentItem>) => {
    setRecentContent(prev => prev.map(i => i.id === id ? { ...i, ...partial, updatedAt: 'Just now' } : i));
  }, []);

  return { stats, recentContent, isLoading, error, refetch: load, updateRecentItem };
}
