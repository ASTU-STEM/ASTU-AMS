import {
  AlumniDashboardSummary,
  AlumniDocumentRequestInput,
  AlumniEmploymentUpdate,
  AlumniJobFilters,
  AlumniProfile,
  DocumentRequest,
  JobMatch,
  MentorshipSession,
  TracerSurvey,
  DonationCampaign,
  ForumPost,
  SkillPathway,
  CareerMilestone
} from '../types';
import {
  calculateCompletion,
  getAlumniPreferences,
  getAlumniProfile,
  getCareerEvents,
  getDocumentRequests,
  getJobMatches,
  getMentors,
  getTracerSurveys,
  getDonationCampaigns,
  getForumPosts,
  getSkillPathways,
  saveAlumniPreferences,
  saveAlumniProfile,
  saveCareerEvents,
  saveDocumentRequests,
  saveJobMatches,
  saveMentors,
  saveTracerSurveys,
  saveDonationCampaigns,
  saveForumPosts,
  saveSkillPathways,
  getMilestones,
  saveMilestones
} from './mockAlumniData';

const nextId = <T extends { id: number }>(items: T[]) =>
  items.length === 0 ? 1 : Math.max(...items.map((item) => item.id)) + 1;

const parseMatch = (match: string) => Number.parseInt(match.replace('%', ''), 10) || 0;

