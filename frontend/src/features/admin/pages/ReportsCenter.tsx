import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Download,
  FileSpreadsheet,
  Globe2,
  GraduationCap,
  LineChart,
  MapPinned,
  PieChart,
  Presentation,
  Star,
  TrendingUp,
  Users,
  RefreshCw,
  X,
  FileText,
  SlidersHorizontal,
  CheckCircle2,
  Award,
  Clock,
  HeartHandshake,
  Coins,
  Scale,
  FileCheck,
  Target,
  Building,
  UserCheck,
  Rocket,
  AlertCircle,
  Laptop,
  GraduationCap as GradCap,
  Landmark,
  Building as Factory,
  Smile,
  CheckSquare,
  TrendingDown,
  Layers,
  Cpu,
  Compass,
  MessageSquare,
  Gift,
  CalendarCheck,
  Video,
  BadgeCheck,
  PartyPopper,
  DollarSign,
  HelpCircle,
  ShieldCheck,
  Lock,
  Database,
  FileCheck2,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminStatGrid from '../components/AdminStatGrid';
import AdminSectionCard, {
  adminFilterShellClass,
  adminHeroGhostBtnClass,
  adminInputClass,
  adminPanelClass,
} from '../components/AdminSectionCard';
import { adminService } from '../services/admin.service';
import { generateAndDownloadReport } from '../utils/reportPdfGenerator';

type ReportArea = 'All Domains' | 'Employment' | 'Tracer Studies' | 'Industry' | 'Engagement' | 'Events' | 'Accreditation & Quality' | 'Governance & Security';

interface ReportItem {
  title: string;
  area: ReportArea;
  cadence: string;
  owner: string;
  icon: React.ComponentType<{ className?: string }>;
}

const reports: ReportItem[] = [
  // 1. Employment Domain (8 Reports)
  { title: 'Employment Rate Reports', area: 'Employment', cadence: 'Monthly', owner: 'Departments', icon: TrendingUp },
  { title: 'Salary Analysis Reports', area: 'Employment', cadence: 'Quarterly', owner: 'Institutional Analytics', icon: BarChart3 },
  { title: 'Time-to-Placement Velocity Reports', area: 'Employment', cadence: 'Quarterly', owner: 'Career Center', icon: Clock },
  { title: 'Department Performance Benchmark Reports', area: 'Employment', cadence: 'Annual', owner: 'Academic Senate', icon: Award },
  { title: 'Graduate Salary Growth & Promotion Trajectory Reports', area: 'Employment', cadence: 'Annual', owner: 'Institutional Analytics', icon: DollarSign },
  { title: 'Entrepreneurship & Startup Founder Reports', area: 'Employment', cadence: 'Biannual', owner: 'Incubation Hub', icon: Rocket },
  { title: 'Underemployment & Career Misalignment Audit Reports', area: 'Employment', cadence: 'Annual', owner: 'Quality Assurance', icon: AlertCircle },
  { title: 'Remote vs On-Site Work Distribution Reports', area: 'Employment', cadence: 'Quarterly', owner: 'Career Office', icon: Laptop },

  // 2. Tracer Studies Domain (9 Reports)
  { title: 'Geographic Distribution Reports', area: 'Tracer Studies', cadence: 'Monthly', owner: 'Registrar', icon: MapPinned },
  { title: 'Tracer Study Reports', area: 'Tracer Studies', cadence: 'Wave Based', owner: 'Registrar', icon: FileSpreadsheet },
  { title: 'Graduate Migration & Brain Drain Reports', area: 'Tracer Studies', cadence: 'Annual', owner: 'International Relations', icon: Globe2 },
  { title: 'Gender & Equity Outcome Reports', area: 'Tracer Studies', cadence: 'Biannual', owner: 'Gender & Diversity Office', icon: Scale },
  { title: 'Tracer Survey Response & Completion Audit Reports', area: 'Tracer Studies', cadence: 'Per Wave', owner: 'Registrar', icon: FileCheck },
  { title: 'Postgraduate & Academic Progression Reports', area: 'Tracer Studies', cadence: 'Annual', owner: 'Postgraduate Directorate', icon: GradCap },
  { title: 'Regional State Placement Distribution Reports', area: 'Tracer Studies', cadence: 'Biannual', owner: 'Ministry Relations', icon: Landmark },
  { title: 'Industrial Park & Special Economic Zone Placement Reports', area: 'Tracer Studies', cadence: 'Biannual', owner: 'Industrial Linkages', icon: Factory },
  { title: 'Alumni Career Satisfaction & Retention Index Reports', area: 'Tracer Studies', cadence: 'Annual', owner: 'Quality Audit', icon: Smile },

  // 3. Industry Domain (10 Reports)
  { title: 'Top Hiring Companies Analysis Reports', area: 'Industry', cadence: 'Quarterly', owner: 'Employer Relations', icon: Building },
  { title: 'Industry Demand Reports', area: 'Industry', cadence: 'Quarterly', owner: 'Employer Relations', icon: BriefcaseBusiness },
  { title: 'Skill Gap Reports', area: 'Industry', cadence: 'Quarterly', owner: 'Departments', icon: PieChart },
  { title: 'Employer Satisfaction Reports', area: 'Industry', cadence: 'Biannual', owner: 'Employer Relations', icon: Star },
  { title: 'Job Portal Application & Conversion Reports', area: 'Industry', cadence: 'Monthly', owner: 'Career Office', icon: Target },
  { title: 'Curriculum Feedback & Competency Gap Reports', area: 'Industry', cadence: 'Biannual', owner: 'Curriculum Audit', icon: UserCheck },
  { title: 'Employer Internship to Full-Time Conversion Reports', area: 'Industry', cadence: 'Annual', owner: 'Internship Office', icon: CheckSquare },
  { title: 'Skill Shortage & Industrial Demand Forecasting Reports', area: 'Industry', cadence: 'Annual', owner: 'Strategic Planning', icon: TrendingDown },
  { title: 'Corporate Partnership & MoU Compliance Reports', area: 'Industry', cadence: 'Biannual', owner: 'Advancement Office', icon: Layers },
  { title: 'Technology Stack & Industrial Tools Adoption Reports', area: 'Industry', cadence: 'Quarterly', owner: 'ICT & Engineering', icon: Cpu },

  // 4. Engagement & Advancement Domain (7 Reports)
  { title: 'Alumni Engagement Reports', area: 'Engagement', cadence: 'Monthly', owner: 'Alumni Office', icon: Users },
  { title: 'Alumni Mentorship Impact Reports', area: 'Engagement', cadence: 'Quarterly', owner: 'Alumni Office', icon: HeartHandshake },
  { title: 'Alumni Giving & Endowment Contribution Reports', area: 'Engagement', cadence: 'Monthly', owner: 'Advancement Office', icon: Coins },
  { title: 'Alumni Chapter & Regional Association Audit Reports', area: 'Engagement', cadence: 'Annual', owner: 'Alumni Relations', icon: Compass },
  { title: 'Alumni Volunteer & Guest Lecturer Contribution Reports', area: 'Engagement', cadence: 'Biannual', owner: 'Academic Affairs', icon: MessageSquare },
  { title: 'Alumni Network Interaction & Referral Reports', area: 'Engagement', cadence: 'Monthly', owner: 'Network Admin', icon: HelpCircle },
  { title: 'Scholarship & Student Sponsorship Impact Reports', area: 'Engagement', cadence: 'Annual', owner: 'Student Affairs', icon: Gift },

  // 5. Events Domain (5 Reports)
  { title: 'Event Performance Reports', area: 'Events', cadence: 'Per Event', owner: 'Admin', icon: Presentation },
  { title: 'Career Fair & Employer Expo Outcome Reports', area: 'Events', cadence: 'Annual', owner: 'Events Committee', icon: CalendarCheck },
  { title: 'Alumni Webinar & Knowledge Sharing Impact Reports', area: 'Events', cadence: 'Monthly', owner: 'Outreach Team', icon: Video },
  { title: 'Workshop Skill Certification Completion Reports', area: 'Events', cadence: 'Per Event', owner: 'ICT & Career Center', icon: BadgeCheck },
  { title: 'Campus Reunion & Networking Event Participation Reports', area: 'Events', cadence: 'Annual', owner: 'Alumni Directorate', icon: PartyPopper },

  // 6. Accreditation & Quality Domain (6 Reports)
  { title: 'ABET Outcome & Accreditation Compliance Reports', area: 'Accreditation & Quality', cadence: 'Annual', owner: 'Quality Assurance', icon: BadgeCheck },
  { title: 'HERQA Institutional Standard Audit Reports', area: 'Accreditation & Quality', cadence: 'Biannual', owner: 'Institutional Audit', icon: ShieldCheck },
  { title: 'Curriculum Relevancy & Course Evaluation Reports', area: 'Accreditation & Quality', cadence: 'Annual', owner: 'Curriculum Directorate', icon: FileCheck2 },
  { title: 'CGPA & Academic Performance Outcome Correlation Reports', area: 'Accreditation & Quality', cadence: 'Annual', owner: 'Registrar & Analytics', icon: BarChart3 },
  { title: 'Faculty Performance & Alumni Rating Benchmark Reports', area: 'Accreditation & Quality', cadence: 'Biannual', owner: 'Academic Senate', icon: Award },
  { title: 'Institutional Quality Continuous Improvement Reports', area: 'Accreditation & Quality', cadence: 'Quarterly', owner: 'Quality Audit Committee', icon: LineChart },

  // 7. Governance & Security Domain (5 Reports)
  { title: 'System Audit Log & Security Compliance Reports', area: 'Governance & Security', cadence: 'Monthly', owner: 'ICT Security', icon: Lock },
  { title: 'Admin Access Control & Role Permission Audit Reports', area: 'Governance & Security', cadence: 'Quarterly', owner: 'System Administrator', icon: ShieldCheck },
  { title: 'Data Privacy & Student Identity Verification Audit Reports', area: 'Governance & Security', cadence: 'Monthly', owner: 'Registrar & Legal', icon: UserCheck },
  { title: 'System Telemetry & API Performance Reports', area: 'Governance & Security', cadence: 'Weekly', owner: 'DevOps & Infrastructure', icon: Cpu },
  { title: 'Registrar Data Sync & Integrity Reports', area: 'Governance & Security', cadence: 'Monthly', owner: 'Registrar ICT', icon: RefreshCw },
];

