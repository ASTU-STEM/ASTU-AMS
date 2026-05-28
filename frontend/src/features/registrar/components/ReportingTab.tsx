import React from 'react';
import toast from 'react-hot-toast';

export const ReportingTab: React.FC = () => {
  
  const handleExport = (format: 'PDF' | 'Excel' | 'Stata') => {
    toast.success(`Generating report export. Downloading "${format}" file...`);
  };

  return (
    <div className="space-y-8">
      
      {/* Reporting Hero banner */}
      <section className="bg-gradient-to-r from-emerald-950 via-teal-950 to-astu-navy rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Institutional Reports & Analytics 📊</h2>
        <p className="text-sm opacity-90 leading-relaxed mt-2">
          Compile graduate tracking summaries, batch performance averages, and export Stata-ready files for national research studies.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => handleExport('PDF')}
            className="px-5 py-2.5 bg-white text-astu-navy text-xs font-bold rounded-xl hover:scale-105 transition-all shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Export PDF Report
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="px-5 py-2.5 bg-white text-astu-navy text-xs font-bold rounded-xl hover:scale-105 transition-all shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            Export Excel Sheet
          </button>
          <button
            onClick={() => handleExport('Stata')}
            className="px-5 py-2.5 bg-astu-green text-white text-xs font-bold rounded-xl hover:scale-105 transition-all shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">analytics</span>
            Export Stata-Ready Data (.dta)
          </button>
        </div>
      </section>

      {/* Analytics grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Department performance analysis */}
        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Graduates Batch Performance Analysis</h3>
          <p className="text-xs text-gray-500">Average CGPA records compared by engineering departments</p>

          <div className="space-y-4 pt-2">
            {[
              { dept: 'Computer Science and Engineering (CSE)', gpa: '3.62', width: '90%' },
              { dept: 'Electrical and Computer Engineering (ECE)', gpa: '3.48', width: '85%' },
              { dept: 'Chemical Engineering (ChE)', gpa: '3.12', width: '75%' },
              { dept: 'Mechanical and Vehicle Engineering (MVE)', gpa: '3.25', width: '80%' }
            ].map((item) => (
              <div key={item.dept} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.dept}</span>
                  <span className="text-astu-navy font-bold">{item.gpa} avg</span>
                </div>
                <div className="w-full bg-gray-150 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-astu-navy h-full rounded-full" 
                    style={{ width: item.width }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graduate Tracking Reports */}
        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Employment Status Tracking Reports</h3>
          <p className="text-xs text-gray-500">Longitudinal tracer study summary metrics for the Class of 2024</p>

          <div className="space-y-3 pt-2">
            {[
              { status: 'Employed Full-Time', count: '412 graduates', percent: '62%' },
              { status: 'Pursuing Post-Graduate (MSc/PhD)', count: '74 graduates', percent: '11%' },
              { status: 'Entrepreneurship / Startup Founders', count: '32 graduates', percent: '5%' },
              { status: 'Still Seeking Placement', count: '142 graduates', percent: '22%' }
            ].map(track => (
              <div key={track.status} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-gray-900">{track.status}</p>
                  <p className="text-[10px] text-gray-500 font-semibold">{track.count}</p>
                </div>
                <span className="px-2.5 py-0.5 bg-astu-green/10 text-astu-green font-extrabold text-xs rounded">
                  {track.percent}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
