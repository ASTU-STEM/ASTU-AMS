import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Mail,
  Maximize2,
  Minimize2,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import registrationService, { AlumniRegistration, RegistrationFormConfig } from '../services/registration.service';
import contentService from '../services/content.service';
import { ContentCardItem } from '../components/ContentCard';

export default function AnnouncementRegistrations() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedContentId = searchParams.get('contentId') || 'all';

  const [registrations, setRegistrations] = useState<AlumniRegistration[]>([]);
  const [contentItems, setContentItems] = useState<ContentCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dedicated Full Screen Mode Toggle
  const [fullScreenMode, setFullScreenMode] = useState(false);

  // Detail View Modal for a registrant
  const [selectedRegDetail, setSelectedRegDetail] = useState<AlumniRegistration | null>(null);

  // Form Customizer CMS Modal
  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [formConfig, setFormConfig] = useState<RegistrationFormConfig>(() => registrationService.getFormConfig());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');

  // Manual Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [targetContentId, setTargetContentId] = useState<string>('C-003');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [classYear, setClassYear] = useState('Class of 2023');
  const [department, setDepartment] = useState('Software Engineering');
  const [currentEmployer, setCurrentEmployer] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<AlumniRegistration['employmentStatus']>('Employed Full-time');
  const [salaryRange, setSalaryRange] = useState('35,000 - 50,000 ETB');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Broadcast Reminder Modal
  const [broadcastReminderOpen, setBroadcastReminderOpen] = useState(false);
  const [reminderChannel, setReminderChannel] = useState<'both' | 'sms' | 'email'>('both');
  const [reminderMessage, setReminderMessage] = useState(
    'Notice from ASTU Alumni Directorate: Thank you for registering. Please ensure your employment and contact details are verified for upcoming university initiatives.'
  );
  const [sendingReminder, setSendingReminder] = useState(false);

  // Load Data
  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const allRegs = registrationService.getRegistrations();
      setRegistrations(allRegs);

      const items = contentService.getItems();
      const regItems = items.filter(
        (i) => i.requiresRegistration || allRegs.some((r) => r.contentId === i.id)
      );
      setContentItems(regItems.length > 0 ? regItems : items.slice(0, 3));
      setFormConfig(registrationService.getFormConfig());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('astu-ams-registrations-changed', handleSync);
    window.addEventListener('astu-ams-registration-config-changed', handleSync);
    return () => {
      window.removeEventListener('astu-ams-registrations-changed', handleSync);
      window.removeEventListener('astu-ams-registration-config-changed', handleSync);
    };
  }, [loadData]);

  // Derived Active List & Stats
  const activeList = useMemo(() => {
    if (selectedContentId === 'all') return registrations;
    return registrations.filter((r) => r.contentId === selectedContentId);
  }, [registrations, selectedContentId]);

  const stats = useMemo(() => {
    return registrationService.getStats(activeList);
  }, [activeList]);

  // Filtered Roster List
  const filteredRegistrations = useMemo(() => {
    return activeList.filter((reg) => {
      const matchStatus = statusFilter === 'all' || reg.status === statusFilter;
      const matchDept = deptFilter === 'all' || reg.department.toLowerCase().includes(deptFilter.toLowerCase());
      const matchEmployment = employmentFilter === 'all' || reg.employmentStatus === employmentFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        reg.fullName.toLowerCase().includes(q) ||
        reg.studentId.toLowerCase().includes(q) ||
        reg.email.toLowerCase().includes(q) ||
        reg.currentEmployer.toLowerCase().includes(q) ||
        reg.jobTitle.toLowerCase().includes(q) ||
        reg.contentTitle.toLowerCase().includes(q);

      return matchStatus && matchDept && matchEmployment && matchSearch;
    });
  }, [activeList, statusFilter, deptFilter, employmentFilter, searchQuery]);

  // Handlers
  const handleUpdateStatus = (id: string, status: AlumniRegistration['status']) => {
    registrationService.updateRegistrationStatus(id, status);
    toast.success(`Registration status updated to "${status}"`);
  };

  const handleToggleEtaVerified = (id: string) => {
    registrationService.toggleEtaVerified(id);
    toast.success('Updated ETA verification status');
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Remove registration for "${name}"?`)) return;
    registrationService.deleteRegistration(id);
    if (selectedRegDetail?.id === id) setSelectedRegDetail(null);
    toast.success('Registration record deleted');
  };

  const handleExport = () => {
    registrationService.exportToCsv(filteredRegistrations);
    toast.success('Roster exported to CSV format');
  };

  const handleSaveFormConfig = (e: React.FormEvent) => {
    e.preventDefault();
    registrationService.saveFormConfig(formConfig);
    setCustomizerModalOpen(false);
    toast.success('Registration Form CMS settings updated!');
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Full name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      const targetItem = contentItems.find((i) => i.id === targetContentId);
      registrationService.addRegistration({
        contentId: targetContentId,
        contentTitle: targetItem?.title || 'ASTU University Campaign',
        fullName: fullName.trim(),
        studentId: studentId.trim() || `UGR/${Math.floor(10000 + Math.random() * 90000)}/24`,
        email: email.trim(),
        phone: phone.trim() || '+251 91 000 0000',
        classYear: classYear.trim(),
        department: department.trim(),
        currentEmployer: currentEmployer.trim() || 'Pending Verification',
        jobTitle: jobTitle.trim() || 'Graduate Member',
        employmentStatus,
        salaryRange,
        status: 'Confirmed',
        accreditationVerified: true,
        notes: notes.trim() || 'Registered directly by Alumni Directorate Office.',
      });

      setFullName('');
      setStudentId('');
      setEmail('');
      setPhone('');
      setCurrentEmployer('');
      setJobTitle('');
      setNotes('');
      setAddModalOpen(false);
      toast.success('Alumnus registered successfully!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingReminder(true);
    setTimeout(() => {
      setSendingReminder(false);
      setBroadcastReminderOpen(false);
      toast.success(
        `Broadcast alert dispatched via ${reminderChannel.toUpperCase()} to ${filteredRegistrations.length} registered alumni!`
      );
    }, 600);
  };

  const selectedNotice = contentItems.find((i) => i.id === selectedContentId);

  // Helper renderer for table rows
  const renderTableRow = (reg: AlumniRegistration) => (
    <tr
      key={reg.id}
      onClick={() => setSelectedRegDetail(reg)}
      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
    >
      {/* Alumnus info */}
      <td className="py-3 px-4">
        <div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            {reg.fullName}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {reg.studentId}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            <span>{reg.email}</span>
            <span>·</span>
            <span>{reg.phone}</span>
          </div>
        </div>
      </td>

      {/* Registered Event / Campaign */}
      <td className="py-3 px-4">
        <div className="font-extrabold text-[#003366] dark:text-sky-300 line-clamp-1 max-w-[200px]" title={reg.contentTitle}>
          {reg.contentTitle}
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
          Ref: {reg.contentId}
        </div>
      </td>

      {/* Department & Class */}
      <td className="py-3 px-4">
        <div className="font-medium text-slate-800 dark:text-slate-200">{reg.department}</div>
        <div className="text-[10px] text-slate-400 font-semibold">{reg.classYear}</div>
      </td>

      {/* Employer & Role */}
      <td className="py-3 px-4">
        <div className="font-semibold text-slate-900 dark:text-white">{reg.jobTitle}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
          <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate max-w-[160px]">{reg.currentEmployer}</span>
        </div>
        {reg.salaryRange && (
          <div className="text-[10px] text-slate-400 mt-0.5">
            Salary: {reg.salaryRange}
          </div>
        )}
      </td>

      {/* Employment Status */}
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
            reg.employmentStatus === 'Employed Full-time'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : reg.employmentStatus === 'Self-employed / Founder'
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              : reg.employmentStatus === 'Further Studies'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {reg.employmentStatus}
        </span>
      </td>

      {/* Registration Date */}
      <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
        {reg.registeredAt}
      </td>

      {/* Status & ETA */}
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-1">
          <select
            value={reg.status}
            onChange={(e) => handleUpdateStatus(reg.id, e.target.value as any)}
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold focus:outline-none cursor-pointer border ${
              reg.status === 'Confirmed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : reg.status === 'Attended'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : reg.status === 'Pending Approval' || reg.status === 'Pending Verification'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : reg.status === 'Rejected'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <option value="Confirmed">Confirmed</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Attended">Attended</option>
            <option value="Waitlisted">Waitlisted</option>
            <option value="Rejected">Rejected</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                registrationService.approveRegistration(reg.id);
                toast.success(`Approved registration for ${reg.fullName}`);
              }}
              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
              title="Approve Registration"
            >
              ✓ Approve
            </button>
            <button
              type="button"
              onClick={() => {
                registrationService.declineRegistration(reg.id);
                toast.success(`Declined registration for ${reg.fullName}`);
              }}
              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 hover:bg-rose-200 cursor-pointer"
              title="Decline Registration"
            >
              ✕ Decline
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleToggleEtaVerified(reg.id)}
            className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
              reg.accreditationVerified
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            {reg.accreditationVerified ? 'ETA Verified' : 'Verify ETA'}
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedRegDetail(reg)}
            className="inline-flex h-7 px-2 py-1 items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            title="View Full Profile"
          >
            <Eye className="h-3 w-3" />
            <span>Details</span>
          </button>
          <button
            onClick={() => handleDelete(reg.id, reg.fullName)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
            title="Remove registration"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <AdminPageHeader
        title="Alumni Registrations & Roster Manager"
        subtitle="Manage graduate campaign rosters, contact coordinates, accreditation verification, and customize the registration form."
        breadcrumbs={[{ label: 'Alumni Directorate' }, { label: 'Registrations & Roster' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cms/registrations/full')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="Open Dedicated Full Page route (/cms/registrations/full)"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Dedicated Full Page</span>
            </button>

            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFD633] text-[#003366] px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Alumnus</span>
            </button>
          </div>
        }
      />

      {/* ── Sleek Utility Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Roster Tools:</span>

          <button
            onClick={() => registrationService.exportToPdf(filteredRegistrations)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3 py-1.5 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer"
            title="Export roster to printable PDF"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Export roster to CSV format"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-amber-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setCustomizerModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Customize public registration form fields"
          >
            <Settings className="h-3.5 w-3.5 text-blue-500" />
            <span>Customize Form</span>
          </button>
        </div>

        <button
          onClick={() => setBroadcastReminderOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy dark:bg-sky-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-sky-900 transition-all cursor-pointer shadow-xs"
        >
          <Send className="h-3.5 w-3.5 text-[#FFCC00]" />
          <span>Send Broadcast Alert</span>
        </button>
      </div>

      {/* ── Sleek Stats & Roster Overview Bar ─────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Registered</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total}</h3>
          </div>
          <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Users className="h-5 w-5" />
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ETA Verified Rate</span>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.etaComplianceRate}%</h3>
          </div>
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employability Rate</span>
            <h3 className="text-2xl font-black text-astu-navy dark:text-sky-400 mt-0.5">{stats.employabilityRate}%</h3>
          </div>
          <span className="p-2.5 rounded-xl bg-sky-50 text-astu-navy dark:bg-sky-950/50 dark:text-sky-400">
            <Building2 className="h-5 w-5" />
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.pending}</h3>
          </div>
          <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <UserCheck className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* ── Active Campaign Roster Selectors ─────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Campaign Rosters
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Showing {filteredRegistrations.length} of {activeList.length} registered members
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setSearchParams({ contentId: 'all' })}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedContentId === 'all'
                ? 'border-astu-navy dark:border-sky-400 bg-sky-50/60 dark:bg-sky-950/40 ring-1 ring-astu-navy'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consolidated</span>
              <span className="rounded-full bg-astu-navy text-white px-2 py-0.2 text-[10px] font-bold">
                {registrations.length}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">All Registered Members</h4>
            <p className="text-[10px] text-slate-500 mt-1">Unified view of all registered ASTU alumni</p>
          </button>

          {contentItems.map((item) => {
            const count = registrations.filter((r) => r.contentId === item.id).length;
            const isSelected = selectedContentId === item.id;
            const capacity = item.registrationCapacity || 500;
            const percent = Math.min(100, Math.round((count / capacity) * 100));

            return (
              <button
                key={item.id}
                onClick={() => setSearchParams({ contentId: item.id })}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-astu-navy dark:border-sky-400 bg-sky-50/60 dark:bg-sky-950/40 ring-1 ring-astu-navy'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate max-w-[120px]">
                      {item.registrationType || item.type}
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.2 text-[10px] font-bold">
                      {count} / {capacity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                </div>

                <div className="mt-2.5 space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-astu-navy dark:bg-sky-400 h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>{percent}% Filled</span>
                    {item.registrationDeadline && <span>Deadline: {item.registrationDeadline}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Data Table Card ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedNotice ? selectedNotice.title : 'All Registered Alumni Records'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Verified roster of graduates, contact channels, current employer, and employment status.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, ID, employer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-8 pr-7 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-astu-navy"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400 font-medium">Filter:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Attended">Attended</option>
              <option value="Waitlisted">Waitlisted</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Software">Software Engineering</option>
              <option value="Electrical">Electrical & Computer</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Chemical">Chemical Engineering</option>
              <option value="Civil">Civil Engineering</option>
            </select>

            <select
              value={employmentFilter}
              onChange={(e) => setEmploymentFilter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Employment</option>
              <option value="Employed Full-time">Employed Full-time</option>
              <option value="Self-employed / Founder">Self-employed / Founder</option>
              <option value="Further Studies">Further Studies</option>
              <option value="Seeking Opportunities">Seeking Opportunities</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || deptFilter !== 'all' || employmentFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDeptFilter('all');
                  setEmploymentFilter('all');
                }}
                className="text-[11px] font-semibold text-rose-600 hover:underline ml-auto cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Alumnus & Student ID</th>
                <th className="py-3 px-4">Registered Event / Campaign</th>
                <th className="py-3 px-4">Department & Class</th>
                <th className="py-3 px-4">Employer & Job Title</th>
                <th className="py-3 px-4">Employment Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4">Status & ETA Verified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-astu-navy dark:text-sky-400 mb-2" />
                    Loading registered alumni records…
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No registrations found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or register an alumnus manually.</p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => renderTableRow(reg))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3.5 px-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500">
          <span>Showing {filteredRegistrations.length} of {activeList.length} alumni registrations</span>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 font-bold text-astu-navy dark:text-sky-400 hover:underline cursor-pointer"
          >
            <Download className="h-3 w-3" /> Export Roster to CSV
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
         DEDICATED FULL SCREEN ROSTER VIEW OVERLAY
      ══════════════════════════════════════════════════════════════════════ */}
      {fullScreenMode && (
        <div className="fixed inset-0 z-50 bg-[#070d1e] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="p-4 px-6 border-b border-slate-800 bg-[#0b142e] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
                <Maximize2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Full Screen Registrations Roster Desk</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    {filteredRegistrations.length} Records
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Expanded full-viewport desk for high-volume audit, search, and roster verification.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Search */}
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Quick search roster..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#FFCC00]" />
                <span>Export Roster</span>
              </button>

              <button
                onClick={() => setFullScreenMode(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                <Minimize2 className="h-4 w-4" />
                <span>Exit Full Screen</span>
              </button>
            </div>
          </div>

          {/* Full Screen Table Container */}
          <div className="flex-1 overflow-auto p-6 bg-[#070d1e]">
            <div className="rounded-2xl border border-slate-800 bg-[#0d1733] shadow-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#111c3d] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Alumnus & Student ID</th>
                    <th className="py-3.5 px-4">Department & Class</th>
                    <th className="py-3.5 px-4">Employer & Job Title</th>
                    <th className="py-3.5 px-4">Employment Status</th>
                    <th className="py-3.5 px-4">Registered Date</th>
                    <th className="py-3.5 px-4">Status & ETA Verified</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRegistrations.map((reg) => renderTableRow(reg))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         MODAL: REGISTRANT DETAIL PROFILE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedRegDetail && (
        <AdminModal
          open={!!selectedRegDetail}
          title={`Alumnus Registration Profile: ${selectedRegDetail.fullName}`}
          onClose={() => setSelectedRegDetail(null)}
          size="lg"
        >
          <div className="space-y-5">
            {/* Header info card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-astu-navy text-white text-lg font-bold">
                  {selectedRegDetail.fullName.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedRegDetail.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedRegDetail.studentId} • {selectedRegDetail.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleEtaVerified(selectedRegDetail.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    selectedRegDetail.accreditationVerified
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {selectedRegDetail.accreditationVerified ? '✓ ETA Accreditation Verified' : 'Mark ETA Verified'}
                </button>
              </div>
            </div>

            {/* Profile Field Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRegDetail.email}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRegDetail.phone}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Class Graduation Year</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRegDetail.classYear}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Date</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{selectedRegDetail.registeredAt}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Employer</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRegDetail.currentEmployer}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Job Title</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRegDetail.jobTitle}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Employment Status</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRegDetail.employmentStatus}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Salary Benchmark</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRegDetail.salaryRange || 'N/A'}</p>
              </div>
            </div>

            {/* Notes */}
            {selectedRegDetail.notes && (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Verification Notes</span>
                <p className="text-slate-700 dark:text-slate-300">{selectedRegDetail.notes}</p>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDelete(selectedRegDetail.id, selectedRegDetail.fullName)}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Registration Record
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedRegDetail.email}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" /> Email Alumnus
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedRegDetail(null)}
                  className="rounded-lg bg-astu-navy text-white px-4 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         MODAL: CMS REGISTRATION FORM CUSTOMIZER
      ══════════════════════════════════════════════════════════════════════ */}
      <AdminModal
        open={customizerModalOpen}
        title="Registration Form CMS Customizer"
        onClose={() => setCustomizerModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSaveFormConfig} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Public Form Headline Title</label>
            <input
              type="text"
              value={formConfig.formTitle}
              onChange={(e) => setFormConfig({ ...formConfig, formTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Form Subtitle / Description</label>
            <textarea
              rows={2}
              value={formConfig.formSubtitle}
              onChange={(e) => setFormConfig({ ...formConfig, formSubtitle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Compliance Banner Note</label>
            <input
              type="text"
              value={formConfig.noticeBanner}
              onChange={(e) => setFormConfig({ ...formConfig, noticeBanner: e.target.value })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Form Field Requirements & Controls</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.requireStudentId}
                  onChange={(e) => setFormConfig({ ...formConfig, requireStudentId: e.target.checked })}
                  className="rounded text-astu-navy cursor-pointer"
                />
                <span>Student ID Number</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.requirePhone}
                  onChange={(e) => setFormConfig({ ...formConfig, requirePhone: e.target.checked })}
                  className="rounded text-astu-navy cursor-pointer"
                />
                <span>Phone Number Field</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.requireEmployer}
                  onChange={(e) => setFormConfig({ ...formConfig, requireEmployer: e.target.checked })}
                  className="rounded text-astu-navy cursor-pointer"
                />
                <span>Employer & Job Title</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.requireSalary}
                  onChange={(e) => setFormConfig({ ...formConfig, requireSalary: e.target.checked })}
                  className="rounded text-astu-navy cursor-pointer"
                />
                <span>Salary Range Field</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={formConfig.allowPublicRegistration}
                  onChange={(e) => setFormConfig({ ...formConfig, allowPublicRegistration: e.target.checked })}
                  className="rounded text-astu-navy cursor-pointer"
                />
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Allow Public Self-Registration (/register)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Registration Success Message</label>
            <input
              type="text"
              value={formConfig.successMessage}
              onChange={(e) => setFormConfig({ ...formConfig, successMessage: e.target.value })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCustomizerModalOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-astu-navy text-white px-5 py-2 text-xs font-bold hover:brightness-110 transition-colors shadow-sm cursor-pointer"
            >
              Save Form Settings
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ── MODAL 1: MANUAL REGISTRATION MODAL ────────────────────────────── */}
      <AdminModal
        open={addModalOpen}
        title="Register Alumnus for Notice / Campaign"
        onClose={() => setAddModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleManualAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Announcement / Campaign <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetContentId}
              onChange={(e) => setTargetContentId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {contentItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.registrationType || item.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Yared Hailu"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Student ID</label>
              <input
                type="text"
                placeholder="e.g. UGR/14205/12"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="alumnus@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+251 91 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Electrical & Computer Engineering">Electrical & Computer</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Architecture">Architecture</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Class Year</label>
              <input
                type="text"
                placeholder="Class of 2023"
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Employer</label>
              <input
                type="text"
                placeholder="e.g. Safaricom Ethiopia"
                value={currentEmployer}
                onChange={(e) => setCurrentEmployer(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Systems Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employment Status</label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Employed Full-time">Employed Full-time</option>
                <option value="Self-employed / Founder">Self-employed / Founder</option>
                <option value="Further Studies">Further Studies</option>
                <option value="Seeking Opportunities">Seeking Opportunities</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Range</label>
              <input
                type="text"
                placeholder="35,000 - 50,000 ETB"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy dark:bg-sky-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
              {submitting ? 'Registering…' : 'Save Registration'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ── MODAL 2: SEND BROADCAST ALERT MODAL ───────────────────────────── */}
      <AdminModal
        open={broadcastReminderOpen}
        title="Broadcast Alert to Registered Alumni"
        onClose={() => setBroadcastReminderOpen(false)}
        size="md"
      >
        <form onSubmit={handleSendReminderSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs">
            <span className="font-bold text-astu-navy dark:text-sky-300">Target Recipients: </span>
            <span className="text-slate-700 dark:text-slate-300">
              {filteredRegistrations.length} alumni in selected roster ({selectedNotice ? selectedNotice.title : 'All Registrations'})
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Channel</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'both', label: 'SMS & Email', icon: Zap },
                { id: 'sms', label: 'SMS Gateway', icon: Phone },
                { id: 'email', label: 'Email Gateway', icon: Mail },
              ].map((ch) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setReminderChannel(ch.id as any)}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      reminderChannel === ch.id
                        ? 'border-astu-navy bg-astu-navy text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Broadcast Message Content
            </label>
            <textarea
              rows={4}
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBroadcastReminderOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingReminder}
              className="inline-flex items-center gap-1.5 rounded-lg bg-astu-navy dark:bg-sky-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {sendingReminder ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {sendingReminder ? 'Dispatching…' : 'Dispatch Broadcast'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
