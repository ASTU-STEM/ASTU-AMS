/**
 * useCmsSection — Generic integration-ready hook for simple CMS pages
 *
 * Usage:
 *   const { data, isLoading, error, refetch, mutate } = useCmsSection(fetchFaqList);
 *
 * When the backend is ready, only the service function in cmsService.ts changes.
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseCmsSectionOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useCmsSection<T>(
  fetchFn: () => Promise<T>,
  options: UseCmsSectionOptions = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(options.errorMessage ?? 'Failed to load data. Please try again.');
      console.error('[useCmsSection] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  /**
   * mutate — runs a mutation function and updates local state
   * Pass either:
   *   - A function that returns the new T (for full replacement)
   *   - A function T => T (for functional updates)
   */
  const mutate = useCallback(async (
    mutateFn: () => Promise<T | void>,
    localUpdate?: (prev: T) => T,
    options_?: { successMessage?: string; errorMessage?: string },
  ) => {
    if (localUpdate && data !== null) {
      setData(localUpdate(data));
    }
    try {
      setIsMutating(true);
      const result = await mutateFn();
      if (result !== undefined) {
        setData(result as T);
      }
      if (options_?.successMessage) {
        toast.success(options_.successMessage);
      }
    } catch (err) {
      toast.error(options_?.errorMessage ?? 'Operation failed. Please try again.');
      console.error('[useCmsSection] mutate error:', err);
      // Reload to revert optimistic update
      load();
    } finally {
      setIsMutating(false);
    }
  }, [data, load]);

  return {
    data,
    setData,
    isLoading,
    error,
    isMutating,
    refetch: load,
    mutate,
  };
}

/**
 * useCmsListSection — Generic hook specifically for list-based CMS pages
 * Provides add/update/remove helpers on top of useCmsSection
 */
export function useCmsListSection<T extends { id: string }>(
  fetchFn: () => Promise<T[]>,
  serviceFns?: {
    createFn?: (payload: Partial<T>) => Promise<T>;
    updateFn?: (id: string, partial: Partial<T>) => Promise<T>;
    deleteFn?: (id: string) => Promise<void>;
  },
) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFn();
      setItems(result);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('[useCmsListSection] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (payload: Partial<T>) => {
    if (!serviceFns?.createFn) return;
    try {
      setIsMutating(true);
      const newItem = await serviceFns.createFn(payload);
      setItems(prev => [newItem, ...prev]);
      toast.success('Item created');
      return newItem;
    } catch {
      toast.error('Failed to create item');
    } finally {
      setIsMutating(false);
    }
  }, [serviceFns]);

  const update = useCallback(async (id: string, partial: Partial<T>) => {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...partial } : i));
    if (!serviceFns?.updateFn) return;
    try {
      await serviceFns.updateFn(id, partial);
    } catch {
      toast.error('Failed to update item');
      load(); // revert
    }
  }, [serviceFns, load]);

  const remove = useCallback(async (id: string, label?: string) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    if (!serviceFns?.deleteFn) {
      toast.success(`${label || 'Item'} removed`);
      return;
    }
    try {
      await serviceFns.deleteFn(id);
      toast.success(`${label || 'Item'} deleted`);
    } catch {
      toast.error('Failed to delete item');
      load(); // revert
    }
  }, [items, serviceFns, load]);

  return {
    items,
    setItems,
    isLoading,
    error,
    isMutating,
    refetch: load,
    add,
    update,
    remove,
  };
}
