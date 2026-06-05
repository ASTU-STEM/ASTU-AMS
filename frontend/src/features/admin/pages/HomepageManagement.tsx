import React, { useState, useCallback } from 'react';
import {
  BarChart3,
  CalendarDays,
  Edit3,
  Eye,
  Footprints,
  GraduationCap,
  ImagePlus,
  Link2,
  Newspaper,
  PlayCircle,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  CheckCircle2,
  Clock,
  Send,
  X,
  Globe,
  Settings2,
  Building2,
  Handshake,
  Quote,
  Briefcase,
  HelpCircle as HelpCircleIcon,
  SlidersHorizontal,
  PanelRightOpen,
  PanelRightClose,
  FileText,
  Undo2,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';

type PublishState = 'Published' | 'Draft' | 'Scheduled';

type HomepageItem = {
  id: string;
  title: string;
  detail: string;
  status: PublishState;
  updated: string;
  pinned?: boolean;
  featured?: boolean;
};

const heroSlides: HomepageItem[] = [
  { id: 'HERO-01', title: 'ASTU Alumni Network', detail: 'Main hero with graduate community call-to-action', status: 'Published', updated: 'Today', pinned: true },
  { id: 'HERO-02', title: 'Industry Partnership Week', detail: 'Employer registration and event promotion', status: 'Scheduled', updated: 'Jun 5, 2026' },
  { id: 'HERO-03', title: 'Tracer Survey Campaign', detail: 'Encourages alumni to update career outcomes', status: 'Draft', updated: 'Yesterday' },
];

const quickLinks = [
  'Alumni Registration',
  'Employer Portal',
  'Tracer Survey',
  'Transcript Request',
  'Career Events',
  'Department Reports',
];

const contentModules = [
  { title: 'Hero Slider Management', icon: ImagePlus, count: '3 slides', description: 'Create, edit, schedule, preview, and delete homepage slides.', tone: 'text-[#003580]', bg: 'bg-[#003580]/10', items: 3, status: 'active' as const },
  { title: 'Upcoming Workshops', icon: CalendarDays, count: '3 workshops', description: 'Create workshop cards with registration, RSVP, QR attendance, certificates, and feedback forms.', tone: 'text-rose-700', bg: 'bg-rose-500/10', items: 3, status: 'active' as const },
  { title: 'Video Gallery', icon: PlayCircle, count: '7 videos', description: 'Upload livestream links, graduation videos, workshop recordings, and featured thumbnails.', tone: 'text-sky-700', bg: 'bg-sky-500/10', items: 7, status: 'active' as const },
  { title: 'Featured Alumni', icon: GraduationCap, count: '6 profiles', description: 'Approve alumni profiles, success stories, awards, startups, publications, and volunteer highlights.', tone: 'text-violet-600', bg: 'bg-violet-500/10', items: 6, status: 'active' as const },
  { title: 'Featured Employers', icon: Building2, count: '4 companies', description: 'Promote verified employers, internships, job fairs, campus recruitment events, and partner badges.', tone: 'text-[#E24B4A]', bg: 'bg-[#E24B4A]/10', items: 4, status: 'active' as const },
  { title: 'Research & Innovation', icon: Trophy, count: '5 highlights', description: 'Publish research outputs, innovation achievements, industry projects, and university rankings.', tone: 'text-orange-700', bg: 'bg-orange-500/10', items: 5, status: 'active' as const },
  { title: 'Partner Companies', icon: Handshake, count: '12 partners', description: 'Manage sponsors, partnership tiers, logos, websites, and accreditation evidence links.', tone: 'text-teal-700', bg: 'bg-teal-500/10', items: 12, status: 'active' as const },
  { title: 'Testimonials', icon: Quote, count: '12 quotes', description: 'Curate quotes from alumni, employers, departments, and accreditation stakeholders.', tone: 'text-emerald-700', bg: 'bg-emerald-500/10', items: 12, status: 'active' as const },
  { title: 'Career Opportunities', icon: Briefcase, count: '24 openings', description: 'Feature jobs, internships, candidate matching campaigns, and career call-to-actions.', tone: 'text-fuchsia-700', bg: 'bg-fuchsia-500/10', items: 24, status: 'active' as const },
  { title: 'FAQ Section', icon: HelpCircleIcon, count: '9 FAQs', description: 'Create categorized FAQ entries for alumni, employers, registrar services, events, and tracer surveys.', tone: 'text-lime-700', bg: 'bg-lime-500/10', items: 9, status: 'active' as const },
];

const managedEntries = [
  { title: 'Homepage Banner Management', description: 'Manage announcement banners, alerts, and promotional strips.', icon: Sparkles },
  { title: 'News & Announcements', description: 'Publish university news, alumni achievements, and community updates.', icon: Newspaper },
  { title: 'Statistics Counter', description: 'Configure live counters for alumni, employers, jobs, and surveys.', icon: BarChart3 },
  { title: 'Success Stories', description: 'Share graduate success journeys with media and outcome metrics.', icon: Star },
  { title: 'Footer Content', description: 'Edit footer links, accreditation logos, social media, and copyright.', icon: Footprints },
];

const statusClasses: Record<PublishState, string> = {
  Published: 'border-emerald-500/20 bg-emerald-50 text-emerald-700',
  Draft: 'border-slate-200 bg-slate-100 text-slate-600',
  Scheduled: 'border-blue-500/20 bg-blue-50 text-blue-700',
};

const statusIcons: Record<PublishState, React.ComponentType<{ className?: string }>> = {
  Published: CheckCircle2,
  Draft: FileText,
  Scheduled: Clock,
};

const statusColors: Record<PublishState, string> = {
  Published: '#1D9E75',
  Draft: '#64748B',
  Scheduled: '#003580',
};

function formatDate() {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
}

export default function HomepageManagement() {
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Welcome to the ASTU Alumni Management System, a digital bridge between graduates, employers, departments, and university services.'
  );
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createType, setCreateType] = useState(contentModules[0].title);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HomepageItem | null>(null);
  const [showNewSlideForm, setShowNewSlideForm] = useState(false);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideDetail, setNewSlideDetail] = useState('');
  const [draftItems, setDraftItems] = useState<HomepageItem[]>([
    { id: 'SEC-01', title: 'Featured Employers Refresh', detail: 'Promote verified partner companies on the public homepage', status: 'Draft', updated: 'Today', pinned: false, featured: false },
    { id: 'SEC-02', title: 'Workshop Registration CTA', detail: 'Add QR attendance and certificate language to the workshop section', status: 'Scheduled', updated: 'Jun 8, 2026', pinned: true, featured: false },
    { id: 'SEC-03', title: 'Alumni Spotlight: Mekdes Yilma', detail: 'Feature top graduate success story with video testimonial', status: 'Published', updated: 'Jun 2, 2026', pinned: true, featured: true },
    { id: 'SEC-04', title: 'Employer Branding: Ethio Telecom', detail: 'Promote Ethio Telecom as a featured recruitment partner', status: 'Draft', updated: 'May 30, 2026', pinned: false, featured: false },
    { id: 'SEC-05', title: 'Tracer Survey Reminder Banner', detail: 'Call-to-action for 2024 batch to complete their career outcome survey', status: 'Scheduled', updated: 'May 28, 2026', pinned: false, featured: false },
  ]);
  const [welcomeSaved, setWelcomeSaved] = useState(false);

  const today = formatDate();

  const createSection = useCallback(() => {
    const nextItem: HomepageItem = {
      id: `SEC-${String(draftItems.length + 3).padStart(2, '0')}`,
      title: createTitle || createType,
      detail: createDesc || `${createType} content block ready for editing, preview, scheduling, and publishing.`,
      status: 'Draft',
      updated: 'Just now',
      pinned: false,
      featured: false,
    };
    setDraftItems((current) => [nextItem, ...current]);
    setCreateTitle('');
    setCreateDesc('');
    toast.success(`Section "${nextItem.title}" created as Draft`);
  }, [createTitle, createType, createDesc, draftItems.length]);

  const createNewSlide = useCallback(() => {
    if (!newSlideTitle.trim()) { toast.error('Slide title is required'); return; }
    const slide: HomepageItem = {
      id: `SLIDE-${String(Date.now()).slice(-4)}`,
      title: newSlideTitle.trim(),
      detail: newSlideDetail.trim() || 'New homepage hero slide ready for configuration.',
      status: 'Draft',
      updated: 'Just now',
      pinned: false,
      featured: false,
    };
    setDraftItems((current) => [slide, ...current]);
    setNewSlideTitle('');
    setNewSlideDetail('');
    setShowNewSlideForm(false);
    toast.success(`Slide "${slide.title}" created`);
  }, [newSlideTitle, newSlideDetail]);

  const togglePin = useCallback((id: string) => {
    setDraftItems((current) => {
      const item = current.find(i => i.id === id);
      toast.success(item?.pinned ? 'Item unpinned' : 'Item pinned to top');
      return current.map((item) => item.id === id ? { ...item, pinned: !item.pinned } : item);
    });
  }, []);

  const toggleFeature = useCallback((id: string) => {
    setDraftItems((current) => {
      const item = current.find(i => i.id === id);
      toast.success(item?.featured ? 'Featured badge removed' : 'Item marked as featured');
      return current.map((item) => item.id === id ? { ...item, featured: !item.featured } : item);
    });
  }, []);

  const changeStatus = useCallback((id: string, status: PublishState) => {
    setDraftItems((current) =>
      current.map((item) => item.id === id ? { ...item, status, updated: 'Just now' } : item)
    );
    toast.success(`Status changed to ${status}`);
  }, []);

  const cycleStatus = useCallback((id: string) => {
    setDraftItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const next: Record<string, PublishState> = { Published: 'Draft', Draft: 'Scheduled', Scheduled: 'Published' };
        const newStatus = next[item.status];
        toast.success(`"${item.title}" → ${newStatus}`);
        return { ...item, status: newStatus, updated: 'Just now' };
      })
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    const item = draftItems.find(i => i.id === id);
    setDraftItems((current) => current.filter((item) => item.id !== id));
    if (selectedSlide?.id === id) setSelectedSlide(null);
    toast.success(`"${item?.title || id}" deleted`);
  }, [draftItems, selectedSlide]);

  const saveWelcome = useCallback(() => {
    setWelcomeSaved(true);
    toast.success('Welcome message saved');
    setTimeout(() => setWelcomeSaved(false), 2000);
  }, []);

  const openSlideEditor = useCallback((slide: HomepageItem) => {
    setSelectedSlide(slide);
    setDetailPanelOpen(true);
  }, []);

  const duplicateItem = useCallback((id: string) => {
    const item = draftItems.find(i => i.id === id);
    if (!item) return;
    const copy: HomepageItem = { ...item, id: `SEC-${String(draftItems.length + 3).padStart(2, '0')}`, title: `${item.title} (Copy)`, status: 'Draft', updated: 'Just now' };
    setDraftItems((current) => [copy, ...current]);
    toast.success(`"${item.title}" duplicated`);
  }, [draftItems]);

  const allSlides = [...draftItems, ...heroSlides];
  const activeModules = contentModules.filter(m => m.status === 'active');
  const publishedCount = allSlides.filter(s => s.status === 'Published').length;
  const draftCount = allSlides.filter(s => s.status === 'Draft').length;
  const scheduledCount = allSlides.filter(s => s.status === 'Scheduled').length;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes slide-panel-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .slide-panel { animation: slide-panel-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-up { animation: fade-up 0.35s ease-out both; }
        .fade-up:nth-child(2) { animation-delay: 0.05s; }
        .fade-up:nth-child(3) { animation-delay: 0.1s; }
        .fade-up:nth-child(4) { animation-delay: 0.15s; }
        .fade-up:nth-child(5) { animation-delay: 0.2s; }
      `}</style>

      <AdminPageHeader
        title="Homepage Management"
        subtitle="Control every public homepage section: hero slides, banners, featured content, quick links, statistics, stories, testimonials, and footer blocks."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Homepage' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="info">Public Site CMS</AdminBadge>
            <button type="button" onClick={() => setDetailPanelOpen(!detailPanelOpen)}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              {detailPanelOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
              {detailPanelOpen ? 'Close Panel' : 'Details'}
            </button>
          </div>
        }
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Modules', value: activeModules.length, icon: Globe, tone: 'text-[#003580]', bg: 'bg-[#003580]/10' },
          { label: 'Published', value: publishedCount, icon: CheckCircle2, tone: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Drafts', value: draftCount, icon: FileText, tone: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Scheduled', value: scheduledCount, icon: Clock, tone: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="fade-up rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} ${stat.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                <p className="text-xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Modules Grid */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {contentModules.map((module) => {
          const Icon = module.icon;
          const active = selectedModule === module.title;
          return (
            <button
              key={module.title}
              type="button"
              onClick={() => { setSelectedModule(module.title); setExpandedModule(expandedModule === module.title ? null : module.title); }}
              className={`relative rounded-[12px] border p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${active ? 'border-[#003580] bg-[#003580]/5 ring-1 ring-[#003580]/15' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] ${module.bg} ${module.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${module.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                  {module.items} items
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{module.title}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{module.description}</p>
              {expandedModule === module.title && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toast.success(`Opening ${module.title} editor`)}
                    className="inline-flex items-center gap-1 rounded-md bg-[#003580]/10 px-2 py-1 text-[10px] font-semibold text-[#003580] hover:bg-[#003580]/20 transition-all"><Edit3 className="h-3 w-3" /> Edit</button>
                  <button onClick={() => toast.success(`${module.title} published to live site`)}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"><CheckCircle2 className="h-3 w-3" /> Publish</button>
                  <button onClick={() => toast.success(`Schedule dialog opened for ${module.title}`)}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 transition-all"><Clock className="h-3 w-3" /> Schedule</button>
                </div>
              )}
            </button>
          );
        })}
      </section>

      {/* Hero Slider + Create Section */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Hero Slider */}
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Hero Slider & Module Management</h2>
              <p className="mt-1 text-xs text-slate-500">Create, edit, publish, pin, feature, schedule, or hide each homepage section.</p>
            </div>
            <div className="flex items-center gap-2">
              <AdminBadge variant="success">{activeModules.length} active modules</AdminBadge>
              <button onClick={() => setShowNewSlideForm(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                New Slide
              </button>
            </div>
          </div>

          {showNewSlideForm && (
            <div className="mt-4 rounded-[10px] border border-blue-200 bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">New Slide</span>
                <button onClick={() => setShowNewSlideForm(false)} className="text-blue-400 hover:text-blue-600"><X className="h-4 w-4" /></button>
              </div>
              <input value={newSlideTitle} onChange={(e) => setNewSlideTitle(e.target.value)}
                className="w-full rounded-[8px] border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#003580]"
                placeholder="Slide title" />
              <textarea value={newSlideDetail} onChange={(e) => setNewSlideDetail(e.target.value)} rows={2}
                className="w-full rounded-[8px] border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none"
                placeholder="Slide description (optional)" />
              <div className="flex gap-2">
                <button onClick={createNewSlide} className="rounded-[8px] bg-[#003580] px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all">Create Slide</button>
                <button onClick={() => setShowNewSlideForm(false)} className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {allSlides.map((slide) => {
              const StatusIcon = statusIcons[slide.status];
              return (
                <div
                  key={slide.id}
                  onClick={() => openSlideEditor(slide)}
                  className={`flex flex-col gap-2 rounded-[10px] border p-4 transition-all cursor-pointer sm:flex-row sm:items-center sm:justify-between hover:shadow-md ${selectedSlide?.id === slide.id ? 'border-[#003580]/30 bg-[#003580]/5 ring-1 ring-[#003580]/10' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{slide.title}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusClasses[slide.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {slide.status}
                      </span>
                      {slide.pinned && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Pinned</span>}
                      {slide.featured && <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">Featured</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{slide.detail}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">Updated {slide.updated}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toast.success(`Previewing "${slide.title}"`)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-all" title="Preview"><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { setSelectedSlide(slide); setDetailPanelOpen(true); }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-all" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => cycleStatus(slide.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all" title="Cycle Status (Publish ↔ Draft ↔ Scheduled)">
                      <Send className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => togglePin(slide.id)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] border ${slide.pinned ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-slate-200 bg-white text-slate-500'} hover:bg-amber-50 transition-all`} title="Toggle Pin">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => duplicateItem(slide.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Duplicate">
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteItem(slide.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Section + Welcome Message */}
        <div className="space-y-4">
          <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#003580]" />
              <h2 className="text-sm font-semibold text-slate-900">Create Homepage Section</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">Add and manage the mega-menu homepage modules from one CMS form.</p>
            <div className="mt-4 space-y-3">
              <select value={createType} onChange={(e) => setCreateType(e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10">
                {contentModules.map((entry) => (
                  <option key={entry.title}>{entry.title}</option>
                ))}
              </select>
              <input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)}
                className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
                placeholder="Section title (optional)" />
              <textarea value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} rows={4}
                className="min-h-24 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 resize-none"
                placeholder="Summary, CTA text, media notes, SEO description..." />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => toast.success('Opening preview...')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button type="button" onClick={createSection}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm">
                  <Plus className="h-4 w-4" />
                  Create
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">Welcome Message</h2>
              </div>
              <button onClick={saveWelcome}
                className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${welcomeSaved ? 'bg-emerald-500 text-white' : 'bg-[#1D9E75] text-white hover:brightness-110'}`}>
                <Save className="h-3.5 w-3.5" />
                {welcomeSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
            <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)}
              className="mt-3 min-h-28 w-full rounded-[8px] border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 resize-none" />
          </div>

          <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Quick Links</h2>
            </div>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {quickLinks.map((link) => (
                <div key={link} onClick={() => toast.success(`Editing "${link}" link`)}
                  className="group flex items-center justify-between gap-2 rounded-[8px] border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm hover:border-[#003580]/20 hover:bg-[#003580]/5 transition-all cursor-pointer">
                  <span className="truncate text-slate-700 group-hover:text-[#003580]">{link}</span>
                  <Edit3 className="h-3.5 w-3.5 shrink-0 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))}
              <div onClick={() => toast.success('Add new quick link form opened')}
                className="group flex items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-400 hover:border-[#003580]/30 hover:text-[#003580] hover:bg-[#003580]/5 transition-all cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Add Link</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mega Menu Module Manager */}
      <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#E8A020]" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Mega Menu & Homepage Module Manager</h2>
              <p className="mt-0.5 text-xs text-slate-500">Create, edit, publish, pin, feature, schedule, or hide each homepage section.</p>
            </div>
          </div>
          <AdminBadge variant="success">{activeModules.length} active modules</AdminBadge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {managedEntries.map((entry) => {
            const Icon = entry.icon;
            return (
              <div key={entry.title} className="group rounded-[10px] border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-[#003580]/20 hover:shadow-sm hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580] shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">{entry.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{entry.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button onClick={() => toast.success(`Opening ${entry.title} manager`)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"><Edit3 className="h-3 w-3" /> Manage</button>
                  <button onClick={() => toast.success(`Add item dialog opened for ${entry.title}`)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#003580]/15 bg-[#003580]/5 px-2.5 py-1 text-[10px] font-semibold text-[#003580] hover:bg-[#003580]/10 transition-all"><Plus className="h-3 w-3" /> Add Item</button>
                  <button onClick={() => toast.success(`${entry.title} published to live site`)}
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-500/15 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"><Save className="h-3 w-3" /> Publish</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detail Slide-In Panel */}
      {detailPanelOpen && selectedSlide && (
        <aside className="slide-panel fixed right-0 top-16 z-20 h-[calc(100vh-4rem)] w-[380px] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-[-8px_0_32px_rgba(0,0,0,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">{selectedSlide.title}</h3>
            <button type="button" onClick={() => setDetailPanelOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-all"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${statusClasses[selectedSlide.status]}`}>
              {React.createElement(statusIcons[selectedSlide.status], { className: 'h-3 w-3' })}
              {selectedSlide.status}
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-600">{selectedSlide.detail}</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[10px] border border-slate-200 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Section ID</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{selectedSlide.id}</p>
            </div>
            <div className="rounded-[10px] border border-slate-200 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Last Updated</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{selectedSlide.updated}</p>
            </div>
            <div className="rounded-[10px] border border-slate-200 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Attributes</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedSlide.pinned && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">Pinned</span>}
                {selectedSlide.featured && <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">Featured</span>}
                {!selectedSlide.pinned && !selectedSlide.featured && <span className="text-xs text-slate-400">None set</span>}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <button onClick={() => { toast.success(`Editing "${selectedSlide.title}"`); setDetailPanelOpen(false); }}
              className="flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm"><Edit3 className="h-4 w-4" /> Edit Section</button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => toast.success(`Previewing "${selectedSlide.title}"`)}
                className="flex items-center justify-center gap-1.5 rounded-[8px] border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"><Eye className="h-3.5 w-3.5" /> Preview</button>
              <button onClick={() => { togglePin(selectedSlide.id); setSelectedSlide({ ...selectedSlide, pinned: !selectedSlide.pinned }); }}
                className={`flex items-center justify-center gap-1.5 rounded-[8px] border px-3 py-2 text-xs font-semibold transition-all ${selectedSlide.pinned ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <SlidersHorizontal className="h-3.5 w-3.5" /> {selectedSlide.pinned ? 'Unpin' : 'Pin'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { toggleFeature(selectedSlide.id); setSelectedSlide({ ...selectedSlide, featured: !selectedSlide.featured }); }}
                className={`flex items-center justify-center gap-1.5 rounded-[8px] border px-3 py-2 text-xs font-semibold transition-all ${selectedSlide.featured ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <Star className="h-3.5 w-3.5" /> {selectedSlide.featured ? 'Unfeature' : 'Feature'}
              </button>
              <button onClick={() => { changeStatus(selectedSlide.id, 'Scheduled'); setSelectedSlide({ ...selectedSlide, status: 'Scheduled', updated: 'Just now' }); }}
                className="flex items-center justify-center gap-1.5 rounded-[8px] border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-all">
                <Clock className="h-3.5 w-3.5" /> Schedule
              </button>
            </div>
            <button onClick={() => { window.open('/', '_blank'); toast.success('Opening live site preview...'); }}
              className="flex items-center justify-center gap-1.5 rounded-[8px] border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <ExternalLink className="h-3.5 w-3.5" /> View Live Site
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
