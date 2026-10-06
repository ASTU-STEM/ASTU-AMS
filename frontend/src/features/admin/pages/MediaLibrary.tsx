import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  Filter,
  Folder,
  Grid3x3,
  Image as ImageIcon,
  Info,
  Link2,
  List,
  Music,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import homepageCmsService from '../services/homepageCms.service';

export type MediaType = 'image' | 'video' | 'audio' | 'document';

export type MediaItem = {
  id: string;
  name: string;
  url?: string;
  type: MediaType;
  size: number;
  folder: string;
  tags: string[];
  description?: string;
  altText?: string;
  uploadedAt: string;
  uploadedBy: string;
  width?: number;
  height?: number;
  duration?: string;
};

const FOLDERS = ['All', 'Hero Banners', 'Event Photos', 'Documents', 'Logos', 'Videos', 'Audio', 'General'];
const MEDIA_STORAGE_KEY = 'astu_cms_media_library';

export function detectMediaType(file: File | { name: string; type?: string }): MediaType {
  const mime = (file.type || '').toLowerCase();
  const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'heic', 'heif', 'ico', 'avif'];
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
  const audioExts = ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'wma'];

  if (mime.startsWith('image/') || imageExts.includes(ext)) return 'image';
  if (mime.startsWith('video/') || videoExts.includes(ext)) return 'video';
  if (mime.startsWith('audio/') || audioExts.includes(ext)) return 'audio';
  return 'document';
}

const initialSampleMedia: MediaItem[] = [
  {
    id: 'M-001',
    name: 'astu_campus_hero.jpg',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop',
    type: 'image',
    size: 1450000,
    folder: 'Hero Banners',
    description: 'Aerial overview of ASTU main campus buildings and grounds.',
    altText: 'ASTU main campus aerial photo',
    tags: ['campus', 'hero', 'banner', 'astu'],
    uploadedAt: 'Aug 24, 2026',
    uploadedBy: 'Content Manager',
    width: 1920,
    height: 1080,
  },
  {
    id: 'M-002',
    name: 'graduation_ceremony_2026.jpg',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop',
    type: 'image',
    size: 2100000,
    folder: 'Event Photos',
    description: 'Students celebrating at the 2026 graduation ceremony.',
    altText: 'Graduation ceremony celebrating students',
    tags: ['graduation', 'event', 'alumni'],
    uploadedAt: 'Aug 25, 2026',
    uploadedBy: 'Registrar',
    width: 1920,
    height: 1280,
  },
  {
    id: 'M-003',
    name: 'astu_logo_vector.png',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
    type: 'image',
    size: 340000,
    folder: 'Logos',
    description: 'Official ASTU logo transparent background.',
    altText: 'ASTU official logo',
    tags: ['logo', 'brand'],
    uploadedAt: 'Aug 20, 2026',
    uploadedBy: 'Brand Team',
    width: 500,
    height: 500,
  },
  {
    id: 'M-004',
    name: 'academic_catalog_2026.pdf',
    url: '',
    type: 'document',
    size: 3200000,
    folder: 'Documents',
    description: 'Complete academic course catalog for 2026-2027.',
    tags: ['catalog', 'academic', 'pdf'],
    uploadedAt: 'Aug 18, 2026',
    uploadedBy: 'Academic Affairs',
  },
];

const typeIcon: Record<MediaType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
};

const typeColor: Record<MediaType, string> = {
  image: 'bg-blue-100 text-blue-700 border-blue-200',
  video: 'bg-rose-100 text-rose-700 border-rose-200',
  audio: 'bg-violet-100 text-violet-700 border-violet-200',
  document: 'bg-amber-100 text-amber-800 border-amber-200',
};

