import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Image as ImageIcon,
  Film,
  Building2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Edit3,
  Copy,
  Sparkles,
  Layers,
  Camera,
  FolderOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreatableCombobox from './CreatableCombobox';
import ImageUploader from './ImageUploader';

export type GalleryStatus = 'Approved' | 'Pending Review' | 'Rejected';

export interface GalleryMediaItem {
  id: string;
  title: string;
  type: 'Photo' | 'Video' | string;
  album: string;
  status: GalleryStatus;
  uploadedBy: string;
  date: string;
  src?: string;
  description?: string;
}

export interface GalleryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: Partial<GalleryMediaItem>) => void;
  onSwitchToEdit?: () => void;
  initialData?: Partial<GalleryMediaItem> | null;
  mode?: 'add' | 'edit' | 'view';
  albumsList?: string[];
}

const DEFAULT_ALBUMS = [
  'Event Gallery',
  'Workshop Gallery',
  'Graduation Gallery',
  'Campus Gallery',
  'Research Gallery',
  'Innovation Expo',
  'Athletics & Student Life',
];

const TYPE_PRESETS = ['Photo', 'Video'];

const STATUS_PRESETS = ['Approved', 'Pending Review', 'Rejected'];

const DEPARTMENT_PRESETS = [
  'Public Relations & Communications',
  'ICT Directorate',
  'Office of the Registrar',
  'Research & Technology Transfer Directorate',
  'School of Electrical Engineering & Computing',
  'School of Mechanical, Chemical & Materials',
  'Alumni Relations Office',
  'Student Welfare Directorate',
];

const PHOTO_PRESETS = [
  { name: 'Main Campus Admin', url: '/images/astu-building.jpg' },
  { name: 'Electrical Labs', url: '/images/electriclabs.jpeg' },
  { name: 'Graduation Hall', url: '/images/gc7.jpg' },
  { name: 'Research Arc', url: '/images/arc.jpg' },
  { name: 'Campus Walkway', url: '/images/campus-2.jpeg' },
  { name: 'State Innovation', url: '/images/State-M.jpg' },
];

