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

export const ReportingTab: React.FC = () => {
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

  return (
    <div className="space-y-6 pb-16">

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
              { label: 'Total Graduates Tracked', value: '2,847', change: '+184', trend: '↑' },
              { label: 'Average CGPA', value: '3.41', change: '+0.12', trend: '↑' },
              { label: 'Employment Rate', value: '78.4%', change: '+6.2%', trend: '↑' },
              { label: 'Data Exports Generated', value: '1,203', change: '+231', trend: '↑' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{kpi.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{kpi.value}</p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-2">
                  {kpi.trend} {kpi.change} <span className="text-gray-400 font-normal">this year</span>
                </div>
              </div>
            ))}
          </div>

          {/* Department Performance & Employment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-end mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Department Performance</h3>
                  <p className="text-xs text-gray-500">Average CGPA by Engineering College • Batch 2024</p>
                </div>
                <span className="text-[10px] px-3 py-1 bg-gray-100 rounded-lg font-bold text-gray-500">4 Departments</span>
              </div>
              <div className="space-y-5">
                {[
                  { dept: 'Computer Science and Engineering', gpa: '3.62', width: '93%', color: '#002B5E' },
                  { dept: 'Electrical and Computer Engineering', gpa: '3.48', width: '87%', color: '#005C2B' },
                  { dept: 'Mechanical and Vehicle Engineering', gpa: '3.31', width: '82%', color: '#00C853' },
                  { dept: 'Chemical Engineering', gpa: '3.18', width: '77%', color: '#FFB300' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1.5 text-xs">
                      <span className="font-semibold text-gray-800">{item.dept}</span>
                      <span className="font-bold text-astu-navy">{item.gpa}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: item.width, background: `linear-gradient(90deg, ${item.color}, #00C853)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-bold mb-1">Graduate Destination 2024</h3>
              <p className="text-xs text-gray-500 mb-5">Tracer Study Summary</p>
              <div className="space-y-3">
                {[
                  { status: 'Employed Full-Time', count: '412', percent: '62%', color: '#00C853' },
                  { status: 'Pursuing MSc / PhD', count: '74', percent: '11%', color: '#002B5E' },
                  { status: 'Entrepreneurship', count: '32', percent: '5%', color: '#FFB300' },
                  { status: 'Still Seeking Placement', count: '142', percent: '22%', color: '#FF6B00' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-all">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.status}</p>
                      <p className="text-[10px] text-gray-500">{item.count} graduates</p>
                    </div>
                    <div className="text-2xl font-extrabold px-5 py-2 rounded-xl" style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                      {item.percent}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Recent Reports & Quick Access</h3>
              <button className="text-xs font-bold text-astu-navy hover:text-astu-navy/70 transition-all flex items-center gap-1">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[].map((report: any, i: number) => (
                <div key={i} onClick={() => handleDownload(report.title)}
                  className="border border-gray-200 hover:border-emerald-400 p-5 rounded-xl transition-all group cursor-pointer hover:shadow-md">
                  <div className="flex justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-lg">{report.type}</span>
                    <span className="text-xs text-gray-400">{report.size}</span>
                  </div>
                  <p className="text-sm font-semibold leading-tight group-hover:text-astu-navy transition-colors">{report.title}</p>
                  <p className="text-xs text-gray-400 mt-3">{report.date}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Export Center Tab */}
      {activeReportTab === 'exports' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Export Center</h3>
            <p className="text-xs text-gray-500 mb-6">Generate and download reports in your preferred format for analysis, accreditation, and archival.</p>
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
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-navy">history</span>
              Recent Exports
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pr-2">Report Name</th>
                    <th className="pb-3 pr-2">Format</th>
                    <th className="pb-3 pr-2">Exported By</th>
                    <th className="pb-3 pr-2">Date</th>
                    <th className="pb-3">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[].map((exp: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-3 pr-2 font-medium text-gray-800">{exp.name}</td>
                      <td className="py-3 pr-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">{exp.format}</span>
                      </td>
                      <td className="py-3 pr-2 text-gray-500">{exp.by}</td>
                      <td className="py-3 pr-2 text-gray-500">{exp.date}</td>
                      <td className="py-3 text-gray-400">{exp.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeReportTab === 'scheduled' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Scheduled Reports</h3>
              <p className="text-xs text-gray-500">Automate recurring report generation for stakeholders.</p>
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
                <tr className="text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 pr-2">Report Title</th>
                  <th className="pb-3 pr-2">Format</th>
                  <th className="pb-3 pr-2">Schedule</th>
                  <th className="pb-3 pr-2">Next Run</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {scheduledReports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50/50">
                    <td className="py-3 pr-2 font-medium text-gray-800">{report.title}</td>
                    <td className="py-3 pr-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">{report.format}</span>
                    </td>
                    <td className="py-3 pr-2 text-gray-500">{report.schedule}</td>
                    <td className="py-3 pr-2 text-gray-500">{report.nextRun}</td>
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
          </div>
        </div>
      )}

      {/* Accreditation Tab */}
      {activeReportTab === 'accreditation' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-amber-600">verified</span>
              <div>
                <h3 className="text-lg font-bold text-amber-900">Accreditation-Ready Reports</h3>
                <p className="text-sm text-amber-700 mt-1">All reports follow ABET and HERQA accreditation standards. Data is structured for institutional audit compliance.</p>
                <div className="mt-4 flex gap-3">
                  {['ABET Compliance Report', 'HERQA Self-Study', 'Program Review'].map((r, i) => (
                    <button key={i} onClick={() => handleExport('PDF', r)}
                      className="px-4 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-50 transition-all shadow-sm">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Curriculum Alignment', value: '94%', status: 'On Track', icon: 'school' },
              { label: 'Graduate Attribute Assessment', value: '87%', status: 'In Progress', icon: 'assessment' },
              { label: 'Continuous Improvement Docs', value: '12', status: 'Up to Date', icon: 'description' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <span className="material-symbols-outlined text-astu-navy text-2xl">{item.icon}</span>
                <p className="text-xs font-bold text-gray-500 mt-3 uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{item.value}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  item.status === 'On Track' || item.status === 'Up to Date' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
