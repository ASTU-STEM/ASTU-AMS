import React from 'react';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { EmergingTechnology } from '../types/skillGap.types';

interface EmergingTechnologyAnalyticsProps {
  data: EmergingTechnology[];
  darkMode?: boolean;
}

export const EmergingTechnologyAnalytics: React.FC<EmergingTechnologyAnalyticsProps> = ({ data, darkMode = false }) => {
  const sortedByGrowth = [...data].sort((a, b) => b.growthRate - a.growthRate);
  const sortedByReadiness = [...data].sort((a, b) => a.curriculumReadiness - b.curriculumReadiness);

  const getReadinessColor = (readiness: number) => {
    if (readiness < 40) return 'text-astu-red bg-red-100';
    if (readiness < 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-astu-green bg-green-100';
  };

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Emerging Technology Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {sortedByGrowth.slice(0, 4).map((tech, idx) => (
          <div key={idx} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tech.technology}</p>
            <p className="text-3xl font-bold text-astu-navy mb-3">{tech.growthRate}%</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Growth Rate</span>
                <span className="text-astu-green font-bold">{tech.growthRate}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-astu-green h-full rounded-full" style={{ width: `${tech.growthRate}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Adoption</span>
                <span className="text-astu-navy font-bold">{tech.adoptionPotential}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${tech.adoptionPotential}%` }}></div>
              </div>
            </div>
            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
              <span className={`text-xs px-2 py-1 rounded-full ${getReadinessColor(tech.curriculumReadiness)}`}>
                {tech.curriculumReadiness < 40 ? 'Low Readiness' : tech.curriculumReadiness < 60 ? 'Medium Readiness' : 'High Readiness'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Technology Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fastest Growing Technologies</h4>
          <div className="space-y-3">
            {sortedByGrowth.slice(0, 3).map((tech, idx) => (
              <div key={idx} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-blue-50 to-green-50 border-gray-200/60'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tech.technology}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-astu-green" />
                    <span className="text-xs font-medium text-astu-green">{tech.growthRate}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Labor Market Relevance</span>
                  <span className="text-astu-navy font-bold">{tech.laborMarketRelevance}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-navy to-blue-400 h-full rounded-full" style={{ width: `${tech.laborMarketRelevance}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Lowest Curriculum Readiness</h4>
          <div className="space-y-3">
            {sortedByReadiness.slice(0, 3).map((tech, idx) => (
              <div key={idx} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-red-50 to-orange-50 border-gray-200/60'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tech.technology}</span>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-astu-red" />
                    <span className="text-xs font-medium text-astu-red">{tech.curriculumReadiness}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Adoption Potential</span>
                  <span className="text-purple-600 font-bold">{tech.adoptionPotential}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-purple-600 to-pink-400 h-full rounded-full" style={{ width: `${tech.adoptionPotential}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergingTechnologyAnalytics;
