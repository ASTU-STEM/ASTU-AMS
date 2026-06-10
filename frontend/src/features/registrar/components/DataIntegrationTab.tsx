import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface DataIntegrationTabProps {
  onBatchInsert: (records: any[]) => void;
}

interface ImportHistoryEntry {
  id: number;
  timestamp: string;
  fileName: string;
  totalRecords: number;
  importedRecords: number;
  duplicates: number;
  status: 'Success' | 'Partial' | 'Failed';
}

export const DataIntegrationTab: React.FC<DataIntegrationTabProps> = ({ onBatchInsert }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<{
    total: number;
    valid: number;
    duplicates: number;
    errors: string[];
    records: any[];
  } | null>(null);

  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [activeStep, setActiveStep] = useState<'upload' | 'validate' | 'import'>('upload');
  const [importHistory, setImportHistory] = useState<ImportHistoryEntry[]>([
    { id: 3, timestamp: '2026-05-28 14:30', fileName: 'graduates_batch_2024_v2.csv', totalRecords: 124, importedRecords: 118, duplicates: 6, status: 'Partial' },
    { id: 2, timestamp: '2026-05-15 09:15', fileName: 'cse_graduates_2024.xlsx', totalRecords: 87, importedRecords: 87, duplicates: 0, status: 'Success' },
    { id: 1, timestamp: '2026-04-30 11:00', fileName: 'ece_batch_2023.csv', totalRecords: 52, importedRecords: 48, duplicates: 4, status: 'Partial' },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setValidationReport(null);
      setProcessingStatus('idle');
      setActiveStep('validate');
      toast.success(`Loaded file: ${file.name}`);
    }
  };

  const handleDownloadTemplate = () => {
    const template = `StudentID,FullName,Email,Department,GraduationYear,CGPA
UG/12345/14,John Doe,john.doe@astu.edu.et,Computer Science and Engineering,2024,3.50
UG/12346/14,Jane Smith,jane.smith@astu.edu.et,Electrical and Computer Engineering,2024,3.75`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sis_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded.');
  };

  const handleRunValidation = () => {
    if (!csvFile) return;
    setIsValidating(true);

    setTimeout(() => {
      const mockRecords = [
        { studentId: 'UG/19082/14', fullName: 'Solomon Kebede', email: 'solomon.k@astu.edu.et', department: 'Computer Science and Engineering', graduationYear: '2024', cgpa: '3.72' },
        { studentId: 'UG/12839/14', fullName: 'Abebe Bikila', email: 'abebe.b@gmail.com', department: 'Computer Science and Engineering', graduationYear: '2024', cgpa: '3.78' },
        { studentId: 'UG/14299/14', fullName: 'Hiwot Tadesse', email: 'hiwot.t@astu.edu.et', department: 'Electrical and Computer Engineering', graduationYear: '2024', cgpa: '3.95' },
        { studentId: 'UG/18029/14', fullName: 'Mered Girma', email: 'mered.g@astu.edu.et', department: 'Chemical Engineering', graduationYear: '2024', cgpa: '2.40' },
      ];

      setValidationReport({
        total: 4,
        valid: 3,
        duplicates: 1,
        errors: ['Row 2 Error: Student ID "UG/12839/14" already exists in ASTU-SIS database (Duplicate Detected).'],
        records: mockRecords
      });
      setIsValidating(false);
      setActiveStep('import');
      toast.success('SIS validation engine check complete.');
    }, 1500);
  };

  const handleProcessBatch = () => {
    if (!validationReport) return;
    setProcessingStatus('processing');

    setTimeout(() => {
      const validToInsert = validationReport.records.filter(r => r.studentId !== 'UG/12839/14');
      onBatchInsert(validToInsert.map(r => ({
        studentId: r.studentId,
        fullName: r.fullName,
        email: r.email,
        department: r.department,
        graduationYear: r.graduationYear,
        cgpa: r.cgpa
      })));

      setProcessingStatus('done');
      setImportHistory(prev => [{
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        fileName: csvFile?.name || 'unknown',
        totalRecords: validationReport.total,
        importedRecords: validToInsert.length,
        duplicates: validationReport.duplicates,
        status: validationReport.duplicates > 0 ? 'Partial' : 'Success'
      }, ...prev]);
      toast.success(`Successfully registered ${validToInsert.length} alumni accounts and generated activation emails!`);
    }, 2000);
  };

  const handleReset = () => {
    setCsvFile(null);
    setValidationReport(null);
    setProcessingStatus('idle');
    setActiveStep('upload');
  };

  return (
    <div className="space-y-6">

      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-astu-navy via-[#002a55] to-emerald-800 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">Data Pipeline</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Batch Scaffolding & Import</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">Upload graduate rosters from the SIS, validate against existing records, and auto-generate verified alumni accounts with activation credentials.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={handleDownloadTemplate} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold hover:bg-white/25 transition-all">
              <span className="material-symbols-outlined text-sm">download</span>
              Download Template
            </button>
            {processingStatus === 'done' && (
              <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all">
                <span className="material-symbols-outlined text-sm">refresh</span>
                New Import
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 px-4">
        {[
          { id: 'upload', label: 'Upload File', icon: 'upload_file' },
          { id: 'validate', label: 'Validate Data', icon: 'fact_check' },
          { id: 'import', label: 'Import Records', icon: 'database' },
        ].map((step, i) => (
          <React.Fragment key={step.id}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeStep === step.id ? 'bg-astu-navy text-white shadow-md' :
              ['upload', 'validate', 'import'].indexOf(activeStep) > i || processingStatus === 'done'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-50 text-gray-400 border border-gray-200'
            }`}>
              <span className="material-symbols-outlined text-sm">{step.icon}</span>
              {step.label}
            </div>
            {i < 2 && <div className={`h-px flex-1 ${['upload', 'validate', 'import'].indexOf(activeStep) > i || processingStatus === 'done' ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Upload Area */}
      {activeStep === 'upload' && (
        <section className="bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-astu-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-astu-navy">cloud_upload</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Upload Graduate Roster</h3>
            <p className="text-sm text-gray-500 mb-6">Select an Excel (.xlsx) or CSV file exported from the university SIS system.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 relative group hover:border-astu-navy/50 transition-colors cursor-pointer bg-gray-50/50">
              <input type="file" accept=".csv,.xlsx" onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="space-y-2">
                <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-astu-navy/50 transition-colors">upload</span>
                <p className="text-sm font-bold text-gray-900">Drop your file here or click to browse</p>
                <p className="text-xs text-gray-400">Supports: .csv, .xlsx (max 10MB)</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Validation Step */}
      {(activeStep === 'validate' || activeStep === 'import' || processingStatus !== 'idle') && (
        <section className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h4 className="font-bold text-md flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-green">verified_user</span>
              Data Validation Results
            </h4>
            <span className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase rounded">Engine v1.4</span>
              {csvFile && <span className="text-[10px] text-gray-400">{csvFile.name}</span>}
            </span>
          </div>

          {isValidating ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 border-4 border-astu-navy/20 border-t-astu-navy rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-sm font-bold text-gray-600">Running SIS validation engine...</p>
              <p className="text-xs text-gray-400 mt-1">Checking for duplicates, format errors, and data integrity</p>
            </div>
          ) : validationReport && (
            <>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="p-5 bg-gray-50 rounded-2xl text-center border border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Attempted</p>
                  <p className="text-3xl font-extrabold text-gray-800 mt-1">{validationReport.total}</p>
                  <p className="text-[10px] text-gray-400 mt-1">records scanned</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl text-center border border-emerald-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Valid Records</p>
                  <p className="text-3xl font-extrabold text-emerald-700 mt-1">{validationReport.valid}</p>
                  <p className="text-[10px] text-emerald-500 mt-1">ready to import</p>
                </div>
                <div className="p-5 bg-red-50 rounded-2xl text-center border border-red-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Duplicates</p>
                  <p className="text-3xl font-extrabold text-red-700 mt-1">{validationReport.duplicates}</p>
                  <p className="text-[10px] text-red-500 mt-1">skipped</p>
                </div>
              </div>

              {validationReport.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="font-bold text-red-700 flex items-center gap-1.5 text-xs mb-2">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Validation Issues Detected
                  </p>
                  {validationReport.errors.map((err, i) => (
                    <p key={i} className="text-xs text-gray-700 pl-6 border-l-2 border-red-200 ml-1 py-1">{err}</p>
                  ))}
                </div>
              )}

              {/* Valid Records Preview */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b">
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">CGPA</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {validationReport.records.map((r, i) => (
                      <tr key={i} className={r.studentId === 'UG/12839/14' ? 'bg-red-50/50' : 'hover:bg-gray-50/50'}>
                        <td className="p-3 font-mono font-bold">{r.studentId}</td>
                        <td className="p-3 font-medium">{r.fullName}</td>
                        <td className="p-3 text-gray-600">{r.department}</td>
                        <td className="p-3 font-semibold">{r.cgpa}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            r.studentId === 'UG/12839/14' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {r.studentId === 'UG/12839/14' ? 'Duplicate' : 'Valid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {processingStatus === 'idle' ? (
                <div className="pt-4 border-t flex justify-end gap-3">
                  <button onClick={handleReset} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleProcessBatch}
                    className="px-6 py-2.5 bg-astu-green hover:bg-astu-green/90 text-white text-xs font-bold rounded-xl shadow-md hover:scale-105 transition-all">
                    Import {validationReport.valid} Valid Records
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    {processingStatus === 'processing' ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                        Processing batch import and generating activation emails...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-astu-green text-lg">check_circle</span>
                        Batch import completed successfully!
                      </>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-astu-green h-full rounded-full transition-all duration-1000"
                      style={{ width: processingStatus === 'processing' ? '60%' : '100%' }} />
                  </div>
                </div>
              )}
            </>
          )}

          {activeStep === 'validate' && !isValidating && !validationReport && csvFile && (
            <div className="text-center py-4">
              <button onClick={handleRunValidation} className="px-8 py-3 bg-astu-navy text-white text-xs font-bold uppercase rounded-xl hover:scale-105 transition-all shadow-md">
                Run Validation Checks
              </button>
            </div>
          )}
        </section>
      )}

      {/* Import History */}
      <section className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-md flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-navy">history</span>
            Import History
          </h4>
          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg font-medium">
            {importHistory.length} imports
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 pr-2">Date</th>
                <th className="pb-3 pr-2">File Name</th>
                <th className="pb-3 pr-2">Total</th>
                <th className="pb-3 pr-2">Imported</th>
                <th className="pb-3 pr-2">Duplicates</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {importHistory.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50/50">
                  <td className="py-3 pr-2 text-gray-500">{entry.timestamp}</td>
                  <td className="py-3 pr-2 font-medium text-gray-800">{entry.fileName}</td>
                  <td className="py-3 pr-2 font-semibold">{entry.totalRecords}</td>
                  <td className="py-3 pr-2 text-emerald-600 font-bold">{entry.importedRecords}</td>
                  <td className="py-3 pr-2 text-amber-600 font-bold">{entry.duplicates}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      entry.status === 'Success' ? 'bg-emerald-100 text-emerald-700' :
                      entry.status === 'Partial' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
