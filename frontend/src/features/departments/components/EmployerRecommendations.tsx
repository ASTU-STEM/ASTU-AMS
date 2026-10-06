import React from 'react';
import { Lightbulb, BookOpen, FlaskConical, Briefcase, GraduationCap, Award, AlertCircle } from 'lucide-react';
import { EmployerRecommendation } from '../types/employerFeedback.types';

interface EmployerRecommendationsProps {
  data: EmployerRecommendation[];
}

export const EmployerRecommendations: React.FC<EmployerRecommendationsProps> = ({ data }) => {
  const getCategoryIcon = (category: EmployerRecommendation['category']) => {
    switch (category) {
      case 'curriculum':
        return <BookOpen className="h-5 w-5" />;
      case 'laboratory':
        return <FlaskConical className="h-5 w-5" />;
      case 'internship':
        return <Briefcase className="h-5 w-5" />;
      case 'research':
        return <Lightbulb className="h-5 w-5" />;
      case 'softSkills':
        return <GraduationCap className="h-5 w-5" />;
      case 'certification':
        return <Award className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: EmployerRecommendation['category']) => {
    switch (category) {
      case 'curriculum':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'laboratory':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'internship':
        return 'text-astu-green bg-emerald-50 border-emerald-200';
      case 'research':
        return 'text-astu-navy bg-blue-50 border-blue-200';
      case 'softSkills':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'certification':
        return 'text-astu-red bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: EmployerRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-astu-red bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: EmployerRecommendation['impactLevel']) => {
    switch (impact) {
      case 'high':
        return 'text-astu-green bg-emerald-100';
      case 'medium':
        return 'text-blue-600 bg-blue-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const hasData = Array.isArray(data) && data.length > 0;

  const groupedData = hasData ? data.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, EmployerRecommendation[]>) : {};

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Employer Recommendations</h3>
      </div>

      {!hasData ? (
        <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No Employer Recommendations</p>
          <p className="text-xs text-gray-500 mt-1">There are no employer feedback recommendations recorded in the database for this department yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedData).map(([category, recommendations]) => (
            <div key={category} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${getCategoryColor(category as EmployerRecommendation['category'])}`}>
                  {getCategoryIcon(category as EmployerRecommendation['category'])}
                </div>
                <h4 className="text-lg font-bold text-gray-900 capitalize">{category}</h4>
              </div>
              
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 bg-white border border-gray-200/60 rounded-xl hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-sm font-bold text-gray-900">{rec.title}</h5>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(rec.impactLevel)}`}>
                          {rec.impactLevel} impact
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Frequency:</span>
                        <span className="text-xs font-bold text-astu-navy">{rec.frequency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">From:</span>
                        <div className="flex -space-x-2">
                          {rec.sourceEmployers.slice(0, 3).map((employer, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-astu-navy/10 border-2 border-white flex items-center justify-center text-xs font-bold text-astu-navy"
                              title={employer}
                            >
                              {employer.charAt(0)}
                            </div>
                          ))}
                          {rec.sourceEmployers.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                              +{rec.sourceEmployers.length - 3}
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
      )}
    </div>
  );
};

export default EmployerRecommendations;
