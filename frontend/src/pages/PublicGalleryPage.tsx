import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  Image as ImageIcon,
  PlayCircle,
  Search,
  X,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import PaginationBar from '../components/PaginationBar';
import ShareModal, { ShareItem } from '../components/ShareModal';
import homepageCmsService from '../features/admin/services/homepageCms.service';
import contentService from '../features/admin/services/content.service';

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

  const GALLERY_PAGE_SIZE = 6;
  const [items, setItems] = useState<GalleryItem[]>(loadMedia);
  const [loading, setLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Photo' | 'Video'>('All');
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [galleryPage, setGalleryPage] = useState(0);
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

  // Fetch live published gallery from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchBackendMedia = async () => {
      setLoading(true);
      try {
        const [config, mediaAssets] = await Promise.all([
          homepageCmsService.fetchFromApi(),
          contentService.getMediaAssets(),
        ]);
        if (!isMounted) return;

        let mergedList: GalleryItem[] = [];
        const seenIds = new Set<string>();

        if (config?.gallery && Array.isArray(config.gallery)) {
          config.gallery.forEach((g: any) => {
            if (g && g.active !== false && g.src) {
              seenIds.add(g.id);
              mergedList.push({
                id: g.id,
                title: g.title || 'ASTU Campus Moment',
                type: 'Photo',
                album: g.album || 'Campus Gallery',
                src: g.src,
                image: g.src,
                status: 'Approved',
                date: g.date || 'Recent Moment',
              });
            }
          });
        }

        if (Array.isArray(mediaAssets)) {
          mediaAssets.forEach((m: any) => {
            if (m && !seenIds.has(m.id)) {
              seenIds.add(m.id);
              mergedList.push({
                id: m.id,
                title: m.altText || m.filename || 'Campus Media',
                type: m.mimeType?.startsWith('video') ? 'Video' : 'Photo',
                album: m.album || 'Campus Gallery',
                src: m.url,
                image: m.url,
                status: 'Approved',
                uploadedBy: m.uploaderName || 'Alumni Office',
                date: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent Moment',
              });
            }
          });
        }

        const localStored = localStorage.getItem('astu_ams_cms_gallery_items');
        if (localStored) {
          try {
            const parsed = JSON.parse(localStored);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                if (item && !seenIds.has(item.id)) {
                  seenIds.add(item.id);
                  mergedList.push(item);
                }
              });
            }
          } catch {}
        }

        if (mergedList.length > 0) {
          setItems(mergedList);
        }
      } catch (e) {
        console.warn('Error fetching live gallery:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBackendMedia();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setGalleryPage(0);
  }, [selectedAlbum, selectedType, search]);

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

  useEffect(() => {
    if (!activeModalItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModalItem(null);
      if (e.key === 'ArrowLeft') {
        const curIdx = filtered.findIndex((i) => i.id === activeModalItem.id);
        const prevIdx = (curIdx - 1 + filtered.length) % filtered.length;
        setActiveModalItem(filtered[prevIdx]);
      }
      if (e.key === 'ArrowRight') {
        const curIdx = filtered.findIndex((i) => i.id === activeModalItem.id);
        const nextIdx = (curIdx + 1) % filtered.length;
        setActiveModalItem(filtered[nextIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalItem, filtered]);

  const galleryTotalPages = Math.max(1, Math.ceil(filtered.length / GALLERY_PAGE_SIZE));
  const safeGalleryPage = Math.min(galleryPage, galleryTotalPages - 1);
  const pagedGallery = filtered.slice(
    safeGalleryPage * GALLERY_PAGE_SIZE,
    safeGalleryPage * GALLERY_PAGE_SIZE + GALLERY_PAGE_SIZE
  );

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-astu-navy to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1440px]">
          <div className="flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md">
              <img src="/images/astu-seal-logo.png" alt="ASTU Seal" className="h-4 w-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span>ASTU Media &amp; Photo Archives</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Gallery & Campus Moments
            </h1>

            <p className="max-w-3xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              <span className="font-semibold text-white">Campus moments</span> · Visual highlights, event archives, research expos, graduation ceremonies, and everyday campus life at Adama Science and Technology University.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <div className="relative flex items-center rounded-2xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 p-1.5 shadow-2xl focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
              <Search className="h-5 w-5 text-slate-300 ml-3.5 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gallery by title, album, or keyword..."
                aria-label="Search gallery"
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

      {/* Filter Toolbar */}
      <nav
        aria-label="Gallery filters"
        className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm transition-colors"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Album Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" role="tablist">
              {albumsList.map((albumName) => {
                const isActive = selectedAlbum === albumName;
                return (
                  <button
                    key={albumName}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedAlbum(albumName)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-astu-navy text-white shadow-md dark:bg-blue-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {albumName}
                  </button>
                );
              })}
            </div>

            {/* Type Filter & Count */}
            <div className="flex items-center justify-between md:justify-end gap-3">
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 text-xs">
                {(['All', 'Photo', 'Video'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`rounded-lg px-3 py-1 font-bold transition-all ${
                      selectedType === type
                        ? 'bg-astu-navy text-white shadow-sm dark:bg-blue-600'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Filter className="h-4 w-4" />
                <span>
                  Showing{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {filtered.length === 0 ? 0 : safeGalleryPage * GALLERY_PAGE_SIZE + 1}
                  </strong>
                  –
                  <strong className="text-slate-900 dark:text-white">
                    {Math.min(filtered.length, (safeGalleryPage + 1) * GALLERY_PAGE_SIZE)}
                  </strong>{' '}
                  of <strong className="text-slate-900 dark:text-white">{filtered.length}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full space-y-6">
        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pagedGallery.map((item) => (
            <article
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-astu-navy/30 dark:hover:border-blue-500/30"
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
                <button
                  type="button"
                  aria-label={`Share ${item.title}`}
                  title="Share this moment"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareItem({
                      id: item.id,
                      title: item.title,
                      subtitle: `${item.album} · ASTU Media Gallery`,
                      text: `Check out "${item.title}" from the ASTU photo & media gallery.`,
                      url: `/gallery`,
                      image: item.src || item.image,
                      badge: item.type,
                      type: 'gallery',
                    });
                    setIsShareOpen(true);
                  }}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-astu-navy z-10 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#003580] dark:text-blue-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{item.uploadedBy || 'ASTU Directorate'}</span>
                  <span>{item.date || 'Recent'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <ImageIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-base font-bold text-slate-700 dark:text-slate-200">No media items found</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try adjusting your album or filter search term.</p>
          </div>
        )}

        {filtered.length > 0 && (
          <PaginationBar
            currentPage={safeGalleryPage}
            totalPages={galleryTotalPages}
            total={filtered.length}
            pageSize={GALLERY_PAGE_SIZE}
            onPageChange={(p) => {
              setGalleryPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            noun="media items"
          />
        )}
      </main>

      {/* Lightbox Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative max-h-[75vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img
                src={activeModalItem.src || activeModalItem.image || '/images/fallback-campus.svg'}
                alt={activeModalItem.title}
                className="max-h-[75vh] w-auto object-contain"
              />
              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous item"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = filtered.findIndex((i) => i.id === activeModalItem.id);
                      const prevIdx = (curIdx - 1 + filtered.length) % filtered.length;
                      setActiveModalItem(filtered[prevIdx]);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-all border border-white/20"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next item"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = filtered.findIndex((i) => i.id === activeModalItem.id);
                      const nextIdx = (curIdx + 1) % filtered.length;
                      setActiveModalItem(filtered[nextIdx]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-all border border-white/20"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <span className="rounded-md bg-blue-100 dark:bg-blue-900/40 text-[#003580] dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                  {activeModalItem.album}
                </span>
                <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">{activeModalItem.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShareItem({
                      id: activeModalItem.id,
                      title: activeModalItem.title,
                      subtitle: `${activeModalItem.album} · ASTU Media Gallery`,
                      text: `Check out "${activeModalItem.title}" from the ASTU photo & media gallery.`,
                      url: `/gallery`,
                      image: activeModalItem.src || activeModalItem.image,
                      badge: activeModalItem.type,
                      type: 'gallery',
                    });
                    setIsShareOpen(true);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Share</span>
                </button>
                <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{activeModalItem.uploadedBy || 'ASTU Office'}</p>
                  <p>{activeModalItem.date || 'Recent'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
