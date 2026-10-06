import React from 'react';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { CareerAlignmentData } from '../types/tracer.types';

interface CareerAlignmentAnalyticsProps {
  data: CareerAlignmentData[];
  benchmarks?: {
    industryBenchmark?: number;
    departmentAverage?: number;
    topPerformerScore?: number;
    topPerformerDept?: string;
  };
  darkMode?: boolean;
}

export const CareerAlignmentAnalytics: React.FC<CareerAlignmentAnalyticsProps> = ({ data, benchmarks, darkMode = false }) => {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-astu-green" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-astu-red" />;
    return <Target className="h-4 w-4 text-gray-400" />;
  };

  const indBench = benchmarks?.industryBenchmark ?? 78;
  const deptAvg = benchmarks?.departmentAverage ?? (data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length) : 0);
  const topScore = benchmarks?.topPerformerScore ?? 92;
  const topDept = benchmarks?.topPerformerDept || 'Software Engineering';

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Career Alignment Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {data.map((metric, idx) => (
          <div key={idx} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{metric.metric}</p>
            <p className="text-3xl font-bold text-astu-navy mb-3">{metric.score}%</p>
            <div className="flex items-center gap-2 mb-3">
              {getTrendIcon(metric.trend)}
              <span className={`text-sm font-medium ${metric.trend > 0 ? 'text-astu-green' : metric.trend < 0 ? 'text-astu-red' : 'text-gray-400'}`}>
                {metric.trend > 0 ? '+' : ''}{metric.trend}%
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>High</span>
                <span className="text-astu-green font-bold">{metric.distribution.high}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-astu-green h-full rounded-full" style={{ width: `${metric.distribution.high}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Medium</span>
                <span className="text-yellow-600 font-bold">{metric.distribution.medium}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${metric.distribution.medium}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Low</span>
                <span className="text-astu-red font-bold">{metric.distribution.low}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                <div className="bg-astu-red h-full rounded-full" style={{ width: `${metric.distribution.low}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-gray-200/60'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Industry Benchmark</p>
          <p className="text-2xl font-bold text-astu-green">{indBench}%</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average alignment score</p>
        </div>
        <div className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-gray-200/60'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Department Average</p>
          <p className="text-2xl font-bold text-astu-navy">{deptAvg}%</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{deptAvg >= indBench ? 'Above industry benchmark' : 'Below industry benchmark'}</p>
        </div>
        <div className={`p-4 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-gray-200/60'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Top Performer</p>
          <p className="text-2xl font-bold text-purple-600">{topScore}%</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{topDept}</p>
        </div>
      </div>
    </div>
  );
};

export default CareerAlignmentAnalytics;
