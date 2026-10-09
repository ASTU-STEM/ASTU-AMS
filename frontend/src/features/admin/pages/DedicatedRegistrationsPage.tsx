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
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminModal from '../components/AdminModal';
import registrationService, { AlumniRegistration, RegistrationFormConfig } from '../services/registration.service';
import contentService from '../services/content.service';
import { ContentCardItem } from '../components/ContentCard';

export default function DedicatedRegistrationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedContentId = searchParams.get('contentId') || 'all';

  const [registrations, setRegistrations] = useState<AlumniRegistration[]>([]);
  const [contentItems, setContentItems] = useState<ContentCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Detail Modal
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

  const handleExportCsv = () => {
    registrationService.exportToCsv(filteredRegistrations);
    toast.success('Roster exported to CSV format');
  };

  const handleExportPdf = () => {
    registrationService.exportToPdf(filteredRegistrations);
    toast.success('Opening official PDF print report window...');
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-5 transition-colors font-sans">
      {/* ── Top Full-Page Header Bar ────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Top Row: Back button, Title & Header Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/cms/registrations')}
              className="inline-flex items-center gap-1.5 p-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-bold cursor-pointer shrink-0"
              title="Return to CMS Registrations Desk"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to CMS Desk</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-extrabold text-[10px] uppercase tracking-wider">
                  DEDICATED FULL PAGE
                </span>
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Registered Members Roster Desk</h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full-width standalone management desk for registered alumni members & accreditation export.
              </p>
            </div>
          </div>

          {/* Top Action Buttons - Perfectly Aligned */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Export roster to official printable PDF document"
            >
              <FileText className="h-4 w-4" />
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Export roster to CSV"
            >
              <FileSpreadsheet className="h-4 w-4 text-amber-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setCustomizerModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <Settings className="h-4 w-4 text-blue-500" />
              <span>Customize Form</span>
            </button>

            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFCC00] hover:bg-[#FFD633] text-[#003366] px-4 py-2 text-xs font-extrabold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Alumnus</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Sleek Real-time Stats Badges */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Registrants:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{stats.total}</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">ETA Compliance:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{stats.etaComplianceRate}%</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Building2 className="h-4 w-4 text-astu-navy dark:text-sky-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Employability Rate:</span>
              <span className="font-extrabold text-astu-navy dark:text-sky-400">{stats.employabilityRate}%</span>
            </div>
          </div>

          <span className="text-slate-400 text-[11px] font-medium">
            Live synchronized with ASTU alumni portal
          </span>
        </div>
      </div>

      {/* ── Main Data Roster Table ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registered Alumni Roster Records</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Showing {filteredRegistrations.length} registered members out of {activeList.length} total.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, Student ID, employer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-astu-navy"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-bold">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            <select
              value={selectedContentId}
              onChange={(e) => setSearchParams({ contentId: e.target.value })}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              <option value="all">All Events & Campaigns</option>
              {contentItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Attended">Attended</option>
              <option value="Waitlisted">Waitlisted</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
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
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Employment</option>
              <option value="Employed Full-time">Employed Full-time</option>
              <option value="Self-employed / Founder">Self-employed / Founder</option>
              <option value="Further Studies">Further Studies</option>
              <option value="Seeking Opportunities">Seeking Opportunities</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || deptFilter !== 'all' || employmentFilter !== 'all' || selectedContentId !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDeptFilter('all');
                  setEmploymentFilter('all');
                  setSearchParams({ contentId: 'all' });
                }}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-auto cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Table Roster */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Alumnus & Student ID</th>
                <th className="py-3.5 px-4">Registered Event / Campaign</th>
                <th className="py-3.5 px-4">Department & Class</th>
                <th className="py-3.5 px-4">Employer & Role</th>
                <th className="py-3.5 px-4">Employment Status</th>
                <th className="py-3.5 px-4">Registered At</th>
                <th className="py-3.5 px-4">Status & Accreditation</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-astu-navy dark:text-sky-400 mb-2" />
                    Loading alumni roster…
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No registered members found</p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr
                    key={reg.id}
                    onClick={() => setSelectedRegDetail(reg)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{reg.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{reg.studentId}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{reg.email} • {reg.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[#003366] dark:text-sky-300 line-clamp-1 max-w-[200px]" title={reg.contentTitle}>
                        {reg.contentTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {reg.contentId}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{reg.department}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{reg.classYear}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{reg.jobTitle}</div>
                      <div className="text-[11px] text-astu-navy dark:text-sky-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>{reg.currentEmployer}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        {reg.employmentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {reg.registeredAt}
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        <select
                          value={reg.status}
                          onChange={(e) => handleUpdateStatus(reg.id, e.target.value as any)}
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border focus:outline-none cursor-pointer ${
                            reg.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : reg.status === 'Pending Approval' || reg.status === 'Pending Verification'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                              : reg.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
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
                            title="Approve Alumnus Registration"
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
                            title="Decline Alumnus Registration"
                          >
                            ✕ Decline
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleEtaVerified(reg.id)}
                          className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors mt-1 ${
                            reg.accreditationVerified
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {reg.accreditationVerified ? 'ETA Verified' : 'Verify ETA'}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRegDetail(reg)}
                          className="inline-flex h-7 px-2.5 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id, reg.fullName)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredRegistrations.length} of {activeList.length} registered members</span>
          <div className="flex items-center gap-3">
            <button onClick={handleExportPdf} className="font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
              <FileText className="h-3.5 w-3.5" /> Export PDF Audit Report
            </button>
            <button onClick={handleExportCsv} className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV Roster
            </button>
          </div>
        </div>
      </div>

      {/* ── Profile Detail Modal ────────────────────────────────────────────── */}
      {selectedRegDetail && (
        <AdminModal
          open={!!selectedRegDetail}
          title={`Alumnus Profile: ${selectedRegDetail.fullName}`}
          onClose={() => setSelectedRegDetail(null)}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedRegDetail.fullName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{selectedRegDetail.studentId} • {selectedRegDetail.department}</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleEtaVerified(selectedRegDetail.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  selectedRegDetail.accreditationVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {selectedRegDetail.accreditationVerified ? '✓ ETA Verified' : 'Mark ETA Verified'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Email</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedRegDetail.email}</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Phone</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedRegDetail.phone}</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Employer</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedRegDetail.currentEmployer}</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Job Title</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedRegDetail.jobTitle}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handleDelete(selectedRegDetail.id, selectedRegDetail.fullName)}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Delete Record
              </button>
              <button
                onClick={() => setSelectedRegDetail(null)}
                className="rounded-xl bg-[#003366] text-white px-5 py-2 text-xs font-bold cursor-pointer hover:bg-[#002244] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── Form Customizer Modal ───────────────────────────────────────────── */}
      <AdminModal
        open={customizerModalOpen}
        title="Registration Form CMS Customizer"
        onClose={() => setCustomizerModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSaveFormConfig} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Public Form Headline Title</label>
            <input
              type="text"
              value={formConfig.formTitle}
              onChange={(e) => setFormConfig({ ...formConfig, formTitle: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Form Subtitle / Description</label>
            <textarea
              rows={2}
              value={formConfig.formSubtitle}
              onChange={(e) => setFormConfig({ ...formConfig, formSubtitle: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs resize-none text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCustomizerModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#003366] text-white px-5 py-2 text-xs font-bold hover:bg-[#002244] shadow-sm transition-all cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ── Manual Add Modal ──────────────────────────────────────────────── */}
      <AdminModal
        open={addModalOpen}
        title="Register Alumnus for Campaign"
        onClose={() => setAddModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleManualAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Yared Hailu"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy transition-all"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Student ID</label>
              <input
                type="text"
                placeholder="e.g. UGR/14205/12"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                placeholder="alumnus@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy transition-all"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">Phone Number</label>
              <input
                type="tel"
                placeholder="+251 91 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 focus:border-astu-navy transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#003366] text-white px-5 py-2 text-xs font-bold hover:bg-[#002244] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Registering…' : 'Save Registration'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
