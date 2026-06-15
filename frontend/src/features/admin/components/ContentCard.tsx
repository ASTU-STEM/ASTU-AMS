import React from 'react';
import {
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileText,
  MoreHorizontal,
  Pin,
  Send,
  Sparkles,
  Star,
  Trash2,
  User,
  Calendar,
  AlertCircle,
  Archive,
  Globe,
  Image as ImageIcon,
  Megaphone,
  Layout,
  Layers,
} from 'lucide-react';

export type ContentStatus = 'Published' | 'Draft' | 'Scheduled' | 'Needs Review' | 'Archived';
export type ContentType = 'page' | 'post' | 'announcement' | 'gallery' | 'event' | 'template';

export type ContentCardItem = {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  excerpt?: string;
  author?: string;
  updatedAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  views?: number;
  tags?: string[];
  pinned?: boolean;
  featured?: boolean;
  language?: string;
  seoScore?: number;
  wordCount?: number;
  readTime?: string;
  slug?: string;
};

const statusStyles: Record<ContentStatus, { badge: string; icon: string; text: string }> = {
  Published: {
    badge: 'bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    icon: 'text-emerald-500',
    text: 'Published',
  },
  Draft: {
    badge: 'bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/30 text-slate-600 dark:text-slate-350',
    icon: 'text-slate-400',
    text: 'Draft',
  },
  Scheduled: {
    badge: 'bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/30 text-blue-700 dark:text-blue-400',
    icon: 'text-blue-500',
    text: 'Scheduled',
  },
  'Needs Review': {
    badge: 'bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/30 text-amber-700 dark:text-amber-400',
    icon: 'text-amber-500',
    text: 'Review Needed',
  },
  Archived: {
    badge: 'bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800/30 text-slate-400 dark:text-slate-500',
    icon: 'text-slate-400',
    text: 'Archived',
  },
};

const statusIcons: Record<ContentStatus, React.ComponentType<{ className?: string }>> = {
  Published: CheckCircle2,
  Draft: FileText,
  Scheduled: Clock,
  'Needs Review': AlertCircle,
  Archived: Archive,
};

const typeMeta: Record<ContentType, { gradient: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  page: {
    gradient: 'from-blue-600/90 via-indigo-600/90 to-violet-600/90 dark:from-blue-800/60 dark:to-indigo-900/60',
    label: 'Standard Page',
    icon: Globe,
  },
  post: {
    gradient: 'from-teal-500/90 via-cyan-600/90 to-blue-600/90 dark:from-teal-850/60 dark:to-blue-900/60',
    label: 'Blog Post',
    icon: FileText,
  },
  announcement: {
    gradient: 'from-amber-500/90 via-orange-500/90 to-rose-600/90 dark:from-amber-850/60 dark:to-rose-950/60',
    label: 'Announcement',
    icon: Megaphone,
  },
  gallery: {
    gradient: 'from-purple-600/90 via-pink-650/90 to-rose-500/90 dark:from-purple-900/60 dark:to-rose-950/60',
    label: 'Photo Gallery',
    icon: ImageIcon,
  },
  event: {
    gradient: 'from-rose-500/90 via-red-650/90 to-orange-500/90 dark:from-rose-900/60 dark:to-orange-950/60',
    label: 'Campus Event',
    icon: Calendar,
  },
  template: {
    gradient: 'from-slate-650 via-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900',
    label: 'Layout Template',
    icon: Layout,
  },
};

export type ContentCardProps = {
  item: ContentCardItem;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onPreview?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPublish?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleFeature?: (id: string) => void;
  onClick?: (id: string) => void;
  compact?: boolean;
};

