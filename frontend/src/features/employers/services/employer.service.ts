import axios from 'axios';
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

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Mappers ───────────────────────────────────────────────────────────────────

function mapBackendJobToFrontend(data: any): EmployerJob {
  let type: EmployerJob['type'] = 'Full-Time';
  if (data.employmentType === 'INTERNSHIP') type = 'Internship';
  else if (data.employmentType === 'CONTRACT') type = 'Contract';

  let expText = 'Entry Level (0-1 yrs)';
  if (data.experienceRequired >= 5) expText = 'Senior (5+ yrs)';
  else if (data.experienceRequired >= 3) expText = 'Mid-Level (3-5 yrs)';
  else if (data.experienceRequired >= 1) expText = 'Junior (1-3 yrs)';

  return {
    id: data.id,
    title: data.title,
    type,
    location: data.location,
    salaryRange: data.salary || 'Not specified',
    experienceRequired: expText,
    description: data.description,
    skillsRequired: data.skillsRequired || [],
    status: (data.status === 'PUBLISHED' || data.status === 'Open') ? 'Open' : 'Closed',
    postedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Just now',
    applicationsCount: typeof data.applicationsCount === 'number' ? data.applicationsCount : (data.applications?.length || data._count?.applications || 0),
    shortlistedCount: typeof data.shortlistedCount === 'number' ? data.shortlistedCount : (Array.isArray(data.applications) ? data.applications.filter((a: any) => a.status === 'SHORTLISTED' || a.status === 'ACCEPTED').length : 0),
    viewsCount: typeof data.viewsCount === 'number' ? data.viewsCount : (typeof data.views === 'number' ? data.views : (data._count?.views || 0)),
    recommendations: data.recommendations ? data.recommendations.map((a: any) => ({
      id: a.id,
      alumnusName: a.fullName || 'Alumni',
      alumnusEmail: a.email || 'No Contact Info',
      jobTitle: 'Recommended',
      department: a.department?.name || 'N/A',
      graduationYear: a.graduationYear?.toString() || 'N/A',
      cgpa: a.cgpa === null ? 'Hidden (Privacy Setting)' : a.cgpa?.toString() || 'N/A',
      skills: a.skills || [],
      status: 'Pending',
      appliedDate: 'N/A',
      resumeUrl: a.resumeUrl || null,
      coverLetter: '',
    })) : undefined
  };
}

function mapFrontendTypeToBackend(type: string): string {
  if (type === 'Internship') return 'INTERNSHIP';
  if (type === 'Contract') return 'CONTRACT';
  return 'FULL_TIME';
}

function mapExperienceToNumber(exp: string): number {
  if (exp.includes('5+') || exp.includes('Senior')) return 5;
  if (exp.includes('3-5') || exp.includes('Mid')) return 3;
  if (exp.includes('1-3') || exp.includes('Junior')) return 1;
  return 0;
}

