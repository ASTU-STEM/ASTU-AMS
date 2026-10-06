import React from 'react';
import { AlertTriangle, TrendingUp, CheckCircle, Wrench } from 'lucide-react';
import { CourseUpdate } from '../types/curriculum.types';

interface CourseUpdateAnalyticsProps {
  data: CourseUpdate[];
}

export const CourseUpdateAnalytics: React.FC<CourseUpdateAnalyticsProps> = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];
  const sortedByPriority = [...safeData].sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a?.priority || 'low'] ?? 2) - (priorityOrder[b?.priority || 'low'] ?? 2);
  });

  const getPriorityColor = (priority: CourseUpdate['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-astu-red bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Course Update Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedByPriority.map((course, idx) => (
          <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900">{course.course}</p>
                <p className="text-xs text-gray-500">{course.department}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(course.priority)}`}>
                {course.priority} priority
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Outdated Modules</p>
                <div className="flex flex-wrap gap-2">
                  {(course.outdatedModules || []).map((module, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {module}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Missing Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {(course.missingTechnologies || []).map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Lab Deficiencies</p>
                <div className="flex flex-wrap gap-2">
                  {(course.labDeficiencies || []).map((lab, i) => (
                    <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {lab}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Suggested Updates</p>
              <ul className="space-y-1">
                {(course.suggestedUpdates || []).map((update, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle className="h-3 w-3 text-astu-green mt-0.5 flex-shrink-0" />
                    {update}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseUpdateAnalytics;
