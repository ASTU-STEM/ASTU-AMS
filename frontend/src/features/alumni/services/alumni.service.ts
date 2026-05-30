import {
  AlumniDashboardSummary,
  AlumniDocumentRequestInput,
  AlumniEmploymentUpdate,
  AlumniJobFilters,
  AlumniProfile,
  DocumentRequest,
  JobMatch,
  MentorshipSession,
  TracerSurvey
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
  saveAlumniPreferences,
  saveAlumniProfile,
  saveCareerEvents,
  saveDocumentRequests,
  saveJobMatches,
  saveMentors,
  saveTracerSurveys
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
      preferences: getAlumniPreferences()
    };
  },

  getDashboardSummary(profile: AlumniProfile = getAlumniProfile()): AlumniDashboardSummary {
    const jobs = getJobMatches();
    const surveys = getTracerSurveys();
    const mentors = getMentors();
    const documents = getDocumentRequests();

    return {
      profileCompletion: calculateCompletion(profile),
      openJobMatches: jobs.filter((job) => !job.applied).length,
      savedJobs: jobs.filter((job) => job.saved).length,
      appliedJobs: jobs.filter((job) => job.applied).length,
      pendingSurveys: surveys.filter((survey) => survey.status === 'PENDING').length,
      documentRequests: documents.length,
      activeMentorships: mentors.filter((mentor) => mentor.status !== 'AVAILABLE').length
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

  applyToJob(jobId: number): JobMatch[] {
    const jobs = getJobMatches().map((job) =>
      job.id === jobId ? { ...job, applied: true, applicationStatus: 'Under Review' as const } : job
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

  saveProfile: saveAlumniProfile,
  saveJobs: saveJobMatches,
  saveSurveys: saveTracerSurveys,
  saveMentors,
  saveEvents: saveCareerEvents,
  saveDocuments: saveDocumentRequests,
  savePreferences: saveAlumniPreferences
};