function mapBackendApplicationToFrontend(app: any): CandidateApplication {
  const fullName = app.alumni?.fullName || 
    (app.alumni?.user?.firstName ? `${app.alumni.user.firstName} ${app.alumni.user.lastName || ''}`.trim() : null) || 
    (app.alumni?.user?.email ? app.alumni.user.email.split('@')[0] : null) || 
    'Alumni Candidate';

  const email = app.alumni?.email || app.alumni?.user?.email || 'N/A';
  const deptName = app.alumni?.department?.name || app.alumni?.department?.code || (typeof app.alumni?.department === 'string' ? app.alumni.department : 'Software Engineering');
  const skillsList = Array.isArray(app.alumni?.skills) && app.alumni.skills.length > 0
    ? app.alumni.skills
    : (Array.isArray(app.job?.skillsRequired) ? app.job.skillsRequired : []);

  const resume = app.resumeUrl || app.alumni?.resumeUrl || null;
  const avatar = app.alumni?.profilePicture || app.alumni?.avatarUrl || null;

  const phone = app.alumni?.phone || app.alumni?.user?.phoneNumber || app.alumni?.user?.phone || 'N/A';
  const studentId = app.alumni?.studentId || app.alumni?.batchNo || 'N/A';
  const bio = app.alumni?.bio || app.alumni?.professionalBio || app.alumni?.summary || 'N/A';
  const nationality = app.alumni?.nationality || 'Ethiopian';
  const gender = app.alumni?.gender || 'N/A';
  const languages = Array.isArray(app.alumni?.languages) ? app.alumni.languages : (app.alumni?.languages ? [app.alumni.languages] : ['English', 'Amharic']);
  const volunteerWork = app.alumni?.volunteerWork || app.alumni?.communityService || 'N/A';
  const currentAddress = app.alumni?.address || app.alumni?.currentAddress || app.alumni?.location || 'N/A';
  const honors = app.alumni?.honors || app.alumni?.distinction || 'N/A';

  const socialLinks = {
    linkedin: app.alumni?.linkedIn || app.alumni?.linkedinUrl || app.alumni?.socialLinks?.linkedin || '',
    github: app.alumni?.gitHub || app.alumni?.githubUrl || app.alumni?.socialLinks?.github || '',
    website: app.alumni?.portfolio || app.alumni?.portfolioUrl || app.alumni?.websiteUrl || app.alumni?.socialLinks?.website || '',
    twitter: app.alumni?.twitterUrl || app.alumni?.twitter || app.alumni?.socialLinks?.twitter || '',
    telegram: app.alumni?.telegram || '',
  };

  const rawExperiences = Array.isArray(app.alumni?.experiences) ? app.alumni.experiences : [];
  const experiences = rawExperiences.map((exp: any) => {
    let startStr = 'N/A';
    if (exp.startDate) {
      try {
        startStr = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } catch (_) { startStr = String(exp.startDate); }
    }
    let endStr = 'N/A';
    if (exp.endDate) {
      try {
        endStr = new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } catch (_) { endStr = String(exp.endDate); }
    }
    return {
      id: exp.id,
      title: exp.position || exp.title || 'Role',
      company: exp.companyName || exp.company || 'Company',
      location: exp.location || '',
      startDate: startStr,
      endDate: endStr,
      current: Boolean(exp.isCurrent || exp.current),
      description: exp.description || '',
    };
  });

  const rawCertifications = Array.isArray(app.alumni?.certifications) ? app.alumni.certifications : [];
  const certifications = rawCertifications.map((cert: any) => ({
    id: cert.id,
    title: cert.name || cert.title || 'Certification',
    issuer: cert.issuer || 'Issuer',
    issueDate: cert.issueDate || cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : '',
    expiryDate: cert.expiryDate || '',
    credentialUrl: cert.credentialUrl || cert.imageUrl || '',
    description: cert.description || '',
  }));

  const rawProjects = Array.isArray(app.alumni?.projects) ? app.alumni.projects : [];
  const projects = rawProjects.map((proj: any) => ({
    id: proj.id,
    title: proj.title || 'Project',
    description: proj.description || '',
    link: proj.url || proj.link || '',
    technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
  }));

  const rawAchievements = Array.isArray(app.alumni?.achievements) ? app.alumni.achievements : [];
  const achievements = rawAchievements.map((ach: any) => ({
    id: ach.id,
    title: ach.title || 'Achievement',
    issuer: ach.type ? ach.type.toUpperCase() : 'Award',
    date: ach.date || ach.createdAt ? new Date(ach.createdAt).toLocaleDateString() : '',
    description: ach.description || '',
  }));

  return {
    id: app.id,
    alumniId: app.alumniId || app.alumni?.id,
    userId: app.alumni?.userId || app.alumni?.user?.id || app.alumniId || app.alumni?.id,
    alumnusName: fullName,
    alumnusEmail: email,
    alumnusAvatar: avatar,
    jobTitle: app.job?.title || 'Unknown Position',
    department: deptName,
    graduationYear: app.alumni?.graduationYear?.toString() || '2024',
    cgpa: (app.alumni?.cgpaHidden || app.alumni?.cgpa === null || app.alumni?.cgpa === undefined)
      ? 'Hidden (Privacy Setting)'
      : Number(app.alumni.cgpa).toFixed(2),
    skills: skillsList,
    status: mapApplicationStatus(app.status),
    appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'N/A',
    resumeUrl: resume,
    coverLetter: app.coverLetter || '',

    phone,
    studentId,
    bio,
    nationality,
    gender,
    languages,
    volunteerWork,
    currentAddress,
    honors,
    socialLinks,
    certifications,
    experiences,
    projects,
    achievements,
  };
}

function mapApplicationStatus(status: string): CandidateApplication['status'] {
  switch (status) {
    case 'PENDING': return 'Pending';
    case 'REVIEWED': return 'Reviewed';
    case 'SHORTLISTED': return 'Shortlisted';
    case 'INTERVIEW_SCHEDULED': return 'Interviewed';
    case 'REJECTED': return 'Rejected';
    case 'HIRED': return 'Hired';
    case 'OFFERED': return 'Hired';
    default: return 'Pending';
  }
}

