import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { GraduateRecord } from '../../types/registrar.types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: GraduateRecord | null;
  onSave: (recordData: any) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose, record, onSave }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    department: 'Computer Science and Engineering',
    graduationYear: '2024',
    cgpa: '3.50',
    status: 'Active',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        studentId: record.studentId || '',
        fullName: record.fullName || '',
        email: record.email || '',
        department: record.department || 'Computer Science and Engineering',
        graduationYear: String(record.graduationYear || '2024'),
        cgpa: String(record.cgpa || '3.50'),
        status: record.status || 'Active',
      });
    } else {
      setFormData({
        studentId: '',
        fullName: '',
        email: '',
        department: 'Computer Science and Engineering',
        graduationYear: '2024',
        cgpa: '3.50',
        status: 'Active',
      });
    }
  }, [record]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-[var(--text-primary)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {record ? 'Edit Student Record' : 'Add SIS Graduate Record'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[var(--text-secondary)]">Student ID</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-[var(--text-secondary)]">Graduation Year</label>
              <input
                type="number"
                required
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[var(--text-secondary)]">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[var(--text-secondary)]">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-[var(--text-secondary)]">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                required
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[var(--text-secondary)]">Academic Department</label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3 border-t border-[var(--border-color)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-500"
            >
              <Save className="h-4 w-4" /> Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
