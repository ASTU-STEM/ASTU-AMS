import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  Filter,
  Search,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import contentService from '../features/admin/services/content.service';
import { ContentCardItem } from '../features/admin/components/ContentCard';

export default function AnnouncementListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentCardItem[]>(() => contentService.getItems());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  React.useEffect(() => {
    const handleSync = () => setItems(contentService.getItems());
    window.addEventListener('astu-cms-content-changed', handleSync);
    return () => window.removeEventListener('astu-cms-content-changed', handleSync);
  }, []);

  const filtered = items.filter((item) => {
    if (item.status !== 'Published') return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.excerpt?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const slugifiedId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="app-shell min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-primary)] dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#003580] text-white py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#FFD700]">
              <Bell className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">ASTU Official Notices & Announcements</h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                Official communications, university bulletins, academic notices, and alumni achievements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border-b border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 shadow-sm transition-colors">
        <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search official notices by title, excerpt, or keyword..."
                className="w-full rounded-xl border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-page)] dark:bg-slate-800 dark:text-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#003580] focus:bg-[var(--bg-card)] dark:focus:bg-slate-800 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--text-muted)]" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 outline-none focus:border-[#003580] transition-colors"
              >
                <option value="all">All Notice Types</option>
                <option value="announcement">Announcements</option>
                <option value="post">Posts & Articles</option>
                <option value="page">Pages</option>
                <option value="gallery">Galleries</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <main className="mx-auto max-w-[1240px] flex-1 px-4 py-8 sm:px-6">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-12 text-center shadow-sm">
            <Bell className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-lg font-bold text-[var(--text-secondary)] dark:text-slate-200">No Announcements Found</h3>
            <p className="text-xs text-[var(--text-muted)] dark:text-slate-400 mt-1">Try adjusting your search term or category filter.</p>
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
              }}
              className="mt-4 rounded-lg bg-[#003580] px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                onClick={() => navigate(`/announcements/${slugifiedId(item.title)}`)}
                className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-6 shadow-sm hover:border-[#003580]/30 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#C8102E]/10 dark:bg-red-900/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C8102E] dark:text-red-400">
                      {item.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.publishedAt || item.updatedAt}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-[#003580] dark:text-blue-200 group-hover:text-[#C8102E] dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-xs text-[var(--text-secondary)] dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {item.excerpt || item.title}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[var(--border-color)] dark:border-slate-800 pt-4 text-xs font-semibold text-[#003580] dark:text-blue-300">
                  <span className="flex items-center gap-1 text-[var(--text-muted)] dark:text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    ASTU Directorate Notice
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Full Notice
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <ChatBot />
    </div>
  );
}
