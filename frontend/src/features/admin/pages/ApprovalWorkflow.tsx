import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Plus,
  RotateCcw,
  FileText,
  Check,
  ArrowRight,
  Tag,
  SlidersHorizontal,
  Sparkles,
  Building2,
  Trash2,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import approvalService, {
  WorkflowItem,
  WorkflowStatus,
  Priority,
  WorkflowStageConfig,
  defaultStageConfigs,
} from '../services/approval.service';

const statusStyles: Record<WorkflowStatus, string> = {
  'Pending Review': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
  'In Review': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
  'Changes Requested': 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300',
  'Approved': 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Rejected': 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
  'Published': 'border-[#003366] bg-[#003366]/10 text-[#003366] dark:text-sky-300',
};

const priorityStyles: Record<Priority, string> = {
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Normal: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  High: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
};

export default function ApprovalWorkflow() {
  const [items, setItems] = useState<WorkflowItem[]>(() => approvalService.getItems());
  const [stageConfigs, setStageConfigs] = useState<WorkflowStageConfig[]>(() => approvalService.getStageConfigs());
  const [filter, setFilter] = useState<'all' | WorkflowStatus>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id || '');
  const [commentInput, setCommentInput] = useState<string>('');

  // Modals state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [stagesModalOpen, setStagesModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [changeRequestModalOpen, setChangeRequestModalOpen] = useState(false);
  const [changeRequestReason, setChangeRequestReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // New submission form
  const [newSubmission, setNewSubmission] = useState({
    title: '',
    type: 'Announcement',
    author: 'Alumni Relations Officer',
    department: 'Corporate Communications & IRCCD',
    priority: 'Normal' as Priority,
    content: '',
    excerpt: '',
    dueDate: 'In 48 hours',
    totalStages: 3,
  });

  // Sync with service updates
  useEffect(() => {
    const handleUpdate = () => {
      setItems(approvalService.getItems());
      setStageConfigs(approvalService.getStageConfigs());
    };
    window.addEventListener('astu-cms-approval-changed', handleUpdate);
    return () => window.removeEventListener('astu-cms-approval-changed', handleUpdate);
  }, []);

  const selected = useMemo(() => {
    return items.find((i) => i.id === selectedId) || items[0] || null;
  }, [items, selectedId]);

  // Filtered items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter !== 'all' && item.status !== filter) return false;
      if (typeFilter !== 'all' && item.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchAuthor = item.author.toLowerCase().includes(q);
        const matchDept = (item.department || '').toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchDept) return false;
      }
      return true;
    });
  }, [items, filter, typeFilter, priorityFilter, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const res: Record<string, number> = { all: items.length };
    for (const item of items) {
      res[item.status] = (res[item.status] ?? 0) + 1;
    }
    return res;
  }, [items]);

  const tabs: Array<{ key: 'all' | WorkflowStatus; label: string }> = [
    { key: 'all', label: 'All Items' },
    { key: 'Pending Review', label: 'Pending' },
    { key: 'In Review', label: 'In Review' },
    { key: 'Changes Requested', label: 'Changes Requested' },
    { key: 'Approved', label: 'Approved' },
    { key: 'Published', label: 'Published' },
    { key: 'Rejected', label: 'Rejected' },
  ];

  /* ── ACTION HANDLERS ── */
  const handleApprove = () => {
    if (!selected) return;
    const isFinal = selected.stage >= selected.totalStages;
    const updated = approvalService.advanceStage(selected.id, 'Content Reviewer');
    if (updated) {
      setItems(approvalService.getItems());
      if (isFinal) {
        toast.success(`"${selected.title}" has received final approval!`);
      } else {
        toast.success(`Approved stage ${selected.stage}. Advanced to Stage ${updated.stage}.`);
      }
    }
  };

  const handleRequestChanges = () => {
    if (!selected) return;
    if (!changeRequestReason.trim()) {
      toast.error('Please specify the requested changes or corrections.');
      return;
    }
    const updated = approvalService.requestChanges(selected.id, changeRequestReason.trim(), 'Editorial Reviewer');
    if (updated) {
      setItems(approvalService.getItems());
      setChangeRequestReason('');
      setChangeRequestModalOpen(false);
      toast.success('Changes requested and author notified.');
    }
  };

  const handlePublish = () => {
    if (!selected) return;
    const updated = approvalService.publishItem(selected.id, 'Alumni Relations Officer');
    if (updated) {
      setItems(approvalService.getItems());
      toast.success(`"${selected.title}" approved & published to all actor dashboard hero portals!`);
    }
  };

  const handleReject = () => {
    if (!selected) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    const updated = approvalService.rejectItem(selected.id, rejectReason.trim(), 'Compliance Officer');
    if (updated) {
      setItems(approvalService.getItems());
      setRejectReason('');
      setRejectModalOpen(false);
      toast.error(`"${selected.title}" has been rejected.`);
    }
  };

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selected || !commentInput.trim()) return;
    const updated = approvalService.addComment(selected.id, commentInput.trim(), 'Editorial Staff');
    if (updated) {
      setItems(approvalService.getItems());
      setCommentInput('');
      toast.success('Feedback comment added to review timeline');
    }
  };

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubmission.title.trim()) {
      toast.error('Please enter a submission title.');
      return;
    }
    const created = approvalService.createSubmission(newSubmission);
    setItems(approvalService.getItems());
    setSelectedId(created.id);
    setSubmitModalOpen(false);
    setNewSubmission({
      title: '',
      type: 'Announcement',
      author: 'Alumni Relations Officer',
      department: 'Corporate Communications & IRCCD',
      priority: 'Normal',
      content: '',
      excerpt: '',
      dueDate: 'In 48 hours',
      totalStages: 3,
    });
    toast.success('New content submitted to approval pipeline!');
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (window.confirm(`Delete review item "${title}"?`)) {
      approvalService.deleteItem(id);
      setItems(approvalService.getItems());
      toast.success('Review item deleted.');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset approval queue to default university demo items?')) {
      const reset = approvalService.resetDefaults();
      setItems(reset);
      setSelectedId(reset[0]?.id || '');
      toast.success('Approval queue reset to default items.');
    }
  };

  return (
    <div className="space-y-5">
      {/* ── HEADER ── */}
      <AdminPageHeader
        title="Approval Workflow & Editorial Governance"
        subtitle="Multi-stage review pipeline for university announcements, events, policies, and public homepage updates before live publication."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Approvals' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AdminBadge variant="warning">{counts['Pending Review'] ?? 0} Awaiting Review</AdminBadge>
            <button
              type="button"
              onClick={() => setStagesModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs"
            >
              <GitBranch className="h-3.5 w-3.5 text-blue-600" />
              <span>Configure Stages</span>
            </button>
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] text-white px-3.5 py-2 text-xs font-bold hover:bg-[#002244] shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Submit for Review</span>
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
              title="Reset queue to demo items"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        }
      />

      {/* ── KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Awaiting Review', value: counts['Pending Review'] ?? 0, icon: Clock, color: '#E8A020', border: 'border-amber-200' },
          { label: 'In Review Stages', value: counts['In Review'] ?? 0, icon: Eye, color: '#003366', border: 'border-blue-200' },
          { label: 'Changes Requested', value: counts['Changes Requested'] ?? 0, icon: AlertTriangle, color: '#F97316', border: 'border-orange-200' },
          { label: 'Approved Today', value: (counts['Approved'] ?? 0) + (counts['Published'] ?? 0), icon: CheckCircle2, color: '#1D9E75', border: 'border-emerald-200' },
          { label: 'Rejected / Archived', value: counts['Rejected'] ?? 0, icon: ThumbsDown, color: '#E24B4A', border: 'border-rose-200' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-2xl border ${s.border} bg-white p-4 shadow-xs flex items-center gap-3.5 dark:border-slate-800 dark:bg-slate-900`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">{s.label}</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                filter === tab.key
                  ? 'bg-[#003366] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {tab.label}{' '}
              <span className={`ml-1 rounded-md px-1.5 py-0.5 text-[9px] ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                {counts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or department..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8.5 pr-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">All Content Types</option>
              <option value="Announcement">Announcements</option>
              <option value="Event">Events</option>
              <option value="Post">Alumni Posts</option>
              <option value="Page">Pages & Directives</option>
              <option value="Gallery">Gallery Albums</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── SPLIT WORKSPACE: QUEUE LIST ON LEFT, DETAIL REVIEWER ON RIGHT ── */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr] items-start">
        {/* Left: Queue List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <ShieldCheck className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No review submissions found</h3>
              <p className="text-xs text-slate-400 mt-1">There are no items matching your current filters in the pipeline.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`group cursor-pointer rounded-2xl border bg-white p-4.5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${
                  selected?.id === item.id
                    ? 'border-[#003366] ring-2 ring-[#003366]/20 dark:border-sky-500'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusStyles[item.status]}`}>{item.status}</span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${priorityStyles[item.priority]}`}>{item.priority}</span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.type}</span>
                      {(item.department?.toLowerCase().includes('registrar') || item.author?.toLowerCase().includes('registrar')) && (
                        <span className="rounded-md bg-purple-50 border border-purple-200 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                          Registrar Submission
                        </span>
                      )}
                      {item.department && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[160px]">• {item.department}</span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#003366] transition-colors">{item.title}</h3>

                    {item.excerpt && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.excerpt}</p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium"><User className="h-3 w-3" /> {item.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.submittedAt}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due: {item.dueDate}</span>
                      {item.comments.length > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-sky-400">
                          <MessageSquare className="h-3 w-3" /> {item.comments.length}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500">Stage {item.stage}/{item.totalStages}</span>
                      <div className="flex-1 max-w-[200px] h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-[#003366] transition-all"
                          style={{ width: `${(item.stage / item.totalStages) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, item.title); }}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Delete review submission"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#003366] transition-transform group-hover:translate-x-0.5 mt-2" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Reviewer Detail Drawer */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:sticky lg:top-4 self-start dark:border-slate-800 dark:bg-slate-900 space-y-5">
          {selected ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusStyles[selected.status]}`}>{selected.status}</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${priorityStyles[selected.priority]}`}>{selected.priority}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003366] dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    <Eye className="h-3 w-3" /> Preview Content
                  </button>
                </div>

                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{selected.title}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Submitted by <strong className="text-slate-700 dark:text-slate-300">{selected.author}</strong> ({selected.department || 'Alumni Office'}) • {selected.submittedAt}
                </p>
              </div>

              {/* Approval Pipeline Stages */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Approval Pipeline Progress</h3>
                  <span className="text-[10px] font-bold text-[#003366] dark:text-sky-300">Stage {selected.stage} of {selected.totalStages}</span>
                </div>

                <ol className="space-y-2">
                  {stageConfigs.slice(0, selected.totalStages).map((stg, idx) => {
                    const isPassed = idx + 1 < selected.stage;
                    const isCurrent = idx + 1 === selected.stage;
                    return (
                      <li key={stg.stage} className="flex items-center gap-2.5 text-xs">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            isPassed
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-[#003366] text-white animate-pulse'
                              : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                          }`}
                        >
                          {isPassed ? '' : stg.stage}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {stg.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{stg.role} ({stg.assignedTo})</p>
                        </div>
                        {isCurrent && (
                          <span className="rounded-md bg-blue-100 text-[#003366] dark:bg-blue-950/50 dark:text-sky-300 px-1.5 py-0.5 text-[9px] font-bold">
                            Active
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Review Activity Timeline */}
              <div>
                <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Review Activity & Feedback ({selected.comments.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selected.comments.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic p-2 rounded-lg bg-slate-50 dark:bg-slate-800">No reviewer notes or comments logged yet.</p>
                  ) : (
                    selected.comments.map((c) => (
                      <div
                        key={c.id}
                        className={`rounded-xl border p-2.5 text-xs ${
                          c.type === 'approval'
                            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : c.type === 'change_request'
                            ? 'border-orange-200 bg-orange-50/70 text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-300'
                            : c.type === 'rejection'
                            ? 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300'
                            : 'border-slate-200 bg-slate-50/70 text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold opacity-80 mb-1">
                          <span>{c.author}</span>
                          <span>{c.createdAt}</span>
                        </div>
                        <p className="leading-relaxed">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Comment / Reviewer Note Form */}
              <form onSubmit={handleAddComment}>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Log Reviewer Feedback Note</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Add reviewer notes, clarifications, or remarks..."
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#003366] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-[#003366] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </label>
              </form>

              {/* ── ACTION BUTTONS ── */}
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{selected.stage >= selected.totalStages ? 'Final Signoff' : 'Approve Stage'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChangeRequestModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-xs cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Request Changes</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#003366] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#002244] shadow-sm cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Approve & Publish Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRejectModalOpen(true)}
                  className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  <span>Reject Submission</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">Select an item from the queue to review.</div>
          )}
        </aside>
      </div>

      {/* ── 1. PREVIEW CONTENT MODAL ── */}
      {previewModalOpen && selected && (
        <AdminModal
          open={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title={`Content Submission Preview — ${selected.title}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusStyles[selected.status]}`}>{selected.status}</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{selected.type}</span>
              <span className="text-xs text-slate-500">Submitted by {selected.author} ({selected.department})</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{selected.title}</h3>
              {selected.excerpt && (
                <p className="mt-1 text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">{selected.excerpt}</p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1">Body Text / Submission Content:</h4>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-800 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                {selected.content || 'No detailed content body provided.'}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-500">Target Deadline: <strong>{selected.dueDate}</strong></span>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="rounded-xl bg-[#003366] text-white px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── 2. CONFIGURE STAGES MODAL ── */}
      {stagesModalOpen && (
        <AdminModal
          open={stagesModalOpen}
          onClose={() => setStagesModalOpen(false)}
          title="Approval Pipeline Stage Configuration"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Customize the multi-step verification sequence required for publishing official university content.
            </p>

            <div className="space-y-3">
              {stageConfigs.map((cfg, idx) => (
                <div key={cfg.stage} className="rounded-xl border border-slate-200 p-3 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#003366]">Stage {cfg.stage}</span>
                    <span className="text-[10px] text-slate-400">SLA: {cfg.slaHours} hours</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600">Stage Name</label>
                    <input
                      type="text"
                      value={cfg.name}
                      onChange={(e) => {
                        const updated = [...stageConfigs];
                        updated[idx].name = e.target.value;
                        setStageConfigs(updated);
                      }}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600">Assigned Role</label>
                      <input
                        type="text"
                        value={cfg.role}
                        onChange={(e) => {
                          const updated = [...stageConfigs];
                          updated[idx].role = e.target.value;
                          setStageConfigs(updated);
                        }}
                        className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600">Default Reviewer</label>
                      <input
                        type="text"
                        value={cfg.assignedTo}
                        onChange={(e) => {
                          const updated = [...stageConfigs];
                          updated[idx].assignedTo = e.target.value;
                          setStageConfigs(updated);
                        }}
                        className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setStagesModalOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  approvalService.saveStageConfigs(stageConfigs);
                  setStagesModalOpen(false);
                  toast.success('Approval stage configuration saved!');
                }}
                className="rounded-xl bg-[#003366] text-white px-4 py-2 text-xs font-bold"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── 3. SUBMIT FOR REVIEW MODAL ── */}
      {submitModalOpen && (
        <AdminModal
          open={submitModalOpen}
          onClose={() => setSubmitModalOpen(false)}
          title="Submit New Content for Governance Review"
          size="md"
        >
          <form onSubmit={handleCreateSubmission} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700">Submission Title *</label>
              <input
                type="text"
                required
                value={newSubmission.title}
                onChange={(e) => setNewSubmission({ ...newSubmission, title: e.target.value })}
                placeholder="e.g. Class of 2026 Reunion Gala Announcement"
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Content Type</label>
                <select
                  value={newSubmission.type}
                  onChange={(e) => setNewSubmission({ ...newSubmission, type: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                >
                  <option value="Announcement">Announcement</option>
                  <option value="Event">Event</option>
                  <option value="Post">Alumni Post</option>
                  <option value="Page">Institutional Page</option>
                  <option value="Gallery">Gallery Album</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Priority</label>
                <select
                  value={newSubmission.priority}
                  onChange={(e) => setNewSubmission({ ...newSubmission, priority: e.target.value as Priority })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-bold"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Department / Submitting Unit</label>
              <input
                type="text"
                value={newSubmission.department}
                onChange={(e) => setNewSubmission({ ...newSubmission, department: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Summary / Excerpt</label>
              <input
                type="text"
                value={newSubmission.excerpt}
                onChange={(e) => setNewSubmission({ ...newSubmission, excerpt: e.target.value })}
                placeholder="Brief one-sentence description..."
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Detailed Content Body</label>
              <textarea
                rows={3}
                value={newSubmission.content}
                onChange={(e) => setNewSubmission({ ...newSubmission, content: e.target.value })}
                placeholder="Write the full text or proposal details here..."
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#003366] text-white px-4 py-2 text-xs font-bold"
              >
                Submit to Pipeline
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* ── 4. REQUEST CHANGES MODAL ── */}
      {changeRequestModalOpen && selected && (
        <AdminModal
          open={changeRequestModalOpen}
          onClose={() => setChangeRequestModalOpen(false)}
          title={`Request Revisions — ${selected.title}`}
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Provide feedback to the author detailing what modifications are needed before this item can be approved.
            </p>
            <textarea
              rows={3}
              value={changeRequestReason}
              onChange={(e) => setChangeRequestReason(e.target.value)}
              placeholder="e.g. Please update the target registration link and verify the keynote speaker title..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs resize-none"
            />
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setChangeRequestModalOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestChanges}
                className="rounded-xl bg-amber-500 text-white px-4 py-1.5 text-xs font-bold"
              >
                Send Revision Request
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── 5. REJECT SUBMISSION MODAL ── */}
      {rejectModalOpen && selected && (
        <AdminModal
          open={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Submission — ${selected.title}`}
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-xs text-rose-600 font-medium">
              Are you sure you want to reject this submission? It will be marked as Rejected and archived.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide reason for rejection (e.g. Duplicate submission, violates policy #4...)"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs resize-none"
            />
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="rounded-xl bg-rose-600 text-white px-4 py-1.5 text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
