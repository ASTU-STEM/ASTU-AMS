import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Image as ImageIcon,
  GalleryHorizontal,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import MediaLibrary from './MediaLibrary';
import GalleryManagement from './GalleryManagement';

export default function MediaGalleryHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'gallery' ? 'gallery' : 'media';
  const [activeTab, setActiveTab] = useState<'media' | 'gallery'>(initialTab);

  const switchTab = (tab: 'media' | 'gallery') => {
    setActiveTab(tab);
    setSearchParams(tab === 'gallery' ? { tab: 'gallery' } : {});
  };

  return (
    <div className="space-y-6">
      {/* Unified Header & Switcher */}
      <AdminPageHeader
        title="Media & Gallery Hub"
        subtitle="Unified asset manager for uploaded files, documents, hero banners, and campus photo exhibitions."
        breadcrumbs={[
          { label: 'Content Management' },
          { label: 'Media & Gallery' },
        ]}
      >
        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => switchTab('media')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'bg-white text-astu-navy shadow-sm dark:bg-slate-700 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Media Library & Uploads</span>
          </button>
          <button
            type="button"
            onClick={() => switchTab('gallery')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-white text-astu-navy shadow-sm dark:bg-slate-700 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <GalleryHorizontal className="h-4 w-4" />
            <span>Public Campus Gallery</span>
          </button>
        </div>
      </AdminPageHeader>

      {/* Render Active Component */}
      <div className="pt-2">
        {activeTab === 'media' ? (
          <MediaLibrary hideHeader={true} />
        ) : (
          <GalleryManagement hideHeader={true} />
        )}
      </div>
    </div>
  );
}
