import React from 'react';
import { Target, TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';
import { CompetencyScore } from '../types/employerFeedback.types';

interface CompetencyAssessmentProps {
  data: CompetencyScore[];
}

export const CompetencyAssessment: React.FC<CompetencyAssessmentProps> = ({ data }) => {
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
        <Target className="h-3 w-3 opacity-50" />
        0.0 vs last year
      </span>
    );
  };

  const hasData = Array.isArray(data) && data.length > 0 && data.some(c => c.score > 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Competency Assessment</h3>
      </div>

      {!hasData ? (
        <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No Competency Data Available</p>
          <p className="text-xs text-gray-500 mt-1">There are no employer competency evaluation records in the database for this department yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {data.map((competency, idx) => (
              <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{competency.competency}</p>
                  <p className="text-3xl font-bold text-astu-navy mb-2">{competency.score > 0 ? `${competency.score}/10` : 'N/A'}</p>
                  <div className="mb-4">
                    {getTrendBadge(competency.trend)}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">ASTU</span>
                    <span className="text-astu-navy font-bold">{competency.score}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-astu-navy h-full rounded-full transition-all duration-500" style={{ width: `${competency.score * 10}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Benchmark</span>
                    <span className="text-gray-500 font-bold">{competency.benchmark}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gray-400 h-full rounded-full transition-all duration-500" style={{ width: `${competency.benchmark * 10}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Top Dept</span>
                    <span className="text-astu-green font-bold">{competency.topDepartment}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-astu-green h-full rounded-full transition-all duration-500" style={{ width: `${competency.topDepartment * 10}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Benchmark Comparison */}
          {(() => {
            const validData = data.filter(c => c.score > 0);
            const astuAvg = validData.length > 0 ? (validData.reduce((acc, c) => acc + c.score, 0) / validData.length).toFixed(1) : '0.0';
            const benchAvg = validData.length > 0 ? (validData.reduce((acc, c) => acc + c.benchmark, 0) / validData.length).toFixed(1) : '0.0';
            const topDeptAvg = validData.length > 0 ? (validData.reduce((acc, c) => acc + c.topDepartment, 0) / validData.length).toFixed(1) : '0.0';

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-gray-200/60 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="text-astu-green" />
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">ASTU Average</p>
                  </div>
                  <p className="text-2xl font-bold text-astu-green">{astuAvg}/10</p>
                  <p className="text-xs text-gray-500 mt-1">Overall competency score</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200/60 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-astu-navy" />
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Industry Benchmark</p>
                  </div>
                  <p className="text-2xl font-bold text-astu-navy">{benchAvg}/10</p>
                  <p className="text-xs text-gray-500 mt-1">Industry standard</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-gray-200/60 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="text-purple-600" />
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Top Department</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{topDeptAvg}/10</p>
                  <p className="text-xs text-gray-500 mt-1">Highest benchmark target</p>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default CompetencyAssessment;
