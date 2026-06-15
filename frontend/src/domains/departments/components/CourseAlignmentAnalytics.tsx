import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';
import { CourseAlignment } from '../types/curriculum.types';

interface CourseAlignmentAnalyticsProps {
  data: CourseAlignment[];
  darkMode?: boolean;
}

export const CourseAlignmentAnalytics: React.FC<CourseAlignmentAnalyticsProps> = ({ data, darkMode = false }) => {
  const sortedByAlignment = [...data].sort((a, b) => a.alignmentScore - b.alignmentScore);
  const sortedByIndustry = [...data].sort((a, b) => b.industryRelevance - a.industryRelevance);

  const getStatusColor = (status: CourseAlignment['status']) => {
    switch (status) {
      case 'aligned':
        return 'text-astu-green bg-green-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      case 'outdated':
        return 'text-astu-red bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Course Alignment Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {sortedByAlignment.slice(0, 4).map((course, idx) => (
          <div key={idx} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{course.course}</p>
            <p className="text-3xl font-bold text-astu-navy mb-3">{course.alignmentScore}%</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Alignment</span>
                <span className="text-astu-green font-bold">{course.alignmentScore}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-astu-green h-full rounded-full" style={{ width: `${course.alignmentScore}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Skill Coverage</span>
                <span className="text-astu-navy font-bold">{course.skillCoverage}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${course.skillCoverage}%` }}></div>
              </div>
            </div>
            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(course.status)}`}>
                {course.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Alignment Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Lowest Alignment Courses</h4>
          <div className="space-y-3">
            {sortedByAlignment.slice(0, 3).map((course, idx) => (
              <div key={idx} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-red-50 to-orange-50 border-gray-200/60'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.course}</span>
                  <div className="flex items-center gap-1">
                    {course.updateRequired && <AlertTriangle className="h-4 w-4 text-astu-red" />}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Alignment Score</span>
                  <span className="text-astu-red font-bold">{course.alignmentScore}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-red to-orange-400 h-full rounded-full" style={{ width: `${course.alignmentScore}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Highest Industry Relevance</h4>
          <div className="space-y-3">
            {sortedByIndustry.slice(0, 3).map((course, idx) => (
              <div key={idx} className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-blue-50 to-green-50 border-gray-200/60'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.course}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-astu-green" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Industry Relevance</span>
                  <span className="text-astu-green font-bold">{course.industryRelevance}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-green to-blue-400 h-full rounded-full" style={{ width: `${course.industryRelevance}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAlignmentAnalytics;
