import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  Edit3,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Layers3,
  Loader2,
  Megaphone,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import contentService from '../services/content.service';
import templateService, { ContentTemplate, TemplateCategory } from '../services/template.service';
import type { ContentType } from '../components/ContentCard';

const CATEGORIES: Array<{ key: 'all' | TemplateCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'all', label: 'All Templates', icon: Layers3 },
  { key: 'Landing', label: 'Landing Pages', icon: Sparkles },
  { key: 'Post', label: 'Posts & News', icon: Newspaper },
  { key: 'Page', label: 'Portal Pages', icon: Globe },
  { key: 'Event', label: 'Events & Expos', icon: Calendar },
  { key: 'Announcement', label: 'Announcements', icon: Megaphone },
  { key: 'Email', label: 'Email Bulletins', icon: FileText },
];

const getTemplateIcon = (iconName?: string, category?: string): React.ComponentType<{ className?: string }> => {
  switch (iconName) {
    case 'Sparkles':
      return Sparkles;
    case 'GraduationCap':
      return GraduationCap;
    case 'Calendar':
      return Calendar;
    case 'Newspaper':
      return Newspaper;
    case 'Megaphone':
      return Megaphone;
    case 'Trophy':
      return Trophy;
    case 'Image':
      return ImageIcon;
    case 'Briefcase':
      return Briefcase;
    case 'Award':
      return Award;
    case 'FileText':
      return FileText;
    default:
      if (category === 'Landing') return Sparkles;
      if (category === 'Post') return Newspaper;
      if (category === 'Event') return Calendar;
      if (category === 'Announcement') return Megaphone;
      if (category === 'Email') return FileText;
      return FileText;
  }
};

