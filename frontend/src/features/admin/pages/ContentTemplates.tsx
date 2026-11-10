import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar,
  Copy,
  Edit3,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Layers3,
  Megaphone,
  Newspaper,
  Plus,
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
import AdminTablePagination from '../components/AdminTablePagination';
import contentService from '../services/content.service';
import type { ContentType } from '../components/ContentCard';

type TemplateCategory = 'Page' | 'Post' | 'Announcement' | 'Event' | 'Email' | 'Landing';

type Template = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  usage: number;
  lastUpdated: string;
  thumbnail: string;
  isDefault?: boolean;
  isFeatured?: boolean;
  fields: string[];
};

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 't-1',
    name: 'Hero Landing Page',
    description: 'Full-width hero with CTA, statistics strip, and feature grid for portal pages.',
    category: 'Landing',
    icon: Sparkles,
    color: '#003580',
    usage: 24,
    lastUpdated: '2 days ago',
    thumbnail: 'landing',
    isDefault: true,
    isFeatured: true,
    fields: ['Hero Title', 'Hero Subtitle', 'Primary CTA', 'Stat 1-4', 'Feature Cards'],
  },
  {
    id: 't-2',
    name: 'Alumni Spotlight Story',
    description: 'Profile template with biography, career timeline, achievements, and gallery.',
    category: 'Post',
    icon: GraduationCap,
    color: '#7C3AED',
    usage: 18,
    lastUpdated: '1 week ago',
    thumbnail: 'story',
    isFeatured: true,
    fields: ['Alumni Name', 'Graduation Year', 'Major', 'Bio', 'Career Timeline', 'Photo Gallery', 'Video URL'],
  },
  {
    id: 't-3',
    name: 'Event Detail Page',
    description: 'Event showcase with date, location, registration form, and corporate sponsors.',
    category: 'Event',
    icon: Calendar,
    color: '#E24B4A',
    usage: 32,
    lastUpdated: '3 days ago',
    thumbnail: 'event',
    fields: ['Event Title', 'Date & Time', 'Venue', 'Description', 'Registration', 'Sponsors'],
  },
  {
    id: 't-4',
    name: 'News Article',
    description: 'Standard university news release with hero image, body, tags, and related stories.',
    category: 'Post',
    icon: Newspaper,
    color: '#1D9E75',
    usage: 56,
    lastUpdated: '5 days ago',
    thumbnail: 'news',
    fields: ['Headline', 'Subtitle', 'Hero Image', 'Author', 'Body', 'Tags', 'Related Articles'],
  },
  {
    id: 't-5',
    name: 'Emergency Announcement',
    description: 'High-visibility alert banner with priority indicators and actionable campus notice.',
    category: 'Announcement',
    icon: Megaphone,
    color: '#E8A020',
    usage: 12,
    lastUpdated: '2 weeks ago',
    thumbnail: 'alert',
    fields: ['Alert Title', 'Severity', 'Effective Period', 'Action Required', 'Contact Department'],
  },
  {
    id: 't-6',
    name: 'Research Publication',
    description: 'Academic research showcase with abstract, authors, DOI, citations, and PDF link.',
    category: 'Page',
    icon: Trophy,
    color: '#7C3AED',
    usage: 8,
    lastUpdated: '1 month ago',
    thumbnail: 'research',
    fields: ['Title', 'Authors', 'Abstract', 'Keywords', 'DOI', 'Citations', 'PDF Attachment'],
  },
  {
    id: 't-7',
    name: 'Photo Gallery Album',
    description: 'Grid gallery with captions, lightbox, and campus category filters.',
    category: 'Page',
    icon: ImageIcon,
    color: '#003580',
    usage: 14,
    lastUpdated: '1 week ago',
    thumbnail: 'gallery',
    fields: ['Album Title', 'Cover Image', 'Photos', 'Captions', 'Category'],
  },
  {
    id: 't-8',
    name: 'Newsletter Bulletin',
    description: 'Monthly electronic newsletter with featured stories, announcements, and portal CTAs.',
    category: 'Email',
    icon: FileText,
    color: '#1D9E75',
    usage: 22,
    lastUpdated: '4 days ago',
    thumbnail: 'email',
    fields: ['Header', 'Featured Story', 'Secondary Highlights', 'Upcoming Events', 'Footer'],
  },
];

