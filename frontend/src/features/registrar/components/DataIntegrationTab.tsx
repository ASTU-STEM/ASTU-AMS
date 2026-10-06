import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { registrarService } from '../services/registrar.service';

interface DataIntegrationTabProps {
  onBatchInsert: (records: any[]) => void;
}

interface ImportHistoryEntry {
  id: string | number;
  timestamp: string;
  fileName: string;
  totalRecords: number;
  importedRecords: number;
  duplicates: number;
  status: 'Success' | 'Partial' | 'Failed';
}

export const DataIntegrationTab: React.FC<DataIntegrationTabProps> = ({ onBatchInsert }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<{
    total: number;
    valid: number;
    duplicates: number;
    errors: string[];
    records: any[];
  } | null>(null);

  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');

  // Import mode & API sync states
  const [importMethod, setImportMethod] = useState<'file' | 'api'>('file');
  const [apiBatchYear, setApiBatchYear] = useState<string>('2024');
  const [isFetchingApi, setIsFetchingApi] = useState<boolean>(false);
  const [sisStatus, setSisStatus] = useState<{ status: string; mode?: string } | null>(null);

  // Direct SIS API Fetch & Synchronization handler
  const handleFetchFromSisApi = async () => {
    setIsFetchingApi(true);
    setProcessingStatus('processing');
    toast.loading(`Connecting to ASTU SIS API server (${apiBatchYear})...`, { id: 'sis-api-toast' });

    try {
      // Call real backend API endpoint /api/registrar/fetch-graduates/:year
      const res = await registrarService.syncFromSisApi(apiBatchYear);

      // Extract records returned from backend API
      const fetchedRecords: any[] = (res && Array.isArray(res.graduates)) ? res.graduates : [];

      if (fetchedRecords.length === 0) {
        toast.error('No graduate records returned from SIS API for the selected batch year.', { id: 'sis-api-toast' });
        setProcessingStatus('idle');
        setIsFetchingApi(false);
        return;
      }

      toast.success(`Successfully fetched ${fetchedRecords.length} graduate roster records from ASTU SIS API!`, { id: 'sis-api-toast' });

      // Fetch existing graduates from DB to validate duplicates
      const existingGraduates = await registrarService.getGraduates();
      const existingIds = new Set((existingGraduates || []).map((g: any) => String(g.studentId || '').trim()));

      let validCount = 0;
      let dupCount = 0;
      const errorsList: string[] = [];

      const validated = fetchedRecords.map((r: any, idx: number) => {
        const cleanId = String(r.studentId || '').trim();
        const isDup = existingIds.has(cleanId);
        if (isDup) {
          dupCount++;
          errorsList.push(`Record ${idx + 1}: Student ID "${cleanId}" already exists in DB.`);
        } else {
          validCount++;
        }
        return {
          studentId: cleanId,
          fullName: r.fullName,
          email: r.email || undefined,
          phone: r.phone || undefined,
          department: r.department,
          departmentCode: r.departmentCode,
          graduationYear: r.graduationYear || (apiBatchYear === 'ALL' ? new Date().getFullYear() : Number(apiBatchYear)),
          cgpa: r.cgpa || 3.0,
          isValid: !isDup,
          isDuplicate: isDup,
          rowNum: idx + 1
        };
      });

      setValidationReport({
        total: fetchedRecords.length,
        valid: validCount,
        duplicates: dupCount,
        errors: errorsList,
        records: validated
      });

      setCsvFile(new File([''], `ASTU_SIS_API_Batch_${apiBatchYear}.json`));
      setActiveStep('validate');
      setProcessingStatus('idle');
      setIsFetchingApi(false);
    } catch (err: any) {
      console.error('SIS API Fetch error:', err);
      toast.error(err.message || 'Failed to fetch roster from ASTU SIS API server', { id: 'sis-api-toast' });
      setProcessingStatus('idle');
      setIsFetchingApi(false);
    }
  };

  const getBatchBreakdown = (records: any[]) => {
    const groups: { [batchYear: string]: number } = {};
    records.forEach(r => {
      const year = String(r.graduationYear || 'Unspecified').trim();
      groups[year] = (groups[year] || 0) + 1;
    });
    return groups;
  };
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [activeStep, setActiveStep] = useState<'upload' | 'validate' | 'import'>('upload');
  const [importHistory, setImportHistory] = useState<ImportHistoryEntry[]>([]);

  // Fetch real import history logs from DB
  const loadImportHistory = async () => {
    try {
      const logs = await registrarService.getLogs();
      if (Array.isArray(logs)) {
        const formatted = logs.map((log: any) => ({
          id: log.id,
          timestamp: log.syncedAt ? new Date(log.syncedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
          fileName: log.fileName || 'sis_batch_import.csv',
          totalRecords: log.total || log.recordsCount || 0,
          importedRecords: log.imported || log.recordsCount || 0,
          duplicates: log.duplicates || 0,
          status: (log.status === 'SUCCESS' ? 'Success' : log.status === 'PARTIAL' ? 'Partial' : 'Failed') as any
        }));
        setImportHistory(formatted);
      }
    } catch (e) {
      console.error('Failed to load import history logs:', e);
    }
  };

  useEffect(() => {
    loadImportHistory();
    registrarService.getSisStatus().then(status => setSisStatus(status)).catch(() => setSisStatus({ status: 'OFFLINE' }));
  }, []);

  const runValidationEngine = async (text: string, fileObj: File) => {
    if (!text) return;
    setIsValidating(true);

    try {
      const existingGraduates = await registrarService.getGraduates();
      const existingIds = new Set((existingGraduates || []).map((g: any) => String(g.studentId || '').trim()));

      const parsedRecords = parseCsvContent(text);
      const errorsList: string[] = [];

      let validCount = 0;
      let dupCount = 0;

      const validatedRecords = parsedRecords.map((r, index) => {
        const cleanId = String(r.studentId || '').trim();
        const isDuplicate = existingIds.has(cleanId);
        const missingFields = [];
        if (!r.studentId) missingFields.push('StudentID');
        if (!r.fullName) missingFields.push('FullName');
        if (!r.department) missingFields.push('Department');

        if (missingFields.length > 0) {
          errorsList.push(`Row ${index + 1}: Missing required field(s) (${missingFields.join(', ')})`);
        }
        if (isDuplicate) {
          dupCount++;
          errorsList.push(`Row ${index + 1}: Student ID "${r.studentId}" already exists in ASTU-SIS database (Duplicate Detected).`);
        } else if (missingFields.length === 0) {
          validCount++;
        }

        return {
          ...r,
          isDuplicate,
          isValid: !isDuplicate && missingFields.length === 0
        };
      });

      setValidationReport({
        total: parsedRecords.length,
        valid: validCount,
        duplicates: dupCount,
        errors: errorsList,
        records: validatedRecords
      });

      setActiveStep('validate');
      toast.success(`SIS Validation complete: ${validCount} valid, ${dupCount} duplicates.`);
    } catch (e) {
      console.error('Validation engine error:', e);
      toast.error('Failed to execute SIS validation checks');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setValidationReport(null);
      setProcessingStatus('idle');
      setActiveStep('validate');

      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = (event.target?.result as string) || '';
        setFileContent(content);
        await runValidationEngine(content, file);
      };
      reader.readAsText(file);
      toast.success(`Loaded file: ${file.name}`);
    }
  };

  const handleDownloadTemplate = () => {
    const template = `StudentID,FullName,Email,Phone,Nationality,DateOfBirth,Department,GraduationYear,CGPA
UG/12345/14,John Doe,john.doe@gmail.com,+251911223344,Ethiopian,1999-05-14,Computer Science and Engineering,2024,3.50
UG/12346/14,Jane Smith,jane.smith@gmail.com,+251911556677,Ethiopian,2000-08-22,Electrical and Computer Engineering,2024,3.75`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sis_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template containing all 9 Registrar fields downloaded.');
  };

  const parseCsvContent = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length < 2) continue;

      const row: any = {};
      headers.forEach((h, idx) => {
        const key = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        const val = values[idx] || '';
        if (key.includes('student') || key.includes('id')) row.studentId = val;
        else if (key.includes('fullname') || key.includes('name')) row.fullName = val;
        else if (key.includes('email')) row.email = val;
        else if (key.includes('phone')) row.phone = val;
        else if (key.includes('nationality')) row.nationality = val;
        else if (key.includes('dob') || key.includes('birth')) row.dateOfBirth = val;
        else if (key.includes('dept') || key.includes('department')) row.department = val;
        else if (key.includes('year') || key.includes('batch') || key.includes('grad')) row.graduationYear = val;
        else if (key.includes('cgpa') || key.includes('gpa')) row.cgpa = val;
      });

      if (!row.studentId && values[0]) row.studentId = values[0];
      if (!row.fullName && values[1]) row.fullName = values[1];
      if (!row.department && values[3]) row.department = values[3];
      if (!row.graduationYear && values[4]) row.graduationYear = values[4];
      if (!row.cgpa && values[5]) row.cgpa = values[5];

      if (row.studentId || row.fullName) {
        records.push(row);
      }
    }
    return records;
  };

  const handleRunValidation = async () => {
    if (!csvFile || !fileContent) return;
    await runValidationEngine(fileContent, csvFile);
  };

  const handleProcessBatch = async () => {
    if (!validationReport || !csvFile) return;
    setActiveStep('import');
    setProcessingStatus('processing');

    try {
      const validRecords = validationReport.records
        .filter(r => r.isValid)
        .map(r => ({
          studentId: r.studentId,
          fullName: r.fullName,
          email: r.email || undefined,
          phone: r.phone || undefined,
          nationality: r.nationality || undefined,
          dateOfBirth: r.dateOfBirth || undefined,
          department: r.department,
          graduationYear: r.graduationYear || new Date().getFullYear(),
          cgpa: r.cgpa || 3.0
        }));

      await registrarService.importBatch(validRecords, csvFile.name);
      onBatchInsert(validRecords);

      setProcessingStatus('done');
      await loadImportHistory();
      toast.success(`Successfully registered ${validRecords.length} SIS graduate records to database!`);
    } catch (e) {
      console.error('Failed to commit batch import:', e);
      toast.error('Failed to process batch import');
      setProcessingStatus('idle');
    }
  };

  const handleReset = () => {
    setCsvFile(null);
    setFileContent('');
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
                : 'bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-color)]'
            }`}>
              <span className="material-symbols-outlined text-sm">{step.icon}</span>
              {step.label}
            </div>
            {i < 2 && <div className={`h-px flex-1 ${['upload', 'validate', 'import'].indexOf(activeStep) > i || processingStatus === 'done' ? 'bg-emerald-300' : 'bg-[var(--bg-page)]'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Upload Area */}
      {activeStep === 'upload' && (
        <div className="space-y-6">
          {/* Method Selection Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-page)] rounded-2xl max-w-md">
            <button
              onClick={() => setImportMethod('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
                importMethod === 'file'
                  ? 'bg-white text-astu-navy shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Upload File (.csv / .xlsx)
            </button>
            <button
              onClick={() => setImportMethod('api')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
                importMethod === 'api'
                  ? 'bg-white text-astu-navy shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-emerald-600">sync_alt</span>
              Fetch via SIS API
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-md uppercase">
                Live
              </span>
            </button>
          </div>

          {importMethod === 'file' ? (
            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm">
              <div className="text-center max-w-lg mx-auto">
                <div className="w-16 h-16 bg-astu-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-astu-navy">cloud_upload</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Upload Graduate Roster</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6">Select an Excel (.xlsx) or CSV file exported from the university SIS system.</p>
                <div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-8 relative group hover:border-astu-navy/50 transition-colors cursor-pointer bg-[var(--bg-page)]">
                  <input type="file" accept=".csv,.xlsx" onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="space-y-2">
                    <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-astu-navy/50 transition-colors">upload</span>
                    <p className="text-sm font-bold text-[var(--text-primary)]">Drop your file here or click to browse</p>
                    <p className="text-xs text-[var(--text-muted)]">Supports: .csv, .xlsx (max 10MB)</p>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-2xl">api</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">ASTU University SIS API Server Integration</h3>
                    <p className="text-xs text-[var(--text-muted)]">Fetch & synchronize graduate rosters directly from your university SIS database via API</p>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold self-start sm:self-auto ${
                  sisStatus?.status === 'ONLINE' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${sisStatus?.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
                  {sisStatus?.status === 'ONLINE' ? 'SIS Server Online' : 'SIS Server Offline'}
                </div>
              </div>

              <div className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex-1 max-w-xl">
                    <label className="block text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-astu-navy">school</span>
                      Select Graduation Batch Year
                    </label>
                    <select
                      value={apiBatchYear}
                      onChange={(e) => setApiBatchYear(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-astu-navy shadow-sm"
                    >
                      <option value="2026">Class of 2026 (Upcoming Roster)</option>
                      <option value="2025">Class of 2025 (Latest Graduated)</option>
                      <option value="2024">Class of 2024</option>
                      <option value="2023">Class of 2023</option>
                      <option value="2022">Class of 2022</option>
                      <option value="ALL">All Recent Batches (Current & Previous Year)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleFetchFromSisApi}
                    disabled={isFetchingApi}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-astu-navy to-emerald-700 hover:from-astu-navy/95 hover:to-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer h-[46px]"
                  >
                    {isFetchingApi ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Fetching Roster...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">sync_alt</span>
                        <span>Sync & Fetch Roster from SIS API</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Validation Step */}
      {(activeStep === 'validate' || activeStep === 'import' || processingStatus !== 'idle') && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h4 className="font-bold text-md flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-green">verified_user</span>
              Data Validation Results
            </h4>
            <span className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase rounded">Engine v1.4</span>
              {csvFile && <span className="text-[10px] text-[var(--text-muted)]">{csvFile.name}</span>}
            </span>
          </div>

          {isValidating ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 border-4 border-astu-navy/20 border-t-astu-navy rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-sm font-bold text-[var(--text-secondary)]">Running SIS validation engine...</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Checking for duplicates, format errors, and data integrity</p>
            </div>
          ) : validationReport && (
            <>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="p-5 bg-[var(--bg-page)] rounded-2xl text-center border border-[var(--border-color)]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Attempted</p>
                  <p className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">{validationReport.total}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">records scanned</p>
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

              {/* Automatic Batch Categorization Breakdown Banner */}
              {validationReport.records.length > 0 && (
                <div className="p-4 bg-[var(--bg-page)] dark:bg-slate-800/40 border border-[var(--border-color)] dark:border-slate-700/60 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-200 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-astu-navy">auto_awesome</span>
                      Automatic Batch Categorization Breakdown
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold">Categorized by Graduation Year</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBatchFilter('ALL')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedBatchFilter === 'ALL'
                          ? 'bg-astu-navy text-white shadow-sm'
                          : 'bg-[var(--bg-card)] dark:bg-slate-800 text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-page)]'
                      }`}
                    >
                      All Batches ({validationReport.records.length})
                    </button>
                    {Object.entries(getBatchBreakdown(validationReport.records)).map(([batchYear, count]) => (
                      <button
                        key={batchYear}
                        onClick={() => setSelectedBatchFilter(batchYear)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          selectedBatchFilter === batchYear
                            ? 'bg-astu-navy text-white shadow-sm'
                            : 'bg-[var(--bg-card)] dark:bg-slate-800 text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-page)]'
                        }`}
                      >
                        <span>🎓 Batch {batchYear}</span>
                        <span className="px-1.5 py-0.2 bg-[var(--bg-page)] dark:bg-slate-700 text-[var(--text-primary)] dark:text-slate-200 rounded-full text-[10px]">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {validationReport.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="font-bold text-red-700 flex items-center gap-1.5 text-xs mb-2">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Validation Issues Detected
                  </p>
                  {validationReport.errors.map((err, i) => (
                    <p key={i} className="text-xs text-[var(--text-secondary)] pl-6 border-l-2 border-red-200 ml-1 py-1">{err}</p>
                  ))}
                </div>
              )}

              {/* Valid Records Preview */}
              <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[var(--bg-page)] text-[var(--text-muted)] font-bold uppercase tracking-wider border-b">
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3">CGPA</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {validationReport.records
                      .filter(r => selectedBatchFilter === 'ALL' || String(r.graduationYear || 'Unspecified').trim() === selectedBatchFilter)
                      .map((r, i) => (
                        <tr key={i} className={r.isDuplicate ? 'bg-red-50/50' : 'hover:bg-[var(--bg-page)]'}>
                          <td className="p-3 font-mono font-bold">{r.studentId}</td>
                          <td className="p-3 font-medium">{r.fullName}</td>
                          <td className="p-3 text-[var(--text-secondary)]">{r.department}</td>
                          <td className="p-3 text-[var(--text-secondary)] font-semibold">{r.graduationYear || '2024'}</td>
                          <td className="p-3 font-semibold">{r.cgpa}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              r.isDuplicate ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {r.isDuplicate ? 'Duplicate' : 'Valid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {processingStatus === 'idle' ? (
                <div className="pt-4 border-t flex justify-end gap-3">
                  <button onClick={handleReset} className="px-5 py-2.5 border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold rounded-xl hover:bg-[var(--bg-page)] transition-all">
                    Cancel
                  </button>
                  <button onClick={handleProcessBatch}
                    className="px-6 py-2.5 bg-astu-green hover:bg-astu-green/90 text-white text-xs font-bold rounded-xl shadow-md hover:scale-105 transition-all">
                    Import {validationReport.valid} Valid Records
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                    {processingStatus === 'processing' ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                        Processing batch import and saving to database...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-astu-green text-lg">check_circle</span>
                        Batch import completed successfully!
                      </>
                    )}
                  </div>
                  <div className="w-full bg-[var(--bg-page)] h-2.5 rounded-full overflow-hidden">
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
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-md flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-navy">history</span>
            Import History
          </h4>
          <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-page)] px-2 py-1 rounded-lg font-medium">
            {importHistory.length} imports
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[var(--text-muted)] font-bold uppercase tracking-wider border-b border-[var(--border-color)]">
                <th className="pb-3 pr-2">Date</th>
                <th className="pb-3 pr-2">File Name</th>
                <th className="pb-3 pr-2">Total</th>
                <th className="pb-3 pr-2">Imported</th>
                <th className="pb-3 pr-2">Duplicates</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {importHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[var(--text-muted)] italic">No previous import logs found in database.</td>
                </tr>
              ) : (
                importHistory.map(entry => (
                  <tr key={entry.id} className="hover:bg-[var(--bg-page)]">
                    <td className="py-3 pr-2 text-[var(--text-muted)]">{entry.timestamp}</td>
                    <td className="py-3 pr-2 font-medium text-[var(--text-primary)]">{entry.fileName}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
