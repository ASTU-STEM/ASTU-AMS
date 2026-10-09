import React, { useState } from 'react';
import { FileText, Table, Download, X, CheckCircle, Loader2, FileSpreadsheet, Code2, Building2, ShieldCheck } from 'lucide-react';
import { EmployerExportOption } from '../types/employerFeedback.types';
import toast from 'react-hot-toast';

interface EmployerFeedbackExportProps {
  onExport: (option: EmployerExportOption) => void;
  onClose: () => void;
  data?: any;
  departmentName?: string;
  darkMode?: boolean;
}

export const EmployerFeedbackExport: React.FC<EmployerFeedbackExportProps> = ({
  onExport,
  onClose,
  data,
  departmentName = 'Software Engineering',
  darkMode = false
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions: EmployerExportOption[] = [
    {
      id: 'executive-report',
      title: 'PDF Executive Report',
      format: 'pdf',
      icon: 'FileText',
      description: 'Official ASTU ABET-accreditation executive report with logo branding, KPIs, and employer evaluation tables'
    },
    {
      id: 'excel-dataset',
      title: 'Excel Spreadsheet (.xlsx)',
      format: 'excel',
      icon: 'FileSpreadsheet',
      description: 'Structured spreadsheet matrix containing all employer evaluation records and rating metrics'
    },
    {
      id: 'csv-dataset',
      title: 'CSV Data File (.csv)',
      format: 'csv',
      icon: 'Table',
      description: 'Raw comma-separated dataset ready for data science, statistical analysis, and audit tools'
    },
    {
      id: 'json-telemetry',
      title: 'JSON Dataset (.json)',
      format: 'excel',
      icon: 'Code2',
      description: 'Full structured JSON telemetry payload for integration with external institutional software'
    }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileSpreadsheet':
        return <FileSpreadsheet className="h-6 w-6" />;
      case 'Table':
        return <Table className="h-6 w-6" />;
      case 'Code2':
        return <Code2 className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const executeRealExport = (option: EmployerExportOption) => {
    const timeStr = new Date().toISOString().split('T')[0];
    const deptCodeStr = departmentName.replace(/[^a-zA-Z0-9]/g, '_');
    const records = data?.records || [];

    if (option.id === 'executive-report') {
      const printWin = window.open('', '_blank');
      if (printWin) {
        const logoUrl = window.location.origin + '/images/astu-seal-logo.png';
        const kpis = data?.kpiMetrics || [];
        const satMetrics = data?.satisfactionMetrics || [];

        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>ASTU Employer Feedback Report - ${departmentName}</title>
              <style>
                body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 30px; color: #1e293b; background: #fff; }
                .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #003366; padding-bottom: 16px; margin-bottom: 24px; }
                .logo-container { display: flex; align-items: center; gap: 16px; }
                .logo-img { height: 75px; width: 75px; object-fit: contain; }
                .title-area h1 { margin: 0; color: #003366; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                .title-area h2 { margin: 4px 0 0 0; color: #475569; font-size: 14px; font-weight: 600; }
                .badge { background: #003366; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
                .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-bottom: 24px; font-size: 12px; }
                .meta-item strong { color: #003366; display: block; margin-bottom: 2px; text-transform: uppercase; font-size: 10px; }
                .section-title { color: #003366; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 24px 0 14px 0; }
                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
                .kpi-card { border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; background: #f8fafc; }
                .kpi-card .val { font-size: 20px; font-weight: 800; color: #003366; margin-top: 4px; }
                .kpi-card .lbl { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 24px; font-size: 12px; }
                th { background: #003366; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; font-weight: 700; }
                td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo-container">
                  <img src="${logoUrl}" alt="ASTU Logo" class="logo-img" onerror="this.style.display='none'" />
                  <div class="title-area">
                    <h1>Adama Science and Technology University</h1>
                    <h2>Department of ${departmentName} - Employer Feedback Report</h2>
                  </div>
                </div>
                <div class="badge">ABET Accredited</div>
              </div>

              <div class="meta-grid">
                <div class="meta-item"><strong>Department:</strong> ${departmentName}</div>
                <div class="meta-item"><strong>Date Generated:</strong> ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</div>
                <div class="meta-item"><strong>Total Evaluation Records:</strong> ${records.length} Submissions</div>
              </div>

              <div class="section-title">Key Employer Evaluation Indicators</div>
              <div class="kpi-grid">
                ${kpis.slice(0, 4).map((k: any) => `
                  <div class="kpi-card">
                    <div class="lbl">${k.label}</div>
                    <div class="val">${k.value}</div>
                  </div>
                `).join('')}
              </div>

              <div class="section-title">Employer Competency & Skill Ratings</div>
              <table>
                <thead>
                  <tr>
                    <th>Competency Category</th>
                    <th>Average Score (out of 10)</th>
                    <th>Evaluation Rating</th>
                  </tr>
                </thead>
                <tbody>
                  ${satMetrics.map((sm: any) => `
                    <tr>
                      <td><strong>${sm.category}</strong></td>
                      <td>${sm.score}/10</td>
                      <td>${sm.score >= 8 ? 'Exceeds Expectations' : sm.score >= 6 ? 'Meets Expectations' : 'Needs Enhancement'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="section-title">Verified Employer Evaluation Log</div>
              <table>
                <thead>
                  <tr>
                    <th>Employer / Company</th>
                    <th>Industry</th>
                    <th>Rating</th>
                    <th>Satisfaction</th>
                    <th>Recommendations / Feedback</th>
                    <th>Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.map((r: any) => `
                    <tr>
                      <td><strong>${r.employer}</strong></td>
                      <td>${r.industry}</td>
                      <td>${r.rating}/10</td>
                      <td>${r.satisfaction}/10</td>
                      <td>${Array.isArray(r.recommendations) ? r.recommendations.join(', ') : r.recommendations}</td>
                      <td>${r.lastActivity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="footer">
                © ${new Date().getFullYear()} Adama Science and Technology University. Confidential Department Quality Assurance & Accreditation Report.
              </div>
            </body>
          </html>
        `);
        printWin.document.close();
        setTimeout(() => {
          printWin.print();
        }, 500);
      }
      toast.success('Generated ASTU Employer Feedback PDF Report!');
    } else if (option.id === 'csv-dataset' || option.id === 'excel-dataset') {
      let csvContent = 'Employer,Industry,Department,Overall Rating,Satisfaction,Recommendations,Last Activity\n';
      records.forEach((r: any) => {
        const recStr = Array.isArray(r.recommendations) ? r.recommendations.join('; ') : (r.recommendations || '');
        csvContent += `"${r.employer}","${r.industry}","${r.department}",${r.rating},${r.satisfaction},"${recStr.replace(/"/g, '""')}","${r.lastActivity}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ASTU_Employer_Feedback_${deptCodeStr}_${timeStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${departmentName} employer feedback dataset!`);
    } else if (option.id === 'json-telemetry') {
      const blob = new Blob([JSON.stringify(data || {}, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ASTU_Employer_Feedback_${deptCodeStr}_${timeStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Exported employer feedback JSON telemetry!');
    }
  };

  const handleExport = (option: EmployerExportOption) => {
    setSelectedOption(option.id);
    setIsExporting(true);

    setTimeout(() => {
      executeRealExport(option);
      onExport(option);
      setIsExporting(false);
      setSelectedOption(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200'}`}>
        {/* ASTU Branded Header */}
        <div className={`p-6 border-b flex justify-between items-start ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-gray-200 bg-slate-50'}`}>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white p-2 shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
              <img src="/images/astu-seal-logo.png" alt="ASTU Logo" className="h-full w-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">Export Employer Feedback</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-astu-navy/10 text-astu-navy dark:bg-blue-900/40 dark:text-blue-300">
                  ASTU Official
                </span>
              </div>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Export industry evaluation dataset & accreditation reports with official ASTU Seal branding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scope Lock Badge */}
        <div className={`px-6 py-3 border-b flex items-center justify-between text-xs ${darkMode ? 'border-slate-800 bg-slate-800/30' : 'border-gray-100 bg-blue-50/50'}`}>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-astu-navy dark:text-blue-400" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Department Scope:</span>
            <span className="font-bold text-astu-navy dark:text-blue-400">{departmentName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Single-Department Isolated Data</span>
          </div>
        </div>

        {/* Export Options */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option)}
                disabled={isExporting}
                className={`p-5 border rounded-xl text-left transition-all duration-300 hover:shadow-lg ${
                  selectedOption === option.id
                    ? darkMode ? 'border-blue-500 bg-blue-950/40' : 'border-astu-navy bg-astu-navy/5'
                    : darkMode ? 'border-slate-700 hover:border-blue-500/50 bg-slate-800/40' : 'border-gray-200 hover:border-astu-navy/50 bg-white'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    selectedOption === option.id
                      ? 'bg-astu-navy text-white'
                      : darkMode ? 'bg-slate-700 text-blue-400' : 'bg-gray-100 text-astu-navy'
                  }`}>
                    {getIcon(option.icon)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{option.title}</h4>
                    <p className={`text-xs mb-2.5 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{option.description}</p>
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                      option.format === 'pdf'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}>
                      {option.format.toUpperCase()}
                    </span>
                  </div>
                  {isExporting && selectedOption === option.id ? (
                    <Loader2 className="h-5 w-5 text-astu-navy dark:text-blue-400 animate-spin" />
                  ) : selectedOption === option.id ? (
                    <CheckCircle className="h-5 w-5 text-astu-green" />
                  ) : (
                    <Download className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t rounded-b-2xl flex justify-between items-center ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Includes official ASTU header logo, accreditation metrics & live DB records.
          </p>
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerFeedbackExport;
