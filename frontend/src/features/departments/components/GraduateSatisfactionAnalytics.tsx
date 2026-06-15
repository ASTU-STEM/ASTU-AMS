import React from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { SatisfactionMetric } from '../types/tracer.types';

interface GraduateSatisfactionAnalyticsProps {
  data: SatisfactionMetric[];
  darkMode?: boolean;
}

export const GraduateSatisfactionAnalytics: React.FC<GraduateSatisfactionAnalyticsProps> = ({ data, darkMode = false }) => {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-astu-green" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-astu-red" />;
    return <Star className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Graduate Satisfaction Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {data.map((metric, idx) => (
          <div key={idx} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{metric.category}</p>
            <p className="text-3xl font-bold text-astu-navy mb-3">{metric.score}/10</p>
            <div className="flex items-center gap-2 mb-4">
              {getTrendIcon(metric.trend)}
              <span className={`text-sm font-medium ${metric.trend > 0 ? 'text-astu-green' : metric.trend < 0 ? 'text-astu-red' : 'text-gray-400'}`}>
                {metric.trend > 0 ? '+' : ''}{metric.trend}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Excellent</span>
                <span className="text-astu-green font-bold">{metric.breakdown.excellent}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-astu-green h-full rounded-full" style={{ width: `${metric.breakdown.excellent}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Good</span>
                <span className="text-astu-navy font-bold">{metric.breakdown.good}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${metric.breakdown.good}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Average</span>
                <span className="text-yellow-600 font-bold">{metric.breakdown.average}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${metric.breakdown.average}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Poor</span>
                <span className="text-astu-red font-bold">{metric.breakdown.poor}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-astu-red h-full rounded-full" style={{ width: `${metric.breakdown.poor}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Satisfaction Summary */}
      <div className="p-5 bg-gradient-to-r from-astu-navy to-blue-800 rounded-xl text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold opacity-90 mb-1">Overall Satisfaction Score</p>
            <p className="text-4xl font-bold">8.2/10</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold opacity-90 mb-1">Trend</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-2xl font-bold">+0.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraduateSatisfactionAnalytics;
