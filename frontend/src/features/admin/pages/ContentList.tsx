import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Archive,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Grid3x3,
  LayoutList,
  MoreHorizontal,
  Pin,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
  Bell,
  SlidersHorizontal,
  Layers3,
  Image as ImageIcon,
  Check,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  UserCheck,
  Quote,
  BookOpen,
  User,
  Clock,
  Tag,
  ArrowRight,
  Share2,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import ContentCard, { ContentCardItem, ContentStatus, ContentType } from '../components/ContentCard';
import ScheduleDialog, { ScheduleValue } from '../components/ScheduleDialog';
import AdminModal from '../components/AdminModal';
import ImageUploader from '../components/ImageUploader';
import contentService from '../services/content.service';
import homepageCmsService from '../services/homepageCms.service';
import announcementSettingsService, {
  AnnouncementPageSettings,
  defaultAnnouncementSettings,
} from '../services/announcementSettings.service';
import storiesService, { AlumniStory } from '../services/stories.service';

const categoryPresets = [
  'Official Announcement',
  'Academic Directive & Registrar',
  'Alumni Fellowship & Grants',
  'Career Opportunity & Job Expo',
  'Workshop & Skills Training',
  'Call for Papers & Research',
  'Institutional Notice',
  'Scholarship & Exchange',
  'Press Release & News',
];

const authorPresets = [
  'ASTU International Relations & Corporate Communication Directorate (IRCCD)',
  'Office of the Vice President for Academic Affairs',
  'ASTU Alumni Association & Students Skill Development Office',
  'ASTU Academic Registrar & Alumni Directorate',
  'ASTU Career & Entrepreneurship Center',
  'ASTU Research & Technology Transfer Directorate',
  'Office of the Dean of Students',
  'ASTU Directorate Notice',
];

const audiencePresets = [
  'All Alumni & General Public',
  'Graduating Seniors (Class of 2026)',
  'Engineering & Technology Alumni',
  'Postgraduate & PhD Scholars',
  'Corporate & Employer Partners',
  'Academic Staff & Faculty',
];

const priorityPresets = [
  'Official Notice',
  'Urgent / Important Notice',
  'High Priority Alert',
  'Featured Highlight',
  'Upcoming Deadline',
  'General University Update',
];

const actionButtonPresets = [
  'Read Full Notice',
  'Register Now',
  'Apply Online',
  'Download PDF Directive',
  'View Details',
  'Join Session',
];

const suggestedTags = [
  'announcement',
  'astu',
  'alumni',
  'career',
  'scholarship',
  'workshop',
  'urgent',
  'engineering',
  'official',
];

const quickImagePresets = [
  { label: 'Campus Arc', url: '/images/arc.jpg' },
  { label: 'Main Building', url: '/images/astu-building.jpg' },
  { label: 'Electric Labs', url: '/images/electriclabs.jpeg' },
  { label: 'Graduation Hall', url: '/images/gc7.jpg' },
  { label: 'Campus Aerial', url: '/images/campus-2.jpeg' },
];

