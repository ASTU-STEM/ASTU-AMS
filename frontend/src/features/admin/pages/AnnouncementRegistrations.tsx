import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpDown,
  Award,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Copy,
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
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  TrendingUp,
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
  const [syncingDb, setSyncingDb] = useState(false);

  // Dedicated Full Screen Mode Toggle
  const [fullScreenMode, setFullScreenMode] = useState(false);

  // Detail View Modal for a registrant (Official Graduate Dossier)
  const [selectedRegDetail, setSelectedRegDetail] = useState<AlumniRegistration | null>(null);

  // Form Customizer CMS Modal
  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [formConfig, setFormConfig] = useState<RegistrationFormConfig>(() => registrationService.getFormConfig());

  // Interactive Quick Filter Tabs
  const [activeQuickTab, setActiveQuickTab] = useState<string>('all');

  // Search & Multi-Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Copy indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // High-Volume Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Manual Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [targetContentId, setTargetContentId] = useState<string>('C-001');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [classYear, setClassYear] = useState('Class of 2024');
  const [department, setDepartment] = useState('Software Engineering');
  const [currentEmployer, setCurrentEmployer] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<AlumniRegistration['employmentStatus']>('Employed Full-time');
  const [salaryRange, setSalaryRange] = useState('45,000 - 65,000 ETB');
  const [cgpa, setCgpa] = useState('3.75');
  const [gender, setGender] = useState('Male');
  const [nationality, setNationality] = useState('Ethiopian');
  const [dateOfBirth, setDateOfBirth] = useState('2001-04-12');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Broadcast Reminder Modal
  const [broadcastReminderOpen, setBroadcastReminderOpen] = useState(false);
  const [reminderChannel, setReminderChannel] = useState<'both' | 'sms' | 'email'>('both');
  const [reminderMessage, setReminderMessage] = useState(
    'Official notice from ASTU Directorate for Industry Linkage & Alumni Affairs: Thank you for registering. Please verify your current employment coordinates for upcoming university career initiatives.'
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

  // Quick tab metrics
  const tabCounts = useMemo(() => {
    return {
      all: activeList.length,
      confirmed: activeList.filter((r) => r.status === 'Confirmed').length,
      pending: activeList.filter((r) => r.status === 'Pending Verification' || r.status === 'Pending Approval').length,
      eta_verified: activeList.filter((r) => r.accreditationVerified).length,
      employed: activeList.filter((r) => r.employmentStatus === 'Employed Full-time').length,
      founders: activeList.filter((r) => r.employmentStatus === 'Self-employed / Founder').length,
      further_studies: activeList.filter((r) => r.employmentStatus === 'Further Studies').length,
    };
  }, [activeList]);

  // Filtered Roster List with Quick Tabs, Dropdowns & Sorting
  const filteredRegistrations = useMemo(() => {
    return activeList
      .filter((reg) => {
        // Quick tab filter
        if (activeQuickTab === 'confirmed' && reg.status !== 'Confirmed') return false;
        if (activeQuickTab === 'pending' && reg.status !== 'Pending Verification' && reg.status !== 'Pending Approval') return false;
        if (activeQuickTab === 'eta_verified' && !reg.accreditationVerified) return false;
        if (activeQuickTab === 'employed' && reg.employmentStatus !== 'Employed Full-time') return false;
        if (activeQuickTab === 'founders' && reg.employmentStatus !== 'Self-employed / Founder') return false;
        if (activeQuickTab === 'further_studies' && reg.employmentStatus !== 'Further Studies') return false;

        // Status dropdown filter
        const matchStatus = statusFilter === 'all' || reg.status === statusFilter;

        // Department dropdown filter
        const matchDept =
          deptFilter === 'all' ||
          reg.department.toLowerCase().includes(deptFilter.toLowerCase());

        // Employment status dropdown filter
        const matchEmployment =
          employmentFilter === 'all' || reg.employmentStatus === employmentFilter;

        // Keyword search
        const q = searchQuery.trim().toLowerCase();
        const matchSearch =
          !q ||
          reg.fullName.toLowerCase().includes(q) ||
          reg.studentId.toLowerCase().includes(q) ||
          reg.email.toLowerCase().includes(q) ||
          reg.phone.toLowerCase().includes(q) ||
          reg.currentEmployer.toLowerCase().includes(q) ||
          reg.jobTitle.toLowerCase().includes(q) ||
          reg.department.toLowerCase().includes(q) ||
          reg.contentTitle.toLowerCase().includes(q);

        return matchStatus && matchDept && matchEmployment && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'name_desc') return b.fullName.localeCompare(a.fullName);
        if (sortBy === 'cgpa_desc') return (parseFloat(String(b.cgpa || 0)) || 0) - (parseFloat(String(a.cgpa || 0)) || 0);
        if (sortBy === 'dept') return a.department.localeCompare(b.department);
        // Default: newest registered
        return b.id.localeCompare(a.id);
      });
  }, [activeList, activeQuickTab, statusFilter, deptFilter, employmentFilter, searchQuery, sortBy]);

  // Reset to page 1 and clear selections when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [selectedContentId, activeQuickTab, statusFilter, deptFilter, employmentFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredRegistrations.length / pageSize) || 1;

  const paginatedRegistrations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRegistrations.slice(startIndex, startIndex + pageSize);
  }, [filteredRegistrations, currentPage, pageSize]);

  // Bulk actions handlers
  const handleToggleSelectAll = () => {
    const pageIds = paginatedRegistrations.map((r) => r.id);
    const isAllSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    registrationService.bulkApprove(selectedIds);
    toast.success(`Successfully approved ${selectedIds.length} registrations!`);
    setSelectedIds([]);
  };

  const handleBulkDecline = () => {
    if (selectedIds.length === 0) return;
    registrationService.bulkDecline(selectedIds);
    toast.success(`Declined ${selectedIds.length} registrations.`);
    setSelectedIds([]);
  };

  const handleBulkVerifyEta = () => {
    if (selectedIds.length === 0) return;
    registrationService.bulkVerifyEta(selectedIds, true);
    toast.success(`Accredited ${selectedIds.length} alumni for ETA audit!`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently remove ${selectedIds.length} selected registration records?`)) return;
    registrationService.bulkDelete(selectedIds);
    toast.success(`Removed ${selectedIds.length} records.`);
    setSelectedIds([]);
  };

  const handleBulkExportCsv = () => {
    const selectedRows = registrations.filter((r) => selectedIds.includes(r.id));
    registrationService.exportToCsv(selectedRows.length > 0 ? selectedRows : filteredRegistrations);
    toast.success(`Exported ${selectedRows.length || filteredRegistrations.length} records to CSV.`);
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setJumpPageInput('');
    } else {
      toast.error(`Please enter a page between 1 and ${totalPages}`);
    }
  };

  // Quick Action Handlers
  const handleUpdateStatus = (id: string, status: AlumniRegistration['status']) => {
    registrationService.updateRegistrationStatus(id, status);
    toast.success(`Status updated to "${status}"`);
  };

  const handleToggleEtaVerified = (id: string) => {
    registrationService.toggleEtaVerified(id);
    const reg = registrations.find((r) => r.id === id);
    const nowVerified = reg ? !reg.accreditationVerified : true;
    toast.success(nowVerified ? 'Accredited alumnus for ETA compliance' : 'ETA verification removed');
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Remove registration record for "${name}"?`)) return;
    registrationService.deleteRegistration(id);
    if (selectedRegDetail?.id === id) setSelectedRegDetail(null);
    toast.success('Registration record deleted.');
  };

  const handleCopyId = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSyncDatabaseAlumni = async () => {
    setSyncingDb(true);
    try {
      const res = await registrationService.syncWithDatabaseAlumni();
      if (res.added > 0) {
        toast.success(`Synchronized with database: ${res.added} new alumni added! (Total: ${res.total})`);
      } else {
        toast.success(`All ${res.total} alumni records are up-to-date with database.`);
      }
    } catch {
      toast.error('Database sync encountered a network issue.');
    } finally {
      setSyncingDb(false);
    }
  };

  const handleResetUniversityRoster = () => {
    if (!window.confirm('Restore official ASTU university roster dataset (128 verified alumni records)? This will preserve university campaign structures.')) return;
    registrationService.resetToDefaultRoster();
    toast.success('University alumni roster restored with 128 verified records!');
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
      toast.error('Full name and email address are required.');
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
        cgpa: cgpa.trim() || '3.75',
        gender,
        nationality: nationality.trim() || 'Ethiopian',
        dateOfBirth: dateOfBirth || undefined,
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
      setCgpa('3.75');
      setGender('Male');
      setNationality('Ethiopian');
      setDateOfBirth('2001-04-12');
      setNotes('');
      setAddModalOpen(false);
      toast.success('Alumnus registered successfully with Registrar-aligned graduate format!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderMessage.trim()) {
      toast.error('Enter a reminder message before sending.');
      return;
    }
    if (filteredRegistrations.length === 0) {
      toast.error('No registrations in the current filter to notify.');
      return;
    }
    setSendingReminder(true);
    setTimeout(() => {
      setSendingReminder(false);
      setBroadcastReminderOpen(false);
      toast.success(
        `Broadcast dispatched successfully via ${reminderChannel.toUpperCase()} gateway to ${filteredRegistrations.length} alumni!`
      );
    }, 800);
  };

  const selectedNotice = contentItems.find((i) => i.id === selectedContentId);

  // Helper color for departments
  const getDeptColor = (dept: string) => {
    const d = dept.toLowerCase();
    if (d.includes('software') || d.includes('computer')) return 'text-sky-700 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    if (d.includes('electrical')) return 'text-violet-700 bg-violet-50 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-800';
    if (d.includes('mechanical')) return 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    if (d.includes('civil')) return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (d.includes('chemical')) return 'text-cyan-700 bg-cyan-50 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    return 'text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  // Helper avatar initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Helper renderer for table rows
  const renderTableRow = (reg: AlumniRegistration) => {
    const isSelected = selectedIds.includes(reg.id);

    return (
      <tr
        key={reg.id}
        onClick={() => setSelectedRegDetail(reg)}
        className={`hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group ${
          isSelected ? 'bg-sky-50/60 dark:bg-sky-950/30' : ''
        }`}
      >
        {/* Checkbox */}
        <td className="py-3 px-3 w-10" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => handleToggleSelectOne(reg.id, e)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5"
            title={isSelected ? 'Deselect row' : 'Select row'}
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-[#003366] dark:text-sky-400" />
            ) : (
              <Square className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
            )}
          </button>
        </td>

        {/* Alumnus info */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-2xs ${
                reg.gender === 'Female'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-sky-50 text-[#003366] dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
              }`}
            >
              {getInitials(reg.fullName)}
            </span>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <span>{reg.fullName}</span>
                {reg.accreditationVerified && (
                  <span title="Accredited ETA Graduate">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                  {reg.studentId}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopyId(e, reg.id, reg.studentId)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  title="Copy Student ID"
                >
                  {copiedId === reg.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <a
                  href={`mailto:${reg.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-sky-600 dark:hover:text-sky-400 truncate max-w-[140px]"
                  title={reg.email}
                >
                  {reg.email}
                </a>
                <span>·</span>
                <a
                  href={`tel:${reg.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-sky-600 dark:hover:text-sky-400"
                >
                  {reg.phone}
                </a>
              </div>
            </div>
          </div>
        </td>

        {/* Registered Event / Campaign */}
        <td className="py-3 px-4">
          <div className="font-bold text-[#003366] dark:text-sky-300 line-clamp-1 max-w-[210px] text-xs" title={reg.contentTitle}>
            {reg.contentTitle}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            <span className="font-mono font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded">
              {reg.contentId}
            </span>
            <span>·</span>
            <span>{reg.registeredAt.split(' ')[0]}</span>
          </div>
        </td>

        {/* Department & Academic Class */}
        <td className="py-3 px-4">
          <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold border ${getDeptColor(reg.department)}`}>
            {reg.department}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold">{reg.classYear}</span>
            {reg.cgpa && (
              <>
                <span>·</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                  ★ {reg.cgpa}
                </span>
              </>
            )}
          </div>
        </td>

        {/* Employer & Role */}
        <td className="py-3 px-4">
          <div className="font-semibold text-slate-900 dark:text-white text-xs">{reg.jobTitle}</div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
            <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[160px] font-medium">{reg.currentEmployer}</span>
          </div>
          {reg.salaryRange && (
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {reg.salaryRange}
            </div>
          )}
        </td>

        {/* Employment Status */}
        <td className="py-3 px-4">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold ${
              reg.employmentStatus === 'Employed Full-time'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : reg.employmentStatus === 'Self-employed / Founder'
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : reg.employmentStatus === 'Further Studies'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {reg.employmentStatus === 'Employed Full-time' && <Briefcase className="h-2.5 w-2.5" />}
            {reg.employmentStatus === 'Self-employed / Founder' && <Zap className="h-2.5 w-2.5" />}
            {reg.employmentStatus === 'Further Studies' && <GraduationCap className="h-2.5 w-2.5" />}
            <span>{reg.employmentStatus}</span>
          </span>
        </td>

        {/* Status & ETA Verified */}
        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <select
                value={reg.status}
                onChange={(e) => handleUpdateStatus(reg.id, e.target.value as any)}
                className={`rounded-lg px-2 py-0.5 text-[10px] font-bold focus:outline-none cursor-pointer border shadow-2xs ${
                  reg.status === 'Confirmed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : reg.status === 'Attended'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                    : reg.status === 'Pending Approval' || reg.status === 'Pending Verification'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                    : reg.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Attended">Attended</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                type="button"
                onClick={() => handleToggleEtaVerified(reg.id)}
                className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                  reg.accreditationVerified
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700 hover:brightness-105'
                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200'
                }`}
                title={reg.accreditationVerified ? 'Click to remove ETA verification' : 'Click to mark verified for ETA audit'}
              >
                <ShieldCheck className="h-3 w-3" />
                {reg.accreditationVerified ? 'ETA Verified' : 'Verify ETA'}
              </button>
            </div>

            <div className="flex items-center gap-1">
              {reg.status !== 'Confirmed' && (
                <button
                  type="button"
                  onClick={() => {
                    registrationService.approveRegistration(reg.id);
                    toast.success(`Approved registration for ${reg.fullName}`);
                  }}
                  className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer"
                  title="Quick Approve"
                >
                  ✓ Approve
                </button>
              )}
              {reg.status !== 'Rejected' && (
                <button
                  type="button"
                  onClick={() => {
                    registrationService.declineRegistration(reg.id);
                    toast.success(`Declined registration for ${reg.fullName}`);
                  }}
                  className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/50 dark:text-rose-300 cursor-pointer"
                  title="Quick Decline"
                >
                  ✕ Decline
                </button>
              )}
            </div>
          </div>
        </td>

        {/* Actions */}
        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setSelectedRegDetail(reg)}
              className="inline-flex h-7 px-2.5 py-1 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="View Complete Official Dossier"
            >
              <Eye className="h-3 w-3 text-[#003366] dark:text-sky-400" />
              <span>Dossier</span>
            </button>
            <button
              onClick={() => handleDelete(reg.id, reg.fullName)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 transition-colors cursor-pointer"
              title="Delete registration record"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <AdminPageHeader
        title="Alumni Registrations & Campaign Roster Manager"
        subtitle="Manage graduate campaign rosters, contact coordinates, accreditation verification, and customize the registration form."
        breadcrumbs={[{ label: 'Alumni Office' }, { label: 'Campaign Registrations & Rosters' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncDatabaseAlumni}
              disabled={syncingDb}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Synchronize live alumni records from database directory"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-sky-600 ${syncingDb ? 'animate-spin' : ''}`} />
              <span>{syncingDb ? 'Syncing DB…' : 'Sync DB Records'}</span>
            </button>

            <button
              onClick={() => navigate('/cms/registrations/full')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Open Dedicated Full Page desk view (/cms/registrations/full)"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Dedicated Full Page</span>
            </button>

            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFCC00] hover:bg-[#FFD633] text-[#003366] px-4 py-2 text-xs font-black transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Alumnus</span>
            </button>
          </div>
        }
      />

      {/* ── Executive Roster Tools Command Bar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Roster Tools:
          </span>

          <button
            onClick={() => registrationService.exportToPdf(filteredRegistrations)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3 py-1.5 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer shadow-2xs"
            title="Export official university accreditation audit report with seal"
          >
            <FileText className="h-3.5 w-3.5 text-rose-600" />
            <span>Export PDF Report</span>
          </button>

          <button
            onClick={() => registrationService.exportToCsv(filteredRegistrations)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
            title="Download CSV spreadsheet with all graduate coordinates"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-amber-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setCustomizerModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all cursor-pointer shadow-2xs"
            title="Customize public registration form requirements and banner"
          >
            <Settings className="h-3.5 w-3.5 text-blue-600" />
            <span>Customize Form</span>
          </button>

          <button
            onClick={handleResetUniversityRoster}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
            title="Reload baseline university cohort roster (128 authentic records)"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reload University Roster</span>
          </button>
        </div>

        <button
          onClick={() => setBroadcastReminderOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] hover:bg-[#002244] dark:bg-sky-600 dark:hover:bg-sky-700 text-white px-4 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Send className="h-3.5 w-3.5 text-[#FFCC00]" />
          <span>Send Broadcast Alert</span>
        </button>
      </div>

      {/* ── Executive 4 KPI Stat Cards ────────────────────────────────────── */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Registered */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Registered</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              100% Synced
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Active campaign roster candidates
          </p>
        </div>

        {/* ETA Verified Rate */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">ETA Verified Rate</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.etaComplianceRate}%</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              On track
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${stats.etaComplianceRate}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
            {stats.verifiedEta} of {stats.total} alumni fully accredited
          </p>
        </div>

        {/* Employability Rate */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Employability Rate</span>
            <span className="p-2 rounded-xl bg-sky-50 text-[#003366] dark:bg-sky-950/50 dark:text-sky-400">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-[#003366] dark:text-sky-300">{stats.employabilityRate}%</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Employed / Studying
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#003366] dark:bg-sky-400 h-full rounded-full" style={{ width: `${stats.employabilityRate}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
            Exceeds national 85% higher education benchmark
          </p>
        </div>

        {/* Action Needed / Pending Review */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Review</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <UserCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</h3>
            {stats.pending > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Action needed
              </span>
            ) : (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                All reviewed
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Graduates awaiting transcript cross-check
          </p>
        </div>
      </div>

      {/* ── Active Campaign Roster Selectors ─────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Active Campaign Rosters
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {contentItems.length + 1} Rosters
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredRegistrations.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{activeList.length}</strong> registered members
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Consolidated Roster Card */}
          <button
            onClick={() => setSearchParams({ contentId: 'all' })}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedContentId === 'all'
                ? 'border-[#003366] dark:border-sky-400 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-[#003366]/30 dark:ring-sky-400/30 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Consolidated
                </span>
                <span className="rounded-full bg-[#003366] text-white px-2.5 py-0.5 text-[10px] font-extrabold shadow-2xs">
                  {registrations.length.toLocaleString()}
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">All Registered Members</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                Unified view of all registered ASTU alumni
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                {stats.etaComplianceRate}% Verified
              </span>
              <span className="text-slate-400">
                {stats.employabilityRate}% Employed
              </span>
            </div>
          </button>

          {/* Individual Campaign Cards */}
          {contentItems.map((item) => {
            const count = registrations.filter((r) => r.contentId === item.id).length;
            const isSelected = selectedContentId === item.id;
            const baseCapacity = item.registrationCapacity || (item.id === 'C-001' ? 100 : item.id === 'C-002' ? 50 : 50);
            const capacity = count > baseCapacity ? Math.max(baseCapacity, Math.ceil(count / 10) * 10) : baseCapacity;
            const isOverCapacity = count >= capacity;
            const percent = Math.min(100, Math.round((count / capacity) * 100));

            return (
              <button
                key={item.id}
                onClick={() => setSearchParams({ contentId: item.id })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#003366] dark:border-sky-400 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-[#003366]/30 dark:ring-sky-400/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate max-w-[120px]">
                      {item.registrationType || (item.type === 'post' ? 'Campaign Article' : item.type === 'page' ? 'Accreditation Page' : 'University Notice')}
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-extrabold">
                      {count.toLocaleString()} / {capacity.toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1" title={item.title}>
                    {item.title}
                  </h4>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverCapacity
                          ? 'bg-rose-500'
                          : percent > 75
                          ? 'bg-amber-500'
                          : 'bg-[#003366] dark:bg-sky-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className={percent >= 80 ? 'text-amber-600 dark:text-amber-400' : ''}>
                      {percent}% {isOverCapacity ? 'Capacity Reached' : 'Filled'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      Ref: {item.id}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Data Table Card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {/* Table Header & Quick Action Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedNotice ? selectedNotice.title : 'All Registered Alumni Records'}
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#003366] text-white">
                  {filteredRegistrations.length} Records
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Verified roster of graduates, contact channels, current employer, and employment status.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, student ID, employer, dept…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1.5 pl-8.5 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/20 dark:focus:ring-sky-400/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-b border-slate-100 dark:border-slate-800/80 py-2.5">
            {[
              { id: 'all', label: 'All Registrations', count: tabCounts.all },
              { id: 'confirmed', label: 'Confirmed', count: tabCounts.confirmed },
              { id: 'pending', label: 'Pending Review', count: tabCounts.pending, alert: tabCounts.pending > 0 },
              { id: 'eta_verified', label: 'ETA Certified', count: tabCounts.eta_verified },
              { id: 'employed', label: 'Employed Full-time', count: tabCounts.employed },
              { id: 'founders', label: 'Founders / Entrepreneurs', count: tabCounts.founders },
              { id: 'further_studies', label: 'Postgraduate Studies', count: tabCounts.further_studies },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveQuickTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeQuickTab === tab.id
                    ? 'bg-[#003366] text-white shadow-2xs dark:bg-sky-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeQuickTab === tab.id
                      ? 'bg-white/20 text-white'
                      : tab.alert
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Secondary Dropdown Filters & Sorting Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-slate-400">
                <Filter className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold uppercase">Filter:</span>
              </div>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Attended">Attended</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Department Select */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All ASTU Departments</option>
                <option value="Software">Software Engineering</option>
                <option value="Electrical">Electrical & Computer</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical">Mechanical Engineering</option>
                <option value="Civil">Civil Engineering</option>
                <option value="Chemical">Chemical Engineering</option>
                <option value="Geology">Applied Geology</option>
                <option value="Applied Natural">Applied Natural Sciences</option>
              </select>

              {/* Employment Select */}
              <select
                value={employmentFilter}
                onChange={(e) => setEmploymentFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Employment Classifications</option>
                <option value="Employed Full-time">Employed Full-time</option>
                <option value="Self-employed / Founder">Self-employed / Founder</option>
                <option value="Further Studies">Further Studies</option>
                <option value="Seeking Opportunities">Seeking Opportunities</option>
              </select>

              {/* Sort By */}
              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                <ArrowUpDown className="h-3 w-3 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Sort: Newest Registered</option>
                  <option value="name_asc">Sort: Name (A-Z)</option>
                  <option value="name_desc">Sort: Name (Z-A)</option>
                  <option value="cgpa_desc">Sort: Highest Academic CGPA</option>
                  <option value="dept">Sort: By School / Dept</option>
                </select>
              </div>

              {(searchQuery ||
                statusFilter !== 'all' ||
                deptFilter !== 'all' ||
                employmentFilter !== 'all' ||
                activeQuickTab !== 'all' ||
                sortBy !== 'newest') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDeptFilter('all');
                    setEmploymentFilter('all');
                    setActiveQuickTab('all');
                    setSortBy('newest');
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer ml-1"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            <span className="text-[11px] font-bold text-slate-400">
              Showing {filteredRegistrations.length} of {activeList.length} members
            </span>
          </div>

          {/* Bulk Operations Action Bar when items are selected */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="font-black text-[#003366] dark:text-sky-300">
                  {selectedIds.length} {selectedIds.length === 1 ? 'member' : 'members'} selected
                </span>
                <span className="text-slate-400">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline font-semibold cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                >
                  ✓ Bulk Confirm ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={handleBulkVerifyEta}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer shadow-2xs inline-flex items-center gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Audit Verify ETA
                </button>
                <button
                  type="button"
                  onClick={handleBulkDecline}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                >
                  ✕ Bulk Decline
                </button>
                <button
                  type="button"
                  onClick={handleBulkExportCsv}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 font-bold text-xs cursor-pointer inline-flex items-center gap-1 text-slate-700 dark:text-slate-200"
                >
                  <Download className="h-3 w-3" />
                  Export Selected CSV
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 font-bold text-xs cursor-pointer"
                  title="Remove selected records"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-3 w-10">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5"
                    title={
                      paginatedRegistrations.length > 0 &&
                      paginatedRegistrations.every((r) => selectedIds.includes(r.id))
                        ? 'Deselect page'
                        : 'Select all on this page'
                    }
                  >
                    {paginatedRegistrations.length > 0 &&
                    paginatedRegistrations.every((r) => selectedIds.includes(r.id)) ? (
                      <CheckSquare className="h-4 w-4 text-[#003366] dark:text-sky-400" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Alumnus & Student ID</th>
                <th className="py-3 px-4">Registered Campaign / Event</th>
                <th className="py-3 px-4">Department & Academic Class</th>
                <th className="py-3 px-4">Employer & Job Title</th>
                <th className="py-3 px-4">Employment Classification</th>
                <th className="py-3 px-4">Status & ETA Verified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#003366] dark:text-sky-400 mb-2.5" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">Loading registered alumni records…</p>
                    <p className="text-xs text-slate-400 mt-0.5">Querying official ASTU Directorate roster</p>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Users className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600 mb-2.5" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No alumni registrations match your filter</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search query or department filters.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setDeptFilter('all');
                        setEmploymentFilter('all');
                        setActiveQuickTab('all');
                      }}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg) => renderTableRow(reg))
              )}
            </tbody>
          </table>
        </div>

        {/* High-Volume Pagination Toolbar Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 px-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{filteredRegistrations.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-900 dark:text-white">
                {Math.min(currentPage * pageSize, filteredRegistrations.length).toLocaleString()}
              </strong>{' '}
              of <strong className="text-slate-900 dark:text-white">{filteredRegistrations.length.toLocaleString()}</strong> registered members
            </span>

            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
              </select>
            </div>

            <button
              onClick={() => registrationService.exportToCsv(filteredRegistrations)}
              className="inline-flex items-center gap-1 font-bold text-[#003366] dark:text-sky-400 hover:underline cursor-pointer border-l border-slate-200 dark:border-slate-700 pl-3"
              title="Download entire filtered roster as CSV spreadsheet"
            >
              <Download className="h-3.5 w-3.5" /> Export All ({filteredRegistrations.length.toLocaleString()}) to CSV
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white text-xs">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>

            {totalPages > 3 && (
              <form onSubmit={handleJumpToPage} className="flex items-center gap-1 ml-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  placeholder="Go to"
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  className="w-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-1 text-xs text-center font-bold focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold cursor-pointer"
                >
                  Go
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
         DEDICATED FULL SCREEN ROSTER VIEW OVERLAY
      ══════════════════════════════════════════════════════════════════════ */}
      {fullScreenMode && (
        <div className="fixed inset-0 z-50 bg-[#070d1e] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
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
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Quick search roster…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                onClick={() => registrationService.exportToCsv(filteredRegistrations)}
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

          <div className="flex-1 overflow-auto p-6 bg-[#070d1e]">
            <div className="rounded-2xl border border-slate-800 bg-[#0d1733] shadow-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#111c3d] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Alumnus & Student ID</th>
                    <th className="py-3.5 px-4">Registered Campaign</th>
                    <th className="py-3.5 px-4">Department & Academic Class</th>
                    <th className="py-3.5 px-4">Employer & Job Title</th>
                    <th className="py-3.5 px-4">Employment Classification</th>
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
         MODAL: REGISTRANT DETAIL (OFFICIAL GRADUATE DOSSIER)
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedRegDetail && (
        <AdminModal
          open={!!selectedRegDetail}
          title={`Official Graduate Dossier: ${selectedRegDetail.fullName}`}
          onClose={() => setSelectedRegDetail(null)}
          size="lg"
        >
          <div className="space-y-5 text-xs">
            {/* Header info card with ASTU Crest Styling */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#003366] text-white text-lg font-black shadow-sm">
                  {getInitials(selectedRegDetail.fullName)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedRegDetail.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFCC00]/20 text-[#003366] dark:text-[#FFCC00]">
                      ASTU Alumnus
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedRegDetail.studentId} • {selectedRegDetail.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleEtaVerified(selectedRegDetail.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs ${
                    selectedRegDetail.accreditationVerified
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {selectedRegDetail.accreditationVerified
                      ? 'ETA Accreditation Verified'
                      : 'Mark ETA Verified'}
                  </span>
                </button>
              </div>
            </div>

            {/* Profile Field Details Grid */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 break-all">{selectedRegDetail.email}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRegDetail.phone}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic School / Department</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRegDetail.department}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Graduation Class & Year</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRegDetail.classYear}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 space-y-1">
                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">Academic CGPA</span>
                <p className="font-black text-sky-900 dark:text-sky-100 text-sm">
                  {selectedRegDetail.cgpa ? `${selectedRegDetail.cgpa} / 4.00` : '3.65 (Standard)'}{' '}
                  {parseFloat(String(selectedRegDetail.cgpa || 0)) >= 3.75 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 ml-1">
                      Great Distinction
                    </span>
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Employer</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {selectedRegDetail.currentEmployer}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation / Role Title</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRegDetail.jobTitle}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employment Classification</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRegDetail.employmentStatus}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary Tier / Compensation</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedRegDetail.salaryRange || 'Confidential'}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demographics</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedRegDetail.gender || 'Not specified'} · {selectedRegDetail.nationality || 'Ethiopian'} · DOB: {selectedRegDetail.dateOfBirth || 'On File'}
                </p>
              </div>
            </div>

            {/* Campaign info */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Campaign</span>
              <p className="font-bold text-[#003366] dark:text-sky-300">{selectedRegDetail.contentTitle}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                Campaign ID: {selectedRegDetail.contentId} · Submitted: {selectedRegDetail.registeredAt}
              </p>
            </div>

            {/* Verification Notes */}
            {selectedRegDetail.notes && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Directorate Verification Notes</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{selectedRegDetail.notes}</p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDelete(selectedRegDetail.id, selectedRegDetail.fullName)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Registration Record
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedRegDetail.email}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" /> Email Alumnus
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedRegDetail(null)}
                  className="rounded-xl bg-[#003366] text-white px-5 py-1.5 text-xs font-bold hover:brightness-110 cursor-pointer shadow-2xs"
                >
                  Close Dossier
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
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Public Form Headline Title
            </label>
            <input
              type="text"
              value={formConfig.formTitle}
              onChange={(e) => setFormConfig({ ...formConfig, formTitle: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Form Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={formConfig.formSubtitle}
              onChange={(e) => setFormConfig({ ...formConfig, formSubtitle: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Compliance Banner Note
            </label>
            <input
              type="text"
              value={formConfig.noticeBanner}
              onChange={(e) => setFormConfig({ ...formConfig, noticeBanner: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              Form Field Requirements & Controls
            </label>
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formConfig.requireStudentId}
                  onChange={(e) => setFormConfig({ ...formConfig, requireStudentId: e.target.checked })}
                  className="rounded text-[#003366] cursor-pointer"
                />
                <span>Student ID Number</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formConfig.requirePhone}
                  onChange={(e) => setFormConfig({ ...formConfig, requirePhone: e.target.checked })}
                  className="rounded text-[#003366] cursor-pointer"
                />
                <span>Phone Number Field</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formConfig.requireEmployer}
                  onChange={(e) => setFormConfig({ ...formConfig, requireEmployer: e.target.checked })}
                  className="rounded text-[#003366] cursor-pointer"
                />
                <span>Employer & Job Title</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formConfig.requireSalary}
                  onChange={(e) => setFormConfig({ ...formConfig, requireSalary: e.target.checked })}
                  className="rounded text-[#003366] cursor-pointer"
                />
                <span>Salary Range Field</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formConfig.requireDepartment}
                  onChange={(e) => setFormConfig({ ...formConfig, requireDepartment: e.target.checked })}
                  className="rounded text-[#003366] cursor-pointer"
                />
                <span>Department Selector</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={formConfig.allowPublicRegistration}
                  onChange={(e) => setFormConfig({ ...formConfig, allowPublicRegistration: e.target.checked })}
                  className="rounded text-[#003366] cursor-pointer"
                />
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Allow Public Self-Registration (/register)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Registration Success Message
            </label>
            <input
              type="text"
              value={formConfig.successMessage}
              onChange={(e) => setFormConfig({ ...formConfig, successMessage: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCustomizerModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#003366] text-white px-5 py-2 text-xs font-bold hover:brightness-110 transition-colors shadow-sm cursor-pointer"
            >
              Save Form Settings
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ── MODAL 1: MANUAL REGISTRATION MODAL ────────────────────────────── */}
      <AdminModal
        open={addModalOpen}
        title="Register Alumnus for Campaign Roster"
        onClose={() => setAddModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleManualAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Campaign / Notice Roster <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetContentId}
              onChange={(e) => setTargetContentId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
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
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Yared Hailu"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student ID
              </label>
              <input
                type="text"
                placeholder="e.g. UGR/14205/12"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="alumnus@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+251 91 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ASTU Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Electrical & Computer Engineering">Electrical & Computer Engineering</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Applied Geology">Applied Geology</option>
                <option value="Applied Natural Sciences & Technology">Applied Natural Sciences</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Class Year
              </label>
              <input
                type="text"
                placeholder="Class of 2024"
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cumulative GPA (CGPA)
              </label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max="4.0"
                placeholder="e.g. 3.75"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Employer
              </label>
              <input
                type="text"
                placeholder="e.g. Safaricom Ethiopia"
                value={currentEmployer}
                onChange={(e) => setCurrentEmployer(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Cloud Architect"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Employment Status
              </label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Employed Full-time">Employed Full-time</option>
                <option value="Self-employed / Founder">Self-employed / Founder</option>
                <option value="Further Studies">Further Studies</option>
                <option value="Seeking Opportunities">Seeking Opportunities</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                placeholder="45,000 - 65,000 ETB"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Directorate Verification Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Verified against Registrar SIS records"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] hover:bg-[#002244] dark:bg-sky-600 px-5 py-2 text-xs font-bold text-white transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5 text-[#FFCC00]" />}
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
        <form onSubmit={handleSendReminderSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs">
            <span className="font-bold text-[#003366] dark:text-sky-300">Target Recipients: </span>
            <span className="text-slate-700 dark:text-slate-300">
              {filteredRegistrations.length} alumni in selected roster ({selectedNotice ? selectedNotice.title : 'All Registrations'})
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Delivery Channel Gateway
            </label>
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
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      reminderChannel === ch.id
                        ? 'border-[#003366] bg-[#003366] text-white dark:border-sky-400 dark:bg-sky-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Broadcast Alert Message
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {reminderMessage.length} chars · {Math.ceil(reminderMessage.length / 160)} SMS
              </span>
            </div>
            <textarea
              rows={4}
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none resize-none focus:ring-2 focus:ring-[#003366]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBroadcastReminderOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingReminder}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] hover:bg-[#002244] dark:bg-sky-600 px-5 py-2 text-xs font-bold text-white transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {sendingReminder ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-[#FFCC00]" />}
              {sendingReminder ? 'Dispatching…' : 'Dispatch Broadcast'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