const CATEGORIES: Array<{ key: 'all' | TemplateCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'all', label: 'All Templates', icon: Layers3 },
  { key: 'Landing', label: 'Landing', icon: Sparkles },
  { key: 'Post', label: 'Posts', icon: Newspaper },
  { key: 'Page', label: 'Pages', icon: Globe },
  { key: 'Event', label: 'Events', icon: Calendar },
  { key: 'Announcement', label: 'Announcements', icon: Megaphone },
  { key: 'Email', label: 'Emails', icon: FileText },
];

const TEMPLATES_STORAGE_KEY = 'astu_cms_templates_items';

export default function ContentTemplates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | TemplateCategory>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Template CRUD Modal state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<TemplateCategory>('Page');
  const [formColor, setFormColor] = useState('#003580');
  const [formFieldsInput, setFormFieldsInput] = useState('');

  // Persistent templates state
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const saved = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => {
            const match = DEFAULT_TEMPLATES.find((t) => t.id === p.id);
            return {
              ...p,
              icon: match ? match.icon : FileText,
            };
          });
        }
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_TEMPLATES;
  });

  const saveTemplates = (newItems: Template[]) => {
    setTemplates(newItems);
    try {
      const serializable = newItems.map(({ icon, ...rest }) => rest);
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      /* ignore */
    }
  };

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [templates, search, category]);

  // Templates Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const stats = useMemo(() => {
    const total = templates.length;
    const featured = templates.filter((t) => t.isFeatured).length;
    const totalUsage = templates.reduce((sum, t) => sum + t.usage, 0);
    const categories = new Set(templates.map((t) => t.category)).size;
    return { total, featured, totalUsage, categories };
  }, [templates]);

  // Use Template: creates real draft item in contentService and navigates to content editor
  const handleUseTemplate = (template: Template) => {
    let contentType: ContentType = 'post';
    if (template.category === 'Landing' || template.category === 'Page') contentType = 'page';
    else if (template.category === 'Announcement') contentType = 'announcement';
    else if (template.category === 'Event') contentType = 'event';

    contentService.addItem({
      title: `${template.name} Draft`,
      type: contentType,
      status: 'Draft',
      excerpt: template.description,
      author: 'Content Manager',
      tags: [template.category.toLowerCase(), 'template', 'draft'],
      pinned: false,
      featured: false,
      language: 'EN',
    });

    // Increment usage
    const updated = templates.map((t) => (t.id === template.id ? { ...t, usage: t.usage + 1 } : t));
    saveTemplates(updated);

    toast.success(`Draft created from "${template.name}"! Opening editor...`);
    setPreviewTemplate(null);
    navigate('/cms/content');
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `t-${Date.now()}`,
      name: `${template.name} (Copy)`,
      usage: 0,
      lastUpdated: 'Just now',
      isDefault: false,
    };
    saveTemplates([newTemplate, ...templates]);
    toast.success(`Duplicated "${template.name}"!`);
  };

  const handleDelete = (template: Template) => {
    if (window.confirm(`Delete template "${template.name}"? This action cannot be undone.`)) {
      saveTemplates(templates.filter((t) => t.id !== template.id));
      toast.success(`Template "${template.name}" deleted`);
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormDescription('');
    setFormCategory('Page');
    setFormColor('#003580');
    setFormFieldsInput('Title, Subtitle, Body, Image');
    setTemplateModalOpen(true);
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormDescription(template.description);
    setFormCategory(template.category);
    setFormColor(template.color || '#003580');
    setFormFieldsInput(template.fields.join(', '));
    setTemplateModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Template name is required');
      return;
    }

    const fields = formFieldsInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingTemplate) {
      const updated = templates.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: formName.trim(),
              description: formDescription.trim(),
              category: formCategory,
              color: formColor,
              fields: fields.length ? fields : ['Title', 'Body'],
              lastUpdated: 'Just now',
            }
          : t
      );
      saveTemplates(updated);
      toast.success(`Template "${formName.trim()}" updated!`);
    } else {
      const created: Template = {
        id: `t-${Date.now()}`,
        name: formName.trim(),
        description: formDescription.trim() || 'Custom user-created template.',
        category: formCategory,
        icon: formCategory === 'Event' ? Calendar : formCategory === 'Announcement' ? Megaphone : FileText,
        color: formColor,
        usage: 0,
        lastUpdated: 'Just now',
        thumbnail: formCategory.toLowerCase(),
        fields: fields.length ? fields : ['Title', 'Body', 'Featured Image'],
      };
      saveTemplates([created, ...templates]);
      toast.success(`Created new template "${created.name}"!`);
    }

    setTemplateModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Content Templates"
        subtitle="Reusable, pre-designed content templates for pages, posts, events, and emails. Speed up content creation."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Templates' }]}
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3.5 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-sm cursor-pointer transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New Template
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Templates', value: stats.total, icon: Layers3, color: '#003580' },
          { label: 'Featured', value: stats.featured, icon: Star, color: '#E8A020' },
          { label: 'Total Uses', value: stats.totalUsage, icon: Copy, color: '#1D9E75' },
          { label: 'Categories', value: stats.categories, icon: Sparkles, color: '#7C3AED' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-8 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#003580] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#003580]/10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? 'border-[#003580] bg-[#003580] text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="h-3 w-3" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {paginatedTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <div
              key={template.id}
              className="group relative flex flex-col overflow-hidden rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:border-slate-700"
            >
              <div
                className="relative h-32 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}99 100%)` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_0%,transparent_40%,rgba(255,255,255,0.05)_60%,transparent_100%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="h-12 w-12 text-white/30 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute left-2 top-2 flex items-center gap-1">
                  {template.isDefault && <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Default</span>}
                  {template.isFeatured && <span className="rounded-md bg-violet-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Featured</span>}
                </div>
                <span className="absolute right-2 top-2 rounded-md bg-white/95 dark:bg-slate-900/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: template.color }}>
                  {template.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#003580] dark:group-hover:text-sky-400 transition-colors">{template.name}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{template.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.fields.slice(0, 3).map((f) => (
                    <span key={f} className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                      {f}
                    </span>
                  ))}
                  {template.fields.length > 3 && <span className="text-[10px] text-slate-400 dark:text-slate-500">+{template.fields.length - 3} more</span>}
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <span>Used {template.usage} times</span>
                  <span>{template.lastUpdated}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(template)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all"
                    title="Preview Template Structure"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(template)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-all"
                    title="Duplicate Template"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(template)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all"
                    title="Edit Template"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {!template.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDelete(template)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-all"
                      title="Delete Template"
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

      {/* Templates Pagination */}
      <AdminTablePagination
        currentPage={currentPage}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={[8, 16, 24, 48]}
        itemName="templates"
      />

      {/* Preview Modal */}
      {previewTemplate && (
        <AdminModal
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={`Template Preview: ${previewTemplate.name}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <AdminBadge variant="info">Category: {previewTemplate.category}</AdminBadge>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-4 py-2 text-xs font-bold text-white hover:brightness-110 shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Use This Template
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">{previewTemplate.description}</p>
            <div>
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Configured Content Fields</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {previewTemplate.fields.map((f) => (
                  <div key={f} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-white">{f}</span>
                    <div className="mt-0.5 text-[10px] text-slate-400">Structured CMS input block</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
              <span>Clicking &quot;Use This Template&quot; will create a live draft in Content Manager pre-formatted with these fields.</span>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Create / Edit Template Modal */}
      <AdminModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title={editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create New Template'}
        size="md"
      >
        <form onSubmit={handleSaveModal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Template Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Student Hackathon Banner"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as TemplateCategory)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580] cursor-pointer"
              >
                <option value="Page">Page</option>
                <option value="Post">Post (Article / News)</option>
                <option value="Announcement">Announcement</option>
                <option value="Event">Event</option>
                <option value="Landing">Landing</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Theme Accent Color</label>
              <select
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580] cursor-pointer"
              >
                <option value="#003580">ASTU Navy (#003580)</option>
                <option value="#7C3AED">Purple (#7C3AED)</option>
                <option value="#1D9E75">Emerald (#1D9E75)</option>
                <option value="#E24B4A">Crimson (#E24B4A)</option>
                <option value="#E8A020">Gold / Amber (#E8A020)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Explain the purpose and layout of this template..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Names <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formFieldsInput}
              onChange={(e) => setFormFieldsInput(e.target.value)}
              placeholder="Headline, Subtitle, Hero Image, Body Content"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-xs outline-none focus:border-[#003580]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTemplateModalOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#003580] px-5 py-2 text-xs font-bold text-white hover:brightness-110 shadow-sm cursor-pointer"
            >
              {editingTemplate ? 'Save Template Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
