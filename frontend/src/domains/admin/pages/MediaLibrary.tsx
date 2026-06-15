import React, { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Download,
  FileText,
  Filter,
  Folder,
  Grid3x3,
  Image as ImageIcon,
  List,
  Music,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminBadge from "../components/AdminBadge";

type MediaType = "image" | "video" | "audio" | "document";
type MediaItem = {
  id: string;
  name: string;
  url?: string;
  type: MediaType;
  size: number;
  folder: string;
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  width?: number;
  height?: number;
  duration?: string;
};

const FOLDERS = [
  "All",
  "Hero Banners",
  "Event Photos",
  "Documents",
  "Logos",
  "Videos",
  "Audio",
];

const sampleMedia: MediaItem[] = [
  {
    id: "m-1",
    name: "astu-campus-aerial.jpg",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?w=600",
    type: "image",
    size: 248000,
    folder: "Hero Banners",
    tags: ["campus", "aerial"],
    uploadedAt: "2 days ago",
    uploadedBy: "PR Team",
    width: 1920,
    height: 1080,
  },
  {
    id: "m-2",
    name: "graduation-2026-1.jpg",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600",
    type: "image",
    size: 312000,
    folder: "Event Photos",
    tags: ["graduation"],
    uploadedAt: "1 week ago",
    uploadedBy: "Registrar",
    width: 1920,
    height: 1280,
  },
  {
    id: "m-3",
    name: "career-fair-booth.jpg",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600",
    type: "image",
    size: 198000,
    folder: "Event Photos",
    tags: ["career", "fair"],
    uploadedAt: "3 days ago",
    uploadedBy: "Career Services",
    width: 1600,
    height: 900,
  },
  {
    id: "m-4",
    name: "research-lab-1.jpg",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600",
    type: "image",
    size: 274000,
    folder: "Hero Banners",
    tags: ["research"],
    uploadedAt: "4 days ago",
    uploadedBy: "Research",
    width: 1920,
    height: 1080,
  },
  {
    id: "m-5",
    name: "partnership-summit.mp4",
    type: "video",
    size: 12400000,
    folder: "Videos",
    tags: ["partnership"],
    uploadedAt: "Yesterday",
    uploadedBy: "Industry Liaison",
    duration: "04:21",
  },
  {
    id: "m-6",
    name: "alumni-handbook-2026.pdf",
    type: "document",
    size: 2400000,
    folder: "Documents",
    tags: ["alumni", "handbook"],
    uploadedAt: "2 weeks ago",
    uploadedBy: "Alumni Office",
  },
  {
    id: "m-7",
    name: "astu-logo-primary.png",
    type: "image",
    size: 38000,
    folder: "Logos",
    tags: ["logo", "brand"],
    uploadedAt: "1 month ago",
    uploadedBy: "Brand Team",
    width: 350,
    height: 350,
  },
  {
    id: "m-8",
    name: "student-innovation.jpg",
    url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600",
    type: "image",
    size: 220000,
    folder: "Event Photos",
    tags: ["innovation"],
    uploadedAt: "5 days ago",
    uploadedBy: "PR Team",
    width: 1920,
    height: 1280,
  },
  {
    id: "m-9",
    name: "alumni-podcast-ep-12.mp3",
    type: "audio",
    size: 8200000,
    folder: "Audio",
    tags: ["podcast"],
    uploadedAt: "1 week ago",
    uploadedBy: "Alumni Office",
    duration: "32:11",
  },
  {
    id: "m-10",
    name: "campus-library.jpg",
    url: "https://images.unsplash.com/photo-1568667256549-094345857637?w=600",
    type: "image",
    size: 245000,
    folder: "Hero Banners",
    tags: ["library", "campus"],
    uploadedAt: "2 weeks ago",
    uploadedBy: "PR Team",
    width: 1920,
    height: 1080,
  },
  {
    id: "m-11",
    name: "alumni-handbook-amharic.pdf",
    type: "document",
    size: 2100000,
    folder: "Documents",
    tags: ["alumni", "handbook", "amharic"],
    uploadedAt: "3 weeks ago",
    uploadedBy: "Alumni Office",
  },
  {
    id: "m-12",
    name: "engineering-workshop.mp4",
    type: "video",
    size: 18200000,
    folder: "Videos",
    tags: ["workshop", "engineering"],
    uploadedAt: "1 month ago",
    uploadedBy: "Engineering Dept",
    duration: "12:48",
  },
];

const typeIcon: Record<
  MediaType,
  React.ComponentType<{ className?: string }>
> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
};
const typeColor: Record<MediaType, string> = {
  image: "bg-blue-100 text-blue-700",
  video: "bg-rose-100 text-rose-700",
  audio: "bg-violet-100 text-violet-700",
  document: "bg-slate-100 text-slate-700",
};
const formatBytes = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};


/* ─── StatCard Component ─── */
function StatCard({
  label, value, icon: Icon, color, trend,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
          style={{ backgroundColor: color + '15' }}
        >
          <span style={{ color }}><Icon className="h-5 w-5" /></span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5" style={{ color, background: color + '12' }}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
    </div>
  );
}

export default function MediaLibrary() {

  const [media, setMedia] = useState<MediaItem[]>(sampleMedia);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaType>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  const filtered = useMemo(() => {
    return media.filter((m) => {
      if (folder !== "All" && m.folder !== folder) return false;
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [media, folder, typeFilter, search]);

  const counts = useMemo(() => {
    const total = media.length;
    const images = media.filter((m) => m.type === "image").length;
    const videos = media.filter((m) => m.type === "video").length;
    const docs = media.filter((m) => m.type === "document").length;
    const audio = media.filter((m) => m.type === "audio").length;
    const totalSize = media.reduce((sum, m) => sum + m.size, 0);
    return { total, images, videos, docs, audio, totalSize };
  }, [media]);

  const toggleSelect = (id: string) =>
    setSelectedIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    setMedia((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
    toast.success(`${selectedIds.length} item(s) deleted`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      {/* Signature Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003580] via-[#004499] to-[#1D9E75] p-8 shadow-[0_8px_30px_rgba(0,51,128,0.3)]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_0%,transparent_40%,rgba(232,160,32,0.08)_60%,transparent_100%)]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8A020] animate-pulse" />
                Asset Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Media Library
            </h1>
            <p className="mt-1 text-sm text-white/80 max-w-2xl">
              Manage and moderate institutional digital assets: high-resolution
              images, video content, and official documentation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2.5 rounded-xl bg-white text-[#003580] px-6 py-3 text-sm font-bold shadow-lg hover:brightness-110 transition-all hover:scale-105"
            >
              <Upload className="h-5 w-5" />
              Upload Media
            </button>
          </div>
        </div>
      </div>

      {/* Unified Stats Grid */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        <StatCard
          label="Total Files"
          value={counts.total}
          icon={ImageIcon}
          color="#003580"
          trend="Active storage"
        />
        <StatCard
          label="Images"
          value={counts.images}
          icon={ImageIcon}
          color="#1D9E75"
          trend="Optimized"
        />
        <StatCard
          label="Videos"
          value={counts.videos}
          icon={Video}
          color="#E24B4A"
          trend="HD resolution"
        />
        <StatCard
          label="Audio"
          value={counts.audio}
          icon={Music}
          color="#7C3AED"
          trend="Broadcast quality"
        />
        <StatCard
          label="Cloud Space"
          value={formatBytes(counts.totalSize)}
          icon={FileText}
          color="#E8A020"
          trend="Usage"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files and tags..."
              className="w-full rounded-[8px] border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded ${view === "grid" ? "bg-[#003580] text-white" : "text-slate-500"}`}
              title="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded ${view === "list" ? "bg-[#003580] text-white" : "text-slate-500"}`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
          {FOLDERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFolder(f)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                folder === f
                  ? "border-[#003580] bg-[#003580] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#003580]/40"
              }`}
            >
              {f === "All" ? (
                <Filter className="h-3 w-3" />
              ) : (
                <Folder className="h-3 w-3" />
              )}
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "image", "video", "audio", "document"] as const).map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  typeFilter === t
                    ? "bg-slate-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t === "all" ? "All Types" : t}
              </button>
            ),
          )}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-[10px] border border-[#003580]/30 bg-[#003580]/5 px-4 py-2 shadow-sm">
          <span className="text-sm font-semibold text-[#003580]">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toast.success("Download started")}
              className="inline-flex items-center gap-1 rounded-md bg-[#003580] px-2.5 py-1 text-xs font-semibold text-white"
            >
              <Download className="h-3 w-3" /> Download
            </button>
            <button
              type="button"
              onClick={deleteSelected}
              className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filtered.map((m) => {
            const Icon = typeIcon[m.type];
            const selected = selectedIds.includes(m.id);
            return (
              <div
                key={m.id}
                className={`group relative flex flex-col overflow-hidden rounded-[10px] border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  selected
                    ? "border-[#003580] ring-2 ring-[#003580]/30"
                    : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setLightboxItem(m)}
                  className="relative aspect-video w-full overflow-hidden bg-slate-100"
                >
                  {m.type === "image" && m.url ? (
                    <img
                      src={m.url}
                      alt={m.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <span
                    className={`absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${typeColor[m.type]}`}
                  >
                    {m.type}
                  </span>
                </button>
                <div className="p-2">
                  <p className="truncate text-[11px] font-semibold text-slate-800">
                    {m.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {formatBytes(m.size)}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {m.folder}
                  </p>
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
            <div className="col-span-full rounded-[10px] border border-dashed border-slate-300 bg-white p-10 text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">
                No media found
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try a different filter or upload new media to get started.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Folder</th>
                <th className="px-3 py-2 font-semibold">Size</th>
                <th className="px-3 py-2 font-semibold">Uploaded</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => {
                const Icon = typeIcon[m.type];
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {m.type === "image" && m.url ? (
                          <img
                            src={m.url}
                            alt={m.name}
                            className="h-8 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-12 items-center justify-center rounded bg-slate-100">
                            <Icon className="h-4 w-4 text-slate-500" />
                          </div>
                        )}
                        <span className="font-medium text-slate-800">
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs uppercase text-slate-500">
                      {m.type}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {m.folder}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {formatBytes(m.size)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {m.uploadedAt}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setLightboxItem(m)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                          title="Preview"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success("Download started")}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMedia((prev) =>
                              prev.filter((x) => x.id !== m.id),
                            );
                            toast.success("Deleted");
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    No media files match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[12px] border border-white/10 bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex max-h-[80vh] flex-col md:flex-row">
              <div className="flex flex-1 items-center justify-center bg-slate-100 p-4">
                {lightboxItem.type === "image" && lightboxItem.url ? (
                  <img
                    src={lightboxItem.url}
                    alt={lightboxItem.name}
                    className="max-h-[70vh] w-auto rounded"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center">
                    {React.createElement(typeIcon[lightboxItem.type], {
                      className: "h-24 w-24 text-slate-300",
                    })}
                  </div>
                )}
              </div>
              <div className="w-full space-y-3 border-t border-slate-200 p-5 md:w-80 md:border-l md:border-t-0">
                <h3 className="text-base font-semibold text-slate-900">
                  {lightboxItem.name}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeColor[lightboxItem.type]}`}
                >
                  {lightboxItem.type}
                </span>
                <dl className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Folder</dt>
                    <dd className="font-medium">{lightboxItem.folder}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Size</dt>
                    <dd className="font-medium">
                      {formatBytes(lightboxItem.size)}
                    </dd>
                  </div>
                  {lightboxItem.width && (
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Dimensions</dt>
                      <dd className="font-medium">
                        {lightboxItem.width} × {lightboxItem.height}
                      </dd>
                    </div>
                  )}
                  {lightboxItem.duration && (
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Duration</dt>
                      <dd className="font-medium">{lightboxItem.duration}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Uploaded</dt>
                    <dd className="font-medium">{lightboxItem.uploadedAt}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">By</dt>
                    <dd className="font-medium">{lightboxItem.uploadedBy}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-1.5">
                  {lightboxItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5 pt-2">
                  <button
                    type="button"
                    onClick={() => toast.success("Copied URL")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#003580] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success("Downloaded")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
