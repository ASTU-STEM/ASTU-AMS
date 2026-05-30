import React from 'react';
import { TrendingUp, School, FileCheck, Download } from 'lucide-react';
import { DepartmentMetric } from '../types/department.types';

interface DepartmentOverviewProps {
  stats: DepartmentMetric[];
  onNavigateToSection: (section: string) => void;
}

export const DepartmentOverview: React.FC<DepartmentOverviewProps> = ({ stats, onNavigateToSection }) => {
  return (
    <>
      {/* Welcome Banner */}
      <section className="relative bg-gradient-to-r from-astu-navy via-blue-800 to-blue-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-astu-red/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Department Analytics</h2>
            <p className="text-lg opacity-95 leading-relaxed">Track graduate outcomes, monitor program effectiveness, and improve curriculum based on alumni feedback and industry trends.</p>
          </div>
          <button className="bg-gradient-to-r from-astu-red to-red-600 hover:from-astu-red hover:to-red-700 px-10 py-4 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>
      </section>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: 'TrendingUp', title: 'Employment Analytics', desc: 'Track program performance and outcomes', color: 'astu-navy', section: 'employment-analytics' },
          { icon: 'School', title: 'Skill Gap Analysis', desc: 'Identify curriculum gaps and improvements', color: 'astu-red', section: 'skill-gap' },
          { icon: 'FileCheck', title: 'Tracer Reports', desc: 'View longitudinal graduate tracking data', color: 'astu-green', section: 'tracer-reports' }
        ].map((action, idx) => (
          <div
            key={idx}
            onClick={() => onNavigateToSection(action.section)}
            className="group p-8 bg-white border border-gray-200/60 rounded-2xl hover:shadow-lg hover:border-astu-navy/30 transition-all duration-300 cursor-pointer text-center"
          >
            <div className={`mx-auto w-16 h-16 rounded-2xl bg-${action.color}/10 flex items-center justify-center mb-6 group-hover:bg-${action.color}/20 transition-colors`}>
              {action.icon === 'TrendingUp' && <TrendingUp className={`text-3xl text-${action.color}`} />}
              {action.icon === 'School' && <School className={`text-3xl text-${action.color}`} />}
              {action.icon === 'FileCheck' && <FileCheck className={`text-3xl text-${action.color}`} />}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.desc}</p>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Top Employer Sectors',
            items: ['Technology (42%)', 'Finance (28%)', 'Manufacturing (15%)'],
            icon: 'TrendingUp',
            color: 'astu-navy'
          },
          {
            title: 'Skills Gap Analysis',
            items: ['Data Science', 'Cloud Computing', 'AI/ML'],
            icon: 'School',
            color: 'astu-red'
          },
          {
            title: 'Student Satisfaction',
            items: ['Curriculum: 4.6/5', 'Teaching: 4.7/5', 'Facilities: 4.4/5'],
            icon: 'FileCheck',
            color: 'astu-green'
          }
        ].map((insight, idx) => (
          <section key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl bg-${insight.color}/10 flex items-center justify-center`}>
                {insight.icon === 'TrendingUp' && <TrendingUp className={`text-xl text-${insight.color}`} />}
                {insight.icon === 'School' && <School className={`text-xl text-${insight.color}`} />}
                {insight.icon === 'FileCheck' && <FileCheck className={`text-xl text-${insight.color}`} />}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{insight.title}</h3>
            </div>
            <div className="space-y-3">
              {insight.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200/60 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <p className={`text-sm font-semibold text-${insight.color}`}>{item}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Performance Metrics */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Program Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-2xl">
            <p className="text-sm text-gray-600 font-medium mb-3">Curriculum Alignment</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700 font-semibold">Industry-Ready Skills</span>
                <span className="text-astu-green font-bold">89%</span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-astu-green to-emerald-400 h-full rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-2xl">
            <p className="text-sm text-gray-600 font-medium mb-3">Graduate Satisfaction</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700 font-semibold">Overall Satisfaction</span>
                <span className="text-astu-red font-bold">92%</span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-astu-red to-red-400 h-full rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DepartmentOverview;
