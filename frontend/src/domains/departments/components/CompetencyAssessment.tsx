import React from 'react';
import { Target, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { CompetencyScore } from '../types/employerFeedback.types';

interface CompetencyAssessmentProps {
  data: CompetencyScore[];
}

export const CompetencyAssessment: React.FC<CompetencyAssessmentProps> = ({ data }) => {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-astu-green" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-astu-red" />;
    return <Target className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Competency Assessment</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {data.map((competency, idx) => (
          <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{competency.competency}</p>
            <p className="text-3xl font-bold text-astu-navy mb-3">{competency.score}/10</p>
            <div className="flex items-center gap-2 mb-3">
              {getTrendIcon(competency.trend)}
              <span className={`text-sm font-medium ${competency.trend > 0 ? 'text-astu-green' : competency.trend < 0 ? 'text-astu-red' : 'text-gray-400'}`}>
                {competency.trend > 0 ? '+' : ''}{competency.trend}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">ASTU</span>
                <span className="text-astu-navy font-bold">{competency.score}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-astu-navy h-full rounded-full" style={{ width: `${competency.score * 10}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Benchmark</span>
                <span className="text-gray-500 font-bold">{competency.benchmark}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gray-400 h-full rounded-full" style={{ width: `${competency.benchmark * 10}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Top Dept</span>
                <span className="text-astu-green font-bold">{competency.topDepartment}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-astu-green h-full rounded-full" style={{ width: `${competency.topDepartment * 10}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benchmark Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-astu-green" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">ASTU Average</p>
          </div>
          <p className="text-2xl font-bold text-astu-green">8.0/10</p>
          <p className="text-xs text-gray-500 mt-1">Overall competency score</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-astu-navy" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Industry Benchmark</p>
          </div>
          <p className="text-2xl font-bold text-astu-navy">7.8/10</p>
          <p className="text-xs text-gray-500 mt-1">Industry standard</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-purple-600" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Top Department</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">8.8/10</p>
          <p className="text-xs text-gray-500 mt-1">Software Engineering</p>
        </div>
      </div>
    </div>
  );
};

export default CompetencyAssessment;
