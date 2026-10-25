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
  Copy,
} from 'lucide-react';

export type ContentStatus = 'Published' | 'Draft' | 'Scheduled' | 'Needs Review' | 'Archived';
export type ContentType = 'page' | 'post' | 'announcement' | 'gallery' | 'event' | 'template';

export type ContentCardItem = {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  excerpt?: string;
  image?: string;
  author?: string;
  updatedAt?: string;
  scheduledFor?: string;
  scheduledIso?: string;
  publishedAt?: string;
  views?: number;
  tags?: string[];
  pinned?: boolean;
  featured?: boolean;
  language?: string;
  content?: string;
  category?: string;
  buttonText?: string;
  targetAudience?: string;
  registrationLink?: string;
  requiresRegistration?: boolean;
  registeredCount?: number;
  registrationCapacity?: number;
  registrationDeadline?: string;
  registrationType?: string;
};

const statusStyles: Record<ContentStatus, string> = {
  Published: 'bg-emerald-50 text-emerald-700',
  Draft: 'bg-slate-100 text-slate-500',
  Scheduled: 'bg-blue-50 text-blue-700',
  'Needs Review': 'bg-orange-50 text-orange-700',
  Archived: 'bg-slate-100 text-slate-400',
};

const statusIcons: Record<ContentStatus, React.ComponentType<{ className?: string }>> = {
  Published: CheckCircle2,
  Draft: FileText,
  Scheduled: Clock,
  'Needs Review': AlertCircle,
  Archived: Archive,
};

const typeColors: Record<ContentType, string> = {
  page: 'bg-blue-100 text-blue-700',
  post: 'bg-teal-100 text-teal-700',
  announcement: 'bg-amber-100 text-amber-700',
  gallery: 'bg-purple-100 text-purple-700',
  event: 'bg-rose-100 text-rose-700',
  template: 'bg-slate-100 text-slate-700',
};

export type ContentCardProps = {
  item: ContentCardItem;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onPreview?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPublish?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleFeature?: (id: string) => void;
  onMore?: (id: string) => void;
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
  onDuplicate,
  onSchedule,
  onDelete,
  onTogglePin,
  onToggleFeature,
  onMore,
  onClick,
  compact = false,
}: ContentCardProps) {
  const StatusIcon = statusIcons[item.status];

  return (
    <div
      onClick={() => onClick?.(item.id)}
      className={`group relative flex flex-col gap-5 rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:border-slate-700 ${
        selected ? 'border-[#003580] bg-[#003580]/3 shadow-md ring-1 ring-[#003580]/10 dark:border-sky-500 dark:ring-sky-500/20' : 'border-slate-200 shadow-sm hover:border-slate-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top row: badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {onSelect && (
            <input
              type="checkbox"
              checked={!!selected}
              onClick={(event) => event.stopPropagation()}
              onChange={() => onSelect(item.id)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[#003580] focus:ring-[#003580]"
            />
          )}
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeColors[item.type]}`}>
            {item.type}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[item.status]}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {item.status}
          </span>
          {item.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          {item.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-950/40 px-2 py-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>
        {item.language && (
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md">
            {item.language}
          </span>
        )}
      </div>

      {/* Title + excerpt */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#003580] dark:group-hover:text-sky-400 transition-colors">
          {item.title}
        </h3>
        {!compact && item.excerpt && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{item.excerpt}</p>
        )}
      </div>

      {/* Tags */}
      {!compact && item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[11px] font-medium text-slate-400">+{item.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-400 dark:text-slate-500">
        {item.author && (
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {item.author}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {item.updatedAt}
        </span>
        {item.views !== undefined && (
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> {item.views.toLocaleString()}
          </span>
        )}
        {item.scheduledFor && (
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Calendar className="h-3.5 w-3.5" /> {item.scheduledFor}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4" onClick={(event) => event.stopPropagation()}>
        {onPreview && (
          <button type="button" onClick={() => onPreview(item.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer" title="Preview">
            <Eye className="h-5 w-5" />
          </button>
        )}
        {onEdit && (
          <button type="button" onClick={() => onEdit(item.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer" title="Edit">
            <Edit3 className="h-5 w-5" />
          </button>
        )}
        {onDuplicate && (
          <button type="button" onClick={() => onDuplicate(item.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer" title="Duplicate / Copy">
            <Copy className="h-4 w-4" />
          </button>
        )}
        {onPublish && (item.status === 'Draft' || item.status === 'Needs Review') && (
          <button type="button" onClick={() => onPublish(item.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer" title="Publish">
            <Send className="h-5 w-5" />
          </button>
        )}
        {onSchedule && (
          <button type="button" onClick={() => onSchedule(item.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all cursor-pointer" title="Schedule">
            <Calendar className="h-5 w-5" />
          </button>
        )}
        {onTogglePin && (
          <button type="button" onClick={() => onTogglePin(item.id)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-all cursor-pointer ${
              item.pinned ? 'border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400'
            }`} title={item.pinned ? 'Unpin' : 'Pin'}>
            <Pin className="h-5 w-5" />
          </button>
        )}
        {onToggleFeature && (
          <button type="button" onClick={() => onToggleFeature(item.id)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-all cursor-pointer ${
              item.featured ? 'border-violet-300 dark:border-violet-700 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400'
            }`} title={item.featured ? 'Remove Featured' : 'Mark Featured'}>
            <Star className="h-5 w-5" />
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={() => onDelete(item.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer" title="Delete">
            <Trash2 className="h-5 w-5" />
          </button>
        )}
        <button type="button" onClick={() => (onMore ? onMore(item.id) : onPreview?.(item.id))}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer" title="More Options">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
