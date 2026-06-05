import React, { useState, useMemo } from 'react';
import { VerificationRequest } from '../types/registrar.types';
import toast from 'react-hot-toast';

interface VerificationTabProps {
  verifications: VerificationRequest[];
  onVerify: (id: number, status: 'Approved' | 'Rejected') => void;
}

export const VerificationTab: React.FC<VerificationTabProps> = ({ verifications, onVerify }) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVerifications = useMemo(() => {
    return verifications.filter(v => {
      const matchesFilter = filterTab === 'All' || v.status === filterTab;
      const matchesSearch = !searchQuery ||
        `${v.studentId} ${v.fullName} ${v.email} ${v.department} ${v.type}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [verifications, filterTab, searchQuery]);

  const stats = useMemo(() => ({
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'Pending').length,
    approved: verifications.filter(v => v.status === 'Approved').length,
    rejected: verifications.filter(v => v.status === 'Rejected').length,
  }), [verifications]);

  const handleAction = (id: number, status: 'Approved' | 'Rejected', name: string) => {
    onVerify(id, status);
    toast.success(`Registration request for ${name} marked as ${status}.`);
  };

  const handleBulkAction = (status: 'Approved' | 'Rejected') => {
    const pending = verifications.filter(v => v.status === 'Pending');
    if (pending.length === 0) {
      toast.error('No pending verifications to process.');
      return;
    }
    pending.forEach(v => onVerify(v.id, status));
    toast.success(`${status} ${pending.length} verification requests.`);
  };

  return (
    <div className="space-y-6">

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-astu-navy via-[#002a55] to-emerald-800 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">Alumni Verification Center</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Registration Verifications</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">Cross-reference alumni registration requests against official graduation logs. Approve or reject identity verification requests.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => handleBulkAction('Approved')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all">
              <span className="material-symbols-outlined text-sm">done_all</span>
              Approve All Pending
            </button>
            <button onClick={() => handleBulkAction('Rejected')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-all">
              <span className="material-symbols-outlined text-sm">block</span>
              Reject All Pending
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Requests</p>
          <p className="text-2xl font-extrabold text-astu-navy mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterTab('Pending')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterTab('Approved')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Approved</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer" onClick={() => setFilterTab('Rejected')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Rejected</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(tab => (
            <button key={tab} onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterTab === tab
                  ? 'bg-astu-navy text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-astu-navy/30 hover:text-astu-navy'
              }`}>
              {tab} {tab === 'All' ? `(${stats.total})` : tab === 'Pending' ? `(${stats.pending})` : tab === 'Approved' ? `(${stats.approved})` : `(${stats.rejected})`}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-sm">search</span>
          <input type="text" placeholder="Search verifications..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-astu-navy focus:ring-1 focus:ring-astu-navy/20 w-56" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-3">Student ID</th>
                <th className="p-3">Candidate Details</th>
                <th className="p-3">Department</th>
                <th className="p-3">Request Type</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVerifications.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-gray-800">{req.studentId}</td>
                  <td className="p-3">
                    <p className="font-bold text-gray-900">{req.fullName}</p>
                    <p className="text-[10px] text-gray-500">{req.email}</p>
                  </td>
                  <td className="p-3 text-xs font-semibold text-astu-navy">{req.department} • Class of {req.graduationYear}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                      req.type === 'Alumni Registration' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {req.type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{req.requestDate}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => handleAction(req.id, 'Approved', req.fullName)}
                          className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-all flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          Approve
                        </button>
                        <button onClick={() => handleAction(req.id, 'Rejected', req.fullName)}
                          className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">cancel</span>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        req.status === 'Approved' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                      }`}>
                        {req.status === 'Approved' ? 'Completed' : 'Declined'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredVerifications.length === 0 && (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300">verified_user</span>
            <p className="mt-2 text-sm text-gray-400">No verification requests match your criteria.</p>
          </div>
        )}
        <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50">
          <span className="text-[11px] text-gray-500 font-medium">
            Showing {filteredVerifications.length} of {verifications.length} requests
          </span>
          <span className="text-[10px] text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

    </div>
  );
};
