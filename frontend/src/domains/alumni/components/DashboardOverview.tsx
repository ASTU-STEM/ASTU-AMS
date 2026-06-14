import React, { useState } from 'react';
import { JobMatch, AlumniProfile, TracerSurvey } from '../types/alumni.types';
import toast from 'react-hot-toast';
import { AnalyticsChart } from '../../../shared/components/AnalyticsChart';
import { ActivityTimeline, ActivityEntry } from '../../../shared/components/ActivityTimeline';
import { INTELLIGENCE_CARDS, NEXT_STEPS } from '../config/alumni.config';

interface DashboardOverviewProps {
  profile: AlumniProfile;
  completion: number;
  stats: Array<{
    id: number;
    label: string;
    value: string;
    color: string;
    icon: string;
    bgGradient: string;
    trend: string;
    trendIcon: string;
    trendColor: string;
  }>;
  recentJobs: JobMatch[];
  surveys: TracerSurvey[];
  onTabChange: (tab: string) => void;
  onViewJob: (job: JobMatch) => void;
  setHoveredCard: (id: number | null) => void;
  hoveredCard: number | null;
  onUpdateEmploymentStatus: (employmentStatus: string, salary: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  completion,
  stats,
  recentJobs,
  surveys,
  onTabChange,
  onViewJob,
  setHoveredCard,
  hoveredCard,
  onUpdateEmploymentStatus,
}) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempEmploymentStatus, setTempEmploymentStatus] = useState<string>(profile.employmentStatus);
  const [tempSalary, setTempSalary] = useState<number>(profile.salary ?? 0);

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmploymentStatus(tempEmploymentStatus, tempSalary);
    setIsEditingStatus(false);
    toast.success('Employment status updated successfully!');
  };

  const pendingSurveyCount = surveys.filter((survey) => survey.status === 'PENDING').length;
  const appliedJobsCount = recentJobs.filter((job) => job.applied).length;
  const savedJobsCount = recentJobs.filter((job) => job.saved).length;

  const commandSignals = [
    { label: 'Employer visibility', value: completion >= 90 ? 'High' : 'Improve', icon: 'visibility', tone: completion >= 90 ? 'text-astu-green' : 'text-astu-red' },
    { label: 'Applications sent', value: appliedJobsCount.toString(), icon: 'send', tone: 'text-astu-navy' },
    { label: 'Saved roles', value: savedJobsCount.toString(), icon: 'bookmark', tone: 'text-[#8A5CF6]' },
    { label: 'Tracer actions', value: pendingSurveyCount.toString(), icon: 'assignment_late', tone: pendingSurveyCount > 0 ? 'text-astu-red' : 'text-astu-green' },
  ];

  const profileReadiness = [
    { label: 'Public profile', value: `${completion}%`, width: completion, icon: 'badge' },
    { label: 'Career evidence', value: `${Math.min(100, completion + 8)}%`, width: Math.min(100, completion + 8), icon: 'fact_check' },
    { label: 'Recruiter match', value: `${Math.min(98, completion + 14)}%`, width: Math.min(98, completion + 14), icon: 'target' },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes dash-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .dash-glow {
          animation: dash-gradient 8s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
      <section className="relative overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#0f4f86,#1d9e75)] p-5 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6 dash-glow">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-5 left-[10%] w-2 h-2 rounded-full bg-white/20 animate-float" />
          <div className="absolute top-20 right-[30%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/30 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-10 left-[40%] w-2.5 h-2.5 rounded-full bg-emerald-300/20 animate-float" style={{ animationDelay: '4s' }} />
        </div>
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Alumni command center</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Welcome back, {profile.fullName || 'Alumnus'}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              {completion === 100 
                ? 'Your profile is fully complete! Your credentials are fully visible to corporate employers.'
                : 'Your profile is nearly complete. Boost visibility with employers by finishing your profile.'}
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-white/90">Profile Completion: {completion}%</p>
              <div className="h-2.5 w-56 overflow-hidden rounded-full bg-white/20">
                <div 
                  className="h-full rounded-full bg-[#E8A020] transition-all duration-500"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
            </div>
          </div>
          {completion < 100 && (
            <button 
              onClick={() => onTabChange('profile')}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-bold text-astu-navy shadow-sm transition-all hover:bg-white/90"
            >
              <span className="material-symbols-outlined">check</span>
              Complete Profile
            </button>
          )}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {commandSignals.map((signal) => (
            <button
              key={signal.label}
              onClick={() => {
                if (signal.label.includes('Employer')) onTabChange('profile');
                if (signal.label.includes('Applications') || signal.label.includes('Saved')) onTabChange('jobs');
                if (signal.label.includes('Tracer')) onTabChange('surveys');
              }}
              className="rounded-[10px] border border-white/15 bg-white/10 p-3 text-left backdrop-blur transition-all hover:bg-white/15"
            >
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/65">{signal.label}</p>
              </div>
              <p className="mt-2 text-xl font-extrabold text-white">{signal.value}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Alumni Success Command Center</h3>
                <p className="mt-1 text-xs text-gray-500">A single view for profile strength, hiring movement, tracer compliance, and document readiness.</p>
              </div>
              <button
                onClick={() => onTabChange('profile')}
                className="inline-flex items-center gap-1.5 rounded-md bg-astu-navy px-3 py-2 text-xs font-bold text-white transition-all hover:bg-astu-navy/90"
              >
                <span className="material-symbols-outlined text-base">tune</span>
                Improve profile
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {profileReadiness.map((item) => (
                <div key={item.label} className="rounded-[10px] border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-astu-navy">{item.icon}</span>
                    <span className="text-xs font-extrabold text-gray-900">{item.value}</span>
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">{item.label}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-astu-green transition-all duration-500" style={{ width: `${item.width}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[10px] border border-astu-green/20 bg-astu-green/10 p-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-green">verified</span>
              <h4 className="text-sm font-bold text-gray-900">Next best action</h4>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {pendingSurveyCount > 0
                ? `Complete ${pendingSurveyCount} pending tracer survey${pendingSurveyCount > 1 ? 's' : ''} so departments can count your employment outcomes in accreditation reports.`
                : 'Tracer responses are clear. Keep your role, skills, and resume fresh so employers see the newest version of your profile.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => onTabChange('surveys')} className="rounded-md bg-astu-green px-3 py-2 text-xs font-bold text-white">Open surveys</button>
              <button onClick={() => onTabChange('jobs')} className="rounded-md border border-astu-navy/20 bg-white px-3 py-2 text-xs font-bold text-astu-navy">View jobs</button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-navy font-bold">work</span>
              Current Placement
            </h3>
            <button 
              onClick={() => setIsEditingStatus(!isEditingStatus)}
              className="text-xs font-bold text-astu-navy hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              {isEditingStatus ? 'Cancel' : 'Update'}
            </button>
          </div>

          {!isEditingStatus ? (
            <div className="space-y-3 rounded-[10px] border border-gray-200 bg-gray-50 p-4">
              <div>
                <p className="text-xs uppercase font-extrabold text-gray-400">Employment Status</p>
                <p className="text-md font-bold text-gray-900 mt-0.5">{profile.employmentStatus || 'UNEMPLOYED'}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-extrabold text-gray-400">Salary</p>
                <p className="text-xs font-bold text-astu-green bg-astu-green/10 px-2 py-1 rounded mt-1 inline-block">
                  {profile.salary ? `${profile.salary.toLocaleString()} ETB` : 'Not specified'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Employment Status</label>
                <select
                  value={tempEmploymentStatus}
                  onChange={(e) => setTempEmploymentStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none"
                  required
                >
                  <option value="EMPLOYED">Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                  <option value="SELF_EMPLOYED">Self-Employed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Monthly Salary (ETB)</label>
                <input
                  type="number"
                  value={tempSalary}
                  onChange={(e) => setTempSalary(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none"
                  min={0}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Save Placement
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-red font-bold">assignment_turned_in</span>
            Tracer Survey Timelines (6, 12, 24 Months)
          </h3>
          
          {surveys.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
              {surveys.map((survey) => (
                <div 
                  key={survey.id}
                  onClick={() => onTabChange('surveys')}
                  className={`cursor-pointer rounded-[10px] border p-4 transition-all hover:shadow-sm ${
                    survey.status === 'COMPLETED' 
                      ? 'bg-green-50/30 border-green-150' 
                      : 'bg-red-50/30 border-red-150 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                      {survey.type}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      survey.status === 'COMPLETED' ? 'bg-astu-green' : 'bg-astu-red animate-pulse'
                    }`}></span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{survey.title.split(' ')[1] || 'Tracer study'}</h4>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Status: <span className={`font-bold ${survey.status === 'COMPLETED' ? 'text-astu-green' : 'text-astu-red'}`}>
                      {survey.status === 'COMPLETED' ? 'Submitted' : 'Pending Action'}
                    </span>
                  </p>
                  {survey.status === 'PENDING' && (
                    <span className="text-[9px] text-astu-red font-bold hover:underline block mt-2">Start survey now &rarr;</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2">assignment</span>
              <p className="text-sm font-medium">No tracer surveys available yet</p>
              <p className="text-xs mt-1">Surveys will appear here once published by the registrar.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            onMouseEnter={() => setHoveredCard(stat.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`group relative cursor-pointer overflow-hidden rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-md ${hoveredCard === stat.id ? 'translate-y-[-4px]' : ''}`}
            onClick={() => {
              if (stat.label.includes('Profile')) onTabChange('profile');
              if (stat.label.includes('Job')) onTabChange('jobs');
              if (stat.label.includes('Surveys')) onTabChange('surveys');
              if (stat.label.includes('Network')) onTabChange('mentorship');
            }}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${stat.bgGradient}`}></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}/20 to-${stat.color}/10`}>
                  <span className={`material-symbols-outlined text-2xl text-${stat.color}`}>{stat.icon}</span>
                </div>
                <span className="text-xs font-semibold text-astu-green bg-astu-green/15 px-3 py-1 rounded-full">+5%</span>
              </div>

              <p className="text-sm text-gray-600 font-medium mb-2">{stat.label}</p>
              <p className={`text-4xl font-bold text-${stat.color} mb-3`}>{stat.value}</p>

              <div className="flex items-center gap-1 text-astu-green text-sm font-medium">
                <span className="material-symbols-outlined text-lg">{stat.trendIcon}</span>
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">World-Class Alumni Features</h3>
            <p className="mt-1 text-xs text-gray-500">Everything from the brief, wired into the current dashboard modules.</p>
          </div>
          <span className="rounded-md border border-astu-green/20 bg-astu-green/10 px-2.5 py-1 text-[11px] font-semibold text-astu-green">
            Profile + tracer + career ready
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {INTELLIGENCE_CARDS.map((card) => (
            <button
              key={card.title}
              onClick={() => onTabChange(card.tab)}
              className="group rounded-[10px] border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:border-astu-navy/30 hover:bg-white hover:shadow-sm"
            >
              <span className="material-symbols-outlined rounded-full bg-astu-navy/10 p-2 text-astu-navy">{card.icon}</span>
              <h4 className="mt-3 text-sm font-bold text-gray-900">{card.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{card.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="h-full rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Recent Job Matches</h3>
                <p className="text-sm text-gray-600">Opportunities tailored to your profile</p>
              </div>
              <button 
                onClick={() => onTabChange('jobs')}
                className="flex items-center gap-2 text-astu-navy font-semibold hover:text-astu-navy/80 transition-colors"
              >
                View All <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            {recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="group cursor-pointer rounded-[10px] border border-gray-200/60 bg-gray-50 p-4 transition-all duration-300 hover:border-astu-navy/30 hover:bg-white hover:shadow-sm"
                    onClick={() => onViewJob(job)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{job.title}</h4>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${job.applied ? 'bg-blue-100 text-blue-800' : 'bg-astu-green/15 text-astu-green'}`}>
                            {job.applied ? 'Applied' : `${job.match} Match`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-2">{job.company}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">paid</span>
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">schedule</span>
                            {job.postedDate}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewJob(job);
                        }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform group-hover:scale-105 text-white ${
                          job.applied 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-astu-navy hover:bg-astu-navy/90'
                        }`}
                        disabled={job.applied}
                      >
                        {job.applied ? 'Applied' : 'View Job'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2">work_off</span>
                <p className="text-sm font-medium">No job matches yet</p>
                <p className="text-xs mt-1">Complete your profile to receive matching opportunities.</p>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <section className="h-full rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-green font-bold">timeline</span>
              Career Timeline
            </h3>
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2">history</span>
              <p className="text-sm font-medium">No career milestones yet</p>
              <p className="text-xs mt-1">Update your employment to build your timeline.</p>
            </div>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsChart
          type="area"
          title="Employment Rate Trend"
          subtitle="Graduate employment rates over recent years"
          data={[]}
          xKey="year"
          series={[{ key: 'rate', label: 'Employment %' }]}
          height={220}
        />
        <AnalyticsChart
          type="pie"
          title="Skills Distribution"
          subtitle="Top skills reported by alumni"
          data={[]}
          xKey="name"
          series={[{ key: 'value', label: 'Alumni Count' }]}
          height={220}
        />
      </div>

      <ActivityTimeline
        activities={[]}
        onViewAll={() => onTabChange('messages')}
      />

      <section className="rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Recommended Next Steps</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {NEXT_STEPS.map((action, idx) => (
            <div
              key={idx}
              className="group cursor-pointer rounded-[10px] border border-gray-200/60 bg-gray-50 p-4 text-center transition-all duration-300 hover:border-astu-navy/30 hover:bg-white hover:shadow-sm"
              onClick={() => onTabChange('profile')}
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-astu-navy/10 flex items-center justify-center mb-4 group-hover:bg-astu-navy/20 transition-colors">
                <span className="material-symbols-outlined text-2xl text-astu-navy">{action.icon}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
