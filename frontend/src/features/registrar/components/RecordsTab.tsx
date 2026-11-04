import React, { useState, useMemo } from 'react';
import { GraduateRecord } from '../../types/registrar.types';
import toast from 'react-hot-toast';
import { UserPlus, ShieldCheck, Edit3, Archive, Trash2, CheckSquare, Square } from 'lucide-react';
import { RecordFilterBar } from './records/RecordFilterBar';
import { RecordModal } from './records/RecordModal';

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
  onVerifyIdentity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GraduateRecord | null>(null);

  const departments = useMemo(() => ['All', ...Array.from(new Set(graduates.map((g) => g.department).filter(Boolean)))], [graduates]);
  const batches = useMemo(() => ['All', ...Array.from(new Set(graduates.map((g) => String(g.graduationYear)).filter(Boolean)))], [graduates]);

  const filteredGraduates = useMemo(() => {
    return graduates.filter((g) => {
      const matchSearch =
        !searchQuery ||
        `${g.studentId} ${g.fullName} ${g.email} ${g.department}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === 'All' || g.department === departmentFilter;
      const matchBatch = batchFilter === 'All' || String(g.graduationYear) === batchFilter;
      const matchVerif =
        verificationFilter === 'All' ||
        (verificationFilter === 'Verified' && g.identityVerified) ||
        (verificationFilter === 'Unverified' && !g.identityVerified);
      return matchSearch && matchDept && matchBatch && matchVerif;
    });
  }, [graduates, searchQuery, departmentFilter, batchFilter, verificationFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredGraduates.length / pageSize));
  const paginatedGraduates = filteredGraduates.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedGraduates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedGraduates.map((g) => g.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => onArchiveGraduate(id));
    toast.success(`Archived ${selectedIds.length} graduate records.`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Student & Alumni Academic Records</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Browse, filter, and maintain university academic records with batch verification and multi-column export.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkArchive}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/50"
            >
              <Archive className="h-4 w-4" /> Archive Selected ({selectedIds.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditingRecord(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-500 transition-colors"
          >
            <UserPlus className="h-4 w-4" /> Add Record
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <RecordFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        departments={departments}
        batchFilter={batchFilter}
        onBatchChange={setBatchFilter}
        batches={batches}
        verificationFilter={verificationFilter}
        onVerificationChange={setVerificationFilter}
      />

      {/* Records Table */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <button type="button" onClick={toggleSelectAll} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    {selectedIds.length === paginatedGraduates.length && paginatedGraduates.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-sky-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Grad Year</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
              {paginatedGraduates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--text-muted)]">
                    No academic records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedGraduates.map((g) => (
                  <tr key={g.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-3 px-4 text-center">
                      <button type="button" onClick={() => toggleSelectOne(g.id)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                        {selectedIds.includes(g.id) ? (
                          <CheckSquare className="h-4 w-4 text-sky-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-sky-400">{g.studentId}</td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{g.fullName}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{g.department}</td>
                    <td className="py-3 px-4">{g.graduationYear}</td>
                    <td className="py-3 px-4 font-mono">{g.cgpa}</td>
                    <td className="py-3 px-4">
                      {g.identityVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          <ShieldCheck className="h-3 w-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRecord(g);
                            setModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)]"
                          title="Edit Record"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onArchiveGraduate(g.id)}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-rose-950/40 hover:text-rose-400"
                          title="Archive Record"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-input)] px-4 py-3 text-xs text-[var(--text-muted)]">
            <span>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredGraduates.length)} of{' '}
              {filteredGraduates.length} records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-[var(--border-color)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] disabled:opacity-30"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-[var(--text-primary)]">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[var(--border-color)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <RecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        record={editingRecord}
        onSave={(recordData) => {
          if (editingRecord) {
            onEditGraduate({ ...editingRecord, ...recordData });
            toast.success('Graduate record updated successfully.');
          } else {
            onAddGraduate(recordData);
            toast.success('New graduate record added.');
          }
        }}
      />
    </div>
  );
};
