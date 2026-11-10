import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { ComplianceStatus } from '../types/accreditation.types';

interface ComplianceStatusPanelProps {
  data: ComplianceStatus;
}

export const ComplianceStatusPanel: React.FC<ComplianceStatusPanelProps> = ({ data }) => {
  const compliantItems = data?.compliantItems ?? 0;
  const partiallyCompliantItems = data?.partiallyCompliantItems ?? 0;
  const nonCompliantItems = data?.nonCompliantItems ?? 0;
  const actionRequired = data?.actionRequired ?? 0;
  const completionEstimate = data?.completionEstimate ?? 'N/A';
  const responsibleArea = data?.responsibleArea ?? 'Department Academic Committee';

  const totalItems = compliantItems + partiallyCompliantItems + nonCompliantItems;
  const compliantPercentage = totalItems > 0 ? ((compliantItems / totalItems) * 100).toFixed(0) : '0';
  const partialPercentage = totalItems > 0 ? ((partiallyCompliantItems / totalItems) * 100).toFixed(0) : '0';
  const nonCompliantPercentage = totalItems > 0 ? ((nonCompliantItems / totalItems) * 100).toFixed(0) : '0';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Compliance Status</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-astu-green/10 rounded-lg">
              <CheckCircle className="text-astu-green h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Compliant</p>
          </div>
          <p className="text-3xl font-bold text-astu-green mb-1">{compliantItems}</p>
          <p className="text-sm text-gray-600">{compliantPercentage}% of total</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-600/10 rounded-lg">
              <AlertTriangle className="text-yellow-600 h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Partially Compliant</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-1">{partiallyCompliantItems}</p>
          <p className="text-sm text-gray-600">{partialPercentage}% of total</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-astu-red/10 rounded-lg">
              <XCircle className="text-astu-red h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Non-Compliant</p>
          </div>
          <p className="text-3xl font-bold text-astu-red mb-1">{nonCompliantItems}</p>
          <p className="text-sm text-gray-600">{nonCompliantPercentage}% of total</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-gray-200/60 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-600/10 rounded-lg">
              <AlertTriangle className="text-purple-600 h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Action Required</p>
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-1">{actionRequired}</p>
          <p className="text-sm text-gray-600">Items needing attention</p>
        </div>
      </div>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Completion Estimate</p>
          <p className="text-2xl font-bold text-astu-navy mb-1">{completionEstimate}</p>
          <p className="text-sm text-gray-600">Time to full compliance</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Responsible Area</p>
          <p className="text-2xl font-bold text-astu-navy mb-1">{responsibleArea}</p>
          <p className="text-sm text-gray-600">Primary ownership</p>
        </div>
      </div>
    </div>
  );
};
export default ComplianceStatusPanel;
