import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Film,
  Filter,
  GraduationCap,
  Image as ImageIcon,
  ImagePlus,
  Microscope,
  PlayCircle,
  Search,
  Sparkles,
  Tag,
  User,
  X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import homepageCmsService from '../features/admin/services/homepageCms.service';
import { mediaUrl } from '../config';
import gallerySettingsService, {
  GalleryPageSettings,
} from '../features/admin/services/gallerySettings.service';

interface GalleryItem {
  id: string;
  title: string;
  type: 'Photo' | 'Video';
  album: string;
  src?: string;
  image?: string;
  status?: string;
  uploadedBy?: string;
  date?: string;
}

const defaultGalleryItems: GalleryItem[] = [
  {
    id: 'M-001',
    title: 'AI Workshop Opening Session',
    type: 'Video',
    album: 'Workshop Gallery',
    src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
    status: 'Approved',
    uploadedBy: 'CSE Department',
    date: '2 days ago',
  },
  {
    id: 'M-002',
    title: '2026 Graduation Main Stage',
    type: 'Photo',
    album: 'Graduation Gallery',
    src: '/images/gc7.jpg',
    status: 'Approved',
    uploadedBy: 'Registrar Office',
    date: '1 week ago',
  },
  {
    id: 'M-003',
    title: 'Research Expo Robotics Booth',
    type: 'Photo',
    album: 'Research Gallery',
    src: '/images/electriclabs.jpeg',
    status: 'Approved',
    uploadedBy: 'Research Directorate',
    date: '3 days ago',
  },
  {
    id: 'M-004',
    title: 'Alumni Career Day Panel',
    type: 'Photo',
    album: 'Event Gallery',
    src: '/images/astu-building.jpg',
    status: 'Approved',
    uploadedBy: 'Alumni Office',
    date: '5 hours ago',
  },
  {
    id: 'M-005',
    title: 'Campus Innovation Labs',
    type: 'Photo',
    album: 'Campus Gallery',
    src: '/images/humanitary building.jpg',
    status: 'Approved',
    uploadedBy: 'Public Relations',
    date: '1 day ago',
  },
  {
    id: 'M-006',
    title: 'Engineering Fair 2026',
    type: 'Photo',
    album: 'Event Gallery',
    src: '/images/campus-2.jpeg',
    status: 'Approved',
    uploadedBy: 'Engineering Faculty',
    date: '2 weeks ago',
  },
  {
    id: 'M-007',
    title: 'Cloud Computing Workshop',
    type: 'Video',
    album: 'Workshop Gallery',
    src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80',
    status: 'Approved',
    uploadedBy: 'ICT Directorate',
    date: '30 min ago',
  },
  {
    id: 'M-008',
    title: 'Campus Aerial Drone Footage',
    type: 'Video',
    album: 'Campus Gallery',
    src: '/images/arc.jpg',
    status: 'Approved',
    uploadedBy: 'Marketing Team',
    date: '1 month ago',
  },
];

