import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Clock, Download, ExternalLink, FileText, Filter, Search, UserPlus, XCircle, SearchX, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getDocumentUrl = (filePath?: string) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const normPath = filePath.replace(/\\/g, '/');
  const match = normPath.match(/uploads\/.*/i);
  const cleanPath = match ? match[0] : normPath.replace(/^\//, '');
  return `${UPLOAD_BASE}/${cleanPath}`;
};

const isImageFile = (url?: string) => {
  if (!url) return false;
  return /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(url);
};

interface RegistrationIssue {
  id: string;
  fullName: string;
  studentId: string;
  graduationYear: string;
  contactEmail: string;
  phoneNumber: string;
  issueDescription: string;
  identificationUrl: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

export const DataIssuesTab: React.FC = () => {
  const [issues, setIssues] = useState<RegistrationIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED'>('ALL');
  const [selectedIssue, setSelectedIssue] = useState<RegistrationIssue | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [editForm, setEditForm] = useState({
    fullName: '',
    studentId: '',
    graduationYear: '',
    department: 'Computer Science & Engineering',
    email: '',
    phone: '',
    cgpa: '3.50',
    nationality: 'Ethiopian',
    dateOfBirth: '',
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  // Sync edit form state when a new issue is selected
  useEffect(() => {
    setImgError(false);
    if (selectedIssue) {
      let dept = 'Computer Science & Engineering';
      if (selectedIssue.issueDescription) {
        const match = selectedIssue.issueDescription.match(/Department:\s*([^\n\r;]+)/i);
        if (match && match[1]) dept = match[1].trim();
      }
      setEditForm({
        fullName: selectedIssue.fullName || '',
        studentId: selectedIssue.studentId || '',
        graduationYear: String(selectedIssue.graduationYear || '2024'),
        department: dept,
        email: selectedIssue.contactEmail || '',
        phone: selectedIssue.phoneNumber || '',
        cgpa: '3.50',
        nationality: 'Ethiopian',
        dateOfBirth: '',
      });
      setIsEditing(false);
    }
  }, [selectedIssue]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ success: boolean; data: RegistrationIssue[] }>('/registrar/registration-issues');
      if (res.data.success) {
        setIssues(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load data correction requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveIssue = async (id: string, status: 'RESOLVED' | 'REJECTED') => {
    try {
      setActionLoading(true);
      const res = await apiClient.put<{ success: boolean }>(`/registrar/registration-issues/${id}/resolve`, {
        status,
        fullName: editForm.fullName,
        studentId: editForm.studentId,
        graduationYear: editForm.graduationYear,
        email: editForm.email,
        phone: editForm.phone,
      });
      if (res.data.success) {
        toast.success(`Request marked as ${status.toLowerCase()}`);
        setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
        setSelectedIssue(null);
      }
    } catch (error) {
      toast.error('Failed to update request status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAccount = async (id: string) => {
    try {
      setActionLoading(true);
      const payload = {
        fullName: editForm.fullName,
        studentId: editForm.studentId,
        graduationYear: editForm.graduationYear,
        department: editForm.department,
        email: editForm.email,
        phone: editForm.phone,
        cgpa: editForm.cgpa,
        nationality: editForm.nationality,
        dateOfBirth: editForm.dateOfBirth,
      };
      const res = await apiClient.post<{ success: boolean; message?: string }>(
        `/registrar/registration-issues/${id}/create-account`,
        payload
      );
      if (res.data.success) {
        toast.success('Account created with Registrar verified data! Credentials sent via email.');
        setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'RESOLVED' } : i)));
        setSelectedIssue(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredIssues.length / pageSize) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIssues.slice(start, start + pageSize);
  }, [filteredIssues, currentPage, pageSize]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"><Clock className="h-3 w-3" /> Pending</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"><CheckCircle className="h-3 w-3" /> Resolved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-astu-navy/20 border-t-astu-navy"></div>
          <p className="text-sm font-medium text-slate-500">Loading data correction requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-600 to-orange-700 p-5 sm:p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-200">Data Corrections</span>
            <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">Registration Issues</h2>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-white/80">
              Manage and resolve data mismatches reported by alumni during registration. Verify their identity documents and update SIS records accordingly.
            </p>
          </div>
          <div className="hidden h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md md:flex">
            <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-astu-navy focus:outline-none focus:ring-1 focus:ring-astu-navy dark:bg-slate-800 dark:border-slate-600 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 py-2.5 pl-3 pr-8 text-sm focus:border-astu-navy focus:outline-none focus:ring-1 focus:ring-astu-navy dark:bg-slate-800 dark:border-slate-600 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">Request Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{issue.fullName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{issue.studentId} • Class of {issue.graduationYear}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 dark:text-slate-300">{issue.contactEmail}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{issue.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(issue.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedIssue(issue)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-astu-navy focus:outline-none focus:ring-2 focus:ring-astu-navy focus:ring-offset-1 transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Review
                    </button>
                  </td>
                </tr>
              ))}

              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                      <SearchX className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No requests found</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'Try adjusting your search or filters'
                        : 'There are no data correction requests to review'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Bar */}
        <div className="border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredIssues.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(currentPage * pageSize, filteredIssues.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredIssues.length}</span> entries
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="px-2 font-semibold text-slate-700 dark:text-slate-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{issue.fullName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{issue.studentId} • Class of {issue.graduationYear}</div>
              </div>
              {getStatusBadge(issue.status)}
            </div>
            <div className="space-y-1.5 mb-3">
              <div className="text-xs text-slate-600 dark:text-slate-400">📧 {issue.contactEmail}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">📱 {issue.phoneNumber}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">📅 {new Date(issue.createdAt).toLocaleDateString()}</div>
            </div>
            <button
              onClick={() => setSelectedIssue(issue)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-astu-navy transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              <FileText className="h-3.5 w-3.5" />
              Review Request
            </button>
          </div>
        ))}
        {filteredIssues.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:bg-slate-800 dark:border-slate-700">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
              <SearchX className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No requests found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'There are no data correction requests to review'}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" onClick={() => setSelectedIssue(null)}>
          <div
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800 dark:border-slate-700">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Review Data Correction Request</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Submitted on {new Date(selectedIssue.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body – scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Info & Registrar Correction Inputs */}
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        {isEditing ? '✏️ Edit & Correct Graduate Info' : 'Reported Information'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-[11px] font-bold text-astu-navy hover:underline flex items-center gap-1 bg-astu-navy/10 px-2.5 py-1 rounded-lg transition-all"
                      >
                        {isEditing ? '🔒 Lock Editing' : '✏️ Edit / Correct Fields'}
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-semibold focus:outline-none focus:border-astu-navy"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Student ID</label>
                            <input
                              type="text"
                              value={editForm.studentId}
                              onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-mono focus:outline-none focus:border-astu-navy"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Graduation Year</label>
                            <input
                              type="text"
                              value={editForm.graduationYear}
                              onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-astu-navy"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department / Program</label>
                          <select
                            value={editForm.department}
                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-semibold focus:outline-none focus:border-astu-navy"
                          >
                            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Electrical & Computer Engineering">Electrical & Computer Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Chemical Engineering">Chemical Engineering</option>
                            <option value="Applied Geology">Applied Geology</option>
                            <option value="Pharmacy">Pharmacy</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email</label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-astu-navy"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone</label>
                            <input
                              type="text"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-astu-navy"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Final CGPA</label>
                            <input
                              type="text"
                              value={editForm.cgpa}
                              onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-mono focus:outline-none focus:border-astu-navy"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nationality</label>
                            <input
                              type="text"
                              value={editForm.nationality}
                              onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-astu-navy"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date of Birth</label>
                            <input
                              type="date"
                              value={editForm.dateOfBirth}
                              onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-astu-navy"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-700/50 dark:border-slate-600">
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Full Name</div>
                          <div className="font-semibold text-slate-900 dark:text-white">{editForm.fullName || selectedIssue.fullName}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Student ID</div>
                            <div className="font-medium text-slate-900 dark:text-white">{editForm.studentId || selectedIssue.studentId}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Graduation Year</div>
                            <div className="font-medium text-slate-900 dark:text-white">{editForm.graduationYear || selectedIssue.graduationYear}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Email</div>
                            <div className="text-sm font-medium text-slate-900 break-all dark:text-white">{editForm.email || selectedIssue.contactEmail}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Phone</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{editForm.phone || selectedIssue.phoneNumber}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                          <div>
                            <div className="text-[9px] uppercase text-slate-400 font-semibold">CGPA</div>
                            <div className="text-xs font-bold text-slate-800">{editForm.cgpa}</div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase text-slate-400 font-semibold">Nationality</div>
                            <div className="text-xs font-bold text-slate-800">{editForm.nationality}</div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase text-slate-400 font-semibold">DOB</div>
                            <div className="text-xs font-bold text-slate-800">{editForm.dateOfBirth || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Issue Description</h4>
                    <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30">
                      <p className="text-sm text-amber-900 whitespace-pre-wrap dark:text-amber-200">{selectedIssue.issueDescription}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Document */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Identity Document</h4>
                    <a
                      href={getDocumentUrl(selectedIssue.identificationUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-astu-navy hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </a>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600">
                    {isImageFile(selectedIssue.identificationUrl) && !imgError ? (
                      <img
                        src={getDocumentUrl(selectedIssue.identificationUrl)}
                        alt="ID Document"
                        className="w-full h-auto max-h-72 object-contain bg-white dark:bg-slate-800"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-600 flex items-center justify-center mb-4">
                          <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                          {imgError ? 'Image could not be loaded' : 'Document uploaded'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                          Click below to download or open the document
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={getDocumentUrl(selectedIssue.identificationUrl)}
                            download
                            className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy px-4 py-2 text-xs font-bold text-white hover:bg-astu-navy/90 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download File
                          </a>
                          <a
                            href={getDocumentUrl(selectedIssue.identificationUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open in Browser
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30">
                    <p className="text-xs text-blue-800 leading-relaxed dark:text-blue-300">
                      <strong>Action Required:</strong> Verify the uploaded document against the student's claimed details. You can either mark as resolved (alumni can retry registration) or create an account directly for them.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer – fixed at bottom */}
            <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50/80 px-4 sm:px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  {getStatusBadge(selectedIssue.status)}
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Close
                  </button>
                  {selectedIssue.status === 'PENDING' && (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleResolveIssue(selectedIssue.id, 'REJECTED')}
                        className="rounded-xl bg-white border border-red-200 px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 dark:bg-slate-700 dark:border-red-800 dark:text-red-400"
                      >
                        Reject
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleCreateAccount(selectedIssue.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50"
                      >
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleResolveIssue(selectedIssue.id, 'RESOLVED')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-astu-navy px-4 py-2 text-sm font-bold text-white shadow-md shadow-astu-navy/20 hover:bg-astu-navy/90 focus:outline-none focus:ring-2 focus:ring-astu-navy focus:ring-offset-2 transition-all disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark Resolved
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
