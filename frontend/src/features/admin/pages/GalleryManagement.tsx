import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Eye,
  Film,
  FolderPlus,
  GraduationCap,
  Image,
  ImagePlus,
  Microscope,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';
import ImageUploader from '../components/ImageUploader';
import homepageCmsService from '../services/homepageCms.service';

type GalleryStatus = 'Approved' | 'Pending Review' | 'Rejected';

interface Album {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  bg: string;
}

interface MediaItem {
  id: string;
  title: string;
  type: 'Photo' | 'Video';
  album: string;
  status: GalleryStatus;
  uploadedBy: string;
  date: string;
  src?: string;
}

const GALLERY_STORAGE_KEY = 'astu_ams_cms_gallery_items';

const albums: Album[] = [
  { name: 'Event Gallery', icon: Image, tone: 'text-[#003580]', bg: 'bg-[#003580]/10' },
  { name: 'Workshop Gallery', icon: Film, tone: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10' },
  { name: 'Graduation Gallery', icon: GraduationCap, tone: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10' },
  { name: 'Campus Gallery', icon: ImagePlus, tone: 'text-violet-600', bg: 'bg-violet-500/10' },
  { name: 'Research Gallery', icon: Microscope, tone: 'text-cyan-700', bg: 'bg-cyan-500/10' },
];

const initialMedia: MediaItem[] = [
  { id: 'M-001', title: 'AI Workshop Opening Session', type: 'Video', album: 'Workshop Gallery', status: 'Pending Review', uploadedBy: 'CSE Department', date: '2 days ago' },
  { id: 'M-002', title: '2026 Graduation Main Stage', type: 'Photo', album: 'Graduation Gallery', status: 'Approved', uploadedBy: 'Registrar Office', date: '1 week ago' },
  { id: 'M-003', title: 'Research Expo Robotics Booth', type: 'Photo', album: 'Research Gallery', status: 'Approved', uploadedBy: 'Research Directorate', date: '3 days ago' },
  { id: 'M-004', title: 'Alumni Career Day Panel', type: 'Video', album: 'Event Gallery', status: 'Pending Review', uploadedBy: 'Alumni Office', date: '5 hours ago' },
  { id: 'M-005', title: 'Campus Library Renovation', type: 'Photo', album: 'Campus Gallery', status: 'Rejected', uploadedBy: 'Public Relations', date: '1 day ago' },
  { id: 'M-006', title: 'Engineering Fair 2026', type: 'Photo', album: 'Event Gallery', status: 'Approved', uploadedBy: 'Engineering Faculty', date: '2 weeks ago' },
  { id: 'M-007', title: 'Cloud Computing Workshop', type: 'Video', album: 'Workshop Gallery', status: 'Pending Review', uploadedBy: 'ICT Directorate', date: '30 min ago' },
  { id: 'M-008', title: 'Campus Aerial Drone Footage', type: 'Video', album: 'Campus Gallery', status: 'Approved', uploadedBy: 'Marketing Team', date: '1 month ago' },
];

const statusClasses: Record<GalleryStatus, string> = {
  Approved: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  'Pending Review': 'border-[#E8A020]/20 bg-[#E8A020]/10 text-[#B87900]',
  Rejected: 'border-[#E24B4A]/20 bg-[#E24B4A]/10 text-[#E24B4A]',
};

export default function GalleryManagement() {
  const [media, setMedia] = useState<MediaItem[]>(() => {
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return initialMedia;
  });

  const [activeAlbum, setActiveAlbum] = useState('Event Gallery');
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | GalleryStatus>('all');
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [uploadedSrc, setUploadedSrc] = useState('');

  useEffect(() => {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(media));

    const approvedGallery = media
      .filter((m) => m.status === 'Approved')
      .map((m) => ({
        id: m.id,
        title: m.title,
        src: m.src || (m.type === 'Video' ? 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80' : '/images/astu-building.jpg'),
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

  const handleUploadNewMedia = (dataUrl: string) => {
    if (!dataUrl) return;
    const mediaTitle = prompt(`Enter title for new ${activeAlbum} item:`, `${activeAlbum} Showcase`);
    if (!mediaTitle) return;

    const newItem: MediaItem = {
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
    toast.success(`"${newItem.title}" uploaded to ${activeAlbum} & live on site!`);
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
      setMedia((prev) => prev.filter((m) => m.id !== id));
      toast.success(`"${item?.title}" deleted`);
    },
    [media]
  );

  const createAlbum = useCallback(() => {
    if (!newAlbumName.trim()) {
      toast.error('Album name is required');
      return;
    }
    toast.success(`Album "${newAlbumName.trim()}" created`);
    setNewAlbumName('');
    setShowCreateAlbum(false);
  }, [newAlbumName]);

  const tabs = [
    { key: 'all' as const, label: 'All', count: albumStats.total },
    { key: 'Approved' as const, label: 'Approved', count: albumStats.approved },
    { key: 'Pending Review' as const, label: 'Pending', count: albumStats.pending },
    { key: 'Rejected' as const, label: 'Rejected', count: albumStats.rejected },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fade-up 0.35s ease-out both; }
      `}</style>

      <AdminPageHeader
        title="Gallery Management"
        subtitle="Upload photos and videos, create albums, organize galleries, and approve submitted media."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Gallery' }]}
        actions={<AdminBadge variant="warning">Approval Workflow Enabled</AdminBadge>}
      />

      {/* Album Grid */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {albums.map((album) => {
          const Icon = album.icon;
          const active = activeAlbum === album.name;
          const count = media.filter(m => m.album === album.name).length;
          const pending = media.filter(m => m.album === album.name && m.status === 'Pending Review').length;
          return (
            <button
              key={album.name}
              type="button"
              onClick={() => setActiveAlbum(album.name)}
              className={`fade-up rounded-[12px] border p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${active ? 'border-[#003580] bg-[#003580]/5 ring-1 ring-[#003580]/15' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-start justify-between">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] ${album.bg} ${album.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {pending > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                    {pending} pending
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{album.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{count} media files</p>
            </button>
          );
        })}
        <button onClick={() => setShowCreateAlbum(!showCreateAlbum)}
          className="fade-up rounded-[12px] border border-dashed border-slate-300 bg-slate-50/50 p-4 text-left transition-all hover:border-[#003580]/30 hover:bg-[#003580]/5 hover:shadow-sm flex flex-col items-center justify-center min-h-[100px]">
          <Plus className="h-6 w-6 text-slate-400" />
          <span className="mt-2 text-xs font-semibold text-slate-500">New Album</span>
        </button>
      </section>

      {showCreateAlbum && (
        <div className="fade-up rounded-[10px] border border-blue-200 bg-blue-50/50 p-4 flex items-center gap-3">
          <input value={newAlbumName} onChange={e => setNewAlbumName(e.target.value)} placeholder="Album name" className="flex-1 rounded-[8px] border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#003580]" />
          <button onClick={createAlbum} className="rounded-[8px] bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all">Create</button>
          <button onClick={() => setShowCreateAlbum(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        {/* Upload Panel */}
        <div className="space-y-4">
          <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-slate-900">Upload to {activeAlbum}</h2>
            <p className="mt-1 text-xs text-slate-500 mb-4">Accepts images and video files. Uploaded media updates the public gallery instantly.</p>
            <ImageUploader
              label={`Choose or Drag File for ${activeAlbum}`}
              value={uploadedSrc}
              onChange={handleUploadNewMedia}
            />
          </div>

          <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-[#003580]" />
              <h2 className="text-sm font-semibold text-slate-900">Album Quick Stats</h2>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Total Media', value: albumStats.total, color: 'text-[#003580]' },
                { label: 'Approved', value: albumStats.approved, color: 'text-[#1D9E75]' },
                { label: 'Pending Review', value: albumStats.pending, color: 'text-[#E8A020]' },
                { label: 'Rejected', value: albumStats.rejected, color: 'text-[#E24B4A]' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between rounded-[8px] bg-slate-50 px-3 py-2.5">
                  <span className="text-xs font-medium text-slate-600">{stat.label}</span>
                  <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Media Review */}
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{activeAlbum} — Media Review</h2>
              <p className="mt-1 text-xs text-slate-500">Approve, reject, or delete gallery assets.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search media..." className="w-40 rounded-[8px] border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#003580]" />
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mt-4 flex items-center gap-1.5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTab(tab.key)}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all ${selectedTab === tab.key ? 'bg-[#003580] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {tab.label}
                <span className={`px-1 py-0.5 rounded text-[9px] ${selectedTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {filteredMedia.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-[10px] border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-slate-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] overflow-hidden ${item.type === 'Video' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    {item.src ? (
                      <img src={item.src} alt="" className="h-full w-full object-cover" />
                    ) : item.type === 'Video' ? (
                      <Film className="h-5 w-5" />
                    ) : (
                      <Image className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{item.type}</span>
                      <span>·</span>
                      <span>{item.uploadedBy}</span>
                      <span>·</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusClasses[item.status]}`}>
                    {item.status === 'Approved' && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                    {item.status === 'Pending Review' && <Eye className="h-3 w-3 mr-1 inline" />}
                    {item.status === 'Rejected' && <XCircle className="h-3 w-3 mr-1 inline" />}
                    {item.status}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.status === 'Pending Review' && (
                      <>
                        <button onClick={() => changeStatus(item.id, 'Approved')}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all" title="Approve">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => changeStatus(item.id, 'Rejected')}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all" title="Reject">
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button onClick={() => window.open('/gallery', '_blank')}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-[#003580]/10 hover:text-[#003580] transition-all" title="Open Full Public Gallery">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast.success(`Editing "${item.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Edit">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteMedia(item.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-100 bg-rose-50 text-rose-400 hover:bg-rose-100 transition-all" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredMedia.length === 0 && (
              <div className="py-8 text-center">
                <ImagePlus className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No {selectedTab !== 'all' ? selectedTab.toLowerCase() : ''} media in this album.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
