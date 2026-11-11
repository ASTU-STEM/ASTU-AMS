import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Film,
  Filter,
  GraduationCap,
  Image as ImageIcon,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
  X,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import homepageCmsService from '../features/admin/services/homepageCms.service';
import gallerySettingsService, {
  GalleryPageSettings,
} from '../features/admin/services/gallerySettings.service';

export interface GalleryItem {
  id: string;
  title: string;
  type: 'Photo' | 'Video';
  album: string;
  category?: 'EVENTS' | 'GRADUATION' | 'RESEARCH' | 'CAMPUS' | 'WORKSHOPS';
  src?: string;
  image?: string;
  status?: string;
  uploadedBy?: string;
  date?: string;
  photoCount?: number;
  duration?: string;
}

const defaultGalleryItems: GalleryItem[] = [
  {
    id: 'M-001',
    title: 'AI Workshop Opening Session',
    type: 'Video',
    album: 'Workshop Gallery',
    category: 'WORKSHOPS',
    src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
    status: 'Approved',
    uploadedBy: 'CSE Department',
    date: '2 days ago',
    duration: '04:15',
  },
  {
    id: 'M-002',
    title: '2026 Graduation Main Stage',
    type: 'Photo',
    album: 'Graduation Gallery',
    category: 'GRADUATION',
    src: '/images/gc7.jpg',
    status: 'Approved',
    uploadedBy: 'Registrar Office',
    date: '1 week ago',
    photoCount: 48,
  },
  {
    id: 'M-003',
    title: 'Research Expo Robotics Booth',
    type: 'Photo',
    album: 'Research Gallery',
    category: 'RESEARCH',
    src: '/images/electriclabs.jpeg',
    status: 'Approved',
    uploadedBy: 'Research Directorate',
    date: '3 days ago',
    photoCount: 24,
  },
  {
    id: 'M-004',
    title: 'Alumni Career Day Panel',
    type: 'Photo',
    album: 'Event Gallery',
    category: 'EVENTS',
    src: '/images/astu-building.jpg',
    status: 'Approved',
    uploadedBy: 'Alumni Office',
    date: '5 hours ago',
    photoCount: 16,
  },
  {
    id: 'M-005',
    title: 'Campus Innovation Labs',
    type: 'Photo',
    album: 'Campus Gallery',
    category: 'CAMPUS',
    src: '/images/humanitary building.jpg',
    status: 'Approved',
    uploadedBy: 'Public Relations',
    date: '1 day ago',
    photoCount: 30,
  },
  {
    id: 'M-006',
    title: 'Engineering Fair 2026',
    type: 'Photo',
    album: 'Event Gallery',
    category: 'EVENTS',
    src: '/images/campus-2.jpeg',
    status: 'Approved',
    uploadedBy: 'Engineering Faculty',
    date: '2 weeks ago',
    photoCount: 36,
  },
  {
    id: 'M-007',
    title: 'Cloud Computing Workshop',
    type: 'Video',
    album: 'Workshop Gallery',
    category: 'WORKSHOPS',
    src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80',
    status: 'Approved',
    uploadedBy: 'ICT Directorate',
    date: '30 min ago',
    duration: '06:40',
  },
  {
    id: 'M-008',
    title: 'Campus Aerial Drone Footage',
    type: 'Video',
    album: 'Campus Gallery',
    category: 'CAMPUS',
    src: '/images/arc.jpg',
    status: 'Approved',
    uploadedBy: 'Marketing Team',
    date: '1 month ago',
    duration: '02:50',
  },
  {
    id: 'M-009',
    title: 'Presidential Awards & Medal Convocations',
    type: 'Photo',
    album: 'Graduation Gallery',
    category: 'GRADUATION',
    src: '/images/State-M.jpg',
    status: 'Approved',
    uploadedBy: 'President Office',
    date: '2 weeks ago',
    photoCount: 42,
  },
  {
    id: 'M-010',
    title: 'Renewable Solar Energy Testing Field',
    type: 'Photo',
    album: 'Research Gallery',
    category: 'RESEARCH',
    src: '/images/electriclabs.jpeg',
    status: 'Approved',
    uploadedBy: 'Energy Center',
    date: '4 days ago',
    photoCount: 18,
  },
  {
    id: 'M-011',
    title: 'Alumni Homecoming Gala Night',
    type: 'Photo',
    album: 'Event Gallery',
    category: 'EVENTS',
    src: '/images/astuget.jpg',
    status: 'Approved',
    uploadedBy: 'Alumni Affairs',
    date: '3 weeks ago',
    photoCount: 54,
  },
  {
    id: 'M-012',
    title: 'Student Technology Incubation Pitch',
    type: 'Video',
    album: 'Workshop Gallery',
    category: 'WORKSHOPS',
    src: '/images/astusteam.jpg',
    status: 'Approved',
    uploadedBy: 'STEM Incubation Center',
    date: '5 days ago',
    duration: '08:15',
  },
];

