import React from 'react';
import { TrendingUp, Zap, BarChart3, ArrowUpRight, AlertCircle } from 'lucide-react';
import { IndustryDemandSkill } from '../types/employerFeedback.types';

interface IndustryDemandAnalyticsProps {
  data: IndustryDemandSkill[];
}

export const IndustryDemandAnalytics: React.FC<IndustryDemandAnalyticsProps> = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const sortedData = hasData ? [...data].sort((a, b) => b.demand - a.demand) : [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Industry Demand Analytics</h3>
      </div>

      {!hasData ? (
        <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl mb-6">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No Industry Demand Records</p>
          <p className="text-xs text-gray-500 mt-1">There are no employer job requisitions or feedback skill demands recorded in the database for this department yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {sortedData.map((skill, idx) => (
            <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{skill.skill}</p>
                <p className="text-3xl font-bold text-astu-navy mb-3">{skill.demand}%</p>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-astu-green" />
                  <span className="text-sm font-medium text-astu-green">+{skill.trend}% vs last year</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Growth Rate</span>
                    <span className="text-astu-green font-bold">{skill.growthRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-astu-green h-full rounded-full transition-all duration-500" style={{ width: `${skill.growthRate}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Hiring Projection</span>
                    <span className="text-purple-600 font-bold">{skill.hiringProjection} positions</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Target Industries:</p>
                <div className="flex flex-wrap gap-1">
                  {skill.industries.slice(0, 2).map((industry, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {industry}
                    </span>
                  ))}
                  {skill.industries.length > 2 && (
                    <span className="text-xs text-gray-500 font-medium">+{skill.industries.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demand Trend Summary Cards */}
      {(() => {
        const topDemand = sortedData[0];
        const fastestGrowing = [...sortedData].sort((a, b) => b.growthRate - a.growthRate)[0];

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-gray-200/60 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-astu-green" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Highest Demand</p>
              </div>
              <p className="text-2xl font-bold text-astu-green">{topDemand ? topDemand.skill : 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">{topDemand ? `${topDemand.demand}% demand, ${topDemand.growthRate}% growth` : 'No employer demand records'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200/60 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="text-astu-navy" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Fastest Growing</p>
              </div>
              <p className="text-2xl font-bold text-astu-navy">{fastestGrowing ? fastestGrowing.skill : 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">{fastestGrowing ? `${fastestGrowing.demand}% demand, ${fastestGrowing.growthRate}% growth` : 'No industry growth data'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-gray-200/60 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-purple-600" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Skills</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{data.length}</p>
              <p className="text-xs text-gray-500 mt-1">Emerging skill demands analyzed</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default IndustryDemandAnalytics;
