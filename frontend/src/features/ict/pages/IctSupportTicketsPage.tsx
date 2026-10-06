import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  Clock,
  FileText,
  LifeBuoy,
  Search,
  Send,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../services/api';
import IctPageHeader from '../components/IctPageHeader';
import IctMetricCard from '../components/IctMetricCard';
import IctSection from '../components/IctSection';
import IctStatusBadge, { IctAgeBadge } from '../components/IctStatusBadge';
import IctTabs, { IctTabItem } from '../components/IctTabs';
import IctSearchInput from '../components/IctSearchInput';
import IctDataTable, { IctColumn } from '../components/IctDataTable';
import IctEmptyState from '../components/IctEmptyState';
import IctErrorState from '../components/IctErrorState';
import { IctSkeletonRegion } from '../components/IctSkeleton';
import IctModal from '../components/IctModal';
import IctKeyValueGrid from '../components/IctKeyValue';
import {
  ictBtnPrimary,
  ictBtnSecondary,
  ictBtnSuccess,
  ictBtnXs,
  ictTextarea,
} from '../components/ictUi';

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

type StatusFilter = 'PENDING_ICT_ADMIN' | 'ALL' | 'OPEN' | 'RESOLVED';

const CATEGORY_LABELS: Record<string, string> = {
  auth_verification: 'Email / OTP Verification',
  didit_verification: 'National ID (Didit)',
  missing_record: 'Missing SIS Record',
  account_lockout: 'Account Lockout',
  general_login: 'Login & Password',
};

function getCategoryLabel(cat: string) {
  return CATEGORY_LABELS[cat] || cat || 'General Technical Support';
}

