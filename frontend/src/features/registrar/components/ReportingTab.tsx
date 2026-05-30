import React from 'react';
import toast from 'react-hot-toast';

export const ReportingTab: React.FC = () => {
  const handleExport = (format: 'PDF' | 'Excel' | 'Stata') => {
    toast.success(`Generating ${format} report...`, {
      icon: '📤',
      duration: 2800,
    });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Enhanced Hero Banner with Logo */}
      <section className="bg-gradient-to-br from-[#0A2540] via-[#002B5E] to-[#005C2B] rounded-3xl p-10 md:p-12 text-white shadow-2xl relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(at_30%_20%,rgba(0,200,83,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 bottom-0 w-80 h-80 bg-[#00C853]/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 relative z-10">
          {/* ASTU Logo */}
          <div className="flex-shrink-0">
            <img
              src="/astu-logo.png" 
              alt="Adama Science and Technology University Logo"
              className="w-28 h-28 md:w-36 md:h-36 drop-shadow-xl"
            />
          </div>

          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-md px-5 py-2 rounded-3xl text-xs font-bold tracking-[0.125em] border border-white/20">
              STUDENTS’ SKILL DEVELOPMENT COORDINATION OFFICE
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none">
              Institutional Reports &amp; Analytics
            </h1>
            
            <p className="text-lg max-w-2xl opacity-90">
              Real-time graduate tracking, batch performance analytics, and research-ready exports for 
              <span className="font-semibold text-[#00C853]"> Adama Science and Technology University</span>.
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button
              onClick={() => handleExport('PDF')}
              className="group flex-1 sm:flex-none flex items-center gap-3 bg-white text-[#0A2540] px-7 py-5 rounded-2xl font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">picture_as_pdf</span>
              <div>
                <div className="text-base">PDF Report</div>
                <div className="text-xs opacity-70">Executive Summary</div>
              </div>
            </button>

            <button
              onClick={() => handleExport('Excel')}
              className="group flex-1 sm:flex-none flex items-center gap-3 bg-white text-[#0A2540] px-7 py-5 rounded-2xl font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-3xl">table_chart</span>
              <div>
                <div className="text-base">Excel Sheet</div>
                <div className="text-xs opacity-70">Detailed Data</div>
              </div>
            </button>

            <button
              onClick={() => handleExport('Stata')}
              className="group flex-1 sm:flex-none flex items-center gap-3 bg-[#00C853] hover:bg-[#00B147] text-white px-7 py-5 rounded-2xl font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg ring-2 ring-white/30"
            >
              <span className="material-symbols-outlined text-3xl">analytics</span>
              <div>
                <div className="text-base">Stata (.dta)</div>
                <div className="text-xs opacity-90">Research Export</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Graduates Tracked", value: "2,847", change: "+184", trend: "↑" },
          { label: "Average CGPA", value: "3.41", change: "+0.12", trend: "↑" },
          { label: "Employment Rate", value: "78.4%", change: "+6.2%", trend: "↑" },
          { label: "National Research Exports", value: "1,203", change: "+231", trend: "↑" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-3xl p-7 hover:shadow-2xl transition-all group">
            <div className="text-sm text-gray-500 font-medium mb-1">{kpi.label}</div>
            <div className="text-4xl font-bold text-gray-900 mt-1 mb-3">{kpi.value}</div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
              {kpi.trend} {kpi.change} <span className="text-gray-400 text-xs font-normal">this year</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Department Performance - Wider Column */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Department Performance</h3>
              <p className="text-gray-500">Average CGPA by Engineering College • Batch 2024</p>
            </div>
            <div className="text-xs px-4 py-2 bg-gray-100 rounded-2xl font-medium">4 Departments</div>
          </div>

          <div className="space-y-7">
            {[
              { dept: "Computer Science and Engineering", gpa: "3.62", width: "93%", color: "#002B5E" },
              { dept: "Electrical and Computer Engineering", gpa: "3.48", width: "87%", color: "#005C2B" },
              { dept: "Mechanical and Vehicle Engineering", gpa: "3.31", width: "82%", color: "#00C853" },
              { dept: "Chemical Engineering", gpa: "3.18", width: "77%", color: "#FFB300" },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between mb-3 text-sm">
                  <span className="font-semibold text-gray-800 pr-4">{item.dept}</span>
                  <span className="font-bold text-[#002B5E]">{item.gpa}</span>
                </div>
                <div className="h-3.5 bg-gray-100 rounded-3xl overflow-hidden">
                  <div
                    className="h-full rounded-3xl transition-all duration-700 group-hover:brightness-110"
                    style={{ width: item.width, background: `linear-gradient(90deg, ${item.color}, #00C853)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employment Tracking */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col">
          <h3 className="text-2xl font-bold mb-2">Graduate Destination 2024</h3>
          <p className="text-gray-500 mb-8">Tracer Study Summary</p>

          <div className="space-y-4 flex-1">
            {[
              { status: "Employed Full-Time", count: "412", percent: "62%", color: "#00C853" },
              { status: "Pursuing MSc / PhD", count: "74", percent: "11%", color: "#002B5E" },
              { status: "Entrepreneurship", count: "32", percent: "5%", color: "#FFB300" },
              { status: "Still Seeking Placement", count: "142", percent: "22%", color: "#FF6B00" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-5 rounded-2xl transition-all">
                <div>
                  <p className="font-semibold">{item.status}</p>
                  <p className="text-xs text-gray-500">{item.count} graduates</p>
                </div>
                <div className="text-3xl font-bold px-6 py-3 rounded-2xl" style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                  {item.percent}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports & Quick Access */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold">Recent &amp; Quick Reports</h3>
          <button className="flex items-center gap-2 text-[#002B5E] hover:text-[#005C2B] font-medium text-sm">
            All Reports 
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "2024 Graduate Tracer Study Full Report", type: "PDF", date: "May 28, 2026", size: "8.4 MB" },
            { title: "College of Engineering Performance Dashboard", type: "Excel", date: "May 22, 2026", size: "4.1 MB" },
            { title: "National Research Dataset – Batch 2023-24", type: "Stata", date: "May 15, 2026", size: "12.7 MB" },
          ].map((report, i) => (
            <div key={i} className="border border-gray-200 hover:border-[#00C853] p-6 rounded-2xl transition-all group cursor-pointer">
              <div className="flex justify-between mb-4">
                <span className="uppercase text-[10px] font-bold tracking-widest bg-gray-100 px-3 py-1 rounded-xl">{report.type}</span>
                <span className="text-xs text-gray-400">{report.size}</span>
              </div>
              <p className="font-semibold leading-tight line-clamp-2 group-hover:text-[#002B5E] transition-colors">{report.title}</p>
              <p className="text-xs text-gray-500 mt-4">{report.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};