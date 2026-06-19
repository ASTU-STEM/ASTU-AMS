import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, CheckCircle } from 'lucide-react';
import { CurriculumEvidence } from '../types/accreditation.types';

interface CurriculumEvidenceAnalyticsProps {
  data: CurriculumEvidence;
}

export const CurriculumEvidenceAnalytics: React.FC<CurriculumEvidenceAnalyticsProps> = ({ data }) => {
  const metrics = [
    { label: 'Alignment Score', value: data.alignmentScore, color: 'astu-green' },
    { label: 'Outdated Courses', value: data.outdatedCourses, color: 'astu-red' },
    { label: 'New Course Recommendations', value: data.newCourseRecommendations, color: 'astu-navy' },
    { label: 'Accreditation Compliance', value: data.accreditationCompliance, color: 'astu-green' },
    { label: 'Practical vs Theory Balance', value: data.practicalTheoryBalance, color: 'purple-600' },
    { label: 'Update Priorities', value: data.updatePriorities, color: 'orange-600' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Curriculum Alignment Evidence</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{metric.label}</p>
            <p className="text-3xl font-bold text-astu-navy mb-3">{metric.value}%</p>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className={`bg-${metric.color} h-full rounded-full`} style={{ width: `${metric.value}%` }}></div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-astu-green" />
              <span className="text-xs text-gray-600">Above accreditation threshold</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumEvidenceAnalytics;