const areas: ReportArea[] = ['All Domains', 'Employment', 'Tracer Studies', 'Industry', 'Engagement', 'Events', 'Accreditation & Quality', 'Governance & Security'];

const UNAVAILABLE = 'Unavailable';

export default function ReportsCenter() {
  const [area, setArea] = useState<ReportArea>('Employment');
  const [searchQuery, setSearchQuery] = useState('');
  const [cadenceFilter, setCadenceFilter] = useState('ALL');
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(false);
  const [metrics, setMetrics] = useState<{
    employmentRate: string;
    employerSatisfaction: string;
    mappedCountries: number | string;
    exportedThisMonth: number | string;
  }>({
    employmentRate: '—',
    employerSatisfaction: '—',
    mappedCountries: '—',
    exportedThisMonth: '—',
  });

  const [downloadingReportTitle, setDownloadingReportTitle] = useState<string | null>(null);

  // Build Report Modal State
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('Employment Rate Reports');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Monthly');
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'CSV' | 'JSON'>('PDF');
  const [isBuildingReport, setIsBuildingReport] = useState(false);
  const [departmentsList, setDepartmentsList] = useState<Array<{ id: string; name: string }>>([]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesArea = area === 'All Domains' || report.area === area;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        report.title.toLowerCase().includes(q) ||
        report.owner.toLowerCase().includes(q) ||
        report.cadence.toLowerCase().includes(q) ||
        report.area.toLowerCase().includes(q);
      const matchesCadence =
        cadenceFilter === 'ALL' ||
        report.cadence.toLowerCase() === cadenceFilter.toLowerCase() ||
        (cadenceFilter === 'Wave Based' && report.cadence.toLowerCase().includes('wave')) ||
        (cadenceFilter === 'Per Event' && report.cadence.toLowerCase().includes('event'));
      return matchesArea && matchesSearch && matchesCadence;
    });
  }, [area, searchQuery, cadenceFilter]);

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(false);
    try {
      const res = await adminService.getReportsMetrics();
      if (res.ok && res.data) {
        setMetrics({
          employmentRate: res.data.employmentRate ?? UNAVAILABLE,
          employerSatisfaction: res.data.employerSatisfaction ?? UNAVAILABLE,
          mappedCountries: res.data.mappedCountries ?? UNAVAILABLE,
          exportedThisMonth: res.data.exportedThisMonth ?? UNAVAILABLE,
        });
        setMetricsError(false);
      } else {
        setMetrics({
          employmentRate: UNAVAILABLE,
          employerSatisfaction: UNAVAILABLE,
          mappedCountries: UNAVAILABLE,
          exportedThisMonth: UNAVAILABLE,
        });
        setMetricsError(true);
      }
    } catch (_) {
      setMetrics({
        employmentRate: UNAVAILABLE,
        employerSatisfaction: UNAVAILABLE,
        mappedCountries: UNAVAILABLE,
        exportedThisMonth: UNAVAILABLE,
      });
      setMetricsError(true);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    adminService.getDepartments().then((res) => {
      if (res.ok && res.data?.departments) {
        setDepartmentsList(res.data.departments);
      }
    });
  }, []);

  useEffect(() => {
    if (showBuildModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [showBuildModal]);

  const handleDownloadSinglePdf = async (report: ReportItem) => {
    // Synchronously open target window in user click gesture so popups are NEVER blocked!
    const targetWin = window.open('about:blank', '_blank');
    if (targetWin) {
      targetWin.document.write(`
        <div style="font-family: system-ui, sans-serif; padding: 50px 20px; text-align: center; color: #003580; background: #f8fafc; min-height: 100vh;">
          <div style="max-width: 480px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="font-size: 32px; margin-bottom: 12px;">📊</div>
            <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #003580;">Compiling ASTU Institutional PDF Report...</h2>
            <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">Fetching official records for <strong>${report.title}</strong> from system registry...</p>
          </div>
        </div>
      `);
    }

    setDownloadingReportTitle(report.title);
    const toastId = toast.loading(`Compiling records for ${report.title}...`);

    try {
      const res = await adminService.getReportData({
        reportType: report.title,
        timeframe: report.cadence,
      });

      if (res.ok && res.data) {
        generateAndDownloadReport(res.data, 'PDF', targetWin);

        await adminService.recordReportExport({
          reportTitle: report.title,
          format: 'PDF',
          scope: report.owner,
        });

        toast.success(`Generated official PDF report for "${report.title}"!`, { id: toastId });
        fetchMetrics();
      } else {
        if (targetWin && !targetWin.closed) targetWin.close();
        toast.error('Failed to retrieve report records.', { id: toastId });
      }
    } catch (err: any) {
      if (targetWin && !targetWin.closed) targetWin.close();
      toast.error(`Export failed: ${err.message || 'System error'}`, { id: toastId });
    } finally {
      setDownloadingReportTitle(null);
    }
  };

  const handleGenerateCustomReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBuildingReport(true);

    let targetWin: Window | null = null;
    if (selectedFormat === 'PDF') {
      targetWin = window.open('about:blank', '_blank');
      if (targetWin) {
        targetWin.document.write(`
          <div style="font-family: system-ui, sans-serif; padding: 50px 20px; text-align: center; color: #003580; background: #f8fafc; min-height: 100vh;">
            <div style="max-width: 480px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="font-size: 32px; margin-bottom: 12px;">📄</div>
              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #003580;">Compiling Custom Institutional PDF Report...</h2>
              <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">Processing institutional records for <strong>${selectedReportType}</strong>...</p>
            </div>
          </div>
        `);
      }
    }

    const toastId = toast.loading(`Building custom ${selectedFormat} report for ${selectedReportType}...`);

    try {
      const res = await adminService.getReportData({
        reportType: selectedReportType,
        departmentId: selectedDepartment,
        timeframe: selectedTimeframe,
      });

      if (res.ok && res.data) {
        generateAndDownloadReport(res.data, selectedFormat, targetWin);

        const deptName = departmentsList.find((d) => d.id === selectedDepartment)?.name || 'All Departments';
        await adminService.recordReportExport({
          reportTitle: selectedReportType,
          format: selectedFormat,
          scope: `Custom Builder (${deptName})`,
        });

        toast.success(`Custom ${selectedFormat} report generated & official audit logged!`, { id: toastId });
        setShowBuildModal(false);
        fetchMetrics();
      } else {
        if (targetWin && !targetWin.closed) targetWin.close();
        toast.error('Failed to compile custom report dataset.', { id: toastId });
      }
    } catch (err: any) {
      if (targetWin && !targetWin.closed) targetWin.close();
      toast.error(`Custom report failed: ${err.message || 'System error'}`, { id: toastId });
    } finally {
      setIsBuildingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Institutional Reports"
        subtitle="Generate and download accreditation-ready PDF exports across employment, tracer studies, industry, engagement, events, and quality domains."
        breadcrumbs={[{ label: 'Alumni Office' }, { label: 'Reports Center' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMetrics}
              disabled={metricsLoading}
              className={`${adminHeroGhostBtnClass} disabled:cursor-not-allowed disabled:opacity-60`}
              title="Refresh Metrics"
            >
              <RefreshCw className={`h-4 w-4 text-[#FFCC00] ${metricsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <AdminBadge variant="success">Export Center ({reports.length})</AdminBadge>
          </div>
        }
      />

      {metricsError && !metricsLoading && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Report metrics unavailable</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
              Could not load live summary metrics. Catalog exports still work — retry refresh or check the API connection.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMetrics}
            className="ml-auto shrink-0 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <AdminStatGrid
        cols={4}
        compact
        stats={[
          {
            title: 'Employment Rate',
            value: String(metrics.employmentRate),
            icon: GraduationCap,
            tone: 'green',
            loading: metricsLoading,
            trend: metricsError || metrics.employmentRate === UNAVAILABLE ? 'Unavailable' : 'Accreditation metric',
            trendDirection: metricsError || metrics.employmentRate === UNAVAILABLE ? 'flat' : 'up',
          },
          {
            title: 'Employer Satisfaction',
            value: String(metrics.employerSatisfaction),
            icon: Building2,
            tone: 'amber',
            loading: metricsLoading,
            description: 'Industry feedback index',
          },
          {
            title: 'Mapped Countries',
            value: String(metrics.mappedCountries),
            icon: Globe2,
            tone: 'blue',
            loading: metricsLoading,
            description: 'Alumni geographic coverage',
          },
          {
            title: 'Exported This Month',
            value: String(metrics.exportedThisMonth),
            icon: Download,
            tone: 'purple',
            loading: metricsLoading,
            trend: 'PDF export center',
            trendDirection: 'up',
          },
        ]}
      />

      {/* Main Report Library Grid */}
      <section className="grid gap-6 xl:grid-cols-[300px_1fr]">
        {/* Category Switcher Sidebar */}
        <aside className={`${adminPanelClass} h-fit space-y-1 p-3 lg:sticky lg:top-4`}>
          <p className="mb-2 border-b border-[var(--border-color)] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
            Report Domains ({reports.length})
          </p>
          {areas.map((item) => {
            const count = item === 'All Domains' ? reports.length : reports.filter((report) => report.area === item).length;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setArea(item)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-3 text-left text-xs font-extrabold transition-all ${
                  area === item
                    ? 'bg-[#003580] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{item}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    area === item
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--bg-page)] text-[var(--text-muted)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Selected Domain Report Library */}
        <AdminSectionCard
          title={`${area} Report Library`}
          subtitle={`Filter, generate, download, and audit official accreditation report packages (${filteredReports.length} packages).`}
          action={
            <button
              type="button"
              onClick={() => setShowBuildModal(true)}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#001F4D]"
            >
              <LineChart className="h-4 w-4" />
              <span>Build Report</span>
            </button>
          }
          bodyClassName="space-y-5"
        >
          {/* Quick Filter & Search Bar */}
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <label className={`${adminFilterShellClass} relative flex-1`}>
              <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by title, owner, or cadence..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>

            <div className="flex shrink-0 items-center gap-2">
              <Filter className="hidden h-4 w-4 text-[var(--text-muted)] sm:block" />
              <select
                value={cadenceFilter}
                onChange={(e) => setCadenceFilter(e.target.value)}
                className={`${adminInputClass} w-auto cursor-pointer font-bold`}
              >
                <option value="ALL">All Cadences</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Biannual">Biannual</option>
                <option value="Annual">Annual</option>
                <option value="Wave Based">Wave Based</option>
                <option value="Per Event">Per Event</option>
              </select>
            </div>
          </div>

          {/* Cards */}
          {filteredReports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-page)] py-12 text-center p-8">
              <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-[var(--text-muted)]" />
              <p className="text-sm font-bold text-[var(--text-primary)]">No reports matching your filter</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Try adjusting your search terms or clearing the cadence filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCadenceFilter('ALL');
                  setArea('All Domains');
                }}
                className="mt-4 cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-xs font-extrabold text-[var(--text-primary)] transition hover:bg-[var(--bg-page)]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredReports.map((report) => {
                const Icon = report.icon;
                const isDownloading = downloadingReportTitle === report.title;

                return (
                  <article
                    key={report.title}
                    className="group flex flex-col justify-between space-y-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-page)] p-5 transition-all hover:border-[#003580]/40 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#003580]/10 text-[#003580] ring-1 ring-[#003580]/10 transition-all group-hover:bg-[#003580] group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadSinglePdf(report)}
                          disabled={isDownloading}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-all hover:border-[#003580]/40 hover:text-[#003580] disabled:opacity-50"
                          title={`Download Official PDF for ${report.title}`}
                        >
                          {isDownloading ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-[#003580]" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <h3 className="mt-3 text-sm font-black text-[var(--text-primary)] transition-colors group-hover:text-[#003580]">
                        {report.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                        {report.owner} ·{' '}
                        <span className="inline-block rounded bg-[var(--bg-card)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--text-secondary)] ring-1 ring-[var(--border-color)]">
                          {report.cadence}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3 text-[10px] font-extrabold text-[var(--text-muted)]">
                      <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" /> ABET /
                        HERQA Audit Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadSinglePdf(report)}
                        className="flex cursor-pointer items-center gap-0.5 font-black text-[#003580] hover:underline"
                      >
                        Export PDF →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </AdminSectionCard>
      </section>

      {/* Build Report Modal Drawer */}
      {showBuildModal &&
        createPortal(
          <div
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowBuildModal(false);
            }}
          >
            <div className="w-full max-w-xl space-y-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl animate-in zoom-in-95 duration-200 sm:p-7">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#003580]/20 bg-[#003580]/10 font-bold text-[#003580] shadow-xs">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#003580]">
                      Custom Report Builder
                    </span>
                    <h3 className="text-lg font-black text-[var(--text-primary)]">Compile Institutional Report</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBuildModal(false)}
                  className="cursor-pointer rounded-full p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleGenerateCustomReport} className="space-y-4 text-xs">
                <div>
                  <label className="mb-1.5 block font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                    Select Report Package ({reports.length} Total Options)
                  </label>
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className={`${adminInputClass} font-extrabold`}
                  >
                    {reports.map((r) => (
                      <option key={r.title} value={r.title}>
                        {r.title} ({r.area} Domain)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                      Department / Scope Filter
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className={`${adminInputClass} font-bold`}
                    >
                      <option value="ALL">All Departments (Institutional Wide)</option>
                      {departmentsList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                      Reporting Timeframe
                    </label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className={`${adminInputClass} font-bold`}
                    >
                      <option value="Monthly">Monthly Cycle</option>
                      <option value="Quarterly">Quarterly Audit</option>
                      <option value="Biannual">Biannual Review</option>
                      <option value="Annual">Annual Quality Accreditation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                    Output File Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'PDF', label: 'PDF Document', desc: 'Printable & Branded' },
                      { id: 'CSV', label: 'CSV Spreadsheet', desc: 'Excel / Tabular Data' },
                      { id: 'JSON', label: 'JSON Document', desc: 'Structured System Data' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.id as any)}
                        className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                          selectedFormat === fmt.id
                            ? 'border-[#003580] bg-[#003580]/10 font-black text-[#003580] ring-1 ring-[#003580]/30'
                            : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:border-[#003580]/30'
                        }`}
                      >
                        <p className="text-xs font-black">{fmt.label}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{fmt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audit Disclaimer */}
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[11px] font-semibold leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                  <span>
                    Generating this report will record a permanent entry in the Official System Audit Log and increment your monthly institutional export quota.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 border-t border-[var(--border-color)] pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBuildModal(false)}
                    className="flex-1 cursor-pointer rounded-xl border border-[var(--border-color)] py-3 text-xs font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-page)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBuildingReport}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#003580] py-3 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-[#001F4D] disabled:opacity-50"
                  >
                    {isBuildingReport ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Generate & Export Report</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
