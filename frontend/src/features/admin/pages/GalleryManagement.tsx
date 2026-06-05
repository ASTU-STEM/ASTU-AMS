import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Film,
  FolderPlus,
  GraduationCap,
  Image,
  ImagePlus,
  Microscope,
  MoreHorizontal,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';

type GalleryStatus = 'Approved' | 'Pending Review' | 'Rejected';

const albums = [
  { name: 'Event Gallery', items: 148, icon: Image, tone: 'text-[#003580]', bg: 'bg-[#003580]/10' },
  { name: 'Workshop Gallery', items: 82, icon: Film, tone: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10' },
  { name: 'Graduation Gallery', items: 236, icon: GraduationCap, tone: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10' },
  { name: 'Campus Gallery', items: 64, icon: ImagePlus, tone: 'text-violet-600', bg: 'bg-violet-500/10' },
  { name: 'Research Gallery', items: 39, icon: Microscope, tone: 'text-cyan-700', bg: 'bg-cyan-500/10' },
];

const mediaItems: Array<{ title: string; type: string; album: string; status: GalleryStatus; uploadedBy: string }> = [
  { title: 'AI Workshop Opening Session', type: 'Video', album: 'Workshop Gallery', status: 'Pending Review', uploadedBy: 'CSE Department' },
  { title: '2026 Graduation Main Stage', type: 'Photo', album: 'Graduation Gallery', status: 'Approved', uploadedBy: 'Registrar Office' },
  { title: 'Research Expo Robotics Booth', type: 'Photo', album: 'Research Gallery', status: 'Approved', uploadedBy: 'Research Directorate' },
  { title: 'Alumni Career Day Panel', type: 'Video', album: 'Event Gallery', status: 'Pending Review', uploadedBy: 'Alumni Office' },
  { title: 'Campus Library Renovation', type: 'Photo', album: 'Campus Gallery', status: 'Rejected', uploadedBy: 'Public Relations' },
];

const statusClasses: Record<GalleryStatus, string> = {
  Approved: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  'Pending Review': 'border-[#E8A020]/20 bg-[#E8A020]/10 text-[#B87900]',
  Rejected: 'border-[#E24B4A]/20 bg-[#E24B4A]/10 text-[#E24B4A]',
};

export default function GalleryManagement() {
  const [activeAlbum, setActiveAlbum] = useState(albums[0].name);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gallery Management"
        subtitle="Upload photos and videos, create albums, organize event/workshop/graduation/campus/research galleries, and approve submitted media."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Gallery' }]}
        actions={<AdminBadge variant="warning">Approval Workflow Enabled</AdminBadge>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {albums.map((album) => {
          const Icon = album.icon;
          const active = activeAlbum === album.name;
          return (
            <button
              key={album.name}
              type="button"
              onClick={() => setActiveAlbum(album.name)}
              className={`rounded-[10px] border p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/30 ${active ? 'border-[#003580] bg-[#003580]/5' : 'border-slate-200 bg-white'}`}
            >
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] ${album.bg} ${album.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{album.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{album.items} approved media files</p>
            </button>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-slate-900">Upload Photos & Videos</h2>
            <p className="mt-1 text-xs text-slate-500">Accepts image and video files for approval before publishing.</p>
            <label className="mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#003580]/30 bg-[#003580]/5 p-4 text-center">
              <Upload className="h-8 w-8 text-[#003580]" />
              <span className="mt-3 text-sm font-semibold text-slate-900">Drop files or browse</span>
              <span className="mt-1 text-xs text-slate-500">Photos, videos, posters, gallery thumbnails</span>
              <input type="file" accept="image/*,video/*" multiple className="sr-only" />
            </label>
          </div>

          <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-slate-900">Create Albums</h2>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="Album name" />
              <select className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]">
                <option>Event Gallery</option>
                <option>Workshop Gallery</option>
                <option>Graduation Gallery</option>
                <option>Campus Gallery</option>
                <option>Research Gallery</option>
              </select>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-3 py-2 text-sm font-semibold text-white">
                <FolderPlus className="h-4 w-4" />
                Create Album
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{activeAlbum} Media Review</h2>
              <p className="mt-1 text-xs text-slate-500">Approve, reject, edit metadata, or delete public gallery assets.</p>
            </div>
            <AdminBadge variant="info">{mediaItems.filter((item) => item.status === 'Pending Review').length} pending</AdminBadge>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Media</th>
                  <th className="px-4 py-3 font-semibold">Album</th>
                  <th className="px-4 py-3 font-semibold">Uploaded By</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mediaItems.map((item) => (
                  <tr key={item.title} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.type}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.album}</td>
                    <td className="px-4 py-3 text-slate-600">{item.uploadedBy}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClasses[item.status]}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-emerald-100 bg-emerald-50 text-emerald-600" aria-label="Approve media">
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-rose-100 bg-rose-50 text-rose-600" aria-label="Reject media">
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600" aria-label="Edit image">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600" aria-label="More actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-rose-100 bg-rose-50 text-rose-600" aria-label="Delete image">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
