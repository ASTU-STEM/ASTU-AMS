import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
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
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';

type WorkflowStatus = 'Pending Review' | 'In Review' | 'Changes Requested' | 'Approved' | 'Rejected' | 'Published';
type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';

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
  { id: 'w-1', title: 'Career Fair 2026 Registration Open', type: 'Event', author: 'Event Coordinator', submittedAt: '2 hours ago', status: 'Pending Review', priority: 'High', reviewer: 'Content Manager', stage: 1, totalStages: 3, comments: 0, dueDate: 'Today, 5 PM' },
  { id: 'w-2', title: 'Campus Tour 2026 Photo Album', type: 'Gallery', author: 'Dept Head', submittedAt: '3 days ago', status: 'In Review', priority: 'Normal', reviewer: 'Sarah Mengistu', stage: 2, totalStages: 3, comments: 3, dueDate: 'Tomorrow' },
  { id: 'w-3', title: 'Tracer Survey Wave 3 Banner', type: 'Page', author: 'Content Manager', submittedAt: '5 hours ago', status: 'Changes Requested', priority: 'Normal', reviewer: 'Marketing Lead', stage: 1, totalStages: 2, comments: 7, dueDate: 'Jun 12' },
  { id: 'w-4', title: 'Alumni Spotlight: Solomon Bekele', type: 'Post', author: 'Content Manager', submittedAt: '1 day ago', status: 'Approved', priority: 'High', reviewer: 'Editor in Chief', stage: 3, totalStages: 3, comments: 2, dueDate: '—' },
  { id: 'w-5', title: 'Research Lab Safety Guidelines', type: 'Page', author: 'Research Directorate', submittedAt: '4 days ago', status: 'Pending Review', priority: 'Urgent', reviewer: 'Public Relations', stage: 1, totalStages: 2, comments: 0, dueDate: 'Today' },
  { id: 'w-6', title: 'Partnership Summit Report', type: 'Post', author: 'Industry Liaison', submittedAt: '6 hours ago', status: 'In Review', priority: 'Normal', reviewer: 'Content Manager', stage: 1, totalStages: 3, comments: 1, dueDate: 'Jun 13' },
  { id: 'w-7', title: 'Outdated Department Policy', type: 'Page', author: 'HR Office', submittedAt: '2 weeks ago', status: 'Rejected', priority: 'Low', reviewer: 'Legal', stage: 2, totalStages: 2, comments: 5, dueDate: '—' },
  { id: 'w-8', title: 'New Homepage Hero Update', type: 'Page', author: 'Content Manager', submittedAt: '30 min ago', status: 'Pending Review', priority: 'Urgent', reviewer: 'Marketing Lead', stage: 1, totalStages: 3, comments: 0, dueDate: 'Today' },
];

const statusStyles: Record<WorkflowStatus, string> = {
  'Pending Review': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
  'In Review': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
  'Changes Requested': 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300',
  'Approved': 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Rejected': 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
  'Published': 'border-[#003580] bg-[#003580]/10 text-[#003580] dark:text-sky-300',
};

const priorityStyles: Record<Priority, string> = {
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Normal: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  High: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
};

export default function ApprovalWorkflow() {
  const [filter, setFilter] = useState<'all' | WorkflowStatus>('all');
  const [selected, setSelected] = useState<WorkflowItem | null>(WORKFLOW[0]);

  const filtered = useMemo(() => {
    if (filter === 'all') return WORKFLOW;
    return WORKFLOW.filter((w) => w.status === filter);
  }, [filter]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: WORKFLOW.length };
    for (const w of WORKFLOW) {
      result[w.status] = (result[w.status] ?? 0) + 1;
    }
    return result;
  }, []);

  const tabs: Array<{ key: 'all' | WorkflowStatus; label: string }> = [
    { key: 'all', label: 'All Items' },
    { key: 'Pending Review', label: 'Pending' },
    { key: 'In Review', label: 'In Review' },
    { key: 'Changes Requested', label: 'Changes' },
    { key: 'Approved', label: 'Approved' },
    { key: 'Rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Approval Workflow"
        subtitle="Multi-stage content review and approval pipeline. Track, comment, approve, or reject submissions."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Approvals' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="warning">{counts['Pending Review'] ?? 0} pending</AdminBadge>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer">
              <GitBranch className="h-3.5 w-3.5" /> Configure Stages
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: 'Awaiting Review', value: counts['Pending Review'] ?? 0, icon: Clock, color: '#E8A020' },
          { label: 'In Review', value: counts['In Review'] ?? 0, icon: Eye, color: '#003580' },
          { label: 'Changes Requested', value: counts['Changes Requested'] ?? 0, icon: MessageSquare, color: '#F97316' },
          { label: 'Approved Today', value: counts['Approved'] ?? 0, icon: CheckCircle2, color: '#1D9E75' },
          { label: 'Rejected', value: counts['Rejected'] ?? 0, icon: ThumbsDown, color: '#E24B4A' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-[12px] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Filter className="ml-1 h-3.5 w-3.5 text-slate-400" />
        {tabs.map((tab) => (
          <button key={tab.key} type="button" onClick={() => setFilter(tab.key)} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${filter === tab.key ? 'bg-[#003580] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
            {tab.label} <span className={`ml-1 rounded px-1.5 py-0.5 text-[9px] ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>{counts[tab.key] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className={`group cursor-pointer rounded-[12px] border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${
                selected?.id === item.id ? 'border-[#003580] ring-2 ring-[#003580]/20 dark:border-sky-500' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[item.status]}`}>{item.status}</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[item.priority]}`}>{item.priority}</span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.type}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {item.author}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.submittedAt}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {item.dueDate}</span>
                    {item.comments > 0 && <span className="flex items-center gap-1 text-blue-600 dark:text-sky-400"><MessageSquare className="h-3 w-3" /> {item.comments}</span>}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Stage {item.stage}/{item.totalStages}</span>
                    <div className="flex-1 max-w-[180px] h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-1.5 rounded-full bg-[#003580] transition-all" style={{ width: `${(item.stage / item.totalStages) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-4 self-start dark:border-slate-800 dark:bg-slate-900">
          {selected ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[selected.status]}`}>{selected.status}</span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[selected.priority]}`}>{selected.priority}</span>
                </div>
                <h2 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{selected.title}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Submitted by {selected.author} · {selected.submittedAt}</p>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Approval Pipeline</h3>
                <ol className="mt-2 space-y-2">
                  {['Initial Review', 'Editorial Review', 'Final Approval'].slice(0, selected.totalStages).map((stageName, idx) => (
                    <li key={stageName} className="flex items-center gap-2 text-xs">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${idx + 1 < selected.stage ? 'bg-emerald-500 text-white' : idx + 1 === selected.stage ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {idx + 1 < selected.stage ? '✓' : idx + 1}
                      </span>
                      <span className={idx + 1 === selected.stage ? 'font-semibold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}>{stageName}</span>
                      {idx + 1 === selected.stage && <span className="ml-auto text-[10px] font-semibold text-blue-600 dark:text-sky-400">In Progress</span>}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reviewer</h3>
                <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#003580] text-[10px] font-semibold text-white">
                    {selected.reviewer.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{selected.reviewer}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Assigned reviewer</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Review Activity</h3>
                <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50/60 p-2 text-xs dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500" /><span>Submitted by {selected.author}</span></div>
                  {selected.comments > 0 && (
                    <div className="flex items-start gap-2"><MessageSquare className="mt-0.5 h-3.5 w-3.5 text-blue-500" /><span>{selected.comments} comment{selected.comments > 1 ? 's' : ''} added</span></div>
                  )}
                  <div className="flex items-start gap-2"><Clock className="mt-0.5 h-3.5 w-3.5 text-slate-400" /><span>Due {selected.dueDate}</span></div>
                </div>
              </div>

              <div>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Add comment</span>
                  <textarea rows={3} placeholder="Provide feedback, request changes, or approve..." className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#003580] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button type="button" onClick={() => { toast.success('Approved and forwarded to next stage'); }} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 cursor-pointer">
                  <ThumbsUp className="h-3.5 w-3.5" /> Approve
                </button>
                <button type="button" onClick={() => { toast('Changes requested', { icon: '✍️' }); }} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 cursor-pointer">
                  <AlertTriangle className="h-3.5 w-3.5" /> Request Changes
                </button>
                <button type="button" onClick={() => { toast.success('Published to live site'); }} className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 cursor-pointer">
                  <Send className="h-3.5 w-3.5" /> Approve & Publish
                </button>
                <button type="button" onClick={() => { toast.error('Content rejected'); }} className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 cursor-pointer">
                  <ThumbsDown className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Select an item to review.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
