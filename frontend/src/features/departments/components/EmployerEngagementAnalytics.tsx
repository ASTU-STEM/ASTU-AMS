import React from 'react';
import { Users, Building2, Briefcase, Handshake, TrendingUp, TrendingDown } from 'lucide-react';
import { EmployerEngagement } from '../types/employerFeedback.types';

interface EmployerEngagementAnalyticsProps {
  data: EmployerEngagement[];
}

export const EmployerEngagementAnalytics: React.FC<EmployerEngagementAnalyticsProps> = ({ data }) => {
  const sortedByHiring = [...data].sort((a, b) => b.graduatesHired - a.graduatesHired);
  const sortedByCollaboration = [...data].sort((a, b) => b.collaborationScore - a.collaborationScore);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center gap-3 mb-6">
        <Handshake className="text-2xl text-astu-navy" />
        <h3 className="text-xl font-bold text-gray-900">Employer Engagement Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {data.map((engagement, idx) => (
          <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-astu-navy/10 flex items-center justify-center">
                <Building2 className="text-astu-navy h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{engagement.employer}</p>
                <p className="text-xs text-gray-500">{engagement.industry}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-600">Participation</span>
                  <span className="text-astu-navy font-bold">{engagement.participationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-astu-navy h-full rounded-full" style={{ width: `${engagement.participationRate}%` }}></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Graduates Hired</span>
                <span className="text-astu-green font-bold">{engagement.graduatesHired}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Collaboration Score</span>
                <span className="text-purple-600 font-bold">{engagement.collaborationScore}/100</span>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                {engagement.internshipProvided && (
                  <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded-full flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Internship
                  </span>
                )}
                {engagement.recruitmentPartner && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Partner
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Employers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Top Hiring Partners</h4>
          <div className="space-y-3">
            {sortedByHiring.slice(0, 3).map((employer, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200/60 rounded-xl flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <div className="w-8 h-8 rounded-full bg-astu-green/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-astu-green">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{employer.employer}</p>
                    <p className="text-xs text-gray-500">{employer.industry}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-astu-green">{employer.graduatesHired}</p>
                  <p className="text-xs text-gray-500">hired</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Highest Collaboration</h4>
          <div className="space-y-3">
            {sortedByCollaboration.slice(0, 3).map((employer, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-gray-200/60 rounded-xl flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <div className="w-8 h-8 rounded-full bg-purple-600/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{employer.employer}</p>
                    <p className="text-xs text-gray-500">{employer.industry}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">{employer.collaborationScore}</p>
                  <p className="text-xs text-gray-500">score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerEngagementAnalytics;