export default function IctSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING_ICT_ADMIN');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiClient.get<any>('/support/tickets');
      const dataList = res?.data?.data || res?.data || [];
      if (Array.isArray(dataList)) {
        setTickets(dataList);
      }
    } catch (err) {
      console.error('Failed to fetch ICT support tickets:', err);
      setLoadError('The support desk queue could not be retrieved from the ASTU-AMS API.');
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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

  const openTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResolutionNotes(ticket.responseNotes || '');
  };

  const filteredTickets = useMemo(
    () =>
      tickets.filter((t) => {
        const matchesSearch =
          !searchQuery ||
          `${t.fullName} ${t.studentId || ''} ${t.contactEmail} ${t.category} ${t.message} ${t.escalationNotes || ''}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [tickets, searchQuery, statusFilter]
  );

  const pendingIctCount = tickets.filter((t) => t.status === 'PENDING_ICT_ADMIN').length;
  const resolvedIctCount = tickets.filter((t) => t.status === 'RESOLVED' && t.resolvedByRole === 'ICT_ADMIN').length;
  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  const filterTabs: IctTabItem<StatusFilter>[] = [
    { key: 'PENDING_ICT_ADMIN', label: 'Escalated to ICT', count: pendingIctCount, dot: pendingIctCount > 0 ? 'warning' : 'none' },
    { key: 'ALL', label: 'All Tickets', count: tickets.length },
    { key: 'OPEN', label: 'Open', count: openCount },
    { key: 'RESOLVED', label: 'Resolved', count: resolvedIctCount },
  ];

  const columns: IctColumn<SupportTicket>[] = [
    {
      key: 'id',
      header: 'Ticket',
      width: '13%',
      cell: (t) => (
        <div className="flex flex-col gap-1">
          <span className="ict-mono ict-num font-extrabold text-[var(--ict-accent-text)]">
            #{t.id.substring(0, 8)}
          </span>
          <IctAgeBadge timestamp={t.createdAt} staleAfterHours={48} />
        </div>
      ),
    },
    {
      key: 'requester',
      header: 'Requester',
      cell: (t) => (
        <div className="min-w-0">
          <p className="ict-clamp-1 text-[12px] font-bold text-[var(--text-primary)] " title={t.fullName}>
            {t.fullName}
          </p>
          <p className="ict-clamp-1 text-[10.5px] text-[var(--text-muted)]" title={t.contactEmail}>
            {t.contactEmail}
          </p>
          {t.studentId && <p className="ict-mono text-[10px] text-[var(--text-muted)]">ID {t.studentId}</p>}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (t) => (
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-[var(--text-secondary)] ">
            {getCategoryLabel(t.category)}
          </p>
          {t.assignedToRole && (
            <p className="ict-label mt-0.5">Assigned {t.assignedToRole.replace(/_/g, ' ').toLowerCase()}</p>
          )}
        </div>
      ),
    },
    {
      key: 'escalation',
      header: 'Super Admin notes',
      cell: (t) =>
        t.escalationNotes ? (
          <p
            className="ict-clamp-2 max-w-xs rounded-[5px] border border-[var(--ict-warn-line)] bg-[var(--ict-warn-bg)] px-2 py-1.5 text-[10.5px] font-medium leading-snug text-[var(--ict-warn)]"
            title={t.escalationNotes}
          >
            &ldquo;{t.escalationNotes}&rdquo;
          </p>
        ) : (
          <span className="text-[10.5px] italic text-[var(--text-muted)]">Direct support request</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '11%',
      cell: (t) => <IctStatusBadge status={t.status} />,
    },
    {
      key: 'action',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (t) => (
        <button
          type="button"
          onClick={() => openTicket(t)}
          className={t.status === 'PENDING_ICT_ADMIN' ? ictBtnPrimary : ictBtnXs}
        >
          {t.status === 'PENDING_ICT_ADMIN' ? 'Review & Resolve' : 'View'}
        </button>
      ),
    },
  ];

  const ticketClosed = selectedTicket?.status === 'RESOLVED' || selectedTicket?.status === 'CLOSED';

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={LifeBuoy}
        title="Escalated Support Desk"
        description="Monitor, assign and resolve escalated ICT support requests."
        meta={<IctStatusBadge status={pendingIctCount > 0 ? 'pending' : 'operational'} label={pendingIctCount > 0 ? `${pendingIctCount} AWAITING ICT` : 'QUEUE CLEAR'} />}
        actions={
          <IctTabs<StatusFilter>
            items={filterTabs}
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Ticket status filter"
          />
        }
      />

      {/* Escalation callout */}
      {pendingIctCount > 0 && (
        <div className="ict-card ict-bd-warning ict-bg-warning flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <span className="ict-bg-warning inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] text-[var(--ict-warn)]">
              <ShieldAlert className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-[12px] font-extrabold text-[var(--text-primary)] ">
                {pendingIctCount} escalated ticket{pendingIctCount === 1 ? '' : 's'} awaiting ICT resolution
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] ">
                Super Admin transferred these for deep system inspection. Resolution notifies both the Super Admin and the
                reporter automatically.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING_ICT_ADMIN')}
            className={`${ictBtnPrimary} shrink-0`}
          >
            Open escalated queue ({pendingIctCount})
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <IctMetricCard label="Escalated to ICT" value={pendingIctCount} icon={ShieldAlert} tone="warning" />
        <IctMetricCard label="ICT resolved" value={resolvedIctCount} icon={UserCheck} tone="success" />
        <IctMetricCard label="Total tickets" value={tickets.length} icon={LifeBuoy} tone="info" />
        <IctMetricCard label="Open / in progress" value={openCount} icon={Clock} tone="default" hint="Handled outside the escalated queue" />
      </div>

      {/* Queue */}
      <IctSection
        icon={FileText}
        title="Ticket Queue"
        description="Filter and review escalated technical support cases"
        actions={
          <span className="ict-label">
            {filteredTickets.length} of {tickets.length} shown
          </span>
        }
      >
        <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <IctSearchInput
            label="Search tickets by name, email, student ID or message"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search name, email, student ID, message…"
            resultCount={filteredTickets.length}
            className="w-full lg:max-w-md"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className={ictBtnXs}>
              Clear search
            </button>
          )}
        </div>

        {loadError ? (
          <IctErrorState
            title="Unable to load the support queue"
            description={loadError}
            onRetry={fetchTickets}
            retryLabel="Reload queue"
          />
        ) : (
          <IctDataTable
            columns={columns}
            rows={filteredTickets}
            rowKey={(t) => t.id}
            caption="Escalated ICT support tickets"
            summary={`${filteredTickets.length} tickets matching the ${statusFilter} filter`}
            loading={isLoading}
            loadingRows={4}
            empty={
              <IctEmptyState
                icon={searchQuery ? Search : LifeBuoy}
                tone={searchQuery ? 'neutral' : 'success'}
                title={searchQuery ? 'No tickets match this search' : 'No active escalated tickets'}
                description={
                  searchQuery
                    ? 'Adjust the search terms or switch the status filter to widen the result set.'
                    : 'Nothing is waiting on the ICT Administrator. New escalations from Super Admin will appear here automatically.'
                }
                action={
                  searchQuery ? (
                    <button type="button" onClick={() => setSearchQuery('')} className={ictBtnSecondary}>
                      Clear search
                    </button>
                  ) : (
                    <button type="button" onClick={() => setStatusFilter('ALL')} className={ictBtnSecondary}>
                      Show all tickets
                    </button>
                  )
                }
              />
            }
            footer={
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] px-3 py-2 text-[11px] text-[var(--text-muted)] ">
                <span>
                  Showing <strong className="text-[var(--text-primary)] ">{filteredTickets.length}</strong> of{' '}
                  <strong className="text-[var(--text-primary)] ">{tickets.length}</strong> tickets
                </span>
                {isLoading && (
                  <IctSkeletonRegion label="Refreshing ticket queue">
                    <span className="ict-label">Syncing…</span>
                  </IctSkeletonRegion>
                )}
              </div>
            }
          />
        )}
      </IctSection>

      {/* ── Ticket detail ───────────────────────────────────────── */}
      <IctModal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        width="lg"
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="ict-mono text-[var(--ict-accent-text)]">#{selectedTicket?.id.substring(0, 8)}</span>
            <IctStatusBadge status={selectedTicket?.status} />
          </span>
        }
        description={
          selectedTicket && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[11px] font-bold text-[var(--text-primary)] ">
                {selectedTicket.fullName}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">{selectedTicket.contactEmail}</span>
              <span className="text-[11px] text-[var(--text-muted)]">
                {selectedTicket.phone || 'No phone'} · {new Date(selectedTicket.createdAt).toLocaleString()}
              </span>
            </span>
          )
        }
        icon={<FileText className="h-3.5 w-3.5" aria-hidden />}
        footer={
          ticketClosed ? (
            <button type="button" onClick={() => setSelectedTicket(null)} className={ictBtnSecondary}>
              Close
            </button>
          ) : (
            <>
              <button type="button" onClick={() => setSelectedTicket(null)} className={ictBtnSecondary}>
                Cancel
              </button>
              <button
                type="submit"
                form="ict-ticket-resolution"
                disabled={isResolving}
                className={ictBtnSuccess}
              >
                <Send className="h-3.5 w-3.5" aria-hidden />
                {isResolving ? 'Resolving & Notifying…' : 'Resolve & Notify Super Admin & Alumni'}
              </button>
            </>
          )
        }
      >
        {selectedTicket && (
          <div className="space-y-4 text-[11px]">
            {selectedTicket.escalationNotes && (
              <div className="rounded-[6px] border border-[var(--ict-warn-line)] bg-[var(--ict-warn-bg)] p-3">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[var(--ict-warn)]">
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                  Super Admin escalation notes
                </p>
                <p className="text-[12px] font-semibold leading-relaxed text-[var(--text-primary)] ">
                  &ldquo;{selectedTicket.escalationNotes}&rdquo;
                </p>
              </div>
            )}

            <IctKeyValueGrid
              columns={4}
              items={[
                { label: 'Category', value: getCategoryLabel(selectedTicket.category) },
                { label: 'Student ID', value: selectedTicket.studentId || 'N/A', mono: true },
                { label: 'Graduation year', value: selectedTicket.graduationYear || 'N/A', mono: true },
                { label: 'Last route', value: selectedTicket.route || '/', mono: true },
                { label: 'Error code', value: selectedTicket.lastErrorCode || 'NONE', mono: true },
                { label: 'Session ID', value: selectedTicket.sessionId || '—', mono: true },
                { label: 'Assigned role', value: selectedTicket.assignedToRole || 'Unassigned' },
                { label: 'Last update', value: new Date(selectedTicket.updatedAt).toLocaleString() },
              ]}
            />

            <div>
              <p className="ict-label mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[var(--ict-accent-text)]" aria-hidden />
                Reporter problem statement
              </p>
              <div className="rounded-[6px] border border-l-[3px] border-l-[var(--ict-accent)] border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] p-3 text-[12px] font-medium leading-relaxed text-[var(--text-primary)]  ">
                {selectedTicket.message}
              </div>
            </div>

            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
              <div>
                <p className="ict-label mb-1.5">Attachments</p>
                <ul className="space-y-1">
                  {selectedTicket.attachments.map((file) => (
                    <li key={file} className="ict-mono ict-clamp-1 text-[var(--text-secondary)]">
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ticketClosed ? (
              <div className="space-y-2.5 border-t border-[var(--ict-hairline)] pt-4">
                <p className="flex items-center gap-2 text-[12px] font-extrabold text-[var(--text-primary)] ">
                  <UserCheck className="h-4 w-4 text-[var(--ict-ok)]" aria-hidden />
                  Ticket already {selectedTicket.status === 'CLOSED' ? 'closed' : 'resolved'}
                </p>
                {selectedTicket.responseNotes ? (
                  <div className="ict-bd-ok ict-bg-ok rounded-[6px] border p-3 text-[11px] leading-relaxed text-[var(--ict-ok)]">
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.06em]">Resolution notes</p>
                    {selectedTicket.responseNotes}
                  </div>
                ) : (
                  <p className="text-[11px] text-[var(--text-muted)]">
                    No resolution notes were recorded against this ticket.
                  </p>
                )}
              </div>
            ) : (
              <form id="ict-ticket-resolution" onSubmit={handleResolveTicket} className="space-y-3 border-t border-[var(--ict-hairline)] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-[12px] font-extrabold text-[var(--text-primary)] ">
                    <UserCheck className="h-4 w-4 text-[var(--ict-ok)]" aria-hidden />
                    ICT technical resolution
                  </p>
                  <IctStatusBadge status="info" label="Notifies Super Admin + reporter" showDot={false} />
                </div>

                <div>
                  <label htmlFor="ict-resolution-notes" className="ict-label mb-1 block">
                    Resolution notes (emailed to the reporter and Super Admin) *
                  </label>
                  <textarea
                    id="ict-resolution-notes"
                    rows={4}
                    placeholder="Explain how the technical issue was resolved in the database / system…"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className={ictTextarea}
                  />
                </div>

                <div className="ict-bd-info ict-bg-info flex items-start gap-2 rounded-[6px] border p-2.5 text-[11px] leading-relaxed text-[var(--ict-info)]">
                  <BellRing className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    Submitting marks the ticket <strong>RESOLVED</strong>, sends an in-app notification and email to Super
                    Admin, and notifies the reporter by email and in-app notification.
                  </span>
                </div>

                <p className="flex items-center justify-end gap-1.5 text-[10px] text-[var(--text-muted)]">
                  <X className="h-3 w-3" aria-hidden />
                  Cancel above dismisses without changing the ticket.
                </p>
              </form>
            )}
          </div>
        )}
      </IctModal>
    </div>
  );
}
