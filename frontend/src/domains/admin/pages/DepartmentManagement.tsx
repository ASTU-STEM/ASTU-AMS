import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MapPin,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminStatCard from '../components/AdminStatCard';

type DepartmentRecord = {
  id: string;
  name: string;
  college: string;
  head: string;
  totalGraduates: number;
  employmentRate: number;
  activeAlumni: number;
  avgSalary: string;
  topSector: string;
  spark: number[];
  employmentTimeline: { year: string; rate: number }[];
  topEmployers: { name: string; hires: number }[];
  gaps: string[];
  alumni: { name: string; batch: string; employer: string; status: 'Active' | 'Pending' | 'Inactive' }[];
};

type DepartmentForm = {
  name: string;
  college: string;
  head: string;
  description: string;
};

const departmentPool = [
  'Computer Science',
  'Software Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Information Engineering',
];

const collegePool = ['College of Computing', 'College of Engineering', 'College of Natural Sciences', 'College of Business and Economics'];

const userSearchPool = [
  'Dr. Meseret Alemu',
  'Dr. Abebe Assefa',
  'Dr. Yohannes Tekle',
  'Prof. Lidia Bekele',
  'Dr. Meron Tadesse',
  'Dr. Tewodros Kassa',
];

const departmentRecords: DepartmentRecord[] = [
  {
    id: 'computer-science',
    name: 'Computer Science',
    college: 'College of Computing',
    head: 'Dr. Meseret Alemu',
    totalGraduates: 862,
    employmentRate: 87.5,
    activeAlumni: 671,
    avgSalary: 'ETB 22,800',
    topSector: 'Telecom & Software',
    spark: [69, 72, 74, 78, 81, 87],
    employmentTimeline: [
      { year: '2020', rate: 68 },
      { year: '2021', rate: 71 },
      { year: '2022', rate: 74 },
      { year: '2023', rate: 81 },
      { year: '2024', rate: 87 },
    ],
    topEmployers: [
      { name: 'Ethio Telecom', hires: 34 },
      { name: 'Safaricom', hires: 29 },
      { name: 'INSA', hires: 23 },
      { name: 'Huawei', hires: 18 },
    ],
    gaps: ['DevOps Automation', 'Cloud Architecture', 'Secure Coding'],
    alumni: [
      { name: 'Abebe Kebede', batch: '2018', employer: 'Ethio Telecom', status: 'Active' },
      { name: 'Helena Tesfaye', batch: '2019', employer: 'Safaricom', status: 'Pending' },
      { name: 'Kalkidan Tadesse', batch: '2020', employer: 'INSA', status: 'Active' },
      { name: 'Mekdes Yimer', batch: '2021', employer: 'Huawei', status: 'Inactive' },
    ],
  },
  {
    id: 'software-engineering',
    name: 'Software Engineering',
    college: 'College of Computing',
    head: 'Dr. Tewodros Kassa',
    totalGraduates: 744,
    employmentRate: 87.8,
    activeAlumni: 562,
    avgSalary: 'ETB 24,200',
    topSector: 'Software & Fintech',
    spark: [66, 69, 72, 76, 82, 88],
    employmentTimeline: [
      { year: '2020', rate: 66 },
      { year: '2021', rate: 69 },
      { year: '2022', rate: 73 },
      { year: '2023', rate: 80 },
      { year: '2024', rate: 88 },
    ],
    topEmployers: [
      { name: 'Safaricom', hires: 28 },
      { name: 'Ethio Telecom', hires: 22 },
      { name: 'CBE', hires: 18 },
      { name: 'Huawei', hires: 15 },
    ],
    gaps: ['System Design', 'AI Integration', 'API Security'],
    alumni: [
      { name: 'Yonas Bekele', batch: '2018', employer: 'Safaricom', status: 'Active' },
      { name: 'Ruth Alemu', batch: '2019', employer: 'CBE', status: 'Active' },
      { name: 'Henok Fikre', batch: '2020', employer: 'Ethio Telecom', status: 'Pending' },
    ],
  },
  {
    id: 'electrical-engineering',
    name: 'Electrical Engineering',
    college: 'College of Engineering',
    head: 'Prof. Lidia Bekele',
    totalGraduates: 681,
    employmentRate: 80.7,
    activeAlumni: 491,
    avgSalary: 'ETB 20,700',
    topSector: 'Energy & Manufacturing',
    spark: [60, 63, 65, 68, 72, 81],
    employmentTimeline: [
      { year: '2020', rate: 60 },
      { year: '2021', rate: 63 },
      { year: '2022', rate: 66 },
      { year: '2023', rate: 72 },
      { year: '2024', rate: 81 },
    ],
    topEmployers: [
      { name: 'Ethiopian Electric Utility', hires: 25 },
      { name: 'Ethio Telecom', hires: 20 },
      { name: 'Huawei', hires: 18 },
      { name: 'Ethiopian Airlines', hires: 14 },
    ],
    gaps: ['Power Electronics', 'PLC Programming', 'Industrial Automation'],
    alumni: [
      { name: 'Nati Dinku', batch: '2019', employer: 'Huawei', status: 'Active' },
      { name: 'Saba Mulu', batch: '2020', employer: 'EEU', status: 'Active' },
      { name: 'Rahel Mekonnen', batch: '2021', employer: 'Ethiopian Airlines', status: 'Inactive' },
    ],
  },
];

