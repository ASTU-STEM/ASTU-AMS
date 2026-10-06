import React, { useRef, useState } from 'react';
import { Upload, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import contentService from '../services/content.service';
import config from '../../../config';

const { mediaUrl } = config;

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Image File',
  className = '',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // The image is stored by the backend media store; we only keep the URL it
    // returns. Base64 data URIs used to be stored inline in the config, which
    // bloated every config save and meant no backend-owned media asset.
    setUploading(true);
    try {
      const url = await contentService.uploadCmsImage(file);
      onChange(url);
      toast.success(`Image uploaded: ${file.name}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-semibold text-[var(--text-secondary)]">{label}</label>}

      {value ? (
        <div className="relative group rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-2 overflow-hidden flex items-center gap-3">
          <img
            src={mediaUrl(value)}
            alt="Uploaded preview"
            className="h-16 w-24 rounded-lg object-cover border border-[var(--border-color)] shrink-0 bg-[var(--bg-card)]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = 'hidden';
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate flex items-center gap-1">
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 text-[#003580] shrink-0 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              )}
              {uploading ? 'Uploading to server…' : 'Image Selected'}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
              {value.startsWith('data:') ? 'Local Image File (Base64)' : mediaUrl(value)}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-1 text-[11px] font-semibold text-[#003580] hover:underline disabled:opacity-50"
            >
              Change Image
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Remove Image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
            dragActive
              ? 'border-[#003580] bg-[#003580]/5'
              : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[#003580]/50 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs border border-[var(--border-color)] text-[#003580] mb-2">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-[var(--text-primary)]">
            Click to upload image <span className="font-normal text-[var(--text-muted)]">or drag and drop</span>
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Supports PNG, JPG, GIF or WebP (max 5MB)</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) void handleFile(e.target.files[0]);
        }}
        className="hidden"
      />
    </div>
  );
}
