import React, { useCallback, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  Globe,
  Megaphone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';

type NewsStatus = 'Published' | 'Draft' | 'Scheduled';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  status: NewsStatus;
  views: number;
  image: string;
}

const initialNews: NewsItem[] = [
  { id: 'N-001', title: 'New Engineering Lab Inaugurated', summary: 'ASTU opens a state-of-the-art engineering laboratory to support hands-on learning and research innovation.', date: '2026-05-28', category: 'Campus', status: 'Published', views: 1240, image: '/images/news/lab.jpg' },
  { id: 'N-002', title: 'ASTU Research Grant Winners Announced', summary: 'Five faculty members awarded research grants for projects in AI, renewable energy, and water engineering.', date: '2026-05-20', category: 'Research', status: 'Published', views: 892, image: '/images/news/research.jpg' },
  { id: 'N-003', title: 'Annual Career Expo 2026', summary: 'Over 50 employers to participate in the largest career fair in ASTU history. Register now.', date: '2026-06-05', category: 'Events', status: 'Scheduled', views: 2100, image: '/images/news/career.jpg' },
  { id: 'N-004', title: 'Alumni Mentorship Program Launch', summary: 'New program connecting current students with successful alumni mentors across industries.', date: '2026-06-01', category: 'Alumni', status: 'Published', views: 567, image: '/images/news/mentorship.jpg' },
  { id: 'N-005', title: 'Partnership with Ethiopian Airlines', summary: 'ASTU signs MoU with Ethiopian Airlines for internship and research collaboration.', date: '2026-05-15', category: 'Partnership', status: 'Published', views: 3401, image: '/images/news/partnership.jpg' },
  { id: 'N-006', title: 'Summer Bootcamp Registration Open', summary: 'Coding, robotics, and data science bootcamps for ASTU students and recent graduates.', date: '2026-06-10', category: 'Events', status: 'Draft', views: 0, image: '/images/news/bootcamp.jpg' },
];

const categories = ['All', 'Campus', 'Research', 'Events', 'Alumni', 'Partnership', 'Academic'];

export default function LatestNewsManagement() {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formCategory, setFormCategory] = useState('Campus');
  const [formDate, setFormDate] = useState('');

  const filteredNews = useMemo(() => {
    let items = news;
    if (filterCat !== 'All') items = items.filter(n => n.category === filterCat);
    if (search.trim()) items = items.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [news, filterCat, search]);

  const stats = useMemo(() => ({
    total: news.length,
    published: news.filter(n => n.status === 'Published').length,
    draft: news.filter(n => n.status === 'Draft').length,
    totalViews: news.reduce((s, n) => s + n.views, 0),
  }), [news]);

  const createNews = useCallback(() => {
    if (!formTitle.trim() || !formSummary.trim()) { toast.error('Title and summary are required'); return; }
    const item: NewsItem = {
      id: `N-${String(news.length + 1).padStart(3, '0')}`,
      title: formTitle.trim(),
      summary: formSummary.trim(),
      date: formDate || new Date().toISOString().slice(0, 10),
      category: formCategory,
      status: 'Draft',
      views: 0,
      image: '/images/news/default.jpg',
    };
    setNews(prev => [item, ...prev]);
    setFormTitle(''); setFormSummary(''); setFormDate('');
    setShowCreate(false);
    toast.success(`News "${item.title}" created`);
  }, [formTitle, formSummary, formCategory, formDate, news.length]);

  const togglePublish = useCallback((id: string) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, status: n.status === 'Published' ? 'Draft' : 'Published' } : n));
    const item = news.find(n => n.id === id);
    toast.success(item?.status === 'Published' ? `"${item.title}" unpublished` : `"${item.title}" published`);
  }, [news]);

  const deleteNews = useCallback((id: string) => {
    const item = news.find(n => n.id === id);
    setNews(prev => prev.filter(n => n.id !== id));
    toast.success(`"${item?.title}" deleted`);
  }, [news]);

  return (
    <div className="space-y-6">
      <style>{`@keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .fade-up { animation: fade-up 0.35s ease-out both; }`}</style>

      <AdminPageHeader
        title="Latest News Management"
        subtitle="Create, edit, publish, and manage news articles displayed on the public homepage."
        breadcrumbs={[{ label: 'CMS' }, { label: 'Latest News' }]}
        actions={
          <button onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm">
            <Plus className="h-3.5 w-3.5" /> New Article
          </button>
        }
      />

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Articles', value: stats.total, icon: Megaphone, color: 'text-[#003580] bg-[#003580]/10' },
          { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-[#1D9E75] bg-[#1D9E75]/10' },
          { label: 'Drafts', value: stats.draft, icon: Edit3, color: 'text-slate-600 bg-slate-100' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-violet-600 bg-violet-100' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="fade-up rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </section>

      {/* Create Form */}
      {showCreate && (
        <div className="fade-up rounded-[12px] border border-blue-200 bg-blue-50/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">New News Article</h2>
            <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/50"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Article title" className="sm:col-span-2 rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
            <textarea value={formSummary} onChange={e => setFormSummary(e.target.value)} rows={3} placeholder="Article summary..."
              className="sm:col-span-2 rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] resize-none" />
            <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
              className="rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]">
              {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
            <button onClick={createNews} className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Create Article
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all ${filterCat === cat ? 'bg-[#003580] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news..." className="w-full rounded-[8px] border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#003580]" />
        </div>
      </div>

      {/* News Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredNews.map((item, idx) => (
          <div key={item.id} className="fade-up rounded-[12px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="h-36 bg-gradient-to-br from-[#003580]/20 to-[#1D9E75]/20 flex items-center justify-center">
              <Megaphone className="h-12 w-12 text-[#003580]/30" />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-[#003580]/10 px-2 py-0.5 text-[10px] font-semibold text-[#003580]">{item.category}</span>
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${item.status === 'Published' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                  {item.status === 'Published' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Edit3 className="h-3 w-3 mr-1" />}
                  {item.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.summary}</p>
              <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {item.date}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                <button onClick={() => togglePublish(item.id)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all ${item.status === 'Published' ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}>
                  {item.status === 'Published' ? <X className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {item.status === 'Published' ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => toast.success(`Editing "${item.title}"`)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => deleteNews(item.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 transition-all">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
