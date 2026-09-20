import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';
import { adminService } from '../services/admin.service';
import { generateAndDownloadReport } from '../utils/reportPdfGenerator';

type ReportArea = 'Employment' | 'Tracer Studies' | 'Industry' | 'Engagement' | 'Events' | 'Accreditation & Quality' | 'Governance & Security';

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

const areas: ReportArea[] = ['Employment', 'Tracer Studies', 'Industry', 'Engagement', 'Events', 'Accreditation & Quality', 'Governance & Security'];

export default function ReportsCenter() {
  const [area, setArea] = useState<ReportArea>('Employment');
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    employmentRate: string;
    employerSatisfaction: string;
    mappedCountries: number | string;
    exportedThisMonth: number;
  }>({
    employmentRate: '...',
    employerSatisfaction: '...',
    mappedCountries: '...',
    exportedThisMonth: 0,
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

  const filteredReports = useMemo(() => reports.filter((report) => report.area === area), [area]);

  const fetchMetrics = async () => {
    try {
      const res = await adminService.getReportsMetrics();
      if (res.ok && res.data) {
        setMetrics({
          employmentRate: res.data.employmentRate,
          employerSatisfaction: res.data.employerSatisfaction,
          mappedCountries: res.data.mappedCountries,
          exportedThisMonth: res.data.exportedThisMonth,
        });
      }
    } catch (_) {
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
        subtitle="Accreditation-ready exports for employment, top hiring companies, salary benchmarks, geographic mobility, tracer studies, industry demand, skill gaps, alumni engagement, events, and employer satisfaction."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Reports' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMetrics}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
              title="Refresh Metrics"
            >
              <RefreshCw className={`h-4 w-4 ${metricsLoading ? 'animate-spin' : ''}`} />
            </button>
            <AdminBadge variant="success">Export Center ({reports.length} Reports)</AdminBadge>
          </div>
        }
      />

      {/* Metric Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Employment Rate', value: metrics.employmentRate, icon: GraduationCap, color: 'text-emerald-600' },
          { label: 'Employer Satisfaction', value: metrics.employerSatisfaction, icon: Building2, color: 'text-amber-600' },
          { label: 'Mapped Countries', value: metrics.mappedCountries, icon: Globe2, color: 'text-blue-600' },
          { label: 'Exported This Month', value: metrics.exportedThisMonth, icon: Download, color: 'text-[#003580]' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900 font-mono">
                {metricsLoading ? <RefreshCw className="h-5 w-5 animate-spin text-slate-400" /> : metric.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* Main Report Library Grid */}
      <section className="grid gap-6 xl:grid-cols-[300px_1fr]">
        {/* Category Switcher Sidebar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs h-fit space-y-1">
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-2">
            Report Domains ({reports.length})
          </p>
          {areas.map((item) => {
            const count = reports.filter((report) => report.area === item).length;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setArea(item)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-xs font-extrabold transition-all ${
                  area === item
                    ? 'bg-[#003580] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{item}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    area === item ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Domain Report Library */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>{area} Report Library</span>
                <span className="text-xs font-normal text-slate-400">({filteredReports.length} Packages)</span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Filter, generate, download, and audit official accreditation report packages in PDF format.
              </p>
            </div>

            <button
              onClick={() => setShowBuildModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] hover:bg-[#002866] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition-all shrink-0 hover:scale-[1.01]"
            >
              <LineChart className="h-4 w-4" />
              <span>Build Report</span>
            </button>
          </div>

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredReports.map((report) => {
              const Icon = report.icon;
              const isDownloading = downloadingReportTitle === report.title;

              return (
                <article
                  key={report.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 hover:bg-white hover:border-[#003580]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#003580] shadow-xs border border-slate-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <button
                        onClick={() => handleDownloadSinglePdf(report)}
                        disabled={isDownloading}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-[#003580] hover:border-[#003580]/40 hover:shadow-xs transition-all disabled:opacity-50"
                        title={`Download Official PDF for ${report.title}`}
                      >
                        {isDownloading ? <RefreshCw className="h-4 w-4 animate-spin text-[#003580]" /> : <Download className="h-4 w-4" />}
                      </button>
                    </div>

                    <h3 className="mt-3 text-sm font-black text-slate-900">{report.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 font-semibold">
                      {report.owner} · <span className="text-slate-700 font-bold">{report.cadence}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/70 text-[10px] font-extrabold text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> ABET / HERQA Audit Ready
                    </span>
                    <button
                      onClick={() => handleDownloadSinglePdf(report)}
                      className="text-[#003580] hover:underline font-black flex items-center gap-0.5"
                    >
                      Export PDF →
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Build Report Modal Drawer */}
      {showBuildModal &&
        createPortal(
          <div
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowBuildModal(false);
            }}
          >
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#003580]/10 text-[#003580] flex items-center justify-center border border-[#003580]/20 font-bold shadow-sm">
                    <SlidersHorizontal className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#003580] block">
                      Custom Report Builder
                    </span>
                    <h3 className="text-lg font-black text-slate-900">Compile Institutional Report</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowBuildModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleGenerateCustomReport} className="space-y-4 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Select Report Package ({reports.length} Total Options)
                  </label>
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-800 focus:border-[#003580] focus:outline-none"
                  >
                    {reports.map((r) => (
                      <option key={r.title} value={r.title}>
                        {r.title} ({r.area} Domain)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Department / Scope Filter
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:border-[#003580] focus:outline-none"
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
                    <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Reporting Timeframe
                    </label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:border-[#003580] focus:outline-none"
                    >
                      <option value="Monthly">Monthly Cycle</option>
                      <option value="Quarterly">Quarterly Audit</option>
                      <option value="Biannual">Biannual Review</option>
                      <option value="Annual">Annual Quality Accreditation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
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
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedFormat === fmt.id
                            ? 'border-[#003580] bg-[#003580]/10 text-[#003580] font-black ring-1 ring-[#003580]/30'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <p className="text-xs font-black">{fmt.label}</p>
                        <p className="text-[10px] text-slate-500">{fmt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audit Disclaimer */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-semibold flex items-start gap-2">
                  <FileText className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Generating this report will record a permanent entry in the Official System Audit Log and increment your monthly institutional export quota.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBuildModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBuildingReport}
                    className="flex-1 py-3 rounded-xl bg-[#003580] hover:bg-[#002866] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
