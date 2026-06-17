import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import {
  getAlumniProfile,
  getJobMatches,
  getTracerSurveys,
  getMentors,
  getCareerEvents,
  getDocumentRequests,
  getAlumniPreferences,
  getDonationCampaigns,
  getForumPosts,
  getSkillPathways,
  getMilestones,
  calculateCompletion,
  saveAlumniProfile,
  saveJobMatches,
  saveTracerSurveys,
  saveMentors,
  saveDocumentRequests,
  saveDonationCampaigns,
  saveForumPosts,
  saveMilestones
} from './mockData';
import { updateAlumniProfileSchema, addExperienceSchema, documentRequestSchema } from './alumni.validation';

export class AlumniController {
  static async getWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = {
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
      return sendSuccess(res, 'Workspace fetched successfully', workspace);
    } catch (err) {
      next(err);
    }
  }

  static async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = getAlumniProfile();
      const jobs = getJobMatches();
      const surveys = getTracerSurveys();
      const mentors = getMentors();
      const documents = getDocumentRequests();
      const events = getCareerEvents();
      const messages = getForumPosts();

      const summary = {
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
      return sendSuccess(res, 'Dashboard summary fetched successfully', summary);
    } catch (err) {
      next(err);
    }
  }

  static async updateEmploymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentRole, company, salaryRange } = req.body;
      const profile = {
        ...getAlumniProfile(),
        currentRole,
        company,
        salaryRange
      };
      saveAlumniProfile(profile);
      return sendSuccess(res, 'Employment status updated', profile);
    } catch (err) {
      next(err);
    }
  }

  static async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      let jobs = getJobMatches();
      if (filters.query) {
        const query = String(filters.query).toLowerCase();
        jobs = jobs.filter(j => 
          [j.title, j.company, j.location, ...(j.requirements || [])]
            .join(' ').toLowerCase().includes(query)
        );
      }
      if (filters.type && filters.type !== 'All') {
        jobs = jobs.filter(j => j.type === filters.type);
      }
      if (filters.location) {
        jobs = jobs.filter(j => j.location.toLowerCase().includes(String(filters.location).toLowerCase()));
      }
      return sendSuccess(res, 'Jobs fetched successfully', jobs);
    } catch (err) {
      next(err);
    }
  }

  static async applyToJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const jobs = getJobMatches().map((job) =>
        String(job.id) === id ? { ...job, applied: true, applicationStatus: 'Under Review' as const, appliedDate: now } : job
      );
      saveJobMatches(jobs);
      return sendSuccess(res, 'Applied to job successfully', jobs);
    } catch (err) {
      next(err);
    }
  }

  static async withdrawApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const jobs = getJobMatches().map((job) =>
        String(job.id) === id ? { ...job, applied: false, applicationStatus: undefined as any, appliedDate: undefined } : job
      );
      saveJobMatches(jobs);
      return sendSuccess(res, 'Application withdrawn successfully', jobs);
    } catch (err) {
      next(err);
    }
  }

  static async completeSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const surveys = getTracerSurveys().map((survey) =>
        String(survey.id) === id
          ? { ...survey, status: 'COMPLETED' as const, completedAt: new Date().toLocaleDateString() }
          : survey
      );
      saveTracerSurveys(surveys);
      return sendSuccess(res, 'Survey completed', surveys);
    } catch (err) {
      next(err);
    }
  }

  static async scheduleMentorshipSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { mentorId, ...session } = req.body;
      const mentors = getMentors().map((mentor) => {
        if (String(mentor.id) !== String(mentorId)) return mentor;
        const sessionId = (mentor.sessions || []).length + 1;
        return {
          ...mentor,
          status: 'CONNECTED' as const,
          sessions: [
            ...(mentor.sessions || []),
            {
              id: String(sessionId),
              ...session,
              status: 'Scheduled' as const,
              meetLink: `https://meet.google.com/astu-mentor-${mentorId}-${sessionId}`
            }
          ]
        };
      });
      saveMentors(mentors);
      return sendSuccess(res, 'Session scheduled', mentors);
    } catch (err) {
      next(err);
    }
  }

  static async makeDonation(req: Request, res: Response, next: NextFunction) {
    try {
      const { campaignId, amount } = req.body;
      const campaigns = getDonationCampaigns().map((c) =>
        String(c.id) === String(campaignId) ? { ...c, raised: c.raised + amount, donorCount: c.donorCount + 1 } : c
      );
      saveDonationCampaigns(campaigns);
      return sendSuccess(res, 'Donation processed', campaigns);
    } catch (err) {
      next(err);
    }
  }

  static async toggleForumLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const posts = getForumPosts().map((p) =>
        String(p.id) === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      );
      saveForumPosts(posts);
      return sendSuccess(res, 'Like toggled', posts);
    } catch (err) {
      next(err);
    }
  }

  static async addForumPost(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = getForumPosts();
      const newPost = {
        id: String(posts.length + 1),
        ...req.body,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        liked: false
      };
      const updatedPosts = [newPost, ...posts];
      saveForumPosts(updatedPosts);
      return sendSuccess(res, 'Post added', updatedPosts);
    } catch (err) {
      next(err);
    }
  }

  static async addMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const milestones = getMilestones();
      const newMilestone = { id: String(milestones.length + 1), ...req.body };
      const updated = [newMilestone, ...milestones];
      saveMilestones(updated);
      return sendSuccess(res, 'Milestone added', updated);
    } catch (err) {
      next(err);
    }
  }

  // Preserve the required original methods from previous file
  static async getMe(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Profile retrieved', getAlumniProfile());
  }
  static async updateMe(req: Request, res: Response, next: NextFunction) {
    saveAlumniProfile(req.body);
    return sendSuccess(res, 'Profile updated', getAlumniProfile());
  }
  static async addExperience(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Experience added', {});
  }
  static async updateExperience(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Experience updated', {});
  }
  static async deleteExperience(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Experience deleted', {});
  }
  static async uploadFiles(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Files uploaded', {});
  }
  static async requestDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, notes } = req.body;
      const documents = getDocumentRequests();
      const newRequest = {
        id: String(documents.length + 1),
        type,
        requestDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Pending' as any,
        notes
      };
      const updatedDocuments = [newRequest, ...documents];
      saveDocumentRequests(updatedDocuments);
      return sendSuccess(res, 'Document requested', updatedDocuments);
    } catch (err) {
      next(err);
    }
  }
  static async getMyDocuments(req: Request, res: Response, next: NextFunction) {
    return sendSuccess(res, 'Fetched document requests', getDocumentRequests());
  }
}