const formatBytes = (bytes: number) => {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

function ImageThumbnail({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const [error, setError] = useState(false);
  const ext = alt.split('.').pop()?.toUpperCase() || 'IMG';

  if (!src || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-[var(--bg-page)] p-2 text-[var(--text-muted)] ${className}`}>
        <ImageIcon className="h-8 w-8 text-slate-300" />
        <span className="mt-1 text-[10px] font-bold tracking-wider text-[var(--text-muted)]">{ext} IMAGE</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
    />
  );
}

interface PendingUpload {
  id: string;
  file: File;
  dataUrl: string;
  name: string;
  type: MediaType;
  size: number;
  folder: string;
  description: string;
  altText: string;
  tagsInput: string;
  width?: number;
  height?: number;
}

export default function MediaLibrary() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<MediaItem[]>(() => {
    try {
      const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialSampleMedia;
  });

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('All');
  const [typeFilter, setTypeFilter] = useState<'all' | MediaType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [activeUploadIndex, setActiveUploadIndex] = useState(0);

  // Lightbox Edit State
  const [isEditingLightbox, setIsEditingLightbox] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    folder: string;
    description: string;
    altText: string;
    tagsInput: string;
  }>({ name: '', folder: 'General', description: '', altText: '', tagsInput: '' });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(media));
  }, [media]);

  // Sync from backend API on mount
  useEffect(() => {
    let isMounted = true;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    axios
      .get(`${apiBase}/content/media`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const apiItems: MediaItem[] = res.data.data.map((item: any) => ({
            id: item.id || item.filename || `M-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: item.name || item.filename || 'asset.jpg',
            url: item.url?.startsWith('http') ? item.url : `${apiBase.replace(/\/api$/, '')}${item.url}`,
            type: detectMediaType({ name: item.name || item.filename, type: item.mimeType }),
            size: item.size || 500000,
            folder: item.folder || 'General',
            description: item.description || '',
            altText: item.altText || item.name,
            tags: Array.isArray(item.tags) ? item.tags : ['media', 'cms'],
            uploadedAt: item.uploadedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            uploadedBy: item.uploadedBy || 'Content Manager',
            width: item.width,
            height: item.height,
          }));

          setMedia((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newFromApi = apiItems.filter((m) => !existingIds.has(m.id));
            return newFromApi.length > 0 ? [...newFromApi, ...prev] : prev;
          });
        }
      })
      .catch((err) => console.warn('Media API fetch warning:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const pendingList: PendingUpload[] = [];
    let processedCount = 0;

    fileList.forEach((file) => {
      const mediaType = detectMediaType(file);
      let assignedFolder = 'General';
      if (mediaType === 'image') assignedFolder = 'Event Photos';
      else if (mediaType === 'video') assignedFolder = 'Videos';
      else if (mediaType === 'audio') assignedFolder = 'Audio';
      else if (mediaType === 'document') assignedFolder = 'Documents';

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = (event.target?.result as string) || '';
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

        const pendingItem: PendingUpload = {
          id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          file,
          dataUrl,
          name: file.name,
          type: mediaType,
          size: file.size,
          folder: assignedFolder,
          description: '',
          altText: mediaType === 'image' ? nameWithoutExt : '',
          tagsInput: `${mediaType}, ${assignedFolder.toLowerCase().replace(/\s+/g, '-')}`,
        };

        if (mediaType === 'image' && dataUrl) {
          const img = new Image();
          img.onload = () => {
            pendingItem.width = img.width;
            pendingItem.height = img.height;
            pendingList.push(pendingItem);
            processedCount++;
            if (processedCount === fileList.length) {
              setPendingUploads(pendingList);
              setActiveUploadIndex(0);
              setUploadModalOpen(true);
            }
          };
          img.onerror = () => {
            pendingList.push(pendingItem);
            processedCount++;
            if (processedCount === fileList.length) {
              setPendingUploads(pendingList);
              setActiveUploadIndex(0);
              setUploadModalOpen(true);
            }
          };
          img.src = dataUrl;
        } else {
          pendingList.push(pendingItem);
          processedCount++;
          if (processedCount === fileList.length) {
            setPendingUploads(pendingList);
            setActiveUploadIndex(0);
            setUploadModalOpen(true);
          }
        }
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updatePendingItem = (index: number, updates: Partial<PendingUpload>) => {
    setPendingUploads((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleConfirmUpload = async () => {
    if (pendingUploads.length === 0) return;

    const toastId = toast.loading(`Uploading ${pendingUploads.length} file(s)...`);

    try {
      const newItems: MediaItem[] = await Promise.all(
        pendingUploads.map(async (item) => {
          const tags = item.tagsInput
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

          let finalUrl = item.dataUrl;
          try {
            const uploadResult = await homepageCmsService.uploadMedia(item.file, item.folder, item.altText.trim() || item.name);
            if (uploadResult?.url) {
              const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000';
              finalUrl = uploadResult.url.startsWith('http') ? uploadResult.url : `${apiBase}${uploadResult.url}`;
            }
          } catch (e) {
            console.warn('Backend file upload fallback to dataUrl:', e);
          }

          return {
            id: `M-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: item.name.trim() || item.file.name,
            url: finalUrl,
            type: item.type,
            size: item.size,
            folder: item.folder,
            description: item.description.trim(),
            altText: item.altText.trim(),
            tags: tags.length > 0 ? tags : [item.type],
            uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            uploadedBy: 'Content Manager',
            width: item.width,
            height: item.height,
          };
        })
      );

      setMedia((prev) => [...newItems, ...prev]);
      toast.success(`Successfully uploaded ${newItems.length} file(s)!`, { id: toastId });
      setPendingUploads([]);
      setUploadModalOpen(false);
    } catch (error) {
      toast.error('Upload failed, please try again.', { id: toastId });
    }
  };

  const openLightbox = (item: MediaItem) => {
    setLightboxItem(item);
    setIsEditingLightbox(false);
    setEditForm({
      name: item.name,
      folder: item.folder,
      description: item.description || '',
      altText: item.altText || '',
      tagsInput: (item.tags || []).join(', '),
    });
  };

  const handleSaveLightboxEdit = () => {
    if (!lightboxItem) return;

    const updatedTags = editForm.tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const updatedItem: MediaItem = {
      ...lightboxItem,
      name: editForm.name.trim() || lightboxItem.name,
      folder: editForm.folder,
      description: editForm.description.trim(),
      altText: editForm.altText.trim(),
      tags: updatedTags,
    };

    setMedia((prev) => prev.map((m) => (m.id === lightboxItem.id ? updatedItem : m)));
    setLightboxItem(updatedItem);
    setIsEditingLightbox(false);
    toast.success('Media details updated successfully!');
  };

  const filtered = useMemo(() => {
    return media.filter((m) => {
      if (folder !== 'All' && m.folder !== folder) return false;
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !(m.description && m.description.toLowerCase().includes(q)) &&
          !m.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [media, folder, typeFilter, search]);

  const counts = useMemo(() => {
    const total = media.length;
    const images = media.filter((m) => m.type === 'image').length;
    const videos = media.filter((m) => m.type === 'video').length;
    const docs = media.filter((m) => m.type === 'document').length;
    const audio = media.filter((m) => m.type === 'audio').length;
    const totalSize = media.reduce((sum, m) => sum + m.size, 0);
    return { total, images, videos, docs, audio, totalSize };
  }, [media]);

  const toggleSelect = (id: string) =>
    setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const handleDeleteSingle = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.name}"? This action cannot be undone.`)) return;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // The delete used to be `axios.delete(...).catch(() => {})` inside a
    // try/catch that also ignored errors, so the item vanished from the list and
    // a success toast fired even when the server rejected or never ran it.
    try {
      const filename = item.url?.split('/').pop() || item.id;
      await axios.delete(`${apiBase}/content/media/${filename}`);
    } catch {
      toast.error(`Could not delete "${item.name}". It may still exist on the server.`);
      return;
    }
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
    if (lightboxItem?.id === item.id) setLightboxItem(null);
    toast.success(`"${item.name}" deleted`);
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected file(s)?`)) return;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // These deletes were fire-and-forget and unawaited, so the success toast
    // fired before the server responded. Now awaited and failures are counted.
    const failures: string[] = [];
    for (const id of selectedIds) {
      const item = media.find((m) => m.id === id);
      if (!item?.url) continue;
      const filename = item.url.split('/').pop() || id;
      try {
        await axios.delete(`${apiBase}/content/media/${filename}`);
      } catch {
        failures.push(item.name);
      }
    }
    if (failures.length > 0) {
      toast.error(`Could not delete ${failures.length} file(s): ${failures.slice(0, 3).join(', ')}${failures.length > 3 ? '…' : ''}`);
      setMedia((prev) => prev.filter((m) => !failures.includes(m.name)));
      setSelectedIds([]);
      return;
    }
    setMedia((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
    toast.success(`${selectedIds.length} file(s) permanently deleted`);
    setSelectedIds([]);
  };

  const copyMediaUrl = (item: MediaItem) => {
    const urlToCopy = item.url || window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(urlToCopy)
        .then(() => toast.success(`Copied URL for "${item.name}" to clipboard!`))
        .catch(() => {
          fallbackCopy(urlToCopy);
          toast.success(`Copied URL for "${item.name}" to clipboard!`);
        });
    } else {
      fallbackCopy(urlToCopy);
      toast.success(`Copied URL for "${item.name}" to clipboard!`);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch {}
    document.body.removeChild(textArea);
  };

  const downloadMediaAsset = async (item: MediaItem) => {
    if (!item.url) {
      toast.error(`No download URL available for "${item.name}"`);
      return;
    }

    const toastId = `dl-${item.id}`;
    toast.loading(`Preparing download for "${item.name}"...`, { id: toastId });

    try {
      if (item.url.startsWith('data:') || item.url.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.name || 'downloaded-media';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded "${item.name}"!`, { id: toastId });
        return;
      }

      const res = await fetch(item.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = item.name || 'downloaded-media';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      toast.success(`Downloaded "${item.name}"!`, { id: toastId });
    } catch {
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.download = item.name || 'downloaded-media';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Triggered download for "${item.name}"!`, { id: toastId });
    }
  };

  const downloadSelected = () => {
    if (selectedIds.length === 0) return;
    const itemsToDownload = media.filter((m) => selectedIds.includes(m.id));
    itemsToDownload.forEach((item, index) => {
      setTimeout(() => {
        downloadMediaAsset(item);
      }, index * 350);
    });
  };

  const currentPending = pendingUploads[activeUploadIndex];

  return (
    <div className="space-y-5">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,video/*,audio/*,application/pdf,.heic,.heif"
        className="hidden"
      />

      <AdminPageHeader
        title="Media Library"
        subtitle="Centralized hub for images, videos, documents, and audio uploaded to the database with category, description, and accessibility metadata."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Media' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="info">{counts.total} uploaded files · {formatBytes(counts.totalSize)}</AdminBadge>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-md transition-all cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Upload Media
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: 'Total Files', value: counts.total, icon: ImageIcon, color: '#003580' },
          { label: 'Images', value: counts.images, icon: ImageIcon, color: '#1D9E75' },
          { label: 'Videos', value: counts.videos, icon: Video, color: '#E24B4A' },
          { label: 'Audio', value: counts.audio, icon: Music, color: '#7C3AED' },
          { label: 'Documents', value: counts.docs, icon: FileText, color: '#E8A020' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm flex items-center gap-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] dark:text-slate-400">{stat.label}</p>
                <p className="text-xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files, descriptions, and tags..."
              className="w-full rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-slate-200">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="inline-flex rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button type="button" onClick={() => setView('grid')} className={`inline-flex h-8 w-8 items-center justify-center rounded transition-colors ${view === 'grid' ? 'bg-[#003580] text-white' : 'text-[var(--text-muted)] dark:text-slate-400 hover:text-[var(--text-primary)] dark:hover:text-white'}`} title="Grid view">
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setView('list')} className={`inline-flex h-8 w-8 items-center justify-center rounded transition-colors ${view === 'list' ? 'bg-[#003580] text-white' : 'text-[var(--text-muted)] dark:text-slate-400 hover:text-[var(--text-primary)] dark:hover:text-white'}`} title="List view">
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-color)] pt-3 dark:border-slate-800">
          {FOLDERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFolder(f)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                folder === f ? 'border-[#003580] bg-[#003580] text-white' : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[#003580]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-500'
              }`}
            >
              {f === 'All' ? <Filter className="h-3 w-3" /> : <Folder className="h-3 w-3" />}
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'image', 'video', 'audio', 'document'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                typeFilter === t ? 'bg-slate-700 text-white dark:bg-sky-600' : 'bg-[var(--bg-page)] text-[var(--text-secondary)]  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-[10px] border border-[#003580]/30 bg-[#003580]/5 px-4 py-2 shadow-sm dark:bg-[#003580]/20 dark:border-[#003580]/50">
          <span className="text-sm font-semibold text-[#003580] dark:text-sky-300">{selectedIds.length} selected</span>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={downloadSelected} className="inline-flex items-center gap-1 rounded-md bg-[#003580] px-2.5 py-1 text-xs font-semibold text-white hover:brightness-110">
              <Download className="h-3 w-3" /> Download
            </button>
            <button type="button" onClick={deleteSelected} className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
            <button type="button" onClick={() => setSelectedIds([])} className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-page)] dark:text-slate-400 dark:hover:bg-slate-800">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {view === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filtered.map((m) => {
            const Icon = typeIcon[m.type];
            const selected = selectedIds.includes(m.id);
            return (
              <div
                key={m.id}
                className={`group relative flex flex-col overflow-hidden rounded-[10px] border bg-[var(--bg-card)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
                  selected ? 'border-[#003580] ring-2 ring-[#003580]/30 dark:border-sky-500' : 'border-[var(--border-color)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => openLightbox(m)}
                  className="relative aspect-video w-full overflow-hidden bg-[var(--bg-page)] dark:bg-slate-800"
                >
                  {m.type === 'image' ? (
                    <ImageThumbnail src={m.url} alt={m.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--bg-page)] dark:bg-slate-800">
                      <Icon className="h-10 w-10 text-[var(--text-muted)]" />
                      <span className="mt-1 text-[9px] font-bold text-[var(--text-muted)] dark:text-slate-400 uppercase">{m.name.split('.').pop()}</span>
                    </div>
                  )}
                  <span className={`absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${typeColor[m.type]}`}>
                    {m.type}
                  </span>
                </button>
                <div className="p-2">
                  <p className="truncate text-[11px] font-semibold text-[var(--text-primary)] dark:text-white" title={m.name}>{m.name}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{formatBytes(m.size)} · {m.folder}</p>
                  {m.description && (
                    <p className="mt-1 line-clamp-1 text-[10px] text-[var(--text-muted)] dark:text-slate-400 italic">{m.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border-color)] px-2 py-1.5 bg-[var(--bg-page)] dark:border-slate-800 dark:bg-slate-800/60" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openLightbox(m)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)] dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                      title="View & Edit Info"
                    >
                      <Info className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyMediaUrl(m)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)] dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                      title="Copy URL"
                    >
                      <Link2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadMediaAsset(m)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)] dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                      title="Download Asset"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSingle(m)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleSelect(m.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-1.5 top-1.5 h-4 w-4 rounded border-white/40 text-[#003580] shadow-md focus:ring-[#003580]"
                />
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-[12px] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-page)] dark:bg-slate-800 text-[var(--text-muted)]">
                <Upload className="h-7 w-7 text-[#003580] dark:text-sky-400" />
              </div>
              <div>
                <p className="text-base font-bold text-[var(--text-primary)] dark:text-white">No media files found</p>
                <p className="mt-1 text-xs text-[var(--text-muted)] dark:text-slate-400 max-w-sm mx-auto">
                  Click below to upload images, documents, videos, or audio directly with category and details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4" /> Upload Media File
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--bg-page)] dark:bg-slate-800/80">
              <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400">
                <th className="px-3 py-2 font-semibold">Name & Details</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Folder</th>
                <th className="px-3 py-2 font-semibold">Size</th>
                <th className="px-3 py-2 font-semibold">Uploaded</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] dark:divide-slate-800">
              {filtered.map((m) => {
                const Icon = typeIcon[m.type];
                return (
                  <tr key={m.id} className="hover:bg-[var(--bg-page)] dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {m.type === 'image' ? (
                          <ImageThumbnail src={m.url} alt={m.name} className="h-9 w-12 rounded object-cover border border-[var(--border-color)] dark:border-slate-700" />
                        ) : (
                          <div className="flex h-9 w-12 items-center justify-center rounded bg-[var(--bg-page)] dark:bg-slate-800">
                            <Icon className="h-4 w-4 text-[var(--text-muted)] dark:text-slate-400" />
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-[var(--text-primary)] dark:text-white">{m.name}</span>
                          {m.description && <p className="text-[10px] text-[var(--text-muted)] truncate max-w-xs">{m.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs uppercase text-[var(--text-muted)] dark:text-slate-400">{m.type}</td>
                    <td className="px-3 py-2 text-xs text-[var(--text-muted)] dark:text-slate-400">{m.folder}</td>
                    <td className="px-3 py-2 text-xs text-[var(--text-muted)] dark:text-slate-400">{formatBytes(m.size)}</td>
                    <td className="px-3 py-2 text-xs text-[var(--text-muted)] dark:text-slate-400">{m.uploadedAt}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => openLightbox(m)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" title="Preview & Edit">
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => copyMediaUrl(m)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" title="Copy URL">
                          <Link2 className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => downloadMediaAsset(m)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-sky-400" title="Download">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDeleteSingle(m)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[var(--text-muted)] dark:text-slate-400">No media files match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Details Modal */}
      <AdminModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title={`Upload Media Details (${pendingUploads.length} file${pendingUploads.length > 1 ? 's' : ''})`}
        size="lg"
        footer={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pendingUploads.length > 1 && (
                <span className="text-xs text-[var(--text-muted)] dark:text-slate-400">
                  Configuring file {activeUploadIndex + 1} of {pendingUploads.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm & Save to Media Library
              </button>
            </div>
          </div>
        }
      >
        {currentPending && (
          <div className="space-y-4">
            {/* Multiple files selector tab if multiple files selected */}
            {pendingUploads.length > 1 && (
              <div className="flex flex-wrap gap-1 border-b border-[var(--border-color)] pb-2 dark:border-slate-800">
                {pendingUploads.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveUploadIndex(idx)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      activeUploadIndex === idx
                        ? 'bg-[#003580] text-white shadow-sm'
                        : 'bg-[var(--bg-page)] text-[var(--text-secondary)]  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    File {idx + 1}: {p.name.length > 15 ? p.name.substring(0, 12) + '...' : p.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-12">
              {/* Media Preview Thumbnail */}
              <div className="md:col-span-5 flex flex-col items-center justify-center rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-page)] p-3 dark:border-slate-700 dark:bg-slate-800">
                {currentPending.type === 'image' ? (
                  <ImageThumbnail
                    src={currentPending.dataUrl}
                    alt={currentPending.name}
                    className="max-h-48 w-full rounded-[8px] object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-36 w-full flex-col items-center justify-center">
                    {React.createElement(typeIcon[currentPending.type], { className: 'h-16 w-16 text-[var(--text-muted)]' })}
                    <span className="mt-2 text-xs font-semibold text-[var(--text-secondary)] uppercase dark:text-slate-300">{currentPending.type}</span>
                  </div>
                )}
                <div className="mt-2 w-full text-center text-[11px] text-[var(--text-muted)] dark:text-slate-400 space-y-0.5">
                  <p className="font-semibold text-[var(--text-secondary)] dark:text-slate-300">{formatBytes(currentPending.size)}</p>
                  {currentPending.width && currentPending.height && (
                    <p>{currentPending.width} × {currentPending.height} px</p>
                  )}
                </div>
              </div>

              {/* Form Metadata Fields */}
              <div className="md:col-span-7 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">
                    Display Name / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentPending.name}
                    onChange={(e) => updatePendingItem(activeUploadIndex, { name: e.target.value })}
                    className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Enter file display name..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">
                    Category / Folder <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={currentPending.folder}
                    onChange={(e) => updatePendingItem(activeUploadIndex, { folder: e.target.value })}
                    className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-2 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 bg-[var(--bg-card)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {FOLDERS.filter((f) => f !== 'All').map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={currentPending.description}
                    onChange={(e) => updatePendingItem(activeUploadIndex, { description: e.target.value })}
                    className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-1.5 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Add a detailed description for this media asset..."
                  />
                </div>

                {currentPending.type === 'image' && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">
                      Alt Text (Accessibility)
                    </label>
                    <input
                      type="text"
                      value={currentPending.altText}
                      onChange={(e) => updatePendingItem(activeUploadIndex, { altText: e.target.value })}
                      className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-1.5 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Image description for screen readers"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={currentPending.tagsInput}
                    onChange={(e) => updatePendingItem(activeUploadIndex, { tagsInput: e.target.value })}
                    className="w-full rounded-[8px] border border-[var(--border-color)] px-3 py-1.5 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. event, alumni, campus, photo"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Lightbox / Details Modal */}
      {lightboxItem && (
        <div onClick={() => setLightboxItem(null)} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[12px] border border-white/10 bg-[var(--bg-card)] shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <button type="button" onClick={() => setLightboxItem(null)} className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-slate-900">
              <X className="h-4 w-4" />
            </button>
            <div className="flex max-h-[85vh] flex-col md:flex-row overflow-y-auto">
              <div className="flex flex-1 items-center justify-center bg-[var(--bg-page)] p-6 min-h-[260px] dark:bg-slate-800">
                {lightboxItem.type === 'image' ? (
                  <ImageThumbnail src={lightboxItem.url} alt={lightboxItem.name} className="max-h-[70vh] w-auto rounded shadow-md" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    {React.createElement(typeIcon[lightboxItem.type], { className: 'h-24 w-24 text-slate-300 dark:text-slate-600' })}
                    <span className="mt-2 text-sm font-bold text-[var(--text-muted)] dark:text-slate-400 uppercase">{lightboxItem.type}</span>
                  </div>
                )}
              </div>

              <div className="w-full space-y-4 border-t border-[var(--border-color)] p-5 md:w-96 md:border-l md:border-t-0 bg-[var(--bg-card)] dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeColor[lightboxItem.type]}`}>
                    {lightboxItem.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingLightbox(!isEditingLightbox)}
                    className="inline-flex items-center gap-1 rounded-md border border-[var(--border-color)] px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Edit3 className="h-3 w-3" />
                    {isEditingLightbox ? 'View Details' : 'Edit Details'}
                  </button>
                </div>

                {!isEditingLightbox ? (
                  <>
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)] dark:text-white">{lightboxItem.name}</h3>
                      {lightboxItem.description && (
                        <p className="mt-1 text-xs text-[var(--text-secondary)] dark:text-slate-300">{lightboxItem.description}</p>
                      )}
                      {lightboxItem.altText && (
                        <p className="mt-1 text-[11px] text-[var(--text-muted)] italic">Alt: {lightboxItem.altText}</p>
                      )}
                    </div>

                    <dl className="space-y-2 text-xs text-[var(--text-secondary)] border-t border-b border-[var(--border-color)] py-3 dark:border-slate-800 dark:text-slate-300">
                      <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Category/Folder</dt><dd className="font-semibold text-[var(--text-primary)] dark:text-white">{lightboxItem.folder}</dd></div>
                      <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Size</dt><dd className="font-medium">{formatBytes(lightboxItem.size)}</dd></div>
                      {lightboxItem.width && lightboxItem.height && (
                        <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Dimensions</dt><dd className="font-medium">{lightboxItem.width} × {lightboxItem.height} px</dd></div>
                      )}
                      <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Uploaded</dt><dd className="font-medium">{lightboxItem.uploadedAt}</dd></div>
                      <div className="flex justify-between"><dt className="text-[var(--text-muted)]">By</dt><dd className="font-medium">{lightboxItem.uploadedBy}</dd></div>
                    </dl>

                    <div className="flex flex-wrap gap-1.5">
                      {lightboxItem.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-[var(--bg-page)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] dark:bg-slate-800 dark:text-slate-300">#{tag}</span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2">
                      <button type="button" onClick={() => copyMediaUrl(lightboxItem)} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 cursor-pointer">
                        <Link2 className="h-3.5 w-3.5" /> Copy File URL
                      </button>
                      <button type="button" onClick={() => downloadMediaAsset(lightboxItem)} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer">
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                      <button type="button" onClick={() => handleDeleteSingle(lightboxItem)} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" /> Delete Media Asset
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full rounded-[6px] border border-[var(--border-color)] px-2.5 py-1.5 text-xs outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">Folder</label>
                      <select
                        value={editForm.folder}
                        onChange={(e) => setEditForm({ ...editForm, folder: e.target.value })}
                        className="w-full rounded-[6px] border border-[var(--border-color)] px-2.5 py-1.5 text-xs outline-none focus:border-[#003580] bg-[var(--bg-card)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {FOLDERS.filter((f) => f !== 'All').map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full rounded-[6px] border border-[var(--border-color)] px-2.5 py-1.5 text-xs outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {lightboxItem.type === 'image' && (
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">Alt Text</label>
                        <input
                          type="text"
                          value={editForm.altText}
                          onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                          className="w-full rounded-[6px] border border-[var(--border-color)] px-2.5 py-1.5 text-xs outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-200 mb-1">Tags (Comma separated)</label>
                      <input
                        type="text"
                        value={editForm.tagsInput}
                        onChange={(e) => setEditForm({ ...editForm, tagsInput: e.target.value })}
                        className="w-full rounded-[6px] border border-[var(--border-color)] px-2.5 py-1.5 text-xs outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveLightboxEdit}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-[#003580] py-1.5 text-xs font-semibold text-white hover:brightness-110 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" /> Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingLightbox(false)}
                        className="rounded-md border border-[var(--border-color)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

