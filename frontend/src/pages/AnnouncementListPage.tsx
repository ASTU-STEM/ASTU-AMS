import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ChevronRight,
  Filter,
  Search,
  ShieldCheck,
  X,
  Share2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import PaginationBar from '../components/PaginationBar';
import ShareModal, { ShareItem } from '../components/ShareModal';
import contentService from '../features/admin/services/content.service';
import { ContentCardItem } from '../features/admin/components/ContentCard';

const ANNOUNCEMENT_PAGE_SIZE = 6;

export default function AnnouncementListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentCardItem[]>(() => contentService.getItems());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  React.useEffect(() => {
    const handleSync = () => setItems(contentService.getItems());
    window.addEventListener('astu-cms-content-changed', handleSync);

    contentService.fetchItemsFromApi().then((fresh) => {
      if (fresh && fresh.length > 0) setItems(fresh);
    });

    return () => window.removeEventListener('astu-cms-content-changed', handleSync);
  }, []);

  React.useEffect(() => {
    setPage(0);
  }, [search, typeFilter]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
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
  }, [items, search, typeFilter]);

  const counts = useMemo(() => {
    const published = items.filter((i) => i.status === 'Published');
    return {
      all: published.length,
      announcement: published.filter((i) => i.type === 'announcement').length,
      post: published.filter((i) => i.type === 'post').length,
      page: published.filter((i) => i.type === 'page').length,
      gallery: published.filter((i) => i.type === 'gallery').length,
    };
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ANNOUNCEMENT_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(
    safePage * ANNOUNCEMENT_PAGE_SIZE,
    safePage * ANNOUNCEMENT_PAGE_SIZE + ANNOUNCEMENT_PAGE_SIZE
  );

  const slugifiedId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const typeTabs = [
    { id: 'all', label: 'All Notices', count: counts.all },
    { id: 'announcement', label: 'Announcements', count: counts.announcement },
    { id: 'post', label: 'Posts & Articles', count: counts.post },
    { id: 'page', label: 'Pages', count: counts.page },
    { id: 'gallery', label: 'Galleries', count: counts.gallery },
  ];

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-astu-navy to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-astu-red blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1440px]">
          <div className="flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-300 backdrop-blur-md">
              <Bell className="h-4 w-4 text-astu-red" />
              <span>ASTU Official Communications</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Notices & Announcements Directory
            </h1>

            <p className="max-w-3xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              <span className="font-semibold text-white">Official updates</span> · Official bulletins, academic notices, alumni achievements, and university updates from Adama Science and Technology University.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <div className="relative flex items-center rounded-2xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 p-1.5 shadow-2xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all">
              <Search className="h-5 w-5 text-slate-300 ml-3.5 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notices by title, excerpt, or keyword..."
                aria-label="Search announcements"
                className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <nav
        aria-label="Announcement filters"
        className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm transition-colors"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" role="tablist">
              {typeTabs.map((tab) => {
                const isActive = typeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTypeFilter(tab.id)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-astu-navy text-white shadow-md dark:bg-blue-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Filter className="h-4 w-4" />
              <span>
                Showing{' '}
                <strong className="text-slate-900 dark:text-white">
                  {filtered.length === 0 ? 0 : safePage * ANNOUNCEMENT_PAGE_SIZE + 1}
                </strong>
                –
                <strong className="text-slate-900 dark:text-white">
                  {Math.min(filtered.length, (safePage + 1) * ANNOUNCEMENT_PAGE_SIZE)}
                </strong>{' '}
                of <strong className="text-slate-900 dark:text-white">{filtered.length}</strong>
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 mx-auto max-w-[1440px] w-full px-4 py-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
            <Bell className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-lg font-bold text-slate-700 dark:text-slate-200">No Announcements Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search term or category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
              }}
              className="mt-4 rounded-xl bg-astu-navy px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-astu-navy/90 dark:bg-blue-600"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {paged.map((item) => (
                <article
                  key={item.id}
                  onClick={() => navigate(`/announcements/${slugifiedId(item.title)}`)}
                  className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-astu-navy/30 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-astu-red/10 dark:bg-red-900/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-astu-red dark:text-red-400">
                        {item.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.publishedAt || item.updatedAt}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold text-astu-navy dark:text-blue-200 group-hover:text-astu-red dark:group-hover:text-amber-400 transition-colors leading-snug">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {item.excerpt || item.title}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-semibold text-astu-navy dark:text-blue-300">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ASTU Directorate Notice
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareItem({
                            id: item.id,
                            title: item.title,
                            subtitle: `${item.type} Notice · ASTU Directorate`,
                            text: `${item.title} - Official notice from Adama Science and Technology University.`,
                            url: `/announcements/${slugifiedId(item.title)}`,
                            badge: item.type,
                            type: 'announcement',
                          });
                          setIsShareOpen(true);
                        }}
                        className="rounded-lg p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Share notice"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Full Notice
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <PaginationBar
              currentPage={safePage}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={ANNOUNCEMENT_PAGE_SIZE}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              noun="notices"
            />
          </>
        )}
      </main>

      {/* ── MODAL: Universal Share Modal ── */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        item={shareItem}
      />

      <Footer />
      <ChatBot />
    </div>
  );
}
