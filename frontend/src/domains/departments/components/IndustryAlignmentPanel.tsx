import React from 'react';
import { TrendingUp, Building2, Target, BarChart3 } from 'lucide-react';
import { IndustryAlignment } from '../types/curriculum.types';

interface IndustryAlignmentPanelProps {
  data: IndustryAlignment;
}

export const IndustryAlignmentPanel: React.FC<IndustryAlignmentPanelProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Industry Alignment Panel</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Alignment Score</p>
          <p className="text-3xl font-bold text-astu-navy mb-3">{data.alignmentScore}%</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-astu-navy h-full rounded-full" style={{ width: `${data.alignmentScore}%` }}></div>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Employer Demand Match</p>
          <p className="text-3xl font-bold text-astu-green mb-3">{data.employerDemandMatch}%</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-astu-green h-full rounded-full" style={{ width: `${data.employerDemandMatch}%` }}></div>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Curriculum Relevance</p>
          <p className="text-3xl font-bold text-blue-600 mb-3">{data.curriculumRelevance}%</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${data.curriculumRelevance}%` }}></div>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Skill-to-Industry Mapping</p>
          <p className="text-3xl font-bold text-purple-600 mb-3">{data.skillToIndustryMapping}%</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${data.skillToIndustryMapping}%` }}></div>
          </div>
        </div>
      </div>

      {/* Sector Coverage */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Sector Coverage</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.sectorCoverage.map((sector, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-900">{sector.sector}</p>
                <Target className="h-4 w-4 text-astu-navy" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-astu-navy to-blue-400 h-full rounded-full" style={{ width: `${sector.coverage}%` }}></div>
                </div>
                <span className="text-sm font-bold text-astu-navy">{sector.coverage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndustryAlignmentPanel;
