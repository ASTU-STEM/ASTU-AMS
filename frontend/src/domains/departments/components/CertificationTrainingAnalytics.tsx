import React from 'react';
import { Award, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { CertificationGap } from '../types/skillGap.types';

interface CertificationTrainingAnalyticsProps {
  data: CertificationGap[];
  darkMode?: boolean;
}

export const CertificationTrainingAnalytics: React.FC<CertificationTrainingAnalyticsProps> = ({ data, darkMode = false }) => {
  const sortedByDemand = [...data].sort((a, b) => b.demand - a.demand);
  const sortedByTrainingGap = [...data].sort((a, b) => b.trainingGap - a.trainingGap);
  const recommended = data.filter(cert => cert.recommended);

  const getGapColor = (gap: number) => {
    if (gap >= 60) return 'text-astu-red bg-red-100';
    if (gap >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-astu-green bg-green-100';
  };

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Award className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Certification & Training Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {sortedByDemand.slice(0, 4).map((cert, idx) => (
          <div key={idx} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{cert.certification}</p>
              {cert.recommended && <CheckCircle className="h-4 w-4 text-astu-green" />}
            </div>
            <p className="text-3xl font-bold text-astu-navy mb-3">{cert.demand}%</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Training Gap</span>
                <span className={`font-bold ${cert.trainingGap >= 60 ? 'text-astu-red' : cert.trainingGap >= 40 ? 'text-yellow-600' : 'text-astu-green'}`}>
                  {cert.trainingGap}%
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className={`h-full rounded-full ${
                  cert.trainingGap >= 60 ? 'bg-astu-red' :
                  cert.trainingGap >= 40 ? 'bg-yellow-500' :
                  'bg-astu-green'
                }`} style={{ width: `${cert.trainingGap}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Lab Gap</span>
                <span className="text-blue-600 font-bold">{cert.labToolingGap}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${cert.labToolingGap}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certification Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Highest Demand Certifications</h4>
          <div className="space-y-3">
            {sortedByDemand.slice(0, 3).map((cert, idx) => (
              <div key={idx} className={`p-4 border rounded-xl flex items-center justify-between ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-gray-200/60'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-astu-green/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-astu-green" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cert.certification}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Demand: {cert.demand}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGapColor(cert.trainingGap)}`}>
                    {cert.trainingGap >= 60 ? 'Critical Gap' : cert.trainingGap >= 40 ? 'High Gap' : 'Low Gap'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recommended Certifications</h4>
          <div className="space-y-3">
            {recommended.slice(0, 3).map((cert, idx) => (
              <div key={idx} className={`p-4 border rounded-xl flex items-center justify-between ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-gray-200/60'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-astu-navy/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-astu-navy" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cert.certification}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Training Gap: {cert.trainingGap}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-astu-navy text-white">
                    Recommended
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationTrainingAnalytics;
