import React, { useCallback, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  HelpCircle,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import { useCmsListSection } from '../hooks/useCmsSection';
import { CmsSkeleton, CmsError } from '../components/CmsLoadingState';
import { fetchFaqList, createFaq, updateFaq, deleteFaq } from '../services/cmsService';
import type { FaqEntry } from '../services/cmsService';

const categories = ['Account & Profile', 'Jobs & Careers', 'Mentorship', 'Documents & Transcripts', 'Tracer Surveys', 'Events & Networking', 'Technical Support', 'General'];

export default function FaqManagement() {

  // Integration-ready: uses useCmsListSection with cmsService stubs
  // To connect to backend, update fetchFaqList/createFaq/updateFaq/deleteFaq in cmsService.ts
  const {
    items: faqs,
    isLoading,
    error,
    refetch,
    add: addFaq,
    update: updateFaqItem,
    remove: removeFaq,
  } = useCmsListSection<FaqEntry>(fetchFaqList, {
    createFn: createFaq as any,
    updateFn: updateFaq as any,
    deleteFn: deleteFaq,
  });

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  const filtered = useMemo(() => {
    let items = faqs;
    if (filterCat !== 'All') items = items.filter(f => f.category === filterCat);
    if (search.trim()) items = items.filter(f =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
    );
    return items;
  }, [faqs, filterCat, search]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    faqs.forEach(f => { counts[f.category] = (counts[f.category] || 0) + 1; });
    return counts;
  }, [faqs]);

  const handleCreate = useCallback(() => {
    if (!formQuestion.trim() || !formAnswer.trim()) { toast.error('Question and answer are required'); return; }
    addFaq({
      question: formQuestion.trim(),
      answer: formAnswer.trim(),
      category: formCategory,
      order: faqs.filter(f => f.category === formCategory).length + 1,
    });
    setFormQuestion(''); setFormAnswer('');
    setShowCreate(false);
  }, [formQuestion, formAnswer, formCategory, faqs, addFaq]);

  const startEdit = useCallback((faq: FaqEntry) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  }, []);

  const saveEdit = useCallback((id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) { toast.error('Question and answer are required'); return; }
    updateFaqItem(id, { question: editQuestion.trim(), answer: editAnswer.trim() });
    setEditingId(null);
    toast.success('FAQ updated');
  }, [editQuestion, editAnswer, updateFaqItem]);

  const handleDelete = useCallback((id: string) => {
    const item = faqs.find(f => f.id === id);
    removeFaq(id, item?.question);
  }, [faqs, removeFaq]);

  const allCategories = ['All', ...categories];

  if (isLoading) return <CmsSkeleton rows={6} />;
  if (error) return <CmsError message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <style>{`@keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .fade-up { animation: fade-up 0.35s ease-out both; }`}</style>

      <AdminPageHeader
        title="FAQ Management"
        subtitle="Create, edit, and organize frequently asked questions by category for alumni, employers, and visitors."
        breadcrumbs={[{ label: 'CMS' }, { label: 'FAQ' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="info">{faqs.length} entries</AdminBadge>
            <button onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-sm">
              <Plus className="h-3.5 w-3.5" /> New FAQ
            </button>
          </div>
        }
      />

      {/* Create Form */}
      {showCreate && (
        <div className="fade-up rounded-[12px] border border-blue-200 bg-blue-50/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">New FAQ Entry</h2>
            <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/50"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={formQuestion} onChange={e => setFormQuestion(e.target.value)} placeholder="Question"
              className="sm:col-span-2 rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
            <textarea value={formAnswer} onChange={e => setFormAnswer(e.target.value)} rows={3} placeholder="Answer..."
              className="sm:col-span-2 rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580] resize-none" />
            <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
              className="rounded-[8px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#003580]">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={handleCreate} className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Create FAQ
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all ${filterCat === cat ? 'bg-[#003580] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {cat}
              {cat !== 'All' && <span className="px-1 py-0.5 rounded text-[9px] bg-white/20">{catCounts[cat] || 0}</span>}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FAQ..." className="w-full rounded-[8px] border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#003580]" />
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-2">
        {filtered.map((faq, idx) => (
          <div key={faq.id} className="fade-up rounded-[12px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden transition-all hover:shadow-md"
            style={{ animationDelay: `${idx * 0.03}s` }}>
            <button
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-all hover:bg-slate-50"
            >
              <HelpCircle className="h-5 w-5 shrink-0 text-[#003580]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{faq.question}</span>
                  <span className="rounded-md bg-[#003580]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#003580]">{faq.category}</span>
                </div>
              </div>
              {expandedId === faq.id ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
            </button>
            {expandedId === faq.id && (
              <div className="border-t border-slate-100 px-5 py-4">
                {editingId === faq.id ? (
                  <div className="space-y-3">
                    <input value={editQuestion} onChange={e => setEditQuestion(e.target.value)}
                      className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                    <textarea value={editAnswer} onChange={e => setEditAnswer(e.target.value)} rows={3}
                      className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(faq.id)} className="rounded-[8px] bg-[#003580] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition-all">
                        <Save className="h-3.5 w-3.5 inline mr-1" /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="rounded-[8px] border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                    <div className="mt-4 flex items-center gap-1.5">
                      <button onClick={() => startEdit(faq)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => handleDelete(faq.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 transition-all">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <HelpCircle className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No FAQ entries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
