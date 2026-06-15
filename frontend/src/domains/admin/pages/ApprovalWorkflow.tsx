import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  GitBranch,
  MessageSquare,
  Send,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import { useCmsListSection } from '../hooks/useCmsSection';
import { CmsSkeleton, CmsError } from '../components/CmsLoadingState';
import { fetchWorkflowItems, updateWorkflowItem } from '../services/cmsService';
import type { WorkflowItem } from '../services/cmsService';

type WorkflowStatus =
  | "Pending Review"
  | "In Review"
  | "Changes Requested"
  | "Approved"
  | "Rejected"
  | "Published";
type Priority = "Low" | "Normal" | "High" | "Urgent";

type WorkflowItem = {
  id: string;
  title: string;
  type: string;
  author: string;
  submittedAt: string;
  status: WorkflowStatus;
  priority: Priority;
  reviewer: string;
  stage: number;
  totalStages: number;
  comments: number;
  dueDate: string;
};

const WORKFLOW: WorkflowItem[] = [
  { id: "w-1", title: "Career Fair 2026 Registration Open", type: "Event", author: "Event Coordinator", submittedAt: "2 hours ago", status: "Pending Review", priority: "High", reviewer: "Content Manager", stage: 1, totalStages: 3, comments: 0, dueDate: "Today, 5 PM" },
  { id: "w-2", title: "Campus Tour 2026 Photo Album", type: "Gallery", author: "Dept Head", submittedAt: "3 days ago", status: "In Review", priority: "Normal", reviewer: "Sarah Mengistu", stage: 2, totalStages: 3, comments: 3, dueDate: "Tomorrow" },
  { id: "w-3", title: "Tracer Survey Wave 3 Banner", type: "Page", author: "Content Manager", submittedAt: "5 hours ago", status: "Changes Requested", priority: "Normal", reviewer: "Marketing Lead", stage: 1, totalStages: 2, comments: 7, dueDate: "Jun 12" },
  { id: "w-4", title: "Alumni Spotlight: Solomon Bekele", type: "Post", author: "Content Manager", submittedAt: "1 day ago", status: "Approved", priority: "High", reviewer: "Editor in Chief", stage: 3, totalStages: 3, comments: 2, dueDate: "—" },
  { id: "w-5", title: "Research Lab Safety Guidelines", type: "Page", author: "Research Directorate", submittedAt: "4 days ago", status: "Pending Review", priority: "Urgent", reviewer: "Public Relations", stage: 1, totalStages: 2, comments: 0, dueDate: "Today" },
  { id: "w-6", title: "Partnership Summit Report", type: "Post", author: "Industry Liaison", submittedAt: "6 hours ago", status: "In Review", priority: "Normal", reviewer: "Content Manager", stage: 1, totalStages: 3, comments: 1, dueDate: "Jun 13" },
  { id: "w-7", title: "Outdated Department Policy", type: "Page", author: "HR Office", submittedAt: "2 weeks ago", status: "Rejected", priority: "Low", reviewer: "Legal", stage: 2, totalStages: 2, comments: 5, dueDate: "—" },
  { id: "w-8", title: "New Homepage Hero Update", type: "Page", author: "Content Manager", submittedAt: "30 min ago", status: "Pending Review", priority: "Urgent", reviewer: "Marketing Lead", stage: 1, totalStages: 3, comments: 0, dueDate: "Today" },
];

