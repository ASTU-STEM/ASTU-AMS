import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';
import {
  BarChart3,
  Building2,
  CalendarRange,
  ChevronDown,
  Download,
  Globe2,
  MapPinned,
  Printer,
  School,
  Share2,
  TimerReset,
  TrendingUp,
  Users,
  FileCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminStatCard from '../components/AdminStatCard';
import AdminBadge from '../components/AdminBadge';
import { adminService } from '../services/admin.service';

type DepartmentFilter = 'All' | 'Computer Science' | 'Software Engineering' | 'Electrical Engineering' | 'Mechanical Engineering' | 'Civil Engineering' | 'Chemical Engineering' | 'Information Engineering';

const departments = [
  'Computer Science',
  'Software Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Information Engineering',
] as const;

const generateAcademicYears = (): string[] => {
  const years: string[] = ['All Time'];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear + 1; y >= 2000; y--) {
    const nextYY = String(y + 1).slice(-2);
    years.push(`${y}-${nextYY}`);
  }
  return years;
};

const academicYears = generateAcademicYears();
const exportOptions = ['PDF', 'Excel', 'CSV'];

function heatColor(value: number) {
  if (value >= 80) return 'bg-[#E24B4A] text-white';
  if (value >= 65) return 'bg-[#EF9F27] text-white';
  if (value >= 50) return 'bg-[#E8A020] text-white';
  if (value >= 35) return 'bg-[#9ACD6B] text-white';
  return 'bg-[#1D9E75] text-white';
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card rounded-[10px] border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-card rounded-[10px] border border-slate-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsOverview() {
  const [academicYear, setAcademicYear] = useState<string>('2024-25');
  const [department, setDepartment] = useState<DepartmentFilter>('All');
  const [exportOpen, setExportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [reportData, setReportData] = useState<any>(null);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      const result = await adminService.getAnalyticsReport({ academicYear, department });
      if (result.ok) {
        setReportData(result.data);
      }
      setIsLoading(false);
    };
    fetchAnalytics();
  }, [academicYear, department]);

  const hasBatchData = useMemo(() => {
    if (!reportData) return true;
    if (academicYear === 'All Time') return true;
    const totalAlumni = reportData?.overallEmployment?.totalAlumni || 0;
    return totalAlumni > 0;
  }, [reportData, academicYear]);

  const activeStatCards = [
    { label: 'Overall Employment Rate', value: `${Number(reportData?.overallEmployment?.employmentRate || 0).toFixed(1)}%`, change: 'Current average', icon: TrendingUp, tone: 'green' as const },
    { label: 'Average Time to Hire', value: `${Number(reportData?.overallEmployment?.timeToHireMonths || 0).toFixed(1)} months`, change: 'Average duration', icon: TimerReset, tone: 'blue' as const },
    { label: 'Avg Starting Salary', value: `ETB ${Number(reportData?.overallEmployment?.averageSalary || 0).toLocaleString()}/mo`, change: 'Based on tracer data', icon: Building2, tone: 'gold' as const },
    { label: 'Alumni Survey Response', value: `${Number(reportData?.tracer?.surveyCompletionRate || 0).toFixed(1)}%`, change: 'Overall participation', icon: Users, tone: 'red' as const },
  ];

  const activeEmploymentTable = useMemo(() => (
    reportData?.departmentAnalytics?.departmentMetrics?.map((dept: any) => ({
      department: dept.departmentName,
      grads: dept.totalAlumni,
      employed: dept.statusDistribution?.find((d: any) => d.status === 'EMPLOYED')?.count || 0,
      selfEmployed: dept.statusDistribution?.find((d: any) => d.status === 'SELF_EMPLOYED')?.count || 0,
      unemployed: dept.statusDistribution?.find((d: any) => d.status === 'UNEMPLOYED')?.count || 0,
      rate: dept.employmentRate || 0,
      vsLastYear: `Score: ${Number(dept.employabilityScore || 0).toFixed(1)}`
    })) || []
  ), [reportData]);

  const activeSkillGaps = reportData?.curriculum?.missingSkills?.map((s: any) => ({
    skill: s.skill,
    value: s.demandCount * 15 // Scale demand count for visualization
  })).sort((a: any, b: any) => b.value - a.value).slice(0, 10) || [];

  const activeTopEmployers = reportData?.employers?.topHiringCompanies || [];
  const activeCompetencyData = reportData?.curriculum?.skillGaps?.map((sg: any) => ({ subject: sg.skill, score: sg.gapScore })) || [];
  const activeEmployerFeedback = reportData?.employers?.employerRankings?.map((er: any) => ({ company: er.companyName, department: 'General', score: `${Number(er.score || 0).toFixed(1)}/10`, note: 'Evaluated from tracer data' })) || [];
  const activeGeographicData: any[] = []; // Currently no geographic data in backend
  const activeTimeToHire = reportData?.overallEmployment?.rateByGraduationYear?.map((r: any) => ({ batch: String(r.year), months: 6.0 })) || [];
  const activeHeatMapRows: any[] = [];
  const activeEmploymentByDepartmentYear = reportData?.departmentAnalytics?.trendAnalysis?.map((t: any) => {
    const yearObj: any = { department: String(t.year) };
    t.departments?.forEach((d: any) => { yearObj[d.code] = d.rate; });
    return yearObj;
  }) || [];

  const filteredDepartments = useMemo(() => {
    if (department === 'All') return activeEmploymentTable;
    return activeEmploymentTable.filter((row: any) => row.department.includes(department));
  }, [department, activeEmploymentTable]);

  const printDashboard = () => {
    window.print();
  };

  const exportFormat = (format: string) => {
    setExportOpen(false);
    // Placeholder action for now; actual file generation can hook into backend later.
    console.info(`Exporting analytics as ${format} for ${academicYear}`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics Overview"
        subtitle="System-wide intelligence center for alumni outcomes, skills, and employer feedback."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Analytics Overview' }]}
        actions={<AdminBadge variant="success">Insights Live</AdminBadge>}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm text-slate-600">
            <CalendarRange className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Academic Year</span>
            <select
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm text-slate-600">
            <School className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Department</span>
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value as DepartmentFilter)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="All">All</option>
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Fetching Batch Data...
            </div>
          )}

          <div className="relative flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setExportOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5"
            >
              <Download className="h-4 w-4" />
              Export Report
              <ChevronDown className="h-4 w-4" />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-[10px] border border-slate-200 bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                {exportOptions.map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => exportFormat(format)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Share2 className="h-4 w-4" />
                    {format}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={printDashboard}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              <Printer className="h-4 w-4" />
              Print Dashboard
            </button>
          </div>
        </div>

      {!hasBatchData && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-[12px] p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-amber-900">
            No Analysis is worked for this batch ({academicYear})
          </h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
            No alumni graduation records or tracer survey responses have been registered for batch {academicYear} in PostgreSQL yet.
          </p>
          <button
            onClick={() => setAcademicYear('All Time')}
            className="px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-semibold hover:bg-amber-900 transition-all shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Filter to All Time
          </button>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {activeStatCards.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Employment Analytics" subtitle="Employment rate per department per year.">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeEmploymentByDepartmentYear} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="department" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend />
                <Bar dataKey="SWE" name="SWE" fill="#B8C7E0" radius={[8, 8, 0, 0]} />
                <Bar dataKey="ECE" name="ECE" fill="#5B7FB8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="CVE" name="CVE" fill="#003580" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 overflow-hidden rounded-[10px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Department', 'Grads', 'Employed', 'Self-Employed', 'Unemployed', 'Employment Rate', 'vs Last Year'].map((head) => (
                      <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((row) => (
                    <tr key={row.department} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-700">{row.department}</td>
                      <td className="px-4 py-3 text-slate-600">{row.grads}</td>
                      <td className="px-4 py-3 text-slate-600">{row.employed}</td>
                      <td className="px-4 py-3 text-slate-600">{row.selfEmployed}</td>
                      <td className="px-4 py-3 text-slate-600">{row.unemployed}</td>
                      <td className="px-4 py-3 text-slate-600">{typeof row.rate === 'number' ? row.rate.toFixed(1) : row.rate}%</td>
                      <td className="px-4 py-3">
                        <AdminBadge variant="success">{row.vsLastYear}</AdminBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Skill Gap Analysis" subtitle="Top missing skills and department-level gap scores.">
          <div className="space-y-5">
            <ChartCard title="Industry-Reported Skill Gaps" subtitle="Top 10 missing skills reported by employers.">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeSkillGaps} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <YAxis type="category" dataKey="skill" width={120} tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#E24B4A" radius={[0, 8, 8, 0]}>
                      <LabelList dataKey="value" position="right" fill="#334155" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <div className="overflow-hidden rounded-[10px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Department</th>
                      {['Cloud', 'DevOps', 'AI', 'Data', 'Cyber', 'Comms'].map((header) => (
                        <th key={header} className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeHeatMapRows.map((row) => (
                      <tr key={row.department} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-700">{row.department}</td>
                        {['Cloud', 'DevOps', 'AI', 'Data', 'Cyber', 'Comms'].map((skill) => {
                          const value = row[skill as keyof typeof row] as number;
                          return (
                            <td key={skill} className="px-3 py-3 text-center">
                              <span className={`inline-flex min-w-14 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold ${heatColor(value)}`}>
                                {value}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Employer Feedback Scores" subtitle="Average competency scores and latest employer feedback.">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <ChartCard title="Competency Radar" subtitle="Average scores across six dimensions.">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={activeCompetencyData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748B', fontSize: 10 }} />
                    <Tooltip />
                    <Radar name="Average Score" dataKey="score" stroke="#003580" fill="#003580" fillOpacity={0.18} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Latest Employer Feedback</h4>
                <p className="mt-1 text-xs text-slate-500">Most recent submitted review entries.</p>
                <div className="mt-4 space-y-3">
                  {activeEmployerFeedback.map((entry) => (
                    <div key={`${entry.company}-${entry.department}`} className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{entry.company}</div>
                          <div className="text-xs text-slate-500">{entry.department}</div>
                        </div>
                        <AdminBadge variant="success">{entry.score}</AdminBadge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">{entry.note}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-[#003580] flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Top Companies Hiring ASTU Graduates
                </h4>
                <div className="mt-4 space-y-2">
                  {activeTopEmployers.length > 0 ? activeTopEmployers.map((emp: any) => (
                    <div key={emp.companyName} className="flex items-center justify-between p-2 rounded-md bg-[#003580]/5 border border-[#003580]/10">
                      <span className="text-sm font-medium text-slate-700">{emp.companyName}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-white rounded shadow-sm text-[#003580]">{emp.count} hires</span>
                    </div>
                  )) : (
                    <div className="text-xs text-slate-500 p-2 text-center border border-dashed rounded-md">Loading top companies...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Geographic Distribution" subtitle="Where alumni are currently working.">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Map / Treemap View</h4>
                  <p className="mt-1 text-xs text-slate-500">Simple location distribution fallback.</p>
                </div>
                <AdminBadge variant="neutral">Fallback SVG</AdminBadge>
              </div>
              <div className="flex h-[310px] items-center justify-center overflow-hidden rounded-[10px] border border-slate-200 bg-white p-3">
                <svg viewBox="0 0 760 360" className="h-full w-full">
                  <defs>
                    <linearGradient id="geoFill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#003580" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#E8A020" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <rect x="30" y="30" width="700" height="300" rx="24" fill="#F8FAFD" stroke="#E8EDF5" />
                  <path
                    d="M110 220 L170 150 L240 135 L310 160 L365 120 L430 140 L510 115 L600 150 L650 210 L590 260 L510 250 L445 275 L360 255 L280 280 L200 250 Z"
                    fill="url(#geoFill)"
                    opacity="0.18"
                    stroke="#003580"
                    strokeWidth="2"
                  />
                  {activeGeographicData.map((item, index) => {
                    const coords = [
                      [180, 170],
                      [270, 150],
                      [350, 165],
                      [430, 150],
                      [520, 190],
                      [610, 150],
                    ] as Array<[number, number]>;
                    const [cx, cy] = coords[index] ?? [100 + index * 80, 220];
                    return (
                      <g key={item.name}>
                        <circle cx={cx} cy={cy} r={14 + item.value * 0.3} fill={item.fill} fillOpacity="0.82" stroke="white" strokeWidth="2" />
                        <circle cx={cx} cy={cy} r="4" fill="white" />
                        <text x={cx} y={cy + 30} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600">
                          {item.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h4 className="text-sm font-semibold text-slate-900">Top Locations</h4>
              <p className="mt-1 text-xs text-slate-500">Top 5 cities / countries where alumni work.</p>
              <div className="mt-4 space-y-3">
                {activeGeographicData.slice(0, 5).map((item) => (
                  <div key={item.name} className="rounded-[10px] border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Time-to-Hire Trend" subtitle="Average months to first employment by graduating batch.">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeTimeToHire}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
              <XAxis dataKey="batch" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="months"
                stroke="#003580"
                strokeWidth={3}
                dot={{ r: 4, fill: '#003580' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Accreditation Report Generator</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Export verified data for ETA and international accreditation bodies
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="admin-card rounded-[10px] border border-slate-200 border-t-[3px] border-t-[#E8A020] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003580]/10 text-[#003580]">
                <FileCheck className="h-5 w-5" />
              </div>
              <AdminBadge variant="neutral">ETA</AdminBadge>
            </div>
            <h4 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">ETA Tracer Study Report</h4>
            <button type="button" className="mt-4 inline-flex rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
              Generate PDF
            </button>
          </div>

          <div className="admin-card rounded-[10px] border border-slate-200 border-t-[3px] border-t-[#E8A020] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <AdminBadge variant="neutral">Internal</AdminBadge>
            </div>
            <h4 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">Department Performance Report</h4>
            <button type="button" className="mt-4 inline-flex rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
              Generate PDF
            </button>
          </div>

          <div className="admin-card rounded-[10px] border border-slate-200 border-t-[3px] border-t-[#E8A020] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8A020]/10 text-[#B87900]">
                <Globe2 className="h-5 w-5" />
              </div>
              <AdminBadge variant="warning">Global</AdminBadge>
            </div>
            <h4 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">International Accreditation Package</h4>
            <button type="button" className="mt-4 inline-flex rounded-[8px] border border-[#E8A020]/30 px-4 py-2.5 text-sm font-semibold text-[#B87900] hover:bg-[#E8A020]/10">
              Export Excel
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
