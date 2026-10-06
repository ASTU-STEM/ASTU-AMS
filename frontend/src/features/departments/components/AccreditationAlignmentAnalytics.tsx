import React from 'react';
import { Award, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { AccreditationAlignment } from '../types/curriculum.types';

interface AccreditationAlignmentAnalyticsProps {
  data: AccreditationAlignment;
}

export const AccreditationAlignmentAnalytics: React.FC<AccreditationAlignmentAnalyticsProps> = ({ data }) => {
  const complianceScore = data?.complianceScore ?? 0;
  const learningOutcomeCoverage = data?.learningOutcomeCoverage ?? 0;
  const graduateOutcomeMapping = data?.graduateOutcomeMapping ?? 0;
  const etaReadiness = data?.etaReadiness ?? 0;
  const curriculumAuditStatus = data?.curriculumAuditStatus ?? 'compliant';

  const getStatusColor = (status: AccreditationAlignment['curriculumAuditStatus']) => {
    switch (status) {
      case 'compliant':
        return 'text-astu-green bg-green-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      case 'non-compliant':
        return 'text-astu-red bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-astu-green bg-emerald-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-astu-red bg-red-100';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Award className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Accreditation Alignment Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Compliance Score</p>
          <p className="text-3xl font-bold text-astu-navy mb-3">{complianceScore}%</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-astu-navy h-full rounded-full" style={{ width: `${complianceScore}%` }}></div>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Learning Outcome Coverage</p>
          <p className="text-3xl font-bold text-astu-green mb-3">{learningOutcomeCoverage}%</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-astu-green h-full rounded-full" style={{ width: `${learningOutcomeCoverage}%` }}></div>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Graduate Outcome Mapping</p>
          <p className="text-3xl font-bold text-blue-600 mb-3">{graduateOutcomeMapping}%</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${graduateOutcomeMapping}%` }}></div>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">ETA Readiness</p>
          <p className="text-3xl font-bold text-purple-600 mb-3">{etaReadiness}%</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${etaReadiness}%` }}></div>
          </div>
        </div>
      </div>

      {/* Audit Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Curriculum Audit Status</h4>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(curriculumAuditStatus)}`}>
              {curriculumAuditStatus}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-astu-green" />
              <span className="text-sm text-gray-700">Core curriculum aligned with learning outcomes</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-astu-green" />
              <span className="text-sm text-gray-700">Assessment methods documented</span>
            </div>
            {curriculumAuditStatus === 'partial' && (
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-700">Some courses require outcome alignment</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">ETA Readiness Assessment</h4>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getReadinessColor(etaReadiness)}`}>
              {etaReadiness >= 80 ? 'Ready' : etaReadiness >= 60 ? 'In Progress' : 'Needs Work'}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-astu-green" />
              <span className="text-sm text-gray-700">Program objectives defined</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-astu-green" />
              <span className="text-sm text-gray-700">Graduate attributes mapped</span>
            </div>
            {etaReadiness < 80 && (
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-700">Additional documentation required</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccreditationAlignmentAnalytics;
