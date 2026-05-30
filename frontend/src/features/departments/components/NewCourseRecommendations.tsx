import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { NewCourseRecommendation } from '../types/curriculum.types';

interface NewCourseRecommendationsProps {
  data: NewCourseRecommendation[];
  darkMode?: boolean;
}

export const NewCourseRecommendations: React.FC<NewCourseRecommendationsProps> = ({ data, darkMode = false }) => {
  const sortedByPriority = [...data].sort((a, b) => a.priorityRanking - b.priorityRanking);

  const getImpactColor = (impact: NewCourseRecommendation['expectedImpact']) => {
    switch (impact) {
      case 'high':
        return 'text-astu-green bg-emerald-100';
      case 'medium':
        return 'text-blue-600 bg-blue-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Course Recommendations</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {sortedByPriority.slice(0, 4).map((course, idx) => (
          <div key={idx} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>#{course.priorityRanking}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(course.expectedImpact)}`}>
                {course.expectedImpact} impact
              </span>
            </div>
            <p className={`text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.course}</p>
            <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{course.justification}</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Demand</span>
                <span className="text-astu-green font-bold">{course.demandLevel}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-astu-green h-full rounded-full" style={{ width: `${course.demandLevel}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Industry Relevance</span>
                <span className="text-blue-600 font-bold">{course.industryRelevance}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${course.industryRelevance}%` }}></div>
              </div>
            </div>
            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Suggested: {course.suggestedDepartment}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Recommendations */}
      <div>
        <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Top Priority Recommendations</h4>
        <div className="space-y-3">
          {sortedByPriority.slice(0, 3).map((course, idx) => (
            <div key={idx} className={`p-4 border rounded-xl flex items-center justify-between ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-gray-200/60'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-astu-green/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-astu-green">{idx + 1}</span>
                </div>
                <div>
                  <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.course}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{course.justification}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Demand:</span>
                  <span className="text-xs font-bold text-astu-green">{course.demandLevel}%</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(course.expectedImpact)}`}>
                  {course.expectedImpact} impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewCourseRecommendations;
