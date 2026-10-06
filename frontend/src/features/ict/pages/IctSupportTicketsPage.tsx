import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Send,
  FileText,
  X,
  ShieldAlert,
  ArrowUpRight,
  UserCheck,
  BellRing,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient, { recordAuditLog } from '../../../services/api';

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

import { IctTopHeaderCard } from '../components/IctTopHeaderCard';

export default function IctSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_ICT_ADMIN');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const tableRef = React.useRef<HTMLDivElement>(null);

  const handleFilterClick = (filterStatus: string, label?: string) => {
    setStatusFilter(filterStatus);
    if (label) {
      toast.success(`Showing ${label}`);
    }
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<any>('/support/tickets');
      const dataList = res?.data?.data || res?.data || [];
      if (Array.isArray(dataList)) {
        setTickets(dataList);
        const pending = dataList.filter((t: any) => t.status === 'PENDING_ICT_ADMIN').length;
        if (pending === 0 && dataList.length > 0) {
          setStatusFilter('ALL');
        }
      }
    } catch (err) {
      console.error('Failed to fetch ICT support tickets:', err);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!resolutionNotes.trim()) {
      toast.error('Please enter resolution response notes for the user and Super Admin');
      return;
    }

    setIsResolving(true);
    try {
      const res = await apiClient.put<any>(`/support/tickets/${selectedTicket.id}/status`, {
        status: 'RESOLVED',
        responseNotes: resolutionNotes,
        resolvedByRole: 'ICT_ADMIN',
      });

      if (res?.data?.success || res?.status === 200) {
        recordAuditLog({
          action: 'RESOLVE_ESCALATED_SUPPORT_TICKET',
          details: `ICT Admin resolved escalated support ticket #${selectedTicket.id.substring(0, 8)} (${selectedTicket.category}) for ${selectedTicket.fullName}`,
          userEmail: 'admin@astust.edu.et',
          userRole: 'ADMIN',
          beforeState: { ticketId: selectedTicket.id, status: selectedTicket.status },
          afterState: { ticketId: selectedTicket.id, status: 'RESOLVED', responseNotes: resolutionNotes }
        });
        toast.success(`Ticket #${selectedTicket.id.substring(0, 8)} resolved! Super Admin & Alumni notified.`);
        setSelectedTicket(null);
        setResolutionNotes('');
        fetchTickets();
      } else {
        toast.error('Failed to resolve ticket');
      }
    } catch (err) {
      console.error('ICT ticket resolution error:', err);
      toast.error('Error resolving ticket');
    } finally {
      setIsResolving(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      !searchQuery ||
      `${t.fullName} ${t.studentId || ''} ${t.contactEmail} ${t.category} ${t.message} ${t.escalationNotes || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'auth_verification':
        return 'Email / OTP Verification';
      case 'didit_verification':
        return 'National ID (Didit)';
      case 'missing_record':
        return 'Missing SIS Record';
      case 'account_lockout':
        return 'Account Lockout';
      case 'general_login':
        return 'Login & Password';
      default:
        return cat || 'General Technical Support';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_ICT_ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-3 h-3 text-amber-700" /> PENDING ICT REVIEW
          </span>
        );
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">OPEN</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">IN PROGRESS</span>;
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> RESOLVED
          </span>
        );
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">CLOSED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const pendingIctCount = tickets.filter(t => t.status === 'PENDING_ICT_ADMIN').length;
  const resolvedIctCount = tickets.filter(t => t.status === 'RESOLVED' && t.resolvedByRole === 'ICT_ADMIN').length;

  return (
    <div className="space-y-6">
      <IctTopHeaderCard
        title="Escalated Technical Support Desk"
        subtitle="Review, diagnose, and resolve technical support tickets escalated by Super Admin and system automation."
      />
      {/* Top Banner Alert if Pending Tickets Exist */}
      {pendingIctCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                {pendingIctCount} Escalated Support Ticket(s) Awaiting ICT Resolution
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Super Admin transferred technical support issues for deep system inspection and fix.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleFilterClick('PENDING_ICT_ADMIN', `Escalated Queue (${pendingIctCount} tickets)`)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
          >
            View Escalated Queue ({pendingIctCount}) →
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pulse space-y-2"
              >
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))
          : [
              { filter: 'PENDING_ICT_ADMIN', label: 'Escalated to ICT', value: pendingIctCount, tone: 'text-amber-600 dark:text-amber-400', icon: ShieldAlert, bg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600' },
              { filter: 'RESOLVED', label: 'ICT Resolved', value: resolvedIctCount, tone: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600' },
              { filter: 'ALL', label: 'Total Tickets', value: tickets.length, tone: 'text-slate-800 dark:text-white', icon: LifeBuoy, bg: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600' },
              { filter: 'OPEN', label: 'Super Admin / General', value: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length, tone: 'text-slate-700 dark:text-slate-300', icon: Clock, bg: 'bg-purple-100 dark:bg-purple-950/50 text-purple-600' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => handleFilterClick(card.filter, card.label)}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between text-left transition-all hover:shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
                    <p className={`text-2xl font-black mt-1 ${card.tone}`}>{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
      </div>

      {/* Filter and Search Bar */}
      <div ref={tableRef} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, student ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'PENDING_ICT_ADMIN', label: 'Escalated to ICT' },
            { id: 'ALL', label: 'All Tickets' },
            { id: 'OPEN', label: 'Open' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
              {tab.id === 'PENDING_ICT_ADMIN' && pendingIctCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
                  {pendingIctCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Ticket ID</th>
                <th className="p-4">User Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Super Admin Notes</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading ICT support tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No tickets found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-900 dark:text-blue-400">#{ticket.id.substring(0, 8)}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-white">{ticket.fullName}</p>
                      <p className="text-[11px] text-slate-500">{ticket.contactEmail}</p>
                      {ticket.studentId && <p className="text-[10px] text-slate-400 font-mono">ID: {ticket.studentId}</p>}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{getCategoryLabel(ticket.category)}</td>
                    <td className="p-4 max-w-xs">
                      {ticket.escalationNotes ? (
                        <p className="text-amber-950 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/80 text-[11px] font-medium leading-snug">
                          "{ticket.escalationNotes}"
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Direct Support</span>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(ticket.status)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setResolutionNotes(ticket.responseNotes || '');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto ${
                          ticket.status === 'PENDING_ICT_ADMIN'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                            : 'bg-blue-50 text-blue-900 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {ticket.status === 'PENDING_ICT_ADMIN' ? 'Review & Resolve' : 'View Ticket'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ICT Resolution & Details Modal */}
      {selectedTicket &&
        createPortal(
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-800 my-auto">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white flex justify-between items-start border-b border-slate-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-900/60 border border-blue-700 flex items-center justify-center font-bold text-base text-blue-300 shadow-inner">
                    {selectedTicket.fullName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/80">
                        TICKET #{selectedTicket.id.substring(0, 8)}
                      </span>
                      <span className="text-[10px] text-slate-400">• {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white mt-1">{selectedTicket.fullName}</h3>
                    <p className="text-xs text-slate-300 font-medium">
                      {selectedTicket.contactEmail} • {selectedTicket.phone || 'No phone'}
                    </p>
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
                {/* Super Admin Transfer Alert if present */}
                {selectedTicket.escalationNotes && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-l-amber-600 rounded-r-2xl border border-amber-200 dark:border-amber-900/50">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider mb-1">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Super Admin Escalation Notes
                    </div>
                    <p className="text-slate-800 dark:text-amber-100 text-xs md:text-sm font-semibold leading-relaxed font-sans">
                      "{selectedTicket.escalationNotes}"
                    </p>
                  </div>
                )}

                {/* Contextual Technical Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                    <p className="font-extrabold text-slate-800 dark:text-white text-xs">{getCategoryLabel(selectedTicket.category)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID</span>
                    <p className="font-extrabold text-slate-800 dark:text-white font-mono text-xs">{selectedTicket.studentId || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Route</span>
                    <p className="font-bold text-slate-700 dark:text-slate-300 font-mono text-xs truncate" title={selectedTicket.route}>
                      {selectedTicket.route || '/'}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Error Code</span>
                    <span className="inline-block px-2 py-0.5 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono font-extrabold text-[11px] rounded border border-red-200 dark:border-red-800">
                      {selectedTicket.lastErrorCode || 'NONE'}
                    </span>
                  </div>
                </div>

                {/* User Issue Description */}
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    User Problem Report
                  </h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-l-4 border-l-blue-900 border-slate-200 dark:border-slate-700 rounded-r-2xl text-slate-900 dark:text-white text-xs md:text-sm font-medium leading-relaxed">
                    {selectedTicket.message}
                  </div>
                </div>

                {/* ICT Resolution Form */}
                <form onSubmit={handleResolveTicket} className="space-y-4 pt-5 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      ICT Technical Resolution & Dual Notification
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Notifies Super Admin + Alumni
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                      Resolution Notes (Emailed to Alumni & Super Admin)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Explain how the technical issue was resolved in the database / system..."
                      value={resolutionNotes}
                      onChange={e => setResolutionNotes(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-blue-600 leading-relaxed font-sans shadow-xs"
                    />
                  </div>

                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/50 flex items-start gap-2.5 text-blue-950 dark:text-blue-200 text-xs">
                    <BellRing className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Clicking <strong>Resolve & Notify</strong> will automatically mark the ticket as <strong>RESOLVED</strong> in PostgreSQL, send an in-app notification & email to Super Admin, and send an email & notification to the alumni.
                    </span>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isResolving}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 hover:scale-[1.01]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isResolving ? 'Resolving & Notifying...' : 'Resolve & Notify Super Admin & Alumni'}
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