const statusConfig: Record<WorkflowStatus, { badge: string; dot: string }> = {
  "Pending Review": { badge: "border-amber-500/25 bg-amber-500/10 text-amber-400", dot: "bg-amber-400" },
  "In Review": { badge: "border-blue-500/25 bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  "Changes Requested": { badge: "border-orange-500/25 bg-orange-500/10 text-orange-400", dot: "bg-orange-400" },
  Approved: { badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
  Rejected: { badge: "border-rose-500/25 bg-rose-500/10 text-rose-400", dot: "bg-rose-400" },
  Published: { badge: "border-blue-500/25 bg-[#003580]/20 text-blue-300", dot: "bg-blue-400" },
};

const priorityConfig: Record<Priority, { cls: string; color: string }> = {
  Low: { cls: "bg-slate-500/12 text-slate-400", color: "#94a3b8" },
  Normal: { cls: "bg-blue-500/12 text-blue-400", color: "#60a5fa" },
  High: { cls: "bg-amber-500/12 text-amber-400", color: "#fbbf24" },
  Urgent: { cls: "bg-rose-500/12 text-rose-400", color: "#f87171" },
};

export default function ApprovalWorkflow() {
  // Integration-ready: uses useCmsListSection with cmsService stubs
  // To connect to backend, update fetchWorkflowItems/updateWorkflowItem in cmsService.ts
  const {
    items,
    isLoading,
    error,
    refetch,
  } = useCmsListSection<WorkflowItem>(fetchWorkflowItems, {});

  const [filter, setFilter] = useState<"all" | WorkflowStatus>("all");
  const [selected, setSelected] = useState<WorkflowItem | null>(null);

  // Set initial selection when items load
  React.useEffect(() => {
    if (items.length > 0 && !selected) setSelected(items[0]);
  }, [items]);

  // ALL hooks must be declared before any conditional returns
  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((w) => w.status === filter);
  }, [filter, items]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: items.length };
    for (const w of items) { result[w.status] = (result[w.status] ?? 0) + 1; }
    return result;
  }, [items]);

  const tabs: Array<{ key: "all" | WorkflowStatus; label: string }> = [
    { key: "all", label: "All Items" },
    { key: "Pending Review", label: "Pending" },
    { key: "In Review", label: "In Review" },
    { key: "Changes Requested", label: "Changes" },
    { key: "Approved", label: "Approved" },
    { key: "Rejected", label: "Rejected" },
  ];

  if (isLoading) return <CmsSkeleton rows={6} />;
  if (error) return <CmsError message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes aw-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .aw-fade-up { animation: aw-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .aw-textarea { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; border-radius: 10px; padding: 10px 14px; font-size: 13px; outline: none; transition: border-color 0.2s; width: 100%; resize: none; }
        .dark .aw-textarea { background: rgba(26,29,39,0.7); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; }
        .aw-textarea:focus { border-color: #003580; box-shadow: 0 0 0 3px rgba(0,53,128,0.1); }
        .dark .aw-textarea:focus { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .aw-textarea::placeholder { color: #94a3b8; }
      `}</style>

      {/* Hero Banner — consistent ASTU brand */}
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 12px 48px rgba(0,53,128,0.40)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 40% 70% at -5% 70%, rgba(232,160,32,0.12), transparent)' }} />
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
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#E8A020' }} />
                Quality Control
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
            >
              Approval Workflow
            </h1>
            <p
              className="mt-2 text-sm leading-relaxed font-medium max-w-lg"
              style={{ color: 'rgba(255,255,255,0.80)' }}
            >
              Multi-stage review pipeline. Maintain high standards for all public-facing content.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105 shrink-0"
            style={{ background: '#E8A020', color: '#ffffff', boxShadow: '0 4px 20px rgba(232,160,32,0.35)' }}
          >
            <GitBranch className="h-4 w-4" /> Workflow Config
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: "Awaiting Review", value: counts["Pending Review"] ?? 0, icon: Clock, color: '#E8A020', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800/40' },
          { label: "In Review", value: counts["In Review"] ?? 0, icon: Eye, color: '#003580', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800/40' },
          { label: "Changes Requested", value: counts["Changes Requested"] ?? 0, icon: MessageSquare, color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800/40' },
          { label: "Approved", value: counts["Approved"] ?? 0, icon: CheckCircle2, color: '#1D9E75', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40' },
          { label: "Rejected", value: counts["Rejected"] ?? 0, icon: ThumbsDown, color: '#e24b4a', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800/40' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`aw-fade-up group relative overflow-hidden rounded-2xl border ${s.border} ${s.bg} p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{s.value}</span>
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1d27]/90 p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <Filter className="ml-1 h-3.5 w-3.5 text-slate-400" />
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
              filter === tab.key
                ? 'bg-[#003580] text-white shadow-md shadow-[#003580]/20'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
              filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Item List */}
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const sc = statusConfig[item.status];
            const pc = priorityConfig[item.priority];
            const isSelected = selected?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`aw-fade-up group cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-[#003580]/40 bg-[#003580]/5 dark:bg-[#003580]/10 shadow-lg shadow-[#003580]/10'
                    : 'border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1d27]/90 hover:border-[#003580]/30 hover:shadow-md'
                }`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${sc.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {item.status}
                      </span>
                      <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold uppercase ${pc.cls}`}>{item.priority}</span>
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">{item.type}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {item.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.submittedAt}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {item.dueDate}</span>
                      {item.comments > 0 && (
                        <span className="flex items-center gap-1 text-blue-500 dark:text-blue-400"><MessageSquare className="h-3 w-3" /> {item.comments}</span>
                      )}
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Stage {item.stage}/{item.totalStages}</span>
                      <div className="flex-1 max-w-[160px] h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${(item.stage / item.totalStages) * 100}%`, background: 'linear-gradient(90deg, #003580, #1D9E75)' }}
                        />
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-all group-hover:translate-x-0.5 ${isSelected ? 'text-[#003580]' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`} />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1d27]/90">
              <ShieldCheck className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No items match this filter.</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <aside className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1d27]/90 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] lg:sticky lg:top-4 self-start">
          {selected ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${statusConfig[selected.status].badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[selected.status].dot}`} />
                    {selected.status}
                  </span>
                  <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold uppercase ${priorityConfig[selected.priority].cls}`}>{selected.priority}</span>
                </div>
                <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">{selected.title}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Submitted by {selected.author} · {selected.submittedAt}</p>
              </div>

              {/* Pipeline */}
              <div className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-800/20 p-4">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Approval Pipeline</h3>
                <ol className="space-y-2.5">
                  {["Initial Review", "Editorial Review", "Final Approval"].slice(0, selected.totalStages).map((stageName, idx) => (
                    <li key={stageName} className="flex items-center gap-3 text-xs">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ${
                        idx + 1 < selected.stage ? "bg-emerald-500 text-white" :
                        idx + 1 === selected.stage ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(99,130,255,0.4)]" :
                        "bg-white/8 text-slate-500"
                      }`}>
                        {idx + 1 < selected.stage ? "✓" : idx + 1}
                      </span>
                      <span className={idx + 1 === selected.stage ? "font-semibold text-white" : "text-slate-500"}>
                        {stageName}
                      </span>
                      {idx + 1 === selected.stage && (
                        <span className="ml-auto text-[10px] font-bold text-blue-400">Active</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Reviewer */}
              <div>
                <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Assigned Reviewer</h3>
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-800/20 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#1D9E75] text-[11px] font-bold text-white shadow-sm">
                    {selected.reviewer.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{selected.reviewer}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Assigned reviewer · Due {selected.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-800/20 p-3 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Submitted by {selected.author}</span>
                </div>
                {selected.comments > 0 && (
                  <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span>{selected.comments} comment{selected.comments > 1 ? "s" : ""} added</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                  <Clock className="mt-0.5 h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Due {selected.dueDate}</span>
                </div>
              </div>

              {/* Comment Box */}
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Add Comment</span>
                <textarea rows={3} placeholder="Provide feedback, request changes, or approve..." className="aw-textarea" />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 border-t border-white/8 pt-3">
                <button type="button" onClick={() => toast.success("Approved and forwarded")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/90 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
                  <ThumbsUp className="h-3.5 w-3.5" /> Approve
                </button>
                <button type="button" onClick={() => toast("Changes requested", { icon: "✍️" })}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/90 px-3 py-2.5 text-xs font-bold text-white hover:bg-amber-500 transition-all shadow-lg shadow-amber-500/20">
                  <AlertTriangle className="h-3.5 w-3.5" /> Request Changes
                </button>
                <button type="button" onClick={() => toast.success("Published to live site")}
                  className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#003580] to-[#0a4fa6] px-3 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-[#003580]/30">
                  <Send className="h-3.5 w-3.5" /> Approve & Publish
                </button>
                <button type="button" onClick={() => toast.error("Content rejected")}
                  className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all">
                  <ThumbsDown className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Select an item to review.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
