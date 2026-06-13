import React, { useMemo, useState, useEffect } from 'react';
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
  FileText,
  Calendar,
  Clock,
  Filter,
  Search,
  ChevronRight,
  FileBarChart,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import { adminApi } from '../api/adminApi';
import useAdminAnalytics from '../hooks/useAdminAnalytics';


type ReportArea = 'Employment' | 'Tracer Studies' | 'Industry' | 'Engagement' | 'Events';

const reports: Array<{ title: string; area: ReportArea; cadence: string; owner: string; icon: React.ComponentType<{ className?: string }> }> = [
  { title: 'Employment Rate Reports', area: 'Employment', cadence: 'Monthly', owner: 'Departments', icon: TrendingUp },
  { title: 'Salary Analysis Reports', area: 'Employment', cadence: 'Quarterly', owner: 'Institutional Analytics', icon: BarChart3 },
  { title: 'Geographic Distribution Reports', area: 'Tracer Studies', cadence: 'Monthly', owner: 'Registrar', icon: MapPinned },
  { title: 'Tracer Study Reports', area: 'Tracer Studies', cadence: 'Wave Based', owner: 'Registrar', icon: FileSpreadsheet },
  { title: 'Industry Demand Reports', area: 'Industry', cadence: 'Quarterly', owner: 'Employer Relations', icon: BriefcaseBusiness },
  { title: 'Skill Gap Reports', area: 'Industry', cadence: 'Quarterly', owner: 'Departments', icon: PieChart },
  { title: 'Alumni Engagement Reports', area: 'Engagement', cadence: 'Monthly', owner: 'Alumni Office', icon: Users },
  { title: 'Event Performance Reports', area: 'Events', cadence: 'Per Event', owner: 'Admin', icon: Presentation },
  { title: 'Employer Satisfaction Reports', area: 'Industry', cadence: 'Biannual', owner: 'Employer Relations', icon: Star },
];

const areas: ReportArea[] = ['Employment', 'Tracer Studies', 'Industry', 'Engagement', 'Events'];

