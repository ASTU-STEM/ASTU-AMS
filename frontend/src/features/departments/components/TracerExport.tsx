import React, { useState } from 'react';
import { FileText, Table, Download, X, CheckCircle, Loader2, Filter, Layers, Globe, Shield, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { departmentService } from '../services/department.service';
import { TracerExportOption } from '../types/tracer.types';

interface TracerExportProps {
  onExport?: (option: TracerExportOption) => void;
  onClose: () => void;
  userDept?: string;
  darkMode?: boolean;
  tracerAnalytics?: any;
}

export const TracerExport: React.FC<TracerExportProps> = ({ onClose, userDept = 'Software Engineering', darkMode = false, tracerAnalytics }) => {
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [academicYear, setAcademicYear] = useState('2024');
  const [tracerPeriod, setTracerPeriod] = useState('6-month');
  const [alumniStatus, setAlumniStatus] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const [selectedSections, setSelectedSections] = useState<{ [key: string]: boolean }>({
    kpis: true,
    timeline: true,
    surveyCompletion: true,
    employmentOutcomes: true,
    careerAlignment: true,
    satisfaction: true,
    geographic: true,
    roster: true,
  });

  const sectionOptions = [
    { id: 'kpis', label: 'Key Telemetry KPIs & Executive Metrics' },
    { id: 'timeline', label: 'Longitudinal Timeline Milestones (6, 12, 24 Mo)' },
    { id: 'surveyCompletion', label: 'Survey Completion & Batch Response Rates' },
    { id: 'employmentOutcomes', label: 'Employment Outcome Distribution' },
    { id: 'careerAlignment', label: 'Career Alignment & ABET Matrix' },
    { id: 'satisfaction', label: 'Graduate Satisfaction Breakdown' },
    { id: 'geographic', label: 'Geographic Outcome & Placement Reach' },
    { id: 'roster', label: 'Detailed Graduate Alumni Roster & Records' },
  ];

  const handleToggleSection = (id: string) => {
    setSelectedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllSections = (select: boolean) => {
    const updated: { [key: string]: boolean } = {};
    sectionOptions.forEach(s => { updated[s.id] = select; });
    setSelectedSections(updated);
  };

  const handleGenerateReport = async () => {
    try {
      setIsExporting(true);
      const activeSections = Object.keys(selectedSections).filter(k => selectedSections[k]);

      await departmentService.downloadReport({
        format,
        department: userDept,
        academicYear,
        tracerPeriod,
        alumniStatus,
        sections: activeSections,
        reportType: 'tracer-reports',
        dashboardData: tracerAnalytics ? { tracerAnalytics, department: { name: userDept, code: userDept.split(' ').map(w => w[0]).join('') } } : undefined
      });

      toast.success(`Official ${userDept} Tracer Report exported in ${format.toUpperCase()} format!`);
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to generate executive report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden transition-all border ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200/80 text-slate-800'}`}>
        
        {/* Modal Header */}
        <div className={`p-6 border-b flex justify-between items-center shrink-0 ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-gray-100 bg-slate-50/50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-astu-navy/10 text-astu-navy">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Export Executive Tracer Reports</h3>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Generate accreditation-ready printable PDFs, Excel spreadsheets, CSVs, or JSON payloads for {userDept}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-slate-500'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">

          {/* 1. Format Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Layers className="h-4 w-4 text-astu-navy" />
              Select Report Export Format
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'pdf', label: 'PDF Document', desc: 'Printable Executive Report', badge: 'PRINT / PDF', color: 'bg-red-50 text-red-700 border-red-200' },
                { id: 'excel', label: 'Excel Sheet', desc: 'Multi-Tab Spreadsheet', badge: 'XLSX', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { id: 'csv', label: 'CSV File', desc: 'Raw Data Pipeline', badge: 'CSV', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { id: 'json', label: 'JSON Data', desc: 'REST Payload', badge: 'JSON', color: 'bg-purple-50 text-purple-700 border-purple-200' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id as any)}
                  className={`p-4 border rounded-xl text-left transition-all duration-200 flex flex-col justify-between ${
                    format === f.id
                      ? 'border-astu-navy bg-astu-navy/5 ring-2 ring-astu-navy/30'
                      : darkMode ? 'border-slate-800 bg-slate-800/60 hover:border-slate-700' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md border mb-2 ${f.color}`}>
                      {f.badge}
                    </span>
                    <h4 className="text-sm font-bold">{f.label}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                  {format === f.id && (
                    <div className="mt-3 flex justify-end">
                      <CheckCircle className="h-4 w-4 text-astu-navy" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Filters & Scope Controls */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Filter className="h-4 w-4 text-astu-navy" />
              Scope & Cohort Filters
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Academic Cohort Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-astu-navy/40 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-800'}`}
                >
                  <option value="All">All Cohorts</option>
                  <option value="2024">Cohort 2024</option>
                  <option value="2023">Cohort 2023</option>
                  <option value="2022">Cohort 2022</option>
                  <option value="2021">Cohort 2021</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Tracer Milestone</label>
                <select
                  value={tracerPeriod}
                  onChange={(e) => setTracerPeriod(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-astu-navy/40 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-800'}`}
                >
                  <option value="All">All Milestones</option>
                  <option value="6-month">6-Month Post-Graduation</option>
                  <option value="12-month">12-Month Post-Graduation</option>
                  <option value="18-month">18-Month Post-Graduation</option>
                  <option value="24-month">24-Month Post-Graduation</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Alumni Status Scope</label>
                <select
                  value={alumniStatus}
                  onChange={(e) => setAlumniStatus(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-astu-navy/40 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-800'}`}
                >
                  <option value="ALL">All Graduates</option>
                  <option value="ACTIVE">Employed / Active Only</option>
                  <option value="INACTIVE">Unemployed / Seeking</option>
                  <option value="PENDING VERIFICATION">Self-Employed / Further Study</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Section Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-astu-navy" />
                Include Report Sections
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectAllSections(true)}
                  className="text-astu-navy font-bold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-400">•</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllSections(false)}
                  className="text-slate-500 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {sectionOptions.map(sec => (
                <label
                  key={sec.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    selectedSections[sec.id]
                      ? 'border-astu-navy/40 bg-astu-navy/5 text-slate-900 dark:text-white'
                      : darkMode ? 'border-slate-800 bg-slate-800/40 text-slate-400' : 'border-gray-200 bg-gray-50/50 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(selectedSections[sec.id])}
                    onChange={() => handleToggleSection(sec.id)}
                    className="h-4 w-4 rounded-md text-astu-navy focus:ring-astu-navy border-gray-300"
                  />
                  <span>{sec.label}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className={`p-6 border-t shrink-0 flex items-center justify-between ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-gray-100 bg-slate-50/70'}`}>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="h-4 w-4 text-astu-green" />
            <span>Official ASTU Executive Report Document</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-slate-700'}`}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-6 py-2.5 bg-astu-navy hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Generate & Download</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TracerExport;
