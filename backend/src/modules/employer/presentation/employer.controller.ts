import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import {
  createEmployerProfileSchema,
  updateEmployerProfileSchema,
  jobSchema,
  updateJobStatusSchema,
  interviewSchema,
  employerFeedbackSchema
} from './employer.validation';

import { PrismaEmployerProfileRepository } from '../infrastructure/repositories/PrismaEmployerProfileRepository';
import { PrismaJobRepository } from '../infrastructure/repositories/PrismaJobRepository';
import { PrismaJobApplicationRepository } from '../infrastructure/repositories/PrismaJobApplicationRepository';
import { PrismaEmployerFeedbackRepository } from '../infrastructure/repositories/PrismaEmployerFeedbackRepository';
import { PrismaInterviewRepository } from '../infrastructure/repositories/PrismaInterviewRepository';
import { PrismaDashboardAnalyticsRepository } from '../infrastructure/repositories/PrismaDashboardAnalyticsRepository';
import { PrismaTalentSearchRepository } from '../infrastructure/repositories/PrismaTalentSearchRepository';

import { GetEmployerProfile, UpdateEmployerProfile, CreateEmployerProfile, DeleteEmployerProfile } from '../application/use-cases/ManageEmployerProfile';
import { CreateJob, UpdateJob, DeleteJob, PublishJob, CloseJob, ReopenJob } from '../application/use-cases/ManageJobs';
import { ApplyForJob, UpdateApplicationStatus } from '../application/use-cases/ManageJobApplications';
import { ScheduleInterview, UpdateInterview, CancelInterview, GetEmployerInterviews } from '../application/use-cases/ManageInterviews';
import { SubmitFeedback, GetEmployerFeedback } from '../application/use-cases/ManageFeedback';
import { GetEmployerDashboardStats } from '../application/use-cases/GetEmployerDashboardStats';
import { TalentSearch } from '../application/use-cases/TalentSearch';
import { JobApplicationNotFoundError, UnauthorizedEmployerActionError } from '../domain/errors/EmployerErrors';

import { EmailService } from '../../../core/services/EmailService';
import prisma from '../../../core/config/db';

const empRepo = new PrismaEmployerProfileRepository();
const jobRepo = new PrismaJobRepository();
const emailService = new EmailService();
const appRepo = new PrismaJobApplicationRepository();
const feedbackRepo = new PrismaEmployerFeedbackRepository();
const interviewRepo = new PrismaInterviewRepository();
const analyticsRepo = new PrismaDashboardAnalyticsRepository();
const talentRepo = new PrismaTalentSearchRepository();

export class EmployerController {

  // Profile
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetEmployerProfile(empRepo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Employer profile retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  static async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = createEmployerProfileSchema.parse(req.body);
      const useCase = new CreateEmployerProfile(empRepo);
      const result = await useCase.execute(userId, data);
      return sendSuccess(res, 'Employer profile created successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = updateEmployerProfileSchema.parse(req.body);
      const useCase = new UpdateEmployerProfile(empRepo);
      const result = await useCase.execute(userId, data);
      return sendSuccess(res, 'Employer profile updated successfully.', result);
    } catch (err) { next(err); }
  }

