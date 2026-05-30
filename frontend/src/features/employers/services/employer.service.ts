import {
  CandidateApplication,
  CompanyProfile,
  EmployerDashboardSummary,
  EmployerJob,
  GraduateFeedback,
  InterviewSchedule,
  Message,
  TalentSearchFilters
} from '../types';
import {
  getCandidateApplications,
  getCompanyProfile,
  getEmployerJobs,
  getEmployerMessages,
  getGraduateFeedback,
  saveCandidateApplications,
  saveCompanyProfile,
  saveEmployerJobs,
  saveEmployerMessages,
  saveGraduateFeedback
} from './mockEmployerData';

const nextId = <T extends { id: number }>(items: T[]) =>
  items.length === 0 ? 1 : Math.max(...items.map((item) => item.id)) + 1;

export const employerService = {
  getWorkspace() {
    return {
      profile: getCompanyProfile(),
      jobs: getEmployerJobs(),
      applications: getCandidateApplications(),
      feedback: getGraduateFeedback(),
      messages: getEmployerMessages()
    };
  },

  getDashboardSummary(): EmployerDashboardSummary {
    const jobs = getEmployerJobs();
    const applications = getCandidateApplications();
    const shortlistedApplications = applications.filter((application) => application.status === 'Shortlisted').length;
    const totalApplications = applications.length;

    return {
      activeJobs: jobs.filter((job) => job.status === 'Open').length,
      totalApplications,
      pendingApplications: applications.filter((application) => application.status === 'Pending').length,
      shortlistedApplications,
      feedbackReports: getGraduateFeedback().length,
      totalViews: jobs.reduce((sum, job) => sum + job.viewsCount, 0),
      shortlistRate: totalApplications > 0 ? Math.round((shortlistedApplications / totalApplications) * 100) : 0
    };
  },

  createJob(job: Omit<EmployerJob, 'id' | 'applicationsCount' | 'shortlistedCount' | 'viewsCount' | 'postedDate'>): EmployerJob[] {
    const jobs = getEmployerJobs();
    const newJob: EmployerJob = {
      id: nextId(jobs),
      ...job,
      postedDate: 'Just now',
      applicationsCount: 0,
      shortlistedCount: 0,
      viewsCount: 1
    };
    const updatedJobs = [newJob, ...jobs];
    saveEmployerJobs(updatedJobs);
    return updatedJobs;
  },

  updateJob(updatedJob: EmployerJob): EmployerJob[] {
    const jobs = getEmployerJobs().map((job) => job.id === updatedJob.id ? updatedJob : job);
    saveEmployerJobs(jobs);
    return jobs;
  },

  toggleJobStatus(jobId: number): EmployerJob[] {
    const jobs = getEmployerJobs().map((job) =>
      job.id === jobId ? { ...job, status: job.status === 'Open' ? 'Closed' as const : 'Open' as const } : job
    );
    saveEmployerJobs(jobs);
    return jobs;
  },

  updateApplicationStatus(applicationId: number, status: CandidateApplication['status']): CandidateApplication[] {
    const applications = getCandidateApplications().map((application) =>
      application.id === applicationId ? { ...application, status } : application
    );
    saveCandidateApplications(applications);
    return applications;
  },

  searchTalent(filters: TalentSearchFilters): CandidateApplication[] {
    return getCandidateApplications().filter((application) => {
      const query = filters.query.trim().toLowerCase();
      const matchesQuery = !query || [application.alumnusName, application.alumnusEmail, application.jobTitle, ...application.skills]
        .join(' ')
        .toLowerCase()
        .includes(query);
      const matchesDepartment = !filters.department || application.department === filters.department;
      const matchesYear = !filters.graduationYear || application.graduationYear === filters.graduationYear;
      const matchesSkills = filters.skills.length === 0 || filters.skills.every((skill) => application.skills.includes(skill));
      const matchesCgpa = !filters.minimumCgpa || Number(application.cgpa) >= filters.minimumCgpa;
      const matchesStatus = !filters.status || filters.status === 'All' || application.status === filters.status;

      return matchesQuery && matchesDepartment && matchesYear && matchesSkills && matchesCgpa && matchesStatus;
    });
  },

  scheduleInterview(applicationId: number, details: Omit<InterviewSchedule, 'id' | 'applicationId' | 'candidateName' | 'jobTitle' | 'status'>): InterviewSchedule {
    const application = getCandidateApplications().find((item) => item.id === applicationId);

    return {
      id: Date.now(),
      applicationId,
      candidateName: application?.alumnusName ?? 'Selected Candidate',
      jobTitle: application?.jobTitle ?? 'Open Role',
      ...details,
      status: 'Scheduled'
    };
  },

  addFeedback(feedback: Omit<GraduateFeedback, 'id' | 'submittedAt'>): GraduateFeedback[] {
    const feedbacks = getGraduateFeedback();
    const newFeedback: GraduateFeedback = {
      id: nextId(feedbacks),
      ...feedback,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    const updatedFeedback = [newFeedback, ...feedbacks];
    saveGraduateFeedback(updatedFeedback);
    return updatedFeedback;
  },

  sendMessage(text: string, profile: CompanyProfile = getCompanyProfile()): Message[] {
    const messages = getEmployerMessages();
    const newMessage: Message = {
      id: nextId(messages),
      sender: 'Employer',
      senderName: profile.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: false
    };
    const updatedMessages = [...messages, newMessage];
    saveEmployerMessages(updatedMessages);
    return updatedMessages;
  },

  saveProfile: saveCompanyProfile,
  saveJobs: saveEmployerJobs,
  saveApplications: saveCandidateApplications,
  saveFeedback: saveGraduateFeedback,
  saveMessages: saveEmployerMessages
};
