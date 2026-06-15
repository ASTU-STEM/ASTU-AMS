import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import { SkillGapRecommendation } from '../types/skillGap.types';

interface SkillGapRecommendationsProps {
  data: SkillGapRecommendation[];
  darkMode?: boolean;
}

export const SkillGapRecommendations: React.FC<SkillGapRecommendationsProps> = ({ data, darkMode = false }) => {
  const groupedData = data.reduce((acc, rec) => {
    if (!acc[rec.priority]) {
      acc[rec.priority] = [];
    }
    acc[rec.priority].push(rec);
    return acc;
  }, {} as Record<string, SkillGapRecommendation[]>);

  const getPriorityColor = (priority: SkillGapRecommendation['priority']) => {
    switch (priority) {
      case 'immediate':
        return 'text-astu-red bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: SkillGapRecommendation['priority']) => {
    switch (priority) {
      case 'immediate':
        return <AlertTriangle className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <Clock className="h-5 w-5" />;
      case 'low':
        return <Target className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: SkillGapRecommendation['impactLevel']) => {
    switch (impact) {
      case 'high':
        return 'text-astu-green bg-blue-100';
      case 'medium':
        return 'text-astu-navy bg-blue-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200/60'}`}>
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-2xl text-astu-navy" />
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Priority Recommendations</h3>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedData).map(([priority, recommendations]) => (
          <div key={priority} className={`p-5 border rounded-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${getPriorityColor(priority as SkillGapRecommendation['priority'])}`}>
                {getPriorityIcon(priority as SkillGapRecommendation['priority'])}
              </div>
              <h4 className={`text-lg font-bold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>{priority} Priority</h4>
            </div>
            
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className={`p-4 border rounded-xl hover:shadow-md transition-all ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200/60'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{rec.action}</h5>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(rec.impactLevel)}`}>
                        {rec.impactLevel} impact
                      </span>
                    </div>
                  </div>
                  <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{rec.rationale}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Timeline:</span>
                      <span className="text-xs font-bold text-astu-navy">{rec.suggestedTimeline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Departments:</span>
                      <div className="flex -space-x-2">
                        {rec.affectedDepartments.slice(0, 3).map((dept, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-full bg-astu-navy/10 border-2 flex items-center justify-center text-xs font-bold text-astu-navy ${darkMode ? 'border-slate-700' : 'border-white'}`}
                            title={dept}
                          >
                            {dept.charAt(0)}
                          </div>
                        ))}
                        {rec.affectedDepartments.length > 3 && (
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-slate-600 border-slate-700 text-gray-300' : 'bg-gray-200 border-white text-gray-600'}`}>
                            +{rec.affectedDepartments.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillGapRecommendations;
