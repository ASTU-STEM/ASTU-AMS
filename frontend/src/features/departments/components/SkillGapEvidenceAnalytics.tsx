import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';
import { SkillGapEvidence } from '../types/accreditation.types';

interface SkillGapEvidenceAnalyticsProps {
  data: SkillGapEvidence;
}

export const SkillGapEvidenceAnalytics: React.FC<SkillGapEvidenceAnalyticsProps> = ({ data }) => {
  const metrics = [
    { label: 'Critical Skill Gaps', value: data?.criticalSkillGaps ?? 0, color: 'astu-red' },
    { label: 'Industry Demand', value: data?.industryDemand ?? 0, color: 'astu-green' },
    { label: 'Coverage Rate', value: data?.coverageRate ?? 0, color: 'astu-navy' },
    { label: 'Training Priorities', value: data?.trainingPriorities ?? 0, color: 'purple-600' },
    { label: 'Certification Gaps', value: data?.certificationGaps ?? 0, color: 'orange-600' },
    { label: 'Department Risk Areas', value: data?.departmentRiskAreas ?? 0, color: 'astu-red' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Skill Gap Evidence</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{metric.label}</p>
            <p className="text-3xl font-bold text-astu-navy mb-3">{metric.value}</p>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className={`bg-${metric.color} h-full rounded-full`} style={{ width: `${metric.value}%` }}></div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {metric.color === 'astu-red' ? (
                <AlertTriangle className="h-4 w-4 text-astu-red" />
              ) : (
                <TrendingUp className="h-4 w-4 text-astu-green" />
              )}
              <span className="text-xs text-gray-600">
                {metric.color === 'astu-red' ? 'Requires attention' : 'On track'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillGapEvidenceAnalytics;
