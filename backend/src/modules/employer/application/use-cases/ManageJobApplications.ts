import { IJobApplicationRepository } from '../ports/IJobApplicationRepository';
import { IJobRepository } from '../ports/IJobRepository';
import { IEmployerProfileRepository } from '../ports/IEmployerProfileRepository';
import { JobNotFoundError, UnauthorizedEmployerActionError, JobApplicationError } from '../../domain/errors/EmployerErrors';

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

    const updated = await this.appRepo.updateStatus(applicationId, status);
    return updated;
  }
}
