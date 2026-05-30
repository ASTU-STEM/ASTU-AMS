import React from 'react';

interface AnalyticsTabProps {
  darkMode: boolean;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ darkMode }) => {
  return (
    <div className="space-y-8">
      
      {/* Analytics Hero Banner */}
      <section className="bg-gradient-to-r from-indigo-950 via-slate-900 to-astu-navy rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Hiring Analytics & Benchmarking Engine<span className="material-symbols-outlined align-middle ml-2">analytics</span></h2>
        <p className="text-sm opacity-90 leading-relaxed mt-2">
          Review employment benchmarks, salary packages comparisons across regions, skill gap indicators, and average time-to-hire metrics.
        </p>
      </section>

      {/* Analytics stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Avg. Time-to-Hire', value: '18 Days', desc: 'College platform applications to interview offer', trend: 'Fastest in region' },
          { label: 'Salary Benchmarking', value: '75,000 ETB', desc: 'Average entry package for CSE graduates', trend: '+12% YoY growth' },
          { label: 'Shortlist Conversion', value: '26.8%', desc: 'Proportion of applications passing early review', trend: 'Optimal matching' }
        ].map((item, idx) => (
          <div 
            key={idx}
            className={`p-6 border rounded-3xl shadow-sm hover:shadow-md transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
            }`}
          >
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
            <p className="text-3xl font-extrabold text-astu-navy mt-2">{item.value}</p>
            <p className="text-xs text-gray-500 mt-2">{item.desc}</p>
            <span className="text-[10px] font-bold text-astu-green bg-astu-green/10 px-2 py-0.5 rounded mt-3 inline-block">
              {item.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Main Grid: Industry Mapping & Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Industry Mapping */}
        <div className={`p-6 border rounded-3xl shadow-sm ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60'
        }`}>
          <h3 className="text-lg font-bold mb-4">ASTU Graduate Placement by Industry</h3>
          
          <div className="space-y-4 pt-2">
            {[
              { industry: 'FinTech / Digital Payments', percent: '42%' },
              { industry: 'Telecommunications', percent: '28%' },
              { industry: 'Software Houses', percent: '18%' },
              { industry: 'Government Labs / Research', percent: '12%' }
            ].map(ind => (
              <div key={ind.industry} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{ind.industry}</span>
                  <span>{ind.percent}</span>
                </div>
                <div className="w-full bg-gray-150 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-astu-navy h-full rounded-full"
                    style={{ width: ind.percent }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gap Detection */}
        <div className={`p-6 border rounded-3xl shadow-sm ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60'
        }`}>
          <h3 className="text-lg font-bold mb-4">Hired Graduates Skill Gaps & Deficiencies</h3>
          
          <div className="space-y-4 pt-2">
            {[
              { gap: 'Cloud Services (AWS, Docker, K8s)', score: 'High deficiency (62%)' },
              { gap: 'Modern DevOps / Git Workflows', score: 'Medium deficiency (44%)' },
              { gap: 'Agile & Product Roadmaps', score: 'Low deficiency (21%)' },
              { gap: 'System Design Architecture', score: 'Medium deficiency (38%)' }
            ].map(gap => (
              <div key={gap.gap} className="flex justify-between items-center p-3 bg-gray-50/5 border border-gray-100/5 rounded-2xl">
                <div>
                  <p className="text-xs font-bold">{gap.gap}</p>
                  <p className="text-[10px] text-gray-500 font-medium">From employer structured feedback reviews</p>
                </div>
                <span className="px-2 py-0.5 bg-red-100 text-astu-red font-bold text-[10px] rounded">
                  {gap.score}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
