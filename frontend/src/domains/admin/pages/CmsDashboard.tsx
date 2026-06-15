import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCmsDashboard } from "../hooks/useCmsContent";
import { CmsSkeleton, CmsError } from "../components/CmsLoadingState";
import type { ContentItem } from "../services/cmsService";
import { AlertTriangle, Activity, ArrowUpRight, BarChart3, Calendar, CalendarDays, CheckCircle2, ChevronRight, Clock, Edit3, Eye, FileText, GalleryHorizontal, Globe, Layers3, MessageSquareText, Newspaper, Plus, RefreshCw, Send, ShieldCheck, Settings, Sparkles, Star, TrendingUp, Users, ArrowRight, Database } from "lucide-react";
import toast from "react-hot-toast";
import AdminBadge from "../components/AdminBadge";
import { adminApi } from "../api/adminApi";

type PublishState = "Published" | "Draft" | "Scheduled" | "Needs Review";

const moduleHealth = [
  {
    name: "Hero Slider",
    status: "Published" as PublishState,
    updated: "2 hours ago",
    icon: Eye,
    items: 3,
  },
  {
    name: "Upcoming Workshops",
    status: "Published" as PublishState,
    updated: "Yesterday",
    icon: CalendarDays,
    items: 3,
  },
  {
    name: "Video Gallery",
    status: "Draft" as PublishState,
    updated: "3 days ago",
    icon: GalleryHorizontal,
    items: 7,
  },
  {
    name: "Featured Alumni",
    status: "Published" as PublishState,
    updated: "1 hour ago",
    icon: Users,
    items: 6,
  },
  {
    name: "News & Announcements",
    status: "Published" as PublishState,
    updated: "30 min ago",
    icon: Newspaper,
    items: 12,
  },
  {
    name: "Partner Companies",
    status: "Needs Review" as PublishState,
    updated: "5 days ago",
    icon: TrendingUp,
    items: 12,
  },
  {
    name: "Featured Employers",
    status: "Published" as PublishState,
    updated: "2 days ago",
    icon: TrendingUp,
    items: 4,
  },
  {
    name: "Testimonials",
    status: "Published" as PublishState,
    updated: "4 days ago",
    icon: MessageSquareText,
    items: 12,
  },
  {
    name: "Career Opportunities",
    status: "Published" as PublishState,
    updated: "1 day ago",
    icon: Globe,
    items: 24,
  },
  {
    name: "FAQ Section",
    status: "Draft" as PublishState,
    updated: "1 week ago",
    icon: FileText,
    items: 9,
  },
];

const upcomingSchedule = [
  {
    title: "Industry Partnership Week",
    date: "Jun 5, 2026",
    time: "09:00 AM",
    type: "Page",
    color: "#003366",
  },
  {
    title: "Workshop Registration CTA",
    date: "Jun 8, 2026",
    time: "12:00 PM",
    type: "Page",
    color: "#003366",
  },
  {
    title: "Alumni Meetup Reminder",
    date: "Jun 12, 2026",
    time: "10:00 AM",
    type: "Announcement",
    color: "#F4B400",
  },
  {
    title: "Employer Spotlight: Safaricom",
    date: "Jun 15, 2026",
    time: "08:00 AM",
    type: "Post",
    color: "#7C3AED",
  },
  {
    title: "Tracer Survey Wave 3",
    date: "Jun 20, 2026",
    time: "06:00 AM",
    type: "Survey",
    color: "#16A34A",
  },
];

const reviewQueue = [
  {
    id: "r-1",
    title: "Campus Tour 2026 Photo Album",
    type: "gallery",
    author: "Public Relations",
    updated: "3 days ago",
    priority: "Normal" as const,
  },
  {
    id: "r-2",
    title: "Career Fair 2026 Event Page",
    type: "event",
    author: "Career Services",
    updated: "2 hours ago",
    priority: "High" as const,
  },
  {
    id: "r-3",
    title: "Outdated Department Policy",
    type: "page",
    author: "HR Office",
    updated: "1 week ago",
    priority: "Low" as const,
  },
  {
    id: "r-4",
    title: "New Homepage Hero Update",
    type: "page",
    author: "Marketing Lead",
    updated: "30 min ago",
    priority: "Urgent" as const,
  },
  {
    id: "r-5",
    title: "Alumni Spotlight: Solomon",
    type: "post",
    author: "Content Manager",
    updated: "1 day ago",
    priority: "High" as const,
  },
];

