import React from 'react';
import { Star, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { SatisfactionMetric } from '../types/employerFeedback.types';

interface EmployerSatisfactionAnalyticsProps {
  data: SatisfactionMetric[];
}

export const EmployerSatisfactionAnalytics: React.FC<EmployerSatisfactionAnalyticsProps> = ({ data }) => {
  const getTrendBadge = (trend: number) => {
    if (trend > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-astu-green bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
          <TrendingUp className="h-3 w-3" />
          +{trend} vs last year
        </span>
      );
    }
    if (trend < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-astu-red bg-red-50 px-2 py-0.5 rounded-full border border-red-200/50">
          <TrendingDown className="h-3 w-3" />
          {trend} vs last year
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
        <TrendingUp className="h-3 w-3 opacity-50" />
        0.0 vs last year
      </span>
    );
  };

  const hasData = Array.isArray(data) && data.length > 0 && data.some(m => m.score > 0);
  const validData = hasData ? [...data].filter(m => m.score > 0).sort((a, b) => b.score - a.score) : [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Employer Satisfaction Analytics</h3>
      </div>

      {!hasData ? (
        <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No Satisfaction Data Available</p>
          <p className="text-xs text-gray-500 mt-1">There are no employer feedback rating records in the database for this department yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {data.map((metric, idx) => (
              <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{metric.category}</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-3xl font-bold text-astu-navy">{metric.score > 0 ? `${metric.score}/10` : 'N/A'}</p>
                  </div>
                  <div className="mb-4">
                    {getTrendBadge(metric.trend)}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Excellent</span>
                    <span className="text-astu-green font-bold">{metric.breakdown.excellent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-astu-green h-full rounded-full transition-all duration-500" style={{ width: `${metric.breakdown.excellent}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Good</span>
                    <span className="text-blue-600 font-bold">{metric.breakdown.good}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${metric.breakdown.good}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Average</span>
                    <span className="text-yellow-600 font-bold">{metric.breakdown.average}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${metric.breakdown.average}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Poor</span>
                    <span className="text-astu-red font-bold">{metric.breakdown.poor}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-astu-red h-full rounded-full transition-all duration-500" style={{ width: `${metric.breakdown.poor}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Performing & Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Top Performing Areas</h4>
              <div className="space-y-3">
                {validData.slice(0, 3).map((metric, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-emerald-50/80 to-green-50/80 border border-emerald-200/60 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-900">{metric.category}</span>
                      {getTrendBadge(metric.trend)}
                    </div>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-gray-600">Score</span>
                      <span className="text-astu-green font-bold">{metric.score}/10</span>
                    </div>
                    <div className="w-full bg-gray-200/70 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-astu-green to-emerald-400 h-full rounded-full" style={{ width: `${metric.score * 10}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Areas for Improvement</h4>
              <div className="space-y-3">
                {validData.slice(-3).reverse().map((metric, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-red-50/80 to-orange-50/80 border border-red-200/60 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-900">{metric.category}</span>
                      {getTrendBadge(metric.trend)}
                    </div>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-gray-600">Score</span>
                      <span className="text-astu-red font-bold">{metric.score}/10</span>
                    </div>
                    <div className="w-full bg-gray-200/70 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-astu-red to-orange-400 h-full rounded-full" style={{ width: `${metric.score * 10}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployerSatisfactionAnalytics;
