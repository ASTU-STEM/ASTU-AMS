import { IJobRepository } from '../ports/IJobRepository';
import { IEmployerProfileRepository } from '../ports/IEmployerProfileRepository';
import { EmployerNotFoundError, JobNotFoundError, UnauthorizedEmployerActionError } from '../../domain/errors/EmployerErrors';

export class CreateJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, data: any) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) {
      throw new EmployerNotFoundError();
    }
    const job = await this.jobRepo.create({
      employerId: employer.id,
      ...data,
      isActive: true,
      deadline: data.deadline ? new Date(data.deadline) : new Date(),
    });
    return job;
  }
}

export class UpdateJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, jobId: string, data: any) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only update your own jobs.');
    }

    const updated = await this.jobRepo.update(jobId, data);
    return updated;
  }
}

export class DeleteJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, jobId: string) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only delete your own jobs.');
    }

    await this.jobRepo.delete(jobId);
  }
}
