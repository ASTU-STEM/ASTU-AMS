import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { TracerTimelineData } from '../types/tracer.types';

interface TracerTimelineAnalyticsProps {
  data: TracerTimelineData[];
  darkMode?: boolean;
}

export const TracerTimelineAnalytics: React.FC<TracerTimelineAnalyticsProps> = ({ data, darkMode = false }) => {
  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tracer Timeline Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((timeline, idx) => (
          <div key={idx} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <h4 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{timeline.period}</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Participation Rate</span>
                  <span className="text-astu-navy font-bold">{timeline.participationRate}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-navy to-astu-navy h-full rounded-full transition-all duration-500" style={{ width: `${timeline.participationRate}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Employment Rate</span>
                  <span className="text-astu-green font-bold">{timeline.employmentRate}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-astu-green to-blue-400 h-full rounded-full transition-all duration-500" style={{ width: `${timeline.employmentRate}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Satisfaction Rate</span>
                  <span className="text-purple-600 font-bold">{timeline.satisfactionRate}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-purple-600 to-pink-400 h-full rounded-full transition-all duration-500" style={{ width: `${timeline.satisfactionRate}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600 font-medium">Alignment Score</span>
                  <span className="text-astu-red font-bold">{timeline.alignmentScore}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-astu-red to-orange-400 h-full rounded-full transition-all duration-500" style={{ width: `${timeline.alignmentScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TracerTimelineAnalytics;