export default function ContentTemplates() {
  const navigate = useNavigate();

  // Data state
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Filters & search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | TemplateCategory>('all');
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  // Modals state
  const [previewTemplate, setPreviewTemplate] = useState<ContentTemplate | null>(null);
  const [previewTab, setPreviewTab] = useState<'overview' | 'starter'>('overview');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContentTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<TemplateCategory>('Page');
  const [formColor, setFormColor] = useState('#003580');
  const [formFieldsInput, setFormFieldsInput] = useState('');
  const [formStarterBody, setFormStarterBody] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Fetch templates from backend database
  const fetchTemplates = useCallback(async (showSyncToast = false) => {
    try {
      if (showSyncToast) setIsSyncing(true);
      const data = await templateService.getTemplates();
      setTemplates(data);
      setIsBackendConnected(true);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (showSyncToast) {
        toast.success(`Synchronized ${data.length} templates from backend database`);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setIsBackendConnected(false);
      if (showSyncToast) {
        toast.error('Could not reach backend database; using cached layouts.');
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Filtered templates
  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (onlyFeatured && !t.isFeatured) return false;
      if (search) {
        const q = search.toLowerCase();
        const inName = t.name.toLowerCase().includes(q);
        const inDesc = t.description.toLowerCase().includes(q);
        const inFields = Array.isArray(t.fields) && t.fields.some((f) => f.toLowerCase().includes(q));
        const inStarter = t.starterBody ? t.starterBody.toLowerCase().includes(q) : false;
        return inName || inDesc || inFields || inStarter;
      }
      return true;
    });
  }, [templates, search, category, onlyFeatured]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = templates.length;
    const featured = templates.filter((t) => t.isFeatured).length;
    const totalUsage = templates.reduce((sum, t) => sum + (t.usage || 0), 0);
    const categoriesCount = new Set(templates.map((t) => t.category)).size;
    return { total, featured, totalUsage, categoriesCount };
  }, [templates]);

  // Action: Use template to create real CMS draft
  const handleUseTemplate = async (template: ContentTemplate) => {
    try {
      // 1. Record usage in backend
      const updated = await templateService.useTemplate(template.id);
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      // 2. Determine target CMS ContentType
      let contentType: ContentType = 'post';
      if (template.category === 'Landing' || template.category === 'Page') contentType = 'page';
      else if (template.category === 'Announcement') contentType = 'announcement';
      else if (template.category === 'Event') contentType = 'event';

      // 3. Create active draft in CMS Content Manager
      contentService.addItem({
        title: `${template.name} Draft`,
        type: contentType,
        status: 'Draft',
        excerpt: template.description,
        content: template.starterBody || `# ${template.name}

${template.description}`,
        author: 'Content Manager (Alumni Office)',
        tags: [template.category.toLowerCase(), 'template', 'draft'],
        pinned: false,
        featured: Boolean(template.isFeatured),
        language: 'EN',
      });

      toast.success(`Draft created from "${template.name}"! Opening Content Editor...`);
      setPreviewTemplate(null);
      navigate('/cms/content?from=template');
    } catch (error) {
      console.error('Failed to record template usage:', error);
      toast.error('Could not create draft. Please try again.');
    }
  };

  // Action: Duplicate template on backend
  const handleDuplicate = async (template: ContentTemplate) => {
    try {
      const duplicateData: Partial<ContentTemplate> = {
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        color: template.color,
        iconName: template.iconName,
        thumbnail: template.thumbnail,
        fields: [...template.fields],
        starterBody: template.starterBody,
        isFeatured: false,
        isDefault: false,
      };

      const created = await templateService.createTemplate(duplicateData);
      setTemplates((prev) => [created, ...prev]);
      toast.success(`Duplicated "${template.name}" successfully on database!`);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      toast.error('Failed to duplicate template.');
    }
  };

  // Action: Delete template from backend
  const handleDelete = async (template: ContentTemplate) => {
    if (template.isDefault) {
      toast.error('Default system starter templates cannot be deleted.');
      return;
    }

    if (window.confirm(`Delete template "${template.name}"? This action permanently removes it from the database.`)) {
      try {
        const success = await templateService.deleteTemplate(template.id);
        if (success) {
          setTemplates((prev) => prev.filter((t) => t.id !== template.id));
          toast.success(`Template "${template.name}" removed from database.`);
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
        toast.error('Failed to delete template from database.');
      }
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormDescription('');
    setFormCategory('Page');
    setFormColor('#003580');
    setFormFieldsInput('Hero Title, Subtitle, Body Content, Action CTA, Media Gallery');
    setFormStarterBody(
      '# Template Title\n\nIntroductory overview for this layout.\n\n## Key Highlights\n- Point 1\n- Point 2\n\n### Call to Action\nJoin our community initiatives.'
    );
    setFormIsFeatured(false);
    setTemplateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (template: ContentTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormDescription(template.description);
    setFormCategory(template.category);
    setFormColor(template.color || '#003580');
    setFormFieldsInput(Array.isArray(template.fields) ? template.fields.join(', ') : '');
    setFormStarterBody(template.starterBody || '');
    setFormIsFeatured(Boolean(template.isFeatured));
    setTemplateModalOpen(true);
  };

  // Submit Modal (Create or Update)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Template name is required');
      return;
    }

    const fields = formFieldsInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    let iconName = 'FileText';
    if (formCategory === 'Landing') iconName = 'Sparkles';
    else if (formCategory === 'Post') iconName = 'Newspaper';
    else if (formCategory === 'Event') iconName = 'Calendar';
    else if (formCategory === 'Announcement') iconName = 'Megaphone';
    else if (formCategory === 'Email') iconName = 'FileText';

    setIsSaving(true);
    try {
      if (editingTemplate) {
        const updated = await templateService.updateTemplate(editingTemplate.id, {
          name: formName.trim(),
          description: formDescription.trim(),
          category: formCategory,
          color: formColor,
          iconName,
          fields: fields.length ? fields : ['Title', 'Body Content'],
          starterBody: formStarterBody,
          isFeatured: formIsFeatured,
        });

        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success(`Template "${updated.name}" updated on database!`);
      } else {
        const created = await templateService.createTemplate({
          name: formName.trim(),
          description: formDescription.trim() || 'Custom user-created template layout.',
          category: formCategory,
          color: formColor,
          iconName,
          fields: fields.length ? fields : ['Title', 'Body Content', 'Featured Image'],
          starterBody: formStarterBody,
          isFeatured: formIsFeatured,
          isDefault: false,
        });

        setTemplates((prev) => [created, ...prev]);
        toast.success(`Template "${created.name}" created on backend database!`);
      }
      setTemplateModalOpen(false);
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <AdminPageHeader
        title="Content Templates"
        subtitle="Reusable starter layouts for pages, posts, events, and emails. Usage counts track drafts created from this workstation."
        breadcrumbs={[{ label: 'Content Management' }, { label: 'Templates' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchTemplates(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs cursor-pointer transition-all disabled:opacity-50"
              title="Synchronize templates from backend PostgreSQL/dev-db"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-[#003580]' : ''}`} />
              Sync DB
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3.5 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-sm cursor-pointer transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              New Template
            </button>
          </div>
        }
      />

      {/* Backend Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBackendConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
            <Database className="h-3.5 w-3.5 text-[#003580] dark:text-sky-400" />
            <span>
              {isBackendConnected
                ? 'Live Backend Database Connected (/api/content/templates)'
                : 'Offline Cache Active (Fallback)'}
            </span>
          </div>
          <span className="text-slate-400 dark:text-slate-500">·</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {templates.length} Active Templates Registered
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Last Synced: <span className="font-semibold text-slate-700 dark:text-slate-300">{lastRefreshed}</span>
        </div>
      </div>

      {/* Executive Statistics Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total Templates', value: stats.total, icon: Layers3, color: '#003580' },
          { label: 'Featured Starters', value: stats.featured, icon: Star, color: '#E8A020' },
          { label: 'Lifetime Uses', value: stats.totalUsage, icon: Copy, color: '#1D9E75' },
          { label: 'Layout Categories', value: stats.categoriesCount, icon: Sparkles, color: '#7C3AED' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3 transition-transform hover:-translate-y-0.5"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${s.color}15`, color: s.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 truncate">
                  {s.label}
                </p>
                <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates by name, description, fields, or markdown keywords..."
              className="w-full rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-8 pr-8 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#003580] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#003580]/10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter: Featured Only */}
          <button
            type="button"
            onClick={() => setOnlyFeatured((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              onlyFeatured
                ? 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${onlyFeatured ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            Featured Starters
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.key;
            const count = categoryCounts[c.key] || 0;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? 'border-[#003580] bg-[#003580] text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{c.label}</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                    active ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#003580] dark:text-sky-400" />
          <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Loading templates from backend...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <FileText className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No templates match your filters</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try choosing another category, disabling the featured filter, or clearing your search term.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('all');
              setOnlyFeatured(false);
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#003580] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer hover:brightness-110"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((template) => {
            const Icon = getTemplateIcon(template.iconName, template.category);
            return (
              <div
                key={template.id}
                className="group relative flex flex-col overflow-hidden rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:border-slate-700"
              >
                {/* Header Banner */}
                <div
                  className="relative h-28 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}bb 100%)` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_0%,transparent_40%,rgba(255,255,255,0.05)_60%,transparent_100%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="h-12 w-12 text-white/30 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1">
                    {template.isDefault && (
                      <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                        Default
                      </span>
                    )}
                    {template.isFeatured && (
                      <span className="rounded-md bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-white" /> Featured
                      </span>
                    )}
                  </div>
                  <span
                    className="absolute right-2.5 top-2.5 rounded-md bg-white/95 dark:bg-slate-900/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs"
                    style={{ color: template.color }}
                  >
                    {template.category}
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#003580] dark:group-hover:text-sky-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Schema Fields Chips */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {Array.isArray(template.fields) &&
                      template.fields.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          {f}
                        </span>
                      ))}
                    {Array.isArray(template.fields) && template.fields.length > 3 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                        +{template.fields.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Usage Counter and Timestamp */}
                  <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Copy className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      Used {template.usage || 0} times
                    </span>
                    <span className="text-[10px] text-slate-400">{template.lastUpdated || 'Starter'}</span>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewTemplate(template);
                        setPreviewTab('overview');
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all"
                      title="Preview Template Structure & Starter Markdown"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(template)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-all"
                      title="Duplicate Template on Backend DB"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(template)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all"
                      title="Edit Template on Backend DB"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {!template.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDelete(template)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-all"
                        title="Delete Template from Database"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleUseTemplate(template)}
                      className="ml-auto inline-flex items-center gap-1 rounded-lg bg-[#003580] px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 shadow-xs cursor-pointer transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Use
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rich Preview Modal */}
      {previewTemplate && (
        <AdminModal
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={`Template Preview: ${previewTemplate.name}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <AdminBadge variant="info">Category: {previewTemplate.category}</AdminBadge>
                {previewTemplate.isFeatured && (
                  <span className="rounded-md bg-violet-100 dark:bg-violet-900/50 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-300">
                    ★ Featured
                  </span>
                )}
                <span className="text-xs text-slate-500">Used {previewTemplate.usage || 0} times</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-4 py-2 text-xs font-bold text-white hover:brightness-110 shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Generate CMS Draft Now
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <button
                type="button"
                onClick={() => setPreviewTab('overview')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                  previewTab === 'overview'
                    ? 'bg-[#003580] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers3 className="h-3.5 w-3.5" />
                Schema & Fields ({previewTemplate.fields.length})
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('starter')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                  previewTab === 'starter'
                    ? 'bg-[#003580] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Starter Markdown Content
              </button>
            </div>

            {previewTab === 'overview' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {previewTemplate.description}
                </p>

                <div>
                  <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Configured Template Schema Fields
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewTemplate.fields.map((f, idx) => (
                      <div
                        key={f}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#003580]/10 text-[10px] font-bold text-[#003580] dark:text-sky-400">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-white">{f}</span>
                          <div className="mt-0.5 text-[10px] text-slate-400">
                            Structured ASTU CMS input and display block
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/40 px-3.5 py-2.5 text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>
                    Clicking &quot;Generate CMS Draft Now&quot; will create an active draft in Content Manager
                    pre-populated with these starter values and direct you to the editor.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Starter Layout Markdown Pre-fill
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {(previewTemplate.starterBody || '').split('\n').length} Lines
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900 p-4 text-xs font-mono text-emerald-300 whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {previewTemplate.starterBody || '# Starter Layout\n\nNo predefined starter markdown.'}
                </div>
              </div>
            )}
          </div>
        </AdminModal>
      )}

      {/* Create / Edit Template Modal (Persistent to Backend Database) */}
      <AdminModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title={editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create New Template (Backend Database)'}
        size="lg"
      >
        <form onSubmit={handleSaveModal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Template Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Student Innovation & Hackathon Showcase"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as TemplateCategory)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580] cursor-pointer"
              >
                <option value="Page">Portal Page</option>
                <option value="Post">Post (Article / Alumni Story)</option>
                <option value="Announcement">Announcement / Alert</option>
                <option value="Event">Event & Workshop</option>
                <option value="Landing">Hero Landing</option>
                <option value="Email">Email Digest / Bulletin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Theme Accent Color
              </label>
              <select
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580] cursor-pointer"
              >
                <option value="#003580">ASTU Primary Navy (#003580)</option>
                <option value="#7C3AED">Academic Purple (#7C3AED)</option>
                <option value="#1D9E75">Sustainability Emerald (#1D9E75)</option>
                <option value="#E24B4A">Campus Crimson (#E24B4A)</option>
                <option value="#E8A020">Executive Amber / Gold (#E8A020)</option>
                <option value="#0284C7">Research Cyan (#0284C7)</option>
                <option value="#4F46E5">Tech Indigo (#4F46E5)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-[#003580] focus:ring-[#003580] h-4 w-4 cursor-pointer"
                />
                <span>Highlight as Featured Template on Portal</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Purpose
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Explain the intended purpose and layout recommendations for this starter..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Schema Input Fields <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formFieldsInput}
              onChange={(e) => setFormFieldsInput(e.target.value)}
              placeholder="Headline, Subtitle, Hero Banner, Body Content, Action CTA"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Starter Markdown / Content Body
            </label>
            <textarea
              rows={6}
              value={formStarterBody}
              onChange={(e) => setFormStarterBody(e.target.value)}
              placeholder="# Starter Header\n\nWrite starter markdown or initial layout structure..."
              className="w-full font-mono rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580] resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTemplateModalOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#003580] px-5 py-2 text-xs font-bold text-white hover:brightness-110 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving to Database...
                </>
              ) : editingTemplate ? (
                'Save Changes to Backend'
              ) : (
                'Create Template in Database'
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
