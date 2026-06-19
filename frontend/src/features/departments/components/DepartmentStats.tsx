import React, { useState } from 'react';
import { Briefcase, Users, DollarSign, FileCheck, Building2, AlertTriangle, TrendingUp, Plus, AlertCircle } from 'lucide-react';
import { DepartmentMetric } from '../types/department.types';

interface DepartmentStatsProps {
  stats: DepartmentMetric[];
}

export const DepartmentStats: React.FC<DepartmentStatsProps> = ({ stats }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'Briefcase': Briefcase,
      'Users': Users,
      'DollarSign': DollarSign,
      'FileCheck': FileCheck,
      'Building2': Building2,
      'AlertTriangle': AlertTriangle,
      'TrendingUp': TrendingUp,
      'Plus': Plus,
      'AlertCircle': AlertCircle,
    };
    const Icon = iconMap[iconName] || TrendingUp;
    return <Icon className="h-5 w-5" />;
  };

  const getTrendIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'TrendingUp': TrendingUp,
      'Plus': Plus,
      'AlertCircle': AlertCircle,
    };
    const Icon = iconMap[iconName] || TrendingUp;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          onMouseEnter={() => setHoveredCard(stat.id)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group ${hoveredCard === stat.id ? 'translate-y-[-8px]' : ''}`}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${stat.bgGradient}`}></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}/20 to-${stat.color}/10`}>
                <span className={`text-${stat.color}`}>
                  {getIconComponent(stat.icon)}
                </span>
              </div>
              <span className="text-xs font-semibold text-astu-green bg-astu-green/15 px-3 py-1 rounded-full">Key</span>
            </div>

            <p className="text-sm text-gray-600 font-medium mb-2">{stat.label}</p>
            <p className={`text-4xl font-bold text-${stat.color} mb-3`}>{stat.value}</p>

            <div className="flex items-center gap-1 text-astu-green text-sm font-medium">
              {getTrendIconComponent(stat.trendIcon)}
              {stat.trend}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DepartmentStats;
