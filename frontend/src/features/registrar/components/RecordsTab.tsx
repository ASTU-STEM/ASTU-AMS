import React, { useState, useMemo } from 'react';
import { GraduateRecord } from '../types/registrar.types';
import toast from 'react-hot-toast';

interface RecordsTabProps {
  graduates: GraduateRecord[];
  onAddGraduate: (newGrad: Omit<GraduateRecord, 'id' | 'identityVerified' | 'status'>) => void;
  onEditGraduate: (updatedGrad: GraduateRecord) => void;
  onArchiveGraduate: (id: number) => void;
  onVerifyIdentity: (id: number) => void;
}

export const RecordsTab: React.FC<RecordsTabProps> = ({
  graduates,
  onAddGraduate,
  onEditGraduate,
  onArchiveGraduate,
  onVerifyIdentity
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingGrad, setEditingGrad] = useState<GraduateRecord | null>(null);

  // Advanced Professional Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cgpaRangeFilter, setCgpaRangeFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    phone: '',
    nationality: 'Ethiopian',
    dateOfBirth: '',
    department: 'Computer Science and Engineering',
    graduationYear: '2024',
    cgpa: ''
  });

  const departments = useMemo(() => {
    const deps = new Set(graduates.map(g => g.department));
    return ['All', ...Array.from(deps)];
  }, [graduates]);

  const graduationBatches = useMemo(() => {
    const currentYr = new Date().getFullYear();
    const set = new Set<string>();

    // Generate 10+ years into the future (up to 2036) down to 25+ years in the past (down to 2000)
    for (let y = currentYr + 10; y >= 2000; y--) {
      set.add(String(y));
    }

    // Include any extra years present in live database records
    graduates.forEach(g => {
      if (g.graduationYear) set.add(String(g.graduationYear));
    });

    const sortedYears = Array.from(set).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
    return ['All', ...sortedYears];
  }, [graduates]);

  // Professional Multi-Dimensional Filter Logic
  const filteredGraduates = useMemo(() => {
    return graduates.filter(g => {
      // 1. Search Filter
      const matchesSearch = !searchQuery || 
        `${g.studentId} ${g.fullName} ${g.email} ${g.department}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Department Filter
      const matchesDept = departmentFilter === 'All' || g.department === departmentFilter;

      // 3. Graduation Batch / Year Filter
      const matchesBatch = batchFilter === 'All' || String(g.graduationYear) === batchFilter;

      // 4. Verification Identity Filter
      const matchesVerification = verificationFilter === 'All' || 
        (verificationFilter === 'Verified' && g.identityVerified) ||
        (verificationFilter === 'Unverified' && !g.identityVerified);

      // 5. Account Status Filter
      const matchesStatus = statusFilter === 'All' || 
        (statusFilter === 'Active' && (g.status === 'Active' || (g.status as string) === 'ACTIVE')) ||
        (statusFilter === 'Inactive' && ((g.status as string) === 'Inactive' || (g.status as string) === 'INACTIVE')) ||
        (statusFilter === 'Archived' && g.status === 'Archived');

      // 6. CGPA Range Filter
      const cgpaVal = parseFloat(g.cgpa) || 0;
      const matchesCgpa = cgpaRangeFilter === 'All' ||
        (cgpaRangeFilter === '3.5+' && cgpaVal >= 3.5) ||
        (cgpaRangeFilter === '3.0-3.49' && cgpaVal >= 3.0 && cgpaVal < 3.5) ||
        (cgpaRangeFilter === '<3.0' && cgpaVal < 3.0);

      return matchesSearch && matchesDept && matchesBatch && matchesVerification && matchesStatus && matchesCgpa;
    });
  }, [graduates, searchQuery, departmentFilter, batchFilter, verificationFilter, statusFilter, cgpaRangeFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, batchFilter, verificationFilter, statusFilter, cgpaRangeFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (departmentFilter !== 'All') count++;
    if (batchFilter !== 'All') count++;
    if (verificationFilter !== 'All') count++;
    if (statusFilter !== 'All') count++;
    if (cgpaRangeFilter !== 'All') count++;
    return count;
  }, [searchQuery, departmentFilter, batchFilter, verificationFilter, statusFilter, cgpaRangeFilter]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('All');
    setBatchFilter('All');
    setVerificationFilter('All');
    setStatusFilter('All');
    setCgpaRangeFilter('All');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredGraduates.length / pageSize) || 1;
  const paginatedGraduates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGraduates.slice(start, start + pageSize);
  }, [filteredGraduates, currentPage, pageSize]);

  const stats = useMemo(() => ({
    total: graduates.length,
    verified: graduates.filter(g => g.identityVerified).length,
    unverified: graduates.filter(g => !g.identityVerified).length,
    active: graduates.filter(g => g.status === 'Active').length,
    archived: graduates.filter(g => g.status === 'Archived').length,
    deptBreakdown: departments.filter(d => d !== 'All').map(d => ({
      name: d,
      count: graduates.filter(g => g.department === d).length,
      avgCgpa: (graduates.filter(g => g.department === d).reduce((sum, g) => sum + parseFloat(g.cgpa), 0) / 
        (graduates.filter(g => g.department === d).length || 1)).toFixed(2)
    }))
  }), [graduates, departments]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.fullName || !formData.email || !formData.cgpa) {
      toast.error('Please fill out all graduate fields.');
      return;
    }

    onAddGraduate({
      studentId: formData.studentId,
      fullName: formData.fullName,
      email: formData.email,
      department: formData.department,
      graduationYear: formData.graduationYear,
      cgpa: formData.cgpa
    });

    setIsAdding(false);
    setFormData({
      studentId: '',
      fullName: '',
      email: '',
      phone: '',
      nationality: 'Ethiopian',
      dateOfBirth: '',
      department: 'Computer Science and Engineering',
      graduationYear: '2024',
      cgpa: ''
    });
    toast.success('Graduate profile added to SIS database!');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGrad) {
      onEditGraduate(editingGrad);
      setEditingGrad(null);
      toast.success('Graduate profile saved successfully.');
    }
  };

  const handleBulkArchive = () => {
    if (selectedRecords.length === 0) {
      toast.error('No records selected.');
      return;
    }
    selectedRecords.forEach(id => onArchiveGraduate(id));
    toast.success(`Archived ${selectedRecords.length} records.`);
    setSelectedRecords([]);
  };

  const handleBulkVerify = () => {
    if (selectedRecords.length === 0) {
      toast.error('No records selected.');
      return;
    }
    selectedRecords.forEach(id => onVerifyIdentity(id));
    toast.success(`Verified ${selectedRecords.length} identities.`);
    setSelectedRecords([]);
  };

  const toggleSelect = (id: number) => {
    setSelectedRecords(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = ['Student ID,Full Name,Email,Department,Graduation Year,CGPA,Verified,Status'];
    const rows = filteredGraduates.map(g =>
      `${g.studentId},"${g.fullName}",${g.email},"${g.department}",${g.graduationYear},${g.cgpa},${g.identityVerified},${g.status}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sis_graduates_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredGraduates.length} records to CSV.`);
  };

  return (
    <div className="space-y-6">

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-astu-navy via-[#002a55] to-emerald-800 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">SIS Integration Layer</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">SIS Graduate Database</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">Central repository for graduate records. Verify identities, manage profiles, import batch data, and maintain accreditation-ready records.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => { setIsAdding(!isAdding); setEditingGrad(null); }} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold hover:bg-white/25 transition-all">
              <span className="material-symbols-outlined text-sm">{isAdding ? 'close' : 'add'}</span>
              {isAdding ? 'Cancel' : 'Add Graduate Record'}
            </button>
            <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all">
              <span className="material-symbols-outlined text-sm">download</span>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Records</p>
          <p className="text-2xl font-extrabold text-astu-navy mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Verified</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.verified}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Unverified</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.unverified}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Active</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Archived</p>
          <p className="text-2xl font-extrabold text-gray-600 mt-1">{stats.archived}</p>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-800">Department Breakdown</h4>
          <span className="text-[10px] text-gray-400 font-medium">{stats.deptBreakdown.length} departments</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.deptBreakdown.map(dept => (
            <div key={dept.name} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs font-bold text-astu-navy">{dept.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-extrabold text-gray-800">{dept.count}</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Avg CGPA: {dept.avgCgpa}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Graduate Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 border border-gray-200/60 rounded-3xl max-w-3xl mx-auto shadow-sm space-y-6">
          <h4 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-navy">person_add</span>
            Add SIS Graduate Profile
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Student ID *</label>
              <input type="text" value={formData.studentId} onChange={e => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20"
                placeholder="e.g. UG/12839/14" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label>
              <input type="text" value={formData.fullName} onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20"
                placeholder="e.g. Abebe Bikila" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20"
                placeholder="e.g. abebe.b@gmail.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
              <input type="text" value={formData.phone || ''} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20"
                placeholder="e.g. +251 911223344" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nationality</label>
              <input type="text" value={formData.nationality || ''} onChange={e => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20"
                placeholder="e.g. Ethiopian" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Date of Birth</label>
              <input type="date" value={formData.dateOfBirth || ''} onChange={e => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Department *</label>
              <select value={formData.department} onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none font-semibold text-gray-700">
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Mechanical and Vehicle Engineering">Mechanical and Vehicle Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Graduation Year *</label>
              <select value={formData.graduationYear} onChange={e => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none font-semibold text-gray-700">
                <option value="2024">Class of 2024</option>
                <option value="2023">Class of 2023</option>
                <option value="2022">Class of 2022</option>
                <option value="2021">Class of 2021</option>
                <option value="2020">Class of 2020</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Final CGPA *</label>
              <input type="text" value={formData.cgpa} onChange={e => setFormData(prev => ({ ...prev, cgpa: e.target.value }))}
                className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20"
                placeholder="e.g. 3.82" required />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-[1.01]">
            Confirm & Save Record
          </button>
        </form>
      )}

      {/* Edit Modal */}
      {editingGrad && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start pb-2 border-b">
              <div>
                <h3 className="text-lg font-bold">Edit SIS Record</h3>
                <p className="text-xs text-gray-500">Edit values for {editingGrad.fullName}</p>
              </div>
              <button type="button" onClick={() => setEditingGrad(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input type="text" value={editingGrad.fullName} onChange={e => setEditingGrad({ ...editingGrad, fullName: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                <input type="email" value={editingGrad.email} onChange={e => setEditingGrad({ ...editingGrad, email: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">CGPA</label>
                <input type="text" value={editingGrad.cgpa} onChange={e => setEditingGrad({ ...editingGrad, cgpa: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Verification Status</label>
                <select value={editingGrad.identityVerified ? 'true' : 'false'}
                  onChange={e => setEditingGrad({ ...editingGrad, identityVerified: e.target.value === 'true' })}
                  className="w-full text-xs p-3 border border-gray-250 bg-gray-50 rounded-xl font-semibold">
                  <option value="true">Identity Verified</option>
                  <option value="false">Unverified Identity</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setEditingGrad(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-astu-navy text-white rounded-xl text-xs font-bold shadow-md hover:bg-astu-navy/90 transition-all">Save Profile Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* Advanced Modern & Sleek Filter Control Bar */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
          
          {/* Modern Search Box */}
          <div className="relative min-w-[280px] flex-grow xl:flex-grow-0">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-sm">search</span>
            <input type="text" placeholder="Search by name, student ID, email..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:outline-none focus:border-astu-navy focus:ring-2 focus:ring-astu-navy/10 w-full transition-all text-slate-800 placeholder-slate-400 shadow-2xs" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-xs">cancel</span>
              </button>
            )}
          </div>

          {/* Sleek Custom Filter Controls Grid */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Batch Filter */}
            <div className="relative inline-flex items-center">
              <span className="absolute left-3 text-slate-400 material-symbols-outlined text-sm pointer-events-none">school</span>
              <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
                className="pl-8 pr-7 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-astu-navy transition-all shadow-2xs">
                {graduationBatches.map(b => (
                  <option key={b} value={b}>{b === 'All' ? 'All Batches' : `Class of ${b}`}</option>
                ))}
              </select>
              <span className="absolute right-2 text-slate-400 material-symbols-outlined text-xs pointer-events-none">keyboard_arrow_down</span>
            </div>

            {/* Department Filter */}
            <div className="relative inline-flex items-center">
              <span className="absolute left-3 text-slate-400 material-symbols-outlined text-sm pointer-events-none">domain</span>
              <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}
                className="pl-8 pr-7 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-astu-navy transition-all shadow-2xs max-w-[170px] truncate">
                {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
              </select>
              <span className="absolute right-2 text-slate-400 material-symbols-outlined text-xs pointer-events-none">keyboard_arrow_down</span>
            </div>

            {/* Verification Status Filter */}
            <div className="relative inline-flex items-center">
              <span className="absolute left-3 text-slate-400 material-symbols-outlined text-sm pointer-events-none">verified</span>
              <select value={verificationFilter} onChange={e => setVerificationFilter(e.target.value)}
                className="pl-8 pr-7 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-astu-navy transition-all shadow-2xs">
                <option value="All">All Identities</option>
                <option value="Verified">Verified Only</option>
                <option value="Unverified">Unverified Only</option>
              </select>
              <span className="absolute right-2 text-slate-400 material-symbols-outlined text-xs pointer-events-none">keyboard_arrow_down</span>
            </div>

            {/* CGPA Range Filter */}
            <div className="relative inline-flex items-center">
              <span className="absolute left-3 text-slate-400 material-symbols-outlined text-sm pointer-events-none">grade</span>
              <select value={cgpaRangeFilter} onChange={e => setCgpaRangeFilter(e.target.value)}
                className="pl-8 pr-7 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-astu-navy transition-all shadow-2xs">
                <option value="All">All CGPA</option>
                <option value="3.5+">3.50+ Distinction</option>
                <option value="3.0-3.49">3.00 – 3.49</option>
                <option value="<3.0">&lt; 3.00 Standard</option>
              </select>
              <span className="absolute right-2 text-slate-400 material-symbols-outlined text-xs pointer-events-none">keyboard_arrow_down</span>
            </div>

            {/* Account Status Filter */}
            <div className="relative inline-flex items-center">
              <span className="absolute left-3 text-slate-400 material-symbols-outlined text-sm pointer-events-none">account_circle</span>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="pl-8 pr-7 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-astu-navy transition-all shadow-2xs">
                <option value="All">All Statuses</option>
                <option value="Active">Active Accounts</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
              <span className="absolute right-2 text-slate-400 material-symbols-outlined text-xs pointer-events-none">keyboard_arrow_down</span>
            </div>

            {/* Clear Filters Reset Button */}
            {activeFilterCount > 0 && (
              <button onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 border border-rose-200/80 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100/80 transition-all shadow-2xs">
                <span className="material-symbols-outlined text-xs">restart_alt</span>
                Reset ({activeFilterCount})
              </button>
            )}

          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedRecords.length > 0 && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-astu-navy">{selectedRecords.length} records selected</span>
            <button onClick={handleBulkVerify} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span> Verify Selected
            </button>
            <button onClick={handleBulkArchive} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">archive</span> Archive Selected
            </button>
          </div>
        )}
      </div>

      {/* Database Table with Dynamic Pagination */}
      <div className="bg-white border border-gray-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-3 w-8">
                  <input type="checkbox" onChange={e => {
                    if (e.target.checked) setSelectedRecords(paginatedGraduates.map(g => g.id));
                    else setSelectedRecords([]);
                  }} checked={selectedRecords.length > 0 && selectedRecords.length === paginatedGraduates.length}
                    className="rounded border-gray-300 cursor-pointer" />
                </th>
                <th className="p-3">Student ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Batch / Year</th>
                <th className="p-3">CGPA</th>
                <th className="p-3">Verification</th>
                <th className="p-3">Account</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedGraduates.map((grad) => (
                <tr key={grad.id} className={`hover:bg-gray-50/70 transition-colors ${selectedRecords.includes(grad.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="p-3">
                    <input type="checkbox" checked={selectedRecords.includes(grad.id)} onChange={() => toggleSelect(grad.id)}
                      className="rounded border-gray-300 cursor-pointer" />
                  </td>
                  <td className="p-3 font-mono font-bold text-gray-800">{grad.studentId}</td>
                  <td className="p-3">
                    <p className="font-bold text-gray-900">{grad.fullName}</p>
                    <p className="text-[10px] text-gray-500">{grad.email}</p>
                  </td>
                  <td className="p-3 text-xs font-semibold text-astu-navy">{grad.department}</td>
                  <td className="p-3 font-semibold text-gray-700">{grad.graduationYear}</td>
                  <td className="p-3 font-bold text-emerald-600">{grad.cgpa}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      grad.identityVerified ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {grad.identityVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      grad.status === 'Active' || (grad.status as string) === 'ACTIVE' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {grad.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      {!grad.identityVerified && (
                        <button onClick={() => onVerifyIdentity(grad.id)}
                          className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg text-[10px] font-bold hover:bg-green-100 transition-all"
                          title="Verify Identity">
                          <span className="material-symbols-outlined text-xs">verified</span>
                        </button>
                      )}
                      <button onClick={() => setEditingGrad(grad)}
                        className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-all"
                        title="Edit Record">
                        <span className="material-symbols-outlined text-xs">edit</span>
                      </button>
                      {grad.status === 'Active' && (
                        <button onClick={() => onArchiveGraduate(grad.id)}
                          className="px-2 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all"
                          title="Archive Record">
                          <span className="material-symbols-outlined text-xs">archive</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredGraduates.length === 0 && (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
            <p className="mt-2 text-sm text-gray-500 font-semibold">No records match your selected filters.</p>
            <button onClick={resetAllFilters} className="mt-3 px-4 py-1.5 bg-astu-navy text-white rounded-xl text-xs font-bold shadow-xs hover:bg-astu-navy/90 transition-all">
              Reset Filters
            </button>
          </div>
        )}
        
        {/* Dynamic Pagination Footer */}
        <div className="border-t border-gray-100 px-4 py-3 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-2">
          <span className="text-[11px] text-gray-500 font-medium">
            Showing {filteredGraduates.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} – {Math.min(currentPage * pageSize, filteredGraduates.length)} of {filteredGraduates.length} filtered ({graduates.length} total)
          </span>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-gray-200 rounded-lg text-xs font-bold bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all">
              Previous
            </button>
            <span className="text-xs font-bold text-gray-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-gray-200 rounded-lg text-xs font-bold bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all">
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
