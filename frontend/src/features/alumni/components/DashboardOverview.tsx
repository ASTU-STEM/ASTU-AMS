import React, { useState } from 'react';
import { JobMatch, AlumniProfile, TracerSurvey, CareerMilestone, ForumPost, DonationCampaign, DocumentRequest } from '../types/alumni.types';
import { ActivityTimeline, ActivityEntry } from '../../../components/ActivityTimeline';
import { alumniService } from '../services/alumni.service';
import { DashboardBroadcastHero } from '../../../components/DashboardBroadcastHero';
import { DashboardWelcomeBanner, DashboardStatGrid, DashboardQuickNav } from '../../../components/dashboard';

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
  documents?: DocumentRequest[];
  statsData?: {
    appliedJobs?: number;
    savedJobs?: number;
    openJobMatches?: number;
    upcomingEvents?: number;
    networkConnections?: number;
    documentRequests?: number;
  } | null;
  onTabChange: (tab: string) => void;
  onViewJob: (job: JobMatch) => void;
  setHoveredCard: (id: number | null) => void;
  hoveredCard: number | null;
  onUpdateEmploymentStatus: (role: string, company: string, salary: string) => void;
  onDonate?: (campaignId: string, campaign?: DonationCampaign) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  completion,
  stats,
  recentJobs,
  surveys,
  documents = [],
  statsData,
  onTabChange,
  onViewJob,
  setHoveredCard: _setHoveredCard,
  hoveredCard: _hoveredCard,
  onUpdateEmploymentStatus,
  onDonate,
}) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempRole, setTempRole] = useState(profile.currentRole);
  const [tempCompany, setTempCompany] = useState(profile.company);
  const [tempSalary, setTempSalary] = useState(profile.salaryRange || '—');
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [donationCampaigns, setDonationCampaigns] = useState<DonationCampaign[]>([]);

  React.useEffect(() => {
    alumniService.getForumPosts().then((res: any) => {
      if (res && Array.isArray(res.posts)) {
        setForumPosts(res.posts);
      } else if (Array.isArray(res)) {
        setForumPosts(res);
      }
    }).catch(console.error);

    alumniService.getDonationCampaigns().then((res: any) => {
      if (Array.isArray(res)) setDonationCampaigns(res);
    }).catch(console.error);
  }, []);

  const deptLabel = typeof profile.department === 'object'
    ? (profile.department as { name?: string })?.name
    : profile.department;
  const milestones: CareerMilestone[] = [
    {
      id: 1,
      year: 'Present',
      title: profile.currentRole || 'Update your current role',
      company: profile.company || 'Add your employer',
      description: profile.bio
        ? profile.bio.slice(0, 140)
        : 'Keep your employment details current so recruiters and ASTU officers see accurate placement data.',
      type: 'professional'
    },
    {
      id: 2,
      year: String(profile.graduationYear || profile.batch || 'Graduation'),
      title: deptLabel ? `Graduate — ${deptLabel}` : 'ASTU Graduate',
      company: 'Adama Science and Technology University',
      description: `Academic record on file${profile.cgpa ? ` (CGPA: ${profile.cgpa})` : ''}. Complete tracer surveys to keep outcomes updated.`,
      type: 'academic'
    },
  ];

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmploymentStatus(tempRole, tempCompany, tempSalary);
    setIsEditingStatus(false);
  };

  const intelligenceCards = [
    { icon: 'auto_awesome', title: 'AI Career Coach', desc: 'CV score, missing skills, salary path, and job-fit guidance from your profile.', tab: 'career' },
    { icon: 'event_available', title: 'Events & RSVP', desc: 'Career fairs, ASTU reunions, workshops, RSVP status, and ticket QR readiness.', tab: 'career' },
    { icon: 'forum', title: 'Community Network', desc: 'Achievement sharing, alumni posts, mentor conversations, and peer discovery.', tab: 'messages' },
    { icon: 'workspace_premium', title: 'Verified Documents', desc: 'Transcript, certificate, identity badge, and digital download tracking.', tab: 'documents' },
  ];

  const pendingSurveyCount = surveys.filter((survey) => survey.status === 'PENDING').length;
  const completedSurveyCount = surveys.filter((survey) => survey.status === 'COMPLETED').length;
  const totalSurveyCount = surveys.length;
  const tracerCompliance = totalSurveyCount > 0 ? Math.round((completedSurveyCount / totalSurveyCount) * 100) : 0;

  const approvedDocsCount = documents.filter((d) => d.status === 'Approved' || d.status === 'Dispatched').length;
  const documentReadiness = documents.length > 0 ? Math.round((approvedDocsCount / documents.length) * 100) : 0;

  // Prefer server-counted values; fall back to the already-loaded lists so the
  // dashboard never renders invented figures.
  const appliedJobsCount = statsData?.appliedJobs ?? recentJobs.filter((job) => job.applied).length;
  const savedJobsCount = statsData?.savedJobs ?? recentJobs.filter((job) => job.saved).length;
  const openJobMatchesCount = statsData?.openJobMatches ?? recentJobs.filter((job) => !job.applied).length;

  const commandSignals = [
    { label: 'Employer visibility', value: completion >= 90 ? 'High' : 'Improve', icon: 'visibility', tone: completion >= 90 ? 'text-astu-green' : 'text-astu-red' },
    { label: 'Applications sent', value: appliedJobsCount.toString(), icon: 'send', tone: 'text-astu-navy' },
    { label: 'Saved roles', value: savedJobsCount.toString(), icon: 'bookmark', tone: 'text-[#8A5CF6]' },
    { label: 'Tracer actions', value: pendingSurveyCount.toString(), icon: 'assignment_late', tone: pendingSurveyCount > 0 ? 'text-astu-red' : 'text-astu-green' },
  ];

  const profileReadiness = [
    {
      label: 'Public profile',
      value: `${completion}%`,
      width: completion,
      icon: 'badge',
      hint: 'Visible to verified employers',
    },
    {
      label: 'Tracer compliance',
      value: totalSurveyCount > 0 ? `${tracerCompliance}%` : 'No surveys',
      width: tracerCompliance,
      icon: 'fact_check',
      hint: totalSurveyCount > 0 ? `${completedSurveyCount} of ${totalSurveyCount} completed` : 'Awaiting assignment',
    },
    {
      label: 'Document readiness',
      value: documents.length > 0 ? `${documentReadiness}%` : 'No requests',
      width: documentReadiness,
      icon: 'description',
      hint: documents.length > 0 ? `${approvedDocsCount} of ${documents.length} approved` : 'Request when needed',
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardBroadcastHero actorRole="ALUMNI" className="mb-2" />

      <DashboardWelcomeBanner
        eyebrow="Alumni Command Center"
        title={`Welcome back, ${profile.fullName}`}
        description={
          completion === 100
            ? 'Your profile is fully complete! Your credentials are fully visible to corporate employers.'
            : 'Your profile is nearly complete. Boost visibility with employers by finishing your profile.'
        }
        meta={
          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90">
            Profile {completion}%
          </span>
        }
        actions={
          completion < 100
            ? [
                {
                  label: 'Complete Profile',
                  onClick: () => onTabChange('profile'),
                  variant: 'primary',
                },
              ]
            : [
                {
                  label: 'Browse Jobs',
                  onClick: () => onTabChange('jobs'),
                  variant: 'primary',
                },
              ]
        }
      >
        <div className="space-y-4">
          <div className="max-w-xs space-y-2">
            <p className="text-xs font-semibold text-white/90">Profile completion</p>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#E8A020] transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {commandSignals.map((signal) => (
              <button
                key={signal.label}
                type="button"
                onClick={() => {
                  if (signal.label.includes('Employer')) onTabChange('profile');
                  if (signal.label.includes('Applications') || signal.label.includes('Saved')) onTabChange('jobs');
                  if (signal.label.includes('Tracer')) onTabChange('surveys');
                }}
                className="rounded-xl border border-white/15 bg-white/10 p-3 text-left backdrop-blur transition-all hover:bg-white/15"
              >
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${signal.tone}`}>{signal.icon}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/65">{signal.label}</p>
                </div>
                <p className="mt-2 text-xl font-extrabold text-white">{signal.value}</p>
              </button>
            ))}
          </div>
        </div>
      </DashboardWelcomeBanner>

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
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.width >= 90 ? 'bg-astu-green' : item.width >= 50 ? 'bg-[#E8A020]' : 'bg-astu-red'
                      }`}
                      style={{ width: `${item.width}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium text-gray-400">{item.hint}</p>
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
        <div className="lg:col-span-2 rounded-[10px] border border-gray-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-astu-red font-bold">assignment_turned_in</span>
                Tracer Survey Timelines (6, 12, 24 Months)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Quick status overview of tracer studies assigned to your account.</p>
            </div>

            {/* Filter Pills & View All */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[11px] font-bold">
                <button
                  onClick={() => setTimelineFilter('ALL')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${timelineFilter === 'ALL' ? 'bg-white text-astu-navy shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  All ({surveys.length})
                </button>
                <button
                  onClick={() => setTimelineFilter('PENDING')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${timelineFilter === 'PENDING' ? 'bg-white text-astu-red shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Pending ({surveys.filter(s => s.status !== 'COMPLETED').length})
                </button>
                <button
                  onClick={() => setTimelineFilter('COMPLETED')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${timelineFilter === 'COMPLETED' ? 'bg-white text-astu-green shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Done ({surveys.filter(s => s.status === 'COMPLETED').length})
                </button>
              </div>

              <button
                onClick={() => onTabChange('surveys')}
                className="text-xs font-bold text-astu-navy hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                View All &rarr;
              </button>
            </div>
          </div>

          {/* Scrollable Grid Container for Many Surveys */}
          {(() => {
            const filteredTimelineSurveys = surveys.filter((s) => {
              if (timelineFilter === 'PENDING') return s.status !== 'COMPLETED';
              if (timelineFilter === 'COMPLETED') return s.status === 'COMPLETED';
              return true;
            });

            if (filteredTimelineSurveys.length === 0) {
              return (
                <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                  No matching tracer survey timelines found.
                </div>
              );
            }

            return (
              <div className="max-h-[290px] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredTimelineSurveys.map((survey) => {
                    const isCompleted = survey.status === 'COMPLETED';
                    return (
                      <div
                        key={survey.id}
                        onClick={() => onTabChange('surveys')}
                        className={`cursor-pointer rounded-[10px] border p-3.5 transition-all hover:shadow-sm flex flex-col justify-between ${
                          isCompleted
                            ? 'bg-green-50/30 border-green-150'
                            : 'bg-red-50/30 border-red-150 hover:border-red-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                              {survey.type || 'CUSTOM'}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${
                              isCompleted ? 'bg-astu-green' : 'bg-astu-red animate-pulse'
                            }`}></span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1" title={survey.title}>
                            {survey.title}
                          </h4>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <p className="text-[10px] text-gray-600">
                            Status: <span className={`font-bold ${isCompleted ? 'text-astu-green' : 'text-astu-red'}`}>
                              {isCompleted ? 'Submitted' : 'Pending Action'}
                            </span>
                          </p>
                          {!isCompleted && (
                            <span className="text-[9px] text-astu-red font-bold hover:underline">Start &rarr;</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

      </div>

      <DashboardStatGrid
        stats={stats.map((stat) => ({
          label: stat.label,
          value: stat.value,
          materialIcon: stat.icon,
          trend: stat.trend,
          tone:
            stat.color === 'astu-green'
              ? 'green'
              : stat.color === 'astu-red'
                ? 'red'
                : stat.color === 'purple-600'
                  ? 'purple'
                  : 'blue',
          trendDirection: stat.trendColor === 'astu-red' ? 'down' : 'up',
          onClick: () => {
            if (stat.label.includes('Profile')) onTabChange('profile');
            if (stat.label.includes('Job')) onTabChange('jobs');
            if (stat.label.includes('Surveys')) onTabChange('surveys');
            if (stat.label.includes('Network')) onTabChange('mentorship');
          },
        }))}
      />

      <DashboardQuickNav
        title="Alumni feature control"
        subtitle="Career coaching, events, community, and verified documents in one place."
        columns={4}
        items={intelligenceCards.map((card) => ({
          id: card.tab + card.title,
          title: card.title,
          description: card.desc,
          materialIcon: card.icon,
          onClick: () => onTabChange(card.tab),
          tone:
            card.tab === 'career'
              ? 'violet'
              : card.tab === 'messages'
                ? 'green'
                : card.tab === 'documents'
                  ? 'amber'
                  : 'navy',
        }))}
      />

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
                          {job.applied ? 'Applied' : (job.match ? `${job.match} Match` : 'Recommended')}
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

      {/* Analytics Charts Row — only render when real series are available */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[10px] border border-gray-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-gray-900">Employment Rate Trend</h3>
          <p className="mt-1 text-xs text-gray-500">No employment analytics available yet for your cohort.</p>
          <p className="mt-8 text-center text-sm text-gray-400">—</p>
        </div>
        <div className="rounded-[10px] border border-gray-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-gray-900">Skills Distribution</h3>
          <p className="mt-1 text-xs text-gray-500">Skills insights will appear once alumni skill data is collected.</p>
          <p className="mt-8 text-center text-sm text-gray-400">—</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <ActivityTimeline
        activities={[] as ActivityEntry[]}
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
          {forumPosts.slice(0, 3).map((post) => {
            const contentText = typeof post.content === 'string' ? post.content : '';
            const imgMatch = contentText.match(/!\[.*?\]\((.*?)\)/);
            const cleanText = contentText
              .replace(/!\[.*?\]\((.*?)\)/g, '')
              .replace(/🔗 Attachment:\s*(https?:\/\/[^\s]+)/g, '')
              .trim();

            return (
              <div key={post.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-astu-navy/20 transition-all">
                <img
                src={post.authorAvatar && !post.authorAvatar.includes('undefined') && !post.authorAvatar.includes('null') ? post.authorAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'ASTU Graduate')}&background=003366&color=ffffff&bold=true`}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'ASTU Graduate')}&background=003366&color=ffffff&bold=true`;
                }}
                alt=""
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{post.author || 'ASTU Graduate'}</span>
                    <span className="text-[9px] text-gray-400">{post.timestamp || (post as any).time || 'Recently'}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed line-clamp-2">{cleanText || 'Shared a community update.'}</p>
                  
                  {imgMatch && imgMatch[1] && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-gray-200/80 max-h-28 bg-slate-900/5">
                      <img src={imgMatch[1]} alt="Attached Media" className="w-full h-28 object-cover rounded-lg" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <svg className="w-3 h-3" fill={post.liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes || 0}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments || 0}
                    </span>
                    <div className="flex gap-1">
                      {Array.isArray(post.tags) && post.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-astu-navy/5 text-[8px] font-bold text-astu-navy rounded">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
            const raisedNum = typeof campaign.raised === 'object' && campaign.raised ? Number((campaign.raised as any).increment || 0) : Number(campaign.raised || 0);
            const goalNum = typeof campaign.goal === 'object' && campaign.goal ? Number((campaign.goal as any).increment || 0) : Number(campaign.goal || 1);
            const donorCountNum = typeof campaign.donorCount === 'object' && campaign.donorCount ? Number((campaign.donorCount as any).increment || 0) : Number(campaign.donorCount || 0);
            const progress = Math.round((raisedNum / Math.max(1, goalNum)) * 100);
            return (
              <div key={campaign.id} className="rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-astu-navy/10 text-astu-navy text-[9px] font-bold rounded-full uppercase">
                    {campaign.category}
                  </span>
                  <span className="text-[10px] text-gray-400">{donorCountNum} donors</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{campaign.title}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3 line-clamp-2">{campaign.description}</p>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-astu-navy">{raisedNum.toLocaleString()} ETB</span>
                    <span className="text-gray-400">of {goalNum.toLocaleString()} ETB</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-astu-navy to-astu-green transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onDonate) {
                      onDonate(String(campaign.id), campaign);
                      return;
                    }
                    onTabChange('donations');
                  }}
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
