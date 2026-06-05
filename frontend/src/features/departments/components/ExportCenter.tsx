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
    <div className="space-y-8">
      <section className={`rounded-3xl p-8 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
        <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Export Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, idx) => (
            <div key={idx} className={`p-6 border rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
              <div className={`w-12 h-12 rounded-xl bg-${report.color}/10 flex items-center justify-center mb-4`}>
                <span className={`text-${report.color}`}>
                  {getIconComponent(report.icon)}
                </span>
              </div>
              <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.title}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{report.format}</span>
                <Download className={`text-sm h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExportCenter;
