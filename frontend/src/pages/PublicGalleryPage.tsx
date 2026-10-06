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
  Tag,
  User,
  X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import homepageCmsService from '../features/admin/services/homepageCms.service';

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

  const loadMedia = () => {
    try {
      const stored = localStorage.getItem('astu_ams_cms_gallery_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((m: any) => m.status === 'Approved' || !m.status);
        }
      }
    } catch {}

    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.gallery?.length) {
      return cmsConfig.gallery;
    }

    return defaultGalleryItems;
  };

  const [items, setItems] = useState<GalleryItem[]>(loadMedia);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Photo' | 'Video'>('All');
  const [search, setSearch] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const sync = () => setItems(loadMedia());
    window.addEventListener('astu-cms-gallery-changed', sync);
    window.addEventListener('astu-cms-homepage-updated', sync);
    return () => {
      window.removeEventListener('astu-cms-gallery-changed', sync);
      window.removeEventListener('astu-cms-homepage-updated', sync);
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
    <div className="app-shell min-h-screen bg-[var(--bg-page)] font-sans text-[var(--text-primary)] dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#003580] text-white py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#FFD700]">
              <ImageIcon className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black sm:text-4xl">ASTU Media & Photo Gallery</h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                Visual showcases, event archives, research expos, graduation ceremonies, and campus life at Adama Science and Technology University.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 flex-1 w-full space-y-6">
        {/* Filters & Search */}
        <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 p-4 shadow-sm md:flex-row md:items-center md:justify-between transition-colors">
          {/* Album Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {albumsList.map((albumName) => (
              <button
                key={albumName}
                type="button"
                onClick={() => setSelectedAlbum(albumName)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedAlbum === albumName
                    ? 'bg-[#003580] text-white shadow-sm'
                    : 'bg-[var(--bg-page)] dark:bg-slate-800 text-[var(--text-secondary)] dark:text-slate-300  dark:hover:bg-slate-700'
                }`}
              >
                {albumName}
              </button>
            ))}
          </div>

          {/* Type Filter & Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-page)] dark:bg-slate-800 p-1 text-xs">
              {(['All', 'Photo', 'Video'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                    selectedType === type ? 'bg-[#003580] text-white shadow-sm' : 'text-[var(--text-secondary)] dark:text-slate-300 hover:bg-[var(--bg-page)] dark:hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gallery..."
                className="w-full rounded-lg border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 dark:text-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-colors"
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
              className="group cursor-pointer overflow-hidden rounded-xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.src || item.image || '/images/fallback-campus.svg'}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/fallback-campus.svg';
                  }}
                />
                {item.type === 'Video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform group-hover:scale-110">
                      <PlayCircle className="h-7 w-7" />
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.album || 'Gallery'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#003580] dark:text-blue-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-muted)] dark:text-slate-400">
                  <span>{item.uploadedBy || 'ASTU Directorate'}</span>
                  <span>{item.date || 'Recent'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center bg-[var(--bg-card)] dark:bg-slate-900 rounded-xl border border-[var(--border-color)] dark:border-slate-800">
            <ImageIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-base font-bold text-[var(--text-secondary)] dark:text-slate-200">No media items found</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)] dark:text-slate-400">Try adjusting your album or filter search term.</p>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl bg-[var(--bg-card)] dark:bg-slate-900 border border-transparent dark:border-slate-800 p-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="max-h-[75vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img
                src={activeModalItem.src || activeModalItem.image || '/images/fallback-campus.svg'}
                alt={activeModalItem.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="rounded-md bg-blue-100 dark:bg-blue-900/40 text-[#003580] dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                  {activeModalItem.album}
                </span>
                <h2 className="mt-2 text-lg font-bold text-[var(--text-primary)] dark:text-slate-100">{activeModalItem.title}</h2>
              </div>
              <div className="text-right text-xs text-[var(--text-muted)] dark:text-slate-400">
                <p className="font-semibold text-[var(--text-secondary)] dark:text-slate-300">{activeModalItem.uploadedBy || 'ASTU Office'}</p>
                <p>{activeModalItem.date || 'Recent'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 py-6 text-center text-xs text-[var(--text-muted)] dark:text-slate-400 transition-colors">
        © 2026 Adama Science and Technology University (ASTU) — All Rights Reserved.
      </footer>
      <ChatBot />
    </div>
  );
}