const defaultForm: DepartmentForm = {
  name: '',
  college: collegePool[0],
  head: userSearchPool[0],
  description: '',
};

function sparkColor(rate: number) {
  if (rate >= 85) return '#1D9E75';
  if (rate >= 75) return '#003580';
  if (rate >= 65) return '#E8A020';
  return '#E24B4A';
}

function statusBadge(status: DepartmentRecord['alumni'][number]['status']) {
  switch (status) {
    case 'Active':
      return <AdminBadge variant="success">Active</AdminBadge>;
    case 'Pending':
      return <AdminBadge variant="warning">Pending</AdminBadge>;
    case 'Inactive':
      return <AdminBadge variant="neutral">Inactive</AdminBadge>;
    default:
      return <AdminBadge variant="neutral">{status}</AdminBadge>;
  }
}

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; hint: string }) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003580]/10 text-[#003580]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default function DepartmentManagement() {
  const navigate = useNavigate();
  const params = useParams();
  const [query, setQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [form, setForm] = useState<DepartmentForm>(defaultForm);
  const [selectedAlumniStatus, setSelectedAlumniStatus] = useState<'All' | 'Active' | 'Pending' | 'Inactive'>('All');

  const selectedDepartment = useMemo(() => {
    if (!params.id) return departmentRecords[0];
    return departmentRecords.find((department) => department.id === params.id) ?? departmentRecords[0];
  }, [params.id]);

  const filteredDepartments = useMemo(() => {
    return departmentRecords.filter((department) => {
      const matchesQuery = !query || [department.name, department.college, department.head].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesCollege = collegeFilter === 'All' || department.college === collegeFilter;
      return matchesQuery && matchesCollege;
    });
  }, [query, collegeFilter]);

  const alumniList = useMemo(() => {
    return selectedDepartment.alumni.filter((alumni) => selectedAlumniStatus === 'All' || alumni.status === selectedAlumniStatus);
  }, [selectedDepartment, selectedAlumniStatus]);

  const openAddModal = () => {
    setEditingDepartmentId(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEditModal = (department: DepartmentRecord) => {
    setEditingDepartmentId(department.id);
    setForm({
      name: department.name,
      college: department.college,
      head: department.head,
      description: `${department.name} department administration workspace.`,
    });
    setModalOpen(true);
  };

  const detailOpen = Boolean(params.id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Department Management"
        subtitle="Configure department-level reporting and settings."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Department Management' }]}
        actions={
          <>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Add Department
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#003580]/20 px-4 py-2.5 text-sm font-semibold text-[#003580] hover:bg-[#003580]/5"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </>
        }
      />

      <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="grid gap-3 xl:grid-cols-12">
          <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search departments, colleges, or heads..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={collegeFilter}
              onChange={(event) => setCollegeFilter(event.target.value)}
              className="w-full bg-transparent outline-none"
            >
              <option value="All">All Colleges</option>
              {collegePool.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => navigate('/admin/departments')}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 xl:col-span-2"
          >
            <Sparkles className="h-4 w-4" />
            Clear Detail
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white xl:col-span-2 hover:brightness-110"
          >
            <Building2 className="h-4 w-4" />
            Sync Colleges
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Departments" value={`${filteredDepartments.length}`} icon={Building2} hint="Across all colleges and reporting groups" />
        <StatCard label="Total Graduates" value="2,087" icon={Users} hint="Combined across the selected department set" />
        <StatCard label="Average Employment" value="85.3%" icon={ChevronRight} hint="Average employment rate for the visible departments" />
        <StatCard label="Active Alumni" value="1,724" icon={MapPin} hint="Verified alumni currently in the network" />
      </section>

      <div className={`grid gap-4 ${detailOpen ? 'xl:grid-cols-[minmax(0,1fr)_420px]' : 'xl:grid-cols-1'}`}>
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDepartments.map((department) => {
              const lastRate = department.spark[department.spark.length - 1];
              return (
                <article
                  key={department.id}
                  className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{department.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{department.college}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditModal(department)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div>
                      <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Head</span>
                      <span className="font-medium text-slate-700">{department.head}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Total Graduates</span>
                        <span className="font-semibold text-slate-900">{department.totalGraduates}</span>
                      </div>
                      <div>
                        <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Active Alumni</span>
                        <span className="font-semibold text-slate-900">{department.activeAlumni}</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-3 pt-2">
                      <div>
                        <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Employment Rate</span>
                        <span className="text-2xl font-semibold text-slate-900">{department.employmentRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-12">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={department.spark.map((value, index) => ({ index, value }))}>
                              <Line type="monotone" dataKey="value" stroke={sparkColor(lastRate)} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/departments/${department.id}`)}
                      className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                    >
                      View Details
                    </button>
                    <AdminBadge variant="neutral">{department.topSector}</AdminBadge>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {detailOpen && (
          <aside className="xl:sticky xl:top-24 h-fit rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{selectedDepartment.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{selectedDepartment.college}</p>
                <p className="mt-1 text-sm text-slate-600">Head: {selectedDepartment.head}</p>
              </div>
              <button type="button" onClick={() => navigate('/admin/departments')} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Total Graduates" value={selectedDepartment.totalGraduates.toLocaleString()} />
              <MiniStat label="Employed %" value={`${selectedDepartment.employmentRate.toFixed(1)}%`} />
              <MiniStat label="Avg Salary" value={selectedDepartment.avgSalary} />
              <MiniStat label="Top Sector" value={selectedDepartment.topSector} />
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-900">Employment Rate by Year</h3>
              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedDepartment.employmentTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                    <XAxis dataKey="year" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#003580" strokeWidth={3} dot={{ r: 4, fill: '#003580' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-900">Top Employers</h3>
              <div className="mt-3 overflow-hidden rounded-[10px] border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Employer</th>
                      <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Hires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDepartment.topEmployers.map((employer) => (
                      <tr key={employer.name} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-slate-700">{employer.name}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{employer.hires}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-900">Curriculum Gaps</h3>
              <div className="mt-3 space-y-2">
                {selectedDepartment.gaps.map((gap) => (
                  <div key={gap} className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {gap}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">Alumni List</h3>
                <select
                  value={selectedAlumniStatus}
                  onChange={(event) => setSelectedAlumniStatus(event.target.value as typeof selectedAlumniStatus)}
                  className="rounded-[8px] border border-slate-200 px-3 py-2 text-xs outline-none"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mt-3 space-y-2">
                {alumniList.map((alumni) => (
                  <div key={`${alumni.name}-${alumni.batch}`} className="rounded-[8px] border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{alumni.name}</div>
                        <div className="text-xs text-slate-500">
                          Batch {alumni.batch} · {alumni.employer}
                        </div>
                      </div>
                      {statusBadge(alumni.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      <AdminModal
        open={modalOpen}
        title={editingDepartmentId ? 'Edit Department' : 'Add Department'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Save Department
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
            />
          </Field>
          <Field label="College">
            <select
              value={form.college}
              onChange={(event) => setForm((current) => ({ ...current, college: event.target.value }))}
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
            >
              {collegePool.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Department Head">
            <input
              list="head-search"
              value={form.head}
              onChange={(event) => setForm((current) => ({ ...current, head: event.target.value }))}
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
            />
            <datalist id="head-search">
              {userSearchPool.map((user) => (
                <option key={user} value={user} />
              ))}
            </datalist>
          </Field>
          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
            />
          </Field>
        </div>
      </AdminModal>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
