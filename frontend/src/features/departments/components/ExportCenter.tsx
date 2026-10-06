import React, { useState, useEffect } from 'react';
import { FileText, Table, Download, Building2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { departmentService } from '../services/department.service';
import { ExportReport } from '../types/department.types';

interface ExportCenterProps {
  reports?: ExportReport[];
  darkMode?: boolean;
}

export const ExportCenter: React.FC<ExportCenterProps> = ({ reports: propReports, darkMode = false }) => {
  const { user } = useAuth();
  const isSuperOrAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  
  // Department state - default to logged in user department or Software Engineering
  const [selectedDept, setSelectedDept] = useState<string>(user?.department || 'Software Engineering');
  const [activeDeptName, setActiveDeptName] = useState<string>(user?.department || 'Software Engineering');
  const [reports, setReports] = useState<ExportReport[]>(propReports || []);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');

  const astuDepartments = [
    { code: 'SWE', name: 'Software Engineering' },
    { code: 'COM', name: 'Computer Science' },
    { code: 'ECE', name: 'Electrical and Computer Engineering' },
    { code: 'MEG', name: 'Mechanical Engineering' },
    { code: 'CVE', name: 'Civil Engineering' },
    { code: 'CHE', name: 'Chemical Engineering' },
    { code: 'GEO', name: 'Applied Geology' },
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const overview = await departmentService.getOverview({ department: selectedDept });
        
        const deptName = overview?.department?.name || selectedDept;
        setActiveDeptName(deptName);

        if (overview?.exportReports && overview.exportReports.length > 0) {
          setReports(overview.exportReports);
        } else {
          // Dynamic department-based report registry generated from backend overview
          setReports([
            { title: `${deptName} Employment Analytics Report`, format: 'PDF / XLSX / CSV / JSON', color: 'astu-navy', icon: 'FileText', reportType: 'employment-analytics' },
            { title: `${deptName} Tracer Study & Longitudinal Report`, format: 'PDF / XLSX / CSV / JSON', color: 'emerald-600', icon: 'Table', reportType: 'tracer-reports' },
            { title: `${deptName} Employer Feedback & Competency Report`, format: 'PDF / XLSX / CSV / JSON', color: 'blue-600', icon: 'FileText', reportType: 'employer-feedback' },
            { title: `${deptName} Skill Gap & Industry Demand Report`, format: 'PDF / XLSX / CSV / JSON', color: 'purple-600', icon: 'Table', reportType: 'skill-gap' },
            { title: `${deptName} Curriculum Insights & Alignment Report`, format: 'PDF / XLSX / CSV / JSON', color: 'amber-600', icon: 'FileText', reportType: 'curriculum' },
            { title: `${deptName} Accreditation Evidence Audit Report`, format: 'PDF / XLSX / CSV / JSON', color: 'rose-600', icon: 'Table', reportType: 'accreditation' },
          ]);
        }
      } catch (e) {
        console.error('Failed to fetch export reports list:', e);
        toast.error('Failed to load department export registry');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedDept]);

  const handleDownload = async (report: any) => {
    toast.promise(
      departmentService.downloadReport({
        format: selectedFormat,
        department: selectedDept,
        reportType: report.reportType || 'tracer-reports'
      }),
      {
        loading: `Generating ${report.title} in ${selectedFormat.toUpperCase()} format...`,
        success: `${report.title} exported successfully!`,
        error: 'Failed to generate report'
      }
    );
  };

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
        
        {/* Header & Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Export Executive Reports</h3>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-astu-navy/10 text-astu-navy border border-astu-navy/20">
                <Building2 className="h-3.5 w-3.5" />
                {activeDeptName} Scope
              </span>
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Download accreditation-ready PDF documents, Excel spreadsheets, CSV data pipelines, or REST JSON payloads from database telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Department:</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-astu-navy/40 transition-all ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {astuDepartments.map(d => (
                  <option key={d.code} value={d.name}>
                    {d.name} {user?.department === d.name ? '(Assigned)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Format Selector */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-2xl border border-slate-200/80 dark:border-slate-600">
              {(['pdf', 'excel', 'csv', 'json'] as const).map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all ${
                    selectedFormat === fmt
                      ? 'bg-astu-navy text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-600'
                  }`}
                >
                  {fmt === 'excel' ? 'XLSX' : fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Loading or Cards Grid */}
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-astu-navy animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Querying database export registry for {selectedDept}...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report: any, idx) => (
              <div
                key={idx}
                onClick={() => handleDownload(report)}
                className={`p-6 border rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between ${
                  darkMode ? 'bg-slate-700 border-slate-600 hover:border-slate-500' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/80 hover:border-astu-navy/40'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-astu-navy/10 flex items-center justify-center mb-4 text-astu-navy group-hover:bg-astu-navy group-hover:text-white transition-all">
                    {getIconComponent(report.icon || 'FileText')}
                  </div>
                  <h4 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.title}</h4>
                  <p className="text-xs text-slate-500 mb-4">Official {activeDeptName} accreditation export document formatted dynamically from database telemetry.</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-600/60">
                  <span className="text-xs font-extrabold uppercase text-astu-navy dark:text-blue-400">{selectedFormat.toUpperCase()} FORMAT</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-astu-navy">
                    <span>Export</span>
                    <Download className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExportCenter;
