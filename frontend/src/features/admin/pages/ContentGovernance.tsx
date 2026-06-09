import React, { useCallback, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Pin,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';

type ContentStatus = 'Published' | 'Scheduled' | 'Pinned' | 'Draft' | 'Needs Review';
type Audience = 'Public' | 'Internal' | 'Emergency' | 'Department' | 'Alumni' | 'Employer';

interface Announcement {
  id: string;
  title: string;
  audience: Audience;
  status: ContentStatus;
  attachment: string;
  owner: string;
  updated: string;
  views: number;
}

interface CommunityPost {
  id: string;
  title: string;
  author: string;
  reports: number;
  action: string;
  approved: boolean;
  pinned: boolean;
  date: string;
}

const initialAnnouncements: Announcement[] = [
  { id: 'A-001', title: '2026 Tracer Study Wave Opens', audience: 'Alumni', status: 'Pinned', attachment: 'PDF', owner: 'Alumni Office', updated: '2 hours ago', views: 1240 },
  { id: 'A-002', title: 'Campus Career Fair Safety Notice', audience: 'Emergency', status: 'Published', attachment: 'None', owner: 'Security Center', updated: '1 day ago', views: 3892 },
  { id: 'A-003', title: 'Employer Partnership Roundtable', audience: 'Employer', status: 'Scheduled', attachment: 'PDF', owner: 'Industry Liaison', updated: 'Jun 8, 2026', views: 0 },
  { id: 'A-004', title: 'Department KPI Review Week', audience: 'Department', status: 'Draft', attachment: 'None', owner: 'Academic Affairs', updated: 'Yesterday', views: 0 },
  { id: 'A-005', title: 'Alumni Mentorship Program Launch', audience: 'Alumni', status: 'Published', attachment: 'PDF', owner: 'Alumni Office', updated: '3 days ago', views: 876 },
  { id: 'A-006', title: 'System Maintenance Weekend Notice', audience: 'Internal', status: 'Scheduled', attachment: 'None', owner: 'ICT Directorate', updated: 'Jun 10, 2026', views: 0 },
  { id: 'A-007', title: 'Research Grant Application Deadline', audience: 'Department', status: 'Needs Review', attachment: 'PDF', owner: 'Research Directorate', updated: '5 hours ago', views: 0 },
  { id: 'A-008', title: 'Public Holiday Notice', audience: 'Public', status: 'Published', attachment: 'None', owner: 'Admin Office', updated: '1 week ago', views: 5601 },
];

const initialCommunity: CommunityPost[] = [
  { id: 'P-001', title: 'Graduate startup hiring interns', author: 'Helina Sileshi', reports: 0, action: 'Feature post', approved: true, pinned: false, date: '2 hours ago' },
  { id: 'P-002', title: 'Unverified certificate link shared', author: 'Community Member', reports: 4, action: 'Review report', approved: false, pinned: false, date: '1 day ago' },
  { id: 'P-003', title: 'Research collaboration request', author: 'Mechanical Alumni Chapter', reports: 0, action: 'Pin post', approved: true, pinned: true, date: '3 days ago' },
  { id: 'P-004', title: 'Duplicate job advertisement', author: 'Employer Partner', reports: 2, action: 'Moderate comments', approved: false, pinned: false, date: '5 days ago' },
  { id: 'P-005', title: 'Alumni meetup photo shared', author: 'Class of 2020', reports: 0, action: 'Approve', approved: true, pinned: false, date: '6 hours ago' },
  { id: 'P-006', title: 'Suspicious account posting links', author: 'New Member', reports: 7, action: 'Review report', approved: false, pinned: false, date: '30 min ago' },
];

const statusClasses: Record<ContentStatus, string> = {
  Published: 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]',
  Scheduled: 'border-[#003580]/20 bg-[#003580]/10 text-[#003580]',
  Pinned: 'border-violet-200 bg-violet-100 text-violet-700',
  Draft: 'border-slate-200 bg-slate-100 text-slate-600',
  'Needs Review': 'border-[#E8A020]/20 bg-[#E8A020]/10 text-[#B87900]',
};

const audienceClasses: Record<Audience, string> = {
  Public: 'bg-slate-100 text-slate-700',
  Internal: 'bg-indigo-100 text-indigo-700',
  Emergency: 'bg-rose-100 text-rose-700',
  Department: 'bg-cyan-100 text-cyan-700',
  Alumni: 'bg-emerald-100 text-emerald-700',
  Employer: 'bg-amber-100 text-amber-700',
};