export default function PublicGalleryPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GalleryPageSettings>(() => gallerySettingsService.getSettings());

  const loadMedia = (): GalleryItem[] => {
    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.gallery?.length) {
      return cmsConfig.gallery
        .filter((item: any) => item.active !== false)
        .map((item: any) => ({
          ...item,
          type: item.type === 'Video' ? 'Video' : 'Photo',
          album: item.album || 'Campus Gallery',
        }));
    }

    try {
      const stored = localStorage.getItem('astu_ams_cms_gallery_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((m: any) => m.status === 'Approved' || !m.status);
        }
      }
    } catch {}

    return defaultGalleryItems;
  };

  const [items, setItems] = useState<GalleryItem[]>(loadMedia);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Photo' | 'Video'>('All');
  const [search, setSearch] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const syncMedia = () => setItems(loadMedia());
    const syncSettings = () => setSettings(gallerySettingsService.getSettings());

    window.addEventListener('astu-cms-gallery-changed', syncMedia);
    window.addEventListener('astu-cms-homepage-updated', syncMedia);
    window.addEventListener('astu-cms-gallery-settings-changed', syncSettings);

    // The public gallery must use the shared backend configuration, rather
    // than a potentially stale gallery cache from a previous browser session.
    homepageCmsService.fetchFromApi().then((cmsConfig) => {
      if (cmsConfig?.gallery?.length) {
        syncMedia();
      }
    });

    return () => {
      window.removeEventListener('astu-cms-gallery-changed', syncMedia);
      window.removeEventListener('astu-cms-homepage-updated', syncMedia);
      window.removeEventListener('astu-cms-gallery-settings-changed', syncSettings);
    };
  }, []);

  const albumsList = ['All', 'Event Gallery', 'Workshop Gallery', 'Graduation Gallery', 'Campus Gallery', 'Research Gallery'];

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (selectedAlbum !== 'All' && item.album !== selectedAlbum) return false;
      if (selectedType !== 'All' && item.type !== selectedType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.album && item.album.toLowerCase().includes(q)) ||
          (item.uploadedBy && item.uploadedBy.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, selectedAlbum, selectedType, search]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar />

      {/* Header Banner (Fully Controlled by CMS Admin) */}
      <div
        className="relative overflow-hidden text-white py-12 px-4 sm:px-6 transition-all"
        style={{ backgroundColor: settings.bannerBgColor || '#003366' }}
      >
        {settings.showBannerImage && settings.bannerImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={settings.bannerImage}
              alt="Gallery Banner"
              className="h-full w-full object-cover object-center opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-astu-navy/85 to-astu-navy/90" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-[1240px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#FFD700] backdrop-blur-md border border-white/15">
                <ImageIcon className="h-7 w-7" />
              </span>
              <div>
                {settings.bannerBadge && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#FFD700] mb-2 backdrop-blur-sm border border-white/10">
                    <Sparkles className="h-3 w-3" />
                    {settings.bannerBadge}
                  </span>
                )}
                <h1 className="text-2xl font-black sm:text-3xl lg:text-4xl tracking-tight leading-tight">
                  {settings.bannerTitle || 'ASTU Media & Photo Gallery'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
                  {settings.bannerSubtitle ||
                    'Visual showcases, event archives, research expos, graduation ceremonies, and campus life at Adama Science and Technology University.'}
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 self-end rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/15 text-xs text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-astu-green" />
              <div>
                <p className="font-bold text-white">Verified ASTU Archive</p>
                <p className="text-[10px] text-slate-300">Managed by Directorate of Communication</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 flex-1 w-full space-y-6">
        {/* Filters & Search */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          {/* Album Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {albumsList.map((album) => (
              <button
                key={album}
                onClick={() => setSelectedAlbum(album)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedAlbum === album
                    ? 'bg-astu-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {album}
              </button>
            ))}
          </div>

          {/* Type Toggle & Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
              {(['All', 'Photo', 'Video'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                    selectedType === type ? 'bg-astu-navy text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={settings.searchPlaceholder || 'Search gallery...'}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-astu-navy focus:ring-2 focus:ring-astu-navy/10"
              />
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-astu-navy/40"
            >
              <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                <img
                  src={mediaUrl(item.src || item.image) || '/images/astu-building.jpg'}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    if (el.src.includes('astu-building.jpg')) {
                      el.src = '/images/fallback-campus.svg';
                    } else {
                      el.src = '/images/astu-building.jpg';
                    }
                  }}
                />
                {item.type === 'Video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform group-hover:scale-110">
                      <PlayCircle className="h-7 w-7" />
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-slate-950/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/10">
                    {item.album}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-astu-navy transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {item.uploadedBy || 'ASTU Media'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {item.date || 'Recently'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <ImageIcon className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-700">
              {settings.emptyTitle || 'No media items found'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {settings.emptySubtitle || 'Try adjusting your search terms or selecting a different album.'}
            </p>
            <button
              onClick={() => {
                setSelectedAlbum('All');
                setSelectedType('All');
                setSearch('');
              }}
              className="mt-4 rounded-xl bg-astu-navy px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#001a41]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Lightbox / Video Preview Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative max-w-4xl w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div>
                <span className="rounded-md bg-astu-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase text-astu-navy">
                  {activeModalItem.album}
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900">{activeModalItem.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={mediaUrl(activeModalItem.src || activeModalItem.image) || '/images/astu-building.jpg'}
                alt={activeModalItem.title}
                className="max-h-[70vh] w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                }}
              />
              {activeModalItem.type === 'Video' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                  <PlayCircle className="h-16 w-16 mb-2 text-[#FFD700]" />
                  <p className="text-xs font-semibold">Video preview stream ready</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-4 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  {activeModalItem.uploadedBy || 'ASTU Communication Office'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {activeModalItem.date || 'Recently'}
                </span>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="rounded-lg bg-astu-navy px-4 py-1.5 text-xs font-semibold text-white shadow-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatBot />
    </div>
  );
}