export default function GalleryItemModal({
  isOpen,
  onClose,
  onSave,
  onSwitchToEdit,
  initialData,
  mode = 'add',
  albumsList = DEFAULT_ALBUMS,
}: GalleryItemModalProps) {
  const [formData, setFormData] = useState<Partial<GalleryMediaItem>>({
    title: '',
    album: 'Event Gallery',
    type: 'Photo',
    status: 'Approved',
    uploadedBy: 'Public Relations & Communications',
    src: '/images/astu-building.jpg',
    date: 'Just now',
    description: '',
  });

  const [previewMode, setPreviewMode] = useState<'home' | 'public'>('home');

  // Lock body scroll and keydown listener when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Sync initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        album: initialData.album || 'Event Gallery',
        type: initialData.type || 'Photo',
        status: initialData.status || 'Approved',
      });
    } else {
      setFormData({
        title: '',
        album: 'Event Gallery',
        type: 'Photo',
        status: 'Approved',
        uploadedBy: 'Public Relations & Communications',
        src: '/images/astu-building.jpg',
        date: 'Just now',
        description: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error('Item title is required');
      return;
    }
    if (onSave) {
      onSave(formData);
    }
  };

  const copyUrl = () => {
    if (formData.src) {
      navigator.clipboard.writeText(formData.src);
      toast.success('Media URL copied to clipboard!');
    }
  };

  const statusBadges: Record<GalleryStatus, { bg: string; text: string; icon: any }> = {
    Approved: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      icon: CheckCircle2,
    },
    'Pending Review': {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      icon: Clock,
    },
    Rejected: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
      icon: XCircle,
    },
  };

  const currentStatusInfo = statusBadges[formData.status as GalleryStatus] || statusBadges['Approved'];
  const StatusIcon = currentStatusInfo.icon;

  const modalNode = (
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/85 p-3 sm:p-5 md:p-6 backdrop-blur-md overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full ${
          mode === 'view' ? 'max-w-4xl' : 'max-w-6xl'
        } rounded-3xl border border-slate-700/80 bg-white shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Executive Header Banner with ASTU Seal Logo */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#00173d] via-[#002d6b] to-[#004899] px-6 py-4 text-white shadow-md border-b border-[#002254]/60">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute left-1/3 -bottom-10 h-28 w-28 rounded-full bg-[#1D9E75]/20 blur-xl" />
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Official ASTU Logo Badge */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md border border-white/30">
                <img
                  src="/images/astu-seal-logo.png"
                  alt="ASTU Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                    {mode === 'add' && 'Add Gallery Showcase Item'}
                    {mode === 'edit' && `Edit Media: ${formData.title || 'Item'}`}
                    {mode === 'view' && `Media Showcase: ${formData.title || 'Exhibition Item'}`}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                    ASTU Media System
                  </span>
                </div>
                <p className="text-[11px] font-medium text-blue-100/80 mt-0.5">
                  Adama Science & Technology University • Public Campus Media Archive
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-white/70 hover:bg-white/15 hover:text-white transition-all border border-transparent hover:border-white/20 active:scale-95 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ─── MODE: VIEW ONLY ─── */}
        {mode === 'view' ? (
          <div className="overflow-y-auto p-6 space-y-6">
            {/* Media Exhibition Frame */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg flex items-center justify-center min-h-[320px] max-h-[460px]">
              {formData.src ? (
                formData.type === 'Video' ? (
                  <video
                    src={formData.src}
                    controls
                    className="max-h-[460px] w-full object-contain"
                  />
                ) : (
                  <img
                    src={formData.src}
                    alt={formData.title}
                    className="max-h-[460px] w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                    }}
                  />
                )
              ) : (
                <div className="text-slate-400 text-center p-8">
                  <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No media file source</p>
                </div>
              )}

              {/* Floating Album Pill */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="rounded-lg bg-[#003580]/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-md border border-white/20 flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                  {formData.album || 'Campus Gallery'}
                </span>
                <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white border border-white/20">
                  {formData.type || 'Photo'}
                </span>
              </div>

              {/* Floating Status Pill */}
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold shadow-md border ${currentStatusInfo.bg} ${currentStatusInfo.text}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {formData.status}
                </span>
              </div>
            </div>

            {/* Media Information Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Media Title</span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 leading-snug">
                  {formData.title || 'Untitled Media Item'}
                </h1>
              </div>

              {formData.description && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-0.5">
                    {formData.description}
                  </p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1">
                    <User className="h-3.5 w-3.5 text-[#003580]" />
                    Uploaded By
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {formData.uploadedBy || 'Content Manager'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    Upload Date
                  </div>
                  <p className="text-xs font-bold text-slate-800">{formData.date || 'Recent'}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1">
                    <Layers className="h-3.5 w-3.5 text-emerald-500" />
                    Exhibition Target
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {formData.status === 'Approved' ? 'Live on Public' : 'Internal Review'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1">
                    <Building2 className="h-3.5 w-3.5 text-rose-500" />
                    Institution
                  </div>
                  <p className="text-xs font-bold text-slate-800">ASTU Main Campus</p>
                </div>
              </div>

              {/* Source Link & Copy */}
              {formData.src && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs">
                  <div className="min-w-0 flex-1 mr-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Direct Media URL</span>
                    <p className="font-mono text-slate-600 truncate text-[11px]">{formData.src}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy URL
                  </button>
                </div>
              )}
            </div>

            {/* Footer Actions for View Mode */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
              {onSwitchToEdit && (
                <button
                  type="button"
                  onClick={onSwitchToEdit}
                  className="rounded-xl bg-[#003580] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#002855] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Media Item
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ─── MODE: ADD / EDIT WITH SPLIT-SCREEN & LIVE PREVIEW ─── */
          <div className="grid lg:grid-cols-12 overflow-y-auto">
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-100">
              <form id="gallery-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>
                      Item Title <span className="text-rose-500 font-black">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g., 2026 Graduation Main Stage</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter descriptive title for this photo or video..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580] transition-all shadow-2xs"
                  />
                </div>

                {/* Album / Category & Type (Grid) */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <CreatableCombobox
                    label="Album / Category"
                    required
                    value={formData.album || 'Event Gallery'}
                    onChange={(val) => setFormData({ ...formData, album: val })}
                    placeholder="Select album or type custom..."
                    presets={albumsList}
                    icon={FolderOpen}
                  />

                  <CreatableCombobox
                    label="Media Type"
                    required
                    value={formData.type || 'Photo'}
                    onChange={(val) => setFormData({ ...formData, type: val })}
                    placeholder="Photo or Video..."
                    presets={TYPE_PRESETS}
                    icon={formData.type === 'Video' ? Film : ImageIcon}
                  />
                </div>

                {/* Status & Department (Grid) */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <CreatableCombobox
                    label="Review & Approval Status"
                    required
                    value={formData.status || 'Approved'}
                    onChange={(val) => setFormData({ ...formData, status: val as GalleryStatus })}
                    placeholder="Approved, Pending Review..."
                    presets={STATUS_PRESETS}
                    icon={StatusIcon}
                  />

                  <CreatableCombobox
                    label="Uploaded By / Department"
                    value={formData.uploadedBy || ''}
                    onChange={(val) => setFormData({ ...formData, uploadedBy: val })}
                    placeholder="e.g. Public Relations Directorate"
                    presets={DEPARTMENT_PRESETS}
                    icon={User}
                  />
                </div>

                {/* Description (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Exhibition Caption / Description</label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about the scene, speakers, research artifacts..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580] transition-all resize-none shadow-2xs"
                  />
                </div>

                {/* Image URL & Upload */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Media URL / File Source</label>
                    <input
                      type="text"
                      value={formData.src || ''}
                      onChange={(e) => setFormData({ ...formData, src: e.target.value })}
                      placeholder="https://... or /images/..."
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580] transition-all shadow-2xs"
                    />
                  </div>

                  <ImageUploader
                    label="Upload or Replace Photo / Video"
                    value={formData.src || ''}
                    onChange={(src) => setFormData({ ...formData, src })}
                  />

                  {/* 1-Click Quick Verified Campus Photos */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Quick Campus Media Presets:
                      </span>
                      <span className="text-[10px] text-slate-400">Click to apply instantly</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {PHOTO_PRESETS.map((preset) => {
                        const isChosen = formData.src === preset.url;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, src: preset.url })}
                            className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isChosen
                                ? 'border-[#003580] bg-blue-50/60 ring-2 ring-[#003580]/20'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-800 truncate">{preset.name}</p>
                              <p className="text-[9px] text-slate-400">Verified</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column: Interactive Live Preview (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50/80 p-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Live Preview Switcher */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Live Exhibition Preview
                    </span>
                  </div>

                  <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('home')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        previewMode === 'home'
                          ? 'bg-[#003580] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Homepage Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('public')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        previewMode === 'public'
                          ? 'bg-[#003580] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Public Grid
                    </button>
                  </div>
                </div>

                {/* Simulation Mode 1: Homepage Card */}
                {previewMode === 'home' && (
                  <div className="mt-4">
                    <p className="text-[10px] text-slate-400 mb-2 font-medium">
                      Simulated rendering on ASTU Homepage 3-Column Gallery:
                    </p>

                    <article
                      className="group relative overflow-hidden rounded-2xl shadow-md transition-all border border-slate-200"
                      style={{ aspectRatio: '4/3' }}
                    >
                      <img
                        src={formData.src || '/images/astu-building.jpg'}
                        alt={formData.title || 'Campus Gallery'}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                        }}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Floating Album Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="rounded-md bg-white/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-white/25">
                          {formData.album || 'Campus Gallery'}
                        </span>
                      </div>

                      {/* Bottom Title Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-bold text-sm line-clamp-1">
                          {formData.title || 'Exhibition Title'}
                        </p>
                        <p className="text-white/70 text-[11px] mt-0.5 flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> {formData.type || 'Photo'} • {formData.uploadedBy || 'ASTU'}
                        </p>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                          <ExternalLink className="h-3.5 w-3.5" /> View Gallery
                        </span>
                      </div>
                    </article>
                  </div>
                )}

                {/* Simulation Mode 2: Public Gallery Grid Card */}
                {previewMode === 'public' && (
                  <div className="mt-4">
                    <p className="text-[10px] text-slate-400 mb-2 font-medium">
                      Simulated rendering on <code className="text-[#003580]">/gallery</code> public directory grid:
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        <img
                          src={formData.src || '/images/astu-building.jpg'}
                          alt={formData.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                          }}
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-md bg-[#003580]/90 text-white px-2 py-0.5 text-[10px] font-bold">
                          {formData.album || 'Event Gallery'}
                        </span>
                        <span className="absolute top-2.5 right-2.5 rounded-md bg-white/90 text-slate-800 px-2 py-0.5 text-[10px] font-semibold">
                          {formData.type || 'Photo'}
                        </span>
                      </div>

                      <div className="p-4 space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {formData.title || 'Media Showcase Title'}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{formData.uploadedBy || 'Public Relations'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions inside Right Panel */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-xl bg-[#003580] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#002855] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  {mode === 'add' ? 'Publish to Gallery' : 'Save Media Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
