import React from 'react';
import { CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { SurveyCompletionData } from '../types/tracer.types';

interface SurveyCompletionAnalyticsProps {
  data: SurveyCompletionData[];
  darkMode?: boolean;
}

export const SurveyCompletionAnalytics: React.FC<SurveyCompletionAnalyticsProps> = ({ data, darkMode = false }) => {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-astu-green" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-astu-red" />;
    return <CheckCircle className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-astu-green';
    if (trend < 0) return 'text-astu-red';
    return 'text-gray-400';
  };

  const sortedData = [...data].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="text-2xl text-astu-green" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Survey Completion Analytics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highest Performing */}
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Highest Performing</h4>
          <div className="space-y-3">
            {sortedData.slice(0, 3).map((item, idx) => (
              <div key={idx} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-gray-200/60'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.category}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(item.trend)}
                    <span className={`text-xs font-medium ${getTrendColor(item.trend)}`}>
                      {item.trend > 0 ? '+' : ''}{item.trend}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{item.responded} / {item.totalGraduates} responded</span>
                  <span className="text-astu-green font-bold">{item.completionRate}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-green to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${item.completionRate}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Performing */}
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Lowest Performing</h4>
          <div className="space-y-3">
            {sortedData.slice(-3).reverse().map((item, idx) => (
              <div key={idx} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-red-50 to-orange-50 border-gray-200/60'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.category}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(item.trend)}
                    <span className={`text-xs font-medium ${getTrendColor(item.trend)}`}>
                      {item.trend > 0 ? '+' : ''}{item.trend}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{item.responded} / {item.totalGraduates} responded</span>
                  <span className="text-astu-red font-bold">{item.completionRate}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-red to-orange-400 h-full rounded-full transition-all duration-500" style={{ width: `${item.completionRate}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyCompletionAnalytics;
