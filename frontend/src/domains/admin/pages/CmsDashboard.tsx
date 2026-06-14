import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileText,
  GalleryHorizontal,
  Globe,
  Layers3,
  MessageSquareText,
  Newspaper,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';

type PublishState = 'Published' | 'Draft' | 'Scheduled' | 'Needs Review';

type ContentItem = {
  id: string;
  title: string;
  type: 'page' | 'announcement' | 'gallery' | 'event' | 'post' | 'template';
  status: PublishState;
  updated: string;
  author: string;
  views?: number;
  scheduledFor?: string;
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
};

const recentContent: ContentItem[] = [
  { id: 'C-001', title: 'ASTU Alumni Network Hero', type: 'page', status: 'Published', updated: '2 hours ago', author: 'System Admin', views: 1240 },
  { id: 'C-002', title: 'Industry Partnership Week', type: 'page', status: 'Scheduled', updated: 'Jun 5, 2026', author: 'Content Manager', scheduledFor: 'Jun 12, 9:00 AM', priority: 'High' },
  { id: 'C-003', title: 'Tracer Survey Campaign Banner', type: 'page', status: 'Draft', updated: 'Yesterday', author: 'Content Manager', views: 0 },
  { id: 'C-004', title: 'Semester Break Announcement', type: 'announcement', status: 'Published', updated: '45 min ago', author: 'System Admin', views: 892, priority: 'Urgent' },
  { id: 'C-005', title: 'Campus Tour 2026 Album', type: 'gallery', status: 'Needs Review', updated: '3 days ago', author: 'Dept Head', views: 0, priority: 'Normal' },
  { id: 'C-006', title: 'Career Fair 2026 Event', type: 'event', status: 'Needs Review', updated: '2 hours ago', author: 'Event Coordinator', views: 0, priority: 'High' },
  { id: 'C-007', title: 'Alumni Spotlight: Mekdes Y.', type: 'post', status: 'Published', updated: 'Jun 2, 2026', author: 'Content Manager', views: 567 },
];

const moduleHealth = [
  { name: 'Hero Slider', status: 'Published' as PublishState, updated: '2 hours ago', icon: Eye, items: 3 },
  { name: 'Upcoming Workshops', status: 'Published' as PublishState, updated: 'Yesterday', icon: CalendarDays, items: 3 },
  { name: 'Video Gallery', status: 'Draft' as PublishState, updated: '3 days ago', icon: GalleryHorizontal, items: 7 },
  { name: 'Featured Alumni', status: 'Published' as PublishState, updated: '1 hour ago', icon: Users, items: 6 },
  { name: 'News & Announcements', status: 'Published' as PublishState, updated: '30 min ago', icon: Newspaper, items: 12 },
  { name: 'Partner Companies', status: 'Needs Review' as PublishState, updated: '5 days ago', icon: TrendingUp, items: 12 },
  { name: 'Featured Employers', status: 'Published' as PublishState, updated: '2 days ago', icon: TrendingUp, items: 4 },
  { name: 'Testimonials', status: 'Published' as PublishState, updated: '4 days ago', icon: MessageSquareText, items: 12 },
  { name: 'Career Opportunities', status: 'Published' as PublishState, updated: '1 day ago', icon: Globe, items: 24 },
  { name: 'FAQ Section', status: 'Draft' as PublishState, updated: '1 week ago', icon: FileText, items: 9 },
];

const upcomingSchedule = [
  { title: 'Industry Partnership Week', date: 'Jun 5, 2026', time: '09:00 AM', type: 'Page', color: '#003366' },
  { title: 'Workshop Registration CTA', date: 'Jun 8, 2026', time: '12:00 PM', type: 'Page', color: '#003366' },
  { title: 'Alumni Meetup Reminder', date: 'Jun 12, 2026', time: '10:00 AM', type: 'Announcement', color: '#F4B400' },
  { title: 'Employer Spotlight: Safaricom', date: 'Jun 15, 2026', time: '08:00 AM', type: 'Post', color: '#7C3AED' },
  { title: 'Tracer Survey Wave 3', date: 'Jun 20, 2026', time: '06:00 AM', type: 'Survey', color: '#16A34A' },
];

const reviewQueue = [
  { id: 'r-1', title: 'Campus Tour 2026 Photo Album', type: 'gallery', author: 'Public Relations', updated: '3 days ago', priority: 'Normal' as const },
  { id: 'r-2', title: 'Career Fair 2026 Event Page', type: 'event', author: 'Career Services', updated: '2 hours ago', priority: 'High' as const },
  { id: 'r-3', title: 'Outdated Department Policy', type: 'page', author: 'HR Office', updated: '1 week ago', priority: 'Low' as const },
  { id: 'r-4', title: 'New Homepage Hero Update', type: 'page', author: 'Marketing Lead', updated: '30 min ago', priority: 'Urgent' as const },
  { id: 'r-5', title: 'Alumni Spotlight: Solomon', type: 'post', author: 'Content Manager', updated: '1 day ago', priority: 'High' as const },
];

const trafficData = [
  { day: 'Mon', views: 1240, engagement: 56 },
  { day: 'Tue', views: 1480, engagement: 62 },
  { day: 'Wed', views: 1890, engagement: 71 },
  { day: 'Thu', views: 1620, engagement: 65 },
  { day: 'Fri', views: 2210, engagement: 78 },
  { day: 'Sat', views: 980, engagement: 42 },
  { day: 'Sun', views: 760, engagement: 38 },
];

const statusStyles: Record<PublishState, string> = {
  'Published': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Draft': 'bg-slate-100 text-slate-500 border-slate-200',
  'Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
  'Needs Review': 'bg-orange-50 text-orange-700 border-orange-200',
};

const typeColors: Record<ContentItem['type'], string> = {
  page: 'bg-blue-100 text-blue-700',
  announcement: 'bg-amber-100 text-amber-700',
  gallery: 'bg-purple-100 text-purple-700',
  event: 'bg-rose-100 text-rose-700',
  post: 'bg-teal-100 text-teal-700',
  template: 'bg-slate-100 text-slate-700',
};

const priorityStyles: Record<NonNullable<ContentItem['priority']>, string> = {
  Low: 'bg-slate-100 text-slate-500',
  Normal: 'bg-blue-50 text-blue-600',
  High: 'bg-amber-50 text-amber-600',
  Urgent: 'bg-rose-50 text-rose-600',
};

function formatDate() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
}