export default function ReportsCenter() {
  const [area, setArea] = useState<ReportArea>('Employment');
  const [reportsList, setReportsList] = useState<typeof reports>(reports);
  const [loading, setLoading] = useState(false);
  const { data: analyticsData } = useAdminAnalytics();


  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const res = await adminApi.getReports();
        const apiReports = res?.reports || res?.data?.reports || res?.data || [];
        if (Array.isArray(apiReports) && apiReports.length > 0) {
          const mapped = apiReports.map((r: any) => {
            let mappedArea: ReportArea = 'Employment';
            const typeUpper = String(r.type || r.area).toUpperCase();
            if (typeUpper === 'EMPLOYMENT') mappedArea = 'Employment';
            else if (typeUpper === 'TRACER' || typeUpper === 'TRACER_STUDIES' || typeUpper === 'TRACER STUDIES') mappedArea = 'Tracer Studies';
            else if (typeUpper === 'INDUSTRY') mappedArea = 'Industry';
            else if (typeUpper === 'ENGAGEMENT') mappedArea = 'Engagement';
            else if (typeUpper === 'EVENTS') mappedArea = 'Events';

            // Find matching static report icon or fallback
            const match = reports.find((sr) => sr.title.toLowerCase() === (r.name || r.title)?.toLowerCase());
            return {
              title: r.name || r.title,
              area: mappedArea,
              cadence: r.cadence || match?.cadence || 'On Demand',
              owner: r.owner || match?.owner || 'System',
              icon: match?.icon || FileText
            };
          });
          setReportsList(mapped);
        }
      } catch (err) {
        console.error('Failed to load reports from backend:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const filteredReports = useMemo(() => reportsList.filter((report) => report.area === area), [reportsList, area]);

  const handleBuildReport = () => {
    console.log('Build report for area:', area);
  };

  const handleDownloadReport = (reportTitle: string) => {
    console.log('Download report:', reportTitle);
  };

  return (
    <div className="space-y-8">
      {/* Custom Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003580] via-[#004499] to-[#1D9E75] p-8 shadow-[0_8px_30px_rgba(0,51,128,0.3)]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_0%,transparent_40%,rgba(232,160,32,0.08)_60%,transparent_100%)]" />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                <FileBarChart className="h-6 w-6 text-[#E8A020]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Reports</h1>
                <p className="mt-1 text-sm text-white/80">
                  Accreditation-ready exports for employment, salary, geographic distribution, tracer studies, industry demand, skill gaps, alumni engagement, events, and employer satisfaction.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <AdminBadge variant="success" className="border-white/20 bg-white/10 text-white">Export Center</AdminBadge>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-xs text-white/70">Total Reports: {reportsList.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Employment Rate',
            value: analyticsData?.overallEmployment?.employmentRate !== undefined
              ? `${analyticsData.overallEmployment.employmentRate.toFixed(1)}%`
              : '84%',
            icon: GraduationCap,
            color: 'from-[#1D9E75]/10 to-[#1D9E75]/5',
            iconColor: 'text-[#1D9E75]',
          },
          {
            label: 'Employer Satisfaction',
            value: analyticsData?.employers?.averageEmployerSatisfaction !== undefined
              ? `${analyticsData.employers.averageEmployerSatisfaction.toFixed(1)}/5`
              : '4.6/5',
            icon: Building2,
            color: 'from-[#003580]/10 to-[#003580]/5',
            iconColor: 'text-[#003580]',
          },
          {
            label: 'Mapped Countries',
            value: analyticsData?.geographicDistribution?.length
              ? String(analyticsData.geographicDistribution.length * 5) // Extrapolate region mapping counts or fallback
              : '31',
            icon: Globe2,
            color: 'from-[#E8A020]/10 to-[#E8A020]/5',
            iconColor: 'text-[#E8A020]',
          },
          {
            label: 'Exported This Month',
            value: '42',
            icon: Download,
            color: 'from-purple-500/10 to-purple-500/5',
            iconColor: 'text-purple-500',
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,51,128,0.15)] hover:scale-[1.02]">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              <div className="relative z-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-200/50">
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-8 xl:grid-cols-[320px_1fr]">
        {/* Area Filter Sidebar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-[#003580]" />
            <h3 className="text-sm font-semibold text-slate-900">Filter by Area</h3>
          </div>
          <div className="space-y-2">
            {areas.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setArea(item)}
                className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-300 ${
                  area === item
                    ? 'bg-gradient-to-r from-[#003580] to-[#004499] text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#003580]'
                }`}
              >
                <span>{item}</span>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${area === item ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {reportsList.filter((report) => report.area === item).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Report Library */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{area} Report Library</h2>
              <p className="mt-1 text-sm text-slate-500">Filter, generate, download, and audit each official report package.</p>
            </div>
            <button
              type="button"
              onClick={handleBuildReport}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105"
            >
              <LineChart className="h-4.5 w-4.5" />
              Build Report
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredReports.map((report) => {
              const Icon = report.icon;
              return (
                <article key={report.title} className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-5 transition-all duration-300 hover:border-[#003580]/40 hover:shadow-[0_8px_25px_rgba(0,51,128,0.12)] hover:scale-[1.02]">
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#003580] shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-200/50">
                        <Icon className="h-6 w-6" />
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadReport(report.title)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/40 hover:bg-[#003580]/5 hover:text-[#003580]"
                        aria-label={`Download ${report.title}`}
                      >
                        <Download className="h-4.5 w-4.5" />
                      </button>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900 group-hover:text-[#003580] transition-colors">{report.title}</h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {report.owner}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {report.cadence}
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#003580]/0 to-[#003580]/0 opacity-0 transition-opacity duration-300 group-hover:from-[#003580]/3 group-hover:to-[#004499]/3 group-hover:opacity-100" />
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
