import React from 'react';
import {
  ArrowUpRight,
  Building2,
  Briefcase,
  ClipboardCheck,
  GraduationCap,
  Clock3,
  ShieldAlert,
  FileSpreadsheet,
  UserPlus,
  MessageSquareText,
  CheckCircle2,
  AlertTriangle,
  CircleDashed,
  Search,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  Legend,
} from 'recharts';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';

type TrendTone = 'success' | 'warning';

const statCards = [
  {
    label: 'Total Alumni',
    value: '4,827',
    trend: '+124 this year',
    icon: GraduationCap,
    accent: '#003580',
    chip: 'success' as TrendTone,
  },
  {
    label: 'Total Employers',
    value: '312',
    trend: '+18 this month',
    icon: Building2,
    accent: '#E8A020',
    chip: 'success' as TrendTone,
  },
  {
    label: 'Survey Completion',
    value: '68.4%',
    trend: '+5.2% vs last year',
    icon: ClipboardCheck,
    accent: '#1D9E75',
    chip: 'success' as TrendTone,
  },
  {
    label: 'Active Jobs',
    value: '47',
    trend: '12 expiring soon',
    icon: Briefcase,
    accent: '#7C3AED',
    chip: 'warning' as TrendTone,
  },
];

const employmentData = [
  { department: 'SE', value: 92 },
  { department: 'ME', value: 84 },
  { department: 'CE', value: 89 },
  { department: 'EE', value: 77 },
  { department: 'CHE', value: 95 },
  { department: 'IE', value: 81 },
];

const surveyData = [
  { name: 'Completed', value: 68, color: '#1D9E75' },
  { name: 'Pending', value: 22, color: '#E8A020' },
  { name: 'Never Responded', value: 10, color: '#E24B4A' },
];

const employmentTrendData = [
  { year: '2020', employed: 61, selfEmployed: 14 },
  { year: '2021', employed: 65, selfEmployed: 16 },
  { year: '2022', employed: 70, selfEmployed: 18 },
  { year: '2023', employed: 74, selfEmployed: 20 },
  { year: '2024', employed: 79, selfEmployed: 23 },
];

const hiringCompanies = [
  { name: 'Ethio Telecom', hires: 34 },
  { name: 'Safaricom', hires: 29 },
  { name: 'INSA', hires: 25 },
  { name: 'Ethiopian Airlines', hires: 21 },
  { name: 'Huawei', hires: 18 },
  { name: 'UN Ethiopia', hires: 15 },
  { name: 'CBE', hires: 12 },
].sort((a, b) => b.hires - a.hires);

const systemActivities = [
  { icon: FileSpreadsheet, tone: '#1D9E75', text: 'CSV import completed - 245 records', time: '2 minutes ago' },
  { icon: UserPlus, tone: '#003580', text: 'New employer registered: Safaricom', time: '17 minutes ago' },
  { icon: MessageSquareText, tone: '#E8A020', text: 'Survey #3 sent to 2024 batch', time: '41 minutes ago' },
  { icon: CheckCircle2, tone: '#1D9E75', text: 'Role permissions updated for registrar staff', time: '1 hour ago' },
  { icon: AlertTriangle, tone: '#E8A020', text: 'Backup queue rescheduled for midnight', time: '3 hours ago' },
  { icon: ShieldAlert, tone: '#E24B4A', text: 'Suspicious login attempt blocked', time: '5 hours ago' },
];

const pendingActions = [
  { label: '142 alumni accounts pending verification', action: 'Verify', tone: '#003580' },
  { label: '8 document requests awaiting approval', action: 'Review', tone: '#E8A020' },
  { label: '3 new employer registrations', action: 'Approve', tone: '#1D9E75' },
  { label: 'Survey Wave 3 due in 5 days', action: 'Manage', tone: '#7C3AED' },
];

const skillGaps = [
  { skill: 'Cloud Computing', value: 78 },
  { skill: 'DevOps', value: 71 },
  { skill: 'AI/ML', value: 65 },
  { skill: 'Cyber Security', value: 58 },
  { skill: 'Data Engineering', value: 52 },
];

const statToneClasses: Record<string, { circle: string; label: string; border: string }> = {
  '#003580': { circle: 'bg-[#003580]/10 text-[#003580]', label: 'text-[#003580]', border: 'border-[#003580]' },
  '#E8A020': { circle: 'bg-[#E8A020]/10 text-[#B87900]', label: 'text-[#B87900]', border: 'border-[#E8A020]' },
  '#1D9E75': { circle: 'bg-[#1D9E75]/10 text-[#1D9E75]', label: 'text-[#1D9E75]', border: 'border-[#1D9E75]' },
  '#7C3AED': { circle: 'bg-violet-500/10 text-violet-600', label: 'text-violet-600', border: 'border-violet-500' },
};

