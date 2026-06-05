import React, { useState } from 'react';
import { FileText, Table, Download, X, CheckCircle, Loader2 } from 'lucide-react';
import { AccreditationExportOption } from '../types/accreditation.types';

interface AccreditationExportProps {
  onExport: (option: AccreditationExportOption) => void;
  onClose: () => void;
}

export const AccreditationExport: React.FC<AccreditationExportProps> = ({ onExport, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions: AccreditationExportOption[] = [
    {
      id: 'accreditation-pack',
      title: 'PDF Accreditation Pack',
      format: 'pdf',
      icon: 'FileText',
      description: 'Complete accreditation evidence pack for ETA/HERQA submission'
    },
    {
      id: 'evidence-matrix',
      title: 'Excel Evidence Matrix',
      format: 'excel',
      icon: 'Table',
      description: 'Detailed evidence matrix with all compliance items'
    },
    {
      id: 'compliance-summary',
      title: 'Compliance Summary Report',
      format: 'pdf',
      icon: 'FileText',
      description: 'Executive summary of compliance status'
    },
    {
      id: 'department-performance',
      title: 'Department Performance Report',
      format: 'excel',
      icon: 'Table',
      description: 'Department-wise performance and accreditation metrics'
    },
    {
      id: 'employability-report',
      title: 'Graduate Employability Report',
      format: 'pdf',
      icon: 'FileText',
      description: 'Comprehensive graduate employability analysis'
    },
    {
      id: 'executive-presentation',
      title: 'Executive Presentation Pack',
      format: 'pdf',
      icon: 'FileText',
      description: 'Presentation-ready executive summary and insights'
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

  const handleExport = (option: AccreditationExportOption) => {
    setSelectedOption(option.id);
    setIsExporting(true);
    
    setTimeout(() => {
      onExport(option);
      setIsExporting(false);
      setSelectedOption(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/60 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Export Accreditation Reports</h3>
            <p className="text-sm text-gray-600 mt-1">Select the report format and type you want to export</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
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
                    : 'border-gray-200 hover:border-astu-navy/50'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    selectedOption === option.id
                      ? 'bg-astu-navy text-white'
                      : 'bg-gray-100 text-astu-navy'
                  }`}>
                    {getIcon(option.icon)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{option.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{option.description}</p>
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
                    <Download className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/60 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Reports are generated based on current filter settings
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all duration-300 font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccreditationExport;