  static async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new DeleteEmployerProfile(empRepo);
      await useCase.execute(userId);
      return sendSuccess(res, 'Employer profile deleted successfully.', null);
    } catch (err) { next(err); }
  }

  // Jobs
  static async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = jobSchema.parse(req.body);
      const useCase = new CreateJob(jobRepo, empRepo);
      const result = await useCase.execute(userId, data);
      return sendSuccess(res, 'Job created successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = jobSchema.parse(req.body);
      const useCase = new UpdateJob(jobRepo, empRepo);
      const result = await useCase.execute(userId, req.params.jobId, data);
      return sendSuccess(res, 'Job updated successfully.', result);
    } catch (err) { next(err); }
  }

  static async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new DeleteJob(jobRepo, empRepo);
      await useCase.execute(userId, req.params.jobId);
      return sendSuccess(res, 'Job deleted successfully.', null);
    } catch (err) { next(err); }
  }

  static async getMyJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer not found');
      const jobs = await jobRepo.findByEmployerId(employer.id);
      return sendSuccess(res, 'Fetched employer jobs.', jobs);
    } catch (err) { next(err); }
  }

  static async searchJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await jobRepo.search(req.query);
      return sendSuccess(res, 'Available jobs.', jobs);
    } catch (err) { next(err); }
  }

  static async publishJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new PublishJob(jobRepo, empRepo);
      const result = await useCase.execute(userId, req.params.jobId);
      return sendSuccess(res, 'Job published successfully.', result);
    } catch (err) { next(err); }
  }

  static async closeJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new CloseJob(jobRepo, empRepo);
      const result = await useCase.execute(userId, req.params.jobId);
      return sendSuccess(res, 'Job closed successfully.', result);
    } catch (err) { next(err); }
  }

  static async reopenJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { deadline } = req.body;
      if (!deadline) throw new Error('Deadline date is required.');
      const useCase = new ReopenJob(jobRepo, empRepo);
      const result = await useCase.execute(userId, req.params.jobId, new Date(deadline));
      return sendSuccess(res, 'Job reopened successfully.', result);
    } catch (err) { next(err); }
  }

  // Applications
  static async applyForJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      const file = (req as any).file;
      const resumeUrl = file ? `/uploads/resumes/${file.filename}` : null;
      const coverLetter = req.body.coverLetter;

      // Find the alumni profile for the logged in user
      const alumniProfile = await talentRepo.search({ minCgpa: 0 }); // Fetch all, we'll find by userId
      const matchedAlumni = (alumniProfile.data || []).find((a: any) => a.userId === userId);
      const alumniId = matchedAlumni ? matchedAlumni.id : userId; // Fallback to userId if not found

      const useCase = new ApplyForJob(appRepo, jobRepo);
      const result = await useCase.execute(req.params.jobId, alumniId, { resumeUrl, coverLetter });
      return sendSuccess(res, 'Application submitted successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer profile not found');
      const apps = await appRepo.findByEmployerId(employer.id);
      return sendSuccess(res, 'Job applications retrieved successfully.', apps);
    } catch (err) { next(err); }
  }

  static async getApplicationDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer profile not found');
      const app = await appRepo.findById(req.params.applicationId);
      if (!app) throw new JobApplicationNotFoundError();

      const job = await jobRepo.findById(app.jobId);
      if (!job || job.employerId !== employer.id) {
        throw new UnauthorizedEmployerActionError('You can only view applications for your own jobs.');
      }
      return sendSuccess(res, 'Application details retrieved successfully.', app);
    } catch (err) { next(err); }
  }

  static async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { status } = updateJobStatusSchema.parse(req.body);
      const useCase = new UpdateApplicationStatus(appRepo, jobRepo, empRepo);
      const result = await useCase.execute(userId, req.params.applicationId, status);
      return sendSuccess(res, 'Application status updated.', result);
    } catch (err) { next(err); }
  }

  // Dashboard Stats
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetEmployerDashboardStats(empRepo, analyticsRepo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Dashboard statistics retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  // Talent Search
  static async searchTalent(req: Request, res: Response, next: NextFunction) {
    try {
      const criteria = req.query as any;
      if (criteria.graduationYear) criteria.graduationYear = parseInt(criteria.graduationYear);
      if (criteria.minCgpa) criteria.minCgpa = parseFloat(criteria.minCgpa);
      if (criteria.page) criteria.page = parseInt(criteria.page);
      if (criteria.limit) criteria.limit = parseInt(criteria.limit);
      if (criteria.skills && typeof criteria.skills === 'string') {
        criteria.skills = criteria.skills.split(',').map((s: string) => s.trim());
      }

      const useCase = new TalentSearch(talentRepo);
      const result = await useCase.execute(criteria);
      return sendSuccess(res, 'Talent search results.', result);
    } catch (err) { next(err); }
  }

  static async getAlumnusProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await talentRepo.findById(req.params.alumniId);
      if (!result) throw new Error('Alumni profile not found');
      return sendSuccess(res, 'Alumni profile retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  static async messageAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer profile not found');

      const alumni = await talentRepo.findById(req.params.alumniId);
      if (!alumni || !alumni.email) throw new Error('Alumni profile or email not found');

      const { message } = req.body;
      if (!message) throw new Error('Message content is required');

      await emailService.sendGenericNotification(
        alumni.email,
        `New Message from ${employer.companyName}`,
        `You have received a new message from ${employer.companyName} via ASTU-AMS:\n\n"${message}"\n\nPlease reply to ${employer.hrContact} at ${employer.contactEmail || (employer as any).user?.email || 'their email'}.`
      );

      return sendSuccess(res, 'Message sent successfully to alumni.', null);
    } catch (err) { next(err); }
  }

  static async requestCv(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer profile not found');

      const alumni = await talentRepo.findById(req.params.alumniId);
      if (!alumni || !alumni.email) throw new Error('Alumni profile or email not found');

      await emailService.sendGenericNotification(
        alumni.email,
        `CV Request from ${employer.companyName}`,
        `${employer.companyName} is interested in your profile and has requested your CV. Please reach out to ${employer.hrContact} at ${employer.contactEmail || (employer as any).user?.email || 'their email'} to provide your updated CV.`
      );

      return sendSuccess(res, 'CV request sent successfully to alumni.', null);
    } catch (err) { next(err); }
  }

  // Interview Management
  static async scheduleInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = interviewSchema.parse(req.body);
      const useCase = new ScheduleInterview(interviewRepo, appRepo, jobRepo, empRepo);
      const result = await useCase.execute(userId, data);
      return sendSuccess(res, 'Interview scheduled successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async updateInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = interviewSchema.partial().parse(req.body);
      const useCase = new UpdateInterview(interviewRepo, appRepo, jobRepo, empRepo);
      const result = await useCase.execute(userId, req.params.interviewId, data);
      return sendSuccess(res, 'Interview updated successfully.', result);
    } catch (err) { next(err); }
  }

  static async cancelInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new CancelInterview(interviewRepo, appRepo, jobRepo, empRepo);
      await useCase.execute(userId, req.params.interviewId);
      return sendSuccess(res, 'Interview cancelled successfully.', null);
    } catch (err) { next(err); }
  }

  static async getEmployerInterviews(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetEmployerInterviews(interviewRepo, empRepo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Employer interviews retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  // Feedback Management
  static async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = employerFeedbackSchema.parse(req.body);
      const useCase = new SubmitFeedback(feedbackRepo, empRepo, appRepo, jobRepo);
      const result = await useCase.execute(userId, data);
      return sendSuccess(res, 'Feedback submitted successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async getMyFeedbacks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetEmployerFeedback(feedbackRepo, empRepo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Feedbacks retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  // ── Direct Messages ──────────────────────────────────────────────────

  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer profile not found');

      const messages = await prisma.directMessage.findMany({
        where: { employerId: employer.id },
        include: {
          alumni: { select: { id: true, fullName: true, email: true, profilePicture: true, department: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group by alumniId to build conversation threads
      const conversations: Record<string, any> = {};
      for (const msg of messages) {
        if (!conversations[msg.alumniId]) {
          conversations[msg.alumniId] = {
            alumniId: msg.alumniId,
            alumniName: msg.alumni.fullName || 'Alumni',
            alumniEmail: msg.alumni.email || '',
            alumniPhoto: msg.alumni.profilePicture || null,
            department: msg.alumni.department?.name || 'N/A',
            messages: [],
          };
        }
        conversations[msg.alumniId].messages.push({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
        });
      }

      return sendSuccess(res, 'Messages retrieved.', Object.values(conversations));
    } catch (err) { next(err); }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer profile not found');

      const { alumniId, text } = req.body;
      if (!alumniId || !text) throw new Error('alumniId and text are required');

      const message = await prisma.directMessage.create({
        data: {
          employerId: employer.id,
          alumniId,
          sender: 'EMPLOYER',
          text,
        },
      });

      // Find the Alumni's user ID so we can emit to their socket room
      const alumni = await prisma.alumniProfile.findUnique({ where: { id: alumniId } });
      if (alumni && alumni.userId) {
        const { SocketServer } = require('../../../infrastructure/websocket/SocketServer');
        SocketServer.emitToUser(alumni.userId, 'newMessage', message);
      }

      return sendSuccess(res, 'Message sent.', message, 201);
    } catch (err) { next(err); }
  }

  // ── Logo Upload ──────────────────────────────────────────────────────

  static async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const file = (req as any).file;
      if (!file) throw new Error('No file uploaded');

      const logoUrl = `/uploads/logos/${file.filename}`;
      await prisma.employerProfile.update({
        where: { userId },
        data: { logoUrl },
      });

      return sendSuccess(res, 'Logo uploaded successfully.', { logoUrl });
    } catch (err) { next(err); }
  }

  // ── Submit Feedback (with alumni name lookup) ───────────────────────

  static async submitFeedbackByName(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer profile not found');

      const { alumnusName, department, technicalSkills, communication, leadership, teamwork, problemSolving, comments } = req.body;

      // Look up alumni by name
      const alumni = await prisma.alumniProfile.findFirst({
        where: {
          fullName: { contains: alumnusName, mode: 'insensitive' },
        },
      });

      let alumniId: string;
      if (alumni) {
        alumniId = alumni.id;
      } else {
        // If no match, try to find the first alumni in the given department
        const deptAlumni = await prisma.alumniProfile.findFirst({
          where: { department: { name: { contains: department, mode: 'insensitive' } } },
        });
        if (!deptAlumni) throw new Error('Could not find matching alumni for feedback.');
        alumniId = deptAlumni.id;
      }

      const feedback = await prisma.employerFeedback.create({
        data: {
          employerId: employer.id,
          alumniId,
          technicalSkill: technicalSkills,
          communicationSkill: communication,
          leadershipSkill: leadership,
          teamworkSkill: teamwork,
          problemSolvingSkill: problemSolving,
          innovationSkill: Math.round((technicalSkills + problemSolving) / 2),
          feedbackText: comments,
          overallSatisfaction: Math.round((technicalSkills + communication + leadership + teamwork + problemSolving) / 5),
        },
        include: {
          alumni: { include: { department: true } },
        },
      });

      return sendSuccess(res, 'Feedback submitted successfully.', feedback, 201);
    } catch (err) { next(err); }
  }
}
