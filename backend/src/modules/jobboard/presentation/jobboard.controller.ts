import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { jobSearchQuerySchema, applyToJobSchema, paginationSchema } from './jobboard.validation';

// Infrastructure imports
import { PrismaJobBoardRepository } from '../infrastructure/repositories/PrismaJobBoardRepository';
import { PrismaSavedJobRepository } from '../infrastructure/repositories/PrismaSavedJobRepository';
import { PrismaJobViewRepository } from '../infrastructure/repositories/PrismaJobViewRepository';
import { PrismaJobRecommendationRepository } from '../infrastructure/repositories/PrismaJobRecommendationRepository';
import { PrismaAlumniLookupRepository } from '../infrastructure/repositories/PrismaAlumniLookupRepository';

// Use case imports
import { ListPublicJobs, GetJobDetail, SearchJobs } from '../application/use-cases/BrowseJobs';
import { ApplyToJob, WithdrawApplication, GetMyApplications } from '../application/use-cases/AlumniApplications';
import { SaveJob, UnsaveJob, GetSavedJobs } from '../application/use-cases/ManageSavedJobs';
import { GetRecommendedJobs } from '../application/use-cases/GetRecommendedJobs';
import { RecordJobView } from '../application/use-cases/TrackJobView';

// Notification integration
import { NotificationDispatcher } from '../../notifications/application/services/NotificationDispatcher';

// Instantiate repositories (stateless singletons)
const jobBoardRepo = new PrismaJobBoardRepository();
const savedJobRepo = new PrismaSavedJobRepository();
const jobViewRepo = new PrismaJobViewRepository();
const recommendationRepo = new PrismaJobRecommendationRepository();
const alumniRepo = new PrismaAlumniLookupRepository();
const dispatcher = new NotificationDispatcher();

export class JobBoardController {

  // ─── Public Endpoints (No Auth Required) ─────────────────────────────────

  /**
   * GET /api/jobs
   * Browse public jobs with search, filtering, pagination, and sorting.
   */
  static async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const params = jobSearchQuerySchema.parse(req.query);
      const useCase = new ListPublicJobs(jobBoardRepo);
      const result = await useCase.execute(params);
      return sendSuccess(res, 'Jobs retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  /**
   * GET /api/jobs/:id
   * Get full job detail with company info, skills, application count.
   */
  static async getJobDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const alumniId = (req as any).user?.userId
        ? (await alumniRepo.findByUserId((req as any).user.userId))?.id || null
        : null;
      const viewerIp = req.ip || req.socket.remoteAddress || null;

      const useCase = new GetJobDetail(jobBoardRepo, jobViewRepo);
      const result = await useCase.execute(req.params.id, alumniId, viewerIp);
      return sendSuccess(res, 'Job details retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  // ─── Authenticated Alumni Endpoints ──────────────────────────────────────

  /**
   * POST /api/jobs/:id/apply
   * Alumni applies to a job. Supports resume file upload.
   */
  static async applyToJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = applyToJobSchema.parse(req.body);

      // Handle file upload from multer
      const file = (req as any).file;
      const resumeUrl = file ? `/uploads/resumes/${file.filename}` : null;

      const useCase = new ApplyToJob(jobBoardRepo, alumniRepo);
      const result = await useCase.execute(userId, req.params.id, {
        resumeUrl,
        coverLetter: data.coverLetter || null,
      });

      // Notify employer about new application (fire-and-forget)
      try {
        const job = await jobBoardRepo.findJobById(req.params.id);
        const alumni = await alumniRepo.findByUserId(userId);
        if (job && alumni) {
          await dispatcher.notifyNewApplication(
            job.employerId,
            alumni.fullName,
            job.title
          );
        }
      } catch (_) { /* Notification failures should not break the apply flow */ }

      return sendSuccess(res, 'Application submitted successfully.', result, 201);
    } catch (err) { next(err); }
  }

  /**
   * DELETE /api/jobs/:id/application
   * Alumni withdraws their application.
   */
  static async withdrawApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new WithdrawApplication(alumniRepo);
      const result = await useCase.execute(userId, req.params.id);
      return sendSuccess(res, 'Application withdrawn successfully.', result);
    } catch (err) { next(err); }
  }

  /**
   * GET /api/jobs/my-applications
   * Alumni views their submitted applications.
   */
  static async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetMyApplications(alumniRepo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Applications retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  /**
   * POST /api/jobs/:id/save
   * Alumni saves (bookmarks) a job.
   */
  static async saveJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new SaveJob(savedJobRepo, alumniRepo, jobBoardRepo);
      const result = await useCase.execute(userId, req.params.id);
      return sendSuccess(res, 'Job saved successfully.', result, 201);
    } catch (err) { next(err); }
  }

  /**
   * DELETE /api/jobs/:id/save
   * Alumni removes a saved job.
   */
  static async unsaveJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new UnsaveJob(savedJobRepo, alumniRepo);
      await useCase.execute(userId, req.params.id);
      return sendSuccess(res, 'Job unsaved successfully.', null);
    } catch (err) { next(err); }
  }

  /**
   * GET /api/jobs/saved
   * Alumni retrieves their saved jobs.
   */
  static async getSavedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { page, limit } = paginationSchema.parse(req.query);
      const useCase = new GetSavedJobs(savedJobRepo, alumniRepo);
      const result = await useCase.execute(userId, page, limit);
      return sendSuccess(res, 'Saved jobs retrieved successfully.', result);
    } catch (err) { next(err); }
  }

  /**
   * GET /api/jobs/recommended
   * Alumni gets AI-powered job recommendations.
   */
  static async getRecommendedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      const useCase = new GetRecommendedJobs(recommendationRepo, alumniRepo);
      const result = await useCase.execute(userId, Math.min(limit, 50));
      return sendSuccess(res, 'Recommended jobs retrieved successfully.', result);
    } catch (err) { next(err); }
  }
}
