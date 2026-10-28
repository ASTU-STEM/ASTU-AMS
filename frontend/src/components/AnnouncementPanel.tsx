import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  X,
  CalendarDays,
  Search,
  CheckCheck,
  Pin,
  ShieldAlert,
  ShieldCheck,
  Megaphone,
  Newspaper,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Eye,
  Clock,
  BookOpen,
  Filter,
  Check,
} from 'lucide-react';
import contentService from '../features/admin/services/content.service';
import toast from 'react-hot-toast';

interface AnnouncementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProcessedAnnouncement {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  type: string;
  category: 'official' | 'news' | 'academic' | 'general';
  excerpt: string;
  content?: string;
  author: string;
  pinned: boolean;
  priority: 'high' | 'medium' | 'low';
  readTime: string;
  slug: string;
}

const READ_STORAGE_KEY = 'astu_ams_read_announcements';

function formatNoticeDate(value?: string): string {
  if (!value) return 'Recent Notice';
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function slugifyTitle(title: string): string {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AnnouncementPanel({ isOpen, onClose }: AnnouncementPanelProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'official' | 'news' | 'unread'>('all');

  // Quick Preview Modal state
  const [previewNotice, setPreviewNotice] = useState<ProcessedAnnouncement | null>(null);

  // Read Announcements state
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(READ_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Entrance animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setRefreshKey((k) => k + 1);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setSearchQuery('');
        setPreviewNotice(null);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Sync content updates
  useEffect(() => {
    const sync = () => setRefreshKey((k) => k + 1);
    window.addEventListener('astu-cms-content-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('astu-cms-content-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (previewNotice) {
          setPreviewNotice(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewNotice, onClose]);

  // Process and Deduplicate Announcements
  const announcements = useMemo<ProcessedAnnouncement[]>(() => {
    void refreshKey;
    let rawItems: any[] = [];
    try {
      if (contentService && typeof contentService.getPublishedAnnouncements === 'function') {
        rawItems = contentService.getPublishedAnnouncements();
      }
      if (!rawItems || rawItems.length === 0) {
        rawItems = contentService.getItems?.() || [];
      }
    } catch {
      rawItems = [];
    }

    const seenTitles = new Set<string>();
    const list: ProcessedAnnouncement[] = [];

    for (const item of rawItems) {
      const cleanTitle = (item.title || '').trim();
      const normTitle = cleanTitle.toLowerCase();
      if (!normTitle || seenTitles.has(normTitle)) continue;
      seenTitles.add(normTitle);

      const isOfficial =
        item.type === 'announcement' ||
        /official|notice|directive|safety|registrar|policy/i.test(
          String(item.type || '') + ' ' + String(item.category || '') + ' ' + cleanTitle
        );

      const isAcademic = /academic|grant|research|summit|engineering|workshop/i.test(
        cleanTitle + ' ' + String(item.tags?.join(' ') || '')
      );

      const category: ProcessedAnnouncement['category'] = isOfficial
        ? 'official'
        : isAcademic
        ? 'academic'
        : 'news';

      const wordsCount = ((item.content || item.excerpt || '') + '').split(/\s+/).length;
      const readMinutes = Math.max(1, Math.ceil(wordsCount / 160));

      list.push({
        id: String(item.id || slugifyTitle(cleanTitle)),
        title: cleanTitle,
        date: formatNoticeDate(item.publishedAt || item.date || item.updatedAt),
        rawDate: item.publishedAt || item.date || item.updatedAt || '',
        type: isOfficial ? 'Official Notice' : 'News & Bulletin',
        category,
        excerpt:
          item.excerpt ||
          (item.content ? item.content.slice(0, 140) + '...' : 'Official university announcement from ASTU administration.'),
        content: item.content,
        author: item.author || 'ASTU Directorate Notice',
        pinned: Boolean(item.pinned),
        priority: item.featured || item.priority === 'high' ? 'high' : item.priority || 'medium',
        readTime: `${readMinutes} min read`,
        slug: item.slug || slugifyTitle(cleanTitle),
      });
    }

    // Sort: Pinned first, then newer
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const timeA = Date.parse(a.rawDate) || 0;
      const timeB = Date.parse(b.rawDate) || 0;
      return timeB - timeA;
    });

    return list;
  }, [refreshKey]);

  // Mark announcement as read
  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(next)));
        window.dispatchEvent(new Event('astu-announcements-read-updated'));
      } catch {}
      return next;
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const allIds = new Set(announcements.map((a) => a.id));
    setReadIds(allIds);
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(allIds)));
      window.dispatchEvent(new Event('astu-announcements-read-updated'));
      toast.success('All announcements marked as read', { icon: '✓', duration: 2500 });
    } catch {}
  }, [announcements]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return announcements.filter((a) => !readIds.has(a.id)).length;
  }, [announcements, readIds]);

  // Filtering based on Tab and Search
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      // Tab filter
      if (activeTab === 'official' && ann.category !== 'official') return false;
      if (activeTab === 'news' && ann.category === 'official') return false;
      if (activeTab === 'unread' && readIds.has(ann.id)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = ann.title.toLowerCase().includes(q);
        const matchesExcerpt = ann.excerpt.toLowerCase().includes(q);
        const matchesAuthor = ann.author.toLowerCase().includes(q);
        return matchesTitle || matchesExcerpt || matchesAuthor;
      }
      return true;
    });
  }, [announcements, activeTab, readIds, searchQuery]);

  const handleOpenAnnouncement = (ann: ProcessedAnnouncement) => {
    markAsRead(ann.id);
    onClose();
    navigate(`/announcements/${ann.id || ann.slug}`);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          if (previewNotice) {
            setPreviewNotice(null);
          } else {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Flyout Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ASTU Announcements"
        className={`absolute right-3 sm:right-6 top-16 sm:top-20 w-[95vw] sm:w-[440px] max-w-[440px] rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 6rem)' }}
      >
        {/* Top Header */}
        <div className="relative bg-gradient-to-r from-astu-navy via-slate-900 to-blue-950 p-4 sm:p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-amber-400 border border-white/15 shadow-xs">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                  <span>Announcements</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-300">Official notices & university bulletins</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                aria-label="Close announcements"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mini Search Bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 outline-none border border-white/10 focus:border-white/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: announcements.length },
            {
              id: 'official',
              label: 'Directives',
              count: announcements.filter((a) => a.category === 'official').length,
            },
            {
              id: 'news',
              label: 'News',
              count: announcements.filter((a) => a.category !== 'official').length,
            },
            { id: 'unread', label: 'Unread', count: unreadCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-astu-navy dark:bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Scrollable Notice Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2 sm:p-3 space-y-1">
          {filteredAnnouncements.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                <BellOff className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {searchQuery ? 'No matching announcements' : 'No announcements in this category'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? 'Try searching with different keywords.'
                  : 'Check back soon for new university updates.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredAnnouncements.map((ann) => {
              const isRead = readIds.has(ann.id);
              return (
                <div
                  key={ann.id}
                  className={`group relative rounded-2xl p-3.5 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/60 ${
                    isRead ? 'opacity-85' : 'bg-blue-50/25 dark:bg-blue-950/20'
                  }`}
                >
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Priority / Unread Dot */}
                      {!isRead ? (
                        <span
                          className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shrink-0"
                          title="Unread announcement"
                        />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                      )}

                      {/* Type Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          ann.category === 'official'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                        }`}
                      >
                        {ann.type}
                      </span>

                      {/* Pinned Badge */}
                      {ann.pinned && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                          <Pin className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          Pinned
                        </span>
                      )}

                      {/* Urgent Badge */}
                      {ann.priority === 'high' && !ann.pinned && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                          Urgent
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                      <CalendarDays className="h-3 w-3" />
                      <span>{ann.date}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4
                    onClick={() => handleOpenAnnouncement(ann)}
                    className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
                  >
                    {ann.title}
                  </h4>

                  {/* Excerpt */}
                  {ann.excerpt && (
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {ann.excerpt}
                    </p>
                  )}

                  {/* Bottom Meta & Action Bar */}
                  <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100/80 dark:border-slate-800/50">
                    <span className="text-slate-400 truncate max-w-[180px]">{ann.author}</span>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Quick Preview Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(ann.id);
                          setPreviewNotice(ann);
                        }}
                        className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Quick Preview"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Preview</span>
                      </button>

                      {/* Open Notice Link */}
                      <button
                        type="button"
                        onClick={() => handleOpenAnnouncement(ann)}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-all cursor-pointer group-hover:translate-x-0.5"
                      >
                        <span>Open</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {announcements.length} total notices
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/announcements');
            }}
            className="inline-flex items-center gap-1.5 font-bold text-astu-navy dark:text-blue-400 hover:text-astu-green dark:hover:text-blue-300 transition-colors cursor-pointer group"
          >
            <span>View all announcements</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Quick View Dialog Overlay */}
        {previewNotice && (
          <div className="absolute inset-0 z-20 flex flex-col bg-white dark:bg-slate-900 p-5 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                {previewNotice.type}
              </span>
              <button
                type="button"
                onClick={() => setPreviewNotice(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mb-2">
                {previewNotice.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {previewNotice.date}
                </span>
                <span>•</span>
                <span>{previewNotice.author}</span>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
                {previewNotice.content || previewNotice.excerpt}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewNotice(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Back to list
              </button>
              <button
                type="button"
                onClick={() => handleOpenAnnouncement(previewNotice)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-astu-navy text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                <span>Read Full Article</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}