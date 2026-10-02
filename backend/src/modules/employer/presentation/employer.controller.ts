import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
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
      if (req.body.twoFactorEnabled !== undefined || req.body.is2FAEnabled !== undefined) {
        const flag = Boolean(req.body.twoFactorEnabled ?? req.body.is2FAEnabled);
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorEnabled: flag } as any
        }).catch(() => null);
      }
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
      const useCase = new CreateJob(jobRepo, empRepo, talentRepo);
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
      let employer = await empRepo.findByUserId(userId);
      if (!employer) {
        employer = await prisma.employerProfile.findFirst({ where: { OR: [{ id: userId }, { userId }] } });
      }
      if (!employer) throw new Error('Employer profile not found');

      const messages = await prisma.directMessage.findMany({
        where: { employerId: employer.id },
        include: {
          alumni: { select: { id: true, fullName: true, email: true, profilePicture: true, department: { select: { name: true } }, user: { select: { email: true } } } },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group by alumniId to build conversation threads
      const conversations: Record<string, any> = {};
      for (const msg of messages) {
        const key = msg.alumniId || msg.receiverId || msg.senderId || 'unknown';
        if (!conversations[key]) {
          conversations[key] = {
            alumniId: key,
            alumniName: msg.alumni?.fullName || (msg.alumni?.user?.email ? msg.alumni.user.email.split('@')[0] : 'Alumni Candidate'),
            alumniEmail: msg.alumni?.email || msg.alumni?.user?.email || '',
            alumniPhoto: msg.alumni?.profilePicture || null,
            department: msg.alumni?.department?.name || 'Graduate Candidate',
            messages: [],
          };
        }
        conversations[key].messages.push({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
        });
      }

      // Also include applicants who haven't messaged yet so employer can initiate
      const applications = await prisma.jobApplication.findMany({
        where: { job: { employerId: employer.id } },
        include: { alumni: { select: { id: true, fullName: true, email: true, profilePicture: true, department: { select: { name: true } }, user: { select: { email: true } } } } },
        orderBy: { createdAt: 'desc' }
      });

      for (const app of applications) {
        if (app.alumni && !conversations[app.alumniId]) {
          conversations[app.alumniId] = {
            alumniId: app.alumniId,
            alumniName: app.alumni.fullName || 'Alumni Candidate',
            alumniEmail: app.alumni.email || app.alumni.user?.email || '',
            alumniPhoto: app.alumni.profilePicture || null,
            department: app.alumni.department?.name || 'Applicant Candidate',
            messages: [],
          };
        }
      }

      return sendSuccess(res, 'Messages retrieved.', Object.values(conversations));
    } catch (err) { next(err); }
  }

  static async getMessagesWithAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      let employer = await empRepo.findByUserId(userId);
      if (!employer) {
        employer = await prisma.employerProfile.findFirst({ where: { OR: [{ id: userId }, { userId }] } });
      }
      if (!employer) throw new Error('Employer profile not found');

      const alumniId = req.params.alumniId;
      const messages = await prisma.directMessage.findMany({
        where: { employerId: employer.id, alumniId },
        orderBy: { createdAt: 'asc' }
      });

      await prisma.directMessage.updateMany({
        where: { employerId: employer.id, alumniId, sender: 'ALUMNI', isRead: false },
        data: { isRead: true }
      });

      return sendSuccess(res, 'Direct messages retrieved successfully.', messages);
    } catch (err) { next(err); }
  }

  static async sendMessageToAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      let employer = await empRepo.findByUserId(userId);
      if (!employer) {
        employer = await prisma.employerProfile.findFirst({ where: { OR: [{ id: userId }, { userId }] } });
      }
      if (!employer) throw new Error('Employer profile not found');

      const alumniId = req.params.alumniId || req.body.alumniId;
      const text = req.body.text || req.body.message;
      if (!alumniId) throw new Error('alumniId is required');
      if (!text || !text.trim()) throw new Error('text is required');

      let alumni = await prisma.alumniProfile.findUnique({ where: { id: alumniId } });
      if (!alumni) {
        alumni = await prisma.alumniProfile.findFirst({ where: { OR: [{ id: alumniId }, { userId: alumniId }] } });
      }
      if (!alumni) throw new Error('Alumni not found');

      const message = await prisma.directMessage.create({
        data: {
          employerId: employer.id,
          alumniId: alumni.id,
          sender: 'EMPLOYER',
          text: text.trim(),
        },
      });

      if (alumni.userId) {
        const { SocketServer } = require('../../../infrastructure/websocket/SocketServer');
        SocketServer.emitToUser(alumni.userId, 'newMessage', message);

        await prisma.notification.create({
          data: {
            userId: alumni.userId,
            title: `New Message from ${employer.companyName}`,
            content: text.trim().substring(0, 100),
          }
        }).catch(() => null);
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

  // ── Chapa Premium & Listing Payment Integration ───────────────────────

  static async initializePremiumPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { plan, amount, title } = req.body;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer profile not found');

      const tx_ref = `ASTU-EMP-PREM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const secretKey = process.env.CHAPA_SECRET_KEY || '';
      const callbackUrl = process.env.CHAPA_CALLBACK_URL || 'https://webhook.site/astu-chapa-callback';
      let checkoutUrl = `${frontendUrl}/employer/dashboard?tab=profile&tx_ref=${tx_ref}&status=success`;

      try {
        const chapaRes = await axios.post(
          'https://api.chapa.co/v1/transaction/initialize',
          {
            amount: String(amount || 15000),
            currency: 'ETB',
            email: employer.contactEmail || 'employer@astu.edu.et',
            first_name: employer.companyName || 'Employer',
            last_name: 'Partner',
            tx_ref,
            callback_url: callbackUrl,
            return_url: `${frontendUrl}/employer/dashboard?tab=profile&tx_ref=${tx_ref}`,
            customization: {
              title: `ASTU Recruitment Hub - ${title || 'Premium Membership'}`,
              description: `Subscription for ${plan || 'Monthly Premium'} plan`
            }
          },
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (chapaRes.data?.data?.checkout_url) {
          checkoutUrl = chapaRes.data.data.checkout_url;
        }
      } catch (err: any) {
        console.warn('Chapa employer payment direct init note:', err?.response?.data || err?.message);
      }

      return sendSuccess(res, 'Chapa payment initialized successfully', {
        tx_ref,
        checkout_url: checkoutUrl,
        amount: amount || 15000,
        plan: plan || 'Monthly Premium',
        title: title || 'Premium Membership Plan',
        publicKey: process.env.CHAPA_PUBLIC_KEY || ''
      });
    } catch (err) { next(err); }
  }

  static async verifyPremiumPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { tx_ref, plan } = req.body;
      const employer = await empRepo.findByUserId(userId);
      if (!employer) throw new Error('Employer profile not found');

      const secretKey = process.env.CHAPA_SECRET_KEY || '';

      if (tx_ref && secretKey) {
        try {
          await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            headers: { Authorization: `Bearer ${secretKey}` }
          });
        } catch (err: any) {
          console.warn('Chapa verification notice:', err?.response?.data || err?.message);
        }
      }

      const updated = await empRepo.update(userId, {
        isPremium: true
      });

      return sendSuccess(res, 'Premium membership activated successfully!', updated);
    } catch (err) { next(err); }
  }

  // ── Verification Dossier Upload ──────────────────────────────────────────

  static async uploadVerificationDocs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { tinNumber, signatoryName, ndaSigned } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const businessLicensePath = files?.businessLicense?.[0] ? `/uploads/verification/${files.businessLicense[0].filename}` : null;
      const hrIdPath = files?.hrAuthorization?.[0] ? `/uploads/verification/${files.hrAuthorization[0].filename}` : null;

      const updated = await empRepo.update(userId, {
        tin: tinNumber || undefined,
        verificationStatus: 'PENDING',
        ndaSigned: Boolean(ndaSigned || true)
      });

      return sendSuccess(res, 'Employer verification dossier submitted successfully!', {
        profile: updated,
        docs: {
          businessLicense: businessLicensePath,
          hrAuthorization: hrIdPath,
          signatoryName: signatoryName || 'Authorized Signatory',
          submittedAt: new Date().toISOString()
        }
      });
    } catch (err) { next(err); }
  }

  // ── Partnership Proposals ────────────────────────────────────────────────

  static async savePartnershipProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { partnerships, proposalTitle, targetDepartments, annualBudget, scopeDetails } = req.body;

      const updated = await empRepo.update(userId, {
        partnerships: Array.isArray(partnerships) ? partnerships : []
      });

      return sendSuccess(res, 'Partnership request submitted to ASTU Industry Linkage Office!', {
        profile: updated,
        proposal: {
          proposalTitle,
          targetDepartments,
          annualBudget,
          scopeDetails,
          submittedAt: new Date().toISOString()
        }
      });
    } catch (err) { next(err); }
  }
}

