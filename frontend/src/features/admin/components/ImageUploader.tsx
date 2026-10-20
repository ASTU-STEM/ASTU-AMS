import React, { useRef, useState } from 'react';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import homepageCmsService from '../services/homepageCms.service';
import { mediaUrl } from '../../../config';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  album?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Image File',
  className = '',
  album = 'General',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (isUploading) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const asset = await homepageCmsService.uploadMedia(file, album, file.name);
      onChange(asset.url);
      toast.success(`Image uploaded: ${file.name}`);
    } catch {
      toast.error('Image upload failed. Please check the server connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      {value ? (
        <div className="relative group rounded-xl border border-slate-200 bg-slate-50 p-2 overflow-hidden flex items-center gap-3">
          <img
            src={mediaUrl(value)}
            alt="Uploaded preview"
            className="h-16 w-24 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/fallback-campus.svg';
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Image Selected
            </p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {value.startsWith('data:') ? 'Legacy local image (please re-upload)' : value}
            </p>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 text-[11px] font-semibold text-[#003580] hover:underline disabled:cursor-wait disabled:opacity-60"
            >
              {isUploading ? 'Uploading…' : 'Change Image'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
              : 'border-slate-300 bg-slate-50/60 hover:border-[#003580]/50 hover:bg-slate-50'
          }`}
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs border border-slate-200 text-[#003580] mb-2">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            {isUploading ? 'Uploading image to the CMS…' : <>Click to upload image <span className="font-normal text-slate-500">or drag and drop</span></>}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, GIF or WebP (max 5MB)</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        disabled={isUploading}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
        className="hidden"
      />
    </div>
  );
}
