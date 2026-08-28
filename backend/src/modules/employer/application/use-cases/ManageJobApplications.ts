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

        // 2. Prepare preferences update for candidate placement box
        const existingPrefs = (candidateProfile.preferences as any) || {};
        const updatedPrefs = {
          ...existingPrefs,
          company: employer.companyName,
          currentRole: job.title,
        };

        // 3. Update AlumniProfile status to EMPLOYED and set company/role in preferences
        await tx.alumniProfile.update({
          where: { id: candidateProfile.id },
          data: {
            employmentStatus: 'EMPLOYED',
            salary: parsedSalary,
            preferences: updatedPrefs,
          },
        });

        // 4. Create WorkExperience record for alumni
        await tx.workExperience.create({
          data: {
            alumniId: candidateProfile.id,
            companyName: employer.companyName,
            position: job.title,
            industry: employer.industry || 'Technology',
            salaryRange: job.salary || (parsedSalary ? `${parsedSalary} ETB` : 'Competitive'),
            location: job.location || employer.location || 'Adama',
            isCurrent: true,
            startDate: now,
          },
        });

        // 5. Create HiringEvent for database analytics & tracking
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

      // 6. Send In-App Notification and Email to candidate
      if (candidateProfile.userId) {
        await prisma.notification.create({
          data: {
            userId: candidateProfile.userId as string,
            title: `🎉 Congratulations! You are Hired!`,
            content: `Congratulations! You have been hired by ${employer.companyName} for the position of "${job.title}". Your profile placement has been updated to Employed at ${employer.companyName}.`,
          },
        }).catch(err => console.error("Failed to create in-app notification", err));
      }

      if (candidateProfile.user?.email || candidateProfile.email) {
        const candidateEmail = (candidateProfile.user?.email || candidateProfile.email) as string;
        const candidateName = candidateProfile.fullName || 'Alumni Candidate';

        await emailService.sendGenericNotification(
          candidateEmail,
          `🎉 Congratulations! You have been HIRED at ${employer.companyName}!`,
          `Dear ${candidateName},\n\nWe are thrilled to inform you that your application for "${job.title}" at ${employer.companyName} has resulted in a HIRE!\n\nYour ASTU Alumni profile placement status has been updated to Employed at ${employer.companyName}.\n\nBest regards,\nASTU Career & Placement Center`
        ).catch(err => console.error("Failed to send candidate email", err));

        // Simulated SMS notification
        console.log(`[SMS Dispatch] Sent to candidate ${candidateProfile.phone || candidateName}: "Congratulations! You're hired at ${employer.companyName} for ${job.title}!"`);
      }

      // 7. Send Email to ASTU Admin users notifying about the new hiring event
      try {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { email: true }
        });
        const adminEmails = admins.map((a: any) => a.email).filter(Boolean);
        if (adminEmails.length === 0) adminEmails.push('admin@astu.edu.et');

        for (const adminEmail of adminEmails) {
          await emailService.sendGenericNotification(
            adminEmail,
            `ASTU Placement Alert: ${candidateProfile.fullName} Hired by ${employer.companyName}`,
            `ASTU Alumni Placement System Notification:\n\nAlumnus Candidate: ${candidateProfile.fullName}\nEmployer: ${employer.companyName}\nPosition: ${job.title}\nDate: ${now.toLocaleDateString()}\n\nThis placement event has been recorded in the database for accreditation & department tracer analytics.`
          ).catch(err => console.error("Failed to notify admin email", err));
        }
      } catch (adminErr) {
        console.error("Failed to process admin notification email", adminErr);
      }

      // 8. Clear the analytics cache
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
