import React from 'react';
import { FileText, Table, Download } from 'lucide-react';
import { ExportReport } from '../types/department.types';

interface ExportCenterProps {
  reports: ExportReport[];
  darkMode?: boolean;
}

export const ExportCenter: React.FC<ExportCenterProps> = ({ reports, darkMode = false }) => {
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'FileText': FileText,
      'Table': Table,
    };
    const Icon = iconMap[iconName] || FileText;
    return <Icon className="text-2xl" />;
  };

  return (
    <div className="space-y-6">
      <section className={`rounded-2xl p-6 border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="mb-6">
          <h3 className="text-xl font-extrabold tracking-tight">Export Academic Reports</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">Download accreditation-ready PDF packages, survey response sheets, and structured curriculum logs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, idx) => {
            const formatColor = report.format === 'PDF' 
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              : report.format === 'XLSX' || report.format === 'Excel'
              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              : 'bg-blue-500/10 text-blue-500 border-blue-500/20';

            return (
              <div key={idx} className={`p-6 border rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer dept-glass-card group flex flex-col justify-between h-48 ${darkMode ? 'border-slate-800 bg-slate-900/40 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                      report.color === 'astu-green' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      report.color === 'astu-navy' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      report.color === 'astu-red' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                      'bg-slate-500/10 border-slate-500/20 text-slate-500'
                    }`}>
                      {getIconComponent(report.icon)}
                    </div>
                    <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded border ${formatColor}`}>
                      {report.format}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold tracking-tight line-clamp-2">{report.title}</h4>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200/5 dark:border-white/5 pt-4 mt-3">
                  <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-300 transition-colors">Click to download</span>
                  <div className="p-1 rounded bg-slate-500/5 group-hover:bg-slate-500/10 border border-transparent group-hover:border-gray-200/10 transition-all">
                    <Download className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ExportCenter;
