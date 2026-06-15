import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Target } from 'lucide-react';
import { SkillGapOverview as SkillGapOverviewData } from '../types/skillGap.types';

interface SkillGapOverviewProps {
  data: SkillGapOverviewData;
  darkMode?: boolean;
}

export const SkillGapOverview: React.FC<SkillGapOverviewProps> = ({ data, darkMode = false }) => {
  const matchedPercentage = ((data.skillsMatched / data.totalSkills) * 100).toFixed(0);
  const missingPercentage = ((data.skillsMissing / data.totalSkills) * 100).toFixed(0);
  const partiallyCoveredPercentage = ((data.skillsPartiallyCovered / data.totalSkills) * 100).toFixed(0);

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Skill Gap Overview</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-blue-50 to-green-50 border-gray-200/60'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-astu-green/10 rounded-lg">
              <CheckCircle className="text-astu-green h-5 w-5" />
            </div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skills Matched</p>
          </div>
          <p className="text-3xl font-bold text-astu-green mb-1">{data.skillsMatched}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{matchedPercentage}% of total</p>
        </div>

        <div className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-red-50 to-orange-50 border-gray-200/60'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-astu-red/10 rounded-lg">
              <XCircle className="text-astu-red h-5 w-5" />
            </div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skills Missing</p>
          </div>
          <p className="text-3xl font-bold text-astu-red mb-1">{data.skillsMissing}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{missingPercentage}% of total</p>
        </div>

        <div className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-gray-200/60'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-600/10 rounded-lg">
              <AlertTriangle className="text-yellow-600 h-5 w-5" />
            </div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Partially Covered</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-1">{data.skillsPartiallyCovered}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{partiallyCoveredPercentage}% of total</p>
        </div>

        <div className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-gray-200/60'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-600/10 rounded-lg">
              <Target className="text-purple-600 h-5 w-5" />
            </div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>To Prioritize</p>
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-1">{data.skillsToPrioritize}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Critical gaps</p>
        </div>
      </div>

      {/* Summary */}
      <div className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
        <div className="flex justify-between items-center mb-3">
          <p className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Skills Analyzed</p>
          <p className="text-2xl font-bold text-astu-navy">{data.totalSkills}</p>
        </div>
        <div className={`w-full h-3 rounded-full overflow-hidden flex ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
          <div className="bg-astu-green h-full" style={{ width: `${matchedPercentage}%` }}></div>
          <div className="bg-yellow-500 h-full" style={{ width: `${partiallyCoveredPercentage}%` }}></div>
          <div className="bg-astu-red h-full" style={{ width: `${missingPercentage}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}><div className="w-3 h-3 bg-astu-green rounded"></div> Matched</span>
          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}><div className="w-3 h-3 bg-yellow-500 rounded"></div> Partially Covered</span>
          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}><div className="w-3 h-3 bg-astu-red rounded"></div> Missing</span>
        </div>
      </div>
    </div>
  );
};

export default SkillGapOverview;
