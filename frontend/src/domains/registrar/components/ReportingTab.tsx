import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface ScheduledReport {
  id: number;
  title: string;
  format: string;
  schedule: string;
  nextRun: string;
  status: 'Active' | 'Paused' | 'Completed';
}

interface ReportingTabProps {
  darkMode?: boolean;
}

export const ReportingTab: React.FC<ReportingTabProps> = ({ darkMode }) => {
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'exports' | 'scheduled' | 'accreditation'>('overview');
  const [scheduledReports] = useState<ScheduledReport[]>([]);

  const handleExport = (format: 'PDF' | 'Excel' | 'Stata' | 'CSV', scope: string) => {
    toast.success(`Generating ${format} report: ${scope}`, { duration: 2800 });
  };

  const handleScheduleReport = () => {
    toast.success('Report scheduled successfully!', { duration: 2000 });
  };

  const handleDownload = (title: string) => {
    toast.success(`Downloading: ${title}`, { icon: '📥', duration: 2000 });
  };

  const cardClass = `rounded-2xl p-5 shadow-sm border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`;
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-gray-500';
  const textTertiary = darkMode ? 'text-slate-500' : 'text-gray-400';
  const labelClass = `text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`;

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#0A2540] via-[#002B5E] to-[#005C2B] rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_30%_20%,rgba(0,200,83,0.15)_0%,transparent_50%)]" />
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">Students' Skill Development Coordination Office</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Institutional Reports & Analytics</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">Real-time graduate tracking, batch performance analytics, and accreditation-ready exports for ASTU.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['overview', 'exports', 'scheduled', 'accreditation'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveReportTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeReportTab === tab ? 'bg-white text-astu-navy shadow-md' : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                }`}>
                {tab === 'overview' ? 'Overview' : tab === 'exports' ? 'Export Center' : tab === 'scheduled' ? 'Scheduled Reports' : 'Accreditation'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Tab */}
      {activeReportTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Graduates Tracked', value: '-', change: '', trend: '' },
              { label: 'Average CGPA', value: '-', change: '', trend: '' },
              { label: 'Employment Rate', value: '-', change: '', trend: '' },
              { label: 'Data Exports Generated', value: '-', change: '', trend: '' },
            ].map((kpi, i) => (
              <div key={i} className={cardClass}>
                <p className={labelClass}>{kpi.label}</p>
                <p className={`text-3xl font-extrabold mt-1 ${textPrimary}`}>{kpi.value}</p>
                {kpi.trend && (
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-2">
                    {kpi.trend} {kpi.change} <span className={textTertiary}>this year</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Department Performance & Employment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className={`lg:col-span-7 ${cardClass}`}>
              <div className="flex justify-between items-end mb-5">
                <div>
                  <h3 className={`text-lg font-bold ${textPrimary}`}>Department Performance</h3>
                  <p className={`text-xs ${textSecondary}`}>Average CGPA by Engineering College</p>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-lg font-bold ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>No data</span>
              </div>
              <div className={`flex items-center justify-center h-40 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                <p className="text-sm">Upload graduate data to see department performance</p>
              </div>
            </div>

            <div className={`lg:col-span-5 ${cardClass}`}>
              <h3 className={`text-lg font-bold mb-1 ${textPrimary}`}>Graduate Destination</h3>
              <p className={`text-xs ${textSecondary} mb-5`}>Tracer Study Summary</p>
              <div className={`flex items-center justify-center h-40 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                <p className="text-sm">Survey responses will appear here</p>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${textPrimary}`}>Recent Reports & Quick Access</h3>
              <button className={`text-xs font-bold transition-all flex items-center gap-1 ${darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-astu-navy hover:text-astu-navy/70'}`}>
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([] as any[]).map((report: any, i: number) => (
                <div key={i} onClick={() => handleDownload(report.title)}
                  className={`border rounded-xl p-5 transition-all group cursor-pointer hover:shadow-md ${darkMode ? 'border-slate-800 hover:border-emerald-700' : 'border-gray-200 hover:border-emerald-400'}`}>
                  <div className="flex justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{report.type}</span>
                    <span className={`text-xs ${textTertiary}`}>{report.size}</span>
                  </div>
                  <p className={`text-sm font-semibold leading-tight group-hover:text-emerald-500 transition-colors ${textPrimary}`}>{report.title}</p>
                  <p className={`text-xs mt-3 ${textTertiary}`}>{report.date}</p>
                </div>
              ))}
              <div className={`flex items-center justify-center h-32 col-span-full ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                <p className="text-sm">No reports generated yet</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Export Center Tab */}
      {activeReportTab === 'exports' && (
        <div className="space-y-4">
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-1 ${textPrimary}`}>Export Center</h3>
            <p className={`text-xs ${textSecondary} mb-6`}>Generate and download reports in your preferred format for analysis, accreditation, and archival.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { format: 'PDF', icon: 'picture_as_pdf', desc: 'Executive Summary', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', action: () => handleExport('PDF', 'Graduate Tracer Report') },
                { format: 'Excel', icon: 'table_chart', desc: 'Detailed Data Tables', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', action: () => handleExport('Excel', 'Full Graduate Dataset') },
                { format: 'Stata', icon: 'analytics', desc: 'Research (.dta)', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', action: () => handleExport('Stata', 'Research Dataset') },
                { format: 'CSV', icon: 'data_array', desc: 'Universal Format', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', action: () => handleExport('CSV', 'Raw Graduate Data') },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  className={`${item.bg} ${item.border} border rounded-2xl p-5 text-center hover:shadow-md transition-all group hover:scale-[1.02]`}>
                  <span className={`material-symbols-outlined text-3xl ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                  <p className={`text-lg font-extrabold ${item.color} mt-2`}>{item.format}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export History */}
          <div className={cardClass}>
            <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-astu-navy">history</span>
              Recent Exports
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`font-bold uppercase tracking-wider border-b ${darkMode ? 'text-slate-400 border-slate-800' : 'text-gray-500 border-gray-100'}`}>
                    <th className="pb-3 pr-2">Report Name</th>
                    <th className="pb-3 pr-2">Format</th>
                    <th className="pb-3 pr-2">Exported By</th>
                    <th className="pb-3 pr-2">Date</th>
                    <th className="pb-3">Size</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-gray-50'}`}>
                  {([] as any[]).map((exp: any, i: number) => (
                    <tr key={i} className={`${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50/50'}`}>
                      <td className={`py-3 pr-2 font-medium ${textPrimary}`}>{exp.name}</td>
                      <td className="py-3 pr-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'}`}>{exp.format}</span>
                      </td>
                      <td className={`py-3 pr-2 ${textSecondary}`}>{exp.by}</td>
                      <td className={`py-3 pr-2 ${textSecondary}`}>{exp.date}</td>
                      <td className={`py-3 ${textTertiary}`}>{exp.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={`flex items-center justify-center h-20 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                <p className="text-sm">No exports yet</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeReportTab === 'scheduled' && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>Scheduled Reports</h3>
              <p className={`text-xs ${textSecondary}`}>Automate recurring report generation for stakeholders.</p>
            </div>
            <button onClick={handleScheduleReport}
              className="px-5 py-2.5 bg-astu-navy text-white text-xs font-bold rounded-xl hover:bg-astu-navy/90 transition-all shadow-md flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">add</span>
              New Schedule
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`font-bold uppercase tracking-wider border-b ${darkMode ? 'text-slate-400 border-slate-800' : 'text-gray-500 border-gray-100'}`}>
                  <th className="pb-3 pr-2">Report Title</th>
                  <th className="pb-3 pr-2">Format</th>
                  <th className="pb-3 pr-2">Schedule</th>
                  <th className="pb-3 pr-2">Next Run</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-gray-50'}`}>
                {scheduledReports.map(report => (
                  <tr key={report.id} className={`${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50/50'}`}>
                    <td className={`py-3 pr-2 font-medium ${textPrimary}`}>{report.title}</td>
                    <td className="py-3 pr-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'}`}>{report.format}</span>
                    </td>
                    <td className={`py-3 pr-2 ${textSecondary}`}>{report.schedule}</td>
                    <td className={`py-3 pr-2 ${textSecondary}`}>{report.nextRun}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        report.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        report.status === 'Paused' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>{report.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={`flex items-center justify-center h-20 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              <p className="text-sm">No scheduled reports</p>
            </div>
          </div>
        </div>
      )}

      {/* Accreditation Tab */}
      {activeReportTab === 'accreditation' && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-700/40' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'}`}>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-amber-600">verified</span>
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>Accreditation-Ready Reports</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>All reports follow ABET and HERQA accreditation standards. Data is structured for institutional audit compliance.</p>
                <div className="mt-4 flex gap-3">
                  {['ABET Compliance Report', 'HERQA Self-Study', 'Program Review'].map((r, i) => (
                    <button key={i} onClick={() => handleExport('PDF', r)}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${darkMode ? 'bg-slate-800 border-amber-700 text-amber-300 hover:bg-slate-700' : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Curriculum Alignment', value: '-', status: 'Awaiting Data', icon: 'school' },
              { label: 'Graduate Attribute Assessment', value: '-', status: 'Awaiting Data', icon: 'assessment' },
              { label: 'Continuous Improvement Docs', value: '-', status: 'Awaiting Data', icon: 'description' },
            ].map((item, i) => (
              <div key={i} className={cardClass}>
                <span className="material-symbols-outlined text-astu-navy text-2xl">{item.icon}</span>
                <p className={`${labelClass} mt-3`}>{item.label}</p>
                <p className={`text-2xl font-extrabold mt-1 ${textPrimary}`}>{item.value}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
