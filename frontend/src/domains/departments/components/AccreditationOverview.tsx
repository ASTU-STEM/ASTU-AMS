import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Target } from 'lucide-react';
import { AccreditationOverview as AccreditationOverviewData } from '../types/accreditation.types';

interface AccreditationOverviewProps {
  data: AccreditationOverviewData;
}

export const AccreditationOverview: React.FC<AccreditationOverviewProps> = ({ data }) => {
  const completedPercentage = ((data.completedEvidenceItems / data.totalEvidenceItems) * 100).toFixed(0);
  const missingPercentage = ((data.missingEvidenceItems / data.totalEvidenceItems) * 100).toFixed(0);

  const getStatusColor = (status: AccreditationOverviewData['overallReadinessStatus']) => {
    switch (status) {
      case 'ready':
        return 'text-astu-green bg-blue-100';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'needs-work':
        return 'text-astu-red bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: AccreditationOverviewData['overallReadinessStatus']) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'in-progress':
        return 'In Progress';
      case 'needs-work':
        return 'Needs Work';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Accreditation Readiness Overview</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Overall Status</p>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(data.overallReadinessStatus)}`}>
              {getStatusLabel(data.overallReadinessStatus)}
            </span>
          </div>
          <p className="text-3xl font-bold text-astu-navy mb-1">{data.overallReadinessStatus}</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-astu-green/10 rounded-lg">
              <CheckCircle className="text-astu-green h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Completed</p>
          </div>
          <p className="text-3xl font-bold text-astu-green mb-1">{data.completedEvidenceItems}</p>
          <p className="text-sm text-gray-600">{completedPercentage}% of total</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-astu-red/10 rounded-lg">
              <XCircle className="text-astu-red h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Missing</p>
          </div>
          <p className="text-3xl font-bold text-astu-red mb-1">{data.missingEvidenceItems}</p>
          <p className="text-sm text-gray-600">{missingPercentage}% of total</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-600/10 rounded-lg">
              <AlertTriangle className="text-yellow-600 h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-1">{data.pendingComplianceAreas}</p>
          <p className="text-sm text-gray-600">Compliance areas</p>
        </div>
      </div>

      {/* Summary */}
      <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Evidence Items</p>
          <p className="text-2xl font-bold text-astu-navy">{data.totalEvidenceItems}</p>
        </div>
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
          <div className="bg-astu-green h-full" style={{ width: `${completedPercentage}%` }}></div>
          <div className="bg-astu-red h-full" style={{ width: `${missingPercentage}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-astu-green rounded"></div> Completed</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-astu-red rounded"></div> Missing</span>
        </div>
      </div>
    </div>
  );
};

export default AccreditationOverview;
