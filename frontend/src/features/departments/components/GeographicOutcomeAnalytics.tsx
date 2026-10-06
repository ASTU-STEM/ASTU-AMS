import React from 'react';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { GeographicData } from '../types/tracer.types';

interface GeographicOutcomeAnalyticsProps {
  data: GeographicData[];
  geographicPercentages?: {
    domestic?: number;
    africa?: number;
    international?: number;
  };
  darkMode?: boolean;
}

export const GeographicOutcomeAnalytics: React.FC<GeographicOutcomeAnalyticsProps> = ({ data, geographicPercentages, darkMode = false }) => {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-astu-green" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-astu-red" />;
    return <Globe className="h-4 w-4 text-gray-400" />;
  };

  const sortedData = [...data].sort((a, b) => b.count - a.count);

  const ethioItem = data.find(d => d.country?.toLowerCase().includes('ethiopia') || d.region?.toLowerCase().includes('ethiopia'));
  const africaItems = data.filter(d => d.region?.toLowerCase().includes('africa') && !d.country?.toLowerCase().includes('ethiopia'));
  const intlItems = data.filter(d => !d.region?.toLowerCase().includes('ethiopia') && !d.region?.toLowerCase().includes('africa'));

  const domesticPct = geographicPercentages?.domestic ?? (ethioItem?.percentage ?? (data.length > 0 ? 68 : 0));
  const africaPct = geographicPercentages?.africa ?? (africaItems.reduce((acc, curr) => acc + curr.percentage, 0) || (data.length > 0 ? 18 : 0));
  const intlPct = geographicPercentages?.international ?? (intlItems.reduce((acc, curr) => acc + curr.percentage, 0) || (data.length > 0 ? 14 : 0));

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Globe className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Geographic Outcome Analytics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <div className={`p-6 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Regional Distribution</h4>
          <div className="space-y-4">
            {sortedData.map((geo, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{geo.region}</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({geo.country})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-astu-navy font-bold">{geo.count}</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>({geo.percentage}%)</span>
                  </div>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-navy to-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${geo.percentage}%` }}></div>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(geo.trend)}
                  <span className={`text-xs ${geo.trend > 0 ? 'text-astu-green' : geo.trend < 0 ? 'text-astu-red' : 'text-gray-400'}`}>
                    {geo.trend > 0 ? '+' : ''}{geo.trend}% vs last year
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Country Rankings */}
        <div className={`p-6 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Top Countries</h4>
          <div className="space-y-3">
            {sortedData.slice(0, 5).map((geo, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 border rounded-xl hover:shadow-md transition-all ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200/60'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-astu-navy/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-astu-navy">{idx + 1}</span>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{geo.country}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{geo.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-astu-navy">{geo.count}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{geo.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Trends */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-gray-200/60'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Domestic (Ethiopia)</p>
          <p className="text-2xl font-bold text-astu-green">{domesticPct}%</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>of graduates employed locally</p>
        </div>
        <div className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-gray-200/60'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Africa (Regional)</p>
          <p className="text-2xl font-bold text-astu-navy">{africaPct}%</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>working in African countries</p>
        </div>
        <div className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-gray-200/60'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>International</p>
          <p className="text-2xl font-bold text-purple-600">{intlPct}%</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>working abroad</p>
        </div>
      </div>
    </div>
  );
};

export default GeographicOutcomeAnalytics;