const trafficData = [
  { day: "Mon", views: 1240, engagement: 56 },
  { day: "Tue", views: 1480, engagement: 62 },
  { day: "Wed", views: 1890, engagement: 71 },
  { day: "Thu", views: 1620, engagement: 65 },
  { day: "Fri", views: 2210, engagement: 78 },
  { day: "Sat", views: 980, engagement: 42 },
  { day: "Sun", views: 760, engagement: 38 },
];

const statusStyles: Record<PublishState, string> = {
  Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-slate-100 text-slate-500 border-slate-200",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  "Needs Review": "bg-orange-50 text-orange-700 border-orange-200",
};

const typeColors: Record<ContentItem["type"], string> = {
  page: "bg-blue-100 text-blue-700",
  announcement: "bg-amber-100 text-amber-700",
  gallery: "bg-purple-100 text-purple-700",
  event: "bg-rose-100 text-rose-700",
  post: "bg-teal-100 text-teal-700",
  template: "bg-slate-100 text-slate-700",
};

const priorityStyles: Record<NonNullable<ContentItem["priority"]>, string> = {
  Low: "bg-slate-100 text-slate-500",
  Normal: "bg-blue-50 text-blue-600",
  High: "bg-amber-50 text-amber-600",
  Urgent: "bg-rose-50 text-rose-600",
};

function formatDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}
function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#1a1d27]/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function CmsDashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"all" | PublishState>("all");

  // Integration-ready: all data now flows through useCmsDashboard
  // To connect to backend, update fetchCmsDashboardStats() in cmsService.ts
  const { stats: hookStats, recentContent, isLoading, error, refetch } = useCmsDashboard();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const today = formatDate();

  const stats = hookStats ?? { published: 0, draft: 0, scheduled: 0, needsReview: 0, totalViews: 0, total: 0 };

  const filteredItems = useMemo(() => {
    if (selectedTab === "all") return recentContent;
    return recentContent.filter((item) => item.status === (selectedTab as string));
  }, [selectedTab, recentContent]);

  const tabs: { key: "all" | PublishState; label: string; count: number }[] = [
    { key: "all", label: "All Content", count: stats.total },
    { key: "Published", label: "Published", count: stats.published },
    { key: "Draft", label: "Drafts", count: stats.draft },
    { key: "Scheduled", label: "Scheduled", count: stats.scheduled },
    { key: "Needs Review", label: "Review", count: stats.needsReview },
  ];

  const quickActions = [
    {
      label: "New Content",
      icon: Plus,
      path: "/cms/content",
      accent: "#003366",
    },
    {
      label: "Edit Homepage",
      icon: Eye,
      path: "/cms/homepage",
      accent: "#16A34A",
    },
    {
      label: "Upload Media",
      icon: GalleryHorizontal,
      path: "/cms/media",
      accent: "#F4B400",
    },
    {
      label: "Create Event",
      icon: CalendarDays,
      path: "/cms/events",
      accent: "#7C3AED",
    },
    { label: "SEO Audit", icon: Globe, path: "/cms/seo", accent: "#003366" },
    {
      label: "Templates",
      icon: Sparkles,
      path: "/cms/templates",
      accent: "#16A34A",
    },
    {
      label: "Review Queue",
      icon: ShieldCheck,
      path: "/cms/approvals",
      accent: "#EF4444",
    },
    {
      label: "Community",
      icon: MessageSquareText,
      path: "/cms/community",
      accent: "#7C3AED",
    },
  ];

  const maxViews = Math.max(...trafficData.map((d) => d.views));

  if (isLoading) return <CmsSkeleton rows={6} />;
  if (error) return <CmsError message={error} onRetry={refetch} />;

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
        <div
          className="relative overflow-hidden rounded-2xl p-8"
          style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 12px 48px rgba(0,53,128,0.40)' }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.12), transparent)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 45%)' }} />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.18)' }} />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(232,160,32,0.10)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Content Briefing
                </span>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
                style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
              >
                {greeting}, Manager
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                <span>{today}</span>
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.35)' }} />
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> Live Engine
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/cms/content")}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
                style={{ background: '#E8A020', color: '#003580', boxShadow: '0 4px 20px rgba(232,160,32,0.35)' }}
              >
                <Plus className="h-5 w-5" /> Create Content
              </button>
              <button
                onClick={() => window.open("/", "_blank")}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
                style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}
              >
                <Eye className="h-5 w-5" /> View Site
              </button>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {[
              { icon: Globe, label: 'Published', value: stats.published, iconColor: '#34d399' },
              { icon: FileText, label: 'Drafts', value: stats.draft, iconColor: '#94a3b8' },
              { icon: Clock, label: 'Scheduled', value: stats.scheduled, iconColor: '#60a5fa' },
              { icon: AlertTriangle, label: 'Review', value: stats.needsReview, iconColor: '#fbbf24' },
              { icon: TrendingUp, label: 'Total Views', value: stats.totalViews.toLocaleString(), iconColor: '#F4B400' },
            ].map(({ icon: Icon, label, value, iconColor }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
              >
                <Icon className="h-6 w-6 shrink-0" style={{ color: iconColor }} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {label}
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#ffffff' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Content"
          value={stats.total}
          icon={Layers3}
          color="#003580"
          trend="+3 this week"
        />
        <StatCard
          label="Live Pages"
          value={stats.published}
          icon={Globe}
          color="#1D9E75"
          trend="8 published today"
        />
        <StatCard
          label="In Pipeline"
          value={stats.draft + stats.scheduled}
          icon={Clock}
          color="#E8A020"
          trend="5 due this week"
        />
        <StatCard
          label="Awaiting Review"
          value={stats.needsReview}
          icon={AlertTriangle}
          color="#E24B4A"
          trend="2 urgent"
        />
      </section>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#1a1d27]/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#E8A020]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              CMS Quick Actions
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-4 text-center transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg dark:hover:shadow-none hover:scale-105"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-all group-hover:shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${action.accent}15 0%, ${action.accent}25 100%)`,
                    color: action.accent,
                  }}
                >
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight group-hover:text-slate-900 dark:group-hover:text-slate-200">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="Content Pipeline"
            subtitle="Manage recent pages, posts, and internal announcements."
            action={
              <div className="flex items-center gap-1.5 flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedTab(tab.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase transition-all ${
                      selectedTab === tab.key
                        ? "bg-[#003580] text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                        selectedTab === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-450 dark:text-slate-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            }
          >
            <div className="space-y-3 mt-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 transition-all hover:border-[#003580]/20 dark:hover:border-blue-500/20 hover:shadow-md dark:hover:shadow-none sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.priority && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[item.priority]}`}
                        >
                          {item.priority}
                        </span>
                      )}
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeColors[item.type]}`}
                      >
                        {item.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </h4>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-505">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5" /> {item.author}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>{item.updatedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[item.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.status === "Published"
                            ? "bg-emerald-500"
                            : item.status === "Draft"
                              ? "bg-slate-400"
                              : item.status === "Scheduled"
                                ? "bg-blue-500"
                                : "bg-orange-500"
                        }`}
                      />
                      {item.status}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-[#003580]/5 dark:hover:bg-blue-500/10 hover:text-[#003580] dark:hover:text-blue-400 text-slate-500 dark:text-slate-400 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Upcoming Schedule"
          subtitle="Queue for automated publishing."
        >
          <div className="space-y-4 mt-4">
            {upcomingSchedule.map((item, idx) => (
              <div
                key={idx}
                className="group flex items-start gap-4 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 p-4 transition-all hover:border-[#003580]/10 dark:hover:border-blue-500/10 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md dark:hover:shadow-none"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{
                    backgroundColor: `${item.color}10`,
                    color: item.color,
                  }}
                >
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: item.color }}
                  >
                    {item.type}
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {item.date} · {item.time}
                  </p>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate("/cms/content")}
              className="w-full mt-2 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-[#003580]/30 dark:hover:border-blue-500/30 hover:text-[#003580] dark:hover:text-blue-400 transition-all"
            >
              Manage Content Calendar
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1d27]/90 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-none transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,51,128,0.12)] dark:hover:border-slate-700/80 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight"
          style={{
            borderColor: `${color}25`,
            color: color,
            backgroundColor: `${color}08`,
          }}
        >
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}