export default function ContentGovernance() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [community, setCommunity] = useState<CommunityPost[]>(initialCommunity);
  const [audience, setAudience] = useState<Audience>('Public');
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'announcements' | 'community'>('announcements');
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredAnnouncements = useMemo(() => {
    let items = announcements;
    if (audience !== 'Public') {
      items = items.filter(row => row.audience === audience || row.audience === 'Emergency');
    }
    if (search.trim()) {
      items = items.filter(row => row.title.toLowerCase().includes(search.toLowerCase()));
    }
    return items;
  }, [announcements, audience, search]);

  const filteredCommunity = useMemo(() => {
    if (!search.trim()) return community;
    return community.filter(row =>
      row.title.toLowerCase().includes(search.toLowerCase()) ||
      row.author.toLowerCase().includes(search.toLowerCase())
    );
  }, [community, search]);

  const stats = useMemo(() => ({
    scheduled: announcements.filter(a => a.status === 'Scheduled').length,
    pinned: announcements.filter(a => a.status === 'Pinned').length,
    reported: community.filter(c => c.reports > 0).length,
    approved: community.filter(c => c.approved).length,
    totalViews: announcements.reduce((s, a) => s + a.views, 0),
  }), [announcements, community]);

  const publish = useCallback(() => {
    if (!headline.trim()) { toast.error('Headline is required'); return; }
    const newItem: Announcement = {
      id: `A-${String(announcements.length + 1).padStart(3, '0')}`,
      title: headline.trim(),
      audience,
      status: 'Published',
      attachment: body.trim() ? 'Text' : 'None',
      owner: 'Content Manager',
      updated: 'Just now',
      views: 0,
    };
    setAnnouncements(prev => [newItem, ...prev]);
    setHeadline('');
    setBody('');
    setShowEditor(false);
    toast.success(`"${newItem.title}" published to ${audience}`);
  }, [headline, body, audience, announcements.length]);

  const schedule = useCallback(() => {
    if (!headline.trim()) { toast.error('Headline is required'); return; }
    const newItem: Announcement = {
      id: `A-${String(announcements.length + 1).padStart(3, '0')}`,
      title: headline.trim(),
      audience,
      status: 'Scheduled',
      attachment: body.trim() ? 'Text' : 'None',
      owner: 'Content Manager',
      updated: 'Just now',
      views: 0,
    };
    setAnnouncements(prev => [newItem, ...prev]);
    setHeadline('');
    setBody('');
    setShowEditor(false);
    toast.success(`"${newItem.title}" scheduled`);
  }, [headline, body, audience, announcements.length]);

  const changeStatus = useCallback((id: string, newStatus: ContentStatus) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status: newStatus, updated: 'Just now' } : a));
    toast.success(`Status updated to ${newStatus}`);
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    const item = announcements.find(a => a.id === id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success(`"${item?.title}" deleted`);
  }, [announcements]);

  const togglePin = useCallback((id: string) => {
    setCommunity(prev => prev.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p));
    const post = community.find(p => p.id === id);
    toast.success(post?.pinned ? 'Post unpinned' : 'Post pinned');
  }, [community]);

  const approvePost = useCallback((id: string) => {
    setCommunity(prev => prev.map(p => p.id === id ? { ...p, approved: !p.approved } : p));
    const post = community.find(p => p.id === id);
    toast.success(post?.approved ? 'Post unapproved' : 'Post approved');
  }, [community]);

  const deletePost = useCallback((id: string) => {
    const post = community.find(p => p.id === id);
    setCommunity(prev => prev.filter(p => p.id !== id));
    toast.success(`"${post?.title}" removed from feed`);
  }, [community]);

  const tabs = [
    { key: 'announcements' as const, label: 'Announcements', count: announcements.length },
    { key: 'community' as const, label: 'Community Feed', count: community.length },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .fade-up { animation: fade-up 0.35s ease-out both; }
        .fade-up:nth-child(2) { animation-delay: 0.05s; }
        .fade-up:nth-child(3) { animation-delay: 0.1s; }
        .fade-up:nth-child(4) { animation-delay: 0.15s; }
      `}</style>

      <AdminPageHeader
        title="News, Announcements & Community"
        subtitle="Govern public news, internal notices, emergency alerts, scheduled publishing, pinned announcements, feed approvals, and comment moderation."
        breadcrumbs={[{ label: 'CMS' }, { label: 'News & Community' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="info">Editorial Controls</AdminBadge>
            <button onClick={() => setShowEditor(!showEditor)}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm">
              <Plus className="h-3.5 w-3.5" /> New Announcement
            </button>
          </div>
        }
      />

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Scheduled Publishing', value: stats.scheduled, icon: CalendarClock, color: 'text-[#003580] bg-[#003580]/10' },
          { label: 'Pinned Notices', value: stats.pinned, icon: Pin, color: 'text-violet-700 bg-violet-100' },
          { label: 'Reported Items', value: stats.reported, icon: MessageSquareWarning, color: 'text-[#E24B4A] bg-[#E24B4A]/10' },
          { label: 'Approved Posts', value: stats.approved, icon: ShieldCheck, color: 'text-[#1D9E75] bg-[#1D9E75]/10' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="fade-up rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] ${metric.color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
            </div>
          );
        })}
      </section>

      {/* Tab Selector + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTab(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-xs font-semibold transition-all ${
                selectedTab === tab.key ? 'bg-[#003580] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.key === 'announcements' ? <Megaphone className="h-3.5 w-3.5" /> : <MessageSquareWarning className="h-3.5 w-3.5" />}
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${
                selectedTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..." className="w-full rounded-[8px] border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10" />
        </div>
      </div>

      {selectedTab === 'announcements' && (
        <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
          {/* Editor Panel */}
          {(showEditor || editingId) && (
            <div className="fade-up rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-[#003580]" />
                  <h2 className="text-sm font-semibold text-slate-900">Rich Text Announcement Editor</h2>
                </div>
                <button onClick={() => { setShowEditor(false); setEditingId(null); }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 space-y-3">
                <select value={audience} onChange={e => setAudience(e.target.value as Audience)}
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]">
                  {(['Public', 'Internal', 'Emergency', 'Department', 'Alumni', 'Employer'] as Audience[]).map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Announcement headline"
                  className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Compose announcement body with links, headings, and publication metadata..."
                  className="min-h-32 w-full rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] resize-none" />
                <label className="flex cursor-pointer items-center justify-between rounded-[8px] border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 hover:border-[#003580]/30 transition-all">
                  <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4" /> Attach PDF notice</span>
                  <input type="file" accept="application/pdf" className="sr-only" onChange={() => toast.success('PDF attached')} />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={schedule}
                    className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">
                    <CalendarClock className="h-4 w-4" /> Schedule
                  </button>
                  <button onClick={publish}
                    className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-3 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm">
                    <Send className="h-4 w-4" /> Publish Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Announcement Table */}
          <div className={`${showEditor || editingId ? '' : 'xl:col-span-2'} rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Announcement Management</h2>
                <p className="mt-1 text-xs text-slate-500">Filter by audience to see relevant announcements.</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['Public', 'Internal', 'Emergency', 'Department', 'Alumni', 'Employer'] as Audience[]).map(a => (
                  <button key={a} type="button" onClick={() => setAudience(a)}
                    className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition-all ${audience === a ? 'bg-[#003580] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {filteredAnnouncements.map((row) => (
                <div key={row.id} className="flex flex-col gap-2 rounded-[10px] border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-slate-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900">{row.title}</h3>
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${audienceClasses[row.audience]}`}>{row.audience}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" /> {row.owner}</span>
                      <span>{row.updated}</span>
                      {row.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {row.views}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusClasses[row.status]}`}>
                      {row.status === 'Pinned' && <Pin className="h-3 w-3 mr-1 inline" />}
                      {row.status === 'Published' && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                      {row.status === 'Scheduled' && <CalendarClock className="h-3 w-3 mr-1 inline" />}
                      {row.status === 'Draft' && <FileText className="h-3 w-3 mr-1 inline" />}
                      {row.status === 'Needs Review' && <AlertTriangle className="h-3 w-3 mr-1 inline" />}
                      {row.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toast.success(`Previewing "${row.title}"`)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 transition-all" title="Preview"><Eye className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { setHeadline(row.title); setAudience(row.audience); setShowEditor(true); setEditingId(row.id); }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                      {row.status !== 'Pinned' && (
                        <button onClick={() => changeStatus(row.id, 'Pinned')}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-violet-200 bg-violet-50 text-violet-500 hover:bg-violet-100 transition-all" title="Pin"><Pin className="h-3.5 w-3.5" /></button>
                      )}
                      {row.status === 'Draft' && (
                        <button onClick={() => changeStatus(row.id, 'Published')}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all" title="Publish"><Send className="h-3.5 w-3.5" /></button>
                      )}
                      <button onClick={() => deleteAnnouncement(row.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-100 bg-rose-50 text-rose-400 hover:bg-rose-100 transition-all" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAnnouncements.length === 0 && (
                <div className="py-8 text-center">
                  <Megaphone className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No announcements match your filter.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {selectedTab === 'community' && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCommunity.map((row, idx) => (
            <div key={row.id} className="fade-up rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:shadow-md"
              style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {row.pinned && <Pin className="h-3.5 w-3.5 text-violet-500" />}
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{row.title}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{row.author} · {row.date}</p>
                </div>
                {row.reports > 0 ? (
                  <div className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600">
                    <AlertTriangle className="h-3 w-3" /> {row.reports}
                  </div>
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-[#1D9E75] shrink-0" />
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                <button onClick={() => approvePost(row.id)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold transition-all ${row.approved ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                  <CheckCircle2 className="h-3 w-3" /> {row.approved ? 'Approved' : 'Approve'}
                </button>
                <button onClick={() => togglePin(row.id)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold transition-all ${row.pinned ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                  <Pin className="h-3 w-3" /> {row.pinned ? 'Pinned' : 'Pin'}
                </button>
                <button onClick={() => toast.success(`Analytics for "${row.title}"`)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#003580]/15 bg-[#003580]/5 px-2.5 py-1.5 text-[10px] font-semibold text-[#003580] hover:bg-[#003580]/10 transition-all">
                  <BarChart3 className="h-3 w-3" /> Analytics
                </button>
                <button onClick={() => deletePost(row.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 transition-all">
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
