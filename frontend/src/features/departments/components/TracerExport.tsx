import React, { useState } from 'react';
import { FileText, Table, Download, X, CheckCircle, Loader2 } from 'lucide-react';
import { TracerExportOption } from '../types/tracer.types';

interface TracerExportProps {
  onExport: (option: TracerExportOption) => void;
  onClose: () => void;
  darkMode?: boolean;
}

export const TracerExport: React.FC<TracerExportProps> = ({ onExport, onClose, darkMode = false }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions: TracerExportOption[] = [
    {
      id: 'tracer-summary',
      title: 'Tracer Summary PDF',
      format: 'pdf',
      icon: 'FileText',
      description: 'Comprehensive tracer study summary with all key metrics and charts'
    },
    {
      id: 'tracer-excel',
      title: 'Tracer Excel Report',
      format: 'excel',
      icon: 'Table',
      description: 'Detailed tracer data in Excel format for further analysis'
    },
    {
      id: 'accreditation-dataset',
      title: 'Accreditation Dataset',
      format: 'excel',
      icon: 'Table',
      description: 'Accreditation-ready dataset with all required metrics'
    },
    {
      id: 'department-summary',
      title: 'Department Summary Report',
      format: 'pdf',
      icon: 'FileText',
      description: 'Department-specific tracer summary for internal review'
    }
  ];

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'FileText': FileText,
      'Table': Table,
    };
    const Icon = iconMap[iconName] || FileText;
    return <Icon className="h-6 w-6" />;
  };

  const handleExport = (option: TracerExportOption) => {
    setSelectedOption(option.id);
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      onExport(option);
      setIsExporting(false);
      setSelectedOption(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-center ${darkMode ? 'border-slate-700' : 'border-gray-200/60'}`}>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Export Tracer Reports</h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select the report format and type you want to export</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
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
                    ? 'border-astu-navy bg-astu-navy/5'
                    : darkMode ? 'border-slate-600 hover:border-astu-navy/50' : 'border-gray-200 hover:border-astu-navy/50'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    selectedOption === option.id
                      ? 'bg-astu-navy text-white'
                      : darkMode ? 'bg-slate-700 text-astu-navy' : 'bg-gray-100 text-astu-navy'
                  }`}>
                    {getIcon(option.icon)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{option.title}</h4>
                    <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{option.description}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      option.format === 'pdf'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {option.format.toUpperCase()}
                    </span>
                  </div>
                  {isExporting && selectedOption === option.id ? (
                    <Loader2 className="h-5 w-5 text-astu-navy animate-spin" />
                  ) : selectedOption === option.id ? (
                    <CheckCircle className="h-5 w-5 text-astu-green" />
                  ) : (
                    <Download className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t rounded-b-2xl ${darkMode ? 'border-slate-700 bg-slate-700' : 'border-gray-200/60 bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Reports are generated based on current filter settings
            </p>
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${darkMode ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TracerExport;