/* ── CREATABLE COMBOBOX COMPONENT (Select OR Type Custom) ── */
interface CreatableComboboxProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  presets: string[];
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function CreatableCombobox({
  label,
  required,
  value,
  onChange,
  placeholder,
  presets,
  helperText,
  icon: Icon,
}: CreatableComboboxProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-rose-500 font-black">*</span>}
        </label>
        <span className="text-[10px] text-slate-400 font-medium">Select preset or type custom</span>
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580] transition-all pr-9 ${
              Icon ? 'pl-9' : 'pl-3.5'
            }`}
          />
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Presets Dropdown"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
                Suggested Presets (Click to choose or edit)
              </div>
              {presets.map((preset) => {
                const isSelected = value === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      onChange(preset);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#003580] font-bold dark:bg-sky-500/10 dark:text-sky-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{preset}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#003580] dark:text-sky-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
}

/* ── REAL-TIME ANNOUNCEMENT LIVE PREVIEW COMPONENT ── */
interface AnnouncementLivePreviewProps {
  title: string;
  category: string;
  author: string;
  targetAudience?: string;
  priorityBadge?: string;
  buttonText: string;
  image?: string;
  excerpt: string;
  content: string;
  tags: string[];
  pinned: boolean;
  featured: boolean;
  date?: string;
  mode: 'home' | 'card' | 'detail';
  onModeChange: (mode: 'home' | 'card' | 'detail') => void;
}

function AnnouncementLivePreview({
  title,
  category,
  author,
  targetAudience,
  priorityBadge,
  buttonText,
  image,
  excerpt,
  content,
  tags,
  pinned,
  featured,
  date = 'Today, Just now',
  mode,
  onModeChange,
}: AnnouncementLivePreviewProps) {
  const displayTitle = title.trim() || 'Untitled Announcement';
  const displayCategory = category.trim() || 'Official Notice';
  const displayAuthor = author.trim() || 'ASTU Directorate Notice';
  const displayExcerpt = excerpt.trim() || 'Executive summary of this university announcement will appear here...';
  const displayButton = buttonText.trim() || 'Read Full Notice';
  const displayImage = image?.trim() || '/images/astu-building.jpg';

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-4">
      {/* Top Selector Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-[#003580] dark:text-sky-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Live Preview
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="inline-flex rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => onModeChange('home')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'home'
                ? 'bg-[#003580] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
             Homepage
          </button>
          <button
            type="button"
            onClick={() => onModeChange('card')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'card'
                ? 'bg-[#003580] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
             Public Card
          </button>
          <button
            type="button"
            onClick={() => onModeChange('detail')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'detail'
                ? 'bg-[#003580] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
             Detail View
          </button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="mt-4 flex-1 overflow-y-auto max-h-[520px] pr-1">
        {mode === 'home' && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
              <span>Homepage Section Simulation</span>
              <span className="text-emerald-600 font-semibold">Live Real-time</span>
            </div>

            {/* Simulating HomePage Announcement Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#003580]">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Announcements</p>
                    <h4 className="text-sm font-bold text-[#003580]">Official Notices</h4>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#003580] hover:underline cursor-pointer">
                  View All Notices →
                </span>
              </div>

              {/* The Live Notice Row */}
              <div className="rounded-xl border border-blue-200/60 bg-blue-50/30 p-3 hover:bg-blue-50/60 transition-all">
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5 shrink-0">
                    <Bell className="h-4 w-4 text-red-600" />
                    {pinned && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[#003580] leading-snug">
                        {displayTitle}
                      </span>
                      {pinned && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2">
                           PINNED
                        </span>
                      )}
                      {priorityBadge && priorityBadge !== 'Official Notice' && (
                        <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.2">
                          {priorityBadge}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-semibold text-slate-700">{displayCategory}</span>
                      <span>·</span>
                      <span>{date}</span>
                      <span>·</span>
                      <span className="truncate max-w-[200px]">{displayAuthor}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {displayExcerpt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulated previous notices to show context */}
              <div className="mt-2 divide-y divide-slate-100 opacity-60">
                <div className="py-2.5 flex items-start gap-2.5 text-xs text-slate-500">
                  <Bell className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700 line-clamp-1">Annual ASTU Job Fair & Career Placement Expo</p>
                    <span className="text-[10px]">Career Notice · Mar 12, 2026</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic text-center">
               This notice will immediately appear as shown above on the ASTU public home page upon saving.
            </p>
          </div>
        )}

        {mode === 'card' && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
              <span>Public List Card Simulation (/announcements)</span>
              <span className="text-blue-600 font-semibold">Grid View</span>
            </div>

            {/* Simulating Announcement Card from /announcements */}
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all">
              {displayImage && (
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={displayImage}
                    alt={displayTitle}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/astu-building.jpg';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="rounded-lg bg-[#003580] text-white text-[10px] font-bold px-2 py-0.5 shadow-sm">
                      {displayCategory}
                    </span>
                    {pinned && (
                      <span className="rounded-lg bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 shadow-sm">
                         PINNED
                      </span>
                    )}
                    {featured && (
                      <span className="rounded-lg bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 shadow-sm">
                        ⭐ FEATURED
                      </span>
                    )}
                  </div>
                  {targetAudience && (
                    <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5">
                      Target: {targetAudience}
                    </span>
                  )}
                </div>
              )}

              <div className="p-4 space-y-2.5">
                <h3 className="text-sm font-bold text-[#003580] leading-snug line-clamp-2">
                  {displayTitle}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {displayExcerpt}
                </p>

                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tags.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{displayAuthor}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{date}</span>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-[#003580] hover:bg-[#002855] text-white text-xs font-bold py-2 shadow-xs cursor-pointer transition-colors"
                  >
                    {displayButton} &rarr;
                  </button>
                </div>
              </div>
            </article>
          </div>
        )}

        {mode === 'detail' && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
              <span>Full Detail Page Simulation (/announcements/:id)</span>
              <span className="text-violet-600 font-semibold">Article View</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {/* Hero Banner Header */}
              <div className="bg-[#003580] text-white p-5 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {displayCategory}
                  </span>
                  {pinned && (
                    <span className="rounded-full bg-amber-400 text-slate-900 px-2 py-0.5 text-[10px] font-bold">
                       Pinned Notice
                    </span>
                  )}
                  {priorityBadge && (
                    <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold">
                      {priorityBadge}
                    </span>
                  )}
                </div>

                <h2 className="text-base font-black leading-tight text-white">
                  {displayTitle}
                </h2>

                <div className="flex items-center gap-3 text-[11px] text-blue-100 pt-1 flex-wrap">
                  <span>Issued: {date}</span>
                  <span>·</span>
                  <span>{displayAuthor}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="rounded-xl bg-slate-50 border-l-4 border-[#003580] p-3 text-xs text-slate-700 italic">
                  {displayExcerpt}
                </div>

                {displayImage && (
                  <div className="rounded-xl overflow-hidden h-36 bg-slate-100">
                    <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-2 max-h-44 overflow-y-auto pr-1">
                  {content.trim() ? (
                    content.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">Full article paragraphs will be rendered here...</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Notice Verified by ASTU CMS</span>
                  <button type="button" className="text-[#003580] font-bold text-xs hover:underline cursor-pointer">
                    Share Notice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_TABS: Array<{ key: 'all' | ContentStatus; label: string }> = [
  { key: 'all', label: 'All Content' },
  { key: 'Published', label: 'Published' },
  { key: 'Scheduled', label: 'Scheduled' },
  { key: 'Draft', label: 'Drafts' },
  { key: 'Needs Review', label: 'Needs Review' },
  { key: 'Archived', label: 'Archived' },
];

const TYPE_FILTERS: Array<{ key: 'all' | ContentType; label: string }> = [
  { key: 'all', label: 'All Types' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'post', label: 'Posts & Articles' },
  { key: 'page', label: 'Pages' },
  { key: 'gallery', label: 'Galleries' },
  { key: 'event', label: 'Events' },
  { key: 'template', label: 'Templates' },
];

const COLOR_PRESETS = [
  { label: 'ASTU Navy', color: '#003580' },
  { label: 'Deep Blue', color: '#002244' },
  { label: 'Slate Dark', color: '#0f172a' },
  { label: 'Cobalt', color: '#1e3a8a' },
  { label: 'Emerald', color: '#047857' },
  { label: 'Crimson', color: '#881337' },
];

export default function ContentList() {
  const [activeTab, setActiveTab] = useState<'content' | 'page-customizer' | 'stories'>('content');
  const [items, setItems] = useState<ContentCardItem[]>(() => contentService.getItems());
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [statusTab, setStatusTab] = useState<'all' | ContentStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ContentType>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<string | null>(null);

  // Announcement Page Settings State
  const [pageSettings, setPageSettings] = useState<AnnouncementPageSettings>(() =>
    announcementSettingsService.getSettings()
  );

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<string>('Official Announcement');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState('/images/astu-building.jpg');
  const [newAuthor, setNewAuthor] = useState('ASTU International Relations & Corporate Communication Directorate (IRCCD)');
  const [newButtonText, setNewButtonText] = useState('Read Full Notice');
  const [newTargetAudience, setNewTargetAudience] = useState('All Alumni & General Public');
  const [newPriorityBadge, setNewPriorityBadge] = useState('Official Notice');
  const [newPinned, setNewPinned] = useState(false);
  const [newFeatured, setNewFeatured] = useState(true);
  const [newTagsStr, setNewTagsStr] = useState('announcement, astu, official');
  const [createPreviewMode, setCreatePreviewMode] = useState<'home' | 'card' | 'detail'>('home');

  // Preview & Edit Modals State
  const [previewItem, setPreviewItem] = useState<ContentCardItem | null>(null);
  const [editItem, setEditItem] = useState<ContentCardItem | null>(null);
  const [editPreviewMode, setEditPreviewMode] = useState<'home' | 'card' | 'detail'>('home');
  const [moreModalItem, setMoreModalItem] = useState<ContentCardItem | null>(null);

  // ─── Stories Tab State ───────────────────────────────────────────────────────
  const [stories, setStories] = useState<AlumniStory[]>(() => storiesService.getStories());
  const [storySearch, setStorySearch] = useState('');
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [editStory, setEditStory] = useState<AlumniStory | null>(null);
  const [previewStory, setPreviewStory] = useState<AlumniStory | null>(null);
  // New story form fields
  const [sName, setSName] = useState('');
  const [sRole, setSRole] = useState('');
  const [sCompany, setSCompany] = useState('');
  const [sGradYear, setSGradYear] = useState('');
  const [sDept, setSDept] = useState('');
  const [sImage, setSImage] = useState('');
  const [sText, setSText] = useState('');
  const [sFullStory, setSFullStory] = useState('');
  const [sFeatured, setSFeatured] = useState(true);

  useEffect(() => {
    let isMounted = true;
    contentService.fetchItemsFromApi().then((apiItems) => {
      if (isMounted && Array.isArray(apiItems) && apiItems.length) {
        setItems(apiItems);
      }
    });

    const handleContentSync = () => setItems(contentService.getItems());
    const handleSettingsSync = () => setPageSettings(announcementSettingsService.getSettings());
    const handleStoriesSync = () => setStories(storiesService.getStories());

    window.addEventListener('astu-cms-content-changed', handleContentSync);
    window.addEventListener('astu-announcement-settings-changed', handleSettingsSync);
    window.addEventListener('astu-cms-stories-changed', handleStoriesSync);

    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-content-changed', handleContentSync);
      window.removeEventListener('astu-announcement-settings-changed', handleSettingsSync);
      window.removeEventListener('astu-cms-stories-changed', handleStoriesSync);
    };
  }, []);

  // Sync published announcements to homepageCmsService
  useEffect(() => {
    const publishedAnnouncements = items
      .filter((item) => item.status === 'Published')
      .map((item) => ({
        id: item.id,
        title: item.title,
        date: item.publishedAt || item.updatedAt || 'Just now',
        type: item.category || (item.type === 'announcement' ? 'Official Announcement' : item.type),
        active: true,
        pinned: item.pinned,
      }));

    const cmsConfig = homepageCmsService.getSettings();
    homepageCmsService.saveSettings({
      ...cmsConfig,
      announcements: publishedAnnouncements,
    });
  }, [items]);

  const handleDuplicate = (item: ContentCardItem) => {
    contentService.addItem({
      ...item,
      title: `${item.title} (Copy)`,
      status: 'Draft',
      publishedAt: undefined,
      scheduledFor: undefined,
      scheduledIso: undefined,
      updatedAt: 'Just now',
    });
    setItems(contentService.getItems());
    toast.success(`Duplicated "${item.title}" as Draft!`);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `astu-cms-announcements-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Exported ${filtered.length} content item(s) as JSON!`);
  };

  const handleCreateContent = (status: ContentStatus = 'Published') => {
    if (!newTitle.trim()) {
      toast.error('Notice title is required');
      return;
    }
    const tagsArray = newTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created = contentService.addItem({
      title: newTitle.trim(),
      type: (newType.toLowerCase().includes('post') ? 'post' : 'announcement') as ContentType,
      category: newType.trim() || 'Official Announcement',
      targetAudience: newTargetAudience.trim() || 'All Alumni & General Public',
      priorityBadge: newPriorityBadge.trim() || 'Official Notice',
      status,
      excerpt: newExcerpt.trim() || `${newType}: ${newTitle.trim()}`,
      content: newContent.trim() || newExcerpt.trim() || `${newTitle.trim()} - Official notification from Adama Science and Technology University.`,
      image: newImage.trim() || '/images/astu-building.jpg',
      author: newAuthor.trim() || 'ASTU Directorate Notice',
      buttonText: newButtonText.trim() || 'Read Full Notice',
      updatedAt: 'Just now',
      publishedAt:
        status === 'Published'
          ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : undefined,
      tags: tagsArray.length > 0 ? tagsArray : ['announcement', 'astu', 'official'],
      pinned: newPinned,
      featured: newFeatured,
      language: 'EN',
    });

    setStatusTab('all');
    setTypeFilter('all');
    setItems(contentService.getItems());

    // Reset fields
    setNewTitle('');
    setNewType('Official Announcement');
    setNewExcerpt('');
    setNewContent('');
    setNewImage('/images/astu-building.jpg');
    setNewAuthor('ASTU International Relations & Corporate Communication Directorate (IRCCD)');
    setNewButtonText('Read Full Notice');
    setNewTargetAudience('All Alumni & General Public');
    setNewPriorityBadge('Official Notice');
    setNewPinned(false);
    setNewFeatured(true);
    setNewTagsStr('announcement, astu, official');
    setCreateOpen(false);

    toast.success(`Notice "${created.title}" published & synced live to Homepage!`);
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    contentService.updateItem(editItem.id, editItem);
    setItems(contentService.getItems());
    toast.success(`Changes to "${editItem.title}" saved!`);
    setEditItem(null);
  };

  const handleSavePageSettings = () => {
    announcementSettingsService.saveSettings(pageSettings);
    toast.success('Announcements page settings saved live!');
  };

  const handleResetPageSettings = () => {
    if (window.confirm('Reset all announcements page settings to defaults?')) {
      const def = announcementSettingsService.resetToDefaults();
      setPageSettings(def);
      toast.success('Reset to default announcements settings');
    }
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusTab !== 'all' && item.status !== statusTab) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (search) {
        const needle = search.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(needle) ||
          item.excerpt?.toLowerCase().includes(needle) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(needle));
        if (!matches) return false;
      }
      return true;
    });
  }, [items, statusTab, typeFilter, search]);

  // High-Volume Content Pagination
  const [contentPage, setContentPage] = useState(1);
  const [contentPageSize, setContentPageSize] = useState(12);

  useEffect(() => {
    setContentPage(1);
  }, [statusTab, typeFilter, search]);

  const totalContentPages = Math.ceil(filtered.length / contentPageSize) || 1;
  const paginatedContent = useMemo(() => {
    const s = (contentPage - 1) * contentPageSize;
    return filtered.slice(s, s + contentPageSize);
  }, [filtered, contentPage, contentPageSize]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: items.length };
    for (const tab of STATUS_TABS) {
      if (tab.key === 'all') continue;
      result[tab.key] = items.filter((item) => item.status === tab.key).length;
    }
    return result;
  }, [items]);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
    );
  };

  const selectAllVisible = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((item) => item.id));
    }
  };

  const updateItem = useCallback((id: string, partial: Partial<ContentCardItem>) => {
    contentService.updateItem(id, partial);
    setItems(contentService.getItems());
  }, []);

  const bulkUpdate = useCallback(
    (status: ContentStatus) => {
      if (selectedIds.length === 0) return;
      selectedIds.forEach((id) => contentService.updateItem(id, { status }));
      setItems(contentService.getItems());
      toast.success(`${selectedIds.length} item(s) set to ${status}`);
      setSelectedIds([]);
    },
    [selectedIds]
  );

  const bulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => contentService.deleteItem(id));
    setItems(contentService.getItems());
    toast.success(`${selectedIds.length} item(s) deleted`);
    setSelectedIds([]);
  }, [selectedIds]);

  const handleScheduleSubmit = (value: ScheduleValue) => {
    const scheduledDateObj = new Date(`${value.date}T${value.time}:00`);
    const formattedDate = scheduledDateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    if (scheduleTarget) {
      updateItem(scheduleTarget, {
        status: 'Scheduled',
        scheduledFor: formattedDate,
        scheduledIso: scheduledDateObj.toISOString(),
      });
      toast.success(`Content scheduled to publish live on ${formattedDate}`);
    }
    setScheduleOpen(false);
    setScheduleTarget(null);
  };

  const openScheduleFor = (id: string) => {
    setScheduleTarget(id);
    setScheduleOpen(true);
  };

  const scheduleForBulk = () => {
    setScheduleTarget(null);
    setScheduleOpen(true);
  };

  const submitBulkSchedule = (value: ScheduleValue) => {
    if (selectedIds.length === 0) return;
    const scheduledDateObj = new Date(`${value.date}T${value.time}:00`);
    const formattedDate = scheduledDateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    selectedIds.forEach((id) => {
      contentService.updateItem(id, {
        status: 'Scheduled',
        scheduledFor: formattedDate,
        scheduledIso: scheduledDateObj.toISOString(),
      });
    });
    setItems(contentService.getItems());
    toast.success(`${selectedIds.length} item(s) scheduled to publish live on ${formattedDate}`);
    setSelectedIds([]);
    setScheduleOpen(false);
  };

  // ─── Story Handlers ──────────────────────────────────────────────────────────
  const resetStoryForm = () => {
    setSName(''); setSRole(''); setSCompany(''); setSGradYear('');
    setSDept(''); setSImage(''); setSText(''); setSFullStory(''); setSFeatured(true);
  };

  const handleCreateStory = () => {
    if (!sName.trim() || !sRole.trim()) {
      toast.error('Name and Role are required');
      return;
    }
    storiesService.addStory({
      name: sName.trim(),
      role: sRole.trim(),
      company: sCompany.trim() || undefined,
      graduationYear: sGradYear.trim() || undefined,
      department: sDept.trim() || undefined,
      image: sImage.trim() || undefined,
      text: sText.trim() || `${sName.trim()} — ${sRole.trim()}`,
      fullStory: sFullStory.trim() || undefined,
      featured: sFeatured,
    });
    setStories(storiesService.getStories());
    resetStoryForm();
    setCreateStoryOpen(false);
    toast.success(`Story for "${sName.trim()}" published live!`);
  };

  const handleSaveStoryEdit = () => {
    if (!editStory) return;
    storiesService.updateStory(editStory.id, editStory);
    setStories(storiesService.getStories());
    toast.success(`Story for "${editStory.name}" updated!`);
    setEditStory(null);
  };

  const handleDeleteStory = (id: string, name: string) => {
    if (!window.confirm(`Delete story for "${name}"? This cannot be undone.`)) return;
    storiesService.deleteStory(id);
    setStories(storiesService.getStories());
    toast.success(`Story deleted.`);
  };

  const handleToggleStoryFeatured = (id: string) => {
    const next = storiesService.toggleFeatured(id);
    setStories(storiesService.getStories());
    toast.success(next ? 'Story marked as Featured' : 'Story removed from Featured');
  };

  const filteredStories = stories.filter((s) => {
    if (!storySearch) return true;
    const q = storySearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.company?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      <style>{`
        @keyframes cms-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .cms-fade { animation: cms-fade-in 0.3s ease-out both; }
        .cms-fade:nth-child(2) { animation-delay: 0.04s; }
        .cms-fade:nth-child(3) { animation-delay: 0.08s; }
        .cms-fade:nth-child(4) { animation-delay: 0.12s; }
      `}</style>

      {/* Admin Page Header */}
      <AdminPageHeader
        title="Announcements & Public Notices"
        subtitle="Full administrative control over all public notices, articles, cover images, descriptions, and the page header layout."
        breadcrumbs={[{ label: 'Content Management' }, { label: 'Announcements' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/announcements"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
              title="Open public announcements page in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#003580] dark:text-sky-400" />
              <span>View Public Page</span>
            </a>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] hover:bg-[#002244] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Broadcast Notice</span>
            </button>
          </div>
        }
      />

      {/* Main Tab Switcher */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'content'
              ? 'border-[#003580] text-[#003580] dark:text-sky-400 dark:border-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>All Notices & Announcements ({items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stories')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'stories'
              ? 'border-[#003580] text-[#003580] dark:text-sky-400 dark:border-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Alumni Success Stories ({stories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('page-customizer')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'page-customizer'
              ? 'border-[#003580] text-[#003580] dark:text-sky-400 dark:border-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Announcement Page Customizer</span>
        </button>
      </div>

      {/* TAB 1: CONTENT ITEMS MANAGEMENT */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 cms-fade">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Total Notices</span>
                <Bell className="h-4 w-4 text-[#003580]" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{items.length}</div>
              <p className="mt-1 text-[11px] text-slate-400">All announcements in system</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-semibold">Live on Homepage</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-600">{items.filter(i => i.status === 'Published').length}</div>
              <p className="mt-1 text-[11px] text-slate-400">Active on homepage notice board</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-xs font-semibold">Pinned to Top</span>
                <Pin className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-600">{items.filter(i => i.pinned).length}</div>
              <p className="mt-1 text-[11px] text-slate-400">Prioritized at top of lists</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Drafts & Scheduled</span>
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-700 dark:text-slate-300">{items.filter(i => i.status !== 'Published').length}</div>
              <p className="mt-1 text-[11px] text-slate-400">Unpublished or pending</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="cms-fade flex flex-col gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, excerpt, or tag..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-8 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#003580] focus:bg-white"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((open) => !open)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  showFilters
                    ? 'border-[#003580] bg-[#003580]/5 text-[#003580]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusTab('all');
                  setTypeFilter('all');
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Reset
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                title="Export all visible content as JSON"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>

              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer ${
                    view === 'grid' ? 'bg-[#003580] text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer ${
                    view === 'list' ? 'bg-[#003580] text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="List view"
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                {TYPE_FILTERS.map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setTypeFilter(type.key)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                      typeFilter === type.key
                        ? 'border-[#003580] bg-[#003580] text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-[#003580]/40'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                    statusTab === tab.key
                      ? 'bg-[#003580] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      statusTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {counts[tab.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedIds.length > 0 && (
            <div className="cms-fade sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#003580]/30 bg-gradient-to-r from-[#003580]/10 to-[#003580]/5 px-4 py-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#003580]">
                <span>{selectedIds.length} selected</span>
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="text-xs font-medium text-[#003580] hover:underline cursor-pointer"
                >
                  {selectedIds.length === filtered.length ? 'Clear all' : 'Select all visible'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => bulkUpdate('Published')}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <Send className="h-3 w-3" /> Publish
                </button>
                <button
                  type="button"
                  onClick={scheduleForBulk}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                >
                  <Calendar className="h-3 w-3" /> Schedule
                </button>
                <button
                  type="button"
                  onClick={() => bulkUpdate('Archived')}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
                >
                  <Archive className="h-3 w-3" /> Archive
                </button>
                <button
                  type="button"
                  onClick={bulkDelete}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Cards or Table */}
          {view === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedContent.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  onSelect={() => toggleSelected(item.id)}
                  onEdit={() => setEditItem(item)}
                  onDelete={() => {
                    contentService.deleteItem(item.id);
                    setItems(contentService.getItems());
                    toast.success('Notice deleted');
                  }}
                  onPreview={() => setPreviewItem(item)}
                  onPublish={() => {
                    updateItem(item.id, { status: 'Published' });
                    toast.success('Published live');
                  }}
                  onSchedule={() => openScheduleFor(item.id)}
                  onDuplicate={() => handleDuplicate(item)}
                  onTogglePin={() => {
                    updateItem(item.id, { pinned: !item.pinned });
                    toast.success(item.pinned ? 'Notice unpinned' : 'Notice pinned to top');
                  }}
                  onToggleFeature={() => {
                    updateItem(item.id, { featured: !item.featured });
                    toast.success(item.featured ? 'Featured flag removed' : 'Marked as featured');
                  }}
                  onMore={() => setMoreModalItem(item)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 font-semibold">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filtered.length && filtered.length > 0}
                        onChange={selectAllVisible}
                        className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                      />
                    </th>
                    <th className="px-4 py-3 font-semibold">Notice & Details</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Authority</th>
                    <th className="px-4 py-3 font-semibold">Updated</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedContent.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelected(item.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="h-10 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {item.pinned && <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0 fill-amber-500" />}
                              <span className="font-semibold text-slate-900 truncate max-w-sm">{item.title}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate max-w-md">{item.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{item.type}</td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status === 'Draft'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.author || 'ASTU Notice'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.publishedAt || item.updatedAt}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                            title="Preview Notice"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditItem(item)}
                            className="p-1.5 rounded-lg border border-slate-200 text-[#003580] hover:bg-blue-50"
                            title="Edit Notice, Texts & Images"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              contentService.deleteItem(item.id);
                              setItems(contentService.getItems());
                              toast.success('Notice deleted');
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50"
                            title="Delete Notice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* High-Volume Pagination Controls */}
          {totalContentPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong>{(contentPage - 1) * contentPageSize + 1}</strong> to{' '}
                  <strong>{Math.min(contentPage * contentPageSize, filtered.length)}</strong> of{' '}
                  <strong>{filtered.length.toLocaleString()}</strong> announcements
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Per page:</span>
                  <select
                    value={contentPageSize}
                    onChange={(e) => {
                      setContentPageSize(Number(e.target.value));
                      setContentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setContentPage((p) => Math.max(1, p - 1))}
                  disabled={contentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-800 dark:text-white">
                  Page {contentPage} of {totalContentPages}
                </span>
                <button
                  type="button"
                  onClick={() => setContentPage((p) => Math.min(totalContentPages, p + 1))}
                  disabled={contentPage === totalContentPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <Bell className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-700">No content matches your filters</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting filters or post a new announcement.</p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-4 rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white shadow-xs"
              >
                + Broadcast New Notice
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAGE HEADER & CUSTOMIZER */}
      {activeTab === 'page-customizer' && (
        <div className="space-y-6 cms-fade">
          {/* Live Preview Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Header Preview</h3>
                <p className="text-xs text-slate-500">Real-time appearance of the public announcements page header.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <Check className="h-3.5 w-3.5" /> Live Sync Active
              </span>
            </div>

            {/* Preview Render */}
            <div
              className="relative overflow-hidden rounded-2xl text-white p-8 transition-all shadow-inner"
              style={{
                backgroundColor: pageSettings.bannerBgColor || '#003580',
              }}
            >
              {pageSettings.showBannerImage && pageSettings.bannerImage && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={pageSettings.bannerImage}
                    alt="Preview banner"
                    className="h-full w-full object-cover opacity-25"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-[#003580]/85 to-[#003580]/90" />
                </div>
              )}

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#FFD700] backdrop-blur-md border border-white/15">
                    <Bell className="h-6 w-6" />
                  </span>
                  <div>
                    {pageSettings.bannerBadge && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FFD700] mb-2 border border-white/10">
                        <Sparkles className="h-3 w-3" />
                        {pageSettings.bannerBadge}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-2xl font-black">{pageSettings.bannerTitle}</h2>
                    <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">{pageSettings.bannerSubtitle}</p>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-md border border-white/15 text-xs text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>{pageSettings.authorityLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Form Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Banner Content Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Header Titles & Badges
              </h4>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Page Banner Title</span>
                <input
                  type="text"
                  value={pageSettings.bannerTitle}
                  onChange={(e) => setPageSettings({ ...pageSettings, bannerTitle: e.target.value })}
                  placeholder="ASTU Official Notices & Announcements"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Page Subtitle / Mission Text</span>
                <textarea
                  value={pageSettings.bannerSubtitle}
                  onChange={(e) => setPageSettings({ ...pageSettings, bannerSubtitle: e.target.value })}
                  rows={2}
                  placeholder="Official communications, university bulletins, academic notices, and alumni achievements."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Badge Label (Top Tag)</span>
                <input
                  type="text"
                  value={pageSettings.bannerBadge}
                  onChange={(e) => setPageSettings({ ...pageSettings, bannerBadge: e.target.value })}
                  placeholder="ASTU Official Bulletins"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Default Issuing Authority Name</span>
                <input
                  type="text"
                  value={pageSettings.authorityLabel}
                  onChange={(e) => setPageSettings({ ...pageSettings, authorityLabel: e.target.value })}
                  placeholder="ASTU Directorate Notice"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                />
              </label>
            </div>

            {/* Banner Background & Visuals Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Banner Background & Styling
              </h4>

              <div>
                <span className="mb-2 block text-xs font-semibold text-slate-700">Header Background Color</span>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setPageSettings({ ...pageSettings, bannerBgColor: preset.color })}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all cursor-pointer ${
                        pageSettings.bannerBgColor === preset.color
                          ? 'border-slate-800 bg-slate-100 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: preset.color }} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={pageSettings.bannerBgColor}
                  onChange={(e) => setPageSettings({ ...pageSettings, bannerBgColor: e.target.value })}
                  placeholder="#003580"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-[#003580]"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Hero Background Image</span>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pageSettings.showBannerImage}
                      onChange={(e) => setPageSettings({ ...pageSettings, showBannerImage: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                    />
                    Enable Image Overlay
                  </label>
                </div>

                <ImageUploader
                  label="Upload or select banner image"
                  value={pageSettings.bannerImage}
                  onChange={(url) => setPageSettings({ ...pageSettings, bannerImage: url })}
                />
              </div>
            </div>

            {/* Top Alert Broadcast Bar Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-900">Top Emergency Alert Ticker</h4>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pageSettings.topAlertEnabled}
                    onChange={(e) => setPageSettings({ ...pageSettings, topAlertEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                  />
                  Enable Ticker Bar
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Alert Message Text</span>
                <input
                  type="text"
                  value={pageSettings.topAlertText}
                  onChange={(e) => setPageSettings({ ...pageSettings, topAlertText: e.target.value })}
                  placeholder="Notice: 2026 Academic & Alumni Portal update is live."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Alert Action Link (Optional)</span>
                <input
                  type="text"
                  value={pageSettings.topAlertLink}
                  onChange={(e) => setPageSettings({ ...pageSettings, topAlertLink: e.target.value })}
                  placeholder="/announcements or external URL"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                />
              </label>
            </div>

            {/* Search, Buttons & Empty State Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Labels, Search & Empty States
              </h4>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Search Bar Placeholder</span>
                <input
                  type="text"
                  value={pageSettings.searchPlaceholder}
                  onChange={(e) => setPageSettings({ ...pageSettings, searchPlaceholder: e.target.value })}
                  placeholder="Search official notices by title, excerpt, or keyword..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Card Action Button Label</span>
                <input
                  type="text"
                  value={pageSettings.cardButtonText}
                  onChange={(e) => setPageSettings({ ...pageSettings, cardButtonText: e.target.value })}
                  placeholder="Read Full Notice"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Empty State Title</span>
                  <input
                    type="text"
                    value={pageSettings.emptyTitle}
                    onChange={(e) => setPageSettings({ ...pageSettings, emptyTitle: e.target.value })}
                    placeholder="No Announcements Found"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Empty State Help Text</span>
                  <input
                    type="text"
                    value={pageSettings.emptyDescription}
                    onChange={(e) => setPageSettings({ ...pageSettings, emptyDescription: e.target.value })}
                    placeholder="Try adjusting your filters..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Save Bar */}
          <div className="sticky bottom-4 z-30 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={handleResetPageSettings}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </button>

            <div className="flex items-center gap-3">
              <a
                href="/announcements"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 text-[#003580]" />
                Preview Public Page
              </a>

              <button
                type="button"
                onClick={handleSavePageSettings}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] hover:bg-[#002855] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Save Page Settings Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3: ALUMNI SUCCESS STORIES MANAGEMENT
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'stories' && (
        <div className="space-y-5 cms-fade">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                placeholder="Search stories by name, role, company, or department..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#003580] focus:bg-white"
              />
              {storySearch && (
                <button type="button" onClick={() => setStorySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {filteredStories.length} of {stories.length} stories
                &nbsp;·&nbsp;
                <span className="text-amber-600 font-semibold">{stories.filter(s => s.featured).length} featured</span>
              </span>
              <button
                type="button"
                onClick={() => setCreateStoryOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] hover:bg-[#002244] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all"
              >
                <Plus className="h-4 w-4" />
                Add New Story
              </button>
            </div>
          </div>

          {/* Stories Grid */}
          {filteredStories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-700">No stories match your search</h3>
              <p className="text-xs text-slate-500 mt-1">Try a different keyword or add a new alumni success story.</p>
              <button type="button" onClick={() => setCreateStoryOpen(true)} className="mt-4 rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white shadow-xs">
                + Add New Story
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map((story) => (
                <div key={story.id} className="cms-fade group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-[#003580]/30 transition-all duration-200">
                  {/* Story Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 shrink-0">
                    {story.image ? (
                      <img
                        src={story.image}
                        alt={story.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=60'; }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <UserCheck className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                    {/* Featured Badge */}
                    {story.featured && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-md bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-sm">
                        <Sparkles className="h-3 w-3" /> FEATURED
                      </span>
                    )}
                    {/* Story ID Badge */}
                    <span className="absolute top-3 right-3 rounded-md bg-slate-900/60 px-2 py-0.5 text-[10px] font-mono font-bold text-white backdrop-blur-sm">
                      {story.id}
                    </span>
                  </div>

                  {/* Story Body */}
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="font-bold text-[#003580] text-sm leading-snug line-clamp-1">{story.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium line-clamp-1">{story.role}</p>
                    {story.company && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{story.company}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {story.graduationYear && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{story.graduationYear}</span>
                      )}
                      {story.department && (
                        <span className="rounded-full border border-[#003580]/20 bg-[#003580]/5 px-2 py-0.5 text-[10px] font-semibold text-[#003580]">{story.department}</span>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-2">{story.text}</p>

                    {/* Action Row */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewStory(story)}
                          title="Preview Story"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditStory({ ...story })}
                          title="Edit Story"
                          className="p-1.5 rounded-lg border border-slate-200 text-[#003580] hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStoryFeatured(story.id)}
                          title={story.featured ? 'Remove from Featured' : 'Mark as Featured'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            story.featured
                              ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100'
                              : 'border-slate-200 text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStory(story.id, story.name)}
                          title="Delete Story"
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400">{story.publishedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CREATE STORY MODAL ── */}
          <AdminModal
            open={createStoryOpen}
            onClose={() => { setCreateStoryOpen(false); resetStoryForm(); }}
            title="Add New Alumni Success Story"
            size="lg"
            footer={
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => { setCreateStoryOpen(false); resetStoryForm(); }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="button" onClick={handleCreateStory}
                  className="rounded-xl bg-[#003580] hover:bg-[#002855] px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer">
                  Publish Story Live
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Full Name *</span>
                  <input type="text" value={sName} onChange={(e) => setSName(e.target.value)}
                    placeholder="e.g. Dr. Aisha Mohammed" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Role / Position *</span>
                  <input type="text" value={sRole} onChange={(e) => setSRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer, Google" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Company / Organization</span>
                  <input type="text" value={sCompany} onChange={(e) => setSCompany(e.target.value)}
                    placeholder="Google, Ethiopian Airlines…" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Graduation Year</span>
                  <input type="text" value={sGradYear} onChange={(e) => setSGradYear(e.target.value)}
                    placeholder="Class of 2022" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Department</span>
                  <input type="text" value={sDept} onChange={(e) => setSDept(e.target.value)}
                    placeholder="Computer Science & Engineering" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
              </div>
              <ImageUploader label="Upload Profile Photo / Story Image" value={sImage} onChange={(url) => setSImage(url)} />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Short Summary (displayed on card)</span>
                <textarea value={sText} onChange={(e) => setSText(e.target.value)} rows={2}
                  placeholder="A brief 1-2 sentence summary of the alumni's achievement…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Full Story (shown on detail page)</span>
                <textarea value={sFullStory} onChange={(e) => setSFullStory(e.target.value)} rows={5}
                  placeholder="The complete alumni success story in their own words…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={sFeatured} onChange={(e) => setSFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#003580]" />
                Mark as Featured (shown prominently on the public page)
              </label>
            </div>
          </AdminModal>

          {/* ── EDIT STORY MODAL ── */}
          <AdminModal
            open={!!editStory}
            onClose={() => setEditStory(null)}
            title={editStory ? `Edit Story: ${editStory.name}` : 'Edit Story'}
            size="lg"
            footer={
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditStory(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveStoryEdit}
                  className="rounded-xl bg-[#003580] hover:bg-[#002855] px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer">
                  Save Changes Live
                </button>
              </div>
            }
          >
            {editStory && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-700">Full Name *</span>
                    <input type="text" value={editStory.name} onChange={(e) => setEditStory({ ...editStory, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-700">Role / Position *</span>
                    <input type="text" value={editStory.role} onChange={(e) => setEditStory({ ...editStory, role: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-700">Company / Organization</span>
                    <input type="text" value={editStory.company || ''} onChange={(e) => setEditStory({ ...editStory, company: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-700">Graduation Year</span>
                    <input type="text" value={editStory.graduationYear || ''} onChange={(e) => setEditStory({ ...editStory, graduationYear: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-700">Department</span>
                    <input type="text" value={editStory.department || ''} onChange={(e) => setEditStory({ ...editStory, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                  </label>
                </div>
                <ImageUploader label="Profile Photo / Story Image" value={editStory.image || ''} onChange={(url) => setEditStory({ ...editStory, image: url })} />
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Short Summary (card)</span>
                  <textarea value={editStory.text} onChange={(e) => setEditStory({ ...editStory, text: e.target.value })} rows={2}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Full Story (detail page)</span>
                  <textarea value={editStory.fullStory || ''} onChange={(e) => setEditStory({ ...editStory, fullStory: e.target.value })} rows={6}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-700">Published Date</span>
                    <input type="text" value={editStory.publishedAt || ''} onChange={(e) => setEditStory({ ...editStory, publishedAt: e.target.value })}
                      placeholder="Oct 7, 2026" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                  </label>
                  <div className="flex items-end pb-1">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={!!editStory.featured} onChange={(e) => setEditStory({ ...editStory, featured: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-[#003580]" />
                      Mark as Featured
                    </label>
                  </div>
                </div>
              </div>
            )}
          </AdminModal>

          {/* ── PREVIEW STORY MODAL ── */}
          <AdminModal
            open={!!previewStory}
            onClose={() => setPreviewStory(null)}
            title={previewStory ? `Preview: ${previewStory.name}` : 'Story Preview'}
            size="lg"
            footer={
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setPreviewStory(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Close
                </button>
                {previewStory && (
                  <button
                    type="button"
                    onClick={() => { setEditStory({ ...previewStory }); setPreviewStory(null); }}
                    className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002855] inline-flex items-center gap-1.5 cursor-pointer">
                    <Edit3 className="h-3.5 w-3.5" /> Edit This Story
                  </button>
                )}
              </div>
            }
          >
            {previewStory && (
              <div className="space-y-4">
                {previewStory.image && (
                  <img src={previewStory.image} alt={previewStory.name}
                    className="w-full max-h-64 object-cover rounded-xl border border-slate-200"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {previewStory.featured && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                      <Sparkles className="h-3 w-3" /> FEATURED
                    </span>
                  )}
                  {previewStory.graduationYear && (
                    <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">{previewStory.graduationYear}</span>
                  )}
                  {previewStory.department && (
                    <span className="rounded-md bg-[#003580]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#003580]">{previewStory.department}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#003580]">{previewStory.name}</h2>
                  <p className="text-sm font-semibold text-slate-600">{previewStory.role}</p>
                  {previewStory.company && <p className="text-xs text-slate-400">{previewStory.company}</p>}
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Short Summary</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{previewStory.text}</p>
                </div>
                {previewStory.fullStory && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Story</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{previewStory.fullStory}</p>
                  </div>
                )}
                <p className="text-xs text-slate-400">Published: {previewStory.publishedAt}</p>
              </div>
            )}
          </AdminModal>
        </div>
      )}

      {/* SCHEDULE DIALOG */}
      <ScheduleDialog
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          setScheduleTarget(null);
        }}
        onConfirm={(value) => (scheduleTarget ? handleScheduleSubmit(value) : submitBulkSchedule(value))}
      />

      {/* CREATE NEW NOTICE MODAL WITH LIVE PREVIEW */}
      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Broadcast New Notice / Announcement"
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
               Notice will sync immediately to ASTU Homepage & Public Announcements
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateContent('Draft')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleCreateContent('Published')}
                className="rounded-xl bg-[#003580] hover:bg-[#002855] px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Publish Live Now
              </button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Notice Title <span className="text-rose-500 font-black">* (Required)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">{newTitle.length}/140 chars</span>
              </div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]"
                placeholder="e.g. ASTU Hosts DAAD International Alumni Workshop on Sustainable Water Supply"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CreatableCombobox
                label="Category / Type"
                required
                value={newType}
                onChange={setNewType}
                presets={categoryPresets}
                placeholder="Select or type category..."
                icon={Bell}
              />

              <CreatableCombobox
                label="Priority / Badge"
                value={newPriorityBadge}
                onChange={setNewPriorityBadge}
                presets={priorityPresets}
                placeholder="Select or type priority..."
                icon={ShieldCheck}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CreatableCombobox
                label="Issuing Authority / Author"
                value={newAuthor}
                onChange={setNewAuthor}
                presets={authorPresets}
                placeholder="Select or type author..."
                icon={User}
              />

              <CreatableCombobox
                label="Target Audience"
                value={newTargetAudience}
                onChange={setNewTargetAudience}
                presets={audiencePresets}
                placeholder="Select or type audience..."
                icon={GraduationCap}
              />
            </div>

            <CreatableCombobox
              label="Action Link Button Label"
              value={newButtonText}
              onChange={setNewButtonText}
              presets={actionButtonPresets}
              placeholder="e.g. Read Full Notice, Register Now..."
              icon={ArrowRight}
            />

            <div>
              <ImageUploader
                label="Announcement Media / Cover Photo"
                value={newImage}
                onChange={(url) => setNewImage(url)}
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Presets:</span>
                {quickImagePresets.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setNewImage(img.url)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                      newImage === img.url
                        ? 'border-[#003580] bg-blue-50 text-[#003580] dark:bg-sky-500/20 dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-200">
                Card Summary / Excerpt (Displayed on Homepage & List Card)
              </label>
              <textarea
                value={newExcerpt}
                onChange={(e) => setNewExcerpt(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#003580]"
                placeholder="A concise 1-2 sentence overview of the announcement..."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-200">
                Full Article Content (Displayed on Detail Reader Page)
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#003580]"
                placeholder="Complete announcement narrative, guidelines, eligibility criteria, and contact channels..."
              />
            </div>

            {/* Tags & Visibility */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Tags & Keywords
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {suggestedTags.map((tag) => {
                    const active = newTagsStr.toLowerCase().includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentArr = newTagsStr.split(',').map((t) => t.trim()).filter(Boolean);
                          const nextArr = active
                            ? currentArr.filter((t) => t.toLowerCase() !== tag)
                            : [...currentArr, tag];
                          setNewTagsStr(nextArr.join(', '));
                        }}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#003580] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {active ? ` #${tag}` : `+ #${tag}`}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={newTagsStr}
                  onChange={(e) => setNewTagsStr(e.target.value)}
                  placeholder="announcement, astu, official"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#003580]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPinned}
                    onChange={(e) => setNewPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                  />
                  <span> Pin Notice to Top of Homepage</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFeatured}
                    onChange={(e) => setNewFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                  />
                  <span>⭐ Mark as Featured</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Real-Time Preview (5 cols) */}
          <div className="lg:col-span-5 sticky top-0 self-start">
            <AnnouncementLivePreview
              title={newTitle}
              category={newType}
              author={newAuthor}
              targetAudience={newTargetAudience}
              priorityBadge={newPriorityBadge}
              buttonText={newButtonText}
              image={newImage}
              excerpt={newExcerpt}
              content={newContent}
              tags={newTagsStr.split(',').map((t) => t.trim()).filter(Boolean)}
              pinned={newPinned}
              featured={newFeatured}
              mode={createPreviewMode}
              onModeChange={setCreatePreviewMode}
            />
          </div>
        </div>
      </AdminModal>

      {/* EDIT NOTICE MODAL WITH LIVE PREVIEW */}
      <AdminModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title={editItem ? `Edit Notice: ${editItem.title}` : 'Edit Notice'}
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
               Changes will update the notice live on ASTU Homepage
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-xl bg-[#003580] hover:bg-[#002855] px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Save Changes Live
              </button>
            </div>
          </div>
        }
      >
        {editItem && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Notice Title <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  value={editItem.title}
                  onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#003580]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CreatableCombobox
                  label="Category / Type"
                  required
                  value={editItem.category || editItem.type}
                  onChange={(val) => setEditItem({ ...editItem, category: val, type: (val.toLowerCase().includes('post') ? 'post' : 'announcement') as ContentType })}
                  presets={categoryPresets}
                  placeholder="Select or type category..."
                  icon={Bell}
                />

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={editItem.status}
                    onChange={(e) => setEditItem({ ...editItem, status: e.target.value as ContentStatus })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#003580]"
                  >
                    <option value="Published">Published (Live)</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <CreatableCombobox
                  label="Priority Badge"
                  value={editItem.priorityBadge || 'Official Notice'}
                  onChange={(val) => setEditItem({ ...editItem, priorityBadge: val })}
                  presets={priorityPresets}
                  placeholder="Select or type..."
                  icon={ShieldCheck}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CreatableCombobox
                  label="Authority / Author"
                  value={editItem.author || ''}
                  onChange={(val) => setEditItem({ ...editItem, author: val })}
                  presets={authorPresets}
                  placeholder="Select or type authority..."
                  icon={User}
                />

                <CreatableCombobox
                  label="Target Audience"
                  value={editItem.targetAudience || 'All Alumni & General Public'}
                  onChange={(val) => setEditItem({ ...editItem, targetAudience: val })}
                  presets={audiencePresets}
                  placeholder="Select or type audience..."
                  icon={GraduationCap}
                />
              </div>

              <CreatableCombobox
                label="Action Link Button Label"
                value={editItem.buttonText || 'Read Full Notice'}
                onChange={(val) => setEditItem({ ...editItem, buttonText: val })}
                presets={actionButtonPresets}
                placeholder="Button label..."
                icon={ArrowRight}
              />

              <div>
                <ImageUploader
                  label="Cover Photo / Media URL"
                  value={editItem.image}
                  onChange={(url) => setEditItem({ ...editItem, image: url })}
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Presets:</span>
                  {quickImagePresets.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => setEditItem({ ...editItem, image: img.url })}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        editItem.image === img.url
                          ? 'border-[#003580] bg-blue-50 text-[#003580] dark:bg-sky-500/20 dark:text-sky-400'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Card Summary / Excerpt
                </label>
                <textarea
                  value={editItem.excerpt || ''}
                  onChange={(e) => setEditItem({ ...editItem, excerpt: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003580]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Full Article Content
                </label>
                <textarea
                  value={editItem.content || ''}
                  onChange={(e) => setEditItem({ ...editItem, content: e.target.value })}
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003580]"
                  placeholder="Full announcement body displayed on detail view..."
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(editItem.tags) ? editItem.tags.join(', ') : ''}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    placeholder="announcement, astu, official"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003580]"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editItem.pinned}
                      onChange={(e) => setEditItem({ ...editItem, pinned: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                    />
                    <span> Pin Notice to Top of Homepage</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editItem.featured}
                      onChange={(e) => setEditItem({ ...editItem, featured: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                    />
                    <span>⭐ Mark as Featured</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Live Real-Time Preview (5 cols) */}
            <div className="lg:col-span-5 sticky top-0 self-start">
              <AnnouncementLivePreview
                title={editItem.title}
                category={editItem.category || editItem.type}
                author={editItem.author || 'ASTU Directorate Notice'}
                targetAudience={editItem.targetAudience}
                priorityBadge={editItem.priorityBadge}
                buttonText={editItem.buttonText || 'Read Full Notice'}
                image={editItem.image}
                excerpt={editItem.excerpt || ''}
                content={editItem.content || ''}
                tags={Array.isArray(editItem.tags) ? editItem.tags : []}
                pinned={!!editItem.pinned}
                featured={!!editItem.featured}
                date={editItem.publishedAt || editItem.updatedAt || 'Today'}
                mode={editPreviewMode}
                onModeChange={setEditPreviewMode}
              />
            </div>
          </div>
        )}
      </AdminModal>

      {/* PREVIEW NOTICE MODAL */}
      <AdminModal
        open={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.title ?? ''}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
            {previewItem && (
              <a
                href={`/announcements/${previewItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002855] inline-flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Full Page
              </a>
            )}
          </div>
        }
      >
        {previewItem && (
          <div className="space-y-4">
            {previewItem.image && (
              <img
                src={previewItem.image}
                alt={previewItem.title}
                className="w-full max-h-64 object-cover rounded-xl border border-slate-200"
              />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {previewItem.type}
              </span>
              <span className="rounded-md border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                {previewItem.status}
              </span>
              {previewItem.pinned && (
                <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                  PINNED
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-800 leading-relaxed">{previewItem.excerpt}</p>
            {previewItem.content && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {previewItem.content}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Authority</span>
                <span className="font-semibold text-slate-700">{previewItem.author || 'ASTU Notice'}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Published Date</span>
                <span className="font-semibold text-slate-700">{previewItem.publishedAt || previewItem.updatedAt}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Views</span>
                <span className="font-semibold text-slate-700">{previewItem.views?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* MORE OPTIONS MODAL */}
      <AdminModal
        open={!!moreModalItem}
        onClose={() => setMoreModalItem(null)}
        title={moreModalItem ? `Options: ${moreModalItem.title}` : 'Options'}
        size="sm"
      >
        {moreModalItem && (
          <div className="space-y-2 py-1">
            <button
              type="button"
              onClick={() => {
                setEditItem(moreModalItem);
                setMoreModalItem(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Edit3 className="h-4 w-4 text-[#003580]" /> Edit Content & Images
            </button>
            <button
              type="button"
              onClick={() => {
                handleDuplicate(moreModalItem);
                setMoreModalItem(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Copy className="h-4 w-4 text-slate-600" /> Duplicate Notice
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(
                  `/announcements/${moreModalItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                  '_blank'
                );
                setMoreModalItem(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <ExternalLink className="h-4 w-4 text-emerald-600" /> Open on Public Site
            </button>
            <button
              type="button"
              onClick={() => {
                contentService.deleteItem(moreModalItem.id);
                setItems(contentService.getItems());
                setMoreModalItem(null);
                toast.success('Notice deleted');
              }}
              className="flex w-full items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" /> Delete Notice
            </button>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
