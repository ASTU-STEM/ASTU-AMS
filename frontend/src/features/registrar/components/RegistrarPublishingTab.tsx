import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Megaphone,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Send,
  Building2,
  MapPin,
  Sparkles,
  Users,
  ChevronRight,
  MessageSquare,
  X,
} from 'lucide-react';
import approvalService, { WorkflowItem, Priority } from '../../admin/services/approval.service';

interface RegistrarPublishingTabProps {
  registrarName?: string;
  darkMode?: boolean;
}

export const RegistrarPublishingTab: React.FC<RegistrarPublishingTabProps> = ({
  registrarName = 'Office of the Registrar',
  darkMode = false,
}) => {
  const [items, setItems] = useState<WorkflowItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('Announcement');
  const [formPriority, setFormPriority] = useState<Priority>('Normal');
  const [formEventDate, setFormEventDate] = useState('');
  const [formEventLocation, setFormEventLocation] = useState('');
  const [formTargetAudience, setFormTargetAudience] = useState('All Actors');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');

  const loadItems = () => {
    const all = approvalService.getItems();
    // Show all items originating from Registrar or all public items
    const registrarItems = all.filter(
      (i) => (i.department || '').toLowerCase().includes('registrar') || (i.author || '').toLowerCase().includes('registrar')
    );
    setItems(registrarItems);
  };

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener('astu-cms-approval-changed', handleUpdate);
    window.addEventListener('astu-broadcast-announcement-updated', handleUpdate);
    return () => {
      window.removeEventListener('astu-cms-approval-changed', handleUpdate);
      window.removeEventListener('astu-broadcast-announcement-updated', handleUpdate);
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter !== 'all') {
        if (filter === 'pending' && item.status !== 'Pending Review' && item.status !== 'In Review') return false;
        if (filter === 'published' && item.status !== 'Published') return false;
        if (filter === 'changes' && item.status !== 'Changes Requested') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.excerpt || '').toLowerCase().includes(q) ||
          (item.content || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, filter, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please specify a title for the announcement or event.');
      return;
    }
    if (!formContent.trim()) {
      toast.error('Please provide announcement/event details.');
      return;
    }

    approvalService.submitRegistrarItem({
      title: formTitle,
      type: formType,
      priority: formPriority,
      eventDate: formEventDate || undefined,
      eventLocation: formEventLocation || undefined,
      targetAudience: formTargetAudience,
      excerpt: formExcerpt || formContent.slice(0, 160) + '...',
      content: formContent,
      author: registrarName,
    });

    toast.success('Submitted for Alumni Relations Officer approval!');
    setComposeModalOpen(false);
    // Reset form
    setFormTitle('');
    setFormExcerpt('');
    setFormContent('');
    setFormEventDate('');
    setFormEventLocation('');
    loadItems();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Live Broadcast
          </span>
        );
      case 'Pending Review':
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            Awaiting Alumni Officer
          </span>
        );
      case 'Changes Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
            Revision Requested
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Clear Approval Workflow Notice */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-astu-navy via-[#003366] to-[#002244] p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-astu-green/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#FFCC00] border border-white/20 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Two-Way Governance & Verification
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Registrar Publishing & Bulletin Desk
            </h2>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Submit official academic directives, graduation schedules, degree clearance notices, and registrar events.
              To maintain university brand consistency, every submission is reviewed by the{' '}
              <strong className="text-emerald-300">Alumni Relations Officer</strong> before broadcasting live on all
              dashboard hero sections.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setComposeModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Submit New Announcement / Event
          </button>
        </div>
      </section>

      {/* Control Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: `All Bulletins (${items.length})` },
            { id: 'pending', label: 'Awaiting Alumni Officer' },
            { id: 'published', label: 'Live Broadcasts' },
            { id: 'changes', label: 'Revisions Requested' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-astu-navy text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search registrar notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
          />
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Megaphone className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No submissions found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Draft your first university notice, event, or clearance announcement to route it for Alumni Officer approval.
            </p>
            <button
              onClick={() => setComposeModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-astu-navy text-white text-xs font-bold shadow-xs hover:bg-[#002244]"
            >
              <Plus className="h-3.5 w-3.5" /> Compose Now
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#003366]/10 text-[#003366] dark:text-sky-300">
                      {item.type}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Submitted: {item.submittedAt}
                    </span>
                    <span className="text-[10px] text-slate-400">• Audience: {item.targetAudience || 'All Actors'}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {item.excerpt || item.content}
              </p>

              {/* Event details if applicable */}
              {(item.eventDate || item.eventLocation) && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                  {item.eventDate && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Calendar className="h-3.5 w-3.5" /> Event Date: {item.eventDate}
                    </span>
                  )}
                  {item.eventLocation && (
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-astu-green" /> {item.eventLocation}
                    </span>
                  )}
                </div>
              )}

              {/* Approval status banner / feedback */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>
                    Reviewer: <strong>{item.reviewer || 'Alumni Relations Officer'}</strong>
                  </span>
                  {item.approvedByOfficer && (
                    <span className="text-emerald-600 font-bold">• Approved by {item.approvedByOfficer}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-astu-navy dark:text-sky-400 hover:underline"
                >
                  <Eye className="h-3.5 w-3.5" /> View Workflow & Timeline ({item.comments?.length || 0} logs)
                </button>
              </div>

              {/* Change request alert banner if applicable */}
              {item.status === 'Changes Requested' && (
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs text-orange-800 dark:text-orange-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Alumni Officer Note: </span>
                    {item.comments[item.comments.length - 1]?.text || 'Corrections requested.'}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Compose Modal */}
      {composeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  New Registrar Bulletin
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Draft Announcement or Event
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This bulletin will be dispatched to the Alumni Relations Officer for approval before publishing live.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComposeModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bulletin Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Degree Clearance Window for 2026 Graduating Cohort"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Classification
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Event">Event / Gathering</option>
                    <option value="Notice">Academic Directive</option>
                    <option value="Clearance">Graduation Clearance</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Actors
                  </label>
                  <select
                    value={formTargetAudience}
                    onChange={(e) => setFormTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="All Actors">All Actors (Alumni, Employers, Depts)</option>
                    <option value="Alumni Only">Alumni Network</option>
                    <option value="Employers">Corporate Partners</option>
                    <option value="Graduating Seniors">Graduating Students</option>
                  </select>
                </div>
              </div>

              {formType === 'Event' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Event Date & Schedule
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. May 20, 2026 - 10:00 AM"
                      value={formEventDate}
                      onChange={(e) => setFormEventDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Campus Venue / Virtual Link
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ASTU Graduation Pavilion / Zoom"
                      value={formEventLocation}
                      onChange={(e) => setFormEventLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brief Summary (Hero Banner Excerpt)
                </label>
                <input
                  type="text"
                  placeholder="One or two concise sentences that will appear on the other dashboard hero banners"
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Bulletin Content & Directives *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Write the complete official instructions, deadlines, links, and procedures..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Once submitted, this item will be placed in the <strong>Alumni Relations Officer Approval Queue</strong>.
                  Upon approval, it will automatically broadcast to the Alumni, Employer, and Department dashboards.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setComposeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#002244] hover:from-[#002244] hover:to-[#001830] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit for Alumni Officer Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Details & Workflow Timeline Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Workflow Record #{selectedItem.id}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Current Status:</span>
                <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Assigned Reviewer:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.reviewer}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Stage Progress:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Stage {selectedItem.stage} of {selectedItem.totalStages}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Bulletin Content</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-2xl whitespace-pre-line border border-slate-100 dark:border-slate-800">
                {selectedItem.content}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Approval Log & Officer Comments
              </h4>
              <div className="space-y-2">
                {selectedItem.comments?.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{c.author}</span>
                      <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarPublishingTab;
