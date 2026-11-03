import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  X,
  Filter,
  GraduationCap,
  Briefcase,
  Building2,
  Shield,
  Users,
  LayoutGrid,
  List,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import ImageUploader from '../components/ImageUploader';
import CommunityMemberModal from '../components/CommunityMemberModal';
import communityMembersService, { CommunityMember } from '../services/communityMembers.service';

export default function CommunityMembersManagement() {
  const [members, setMembers] = useState<CommunityMember[]>(() => communityMembersService.getMembers());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'executive' | 'academia' | 'engineering' | 'policy'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [formData, setFormData] = useState<Partial<CommunityMember>>({});

  useEffect(() => {
    let isMounted = true;
    communityMembersService.fetchMembersFromApi().then((apiMembers) => {
      if (isMounted && Array.isArray(apiMembers) && apiMembers.length) {
        setMembers(apiMembers);
      }
    });
    const handleSync = () => setMembers(communityMembersService.getMembers());
    window.addEventListener('astu-cms-community-members-changed', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('astu-cms-community-members-changed', handleSync);
    };
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesCategory = categoryFilter === 'all' || member.category === categoryFilter;
    const matchesSearch =
      !search.trim() ||
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.role.toLowerCase().includes(search.toLowerCase()) ||
      member.org.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('astu_ams_community_members_view_mode') as 'grid' | 'list') || 'grid';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(12);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('astu_ams_community_members_view_mode', mode);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredMembers.length / (typeof pageSize === 'number' ? pageSize : 12)));
  const paginatedMembers = useMemo(() => {
    if (pageSize === 'all') return filteredMembers;
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const exportMembersCsv = () => {
    if (!filteredMembers.length) {
      toast.error('No community members to export');
      return;
    }
    const headers = ['ID', 'Name', 'Category', 'Role', 'Organization', 'Active', 'Badge', 'Bio'];
    const rows = filteredMembers.map((m) => [
      m.id,
      `"${(m.name || '').replace(/"/g, '""')}"`,
      m.category,
      `"${(m.role || '').replace(/"/g, '""')}"`,
      `"${(m.org || '').replace(/"/g, '""')}"`,
      m.active ? 'Active' : 'Inactive',
      `"${(m.badge || '').replace(/"/g, '""')}"`,
      `"${(m.bio || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `astu_community_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredMembers.length} community members to CSV`);
  };

  const handleAdd = () => {
    setFormData({
      category: 'executive',
      active: true,
    });
    setShowAddModal(true);
  };

  const handleEdit = (member: CommunityMember) => {
    setSelectedMember(member);
    setFormData(member);
    setShowEditModal(true);
  };

  const handleView = (member: CommunityMember) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this community member? This cannot be undone.')) {
      const success = communityMembersService.deleteMember(id);
      if (success) {
        setMembers(communityMembersService.getMembers());
        toast.success('Community member deleted successfully');
      } else {
        toast.error('Failed to delete community member');
      }
    }
  };

  const handleSaveAdd = () => {
    if (!formData.name || !formData.role || !formData.org) {
      toast.error('Name, role, and organization are required');
      return;
    }
    const newMember = communityMembersService.addMember(formData as Omit<CommunityMember, 'id'>);
    setMembers(communityMembersService.getMembers());
    setShowAddModal(false);
    setFormData({});
    toast.success('Community member added successfully');
  };

  const handleSaveEdit = () => {
    if (!selectedMember) return;
    if (!formData.name || !formData.role || !formData.org) {
      toast.error('Name, role, and organization are required');
      return;
    }
    communityMembersService.updateMember(selectedMember.id, formData);
    setMembers(communityMembersService.getMembers());
    setShowEditModal(false);
    setSelectedMember(null);
    setFormData({});
    toast.success('Community member updated successfully');
  };

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    executive: Briefcase,
    academia: GraduationCap,
    engineering: Building2,
    policy: Shield,
  };

  const categoryColors: Record<string, string> = {
    executive: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    academia: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    engineering: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    policy: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Community Members"
        subtitle="Manage distinguished alumni profiles featured on the public community page"
        breadcrumbs={[{ label: 'Content Management' }, { label: 'Community Members' }]}
        actions={
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#002855] transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        }
      />

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Members', value: members.length, icon: Users, color: 'text-[#003366] bg-[#003366]/10 dark:text-sky-400 dark:bg-sky-950/40' },
          { label: 'Executive', value: members.filter(m => m.category === 'executive').length, icon: Briefcase, color: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40' },
          { label: 'Academia', value: members.filter(m => m.category === 'academia').length, icon: GraduationCap, color: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40' },
          { label: 'Engineering', value: members.filter(m => m.category === 'engineering').length, icon: Building2, color: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/40' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${metric.color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            </div>
          );
        })}
      </section>

      {/* Filters & View Mode Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'executive', 'academia', 'engineering', 'policy'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#003366] text-white shadow-sm dark:bg-sky-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {categoryFilter === cat && <Filter className="h-3.5 w-3.5" />}
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => handleViewModeChange('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-[#003366] dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Grid View (Cards)"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-[#003366] dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="List View (Table)"
            >
              <List className="h-3.5 w-3.5" />
              <span>List Form</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportMembersCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Presentation: Grid vs List Form */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No community members found matching your filter</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Members Grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedMembers.map((member) => {
            const CategoryIcon = categoryIcons[member.category] || Users;
            return (
              <div
                key={member.id}
                className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={member.image || '/images/default-avatar.png'}
                        alt={member.name}
                        className="h-16 w-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                        }}
                      />
                      {!member.active && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                          <span className="text-[10px] font-bold text-white">INACTIVE</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{member.role}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate">{member.org}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${categoryColors[member.category]}`}>
                      <CategoryIcon className="h-3 w-3" />
                      {member.category}
                    </span>
                    {member.badge && (
                      <AdminBadge variant="info" className="text-[10px]">
                        {member.badge}
                      </AdminBadge>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1">
                  <button
                    onClick={() => handleView(member)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(member)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="inline-flex items-center justify-center rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Members Table (List Form) */
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role & Organization</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Badge</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedMembers.map((member) => {
                const CategoryIcon = categoryIcons[member.category] || Users;
                return (
                  <tr key={member.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.image || '/images/default-avatar.png'}
                          alt={member.name}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                          }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{member.role}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{member.org}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${categoryColors[member.category]}`}>
                        <CategoryIcon className="h-3 w-3" />
                        {member.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {member.badge ? (
                        <AdminBadge variant="info" className="text-[10px]">
                          {member.badge}
                        </AdminBadge>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        member.active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(member)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-sky-400 dark:hover:bg-sky-950/40 cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredMembers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setPageSize(val);
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
            <span>
              {pageSize === 'all'
                ? `Showing all ${filteredMembers.length} members`
                : `Showing ${Math.min((currentPage - 1) * (typeof pageSize === 'number' ? pageSize : 12) + 1, filteredMembers.length)}–${Math.min(currentPage * (typeof pageSize === 'number' ? pageSize : 12), filteredMembers.length)} of ${filteredMembers.length}`}
            </span>
          </div>

          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed text-xs font-semibold"
              >
                <ChevronLeft className="h-3.5 w-3.5 inline mr-1" /> Previous
              </button>
              <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed text-xs font-semibold"
              >
                Next <ChevronRight className="h-3.5 w-3.5 inline ml-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* High-End Member Creation Modal */}
      <CommunityMemberModal
        isOpen={showAddModal}
        mode="add"
        onClose={() => setShowAddModal(false)}
        onSave={(data) => {
          if (!data.name || !data.role || !data.org) {
            toast.error('Name, role, and organization are required');
            return;
          }
          communityMembersService.addMember(data as Omit<CommunityMember, 'id'>);
          setMembers(communityMembersService.getMembers());
          setShowAddModal(false);
          setFormData({});
          toast.success('Community member added successfully');
        }}
        initialData={formData}
      />

      {/* High-End Member Edit Modal */}
      <CommunityMemberModal
        isOpen={showEditModal}
        mode="edit"
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        onSave={(data) => {
          if (!selectedMember) return;
          if (!data.name || !data.role || !data.org) {
            toast.error('Name, role, and organization are required');
            return;
          }
          communityMembersService.updateMember(selectedMember.id, data);
          setMembers(communityMembersService.getMembers());
          setShowEditModal(false);
          setSelectedMember(null);
          setFormData({});
          toast.success('Community member updated successfully');
        }}
        initialData={selectedMember}
      />

      {/* High-End Member View Modal */}
      <CommunityMemberModal
        isOpen={showViewModal}
        mode="view"
        onClose={() => {
          setShowViewModal(false);
          setSelectedMember(null);
        }}
        onSwitchToEdit={() => {
          setShowViewModal(false);
          setShowEditModal(true);
        }}
        initialData={selectedMember}
      />
    </div>
  );
}
