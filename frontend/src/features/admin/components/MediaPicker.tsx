import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Filter,
  Folder,
  Grid3x3,
  Image as ImageIcon,
  List,
  Music,
  Search,
  Upload,
  Video,
} from 'lucide-react';
import AdminModal from './AdminModal';

export type MediaAsset = {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  folder?: string;
  tags?: string[];
  uploadedAt: string;
  uploadedBy: string;
  width?: number;
  height?: number;
  duration?: string;
};

export type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset | MediaAsset[]) => void;
  multiple?: boolean;
  accept?: Array<MediaAsset['type']>;
  title?: string;
};

const FOLDERS = ['All', 'Hero Banners', 'Event Photos', 'Documents', 'Logos', 'Videos'];

const sampleAssets: MediaAsset[] = [
  {
    id: 'm-1',
    name: 'astu-campus-aerial.jpg',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600',
    type: 'image',
    size: 248000,
    folder: 'Hero Banners',
    tags: ['campus', 'aerial'],
    uploadedAt: '2 days ago',
    uploadedBy: 'Public Relations',
    width: 1920,
    height: 1080,
  },
  {
    id: 'm-2',
    name: 'graduation-ceremony.jpg',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600',
    type: 'image',
    size: 312000,
    folder: 'Event Photos',
    tags: ['graduation', 'students'],
    uploadedAt: '1 week ago',
    uploadedBy: 'Registrar',
    width: 1920,
    height: 1280,
  },
  {
    id: 'm-3',
    name: 'career-fair-2026.jpg',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
    type: 'image',
    size: 198000,
    folder: 'Event Photos',
    tags: ['career', 'fair'],
    uploadedAt: '3 days ago',
    uploadedBy: 'Career Services',
    width: 1600,
    height: 900,
  },
  {
    id: 'm-4',
    name: 'research-lab.jpg',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600',
    type: 'image',
    size: 274000,
    folder: 'Hero Banners',
    tags: ['research', 'lab'],
    uploadedAt: '4 days ago',
    uploadedBy: 'Research Directorate',
    width: 1920,
    height: 1080,
  },
  {
    id: 'm-5',
    name: 'partnership-summit.mp4',
    url: '',
    type: 'video',
    size: 12400000,
    folder: 'Videos',
    tags: ['partnership', 'summit'],
    uploadedAt: 'Yesterday',
    uploadedBy: 'Industry Liaison',
    duration: '04:21',
  },
  {
    id: 'm-6',
    name: 'alumni-handbook.pdf',
    url: '',
    type: 'document',
    size: 2400000,
    folder: 'Documents',
    tags: ['alumni', 'handbook'],
    uploadedAt: '2 weeks ago',
    uploadedBy: 'Alumni Office',
  },
  {
    id: 'm-7',
    name: 'astu-logo.png',
    url: '',
    type: 'image',
    size: 38000,
    folder: 'Logos',
    tags: ['logo', 'brand'],
    uploadedAt: '1 month ago',
    uploadedBy: 'Brand Team',
    width: 350,
    height: 350,
  },
  {
    id: 'm-8',
    name: 'student-innovation.jpg',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600',
    type: 'image',
    size: 220000,
    folder: 'Event Photos',
    tags: ['innovation', 'students'],
    uploadedAt: '5 days ago',
    uploadedBy: 'Public Relations',
    width: 1920,
    height: 1280,
  },
  {
    id: 'm-9',
    name: 'alumni-voice-podcast.mp3',
    url: '',
    type: 'audio',
    size: 8200000,
    folder: 'Videos',
    tags: ['podcast', 'alumni'],
    uploadedAt: '1 week ago',
    uploadedBy: 'Alumni Office',
    duration: '32:11',
  },
];

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const typeIcon: Record<MediaAsset['type'], React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
};