function mapFrontendStatusToBackend(status: string): string {
  switch (status) {
    case 'Pending': return 'PENDING';
    case 'Reviewed': return 'REVIEWED';
    case 'Shortlisted': return 'SHORTLISTED';
    case 'Interviewed': return 'INTERVIEW_SCHEDULED';
    case 'Rejected': return 'REJECTED';
    case 'Hired': return 'HIRED';
    default: return 'PENDING';
  }
}

function mapBackendProfileToFrontend(p: any): CompanyProfile {
  if (!p) return { name: 'My Company', industry: '', size: '', location: '', website: '', description: '', tin: '', hrContact: '', phone: '', contactEmail: '', contactPerson: '', logoUrl: '', isPremium: false, partnerships: [], verificationStatus: 'NOT_VERIFIED', ndaSigned: false };
  return {
    name: p.companyName || p.name || 'My Company',
    industry: p.industry || '',
    size: p.companySize || p.size || '',
    location: p.location || '',
    website: p.website || '',
    description: p.description || '',
    tin: p.tin || '',
    hrContact: p.hrContact || '',
    phone: p.phone || '',
    contactEmail: p.contactEmail || '',
    contactPerson: p.contactPerson || '',
    logoUrl: p.logoUrl || '',
    isPremium: Boolean(p.isPremium),
    partnerships: Array.isArray(p.partnerships) ? p.partnerships : [],
    verificationStatus: p.verificationStatus || (p.isVerified ? 'VERIFIED' : 'NOT_VERIFIED'),
    ndaSigned: Boolean(p.ndaSigned),
  };
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const employerService = {

  // ── Profile ────────────────────────────────────────────────────────────────

  async getProfile(): Promise<CompanyProfile> {
    try {
      const response = await apiClient.get('/employer/profile');
      return mapBackendProfileToFrontend(response.data.data);
    } catch (err: any) {
      console.error("getProfile failed:", err.response?.data || err.message);
      return mapBackendProfileToFrontend(null);
    }
  },

  async saveProfile(profile: CompanyProfile): Promise<CompanyProfile> {
    try {
      const payload: any = {
        companyName: profile.name,
        industry: profile.industry,
        location: profile.location,
        hrContact: profile.hrContact || profile.name,
        website: profile.website || null,
        description: profile.description || null,
        companySize: profile.size || null,
        contactPerson: profile.contactPerson || null,
        contactEmail: profile.contactEmail || null,
        phone: profile.phone || null,
        tin: profile.tin || null,
        isPremium: profile.isPremium ?? false,
        partnerships: profile.partnerships ?? [],
        verificationStatus: profile.verificationStatus ?? 'NOT_VERIFIED',
        ndaSigned: profile.ndaSigned ?? false,
      };
      await apiClient.put('/employer/profile', payload);
      return profile;
    } catch (err: any) {
      console.error("saveProfile failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // ── Jobs ───────────────────────────────────────────────────────────────────

  async getEmployerJobs(): Promise<EmployerJob[]> {
    try {
      const response = await apiClient.get('/employer/my-jobs');
      return (response.data.data || []).map(mapBackendJobToFrontend);
    } catch (err: any) {
      console.error("getEmployerJobs failed:", err.response?.data || err.message);
      throw err;
    }
  },

  async createJob(job: Omit<EmployerJob, 'id' | 'applicationsCount' | 'shortlistedCount' | 'viewsCount' | 'postedDate'>): Promise<EmployerJob> {
    const payload = {
      title: job.title,
      description: job.description,
      location: job.location,
      employmentType: mapFrontendTypeToBackend(job.type),
      experienceRequired: mapExperienceToNumber(job.experienceRequired),
      skillsRequired: job.skillsRequired,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      salary: job.salaryRange,
      status: 'PUBLISHED'
    };
    try {
      const response = await apiClient.post('/employer/jobs', payload);
      apiClient.post('/admin/audit-log', {
        action: 'CREATE_JOB_POSTING',
        details: `Employer published job posting: "${job.title}" (${job.type}) in ${job.location}`,
        userEmail: 'careers@ethiotelecom.et',
        userRole: 'EMPLOYER',
        afterState: { title: job.title, type: job.type, location: job.location }
      }).catch(() => {});
      return mapBackendJobToFrontend(response.data.data);
    } catch (err: any) {
      console.error("createJob failed:", err.response?.data || err.message);
      throw err;
    }
  },

  async updateJob(jobId: number | string, updatedJob: Partial<EmployerJob>): Promise<EmployerJob> {
    const payload: any = {};
    if (updatedJob.title) payload.title = updatedJob.title;
    if (updatedJob.description) payload.description = updatedJob.description;
    if (updatedJob.location) payload.location = updatedJob.location;
    if (updatedJob.type) payload.employmentType = mapFrontendTypeToBackend(updatedJob.type);
    if (updatedJob.skillsRequired) payload.skillsRequired = updatedJob.skillsRequired;
    if (updatedJob.salaryRange) payload.salary = updatedJob.salaryRange;
    if (updatedJob.experienceRequired) payload.experienceRequired = mapExperienceToNumber(updatedJob.experienceRequired);

    const response = await apiClient.put(`/employer/jobs/${jobId}`, payload);
    return mapBackendJobToFrontend(response.data.data);
  },

  async toggleJobStatus(jobId: number | string, currentStatus: string): Promise<EmployerJob> {
    const action = currentStatus === 'Open' ? 'close' : 'publish';
    const response = await apiClient.post(`/employer/jobs/${jobId}/${action}`);
    return mapBackendJobToFrontend(response.data.data);
  },

  async deleteJob(jobId: number | string): Promise<void> {
    await apiClient.delete(`/employer/jobs/${jobId}`);
  },

  // ── Applications ───────────────────────────────────────────────────────────

  async getApplications(): Promise<CandidateApplication[]> {
    try {
      const response = await apiClient.get('/employer/applications');
      return (response.data.data || []).map(mapBackendApplicationToFrontend);
    } catch (err: any) {
      console.error("getApplications failed:", err.response?.data || err.message);
      return [];
    }
  },

  async updateApplicationStatus(applicationId: number | string, status: CandidateApplication['status']): Promise<void> {
    try {
      await apiClient.patch(`/employer/applications/${applicationId}/status`, {
        status: mapFrontendStatusToBackend(status),
      });
      apiClient.post('/admin/audit-log', {
        action: 'UPDATE_CANDIDATE_APPLICATION_STATUS',
        details: `Employer changed candidate application #${applicationId} status to ${status.toUpperCase()}`,
        userEmail: 'careers@ethiotelecom.et',
        userRole: 'EMPLOYER',
        afterState: { applicationId, status }
      }).catch(() => {});
    } catch (err: any) {
      console.error("updateApplicationStatus failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // ── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboardSummary(): Promise<EmployerDashboardSummary> {
    try {
      const response = await apiClient.get('/employer/dashboard');
      const d = response.data.data;
      return {
        activeJobs: d.activeJobs || 0,
        totalApplications: d.totalApplications || 0,
        pendingApplications: d.pendingApplications || 0,
        shortlistedApplications: d.shortlistedApplications || 0,
        feedbackReports: d.feedbackReports || 0,
        totalViews: d.totalViews || 0,
        shortlistRate: d.shortlistRate || 0,
      };
    } catch (err: any) {
      console.error("getDashboardSummary failed:", err.response?.data || err.message);
      return {
        activeJobs: 0, totalApplications: 0, pendingApplications: 0,
        shortlistedApplications: 0, feedbackReports: 0, totalViews: 0, shortlistRate: 0,
      };
    }
  },

  // ── Feedback ───────────────────────────────────────────────────────────────

  async getFeedbacks(): Promise<GraduateFeedback[]> {
    try {
      const response = await apiClient.get('/employer/feedback');
      return (response.data.data || []).map((f: any) => ({
        id: f.id,
        alumnusName: f.alumni?.fullName || (f.alumni?.user?.firstName ? `${f.alumni.user.firstName} ${f.alumni.user.lastName || ''}`.trim() : (f.alumni?.user?.email ? f.alumni.user.email.split('@')[0] : 'ASTU Graduate')),
        department: typeof f.alumni?.department === 'string' ? f.alumni.department : (f.alumni?.department?.name || 'Computer Science and Engineering'),
        technicalSkills: f.technicalSkill || 5,
        communication: f.communicationSkill || 5,
        leadership: f.leadershipSkill || 5,
        teamwork: f.teamworkSkill || 5,
        problemSolving: f.problemSolvingSkill || 5,
        comments: f.feedbackText || '',
        submittedAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
      }));
    } catch (err: any) {
      console.error("getFeedbacks failed:", err.response?.data || err.message);
      return [];
    }
  },

  // ── Talent Search (uses backend) ───────────────────────────────────────────

  async searchTalent(filters: TalentSearchFilters & { page?: number; limit?: number }): Promise<CandidateApplication[] & { totalCount?: number }> {
    try {
      const params: any = {};
      if (filters.query) params.search = filters.query;
      if (filters.department) params.department = filters.department;
      if (filters.graduationYear) params.graduationYear = filters.graduationYear;
      if (filters.minimumCgpa) params.minCgpa = filters.minimumCgpa;
      if (filters.skills?.length) params.skills = filters.skills.join(',');
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await apiClient.get('/employer/talent', { params });
      const rawList = response.data.data?.data || response.data.data || [];
      const totalCount = response.data.data?.total || rawList.length;

      const mappedList: any = rawList.map((a: any) => {
        const phone = a.phone || a.user?.phoneNumber || a.user?.phone || 'N/A';
        const studentId = a.studentId || a.batchNo || 'N/A';
        const bio = a.bio || a.professionalBio || a.summary || 'N/A';
        const nationality = a.nationality || 'Ethiopian';
        const gender = a.gender || 'N/A';
        const languages = Array.isArray(a.languages) ? a.languages : (a.languages ? [a.languages] : ['English', 'Amharic']);
        const volunteerWork = a.volunteerWork || a.communityService || 'N/A';
        const currentAddress = a.address || a.currentAddress || a.location || 'N/A';
        const honors = a.honors || a.distinction || 'N/A';

        const socialLinks = {
          linkedin: a.linkedIn || a.linkedinUrl || a.socialLinks?.linkedin || '',
          github: a.gitHub || a.githubUrl || a.socialLinks?.github || '',
          website: a.portfolio || a.portfolioUrl || a.websiteUrl || a.socialLinks?.website || '',
          twitter: a.twitterUrl || a.twitter || a.socialLinks?.twitter || '',
          telegram: a.telegram || '',
        };

        const rawExp = Array.isArray(a.experiences) ? a.experiences : [];
        const experiences = rawExp.map((exp: any) => {
          let startStr = 'N/A';
          if (exp.startDate) {
            try {
              startStr = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            } catch (_) { startStr = String(exp.startDate); }
          }
          let endStr = 'N/A';
          if (exp.endDate) {
            try {
              endStr = new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            } catch (_) { endStr = String(exp.endDate); }
          }
          return {
            id: exp.id,
            title: exp.position || exp.title || 'Role',
            company: exp.companyName || exp.company || 'Company',
            location: exp.location || '',
            startDate: startStr,
            endDate: endStr,
            current: Boolean(exp.isCurrent || exp.current),
            description: exp.description || '',
          };
        });

        const rawCerts = Array.isArray(a.certifications) ? a.certifications : [];
        const certifications = rawCerts.map((cert: any) => ({
          id: cert.id,
          title: cert.name || cert.title || 'Certification',
          issuer: cert.issuer || 'Issuer',
          issueDate: cert.issueDate || cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : '',
          expiryDate: cert.expiryDate || '',
          credentialUrl: cert.credentialUrl || cert.imageUrl || '',
          description: cert.description || '',
        }));

        const rawProjects = Array.isArray(a.projects) ? a.projects : [];
        const projects = rawProjects.map((proj: any) => ({
          id: proj.id,
          title: proj.title || 'Project',
          description: proj.description || '',
          link: proj.url || proj.link || '',
          technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        }));

        const rawAch = Array.isArray(a.achievements) ? a.achievements : [];
        const achievements = rawAch.map((ach: any) => ({
          id: ach.id,
          title: ach.title || 'Achievement',
          issuer: ach.type ? ach.type.toUpperCase() : 'Award',
          date: ach.date || ach.createdAt ? new Date(ach.createdAt).toLocaleDateString() : '',
          description: ach.description || '',
        }));

        return {
          id: a.id,
          alumnusName: a.fullName || (a.user ? `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() : undefined) || (a.email ? a.email.split('@')[0] : 'Alumni Candidate'),
          alumnusEmail: a.email || a.user?.email || 'No Contact Info',
          alumnusAvatar: a.profilePicture || a.avatarUrl || null,
          jobTitle: a.jobTitle || (a.currentCompany ? `${a.jobTitle || 'Graduate'} at ${a.currentCompany}` : 'Talent Pool Candidate'),
          department: typeof a.department === 'string' ? a.department : (a.department?.name || 'Software Engineering'),
          graduationYear: a.graduationYear?.toString() || '2024',
          cgpa: (a.cgpaHidden || a.cgpa === null || a.cgpa === undefined) ? 'Hidden (Privacy Setting)' : Number(a.cgpa).toFixed(2),
          skills: Array.isArray(a.skills) && a.skills.length > 0 ? a.skills : [],
          status: 'Pending' as CandidateApplication['status'],
          appliedDate: 'N/A',
          resumeUrl: a.resumeUrl || null,
          coverLetter: '',

          phone,
          studentId,
          bio,
          nationality,
          gender,
          languages,
          volunteerWork,
          currentAddress,
          honors,
          socialLinks,
          certifications,
          experiences,
          projects,
          achievements,
        };
      });

      mappedList.totalCount = totalCount;
      return mappedList;
    } catch (err: any) {
      console.error("searchTalent failed:", err.response?.data || err.message);
      return [];
    }
  },

  async sendMessageToAlumni(alumniId: string, message: string): Promise<void> {
    await apiClient.post('/chat/send', { targetId: alumniId, text: message });
  },

  // ── Direct Messages (real backend) ─────────────────────────────────────

  async getConversations(): Promise<any[]> {
    try {
      const response = await apiClient.get('/employer/messages');
      return response.data.data || [];
    } catch (err: any) {
      console.error("getConversations failed:", err.response?.data || err.message);
      return [];
    }
  },

  async sendDirectMessage(alumniId: string, text: string): Promise<any> {
    const response = await apiClient.post('/chat/send', { targetId: alumniId, text });
    return response.data.data;
  },

  async requestCvFromAlumni(alumniId: string): Promise<any> {
    const response = await apiClient.post('/chat/request-cv', { targetId: alumniId, alumniId });
    return response.data.data;
  },

  // ── Submit Feedback (by alumni name) ───────────────────────────────────

  async submitFeedback(feedback: {
    alumnusName: string;
    department: string;
    technicalSkills: number;
    communication: number;
    leadership: number;
    teamwork: number;
    problemSolving: number;
    comments: string;
  }): Promise<any> {
    const response = await apiClient.post('/employer/feedback/by-name', feedback);
    apiClient.post('/admin/audit-log', {
      action: 'SUBMIT_GRADUATE_EMPLOYER_FEEDBACK',
      details: `Employer submitted academic performance audit feedback for ASTU graduate ${feedback.alumnusName} (${feedback.department})`,
      userEmail: 'careers@ethiotelecom.et',
      userRole: 'EMPLOYER',
      afterState: feedback
    }).catch(() => {});
    return response.data.data;
  },

  // ── Logo Upload ────────────────────────────────────────────────────────

  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await apiClient.post('/employer/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.logoUrl;
  },

  // ── Premium Membership & Chapa Payment Gateway ─────────────────────────

  async initializePremiumChapa(plan: string, amount: number, title?: string): Promise<any> {
    const response = await apiClient.post('/employer/chapa/initialize-premium', { plan, amount, title });
    return response.data.data;
  },

  async verifyPremiumChapa(tx_ref: string, plan: string): Promise<any> {
    const response = await apiClient.post('/employer/chapa/verify-premium', { tx_ref, plan });
    return mapBackendProfileToFrontend(response.data.data);
  },

  // ── Verification Dossier & Documents Upload ────────────────────────────

  async uploadVerificationDocs(formData: FormData): Promise<any> {
    const response = await apiClient.post('/employer/profile/verification-docs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = response.data.data;
    return { ...data, profile: mapBackendProfileToFrontend(data?.profile) };
  },

  // ── Partnership Proposals ─────────────────────────────────────────────

  async submitPartnershipProposal(data: {
    partnerships: string[];
    proposalTitle?: string;
    targetDepartments?: string[];
    annualBudget?: string;
    scopeDetails?: string;
  }): Promise<any> {
    const response = await apiClient.post('/employer/profile/partnership-proposal', data);
    const resData = response.data.data;
    return { ...resData, profile: mapBackendProfileToFrontend(resData?.profile) };
  },

  // kept for backward compat – deprecated
  getMessages(): Message[] {
    try {
      const stored = localStorage.getItem('employer_messages');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  saveMessages(messages: Message[]): void {
    localStorage.setItem('employer_messages', JSON.stringify(messages));
  },
};
