import React, { useMemo, useState, useEffect } from 'react';
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
  GraduationCap,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import { adminApi, departmentsService } from '../api/adminApi';

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

function StatCard({ label, value, icon: Icon, hint, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; hint: string; color?: string }) {
  const iconColor = color || '#003580';
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,51,128,0.15)] hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow" style={{ background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}25 100%)`, color: iconColor }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default function DepartmentManagement() {
  const navigate = useNavigate();
  const params = useParams();
  const [departmentRecords, setDepartmentRecords] = useState<DepartmentRecord[]>([]);
  const [departmentPool, setDepartmentPool] = useState<string[]>([]);
  const [collegePool, setCollegePool] = useState<string[]>([]);
  const [userSearchPool, setUserSearchPool] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [form, setForm] = useState<DepartmentForm>({ name: '', college: '', head: '', description: '' });
  const [selectedAlumniStatus, setSelectedAlumniStatus] = useState<'All' | 'Active' | 'Pending' | 'Inactive'>('All');
  const [selectedDeptAlumni, setSelectedDeptAlumni] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDepartmentData() {
      try {
        setLoading(true);
        setError(null);
        // Call backend departments list using departmentsService
        const departmentsData = await departmentsService.getDepartments();
        
        const transformed: DepartmentRecord[] = (departmentsData || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          college: d.college,
          head: d.head,
          totalGraduates: d.totalGraduates || 0,
          employmentRate: d.employmentRate || 0,
          activeAlumni: d.activeAlumni || 0,
          avgSalary: d.avgSalary ? `${d.avgSalary} ETB` : 'N/A',
          topSector: d.topSector || 'N/A',
          spark: d.spark || [d.employmentRate || 75],
          employmentTimeline: d.employmentTimeline || [
            { year: '2022', rate: Math.max(0, (d.employmentRate || 80) - 5) },
            { year: '2023', rate: Math.max(0, (d.employmentRate || 80) - 2) },
            { year: '2024', rate: d.employmentRate || 80 }
          ],
          topEmployers: d.topEmployers || [],
          gaps: d.gaps || [],
          alumni: []
        }));

        setDepartmentRecords(transformed);
        
        // Dynamically compute filters
        const depts = Array.from(new Set(transformed.map((d) => d.name)));
        const colleges = Array.from(new Set(transformed.map((d) => d.college)));
        const heads = Array.from(new Set(transformed.map((d) => d.head)));

        setDepartmentPool(depts);
        setCollegePool(colleges);
        setUserSearchPool(heads);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load department data');
      } finally {
        setLoading(false);
      }
    }
    fetchDepartmentData();
  }, []);

  // Fetch alumni dynamically when department is selected
  useEffect(() => {
    if (params.id) {
      async function fetchAlumni() {
        try {
          const alumniData = await departmentsService.getDepartmentAlumni(params.id!);
          setSelectedDeptAlumni(alumniData || []);
        } catch (err) {
          console.error('Failed to load department alumni:', err);
          setSelectedDeptAlumni([]);
        }
      }
      fetchAlumni();
    } else {
      setSelectedDeptAlumni([]);
    }
  }, [params.id]);

  const defaultForm: DepartmentForm = {
    name: '',
    college: collegePool[0] || '',
    head: userSearchPool[0] || '',
    description: '',
  };

  const selectedDepartment = useMemo(() => {
    if (!params.id || departmentRecords.length === 0) return departmentRecords[0];
    return departmentRecords.find((department) => department.id === params.id) ?? departmentRecords[0];
  }, [params.id, departmentRecords]);

  const filteredDepartments = useMemo(() => {
    return departmentRecords.filter((department) => {
      const matchesQuery = !query || [department.name, department.college, department.head].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesCollege = collegeFilter === 'All' || department.college === collegeFilter;
      return matchesQuery && matchesCollege;
    });
  }, [query, collegeFilter]);

  const alumniList = useMemo(() => {
    return selectedDeptAlumni.filter((alumni) => selectedAlumniStatus === 'All' || alumni.status === selectedAlumniStatus);
  }, [selectedDeptAlumni, selectedAlumniStatus]);

  // Compute stats dynamically
  const totalGrads = useMemo(() => filteredDepartments.reduce((sum, d) => sum + d.totalGraduates, 0), [filteredDepartments]);
  const avgEmployment = useMemo(() => {
    if (filteredDepartments.length === 0) return 0;
    const sum = filteredDepartments.reduce((acc, d) => acc + d.employmentRate, 0);
    return sum / filteredDepartments.length;
  }, [filteredDepartments]);
  const totalActiveAlumni = useMemo(() => filteredDepartments.reduce((sum, d) => sum + d.activeAlumni, 0), [filteredDepartments]);

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
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 8px 30px rgba(0,53,128,0.35)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.10), transparent)' }} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.15)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                <GraduationCap className="h-5 w-5" style={{ color: '#E8A020' }} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>Department Management</h1>
                <p className="mt-0.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  Configure department-level reporting and settings.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', color: '#ffffff', backdropFilter: 'blur(8px)' }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Department
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', color: '#ffffff', backdropFilter: 'blur(8px)' }}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid gap-4 xl:grid-cols-12">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-5 hover:border-slate-300 transition-all">
            <Search className="h-4.5 w-4.5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search departments, colleges, or heads..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-3 hover:border-slate-300 transition-all">
            <Filter className="h-4.5 w-4.5 text-slate-400" />
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
            className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-5 py-3 text-sm font-semibold text-slate-600 xl:col-span-2 hover:border-slate-300 transition-all"
          >
            <Sparkles className="h-4.5 w-4.5" />
            Clear Detail
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105 xl:col-span-2"
            style={{ color: '#ffffff' }}
          >
            <Building2 className="h-4.5 w-4.5" />
            Sync Colleges
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Departments" value={`${filteredDepartments.length}`} icon={Building2} hint="Across all colleges and reporting groups" color="#003580" />
        <StatCard label="Total Graduates" value={totalGrads.toLocaleString()} icon={Users} hint="Combined across the selected department set" color="#1D9E75" />
        <StatCard label="Average Employment" value={`${avgEmployment.toFixed(1)}%`} icon={ChevronRight} hint="Average employment rate for the visible departments" color="#E8A020" />
        <StatCard label="Active Alumni" value={totalActiveAlumni.toLocaleString()} icon={MapPin} hint="Verified alumni currently in the network" color="#7C3AED" />
      </section>

      <div className={`grid gap-8 ${detailOpen ? 'xl:grid-cols-[minmax(0,1fr)_420px]' : 'xl:grid-cols-1'}`}>
        <section className="space-y-8">
          {filteredDepartments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <Building2 className="h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900">No departments found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {query || collegeFilter !== 'All' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Get started by adding a new department.'}
              </p>
              {!(query || collegeFilter !== 'All') && (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-4 py-2 text-sm font-semibold shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105"
                  style={{ color: '#ffffff' }}
                >
                  <Plus className="h-4 w-4" /> Add Department
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredDepartments.map((department) => {
                const lastRate = department.spark[department.spark.length - 1];
                return (
                  <article
                    key={department.id}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{department.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{department.college}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditModal(department)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/40 hover:bg-[#003580]/5 hover:text-[#003580]"
                      >
                        <PencilLine className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="mt-5 space-y-3 text-sm text-slate-600">
                      <div>
                        <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Head</span>
                        <span className="font-medium text-slate-700">{department.head}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Total Graduates</span>
                          <span className="font-semibold text-slate-900">{department.totalGraduates}</span>
                        </div>
                        <div>
                          <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Active Alumni</span>
                          <span className="font-semibold text-slate-900">{department.activeAlumni}</span>
                        </div>
                      </div>
                      <div className="flex items-end justify-between gap-4 pt-3">
                        <div>
                          <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Employment Rate</span>
                          <span className="text-2xl font-bold text-slate-900">{department.employmentRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-14">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={department.spark.map((value, index) => ({ index, value }))}>
                                <Line type="monotone" dataKey="value" stroke={sparkColor(lastRate)} strokeWidth={2.5} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/departments/${department.id}`)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105"
                        style={{ color: '#ffffff' }}
                      >
                        View Details
                      </button>
                      <AdminBadge variant="neutral">{department.topSector}</AdminBadge>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {detailOpen && (
          <aside className="xl:sticky xl:top-24 h-fit rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedDepartment.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedDepartment.college}</p>
                <p className="mt-1 text-sm text-slate-600">Head: {selectedDepartment.head}</p>
              </div>
              <button type="button" onClick={() => navigate('/admin/departments')} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <MiniStat label="Total Graduates" value={selectedDepartment.totalGraduates.toLocaleString()} />
              <MiniStat label="Employed %" value={`${selectedDepartment.employmentRate.toFixed(1)}%`} />
              <MiniStat label="Avg Salary" value={selectedDepartment.avgSalary} />
              <MiniStat label="Top Sector" value={selectedDepartment.topSector} />
            </div>

            <div className="mt-6">
              <h3 className="text-base font-bold text-slate-900">Employment Rate by Year</h3>
              <div className="mt-4 h-56">
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

            <div className="mt-6">
              <h3 className="text-base font-bold text-slate-900">Top Employers</h3>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Employer</th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Hires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDepartment.topEmployers.map((employer) => (
                      <tr key={employer.name} className="border-t border-slate-100 hover:bg-slate-50/80 transition-all">
                        <td className="px-5 py-3 text-slate-700">{employer.name}</td>
                        <td className="px-5 py-3 text-right text-slate-600">{employer.hires}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-base font-bold text-slate-900">Curriculum Gaps</h3>
              <div className="mt-4 space-y-3">
                {selectedDepartment.gaps.map((gap) => (
                  <div key={gap} className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                    {gap}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-bold text-slate-900">Alumni List</h3>
                <select
                  value={selectedAlumniStatus}
                  onChange={(event) => setSelectedAlumniStatus(event.target.value as typeof selectedAlumniStatus)}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-xs outline-none hover:border-slate-300 transition-all"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mt-4 space-y-3">
                {alumniList.map((alumni) => (
                  <div key={`${alumni.name}-${alumni.batch}`} className="rounded-xl border border-slate-200/80 p-4 hover:border-slate-300 transition-all">
                    <div className="flex items-start justify-between gap-4">
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
              className="rounded-xl border border-slate-200/80 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105"
              style={{ color: '#ffffff' }}
            >
              Save Department
            </button>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
            />
          </Field>
          <Field label="College">
            <select
              value={form.college}
              onChange={(event) => setForm((current) => ({ ...current, college: event.target.value }))}
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
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
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
            />
            <datalist id="head-search">
              {userSearchPool.map((user) => (
                <option key={user} value={user} />
              ))}
            </datalist>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all"
              />
            </Field>
          </div>
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
    <label className="space-y-2.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
