import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Send,
  X,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminEmptyState from '../components/AdminEmptyState';
import AdminStatGrid from '../components/AdminStatGrid';
import AdminSectionCard, {
  adminFilterShellClass,
  adminHeroGhostBtnClass,
  adminHeroPrimaryBtnClass,
  adminInputClass,
  adminPanelClass,
  adminTableHeadClass,
  adminTableRowClass,
} from '../components/AdminSectionCard';
import {
  knowledgeService,
  KnowledgeDocItem,
  KnowledgeChunkItem,
  AdminTestQueryResult,
} from '../services/knowledge.service';

const CATEGORIES = [
  'All',
  'Registrar',
  'Careers & Jobs',
  'Tracer Studies',
  'Academic Departments',
  'Admissions & Accounts',
  'General',
];

export default function KnowledgeBaseManagement() {
  const [documents, setDocuments] = useState<KnowledgeDocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTestPlayground, setShowTestPlayground] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCat, setUploadCat] = useState('Registrar');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadAccess, setUploadAccess] = useState<'PUBLIC' | 'RESTRICTED'>('PUBLIC');
  const [uploadStatus, setUploadStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // FAQ Form State
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCat, setFaqCat] = useState('Registrar');
  const [isSubmittingFaq, setIsSubmittingFaq] = useState(false);

  // Preview State
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocItem | null>(null);
  const [previewChunks, setPreviewChunks] = useState<KnowledgeChunkItem[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Test Playground State
  const [testQuery, setTestQuery] = useState('');
  const [targetDocId, setTargetDocId] = useState<string>('all');
  const [testResult, setTestResult] = useState<AdminTestQueryResult | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await knowledgeService.getDocuments({
        category: selectedCat !== 'All' ? selectedCat : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        search: search || undefined,
      });
      setDocuments(docs);
    } catch (err: any) {
      toast.error('Failed to load knowledge documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedCat, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      toast.error('Document title is required');
      return;
    }
    if (!selectedFile) {
      toast.error('Please select a PDF, TXT, or Markdown file');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('title', uploadTitle.trim());
      formData.append('category', uploadCat);
      formData.append('description', uploadDesc);
      formData.append('accessLevel', uploadAccess);
      formData.append('status', uploadStatus);
      formData.append('file', selectedFile);

      await knowledgeService.uploadDocument(formData);
      toast.success('Document uploaded and indexed successfully into RAG!');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      toast.error('Question and Answer are required');
      return;
    }

    try {
      setIsSubmittingFaq(true);
      await knowledgeService.createFaq({
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        category: faqCat,
        accessLevel: 'PUBLIC',
      });
      toast.success('FAQ entry indexed into RAG knowledge base!');
      setShowFaqModal(false);
      setFaqQuestion('');
      setFaqAnswer('');
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create FAQ entry');
    } finally {
      setIsSubmittingFaq(false);
    }
  };

  const handleToggleStatus = async (doc: KnowledgeDocItem) => {
    const nextStatus = doc.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await knowledgeService.updateStatus(doc.id, nextStatus);
      toast.success(`Document marked as ${nextStatus}`);
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: nextStatus } : d))
      );
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from the knowledge base?`)) {
      return;
    }
    try {
      await knowledgeService.deleteDocument(id);
      toast.success('Document deleted');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      toast.error('Failed to delete document');
    }
  };

  const openPreview = async (doc: KnowledgeDocItem) => {
    try {
      setPreviewDoc(doc);
      setShowPreviewModal(true);
      setLoadingPreview(true);
      const res = await knowledgeService.getDocumentDetails(doc.id);
      setPreviewChunks(res.chunks || []);
    } catch (err: any) {
      toast.error('Failed to load document preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    try {
      setTesting(true);
      const res = await knowledgeService.testQuery({
        message: testQuery.trim(),
        targetDocumentId: targetDocId !== 'all' ? targetDocId : undefined,
        allowDrafts: true,
      });
      setTestResult(res);
    } catch (err: any) {
      toast.error('Test query execution failed');
    } finally {
      setTesting(false);
    }
  };

  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalChunks = documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0);
    const published = documents.filter((d) => d.status === 'PUBLISHED').length;
    const drafts = documents.filter((d) => d.status === 'DRAFT').length;
    return { totalDocs, totalChunks, published, drafts };
  }, [documents]);

  const knowledgeStats = [
    {
      title: 'Total Knowledge Sources',
      value: String(stats.totalDocs),
      icon: BookOpen,
      tone: 'blue' as const,
      description: 'Manuals, guides & FAQs',
    },
    {
      title: 'Indexed Knowledge Chunks',
      value: String(stats.totalChunks),
      icon: Sparkles,
      tone: 'purple' as const,
      description: 'Searchable semantic passages',
    },
    {
      title: 'Active on Homepage',
      value: String(stats.published),
      icon: CheckCircle2,
      tone: 'green' as const,
      description: 'Published public documents',
    },
    {
      title: 'Drafts & Review',
      value: String(stats.drafts),
      icon: Clock,
      tone: 'amber' as const,
      description: 'Pending admin publication',
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="RAG Knowledge Hub"
        subtitle="Manage official ASTU policies, registrar guides, and FAQs that power the public homepage AI chatbot."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Knowledge Base' }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowTestPlayground(true)} className={adminHeroGhostBtnClass}>
              <Sparkles className="h-4 w-4 text-[#FFCC00]" />
              Test Chatbot
            </button>
            <button type="button" onClick={() => setShowFaqModal(true)} className={adminHeroGhostBtnClass}>
              <Plus className="h-4 w-4" />
              New FAQ / Policy
            </button>
            <button type="button" onClick={() => setShowUploadModal(true)} className={adminHeroPrimaryBtnClass}>
              <Upload className="h-4 w-4" />
              Upload Document (PDF/Text)
            </button>
          </div>
        }
      />

      <AdminStatGrid stats={knowledgeStats} cols={4} compact />

      <AdminSectionCard title="Filters" subtitle="Search and segment the knowledge repository.">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearchSubmit} className={`${adminFilterShellClass} w-full md:max-w-sm`}>
            <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by title or topic..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className={`${adminInputClass} w-auto min-w-[10rem]`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`${adminInputClass} w-auto min-w-[9rem]`}
            >
              <option value="All">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="DEACTIVATED">Deactivated</option>
            </select>

            <button
              type="button"
              onClick={fetchDocuments}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-2.5 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AdminSectionCard>

      <section className={`${adminPanelClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-16 text-sm text-[var(--text-muted)]">
              <RefreshCw className="h-6 w-6 animate-spin text-[#003580]" />
              Loading knowledge repository...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-6">
              <AdminEmptyState
                icon={FolderOpen}
                title="No knowledge documents found"
                description="No documents match your filter criteria. Upload a policy or clear filters to continue."
                action={
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#001F4D]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload your first policy document
                  </button>
                }
              />
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr>
                  {['Document Title', 'Category', 'Indexed Chunks', 'Status', 'Access', 'Uploaded By', 'Actions'].map(
                    (head) => (
                      <th
                        key={head}
                        className={`${adminTableHeadClass} p-4 ${head === 'Actions' ? 'text-right' : ''}`}
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className={adminTableRowClass}>
                    <td className="p-4 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#003580]" />
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">{doc.title}</div>
                          {doc.fileName && (
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                              <span>File: {doc.fileName}</span>
                              {doc.fileSize && <span>• {(doc.fileSize / 1024).toFixed(1)} KB</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block rounded-full border border-[#003580]/15 bg-[#003580]/10 px-2 py-0.5 text-[11px] font-medium text-[#003580]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-[var(--text-primary)]">{doc.chunkCount}</span>
                      <span className="text-[11px] text-[var(--text-muted)]"> passages</span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(doc)}
                        className="cursor-pointer"
                        title="Click to toggle publish status"
                      >
                        <AdminBadge
                          variant={
                            doc.status === 'PUBLISHED'
                              ? 'success'
                              : doc.status === 'DRAFT'
                                ? 'warning'
                                : 'neutral'
                          }
                        >
                          {doc.status}
                        </AdminBadge>
                      </button>
                    </td>
                    <td className="p-4">
                      <AdminBadge variant={doc.accessLevel === 'PUBLIC' ? 'success' : 'info'}>
                        {doc.accessLevel}
                      </AdminBadge>
                    </td>
                    <td className="p-4 text-[11px] text-[var(--text-secondary)]">
                      <div>{doc.uploadedBy || 'Admin'}</div>
                      <div className="text-[var(--text-muted)]">{new Date(doc.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openPreview(doc)}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[#003580]/10 hover:text-[#003580]"
                          title="Preview Extracted Chunks"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetDocId(doc.id);
                            setShowTestPlayground(true);
                          }}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[#003580]/10 hover:text-[#003580]"
                          title="Test In AI Playground"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          title="Delete from knowledge base"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Upload className="h-4 w-4 text-[#003580]" />
                Upload Knowledge Document (PDF / Text)
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-[var(--text-secondary)]">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Official Degree Verification & Transcript Policy 2026"
                  className={adminInputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-[var(--text-secondary)]">Category</label>
                  <select
                    value={uploadCat}
                    onChange={(e) => setUploadCat(e.target.value)}
                    className={adminInputClass}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-[var(--text-secondary)]">Initial Status</label>
                  <select
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value as any)}
                    className={adminInputClass}
                  >
                    <option value="PUBLISHED">Published (Immediate)</option>
                    <option value="DRAFT">Draft (Test first)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-[var(--text-secondary)]">Description (Optional)</label>
                <input
                  type="text"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="e.g. Official Registrar document SLAs and issuance steps"
                  className={adminInputClass}
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-[var(--text-secondary)]">
                  File Attachment (.pdf, .txt, .md) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.txt,.md"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full cursor-pointer text-[var(--text-secondary)] file:mr-4 file:rounded-lg file:border-0 file:bg-[#003580]/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#003580] hover:file:bg-[#003580]/15"
                />
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  The document will be parsed, segmented into semantic chunks, and indexed automatically.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-[var(--border-color)] pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-page)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-1.5 rounded-xl bg-[#003580] px-4 py-2 font-semibold text-white transition hover:bg-[#001F4D] disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Parsing & Indexing...
                    </>
                  ) : (
                    'Upload & Index'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Plus className="h-4 w-4 text-[#003580]" />
                Add Direct FAQ / Institutional Guideline
              </h3>
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFaqSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-[var(--text-secondary)]">
                  Question / Policy Topic *
                </label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. What is the fee for an English medium of instruction certificate?"
                  className={adminInputClass}
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-[var(--text-secondary)]">Category</label>
                <select value={faqCat} onChange={(e) => setFaqCat(e.target.value)} className={adminInputClass}>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-[var(--text-secondary)]">
                  Detailed Answer / Guidance *
                </label>
                <textarea
                  required
                  rows={5}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Provide clear step-by-step instructions or policy terms..."
                  className={adminInputClass}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[var(--border-color)] pt-3">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-page)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFaq}
                  className="rounded-xl bg-[#003580] px-4 py-2 font-semibold text-white transition hover:bg-[#001F4D] disabled:opacity-50"
                >
                  {isSubmittingFaq ? 'Indexing...' : 'Save & Publish to RAG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Chunks Modal */}
      {showPreviewModal && previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-color)] pb-2">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <Eye className="h-4 w-4 text-[#003580]" />
                  Chunk Inspection: {previewDoc.title}
                </h3>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {previewChunks.length} semantic chunks generated for vector retrieval
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-xs">
              {loadingPreview ? (
                <div className="py-12 text-center text-[var(--text-muted)]">Loading chunks...</div>
              ) : previewChunks.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-muted)]">No chunks generated yet.</div>
              ) : (
                previewChunks.map((chunk, idx) => (
                  <div
                    key={chunk.id || idx}
                    className="space-y-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-3.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#003580]">
                      <span>
                        Chunk #{idx + 1} — {chunk.section || 'General'}
                      </span>
                      <span className="text-[var(--text-muted)]">~{chunk.tokenCount} words</span>
                    </div>
                    <div className="whitespace-pre-wrap text-xs leading-relaxed text-[var(--text-secondary)]">
                      {chunk.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex shrink-0 justify-end border-t border-[var(--border-color)] pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Test Playground Modal */}
      {showTestPlayground && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-color)] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#003580]" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">RAG Chatbot Verification Playground</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Test how the chatbot retrieves and answers from your uploaded documents
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTestPlayground(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-xs">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Target Document:</label>
                <select
                  value={targetDocId}
                  onChange={(e) => setTargetDocId(e.target.value)}
                  className={`${adminInputClass} flex-1 py-1.5`}
                >
                  <option value="all">All Published & Draft Documents</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleTestQuery} className="flex gap-2">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="e.g. How do I request an official transcript?"
                  className={`${adminInputClass} flex-1`}
                />
                <button
                  type="submit"
                  disabled={testing || !testQuery.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#003580] px-4 py-2 font-semibold text-white transition hover:bg-[#001F4D] disabled:opacity-50"
                >
                  {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Query
                </button>
              </form>

              {testResult && (
                <div className="mt-4 space-y-3 rounded-xl border border-[#003580]/20 bg-[#003580]/5 p-4">
                  <div className="flex items-center justify-between border-b border-[#003580]/15 pb-2 text-[11px] font-semibold text-[#003580]">
                    <span>Generated RAG Answer</span>
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      ✓ {testResult.retrievedChunksCount} Chunks Retrieved
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[var(--text-primary)]">
                    {testResult.response}
                  </div>

                  {testResult.citations && testResult.citations.length > 0 && (
                    <div className="space-y-1 border-t border-[#003580]/15 pt-2">
                      <div className="text-[11px] font-bold text-[var(--text-secondary)]">Verified Citations:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {testResult.citations.map((c, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full border border-[#003580]/20 bg-[var(--bg-card)] px-2 py-0.5 text-[10px] font-medium text-[#003580] shadow-sm"
                          >
                            📚 {c.title} {c.section ? `(${c.section})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {testResult.actions && testResult.actions.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {testResult.actions.map((act, i) => (
                        <span
                          key={i}
                          className="rounded px-2.5 py-1 text-[11px] font-semibold bg-[#003580] text-white"
                        >
                          Action: {act.label} ({act.route})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end border-t border-[var(--border-color)] pt-2">
              <button
                type="button"
                onClick={() => setShowTestPlayground(false)}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                Close Playground
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
