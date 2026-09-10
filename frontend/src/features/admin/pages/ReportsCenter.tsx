import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminPageHeader from '../components/AdminPageHeader';

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
  const filteredReports = useMemo(() => reports.filter((report) => report.area === area), [area]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Institutional Reports"
        subtitle="Accreditation-ready exports for employment, salary, geographic distribution, tracer studies, industry demand, skill gaps, alumni engagement, events, and employer satisfaction."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Reports' }]}
        actions={<AdminBadge variant="success">Export Center</AdminBadge>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Employment Rate', value: '84%', icon: GraduationCap },
          { label: 'Employer Satisfaction', value: '4.6/5', icon: Building2 },
          { label: 'Mapped Countries', value: '31', icon: Globe2 },
          { label: 'Exported This Month', value: '42', icon: Download },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <Icon className="h-6 w-6 text-[#003580]" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <div className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {areas.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setArea(item)}
              className={`flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left text-sm font-semibold ${area === item ? 'bg-[#003580] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {item}
              <span>{reports.filter((report) => report.area === item).length}</span>
            </button>
          ))}
        </div>

        <div className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{area} Report Library</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Filter, generate, download, and audit each official report package.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-3 py-2 text-xs font-semibold text-white">
              <LineChart className="h-4 w-4" />
              Build Report
            </button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {filteredReports.map((report) => {
              const Icon = report.icon;
              return (
                <article key={report.title} className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-white dark:bg-slate-900 text-[#003580]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <button className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300" aria-label={`Download ${report.title}`}>
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{report.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{report.owner} · {report.cadence}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
