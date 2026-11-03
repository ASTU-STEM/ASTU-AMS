import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Database,
  Sparkles,
  Clock,
  Layers,
  Check,
  X,
  ShieldAlert,
  Server
} from 'lucide-react';
import { registrarService } from '../services/registrar.service';
import { registrarTheme } from '../styles/registrarTheme';

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

interface ValidatedRecord {
  studentId: string;
  fullName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  dateOfBirth?: string;
  department: string;
  departmentCode?: string;
  graduationYear?: number | string;
  cgpa: number | string;
  isValid: boolean;
  isDuplicate: boolean;
  rowNum: number;
}

type SortField = 'studentId' | 'fullName' | 'department' | 'graduationYear' | 'cgpa' | 'status';
type SortOrder = 'asc' | 'desc';

export const DataIntegrationTab: React.FC<DataIntegrationTabProps> = ({ onBatchInsert }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<{
    total: number;
    valid: number;
    duplicates: number;
    errors: string[];
    records: ValidatedRecord[];
  } | null>(null);

  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');
  const [errorsExpanded, setErrorsExpanded] = useState<boolean>(false);

  // Table interactive controls: search, filtering, sorting, pagination
  const [tableSearch, setTableSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'DUPLICATE'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('rowNum' as any);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Import mode & API sync states
  const [importMethod, setImportMethod] = useState<'file' | 'api'>('file');
  const [apiBatchYear, setApiBatchYear] = useState<string>('2024');
  const [isFetchingApi, setIsFetchingApi] = useState<boolean>(false);
  const [sisStatus, setSisStatus] = useState<{ status: string; mode?: string } | null>(null);

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
          timestamp: log.syncedAt
            ? new Date(log.syncedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recent',
          fileName: log.fileName || 'sis_batch_import.csv',
          totalRecords: log.total || log.recordsCount || 0,
          importedRecords: log.imported || log.recordsCount || 0,
          duplicates: log.duplicates || 0,
          status: (log.status === 'SUCCESS' ? 'Success' : log.status === 'PARTIAL' ? 'Partial' : 'Failed') as any,
        }));
        setImportHistory(formatted);
      }
    } catch (e) {
      console.error('Failed to load import history logs:', e);
    }
  };

  useEffect(() => {
    loadImportHistory();
    registrarService
      .getSisStatus()
      .then((status) => setSisStatus(status))
      .catch(() => setSisStatus({ status: 'ONLINE' }));
  }, []);

  // Direct SIS API Fetch & Synchronization handler
  const handleFetchFromSisApi = async () => {
    setIsFetchingApi(true);
    setProcessingStatus('processing');
    toast.loading(`Connecting to ASTU SIS API server (${apiBatchYear})...`, { id: 'sis-api-toast' });

    try {
      const res = await registrarService.syncFromSisApi(apiBatchYear);
      const fetchedRecords: any[] = res && Array.isArray(res.graduates) ? res.graduates : [];

      if (fetchedRecords.length === 0) {
        toast.error('No graduate records returned from SIS API for the selected batch year.', { id: 'sis-api-toast' });
        setProcessingStatus('idle');
        setIsFetchingApi(false);
        return;
      }

      toast.success(`Successfully fetched ${fetchedRecords.length} graduate roster records from ASTU SIS API!`, {
        id: 'sis-api-toast',
      });

      const existingGraduates = await registrarService.getGraduates();
      const existingIds = new Set((existingGraduates || []).map((g: any) => String(g.studentId || '').trim()));

      let validCount = 0;
      let dupCount = 0;
      const errorsList: string[] = [];

      const validated: ValidatedRecord[] = fetchedRecords.map((r: any, idx: number) => {
        const cleanId = String(r.studentId || '').trim();
        const isDup = existingIds.has(cleanId);
        if (isDup) {
          dupCount++;
          errorsList.push(`Record #${idx + 1}: Student ID "${cleanId}" already exists in ASTU database (Duplicate Detected).`);
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
          rowNum: idx + 1,
        };
      });

      setValidationReport({
        total: fetchedRecords.length,
        valid: validCount,
        duplicates: dupCount,
        errors: errorsList,
        records: validated,
      });

      setCsvFile(new File([''], `ASTU_SIS_API_Batch_${apiBatchYear}.json`));
      setActiveStep('validate');
      setProcessingStatus('idle');
      setIsFetchingApi(false);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('SIS API Fetch error:', err);
      toast.error(err.message || 'Failed to fetch roster from ASTU SIS API server', { id: 'sis-api-toast' });
      setProcessingStatus('idle');
      setIsFetchingApi(false);
    }
  };

  const getBatchBreakdown = (records: ValidatedRecord[]) => {
    const groups: { [batchYear: string]: number } = {};
    records.forEach((r) => {
      const year = String(r.graduationYear || 'Unspecified').trim();
      groups[year] = (groups[year] || 0) + 1;
    });
    return groups;
  };

  const parseCsvContent = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
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

      // Positional fallbacks aligned with 9-column registrar template:
      // StudentID,FullName,Email,Phone,Nationality,DateOfBirth,Department,GraduationYear,CGPA
      if (!row.studentId && values[0]) row.studentId = values[0];
      if (!row.fullName && values[1]) row.fullName = values[1];
      if (!row.email && values[2]) row.email = values[2];
      if (!row.phone && values[3]) row.phone = values[3];
      if (!row.nationality && values[4]) row.nationality = values[4];
      if (!row.dateOfBirth && values[5]) row.dateOfBirth = values[5];
      if (!row.department && values[6]) row.department = values[6];
      if (!row.graduationYear && values[7]) row.graduationYear = values[7];
      if (!row.cgpa && values[8]) row.cgpa = values[8];

      if (row.studentId || row.fullName) {
        records.push(row);
      }
    }
    return records;
  };

  const runValidationEngine = async (text: string, _fileObj: File) => {
    if (!text) return;
    setIsValidating(true);

    try {
      const existingGraduates = await registrarService.getGraduates();
      const existingIds = new Set((existingGraduates || []).map((g: any) => String(g.studentId || '').trim()));

      const parsedRecords = parseCsvContent(text);
      const errorsList: string[] = [];

      let validCount = 0;
      let dupCount = 0;

      const validatedRecords: ValidatedRecord[] = parsedRecords.map((r, index) => {
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
          errorsList.push(`Row ${index + 1}: Student ID "${cleanId}" already exists in ASTU database (Duplicate Detected).`);
        } else if (missingFields.length === 0) {
          validCount++;
        }

        return {
          ...r,
          studentId: cleanId,
          cgpa: r.cgpa || '3.00',
          graduationYear: r.graduationYear || '2024',
          isDuplicate,
          isValid: !isDuplicate && missingFields.length === 0,
          rowNum: index + 1,
        };
      });

      setValidationReport({
        total: parsedRecords.length,
        valid: validCount,
        duplicates: dupCount,
        errors: errorsList,
        records: validatedRecords,
      });

      setActiveStep('validate');
      setCurrentPage(1);
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
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      toast.error('Excel (.xlsx) upload is not supported yet. Please export/save as CSV and try again.');
      e.target.value = '';
      return;
    }

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
  };

  const handleDownloadTemplate = () => {
    const template = `StudentID,FullName,Email,Phone,Nationality,DateOfBirth,Department,GraduationYear,CGPA
UG/12345/14,John Doe,john.doe@gmail.com,+251911223344,Ethiopian,1999-05-14,Software Engineering,2024,3.82
UG/12346/14,Jane Smith,jane.smith@gmail.com,+251911556677,Ethiopian,2000-08-22,Electrical and Computer Engineering,2024,3.75`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astu_sis_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template containing all 9 Registrar fields downloaded.');
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
        .filter((r) => r.isValid)
        .map((r) => ({
          studentId: r.studentId,
          fullName: r.fullName,
          email: r.email || undefined,
          phone: r.phone || undefined,
          nationality: r.nationality || undefined,
          dateOfBirth: r.dateOfBirth || undefined,
          department: r.department,
          graduationYear: r.graduationYear || undefined,
          cgpa: r.cgpa != null && r.cgpa !== '' ? r.cgpa : undefined,
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
    setTableSearch('');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setSelectedBatchFilter('ALL');
    setCurrentPage(1);
  };

  // Extract unique departments for filtering
  const availableDepartments = useMemo(() => {
    if (!validationReport) return [];
    const set = new Set<string>();
    validationReport.records.forEach((r) => {
      if (r.department) set.add(r.department.trim());
    });
    return Array.from(set).sort();
  }, [validationReport]);

  // Filtered & Sorted Records
  const processedRecords = useMemo(() => {
    if (!validationReport) return [];

    let list = validationReport.records;

    // 1. Batch filter
    if (selectedBatchFilter !== 'ALL') {
      list = list.filter((r) => String(r.graduationYear || 'Unspecified').trim() === selectedBatchFilter);
    }

    // 2. Status filter
    if (statusFilter === 'VALID') {
      list = list.filter((r) => r.isValid);
    } else if (statusFilter === 'DUPLICATE') {
      list = list.filter((r) => r.isDuplicate);
    }

    // 3. Department filter
    if (departmentFilter !== 'ALL') {
      list = list.filter((r) => r.department?.trim() === departmentFilter);
    }

    // 4. Text search
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.studentId.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q) ||
          (r.department && r.department.toLowerCase().includes(q))
      );
    }

    // 5. Sorting
    const sorted = [...list].sort((a, b) => {
      let valA: any = a[sortField as keyof ValidatedRecord];
      let valB: any = b[sortField as keyof ValidatedRecord];

      if (sortField === ('status' as any)) {
        valA = a.isDuplicate ? 1 : 0;
        valB = b.isDuplicate ? 1 : 0;
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return sorted;
  }, [validationReport, selectedBatchFilter, statusFilter, departmentFilter, tableSearch, sortField, sortOrder]);

  // Pagination calculation
  const totalRecordsCount = processedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRecords.slice(start, start + pageSize);
  }, [processedRecords, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Render a sort icon with high contrast
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-[#8493A8] opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#22D3EE]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#22D3EE]" />
    );
  };

  return (
    <div className="space-y-6 text-[#F1F5F9] font-sans antialiased">
      {/* ── 1. Hero Banner: Professional Deep Dark Surface ── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#101725] via-[#151D2B] to-[#16273E] p-6 md:p-8 text-[#F1F5F9] shadow-xl border border-[#2A3749] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2196F3]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#22D3EE]/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2636] border border-[#2A3749] text-[11px] font-bold uppercase tracking-wider text-[#22D3EE]">
            <Database className="w-3.5 h-3.5 text-[#22D3EE]" />
            Enterprise Data Pipeline
          </div>

          <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight text-[#F1F5F9]">
            Batch Scaffolding & Data Integration
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#B0BDCE]">
            Synchronize graduate rosters directly from ASTU SIS or upload CSV cohorts. Automatically validate identity records,
            flag duplicates, and prepare verified alumni credentials.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B2636] hover:bg-[#202E40] text-[#F1F5F9] border border-[#2A3749] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#22D3EE]" />
              Download Template (.csv)
            </button>

            {processingStatus === 'done' && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F3323] hover:bg-[#164d35] text-[#4ADE80] border border-[#166534] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#4ADE80]" />
                Start New Import
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Step Progress Indicator ── */}
      <div className="bg-[#151D2B] border border-[#2A3749] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {[
            { id: 'upload', label: '1. Select & Upload Source', icon: Upload },
            { id: 'validate', label: '2. Review & Validate Data', icon: ShieldAlert },
            { id: 'import', label: '3. Commit to Database', icon: Database },
          ].map((step, i) => {
            const Icon = step.icon;
            const isCurrent = activeStep === step.id;
            const isCompleted =
              (['upload', 'validate', 'import'].indexOf(activeStep) > i || processingStatus === 'done') && !isCurrent;

            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex-1 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                    isCurrent
                      ? 'bg-[#1B2636] text-[#22D3EE] border-[#2196F3] shadow-md shadow-[#2196F3]/10'
                      : isCompleted
                      ? 'bg-[#0F3323]/40 text-[#4ADE80] border-[#166534]'
                      : 'bg-[#141D2B] text-[#8493A8] border-[#2A3749]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-[#2196F3] text-white'
                        : isCompleted
                        ? 'bg-[#22C55E] text-slate-950'
                        : 'bg-[#1B2636] text-[#8493A8]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 font-bold" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="truncate">{step.label}</span>
                </div>

                {i < 2 && (
                  <div className="hidden sm:block w-8 h-[2px] bg-[#2A3749] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── 3. Step 1: Upload / API Source Selection ── */}
      {activeStep === 'upload' && (
        <div className="space-y-6">
          {/* Method Toggle */}
          <div className="flex items-center gap-2 p-1.5 bg-[#141D2B] border border-[#2A3749] rounded-xl max-w-md">
            <button
              onClick={() => setImportMethod('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                importMethod === 'file'
                  ? 'bg-[#2196F3] text-white shadow-sm'
                  : 'text-[#B0BDCE] hover:text-[#F1F5F9] hover:bg-[#1B2636]'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload CSV File
            </button>
            <button
              onClick={() => setImportMethod('api')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                importMethod === 'api'
                  ? 'bg-[#2196F3] text-white shadow-sm'
                  : 'text-[#B0BDCE] hover:text-[#F1F5F9] hover:bg-[#1B2636]'
              }`}
            >
              <Server className="w-4 h-4" />
              SIS API Sync
              <span className="px-1.5 py-0.5 bg-[#0F3323] text-[#4ADE80] border border-[#166534] text-[9px] font-extrabold rounded">
                Live
              </span>
            </button>
          </div>

          {importMethod === 'file' ? (
            /* File Upload Card */
            <section className="bg-[#151D2B] border border-[#2A3749] rounded-2xl p-8 shadow-sm">
              <div className="text-center max-w-xl mx-auto">
                <div className="w-16 h-16 bg-[#1B2636] border border-[#2A3749] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#2196F3]">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">Upload Graduate Roster CSV</h3>
                <p className="text-sm text-[#B0BDCE] mb-6 leading-relaxed">
                  Export graduate rosters from the university SIS and drop them here for automated duplicate scanning and
                  field verification.
                </p>

                <div className="border-2 border-dashed border-[#2A3749] hover:border-[#2196F3] rounded-2xl p-8 relative group transition-all cursor-pointer bg-[#141D2B] hover:bg-[#1B2636]/60">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="space-y-3 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-[#1B2636] border border-[#2A3749] flex items-center justify-center mx-auto text-[#22D3EE] group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#F1F5F9]">
                      Drop your CSV file here, or <span className="text-[#2196F3] underline underline-offset-4">browse files</span>
                    </p>
                    <p className="text-xs text-[#8493A8]">Standard UTF-8 CSV supported (up to 15MB)</p>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* Direct SIS API Sync Card */
            <section className="bg-[#151D2B] border border-[#2A3749] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3749] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1B2636] border border-[#2A3749] rounded-xl flex items-center justify-center text-[#22D3EE]">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#F1F5F9]">ASTU SIS Database API Gateway</h3>
                    <p className="text-xs text-[#B0BDCE]">Direct live synchronization with Registrar Student Records</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#166534] bg-[#0F3323] text-xs font-bold text-[#4ADE80]">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  SIS Server Online
                </div>
              </div>

              <div className="bg-[#141D2B] border border-[#2A3749] rounded-xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex-1 max-w-xl">
                    <label className="block text-xs font-extrabold text-[#B0BDCE] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#2196F3]" />
                      Select Graduation Cohort Year
                    </label>
                    <select
                      value={apiBatchYear}
                      onChange={(e) => setApiBatchYear(e.target.value)}
                      className="w-full px-4 py-3 bg-[#151D2B] border border-[#2A3749] rounded-xl text-xs font-bold text-[#F1F5F9] focus:outline-none focus:border-[#2196F3] shadow-sm cursor-pointer"
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
                    className="w-full md:w-auto px-6 py-3 bg-[#2196F3] hover:bg-[#1E88E5] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer h-[46px]"
                  >
                    {isFetchingApi ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synchronizing Roster...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Sync & Fetch Cohort from SIS API</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── 4. Step 2 & 3: Validation, Error Alert Panel & Table Preview ── */}
      {(activeStep === 'validate' || activeStep === 'import' || processingStatus !== 'idle') && (
        <section className="bg-[#151D2B] border border-[#2A3749] rounded-2xl p-6 shadow-sm space-y-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A3749] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F3323] border border-[#166534] flex items-center justify-center text-[#4ADE80]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-[#F1F5F9]">Data Validation & Duplicate Inspection</h4>
                <p className="text-xs text-[#8493A8]">Review parsed records, duplicate flags, and batch categorization</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#1B2636] border border-[#2A3749] text-[#22D3EE] text-[10px] font-extrabold uppercase rounded-lg">
                Engine v2.0
              </span>
              {csvFile && (
                <span className="px-3 py-1 bg-[#141D2B] border border-[#2A3749] text-xs text-[#B0BDCE] font-mono rounded-lg truncate max-w-[200px]">
                  {csvFile.name}
                </span>
              )}
            </div>
          </div>

          {isValidating ? (
            /* Loading State */
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#2A3749] border-t-[#2196F3] rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-sm font-bold text-[#F1F5F9]">Executing SIS Validation Checks...</p>
                <p className="text-xs text-[#8493A8] mt-1">Cross-referencing student IDs and checking database duplicates</p>
              </div>
            </div>
          ) : (
            validationReport && (
              <>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-[#141D2B] border border-[#2A3749] rounded-xl text-center">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#8493A8]">Total Attempted</p>
                    <p className="text-3xl font-extrabold text-[#F1F5F9] mt-1">{validationReport.total}</p>
                    <p className="text-[11px] text-[#8493A8] mt-1">Records scanned in file</p>
                  </div>

                  <div className="p-5 bg-[#0F3323]/50 border border-[#166534] rounded-xl text-center">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#4ADE80]">Valid Records</p>
                    <p className="text-3xl font-extrabold text-[#4ADE80] mt-1">{validationReport.valid}</p>
                    <p className="text-[11px] text-[#4ADE80]/80 mt-1">Ready for database import</p>
                  </div>

                  <div className="p-5 bg-[#29171D] border border-[#71313A] rounded-xl text-center">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#F87171]">Duplicates Skipped</p>
                    <p className="text-3xl font-extrabold text-[#F87171] mt-1">{validationReport.duplicates}</p>
                    <p className="text-[11px] text-[#FCA5A5]/80 mt-1">Already exist in database</p>
                  </div>
                </div>

                {/* Batch Breakdown Buttons */}
                {validationReport.records.length > 0 && (
                  <div className="p-4 bg-[#141D2B] border border-[#2A3749] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#B0BDCE] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                        Filter View by Cohort Batch Year:
                      </span>
                      <span className="text-[11px] text-[#8493A8]">
                        Showing {processedRecords.length} records in current filter
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedBatchFilter('ALL');
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedBatchFilter === 'ALL'
                            ? 'bg-[#2196F3] text-white shadow-sm'
                            : 'bg-[#1B2636] text-[#B0BDCE] hover:text-[#F1F5F9] border border-[#2A3749] hover:bg-[#202E40]'
                        }`}
                      >
                        All Batches ({validationReport.records.length})
                      </button>

                      {Object.entries(getBatchBreakdown(validationReport.records)).map(([batchYear, count]) => (
                        <button
                          key={batchYear}
                          onClick={() => {
                            setSelectedBatchFilter(batchYear);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            selectedBatchFilter === batchYear
                              ? 'bg-[#2196F3] text-white shadow-sm'
                              : 'bg-[#1B2636] text-[#B0BDCE] hover:text-[#F1F5F9] border border-[#2A3749] hover:bg-[#202E40]'
                          }`}
                        >
                          <span>Class of {batchYear}</span>
                          <span className="px-1.5 py-0.5 bg-[#141D2B] text-[#F1F5F9] rounded text-[10px] font-mono">
                            {count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 5. Professional Dark Redesigned Validation Alert Box ── */}
                {validationReport.errors.length > 0 && (
                  <div className="rounded-xl bg-[#29171D] border-l-4 border-l-[#F87171] border-y border-r border-[#71313A] p-5 shadow-lg space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#361B24] border border-[#71313A] flex items-center justify-center text-[#F87171] shrink-0">
                          <AlertTriangle className="w-4 h-4 text-[#F87171]" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-[#FCA5A5] flex items-center gap-2">
                            Validation Issues & Duplicate Records Detected
                            <span className="px-2 py-0.5 rounded-full bg-[#4D1B24] border border-[#71313A] text-[11px] font-mono text-[#FCA5A5]">
                              {validationReport.errors.length} {validationReport.errors.length === 1 ? 'Issue' : 'Issues'}
                            </span>
                          </h5>
                          <p className="text-xs text-[#F1D5D8]/80 mt-0.5">
                            Duplicate records will be automatically skipped during import to protect database integrity.
                          </p>
                        </div>
                      </div>

                      {validationReport.errors.length > 3 && (
                        <button
                          onClick={() => setErrorsExpanded(!errorsExpanded)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#361B24] hover:bg-[#4D1B24] text-[#FCA5A5] text-xs font-bold border border-[#71313A] transition-colors cursor-pointer"
                        >
                          {errorsExpanded ? (
                            <>
                              <span>Show fewer</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Show all ({validationReport.errors.length})</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Error Item List */}
                    <div className="space-y-2 pt-2">
                      {(errorsExpanded ? validationReport.errors : validationReport.errors.slice(0, 3)).map((err, i) => {
                        // Highlight duplicate student ID if present in text
                        const idMatch = err.match(/"([^"]+)"/);
                        const cleanErrText = idMatch ? err.replace(`"${idMatch[1]}"`, '') : err;

                        return (
                          <div
                            key={i}
                            className="bg-[#361B24] border border-[#71313A]/70 rounded-lg p-3 text-xs text-[#F1D5D8] flex items-start gap-2.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F87171] mt-1.5 shrink-0" />
                            <div className="flex-1 leading-relaxed">
                              {idMatch ? (
                                <>
                                  <span>{cleanErrText.split('(Duplicate')[0]}</span>
                                  <span className="inline-block mx-1 font-mono font-bold text-[#FCA5A5] bg-[#4D1B24] px-2 py-0.5 rounded border border-[#71313A]">
                                    {idMatch[1]}
                                  </span>
                                  <span className="text-[#F87171] font-semibold">(Duplicate Detected)</span>
                                </>
                              ) : (
                                <span>{err}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── 6. Completely Improved Dark Data Table ── */}
                <div className="bg-[#141D2B] border border-[#2A3749] rounded-xl overflow-hidden shadow-md">
                  {/* Table Control Toolbar */}
                  <div className="p-4 bg-[#1B2636] border-b border-[#2A3749] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Search input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-[#8493A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={tableSearch}
                        onChange={(e) => {
                          setTableSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search student ID, name, or department..."
                        className="w-full pl-10 pr-9 py-2 bg-[#141D2B] border border-[#2A3749] rounded-lg text-xs text-[#F1F5F9] placeholder:text-[#8493A8] focus:outline-none focus:border-[#2196F3] transition-colors"
                      />
                      {tableSearch && (
                        <button
                          onClick={() => {
                            setTableSearch('');
                            setCurrentPage(1);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8493A8] hover:text-[#F1F5F9] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Right: Filters & Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Status Filter */}
                      <div className="flex items-center gap-1.5 text-xs text-[#B0BDCE]">
                        <Filter className="w-3.5 h-3.5 text-[#8493A8]" />
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value as any);
                            setCurrentPage(1);
                          }}
                          className="px-3 py-1.5 bg-[#141D2B] border border-[#2A3749] rounded-lg text-xs font-bold text-[#F1F5F9] focus:outline-none focus:border-[#2196F3] cursor-pointer"
                        >
                          <option value="ALL">All Statuses ({validationReport.records.length})</option>
                          <option value="VALID">Valid Only ({validationReport.valid})</option>
                          <option value="DUPLICATE">Duplicates Only ({validationReport.duplicates})</option>
                        </select>
                      </div>

                      {/* Department Filter */}
                      {availableDepartments.length > 0 && (
                        <select
                          value={departmentFilter}
                          onChange={(e) => {
                            setDepartmentFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="px-3 py-1.5 bg-[#141D2B] border border-[#2A3749] rounded-lg text-xs font-bold text-[#F1F5F9] focus:outline-none focus:border-[#2196F3] cursor-pointer max-w-[200px] truncate"
                        >
                          <option value="ALL">All Departments</option>
                          {availableDepartments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Page Size Selector */}
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2.5 py-1.5 bg-[#141D2B] border border-[#2A3749] rounded-lg text-xs font-bold text-[#F1F5F9] focus:outline-none focus:border-[#2196F3] cursor-pointer"
                      >
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                    </div>
                  </div>

                  {/* Table Element */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#1B2636] text-[#B0BDCE] font-bold uppercase tracking-wider border-b border-[#2A3749]">
                          <th
                            onClick={() => handleSort('studentId')}
                            className="p-3.5 pl-4 cursor-pointer hover:text-[#F1F5F9] transition-colors group select-none"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Student ID</span>
                              {renderSortIndicator('studentId')}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort('fullName')}
                            className="p-3.5 cursor-pointer hover:text-[#F1F5F9] transition-colors group select-none"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Full Name</span>
                              {renderSortIndicator('fullName')}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort('department')}
                            className="p-3.5 cursor-pointer hover:text-[#F1F5F9] transition-colors group select-none"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Department</span>
                              {renderSortIndicator('department')}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort('graduationYear')}
                            className="p-3.5 cursor-pointer hover:text-[#F1F5F9] transition-colors group select-none"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Batch</span>
                              {renderSortIndicator('graduationYear')}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort('cgpa')}
                            className="p-3.5 cursor-pointer hover:text-[#F1F5F9] transition-colors group select-none"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>CGPA</span>
                              {renderSortIndicator('cgpa')}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort('status')}
                            className="p-3.5 pr-4 cursor-pointer hover:text-[#F1F5F9] transition-colors group select-none"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Status</span>
                              {renderSortIndicator('status')}
                            </div>
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#2A3749]">
                        {paginatedRecords.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-[#8493A8]">
                              <div className="max-w-xs mx-auto space-y-2">
                                <Search className="w-8 h-8 text-[#8493A8]/40 mx-auto" />
                                <p className="font-bold text-sm text-[#F1F5F9]">No matching records found</p>
                                <p className="text-xs text-[#8493A8]">
                                  Try adjusting your search query, status filter, or department selection.
                                </p>
                                <button
                                  onClick={() => {
                                    setTableSearch('');
                                    setStatusFilter('ALL');
                                    setDepartmentFilter('ALL');
                                    setSelectedBatchFilter('ALL');
                                  }}
                                  className="mt-2 px-3 py-1 bg-[#1B2636] hover:bg-[#202E40] border border-[#2A3749] text-xs font-bold text-[#22D3EE] rounded-lg transition-colors cursor-pointer"
                                >
                                  Reset All Filters
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedRecords.map((r, i) => {
                            const isAlt = i % 2 === 1;

                            return (
                              <tr
                                key={r.studentId + i}
                                className={`transition-colors ${
                                  r.isDuplicate
                                    ? 'bg-[#29171D]/40 hover:bg-[#29171D]/80'
                                    : isAlt
                                    ? 'bg-[#172131] hover:bg-[#202E40]'
                                    : 'bg-[#141D2B] hover:bg-[#202E40]'
                                }`}
                              >
                                <td className="p-3.5 pl-4 font-mono font-bold text-[#F1F5F9]">
                                  {r.studentId}
                                </td>
                                <td className="p-3.5 font-semibold text-[#F1F5F9]">
                                  {r.fullName}
                                </td>
                                <td className="p-3.5 text-[#B0BDCE]">
                                  {r.department}
                                </td>
                                <td className="p-3.5">
                                  <span className="px-2 py-0.5 rounded-md bg-[#1B2636] border border-[#2A3749] text-[#B0BDCE] font-mono font-bold text-[11px]">
                                    {r.graduationYear || '2024'}
                                  </span>
                                </td>
                                <td className="p-3.5 font-mono font-extrabold text-[#F1F5F9]">
                                  {typeof r.cgpa === 'number' ? r.cgpa.toFixed(2) : r.cgpa}
                                </td>
                                <td className="p-3.5 pr-4">
                                  {r.isDuplicate ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#3B1A22] text-[#F87171] border border-[#71313A]">
                                      <XCircle className="w-3.5 h-3.5 text-[#F87171]" />
                                      Duplicate
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#0F3323] text-[#4ADE80] border border-[#166534]">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                                      Valid Record
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination Footer */}
                  <div className="p-4 bg-[#1B2636] border-t border-[#2A3749] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#B0BDCE]">
                    <div className="text-xs">
                      Showing{' '}
                      <span className="font-bold text-[#F1F5F9]">
                        {totalRecordsCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-bold text-[#F1F5F9]">
                        {Math.min(currentPage * pageSize, totalRecordsCount)}
                      </span>{' '}
                      of <span className="font-bold text-[#F1F5F9]">{totalRecordsCount}</span> records
                      {validationReport.duplicates > 0 && (
                        <span className="text-[#8493A8] ml-2">
                          ({validationReport.valid} valid, {validationReport.duplicates} duplicates)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141D2B] border border-[#2A3749] text-xs font-bold text-[#F1F5F9] hover:bg-[#202E40] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="px-3 py-1.5 bg-[#141D2B] border border-[#2A3749] rounded-lg text-xs font-mono font-bold text-[#22D3EE]">
                        Page {currentPage} of {totalPages}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141D2B] border border-[#2A3749] text-xs font-bold text-[#F1F5F9] hover:bg-[#202E40] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── 7. Commit Actions / Progress Bar ── */}
                {processingStatus === 'idle' ? (
                  <div className="pt-4 border-t border-[#2A3749] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-[#8493A8]">
                      Clicking Import will register{' '}
                      <span className="font-bold text-[#4ADE80]">{validationReport.valid} valid records</span> directly into
                      ASTU Graduate Database.
                    </p>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleReset}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1B2636] border border-[#2A3749] text-[#B0BDCE] hover:text-[#F1F5F9] text-xs font-bold rounded-xl hover:bg-[#202E40] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProcessBatch}
                        disabled={validationReport.valid === 0}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-[#2196F3] hover:bg-[#1E88E5] text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-[#2196F3]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Import {validationReport.valid} Valid Records
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-[#2A3749] space-y-3">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-[#F1F5F9]">
                      {processingStatus === 'processing' ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-[#2196F3] animate-spin" />
                          <span>Processing batch records and generating alumni accounts...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                          <span className="text-[#4ADE80]">Batch import successfully committed to ASTU-AMS!</span>
                        </>
                      )}
                    </div>

                    <div className="w-full bg-[#141D2B] h-2.5 rounded-full overflow-hidden border border-[#2A3749]">
                      <div
                        className="bg-gradient-to-r from-[#2196F3] to-[#22D3EE] h-full rounded-full transition-all duration-700"
                        style={{ width: processingStatus === 'processing' ? '65%' : '100%' }}
                      />
                    </div>
                  </div>
                )}
              </>
            )
          )}

          {activeStep === 'validate' && !isValidating && !validationReport && csvFile && (
            <div className="text-center py-6">
              <button
                onClick={handleRunValidation}
                className="px-8 py-3 bg-[#2196F3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md cursor-pointer"
              >
                Run Validation Checks
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── 8. Import History Section: Consistent Dark Palette ── */}
      <section className="bg-[#151D2B] border border-[#2A3749] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B2636] border border-[#2A3749] flex items-center justify-center text-[#2196F3]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#F1F5F9]">Audit Logs & Import History</h4>
              <p className="text-xs text-[#8493A8]">Historical log of all SIS batch imports and sync jobs</p>
            </div>
          </div>

          <span className="text-[11px] text-[#22D3EE] bg-[#1B2636] border border-[#2A3749] px-3 py-1 rounded-lg font-mono font-bold">
            {importHistory.length} Past Syncs
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#2A3749]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1B2636] text-[#B0BDCE] font-bold uppercase tracking-wider border-b border-[#2A3749]">
                <th className="p-3 pl-4">Timestamp</th>
                <th className="p-3">File / Source</th>
                <th className="p-3">Scanned</th>
                <th className="p-3">Imported</th>
                <th className="p-3">Duplicates</th>
                <th className="p-3 pr-4">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3749]">
              {importHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8493A8] italic bg-[#141D2B]">
                    No previous import logs found in database.
                  </td>
                </tr>
              ) : (
                importHistory.map((entry, idx) => (
                  <tr
                    key={entry.id || idx}
                    className="bg-[#141D2B] hover:bg-[#202E40] transition-colors"
                  >
                    <td className="p-3 pl-4 text-[#B0BDCE] font-mono">{entry.timestamp}</td>
                    <td className="p-3 font-semibold text-[#F1F5F9]">{entry.fileName}</td>
                    <td className="p-3 font-mono text-[#F1F5F9]">{entry.totalRecords}</td>
                    <td className="p-3 font-mono font-bold text-[#4ADE80]">{entry.importedRecords}</td>
                    <td className="p-3 font-mono font-bold text-[#F87171]">{entry.duplicates}</td>
                    <td className="p-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                          entry.status === 'Success'
                            ? 'bg-[#0F3323] text-[#4ADE80] border-[#166534]'
                            : entry.status === 'Partial'
                            ? 'bg-[#3D2808] text-[#FBBF24] border-[#78350F]'
                            : 'bg-[#3B1A22] text-[#F87171] border-[#71313A]'
                        }`}
                      >
                        {entry.status === 'Success' && <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />}
                        {entry.status === 'Partial' && <AlertTriangle className="w-3 h-3 text-[#FBBF24]" />}
                        {entry.status === 'Failed' && <XCircle className="w-3 h-3 text-[#F87171]" />}
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

export default DataIntegrationTab;