const typeColor: Record<MediaAsset['type'], string> = {
  image: 'bg-blue-100 text-blue-700',
  video: 'bg-rose-100 text-rose-700',
  audio: 'bg-violet-100 text-violet-700',
  document: 'bg-slate-100 text-slate-700',
};

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  accept,
  title = 'Media Library',
}: MediaPickerProps) {
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const assets = useMemo<MediaAsset[]>(() => {
    try {
      const stored = localStorage.getItem('astu_cms_media_library');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return sampleAssets;
  }, [open]);

  const filtered = useMemo(() => {
    return assets.filter((asset) => {
      if (accept && !accept.includes(asset.type)) return false;
      if (folder !== 'All' && asset.folder !== folder) return false;
      if (search && !asset.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, folder, accept, assets]);

  const toggleSelect = (id: string) => {
    if (multiple) {
      setSelectedIds((current) =>
        current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      const selectedAssets = assets.filter((asset) => selectedIds.includes(asset.id));
      if (selectedAssets.length === 0) return;
      onSelect(selectedAssets);
    } else {
      const asset = assets.find((a) => a.id === selectedIds[0]);
      if (asset) onSelect(asset);
    }
    setSelectedIds([]);
    onClose();
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedIds.length} selected · {filtered.length} available
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Use Selected
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by filename or tag..."
              className="w-full rounded-[8px] border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#003580]/20 bg-[#003580]/5 px-3 py-2 text-xs font-semibold text-[#003580] hover:bg-[#003580]/10"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`inline-flex h-7 w-7 items-center justify-center rounded ${view === 'grid' ? 'bg-[#003580] text-white' : 'text-slate-500 hover:text-slate-700'}`}
              title="Grid view"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`inline-flex h-7 w-7 items-center justify-center rounded ${view === 'list' ? 'bg-[#003580] text-white' : 'text-slate-500 hover:text-slate-700'}`}
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FOLDERS.map((folderOption) => (
            <button
              key={folderOption}
              type="button"
              onClick={() => setFolder(folderOption)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                folder === folderOption
                  ? 'border-[#003580] bg-[#003580] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#003580]/40'
              }`}
            >
              {folderOption === 'All' ? <Filter className="h-3 w-3" /> : <Folder className="h-3 w-3" />}
              {folderOption}
            </button>
          ))}
        </div>

        {view === 'grid' ? (
          <div className="grid max-h-[420px] grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((asset) => {
              const Icon = typeIcon[asset.type];
              const selected = selectedIds.includes(asset.id);
              return (
                <button
                  type="button"
                  key={asset.id}
                  onClick={() => toggleSelect(asset.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-[10px] border text-left transition-all ${
                    selected
                      ? 'border-[#003580] ring-2 ring-[#003580]/30'
                      : 'border-slate-200 hover:border-[#003580]/40'
                  } bg-white`}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    {asset.type === 'image' && asset.url ? (
                      <img src={asset.url} alt={asset.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <span className={`absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${typeColor[asset.type]}`}>
                      {asset.type}
                    </span>
                    {selected && (
                      <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#003580] text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-[11px] font-semibold text-slate-800">{asset.name}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{formatBytes(asset.size)}</p>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-slate-500">No media files match your filters.</div>
            )}
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto rounded-[8px] border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Type</th>
                  <th className="px-3 py-2 font-semibold">Folder</th>
                  <th className="px-3 py-2 font-semibold">Size</th>
                  <th className="px-3 py-2 font-semibold">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((asset) => {
                  const Icon = typeIcon[asset.type];
                  const selected = selectedIds.includes(asset.id);
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => toggleSelect(asset.id)}
                      className={`cursor-pointer transition-colors ${selected ? 'bg-[#003580]/5' : 'hover:bg-slate-50'}`}
                    >
                      <td className="flex items-center gap-2 px-3 py-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-800">{asset.name}</span>
                      </td>
                      <td className="px-3 py-2 text-xs uppercase text-slate-500">{asset.type}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{asset.folder}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{formatBytes(asset.size)}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{asset.uploadedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-500">No media files match your filters.</div>
            )}
          </div>
        )}
      </div>
    </AdminModal>
  );
}
