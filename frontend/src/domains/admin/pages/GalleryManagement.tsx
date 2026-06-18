import React, { useCallback, useMemo, useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import { useCmsListSection } from '../hooks/useCmsSection';
import { CmsSkeleton, CmsError } from '../components/CmsLoadingState';
import { fetchGalleryItems, approveGalleryItem, rejectGalleryItem, deleteGalleryItem } from '../services/cmsService';
import type { GalleryMediaItem, GalleryStatus } from '../services/cmsService';

interface Album {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  glow: string;
}

const albums: Album[] = [
  { name: 'Event Gallery', icon: Image, color: '#6382ff', glow: 'rgba(99,130,255,0.2)' },
  { name: 'Workshop Gallery', icon: Film, color: '#34d399', glow: 'rgba(52,211,153,0.2)' },
  { name: 'Graduation Gallery', icon: GraduationCap, color: '#fbbf24', glow: 'rgba(251,191,36,0.2)' },
  { name: 'Campus Gallery', icon: ImagePlus, color: '#a78bfa', glow: 'rgba(167,139,250,0.2)' },
  { name: 'Research Gallery', icon: Microscope, color: '#22d3ee', glow: 'rgba(34,211,238,0.2)' },
];

const statusClasses: Record<GalleryStatus, string> = {
  Approved: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  'Pending Review': 'border-amber-500/25 bg-amber-500/10 text-amber-400',
  Rejected: 'border-rose-500/25 bg-rose-500/10 text-rose-400',
};

export default function GalleryManagement() {
  // Integration-ready: uses useCmsListSection with cmsService stubs
  // To connect to backend, update fetchGalleryItems/approveGalleryItem/rejectGalleryItem/deleteGalleryItem in cmsService.ts
  const {
    items: media,
    isLoading,
    error,
    refetch,
    update: updateMedia,
    remove: removeMedia,
  } = useCmsListSection<GalleryMediaItem>(fetchGalleryItems, {
    deleteFn: deleteGalleryItem,
  });

  const [activeAlbum, setActiveAlbum] = useState('Event Gallery');
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | GalleryStatus>('all');
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [dragging, setDragging] = useState(false);

  const filteredMedia = useMemo(() => {
    let items = media.filter(m => m.album === activeAlbum);
    if (selectedTab !== 'all') items = items.filter(m => m.status === selectedTab);
    if (search.trim()) items = items.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [media, activeAlbum, selectedTab, search]);

  const albumStats = useMemo(() => {
    const items = media.filter(m => m.album === activeAlbum);
    return {
      total: items.length,
      approved: items.filter(m => m.status === 'Approved').length,
      pending: items.filter(m => m.status === 'Pending Review').length,
      rejected: items.filter(m => m.status === 'Rejected').length,
    };
  }, [media, activeAlbum]);

  const changeStatus = useCallback(async (id: string, newStatus: GalleryStatus) => {
    const item = media.find(m => m.id === id);
    updateMedia(id, { status: newStatus });
    // TODO: wire to approveGalleryItem / rejectGalleryItem in cmsService.ts
    if (newStatus === 'Approved') await approveGalleryItem(id);
    else if (newStatus === 'Rejected') await rejectGalleryItem(id);
    toast.success(`"${item?.title}" → ${newStatus}`);
  }, [media, updateMedia]);

  const handleDelete = useCallback((id: string) => {
    const item = media.find(m => m.id === id);
    removeMedia(id, item?.title);
  }, [media, removeMedia]);

  const createAlbum = useCallback(() => {
    if (!newAlbumName.trim()) { toast.error('Album name is required'); return; }
    toast.success(`Album "${newAlbumName.trim()}" created`);
    // TODO: Replace with: await adminApi.createAlbum({ name: newAlbumName }) → POST /api/cms/gallery/albums
    setNewAlbumName(''); setShowCreateAlbum(false);
  }, [newAlbumName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    toast.success(`${files.length} file(s) uploaded to ${activeAlbum}`);
    // TODO: Replace with: await adminApi.uploadMedia(files, activeAlbum) → POST /api/cms/gallery/upload
  }, [activeAlbum]);

  if (isLoading) return <CmsSkeleton rows={6} />;
  if (error) return <CmsError message={error} onRetry={refetch} />;

  const tabs = [
    { key: 'all' as const, label: 'All', count: albumStats.total },
    { key: 'Approved' as const, label: 'Approved', count: albumStats.approved },
    { key: 'Pending Review' as const, label: 'Pending', count: albumStats.pending },
    { key: 'Rejected' as const, label: 'Rejected', count: albumStats.rejected },
  ];

  const activeAlbumData = albums.find(a => a.name === activeAlbum);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes gm-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .gm-fade-up { animation: gm-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .gm-hover { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .gm-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,53,128,0.12); }
        .dark .gm-hover:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .gm-input { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; border-radius: 10px; padding: 10px 14px; font-size: 13px; outline: none; transition: border-color 0.2s; width: 100%; }
        .dark .gm-input { background: rgba(30,35,55,0.7); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; }
        .gm-input:focus { border-color: #003580; box-shadow: 0 0 0 3px rgba(0,53,128,0.1); }
        .dark .gm-input:focus { border-color: rgba(99,130,255,0.5); box-shadow: 0 0 0 3px rgba(99,130,255,0.1); }
        .gm-input::placeholder { color: #94a3b8; }
        .dark .gm-input::placeholder { color: rgba(148,163,184,0.5); }
      `}</style>

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 12px 48px rgba(0,53,128,0.40)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.12), transparent)' }} />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.18)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#E8A020' }} />
                Approval Workflow Enabled
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>Gallery Management</h1>
            <p className="mt-2 text-sm leading-relaxed font-medium"
              style={{ color: 'rgba(255,255,255,0.80)' }}>Upload photos and videos, create albums, and approve submitted media.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowCreateAlbum(!showCreateAlbum)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
              style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
              <FolderPlus className="h-4 w-4" /> New Album
            </button>
            <button onClick={() => toast.success('Upload dialog opened')}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
              style={{ background: '#E8A020', color: '#003580', boxShadow: '0 4px 20px rgba(232,160,32,0.35)' }}>
              <Upload className="h-4 w-4" /> Upload Media
            </button>
          </div>
        </div>
      </div>

      {/* Album Grid */}
      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {albums.map((album, i) => {
          const Icon = album.icon;
          const active = activeAlbum === album.name;
          const count = media.filter(m => m.album === album.name).length;
          const pending = media.filter(m => m.album === album.name && m.status === 'Pending Review').length;
          return (
            <button
              key={album.name}
              type="button"
              onClick={() => setActiveAlbum(album.name)}
              className={`gm-fade-up gm-hover rounded-2xl border p-4 text-left transition-all duration-200 ${
                active
                  ? 'shadow-lg ring-2 ring-offset-1'
                  : 'border-slate-200 dark:border-white/7 bg-white dark:bg-[#1a1f35]/80 hover:border-slate-300 dark:hover:border-white/14'
              }`}
              style={{
                animationDelay: `${i * 0.05}s`,
                borderColor: active ? album.color + '50' : undefined,
                background: active ? `linear-gradient(135deg, ${album.color}12 0%, ${album.color}06 100%)` : undefined,
                boxShadow: active ? `0 8px 30px ${album.color}25` : undefined,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: album.color + '18', border: `1.5px solid ${album.color}30` }}
                  >
                    <span style={{ color: album.color }}><Icon className="h-5 w-5" /></span>
                  </div>
                {pending > 0 && (
                  <span className="rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/25 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    {pending}
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white/90 leading-tight">{album.name}</h3>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-500">{count} files</p>
            </button>
          );
        })}
        <button onClick={() => setShowCreateAlbum(!showCreateAlbum)}
          className="gm-fade-up gm-hover rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/3 p-4 text-center transition-all hover:border-[#003580]/40 dark:hover:border-white/25 hover:bg-[#003580]/4 dark:hover:bg-white/6 flex flex-col items-center justify-center min-h-[100px]"
          style={{ animationDelay: `${albums.length * 0.05}s` }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#003580]/10 dark:bg-white/8">
            <Plus className="h-4 w-4 text-[#003580] dark:text-slate-400" />
          </div>
          <span className="mt-2 text-[10px] font-semibold text-[#003580]/70 dark:text-slate-500">New Album</span>
        </button>
      </section>

      {showCreateAlbum && (
        <div className="gm-fade-up flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/8 p-4 backdrop-blur-sm">
          <input value={newAlbumName} onChange={e => setNewAlbumName(e.target.value)} placeholder="Album name" className="gm-input flex-1" />
          <button onClick={createAlbum} className="rounded-xl bg-[#003580] px-4 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-[#003580]/30 shrink-0">Create</button>
          <button onClick={() => setShowCreateAlbum(false)} className="text-slate-500 hover:text-slate-300 transition-all shrink-0"><X className="h-4 w-4" /></button>
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[320px_1fr]">
        {/* Upload + Stats Panel */}
        <div className="space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border p-5 transition-all ${dragging ? 'border-blue-500/50 bg-blue-500/8 shadow-[0_0_30px_rgba(99,130,255,0.15)]' : 'border-white/8 bg-[#1a1f35]/80'} backdrop-blur-sm`}
          >
            <h2 className="text-sm font-bold text-white mb-1">Upload to {activeAlbum}</h2>
            <p className="text-[11px] text-slate-500 mb-4">Accepts images and videos for approval.</p>
            <label className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              dragging ? 'border-blue-400/60 bg-blue-500/12' : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/6'
            }`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-3 ${dragging ? 'bg-blue-500/20' : 'bg-white/8'}`}>
                <Upload className={`h-6 w-6 ${dragging ? 'text-blue-400' : 'text-slate-500'}`} />
              </div>
              <span className="text-sm font-semibold text-white/80">{dragging ? 'Drop files here' : 'Drop files or browse'}</span>
              <span className="mt-1 text-[11px] text-slate-500">Photos, videos, posters, thumbnails</span>
              <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={e => {
                if (e.target.files?.length) toast.success(`${e.target.files.length} file(s) uploaded to ${activeAlbum}`);
              }} />
            </label>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#1a1f35]/80 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: activeAlbumData?.glow, color: activeAlbumData?.color }}>
                <FolderPlus className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Album Quick Stats</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Total Media', value: albumStats.total, color: '#6382ff' },
                { label: 'Approved', value: albumStats.approved, color: '#34d399' },
                { label: 'Pending Review', value: albumStats.pending, color: '#fbbf24' },
                { label: 'Rejected', value: albumStats.rejected, color: '#f87171' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between rounded-xl bg-white/4 px-3 py-2.5 border border-white/5">
                  <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                  <span className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Media Review Panel */}
        <div className="rounded-2xl border border-white/8 bg-[#1a1f35]/80 p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">{activeAlbum} — Media Review</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">Approve, reject, or delete gallery assets.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search media..." className="gm-input pl-9 w-44" />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 mb-4">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${
                  selectedTab === tab.key ? 'bg-[#003580] text-white shadow-md shadow-[#003580]/30' : 'bg-white/6 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${selectedTab === tab.key ? 'bg-white/20 text-white' : 'bg-white/8 text-slate-500'}`}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredMedia.map((item, i) => (
              <div key={item.id}
                className="gm-hover flex flex-col gap-2 rounded-xl border border-white/6 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.type === 'Video' ? 'bg-violet-500/15 text-violet-400' : 'bg-blue-500/15 text-blue-400'}`}>
                    {item.type === 'Video' ? <Film className="h-5 w-5" /> : <Image className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white/90 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{item.type}</span><span>·</span><span>{item.uploadedBy}</span><span>·</span><span>{item.date}</span>
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
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Approve">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => changeStatus(item.id, 'Rejected')}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all" title="Reject">
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button onClick={() => toast.success(`Previewing "${item.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-white/10 hover:text-white transition-all" title="Preview">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast.success(`Editing "${item.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all" title="Edit">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/8 text-rose-400 hover:bg-rose-500/20 transition-all" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredMedia.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <ImagePlus className="h-8 w-8 text-slate-600" />
                </div>
                <p className="mt-3 text-sm text-slate-500">No {selectedTab !== 'all' ? selectedTab.toLowerCase() : ''} media in this album.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
