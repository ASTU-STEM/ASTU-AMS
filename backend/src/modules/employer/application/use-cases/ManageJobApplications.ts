import { IJobApplicationRepository } from '../ports/IJobApplicationRepository';
import { IJobRepository } from '../ports/IJobRepository';
import { IEmployerProfileRepository } from '../ports/IEmployerProfileRepository';
import { JobNotFoundError, UnauthorizedEmployerActionError, JobApplicationError } from '../../domain/errors/EmployerErrors';
import prisma from '../../../../core/config/db';
import { AnalyticsCacheService } from '../../../analytics/infrastructure/services/AnalyticsCacheService';
import { EmailService } from '../../../../core/services/EmailService';

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

    // Retrieve candidate user/alumni info for email
    let candidateProfile = await prisma.alumniProfile.findUnique({
      where: { id: application.alumniId },
      include: { user: true }
    });
    if (!candidateProfile) {
      candidateProfile = await prisma.alumniProfile.findFirst({
        where: { OR: [{ id: application.alumniId }, { userId: application.alumniId }] },
        include: { user: true }
      });
    }

    const emailService = new EmailService();

    if (status === 'HIRED') {
      if (!candidateProfile) {
        throw new Error('Candidate alumni profile not found.');
      }
      if (application.status === 'HIRED') {
        throw new JobApplicationError('Application is already marked as HIRED.');
      }

      const now = new Date();
      const jobCreatedAt = (job as any).createdAt ? new Date((job as any).createdAt) : now;
      const timeToHireDays = Math.max(0, (now.getTime() - jobCreatedAt.getTime()) / (1000 * 60 * 60 * 24));

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

        // 2. Update AlumniProfile status
        await tx.alumniProfile.update({
          where: { id: candidateProfile.id },
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
            alumniId: candidateProfile.id,
            departmentId: candidateProfile.departmentId,
            hiredAt: now,
            salary: parsedSalary,
            timeToHireDays,
          },
        });
      });

      // 4. Send Notification and Email to candidate user
      if (candidateProfile.user?.email) {
        await prisma.notification.create({
          data: {
            userId: candidateProfile.userId as string,
            title: `Hired!`,
            content: `Congratulations! You have been hired by ${employer.companyName} for the role of ${job.title}.`,
          },
        });

        await emailService.sendGenericNotification(
          candidateProfile.user.email as string,
          `Application Update: You've been HIRED!`,
          `Congratulations! Your application for the position of "${job.title}" at ${employer.companyName} has resulted in a hire.`
        ).catch(err => console.error("Failed to send email", err));
      }

      // 5. Clear the analytics cache
      await AnalyticsCacheService.clearAll();

      const updatedApp = await this.appRepo.findById(applicationId);
      if (!updatedApp) throw new JobApplicationError('Failed to fetch updated application.');
      return updatedApp;
    }

    // For other status updates (e.g., Shortlisted, Rejected, Reviewed)
    const updated = await this.appRepo.updateStatus(applicationId, status);

    if (candidateProfile?.user?.email) {
      const subjectMap: Record<string, string> = {
        'SHORTLISTED': 'Application Update: You have been Shortlisted!',
        'REJECTED': 'Application Update regarding your recent submission',
        'REVIEWED': 'Application Update: Your profile is under review',
        'INTERVIEW_SCHEDULED': 'Application Update: Interview Scheduled'
      };
      
      const messageMap: Record<string, string> = {
        'SHORTLISTED': `Great news! Your application for "${job.title}" at ${employer.companyName} has been shortlisted. They will be in touch with you soon.`,
        'REJECTED': `Thank you for your interest in the "${job.title}" role at ${employer.companyName}. Unfortunately, they have decided to move forward with other candidates at this time.`,
        'REVIEWED': `Your application for "${job.title}" at ${employer.companyName} has been reviewed by their hiring team.`,
        'INTERVIEW_SCHEDULED': `Your application for "${job.title}" at ${employer.companyName} has progressed to the interview stage!`
      };

      const subject = subjectMap[status] || `Application Update: ${status}`;
      const message = messageMap[status] || `The status of your application for "${job.title}" at ${employer.companyName} has been updated to: ${status}.`;

      await prisma.notification.create({
        data: {
          userId: candidateProfile.userId as string,
          title: `Application ${status}`,
          content: message,
        },
      });

      await emailService.sendGenericNotification(
        candidateProfile.user.email as string,
        subject,
        message
      ).catch(err => console.error("Failed to send email", err));
    }

    return updated;
  }
}
