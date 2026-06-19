import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { TracerKPIMetric } from '../types/tracer.types';

interface TracerKPIProps {
  metrics: TracerKPIMetric[];
  darkMode?: boolean;
}

export const TracerKPI: React.FC<TracerKPIProps> = ({ metrics, darkMode = false }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'TrendingUp': TrendingUp,
      'TrendingDown': TrendingDown,
      'Minus': Minus,
    };
    const Icon = iconMap[iconName] || TrendingUp;
    return <Icon className="h-4 w-4" />;
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-astu-green" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-astu-red" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const renderSparkline = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return (
      <svg className="w-full h-12" viewBox="0 0 100 40">
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 40 - ((value - min) / range) * 35;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color === 'astu-green' ? '#10B981' : color === 'astu-red' ? '#DC2626' : color === 'astu-navy' ? '#003366' : '#6B7280'}
            />
          );
        })}
        <polyline
          points={data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 40 - ((value - min) / range) * 35;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke={color === 'astu-green' ? '#10B981' : color === 'astu-red' ? '#DC2626' : color === 'astu-navy' ? '#003366' : '#6B7280'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          onMouseEnter={() => setHoveredCard(metric.id)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative rounded-2xl p-6 border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group ${hoveredCard === metric.id ? 'translate-y-[-4px]' : ''} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}
        >
          {/* Tooltip */}
          {hoveredCard === metric.id && (
            <div className="absolute top-2 right-2 z-20">
              <div className="relative group/tooltip">
                <Info className={`h-4 w-4 cursor-help ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <div className="absolute right-0 top-6 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-30">
                  {metric.tooltip}
                </div>
              </div>
            </div>
          )}

          {/* Background gradient */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-${metric.color}/5 to-${metric.color}/10`}></div>

          <div className="relative z-10">
            {/* Label */}
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{metric.label}</p>

            {/* Value */}
            <p className={`text-3xl font-bold mb-3 text-${metric.color}`}>{metric.value}</p>

            {/* Trend */}
            <div className="flex items-center gap-2 mb-4">
              {getTrendIcon(metric.trendDirection)}
              <span className={`text-sm font-medium ${metric.trendDirection === 'up' ? 'text-astu-green' : metric.trendDirection === 'down' ? 'text-astu-red' : 'text-gray-400'}`}>
                {metric.trend > 0 ? '+' : ''}{metric.trend}%
              </span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{metric.comparison}</span>
            </div>

            {/* Sparkline */}
            <div className="h-12">
              {renderSparkline(metric.sparkline, metric.color)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TracerKPI;
