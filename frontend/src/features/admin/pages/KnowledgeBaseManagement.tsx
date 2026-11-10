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
import AdminTablePagination from '../components/AdminTablePagination';
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCat, selectedStatus]);

  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return documents.slice(start, start + pageSize);
  }, [documents, currentPage, pageSize]);

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

  const fetchDocuments = useCallback(async () => {
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
  }, [selectedCat, selectedStatus, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="RAG Knowledge Hub"
        subtitle="Manage official ASTU policies, registrar guides, and FAQs that power the public homepage AI chatbot."
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowTestPlayground(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Test Chatbot
          </button>
          <button
            onClick={() => setShowFaqModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New FAQ / Policy
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document (PDF/Text)
          </button>
        </div>
      </AdminPageHeader>

      {/* Analytics KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Total Knowledge Sources
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.totalDocs}</div>
          <div className="text-xs text-slate-400 mt-1">Manuals, guides & FAQs</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Indexed Knowledge Chunks
          </div>
          <div className="text-2xl font-bold text-indigo-900 mt-2">{stats.totalChunks}</div>
          <div className="text-xs text-slate-400 mt-1">Searchable semantic passages</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Active on Homepage
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{stats.published}</div>
          <div className="text-xs text-slate-400 mt-1">Published public documents</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            Drafts & Review
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{stats.drafts}</div>
          <div className="text-xs text-slate-400 mt-1">Pending admin publication</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title or topic..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>

          <button
            onClick={fetchDocuments}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            Loading knowledge repository...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
            <FolderOpen className="w-10 h-10 text-slate-300" />
            <div>No knowledge documents found matching your filter criteria.</div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Upload your first policy document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Indexed Chunks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Access</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900">{doc.title}</div>
                          {doc.fileName && (
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <span>File: {doc.fileName}</span>
                              {doc.fileSize && (
                                <span>• {(doc.fileSize / 1024).toFixed(1)} KB</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{doc.chunkCount}</span>
                      <span className="text-slate-400 text-[11px]"> passages</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
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
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          doc.accessLevel === 'PUBLIC'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {doc.accessLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div>{doc.uploadedBy || 'Admin'}</div>
                      <div className="text-slate-400">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openPreview(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Preview Extracted Chunks"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setTargetDocId(doc.id);
                            setShowTestPlayground(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Test In AI Playground"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete from knowledge base"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Knowledge Documents Pagination */}
        <div className="border-t border-slate-100 p-3">
          <AdminTablePagination
            currentPage={currentPage}
            totalItems={documents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            itemName="knowledge sources"
          />
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload Knowledge Document (PDF / Text)
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Official Degree Verification & Transcript Policy 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={uploadCat}
                    onChange={(e) => setUploadCat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Status</label>
                  <select
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="PUBLISHED">Published (Immediate)</option>
                    <option value="DRAFT">Draft (Test first)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="e.g. Official Registrar document SLAs and issuance steps"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  File Attachment (.pdf, .txt, .md) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.txt,.md"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The document will be parsed, segmented into semantic chunks, and indexed automatically.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Add Direct FAQ / Institutional Guideline
              </h3>
              <button
                onClick={() => setShowFaqModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFaqSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Question / Policy Topic *
                </label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. What is the fee for an English medium of instruction certificate?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={faqCat}
                  onChange={(e) => setFaqCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Detailed Answer / Guidance *
                </label>
                <textarea
                  required
                  rows={5}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Provide clear step-by-step instructions or policy terms..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFaq}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
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
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Chunk Inspection: {previewDoc.title}
                </h3>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {previewChunks.length} semantic chunks generated for vector retrieval
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
              {loadingPreview ? (
                <div className="py-12 text-center text-slate-400">Loading chunks...</div>
              ) : previewChunks.length === 0 ? (
                <div className="py-12 text-center text-slate-400">No chunks generated yet.</div>
              ) : (
                previewChunks.map((chunk, idx) => (
                  <div
                    key={chunk.id || idx}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-[11px] font-semibold text-blue-700">
                      <span>
                        Chunk #{idx + 1} — {chunk.section || 'General'}
                      </span>
                      <span className="text-slate-400">~{chunk.tokenCount} words</span>
                    </div>
                    <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                      {chunk.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
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
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">RAG Chatbot Verification Playground</h3>
                  <p className="text-[11px] text-slate-400">
                    Test how the chatbot retrieves and answers from your uploaded documents
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTestPlayground(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 text-xs">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-slate-600">Target Document:</label>
                <select
                  value={targetDocId}
                  onChange={(e) => setTargetDocId(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
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
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
                <button
                  type="submit"
                  disabled={testing || !testQuery.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {testing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Query
                </button>
              </form>

              {testResult && (
                <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-900 border-b border-indigo-100 pb-2">
                    <span>Generated RAG Answer</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ {testResult.retrievedChunksCount} Chunks Retrieved
                    </span>
                  </div>

                  <div className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    {testResult.response}
                  </div>

                  {testResult.citations && testResult.citations.length > 0 && (
                    <div className="pt-2 border-t border-indigo-100 space-y-1">
                      <div className="text-[11px] font-bold text-slate-700">Verified Citations:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {testResult.citations.map((c, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-indigo-700 border border-indigo-200 shadow-2xs"
                          >
                            📚 {c.title} {c.section ? `(${c.section})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {testResult.actions && testResult.actions.length > 0 && (
                    <div className="pt-1 flex gap-2">
                      {testResult.actions.map((act, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-600 text-white"
                        >
                          Action: {act.label} ({act.route})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setShowTestPlayground(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
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
