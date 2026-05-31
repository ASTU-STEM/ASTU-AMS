import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { updateEmployerProfileSchema, jobSchema, updateJobStatusSchema } from './employer.validation';

import { PrismaEmployerProfileRepository } from '../infrastructure/repositories/PrismaEmployerProfileRepository';
import { PrismaJobRepository } from '../infrastructure/repositories/PrismaJobRepository';
import { PrismaJobApplicationRepository } from '../infrastructure/repositories/PrismaJobApplicationRepository';

import { GetEmployerProfile, UpdateEmployerProfile } from '../application/use-cases/ManageEmployerProfile';
import { CreateJob, UpdateJob, DeleteJob } from '../application/use-cases/ManageJobs';
import { ApplyForJob, UpdateApplicationStatus } from '../application/use-cases/ManageJobApplications';

const empRepo = new PrismaEmployerProfileRepository();
const jobRepo = new PrismaJobRepository();
const appRepo = new PrismaJobApplicationRepository();

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

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = updateEmployerProfileSchema.parse(req.body);
      const useCase = new UpdateEmployerProfile(empRepo);
      const result = await useCase.execute(userId, data);
      return sendSuccess(res, 'Employer profile updated successfully.', result);
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
      const data = jobSchema.parse(req.body); // can use partial schema in reality
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

  // Applications
  static async applyForJob(req: Request, res: Response, next: NextFunction) {
    try {
      // Assuming alumni profile id is attached or we look it up via userId.
      // For simplicity, passing user id as alumni id in this mock
      const userId = (req as any).user?.userId; 
      
      const file = (req as any).file;
      const resumeUrl = file ? `/uploads/resumes/${file.filename}` : null;
      const coverLetter = req.body.coverLetter;

      const useCase = new ApplyForJob(appRepo, jobRepo);
      const result = await useCase.execute(req.params.jobId, userId, { resumeUrl, coverLetter });
      return sendSuccess(res, 'Application submitted successfully.', result, 201);
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
}
