import React, { useCallback, useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Archive,
  Calendar,
  ChevronDown,
  Copy,
  Download,
  Eye,
  Filter,
  Grid3x3,
  LayoutList,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
  Clock,
  Layers,
  Globe,
  AlertCircle,
  FileText,
  User,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminBadge from "../components/AdminBadge";
import ContentCard, {
  ContentCardItem,
  ContentStatus,
  ContentType,
} from "../components/ContentCard";
import ScheduleDialog, { ScheduleValue } from "../components/ScheduleDialog";
import AdminModal from "../components/AdminModal";
import { useCmsContent } from "../hooks/useCmsContent";
import { CmsSkeleton, CmsError, CmsEmpty } from "../components/CmsLoadingState";

const initialItems: ContentCardItem[] = [
  {
    id: "C-001",
    title: "ASTU Alumni Network: Bridging Generations",
    type: "post",
    status: "Published",
    excerpt:
      "How our alumni network connects 25,000+ graduates with opportunities, mentorship, and lifelong learning resources.",
    author: "Content Manager",
    updatedAt: "2 hours ago",
    publishedAt: "May 28, 2026",
    views: 1240,
    tags: ["alumni", "community", "networking"],
    pinned: true,
    featured: true,
    language: "EN",
    seoScore: 94,
    wordCount: 840,
    readTime: "4 min read",
  },
  {
    id: "C-002",
    title: "Industry Partnership Week 2026",
    type: "page",
    status: "Scheduled",
    excerpt:
      "Five-day summit connecting ASTU students with leading employers across Ethiopia and East Africa.",
    author: "Content Manager",
    updatedAt: "Jun 5, 2026",
    scheduledFor: "Jun 12, 9:00 AM",
    views: 0,
    tags: ["partnership", "employers", "career"],
    pinned: false,
    featured: true,
    language: "EN",
    seoScore: 88,
    wordCount: 1250,
    readTime: "6 min read",
  },
  {
    id: "C-003",
    title: "Tracer Survey Campaign Banner",
    type: "page",
    status: "Draft",
    excerpt:
      "Encourages 2024 alumni batch to complete the annual tracer study for institutional improvement.",
    author: "Content Manager",
    updatedAt: "Yesterday",
    views: 0,
    tags: ["tracer", "survey", "alumni"],
    pinned: false,
    featured: false,
    language: "EN",
    seoScore: 72,
    wordCount: 320,
    readTime: "2 min read",
  },
  {
    id: "C-004",
    title: "Semester Break: Campus Safety Notice",
    type: "announcement",
    status: "Published",
    excerpt:
      "Important safety reminders for students, faculty, and visitors during the upcoming semester break.",
    author: "System Admin",
    updatedAt: "45 min ago",
    publishedAt: "Jun 7, 2026",
    views: 892,
    tags: ["safety", "campus", "announcement"],
    pinned: true,
    featured: false,
    language: "EN",
    seoScore: 91,
    wordCount: 510,
    readTime: "3 min read",
  },
  {
    id: "C-005",
    title: "Campus Tour 2026 Photo Album",
    type: "gallery",
    status: "Needs Review",
    excerpt:
      "Stunning aerial and ground-level photos from the 2026 campus tour. Awaiting final approval before publishing.",
    author: "Dept Head",
    updatedAt: "3 days ago",
    views: 0,
    tags: ["campus", "tour", "photos"],
    pinned: false,
    featured: false,
    language: "EN",
    seoScore: 82,
    wordCount: 150,
    readTime: "1 min read",
  },
  {
    id: "C-006",
    title: "Career Fair 2026 Registration Open",
    type: "event",
    status: "Needs Review",
    excerpt:
      "Meet 40+ top employers at the annual career fair. Open to all ASTU students and recent graduates.",
    author: "Event Coordinator",
    updatedAt: "2 hours ago",
    views: 0,
    tags: ["career", "fair", "event"],
    pinned: false,
    featured: true,
    language: "EN",
    seoScore: 96,
    wordCount: 940,
    readTime: "5 min read",
  },
  {
    id: "C-007",
    title: "Graduation Photo Gallery 2025",
    type: "gallery",
    status: "Published",
    excerpt:
      "Celebrating 3,500+ graduates from the Class of 2025 with full ceremony coverage and portraits.",
    author: "Content Manager",
    updatedAt: "1 week ago",
    publishedAt: "May 15, 2026",
    views: 3401,
    tags: ["graduation", "students", "2025"],
    pinned: false,
    featured: true,
    language: "EN",
    seoScore: 85,
    wordCount: 220,
    readTime: "1 min read",
  },
  {
    id: "C-008",
    title: "Alumni Spotlight: Mekdes Yilma",
    type: "post",
    status: "Published",
    excerpt:
      "From ASTU to NASA: How Mekdes Yilma turned her engineering passion into a space industry career.",
    author: "Content Manager",
    updatedAt: "Jun 2, 2026",
    publishedAt: "Jun 2, 2026",
    views: 567,
    tags: ["alumni", "spotlight", "engineering"],
    pinned: false,
    featured: true,
    language: "EN",
    seoScore: 95,
    wordCount: 1680,
    readTime: "8 min read",
  },
  {
    id: "C-009",
    title: "Employer Branding: Ethio Telecom",
    type: "page",
    status: "Draft",
    excerpt:
      "Promote Ethio Telecom as a featured recruitment partner with company profile and open positions.",
    author: "Content Manager",
    updatedAt: "May 30, 2026",
    views: 0,
    tags: ["employer", "telecom", "branding"],
    pinned: false,
    featured: false,
    language: "EN",
    seoScore: 68,
    wordCount: 450,
    readTime: "2 min read",
  },
  {
    id: "C-010",
    title: "Workshop Registration CTA",
    type: "page",
    status: "Scheduled",
    excerpt:
      "Add QR attendance and certificate language to the workshop section for the upcoming AI/ML workshop.",
    author: "Content Manager",
    updatedAt: "Jun 8, 2026",
    scheduledFor: "Jun 10, 12:00 PM",
    views: 0,
    tags: ["workshop", "ai", "ml"],
    pinned: false,
    featured: false,
    language: "EN",
    seoScore: 89,
    wordCount: 780,
    readTime: "4 min read",
  },
  {
    id: "C-011",
    title: "Research Innovation Showcase",
    type: "post",
    status: "Published",
    excerpt:
      "Highlighting breakthrough research from ASTU faculty and students in renewable energy and biotech.",
    author: "Research Directorate",
    updatedAt: "4 days ago",
    publishedAt: "Jun 5, 2026",
    views: 423,
    tags: ["research", "innovation", "showcase"],
    pinned: false,
    featured: false,
    language: "EN",
    seoScore: 92,
    wordCount: 1450,
    readTime: "7 min read",
  },
  {
    id: "C-012",
    title: "Old Homepage (Archived)",
    type: "page",
    status: "Archived",
    excerpt:
      "Legacy homepage from the previous system. Archived after migration to the new ASTU-AMS platform.",
    author: "System Admin",
    updatedAt: "2 months ago",
    views: 0,
    tags: ["legacy", "archive"],
    pinned: false,
    featured: false,
    language: "EN",
    seoScore: 61,
    wordCount: 920,
    readTime: "4 min read",
  },
];

const STATUS_TABS: Array<{ key: "all" | ContentStatus; label: string }> = [
  { key: "all", label: "All Content" },
  { key: "Published", label: "Published" },
  { key: "Scheduled", label: "Scheduled" },
  { key: "Draft", label: "Drafts" },
  { key: "Needs Review", label: "Needs Review" },
  { key: "Archived", label: "Archived" },
];

const TYPE_FILTERS: Array<{ key: "all" | ContentType; label: string }> = [
  { key: "all", label: "All Types" },
  { key: "page", label: "Pages" },
  { key: "post", label: "Posts" },
  { key: "announcement", label: "Announcements" },
  { key: "gallery", label: "Galleries" },
  { key: "event", label: "Events" },
  { key: "template", label: "Templates" },
];

export default function ContentList() {
  // Integration-ready: data flows through useCmsContent hook
  // To connect to backend, update fetchContentList() in cmsService.ts
  const {
    items,
    isLoading,
    error,
    refetch,
    update: updateItem,
    remove: removeItem,
    publish: publishItem,
    schedule: scheduleItem,
    bulkUpdate,
    bulkDelete,
  } = useCmsContent();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusTab, setStatusTab] = useState<"all" | ContentStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ContentType>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ContentCardItem | null>(null);

  // Custom states for the premium Inspect Drawer
  const [drawerTab, setDrawerTab] = useState<"overview" | "seo" | "history">(
    "overview",
  );

  // Handle ESC key for closing the inspect drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusTab !== "all" && item.status !== statusTab) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
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

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: items.length };
    for (const tab of STATUS_TABS) {
      if (tab.key === "all") continue;
      result[tab.key] = items.filter((item) => item.status === tab.key).length;
    }
    return result;
  }, [items]);

  const statsCalculations = useMemo(() => {
    const published = items.filter((i) => i.status === "Published").length;
    const scheduled = items.filter((i) => i.status === "Scheduled").length;
    const needsReview = items.filter((i) => i.status === "Needs Review").length;
    const totalViews = items.reduce((sum, i) => sum + (i.views || 0), 0);
    return {
      total: items.length,
      published,
      scheduled,
      needsReview,
      totalViews,
    };
  }, [items]);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id],
    );
  };

  const selectAllVisible = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((item) => item.id));
    }
  };

  const handleUpdateItem = useCallback(
    (id: string, partial: Partial<ContentCardItem>) => {
      updateItem(id, partial as any);
    },
    [updateItem],
  );

  const handleBulkUpdate = useCallback(
    (status: ContentStatus) => {
      if (selectedIds.length === 0) return;
      bulkUpdate(selectedIds, status);
      setSelectedIds([]);
    },
    [selectedIds, bulkUpdate],
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    bulkDelete(selectedIds);
    setSelectedIds([]);
  }, [selectedIds, bulkDelete]);

  const handleScheduleSubmit = (value: ScheduleValue) => {
    if (scheduleTarget) {
      scheduleItem(scheduleTarget, value.date, value.time);
      toast.success("Item scheduled");
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
    selectedIds.forEach((id) => scheduleItem(id, value.date, value.time));
    toast.success(`${selectedIds.length} item(s) scheduled`);
    setSelectedIds([]);
    setScheduleOpen(false);
  };

  // Helper for generating custom gradient covers dynamically for the drawer
  const getCoverGradient = (type: ContentType) => {
    switch (type) {
      case "page":
        return "from-blue-600 to-indigo-750";
      case "post":
        return "from-teal-500 to-cyan-600";
      case "announcement":
        return "from-amber-500 to-rose-600";
      case "gallery":
        return "from-purple-600 to-pink-600";
      case "event":
        return "from-rose-500 to-orange-500";
      default:
        return "from-slate-600 to-slate-800";
    }
  };

  if (isLoading) return <CmsSkeleton rows={6} />;
  if (error) return <CmsError message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes cms-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .cms-fade { animation: cms-fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .cms-fade-delay-1 { animation: cms-fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.05s; }
        .cms-fade-delay-2 { animation: cms-fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.1s; }
        .cms-fade-delay-3 { animation: cms-fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.15s; }
        .card-anim { animation: cms-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        /* Shimmer effects for dashboard headers */
        .shimmer-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
          transform: translateX(-100%);
          animation: shimmer-load 2.5s infinite;
        }
        @keyframes shimmer-load {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Main Header */}
      <AdminPageHeader
        title="All Content"
        subtitle="Manage, monitor, and schedule the public-facing pages, announcements, blog posts, and media campaigns in a unified control panel."
        breadcrumbs={[{ label: "CMS" }, { label: "Content" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#003366] hover:bg-[#00254d] dark:bg-blue-600 dark:hover:bg-blue-700 px-4 text-xs font-semibold text-white transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New Content
            </button>
          </div>
        }
      />

      {/* Glassmorphic Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 card-anim">
        {/* Total Content Card */}
        <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Total Entries
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                {statsCalculations.total}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {items.filter((i) => i.type === "page").length} pages
            </span>
            <span>·</span>
            <span>{items.filter((i) => i.type === "post").length} posts</span>
          </div>
        </div>

        {/* Live Published Card */}
        <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 dark:bg-emerald-500/3 blur-xl rounded-full" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live & Public
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                {statsCalculations.published}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Globe className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>
              Active views: {statsCalculations.totalViews.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Scheduled Card */}
        <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 dark:bg-blue-500/3 blur-xl rounded-full" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Scheduled
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                {statsCalculations.scheduled}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400">
            <span className="font-medium">Automatic pipeline active</span>
          </div>
        </div>

        {/* Awaiting Review Card */}
        <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 dark:bg-amber-500/3 blur-xl rounded-full" />
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pending Review
              </p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                  {statsCalculations.needsReview}
                </h3>
                {statsCalculations.needsReview > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Awaiting moderator feedback</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="cms-fade-delay-1 flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#1a1d27] p-4 shadow-sm">
        {/* Top toolbar layer */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search page titles, contents, authors or tags..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-2.5 pl-9 pr-8 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/5 dark:focus:ring-blue-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <span className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                ⌘F
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((open) => !open)}
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4.5 text-xs font-bold transition-all ${
                showFilters
                  ? "border-[#003580] dark:border-[#3b82f6] bg-[#003580]/5 dark:bg-[#3b82f6]/5 text-[#003580] dark:text-[#3b82f6]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Filter className="h-4 w-4" />
              Type Filters
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-250 ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusTab("all");
                setTypeFilter("all");
                setSelectedIds([]);
              }}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Reset Search & Filters"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                  view === "grid"
                    ? "bg-white dark:bg-slate-800 text-[#003580] dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
                title="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                  view === "list"
                    ? "bg-white dark:bg-slate-800 text-[#003580] dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic sliding type filters section */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/60 pt-3.5 transition-all">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setTypeFilter(type.key)}
                className={`inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-[11px] font-bold tracking-tight transition-all ${
                  typeFilter === type.key
                    ? "border-[#003580] dark:border-blue-600 bg-[#003580] dark:bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-[#003580]/40"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        {/* Status Tab list */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/60 pt-3.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                statusTab === tab.key
                  ? "bg-[#003580] dark:bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              {tab.label}
              <span
                className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${
                  statusTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {counts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions sticky panel */}
      {selectedIds.length > 0 && (
        <div className="cms-fade-delay-1 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 dark:border-blue-900/35 bg-gradient-to-r from-blue-50/95 to-indigo-50/95 dark:from-[#1b263b]/95 dark:to-[#141b2e]/95 px-5 py-3.5 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#003580] dark:text-blue-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#003580] dark:bg-blue-600 text-[10.5px] font-bold text-white leading-none">
              {selectedIds.length}
            </span>
            <span>Items selected</span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={selectAllVisible}
              className="text-xs font-bold text-[#003580]/80 dark:text-blue-400/80 hover:text-[#003580] dark:hover:text-blue-300 hover:underline"
            >
              {selectedIds.length === filtered.length
                ? "Deselect all"
                : "Select all visible"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleBulkUpdate("Published")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm active:scale-[0.98] transition-all"
            >
              <Send className="h-3.5 w-3.5" /> Publish
            </button>
            <button
              type="button"
              onClick={scheduleForBulk}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm active:scale-[0.98] transition-all"
            >
              <Calendar className="h-3.5 w-3.5" /> Schedule
            </button>
            <button
              type="button"
              onClick={() => handleBulkUpdate("Archived" as any)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm active:scale-[0.98] transition-all"
            >
              <Archive className="h-3.5 w-3.5" /> Archive
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm active:scale-[0.98] transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
            <span className="text-slate-300 mx-1">|</span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main List/Grid Content Area */}
      <div className="cms-fade-delay-2">
        {view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                selected={selectedIds.includes(item.id)}
                onSelect={toggleSelected}
                onPreview={() => setPreviewItem(item)}
                onEdit={() =>
                  toast.success(`Opening editor for "${item.title}"`)
                }
                onPublish={() => publishItem(item.id)}
                onSchedule={() => openScheduleFor(item.id)}
                onDelete={() => removeItem(item.id)}
                onTogglePin={() => {
                  handleUpdateItem(item.id, { pinned: !item.pinned });
                  toast.success(item.pinned ? "Item unpinned" : "Item pinned");
                }}
                onToggleFeature={() => {
                  handleUpdateItem(item.id, { featured: !item.featured });
                  toast.success(
                    item.featured ? "Featured removed" : "Marked as featured",
                  );
                }}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1d27] shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 text-left text-[10.5px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-bold">
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={selectAllVisible}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-[#003580] focus:ring-[#003580]"
                    />
                  </th>
                  <th className="px-4 py-3.5">Title & Excerpt</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">SEO Score</th>
                  <th className="px-4 py-3.5">Performance</th>
                  <th className="px-4 py-3.5">Owner</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filtered.map((item) => {
                  const itemPublished = item.status === "Published";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/[0.4] dark:hover:bg-slate-900/[0.15] transition-colors group/row"
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelected(item.id)}
                          className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-[#003580] focus:ring-[#003580]"
                        />
                      </td>
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="font-bold text-slate-800 dark:text-slate-200 group-hover/row:text-[#003580] dark:group-hover/row:text-blue-400 transition-colors">
                          {item.title}
                          {item.pinned && (
                            <span className="ml-1.5 inline-flex items-center text-[10px] text-amber-500 font-normal">
                              📌
                            </span>
                          )}
                        </div>
                        {item.excerpt && (
                          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                            {item.excerpt}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${
                            item.status === "Published"
                              ? "text-emerald-600"
                              : item.status === "Draft"
                                ? "text-slate-500"
                                : item.status === "Scheduled"
                                  ? "text-blue-500 animate-pulse"
                                  : "text-amber-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.status === "Published"
                                ? "bg-emerald-500"
                                : item.status === "Draft"
                                  ? "bg-slate-400"
                                  : item.status === "Scheduled"
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {item.seoScore ? (
                          <div className="inline-flex items-center gap-1">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                item.seoScore >= 90
                                  ? "bg-emerald-500"
                                  : item.seoScore >= 80
                                    ? "bg-blue-500"
                                    : item.seoScore >= 70
                                      ? "bg-amber-500"
                                      : "bg-rose-500"
                              }`}
                            />
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                              {item.seoScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {itemPublished && item.views !== undefined ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                              <Eye className="h-3 w-3 text-slate-400" />{" "}
                              {item.views.toLocaleString()}
                            </span>
                            <span className="text-[9.5px] text-slate-400">
                              {item.readTime ?? "3 min read"}
                            </span>
                          </div>
                        ) : item.status === "Scheduled" && item.scheduledFor ? (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Scheduled
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] font-bold text-white">
                            {item.author?.[0]}
                          </div>
                          <div className="text-xs">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {item.author}
                            </div>
                            <div className="text-[9.5px] text-slate-400">
                              {item.updatedAt}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
                            title="Preview Content"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toast.success(
                                `Opening editor for "${item.title}"`,
                              )
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:text-blue-600"
                            title="Edit"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openScheduleFor(item.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:text-blue-600"
                            title="Schedule"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-950/20 bg-rose-50/70 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100/70 dark:hover:bg-rose-900/40"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-500">
                No content matches your active filters.
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 && view === "grid" && (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1a1d27] p-12 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              No matching content found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your filters or search keywords to find content.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#003580] hover:bg-[#00254d] dark:bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Content
            </button>
          </div>
        )}
      </div>

      {/* Schedule Dialog (reusable) */}
      <ScheduleDialog
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          setScheduleTarget(null);
        }}
        onConfirm={(value) =>
          scheduleTarget
            ? handleScheduleSubmit(value)
            : submitBulkSchedule(value)
        }
      />

      {/* Add Content Dialog (reusable) */}
      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Content Entry"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4.5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success("New content draft initialized");
                setCreateOpen(false);
              }}
              className="rounded-lg bg-[#003580] hover:bg-[#00254d] dark:bg-blue-600 px-4.5 py-2.5 text-xs font-bold text-white transition-all"
            >
              Initialize Draft
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Content Type
            </span>
            <select className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500">
              <option>Page</option>
              <option>Post</option>
              <option>Announcement</option>
              <option>Gallery</option>
              <option>Event</option>
              <option>Template</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Title
            </span>
            <input
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500"
              placeholder="e.g. ASTU Hosts International Engineering Summit"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              URL Slug
            </span>
            <input
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-[#003580] dark:focus:border-blue-500"
              placeholder="astu-international-engineering-summit"
            />
          </label>
        </div>
      </AdminModal>

      {/* Premium Inspect Slide-out Drawer */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${previewItem ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          onClick={() => setPreviewItem(null)}
        />
      </div>

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-xl bg-white dark:bg-[#1a1d27] border-l border-slate-200/80 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${
          previewItem ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {previewItem && (
          <>
            {/* Drawer Header (Graphic cover visual) */}
            <div
              className={`relative h-36 bg-gradient-to-r ${getCoverGradient(previewItem.type)} px-6 py-5 flex flex-col justify-end text-white shrink-0`}
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors border border-white/10"
                aria-label="Close panel"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="space-y-1">
                <span className="inline-flex rounded-md bg-white/20 dark:bg-black/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white border border-white/10">
                  {previewItem.type}
                </span>
                <h2 className="text-lg font-extrabold tracking-tight line-clamp-2 drop-shadow-sm leading-tight">
                  {previewItem.title}
                </h2>
              </div>
            </div>

            {/* Inspect panel tabs */}
            <div className="flex border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-6 shrink-0">
              {[
                { key: "overview", label: "Overview" },
                { key: "seo", label: "SEO Analysis" },
                { key: "history", label: "Revision History" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDrawerTab(tab.key as any)}
                  className={`border-b-2 px-4 py-3.5 text-xs font-bold transition-all ${
                    drawerTab === tab.key
                      ? "border-[#003580] dark:border-blue-500 text-slate-800 dark:text-slate-200"
                      : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inspect panel content (Scrollable scrollbar) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerTab === "overview" && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Summary excerpt
                    </h4>
                    <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800 p-3.5">
                      {previewItem.excerpt ||
                        "No description summary provided for this entry."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Creator
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {previewItem.author || "Unknown"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Total Views
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {previewItem.views?.toLocaleString() ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Word Count
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {previewItem.wordCount ?? "—"} words
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Language
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {previewItem.language ?? "EN"}
                      </p>
                    </div>
                  </div>

                  {previewItem.tags && previewItem.tags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Metadata taxonomy tags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {previewItem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-dashed border-slate-350 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 p-4">
                    <div className="flex gap-2.5">
                      <AlertCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Live Preview Container:
                        </span>{" "}
                        This panel inspects raw database variables. The draft
                        will be public-facing when published. Custom components
                        will apply global styles.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === "seo" && (
                <div className="space-y-6">
                  {/* Google search preview widget */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Google search preview (Mock)
                    </h4>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/60 p-4.5 space-y-1 shadow-sm">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                        https://astu.edu.et › news ›{" "}
                        {previewItem.slug ?? "alumni-networking"}
                      </span>
                      <a
                        href="#"
                        className="text-base text-blue-800 dark:text-blue-400 hover:underline font-semibold leading-tight block"
                      >
                        {previewItem.title}
                      </a>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {previewItem.excerpt?.slice(0, 155) ||
                          "No excerpt available. Google will dynamically scrape content fields..."}
                      </p>
                    </div>
                  </div>

                  {/* SEO Score assessment */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        SEO Health Index
                      </h4>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-extrabold ${
                          (previewItem.seoScore ?? 0) >= 90
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : (previewItem.seoScore ?? 0) >= 75
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                        }`}
                      >
                        {previewItem.seoScore ?? "Unassessed"} / 100
                      </span>
                    </div>

                    {/* Score Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (previewItem.seoScore ?? 0) >= 90
                            ? "bg-emerald-500"
                            : (previewItem.seoScore ?? 0) >= 75
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        }`}
                        style={{ width: `${previewItem.seoScore ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Checklist assessment */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Optimization Checklist
                    </h4>
                    <div className="divide-y divide-slate-100 dark:divide-slate-850 rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/30 overflow-hidden">
                      <div className="flex items-center justify-between p-3.5">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Meta tags and slug formatted
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between p-3.5">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Keyword presence in title header
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between p-3.5">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Excerpts matching title context
                        </span>
                        {(previewItem.seoScore ?? 0) > 85 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === "history" && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Audit trail timeline
                  </h4>
                  <div className="relative pl-6 space-y-5 border-l border-slate-200 dark:border-slate-800">
                    <div className="relative">
                      <span className="absolute -left-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <CheckCircle2 className="h-3 w-3 fill-emerald-500 text-white" />
                      </span>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Content state updated to: {previewItem.status}
                        </p>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">
                          {previewItem.updatedAt} · by {previewItem.author}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Plus className="h-3 w-3" />
                      </span>
                      <div className="text-xs">
                        <p className="font-semibold text-slate-700 dark:text-slate-350">
                          Draft initialized
                        </p>
                        <p className="text-[10.5px] text-slate-500 mt-0.5">
                          3 days ago · by Content Manager
                        </p>
                      </div>
                    </div>

                    <div className="relative text-slate-400">
                      <span className="absolute -left-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                      <div className="text-xs">
                        <p className="font-semibold text-slate-500 dark:text-slate-500">
                          Revision branch checkout
                        </p>
                        <p className="text-[10.5px] mt-0.5">
                          1 week ago · System Migration
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer footer actions */}
            <div className="border-t border-slate-150 dark:border-slate-800 p-4.5 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                ID: {previewItem.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Close Panel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    publishItem(previewItem.id);
                    setPreviewItem(null);
                  }}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
                >
                  Publish Live
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
