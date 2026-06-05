import { IInterviewRepository } from '../ports/IInterviewRepository';
import { IJobApplicationRepository } from '../ports/IJobApplicationRepository';
import { IJobRepository } from '../ports/IJobRepository';
import { IEmployerProfileRepository } from '../ports/IEmployerProfileRepository';
import {
  EmployerNotFoundError,
  JobNotFoundError,
  JobApplicationNotFoundError,
  UnauthorizedEmployerActionError,
  EmployerError
} from '../../domain/errors/EmployerErrors';
import prisma from '../../../../core/config/db';

export class ScheduleInterview {
  constructor(
    private readonly interviewRepo: IInterviewRepository,
    private readonly appRepo: IJobApplicationRepository,
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, data: any) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const application = await this.appRepo.findById(data.applicationId);
    if (!application) throw new JobApplicationNotFoundError();

    const job = await this.jobRepo.findById(application.jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only schedule interviews for applications to your own jobs.');
    }

    // Update the application status to INTERVIEW_SCHEDULED
    await this.appRepo.updateStatus(data.applicationId, 'INTERVIEW_SCHEDULED');

    // Create the interview
    const interview = await this.interviewRepo.create({
      applicationId: data.applicationId,
      interviewer: data.interviewer,
      interviewDate: new Date(data.interviewDate),
      interviewType: data.interviewType,
      meetingLink: data.meetingLink || null,
      location: data.location || null,
      notes: data.notes || null,
    });

    // Notify the candidate if user ID is present
    try {
      const candidateProfile = await prisma.alumniProfile.findUnique({
        where: { id: application.alumniId }
      });
      if (candidateProfile && candidateProfile.userId) {
        await prisma.notification.create({
          data: {
            userId: candidateProfile.userId,
            title: `Interview Scheduled`,
            content: `An interview has been scheduled for the position of ${job.title} on ${new Date(data.interviewDate).toLocaleString()}.`,
          },
        });
      }
    } catch (err) {
      // Ignore notification failures during testing / environment issues
    }

    return interview;
  }
}

export class UpdateInterview {
  constructor(
    private readonly interviewRepo: IInterviewRepository,
    private readonly appRepo: IJobApplicationRepository,
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, interviewId: string, data: any) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const interview = await this.interviewRepo.findById(interviewId);
    if (!interview) throw new EmployerError('Interview not found', 404);

    const application = await this.appRepo.findById(interview.applicationId);
    if (!application) throw new JobApplicationNotFoundError();

    const job = await this.jobRepo.findById(application.jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You do not have permission to modify this interview.');
    }

    const updated = await this.interviewRepo.update(interviewId, {
      ...data,
      interviewDate: data.interviewDate ? new Date(data.interviewDate) : undefined,
    });

    // Notify candidate of update
    try {
      const candidateProfile = await prisma.alumniProfile.findUnique({
        where: { id: application.alumniId }
      });
      if (candidateProfile && candidateProfile.userId) {
        await prisma.notification.create({
          data: {
            userId: candidateProfile.userId,
            title: `Interview Updated`,
            content: `The details for your interview for ${job.title} have been updated.`,
          },
        });
      }
    } catch (err) {}

    return updated;
  }
}

export class CancelInterview {
  constructor(
    private readonly interviewRepo: IInterviewRepository,
    private readonly appRepo: IJobApplicationRepository,
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, interviewId: string) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const interview = await this.interviewRepo.findById(interviewId);
    if (!interview) throw new EmployerError('Interview not found', 404);

    const application = await this.appRepo.findById(interview.applicationId);
    if (!application) throw new JobApplicationNotFoundError();

    const job = await this.jobRepo.findById(application.jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You do not have permission to cancel this interview.');
    }

    await this.interviewRepo.update(interviewId, { status: 'CANCELLED' });

    // Notify candidate of cancellation
    try {
      const candidateProfile = await prisma.alumniProfile.findUnique({
        where: { id: application.alumniId }
      });
      if (candidateProfile && candidateProfile.userId) {
        await prisma.notification.create({
          data: {
            userId: candidateProfile.userId,
            title: `Interview Cancelled`,
            content: `Your scheduled interview for ${job.title} has been cancelled.`,
          },
        });
      }
    } catch (err) {}
  }
}

export class GetEmployerInterviews {
  constructor(
    private readonly interviewRepo: IInterviewRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();
    return await this.interviewRepo.findByEmployerId(employer.id);
  }
}
