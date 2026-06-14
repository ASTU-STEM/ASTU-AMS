import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';

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

const TEMPLATES: Template[] = [
  {
    id: 't-1',
    name: 'Hero Landing Page',
    description: 'Full-width hero with CTA, statistics strip, and feature grid.',
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
    description: 'Profile template with biography, career timeline, and gallery.',
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
    description: 'Event page with date, location, registration form, and sponsors.',
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
    description: 'Standard news article with hero image, body, and related stories.',
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
    description: 'High-visibility alert with priority banner and quick info card.',
    category: 'Announcement',
    icon: Megaphone,
    color: '#E8A020',
    usage: 12,
    lastUpdated: '2 weeks ago',
    thumbnail: 'alert',
    fields: ['Alert Title', 'Severity', 'Effective Period', 'Action Required', 'Contact'],
  },
  {
    id: 't-6',
    name: 'Research Publication',
    description: 'Academic research showcase with abstract, authors, and citations.',
    category: 'Page',
    icon: Trophy,
    color: '#7C3AED',
    usage: 8,
    lastUpdated: '1 month ago',
    thumbnail: 'research',
    fields: ['Title', 'Authors', 'Abstract', 'Keywords', 'DOI', 'Citations', 'PDF'],
  },
  {
    id: 't-7',
    name: 'Photo Gallery Album',
    description: 'Grid gallery with captions, lightbox, and category filters.',
    category: 'Page',
    icon: ImageIcon,
    color: '#7C3AED',
    usage: 14,
    lastUpdated: '1 week ago',
    thumbnail: 'gallery',
    fields: ['Album Title', 'Cover Image', 'Photos', 'Captions', 'Category'],
  },
  {
    id: 't-8',
    name: 'Newsletter Email',
    description: 'Monthly newsletter template with featured stories and CTA.',
    category: 'Email',
    icon: FileText,
    color: '#1D9E75',
    usage: 22,
    lastUpdated: '4 days ago',
    thumbnail: 'email',
    fields: ['Header', 'Featured Story', 'Secondary Stories', 'Footer'],
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

export default function ContentTemplates() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | TemplateCategory>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, category]);

  const stats = useMemo(() => {
    const total = TEMPLATES.length;
    const featured = TEMPLATES.filter((t) => t.isFeatured).length;
    const totalUsage = TEMPLATES.reduce((sum, t) => sum + t.usage, 0);
    const categories = new Set(TEMPLATES.map((t) => t.category)).size;
    return { total, featured, totalUsage, categories };
  }, []);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Content Templates"
        subtitle="Reusable, pre-designed content templates for pages, posts, events, and emails. Speed up content creation."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Templates' }]}
        actions={
          <button type="button" onClick={() => toast.success('Template editor opened')} className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-sm">
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
            <div key={s.label} className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{s.label}</p>
                <p className="text-xl font-semibold tracking-tight text-slate-900">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="w-full rounded-[8px] border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.key;
            return (
              <button key={c.key} type="button" onClick={() => setCategory(c.key)} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${active ? 'border-[#003580] bg-[#003580] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-[#003580]/40'}`}>
                <Icon className="h-3 w-3" /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((template) => {
          const Icon = template.icon;
          return (
            <div key={template.id} className="group relative flex flex-col overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative h-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}99 100%)` }}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_0%,transparent_40%,rgba(255,255,255,0.05)_60%,transparent_100%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="h-12 w-12 text-white/30" />
                </div>
                <div className="absolute left-2 top-2 flex items-center gap-1">
                  {template.isDefault && <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Default</span>}
                  {template.isFeatured && <span className="rounded-md bg-violet-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Featured</span>}
                </div>
                <span className="absolute right-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: template.color }}>{template.category}</span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-semibold text-slate-900">{template.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{template.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.fields.slice(0, 3).map((f) => (
                    <span key={f} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{f}</span>
                  ))}
                  {template.fields.length > 3 && <span className="text-[10px] text-slate-400">+{template.fields.length - 3} more</span>}
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Used {template.usage} times</span>
                  <span>{template.lastUpdated}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
                  <button type="button" onClick={() => setPreviewTemplate(template)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100" title="Preview">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => toast.success(`Template "${template.name}" duplicated`)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600" title="Duplicate">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => toast.success('Template editor opened')} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-600" title="Edit">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="ml-auto inline-flex items-center gap-1 rounded-md bg-[#003580] px-2.5 py-1 text-[10px] font-semibold text-white hover:brightness-110">
                    <Plus className="h-3 w-3" /> Use
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {previewTemplate && (
        <div onClick={() => setPreviewTemplate(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md" style={{ backgroundColor: `${previewTemplate.color}15`, color: previewTemplate.color }}>
                  {React.createElement(previewTemplate.icon, { className: 'h-4 w-4' })}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{previewTemplate.name}</h2>
                  <p className="text-xs text-slate-500">{previewTemplate.category} · Used {previewTemplate.usage} times</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-slate-700">{previewTemplate.description}</p>
              <div>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Template Fields</h3>
                <div className="grid grid-cols-2 gap-2">
                  {previewTemplate.fields.map((f) => (
                    <div key={f} className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-700">
                      <span className="font-semibold">{f}</span>
                      <div className="mt-1 text-[10px] text-slate-400">Text input</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Preview shows the editable structure. After applying, fields are filled in by content editors.
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
              <AdminBadge variant="info">v2.4</AdminBadge>
              <button type="button" onClick={() => setPreviewTemplate(null)} className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Close</button>
              <button type="button" onClick={() => { toast.success('Template applied to new content'); setPreviewTemplate(null); }} className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
                <Plus className="h-4 w-4" /> Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
