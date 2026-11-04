import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Layers, Check, X, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import { parseCsvText, ColumnMapping, ParseResult } from './integration/csvExcelParser';
import { ValidationErrorPanel } from './integration/ValidationErrorPanel';
import { ColumnMappingModal } from './integration/ColumnMappingModal';
import { registrarService } from '../services/registrar.service';

interface DataIntegrationTabProps {
  onBatchInsert?: (records: any[]) => void;
}

export const DataIntegrationTab: React.FC<DataIntegrationTabProps> = ({ onBatchInsert }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileRawText, setFileRawText] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [activeMapping, setActiveMapping] = useState<ColumnMapping>({
    studentId: '',
    fullName: '',
    department: '',
    cgpa: '',
    graduationYear: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFileContent = (content: string, mappingOverride?: ColumnMapping) => {
    const result = parseCsvText(content, mappingOverride || activeMapping);
    setParseResult(result);
    if (result.errors.length === 0 && result.records.length > 0) {
      toast.success(`Validated ${result.validCount} graduate records ready for SIS integration!`);
    } else if (result.errors.length > 0) {
      toast.error(`Found ${result.errors.length} formatting errors in file.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileRawText(text);
      processFileContent(text);
    };
    reader.readAsText(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    setFile(dropped);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileRawText(text);
      processFileContent(text);
    };
    reader.readAsText(dropped);
  };

  const handleBatchCommit = async () => {
    if (!parseResult || parseResult.records.length === 0) return;
    const validRecords = parseResult.records.filter((r) => r.isValid);
    if (validRecords.length === 0) {
      toast.error('No valid records to import. Please correct errors first.');
      return;
    }

    setIsProcessing(true);
    try {
      if (onBatchInsert) {
        onBatchInsert(validRecords);
      }
      toast.success(`Successfully committed ${validRecords.length} records to SIS Academic Store!`);
      setFile(null);
      setParseResult(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to commit batch records.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBatch = () => {
    setFile(null);
    setParseResult(null);
    toast('Batch discarded.', { icon: '🗑️' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">SIS Batch Data Integration</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Parse, validate, and import verified graduating classes and SIS records directly into ASTU-AMS.
          </p>
        </div>
        {parseResult && (
          <button
            type="button"
            onClick={() => setMappingModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4 text-sky-400" />
            <span>Adjust Column Mapping</span>
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      {!parseResult && (
        <div
          data-testid="dropzone"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-sky-400 bg-sky-950/20'
              : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-slate-500 hover:bg-[var(--bg-card-secondary)]'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
            <Upload className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">Upload Graduating Class Spreadsheet</h3>
          <p className="mt-1 max-w-sm text-xs text-[var(--text-secondary)]">
            Drag and drop CSV or Excel files here, or click to browse. Dynamic column mapping will automatically detect student attributes.
          </p>
        </div>
      )}

      {/* Error Panel if issues found */}
      {parseResult && parseResult.errors.length > 0 && (
        <ValidationErrorPanel
          errors={parseResult.errors}
          onRetry={() => {
            setFile(null);
            setParseResult(null);
          }}
          onRemapColumns={() => setMappingModalOpen(true)}
        />
      )}

      {/* Valid Records & Batch Action Summary */}
      {parseResult && (
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Batch Parsing Summary</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  {parseResult.validCount} valid records, {parseResult.invalidCount} invalid rows.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRejectBatch}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 transition-colors"
              >
                <X className="h-4 w-4" /> Reject Batch
              </button>
              <button
                type="button"
                disabled={parseResult.validCount === 0 || isProcessing}
                onClick={handleBatchCommit}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-40 transition-colors"
              >
                <Check className="h-4 w-4" /> Approve & Import ({parseResult.validCount})
              </button>
            </div>
          </div>

          {/* Record Preview Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Row</th>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">CGPA</th>
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                {parseResult.records.slice(0, 10).map((r) => (
                  <tr key={r.rowNum} className={r.isValid ? 'hover:bg-[var(--bg-hover)]' : 'bg-[#3B1A22]/40 text-rose-200'}>
                    <td className="py-2.5 px-3 font-mono">{r.rowNum}</td>
                    <td className="py-2.5 px-3 font-semibold">{r.studentId || '—'}</td>
                    <td className="py-2.5 px-3">{r.fullName || '—'}</td>
                    <td className="py-2.5 px-3">{r.department || '—'}</td>
                    <td className="py-2.5 px-3 font-mono">{r.cgpa ? r.cgpa.toFixed(2) : '—'}</td>
                    <td className="py-2.5 px-3">{r.graduationYear || '—'}</td>
                    <td className="py-2.5 px-3">
                      {r.isValid ? (
                        <span className="inline-flex rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          VALID
                        </span>
                      ) : (
                        <span className="inline-flex rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                          INVALID
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Column Mapping Modal */}
      <ColumnMappingModal
        isOpen={mappingModalOpen}
        onClose={() => setMappingModalOpen(false)}
        headers={parseResult?.headers || []}
        initialMapping={activeMapping}
        onApplyMapping={(newMap) => {
          setActiveMapping(newMap);
          if (fileRawText) {
            processFileContent(fileRawText, newMap);
          }
        }}
      />
    </div>
  );
};
