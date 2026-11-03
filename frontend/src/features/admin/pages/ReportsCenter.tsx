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
              onClick={fetchMetrics}
              disabled={metricsLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-60"
              title="Refresh Metrics"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${metricsLoading ? 'animate-spin' : ''}`} />
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
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-[var(--bg-card)] p-3 shadow-sm h-fit space-y-1 lg:sticky lg:top-4">
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-2">
            Report Domains ({reports.length})
          </p>
          {areas.map((item) => {
            const count = item === 'All Domains' ? reports.length : reports.filter((report) => report.area === item).length;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setArea(item)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-xs font-extrabold transition-all cursor-pointer ${
                  area === item
                    ? 'bg-astu-navy dark:bg-sky-600 text-white shadow-md dark:shadow-sky-950/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{item}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    area === item ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Domain Report Library */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-[var(--bg-card)] p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{area} Report Library</span>
                <span className="text-xs font-normal text-slate-400 dark:text-slate-400">({filteredReports.length} Packages)</span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Filter, generate, download, and audit official accreditation report packages in PDF format.
              </p>
            </div>

            <button
              onClick={() => setShowBuildModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-astu-navy hover:bg-blue-900 dark:bg-sky-600 dark:hover:bg-sky-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-md dark:shadow-sky-950/50 transition-all shrink-0 hover:scale-[1.01] cursor-pointer"
            >
              <LineChart className="h-4 w-4" />
              <span>Build Report</span>
            </button>
          </div>

          {/* Quick Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by title, owner, or cadence..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 dark:focus:ring-sky-500/20 focus:border-astu-navy dark:focus:border-sky-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500 hidden sm:block" />
              <select
                value={cadenceFilter}
                onChange={(e) => setCadenceFilter(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-astu-navy/20 dark:focus:ring-sky-500/20 cursor-pointer"
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
            <div className="py-12 text-center border border-dashed border-[var(--border-color)] rounded-2xl p-8">
              <FileSpreadsheet className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No reports matching your filter</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search terms or clearing the cadence filter.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCadenceFilter('ALL'); setArea('All Domains'); }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
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
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/70 p-5 hover:border-astu-navy/40 dark:hover:border-sky-500/40 hover:shadow-lg dark:hover:shadow-sky-950/40 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-astu-navy dark:text-sky-300 ring-1 ring-blue-500/10 dark:ring-blue-500/20 group-hover:bg-astu-navy dark:group-hover:bg-sky-600 group-hover:text-white dark:group-hover:text-white transition-all">
                          <Icon className="h-5 w-5" />
                        </span>
                        <button
                          onClick={() => handleDownloadSinglePdf(report)}
                          disabled={isDownloading}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-astu-navy dark:hover:text-sky-300 hover:border-astu-navy/40 dark:hover:border-sky-500/40 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                          title={`Download Official PDF for ${report.title}`}
                        >
                          {isDownloading ? <RefreshCw className="h-4 w-4 animate-spin text-astu-navy dark:text-sky-300" /> : <Download className="h-4 w-4" />}
                        </button>
                      </div>

                      <h3 className="mt-3 text-sm font-black text-slate-900 dark:text-white group-hover:text-astu-navy dark:group-hover:text-sky-300 transition-colors">{report.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {report.owner} · <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-[11px]">{report.cadence}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> ABET / HERQA Audit Ready
                      </span>
                      <button
                        onClick={() => handleDownloadSinglePdf(report)}
                        className="text-astu-navy dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 hover:underline font-black flex items-center gap-0.5 cursor-pointer"
                      >
                        Export PDF →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
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
            <div className="bg-[var(--bg-card)] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-astu-navy dark:text-sky-300 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 font-bold shadow-xs">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-astu-navy dark:text-sky-400 block">
                      Custom Report Builder
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Compile Institutional Report</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowBuildModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleGenerateCustomReport} className="space-y-4 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Select Report Package ({reports.length} Total Options)
                  </label>
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-extrabold text-slate-800 dark:text-slate-100 focus:border-astu-navy dark:focus:border-sky-500 focus:outline-none"
                  >
                    {reports.map((r) => (
                      <option key={r.title} value={r.title} className="dark:bg-slate-800 dark:text-slate-100">
                        {r.title} ({r.area} Domain)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                      Department / Scope Filter
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 focus:border-astu-navy dark:focus:border-sky-500 focus:outline-none"
                    >
                      <option value="ALL" className="dark:bg-slate-800 dark:text-slate-100">All Departments (Institutional Wide)</option>
                      {departmentsList.map((d) => (
                        <option key={d.id} value={d.id} className="dark:bg-slate-800 dark:text-slate-100">
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                      Reporting Timeframe
                    </label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 focus:border-astu-navy dark:focus:border-sky-500 focus:outline-none"
                    >
                      <option value="Monthly" className="dark:bg-slate-800 dark:text-slate-100">Monthly Cycle</option>
                      <option value="Quarterly" className="dark:bg-slate-800 dark:text-slate-100">Quarterly Audit</option>
                      <option value="Biannual" className="dark:bg-slate-800 dark:text-slate-100">Biannual Review</option>
                      <option value="Annual" className="dark:bg-slate-800 dark:text-slate-100">Annual Quality Accreditation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
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
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedFormat === fmt.id
                            ? 'border-astu-navy dark:border-sky-500 bg-blue-50/60 dark:bg-sky-950/50 text-astu-navy dark:text-sky-300 font-black ring-1 ring-astu-navy/30 dark:ring-sky-500/30'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <p className="text-xs font-black">{fmt.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{fmt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audit Disclaimer */}
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed font-semibold flex items-start gap-2">
                  <FileText className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Generating this report will record a permanent entry in the Official System Audit Log and increment your monthly institutional export quota.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowBuildModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBuildingReport}
                    className="flex-1 py-3 rounded-xl bg-astu-navy hover:bg-blue-900 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-extrabold shadow-md dark:shadow-sky-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
