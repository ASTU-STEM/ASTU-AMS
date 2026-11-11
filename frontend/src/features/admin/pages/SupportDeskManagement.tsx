import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminPageHeader from '../components/AdminPageHeader';
import { LifeBuoy, Search, Filter, Mail, CheckCircle2, Clock, AlertTriangle, Eye, Send, FileText, Check, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../services/api';

interface SupportTicket {
  id: string;
  category: string;
  studentId?: string;
  fullName: string;
  graduationYear?: string;
  contactEmail: string;
  phone?: string;
  message: string;
  attachments?: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_ICT_ADMIN' | 'RESOLVED' | 'CLOSED';
  route?: string;
  lastErrorCode?: string;
  sessionId?: string;
  responseNotes?: string;
  escalationNotes?: string;
  assignedToRole?: string;
  resolvedByRole?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupportDeskManagement() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'PENDING_ICT_ADMIN' | 'RESOLVED' | 'CLOSED'>('RESOLVED');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  const handleEscalateToIct = async () => {
    if (!selectedTicket) return;
    setIsEscalating(true);
    try {
      const res = await apiClient.post<any>(`/support/tickets/${selectedTicket.id}/escalate`, {
        escalationNotes,
      });
      if (res?.data?.success || res?.status === 200) {
        toast.success(`Ticket #${selectedTicket.id.substring(0, 8)} transferred to ICT Admin! Notifications dispatched.`);
        setSelectedTicket(null);
        setEscalationNotes('');
        fetchTickets();
      } else {
        toast.error('Failed to transfer ticket to ICT Admin');
      }
    } catch (err) {
      console.error('Escalation error:', err);
      toast.error('Error transferring ticket to ICT Admin');
    } finally {
      setIsEscalating(false);
    }
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<any>('/support/tickets');
      const dataList = res?.data?.data || res?.data || [];
      if (Array.isArray(dataList)) {
        setTickets(dataList);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
      toast.error('Failed to load support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsUpdating(true);

    try {
      const res = await apiClient.put<any>(
        `/support/tickets/${selectedTicket.id}/status`,
        {
          status: newStatus,
          responseNotes,
        }
      );

      if (res?.data?.success || res?.status === 200) {
        toast.success(`Ticket #${selectedTicket.id.substring(0, 8)} updated to ${newStatus}`);
        setSelectedTicket(null);
        setResponseNotes('');
        fetchTickets();
      } else {
        toast.error('Failed to update ticket status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Error updating ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = !searchQuery || 
      `${t.fullName} ${t.studentId || ''} ${t.contactEmail} ${t.category} ${t.message}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'auth_verification': return 'Email / OTP Verification';
      case 'didit_verification': return 'National ID (Didit)';
      case 'missing_record': return 'Missing SIS Record';
      case 'account_lockout': return 'Account Lockout';
      case 'general_login': return 'Login & Password';
      default: return cat || 'General Support';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_ICT_ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-amber-700" /> PENDING ICT ADMIN</span>;
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">OPEN</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">CLOSED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support Desk & Help Tickets"
        subtitle="Manage user support requests, technical issues, and OTP/verification tickets."
        breadcrumb={[{ label: 'Admin' }, { label: 'Support Desk' }]}
        actions={
          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Refresh Tickets
          </button>
        }
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tickets</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{tickets.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Open Tickets</p>
            <p className="text-2xl font-black text-amber-800 mt-1">{tickets.filter(t => t.status === 'OPEN').length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-black text-blue-800 mt-1">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">{tickets.filter(t => t.status === 'RESOLVED').length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tickets by name, email, ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-astu-navy focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'PENDING_ICT_ADMIN', 'RESOLVED', 'CLOSED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-astu-navy text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Tickets' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Ticket ID</th>
                <th className="p-4">User Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Message Preview</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading support tickets...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No support tickets match your filter criteria.</td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-astu-navy">#{ticket.id.substring(0, 8)}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{ticket.fullName}</p>
                      <p className="text-[11px] text-slate-500">{ticket.contactEmail}</p>
                      {ticket.studentId && <p className="text-[10px] text-slate-400 font-mono">ID: {ticket.studentId}</p>}
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{getCategoryLabel(ticket.category)}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{ticket.message}</td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">{getStatusBadge(ticket.status)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setNewStatus(ticket.status);
                          setResponseNotes(ticket.responseNotes || '');
                        }}
                        className="px-3 py-1.5 bg-astu-navy/10 hover:bg-astu-navy hover:text-white text-astu-navy rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View & Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Resolution Modal */}
      {selectedTicket && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 my-auto">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-start border-b border-slate-700">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-base text-cyan-400 shadow-inner">
                  {selectedTicket.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/80">
                      TICKET #{selectedTicket.id.substring(0, 8)}
                    </span>
                    <span className="text-[10px] text-slate-400">• {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">{selectedTicket.fullName}</h3>
                  <p className="text-xs text-slate-300 font-medium">{selectedTicket.contactEmail} • {selectedTicket.phone || 'No phone'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Contextual Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                  <p className="font-extrabold text-slate-800 text-xs">{getCategoryLabel(selectedTicket.category)}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID</span>
                  <p className="font-extrabold text-slate-800 font-mono text-xs">{selectedTicket.studentId || 'N/A'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Route</span>
                  <p className="font-bold text-slate-700 font-mono text-xs truncate" title={selectedTicket.route}>{selectedTicket.route || '/'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Error Code</span>
                  <span className="inline-block px-2 py-0.5 bg-red-50 text-red-700 font-mono font-extrabold text-[11px] rounded border border-red-200/80">
                    {selectedTicket.lastErrorCode || 'NONE'}
                  </span>
                </div>
              </div>

              {/* High-Contrast User Issue Description Box */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-astu-navy" />
                  User Issue Description
                </h4>
                <div className="p-4 bg-slate-50 border-l-4 border-l-astu-navy border-slate-200 rounded-r-2xl text-slate-900 text-xs md:text-sm font-medium leading-relaxed font-sans shadow-xs">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Attached Screenshots / Files</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedTicket.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={`${(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '')}/uploads/Support/${att}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold border border-slate-250 shadow-2xs transition-all flex items-center gap-2 hover:border-astu-navy"
                      >
                        <span className="text-astu-navy">📎 View Attachment {i + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Escalation to ICT Admin Section */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4.5 h-4.5 text-amber-700" />
                    <h4 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider">Cannot resolve directly? Transfer to ICT Admin</h4>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Notifies ICT via Email & In-App
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  If this issue requires technical database fixes, system backend debugging, or SIS sync intervention, transfer it to the ICT Operations team for technical review.
                </p>
                <textarea
                  rows={2}
                  placeholder="Provide technical notes for the ICT Admin team (e.g., Didit API failure on verification, transcript grade mismatch)..."
                  value={escalationNotes}
                  onChange={e => setEscalationNotes(e.target.value)}
                  className="w-full text-xs p-3 border border-amber-300 bg-white rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 shadow-xs"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleEscalateToIct}
                    disabled={isEscalating}
                    className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 hover:scale-[1.01]"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {isEscalating ? 'Transferring to ICT...' : 'Transfer Issue to ICT Admin'}
                  </button>
                </div>
              </div>

              {/* Resolution Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-4 pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm">Update Status & Respond to User</h4>
                  <span className="text-[10px] font-semibold text-slate-500">Sends Email Notification</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Set Ticket Status</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as any)}
                      className="w-full text-xs p-3 border border-slate-300 bg-white rounded-xl font-bold text-slate-900 focus:outline-none focus:border-astu-navy focus:ring-2 focus:ring-astu-navy/10 shadow-xs"
                    >
                      <option value="OPEN">OPEN (Awaiting Review)</option>
                      <option value="IN_PROGRESS">IN PROGRESS (Under Investigation)</option>
                      <option value="RESOLVED">RESOLVED (Fixed & Notified)</option>
                      <option value="CLOSED">CLOSED (Archived)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Response Notes (Emailed to User)</label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setResponseNotes(`Hello ${selectedTicket.fullName},\n\nYour issue regarding ${getCategoryLabel(selectedTicket.category)} has been resolved. You can now log in or continue your session.`)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                      >
                        + Resolved Template
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponseNotes(`Hello ${selectedTicket.fullName},\n\nWe need additional information to resolve your ticket. Please reply with your correct Student ID or National ID.`)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                      >
                        + Need Info Template
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Provide response details emailed directly to the user..."
                    value={responseNotes}
                    onChange={e => setResponseNotes(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-300 bg-white rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-astu-navy focus:ring-2 focus:ring-astu-navy/10 shadow-xs leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 hover:scale-[1.01]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isUpdating ? 'Updating & Sending Email...' : 'Update Ticket & Email User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
