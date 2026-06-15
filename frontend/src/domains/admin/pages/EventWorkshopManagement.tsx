import React, { useCallback, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, CheckCircle2, ClipboardCheck, Edit3, Eye, Plus, QrCode, Search, TicketCheck, Trash2, Users, X, XCircle, Activity } from "lucide-react";
import toast from 'react-hot-toast';
import { useCmsListSection } from '../hooks/useCmsSection';
import { CmsSkeleton, CmsError } from '../components/CmsLoadingState';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../services/cmsService';
import type { EventItem, EventStatus, EventKind } from '../services/cmsService';

const categories = ['Career', 'Technical Training', 'Partnership', 'Employability', 'Research', 'Graduation'];

const statusClasses: Record<EventStatus, { badge: string; dot: string }> = {
  Open: { badge: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
  'Approval Required': { badge: 'border-amber-500/25 bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' },
  Closed: { badge: 'border-slate-500/25 bg-slate-500/10 text-slate-400', dot: 'bg-slate-500' },
};

export default function EventWorkshopManagement() {
  // Integration-ready: uses useCmsListSection with cmsService stubs
  // To connect to backend, update fetchEvents/createEvent/updateEvent/deleteEvent in cmsService.ts
  const {
    items: events,
    isLoading,
    error,
    refetch,
    add: addEvent,
    update: updateEventItem,
    remove: removeEvent,
  } = useCmsListSection<EventItem>(fetchEvents, {
    createFn: createEvent as any,
    updateFn: updateEvent as any,
    deleteFn: deleteEvent,
  });

  const [selectedKind, setSelectedKind] = useState<EventKind>('Event');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]);
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const filteredEvents = useMemo(() => {
    let items = events;
    if (selectedCategory !== 'All') items = items.filter(e => e.category === selectedCategory);
    if (search.trim()) items = items.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
    );
    return items;
  }, [events, selectedCategory, search]);

  const stats = useMemo(() => ({
    openRsvps: events.filter(e => e.status === 'Open').reduce((s, e) => s + e.rsvps, 0),
    pendingApprovals: events.filter(e => e.status === 'Approval Required').length,
    totalCheckins: events.reduce((s, e) => s + e.attendance, 0),
    totalEvents: events.length,
  }), [events]);

  const handleCreate = useCallback(() => {
    if (!formTitle.trim()) { toast.error('Title is required'); return; }
    if (!formDate) { toast.error('Date is required'); return; }
    addEvent({
      title: formTitle.trim(), kind: selectedKind, category: formCategory,
      date: formDate, rsvps: 0, attendance: 0, status: 'Open',
      location: formLocation.trim() || 'TBD',
    });
    setFormTitle(''); setFormDate(''); setFormLocation(''); setFormDescription(''); setShowCreate(false);
  }, [formTitle, formDate, formLocation, formCategory, selectedKind, addEvent]);

  const approveEvent = useCallback((id: string) => {
    updateEventItem(id, { status: 'Open' });
    const item = events.find(e => e.id === id);
    toast.success(`"${item?.title}" approved`);
  }, [events, updateEventItem]);

  const closeEvent = useCallback((id: string) => {
    updateEventItem(id, { status: 'Closed' });
    const item = events.find(e => e.id === id);
    toast.success(`"${item?.title}" closed`);
  }, [events, updateEventItem]);

  const handleDelete = useCallback((id: string) => {
    const item = events.find(e => e.id === id);
    removeEvent(id, item?.title);
  }, [events, removeEvent]);

  if (isLoading) return <CmsSkeleton rows={6} />;
  if (error) return <CmsError message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes ew-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .ew-fade-up { animation: ew-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .ew-hover { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .ew-hover:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,53,128,0.12); }
        .dark .ew-hover:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.35); }
        .ew-input { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; border-radius: 10px; padding: 10px 14px; font-size: 13px; outline: none; transition: border-color 0.2s; width: 100%; }
        .dark .ew-input { background: rgba(30,35,55,0.7); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; }
        .ew-input:focus { border-color: #003580; box-shadow: 0 0 0 3px rgba(0,53,128,0.1); }
        .dark .ew-input:focus { border-color: rgba(99,130,255,0.5); box-shadow: 0 0 0 3px rgba(99,130,255,0.1); }
        .ew-input::placeholder { color: #94a3b8; }
        .dark .ew-input::placeholder { color: rgba(148,163,184,0.5); }
        .ew-stat { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
        .dark .ew-stat { background: linear-gradient(135deg, rgba(30,35,55,0.9), rgba(22,28,45,0.9)); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(12px); }
        .ew-stat:hover { border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,53,128,0.12); }
        .dark .ew-stat:hover { border-color: rgba(255,255,255,0.14); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
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
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#34d399' }} />
                Registration Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>Event &amp; Workshop Management</h1>
            <p className="mt-2 text-sm leading-relaxed font-medium"
              style={{ color: 'rgba(255,255,255,0.80)' }}>Create events, manage RSVPs, approvals, attendance, and QR check-in.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 rounded-xl p-1"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
              {(['Event', 'Workshop'] as EventKind[]).map(kind => (
                <button key={kind} onClick={() => setSelectedKind(kind)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${selectedKind === kind ? 'bg-white shadow-md' : 'hover:opacity-80'}`}
                  style={{ color: selectedKind === kind ? '#003580' : '#ffffff' }}>
                  {kind}
                </button>
              ))}
            </div>
            <button onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
              style={{ background: '#E8A020', color: '#003580', boxShadow: '0 4px 20px rgba(232,160,32,0.35)' }}>
              <Plus className="h-4 w-4" /> New {selectedKind}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Open RSVPs', value: stats.openRsvps.toLocaleString(), icon: Users, color: '#6382ff', glow: 'rgba(99,130,255,0.2)' },
          { label: 'Pending Approvals', value: stats.pendingApprovals, icon: ClipboardCheck, color: '#fbbf24', glow: 'rgba(251,191,36,0.2)' },
          { label: 'QR Check-ins', value: stats.totalCheckins, icon: QrCode, color: '#34d399', glow: 'rgba(52,211,153,0.2)' },
          { label: 'Total Events', value: stats.totalEvents, icon: BarChart3, color: '#a78bfa', glow: 'rgba(167,139,250,0.2)' },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="ew-stat ew-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: metric.glow, boxShadow: `0 0 20px ${metric.glow}` }}>
                  <Icon className="h-5 w-5" style={{ color: metric.color }} />
                </div>
                <span className="text-2xl font-bold text-white">{metric.value}</span>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: metric.color }}>{metric.label}</p>
            </div>
          );
        })}
      </section>

      {/* Create Form */}
      {showCreate && (
        <div className="ew-fade-up rounded-2xl border border-blue-500/20 bg-blue-500/6 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <h2 className="text-sm font-bold text-white">Create New {selectedKind}</h2>
            </div>
            <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/8 hover:text-slate-300 transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex gap-2">
              {(['Event', 'Workshop'] as EventKind[]).map(kind => (
                <button key={kind} type="button" onClick={() => setSelectedKind(kind)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all ${selectedKind === kind ? 'border-[#003580] bg-[#003580] text-white shadow-lg shadow-[#003580]/30' : 'border-white/10 bg-white/4 text-slate-400 hover:bg-white/8 hover:text-white'}`}>
                  {kind}
                </button>
              ))}
            </div>
            <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder={`${selectedKind} title`} className="ew-input" />
            <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="ew-input">
              {categories.map(c => <option key={c} style={{ background: '#1a1f35' }}>{c}</option>)}
            </select>
            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="ew-input" />
            <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Location / Venue" className="ew-input" />
            <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} placeholder="Description, eligibility, speaker details" className="ew-input sm:col-span-2 resize-none" />
            <button onClick={handleCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#0a4fa6] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-[#003580]/30">
              <Plus className="h-4 w-4" /> Create {selectedKind}
            </button>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setSelectedCategory('All')}
            className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${selectedCategory === 'All' ? 'bg-[#003580] text-white shadow-md shadow-[#003580]/30' : 'bg-white/6 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${selectedCategory === cat ? 'bg-[#003580] text-white shadow-md shadow-[#003580]/30' : 'bg-white/6 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="ew-input pl-9" />
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-2xl border border-white/8 bg-[#1a1f35]/80 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-sm font-bold text-white">Event Calendar & Registration Approval</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">Monitor calendar items, RSVP volume, attendance, and approval status.</p>
          </div>
          <button onClick={() => toast.success('Opening calendar view')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <CalendarDays className="h-4 w-4" /> Calendar View
          </button>
        </div>

        <div className="space-y-2">
          {filteredEvents.map((event, idx) => {
            const fillPercent = event.attendance > 0 && event.rsvps > 0 ? Math.round((event.attendance / event.rsvps) * 100) : 0;
            const sc = statusClasses[event.status];
            return (
              <div key={event.id}
                className="ew-hover ew-fade-up flex flex-col gap-2 rounded-xl border border-white/6 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${idx * 0.03}s` }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase ${event.kind === 'Event' ? 'bg-blue-500/15 text-blue-400' : 'bg-violet-500/15 text-violet-400'}`}>
                      {event.kind}
                    </span>
                    <h3 className="text-sm font-semibold text-white/90">{event.title}</h3>
                    <span className="text-[10px] text-slate-500">{event.location}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {event.date}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.rsvps.toLocaleString()} RSVPs</span>
                    {event.attendance > 0 && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <TicketCheck className="w-3 h-3" /> {event.attendance} ({fillPercent}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${sc.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                    {event.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toast.success(`Previewing "${event.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-white/10 hover:text-white transition-all" title="Preview">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast.success(`Editing "${event.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all" title="Edit">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {event.status === 'Approval Required' && (
                      <button onClick={() => approveEvent(event.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Approve">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {event.status === 'Open' && (
                      <button onClick={() => closeEvent(event.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all" title="Close">
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => toast.success(`QR check-in for "${event.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-white/10 hover:text-white transition-all" title="QR Check-in">
                      <QrCode className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast.success(`Attendance tracking for "${event.title}"`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 hover:bg-white/10 hover:text-white transition-all" title="Track Attendance">
                      <TicketCheck className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(event.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/8 text-rose-400 hover:bg-rose-500/20 transition-all" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                <CalendarDays className="h-8 w-8 text-slate-600" />
              </div>
              <p className="mt-3 text-sm text-slate-500">No {selectedCategory !== 'All' ? selectedCategory.toLowerCase() : ''} events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
