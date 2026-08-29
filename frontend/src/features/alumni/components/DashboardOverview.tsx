import React, { useState } from 'react';
import { JobMatch, AlumniProfile, TracerSurvey, CareerMilestone, ForumPost, DonationCampaign } from '../types/alumni.types';
import toast from 'react-hot-toast';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import { ActivityTimeline, ActivityEntry } from '../../../components/ActivityTimeline';
import { alumniService } from '../services/alumni.service';

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
  onUpdateEmploymentStatus: (role: string, company: string, salary: string) => void;
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
  const [tempRole, setTempRole] = useState(profile.currentRole);
  const [tempCompany, setTempCompany] = useState(profile.company);
  const [tempSalary, setTempSalary] = useState(profile.salaryRange || '30,001 - 60,000 ETB');

  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [donationCampaigns, setDonationCampaigns] = useState<DonationCampaign[]>([]);

  React.useEffect(() => {
    alumniService.getForumPosts().then(setForumPosts).catch(console.error);
    alumniService.getDonationCampaigns().then(setDonationCampaigns).catch(console.error);
  }, []);

  // Static/dynamic career milestones
  const milestones: CareerMilestone[] = [
    {
      id: 1,
      year: '2025 - Present',
      title: profile.currentRole || 'Junior Fullstack Engineer',
      company: profile.company || 'Chapa Financial Technologies',
      description: 'Drives user acquisition interfaces, checkouts developer tools, and fintech integrations.',
      type: 'professional'
    },
    {
      id: 2,
      year: '2024',
      title: 'BSc degree in Computer Science and Engineering',
      company: 'Adama Science and Technology University',
      description: `Graduated with Great Distinction (CGPA: ${profile.cgpa || '3.78'}). Focused on Software Systems.`,
      type: 'academic'
    },
    {
      id: 3,
      year: '2023',
      title: 'Software DevOps Intern',
      company: 'Safaricom Telecommunications',
      description: 'Assisted DevOps teams in setting up automated GitLab pipelines and Kubernetes environments.',
      type: 'professional'
    }
  ];

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmploymentStatus(tempRole, tempCompany, tempSalary);
    setIsEditingStatus(false);
    toast.success('Employment status updated successfully!');
  };

  const intelligenceCards = [
    { icon: 'auto_awesome', title: 'AI Career Coach', desc: 'CV score, missing skills, salary path, and job-fit guidance from your profile.', tab: 'career' },
    { icon: 'event_available', title: 'Events & RSVP', desc: 'Career fairs, ASTU reunions, workshops, RSVP status, and ticket QR readiness.', tab: 'career' },
    { icon: 'forum', title: 'Community Network', desc: 'Achievement sharing, alumni posts, mentor conversations, and peer discovery.', tab: 'messages' },
    { icon: 'workspace_premium', title: 'Verified Documents', desc: 'Transcript, certificate, identity badge, and digital download tracking.', tab: 'documents' },
  ];

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
      {/* Welcome Banner with animated gradient */}
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
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Welcome back, {profile.fullName}</h2>
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

      {/* Interactive Employment Status & Tracer Surveys Tracker Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        
        {/* Left: Employment Status Tracking */}
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
                <p className="text-xs uppercase font-extrabold text-gray-400">Position</p>
                <p className="text-md font-bold text-gray-900 mt-0.5">{profile.currentRole || 'Not Employed'}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-extrabold text-gray-400">Company</p>
                <p className="text-md font-bold text-gray-900 mt-0.5">{profile.company || 'ASTU Alumnus'}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-extrabold text-gray-400">Salary Bracket</p>
                <p className="text-xs font-bold text-astu-green bg-astu-green/10 px-2 py-1 rounded mt-1 inline-block">
                  {profile.salaryRange || 'Seeking Opportunities'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Role / Title</label>
                <input
                  type="text"
                  value={tempRole}
                  onChange={(e) => setTempRole(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Company Name</label>
                <input
                  type="text"
                  value={tempCompany}
                  onChange={(e) => setTempCompany(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Monthly Salary Range</label>
                <select
                  value={tempSalary}
                  onChange={(e) => setTempSalary(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-astu-navy/20 focus:outline-none"
                >
                  <option value="Under 15,000 ETB">Under 15,000 ETB</option>
                  <option value="15,000 - 30,000 ETB">15,000 - 30,000 ETB</option>
                  <option value="30,001 - 60,000 ETB">30,001 - 60,000 ETB</option>
                  <option value="60,001 - 100,000 ETB">60,001 - 100,000 ETB</option>
                  <option value="Over 100,000 ETB">Over 100,000 ETB</option>
                </select>
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

        {/* Right: Active Tracer Survey Status Indicators (6, 12, 24 Months) */}
        <div className="lg:col-span-2 rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-red font-bold">assignment_turned_in</span>
            Tracer Survey Timelines (6, 12, 24 Months)
          </h3>
          
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
        </div>

      </div>

      {/* Stats Cards Grid */}
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
            {/* Background gradient */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${stat.bgGradient}`}></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}/20 to-${stat.color}/10`}>
                  <span className={`material-symbols-outlined text-2xl text-${stat.color}`}>{stat.icon}</span>
                </div>
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

      {/* Main Grid: Job Matches (left) and Career Progression Timeline (right) */}
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
          {intelligenceCards.map((card) => (
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
        
        {/* Left Column: Recent Job Matches */}
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
          </section>
        </div>

        {/* Right Column: Career Progression Timeline */}
        <div className="lg:col-span-1">
          <section className="h-full rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-astu-green font-bold">timeline</span>
              Career Timeline
            </h3>

            {/* Vertical timeline structure */}
            <div className="relative pl-6 border-l-2 border-gray-150 space-y-6 py-1">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="relative">
                  {/* Bullet */}
                  <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow flex items-center justify-center ${
                    milestone.type === 'academic' ? 'bg-astu-navy' : 'bg-astu-green'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </span>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400">{milestone.year}</span>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">{milestone.title}</h4>
                    <p className="text-xs font-bold text-astu-navy">{milestone.company}</p>
                    <p className="text-[11px] text-gray-500 leading-normal">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsChart
          type="area"
          title="Employment Rate Trend"
          subtitle="Graduate employment rates over recent years"
          data={[
            { year: '2020', rate: 72 },
            { year: '2021', rate: 76 },
            { year: '2022', rate: 79 },
            { year: '2023', rate: 83 },
            { year: '2024', rate: 87 },
            { year: '2025', rate: 91 },
          ]}
          xKey="year"
          series={[{ key: 'rate', label: 'Employment %' }]}
          height={220}
        />
        <AnalyticsChart
          type="pie"
          title="Skills Distribution"
          subtitle="Top skills reported by alumni"
          data={[
            { name: 'Software Engineering', value: 340 },
            { name: 'Data Science', value: 180 },
            { name: 'DevOps & Cloud', value: 120 },
            { name: 'Electrical Eng.', value: 95 },
            { name: 'Civil Eng.', value: 75 },
          ]}
          xKey="name"
          series={[{ key: 'value', label: 'Alumni Count' }]}
          height={220}
        />
      </div>

      {/* Activity Timeline */}
      <ActivityTimeline
        activities={[
          { id: 1, type: 'job', title: 'New job match: Senior React Developer', description: 'Chapa Financial Technologies posted a role matching your profile.', timestamp: '2h ago', unread: true },
          { id: 2, type: 'survey', title: 'Tracer Survey reminder', description: '12-month tracer survey is due by June 30, 2026.', timestamp: '1d ago', unread: true },
          { id: 3, type: 'event', title: 'ASTU Alumni Meetup 2026', description: 'Annual networking event at ASTU Main Campus on July 15.', timestamp: '3d ago' },
          { id: 4, type: 'document', title: 'Transcript request approved', description: 'Your official transcript has been digitally signed.', timestamp: '5d ago' },
          { id: 5, type: 'message', title: 'Message from HR Manager', description: 'Hilina Sileshi sent you a message about the developer opening.', timestamp: '1w ago' },
        ] as ActivityEntry[]}
        onViewAll={() => onTabChange('messages')}
      />

      {/* Quick Actions */}
      <section className="rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Recommended Next Steps</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: 'edit', title: 'Update Skills', desc: 'Add new technical and soft skills' },
            { icon: 'photo_camera', title: 'Upload Photo', desc: 'Add a professional profile picture' },
            { icon: 'description', title: 'Update Resume', desc: 'Upload your latest resume' }
          ].map((action, idx) => (
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

      {/* Community Feed Section */}
      <section className="rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Alumni Community Feed</h3>
            <p className="text-xs text-gray-500 mt-0.5">Latest updates from your network</p>
          </div>
          <button onClick={() => onTabChange('messages')} className="text-xs font-bold text-astu-navy hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {forumPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-astu-navy/20 transition-all">
              <img src={post.authorAvatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{post.author}</span>
                  <span className="text-[9px] text-gray-400">{post.timestamp}</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <svg className="w-3 h-3" fill={post.liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.comments}
                  </span>
                  <div className="flex gap-1">
                    {post.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-astu-navy/5 text-[8px] font-bold text-astu-navy rounded">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Donation Campaigns */}
      <section className="rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Alumni Giving Campaigns</h3>
            <p className="text-xs text-gray-500 mt-0.5">Support ASTU development initiatives</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {donationCampaigns.slice(0, 3).map((campaign) => {
            const progress = Math.round((campaign.raised / campaign.goal) * 100);
            return (
              <div key={campaign.id} className="rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-astu-navy/10 text-astu-navy text-[9px] font-bold rounded-full uppercase">
                    {campaign.category}
                  </span>
                  <span className="text-[10px] text-gray-400">{campaign.donorCount} donors</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{campaign.title}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3 line-clamp-2">{campaign.description}</p>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-astu-navy">{campaign.raised.toLocaleString()} ETB</span>
                    <span className="text-gray-400">of {campaign.goal.toLocaleString()} ETB</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-astu-navy to-astu-green transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                </div>
                <button
                  onClick={() => toast.success(`Thank you for donating to "${campaign.title}"!`)}
                  className="w-full py-2 bg-gradient-to-r from-astu-navy to-[#004d99] text-white rounded-xl text-[11px] font-bold hover:shadow-lg transition-all"
                >
                  Donate Now
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
