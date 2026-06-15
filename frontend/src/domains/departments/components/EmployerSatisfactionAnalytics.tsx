import React from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { SatisfactionMetric } from '../types/employerFeedback.types';

interface EmployerSatisfactionAnalyticsProps {
  data: SatisfactionMetric[];
}

export const EmployerSatisfactionAnalytics: React.FC<EmployerSatisfactionAnalyticsProps> = ({ data }) => {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-astu-green" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-astu-red" />;
    return <Star className="h-4 w-4 text-gray-400" />;
  };

  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Employer Satisfaction Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {data.map((metric, idx) => (
          <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{metric.category}</p>
            <p className="text-3xl font-bold text-astu-navy mb-3">{metric.score}/10</p>
            <div className="flex items-center gap-2 mb-4">
              {getTrendIcon(metric.trend)}
              <span className={`text-sm font-medium ${metric.trend > 0 ? 'text-astu-green' : metric.trend < 0 ? 'text-astu-red' : 'text-gray-400'}`}>
                {metric.trend > 0 ? '+' : ''}{metric.trend}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Excellent</span>
                <span className="text-astu-green font-bold">{metric.breakdown.excellent}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-astu-green h-full rounded-full" style={{ width: `${metric.breakdown.excellent}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Good</span>
                <span className="text-astu-navy font-bold">{metric.breakdown.good}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${metric.breakdown.good}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Average</span>
                <span className="text-yellow-600 font-bold">{metric.breakdown.average}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${metric.breakdown.average}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Poor</span>
                <span className="text-astu-red font-bold">{metric.breakdown.poor}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-astu-red h-full rounded-full" style={{ width: `${metric.breakdown.poor}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Top Performing Areas</h4>
          <div className="space-y-3">
            {sortedData.slice(0, 3).map((metric, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200/60 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-900">{metric.category}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-xs font-medium ${metric.trend > 0 ? 'text-astu-green' : metric.trend < 0 ? 'text-astu-red' : 'text-gray-400'}`}>
                      {metric.trend > 0 ? '+' : ''}{metric.trend}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-gray-600">Score</span>
                  <span className="text-astu-green font-bold">{metric.score}/10</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-astu-green to-blue-400 h-full rounded-full" style={{ width: `${metric.score * 10}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Areas for Improvement</h4>
          <div className="space-y-3">
            {sortedData.slice(-3).reverse().map((metric, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-red-50 to-orange-50 border border-gray-200/60 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-900">{metric.category}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-xs font-medium ${metric.trend > 0 ? 'text-astu-green' : metric.trend < 0 ? 'text-astu-red' : 'text-gray-400'}`}>
                      {metric.trend > 0 ? '+' : ''}{metric.trend}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-gray-600">Score</span>
                  <span className="text-astu-red font-bold">{metric.score}/10</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-astu-red to-orange-400 h-full rounded-full" style={{ width: `${metric.score * 10}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerSatisfactionAnalytics;