export default function CmsDashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'all' | PublishState>('all');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const today = formatDate();

  const stats = useMemo(() => {
    const published = recentContent.filter((i) => i.status === 'Published').length;
    const draft = recentContent.filter((i) => i.status === 'Draft').length;
    const scheduled = recentContent.filter((i) => i.status === 'Scheduled').length;
    const needsReview = recentContent.filter((i) => i.status === 'Needs Review').length;
    const totalViews = recentContent.reduce((sum, i) => sum + (i.views || 0), 0);
    return { published, draft, scheduled, needsReview, totalViews, total: recentContent.length };
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedTab === 'all') return recentContent;
    return recentContent.filter((item) => item.status === selectedTab);
  }, [selectedTab]);

  const tabs: { key: 'all' | PublishState; label: string; count: number }[] = [
    { key: 'all', label: 'All Content', count: stats.total },
    { key: 'Published', label: 'Published', count: stats.published },
    { key: 'Draft', label: 'Drafts', count: stats.draft },
    { key: 'Scheduled', label: 'Scheduled', count: stats.scheduled },
    { key: 'Needs Review', label: 'Review', count: stats.needsReview },
  ];

  const quickActions = [
    { label: 'New Content', icon: Plus, path: '/cms/content', accent: '#003366' },
    { label: 'Edit Homepage', icon: Eye, path: '/cms/homepage', accent: '#16A34A' },
    { label: 'Upload Media', icon: GalleryHorizontal, path: '/cms/media', accent: '#F4B400' },
    { label: 'Create Event', icon: CalendarDays, path: '/cms/events', accent: '#7C3AED' },
    { label: 'SEO Audit', icon: Globe, path: '/cms/seo', accent: '#003366' },
    { label: 'Templates', icon: Sparkles, path: '/cms/templates', accent: '#16A34A' },
    { label: 'Review Queue', icon: ShieldCheck, path: '/cms/approvals', accent: '#EF4444' },
    { label: 'Community', icon: MessageSquareText, path: '/cms/community', accent: '#7C3AED' },
  ];

  const maxViews = Math.max(...trafficData.map((d) => d.views));

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes card-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .card-anim { animation: card-in 0.4s ease-out both; }
        .card-anim:nth-child(2) { animation-delay: 0.04s; }
        .card-anim:nth-child(3) { animation-delay: 0.08s; }
        .card-anim:nth-child(4) { animation-delay: 0.12s; }
        .card-anim:nth-child(5) { animation-delay: 0.16s; }
        .card-anim:nth-child(6) { animation-delay: 0.2s; }
        .card-anim:nth-child(7) { animation-delay: 0.24s; }
        .card-anim:nth-child(8) { animation-delay: 0.28s; }
      `}</style>

      {/* Greeting Banner */}
      <section className="card-anim">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#003366] via-[#002a55] to-[#003366]/90 p-8 shadow-sm">
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[#F4B400]/8 blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-3xl translate-y-1/3 -translate-x-1/4" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Content Briefing
                </span>
                <span className="text-[11px] text-white/40">v1.0</span>
              </div>
              <h2 className="text-[32px] font-bold tracking-tight text-white md:text-[40px]">
                {greeting}, Content Manager
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span>{today}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>ASTU Content Management System</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => navigate('/cms/content')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F4B400] px-5 py-3 text-sm font-bold text-[#0B1A2E] shadow-sm hover:brightness-110 transition-all">
                <Plus className="h-5 w-5" /> Create Content
              </button>
              <button onClick={() => window.open('/', '_blank')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15 transition-all">
                <Eye className="h-5 w-5" /> View Site
              </button>
            </div>
          </div>
          <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-white/10 pt-6">
            {[
              { icon: Globe, label: 'Published', value: stats.published, color: 'text-emerald-400' },
              { icon: FileText, label: 'Drafts', value: stats.draft, color: 'text-slate-300' },
              { icon: Clock, label: 'Scheduled', value: stats.scheduled, color: 'text-blue-400' },
              { icon: AlertTriangle, label: 'Review', value: stats.needsReview, color: 'text-amber-400' },
              { icon: TrendingUp, label: 'Total Views', value: stats.totalViews.toLocaleString(), color: 'text-[#F4B400]' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm">
                <Icon className={`h-6 w-6 ${color}`} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{label}</p>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Content', value: stats.total, icon: Layers3, trend: '+3 this week', color: '#003366' },
          { label: 'Live Pages', value: stats.published, icon: Globe, trend: '8 published today', color: '#16A34A' },
          { label: 'In Pipeline', value: stats.draft + stats.scheduled, icon: Clock, trend: '5 due this week', color: '#F4B400' },
          { label: 'Awaiting Review', value: stats.needsReview, icon: AlertTriangle, trend: '2 urgent', color: '#EF4444' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card-anim rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${card.color}12`, color: card.color }}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: `${card.color}25`, color: card.color, backgroundColor: `${card.color}10` }}>
                  {card.trend}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                <p className="mt-1 text-[32px] font-bold tracking-tight text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section className="card-anim rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#F4B400]" />
            <span className="text-base font-semibold text-slate-900">Quick Actions</span>
          </div>
          <span className="text-xs text-slate-400">Navigate to any module</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} type="button" onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-4 text-center transition-all hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${action.accent}12`, color: action.accent }}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">{action.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Content Pipeline + Schedule */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Content Pipeline */}
        <div className="card-anim xl:col-span-2 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Content Pipeline</h3>
              <p className="mt-1 text-sm text-slate-500">Recent pages, posts, and announcements.</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {tabs.map((tab) => (
                <button key={tab.key} type="button" onClick={() => setSelectedTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedTab === tab.key ? 'bg-[#003366] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {tab.label}
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    selectedTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="group flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-5 transition-all hover:border-slate-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.priority && (
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[item.priority]}`}>
                        {item.priority}
                      </span>
                    )}
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeColors[item.type]}`}>
                      {item.type}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 truncate">{item.title}</h4>
                    {item.views !== undefined && item.views > 0 && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />{item.views.toLocaleString()}
                      </span>
                    )}
                    {item.scheduledFor && (
                      <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />{item.scheduledFor}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{item.author}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{item.updated}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      item.status === 'Published' ? 'bg-emerald-500' :
                      item.status === 'Draft' ? 'bg-slate-400' :
                      item.status === 'Scheduled' ? 'bg-blue-500' : 'bg-orange-500'
                    }`} />
                    {item.status}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => toast.success(`Previewing "${item.title}"`)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all" title="Preview">
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                    <button onClick={() => toast.success(`Editing "${item.title}"`)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Edit">
                      <Edit3 className="h-4.5 w-4.5" />
                    </button>
                    <button onClick={() => toast.success(`"${item.title}" published`)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all" title="Publish">
                      <Send className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between pt-5 border-t border-slate-100">
            <span className="text-xs text-slate-400">Showing {filteredItems.length} of {stats.total} items</span>
            <button onClick={() => navigate('/cms/content')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#003366] hover:text-[#002a55] transition-colors">
              View all content <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="card-anim rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Schedule</h3>
              <p className="mt-1 text-sm text-slate-500">Content queued for publishing.</p>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{upcomingSchedule.length}</span>
          </div>
          <div className="mt-6 space-y-3">
            {upcomingSchedule.map((item, idx) => (
              <div key={idx} className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-slate-200 hover:shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}10`, color: item.color }}>
                  <CalendarDays className="h-5.5 w-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.color }}>{item.type}</span>
                  <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.date} · {item.time}</p>
                </div>
                <button onClick={() => toast.success('Reschedule dialog opened')}
                  className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600 transition-all" title="Reschedule">
                  <Clock className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button onClick={() => navigate('/cms/events')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#003366] hover:text-[#002a55] transition-colors">
              View full calendar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Traffic + Review Queue */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Traffic Chart */}
        <div className="card-anim xl:col-span-2 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Content Performance</h3>
              <p className="mt-1 text-sm text-slate-500">Views and engagement this week.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1">
                <TrendingUp className="h-4 w-4" /> +18%
              </span>
              <span className="text-sm text-slate-500 font-medium">{trafficData.reduce((s, d) => s + d.views, 0).toLocaleString()} views</span>
            </div>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2 sm:gap-4">
            {trafficData.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end gap-1">
                  <div className="flex-1 rounded-md bg-gradient-to-t from-[#003366] to-[#0055A5] transition-all hover:opacity-80"
                    style={{ height: `${(d.views / maxViews) * 100}%` }} title={`${d.views} views`} />
                  <div className="w-2 rounded-md bg-gradient-to-t from-[#F4B400] to-[#FFD580]"
                    style={{ height: `${(d.engagement / 100) * 100}%` }} title={`${d.engagement}% engagement`} />
                </div>
                <span className="text-xs font-semibold text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#003366]" /> Page views</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#F4B400]" /> Engagement %</span>
          </div>
        </div>

        {/* Review Queue */}
        <div className="card-anim rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Review Queue</h3>
              <p className="mt-1 text-sm text-slate-500">Items awaiting moderation.</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">{reviewQueue.length} pending</span>
          </div>
          <div className="mt-6 space-y-3">
            {reviewQueue.slice(0, 4).map((item) => (
              <div key={item.id} className="group rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-slate-200 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[item.priority]}`}>{item.priority}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.author} · {item.updated}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => toast.success('Approved')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-all shadow-sm">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button onClick={() => toast('Changes requested', { icon: '✍️' })}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-all shadow-sm">
                    <Edit3 className="h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => toast.error('Rejected')}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all" title="Reject">
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button onClick={() => navigate('/cms/approvals')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#003366] hover:text-[#002a55] transition-colors">
              Open workflow <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Homepage Module Health */}
      <section className="card-anim rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Homepage Module Health</h3>
            <p className="mt-1 text-sm text-slate-500">Real-time status of every public homepage section.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {moduleHealth.filter(m => m.status === 'Published').length} Published
            </span>
            <button onClick={() => navigate('/cms/homepage')} className="text-sm font-semibold text-[#003366] hover:text-[#002a55] transition-colors">Manage</button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {moduleHealth.map((mod) => {
            const Icon = mod.icon;
            const statusColor = mod.status === 'Published' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : mod.status === 'Draft' ? 'text-slate-500 bg-slate-100 border-slate-200' : mod.status === 'Scheduled' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-orange-600 bg-orange-50 border-orange-200';
            return (
              <div key={mod.name} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3.5 transition-all hover:border-slate-200 hover:shadow-sm cursor-pointer"
                onClick={() => navigate('/cms/homepage')}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                  <Icon className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-700 truncate">{mod.name}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">({mod.items})</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{mod.updated}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold shrink-0 ${statusColor}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${mod.status === 'Published' ? 'bg-emerald-500' : mod.status === 'Draft' ? 'bg-slate-400' : mod.status === 'Scheduled' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                  {mod.status}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
