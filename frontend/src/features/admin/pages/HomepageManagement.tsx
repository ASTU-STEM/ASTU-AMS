import React, { useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  Eye,
  Footprints,
  GraduationCap,
  HelpCircle,
  ImagePlus,
  Link2,
  MessageSquareQuote,
  Newspaper,
  PlayCircle,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Trophy,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';

type PublishState = 'Published' | 'Draft' | 'Scheduled';

type HomepageItem = {
  id: string;
  title: string;
  detail: string;
  status: PublishState;
  updated: string;
};

const heroSlides: HomepageItem[] = [
  { id: 'HERO-01', title: 'ASTU Alumni Network', detail: 'Main hero with graduate community call-to-action', status: 'Published', updated: 'Today' },
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
  { title: 'Hero Slider Management', icon: ImagePlus, count: '3 slides', tone: 'text-[#003580]', bg: 'bg-[#003580]/10' },
  { title: 'Homepage Banner Management', icon: Sparkles, count: '2 banners', tone: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10' },
  { title: 'News & Announcements', icon: Newspaper, count: '18 posts', tone: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10' },
  { title: 'Featured Alumni', icon: GraduationCap, count: '6 profiles', tone: 'text-violet-600', bg: 'bg-violet-500/10' },
  { title: 'Featured Employer', icon: BriefcaseBusiness, count: '4 companies', tone: 'text-[#E24B4A]', bg: 'bg-[#E24B4A]/10' },
  { title: 'Statistics Counter', icon: BarChart3, count: '8 metrics', tone: 'text-cyan-700', bg: 'bg-cyan-500/10' },
  { title: 'Success Stories', icon: Star, count: '9 stories', tone: 'text-amber-700', bg: 'bg-amber-500/10' },
  { title: 'Testimonials', icon: MessageSquareQuote, count: '12 quotes', tone: 'text-emerald-700', bg: 'bg-emerald-500/10' },
  { title: 'Upcoming Workshops', icon: CalendarDays, count: '3 workshops', tone: 'text-rose-700', bg: 'bg-rose-500/10' },
  { title: 'Video Gallery', icon: PlayCircle, count: '7 videos', tone: 'text-sky-700', bg: 'bg-sky-500/10' },
  { title: 'Research & Innovation', icon: Trophy, count: '5 highlights', tone: 'text-orange-700', bg: 'bg-orange-500/10' },
  { title: 'Partner Companies', icon: BriefcaseBusiness, count: '12 partners', tone: 'text-teal-700', bg: 'bg-teal-500/10' },
  { title: 'Career Opportunities', icon: BriefcaseBusiness, count: '24 openings', tone: 'text-fuchsia-700', bg: 'bg-fuchsia-500/10' },
  { title: 'FAQ Section', icon: HelpCircle, count: '9 FAQs', tone: 'text-lime-700', bg: 'bg-lime-500/10' },
  { title: 'Footer Content', icon: Footprints, count: '5 sections', tone: 'text-slate-700', bg: 'bg-slate-500/10' },
  { title: 'Quick Links', icon: Link2, count: '6 links', tone: 'text-indigo-700', bg: 'bg-indigo-500/10' },
];

const managedEntries = [
  { title: 'Upcoming Workshops', description: 'Create workshop cards with registration, RSVP, QR attendance, certificates, and feedback forms.' },
  { title: 'Video Gallery', description: 'Upload livestream links, graduation videos, workshop recordings, and featured thumbnails.' },
  { title: 'Featured Alumni', description: 'Approve alumni profiles, success stories, awards, startups, publications, and volunteer highlights.' },
  { title: 'Featured Employers', description: 'Promote verified employers, internships, job fairs, campus recruitment events, and partner badges.' },
  { title: 'Research & Innovation', description: 'Publish research outputs, innovation achievements, industry projects, and university rankings.' },
  { title: 'Partner Companies', description: 'Manage sponsors, partnership tiers, logos, websites, and accreditation evidence links.' },
  { title: 'Testimonials', description: 'Curate quotes from alumni, employers, departments, and accreditation stakeholders.' },
  { title: 'Career Opportunities', description: 'Feature jobs, internships, candidate matching campaigns, and career call-to-actions.' },
  { title: 'FAQ Section', description: 'Create categorized FAQ entries for alumni, employers, registrar services, events, and tracer surveys.' },
];

const statusClasses: Record<PublishState, string> = {
  Published: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  Draft: 'border-slate-200 bg-slate-100 text-slate-600',
  Scheduled: 'border-[#003580]/20 bg-[#003580]/10 text-[#003580]',
};

export default function HomepageManagement() {
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Welcome to the ASTU Alumni Management System, a digital bridge between graduates, employers, departments, and university services.'
  );
  const [selectedModule, setSelectedModule] = useState(contentModules[0].title);
  const [createTitle, setCreateTitle] = useState('New homepage section');
  const [createType, setCreateType] = useState(managedEntries[0].title);
  const [draftItems, setDraftItems] = useState<HomepageItem[]>([
    { id: 'SEC-01', title: 'Featured Employers Refresh', detail: 'Promote verified partner companies on the public homepage', status: 'Draft', updated: 'Today' },
    { id: 'SEC-02', title: 'Workshop Registration CTA', detail: 'Add QR attendance and certificate language to the workshop section', status: 'Scheduled', updated: 'Jun 8, 2026' },
  ]);

  const createSection = () => {
    const nextItem: HomepageItem = {
      id: `SEC-${String(draftItems.length + 3).padStart(2, '0')}`,
      title: createTitle || createType,
      detail: `${createType} content block ready for editing, preview, scheduling, and publishing.`,
      status: 'Draft',
      updated: 'Just now',
    };
    setDraftItems((current) => [nextItem, ...current]);
    setCreateTitle('');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Homepage Management"
        subtitle="Control every public homepage section: hero slides, banners, featured content, quick links, statistics, stories, testimonials, and footer blocks."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Homepage' }]}
        actions={<AdminBadge variant="info">Public Site CMS</AdminBadge>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {contentModules.map((module) => {
          const Icon = module.icon;
          const active = selectedModule === module.title;
          return (
            <button
              key={module.title}
              type="button"
              onClick={() => setSelectedModule(module.title)}
              className={`rounded-[10px] border p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/30 ${active ? 'border-[#003580] bg-[#003580]/5' : 'border-slate-200 bg-white'}`}
            >
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] ${module.bg} ${module.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{module.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{module.count}</p>
            </button>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#003580]" />
            <h2 className="text-sm font-semibold text-slate-900">Create Homepage Section</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">Add and manage the mega-menu homepage modules from one CMS form.</p>
          <div className="mt-4 space-y-3">
            <select value={createType} onChange={(event) => setCreateType(event.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]">
              {managedEntries.map((entry) => (
                <option key={entry.title}>{entry.title}</option>
              ))}
            </select>
            <input value={createTitle} onChange={(event) => setCreateTitle(event.target.value)} className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="Section title" />
            <textarea className="min-h-28 w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" placeholder="Summary, CTA text, media notes, SEO description" />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button type="button" onClick={createSection} className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-3 py-2 text-sm font-semibold text-white">
                <Plus className="h-4 w-4" />
                Create
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Mega Menu & Homepage Module Manager</h2>
              <p className="mt-1 text-xs text-slate-500">Create, edit, publish, pin, feature, schedule, or hide each homepage section.</p>
            </div>
            <AdminBadge variant="success">{managedEntries.length} active modules</AdminBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {managedEntries.map((entry) => (
              <div key={entry.title} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{entry.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{entry.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-1 rounded-[8px] border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600"><Edit3 className="h-3.5 w-3.5" /> Manage</button>
                  <button className="inline-flex items-center gap-1 rounded-[8px] border border-[#003580]/15 bg-[#003580]/5 px-2.5 py-1.5 text-xs font-semibold text-[#003580]"><Plus className="h-3.5 w-3.5" /> Add Item</button>
                  <button className="inline-flex items-center gap-1 rounded-[8px] border border-[#1D9E75]/15 bg-[#1D9E75]/5 px-2.5 py-1.5 text-xs font-semibold text-[#1D9E75]"><Save className="h-3.5 w-3.5" /> Publish</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Hero Slider Management</h2>
              <p className="mt-1 text-xs text-slate-500">Create, edit, schedule, preview, and delete homepage slides.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white">
              <Plus className="h-4 w-4" />
              New Slide
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {[...draftItems, ...heroSlides].map((slide) => (
              <div key={slide.id} className="flex flex-col gap-3 rounded-[10px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{slide.title}</h3>
                    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusClasses[slide.status]}`}>{slide.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{slide.detail}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">Updated {slide.updated}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600" aria-label="Preview slide">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600" aria-label="Edit slide">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-rose-100 bg-rose-50 text-rose-600" aria-label="Delete slide">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Welcome Message Editor</h2>
                <p className="mt-1 text-xs text-slate-500">Update the primary public welcome copy.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-[8px] bg-[#1D9E75] px-3 py-2 text-xs font-semibold text-white">
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
            <textarea
              value={welcomeMessage}
              onChange={(event) => setWelcomeMessage(event.target.value)}
              className="mt-4 min-h-36 w-full rounded-[8px] border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
            />
          </div>

          <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-slate-900">Quick Links Management</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {quickLinks.map((link) => (
                <div key={link} className="flex items-center justify-between gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <span className="truncate text-slate-700">{link}</span>
                  <Edit3 className="h-4 w-4 shrink-0 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
