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
import { adminService } from '../services/admin.service';

type DepartmentRecord = {
  id: string;
  name: string;
  code: string;
  alumniCount: number;
  createdAt: string;
};

type DepartmentForm = {
  name: string;
  code: string;
};

const defaultForm: DepartmentForm = {
  name: '',
  code: '',
};

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [form, setForm] = useState<DepartmentForm>(defaultForm);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setIsLoading(true);
    const res = await adminService.getDepartments();
    if (res.ok) {
      setDepartments(res.data as DepartmentRecord[]);
    }
    setIsLoading(false);
  };

  const selectedDepartment = useMemo(() => {
    if (!params.id || departments.length === 0) return departments[0];
    return departments.find((department) => department.id === params.id) ?? departments[0];
  }, [params.id, departments]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      return !query || [department.name, department.code].join(' ').toLowerCase().includes(query.toLowerCase());
    });
  }, [query, departments]);

  const openAddModal = () => {
    setEditingDepartmentId(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEditModal = (department: DepartmentRecord) => {
    setEditingDepartmentId(department.id);
    setForm({
      name: department.name,
      code: department.code,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (editingDepartmentId) {
      const res = await adminService.updateDepartment(editingDepartmentId, form);
      if (res.ok) {
        setModalOpen(false);
        loadDepartments();
      } else {
        alert(res.message);
      }
    } else {
      const res = await adminService.createDepartment(form);
      if (res.ok) {
        setModalOpen(false);
        loadDepartments();
      } else {
        alert(res.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      const res = await adminService.deleteDepartment(id);
      if (res.ok) {
        loadDepartments();
        if (params.id === id) {
          navigate('/admin/departments');
        }
      } else {
        alert(res.message);
      }
    }
  };

  const detailOpen = Boolean(params.id) && selectedDepartment != null;

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
          <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-8">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search departments or codes..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Departments" value={`${filteredDepartments.length}`} icon={Building2} hint="Currently registered in the system" />
        <StatCard label="Total Alumni" value={`${filteredDepartments.reduce((acc, d) => acc + (d.alumniCount || 0), 0)}`} icon={Users} hint="Combined across all departments" />
        <StatCard label="Active Status" value="Healthy" icon={Sparkles} hint="System operational" />
      </section>

      <div className={`grid gap-4 ${detailOpen ? 'xl:grid-cols-[minmax(0,1fr)_420px]' : 'xl:grid-cols-1'}`}>
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDepartments.map((department) => {
              return (
                <article
                  key={department.id}
                  className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{department.name}</h3>
                      <p className="mt-1 text-xs font-mono text-slate-500">{department.code}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(department)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100"
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(department.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex-1">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Total Alumni</span>
                        <span className="text-2xl font-semibold text-slate-900">{department.alumniCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/departments/${department.id}`)}
                      className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 w-full text-center"
                    >
                      View Details
                    </button>
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
                <p className="mt-1 text-xs font-mono text-slate-500">{selectedDepartment.code}</p>
                <p className="mt-1 text-xs text-slate-400">Added: {new Date(selectedDepartment.createdAt).toLocaleDateString()}</p>
              </div>
              <button type="button" onClick={() => navigate('/admin/departments')} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Total Alumni" value={`${selectedDepartment.alumniCount}`} />
            </div>

            <div className="mt-10 flex items-center justify-center p-8 border border-dashed border-slate-200 rounded-lg">
              <p className="text-sm text-slate-500 text-center">More department analytics and alumni details will appear here as data grows.</p>
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
              onClick={handleSave}
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Save Department
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Department Name">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. Software Engineering"
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
            />
          </Field>
          <Field label="Department Code">
            <input
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              placeholder="e.g. SWE"
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
