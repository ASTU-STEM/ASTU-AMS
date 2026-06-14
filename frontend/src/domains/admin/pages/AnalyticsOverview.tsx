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
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminStatCard from '../components/AdminStatCard';
import AdminBadge from '../components/AdminBadge';
import config from '../../../shared/config';

const getApiBaseUrl = () => config.apiUrl;

type AcademicYear = '2024-25' | '2023-24' | 'All Time';
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

const academicYears: AcademicYear[] = ['2024-25', '2023-24', 'All Time'];
const exportOptions = ['PDF', 'Excel', 'CSV'];

const statCards = [
  { label: 'Overall Employment Rate', value: '76.8%', change: '+3.4% vs last year', icon: TrendingUp, tone: 'green' as const },
  { label: 'Average Time to Hire', value: '4.2 months', change: '-0.6 months faster', icon: TimerReset, tone: 'blue' as const },
  { label: 'Avg Starting Salary', value: 'ETB 18,500/mo', change: '+ETB 1,200 vs last cohort', icon: Building2, tone: 'gold' as const },
  { label: 'Alumni Response Rate', value: '68.4%', change: '+5.2% from prior cycle', icon: Users, tone: 'red' as const },
];

const employmentByDepartmentYear = [
  { department: 'CS', y2022: 68, y2023: 72, y2024: 78 },
  { department: 'SE', y2022: 65, y2023: 70, y2024: 77 },
  { department: 'EE', y2022: 60, y2023: 66, y2024: 71 },
  { department: 'ME', y2022: 58, y2023: 63, y2024: 69 },
  { department: 'CE', y2022: 55, y2023: 61, y2024: 67 },
  { department: 'CHE', y2022: 63, y2023: 69, y2024: 74 },
  { department: 'IE', y2022: 66, y2023: 71, y2024: 76 },
];

const employmentTable = [
  { department: 'Computer Science', grads: 862, employed: 671, selfEmployed: 83, unemployed: 108, rate: 87.5, vsLastYear: '+4.1%' },
  { department: 'Software Engineering', grads: 744, employed: 562, selfEmployed: 91, unemployed: 91, rate: 87.8, vsLastYear: '+3.8%' },
  { department: 'Electrical Engineering', grads: 681, employed: 491, selfEmployed: 59, unemployed: 131, rate: 80.7, vsLastYear: '+2.6%' },
  { department: 'Mechanical Engineering', grads: 538, employed: 362, selfEmployed: 63, unemployed: 113, rate: 79.1, vsLastYear: '+1.9%' },
  { department: 'Civil Engineering', grads: 470, employed: 298, selfEmployed: 54, unemployed: 118, rate: 74.9, vsLastYear: '+1.1%' },
  { department: 'Chemical Engineering', grads: 324, employed: 238, selfEmployed: 24, unemployed: 62, rate: 80.9, vsLastYear: '+3.3%' },
  { department: 'Information Engineering', grads: 408, employed: 315, selfEmployed: 41, unemployed: 52, rate: 87.3, vsLastYear: '+4.5%' },
];

const skillGaps = [
  { skill: 'Cloud Computing', value: 92 },
  { skill: 'DevOps', value: 86 },
  { skill: 'AI/ML', value: 81 },
  { skill: 'Data Engineering', value: 79 },
  { skill: 'Cybersecurity', value: 75 },
  { skill: 'System Design', value: 72 },
  { skill: 'SQL & Data Modeling', value: 68 },
  { skill: 'Communication', value: 62 },
  { skill: 'Leadership', value: 58 },
  { skill: 'UI/UX', value: 55 },
];

const heatMapRows = [
  { department: 'CS', Cloud: 84, DevOps: 76, AI: 88, Data: 79, Cyber: 69, Comms: 42 },
  { department: 'SE', Cloud: 79, DevOps: 81, AI: 72, Data: 68, Cyber: 74, Comms: 46 },
  { department: 'EE', Cloud: 61, DevOps: 57, AI: 64, Data: 53, Cyber: 71, Comms: 49 },
  { department: 'ME', Cloud: 48, DevOps: 45, AI: 41, Data: 39, Cyber: 55, Comms: 44 },
  { department: 'CE', Cloud: 43, DevOps: 40, AI: 38, Data: 36, Cyber: 49, Comms: 41 },
  { department: 'CHE', Cloud: 52, DevOps: 50, AI: 46, Data: 44, Cyber: 58, Comms: 45 },
  { department: 'IE', Cloud: 74, DevOps: 69, AI: 78, Data: 72, Cyber: 66, Comms: 52 },
];

