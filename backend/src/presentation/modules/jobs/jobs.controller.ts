import { Request, Response, NextFunction } from 'express';
import prisma from '../../../infrastructure/config/db';
import {
  createJobSchema,
  applyJobSchema,
  updateApplicationStatusSchema,
  employerFeedbackSchema,
} from './jobs.validation';
import { sendSuccess, sendError } from '../../../shared/utils/response.utils';
import { Role } from '@prisma/client';

export class JobsController {
  /**
   * Post a new Job position.
   * Route: POST /api/jobs
   * Access: EMPLOYER
   */
  static async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = createJobSchema.parse(req.body);

      const employer = await prisma.employerProfile.findUnique({ where: { userId } });
      if (!employer) {
        return sendError(res, 'Employer profile not found', null, 404);
      }

      const job = await prisma.job.create({
        data: {
          employerId: employer.id,
          title: parsedData.title,
          description: parsedData.description,
          salary: parsedData.salary,
          deadline: parsedData.deadline,
          experienceRequired: parsedData.experienceRequired,
          skillsRequired: parsedData.skillsRequired,
          location: parsedData.location,
          employmentType: parsedData.employmentType,
        },
      });

      return sendSuccess(res, 'Job posted successfully', job, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update details of an existing Job.
   * Route: PUT /api/jobs/:id
   * Access: EMPLOYER
   */
  static async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const parsedData = createJobSchema.parse(req.body);

      const employer = await prisma.employerProfile.findUnique({ where: { userId } });
      if (!employer) {
        return sendError(res, 'Employer profile not found', null, 404);
      }

      const job = await prisma.job.findUnique({ where: { id } });
      if (!job || job.employerId !== employer.id) {
        return sendError(res, 'Job listing not found or unauthorized', null, 404);
      }

      const updated = await prisma.job.update({
        where: { id },
        data: {
          title: parsedData.title,
          description: parsedData.description,
          salary: parsedData.salary,
          deadline: parsedData.deadline,
          experienceRequired: parsedData.experienceRequired,
          skillsRequired: parsedData.skillsRequired,
          location: parsedData.location,
          employmentType: parsedData.employmentType,
        },
      });

      return sendSuccess(res, 'Job listing updated successfully', updated);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * List jobs with search query and filters.
   * Route: GET /api/jobs
   * Access: ALUMNI, ADMIN, DEPT_HEAD
   */
  static async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, type, location } = req.query;

      const whereClause: any = {
        isActive: true,
        deadline: { gte: new Date() },
      };

      if (search) {
        whereClause.OR = [
          { title: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (type) {
        whereClause.employmentType = String(type);
      }

      if (location) {
        whereClause.location = { contains: String(location), mode: 'insensitive' };
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          employer: {
            select: { companyName: true, logoUrl: true, location: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, 'Fetched job listings successfully', jobs);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Submit an application to a Job listing.
   * Route: POST /api/jobs/:id/apply
   * Access: ALUMNI
   */
  static async applyJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const parsedData = applyJobSchema.parse(req.body);

      const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      const job = await prisma.job.findUnique({ where: { id } });
      if (!job || !job.isActive || job.deadline < new Date()) {
        return sendError(res, 'Job listing is closed or inactive', null, 400);
      }

      // Check if already applied
      const existingApp = await prisma.jobApplication.findFirst({
        where: { jobId: id, alumniId: alumni.id },
      });
      if (existingApp) {
        return sendError(res, 'You have already applied to this job listing', null, 400);
      }

      let resumeUrl = alumni.resumeUrl;
      // If a new resume file is uploaded
      if (req.file) {
        resumeUrl = `/uploads/cvs/${req.file.filename}`;
      } else if (!parsedData.useProfileCv || !resumeUrl) {
        return sendError(res, 'Please upload a resume or set up a CV in your profile', null, 400);
      }

      const application = await prisma.jobApplication.create({
        data: {
          jobId: id,
          alumniId: alumni.id,
          coverLetter: parsedData.coverLetter,
          resumeUrl,
        },
      });

      return sendSuccess(res, 'Job application submitted successfully', application, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * View all applicants for a posted job.
   * Route: GET /api/jobs/:id/applicants
   * Access: EMPLOYER
   */
  static async viewApplicants(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const employer = await prisma.employerProfile.findUnique({ where: { userId } });
      if (!employer) {
        return sendError(res, 'Employer profile not found', null, 404);
      }

      const job = await prisma.job.findUnique({ where: { id } });
      if (!job || job.employerId !== employer.id) {
        return sendError(res, 'Job listing not found or unauthorized', null, 404);
      }

      const applicants = await prisma.jobApplication.findMany({
        where: { jobId: id },
        include: {
          alumni: {
            include: { department: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, 'Fetched job applications successfully', applicants);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update application evaluation status (Shortlist/Reject/Accept).
   * Route: PUT /api/jobs/applications/:applicationId
   * Access: EMPLOYER
   */
  static async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      const userId = (req as any).user?.userId;
      const parsedData = updateApplicationStatusSchema.parse(req.body);

      const employer = await prisma.employerProfile.findUnique({ where: { userId } });
      if (!employer) {
        return sendError(res, 'Employer profile not found', null, 404);
      }

      const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: { job: true, alumni: true },
      });

      if (!application || application.job.employerId !== employer.id) {
        return sendError(res, 'Application not found or unauthorized', null, 404);
      }

      const updated = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status: parsedData.status },
      });

      // Send System Notification to Alumni
      await prisma.notification.create({
        data: {
          userId: application.alumni.userId,
          title: `Application Update: ${application.job.title}`,
          content: `Your job application at ${employer.companyName} is now status: ${parsedData.status}.`,
        },
      });

      return sendSuccess(res, 'Application status updated.', updated);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Submit graduate competency rating feedback.
   * Route: POST /api/jobs/feedback
   * Access: EMPLOYER
   */
  static async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = employerFeedbackSchema.parse(req.body);

      const employer = await prisma.employerProfile.findUnique({ where: { userId } });
      if (!employer) {
        return sendError(res, 'Employer profile not found', null, 404);
      }

      // Check if alumni exists
      const alumni = await prisma.alumniProfile.findUnique({ where: { id: parsedData.alumniId } });
      if (!alumni) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      const feedback = await prisma.employerFeedback.create({
        data: {
          employerId: employer.id,
          alumniId: parsedData.alumniId,
          technicalSkill: parsedData.technicalSkill,
          communicationSkill: parsedData.communicationSkill,
          leadershipSkill: parsedData.leadershipSkill,
          teamworkSkill: parsedData.teamworkSkill,
          problemSolvingSkill: parsedData.problemSolvingSkill,
          innovationSkill: parsedData.innovationSkill,
          feedbackText: parsedData.feedbackText,
        },
      });

      return sendSuccess(res, 'Competency rating feedback submitted successfully.', feedback, 201);
    } catch (err: any) {
      next(err);
    }
  }
}
