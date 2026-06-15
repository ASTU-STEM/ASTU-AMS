import React from 'react';
import { Building2, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { DepartmentGap } from '../types/skillGap.types';

interface DepartmentGapAnalyticsProps {
  data: DepartmentGap[];
  darkMode?: boolean;
}

export const DepartmentGapAnalytics: React.FC<DepartmentGapAnalyticsProps> = ({ data, darkMode = false }) => {
  const sortedByGap = [...data].sort((a, b) => b.gapScore - a.gapScore);
  const sortedByPriority = [...data].sort((a, b) => a.priorityRanking - b.priorityRanking);

  const getGapColor = (gapScore: number) => {
    if (gapScore >= 35) return 'text-astu-red bg-red-100';
    if (gapScore >= 30) return 'text-yellow-600 bg-yellow-100';
    if (gapScore >= 25) return 'text-orange-600 bg-orange-100';
    return 'text-astu-green bg-green-100';
  };

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Department Gap Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {sortedByGap.map((dept, idx) => (
          <div key={idx} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-astu-navy/10 flex items-center justify-center">
                <Building2 className="text-astu-navy h-5 w-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dept.department}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Priority #{dept.priorityRanking}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Gap Score</span>
                  <span className={`font-bold ${dept.gapScore >= 35 ? 'text-astu-red' : dept.gapScore >= 30 ? 'text-yellow-600' : 'text-astu-green'}`}>
                    {dept.gapScore}%
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className={`h-full rounded-full ${
                    dept.gapScore >= 35 ? 'bg-astu-red' :
                    dept.gapScore >= 30 ? 'bg-yellow-500' :
                    'bg-astu-green'
                  }`} style={{ width: `${dept.gapScore}%` }}></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Strongest</span>
                <span className="text-astu-green font-bold">{dept.strongestSkill}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Weakest</span>
                <span className="text-astu-red font-bold">{dept.weakestSkill}</span>
              </div>
              
              <div className={`flex items-center gap-2 pt-2 border-t ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                {dept.improvementTrend > 0 ? <TrendingUp className="h-4 w-4 text-astu-green" /> : <TrendingDown className="h-4 w-4 text-astu-red" />}
                <span className={`text-xs font-medium ${dept.improvementTrend > 0 ? 'text-astu-green' : 'text-astu-red'}`}>
                  {dept.improvementTrend > 0 ? '+' : ''}{dept.improvementTrend}% improvement
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Highest Priority Departments</h4>
          <div className="space-y-3">
            {sortedByPriority.slice(0, 3).map((dept, idx) => (
              <div key={idx} className={`p-4 border rounded-xl flex items-center justify-between ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-red-50 to-orange-50 border-gray-200/60'}`}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <div className="w-8 h-8 rounded-full bg-astu-red/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-astu-red">{idx + 1}</span>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dept.department}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gap: {dept.gapScore}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGapColor(dept.gapScore)}`}>
                    {dept.gapScore >= 35 ? 'Critical' : dept.gapScore >= 30 ? 'High' : 'Medium'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Best Performing Departments</h4>
          <div className="space-y-3">
            {sortedByPriority.slice(-3).reverse().map((dept, idx) => (
              <div key={idx} className={`p-4 border rounded-xl flex items-center justify-between ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-blue-50 to-green-50 border-gray-200/60'}`}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <div className="w-8 h-8 rounded-full bg-astu-green/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-astu-green" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dept.department}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gap: {dept.gapScore}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGapColor(dept.gapScore)}`}>
                    {dept.gapScore >= 35 ? 'Critical' : dept.gapScore >= 30 ? 'High' : 'Medium'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentGapAnalytics;
