import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  X,
} from 'lucide-react';
import type { IncludedSuitesState } from './types';
import { ScopeSelectionGrid } from './ScopeSelectionGrid';

export function ExportReportModal({
  isOpen,
  onClose,
  academicYear,
  department,
  reportData,
  selectedSuites,
  setSelectedSuites,
}: {
  isOpen: boolean;
  onClose: () => void;
  academicYear: string;
  department: string;
  reportData: any;
  selectedSuites: IncludedSuitesState;
  setSelectedSuites: React.Dispatch<React.SetStateAction<IncludedSuitesState>>;
}) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [reportTitle, setReportTitle] = useState('ASTU Alumni Outcomes & Institutional Analytics Report');
  const [includeLetterhead, setIncludeLetterhead] = useState(true);
  const [watermark, setWatermark] = useState('CONFIDENTIAL - INTERNAL USE');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleExecuteExport = () => {
    setIsExporting(true);
    setProgress(30);

    setTimeout(() => setProgress(75), 200);

    setTimeout(() => {
      setProgress(100);
      setIsExporting(false);

      if (selectedFormat === 'json') {
        const filteredPayload: any = {
          metadata: {
            title: reportTitle,
            academicYear,
            department,
            generatedAt: new Date().toISOString(),
            includedSuites: selectedSuites,
          },
        };

        if (selectedSuites.kpi) filteredPayload.overallEmployment = reportData?.overallEmployment;
        if (selectedSuites.yoyForecast) filteredPayload.yoyTrend = reportData?.overallEmployment?.employmentTrend;
        if (selectedSuites.suite1) filteredPayload.universityIndustryMoU = reportData?.universityIndustryMoU;
        if (selectedSuites.suite2) filteredPayload.departmentPerformance = reportData?.departmentAnalytics;
        if (selectedSuites.suite3) filteredPayload.registrarImportTelemetry = reportData?.registrarImportTelemetry;
        if (selectedSuites.suite4) filteredPayload.documentRequestSLA = reportData?.documentRequestSLA;
        if (selectedSuites.suite5) filteredPayload.platformUserEngagement = reportData?.platformUserEngagement;
        if (selectedSuites.suite6) filteredPayload.verificationRatio = reportData?.verificationRatio;
        if (selectedSuites.suite7) filteredPayload.systemHealthAndAI = reportData?.systemHealthAndAI;
        if (selectedSuites.suite8) filteredPayload.academicPerformance = reportData?.academicPerformance;
        if (selectedSuites.domain1) filteredPayload.additionalFiftyAnalyses = reportData?.additionalFiftyAnalyses;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredPayload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `ASTU_Analytics_Selected_Suites_${academicYear.replace(/\s+/g, '_')}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        onClose();
      } else if (selectedFormat === 'csv' || selectedFormat === 'excel') {
        let csvContent = "data:text/csv;charset=utf-8,Category,Metric,Details\n";
        csvContent += `Metadata,Report Title,"${reportTitle}"\n`;
        csvContent += `Metadata,Academic Year,"${academicYear}"\n`;
        csvContent += `Metadata,Department Filter,"${department}"\n`;

        if (selectedSuites.kpi) {
          csvContent += `KPI,Overall Employment Rate,"${reportData?.overallEmployment?.employmentRate || 0}%"\n`;
          csvContent += `KPI,Average Time to Hire,"${reportData?.overallEmployment?.averageTimeToHireMonths || 0} months"\n`;
          csvContent += `KPI,Average Starting Salary,"${reportData?.overallEmployment?.averageSalary || 0} ETB/mo"\n`;
        }

        if (selectedSuites.suite2 && reportData?.departmentAnalytics?.departmentMetrics) {
          csvContent += `\nDepartment Breakdown,Total Alumni,Employment Rate\n`;
          reportData.departmentAnalytics.departmentMetrics.forEach((d: any) => {
            csvContent += `Department,"${d.departmentName}",${d.totalAlumni},${d.employmentRate}%\n`;
          });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `ASTU_Analytics_${selectedFormat.toUpperCase()}_${academicYear.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        onClose();
      } else {
        // PDF Mode: CLOSE MODAL FIRST so backdrop is removed from DOM!
        onClose();
        setTimeout(() => {
          window.print();
        }, 200);
      }
    }, 400);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#003580]/10 p-1.5 border border-[#003580]/20 flex items-center justify-center">
              <img src="/images/astu-seal-logo.png" alt="ASTU Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ASTU Executive Report &amp; Data Export Suite</h3>
              <p className="text-xs text-slate-500">Configure report scope, institutional branding, and download format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format Selector Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              1. Select Export Format
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'pdf', title: 'PDF Executive', desc: 'Print-ready document', icon: FileText, color: 'text-rose-600 border-rose-200 bg-rose-50/50' },
                { id: 'excel', title: 'Excel (.xlsx)', desc: 'Multi-sheet workbook', icon: FileSpreadsheet, color: 'text-emerald-600 border-emerald-200 bg-emerald-50/50' },
                { id: 'csv', title: 'CSV Raw Data', desc: 'Tabular dataset', icon: FileCode, color: 'text-blue-600 border-blue-200 bg-blue-50/50' },
                { id: 'json', title: 'JSON Payload', desc: 'Structured API JSON', icon: Share2, color: 'text-purple-600 border-purple-200 bg-purple-50/50' },
              ].map((fmt) => {
                const IconComp = fmt.icon;
                const isSel = selectedFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSel
                        ? `ring-2 ring-blue-600 border-blue-600 bg-blue-50/80 shadow-sm`
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <IconComp className={`w-6 h-6 mb-2 ${fmt.color.split(' ')[0]}`} />
                    <div className="text-xs font-bold text-slate-900">{fmt.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{fmt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Checklist Grid with Presets */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              2. Granular Report Scope &amp; Suite Inclusion
            </label>
            <ScopeSelectionGrid selectedSuites={selectedSuites} setSelectedSuites={setSelectedSuites} />
          </div>

          {/* Custom Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Custom Document Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Document Watermark</label>
              <select
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="CONFIDENTIAL - INTERNAL USE">CONFIDENTIAL - INTERNAL USE</option>
                <option value="OFFICIAL BOARD REPORT">OFFICIAL BOARD REPORT</option>
                <option value="DRAFT - FOR REVIEW">DRAFT - FOR REVIEW</option>
                <option value="NONE">No Watermark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLetterhead}
              onChange={(e) => setIncludeLetterhead(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm"
            />
            <span className="text-xs font-semibold text-slate-600">Include ASTU Official Header &amp; Stamp</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Compiling ({progress}%)...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Report ({selectedFormat.toUpperCase()})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


