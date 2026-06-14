import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';
import { DemandSupplySkill } from '../types/skillGap.types';

interface DemandSupplyAnalyticsProps {
  data: DemandSupplySkill[];
  darkMode?: boolean;
}

export const DemandSupplyAnalytics: React.FC<DemandSupplyAnalyticsProps> = ({ data, darkMode = false }) => {
  const sortedByGap = [...data].sort((a, b) => b.gapScore - a.gapScore);
  const sortedByDemand = [...data].sort((a, b) => b.demandLevel - a.demandLevel);

  const getGapSeverity = (gapScore: number) => {
    if (gapScore >= 40) return { color: 'text-astu-red bg-red-100', label: 'Critical' };
    if (gapScore >= 30) return { color: 'text-yellow-600 bg-yellow-100', label: 'High' };
    if (gapScore >= 20) return { color: 'text-orange-600 bg-orange-100', label: 'Medium' };
    return { color: 'text-astu-green bg-green-100', label: 'Low' };
  };

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Demand vs Supply Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {sortedByGap.slice(0, 4).map((skill, idx) => (
          <div key={idx} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{skill.skill}</p>
            <p className="text-3xl font-bold text-astu-navy mb-3">{skill.gapScore}%</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Demand</span>
                <span className="text-astu-green font-bold">{skill.demandLevel}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-astu-green h-full rounded-full" style={{ width: `${skill.demandLevel}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Coverage</span>
                <span className="text-blue-600 font-bold">{skill.coverageLevel}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${skill.coverageLevel}%` }}></div>
              </div>
            </div>
            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
              <span className={`text-xs px-2 py-1 rounded-full ${getGapSeverity(skill.gapScore).color}`}>
                {getGapSeverity(skill.gapScore).label} Gap
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Largest Skill Gaps</h4>
          <div className="space-y-3">
            {sortedByGap.slice(0, 3).map((skill, idx) => (
              <div key={idx} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-red-50 to-orange-50 border-gray-200/60'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{skill.skill}</span>
                  <div className="flex items-center gap-1">
                    {skill.trend > 0 ? <TrendingUp className="h-4 w-4 text-astu-red" /> : <TrendingDown className="h-4 w-4 text-astu-green" />}
                    <span className={`text-xs font-medium ${skill.trend > 0 ? 'text-astu-red' : 'text-astu-green'}`}>
                      {skill.trend > 0 ? '+' : ''}{skill.trend}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Gap Score</span>
                  <span className="text-astu-red font-bold">{skill.gapScore}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-red to-orange-400 h-full rounded-full" style={{ width: `${skill.gapScore}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Highest Demand Skills</h4>
          <div className="space-y-3">
            {sortedByDemand.slice(0, 3).map((skill, idx) => (
              <div key={idx} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-gray-200/60'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{skill.skill}</span>
                  <div className="flex items-center gap-1">
                    {skill.trend > 0 ? <TrendingUp className="h-4 w-4 text-astu-green" /> : <TrendingDown className="h-4 w-4 text-astu-red" />}
                    <span className={`text-xs font-medium ${skill.trend > 0 ? 'text-astu-green' : 'text-astu-red'}`}>
                      {skill.trend > 0 ? '+' : ''}{skill.trend}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Demand Level</span>
                  <span className="text-astu-green font-bold">{skill.demandLevel}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-green to-emerald-400 h-full rounded-full" style={{ width: `${skill.demandLevel}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandSupplyAnalytics;