export default function PublicGalleryPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GalleryPageSettings>(() => gallerySettingsService.getSettings());

  const normalizeItem = (item: any, idx: number): GalleryItem => {
    const isVideo = item.type === 'Video' || Boolean(item.duration && !item.photoCount);
    const defaultAlbum = isVideo ? 'Workshop Gallery' : 'Campus Gallery';
    const defaultCategory = (isVideo ? 'WORKSHOPS' : 'CAMPUS') as NonNullable<GalleryItem['category']>;
    return {
      id: item.id || `M-${idx + 1}`,
      title: item.title || 'ASTU Media Archive',
      type: isVideo ? 'Video' : 'Photo',
      album: item.album || defaultAlbum,
      category: item.category || defaultCategory,
      src: item.src || item.image || '/images/astu-building.jpg',
      image: item.image || item.src || '/images/astu-building.jpg',
      status: item.status || 'Approved',
      uploadedBy: item.uploadedBy || 'ASTU Communications',
      date: item.date || 'Recently',
      photoCount: item.photoCount || 16,
      duration: item.duration || '04:15',
    };
  };

  const loadMedia = useCallback((): GalleryItem[] => {
    try {
      const stored = localStorage.getItem('astu_ams_cms_gallery_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const approved = parsed.filter((m: any) => m.status === 'Approved' || !m.status);
          if (approved.length > 0) return approved.map(normalizeItem);
        }
      }
    } catch { }

    const cmsConfig = homepageCmsService.getSettings();
    if (cmsConfig?.gallery?.length && cmsConfig.gallery.some((g: any) => g.album || g.category)) {
      return cmsConfig.gallery.map(normalizeItem);
    }

    return defaultGalleryItems.map(normalizeItem);
  }, []);

  const [items, setItems] = useState<GalleryItem[]>(loadMedia);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'All' | 'Photo' | 'Video'>('All');
  const [search, setSearch] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  // Pagination states (Page Handler)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // 6 albums per page matching screenshot 2
  const [paginationMode, setPaginationMode] = useState<'paged' | 'infinite'>('paged');

  useEffect(() => {
    const syncMedia = () => setItems(loadMedia());
    const syncSettings = () => setSettings(gallerySettingsService.getSettings());

    window.addEventListener('astu-cms-gallery-changed', syncMedia);
    window.addEventListener('astu-cms-homepage-updated', syncMedia);
    window.addEventListener('astu-cms-gallery-settings-changed', syncSettings);

    return () => {
      window.removeEventListener('astu-cms-gallery-changed', syncMedia);
      window.removeEventListener('astu-cms-homepage-updated', syncMedia);
      window.removeEventListener('astu-cms-gallery-settings-changed', syncSettings);
    };
  }, [loadMedia]);

  // Reset pagination when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedType, pageSize]);

  const categoryTabs = [
    { id: 'all', label: 'All Galleries' },
    { id: 'events', label: 'Events' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'graduation', label: 'Graduation' },
    { id: 'campus', label: 'Campus' },
    { id: 'research', label: 'Research' },
  ];

  const filtered = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (selectedType !== 'All' && item.type !== selectedType) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        const itemAlbum = (item.album || '').toLowerCase();
        const target = selectedCategory.toLowerCase();

        const match =
          itemCat.includes(target) ||
          itemAlbum.includes(target) ||
          (target === 'events' && (itemCat.includes('event') || itemAlbum.includes('event'))) ||
          (target === 'workshops' && (itemCat.includes('workshop') || itemAlbum.includes('workshop'))) ||
          (target === 'graduation' && (itemCat.includes('graduation') || itemAlbum.includes('graduation'))) ||
          (target === 'campus' && (itemCat.includes('campus') || itemAlbum.includes('campus'))) ||
          (target === 'research' && (itemCat.includes('research') || itemAlbum.includes('research')));

        if (!match) return false;
      }

      // Search keyword filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = (item.title || '').toLowerCase().includes(q);
        const inAlbum = (item.album || '').toLowerCase().includes(q);
        const inUploadedBy = (item.uploadedBy || '').toLowerCase().includes(q);
        if (!inTitle && !inAlbum && !inUploadedBy) return false;
      }

      return true;
    });
  }, [items, selectedCategory, selectedType, search]);

  // Page handler calculations
  const totalAlbums = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalAlbums / pageSize));

  // If in infinite/load more mode, show from 0 to currentPage * pageSize. In paged mode, slice by page.
  const displayedAlbums = useMemo(() => {
    if (paginationMode === 'infinite') {
      return filtered.slice(0, currentPage * pageSize);
    }
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize, paginationMode]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const target = document.getElementById('gallery-feed-nav');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoadMore = () => {
    setPaginationMode('infinite');
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getPageNumbers = (current: number, total: number) => {
    const delta = 1;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < total - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }
    return range;
  };

  // ── Modal Preview Page Handler (Previous / Next image in Lightbox) ──
  const currentModalIndex = useMemo(() => {
    if (!activeModalItem) return -1;
    return filtered.findIndex((item) => item.id === activeModalItem.id);
  }, [activeModalItem, filtered]);

  const handlePrevModalItem = () => {
    if (currentModalIndex > 0) {
      setActiveModalItem(filtered[currentModalIndex - 1]);
    }
  };

  const handleNextModalItem = () => {
    if (currentModalIndex >= 0 && currentModalIndex < filtered.length - 1) {
      setActiveModalItem(filtered[currentModalIndex + 1]);
    }
  };

  // Keyboard navigation for gallery modal: ArrowLeft / ArrowRight / Escape
  useEffect(() => {
    if (!activeModalItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentModalIndex > 0) {
          setActiveModalItem(filtered[currentModalIndex - 1]);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentModalIndex >= 0 && currentModalIndex < filtered.length - 1) {
          setActiveModalItem(filtered[currentModalIndex + 1]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActiveModalItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalItem, currentModalIndex, filtered]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col">
      <Navbar />

      {/* ── Hero Banner (Clean & Modern) ── */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#001d4a] via-[#002b66] to-[#0a3977] text-white pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 shadow-xl">
        {/* Subtle Campus Background Image (Clean & Visible) */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <img
            alt="ASTU Media Archive"
            className="h-full w-full object-cover"
            src={settings.bannerImage || '/images/arc.jpg'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
            }}
          />
        </div>

        {/* Blueprint grid pattern */}
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:4rem_4rem] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1360px]">
          {/* Breadcrumb Navigation: Home / Media */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-slate-300/80 mb-5 font-normal">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-slate-400 font-light">/</span>
            <span className="text-white font-medium">Media</span>
          </nav>

          <div className="max-w-3xl space-y-3">
            {/* Headline Title */}
            <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-tight">
              {settings.bannerTitle || 'Media and photo gallery'}
            </h1>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-2xl">
              {settings.bannerSubtitle || 'Visual showcases, event archives, research expos, graduation ceremonies, and campus life at Adama Science and Technology University.'}
            </p>
          </div>
        </div>
      </header>

      {/* ── Modern Sticky Filter & Controls Bar (Clean, Non-Overlapping) ── */}
      <nav
        id="gallery-feed-nav"
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs"
      >
        <div className="mx-auto max-w-[1360px] px-4 py-3 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === tab.id
                      ? 'bg-[#0a3871] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Type Selector, Search and Album Count */}
            <div className="flex items-center gap-2.5 self-stretch md:self-auto">
              {/* Type Toggle: All | Photos | Videos */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 shrink-0">
                {(['All', 'Photo', 'Video'] as const).map((type) => {
                  const label = type === 'All' ? 'All' : type === 'Photo' ? 'Photos' : 'Videos';
                  const isActive = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${isActive
                          ? 'bg-[#0a3871] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search albums..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-8.5 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#0a3871] focus:bg-white transition-all shadow-2xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Album Count Badge */}
              <span className="hidden sm:inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 shrink-0">
                {filtered.length} {filtered.length === 1 ? 'album' : 'albums'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Gallery Content ── */}
      <main className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 flex-1 w-full space-y-7">
        {/* Results Counter & Search Indicator */}
        {(search || selectedCategory !== 'all' || selectedType !== 'All') && (
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500 bg-slate-100/70 rounded-xl px-4 py-2 border border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                Found {filtered.length} {filtered.length === 1 ? 'album' : 'albums'}
              </span>
              {search && (
                <span>
                  matching <span className="font-extrabold text-[#0a3871]">"{search}"</span>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="text-slate-400">
                  in {categoryTabs.find((c) => c.id === selectedCategory)?.label}
                </span>
              )}
              {selectedType !== 'All' && (
                <span className="text-slate-400">({selectedType === 'Photo' ? 'Photos only' : 'Videos only'})</span>
              )}
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedType('All');
              }}
              className="text-[#0a3871] font-extrabold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ImageIcon className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-fraunces text-lg font-bold text-slate-800">No Media Albums Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                We could not find any official photo collections or video dispatches matching your current filter.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedType('All');
                setSearch('');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0a3871] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#072a56] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* ── 3-Column Album Cards Grid (Matching Image 2) ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedAlbums.map((item) => (
              <article
                key={item.id}
                onClick={() => setActiveModalItem(item)}
                className="card-soft group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Media Visual Container (Matching Image 2) */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                    <img
                      src={item.src || item.image || '/images/astu-building.jpg'}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                      }}
                    />

                    {/* Translucent Play Circle for Videos (Matching Image 2) */}
                    {item.type === 'Video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[#0a3871] shadow-lg transition-transform group-hover:scale-115">
                          <PlayCircle className="h-7 w-7 fill-white" />
                        </span>
                      </div>
                    )}

                    {/* Category Pill Top Left (Matching Image 2) */}
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm border border-slate-200/60">
                        {item.category || (item.album ? item.album.replace(' Gallery', '') : 'CAMPUS').toUpperCase()}
                      </span>
                    </div>

                    {/* Bottom Right Pill: Photo count or Video duration (Matching Image 2) */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm border border-white/10">
                        {item.type === 'Video' ? (
                          <>
                            <PlayCircle className="h-3 w-3 text-white" />
                            <span>Video • {item.duration || '02:40'}</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-3 w-3 text-white" />
                            <span>{item.photoCount || 12} photos</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Card Body (Matching Image 2: [Album title], [Issuing office] [Date]) */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <h3 className="font-fraunces text-base font-bold text-slate-900 group-hover:text-[#0a3871] transition-colors leading-snug line-clamp-1">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="font-medium text-slate-600 truncate max-w-[170px]">
                        {item.uploadedBy || 'ASTU Office'}
                      </span>
                      <span className="text-slate-400 font-normal shrink-0">
                        {item.date || 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── Page Handler & Load More Controls (Matching Image 2 & User Request) ── */}
        {totalAlbums > 0 && (
          <div className="flex flex-col items-center justify-center space-y-4 pt-4">
            {/* Status counter (Matching Image 2: "Showing 6 of [N] albums") */}
            <p className="text-xs text-slate-500 font-medium">
              Showing{' '}
              <span className="font-bold text-slate-900">
                {paginationMode === 'infinite'
                  ? Math.min(displayedAlbums.length, totalAlbums)
                  : Math.min((currentPage - 1) * pageSize + 1, totalAlbums)}
              </span>
              {paginationMode === 'paged' && (
                <>
                  {' '}to{' '}
                  <span className="font-bold text-slate-900">
                    {Math.min(currentPage * pageSize, totalAlbums)}
                  </span>
                </>
              )}{' '}
              of <span className="font-bold text-slate-900">{totalAlbums}</span> albums
            </p>

            {/* Load more button (Matching Image 2) */}
            {paginationMode === 'infinite' && displayedAlbums.length < totalAlbums && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="rounded-xl border border-[#0a3871] bg-white px-7 py-2.5 text-xs font-bold text-[#0a3871] shadow-2xs hover:bg-[#0a3871] hover:text-white transition-all cursor-pointer"
              >
                Load more
              </button>
            )}

            {/* Full Page Handler (Pagination Pill Bar) */}
            {totalPages > 1 && (
              <div className="card-soft flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-xs">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPaginationMode('paged');
                    handlePageChange(currentPage - 1);
                  }}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${currentPage === 1
                      ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                      : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  title="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1">
                  {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(p);
                    const isActive = pageNum === currentPage && paginationMode === 'paged';
                    return (
                      <button
                        key={`page-${pageNum}`}
                        type="button"
                        onClick={() => {
                          setPaginationMode('paged');
                          handlePageChange(pageNum);
                        }}
                        className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
                            ? 'bg-[#0a3871] text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPaginationMode('paged');
                    handlePageChange(currentPage + 1);
                  }}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${currentPage === totalPages
                      ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                      : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  title="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                {/* Per Page Selector */}
                <div className="ml-2 flex items-center gap-1.5 text-xs text-slate-500 border-l border-slate-200 pl-3">
                  <span className="text-[11px] font-medium hidden sm:inline">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                      setPaginationMode('paged');
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#0a3871] cursor-pointer"
                  >
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── High-Resolution Lightbox / Video Modal ── */}
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
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#0a3871]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#0a3871]">
                    {activeModalItem.album || activeModalItem.category || 'Campus Gallery'}
                  </span>
                  {currentModalIndex >= 0 && (
                    <span className="text-xs text-slate-400 font-medium">
                      Item {currentModalIndex + 1} of {filtered.length}
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-fraunces text-base font-bold text-slate-900">
                  {activeModalItem.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative max-h-[70vh] bg-black flex items-center justify-center select-none">
              {/* Floating Previous Button */}
              {filtered.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevModalItem();
                  }}
                  disabled={currentModalIndex <= 0}
                  aria-label="Previous item"
                  title="Previous item (←)"
                  className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-all ${
                    currentModalIndex <= 0
                      ? 'opacity-25 cursor-not-allowed pointer-events-none'
                      : 'hover:bg-black/90 hover:scale-105 cursor-pointer shadow-lg'
                  }`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Floating Next Button */}
              {filtered.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextModalItem();
                  }}
                  disabled={currentModalIndex >= filtered.length - 1}
                  aria-label="Next item"
                  title="Next item (→)"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-all ${
                    currentModalIndex >= filtered.length - 1
                      ? 'opacity-25 cursor-not-allowed pointer-events-none'
                      : 'hover:bg-black/90 hover:scale-105 cursor-pointer shadow-lg'
                  }`}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              <img
                src={activeModalItem.src || activeModalItem.image || '/images/astu-building.jpg'}
                alt={activeModalItem.title}
                className="max-h-[70vh] w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                }}
              />
              {activeModalItem.type === 'Video' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white pointer-events-none">
                  <PlayCircle className="h-16 w-16 mb-2 text-[#FFD700]" />
                  <p className="text-xs font-semibold">Video preview stream ready</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 text-xs text-slate-500">
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
              <div className="flex items-center gap-2">
                {filtered.length > 1 && (
                  <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-3">
                    <button
                      type="button"
                      onClick={handlePrevModalItem}
                      disabled={currentModalIndex <= 0}
                      className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        currentModalIndex <= 0
                          ? 'opacity-35 cursor-not-allowed bg-slate-100 text-slate-400'
                          : 'bg-white text-slate-700 hover:bg-slate-100 cursor-pointer'
                      }`}
                      title="Previous item"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextModalItem}
                      disabled={currentModalIndex >= filtered.length - 1}
                      className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        currentModalIndex >= filtered.length - 1
                          ? 'opacity-35 cursor-not-allowed bg-slate-100 text-slate-400'
                          : 'bg-white text-slate-700 hover:bg-slate-100 cursor-pointer'
                      }`}
                      title="Next item"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Gallery album link copied!');
                    }
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Share
                </button>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="rounded-lg bg-[#0a3871] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#072a56] transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RAG Copilot Assistant */}
      <ChatBot />
    </div>
  );
}