export default function ContentCard({
  item,
  selected,
  onSelect,
  onPreview,
  onEdit,
  onPublish,
  onSchedule,
  onDelete,
  onTogglePin,
  onToggleFeature,
  onClick,
  compact = false,
}: ContentCardProps) {
  const StatusIcon = statusIcons[item.status];
  const typeDetails = typeMeta[item.type];
  const CoverIcon = typeDetails.icon;
  const statusDetail = statusStyles[item.status];

  return (
    <div
      onClick={() => onClick?.(item.id)}
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white dark:bg-[#1a1d27] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${
        selected
          ? 'border-[#003580] dark:border-[#3b82f6] bg-[#003580]/[0.02] dark:bg-[#3b82f6]/[0.02] ring-2 ring-[#003580]/15 dark:ring-[#3b82f6]/15'
          : 'border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-slate-350 dark:hover:border-slate-700'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Cover Gradient/Graphic Header */}
      <div className={`relative h-28 w-full bg-gradient-to-br ${typeDetails.gradient} overflow-hidden flex items-center justify-center shrink-0`}>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Abstract shapes overlay for organic modern feel */}
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

        <CoverIcon className="h-10 w-10 text-white/30 drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-125 group-hover:rotate-6" />

        {/* Floating Controls Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {onSelect && (
            <input
              type="checkbox"
              checked={!!selected}
              onChange={() => onSelect(item.id)}
              className="h-4.5 w-4.5 rounded border-white/40 bg-white/20 text-[#003580] backdrop-blur-md focus:ring-[#003580] focus:ring-offset-0 focus:outline-none cursor-pointer checked:border-[#003580]"
            />
          )}
          <span className="inline-flex items-center rounded-md bg-white/15 dark:bg-black/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm border border-white/10">
            {item.type}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${statusDetail.badge}`}>
            <StatusIcon className="h-3 w-3" />
            {statusDetail.text}
          </span>
        </div>

        {/* Floating Pins */}
        <div className="absolute top-3 right-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {item.pinned && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/90 text-white shadow-sm backdrop-blur-sm" title="Pinned to top">
              <Pin className="h-3 w-3 fill-current" />
            </span>
          )}
          {item.featured && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/90 text-white shadow-sm backdrop-blur-sm" title="Featured content">
              <Sparkles className="h-3 w-3 fill-current" />
            </span>
          )}
        </div>

        {/* Language Badge */}
        {item.language && (
          <span className="absolute bottom-2 right-3 text-[9px] font-bold uppercase tracking-wider text-white/80 bg-black/25 px-1.5 py-0.5 rounded border border-white/5 backdrop-blur-sm">
            {item.language}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-grow flex-col justify-between p-5">
        <div className="space-y-2.5">
          {/* Title with hover color interpolation */}
          <h3 className="text-[15px] font-bold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2 transition-colors duration-200 group-hover:text-[#003580] dark:group-hover:text-[#3b82f6]">
            {item.title}
          </h3>

          {/* Excerpt */}
          {!compact && item.excerpt && (
            <p className="text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              {item.excerpt}
            </p>
          )}

          {/* Tags */}
          {!compact && item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 px-2 py-0.5 text-[10.5px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 self-center">
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Scheduled release indicator */}
          {item.status === 'Scheduled' && item.scheduledFor && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 p-2 text-[11px] text-blue-600 dark:text-blue-400">
              <Clock className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="font-semibold">Release: {item.scheduledFor}</span>
            </div>
          )}
        </div>

        {/* Metadata section & actions */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500">
            {item.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> <span className="truncate max-w-[90px]">{item.author}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {item.updatedAt}
            </span>
            {item.views !== undefined && item.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {item.views.toLocaleString()}
              </span>
            )}
          </div>

          {/* Interactive controls */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {onPreview && (
              <button
                type="button"
                onClick={() => onPreview(item.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm transition-all"
                title="Preview details"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(item.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:border-blue-300 dark:hover:border-blue-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all"
                title="Edit content"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            {onPublish && (item.status === 'Draft' || item.status === 'Needs Review') && (
              <button
                type="button"
                onClick={() => onPublish(item.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 shadow-sm transition-all animate-pulse"
                title="Publish live"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
            {onSchedule && (
              <button
                type="button"
                onClick={() => onSchedule(item.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 shadow-sm transition-all"
                title="Schedule publish"
              >
                <Clock className="h-4 w-4" />
              </button>
            )}
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(item.id)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-all ${
                  item.pinned
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:border-amber-300 dark:hover:border-amber-950 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
                title={item.pinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className="h-4 w-4" />
              </button>
            )}
            {onToggleFeature && (
              <button
                type="button"
                onClick={() => onToggleFeature(item.id)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-all ${
                  item.featured
                    ? 'border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/35 text-violet-600 dark:text-violet-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:border-violet-300 dark:hover:border-violet-950 hover:bg-violet-50/30 dark:hover:bg-violet-950/10 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
                title={item.featured ? 'Remove from featured' : 'Mark as featured'}
              >
                <Star className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-250 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-450 hover:bg-rose-100/70 dark:hover:bg-rose-900/40 shadow-sm transition-all"
                title="Delete content"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-350 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-500 dark:hover:text-slate-400 transition-all"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

