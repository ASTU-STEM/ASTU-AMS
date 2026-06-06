import { IJobApplicationRepository } from '../ports/IJobApplicationRepository';
import { IJobRepository } from '../ports/IJobRepository';
import { IEmployerProfileRepository } from '../ports/IEmployerProfileRepository';
import { JobNotFoundError, UnauthorizedEmployerActionError, JobApplicationError } from '../../domain/errors/EmployerErrors';
import prisma from '../../../../core/config/db';
import { AnalyticsCacheService } from '../../../analytics/infrastructure/services/AnalyticsCacheService';

export class ApplyForJob {
  constructor(
    private readonly appRepo: IJobApplicationRepository,
    private readonly jobRepo: IJobRepository
  ) {}

  async execute(jobId: string, alumniId: string, data: any) {
    const job = await this.jobRepo.findById(jobId);
    if (!job || !job.isActive) {
      throw new JobNotFoundError();
    }

    const existingApplications = await this.appRepo.findByAlumniId(alumniId);
    if (existingApplications.some(app => app.jobId === jobId)) {
      throw new JobApplicationError('You have already applied for this job.');
    }

    const application = await this.appRepo.create({
      jobId,
      alumniId,
      status: 'PENDING',
      resumeUrl: data.resumeUrl || null,
      coverLetter: data.coverLetter || null,
    });

    return application;
  }
}

export class UpdateApplicationStatus {
  constructor(
    private readonly appRepo: IJobApplicationRepository,
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, applicationId: string, status: string) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new UnauthorizedEmployerActionError('Employer profile not found.');

    const application = await this.appRepo.findById(applicationId);
    if (!application) throw new JobApplicationError('Application not found.');

    const job = await this.jobRepo.findById(application.jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only update applications for your own jobs.');
    }

    if (status === 'HIRED') {
      if (application.status === 'HIRED') {
        throw new JobApplicationError('Application is already marked as HIRED.');
      }

      const now = new Date();
      const jobCreatedAt = (job as any).createdAt ? new Date((job as any).createdAt) : now;
      const timeToHireDays = Math.max(0, (now.getTime() - jobCreatedAt.getTime()) / (1000 * 60 * 60 * 24));

      // Retrieve candidate user/alumni info to get departmentId and userId for notification
      const candidateProfile = await prisma.alumniProfile.findUnique({
        where: { id: application.alumniId },
        include: { user: true }
      });

      if (!candidateProfile) {
        throw new Error('Candidate alumni profile not found.');
      }

      let parsedSalary: number | null = null;
      if (job.salary) {
        const salaryVal = parseFloat(job.salary);
        if (!isNaN(salaryVal)) {
          parsedSalary = salaryVal;
        }
      }

      // Execute atomic database updates using Prisma transaction
      await prisma.$transaction(async (tx: any) => {
        // 1. Update JobApplication
        await tx.jobApplication.update({
          where: { id: applicationId },
          data: {
            status: 'HIRED',
            hiredAt: now,
          },
        });

        // 2. Update AlumniProfile status (employmentStatus) to EMPLOYED, optionally save salary
        await tx.alumniProfile.update({
          where: { id: application.alumniId },
          data: {
            employmentStatus: 'EMPLOYED',
            salary: parsedSalary,
          },
        });

        // 3. Create HiringEvent
        await tx.hiringEvent.create({
          data: {
            applicationId,
            employerId: employer.id,
            alumniId: application.alumniId,
            departmentId: candidateProfile.departmentId,
            hiredAt: now,
            salary: parsedSalary,
            timeToHireDays,
          },
        });
      });

      // 4. Send Notification to candidate user
      if (candidateProfile.userId) {
        await prisma.notification.create({
          data: {
            userId: candidateProfile.userId,
            title: `Hired!`,
            content: `Congratulations! You have been hired by ${employer.companyName} for the role of ${job.title}.`,
          },
        });
      }

      // 5. Clear the analytics cache
      await AnalyticsCacheService.clearAll();

      const updatedApp = await this.appRepo.findById(applicationId);
      if (!updatedApp) throw new JobApplicationError('Failed to fetch updated application.');
      return updatedApp;
    }

    const updated = await this.appRepo.updateStatus(applicationId, status);
    return updated;
  }
}
