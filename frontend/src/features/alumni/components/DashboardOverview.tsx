import React, { useState } from 'react';
import { JobMatch, AlumniProfile, TracerSurvey, CareerMilestone } from '../types/alumni.types';
import toast from 'react-hot-toast';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import { ActivityTimeline, ActivityEntry } from '../../../components/ActivityTimeline';

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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative bg-gradient-to-r from-astu-navy via-blue-800 to-blue-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-astu-green/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Welcome back, {profile.fullName}! 👋</h2>
            <p className="text-lg opacity-95 leading-relaxed mb-6">
              {completion === 100 
                ? 'Your profile is fully complete! Your credentials are fully visible to corporate employers.'
                : 'Your profile is nearly complete. Boost visibility with employers by finishing your profile.'}
            </p>

            <div className="space-y-3">
              <p className="text-sm font-semibold opacity-90">Profile Completion: {completion}%</p>
              <div className="w-48 bg-white/20 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="bg-gradient-to-r from-astu-green to-emerald-400 h-full rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
            </div>
          </div>
          {completion < 100 && (
            <button 
              onClick={() => onTabChange('profile')}
              className="bg-gradient-to-r from-astu-green to-emerald-500 hover:from-astu-green hover:to-emerald-600 px-10 py-4 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-2"
            >
              <span className="material-symbols-outlined">check</span>
              Complete Profile
            </button>
          )}
        </div>
      </section>

      {/* Interactive Employment Status & Tracer Surveys Tracker Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Employment Status Tracking */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-4">
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
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-3">
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
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-red font-bold">assignment_turned_in</span>
            Tracer Survey Timelines (6, 12, 24 Months)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {surveys.map((survey) => (
              <div 
                key={survey.id}
                onClick={() => onTabChange('surveys')}
                className={`p-4 border rounded-2xl cursor-pointer transition-all hover:shadow-sm ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            onMouseEnter={() => setHoveredCard(stat.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group ${hoveredCard === stat.id ? 'translate-y-[-8px]' : ''}`}
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

      {/* Main Grid: Job Matches (left) and Career Progression Timeline (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Job Matches */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60 h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Recent Job Matches</h3>
                <p className="text-sm text-gray-600">Opportunities tailored to your profile</p>
              </div>
              <button 
                onClick={() => onTabChange('jobs')}
                className="flex items-center gap-2 text-astu-navy font-semibold hover:text-astu-navy/80 transition-colors"
              >
                View All <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-4">
              {recentJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200/60 rounded-2xl hover:shadow-lg hover:border-astu-navy/30 transition-all duration-300 group cursor-pointer"
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
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/60 h-full space-y-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Recommended Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'edit', title: 'Update Skills', desc: 'Add new technical and soft skills' },
            { icon: 'photo_camera', title: 'Upload Photo', desc: 'Add a professional profile picture' },
            { icon: 'description', title: 'Update Resume', desc: 'Upload your latest resume' }
          ].map((action, idx) => (
            <div
              key={idx}
              className="group p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-2xl hover:shadow-lg hover:border-astu-navy/30 transition-all duration-300 cursor-pointer text-center"
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
