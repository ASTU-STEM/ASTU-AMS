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

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const categories = ['Account & Profile', 'Jobs & Careers', 'Mentorship', 'Documents & Transcripts', 'Tracer Surveys', 'Events & Networking', 'Technical Support', 'General'];

const initialFaqs: FaqEntry[] = [
  { id: 'FQ-01', question: 'How do I register as an alumni?', answer: 'Visit the registration page and complete the form with your student ID, personal details, and graduation information. You will receive a verification email to activate your account.', category: 'Account & Profile', order: 1 },
  { id: 'FQ-02', question: 'How can employers post jobs?', answer: 'Employers can register through the employer portal, get verified by the admin, and then post job opportunities for ASTU alumni and students.', category: 'Jobs & Careers', order: 1 },
  { id: 'FQ-03', question: 'What is the Tracer Study?', answer: 'The Tracer Study tracks graduate career outcomes at 6, 12, and 24-month intervals after graduation to measure employability and inform curriculum improvements.', category: 'Tracer Surveys', order: 1 },
  { id: 'FQ-04', question: 'How do I request a transcript?', answer: 'Log into your alumni dashboard, navigate to Document Requests, select Transcript, and complete the request form. Processing takes 3-5 business days.', category: 'Documents & Transcripts', order: 1 },
  { id: 'FQ-05', question: 'Can I update my profile information?', answer: 'Yes, log into your alumni dashboard and click Edit Profile to update your contact details, employment status, and professional information.', category: 'Account & Profile', order: 2 },
  { id: 'FQ-06', question: 'How do I find a mentor?', answer: 'Browse the Mentorship section in your dashboard, filter by industry or expertise, and send a mentorship request to available alumni mentors.', category: 'Mentorship', order: 1 },
  { id: 'FQ-07', question: 'How do I RSVP for events?', answer: 'Visit the Events page in your dashboard, select an event, and click RSVP. You will receive a confirmation with event details and a QR code for check-in.', category: 'Events & Networking', order: 1 },
  { id: 'FQ-08', question: 'What technical support is available?', answer: 'You can access the Help Center from any page, submit a support ticket, or contact the ICT helpdesk at support@astu.edu.et for assistance.', category: 'Technical Support', order: 1 },
  { id: 'FQ-09', question: 'Who can use the ASTU-AMS platform?', answer: 'The platform serves alumni, employers, department heads, registrar staff, and university administrators. Each role has tailored features and permissions.', category: 'General', order: 1 },
];

export default function FaqManagement() {
  const [faqs, setFaqs] = useState<FaqEntry[]>(initialFaqs);
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

  const createFaq = useCallback(() => {
    if (!formQuestion.trim() || !formAnswer.trim()) { toast.error('Question and answer are required'); return; }
    const entry: FaqEntry = {
      id: `FQ-${String(faqs.length + 1).padStart(3, '0')}`,
      question: formQuestion.trim(),
      answer: formAnswer.trim(),
      category: formCategory,
      order: faqs.filter(f => f.category === formCategory).length + 1,
    };
    setFaqs(prev => [...prev, entry]);
    setFormQuestion(''); setFormAnswer('');
    setShowCreate(false);
    toast.success('FAQ entry created');
  }, [formQuestion, formAnswer, formCategory, faqs]);

  const startEdit = useCallback((faq: FaqEntry) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  }, []);

  const saveEdit = useCallback((id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) { toast.error('Question and answer are required'); return; }
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, question: editQuestion.trim(), answer: editAnswer.trim() } : f));
    setEditingId(null);
    toast.success('FAQ updated');
  }, [editQuestion, editAnswer]);

  const deleteFaq = useCallback((id: string) => {
    const item = faqs.find(f => f.id === id);
    setFaqs(prev => prev.filter(f => f.id !== id));
    toast.success(`"${item?.question}" deleted`);
  }, [faqs]);

  const allCategories = ['All', ...categories];

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
        <div className="fade-up rounded-[12px] border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] dark:text-white">New FAQ Entry</h2>
            <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-page)]"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={formQuestion} onChange={e => setFormQuestion(e.target.value)} placeholder="Question"
              className="sm:col-span-2 rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#003580]" />
            <textarea value={formAnswer} onChange={e => setFormAnswer(e.target.value)} rows={3} placeholder="Answer..."
              className="sm:col-span-2 rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#003580] resize-none" />
            <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
              className="rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#003580]">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={createFaq} className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm">
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
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all ${filterCat === cat ? 'bg-[#003580] text-white shadow-sm' : 'bg-[var(--bg-page)] dark:bg-slate-800 text-[var(--text-secondary)] dark:text-slate-300  dark:hover:bg-slate-700'}`}>
              {cat}
              {cat !== 'All' && <span className="px-1 py-0.5 rounded text-[9px] bg-white/20">{catCounts[cat] || 0}</span>}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FAQ..." className="w-full rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 dark:text-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#003580]" />
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-2">
        {filtered.map((faq, idx) => (
          <div key={faq.id} className="fade-up rounded-[12px] border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-card)] dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden transition-all hover:shadow-md"
            style={{ animationDelay: `${idx * 0.03}s` }}>
            <button
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-all hover:bg-[var(--bg-page)] dark:hover:bg-slate-800"
            >
              <HelpCircle className="h-5 w-5 shrink-0 text-[#003580]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)] dark:text-white">{faq.question}</span>
                  <span className="rounded-md bg-[#003580]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#003580]">{faq.category}</span>
                </div>
              </div>
              {expandedId === faq.id ? <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />}
            </button>
            {expandedId === faq.id && (
              <div className="border-t border-[var(--border-color)] dark:border-slate-800 px-5 py-4">
                {editingId === faq.id ? (
                  <div className="space-y-3">
                    <input value={editQuestion} onChange={e => setEditQuestion(e.target.value)}
                      className="w-full rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580]" />
                    <textarea value={editAnswer} onChange={e => setEditAnswer(e.target.value)} rows={3}
                      className="w-full rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm outline-none focus:border-[#003580] resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(faq.id)} className="rounded-[8px] bg-[#003580] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition-all">
                        <Save className="h-3.5 w-3.5 inline mr-1" /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="rounded-[8px] border border-[var(--border-color)] dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-300 hover:bg-[var(--bg-page)] dark:hover:bg-slate-800 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] dark:text-slate-300 leading-relaxed">{faq.answer}</p>
                    <div className="mt-4 flex items-center gap-1.5">
                      <button onClick={() => startEdit(faq)}
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--border-color)] dark:border-slate-700 bg-[var(--bg-card)] dark:bg-slate-800 px-2.5 py-1.5 text-[10px] font-semibold text-[var(--text-secondary)] dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-all">
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => deleteFaq(faq.id)}
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
            <p className="mt-2 text-sm text-[var(--text-muted)]">No FAQ entries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
