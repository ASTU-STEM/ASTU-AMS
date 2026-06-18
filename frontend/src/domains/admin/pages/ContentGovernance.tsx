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
  Published: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  Scheduled: 'border-blue-500/25 bg-blue-500/10 text-blue-400',
  Pinned: 'border-violet-500/25 bg-violet-500/10 text-violet-400',
  Draft: 'border-slate-500/25 bg-slate-500/10 text-slate-400',
  'Needs Review': 'border-amber-500/25 bg-amber-500/10 text-amber-400',
};

const audienceClasses: Record<Audience, string> = {
  Public: 'bg-slate-500/15 text-slate-300',
  Internal: 'bg-indigo-500/15 text-indigo-300',
  Emergency: 'bg-rose-500/15 text-rose-300',
  Department: 'bg-cyan-500/15 text-cyan-300',
  Alumni: 'bg-emerald-500/15 text-emerald-300',
  Employer: 'bg-amber-500/15 text-amber-300',
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
    setHeadline(''); setBody(''); setShowEditor(false);
    toast.success(`"${newItem.title}" published to ${audience}`);
  }, [headline, body, audience, announcements.length]);

  const scheduleAnn = useCallback(() => {
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
    setHeadline(''); setBody(''); setShowEditor(false);
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
        @keyframes cg-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cg-slide-in { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .cg-fade-up { animation: cg-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .cg-slide-in { animation: cg-slide-in 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .cg-card-hover { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .cg-card-hover:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,53,128,0.12); }
        .dark .cg-card-hover:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.35); }
        .cg-input { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
        .dark .cg-input { background: rgba(30,35,55,0.7); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; }
        .cg-input:focus { border-color: #003580; box-shadow: 0 0 0 3px rgba(0,53,128,0.12); }
        .dark .cg-input:focus { border-color: rgba(99,130,255,0.5); box-shadow: 0 0 0 3px rgba(99,130,255,0.12); }
        .cg-input::placeholder { color: #94a3b8; }
        .dark .cg-input::placeholder { color: rgba(148,163,184,0.5); }
        .cg-stat-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
        .dark .cg-stat-card { background: linear-gradient(135deg, rgba(30,35,55,0.9) 0%, rgba(22,28,45,0.9) 100%); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(12px); }
        .cg-stat-card:hover { border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,53,128,0.12); }
        .dark .cg-stat-card:hover { border-color: rgba(255,255,255,0.14); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
      `}</style>

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 12px 48px rgba(0,53,128,0.40)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.12), transparent)' }} />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.18)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#E8A020' }} />
                Editorial Controls
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>News, Announcements &amp; Community</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium"
              style={{ color: 'rgba(255,255,255,0.80)' }}>
              Govern public news, internal notices, emergency alerts, scheduled publishing, and feed moderation.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
              style={{ background: '#E8A020', color: '#003580', boxShadow: '0 4px 20px rgba(232,160,32,0.35)' }}
            >
              <Plus className="h-4 w-4" /> New Announcement
            </button>
          </div>
        </div>
        {/* Stat chips in header */}
        <div className="relative mt-6 flex flex-wrap gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.25rem' }}>
          {[
            { label: 'Total Views', value: stats.totalViews.toLocaleString() },
            { label: 'Scheduled', value: stats.scheduled },
            { label: 'Pinned', value: stats.pinned },
            { label: 'Reported', value: stats.reported },
          ].map(chip => (
            <div key={chip.label} className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.60)' }}>{chip.label}</span>
              <span className="text-sm font-bold" style={{ color: '#ffffff' }}>{chip.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Scheduled Publishing', value: stats.scheduled, icon: CalendarClock, color: '#003580', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800/40' },
          { label: 'Pinned Notices', value: stats.pinned, icon: Pin, color: '#7c3aed', bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-800/40' },
          { label: 'Reported Items', value: stats.reported, icon: MessageSquareWarning, color: '#e24b4a', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800/40' },
          { label: 'Approved Posts', value: stats.approved, icon: ShieldCheck, color: '#1D9E75', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40' },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`cg-fade-up group relative overflow-hidden rounded-2xl border ${metric.border} ${metric.bg} p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300`} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${metric.color}18`, color: metric.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{metric.value}</span>
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{metric.label}</p>
            </div>
          );
        })}
      </section>

      {/* Tab Selector + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-[#1a1f35]/80 p-1.5 backdrop-blur-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                selectedTab === tab.key
                  ? 'bg-gradient-to-r from-[#003580] to-[#0a4fa6] text-white shadow-lg shadow-[#003580]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.key === 'announcements' ? <Megaphone className="h-3.5 w-3.5" /> : <MessageSquareWarning className="h-3.5 w-3.5" />}
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${selectedTab === tab.key ? 'bg-white/20 text-white' : 'bg-white/8 text-slate-400'}`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search content..."
            className="cg-input pl-9"
          />
        </div>
      </div>

      {selectedTab === 'announcements' && (
        <section className="grid gap-4 xl:grid-cols-[440px_1fr]">
          {/* Editor Panel */}
          {(showEditor || editingId) && (
            <div className="cg-slide-in rounded-2xl border border-white/8 bg-[#1a1f35]/90 p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003580]/30">
                    <Newspaper className="h-4.5 w-4.5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Announcement Editor</h2>
                    <p className="text-[10px] text-slate-500">Compose and publish</p>
                  </div>
                </div>
                <button onClick={() => { setShowEditor(false); setEditingId(null); }} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/8 hover:text-slate-300 transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <select
                  value={audience}
                  onChange={e => setAudience(e.target.value as Audience)}
                  className="cg-input"
                >
                  {(['Public', 'Internal', 'Emergency', 'Department', 'Alumni', 'Employer'] as Audience[]).map(opt => (
                    <option key={opt} style={{ background: '#1a1f35' }}>{opt}</option>
                  ))}
                </select>
                <input
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="Announcement headline"
                  className="cg-input"
                />
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={4}
                  placeholder="Compose announcement body..."
                  className="cg-input resize-none"
                />
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-white/12 bg-white/4 px-4 py-3 text-sm text-slate-400 hover:border-blue-500/30 hover:text-slate-300 transition-all">
                  <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4" /> Attach PDF notice</span>
                  <input type="file" accept="application/pdf" className="sr-only" onChange={() => toast.success('PDF attached')} />
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={scheduleAnn} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all">
                    <CalendarClock className="h-4 w-4" /> Schedule
                  </button>
                  <button onClick={publish} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#0a4fa6] px-3 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-[#003580]/30">
                    <Send className="h-4 w-4" /> Publish Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Announcement List */}
          <div className={`${showEditor || editingId ? '' : 'xl:col-span-2'} rounded-2xl border border-white/8 bg-[#1a1f35]/80 p-5 backdrop-blur-sm`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white">Announcement Management</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Filter by audience · {filteredAnnouncements.length} items</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['Public', 'Internal', 'Emergency', 'Department', 'Alumni', 'Employer'] as Audience[]).map(a => (
                  <button key={a} type="button" onClick={() => setAudience(a)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${audience === a ? 'bg-[#003580] text-white shadow-md shadow-[#003580]/30' : 'bg-white/6 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredAnnouncements.map((row, i) => (
                <div key={row.id}
                  className="cg-card-hover flex flex-col gap-2 rounded-xl border border-white/6 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white/90">{row.title}</h3>
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${audienceClasses[row.audience]}`}>{row.audience}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" /> {row.owner}</span>
                      <span>{row.updated}</span>
                      {row.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {row.views.toLocaleString()}</span>}
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
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-white/10 hover:text-white transition-all" title="Preview">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => { setHeadline(row.title); setAudience(row.audience); setShowEditor(true); setEditingId(row.id); }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all" title="Edit">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      {row.status !== 'Pinned' && (
                        <button onClick={() => changeStatus(row.id, 'Pinned')}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all" title="Pin">
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {row.status === 'Draft' && (
                        <button onClick={() => changeStatus(row.id, 'Published')}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Publish">
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => deleteAnnouncement(row.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/8 text-rose-400 hover:bg-rose-500/20 transition-all" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAnnouncements.length === 0 && (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                    <Megaphone className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">No announcements match your filter.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {selectedTab === 'community' && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCommunity.map((row, idx) => (
            <div key={row.id}
              className="cg-card-hover cg-fade-up rounded-2xl border border-white/8 bg-[#1a1f35]/80 p-5 backdrop-blur-sm"
              style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {row.pinned && <Pin className="h-3.5 w-3.5 text-violet-400 shrink-0" />}
                    <h3 className="text-sm font-semibold text-white/90 truncate">{row.title}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{row.author} · {row.date}</p>
                </div>
                {row.reports > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/12 border border-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-400 shrink-0">
                    <AlertTriangle className="h-3 w-3" /> {row.reports} reports
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/12 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-white/6 flex flex-wrap gap-1.5">
                <button onClick={() => approvePost(row.id)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-all ${row.approved ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-400' : 'border-white/8 bg-white/4 text-slate-400 hover:bg-white/8 hover:text-white'}`}>
                  <CheckCircle2 className="h-3 w-3" /> {row.approved ? 'Approved' : 'Approve'}
                </button>
                <button onClick={() => togglePin(row.id)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-all ${row.pinned ? 'border-violet-500/30 bg-violet-500/12 text-violet-400' : 'border-white/8 bg-white/4 text-slate-400 hover:bg-white/8 hover:text-white'}`}>
                  <Pin className="h-3 w-3" /> {row.pinned ? 'Pinned' : 'Pin'}
                </button>
                <button onClick={() => toast.success(`Analytics for "${row.title}"`)}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/8 px-2.5 py-1.5 text-[10px] font-semibold text-blue-400 hover:bg-blue-500/15 transition-all">
                  <BarChart3 className="h-3 w-3" /> Analytics
                </button>
                <button onClick={() => deletePost(row.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/8 px-2.5 py-1.5 text-[10px] font-semibold text-rose-400 hover:bg-rose-500/15 transition-all">
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          ))}
          {filteredCommunity.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                <MessageSquareWarning className="h-8 w-8 text-slate-600" />
              </div>
              <p className="mt-3 text-sm text-slate-500">No community posts match your search.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
