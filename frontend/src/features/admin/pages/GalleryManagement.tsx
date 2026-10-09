import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  Film,
  FolderPlus,
  GraduationCap,
  Image as ImageIcon,
  ImagePlus,
  Microscope,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  X,
  XCircle,
  Zap,
  Home,
  FileText,
  Layers,
  Palette,
  Check,
  Building2,
  FolderOpen,
  ArrowRight,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';
import ImageUploader from '../components/ImageUploader';
import GalleryItemModal, { GalleryMediaItem } from '../components/GalleryItemModal';
import homepageCmsService from '../services/homepageCms.service';
import gallerySettingsService, {
  GalleryPageSettings,
  GalleryDetailSection,
  defaultGallerySettings,
  defaultGalleryDetailSections,
} from '../services/gallerySettings.service';

type GalleryStatus = 'Approved' | 'Pending Review' | 'Rejected';

interface Album {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  bg: string;
}

const GALLERY_STORAGE_KEY = 'astu_ams_cms_gallery_items';

const albums: Album[] = [
  { name: 'Event Gallery', icon: ImageIcon, tone: 'text-[#003580]', bg: 'bg-[#003580]/10' },
  { name: 'Workshop Gallery', icon: Film, tone: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10' },
  { name: 'Graduation Gallery', icon: GraduationCap, tone: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10' },
  { name: 'Campus Gallery', icon: ImagePlus, tone: 'text-violet-600', bg: 'bg-violet-500/10' },
  { name: 'Research Gallery', icon: Microscope, tone: 'text-cyan-700', bg: 'bg-cyan-500/10' },
];

const QUICK_PRESETS = [
  { label: 'ASTU Main Building', url: '/images/astu-building.jpg' },
  { label: 'ARC Research Lab', url: '/images/arc.jpg' },
  { label: 'Campus Walkway', url: '/images/campus-2.jpeg' },
  { label: 'Graduation Main Stage', url: '/images/gc7.jpg' },
  { label: 'Electronics Lab', url: '/images/electriclabs.jpeg' },
  { label: 'State-M Center', url: '/images/State-M.jpg' },
];

const initialMedia: GalleryMediaItem[] = [
  {
    id: 'M-001',
    title: 'AI Workshop Opening Session',
    type: 'Video',
    album: 'Workshop Gallery',
    status: 'Approved',
    uploadedBy: 'CSE Department',
    date: '2 days ago',
    src: '/images/electriclabs.jpeg',
    description: 'Keynote and lab demonstration on generative AI architectures for engineering faculty.',
  },
  {
    id: 'M-002',
    title: '2026 Graduation Main Stage',
    type: 'Photo',
    album: 'Graduation Gallery',
    status: 'Approved',
    uploadedBy: 'Registrar Office',
    date: '1 week ago',
    src: '/images/gc7.jpg',
    description: 'Valedictorian convocation and honorary degree awards ceremony.',
  },
  {
    id: 'M-003',
    title: 'Research Expo Robotics Booth',
    type: 'Photo',
    album: 'Research Gallery',
    status: 'Approved',
    uploadedBy: 'Research Directorate',
    date: '3 days ago',
    src: '/images/arc.jpg',
    description: 'Autonomous rover and IoT agricultural sensory demonstration by ASTU students.',
  },
  {
    id: 'M-004',
    title: 'Alumni Career Day Panel',
    type: 'Video',
    album: 'Event Gallery',
    status: 'Approved',
    uploadedBy: 'Alumni Office',
    date: '5 hours ago',
    src: '/images/campus-2.jpeg',
    description: 'Senior alumni in fintech and telecommunications mentoring 2026 graduates.',
  },
  {
    id: 'M-005',
    title: 'Campus Library Renovation',
    type: 'Photo',
    album: 'Campus Gallery',
    status: 'Approved',
    uploadedBy: 'Public Relations',
    date: '1 day ago',
    src: '/images/astu-building.jpg',
    description: 'Modernized study commons with 10Gbps fiber connectivity and digital journal terminals.',
  },
  {
    id: 'M-006',
    title: 'Engineering Fair 2026',
    type: 'Photo',
    album: 'Event Gallery',
    status: 'Approved',
    uploadedBy: 'Engineering Faculty',
    date: '2 weeks ago',
    src: '/images/State-M.jpg',
    description: 'Over 40 senior capstone projects evaluated by national industrial partners.',
  },
  {
    id: 'M-007',
    title: 'Cloud Computing Workshop',
    type: 'Video',
    album: 'Workshop Gallery',
    status: 'Pending Review',
    uploadedBy: 'ICT Directorate',
    date: '30 min ago',
    src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
    description: 'Hands-on serverless computing and distributed database deployment session.',
  },
  {
    id: 'M-008',
    title: 'Campus Aerial Drone Footage',
    type: 'Video',
    album: 'Campus Gallery',
    status: 'Approved',
    uploadedBy: 'Marketing Team',
    date: '1 month ago',
    src: '/images/campus-2.jpeg',
    description: 'Full 4K drone flyover highlighting modern architecture and green campus spaces.',
  },
];

const statusClasses: Record<GalleryStatus, string> = {
  Approved: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  'Pending Review': 'border-[#E8A020]/20 bg-[#E8A020]/10 text-[#B87900]',
  Rejected: 'border-[#E24B4A]/20 bg-[#E24B4A]/10 text-[#E24B4A]',
};

export default function GalleryManagement({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  // Main Tab Navigation
  const [activeMainTab, setActiveMainTab] = useState<'media' | 'customizer'>('media');

  // Customizer Sub-tabs
  const [customizerSubTab, setCustomizerSubTab] = useState<'home' | 'banner' | 'detail'>('home');

  // Preview Mode
  const [previewMode, setPreviewMode] = useState<'home' | 'banner' | 'detail'>('home');

  // Media Items State
  const [media, setMedia] = useState<GalleryMediaItem[]>(() => {
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ({
            ...item,
            src: item.src || initialMedia[idx % initialMedia.length]?.src || '/images/astu-building.jpg',
          }));
        }
      }
    } catch {}
    return initialMedia;
  });

  const [activeAlbum, setActiveAlbum] = useState('Event Gallery');
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | GalleryStatus>('all');
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [uploadedSrc, setUploadedSrc] = useState('');

  // Total Focus Mode Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [activeModalData, setActiveModalData] = useState<Partial<GalleryMediaItem> | null>(null);

  // Gallery CMS Settings State (Side-by-Side Live Customizer)
  const [settings, setSettings] = useState<GalleryPageSettings>(() =>
    gallerySettingsService.getSettings()
  );

  // Sync media items to LocalStorage and Homepage CMS
  useEffect(() => {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(media));

    const approvedGallery = media
      .filter((m) => m.status === 'Approved')
      .map((m) => ({
        id: m.id,
        title: m.title,
        src:
          m.src ||
          (m.type === 'Video'
            ? 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80'
            : '/images/astu-building.jpg'),
        album: m.album,
        active: true,
      }));

    const cmsSettings = homepageCmsService.getSettings();
    if (cmsSettings) {
      homepageCmsService.saveSettings({ ...cmsSettings, gallery: approvedGallery });
    }

    window.dispatchEvent(new Event('astu-cms-gallery-changed'));
    window.dispatchEvent(new Event('astu-cms-homepage-updated'));
  }, [media]);

  // Open Focus Modal in "Add" mode
  const handleOpenAddModal = () => {
    setItemModalMode('add');
    setActiveModalData({
      album: activeAlbum,
      type: 'Photo',
      status: 'Approved',
      uploadedBy: 'Content Manager',
      src: '/images/astu-building.jpg',
    });
    setIsItemModalOpen(true);
  };

  // Open Focus Modal in "Edit" mode
  const handleOpenEditModal = (item: GalleryMediaItem) => {
    setItemModalMode('edit');
    setActiveModalData({ ...item });
    setIsItemModalOpen(true);
  };

  // Open Focus Modal in "View" mode
  const handleOpenViewModal = (item: GalleryMediaItem) => {
    setItemModalMode('view');
    setActiveModalData({ ...item });
    setIsItemModalOpen(true);
  };

  // Save handler from Focus Modal
  const handleSaveModalData = (data: Partial<GalleryMediaItem>) => {
    if (itemModalMode === 'add') {
      const newItem: GalleryMediaItem = {
        id: `M-${Date.now().toString().slice(-4)}`,
        title: data.title || 'Untitled Media Item',
        type: data.type || 'Photo',
        album: data.album || activeAlbum,
        status: data.status || 'Approved',
        uploadedBy: data.uploadedBy || 'Content Manager',
        date: 'Just now',
        src: data.src || '/images/astu-building.jpg',
        description: data.description || '',
      };
      setMedia((prev) => [newItem, ...prev]);
      toast.success(`"${newItem.title}" added to gallery & saved!`);
    } else if (itemModalMode === 'edit' && activeModalData?.id) {
      setMedia((prev) =>
        prev.map((item) =>
          item.id === activeModalData.id ? { ...item, ...data } as GalleryMediaItem : item
        )
      );
      toast.success(`Updated "${data.title || activeModalData.title}"`);
    }
    setIsItemModalOpen(false);
  };

  const handleUploadQuickMedia = (dataUrl: string) => {
    if (!dataUrl) return;
    const mediaTitle = prompt(`Enter title for new ${activeAlbum} item:`, `${activeAlbum} Showcase`);
    if (!mediaTitle) return;

    const newItem: GalleryMediaItem = {
      id: `M-${Date.now().toString().slice(-4)}`,
      title: mediaTitle.trim(),
      type: dataUrl.startsWith('data:video') ? 'Video' : 'Photo',
      album: activeAlbum,
      status: 'Approved',
      uploadedBy: 'Content Manager',
      date: 'Just now',
      src: dataUrl,
    };

    setMedia((prev) => [newItem, ...prev]);
    setUploadedSrc('');
    toast.success(`"${newItem.title}" uploaded to ${activeAlbum}!`);
  };

  const filteredMedia = useMemo(() => {
    let items = media.filter((m) => m.album === activeAlbum);
    if (selectedTab !== 'all') {
      items = items.filter((m) => m.status === selectedTab);
    }
    if (search.trim()) {
      items = items.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    }
    return items;
  }, [media, activeAlbum, selectedTab, search]);

  const albumStats = useMemo(() => {
    const items = media.filter((m) => m.album === activeAlbum);
    return {
      total: items.length,
      approved: items.filter((m) => m.status === 'Approved').length,
      pending: items.filter((m) => m.status === 'Pending Review').length,
      rejected: items.filter((m) => m.status === 'Rejected').length,
    };
  }, [media, activeAlbum]);

  const totalOverall = useMemo(() => media.length, [media]);
  const approvedOverall = useMemo(() => media.filter((m) => m.status === 'Approved').length, [media]);
  const pendingOverall = useMemo(() => media.filter((m) => m.status === 'Pending Review').length, [media]);

  const changeStatus = useCallback(
    (id: string, newStatus: GalleryStatus) => {
      setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
      const item = media.find((m) => m.id === id);
      toast.success(`"${item?.title}" → ${newStatus}`);
    },
    [media]
  );

  const deleteMedia = useCallback(
    (id: string) => {
      const item = media.find((m) => m.id === id);
      if (confirm(`Are you sure you want to delete "${item?.title}"?`)) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
        toast.success(`"${item?.title}" deleted`);
      }
    },
    [media]
  );

  const createAlbum = useCallback(() => {
    if (!newAlbumName.trim()) {
      toast.error('Album name is required');
      return;
    }
    toast.success(`Album "${newAlbumName.trim()}" created`);
    setActiveAlbum(newAlbumName.trim());
    setNewAlbumName('');
    setShowCreateAlbum(false);
  }, [newAlbumName]);

  // Save Settings from Customizer
  const handleSaveSettings = () => {
    gallerySettingsService.saveSettings(settings);
    toast.success('Live Gallery configuration saved to CMS & synchronized!');
  };

  // Reset Settings
  const handleResetSettings = () => {
    if (confirm('Reset gallery settings back to official system defaults?')) {
      const res = gallerySettingsService.resetToDefaults();
      setSettings(res);
      toast.success('Reset gallery settings to defaults');
    }
  };

  // Detail section management
  const handleAddDetailSection = () => {
    const newSec: GalleryDetailSection = {
      id: `SEC-G${Date.now().toString().slice(-4)}`,
      heading: 'New Exhibition Section',
      body: 'Detailed archival description and institutional significance of these collections.',
      active: true,
    };
    setSettings((prev) => ({
      ...prev,
      detailSections: [...prev.detailSections, newSec],
    }));
  };

  const handleUpdateDetailSection = (id: string, field: 'heading' | 'body' | 'active', value: any) => {
    setSettings((prev) => ({
      ...prev,
      detailSections: prev.detailSections.map((sec) =>
        sec.id === id ? { ...sec, [field]: value } : sec
      ),
    }));
  };

  const handleDeleteDetailSection = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      detailSections: prev.detailSections.filter((sec) => sec.id !== id),
    }));
  };

  const tabs = [
    { key: 'all' as const, label: 'All', count: albumStats.total },
    { key: 'Approved' as const, label: 'Approved', count: albumStats.approved },
    { key: 'Pending Review' as const, label: 'Pending', count: albumStats.pending },
    { key: 'Rejected' as const, label: 'Rejected', count: albumStats.rejected },
  ];

  const approvedMediaPreview = useMemo(() => {
    return media.filter((m) => m.status === 'Approved').slice(0, 3);
  }, [media]);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fade-up 0.35s ease-out both; }
      `}</style>

      {/* Page Header */}
      {!hideHeader && (
        <AdminPageHeader
          title="ASTU Gallery & Media Center"
          subtitle="Full-spectrum visual asset management for campus exhibitions, homepage showcase, and public detail galleries."
          breadcrumbs={[{ label: 'CMS' }, { label: 'Media & Gallery' }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.open('/gallery', '_blank')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#003580]" />
                Public /gallery
              </button>
              <button
                onClick={() => window.open('/info/gallery', '_blank')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                Detail /info/gallery
              </button>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110"
              >
                <Plus className="h-4 w-4" />
                Add New Media
              </button>
            </div>
          }
        />
      )}

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex">
          <button
            onClick={() => setActiveMainTab('media')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
              activeMainTab === 'media'
                ? 'border-[#003580] text-[#003580] dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Media Items & Albums
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {media.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('customizer')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
              activeMainTab === 'customizer'
                ? 'border-[#003580] text-[#003580] dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Live Page Customizer & Live Preview
            <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Side-by-Side CMS
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {hideHeader && (
            <>
              <button
                type="button"
                onClick={() => window.open('/gallery', '_blank')}
                className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#003580]" />
                /gallery
              </button>
              <button
                type="button"
                onClick={() => window.open('/info/gallery', '_blank')}
                className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                /info/gallery
              </button>
            </>
          )}
          {activeMainTab === 'media' && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#003580] to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Media Item
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEDIA ITEMS & ALBUMS                                              */}
      {/* ========================================================================= */}
      {activeMainTab === 'media' && (
        <div className="space-y-6">
          {/* Executive Metrics Overview */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Media Files</span>
              <p className="mt-1 text-2xl font-black text-[#003580] dark:text-blue-400">{totalOverall}</p>
              <span className="text-[10px] text-slate-400">Indexed in archive</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Approved & Live</span>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{approvedOverall}</p>
              <span className="text-[10px] text-emerald-600">Visible on public sites</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pending Review</span>
              <p className="mt-1 text-2xl font-black text-amber-500 dark:text-amber-400">{pendingOverall}</p>
              <span className="text-[10px] text-amber-600">Requires verification</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Active Albums</span>
              <p className="mt-1 text-2xl font-black text-violet-600 dark:text-violet-400">{albums.length}</p>
              <span className="text-[10px] text-slate-400">Curated categories</span>
            </div>
          </section>

          {/* Album Selector Grid */}
          <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-5">
            {albums.map((album) => {
              const Icon = album.icon;
              const active = activeAlbum === album.name;
              const count = media.filter((m) => m.album === album.name).length;
              const pending = media.filter(
                (m) => m.album === album.name && m.status === 'Pending Review'
              ).length;
              return (
                <button
                  key={album.name}
                  type="button"
                  onClick={() => setActiveAlbum(album.name)}
                  className={`fade-up rounded-2xl border p-4 text-left shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                    active
                      ? 'border-[#003580] bg-blue-50/50 ring-2 ring-[#003580]/20 dark:border-blue-500 dark:bg-blue-950/20'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${album.bg} ${album.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {pending > 0 && (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        {pending} pending
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                    {album.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{count} media files</p>
                </button>
              );
            })}
            <button
              onClick={() => setShowCreateAlbum(!showCreateAlbum)}
              className="fade-up flex min-h-[100px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-left transition-all hover:border-[#003580]/40 hover:bg-[#003580]/5 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/40 cursor-pointer"
            >
              <Plus className="h-5 w-5 text-slate-400" />
              <span className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                + New Album
              </span>
            </button>
          </section>

          {showCreateAlbum && (
            <div className="fade-up flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <input
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="Enter new album name (e.g. Student Hackathon 2026)"
                className="flex-1 rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                onClick={createAlbum}
                className="rounded-xl bg-[#003580] px-5 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110"
              >
                Create Album
              </button>
              <button
                onClick={() => setShowCreateAlbum(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Quick Upload Panel & Media Table */}
          <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
            {/* Quick Upload & Stats */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Quick Upload to {activeAlbum}
                  </h2>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#003580]">
                    Direct Live
                  </span>
                </div>
                <p className="mb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Upload high-res photography or video. Items immediately link to the active exhibition album.
                </p>
                <ImageUploader
                  label={`Drop photo or video for ${activeAlbum}`}
                  value={uploadedSrc}
                  onChange={handleUploadQuickMedia}
                />
              </div>

              {/* Album Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-3">
                  <FolderPlus className="h-4 w-4 text-[#003580]" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeAlbum} Stats
                  </h2>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Total In Album', value: albumStats.total, color: 'text-[#003580]' },
                    { label: 'Approved & Public', value: albumStats.approved, color: 'text-emerald-600' },
                    { label: 'Pending Review', value: albumStats.pending, color: 'text-amber-600' },
                    { label: 'Rejected', value: albumStats.rejected, color: 'text-rose-600' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-slate-800/60"
                    >
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {stat.label}
                      </span>
                      <span className={`text-sm font-black ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Review List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeAlbum} — Media Exhibition Review
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Approve, edit, or launch the dedicated focus modal for full-resolution review.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search items..."
                      className="w-44 rounded-xl border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedTab(tab.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedTab === tab.key
                        ? 'bg-[#003580] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${
                        selectedTab === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Media List Rows */}
              <div className="mt-4 space-y-2.5">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-white p-3.5 transition-all hover:border-[#003580]/40 hover:shadow-xs dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <div
                        onClick={() => handleOpenViewModal(item)}
                        className="group relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700"
                      >
                        <img
                          src={item.src || '/images/astu-building.jpg'}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                        {item.type === 'Video' && (
                          <span className="absolute bottom-1 right-1 rounded-sm bg-black/70 px-1 py-0.2 text-[8px] font-bold text-white">
                            VID
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            onClick={() => handleOpenViewModal(item)}
                            className="truncate text-sm font-bold text-slate-900 hover:text-[#003580] cursor-pointer dark:text-white"
                          >
                            {item.title}
                          </h3>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.type}
                          </span>
                          <span>•</span>
                          <span>{item.uploadedBy}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Actions */}
                    <div className="flex shrink-0 items-center gap-2 justify-between sm:justify-end">
                      <span
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                          statusClasses[item.status]
                        }`}
                      >
                        {item.status === 'Approved' && (
                          <CheckCircle2 className="mr-1 inline h-3 w-3" />
                        )}
                        {item.status === 'Pending Review' && (
                          <Eye className="mr-1 inline h-3 w-3" />
                        )}
                        {item.status === 'Rejected' && (
                          <XCircle className="mr-1 inline h-3 w-3" />
                        )}
                        {item.status}
                      </span>

                      <div className="flex items-center gap-1">
                        {item.status === 'Pending Review' && (
                          <>
                            <button
                              onClick={() => changeStatus(item.id, 'Approved')}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100"
                              title="Approve Media"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => changeStatus(item.id, 'Rejected')}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-all hover:bg-rose-100"
                              title="Reject Media"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {/* VIEW IN DEDICATED TOTAL FOCUS MODAL */}
                        <button
                          onClick={() => handleOpenViewModal(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-blue-50 hover:text-[#003580] hover:border-[#003580]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          title="View Media in Total Focus Mode"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* EDIT IN DEDICATED TOTAL FOCUS MODAL */}
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-blue-50 hover:text-[#003580] hover:border-[#003580]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          title="Edit Media Item"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMedia(item.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition-all hover:bg-rose-100"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMedia.length === 0 && (
                  <div className="py-12 text-center">
                    <ImagePlus className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No media found in this album
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click "+ Add New Media" or drag-and-drop a file to upload.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE PAGE CUSTOMIZER & SIDE-BY-SIDE LIVE PREVIEW                   */}
      {/* ========================================================================= */}
      {activeMainTab === 'customizer' && (
        <div className="space-y-6">
          {/* Customizer Sub-tab selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomizerSubTab('home');
                  setPreviewMode('home');
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  customizerSubTab === 'home'
                    ? 'bg-[#003580] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                1. Homepage Gallery Section
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomizerSubTab('banner');
                  setPreviewMode('banner');
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  customizerSubTab === 'banner'
                    ? 'bg-[#003580] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                2. Public /gallery Banner Page
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomizerSubTab('detail');
                  setPreviewMode('detail');
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  customizerSubTab === 'detail'
                    ? 'bg-[#003580] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                3. Detail /info/gallery Page
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
              >
                <Save className="h-3.5 w-3.5" />
                Save Changes to CMS
              </button>
              <button
                type="button"
                onClick={handleResetSettings}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>
            </div>
          </div>

          {/* SIDE-BY-SIDE TWO COLUMN LAYOUT */}
          <div className="grid gap-6 xl:grid-cols-12 items-start">
            {/* LEFT COLUMN: CUSTOMIZATION CONTROLS (6 COLS) */}
            <div className="space-y-6 xl:col-span-6">
              {/* SUB-SECTION 1: HOMEPAGE GALLERY SECTION */}
              {customizerSubTab === 'home' && (
                <div className="fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#003580] dark:bg-blue-950/40 dark:text-blue-300">
                      HOMEPAGE COMPONENT
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-2 dark:text-white">
                      Homepage Gallery Section Customizer
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Controls the preview gallery section directly displayed on the ASTU Homepage.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Section Eyebrow Badge
                      </label>
                      <input
                        type="text"
                        value={settings.homeEyebrow}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, homeEyebrow: e.target.value }))
                        }
                        placeholder="Campus Gallery"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Main Section Heading Title
                      </label>
                      <input
                        type="text"
                        value={settings.homeTitle}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, homeTitle: e.target.value }))
                        }
                        placeholder="Campus Life & Moments"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Section Subtitle / Description
                      </label>
                      <textarea
                        rows={3}
                        value={settings.homeSubtitle}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, homeSubtitle: e.target.value }))
                        }
                        placeholder="A glimpse of life at ASTU — research, innovation, graduation ceremonies..."
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Section Background Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.homeBgColor === 'transparent' ? '#ffffff' : settings.homeBgColor}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, homeBgColor: e.target.value }))
                            }
                            className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 p-1"
                          />
                          <input
                            type="text"
                            value={settings.homeBgColor}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, homeBgColor: e.target.value }))
                            }
                            placeholder="transparent or #ffffff"
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSettings((p) => ({ ...p, homeBgColor: 'transparent' }))}
                            className="text-[10px] text-blue-600 hover:underline"
                          >
                            Set Transparent
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettings((p) => ({ ...p, homeBgColor: '#f8fafc' }))}
                            className="text-[10px] text-blue-600 hover:underline"
                          >
                            Light Slate (#f8fafc)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Action Button Text
                        </label>
                        <input
                          type="text"
                          value={settings.homeButtonText}
                          onChange={(e) =>
                            setSettings((p) => ({ ...p, homeButtonText: e.target.value }))
                          }
                          placeholder="View All Gallery"
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Button Target Link
                      </label>
                      <input
                        type="text"
                        value={settings.homeButtonLink}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, homeButtonLink: e.target.value }))
                        }
                        placeholder="/gallery or /info/gallery"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 2: PUBLIC /GALLERY BANNER PAGE */}
              {customizerSubTab === 'banner' && (
                <div className="fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      PUBLIC ARCHIVE PAGE (/gallery)
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-2 dark:text-white">
                      Public /gallery Banner & Search Customizer
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Customizes the hero banner, background colors, and search placeholders on the standalone /gallery page.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Header Badge / Sub-category
                      </label>
                      <input
                        type="text"
                        value={settings.bannerBadge}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, bannerBadge: e.target.value }))
                        }
                        placeholder="Official Campus Media Archive"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Gallery Main Banner Title
                      </label>
                      <input
                        type="text"
                        value={settings.bannerTitle}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, bannerTitle: e.target.value }))
                        }
                        placeholder="ASTU Media & Photo Gallery"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Gallery Banner Subtitle
                      </label>
                      <textarea
                        rows={3}
                        value={settings.bannerSubtitle}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, bannerSubtitle: e.target.value }))
                        }
                        placeholder="Visual showcases, event archives, research expos..."
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Banner Background Color (Hex)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.bannerBgColor || '#003580'}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, bannerBgColor: e.target.value }))
                            }
                            className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 p-1"
                          />
                          <input
                            type="text"
                            value={settings.bannerBgColor}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, bannerBgColor: e.target.value }))
                            }
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={settings.showBannerImage}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, showBannerImage: e.target.checked }))
                            }
                            className="h-4 w-4 rounded text-[#003580]"
                          />
                          Show Background Banner Image
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Banner Background Image URL
                      </label>
                      <input
                        type="text"
                        value={settings.bannerImage}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, bannerImage: e.target.value }))
                        }
                        placeholder="/images/astu-building.jpg or URL"
                        className="mb-2 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      {/* Presets */}
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {QUICK_PRESETS.map((p) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => setSettings((prev) => ({ ...prev, bannerImage: p.url }))}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#003580]"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <ImageUploader
                        label="Upload / Replace Public Gallery Banner"
                        value={settings.bannerImage}
                        onChange={(bannerImage) =>
                          setSettings((p) => ({ ...p, bannerImage }))
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Search Bar Placeholder
                      </label>
                      <input
                        type="text"
                        value={settings.searchPlaceholder}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, searchPlaceholder: e.target.value }))
                        }
                        placeholder="Search gallery by title, album, or department..."
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 3: DETAIL /INFO/GALLERY PAGE */}
              {customizerSubTab === 'detail' && (
                <div className="fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                      HYPERLINK DETAIL PAGE (/info/gallery)
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-2 dark:text-white">
                      Detail Page Hero & Sections Customizer
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Configures the rich exhibition overview page at /info/gallery with customized hero banner and dynamic article sections.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Detail Page Badge
                      </label>
                      <input
                        type="text"
                        value={settings.detailBadge}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, detailBadge: e.target.value }))
                        }
                        placeholder="Campus Exhibition Archive"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Detail Page Main Title
                      </label>
                      <input
                        type="text"
                        value={settings.detailTitle}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, detailTitle: e.target.value }))
                        }
                        placeholder="ASTU Museums, Archives & Exhibition Galleries"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Detail Page Subtitle
                      </label>
                      <textarea
                        rows={3}
                        value={settings.detailSubtitle}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, detailSubtitle: e.target.value }))
                        }
                        placeholder="Explore the visual heritage, technological breakthroughs, architectural landmarks..."
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Detail Hero Image
                      </label>
                      <input
                        type="text"
                        value={settings.detailHeroImage}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, detailHeroImage: e.target.value }))
                        }
                        placeholder="/images/arc.jpg"
                        className="mb-2 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {QUICK_PRESETS.map((p) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => setSettings((prev) => ({ ...prev, detailHeroImage: p.url }))}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#003580]"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <ImageUploader
                        label="Upload / Replace Detail Page Hero Image"
                        value={settings.detailHeroImage}
                        onChange={(detailHeroImage) =>
                          setSettings((p) => ({ ...p, detailHeroImage }))
                        }
                      />
                    </div>

                    {/* Dynamic Detail Content Sections */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Exhibition Content Sections ({settings.detailSections.length})
                        </label>
                        <button
                          type="button"
                          onClick={handleAddDetailSection}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#003580] hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                        >
                          <Plus className="h-3 w-3" /> Add Section
                        </button>
                      </div>

                      <div className="space-y-3">
                        {settings.detailSections.map((sec, idx) => (
                          <div
                            key={sec.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 dark:border-slate-700 dark:bg-slate-800/40"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-slate-400">
                                Section #{idx + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={sec.active !== false}
                                    onChange={(e) =>
                                      handleUpdateDetailSection(sec.id, 'active', e.target.checked)
                                    }
                                    className="h-3.5 w-3.5 rounded text-[#003580]"
                                  />
                                  Active
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDetailSection(sec.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  title="Delete Section"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={sec.heading}
                              onChange={(e) =>
                                handleUpdateDetailSection(sec.id, 'heading', e.target.value)
                              }
                              placeholder="Section Heading..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            />

                            <textarea
                              rows={2}
                              value={sec.body}
                              onChange={(e) =>
                                handleUpdateDetailSection(sec.id, 'body', e.target.value)
                              }
                              placeholder="Section body description..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: INTERACTIVE SIDE-BY-SIDE LIVE PREVIEW (6 COLS) */}
            <div className="xl:col-span-6 xl:sticky xl:top-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* Preview Header & Switcher */}
                <div className="mb-4 flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Live Real-Time Simulation
                    </span>
                  </div>

                  <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('home')}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                        previewMode === 'home'
                          ? 'bg-white text-[#003580] shadow-2xs dark:bg-slate-700 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Homepage
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('banner')}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                        previewMode === 'banner'
                          ? 'bg-white text-[#003580] shadow-2xs dark:bg-slate-700 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      /gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('detail')}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                        previewMode === 'detail'
                          ? 'bg-white text-[#003580] shadow-2xs dark:bg-slate-700 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      /info/gallery
                    </button>
                  </div>
                </div>

                {/* SIMULATION 1: HOMEPAGE GALLERY SECTION */}
                {previewMode === 'home' && (
                  <div
                    className="fade-up rounded-2xl border border-slate-200/80 p-5 transition-all"
                    style={{
                      backgroundColor:
                        settings.homeBgColor && settings.homeBgColor !== 'transparent'
                          ? settings.homeBgColor
                          : '#ffffff',
                    }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-rose-600">
                        <ImageIcon className="h-3 w-3" /> {settings.homeEyebrow || 'Campus Gallery'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Homepage Component</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 leading-snug">
                      {settings.homeTitle || 'Campus Life & Moments'}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-md">
                      {settings.homeSubtitle ||
                        'A glimpse of life at ASTU — research, innovation, graduation ceremonies, and alumni milestones.'}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Showing 3 preview cards
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white shadow-xs">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {settings.homeButtonText || 'View All Gallery'}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>

                    {/* Simulated 3 Cards */}
                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      {approvedMediaPreview.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-2xs group aspect-[4/3]"
                        >
                          <img
                            src={item.src || '/images/astu-building.jpg'}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-1.5 left-1.5 right-1.5">
                            <p className="text-[10px] font-bold text-white truncate">{item.title}</p>
                            <span className="text-[8px] text-white/70">{item.album}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-center">
                      <a
                        href="/#gallery"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003580] hover:underline"
                      >
                        Inspect live section on Homepage <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* SIMULATION 2: PUBLIC /GALLERY PAGE */}
                {previewMode === 'banner' && (
                  <div className="fade-up space-y-4">
                    {/* Hero Banner Simulation */}
                    <div
                      className="relative overflow-hidden rounded-2xl p-6 text-white shadow-md"
                      style={{ backgroundColor: settings.bannerBgColor || '#003580' }}
                    >
                      {settings.showBannerImage && settings.bannerImage && (
                        <div className="absolute inset-0 z-0 opacity-25">
                          <img
                            src={settings.bannerImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                            <ImageIcon className="h-4 w-4 text-white" />
                          </span>
                          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                            {settings.bannerBadge || 'Campus Archive'}
                          </span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight drop-shadow-xs">
                          {settings.bannerTitle || 'ASTU Media & Photo Gallery'}
                        </h3>
                        <p className="text-xs text-blue-100 leading-relaxed max-w-sm">
                          {settings.bannerSubtitle ||
                            'Visual showcases, event archives, research expos, and graduation ceremonies.'}
                        </p>
                      </div>
                    </div>

                    {/* Search simulation */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <span>{settings.searchPlaceholder || 'Search gallery...'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        Albums: Event, Workshop, Graduation, Campus, Research
                      </span>
                      <a
                        href="/gallery"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003580] hover:underline"
                      >
                        Open /gallery in new tab <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* SIMULATION 3: DETAIL /INFO/GALLERY PAGE */}
                {previewMode === 'detail' && (
                  <div className="fade-up space-y-4">
                    {/* Detail Hero Header */}
                    <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white min-h-[140px] p-5 flex flex-col justify-end">
                      {settings.detailHeroImage && (
                        <img
                          src={settings.detailHeroImage}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-35"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="relative z-10 space-y-1">
                        <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-300">
                          {settings.detailBadge || 'Campus Exhibition Archive'}
                        </span>
                        <h4 className="text-base font-black text-white">
                          {settings.detailTitle || 'ASTU Exhibition Galleries'}
                        </h4>
                        <p className="text-[11px] text-slate-300 line-clamp-2">
                          {settings.detailSubtitle}
                        </p>
                      </div>
                    </div>

                    {/* Detail Sections Preview */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Article Content Preview
                      </span>
                      {settings.detailSections
                        .filter((s) => s.active !== false)
                        .map((s, idx) => (
                          <div
                            key={s.id || idx}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1"
                          >
                            <h5 className="text-xs font-bold text-[#003580]">{s.heading}</h5>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {s.body}
                            </p>
                          </div>
                        ))}
                    </div>

                    <div className="pt-2 text-right">
                      <a
                        href="/info/gallery"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003580] hover:underline"
                      >
                        Open /info/gallery in new tab <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOTAL FOCUS MODE MODAL: ADD / EDIT / VIEW WITH ASTU LOGO BANNER            */}
      {/* ========================================================================= */}
      <GalleryItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveModalData}
        onSwitchToEdit={() => setItemModalMode('edit')}
        initialData={activeModalData}
        mode={itemModalMode}
        albumsList={albums.map((a) => a.name)}
      />
    </div>
  );
}
