import React from 'react';
import { Briefcase, TrendingUp } from 'lucide-react';
import { EmploymentOutcomeData } from '../types/tracer.types';

interface EmploymentOutcomeAnalyticsProps {
  data: EmploymentOutcomeData[];
  darkMode?: boolean;
}

export const EmploymentOutcomeAnalytics: React.FC<EmploymentOutcomeAnalyticsProps> = ({ data, darkMode = false }) => {
  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employment Outcome Analytics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart Representation */}
        <div className={`p-6 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Distribution</h4>
          <div className="space-y-4">
            {data.map((outcome, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{outcome.status}</span>
                  <span className={`text-${outcome.color} font-bold`}>{outcome.percentage}%</span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className={`bg-${outcome.color} h-full rounded-full transition-all duration-500`} style={{ width: `${outcome.percentage}%` }}></div>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{outcome.count} graduates</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Table */}
        <div className={`p-6 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Summary Table</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                  <th className={`text-left text-xs font-semibold uppercase tracking-wider py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                  <th className={`text-right text-xs font-semibold uppercase tracking-wider py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Count</th>
                  <th className={`text-right text-xs font-semibold uppercase tracking-wider py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>%</th>
                  <th className={`text-right text-xs font-semibold uppercase tracking-wider py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.map((outcome, idx) => (
                  <tr key={idx} className={`border-b last:border-0 ${darkMode ? 'border-slate-600' : 'border-gray-100'}`}>
                    <td className={`py-3 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{outcome.status}</td>
                    <td className={`py-3 text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{outcome.count}</td>
                    <td className={`py-3 text-sm text-right font-bold text-${outcome.color}`}>{outcome.percentage}%</td>
                    <td className="py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-3 w-3 text-astu-green" />
                        <span className="text-astu-green font-medium">+{Math.floor(Math.random() * 10) + 1}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentOutcomeAnalytics;