function TrendChip({ text, tone }: { text: string; tone: TrendTone }) {
  const classes =
    tone === 'success'
      ? 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15'
      : 'bg-[#EF9F27]/10 text-[#B86D00] border-[#EF9F27]/15';

  return <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold ${classes}`}>{text}</span>;
}

function ChartCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-card rounded-[10px] border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        subtitle="Operational command center for ASTU alumni administration, reporting, and system governance."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
        actions={<AdminBadge variant="success">Production Ready</AdminBadge>}
      />

      <section className="pb-6">
        <div className="rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,rgba(0,53,128,0.10),rgba(232,160,32,0.08),rgba(255,255,255,0.02))] px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">Daily briefing</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                {greeting}, System Administrator
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {today} · Adama Science and Technology University
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/10 px-3 py-1.5 text-sm font-semibold text-[#1D9E75]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1D9E75]" />
              All Systems Operational
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const styles = statToneClasses[card.accent];

          return (
            <div
              key={card.label}
              className={`admin-card rounded-[10px] border-l-[4px] border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${styles.border}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${styles.circle}`}>
                  <Icon className={`h-5 w-5 ${styles.label}`} />
                </div>
                <TrendChip text={card.trend} tone={card.chip} />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ChartCard
            title="Employment Rate by Department"
            subtitle="Percentage of alumni employed within each department group."
            action={
              <a href="#" className="text-xs font-semibold text-[#003580] hover:underline">
                View Full Report →
              </a>
            }
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employmentData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                  <XAxis dataKey="department" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Employment Rate']}
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #E8EDF5',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {employmentData.map((entry, index) => (
                      <Cell key={`cell-${entry.department}`} fill={index === 4 ? '#E8A020' : '#003580'} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={(value: number) => `${value}%`} fill="#334155" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="xl:col-span-2">
          <ChartCard title="Survey Completion Rate" subtitle="Current tracer survey response distribution.">
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={surveyData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {surveyData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <Label
                      value="68%"
                      position="center"
                      className="text-2xl font-semibold fill-slate-900"
                    />
                    <Label
                      value="Overall Completion"
                      position="center"
                      dy={22}
                      className="text-[11px] font-medium fill-slate-500"
                    />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #E8EDF5',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 18, fontSize: 12, color: '#475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Graduate Employment Trends (2020-2024)"
          subtitle="Employment distribution by career path across recent graduating cohorts."
        >
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={employmentTrendData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="employedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003580" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#003580" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="selfEmployedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8A020" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#E8A020" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="year" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                <Area type="monotone" dataKey="employed" stroke="#003580" fill="url(#employedFill)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="selfEmployed" stroke="#E8A020" fill="url(#selfEmployedFill)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="employed" name="Employed" stroke="#003580" strokeWidth={3} dot={{ r: 4, fill: '#003580' }} />
                <Line type="monotone" dataKey="selfEmployed" name="Self-Employed" stroke="#E8A020" strokeWidth={3} dot={{ r: 4, fill: '#E8A020' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Top Hiring Companies"
          subtitle="Organizations with the highest graduate hiring volume."
        >
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hiringCompanies} layout="vertical" margin={{ top: 12, right: 24, left: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fill: '#334155', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [value, 'Hires']}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="hires" radius={[0, 8, 8, 0]} fill="#003580">
                  <LabelList dataKey="hires" position="right" fill="#334155" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="admin-card rounded-[10px] border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent System Activity</h3>
              <p className="mt-1 text-xs text-slate-500">Latest administrative actions and sync events.</p>
            </div>
            <AdminBadge variant="neutral">Live Feed</AdminBadge>
          </div>

          <div className="mt-5 space-y-4">
            {systemActivities.map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.text} className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.tone }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <Icon className="mt-0.5 h-4 w-4 flex-none" style={{ color: entry.tone }} />
                      <p className="text-sm text-slate-700">{entry.text}</p>
                    </div>
                    <p className="mt-1 pl-6 text-[11px] text-slate-400">{entry.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card rounded-[10px] border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Pending Actions</h3>
            <p className="mt-1 text-xs text-slate-500">Tasks waiting for administrative review.</p>
          </div>

          <div className="mt-5 space-y-3">
            {pendingActions.map((task) => (
              <div
                key={task.label}
                className="rounded-[10px] border border-slate-200 border-l-4 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                style={{ borderLeftColor: task.tone }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700">{task.label}</p>
                  <button
                    type="button"
                    className="rounded-md px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: task.tone }}
                  >
                    {task.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card rounded-[10px] border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Skill Gap Alert</h3>
            <p className="mt-1 text-xs text-slate-500">Top Missing Skills Reported by Employers</p>
          </div>

          <div className="mt-5 space-y-4">
            {skillGaps.map((item) => (
              <div key={item.skill} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{item.skill}</span>
                  <span className="font-semibold text-slate-500">{item.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#003580] via-[#5B7FB8] to-[#E8A020]"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500">
            Based on 94 employer feedback submissions
          </div>
        </div>
      </section>
    </div>
  );
}
