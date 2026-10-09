import React, { useState, useEffect } from 'react';
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
  Pin,
  Sparkles,
  Info,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import contentService from '../features/admin/services/content.service';
import announcementSettingsService, { AnnouncementPageSettings } from '../features/admin/services/announcementSettings.service';
import { ContentCardItem } from '../features/admin/components/ContentCard';

export default function AnnouncementListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentCardItem[]>(() => contentService.getItems());
  const [settings, setSettings] = useState<AnnouncementPageSettings>(() => announcementSettingsService.getSettings());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    contentService.fetchItemsFromApi().then((apiItems) => {
      if (isMounted && Array.isArray(apiItems) && apiItems.length) {
        setItems(apiItems);
      }
    });

    const handleContentSync = () => setItems(contentService.getItems());
    const handleSettingsSync = () => setSettings(announcementSettingsService.getSettings());

    window.addEventListener('astu-cms-content-changed', handleContentSync);
    window.addEventListener('astu-announcement-settings-changed', handleSettingsSync);

    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-content-changed', handleContentSync);
      window.removeEventListener('astu-announcement-settings-changed', handleSettingsSync);
    };
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar />

      {/* Top Ticker / Broadcast Bar (Configurable in CMS) */}
      {settings.topAlertEnabled && settings.topAlertText && (
        <div className="bg-[#C8102E] text-white py-2 px-4 text-xs font-semibold shadow-inner">
          <div className="mx-auto max-w-[1240px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 items-center rounded-full bg-white/20 px-2 text-[10px] uppercase font-bold tracking-wider">
                Official Alert
              </span>
              <p className="truncate">{settings.topAlertText}</p>
            </div>
            {settings.topAlertLink && (
              <Link
                to={settings.topAlertLink}
                className="shrink-0 font-bold underline hover:text-white/80 transition-colors"
              >
                Learn More &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Header Banner (Configurable in CMS) */}
      <div
        className="relative overflow-hidden text-white py-12 px-4 sm:px-6 transition-all"
        style={{
          backgroundColor: settings.bannerBgColor || '#003580',
        }}
      >
        {settings.showBannerImage && settings.bannerImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={settings.bannerImage}
              alt="Banner background"
              className="h-full w-full object-cover object-center opacity-25"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-[#003580]/85 to-[#003580]/90"
            />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-[1240px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#FFD700] shadow-inner backdrop-blur-md border border-white/15">
                <Bell className="h-7 w-7" />
              </span>
              <div>
                {settings.bannerBadge && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#FFD700] mb-2 backdrop-blur-sm border border-white/10">
                    <Sparkles className="h-3 w-3" />
                    {settings.bannerBadge}
                  </span>
                )}
                <h1 className="text-2xl font-black sm:text-3xl lg:text-4xl tracking-tight leading-tight">
                  {settings.bannerTitle || 'ASTU Official Notices & Announcements'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
                  {settings.bannerSubtitle ||
                    'Official communications, university bulletins, academic notices, and alumni achievements.'}
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 self-end rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/15 text-xs text-slate-200">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="font-bold text-white">Verified Communications</p>
                <p className="text-[10px] text-slate-300">Managed by ASTU Directorate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border-b border-slate-200 bg-white shadow-xs sticky top-0 z-20">
        <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={settings.searchPlaceholder || 'Search official notices by title, excerpt, or keyword...'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#003580] focus:bg-white transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#003580] shadow-2xs cursor-pointer"
              >
                <option value="all">{settings.filterAllLabel || 'All Notice Types'}</option>
                <option value="announcement">Announcements</option>
                <option value="post">Posts & Articles</option>
                <option value="page">Pages</option>
                <option value="gallery">Galleries</option>
                <option value="event">Events</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main List Grid */}
      <main className="mx-auto max-w-[1240px] flex-1 px-4 py-8 sm:px-6">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Bell className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-bold text-slate-700">
              {settings.emptyTitle || 'No Announcements Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {settings.emptyDescription || 'Try adjusting your search term or category filter.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
              }}
              className="mt-4 rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#002855] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                onClick={() => navigate(`/announcements/${encodeURIComponent(item.id || slugifiedId(item.title))}`)}
                className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-[#003580]/40 hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Notice Image (Managed in CMS) */}
                  {item.image && (
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {item.pinned && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-sm">
                          <Pin className="h-3 w-3 fill-white" />
                          PINNED NOTICE
                        </div>
                      )}
                      {item.priorityBadge && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-[#003580]/90 backdrop-blur-sm text-[#FFD700] px-2 py-0.5 text-[10px] font-bold shadow-sm border border-white/20">
                          {item.priorityBadge}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-[#C8102E]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C8102E]">
                          {item.category || item.type}
                        </span>
                        {item.priorityBadge && !item.image && (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                            {item.priorityBadge}
                          </span>
                        )}
                        {item.pinned && !item.image && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                            <Pin className="h-3 w-3 fill-amber-500 text-amber-500" />
                            PINNED
                          </span>
                        )}
                        {item.targetAudience && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            👥 {item.targetAudience}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.publishedAt || item.updatedAt}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold text-[#003580] group-hover:text-[#C8102E] transition-colors leading-snug">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.excerpt || item.title}
                    </p>
                  </div>
                </div>

                <div className="mx-6 mb-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-[#003580]">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    {item.author || settings.authorityLabel || 'ASTU Directorate Notice'}
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {item.buttonText || settings.cardButtonText || 'Read Full Notice'}
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