const competencyData = [
  { subject: 'Technical', score: 4.4 },
  { subject: 'Communication', score: 4.1 },
  { subject: 'Leadership', score: 3.9 },
  { subject: 'Teamwork', score: 4.3 },
  { subject: 'Problem Solving', score: 4.5 },
  { subject: 'Innovation', score: 4.0 },
];

const employerFeedback = [
  { company: 'Safaricom', department: 'Software Engineering', score: '4.7/5', note: 'Strong problem solving and delivery speed.' },
  { company: 'Ethio Telecom', department: 'Computer Science', score: '4.5/5', note: 'Excellent technical foundation, needs stronger DevOps exposure.' },
  { company: 'INSA', department: 'Information Engineering', score: '4.6/5', note: 'Solid systems thinking and security awareness.' },
  { company: 'CBE', department: 'Software Engineering', score: '4.3/5', note: 'Good teamwork, communication can improve.' },
  { company: 'Ethiopian Airlines', department: 'Electrical Engineering', score: '4.4/5', note: 'Reliable output quality and adaptability.' },
];

const geographicData = [
  { name: 'Addis Ababa', value: 58, fill: '#003580' },
  { name: 'Adama', value: 14, fill: '#1D9E75' },
  { name: 'Dire Dawa', value: 10, fill: '#E8A020' },
  { name: 'Mekelle', value: 8, fill: '#7C3AED' },
  { name: 'Nairobi', value: 6, fill: '#E24B4A' },
  { name: 'Dubai', value: 4, fill: '#5B7FB8' },
];

const timeToHire = [
  { batch: '2018', months: 6.8 },
  { batch: '2019', months: 6.1 },
  { batch: '2020', months: 5.9 },
  { batch: '2021', months: 5.2 },
  { batch: '2022', months: 4.8 },
  { batch: '2023', months: 4.4 },
  { batch: '2024', months: 4.0 },
];

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
  const [academicYear, setAcademicYear] = useState<AcademicYear>('2024-25');
  const [department, setDepartment] = useState<DepartmentFilter>('All');
  const [exportOpen, setExportOpen] = useState(false);
  const [topEmployers, setTopEmployers] = useState<{ companyName: string, count: number }[]>([]);

  React.useEffect(() => {
    fetch(`${getApiBaseUrl()}/analytics/employers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.data?.topHiringCompanies) {
          setTopEmployers(data.data.topHiringCompanies);
        }
      })
      .catch(console.error);
  }, []);

  const filteredDepartments = useMemo(() => {
    if (department === 'All') return employmentTable;
    return employmentTable.filter((row) => row.department === department);
  }, [department]);

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
              onChange={(event) => setAcademicYear(event.target.value as AcademicYear)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none"
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
              className="bg-transparent text-sm font-medium text-slate-700 outline-none"
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

        <div className="relative ml-auto flex flex-wrap items-center gap-2">
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Employment Analytics" subtitle="Employment rate per department per year.">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employmentByDepartmentYear} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
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
                <Bar dataKey="y2022" name="2022" fill="#B8C7E0" radius={[8, 8, 0, 0]} />
                <Bar dataKey="y2023" name="2023" fill="#5B7FB8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="y2024" name="2024" fill="#003580" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="y2024" position="top" formatter={(value: number) => `${value}%`} fill="#334155" fontSize={11} />
                </Bar>
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
                      <td className="px-4 py-3 text-slate-600">{row.rate.toFixed(1)}%</td>
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
                  <BarChart data={skillGaps} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
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
                    {heatMapRows.map((row) => (
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
                  <RadarChart data={competencyData}>
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
                  {employerFeedback.map((entry) => (
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
                  {topEmployers.length > 0 ? topEmployers.map((emp) => (
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
                  {geographicData.map((item, index) => {
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
                {geographicData.slice(0, 5).map((item) => (
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
            <LineChart data={timeToHire}>
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
