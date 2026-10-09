import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { CurriculumInsight } from '../types/curriculum.types';

interface CurriculumInsightsPanelProps {
  insights: CurriculumInsight[];
}

export const CurriculumInsightsPanel: React.FC<CurriculumInsightsPanelProps> = ({ insights }) => {
  const safeInsights = Array.isArray(insights) ? insights : [];

  const getIcon = (type: CurriculumInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-astu-green" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'concern':
        return <AlertTriangle className="h-5 w-5 text-astu-red" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: CurriculumInsight['type']) => {
    switch (type) {
      case 'success':
        return 'from-emerald-50 to-green-50 border-emerald-200';
      case 'warning':
        return 'from-yellow-50 to-orange-50 border-yellow-200';
      case 'concern':
        return 'from-red-50 to-orange-50 border-red-200';
      default:
        return 'from-blue-50 to-indigo-50 border-blue-200';
    }
  };

  const getTextColor = (type: CurriculumInsight['type']) => {
    switch (type) {
      case 'success':
        return 'text-astu-green';
      case 'warning':
        return 'text-yellow-600';
      case 'concern':
        return 'text-astu-red';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Executive Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeInsights.map((insight) => (
          <div
            key={insight.id}
            className={`p-5 bg-gradient-to-br ${getBgColor(insight.type)} border rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {getIcon(insight.type)}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50">
              <div>
                <p className="text-xs text-gray-500">{insight.metric}</p>
                <p className={`text-lg font-bold ${getTextColor(insight.type)}`}>{insight.value}</p>
              </div>
              {insight.recommendation && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <ArrowRight className="h-3 w-3" />
                  <span>View</span>
                </div>
              )}
            </div>

            {insight.recommendation && (
              <div className="mt-3 pt-3 border-t border-gray-200/50">
                <p className="text-xs text-gray-600 italic">{insight.recommendation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumInsightsPanel;
