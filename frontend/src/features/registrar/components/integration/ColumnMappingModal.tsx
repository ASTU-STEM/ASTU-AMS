import React, { useState } from 'react';
import { X, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { ColumnMapping } from './csvExcelParser';

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  initialMapping: ColumnMapping;
  onApplyMapping: (mapping: ColumnMapping) => void;
}

const REQUIRED_FIELDS: Array<{ key: keyof ColumnMapping; label: string }> = [
  { key: 'studentId', label: 'Student ID' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'department', label: 'Department' },
  { key: 'cgpa', label: 'Cumulative GPA (CGPA)' },
  { key: 'graduationYear', label: 'Graduation Year' },
];

const OPTIONAL_FIELDS: Array<{ key: keyof ColumnMapping; label: string }> = [
  { key: 'email', label: 'Email Address' },
  { key: 'phone', label: 'Phone Number' },
];

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  onClose,
  headers,
  initialMapping,
  onApplyMapping,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({ ...initialMapping });

  if (!isOpen) return null;

  const handleChange = (field: keyof ColumnMapping, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onApplyMapping(mapping);
    onClose();
  };

  const missingRequired = REQUIRED_FIELDS.filter((f) => !mapping[f.key]);

  return (
    <div
      data-testid="column-mapping-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-[var(--text-primary)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Map Spreadsheet Columns</h3>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Assign discovered headers from your uploaded file to the required SIS academic record fields.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">Required Academic Fields</h4>
            <div className="mt-2.5 space-y-3">
              {REQUIRED_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] p-3 text-xs">
                  <div>
                    <span className="font-semibold text-[var(--text-secondary)]">{label}</span>
                    <span className="ml-1 text-rose-400">*</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <select
                      value={mapping[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="min-w-[180px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
                    >
                      <option value="">-- Select Column --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Optional Contact Fields</h4>
            <div className="mt-2.5 space-y-3">
              {OPTIONAL_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] p-3 text-xs">
                  <span className="font-medium text-[var(--text-secondary)]">{label}</span>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <select
                      value={mapping[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="min-w-[180px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:border-sky-500 focus:outline-none"
                    >
                      <option value="">-- Not Mapped --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {missingRequired.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Please map all required fields ({missingRequired.map((f) => f.label).join(', ')}) before applying.</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--border-color)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={missingRequired.length > 0}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-500 disabled:opacity-40"
          >
            <Check className="h-4 w-4" /> Apply Mapping
          </button>
        </div>
      </div>
    </div>
  );
};