export const alumniService = {
  getWorkspace() {
    return {
      profile: getAlumniProfile(),
      jobs: getJobMatches(),
      surveys: getTracerSurveys(),
      mentors: getMentors(),
      events: getCareerEvents(),
      documents: getDocumentRequests(),
      preferences: getAlumniPreferences(),
      donations: getDonationCampaigns(),
      forum: getForumPosts(),
      pathways: getSkillPathways(),
      milestones: getMilestones()
    };
  },

  getDashboardSummary(profile: AlumniProfile = getAlumniProfile()): AlumniDashboardSummary {
    const jobs = getJobMatches();
    const surveys = getTracerSurveys();
    const mentors = getMentors();
    const documents = getDocumentRequests();
    const events = getCareerEvents();
    const messages = getForumPosts();

    return {
      profileCompletion: calculateCompletion(profile),
      openJobMatches: jobs.filter((job) => !job.applied).length,
      savedJobs: jobs.filter((job) => job.saved).length,
      appliedJobs: jobs.filter((job) => job.applied).length,
      pendingSurveys: surveys.filter((survey) => survey.status === 'PENDING').length,
      documentRequests: documents.length,
      activeMentorships: mentors.filter((mentor) => mentor.status !== 'AVAILABLE').length,
      unreadMessages: messages.filter((m) => !m.liked).length,
      upcomingEvents: events.filter((e) => !e.registered).length,
      networkConnections: mentors.filter((m) => m.status === 'CONNECTED').length + 340
    };
  },

  updateEmploymentStatus(update: AlumniEmploymentUpdate): AlumniProfile {
    const profile = {
      ...getAlumniProfile(),
      ...update
    };
    saveAlumniProfile(profile);
    return profile;
  },

  filterJobs(filters: AlumniJobFilters): JobMatch[] {
    return getJobMatches().filter((job) => {
      const query = filters.query.trim().toLowerCase();
      const matchesQuery = !query || [job.title, job.company, job.location, ...job.requirements]
        .join(' ')
        .toLowerCase()
        .includes(query);
      const matchesType = filters.type === 'All' || job.type === filters.type;
      const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesScore = !filters.minimumMatch || parseMatch(job.match) >= filters.minimumMatch;
      const matchesSaved = !filters.savedOnly || job.saved;

      return matchesQuery && matchesType && matchesLocation && matchesScore && matchesSaved;
    });
  },

  sortJobs(jobs: JobMatch[], sortBy: 'match' | 'recent' | 'salary' | 'views'): JobMatch[] {
    const sorted = [...jobs];
    switch (sortBy) {
      case 'match': return sorted.sort((a, b) => parseMatch(b.match) - parseMatch(a.match));
      case 'recent': return sorted.sort((a, b) => (b.applications || 0) - (a.applications || 0));
      case 'salary': return sorted.sort((a, b) => parseInt(b.salary) - parseInt(a.salary));
      case 'views': return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      default: return sorted;
    }
  },

  applyToJob(jobId: number): JobMatch[] {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const jobs = getJobMatches().map((job) =>
      job.id === jobId ? { ...job, applied: true, applicationStatus: 'Under Review' as const, appliedDate: now } : job
    );
    saveJobMatches(jobs);
    return jobs;
  },

  withdrawApplication(jobId: number): JobMatch[] {
    const jobs = getJobMatches().map((job) =>
      job.id === jobId ? { ...job, applied: false, applicationStatus: undefined as any, appliedDate: undefined } : job
    );
    saveJobMatches(jobs);
    return jobs;
  },

  requestDocument(input: AlumniDocumentRequestInput): DocumentRequest[] {
    const documents = getDocumentRequests();
    const newRequest: DocumentRequest = {
      id: nextId(documents),
      type: input.type,
      requestDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending',
      notes: input.notes
    };
    const updatedDocuments = [newRequest, ...documents];
    saveDocumentRequests(updatedDocuments);
    return updatedDocuments;
  },

  completeSurvey(surveyId: number): TracerSurvey[] {
    const surveys = getTracerSurveys().map((survey) =>
      survey.id === surveyId
        ? { ...survey, status: 'COMPLETED' as const, completedAt: new Date().toLocaleDateString() }
        : survey
    );
    saveTracerSurveys(surveys);
    return surveys;
  },

  scheduleMentorshipSession(mentorId: number, session: Omit<MentorshipSession, 'id' | 'status' | 'meetLink'>) {
    const mentors = getMentors().map((mentor) => {
      if (mentor.id !== mentorId) return mentor;
      const sessionId = nextId(mentor.sessions ?? []);
      return {
        ...mentor,
        status: 'CONNECTED' as const,
        sessions: [
          ...(mentor.sessions ?? []),
          {
            id: sessionId,
            ...session,
            status: 'Scheduled' as const,
            meetLink: `https://meet.google.com/astu-mentor-${mentorId}-${sessionId}`
          }
        ]
      };
    });
    saveMentors(mentors);
    return mentors;
  },

  makeDonation(campaignId: number, amount: number): DonationCampaign[] {
    const campaigns = getDonationCampaigns().map((c) =>
      c.id === campaignId ? { ...c, raised: c.raised + amount, donorCount: c.donorCount + 1 } : c
    );
    saveDonationCampaigns(campaigns);
    return campaigns;
  },

  toggleForumLike(postId: number): ForumPost[] {
    const posts = getForumPosts().map((p) =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    );
    saveForumPosts(posts);
    return posts;
  },

  addForumPost(post: Omit<ForumPost, 'id' | 'timestamp' | 'likes' | 'comments' | 'liked'>): ForumPost[] {
    const posts = getForumPosts();
    const newPost: ForumPost = {
      id: nextId(posts),
      ...post,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      liked: false
    };
    const updatedPosts = [newPost, ...posts];
    saveForumPosts(updatedPosts);
    return updatedPosts;
  },

  addMilestone(milestone: Omit<CareerMilestone, 'id'>): CareerMilestone[] {
    const milestones = getMilestones();
    const newMilestone = { id: nextId(milestones), ...milestone };
    const updated = [newMilestone, ...milestones];
    saveMilestones(updated);
    return updated;
  },

  saveProfile: saveAlumniProfile,
  saveJobs: saveJobMatches,
  saveSurveys: saveTracerSurveys,
  saveMentors,
  saveEvents: saveCareerEvents,
  saveDocuments: saveDocumentRequests,
  savePreferences: saveAlumniPreferences,
  saveMilestones,
  saveDonations: saveDonationCampaigns,
  saveForum: saveForumPosts,
  savePathways: saveSkillPathways
};
